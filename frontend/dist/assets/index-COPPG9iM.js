var st=Object.defineProperty;var it=(e,a,t)=>a in e?st(e,a,{enumerable:!0,configurable:!0,writable:!0,value:t}):e[a]=t;var k=(e,a,t)=>it(e,typeof a!="symbol"?a+"":a,t);(function(){const a=document.createElement("link").relList;if(a&&a.supports&&a.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))r(n);new MutationObserver(n=>{for(const s of n)if(s.type==="childList")for(const i of s.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&r(i)}).observe(document,{childList:!0,subtree:!0});function t(n){const s={};return n.integrity&&(s.integrity=n.integrity),n.referrerPolicy&&(s.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?s.credentials="include":n.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function r(n){if(n.ep)return;n.ep=!0;const s=t(n);fetch(n.href,s)}})();const ee="".replace(/\/$/,"");async function x(e){const a=await fetch(`${ee}${e}`,{headers:{Accept:"application/json"}});if(!a.ok)throw new Error(`${a.status} ${a.statusText}`);return await a.json()}async function Te(e,a){const t=await fetch(`${ee}${e}`,{method:"POST",headers:{Accept:"application/json","Content-Type":"application/json"},body:JSON.stringify(a)});if(!t.ok)throw new Error(`${t.status} ${t.statusText}`);return await t.json()}async function ot(e){const a=await fetch(`${ee}${e}`,{headers:{Accept:"application/json"}});if(!a.ok)throw new Error(`${a.status} ${a.statusText}`);return await a.json()}async function lt(){return x("/api/schemas/hashes")}async function te(){return x("/api/schemas/all")}async function Le(){return x("/api/presets")}async function ct(){return x("/api/config/saved_params")}async function dt(){return x("/api/config/summary")}async function ae(){return x("/api/tasks")}async function Ae(e){return x(`/api/tasks/terminate/${e}`)}async function Pe(){return x("/api/graphic_cards")}async function Ee(){return ot("/api/tageditor_status")}async function ut(){return x("/api/scripts")}async function pt(e){return Te("/api/dataset/analyze",e)}async function Ne(e){var t;const a=await x(`/api/pick_file?picker_type=${encodeURIComponent(e)}`);if(a.status!=="success"||!((t=a.data)!=null&&t.path))throw new Error(a.message||"File picker did not return a path.");return a.data.path}async function ht(e){return Te("/api/run",e)}function p(e,a){const t=document.querySelector(`#${e}`);t&&(t.textContent=a)}function m(e,a){const t=document.querySelector(`#${e}`);t&&(t.innerHTML=a)}function I(e,a){const t=document.querySelector(`#${e}`);t&&(t.textContent=a)}const De=[{route:"index.html",title:"SD-reScripts | SD training UI",section:"core",status:"migrate-first",notes:"Landing page and main navigation entry. Good first candidate for source migration."},{route:"lora/index.html",title:"LoRA training index",section:"training",status:"migrate-first",notes:"Top-level training model selector page.",schemaHints:["shared"]},{route:"lora/sdxl.html",title:"SDXL LoRA training",section:"training",status:"migrate-first",notes:"Primary training page currently used most often.",schemaHints:["sdxl-lora","shared"]},{route:"lora/flux.html",title:"Flux LoRA training",section:"training",status:"migrate-first",notes:"Now mirrored by the shared source-side training bridge.",schemaHints:["flux-lora","shared"]},{route:"lora/sd3.html",title:"SD3 training",section:"training",status:"migrate-first",notes:"Now mirrored by the shared source-side training bridge.",schemaHints:["sd3-lora","shared"]},{route:"lora/controlnet.html",title:"SD ControlNet training",section:"training",status:"migrate-first",notes:"Now mirrored by the shared source-side training bridge.",schemaHints:["sd-controlnet","shared"]},{route:"lora/sdxl-controlnet.html",title:"SDXL ControlNet training",section:"training",status:"migrate-first",notes:"Now mirrored by the shared source-side training bridge.",schemaHints:["sdxl-controlnet","shared"]},{route:"lora/sdxl-lllite.html",title:"SDXL LLLite training",section:"training",status:"migrate-first",notes:"Specialized SDXL conditioning route now mirrored by the shared source-side bridge.",schemaHints:["sdxl-controlnet-lllite","shared"]},{route:"lora/flux-controlnet.html",title:"Flux ControlNet training",section:"training",status:"migrate-first",notes:"Now mirrored by the shared source-side training bridge.",schemaHints:["flux-controlnet","shared"]},{route:"lora/basic.html",title:"LoRA basic mode",section:"training",status:"legacy-dist",notes:"Legacy beginner-mode training route.",schemaHints:["lora-basic","shared"]},{route:"lora/master.html",title:"LoRA expert mode",section:"training",status:"legacy-dist",notes:"Legacy expert-mode training route.",schemaHints:["lora-master","shared"]},{route:"lora/params.html",title:"Training parameter reference",section:"training",status:"migrate-first",notes:"Mostly explanatory UI. Lower risk to recreate cleanly."},{route:"lora/tools.html",title:"LoRA tools",section:"tools",status:"migrate-first",notes:"Tool launcher route for merge, resize, interrogate and conversion flows."},{route:"dreambooth/index.html",title:"Dreambooth training",section:"training",status:"migrate-first",notes:"Now mirrored by the shared source-side training bridge for Dreambooth and SDXL full finetune.",schemaHints:["dreambooth","shared"]},{route:"tagger.html",title:"Tagger tool",section:"tools",status:"migrate-first",notes:"Standalone caption/tag generation route that talks to backend APIs.",schemaHints:["tagger"]},{route:"tageditor.html",title:"Tag editor proxy page",section:"tools",status:"migrate-first",notes:"Wrapper page with progress/failure states. Good candidate to reimplement cleanly."},{route:"task.html",title:"Task monitor",section:"system",status:"migrate-first",notes:"Task status page backed by /api/tasks."},{route:"tensorboard.html",title:"TensorBoard proxy page",section:"system",status:"migrate-first",notes:"Wrapper/proxy page. Safer than schema-heavy form routes."},{route:"other/settings.html",title:"Settings page",section:"system",status:"migrate-first",notes:"Static/system page that should be easy to recreate in source form."},{route:"other/about.html",title:"About page",section:"core",status:"migrate-first",notes:"Mostly branding and release notes. Best low-risk migration target."},{route:"404.html",title:"Fallback page",section:"core",status:"legacy-dist",notes:"Can be replaced after the main router is rebuilt."}];function c(e){return String(e).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;")}function B(e){return JSON.parse(JSON.stringify(e))}function Ce(e=new Date){return e.toISOString().replaceAll(":","-").replaceAll(".","-")}function mt(e){if(e.length===0){m("schema-browser","<p>No schemas returned.</p>");return}const a=e.map(t=>{var n;const r=((n=t.schema.split(/\r?\n/).find(s=>s.trim().length>0))==null?void 0:n.trim())||"No preview available.";return`
        <article class="schema-card">
          <div class="schema-head">
            <h3>${c(t.name)}</h3>
            <span class="schema-hash">${c(t.hash.slice(0,8))}</span>
          </div>
          <p>${c(r)}</p>
        </article>
      `}).join("");m("schema-browser",a)}function ft(e){const a=new Set(De.flatMap(s=>s.schemaHints??[])),t=new Set(e.map(s=>s.name)),r=[...a].filter(s=>t.has(s)).sort(),n=e.map(s=>s.name).filter(s=>!a.has(s)).sort();m("schema-mapped",r.length?r.map(s=>`<span class="coverage-pill">${c(s)}</span>`).join(""):"<p>No mapped schema hints yet.</p>"),m("schema-unmapped",n.length?n.map(s=>`<span class="coverage-pill coverage-pill-muted">${c(s)}</span>`).join(""):"<p>All schemas are represented in the current route hints.</p>")}function gt(e){if(e.length===0){m("task-table-container","<p>No tasks currently tracked.</p>");return}const a=e.map(t=>`
        <tr>
          <td><code>${c(t.id??t.task_id??"unknown")}</code></td>
          <td>${c(t.status??"unknown")}</td>
          <td>
            <button class="action-button action-button-small" data-task-terminate="${c(t.id??t.task_id??"")}" type="button">
              Terminate
            </button>
          </td>
        </tr>
      `).join("");m("task-table-container",`
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>${a}</tbody>
      </table>
    `)}function bt(e){if(e.length===0){m("tools-browser","<p>No scripts returned.</p>");return}const a=e.map(t=>`
        <article class="tool-card">
          <div class="tool-card-head">
            <h3>${c(t.name)}</h3>
            <span class="coverage-pill ${t.category==="networks"?"":"coverage-pill-muted"}">${c(t.category)}</span>
          </div>
          <p>${t.positional_args.length>0?`Positional args: ${t.positional_args.map(r=>`<code>${c(r)}</code>`).join(", ")}`:"No positional args required."}</p>
        </article>
      `).join("");m("tools-browser",a)}function yt(e){const a=[{label:"Images",value:e.summary.image_count},{label:"Effective images",value:e.summary.effective_image_count},{label:"Caption coverage",value:ce(e.summary.caption_coverage)},{label:"Unique tags",value:e.summary.unique_tag_count},{label:"Caption files",value:e.summary.caption_file_count},{label:"Avg tags / caption",value:e.summary.average_tags_per_caption.toFixed(2)}],t=e.warnings.length?`
      <article class="dataset-analysis-block dataset-analysis-warning">
        <p class="panel-kicker">warnings</p>
        <ul class="dataset-analysis-list-plain">
          ${e.warnings.map(n=>`<li>${c(n)}</li>`).join("")}
        </ul>
      </article>
    `:"",r=e.folders.length?e.folders.map(n=>`
            <article class="dataset-analysis-block">
              <div class="tool-card-head">
                <h3>${c(n.name)}</h3>
                <span class="coverage-pill ${n.caption_coverage>=1?"":"coverage-pill-muted"}">
                  ${ce(n.caption_coverage)}
                </span>
              </div>
              <p><code>${c(n.path)}</code></p>
              <p>
                Images: <strong>${n.image_count}</strong>
                · Effective: <strong>${n.effective_image_count}</strong>
                · Repeats: <strong>${n.repeats??1}</strong>
              </p>
              <p>
                Missing captions: <strong>${n.missing_caption_count}</strong>
                · Orphan captions: <strong>${n.orphan_caption_count}</strong>
                · Empty captions: <strong>${n.empty_caption_count}</strong>
              </p>
            </article>
          `).join(""):"<p>No dataset folder summary returned.</p>";m("dataset-analysis-results",`
      ${t}
      <section class="dataset-analysis-grid">
        ${a.map(n=>`
              <article class="dataset-analysis-stat">
                <span class="metric-label">${c(n.label)}</span>
                <strong class="dataset-analysis-stat-value">${c(n.value)}</strong>
              </article>
            `).join("")}
      </section>
      <section class="dataset-analysis-columns">
        <article class="dataset-analysis-block">
          <p class="panel-kicker">scan</p>
          <h3>Dataset summary</h3>
          <p><code>${c(e.root_path)}</code></p>
          <p>Mode: <code>${c(e.scan_mode)}</code></p>
          <p>Caption extension: <code>${c(e.caption_extension)}</code></p>
          <p>Dataset folders: <strong>${e.summary.dataset_folder_count}</strong></p>
          <p>Images without captions: <strong>${e.summary.images_without_caption_count}</strong></p>
          <p>Broken images: <strong>${e.summary.broken_image_count}</strong></p>
        </article>
        <article class="dataset-analysis-block">
          <p class="panel-kicker">tags</p>
          <h3>Top tags</h3>
          ${vt(e.top_tags,"No caption tags found yet.")}
        </article>
        <article class="dataset-analysis-block">
          <p class="panel-kicker">images</p>
          <h3>Top resolutions</h3>
          ${U(e.top_resolutions,"No resolution data collected.")}
        </article>
        <article class="dataset-analysis-block">
          <p class="panel-kicker">mix</p>
          <h3>Orientation + formats</h3>
          <div>${U(e.orientation_counts,"No orientation data.")}</div>
          <div class="dataset-analysis-sublist">${U(e.image_extensions,"No image extension data.")}</div>
        </article>
      </section>
      <section class="dataset-analysis-columns">
        <article class="dataset-analysis-block">
          <p class="panel-kicker">folders</p>
          <h3>Per-folder coverage</h3>
          <div class="dataset-analysis-stack">${r}</div>
        </article>
        <article class="dataset-analysis-block">
          <p class="panel-kicker">samples</p>
          <h3>Quick path samples</h3>
          <div class="dataset-analysis-sublist">
            <h4>Missing captions</h4>
            ${V(e.samples.images_without_caption,"No missing-caption samples.")}
          </div>
          <div class="dataset-analysis-sublist">
            <h4>Orphan captions</h4>
            ${V(e.samples.orphan_captions,"No orphan-caption samples.")}
          </div>
          <div class="dataset-analysis-sublist">
            <h4>Broken images</h4>
            ${V(e.samples.broken_images,"No broken-image samples.")}
          </div>
        </article>
      </section>
    `)}function vt(e,a){return e.length?`
    <div class="coverage-list">
      ${e.map(t=>`<span class="coverage-pill">${c(t.name)} <strong>${t.count}</strong></span>`).join("")}
    </div>
  `:`<p>${c(a)}</p>`}function U(e,a){return e.length?`
    <ul class="dataset-analysis-list-plain">
      ${e.map(t=>`<li><code>${c(t.name)}</code> <strong>${t.count}</strong></li>`).join("")}
    </ul>
  `:`<p>${c(a)}</p>`}function V(e,a){return e.length?`
    <ul class="dataset-analysis-list-plain">
      ${e.map(t=>`<li><code>${c(t)}</code></li>`).join("")}
    </ul>
  `:`<p>${c(a)}</p>`}function ce(e){return`${(e*100).toFixed(1)}%`}function Re(e){return e.length===0?"No cards reported yet.":e.map((a,t)=>`GPU ${a.index??a.id??t}: ${a.name}`).join(" | ")}function _t(e){if(e.length===0)return"No tasks currently tracked.";const a=e.filter(t=>t.status&&!["FINISHED","TERMINATED","FAILED"].includes(String(t.status))).length;return`${e.length} tracked, ${a} active`}function kt(e){var t;const a=(t=e.detail)==null?void 0:t.trim();return a?`${e.status} - ${a}`:e.status}async function $t(){var l,d,o,u,h,g;const e=await Promise.allSettled([lt(),Le(),ae(),Pe(),Ee(),te()]),[a,t,r,n,s,i]=e;if(a.status==="fulfilled"){const y=((l=a.value.data)==null?void 0:l.schemas)??[];p("diag-schemas-title",`${y.length} schema hashes loaded`),p("diag-schemas-detail",y.slice(0,4).map($=>$.name).join(", ")||"No schema names returned.")}else p("diag-schemas-title","Schema hash request failed"),p("diag-schemas-detail",a.reason instanceof Error?a.reason.message:"Unknown error");if(t.status==="fulfilled"){const y=((d=t.value.data)==null?void 0:d.presets)??[];p("diag-presets-title",`${y.length} presets loaded`),p("diag-presets-detail","Source migration can reuse preset grouping later.")}else p("diag-presets-title","Preset request failed"),p("diag-presets-detail",t.reason instanceof Error?t.reason.message:"Unknown error");if(r.status==="fulfilled"){const y=((o=r.value.data)==null?void 0:o.tasks)??[];p("diag-tasks-title","Task manager reachable"),p("diag-tasks-detail",_t(y))}else p("diag-tasks-title","Task request failed"),p("diag-tasks-detail",r.reason instanceof Error?r.reason.message:"Unknown error");if(n.status==="fulfilled"){const y=((u=n.value.data)==null?void 0:u.cards)??[],$=(h=n.value.data)==null?void 0:h.xformers,T=$?`xformers: ${$.installed?"installed":"missing"}, ${$.supported?"supported":"fallback"}`:"xformers info unavailable";p("diag-gpu-title",`${y.length} GPU entries reachable`),p("diag-gpu-detail",`${Re(y)} | ${T}`)}else p("diag-gpu-title","GPU request failed"),p("diag-gpu-detail",n.reason instanceof Error?n.reason.message:"Unknown error");if(s.status==="fulfilled"?(p("diag-tageditor-title","Tag editor status reachable"),p("diag-tageditor-detail",kt(s.value))):(p("diag-tageditor-title","Tag editor status request failed"),p("diag-tageditor-detail",s.reason instanceof Error?s.reason.message:"Unknown error")),i.status==="fulfilled"){const y=((g=i.value.data)==null?void 0:g.schemas)??[];mt(y),ft(y)}else m("schema-browser",`<p>${i.reason instanceof Error?i.reason.message:"Schema inventory request failed."}</p>`)}async function wt(){const[e,a]=await Promise.allSettled([dt(),ct()]);if(e.status==="fulfilled"){const t=e.value.data;p("settings-summary-title",`${(t==null?void 0:t.saved_param_count)??0} remembered param groups`),m("settings-summary-body",`
        <p><strong>Config file:</strong> <code>${c((t==null?void 0:t.config_path)??"unknown")}</code></p>
        <p><strong>Last path:</strong> <code>${c((t==null?void 0:t.last_path)||"(empty)")}</code></p>
        <p><strong>Saved keys:</strong> ${((t==null?void 0:t.saved_param_keys)??[]).map(r=>`<code>${c(r)}</code>`).join(", ")||"none"}</p>
      `)}else p("settings-summary-title","Config summary request failed"),p("settings-summary-body",e.reason instanceof Error?e.reason.message:"Unknown error");if(a.status==="fulfilled"){const t=a.value.data??{},r=Object.keys(t);p("settings-params-title",`${r.length} saved param entries`),m("settings-params-body",r.length?`<div class="coverage-list">${r.map(n=>`<span class="coverage-pill coverage-pill-muted">${c(n)}</span>`).join("")}</div>`:"<p>No saved params returned.</p>")}else p("settings-params-title","Saved params request failed"),p("settings-params-body",a.reason instanceof Error?a.reason.message:"Unknown error")}const xt="".replace(/\/$/,""),St=xt||"";function A(e){return/^https?:\/\//.test(e)?e:(e.startsWith("/")||(e=`/${e}`),`${St}${e}`)}async function Tt(){try{const e=await Ee();p("tag-editor-status-title",`Current status: ${e.status}`),m("tag-editor-status-body",`
        <p>${c(e.detail||"No extra detail returned.")}</p>
        <p><a class="text-link" href="${A("/tageditor.html")}" target="_blank" rel="noreferrer">Open current shipped wrapper page</a></p>
      `)}catch(e){p("tag-editor-status-title","Tag editor status request failed"),p("tag-editor-status-body",e instanceof Error?e.message:"Unknown error")}}async function Lt(){var e;At();try{const t=((e=(await ut()).data)==null?void 0:e.scripts)??[];p("tools-summary-title",`${t.length} launcher scripts available`),m("tools-summary-body",`
        <p>Categories: ${[...new Set(t.map(r=>r.category))].map(r=>`<code>${c(r)}</code>`).join(", ")}</p>
        <p>The tools workspace now includes a dataset analyzer, and the next step is promoting more high-frequency flows into curated forms instead of raw script lists.</p>
      `),bt(t)}catch(a){p("tools-summary-title","Script inventory request failed"),p("tools-summary-body",a instanceof Error?a.message:"Unknown error"),m("tools-browser","<p>Tool inventory failed to load.</p>")}}function At(){const e=document.querySelector("#dataset-analysis-path"),a=document.querySelector("#dataset-analysis-caption-extension"),t=document.querySelector("#dataset-analysis-top-tags"),r=document.querySelector("#dataset-analysis-sample-limit"),n=document.querySelector("#dataset-analysis-pick"),s=document.querySelector("#dataset-analysis-run");!e||!a||!t||!r||!n||!s||(n.addEventListener("click",async()=>{p("dataset-analysis-status","Opening folder picker...");try{e.value=await Ne("folder"),p("dataset-analysis-status","Folder selected. Ready to analyze.")}catch(i){p("dataset-analysis-status",i instanceof Error?i.message:"Folder picker failed.")}}),s.addEventListener("click",()=>{de(e,a,t,r,n,s)}),e.addEventListener("keydown",i=>{i.key==="Enter"&&(i.preventDefault(),de(e,a,t,r,n,s))}))}async function de(e,a,t,r,n,s){const i=e.value.trim();if(!i){p("dataset-analysis-status","Pick a dataset folder first."),m("dataset-analysis-results",'<p class="dataset-analysis-empty">No folder selected yet.</p>');return}n.disabled=!0,s.disabled=!0,p("dataset-analysis-status","Analyzing dataset..."),m("dataset-analysis-results",'<p class="dataset-analysis-empty">Scanning images, captions, and tags...</p>');try{const l=await pt({path:i,caption_extension:a.value.trim()||".txt",top_tags:ue(t.value,40),sample_limit:ue(r.value,8)});if(l.status!=="success"||!l.data)throw new Error(l.message||"Dataset analysis returned no data.");p("dataset-analysis-status",`Scanned ${l.data.summary.image_count} images across ${l.data.summary.dataset_folder_count} dataset folder(s).`),yt(l.data)}catch(l){p("dataset-analysis-status",l instanceof Error?l.message:"Dataset analysis failed."),m("dataset-analysis-results",`<article class="dataset-analysis-block dataset-analysis-warning"><p>${c(l instanceof Error?l.message:"Dataset analysis failed.")}</p></article>`)}finally{n.disabled=!1,s.disabled=!1}}function ue(e,a){const t=Number.parseInt(e,10);return Number.isNaN(t)||t<1?a:t}async function G(){var e;try{const a=await ae();gt(((e=a.data)==null?void 0:e.tasks)??[]),document.querySelectorAll("[data-task-terminate]").forEach(t=>{t.addEventListener("click",async()=>{const r=t.dataset.taskTerminate;if(r){t.setAttribute("disabled","true");try{await Ae(r)}finally{await G()}}})})}catch(a){m("task-table-container",`<p>${a instanceof Error?c(a.message):"Task request failed."}</p>`)}}async function Pt(){const e=document.querySelector("#refresh-tasks");e==null||e.addEventListener("click",()=>{G()}),await G()}class v{constructor(a){k(this,"kind");k(this,"descriptionText");k(this,"defaultValue");k(this,"roleName");k(this,"roleConfig");k(this,"minValue");k(this,"maxValue");k(this,"stepValue");k(this,"disabledFlag",!1);k(this,"requiredFlag",!1);k(this,"literalValue");k(this,"options",[]);k(this,"fields",{});k(this,"itemType");this.kind=a}description(a){return this.descriptionText=a,this}default(a){return this.defaultValue=a,this}role(a,t){return this.roleName=typeof a=="string"?a:"custom",this.roleConfig=t??a,this}min(a){return this.minValue=a,this}max(a){return this.maxValue=a,this}step(a){return this.stepValue=a,this}required(){return this.requiredFlag=!0,this}disabled(){return this.disabledFlag=!0,this}}function C(e){if(e instanceof v)return e;if(e===String)return new v("string");if(e===Number)return new v("number");if(e===Boolean)return new v("boolean");if(typeof e=="string"||typeof e=="number"||typeof e=="boolean"){const a=new v("const");return a.literalValue=e,a.defaultValue=e,a}if(Array.isArray(e)){const a=new v("union");return a.options=e.map(t=>C(t)),a}if(e&&typeof e=="object"){const a=new v("object");return a.fields=Object.fromEntries(Object.entries(e).map(([t,r])=>[t,C(r)])),a}return new v("string")}function Et(){return{string(){return new v("string")},number(){return new v("number")},boolean(){return new v("boolean")},const(e){const a=new v("const");return a.literalValue=e,a.defaultValue=e,a},union(e){const a=new v("union");return a.options=e.map(t=>C(t)),a},intersect(e){const a=new v("intersect");return a.options=e.map(t=>C(t)),a},object(e){const a=new v("object");return a.fields=Object.fromEntries(Object.entries(e).map(([t,r])=>[t,C(r)])),a},array(e){const a=new v("array");return a.itemType=C(e),a}}}function Nt(e,a,t){const r={...e,...a};for(const n of t??[])delete r[n];return r}function pe(e,a){const t=Et();return new Function("Schema","UpdateSchema","SHARED_SCHEMAS","String","Number","Boolean","source",'"use strict"; return eval(source);')(t,Nt,a??{},String,Number,Boolean,e)}function Ie(e){const a=e.find(n=>n.name==="shared"),r=(a?pe(a.schema,null):{})||{};return e.map(n=>({name:n.name,hash:n.hash,source:n.schema,runtime:n.name==="shared"?r:pe(n.schema,r)}))}function he(e,a=""){return Object.entries(e).map(([t,r])=>({name:t,path:a?`${a}.${t}`:t,schema:r})).filter(t=>t.schema.kind!=="const"||!t.schema.requiredFlag)}function me(e){return Object.entries(e).filter(([,a])=>a.kind==="const"&&a.requiredFlag).map(([a,t])=>`${a} = ${String(t.literalValue)}`)}function fe(e){return Object.fromEntries(Object.entries(e).filter(([,a])=>a.kind==="const"&&a.requiredFlag).map(([a,t])=>[a,t.literalValue]))}function K(e,a,t){if(e.kind==="intersect"){e.options.forEach((r,n)=>K(r,`${a}-i${n}`,t));return}if(e.kind==="object"){const r=he(e.fields);r.length>0&&t.push({id:a,title:e.descriptionText||"Unnamed section",fields:r,conditions:me(e.fields),constants:fe(e.fields)});return}e.kind==="union"&&e.options.forEach((r,n)=>{if(r.kind==="object"){const s=he(r.fields);s.length>0&&t.push({id:`${a}-u${n}`,title:r.descriptionText||e.descriptionText||`Conditional branch ${n+1}`,fields:s,conditional:!0,conditions:me(r.fields),constants:fe(r.fields)})}else K(r,`${a}-u${n}`,t)})}function Dt(e){const a=[];return K(e,"section",a),a}function Ct(e){const a={};for(const t of e){t.conditional||Object.assign(a,t.constants);for(const r of t.fields)r.schema.defaultValue!==void 0?a[r.path]=r.schema.defaultValue:r.schema.kind==="boolean"?a[r.path]=!1:a[r.path]=""}return a}function je(e,a){return e.conditional?Object.entries(e.constants).every(([t,r])=>a[t]===r):!0}function Rt(e,a){const t={...a};for(const r of e){if(je(r,a)){Object.assign(t,r.constants);continue}for(const n of r.fields)delete t[n.path]}return t}function re(e){return`field-${e.replaceAll(/[^a-zA-Z0-9_-]/g,"-")}`}function It(e){if(e.kind!=="union")return null;const a=e.options.filter(t=>t.kind==="const").map(t=>t.literalValue).filter(t=>typeof t=="string"||typeof t=="number"||typeof t=="boolean");return a.length!==e.options.length?null:a}function jt(e,a){if(!e.roleConfig||typeof e.roleConfig!="object"||Array.isArray(e.roleConfig))return;const t=e.roleConfig[a];return typeof t=="string"?t:void 0}function J(e){return Array.isArray(e)?e.map(a=>String(a??"")):typeof e=="string"&&e.length>0?e.split(/\r?\n/):[]}function qt(e,a,t){const r=J(a),n=r.length>0?r:[""],s=re(e.path);return`
    <div class="table-editor" data-table-path="${c(e.path)}">
      <div class="table-editor-rows">
        ${n.map((i,l)=>`
              <div class="table-editor-row">
                <input
                  id="${l===0?s:`${s}-${l}`}"
                  class="field-input"
                  data-field-path="${c(e.path)}"
                  data-field-kind="table-row"
                  data-field-index="${l}"
                  type="text"
                  value="${c(i)}"
                  ${t}
                />
                <button
                  class="action-button action-button-ghost action-button-small"
                  data-table-remove="${c(e.path)}"
                  data-table-index="${l}"
                  type="button"
                  ${t}
                >
                  Remove
                </button>
              </div>
            `).join("")}
      </div>
      <div class="table-editor-footer">
        <button
          class="action-button action-button-ghost action-button-small"
          data-table-add="${c(e.path)}"
          type="button"
          ${t}
        >
          Add row
        </button>
        <span class="table-editor-note">One argument per row.</span>
      </div>
    </div>
  `}function Ot(e,a){const t=e.schema,r=re(e.path),n=c(e.path),s=It(t),i=t.disabledFlag?"disabled":"",l=t.roleName||"";if(t.kind==="boolean")return`
      <label class="checkbox-row" for="${r}">
        <input id="${r}" data-field-path="${n}" data-field-kind="boolean" type="checkbox" ${a?"checked":""} ${i} />
        <span>${t.defaultValue===!0?"default on":"toggle"}</span>
      </label>
    `;if(t.kind==="array"){if(l==="table")return qt(e,a,i);const d=Array.isArray(a)?a.join(`
`):"";return`<textarea id="${r}" class="field-input field-textarea" data-field-path="${n}" data-field-kind="array" ${i}>${c(d)}</textarea>`}if(s){const d=s.map(o=>`<option value="${c(o)}" ${String(o)===String(a)?"selected":""}>${c(o)}</option>`).join("");return`<select id="${r}" class="field-input" data-field-path="${n}" data-field-kind="enum" ${i}>${d}</select>`}if(t.kind==="number"){const d=t.minValue!==void 0?`min="${t.minValue}"`:"",o=t.maxValue!==void 0?`max="${t.maxValue}"`:"",u=t.stepValue!==void 0?`step="${t.stepValue}"`:'step="any"';if(l==="slider"&&t.minValue!==void 0&&t.maxValue!==void 0){const h=a===""||a===void 0||a===null?t.defaultValue??t.minValue:a;return`
        <div class="slider-editor">
          <input
            class="field-slider"
            data-field-path="${n}"
            data-field-kind="number"
            data-slider-role="range"
            type="range"
            value="${c(h)}"
            ${d}
            ${o}
            ${u}
            ${i}
          />
          <div class="slider-editor-footer">
            <input
              id="${r}"
              class="field-input slider-number-input"
              data-field-path="${n}"
              data-field-kind="number"
              data-slider-role="number"
              type="number"
              value="${c(h)}"
              ${d}
              ${o}
              ${u}
              ${i}
            />
            <span class="slider-value" data-slider-value-for="${n}">${c(h)}</span>
          </div>
        </div>
      `}return`<input id="${r}" class="field-input" data-field-path="${n}" data-field-kind="number" type="number" value="${c(a)}" ${d} ${o} ${u} ${i} />`}if(l==="textarea")return`<textarea id="${r}" class="field-input field-textarea" data-field-path="${n}" data-field-kind="string" ${i}>${c(a)}</textarea>`;if(l==="filepicker"){const d=jt(t,"type")??(e.path.endsWith("_dir")||e.path==="resume"?"folder":"model-file");return`
      <div class="picker-control">
        <div class="picker-row">
          <input
            id="${r}"
            class="field-input"
            data-field-path="${n}"
            data-field-kind="string"
            type="text"
            value="${c(a)}"
            ${i}
          />
          <button
            class="action-button action-button-ghost picker-button"
            data-picker-path="${n}"
            data-picker-type="${c(d)}"
            type="button"
            ${i}
          >
            Browse
          </button>
        </div>
        <p class="picker-status" data-picker-status-for="${n}">
          Uses the backend native ${d==="folder"?"folder":"file"} picker.
        </p>
      </div>
    `}return t.kind==="const"?`<div class="field-readonly"><code>${c(t.literalValue??a)}</code></div>`:`<input id="${r}" class="field-input" data-field-path="${n}" data-field-kind="string" type="text" value="${c(a)}" ${i} />`}function Ft(e,a){const t=e.schema,r=[`<span class="mini-badge">${c(t.kind)}</span>`,t.roleName?`<span class="mini-badge mini-badge-muted">${c(t.roleName)}</span>`:"",t.requiredFlag?'<span class="mini-badge mini-badge-accent">required</span>':"",t.disabledFlag?'<span class="mini-badge mini-badge-muted">disabled</span>':""].filter(Boolean).join(""),n=[t.minValue!==void 0?`min ${t.minValue}`:"",t.maxValue!==void 0?`max ${t.maxValue}`:"",t.stepValue!==void 0?`step ${t.stepValue}`:""].filter(Boolean).join(" · ");return`
    <article class="field-card">
      <div class="field-card-head">
        <div>
          <label class="field-label" for="${re(e.path)}">${c(e.name)}</label>
          <p class="field-path">${c(e.path)}</p>
        </div>
        <div class="mini-badge-row">${r}</div>
      </div>
      <p class="field-description">${c(t.descriptionText||"No description")}</p>
      ${Ot(e,a)}
      <div class="field-meta">
        <span><strong>Default:</strong> ${c(t.defaultValue??"(none)")}</span>
        ${n?`<span><strong>Constraints:</strong> ${c(n)}</span>`:""}
      </div>
    </article>
  `}function qe(e){return e.sections.filter(a=>je(a,e.values))}function Oe(e){return Rt(e.sections,e.values)}function Ht(e,a){const t=qe(e);if(t.length===0){m(a,"<p>No renderable sections extracted from this schema.</p>");return}const r=t.map(n=>{const s=n.fields.map(l=>Ft(l,e.values[l.path])).join(""),i=n.conditions.length?`<div class="condition-list">${n.conditions.map(l=>`<span class="coverage-pill coverage-pill-muted">${c(l)}</span>`).join("")}</div>`:"";return`
        <article class="panel schema-section-card">
          <div class="schema-section-head">
            <div>
              <p class="panel-kicker">${n.conditional?"conditional section":"section"}</p>
              <h3>${c(n.title)}</h3>
            </div>
            <span class="coverage-pill">${n.fields.length} fields</span>
          </div>
          ${i}
          <div class="field-grid">
            ${s}
          </div>
        </article>
      `}).join("");m(a,r)}function Y(e,a){const t=Object.fromEntries(Object.entries(Oe(e)).sort(([r],[n])=>r.localeCompare(n)));I(a,JSON.stringify(t,null,2))}function z(e){return e.filter(a=>a.name!=="shared"&&a.runtime instanceof v)}function ge(e,a){const t=e.schema;if(t.kind==="boolean")return!!a;if(t.kind==="number"){const r=String(a).trim();if(r==="")return"";const n=Number(r);return Number.isNaN(n)?"":n}return t.kind==="array"?String(a).split(/\r?\n/).map(r=>r.trim()).filter(Boolean):a}function be(e,a){return e.sections.flatMap(t=>t.fields).find(t=>t.path===a)}function Bt(e,a){return[...e.querySelectorAll('[data-field-kind="table-row"]')].filter(t=>t.dataset.fieldPath===a).map(t=>t.value.trim()).filter(Boolean)}function ye(e,a,t,r){const n=String(t??"");e.querySelectorAll("[data-field-path]").forEach(s=>{if(!(s===r||s.dataset.fieldPath!==a||s.dataset.fieldKind==="table-row")){if(s instanceof HTMLInputElement&&s.type==="checkbox"){s.checked=!!t;return}s.value=n}}),e.querySelectorAll("[data-slider-value-for]").forEach(s=>{s.dataset.sliderValueFor===a&&(s.textContent=n)})}function M(e,a,t,r="idle"){e.querySelectorAll("[data-picker-status-for]").forEach(n=>{n.dataset.pickerStatusFor===a&&(n.textContent=t,n.classList.remove("is-success","is-error"),r==="success"?n.classList.add("is-success"):r==="error"&&n.classList.add("is-error"))})}function zt(e,a,t,r){const n=document.querySelector(`#${a.sectionsId}`);if(!n)return;const s=new Set(e.sections.flatMap(i=>i.conditional?Object.keys(i.constants):[]));n.querySelectorAll("[data-field-path]").forEach(i=>{const l=i.dataset.fieldKind,d=i instanceof HTMLInputElement&&i.type==="checkbox"||i instanceof HTMLSelectElement?"change":"input";i.addEventListener(d,()=>{const o=i.dataset.fieldPath;if(!o)return;const u=be(e,o);if(u){if(l==="table-row")e.values[o]=Bt(n,o);else{const h=i instanceof HTMLInputElement&&i.type==="checkbox"?i.checked:i.value;e.values[o]=ge(u,h),ye(n,o,e.values[o],i)}if(s.has(o)){r({...e,values:{...e.values}});return}Y(e,a.previewId),t(e)}})}),n.querySelectorAll("[data-table-add]").forEach(i=>{i.addEventListener("click",()=>{const l=i.dataset.tableAdd;l&&(e.values[l]=[...J(e.values[l]),""],r({...e,values:{...e.values}}))})}),n.querySelectorAll("[data-table-remove]").forEach(i=>{i.addEventListener("click",()=>{const l=i.dataset.tableRemove,d=Number(i.dataset.tableIndex??"-1");if(!l||d<0)return;const o=J(e.values[l]).filter((u,h)=>h!==d);e.values[l]=o,r({...e,values:{...e.values}})})}),n.querySelectorAll("[data-picker-path]").forEach(i=>{i.addEventListener("click",async()=>{const l=i.dataset.pickerPath,d=i.dataset.pickerType||"model-file";if(!l)return;const o=be(e,l);if(o){i.setAttribute("disabled","true"),M(n,l,"Waiting for native picker...","idle");try{const u=await Ne(d);if(e.values[l]=ge(o,u),ye(n,l,e.values[l]),M(n,l,u,"success"),s.has(l)){r({...e,values:{...e.values}});return}Y(e,a.previewId),t(e)}catch(u){M(n,l,u instanceof Error?u.message:"The picker failed to return a value.","error")}finally{i.removeAttribute("disabled")}}})})}function O(e,a){const t=z(e).find(n=>n.name===a);if(!t||!(t.runtime instanceof v))return null;const r=Dt(t.runtime);return{catalog:e,selectedName:a,sections:r,values:Ct(r)}}function j(e,a,t,r){if(t(e),!e){p(a.summaryId,"Failed to build schema bridge state."),m(a.sectionsId,"<p>Schema bridge failed to initialize.</p>"),I(a.previewId,"{}");return}const s=z(e.catalog).map(o=>`<option value="${c(o.name)}" ${o.name===e.selectedName?"selected":""}>${c(o.name)}</option>`).join(""),i=qe(e);m(a.selectId,s),p(a.summaryId,`${e.selectedName} · ${i.length}/${e.sections.length} visible sections · ${i.reduce((o,u)=>o+u.fields.length,0)} visible fields`),Ht(e,a.sectionsId),Y(e,a.previewId);const l=document.querySelector(`#${a.selectId}`);l&&(l.onchange=()=>{const o=O(e.catalog,l.value);j(o,a,t,r)});const d=document.querySelector(`#${a.resetId}`);d&&(d.onclick=()=>{j(O(e.catalog,e.selectedName),a,t,r)}),zt(e,a,r,o=>j(o,a,t,r)),r(e)}const Ut={selectId:"schema-select",summaryId:"schema-summary",sectionsId:"schema-sections",previewId:"schema-preview",resetId:"schema-reset"};function Vt(e){return{selectId:`${e}-schema-select`,summaryId:`${e}-summary`,sectionsId:`${e}-sections`,previewId:`${e}-preview`,resetId:`${e}-reset`}}async function Mt(e){var a,t,r;try{const s=((a=(await te()).data)==null?void 0:a.schemas)??[],i=Ie(s),l=z(i),d=((t=l.find(o=>o.name==="sdxl-lora"))==null?void 0:t.name)??((r=l[0])==null?void 0:r.name);if(!d){p("schema-summary","No selectable schemas were returned."),m("schema-sections","<p>No schema runtime available.</p>");return}j(O(i,d),Ut,e,()=>{})}catch(n){p("schema-summary","Schema bridge request failed"),m("schema-sections",`<p>${n instanceof Error?c(n.message):"Unknown error"}</p>`),I("schema-preview","{}")}}function Wt(e,a){return`
    <div class="app-shell">
      <aside class="app-sidebar">
        <div class="brand-lockup">
          <p class="eyebrow">SD-reScripts</p>
          <h1>Frontend Source</h1>
          <p class="sidebar-copy">
            A migration workspace that lets us rebuild the UI near the core logic without touching the shipped dist yet.
          </p>
        </div>
        <nav id="side-nav" class="side-nav" aria-label="Source workspace routes"></nav>
      </aside>
      <main class="app-main">
        ${a}
      </main>
    </div>
  `}function S(e,a,t){return`
    <section class="page-hero panel">
      <p class="eyebrow">${e}</p>
      <h2>${a}</h2>
      <p class="lede">${t}</p>
    </section>
  `}function ve(e,a,t="module"){return`
    <article class="panel info-card">
      <p class="panel-kicker">${t}</p>
      <h3>${e}</h3>
      <div>${a}</div>
    </article>
  `}function Xt(){return`
    ${S("about","A clean source-side replacement for the current about page","This page is one of the safest migration targets because it is mostly branding, release context and ownership notes.")}
    <section class="two-column">
      ${ve("Project identity",`
          <p><strong>Product name:</strong> SD-reScripts</p>
          <p><strong>Version target:</strong> v1.0.2</p>
          <p><strong>Lineage:</strong> Fork from 秋葉 aaaki/lora-scripts</p>
          <p><strong>Maintainer:</strong> Modify By Lulynx</p>
        `,"brand")}
      ${ve("Why migrate this page first",`
          <p>It lets us establish the new source-side design system without risking training logic.</p>
          <p>It is also where release notes, maintainer links and project positioning can become readable source instead of hashed text chunks.</p>
        `,"migration")}
    </section>
    <section class="panel prose-panel">
      <h3>Recommended source-side content blocks</h3>
      <p>The future rebuilt About page should eventually hold:</p>
      <ul>
        <li>project branding and maintainer links</li>
        <li>fork lineage and compatibility expectations</li>
        <li>release notes for v1.0.2 and later</li>
        <li>known runtime constraints such as separate tag-editor Python support</li>
      </ul>
      <p><a class="text-link" href="${A("/other/about.html")}" target="_blank" rel="noreferrer">Open current shipped about page</a></p>
    </section>
  `}function P(e){return`
    ${S(e.heroKicker,e.heroTitle,e.heroLede)}
    <section class="two-column">
      <article class="panel info-card">
        <p class="panel-kicker">schema target</p>
        <h3>${e.runnerTitle}</h3>
        <div class="schema-bridge-toolbar">
          <label class="field-label" for="${e.prefix}-schema-select">Schema</label>
          <select id="${e.prefix}-schema-select" class="field-input"></select>
          <button id="${e.prefix}-reset" class="action-button" type="button">Reset defaults</button>
        </div>
        <p id="${e.prefix}-summary">Loading ${e.heroTitle} schema...</p>
      </article>
      <article class="panel info-card">
        <p class="panel-kicker">runtime</p>
        <h3 id="${e.prefix}-runtime-title">Loading GPU runtime...</h3>
        <div id="${e.prefix}-runtime-body">Checking /api/graphic_cards</div>
      </article>
    </section>

    <section class="panel train-actions-panel">
      <div class="train-actions-grid">
        <div>
          <p class="panel-kicker">gpu selection</p>
          <div id="${e.prefix}-gpu-selector" class="gpu-selector loading">Loading GPU list...</div>
        </div>
        <div>
          <p class="panel-kicker">launch</p>
          <div class="launch-column">
            <button id="${e.prefix}-start-train" class="action-button action-button-large" type="button">${e.startButtonLabel}</button>
            <p class="section-note">
              This submits the current local config snapshot to <code>/api/run</code>.
            </p>
            <p><a class="text-link" href="${A(e.legacyPath)}" target="_blank" rel="noreferrer">${e.legacyLabel}</a></p>
          </div>
        </div>
      </div>
      <div class="train-status-grid">
        <div id="${e.prefix}-submit-status" class="submit-status">Waiting for schema and backend data.</div>
        <div id="${e.prefix}-validation-status" class="submit-status">Checking payload compatibility...</div>
      </div>
    </section>

    <section class="panel training-utility-panel">
      <div class="training-toolbar">
        <button id="${e.prefix}-reset-all" class="action-button action-button-ghost" type="button">Reset all</button>
        <button id="${e.prefix}-save-params" class="action-button action-button-ghost" type="button">Save params</button>
        <button id="${e.prefix}-read-params" class="action-button action-button-ghost" type="button">Read params</button>
        <button id="${e.prefix}-download-config" class="action-button action-button-ghost" type="button">Download config</button>
        <button id="${e.prefix}-import-config" class="action-button action-button-ghost" type="button">Import config</button>
        <button id="${e.prefix}-load-presets" class="action-button action-button-ghost" type="button">Load presets</button>
        <button id="${e.prefix}-stop-train" class="action-button action-button-ghost" type="button">Stop train</button>
      </div>
      <p id="${e.prefix}-utility-note" class="section-note">Autosave is enabled for this source route.</p>
      <input id="${e.prefix}-config-file-input" type="file" accept=".toml" hidden />
      <input id="${e.prefix}-history-file-input" type="file" accept=".json" hidden />
      <section id="${e.prefix}-history-panel" class="training-side-panel" hidden></section>
      <section id="${e.prefix}-presets-panel" class="training-side-panel" hidden></section>
    </section>

    <section class="section-head">
      <div>
        <p class="eyebrow">Rendered sections</p>
        <h2>${e.renderedTitle}</h2>
      </div>
      <p class="section-note">The fields below come from evaluating the current training schema DSL, not from hand-written JSON.</p>
    </section>
    <section id="${e.prefix}-sections" class="schema-sections loading">Loading ${e.heroTitle} sections...</section>

    <section class="section-head">
      <div>
        <p class="eyebrow">Payload preview</p>
        <h2>Request body preview</h2>
      </div>
      <p class="section-note">This mirrors the normalized object that will be sent to <code>/api/run</code>.</p>
    </section>
    <section class="panel preview-panel">
      <pre id="${e.prefix}-preview">{}</pre>
    </section>
  `}function Gt(){return P({prefix:"dreambooth",heroKicker:"dreambooth train",heroTitle:"Dreambooth source training page",heroLede:"This route brings the Dreambooth and SDXL full-finetune schema into the same source-side training bridge so we can migrate one of the last big non-LoRA training paths cleanly.",runnerTitle:"Dreambooth source-side runner",startButtonLabel:"Start Dreambooth training",legacyPath:"/dreambooth/",legacyLabel:"Open current shipped Dreambooth page",renderedTitle:"Dreambooth form bridge"})}function Kt(){return P({prefix:"flux-controlnet",heroKicker:"flux controlnet",heroTitle:"Flux ControlNet source training page",heroLede:"This route reuses the same source-side training bridge for Flux ControlNet so the DiT-family conditioning workflow stays aligned with the current backend schema and payload rules.",runnerTitle:"Flux ControlNet source-side runner",startButtonLabel:"Start Flux ControlNet training",legacyPath:"/lora/flux-controlnet.html",legacyLabel:"Open current shipped Flux ControlNet page",renderedTitle:"Flux ControlNet form bridge"})}function Jt(){return P({prefix:"flux",heroKicker:"flux train",heroTitle:"Flux LoRA source training page",heroLede:"This route reuses the source-side training bridge for Flux so we can keep payload shaping, compatibility checks and launch behavior aligned with the current backend.",runnerTitle:"Flux source-side runner",startButtonLabel:"Start Flux training",legacyPath:"/lora/flux.html",legacyLabel:"Open current shipped Flux page",renderedTitle:"Flux form bridge"})}function Yt(){return`
    ${S("schema bridge","Source-side schema explorer and prototype form bridge","This page evaluates the current schema DSL in the browser and turns it into sections, fields and editable defaults. It is the first direct bridge between the new source workspace and the training form core.")}
    <section class="two-column">
      <article class="panel info-card">
        <p class="panel-kicker">schema target</p>
        <h3>Current schema</h3>
        <div class="schema-bridge-toolbar">
          <label class="field-label" for="schema-select">Schema</label>
          <select id="schema-select" class="field-input"></select>
          <button id="schema-reset" class="action-button" type="button">Reset defaults</button>
        </div>
        <p id="schema-summary">Loading schema runtime...</p>
      </article>
      <article class="panel info-card">
        <p class="panel-kicker">focus</p>
        <h3>Phase 2 goal</h3>
        <div>
          <p>Default target is <code>sdxl-lora</code>, because that is the most important training path to migrate after the Phase 1 shell pages.</p>
          <p>The renderer here intentionally focuses on common field kinds first: strings, numbers, booleans, enums and simple arrays.</p>
        </div>
      </article>
    </section>
    <section class="section-head">
      <div>
        <p class="eyebrow">Rendered sections</p>
        <h2>Schema structure</h2>
      </div>
      <p class="section-note">These sections come from evaluating the current schema DSL, not from hand-written page metadata.</p>
    </section>
    <section id="schema-sections" class="schema-sections loading">Loading schema sections...</section>
    <section class="section-head">
      <div>
        <p class="eyebrow">Config preview</p>
        <h2>Local value snapshot</h2>
      </div>
      <p class="section-note">This preview is local-only for now. It proves we can create a source-side config model from the current schema DSL.</p>
    </section>
    <section class="panel preview-panel">
      <pre id="schema-preview">{}</pre>
    </section>
  `}function Zt(){return P({prefix:"sd3",heroKicker:"sd3 train",heroTitle:"SD3 LoRA source training page",heroLede:"This route extends the same source-side training bridge to SD3 so we can keep the fast-moving schema-driven trainer paths on one shared foundation.",runnerTitle:"SD3 source-side runner",startButtonLabel:"Start SD3 training",legacyPath:"/lora/sd3.html",legacyLabel:"Open current shipped SD3 page",renderedTitle:"SD3 form bridge"})}function Qt(){return P({prefix:"sd-controlnet",heroKicker:"sd controlnet",heroTitle:"SD ControlNet source training page",heroLede:"This route extends the shared source-side training bridge to the SD1.x / SD2.x ControlNet workflow so conditioning-dataset training can migrate without another bespoke form stack.",runnerTitle:"SD ControlNet source-side runner",startButtonLabel:"Start SD ControlNet training",legacyPath:"/lora/controlnet.html",legacyLabel:"Open current shipped SD ControlNet page",renderedTitle:"SD ControlNet form bridge"})}function ea(){return P({prefix:"sdxl-controlnet",heroKicker:"sdxl controlnet",heroTitle:"SDXL ControlNet source training page",heroLede:"This route keeps the SDXL ControlNet training path on the same source-side schema bridge, normalized payload builder and launch pipeline as the main LoRA routes.",runnerTitle:"SDXL ControlNet source-side runner",startButtonLabel:"Start SDXL ControlNet training",legacyPath:"/lora/sdxl-controlnet.html",legacyLabel:"Open current shipped SDXL ControlNet page",renderedTitle:"SDXL ControlNet form bridge"})}function ta(){return P({prefix:"sdxl-lllite",heroKicker:"sdxl lllite",heroTitle:"SDXL LLLite source training page",heroLede:"This route keeps the SDXL ControlNet-LLLite path on the shared source-side training bridge so even the more specialized conditioning flow no longer needs its own one-off migration path.",runnerTitle:"SDXL LLLite source-side runner",startButtonLabel:"Start SDXL LLLite training",legacyPath:"/lora/sdxl-lllite.html",legacyLabel:"Open current shipped SDXL LLLite page",renderedTitle:"SDXL LLLite form bridge"})}function aa(){return P({prefix:"sdxl",heroKicker:"sdxl train",heroTitle:"First source-side SDXL training page",heroLede:"This is the first page that moves beyond passive inspection: it renders the SDXL schema, tracks a real config model and can submit to the current training backend.",runnerTitle:"SDXL source-side runner",startButtonLabel:"Start SDXL training",legacyPath:"/lora/sdxl.html",legacyLabel:"Open current shipped SDXL page",renderedTitle:"SDXL form bridge"})}function ra(){return`
    ${S("settings","Source-side settings page prototype","This route is now close to live backend config data, so we can rebuild it before touching the schema-heavy training forms.")}
    <section class="two-column">
      <article class="panel info-card">
        <p class="panel-kicker">config summary</p>
        <h3 id="settings-summary-title">Loading config summary...</h3>
        <div id="settings-summary-body">Checking /api/config/summary</div>
      </article>
      <article class="panel info-card">
        <p class="panel-kicker">saved params</p>
        <h3 id="settings-params-title">Loading saved params...</h3>
        <div id="settings-params-body">Checking /api/config/saved_params</div>
      </article>
    </section>
    <section class="panel prose-panel">
      <h3>Planned upgrades</h3>
      <ul>
        <li>human-friendly rendering of saved parameter groups</li>
        <li>UI controls for future config persistence endpoints</li>
        <li>cleaner distinction between global app settings and per-schema remembered values</li>
      </ul>
      <p><a class="text-link" href="${A("/other/settings.html")}" target="_blank" rel="noreferrer">Open current shipped settings page</a></p>
    </section>
  `}function na(){return`
    ${S("tag editor","Tag editor wrapper migration page","The current shipped page is mostly a wrapper around startup state and proxy behavior. That makes it a good low-risk source-side rewrite.")}
    <section class="two-column">
      <article class="panel info-card">
        <p class="panel-kicker">status</p>
        <h3 id="tag-editor-status-title">Loading tag editor status...</h3>
        <div id="tag-editor-status-body">Checking /api/tageditor_status</div>
      </article>
      <article class="panel info-card">
        <p class="panel-kicker">next step</p>
        <h3>Future migration target</h3>
        <div>
          <p>This source page should eventually replace the current startup/progress wrapper and keep the bilingual guidance in readable source form.</p>
          <p>Once we wire routing into FastAPI, it can hand off to the real tag editor service or show clean failure states.</p>
          <p><a class="text-link" href="${A("/tageditor.html")}" target="_blank" rel="noreferrer">Open current shipped tag editor wrapper</a></p>
        </div>
      </article>
    </section>
  `}function sa(){return`
    ${S("tasks","Task monitor migration page","This route is already talking to the real backend task manager, so it is a strong candidate for early source migration.")}
    <section class="panel task-panel">
      <div class="task-toolbar">
        <button id="refresh-tasks" class="action-button" type="button">Refresh tasks</button>
        <a class="text-link task-legacy-link" href="${A("/task.html")}" target="_blank" rel="noreferrer">Open current shipped task page</a>
      </div>
      <div id="task-table-container" class="task-table-container loading">Loading tasks...</div>
    </section>
  `}function ia(){return`
    ${S("tensorboard","TensorBoard wrapper migration page","This page can be rebuilt without touching training forms because it mainly needs status text and a proxy destination.")}
    <section class="two-column">
      <article class="panel info-card">
        <p class="panel-kicker">proxy</p>
        <h3>Legacy backend path</h3>
        <div>
          <p>The current runtime proxies TensorBoard through <code>/proxy/tensorboard/</code>.</p>
          <p>This source-side page can later offer a cleaner iframe or open-in-new-tab flow.</p>
          <p><a class="text-link" href="${A("/proxy/tensorboard/")}" target="_blank" rel="noreferrer">Open current TensorBoard proxy</a></p>
        </div>
      </article>
      <article class="panel info-card">
        <p class="panel-kicker">status</p>
        <h3 id="tensorboard-status-title">Backend proxy assumed available</h3>
        <div id="tensorboard-status-body">
          <p>FastAPI mounts the TensorBoard reverse proxy in <code>mikazuki/app/proxy.py</code>.</p>
          <p>Future source migration should add health probing and clearer unavailable states.</p>
        </div>
      </article>
    </section>
  `}function oa(){return`
    ${S("tools","Tools workspace","This route now covers both raw script launching and the first reusable dataset utility, so it can grow into a real preflight toolbox instead of staying a placeholder.")}
    <section class="two-column">
      <article class="panel info-card">
        <p class="panel-kicker">scripts</p>
        <h3 id="tools-summary-title">Loading tool scripts...</h3>
        <div id="tools-summary-body">Checking /api/scripts</div>
      </article>
      <article class="panel info-card">
        <p class="panel-kicker">launcher</p>
        <h3>Current backend contract</h3>
        <div>
          <p>Tools are launched through <code>POST /api/run_script</code>.</p>
          <p>The backend already validates script names and resolves them from <code>scripts/stable</code> or <code>scripts/dev</code>.</p>
        </div>
      </article>
    </section>
    <section class="panel tools-panel">
      <div class="section-head">
        <div>
          <p class="panel-kicker">dataset</p>
          <h2>Dataset analyzer</h2>
          <p class="section-note">Scan a training folder before launch and surface missing captions, folder coverage, top tags, and resolution mix.</p>
        </div>
      </div>
      <div class="tool-form-grid">
        <label class="tool-field tool-field-wide">
          <span>Dataset folder</span>
          <div class="tool-inline-actions">
            <input id="dataset-analysis-path" class="field-input" type="text" placeholder="Select a dataset folder" />
            <button id="dataset-analysis-pick" class="action-button action-button-ghost" type="button">Browse</button>
            <button id="dataset-analysis-run" class="action-button" type="button">Analyze</button>
          </div>
        </label>
        <label class="tool-field">
          <span>Caption extension</span>
          <input id="dataset-analysis-caption-extension" class="field-input" type="text" value=".txt" />
        </label>
        <label class="tool-field">
          <span>Top tags</span>
          <input id="dataset-analysis-top-tags" class="field-input" type="number" value="40" min="1" max="200" step="1" />
        </label>
        <label class="tool-field">
          <span>Sample paths</span>
          <input id="dataset-analysis-sample-limit" class="field-input" type="number" value="8" min="1" max="50" step="1" />
        </label>
      </div>
      <p id="dataset-analysis-status" class="section-note">Ready to scan a training folder.</p>
      <div id="dataset-analysis-results" class="dataset-analysis-empty">
        Pick a folder to preview image count, caption coverage, repeat-weighted size, tag frequency, and a few problem samples.
      </div>
    </section>
    <section class="panel tools-panel">
      <div class="section-head">
        <div>
          <p class="panel-kicker">scripts</p>
          <h2>Script inventory</h2>
          <p class="section-note">Raw launchers still matter for edge cases, so the full backend inventory stays visible here.</p>
        </div>
      </div>
      <p><a class="text-link" href="${A("/lora/tools.html")}" target="_blank" rel="noreferrer">Open current shipped tools page</a></p>
      <div id="tools-browser" class="tools-browser loading">Loading available scripts...</div>
    </section>
  `}const la=[{method:"GET",path:"/api/schemas/all",purpose:"Fetch all schema definitions used to render training forms.",migrationPriority:"high"},{method:"GET",path:"/api/schemas/hashes",purpose:"Hot-reload check for schema changes.",migrationPriority:"medium"},{method:"GET",path:"/api/presets",purpose:"Fetch preset configs for pages and tools.",migrationPriority:"high"},{method:"GET",path:"/api/config/saved_params",purpose:"Load stored UI parameter choices.",migrationPriority:"medium"},{method:"GET",path:"/api/config/summary",purpose:"Read app config summary for the rebuilt settings page.",migrationPriority:"medium"},{method:"GET",path:"/api/graphic_cards",purpose:"List GPUs plus xformers support state.",migrationPriority:"high"},{method:"POST",path:"/api/run",purpose:"Start schema-driven training jobs.",migrationPriority:"high"},{method:"POST",path:"/api/run_script",purpose:"Run utility scripts from the tools page.",migrationPriority:"high"},{method:"POST",path:"/api/interrogate",purpose:"Run the built-in tagger/interrogator flow.",migrationPriority:"high"},{method:"GET",path:"/api/pick_file",purpose:"Open native file/folder pickers where supported.",migrationPriority:"medium"},{method:"GET",path:"/api/get_files",purpose:"List model, output or train directories for file pickers.",migrationPriority:"high"},{method:"GET",path:"/api/tasks",purpose:"Fetch active and historical task state.",migrationPriority:"high"},{method:"GET",path:"/api/tasks/terminate/{task_id}",purpose:"Terminate a running task.",migrationPriority:"high"},{method:"GET",path:"/api/tageditor_status",purpose:"Poll tag-editor startup/proxy status.",migrationPriority:"medium"},{method:"GET",path:"/api/scripts",purpose:"List backend-approved utility scripts and positional args for the rebuilt tools page.",migrationPriority:"high"}];function Fe(){const e=De.map(t=>`
        <article class="panel route-card" data-status="${t.status}">
          <div class="panel-kicker">${t.section}</div>
          <h3>${t.title}</h3>
          <p class="route-path">${t.route}</p>
          <p>${t.notes}</p>
          ${t.schemaHints&&t.schemaHints.length>0?`<p class="schema-linkline">Schema hints: ${t.schemaHints.map(r=>`<code>${r}</code>`).join(", ")}</p>`:""}
          <div class="pill-row">
            <span class="pill ${t.status==="migrate-first"?"pill-hot":"pill-cool"}">${t.status}</span>
          </div>
        </article>
      `).join(""),a=la.map(t=>`
        <tr>
          <td><span class="method method-${t.method.toLowerCase()}">${t.method}</span></td>
          <td><code>${t.path}</code></td>
          <td>${t.purpose}</td>
          <td>${t.migrationPriority}</td>
        </tr>
      `).join("");return`
    ${S("workspace","Source migration dashboard","This page stays close to the backend and keeps our migration map explicit instead of hiding it inside hashed dist chunks.")}

    <section class="section-head">
      <div>
        <p class="eyebrow">Live bridge</p>
        <h2>Backend diagnostics</h2>
      </div>
      <p class="section-note">
        These cards talk to the current FastAPI backend through proxied <code>/api</code> requests.
      </p>
    </section>
    <section class="diagnostic-grid">
      <article class="panel diagnostic-card">
        <div class="panel-kicker">schemas</div>
        <h3 id="diag-schemas-title">Loading schema hashes...</h3>
        <p id="diag-schemas-detail">Checking /api/schemas/hashes</p>
      </article>
      <article class="panel diagnostic-card">
        <div class="panel-kicker">presets</div>
        <h3 id="diag-presets-title">Loading presets...</h3>
        <p id="diag-presets-detail">Checking /api/presets</p>
      </article>
      <article class="panel diagnostic-card">
        <div class="panel-kicker">tasks</div>
        <h3 id="diag-tasks-title">Loading task manager...</h3>
        <p id="diag-tasks-detail">Checking /api/tasks</p>
      </article>
      <article class="panel diagnostic-card">
        <div class="panel-kicker">gpu</div>
        <h3 id="diag-gpu-title">Loading graphic cards...</h3>
        <p id="diag-gpu-detail">Checking /api/graphic_cards</p>
      </article>
      <article class="panel diagnostic-card">
        <div class="panel-kicker">tag editor</div>
        <h3 id="diag-tageditor-title">Loading tag editor status...</h3>
        <p id="diag-tageditor-detail">Checking /api/tageditor_status</p>
      </article>
    </section>

    <section class="panel callout">
      <h2>Phase 1 migration order</h2>
      <p>
        Low-risk first: <code>about</code>, <code>settings</code>, <code>tasks</code>,
        <code>tageditor</code>, <code>tensorboard</code>, <code>tools</code>.
      </p>
      <p>
        Harder later: schema-heavy training forms like <code>lora/sdxl.html</code>,
        <code>lora/flux.html</code> and <code>dreambooth/index.html</code>.
      </p>
    </section>

    <section class="section-head">
      <div>
        <p class="eyebrow">Route inventory</p>
        <h2>Current UI surfaces</h2>
      </div>
      <p class="section-note">
        These records are the first source-controlled migration map, rather than hidden inside hashed JS.
      </p>
    </section>
    <section class="route-grid">
      ${e}
    </section>

    <section class="section-head">
      <div>
        <p class="eyebrow">API inventory</p>
        <h2>Backend contracts we need to preserve</h2>
      </div>
      <p class="section-note">
        The future frontend should stay schema-driven instead of hardcoding training forms wherever possible.
      </p>
    </section>
    <section class="panel api-panel">
      <table>
        <thead>
          <tr>
            <th>Method</th>
            <th>Path</th>
            <th>Purpose</th>
            <th>Priority</th>
          </tr>
        </thead>
        <tbody>
          ${a}
        </tbody>
      </table>
    </section>

    <section class="section-head">
      <div>
        <p class="eyebrow">Schema browser</p>
        <h2>Current form source inventory</h2>
      </div>
      <p class="section-note">
        These are the backend schema files that the legacy frontend currently turns into training forms.
      </p>
    </section>
    <section class="panel schema-panel">
      <div id="schema-browser" class="schema-browser loading">Loading schema inventory...</div>
    </section>
    <section class="panel coverage-panel">
      <div class="coverage-columns">
        <div>
          <p class="panel-kicker">mapped schema hints</p>
          <div id="schema-mapped" class="coverage-list loading">Waiting for schema inventory...</div>
        </div>
        <div>
          <p class="panel-kicker">unmapped schema names</p>
          <div id="schema-unmapped" class="coverage-list loading">Waiting for schema inventory...</div>
        </div>
      </div>
    </section>
  `}const D="#/workspace",R=[{id:"overview",label:"Workspace",section:"overview",hash:D,description:"Source migration dashboard and live backend diagnostics."},{id:"about",label:"About",section:"phase1",hash:"#/about",description:"Rebuild branding and release notes in source form."},{id:"settings",label:"Settings",section:"phase1",hash:"#/settings",description:"Read config summary and saved parameter state from the backend."},{id:"tasks",label:"Tasks",section:"phase1",hash:"#/tasks",description:"Inspect and manage task execution state."},{id:"tageditor",label:"Tag Editor",section:"phase1",hash:"#/tageditor",description:"Track startup status and future proxy behavior."},{id:"tensorboard",label:"TensorBoard",section:"phase1",hash:"#/tensorboard",description:"Prepare a cleaner source-side wrapper for TensorBoard access."},{id:"tools",label:"Tools",section:"phase1",hash:"#/tools",description:"Migrate script-launch and utility entry points from the legacy tools page."},{id:"schema-bridge",label:"Schema Bridge",section:"reference",hash:"#/schema-bridge",description:"Evaluate current schema DSL into a source-side explorer and prototype form renderer."},{id:"sdxl-train",label:"SDXL Train",section:"reference",hash:"#/sdxl-train",description:"First source-side training page powered by the schema bridge and current `/api/run` backend."},{id:"flux-train",label:"Flux Train",section:"reference",hash:"#/flux-train",description:"Source-side Flux LoRA training route built on the shared schema bridge and launch pipeline."},{id:"sd3-train",label:"SD3 Train",section:"reference",hash:"#/sd3-train",description:"Source-side SD3 LoRA training route using the same normalized payload workflow."},{id:"dreambooth-train",label:"Dreambooth",section:"reference",hash:"#/dreambooth-train",description:"Source-side Dreambooth and SDXL full-finetune route on the shared schema bridge."},{id:"sd-controlnet-train",label:"SD ControlNet",section:"reference",hash:"#/sd-controlnet-train",description:"Source-side SD ControlNet training route using the shared launch flow."},{id:"sdxl-controlnet-train",label:"SDXL ControlNet",section:"reference",hash:"#/sdxl-controlnet-train",description:"Source-side SDXL ControlNet training route using the shared launch flow."},{id:"flux-controlnet-train",label:"Flux ControlNet",section:"reference",hash:"#/flux-controlnet-train",description:"Source-side Flux ControlNet training route using the shared launch flow."},{id:"sdxl-lllite-train",label:"SDXL LLLite",section:"reference",hash:"#/sdxl-lllite-train",description:"Source-side SDXL ControlNet-LLLite training route on the shared training bridge."}],He=new Set(R.map(e=>e.hash)),Be={"/index.html":D,"/index.md":D,"/404.html":D,"/404.md":D,"/task.html":"#/tasks","/task.md":"#/tasks","/tageditor.html":"#/tageditor","/tageditor.md":"#/tageditor","/tagger.html":"#/tageditor","/tagger.md":"#/tageditor","/tensorboard.html":"#/tensorboard","/tensorboard.md":"#/tensorboard","/other/about.html":"#/about","/other/about.md":"#/about","/other/settings.html":"#/settings","/other/settings.md":"#/settings","/dreambooth/index.html":"#/dreambooth-train","/dreambooth/index.md":"#/dreambooth-train","/lora/index.html":"#/sdxl-train","/lora/index.md":"#/sdxl-train"},ca=Object.keys(Be).sort((e,a)=>a.length-e.length);function ne(e){const a=e.replace(/\/+$/,"");return a.length>0?`${a}/`:"/"}function da(e){switch(e){case"flux":case"flux-finetune":return"#/flux-train";case"sd3":case"sd3-finetune":return"#/sd3-train";case"controlnet":return"#/sd-controlnet-train";case"sdxl-controlnet":return"#/sdxl-controlnet-train";case"flux-controlnet":return"#/flux-controlnet-train";case"sdxl-lllite":return"#/sdxl-lllite-train";case"tools":return"#/tools";case"basic":case"master":case"params":case"sdxl":case"sdxl-ti":case"ti":case"xti":case"anima":case"anima-finetune":case"hunyuan":case"lumina":case"lumina-finetune":return"#/sdxl-train";default:return null}}function ua(e){const a=e.match(/^(.*)\/lora\/([^/]+)\.(?:html|md)$/i);if(!a)return null;const[,t,r]=a,n=da(r.toLowerCase());return n?{hash:n,canonicalRootPath:ne(t)}:null}function pa(e){const a=e.toLowerCase();for(const t of ca)if(a.endsWith(t))return{hash:Be[t],canonicalRootPath:ne(e.slice(0,e.length-t.length))};return ua(e)}function _e(e,a){const t=`${e}${window.location.search}${a}`,r=`${window.location.pathname}${window.location.search}${window.location.hash}`;t!==r&&window.history.replaceState(null,"",t)}function ha(){const e=He.has(window.location.hash)?window.location.hash:D;return R.find(a=>a.hash===e)??R[0]}function ma(){if(He.has(window.location.hash))return;const e=pa(window.location.pathname);if(e){_e(e.canonicalRootPath,e.hash);return}_e(ne(window.location.pathname||"/"),D)}const ke={"sdxl-train":{routeId:"sdxl-train",schemaName:"sdxl-lora",prefix:"sdxl",modelLabel:"SDXL",presetTrainTypes:["sdxl-lora"]},"flux-train":{routeId:"flux-train",schemaName:"flux-lora",prefix:"flux",modelLabel:"Flux",presetTrainTypes:["flux-lora"]},"sd3-train":{routeId:"sd3-train",schemaName:"sd3-lora",prefix:"sd3",modelLabel:"SD3",presetTrainTypes:["sd3-lora"]},"dreambooth-train":{routeId:"dreambooth-train",schemaName:"dreambooth",prefix:"dreambooth",modelLabel:"Dreambooth",presetTrainTypes:["dreambooth","sd-dreambooth","sdxl-finetune"]},"sd-controlnet-train":{routeId:"sd-controlnet-train",schemaName:"sd-controlnet",prefix:"sd-controlnet",modelLabel:"SD ControlNet",presetTrainTypes:["sd-controlnet"]},"sdxl-controlnet-train":{routeId:"sdxl-controlnet-train",schemaName:"sdxl-controlnet",prefix:"sdxl-controlnet",modelLabel:"SDXL ControlNet",presetTrainTypes:["sdxl-controlnet"]},"flux-controlnet-train":{routeId:"flux-controlnet-train",schemaName:"flux-controlnet",prefix:"flux-controlnet",modelLabel:"Flux ControlNet",presetTrainTypes:["flux-controlnet"]},"sdxl-lllite-train":{routeId:"sdxl-lllite-train",schemaName:"sdxl-controlnet-lllite",prefix:"sdxl-lllite",modelLabel:"SDXL LLLite",presetTrainTypes:["sdxl-controlnet-lllite"]}};function fa(e,a){if(a.length===0){m(e,"<p>No GPUs reported. Training will use the backend default environment.</p>");return}const t=a.map((r,n)=>{const s=r.index??r.id??n,i=String(s);return`
        <label class="gpu-chip">
          <input type="checkbox" data-gpu-id="${c(i)}" />
          <span>GPU ${c(i)}: ${c(r.name)}</span>
        </label>
      `}).join("");m(e,`<div class="gpu-chip-grid">${t}</div>`)}function se(e){return[...document.querySelectorAll(`#${e} input[data-gpu-id]:checked`)].map(a=>a.dataset.gpuId).filter(a=>!!a)}function ie(e,a=[]){const t=new Set(a.map(r=>String(r)));document.querySelectorAll(`#${e}-gpu-selector input[data-gpu-id]`).forEach(r=>{const n=r.dataset.gpuId??"";r.checked=t.has(n)})}function w(e,a,t,r="idle"){m(`${e}-submit-status`,`
      <div class="submit-status-box submit-status-${r}">
        <strong>${c(a)}</strong>
        <p>${c(t)}</p>
      </div>
    `)}function Z(e,a,t){if(t){m(`${e}-validation-status`,`
        <div class="submit-status-box submit-status-error">
          <strong>Payload preparation failed</strong>
          <p>${c(t)}</p>
        </div>
      `);return}const r=[a.errors.length>0?`
          <div>
            <strong>Errors</strong>
            <ul class="status-list">
              ${a.errors.map(n=>`<li>${c(n)}</li>`).join("")}
            </ul>
          </div>
        `:"",a.warnings.length>0?`
          <div>
            <strong>Warnings</strong>
            <ul class="status-list">
              ${a.warnings.map(n=>`<li>${c(n)}</li>`).join("")}
            </ul>
          </div>
        `:""].filter(Boolean).join("");if(!r){m(`${e}-validation-status`,`
        <div class="submit-status-box submit-status-success">
          <strong>Compatibility checks passed</strong>
          <p>No obvious parameter conflicts were detected in the current payload.</p>
        </div>
      `);return}m(`${e}-validation-status`,`
      <div class="submit-status-box ${a.errors.length>0?"submit-status-error":"submit-status-warning"}">
        <strong>${a.errors.length>0?"Action needed before launch":"Review before launch"}</strong>
        ${r}
      </div>
    `)}function _(e,a,t="idle"){const r=document.querySelector(`#${e}-utility-note`);r&&(r.textContent=a,r.classList.remove("utility-note-success","utility-note-warning","utility-note-error"),t==="success"?r.classList.add("utility-note-success"):t==="warning"?r.classList.add("utility-note-warning"):t==="error"&&r.classList.add("utility-note-error"))}function ga(e){const a=[];let t="",r=null,n=0;for(let s=0;s<e.length;s+=1){const i=e[s],l=s>0?e[s-1]:"";if(r){t+=i,i===r&&l!=="\\"&&(r=null);continue}if(i==='"'||i==="'"){r=i,t+=i;continue}if(i==="["){n+=1,t+=i;continue}if(i==="]"){n-=1,t+=i;continue}if(i===","&&n===0){a.push(t.trim()),t="";continue}t+=i}return t.trim().length>0&&a.push(t.trim()),a}function ba(e){let a=null,t=!1,r="";for(const n of e){if(a){if(r+=n,a==='"'&&n==="\\"&&!t){t=!0;continue}n===a&&!t&&(a=null),t=!1;continue}if(n==='"'||n==="'"){a=n,r+=n;continue}if(n==="#")break;r+=n}return r.trim()}function ze(e){return e.startsWith('"')&&e.endsWith('"')?e.slice(1,-1).replaceAll('\\"','"').replaceAll("\\n",`
`).replaceAll("\\t","	").replaceAll("\\\\","\\"):e.startsWith("'")&&e.endsWith("'")?e.slice(1,-1):e}function Ue(e){const a=e.trim();return a.length===0?"":a.startsWith('"')&&a.endsWith('"')||a.startsWith("'")&&a.endsWith("'")?ze(a):a==="true"?!0:a==="false"?!1:a.startsWith("[")&&a.endsWith("]")?ga(a.slice(1,-1)).map(t=>Ue(t)):/^[+-]?\d[\d_]*(\.\d[\d_]*)?([eE][+-]?\d+)?$/.test(a)?Number(a.replaceAll("_","")):a}function $e(e){return e.split(".").map(a=>a.trim()).filter(Boolean).map(a=>ze(a))}function ya(e,a,t){let r=e;for(let n=0;n<a.length-1;n+=1){const s=a[n],i=r[s];(!i||typeof i!="object"||Array.isArray(i))&&(r[s]={}),r=r[s]}r[a[a.length-1]]=t}function Ve(e){const a={};let t=[];for(const r of e.split(/\r?\n/)){const n=ba(r);if(!n)continue;if(n.startsWith("[[")&&n.endsWith("]]"))throw new Error("Array-of-table syntax is not supported in custom params yet.");if(n.startsWith("[")&&n.endsWith("]")){t=$e(n.slice(1,-1));continue}const s=n.indexOf("=");if(s===-1)throw new Error(`Invalid TOML line: ${r}`);const i=$e(n.slice(0,s));if(i.length===0)throw new Error(`Invalid TOML key: ${r}`);ya(a,[...t,...i],Ue(n.slice(s+1)))}return a}function W(e){return JSON.stringify(e)}function Me(e){return typeof e=="string"?W(e):typeof e=="number"?Number.isFinite(e)?String(e):W(String(e)):typeof e=="boolean"?e?"true":"false":Array.isArray(e)?`[${e.map(a=>Me(a)).join(", ")}]`:W(JSON.stringify(e))}function We(e,a=[],t=[]){const r=[];for(const[n,s]of Object.entries(e)){if(s&&typeof s=="object"&&!Array.isArray(s)){We(s,[...a,n],t);continue}r.push([n,s])}return t.push({path:a,values:r}),t}function va(e){const a=We(e).filter(r=>r.values.length>0).sort((r,n)=>r.path.join(".").localeCompare(n.path.join("."))),t=[];for(const r of a){r.path.length>0&&(t.length>0&&t.push(""),t.push(`[${r.path.join(".")}]`));for(const[n,s]of r.values.sort(([i],[l])=>i.localeCompare(l)))t.push(`${n} = ${Me(s)}`)}return t.join(`
`)}const _a=["pretrained_model_name_or_path","train_data_dir","reg_data_dir","output_dir","network_weights","conditioning_data_dir","controlnet_model_name_or_path","weights","vae","text_encoder","byt5","qwen3","llm_adapter_path","t5_tokenizer_path","ae","clip_l","clip_g","t5xxl","gemma2"],ka=["learning_rate","unet_lr","text_encoder_lr","learning_rate_te","learning_rate_te1","learning_rate_te2","learning_rate_te3","sigmoid_scale","guidance_scale","training_shift","control_net_lr","self_attn_lr","cross_attn_lr","mlp_lr","mod_lr","llm_adapter_lr"],$a=["lycoris_algo","conv_dim","conv_alpha","dropout","dylora_unit","lokr_factor","train_norm","down_lr_weight","mid_lr_weight","up_lr_weight","block_lr_zero_threshold","enable_block_weights","enable_preview","network_args_custom","optimizer_args_custom","enable_base_weight","prodigy_d0","prodigy_d_coef","ui_custom_params"],wa=["vae","reg_data_dir","network_weights","conditioning_data_dir","controlnet_model_name_or_path","weights","init_word","text_encoder","byt5","qwen3","llm_adapter_path","t5_tokenizer_path","ae","clip_l","clip_g","t5xxl","gemma2","noise_offset","multires_noise_iterations","multires_noise_discount","caption_dropout_rate","network_dropout","scale_weight_norms","gpu_ids"],xa=["v2","v_parameterization","scale_v_pred_loss_like_noise_pred","clip_skip","learning_rate_te","stop_text_encoder_training"],Sa=["learning_rate_te1","learning_rate_te2"],Ta=[["cache_text_encoder_outputs","shuffle_caption"],["noise_offset","multires_noise_iterations"],["cache_latents","color_aug"],["cache_latents","random_crop"]],we={algo:"lycoris_algo",unit:"dylora_unit",factor:"lokr_factor"},La=new Set(["conv_dim","conv_alpha","dropout","down_lr_weight","mid_lr_weight","up_lr_weight","block_lr_zero_threshold"]),Aa=new Set(["decouple","weight_decay","use_bias_correction","safeguard_warmup"]),Pa=new Set(["base_weights","base_weights_multiplier"]),Ea={pretrained_model_name_or_path:"./sd-models/model.safetensors",train_data_dir:"./train/aki",resolution:"512,512",enable_bucket:!0,min_bucket_reso:256,max_bucket_reso:1024,output_name:"aki",output_dir:"./output",save_model_as:"safetensors",save_every_n_epochs:2,max_train_epochs:10,train_batch_size:1,network_train_unet_only:!1,network_train_text_encoder_only:!1,learning_rate:1e-4,unet_lr:1e-4,text_encoder_lr:1e-5,lr_scheduler:"cosine_with_restarts",optimizer_type:"AdamW8bit",lr_scheduler_num_cycles:1,network_module:"networks.lora",network_dim:32,network_alpha:32,logging_dir:"./logs",caption_extension:".txt",shuffle_caption:!0,keep_tokens:0,max_token_length:255,seed:1337,prior_loss_weight:1,clip_skip:2,mixed_precision:"fp16",save_precision:"fp16",xformers:!0,cache_latents:!0,persistent_data_loader_workers:!0};function Q(e){return JSON.parse(JSON.stringify(e??{}))}function q(e){return Array.isArray(e)?e.map(a=>String(a??"").trim()).filter(Boolean):String(e??"").split(/\r?\n/).map(a=>a.trim()).filter(Boolean)}function E(e,a){return Object.prototype.hasOwnProperty.call(e,a)}function Na(e){return String(e.model_train_type??"").startsWith("sdxl")}function Da(e){return String(e.model_train_type??"")==="sd3-finetune"}function f(e){return e==null?"":String(e)}function Ca(e){return f(e).replaceAll("\\","/")}function F(e,a=0){const t=Number.parseFloat(f(e));return Number.isNaN(t)?a:t}function b(e){return!!e}function xe(e){const a=e.indexOf("=");return a===-1?{key:e.trim(),value:"",hasValue:!1}:{key:e.slice(0,a).trim(),value:e.slice(a+1).trim(),hasValue:!0}}function Ra(e){if(typeof e=="boolean")return e;const a=f(e).toLowerCase();return a==="true"||a==="1"||a==="yes"}function Xe(e,a=String(e.model_train_type??"")){const t=a==="lora-basic"?{...Ea,...Q(e)}:Q(e),r=[],n=[],s=Na(t),i=Da(t);(s||i)&&[t.learning_rate_te1,t.learning_rate_te2,t.learning_rate_te3].some(b)&&(t.train_text_encoder=!0);for(const o of s||i?xa:Sa)E(t,o)&&delete t[o];t.network_module==="lycoris.kohya"?(r.push(`conv_dim=${f(t.conv_dim)}`,`conv_alpha=${f(t.conv_alpha)}`,`dropout=${f(t.dropout)}`,`algo=${f(t.lycoris_algo)}`),b(t.lokr_factor)&&r.push(`factor=${f(t.lokr_factor)}`),b(t.train_norm)&&r.push("train_norm=True")):t.network_module==="networks.dylora"&&r.push(`unit=${f(t.dylora_unit)}`);const l=f(t.optimizer_type),d=l.toLowerCase();d.startsWith("dada")?((l==="DAdaptation"||l==="DAdaptAdam")&&n.push("decouple=True","weight_decay=0.01"),t.learning_rate=1,t.unet_lr=1,t.text_encoder_lr=1):d==="prodigy"&&(n.push("decouple=True","weight_decay=0.01","use_bias_correction=True",`d_coef=${f(t.prodigy_d_coef)}`),b(t.lr_warmup_steps)&&n.push("safeguard_warmup=True"),b(t.prodigy_d0)&&n.push(`d0=${f(t.prodigy_d0)}`)),b(t.enable_block_weights)&&(r.push(`down_lr_weight=${f(t.down_lr_weight)}`,`mid_lr_weight=${f(t.mid_lr_weight)}`,`up_lr_weight=${f(t.up_lr_weight)}`,`block_lr_zero_threshold=${f(t.block_lr_zero_threshold)}`),delete t.block_lr_zero_threshold),b(t.enable_base_weight)?(t.base_weights=q(t.base_weights),t.base_weights_multiplier=q(t.base_weights_multiplier).map(o=>F(o))):(delete t.base_weights,delete t.base_weights_multiplier);for(const o of q(t.network_args_custom))r.push(o);for(const o of q(t.optimizer_args_custom))n.push(o);b(t.enable_preview)||(delete t.sample_prompts,delete t.sample_sampler,delete t.sample_every_n_epochs);for(const o of ka)E(t,o)&&(t[o]=F(t[o]));for(const o of wa){if(!E(t,o))continue;const u=t[o];(u===0||u===""||Array.isArray(u)&&u.length===0)&&delete t[o]}for(const o of _a)E(t,o)&&t[o]&&(t[o]=Ca(t[o]));if(r.length>0?t.network_args=r:delete t.network_args,n.length>0?t.optimizer_args=n:delete t.optimizer_args,b(t.ui_custom_params)){const o=Ve(f(t.ui_custom_params));Object.assign(t,o)}for(const o of $a)E(t,o)&&delete t[o];return Array.isArray(t.gpu_ids)&&(t.gpu_ids=t.gpu_ids.map(o=>{const u=f(o),h=u.match(/GPU\s+(\d+):/);return h?h[1]:u})),t}function Ia(e){const a=[],t=[],r=f(e.optimizer_type),n=r.toLowerCase(),s=f(e.model_train_type),i=s==="sd3-finetune",l=s==="anima-lora"||s==="anima-finetune";r.startsWith("DAdapt")&&e.lr_scheduler!=="constant"&&a.push("DAdaptation works best with lr_scheduler set to constant."),n.startsWith("prodigy")&&(E(e,"unet_lr")||E(e,"text_encoder_lr"))&&(F(e.unet_lr,1)!==1||F(e.text_encoder_lr,1)!==1)&&a.push("Prodigy usually expects unet_lr and text_encoder_lr to stay at 1."),e.network_module==="networks.oft"&&s!=="sdxl-lora"&&t.push("OFT is currently only supported for SDXL LoRA."),i&&b(e.train_text_encoder)&&b(e.cache_text_encoder_outputs)&&!b(e.use_t5xxl_cache_only)&&t.push("SD3 full finetune cannot train text encoders while cache_text_encoder_outputs is enabled."),i&&b(e.train_t5xxl)&&!b(e.train_text_encoder)&&t.push("train_t5xxl requires train_text_encoder to be enabled first."),i&&b(e.train_t5xxl)&&b(e.cache_text_encoder_outputs)&&t.push("train_t5xxl cannot be combined with cache_text_encoder_outputs."),l&&b(e.unsloth_offload_checkpointing)&&b(e.cpu_offload_checkpointing)&&t.push("unsloth_offload_checkpointing cannot be combined with cpu_offload_checkpointing."),l&&b(e.unsloth_offload_checkpointing)&&b(e.blocks_to_swap)&&t.push("unsloth_offload_checkpointing cannot be combined with blocks_to_swap.");for(const[d,o]of Ta)b(e[d])&&b(e[o])&&t.push(`Parameters ${d} and ${o} conflict. Please enable only one of them.`);return{warnings:a,errors:t}}function Ge(e){const a=Q(e);if(Array.isArray(a.network_args)){const t=[];for(const r of a.network_args){const{key:n,value:s,hasValue:i}=xe(f(r));if(n==="train_norm"){a.train_norm=i?Ra(s):!0;continue}if((n==="down_lr_weight"||n==="mid_lr_weight"||n==="up_lr_weight"||n==="block_lr_zero_threshold")&&(a.enable_block_weights=!0),La.has(n)){a[n]=s;continue}if(we[n]){a[we[n]]=s;continue}t.push(f(r))}t.length>0&&(a.network_args_custom=t),delete a.network_args}if(Array.isArray(a.optimizer_args)){const t=[];for(const r of a.optimizer_args){const{key:n,value:s}=xe(f(r));if(n==="d_coef"){a.prodigy_d_coef=s;continue}if(n==="d0"){a.prodigy_d0=s;continue}Aa.has(n)||t.push(f(r))}t.length>0&&(a.optimizer_args_custom=t),delete a.optimizer_args}for(const t of Pa)Array.isArray(a[t])&&(a[t]=a[t].map(r=>f(r)).join(`
`),t==="base_weights"&&(a.enable_base_weight=!0),t==="base_weights_multiplier"&&(a.enable_base_weight=!0));return Array.isArray(a.gpu_ids)&&(a.gpu_ids=a.gpu_ids.map(t=>f(t))),a}function Ke(e,a){const t=a.values.output_name;return typeof t=="string"&&t.trim().length>0?t.trim():`${e.modelLabel} snapshot`}function ja(e){try{return JSON.stringify(Xe(B(e.value)),null,2)}catch(a){return a instanceof Error?a.message:"Unable to preview this snapshot."}}function qa(e,a){if(a.length===0){m(`${e}-history-panel`,`
        <div class="training-side-panel-head">
          <div>
            <p class="panel-kicker">history</p>
            <h3>History parameters</h3>
          </div>
          <div class="history-toolbar">
            <button class="action-button action-button-ghost action-button-small" data-history-export="${e}" type="button">Export</button>
            <button class="action-button action-button-ghost action-button-small" data-history-import="${e}" type="button">Import</button>
            <button class="action-button action-button-ghost action-button-small" data-history-close="${e}" type="button">Close</button>
          </div>
        </div>
        <p>No saved parameter snapshots yet.</p>
      `);return}const t=a.map((r,n)=>`
        <article class="history-card">
          <div class="history-card-head">
            <div>
              <h4>${c(r.name||"Unnamed snapshot")}</h4>
              <p class="history-card-meta">${c(r.time)}</p>
            </div>
            <span class="coverage-pill coverage-pill-muted">${c((r.gpu_ids??[]).join(", ")||"default GPU")}</span>
          </div>
          <pre class="history-preview">${c(ja(r))}</pre>
          <div class="history-card-actions">
            <button class="action-button action-button-ghost action-button-small" data-history-apply="${n}" type="button">Apply</button>
            <button class="action-button action-button-ghost action-button-small" data-history-rename="${n}" type="button">Rename</button>
            <button class="action-button action-button-ghost action-button-small" data-history-delete="${n}" type="button">Delete</button>
          </div>
        </article>
      `).join("");m(`${e}-history-panel`,`
      <div class="training-side-panel-head">
        <div>
          <p class="panel-kicker">history</p>
          <h3>History parameters</h3>
        </div>
        <div class="history-toolbar">
          <button class="action-button action-button-ghost action-button-small" data-history-export="${e}" type="button">Export</button>
          <button class="action-button action-button-ghost action-button-small" data-history-import="${e}" type="button">Import</button>
          <button class="action-button action-button-ghost action-button-small" data-history-close="${e}" type="button">Close</button>
        </div>
      </div>
      <div class="history-list">${t}</div>
    `)}function Oa(e,a){if(a.length===0){m(`${e}-presets-panel`,`
        <div class="training-side-panel-head">
          <div>
            <p class="panel-kicker">presets</p>
            <h3>Training presets</h3>
          </div>
          <button class="action-button action-button-ghost action-button-small" data-preset-close="${e}" type="button">Close</button>
        </div>
        <p>No presets matched this training route.</p>
      `);return}const t=a.map((r,n)=>{const s=r.metadata??{},i=r.data??{};return`
        <article class="preset-card">
          <div class="preset-card-head">
            <div>
              <h4>${c(s.name||r.name||`Preset ${n+1}`)}</h4>
              <p class="preset-card-meta">
                ${c(String(s.version||"unknown"))}
                · ${c(String(s.author||"unknown author"))}
              </p>
            </div>
            <span class="coverage-pill coverage-pill-muted">${c(String(s.train_type||"shared"))}</span>
          </div>
          <p>${c(String(s.description||"No description"))}</p>
          <pre class="preset-preview">${c(JSON.stringify(i,null,2))}</pre>
          <div class="preset-card-actions">
            <button class="action-button action-button-ghost action-button-small" data-preset-apply="${n}" type="button">Apply</button>
          </div>
        </article>
      `}).join("");m(`${e}-presets-panel`,`
      <div class="training-side-panel-head">
        <div>
          <p class="panel-kicker">presets</p>
          <h3>Training presets</h3>
        </div>
        <button class="action-button action-button-ghost action-button-small" data-preset-close="${e}" type="button">Close</button>
      </div>
      <div class="preset-list">${t}</div>
    `)}function Fa(e,a){const t=new Set(e.presetTrainTypes);return a.filter(r=>{const s=(r.metadata??{}).train_type;return typeof s!="string"||s.trim().length===0?!0:t.has(s)})}function L(e,a,t){const r=document.querySelector(`#${e}-history-panel`),n=document.querySelector(`#${e}-presets-panel`);r&&(r.hidden=a==="history"?!t:!0),n&&(n.hidden=a==="presets"?!t:!0)}function Ha(e){var a;(a=document.querySelector(`#${e.prefix}-stop-train`))==null||a.addEventListener("click",async()=>{var t;try{const n=(((t=(await ae()).data)==null?void 0:t.tasks)??[]).find(i=>String(i.status).toUpperCase()==="RUNNING");if(!n){_(e.prefix,"No running training task was found.","warning");return}const s=String(n.id??n.task_id??"");if(!s){_(e.prefix,"The running task does not expose an id.","error");return}if(!window.confirm(`Stop running task ${s}?`))return;await Ae(s),w(e.prefix,"Training stop requested",`Sent terminate request for task ${s}.`,"warning"),_(e.prefix,`Terminate requested for task ${s}.`,"warning")}catch(r){_(e.prefix,r instanceof Error?r.message:"Failed to stop training.","error")}})}function Ba(e,a,t){const r=document.querySelector(`#${e.prefix}-start-train`);r==null||r.addEventListener("click",async()=>{var s;const n=a();if(!n){w(e.prefix,"Editor not ready",`The ${e.modelLabel} schema editor state is not initialized yet.`,"error");return}r.setAttribute("disabled","true"),w(e.prefix,"Submitting training job...","Sending the current payload to /api/run.","idle");try{const i=t(n);if(i.checks.errors.length>0){w(e.prefix,"Fix parameter conflicts first",i.checks.errors.join(" "),"error"),Z(e.prefix,i.checks);return}const l=await ht(i.payload);if(l.status==="success"){const o=[...i.checks.warnings,...((s=l.data)==null?void 0:s.warnings)??[]].join(" ");w(e.prefix,"Training request accepted",`${l.message||"Training started."}${o?` ${o}`:""}`,o?"warning":"success")}else w(e.prefix,"Training request failed",l.message||"Unknown backend failure.","error")}catch(i){w(e.prefix,"Training request failed",i instanceof Error?i.message:"Unknown network error.","error")}finally{r.removeAttribute("disabled")}})}function oe(){return typeof window<"u"?window:null}function Je(e,a){const t=oe();if(!t)return a;try{const r=t.localStorage.getItem(e);return r?JSON.parse(r):a}catch{return a}}function Ye(e,a){const t=oe();t&&t.localStorage.setItem(e,JSON.stringify(a))}function Ze(e){return`source-training-autosave-${e}`}function Qe(e){return`source-training-history-${e}`}function za(e){return Je(Ze(e),null)}function Ua(e,a){Ye(Ze(e),a)}function N(e){return Je(Qe(e),[])}function H(e,a){Ye(Qe(e),a)}function et(e,a,t="text/plain;charset=utf-8"){const r=oe();if(!r)return;const n=new Blob([a],{type:t}),s=URL.createObjectURL(n),i=r.document.createElement("a");i.href=s,i.download=e,i.click(),URL.revokeObjectURL(s)}function Va(e,a,t){var n;const r=N(e.routeId);r.unshift({time:new Date().toLocaleString(),name:Ke(e,a),value:B(a.values),gpu_ids:se(`${e.prefix}-gpu-selector`)}),H(e.routeId,r.slice(0,40)),(n=document.querySelector(`#${e.prefix}-history-panel`))!=null&&n.hidden||t()}function Ma(e,a,t,r){var n,s,i;(n=document.querySelector(`#${e.prefix}-download-config`))==null||n.addEventListener("click",()=>{const l=a();if(!l)return;const d=t(l);et(`${e.prefix}-${Ce()}.toml`,va(d.payload)),_(e.prefix,"Exported current config as TOML.","success")}),(s=document.querySelector(`#${e.prefix}-import-config`))==null||s.addEventListener("click",()=>{var l;(l=document.querySelector(`#${e.prefix}-config-file-input`))==null||l.click()}),(i=document.querySelector(`#${e.prefix}-config-file-input`))==null||i.addEventListener("change",l=>{var h;const d=l.currentTarget,o=(h=d.files)==null?void 0:h[0];if(!o)return;const u=new FileReader;u.onload=()=>{try{const g=Ve(String(u.result??""));r(g),_(e.prefix,`Imported config: ${o.name}.`,"success")}catch(g){_(e.prefix,g instanceof Error?g.message:"Failed to import config.","error")}finally{d.value=""}},u.readAsText(o)})}function Wa(e,a){var t;(t=document.querySelector(`#${e.prefix}-history-file-input`))==null||t.addEventListener("change",r=>{var l;const n=r.currentTarget,s=(l=n.files)==null?void 0:l[0];if(!s)return;const i=new FileReader;i.onload=()=>{try{const d=JSON.parse(String(i.result??""));if(!Array.isArray(d))throw new Error("History file must contain an array.");const o=d.filter(h=>h&&typeof h=="object"&&h.value&&typeof h.value=="object").map(h=>({time:String(h.time||new Date().toLocaleString()),name:h.name?String(h.name):void 0,value:B(h.value),gpu_ids:Array.isArray(h.gpu_ids)?h.gpu_ids.map(g=>String(g)):[]}));if(o.length===0)throw new Error("History file did not contain valid entries.");const u=[...N(e.routeId),...o].slice(0,80);H(e.routeId,u),a(),_(e.prefix,`Imported ${o.length} history entries.`,"success")}catch(d){_(e.prefix,d instanceof Error?d.message:"Failed to import history.","error")}finally{n.value=""}},i.readAsText(s)})}function Xa(e){var h,g,y,$;const{config:a,createDefaultState:t,getCurrentState:r,mountTrainingState:n,onStateChange:s,applyEditableRecord:i,buildPreparedTrainingPayload:l,bindHistoryPanel:d,openHistoryPanel:o,openPresetPanel:u}=e;document.querySelectorAll(`#${a.prefix}-gpu-selector input[data-gpu-id]`).forEach(T=>{T.addEventListener("change",()=>{const le=r();le&&s(le)})}),(h=document.querySelector(`#${a.prefix}-reset-all`))==null||h.addEventListener("click",()=>{const T=t();ie(a.prefix,[]),n(T),_(a.prefix,"Reset to schema defaults.","warning")}),(g=document.querySelector(`#${a.prefix}-save-params`))==null||g.addEventListener("click",()=>{const T=r();T&&(Va(a,T,d),_(a.prefix,"Current parameters saved to history.","success"))}),(y=document.querySelector(`#${a.prefix}-read-params`))==null||y.addEventListener("click",()=>{o()}),($=document.querySelector(`#${a.prefix}-load-presets`))==null||$.addEventListener("click",()=>{u()}),Ma(a,r,l,i),Wa(a,o),Ha(a),Ba(a,r,l)}function Ga(e,a){let t=null;const r=()=>{const l=N(e.routeId);qa(e.prefix,l),document.querySelectorAll(`#${e.prefix}-history-panel [data-history-close]`).forEach(d=>{d.addEventListener("click",()=>L(e.prefix,"history",!1))}),document.querySelectorAll(`#${e.prefix}-history-panel [data-history-export]`).forEach(d=>{d.addEventListener("click",()=>{et(`${e.prefix}-history-${Ce()}.json`,JSON.stringify(N(e.routeId),null,2),"application/json;charset=utf-8"),_(e.prefix,"History exported.","success")})}),document.querySelectorAll(`#${e.prefix}-history-panel [data-history-import]`).forEach(d=>{d.addEventListener("click",()=>{var o;(o=document.querySelector(`#${e.prefix}-history-file-input`))==null||o.click()})}),document.querySelectorAll(`#${e.prefix}-history-panel [data-history-apply]`).forEach(d=>{d.addEventListener("click",()=>{const o=Number(d.dataset.historyApply??"-1"),u=N(e.routeId)[o];u&&(a(u.value,u.gpu_ids,"replace"),L(e.prefix,"history",!1),_(e.prefix,`Applied snapshot: ${u.name||"Unnamed snapshot"}.`,"success"))})}),document.querySelectorAll(`#${e.prefix}-history-panel [data-history-rename]`).forEach(d=>{d.addEventListener("click",()=>{const o=Number(d.dataset.historyRename??"-1"),u=N(e.routeId),h=u[o];if(!h)return;const g=window.prompt("Rename snapshot",h.name||"");g&&(h.name=g.trim(),H(e.routeId,u),r(),_(e.prefix,"Snapshot renamed.","success"))})}),document.querySelectorAll(`#${e.prefix}-history-panel [data-history-delete]`).forEach(d=>{d.addEventListener("click",()=>{const o=Number(d.dataset.historyDelete??"-1"),u=N(e.routeId),h=u[o];h&&window.confirm(`Delete snapshot "${h.name||"Unnamed snapshot"}"?`)&&(u.splice(o,1),H(e.routeId,u),r(),_(e.prefix,"Snapshot deleted.","success"))})})},n=()=>{r(),L(e.prefix,"history",!0)},s=()=>{Oa(e.prefix,t??[]),document.querySelectorAll(`#${e.prefix}-presets-panel [data-preset-close]`).forEach(l=>{l.addEventListener("click",()=>L(e.prefix,"presets",!1))}),document.querySelectorAll(`#${e.prefix}-presets-panel [data-preset-apply]`).forEach(l=>{l.addEventListener("click",()=>{const d=Number(l.dataset.presetApply??"-1"),o=t==null?void 0:t[d];if(!o)return;const u=o.data??{};a(u,void 0,"merge"),L(e.prefix,"presets",!1),_(e.prefix,`Applied preset: ${String((o.metadata??{}).name||o.name||"preset")}.`,"success")})})};return{bindHistoryPanel:r,openHistoryPanel:n,openPresetPanel:async()=>{var l;if(!t)try{const d=await Le();t=Fa(e,((l=d.data)==null?void 0:l.presets)??[])}catch(d){_(e.prefix,d instanceof Error?d.message:"Failed to load presets.","error");return}s(),L(e.prefix,"presets",!0)}}}async function Ka(e){var l,d,o,u;const a=Vt(e.prefix),[t,r]=await Promise.allSettled([te(),Pe()]);if(r.status==="fulfilled"){const h=((l=r.value.data)==null?void 0:l.cards)??[],g=(d=r.value.data)==null?void 0:d.xformers;fa(`${e.prefix}-gpu-selector`,h),p(`${e.prefix}-runtime-title`,`${h.length} GPU entries reachable`),m(`${e.prefix}-runtime-body`,`
        <p>${c(Re(h))}</p>
        <p>${c(g?`xformers: ${g.installed?"installed":"missing"}, ${g.supported?"supported":"fallback"} (${g.reason})`:"xformers info unavailable")}</p>
      `)}else p(`${e.prefix}-runtime-title`,"GPU runtime request failed"),p(`${e.prefix}-runtime-body`,r.reason instanceof Error?r.reason.message:"Unknown error");if(t.status!=="fulfilled")return p(a.summaryId,`${e.modelLabel} schema request failed`),m(a.sectionsId,`<p>${t.reason instanceof Error?c(t.reason.message):"Unknown error"}</p>`),I(a.previewId,"{}"),w(e.prefix,"Schema unavailable",`The ${e.modelLabel} training bridge could not load the backend schema.`,"error"),null;const n=((o=t.value.data)==null?void 0:o.schemas)??[],s=Ie(n),i=(u=z(s).find(h=>h.name===e.schemaName))==null?void 0:u.name;return i?{domIds:a,createDefaultState:()=>O(s,i)}:(p(a.summaryId,`No ${e.schemaName} schema was returned.`),m(a.sectionsId,`<p>The backend did not expose ${c(e.schemaName)}.</p>`),w(e.prefix,"Schema missing",`The backend did not expose the ${e.schemaName} schema.`,"error"),null)}const Se={};function Ja(e,a){const t=Oe(a),r=se(`${e}-gpu-selector`);r.length>0&&(t.gpu_ids=r);const n=Xe(t);return{payload:n,checks:Ia(n)}}function tt(e){return new Set(e.sections.flatMap(a=>a.fields.map(t=>t.path)))}function at(e,a){const t=tt(e),r={...e.values};for(const[n,s]of Object.entries(a))t.has(n)&&(r[n]=s);return{...e,values:r}}function Ya(e,a){return{...e,values:{...e.values,...Object.fromEntries(Object.entries(a).filter(([t])=>tt(e).has(t)))}}}function Za(e,a){return a&&a.length>0?a.map(t=>String(t)):Array.isArray(e.gpu_ids)?e.gpu_ids.map(t=>String(t)):[]}function Qa(e,a){Ua(e.routeId,{time:new Date().toLocaleString(),name:Ke(e,a),value:B(a.values),gpu_ids:se(`${e.prefix}-gpu-selector`)})}function er(e){const{config:a,createDefaultState:t,mountTrainingState:r}=e,n=za(a.routeId),s=n!=null&&n.value?at(t(),Ge(n.value)):t();(n==null?void 0:n.gpu_ids)!==void 0&&ie(a.prefix,n.gpu_ids),r(s),n!=null&&n.value&&_(a.prefix,"Restored autosaved parameters for this route.","success")}function tr(e,a,t,r){return n=>{try{const s=t(n),i=Object.fromEntries(Object.entries(s.payload).sort(([l],[d])=>l.localeCompare(d)));I(a.previewId,JSON.stringify(i,null,2)),Z(e.prefix,s.checks)}catch(s){I(a.previewId,"{}"),Z(e.prefix,{warnings:[],errors:[]},s instanceof Error?s.message:"The current state could not be converted into a launch payload.")}r(n)}}function ar(e,a,t){const r=()=>Se[e.routeId],n=o=>Ja(e.prefix,o),s=tr(e,a,n,o=>Qa(e,o)),i=o=>{j(o,a,u=>{Se[e.routeId]=u},s)};return{getCurrentState:r,prepareTrainingPayload:n,onStateChange:s,mountTrainingState:i,applyEditableRecord:(o,u,h="replace")=>{const g=h==="merge"?r()??t():t(),y=Ge(o),$=h==="merge"?Ya(g,y):at(g,y);ie(e.prefix,Za(y,u)),i($)},restoreAutosave:()=>er({config:e,createDefaultState:t,mountTrainingState:i})}}async function rr(e){const a=await Ka(e);if(!a)return;const t=ar(e,a.domIds,a.createDefaultState),r=Ga(e,t.applyEditableRecord);t.restoreAutosave(),Xa({config:e,createDefaultState:a.createDefaultState,getCurrentState:t.getCurrentState,mountTrainingState:t.mountTrainingState,onStateChange:t.onStateChange,applyEditableRecord:t.applyEditableRecord,buildPreparedTrainingPayload:t.prepareTrainingPayload,bindHistoryPanel:r.bindHistoryPanel,openHistoryPanel:r.openHistoryPanel,openPresetPanel:r.openPresetPanel}),w(e.prefix,`${e.modelLabel} bridge ready`,"You can review the generated payload and submit the current config to /api/run.","success"),L(e.prefix,"history",!1),L(e.prefix,"presets",!1)}const nr={overview:Fe,about:Xt,settings:ra,tasks:sa,tageditor:na,tensorboard:ia,tools:oa,"schema-bridge":Yt,"sdxl-train":aa,"flux-train":Jt,"sd3-train":Zt,"dreambooth-train":Gt,"sd-controlnet-train":Qt,"sdxl-controlnet-train":ea,"flux-controlnet-train":Kt,"sdxl-lllite-train":ta};function sr(e){const a={overview:R.filter(t=>t.section==="overview"),phase1:R.filter(t=>t.section==="phase1"),reference:R.filter(t=>t.section==="reference")};return`
    <div class="nav-group">
      <p class="nav-heading">Workspace</p>
      ${a.overview.map(t=>X(t.hash,t.label,t.description,e)).join("")}
    </div>
    <div class="nav-group">
      <p class="nav-heading">Phase 1 Pages</p>
      ${a.phase1.map(t=>X(t.hash,t.label,t.description,e)).join("")}
    </div>
    <div class="nav-group">
      <p class="nav-heading">Core Bridge</p>
      ${a.reference.map(t=>X(t.hash,t.label,t.description,e)).join("")}
    </div>
  `}function X(e,a,t,r){return`
    <a class="nav-link ${e===r?"is-active":""}" href="${e}">
      <span>${a}</span>
      <small>${t}</small>
    </a>
  `}async function ir(e){e==="overview"?await $t():e==="settings"?await wt():e==="tasks"?await Pt():e==="tageditor"?await Tt():e==="tools"?await Lt():e==="schema-bridge"?await Mt(()=>{}):ke[e]&&await rr(ke[e])}async function or(e){ma();const a=ha(),t=nr[a.id]??Fe;e.innerHTML=Wt(a.hash,t());const r=document.querySelector("#side-nav");r&&(r.innerHTML=sr(a.hash)),await ir(a.id)}const rt=document.querySelector("#app");if(!(rt instanceof HTMLElement))throw new Error("App root not found.");const lr=rt;async function nt(){await or(lr)}window.addEventListener("hashchange",()=>{nt()});nt();
