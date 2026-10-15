import fs from 'node:fs'
import {pathToFileURL,fileURLToPath} from 'node:url'
import {createRequire} from 'node:module'
const plugin=fileURLToPath(new URL('../index.js',import.meta.url))
const require=createRequire(pathToFileURL(plugin))
let source=fs.readFileSync(process.env.EVAL_SOURCE||plugin,'utf8')
source=source.replace(/from '(@deepseek-ai\/[^']+)'/g,(_,specifier)=>"from '"+pathToFileURL(require.resolve(specifier)).href+"'")
const {apply,isComplexTask}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'))
const out=[]
function setup(config={},initialPlan=false){let active=initialPlan,goal;const handlers=new Map();let policy='';const events=[];const agent={session:{events},ctx:{get(){return {get(){return {active}},set(_agent,value){active=value}}}}};apply({systemPrompt:{section(x){policy=x.text}},get(n){if(n==='goals')return {get(){return goal}}},on(n,h){handlers.set(n,h)}},config);return {agent,handlers,events,get active(){return active},set active(x){active=x},set goal(x){goal=x},get policy(){return policy}}}
const human=(text,id='u1')=>({id,role:'user',source:{kind:'user'},content:[{type:'text',text}]})
const pre=(x,m,step=1)=>x.handlers.get('agent/pre-step')({agent:x.agent,messages:m,turn:1,step,signal:new AbortController().signal},async()=>({kind:'enter',messages:[]}))
const run=(x,name,args={})=>x.handlers.get('tools/pre-execute')({agent:x.agent,name,arguments:args},async()=>({kind:'allow'}))
const post=(x,result,name='grep')=>x.handlers.get('tools/post-execute')({agent:x.agent,name},result,async()=>({kind:'allow'}))
const fail=(msg)=>({isError:true,error:{message:msg,info:{code:'SEARCH_FAILED'}}})
function record(id,observed){out.push({id,...observed})}
{
 const x=setup();await pre(x,[human('Fix a typo.')]);record('simple_request',{autoPlan:x.active})
}
{
 const x=setup();await pre(x,[human('Implement a multi-file feature and verify it.')]);record('complex_request',{autoPlan:x.active})
}
{
 const x=setup();await pre(x,[human('Implement a multi-file feature and verify it. No plan, execute directly.')]);record('explicit_no_plan',{autoPlan:x.active})
}
{
 const x=setup();const m=[human('Implement a multi-file feature and verify it.'),human('Just answer: what does this error mean?','u2')];await pre(x,m);record('simple_followup_after_complex_history',{autoPlan:x.active,classification:isComplexTask(m.map(a=>a.content[0].text).join('\n'))})
}
{
 const x=setup();await post(x,fail('missing path A'));const d=await post(x,fail('missing path B'));record('different_causes_same_error_code',{notices:d.additionalContexts?.length??0,source:d.additionalContexts?.[0]?.source})
}
{
 const x=setup();await post(x,fail('missing path'));await post(x,{isError:false});const d=await post(x,fail('missing path'));record('failure_success_failure',{notices:d.additionalContexts?.length??0})
}
{
 const x=setup({},true);let allowed=0;for(let i=0;i<12;i++){const d=await run(x,'read',{path:'distinct-file-'+i});allowed+=d.kind==='allow'};const d=await run(x,'read',{path:'decisive-config'});record('thirteenth_distinct_plan_read',{allowedBefore:allowed,result:d.kind})
}
{
 const x=setup({},true);for(let i=0;i<12;i++)await run(x,'read');record('budget_exit_tools',{exitPlan:(await run(x,'exit_plan_mode')).kind,question:(await run(x,'ask_user_question')).kind})
}
{
 const x=setup();await post(x,{isError:false},'exit_plan_mode');record('goal_gate',{write:(await run(x,'write')).kind});x.goal={id:'goal',phase:'active'};record('todo_gate',{write:(await run(x,'write')).kind});x.events.push({type:'goal/change',data:{goal:{id:'goal'},operation:'create'}},{type:'todo/write',data:{}});record('goal_and_todo_present',{write:(await run(x,'write')).kind})
}
{
 const x=setup();await post(x,{isError:false},'exit_plan_mode');record('shell_mutation_gate',{touch:(await run(x,'bash',{command:'touch sample.txt'})).kind,powershellWrite:(await run(x,'bash',{command:'Set-Content -LiteralPath sample.txt -Value example'})).kind,pythonWrite:(await run(x,'bash',{command:'python -c "open(\'sample.txt\',\'w\').write(\'example\')"'})).kind})
}
{
 const x=setup();const d=await pre(x,[],12);record('periodic_notice',{source:d.messages[0]?.source,chars:d.messages[0]?.content[0].text.length,policyChars:x.policy.length,policyUtf8Bytes:Buffer.byteLength(x.policy),hasEmpiricalEfficiencyMetric:/benchmark|A\/B|success rate|token savings/i.test(x.policy)})
}
{
 const x=setup({},true),m=[human('Fix a typo.')];let denied=0;for(let step=1;step<=15;step++){await pre(x,m,step);denied+=(await run(x,'read',{path:'file-'+step})).kind==='deny'};record('fifteen_plan_reads_across_fifteen_steps',{denied})
}
const result={source:'public index.js v0.1.2',date:'2026-10-15',method:'Offline deterministic hook tests of actual public source; no model calls, no causal task-efficiency A/B.',cases:out};fs.writeFileSync(new URL(process.env.EVAL_OUTPUT||'./evaluation-results.json',import.meta.url),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2))
