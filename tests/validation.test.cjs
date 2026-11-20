/* eslint-disable @typescript-eslint/no-require-imports -- This test runs as CommonJS under node:test. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const vm = require('node:vm');
const source = fs.readFileSync('lib/validation.ts', 'utf8');
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const exportsObject = {};
vm.runInNewContext(js, { exports: exportsObject });
const { validateAuth } = exportsObject;
function valid() { const f = new FormData(); Object.entries({ name: 'Ana Pérez', email: 'ana@example.com', password: 'segura123', confirmPassword: 'segura123', role: 'buyer', terms: 'on' }).forEach(([k,v]) => f.set(k,v)); return f; }
test('registro válido', () => assert.equal(validateAuth(valid(), true), null));
test('correo inválido', () => { const f = valid(); f.set('email', 'no-es-correo'); assert.ok(validateAuth(f, true)); });
test('contraseñas diferentes', () => { const f = valid(); f.set('confirmPassword', 'diferente1'); assert.match(validateAuth(f, true), /no coinciden/); });
test('contraseña débil', () => { const f = valid(); f.set('password', '123'); assert.ok(validateAuth(f, true)); });
test('rol administrador rechazado', () => { const f = valid(); f.set('role', 'admin'); assert.ok(validateAuth(f, true)); });
test('términos obligatorios', () => { const f = valid(); f.delete('terms'); assert.ok(validateAuth(f, true)); });
