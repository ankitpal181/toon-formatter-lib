/**
 * CSV <-> JSON Converter (for JsonConverter)
 */

import Papa from 'papaparse';
import { extractCsvFromString, extractJsonFromString, flattenObject, unflattenObject } from '../utils.js';

/**
 * Convert CSV string to JSON object (Array of rows) (Sync)
 * @param {string} csvString 
 * @returns {Array<Object>|string} JSON object or mixed text
 */
export function csvToJsonSync(csvString) {
    if (!csvString || typeof csvString !== 'string') {
        throw new Error('Input must be a non-empty string');
    }

    let convertedText = csvString;
    let iterationCount = 0;
    const maxIterations = 100;
    let wasModified = false;

    // Check if pure CSV first
    const firstExtract = extractCsvFromString(csvString);
    if (firstExtract === csvString.trim()) {
        const json = parseCsvDirectly(csvString);
        return Array.isArray(json) ? json.map(row => unflattenObject(row)) : unflattenObject(json);
    }

    while (iterationCount < maxIterations) {
        const csvBlock = extractCsvFromString(convertedText);
        if (!csvBlock) break;

        try {
            const jsonObject = parseCsvDirectly(csvBlock);
            const processedJson = Array.isArray(jsonObject) ? jsonObject.map(row => unflattenObject(row)) : unflattenObject(jsonObject);
            const jsonOutput = JSON.stringify(processedJson);
            convertedText = convertedText.replace(csvBlock, jsonOutput);
            wasModified = true;
            iterationCount++;
        } catch (e) {
            break;
        }
    }

    if (wasModified) return convertedText;

    try {
        const json = parseCsvDirectly(csvString);
        return Array.isArray(json) ? json.map(row => unflattenObject(row)) : unflattenObject(json);
    } catch (e) {
        return csvString;
    }
}

function parseCsvDirectly(csvString) {
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
    return jsonObject;
}

/**
 * Convert CSV string to JSON object (Array of rows) (Async)
 * @param {string} csvString 
 * @returns {Promise<Array<Object>>} JSON object
 */
export async function csvToJson(csvString) {
    const res = csvToJsonSync(csvString);
    if (typeof res === 'string' && res.trim().startsWith('[') || res.trim().startsWith('{')) {
        try {
            return JSON.parse(res);
        } catch (e) { }
    }
    return res;
}

/**
 * Convert JSON object to CSV string (Sync)
 * @param {Array<Object>|Object|string} data 
 * @returns {string} CSV string
 */
export function jsonToCsvSync(data) {
    if (typeof data === 'string') {
        let convertedText = data;
        let iterationCount = 0;
        const maxIterations = 100;
        let wasModified = false;

        const firstExtract = extractJsonFromString(data);
        if (firstExtract && firstExtract === data.trim()) {
            try {
                const obj = JSON.parse(firstExtract);
                const flatData = Array.isArray(obj) ? obj.map(row => flattenObject(row)) : [flattenObject(obj)];
                return Papa.unparse(flatData, { header: true });
            } catch (e) { }
        }

        while (iterationCount < maxIterations) {
            const jsonString = extractJsonFromString(convertedText);
            if (!jsonString) break;
            try {
                const jsonObject = JSON.parse(jsonString);
                const flatData = Array.isArray(jsonObject) ? jsonObject.map(row => flattenObject(row)) : [flattenObject(jsonObject)];
                const csvOutput = Papa.unparse(flatData, { header: true });
                convertedText = convertedText.replace(jsonString, csvOutput);
                wasModified = true;
                iterationCount++;
            } catch (e) { break; }
        }

        if (wasModified) return convertedText;

        try {
            const obj = JSON.parse(data);
            const flatData = Array.isArray(obj) ? obj.map(row => flattenObject(row)) : [flattenObject(obj)];
            return Papa.unparse(flatData, { header: true });
        } catch (e) { return data; }
    }

    const flatData = Array.isArray(data) ? data.map(row => flattenObject(row)) : [flattenObject(data)];
    return Papa.unparse(flatData, {
        header: true,
    });
}

/**
 * Convert JSON object (Array) to CSV string (Async)
 * @param {Array<Object>} jsonObject 
 * @returns {Promise<string>} CSV string
 */
export async function jsonToCsv(jsonObject) {
    return jsonToCsvSync(jsonObject);
}
