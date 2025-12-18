/**
 * XML ↔ TOON Converter
 * Note: This module is designed for Node.js environments
 */

import { jsonToToonSync, toonToJsonSync } from './json.js';
import { encodeXmlReservedChars, extractXmlFromString, buildTag } from './utils.js';

/**
 * Converts XML DOM to JSON object
 * @param {Node} xml - XML DOM node
 * @returns {Object|string|undefined} JSON representation
 */
function xmlToJsonObject(xml) {
    let obj = {};

    if (xml.nodeType === 1) { // Element node
        if (xml.attributes && xml.attributes.length > 0) {
            obj["@attributes"] = {};
            for (let j = 0; j < xml.attributes.length; j++) {
                const attribute = xml.attributes.item(j);
                obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
            }
        }
    } else if (xml.nodeType === 3) { // Text node
        const trimmedText = xml.nodeValue.trim();
        return trimmedText === "" ? undefined : trimmedText;
    }

    if (xml.hasChildNodes && xml.hasChildNodes()) {
        for (let i = 0; i < xml.childNodes.length; i++) {
            const item = xml.childNodes.item(i);
            const nodeName = item.nodeName;

            // Skip comment nodes
            if (item.nodeType === 8) continue;

            const childJson = xmlToJsonObject(item);

            if (childJson === undefined) continue;

            if (obj[nodeName] === undefined) {
                obj[nodeName] = childJson;
            } else {
                if (!Array.isArray(obj[nodeName])) {
                    const old = obj[nodeName];
                    obj[nodeName] = [];
                    obj[nodeName].push(old);
                }
                obj[nodeName].push(childJson);
            }
        }
    }

    // Special case: if object only has #text and no attributes/children, return text directly
    const keys = Object.keys(obj);
    if (keys.length === 1 && keys[0] === '#text' && !obj['@attributes']) {
        return obj['#text'];
    }

    return obj;
}

/**
 * Internal core function to convert pure XML string to TOON (Sync)
 * @param {string} xmlString 
 * @returns {string}
 */
function parseXmlToToonSync(xmlString) {
    let Parser;

    if (typeof DOMParser !== 'undefined') {
        Parser = DOMParser;
    } else {
        throw new Error('DOMParser is not available. For synchronous XML conversion in Node.js, please use the async version `xmlToToon` or polyfill global.DOMParser.');
    }

    const parser = new Parser();
    const xmlDoc = parser.parseFromString(
        encodeXmlReservedChars(xmlString),
        'application/xml'
    );

    const parserError = xmlDoc.querySelector ? xmlDoc.querySelector('parsererror') :
        (xmlDoc.documentElement && xmlDoc.documentElement.nodeName === 'parsererror' ? xmlDoc.documentElement : null);

    if (parserError) {
        throw new Error(parserError.textContent || 'XML parsing error');
    }

    const rootElement = xmlDoc.documentElement;
    const jsonObject = {};
    jsonObject[rootElement.nodeName] = xmlToJsonObject(rootElement);

    return jsonToToonSync(jsonObject);
}

/**
 * Converts XML (or mixed text with XML) to TOON format (Synchronous)
 * @param {string} xmlString - XML formatted string or mixed text
 * @returns {string} TOON formatted string
 * @throws {Error} If XML is invalid or DOMParser is not available
 */
export function xmlToToonSync(xmlString) {
    if (!xmlString || typeof xmlString !== 'string') {
        throw new Error('Input must be a non-empty string');
    }

    let convertedText = xmlString;
    let iterationCount = 0;
    const maxIterations = 100;

    while (iterationCount < maxIterations) {
        const xmlBlock = extractXmlFromString(convertedText);
        if (!xmlBlock) break;

        try {
            const toonString = parseXmlToToonSync(xmlBlock);
            const toonOutput = toonString.trim();
            convertedText = convertedText.replace(xmlBlock, toonOutput);
            iterationCount++;
        } catch (e) {
            break;
        }
    }

    return convertedText;
}

/**
 * Converts XML (or mixed text with XML) to TOON format (Async)
 * @param {string} xmlString - XML formatted string or mixed text
 * @returns {Promise<string>} TOON formatted string
 */
export async function xmlToToon(xmlString) {
    if (typeof DOMParser === 'undefined') {
        try {
            const { DOMParser: NodeDOMParser } = await import('xmldom');
            global.DOMParser = NodeDOMParser;
        } catch (e) { }
    }
    return xmlToToonSync(xmlString);
}

/**
 * Converts TOON to XML format (Synchronous)
 * @param {string} toonString - TOON formatted string
 * @returns {string} XML formatted string
 * @throws {Error} If TOON is invalid
 */
export function toonToXmlSync(toonString) {
    if (!toonString || typeof toonString !== 'string') {
        throw new Error('Input must be a non-empty string');
    }

    const jsonObject = toonToJsonSync(toonString);
    let xml = "";
    for (const k in jsonObject) {
        xml += buildTag(k, jsonObject[k]);
    }
    return xml;
}

/**
 * Converts TOON to XML format (Async)
 * @param {string} toonString - TOON formatted string
 * @returns {Promise<string>} XML formatted string
 */
export async function toonToXml(toonString) {
    return toonToXmlSync(toonString);
}
