/**
 * Utility functions for TOON conversion
 */

/**
 * Encodes XML reserved characters to prevent parsing errors
 * @param {string} rawXmlString - Raw XML string
 * @returns {string} Encoded XML string
 */
export function encodeXmlReservedChars(rawXmlString) {
    if (typeof rawXmlString !== 'string') {
        return '';
    }

    let encodedString = rawXmlString;
    const ampersandRegex = /&(?!#|\w+;)/g;
    encodedString = encodedString.replace(ampersandRegex, '&amp;');
    return encodedString;
}

/**
 * Splits a string by delimiter while respecting quoted strings
 * @param {string} text - Text to split
 * @param {string} delimiter - Delimiter character
 * @returns {string[]} Array of split values
 */
export function splitByDelimiter(text, delimiter) {
    const result = [];
    let current = '';
    let inQuote = false;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (char === '"' && (i === 0 || text[i - 1] !== '\\')) {
            inQuote = !inQuote;
        }
        if (char === delimiter && !inQuote) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current);
    return result;
}

/**
 * Parses a value string into its correct JavaScript type
 * @param {string} val - Value string to parse
 * @returns {*} Parsed value (string, number, boolean, or null)
 */
export function parseValue(val) {
    val = val.trim();
    if (val === 'true') return true;
    if (val === 'false') return false;
    if (val === 'null') return null;
    if (val === '') return ""; // Empty string

    // Number check: simplified, can be improved
    if (!isNaN(Number(val)) && val !== '' && !val.startsWith('0') && val !== '0') return Number(val);
    if (val === '0') return 0;
    if (val.match(/^-?0\./)) return Number(val); // 0.5, -0.5

    // String unquoting
    if (val.startsWith('"') && val.endsWith('"')) {
        // Remove surrounding quotes and unescape internal quotes
        return val.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
    }
    return val;
}

/**
 * Formats a value according to TOON rules
 * @param {*} v - Value to format
 * @returns {string} Formatted value
 */
export function formatValue(v) {
    if (v === null) return "null";
    if (typeof v === "string") return `"${v.replace(/"/g, '\\"')}"`;
    return v; // number, boolean
}
