/* eslint-disable @typescript-eslint/no-require-imports -- Node's built-in CommonJS test runner. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const vm = require('node:vm');
const exportsObject = {};
const js = ts.transpileModule(fs.readFileSync('lib/profile.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
vm.runInNewContext(js, { exports: exportsObject });
const { loadProfile, changeProfileName, hasRole } = exportsObject;
const profile = { id: 'user-1', full_name: 'Ana Pérez', email: 'ana@example.com', role: 'buyer', created_at: '2026-01-01T00:00:00Z' };
function store(user = { id: 'user-1' }) { return { user: async () => user, read: async () => profile, updateName: async () => true }; }
function form(name = 'Ana Pérez') { const data = new FormData(); data.set('full_name', name); return data; }
test('muestra el perfil correspondiente al usuario autenticado', async () => { const result = await loadProfile(store()); assert.equal(result.status, 'ok'); assert.equal(result.profile.full_name, profile.full_name); assert.equal(result.profile.role, 'buyer'); });
test('actualiza solamente el nombre del usuario autenticado', async () => { const db = store(); let actual; db.updateName = async (id, name) => { actual = [id, name]; return true; }; assert.equal((await changeProfileName(db, form('  María Pérez  '))).status, 'ok'); assert.deepEqual(actual, ['user-1', 'María Pérez']); });
test('rechaza nombres inválidos', async () => { const db = store(); db.updateName = async () => { assert.fail('No debe actualizar'); }; assert.equal((await changeProfileName(db, form(' '))).status, 'invalid'); assert.equal((await changeProfileName(db, form('x'))).status, 'invalid'); });
test('rechaza campos manipulados como el rol', async () => { const db = store(); db.updateName = async () => { assert.fail('No debe actualizar'); }; const data = form(); data.set('role', 'admin'); assert.equal((await changeProfileName(db, data)).status, 'invalid'); });
test('impide lectura y actualización sin sesión', async () => { const db = store(null); db.read = async () => { assert.fail('No debe leer'); }; db.updateName = async () => { assert.fail('No debe actualizar'); }; assert.equal((await loadProfile(db)).status, 'unauthenticated'); assert.equal((await changeProfileName(db, form())).status, 'unauthenticated'); });
test('controla los roles permitidos y rechaza roles desconocidos', () => { assert.equal(hasRole('buyer', ['seller', 'admin']), false); assert.equal(hasRole('seller', ['admin']), false); assert.equal(hasRole('admin', ['admin']), true); assert.equal(hasRole('other', ['admin']), false); });
test('rechaza perfiles de otra cuenta y errores de actualización', async () => { const db = store(); db.read = async () => ({ ...profile, id: 'otra' }); assert.equal((await loadProfile(db)).status, 'unavailable'); db.updateName = async () => false; assert.equal((await changeProfileName(db, form())).status, 'unavailable'); });
