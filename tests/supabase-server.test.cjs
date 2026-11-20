/* eslint-disable @typescript-eslint/no-require-imports -- Node's built-in CommonJS test runner. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const vm = require('node:vm');
const source = fs.readFileSync('lib/supabase/server.ts', 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;

test('el cliente de Supabase espera la petición antes de inicializar Auth', async () => {
 let release; const request = new Promise(resolve => { release = resolve; });
 const calls = []; const exportsObject = {};
 const modules = { 'server-only': {}, 'next/server': { connection: () => { calls.push('connection'); return request; } }, 'next/headers': { cookies: async () => { calls.push('cookies'); return { getAll: () => [], set: () => {} }; } }, '@supabase/ssr': { createServerClient: () => { calls.push('client'); return {}; } } };
 vm.runInNewContext(compiled, { exports: exportsObject, require: name => modules[name], process: { env: { NEXT_PUBLIC_SUPABASE_URL: 'example', NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'example' } } });
 const result = exportsObject.createClient();
 assert.deepEqual(calls, ['connection']);
 release(); await result;
 assert.deepEqual(calls, ['connection', 'cookies', 'client']);
});
