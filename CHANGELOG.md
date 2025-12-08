# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

### From v1.x to v2.0

**No changes required!** Version 2.0 is fully backward compatible.

**To use new encryption features:**

```javascript
// Old code (still works)
import { ToonConverter } from 'toon-formatter';
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
