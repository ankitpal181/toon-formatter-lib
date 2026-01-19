# 🚀 TOON Converter

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node >=16.0.0](https://img.shields.io/badge/Node-%3E%3D16.0.0-blue.svg)](https://nodejs.org/en/download)
[![LLM APIs cost reduction](https://img.shields.io/badge/LLM%20APIs-Up%20to%2040%25%20cost%20reduction-orange)](https://toonformatter.net/)

A lightweight library to convert between **TOON** (Token-Oriented Object Notation) and popular data formats (JSON, YAML, XML, CSV).

**Reduce your LLM token costs by up to 40%** using the TOON format!

- **Documentation**: https://toonformatter.net/docs.html?package=toon-formatter
- **Source Code**: https://github.com/ankitpal181/toon-formatter-lib
- **Bug Reports**: https://github.com/ankitpal181/toon-formatter-lib/issues
- **POC Tool**: https://toonformatter.net/

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

## 💻 CLI Utility

**NEW in v2.1.0**: TOON Formatter now includes a powerful CLI utility for fast data conversion directly from your terminal!

### Global Installation
To use the `toon-formatter` command anywhere:
```bash
npm install -g toon-formatter
```
Or run it instantly without installation using `npx`:
```bash
npx toon-formatter --help
```

### Basic Usage
Convert files or piped data easily:
```bash
# Convert JSON file to TOON
toon-formatter --from json --to toon -i data.json -o data.toon

# Piping data (JSON -> TOON)
echo '{"name": "Alice"}' | toon-formatter --from json --to toon

# Convert XML to JSON (prettified by default)
cat profile.xml | toon-formatter --from xml --to json
```

### Advanced Features
The CLI supports all library features, including validation and encryption:

```bash
# Validate a TOON string
cat data.toon | toon-formatter --validate toon

# Encrypt data during conversion (XOR)
echo '{"secret": "data"}' | toon-formatter --from json --to toon --mode export --key "mykey" --algo xor

# Decrypt data (AES-256-GCM)
cat encrypted.txt | toon-formatter --from toon --to json --mode ingestion --key "your-32-byte-key" --algo aes-256-gcm
```

### CLI Options
| Flag | Short | Description |
|------|-------|-------------|
| `--from` | `-f` | Input format (json, yaml, xml, csv, toon) |
| `--to` | `-t` | Output format (json, yaml, xml, csv, toon) |
| `--input` | `-i` | Input file path (defaults to stdin) |
| `--output` | `-o` | Output file path (defaults to stdout) |
| `--validate` | `-v` | Validate the input format and exit |
| `--mode` | `-m` | Encryption mode (middleware, ingestion, export) |
| `--key` | `-k` | Encryption key |
| `--algo` | `-a` | Encryption algorithm (aes-256-gcm, xor, base64) |
| `--async` | | Use asynchronous conversion mode |
| `--no-parse` | | Skip parsing of objects (returns raw strings) |
| `--help` | `-h` | Show help information |

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
- ✅ **Supports mixed text**: `jsonToToon`, `xmlToToon`, `csvToToon`
- ❌ **Pure data only**: `yamlToToon`, `toonToJson`, `toonToXml`, `toonToCsv`, `toonToYaml`

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
| `yamlToToon()` | ✅ | ❌ | Pure YAML only |
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

```

---

## 🔐 Encryption Support

**NEW in v2.0.0**: The TOON Converter now supports end-to-end encryption for secure data transmission and storage!

### Overview

The encryption feature allows you to:
- **Encrypt data before transmission** to protect sensitive information
- **Store encrypted TOON data** securely
- **Process encrypted data** without exposing plaintext
- **Support multiple encryption algorithms**: AES-256-GCM, XOR, Base64

### Quick Start with Encryption

```javascript
import { ToonConverter, Encryptor } from 'toon-formatter';

// 1. Generate a secure encryption key
const key = Encryptor.generateKey(); // 32-byte key for AES-256-GCM

// 2. Create an encryptor
const encryptor = new Encryptor(key, 'aes-256-gcm');

// 3. Create a converter with encryption support
const converter = new ToonConverter(encryptor);

// 4. Convert and encrypt data
const data = { user: "Alice", role: "admin" };
const encryptedToon = converter.fromJson(data, { 
    conversionMode: 'export' 
});

console.log(encryptedToon); // Encrypted string

// 5. Decrypt and convert back
const decrypted = encryptor.decrypt(encryptedToon);
console.log(decrypted); // Plain TOON string
```

### Encryption Algorithms

#### AES-256-GCM (Recommended)
High-security authenticated encryption with Galois/Counter Mode.

```javascript
const key = Encryptor.generateKey(); // Generates 32-byte key
const encryptor = new Encryptor(key, 'aes-256-gcm');
```

**Features:**
- ✅ Military-grade encryption
- ✅ Authentication tag prevents tampering
- ✅ Random IV for each encryption
- ✅ No external dependencies (uses Node.js crypto)

#### XOR Cipher
Simple obfuscation (not cryptographically secure).

```javascript
const encryptor = new Encryptor('my-secret-key', 'xor');
```

**Use cases:**
- Quick obfuscation
- Non-sensitive data
- Deterministic encryption

#### Base64 Encoding
Simple encoding (not encryption).

```javascript
const encryptor = new Encryptor(null, 'base64');
```

**Use cases:**
- Data encoding
- Testing
- Non-sensitive transformations

### Conversion Modes

The encryption system supports **4 conversion modes** for different data flow scenarios:

#### 1. `no_encryption` (Default)
No encryption applied - standard conversion.

```javascript
const converter = new ToonConverter(encryptor);
const toon = converter.fromJson(data); // Plain TOON
```

#### 2. `middleware` Mode
**Encrypted → Encrypted** (Decrypt → Convert → Re-encrypt)

Perfect for middleware services that need to convert format without exposing data.

```javascript
// Input: Encrypted JSON
const encryptedJson = '...'; // From client

// Convert to encrypted TOON (never see plaintext)
const encryptedToon = converter.fromJson(encryptedJson, {
    conversionMode: 'middleware'
});

// Output: Encrypted TOON (can be stored or forwarded)
```

**Use case:** API gateway converting encrypted client data to encrypted storage format.

#### 3. `ingestion` Mode
**Encrypted → Plain** (Decrypt → Convert)

For ingesting encrypted data into your system.

```javascript
// Input: Encrypted JSON from external source
const encryptedJson = '...';

// Convert to plain TOON for processing
const plainToon = converter.fromJson(encryptedJson, {
    conversionMode: 'ingestion'
});

// Output: Plain TOON (ready for processing)
```

**Use case:** Receiving encrypted data from clients and converting to internal format.

#### 4. `export` Mode
**Plain → Encrypted** (Convert → Encrypt)

For exporting data securely.

```javascript
// Input: Plain JSON data
const data = { user: "Alice", role: "admin" };

// Convert and encrypt for transmission
const encryptedToon = converter.fromJson(data, {
    conversionMode: 'export'
});

// Output: Encrypted TOON (safe to transmit)
```

**Use case:** Sending data to external systems or clients securely.

### Real-World Example: Secure API Pipeline

```javascript
import { ToonConverter, Encryptor } from 'toon-formatter';

// Setup (same key on client and server)
const key = Encryptor.generateKey();
const encryptor = new Encryptor(key, 'aes-256-gcm');

// CLIENT SIDE
// ============
const clientConverter = new ToonConverter(encryptor);

// 1. User submits sensitive data
const userData = {
    ssn: "123-45-6789",
    creditCard: "4111-1111-1111-1111",
    email: "alice@example.com"
};

// 2. Encrypt before sending
const encryptedPayload = encryptor.encrypt(JSON.stringify(userData));

// 3. Send to server
await fetch('/api/user', {
    method: 'POST',
    body: encryptedPayload
});

// SERVER SIDE (Middleware)
// =========================
const serverConverter = new ToonConverter(encryptor);

// 4. Receive encrypted data
const encryptedJson = await request.text();

// 5. Convert to encrypted TOON for storage (middleware mode)
const encryptedToon = serverConverter.fromJson(encryptedJson, {
    conversionMode: 'middleware'
});

// 6. Store encrypted TOON in database
await db.save(encryptedToon);

// SERVER SIDE (Processing)
// =========================
// 7. Retrieve encrypted TOON
const storedToon = await db.get(userId);

// 8. Convert back to plain JSON for processing (ingestion mode)
const plainData = serverConverter.toJson(storedToon, {
    conversionMode: 'ingestion',
    returnJson: true
});

// 9. Process data
const user = JSON.parse(plainData);
console.log(user.email); // alice@example.com
```

### Working with `returnJson` Parameter

By default, `toJson()` returns a JavaScript object. For encryption modes, you need a string. Use `returnJson: true`:

```javascript
// Returns object (default)
const obj = converter.toJson(toonString);
console.log(obj); // { name: "Alice" }

// Returns JSON string (for encryption)
const jsonString = converter.toJson(toonString, { returnJson: true });
console.log(jsonString); // '{"name":"Alice"}'

// With encryption
const encrypted = converter.toJson(toonString, {
    conversionMode: 'export',
    returnJson: true  // Required for encryption!
});
```

### Key Management Best Practices

#### 🔑 Generating Keys

```javascript
// Generate a secure random key
const key = Encryptor.generateKey();

// Store as Base64 (e.g., in environment variables)
const keyBase64 = key.toString('base64');
process.env.ENCRYPTION_KEY = keyBase64;

// Load from storage
const loadedKey = Buffer.from(process.env.ENCRYPTION_KEY, 'base64');
const encryptor = new Encryptor(loadedKey, 'aes-256-gcm');
```

#### 🔒 Security Best Practices

1. **Never hardcode keys** in source code
2. **Use environment variables** or secure key management systems
3. **Rotate keys periodically** for long-term security
4. **Use AES-256-GCM** for production (not XOR or Base64)
5. **Protect keys at rest** with proper file permissions
6. **Use HTTPS** for transmitting encrypted data
7. **Implement key rotation** strategy

#### 🔄 Key Rotation Example

```javascript
// Old system
const oldKey = Buffer.from(process.env.OLD_KEY, 'base64');
const oldEncryptor = new Encryptor(oldKey, 'aes-256-gcm');

// New system
const newKey = Encryptor.generateKey();
const newEncryptor = new Encryptor(newKey, 'aes-256-gcm');

// Migrate data
const encryptedData = await db.getAllEncrypted();

for (const item of encryptedData) {
    // Decrypt with old key
    const plaintext = oldEncryptor.decrypt(item.data);
    
    // Re-encrypt with new key
    const reEncrypted = newEncryptor.encrypt(plaintext);
    
    // Update database
    await db.update(item.id, reEncrypted);
}

// Update environment variable
process.env.ENCRYPTION_KEY = newKey.toString('base64');
```

### Error Handling

```javascript
try {
    const encrypted = encryptor.encrypt(data);
    const decrypted = encryptor.decrypt(encrypted);
} catch (error) {
    if (error.message.includes('decryption failed')) {
        console.error('Wrong key or tampered data');
    } else if (error.message.includes('Invalid encrypted data format')) {
        console.error('Corrupted ciphertext');
    } else {
        console.error('Encryption error:', error.message);
    }
}
```

### Async Encryption

All encryption operations work with async methods:

```javascript
const converter = new ToonConverter(encryptor);

// Async conversion with encryption
const encrypted = await converter.fromJsonAsync(data, {
    conversionMode: 'export'
});

const decrypted = await converter.toJsonAsync(encrypted, {
    conversionMode: 'ingestion',
    returnJson: true
});
```

### Migration Guide

#### From Static to Instance API

**Before (no encryption):**
```javascript
import { ToonConverter } from 'toon-formatter';

const toon = ToonConverter.fromJson(data);
const json = ToonConverter.toJson(toon);
```

**After (with encryption):**
```javascript
import { ToonConverter, Encryptor } from 'toon-formatter';

// Create encryptor
const key = Encryptor.generateKey();
const encryptor = new Encryptor(key, 'aes-256-gcm');

// Create converter instance
const converter = new ToonConverter(encryptor);

// Use instance methods
const encrypted = converter.fromJson(data, { conversionMode: 'export' });
const plain = converter.toJson(encrypted, { conversionMode: 'ingestion' });
```

**Note:** Static methods still work for backward compatibility (no encryption).

### Performance Considerations

- **AES-256-GCM**: ~0.5-1ms per operation (recommended)
- **XOR**: ~0.1ms per operation (fast but insecure)
- **Base64**: ~0.05ms per operation (fastest, no security)

For high-throughput applications, consider:
- Batch processing
- Caching decrypted data (with proper TTL)
- Using middleware mode to avoid double encryption/decryption

---

## 📚 API Reference


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

#### `toonToJsonSync(toonString, returnJson?)`
Converts TOON string to JSON (synchronous).

**Supports:** ❌ Pure TOON data only (no mixed text)

**Parameters:**
- `toonString` (string): TOON formatted string
- `returnJson` (boolean, optional): If `true`, returns JSON string; if `false` (default), returns object

**Returns:** `any | string` - Parsed JSON data (object by default, string if `returnJson=true`)

#### `toonToJson(toonString, returnJson?)`
Converts TOON string to JSON (asynchronous).

**Supports:** ❌ Pure TOON data only (no mixed text)

**Parameters:**
- `toonString` (string): TOON formatted string
- `returnJson` (boolean, optional): If `true`, returns JSON string; if `false` (default), returns object

**Returns:** `Promise<any | string>` - Parsed JSON data (object by default, string if `returnJson=true`)

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


---

### Encryptor Class

The `Encryptor` class provides encryption and decryption capabilities.

#### `new Encryptor(key, algorithm)`
Creates a new Encryptor instance.

**Parameters:**
- `key` (Buffer | string | null): Encryption key
  - For `aes-256-gcm`: 32-byte Buffer (use `Encryptor.generateKey()`)
  - For `xor`: String or Buffer
  - For `base64`: null (no key needed)
- `algorithm` (string): Encryption algorithm - `'aes-256-gcm'`, `'xor'`, or `'base64'`

**Example:**
```javascript
// AES-256-GCM (recommended)
const key = Encryptor.generateKey();
const encryptor = new Encryptor(key, 'aes-256-gcm');

// XOR
const xorEncryptor = new Encryptor('my-secret-key', 'xor');

// Base64
const base64Encryptor = new Encryptor(null, 'base64');
```

#### `Encryptor.generateKey()`
Static method to generate a secure 32-byte encryption key for AES-256-GCM.

**Returns:** `Buffer` - 32-byte random key

**Example:**
```javascript
const key = Encryptor.generateKey();
console.log(key.length); // 32

// Store as Base64
const keyBase64 = key.toString('base64');
process.env.ENCRYPTION_KEY = keyBase64;

// Load from Base64
const loadedKey = Buffer.from(process.env.ENCRYPTION_KEY, 'base64');
```

#### `encryptor.encrypt(data)`
Encrypts a string.

**Parameters:**
- `data` (string): Plaintext string to encrypt

**Returns:** `string` - Encrypted string (hex-encoded for AES-256-GCM and XOR, Base64 for base64)

**Throws:** Error if data is not a string or key is missing (for AES/XOR)

**Example:**
```javascript
const encrypted = encryptor.encrypt('Hello, World!');
console.log(encrypted); // Hex string (AES-256-GCM)
```

#### `encryptor.decrypt(encryptedData)`
Decrypts an encrypted string.

**Parameters:**
- `encryptedData` (string): Encrypted string

**Returns:** `string` - Decrypted plaintext

**Throws:** Error if decryption fails, wrong key, or tampered data

**Example:**
```javascript
const decrypted = encryptor.decrypt(encrypted);
console.log(decrypted); // 'Hello, World!'
```

---

### ToonConverter Class (with Encryption)

The `ToonConverter` class now supports both static methods (backward compatible) and instance methods (with encryption).

#### `new ToonConverter(encryptor?)`
Creates a new ToonConverter instance.

**Parameters:**
- `encryptor` (Encryptor | null, optional): Encryptor instance for encryption support

**Example:**
```javascript
// Without encryption
const converter = new ToonConverter();

// With encryption
const key = Encryptor.generateKey();
const encryptor = new Encryptor(key, 'aes-256-gcm');
const converter = new ToonConverter(encryptor);
```

#### Instance Methods with Encryption Support

All instance methods accept an `options` object with:
- `conversionMode` (string): `'no_encryption'` (default), `'middleware'`, `'ingestion'`, or `'export'`
- `returnJson` (boolean, for `toJson` methods): If `true`, returns JSON string; if `false` (default), returns object

**Example:**
```javascript
// fromJson with encryption
const encrypted = converter.fromJson(data, {
    conversionMode: 'export'
});

// toJson with encryption and JSON string output
const jsonString = converter.toJson(toonString, {
    conversionMode: 'ingestion',
    returnJson: true
});

// fromYaml with middleware mode
const encryptedToon = converter.fromYaml(encryptedYaml, {
    conversionMode: 'middleware'
});
```

**Available instance methods:**
- `fromJson(data, options?)` / `fromJsonAsync(data, options?)`
- `toJson(toonString, options?)` / `toJsonAsync(toonString, options?)`
- `fromYaml(yamlString, options?)` / `fromYamlAsync(yamlString, options?)`
- `toYaml(toonString, options?)` / `toYamlAsync(toonString, options?)`
- `fromXml(xmlString, options?)` / `fromXmlAsync(xmlString, options?)`
- `toXml(toonString, options?)` / `toXmlAsync(toonString, options?)`
- `fromCsv(csvString, options?)` / `fromCsvAsync(csvString, options?)`
- `toCsv(toonString, options?)` / `toCsvAsync(toonString, options?)`
- `validate(toonString)` / `validateAsync(toonString)`

#### Static Methods (Backward Compatible)

Static methods work exactly as before, with no encryption support:

```javascript
// Static usage (no encryption)
const toon = ToonConverter.fromJson(data);
const json = ToonConverter.toJson(toon);

// Static with returnJson parameter
const jsonString = ToonConverter.toJson(toon, true);
```

**Note:** For `toJson` and `toJsonAsync` static methods, you can pass `returnJson` as the second parameter:
```javascript
ToonConverter.toJson(toonString, returnJson?)
ToonConverter.toJsonAsync(toonString, returnJson?)
```

---

### Unified Format Converters (v2.0.0+)

The library now includes specialized, unified converters for each major format. These are perfect when you need to convert between non-TOON formats (like XML to JSON or CSV to YAML) while still having access to TOON and encryption features.

#### Available Unified Converters:
- `JsonConverter`: Specialized in JSON input/output
- `YamlConverter`: Specialized in YAML input/output
- `XmlConverter`: Specialized in XML input/output
- `CsvConverter`: Specialized in CSV input/output

#### Example: Cross-Format Conversion
```javascript
import { XmlConverter, YamlConverter } from 'toon-formatter';

// Convert XML directly to YAML
const xmlData = '<user><name>Alice</name></user>';
const yamlData = XmlConverter.toYaml(xmlData);

// Convert YAML directly to CSV
const csvData = YamlConverter.toCsv("name: Alice\nrole: admin");
```

---

### JsonConverter Class

Specialized for JSON-centric workflows. It can convert JSON to any format and any format back to JSON.

#### Instance Methods (with Encryption)
```javascript
import { JsonConverter, Encryptor } from 'toon-formatter';

const converter = new JsonConverter(new Encryptor(key, 'aes-256-gcm'));

// JSON -> TOON (Encrypted)
const encryptedToon = converter.toToon(data, { conversionMode: 'export' });

// XML -> JSON (Decrypted)
const jsonData = converter.fromXml(encryptedXml, { conversionMode: 'ingestion' });
```

#### Static Methods (No Encryption)
```javascript
// Convert TOON to JSON object
const obj = JsonConverter.fromToon(toonString);

// Convert TOON to JSON string
const json = JsonConverter.fromToon(toonString, { returnJson: true });

// Convert JSON to XML
const xml = JsonConverter.toXml({ name: "Alice" });
```

**Available Methods:**
- `fromToon(toonString, options?)` / `fromToonAsync(toonString, options?)`
- `toToon(data, options?)` / `toToonAsync(data, options?)`
- `fromYaml(yamlString, options?)` / `fromYamlAsync(yamlString, options?)`
- `toYaml(data, options?)` / `toYamlAsync(data, options?)`
- `fromXml(xmlString, options?)` / `fromXmlAsync(xmlString, options?)`
- `toXml(data, options?)` / `toXmlAsync(data, options?)`
- `fromCsv(csvString, options?)` / `fromCsvAsync(csvString, options?)`
- `toCsv(data, options?)` / `toCsvAsync(data, options?)`

---

### YamlConverter Class

Specialized for YAML workflows.

#### Usage Example
```javascript
import { YamlConverter } from 'toon-formatter';

// YAML to TOON
const toon = YamlConverter.fromToon(testToon);

// YAML to JSON
const json = YamlConverter.toJson(yamlString, { returnJson: true });
```

**Available Methods:**
- `fromToon(toonString, options?)` / `fromToonAsync(toonString, options?)`
- `toToon(yamlString, options?)` / `toToonAsync(yamlString, options?)`
- `fromJson(jsonData, options?)` / `fromJsonAsync(jsonData, options?)`
- `toJson(yamlString, options?)` / `toJsonAsync(yamlString, options?)`
- `fromXml(xmlString, options?)` / `fromXmlAsync(xmlString, options?)`
- `toXml(yamlString, options?)` / `toXmlAsync(yamlString, options?)`
- `fromCsv(csvString, options?)` / `fromCsvAsync(csvString, options?)`
- `toCsv(yamlString, options?)` / `toCsvAsync(yamlString, options?)`

---

### XmlConverter Class

Specialized for XML workflows. Supports mixed-text extraction automatically.

#### Usage Example
```javascript
import { XmlConverter } from 'toon-formatter';

// XML to TOON
const toon = XmlConverter.fromToon(xmlString);

// JSON to XML
const xml = XmlConverter.fromJson(jsonData);
```

**Available Methods:**
- `fromToon(toonString, options?)` / `fromToonAsync(toonString, options?)`
- `toToon(xmlString, options?)` / `toToonAsync(xmlString, options?)`
- `fromJson(jsonData, options?)` / `fromJsonAsync(jsonData, options?)`
- `toJson(xmlString, options?)` / `toJsonAsync(xmlString, options?)`
- `fromYaml(yamlString, options?)` / `fromYamlAsync(yamlString, options?)`
- `toYaml(xmlString, options?)` / `toYamlAsync(xmlString, options?)`
- `fromCsv(csvString, options?)` / `fromCsvAsync(csvString, options?)`
- `toCsv(xmlString, options?)` / `toCsvAsync(xmlString, options?)`

---

### CsvConverter Class

Specialized for CSV workflows.

#### Usage Example
```javascript
import { CsvConverter } from 'toon-formatter';

// CSV to TOON
const toon = CsvConverter.fromToon(csvString);

// JSON to CSV
const csv = CsvConverter.fromJson(jsonData);
```

**Available Methods:**
- `fromToon(toonString, options?)` / `fromToonAsync(toonString, options?)`
- `toToon(csvString, options?)` / `toToonAsync(csvString, options?)`
- `fromJson(jsonData, options?)` / `fromJsonAsync(jsonData, options?)`
- `toJson(csvString, options?)` / `toJsonAsync(csvString, options?)`
- `fromYaml(yamlString, options?)` / `fromYamlAsync(yamlString, options?)`
- `toYaml(csvString, options?)` / `toYamlAsync(csvString, options?)`
- `fromXml(xmlString, options?)` / `fromXmlAsync(xmlString, options?)`
- `toXml(csvString, options?)` / `toXmlAsync(csvString, options?)`

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

The library includes a comprehensive test suite with 150+ unit and integration tests.

```bash
# Run all tests (Unit, Integration, and CLI)
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
