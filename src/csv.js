/**
 * CSV ↔ TOON Converter
 */

import Papa from 'papaparse';
import { jsonToToon, toonToJson } from './json.js';
import { extractCsvFromString } from './utils.js';
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

/**
 * Converts mixed text containing CSV to TOON format
 * Extracts all CSV data from text and converts it to TOON
 * @param {string} text - Text containing CSV data
 * @returns {Promise<string>} Text with CSV converted to TOON
 * @throws {Error} If CSV is invalid
 */
export async function csvTextToToon(text) {
    if (!text || typeof text !== 'string') {
        throw new Error('Input must be a non-empty string');
    }

    let convertedText = text;
    let iterationCount = 0;
    const maxIterations = 100; // Prevent infinite loops

    while (iterationCount < maxIterations) {
        const csvString = extractCsvFromString(convertedText);

        if (!csvString) {
            // No more CSV found
            break;
        }

        try {
            const toonString = await csvToToon(csvString);
            const toonOutput = toonString.trim();
            convertedText = convertedText.replace(csvString, toonOutput);
            iterationCount++;
        } catch (e) {
            throw new Error(`Invalid CSV: ${e.message}`);
        }
    }

    return convertedText;
}

/**
 * Converts mixed text containing CSV to TOON format (synchronous)
 * Extracts all CSV data from text and converts it to TOON
 * @param {string} text - Text containing CSV data
 * @returns {string} Text with CSV converted to TOON
 * @throws {Error} If CSV is invalid
 */
export function csvTextToToonSync(text) {
    if (!text || typeof text !== 'string') {
        throw new Error('Input must be a non-empty string');
    }

    let convertedText = text;
    let iterationCount = 0;
    const maxIterations = 100; // Prevent infinite loops

    while (iterationCount < maxIterations) {
        const csvString = extractCsvFromString(convertedText);

        if (!csvString) {
            // No more CSV found
            break;
        }

        try {
            const toonString = csvToToonSync(csvString);
            const toonOutput = toonString.trim();
            convertedText = convertedText.replace(csvString, toonOutput);
            iterationCount++;
        } catch (e) {
            throw new Error(`Invalid CSV: ${e.message}`);
        }
    }

    return convertedText;
}
