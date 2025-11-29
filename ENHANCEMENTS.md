# TOON Converter Library - Enhancement Summary

## Overview
Updated the `toon-converter-lib` package with improved validators, mixed text extraction capabilities, validation checks on reverse conversions, and loop-based conversion for embedded formats.

---

## ✨ New Features Added

### 1. **Enhanced Validator** (`src/validator.js`)
- **Empty Block Detection**: Validates that arrays with size > 0 have actual items
- **Tabular Array Support**: Properly handles tabular arrays with `{field1,field2}` syntax  
- **List Item Context Checking**: Ensures `-` items only appear in array contexts
- **Better Error Messages**: Line numbers and specific error descriptions

**Example Error**:
```
L5: Array declared with size 3 but has no items (expected indented block).
```

---

### 2. **Format Extraction Functions** (`src/utils.js`)
Added utilities to extract specific formats from mixed text:

- `extractJsonFromString(text)` - Finds and extracts JSON objects/arrays
- `extractYamlFromString(text)` - Extracts YAML blocks
- `extractXmlFromString(text)` - Extracts XML elements with balance checking
- `extractCsvFromString(text)` - Identifies CSV data

**Use Case**: Allows conversion of mixed content (e.g., JSON embedded in markdown).

---

### 3. **Mixed Text Conversion Functions**
New functions that extract and convert all instances of a format from mixed text:

#### JSON (`src/json.js`)
```javascript
jsonTextToToon(text)
```
- Extracts all JSON objects/arrays from text
- Converts each to TOON format
- Replaces in original text
- Loops until no more JSON found (max 100 iterations)

#### XML (`src/xml.js`)
```javascript
xmlTextToToon(text)  // async
```
- Extracts all XML elements from text
- Converts each to TOON format
- Handles nested/multiple XML blocks

#### CSV (`src/csv.js`)
```javascript
csvTextToToon(text)      // async
csvTextToToonSync(text)  // sync
```
- Extracts CSV data from text
- Converts to TOON format
- Both async and sync versions available

---

### 4. **Validation on Reverse Conversions**
All `toonTo*` functions now validate TOON input before conversion:

- `toonToJson()` - Validates before parsing
- `toonToYaml()` - Validates before conversion
- `toonToXml()` - Validates before conversion
- `toonToCsv()` - Validates before conversion

**Benefits**:
- Early error detection
- Clear error messages
- Prevents invalid conversions

---

### 5. **Improved JSON Conversion**
- **Root Depth Handling**: Fixed depth calculation for root-level objects
- **Validation Integration**: Calls `validateToonString()` before TOON→JSON

---

## 📦 Updated Exports

### New Exports in `src/index.js`:
```javascript
// Text conversion functions
export { jsonTextToToon, xmlTextToToon, csvTextToToon, csvTextToToonSync };

// Extraction utilities
export { 
    extractJsonFromString, 
    extractYamlFromString, 
    extractXmlFromString, 
    extractCsvFromString 
};
```

---

## 🔧 Usage Examples

### Mixed Text JSON Conversion
```javascript
import { jsonTextToToon } from 'toon-converter';

const mixedText = `
Here's some data:
{"name": "Alice", "age": 30}

And more data:
{"city": "NYC", "country": "USA"}
`;

const result = jsonTextToToon(mixedText);
// Converts all JSON objects to TOON in place
```

### Validation Before Conversion
```javascript
import { toonToJson } from 'toon-converter';

try {
    const json = toonToJson(toonString);
} catch (error) {
    console.error(error.message);
    // "Invalid TOON: L5: Array size mismatch..."
}
```

### Format Extraction
```javascript
import { extractJsonFromString } from 'toon-converter';

const text = "Some text {\"key\": \"value\"} more text";
const json = extractJsonFromString(text);
// Returns: '{"key": "value"}'
```

---

## 🧪 Testing

All existing tests pass with the new enhancements:
- ✅ 23/23 tests passing
- ✅ JSON, YAML, XML, CSV converters
- ✅ Validator with enhanced checks
- ✅ Round-trip conversions
- ✅ Edge cases

---

## 📋 Files Modified

| File | Changes |
|------|---------|
| `src/validator.js` | Enhanced validation logic |
| `src/utils.js` | Added 4 extraction functions |
| `src/json.js` | Added `jsonTextToToon`, validation, depth fix |
| `src/yaml.js` | Added validation to `toonToYaml` |
| `src/xml.js` | Added `xmlTextToToon`, validation |
| `src/csv.js` | Added `csvTextToToon` (async/sync), validation |
| `src/index.js` | Updated exports for new functions |

---

## 🎯 Key Improvements Summary

1. **✅ Enhanced Validator**: Stricter validation with better error messages
2. **✅ Mixed Text Support**: Extract and convert formats from any text
3. **✅ Loop Conversion**: Process multiple instances automatically
4. **✅ Validation Checks**: All reverse conversions validate input
5. **✅ Better Error Handling**: Clear, actionable error messages
6. **✅ Extraction Utilities**: Reusable format detection functions

---

## 🚀 Benefits

- **Robustness**: Validation prevents invalid conversions
- **Flexibility**: Handle mixed content seamlessly
- **Developer Experience**: Clear errors, easy debugging
- **Reliability**: Comprehensive validation at every step
- **Reusability**: Extraction functions available for custom use

---

**Note**: History feature was intentionally NOT added to the package as requested.

---

Made with ❤️ for the TOON Formatter project
