/**
 * CsvConverter Class
 */

import { csvToToon, csvToToonSync, toonToCsv, toonToCsvSync } from '../csv.js';
import { csvToJson, csvToJsonSync, jsonToCsv, jsonToCsvSync } from '../json_formatter/csv.js';
import { csvToYaml, csvToYamlSync, yamlToCsv, yamlToCsvSync } from '../yaml_formatter/csv.js';
import { csvToXml, csvToXmlSync, xmlToCsv, xmlToCsvSync } from '../xml_formatter/csv.js';
import { validateCsvString, validateCsvStringSync } from './validator.js';
import { dataManager, dataManagerAsync, extractJsonFromString, extractXmlFromString, extractCsvFromString } from '../utils.js';

export class CsvConverter {
    /**
     * Creates a CsvConverter instance
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
     * Convert TOON string to CSV (Sync)
     * @param {string} toonString - TOON formatted string
     * @param {Object} [options={}] - Conversion options
     * @param {string} [options.conversionMode='no_encryption'] - Encryption mode
     * @returns {string} CSV formatted string
     */
    fromToon(toonString, options = {}) {
        const { conversionMode = 'no_encryption' } = options;
        return this._convertWithEncryption(
            (data) => toonToCsvSync(data),
            toonString,
            conversionMode
        );
    }

    /**
     * Convert TOON string to CSV (Async)
     * @param {string} toonString - TOON formatted string
     * @param {Object} [options={}] - Conversion options
     * @param {string} [options.conversionMode='no_encryption'] - Encryption mode
     * @returns {Promise<string>} CSV formatted string
     */
    async fromToonAsync(toonString, options = {}) {
        const { conversionMode = 'no_encryption' } = options;
        return this._convertWithEncryptionAsync(
            async (data) => toonToCsv(data),
            toonString,
            conversionMode
        );
    }

    /**
     * Convert CSV to TOON string (Sync)
     * @param {string} csvString - CSV formatted string (supports mixed text)
     * @param {Object} [options={}] - Conversion options
     * @param {string} [options.conversionMode='no_encryption'] - Encryption mode
     * @returns {string} TOON formatted string
     */
    toToon(csvString, options = {}) {
        const { conversionMode = 'no_encryption' } = options;
        const optimizedConverterFn = dataManager(csvToToonSync, extractCsvFromString);
        return this._convertWithEncryption(
            (data) => optimizedConverterFn(data),
            csvString,
            conversionMode
        );
    }

    /**
     * Convert CSV to TOON string (Async)
     * @param {string} csvString - CSV formatted string (supports mixed text)
     * @param {Object} [options={}] - Conversion options
     * @param {string} [options.conversionMode='no_encryption'] - Encryption mode
     * @returns {Promise<string>} TOON formatted string
     */
    async toToonAsync(csvString, options = {}) {
        const { conversionMode = 'no_encryption' } = options;
        const optimizedConverterFn = dataManagerAsync(csvToToon, extractCsvFromString);
        return this._convertWithEncryptionAsync(
            async (data) => optimizedConverterFn(data),
            csvString,
            conversionMode
        );
    }

    // --- JSON Conversions ---

    /**
     * Convert JSON to CSV (Sync)
     * @param {Object|string} jsonData - JSON data or string with embedded JSON
     * @param {Object} [options={}] - Conversion options
     * @param {string} [options.conversionMode='no_encryption'] - Encryption mode
     * @returns {string} CSV formatted string
     */
    fromJson(jsonData, options = {}) {
        const { conversionMode = 'no_encryption' } = options;
        const optimizedConverterFn = dataManager(jsonToCsvSync, extractJsonFromString);
        return this._convertWithEncryption(
            (data) => optimizedConverterFn(data),
            jsonData,
            conversionMode
        );
    }

    /**
     * Convert JSON to CSV (Async)
     * @param {Object|string} jsonData - JSON data or string with embedded JSON
     * @param {Object} [options={}] - Conversion options
     * @param {string} [options.conversionMode='no_encryption'] - Encryption mode
     * @returns {Promise<string>} CSV formatted string
     */
    async fromJsonAsync(jsonData, options = {}) {
        const { conversionMode = 'no_encryption' } = options;
        const optimizedConverterFn = dataManagerAsync(jsonToCsv, extractJsonFromString);
        return this._convertWithEncryptionAsync(
            async (data) => optimizedConverterFn(data),
            jsonData,
            conversionMode
        );
    }

    /**
     * Convert CSV to JSON (Sync)
     * @param {string} csvString - CSV formatted string (supports mixed text)
     * @param {Object} [options={}] - Conversion options
     * @param {string} [options.conversionMode='no_encryption'] - Encryption mode
     * @returns {Array|string} JSON result
     */
    toJson(csvString, options = {}) {
        const { conversionMode = 'no_encryption' } = options;
        const optimizedConverterFn = dataManager(csvToJsonSync, extractCsvFromString);
        return this._convertWithEncryption(
            (data) => optimizedConverterFn(data),
            csvString,
            conversionMode
        );
    }

    /**
     * Convert CSV to JSON (Async)
     * @param {string} csvString - CSV formatted string (supports mixed text)
     * @param {Object} [options={}] - Conversion options
     * @param {string} [options.conversionMode='no_encryption'] - Encryption mode
     * @returns {Promise<Array|string>} JSON result
     */
    async toJsonAsync(csvString, options = {}) {
        const { conversionMode = 'no_encryption' } = options;
        const optimizedConverterFn = dataManagerAsync(csvToJson, extractCsvFromString);
        return this._convertWithEncryptionAsync(
            async (data) => optimizedConverterFn(data),
            csvString,
            conversionMode
        );
    }

    // --- YAML Conversions ---

    /**
     * Convert YAML string to CSV (Sync)
     * @param {string} yamlString - YAML formatted string
     * @param {Object} [options={}] - Conversion options
     * @param {string} [options.conversionMode='no_encryption'] - Encryption mode
     * @returns {string} CSV formatted string
     */
    fromYaml(yamlString, options = {}) {
        const { conversionMode = 'no_encryption' } = options;
        return this._convertWithEncryption(
            (data) => yamlToCsvSync(data),
            yamlString,
            conversionMode
        );
    }

    async fromYamlAsync(yamlString, options = {}) {
        const { conversionMode = 'no_encryption' } = options;
        return this._convertWithEncryptionAsync(
            async (data) => yamlToCsv(data),
            yamlString,
            conversionMode
        );
    }

    /**
     * Convert CSV to YAML string (Sync)
     * @param {string} csvString - CSV formatted string (supports mixed text)
     * @param {Object} [options={}] - Conversion options
     * @param {string} [options.conversionMode='no_encryption'] - Encryption mode
     * @returns {string} YAML formatted string
     */
    toYaml(csvString, options = {}) {
        const { conversionMode = 'no_encryption' } = options;
        const optimizedConverterFn = dataManager(csvToYamlSync, extractCsvFromString);
        return this._convertWithEncryption(
            (data) => optimizedConverterFn(data),
            csvString,
            conversionMode
        );
    }

    async toYamlAsync(csvString, options = {}) {
        const { conversionMode = 'no_encryption' } = options;
        const optimizedConverterFn = dataManagerAsync(csvToYaml, extractCsvFromString);
        return this._convertWithEncryptionAsync(
            async (data) => optimizedConverterFn(data),
            csvString,
            conversionMode
        );
    }

    // --- XML Conversions ---

    /**
     * Convert XML string to CSV (Sync)
     * @param {string} xmlString - XML formatted string (supports mixed text)
     * @param {Object} [options={}] - Conversion options
     * @param {string} [options.conversionMode='no_encryption'] - Encryption mode
     * @returns {string} CSV formatted string
     */
    fromXml(xmlString, options = {}) {
        const { conversionMode = 'no_encryption' } = options;
        const optimizedConverterFn = dataManager(xmlToCsvSync, extractXmlFromString);
        return this._convertWithEncryption(
            (data) => optimizedConverterFn(data),
            xmlString,
            conversionMode
        );
    }

    async fromXmlAsync(xmlString, options = {}) {
        const { conversionMode = 'no_encryption' } = options;
        const optimizedConverterFn = dataManagerAsync(xmlToCsv, extractXmlFromString);
        return this._convertWithEncryptionAsync(
            async (data) => optimizedConverterFn(data),
            xmlString,
            conversionMode
        );
    }

    /**
     * Convert CSV to XML string (Sync)
     * @param {string} csvString - CSV formatted string (supports mixed text)
     * @param {Object} [options={}] - Conversion options
     * @param {string} [options.conversionMode='no_encryption'] - Encryption mode
     * @returns {string} XML formatted string
     */
    toXml(csvString, options = {}) {
        const { conversionMode = 'no_encryption' } = options;
        const optimizedConverterFn = dataManager(csvToXmlSync, extractCsvFromString);
        return this._convertWithEncryption(
            (data) => optimizedConverterFn(data),
            csvString,
            conversionMode
        );
    }

    async toXmlAsync(csvString, options = {}) {
        const { conversionMode = 'no_encryption' } = options;
        const optimizedConverterFn = dataManagerAsync(csvToXml, extractCsvFromString);
        return this._convertWithEncryptionAsync(
            async (data) => optimizedConverterFn(data),
            csvString,
            conversionMode
        );
    }

    // --- Validation ---

    /**
     * Validate CSV string (Sync)
     * @param {string} csvString - CSV string to validate
     * @returns {boolean} True if valid
     */
    validate(csvString) {
        return validateCsvStringSync(csvString);
    }

    async validateAsync(csvString) {
        return validateCsvString(csvString);
    }

    // ========================================
    // Static Methods (Backward Compatibility)
    // ========================================

    /**
     * Convert TOON string to CSV (Sync)
     * @param {string} toonString - TOON formatted string
     * @returns {string} CSV formatted string
     */
    static fromToon(toonString) {
        return toonToCsvSync(toonString);
    }

    /**
     * Convert TOON string to CSV (Async)
     * @param {string} toonString - TOON formatted string
     * @returns {Promise<string>} CSV formatted string
     */
    static async fromToonAsync(toonString) {
        return toonToCsv(toonString);
    }

    /**
     * Convert CSV to TOON string (Sync)
     * @param {string} csvString - CSV formatted string
     * @returns {string} TOON formatted string
     */
    static toToon(csvString) {
        const optimizedConverterFn = dataManager(csvToToonSync, extractCsvFromString);
        return optimizedConverterFn(csvString);
    }

    /**
     * Convert CSV to TOON string (Async)
     * @param {string} csvString - CSV formatted string
     * @returns {Promise<string>} TOON formatted string
     */
    static async toToonAsync(csvString) {
        const optimizedConverterFn = dataManagerAsync(csvToToon, extractCsvFromString);
        return optimizedConverterFn(csvString);
    }

    /**
     * Convert JSON to CSV string (Sync)
     * @param {Object|string} jsonData - JSON data or string with embedded JSON
     * @returns {string} CSV formatted string
     */
    static fromJson(jsonData) {
        const optimizedConverterFn = dataManager(jsonToCsvSync, extractJsonFromString);
        return optimizedConverterFn(jsonData);
    }

    /**
     * Convert JSON to CSV string (Async)
     * @param {Object|string} jsonData - JSON data or string with embedded JSON
     * @returns {Promise<string>} CSV formatted string
     */
    static async fromJsonAsync(jsonData) {
        const optimizedConverterFn = dataManagerAsync(jsonToCsv, extractJsonFromString);
        return optimizedConverterFn(jsonData);
    }

    /**
     * Convert CSV to JSON (Sync)
     * @param {string} csvString - CSV formatted string
     * @returns {Array|string} JSON result
     */
    static toJson(csvString) {
        const optimizedConverterFn = dataManager(csvToJsonSync, extractCsvFromString);
        return optimizedConverterFn(csvString);
    }

    /**
     * Convert CSV to JSON (Async)
     * @param {string} csvString - CSV formatted string
     * @returns {Promise<Array|string>} JSON result
     */
    static async toJsonAsync(csvString) {
        const optimizedConverterFn = dataManagerAsync(csvToJson, extractCsvFromString);
        return optimizedConverterFn(csvString);
    }

    /**
     * Convert YAML to CSV string (Sync)
     * @param {string} yamlString - YAML formatted string
     * @returns {string} CSV formatted string
     */
    static fromYaml(yamlString) {
        return yamlToCsvSync(yamlString);
    }

    /**
     * Convert YAML to CSV string (Async)
     * @param {string} yamlString - YAML formatted string
     * @returns {Promise<string>} CSV formatted string
     */
    static async fromYamlAsync(yamlString) {
        return yamlToCsv(yamlString);
    }

    /**
     * Convert CSV to YAML string (Sync)
     * @param {string} csvString - CSV formatted string
     * @returns {string} YAML formatted string
     */
    static toYaml(csvString) {
        const optimizedConverterFn = dataManager(csvToYamlSync, extractCsvFromString);
        return optimizedConverterFn(csvString);
    }

    /**
     * Convert CSV to YAML string (Async)
     * @param {string} csvString - CSV formatted string
     * @returns {Promise<string>} YAML formatted string
     */
    static async toYamlAsync(csvString) {
        const optimizedConverterFn = dataManagerAsync(csvToYaml, extractCsvFromString);
        return optimizedConverterFn(csvString);
    }

    /**
     * Convert XML to CSV string (Sync)
     * @param {string} xmlString - XML formatted string
     * @returns {string} CSV formatted string
     */
    static fromXml(xmlString) {
        const optimizedConverterFn = dataManager(xmlToCsvSync, extractXmlFromString);
        return optimizedConverterFn(xmlString);
    }

    /**
     * Convert XML to CSV string (Async)
     * @param {string} xmlString - XML formatted string
     * @returns {Promise<string>} CSV formatted string
     */
    static async fromXmlAsync(xmlString) {
        const optimizedConverterFn = dataManagerAsync(xmlToCsv, extractXmlFromString);
        return optimizedConverterFn(xmlString);
    }

    /**
     * Convert CSV to XML string (Sync)
     * @param {string} csvString - CSV formatted string
     * @returns {string} XML formatted string
     */
    static toXml(csvString) {
        const optimizedConverterFn = dataManager(csvToXmlSync, extractCsvFromString);
        return optimizedConverterFn(csvString);
    }

    /**
     * Convert CSV to XML string (Async)
     * @param {string} csvString - CSV formatted string
     * @returns {Promise<string>} XML formatted string
     */
    static async toXmlAsync(csvString) {
        const optimizedConverterFn = dataManagerAsync(csvToXml, extractCsvFromString);
        return optimizedConverterFn(csvString);
    }

    /**
     * Validate CSV string
     * @param {string} csvString - CSV string to validate
     * @returns {boolean} True if valid
     */
    static validate(csvString) {
        return validateCsvStringSync(csvString);
    }

    /**
     * Validate CSV string (Async)
     * @param {string} csvString - CSV string to validate
     * @returns {Promise<boolean>} True if valid
     */
    static async validateAsync(csvString) {
        return validateCsvString(csvString);
    }
}
