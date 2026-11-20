/* eslint-disable @typescript-eslint/no-require-imports -- Node's built-in CommonJS test runner. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const vm = require('node:vm');
const exportsObject = {};
const js = ts.transpileModule(fs.readFileSync('lib/establishments.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
vm.runInNewContext(js, { exports: exportsObject });
const { validateEstablishment, registerEstablishment } = exportsObject;
function valid() { const form = new FormData(); Object.entries({name:'Herbolario Los Andes', description:'Productos naturales para el bienestar.', address:'Jirón Los Olivos 123', department:'Lima', province:'Lima', district:'Miraflores', phone:'+51 987 654 321'}).forEach(([k,v]) => form.set(k,v)); return form; }
function store(identity = { id: 'owner-1', role: 'seller' }) { return { identity: async () => identity, insert: async () => 'ok' }; }
test('valida campos obligatorios', () => { const form = valid(); form.delete('description'); assert.ok(validateEstablishment(form).errors.description); });
test('valida longitud del nombre', () => { const form = valid(); form.set('name', 'AB'); assert.ok(validateEstablishment(form).errors.name); });
test('valida teléfono y normaliza prefijo', () => { const form = valid(); assert.equal(validateEstablishment(form).values.phone, '987654321'); form.set('phone', '123'); assert.ok(validateEstablishment(form).errors.phone); });
test('valida ubicación sin inventar catálogos', () => { const form = valid(); form.set('district', ' '); assert.ok(validateEstablishment(form).errors.district); });
test('registra datos válidos con el propietario de la sesión', async () => { const db = store(); let owner; db.insert = async (id, data) => { owner = id; assert.equal(data.name, 'Herbolario Los Andes'); return 'ok'; }; assert.equal((await registerEstablishment(db, valid())).status, 'ok'); assert.equal(owner, 'owner-1'); });
test('rechaza propietario manipulado y datos inválidos', async () => { const db = store(); db.insert = async () => { assert.fail('No debe insertar'); }; const form = valid(); form.set('owner_id', 'otra'); assert.equal((await registerEstablishment(db, form)).status, 'invalid'); });
test('deniega usuarios anónimos y compradores', async () => { assert.equal((await registerEstablishment(store(null), valid())).status, 'unauthenticated'); assert.equal((await registerEstablishment(store({ id:'1', role:'buyer' }), valid())).status, 'forbidden'); });
test('maneja duplicados', async () => { const db = store(); db.insert = async () => 'duplicate'; assert.equal((await registerEstablishment(db, valid())).status, 'duplicate'); });
