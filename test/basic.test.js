/**
 * Basic tests for TOON Converter
 * Run with: node --test test/basic.test.js
 */

import { test } from 'node:test';
import assert from 'node:assert';
import { jsonToToonSync, toonToJsonSync } from '../src/json.js';
import { validateToonStringSync } from '../src/validator.js';

test('JSON to TOON - Simple Object', () => {
    const input = { name: "Alice", age: 30, active: true };
    const result = jsonToToonSync(input);

    assert.ok(result.includes('name: "Alice"'));
    assert.ok(result.includes('age: 30'));
    assert.ok(result.includes('active: true'));
});

test('JSON to TOON - Array of Primitives', () => {
    const input = { numbers: [1, 2, 3, 4, 5] };
    const result = jsonToToonSync(input);

    assert.ok(result.includes('numbers[5]: 1, 2, 3, 4, 5'));
});

test('JSON to TOON - Tabular Array', () => {
    const input = {
        users: [
            { id: 1, name: "Alice", active: true },
            { id: 2, name: "Bob", active: false }
        ]
    };
    const result = jsonToToonSync(input);

    assert.ok(result.includes('users[2]{id,name,active}:'));
    assert.ok(result.includes('1,"Alice",true'));
    assert.ok(result.includes('2,"Bob",false'));
});

test('TOON to JSON - Simple Object', () => {
    const input = `name: "Alice"\nage: 30\nactive: true`;
    const result = toonToJsonSync(input);

    assert.strictEqual(result.name, "Alice");
    assert.strictEqual(result.age, 30);
    assert.strictEqual(result.active, true);
});

test('TOON to JSON - Array of Primitives', () => {
    const input = `numbers[5]: 1, 2, 3, 4, 5`;
    const result = toonToJsonSync(input);

    assert.ok(Array.isArray(result.numbers));
    assert.strictEqual(result.numbers.length, 5);
    assert.deepStrictEqual(result.numbers, [1, 2, 3, 4, 5]);
});

test('TOON to JSON - Tabular Array', () => {
    const input = `users[2]{id,name,active}:\n  1,"Alice",true\n  2,"Bob",false`;
    const result = toonToJsonSync(input);

    assert.ok(Array.isArray(result.users));
    assert.strictEqual(result.users.length, 2);
    assert.strictEqual(result.users[0].id, 1);
    assert.strictEqual(result.users[0].name, "Alice");
    assert.strictEqual(result.users[0].active, true);
    assert.strictEqual(result.users[1].id, 2);
    assert.strictEqual(result.users[1].name, "Bob");
    assert.strictEqual(result.users[1].active, false);
});

test('Round-trip Conversion - Object', () => {
    const original = {
        company: "TechCorp",
        employees: [
            { name: "Alice", role: "Engineer" },
            { name: "Bob", role: "Designer" }
        ]
    };

    const toon = jsonToToonSync(original);
    const result = toonToJsonSync(toon);

    assert.deepStrictEqual(result, original);
});

test('Validator - Valid TOON', () => {
    const input = `name: "Alice"\nage: 30`;
    const result = validateToonStringSync(input);

    assert.strictEqual(result.isValid, true);
    assert.strictEqual(result.error, null);
});

test('Validator - Invalid TOON (Array Size Mismatch)', () => {
    const input = `items[3]: 1, 2`; // Declared 3, but only 2 items
    const result = validateToonStringSync(input);

    assert.strictEqual(result.isValid, false);
    assert.ok(result.error.includes('Array size mismatch'));
});

test('Validator - Valid Tabular Array', () => {
    const input = `users[2]{id,name}:\n  1,"Alice"\n  2,"Bob"`;
    const result = validateToonStringSync(input);

    assert.strictEqual(result.isValid, true);
    assert.strictEqual(result.error, null);
});

test('Edge Case - Empty Object', () => {
    const input = {};
    const result = jsonToToonSync(input);

    assert.strictEqual(result.trim(), '');
});

test('Edge Case - Null Value', () => {
    const input = { value: null };
    const result = jsonToToonSync(input);

    assert.ok(result.includes('value: null'));
});

test('Edge Case - Nested Objects', () => {
    const input = {
        level1: {
            level2: {
                level3: "deep"
            }
        }
    };

    const toon = jsonToToonSync(input);
    const result = toonToJsonSync(toon);

    assert.deepStrictEqual(result, input);
});
