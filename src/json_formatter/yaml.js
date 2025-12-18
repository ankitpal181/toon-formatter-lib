/**
 * YAML <-> JSON Converter (for JsonConverter)
 */

import yaml from 'js-yaml';
import { extractJsonFromString } from '../utils.js';

/**
 * Convert YAML string to JSON object (Sync)
 * @param {string} yamlString 
 * @returns {Object} JSON object
 */
export function yamlToJsonSync(yamlString) {
    if (!yamlString || typeof yamlString !== 'string') {
        throw new Error('Input must be a non-empty string');
    }
    const result = yaml.load(yamlString);
    if (result === undefined) return null;
    return result;
}

/**
 * Convert YAML string to JSON object (Async)
 * @param {string} yamlString 
 * @returns {Promise<Object>} JSON object
 */
export async function yamlToJson(yamlString) {
    return yamlToJsonSync(yamlString);
}


/**
 * Convert JSON object to YAML string (Sync)
 * @param {Object} jsonObject 
 * @returns {string} YAML string
 */
export function jsonToYamlSync(data) {
    if (typeof data === 'string') {
        let convertedText = data;
        let iterationCount = 0;
        const maxIterations = 100;
        let wasModified = false;

        const firstExtract = extractJsonFromString(data);
        if (firstExtract && firstExtract === data.trim()) {
            try {
                const obj = JSON.parse(firstExtract);
                return yaml.dump(obj);
            } catch (e) { }
        }

        while (iterationCount < maxIterations) {
            const jsonString = extractJsonFromString(convertedText);
            if (!jsonString) break;
            try {
                const jsonObject = JSON.parse(jsonString);
                const yamlOutput = yaml.dump(jsonObject).trim();
                convertedText = convertedText.replace(jsonString, yamlOutput);
                wasModified = true;
                iterationCount++;
            } catch (e) { break; }
        }

        if (wasModified) return convertedText;

        try {
            const obj = JSON.parse(data);
            return yaml.dump(obj);
        } catch (e) { return data; }
    }
    return yaml.dump(data);
}

/**
 * Convert JSON object to YAML string (Async)
 * @param {Object} jsonObject 
 * @returns {Promise<string>} YAML string
 */
export async function jsonToYaml(jsonObject) {
    return jsonToYamlSync(jsonObject);
}
