/**
 * XML ↔ TOON Converter
 * Note: This module is designed for Node.js environments
 */

import { jsonToToon, toonToJson } from './json.js';
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
 * Converts XML to TOON format
 * @param {string} xmlString - XML formatted string
 * @returns {Promise<string>} TOON formatted string
 * @throws {Error} If XML is invalid or DOMParser is not available
 */
export async function xmlToToon(xmlString) {
    if (!xmlString || typeof xmlString !== 'string') {
        throw new Error('Input must be a non-empty string');
    }

    // Check if we're in a browser environment
    if (typeof DOMParser !== 'undefined') {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(
            encodeXmlReservedChars(xmlString),
            'application/xml'
        );

        const parserError = xmlDoc.querySelector('parsererror');
        if (parserError) {
            throw new Error(parserError.textContent);
        }

        const jsonObject = xmlToJsonObject(xmlDoc);
        return jsonToToon(jsonObject);
    }

    // Node.js environment - require xmldom
    try {
        const { DOMParser: NodeDOMParser } = await import('xmldom');
        const parser = new NodeDOMParser();
        const xmlDoc = parser.parseFromString(
            encodeXmlReservedChars(xmlString),
            'application/xml'
        );

        const jsonObject = xmlToJsonObject(xmlDoc);
        return jsonToToon(jsonObject);
    } catch (error) {
        throw new Error('XML parsing requires DOMParser (browser) or xmldom package (Node.js). Install xmldom: npm install xmldom');
    }
}

/**
 * Converts TOON to XML format
 * @param {string} toonString - TOON formatted string
 * @returns {string} XML formatted string
 * @throws {Error} If TOON is invalid
 */
export function toonToXml(toonString) {
    if (!toonString || typeof toonString !== 'string') {
        throw new Error('Input must be a non-empty string');
    }

    const jsonObject = toonToJson(toonString);
    return jsonObjectToXml(jsonObject);
}

/**
 * Converts mixed text containing XML to TOON format
 * Extracts all XML elements from text and converts them to TOON
 * @param {string} text - Text containing one or more XML elements
 * @returns {Promise<string>} Text with XML converted to TOON
 * @throws {Error} If XML is invalid
 */
export async function xmlTextToToon(text) {
    if (!text || typeof text !== 'string') {
        throw new Error('Input must be a non-empty string');
    }

    let convertedText = text;
    let iterationCount = 0;
    const maxIterations = 100; // Prevent infinite loops

    while (iterationCount < maxIterations) {
        const xmlString = extractXmlFromString(convertedText);
        
        if (!xmlString) {
            // No more XML found
            break;
        }

        try {
            const toonString = await xmlToToon(xmlString);
            const toonOutput = toonString.trim();
            convertedText = convertedText.replace(xmlString, toonOutput);
            iterationCount++;
        } catch (e) {
            throw new Error(`Invalid XML: ${e.message}`);
        }
    }

    return convertedText;
}
