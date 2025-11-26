/**
 * TOON String Validator
 */

import { splitByDelimiter } from './utils.js';

/**
 * Validates a TOON string for syntax and structural correctness
 * @param {string} toonString - TOON string to validate
 * @returns {{isValid: boolean, error: string|null}} Validation result
 */
export function validateToonString(toonString) {
    if (!toonString || typeof toonString !== 'string') {
        return { isValid: false, error: 'Input must be a non-empty string.' };
    }

    const lines = toonString.split('\n');
    // Stack of contexts: { indent, type: 'root'|'object'|'array', expected?, count? }
    const contextStack = [{ indent: 0, type: 'root', count: 0 }];
    let lineNumber = 0;

    // Regex Definitions (based on TOON Rules)
    const REGEX = {
        mapKey: /^[^:\[]+:\s*$/,
        arrayKey: /^[^:]+\[(\d+)([\t|])?\](?:\{[^}]+\})?:\s*(.*)$/, // Capture N, delimiter, content
        rootArray: /^\[(\d+)([\t|])?\](?:\{[^}]+\})?:\s*(.*)$/,    // Capture N, delimiter, content
        listItem: /^\-.*/,
        listItemEmpty: /^\-\s*$/,
        keyValue: /^[^:\[]+:\s*(?:".*?"|[^"].*)$/,
        tabularRow: /^\s*[^:]+\s*$/,
    };

    let isInsideTabularArray = false;

    function opensNewBlock(trimmedLine) {
        return trimmedLine.match(REGEX.mapKey) ||
            trimmedLine.match(REGEX.arrayKey) ||
            trimmedLine.match(REGEX.rootArray) ||
            trimmedLine.match(REGEX.listItemEmpty);
    }

    function startsTabular(trimmedLine) {
        const isArray = trimmedLine.match(REGEX.arrayKey) || trimmedLine.match(REGEX.rootArray);
        return isArray && trimmedLine.includes('{') && trimmedLine.includes('}');
    }

    for (const rawLine of lines) {
        lineNumber++;
        const line = rawLine.trimEnd();

        if (line.trim() === '' || line.trim().startsWith('#')) {
            continue;
        }

        const trimmedLine = line.trim();
        const currentIndent = rawLine.search(/\S|$/);
        const currentContext = contextStack[contextStack.length - 1];
        const requiredIndent = currentContext.indent;

        // --- Inline Array Validation ---
        let arrayMatch = trimmedLine.match(REGEX.arrayKey) || trimmedLine.match(REGEX.rootArray);
        if (arrayMatch) {
            const size = parseInt(arrayMatch[1], 10);
            const delimChar = arrayMatch[2];
            const content = arrayMatch[3];

            if (content && content.trim() !== '') {
                // Inline Array: Validate immediately
                let delimiter = ',';
                if (delimChar === '\\t') delimiter = '\t';
                else if (delimChar === '|') delimiter = '|';

                const items = splitByDelimiter(content, delimiter);
                const validItems = items.filter(i => i.trim() !== '');

                if (validItems.length !== size) {
                    return { isValid: false, error: `L${lineNumber}: Array size mismatch. Declared ${size}, found ${validItems.length} inline items.` };
                }
            } else {
                // Block Array start. 
                if (trimmedLine.match(REGEX.rootArray) && contextStack.length === 1) {
                    contextStack[0].type = 'array';
                    contextStack[0].expected = size;
                    contextStack[0].count = 0;
                }
            }
        }

        // --- State Management (Tabular) ---
        if (isInsideTabularArray) {
            const rootContext = contextStack[0];
            if (currentIndent >= rootContext.indent || (rootContext.indent === 0 && currentIndent > 0)) {
                if (trimmedLine.includes(':') && !trimmedLine.startsWith('"')) {
                    return { isValid: false, error: `L${lineNumber}: Tabular rows cannot contain a colon.` };
                }
                if (rootContext.type === 'array') {
                    rootContext.count++;
                }
                if (rootContext.indent === 0) {
                    rootContext.indent = currentIndent;
                }
                continue;
            } else {
                isInsideTabularArray = false;
            }
        }

        // --- Indentation Check ---
        if (currentIndent > requiredIndent) {
            // New Block
            const prevLineTrimmed = lines[lineNumber - 2] ? lines[lineNumber - 2].trim() : '';
            if (!opensNewBlock(prevLineTrimmed)) {
                return { isValid: false, error: `L${lineNumber}: Indentation error.` };
            }

            let newContext = { indent: currentIndent, type: 'object' };

            const prevArrayMatch = prevLineTrimmed.match(REGEX.arrayKey) || prevLineTrimmed.match(REGEX.rootArray);
            if (prevArrayMatch) {
                const isRootArrayAlreadySet = prevLineTrimmed.match(REGEX.rootArray) &&
                    contextStack.length === 1 &&
                    contextStack[0].type === 'array';

                if (!isRootArrayAlreadySet) {
                    const size = parseInt(prevArrayMatch[1], 10);
                    newContext = { indent: currentIndent, type: 'array', expected: size, count: 0 };
                    contextStack.push(newContext);
                }
            } else {
                contextStack.push(newContext);
            }

            if (contextStack.length === 1 && contextStack[0].type === 'array' && contextStack[0].indent === 0) {
                contextStack[0].indent = currentIndent;
            }

            const targetContext = contextStack[contextStack.length - 1];
            if (targetContext.type === 'array') {
                if (trimmedLine.match(REGEX.listItem)) {
                    targetContext.count++;
                }
            }

        } else if (currentIndent < requiredIndent) {
            // Un-indentation
            let foundMatch = false;

            while (contextStack.length > 1) {
                const popped = contextStack.pop();

                if (popped.type === 'array') {
                    if (popped.count !== popped.expected) {
                        return { isValid: false, error: `Array size mismatch. Declared ${popped.expected}, found ${popped.count} items (ending around L${lineNumber}).` };
                    }
                }

                if (currentIndent === contextStack[contextStack.length - 1].indent) {
                    foundMatch = true;
                    break;
                }
            }

            if (!foundMatch && currentIndent !== 0) {
                return { isValid: false, error: `L${lineNumber}: Invalid un-indentation.` };
            }

            const parentContext = contextStack[contextStack.length - 1];
            if (parentContext.type === 'array') {
                if (trimmedLine.match(REGEX.listItem)) {
                    parentContext.count++;
                }
            }

        } else {
            // Same Indent
            if (currentContext.type === 'array') {
                if (trimmedLine.match(REGEX.listItem)) {
                    currentContext.count++;
                }
            }
        }

        // --- Syntax Check ---
        if (trimmedLine.match(REGEX.arrayKey) || trimmedLine.match(REGEX.rootArray)) {
            if (startsTabular(trimmedLine)) isInsideTabularArray = true;
        }
        else if (trimmedLine.match(REGEX.mapKey)) { }
        else if (trimmedLine.match(REGEX.listItem)) { }
        else if (trimmedLine.includes(':')) {
            if (!trimmedLine.match(REGEX.keyValue)) {
                return { isValid: false, error: `L${lineNumber}: Invalid Key-Value assignment.` };
            }
        }
        else if (trimmedLine.startsWith('"') && trimmedLine.endsWith('"')) { }
        else {
            return { isValid: false, error: `L${lineNumber}: Unrecognized TOON syntax.` };
        }
    }

    // Final check
    while (contextStack.length > 1) {
        const popped = contextStack.pop();
        if (popped.type === 'array') {
            if (popped.count !== popped.expected) {
                return { isValid: false, error: `Array size mismatch. Declared ${popped.expected}, found ${popped.count} items.` };
            }
        }
    }

    // Check root array if applicable
    if (contextStack[0].type === 'array') {
        if (contextStack[0].count !== contextStack[0].expected) {
            return { isValid: false, error: `Root Array size mismatch. Declared ${contextStack[0].expected}, found ${contextStack[0].count} items.` };
        }
    }

    return { isValid: true, error: null };
}
