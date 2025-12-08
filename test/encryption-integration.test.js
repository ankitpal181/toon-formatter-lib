/**
 * Integration Tests for Encryption Features
 * 
 * Tests all encryption modes with ToonConverter:
 * - Middleware mode (Encrypted → Encrypted)
 * - Ingestion mode (Encrypted → Plain)
 * - Export mode (Plain → Encrypted)
 * - No encryption mode
 * - Static vs instance usage
 * - Error handling
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { ToonConverter, Encryptor } from '../src/index.js';

describe('Encryption Integration Tests', () => {
    let aesKey;
    let aesEncryptor;
    let aesConverter;
    let base64Encryptor;
    let base64Converter;
    let plainConverter;
    let sampleData;
    let sampleToon;

    beforeEach(() => {
        // AES-256-GCM Setup
        aesKey = Encryptor.generateKey();
        aesEncryptor = new Encryptor(aesKey, 'aes-256-gcm');
        aesConverter = new ToonConverter(aesEncryptor);

        // Base64 Setup (for deterministic testing)
        base64Encryptor = new Encryptor(null, 'base64');
        base64Converter = new ToonConverter(base64Encryptor);

        // Plain Converter (no encryption)
        plainConverter = new ToonConverter();

        // Sample data
        sampleData = { name: "Alice", role: "admin" };
        sampleToon = 'name: "Alice"\nrole: "admin"';
    });

    // ========================================
    // 1. Middleware Mode (Encrypted → Encrypted)
    // ========================================

    describe('Middleware Mode', () => {
        it('should convert encrypted JSON to encrypted TOON (AES-256-GCM)', () => {
            // Encrypt input manually
            const rawJsonStr = '{"name": "Alice", "role": "admin"}';
            const encryptedInput = aesEncryptor.encrypt(rawJsonStr);

            // Convert with middleware mode
            const encryptedOutput = aesConverter.fromJson(encryptedInput, {
                conversionMode: 'middleware'
            });

            // Verify output is encrypted (different from input due to new IV)
            assert.notStrictEqual(encryptedOutput, encryptedInput);

            // Decrypt and verify TOON content
            const decryptedToon = aesEncryptor.decrypt(encryptedOutput);
            assert.ok(decryptedToon.includes('name: "Alice"'));
            assert.ok(decryptedToon.includes('role: "admin"'));
        });

        it('should convert encrypted TOON to encrypted JSON (middleware)', () => {
            // Encrypt TOON input
            const encryptedToon = aesEncryptor.encrypt(sampleToon);

            // Convert to JSON with middleware mode and returnJson=true for string output
            const encryptedJson = aesConverter.toJson(encryptedToon, {
                conversionMode: 'middleware',
                returnJson: true
            });

            // Verify it's encrypted
            assert.ok(typeof encryptedJson === 'string');
            assert.notStrictEqual(encryptedJson, encryptedToon);

            // Decrypt and verify JSON content
            const decryptedJson = aesEncryptor.decrypt(encryptedJson);
            const parsed = JSON.parse(decryptedJson);
            assert.strictEqual(parsed.name, 'Alice');
            assert.strictEqual(parsed.role, 'admin');
        });

        it('should handle middleware mode with Base64 (deterministic)', () => {
            // Base64 is deterministic, easier to verify
            const plainMixed = 'Msg: {"a": 1}';
            const encInput = Buffer.from(plainMixed, 'utf-8').toString('base64');

            // Middleware convert
            const resultEnc = base64Converter.fromJson(encInput, {
                conversionMode: 'middleware'
            });

            // Decrypt result
            const resultPlain = Buffer.from(resultEnc, 'base64').toString('utf-8');
            assert.ok(resultPlain.includes('a: 1'));
        });

        it('should work with async methods in middleware mode', async () => {
            const rawJsonStr = '{"x": 42}';
            const encryptedInput = aesEncryptor.encrypt(rawJsonStr);

            const encryptedOutput = await aesConverter.fromJsonAsync(encryptedInput, {
                conversionMode: 'middleware'
            });

            const decryptedToon = aesEncryptor.decrypt(encryptedOutput);
            assert.ok(decryptedToon.includes('x: 42'));
        });
    });

    // ========================================
    // 2. Ingestion Mode (Encrypted → Plain)
    // ========================================

    describe('Ingestion Mode', () => {
        it('should convert encrypted JSON to plain TOON', () => {
            const rawStr = '{"x": 100}';
            const encInput = aesEncryptor.encrypt(rawStr);

            // Ingestion mode: encrypted input → plain output
            const resultToon = aesConverter.fromJson(encInput, {
                conversionMode: 'ingestion'
            });

            // Result should be plain TOON
            assert.ok(resultToon.includes('x: 100'));

            // Should NOT be encrypted (attempting to decrypt should fail)
            assert.throws(() => {
                aesEncryptor.decrypt(resultToon);
            });
        });

        it('should convert encrypted TOON to plain JSON', () => {
            const encryptedToon = aesEncryptor.encrypt(sampleToon);

            // Ingestion mode with returnJson=true to get string output
            const resultJson = aesConverter.toJson(encryptedToon, {
                conversionMode: 'ingestion',
                returnJson: true
            });

            // Result should be plain JSON string
            const parsed = JSON.parse(resultJson);
            assert.strictEqual(parsed.name, 'Alice');
            assert.strictEqual(parsed.role, 'admin');
        });

        it('should work with async methods in ingestion mode', async () => {
            const rawStr = '{"y": 200}';
            const encInput = aesEncryptor.encrypt(rawStr);

            const resultToon = await aesConverter.fromJsonAsync(encInput, {
                conversionMode: 'ingestion'
            });

            assert.ok(resultToon.includes('y: 200'));
        });
    });

    // ========================================
    // 3. Export Mode (Plain → Encrypted)
    // ========================================

    describe('Export Mode', () => {
        it('should convert plain JSON to encrypted TOON', () => {
            // Plain data → encrypted TOON
            const resultEnc = aesConverter.fromJson(sampleData, {
                conversionMode: 'export'
            });

            // Result should be encrypted
            assert.ok(typeof resultEnc === 'string');
            assert.notStrictEqual(resultEnc, JSON.stringify(sampleData));

            // Decrypt and verify
            const decrypted = aesEncryptor.decrypt(resultEnc);
            assert.ok(decrypted.includes('name: "Alice"'));
            assert.ok(decrypted.includes('role: "admin"'));
        });

        it('should convert plain TOON to encrypted JSON', () => {
            // Plain TOON → encrypted JSON (using returnJson=true)
            const encJson = aesConverter.toJson(sampleToon, {
                conversionMode: 'export',
                returnJson: true
            });

            // Result should be encrypted
            assert.ok(typeof encJson === 'string');

            // Decrypt and verify
            const decrypted = aesEncryptor.decrypt(encJson);
            assert.ok(decrypted.includes('"name"'));
            assert.ok(decrypted.includes('"Alice"'));
        });

        it('should work with async methods in export mode', async () => {
            const data = { z: 300 };

            const resultEnc = await aesConverter.fromJsonAsync(data, {
                conversionMode: 'export'
            });

            const decrypted = aesEncryptor.decrypt(resultEnc);
            assert.ok(decrypted.includes('z: 300'));
        });
    });

    // ========================================
    // 4. No Encryption Mode
    // ========================================

    describe('No Encryption Mode', () => {
        it('should not encrypt when mode is no_encryption', () => {
            // Using encrypted converter but with no_encryption mode
            const result = aesConverter.fromJson(sampleData, {
                conversionMode: 'no_encryption'
            });

            // Result should be plain TOON
            assert.ok(result.includes('name: "Alice"'));
            assert.ok(result.includes('role: "admin"'));

            // Should NOT be encrypted
            assert.throws(() => {
                aesEncryptor.decrypt(result);
            });
        });

        it('should work without options (defaults to no_encryption)', () => {
            const result = aesConverter.fromJson(sampleData);

            // Should be plain TOON (default mode is no_encryption)
            assert.ok(result.includes('name: "Alice"'));
        });
    });

    // ========================================
    // 5. All Converter Methods
    // ========================================

    describe('All Converter Methods', () => {
        it('should support encryption for YAML conversions', () => {
            const yamlString = 'name: Alice\nage: 30';
            const encryptedYaml = aesEncryptor.encrypt(yamlString);

            // Middleware: encrypted YAML → encrypted TOON
            const encryptedToon = aesConverter.fromYaml(encryptedYaml, {
                conversionMode: 'middleware'
            });

            const decryptedToon = aesEncryptor.decrypt(encryptedToon);
            assert.ok(decryptedToon.includes('name: "Alice"'));
        });

        it('should support encryption for XML conversions', () => {
            const xmlString = '<user><name>Alice</name></user>';
            const encryptedXml = aesEncryptor.encrypt(xmlString);

            // Ingestion: encrypted XML → plain TOON
            const plainToon = aesConverter.fromXml(encryptedXml, {
                conversionMode: 'ingestion'
            });

            // XML conversion creates nested structure
            assert.ok(plainToon.includes('Alice'));
        });

        it('should support encryption for CSV conversions', () => {
            const csvString = 'name,role\nAlice,admin';
            const encryptedCsv = aesEncryptor.encrypt(csvString);

            // Ingestion: encrypted CSV → plain TOON
            const plainToon = aesConverter.fromCsv(encryptedCsv, {
                conversionMode: 'ingestion'
            });

            assert.ok(plainToon.includes('Alice'));
            assert.ok(plainToon.includes('admin'));
        });

        it('should support async YAML conversions with encryption', async () => {
            const yamlString = 'key: value';

            const encryptedToon = await aesConverter.fromYamlAsync(yamlString, {
                conversionMode: 'export'
            });

            const decrypted = aesEncryptor.decrypt(encryptedToon);
            assert.ok(decrypted.includes('key: "value"'));
        });

        it('should support async XML conversions with encryption', async () => {
            const xmlString = '<item>test</item>';

            const encryptedToon = await aesConverter.fromXmlAsync(xmlString, {
                conversionMode: 'export'
            });

            const decrypted = aesEncryptor.decrypt(encryptedToon);
            assert.ok(decrypted.includes('item:'));
        });

        it('should support async CSV conversions with encryption', async () => {
            const csvString = 'id,name\n1,Bob';

            const encryptedToon = await aesConverter.fromCsvAsync(csvString, {
                conversionMode: 'export'
            });

            const decrypted = aesEncryptor.decrypt(encryptedToon);
            assert.ok(decrypted.includes('Bob'));
        });
    });

    // ========================================
    // 6. Static vs Instance Usage
    // ========================================

    describe('Static vs Instance Usage', () => {
        it('should maintain backward compatibility with static methods', () => {
            const data = { static: "check" };

            // Static call (no encryption)
            const result = ToonConverter.fromJson(data);

            assert.ok(result.includes('static: "check"'));

            // Round trip - default returnJson=false returns object
            const jsonOut = ToonConverter.toJson(result);
            assert.strictEqual(jsonOut.static, 'check');

            // With returnJson=true, get JSON string
            const jsonString = ToonConverter.toJson(result, true);
            assert.ok(typeof jsonString === 'string');
            const parsed = JSON.parse(jsonString);
            assert.strictEqual(parsed.static, 'check');
        });

        it('should work with instance without encryptor', () => {
            const converter = new ToonConverter();
            const result = converter.fromJson(sampleData);

            assert.ok(result.includes('name: "Alice"'));
        });

        it('should differentiate static and instance calls', () => {
            // Static call
            const staticResult = ToonConverter.fromJson(sampleData);

            // Instance call with encryption
            const instanceResult = aesConverter.fromJson(sampleData, {
                conversionMode: 'export'
            });

            // Static result is plain, instance result is encrypted
            assert.ok(staticResult.includes('name: "Alice"'));
            assert.notStrictEqual(instanceResult, staticResult);

            // Instance result can be decrypted
            const decrypted = aesEncryptor.decrypt(instanceResult);
            assert.ok(decrypted.includes('name: "Alice"'));
        });

        it('should support async static methods', async () => {
            const data = { async: "test" };

            const result = await ToonConverter.fromJsonAsync(data);

            assert.ok(result.includes('async: "test"'));
        });
    });

    // ========================================
    // 7. Error Handling
    // ========================================

    describe('Error Handling', () => {
        it('should handle decryption errors gracefully', () => {
            const invalidEncrypted = 'not-valid-encrypted-data';

            assert.throws(() => {
                aesConverter.fromJson(invalidEncrypted, {
                    conversionMode: 'middleware'
                });
            });
        });

        it('should handle wrong key decryption', () => {
            const key1 = Encryptor.generateKey();
            const key2 = Encryptor.generateKey();
            const enc1 = new Encryptor(key1, 'aes-256-gcm');
            const enc2 = new Encryptor(key2, 'aes-256-gcm');

            const encrypted = enc1.encrypt('{"test": "data"}');

            const converter2 = new ToonConverter(enc2);

            assert.throws(() => {
                converter2.fromJson(encrypted, {
                    conversionMode: 'middleware'
                });
            });
        });

        it('should handle invalid conversion modes gracefully', () => {
            // Invalid mode should fall back to default behavior
            const result = aesConverter.fromJson(sampleData, {
                conversionMode: 'invalid-mode'
            });

            // Should just convert normally
            assert.ok(result.includes('name: "Alice"'));
        });
    });

    // ========================================
    // 8. Real-World Scenarios
    // ========================================

    describe('Real-World Scenarios', () => {
        it('should handle complete encrypted data pipeline', () => {
            // Step 1: Client encrypts data before sending
            const clientData = { user: "Bob", action: "login" };
            const clientEncryptor = new Encryptor(aesKey, 'aes-256-gcm');
            const encryptedPayload = clientEncryptor.encrypt(JSON.stringify(clientData));

            // Step 2: Server receives and converts (middleware)
            const serverConverter = new ToonConverter(new Encryptor(aesKey, 'aes-256-gcm'));
            const encryptedToon = serverConverter.fromJson(encryptedPayload, {
                conversionMode: 'middleware'
            });

            // Step 3: Server stores encrypted TOON
            assert.ok(typeof encryptedToon === 'string');

            // Step 4: Server retrieves and converts back (middleware with returnJson=true)
            const encryptedJsonOut = serverConverter.toJson(encryptedToon, {
                conversionMode: 'middleware',
                returnJson: true
            });

            // Step 5: Client decrypts
            const decryptedJson = clientEncryptor.decrypt(encryptedJsonOut);
            const finalData = JSON.parse(decryptedJson);

            assert.strictEqual(finalData.user, 'Bob');
            assert.strictEqual(finalData.action, 'login');
        });

        it('should handle mixed text with encryption', () => {
            const mixedText = 'Check this: {"user": "Bob"}. End.';
            const encrypted = aesEncryptor.encrypt(mixedText);

            const result = aesConverter.fromJson(encrypted, {
                conversionMode: 'ingestion'
            });

            assert.ok(result.includes('Check this:'));
            assert.ok(result.includes('user: "Bob"'));
            assert.ok(result.includes('. End.'));
        });

        it('should support key rotation scenario', () => {
            // Old key
            const oldKey = Encryptor.generateKey();
            const oldEncryptor = new Encryptor(oldKey, 'aes-256-gcm');
            const oldConverter = new ToonConverter(oldEncryptor);

            // Encrypt with old key
            const encrypted = oldConverter.fromJson(sampleData, {
                conversionMode: 'export'
            });

            // Decrypt with old key, re-encrypt with new key
            const decrypted = oldEncryptor.decrypt(encrypted);

            const newKey = Encryptor.generateKey();
            const newEncryptor = new Encryptor(newKey, 'aes-256-gcm');
            const reEncrypted = newEncryptor.encrypt(decrypted);

            // Verify with new key
            const finalDecrypted = newEncryptor.decrypt(reEncrypted);
            assert.ok(finalDecrypted.includes('name: "Alice"'));
        });

        it('should handle large data encryption', () => {
            const largeData = {
                users: Array.from({ length: 100 }, (_, i) => ({
                    id: i,
                    name: `User${i}`,
                    email: `user${i}@example.com`
                }))
            };

            const encrypted = aesConverter.fromJson(largeData, {
                conversionMode: 'export'
            });

            const decrypted = aesEncryptor.decrypt(encrypted);
            assert.ok(decrypted.includes('User0'));
            assert.ok(decrypted.includes('User99'));
        });
    });

    // ========================================
    // 9. Validation with Encryption
    // ========================================

    describe('Validation', () => {
        it('should validate plain TOON strings', () => {
            const result = plainConverter.validate(sampleToon);

            assert.strictEqual(result.isValid, true);
            assert.strictEqual(result.error, null);
        });

        it('should validate async', async () => {
            const result = await plainConverter.validateAsync(sampleToon);

            assert.strictEqual(result.isValid, true);
        });

        it('should detect invalid TOON', () => {
            const invalidToon = 'invalid [[ toon';
            const result = plainConverter.validate(invalidToon);

            assert.strictEqual(result.isValid, false);
            assert.ok(result.error !== null);
        });
    });
});
