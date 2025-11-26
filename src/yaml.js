/**
 * YAML ↔ TOON Converter
 */

import yaml from 'js-yaml';
import { jsonToToon, toonToJson } from './json.js';

/**
 * Converts YAML to TOON format
 * @param {string} yamlString - YAML formatted string
 * @returns {string} TOON formatted string
 * @throws {Error} If YAML is invalid
 */
export function yamlToToon(yamlString) {
    if (!yamlString || typeof yamlString !== 'string') {
        throw new Error('Input must be a non-empty string');
    }

    const jsonObject = yaml.load(yamlString);

    if (typeof jsonObject !== "object" || jsonObject === null) {
        throw new Error("YAML parsing failed — cannot convert.");
    }

    return jsonToToon(jsonObject);
}

/**
 * Converts TOON to YAML format
 * @param {string} toonString - TOON formatted string
 * @returns {string} YAML formatted string
 * @throws {Error} If TOON is invalid
 */
export function toonToYaml(toonString) {
    if (!toonString || typeof toonString !== 'string') {
        throw new Error('Input must be a non-empty string');
    }

    const jsonObject = toonToJson(toonString);
    return yaml.dump(jsonObject);
}
