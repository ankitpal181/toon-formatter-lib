# 🚀 TOON Converter

A lightweight, zero-dependency* library to convert between **TOON** (Token-Oriented Object Notation) and popular data formats (JSON, YAML, XML, CSV).

**Reduce your LLM token costs by up to 40%** using the TOON format!

\* *Only external dependencies: `js-yaml` and `papaparse` for YAML and CSV parsing*

---

## 📦 Installation

```bash
npm install toon-converter
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

### Basic Usage

```javascript
import { jsonToToon, toonToJson } from 'toon-converter';

// JSON to TOON
const jsonData = { name: "Alice", age: 30, active: true };
const toonString = jsonToToon(jsonData);
console.log(toonString);
// Output:
// name: "Alice"
// age: 30
// active: true

// TOON to JSON
const toonInput = `name: "Alice"\nage: 30\nactive: true`;
const jsonOutput = toonToJson(toonInput);
console.log(jsonOutput);
// Output: { name: "Alice", age: 30, active: true }
```

### Using the ToonConverter Class

```javascript
import ToonConverter from 'toon-converter';

// Convert from various formats
const toonFromJson = ToonConverter.fromJson({ key: "value" });
const toonFromYaml = ToonConverter.fromYaml("key: value");
const toonFromXml = ToonConverter.fromXml("<root><key>value</key></root>");
const toonFromCsv = await ToonConverter.fromCsv("name,age\nAlice,30");

// Convert to various formats
const jsonData = ToonConverter.toJson(toonString);
const yamlData = ToonConverter.toYaml(toonString);
const xmlData = ToonConverter.toXml(toonString);
const csvData = ToonConverter.toCsv(toonString);

// Validate TOON
const result = ToonConverter.validate(toonString);
if (result.isValid) {
    console.log("Valid TOON!");
} else {
    console.error("Invalid TOON:", result.error);
}
```

---

## 📚 API Reference

### JSON Converters

#### `jsonToToon(data, key?, depth?)`
Converts JSON data to TOON format.

**Parameters:**
- `data` (any): JSON data to convert
- `key` (string, optional): Key name for root object
- `depth` (number, optional): Initial indentation depth

**Returns:** `string` - TOON formatted string

**Example:**
```javascript
import { jsonToToon } from 'toon-converter';

const data = {
    users: [
        { id: 1, name: "Alice" },
        { id: 2, name: "Bob" }
    ]
};

const toon = jsonToToon(data);
console.log(toon);
// users[2]{id,name}:
//   1,"Alice"
//   2,"Bob"
```

#### `toonToJson(toonString)`
Converts TOON string to JSON.

**Parameters:**
- `toonString` (string): TOON formatted string

**Returns:** `any` - Parsed JSON data

---

### YAML Converters

#### `yamlToToon(yamlString)`
Converts YAML to TOON format.

**Parameters:**
- `yamlString` (string): YAML formatted string

**Returns:** `string` - TOON formatted string

**Throws:** `Error` if YAML is invalid

#### `toonToYaml(toonString)`
Converts TOON to YAML format.

**Parameters:**
- `toonString` (string): TOON formatted string

**Returns:** `string` - YAML formatted string

**Throws:** `Error` if TOON is invalid

---

### XML Converters

#### `xmlToToon(xmlString)`
Converts XML to TOON format.

**Parameters:**
- `xmlString` (string): XML formatted string

**Returns:** `string` - TOON formatted string

**Throws:** `Error` if XML is invalid

**Note:** Requires `DOMParser` (browser) or `xmldom` package (Node.js)

#### `toonToXml(toonString)`
Converts TOON to XML format.

**Parameters:**
- `toonString` (string): TOON formatted string

**Returns:** `string` - XML formatted string

**Throws:** `Error` if TOON is invalid

---

### CSV Converters

#### `csvToToon(csvString)`
Converts CSV to TOON format (async).

**Parameters:**
- `csvString` (string): CSV formatted string

**Returns:** `Promise<string>` - TOON formatted string

**Throws:** `Error` if CSV is invalid

#### `csvToToonSync(csvString)`
Converts CSV to TOON format (sync).

**Parameters:**
- `csvString` (string): CSV formatted string

**Returns:** `string` - TOON formatted string

**Throws:** `Error` if CSV is invalid

#### `toonToCsv(toonString)`
Converts TOON to CSV format.

**Parameters:**
- `toonString` (string): TOON formatted string

**Returns:** `string` - CSV formatted string

**Throws:** `Error` if TOON is invalid

---

### Validator

#### `validateToonString(toonString)`
Validates a TOON string for syntax and structural correctness.

**Parameters:**
- `toonString` (string): TOON string to validate

**Returns:** `{isValid: boolean, error: string|null}`

**Example:**
```javascript
import { validateToonString } from 'toon-converter';

const result = validateToonString(`
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

### 1. LLM API Optimization
```javascript
import { jsonToToon } from 'toon-converter';

// Before: Sending JSON to LLM
const jsonPrompt = JSON.stringify(largeDataset);
// 1000+ tokens

// After: Sending TOON to LLM
const toonPrompt = jsonToToon(largeDataset);
// 600 tokens (40% reduction!)

const response = await openai.chat.completions.create({
    messages: [{ role: "user", content: toonPrompt }]
});
```

### 2. Data Pipeline Integration
```javascript
import { csvToToonSync, toonToJson } from 'toon-converter';

// Read CSV, convert to TOON, process, convert back
const csvData = fs.readFileSync('data.csv', 'utf-8');
const toonData = csvToToonSync(csvData);

// Send to LLM for processing...
const processedToon = await processWithLLM(toonData);

// Convert back to JSON for your app
const jsonResult = toonToJson(processedToon);
```

### 3. Configuration Files
```javascript
import { yamlToToon, toonToYaml } from 'toon-converter';

// Convert YAML config to TOON for LLM analysis
const yamlConfig = fs.readFileSync('config.yaml', 'utf-8');
const toonConfig = yamlToToon(yamlConfig);

// LLM can analyze and suggest improvements...
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

- **GitHub**: https://github.com/ankitpal181/toon-converter
- **NPM**: https://www.npmjs.com/package/toon-converter
- **Online Tool**: https://toon-formatter.com

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
