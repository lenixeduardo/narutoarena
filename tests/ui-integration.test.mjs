import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const home=readFileSync(new URL('../home.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../home.css',import.meta.url),'utf8');
const missions=readFileSync(new URL('../missions.html',import.meta.url),'utf8');
const progression=readFileSync(new URL('../progression.js',import.meta.url),'utf8');
const N=['Charmander','Squirtle','Bulbasaur','Caterpie','Weedle','Pidgey','Rattata','Spearow','Ekans','Pikachu','Charmeleon','Wartortle','Ivysaur'];
function boot(){
 const storage=new Map(),window={innerWidth:390,localStorage:{getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v)}};
 const progress=new Function('window',progression+';return window.PokemonArenaProgress;')(window);
 const view={innerHTML:''};
 const document={body:{classList:{toggle(){}}},getElementById:id=>id==='view'?view:null};
 const moves=i=>[['Investida',25,'F','Investida'],['Ataque',20,'E','Ataque'],['Apoio',0,'T','Apoio'],['Esquiva',0,'A','Invulnerabilidade']];
 const state={view:'team',picked:[],wins:0,losses:0};
 const app=new Function('render','state','N','T','A','moves','imgMove','portrait','labelCost','PokemonArenaProgress','document','window','assignToSlot','removeSlot','prepare','startBattle','navigate','hasInnateDodge',
 home+';return {render};'
 )(()=>{},state,N,N.map(()=>'Normal'),{arena_kanto:'data:fake',trainer_hero:'trainer'},moves,(name,i)=>'skill-'+i+'-'+name,i=>'portrait-'+i,()=> 'Física',progress,document,window,()=>{},()=>{},()=>{},()=>{},()=>{},i=>moves(i).some(m=>m[0]==='Esquiva'));
 return {window,view,progress,app};
}
test('Home mostra evoluções bloqueadas e não mostra botões removidos',()=>{
 const {view}=boot();
 for(const name of ['Charmeleon','Wartortle','Ivysaur'])assert.match(view.innerHTML,new RegExp('aria-label="'+name+' bloqueado'));
 assert.doesNotMatch(view.innerHTML,/home-team-actions|class="home-toolbar"/);
});
test('Missão libera Charmeleon mas preserva bloqueio dos demais',()=>{
 const {view,progress,app}=boot();
 for(let i=0;i<3;i++)progress.recordBattle('win');
 assert.equal(progress.claim('Charmeleon'),true);
 app.render();
 assert.match(view.innerHTML,/aria-label="Ver habilidades de Charmeleon"/);
 assert.match(view.innerHTML,/aria-label="Wartortle bloqueado/);
 assert.match(view.innerHTML,/aria-label="Ivysaur bloqueado/);
});
test('Arte das habilidades usa a espécie selecionada',()=>{
 const {view,window}=boot();
 window.homeInspect(0);
 assert.match(view.innerHTML,/skill-0-Investida/);
});
test('CSS mobile mantém grade 3x3 e página de missões tem três resgates',()=>{
 assert.match(css,/grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
 for(const name of ['Charmeleon','Wartortle','Ivysaur'])assert.match(missions,new RegExp('data-claim="'+name+'"'));
 const inline=[...missions.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(x=>x[1]).filter(x=>x.trim());
 assert.equal(inline.length,1);
 new Function(inline[0]);
});
