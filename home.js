/* Pokémon Arena · homepage integrated with existing battle engine */
(function(){
 const originalRender=render;
 let search='', mode='survival', inspected=null;
 // Prévia visual de espécies ainda não habilitadas no motor de batalha.
 // Nunca entram na seleção: os 10 iniciais continuam totalmente jogáveis.
 const previews=[
  {name:'Charizard',dex:6},{name:'Blastoise',dex:9},
  {name:'Venusaur',dex:3},{name:'Gengar',dex:94},
  {name:'Lucario',dex:448},{name:'Mewtwo',dex:150},
  {name:'Eevee',dex:133},{name:'Snorlax',dex:143}
 ];
 const escapeAttr=s=>String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
 const utcTime=()=>new Intl.DateTimeFormat('pt-BR',{hour:'2-digit',minute:'2-digit',timeZone:'UTC'}).format(new Date());
 const ball='<span class="home-ball" aria-hidden="true"></span>';
 function detailsCard(i){
 if(i===null||i<0||i>=N.length)return '';
 const selected=state.picked.includes(i),full=state.picked.length>=3;
 const entries=moves(i).map((m,j)=>{
  const support=m[1]===0;
  const image=m[0]==='Esquiva'?A.esquiva:imgMove(m[0]);
  return `<li class="home-ability"><img src="${image}" alt="" loading="lazy"><div class="home-ability-copy"><div class="home-ability-top"><strong>${escapeAttr(m[0])}</strong><span>${support?'EFEITO':m[1]+' PODER'}</span></div><p>${escapeAttr(m[0]==='Esquiva'?m[3].replace(/\s*Custo:\s*1 energia\.?$/i,''):m[3])}</p><small>Custo: ${escapeAttr(labelCost(m,{charged:false}))}</small></div></li>`;
 }).join('');
 return `<aside class="home-details home-details--hero" id="home-details" aria-label="Habilidades de ${escapeAttr(N[i])}">
  <header class="home-details-head"><img class="home-details-portrait" src="${portrait(i)}" alt="${escapeAttr(N[i])}"><div class="home-details-title"><span class="home-details-eyebrow">FICHA DO POKÉMON · 4 HABILIDADES</span><h2>${escapeAttr(N[i])}</h2><span class="home-type">${escapeAttr(T[i])}</span></div><button class="home-details-close" type="button" onclick="homeCloseDetails()" aria-label="Fechar ficha de ${escapeAttr(N[i])}">×</button></header>
  <ul class="home-abilities">${entries}</ul>
  <div class="home-details-footer"><span>${selected?'Este Pokémon já está no seu time.':full?'Time completo: remova um Pokémon para adicionar outro.':'Confira os golpes antes de escolher seu time.'}</span><button type="button" class="home-details-action" onclick="homeAddSelected()" ${full&&!selected?'disabled':''}>${selected?'REMOVER DO TIME':full?'TIME COMPLETO':'＋ ADICIONAR AO TIME'}</button></div>
 </aside>`;
}

 function homeView(){
  const visible=N.map((name,i)=>({name,i})).filter(({name})=>name.toLowerCase().includes(search.toLowerCase()));
  const locked=previews.filter(({name})=>name.toLowerCase().includes(search.toLowerCase()));
  return `<div class="home-screen" style="--home-arena:url('${A.arena_kanto}')"><div class="home-sky"></div><div class="home-container">
  <div class="home-toolbar" aria-label="Barra superior"><div class="home-pill">◷ <span>${utcTime()} UTC</span></div><div class="home-pill event">${ball} 13th Division Day</div><div class="home-pill crown">♛ &nbsp; BATTLEPASS</div><div class="home-pill">☀ / ☾</div><div class="home-pill lang">🇺🇸 EN <span>🇧🇷 BR</span></div><button class="home-iconbtn" aria-label="Filtros" onclick="homeFocusSearch()">⚲</button><button class="home-iconbtn" aria-label="Missões" onclick="homeMissions()">✉</button><button class="home-iconbtn" aria-label="Coleção" onclick="homeMissions()">⬡</button><button class="home-iconbtn" aria-label="Perfil" onclick="homeFocusProfile()">◉</button><button class="home-iconbtn" aria-label="Menu" onclick="homeMenu()">☰</button></div>
  <section class="home-hero" aria-label="Modos de jogo"><div class="home-hero-art"><img class="home-ash" src="${A.trainer_hero}" alt="Treinador Pokémon"><img class="home-pika" src="${portrait(9)}" alt="Pikachu"></div><div class="home-mode-area">${detailsCard(inspected)}<p class="home-kicker">✦ NEW GAME MODE ✦</p><div class="home-modes">${[['SURVIVAL','survival'],['START LADDER GAME','ladder'],['START QUICK GAME','quick'],['START PRIVATE GAME','private']].map(([label,id])=>`<button class="home-modebtn" onclick="homeStart('${id}')">${ball}<span>${label}</span></button>`).join('')}</div></div></section>
  <main class="home-frame" aria-label="Seleção de Pokémon e perfil"><span class="home-frameball tl">${ball}</span><span class="home-frameball tr">${ball}</span><span class="home-frameball bl">${ball}</span><span class="home-frameball br">${ball}</span><div class="home-content"><section class="home-left"><div class="home-roster" aria-label="Pokémon disponíveis">${visible.map(({name,i})=>`<button class="home-poke ${state.picked.includes(i)?'selected':''}" data-drag-pokemon="${i}" draggable="true" ondragstart="nativeDragStart(event,${i})" ondragend="endDrag()" onclick="homeInspect(${i})" aria-label="Ver habilidades de ${name}" aria-expanded="${inspected===i}"><img src="${portrait(i)}" alt="${name}"></button>`).join('')}${locked.map(({name,dex})=>`<div class="home-poke locked" title="${name}: desbloqueio em breve" aria-label="${name}, ainda não disponível"><img loading="lazy" src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${dex}.png" alt="${name}" onerror="this.style.visibility='hidden'"><span class="home-locked-label">${name}</span><span class="home-lock-symbol" aria-hidden="true">◆</span></div>`).join('')}</div><div class="home-roster-controls"><input class="home-search" id="home-search" aria-label="Buscar Pokémon" placeholder="⌕  Search Pokémon..." value="${escapeAttr(search)}" oninput="homeSearch(this.value)"><button class="home-filter" onclick="homeFocusSearch()" aria-label="Filtrar">⚲</button><select class="home-region" aria-label="Região" onchange="homeRegion(this.value)"><option>Kanto</option></select></div></section>
  <section class="home-right" id="home-profile"><div class="home-player" aria-label="Perfil do treinador"><img class="home-player-avatar" src="${A.trainer_hero}" alt="Avatar do treinador"><div class="home-player-info"><strong>LENIXEDUARDO</strong><p>LEVEL: 1 &nbsp;&nbsp; 1 XP</p><p>LADDER: ${state.wins*25}</p><p>RATIO: ${state.wins}-${state.losses}</p></div></div><div class="home-team" aria-label="Três posições de Pokémon">${[0,1,2].map(i=>`<div class="home-slot ${state.picked[i]!==undefined?'filled':''}" data-drop-slot="${i}" ondragover="nativeDragOver(event)" ondragleave="nativeDragLeave(event)" ondrop="nativeDrop(event,${i})" onclick="homeSlotClick(${i})" role="button" tabindex="0" onkeydown="if(event.key==='Enter')homeSlotClick(${i})" aria-label="Posição ${i+1}${state.picked[i]!==undefined?', '+N[state.picked[i]]:''}">${state.picked[i]!==undefined?`<img src="${portrait(state.picked[i])}" alt="${N[state.picked[i]]}"><button class="home-remove" onclick="event.stopPropagation();removeSlot(${i})" aria-label="Remover ${N[state.picked[i]]}">×</button>`:i+1}</div>`).join('')}</div><p class="home-team-title">SELECT 3 POKÉMON INTO YOUR TEAM <span class="home-team-count">${state.picked.length}/3</span></p><div class="home-team-actions"><button onclick="homeMissions()">▤ &nbsp; MISSIONS</button><button onclick="navigate('team')">♟ &nbsp; TEAMS</button></div><p class="home-status" id="home-status" aria-live="polite"></p><p class="home-drag-hint">Toque ou arraste os Pokémon para montar seu time (3/3).</p></section></div></main></div></div>`;
 }

 window.homeInspect=function(i){
  if(!Number.isInteger(i)||i<0||i>=N.length)return;
  inspected=i;
  render();
  if(window.innerWidth<=680){document.getElementById('home-details')?.scrollIntoView({behavior:'smooth',block:'center'});}
 };
 window.homeCloseDetails=function(){inspected=null;render()};
 window.homeAddSelected=function(){
  if(inspected===null)return;
  const old=state.picked.indexOf(inspected);
  if(old>=0)removeSlot(old);
  else if(state.picked.length<3)assignToSlot(inspected,state.picked.length);
  else{const status=document.getElementById('home-status');if(status)status.textContent='Seu time já tem 3 Pokémon.';}
 };
 window.homeSearch=function(v){search=v;const input=document.activeElement;const start=input?.selectionStart??v.length;render();const next=document.getElementById('home-search');next?.focus();next?.setSelectionRange(start,start)};
 window.homeFocusSearch=function(){document.getElementById('home-search')?.focus()};
 window.homeFocusProfile=function(){document.getElementById('home-profile')?.scrollIntoView({behavior:'smooth',block:'center'})};
 window.homeRegion=function(v){};
 window.homeMissions=function(){document.getElementById('home-status').textContent='Missões: em desenvolvimento.'};
 window.homeMenu=function(){document.getElementById('home-status').textContent='Selecione três Pokémon para começar.'};
 window.homeSlotClick=function(i){if(state.picked[i]!==undefined)removeSlot(i);else document.getElementById('home-search')?.focus()};
 window.homeStart=function(selected){mode=selected;if(state.picked.length!==3){const n=document.getElementById('home-status');if(n)n.textContent='Selecione exatamente 3 Pokémon antes de iniciar.';return}prepare();startBattle()};
 render=function(){const isHome=state.view==='home';document.body.classList.toggle('home-mode',isHome);if(isHome){document.getElementById('preview-warning')?.remove();document.getElementById('view').innerHTML=homeView()}else originalRender()};
 state.view='home';render();
})();
