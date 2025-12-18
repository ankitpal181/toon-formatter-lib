/**
 * XML <-> JSON Converter (for JsonConverter)
 */

import { encodeXmlReservedChars, extractJsonFromString, extractXmlFromString, buildTag } from '../utils.js';

// --- Internal Helper Logic ---

function xmlDomToJson(xml) {
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

            const childJson = xmlDomToJson(item);

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

// --- Exports ---

/**
 * Convert XML string to JSON object (Sync)
 * @param {string} xmlString 
 * @returns {Object} JSON object
 */
export function xmlToJsonSync(xmlString) {
    if (!xmlString || typeof xmlString !== 'string') {
        throw new Error('Input must be a non-empty string');
    }

    let convertedText = xmlString;
    let iterationCount = 0;
    const maxIterations = 100;
    let wasModified = false;

    const firstExtract = extractXmlFromString(xmlString);
    if (firstExtract === xmlString.trim()) {
        return parseXmlStringDirectly(xmlString);
    }

    while (iterationCount < maxIterations) {
        const xmlBlock = extractXmlFromString(convertedText);
        if (!xmlBlock) break;

        try {
            const jsonObject = parseXmlStringDirectly(xmlBlock);
            const jsonOutput = JSON.stringify(jsonObject);
            convertedText = convertedText.replace(xmlBlock, jsonOutput);
            wasModified = true;
            iterationCount++;
        } catch (e) {
            break;
        }
    }

    if (wasModified) return convertedText;

    try {
        return parseXmlStringDirectly(xmlString);
    } catch (e) {
        return xmlString;
    }
}

// Helper for strict parsing to object
function parseXmlStringDirectly(xmlString) {
    let Parser;
    if (typeof DOMParser !== 'undefined') {
        Parser = DOMParser;
    } else {
        throw new Error('DOMParser is not available. Please polyfill global.DOMParser for synchronous XML conversion in Node.js.');
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
    const data = {};
    data[rootElement.nodeName] = xmlDomToJson(rootElement);
    return data;
}

/**
 * Convert XML string to JSON object (Async)
 * @param {string} xmlString 
 * @returns {Promise<Object>} JSON object
 */
export async function xmlToJson(xmlString) {
    if (typeof DOMParser === 'undefined') {
        try {
            const { DOMParser: NodeDOMParser } = await import('xmldom');
            global.DOMParser = NodeDOMParser;
        } catch (e) { }
    }
    return xmlToJsonSync(xmlString);
}

/**
 * Convert JSON object to XML string (Sync)
 * @param {Object|string} data - JSON data or mixed text
 * @returns {string} XML string
 */
export function jsonToXmlSync(data) {
    if (typeof data === 'string') {
        let convertedText = data;
        let iterationCount = 0;
        const maxIterations = 100;
        let wasModified = false;

        const firstExtract = extractJsonFromString(data);
        if (firstExtract && firstExtract === data.trim()) {
            try {
                const obj = JSON.parse(firstExtract);
                let xml = "";
                for (const k in obj) xml += buildTag(k, obj[k]);
                return xml;
            } catch (e) { }
        }

        while (iterationCount < maxIterations) {
            const jsonString = extractJsonFromString(convertedText);
            if (!jsonString) break;

            try {
                const jsonObject = JSON.parse(jsonString);
                let xmlOutput = "";
                for (const k in jsonObject) xmlOutput += buildTag(k, jsonObject[k]);
                convertedText = convertedText.replace(jsonString, xmlOutput);
                wasModified = true;
                iterationCount++;
            } catch (e) { break; }
        }

        if (wasModified) return convertedText;

        try {
            const obj = JSON.parse(data);
            let xml = "";
            for (const k in obj) xml += buildTag(k, obj[k]);
            return xml;
        } catch (e) { return data; }
    }

    let xml = "";
    for (const k in data) xml += buildTag(k, data[k]);
    return xml;
}

/**
 * Convert JSON object to XML string (Async)
 * @param {Object|string} jsonObject 
 * @returns {Promise<string>} XML string
 */
export async function jsonToXml(jsonObject) {
    return jsonToXmlSync(jsonObject);
}
