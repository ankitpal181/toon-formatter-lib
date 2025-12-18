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
import { Encryptor } from './encryptor.js';
import { JsonConverter } from './json_formatter/index.js';
import { YamlConverter } from './yaml_formatter/index.js';
import { XmlConverter } from './xml_formatter/index.js';
import { CsvConverter } from './csv_formatter/index.js';

// Exports
export {
    jsonToToonSync, jsonToToon, toonToJsonSync, toonToJson,
    yamlToToonSync, yamlToToon, toonToYamlSync, toonToYaml,
    xmlToToonSync, xmlToToon, toonToXmlSync, toonToXml,
    csvToToonSync, csvToToon, toonToCsvSync, toonToCsv,
    validateToonString, validateToonStringSync,
    encodeXmlReservedChars, splitByDelimiter, parseValue, formatValue,
    extractJsonFromString, extractXmlFromString, extractCsvFromString,
    Encryptor,
    JsonConverter,
    YamlConverter,
    XmlConverter,
    CsvConverter
};

/**
 * Main converter class for TOON format conversions
 * 
 * Supports both static usage (backward compatible) and instance usage (with encryption).
 * 
 * @example
 * // Static usage (no encryption) - backward compatible
 * const toon = ToonConverter.fromJson({ name: "Alice" });
 * 
 * @example
 * // Instance usage with encryption
 * const key = Encryptor.generateKey();
 * const encryptor = new Encryptor(key, 'aes-256-gcm');
 * const converter = new ToonConverter(encryptor);
 * const encrypted = converter.fromJson({ name: "Alice" }, { conversionMode: 'export' });
 */
export class ToonConverter {
    /**
     * Creates a ToonConverter instance
     * @param {Encryptor|null} [encryptor=null] - Optional Encryptor instance for encryption support
     * @example
     * // Without encryption
     * const converter = new ToonConverter();
     * 
     * @example
     * // With encryption
     * const key = Encryptor.generateKey();
     * const encryptor = new Encryptor(key, 'aes-256-gcm');
     * const converter = new ToonConverter(encryptor);
     */
    constructor(encryptor = null) {
        this.encryptor = encryptor;
    }

    // ========================================
    // Private Helper Methods
    // ========================================

    /**
     * Applies encryption logic based on conversion mode (synchronous)
     * @private
     * @param {Function} converterFn - The converter function to call
     * @param {*} data - Data to convert
     * @param {string} mode - Conversion mode: 'no_encryption', 'middleware', 'ingestion', 'export'
     * @returns {*} Converted (and possibly encrypted) data
     */
    _convertWithEncryption(converterFn, data, mode) {
        // If no encryptor or mode is 'no_encryption', just convert normally
        if (!this.encryptor || mode === 'no_encryption') {
            return converterFn(data);
        }

        switch (mode) {
            case 'middleware':
                // Encrypted → Encrypted (Decrypt → Convert → Re-encrypt)
                const decrypted = this.encryptor.decrypt(data);
                const converted = converterFn(decrypted);
                return this.encryptor.encrypt(converted);

            case 'ingestion':
                // Encrypted → Plain (Decrypt → Convert)
                const decryptedData = this.encryptor.decrypt(data);
                return converterFn(decryptedData);

            case 'export':
                // Plain → Encrypted (Convert → Encrypt)
                const plainConverted = converterFn(data);
                return this.encryptor.encrypt(plainConverted);

            default:
                return converterFn(data);
        }
    }

    /**
     * Applies encryption logic based on conversion mode (asynchronous)
     * @private
     * @param {Function} converterFn - The async converter function to call
     * @param {*} data - Data to convert
     * @param {string} mode - Conversion mode: 'no_encryption', 'middleware', 'ingestion', 'export'
     * @returns {Promise<*>} Converted (and possibly encrypted) data
     */
    async _convertWithEncryptionAsync(converterFn, data, mode) {
        // If no encryptor or mode is 'no_encryption', just convert normally
        if (!this.encryptor || mode === 'no_encryption') {
            return await converterFn(data);
        }

        switch (mode) {
            case 'middleware':
                // Encrypted → Encrypted (Decrypt → Convert → Re-encrypt)
                const decrypted = this.encryptor.decrypt(data);
                const converted = await converterFn(decrypted);
                return this.encryptor.encrypt(converted);

            case 'ingestion':
                // Encrypted → Plain (Decrypt → Convert)
                const decryptedData = this.encryptor.decrypt(data);
                return await converterFn(decryptedData);

            case 'export':
                // Plain → Encrypted (Convert → Encrypt)
                const plainConverted = await converterFn(data);
                return this.encryptor.encrypt(plainConverted);

            default:
                return await converterFn(data);
        }
    }

    // ========================================
    // Instance Methods (Support Encryption)
    // ========================================

    /**
     * Convert JSON to TOON (Sync, Instance Method)
     * @param {*} jsonData - JSON data (object, array, or primitive)
     * @param {Object} [options={}] - Conversion options
     * @param {string} [options.conversionMode='no_encryption'] - Encryption mode: 'no_encryption', 'middleware', 'ingestion', 'export'
     * @returns {string} TOON formatted string (possibly encrypted)
     */
    fromJson(jsonData, options = {}) {
        const { conversionMode = 'no_encryption' } = options;
        return this._convertWithEncryption(jsonToToonSync, jsonData, conversionMode);
    }

    /**
     * Convert JSON to TOON (Async, Instance Method)
     * @param {*} jsonData - JSON data
     * @param {Object} [options={}] - Conversion options
     * @param {string} [options.conversionMode='no_encryption'] - Encryption mode
     * @returns {Promise<string>} TOON formatted string (possibly encrypted)
     */
    async fromJsonAsync(jsonData, options = {}) {
        const { conversionMode = 'no_encryption' } = options;
        return this._convertWithEncryptionAsync(jsonToToon, jsonData, conversionMode);
    }

    /**
     * Convert TOON to JSON (Sync, Instance Method)
     * @param {string} toonString - TOON formatted string (possibly encrypted)
     * @param {Object} [options={}] - Conversion options
     * @param {string} [options.conversionMode='no_encryption'] - Encryption mode
     * @param {boolean} [options.returnJson=false] - If true, returns JSON string; if false, returns object
     * @returns {*} Parsed JSON data (object or string)
     */
    toJson(toonString, options = {}) {
        const { conversionMode = 'no_encryption', returnJson = false } = options;
        return this._convertWithEncryption(
            (data) => toonToJsonSync(data, returnJson),
            toonString,
            conversionMode
        );
    }

    /**
     * Convert TOON to JSON (Async, Instance Method)
     * @param {string} toonString - TOON formatted string (possibly encrypted)
     * @param {Object} [options={}] - Conversion options
     * @param {string} [options.conversionMode='no_encryption'] - Encryption mode
     * @param {boolean} [options.returnJson=false] - If true, returns JSON string; if false, returns object
     * @returns {Promise<*>} Parsed JSON data (object or string)
     */
    async toJsonAsync(toonString, options = {}) {
        const { conversionMode = 'no_encryption', returnJson = false } = options;
        return this._convertWithEncryptionAsync(
            (data) => toonToJson(data, returnJson),
            toonString,
            conversionMode
        );
    }

    /**
     * Convert YAML to TOON (Sync, Instance Method)
     * @param {string} yamlString - YAML formatted string (possibly encrypted)
     * @param {Object} [options={}] - Conversion options
     * @param {string} [options.conversionMode='no_encryption'] - Encryption mode
     * @returns {string} TOON formatted string (possibly encrypted)
     */
    fromYaml(yamlString, options = {}) {
        const { conversionMode = 'no_encryption' } = options;
        return this._convertWithEncryption(yamlToToonSync, yamlString, conversionMode);
    }

    /**
     * Convert YAML to TOON (Async, Instance Method)
     * @param {string} yamlString - YAML formatted string (possibly encrypted)
     * @param {Object} [options={}] - Conversion options
     * @param {string} [options.conversionMode='no_encryption'] - Encryption mode
     * @returns {Promise<string>} TOON formatted string (possibly encrypted)
     */
    async fromYamlAsync(yamlString, options = {}) {
        const { conversionMode = 'no_encryption' } = options;
        return this._convertWithEncryptionAsync(yamlToToon, yamlString, conversionMode);
    }

    /**
     * Convert TOON to YAML (Sync, Instance Method)
     * @param {string} toonString - TOON formatted string (possibly encrypted)
     * @param {Object} [options={}] - Conversion options
     * @param {string} [options.conversionMode='no_encryption'] - Encryption mode
     * @returns {string} YAML formatted string
     */
    toYaml(toonString, options = {}) {
        const { conversionMode = 'no_encryption' } = options;
        return this._convertWithEncryption(toonToYamlSync, toonString, conversionMode);
    }

    /**
     * Convert TOON to YAML (Async, Instance Method)
     * @param {string} toonString - TOON formatted string (possibly encrypted)
     * @param {Object} [options={}] - Conversion options
     * @param {string} [options.conversionMode='no_encryption'] - Encryption mode
     * @returns {Promise<string>} YAML formatted string
     */
    async toYamlAsync(toonString, options = {}) {
        const { conversionMode = 'no_encryption' } = options;
        return this._convertWithEncryptionAsync(toonToYaml, toonString, conversionMode);
    }

    /**
     * Convert XML to TOON (Sync, Instance Method)
     * @param {string} xmlString - XML formatted string (possibly encrypted)
     * @param {Object} [options={}] - Conversion options
     * @param {string} [options.conversionMode='no_encryption'] - Encryption mode
     * @returns {string} TOON formatted string (possibly encrypted)
     */
    fromXml(xmlString, options = {}) {
        const { conversionMode = 'no_encryption' } = options;
        return this._convertWithEncryption(xmlToToonSync, xmlString, conversionMode);
    }

    /**
     * Convert XML to TOON (Async, Instance Method)
     * @param {string} xmlString - XML formatted string (possibly encrypted)
     * @param {Object} [options={}] - Conversion options
     * @param {string} [options.conversionMode='no_encryption'] - Encryption mode
     * @returns {Promise<string>} TOON formatted string (possibly encrypted)
     */
    async fromXmlAsync(xmlString, options = {}) {
        const { conversionMode = 'no_encryption' } = options;
        return this._convertWithEncryptionAsync(xmlToToon, xmlString, conversionMode);
    }

    /**
     * Convert TOON to XML (Sync, Instance Method)
     * @param {string} toonString - TOON formatted string (possibly encrypted)
     * @param {Object} [options={}] - Conversion options
     * @param {string} [options.conversionMode='no_encryption'] - Encryption mode
     * @returns {string} XML formatted string
     */
    toXml(toonString, options = {}) {
        const { conversionMode = 'no_encryption' } = options;
        return this._convertWithEncryption(toonToXmlSync, toonString, conversionMode);
    }

    /**
     * Convert TOON to XML (Async, Instance Method)
     * @param {string} toonString - TOON formatted string (possibly encrypted)
     * @param {Object} [options={}] - Conversion options
     * @param {string} [options.conversionMode='no_encryption'] - Encryption mode
     * @returns {Promise<string>} XML formatted string
     */
    async toXmlAsync(toonString, options = {}) {
        const { conversionMode = 'no_encryption' } = options;
        return this._convertWithEncryptionAsync(toonToXml, toonString, conversionMode);
    }

    /**
     * Convert CSV to TOON (Sync, Instance Method)
     * @param {string} csvString - CSV formatted string (possibly encrypted)
     * @param {Object} [options={}] - Conversion options
     * @param {string} [options.conversionMode='no_encryption'] - Encryption mode
     * @returns {string} TOON formatted string (possibly encrypted)
     */
    fromCsv(csvString, options = {}) {
        const { conversionMode = 'no_encryption' } = options;
        return this._convertWithEncryption(csvToToonSync, csvString, conversionMode);
    }

    /**
     * Convert CSV to TOON (Async, Instance Method)
     * @param {string} csvString - CSV formatted string (possibly encrypted)
     * @param {Object} [options={}] - Conversion options
     * @param {string} [options.conversionMode='no_encryption'] - Encryption mode
     * @returns {Promise<string>} TOON formatted string (possibly encrypted)
     */
    async fromCsvAsync(csvString, options = {}) {
        const { conversionMode = 'no_encryption' } = options;
        return this._convertWithEncryptionAsync(csvToToon, csvString, conversionMode);
    }

    /**
     * Convert TOON to CSV (Sync, Instance Method)
     * @param {string} toonString - TOON formatted string (possibly encrypted)
     * @param {Object} [options={}] - Conversion options
     * @param {string} [options.conversionMode='no_encryption'] - Encryption mode
     * @returns {string} CSV formatted string
     */
    toCsv(toonString, options = {}) {
        const { conversionMode = 'no_encryption' } = options;
        return this._convertWithEncryption(toonToCsvSync, toonString, conversionMode);
    }

    /**
     * Convert TOON to CSV (Async, Instance Method)
     * @param {string} toonString - TOON formatted string (possibly encrypted)
     * @param {Object} [options={}] - Conversion options
     * @param {string} [options.conversionMode='no_encryption'] - Encryption mode
     * @returns {Promise<string>} CSV formatted string
     */
    async toCsvAsync(toonString, options = {}) {
        const { conversionMode = 'no_encryption' } = options;
        return this._convertWithEncryptionAsync(toonToCsv, toonString, conversionMode);
    }

    /**
     * Validate a TOON string (Instance Method)
     * Note: Validation does not support encryption modes
     * @param {string} toonString - TOON formatted string to validate
     * @returns {{isValid: boolean, error: string|null}} Validation result
     */
    validate(toonString) {
        return validateToonStringSync(toonString);
    }

    /**
     * Validate a TOON string (Async, Instance Method)
     * Note: Validation does not support encryption modes
     * @param {string} toonString - TOON formatted string to validate
     * @returns {Promise<{isValid: boolean, error: string|null}>} Validation result
     */
    async validateAsync(toonString) {
        return validateToonString(toonString);
    }

    // ========================================
    // Static Methods (Backward Compatibility)
    // ========================================

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
     * Convert TOON to JSON (Sync, Static Method)
     * @param {string} toonString - TOON formatted string
     * @param {boolean} [returnJson=false] - If true, returns JSON string; if false, returns object
     * @returns {*} Parsed JSON data (object or string)
     */
    static toJson(toonString, returnJson = false) {
        return toonToJsonSync(toonString, returnJson);
    }

    /**
     * Convert TOON to JSON (Async, Static Method)
     * @param {string} toonString - TOON formatted string
     * @param {boolean} [returnJson=false] - If true, returns JSON string; if false, returns object
     * @returns {Promise<*>} Parsed JSON data (object or string)
     */
    static async toJsonAsync(toonString, returnJson = false) {
        return toonToJson(toonString, returnJson);
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
