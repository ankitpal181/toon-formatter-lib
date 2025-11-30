/**
 * XML ↔ TOON Converter
 * Note: This module is designed for Node.js environments
 */

import { jsonToToonSync, toonToJsonSync } from './json.js';
import { encodeXmlReservedChars, extractXmlFromString } from './utils.js';

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
            const childJson = xmlToJsonObject(item);

            if (childJson === undefined) continue;

            if (obj[nodeName] === undefined) {
                obj[nodeName] = childJson;
            } else {
                // Handle multiple children with the same tag name (create an array)
                if (typeof obj[nodeName].push === "undefined") {
                    const old = obj[nodeName];
                    obj[nodeName] = [];
                    obj[nodeName].push(old);
                }
                obj[nodeName].push(childJson);
            }
        }
    }

    // Clean up: If the object only contains text and no attributes/children, return the text directly
    if (Object.keys(obj).length === 1 && obj['#text'] !== undefined) {
        return obj['#text'];
    }

    return obj;
}

/**
 * Converts JSON object to XML string
 * @param {Object} obj - JSON object
 * @returns {string} XML string
 */
function jsonObjectToXml(obj) {
    let xml = '';

    for (const key in obj) {
        if (!obj.hasOwnProperty(key)) continue;

        const value = obj[key];

        if (key === "#text") {
            // Handle text content directly
            xml += value;
        }
        else if (key === '@attributes' && typeof value === 'object') {
            // Handle attributes: Convert { "@attributes": { "id": "1" } } to id="1"
            let attrString = '';
            for (const attrKey in value) {
                attrString += ` ${attrKey}="${value[attrKey]}"`;
            }
            xml += attrString;
        }
        else if (Array.isArray(value)) {
            // Handle arrays: Loop and create a tag for each item
            value.forEach(item => {
                if (typeof item === 'object') {
                    const innerContent = jsonObjectToXml(item);
                    const attrMatch = innerContent.match(/^(\s+[^\s=]+="[^"]*")*/);
                    const attrs = attrMatch ? attrMatch[0] : "";
                    const body = innerContent.slice(attrs.length);

                    xml += `<${key}${attrs}>${body}</${key}>`;
                } else {
                    xml += `<${key}>${item}</${key}>`;
                }
            });
        }
        else if (typeof value === 'object' && value !== null) {
            // Handle nested objects: Recurse and wrap in the current key's tag
            const innerContent = jsonObjectToXml(value);
            const attrMatch = innerContent.match(/^(\s+[^\s=]+="[^"]*")*/);
            const attrs = attrMatch ? attrMatch[0] : "";
            const body = innerContent.slice(attrs.length);

            xml += `<${key}${attrs}>${body}</${key}>`;
        }
        else if (value !== null && value !== undefined) {
            // Handle primitive values: Create a simple tag
            xml += `<${key}>${value}</${key}>`;
        }
    }
    return xml;
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

    // Check for parser errors (works in both browser and xmldom)
    if (xmlDoc.querySelector) {
        // Browser environment
        const parserError = xmlDoc.querySelector('parsererror');
        if (parserError) {
            throw new Error(parserError.textContent);
        }
    } else {
        // xmldom environment - check documentElement
        if (xmlDoc.documentElement && xmlDoc.documentElement.nodeName === 'parsererror') {
            throw new Error(xmlDoc.documentElement.textContent || 'XML parsing error');
        }
    }

    const jsonObject = xmlToJsonObject(xmlDoc);
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
        } catch (e) {
            // Ignore if import fails, xmlToToonSync will throw appropriate error
        }
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
    return jsonObjectToXml(jsonObject);
}

/**
 * Converts TOON to XML format (Async)
 * @param {string} toonString - TOON formatted string
 * @returns {Promise<string>} XML formatted string
 */
export async function toonToXml(toonString) {
    return toonToXmlSync(toonString);
}
