/**
 * JSON ↔ TOON Converter
 */

import { formatValue, parseValue, splitByDelimiter, extractJsonFromString } from './utils.js';
import { validateToonString } from './validator.js';

/**
 * Converts JSON to TOON format
 * @param {*} data - JSON data to convert
 * @param {string} key - Current key name (for recursion)
 * @param {number} depth - Current indentation depth
 * @returns {string} TOON formatted string
 */
export function jsonToToon(data, key = '', depth = 0) {
    const indent = '  '.repeat(depth);
    const nextIndent = '  '.repeat(depth + 1);

    // ---- Primitive ----
    if (data === null || typeof data !== 'object') {
        return `${indent}${key}: ${formatValue(data)}`;
    }

    // ---- Array ----
    if (Array.isArray(data)) {
        const length = data.length;

        // Empty array
        if (length === 0) {
            return `${indent}${key}[0]:`;
        }

        // Array of primitives
        if (typeof data[0] !== 'object' || data[0] === null) {
            const values = data.map(v => formatValue(v)).join(', ');
            return `${indent}${key}[${length}]: ${values}`;
        }

        // ---- Array of objects ----

        // Determine if all fields in object are primitives
        const firstObj = data[0];
        const fields = Object.keys(firstObj);
        const isTabular = data.every(row =>
            fields.every(f =>
                row[f] === null ||
                ['string', 'number', 'boolean'].includes(typeof row[f])
            )
        );

        // ---- TABULAR ARRAY (structured array) ----
        if (isTabular) {
            const header = fields.join(',');
            const lines = [];
            lines.push(`${indent}${key}[${length}]{${header}}:`);

            data.forEach(row => {
                const rowVals = fields.map(f => formatValue(row[f]));
                lines.push(`${nextIndent}${rowVals.join(',')}`);
            });

            return lines.join('\n');
        }

        // ---- YAML-STYLE ARRAY (nested objects present) ----
        const lines = [];
        lines.push(`${indent}${key}[${length}]:`);

        data.forEach(row => {
            lines.push(`${nextIndent}-`); // item marker
            for (const f of fields) {
                const child = row[f];
                const block = jsonToToon(child, f, depth + 2);
                lines.push(block);
            }
        });

        return lines.join('\n');
    }

    // ---- Object ----
    const lines = [];

    if (key) lines.push(`${indent}${key}:`);

    for (const childKey in data) {
        if (Object.prototype.hasOwnProperty.call(data, childKey)) {
            const child = data[childKey];
            // Only increment depth if we are inside a keyed object/block. 
            // If we are at the root (key is empty), children should start at current depth (0).
            const nextDepth = key ? depth + 1 : depth;
            const block = jsonToToon(child, childKey, nextDepth);
            lines.push(block);
        }
    }

    return lines.join('\n');
}

/**
 * Converts TOON to JSON format
 * @param {string} toonString - TOON formatted string
 * @returns {*} Parsed JSON data
 * @throws {Error} If TOON string is invalid
 */
export function toonToJson(toonString) {
    // Validate TOON string before conversion
    const validationStatus = validateToonString(toonString);
    if (!validationStatus.isValid) {
        throw new Error(`Invalid TOON: ${validationStatus.error}`);
    }

    const lines = toonString.split('\n');
    let root = {};
    let stack = [];

    // Pre-process: Check for Root Array or Root Primitive
    const firstLine = lines.find(l => l.trim() !== '');
    if (!firstLine) return {}; // Empty document

    // Root Array detection: [N]... at start of line
    if (firstLine.trim().startsWith('[')) {
        root = [];
        stack.push({ obj: root, indent: 0, isRootArray: true });
    } else {
        stack.push({ obj: root, indent: -1 }); // Root object container
    }

    // State for tabular arrays
    let tabularHeaders = null;
    let tabularTarget = null;
    let tabularIndent = -1;
    let tabularDelimiter = ',';

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.trim() === '') continue;

        const indentMatch = line.match(/^(\s*)/);
        const indent = indentMatch ? indentMatch[1].length : 0;
        const trimmed = line.trim();

        // --- Tabular Data Handling ---
        if (tabularTarget) {
            if (tabularIndent === -1) {
                if (indent > stack[stack.length - 1].indent) {
                    tabularIndent = indent;
                } else {
                    tabularTarget = null;
                    tabularHeaders = null;
                }
            }

            if (tabularTarget && indent === tabularIndent) {
                const values = splitByDelimiter(trimmed, tabularDelimiter).map(parseValue);
                const rowObj = {};
                tabularHeaders.forEach((h, idx) => {
                    rowObj[h] = values[idx];
                });
                tabularTarget.push(rowObj);
                continue;
            } else if (tabularTarget && indent < tabularIndent) {
                tabularTarget = null;
                tabularHeaders = null;
                tabularIndent = -1;
            }
        }

        // Adjust stack based on indentation
        while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
            stack.pop();
        }

        let parent = stack[stack.length - 1].obj;

        // Root Array Header check
        if (stack.length === 1 && stack[0].isRootArray && trimmed.startsWith('[')) {
            const rootHeaderMatch = trimmed.match(/^\[(\d+)(.*?)\](?:\{(.*?)\})?:\s*(.*)$/);
            if (rootHeaderMatch) {
                const delimChar = rootHeaderMatch[2];
                const fieldsStr = rootHeaderMatch[3];

                let delimiter = ',';
                if (delimChar === '\\t') delimiter = '\t';
                else if (delimChar === '|') delimiter = '|';

                if (fieldsStr) {
                    tabularHeaders = fieldsStr.split(',').map(s => s.trim());
                    tabularTarget = root;
                    tabularIndent = -1;
                    tabularDelimiter = delimiter;
                }
            }
            continue;
        }

        // --- List Item Handling (-) ---
        if (trimmed.startsWith('-')) {
            const content = trimmed.slice(1).trim();

            if (content === '') {
                const newObj = {};
                parent.push(newObj);
                stack.push({ obj: newObj, indent: indent });
                continue;
            } else {
                const kvMatch = content.match(/^(.+?):\s*(.*)$/);
                const arrayMatch = content.match(/^\[(\d+)(.*?)\](?:\{(.*?)\})?:\s*(.*)$/);

                if (arrayMatch) {
                    const length = parseInt(arrayMatch[1], 10);
                    const delimChar = arrayMatch[2] || ',';
                    const delimiter = delimChar === '\\t' ? '\t' : (delimChar === '|' ? '|' : ',');
                    const fieldsStr = arrayMatch[3];
                    const rest = arrayMatch[4];

                    const newArray = [];
                    parent.push(newArray);

                    if (fieldsStr) {
                        tabularHeaders = fieldsStr.split(',').map(s => s.trim());
                        tabularTarget = newArray;
                        tabularIndent = -1;
                        tabularDelimiter = delimiter;
                    } else if (rest) {
                        const values = splitByDelimiter(rest, delimiter).map(parseValue);
                        newArray.push(...values);
                    } else {
                        stack.push({ obj: newArray, indent: indent + 1 });
                    }
                    continue;
                }

                if (kvMatch) {
                    const key = kvMatch[1].trim();
                    const valStr = kvMatch[2].trim();
                    const newObj = {};

                    if (valStr === '') {
                        newObj[key] = {};
                        parent.push(newObj);
                        stack.push({ obj: newObj[key], indent: indent + 1 });
                    } else {
                        newObj[key] = parseValue(valStr);
                        parent.push(newObj);
                        stack.push({ obj: newObj, indent: indent });
                    }
                    continue;
                }

                parent.push(parseValue(content));
                continue;
            }
        }

        // --- Key-Value or Array Header Handling ---
        const arrayHeaderMatch = trimmed.match(/^(.+?)\[(\d+)(.*?)\](?:\{(.*?)\})?:\s*(.*)$/);

        if (arrayHeaderMatch) {
            const key = arrayHeaderMatch[1].trim();
            const length = parseInt(arrayHeaderMatch[2], 10);
            const delimChar = arrayHeaderMatch[3];
            const fieldsStr = arrayHeaderMatch[4];
            const valueStr = arrayHeaderMatch[5];

            let delimiter = ',';
            if (delimChar === '\\t') delimiter = '\t';
            else if (delimChar === '|') delimiter = '|';

            const newArray = [];

            if (!Array.isArray(parent)) {
                parent[key] = newArray;
            }

            if (fieldsStr) {
                tabularHeaders = fieldsStr.split(',').map(s => s.trim());
                tabularTarget = newArray;
                tabularIndent = -1;
                tabularDelimiter = delimiter;
            } else if (valueStr && valueStr.trim() !== '') {
                const values = splitByDelimiter(valueStr, delimiter).map(parseValue);
                newArray.push(...values);
            } else {
                stack.push({ obj: newArray, indent: indent + 1 });
            }
            continue;
        }

        // Standard Key-Value: key: value
        const kvMatch = trimmed.match(/^(.+?):\s*(.*)$/);
        if (kvMatch) {
            const key = kvMatch[1].trim();
            const valStr = kvMatch[2].trim();

            if (valStr === '') {
                const newObj = {};
                parent[key] = newObj;
                stack.push({ obj: newObj, indent: indent + 1 });
            } else {
                parent[key] = parseValue(valStr);
            }
            continue;
        }
    }

    return root;
}

/**
 * Converts mixed text containing JSON to TOON format
 * Extracts all JSON objects/arrays from text and converts them to TOON
 * @param {string} text - Text containing one or more JSON objects/arrays
 * @returns {string} Text with JSON converted to TOON
 * @throws {Error} If JSON is invalid
 */
export function jsonTextToToon(text) {
    if (!text || typeof text !== 'string') {
        throw new Error('Input must be a non-empty string');
    }

    let convertedText = text;
    let iterationCount = 0;
    const maxIterations = 100; // Prevent infinite loops

    while (iterationCount < maxIterations) {
        const jsonString = extractJsonFromString(convertedText);

        if (!jsonString) {
            // No more JSON found
            break;
        }

        try {
            const jsonObject = JSON.parse(jsonString);
            const toonString = jsonToToon(jsonObject);
            const toonOutput = toonString.trim();
            convertedText = convertedText.replace(jsonString, toonOutput);
            iterationCount++;
        } catch (e) {
            throw new Error(`Invalid JSON: ${e.message}`);
        }
    }

    return convertedText;
}
