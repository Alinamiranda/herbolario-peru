/* eslint-disable @typescript-eslint/no-require-imports -- Node's built-in CommonJS test runner. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const vm = require('node:vm');
const exportsObject = {};
const js = ts.transpileModule(fs.readFileSync('lib/directory.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
vm.runInNewContext(js, { exports: exportsObject, URLSearchParams });
const { parseFilters, choices, escapeLike, phoneHref } = exportsObject;
const rows = [{department:'Lima',province:'Lima',district:'Miraflores'},{department:'Lima',province:'Huaral',district:'Huaral'},{department:'Cusco',province:'Cusco',district:'Cusco'}];
test('conserva coincidencia parcial por nombre y escapa comodines', () => { assert.equal(parseFilters({name:'  natural  '}).filters.name,'natural'); assert.equal(escapeLike('100%_'), '100\\%\\_'); });
test('lista departamentos y provincias correspondientes', () => { const c=choices(rows,'Lima',''); assert.equal(c.departments.length,2); assert.equal(c.provinces.length,2); assert.ok(!c.provinces.includes('Cusco')); });
test('filtra distritos según departamento y provincia', () => { const c=choices(rows,'Lima','Lima'); assert.equal(c.districts.length,1); assert.equal(c.districts[0],'Miraflores'); });
test('acepta filtros combinados y página', () => { const f=parseFilters({name:'Sol',department:'Lima',province:'Lima',district:'Miraflores',page:'2'}).filters; assert.equal(f.name,'Sol'); assert.equal(f.district,'Miraflores'); assert.equal(f.page,2); });
test('retorna opciones vacías sin coincidencias', () => { assert.equal(choices(rows,'No existe','').provinces.length,0); });
test('limpiar filtros deja valores vacíos y primera página', () => { const f=parseFilters({}).filters; assert.equal(f.name,''); assert.equal(f.department,''); assert.equal(f.province,''); assert.equal(f.district,''); assert.equal(f.page,1); });
test('rechaza parámetros inválidos y jerarquías incompletas', () => { assert.ok(parseFilters({page:'-1'}).error); assert.ok(parseFilters({province:'Lima'}).error); assert.ok(parseFilters({name:['a','b']}).error); assert.ok(parseFilters({name:'x'.repeat(121)}).error); });
test('solo genera enlaces telefónicos con formato admitido', () => { assert.equal(phoneHref('987654321'),'tel:+51987654321'); assert.equal(phoneHref('javascript:alert(1)'),undefined); });
