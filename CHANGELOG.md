# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
## [2.3.1] - 2026-02-01

### Changed
- **Bug Fixes**
  - Extracting json from string stuck in infinite loop while dealing with toon array like: [2]{"a","b"}..
  - Code blocks extractor also fetching json data by confusing it with coding arrays

## [2.3.0] - 2026-01-27

### Added
- **🧠 Smart Code Optimization**
  - New preprocessing pipeline to maximize token efficiency for LLM contexts
  - **Code Detection & Reduction**: Automatic identification, comment stripping, and whitespace compression for scripts and commands
  - **Safe Expensive Words Replacement**: Case-insensitive abbreviation of 100+ verbose phrases in natural language text
  - **Security & Integrity**: Replacement logic strictly avoids altering code blocks or data (JSON/XML/CSV) to prevent syntactic issues
  - **Seamless Integration**: Automatically active for all mixed-text conversion methods (`jsonToToon`, `xmlToToon`, `csvToToon`, etc.)
- **🧪 Expanded Test Infrastructure**
  - Dedicated `code-optimization.test.js` for unit verification
  - New `optimization-integration.test.js` for high-level mixed-content validation
  - Total test suite expanded to 189 tests with 100% pass rate

### Changed
- Refined `isCode` heuristics to support common Node.js and shell execution patterns
- Optimized asynchronous pipeline in `dataManagerAsync` for better performance
- Improved mixed-text extraction robustness in `utils.js`


## [2.1.1] - 2025-12-18

### Added
- **🔄 Unified Format Converters**
  - New classes: `JsonConverter`, `YamlConverter`, `XmlConverter`, and `CsvConverter`
  - Direct translation between formats (e.g., XML ↔ JSON, CSV ↔ YAML)
  - Full encryption middleware support for all unified converters
  - Static and Instance API parity across all converters
- **📝 Enhanced Mixed-Text Support**
  - Standardized mixed-text extraction for JSON, XML, and CSV
  - Preserves surrounding text while converting embedded data blocks
- **📦 Improved Packaging**
  - Specific exports for all converters in `package.json`
  - Fixed Node.js XML support by moving `xmldom` to production dependencies
- **📚 Documentation Hub**
  - Comprehensive README updates with Unified Converter examples
  - New `toon-formatter.json` documentation for the web platform

### Changed
- Standardized `returnJson` default to `false` (returns objects/arrays) for consistency
- Refined internal conversion logic to better handle edge cases in mixed-text scenarios
- Improved package keywords and description for better SEO

## [2.0.0] - 2025-12-08

### Added
- **🔐 End-to-End Encryption Support**
  - New `Encryptor` class with AES-256-GCM, XOR, and Base64 algorithms
  - `Encryptor.generateKey()` static method for secure key generation
  - Instance-based `ToonConverter` API with encryption support
  - Four conversion modes: `no_encryption`, `middleware`, `ingestion`, `export`
  - Comprehensive encryption documentation and examples

- **New Features**
  - `returnJson` parameter for `toJson()` and `toJsonAsync()` methods
  - Support for encrypted data pipelines
  - Key rotation capabilities
  - Authentication tag validation (AES-256-GCM)

- **Testing**
  - 33 new encryption unit tests
  - 32 new integration tests
  - 8 backward compatibility tests
  - Total: 96 tests (all passing)

- **Documentation**
  - Complete encryption guide in README
  - Security best practices
  - Real-world examples
  - Migration guide
  - API reference for Encryptor and ToonConverter

### Changed
- `ToonConverter` now supports both static methods (backward compatible) and instance methods (with encryption)
- `toonToJsonSync()` and `toonToJson()` now accept optional `returnJson` parameter
- Updated package description to mention encryption support
- Enhanced package keywords for better discoverability

### Backward Compatibility
- ✅ All existing static methods work exactly as before
- ✅ Default behavior unchanged (`returnJson=false`)
- ✅ No breaking changes for existing users
- ✅ Full backward compatibility maintained

### Security
- AES-256-GCM encryption with random IV per operation
- Authentication tag prevents data tampering
- Secure key generation using Node.js crypto
- No external cryptographic dependencies

## [1.1.1] - Previous Release

### Features
- JSON, YAML, XML, CSV conversion support
- Mixed text extraction
- Synchronous and asynchronous APIs
- TOON validation
- Comprehensive test suite

---

## Migration Guide

### From v2.0 to v2.1

**To use Unified Converters:**

```javascript
import { JsonConverter, XmlConverter } from 'toon-formatter';

// Direct format-to-format
const xml = JsonConverter.toXml({ name: 'Alice' });

// With encryption
const converter = new JsonConverter(encryptor);
const encryptedXml = converter.toXml({ name: 'Alice' }, { conversionMode: 'export' });
```

### From v1.x to v2.0

**No changes required!** Version 2.0 is fully backward compatible.

**To use new encryption features:**

```javascript
// Old code (still works)
import ToonConverter from 'toon-formatter';
const toon = ToonConverter.fromJson(data);

// New code (with encryption)
import { ToonConverter, Encryptor } from 'toon-formatter';
const key = Encryptor.generateKey();
const encryptor = new Encryptor(key, 'aes-256-gcm');
const converter = new ToonConverter(encryptor);
const encrypted = converter.fromJson(data, { conversionMode: 'export' });
```

**To use returnJson parameter:**

```javascript
// Returns object (default, backward compatible)
const obj = ToonConverter.toJson(toonString);

// Returns JSON string (new feature)
const jsonString = ToonConverter.toJson(toonString, true);
```
