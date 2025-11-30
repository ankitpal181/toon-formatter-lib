/**
 * YAML ↔ TOON Converter
 */

import yaml from 'js-yaml';
import { jsonToToonSync, toonToJsonSync } from './json.js';


/**
 * Converts YAML (or mixed text with YAML) to TOON format (Synchronous)
 * @param {string} yamlString - YAML formatted string or mixed text
 * @returns {string} TOON formatted string
 * @throws {Error} If YAML is invalid
 */
export function yamlToToonSync(yamlString) {
    if (!yamlString || typeof yamlString !== 'string') {
        throw new Error('Input must be a non-empty string');
    }

    const jsonObject = yaml.load(yamlString);

    if (typeof jsonObject !== "object" || jsonObject === null) {
        throw new Error("YAML parsing failed — cannot convert.");
    }

    return jsonToToonSync(jsonObject);
}

/**
 * Converts YAML (or mixed text with YAML) to TOON format (Async)
 * @param {string} yamlString - YAML formatted string or mixed text
 * @returns {Promise<string>} TOON formatted string
 */
export async function yamlToToon(yamlString) {
    return yamlToToonSync(yamlString);
}

/**
 * Converts TOON to YAML format (Synchronous)
 * @param {string} toonString - TOON formatted string
 * @returns {string} YAML formatted string
 * @throws {Error} If TOON is invalid
 */
export function toonToYamlSync(toonString) {
    if (!toonString || typeof toonString !== 'string') {
        throw new Error('Input must be a non-empty string');
    }

    const jsonObject = toonToJsonSync(toonString);
    return yaml.dump(jsonObject);
}

/**
 * Converts TOON to YAML format (Async)
 * @param {string} toonString - TOON formatted string
 * @returns {Promise<string>} YAML formatted string
 */
export async function toonToYaml(toonString) {
    return toonToYamlSync(toonString);
}
