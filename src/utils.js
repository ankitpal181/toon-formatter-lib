/**
 * Utility functions for TOON conversion
 */

/**
 * Encodes XML reserved characters to prevent parsing errors
 * @param {string} rawXmlString - Raw XML string
 * @returns {string} Encoded XML string
 */
export function encodeXmlReservedChars(rawXmlString) {
    if (typeof rawXmlString !== 'string') {
        return '';
    }

    let encodedString = rawXmlString;
    const ampersandRegex = /&(?!#|\w+;)/g;
    encodedString = encodedString.replace(ampersandRegex, '&amp;');
    return encodedString;
}

/**
 * Splits a string by delimiter while respecting quoted strings
 * @param {string} text - Text to split
 * @param {string} delimiter - Delimiter character
 * @returns {string[]} Array of split values
 */
export function splitByDelimiter(text, delimiter) {
    const result = [];
    let current = '';
    let inQuote = false;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (char === '"' && (i === 0 || text[i - 1] !== '\\')) {
            inQuote = !inQuote;
        }
        if (char === delimiter && !inQuote) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current);
    return result;
}

/**
 * Parses a value string into its correct JavaScript type
 * @param {string} val - Value string to parse
 * @returns {*} Parsed value (string, number, boolean, or null)
 */
export function parseValue(val) {
    val = val.trim();
    if (val === 'true') return true;
    if (val === 'false') return false;
    if (val === 'null') return null;
    if (val === '') return ""; // Empty string

    // Number check: simplified, can be improved
    if (!isNaN(Number(val)) && val !== '' && !val.startsWith('0') && val !== '0') return Number(val);
    if (val === '0') return 0;
    if (val.match(/^-?0\./)) return Number(val); // 0.5, -0.5

    // String unquoting
    if (val.startsWith('"') && val.endsWith('"')) {
        // Remove surrounding quotes and unescape internal quotes
        return val.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
    }
    return val;
}

/**
 * Formats a value according to TOON rules
 * @param {*} v - Value to format
 * @returns {string} Formatted value
 */
export function formatValue(v) {
    if (v === null) return "null";
    if (typeof v === "string") return `"${v.replace(/"/g, '\\"')}"`;
    return v; // number, boolean
}

/**
 * Extracts JSON from mixed text
 * @param {string} text - Text containing JSON
 * @returns {string|null} Extracted JSON string or null
 */
export function extractJsonFromString(text) {
    if (!text || typeof text !== 'string') return null;

    let startIndex = -1;

    // Find first potential start
    for (let i = 0; i < text.length; i++) {
        if (text[i] === '{' || text[i] === '[') {
            // Ignore if preceded by non-whitespace (e.g. key[2])
            if (i > 0 && /\S/.test(text[i - 1])) {
                continue;
            }
            startIndex = i;
            break;
        }
    }

    if (startIndex === -1) return null;

    let balance = 0;
    let inQuote = false;
    let escape = false;

    for (let i = startIndex; i < text.length; i++) {
        const char = text[i];

        if (escape) {
            escape = false;
            continue;
        }

        if (char === '\\') {
            escape = true;
            continue;
        }

        if (char === '"') {
            inQuote = !inQuote;
            continue;
        }

        if (!inQuote) {
            if (char === '{' || char === '[') {
                balance++;
            } else if (char === '}' || char === ']') {
                balance--;
            }

            if (balance === 0) {
                // Potential end
                const candidate = text.substring(startIndex, i + 1);
                try {
                    JSON.parse(candidate);
                    return candidate;
                } catch (e) {
                    // Continue scanning if parse fails
                }
            }
        }
    }

    return null;
}

/**
 * Extracts YAML from mixed text
 * @param {string} text - Text containing YAML
 * @returns {string|null} Extracted YAML string or null
 */
export function extractYamlFromString(text) {
    if (!text || typeof text !== 'string') return null;
    const lines = text.split('\n');
    let startLineIndex = -1;
    let baseIndent = -1;

    // Regex for YAML start: "key:" or "- item"
    const keyRegex = /^(\s*)([\w\-\s"]+:\s*.*| -\s+.*)$/;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.trim() === '' || line.trim().startsWith('#')) continue;

        const match = line.match(keyRegex);
        if (match) {
            startLineIndex = i;
            baseIndent = match[1].length;
            break;
        }
    }

    if (startLineIndex === -1) return null;

    const resultLines = [];
    for (let i = startLineIndex; i < lines.length; i++) {
        const line = lines[i];
        if (line.trim() === '') {
            resultLines.push(line);
            continue;
        }

        const currentIndent = line.search(/\S|$/);

        if (currentIndent < baseIndent) {
            break; // End of block (less indented)
        }

        if (currentIndent === baseIndent) {
            // At base level, must continue to match structure
            if (!line.match(keyRegex)) {
                break; // Stop if we hit a non-key/non-item line at base level
            }
        }

        resultLines.push(line);
    }

    return resultLines.join('\n').trim();
}

/**
 * Extracts XML from mixed text
 * @param {string} text - Text containing XML
 * @returns {string|null} Extracted XML string or null
 */
export function extractXmlFromString(text) {
    if (!text || typeof text !== 'string') return null;

    // Find first start tag
    const startTagRegex = /<([a-zA-Z0-9_:-]+)(?:\s[^>]*)?\>/;
    const match = text.match(startTagRegex);

    if (!match) return null;

    const startIndex = match.index;
    const rootTagName = match[1];

    const fullMatch = match[0];
    if (fullMatch.endsWith('/>')) {
        return fullMatch;
    }

    let balance = 0;

    const tagRegex = /<\/?([a-zA-Z0-9_:-]+)(?:\s[^>]*)?\/?\>/g;
    tagRegex.lastIndex = startIndex;

    let matchTag;
    while ((matchTag = tagRegex.exec(text)) !== null) {
        const fullTag = matchTag[0];
        const tagName = matchTag[1];

        if (tagName !== rootTagName) continue;

        if (fullTag.startsWith('</')) {
            balance--;
        } else if (!fullTag.endsWith('/>')) {
            balance++;
        }

        if (balance === 0) {
            return text.substring(startIndex, matchTag.index + fullTag.length);
        }
    }

    return null;
}

/**
 * Extracts CSV from mixed text
 * @param {string} text - Text containing CSV
 * @returns {string|null} Extracted CSV string or null
 */
export function extractCsvFromString(text) {
    if (!text || typeof text !== 'string') return null;

    const lines = text.split('\n');
    let startLineIndex = -1;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const commaCount = (line.match(/,/g) || []).length;
        if (commaCount > 0) {
            startLineIndex = i;
            break;
        }
    }

    if (startLineIndex === -1) return null;

    const resultLines = [];

    for (let i = startLineIndex; i < lines.length; i++) {
        const line = lines[i];
        if (line.trim() === '') continue;

        const commaCount = (line.match(/,/g) || []).length;
        if (commaCount === 0) {
            break;
        }
        resultLines.push(line);
    }

    return resultLines.join('\n').trim();
}
