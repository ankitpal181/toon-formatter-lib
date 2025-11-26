/**
 * CSV ↔ TOON Converter
 */

import Papa from 'papaparse';
import { jsonToToon, toonToJson } from './json.js';

/**
 * Converts CSV to TOON format
 * @param {string} csvString - CSV formatted string
 * @returns {Promise<string>} TOON formatted string
 * @throws {Error} If CSV is invalid
 */
export function csvToToon(csvString) {
    if (!csvString || typeof csvString !== 'string') {
        throw new Error('Input must be a non-empty string');
    }

    return new Promise((resolve, reject) => {
        Papa.parse(csvString, {
            header: true,
            dynamicTyping: true,
            complete: function (results) {
                try {
                    const jsonObject = results.data;

                    if (typeof jsonObject !== "object" || jsonObject === null) {
                        throw new Error("CSV parsing failed — cannot convert.");
                    }

                    const toonString = jsonToToon(jsonObject);
                    resolve(toonString);
                } catch (error) {
                    reject(error);
                }
            },
            error: function (error) {
                reject(new Error(`CSV parsing error: ${error.message}`));
            }
        });
    });
}

/**
 * Converts CSV to TOON format (synchronous version)
 * @param {string} csvString - CSV formatted string
 * @returns {string} TOON formatted string
 * @throws {Error} If CSV is invalid
 */
export function csvToToonSync(csvString) {
    if (!csvString || typeof csvString !== 'string') {
        throw new Error('Input must be a non-empty string');
    }

    const results = Papa.parse(csvString, {
        header: true,
        dynamicTyping: true,
    });

    if (results.errors && results.errors.length > 0) {
        throw new Error(`CSV parsing error: ${results.errors[0].message}`);
    }

    const jsonObject = results.data;

    if (typeof jsonObject !== "object" || jsonObject === null) {
        throw new Error("CSV parsing failed — cannot convert.");
    }

    return jsonToToon(jsonObject);
}

/**
 * Converts TOON to CSV format
 * @param {string} toonString - TOON formatted string
 * @returns {string} CSV formatted string
 * @throws {Error} If TOON is invalid
 */
export function toonToCsv(toonString) {
    if (!toonString || typeof toonString !== 'string') {
        throw new Error('Input must be a non-empty string');
    }

    const jsonObject = toonToJson(toonString);

    const csvString = Papa.unparse(jsonObject, {
        header: true,
        dynamicTyping: true,
    });

    return csvString;
}
