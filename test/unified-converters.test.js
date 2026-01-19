/**
 * Comprehensive tests for Unified Format Converters
 * (JsonConverter, YamlConverter, XmlConverter, CsvConverter)
 * 
 * Run with: node --test test/unified-converters.test.js
 */

import { test, describe, before } from 'node:test';
import assert from 'node:assert';
import {
    JsonConverter,
    YamlConverter,
    XmlConverter,
    CsvConverter,
    Encryptor
} from '../src/index.js';

// Polyfill DOMParser for Node.js env (needed for synchronous XML conversion)
before(async () => {
    if (typeof DOMParser === 'undefined') {
        const { DOMParser: NodeDOMParser } = await import('xmldom');
        global.DOMParser = NodeDOMParser;
    }
});

const testData = {
    user: "Alice",
    meta: { id: 123, roles: ["admin", "editor"] }
};

const testToon = `user: "Alice"
meta:
  id: 123
  roles[2]: "admin", "editor"`;

const testYaml = `user: Alice
meta:
  id: 123
  roles:
    - admin
    - editor
`;

const testXml = `<root><user>Alice</user><meta><id>123</id><roles>admin</roles><roles>editor</roles></meta></root>`;

const testCsv = `user,role
Alice,admin
Bob,editor`;

describe('JsonConverter', () => {
    test('Static Methods - Direct Conversion', () => {
        const toon = JsonConverter.toToon(testData);
        assert.ok(toon.includes('user: "Alice"'));

        // fromToon returns object by default (returnJson=false)
        const back = JsonConverter.fromToon(toon);
        assert.deepStrictEqual(back.user, "Alice");

        // fromToon returns JSON string if returnJson=true
        const backJson = JsonConverter.fromToon(toon, true);
        assert.strictEqual(typeof backJson, 'string');
        assert.ok(backJson.includes('"user":"Alice"'));
    });

    test('Instance with Encryption - middleware', () => {
        const key = Encryptor.generateKey();
        const encryptor = new Encryptor(key, 'aes-256-gcm');
        const converter = new JsonConverter(encryptor);

        // Export mode: Plain JSON -> Encrypted TOON
        const encryptedToon = converter.toToon(testData, { conversionMode: 'export' });
        assert.ok(!encryptedToon.includes('user:')); // Should be cipher text

        // Ingestion mode: Encrypted TOON -> Plain JSON
        const decryptedJson = converter.fromToon(encryptedToon, { conversionMode: 'ingestion' });
        assert.deepStrictEqual(decryptedJson, testData);
    });

    test('Mixed Text Parsing (XML -> JSON)', () => {
        const mixedXml = `Some text before <root><name>Alice</name></root> and after.`;
        // fromXml returns string if it found mixed text
        const result = JsonConverter.fromXml(mixedXml);
        assert.strictEqual(typeof result, 'string');
        // Check if it contains the JSON string
        assert.ok(result.includes('"root"') && result.includes('"name"') && result.includes('"Alice"'));
    });
});

describe('YamlConverter', () => {
    test('Static Methods - Flow', () => {
        const yaml = YamlConverter.fromJson(testData);
        assert.ok(yaml.includes('user: Alice'));

        const back = YamlConverter.toJson(yaml);
        assert.strictEqual(back.user, "Alice");
    });

    test('TOON to YAML', () => {
        const yaml = YamlConverter.fromToon(testToon);
        assert.ok(yaml.includes('user: Alice'));
        assert.ok(yaml.includes('id: 123'));
    });

    test('Instance with Encryption', () => {
        const key = Encryptor.generateKey();
        const encryptor = new Encryptor(key, 'aes-256-gcm');
        const converter = new YamlConverter(encryptor);

        const encryptedToon = converter.toToon(testYaml, { conversionMode: 'export' });
        assert.ok(!encryptedToon.includes('user:'));

        const decryptedYaml = converter.fromToon(encryptedToon, { conversionMode: 'ingestion' });
        assert.ok(decryptedYaml.includes('user: Alice'));
    });
});

describe('XmlConverter', () => {
    test('Static Methods - Flow', () => {
        const rootData = { root: testData };
        // fromJson transforms JSON to XML
        const xml = XmlConverter.fromJson(rootData);
        assert.ok(xml.includes('<user>Alice</user>'));

        // toJson transforms XML to JSON object
        const back = XmlConverter.toJson(xml);
        assert.strictEqual(back.root.user, "Alice");
    });

    test('YAML to XML', () => {
        const xml = XmlConverter.fromYaml(testYaml);
        assert.ok(xml.includes('<user>Alice</user>'));
    });

    test('Instance with Encryption', () => {
        const key = Encryptor.generateKey();
        const encryptor = new Encryptor(key, 'aes-256-gcm');
        const converter = new XmlConverter(encryptor);

        const encryptedToon = converter.toToon(testXml, { conversionMode: 'export' });
        assert.ok(!encryptedToon.includes('user'));

        const decryptedXml = converter.fromToon(encryptedToon, { conversionMode: 'ingestion' });
        assert.ok(decryptedXml.includes('<user>Alice</user>'));
    });
});

describe('CsvConverter', () => {
    test('Static Methods - Flow', () => {
        const data = [{ id: 1, name: "Alice" }, { id: 2, name: "Bob" }];
        const csv = CsvConverter.fromJson(data);
        assert.ok(csv.includes('id,name'));
        assert.ok(csv.includes('1,Alice'));

        const back = CsvConverter.toJson(csv);
        assert.strictEqual(back.length, 2);
        assert.strictEqual(back[0].name, "Alice");
    });

    test('Async Validation', async () => {
        const isValid = await CsvConverter.validateAsync(testCsv);
        assert.strictEqual(isValid, true);
    });

    test('Instance with Encryption', () => {
        const key = Encryptor.generateKey();
        const encryptor = new Encryptor(key, 'aes-256-gcm');
        const converter = new CsvConverter(encryptor);

        const encryptedToon = converter.toToon(testCsv, { conversionMode: 'export' });
        assert.ok(!encryptedToon.includes('Alice'));

        const decryptedCsv = converter.fromToon(encryptedToon, { conversionMode: 'ingestion' });
        assert.ok(decryptedCsv.includes('Alice'));
    });
});

describe('Parity across all converters', () => {
    const converters = [JsonConverter, YamlConverter, XmlConverter, CsvConverter];

    test('All have expected basic static methods', () => {
        converters.forEach(Conv => {
            assert.strictEqual(typeof Conv.fromToon, 'function', `${Conv.name} missing fromToon`);
            assert.strictEqual(typeof Conv.toToon, 'function', `${Conv.name} missing toToon`);
            assert.strictEqual(typeof Conv.validate, 'function', `${Conv.name} missing validate`);
        });
    });

    test('Identity methods should NOT exist', () => {
        assert.strictEqual(typeof JsonConverter.fromJson, 'undefined', 'JsonConverter should not have fromJson');
        assert.strictEqual(typeof YamlConverter.fromYaml, 'undefined', 'YamlConverter should not have fromYaml');
        assert.strictEqual(typeof XmlConverter.fromXml, 'undefined', 'XmlConverter should not have fromXml');
        assert.strictEqual(typeof CsvConverter.fromCsv, 'undefined', 'CsvConverter should not have fromCsv');
    });
});
