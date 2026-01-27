/**
 * YamlConverter Class
 */

import { toonToYaml, toonToYamlSync, yamlToToon, yamlToToonSync } from '../yaml.js';
import { jsonToYaml, jsonToYamlSync, yamlToJson, yamlToJsonSync } from '../json_formatter/yaml.js';
import { xmlToYaml, xmlToYamlSync, yamlToXml, yamlToXmlSync } from './xml.js';
import { csvToYaml, csvToYamlSync, yamlToCsv, yamlToCsvSync } from './csv.js';
import { validateYamlString, validateYamlStringSync } from './validator.js';
import { dataManager, dataManagerAsync, extractJsonFromString, extractXmlFromString, extractCsvFromString } from '../utils.js';

export class YamlConverter {
    /**
     * Creates a YamlConverter instance
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
            case 'middleware': // Decrypt -> Convert -> Encrypt
                const decrypted = this.encryptor.decrypt(data);
                const result = fn(decrypted);
                return this.encryptor.encrypt(result);
            case 'ingestion': // Decrypt -> Convert
                const dec = this.encryptor.decrypt(data);
                return fn(dec);
            case 'export': // Convert -> Encrypt
                const res = fn(data);
                return this.encryptor.encrypt(res);
            default:
                return fn(data);
        }
    }

    /**
     * Applies encryption logic based on conversion mode (asynchronous)
     * @private
     * @param {Function} fn - The async converter function to call
     * @param {*} data - Data to convert
     * @param {string} mode - Conversion mode: 'no_encryption', 'middleware', 'ingestion', 'export'
     * @returns {Promise<*>} Converted (and possibly encrypted) data
     */
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
     * Convert TOON string to YAML (Sync)
     * @param {string} toonString - TOON formatted string
     * @param {Object} [options={}] - Conversion options
     * @param {string} [options.conversionMode='no_encryption'] - Encryption mode
     * @returns {string} YAML formatted string
     */
    fromToon(toonString, options = {}) {
        const { conversionMode = 'no_encryption' } = options;
        return this._convertWithEncryption(
            (data) => toonToYamlSync(data),
            toonString,
            conversionMode
        );
    }

    /**
     * Convert TOON string to YAML (Async)
     * @param {string} toonString - TOON formatted string
     * @param {Object} [options={}] - Conversion options
     * @param {string} [options.conversionMode='no_encryption'] - Encryption mode
     * @returns {Promise<string>} YAML formatted string
     */
    async fromToonAsync(toonString, options = {}) {
        const { conversionMode = 'no_encryption' } = options;
        return this._convertWithEncryptionAsync(
            async (data) => toonToYaml(data),
            toonString,
            conversionMode
        );
    }

    /**
     * Convert YAML to TOON string (Sync)
     * @param {string} yamlString - YAML formatted string
     * @param {Object} [options={}] - Conversion options
     * @param {string} [options.conversionMode='no_encryption'] - Encryption mode
     * @returns {string} TOON formatted string
     */
    toToon(yamlString, options = {}) {
        const { conversionMode = 'no_encryption' } = options;
        return this._convertWithEncryption(
            (data) => yamlToToonSync(data),
            yamlString,
            conversionMode
        );
    }

    /**
     * Convert YAML to TOON string (Async)
     * @param {string} yamlString - YAML formatted string
     * @param {Object} [options={}] - Conversion options
     * @param {string} [options.conversionMode='no_encryption'] - Encryption mode
     * @returns {Promise<string>} TOON formatted string
     */
    async toToonAsync(yamlString, options = {}) {
        const { conversionMode = 'no_encryption' } = options;
        return this._convertWithEncryptionAsync(
            async (data) => yamlToToon(data),
            yamlString,
            conversionMode
        );
    }

    // --- JSON Conversions ---

    /**
     * Convert JSON to YAML (Sync)
     * @param {Object|string} jsonData - JSON data or string with embedded JSON
     * @param {Object} [options={}] - Conversion options
     * @param {string} [options.conversionMode='no_encryption'] - Encryption mode
     * @returns {string} YAML formatted string
     */
    fromJson(jsonData, options = {}) {
        const { conversionMode = 'no_encryption' } = options;
        const optimizedConverterFn = dataManager(jsonToYamlSync, extractJsonFromString);
        return this._convertWithEncryption(
            (data) => optimizedConverterFn(data),
            jsonData,
            conversionMode
        );
    }

    /**
     * Convert JSON to YAML (Async)
     * @param {Object|string} jsonData - JSON data or string with embedded JSON
     * @param {Object} [options={}] - Conversion options
     * @param {string} [options.conversionMode='no_encryption'] - Encryption mode
     * @returns {Promise<string>} YAML formatted string
     */
    async fromJsonAsync(jsonData, options = {}) {
        const { conversionMode = 'no_encryption' } = options;
        const optimizedConverterFn = dataManagerAsync(jsonToYaml, extractJsonFromString);
        return this._convertWithEncryptionAsync(
            async (data) => optimizedConverterFn(data),
            jsonData,
            conversionMode
        );
    }

    /**
     * Convert YAML to JSON (Sync)
     * @param {string} yamlString - YAML formatted string
     * @param {Object} [options={}] - Conversion options
     * @param {string} [options.conversionMode='no_encryption'] - Encryption mode
     * @param {boolean} [options.returnJson=false] - If true, returns JSON string; if false, returns object
     * @returns {Object|string} JSON result
     */
    toJson(yamlString, options = {}) {
        const { conversionMode = 'no_encryption', returnJson = false } = options;
        return this._convertWithEncryption(
            (data) => {
                const res = yamlToJsonSync(data);
                return returnJson ? JSON.stringify(res) : res;
            },
            yamlString,
            conversionMode
        );
    }

    /**
     * Convert YAML to JSON (Async)
     * @param {string} yamlString - YAML formatted string
     * @param {Object} [options={}] - Conversion options
     * @param {string} [options.conversionMode='no_encryption'] - Encryption mode
     * @param {boolean} [options.returnJson=false] - If true, returns JSON string; if false, returns object
     * @returns {Promise<Object|string>} JSON result
     */
    async toJsonAsync(yamlString, options = {}) {
        const { conversionMode = 'no_encryption', returnJson = false } = options;
        return this._convertWithEncryptionAsync(
            async (data) => {
                const res = await yamlToJson(data);
                return returnJson ? JSON.stringify(res) : res;
            },
            yamlString,
            conversionMode
        );
    }

    // --- XML Conversions ---

    /**
     * Convert XML to YAML (Sync)
     * @param {string} xmlString - XML formatted string (supports mixed text)
     * @param {Object} [options={}] - Conversion options
     * @param {string} [options.conversionMode='no_encryption'] - Encryption mode
     * @returns {string} YAML formatted string
     */
    fromXml(xmlString, options = {}) {
        const { conversionMode = 'no_encryption' } = options;
        const optimizedConverterFn = dataManager(xmlToYamlSync, extractXmlFromString);
        return this._convertWithEncryption(
            (data) => optimizedConverterFn(data),
            xmlString,
            conversionMode
        );
    }

    /**
     * Convert XML to YAML (Async)
     * @param {string} xmlString - XML formatted string (supports mixed text)
     * @param {Object} [options={}] - Conversion options
     * @param {string} [options.conversionMode='no_encryption'] - Encryption mode
     * @returns {Promise<string>} YAML formatted string
     */
    async fromXmlAsync(xmlString, options = {}) {
        const { conversionMode = 'no_encryption' } = options;
        const optimizedConverterFn = dataManagerAsync(xmlToYaml, extractXmlFromString);
        return this._convertWithEncryptionAsync(
            async (data) => optimizedConverterFn(data),
            xmlString,
            conversionMode
        );
    }

    /**
     * Convert YAML to XML (Sync)
     * @param {string} yamlString - YAML formatted string
     * @param {Object} [options={}] - Conversion options
     * @param {string} [options.conversionMode='no_encryption'] - Encryption mode
     * @returns {string} XML formatted string
     */
    toXml(yamlString, options = {}) {
        const { conversionMode = 'no_encryption' } = options;
        return this._convertWithEncryption(
            (data) => yamlToXmlSync(data),
            yamlString,
            conversionMode
        );
    }

    /**
     * Convert YAML to XML (Async)
     * @param {string} yamlString - YAML formatted string
     * @param {Object} [options={}] - Conversion options
     * @param {string} [options.conversionMode='no_encryption'] - Encryption mode
     * @returns {Promise<string>} XML formatted string
     */
    async toXmlAsync(yamlString, options = {}) {
        const { conversionMode = 'no_encryption' } = options;
        return this._convertWithEncryptionAsync(
            async (data) => yamlToXml(data),
            yamlString,
            conversionMode
        );
    }

    // --- CSV Conversions ---

    /**
     * Convert CSV to YAML (Sync)
     * @param {string} csvString - CSV formatted string (supports mixed text)
     * @param {Object} [options={}] - Conversion options
     * @param {string} [options.conversionMode='no_encryption'] - Encryption mode
     * @returns {string} YAML formatted string
     */
    fromCsv(csvString, options = {}) {
        const { conversionMode = 'no_encryption' } = options;
        const optimizedConverterFn = dataManager(csvToYamlSync, extractCsvFromString);
        return this._convertWithEncryption(
            (data) => optimizedConverterFn(data),
            csvString,
            conversionMode
        );
    }

    /**
     * Convert CSV to YAML (Async)
     * @param {string} csvString - CSV formatted string (supports mixed text)
     * @param {Object} [options={}] - Conversion options
     * @param {string} [options.conversionMode='no_encryption'] - Encryption mode
     * @returns {Promise<string>} YAML formatted string
     */
    async fromCsvAsync(csvString, options = {}) {
        const { conversionMode = 'no_encryption' } = options;
        const optimizedConverterFn = dataManagerAsync(csvToYaml, extractCsvFromString);
        return this._convertWithEncryptionAsync(
            async (data) => optimizedConverterFn(data),
            csvString,
            conversionMode
        );
    }

    /**
     * Convert YAML to CSV (Sync)
     * @param {string} yamlString - YAML formatted string
     * @param {Object} [options={}] - Conversion options
     * @param {string} [options.conversionMode='no_encryption'] - Encryption mode
     * @returns {string} CSV formatted string
     */
    toCsv(yamlString, options = {}) {
        const { conversionMode = 'no_encryption' } = options;
        return this._convertWithEncryption(
            (data) => yamlToCsvSync(data),
            yamlString,
            conversionMode
        );
    }

    /**
     * Convert YAML to CSV (Async)
     * @param {string} yamlString - YAML formatted string
     * @param {Object} [options={}] - Conversion options
     * @param {string} [options.conversionMode='no_encryption'] - Encryption mode
     * @returns {Promise<string>} CSV formatted string
     */
    async toCsvAsync(yamlString, options = {}) {
        const { conversionMode = 'no_encryption' } = options;
        return this._convertWithEncryptionAsync(
            async (data) => yamlToCsv(data),
            yamlString,
            conversionMode
        );
    }

    // --- Validation ---

    /**
     * Validate YAML string (Sync)
     * @param {string} yamlString - YAML string to validate
     * @returns {boolean} True if valid
     */
    validate(yamlString) {
        return validateYamlStringSync(yamlString);
    }

    /**
     * Validate YAML string (Async)
     * @param {string} yamlString - YAML string to validate
     * @returns {Promise<boolean>} True if valid
     */
    async validateAsync(yamlString) {
        return validateYamlString(yamlString);
    }

    // ========================================
    // Static Methods (Backward Compatibility)
    // ========================================

    /**
     * Convert TOON string to YAML (Sync)
     * @param {string} toonString - TOON formatted string
     * @returns {string} YAML formatted string
     */
    static fromToon(toonString) {
        return toonToYamlSync(toonString);
    }

    /**
     * Convert TOON string to YAML (Async)
     * @param {string} toonString - TOON formatted string
     * @returns {Promise<string>} YAML formatted string
     */
    static async fromToonAsync(toonString) {
        return toonToYaml(toonString);
    }

    /**
     * Convert YAML to TOON string (Sync)
     * @param {string} yamlString - YAML formatted string
     * @returns {string} TOON formatted string
     */
    static toToon(yamlString) {
        return yamlToToonSync(yamlString);
    }

    /**
     * Convert YAML to TOON string (Async)
     * @param {string} yamlString - YAML formatted string
     * @returns {Promise<string>} TOON formatted string
     */
    static async toToonAsync(yamlString) {
        return yamlToToon(yamlString);
    }

    /**
     * Convert JSON to YAML string (Sync)
     * @param {Object|string} jsonData - JSON data or string with embedded JSON
     * @returns {string} YAML formatted string
     */
    static fromJson(jsonData) {
        const optimizedConverterFn = dataManager(jsonToYamlSync, extractJsonFromString);
        return optimizedConverterFn(jsonData);
    }

    /**
     * Convert JSON to YAML string (Async)
     * @param {Object|string} jsonData - JSON data or string with embedded JSON
     * @returns {Promise<string>} YAML formatted string
     */
    static async fromJsonAsync(jsonData) {
        const optimizedConverterFn = dataManagerAsync(jsonToYaml, extractJsonFromString);
        return optimizedConverterFn(jsonData);
    }

    /**
     * Convert YAML to JSON (Sync)
     * @param {string} yamlString - YAML formatted string
     * @param {boolean} [returnJson=false] - If true, returns JSON string; if false, returns object
     * @returns {Object|string} JSON result
     */
    static toJson(yamlString, returnJson = false) {
        const res = yamlToJsonSync(yamlString);
        return returnJson ? JSON.stringify(res) : res;
    }

    /**
     * Convert YAML to JSON (Async)
     * @param {string} yamlString - YAML formatted string
     * @param {boolean} [returnJson=false] - If true, returns JSON string; if false, returns object
     * @returns {Promise<Object|string>} JSON result
     */
    static async toJsonAsync(yamlString, returnJson = false) {
        const res = await yamlToJson(yamlString);
        return returnJson ? JSON.stringify(res) : res;
    }

    /**
     * Convert XML to YAML string (Sync)
     * @param {string} xmlString - XML formatted string
     * @returns {string} YAML formatted string
     */
    static fromXml(xmlString) {
        const optimizedConverterFn = dataManager(xmlToYamlSync, extractXmlFromString);
        return optimizedConverterFn(xmlString);
    }

    /**
     * Convert XML to YAML string (Async)
     * @param {string} xmlString - XML formatted string
     * @returns {Promise<string>} YAML formatted string
     */
    static async fromXmlAsync(xmlString) {
        const optimizedConverterFn = dataManagerAsync(xmlToYaml, extractXmlFromString);
        return optimizedConverterFn(xmlString);
    }

    /**
     * Convert YAML to XML string (Sync)
     * @param {string} yamlString - YAML formatted string
     * @returns {string} XML formatted string
     */
    static toXml(yamlString) {
        return yamlToXmlSync(yamlString);
    }

    /**
     * Convert YAML to XML string (Async)
     * @param {string} yamlString - YAML formatted string
     * @returns {Promise<string>} XML formatted string
     */
    static async toXmlAsync(yamlString) {
        return yamlToXml(yamlString);
    }

    /**
     * Convert CSV to YAML string (Sync)
     * @param {string} csvString - CSV formatted string
     * @returns {string} YAML formatted string
     */
    static fromCsv(csvString) {
        const optimizedConverterFn = dataManager(csvToYamlSync, extractCsvFromString);
        return optimizedConverterFn(csvString);
    }

    /**
     * Convert CSV to YAML string (Async)
     * @param {string} csvString - CSV formatted string
     * @returns {Promise<string>} YAML formatted string
     */
    static async fromCsvAsync(csvString) {
        const optimizedConverterFn = dataManagerAsync(csvToYaml, extractCsvFromString);
        return optimizedConverterFn(csvString);
    }

    /**
     * Convert YAML to CSV string (Sync)
     * @param {string} yamlString - YAML formatted string
     * @returns {string} CSV formatted string
     */
    static toCsv(yamlString) {
        return yamlToCsvSync(yamlString);
    }

    /**
     * Convert YAML to CSV string (Async)
     * @param {string} yamlString - YAML formatted string
     * @returns {Promise<string>} CSV formatted string
     */
    static async toCsvAsync(yamlString) {
        return yamlToCsv(yamlString);
    }

    /**
     * Validate YAML string
     * @param {string} yamlString - YAML string to validate
     * @returns {boolean} True if valid
     */
    static validate(yamlString) {
        return validateYamlStringSync(yamlString);
    }

    /**
     * Validate YAML string (Async)
     * @param {string} yamlString - YAML string to validate
     * @returns {Promise<boolean>} True if valid
     */
    static async validateAsync(yamlString) {
        return validateYamlString(yamlString);
    }
}
