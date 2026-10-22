/* Pokémon Arena — progressão local compartilhada entre Arena e Missões. */
(function(global){
 'use strict';
 const KEY='pokemon-arena-progression-v1';
 const REWARDS=['Charmeleon','Wartortle','Ivysaur'];
 let fallback={streak:0,wins:0,losses:0,unlocked:[]};
 function sanitize(data){
  const obj=data&&typeof data==='object'?data:{};
  return {
   streak:Number.isSafeInteger(obj.streak)&&obj.streak>=0?Math.min(obj.streak,3):0,
   wins:Number.isSafeInteger(obj.wins)&&obj.wins>=0?obj.wins:0,
   losses:Number.isSafeInteger(obj.losses)&&obj.losses>=0?obj.losses:0,
   unlocked:Array.isArray(obj.unlocked)?REWARDS.filter(name=>obj.unlocked.includes(name)):[]
  };
 }
 function read(){
  try{
   const raw=global.localStorage.getItem(KEY);
   return raw?sanitize(JSON.parse(raw)):sanitize(fallback);
  }catch(_){return sanitize(fallback);}
 }
 function save(data){
  fallback=sanitize(data);
  try{global.localStorage.setItem(KEY,JSON.stringify(fallback));}catch(_){}
  return {...fallback,unlocked:[...fallback.unlocked]};
 }
 function recordBattle(result){
  if(result!=='win'&&result!=='lose')return read();
  const next=read();
  if(result==='win'){next.wins++;next.streak=Math.min(3,next.streak+1);}
  else{next.losses++;next.streak=0;}
  return save(next);
 }
 function isUnlocked(name){return REWARDS.includes(name)&&read().unlocked.includes(name);}
 function canClaim(name){const p=read();return REWARDS.includes(name)&&!p.unlocked.includes(name)&&p.streak>=3;}
 function claim(name){
  if(!canClaim(name))return false;
  const p=read();
  p.unlocked.push(name);
  p.streak=0; // cada missão exige uma nova sequência de 3 vitórias
  save(p);
  return true;
 }
 global.PokemonArenaProgress=Object.freeze({read,recordBattle,isUnlocked,canClaim,claim,rewards:[...REWARDS]});
})(window);
