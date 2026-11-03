const fs=require('fs'),vm=require('vm'),ts=require('typescript'),assert=require('node:assert/strict');
const {stripTypeScriptTypes}=require('node:module');
const cache={};function load(name){if(cache[name])return cache[name];const module={exports:{}};let code=stripTypeScriptTypes(fs.readFileSync('src/lib/'+name+'.ts','utf8'));const names=[...code.matchAll(/export (?:const|function) (\w+)/g)].map(m=>m[1]);code=code.replace(/import \{ ([^}]+) \} from '([^']+)';/g,(_,n,p)=>`const {${n}} = require('${p}');`).replace(/export /g,'');code+='\nObject.assign(module.exports,{'+names.join(',')+'});';vm.runInNewContext(code,{module,exports:module.exports,require:p=>load(p.replace('./','')),globalThis,console});return cache[name]=module.exports;}

const {SCENES,EXECUTIVE,MAIN,BACKUP,LAST_MAIN,SECTIONS}=load('scenes'),{SAMPLES,PRIMARY_TERRITORIES,SEEDS,MISSIONS,EVENT,ROSS_GOAL,SOURCES,DIRECTIONS,RUN,TOPICS,OBJECTIVES,TREND_TALKS,SIGNALS,AGENDA_RUN,PART_BLOCKS}=load('content'),{fold}=load('state');
// The simplified run of show: three parts around Ross's four objectives, eight blocks from 10:00 to 12:00, the phones
// scoring the tasting and voting once (the chips), and the detailed slides kept as backup after the thank-you card.
const ids=SCENES.map(s=>s.id),at=(id)=>ids.indexOf(id),room=(id)=>SCENES.find(s=>s.id===id).room,main=MAIN.map(s=>s.id);
assert.equal(ids[0],'arrival');assert.equal(ids[1],'title');assert.equal(main.slice(-3).join(),'playbook,next,lunch');assert.equal(SCENES[LAST_MAIN].id,'lunch');
assert.equal(main.join(),'arrival,title,team,brief,prework,thesis,open1,gap,portfolio,market,trends,directions,open2,film,basics,tasting,matrix,react,nextround,open3,develop,playbook,next,lunch','the main flow');
assert(SCENES.slice(0,MAIN.length).every(s=>!s.backup)&&SCENES.slice(MAIN.length).every(s=>s.backup),'backup slides come after the main flow');
for(const id of ['july','signals','signalvote','school','cooling','oxyd','anatomy','map','platform1','platform2','platform3','platform4','concepts','dots','whitespace','board'])assert(BACKUP.some(s=>s.id===id),'missing backup slide '+id);
for(const id of ['chips','canvas','bench','pipeline','assemble','climb','code','open4'])assert(!ids.includes(id),'cut scene still live: '+id);
assert.equal(at('film'),at('basics')-1,'THE FLAVOR RACE plays right before the tasting');assert.equal(at('basics'),at('tasting')-1);assert.equal(at('open2'),at('film')-1);
assert.equal(at('matrix'),at('tasting')+1);assert.equal(at('react'),at('matrix')+1);assert.equal(at('nextround'),at('react')+1);assert.equal(at('develop'),at('open3')+1);
assert.equal(SCENES.find(s=>s.id==='trends').builds,TREND_TALKS.length);assert.equal(TREND_TALKS.length,3);
assert.equal([...TREND_TALKS.flatMap(t=>t.signals)].sort().join(),SIGNALS.map(s=>s.id).sort().join(),'the three conversations cover all seven trends once');
assert.equal(room('tasting').kind,'taste');assert.equal(room('nextround').kind,'chips');assert.equal(room('nextround').key,'directions');assert.equal(room('nextround').total,5);
assert.equal(MAIN.filter(s=>!['watch','thanks'].includes(s.room.kind)).map(s=>s.id).join(),'tasting,nextround','phones score the tasting and vote once in the main flow');
assert.equal(room('signalvote').kind,'pick');assert.equal(room('dots').kind,'dots');
assert(EXECUTIVE.every(id=>ids.includes(id)),'executive cut names a missing scene');assert(MAIN.every(s=>RUN.some(b=>b.id===s.block)),'scene outside the run of show');assert(BACKUP.every(s=>s.block==='backup'&&s.chapter===-1));
assert(SECTIONS.every(id=>main.includes(id)),'a ] stop is not in the main flow');
assert.equal(TOPICS.length,3);assert.equal(OBJECTIVES.length,4);assert.equal(OBJECTIVES.map(o=>o.part).join(),'0,1,2,2');assert.equal(PART_BLOCKS.length,3);
assert(MAIN.filter(s=>s.chapter>=0).every(s=>s.chapter<3));
assert.equal(RUN.map(b=>b.t+'-'+b.end).join(),'10:00-10:10,10:10-10:22,10:22-10:25,10:25-11:00,11:00-11:20,11:20-11:40,11:40-11:50,11:50-12:00','the eight blocks');
for(let i=1;i<RUN.length;i++)assert.equal(RUN[i].t,RUN[i-1].end,'blocks run back to back');
assert.equal(AGENDA_RUN.map(b=>b.id).join(),RUN.filter(b=>b.id!=='film').map(b=>b.id).join(),'THE FLAVOR RACE stays off the attendee agenda');
assert.equal(RUN.flatMap(b=>b.obj||[]).sort().join(),'01,02,03,04','every objective is answered once');
assert(DIRECTIONS.length>=4&&SAMPLES.every(s=>DIRECTIONS.some(d=>d.id===s.code||d.id===s.id)),'every sample is a direction to vote on');
assert.equal(EVENT.code,'FOF1109');assert(EVENT.lockup.includes('Princeton, New Jersey'));assert(SOURCES[ROSS_GOAL.src]);assert(SAMPLES.every(s=>s.base));
assert.equal(PRIMARY_TERRITORIES.length,4);assert.equal(MISSIONS.length,2);assert.equal(SAMPLES.length,4);assert.equal(SAMPLES.map(s=>s.code).join(''),'ABCD');assert.equal(load('sealed').SEALED.samples[SAMPLES.find(s=>s.mystery).code].name,'Mystery Flavor');assert.equal(SAMPLES.filter(s=>s.mystery).length,1);assert.equal(new Set(SCENES.map(s=>s.id)).size,SCENES.length);assert(SCENES.every(s=>s.title&&s.room));assert(SAMPLES.every(s=>PRIMARY_TERRITORIES.some(t=>t.id===s.territory)));assert(SEEDS.every(s=>PRIMARY_TERRITORIES.some(t=>t.id===s.territory)));
const events=[{id:'1',t:1,kind:'rate',pid:'p',data:{sample:'D',appeal:4,feels:4,newness:5,who:['Families'],fruitGuess:'apple, grape',advance:'Yes'}},{id:'2',t:2,kind:'commitment',data:{ref:'workshop-D',fields:{owner:'Test owner',date:'2026-12-01'}}},{id:'3',t:3,kind:'commitment',data:{ref:'workshop-D',fields:{action:'Revise sweetness'}}}];
const state=fold(events);assert.equal(state.ratings.D.p.fruitGuess,'apple, grape');assert.equal(state.ratings.D.p.advance,'Yes');assert.equal(state.commitments['workshop-D'].owner,'Test owner');assert.equal(state.commitments['workshop-D'].action,'Revise sweetness');assert.equal(state.commitments['workshop-D'].date,'2026-12-01');
const live=fold([{id:'4',t:4,kind:'board',data:{horizon:'now',text:'Sample A, second round'}},{id:'5',t:5,kind:'mark',data:{cell:'am|loyal'}},{id:'6',t:6,kind:'mark',data:{cell:'pm|new'}},{id:'7',t:7,kind:'mark',data:{cell:'am|loyal'}},{id:'8',t:8,kind:'goto',data:{scene:3,step:1}}]);
assert.equal(live.board.now,'Sample A, second round');assert.equal(live.marks.join(),'pm|new');assert.equal(live.scene,3);assert.equal(live.step,1);
// the plan rows, hand votes taken back and a paper card removed
const plan=fold([{id:'p1',t:10,kind:'plan',data:{id:'r1',h:'Now',fields:{what:'Sample A, second round'}}},{id:'p2',t:11,kind:'plan',data:{id:'r1',fields:{owner:'Test owner',next:'Two versions'}}},{id:'p3',t:12,kind:'plan',data:{id:'r2',h:'Next',fields:{what:'Gone'}}},{id:'p4',t:13,kind:'unplan',data:{id:'r2'}},{id:'p5',t:14,kind:'plan',data:{id:'r1',h:'Future'}},
  {id:'h1',t:15,kind:'pick',pid:'hand-1',data:{key:'signals',value:['mild'],paper:true}},{id:'h2',t:16,kind:'pick',pid:'hand-2',data:{key:'signals',value:['mild'],paper:true}},{id:'h3',t:17,kind:'unpick',pid:'hand-1',data:{key:'signals'}},
  {id:'c1',t:18,kind:'rate',pid:'paper-1',data:{sample:'A',appeal:3,feels:3,newness:3,who:[]}},{id:'c2',t:19,kind:'rate',pid:'paper-1',data:{sample:'B',appeal:3,feels:3,newness:3,who:[]}},{id:'c3',t:20,kind:'unrate',pid:'paper-1',data:{sample:'A'}}]);
assert.deepEqual(Object.keys(plan.plan),['r1']);assert.equal(plan.plan.r1.h,'Future');assert.equal(plan.plan.r1.what,'Sample A, second round');assert.equal(plan.plan.r1.owner,'Test owner');
assert.deepEqual(Object.keys(plan.votes.signals.picks),['hand-2']);assert.ok(!plan.ratings.A['paper-1']);assert.ok(plan.ratings.B['paper-1']);
// The slide-by-slide plan: every scene has one, each part's minutes fill its window exactly, and no slide lists more
// clicks than it has builds.
const {SLIDES}=load('runNotes'),{SLIDE_MIN,SLIDE_TIMES}=load('slideTimes');const mm=(t)=>{const [h,m]=t.split(':').map(Number);return h*60+m;};
assert(SCENES.every(s=>SLIDES[s.id]),'a scene has no slide plan');assert(MAIN.every(s=>SLIDE_TIMES[s.id]&&s.id in SLIDE_MIN),'a main slide has no planned time');assert(BACKUP.every(s=>!(s.id in SLIDE_MIN)),'a backup slide has planned time');
for(const b of RUN){const sum=MAIN.filter(s=>s.block===b.id).reduce((n,s)=>n+SLIDE_MIN[s.id],0);assert.equal(sum,mm(b.end)-mm(b.t),'slide minutes for '+b.id+' do not fill '+b.t+' to '+b.end);}
assert(SCENES.every(s=>!SLIDES[s.id].clicks||SLIDES[s.id].clicks.length<=s.builds+1),'a slide lists more clicks than builds');
assert.equal(SLIDE_TIMES.film.from,'10:22');assert.equal(SLIDE_TIMES.film.to,'10:25');assert.equal(SLIDE_TIMES.basics.from,'10:25');assert.equal(SLIDE_TIMES.tasting.to,'11:00');assert.equal(SLIDE_TIMES.react.from,'11:03');assert.equal(SLIDE_TIMES.nextround.to,'11:20');assert.equal(SLIDE_TIMES.develop.to,'11:40');assert.equal(SLIDE_TIMES.next.to,'11:50');assert.equal(SLIDE_TIMES.lunch.to,'12:00');
// What the room would keep and change goes in as notes, and the explore-later list is plan rows under Later.
const kc=fold([{id:'k1',t:1,kind:'note',data:{key:'keep-A',text:'The fruit'}},{id:'k2',t:2,kind:'note',data:{key:'change-A',text:'Less sweet'}},{id:'k3',t:3,kind:'plan',data:{id:'w1',h:'Now',fields:{what:'Idea one',who:'Families, evening',brief:'Fruit first',test:'Lower sweetness',step:'Two versions',due:'Mid-December'}}},{id:'k4',t:4,kind:'plan',data:{id:'l1',h:'Future',fields:{what:'Later idea'}}}]);
assert.equal(kc.notes['keep-A'],'The fruit');assert.equal(kc.notes['change-A'],'Less sweet');assert.equal(kc.plan.w1.due,'Mid-December');assert.equal(kc.plan.l1.h,'Future');
console.log('PASS: run of show and slide plan ('+MAIN.length+' slides in the morning, '+BACKUP.length+' backup), phone votes, lineup, Mystery Flavor, commitments, plan rows, keep and change, hand votes, paper cards and white-space marks.');
