const fs=require('fs'),vm=require('vm'),ts=require('typescript'),assert=require('node:assert/strict');
const {stripTypeScriptTypes}=require('node:module');
const cache={};function load(name){if(cache[name])return cache[name];const module={exports:{}};let code=stripTypeScriptTypes(fs.readFileSync('src/lib/'+name+'.ts','utf8'));const names=[...code.matchAll(/export (?:const|function) (\w+)/g)].map(m=>m[1]);code=code.replace(/import \{ ([^}]+) \} from '([^']+)';/g,(_,n,p)=>`const {${n}} = require('${p}');`).replace(/export /g,'');code+='\nObject.assign(module.exports,{'+names.join(',')+'});';vm.runInNewContext(code,{module,exports:module.exports,require:p=>load(p.replace('./','')),globalThis,console});return cache[name]=module.exports;}

const {SCENES,EXECUTIVE}=load('scenes'),{SAMPLES,PRIMARY_TERRITORIES,SEEDS,MISSIONS,EVENT,ROSS_GOAL,SOURCES,DIRECTIONS,RUN,TOPICS,OBJECTIVES}=load('content'),{fold}=load('state');
// The run of show: eighteen slides for Ross's four objectives, discussion first. No part dividers: the first slide of
// each part carries its objective tag. Phone votes on the trends, the tasting and the next round.
const ids=SCENES.map(s=>s.id),at=(id)=>ids.indexOf(id),room=(id)=>SCENES.find(s=>s.id===id).room,sc=(id)=>SCENES.find(s=>s.id===id);
assert.equal(SCENES.length,18);
assert.equal(ids.join(),'arrival,team,ours,brief,prework,gap,market,signals,school,map,film,tasting,nextround,whitespace,concepts,board,playbook,lunch','the eighteen slides, in order');
assert.equal(at('film'),10,'THE FLAVOR RACE is slide 11');assert.equal(at('film'),at('tasting')-1,'THE FLAVOR RACE plays right before the tasting');
for(const id of ['title','july','thesis','open1','open2','open3','open4','portfolio','signalvote','cooling','oxyd','anatomy','platform1','platform2','platform3','platform4','matrix','dots','next'])assert(!ids.includes(id),'merged or cut slide still live: '+id);
assert.equal(room('signals').kind,'pick');assert.equal(room('signals').key,'signals');assert.equal(room('signals').max,3);assert.equal(room('tasting').kind,'taste');assert.equal(room('nextround').kind,'chips');assert.equal(room('nextround').key,'directions');assert.equal(room('nextround').total,5);
assert(!SCENES.some(s=>s.room.kind==='dots'),'no dot vote on the day');
assert.equal(String(sc('team').skip),'1','the July row is the optional build');assert.equal(String(sc('map').skip),'2,3','the two untasted directions are optional');assert.equal(sc('map').builds,4);assert.equal(sc('gap').builds,3);assert.equal(sc('signals').builds,3);assert.equal(sc('school').builds,2);assert.equal(sc('playbook').builds,7);
assert(SCENES.every(s=>!s.optional),'no whole slide is optional: the short version skips builds');
const {firstOfPart}=load('scenes');assert.equal(SCENES.filter(firstOfPart).map(s=>s.id+':'+s.chapter).join(),'gap:0,school:1,whitespace:2,board:3','objective tags on the first slide of each part');
assert(EXECUTIVE.every(id=>ids.includes(id)),'executive cut names a missing scene');assert(SCENES.every(s=>RUN.some(b=>b.id===s.block)),'scene outside the run of show');assert.equal(TOPICS.length,4);assert.equal(OBJECTIVES.length,4);
assert(DIRECTIONS.length>=4&&SAMPLES.every(s=>DIRECTIONS.some(d=>d.id===s.code||d.id===s.id)),'every sample is a direction to vote on');
assert.equal(EVENT.code,'FOF1109');assert(EVENT.lockup.includes('Princeton, New Jersey'));assert(SOURCES[ROSS_GOAL.src]);assert(SAMPLES.every(s=>s.base));
assert.equal(PRIMARY_TERRITORIES.length,4);assert.equal(MISSIONS.length,2);assert.equal(SAMPLES.length,4);assert.equal(SAMPLES.map(s=>s.code).join(''),'ABCD');assert.equal(load('sealed').SEALED.samples[SAMPLES.find(s=>s.mystery).code].name,'Mystery Flavor');assert.equal(SAMPLES.filter(s=>s.mystery).length,1);assert.equal(new Set(SCENES.map(s=>s.id)).size,SCENES.length);assert(SCENES.every(s=>s.title&&s.room));assert(SAMPLES.every(s=>PRIMARY_TERRITORIES.some(t=>t.id===s.territory)));assert(SEEDS.every(s=>PRIMARY_TERRITORIES.some(t=>t.id===s.territory)));
const events=[{id:'1',t:1,kind:'rate',pid:'p',data:{sample:'D',appeal:4,feels:4,newness:5,who:['Families'],fruitGuess:'apple, grape',advance:'Yes'}},{id:'2',t:2,kind:'commitment',data:{ref:'workshop-D',fields:{owner:'Test owner',date:'2026-12-01'}}},{id:'3',t:3,kind:'commitment',data:{ref:'workshop-D',fields:{action:'Revise sweetness'}}}];
const state=fold(events);assert.equal(state.ratings.D.p.fruitGuess,'apple, grape');assert.equal(state.ratings.D.p.advance,'Yes');assert.equal(state.commitments['workshop-D'].owner,'Test owner');assert.equal(state.commitments['workshop-D'].action,'Revise sweetness');assert.equal(state.commitments['workshop-D'].date,'2026-12-01');
const live=fold([{id:'4',t:4,kind:'board',data:{horizon:'now',text:'Sample A, second round'}},{id:'5',t:5,kind:'mark',data:{cell:'am|loyal'}},{id:'6',t:6,kind:'mark',data:{cell:'pm|new'}},{id:'7',t:7,kind:'mark',data:{cell:'am|loyal'}},{id:'8',t:8,kind:'goto',data:{scene:3,step:1}}]);
assert.equal(live.board.now,'Sample A, second round');assert.equal(live.marks.join(),'pm|new');assert.equal(live.scene,3);assert.equal(live.step,1);assert.equal(live.sceneId,undefined,'a move without a slide name names no slide');
// A move names its slide: the name wins over the position, so a position from the old 36-slide order never steers the
// room, and nothing resumes from a move that names no slide.
const named=fold([{id:'g1',t:1,kind:'goto',data:{scene:24,step:2}},{id:'g2',t:2,kind:'goto',data:{scene:0,step:1,id:'tasting'}}]);assert.equal(named.scene,at('tasting'));assert.equal(named.sceneId,'tasting');assert.equal(named.step,1);
const old=fold([{id:'o1',t:1,kind:'goto',data:{scene:30,step:3}}]);assert.equal(old.sceneId,undefined);assert.equal(old.scene,SCENES.length-1);
const unknown=fold([{id:'u1',t:1,kind:'goto',data:{scene:2,step:0,id:'signalvote'}}]);assert.equal(unknown.sceneId,undefined);assert.equal(unknown.scene,2);
// the plan rows, hand votes taken back and a paper card removed
const plan=fold([{id:'p1',t:10,kind:'plan',data:{id:'r1',h:'Now',fields:{what:'Sample A, second round'}}},{id:'p2',t:11,kind:'plan',data:{id:'r1',fields:{owner:'Test owner',next:'Two versions'}}},{id:'p3',t:12,kind:'plan',data:{id:'r2',h:'Next',fields:{what:'Gone'}}},{id:'p4',t:13,kind:'unplan',data:{id:'r2'}},{id:'p5',t:14,kind:'plan',data:{id:'r1',h:'Future'}},
  {id:'h1',t:15,kind:'pick',pid:'hand-1',data:{key:'signals',value:['mild'],paper:true}},{id:'h2',t:16,kind:'pick',pid:'hand-2',data:{key:'signals',value:['mild'],paper:true}},{id:'h3',t:17,kind:'unpick',pid:'hand-1',data:{key:'signals'}},
  {id:'c1',t:18,kind:'rate',pid:'paper-1',data:{sample:'A',appeal:3,feels:3,newness:3,who:[]}},{id:'c2',t:19,kind:'rate',pid:'paper-1',data:{sample:'B',appeal:3,feels:3,newness:3,who:[]}},{id:'c3',t:20,kind:'unrate',pid:'paper-1',data:{sample:'A'}}]);
assert.deepEqual(Object.keys(plan.plan),['r1']);assert.equal(plan.plan.r1.h,'Future');assert.equal(plan.plan.r1.what,'Sample A, second round');assert.equal(plan.plan.r1.owner,'Test owner');
assert.deepEqual(Object.keys(plan.votes.signals.picks),['hand-2']);assert.ok(!plan.ratings.A['paper-1']);assert.ok(plan.ratings.B['paper-1']);
// Nothing typed on the day: the concept library and its option lists, the paper card counter, and plan lines placed by
// tapping (with the concept or direction they came from, and a drafted brief that runs longer than the other fields).
const L=load('conceptLibrary');
assert.equal(L.WHO.length,6);assert.equal(L.WHEN.length,5);assert.equal(L.ROLE.join(),'Core range,Limited edition,New sub-line,Kids range');assert.equal(L.FORMAT.length,5);assert.equal(L.GROWS.join(),'Loyal users,New users,Both');
assert.equal(L.STARTS.length,8,'four samples and four directions');assert.equal(L.TESTS.length,5);assert.equal(L.OWNERS.join(),'Dan,Alex,Ryan,Matt');assert.equal(L.DUE_DEFAULT,'January 2027 review');assert(L.STEPS.includes('To confirm')&&L.DUES.includes('To confirm'));
assert(L.LIBRARY.length>=10&&L.LIBRARY.every(c=>c.status==='DRAFT'),'every drafted card is marked DRAFT');
for(const c of L.LIBRARY){assert(L.STARTS.some(x=>x.id===c.start),c.id+' starts somewhere real');assert(L.WHO.includes(c.segment)&&L.WHEN.includes(c.occasion)&&L.ROLE.includes(c.role)&&L.FORMAT.includes(c.format)&&L.GROWS.includes(c.incremental),c.id+' uses the option lists');}
assert(DIRECTIONS.every(d=>L.cardFor(d.id)),'every chips option has a starter card');assert(Object.values(L.MOMENT_WHEN).every(w=>L.WHEN.includes(w)));
const pc=fold([{id:'q1',t:1,kind:'papercard',data:{d:1}},{id:'q2',t:2,kind:'papercard',data:{d:1}},{id:'q3',t:3,kind:'papercard',data:{d:-1}},{id:'q4',t:4,kind:'papercard',data:{d:-1}},{id:'q5',t:5,kind:'papercard',data:{d:-1}},{id:'q6',t:6,kind:'papercard',data:{d:1}}]);assert.equal(pc.paperCards,1,'the count never goes below zero');assert.equal(fold([]).paperCards,0);
const tap=fold([{id:'t1',t:1,kind:'plan',data:{id:'r9',h:'Next',fields:{what:'Grove',ref:'D',draft:'1',brief:'x'.repeat(400),due:'January 2027 review'}}}]);assert.equal(tap.plan.r9.ref,'D');assert.equal(tap.plan.r9.draft,'1');assert.equal(tap.plan.r9.brief.length,400);assert.equal(tap.plan.r9.due,'January 2027 review');
// The slide-by-slide plan: every scene has one, each part's minutes fill its window exactly, and no slide lists more
// clicks than it has builds.
const {SLIDES}=load('runNotes'),{SLIDE_MIN,SLIDE_TIMES}=load('slideTimes');const mm=(t)=>{const [h,m]=t.split(':').map(Number);return h*60+m;};
assert(SCENES.every(s=>SLIDES[s.id]&&SLIDE_TIMES[s.id]&&s.id in SLIDE_MIN),'a scene has no slide plan');
for(const b of RUN){const sum=SCENES.filter(s=>s.block===b.id).reduce((n,s)=>n+SLIDE_MIN[s.id],0);assert.equal(sum,mm(b.end)-mm(b.t),'slide minutes for '+b.id+' do not fill '+b.t+' to '+b.end);}
assert(SCENES.every(s=>!SLIDES[s.id].clicks||SLIDES[s.id].clicks.length<=s.builds+1),'a slide lists more clicks than builds');
const T={arrival:'10:00',team:'10:01',ours:'10:03',brief:'10:04',prework:'10:06',gap:'10:10',market:'10:13',signals:'10:16',school:'10:25',map:'10:29',film:'10:37',tasting:'10:40',nextround:'10:53',whitespace:'11:00',concepts:'11:05',board:'11:20',playbook:'11:40',lunch:'11:48'};
for(const [id,t] of Object.entries(T))assert.equal(SLIDE_TIMES[id].from,t,id+' starts at '+t);assert.equal(SLIDE_TIMES.lunch.to,'12:00');
console.log('PASS: run of show and slide plan ('+SCENES.length+' slides), slide names on every move, optional builds, objective tags, phone votes, lineup, Mystery Flavor, commitments, board, plan rows, hand votes, paper cards, the concept library, tap-only plan lines and white-space marks.');
