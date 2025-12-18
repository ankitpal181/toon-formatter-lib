/**
 * JSON Validator (for JsonConverter)
 */

/**
 * Validate JSON string (Sync)
 * @param {string} jsonString 
 * @returns {boolean} True if valid, throws error otherwise
 */
export function validateJsonStringSync(jsonString) {
    if (typeof jsonString !== 'string') {
        throw new Error("Input must be a string.");
    }
    try {
        JSON.parse(jsonString);
        return true;
    } catch (e) {
        throw new Error(`Invalid JSON: ${e.message}`);
    }
}

/**
 * Validate JSON string (Async)
 * @param {string} jsonString 
 * @returns {Promise<boolean>} True if valid
 */
export async function validateJsonString(jsonString) {
    return validateJsonStringSync(jsonString);
}
