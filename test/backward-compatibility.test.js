/**
 * Backward Compatibility Test
 * Ensures existing code still works without modifications
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
    ToonConverter,
    jsonToToonSync,
    toonToJsonSync,
    yamlToToonSync,
    toonToYamlSync,
    xmlToToonSync,
    toonToXmlSync,
    csvToToonSync,
    toonToCsvSync
} from '../src/index.js';

describe('Backward Compatibility', () => {
    const testData = { name: "Alice", age: 30, active: true };
    const testToon = 'name: "Alice"\nage: 30\nactive: true';

    it('should work with direct function imports (JSON)', () => {
        const toon = jsonToToonSync(testData);
        assert.ok(toon.includes('name: "Alice"'));

        const json = toonToJsonSync(toon);
        assert.strictEqual(json.name, 'Alice');
        assert.strictEqual(json.age, 30);
    });

    it('should work with static ToonConverter methods (JSON)', () => {
        const toon = ToonConverter.fromJson(testData);
        assert.ok(toon.includes('name: "Alice"'));

        const json = ToonConverter.toJson(toon);
        assert.strictEqual(json.name, 'Alice');
    });

    it('should work with YAML converters', () => {
        const yamlString = 'name: Alice\nage: 30';
        const toon = yamlToToonSync(yamlString);
        assert.ok(toon.includes('name: "Alice"'));

        const yaml = toonToYamlSync(toon);
        assert.ok(yaml.includes('name: Alice'));
    });

    it('should work with XML converters', () => {
        const xmlString = '<user><name>Alice</name></user>';
        const toon = xmlToToonSync(xmlString);
        assert.ok(toon.includes('Alice'));

        // XML round-trip test
        const data = { user: { name: "Alice" } };
        const toonFromData = jsonToToonSync(data);
        const xml = toonToXmlSync(toonFromData);
        assert.ok(xml.includes('<name>Alice</name>'));
    });

    it('should work with CSV converters', () => {
        const csvString = 'name,age\nAlice,30';
        const toon = csvToToonSync(csvString);
        assert.ok(toon.includes('Alice'));

        const csv = toonToCsvSync(toon);
        assert.ok(csv.includes('Alice'));
    });

    it('should maintain default returnJson=false behavior', () => {
        const result = ToonConverter.toJson(testToon);
        assert.strictEqual(typeof result, 'object');
        assert.strictEqual(result.name, 'Alice');
    });

    it('should support new returnJson=true parameter', () => {
        const result = ToonConverter.toJson(testToon, true);
        assert.strictEqual(typeof result, 'string');
        const parsed = JSON.parse(result);
        assert.strictEqual(parsed.name, 'Alice');
    });

    it('should work without creating ToonConverter instance', () => {
        // Old usage pattern should still work
        const toon = ToonConverter.fromJson(testData);
        const json = ToonConverter.toJson(toon);

        assert.ok(toon.includes('name: "Alice"'));
        assert.strictEqual(json.name, 'Alice');
    });
});
