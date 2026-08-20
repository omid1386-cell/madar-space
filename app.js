(() => {
  'use strict';
  const D = window.MADAR_DATA;
  const LD = window.MADAR_LAUNCH_DETAILS || {};
  const OD = window.MADAR_ORBIT_DETAILS || {};
  const L = window.MADAR_LESSONS || {};
  const F = window.MADAR_FAILURE_DETAILS || {};
  const S = window.MADAR_SATELLITES || {types:[],components:[],missionProfiles:{}};
  const K = window.MADAR_KNOWLEDGE || [];
  const KD = window.MADAR_KNOWLEDGE_DOMAINS || {};
  const KL = window.MADAR_KNOWLEDGE_LEVELS || {};
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const fa = new Intl.NumberFormat('fa-IR');
  const fa1 = new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 1 });
  const fa2 = new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 2 });
  const gregorianDate = new Intl.DateTimeFormat('fa-IR-u-ca-gregory', { year:'numeric', month:'short', day:'2-digit', timeZone:'UTC' });
  const englishDate = new Intl.DateTimeFormat('en-US', { year:'numeric', month:'short', day:'2-digit', timeZone:'UTC' });
  const state = {
    completed: new Set(JSON.parse(localStorage.getItem('madar-completed') || '[]')),
    bookmarks: JSON.parse(localStorage.getItem('madar-bookmarks') || '[]'),
    launches: [], launchOffset: 0, launchCount: 0, failures: [], failureOffset: 0,
    currentOrbit: 'leo', currentStage: 0, compare: new Set(), loaded: {},
    lang: localStorage.getItem('madar-lang') || 'fa', satelliteType:'earth-observation', satelliteComponent:'payload', missionProfile:'imaging',
    architectureA:'sentinel2', architectureB:'cubesat6u', sat3dComponent:'payload', sat3dRotateX:-12, sat3dRotateY:28, sat3dZoom:1,
    agencyItems:[], agencyFilter:'all', agencyTimer:null, agencyVisible:8, agencyRenderSignature:'', satSection:'types', translatedViews:new Set(), translationInFlight:false,
    knowledgeDomain:'all', knowledgeLevel:'all', knowledgeQuery:'', activeKnowledge:null, searchIndex:[], searchSupplementalLaunches:[], searchSupplementalAgency:[], searchHistory:JSON.parse(localStorage.getItem('madar-search-history')||'[]')
  };
  const pageMeta = {};
  $$('.view').forEach(v => pageMeta[v.id.replace('view-','')] = { title:v.dataset.title, eyebrow:v.dataset.eyebrow, titleEn:v.dataset.titleEn, eyebrowEn:v.dataset.eyebrowEn });
  const NAV_LABELS = {
    dashboard:['نمای کلی','Overview'], search:['جست‌وجوی یکپارچه','Unified search'], learning:['مسیر یادگیری','Learning path'], knowledge:['کتابخانه دانش','Knowledge library'], anatomy:['کالبدشکافی پرتاب','Launch anatomy'],
    orbits:['اطلس مدارها','Orbit atlas'], satellites:['دانشنامه ماهواره‌ها','Satellite encyclopedia'], agencies:['NASA / ESA زنده','NASA / ESA live'], launches:['بانک پرتاب‌ها','Launch database'],
    failures:['شکست‌ها و درس‌ها','Failures & lessons'], launchers:['دانشنامه پرتابگرها','Launch vehicles'], summarizer:['خلاصه‌ساز ویدئو','Video summarizer'],
    tools:['ابزارهای مهندسی','Engineering tools'], sources:['منابع و روش پژوهش','Sources & methodology']
  };
  const VIEW_EN = {
    dashboard:['Overview','Mission control'], search:['Unified Search','Direct Knowledge Access'], learning:['Learning Path','Space Engineering Academy'], knowledge:['Knowledge Library','Foundation to Advanced Knowledge'], anatomy:['Launch Anatomy','Ascent Laboratory'],
    orbits:['Orbit Atlas','Orbital Mechanics'], satellites:['Satellite Encyclopedia','Spacecraft & Missions'], agencies:['NASA / ESA Live','Agency Update Center'], launches:['Launch Database','Global Observatory'],
    failures:['Failures & Lessons','Reliability Laboratory'], launchers:['Launch Vehicle Encyclopedia','Launch Systems'], summarizer:['Video Summarizer','Rapid Study Lab'],
    tools:['Engineering Tools','Computation Lab'], sources:['Sources & Methodology','Provenance & Citations']
  };
  const bi = value => typeof value === 'object' && value ? (value[state.lang] ?? value.fa ?? value.en ?? '') : String(value ?? '');

  function restorePersianTranslations(root=document){
    $$('[data-auto-fa]',root).forEach(el=>{el.textContent=el.dataset.autoFa;delete el.dataset.autoEn;});
  }
  function restoreEnglishLabels(root=document){
    $$('[data-auto-en-original]',root).forEach(el=>{el.textContent=el.dataset.autoEnOriginal;delete el.dataset.autoFaLabel;});
  }
  async function translateEnglishLabelsToPersian(root=$('.view.active')){
    if(state.lang!=='fa'||!root)return;
    const elements=$$('.section-kicker,.reader-kicker,.modal-kicker',root).filter(el=>!el.closest('[data-no-auto-translate]')&&!el.dataset.autoFaLabel&&/[A-Za-z]{3}/.test(el.textContent)&&!/[\u0600-\u06ff]/.test(el.textContent));
    if(!elements.length)return;
    const texts=elements.map(el=>{el.dataset.autoEnOriginal=el.textContent;return el.textContent.trim()});
    try{const result=await api('/api/translate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({texts,target:'fa',source:'en'})});elements.forEach((el,i)=>{el.dataset.autoFaLabel=result.translations[i];el.textContent=result.translations[i]});}catch{}
  }
  async function translateVisibleView(root=$('.view.active')){
    if(state.lang!=='en'||!root)return;
    const selectors='p,span,small,strong,h1,h2,h3,h4,button,label,blockquote,li,td,th,figcaption';
    const elements=$$(selectors,root).filter(el=>el.childElementCount===0&&!el.closest('[data-no-auto-translate]')&&!el.hasAttribute('data-bi-fa')&&!el.dataset.autoEn&&/[\u0600-\u06ff]/.test(el.textContent)&&el.textContent.trim().length>2&&el.textContent.trim().length<900);
    if(!elements.length)return;
    const texts=elements.map(el=>{el.dataset.autoFa=el.textContent;return el.textContent.trim()});
    try{
      const result=await api('/api/translate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({texts,target:'en',source:'fa'})});
      elements.forEach((el,i)=>{el.dataset.autoEn=result.translations[i];el.textContent=result.translations[i]});
    }catch(err){toast('Automatic translation is temporarily unavailable','error',err.message);}
  }
  async function translateViewOnce(root,key){
    if(state.lang!=='en'||!root||state.translatedViews.has(key)||state.translationInFlight)return;
    state.translatedViews.add(key);state.translationInFlight=true;
    try{await translateVisibleView(root)}finally{state.translationInFlight=false}
  }
  function applyLanguage(lang,translate=true){
    const nextLang=lang==='en'?'en':'fa';
    if(nextLang==='en')restoreEnglishLabels();else{restorePersianTranslations();state.translatedViews.clear()}
    state.lang=nextLang;localStorage.setItem('madar-lang',state.lang);
    document.documentElement.lang=state.lang;document.documentElement.dir=state.lang==='fa'?'rtl':'ltr';
    document.body.classList.toggle('lang-en',state.lang==='en');document.body.classList.toggle('lang-fa',state.lang==='fa');
    $$('[data-lang]').forEach(b=>b.classList.toggle('active',b.dataset.lang===state.lang));
    $$('.nav-item[data-view]').forEach(n=>{const label=$('span',n),pair=NAV_LABELS[n.dataset.view];if(label&&pair)label.textContent=pair[state.lang==='fa'?0:1]});
    const captions=$$('.nav-caption');if(captions[0])captions[0].textContent=state.lang==='fa'?'یادگیری':'LEARNING';if(captions[1])captions[1].textContent=state.lang==='fa'?'رصدخانه':'OBSERVATORY';if(captions[2])captions[2].textContent=state.lang==='fa'?'آزمایشگاه':'LABORATORY';
    $$('[data-bi-fa]').forEach(el=>el.textContent=el.dataset[state.lang==='fa'?'biFa':'biEn']||el.textContent);
    $('#globalSearch').placeholder=state.lang==='fa'?'جست‌وجوی مفهوم، مأموریت یا پرتابگر…':'Search a concept, mission or launch vehicle…';
    $('#installAppBtn span').textContent=state.lang==='fa'?'نصب مدار':'Install Madar';
    if(state.lang==='fa')restorePersianTranslations();
    const active=$('.view.active')?.id.replace('view-','')||'dashboard',meta=VIEW_EN[active];
    $('#pageTitle').textContent=state.lang==='fa'?(pageMeta[active]?.title||''):(meta?.[0]||pageMeta[active]?.titleEn||'');
    $('#pageEyebrow').textContent=state.lang==='fa'?(pageMeta[active]?.eyebrow||''):(meta?.[1]||pageMeta[active]?.eyebrowEn||'');
    if(state.dashboardLaunches)renderDashboardLaunches(state.dashboardLaunches);
    if(state.launches.length)renderLaunchTable();if(state.failures.length)renderLiveFailures();if(state.agencyItems.length)renderAgencyFeed();
    renderSatelliteEncyclopedia();
    if($('#lessonReader').classList.contains('open'))renderReader();
    if(translate&&state.lang==='en')setTimeout(()=>{translateViewOnce($('.view.active'),`view:${active}`);if($('#lessonReader').classList.contains('open'))translateViewOnce($('#readerContent'),`reader:${state.readerModule}:${state.readerChapter}`)},40);
  }

  function esc(value) {
    return String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  }
  function fmtNum(value) { return Number.isFinite(+value) ? fa.format(+value) : '—'; }
  function fmtDate(iso, withTime=false) {
    if (!iso) return state.lang==='fa'?'زمان نامشخص':'Unknown time';
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return esc(iso);
    const base = (state.lang==='fa'?gregorianDate:englishDate).format(date);
    return withTime ? `${base} · ${String(date.getUTCHours()).padStart(2,'0')}:${String(date.getUTCMinutes()).padStart(2,'0')} UTC` : base;
  }
  function mmss(seconds) {
    seconds = Math.max(0, Math.round(seconds || 0));
    return `${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;
  }
  function proxiedImage(url){ return url ? `/api/image?url=${encodeURIComponent(url)}` : ''; }
  function toast(message, type='', detail='') {
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `<strong>${esc(message)}</strong>${detail ? `<small>${esc(detail)}</small>`:''}`;
    $('#toastStack').append(el);
    setTimeout(() => el.remove(), 4200);
  }
  async function api(url, options={}) {
    const response = await fetch(url, options);
    let data;
    try { data = await response.json(); } catch { data = {}; }
    if (!response.ok) throw new Error(data.error || data.detail || `HTTP ${response.status}`);
    return data;
  }
  function icon(id) { return `<svg><use href="#${id}"/></svg>`; }

  // Navigation
  function navigate(view, opts={}) {
    const target = $(`#view-${view}`);
    if (!target) return;
    $$('.view').forEach(v => v.classList.toggle('active', v === target));
    $$('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.view === view));
    const enMeta=VIEW_EN[view];
    $('#pageTitle').textContent = state.lang==='fa'?(pageMeta[view]?.title||''):(enMeta?.[0]||pageMeta[view]?.titleEn||'');
    $('#pageEyebrow').textContent = state.lang==='fa'?(pageMeta[view]?.eyebrow||''):(enMeta?.[1]||pageMeta[view]?.eyebrowEn||'');
    document.title = state.lang==='fa'?`${pageMeta[view]?.title || 'مدار'} — مدار`:`${enMeta?.[0]||'Madar'} — Madar`;
    closeSidebar();
    window.scrollTo({top:0, behavior:'smooth'});
    if (view === 'search' && !state.searchFallbackLoaded)ensureSearchSupplemental();
    if (view === 'anatomy' && !state.preloadedStages){state.preloadedStages=true;preloadStageMedia()}
    if (view === 'agencies' && !state.loaded.agencies) loadAgencyFeed(false);
    if (view === 'launches' && !state.loaded.launches) loadLaunches(true);
    if (view === 'failures' && !state.loaded.failures) loadLiveFailures(true);
    if (view === 'orbits' && !state.loaded.satellites) loadSatellites();
    if (view === 'tools' && opts.tool) activateTool(opts.tool);
    if(state.lang==='en')setTimeout(()=>translateViewOnce(target,`view:${view}`),50);
    history.replaceState(null, '', `#${view}`);
  }
  $$('[data-view]').forEach(el => el.addEventListener('click', e => {
    if (el.tagName === 'A') return;
    navigate(el.dataset.view, {tool: el.dataset.toolTab});
  }));
  $$('[data-lang]').forEach(btn=>btn.addEventListener('click',()=>applyLanguage(btn.dataset.lang)));
  function closeSidebar(){ $('#sidebar').classList.remove('open'); $('#sidebarScrim').classList.remove('open'); }
  $('#menuBtn').addEventListener('click', () => { $('#sidebar').classList.toggle('open'); $('#sidebarScrim').classList.toggle('open'); });
  $('#sidebarScrim').addEventListener('click', closeSidebar);

  // Modal
  function openModal(html) {
    $('#modalContent').innerHTML = html;
    $('#detailModal').classList.add('open');
    $('#detailModal').setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
    if(state.lang==='en')setTimeout(()=>translateViewOnce($('#modalContent'),`modal:${Date.now()}`),30);
  }
  function closeModal() {
    $('#detailModal').classList.remove('open');
    $('#detailModal').setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
  }
  $$('[data-close-modal]').forEach(el => el.addEventListener('click', closeModal));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeModal(); if ($('#lessonReader').classList.contains('open')) closeReader(); if($('#knowledgeReader').classList.contains('open'))closeKnowledgeReader(); }
    if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') { e.preventDefault(); ($('.view.active')?.id==='view-search'?$('#unifiedSearchInput'):$('#globalSearch')).focus(); }
  });

  // Three-level knowledge library
  function normalizeSearchText(value){return String(value||'').toLowerCase().normalize('NFKD').replace(/[\u064b-\u065f\u0670]/g,'').replace(/ي/g,'ی').replace(/ك/g,'ک').replace(/[ۀة]/g,'ه').replace(/‌/g,' ').replace(/[^a-z0-9\u0600-\u06ff+∞]+/g,' ').replace(/\s+/g,' ').trim()}
  function domainLabel(id){return KD[id]?.[state.lang]||KD[id]?.fa||id}
  function levelLabel(id){return KL[id]?.[state.lang]||KL[id]?.fa||id}
  function renderKnowledgeLibrary(){
    if(!K.length)return;
    $('#knowledgeDomainGrid').innerHTML=Object.entries(KD).map(([id,d])=>`<button class="knowledge-domain-card ${state.knowledgeDomain===id?'active':''}" data-k-domain="${id}" style="--domain-color:${d.color}"><span>${fa.format(K.filter(x=>x.domain===id).length)}</span><strong>${esc(d.fa)}</strong><small>${esc(d.en)}</small><i></i></button>`).join('');
    $$('[data-k-domain]').forEach(btn=>btn.addEventListener('click',()=>{state.knowledgeDomain=state.knowledgeDomain===btn.dataset.kDomain?'all':btn.dataset.kDomain;$('#knowledgeDomainFilter').value=state.knowledgeDomain;renderKnowledgeLibrary()}));
    $('#knowledgeCoverageMatrix').innerHTML=`<div class="coverage-head"><strong>نقشه پوشش</strong><span>هر خانه شامل ۵ موضوع کامل است.</span></div><div class="coverage-table"><div></div><b>مقدماتی</b><b>دانشگاهی</b><b class="advanced">معلومات پیشرفته</b>${Object.keys(KD).map(domain=>`<strong>${esc(KD[domain].fa)}</strong>${['foundation','university','advanced'].map(level=>`<button data-matrix-domain="${domain}" data-matrix-level="${level}" class="${level}"><span>${fa.format(K.filter(x=>x.domain===domain&&x.level===level).length)}</span><small>موضوع</small></button>`).join('')}`).join('')}</div>`;
    $$('[data-matrix-domain]').forEach(btn=>btn.addEventListener('click',()=>{state.knowledgeDomain=btn.dataset.matrixDomain;state.knowledgeLevel=btn.dataset.matrixLevel;$('#knowledgeDomainFilter').value=state.knowledgeDomain;$('#knowledgeLevelFilter').value=state.knowledgeLevel;renderKnowledgeLibrary();document.querySelector('#knowledgeTopicGrid').scrollIntoView({behavior:'smooth',block:'start'})}));
    const q=normalizeSearchText($('#knowledgeFilterInput').value),items=K.filter(x=>(state.knowledgeDomain==='all'||x.domain===state.knowledgeDomain)&&(state.knowledgeLevel==='all'||x.level===state.knowledgeLevel)&&(!q||normalizeSearchText([x.title.fa,x.title.en,x.summary,x.prereq,x.body.join(' '),x.keywords.join(' ')].join(' ')).includes(q)));
    $('#knowledgeTopicCount').textContent=`${fa.format(items.length)} موضوع`;$('#knowledgeGridTitle').textContent=state.knowledgeDomain==='all'?'تمام موضوعات':KD[state.knowledgeDomain].fa;
    $('#knowledgeTopicGrid').innerHTML=items.map(x=>`<article class="knowledge-topic-card ${x.level}" style="--domain-color:${KD[x.domain].color}"><div class="knowledge-card-top"><span>${esc(KD[x.domain].fa)}</span><b>${esc(KL[x.level].fa)}</b></div><h3>${esc(x.title.fa)}</h3><em>${esc(x.title.en)}</em><p>${esc(x.summary)}</p><div class="knowledge-prereq"><small>پیش‌نیاز</small><strong>${esc(x.prereq)}</strong></div><div class="knowledge-keywords">${x.keywords.slice(0,4).map(k=>`<span>${esc(k)}</span>`).join('')}</div><button data-open-knowledge="${x.id}">مطالعه موضوع ${icon('i-arrow')}</button></article>`).join('')||'<div class="table-empty">موضوعی با این فیلتر پیدا نشد.</div>';
    $$('[data-open-knowledge]').forEach(btn=>btn.addEventListener('click',()=>openKnowledgeArticle(btn.dataset.openKnowledge)));
  }
  function openKnowledgeArticle(id){
    const item=K.find(x=>x.id===id);if(!item)return;state.activeKnowledge=id;const domain=KD[item.domain],level=KL[item.level];$('#knowledgeReader').classList.add('open');$('#knowledgeReader').setAttribute('aria-hidden','false');document.body.style.overflow='hidden';$('#knowledgeReaderDomain').textContent=domain.fa;$('#knowledgeReaderTitle').textContent=item.title.fa;$('#knowledgeReaderLevel').textContent=level.fa;$('#knowledgeReaderLevel').className=`knowledge-reader-level ${item.level}`;
    const sources=(window.MADAR_KNOWLEDGE_SOURCES||[]).filter(s=>s.domain===item.domain);
    $('#knowledgeReaderMain').innerHTML=`<article class="knowledge-article"><span class="knowledge-article-code">${esc(item.id.toUpperCase())} · ${esc(domain.en)}</span><h1>${esc(item.title.fa)}</h1><div class="knowledge-article-en">${esc(item.title.en)}</div><p class="knowledge-article-lead">${esc(item.summary)}</p><div class="knowledge-article-meta"><span><b>سطح</b>${esc(level.fa)}</span><span><b>پیش‌نیاز</b>${esc(item.prereq)}</span><span><b>حوزه</b>${esc(domain.fa)}</span></div><section class="knowledge-body">${item.body.map((p,i)=>`<div><b>${fa.format(i+1)}</b><p>${esc(p)}</p></div>`).join('')}</section>${item.equations.length?`<section class="knowledge-equations"><span>روابط و مدل‌ها</span>${item.equations.map(e=>`<code>${esc(e)}</code>`).join('')}<small>فرض‌ها، Frame، واحد و محدوده اعتبار رابطه باید پیش از استفاده بررسی شوند.</small></section>`:''}${item.example?`<section class="knowledge-example"><span>مثال و تفسیر مهندسی</span><p>${esc(item.example)}</p></section>`:''}<section class="knowledge-concepts"><h2>واژه‌ها و مفاهیم قابل جست‌وجو</h2><div>${item.keywords.map(k=>`<span>${esc(k)}</span>`).join('')}</div></section>${sources.length?`<section class="knowledge-sources"><h2>مسیر مطالعه معتبر</h2>${sources.map(s=>`<a href="${esc(s.url)}" target="_blank" rel="noreferrer">${esc(s.name)} ${icon('i-external')}</a>`).join('')}</section>`:''}</article>`;
    const related=K.filter(x=>x.domain===item.domain&&x.id!==item.id).sort((a,b)=>(a.level===item.level?-1:1)).slice(0,6);$('#relatedKnowledgeTopics').innerHTML=related.map(x=>`<button data-related-knowledge="${x.id}"><span>${esc(KL[x.level].fa)}</span><strong>${esc(x.title.fa)}</strong></button>`).join('');$$('[data-related-knowledge]').forEach(btn=>btn.addEventListener('click',()=>openKnowledgeArticle(btn.dataset.relatedKnowledge)));
    if(state.lang==='en')setTimeout(()=>translateViewOnce($('#knowledgeReaderMain'),`knowledge:${id}`),40);
  }
  function closeKnowledgeReader(){ $('#knowledgeReader').classList.remove('open');$('#knowledgeReader').setAttribute('aria-hidden','true');document.body.style.overflow=''; }
  $('#closeKnowledgeReader').addEventListener('click',closeKnowledgeReader);
  $$('[data-knowledge-level]').forEach(card=>card.addEventListener('click',()=>{state.knowledgeLevel=state.knowledgeLevel===card.dataset.knowledgeLevel?'all':card.dataset.knowledgeLevel;$('#knowledgeLevelFilter').value=state.knowledgeLevel;renderKnowledgeLibrary()}));
  let knowledgeFilterTimer=0;$('#knowledgeFilterInput').addEventListener('input',()=>{clearTimeout(knowledgeFilterTimer);knowledgeFilterTimer=setTimeout(renderKnowledgeLibrary,120)});$('#knowledgeDomainFilter').addEventListener('change',e=>{state.knowledgeDomain=e.target.value;renderKnowledgeLibrary()});$('#knowledgeLevelFilter').addEventListener('change',e=>{state.knowledgeLevel=e.target.value;renderKnowledgeLibrary()});

  // Unified search
  async function ensureSearchSupplemental(){
    state.searchFallbackLoaded=true;
    try{const [launchRes,agencyRes]=await Promise.all([fetch('launches-fallback.json'),fetch('agency-feed-fallback.json')]);if(launchRes.ok)state.searchSupplementalLaunches=(await launchRes.json()).results||[];if(agencyRes.ok)state.searchSupplementalAgency=(await agencyRes.json()).items||[];buildSearchIndex();if($('#unifiedSearchInput').value.trim())performUnifiedSearch(false)}catch{}
  }
  function buildSearchIndex(){
    const index=[];const add=(entry)=>index.push({...entry,norm:normalizeSearchText([entry.title,entry.titleEn,entry.text,entry.keywords,KD[entry.domain]?.fa,KD[entry.domain]?.en,KL[entry.level]?.fa,KL[entry.level]?.en,searchKindLabel(entry.kind)].join(' '))});
    K.forEach(x=>add({kind:'knowledge',id:x.id,domain:x.domain,level:x.level,title:x.title.fa,titleEn:x.title.en,text:x.summary,keywords:x.keywords.join(' '),page:'knowledge'}));
    D.learningModules.forEach(m=>add({kind:'learning',id:m.id,domain:m.id==='orbits'?'orbital':m.id==='gnc'?'control':m.id==='spacecraft'||m.id==='systems'?'design':'all',level:m.level==='پیشرفته'?'advanced':'university',title:m.title,titleEn:m.en,text:m.desc,keywords:m.outcomes.join(' '),page:'learning'}));
    D.launchStages.forEach(s=>add({kind:'stage',id:String(s.id),domain:'launchers',level:'foundation',title:s.title,titleEn:s.en,text:[s.summary,s.physics,s.risk,s.telemetry].join(' '),keywords:s.events.join(' '),page:'anatomy'}));
    D.orbits.forEach(o=>add({kind:'orbit',id:o.id,domain:'orbital',level:'foundation',title:o.name,titleEn:o.en,text:[o.range,o.period,o.examples,...o.uses,...o.pros,...o.cons,OD[o.id]?.definition||''].join(' '),keywords:o.id,page:'orbits'}));
    S.types?.forEach(x=>add({kind:'satellite',id:x.id,domain:'design',level:'foundation',title:x.title.fa,titleEn:x.title.en,text:x.description.fa,keywords:[...x.uses.fa,x.payload.fa,x.orbit.primary].join(' '),page:'satellites'}));
    S.components?.forEach(x=>add({kind:'component',id:x.id,domain:'design',level:'university',title:x.title.fa,titleEn:x.title.en,text:x.fa,keywords:x.variation.fa,page:'satellites'}));
    D.launchers.forEach(x=>add({kind:'launcher',id:x.id,domain:'launchers',level:'university',title:x.name,titleEn:x.maker,text:x.note,keywords:[x.prop,x.engines,x.leo,x.gto].join(' '),page:'launchers'}));
    D.curatedFailures.forEach(x=>add({kind:'failure',id:x.title,domain:'missions',level:'advanced',title:x.title,titleEn:x.kind,text:[x.cause,x.lesson,F[x.title]?.root||''].join(' '),keywords:x.phase,page:'failures'}));
    [...new Map([...(state.dashboardLaunches||[]),...state.launches,...state.searchSupplementalLaunches].map(x=>[x.id,x])).values()].forEach(x=>add({kind:'launch',id:x.id,domain:'missions',level:'',title:x.name_fa||x.name,titleEn:x.name,text:[x.description,x.rocket,x.provider,x.orbit].join(' '),keywords:x.mission_type,page:'launches',object:x}));
    [...new Map([...state.agencyItems,...state.searchSupplementalAgency].map(x=>[x.id,x])).values()].forEach(x=>add({kind:'agency',id:x.id,domain:'missions',level:'',title:x.title_fa||x.title,titleEn:x.title,text:[x.summary_fa,x.summary,x.category].join(' '),keywords:x.agency,page:'agencies',object:x}));
    state.searchIndex=index;$('#searchIndexCount').textContent=fa.format(index.length);return index;
  }
  function searchKindLabel(kind){return({knowledge:'کتابخانه دانش',learning:'مسیر یادگیری',stage:'مرحله پرتاب',orbit:'مدار',satellite:'نوع ماهواره',component:'جزء ماهواره',launcher:'پرتابگر',failure:'پرونده شکست',launch:'پرتاب زنده',agency:'NASA / ESA'}[kind]||kind)}
  function performUnifiedSearch(recordHistory=false){
    const raw=$('#unifiedSearchInput').value.trim(),q=normalizeSearchText(raw),domain=$('#searchDomainFilter').value,level=$('#searchLevelFilter').value,index=buildSearchIndex();$('#clearUnifiedSearch').hidden=!raw;
    if(recordHistory&&raw){state.searchHistory=[raw,...state.searchHistory.filter(x=>normalizeSearchText(x)!==q)].slice(0,8);localStorage.setItem('madar-search-history',JSON.stringify(state.searchHistory));renderSearchHistory()}
    if(!q){$('#searchResultCount').textContent='برای آغاز، عبارتی بنویسید.';$('#searchResults').innerHTML='<div class="search-welcome"><div class="search-radar"><i></i><i></i><span></span></div><h2>نام، اصطلاح یا عنوان موردنظر را جست‌وجو کنید</h2><p>جست‌وجو به حروف فارسی/عربی، فاصله و نیم‌فاصله حساس نیست و اصطلاحات انگلیسی را نیز می‌پذیرد.</p></div>';return}
    const tokens=q.split(' ');const results=index.filter(x=>(domain==='all'||x.domain===domain)&&(level==='all'||x.level===level)).map(x=>{let score=0,title=normalizeSearchText(x.title+' '+x.titleEn);if(title===q)score+=100;if(title.startsWith(q))score+=55;if(title.includes(q))score+=35;if(x.norm.includes(q))score+=22;tokens.forEach(t=>{if(title.includes(t))score+=12;else if(x.norm.includes(t))score+=4});return{x,score}}).filter(r=>r.score>0&&tokens.every(t=>r.x.norm.includes(t)||normalizeSearchText(r.x.title+' '+r.x.titleEn).includes(t))).sort((a,b)=>b.score-a.score).slice(0,50).map(r=>r.x);state.currentSearchResults=results;
    $('#searchResultCount').textContent=`${fa.format(results.length)} نتیجه برای «${esc(raw)}»`;$('#searchResults').innerHTML=results.map((x,i)=>`<article class="unified-result-card"><div class="result-kind-icon">${icon(x.kind==='orbit'?'i-orbit':x.kind==='launcher'||x.kind==='stage'?'i-rocket':x.kind==='satellite'||x.kind==='component'?'i-satellite':x.kind==='failure'?'i-alert':'i-learn')}</div><div><span>${esc(searchKindLabel(x.kind))}${x.level?` · ${esc(KL[x.level]?.fa||x.level)}`:''}</span><h3>${esc(x.title)}</h3><em>${esc(x.titleEn||'')}</em><p>${esc(String(x.text||'').slice(0,260))}${String(x.text||'').length>260?'…':''}</p></div><button data-search-result="${i}">${state.lang==='fa'?'بازکردن':'Open'} ${icon('i-arrow')}</button></article>`).join('')||'<div class="table-empty">نتیجه‌ای پیدا نشد. املای دیگر یا فیلتر گسترده‌تر را امتحان کنید.</div>';$$('[data-search-result]').forEach(btn=>btn.addEventListener('click',()=>dispatchSearchResult(state.currentSearchResults[+btn.dataset.searchResult])));
  }
  function dispatchSearchResult(x){if(!x)return;if(x.kind==='knowledge'){openKnowledgeArticle(x.id);return}if(x.kind==='learning'){navigate('learning');setTimeout(()=>openModule(x.id),120);return}if(x.kind==='stage'){state.currentStage=+x.id;navigate('anatomy');renderStageRail();return}if(x.kind==='orbit'){state.currentOrbit=x.id;navigate('orbits');renderOrbitTabs();renderOrbitDetail();return}if(x.kind==='satellite'){state.satelliteType=x.id;state.satSection='types';navigate('satellites');$$('[data-sat-section]').forEach(b=>b.classList.toggle('active',b.dataset.satSection==='types'));$$('.satellite-subview').forEach(s=>s.classList.toggle('active',s.id==='sat-section-types'));renderSatelliteEncyclopedia();return}if(x.kind==='component'){state.satelliteComponent=x.id;state.satSection='anatomy';navigate('satellites');$$('[data-sat-section]').forEach(b=>b.classList.toggle('active',b.dataset.satSection==='anatomy'));$$('.satellite-subview').forEach(s=>s.classList.toggle('active',s.id==='sat-section-anatomy'));renderSatelliteEncyclopedia();return}if(x.kind==='launcher'){navigate('launchers');setTimeout(()=>openLauncher(x.id),100);return}if(x.kind==='failure'){navigate('failures');setTimeout(()=>openFailureCase(x.id),100);return}if(x.kind==='launch'){openLaunch(x.object);return}if(x.kind==='agency'){window.open(x.object.url,'_blank','noopener');return}navigate(x.page)}
  function renderSearchHistory(){const box=$('#recentSearches');box.innerHTML=state.searchHistory.length?state.searchHistory.map(q=>`<button data-recent-search="${esc(q)}">${icon('i-history')}<span>${esc(q)}</span></button>`).join(''):'<p>هنوز جست‌وجویی ثبت نشده است.</p>';$$('[data-recent-search]').forEach(btn=>btn.addEventListener('click',()=>{$('#unifiedSearchInput').value=btn.dataset.recentSearch;performUnifiedSearch()}))}
  let unifiedSearchTimer=0;$('#unifiedSearchInput').addEventListener('input',()=>{clearTimeout(unifiedSearchTimer);unifiedSearchTimer=setTimeout(()=>performUnifiedSearch(false),120)});$('#unifiedSearchInput').addEventListener('keydown',e=>{if(e.key==='Enter')performUnifiedSearch(true)});$('#searchDomainFilter').addEventListener('change',()=>performUnifiedSearch(false));$('#searchLevelFilter').addEventListener('change',()=>performUnifiedSearch(false));$('#clearUnifiedSearch').addEventListener('click',()=>{$('#unifiedSearchInput').value='';performUnifiedSearch();$('#unifiedSearchInput').focus()});$$('[data-search-query]').forEach(btn=>btn.addEventListener('click',()=>{$('#unifiedSearchInput').value=btn.dataset.searchQuery;performUnifiedSearch(true)}));$('#clearSearchHistory').addEventListener('click',()=>{state.searchHistory=[];localStorage.removeItem('madar-search-history');renderSearchHistory()});

  // Progress & learning
  function progressUpdate() {
    const count = state.completed.size;
    const pct = Math.round(count / D.learningModules.length * 100);
    $('#overallProgress').textContent = `${fa.format(pct)}٪`;
    $('#overallProgressBar').style.width = `${pct}%`;
    $('#completedModules').textContent = `${fa.format(count)} از ${fa.format(D.learningModules.length)}`;
    $('#pathPercent').textContent = `${fa.format(pct)}٪`;
    $('#pathBar').style.width = `${pct}%`;
    $('#pathCompleted').textContent = count ? `${fa.format(count)} ماژول از ${fa.format(D.learningModules.length)} تکمیل شده` : 'هنوز ماژولی تکمیل نشده';
    localStorage.setItem('madar-completed', JSON.stringify([...state.completed]));
  }
  function renderLearning(level='all') {
    $('#learningMap').innerHTML = D.learningModules.map(m => {
      const done = state.completed.has(m.id), hidden = level !== 'all' && m.level !== level;
      const course = L[m.id];
      return `<article class="module-card ${done?'completed':''} ${hidden?'hidden-card':''}" data-module="${m.id}">
        <div class="module-cover">${course?.cover?`<img src="${esc(course.cover)}" alt="تصویر فنی ${esc(m.title)}" loading="lazy">`:''}<span>${esc(m.en)}</span></div>
        <div class="module-top"><div class="module-icon">${esc(m.icon)}</div><span class="module-n">${esc(m.n)}</span><button class="complete-check" data-complete="${m.id}" title="${done?'برداشتن علامت تکمیل':'علامت‌گذاری به‌عنوان تکمیل'}">${icon('i-check')}</button></div>
        <span class="module-level">${esc(m.level)} · ${esc(m.time)}</span><h3>${esc(m.title)}</h3><span class="module-en">${esc(m.en)}</span><p>${esc(course?.summary || m.desc)}</p>
        <div class="module-meta"><span><i></i>${fa.format(course?.chapters?.length || m.lessons)} فصل اصلی</span><span><i></i>${esc(m.time)}</span></div>
        <div class="module-action"><small>پیش‌نیاز: ${esc(m.prereq)}</small><button data-open-module="${m.id}">شروع درس‌نامه ${icon('i-arrow')}</button></div>
      </article>`;
    }).join('');
    $$('[data-complete]', $('#learningMap')).forEach(btn => btn.addEventListener('click', e => {
      e.stopPropagation(); const id = btn.dataset.complete;
      state.completed.has(id) ? state.completed.delete(id) : state.completed.add(id);
      renderLearning(level); progressUpdate(); toast(state.completed.has(id) ? 'ماژول تکمیل شد' : 'علامت تکمیل برداشته شد');
    }));
    $$('[data-open-module]', $('#learningMap')).forEach(btn => btn.addEventListener('click', () => openModule(btn.dataset.openModule)));
  }
  const glossary = {
    'Mission':'مأموریت','Architecture':'معماری','Requirement':'نیازمندی','Payload':'محموله','Bus':'باس ماهواره',
    'Orbit':'مدار','Ascent':'صعود','Insertion':'تزریق','Thrust':'رانش','Nozzle':'نازل','Staging':'مرحله‌بندی',
    'Guidance':'هدایت','Navigation':'ناوبری','Control':'کنترل','State':'حالت','Frame':'دستگاه مختصات',
    'Telemetry':'تله‌متری','Command':'فرمان','Link':'پیوند مخابراتی','Budget':'بودجه','Margin':'حاشیه',
    'Verification':'راستی‌آزمایی','Validation':'اعتبارسنجی','Risk':'ریسک','Failure':'شکست','Evidence':'شواهد',
    'Operations':'عملیات','Thermal':'حرارتی','Radiation':'تابش','Coverage':'پوشش','Revisit':'بازدید مجدد'
  };
  function openModule(id) {
    const m = D.learningModules.find(x => x.id === id), course = L[id];
    if (!m || !course) { toast('محتوای این ماژول هنوز آماده نیست','error'); return; }
    state.readerModule = id; state.readerChapter = -1;
    $('#lessonReader').classList.add('open'); $('#lessonReader').setAttribute('aria-hidden','false'); document.body.style.overflow='hidden';
    renderReader();
  }
  function closeReader(){ $('#lessonReader').classList.remove('open'); $('#lessonReader').setAttribute('aria-hidden','true'); document.body.style.overflow=''; }
  function chapterVisual(id,index,course){
    if(id==='ascent') return `images/stages/stage-${[0,2,3,6,8][index] ?? 6}.svg`;
    if(id==='operations') return `images/stages/stage-${[9,9,8,9,7][index] ?? 9}.svg`;
    if(id==='propulsion') return `images/stages/stage-${[1,6,4,7,4][index] ?? 4}.svg`;
    return course.cover;
  }
  function setReaderChapter(index){ state.readerChapter=index; renderReader(); $('#readerContent').scrollTop=0; }
  function renderReader(){
    const id=state.readerModule,m=D.learningModules.find(x=>x.id===id),course=L[id]; if(!m||!course)return;
    const max=course.chapters.length, idx=state.readerChapter, pct=Math.round((idx+1)/(max+1)*100);
    $('#readerModuleTitle').textContent=`${m.n} · ${m.title}`; $('#readerProgressText').textContent=idx<0?'نمای کلی':idx===max?'آزمون پایان ماژول':`فصل ${fa.format(idx+1)} از ${fa.format(max)}`; $('#readerProgressBar').style.width=`${Math.max(5,pct)}%`;
    $('#markModuleDone').textContent=state.completed.has(id)?'تکمیل شده ✓':'علامت‌گذاری تکمیل';
    $('#readerChapters').innerHTML=`<div class="reader-course-id"><span>MODULE ${esc(m.n)}</span><strong>${esc(m.title)}</strong><small>${esc(m.en)}</small></div><button class="reader-chapter ${idx===-1?'active':''}" data-reader-index="-1"><b>00</b><span>نمای کلی ماژول<small>هدف و نقشه مطالعه</small></span></button>${course.chapters.map((c,i)=>`<button class="reader-chapter ${idx===i?'active':''}" data-reader-index="${i}"><b>${String(i+1).padStart(2,'0')}</b><span>${esc(c.title)}<small>${esc(c.en)} · ${fa.format(c.minutes)} دقیقه</small></span></button>`).join('')}<button class="reader-chapter quiz-link ${idx===max?'active':''}" data-reader-index="${max}"><b>✓</b><span>آزمون پایان ماژول<small>${fa.format(course.quiz.length)} پرسش مفهومی</small></span></button>`;
    $$('[data-reader-index]',$('#readerChapters')).forEach(b=>b.addEventListener('click',()=>setReaderChapter(+b.dataset.readerIndex)));
    if(idx<0) renderReaderOverview(m,course); else if(idx===max) renderReaderQuiz(m,course); else renderReaderChapter(m,course,idx);
    if(state.lang==='en')setTimeout(()=>translateViewOnce($('#readerContent'),`reader:${id}:${idx}`),40);
  }
  function renderReaderOverview(m,course){
    $('#readerContent').innerHTML=`<article class="reader-article"><figure class="reader-hero-image"><img src="${esc(course.cover)}" alt="نمودار ${esc(m.title)}"><figcaption>تصویر فنی تولیدشده برای درس‌نامه مدار · نه به مقیاس</figcaption></figure><span class="reader-kicker">MODULE OVERVIEW · ${esc(m.level)}</span><h1>${esc(m.title)}</h1><p class="reader-lead">${esc(course.summary)}</p><div class="reader-meta"><span>${fa.format(course.chapters.length)} فصل اصلی</span><span>${esc(m.time)} مطالعه پیشنهادی</span><span>پیش‌نیاز: ${esc(m.prereq)}</span></div><section class="reader-section"><h2>در پایان چه خواهید آموخت؟</h2><div class="objective-grid">${course.objectives.map((x,i)=>`<div><b>${fa.format(i+1)}</b><span>${esc(x)}</span></div>`).join('')}</div></section><section class="reader-section"><h2>نقشه درس</h2><div class="syllabus-list">${course.chapters.map((c,i)=>`<button data-overview-chapter="${i}"><b>${String(i+1).padStart(2,'0')}</b><div><strong>${esc(c.title)}</strong><small>${esc(c.lead)}</small></div>${icon('i-arrow')}</button>`).join('')}</div></section><div class="reader-next"><div><span>شروع مسیر</span><strong>${esc(course.chapters[0].title)}</strong></div><button class="btn primary" id="readerStart">شروع فصل اول ${icon('i-arrow')}</button></div></article>`;
    $('#readerStart').addEventListener('click',()=>setReaderChapter(0)); $$('[data-overview-chapter]').forEach(b=>b.addEventListener('click',()=>setReaderChapter(+b.dataset.overviewChapter)));
    $('#readerGlossary').innerHTML='<p>با ورود به هر فصل، اصطلاحات انگلیسی همان بخش در اینجا نمایش داده می‌شوند.</p>';
  }
  function renderReaderChapter(m,course,idx){
    const c=course.chapters[idx], image=chapterVisual(m.id,idx,course);
    $('#readerContent').innerHTML=`<article class="reader-article"><span class="reader-kicker">CHAPTER ${String(idx+1).padStart(2,'0')} · ${fa.format(c.minutes)} MIN</span><h1>${esc(c.title)}</h1><div class="reader-en-title">${esc(c.en)}</div><p class="reader-lead">${esc(c.lead)}</p><figure class="reader-figure"><img src="${esc(image)}" alt="نمودار فنی ${esc(c.title)}" loading="lazy"><figcaption>نمودار آموزشی مدار؛ روابط برای فهم مفهومی ساده‌سازی شده‌اند.</figcaption></figure><section class="reader-section prose">${c.paragraphs.map(p=>`<p>${esc(p)}</p>`).join('')}</section>${c.equation?`<div class="reader-equation"><span>رابطه کلیدی</span><code>${esc(c.equation.text)}</code><p>${esc(c.equation.explain)}</p></div>`:''}<section class="reader-section"><h2>نکته‌های کلیدی</h2><ul class="reader-key-list">${c.key.map(x=>`<li>${icon('i-check')}<span>${esc(x)}</span></li>`).join('')}</ul></section><section class="worked-example"><span>WORKED EXAMPLE</span><h2>${esc(c.example.title)}</h2><div><strong>مسئله</strong><p>${esc(c.example.problem)}</p></div><div><strong>راه‌حل و تفسیر</strong><p>${esc(c.example.solution)}</p></div></section><div class="reader-next"><button class="btn ghost" id="readerPrev" ${idx===0?'disabled':''}>فصل قبل</button><div><span>فصل بعد</span><strong>${idx===course.chapters.length-1?'آزمون پایان ماژول':esc(course.chapters[idx+1].title)}</strong></div><button class="btn primary" id="readerNext">ادامه ${icon('i-arrow')}</button></div></article>`;
    $('#readerPrev').addEventListener('click',()=>setReaderChapter(idx-1)); $('#readerNext').addEventListener('click',()=>setReaderChapter(idx+1)); renderGlossary(c);
  }
  function renderGlossary(chapter){
    const hay=[chapter.en,chapter.lead,...chapter.paragraphs].join(' ').toLowerCase(); const found=Object.entries(glossary).filter(([k])=>hay.includes(k.toLowerCase())).slice(0,7);
    $('#readerGlossary').innerHTML=(found.length?found:[[chapter.en,'عنوان انگلیسی فصل']]).map(([en,faWord])=>`<div class="glossary-term"><b>${esc(en)}</b><span>${esc(faWord)}</span></div>`).join('');
  }
  function renderReaderQuiz(m,course){
    $('#readerContent').innerHTML=`<article class="reader-article"><span class="reader-kicker">KNOWLEDGE CHECK</span><h1>آزمون ${esc(m.title)}</h1><p class="reader-lead">پاسخ هر پرسش را انتخاب کنید. توضیح علمی بلافاصله نمایش داده می‌شود؛ هدف سنجش فهم است، نه حفظ عبارت‌ها.</p><div class="reader-quiz">${course.quiz.map((q,qi)=>`<section class="quiz-question" data-q="${qi}"><span>پرسش ${fa.format(qi+1)}</span><h2>${esc(q.q)}</h2><div>${q.options.map((o,oi)=>`<button data-answer="${oi}">${esc(o)}</button>`).join('')}</div><p class="quiz-explain" hidden></p></section>`).join('')}</div><div class="quiz-score" id="quizScore"><strong>۰ / ${fa.format(course.quiz.length)}</strong><span>به همه پرسش‌ها پاسخ دهید.</span></div><div class="reader-next"><button class="btn ghost" id="quizBack">بازگشت به فصل آخر</button><button class="btn primary" id="finishModule">ثبت تکمیل ماژول</button></div></article>`;
    const answered=new Map(); $$('[data-answer]',$('#readerContent')).forEach(btn=>btn.addEventListener('click',()=>{const box=btn.closest('.quiz-question'),qi=+box.dataset.q,answer=+btn.dataset.answer,q=course.quiz[qi];if(answered.has(qi))return;answered.set(qi,answer===q.answer);$$('[data-answer]',box).forEach((b,i)=>{b.disabled=true;if(i===q.answer)b.classList.add('correct');else if(b===btn)b.classList.add('wrong')});const ex=$('.quiz-explain',box);ex.hidden=false;ex.textContent=(answer===q.answer?'درست — ':'نیاز به بازبینی — ')+q.why;const score=[...answered.values()].filter(Boolean).length;$('#quizScore').innerHTML=`<strong>${fa.format(score)} / ${fa.format(course.quiz.length)}</strong><span>${answered.size===course.quiz.length?(score===course.quiz.length?'عالی؛ همه پاسخ‌ها درست است.':'توضیح پاسخ‌های نادرست را مرور کنید.'):'به پرسش‌های باقی‌مانده پاسخ دهید.'}</span>`;}));
    $('#quizBack').addEventListener('click',()=>setReaderChapter(course.chapters.length-1)); $('#finishModule').addEventListener('click',()=>{state.completed.add(m.id);progressUpdate();renderLearning();$('#markModuleDone').textContent='تکمیل شده ✓';toast('ماژول به‌عنوان تکمیل‌شده ثبت شد');}); $('#readerGlossary').innerHTML='<p>پاسخ درست همراه با دلیل نمایش داده می‌شود. اگر اشتباه کردید، فصل مرتبط را دوباره مرور کنید.</p>';
  }
  $('#closeReader').addEventListener('click',closeReader);
  $('#markModuleDone').addEventListener('click',()=>{const id=state.readerModule;if(!id)return;state.completed.has(id)?state.completed.delete(id):state.completed.add(id);progressUpdate();renderLearning();renderReader();});
  $$('.filter-chip[data-level]').forEach(btn => btn.addEventListener('click', () => {
    $$('.filter-chip[data-level]').forEach(x => x.classList.toggle('active',x===btn)); renderLearning(btn.dataset.level);
  }));

  // Dashboard live data
  async function loadDashboard() {
    try {
      const [stats, launches] = await Promise.all([api('/api/stats'), api('/api/launches?limit=4&kind=latest')]);
      $('#statLaunches').textContent = fa.format(launches.count);
      $('#statFailures').textContent = fa.format(stats.catalogued_failures);
      $('#launchDataStatus').textContent = state.lang==='fa'?`واکشی ${fmtDate(launches.updated, true)} · کش ۵ دقیقه‌ای`:`Fetched ${fmtDate(launches.updated,true)} · 5-minute cache`;
      state.dashboardLaunches=(launches.results||[]).slice(0,4);
      renderDashboardLaunches(state.dashboardLaunches);
    } catch (err) {
      try{const [launchRes,failRes]=await Promise.all([fetch('launches-fallback.json',{cache:'no-store'}),fetch('failures-fallback.json',{cache:'no-store'})]);if(!launchRes.ok)throw new Error();const launches=await launchRes.json(),failures=failRes.ok?await failRes.json():{count:0};$('#statLaunches').textContent=fa.format(launches.count||0);$('#statFailures').textContent=fa.format(failures.count||0);$('#launchDataStatus').textContent=`کش آفلاین · ${fmtDate(launches.updated,true)}`;state.dashboardLaunches=(launches.results||[]).slice(0,4);renderDashboardLaunches(state.dashboardLaunches);}
      catch{$('#launchDataStatus').textContent = 'منبع زنده موقتاً در دسترس نیست.';$('#dashboardLaunches').innerHTML = `<div class="table-empty">اتصال برقرار نشد. از بخش بانک پرتاب‌ها دوباره تلاش کنید.</div>`;}
    }
  }
  function renderDashboardLaunches(items) {
    $('#dashboardLaunches').innerHTML = items.map(item => {
      const d = new Date(item.date); const day = Number.isNaN(d) ? '—' : fa.format(d.getUTCDate()); const mon = Number.isNaN(d) ? '' : d.toLocaleDateString('en-US',{month:'short',timeZone:'UTC'});
      const primary=state.lang==='fa'?(item.name_fa||item.name):item.name,secondary=state.lang==='fa'?item.name:(item.name_fa||'');
      const rocket=state.lang==='fa'?(item.rocket_fa||item.rocket):item.rocket,provider=state.lang==='fa'?(item.provider_fa||item.provider):item.provider;
      return `<div class="latest-item bilingual-launch" data-launch-id="${esc(item.id)}" data-no-auto-translate><div class="launch-thumb">${item.image?`<img src="${esc(proxiedImage(item.image))}" alt="${esc(item.name)}" loading="lazy">`:'<span>🚀</span>'}<time><strong>${day}</strong><small>${mon}</small></time></div><div><strong class="latest-name">${esc(primary)}</strong><span class="official-launch-name">${esc(secondary)}</span><span class="latest-sub">${esc(rocket)} · ${esc(provider)}</span><small class="image-credit">${item.credit?(state.lang==='fa'?'تصویر: ':'Image: ')+esc(item.credit):(state.lang==='fa'?'تصویر ثبت نشده':'No image registered')}</small></div><span class="status-pill ${statusClass(item.status)}">${state.lang==='fa'?statusFa(item.status):esc(item.status)}</span></div>`;
    }).join('');
    $$('.latest-item', $('#dashboardLaunches')).forEach(el => el.addEventListener('click', () => {
      const item = items.find(x=>String(x.id)===el.dataset.launchId); openLaunch(item);
    }));
  }
  function statusClass(status) { const s=String(status).toLowerCase(); return s.includes('success')||s.includes('deploy')?'success':s.includes('fail')?'failure':'other'; }
  function statusFa(status) { const s=String(status).toLowerCase(); return s.includes('success')?'موفق':s.includes('deploy')?'محموله رها شد':s.includes('fail')?'ناموفق':s.includes('flight')?'در پرواز':esc(status); }

  // Stage anatomy
  function renderStageRail() {
    $('#stageRail').innerHTML = D.launchStages.map(s => `<button class="stage-step ${s.id===state.currentStage?'active':''}" data-stage="${s.id}"><span class="stage-index">${String(s.id).padStart(2,'0')}</span><div><strong>${esc(s.title)}</strong><small>${esc(s.time)}</small></div></button>`).join('');
    $$('.stage-step').forEach(btn => btn.addEventListener('click',()=>selectStage(+btn.dataset.stage)));
    renderStageDetail();
  }
  function selectStage(id) { state.currentStage=id; renderStageRail(); }
  function stageImageMeta(id){
    if(id===1||id===2) return {src:'images/reference/artemis-liftoff-nasa.jpg',credit:'NASA · Artemis I',url:'https://www.nasa.gov/humans-in-space/view-the-best-images-from-nasas-artemis-i-mission/',kind:'تصویر واقعی'};
    if(id===5) return {src:'images/reference/fairing-separation-esa.jpg',credit:'ESA · نمای هنری جدایش فیرینگ',url:'https://www.esa.int/ESA_Multimedia/Images/2017/03/Artist_s_impression_of_the_fairing_separation',kind:'نمای فنی'};
    if(id===8) return {src:'images/reference/sentinel-separation-esa.jpg',credit:'ESA · جدایش Sentinel-3A از Breeze',url:'https://www.esa.int/ESA_Multimedia/Images/2018/04/Sentinel-3B_rocket_upper_stage',kind:'تصویر واقعی'};
    return {src:`images/stages/stage-${id}.svg?v=2`,credit:'تصویرسازی فنی مدار · نه به مقیاس',url:'#',kind:'نمودار آموزشی'};
  }
  function renderStageDetail() {
    const s = D.launchStages[state.currentStage], media=stageImageMeta(s.id), d=LD[s.id]||{};
    $('#readoutTime').textContent=s.time; $('#readoutAlt').textContent=s.altitude; $('#readoutSpeed').textContent=s.speed;
    const rocket=$('#rocketModel'); rocket.className='rocket-model';
    if(s.id===0) rocket.classList.add('prelaunch'); if(s.id>=4) rocket.classList.add('separated'); if(s.id>=5) rocket.classList.add('fairing-off'); if(s.id>=6) rocket.classList.add('orbiting'); if(s.id>=8) rocket.classList.add('payload');
    $('#stageDetail').innerHTML = `<span class="stage-tag">${esc(s.tag)} · مرحله ${fa.format(s.id)}</span><h2>${esc(s.title)}</h2><div class="en-title">${esc(s.en)}</div><figure class="stage-media"><div class="stage-image-loader">${state.lang==='fa'?'در حال آماده‌سازی تصویر…':'Loading visual…'}</div><img src="${esc(media.src)}" alt="${esc(s.title)}" decoding="async"><figcaption><span>${esc(media.kind)}</span><a href="${esc(media.url)}" ${media.url==='#'?'':'target="_blank" rel="noreferrer"'}>${esc(media.credit)} ${media.url==='#'?'':icon('i-external')}</a></figcaption></figure><p class="stage-summary">${esc(s.summary)}</p>
      <div class="stage-purpose"><span>هدف این مرحله</span><p>${esc(d.purpose||s.summary)}</p></div>
      <section class="stage-narrative">${(d.narrative||[s.physics]).map((p,i)=>`<p><b>${fa.format(i+1)}</b><span>${esc(p)}</span></p>`).join('')}</section>
      ${d.equation?`<div class="stage-equation"><span>روابط مرتبط</span><code>${esc(d.equation)}</code><small>رابطه‌ها مدل مقدماتی‌اند؛ Guidance واقعی از مدل چنددرجه‌آزادی و قیود پرواز استفاده می‌کند.</small></div>`:''}
      <div class="physics-box"><span>فیزیکِ پشت رویداد</span><p>${esc(s.physics)}</p></div>
      <div class="stage-depth-grid"><section><span>توالی عملیاتی</span><ol>${(d.sequence||s.events).map(x=>`<li>${esc(x)}</li>`).join('')}</ol></section><section><span>سامانه‌های درگیر</span><ul>${(d.systems||[]).map(x=>`<li>${esc(x)}</li>`).join('')}</ul></section><section><span>پارامترهای تله‌متری</span><ul>${(d.telemetry||[s.telemetry]).map(x=>`<li>${esc(x)}</li>`).join('')}</ul></section></div>
      <div class="stage-criteria"><section class="success"><span>معیار موفقیت</span><ul>${(d.success||[]).map(x=>`<li>${icon('i-check')}<span>${esc(x)}</span></li>`).join('')}</ul></section><section class="failure"><span>حالت‌های شکست</span><ul>${(d.failures||[s.risk]).map(x=>`<li>!<span>${esc(x)}</span></li>`).join('')}</ul></section></div>
      <div class="stage-insight"><div><span>مثال واقعی</span><p>${esc(d.example||'جزئیات مأموریت به پرتابگر و مدار هدف وابسته است.')}</p></div><div><span>نکته مهندسی</span><p>${esc(d.engineering||s.physics)}</p></div></div>`;
    const image=$('.stage-media img',$('#stageDetail')),loader=$('.stage-image-loader',$('#stageDetail'));
    image.addEventListener('load',()=>loader?.remove(),{once:true});image.addEventListener('error',()=>{const fallback=`images/stages/stage-${s.id}.svg?v=2`;if(!image.src.endsWith(fallback)){image.src=fallback;loader.textContent=state.lang==='fa'?'تصویر مرجع در دسترس نبود؛ نمودار فنی نمایش داده شد.':'Reference image unavailable; showing the technical diagram.'}else{loader.textContent=state.lang==='fa'?'تصویر بارگذاری نشد.':'Image could not be loaded.';}},{once:true});
  }
  function preloadStageMedia(){[...D.launchStages.map(s=>`images/stages/stage-${s.id}.svg?v=2`),'images/reference/artemis-liftoff-nasa.jpg','images/reference/fairing-separation-esa.jpg','images/reference/sentinel-separation-esa.jpg'].forEach(src=>{const img=new Image();img.decoding='async';img.src=src})}

  // Orbits
  function renderOrbitTabs() {
    $('#orbitTabs').innerHTML = D.orbits.map(o => `<button class="orbit-tab ${o.id===state.currentOrbit?'active':''}" data-orbit="${o.id}" style="--orbit-color:${o.color}"><strong>${esc(o.name)}</strong><span>${esc(o.id.toUpperCase())}</span></button>`).join('');
    $$('.orbit-tab').forEach(btn => btn.addEventListener('click',()=>{state.currentOrbit=btn.dataset.orbit;renderOrbitTabs();renderOrbitDetail();}));
  }
  function renderOrbitDetail() {
    const o=D.orbits.find(x=>x.id===state.currentOrbit); if(!o)return;const d=OD[o.id]||{};
    const path=$('#selectedOrbitPath'); path.className=`selected-path ${o.id}`; path.style.borderColor=o.color;
    $('#orbitDetail').style.setProperty('--orbit-color',o.color);
    const detailBlock=(title,text,open=false)=>`<details class="orbit-deep-block" ${open?'open':''}><summary>${title}<span>+</span></summary><p>${esc(text||'—')}</p></details>`;
    $('#orbitDetail').innerHTML=`<div class="orbit-accent"></div><h2>${esc(o.name)}</h2><div class="en">${esc(o.en)}</div><p class="orbit-definition">${esc(d.definition||'')}</p><div class="orbit-specs"><div><small>بازه ارتفاع</small><strong>${esc(o.range)}</strong></div><div><small>دوره معمول</small><strong>${esc(o.period)}</strong></div></div>
      <div class="orbit-parameter-list">${(d.parameters||[]).map(x=>`<span>${icon('i-check')}${esc(x)}</span>`).join('')}</div>
      <div class="orbit-columns expanded"><div><h4>کاربردها</h4><ul>${o.uses.map(x=>`<li>${esc(x)}</li>`).join('')}</ul><h4>مزیت‌ها</h4><ul>${o.pros.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div><div><h4>محدودیت‌ها</h4><ul>${o.cons.map(x=>`<li>${esc(x)}</li>`).join('')}</ul><h4>نمونه‌ها</h4><ul>${(d.examples||[o.examples]).map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div></div>
      <div class="orbit-deep-sections">${detailBlock('محیط فضا و تابش',d.environment,true)}${detailBlock('اغتشاشات و پایداری',d.perturbations)}${detailBlock('مخابرات و بخش زمینی',d.communications)}${detailBlock('دسترسی و پرتاب',d.access)}${detailBlock('نگهداری مدار',d.stationkeeping)}${detailBlock('پایان عمر و دفع',d.disposal)}</div>
      <section class="orbit-checklist"><span>پرسش‌های طراحی پیش از انتخاب مدار</span><ol>${(d.checklist||[]).map(x=>`<li>${esc(x)}</li>`).join('')}</ol></section><div class="orbit-misconception"><b>برداشت نادرست رایج</b><p>${esc(d.misconception||'')}</p></div>`;
  }
  const MU=398600.4418, RE=6378.137, G0=9.80665;
  function orbitCalc(h) { const r=RE+h, v=Math.sqrt(MU/r), t=2*Math.PI*Math.sqrt(r**3/MU); return {r,v,t,energy:-MU/(2*r)}; }
  function regime(h){ if(h<2000)return 'LEO'; if(Math.abs(h-35786)<350)return 'GEO/GSO'; if(h<35586)return 'MEO'; return 'HEO/High'; }
  function updateQuickCalc(){ const h=+$('#altRange').value, c=orbitCalc(h); $('#altOutput').textContent=fa.format(h); $('#quickVelocity').innerHTML=`${fa2.format(c.v)} <span>km/s</span>`; $('#quickPeriod').innerHTML=`${fa1.format(c.t/60)} <span>min</span>`; $('#quickRegime').textContent=regime(h); $('#quickLatency').innerHTML=`${fa1.format(h/299.792458)} <span>ms</span>`; }
  $('#altRange').addEventListener('input',updateQuickCalc);
  async function loadSatellites(){
    const group=$('#satGroup').value; $('#satelliteTable').innerHTML='<div class="skeleton-line"></div>';
    try{const d=await api(`/api/satellites?group=${encodeURIComponent(group)}&limit=20`); state.loaded.satellites=true; $('#satelliteTable').innerHTML=`<table class="mini-data-table"><thead><tr><th>نام</th><th>NORAD</th><th>حضیض km</th><th>اوج km</th><th>میل °</th><th>دوره min</th><th>Epoch UTC</th></tr></thead><tbody>${d.results.map(s=>`<tr><td>${esc(s.name)}</td><td class="num">${esc(s.norad_id)}</td><td class="num">${esc(s.perigee_km)}</td><td class="num">${esc(s.apogee_km)}</td><td class="num">${esc(s.inclination)}</td><td class="num">${esc(s.period_minutes)}</td><td class="num">${esc(String(s.epoch).replace('T',' ').slice(0,19))}</td></tr>`).join('')}</tbody></table><div class="data-source-line"><span class="status-led"></span>${fmtNum(d.count)} شیء در گروه · منبع CelesTrak GP/OMM · مقادیر حضیض/اوج از Mean Elements محاسبه شده‌اند.</div>`;}catch(err){$('#satelliteTable').innerHTML=`<div class="table-empty">CelesTrak پاسخ نداد: ${esc(err.message)}</div>`;}
  }
  $('#satGroup').addEventListener('change',loadSatellites);

  // Satellite encyclopedia
  function renderSatelliteEncyclopedia(){
    if(!S.types?.length)return;
    $('#satTypeCount').textContent=state.lang==='fa'?fa.format(S.types.length):String(S.types.length);
    const section=state.satSection||'types';
    if(section==='types')renderSatelliteTypes();
    else if(section==='anatomy')renderSatelliteAnatomy();
    else if(section==='model'){renderSatellite3D();setTimeout(initSat3DInteractions,0)}
    else if(section==='compare')renderArchitectureComparison();
    else if(section==='mission')renderMissionOrbitMatcher();
  }
  function renderSatelliteTypes(){
    $('#satelliteTypeGrid').innerHTML=S.types.map(t=>`<button class="satellite-type-card ${t.id===state.satelliteType?'active':''}" data-satellite-type="${t.id}" style="--sat-color:${t.color}" data-no-auto-translate><img src="${esc(t.image)}" alt="${esc(bi(t.title))}" loading="lazy"><div><span>${esc(bi(t.short))}</span><strong>${esc(bi(t.title))}</strong><small>${esc(t.orbit.primary)}</small></div></button>`).join('');
    $$('[data-satellite-type]',$('#satelliteTypeGrid')).forEach(btn=>btn.addEventListener('click',()=>{state.satelliteType=btn.dataset.satelliteType;renderSatelliteTypes()}));
    const t=S.types.find(x=>x.id===state.satelliteType)||S.types[0];
    const source=S.sources?.find(s=>s.name.includes(t.id==='navigation'?'GPS':t.id==='weather'?'NOAA':'ESA'))||S.sources?.[2];
    $('#satelliteTypeDetail').innerHTML=`<div class="sat-type-media"><img src="${esc(t.image)}" alt="${esc(bi(t.title))}"><span style="background:${t.color}">${state.lang==='fa'?'نوع مأموریت':'MISSION TYPE'}</span></div><div class="sat-type-copy" data-no-auto-translate><span class="section-kicker">${esc(t.id.toUpperCase())}</span><h2>${esc(bi(t.title))}</h2><p class="sat-type-lead">${esc(bi(t.description))}</p><div class="sat-type-facts"><div><small>${state.lang==='fa'?'محموله معمول':'Typical payload'}</small><strong>${esc(bi(t.payload))}</strong></div><div><small>${state.lang==='fa'?'مدار اصلی':'Primary orbit'}</small><strong>${esc(t.orbit.primary)}</strong></div></div><section><h3>${state.lang==='fa'?'کاربردهای اصلی':'Key applications'}</h3><ul>${bi(t.uses).map(x=>`<li>${icon('i-check')}<span>${esc(x)}</span></li>`).join('')}</ul></section><div class="orbit-rationale"><span>${state.lang==='fa'?'چرا این مدار؟':'WHY THIS ORBIT?'}</span><p>${esc(bi({fa:t.orbit.fa,en:t.orbit.en}))}</p></div><section><h3>${state.lang==='fa'?'نمونه‌های واقعی':'Real examples'}</h3><div class="sat-example-row">${t.examples.map(e=>`<div><strong>${esc(e.name)}</strong><small>${esc(e.orbit)}</small></div>`).join('')}</div></section>${source?`<a class="sat-source-link" href="${esc(source.url)}" target="_blank" rel="noreferrer">${state.lang==='fa'?'منبع فنی':'Technical source'} · ${esc(source.name)} ${icon('i-external')}</a>`:''}</div>`;
  }
  function renderSatelliteAnatomy(){
    const positions=[[50,30.9],[12,44],[50,11.8],[77.5,23.5],[25.5,61.8],[36,79.4],[50,76.5],[74.5,63.2],[59.5,88.2],[83,77.9]];
    $('#anatomyHotspots').innerHTML=S.components.map((c,i)=>`<button class="anatomy-hotspot ${c.id===state.satelliteComponent?'active':''}" data-component-hotspot="${c.id}" style="left:${positions[i][0]}%;top:${positions[i][1]}%" aria-label="${esc(bi(c.title))}">${c.n}</button>`).join('');
    $('#satelliteComponentList').innerHTML=`<span class="section-kicker">${state.lang==='fa'?'اجزای اصلی':'CORE COMPONENTS'}</span>${S.components.map(c=>`<button class="component-list-item ${c.id===state.satelliteComponent?'active':''}" data-component="${c.id}" data-no-auto-translate><b>${c.n}</b><span>${esc(bi(c.title))}</span></button>`).join('')}`;
    $$('[data-component], [data-component-hotspot]').forEach(btn=>btn.addEventListener('click',()=>{state.satelliteComponent=btn.dataset.component||btn.dataset.componentHotspot;renderSatelliteAnatomy()}));
    const c=S.components.find(x=>x.id===state.satelliteComponent)||S.components[0];
    $('#satelliteComponentDetail').innerHTML=`<div class="component-number">${c.n}</div><span class="section-kicker">SPACECRAFT SUBSYSTEM</span><h2>${esc(bi(c.title))}</h2><p>${esc(bi({fa:c.fa,en:c.en}))}</p><div class="mission-variation"><span>${state.lang==='fa'?'تغییر با نوع مأموریت':'MISSION-DEPENDENT DESIGN'}</span><p>${esc(bi(c.variation))}</p></div><div class="component-flow"><span>${state.lang==='fa'?'ورودی/وابستگی':'DEPENDENCIES'}</span><div><i></i><b>${state.lang==='fa'?'نیاز مأموریت':'Mission need'}</b><i></i><b>${esc(bi(c.title))}</b><i></i><b>${state.lang==='fa'?'عملکرد سامانه':'System performance'}</b></div></div>`;
  }
  function applySat3DTransform(){
    const model=$('#satellite3d');if(!model)return;model.style.transform=`rotateX(${state.sat3dRotateX}deg) rotateY(${state.sat3dRotateY}deg) scale3d(${state.sat3dZoom},${state.sat3dZoom},${state.sat3dZoom})`;
  }
  function renderSatellite3D(){
    if(!S.components?.length)return;
    $('#sat3dHint').textContent=state.lang==='fa'?'↔ بکشید و بچرخانید':'↔ DRAG TO ROTATE';
    $('#sat3dComponentPicker').innerHTML=S.components.map(c=>`<button class="${c.id===state.sat3dComponent?'active':''}" data-3d-component="${c.id}" data-no-auto-translate><b>${c.n}</b><span>${esc(bi(c.title))}</span></button>`).join('');
    $$('[data-3d-component]').forEach(btn=>btn.addEventListener('click',()=>{state.sat3dComponent=btn.dataset['3dComponent'];renderSatellite3D()}));
    const c=S.components.find(x=>x.id===state.sat3dComponent)||S.components[0],model=$('#satellite3d');model.className=`satellite-3d focus-${c.id}`;
    $('#sat3dInfo').innerHTML=`<span class="section-kicker">SELECTED COMPONENT · ${c.n}</span><h2>${esc(bi(c.title))}</h2><p>${esc(bi({fa:c.fa,en:c.en}))}</p><div class="mission-variation"><span>${state.lang==='fa'?'تفاوت در مأموریت‌ها':'MISSION VARIATION'}</span><p>${esc(bi(c.variation))}</p></div><div class="sat3d-tech-note"><b>${state.lang==='fa'?'نکته مدل':'MODEL NOTE'}</b><span>${state.lang==='fa'?'این مدل برای آموزش معماری و روابط فضایی است؛ ابعاد و چیدمان، نماینده ماهواره مشخصی نیست.':'This model teaches architecture and spatial relationships; dimensions and layout do not represent a specific spacecraft.'}</span></div>`;
    applySat3DTransform();
  }
  function initSat3DInteractions(){
    const viewport=$('#sat3dViewport');if(!viewport||viewport.dataset.ready)return;viewport.dataset.ready='1';let dragging=false,lastX=0,lastY=0,frame=0;
    const scheduleTransform=()=>{if(frame)return;frame=requestAnimationFrame(()=>{frame=0;applySat3DTransform()})};
    viewport.addEventListener('pointerdown',e=>{dragging=true;lastX=e.clientX;lastY=e.clientY;viewport.classList.add('dragging');viewport.setPointerCapture?.(e.pointerId)});
    viewport.addEventListener('pointermove',e=>{if(!dragging)return;state.sat3dRotateY+=(e.clientX-lastX)*.45;state.sat3dRotateX=Math.max(-80,Math.min(80,state.sat3dRotateX-(e.clientY-lastY)*.35));lastX=e.clientX;lastY=e.clientY;scheduleTransform()});
    const stop=()=>{dragging=false;viewport.classList.remove('dragging')};viewport.addEventListener('pointerup',stop);viewport.addEventListener('pointercancel',stop);
    viewport.addEventListener('wheel',e=>{e.preventDefault();state.sat3dZoom=Math.max(.65,Math.min(1.45,state.sat3dZoom-e.deltaY*.0008));$('#sat3dZoom').value=Math.round(state.sat3dZoom*100);applySat3DTransform()},{passive:false});
    $('#sat3dZoom').addEventListener('input',e=>{state.sat3dZoom=+e.target.value/100;applySat3DTransform()});
    $$('[data-3d-view]').forEach(btn=>btn.addEventListener('click',()=>{const v=btn.dataset['3dView'];if(v==='front'){state.sat3dRotateX=0;state.sat3dRotateY=0}else if(v==='top'){state.sat3dRotateX=-70;state.sat3dRotateY=0}else{state.sat3dRotateX=-12;state.sat3dRotateY=28;if(v==='reset'){state.sat3dZoom=1;$('#sat3dZoom').value=100}};$$('[data-3d-view]').forEach(b=>b.classList.toggle('active',b===btn));applySat3DTransform()}));
  }
  function renderArchitectureComparison(){
    const profiles=S.architectures||[];if(!profiles.length)return;const a=profiles.find(x=>x.id===state.architectureA)||profiles[0],b=profiles.find(x=>x.id===state.architectureB)||profiles[1]||profiles[0];
    const optionHtml=profiles.map(p=>`<option value="${p.id}">${esc(p.name)}</option>`).join('');$('#architectureA').innerHTML=optionHtml;$('#architectureB').innerHTML=optionHtml;$('#architectureA').value=a.id;$('#architectureB').value=b.id;
    const card=(p,label)=>`<article class="architecture-card"><div class="architecture-image"><img src="${esc(p.image)}" alt="${esc(p.name)}"><span>${label}</span></div><div><small>${esc(p.agency)}</small><h3>${esc(p.name)}</h3><p>${esc(bi(p.type))}</p><div class="architecture-quick"><span><b>${esc(p.mass)}</b>${state.lang==='fa'?'جرم':'Mass'}</span><span><b>${esc(p.power)}</b>${state.lang==='fa'?'توان':'Power'}</span><span><b>${esc(p.lifetime)}</b>${state.lang==='fa'?'عمر':'Life'}</span></div><a href="${esc(p.source)}" target="_blank" rel="noreferrer">${state.lang==='fa'?'منبع':'Source'} ${icon('i-external')}</a></div></article>`;
    const metrics=[['mass',state.lang==='fa'?'جرم':'Mass','kg'],['power',state.lang==='fa'?'توان':'Power','W'],['lifetime',state.lang==='fa'?'عمر طراحی':'Design life','yr'],['dataRate',state.lang==='fa'?'نرخ داده':'Data rate','Mbit/s'],['altitude',state.lang==='fa'?'فاصله/ارتفاع':'Altitude / range','km']];
    const bars=metrics.map(([key,label,unit])=>{const av=a.metrics[key],bv=b.metrics[key],max=Math.max(av,bv,1),ap=Math.max(3,av/max*100),bp=Math.max(3,bv/max*100);return `<div class="compare-metric"><span>${label}</span><div class="metric-a"><i style="width:${ap}%"></i><b>${new Intl.NumberFormat('en-US',{notation:av>99999?'compact':'standard',maximumFractionDigits:1}).format(av)} ${unit}</b></div><div class="metric-b"><i style="width:${bp}%"></i><b>${new Intl.NumberFormat('en-US',{notation:bv>99999?'compact':'standard',maximumFractionDigits:1}).format(bv)} ${unit}</b></div></div>`}).join('');
    const rows=[[state.lang==='fa'?'مدار':'Orbit','orbit'],[state.lang==='fa'?'محموله':'Payload','payload'],[state.lang==='fa'?'کنترل وضعیت':'Attitude control','attitude'],[state.lang==='fa'?'مخابرات':'Communications','comms'],[state.lang==='fa'?'پیشرانش':'Propulsion','propulsion'],[state.lang==='fa'?'داده':'Data architecture','data'],[state.lang==='fa'?'مزیت اصلی':'Primary strength','strength'],[state.lang==='fa'?'قید اصلی':'Main constraint','constraint']];
    $('#architectureComparison').innerHTML=`<div class="architecture-cards">${card(a,'A')}${card(b,'B')}</div><section class="panel architecture-metrics"><div class="metric-legend"><span><i class="a"></i>${esc(a.name)}</span><span><i class="b"></i>${esc(b.name)}</span></div>${bars}</section><section class="panel architecture-table-wrap"><table class="compare-table"><thead><tr><th>${state.lang==='fa'?'ویژگی':'Attribute'}</th><th>${esc(a.name)}</th><th>${esc(b.name)}</th></tr></thead><tbody>${rows.map(([label,key])=>`<tr><th>${label}</th><td>${esc(bi(a[key]))}</td><td>${esc(bi(b[key]))}</td></tr>`).join('')}</tbody></table></section>`;
    $('#architectureA').onchange=e=>{state.architectureA=e.target.value;if(state.architectureA===state.architectureB){const alt=profiles.find(p=>p.id!==state.architectureA);if(alt)state.architectureB=alt.id}renderArchitectureComparison()};$('#architectureB').onchange=e=>{state.architectureB=e.target.value;if(state.architectureA===state.architectureB){const alt=profiles.find(p=>p.id!==state.architectureB);if(alt)state.architectureA=alt.id}renderArchitectureComparison()};
  }
  function orbitVisualClass(orbit){const o=orbit.toUpperCase();if(o.includes('GEO'))return'geo';if(o.includes('MEO'))return'meo';if(o.includes('L2')||o.includes('L1')||o.includes('HEO'))return'deep';return'leo'}
  function renderMissionOrbitMatcher(){
    const profiles=Object.entries(S.missionProfiles||{}),current=S.missionProfiles[state.missionProfile]||profiles[0]?.[1];if(!current)return;
    $('#missionSelector').innerHTML=`<span class="section-kicker">${state.lang==='fa'?'نوع مأموریت':'SELECT MISSION'}</span>${profiles.map(([id,p])=>`<button class="${id===state.missionProfile?'active':''}" data-mission-profile="${id}" data-no-auto-translate><svg><use href="#i-satellite"/></svg><span>${esc(bi(p.title))}</span></button>`).join('')}`;
    $$('[data-mission-profile]').forEach(btn=>btn.addEventListener('click',()=>{state.missionProfile=btn.dataset.missionProfile;renderMissionOrbitMatcher()}));
    $('#missionRecommendation').innerHTML=`<span class="section-kicker">${state.lang==='fa'?'پیشنهاد مقدماتی':'PRELIMINARY MATCH'}</span><h2>${esc(bi(current.title))}</h2><div class="recommended-orbit"><small>${state.lang==='fa'?'مدار مناسب':'RECOMMENDED ORBIT'}</small><strong>${esc(current.orbit)}</strong></div><p>${esc(bi(current.why))}</p><div class="recommend-example"><span>${state.lang==='fa'?'مثال':'EXAMPLE'}</span><strong>${esc(current.example)}</strong></div><div class="trade-warning">${icon('i-info')}<span>${state.lang==='fa'?'مدار نهایی به جرم، پرتابگر، عرض جغرافیایی هدف، بودجه توان و مقررات دفع نیز وابسته است.':'Final orbit also depends on mass, launcher, target latitude, power budget and disposal rules.'}</span></div>`;
    const visual=$('#missionOrbitVisual');visual.dataset.orbit=orbitVisualClass(current.orbit);const selected=$('.mo-selected',visual);selected.className=`mo-selected ${orbitVisualClass(current.orbit)}`;
    $('#missionOrbitMatrix').innerHTML=`<table class="mini-data-table mission-matrix" data-no-auto-translate><thead><tr><th>${state.lang==='fa'?'مأموریت':'Mission'}</th><th>${state.lang==='fa'?'مدار معمول':'Typical orbit'}</th><th>${state.lang==='fa'?'نمونه':'Example'}</th></tr></thead><tbody>${profiles.map(([,p])=>`<tr><td>${esc(bi(p.title))}</td><td class="num">${esc(p.orbit)}</td><td>${esc(p.example)}</td></tr>`).join('')}</tbody></table>`;
  }
  $$('[data-sat-section]').forEach(btn=>btn.addEventListener('click',()=>{state.satSection=btn.dataset.satSection;$$('[data-sat-section]').forEach(b=>b.classList.toggle('active',b===btn));$$('.satellite-subview').forEach(s=>s.classList.toggle('active',s.id===`sat-section-${state.satSection}`));requestAnimationFrame(renderSatelliteEncyclopedia)}));

  // NASA / ESA live update center
  async function loadAgencyFeed(force=false){
    $('#refreshAgencyFeed').disabled=true;$('#agencyLiveState').textContent=state.lang==='fa'?'در حال همگام‌سازی…':'SYNCING…';
    try{const data=await api(`/api/agency-feed?agency=all&limit=30${force?'&refresh=1':''}`);const items=data.items||[],signature=items.map(x=>x.id).join('|'),changed=signature!==state.agencyDataSignature;state.agencyItems=items;state.agencyDataSignature=signature;const firstLoad=!state.loaded.agencies;state.loaded.agencies=true;state.agencyMeta=data;if(changed||firstLoad)renderAgencyFeed();else updateAgencySyncMeta();if(!state.agencyTimer)state.agencyTimer=setInterval(()=>{if(!document.hidden&&$('.view.active')?.id==='view-agencies')loadAgencyFeed(false)},Math.max(60,data.poll_seconds||180)*1000);}
    catch(err){
      try{const response=await fetch('agency-feed-fallback.json',{cache:'no-store'});if(!response.ok)throw new Error(`HTTP ${response.status}`);const fallback=await response.json();state.agencyItems=fallback.items||[];state.loaded.agencies=true;state.agencyMeta={...fallback,offline_fallback:true};renderAgencyFeed();$('#agencyLiveState').textContent=state.lang==='fa'?'کش آفلاین':'OFFLINE CACHE';if(!state.agencyFallbackWarned){toast(state.lang==='fa'?'سرور زنده در دسترس نیست؛ آخرین Feed معتبر نمایش داده شد':'Live server unavailable; showing the last verified feed','',state.lang==='fa'?'برای همگام‌سازی تازه، برنامه را از Live Preview باز کنید.':'Open the app from Live Preview for a fresh sync.');state.agencyFallbackWarned=true;}}
      catch(fallbackError){$('#agencyLiveState').textContent=state.lang==='fa'?'خطای اتصال':'SYNC ERROR';$('#agencyNewsGrid').innerHTML=`<div class="table-empty">${esc(err.message)}</div>`;toast(state.lang==='fa'?'دریافت Feed آژانس‌ها ناموفق بود':'Agency feed request failed','error',err.message)}
    }
    finally{$('#refreshAgencyFeed').disabled=false}
  }
  function agencyImage(item){return item.image?proxiedImage(item.image):''}
  function updateAgencySyncMeta(){
    const offline=!!state.agencyMeta?.offline_fallback;$('#agencyLiveState').textContent=offline?(state.lang==='fa'?'کش آفلاین':'OFFLINE CACHE'):(state.lang==='fa'?'همگام است':'LIVE SYNC');const timestamps=Object.values(state.agencyMeta?.updated||{}).filter(Boolean),sync=timestamps.length?new Date(Math.max(...timestamps)*1000):new Date();$('#agencyLastSync').textContent=(offline?(state.lang==='fa'?'آخرین داده معتبر: ':'Last verified data: '):(state.lang==='fa'?'آخرین بررسی: ':'Last check: '))+fmtDate(sync.toISOString(),true);$('#agencyFreshness').textContent=offline?(state.lang==='fa'?'حالت آفلاین · سرور برای تازه‌سازی لازم است':'Offline mode · server required to refresh'):(state.lang==='fa'?'به‌روزرسانی خودکار هر ۳ دقیقه':'Auto-refresh every 3 minutes');
  }
  function renderAgencyFeed(){
    if(!$('#agencyNewsGrid'))return;const q=$('#agencySearch').value.trim().toLowerCase(),filter=state.agencyFilter;
    const items=state.agencyItems.filter(x=>(filter==='all'||x.agency===filter)&&(!q||[x.title,x.title_fa,x.summary,x.summary_fa,x.category].join(' ').toLowerCase().includes(q)));
    const newest=items[0],remaining=items.slice(1,state.agencyVisible);$('#agencyItemCount').textContent=state.lang==='fa'?fa.format(items.length):String(items.length);updateAgencySyncMeta();
    if(!newest){$('#agencyFeatured').innerHTML=`<div class="table-empty">${state.lang==='fa'?'رکوردی با این فیلتر پیدا نشد.':'No item matches this filter.'}</div>`;$('#agencyNewsGrid').innerHTML='';$('#agencyLoadMore').hidden=true;return}
    const title=state.lang==='fa'?(newest.title_fa||newest.title):newest.title,secondary=state.lang==='fa'?newest.title:(newest.title_fa||''),summary=state.lang==='fa'?(newest.summary_fa||newest.summary):newest.summary,img=agencyImage(newest);
    $('#agencyFeatured').innerHTML=`<article class="agency-featured-card" data-no-auto-translate><div class="agency-featured-media">${img?`<img src="${esc(img)}" alt="${esc(newest.title)}" decoding="async" fetchpriority="high">`:`<div class="agency-placeholder">${icon('i-satellite')}</div>`}<span class="agency-badge ${newest.agency}">${newest.agency}</span></div><div class="agency-featured-copy"><time>${fmtDate(newest.published,true)} · ${esc(newest.category)}</time><h2>${esc(title)}</h2><span class="agency-official-title">${esc(secondary)}</span><span class="auto-translation-label">${state.lang==='fa'?'ترجمه خودکار · متن رسمی انگلیسی محفوظ است':'Persian translation shown below official English'}</span><p>${esc(summary)}</p><a class="btn primary small" href="${esc(newest.url)}" target="_blank" rel="noreferrer">${state.lang==='fa'?'مطالعه در منبع رسمی':'Read at official source'} ${icon('i-external')}</a></div></article>`;
    $('#agencyNewsGrid').innerHTML=remaining.map(item=>{const primary=state.lang==='fa'?(item.title_fa||item.title):item.title,second=state.lang==='fa'?item.title:(item.title_fa||''),desc=state.lang==='fa'?(item.summary_fa||item.summary):item.summary,image=agencyImage(item);return `<article class="agency-news-card" data-no-auto-translate><div class="agency-news-image">${image?`<img src="${esc(image)}" alt="${esc(item.title)}" loading="lazy" decoding="async" fetchpriority="low">`:`<div class="agency-placeholder">${icon('i-source')}</div>`}<span class="agency-badge ${item.agency}">${item.agency}</span></div><div class="agency-news-body"><time>${fmtDate(item.published,true)} · ${esc(item.category)}</time><h3>${esc(primary)}</h3><span class="agency-official-title">${esc(second)}</span><p>${esc(desc.slice(0,320))}${desc.length>320?'…':''}</p><a href="${esc(item.url)}" target="_blank" rel="noreferrer">${state.lang==='fa'?'بازکردن مطلب رسمی':'Open official item'} ${icon('i-external')}</a></div></article>`}).join('');
    $('#agencyLoadMore').hidden=items.length<=state.agencyVisible;$('#agencyLoadMore span').textContent=state.lang==='fa'?`نمایش مطالب بیشتر (${fa.format(Math.max(0,items.length-state.agencyVisible))})`:`Show more (${Math.max(0,items.length-state.agencyVisible)})`;
  }
  $$('[data-agency-filter]').forEach(btn=>btn.addEventListener('click',()=>{state.agencyFilter=btn.dataset.agencyFilter;state.agencyVisible=8;$$('[data-agency-filter]').forEach(b=>b.classList.toggle('active',b===btn));renderAgencyFeed()}));
  let agencySearchTimer=0;$('#agencySearch').addEventListener('input',()=>{clearTimeout(agencySearchTimer);agencySearchTimer=setTimeout(()=>{state.agencyVisible=8;renderAgencyFeed()},180)});$('#refreshAgencyFeed').addEventListener('click',()=>loadAgencyFeed(true));$('#agencyLoadMore').addEventListener('click',()=>{state.agencyVisible+=6;renderAgencyFeed()});

  // Launch DB
  async function loadLaunches(reset=false) {
    if(reset){state.launches=[];state.launchOffset=0;$('#launchTableBody').innerHTML=Array(8).fill('<tr><td colspan="7"><div class="skeleton-line"></div></td></tr>').join('');}
    $('#loadMoreLaunches').disabled=true;
    try{const data=await api(`/api/launches?limit=20&offset=${state.launchOffset}&kind=latest`);state.launches.push(...data.results);state.launchOffset=data.next_offset??state.launchOffset;state.launchCount=data.count;state.loaded.launches=true;state.launchesOffline=!!data.offline_fallback;$('#launchDbCount').textContent=fa.format(data.count);$('#launchDbUpdated').textContent=`${data.offline_fallback?'کش آفلاین':'واکشی'} ${fmtDate(data.updated,true)}`;renderLaunchTable();$('#loadMoreLaunches').disabled=data.next_offset===null;}
    catch(err){
      if(reset||!state.launches.length){try{const response=await fetch('launches-fallback.json',{cache:'no-store'});if(!response.ok)throw new Error(`HTTP ${response.status}`);const data=await response.json();state.launches=data.results||[];state.launchCount=data.count||state.launches.length;state.loaded.launches=true;state.launchesOffline=true;$('#launchDbCount').textContent=fa.format(state.launchCount);$('#launchDbUpdated').textContent=`کش آفلاین · ${fmtDate(data.updated,true)}`;renderLaunchTable();$('#loadMoreLaunches').disabled=true;if(!state.launchFallbackWarned){toast('سرور زنده در دسترس نیست؛ آخرین بانک معتبر نمایش داده شد','', 'برای داده تازه، برنامه را از Live Preview باز کنید.');state.launchFallbackWarned=true;}return}catch{}
      }
      if(!state.launches.length)$('#launchTableBody').innerHTML=`<tr><td colspan="7"><div class="table-empty">داده پرتاب در دسترس نیست: ${esc(err.message)}</div></td></tr>`;toast('خطا در دریافت پرتاب‌ها','error',err.message);
    }
  }
  function renderLaunchTable(){
    const q=$('#launchSearch').value.trim().toLowerCase(), orbit=$('#launchOrbitFilter').value,status=$('#launchStatusFilter').value;
    const items=state.launches.filter(x=>(!q||[x.name,x.rocket,x.provider,x.country,x.pad].join(' ').toLowerCase().includes(q))&&(orbit==='all'||x.orbit===orbit)&&(status==='all'||String(x.status).includes(status)));
    $('#launchTableBody').innerHTML=items.map(x=>{const name=state.lang==='fa'?(x.name_fa||x.name):x.name,secondary=state.lang==='fa'?x.name:(x.name_fa||''),rocket=state.lang==='fa'?(x.rocket_fa||x.rocket):x.rocket,provider=state.lang==='fa'?(x.provider_fa||x.provider):x.provider,orbitName=state.lang==='fa'?(x.orbit_fa||x.orbit):x.orbit,country=state.lang==='fa'?(x.country_fa||x.country):x.country;return `<tr data-launch-id="${esc(x.id)}" data-no-auto-translate><td class="mission-cell"><div class="table-mission-wrap"><div class="table-launch-image">${x.image?`<img src="${esc(proxiedImage(x.image))}" alt="" loading="lazy">`:'🚀'}</div><div><strong>${esc(name)}</strong><em class="official-launch-name">${esc(secondary)}</em><span>${fmtDate(x.date,true)}</span><small>${x.credit?(state.lang==='fa'?'تصویر: ':'Image: ')+esc(x.credit):(state.lang==='fa'?'بدون تصویر':'No image')}</small></div></div></td><td>${esc(rocket)}</td><td class="provider-cell">${esc(provider)}</td><td><span class="orbit-pill">${esc(orbitName)}</span></td><td>${esc(country)}<br><small>${esc(x.pad)}</small></td><td><span class="status-pill ${statusClass(x.status)}">${state.lang==='fa'?statusFa(x.status):esc(x.status)}</span></td><td><span class="row-arrow">${icon('i-arrow')}</span></td></tr>`}).join('');
    $('#launchEmpty').hidden=items.length>0;$('#launchShown').textContent=`نمایش ${fa.format(items.length)} از ${fa.format(state.launches.length)} رکورد بارگذاری‌شده · کل منبع ${fa.format(state.launchCount)}${state.launchesOffline?' · حالت آفلاین':''}`;
    $$('tr[data-launch-id]',$('#launchTableBody')).forEach(tr=>tr.addEventListener('click',()=>openLaunch(state.launches.find(x=>String(x.id)===tr.dataset.launchId))));
  }
  async function openLaunch(x){
    if(!x)return;let descriptionFa=x.description_fa;
    if(state.lang==='fa'&&!descriptionFa&&x.description&&/[A-Za-z]/.test(x.description)){
      try{const tr=await api('/api/translate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({texts:[x.description],target:'fa',source:'en'})});descriptionFa=tr.translations[0];x.description_fa=descriptionFa;}catch{descriptionFa='ترجمه فارسی این شرح موقتاً در دسترس نیست.';}
    }
    const primary=state.lang==='fa'?(x.name_fa||x.name):x.name,secondary=state.lang==='fa'?x.name:(x.name_fa||''),description=state.lang==='fa'?(descriptionFa||x.description):x.description;
    const rocket=state.lang==='fa'?(x.rocket_fa||x.rocket):x.rocket,provider=state.lang==='fa'?(x.provider_fa||x.provider):x.provider,orbitName=state.lang==='fa'?(x.orbit_fa||x.orbit):x.orbit,type=state.lang==='fa'?(x.mission_type_fa||x.mission_type):x.mission_type;
    const labels=state.lang==='fa'?{record:'رکورد پرتاب',image:'اعتبار تصویر',unknown:'نامشخص',license:'مجوز در منبع ثبت نشده',rocket:'پرتابگر',provider:'ارائه‌دهنده',orbit:'مدار مأموریت',type:'نوع مأموریت',pad:'پایگاه',place:'مکان',status:'وضعیت',source:'رکورد منبع'}:{record:'LAUNCH RECORD',image:'Image credit',unknown:'Unknown',license:'No license recorded',rocket:'Launch vehicle',provider:'Provider',orbit:'Mission orbit',type:'Mission type',pad:'Launch pad',place:'Location',status:'Status',source:'Source record'};
    openModal(`<div data-no-auto-translate><span class="modal-kicker">${labels.record} · ${esc(x.status)}</span><h2 class="modal-title">${esc(primary)}</h2><div class="modal-bilingual-title">${esc(secondary)}</div><div class="modal-sub">${fmtDate(x.date,true)}</div>${x.image?`<figure class="modal-launch-image"><img src="${esc(proxiedImage(x.image))}" alt="${esc(x.name)}"><figcaption><span>${labels.image}: ${esc(x.credit||labels.unknown)}</span><span>${esc(x.image_license||labels.license)}</span></figcaption></figure>`:''}<p class="modal-lead">${esc(description)}</p>${state.lang==='fa'?`<details class="official-description"><summary>شرح رسمی انگلیسی</summary><p>${esc(x.description)}</p></details>`:''}
    <div class="modal-grid"><div class="modal-card"><small>${labels.rocket}</small><strong>${esc(rocket)}</strong></div><div class="modal-card"><small>${labels.provider}</small><strong>${esc(provider)}</strong></div><div class="modal-card"><small>${labels.orbit}</small><strong>${esc(orbitName)}</strong></div><div class="modal-card"><small>${labels.type}</small><strong>${esc(type)}</strong></div><div class="modal-card"><small>${labels.pad}</small><strong>${esc(x.pad)}</strong></div><div class="modal-card"><small>${labels.place}</small><strong>${esc(x.location)}</strong></div></div><div class="modal-section"><h3>${labels.status}</h3><p class="modal-lead">${state.lang==='fa'?statusFa(x.status):esc(x.status_description||x.status)}</p></div><a class="btn ghost" href="${esc(x.source_url||'#')}" target="_blank" rel="noreferrer">${labels.source} ${icon('i-external')}</a></div>`);
  }
  $('#loadMoreLaunches').addEventListener('click',()=>loadLaunches(false));
  $('#refreshLaunches').addEventListener('click',()=>loadLaunches(true));
  ['launchSearch','launchOrbitFilter','launchStatusFilter'].forEach(id=>$('#'+id).addEventListener(id==='launchSearch'?'input':'change',renderLaunchTable));

  // Failures
  async function loadLiveFailures(reset=false){
    if(reset){state.failures=[];state.failureOffset=0;$('#liveFailureList').innerHTML='<div class="skeleton-line"></div><div class="skeleton-line"></div>';}
    $('#moreFailures').disabled=true;
    try{const d=await api(`/api/launches?limit=8&offset=${state.failureOffset}&kind=failures`);state.failures.push(...d.results);state.failureOffset=d.next_offset??state.failureOffset;state.loaded.failures=true;renderLiveFailures();$('#moreFailures').disabled=d.next_offset===null;}
    catch(err){try{const response=await fetch('failures-fallback.json',{cache:'no-store'});if(!response.ok)throw new Error();const d=await response.json();state.failures=d.results||[];state.failureOffset=0;state.loaded.failures=true;renderLiveFailures();$('#moreFailures').disabled=true;}catch{$('#liveFailureList').innerHTML=`<div class="table-empty">فهرست زنده دریافت نشد: ${esc(err.message)}</div>`;}}
  }
  function renderLiveFailures(){
    $('#liveFailureList').innerHTML=state.failures.map(x=>{const d=new Date(x.date),name=state.lang==='fa'?(x.name_fa||x.name):x.name,secondary=state.lang==='fa'?x.name:(x.name_fa||''),rocket=state.lang==='fa'?(x.rocket_fa||x.rocket):x.rocket,provider=state.lang==='fa'?(x.provider_fa||x.provider):x.provider;return `<article class="live-failure-item" data-failure-id="${esc(x.id)}" data-no-auto-translate><div class="failure-visual">${x.image?`<img src="${esc(proxiedImage(x.image))}" alt="${esc(x.name)}" loading="lazy">`:'<span>!</span>'}<div class="failure-date"><strong>${Number.isNaN(d)?'—':fa.format(d.getUTCDate())}</strong><small>${Number.isNaN(d)?'':d.toLocaleDateString('en-US',{month:'short',timeZone:'UTC'})}</small></div></div><div><h3>${esc(name)}</h3><span class="official-launch-name">${esc(secondary)}</span><p>${esc(rocket)} · ${esc(provider)}</p><small class="image-credit">${x.credit?(state.lang==='fa'?'تصویر: ':'Image: ')+esc(x.credit):(state.lang==='fa'?'تصویر موجود نیست':'No image')}</small><div class="meta"><span class="orbit-pill">${esc(state.lang==='fa'?(x.orbit_fa||x.orbit):x.orbit)}</span><span class="status-pill failure">${state.lang==='fa'?'ناموفق':'Failure'}</span></div></div></article>`}).join('');
    $$('[data-failure-id]',$('#liveFailureList')).forEach(el=>el.addEventListener('click',()=>{const launch=state.failures.find(x=>String(x.id)===el.dataset.failureId);const deep=D.curatedFailures.find(c=>{const key=c.title.split('·')[0].trim().toLowerCase();return key.length>2&&String(launch?.name||'').toLowerCase().includes(key);});deep?openFailureCase(deep.title):openLaunch(launch);}));
  }
  $('#moreFailures').addEventListener('click',()=>loadLiveFailures(false));
  function renderFailureCases(filter='all'){
    $('#failureCases').innerHTML=D.curatedFailures.map(f=>{const hidden=filter!=='all'&&f.kind!==filter,detail=F[f.title]||{},open=(detail.confidence||f.certainty).includes('باز')||(detail.confidence||f.certainty).includes('افشا');return `<article class="failure-case ${hidden?'hidden-card':''}" style="--case-color:${f.kind.includes('زمینی')?'var(--violet)':f.kind.includes('بازیابی')?'var(--gold)':'var(--coral)'}"><div class="case-top"><span class="case-date">${esc(f.iso)}</span><span class="certainty-pill ${open?'open':'closed'}">${esc(detail.confidence||f.certainty)}</span></div><h3>${esc(f.title)}</h3><span class="case-kind">${esc(f.kind)}</span><div class="cause-mini-map"><span>رخداد</span><i></i><span>علت نزدیک</span><i></i><span class="${open?'unknown':''}">${open?'علت باز':'علت ریشه‌ای'}</span></div><div class="case-phase"><span>فاز</span><strong>${esc(f.phase)}</strong></div><p>${esc(detail.proximate||f.cause)}</p><div class="lesson-box"><small>درس مهندسی</small><p>${esc(f.lesson)}</p></div><button class="case-detail-btn" data-open-failure="${esc(f.title)}">بازکردن زنجیره علت و شواهد ${icon('i-arrow')}</button><div class="case-source"><span>${esc(f.sourceName)}</span><a href="${esc(f.source)}" target="_blank" rel="noreferrer">منبع ${icon('i-external')}</a></div></article>`}).join('');
    $$('[data-open-failure]',$('#failureCases')).forEach(btn=>btn.addEventListener('click',()=>openFailureCase(btn.dataset.openFailure)));
  }
  function openFailureCase(title){
    const f=D.curatedFailures.find(x=>x.title===title),d=F[title]||{}; if(!f)return;
    const isOpen=(d.confidence||f.certainty).includes('باز')||(d.confidence||f.certainty).includes('افشا');
    openModal(`<span class="modal-kicker">FAILURE CAUSAL CHAIN · ${esc(f.iso)}</span><h2 class="modal-title">${esc(f.title)}</h2><div class="modal-sub">${esc(f.kind)} · ${esc(f.phase)}</div><div class="failure-confidence-banner ${isOpen?'open':'confirmed'}"><strong>${esc(d.confidence||f.certainty)}</strong><span>${isOpen?'علت قطعی عمومی در دسترس نیست؛ بخش‌های نامعلوم عمداً خالی نگه داشته شده‌اند.':'زنجیره بر گزارش یا جمع‌بندی معتبر استوار است.'}</span></div><div class="causal-chain"><article><b>01</b><span>مشاهده و پیامد</span><p>${esc(d.observed||f.severity)}</p></article><i>${icon('i-arrow')}</i><article><b>02</b><span>علت نزدیک</span><p>${esc(d.proximate||f.cause)}</p></article><i>${icon('i-arrow')}</i><article class="${isOpen?'open-cause':''}"><b>03</b><span>علت ریشه‌ای</span><p>${esc(d.root||'اعلام نشده است.')}</p></article><i>${icon('i-arrow')}</i><article><b>04</b><span>اقدام اصلاحی</span><p>${esc(d.action||'اقدام عمومی ثبت نشده است.')}</p></article></div><div class="evidence-box"><span>شواهد و محدودیت استنتاج</span><p>${esc(d.evidence||'برای نتیجه‌گیری نهایی به گزارش بررسی و داده‌های اصلی نیاز است.')}</p></div><div class="lesson-box modal-lesson"><small>درس مهندسی</small><p>${esc(f.lesson)}</p></div><a class="btn ghost" href="${esc(f.source)}" target="_blank" rel="noreferrer">بازکردن منبع اصلی ${icon('i-external')}</a>`);
  }
  $$('.filter-chip[data-case]').forEach(btn=>btn.addEventListener('click',()=>{$$('.filter-chip[data-case]').forEach(x=>x.classList.toggle('active',x===btn));renderFailureCases(btn.dataset.case);}));

  // Launchers
  function renderLaunchers(){
    $('#launcherGrid').innerHTML=D.launchers.map((l,i)=>`<article class="launcher-card"><div class="launcher-visual"><span class="launcher-status">${esc(l.status)}</span><button class="compare-check ${state.compare.has(l.id)?'selected':''}" data-compare="${l.id}" title="افزودن به مقایسه">${icon('i-check')}</button><div class="launcher-scale"><span>${esc(l.height)}</span></div><div class="lv-rocket" style="transform:translateX(-50%) scale(${.86+i*.018})"><div class="nose"></div><div class="lv-stage2"></div><div class="lv-stage1"></div>${['ariane6','soyuz2','pslv','longmarch5'].includes(l.id)?'<div class="boosters"></div>':''}</div></div><div class="launcher-body"><h3>${esc(l.name)}</h3><div class="launcher-maker">${esc(l.maker)}</div><div class="launcher-spec-grid"><div><small>ارتفاع</small><strong>${esc(l.height)}</strong></div><div><small>جرم پرتاب</small><strong>${esc(l.mass)}</strong></div><div><small>مراحل</small><strong>${esc(l.stages)}</strong></div></div><div class="capacity-row"><div><span>LEO</span><strong>${esc(l.leo)}</strong></div><div><span>GTO</span><strong>${esc(l.gto)}</strong></div></div><p>${esc(l.note)}</p><div class="launcher-foot"><a href="${esc(l.source)}" target="_blank" rel="noreferrer">مرجع رسمی ${icon('i-external')}</a><button data-open-launcher="${l.id}">جزئیات فنی</button></div></div></article>`).join('');
    $$('[data-compare]').forEach(btn=>btn.addEventListener('click',()=>toggleCompare(btn.dataset.compare)));
    $$('[data-open-launcher]').forEach(btn=>btn.addEventListener('click',()=>openLauncher(btn.dataset.openLauncher)));
    updateCompareTray();
  }
  function toggleCompare(id){if(state.compare.has(id))state.compare.delete(id);else if(state.compare.size<3)state.compare.add(id);else return toast('حداکثر سه پرتابگر قابل مقایسه است','error');renderLaunchers();}
  function updateCompareTray(){const box=$('#compareSelections');box.innerHTML=state.compare.size?[...state.compare].map(id=>`<span class="compare-dot">${esc(D.launchers.find(x=>x.id===id).name.split(' ')[0])}</span>`).join(''):'<small>حداکثر ۳ پرتابگر</small>';$('#compareBtn').disabled=state.compare.size<2;}
  function openLauncher(id){const l=D.launchers.find(x=>x.id===id);openModal(`<span class="modal-kicker">LAUNCH VEHICLE</span><h2 class="modal-title">${esc(l.name)}</h2><div class="modal-sub">${esc(l.maker)}</div><p class="modal-lead">${esc(l.note)}</p><div class="modal-grid"><div class="modal-card"><small>ارتفاع</small><strong>${esc(l.height)}</strong></div><div class="modal-card"><small>قطر</small><strong>${esc(l.diameter)}</strong></div><div class="modal-card"><small>جرم برخاست</small><strong>${esc(l.mass)}</strong></div><div class="modal-card"><small>معماری مراحل</small><strong>${esc(l.stages)}</strong></div><div class="modal-card"><small>پیشرانه</small><strong>${esc(l.prop)}</strong></div><div class="modal-card"><small>موتورها</small><strong>${esc(l.engines)}</strong></div><div class="modal-card"><small>ظرفیت LEO</small><strong>${esc(l.leo)}</strong></div><div class="modal-card"><small>ظرفیت GTO</small><strong>${esc(l.gto)}</strong></div></div><div class="modal-section"><h3>بازیابی و استفاده مجدد</h3><p class="modal-lead">${esc(l.reuse)}</p></div><a class="btn ghost" href="${esc(l.source)}" target="_blank" rel="noreferrer">منبع سازنده/سازمان ${icon('i-external')}</a>`);}
  $('#compareBtn').addEventListener('click',()=>{const ls=[...state.compare].map(id=>D.launchers.find(x=>x.id===id));const rows=[['سازنده','maker'],['ارتفاع','height'],['جرم','mass'],['مراحل','stages'],['پیشرانه','prop'],['ظرفیت LEO','leo'],['ظرفیت GTO','gto'],['بازیابی','reuse'],['موتورها','engines']];openModal(`<span class="modal-kicker">SIDE-BY-SIDE</span><h2 class="modal-title">مقایسه پرتابگرها</h2><p class="modal-lead">ظرفیت اسمی را فقط در مدار و پروفایل مأموریت یکسان مقایسه کنید.</p><table class="compare-table"><thead><tr><th>ویژگی</th>${ls.map(l=>`<th>${esc(l.name)}</th>`).join('')}</tr></thead><tbody>${rows.map(([label,key])=>`<tr><th>${label}</th>${ls.map(l=>`<td>${esc(l[key])}</td>`).join('')}</tr>`).join('')}</tbody></table>`);});

  // Summarizer
  $('#summaryForm').addEventListener('submit',e=>{e.preventDefault();runSummary($('#youtubeUrl').value);});
  $('#demoSummary').addEventListener('click',()=>runSummary('demo'));
  async function runSummary(url){
    $('#summaryOutput').innerHTML=`<div class="summary-loading"><div class="loader-orbit"></div><strong>در حال خواندن زیرنویس و ساخت یادداشت…</strong><span>این مرحله برای ویدئوی واقعی ممکن است چند ثانیه طول بکشد.</span></div>`;
    try{const d=await api('/api/youtube-summary',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url})});renderSummary(d);}
    catch(err){$('#summaryOutput').innerHTML=`<div class="summary-error"><div class="error-icon">!</div><h3>خلاصه‌سازی انجام نشد</h3><p>${esc(err.message)}</p><code>${esc(err.cause||'ویدئو باید عمومی و دارای کپشن قابل دسترسی باشد.')}</code><button class="btn ghost small" id="errorDemo">اجرای نمونه داخلی</button></div>`;$('#errorDemo')?.addEventListener('click',()=>runSummary('demo'));}
  }
  function renderSummary(d){const s=d.summary;const copyText=[d.title,...s.bullets.map(x=>`• ${x.text}`),...s.technical_terms.map(x=>`${x.term}: ${x.definition}`)].join('\n');const thumb=d.thumbnail?(d.thumbnail.startsWith('/')?d.thumbnail:proxiedImage(d.thumbnail)):'';$('#summaryOutput').innerHTML=`<div class="summary-result-head"><div class="video-thumb">${thumb?`<img src="${esc(thumb)}" alt="${esc(d.title)}">`:icon('i-video')}</div><div><h2>${esc(d.title)}</h2><p>${esc(d.author)} · زبان کپشن: ${esc(d.language)} ${d.translated_to_fa?'· ترجمه خودکار فارسی':''}</p></div><div class="summary-actions"><button id="copySummary" title="کپی">${icon('i-source')}</button><button id="bookmarkSummary" title="نشان‌کردن">${icon('i-bookmark')}</button></div></div>
      <div class="summary-stats"><span>${fmtNum(s.word_count)} WORDS</span><span>${mmss(s.duration_seconds)}</span><span>${fmtNum(s.bullets.length)} KEY POINTS</span></div><section class="summary-section"><h3>خلاصه نکته‌ای</h3><ol class="summary-bullets">${s.bullets.map(b=>`<li>${esc(b.text)}<time>${mmss(b.start)}</time></li>`).join('')}</ol></section>
      <section class="summary-section"><h3>فصل‌بندی پیشنهادی</h3><div class="chapter-list">${s.chapters.map(c=>`<div class="chapter"><time>${mmss(c.start)}</time><span>${esc(c.title)}</span></div>`).join('')}</div></section>
      ${s.technical_terms.length?`<section class="summary-section"><h3>واژه‌نامه فنی</h3><div class="term-list">${s.technical_terms.map(t=>`<div class="term-chip"><b>${esc(t.term)}</b><span>${esc(t.definition)}</span></div>`).join('')}</div></section>`:''}<div class="summary-note">${esc(d.translation_note||d.method_note)}</div>`;
    $('#copySummary').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(copyText);toast('یادداشت کپی شد');}catch{toast('امکان کپی خودکار نبود','error');}});
    $('#bookmarkSummary').addEventListener('click',()=>{addBookmark({type:'video',id:d.video_id,title:d.title});toast('ویدئو نشان شد');});
  }

  // Tools
  function activateTool(id){$$('.tool-tabs button').forEach(b=>b.classList.toggle('active',b.dataset.tool===id));$$('.tool-panel').forEach(p=>p.classList.toggle('active',p.id===`tool-${id}`));}
  $$('.tool-tabs button').forEach(btn=>btn.addEventListener('click',()=>activateTool(btn.dataset.tool)));
  function calcOrbitTool(){const h=Math.max(0,+$('#toolAltitude').value||0),c=orbitCalc(h);$('#toolOrbitV').innerHTML=`${c.v.toFixed(4)} <span>km/s</span>`;$('#toolOrbitT').textContent=`${(c.t/60).toFixed(2)} min`;$('#toolOrbitDay').textContent=(86400/c.t).toFixed(2);$('#toolOrbitE').textContent=`${c.energy.toFixed(2)} km²/s²`;$('#toolOrbitRegime').textContent=regime(h);}
  function calcHohmann(){let r1=RE+Math.max(0,+$('#h1').value||0),r2=RE+Math.max(0,+$('#h2').value||0);const a=(r1+r2)/2,v1=Math.sqrt(MU/r1),v2=Math.sqrt(MU/r2),vt1=Math.sqrt(MU*(2/r1-1/a)),vt2=Math.sqrt(MU*(2/r2-1/a)),dv1=vt1-v1,dv2=v2-vt2,total=Math.abs(dv1)+Math.abs(dv2),time=Math.PI*Math.sqrt(a**3/MU);$('#hohmannTotal').innerHTML=`${total.toFixed(2)} <span>km/s</span>`;$('#dv1').textContent=`${dv1.toFixed(3)} km/s`;$('#dv2').textContent=`${dv2.toFixed(3)} km/s`;$('#transferTime').textContent=time<7200?`${(time/60).toFixed(1)} min`:`${(time/3600).toFixed(2)} h`;$('#transferA').textContent=`${fa.format(Math.round(a))} km`;}
  function calcRocket(){const isp=Math.max(1,+$('#isp').value||1),m0=Math.max(.001,+$('#m0').value||1),mf=Math.max(.001,+$('#mf').value||1);if(mf>=m0){toast('جرم نهایی باید از جرم اولیه کمتر باشد','error');return;}const ratio=m0/mf,ve=isp*G0,dv=ve*Math.log(ratio);$('#rocketDv').innerHTML=`${(dv/1000).toFixed(2)} <span>km/s</span>`;$('#massRatio').textContent=ratio.toFixed(3);$('#propFraction').textContent=`${((m0-mf)/m0*100).toFixed(1)}%`;$('#ve').textContent=`${(ve/1000).toFixed(2)} km/s`;}
  $('#calcOrbit').addEventListener('click',calcOrbitTool);$('#calcHohmann').addEventListener('click',calcHohmann);$('#calcRocket').addEventListener('click',calcRocket);

  // Sources
  let sourceFilter='all';
  function renderSources(){const q=$('#sourceSearch').value.trim().toLowerCase();$('#sourceGrid').innerHTML=D.sources.map(s=>{const matches=(!q||[s.name,s.org,s.type,s.note].join(' ').toLowerCase().includes(q))&&(sourceFilter==='all'||s.lang.includes(sourceFilter)||s.trust.includes(sourceFilter));return `<article class="source-card ${matches?'':'hidden-card'}"><div class="source-card-top"><div class="source-icon">${icon('i-source')}</div><div><h3>${esc(s.name)}</h3><span class="org">${esc(s.org)}</span></div><div class="source-badges"><span>${esc(s.lang)}</span><span>${esc(s.trust)}</span></div></div><p>${esc(s.note)}</p><div class="source-foot"><span>${esc(s.type)}</span><a href="${esc(s.url)}" target="_blank" rel="noreferrer">بازکردن منبع ${icon('i-external')}</a></div></article>`}).join('');}
  $('#sourceSearch').addEventListener('input',renderSources);$$('.filter-chip[data-source]').forEach(btn=>btn.addEventListener('click',()=>{sourceFilter=btn.dataset.source;$$('.filter-chip[data-source]').forEach(x=>x.classList.toggle('active',x===btn));renderSources();}));

  // Search + bookmarks
  function addBookmark(item){if(!state.bookmarks.some(x=>x.type===item.type&&x.id===item.id))state.bookmarks.push(item);localStorage.setItem('madar-bookmarks',JSON.stringify(state.bookmarks));updateBookmarkCount();}
  function updateBookmarkCount(){$('#bookmarkCount').textContent=fa.format(state.bookmarks.length);}
  $('#bookmarkBtn').addEventListener('click',()=>openModal(`<span class="modal-kicker">SAVED ITEMS</span><h2 class="modal-title">نشان‌شده‌ها</h2>${state.bookmarks.length?`<div class="modal-section"><ul>${state.bookmarks.map(x=>`<li>${esc(x.title)} <small>· ${esc(x.type)}</small></li>`).join('')}</ul></div>`:'<p class="modal-lead">هنوز موردی نشان نشده است. در خلاصه‌ساز روی آیکون نشان بزنید.</p>'}`));
  $('#globalSearch').addEventListener('keydown',e=>{if(e.key!=='Enter')return;const q=e.target.value.trim();if(!q)return;navigate('search');$('#unifiedSearchInput').value=q;performUnifiedSearch(true);setTimeout(()=>$('#unifiedSearchInput').focus(),80)});

  // PWA installation and offline status
  let deferredInstallPrompt=null;
  function updateNetworkState(){const offline=!navigator.onLine;$('#networkBanner').hidden=!offline;if(offline){$('#networkBanner strong').textContent=state.lang==='fa'?'حالت آفلاین':'Offline mode';$('#networkBanner small').textContent=state.lang==='fa'?'آخرین داده‌های معتبر نمایش داده می‌شوند.':'Showing the last verified data.'}}
  function setupPWA(){
    const installBtn=$('#installAppBtn'),standalone=window.matchMedia?.('(display-mode: standalone)').matches||window.navigator.standalone===true,isIOS=/iphone|ipad|ipod/i.test(navigator.userAgent);
    if(standalone)installBtn.hidden=true;
    window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();deferredInstallPrompt=event;if(!standalone)installBtn.hidden=false});
    window.addEventListener('appinstalled',()=>{deferredInstallPrompt=null;installBtn.hidden=true;toast(state.lang==='fa'?'مدار روی گوشی نصب شد':'Madar was installed')});
    if(isIOS&&!standalone)installBtn.hidden=false;
    installBtn.addEventListener('click',async()=>{
      if(deferredInstallPrompt){deferredInstallPrompt.prompt();const result=await deferredInstallPrompt.userChoice;if(result.outcome==='accepted')installBtn.hidden=true;deferredInstallPrompt=null;return}
      if(isIOS){openModal(`<span class="modal-kicker">INSTALL ON IOS</span><h2 class="modal-title">${state.lang==='fa'?'نصب مدار روی آیفون یا آیپد':'Install Madar on iPhone or iPad'}</h2><p class="modal-lead">${state.lang==='fa'?'این صفحه را در Safari باز کنید، دکمه Share را بزنید و سپس Add to Home Screen را انتخاب کنید.':'Open this page in Safari, tap Share, then choose Add to Home Screen.'}</p><div class="modal-grid"><div class="modal-card"><small>۱</small><strong>Safari → Share</strong></div><div class="modal-card"><small>۲</small><strong>Add to Home Screen</strong></div></div>`);return}
      toast(state.lang==='fa'?'نصب خودکار هنوز توسط مرورگر ارائه نشده است':'The browser has not offered installation yet','',state.lang==='fa'?'پس از بارگذاری کامل، منوی مرورگر را بررسی کنید.':'Check the browser menu after the page finishes loading.');
    });
    if('serviceWorker' in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('/service-worker.js',{scope:'/'}).then(reg=>{reg.update().catch(()=>{});reg.addEventListener('updatefound',()=>{const worker=reg.installing;worker?.addEventListener('statechange',()=>{if(worker.state==='installed'&&navigator.serviceWorker.controller)toast(state.lang==='fa'?'نسخه جدید مدار آماده است؛ صفحه را بازخوانی کنید':'A new Madar version is ready; reload the page')})})}).catch(()=>{});
    window.addEventListener('online',updateNetworkState);window.addEventListener('offline',updateNetworkState);updateNetworkState();
  }

  // Init
  $('#statSources').textContent=fa.format(D.sources.length);
  $('#deepCaseCount').textContent=fa.format(D.curatedFailures.length);
  setupPWA();
  renderKnowledgeLibrary();renderSearchHistory();buildSearchIndex();
  renderLearning();progressUpdate();renderStageRail();renderOrbitTabs();renderOrbitDetail();updateQuickCalc();renderFailureCases();renderLaunchers();renderSources();renderSatelliteEncyclopedia();calcOrbitTool();calcHohmann();calcRocket();updateBookmarkCount();applyLanguage(state.lang,false);loadDashboard();
  const initial=location.hash.slice(1);if(initial&&$(`#view-${initial}`))navigate(initial);else navigate('dashboard');
})();
