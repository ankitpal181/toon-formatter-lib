/**
 * TOON Converter Library
 * 
 * A lightweight library to convert between TOON (Token-Oriented Object Notation)
 * and popular data formats (JSON, YAML, XML, CSV).
 * 
 * Reduce LLM token costs by up to 40% using TOON format.
 * 
 * @module toon-converter
 */

import { jsonToToon, toonToJson } from './json.js';
import { yamlToToon, toonToYaml } from './yaml.js';
import { xmlToToon, toonToXml } from './xml.js';
import { csvToToon, csvToToonSync, toonToCsv } from './csv.js';
import { validateToonString } from './validator.js';
import { encodeXmlReservedChars, splitByDelimiter, parseValue, formatValue } from './utils.js';

// Exports
export {
    jsonToToon, toonToJson,
    yamlToToon, toonToYaml,
    xmlToToon, toonToXml,
    csvToToon, csvToToonSync, toonToCsv,
    validateToonString,
    encodeXmlReservedChars, splitByDelimiter, parseValue, formatValue
};

/**
 * Main converter class for easy usage
 */
export class ToonConverter {
    /**
     * Convert JSON to TOON
     * @param {*} jsonData - JSON data (object, array, or primitive)
     * @returns {string} TOON formatted string
     */
    static fromJson(jsonData) {
        return jsonToToon(jsonData);
    }

    /**
     * Convert TOON to JSON
     * @param {string} toonString - TOON formatted string
     * @returns {*} Parsed JSON data
     */
    static toJson(toonString) {
        return toonToJson(toonString);
    }

    /**
     * Convert YAML to TOON
     * @param {string} yamlString - YAML formatted string
     * @returns {string} TOON formatted string
     */
    static fromYaml(yamlString) {
        return yamlToToon(yamlString);
    }

    /**
     * Convert TOON to YAML
     * @param {string} toonString - TOON formatted string
     * @returns {string} YAML formatted string
     */
    static toYaml(toonString) {
        return toonToYaml(toonString);
    }

    /**
     * Convert XML to TOON (Async)
     * @param {string} xmlString - XML formatted string
     * @returns {Promise<string>} TOON formatted string
     */
    static async fromXml(xmlString) {
        return xmlToToon(xmlString);
    }

    /**
     * Convert TOON to XML
     * @param {string} toonString - TOON formatted string
     * @returns {string} XML formatted string
     */
    static toXml(toonString) {
        return toonToXml(toonString);
    }

    /**
     * Convert CSV to TOON (Async)
     * @param {string} csvString - CSV formatted string
     * @returns {Promise<string>} TOON formatted string
     */
    static async fromCsv(csvString) {
        return csvToToon(csvString);
    }

    /**
     * Convert CSV to TOON (Sync)
     * @param {string} csvString - CSV formatted string
     * @returns {string} TOON formatted string
     */
    static fromCsvSync(csvString) {
        return csvToToonSync(csvString);
    }

    /**
     * Convert TOON to CSV
     * @param {string} toonString - TOON formatted string
     * @returns {string} CSV formatted string
     */
    static toCsv(toonString) {
        return toonToCsv(toonString);
    }

    /**
     * Validate a TOON string
     * @param {string} toonString - TOON formatted string
     * @returns {{isValid: boolean, error: string|null}} Validation result
     */
    static validate(toonString) {
        return validateToonString(toonString);
    }
}

export default ToonConverter;
