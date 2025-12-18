/**
 * XML Validator (for XmlConverter)
 */

import { encodeXmlReservedChars } from '../utils.js';

/**
 * Validate XML string (Sync)
 * @param {string} xmlString 
 * @returns {boolean} True if valid, throws error if invalid
 */
export function validateXmlStringSync(xmlString) {
    if (typeof xmlString !== 'string') {
        throw new Error("Input must be a string.");
    }

    let Parser;
    if (typeof DOMParser !== 'undefined') {
        Parser = DOMParser;
    } else {
        throw new Error('DOMParser is not available for validation.');
    }

    const parser = new Parser();
    const xmlDoc = parser.parseFromString(
        encodeXmlReservedChars(xmlString),
        'application/xml'
    );

    const parserError = xmlDoc.querySelector ? xmlDoc.querySelector('parsererror') :
        (xmlDoc.documentElement && xmlDoc.documentElement.nodeName === 'parsererror' ? xmlDoc.documentElement : null);

    if (parserError) {
        throw new Error(`Invalid XML: ${parserError.textContent}`);
    }

    return true;
}

/**
 * Validate XML string (Async)
 * @param {string} xmlString 
 * @returns {Promise<boolean>} True if valid
 */
export async function validateXmlString(xmlString) {
    if (typeof DOMParser === 'undefined') {
        try {
            const { DOMParser: NodeDOMParser } = await import('xmldom');
            global.DOMParser = NodeDOMParser;
        } catch (e) { }
    }
    return validateXmlStringSync(xmlString);
}
