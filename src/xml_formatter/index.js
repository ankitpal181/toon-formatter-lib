/**
 * XmlConverter Class
 */

import { toonToXml, toonToXmlSync, xmlToToon, xmlToToonSync } from '../xml.js';
import { jsonToXml, jsonToXmlSync, xmlToJson, xmlToJsonSync } from '../json_formatter/xml.js';
import { yamlToXml, yamlToXmlSync, xmlToYaml, xmlToYamlSync } from '../yaml_formatter/xml.js';
import { csvToXml, csvToXmlSync, xmlToCsv, xmlToCsvSync } from './csv.js';
import { validateXmlString, validateXmlStringSync } from './validator.js';

export class XmlConverter {
    /**
     * Creates an XmlConverter instance
     * @param {Object} [encryptor=null] - Optional Encryptor instance for encryption support
     */
    constructor(encryptor = null) {
        this.encryptor = encryptor;
    }

    // --- Helper Methods for Encryption ---

    /**
     * Applies encryption logic based on conversion mode (synchronous)
     * @private
     * @param {Function} fn - The converter function to call
     * @param {*} data - Data to convert
     * @param {string} mode - Conversion mode: 'no_encryption', 'middleware', 'ingestion', 'export'
     * @returns {*} Converted (and possibly encrypted) data
     */
    _convertWithEncryption(fn, data, mode) {
        if (!this.encryptor || mode === 'no_encryption') {
            return fn(data);
        }

        switch (mode) {
            case 'middleware':
                const decrypted = this.encryptor.decrypt(data);
                const result = fn(decrypted);
                return this.encryptor.encrypt(result);
            case 'ingestion':
                const dec = this.encryptor.decrypt(data);
                return fn(dec);
            case 'export':
                const res = fn(data);
                return this.encryptor.encrypt(res);
            default:
                return fn(data);
        }
    }

    async _convertWithEncryptionAsync(fn, data, mode) {
        if (!this.encryptor || mode === 'no_encryption') {
            return await fn(data);
        }

        switch (mode) {
            case 'middleware':
                const decrypted = this.encryptor.decrypt(data);
                const result = await fn(decrypted);
                return this.encryptor.encrypt(result);
            case 'ingestion':
                const dec = this.encryptor.decrypt(data);
                return await fn(dec);
            case 'export':
                const res = await fn(data);
                return this.encryptor.encrypt(res);
            default:
                return await fn(data);
        }
    }

    // --- TOON Conversions ---

    /**
     * Convert TOON string to XML (Sync)
     * @param {string} toonString - TOON formatted string
     * @param {Object} [options={}] - Conversion options
     * @param {string} [options.conversionMode='no_encryption'] - Encryption mode
     * @returns {string} XML formatted string
     */
    fromToon(toonString, options = {}) {
        const { conversionMode = 'no_encryption' } = options;
        return this._convertWithEncryption(
            (data) => toonToXmlSync(data),
            toonString,
            conversionMode
        );
    }

    /**
     * Convert TOON string to XML (Async)
     * @param {string} toonString - TOON formatted string
     * @param {Object} [options={}] - Conversion options
     * @param {string} [options.conversionMode='no_encryption'] - Encryption mode
     * @returns {Promise<string>} XML formatted string
     */
    async fromToonAsync(toonString, options = {}) {
        const { conversionMode = 'no_encryption' } = options;
        return this._convertWithEncryptionAsync(
            async (data) => toonToXml(data),
            toonString,
            conversionMode
        );
    }

    /**
     * Convert XML to TOON string (Sync)
     * @param {string} xmlString - XML formatted string (supports mixed text)
     * @param {Object} [options={}] - Conversion options
     * @param {string} [options.conversionMode='no_encryption'] - Encryption mode
     * @returns {string} TOON formatted string
     */
    toToon(xmlString, options = {}) {
        const { conversionMode = 'no_encryption' } = options;
        return this._convertWithEncryption(
            (data) => xmlToToonSync(data),
            xmlString,
            conversionMode
        );
    }

    /**
     * Convert XML to TOON string (Async)
     * @param {string} xmlString - XML formatted string (supports mixed text)
     * @param {Object} [options={}] - Conversion options
     * @param {string} [options.conversionMode='no_encryption'] - Encryption mode
     * @returns {Promise<string>} TOON formatted string
     */
    async toToonAsync(xmlString, options = {}) {
        const { conversionMode = 'no_encryption' } = options;
        return this._convertWithEncryptionAsync(
            async (data) => xmlToToon(data),
            xmlString,
            conversionMode
        );
    }

    // --- JSON Conversions ---

    /**
     * Convert JSON to XML (Sync)
     * @param {Object|string} jsonData - JSON data or string with embedded JSON
     * @param {Object} [options={}] - Conversion options
     * @param {string} [options.conversionMode='no_encryption'] - Encryption mode
     * @returns {string} XML formatted string
     */
    fromJson(jsonData, options = {}) {
        const { conversionMode = 'no_encryption' } = options;
        return this._convertWithEncryption(
            (data) => jsonToXmlSync(data),
            jsonData,
            conversionMode
        );
    }

    /**
     * Convert JSON to XML (Async)
     * @param {Object|string} jsonData - JSON data or string with embedded JSON
     * @param {Object} [options={}] - Conversion options
     * @param {string} [options.conversionMode='no_encryption'] - Encryption mode
     * @returns {Promise<string>} XML formatted string
     */
    async fromJsonAsync(jsonData, options = {}) {
        const { conversionMode = 'no_encryption' } = options;
        return this._convertWithEncryptionAsync(
            async (data) => jsonToXml(data),
            jsonData,
            conversionMode
        );
    }

    /**
     * Convert XML to JSON (Sync)
     * @param {string} xmlString - XML formatted string (supports mixed text)
     * @param {Object} [options={}] - Conversion options
     * @param {string} [options.conversionMode='no_encryption'] - Encryption mode
     * @returns {Object|string} JSON result
     */
    toJson(xmlString, options = {}) {
        const { conversionMode = 'no_encryption' } = options;
        return this._convertWithEncryption(
            (data) => xmlToJsonSync(data),
            xmlString,
            conversionMode
        );
    }

    /**
     * Convert XML to JSON (Async)
     * @param {string} xmlString - XML formatted string (supports mixed text)
     * @param {Object} [options={}] - Conversion options
     * @param {string} [options.conversionMode='no_encryption'] - Encryption mode
     * @returns {Promise<Object|string>} JSON result
     */
    async toJsonAsync(xmlString, options = {}) {
        const { conversionMode = 'no_encryption' } = options;
        return this._convertWithEncryptionAsync(
            async (data) => xmlToJson(data),
            xmlString,
            conversionMode
        );
    }

    // --- YAML Conversions ---

    /**
     * Convert YAML to XML (Sync)
     * @param {string} yamlString - YAML formatted string
     * @param {Object} [options={}] - Conversion options
     * @param {string} [options.conversionMode='no_encryption'] - Encryption mode
     * @returns {string} XML formatted string
     */
    fromYaml(yamlString, options = {}) {
        const { conversionMode = 'no_encryption' } = options;
        return this._convertWithEncryption(
            (data) => yamlToXmlSync(data),
            yamlString,
            conversionMode
        );
    }

    async fromYamlAsync(yamlString, options = {}) {
        const { conversionMode = 'no_encryption' } = options;
        return this._convertWithEncryptionAsync(
            async (data) => yamlToXml(data),
            yamlString,
            conversionMode
        );
    }

    /**
     * Convert XML to YAML (Sync)
     * @param {string} xmlString - XML formatted string (supports mixed text)
     * @param {Object} [options={}] - Conversion options
     * @param {string} [options.conversionMode='no_encryption'] - Encryption mode
     * @returns {string} YAML formatted string
     */
    toYaml(xmlString, options = {}) {
        const { conversionMode = 'no_encryption' } = options;
        return this._convertWithEncryption(
            (data) => xmlToYamlSync(data),
            xmlString,
            conversionMode
        );
    }

    async toYamlAsync(xmlString, options = {}) {
        const { conversionMode = 'no_encryption' } = options;
        return this._convertWithEncryptionAsync(
            async (data) => xmlToYaml(data),
            xmlString,
            conversionMode
        );
    }

    // --- CSV Conversions ---

    /**
     * Convert CSV to XML (Sync)
     * @param {string} csvString - CSV formatted string (supports mixed text)
     * @param {Object} [options={}] - Conversion options
     * @param {string} [options.conversionMode='no_encryption'] - Encryption mode
     * @returns {string} XML formatted string
     */
    fromCsv(csvString, options = {}) {
        const { conversionMode = 'no_encryption' } = options;
        return this._convertWithEncryption(
            (data) => csvToXmlSync(data),
            csvString,
            conversionMode
        );
    }

    async fromCsvAsync(csvString, options = {}) {
        const { conversionMode = 'no_encryption' } = options;
        return this._convertWithEncryptionAsync(
            async (data) => csvToXml(data),
            csvString,
            conversionMode
        );
    }

    /**
     * Convert XML to CSV (Sync)
     * @param {string} xmlString - XML formatted string (supports mixed text)
     * @param {Object} [options={}] - Conversion options
     * @param {string} [options.conversionMode='no_encryption'] - Encryption mode
     * @returns {string} CSV formatted string
     */
    toCsv(xmlString, options = {}) {
        const { conversionMode = 'no_encryption' } = options;
        return this._convertWithEncryption(
            (data) => xmlToCsvSync(data),
            xmlString,
            conversionMode
        );
    }

    async toCsvAsync(xmlString, options = {}) {
        const { conversionMode = 'no_encryption' } = options;
        return this._convertWithEncryptionAsync(
            async (data) => xmlToCsv(data),
            xmlString,
            conversionMode
        );
    }

    // --- Validation ---

    /**
     * Validate XML string (Sync)
     * @param {string} xmlString - XML string to validate
     * @returns {boolean} True if valid
     */
    validate(xmlString) {
        return validateXmlStringSync(xmlString);
    }

    async validateAsync(xmlString) {
        return validateXmlString(xmlString);
    }

    // ========================================
    // Static Methods (Backward Compatibility)
    // ========================================

    /**
     * Convert TOON string to XML (Sync)
     * @param {string} toonString - TOON formatted string
     * @returns {string} XML formatted string
     */
    static fromToon(toonString) {
        return toonToXmlSync(toonString);
    }

    /**
     * Convert TOON string to XML (Async)
     * @param {string} toonString - TOON formatted string
     * @returns {Promise<string>} XML formatted string
     */
    static async fromToonAsync(toonString) {
        return toonToXml(toonString);
    }

    /**
     * Convert XML to TOON string (Sync)
     * @param {string} xmlString - XML formatted string
     * @returns {string} TOON formatted string
     */
    static toToon(xmlString) {
        return xmlToToonSync(xmlString);
    }

    /**
     * Convert XML to TOON string (Async)
     * @param {string} xmlString - XML formatted string
     * @returns {Promise<string>} TOON formatted string
     */
    static async toToonAsync(xmlString) {
        return xmlToToon(xmlString);
    }

    /**
     * Convert JSON to XML string (Sync)
     * @param {Object|string} jsonData - JSON data or string with embedded JSON
     * @returns {string} XML formatted string
     */
    static fromJson(jsonData) {
        return jsonToXmlSync(jsonData);
    }

    /**
     * Convert JSON to XML string (Async)
     * @param {Object|string} jsonData - JSON data or string with embedded JSON
     * @returns {Promise<string>} XML formatted string
     */
    static async fromJsonAsync(jsonData) {
        return jsonToXml(jsonData);
    }

    /**
     * Convert XML to JSON (Sync)
     * @param {string} xmlString - XML formatted string
     * @returns {Object|string} JSON result
     */
    static toJson(xmlString) {
        return xmlToJsonSync(xmlString);
    }

    /**
     * Convert XML to JSON (Async)
     * @param {string} xmlString - XML formatted string
     * @returns {Promise<Object|string>} JSON result
     */
    static async toJsonAsync(xmlString) {
        return xmlToJson(xmlString);
    }

    /**
     * Convert YAML to XML string (Sync)
     * @param {string} yamlString - YAML formatted string
     * @returns {string} XML formatted string
     */
    static fromYaml(yamlString) {
        return yamlToXmlSync(yamlString);
    }

    /**
     * Convert YAML to XML string (Async)
     * @param {string} yamlString - YAML formatted string
     * @returns {Promise<string>} XML formatted string
     */
    static async fromYamlAsync(yamlString) {
        return yamlToXml(yamlString);
    }

    /**
     * Convert XML to YAML string (Sync)
     * @param {string} xmlString - XML formatted string
     * @returns {string} YAML formatted string
     */
    static toYaml(xmlString) {
        return xmlToYamlSync(xmlString);
    }

    /**
     * Convert XML to YAML string (Async)
     * @param {string} xmlString - XML formatted string
     * @returns {Promise<string>} YAML formatted string
     */
    static async toYamlAsync(xmlString) {
        return xmlToYaml(xmlString);
    }

    /**
     * Convert CSV to XML string (Sync)
     * @param {string} csvString - CSV formatted string
     * @returns {string} XML formatted string
     */
    static fromCsv(csvString) {
        return csvToXmlSync(csvString);
    }

    /**
     * Convert CSV to XML string (Async)
     * @param {string} csvString - CSV formatted string
     * @returns {Promise<string>} XML formatted string
     */
    static async fromCsvAsync(csvString) {
        return csvToXml(csvString);
    }

    /**
     * Convert XML to CSV string (Sync)
     * @param {string} xmlString - XML formatted string
     * @returns {string} CSV formatted string
     */
    static toCsv(xmlString) {
        return xmlToCsvSync(xmlString);
    }

    /**
     * Convert XML to CSV string (Async)
     * @param {string} xmlString - XML formatted string
     * @returns {Promise<string>} CSV formatted string
     */
    static async toCsvAsync(xmlString) {
        return xmlToCsv(xmlString);
    }

    /**
     * Validate XML string
     * @param {string} xmlString - XML string to validate
     * @returns {boolean} True if valid
     */
    static validate(xmlString) {
        return validateXmlStringSync(xmlString);
    }

    /**
     * Validate XML string (Async)
     * @param {string} xmlString - XML string to validate
     * @returns {Promise<boolean>} True if valid
     */
    static async validateAsync(xmlString) {
        return validateXmlString(xmlString);
    }
}
