/**
 * Integration Tests for TOON Formatter CLI
 * Run with: node --test test/cli.test.js
 */

import { test, describe } from 'node:test';
import assert from 'node:assert';
import { execSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';

const binPath = path.resolve('bin/toon-formatter.js');
const cli = `node ${binPath}`;

describe('CLI - Basic Conversions', () => {
    test('JSON to TOON via stdin', () => {
        const input = JSON.stringify({ name: "Alice", age: 30 });
        const output = execSync(`echo '${input}' | ${cli} --from json --to toon`).toString();
        assert.ok(output.includes('name: "Alice"'));
        assert.ok(output.includes('age: 30'));
    });

    test('TOON to JSON via stdin (prettified)', () => {
        const input = 'name: "Alice"\nage: 30';
        const output = execSync(`echo '${input}' | ${cli} --from toon --to json`).toString();
        assert.ok(output.includes('"name": "Alice"'));
        assert.ok(output.includes('"age": 30'));
        // Verify prettification (indented)
        assert.ok(output.includes('  "name":'));
    });

    test('XML to JSON direct translation', () => {
        const input = '<root><user>Alice</user></root>';
        const output = execSync(`echo '${input}' | ${cli} --from xml --to json`).toString();
        assert.ok(output.includes('"root"'));
        assert.ok(output.includes('"user": "Alice"'));
    });
});

describe('CLI - File I/O', () => {
    const inputPath = 'test_input.json';
    const outputPath = 'test_output.toon';

    test('File input and output flags', () => {
        const data = { file: "test", success: true };
        fs.writeFileSync(inputPath, JSON.stringify(data));

        execSync(`${cli} --from json --to toon -i ${inputPath} -o ${outputPath}`);

        const result = fs.readFileSync(outputPath, 'utf8');
        assert.ok(result.includes('file: "test"'));
        assert.ok(result.includes('success: true'));

        // Cleanup
        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    });
});

describe('CLI - Validation', () => {
    test('Validate valid TOON', () => {
        const input = 'name: "Alice"';
        const output = execSync(`echo '${input}' | ${cli} --validate toon`).toString();
        const res = JSON.parse(output);
        assert.strictEqual(res.isValid, true);
    });

    test('Validate invalid TOON', () => {
        const input = 'items[2]:\n  - Item 1'; // size mismatch
        const output = execSync(`echo '${input}' | ${cli} --validate toon`).toString();
        const res = JSON.parse(output);
        assert.strictEqual(res.isValid, false);
        assert.ok(res.error !== null);
    });
});

describe('CLI - Encryption', () => {
    test('XOR Export and Ingestion round-trip', () => {
        const key = "mysecret";
        const plain = JSON.stringify({ secret: "data" });

        // Export to encrypted TOON
        const encrypted = execSync(`echo '${plain}' | ${cli} --from json --to toon --mode export --key ${key} --algo xor`).toString().trim();
        assert.ok(!encrypted.includes('secret'));

        // Ingestion back to plain JSON
        const decrypted = execSync(`echo '${encrypted}' | ${cli} --from toon --to json --mode ingestion --key ${key} --algo xor`).toString();
        assert.ok(decrypted.includes('"secret": "data"'));
    });
});

describe('CLI - Async and Options', () => {
    test('--async flag', () => {
        const input = JSON.stringify({ async: true });
        const output = execSync(`echo '${input}' | ${cli} --from json --to toon --async`).toString();
        assert.ok(output.includes('async: true'));
    });

    test('--no-parse flag (with TOON -> JSON)', () => {
        const input = 'name: "Alice"';
        // When --no-parse is used with toon->json, it should still return a string but maybe not prettified?
        // Actually toonToJson(toon, returnJson=false) returns an object.
        // If --no-parse is set, returnJson is false.
        const output = execSync(`echo '${input}' | ${cli} --from toon --to json --no-parse`).toString();
        // Since it's an object being stringified by the CLI logic, it will be pretty if it's an object.
        // Wait, handleConversion returns the value. In CLI:
        // const options = { conversionMode: mode, returnJson: !noParse };
        // if --no-parse, returnJson is false => toonConv.toJson returns an Object.
        // Then CLI stringifies it prettily.
        assert.ok(output.includes('"name": "Alice"'));
    });
});
