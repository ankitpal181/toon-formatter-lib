# 🚀 TOON Converter

A lightweight, zero-dependency* library to convert between **TOON** (Token-Oriented Object Notation) and popular data formats (JSON, YAML, XML, CSV).

**Reduce your LLM token costs by up to 40%** using the TOON format!

\* *Only external dependencies: `js-yaml` and `papaparse` for YAML and CSV parsing*

---

## 📦 Installation

```bash
npm install toon-formatter
```

---

## 🎯 What is TOON?

**TOON (Token-Oriented Object Notation)** is a compact, human-readable data serialization format designed specifically for use with Large Language Models (LLMs). It represents the same data model as JSON but with significantly fewer tokens.

### Why TOON?

- **💰 Lower API Costs**: Fewer tokens = lower costs
- **⚡ Faster Processing**: Reduced latency with smaller payloads
- **📊 More Context**: Fit more data in the same context window
- **🎯 Explicit Structure**: Array lengths and field declarations reduce hallucinations

### TOON vs JSON Example

**JSON** (87 tokens):
```json
{
  "users": [
    {"id": 1, "name": "Alice", "active": true},
    {"id": 2, "name": "Bob", "active": false},
    {"id": 3, "name": "Charlie", "active": true}
  ]
}
```

**TOON** (52 tokens - 40% reduction):
```
users[3]{id,name,active}:
  1,"Alice",true
  2,"Bob",false
  3,"Charlie",true
```

---

## 🚀 Quick Start

### Basic Usage (Synchronous)

```javascript
import { jsonToToonSync, toonToJsonSync } from 'toon-formatter';

// JSON to TOON
const jsonData = { name: "Alice", age: 30, active: true };
const toonString = jsonToToonSync(jsonData);
console.log(toonString);
// Output:
// name: "Alice"
// age: 30
// active: true

// TOON to JSON
const toonInput = `name: "Alice"\nage: 30\nactive: true`;
const jsonOutput = toonToJsonSync(toonInput);
console.log(jsonOutput);
// Output: { name: "Alice", age: 30, active: true }
```

### Basic Usage (Asynchronous)

```javascript
import { jsonToToon, toonToJson } from 'toon-formatter';

// JSON to TOON (async)
const jsonData = { name: "Alice", age: 30, active: true };
const toonString = await jsonToToon(jsonData);
console.log(toonString);

// TOON to JSON (async)
const toonInput = `name: "Alice"\nage: 30\nactive: true`;
const jsonOutput = await toonToJson(toonInput);
console.log(jsonOutput);
```

### 🎯 Mixed Text Support (Embedded Data)

**JSON, XML, and CSV to TOON conversions support both full data strings AND mixed text with embedded data!**

```javascript
import { jsonToToonSync, xmlToToon, csvToToonSync } from 'toon-formatter';

// Example 1: Extract and convert JSON from mixed text
const mixedText = `
Here's some user data:
{"name": "Alice", "age": 30, "role": "Engineer"}

And here's another object:
{"name": "Bob", "age": 25, "role": "Designer"}
`;

const result = jsonToToonSync(mixedText);
console.log(result);
// Output:
// Here's some user data:
// name: "Alice"
// age: 30
// role: "Engineer"
//
// And here's another object:
// name: "Bob"
// age: 25
// role: "Designer"

// Example 2: Extract and convert XML from mixed text
const xmlMixedText = `
The user profile is:
<user><name>Alice</name><age>30</age></user>
`;

const xmlResult = await xmlToToon(xmlMixedText);
console.log(xmlResult);
// Output:
// The user profile is:
// user:
//   name: "Alice"
//   age: "30"

// Example 3: Extract and convert CSV from mixed text
const csvMixedText = `
Employee data:
name,role,salary
Alice,Engineer,100000
Bob,Designer,95000
`;

const csvResult = csvToToonSync(csvMixedText);
// Converts the CSV table to TOON format while preserving surrounding text
```

**Important Notes:**
- ✅ **Supports mixed text**: `jsonToToon`, `xmlToToon`, `csvToToon`, `yamlToToon`
- ❌ **Pure data only**: `toonToJson`, `toonToXml`, `toonToCsv`, `toonToYaml`

### Using the ToonConverter Class

```javascript
import ToonConverter from 'toon-formatter';

// Synchronous conversions (default methods)
const toonFromJson = ToonConverter.fromJson({ key: "value" });
const toonFromYaml = ToonConverter.fromYaml("key: value");
const toonFromXml = ToonConverter.fromXml("<root><key>value</key></root>");
const toonFromCsv = ToonConverter.fromCsv("name,age\nAlice,30");

// Asynchronous conversions (methods with 'Async' suffix)
const toonFromJsonAsync = await ToonConverter.fromJsonAsync({ key: "value" });
const toonFromYamlAsync = await ToonConverter.fromYamlAsync("key: value");
const toonFromXmlAsync = await ToonConverter.fromXmlAsync("<root><key>value</key></root>");
const toonFromCsvAsync = await ToonConverter.fromCsvAsync("name,age\nAlice,30");

// Convert to various formats (synchronous by default)
const jsonData = ToonConverter.toJson(toonString);
const yamlData = ToonConverter.toYaml(toonString);
const xmlData = ToonConverter.toXml(toonString);
const csvData = ToonConverter.toCsv(toonString);

// Asynchronous versions (methods with 'Async' suffix)
const jsonDataAsync = await ToonConverter.toJsonAsync(toonString);
const yamlDataAsync = await ToonConverter.toYamlAsync(toonString);
const xmlDataAsync = await ToonConverter.toXmlAsync(toonString);
const csvDataAsync = await ToonConverter.toCsvAsync(toonString);

// Validate TOON (synchronous by default)
const result = ToonConverter.validate(toonString);
if (result.isValid) {
    console.log("Valid TOON!");
} else {
    console.error("Invalid TOON:", result.error);
}

// Validate TOON (asynchronous)
const resultAsync = await ToonConverter.validateAsync(toonString);
```

---

## 🔄 Sync vs Async API

All conversion functions are available in both **synchronous** and **asynchronous** versions:

### Direct Function Imports

**Synchronous Functions (Suffix: `Sync`)**
- `jsonToToonSync()`, `toonToJsonSync()`
- `yamlToToonSync()`, `toonToYamlSync()`
- `xmlToToonSync()`, `toonToXmlSync()`
- `csvToToonSync()`, `toonToCsvSync()`
- `validateToonStringSync()`

**Use when:** You need immediate results and are working in a synchronous context.

**Asynchronous Functions (No suffix)**
- `jsonToToon()`, `toonToJson()`
- `yamlToToon()`, `toonToYaml()`
- `xmlToToon()`, `toonToXml()`
- `csvToToon()`, `toonToCsv()`
- `validateToonString()`

**Use when:** You're in an async context or want to maintain consistency with async/await patterns.

### ToonConverter Class Methods

**Synchronous Methods (No suffix - default)**
- `ToonConverter.fromJson()`, `ToonConverter.toJson()`
- `ToonConverter.fromYaml()`, `ToonConverter.toYaml()`
- `ToonConverter.fromXml()`, `ToonConverter.toXml()`
- `ToonConverter.fromCsv()`, `ToonConverter.toCsv()`
- `ToonConverter.validate()`

**Asynchronous Methods (Suffix: `Async`)**
- `ToonConverter.fromJsonAsync()`, `ToonConverter.toJsonAsync()`
- `ToonConverter.fromYamlAsync()`, `ToonConverter.toYamlAsync()`
- `ToonConverter.fromXmlAsync()`, `ToonConverter.toXmlAsync()`
- `ToonConverter.fromCsvAsync()`, `ToonConverter.toCsvAsync()`
- `ToonConverter.validateAsync()`

**Note:** 
- For **direct imports**, sync functions have `Sync` suffix, async functions have no suffix
- For **ToonConverter class**, sync methods have no suffix (default), async methods have `Async` suffix
- For XML conversions in Node.js, the async version automatically loads the `xmldom` package if needed

---

## 🎯 Mixed Text Support

### What is Mixed Text?

Mixed text support allows you to convert data that's embedded within regular text, not just pure data strings. This is incredibly useful for processing documentation, API responses, or any content that contains data snippets.

### Supported Conversions

| Conversion | Full Data | Mixed Text | Notes |
|------------|-----------|------------|-------|
| `jsonToToon()` | ✅ | ✅ | Extracts all JSON objects/arrays |
| `xmlToToon()` | ✅ | ✅ | Extracts all XML elements |
| `csvToToon()` | ✅ | ✅ | Extracts CSV tables |
| `yamlToToon()` | ✅ | ✅ | Extracts YAML blocks |
| `toonToJson()` | ✅ | ❌ | Pure TOON only |
| `toonToXml()` | ✅ | ❌ | Pure TOON only |
| `toonToCsv()` | ✅ | ❌ | Pure TOON only |
| `toonToYaml()` | ✅ | ❌ | Pure TOON only |

### Example

```javascript
import { jsonToToonSync } from 'toon-formatter';

const documentation = `
# API Documentation

## User Endpoint
Returns: {"id": 1, "name": "Alice", "role": "admin"}

## Product Endpoint  
Returns: {"id": 101, "title": "Widget", "price": 29.99}
`;

const converted = jsonToToonSync(documentation);
console.log(converted);
// Output:
// # API Documentation
//
// ## User Endpoint
// Returns: id: 1
// name: "Alice"
// role: "admin"
//
// ## Product Endpoint  
// Returns: id: 101
// title: "Widget"
// price: 29.99
```

---

## �📚 API Reference

### JSON Converters

#### `jsonToToonSync(data, key?, depth?)`
Converts JSON data to TOON format (synchronous).

**Supports:** ✅ Full JSON data, ✅ Mixed text with embedded JSON

**Parameters:**
- `data` (any): JSON data to convert, or string containing JSON
- `key` (string, optional): Key name for root object
- `depth` (number, optional): Initial indentation depth

**Returns:** `string` - TOON formatted string

**Example:**
```javascript
import { jsonToToonSync } from 'toon-formatter';

// Full JSON data
const data = {
    users: [
        { id: 1, name: "Alice" },
        { id: 2, name: "Bob" }
    ]
};
const toon = jsonToToonSync(data);

// Mixed text with embedded JSON
const mixedText = 'User: {"name": "Alice", "age": 30}';
const result = jsonToToonSync(mixedText);
// Output: User: name: "Alice"\nage: 30
```

#### `jsonToToon(data)`
Converts JSON data to TOON format (asynchronous).

**Supports:** ✅ Full JSON data, ✅ Mixed text with embedded JSON

**Parameters:**
- `data` (any): JSON data to convert, or string containing JSON

**Returns:** `Promise<string>` - TOON formatted string

#### `toonToJsonSync(toonString)`
Converts TOON string to JSON (synchronous).

**Supports:** ❌ Pure TOON data only (no mixed text)

**Parameters:**
- `toonString` (string): TOON formatted string

**Returns:** `any` - Parsed JSON data

#### `toonToJson(toonString)`
Converts TOON string to JSON (asynchronous).

**Supports:** ❌ Pure TOON data only (no mixed text)

**Parameters:**
- `toonString` (string): TOON formatted string

**Returns:** `Promise<any>` - Parsed JSON data

---

### YAML Converters

#### `yamlToToonSync(yamlString)`
Converts YAML to TOON format (synchronous).

**Supports:** ✅ Full YAML data, ✅ Mixed text with embedded YAML

**Parameters:**
- `yamlString` (string): YAML formatted string or mixed text

**Returns:** `string` - TOON formatted string

**Throws:** `Error` if YAML is invalid

#### `yamlToToon(yamlString)`
Converts YAML to TOON format (asynchronous).

**Supports:** ✅ Full YAML data, ✅ Mixed text with embedded YAML

**Parameters:**
- `yamlString` (string): YAML formatted string or mixed text

**Returns:** `Promise<string>` - TOON formatted string

**Throws:** `Error` if YAML is invalid

#### `toonToYamlSync(toonString)`
Converts TOON to YAML format (synchronous).

**Supports:** ❌ Pure TOON data only (no mixed text)

**Parameters:**
- `toonString` (string): TOON formatted string

**Returns:** `string` - YAML formatted string

**Throws:** `Error` if TOON is invalid

#### `toonToYaml(toonString)`
Converts TOON to YAML format (asynchronous).

**Supports:** ❌ Pure TOON data only (no mixed text)

**Parameters:**
- `toonString` (string): TOON formatted string

**Returns:** `Promise<string>` - YAML formatted string

**Throws:** `Error` if TOON is invalid

---

### XML Converters

#### `xmlToToonSync(xmlString)`
Converts XML to TOON format (synchronous).

**Supports:** ✅ Full XML data, ✅ Mixed text with embedded XML

**Parameters:**
- `xmlString` (string): XML formatted string or mixed text

**Returns:** `string` - TOON formatted string

**Throws:** `Error` if XML is invalid

**Note:** Requires `DOMParser` (browser) or `xmldom` package (Node.js)

#### `xmlToToon(xmlString)`
Converts XML to TOON format (asynchronous).

**Supports:** ✅ Full XML data, ✅ Mixed text with embedded XML

**Parameters:**
- `xmlString` (string): XML formatted string or mixed text

**Returns:** `Promise<string>` - TOON formatted string

**Throws:** `Error` if XML is invalid

**Note:** Automatically loads `xmldom` in Node.js environments

#### `toonToXmlSync(toonString)`
Converts TOON to XML format (synchronous).

**Supports:** ❌ Pure TOON data only (no mixed text)

**Parameters:**
- `toonString` (string): TOON formatted string

**Returns:** `string` - XML formatted string

**Throws:** `Error` if TOON is invalid

#### `toonToXml(toonString)`
Converts TOON to XML format (asynchronous).

**Supports:** ❌ Pure TOON data only (no mixed text)

**Parameters:**
- `toonString` (string): TOON formatted string

**Returns:** `Promise<string>` - XML formatted string

**Throws:** `Error` if TOON is invalid

---

### CSV Converters

#### `csvToToonSync(csvString)`
Converts CSV to TOON format (synchronous).

**Supports:** ✅ Full CSV data, ✅ Mixed text with embedded CSV

**Parameters:**
- `csvString` (string): CSV formatted string or mixed text

**Returns:** `string` - TOON formatted string

**Throws:** `Error` if CSV is invalid

#### `csvToToon(csvString)`
Converts CSV to TOON format (asynchronous).

**Supports:** ✅ Full CSV data, ✅ Mixed text with embedded CSV

**Parameters:**
- `csvString` (string): CSV formatted string or mixed text

**Returns:** `Promise<string>` - TOON formatted string

**Throws:** `Error` if CSV is invalid

#### `toonToCsvSync(toonString)`
Converts TOON to CSV format (synchronous).

**Supports:** ❌ Pure TOON data only (no mixed text)

**Parameters:**
- `toonString` (string): TOON formatted string

**Returns:** `string` - CSV formatted string

**Throws:** `Error` if TOON is invalid

#### `toonToCsv(toonString)`
Converts TOON to CSV format (asynchronous).

**Supports:** ❌ Pure TOON data only (no mixed text)

**Parameters:**
- `toonString` (string): TOON formatted string

**Returns:** `Promise<string>` - CSV formatted string

**Throws:** `Error` if TOON is invalid

---

### Validator

#### `validateToonStringSync(toonString)`
Validates a TOON string for syntax and structural correctness (synchronous).

**Parameters:**
- `toonString` (string): TOON string to validate

**Returns:** `{isValid: boolean, error: string|null}`

**Example:**
```javascript
import { validateToonStringSync } from 'toon-formatter';

const result = validateToonStringSync(`
users[2]{id,name}:
  1,"Alice"
  2,"Bob"
`);

if (result.isValid) {
    console.log("Valid TOON!");
} else {
    console.error("Error:", result.error);
}
```

#### `validateToonString(toonString)`
Validates a TOON string for syntax and structural correctness (asynchronous).

**Parameters:**
- `toonString` (string): TOON string to validate

**Returns:** `Promise<{isValid: boolean, error: string|null}>`

---

## 🎨 TOON Format Guide

### Primitives
```
name: "Alice"
age: 30
active: true
score: null
```

### Objects
```
user:
  name: "Alice"
  age: 30
```

### Arrays (Inline)
```
numbers[3]: 1, 2, 3
names[2]: "Alice", "Bob"
```

### Arrays (Block)
```
items[2]:
  - "First"
  - "Second"
```

### Tabular Arrays (Optimized)
```
users[3]{id,name,active}:
  1,"Alice",true
  2,"Bob",false
  3,"Charlie",true
```

### Nested Structures
```
company:
  name: "TechCorp"
  employees[2]:
    -
      name: "Alice"
      role: "Engineer"
    -
      name: "Bob"
      role: "Designer"
```

---

## 💡 Use Cases

### 1. LLM API Optimization (Synchronous)
```javascript
import { jsonToToonSync } from 'toon-formatter';

// Before: Sending JSON to LLM
const jsonPrompt = JSON.stringify(largeDataset);
// 1000+ tokens

// After: Sending TOON to LLM
const toonPrompt = jsonToToonSync(largeDataset);
// 600 tokens (40% reduction!)

const response = await openai.chat.completions.create({
    messages: [{ role: "user", content: toonPrompt }]
});
```

### 2. LLM API Optimization (Asynchronous)
```javascript
import { jsonToToon, toonToJson } from 'toon-formatter';

// Convert to TOON before sending
const toonPrompt = await jsonToToon(largeDataset);

const response = await openai.chat.completions.create({
    messages: [{ role: "user", content: toonPrompt }]
});

// Parse TOON response back to JSON
const result = await toonToJson(response.choices[0].message.content);
```

### 3. Data Pipeline Integration
```javascript
import { csvToToonSync, toonToJsonSync } from 'toon-formatter';

// Read CSV, convert to TOON, process, convert back
const csvData = fs.readFileSync('data.csv', 'utf-8');
const toonData = csvToToonSync(csvData);

// Send to LLM for processing...
const processedToon = await processWithLLM(toonData);

// Convert back to JSON for your app
const jsonResult = toonToJsonSync(processedToon);
```

### 4. Mixed Text Processing
```javascript
import { jsonToToonSync, xmlToToon } from 'toon-formatter';

// Extract and convert JSON from API documentation
const apiDocs = `
The user endpoint returns:
{"id": 123, "name": "Alice", "email": "alice@example.com"}

The product endpoint returns:
{"id": 456, "title": "Widget", "price": 29.99}
`;

const convertedDocs = jsonToToonSync(apiDocs);
// Both JSON objects are converted to TOON while preserving the text

// Extract and convert XML from mixed content
const xmlContent = `
Server response:
<response><status>success</status><data>processed</data></response>
`;

const result = await xmlToToon(xmlContent);
// XML is converted to TOON format
```

### 5. Configuration Files
```javascript
import { yamlToToonSync, toonToYamlSync } from 'toon-formatter';

// Convert YAML config to TOON for LLM analysis
const yamlConfig = fs.readFileSync('config.yaml', 'utf-8');
const toonConfig = yamlToToonSync(yamlConfig);

// LLM can analyze and suggest improvements...
const improvedToon = await analyzeWithLLM(toonConfig);

// Convert back to YAML
const improvedYaml = toonToYamlSync(improvedToon);
fs.writeFileSync('config.yaml', improvedYaml);
```

---

## 🧪 Testing

```bash
npm test
```

---

## 📄 License

MIT License - see LICENSE file for details

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 🔗 Links

- **GitHub**: https://github.com/ankitpal181/toon-formatter-lib
- **NPM**: https://www.npmjs.com/package/toon-formatter
- **Online Tool**: https://toonformatter.net/

---

## 📊 Benchmarks

| Format | Tokens | Reduction |
|--------|--------|-----------|
| JSON   | 1000   | 0%        |
| TOON   | 600    | 40%       |

*Based on average structured data with arrays of objects*

---

## ⚠️ Notes

- **XML Support**: For Node.js environments, install `xmldom`: `npm install xmldom`
- **CSV Parsing**: Uses PapaParse for robust CSV handling
- **YAML Parsing**: Uses js-yaml for YAML support

---

Made with ❤️ by Ankit Pal
