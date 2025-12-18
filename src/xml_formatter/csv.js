/**
 * CSV <-> XML Converter (for XmlConverter)
 */

import { extractCsvFromString, extractJsonFromString, extractXmlFromString } from '../utils.js';
import { csvToJsonSync, jsonToCsvSync } from '../json_formatter/csv.js';
import { jsonToXmlSync, xmlToJsonSync } from '../json_formatter/xml.js';

/**
 * Convert CSV string to XML string (Sync)
 * Supports mixed text CSV.
 * @param {string} csvString 
 * @returns {string} XML string
 */
export function csvToXmlSync(csvString) {
    if (!csvString || typeof csvString !== 'string') {
        throw new Error('Input must be a non-empty string');
    }

    let convertedText = csvString;
    let iterationCount = 0;
    const maxIterations = 100;
    let wasModified = false;

    // Check pure CSV
    const firstExtract = extractCsvFromString(csvString);
    if (firstExtract === csvString.trim()) {
        const json = csvToJsonSync(csvString);
        return jsonToXmlSync(json);
    }

    // Mixed Loop
    while (iterationCount < maxIterations) {
        const csvBlock = extractCsvFromString(convertedText);
        if (!csvBlock) break;

        try {
            const jsonObject = csvToJsonSync(csvBlock);
            const xmlOutput = jsonToXmlSync(jsonObject);
            convertedText = convertedText.replace(csvBlock, xmlOutput);
            wasModified = true;
            iterationCount++;
        } catch (e) {
            break;
        }
    }

    if (wasModified) return convertedText;

    try {
        const json = csvToJsonSync(csvString);
        return jsonToXmlSync(json);
    } catch (e) {
        return csvString;
    }
}

/**
 * Convert CSV string to XML string (Async)
 * @param {string} csvString 
 * @returns {Promise<string>} XML string
 */
export async function csvToXml(csvString) {
    return csvToXmlSync(csvString);
}

/**
 * Convert XML string to CSV string (Sync)
 * Supports mixed text XML.
 * @param {string} xmlString 
 * @returns {string} CSV string
 */
export function xmlToCsvSync(xmlString) {
    if (!xmlString || typeof xmlString !== 'string') {
        throw new Error('Input must be a non-empty string');
    }

    let convertedText = xmlString;
    let iterationCount = 0;
    const maxIterations = 100;
    let wasModified = false;

    // Check pure XML
    const firstExtract = extractXmlFromString(xmlString);
    if (firstExtract === xmlString.trim()) {
        const json = xmlToJsonSync(xmlString);
        return jsonToCsvSync(json);
    }

    while (iterationCount < maxIterations) {
        const xmlBlock = extractXmlFromString(convertedText);
        if (!xmlBlock) break;

        try {
            const jsonObject = xmlToJsonSync(xmlBlock);
            const csvOutput = jsonToCsvSync(jsonObject);
            convertedText = convertedText.replace(xmlBlock, csvOutput);
            wasModified = true;
            iterationCount++;
        } catch (e) {
            break;
        }
    }

    if (wasModified) return convertedText;

    try {
        const json = xmlToJsonSync(xmlString);
        return jsonToCsvSync(json);
    } catch (e) {
        return xmlString;
    }
}

/**
 * Convert XML string to CSV string (Async)
 * @param {string} xmlString 
 * @returns {Promise<string>} CSV string
 */
export async function xmlToCsv(xmlString) {
    return xmlToCsvSync(xmlString);
}
