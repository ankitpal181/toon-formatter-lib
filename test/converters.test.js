/**
 * Tests for YAML, XML, and CSV Converters
 * Run with: node --test test/converters.test.js
 */

import { test } from 'node:test';
import assert from 'node:assert';
import { yamlToToonSync, toonToYamlSync } from '../src/yaml.js';
import { xmlToToon, toonToXmlSync } from '../src/xml.js';
import { csvToToon, csvToToonSync, toonToCsvSync } from '../src/csv.js';

// --- YAML Tests ---

test('YAML to TOON - Simple Object', () => {
    const yaml = `
name: Alice
age: 30
`;
    const toon = yamlToToonSync(yaml);
    assert.ok(toon.includes('name: "Alice"'));
    assert.ok(toon.includes('age: 30'));
});

test('TOON to YAML - Simple Object', () => {
    const toon = `name: "Alice"\nage: 30`;
    const yaml = toonToYamlSync(toon);
    assert.ok(yaml.includes('name: Alice'));
    assert.ok(yaml.includes('age: 30'));
});

test('YAML to TOON - Nested Structure', () => {
    const yaml = `
user:
  name: Alice
  roles:
    - admin
    - editor
`;
    const toon = yamlToToonSync(yaml);
    assert.ok(toon.includes('user:'));
    assert.ok(toon.includes('name: "Alice"'));
    assert.ok(toon.includes('roles[2]:'));
});

// --- XML Tests ---

test('XML to TOON - Simple Element', async () => {
    const xml = `<user><name>Alice</name><age>30</age></user>`;
    const toon = await xmlToToon(xml);

    // Note: XML conversion wraps based on root element
    assert.ok(toon.includes('user:'));
    assert.ok(toon.includes('name: "Alice"'));
    assert.ok(toon.includes('age: "30"')); // XML text content is usually string
});

test('TOON to XML - Simple Element', () => {
    const toon = `user:\n  name: "Alice"\n  age: 30`;
    const xml = toonToXmlSync(toon);

    assert.ok(xml.includes('<user>'));
    assert.ok(xml.includes('<name>Alice</name>'));
    assert.ok(xml.includes('<age>30</age>'));
    assert.ok(xml.includes('</user>'));
});

test('XML to TOON - Attributes', async () => {
    const xml = `<item id="123" type="widget">Content</item>`;
    const toon = await xmlToToon(xml);

    assert.ok(toon.includes('item:'));
    assert.ok(toon.includes('@attributes:'));
    assert.ok(toon.includes('id: "123"'));
    assert.ok(toon.includes('type: "widget"'));
    assert.ok(toon.includes('#text: "Content"'));
});

// --- CSV Tests ---

test('CSV to TOON - Basic (Async)', async () => {
    const csv = `name,age,active
Alice,30,true
Bob,25,false`;

    const toon = await csvToToon(csv);

    // Should detect as tabular array or array of objects
    // Since root is array, it might be [2]{name,age,active}: ...

    assert.ok(toon.includes('[2]{name,age,active}:'));
    assert.ok(toon.includes('Alice'));
    assert.ok(toon.includes('30'));
    assert.ok(toon.includes('true'));
});

test('CSV to TOON - Basic (Sync)', () => {
    const csv = `id,product
1,Apple
2,Banana`;

    const toon = csvToToonSync(csv);

    assert.ok(toon.includes('[2]{id,product}:'));
    assert.ok(toon.includes('1,"Apple"'));
    assert.ok(toon.includes('2,"Banana"'));
});

test('TOON to CSV - Basic', () => {
    const toon = `
[2]{name,role}:
  "Alice","Admin"
  "Bob","User"
`;
    const csv = toonToCsvSync(toon);

    assert.ok(csv.includes('name,role'));
    assert.ok(csv.includes('Alice,Admin'));
    assert.ok(csv.includes('Bob,User'));
});

test('CSV Round Trip', async () => {
    const originalCsv = `name,score
Alice,100
Bob,95`;

    const toon = await csvToToon(originalCsv);
    const finalCsv = toonToCsvSync(toon);

    // Note: PapaParse might add/remove quotes or change spacing, so exact match isn't always guaranteed
    // But content should be same
    assert.ok(finalCsv.includes('name'));
    assert.ok(finalCsv.includes('score'));
    assert.ok(finalCsv.includes('Alice'));
    assert.ok(finalCsv.includes('100'));
});
