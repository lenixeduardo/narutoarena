import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
function section(start, end) {
  const a = html.indexOf(start);
  const b = html.indexOf(end, a + start.length);
  assert.ok(a >= 0 && b > a, 'Expected source section: ' + start);
  return html.slice(a, b);
}
const movesSource = section('const M=[', '// Cenas verificadas:');
const M = new Function(movesSource + '\nreturn M;')();
const ENERGY = new Function(
  'const state={energy:{F:1,E:1,T:2,V:0}};\n' +
  section('const ENERGY_NAMES=', 'function setFilter(') +
  '\nreturn {required,energyPlan,energyPips,labelCost};'
)();
function getMove(pokemonIndex, name) {
  const move = M[pokemonIndex].find(m => m[0] === name);
  assert.ok(move, 'Missing '+name+' for '+pokemonIndex);
  return move;
}

test('JavaScript blocks parse', () => {
  const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)];
  assert.ok(scripts.length > 0);
  for(const [, , script] of scripts) new Function(script);
});
test('10 original Pokemon and three evolutions have four described skills', () => {
  assert.equal(M.length, 13);
  for (const moves of M) {
    assert.equal(moves.length, 4);
    for (const [name, damage, cost, description] of moves) {
      assert.ok(name.length > 2);
      assert.ok(Number.isInteger(damage) && damage >= 0);
      assert.match(cost, /^[FETVA]+$/);
      assert.ok(description.length > 45, 'Description must explain '+name);
    }
  }
});
test('each starter has a 25-damage Investida', () => {
  for (const i of [0,1,2]) assert.deepEqual(getMove(i,'Investida').slice(1,3),[25,'F']);
});
test('Bulbasaur damage and special energy requirements', () => {
  assert.deepEqual(getMove(2,'Chicote de Vinha').slice(1,3),[35,'FA']);
  assert.deepEqual(getMove(2,'Raio Solar').slice(1,3),[60,'TT']);
  assert.deepEqual(getMove(2,'Pó do Sono').slice(1,3),[15,'T']);
});
test('the black wildcard is paid with any remaining energy after fixed costs', () => {
  const vine = getMove(2,'Chicote de Vinha');
  assert.deepEqual(ENERGY.energyPlan(vine,{F:1,E:1,T:0,V:0}),['F','E']);
  assert.deepEqual(ENERGY.energyPlan(vine,{F:2,E:0,T:0,V:0}),['F','F']);
  assert.equal(ENERGY.energyPlan(vine,{F:1,E:0,T:0,V:0}),null);
  assert.match(ENERGY.energyPips(vine),/energy-pip--A/);
});
test('Solar Beam requires two technical energies', () => {
  const solar = getMove(2,'Raio Solar');
  assert.deepEqual(ENERGY.energyPlan(solar,{F:0,E:0,T:2,V:0}),['T','T']);
  assert.equal(ENERGY.energyPlan(solar,{F:1,E:0,T:1,V:0}),null);
});
test('shield and sleep are applied by combat engine', () => {
  const N=['Charmander','Squirtle','Bulbasaur','Caterpie','Weedle','Pidgey','Rattata','Spearow','Ekans','Pikachu','Charmeleon','Wartortle','Ivysaur'];
  const combat = new Function(
    'const N='+JSON.stringify(N)+';const state={turn:1,logs:[]};const rnd=()=>0;' +
    'function unit(i){return {i,hp:100,dodge:false,burn:0,poison:0,sleepTurn:0,stunTurn:0,weaken:false,shield:0}};' +
    section('function attack(a,b,m)', 'function checkEnd()') +
    'return {attack,unit,state};'
  )();
  const attacker = combat.unit(2), squirtle = combat.unit(1);
  combat.attack(squirtle, null, getMove(1,'Casco Duro'));
  assert.equal(squirtle.shield,25);
  combat.attack(attacker, squirtle, getMove(2,'Chicote de Vinha'));
  assert.equal(squirtle.shield,0);
  assert.equal(squirtle.hp,90);
  const enemy = combat.unit(0);
  combat.attack(attacker,enemy,getMove(2,'Pó do Sono'));
  assert.equal(enemy.hp,85);
  assert.equal(enemy.sleepTurn,2);
  combat.state.turn=2;
  combat.attack(enemy,attacker,getMove(0,'Investida'));
  assert.equal(attacker.hp,100);
});
test('Pó do Sono targets every enemy and cannot bypass sleep or stun', () => {
  const source = section('const perform=', 'for(const q of state.queue.filter(');
  assert.match(source,/enemySide\.filter\(x=>x\.hp>0\)/);
  assert.match(source,/actor\.sleepTurn===state\.turn\|\|actor\.stunTurn===state\.turn/);
});
test('moves never use another species generic battle illustration', () => {
  assert.match(html,/const VERIFIED_MOVE_IMAGES/);
  assert.match(html,/const imgMove=\(n,i\)=>A\[VERIFIED_MOVE_IMAGES\[i\+':'\+n\]\]\|\|portrait\(i\)/);
  assert.match(html,/skillArt\(f,m\)/);
  assert.match(html,/skillArt\(u\.i,m\)/);
});
test('trainer rank remains in the trainer profile', () => {
  assert.match(html,/function trainerRank\(\)/);
  assert.match(html,/RANK <b>\$\{trainerRank\(\)\}<\/b>/);
  assert.match(html,/VITÓRIAS <b>\$\{state\.wins\}<\/b>/);
  assert.match(html,/DERROTAS <b>\$\{state\.losses\}<\/b>/);
});
