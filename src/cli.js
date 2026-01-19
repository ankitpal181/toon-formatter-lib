#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import {
    ToonConverter,
    JsonConverter,
    YamlConverter,
    XmlConverter,
    CsvConverter,
    Encryptor
} from './index.js';

// Polyfill DOMParser for Node.js environments (required for XML conversion)
if (typeof DOMParser === 'undefined') {
    try {
        const { DOMParser: NodeDOMParser } = await import('xmldom');
        global.DOMParser = NodeDOMParser;
    } catch (e) {
        // xmldom might not be available or other import error
    }
}

async function readStdin() {
    return new Promise((resolve, reject) => {
        let data = '';
        process.stdin.setEncoding('utf8');
        process.stdin.on('readable', () => {
            let chunk;
            while ((chunk = process.stdin.read()) !== null) {
                data += chunk;
            }
        });
        process.stdin.on('end', () => resolve(data));
        process.stdin.on('error', reject);
    });
}

const showHelp = () => {
    console.log(`
TOON Formatter CLI - Convert between TOON, JSON, YAML, XML, and CSV.

Usage:
  toon-formatter --from <format> --to <format> [options]
  toon-formatter --validate <format> [options]

Options:
  --from <format>       Source format (json, yaml, xml, csv, toon)
  --to <format>         Target format (json, yaml, xml, csv, toon)
  -i, --input <file>    Input file path (default: stdin)
  -o, --output <file>   Output file path (default: stdout)
  --async               Use asynchronous converters
  -m, --mode <mode>     Conversion mode (no_encryption, middleware, ingestion, export)
  -k, --key <key>       Encryption key
  -a, --algo <algo>     Encryption algorithm (aes-256-gcm, xor, base64)
  --no-parse            Return raw strings for applicable conversions
  --validate <format>   Validate the given format
  -h, --help            Show this help message

Examples:
  echo '{"name": "Alice"}' | toon-formatter --from json --to toon
  toon-formatter --from xml --to json -i data.xml -o data.json
  toon-formatter --validate toon -i data.toon
`);
};

function parseArgs(args) {
    const config = {
        from: null,
        to: null,
        input: null,
        output: null,
        isAsync: false,
        mode: 'no_encryption',
        key: null,
        algo: 'aes-256-gcm',
        noParse: false,
        validate: null
    };

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        switch (arg) {
            case '--from':
                config.from = args[++i];
                break;
            case '--to':
                config.to = args[++i];
                break;
            case '-i':
            case '--input':
                config.input = args[++i];
                break;
            case '-o':
            case '--output':
                config.output = args[++i];
                break;
            case '--async':
                config.isAsync = true;
                break;
            case '-m':
            case '--mode':
                config.mode = args[++i];
                break;
            case '-k':
            case '--key':
                config.key = args[++i];
                break;
            case '-a':
            case '--algo':
                config.algo = args[++i];
                break;
            case '--no-parse':
                config.noParse = true;
                break;
            case '--validate':
                config.validate = args[++i];
                break;
            case '-h':
            case '--help':
                showHelp();
                process.exit(0);
            default:
                if (arg.startsWith('-')) {
                    console.error(`Unknown option: ${arg}`);
                    process.exit(1);
                }
        }
    }

    return config;
}

async function run() {
    const args = process.argv.slice(2);
    if (args.length === 0) {
        showHelp();
        process.exit(0);
    }

    const config = parseArgs(args);

    if (!config.validate && (!config.from || !config.to)) {
        console.error("Error: --from and --to are required unless using --validate");
        process.exit(1);
    }

    let inputData = '';
    if (config.input) {
        try {
            inputData = fs.readFileSync(path.resolve(config.input), 'utf8');
        } catch (err) {
            console.error(`Error reading input file: ${err.message}`);
            process.exit(1);
        }
    } else {
        inputData = await readStdin();
    }

    if (!inputData && !config.validate) {
        console.error("Error: No input data provided");
        process.exit(1);
    }

    let encryptor = null;
    if (config.key || config.algo === 'base64') {
        try {
            encryptor = new Encryptor(config.key, config.algo);
        } catch (err) {
            console.error(`Error initializing encryptor: ${err.message}`);
            process.exit(1);
        }
    }

    try {
        let result;
        if (config.validate) {
            result = ToonConverter.validate(inputData);
            if (config.output) {
                fs.writeFileSync(path.resolve(config.output), JSON.stringify(result, null, 2));
            } else {
                console.log(JSON.stringify(result, null, 2));
            }
            return;
        }

        const options = {
            conversionMode: config.mode,
            returnJson: !config.noParse
        };

        result = await handleConversion(config, inputData, encryptor);

        if (typeof result === 'object' && result !== null) {
            result = JSON.stringify(result, null, 2);
        } else if (typeof result === 'string' && config.to === 'json' && !config.noParse) {
            try {
                const parsed = JSON.parse(result);
                result = JSON.stringify(parsed, null, 2);
            } catch (e) {
                // Not a valid JSON string, leave as is
            }
        }

        if (config.output) {
            fs.writeFileSync(path.resolve(config.output), result);
        } else {
            process.stdout.write(result + '\n');
        }

    } catch (err) {
        console.error(`Conversion error: ${err.message}`);
        process.exit(1);
    }
}

async function handleConversion(config, data, encryptor) {
    const { from, to, isAsync, mode, noParse } = config;

    // Use instance if encryption is involved
    const toonConv = new ToonConverter(encryptor);
    const jsonConv = new JsonConverter(encryptor);
    const yamlConv = new YamlConverter(encryptor);
    const xmlConv = new XmlConverter(encryptor);
    const csvConv = new CsvConverter(encryptor);

    const options = { conversionMode: mode, returnJson: !noParse };

    if (from === 'toon') {
        if (to === 'json') return isAsync ? toonConv.toJsonAsync(data, options) : toonConv.toJson(data, options);
        if (to === 'yaml') return isAsync ? toonConv.toYamlAsync(data, options) : toonConv.toYaml(data, options);
        if (to === 'xml') return isAsync ? toonConv.toXmlAsync(data, options) : toonConv.toXml(data, options);
        if (to === 'csv') return isAsync ? toonConv.toCsvAsync(data, options) : toonConv.toCsv(data, options);
    }

    if (to === 'toon') {
        if (from === 'json') return isAsync ? toonConv.fromJsonAsync(data, options) : toonConv.fromJson(data, options);
        if (from === 'yaml') return isAsync ? toonConv.fromYamlAsync(data, options) : toonConv.fromYaml(data, options);
        if (from === 'xml') return isAsync ? toonConv.fromXmlAsync(data, options) : toonConv.fromXml(data, options);
        if (from === 'csv') return isAsync ? toonConv.fromCsvAsync(data, options) : toonConv.fromCsv(data, options);
    }

    // Unified Converters for direct translation
    if (from === 'json') {
        if (to === 'xml') return isAsync ? jsonConv.toXmlAsync(data, options) : jsonConv.toXml(data, options);
        if (to === 'csv') return isAsync ? jsonConv.toCsvAsync(data, options) : jsonConv.toCsv(data, options);
        if (to === 'yaml') return isAsync ? jsonConv.toYamlAsync(data, options) : jsonConv.toYaml(data, options);
    }

    if (from === 'yaml') {
        if (to === 'json') return isAsync ? yamlConv.toJsonAsync(data, options) : yamlConv.toJson(data, options);
        if (to === 'xml') return isAsync ? yamlConv.toXmlAsync(data, options) : yamlConv.toXml(data, options);
        if (to === 'csv') return isAsync ? yamlConv.toCsvAsync(data, options) : yamlConv.toCsv(data, options);
    }

    if (from === 'xml') {
        if (to === 'json') return isAsync ? xmlConv.toJsonAsync(data, options) : xmlConv.toJson(data, options);
        if (to === 'csv') return isAsync ? xmlConv.toCsvAsync(data, options) : xmlConv.toCsv(data, options);
        if (to === 'yaml') return isAsync ? xmlConv.toYamlAsync(data, options) : xmlConv.toYaml(data, options);
    }

    if (from === 'csv') {
        if (to === 'json') return isAsync ? csvConv.toJsonAsync(data, options) : csvConv.toJson(data, options);
        if (to === 'xml') return isAsync ? csvConv.toXmlAsync(data, options) : csvConv.toXml(data, options);
        if (to === 'yaml') return isAsync ? csvConv.toYamlAsync(data, options) : csvConv.toYaml(data, options);
    }

    throw new Error(`Unsupported conversion from ${from} to ${to}`);
}

run();
