/**
 * CSV Validator (for CsvConverter)
 */

import Papa from 'papaparse';

/**
 * Validate CSV string (Sync)
 * @param {string} csvString 
 * @returns {boolean} True if valid, throws error if invalid
 */
export function validateCsvStringSync(csvString) {
    if (typeof csvString !== 'string') {
        throw new Error("Input must be a string.");
    }

    const results = Papa.parse(csvString, {
        header: true,
        skipEmptyLines: true,
    });

    if (results.errors && results.errors.length > 0) {
        throw new Error(`Invalid CSV: ${results.errors[0].message}`);
    }

    return true;
}

/**
 * Validate CSV string (Async)
 * @param {string} csvString 
 * @returns {Promise<boolean>} True if valid
 */
export async function validateCsvString(csvString) {
    return validateCsvStringSync(csvString);
}
