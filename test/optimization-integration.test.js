/**
 * Integration Tests for Smart Code Optimization
 * 
 * Verifies that all converters (JSON, XML, YAML, CSV) correctly:
 * 1. Extract data blocks from mixed text
 * 2. Preserve and reduce code blocks
 * 3. Optimize verbose phrases in non-data text
 */

import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import {
    ToonConverter,
    JsonConverter,
    XmlConverter,
    YamlConverter,
    CsvConverter
} from '../src/index.js';

// Polyfill DOMParser for Node.js env
before(async () => {
    if (typeof DOMParser === 'undefined') {
        const { DOMParser: NodeDOMParser } = await import('xmldom');
        global.DOMParser = NodeDOMParser;
    }
});

describe('Optimization Integration Tests', () => {

    describe('ToonConverter (JSON optimization)', () => {
        it('should optimize mixed text during fromJson', () => {
            const input = `Please check the following large language model configuration:
{"model": "gpt-4", "temp": 0.7}
As soon as possible.

npm install openai // install helper`;

            const output = ToonConverter.fromJson(input);

            // 1. Text optimization: "check" was removed from dict, but "large language model" -> "llm"
            assert.ok(output.includes('llm'));
            assert.ok(output.includes('asap'));

            // 2. Data conversion
            assert.ok(output.includes('model: "gpt-4"'));

            // 3. Code reduction
            assert.ok(output.includes('npm install openai'));
            assert.ok(!output.includes('// install helper'));
        });

        it('should handle async optimization similarly', async () => {
            const input = 'Info: {"x": 1}\n\n# Python comment\nprint(1)';
            const output = await ToonConverter.fromJsonAsync(input);

            assert.ok(output.includes('x: 1'));
            assert.ok(output.includes('print(1)'));
            assert.ok(!output.includes('# Python comment'));
        });
    });

    describe('XmlConverter optimization', () => {
        it('should optimize mixed text with XML blocks', () => {
            const input = `Here is for your information:
<user><name>Alice</name></user>
By the way.

git commit -m "feat: xml"`;

            const output = XmlConverter.toJson(input);

            assert.ok(output.includes('fyi'));
            assert.ok(output.includes('btw'));
            // XML converted to JSON (stringified for mixed text check)
            const result = typeof output === 'string' ? output : JSON.stringify(output);
            assert.ok(result.includes('"name":"Alice"'));
            assert.ok(result.includes('git commit'));
        });
    });

    describe('JsonConverter to YAML optimization', () => {
        it('should optimize mixed text when converting JSON to YAML (jsonToOthers)', () => {
            const input = `Estimated time of arrival is 5pm.
{"user": "Bob", "role": "admin"}

docker ps -a`;

            const output = JsonConverter.toYaml(input);

            assert.ok(output.includes('eta'));
            // JSON converted to YAML in mixed mode
            assert.ok(output.includes('user: Bob'));
            assert.ok(output.includes('docker ps'));
        });
    });

    describe('CsvConverter optimization', () => {
        it('should optimize mixed text with CSV blocks', () => {
            const input = `Maximum results expected.
id,val
1,100
2,200

# shebang
#!/bin/node`;

            const output = CsvConverter.toJson(input);

            assert.ok(output.includes('max'));
            // CSV converted to JSON string (array of objects) in mixed mode
            assert.ok(output.includes('"id":1'));
            assert.ok(output.includes('#!/bin/node'));
        });
    });

    describe('Edge Cases', () => {
        it('should preserve formatting for pure data strings (fromToon)', () => {
            const input = 'name: "Alice"\nrole: "admin"';
            const output = ToonConverter.toJson(input);
            // Pure TOON should be converted to raw object, not mixed string
            assert.strictEqual(typeof output, 'object');
            assert.strictEqual(output.name, 'Alice');
        });

        it('should handle multiple data blocks of same format', () => {
            const input = 'Set A: {"a": 1} and Set B: {"b": 2}';
            const output = ToonConverter.fromJson(input);
            assert.ok(output.includes('a: 1'));
            assert.ok(output.includes('b: 2'));
        });

        it('should not break on strings that look like data but are just text', () => {
            const input = 'This is not { json } but looks like it.';
            const output = ToonConverter.fromJson(input);
            // Should just be optimized text
            assert.ok(output.includes('This is not { json }'));
        });
    });
});
