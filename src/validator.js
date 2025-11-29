/**
 * TOON String Validator (Enhanced)
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
    // Stack of contexts: { indent, type: 'root'|'object'|'array', expected?, count?, isTabular? }
    const contextStack = [{ indent: 0, type: 'root', count: 0 }];
    let lineNumber = 0;

    // Regex Definitions (based on TOON Rules)
    const REGEX = {
        mapKey: /^[^:\[]+:\s*$/,
        arrayKey: /^[^:\[]+\[(\d+)([\t|])?\](?:\{[^}]+\})?:\s*(.*)$/, // Capture N, delimiter, content
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
        let currentContext = contextStack[contextStack.length - 1];
        const requiredIndent = currentContext.indent;

        // --- Strict Check for Empty Blocks ---
        // If the previous line opened a block (like an array) but we didn't indent,
        // and it wasn't an inline array, then it's an empty block.
        // If the array expects items (size > 0), this is an error.
        if (lineNumber > 1) {
            const prevLineRaw = lines[lineNumber - 2];
            const prevLineTrimmed = prevLineRaw.trim();
            const arrMatch = prevLineTrimmed.match(REGEX.arrayKey) || prevLineTrimmed.match(REGEX.rootArray);

            if (arrMatch && currentIndent <= requiredIndent) {
                // It was an array declaration, and we are NOT inside it (no indent increase).
                const size = parseInt(arrMatch[1], 10);
                const content = arrMatch[3];

                // If no inline content and size > 0, it's a missing block.
                if ((!content || content.trim() === '') && size > 0) {
                    return { isValid: false, error: `L${lineNumber - 1}: Array declared with size ${size} but has no items (expected indented block).` };
                }
            }
        }

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
                // If it's Root Array at indent 0, update root context.
                if (trimmedLine.match(REGEX.rootArray) && contextStack.length === 1) {
                    contextStack[0].type = 'array';
                    contextStack[0].expected = size;
                    contextStack[0].count = 0;
                }
            }
        }

        // --- State Management (Tabular) ---
        if (isInsideTabularArray) {
            // For tabular arrays, accept any indent >= root indent after the header
            const rootContext = contextStack[0];
            if (currentIndent >= rootContext.indent || (rootContext.indent === 0 && currentIndent > 0)) {
                if (trimmedLine.includes(':') && !trimmedLine.startsWith('"')) {
                    return { isValid: false, error: `L${lineNumber}: Tabular rows cannot contain a colon.` };
                }
                // Count tabular row as item
                if (rootContext.type === 'array') {
                    rootContext.count++;
                }
                // Update root indent if this is first data row
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

            // Determine context type
            let newContext = { indent: currentIndent, type: 'object' };

            const prevArrayMatch = prevLineTrimmed.match(REGEX.arrayKey) || prevLineTrimmed.match(REGEX.rootArray);
            if (prevArrayMatch) {
                // Check if this is a root array that was already initialized
                const isRootArrayAlreadySet = prevLineTrimmed.match(REGEX.rootArray) &&
                    contextStack.length === 1 &&
                    contextStack[0].type === 'array';

                const isTabular = prevLineTrimmed.includes('{') && prevLineTrimmed.includes('}');

                if (!isRootArrayAlreadySet) {
                    // Create new array context for non-root arrays
                    const size = parseInt(prevArrayMatch[1], 10);
                    newContext = { indent: currentIndent, type: 'array', expected: size, count: 0, isTabular: isTabular };
                    contextStack.push(newContext);
                } else {
                    // For root arrays, update the existing context
                    contextStack[0].isTabular = isTabular;
                }
            } else {
                contextStack.push(newContext);
            }

            // Update root array indent if this is the first indented item
            if (contextStack.length === 1 && contextStack[0].type === 'array' && contextStack[0].indent === 0) {
                contextStack[0].indent = currentIndent;
            }

            // Count the current line if it's a list item in an array
            const targetContext = contextStack[contextStack.length - 1];
            if (targetContext.type === 'array') {
                if (targetContext.isTabular) {
                    // Tabular items don't need dash
                    targetContext.count++;
                } else if (trimmedLine.match(REGEX.listItem)) {
                    targetContext.count++;
                }
            }

        } else if (currentIndent < requiredIndent) {
            // Un-indentation
            let foundMatch = false;

            // Pop and Validate
            while (contextStack.length > 1) {
                const popped = contextStack.pop();

                // Validate Array Size on Close
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

            // After popping, count items in parent context if it's an array
            const parentContext = contextStack[contextStack.length - 1];
            if (parentContext.type === 'array') {
                if (parentContext.isTabular) {
                    parentContext.count++;
                } else if (trimmedLine.match(REGEX.listItem)) {
                    parentContext.count++;
                }
            }

        } else {
            // Same Indent
            // If array, count items
            if (currentContext.type === 'array') {
                if (currentContext.isTabular) {
                    currentContext.count++;
                } else if (trimmedLine.match(REGEX.listItem)) {
                    currentContext.count++;
                }
            }
        }

        // Update currentContext as it might have changed (push/pop)
        currentContext = contextStack[contextStack.length - 1];

        // --- Syntax Check ---
        if (trimmedLine.match(REGEX.arrayKey) || trimmedLine.match(REGEX.rootArray)) {
            if (startsTabular(trimmedLine)) isInsideTabularArray = true;
        }
        else if (trimmedLine.match(REGEX.mapKey)) { }
        else if (trimmedLine.match(REGEX.listItem)) {
            if (currentContext.type !== 'array') {
                return { isValid: false, error: `L${lineNumber}: List item found in non-array context.` };
            }
        }
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
