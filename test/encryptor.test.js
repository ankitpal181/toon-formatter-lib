/**
 * Unit Tests for Encryptor Class
 * 
 * Tests all three encryption algorithms:
 * - AES-256-GCM (high security)
 * - XOR (obfuscation)
 * - Base64 (encoding)
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { Encryptor } from '../src/encryptor.js';

describe('Encryptor', () => {

    // ========================================
    // AES-256-GCM Tests
    // ========================================

    describe('AES-256-GCM Algorithm', () => {

        it('should encrypt and decrypt correctly', () => {
            const key = Encryptor.generateKey();
            const encryptor = new Encryptor(key, 'aes-256-gcm');

            const plaintext = 'Hello, World!';
            const encrypted = encryptor.encrypt(plaintext);
            const decrypted = encryptor.decrypt(encrypted);

            assert.strictEqual(decrypted, plaintext);
            assert.notStrictEqual(encrypted, plaintext);
        });

        it('should produce different ciphertext for same plaintext (due to random IV)', () => {
            const key = Encryptor.generateKey();
            const encryptor = new Encryptor(key, 'aes-256-gcm');

            const plaintext = 'Same message';
            const encrypted1 = encryptor.encrypt(plaintext);
            const encrypted2 = encryptor.encrypt(plaintext);

            // Different ciphertexts due to different IVs
            assert.notStrictEqual(encrypted1, encrypted2);

            // But both decrypt to same plaintext
            assert.strictEqual(encryptor.decrypt(encrypted1), plaintext);
            assert.strictEqual(encryptor.decrypt(encrypted2), plaintext);
        });

        it('should handle empty strings', () => {
            const key = Encryptor.generateKey();
            const encryptor = new Encryptor(key, 'aes-256-gcm');

            const plaintext = '';
            const encrypted = encryptor.encrypt(plaintext);
            const decrypted = encryptor.decrypt(encrypted);

            assert.strictEqual(decrypted, plaintext);
        });

        it('should handle long strings', () => {
            const key = Encryptor.generateKey();
            const encryptor = new Encryptor(key, 'aes-256-gcm');

            const plaintext = 'A'.repeat(10000);
            const encrypted = encryptor.encrypt(plaintext);
            const decrypted = encryptor.decrypt(encrypted);

            assert.strictEqual(decrypted, plaintext);
        });

        it('should handle special characters and unicode', () => {
            const key = Encryptor.generateKey();
            const encryptor = new Encryptor(key, 'aes-256-gcm');

            const plaintext = '🚀 Hello! 你好 مرحبا @#$%^&*()';
            const encrypted = encryptor.encrypt(plaintext);
            const decrypted = encryptor.decrypt(encrypted);

            assert.strictEqual(decrypted, plaintext);
        });

        it('should throw error if key is missing', () => {
            assert.throws(() => {
                new Encryptor(null, 'aes-256-gcm');
            }, {
                message: 'Key is required for AES-256-GCM encryption.'
            });
        });

        it('should throw error if key is wrong length', () => {
            const shortKey = Buffer.from('short-key');

            assert.throws(() => {
                new Encryptor(shortKey, 'aes-256-gcm');
            }, {
                message: /AES-256-GCM requires a 32-byte/
            });
        });

        it('should throw error if encrypted data format is invalid', () => {
            const key = Encryptor.generateKey();
            const encryptor = new Encryptor(key, 'aes-256-gcm');

            assert.throws(() => {
                encryptor.decrypt('invalid-format');
            }, {
                message: /Invalid encrypted data format/
            });
        });

        it('should throw error if authentication fails (tampered data)', () => {
            const key = Encryptor.generateKey();
            const encryptor = new Encryptor(key, 'aes-256-gcm');

            const encrypted = encryptor.encrypt('Original message');

            // Tamper with the auth tag (second part)
            const parts = encrypted.split(':');
            const tamperedAuthTag = parts[1].replace(/[0-9a-f]/, 'x'); // Corrupt auth tag
            const tampered = `${parts[0]}:${tamperedAuthTag}:${parts[2]}`;

            assert.throws(() => {
                encryptor.decrypt(tampered);
            }, {
                message: /decryption failed/
            });
        });

        it('should throw error if wrong key is used for decryption', () => {
            const key1 = Encryptor.generateKey();
            const key2 = Encryptor.generateKey();

            const encryptor1 = new Encryptor(key1, 'aes-256-gcm');
            const encryptor2 = new Encryptor(key2, 'aes-256-gcm');

            const encrypted = encryptor1.encrypt('Secret message');

            assert.throws(() => {
                encryptor2.decrypt(encrypted);
            }, {
                message: /decryption failed/
            });
        });
    });

    // ========================================
    // XOR Algorithm Tests
    // ========================================

    describe('XOR Algorithm', () => {

        it('should encrypt and decrypt correctly', () => {
            const key = 'my-secret-key';
            const encryptor = new Encryptor(key, 'xor');

            const plaintext = 'Hello, World!';
            const encrypted = encryptor.encrypt(plaintext);
            const decrypted = encryptor.decrypt(encrypted);

            assert.strictEqual(decrypted, plaintext);
            assert.notStrictEqual(encrypted, plaintext);
        });

        it('should produce same ciphertext for same plaintext and key', () => {
            const key = 'my-secret-key';
            const encryptor = new Encryptor(key, 'xor');

            const plaintext = 'Same message';
            const encrypted1 = encryptor.encrypt(plaintext);
            const encrypted2 = encryptor.encrypt(plaintext);

            // XOR is deterministic - same plaintext + key = same ciphertext
            assert.strictEqual(encrypted1, encrypted2);
        });

        it('should handle empty strings', () => {
            const key = 'my-secret-key';
            const encryptor = new Encryptor(key, 'xor');

            const plaintext = '';
            const encrypted = encryptor.encrypt(plaintext);
            const decrypted = encryptor.decrypt(encrypted);

            assert.strictEqual(decrypted, plaintext);
        });

        it('should handle long strings', () => {
            const key = 'my-secret-key';
            const encryptor = new Encryptor(key, 'xor');

            const plaintext = 'A'.repeat(10000);
            const encrypted = encryptor.encrypt(plaintext);
            const decrypted = encryptor.decrypt(encrypted);

            assert.strictEqual(decrypted, plaintext);
        });

        it('should handle special characters and unicode', () => {
            const key = 'my-secret-key';
            const encryptor = new Encryptor(key, 'xor');

            const plaintext = '🚀 Hello! 你好 مرحبا @#$%^&*()';
            const encrypted = encryptor.encrypt(plaintext);
            const decrypted = encryptor.decrypt(encrypted);

            assert.strictEqual(decrypted, plaintext);
        });

        it('should work with Buffer keys', () => {
            const key = Buffer.from('my-secret-key', 'utf-8');
            const encryptor = new Encryptor(key, 'xor');

            const plaintext = 'Hello, World!';
            const encrypted = encryptor.encrypt(plaintext);
            const decrypted = encryptor.decrypt(encrypted);

            assert.strictEqual(decrypted, plaintext);
        });

        it('should throw error if key is missing', () => {
            const encryptor = new Encryptor(null, 'xor');

            assert.throws(() => {
                encryptor.encrypt('test');
            }, {
                message: 'Key is required for XOR cipher.'
            });
        });

        it('should throw error if decrypting without key', () => {
            const encryptor = new Encryptor(null, 'xor');

            assert.throws(() => {
                encryptor.decrypt('abcdef');
            }, {
                message: 'Key is required for XOR cipher.'
            });
        });
    });

    // ========================================
    // Base64 Algorithm Tests
    // ========================================

    describe('Base64 Algorithm', () => {

        it('should encode and decode correctly', () => {
            const encryptor = new Encryptor(null, 'base64');

            const plaintext = 'Hello, World!';
            const encoded = encryptor.encrypt(plaintext);
            const decoded = encryptor.decrypt(encoded);

            assert.strictEqual(decoded, plaintext);
            assert.notStrictEqual(encoded, plaintext);
        });

        it('should produce standard Base64 encoding', () => {
            const encryptor = new Encryptor(null, 'base64');

            const plaintext = 'Hello, World!';
            const encoded = encryptor.encrypt(plaintext);
            const expected = Buffer.from(plaintext, 'utf-8').toString('base64');

            assert.strictEqual(encoded, expected);
        });

        it('should handle empty strings', () => {
            const encryptor = new Encryptor(null, 'base64');

            const plaintext = '';
            const encoded = encryptor.encrypt(plaintext);
            const decoded = encryptor.decrypt(encoded);

            assert.strictEqual(decoded, plaintext);
        });

        it('should handle long strings', () => {
            const encryptor = new Encryptor(null, 'base64');

            const plaintext = 'A'.repeat(10000);
            const encoded = encryptor.encrypt(plaintext);
            const decoded = encryptor.decrypt(encoded);

            assert.strictEqual(decoded, plaintext);
        });

        it('should handle special characters and unicode', () => {
            const encryptor = new Encryptor(null, 'base64');

            const plaintext = '🚀 Hello! 你好 مرحبا @#$%^&*()';
            const encoded = encryptor.encrypt(plaintext);
            const decoded = encryptor.decrypt(encoded);

            assert.strictEqual(decoded, plaintext);
        });
    });

    // ========================================
    // Key Generation Tests
    // ========================================

    describe('Key Generation', () => {

        it('should generate 32-byte keys', () => {
            const key = Encryptor.generateKey();

            assert.ok(Buffer.isBuffer(key));
            assert.strictEqual(key.length, 32);
        });

        it('should generate different keys each time', () => {
            const key1 = Encryptor.generateKey();
            const key2 = Encryptor.generateKey();

            assert.notDeepStrictEqual(key1, key2);
        });

        it('should generate keys suitable for AES-256-GCM', () => {
            const key = Encryptor.generateKey();

            // Should not throw
            const encryptor = new Encryptor(key, 'aes-256-gcm');

            const plaintext = 'Test message';
            const encrypted = encryptor.encrypt(plaintext);
            const decrypted = encryptor.decrypt(encrypted);

            assert.strictEqual(decrypted, plaintext);
        });
    });

    // ========================================
    // General Error Handling Tests
    // ========================================

    describe('Error Handling', () => {

        it('should throw error for unsupported algorithm', () => {
            assert.throws(() => {
                new Encryptor(null, 'unsupported-algo');
            }, {
                message: /Unsupported algorithm: unsupported-algo/
            });
        });

        it('should throw error if encrypting non-string data', () => {
            const key = Encryptor.generateKey();
            const encryptor = new Encryptor(key, 'aes-256-gcm');

            assert.throws(() => {
                encryptor.encrypt({ data: 'object' });
            }, {
                message: 'Data to encrypt must be a string.'
            });

            assert.throws(() => {
                encryptor.encrypt(12345);
            }, {
                message: 'Data to encrypt must be a string.'
            });

            assert.throws(() => {
                encryptor.encrypt(null);
            }, {
                message: 'Data to encrypt must be a string.'
            });
        });

        it('should throw error if decrypting non-string data', () => {
            const key = Encryptor.generateKey();
            const encryptor = new Encryptor(key, 'aes-256-gcm');

            assert.throws(() => {
                encryptor.decrypt({ data: 'object' });
            }, {
                message: 'Data to decrypt must be a string.'
            });

            assert.throws(() => {
                encryptor.decrypt(12345);
            }, {
                message: 'Data to decrypt must be a string.'
            });

            assert.throws(() => {
                encryptor.decrypt(null);
            }, {
                message: 'Data to decrypt must be a string.'
            });
        });

        it('should handle algorithm name case-insensitively', () => {
            const key = Encryptor.generateKey();

            // Should not throw
            const enc1 = new Encryptor(key, 'AES-256-GCM');
            const enc2 = new Encryptor(key, 'Aes-256-Gcm');
            const enc3 = new Encryptor('key', 'XOR');
            const enc4 = new Encryptor(null, 'BASE64');

            assert.strictEqual(enc1.algorithm, 'aes-256-gcm');
            assert.strictEqual(enc2.algorithm, 'aes-256-gcm');
            assert.strictEqual(enc3.algorithm, 'xor');
            assert.strictEqual(enc4.algorithm, 'base64');
        });
    });

    // ========================================
    // Real-World Scenario Tests
    // ========================================

    describe('Real-World Scenarios', () => {

        it('should handle JSON data encryption/decryption', () => {
            const key = Encryptor.generateKey();
            const encryptor = new Encryptor(key, 'aes-256-gcm');

            const jsonData = JSON.stringify({ name: 'Alice', age: 30, active: true });
            const encrypted = encryptor.encrypt(jsonData);
            const decrypted = encryptor.decrypt(encrypted);
            const parsed = JSON.parse(decrypted);

            assert.deepStrictEqual(parsed, { name: 'Alice', age: 30, active: true });
        });

        it('should handle multiple encrypt/decrypt operations', () => {
            const key = Encryptor.generateKey();
            const encryptor = new Encryptor(key, 'aes-256-gcm');

            const messages = [
                'Message 1',
                'Message 2',
                'Message 3',
                'Message 4',
                'Message 5'
            ];

            const encrypted = messages.map(msg => encryptor.encrypt(msg));
            const decrypted = encrypted.map(enc => encryptor.decrypt(enc));

            assert.deepStrictEqual(decrypted, messages);
        });

        it('should handle key stored as base64 string', () => {
            const key = Encryptor.generateKey();
            const keyBase64 = key.toString('base64');

            // Store key as base64 string (common in env vars)
            const storedKey = keyBase64;

            // Load key from storage
            const loadedKey = Buffer.from(storedKey, 'base64');
            const encryptor = new Encryptor(loadedKey, 'aes-256-gcm');

            const plaintext = 'Secret message';
            const encrypted = encryptor.encrypt(plaintext);
            const decrypted = encryptor.decrypt(encrypted);

            assert.strictEqual(decrypted, plaintext);
        });
    });
});
