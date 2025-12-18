/**
 * XML <-> YAML Converter (for YamlConverter)
 */

import yaml from 'js-yaml';
import { encodeXmlReservedChars, extractXmlFromString, extractJsonFromString } from '../utils.js';
import { xmlToJsonSync, jsonToXmlSync } from '../json_formatter/xml.js';
import { jsonToYamlSync, yamlToJsonSync } from '../json_formatter/yaml.js';

// We can reuse the JSON-based intermediate conversion functions
// XML -> JSON -> YAML
// YAML -> JSON -> XML

/**
 * Convert XML string to YAML string (Sync)
 * Supports mixed text XML.
 * @param {string} xmlString 
 * @returns {string} YAML string
 */
export function xmlToYamlSync(xmlString) {
    if (!xmlString || typeof xmlString !== 'string') {
        throw new Error('Input must be a non-empty string');
    }

    let convertedText = xmlString;
    let iterationCount = 0;
    const maxIterations = 100;
    let wasModified = false;

    // Check if pure XML first
    const firstExtract = extractXmlFromString(xmlString);
    if (firstExtract === xmlString) {
        // Pure XML -> JSON -> YAML
        try {
            const json = xmlToJsonSync(xmlString);
            return yaml.dump(json);
        } catch (e) {
            return xmlString; // Fallback?
        }
    }

    // Mixed Text Loop
    while (iterationCount < maxIterations) {
        const xmlBlock = extractXmlFromString(convertedText);
        if (!xmlBlock) break;

        try {
            const jsonObject = xmlToJsonSync(xmlBlock); // handles parsing
            const yamlOutput = yaml.dump(jsonObject).trim();
            convertedText = convertedText.replace(xmlBlock, yamlOutput);
            wasModified = true;
            iterationCount++;
        } catch (e) {
            break;
        }
    }

    if (wasModified) return convertedText;

    // Fallback try strict
    try {
        const json = xmlToJsonSync(xmlString);
        return yaml.dump(json);
    } catch (e) {
        return xmlString;
    }
}

/**
 * Convert XML string to YAML string (Async)
 * @param {string} xmlString 
 * @returns {Promise<string>} YAML string
 */
export async function xmlToYaml(xmlString) {
    // Ensure DOMParser availability via xmlToJson wrapper if needed, 
    // but xmlToJsonSync in json_formatter/xml.js checks for it.
    // However, Node.js polyfill might be needed if not globally set?
    // xmlToJson (Async) in json_formatter/xml.js handles polyfill import.
    // We should probably rely on consistent async patterns.
    // But here we are wrapping Sync logic for mixed text.
    // Mixed text loop is synchronous.
    // For async mixed text, we'd need async loop?
    // Usually mixed text string manipulation is fast enough to be sync.
    return xmlToYamlSync(xmlString);
}


/**
 * Convert YAML string to XML string (Sync)
 * Note: Does not support mixed text YAML extraction (no extractYaml).
 * @param {string} yamlString 
 * @returns {string} XML string
 */
export function yamlToXmlSync(yamlString) {
    if (!yamlString || typeof yamlString !== 'string') {
        throw new Error('Input must be a non-empty string');
    }

    try {
        // YAML -> JSON
        const json = yamlToJsonSync(yamlString); // from json_formatter/yaml.js
        // JSON -> XML
        return jsonToXmlSync(json); // from json_formatter/xml.js
    } catch (e) {
        throw new Error(`YAML to XML conversion failed: ${e.message}`);
    }
}

/**
 * Convert YAML string to XML string (Async)
 * @param {string} yamlString 
 * @returns {Promise<string>} XML string
 */
export async function yamlToXml(yamlString) {
    return yamlToXmlSync(yamlString);
}
