import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const progression=readFileSync(new URL('../progression.js',import.meta.url),'utf8');
function section(start,end){
 const a=html.indexOf(start),b=html.indexOf(end,a+start.length);
 assert.ok(a>=0&&b>a,'Seção não encontrada: '+start);
 return html.slice(a,b);
}
const N=new Function(section('const N=','const T=')+'return N')();
const M=new Function(section('const M=[','// Cenas verificadas:')+'return M')();
const dodge=section('const DODGE_MOVE=','const state=');
const unit=section('function unit(i)','const ENERGY_NAMES=');
const energy=section('const ENERGY_NAMES=','function setFilter(');
const combat=section('function attack(a,b,m)','function resultView()');
const progressFactory=new Function('window',progression+';return window.PokemonArenaProgress');
function progressStore(){
 const storage=new Map();
 const localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v)};
 return {api:progressFactory({localStorage}),localStorage};
}
function setup(progress=progressStore().api){
 const state={turn:1,team:[],foes:[],energy:{F:0,E:0,T:0,V:0},enemyEnergy:{F:0,E:0,T:0,V:0},queue:[],logs:[],active:0,finished:false,selectedMove:null,wins:0,losses:0};
 const engine=new Function('state','rnd','render','PokemonArenaProgress','N','M',
 dodge+unit+energy+'const firstAlive=a=>a.findIndex(x=>x.hp>0);'+combat+
 'return {unit,moves,attack,resolveTurn,checkEnd,energyPlan,required,pay,DODGE_MOVE};'
 )(state,()=>0,()=>{},progress,N,M);
 return {state,...engine};
}
const move=(i,name)=>{const m=M[i].find(m=>m[0]===name);assert.ok(m,'Golpe não encontrado: '+name);return m};
test('Starter e evoluções têm danos e custos balanceados',()=>{
 for(const i of [0,1,2])assert.equal(move(i,'Investida')[1],25);
 assert.deepEqual(move(2,'Chicote de Vinha').slice(1,3),[35,'FA']);
 assert.deepEqual(move(2,'Raio Solar').slice(1,3),[60,'TT']);
 assert.deepEqual(move(2,'Pó do Sono').slice(1,3),[15,'T']);
 assert.equal(move(10,'Lança-Chamas')[1]-move(0,'Lança-Chamas')[1],5);
 assert.equal(move(11,'Hidro Bomba')[1]-move(1,'Hidro Bomba')[1],5);
 assert.equal(move(12,'Raio Solar')[1]-move(2,'Raio Solar')[1],5);
 for(const m of M)assert.equal(m.length===3?m.length+1:m.length,4);
});
test('Esquiva é universal sem substituir as quatro habilidades',()=>{
 const h=setup();for(let i=0;i<N.length;i++)assert.equal(h.moves(i).length,4);
 assert.match(html,/onclick="showDodge\(\)"/);
});
test('IA usa somente golpes que pode pagar',()=>{
 const h=setup(),s=h.state;s.team=[h.unit(0)];s.foes=[h.unit(9)];
 s.enemyEnergy={F:1,E:0,T:0,V:0};h.resolveTurn();
 assert.equal(s.team[0].hp,82);
 assert.ok(s.logs.some(x=>x.includes('Ataque Rápido')));
 assert.ok(!s.logs.some(x=>x.includes('usou Raio')));
});
test('IA sem energia passa e não causa dano',()=>{
 const h=setup(),s=h.state;s.team=[h.unit(0)];s.foes=[h.unit(9)];
 h.resolveTurn();assert.equal(s.team[0].hp,100);
 assert.ok(s.logs.some(x=>x.includes('energia insuficiente')));
});
test('Sono impede ações da IA',()=>{
 const h=setup(),s=h.state;s.team=[h.unit(0)];s.foes=[h.unit(9)];
 s.foes[0].sleepTurn=1;s.enemyEnergy={F:3,E:0,T:0,V:0};
 h.resolveTurn();assert.equal(s.team[0].hp,100);
});
test('Esquiva protege contra ataques múltiplos, veneno e dano contínuo',()=>{
 const h=setup(),s=h.state;s.team=[h.unit(0)];s.foes=[h.unit(4)];
 h.attack(s.team[0],null,h.DODGE_MOVE);
 h.attack(s.foes[0],s.team[0],move(4,'Picada Venenosa'));
 h.attack(s.foes[0],s.team[0],move(4,'Investida'));
 assert.equal(s.team[0].hp,100);assert.equal(s.team[0].poison,0);
 s.team[0].burn=2;s.team[0].poison=2;h.resolveTurn();
 assert.equal(s.team[0].hp,100);assert.equal(s.team[0].dodge,false);
});
test('Casco Duro limpa status e escudo limitado a 50',()=>{
 const h=setup(),s=h.state;s.team=[h.unit(1)];s.foes=[h.unit(4)];
 const u=s.team[0];u.burn=2;u.poison=2;u.sleepTurn=1;u.stunTurn=1;u.costTax=1;u.weaken=true;
 h.attack(u,null,move(1,'Casco Duro'));
 assert.equal(u.burn+u.poison+u.sleepTurn+u.stunTurn+u.costTax,0);
 assert.equal(u.weaken,false);
 h.attack(u,null,move(1,'Casco Duro'));h.attack(u,null,move(1,'Casco Duro'));
 assert.equal(u.shield,50);
});
test('Sobrecarga exige uma energia adicional e expira após a ação',()=>{
 const h=setup(),s=h.state;s.team=[h.unit(9)];s.foes=[h.unit(0)];
 h.attack(s.team[0],s.foes[0],move(9,'Choque do Trovão'));
 assert.equal(s.foes[0].costTax,1);
 assert.equal(h.energyPlan(move(0,'Investida'),{F:1,E:0,T:0,V:0},s.foes[0]),null);
 assert.deepEqual(h.energyPlan(move(0,'Investida'),{F:1,E:1,T:0,V:0},s.foes[0]),['F','E']);
 h.attack(s.foes[0],s.team[0],move(0,'Investida'));assert.equal(s.foes[0].costTax,0);
});
test('Mordida de Ekans rouba uma energia do adversário',()=>{
 const h=setup(),s=h.state;s.team=[h.unit(8)];s.foes=[h.unit(0)];
 s.enemyEnergy.E=1;h.attack(s.team[0],s.foes[0],move(8,'Mordida'));
 assert.equal(s.enemyEnergy.E,0);assert.equal(s.energy.E,1);
});
test('Pó do Sono acerta toda a equipe menos os invulneráveis',()=>{
 const h=setup(),s=h.state;s.team=[h.unit(2)];s.foes=[h.unit(0),h.unit(1),h.unit(4)];
 s.foes[1].dodge=true;s.queue=[{ally:0,m:move(2,'Pó do Sono'),target:null,spent:['T']}];
 h.resolveTurn();
 assert.equal(s.foes[0].hp,85);assert.equal(s.foes[1].hp,100);assert.equal(s.foes[2].hp,85);
 assert.equal(s.foes[0].sleepTurn,2);assert.equal(s.foes[1].sleepTurn,0);
});
test('Vitórias consecutivas desbloqueiam uma evolução por resgate',()=>{
 const {api,localStorage}=progressStore(),h=setup(api),s=h.state;
 s.team=[h.unit(0)];s.foes=[h.unit(4)];
 for(let i=0;i<3;i++){s.finished=false;s.foes[0].hp=0;h.checkEnd()}
 h.checkEnd();assert.equal(api.read().wins,3);assert.equal(api.read().streak,3);
 assert.equal(api.claim('Charmeleon'),true);assert.equal(api.claim('Charmeleon'),false);
 assert.equal(api.read().streak,0);assert.equal(api.canClaim('Wartortle'),false);
 assert.equal(progressFactory({localStorage}).isUnlocked('Charmeleon'),true);
});
