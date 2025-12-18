/**
 * CSV ↔ TOON Converter
 */

import Papa from 'papaparse';
import { jsonToToonSync, toonToJsonSync } from './json.js';
import { extractCsvFromString, flattenObject } from './utils.js';

/**
 * Internal core function to convert pure CSV string to TOON (Sync)
 * @param {string} csvString 
 * @returns {string}
 */
function parseCsvToToonSync(csvString) {
    const results = Papa.parse(csvString, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
    });

    if (results.errors && results.errors.length > 0) {
        throw new Error(`CSV parsing error: ${results.errors[0].message}`);
    }

    const jsonObject = results.data;

    if (typeof jsonObject !== "object" || jsonObject === null) {
        throw new Error("CSV parsing failed — cannot convert.");
    }

    return jsonToToonSync(jsonObject);
}

/**
 * Converts CSV (or mixed text with CSV) to TOON format (Sync)
 * @param {string} csvString - CSV formatted string or mixed text
 * @returns {string} TOON formatted string
 */
export function csvToToonSync(csvString) {
    if (!csvString || typeof csvString !== 'string') {
        throw new Error('Input must be a non-empty string');
    }

    let convertedText = csvString;
    let iterationCount = 0;
    const maxIterations = 100;

    while (iterationCount < maxIterations) {
        const csvBlock = extractCsvFromString(convertedText);
        if (!csvBlock) break;

        try {
            const toonString = parseCsvToToonSync(csvBlock);
            const toonOutput = toonString.trim();
            convertedText = convertedText.replace(csvBlock, toonOutput);
            iterationCount++;
        } catch (e) {
            break;
        }
    }

    return convertedText;
}

/**
 * Converts CSV (or mixed text with CSV) to TOON format (Async)
 * @param {string} csvString - CSV formatted string or mixed text
 * @returns {Promise<string>} TOON formatted string
 */
export async function csvToToon(csvString) {
    return csvToToonSync(csvString);
}

/**
 * Converts TOON to CSV format (Sync)
 * @param {string} toonString - TOON formatted string
 * @returns {string} CSV formatted string
 */
export function toonToCsvSync(toonString) {
    if (!toonString || typeof toonString !== 'string') {
        throw new Error('Input must be a non-empty string');
    }

    const jsonObject = toonToJsonSync(toonString);

    // Flatten the object for CSV
    const dataToUnparse = Array.isArray(jsonObject)
        ? jsonObject.map(row => flattenObject(row))
        : [flattenObject(jsonObject)];

    return Papa.unparse(dataToUnparse, {
        header: true,
    });
}

/**
 * Converts TOON to CSV format (Async)
 * @param {string} toonString - TOON formatted string
 * @returns {Promise<string>} CSV formatted string
 */
export async function toonToCsv(toonString) {
    return toonToCsvSync(toonString);
}
