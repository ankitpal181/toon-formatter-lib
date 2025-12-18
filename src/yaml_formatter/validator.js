/**
 * YAML Validator (for YamlConverter)
 */

import yaml from 'js-yaml';

/**
 * Validate YAML string (Sync)
 * @param {string} yamlString 
 * @returns {boolean} True if valid, throws error if invalid
 */
export function validateYamlStringSync(yamlString) {
    if (typeof yamlString !== 'string') {
        throw new Error("Input must be a string.");
    }
    try {
        yaml.load(yamlString);
        return true;
    } catch (e) {
        throw new Error(`Invalid YAML: ${e.message}`);
    }
}

/**
 * Validate YAML string (Async)
 * @param {string} yamlString 
 * @returns {Promise<boolean>} True if valid
 */
export async function validateYamlString(yamlString) {
    return validateYamlStringSync(yamlString);
}
