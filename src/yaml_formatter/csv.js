/**
 * CSV <-> YAML Converter (for YamlConverter)
 */

import yaml from 'js-yaml';
import { extractCsvFromString } from '../utils.js';
import { csvToJsonSync, jsonToCsvSync } from '../json_formatter/csv.js';
import { jsonToYamlSync, yamlToJsonSync } from '../json_formatter/yaml.js';

/**
 * Convert CSV string to YAML string (Sync)
 * Supports mixed text CSV.
 * @param {string} csvString 
 * @returns {string} YAML string
 */
export function csvToYamlSync(csvString) {
    if (!csvString || typeof csvString !== 'string') {
        throw new Error('Input must be a non-empty string');
    }

    let convertedText = csvString;
    let iterationCount = 0;
    const maxIterations = 100;
    let wasModified = false;

    // Check pure CSV
    const firstExtract = extractCsvFromString(csvString);
    if (firstExtract === csvString.trim()) {
        try {
            const json = csvToJsonSync(csvString);
            return yaml.dump(json);
        } catch (e) {
            return csvString;
        }
    }

    // Mixed Loop
    while (iterationCount < maxIterations) {
        const csvBlock = extractCsvFromString(convertedText);
        if (!csvBlock) break;

        try {
            const jsonObject = csvToJsonSync(csvBlock);
            const yamlOutput = yaml.dump(jsonObject).trim();
            convertedText = convertedText.replace(csvBlock, yamlOutput);
            wasModified = true;
            iterationCount++;
        } catch (e) {
            break;
        }
    }

    if (wasModified) return convertedText;

    try {
        const json = csvToJsonSync(csvString);
        return yaml.dump(json);
    } catch (e) {
        return csvString;
    }
}

/**
 * Convert CSV string to YAML string (Async)
 * @param {string} csvString 
 * @returns {Promise<string>} YAML string
 */
export async function csvToYaml(csvString) {
    return csvToYamlSync(csvString);
}


/**
 * Convert YAML string to CSV string (Sync)
 * Note: Does not support mixed text YAML extraction.
 * @param {string} yamlString 
 * @returns {string} CSV string
 */
export function yamlToCsvSync(yamlString) {
    if (!yamlString || typeof yamlString !== 'string') {
        throw new Error('Input must be a non-empty string');
    }

    try {
        // YAML -> JSON
        const json = yamlToJsonSync(yamlString);
        // JSON -> CSV
        return jsonToCsvSync(json);
    } catch (e) {
        throw new Error(`YAML to CSV conversion failed: ${e.message}`);
    }
}

/**
 * Convert YAML string to CSV string (Async)
 * @param {string} yamlString 
 * @returns {Promise<string>} CSV string
 */
export async function yamlToCsv(yamlString) {
    return yamlToCsvSync(yamlString);
}
