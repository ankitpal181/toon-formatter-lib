/**
 * JSON ↔ TOON Converter
 */

import { formatValue, parseValue, splitByDelimiter, extractJsonFromString } from './utils.js';
import { validateToonStringSync } from './validator.js';

/**
 * Internal core parser for JSON to TOON conversion.
 * @param {*} data 
 * @param {string} key 
 * @param {number} depth 
 * @returns {string}
 */
function jsonToToonParser(data, key = '', depth = 0) {
    const indent = '  '.repeat(depth);
    const nextIndent = '  '.repeat(depth + 1);

    // ---- Primitive ----
    if (data === null || typeof data !== 'object') {
        if (key) {
            return `${indent}${key}: ${formatValue(data)}`;
        }
        return `${indent}${formatValue(data)}`;
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
        const firstItem = data[0];
        if (typeof firstItem === 'object' && firstItem !== null && !Array.isArray(firstItem)) {
            const fields = Object.keys(firstItem);

            // Collect all potential fields from ALL rows to be sure, or just from first row
            // To match Python, we check fields from first row
            let isTabular = true;
            for (const row of data) {
                if (typeof row !== 'object' || row === null || Array.isArray(row)) {
                    isTabular = false;
                    break;
                }

                // If this row has more keys than the first row, it might not be tabular 
                // but let's stick to Python logic: check if all values of 'fields' in this row are primitive
                for (const f of fields) {
                    const val = row[f];
                    if (val !== null && typeof val === 'object') {
                        isTabular = false;
                        break;
                    }
                }

                // AND we should probably check if this row contains any extra non-primitive keys
                if (isTabular) {
                    for (const k in row) {
                        if (!fields.includes(k) && typeof row[k] === 'object' && row[k] !== null) {
                            isTabular = false;
                            break;
                        }
                    }
                }

                if (!isTabular) break;
            }

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
        }

        // ---- YAML-STYLE ARRAY (nested objects or mixed types) ----
        const lines = [];
        lines.push(`${indent}${key}[${length}]:`);

        data.forEach(row => {
            lines.push(`${nextIndent}-`); // item marker
            if (typeof row === 'object' && row !== null && !Array.isArray(row)) {
                for (const f in row) {
                    lines.push(jsonToToonParser(row[f], f, depth + 2));
                }
            } else if (Array.isArray(row)) {
                lines.push(jsonToToonParser(row, '', depth + 2));
            } else {
                // Primitive in array
                lines.push(`${'  '.repeat(depth + 2)}${formatValue(row)}`);
            }
        });

        return lines.join('\n');
    }

    // ---- Object ----
    const lines = [];
    if (key) {
        lines.push(`${indent}${key}:`);
    }

    const childDepth = key ? depth + 1 : depth;
    Object.keys(data).forEach(k => {
        lines.push(jsonToToonParser(data[k], k, childDepth));
    });

    return lines.join('\n');
}

/**
 * Converts JSON to TOON format (Sync)
 * @param {*} data - JSON data to convert
 * @returns {string} TOON formatted string
 */
export function jsonToToonSync(data) {
    // Handle String Input (Potential JSON string or Mixed Text)
    if (typeof data === 'string') {
        let convertedText = data;
        let iterationCount = 0;
        const maxIterations = 100;
        let foundAnyJson = false;

        while (iterationCount < maxIterations) {
            const jsonString = extractJsonFromString(convertedText);
            if (!jsonString) break;

            foundAnyJson = true;
            try {
                const jsonObject = JSON.parse(jsonString);
                const toonString = jsonToToonParser(jsonObject);
                const toonOutput = toonString.trim();
                convertedText = convertedText.replace(jsonString, toonOutput);
                iterationCount++;
            } catch (e) {
                break;
            }
        }

        if (!foundAnyJson) {
            return jsonToToonParser(data);
        }

        return convertedText;
    }

    return jsonToToonParser(data);
}

/**
 * Converts JSON to TOON format (Async)
 * @param {*} data - JSON data to convert
 * @returns {Promise<string>} TOON formatted string
 */
export async function jsonToToon(data) {
    return jsonToToonSync(data);
}

/**
 * Converts TOON to JSON format (Synchronous)
 * @param {string} toonString - TOON formatted string
 * @param {boolean} [returnJson=false] - If true, returns JSON string; if false, returns object
 * @returns {Object|string} JSON object or JSON string
 * @throws {Error} If TOON string is invalid
 */
export function toonToJsonSync(toonString, returnJson = false) {
    // Validate TOON string before conversion
    const validationStatus = validateToonStringSync(toonString);
    if (!validationStatus.isValid) {
        throw new Error(`Invalid TOON: ${validationStatus.error}`);
    }

    const lines = toonString.split('\n');
    let root = {};
    let stack = [];

    // Pre-process: Check for Root Array or Root Primitive
    const firstLine = lines.find(l => l.trim() !== '');
    if (!firstLine) return returnJson ? '{}' : {}; // Empty document

    // Root Array detection
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
            const delimChar = arrayHeaderMatch[3];
            const fieldsStr = arrayHeaderMatch[4];
            const valueStr = arrayHeaderMatch[5];

            let delimiter = ',';
            if (delimChar === '\\t') delimiter = '\t';
            else if (delimChar === '|') delimiter = '|';

            const newArray = [];
            parent[key] = newArray;

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

    return returnJson ? JSON.stringify(root) : root;
}

/**
 * Converts TOON to JSON format (Async)
 * @param {string} toonString - TOON formatted string
 * @param {boolean} [returnJson=false] - If true, returns JSON string; if false, returns object
 * @returns {Promise<Object|string>} JSON object or JSON string
 */
export async function toonToJson(toonString, returnJson = false) {
    return toonToJsonSync(toonString, returnJson);
}
