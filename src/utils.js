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
    // Replace & with &amp; but not if it's already an entity
    return rawXmlString.replace(/&(?!#|\w+;)/g, '&amp;');
}

/**
 * Sanitizes a string for use as an XML tag name.
 * @param {string} name 
 * @returns {string} Sanitized name
 */
export function sanitizeTagName(name) {
    if (typeof name !== 'string' || !name) {
        return '_';
    }

    let sanitized = name;
    // If name starts with non-letter/underscore (e.g. digit), prepend underscore
    if (/^[^a-zA-Z_]/.test(sanitized)) {
        sanitized = '_' + sanitized;
    }

    // Replace invalid chars with underscore
    return sanitized.replace(/[^a-zA-Z0-9_.]/g, '_');
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

    // Number check
    if (val === '0') return 0;

    // If it starts with 0 but is not a decimal, it's a string (e.g. "0123")
    if (val.startsWith('0') && !val.startsWith('0.') && val.length > 1) {
        // String
    } else {
        const num = Number(val);
        if (!isNaN(num) && val !== '') return num;
    }

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
    if (v === true) return "true";
    if (v === false) return "false";
    if (typeof v === "string") return `"${v.replace(/"/g, '\\"')}"`;
    return String(v);
}

/**
 * Extracts JSON from mixed text
 * @param {string} text - Text containing JSON
 * @returns {string|null} Extracted JSON string or null
 */
export function extractJsonFromString(text) {
    if (!text || typeof text !== 'string') return null;

    let searchStart = 0;

    while (searchStart < text.length) {
        let startIndex = -1;

        // Find first potential start
        for (let i = searchStart; i < text.length; i++) {
            if (text[i] === '{' || text[i] === '[') {
                // Ignore if preceded by non-whitespace (e.g. key[2]), 
                // unless it's a closing bracket/brace or XML tag end
                if (i > 0 && /\S/.test(text[i - 1]) && !/[\}\]>]/.test(text[i - 1])) {
                    continue;
                }
                startIndex = i;
                break;
            }
        }

        if (startIndex === -1) return null;

        let balance = 0;
        let inQuote = false;
        let escape = false;

        for (let i = startIndex; i < text.length; i++) {
            const char = text[i];

            if (escape) {
                escape = false;
                continue;
            }

            if (char === '\\') {
                escape = true;
                continue;
            }

            if (char === '"') {
                inQuote = !inQuote;
                continue;
            }

            if (!inQuote) {
                if (char === '{' || char === '[') {
                    balance++;
                } else if (char === '}' || char === ']') {
                    balance--;
                }

                if (balance === 0) {
                    const candidate = text.substring(startIndex, i + 1);


                    // Avoid matching TOON arrays (e.g. [3]: 1, 2, 3)
                    if (/^\s*\[\d+\]/.test(candidate)) {
                        searchStart = i + 1;
                        startIndex = -1;
                        break; // Break inner for loop, restart while loop from searchStart
                    }

                    try {
                        JSON.parse(candidate);
                        return candidate;
                    } catch (e) {
                        // If balanced but not valid JSON (like {id,name}), 
                        // it's likely a false start. Abandon this startIndex and try next.
                        searchStart = startIndex + 1;
                        startIndex = -1;
                        break; // Break inner for loop, restart while loop from searchStart
                    }
                }
            }
        }

        if (startIndex !== -1) {
            // Reached end without balancing for this startIndex
            searchStart = startIndex + 1;
        }
    }

    return null;
}

/**
 * Extracts XML from mixed text
 * @param {string} text - Text containing XML
 * @returns {string|null} Extracted XML string or null
 */
export function extractXmlFromString(text) {
    if (!text || typeof text !== 'string') return null;

    // Find first start tag (including self-closing)
    const startTagRegex = /<([a-zA-Z0-9_:-]+)(?:\s[^>]*)?\/?>/;
    const match = text.match(startTagRegex);

    if (!match) return null;

    const startIndex = match.index;
    const rootTagName = match[1];
    const fullMatch = match[0];

    if (fullMatch.endsWith('/>')) {
        return fullMatch;
    }

    let balance = 0;
    const tagRegex = /<\/?([a-zA-Z0-9_:-]+)(?:\s[^>]*)?\/?>/g;
    tagRegex.lastIndex = startIndex;

    let matchTag;
    while ((matchTag = tagRegex.exec(text)) !== null) {
        const fullTag = matchTag[0];
        const tagName = matchTag[1];

        if (tagName !== rootTagName) continue;

        if (fullTag.startsWith('</')) {
            balance--;
        } else if (!fullTag.endsWith('/>')) {
            balance++;
        }

        if (balance === 0) {
            return text.substring(startIndex, tagRegex.lastIndex);
        }
    }

    return null;
}

/**
 * Extracts CSV from mixed text
 * @param {string} text - Text containing CSV
 * @returns {string|null} Extracted CSV string or null
 */
export function extractCsvFromString(text) {
    if (!text || typeof text !== 'string') return null;

    const lines = text.split('\n');
    let startLineIndex = -1;

    const isJsonLike = (line) => {
        const trimmed = line.trim();
        return /^"[^"]+"\s*:/.test(trimmed) || /^[\{\[]/.test(trimmed) || /^[\}\]],?$/.test(trimmed);
    };
    const isYamlLike = (line) => {
        const trimmed = line.trim();
        return /^- /.test(trimmed) || /^[^",]+:\s/.test(trimmed);
    };
    const isXmlLike = (line) => {
        const trimmed = line.trim();
        return trimmed.startsWith('<') && trimmed.includes('>');
    };
    const isToonStructure = (line) => {
        const trimmed = line.trim();
        return /^.*?\[\d+\].*:\s*$/.test(trimmed);
    };

    let i = 0;
    while (i < lines.length) {
        const line = lines[i];

        if (isToonStructure(line)) {
            const countMatch = line.match(/\[(\d+)\]/);
            const count = countMatch ? parseInt(countMatch[1], 10) : 0;
            i += count + 1;
            continue;
        }

        const commaCount = (line.match(/,/g) || []).length;
        if (commaCount > 0) {
            if (!isJsonLike(line) && !isYamlLike(line) && !isXmlLike(line)) {
                startLineIndex = i;
                break;
            }
        }
        i++;
    }

    if (startLineIndex === -1) return null;

    const resultLines = [];
    for (let j = startLineIndex; j < lines.length; j++) {
        const line = lines[j];
        if (line.trim() === '') continue;

        const commaCount = (line.match(/,/g) || []).length;
        if (commaCount === 0 || isJsonLike(line) || isYamlLike(line) || isXmlLike(line)) {
            break;
        }
        resultLines.push(line);
    }

    const result = resultLines.join('\n').trim();

    // Avoid matching TOON arrays
    if (/^\s*(\w+)?\[\d+\]/.test(result)) {
        return null;
    }

    // Final check for JSON-like start
    if (/^[\{\[]/.test(result)) {
        return null;
    }

    return result;
}

/**
 * Flattens a JSON object/list recursivey.
 * @param {*} obj 
 * @param {string} prefix 
 * @param {Object} result 
 * @returns {Object}
 */
export function flattenObject(obj, prefix = '', result = {}) {
    if (obj === null || typeof obj === 'undefined') {
        result[prefix] = null;
        return result;
    }

    // Try parsing string if it looks like JSON
    if (typeof obj === 'string') {
        const trimmed = obj.trim();
        if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
            try {
                const parsed = JSON.parse(obj);
                return flattenObject(parsed, prefix, result);
            } catch (e) { }
        }
        result[prefix] = obj;
        return result;
    }

    if (Array.isArray(obj)) {
        for (let i = 0; i < obj.length; i++) {
            const newKey = prefix ? `${prefix}.${i}` : `${i}`;
            flattenObject(obj[i], newKey, result);
        }
    } else if (typeof obj === 'object') {
        for (const key in obj) {
            const newKey = prefix ? `${prefix}.${key}` : key;
            flattenObject(obj[key], newKey, result);
        }
    } else {
        result[prefix] = obj;
    }

    return result;
}

/**
 * Unflattens a JSON object (reverses flattening).
 * @param {Object} data 
 * @returns {Object}
 */
export function unflattenObject(data) {
    if (typeof data !== 'object' || data === null || Array.isArray(data)) {
        return data;
    }

    const hasDot = Object.keys(data).some(k => k.includes('.'));
    if (!hasDot) return data;

    const result = {};
    for (const key in data) {
        const parts = key.split('.');
        let current = result;
        for (let i = 0; i < parts.length - 1; i++) {
            const part = parts[i];
            if (!(part in current)) {
                current[part] = {};
            }
            current = current[part];
        }
        current[parts[parts.length - 1]] = data[key];
    }
    return result;
}

/**
 * Helper to build an XML tag string from a key and value object.
 * @param {string} key 
 * @param {*} value 
 * @returns {string}
 */
export function buildTag(key, value) {
    const sanitizedKey = sanitizeTagName(key);

    if (value === null || typeof value === 'undefined') {
        return `<${sanitizedKey} />`;
    }

    if (typeof value === 'object' && !Array.isArray(value)) {
        let attrs = '';
        let content = '';

        if (value['@attributes']) {
            for (const k in value['@attributes']) {
                attrs += ` ${k}="${value['@attributes'][k]}"`;
            }
        }

        for (const k in value) {
            if (k === '@attributes') continue;
            if (k === '#text') {
                content += String(value[k]);
            } else {
                const val = value[k];
                if (Array.isArray(val)) {
                    val.forEach(item => {
                        content += buildTag(k, item);
                    });
                } else {
                    content += buildTag(k, val);
                }
            }
        }
        return `<${sanitizedKey}${attrs}>${content}</${sanitizedKey}>`;
    } else if (Array.isArray(value)) {
        // This shouldn't happen if called correctly via parent, but for safety:
        return value.map(item => buildTag(key, item)).join('');
    } else {
        return `<${sanitizedKey}>${value}</${sanitizedKey}>`;
    }
}
