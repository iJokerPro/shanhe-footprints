import fs from 'node:fs';
import assert from 'node:assert/strict';
import ts from 'typescript';
const code=ts.transpileModule(fs.readFileSync('lib/geographic-shapes.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const {shapeRings}=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
const rings=shapeRings('M25,20L36.7,20L36.7,34.3Z');
assert.deepEqual(rings,[[[54,73],[54,74],[53,74]]]);
const data=JSON.parse(fs.readFileSync('public/maps/national-cities.json','utf8'));
for(const shape of data.cities.filter(s=>s.name)){assert.ok(shapeRings(shape.path).length,`${shape.name} has no geographic polygon`);}
assert.equal(shapeRings('M0,999999L1,999999L2,999999Z').length,0);
console.log('Passed geographic inverse projection, city polygon coverage and invalid coordinate checks.');
