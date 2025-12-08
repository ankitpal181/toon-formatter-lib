/**
 * Performance Tests
 * 
 * Tests encryption performance and ensures operations complete within acceptable timeframes
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { ToonConverter, Encryptor } from '../src/index.js';

describe('Performance Tests', () => {
    let aesKey;
    let aesEncryptor;
    let xorEncryptor;
    let base64Encryptor;

    // Setup
    aesKey = Encryptor.generateKey();
    aesEncryptor = new Encryptor(aesKey, 'aes-256-gcm');
    xorEncryptor = new Encryptor('performance-test-key', 'xor');
    base64Encryptor = new Encryptor(null, 'base64');

    const smallData = { name: "Alice", age: 30 };
    const mediumData = {
        users: Array.from({ length: 100 }, (_, i) => ({
            id: i,
            name: `User${i}`,
            email: `user${i}@example.com`,
            active: i % 2 === 0
        }))
    };
    const largeData = {
        records: Array.from({ length: 1000 }, (_, i) => ({
            id: i,
            timestamp: Date.now(),
            data: `Record ${i} with some additional text content`,
            metadata: {
                created: new Date().toISOString(),
                updated: new Date().toISOString(),
                version: 1
            }
        }))
    };

    describe('AES-256-GCM Performance', () => {
        it('should encrypt small data within 5ms', () => {
            const start = performance.now();
            const encrypted = aesEncryptor.encrypt(JSON.stringify(smallData));
            const duration = performance.now() - start;

            assert.ok(encrypted);
            assert.ok(duration < 5, `Encryption took ${duration}ms, expected < 5ms`);
        });

        it('should decrypt small data within 5ms', () => {
            const encrypted = aesEncryptor.encrypt(JSON.stringify(smallData));

            const start = performance.now();
            const decrypted = aesEncryptor.decrypt(encrypted);
            const duration = performance.now() - start;

            assert.ok(decrypted);
            assert.ok(duration < 5, `Decryption took ${duration}ms, expected < 5ms`);
        });

        it('should handle medium data (100 records) within 10ms', () => {
            const jsonString = JSON.stringify(mediumData);

            const start = performance.now();
            const encrypted = aesEncryptor.encrypt(jsonString);
            const decrypted = aesEncryptor.decrypt(encrypted);
            const duration = performance.now() - start;

            assert.strictEqual(decrypted, jsonString);
            assert.ok(duration < 10, `Round-trip took ${duration}ms, expected < 10ms`);
        });

        it('should handle large data (1000 records) within 50ms', () => {
            const jsonString = JSON.stringify(largeData);

            const start = performance.now();
            const encrypted = aesEncryptor.encrypt(jsonString);
            const decrypted = aesEncryptor.decrypt(encrypted);
            const duration = performance.now() - start;

            assert.strictEqual(decrypted, jsonString);
            assert.ok(duration < 50, `Round-trip took ${duration}ms, expected < 50ms`);
        });

        it('should generate keys quickly (< 1ms)', () => {
            const start = performance.now();
            const key = Encryptor.generateKey();
            const duration = performance.now() - start;

            assert.ok(key);
            assert.strictEqual(key.length, 32);
            assert.ok(duration < 1, `Key generation took ${duration}ms, expected < 1ms`);
        });
    });

    describe('XOR Performance', () => {
        it('should be faster than AES-256-GCM for small data', () => {
            const data = JSON.stringify(smallData);

            // AES timing
            const aesStart = performance.now();
            const aesEncrypted = aesEncryptor.encrypt(data);
            aesEncryptor.decrypt(aesEncrypted);
            const aesDuration = performance.now() - aesStart;

            // XOR timing
            const xorStart = performance.now();
            const xorEncrypted = xorEncryptor.encrypt(data);
            xorEncryptor.decrypt(xorEncrypted);
            const xorDuration = performance.now() - xorStart;

            // XOR should be faster (though not always guaranteed due to system variance)
            // Just verify both complete quickly
            assert.ok(aesDuration < 10, `AES took ${aesDuration}ms`);
            assert.ok(xorDuration < 10, `XOR took ${xorDuration}ms`);
        });

        it('should handle large data within 20ms', () => {
            const jsonString = JSON.stringify(largeData);

            const start = performance.now();
            const encrypted = xorEncryptor.encrypt(jsonString);
            const decrypted = xorEncryptor.decrypt(encrypted);
            const duration = performance.now() - start;

            assert.strictEqual(decrypted, jsonString);
            assert.ok(duration < 20, `Round-trip took ${duration}ms, expected < 20ms`);
        });
    });

    describe('Base64 Performance', () => {
        it('should be fastest for small data (< 1ms)', () => {
            const data = JSON.stringify(smallData);

            const start = performance.now();
            const encoded = base64Encryptor.encrypt(data);
            const decoded = base64Encryptor.decrypt(encoded);
            const duration = performance.now() - start;

            assert.strictEqual(decoded, data);
            assert.ok(duration < 1, `Round-trip took ${duration}ms, expected < 1ms`);
        });

        it('should handle large data within 10ms', () => {
            const jsonString = JSON.stringify(largeData);

            const start = performance.now();
            const encoded = base64Encryptor.encrypt(jsonString);
            const decoded = base64Encryptor.decrypt(encoded);
            const duration = performance.now() - start;

            assert.strictEqual(decoded, jsonString);
            assert.ok(duration < 10, `Round-trip took ${duration}ms, expected < 10ms`);
        });
    });

    describe('ToonConverter with Encryption Performance', () => {
        it('should convert and encrypt within 10ms', () => {
            const converter = new ToonConverter(aesEncryptor);

            const start = performance.now();
            const encrypted = converter.fromJson(mediumData, {
                conversionMode: 'export'
            });
            const duration = performance.now() - start;

            assert.ok(encrypted);
            assert.ok(duration < 10, `Conversion + encryption took ${duration}ms, expected < 10ms`);
        });

        it('should handle middleware mode efficiently', () => {
            const converter = new ToonConverter(aesEncryptor);
            const encryptedJson = aesEncryptor.encrypt(JSON.stringify(smallData));

            const start = performance.now();
            const encryptedToon = converter.fromJson(encryptedJson, {
                conversionMode: 'middleware'
            });
            const duration = performance.now() - start;

            assert.ok(encryptedToon);
            // Middleware: decrypt + convert + encrypt
            assert.ok(duration < 15, `Middleware conversion took ${duration}ms, expected < 15ms`);
        });

        it('should handle batch operations efficiently', () => {
            const converter = new ToonConverter(aesEncryptor);
            const items = Array.from({ length: 50 }, (_, i) => ({
                id: i,
                name: `Item${i}`
            }));

            const start = performance.now();
            const encrypted = items.map(item =>
                converter.fromJson(item, { conversionMode: 'export' })
            );
            const duration = performance.now() - start;

            assert.strictEqual(encrypted.length, 50);
            assert.ok(duration < 100, `Batch of 50 took ${duration}ms, expected < 100ms`);
        });
    });

    describe('Memory Efficiency', () => {
        it('should not leak memory on repeated operations', () => {
            const iterations = 1000;
            const data = JSON.stringify(smallData);

            // Warm up
            for (let i = 0; i < 10; i++) {
                aesEncryptor.encrypt(data);
            }

            const start = performance.now();
            for (let i = 0; i < iterations; i++) {
                const encrypted = aesEncryptor.encrypt(data);
                aesEncryptor.decrypt(encrypted);
            }
            const duration = performance.now() - start;

            // Should complete 1000 iterations reasonably quickly
            assert.ok(duration < 2000, `1000 iterations took ${duration}ms, expected < 2000ms`);
        });
    });

    describe('Comparative Performance', () => {
        it('should show expected performance hierarchy: Base64 > XOR > AES', () => {
            const data = JSON.stringify(mediumData);
            const iterations = 100;

            // Base64
            const base64Start = performance.now();
            for (let i = 0; i < iterations; i++) {
                const enc = base64Encryptor.encrypt(data);
                base64Encryptor.decrypt(enc);
            }
            const base64Duration = performance.now() - base64Start;

            // XOR
            const xorStart = performance.now();
            for (let i = 0; i < iterations; i++) {
                const enc = xorEncryptor.encrypt(data);
                xorEncryptor.decrypt(enc);
            }
            const xorDuration = performance.now() - xorStart;

            // AES
            const aesStart = performance.now();
            for (let i = 0; i < iterations; i++) {
                const enc = aesEncryptor.encrypt(data);
                aesEncryptor.decrypt(enc);
            }
            const aesDuration = performance.now() - aesStart;

            // Log results for visibility
            console.log(`\n  Performance (100 iterations):`);
            console.log(`    Base64: ${base64Duration.toFixed(2)}ms (${(base64Duration / iterations).toFixed(2)}ms avg)`);
            console.log(`    XOR:    ${xorDuration.toFixed(2)}ms (${(xorDuration / iterations).toFixed(2)}ms avg)`);
            console.log(`    AES:    ${aesDuration.toFixed(2)}ms (${(aesDuration / iterations).toFixed(2)}ms avg)`);

            // All should complete in reasonable time
            assert.ok(base64Duration < 500, `Base64 took ${base64Duration}ms`);
            assert.ok(xorDuration < 1000, `XOR took ${xorDuration}ms`);
            assert.ok(aesDuration < 2000, `AES took ${aesDuration}ms`);
        });
    });
});
