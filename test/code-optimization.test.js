/**
 * Tests for Smart Code Optimization functions
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
    isCode,
    extractCodeBlocks,
    reduceCodeBlock,
    alterExpensiveWords,
    dataManager,
    dataManagerAsync,
    extractJsonFromString
} from '../src/utils.js';

describe('Smart Code Optimization', () => {

    describe('isCode()', () => {
        it('should detect npm commands', () => {
            assert.strictEqual(isCode('npm install express'), true);
        });

        it('should detect git commands', () => {
            assert.strictEqual(isCode('git clone https://github.com/user/repo'), true);
        });

        it('should detect docker commands', () => {
            assert.strictEqual(isCode('docker run -d -p 8080:80 nginx'), true);
        });

        it('should detect shell prompts', () => {
            assert.strictEqual(isCode('$ echo "hello"'), true);
        });

        it('should detect shebangs', () => {
            assert.strictEqual(isCode('#!/bin/bash'), true);
        });

        it('should detect multi-line code with import', () => {
            const code = `import express from 'express';
const app = express();`;
            assert.strictEqual(isCode(code), true);
        });

        it('should detect multi-line code with function', () => {
            const code = `function hello() {
    console.log("world");
}`;
            assert.strictEqual(isCode(code), true);
        });

        it('should NOT detect plain text', () => {
            assert.strictEqual(isCode('This is just a regular sentence.'), false);
        });

        it('should NOT detect short strings', () => {
            assert.strictEqual(isCode('hi'), false);
        });
    });

    describe('extractCodeBlocks()', () => {
        it('should extract code blocks separated by double newlines', () => {
            const text = `npm install express

This is some text.

git clone repo`;
            const blocks = extractCodeBlocks(text);
            assert.strictEqual(blocks.length, 2);
            assert.strictEqual(blocks[0].code, 'npm install express');
            assert.strictEqual(blocks[1].code, 'git clone repo');
        });

        it('should return empty array for non-code text', () => {
            const text = 'Just normal text here.';
            const blocks = extractCodeBlocks(text);
            assert.strictEqual(blocks.length, 0);
        });
    });

    describe('reduceCodeBlock()', () => {
        it('should remove Python-style comments', () => {
            const code = `def hello():
    # This is a comment
    print("hello")`;
            const reduced = reduceCodeBlock(code);
            assert.ok(!reduced.includes('# This is a comment'));
            assert.ok(reduced.includes('print("hello")'));
        });

        it('should remove JS-style comments', () => {
            const code = `function hello() {
    // This is a comment
    console.log("hello");
}`;
            const reduced = reduceCodeBlock(code);
            assert.ok(!reduced.includes('// This is a comment'));
            assert.ok(reduced.includes('console.log("hello")'));
        });

        it('should compress double newlines', () => {
            const code = `line1


line2`;
            const reduced = reduceCodeBlock(code);
            assert.ok(!reduced.includes('\n\n'));
        });
    });

    describe('alterExpensiveWords()', () => {
        it('should replace "large language model" with "llm"', () => {
            const text = 'This is a large language model test.';
            const result = alterExpensiveWords(text);
            assert.strictEqual(result, 'This is a llm test.');
        });

        it('should replace "as soon as possible" with "asap"', () => {
            const text = 'Please reply as soon as possible.';
            const result = alterExpensiveWords(text);
            assert.strictEqual(result, 'pls reply asap.');
        });

        it('should be case insensitive', () => {
            const text = 'LARGE LANGUAGE MODEL is cool.';
            const result = alterExpensiveWords(text);
            assert.strictEqual(result, 'llm is cool.');
        });

        it('should replace multiple phrases', () => {
            const text = 'Please help me information.';
            const result = alterExpensiveWords(text);
            assert.ok(result.includes('pls'));
            assert.ok(result.includes('info'));
        });
    });

    describe('dataManager()', () => {
        it('should pass through non-string data', () => {
            const mockConverter = (data) => JSON.stringify(data);
            const wrapped = dataManager(mockConverter, extractJsonFromString);
            const result = wrapped({ name: 'test' });
            assert.strictEqual(result, '{"name":"test"}');
        });

        it('should extract and convert JSON from mixed text', () => {
            const mockConverter = (data) => {
                if (typeof data === 'string') {
                    try {
                        const obj = JSON.parse(data);
                        return `name: "${obj.name}"`;
                    } catch {
                        return data;
                    }
                }
                return data;
            };
            const wrapped = dataManager(mockConverter, extractJsonFromString);
            const input = 'Here is some data: {"name": "Alice"} for you.';
            const result = wrapped(input);
            assert.ok(result.includes('name: "Alice"'));
            assert.ok(result.includes('Here is some data:'));
        });

        it('should return raw result if input is 100% data block', () => {
            const mockConverter = (data) => JSON.parse(data);
            const wrapped = dataManager(mockConverter, extractJsonFromString);
            const input = '{"a": 1}';
            const result = wrapped(input);
            assert.strictEqual(typeof result, 'object');
            assert.strictEqual(result.a, 1);
        });

        it('should preserve and reduce code blocks', () => {
            const passthrough = (data) => data;
            const wrapped = dataManager(passthrough, extractJsonFromString);
            const input = `npm install express // main command

Some text here`;
            const result = wrapped(input);
            // Code block should be reduced (comments stripped)
            assert.ok(result.includes('npm install express'));
            assert.ok(!result.includes('// main command'));
        });
    });

    describe('dataManagerAsync()', () => {
        it('should pass through non-string data (async)', async () => {
            const mockConverter = async (data) => JSON.stringify(data);
            const wrapped = dataManagerAsync(mockConverter, extractJsonFromString);
            const result = await wrapped({ name: 'test' });
            assert.strictEqual(result, '{"name":"test"}');
        });

        it('should extract and convert blocks (async)', async () => {
            const mockConverter = async (data) => `converted: ${data}`;
            const wrapped = dataManagerAsync(mockConverter, extractJsonFromString);
            const input = 'Start {"x": 1} End';
            const result = await wrapped(input);
            assert.ok(result.includes('converted: {"x": 1}'));
        });

        it('should return raw result if input is 100% data block (async)', async () => {
            const mockConverter = async (data) => JSON.parse(data);
            const wrapped = dataManagerAsync(mockConverter, extractJsonFromString);
            const input = '{"b": 2}';
            const result = await wrapped(input);
            assert.strictEqual(typeof result, 'object');
            assert.strictEqual(result.b, 2);
        });
    });
});
