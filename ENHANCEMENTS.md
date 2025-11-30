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

### 3. **Integrated Mixed Text Conversion**
The conversion functions now automatically detect and handle mixed text input using an extraction loop. This logic covers both embedded data and full data strings.

**Synchronous API (Main Logic)**:
- `jsonToToonSync(input)`
- `xmlToToonSync(input)`
- `csvToToonSync(input)`
- `yamlToToonSync(input)`

**Asynchronous API (Wrappers)**:
- `jsonToToon(input)`
- `xmlToToon(input)`
- `csvToToon(input)`
- `yamlToToon(input)`

**Behavior**:
1. Checks if input is a string.
2. Uses extraction logic (`extract*FromString`) in a loop to find and convert all data blocks.
3. If no blocks are found (and input is not valid data), it returns the original text (or throws if strict parsing fails inside the loop).

**Note**: `*TextToToon` functions have been removed in favor of this integrated approach.

---

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

### 6. **API Consistency (Sync & Async)**
All converters now support both Synchronous and Asynchronous operations for consistency.

| Format | Sync Method | Async Method |
|--------|-------------|--------------|
| **JSON** | `jsonToToon` | `jsonToToonAsync` |
| **YAML** | `yamlToToon` | `yamlToToonAsync` |
| **XML** | `xmlToToonSync`* | `xmlToToon` |
| **CSV** | `csvToToonSync` | `csvToToon` |

*\*Note: `xmlToToonSync` in Node.js requires a global `DOMParser` polyfill (e.g., via `jsdom`).*

### 7. **Unified Class API** (`ToonConverter`)
The `ToonConverter` class now exposes all variations:

```javascript
// Async
await ToonConverter.fromJsonAsync(data);
await ToonConverter.fromXmlAsync(xml);
await ToonConverter.fromCsvAsync(csv);

// Sync
ToonConverter.fromJson(data);
ToonConverter.fromXmlSync(xml);
ToonConverter.fromCsvSync(csv);

// Mixed Text
ToonConverter.fromJsonText(text);
await ToonConverter.fromXmlText(text);
```

---

## 🚀 Benefits

- **Robustness**: Validation prevents invalid conversions
- **Flexibility**: Handle mixed content seamlessly
- **Consistency**: Unified API for all formats
- **Developer Experience**: Clear errors, easy debugging
- **Reliability**: Comprehensive validation at every step
- **Reusability**: Extraction functions available for custom use

---

**Note**: History feature was intentionally NOT added to the package as requested.

---

Made with ❤️ for the TOON Formatter project
