var bt=Object.defineProperty;var yt=(e,t,a)=>t in e?bt(e,t,{enumerable:!0,configurable:!0,writable:!0,value:a}):e[t]=a;var w=(e,t,a)=>yt(e,typeof t!="symbol"?t+"":t,a);(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))n(s);new MutationObserver(s=>{for(const i of s)if(i.type==="childList")for(const r of i.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&n(r)}).observe(document,{childList:!0,subtree:!0});function a(s){const i={};return s.integrity&&(i.integrity=s.integrity),s.referrerPolicy&&(i.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?i.credentials="include":s.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function n(s){if(s.ep)return;s.ep=!0;const i=a(s);fetch(s.href,i)}})();const le="".replace(/\/$/,"");async function S(e){const t=await fetch(`${le}${e}`,{headers:{Accept:"application/json"}});if(!t.ok)throw new Error(`${t.status} ${t.statusText}`);return await t.json()}async function T(e,t){const a=await fetch(`${le}${e}`,{method:"POST",headers:{Accept:"application/json","Content-Type":"application/json"},body:JSON.stringify(t)});if(!a.ok)throw new Error(`${a.status} ${a.statusText}`);return await a.json()}async function vt(e){const t=await fetch(`${le}${e}`,{headers:{Accept:"application/json"}});if(!t.ok)throw new Error(`${t.status} ${t.statusText}`);return await t.json()}async function kt(){return S("/api/schemas/hashes")}async function ce(){return S("/api/schemas/all")}async function Fe(){return S("/api/presets")}async function _t(){return S("/api/config/saved_params")}async function wt(){return S("/api/config/summary")}async function de(){return S("/api/tasks")}async function He(e){return S(`/api/tasks/terminate/${e}`)}async function Ue(){return S("/api/graphic_cards")}async function ze(){return vt("/api/tageditor_status")}async function $t(){return S("/api/scripts")}async function xt(e){return T("/api/dataset/analyze",e)}async function St(){return S("/api/interrogators")}async function j(e){var a;const t=await S(`/api/pick_file?picker_type=${encodeURIComponent(e)}`);if(t.status!=="success"||!((a=t.data)!=null&&a.path))throw new Error(t.message||"File picker did not return a path.");return t.data.path}async function Tt(e){return T("/api/interrogate",e)}async function Lt(e){return T("/api/captions/cleanup/preview",e)}async function Pt(e){return T("/api/captions/cleanup/apply",e)}async function Et(e){return T("/api/captions/backups/create",e)}async function At(e){return T("/api/captions/backups/list",e)}async function It(e){return T("/api/captions/backups/restore",e)}async function Nt(e){return T("/api/run",e)}async function Ct(e){return T("/api/train/preflight",e)}async function Rt(e){return T("/api/train/sample_prompt",e)}function p(e,t){const a=document.querySelector(`#${e}`);a&&(a.textContent=t)}function h(e,t){const a=document.querySelector(`#${e}`);a&&(a.innerHTML=t)}function D(e,t){const a=document.querySelector(`#${e}`);a&&(a.textContent=t)}const Ve=[{route:"index.html",title:"SD-reScripts | SD training UI",section:"core",status:"migrate-first",notes:"Landing page and main navigation entry. Good first candidate for source migration."},{route:"lora/index.html",title:"LoRA training index",section:"training",status:"migrate-first",notes:"Top-level training model selector page.",schemaHints:["shared"]},{route:"lora/sdxl.html",title:"SDXL LoRA training",section:"training",status:"migrate-first",notes:"Primary training page currently used most often.",schemaHints:["sdxl-lora","shared"]},{route:"lora/flux.html",title:"Flux LoRA training",section:"training",status:"migrate-first",notes:"Now mirrored by the shared source-side training bridge.",schemaHints:["flux-lora","shared"]},{route:"lora/sd3.html",title:"SD3 training",section:"training",status:"migrate-first",notes:"Now mirrored by the shared source-side training bridge.",schemaHints:["sd3-lora","shared"]},{route:"lora/controlnet.html",title:"SD ControlNet training",section:"training",status:"migrate-first",notes:"Now mirrored by the shared source-side training bridge.",schemaHints:["sd-controlnet","shared"]},{route:"lora/sdxl-controlnet.html",title:"SDXL ControlNet training",section:"training",status:"migrate-first",notes:"Now mirrored by the shared source-side training bridge.",schemaHints:["sdxl-controlnet","shared"]},{route:"lora/sdxl-lllite.html",title:"SDXL LLLite training",section:"training",status:"migrate-first",notes:"Specialized SDXL conditioning route now mirrored by the shared source-side bridge.",schemaHints:["sdxl-controlnet-lllite","shared"]},{route:"lora/flux-controlnet.html",title:"Flux ControlNet training",section:"training",status:"migrate-first",notes:"Now mirrored by the shared source-side training bridge.",schemaHints:["flux-controlnet","shared"]},{route:"lora/basic.html",title:"LoRA basic mode",section:"training",status:"legacy-dist",notes:"Legacy beginner-mode training route.",schemaHints:["lora-basic","shared"]},{route:"lora/master.html",title:"LoRA expert mode",section:"training",status:"legacy-dist",notes:"Legacy expert-mode training route.",schemaHints:["lora-master","shared"]},{route:"lora/params.html",title:"Training parameter reference",section:"training",status:"migrate-first",notes:"Mostly explanatory UI. Lower risk to recreate cleanly."},{route:"lora/tools.html",title:"LoRA tools",section:"tools",status:"migrate-first",notes:"Tool launcher route for merge, resize, interrogate and conversion flows."},{route:"dreambooth/index.html",title:"Dreambooth training",section:"training",status:"migrate-first",notes:"Now mirrored by the shared source-side training bridge for Dreambooth and SDXL full finetune.",schemaHints:["dreambooth","shared"]},{route:"tagger.html",title:"Tagger tool",section:"tools",status:"migrate-first",notes:"Standalone caption/tag generation route that talks to backend APIs.",schemaHints:["tagger"]},{route:"tageditor.html",title:"Tag editor proxy page",section:"tools",status:"migrate-first",notes:"Wrapper page with progress/failure states. Good candidate to reimplement cleanly."},{route:"task.html",title:"Task monitor",section:"system",status:"migrate-first",notes:"Task status page backed by /api/tasks."},{route:"tensorboard.html",title:"TensorBoard proxy page",section:"system",status:"migrate-first",notes:"Wrapper/proxy page. Safer than schema-heavy form routes."},{route:"other/settings.html",title:"Settings page",section:"system",status:"migrate-first",notes:"Static/system page that should be easy to recreate in source form."},{route:"other/about.html",title:"About page",section:"core",status:"migrate-first",notes:"Mostly branding and release notes. Best low-risk migration target."},{route:"404.html",title:"Fallback page",section:"core",status:"legacy-dist",notes:"Can be replaced after the main router is rebuilt."}];function l(e){return String(e).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;")}function K(e){return JSON.parse(JSON.stringify(e))}function We(e=new Date){return e.toISOString().replaceAll(":","-").replaceAll(".","-")}function Bt(e){if(e.length===0){h("schema-browser","<p>No schemas returned.</p>");return}const t=e.map(a=>{var s;const n=((s=a.schema.split(/\r?\n/).find(i=>i.trim().length>0))==null?void 0:s.trim())||"No preview available.";return`
        <article class="schema-card">
          <div class="schema-head">
            <h3>${l(a.name)}</h3>
            <span class="schema-hash">${l(a.hash.slice(0,8))}</span>
          </div>
          <p>${l(n)}</p>
        </article>
      `}).join("");h("schema-browser",t)}function qt(e){const t=new Set(Ve.flatMap(i=>i.schemaHints??[])),a=new Set(e.map(i=>i.name)),n=[...t].filter(i=>a.has(i)).sort(),s=e.map(i=>i.name).filter(i=>!t.has(i)).sort();h("schema-mapped",n.length?n.map(i=>`<span class="coverage-pill">${l(i)}</span>`).join(""):"<p>No mapped schema hints yet.</p>"),h("schema-unmapped",s.length?s.map(i=>`<span class="coverage-pill coverage-pill-muted">${l(i)}</span>`).join(""):"<p>All schemas are represented in the current route hints.</p>")}function Dt(e){if(e.length===0){h("task-table-container","<p>No tasks currently tracked.</p>");return}const t=e.map(a=>`
        <tr>
          <td><code>${l(a.id??a.task_id??"unknown")}</code></td>
          <td>${l(a.status??"unknown")}</td>
          <td>
            <button class="action-button action-button-small" data-task-terminate="${l(a.id??a.task_id??"")}" type="button">
              Terminate
            </button>
          </td>
        </tr>
      `).join("");h("task-table-container",`
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>${t}</tbody>
      </table>
    `)}function jt(e){if(e.length===0){h("tools-browser","<p>No scripts returned.</p>");return}const t=e.map(a=>`
        <article class="tool-card">
          <div class="tool-card-head">
            <h3>${l(a.name)}</h3>
            <span class="coverage-pill ${a.category==="networks"?"":"coverage-pill-muted"}">${l(a.category)}</span>
          </div>
          <p>${a.positional_args.length>0?`Positional args: ${a.positional_args.map(n=>`<code>${l(n)}</code>`).join(", ")}`:"No positional args required."}</p>
        </article>
      `).join("");h("tools-browser",t)}function Ot(e){const t=[{label:"Images",value:e.summary.image_count},{label:"Effective images",value:e.summary.effective_image_count},{label:"Alpha-capable candidates",value:e.summary.alpha_capable_image_count},{label:"Caption coverage",value:ve(e.summary.caption_coverage)},{label:"Unique tags",value:e.summary.unique_tag_count},{label:"Caption files",value:e.summary.caption_file_count},{label:"Avg tags / caption",value:e.summary.average_tags_per_caption.toFixed(2)}],a=e.warnings.length?`
      <article class="dataset-analysis-block dataset-analysis-warning">
        <p class="panel-kicker">warnings</p>
        <ul class="dataset-analysis-list-plain">
          ${e.warnings.map(s=>`<li>${l(s)}</li>`).join("")}
        </ul>
      </article>
    `:"",n=e.folders.length?e.folders.map(s=>`
            <article class="dataset-analysis-block">
              <div class="tool-card-head">
                <h3>${l(s.name)}</h3>
                <span class="coverage-pill ${s.caption_coverage>=1?"":"coverage-pill-muted"}">
                  ${ve(s.caption_coverage)}
                </span>
              </div>
              <p><code>${l(s.path)}</code></p>
              <p>
                Images: <strong>${s.image_count}</strong>
                · Effective: <strong>${s.effective_image_count}</strong>
                · Repeats: <strong>${s.repeats??1}</strong>
              </p>
              <p>Alpha-capable candidates: <strong>${s.alpha_capable_image_count}</strong></p>
              <p>
                Missing captions: <strong>${s.missing_caption_count}</strong>
                · Orphan captions: <strong>${s.orphan_caption_count}</strong>
                · Empty captions: <strong>${s.empty_caption_count}</strong>
              </p>
            </article>
          `).join(""):"<p>No dataset folder summary returned.</p>";h("dataset-analysis-results",`
      ${a}
      <section class="dataset-analysis-grid">
        ${t.map(s=>`
              <article class="dataset-analysis-stat">
                <span class="metric-label">${l(s.label)}</span>
                <strong class="dataset-analysis-stat-value">${l(s.value)}</strong>
              </article>
            `).join("")}
      </section>
      <section class="dataset-analysis-columns">
        <article class="dataset-analysis-block">
          <p class="panel-kicker">scan</p>
          <h3>Dataset summary</h3>
          <p><code>${l(e.root_path)}</code></p>
          <p>Mode: <code>${l(e.scan_mode)}</code></p>
          <p>Caption extension: <code>${l(e.caption_extension)}</code></p>
          <p>Dataset folders: <strong>${e.summary.dataset_folder_count}</strong></p>
          <p>Alpha-capable candidates: <strong>${e.summary.alpha_capable_image_count}</strong></p>
          <p>Images without captions: <strong>${e.summary.images_without_caption_count}</strong></p>
          <p>Broken images: <strong>${e.summary.broken_image_count}</strong></p>
        </article>
        <article class="dataset-analysis-block">
          <p class="panel-kicker">tags</p>
          <h3>Top tags</h3>
          ${Me(e.top_tags,"No caption tags found yet.")}
        </article>
        <article class="dataset-analysis-block">
          <p class="panel-kicker">images</p>
          <h3>Top resolutions</h3>
          ${Y(e.top_resolutions,"No resolution data collected.")}
        </article>
        <article class="dataset-analysis-block">
          <p class="panel-kicker">mix</p>
          <h3>Orientation + formats</h3>
          <div>${Y(e.orientation_counts,"No orientation data.")}</div>
          <div class="dataset-analysis-sublist">${Y(e.image_extensions,"No image extension data.")}</div>
        </article>
      </section>
      <section class="dataset-analysis-columns">
        <article class="dataset-analysis-block">
          <p class="panel-kicker">folders</p>
          <h3>Per-folder coverage</h3>
          <div class="dataset-analysis-stack">${n}</div>
        </article>
        <article class="dataset-analysis-block">
          <p class="panel-kicker">samples</p>
          <h3>Quick path samples</h3>
          <div class="dataset-analysis-sublist">
            <h4>Missing captions</h4>
            ${A(e.samples.images_without_caption,"No missing-caption samples.")}
          </div>
          <div class="dataset-analysis-sublist">
            <h4>Orphan captions</h4>
            ${A(e.samples.orphan_captions,"No orphan-caption samples.")}
          </div>
          <div class="dataset-analysis-sublist">
            <h4>Broken images</h4>
            ${A(e.samples.broken_images,"No broken-image samples.")}
          </div>
        </article>
      </section>
    `)}function Ft(e,t="caption-cleanup-results"){const a=[{label:"Caption files",value:e.summary.file_count},{label:"Changed",value:e.summary.changed_file_count},{label:"Unchanged",value:e.summary.unchanged_file_count},{label:"Tag instances removed",value:e.summary.removed_tag_instances},{label:"Tag instances added",value:e.summary.added_tag_instances},{label:"Empty results",value:e.summary.empty_result_count}],n=e.warnings.length?`
      <article class="dataset-analysis-block dataset-analysis-warning">
        <p class="panel-kicker">warnings</p>
        <ul class="dataset-analysis-list-plain">
          ${e.warnings.map(i=>`<li>${l(i)}</li>`).join("")}
        </ul>
      </article>
    `:"",s=e.samples.length?e.samples.map(i=>`
            <article class="dataset-analysis-block">
              <div class="tool-card-head">
                <h3>${l(i.path)}</h3>
                <span class="coverage-pill ${i.before!==i.after?"":"coverage-pill-muted"}">
                  ${i.before_count} -> ${i.after_count}
                </span>
              </div>
              <div class="dataset-cleanup-diff">
                <div>
                  <p class="panel-kicker">before</p>
                  <pre>${l(i.before||"(empty)")}</pre>
                </div>
                <div>
                  <p class="panel-kicker">after</p>
                  <pre>${l(i.after||"(empty)")}</pre>
                </div>
              </div>
              <div class="dataset-analysis-sublist">
                <h4>Removed tags</h4>
                ${A(i.removed_tags,"No explicit tag removals in sample.")}
              </div>
              <div class="dataset-analysis-sublist">
                <h4>Added tags</h4>
                ${A(i.added_tags,"No explicit tag additions in sample.")}
              </div>
            </article>
          `).join(""):"<p>No sample caption changes were captured.</p>";h(t,`
      ${n}
      <section class="dataset-analysis-grid">
        ${a.map(i=>`
              <article class="dataset-analysis-stat">
                <span class="metric-label">${l(i.label)}</span>
                <strong class="dataset-analysis-stat-value">${l(i.value)}</strong>
              </article>
            `).join("")}
      </section>
      <section class="dataset-analysis-columns">
        <article class="dataset-analysis-block">
          <p class="panel-kicker">${l(e.mode)}</p>
          <h3>Cleanup scope</h3>
          <p><code>${l(e.root_path)}</code></p>
          <p>Caption extension: <code>${l(e.caption_extension)}</code></p>
          <p>Recursive scan: <strong>${e.recursive?"yes":"no"}</strong></p>
          <p>Whitespace normalize: <strong>${e.options.collapse_whitespace?"yes":"no"}</strong></p>
          <p>Replace underscore: <strong>${e.options.replace_underscore?"yes":"no"}</strong></p>
          ${e.backup?`<p>Auto backup: <code>${l(e.backup.archive_name)}</code></p>`:""}
        </article>
        <article class="dataset-analysis-block">
          <p class="panel-kicker">rules</p>
          <h3>Rule summary</h3>
          ${Me([e.options.dedupe_tags?{name:"dedupe tags",count:1}:null,e.options.sort_tags?{name:"sort tags",count:1}:null,e.options.use_regex?{name:"regex replace",count:1}:null].filter(Boolean),"No boolean cleanup switches enabled.")}
          <div class="dataset-analysis-sublist">
            <h4>Remove tags</h4>
            ${A(e.options.remove_tags,"No exact tags configured for removal.")}
          </div>
          <div class="dataset-analysis-sublist">
            <h4>Prepend tags</h4>
            ${A(e.options.prepend_tags,"No prepend tags configured.")}
          </div>
          <div class="dataset-analysis-sublist">
            <h4>Append tags</h4>
            ${A(e.options.append_tags,"No append tags configured.")}
          </div>
        </article>
        <article class="dataset-analysis-block">
          <p class="panel-kicker">replace</p>
          <h3>Search and replace</h3>
          <p>Search: <code>${l(e.options.search_text||"(none)")}</code></p>
          <p>Replace: <code>${l(e.options.replace_text||"(empty)")}</code></p>
          <p>Mode: <strong>${e.options.use_regex?"regex":"literal"}</strong></p>
          <p>Total tags: <strong>${e.summary.total_tags_before}</strong> -> <strong>${e.summary.total_tags_after}</strong></p>
        </article>
      </section>
      <section class="dataset-analysis-columns">
        <article class="dataset-analysis-block">
          <p class="panel-kicker">samples</p>
          <h3>Previewed caption diffs</h3>
          <div class="dataset-analysis-stack">${s}</div>
        </article>
      </section>
    `)}function Ht(e,t,a="caption-backup-results"){if(!e.length){h(a,`
        <article class="dataset-analysis-block">
          <p class="panel-kicker">snapshots</p>
          <h3>No caption snapshots found</h3>
          <p>Create the first backup for this folder to get a restore point before cleanup or tagging.</p>
        </article>
      `);return}const n=e.map(s=>`
        <article class="dataset-analysis-block ${s.archive_name===t?"dataset-analysis-selected":""}">
          <div class="tool-card-head">
            <h3>${l(s.snapshot_name)}</h3>
            <span class="coverage-pill ${s.archive_name===t?"":"coverage-pill-muted"}">
              ${l(s.archive_name)}
            </span>
          </div>
          <p><code>${l(s.source_root)}</code></p>
          <p>Created: <strong>${l(s.created_at||"unknown")}</strong></p>
          <p>Caption files: <strong>${s.file_count}</strong> · Archive size: <strong>${zt(s.archive_size)}</strong></p>
          <p>Extension: <code>${l(s.caption_extension||".txt")}</code> · Recursive: <strong>${s.recursive?"yes":"no"}</strong></p>
        </article>
      `).join("");h(a,`<div class="dataset-analysis-stack">${n}</div>`)}function Ut(e,t="caption-backup-results"){const a=e.warnings.length?`
      <article class="dataset-analysis-block dataset-analysis-warning">
        <p class="panel-kicker">warnings</p>
        <ul class="dataset-analysis-list-plain">
          ${e.warnings.map(n=>`<li>${l(n)}</li>`).join("")}
        </ul>
      </article>
    `:"";h(t,`
      ${a}
      <section class="dataset-analysis-grid">
        <article class="dataset-analysis-stat">
          <span class="metric-label">Restored files</span>
          <strong class="dataset-analysis-stat-value">${e.restored_file_count}</strong>
        </article>
        <article class="dataset-analysis-stat">
          <span class="metric-label">Overwritten</span>
          <strong class="dataset-analysis-stat-value">${e.overwritten_file_count}</strong>
        </article>
        <article class="dataset-analysis-stat">
          <span class="metric-label">Created</span>
          <strong class="dataset-analysis-stat-value">${e.created_file_count}</strong>
        </article>
      </section>
      <section class="dataset-analysis-columns">
        <article class="dataset-analysis-block">
          <p class="panel-kicker">restored</p>
          <h3>${l(e.snapshot_name)}</h3>
          <p><code>${l(e.source_root)}</code></p>
          <p>Archive: <code>${l(e.archive_name)}</code></p>
        </article>
        <article class="dataset-analysis-block">
          <p class="panel-kicker">safety</p>
          <h3>Pre-restore backup</h3>
          ${e.pre_restore_backup?`<p>Created <code>${l(e.pre_restore_backup.archive_name)}</code> before restore.</p>`:"<p>Pre-restore backup was not created for this restore operation.</p>"}
        </article>
      </section>
    `)}function Me(e,t){return e.length?`
    <div class="coverage-list">
      ${e.map(a=>`<span class="coverage-pill">${l(a.name)} <strong>${a.count}</strong></span>`).join("")}
    </div>
  `:`<p>${l(t)}</p>`}function Y(e,t){return e.length?`
    <ul class="dataset-analysis-list-plain">
      ${e.map(a=>`<li><code>${l(a.name)}</code> <strong>${a.count}</strong></li>`).join("")}
    </ul>
  `:`<p>${l(t)}</p>`}function A(e,t){return e.length?`
    <ul class="dataset-analysis-list-plain">
      ${e.map(a=>`<li><code>${l(a)}</code></li>`).join("")}
    </ul>
  `:`<p>${l(t)}</p>`}function ve(e){return`${(e*100).toFixed(1)}%`}function zt(e){return e<1024?`${e} B`:e<1024**2?`${(e/1024).toFixed(1)} KB`:e<1024**3?`${(e/1024**2).toFixed(1)} MB`:`${(e/1024**3).toFixed(2)} GB`}function Ge(e){return e.length===0?"No cards reported yet.":e.map((t,a)=>`GPU ${t.index??t.id??a}: ${t.name}`).join(" | ")}function Vt(e){if(e.length===0)return"No tasks currently tracked.";const t=e.filter(a=>a.status&&!["FINISHED","TERMINATED","FAILED"].includes(String(a.status))).length;return`${e.length} tracked, ${t} active`}function Wt(e){var a;const t=(a=e.detail)==null?void 0:a.trim();return t?`${e.status} - ${t}`:e.status}async function Mt(){var c,d,o,u,m,g;const e=await Promise.allSettled([kt(),Fe(),de(),Ue(),ze(),ce()]),[t,a,n,s,i,r]=e;if(t.status==="fulfilled"){const y=((c=t.value.data)==null?void 0:c.schemas)??[];p("diag-schemas-title",`${y.length} schema hashes loaded`),p("diag-schemas-detail",y.slice(0,4).map(_=>_.name).join(", ")||"No schema names returned.")}else p("diag-schemas-title","Schema hash request failed"),p("diag-schemas-detail",t.reason instanceof Error?t.reason.message:"Unknown error");if(a.status==="fulfilled"){const y=((d=a.value.data)==null?void 0:d.presets)??[];p("diag-presets-title",`${y.length} presets loaded`),p("diag-presets-detail","Source migration can reuse preset grouping later.")}else p("diag-presets-title","Preset request failed"),p("diag-presets-detail",a.reason instanceof Error?a.reason.message:"Unknown error");if(n.status==="fulfilled"){const y=((o=n.value.data)==null?void 0:o.tasks)??[];p("diag-tasks-title","Task manager reachable"),p("diag-tasks-detail",Vt(y))}else p("diag-tasks-title","Task request failed"),p("diag-tasks-detail",n.reason instanceof Error?n.reason.message:"Unknown error");if(s.status==="fulfilled"){const y=((u=s.value.data)==null?void 0:u.cards)??[],_=(m=s.value.data)==null?void 0:m.xformers,$=_?`xformers: ${_.installed?"installed":"missing"}, ${_.supported?"supported":"fallback"}`:"xformers info unavailable";p("diag-gpu-title",`${y.length} GPU entries reachable`),p("diag-gpu-detail",`${Ge(y)} | ${$}`)}else p("diag-gpu-title","GPU request failed"),p("diag-gpu-detail",s.reason instanceof Error?s.reason.message:"Unknown error");if(i.status==="fulfilled"?(p("diag-tageditor-title","Tag editor status reachable"),p("diag-tageditor-detail",Wt(i.value))):(p("diag-tageditor-title","Tag editor status request failed"),p("diag-tageditor-detail",i.reason instanceof Error?i.reason.message:"Unknown error")),r.status==="fulfilled"){const y=((g=r.value.data)==null?void 0:g.schemas)??[];Bt(y),qt(y)}else h("schema-browser",`<p>${r.reason instanceof Error?r.reason.message:"Schema inventory request failed."}</p>`)}async function Gt(){const[e,t]=await Promise.allSettled([wt(),_t()]);if(e.status==="fulfilled"){const a=e.value.data;p("settings-summary-title",`${(a==null?void 0:a.saved_param_count)??0} remembered param groups`),h("settings-summary-body",`
        <p><strong>Config file:</strong> <code>${l((a==null?void 0:a.config_path)??"unknown")}</code></p>
        <p><strong>Last path:</strong> <code>${l((a==null?void 0:a.last_path)||"(empty)")}</code></p>
        <p><strong>Saved keys:</strong> ${((a==null?void 0:a.saved_param_keys)??[]).map(n=>`<code>${l(n)}</code>`).join(", ")||"none"}</p>
      `)}else p("settings-summary-title","Config summary request failed"),p("settings-summary-body",e.reason instanceof Error?e.reason.message:"Unknown error");if(t.status==="fulfilled"){const a=t.value.data??{},n=Object.keys(a);p("settings-params-title",`${n.length} saved param entries`),h("settings-params-body",n.length?`<div class="coverage-list">${n.map(s=>`<span class="coverage-pill coverage-pill-muted">${l(s)}</span>`).join("")}</div>`:"<p>No saved params returned.</p>")}else p("settings-params-title","Saved params request failed"),p("settings-params-body",t.reason instanceof Error?t.reason.message:"Unknown error")}const Xt="".replace(/\/$/,""),Kt=Xt||"";function L(e){return/^https?:\/\//.test(e)?e:(e.startsWith("/")||(e=`/${e}`),`${Kt}${e}`)}async function Jt(){try{const e=await ze();p("tag-editor-status-title",`Current status: ${e.status}`),h("tag-editor-status-body",`
        <p>${l(e.detail||"No extra detail returned.")}</p>
        <p><a class="text-link" href="${L("/tageditor.html")}" target="_blank" rel="noreferrer">Open current shipped wrapper page</a></p>
      `)}catch(e){p("tag-editor-status-title","Tag editor status request failed"),p("tag-editor-status-body",e instanceof Error?e.message:"Unknown error")}}async function Yt(){var e;Zt(),await Qt(),ea(),ta();try{const a=((e=(await $t()).data)==null?void 0:e.scripts)??[];p("tools-summary-title",`${a.length} launcher scripts available`),h("tools-summary-body",`
        <p>Categories: ${[...new Set(a.map(n=>n.category))].map(n=>`<code>${l(n)}</code>`).join(", ")}</p>
        <p>The tools workspace now includes dataset analysis, batch auto-tagging, caption cleanup, and caption restore snapshots, with more curated high-frequency flows still planned.</p>
      `),jt(a)}catch(t){p("tools-summary-title","Script inventory request failed"),p("tools-summary-body",t instanceof Error?t.message:"Unknown error"),h("tools-browser","<p>Tool inventory failed to load.</p>")}}function Zt(){const e=aa();e&&(e.browseButton.addEventListener("click",async()=>{p("dataset-analysis-status","Opening folder picker...");try{e.pathInput.value=await j("folder"),p("dataset-analysis-status","Folder selected. Ready to analyze.")}catch(t){p("dataset-analysis-status",t instanceof Error?t.message:"Folder picker failed.")}}),e.runButton.addEventListener("click",()=>{ke(e)}),e.pathInput.addEventListener("keydown",t=>{t.key==="Enter"&&(t.preventDefault(),ke(e))}))}async function Qt(){var t;const e=sa();if(e){e.browseButton.addEventListener("click",async()=>{p("batch-tagger-status","Opening folder picker...");try{e.pathInput.value=await j("folder"),p("batch-tagger-status","Folder selected. Ready to launch batch tagging.")}catch(a){p("batch-tagger-status",a instanceof Error?a.message:"Folder picker failed.")}}),e.runButton.addEventListener("click",()=>{_e(e)}),e.pathInput.addEventListener("keydown",a=>{a.key==="Enter"&&(a.preventDefault(),_e(e))});try{const a=await St(),n=((t=a.data)==null?void 0:t.interrogators)??[];if(!n.length)throw new Error("No interrogator models returned.");e.modelSelect.innerHTML=n.map(s=>{var c;const i=s.is_default||s.name===((c=a.data)==null?void 0:c.default)?" selected":"",r=s.kind==="cl"?"CL":"WD";return`<option value="${l(s.name)}"${i}>${l(s.name)} (${r})</option>`}).join(""),p("batch-tagger-status",`Loaded ${n.length} interrogator models.`)}catch(a){e.modelSelect.innerHTML='<option value="wd14-convnextv2-v2">wd14-convnextv2-v2 (WD)</option>',p("batch-tagger-status",a instanceof Error?a.message:"Failed to load interrogator inventory."),h("batch-tagger-results",`<article class="dataset-analysis-block dataset-analysis-warning"><p>${l(a instanceof Error?a.message:"Failed to load interrogator inventory.")}</p></article>`)}}}function ea(){const e=na();e&&(e.browseButton.addEventListener("click",async()=>{p("caption-cleanup-status","Opening folder picker...");try{e.pathInput.value=await j("folder"),p("caption-cleanup-status","Folder selected. Ready to preview cleanup.")}catch(t){p("caption-cleanup-status",t instanceof Error?t.message:"Folder picker failed.")}}),e.previewButton.addEventListener("click",()=>{Z(e,"preview")}),e.applyButton.addEventListener("click",()=>{Z(e,"apply")}),e.pathInput.addEventListener("keydown",t=>{t.key==="Enter"&&(t.preventDefault(),Z(e,"preview"))}))}function ta(){const e=ia();e&&(e.browseButton.addEventListener("click",async()=>{p("caption-backup-status","Opening folder picker...");try{e.pathInput.value=await j("folder"),p("caption-backup-status","Folder selected. Refreshing snapshots..."),await F(e)}catch(t){p("caption-backup-status",t instanceof Error?t.message:"Folder picker failed.")}}),e.refreshButton.addEventListener("click",()=>{F(e)}),e.createButton.addEventListener("click",()=>{ra(e)}),e.restoreButton.addEventListener("click",()=>{oa(e)}),e.selectInput.addEventListener("change",()=>{F(e,e.selectInput.value||null)}))}function aa(){const e=document.querySelector("#dataset-analysis-path"),t=document.querySelector("#dataset-analysis-caption-extension"),a=document.querySelector("#dataset-analysis-top-tags"),n=document.querySelector("#dataset-analysis-sample-limit"),s=document.querySelector("#dataset-analysis-pick"),i=document.querySelector("#dataset-analysis-run");return!e||!t||!a||!n||!s||!i?null:{pathInput:e,captionExtensionInput:t,topTagsInput:a,sampleLimitInput:n,browseButton:s,runButton:i}}function sa(){const e=document.querySelector("#batch-tagger-path"),t=document.querySelector("#batch-tagger-model"),a=document.querySelector("#batch-tagger-threshold"),n=document.querySelector("#batch-tagger-character-threshold"),s=document.querySelector("#batch-tagger-conflict"),i=document.querySelector("#batch-tagger-additional-tags"),r=document.querySelector("#batch-tagger-backup-name"),c=document.querySelector("#batch-tagger-exclude-tags"),d=document.querySelector("#batch-tagger-recursive"),o=document.querySelector("#batch-tagger-replace-underscore"),u=document.querySelector("#batch-tagger-escape-tag"),m=document.querySelector("#batch-tagger-add-rating-tag"),g=document.querySelector("#batch-tagger-add-model-tag"),y=document.querySelector("#batch-tagger-auto-backup"),_=document.querySelector("#batch-tagger-pick"),$=document.querySelector("#batch-tagger-run");return!e||!t||!a||!n||!s||!i||!r||!c||!d||!o||!u||!m||!g||!y||!_||!$?null:{pathInput:e,modelSelect:t,thresholdInput:a,characterThresholdInput:n,conflictSelect:s,additionalTagsInput:i,backupNameInput:r,excludeTagsInput:c,recursiveInput:d,replaceUnderscoreInput:o,escapeTagInput:u,addRatingTagInput:m,addModelTagInput:g,autoBackupInput:y,browseButton:_,runButton:$}}function na(){const e=document.querySelector("#caption-cleanup-path"),t=document.querySelector("#caption-cleanup-extension"),a=document.querySelector("#caption-cleanup-remove-tags"),n=document.querySelector("#caption-cleanup-prepend-tags"),s=document.querySelector("#caption-cleanup-append-tags"),i=document.querySelector("#caption-cleanup-search-text"),r=document.querySelector("#caption-cleanup-replace-text"),c=document.querySelector("#caption-cleanup-backup-name"),d=document.querySelector("#caption-cleanup-sample-limit"),o=document.querySelector("#caption-cleanup-recursive"),u=document.querySelector("#caption-cleanup-collapse-whitespace"),m=document.querySelector("#caption-cleanup-replace-underscore"),g=document.querySelector("#caption-cleanup-dedupe-tags"),y=document.querySelector("#caption-cleanup-sort-tags"),_=document.querySelector("#caption-cleanup-use-regex"),$=document.querySelector("#caption-cleanup-auto-backup"),O=document.querySelector("#caption-cleanup-pick"),be=document.querySelector("#caption-cleanup-preview"),ye=document.querySelector("#caption-cleanup-apply");return!e||!t||!a||!n||!s||!i||!r||!c||!d||!o||!u||!m||!g||!y||!_||!$||!O||!be||!ye?null:{pathInput:e,extensionInput:t,removeTagsInput:a,prependTagsInput:n,appendTagsInput:s,searchTextInput:i,replaceTextInput:r,backupNameInput:c,sampleLimitInput:d,recursiveInput:o,collapseWhitespaceInput:u,replaceUnderscoreInput:m,dedupeTagsInput:g,sortTagsInput:y,useRegexInput:_,autoBackupInput:$,browseButton:O,previewButton:be,applyButton:ye}}function ia(){const e=document.querySelector("#caption-backup-path"),t=document.querySelector("#caption-backup-extension"),a=document.querySelector("#caption-backup-name"),n=document.querySelector("#caption-backup-select"),s=document.querySelector("#caption-backup-recursive"),i=document.querySelector("#caption-backup-pre-restore"),r=document.querySelector("#caption-backup-pick"),c=document.querySelector("#caption-backup-create"),d=document.querySelector("#caption-backup-refresh"),o=document.querySelector("#caption-backup-restore");return!e||!t||!a||!n||!s||!i||!r||!c||!d||!o?null:{pathInput:e,extensionInput:t,nameInput:a,selectInput:n,recursiveInput:s,preRestoreInput:i,browseButton:r,createButton:c,refreshButton:d,restoreButton:o}}async function ke(e){const t=e.pathInput.value.trim();if(!t){p("dataset-analysis-status","Pick a dataset folder first."),h("dataset-analysis-results",'<p class="dataset-analysis-empty">No folder selected yet.</p>');return}e.browseButton.disabled=!0,e.runButton.disabled=!0,p("dataset-analysis-status","Analyzing dataset..."),h("dataset-analysis-results",'<p class="dataset-analysis-empty">Scanning images, captions, and tags...</p>');try{const a=await xt({path:t,caption_extension:e.captionExtensionInput.value.trim()||".txt",top_tags:ae(e.topTagsInput.value,40),sample_limit:ae(e.sampleLimitInput.value,8)});if(a.status!=="success"||!a.data)throw new Error(a.message||"Dataset analysis returned no data.");p("dataset-analysis-status",`Scanned ${a.data.summary.image_count} images across ${a.data.summary.dataset_folder_count} dataset folder(s).`),Ot(a.data)}catch(a){p("dataset-analysis-status",a instanceof Error?a.message:"Dataset analysis failed."),h("dataset-analysis-results",`<article class="dataset-analysis-block dataset-analysis-warning"><p>${l(a instanceof Error?a.message:"Dataset analysis failed.")}</p></article>`)}finally{e.browseButton.disabled=!1,e.runButton.disabled=!1}}async function _e(e){var a,n,s;const t=e.pathInput.value.trim();if(!t){p("batch-tagger-status","Pick an image folder first."),h("batch-tagger-results",'<p class="dataset-analysis-empty">No image folder selected yet.</p>');return}e.browseButton.disabled=!0,e.runButton.disabled=!0,p("batch-tagger-status","Starting batch tagging..."),h("batch-tagger-results",'<p class="dataset-analysis-empty">Submitting interrogator job to the backend...</p>');try{const i=we(e.thresholdInput.value,.35,0,1),r=we(e.characterThresholdInput.value,.6,0,1),c=await Tt({path:t,interrogator_model:e.modelSelect.value,threshold:i,character_threshold:r,batch_output_action_on_conflict:e.conflictSelect.value,create_backup_before_write:e.autoBackupInput.checked,backup_snapshot_name:e.backupNameInput.value.trim(),additional_tags:e.additionalTagsInput.value.trim(),exclude_tags:e.excludeTagsInput.value.trim(),batch_input_recursive:e.recursiveInput.checked,replace_underscore:e.replaceUnderscoreInput.checked,escape_tag:e.escapeTagInput.checked,add_rating_tag:e.addRatingTagInput.checked,add_model_tag:e.addModelTagInput.checked});if(c.status!=="success")throw new Error(c.message||"Batch tagging failed to start.");p("batch-tagger-status",c.message||"Batch tagging started."),h("batch-tagger-results",`
        <article class="dataset-analysis-block">
          <p class="panel-kicker">launched</p>
          <h3>Batch tagger job submitted</h3>
          <p><code>${l(t)}</code></p>
          <p>Model: <code>${l(e.modelSelect.value)}</code></p>
          <p>
            Threshold: <strong>${l(String(i))}</strong>
            · Character threshold: <strong>${l(String(r))}</strong>
            · Conflict mode: <strong>${l(e.conflictSelect.value)}</strong>
          </p>
          <p>
            Recursive: <strong>${e.recursiveInput.checked?"yes":"no"}</strong>
            · Replace underscore: <strong>${e.replaceUnderscoreInput.checked?"yes":"no"}</strong>
            · Escape tags: <strong>${e.escapeTagInput.checked?"yes":"no"}</strong>
          </p>
          <p>
            Auto backup: <strong>${e.autoBackupInput.checked?"yes":"no"}</strong>
            ${(a=c.data)!=null&&a.backup?`· Snapshot: <code>${l(c.data.backup.archive_name)}</code>`:""}
          </p>
          ${(s=(n=c.data)==null?void 0:n.warnings)!=null&&s.length?`<p>${l(c.data.warnings.join(" "))}</p>`:""}
          <p>The backend runs this in the background. Watch the console output and inspect generated <code>.txt</code> files in the dataset folder.</p>
        </article>
      `)}catch(i){p("batch-tagger-status",i instanceof Error?i.message:"Batch tagging failed."),h("batch-tagger-results",`<article class="dataset-analysis-block dataset-analysis-warning"><p>${l(i instanceof Error?i.message:"Batch tagging failed.")}</p></article>`)}finally{e.browseButton.disabled=!1,e.runButton.disabled=!1}}async function Z(e,t){const a=e.pathInput.value.trim();if(!a){p("caption-cleanup-status","Pick a caption folder first."),h("caption-cleanup-results",'<p class="dataset-analysis-empty">No caption folder selected yet.</p>');return}const n={path:a,caption_extension:e.extensionInput.value.trim()||".txt",recursive:e.recursiveInput.checked,collapse_whitespace:e.collapseWhitespaceInput.checked,replace_underscore:e.replaceUnderscoreInput.checked,dedupe_tags:e.dedupeTagsInput.checked,sort_tags:e.sortTagsInput.checked,remove_tags:e.removeTagsInput.value.trim(),prepend_tags:e.prependTagsInput.value.trim(),append_tags:e.appendTagsInput.value.trim(),search_text:e.searchTextInput.value,replace_text:e.replaceTextInput.value,use_regex:e.useRegexInput.checked,create_backup_before_apply:e.autoBackupInput.checked,backup_snapshot_name:e.backupNameInput.value.trim(),sample_limit:ae(e.sampleLimitInput.value,8)};e.browseButton.disabled=!0,e.previewButton.disabled=!0,e.applyButton.disabled=!0,p("caption-cleanup-status",t==="preview"?"Previewing caption cleanup...":"Applying caption cleanup..."),h("caption-cleanup-results",`<p class="dataset-analysis-empty">${t==="preview"?"Scanning caption files and building sample diffs...":"Writing cleaned captions back to disk..."}</p>`);try{const s=t==="preview"?await Lt(n):await Pt(n);if(s.status!=="success"||!s.data)throw new Error(s.message||`Caption cleanup ${t} failed.`);p("caption-cleanup-status",s.message||(t==="preview"?`Previewed ${s.data.summary.changed_file_count} caption file changes.`:`Applied cleanup to ${s.data.summary.changed_file_count} caption files.`)),Ft(s.data)}catch(s){p("caption-cleanup-status",s instanceof Error?s.message:"Caption cleanup failed."),h("caption-cleanup-results",`<article class="dataset-analysis-block dataset-analysis-warning"><p>${l(s instanceof Error?s.message:"Caption cleanup failed.")}</p></article>`)}finally{e.browseButton.disabled=!1,e.previewButton.disabled=!1,e.applyButton.disabled=!1}}async function F(e,t,a=!0){var s,i;const n=e.pathInput.value.trim();if(!n){p("caption-backup-status","Pick a caption folder first."),h("caption-backup-results",'<p class="dataset-analysis-empty">No caption folder selected yet.</p>'),e.selectInput.innerHTML='<option value="">Refresh snapshots for this folder</option>';return}e.browseButton.disabled=!0,e.createButton.disabled=!0,e.refreshButton.disabled=!0,e.restoreButton.disabled=!0,p("caption-backup-status","Loading caption snapshots...");try{const c=((s=(await At({path:n})).data)==null?void 0:s.backups)??[],d=e.selectInput.value||(((i=c[0])==null?void 0:i.archive_name)??""),o=t??d;e.selectInput.innerHTML=c.length?c.map(u=>{const m=u.archive_name===o?" selected":"";return`<option value="${l(u.archive_name)}"${m}>${l(u.snapshot_name)} · ${l(u.archive_name)}</option>`}).join(""):'<option value="">No snapshots for this folder yet</option>',c.length&&o&&(e.selectInput.value=o),p("caption-backup-status",c.length?`Loaded ${c.length} caption snapshots.`:"No caption snapshots found for this folder."),a&&Ht(c,c.length?o:null)}catch(r){p("caption-backup-status",r instanceof Error?r.message:"Failed to load caption snapshots."),h("caption-backup-results",`<article class="dataset-analysis-block dataset-analysis-warning"><p>${l(r instanceof Error?r.message:"Failed to load caption snapshots.")}</p></article>`)}finally{e.browseButton.disabled=!1,e.createButton.disabled=!1,e.refreshButton.disabled=!1,e.restoreButton.disabled=!1}}async function ra(e){const t=e.pathInput.value.trim();if(!t){p("caption-backup-status","Pick a caption folder first."),h("caption-backup-results",'<p class="dataset-analysis-empty">No caption folder selected yet.</p>');return}e.browseButton.disabled=!0,e.createButton.disabled=!0,e.refreshButton.disabled=!0,e.restoreButton.disabled=!0,p("caption-backup-status","Creating caption snapshot...");try{const a=await Et({path:t,caption_extension:e.extensionInput.value.trim()||".txt",recursive:e.recursiveInput.checked,snapshot_name:e.nameInput.value.trim()});if(a.status!=="success"||!a.data)throw new Error(a.message||"Caption snapshot creation failed.");p("caption-backup-status",a.message||`Created ${a.data.archive_name}`),e.nameInput.value="",await F(e,a.data.archive_name)}catch(a){p("caption-backup-status",a instanceof Error?a.message:"Caption snapshot creation failed."),h("caption-backup-results",`<article class="dataset-analysis-block dataset-analysis-warning"><p>${l(a instanceof Error?a.message:"Caption snapshot creation failed.")}</p></article>`)}finally{e.browseButton.disabled=!1,e.createButton.disabled=!1,e.refreshButton.disabled=!1,e.restoreButton.disabled=!1}}async function oa(e){const t=e.pathInput.value.trim(),a=e.selectInput.value;if(!t){p("caption-backup-status","Pick a caption folder first."),h("caption-backup-results",'<p class="dataset-analysis-empty">No caption folder selected yet.</p>');return}if(!a){p("caption-backup-status","Select a snapshot to restore.");return}if(window.confirm(`Restore caption snapshot ${a} into this folder?

This overwrites matching caption files from the snapshot.`)){e.browseButton.disabled=!0,e.createButton.disabled=!0,e.refreshButton.disabled=!0,e.restoreButton.disabled=!0,p("caption-backup-status","Restoring caption snapshot..."),h("caption-backup-results",'<p class="dataset-analysis-empty">Writing snapshot files back to the folder...</p>');try{const s=await It({path:t,archive_name:a,make_restore_backup:e.preRestoreInput.checked});if(s.status!=="success"||!s.data)throw new Error(s.message||"Caption snapshot restore failed.");p("caption-backup-status",s.message||`Restored ${s.data.restored_file_count} caption files.`),Ut(s.data),await F(e,a,!1)}catch(s){p("caption-backup-status",s instanceof Error?s.message:"Caption snapshot restore failed."),h("caption-backup-results",`<article class="dataset-analysis-block dataset-analysis-warning"><p>${l(s instanceof Error?s.message:"Caption snapshot restore failed.")}</p></article>`)}finally{e.browseButton.disabled=!1,e.createButton.disabled=!1,e.refreshButton.disabled=!1,e.restoreButton.disabled=!1}}}function ae(e,t){const a=Number.parseInt(e,10);return Number.isNaN(a)||a<1?t:a}function we(e,t,a,n){const s=Number.parseFloat(e);return Number.isNaN(s)?t:Math.min(Math.max(s,a),n)}async function se(){var e;try{const t=await de();Dt(((e=t.data)==null?void 0:e.tasks)??[]),document.querySelectorAll("[data-task-terminate]").forEach(a=>{a.addEventListener("click",async()=>{const n=a.dataset.taskTerminate;if(n){a.setAttribute("disabled","true");try{await He(n)}finally{await se()}}})})}catch(t){h("task-table-container",`<p>${t instanceof Error?l(t.message):"Task request failed."}</p>`)}}async function la(){const e=document.querySelector("#refresh-tasks");e==null||e.addEventListener("click",()=>{se()}),await se()}class k{constructor(t){w(this,"kind");w(this,"descriptionText");w(this,"defaultValue");w(this,"roleName");w(this,"roleConfig");w(this,"minValue");w(this,"maxValue");w(this,"stepValue");w(this,"disabledFlag",!1);w(this,"requiredFlag",!1);w(this,"literalValue");w(this,"options",[]);w(this,"fields",{});w(this,"itemType");this.kind=t}description(t){return this.descriptionText=t,this}default(t){return this.defaultValue=t,this}role(t,a){return this.roleName=typeof t=="string"?t:"custom",this.roleConfig=a??t,this}min(t){return this.minValue=t,this}max(t){return this.maxValue=t,this}step(t){return this.stepValue=t,this}required(){return this.requiredFlag=!0,this}disabled(){return this.disabledFlag=!0,this}}function B(e){if(e instanceof k)return e;if(e===String)return new k("string");if(e===Number)return new k("number");if(e===Boolean)return new k("boolean");if(typeof e=="string"||typeof e=="number"||typeof e=="boolean"){const t=new k("const");return t.literalValue=e,t.defaultValue=e,t}if(Array.isArray(e)){const t=new k("union");return t.options=e.map(a=>B(a)),t}if(e&&typeof e=="object"){const t=new k("object");return t.fields=Object.fromEntries(Object.entries(e).map(([a,n])=>[a,B(n)])),t}return new k("string")}function ca(){return{string(){return new k("string")},number(){return new k("number")},boolean(){return new k("boolean")},const(e){const t=new k("const");return t.literalValue=e,t.defaultValue=e,t},union(e){const t=new k("union");return t.options=e.map(a=>B(a)),t},intersect(e){const t=new k("intersect");return t.options=e.map(a=>B(a)),t},object(e){const t=new k("object");return t.fields=Object.fromEntries(Object.entries(e).map(([a,n])=>[a,B(n)])),t},array(e){const t=new k("array");return t.itemType=B(e),t}}}function da(e,t,a){const n={...e,...t};for(const s of a??[])delete n[s];return n}function $e(e,t){const a=ca();return new Function("Schema","UpdateSchema","SHARED_SCHEMAS","String","Number","Boolean","source",'"use strict"; return eval(source);')(a,da,t??{},String,Number,Boolean,e)}function Xe(e){const t=e.find(s=>s.name==="shared"),n=(t?$e(t.schema,null):{})||{};return e.map(s=>({name:s.name,hash:s.hash,source:s.schema,runtime:s.name==="shared"?n:$e(s.schema,n)}))}function xe(e,t=""){return Object.entries(e).map(([a,n])=>({name:a,path:t?`${t}.${a}`:a,schema:n})).filter(a=>a.schema.kind!=="const"||!a.schema.requiredFlag)}function Se(e){return Object.entries(e).filter(([,t])=>t.kind==="const"&&t.requiredFlag).map(([t,a])=>`${t} = ${String(a.literalValue)}`)}function Te(e){return Object.fromEntries(Object.entries(e).filter(([,t])=>t.kind==="const"&&t.requiredFlag).map(([t,a])=>[t,a.literalValue]))}function ne(e,t,a){if(e.kind==="intersect"){e.options.forEach((n,s)=>ne(n,`${t}-i${s}`,a));return}if(e.kind==="object"){const n=xe(e.fields);n.length>0&&a.push({id:t,title:e.descriptionText||"Unnamed section",fields:n,conditions:Se(e.fields),constants:Te(e.fields)});return}e.kind==="union"&&e.options.forEach((n,s)=>{if(n.kind==="object"){const i=xe(n.fields);i.length>0&&a.push({id:`${t}-u${s}`,title:n.descriptionText||e.descriptionText||`Conditional branch ${s+1}`,fields:i,conditional:!0,conditions:Se(n.fields),constants:Te(n.fields)})}else ne(n,`${t}-u${s}`,a)})}function pa(e){const t=[];return ne(e,"section",t),t}function ua(e){const t={};for(const a of e){a.conditional||Object.assign(t,a.constants);for(const n of a.fields)n.schema.defaultValue!==void 0?t[n.path]=n.schema.defaultValue:n.schema.kind==="boolean"?t[n.path]=!1:t[n.path]=""}return t}function Ke(e,t){return e.conditional?Object.entries(e.constants).every(([a,n])=>t[a]===n):!0}function ha(e,t){const a={...t};for(const n of e){if(Ke(n,t)){Object.assign(a,n.constants);continue}for(const s of n.fields)delete a[s.path]}return a}function pe(e){return`field-${e.replaceAll(/[^a-zA-Z0-9_-]/g,"-")}`}function ma(e){if(e.kind!=="union")return null;const t=e.options.filter(a=>a.kind==="const").map(a=>a.literalValue).filter(a=>typeof a=="string"||typeof a=="number"||typeof a=="boolean");return t.length!==e.options.length?null:t}function ga(e,t){if(!e.roleConfig||typeof e.roleConfig!="object"||Array.isArray(e.roleConfig))return;const a=e.roleConfig[t];return typeof a=="string"?a:void 0}function ie(e){return Array.isArray(e)?e.map(t=>String(t??"")):typeof e=="string"&&e.length>0?e.split(/\r?\n/):[]}function fa(e,t,a){const n=ie(t),s=n.length>0?n:[""],i=pe(e.path);return`
    <div class="table-editor" data-table-path="${l(e.path)}">
      <div class="table-editor-rows">
        ${s.map((r,c)=>`
              <div class="table-editor-row">
                <input
                  id="${c===0?i:`${i}-${c}`}"
                  class="field-input"
                  data-field-path="${l(e.path)}"
                  data-field-kind="table-row"
                  data-field-index="${c}"
                  type="text"
                  value="${l(r)}"
                  ${a}
                />
                <button
                  class="action-button action-button-ghost action-button-small"
                  data-table-remove="${l(e.path)}"
                  data-table-index="${c}"
                  type="button"
                  ${a}
                >
                  Remove
                </button>
              </div>
            `).join("")}
      </div>
      <div class="table-editor-footer">
        <button
          class="action-button action-button-ghost action-button-small"
          data-table-add="${l(e.path)}"
          type="button"
          ${a}
        >
          Add row
        </button>
        <span class="table-editor-note">One argument per row.</span>
      </div>
    </div>
  `}function ba(e,t){const a=e.schema,n=pe(e.path),s=l(e.path),i=ma(a),r=a.disabledFlag?"disabled":"",c=a.roleName||"";if(a.kind==="boolean")return`
      <label class="checkbox-row" for="${n}">
        <input id="${n}" data-field-path="${s}" data-field-kind="boolean" type="checkbox" ${t?"checked":""} ${r} />
        <span>${a.defaultValue===!0?"default on":"toggle"}</span>
      </label>
    `;if(a.kind==="array"){if(c==="table")return fa(e,t,r);const d=Array.isArray(t)?t.join(`
`):"";return`<textarea id="${n}" class="field-input field-textarea" data-field-path="${s}" data-field-kind="array" ${r}>${l(d)}</textarea>`}if(i){const d=i.map(o=>`<option value="${l(o)}" ${String(o)===String(t)?"selected":""}>${l(o)}</option>`).join("");return`<select id="${n}" class="field-input" data-field-path="${s}" data-field-kind="enum" ${r}>${d}</select>`}if(a.kind==="number"){const d=a.minValue!==void 0?`min="${a.minValue}"`:"",o=a.maxValue!==void 0?`max="${a.maxValue}"`:"",u=a.stepValue!==void 0?`step="${a.stepValue}"`:'step="any"';if(c==="slider"&&a.minValue!==void 0&&a.maxValue!==void 0){const m=t===""||t===void 0||t===null?a.defaultValue??a.minValue:t;return`
        <div class="slider-editor">
          <input
            class="field-slider"
            data-field-path="${s}"
            data-field-kind="number"
            data-slider-role="range"
            type="range"
            value="${l(m)}"
            ${d}
            ${o}
            ${u}
            ${r}
          />
          <div class="slider-editor-footer">
            <input
              id="${n}"
              class="field-input slider-number-input"
              data-field-path="${s}"
              data-field-kind="number"
              data-slider-role="number"
              type="number"
              value="${l(m)}"
              ${d}
              ${o}
              ${u}
              ${r}
            />
            <span class="slider-value" data-slider-value-for="${s}">${l(m)}</span>
          </div>
        </div>
      `}return`<input id="${n}" class="field-input" data-field-path="${s}" data-field-kind="number" type="number" value="${l(t)}" ${d} ${o} ${u} ${r} />`}if(c==="textarea")return`<textarea id="${n}" class="field-input field-textarea" data-field-path="${s}" data-field-kind="string" ${r}>${l(t)}</textarea>`;if(c==="filepicker"){const d=ga(a,"type")??(e.path.endsWith("_dir")||e.path==="resume"?"folder":"model-file");return`
      <div class="picker-control">
        <div class="picker-row">
          <input
            id="${n}"
            class="field-input"
            data-field-path="${s}"
            data-field-kind="string"
            type="text"
            value="${l(t)}"
            ${r}
          />
          <button
            class="action-button action-button-ghost picker-button"
            data-picker-path="${s}"
            data-picker-type="${l(d)}"
            type="button"
            ${r}
          >
            Browse
          </button>
        </div>
        <p class="picker-status" data-picker-status-for="${s}">
          Uses the backend native ${d==="folder"?"folder":"file"} picker.
        </p>
      </div>
    `}return a.kind==="const"?`<div class="field-readonly"><code>${l(a.literalValue??t)}</code></div>`:`<input id="${n}" class="field-input" data-field-path="${s}" data-field-kind="string" type="text" value="${l(t)}" ${r} />`}function ya(e,t){const a=e.schema,n=[`<span class="mini-badge">${l(a.kind)}</span>`,a.roleName?`<span class="mini-badge mini-badge-muted">${l(a.roleName)}</span>`:"",a.requiredFlag?'<span class="mini-badge mini-badge-accent">required</span>':"",a.disabledFlag?'<span class="mini-badge mini-badge-muted">disabled</span>':""].filter(Boolean).join(""),s=[a.minValue!==void 0?`min ${a.minValue}`:"",a.maxValue!==void 0?`max ${a.maxValue}`:"",a.stepValue!==void 0?`step ${a.stepValue}`:""].filter(Boolean).join(" · ");return`
    <article class="field-card">
      <div class="field-card-head">
        <div>
          <label class="field-label" for="${pe(e.path)}">${l(e.name)}</label>
          <p class="field-path">${l(e.path)}</p>
        </div>
        <div class="mini-badge-row">${n}</div>
      </div>
      <p class="field-description">${l(a.descriptionText||"No description")}</p>
      ${ba(e,t)}
      <div class="field-meta">
        <span><strong>Default:</strong> ${l(a.defaultValue??"(none)")}</span>
        ${s?`<span><strong>Constraints:</strong> ${l(s)}</span>`:""}
      </div>
    </article>
  `}function Je(e){return e.sections.filter(t=>Ke(t,e.values))}function Ye(e){return ha(e.sections,e.values)}function va(e,t){const a=Je(e);if(a.length===0){h(t,"<p>No renderable sections extracted from this schema.</p>");return}const n=a.map(s=>{const i=s.fields.map(c=>ya(c,e.values[c.path])).join(""),r=s.conditions.length?`<div class="condition-list">${s.conditions.map(c=>`<span class="coverage-pill coverage-pill-muted">${l(c)}</span>`).join("")}</div>`:"";return`
        <article class="panel schema-section-card">
          <div class="schema-section-head">
            <div>
              <p class="panel-kicker">${s.conditional?"conditional section":"section"}</p>
              <h3>${l(s.title)}</h3>
            </div>
            <span class="coverage-pill">${s.fields.length} fields</span>
          </div>
          ${r}
          <div class="field-grid">
            ${i}
          </div>
        </article>
      `}).join("");h(t,n)}function re(e,t){const a=Object.fromEntries(Object.entries(Ye(e)).sort(([n],[s])=>n.localeCompare(s)));D(t,JSON.stringify(a,null,2))}function J(e){return e.filter(t=>t.name!=="shared"&&t.runtime instanceof k)}function Le(e,t){const a=e.schema;if(a.kind==="boolean")return!!t;if(a.kind==="number"){const n=String(t).trim();if(n==="")return"";const s=Number(n);return Number.isNaN(s)?"":s}return a.kind==="array"?String(t).split(/\r?\n/).map(n=>n.trim()).filter(Boolean):t}function Pe(e,t){return e.sections.flatMap(a=>a.fields).find(a=>a.path===t)}function ka(e,t){return[...e.querySelectorAll('[data-field-kind="table-row"]')].filter(a=>a.dataset.fieldPath===t).map(a=>a.value.trim()).filter(Boolean)}function Ee(e,t,a,n){const s=String(a??"");e.querySelectorAll("[data-field-path]").forEach(i=>{if(!(i===n||i.dataset.fieldPath!==t||i.dataset.fieldKind==="table-row")){if(i instanceof HTMLInputElement&&i.type==="checkbox"){i.checked=!!a;return}i.value=s}}),e.querySelectorAll("[data-slider-value-for]").forEach(i=>{i.dataset.sliderValueFor===t&&(i.textContent=s)})}function Q(e,t,a,n="idle"){e.querySelectorAll("[data-picker-status-for]").forEach(s=>{s.dataset.pickerStatusFor===t&&(s.textContent=a,s.classList.remove("is-success","is-error"),n==="success"?s.classList.add("is-success"):n==="error"&&s.classList.add("is-error"))})}function _a(e,t,a,n){const s=document.querySelector(`#${t.sectionsId}`);if(!s)return;const i=new Set(e.sections.flatMap(r=>r.conditional?Object.keys(r.constants):[]));s.querySelectorAll("[data-field-path]").forEach(r=>{const c=r.dataset.fieldKind,d=r instanceof HTMLInputElement&&r.type==="checkbox"||r instanceof HTMLSelectElement?"change":"input";r.addEventListener(d,()=>{const o=r.dataset.fieldPath;if(!o)return;const u=Pe(e,o);if(u){if(c==="table-row")e.values[o]=ka(s,o);else{const m=r instanceof HTMLInputElement&&r.type==="checkbox"?r.checked:r.value;e.values[o]=Le(u,m),Ee(s,o,e.values[o],r)}if(i.has(o)){n({...e,values:{...e.values}});return}re(e,t.previewId),a(e)}})}),s.querySelectorAll("[data-table-add]").forEach(r=>{r.addEventListener("click",()=>{const c=r.dataset.tableAdd;c&&(e.values[c]=[...ie(e.values[c]),""],n({...e,values:{...e.values}}))})}),s.querySelectorAll("[data-table-remove]").forEach(r=>{r.addEventListener("click",()=>{const c=r.dataset.tableRemove,d=Number(r.dataset.tableIndex??"-1");if(!c||d<0)return;const o=ie(e.values[c]).filter((u,m)=>m!==d);e.values[c]=o,n({...e,values:{...e.values}})})}),s.querySelectorAll("[data-picker-path]").forEach(r=>{r.addEventListener("click",async()=>{const c=r.dataset.pickerPath,d=r.dataset.pickerType||"model-file";if(!c)return;const o=Pe(e,c);if(o){r.setAttribute("disabled","true"),Q(s,c,"Waiting for native picker...","idle");try{const u=await j(d);if(e.values[c]=Le(o,u),Ee(s,c,e.values[c]),Q(s,c,u,"success"),i.has(c)){n({...e,values:{...e.values}});return}re(e,t.previewId),a(e)}catch(u){Q(s,c,u instanceof Error?u.message:"The picker failed to return a value.","error")}finally{r.removeAttribute("disabled")}}})})}function V(e,t){const a=J(e).find(s=>s.name===t);if(!a||!(a.runtime instanceof k))return null;const n=pa(a.runtime);return{catalog:e,selectedName:t,sections:n,values:ua(n)}}function H(e,t,a,n){if(a(e),!e){p(t.summaryId,"Failed to build schema bridge state."),h(t.sectionsId,"<p>Schema bridge failed to initialize.</p>"),D(t.previewId,"{}");return}const i=J(e.catalog).map(o=>`<option value="${l(o.name)}" ${o.name===e.selectedName?"selected":""}>${l(o.name)}</option>`).join(""),r=Je(e);h(t.selectId,i),p(t.summaryId,`${e.selectedName} · ${r.length}/${e.sections.length} visible sections · ${r.reduce((o,u)=>o+u.fields.length,0)} visible fields`),va(e,t.sectionsId),re(e,t.previewId);const c=document.querySelector(`#${t.selectId}`);c&&(c.onchange=()=>{const o=V(e.catalog,c.value);H(o,t,a,n)});const d=document.querySelector(`#${t.resetId}`);d&&(d.onclick=()=>{H(V(e.catalog,e.selectedName),t,a,n)}),_a(e,t,n,o=>H(o,t,a,n)),n(e)}const wa={selectId:"schema-select",summaryId:"schema-summary",sectionsId:"schema-sections",previewId:"schema-preview",resetId:"schema-reset"};function $a(e){return{selectId:`${e}-schema-select`,summaryId:`${e}-summary`,sectionsId:`${e}-sections`,previewId:`${e}-preview`,resetId:`${e}-reset`}}async function xa(e){var t,a,n;try{const i=((t=(await ce()).data)==null?void 0:t.schemas)??[],r=Xe(i),c=J(r),d=((a=c.find(o=>o.name==="sdxl-lora"))==null?void 0:a.name)??((n=c[0])==null?void 0:n.name);if(!d){p("schema-summary","No selectable schemas were returned."),h("schema-sections","<p>No schema runtime available.</p>");return}H(V(r,d),wa,e,()=>{})}catch(s){p("schema-summary","Schema bridge request failed"),h("schema-sections",`<p>${s instanceof Error?l(s.message):"Unknown error"}</p>`),D("schema-preview","{}")}}function Sa(e,t){return`
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
        ${t}
      </main>
    </div>
  `}function P(e,t,a){return`
    <section class="page-hero panel">
      <p class="eyebrow">${e}</p>
      <h2>${t}</h2>
      <p class="lede">${a}</p>
    </section>
  `}function Ae(e,t,a="module"){return`
    <article class="panel info-card">
      <p class="panel-kicker">${a}</p>
      <h3>${e}</h3>
      <div>${t}</div>
    </article>
  `}function Ta(){return`
    ${P("about","A clean source-side replacement for the current about page","This page is one of the safest migration targets because it is mostly branding, release context and ownership notes.")}
    <section class="two-column">
      ${Ae("Project identity",`
          <p><strong>Product name:</strong> SD-reScripts</p>
          <p><strong>Version target:</strong> v1.0.2</p>
          <p><strong>Lineage:</strong> Fork from 秋葉 aaaki/lora-scripts</p>
          <p><strong>Maintainer:</strong> Modify By Lulynx</p>
        `,"brand")}
      ${Ae("Why migrate this page first",`
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
      <p><a class="text-link" href="${L("/other/about.html")}" target="_blank" rel="noreferrer">Open current shipped about page</a></p>
    </section>
  `}function I(e){return`
    ${P(e.heroKicker,e.heroTitle,e.heroLede)}
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
            <button id="${e.prefix}-run-preflight" class="action-button action-button-ghost" type="button">Run preflight</button>
            <button id="${e.prefix}-start-train" class="action-button action-button-large" type="button">${e.startButtonLabel}</button>
            <p class="section-note">
              Preflight runs backend-aware checks first, then launch submits the current local config snapshot to <code>/api/run</code>.
            </p>
            <p><a class="text-link" href="${L(e.legacyPath)}" target="_blank" rel="noreferrer">${e.legacyLabel}</a></p>
          </div>
        </div>
      </div>
      <div class="train-status-grid">
        <div id="${e.prefix}-submit-status" class="submit-status">Waiting for schema and backend data.</div>
        <div id="${e.prefix}-validation-status" class="submit-status">Checking payload compatibility...</div>
      </div>
      <div id="${e.prefix}-preflight-report" class="submit-status">Training preflight has not run yet.</div>
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
      <section class="training-side-panel training-inline-workspace">
        <div class="training-side-panel-head">
          <div>
            <p class="panel-kicker">preview prompt</p>
            <h3>Sample prompt workspace</h3>
          </div>
          <div class="history-toolbar">
            <button id="${e.prefix}-pick-prompt-file" class="action-button action-button-ghost action-button-small" type="button">Pick prompt file</button>
            <button id="${e.prefix}-clear-prompt-file" class="action-button action-button-ghost action-button-small" type="button">Clear prompt file</button>
            <button id="${e.prefix}-refresh-sample-prompt" class="action-button action-button-ghost action-button-small" type="button">Refresh prompt</button>
            <button id="${e.prefix}-download-sample-prompt" class="action-button action-button-ghost action-button-small" type="button">Download txt</button>
          </div>
        </div>
        <p class="section-note">
          Inspect the effective sample prompt without launching training. This resolves <code>prompt_file</code>, generated prompt fields,
          and imported legacy <code>sample_prompts</code> values.
        </p>
        <div id="${e.prefix}-sample-prompt-workspace" class="submit-status">
          <div class="submit-status-box">
            <strong>Sample prompt workspace is waiting for refresh</strong>
            <p>Edit prompt fields freely, then click Refresh prompt to inspect the exact text that would be used.</p>
          </div>
        </div>
      </section>
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
  `}function La(){return I({prefix:"dreambooth",heroKicker:"dreambooth train",heroTitle:"Dreambooth source training page",heroLede:"This route brings the Dreambooth and SDXL full-finetune schema into the same source-side training bridge so we can migrate one of the last big non-LoRA training paths cleanly.",runnerTitle:"Dreambooth source-side runner",startButtonLabel:"Start Dreambooth training",legacyPath:"/dreambooth/",legacyLabel:"Open current shipped Dreambooth page",renderedTitle:"Dreambooth form bridge"})}function Pa(){return I({prefix:"flux-controlnet",heroKicker:"flux controlnet",heroTitle:"Flux ControlNet source training page",heroLede:"This route reuses the same source-side training bridge for Flux ControlNet so the DiT-family conditioning workflow stays aligned with the current backend schema and payload rules.",runnerTitle:"Flux ControlNet source-side runner",startButtonLabel:"Start Flux ControlNet training",legacyPath:"/lora/flux-controlnet.html",legacyLabel:"Open current shipped Flux ControlNet page",renderedTitle:"Flux ControlNet form bridge"})}function Ea(){return I({prefix:"flux",heroKicker:"flux train",heroTitle:"Flux LoRA source training page",heroLede:"This route reuses the source-side training bridge for Flux so we can keep payload shaping, compatibility checks and launch behavior aligned with the current backend.",runnerTitle:"Flux source-side runner",startButtonLabel:"Start Flux training",legacyPath:"/lora/flux.html",legacyLabel:"Open current shipped Flux page",renderedTitle:"Flux form bridge"})}function Aa(){return`
    ${P("schema bridge","Source-side schema explorer and prototype form bridge","This page evaluates the current schema DSL in the browser and turns it into sections, fields and editable defaults. It is the first direct bridge between the new source workspace and the training form core.")}
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
  `}function Ia(){return I({prefix:"sd3",heroKicker:"sd3 train",heroTitle:"SD3 LoRA source training page",heroLede:"This route extends the same source-side training bridge to SD3 so we can keep the fast-moving schema-driven trainer paths on one shared foundation.",runnerTitle:"SD3 source-side runner",startButtonLabel:"Start SD3 training",legacyPath:"/lora/sd3.html",legacyLabel:"Open current shipped SD3 page",renderedTitle:"SD3 form bridge"})}function Na(){return I({prefix:"sd-controlnet",heroKicker:"sd controlnet",heroTitle:"SD ControlNet source training page",heroLede:"This route extends the shared source-side training bridge to the SD1.x / SD2.x ControlNet workflow so conditioning-dataset training can migrate without another bespoke form stack.",runnerTitle:"SD ControlNet source-side runner",startButtonLabel:"Start SD ControlNet training",legacyPath:"/lora/controlnet.html",legacyLabel:"Open current shipped SD ControlNet page",renderedTitle:"SD ControlNet form bridge"})}function Ca(){return I({prefix:"sdxl-controlnet",heroKicker:"sdxl controlnet",heroTitle:"SDXL ControlNet source training page",heroLede:"This route keeps the SDXL ControlNet training path on the same source-side schema bridge, normalized payload builder and launch pipeline as the main LoRA routes.",runnerTitle:"SDXL ControlNet source-side runner",startButtonLabel:"Start SDXL ControlNet training",legacyPath:"/lora/sdxl-controlnet.html",legacyLabel:"Open current shipped SDXL ControlNet page",renderedTitle:"SDXL ControlNet form bridge"})}function Ra(){return I({prefix:"sdxl-lllite",heroKicker:"sdxl lllite",heroTitle:"SDXL LLLite source training page",heroLede:"This route keeps the SDXL ControlNet-LLLite path on the shared source-side training bridge so even the more specialized conditioning flow no longer needs its own one-off migration path.",runnerTitle:"SDXL LLLite source-side runner",startButtonLabel:"Start SDXL LLLite training",legacyPath:"/lora/sdxl-lllite.html",legacyLabel:"Open current shipped SDXL LLLite page",renderedTitle:"SDXL LLLite form bridge"})}function Ba(){return I({prefix:"sdxl",heroKicker:"sdxl train",heroTitle:"First source-side SDXL training page",heroLede:"This is the first page that moves beyond passive inspection: it renders the SDXL schema, tracks a real config model and can submit to the current training backend.",runnerTitle:"SDXL source-side runner",startButtonLabel:"Start SDXL training",legacyPath:"/lora/sdxl.html",legacyLabel:"Open current shipped SDXL page",renderedTitle:"SDXL form bridge"})}function qa(){return`
    ${P("settings","Source-side settings page prototype","This route is now close to live backend config data, so we can rebuild it before touching the schema-heavy training forms.")}
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
      <p><a class="text-link" href="${L("/other/settings.html")}" target="_blank" rel="noreferrer">Open current shipped settings page</a></p>
    </section>
  `}function Da(){return`
    ${P("tag editor","Tag editor wrapper migration page","The current shipped page is mostly a wrapper around startup state and proxy behavior. That makes it a good low-risk source-side rewrite.")}
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
          <p><a class="text-link" href="${L("/tageditor.html")}" target="_blank" rel="noreferrer">Open current shipped tag editor wrapper</a></p>
        </div>
      </article>
    </section>
  `}function ja(){return`
    ${P("tasks","Task monitor migration page","This route is already talking to the real backend task manager, so it is a strong candidate for early source migration.")}
    <section class="panel task-panel">
      <div class="task-toolbar">
        <button id="refresh-tasks" class="action-button" type="button">Refresh tasks</button>
        <a class="text-link task-legacy-link" href="${L("/task.html")}" target="_blank" rel="noreferrer">Open current shipped task page</a>
      </div>
      <div id="task-table-container" class="task-table-container loading">Loading tasks...</div>
    </section>
  `}function Oa(){return`
    ${P("tensorboard","TensorBoard wrapper migration page","This page can be rebuilt without touching training forms because it mainly needs status text and a proxy destination.")}
    <section class="two-column">
      <article class="panel info-card">
        <p class="panel-kicker">proxy</p>
        <h3>Legacy backend path</h3>
        <div>
          <p>The current runtime proxies TensorBoard through <code>/proxy/tensorboard/</code>.</p>
          <p>This source-side page can later offer a cleaner iframe or open-in-new-tab flow.</p>
          <p><a class="text-link" href="${L("/proxy/tensorboard/")}" target="_blank" rel="noreferrer">Open current TensorBoard proxy</a></p>
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
  `}function Fa(){return`
    ${P("tools","Tools workspace","This route now covers both raw script launching and the first reusable dataset utility, so it can grow into a real preflight toolbox instead of staying a placeholder.")}
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
          <p class="section-note">Scan a training folder before launch and surface missing captions, folder coverage, top tags, resolution mix, and alpha-capable image candidates for masked-loss workflows.</p>
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
        Pick a folder to preview image count, caption coverage, repeat-weighted size, tag frequency, alpha-capable image candidates, and a few problem samples.
      </div>
    </section>
    <section class="panel tools-panel">
      <div class="section-head">
        <div>
          <p class="panel-kicker">tagger</p>
          <h2>Batch auto tagging</h2>
          <p class="section-note">Run the built-in WD / CL taggers directly from the workspace for fast dataset bootstrapping before fine edits in the full tag editor.</p>
        </div>
      </div>
      <div class="tool-form-grid">
        <label class="tool-field tool-field-wide">
          <span>Image folder</span>
          <div class="tool-inline-actions">
            <input id="batch-tagger-path" class="field-input" type="text" placeholder="Select an image folder for batch tagging" />
            <button id="batch-tagger-pick" class="action-button action-button-ghost" type="button">Browse</button>
            <button id="batch-tagger-run" class="action-button" type="button">Start tagging</button>
          </div>
        </label>
        <label class="tool-field">
          <span>Model</span>
          <select id="batch-tagger-model" class="field-input">
            <option>Loading models...</option>
          </select>
        </label>
        <label class="tool-field">
          <span>Threshold</span>
          <input id="batch-tagger-threshold" class="field-input" type="number" value="0.35" min="0" max="1" step="0.01" />
        </label>
        <label class="tool-field">
          <span>Character threshold</span>
          <input id="batch-tagger-character-threshold" class="field-input" type="number" value="0.6" min="0" max="1" step="0.01" />
        </label>
        <label class="tool-field">
          <span>Existing caption files</span>
          <select id="batch-tagger-conflict" class="field-input">
            <option value="ignore" selected>Ignore existing</option>
            <option value="copy">Overwrite / copy</option>
            <option value="prepend">Prepend to existing</option>
          </select>
        </label>
        <label class="tool-field">
          <span>Additional tags</span>
          <input id="batch-tagger-additional-tags" class="field-input" type="text" placeholder="comma, separated, tags" />
        </label>
        <label class="tool-field">
          <span>Auto-backup snapshot name</span>
          <input id="batch-tagger-backup-name" class="field-input" type="text" placeholder="pre-batch-tagger" />
        </label>
        <label class="tool-field tool-field-wide">
          <span>Exclude tags</span>
          <input id="batch-tagger-exclude-tags" class="field-input" type="text" placeholder="tags to remove from the output" />
        </label>
      </div>
      <div class="tool-toggle-grid">
        <label class="tool-toggle"><input id="batch-tagger-recursive" type="checkbox" /> Recursive scan subfolders</label>
        <label class="tool-toggle"><input id="batch-tagger-replace-underscore" type="checkbox" checked /> Replace underscore with space</label>
        <label class="tool-toggle"><input id="batch-tagger-escape-tag" type="checkbox" checked /> Escape brackets in output tags</label>
        <label class="tool-toggle"><input id="batch-tagger-add-rating-tag" type="checkbox" /> Keep rating tags</label>
        <label class="tool-toggle"><input id="batch-tagger-add-model-tag" type="checkbox" /> Keep model tags</label>
        <label class="tool-toggle"><input id="batch-tagger-auto-backup" type="checkbox" checked /> Auto-create snapshot before modifying existing captions</label>
      </div>
      <p id="batch-tagger-status" class="section-note">Loading interrogator inventory...</p>
      <div id="batch-tagger-results" class="dataset-analysis-empty">
        Choose a folder and model to launch background tag generation. Use the full tag editor for manual review and batch text surgery afterward.
      </div>
      <p><a class="text-link" href="${L("/tageditor.html")}" target="_blank" rel="noreferrer">Open current shipped tag editor wrapper</a></p>
    </section>
    <section class="panel tools-panel">
      <div class="section-head">
        <div>
          <p class="panel-kicker">caption</p>
          <h2>Batch caption cleanup</h2>
          <p class="section-note">Preview and apply cleanup rules across caption files before training, without opening the full tag editor for simple bulk normalization work.</p>
        </div>
      </div>
      <div class="tool-form-grid">
        <label class="tool-field tool-field-wide">
          <span>Caption folder</span>
          <div class="tool-inline-actions">
            <input id="caption-cleanup-path" class="field-input" type="text" placeholder="Select a folder that contains caption files" />
            <button id="caption-cleanup-pick" class="action-button action-button-ghost" type="button">Browse</button>
            <button id="caption-cleanup-preview" class="action-button" type="button">Preview</button>
            <button id="caption-cleanup-apply" class="action-button action-button-ghost" type="button">Apply</button>
          </div>
        </label>
        <label class="tool-field">
          <span>Caption extension</span>
          <input id="caption-cleanup-extension" class="field-input" type="text" value=".txt" />
        </label>
        <label class="tool-field">
          <span>Remove exact tags</span>
          <input id="caption-cleanup-remove-tags" class="field-input" type="text" placeholder="lowres, text, signature" />
        </label>
        <label class="tool-field">
          <span>Prepend tags</span>
          <input id="caption-cleanup-prepend-tags" class="field-input" type="text" placeholder="masterpiece, best quality" />
        </label>
        <label class="tool-field">
          <span>Append tags</span>
          <input id="caption-cleanup-append-tags" class="field-input" type="text" placeholder="solo, white background" />
        </label>
        <label class="tool-field">
          <span>Search text</span>
          <input id="caption-cleanup-search-text" class="field-input" type="text" placeholder="blue_hair" />
        </label>
        <label class="tool-field">
          <span>Replace text</span>
          <input id="caption-cleanup-replace-text" class="field-input" type="text" placeholder="blue hair" />
        </label>
        <label class="tool-field">
          <span>Sample diffs</span>
          <input id="caption-cleanup-sample-limit" class="field-input" type="number" value="8" min="1" max="50" step="1" />
        </label>
        <label class="tool-field">
          <span>Auto-backup snapshot name</span>
          <input id="caption-cleanup-backup-name" class="field-input" type="text" placeholder="pre-caption-cleanup" />
        </label>
      </div>
      <div class="tool-toggle-grid">
        <label class="tool-toggle"><input id="caption-cleanup-recursive" type="checkbox" checked /> Recursive scan subfolders</label>
        <label class="tool-toggle"><input id="caption-cleanup-collapse-whitespace" type="checkbox" checked /> Normalize repeated whitespace</label>
        <label class="tool-toggle"><input id="caption-cleanup-replace-underscore" type="checkbox" /> Replace underscore with space</label>
        <label class="tool-toggle"><input id="caption-cleanup-dedupe-tags" type="checkbox" checked /> Remove duplicate tags</label>
        <label class="tool-toggle"><input id="caption-cleanup-sort-tags" type="checkbox" /> Sort tags alphabetically</label>
        <label class="tool-toggle"><input id="caption-cleanup-use-regex" type="checkbox" /> Use regex for search and replace</label>
        <label class="tool-toggle"><input id="caption-cleanup-auto-backup" type="checkbox" checked /> Auto-create snapshot before apply</label>
      </div>
      <p id="caption-cleanup-status" class="section-note">Configure cleanup rules and preview the diff before applying changes.</p>
      <div id="caption-cleanup-results" class="dataset-analysis-empty">
        Preview first when possible. The tool shows before/after diffs for a few sample files so you can catch bad rules before writing them into the dataset.
      </div>
    </section>
    <section class="panel tools-panel">
      <div class="section-head">
        <div>
          <p class="panel-kicker">backup</p>
          <h2>Caption snapshot restore</h2>
          <p class="section-note">Create restore points for caption files before large edits, then restore a snapshot later if auto-tagging or cleanup rules went sideways.</p>
        </div>
      </div>
      <div class="tool-form-grid">
        <label class="tool-field tool-field-wide">
          <span>Caption folder</span>
          <div class="tool-inline-actions">
            <input id="caption-backup-path" class="field-input" type="text" placeholder="Select a folder that contains caption files" />
            <button id="caption-backup-pick" class="action-button action-button-ghost" type="button">Browse</button>
            <button id="caption-backup-create" class="action-button" type="button">Create snapshot</button>
            <button id="caption-backup-refresh" class="action-button action-button-ghost" type="button">Refresh list</button>
          </div>
        </label>
        <label class="tool-field">
          <span>Caption extension</span>
          <input id="caption-backup-extension" class="field-input" type="text" value=".txt" />
        </label>
        <label class="tool-field">
          <span>Snapshot name</span>
          <input id="caption-backup-name" class="field-input" type="text" placeholder="before-cleanup, before-tagging" />
        </label>
        <label class="tool-field">
          <span>Available snapshots</span>
          <select id="caption-backup-select" class="field-input">
            <option value="">Refresh snapshots for this folder</option>
          </select>
        </label>
      </div>
      <div class="tool-toggle-grid">
        <label class="tool-toggle"><input id="caption-backup-recursive" type="checkbox" checked /> Include subfolders when creating snapshots</label>
        <label class="tool-toggle"><input id="caption-backup-pre-restore" type="checkbox" checked /> Backup current captions again before restore</label>
      </div>
      <div class="tool-inline-actions">
        <button id="caption-backup-restore" class="action-button" type="button">Restore selected snapshot</button>
      </div>
      <p id="caption-backup-status" class="section-note">Choose a folder and refresh its snapshots, or create a new one before bulk edits.</p>
      <div id="caption-backup-results" class="dataset-analysis-empty">
        Restoring a snapshot overwrites matching caption files from that backup, but it does not delete newer extra files. By default the tool makes one more safety backup before restoring.
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
      <p><a class="text-link" href="${L("/lora/tools.html")}" target="_blank" rel="noreferrer">Open current shipped tools page</a></p>
      <div id="tools-browser" class="tools-browser loading">Loading available scripts...</div>
    </section>
  `}const Ha=[{method:"GET",path:"/api/schemas/all",purpose:"Fetch all schema definitions used to render training forms.",migrationPriority:"high"},{method:"GET",path:"/api/schemas/hashes",purpose:"Hot-reload check for schema changes.",migrationPriority:"medium"},{method:"GET",path:"/api/presets",purpose:"Fetch preset configs for pages and tools.",migrationPriority:"high"},{method:"GET",path:"/api/config/saved_params",purpose:"Load stored UI parameter choices.",migrationPriority:"medium"},{method:"GET",path:"/api/config/summary",purpose:"Read app config summary for the rebuilt settings page.",migrationPriority:"medium"},{method:"GET",path:"/api/graphic_cards",purpose:"List GPUs plus xformers support state.",migrationPriority:"high"},{method:"POST",path:"/api/run",purpose:"Start schema-driven training jobs.",migrationPriority:"high"},{method:"POST",path:"/api/train/preflight",purpose:"Run backend-aware training preflight checks before launch.",migrationPriority:"high"},{method:"POST",path:"/api/train/sample_prompt",purpose:"Resolve and preview the effective training sample prompt text without launching a run.",migrationPriority:"high"},{method:"POST",path:"/api/run_script",purpose:"Run utility scripts from the tools page.",migrationPriority:"high"},{method:"POST",path:"/api/interrogate",purpose:"Run the built-in tagger/interrogator flow.",migrationPriority:"high"},{method:"GET",path:"/api/interrogators",purpose:"List available batch tagger/interrogator models for the rebuilt tools workspace.",migrationPriority:"high"},{method:"POST",path:"/api/captions/cleanup/preview",purpose:"Preview bulk caption cleanup rules before touching files.",migrationPriority:"high"},{method:"POST",path:"/api/captions/cleanup/apply",purpose:"Apply bulk caption cleanup rules to caption files.",migrationPriority:"high"},{method:"POST",path:"/api/captions/backups/create",purpose:"Create a snapshot archive of caption files for later restore.",migrationPriority:"high"},{method:"POST",path:"/api/captions/backups/list",purpose:"List caption snapshots associated with a folder.",migrationPriority:"high"},{method:"POST",path:"/api/captions/backups/restore",purpose:"Restore caption files from a saved snapshot archive.",migrationPriority:"high"},{method:"GET",path:"/api/pick_file",purpose:"Open native file/folder pickers where supported.",migrationPriority:"medium"},{method:"GET",path:"/api/get_files",purpose:"List model, output or train directories for file pickers.",migrationPriority:"high"},{method:"GET",path:"/api/tasks",purpose:"Fetch active and historical task state.",migrationPriority:"high"},{method:"GET",path:"/api/tasks/terminate/{task_id}",purpose:"Terminate a running task.",migrationPriority:"high"},{method:"GET",path:"/api/tageditor_status",purpose:"Poll tag-editor startup/proxy status.",migrationPriority:"medium"},{method:"GET",path:"/api/scripts",purpose:"List backend-approved utility scripts and positional args for the rebuilt tools page.",migrationPriority:"high"}];function Ze(){const e=Ve.map(a=>`
        <article class="panel route-card" data-status="${a.status}">
          <div class="panel-kicker">${a.section}</div>
          <h3>${a.title}</h3>
          <p class="route-path">${a.route}</p>
          <p>${a.notes}</p>
          ${a.schemaHints&&a.schemaHints.length>0?`<p class="schema-linkline">Schema hints: ${a.schemaHints.map(n=>`<code>${n}</code>`).join(", ")}</p>`:""}
          <div class="pill-row">
            <span class="pill ${a.status==="migrate-first"?"pill-hot":"pill-cool"}">${a.status}</span>
          </div>
        </article>
      `).join(""),t=Ha.map(a=>`
        <tr>
          <td><span class="method method-${a.method.toLowerCase()}">${a.method}</span></td>
          <td><code>${a.path}</code></td>
          <td>${a.purpose}</td>
          <td>${a.migrationPriority}</td>
        </tr>
      `).join("");return`
    ${P("workspace","Source migration dashboard","This page stays close to the backend and keeps our migration map explicit instead of hiding it inside hashed dist chunks.")}

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
          ${t}
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
  `}const R="#/workspace",q=[{id:"overview",label:"Workspace",section:"overview",hash:R,description:"Source migration dashboard and live backend diagnostics."},{id:"about",label:"About",section:"phase1",hash:"#/about",description:"Rebuild branding and release notes in source form."},{id:"settings",label:"Settings",section:"phase1",hash:"#/settings",description:"Read config summary and saved parameter state from the backend."},{id:"tasks",label:"Tasks",section:"phase1",hash:"#/tasks",description:"Inspect and manage task execution state."},{id:"tageditor",label:"Tag Editor",section:"phase1",hash:"#/tageditor",description:"Track startup status and future proxy behavior."},{id:"tensorboard",label:"TensorBoard",section:"phase1",hash:"#/tensorboard",description:"Prepare a cleaner source-side wrapper for TensorBoard access."},{id:"tools",label:"Tools",section:"phase1",hash:"#/tools",description:"Migrate script-launch and utility entry points from the legacy tools page."},{id:"schema-bridge",label:"Schema Bridge",section:"reference",hash:"#/schema-bridge",description:"Evaluate current schema DSL into a source-side explorer and prototype form renderer."},{id:"sdxl-train",label:"SDXL Train",section:"reference",hash:"#/sdxl-train",description:"First source-side training page powered by the schema bridge and current `/api/run` backend."},{id:"flux-train",label:"Flux Train",section:"reference",hash:"#/flux-train",description:"Source-side Flux LoRA training route built on the shared schema bridge and launch pipeline."},{id:"sd3-train",label:"SD3 Train",section:"reference",hash:"#/sd3-train",description:"Source-side SD3 LoRA training route using the same normalized payload workflow."},{id:"dreambooth-train",label:"Dreambooth",section:"reference",hash:"#/dreambooth-train",description:"Source-side Dreambooth and SDXL full-finetune route on the shared schema bridge."},{id:"sd-controlnet-train",label:"SD ControlNet",section:"reference",hash:"#/sd-controlnet-train",description:"Source-side SD ControlNet training route using the shared launch flow."},{id:"sdxl-controlnet-train",label:"SDXL ControlNet",section:"reference",hash:"#/sdxl-controlnet-train",description:"Source-side SDXL ControlNet training route using the shared launch flow."},{id:"flux-controlnet-train",label:"Flux ControlNet",section:"reference",hash:"#/flux-controlnet-train",description:"Source-side Flux ControlNet training route using the shared launch flow."},{id:"sdxl-lllite-train",label:"SDXL LLLite",section:"reference",hash:"#/sdxl-lllite-train",description:"Source-side SDXL ControlNet-LLLite training route on the shared training bridge."}],Qe=new Set(q.map(e=>e.hash)),et={"/index.html":R,"/index.md":R,"/404.html":R,"/404.md":R,"/task.html":"#/tasks","/task.md":"#/tasks","/tageditor.html":"#/tageditor","/tageditor.md":"#/tageditor","/tagger.html":"#/tageditor","/tagger.md":"#/tageditor","/tensorboard.html":"#/tensorboard","/tensorboard.md":"#/tensorboard","/other/about.html":"#/about","/other/about.md":"#/about","/other/settings.html":"#/settings","/other/settings.md":"#/settings","/dreambooth/index.html":"#/dreambooth-train","/dreambooth/index.md":"#/dreambooth-train","/lora/index.html":"#/sdxl-train","/lora/index.md":"#/sdxl-train"},Ua=Object.keys(et).sort((e,t)=>t.length-e.length);function ue(e){const t=e.replace(/\/+$/,"");return t.length>0?`${t}/`:"/"}function za(e){switch(e){case"flux":case"flux-finetune":return"#/flux-train";case"sd3":case"sd3-finetune":return"#/sd3-train";case"controlnet":return"#/sd-controlnet-train";case"sdxl-controlnet":return"#/sdxl-controlnet-train";case"flux-controlnet":return"#/flux-controlnet-train";case"sdxl-lllite":return"#/sdxl-lllite-train";case"tools":return"#/tools";case"basic":case"master":case"params":case"sdxl":case"sdxl-ti":case"ti":case"xti":case"anima":case"anima-finetune":case"hunyuan":case"lumina":case"lumina-finetune":return"#/sdxl-train";default:return null}}function Va(e){const t=e.match(/^(.*)\/lora\/([^/]+)\.(?:html|md)$/i);if(!t)return null;const[,a,n]=t,s=za(n.toLowerCase());return s?{hash:s,canonicalRootPath:ue(a)}:null}function Wa(e){const t=e.toLowerCase();for(const a of Ua)if(t.endsWith(a))return{hash:et[a],canonicalRootPath:ue(e.slice(0,e.length-a.length))};return Va(e)}function Ie(e,t){const a=`${e}${window.location.search}${t}`,n=`${window.location.pathname}${window.location.search}${window.location.hash}`;a!==n&&window.history.replaceState(null,"",a)}function Ma(){const e=Qe.has(window.location.hash)?window.location.hash:R;return q.find(t=>t.hash===e)??q[0]}function Ga(){if(Qe.has(window.location.hash))return;const e=Wa(window.location.pathname);if(e){Ie(e.canonicalRootPath,e.hash);return}Ie(ue(window.location.pathname||"/"),R)}const Ne={"sdxl-train":{routeId:"sdxl-train",schemaName:"sdxl-lora",prefix:"sdxl",modelLabel:"SDXL",presetTrainTypes:["sdxl-lora"]},"flux-train":{routeId:"flux-train",schemaName:"flux-lora",prefix:"flux",modelLabel:"Flux",presetTrainTypes:["flux-lora"]},"sd3-train":{routeId:"sd3-train",schemaName:"sd3-lora",prefix:"sd3",modelLabel:"SD3",presetTrainTypes:["sd3-lora"]},"dreambooth-train":{routeId:"dreambooth-train",schemaName:"dreambooth",prefix:"dreambooth",modelLabel:"Dreambooth",presetTrainTypes:["dreambooth","sd-dreambooth","sdxl-finetune"]},"sd-controlnet-train":{routeId:"sd-controlnet-train",schemaName:"sd-controlnet",prefix:"sd-controlnet",modelLabel:"SD ControlNet",presetTrainTypes:["sd-controlnet"]},"sdxl-controlnet-train":{routeId:"sdxl-controlnet-train",schemaName:"sdxl-controlnet",prefix:"sdxl-controlnet",modelLabel:"SDXL ControlNet",presetTrainTypes:["sdxl-controlnet"]},"flux-controlnet-train":{routeId:"flux-controlnet-train",schemaName:"flux-controlnet",prefix:"flux-controlnet",modelLabel:"Flux ControlNet",presetTrainTypes:["flux-controlnet"]},"sdxl-lllite-train":{routeId:"sdxl-lllite-train",schemaName:"sdxl-controlnet-lllite",prefix:"sdxl-lllite",modelLabel:"SDXL LLLite",presetTrainTypes:["sdxl-controlnet-lllite"]}};function Xa(e,t){if(t.length===0){h(e,"<p>No GPUs reported. Training will use the backend default environment.</p>");return}const a=t.map((n,s)=>{const i=n.index??n.id??s,r=String(i);return`
        <label class="gpu-chip">
          <input type="checkbox" data-gpu-id="${l(r)}" />
          <span>GPU ${l(r)}: ${l(n.name)}</span>
        </label>
      `}).join("");h(e,`<div class="gpu-chip-grid">${a}</div>`)}function he(e){return[...document.querySelectorAll(`#${e} input[data-gpu-id]:checked`)].map(t=>t.dataset.gpuId).filter(t=>!!t)}function me(e,t=[]){const a=new Set(t.map(n=>String(n)));document.querySelectorAll(`#${e}-gpu-selector input[data-gpu-id]`).forEach(n=>{const s=n.dataset.gpuId??"";n.checked=a.has(s)})}function Ka(e){switch(e){case"prompt_file":return"Prompt file";case"generated":return"Generated from current fields";case"random_dataset_prompt_preview":return"Random dataset-derived prompt";case"legacy_sample_prompts_file":return"Legacy sample_prompts file";case"legacy_sample_prompts_inline":return"Legacy sample_prompts text";default:return e}}function x(e,t,a,n="idle"){h(`${e}-submit-status`,`
      <div class="submit-status-box submit-status-${n}">
        <strong>${l(t)}</strong>
        <p>${l(a)}</p>
      </div>
    `)}function W(e,t,a){if(a){h(`${e}-validation-status`,`
        <div class="submit-status-box submit-status-error">
          <strong>Payload preparation failed</strong>
          <p>${l(a)}</p>
        </div>
      `);return}const n=[t.errors.length>0?`
          <div>
            <strong>Errors</strong>
            <ul class="status-list">
              ${t.errors.map(s=>`<li>${l(s)}</li>`).join("")}
            </ul>
          </div>
        `:"",t.warnings.length>0?`
          <div>
            <strong>Warnings</strong>
            <ul class="status-list">
              ${t.warnings.map(s=>`<li>${l(s)}</li>`).join("")}
            </ul>
          </div>
        `:""].filter(Boolean).join("");if(!n){h(`${e}-validation-status`,`
        <div class="submit-status-box submit-status-success">
          <strong>Compatibility checks passed</strong>
          <p>No obvious parameter conflicts were detected in the current payload.</p>
        </div>
      `);return}h(`${e}-validation-status`,`
      <div class="submit-status-box ${t.errors.length>0?"submit-status-error":"submit-status-warning"}">
        <strong>${t.errors.length>0?"Action needed before launch":"Review before launch"}</strong>
        ${n}
      </div>
    `)}function f(e,t,a="idle"){const n=document.querySelector(`#${e}-utility-note`);n&&(n.textContent=t,n.classList.remove("utility-note-success","utility-note-warning","utility-note-error"),a==="success"?n.classList.add("utility-note-success"):a==="warning"?n.classList.add("utility-note-warning"):a==="error"&&n.classList.add("utility-note-error"))}function Ce(e,t,a){if(a){h(`${e}-preflight-report`,`
        <div class="submit-status-box submit-status-error">
          <strong>Preflight request failed</strong>
          <p>${l(a)}</p>
        </div>
      `);return}if(!t){h(`${e}-preflight-report`,`
        <div class="submit-status-box">
          <strong>Training preflight has not run yet</strong>
          <p>Run preflight to verify dataset, model, resume path, prompt preview, and runtime fallback expectations before launch.</p>
        </div>
      `);return}const n=[t.errors.length?`
          <div>
            <strong>Errors</strong>
            <ul class="status-list">
              ${t.errors.map(s=>`<li>${l(s)}</li>`).join("")}
            </ul>
          </div>
        `:"",t.warnings.length?`
          <div>
            <strong>Warnings</strong>
            <ul class="status-list">
              ${t.warnings.map(s=>`<li>${l(s)}</li>`).join("")}
            </ul>
          </div>
        `:"",t.notes.length?`
          <div>
            <strong>Notes</strong>
            <ul class="status-list">
              ${t.notes.map(s=>`<li>${l(s)}</li>`).join("")}
            </ul>
          </div>
        `:"",t.dataset?`
          <div>
            <strong>Dataset</strong>
            <ul class="status-list">
              <li>${l(t.dataset.path)}</li>
              <li>${t.dataset.image_count} images · ${t.dataset.effective_image_count} effective images</li>
              <li>${t.dataset.alpha_capable_image_count} alpha-capable candidates</li>
              <li>${(t.dataset.caption_coverage*100).toFixed(1)}% caption coverage</li>
              <li>${t.dataset.images_without_caption_count} without captions · ${t.dataset.broken_image_count} broken images</li>
            </ul>
          </div>
        `:"",t.conditioning_dataset?`
          <div>
            <strong>Conditioning dataset</strong>
            <ul class="status-list">
              <li>${l(t.conditioning_dataset.path)}</li>
              <li>${t.conditioning_dataset.image_count} images · ${(t.conditioning_dataset.caption_coverage*100).toFixed(1)}% caption coverage</li>
            </ul>
          </div>
        `:"",t.sample_prompt?`
          <div>
            <strong>Sample prompt preview</strong>
            <p class="training-preflight-meta">${l(Ka(t.sample_prompt.source))}${t.sample_prompt.detail?` · ${l(t.sample_prompt.detail)}`:""}</p>
            <pre class="preset-preview">${l(t.sample_prompt.preview)}</pre>
          </div>
        `:""].filter(Boolean).join("");h(`${e}-preflight-report`,`
      <div class="submit-status-box ${t.can_start?"submit-status-success":"submit-status-warning"}">
        <strong>${t.can_start?"Backend preflight passed":"Backend preflight found launch blockers"}</strong>
        <p>Training type: ${l(t.training_type)}</p>
        ${n}
      </div>
    `)}function Ja(e){const t=[];let a="",n=null,s=0;for(let i=0;i<e.length;i+=1){const r=e[i],c=i>0?e[i-1]:"";if(n){a+=r,r===n&&c!=="\\"&&(n=null);continue}if(r==='"'||r==="'"){n=r,a+=r;continue}if(r==="["){s+=1,a+=r;continue}if(r==="]"){s-=1,a+=r;continue}if(r===","&&s===0){t.push(a.trim()),a="";continue}a+=r}return a.trim().length>0&&t.push(a.trim()),t}function Ya(e){let t=null,a=!1,n="";for(const s of e){if(t){if(n+=s,t==='"'&&s==="\\"&&!a){a=!0;continue}s===t&&!a&&(t=null),a=!1;continue}if(s==='"'||s==="'"){t=s,n+=s;continue}if(s==="#")break;n+=s}return n.trim()}function tt(e){return e.startsWith('"')&&e.endsWith('"')?e.slice(1,-1).replaceAll('\\"','"').replaceAll("\\n",`
`).replaceAll("\\t","	").replaceAll("\\\\","\\"):e.startsWith("'")&&e.endsWith("'")?e.slice(1,-1):e}function at(e){const t=e.trim();return t.length===0?"":t.startsWith('"')&&t.endsWith('"')||t.startsWith("'")&&t.endsWith("'")?tt(t):t==="true"?!0:t==="false"?!1:t.startsWith("[")&&t.endsWith("]")?Ja(t.slice(1,-1)).map(a=>at(a)):/^[+-]?\d[\d_]*(\.\d[\d_]*)?([eE][+-]?\d+)?$/.test(t)?Number(t.replaceAll("_","")):t}function Re(e){return e.split(".").map(t=>t.trim()).filter(Boolean).map(t=>tt(t))}function Za(e,t,a){let n=e;for(let s=0;s<t.length-1;s+=1){const i=t[s],r=n[i];(!r||typeof r!="object"||Array.isArray(r))&&(n[i]={}),n=n[i]}n[t[t.length-1]]=a}function st(e){const t={};let a=[];for(const n of e.split(/\r?\n/)){const s=Ya(n);if(!s)continue;if(s.startsWith("[[")&&s.endsWith("]]"))throw new Error("Array-of-table syntax is not supported in custom params yet.");if(s.startsWith("[")&&s.endsWith("]")){a=Re(s.slice(1,-1));continue}const i=s.indexOf("=");if(i===-1)throw new Error(`Invalid TOML line: ${n}`);const r=Re(s.slice(0,i));if(r.length===0)throw new Error(`Invalid TOML key: ${n}`);Za(t,[...a,...r],at(s.slice(i+1)))}return t}function ee(e){return JSON.stringify(e)}function nt(e){return typeof e=="string"?ee(e):typeof e=="number"?Number.isFinite(e)?String(e):ee(String(e)):typeof e=="boolean"?e?"true":"false":Array.isArray(e)?`[${e.map(t=>nt(t)).join(", ")}]`:ee(JSON.stringify(e))}function it(e,t=[],a=[]){const n=[];for(const[s,i]of Object.entries(e)){if(i&&typeof i=="object"&&!Array.isArray(i)){it(i,[...t,s],a);continue}n.push([s,i])}return a.push({path:t,values:n}),a}function Qa(e){const t=it(e).filter(n=>n.values.length>0).sort((n,s)=>n.path.join(".").localeCompare(s.path.join("."))),a=[];for(const n of t){n.path.length>0&&(a.length>0&&a.push(""),a.push(`[${n.path.join(".")}]`));for(const[s,i]of n.values.sort(([r],[c])=>r.localeCompare(c)))a.push(`${s} = ${nt(i)}`)}return a.join(`
`)}const es=["pretrained_model_name_or_path","train_data_dir","reg_data_dir","output_dir","network_weights","conditioning_data_dir","controlnet_model_name_or_path","weights","vae","text_encoder","byt5","qwen3","llm_adapter_path","t5_tokenizer_path","ae","clip_l","clip_g","t5xxl","gemma2"],ts=["learning_rate","unet_lr","text_encoder_lr","learning_rate_te","learning_rate_te1","learning_rate_te2","learning_rate_te3","sigmoid_scale","guidance_scale","training_shift","control_net_lr","self_attn_lr","cross_attn_lr","mlp_lr","mod_lr","llm_adapter_lr"],as=["lycoris_algo","conv_dim","conv_alpha","dropout","dylora_unit","lokr_factor","train_norm","down_lr_weight","mid_lr_weight","up_lr_weight","block_lr_zero_threshold","enable_block_weights","enable_preview","network_args_custom","optimizer_args_custom","enable_base_weight","prodigy_d0","prodigy_d_coef","ui_custom_params"],ss=["vae","reg_data_dir","network_weights","conditioning_data_dir","controlnet_model_name_or_path","weights","init_word","text_encoder","byt5","qwen3","llm_adapter_path","t5_tokenizer_path","ae","clip_l","clip_g","t5xxl","gemma2","noise_offset","multires_noise_iterations","multires_noise_discount","caption_dropout_rate","network_dropout","scale_weight_norms","gpu_ids"],ns=["v2","v_parameterization","scale_v_pred_loss_like_noise_pred","clip_skip","learning_rate_te","stop_text_encoder_training"],is=["learning_rate_te1","learning_rate_te2"],rs=[["cache_text_encoder_outputs","shuffle_caption"],["noise_offset","multires_noise_iterations"],["cache_latents","color_aug"],["cache_latents","random_crop"]],Be={algo:"lycoris_algo",unit:"dylora_unit",factor:"lokr_factor"},os=new Set(["conv_dim","conv_alpha","dropout","down_lr_weight","mid_lr_weight","up_lr_weight","block_lr_zero_threshold"]),ls=new Set(["decouple","weight_decay","use_bias_correction","safeguard_warmup"]),cs=new Set(["base_weights","base_weights_multiplier"]),ds={pretrained_model_name_or_path:"./sd-models/model.safetensors",train_data_dir:"./train/aki",resolution:"512,512",enable_bucket:!0,min_bucket_reso:256,max_bucket_reso:1024,output_name:"aki",output_dir:"./output",save_model_as:"safetensors",save_every_n_epochs:2,max_train_epochs:10,train_batch_size:1,network_train_unet_only:!1,network_train_text_encoder_only:!1,learning_rate:1e-4,unet_lr:1e-4,text_encoder_lr:1e-5,lr_scheduler:"cosine_with_restarts",optimizer_type:"AdamW8bit",lr_scheduler_num_cycles:1,network_module:"networks.lora",network_dim:32,network_alpha:32,logging_dir:"./logs",caption_extension:".txt",shuffle_caption:!0,keep_tokens:0,max_token_length:255,seed:1337,prior_loss_weight:1,clip_skip:2,mixed_precision:"fp16",save_precision:"fp16",xformers:!0,cache_latents:!0,persistent_data_loader_workers:!0};function oe(e){return JSON.parse(JSON.stringify(e??{}))}function U(e){return Array.isArray(e)?e.map(t=>String(t??"").trim()).filter(Boolean):String(e??"").split(/\r?\n/).map(t=>t.trim()).filter(Boolean)}function N(e,t){return Object.prototype.hasOwnProperty.call(e,t)}function ps(e){return String(e.model_train_type??"").startsWith("sdxl")}function us(e){return String(e.model_train_type??"")==="sd3-finetune"}function b(e){return e==null?"":String(e)}function hs(e){return b(e).replaceAll("\\","/")}function M(e,t=0){const a=Number.parseFloat(b(e));return Number.isNaN(a)?t:a}function v(e){return!!e}function qe(e){const t=e.indexOf("=");return t===-1?{key:e.trim(),value:"",hasValue:!1}:{key:e.slice(0,t).trim(),value:e.slice(t+1).trim(),hasValue:!0}}function ms(e){if(typeof e=="boolean")return e;const t=b(e).toLowerCase();return t==="true"||t==="1"||t==="yes"}function rt(e,t=String(e.model_train_type??"")){const a=t==="lora-basic"?{...ds,...oe(e)}:oe(e),n=[],s=[],i=ps(a),r=us(a);(i||r)&&[a.learning_rate_te1,a.learning_rate_te2,a.learning_rate_te3].some(v)&&(a.train_text_encoder=!0);for(const o of i||r?ns:is)N(a,o)&&delete a[o];a.network_module==="lycoris.kohya"?(n.push(`conv_dim=${b(a.conv_dim)}`,`conv_alpha=${b(a.conv_alpha)}`,`dropout=${b(a.dropout)}`,`algo=${b(a.lycoris_algo)}`),v(a.lokr_factor)&&n.push(`factor=${b(a.lokr_factor)}`),v(a.train_norm)&&n.push("train_norm=True")):a.network_module==="networks.dylora"&&n.push(`unit=${b(a.dylora_unit)}`);const c=b(a.optimizer_type),d=c.toLowerCase();d.startsWith("dada")?((c==="DAdaptation"||c==="DAdaptAdam")&&s.push("decouple=True","weight_decay=0.01"),a.learning_rate=1,a.unet_lr=1,a.text_encoder_lr=1):d==="prodigy"&&(s.push("decouple=True","weight_decay=0.01","use_bias_correction=True",`d_coef=${b(a.prodigy_d_coef)}`),v(a.lr_warmup_steps)&&s.push("safeguard_warmup=True"),v(a.prodigy_d0)&&s.push(`d0=${b(a.prodigy_d0)}`)),v(a.enable_block_weights)&&(n.push(`down_lr_weight=${b(a.down_lr_weight)}`,`mid_lr_weight=${b(a.mid_lr_weight)}`,`up_lr_weight=${b(a.up_lr_weight)}`,`block_lr_zero_threshold=${b(a.block_lr_zero_threshold)}`),delete a.block_lr_zero_threshold),v(a.enable_base_weight)?(a.base_weights=U(a.base_weights),a.base_weights_multiplier=U(a.base_weights_multiplier).map(o=>M(o))):(delete a.base_weights,delete a.base_weights_multiplier);for(const o of U(a.network_args_custom))n.push(o);for(const o of U(a.optimizer_args_custom))s.push(o);v(a.enable_preview)||(delete a.sample_prompts,delete a.sample_sampler,delete a.sample_every_n_epochs);for(const o of ts)N(a,o)&&(a[o]=M(a[o]));for(const o of ss){if(!N(a,o))continue;const u=a[o];(u===0||u===""||Array.isArray(u)&&u.length===0)&&delete a[o]}for(const o of es)N(a,o)&&a[o]&&(a[o]=hs(a[o]));if(n.length>0?a.network_args=n:delete a.network_args,s.length>0?a.optimizer_args=s:delete a.optimizer_args,v(a.ui_custom_params)){const o=st(b(a.ui_custom_params));Object.assign(a,o)}for(const o of as)N(a,o)&&delete a[o];return Array.isArray(a.gpu_ids)&&(a.gpu_ids=a.gpu_ids.map(o=>{const u=b(o),m=u.match(/GPU\s+(\d+):/);return m?m[1]:u})),a}function gs(e){const t=[],a=[],n=b(e.optimizer_type),s=n.toLowerCase(),i=b(e.model_train_type),r=i==="sd3-finetune",c=i==="anima-lora"||i==="anima-finetune";n.startsWith("DAdapt")&&e.lr_scheduler!=="constant"&&t.push("DAdaptation works best with lr_scheduler set to constant."),s.startsWith("prodigy")&&(N(e,"unet_lr")||N(e,"text_encoder_lr"))&&(M(e.unet_lr,1)!==1||M(e.text_encoder_lr,1)!==1)&&t.push("Prodigy usually expects unet_lr and text_encoder_lr to stay at 1."),e.network_module==="networks.oft"&&i!=="sdxl-lora"&&a.push("OFT is currently only supported for SDXL LoRA."),r&&v(e.train_text_encoder)&&v(e.cache_text_encoder_outputs)&&!v(e.use_t5xxl_cache_only)&&a.push("SD3 full finetune cannot train text encoders while cache_text_encoder_outputs is enabled."),r&&v(e.train_t5xxl)&&!v(e.train_text_encoder)&&a.push("train_t5xxl requires train_text_encoder to be enabled first."),r&&v(e.train_t5xxl)&&v(e.cache_text_encoder_outputs)&&a.push("train_t5xxl cannot be combined with cache_text_encoder_outputs."),c&&v(e.unsloth_offload_checkpointing)&&v(e.cpu_offload_checkpointing)&&a.push("unsloth_offload_checkpointing cannot be combined with cpu_offload_checkpointing."),c&&v(e.unsloth_offload_checkpointing)&&v(e.blocks_to_swap)&&a.push("unsloth_offload_checkpointing cannot be combined with blocks_to_swap.");for(const[d,o]of rs)v(e[d])&&v(e[o])&&a.push(`Parameters ${d} and ${o} conflict. Please enable only one of them.`);return{warnings:t,errors:a}}function ot(e){const t=oe(e);if(Array.isArray(t.network_args)){const a=[];for(const n of t.network_args){const{key:s,value:i,hasValue:r}=qe(b(n));if(s==="train_norm"){t.train_norm=r?ms(i):!0;continue}if((s==="down_lr_weight"||s==="mid_lr_weight"||s==="up_lr_weight"||s==="block_lr_zero_threshold")&&(t.enable_block_weights=!0),os.has(s)){t[s]=i;continue}if(Be[s]){t[Be[s]]=i;continue}a.push(b(n))}a.length>0&&(t.network_args_custom=a),delete t.network_args}if(Array.isArray(t.optimizer_args)){const a=[];for(const n of t.optimizer_args){const{key:s,value:i}=qe(b(n));if(s==="d_coef"){t.prodigy_d_coef=i;continue}if(s==="d0"){t.prodigy_d0=i;continue}ls.has(s)||a.push(b(n))}a.length>0&&(t.optimizer_args_custom=a),delete t.optimizer_args}for(const a of cs)Array.isArray(t[a])&&(t[a]=t[a].map(n=>b(n)).join(`
`),a==="base_weights"&&(t.enable_base_weight=!0),a==="base_weights_multiplier"&&(t.enable_base_weight=!0));return Array.isArray(t.gpu_ids)&&(t.gpu_ids=t.gpu_ids.map(a=>b(a))),t}function lt(e,t){const a=t.values.output_name;return typeof a=="string"&&a.trim().length>0?a.trim():`${e.modelLabel} snapshot`}function fs(e){try{return JSON.stringify(rt(K(e.value)),null,2)}catch(t){return t instanceof Error?t.message:"Unable to preview this snapshot."}}function bs(e,t){if(t.length===0){h(`${e}-history-panel`,`
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
      `);return}const a=t.map((n,s)=>`
        <article class="history-card">
          <div class="history-card-head">
            <div>
              <h4>${l(n.name||"Unnamed snapshot")}</h4>
              <p class="history-card-meta">${l(n.time)}</p>
            </div>
            <span class="coverage-pill coverage-pill-muted">${l((n.gpu_ids??[]).join(", ")||"default GPU")}</span>
          </div>
          <pre class="history-preview">${l(fs(n))}</pre>
          <div class="history-card-actions">
            <button class="action-button action-button-ghost action-button-small" data-history-apply="${s}" type="button">Apply</button>
            <button class="action-button action-button-ghost action-button-small" data-history-rename="${s}" type="button">Rename</button>
            <button class="action-button action-button-ghost action-button-small" data-history-delete="${s}" type="button">Delete</button>
          </div>
        </article>
      `).join("");h(`${e}-history-panel`,`
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
      <div class="history-list">${a}</div>
    `)}function ys(e,t){if(t.length===0){h(`${e}-presets-panel`,`
        <div class="training-side-panel-head">
          <div>
            <p class="panel-kicker">presets</p>
            <h3>Training presets</h3>
          </div>
          <button class="action-button action-button-ghost action-button-small" data-preset-close="${e}" type="button">Close</button>
        </div>
        <p>No presets matched this training route.</p>
      `);return}const a=t.map((n,s)=>{const i=n.metadata??{},r=n.data??{};return`
        <article class="preset-card">
          <div class="preset-card-head">
            <div>
              <h4>${l(i.name||n.name||`Preset ${s+1}`)}</h4>
              <p class="preset-card-meta">
                ${l(String(i.version||"unknown"))}
                · ${l(String(i.author||"unknown author"))}
              </p>
            </div>
            <span class="coverage-pill coverage-pill-muted">${l(String(i.train_type||"shared"))}</span>
          </div>
          <p>${l(String(i.description||"No description"))}</p>
          <pre class="preset-preview">${l(JSON.stringify(r,null,2))}</pre>
          <div class="preset-card-actions">
            <button class="action-button action-button-ghost action-button-small" data-preset-apply="${s}" type="button">Apply</button>
          </div>
        </article>
      `}).join("");h(`${e}-presets-panel`,`
      <div class="training-side-panel-head">
        <div>
          <p class="panel-kicker">presets</p>
          <h3>Training presets</h3>
        </div>
        <button class="action-button action-button-ghost action-button-small" data-preset-close="${e}" type="button">Close</button>
      </div>
      <div class="preset-list">${a}</div>
    `)}function vs(e,t){const a=new Set(e.presetTrainTypes);return t.filter(n=>{const i=(n.metadata??{}).train_type;return typeof i!="string"||i.trim().length===0?!0:a.has(i)})}function E(e,t,a){const n=document.querySelector(`#${e}-history-panel`),s=document.querySelector(`#${e}-presets-panel`);n&&(n.hidden=t==="history"?!a:!0),s&&(s.hidden=t==="presets"?!a:!0)}async function De(e,t){try{const a=await Ct(t);if(a.status!=="success")throw new Error(a.message||"Training preflight failed.");return Ce(e.prefix,a.data??null),a.data??null}catch(a){throw Ce(e.prefix,null,a instanceof Error?a.message:"Training preflight failed."),a}}function ks(e){var t;(t=document.querySelector(`#${e.prefix}-stop-train`))==null||t.addEventListener("click",async()=>{var a;try{const s=(((a=(await de()).data)==null?void 0:a.tasks)??[]).find(r=>String(r.status).toUpperCase()==="RUNNING");if(!s){f(e.prefix,"No running training task was found.","warning");return}const i=String(s.id??s.task_id??"");if(!i){f(e.prefix,"The running task does not expose an id.","error");return}if(!window.confirm(`Stop running task ${i}?`))return;await He(i),x(e.prefix,"Training stop requested",`Sent terminate request for task ${i}.`,"warning"),f(e.prefix,`Terminate requested for task ${i}.`,"warning")}catch(n){f(e.prefix,n instanceof Error?n.message:"Failed to stop training.","error")}})}function _s(e,t,a){var s;(s=document.querySelector(`#${e.prefix}-run-preflight`))==null||s.addEventListener("click",async()=>{const i=t();if(!i){x(e.prefix,"Editor not ready",`The ${e.modelLabel} schema editor state is not initialized yet.`,"error");return}try{const r=a(i);W(e.prefix,r.checks),await De(e,r.payload),f(e.prefix,"Training preflight completed.","success")}catch(r){f(e.prefix,r instanceof Error?r.message:"Training preflight failed.","error")}});const n=document.querySelector(`#${e.prefix}-start-train`);n==null||n.addEventListener("click",async()=>{var r;const i=t();if(!i){x(e.prefix,"Editor not ready",`The ${e.modelLabel} schema editor state is not initialized yet.`,"error");return}n.setAttribute("disabled","true"),x(e.prefix,"Submitting training job...","Sending the current payload to /api/run.","idle");try{const c=a(i);if(c.checks.errors.length>0){x(e.prefix,"Fix parameter conflicts first",c.checks.errors.join(" "),"error"),W(e.prefix,c.checks);return}const d=await De(e,c.payload);if(d&&!d.can_start){x(e.prefix,"Resolve preflight errors first",d.errors.join(" "),"error");return}const o=await Nt(c.payload);if(o.status==="success"){const m=[...c.checks.warnings,...(d==null?void 0:d.warnings)??[],...((r=o.data)==null?void 0:r.warnings)??[]].join(" ");x(e.prefix,"Training request accepted",`${o.message||"Training started."}${m?` ${m}`:""}`,m?"warning":"success")}else x(e.prefix,"Training request failed",o.message||"Unknown backend failure.","error")}catch(c){x(e.prefix,"Training request failed",c instanceof Error?c.message:"Unknown network error.","error")}finally{n.removeAttribute("disabled")}})}function ge(){return typeof window<"u"?window:null}function ct(e,t){const a=ge();if(!a)return t;try{const n=a.localStorage.getItem(e);return n?JSON.parse(n):t}catch{return t}}function dt(e,t){const a=ge();a&&a.localStorage.setItem(e,JSON.stringify(t))}function pt(e){return`source-training-autosave-${e}`}function ut(e){return`source-training-history-${e}`}function ws(e){return ct(pt(e),null)}function $s(e,t){dt(pt(e),t)}function C(e){return ct(ut(e),[])}function G(e,t){dt(ut(e),t)}function fe(e,t,a="text/plain;charset=utf-8"){const n=ge();if(!n)return;const s=new Blob([t],{type:a}),i=URL.createObjectURL(s),r=n.document.createElement("a");r.href=i,r.download=e,r.click(),URL.revokeObjectURL(i)}function xs(e,t,a){var s;const n=C(e.routeId);n.unshift({time:new Date().toLocaleString(),name:lt(e,t),value:K(t.values),gpu_ids:he(`${e.prefix}-gpu-selector`)}),G(e.routeId,n.slice(0,40)),(s=document.querySelector(`#${e.prefix}-history-panel`))!=null&&s.hidden||a()}function Ss(e,t,a,n){var s,i,r;(s=document.querySelector(`#${e.prefix}-download-config`))==null||s.addEventListener("click",()=>{const c=t();if(!c)return;const d=a(c);fe(`${e.prefix}-${We()}.toml`,Qa(d.payload)),f(e.prefix,"Exported current config as TOML.","success")}),(i=document.querySelector(`#${e.prefix}-import-config`))==null||i.addEventListener("click",()=>{var c;(c=document.querySelector(`#${e.prefix}-config-file-input`))==null||c.click()}),(r=document.querySelector(`#${e.prefix}-config-file-input`))==null||r.addEventListener("change",c=>{var m;const d=c.currentTarget,o=(m=d.files)==null?void 0:m[0];if(!o)return;const u=new FileReader;u.onload=()=>{try{const g=st(String(u.result??""));n(g),f(e.prefix,`Imported config: ${o.name}.`,"success")}catch(g){f(e.prefix,g instanceof Error?g.message:"Failed to import config.","error")}finally{d.value=""}},u.readAsText(o)})}function Ts(e,t){var a;(a=document.querySelector(`#${e.prefix}-history-file-input`))==null||a.addEventListener("change",n=>{var c;const s=n.currentTarget,i=(c=s.files)==null?void 0:c[0];if(!i)return;const r=new FileReader;r.onload=()=>{try{const d=JSON.parse(String(r.result??""));if(!Array.isArray(d))throw new Error("History file must contain an array.");const o=d.filter(m=>m&&typeof m=="object"&&m.value&&typeof m.value=="object").map(m=>({time:String(m.time||new Date().toLocaleString()),name:m.name?String(m.name):void 0,value:K(m.value),gpu_ids:Array.isArray(m.gpu_ids)?m.gpu_ids.map(g=>String(g)):[]}));if(o.length===0)throw new Error("History file did not contain valid entries.");const u=[...C(e.routeId),...o].slice(0,80);G(e.routeId,u),t(),f(e.prefix,`Imported ${o.length} history entries.`,"success")}catch(d){f(e.prefix,d instanceof Error?d.message:"Failed to import history.","error")}finally{s.value=""}},r.readAsText(i)})}function Ls(e,t,a){h(`${e}-sample-prompt-workspace`,`
      <div class="submit-status-box">
        <strong>${l(t)}</strong>
        <p>${l(a)}</p>
      </div>
    `)}function Ps(e){switch(e){case"prompt_file":return"Prompt file";case"generated":return"Generated from current fields";case"random_dataset_prompt_preview":return"Random dataset-derived prompt";case"legacy_sample_prompts_file":return"Legacy sample_prompts file";case"legacy_sample_prompts_inline":return"Legacy sample_prompts text";default:return e}}function X(e){Ls(e,"Sample prompt workspace is waiting for refresh","Edit prompt fields freely, then click Refresh prompt to inspect the exact text that would be used.")}function z(e,t,a){if(a){h(`${e}-sample-prompt-workspace`,`
        <div class="submit-status-box submit-status-error">
          <strong>Sample prompt preview failed</strong>
          <p>${l(a)}</p>
        </div>
      `);return}if(!t){X(e);return}const n=[t.warnings.length?`
          <div>
            <strong>Warnings</strong>
            <ul class="status-list">
              ${t.warnings.map(r=>`<li>${l(r)}</li>`).join("")}
            </ul>
          </div>
        `:"",t.notes.length?`
          <div>
            <strong>Notes</strong>
            <ul class="status-list">
              ${t.notes.map(r=>`<li>${l(r)}</li>`).join("")}
            </ul>
          </div>
        `:""].filter(Boolean).join(""),s=t.warnings.length>0||!t.enabled?"submit-status-warning":"submit-status-success",i=t.line_count>3?`Showing the first 3 non-empty lines out of ${t.line_count}.`:`${t.line_count||0} non-empty line${t.line_count===1?"":"s"} detected.`;h(`${e}-sample-prompt-workspace`,`
      <div class="submit-status-box ${s}">
        <strong>${t.enabled?"Sample prompt resolved":"Sample prompt resolved, but preview is disabled"}</strong>
        <p class="training-preflight-meta">${l(Ps(t.source))}${t.detail?` · ${l(t.detail)}`:""}</p>
        <p class="training-preflight-meta">${l(i)} Download will use ${l(t.suggested_file_name)}.</p>
        ${n}
        <pre class="preset-preview">${l(t.preview)}</pre>
      </div>
    `)}async function je(e,t,a){const n=t();if(!n)throw new Error(`${e.modelLabel} editor is not ready yet.`);const s=a(n),i=await Rt(s.payload);if(i.status!=="success"||!i.data)throw new Error(i.message||"Sample prompt preview failed.");return i.data}function Es(e){var i,r,c,d;const{config:t,getCurrentState:a,buildPreparedTrainingPayload:n,applyEditableRecord:s}=e;(i=document.querySelector(`#${t.prefix}-refresh-sample-prompt`))==null||i.addEventListener("click",async()=>{try{const o=await je(t,a,n);z(t.prefix,o),f(t.prefix,"Sample prompt preview refreshed.","success")}catch(o){z(t.prefix,null,o instanceof Error?o.message:"Sample prompt preview failed."),f(t.prefix,o instanceof Error?o.message:"Sample prompt preview failed.","error")}}),(r=document.querySelector(`#${t.prefix}-download-sample-prompt`))==null||r.addEventListener("click",async()=>{try{const o=await je(t,a,n);z(t.prefix,o),fe(o.suggested_file_name||"sample-prompts.txt",o.content||""),f(t.prefix,`Sample prompt exported as ${o.suggested_file_name}.`,"success")}catch(o){z(t.prefix,null,o instanceof Error?o.message:"Sample prompt export failed."),f(t.prefix,o instanceof Error?o.message:"Sample prompt export failed.","error")}}),(c=document.querySelector(`#${t.prefix}-pick-prompt-file`))==null||c.addEventListener("click",async()=>{try{const o=await j("text-file");s({prompt_file:o},void 0,"merge"),X(t.prefix),f(t.prefix,"Prompt file path inserted into the current form state.","success")}catch(o){f(t.prefix,o instanceof Error?o.message:"Prompt file picker failed.","error")}}),(d=document.querySelector(`#${t.prefix}-clear-prompt-file`))==null||d.addEventListener("click",()=>{s({prompt_file:""},void 0,"merge"),X(t.prefix),f(t.prefix,"prompt_file cleared from the current form state.","warning")})}function As(e){var m,g,y,_;const{config:t,createDefaultState:a,getCurrentState:n,mountTrainingState:s,onStateChange:i,applyEditableRecord:r,buildPreparedTrainingPayload:c,bindHistoryPanel:d,openHistoryPanel:o,openPresetPanel:u}=e;document.querySelectorAll(`#${t.prefix}-gpu-selector input[data-gpu-id]`).forEach($=>{$.addEventListener("change",()=>{const O=n();O&&i(O)})}),(m=document.querySelector(`#${t.prefix}-reset-all`))==null||m.addEventListener("click",()=>{const $=a();me(t.prefix,[]),s($),f(t.prefix,"Reset to schema defaults.","warning")}),(g=document.querySelector(`#${t.prefix}-save-params`))==null||g.addEventListener("click",()=>{const $=n();$&&(xs(t,$,d),f(t.prefix,"Current parameters saved to history.","success"))}),(y=document.querySelector(`#${t.prefix}-read-params`))==null||y.addEventListener("click",()=>{o()}),(_=document.querySelector(`#${t.prefix}-load-presets`))==null||_.addEventListener("click",()=>{u()}),Ss(t,n,c,r),Ts(t,o),Es({config:t,getCurrentState:n,buildPreparedTrainingPayload:c,applyEditableRecord:r}),ks(t),_s(t,n,c)}function Is(e,t){let a=null;const n=()=>{const c=C(e.routeId);bs(e.prefix,c),document.querySelectorAll(`#${e.prefix}-history-panel [data-history-close]`).forEach(d=>{d.addEventListener("click",()=>E(e.prefix,"history",!1))}),document.querySelectorAll(`#${e.prefix}-history-panel [data-history-export]`).forEach(d=>{d.addEventListener("click",()=>{fe(`${e.prefix}-history-${We()}.json`,JSON.stringify(C(e.routeId),null,2),"application/json;charset=utf-8"),f(e.prefix,"History exported.","success")})}),document.querySelectorAll(`#${e.prefix}-history-panel [data-history-import]`).forEach(d=>{d.addEventListener("click",()=>{var o;(o=document.querySelector(`#${e.prefix}-history-file-input`))==null||o.click()})}),document.querySelectorAll(`#${e.prefix}-history-panel [data-history-apply]`).forEach(d=>{d.addEventListener("click",()=>{const o=Number(d.dataset.historyApply??"-1"),u=C(e.routeId)[o];u&&(t(u.value,u.gpu_ids,"replace"),E(e.prefix,"history",!1),f(e.prefix,`Applied snapshot: ${u.name||"Unnamed snapshot"}.`,"success"))})}),document.querySelectorAll(`#${e.prefix}-history-panel [data-history-rename]`).forEach(d=>{d.addEventListener("click",()=>{const o=Number(d.dataset.historyRename??"-1"),u=C(e.routeId),m=u[o];if(!m)return;const g=window.prompt("Rename snapshot",m.name||"");g&&(m.name=g.trim(),G(e.routeId,u),n(),f(e.prefix,"Snapshot renamed.","success"))})}),document.querySelectorAll(`#${e.prefix}-history-panel [data-history-delete]`).forEach(d=>{d.addEventListener("click",()=>{const o=Number(d.dataset.historyDelete??"-1"),u=C(e.routeId),m=u[o];m&&window.confirm(`Delete snapshot "${m.name||"Unnamed snapshot"}"?`)&&(u.splice(o,1),G(e.routeId,u),n(),f(e.prefix,"Snapshot deleted.","success"))})})},s=()=>{n(),E(e.prefix,"history",!0)},i=()=>{ys(e.prefix,a??[]),document.querySelectorAll(`#${e.prefix}-presets-panel [data-preset-close]`).forEach(c=>{c.addEventListener("click",()=>E(e.prefix,"presets",!1))}),document.querySelectorAll(`#${e.prefix}-presets-panel [data-preset-apply]`).forEach(c=>{c.addEventListener("click",()=>{const d=Number(c.dataset.presetApply??"-1"),o=a==null?void 0:a[d];if(!o)return;const u=o.data??{};t(u,void 0,"merge"),E(e.prefix,"presets",!1),f(e.prefix,`Applied preset: ${String((o.metadata??{}).name||o.name||"preset")}.`,"success")})})};return{bindHistoryPanel:n,openHistoryPanel:s,openPresetPanel:async()=>{var c;if(!a)try{const d=await Fe();a=vs(e,((c=d.data)==null?void 0:c.presets)??[])}catch(d){f(e.prefix,d instanceof Error?d.message:"Failed to load presets.","error");return}i(),E(e.prefix,"presets",!0)}}}async function Ns(e){var c,d,o,u;const t=$a(e.prefix),[a,n]=await Promise.allSettled([ce(),Ue()]);if(n.status==="fulfilled"){const m=((c=n.value.data)==null?void 0:c.cards)??[],g=(d=n.value.data)==null?void 0:d.xformers;Xa(`${e.prefix}-gpu-selector`,m),p(`${e.prefix}-runtime-title`,`${m.length} GPU entries reachable`),h(`${e.prefix}-runtime-body`,`
        <p>${l(Ge(m))}</p>
        <p>${l(g?`xformers: ${g.installed?"installed":"missing"}, ${g.supported?"supported":"fallback"} (${g.reason})`:"xformers info unavailable")}</p>
      `)}else p(`${e.prefix}-runtime-title`,"GPU runtime request failed"),p(`${e.prefix}-runtime-body`,n.reason instanceof Error?n.reason.message:"Unknown error");if(a.status!=="fulfilled")return p(t.summaryId,`${e.modelLabel} schema request failed`),h(t.sectionsId,`<p>${a.reason instanceof Error?l(a.reason.message):"Unknown error"}</p>`),D(t.previewId,"{}"),x(e.prefix,"Schema unavailable",`The ${e.modelLabel} training bridge could not load the backend schema.`,"error"),null;const s=((o=a.value.data)==null?void 0:o.schemas)??[],i=Xe(s),r=(u=J(i).find(m=>m.name===e.schemaName))==null?void 0:u.name;return r?{domIds:t,createDefaultState:()=>V(i,r)}:(p(t.summaryId,`No ${e.schemaName} schema was returned.`),h(t.sectionsId,`<p>The backend did not expose ${l(e.schemaName)}.</p>`),x(e.prefix,"Schema missing",`The backend did not expose the ${e.schemaName} schema.`,"error"),null)}const Oe={};function Cs(e,t){const a=Ye(t),n=he(`${e}-gpu-selector`);n.length>0&&(a.gpu_ids=n);const s=rt(a);return{payload:s,checks:gs(s)}}function ht(e){return new Set(e.sections.flatMap(t=>t.fields.map(a=>a.path)))}function mt(e,t){const a=ht(e),n={...e.values};for(const[s,i]of Object.entries(t))a.has(s)&&(n[s]=i);return{...e,values:n}}function Rs(e,t){return{...e,values:{...e.values,...Object.fromEntries(Object.entries(t).filter(([a])=>ht(e).has(a)))}}}function Bs(e,t){return t&&t.length>0?t.map(a=>String(a)):Array.isArray(e.gpu_ids)?e.gpu_ids.map(a=>String(a)):[]}function qs(e,t){$s(e.routeId,{time:new Date().toLocaleString(),name:lt(e,t),value:K(t.values),gpu_ids:he(`${e.prefix}-gpu-selector`)})}function Ds(e){const{config:t,createDefaultState:a,mountTrainingState:n}=e,s=ws(t.routeId),i=s!=null&&s.value?mt(a(),ot(s.value)):a();(s==null?void 0:s.gpu_ids)!==void 0&&me(t.prefix,s.gpu_ids),n(i),s!=null&&s.value&&f(t.prefix,"Restored autosaved parameters for this route.","success")}function js(e,t,a,n,s){return i=>{try{const r=a(i),c=Object.fromEntries(Object.entries(r.payload).sort(([d],[o])=>d.localeCompare(o)));D(t.previewId,JSON.stringify(c,null,2)),W(e.prefix,r.checks)}catch(r){D(t.previewId,"{}"),W(e.prefix,{warnings:[],errors:[]},r instanceof Error?r.message:"The current state could not be converted into a launch payload.")}n(i),s==null||s()}}function Os(e,t,a){const n=()=>Oe[e.routeId],s=o=>Cs(e.prefix,o),i=js(e,t,s,o=>qs(e,o),()=>X(e.prefix)),r=o=>{H(o,t,u=>{Oe[e.routeId]=u},i)};return{getCurrentState:n,prepareTrainingPayload:s,onStateChange:i,mountTrainingState:r,applyEditableRecord:(o,u,m="replace")=>{const g=m==="merge"?n()??a():a(),y=ot(o),_=m==="merge"?Rs(g,y):mt(g,y);me(e.prefix,Bs(y,u)),r(_)},restoreAutosave:()=>Ds({config:e,createDefaultState:a,mountTrainingState:r})}}async function Fs(e){const t=await Ns(e);if(!t)return;const a=Os(e,t.domIds,t.createDefaultState),n=Is(e,a.applyEditableRecord);a.restoreAutosave(),As({config:e,createDefaultState:t.createDefaultState,getCurrentState:a.getCurrentState,mountTrainingState:a.mountTrainingState,onStateChange:a.onStateChange,applyEditableRecord:a.applyEditableRecord,buildPreparedTrainingPayload:a.prepareTrainingPayload,bindHistoryPanel:n.bindHistoryPanel,openHistoryPanel:n.openHistoryPanel,openPresetPanel:n.openPresetPanel}),x(e.prefix,`${e.modelLabel} bridge ready`,"You can review the generated payload and submit the current config to /api/run.","success"),E(e.prefix,"history",!1),E(e.prefix,"presets",!1)}const Hs={overview:Ze,about:Ta,settings:qa,tasks:ja,tageditor:Da,tensorboard:Oa,tools:Fa,"schema-bridge":Aa,"sdxl-train":Ba,"flux-train":Ea,"sd3-train":Ia,"dreambooth-train":La,"sd-controlnet-train":Na,"sdxl-controlnet-train":Ca,"flux-controlnet-train":Pa,"sdxl-lllite-train":Ra};function Us(e){const t={overview:q.filter(a=>a.section==="overview"),phase1:q.filter(a=>a.section==="phase1"),reference:q.filter(a=>a.section==="reference")};return`
    <div class="nav-group">
      <p class="nav-heading">Workspace</p>
      ${t.overview.map(a=>te(a.hash,a.label,a.description,e)).join("")}
    </div>
    <div class="nav-group">
      <p class="nav-heading">Phase 1 Pages</p>
      ${t.phase1.map(a=>te(a.hash,a.label,a.description,e)).join("")}
    </div>
    <div class="nav-group">
      <p class="nav-heading">Core Bridge</p>
      ${t.reference.map(a=>te(a.hash,a.label,a.description,e)).join("")}
    </div>
  `}function te(e,t,a,n){return`
    <a class="nav-link ${e===n?"is-active":""}" href="${e}">
      <span>${t}</span>
      <small>${a}</small>
    </a>
  `}async function zs(e){e==="overview"?await Mt():e==="settings"?await Gt():e==="tasks"?await la():e==="tageditor"?await Jt():e==="tools"?await Yt():e==="schema-bridge"?await xa(()=>{}):Ne[e]&&await Fs(Ne[e])}async function Vs(e){Ga();const t=Ma(),a=Hs[t.id]??Ze;e.innerHTML=Sa(t.hash,a());const n=document.querySelector("#side-nav");n&&(n.innerHTML=Us(t.hash)),await zs(t.id)}const gt=document.querySelector("#app");if(!(gt instanceof HTMLElement))throw new Error("App root not found.");const Ws=gt;async function ft(){await Vs(Ws)}window.addEventListener("hashchange",()=>{ft()});ft();
