/**
 * TOON Converter Library
 * 
 * A lightweight library to convert between TOON (Token-Oriented Object Notation)
 * and popular data formats (JSON, YAML, XML, CSV).
 * 
 * Reduce LLM token costs by up to 40% using TOON format.
 * 
 * @module toon-formatter
 */

import { jsonToToonSync, jsonToToon, toonToJsonSync, toonToJson } from './json.js';
import { yamlToToonSync, yamlToToon, toonToYamlSync, toonToYaml } from './yaml.js';
import { xmlToToonSync, xmlToToon, toonToXmlSync, toonToXml } from './xml.js';
import { csvToToonSync, csvToToon, toonToCsvSync, toonToCsv } from './csv.js';
import { validateToonString, validateToonStringSync } from './validator.js';
import {
    encodeXmlReservedChars,
    splitByDelimiter,
    parseValue,
    formatValue,
    extractJsonFromString,
    extractXmlFromString,
    extractCsvFromString
} from './utils.js';

// Exports
export {
    jsonToToonSync, jsonToToon, toonToJsonSync, toonToJson,
    yamlToToonSync, yamlToToon, toonToYamlSync, toonToYaml,
    xmlToToonSync, xmlToToon, toonToXmlSync, toonToXml,
    csvToToonSync, csvToToon, toonToCsvSync, toonToCsv,
    validateToonString, validateToonStringSync,
    encodeXmlReservedChars, splitByDelimiter, parseValue, formatValue,
    extractJsonFromString, extractXmlFromString, extractCsvFromString
};

/**
 * Main converter class for easy usage
 */
export class ToonConverter {
    /**
     * Convert JSON to TOON (Sync)
     * @param {*} jsonData - JSON data (object, array, or primitive)
     * @returns {string} TOON formatted string
     */
    static fromJson(jsonData) {
        return jsonToToonSync(jsonData);
    }

    /**
     * Convert JSON to TOON (Async)
     * @param {*} jsonData - JSON data
     * @returns {Promise<string>} TOON formatted string
     */
    static async fromJsonAsync(jsonData) {
        return jsonToToon(jsonData);
    }

    /**
     * Convert TOON to JSON (Sync)
     * @param {string} toonString - TOON formatted string
     * @returns {*} Parsed JSON data
     */
    static toJson(toonString) {
        return toonToJsonSync(toonString);
    }

    /**
     * Convert TOON to JSON (Async)
     * @param {string} toonString - TOON formatted string
     * @returns {Promise<*>} Parsed JSON data
     */
    static async toJsonAsync(toonString) {
        return toonToJson(toonString);
    }

    /**
     * Convert YAML to TOON (Sync)
     * @param {string} yamlString - YAML formatted string
     * @returns {string} TOON formatted string
     */
    static fromYaml(yamlString) {
        return yamlToToonSync(yamlString);
    }

    /**
     * Convert YAML to TOON (Async)
     * @param {string} yamlString - YAML formatted string
     * @returns {Promise<string>} TOON formatted string
     */
    static async fromYamlAsync(yamlString) {
        return yamlToToon(yamlString);
    }

    /**
     * Convert TOON to YAML (Sync)
     * @param {string} toonString - TOON formatted string
     * @returns {string} YAML formatted string
     */
    static toYaml(toonString) {
        return toonToYamlSync(toonString);
    }

    /**
     * Convert TOON to YAML (Async)
     * @param {string} toonString - TOON formatted string
     * @returns {Promise<string>} YAML formatted string
     */
    static async toYamlAsync(toonString) {
        return toonToYaml(toonString);
    }

    /**
     * Convert XML to TOON (Sync)
     * @param {string} xmlString - XML formatted string
     * @returns {string} TOON formatted string
     */
    static fromXml(xmlString) {
        return xmlToToonSync(xmlString);
    }

    /**
     * Convert XML to TOON (Async)
     * @param {string} xmlString - XML formatted string
     * @returns {Promise<string>} TOON formatted string
     */
    static async fromXmlAsync(xmlString) {
        return xmlToToon(xmlString);
    }

    /**
     * Convert TOON to XML (Sync)
     * @param {string} toonString - TOON formatted string
     * @returns {string} XML formatted string
     */
    static toXml(toonString) {
        return toonToXmlSync(toonString);
    }

    /**
     * Convert TOON to XML (Async)
     * @param {string} toonString - TOON formatted string
     * @returns {Promise<string>} XML formatted string
     */
    static async toXmlAsync(toonString) {
        return toonToXml(toonString);
    }

    /**
     * Convert CSV to TOON (Async)
     * @param {string} csvString - CSV formatted string
     * @returns {Promise<string>} TOON formatted string
     */
    static async fromCsvAsync(csvString) {
        return csvToToon(csvString);
    }

    /**
     * Convert CSV to TOON (Sync)
     * @param {string} csvString - CSV formatted string
     * @returns {string} TOON formatted string
     */
    static fromCsv(csvString) {
        return csvToToonSync(csvString);
    }

    /**
     * Convert TOON to CSV (Sync)
     * @param {string} toonString - TOON formatted string
     * @returns {string} CSV formatted string
     */
    static toCsv(toonString) {
        return toonToCsvSync(toonString);
    }

    /**
     * Convert TOON to CSV (Async)
     * @param {string} toonString - TOON formatted string
     * @returns {Promise<string>} CSV formatted string
     */
    static async toCsvAsync(toonString) {
        return toonToCsv(toonString);
    }

    /**
     * Validate a TOON string
     * @param {string} toonString - TOON formatted string
     * @returns {{isValid: boolean, error: string|null}} Validation result
     */
    static validate(toonString) {
        return validateToonStringSync(toonString);
    }

    /**
     * Validate a TOON string (Async)
     * @param {string} toonString - TOON formatted string
     * @returns {{isValid: boolean, error: string|null}} Validation result
     */
    static async validateAsync(toonString) {
        return validateToonString(toonString);
    }
}

export default ToonConverter;
