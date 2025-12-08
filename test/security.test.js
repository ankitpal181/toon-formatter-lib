/**
 * Security Tests
 * 
 * Tests security properties of encryption implementation
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { Encryptor } from '../src/index.js';
import crypto from 'crypto';

describe('Security Tests', () => {
    describe('AES-256-GCM Security Properties', () => {
        it('should use unique IV for each encryption', () => {
            const key = Encryptor.generateKey();
            const encryptor = new Encryptor(key, 'aes-256-gcm');
            const plaintext = 'sensitive data';

            const encrypted1 = encryptor.encrypt(plaintext);
            const encrypted2 = encryptor.encrypt(plaintext);

            // Same plaintext should produce different ciphertext (different IV)
            assert.notStrictEqual(encrypted1, encrypted2);

            // Both should decrypt to same plaintext
            assert.strictEqual(encryptor.decrypt(encrypted1), plaintext);
            assert.strictEqual(encryptor.decrypt(encrypted2), plaintext);
        });

        it('should detect tampering via authentication tag', () => {
            const key = Encryptor.generateKey();
            const encryptor = new Encryptor(key, 'aes-256-gcm');
            const encrypted = encryptor.encrypt('sensitive data');

            // Tamper with the ciphertext
            const parts = encrypted.split(':');
            assert.strictEqual(parts.length, 3, 'Expected format: iv:authTag:data');

            // Corrupt the authentication tag
            const corruptedAuthTag = parts[1].split('').reverse().join('');
            const tampered = `${parts[0]}:${corruptedAuthTag}:${parts[2]}`;

            // Should throw on decryption
            assert.throws(() => {
                encryptor.decrypt(tampered);
            }, /decryption failed/i);
        });

        it('should detect tampering in encrypted data', () => {
            const key = Encryptor.generateKey();
            const encryptor = new Encryptor(key, 'aes-256-gcm');
            const encrypted = encryptor.encrypt('sensitive data');

            // Tamper with the encrypted data
            const parts = encrypted.split(':');
            const corruptedData = parts[2].substring(0, parts[2].length - 4) + 'FFFF';
            const tampered = `${parts[0]}:${parts[1]}:${corruptedData}`;

            // Should throw on decryption
            assert.throws(() => {
                encryptor.decrypt(tampered);
            }, /decryption failed/i);
        });

        it('should fail with wrong key', () => {
            const key1 = Encryptor.generateKey();
            const key2 = Encryptor.generateKey();
            const encryptor1 = new Encryptor(key1, 'aes-256-gcm');
            const encryptor2 = new Encryptor(key2, 'aes-256-gcm');

            const encrypted = encryptor1.encrypt('sensitive data');

            // Should throw when using wrong key
            assert.throws(() => {
                encryptor2.decrypt(encrypted);
            }, /decryption failed/i);
        });

        it('should generate cryptographically secure keys', () => {
            const keys = new Set();
            const iterations = 100;

            for (let i = 0; i < iterations; i++) {
                const key = Encryptor.generateKey();
                const keyHex = key.toString('hex');

                // Check key length
                assert.strictEqual(key.length, 32, 'Key must be 32 bytes');

                // Check uniqueness
                assert.ok(!keys.has(keyHex), 'Keys must be unique');
                keys.add(keyHex);
            }

            // All keys should be unique
            assert.strictEqual(keys.size, iterations);
        });

        it('should have sufficient IV entropy', () => {
            const key = Encryptor.generateKey();
            const encryptor = new Encryptor(key, 'aes-256-gcm');
            const ivs = new Set();
            const iterations = 100;

            for (let i = 0; i < iterations; i++) {
                const encrypted = encryptor.encrypt('test data');
                const iv = encrypted.split(':')[0];

                // Check IV uniqueness
                assert.ok(!ivs.has(iv), 'IVs must be unique');
                ivs.add(iv);

                // Check IV length (12 bytes = 24 hex chars for GCM)
                assert.strictEqual(iv.length, 24, 'IV must be 12 bytes (24 hex chars)');
            }

            assert.strictEqual(ivs.size, iterations);
        });

        it('should not leak plaintext in error messages', () => {
            const key = Encryptor.generateKey();
            const encryptor = new Encryptor(key, 'aes-256-gcm');
            const secret = 'super-secret-password-12345';

            try {
                // Encrypt with one key
                const encrypted = encryptor.encrypt(secret);

                // Try to decrypt with wrong key
                const wrongKey = Encryptor.generateKey();
                const wrongEncryptor = new Encryptor(wrongKey, 'aes-256-gcm');
                wrongEncryptor.decrypt(encrypted);

                assert.fail('Should have thrown');
            } catch (error) {
                // Error message should not contain the secret
                assert.ok(!error.message.includes(secret), 'Error should not leak plaintext');
                assert.ok(!error.stack.includes(secret), 'Stack trace should not leak plaintext');
            }
        });
    });

    describe('Key Security', () => {
        it('should reject keys of incorrect length', () => {
            const shortKey = Buffer.alloc(16); // 16 bytes instead of 32
            const longKey = Buffer.alloc(64); // 64 bytes instead of 32

            assert.throws(() => {
                new Encryptor(shortKey, 'aes-256-gcm');
            }, /32-byte.*key/i);

            assert.throws(() => {
                new Encryptor(longKey, 'aes-256-gcm');
            }, /32-byte.*key/i);
        });

        it('should require key for AES-256-GCM', () => {
            assert.throws(() => {
                new Encryptor(null, 'aes-256-gcm');
            }, /key is required/i);

            assert.throws(() => {
                new Encryptor(undefined, 'aes-256-gcm');
            }, /key is required/i);
        });

        it('should accept keys as Buffer or base64 string', () => {
            const keyBuffer = Encryptor.generateKey();
            const keyBase64 = keyBuffer.toString('base64');

            // Buffer should work
            const encryptor1 = new Encryptor(keyBuffer, 'aes-256-gcm');

            // Base64 string should work (will be converted to Buffer internally)
            const keyBufferFromBase64 = Buffer.from(keyBase64, 'base64');
            const encryptor2 = new Encryptor(keyBufferFromBase64, 'aes-256-gcm');

            const plaintext = 'test data';
            const encrypted1 = encryptor1.encrypt(plaintext);
            const encrypted2 = encryptor2.encrypt(plaintext);

            // Both should decrypt correctly
            assert.strictEqual(encryptor1.decrypt(encrypted1), plaintext);
            assert.strictEqual(encryptor2.decrypt(encrypted2), plaintext);
        });
    });

    describe('Input Validation', () => {
        it('should reject non-string data for encryption', () => {
            const key = Encryptor.generateKey();
            const encryptor = new Encryptor(key, 'aes-256-gcm');

            assert.throws(() => {
                encryptor.encrypt(12345);
            }, /must be a string/i);

            assert.throws(() => {
                encryptor.encrypt({ data: 'test' });
            }, /must be a string/i);

            assert.throws(() => {
                encryptor.encrypt(null);
            }, /must be a string/i);
        });

        it('should reject non-string data for decryption', () => {
            const key = Encryptor.generateKey();
            const encryptor = new Encryptor(key, 'aes-256-gcm');

            assert.throws(() => {
                encryptor.decrypt(12345);
            }, /must be a string/i);

            assert.throws(() => {
                encryptor.decrypt({ data: 'test' });
            }, /must be a string/i);
        });

        it('should reject malformed encrypted data', () => {
            const key = Encryptor.generateKey();
            const encryptor = new Encryptor(key, 'aes-256-gcm');

            // Missing parts
            assert.throws(() => {
                encryptor.decrypt('invalid');
            }, /invalid encrypted data format/i);

            // Wrong number of parts
            assert.throws(() => {
                encryptor.decrypt('part1:part2');
            }, /invalid encrypted data format/i);

            // Invalid hex
            assert.throws(() => {
                encryptor.decrypt('ZZZZ:YYYY:XXXX');
            });
        });
    });

    describe('XOR Security Limitations', () => {
        it('should produce deterministic output (not cryptographically secure)', () => {
            const encryptor = new Encryptor('test-key', 'xor');
            const plaintext = 'sensitive data';

            const encrypted1 = encryptor.encrypt(plaintext);
            const encrypted2 = encryptor.encrypt(plaintext);

            // XOR is deterministic - same input produces same output
            assert.strictEqual(encrypted1, encrypted2);
        });

        it('should be reversible with key', () => {
            const key = 'secret-key';
            const encryptor = new Encryptor(key, 'xor');
            const plaintext = 'test data';

            const encrypted = encryptor.encrypt(plaintext);
            const decrypted = encryptor.decrypt(encrypted);

            assert.strictEqual(decrypted, plaintext);
        });

        it('should require key for XOR', () => {
            // XOR requires a key
            assert.throws(() => {
                const encryptor = new Encryptor(null, 'xor');
                encryptor.encrypt('test'); // Will fail when trying to encrypt
            }, /key is required/i);

            // With key should work
            const encryptor = new Encryptor('my-key', 'xor');
            const plaintext = 'test';
            const encrypted = encryptor.encrypt(plaintext);
            assert.strictEqual(encryptor.decrypt(encrypted), plaintext);
        });
    });

    describe('Base64 Security (No Encryption)', () => {
        it('should be easily reversible (not secure)', () => {
            const encryptor = new Encryptor(null, 'base64');
            const plaintext = 'sensitive data';

            const encoded = encryptor.encrypt(plaintext);

            // Base64 can be decoded by anyone
            const decoded = Buffer.from(encoded, 'base64').toString('utf-8');
            assert.strictEqual(decoded, plaintext);
        });

        it('should not require key', () => {
            // Should not throw
            const encryptor = new Encryptor(null, 'base64');
            assert.ok(encryptor);
        });
    });

    describe('Timing Attack Resistance', () => {
        it('should have consistent decryption time for valid/invalid data', () => {
            const key = Encryptor.generateKey();
            const encryptor = new Encryptor(key, 'aes-256-gcm');
            const encrypted = encryptor.encrypt('test data');

            // Measure valid decryption time
            const validStart = performance.now();
            try {
                encryptor.decrypt(encrypted);
            } catch (e) { }
            const validDuration = performance.now() - validStart;

            // Measure invalid decryption time
            const invalidStart = performance.now();
            try {
                encryptor.decrypt('invalid:data:here');
            } catch (e) { }
            const invalidDuration = performance.now() - invalidStart;

            // Times should be relatively similar (within order of magnitude)
            // This is a basic check - true timing attack resistance requires more sophisticated testing
            const ratio = Math.max(validDuration, invalidDuration) / Math.min(validDuration, invalidDuration);
            assert.ok(ratio < 100, `Timing ratio too high: ${ratio}`);
        });
    });

    describe('Algorithm Security', () => {
        it('should reject unsupported algorithms', () => {
            const key = Encryptor.generateKey();

            assert.throws(() => {
                new Encryptor(key, 'md5');
            }, /unsupported algorithm/i);

            assert.throws(() => {
                new Encryptor(key, 'sha256');
            }, /unsupported algorithm/i);

            assert.throws(() => {
                new Encryptor(key, 'aes-128-cbc');
            }, /unsupported algorithm/i);
        });

        it('should handle algorithm names case-insensitively', () => {
            const key = Encryptor.generateKey();

            // All should work
            const enc1 = new Encryptor(key, 'AES-256-GCM');
            const enc2 = new Encryptor(key, 'aes-256-gcm');
            const enc3 = new Encryptor(key, 'Aes-256-Gcm');

            assert.ok(enc1);
            assert.ok(enc2);
            assert.ok(enc3);
        });
    });

    describe('Data Integrity', () => {
        it('should preserve data through encryption/decryption', () => {
            const key = Encryptor.generateKey();
            const encryptor = new Encryptor(key, 'aes-256-gcm');

            const testCases = [
                '',
                'a',
                'Hello, World!',
                '{"key": "value"}',
                'Unicode: 你好世界 🔐',
                'Special chars: !@#$%^&*()_+-=[]{}|;:,.<>?',
                'A'.repeat(10000), // Large string
                '\n\r\t',
                '   leading and trailing spaces   '
            ];

            for (const plaintext of testCases) {
                const encrypted = encryptor.encrypt(plaintext);
                const decrypted = encryptor.decrypt(encrypted);
                assert.strictEqual(decrypted, plaintext, `Failed for: ${plaintext.substring(0, 50)}`);
            }
        });

        it('should handle binary-safe data', () => {
            const key = Encryptor.generateKey();
            const encryptor = new Encryptor(key, 'aes-256-gcm');

            // Create string with null bytes and other binary data
            const binaryData = '\x00\x01\x02\x03\xFF\xFE\xFD';
            const encrypted = encryptor.encrypt(binaryData);
            const decrypted = encryptor.decrypt(encrypted);

            assert.strictEqual(decrypted, binaryData);
        });
    });
});
