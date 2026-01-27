/**
 * JsonConverter Class
 */

import { toonToJson, toonToJsonSync, jsonToToon, jsonToToonSync } from '../json.js';
import { yamlToJson, yamlToJsonSync, jsonToYaml, jsonToYamlSync } from './yaml.js';
import { xmlToJson, xmlToJsonSync, jsonToXml, jsonToXmlSync } from './xml.js';
import { csvToJson, csvToJsonSync, jsonToCsv, jsonToCsvSync } from './csv.js';
import { validateJsonString, validateJsonStringSync } from './validator.js';
import { dataManager, dataManagerAsync, extractJsonFromString, extractXmlFromString, extractCsvFromString } from '../utils.js';

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
        const optimizedConverterFn = dataManager(jsonToToonSync, extractJsonFromString);
        return this._convertWithEncryption(
            (data) => optimizedConverterFn(data),
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
        const optimizedConverterFn = dataManagerAsync(jsonToToon, extractJsonFromString);
        return this._convertWithEncryptionAsync(
            async (data) => optimizedConverterFn(data),
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
        const optimizedConverterFn = dataManager(jsonToYamlSync, extractJsonFromString);
        return this._convertWithEncryption(
            (data) => optimizedConverterFn(data),
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
        const optimizedConverterFn = dataManagerAsync(jsonToYaml, extractJsonFromString);
        return this._convertWithEncryptionAsync(
            async (data) => optimizedConverterFn(data),
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
        const optimizedConverterFn = dataManager(xmlToJsonSync, extractXmlFromString);
        return this._convertWithEncryption(
            (data) => optimizedConverterFn(data),
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
        const optimizedConverterFn = dataManagerAsync(xmlToJson, extractXmlFromString);
        return this._convertWithEncryptionAsync(
            async (data) => optimizedConverterFn(data),
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
        const optimizedConverterFn = dataManager(jsonToXmlSync, extractJsonFromString);
        return this._convertWithEncryption(
            (data) => optimizedConverterFn(data),
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
        const optimizedConverterFn = dataManagerAsync(jsonToXml, extractJsonFromString);
        return this._convertWithEncryptionAsync(
            async (data) => optimizedConverterFn(data),
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
        const optimizedConverterFn = dataManager(csvToJsonSync, extractCsvFromString);
        return this._convertWithEncryption(
            (data) => optimizedConverterFn(data),
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
        const optimizedConverterFn = dataManagerAsync(csvToJson, extractCsvFromString);
        return this._convertWithEncryptionAsync(
            async (data) => optimizedConverterFn(data),
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
        const optimizedConverterFn = dataManager(jsonToCsvSync, extractJsonFromString);
        return this._convertWithEncryption(
            (data) => optimizedConverterFn(data),
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
        const optimizedConverterFn = dataManagerAsync(jsonToCsv, extractJsonFromString);
        return this._convertWithEncryptionAsync(
            async (data) => optimizedConverterFn(data),
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
        const optimizedConverterFn = dataManager(jsonToToonSync, extractJsonFromString);
        return optimizedConverterFn(jsonData);
    }

    /**
     * Convert JSON to TOON string (Async)
     * @param {Object|string} jsonData - JSON data or string with embedded JSON
     * @returns {Promise<string>} TOON formatted string
     */
    static async toToonAsync(jsonData) {
        const optimizedConverterFn = dataManagerAsync(jsonToToon, extractJsonFromString);
        return optimizedConverterFn(jsonData);
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
        const optimizedConverterFn = dataManager(jsonToYamlSync, extractJsonFromString);
        return optimizedConverterFn(jsonData);
    }

    /**
     * Convert JSON to YAML string (Async)
     * @param {Object|string} jsonData - JSON data or string with embedded JSON
     * @returns {Promise<string>} YAML formatted string
     */
    static async toYamlAsync(jsonData) {
        const optimizedConverterFn = dataManagerAsync(jsonToYaml, extractJsonFromString);
        return optimizedConverterFn(jsonData);
    }

    /**
     * Convert XML string to JSON (Sync)
     * @param {string} xmlString - XML formatted string
     * @returns {Object|string} JSON object or string
     */
    static fromXml(xmlString) {
        const optimizedConverterFn = dataManager(xmlToJsonSync, extractXmlFromString);
        return optimizedConverterFn(xmlString);
    }

    /**
     * Convert XML string to JSON (Async)
     * @param {string} xmlString - XML formatted string
     * @returns {Promise<Object|string>} JSON object or string
     */
    static async fromXmlAsync(xmlString) {
        const optimizedConverterFn = dataManagerAsync(xmlToJson, extractXmlFromString);
        return optimizedConverterFn(xmlString);
    }

    /**
     * Convert JSON to XML string (Sync)
     * @param {Object|string} jsonData - JSON data or string with embedded JSON
     * @returns {string} XML formatted string
     */
    static toXml(jsonData) {
        const optimizedConverterFn = dataManager(jsonToXmlSync, extractJsonFromString);
        return optimizedConverterFn(jsonData);
    }

    /**
     * Convert JSON to XML string (Async)
     * @param {Object|string} jsonData - JSON data or string with embedded JSON
     * @returns {Promise<string>} XML formatted string
     */
    static async toXmlAsync(jsonData) {
        const optimizedConverterFn = dataManagerAsync(jsonToXml, extractJsonFromString);
        return optimizedConverterFn(jsonData);
    }

    /**
     * Convert CSV string to JSON (Sync)
     * @param {string} csvString - CSV formatted string
     * @returns {Array<Object>|string} JSON object or string
     */
    static fromCsv(csvString) {
        const optimizedConverterFn = dataManager(csvToJsonSync, extractCsvFromString);
        return optimizedConverterFn(csvString);
    }

    /**
     * Convert CSV string to JSON (Async)
     * @param {string} csvString - CSV formatted string
     * @returns {Promise<Array<Object>|string>} JSON object or string
     */
    static async fromCsvAsync(csvString) {
        const optimizedConverterFn = dataManagerAsync(csvToJson, extractCsvFromString);
        return optimizedConverterFn(csvString);
    }

    /**
     * Convert JSON to CSV string (Sync)
     * @param {Object|string} jsonData - JSON data or string with embedded JSON
     * @returns {string} CSV formatted string
     */
    static toCsv(jsonData) {
        const optimizedConverterFn = dataManager(jsonToCsvSync, extractJsonFromString);
        return optimizedConverterFn(jsonData);
    }

    /**
     * Convert JSON to CSV string (Async)
     * @param {Object|string} jsonData - JSON data or string with embedded JSON
     * @returns {Promise<string>} CSV formatted string
     */
    static async toCsvAsync(jsonData) {
        const optimizedConverterFn = dataManagerAsync(jsonToCsv, extractJsonFromString);
        return await optimizedConverterFn(jsonData);
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
