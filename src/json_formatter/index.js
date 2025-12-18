/**
 * JsonConverter Class
 */

import { toonToJson, toonToJsonSync, jsonToToon, jsonToToonSync } from '../json.js';
import { yamlToJson, yamlToJsonSync, jsonToYaml, jsonToYamlSync } from './yaml.js';
import { xmlToJson, xmlToJsonSync, jsonToXml, jsonToXmlSync } from './xml.js';
import { csvToJson, csvToJsonSync, jsonToCsv, jsonToCsvSync } from './csv.js';
import { validateJsonString, validateJsonStringSync } from './validator.js';

export class JsonConverter {
    /**
     * Creates a JsonConverter instance
     * @param {Object} [encryptor=null] - Optional Encryptor instance for encryption support
     */
    constructor(encryptor = null) {
        this.encryptor = encryptor;
    }

    // --- Helper Methods for Encryption ---

    _convertWithEncryption(fn, data, mode) {
        if (!this.encryptor || mode === 'no_encryption') {
            return fn(data);
        }

        switch (mode) {
            case 'middleware': // Decrypt -> Convert -> Encrypt
                // Input is encrypted
                const decrypted = this.encryptor.decrypt(data);
                const result = fn(decrypted);
                return this.encryptor.encrypt(result);
            case 'ingestion': // Decrypt -> Convert
                // Input is encrypted
                const dec = this.encryptor.decrypt(data);
                return fn(dec);
            case 'export': // Convert -> Encrypt
                // Input is plain
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
     * Convert TOON string to JSON (Sync)
     * @param {string} toonString - TOON formatted string
     * @param {Object} [options={}] - Conversion options
     * @param {string} [options.conversionMode='no_encryption'] - Encryption mode: 'no_encryption', 'middleware', 'ingestion', 'export'
     * @param {boolean} [options.returnJson=false] - If true, returns JSON string; if false, returns object
     * @returns {Object|string} JSON object or string
     */
    fromToon(toonString, options = {}) {
        const { conversionMode = 'no_encryption', returnJson = false } = options;
        return this._convertWithEncryption(
            (data) => toonToJsonSync(data, returnJson),
            toonString,
            conversionMode
        );
    }

    /**
     * Convert TOON string to JSON (Async)
     * @param {string} toonString - TOON formatted string
     * @param {Object} [options={}] - Conversion options
     * @param {string} [options.conversionMode='no_encryption'] - Encryption mode
     * @param {boolean} [options.returnJson=false] - If true, returns JSON string; if false, returns object
     * @returns {Promise<Object|string>} JSON object or string
     */
    async fromToonAsync(toonString, options = {}) {
        const { conversionMode = 'no_encryption', returnJson = false } = options;
        return this._convertWithEncryptionAsync(
            async (data) => toonToJson(data, returnJson),
            toonString,
            conversionMode
        );
    }

    /**
     * Convert JSON to TOON string (Sync)
     * @param {Object|string} jsonData - JSON data or string with embedded JSON
     * @param {Object} [options={}] - Conversion options
     * @param {string} [options.conversionMode='no_encryption'] - Encryption mode
     * @returns {string} TOON formatted string
     */
    toToon(jsonData, options = {}) {
        const { conversionMode = 'no_encryption' } = options;
        return this._convertWithEncryption(
            (data) => jsonToToonSync(data),
            jsonData,
            conversionMode
        );
    }

    /**
     * Convert JSON to TOON string (Async)
     * @param {Object|string} jsonData - JSON data or string with embedded JSON
     * @param {Object} [options={}] - Conversion options
     * @param {string} [options.conversionMode='no_encryption'] - Encryption mode
     * @returns {Promise<string>} TOON formatted string
     */
    async toToonAsync(jsonData, options = {}) {
        const { conversionMode = 'no_encryption' } = options;
        return this._convertWithEncryptionAsync(
            async (data) => jsonToToon(data),
            jsonData,
            conversionMode
        );
    }

    // --- YAML Conversions ---

    /**
     * Convert YAML string to JSON (Sync)
     * @param {string} yamlString - YAML formatted string
     * @param {Object} [options={}] - Conversion options
     * @param {string} [options.conversionMode='no_encryption'] - Encryption mode
     * @param {boolean} [options.returnJson=false] - If true, returns JSON string; if false, returns object
     * @returns {Object|string} JSON result
     */
    fromYaml(yamlString, options = {}) {
        const { conversionMode = 'no_encryption', returnJson = false } = options;
        return this._convertWithEncryption(
            (data) => yamlToJsonSync(data, returnJson),
            yamlString,
            conversionMode
        );
    }

    /**
     * Convert YAML string to JSON (Async)
     * @param {string} yamlString - YAML formatted string
     * @param {Object} [options={}] - Conversion options
     * @param {string} [options.conversionMode='no_encryption'] - Encryption mode
     * @param {boolean} [options.returnJson=false] - If true, returns JSON string; if false, returns object
     * @returns {Promise<Object|string>} JSON result
     */
    async fromYamlAsync(yamlString, options = {}) {
        const { conversionMode = 'no_encryption', returnJson = false } = options;
        return this._convertWithEncryptionAsync(
            async (data) => yamlToJson(data, returnJson),
            yamlString,
            conversionMode
        );
    }

    /**
     * Convert JSON to YAML string (Sync)
     * @param {Object|string} jsonData - JSON data or string with embedded JSON
     * @param {Object} [options={}] - Conversion options
     * @param {string} [options.conversionMode='no_encryption'] - Encryption mode
     * @returns {string} YAML formatted string
     */
    toYaml(jsonData, options = {}) {
        const { conversionMode = 'no_encryption' } = options;
        return this._convertWithEncryption(
            (data) => jsonToYamlSync(data),
            jsonData,
            conversionMode
        );
    }

    /**
     * Convert JSON to YAML string (Async)
     * @param {Object|string} jsonData - JSON data or string with embedded JSON
     * @param {Object} [options={}] - Conversion options
     * @param {string} [options.conversionMode='no_encryption'] - Encryption mode
     * @returns {Promise<string>} YAML formatted string
     */
    async toYamlAsync(jsonData, options = {}) {
        const { conversionMode = 'no_encryption' } = options;
        return this._convertWithEncryptionAsync(
            async (data) => jsonToYaml(data),
            jsonData,
            conversionMode
        );
    }

    // --- XML Conversions ---

    /**
     * Convert XML string to JSON (Sync)
     * @param {string} xmlString - XML formatted string (supports mixed text)
     * @param {Object} [options={}] - Conversion options
     * @param {string} [options.conversionMode='no_encryption'] - Encryption mode
     * @returns {Object|string} JSON result
     */
    fromXml(xmlString, options = {}) {
        const { conversionMode = 'no_encryption' } = options;
        return this._convertWithEncryption(
            (data) => xmlToJsonSync(data),
            xmlString,
            conversionMode
        );
    }

    /**
     * Convert XML string to JSON (Async)
     * @param {string} xmlString - XML formatted string (supports mixed text)
     * @param {Object} [options={}] - Conversion options
     * @param {string} [options.conversionMode='no_encryption'] - Encryption mode
     * @returns {Promise<Object|string>} JSON result
     */
    async fromXmlAsync(xmlString, options = {}) {
        const { conversionMode = 'no_encryption' } = options;
        return this._convertWithEncryptionAsync(
            async (data) => xmlToJson(data),
            xmlString,
            conversionMode
        );
    }

    /**
     * Convert JSON to XML string (Sync)
     * @param {Object|string} jsonData - JSON data or string with embedded JSON
     * @param {Object} [options={}] - Conversion options
     * @param {string} [options.conversionMode='no_encryption'] - Encryption mode
     * @returns {string} XML formatted string
     */
    toXml(jsonData, options = {}) {
        const { conversionMode = 'no_encryption' } = options;
        return this._convertWithEncryption(
            (data) => jsonToXmlSync(data),
            jsonData,
            conversionMode
        );
    }

    /**
     * Convert JSON to XML string (Async)
     * @param {Object|string} jsonData - JSON data or string with embedded JSON
     * @param {Object} [options={}] - Conversion options
     * @param {string} [options.conversionMode='no_encryption'] - Encryption mode
     * @returns {Promise<string>} XML formatted string
     */
    async toXmlAsync(jsonData, options = {}) {
        const { conversionMode = 'no_encryption' } = options;
        return this._convertWithEncryptionAsync(
            async (data) => jsonToXml(data),
            jsonData,
            conversionMode
        );
    }

    // --- CSV Conversions ---

    /**
     * Convert CSV string to JSON (Sync)
     * @param {string} csvString - CSV formatted string (supports mixed text)
     * @param {Object} [options={}] - Conversion options
     * @param {string} [options.conversionMode='no_encryption'] - Encryption mode
     * @returns {Array<Object>|string} JSON result
     */
    fromCsv(csvString, options = {}) {
        const { conversionMode = 'no_encryption' } = options;
        return this._convertWithEncryption(
            (data) => csvToJsonSync(data),
            csvString,
            conversionMode
        );
    }

    /**
     * Convert CSV string to JSON (Async)
     * @param {string} csvString - CSV formatted string (supports mixed text)
     * @param {Object} [options={}] - Conversion options
     * @param {string} [options.conversionMode='no_encryption'] - Encryption mode
     * @returns {Promise<Array<Object>|string>} JSON result
     */
    async fromCsvAsync(csvString, options = {}) {
        const { conversionMode = 'no_encryption' } = options;
        return this._convertWithEncryptionAsync(
            async (data) => csvToJson(data),
            csvString,
            conversionMode
        );
    }

    /**
     * Convert JSON to CSV string (Sync)
     * @param {Object|string} jsonData - JSON data or string with embedded JSON
     * @param {Object} [options={}] - Conversion options
     * @param {string} [options.conversionMode='no_encryption'] - Encryption mode
     * @returns {string} CSV formatted string
     */
    toCsv(jsonData, options = {}) {
        const { conversionMode = 'no_encryption' } = options;
        return this._convertWithEncryption(
            (data) => jsonToCsvSync(data),
            jsonData,
            conversionMode
        );
    }

    /**
     * Convert JSON to CSV string (Async)
     * @param {Object|string} jsonData - JSON data or string with embedded JSON
     * @param {Object} [options={}] - Conversion options
     * @param {string} [options.conversionMode='no_encryption'] - Encryption mode
     * @returns {Promise<string>} CSV formatted string
     */
    async toCsvAsync(jsonData, options = {}) {
        const { conversionMode = 'no_encryption' } = options;
        return this._convertWithEncryptionAsync(
            async (data) => jsonToCsv(data),
            jsonData,
            conversionMode
        );
    }

    // --- Validation ---

    /**
     * Validate JSON string (Sync)
     * @param {string} jsonString - JSON string to validate
     * @returns {boolean} True if valid
     */
    validate(jsonString) {
        return validateJsonStringSync(jsonString);
    }

    /**
     * Validate JSON string (Async)
     * @param {string} jsonString - JSON string to validate
     * @returns {Promise<boolean>} True if valid
     */
    async validateAsync(jsonString) {
        return validateJsonString(jsonString);
    }

    // ========================================
    // Static Methods (Backward Compatibility)
    // ========================================

    /**
     * Convert TOON string to JSON (Sync)
     * @param {string} toonString - TOON formatted string
     * @param {boolean} [returnJson=false] - If true, returns JSON string; if false, returns object
     * @returns {Object|string} JSON object or string
     */
    static fromToon(toonString, returnJson = false) {
        return toonToJsonSync(toonString, returnJson);
    }

    /**
     * Convert TOON string to JSON (Async)
     * @param {string} toonString - TOON formatted string
     * @param {boolean} [returnJson=false] - If true, returns JSON string; if false, returns object
     * @returns {Promise<Object|string>} JSON object or string
     */
    static async fromToonAsync(toonString, returnJson = false) {
        return toonToJson(toonString, returnJson);
    }

    /**
     * Convert JSON to TOON string (Sync)
     * @param {Object|string} jsonData - JSON data or string with embedded JSON
     * @returns {string} TOON formatted string
     */
    static toToon(jsonData) {
        return jsonToToonSync(jsonData);
    }

    /**
     * Convert JSON to TOON string (Async)
     * @param {Object|string} jsonData - JSON data or string with embedded JSON
     * @returns {Promise<string>} TOON formatted string
     */
    static async toToonAsync(jsonData) {
        return jsonToToon(jsonData);
    }

    /**
     * Convert YAML string to JSON (Sync)
     * @param {string} yamlString - YAML formatted string
     * @param {boolean} [returnJson=false] - If true, returns JSON string; if false, returns object
     * @returns {Object|string} JSON object or string
     */
    static fromYaml(yamlString, returnJson = false) {
        return yamlToJsonSync(yamlString, returnJson);
    }

    /**
     * Convert YAML string to JSON (Async)
     * @param {string} yamlString - YAML formatted string
     * @param {boolean} [returnJson=false] - If true, returns JSON string; if false, returns object
     * @returns {Promise<Object|string>} JSON object or string
     */
    static async fromYamlAsync(yamlString, returnJson = false) {
        return yamlToJson(yamlString, returnJson);
    }

    /**
     * Convert JSON to YAML string (Sync)
     * @param {Object|string} jsonData - JSON data or string with embedded JSON
     * @returns {string} YAML formatted string
     */
    static toYaml(jsonData) {
        return jsonToYamlSync(jsonData);
    }

    /**
     * Convert JSON to YAML string (Async)
     * @param {Object|string} jsonData - JSON data or string with embedded JSON
     * @returns {Promise<string>} YAML formatted string
     */
    static async toYamlAsync(jsonData) {
        return jsonToYaml(jsonData);
    }

    /**
     * Convert XML string to JSON (Sync)
     * @param {string} xmlString - XML formatted string
     * @returns {Object|string} JSON object or string
     */
    static fromXml(xmlString) {
        return xmlToJsonSync(xmlString);
    }

    /**
     * Convert XML string to JSON (Async)
     * @param {string} xmlString - XML formatted string
     * @returns {Promise<Object|string>} JSON object or string
     */
    static async fromXmlAsync(xmlString) {
        return xmlToJson(xmlString);
    }

    /**
     * Convert JSON to XML string (Sync)
     * @param {Object|string} jsonData - JSON data or string with embedded JSON
     * @returns {string} XML formatted string
     */
    static toXml(jsonData) {
        return jsonToXmlSync(jsonData);
    }

    /**
     * Convert JSON to XML string (Async)
     * @param {Object|string} jsonData - JSON data or string with embedded JSON
     * @returns {Promise<string>} XML formatted string
     */
    static async toXmlAsync(jsonData) {
        return jsonToXml(jsonData);
    }

    /**
     * Convert CSV string to JSON (Sync)
     * @param {string} csvString - CSV formatted string
     * @returns {Array<Object>|string} JSON object or string
     */
    static fromCsv(csvString) {
        return csvToJsonSync(csvString);
    }

    /**
     * Convert CSV string to JSON (Async)
     * @param {string} csvString - CSV formatted string
     * @returns {Promise<Array<Object>|string>} JSON object or string
     */
    static async fromCsvAsync(csvString) {
        return csvToJson(csvString);
    }

    /**
     * Convert JSON to CSV string (Sync)
     * @param {Object|string} jsonData - JSON data or string with embedded JSON
     * @returns {string} CSV formatted string
     */
    static toCsv(jsonData) {
        return jsonToCsvSync(jsonData);
    }

    /**
     * Convert JSON to CSV string (Async)
     * @param {Object|string} jsonData - JSON data or string with embedded JSON
     * @returns {Promise<string>} CSV formatted string
     */
    static async toCsvAsync(jsonData) {
        return jsonToCsv(jsonData);
    }

    /**
     * Validate JSON string
     * @param {string} jsonString - JSON string to validate
     * @returns {boolean} True if valid
     */
    static validate(jsonString) {
        return validateJsonStringSync(jsonString);
    }

    /**
     * Validate JSON string (Async)
     * @param {string} jsonString - JSON string to validate
     * @returns {Promise<boolean>} True if valid
     */
    static async validateAsync(jsonString) {
        return validateJsonString(jsonString);
    }
}
