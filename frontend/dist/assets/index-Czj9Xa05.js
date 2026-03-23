var ut=Object.defineProperty;var ht=(e,a,t)=>a in e?ut(e,a,{enumerable:!0,configurable:!0,writable:!0,value:t}):e[a]=t;var w=(e,a,t)=>ht(e,typeof a!="symbol"?a+"":a,t);(function(){const a=document.createElement("link").relList;if(a&&a.supports&&a.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))n(s);new MutationObserver(s=>{for(const r of s)if(r.type==="childList")for(const i of r.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&n(i)}).observe(document,{childList:!0,subtree:!0});function t(s){const r={};return s.integrity&&(r.integrity=s.integrity),s.referrerPolicy&&(r.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?r.credentials="include":s.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function n(s){if(s.ep)return;s.ep=!0;const r=t(s);fetch(s.href,r)}})();const ie="".replace(/\/$/,"");async function x(e){const a=await fetch(`${ie}${e}`,{headers:{Accept:"application/json"}});if(!a.ok)throw new Error(`${a.status} ${a.statusText}`);return await a.json()}async function A(e,a){const t=await fetch(`${ie}${e}`,{method:"POST",headers:{Accept:"application/json","Content-Type":"application/json"},body:JSON.stringify(a)});if(!t.ok)throw new Error(`${t.status} ${t.statusText}`);return await t.json()}async function gt(e){const a=await fetch(`${ie}${e}`,{headers:{Accept:"application/json"}});if(!a.ok)throw new Error(`${a.status} ${a.statusText}`);return await a.json()}async function mt(){return x("/api/schemas/hashes")}async function oe(){return x("/api/schemas/all")}async function Re(){return x("/api/presets")}async function ft(){return x("/api/config/saved_params")}async function bt(){return x("/api/config/summary")}async function le(){return x("/api/tasks")}async function Be(e){return x(`/api/tasks/terminate/${e}`)}async function qe(){return x("/api/graphic_cards")}async function De(){return gt("/api/tageditor_status")}async function yt(){return x("/api/scripts")}async function vt(e){return A("/api/dataset/analyze",e)}async function kt(){return x("/api/interrogators")}async function U(e){var t;const a=await x(`/api/pick_file?picker_type=${encodeURIComponent(e)}`);if(a.status!=="success"||!((t=a.data)!=null&&t.path))throw new Error(a.message||"File picker did not return a path.");return a.data.path}async function _t(e){return A("/api/interrogate",e)}async function wt(e){return A("/api/captions/cleanup/preview",e)}async function $t(e){return A("/api/captions/cleanup/apply",e)}async function xt(e){return A("/api/captions/backups/create",e)}async function St(e){return A("/api/captions/backups/list",e)}async function Tt(e){return A("/api/captions/backups/restore",e)}async function Lt(e){return A("/api/run",e)}function p(e,a){const t=document.querySelector(`#${e}`);t&&(t.textContent=a)}function h(e,a){const t=document.querySelector(`#${e}`);t&&(t.innerHTML=a)}function D(e,a){const t=document.querySelector(`#${e}`);t&&(t.textContent=a)}const je=[{route:"index.html",title:"SD-reScripts | SD training UI",section:"core",status:"migrate-first",notes:"Landing page and main navigation entry. Good first candidate for source migration."},{route:"lora/index.html",title:"LoRA training index",section:"training",status:"migrate-first",notes:"Top-level training model selector page.",schemaHints:["shared"]},{route:"lora/sdxl.html",title:"SDXL LoRA training",section:"training",status:"migrate-first",notes:"Primary training page currently used most often.",schemaHints:["sdxl-lora","shared"]},{route:"lora/flux.html",title:"Flux LoRA training",section:"training",status:"migrate-first",notes:"Now mirrored by the shared source-side training bridge.",schemaHints:["flux-lora","shared"]},{route:"lora/sd3.html",title:"SD3 training",section:"training",status:"migrate-first",notes:"Now mirrored by the shared source-side training bridge.",schemaHints:["sd3-lora","shared"]},{route:"lora/controlnet.html",title:"SD ControlNet training",section:"training",status:"migrate-first",notes:"Now mirrored by the shared source-side training bridge.",schemaHints:["sd-controlnet","shared"]},{route:"lora/sdxl-controlnet.html",title:"SDXL ControlNet training",section:"training",status:"migrate-first",notes:"Now mirrored by the shared source-side training bridge.",schemaHints:["sdxl-controlnet","shared"]},{route:"lora/sdxl-lllite.html",title:"SDXL LLLite training",section:"training",status:"migrate-first",notes:"Specialized SDXL conditioning route now mirrored by the shared source-side bridge.",schemaHints:["sdxl-controlnet-lllite","shared"]},{route:"lora/flux-controlnet.html",title:"Flux ControlNet training",section:"training",status:"migrate-first",notes:"Now mirrored by the shared source-side training bridge.",schemaHints:["flux-controlnet","shared"]},{route:"lora/basic.html",title:"LoRA basic mode",section:"training",status:"legacy-dist",notes:"Legacy beginner-mode training route.",schemaHints:["lora-basic","shared"]},{route:"lora/master.html",title:"LoRA expert mode",section:"training",status:"legacy-dist",notes:"Legacy expert-mode training route.",schemaHints:["lora-master","shared"]},{route:"lora/params.html",title:"Training parameter reference",section:"training",status:"migrate-first",notes:"Mostly explanatory UI. Lower risk to recreate cleanly."},{route:"lora/tools.html",title:"LoRA tools",section:"tools",status:"migrate-first",notes:"Tool launcher route for merge, resize, interrogate and conversion flows."},{route:"dreambooth/index.html",title:"Dreambooth training",section:"training",status:"migrate-first",notes:"Now mirrored by the shared source-side training bridge for Dreambooth and SDXL full finetune.",schemaHints:["dreambooth","shared"]},{route:"tagger.html",title:"Tagger tool",section:"tools",status:"migrate-first",notes:"Standalone caption/tag generation route that talks to backend APIs.",schemaHints:["tagger"]},{route:"tageditor.html",title:"Tag editor proxy page",section:"tools",status:"migrate-first",notes:"Wrapper page with progress/failure states. Good candidate to reimplement cleanly."},{route:"task.html",title:"Task monitor",section:"system",status:"migrate-first",notes:"Task status page backed by /api/tasks."},{route:"tensorboard.html",title:"TensorBoard proxy page",section:"system",status:"migrate-first",notes:"Wrapper/proxy page. Safer than schema-heavy form routes."},{route:"other/settings.html",title:"Settings page",section:"system",status:"migrate-first",notes:"Static/system page that should be easy to recreate in source form."},{route:"other/about.html",title:"About page",section:"core",status:"migrate-first",notes:"Mostly branding and release notes. Best low-risk migration target."},{route:"404.html",title:"Fallback page",section:"core",status:"legacy-dist",notes:"Can be replaced after the main router is rebuilt."}];function o(e){return String(e).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;")}function W(e){return JSON.parse(JSON.stringify(e))}function Oe(e=new Date){return e.toISOString().replaceAll(":","-").replaceAll(".","-")}function Et(e){if(e.length===0){h("schema-browser","<p>No schemas returned.</p>");return}const a=e.map(t=>{var s;const n=((s=t.schema.split(/\r?\n/).find(r=>r.trim().length>0))==null?void 0:s.trim())||"No preview available.";return`
        <article class="schema-card">
          <div class="schema-head">
            <h3>${o(t.name)}</h3>
            <span class="schema-hash">${o(t.hash.slice(0,8))}</span>
          </div>
          <p>${o(n)}</p>
        </article>
      `}).join("");h("schema-browser",a)}function Pt(e){const a=new Set(je.flatMap(r=>r.schemaHints??[])),t=new Set(e.map(r=>r.name)),n=[...a].filter(r=>t.has(r)).sort(),s=e.map(r=>r.name).filter(r=>!a.has(r)).sort();h("schema-mapped",n.length?n.map(r=>`<span class="coverage-pill">${o(r)}</span>`).join(""):"<p>No mapped schema hints yet.</p>"),h("schema-unmapped",s.length?s.map(r=>`<span class="coverage-pill coverage-pill-muted">${o(r)}</span>`).join(""):"<p>All schemas are represented in the current route hints.</p>")}function At(e){if(e.length===0){h("task-table-container","<p>No tasks currently tracked.</p>");return}const a=e.map(t=>`
        <tr>
          <td><code>${o(t.id??t.task_id??"unknown")}</code></td>
          <td>${o(t.status??"unknown")}</td>
          <td>
            <button class="action-button action-button-small" data-task-terminate="${o(t.id??t.task_id??"")}" type="button">
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
        <tbody>${a}</tbody>
      </table>
    `)}function It(e){if(e.length===0){h("tools-browser","<p>No scripts returned.</p>");return}const a=e.map(t=>`
        <article class="tool-card">
          <div class="tool-card-head">
            <h3>${o(t.name)}</h3>
            <span class="coverage-pill ${t.category==="networks"?"":"coverage-pill-muted"}">${o(t.category)}</span>
          </div>
          <p>${t.positional_args.length>0?`Positional args: ${t.positional_args.map(n=>`<code>${o(n)}</code>`).join(", ")}`:"No positional args required."}</p>
        </article>
      `).join("");h("tools-browser",a)}function Ct(e){const a=[{label:"Images",value:e.summary.image_count},{label:"Effective images",value:e.summary.effective_image_count},{label:"Caption coverage",value:fe(e.summary.caption_coverage)},{label:"Unique tags",value:e.summary.unique_tag_count},{label:"Caption files",value:e.summary.caption_file_count},{label:"Avg tags / caption",value:e.summary.average_tags_per_caption.toFixed(2)}],t=e.warnings.length?`
      <article class="dataset-analysis-block dataset-analysis-warning">
        <p class="panel-kicker">warnings</p>
        <ul class="dataset-analysis-list-plain">
          ${e.warnings.map(s=>`<li>${o(s)}</li>`).join("")}
        </ul>
      </article>
    `:"",n=e.folders.length?e.folders.map(s=>`
            <article class="dataset-analysis-block">
              <div class="tool-card-head">
                <h3>${o(s.name)}</h3>
                <span class="coverage-pill ${s.caption_coverage>=1?"":"coverage-pill-muted"}">
                  ${fe(s.caption_coverage)}
                </span>
              </div>
              <p><code>${o(s.path)}</code></p>
              <p>
                Images: <strong>${s.image_count}</strong>
                · Effective: <strong>${s.effective_image_count}</strong>
                · Repeats: <strong>${s.repeats??1}</strong>
              </p>
              <p>
                Missing captions: <strong>${s.missing_caption_count}</strong>
                · Orphan captions: <strong>${s.orphan_caption_count}</strong>
                · Empty captions: <strong>${s.empty_caption_count}</strong>
              </p>
            </article>
          `).join(""):"<p>No dataset folder summary returned.</p>";h("dataset-analysis-results",`
      ${t}
      <section class="dataset-analysis-grid">
        ${a.map(s=>`
              <article class="dataset-analysis-stat">
                <span class="metric-label">${o(s.label)}</span>
                <strong class="dataset-analysis-stat-value">${o(s.value)}</strong>
              </article>
            `).join("")}
      </section>
      <section class="dataset-analysis-columns">
        <article class="dataset-analysis-block">
          <p class="panel-kicker">scan</p>
          <h3>Dataset summary</h3>
          <p><code>${o(e.root_path)}</code></p>
          <p>Mode: <code>${o(e.scan_mode)}</code></p>
          <p>Caption extension: <code>${o(e.caption_extension)}</code></p>
          <p>Dataset folders: <strong>${e.summary.dataset_folder_count}</strong></p>
          <p>Images without captions: <strong>${e.summary.images_without_caption_count}</strong></p>
          <p>Broken images: <strong>${e.summary.broken_image_count}</strong></p>
        </article>
        <article class="dataset-analysis-block">
          <p class="panel-kicker">tags</p>
          <h3>Top tags</h3>
          ${Fe(e.top_tags,"No caption tags found yet.")}
        </article>
        <article class="dataset-analysis-block">
          <p class="panel-kicker">images</p>
          <h3>Top resolutions</h3>
          ${G(e.top_resolutions,"No resolution data collected.")}
        </article>
        <article class="dataset-analysis-block">
          <p class="panel-kicker">mix</p>
          <h3>Orientation + formats</h3>
          <div>${G(e.orientation_counts,"No orientation data.")}</div>
          <div class="dataset-analysis-sublist">${G(e.image_extensions,"No image extension data.")}</div>
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
            ${P(e.samples.images_without_caption,"No missing-caption samples.")}
          </div>
          <div class="dataset-analysis-sublist">
            <h4>Orphan captions</h4>
            ${P(e.samples.orphan_captions,"No orphan-caption samples.")}
          </div>
          <div class="dataset-analysis-sublist">
            <h4>Broken images</h4>
            ${P(e.samples.broken_images,"No broken-image samples.")}
          </div>
        </article>
      </section>
    `)}function Nt(e,a="caption-cleanup-results"){const t=[{label:"Caption files",value:e.summary.file_count},{label:"Changed",value:e.summary.changed_file_count},{label:"Unchanged",value:e.summary.unchanged_file_count},{label:"Tag instances removed",value:e.summary.removed_tag_instances},{label:"Tag instances added",value:e.summary.added_tag_instances},{label:"Empty results",value:e.summary.empty_result_count}],n=e.warnings.length?`
      <article class="dataset-analysis-block dataset-analysis-warning">
        <p class="panel-kicker">warnings</p>
        <ul class="dataset-analysis-list-plain">
          ${e.warnings.map(r=>`<li>${o(r)}</li>`).join("")}
        </ul>
      </article>
    `:"",s=e.samples.length?e.samples.map(r=>`
            <article class="dataset-analysis-block">
              <div class="tool-card-head">
                <h3>${o(r.path)}</h3>
                <span class="coverage-pill ${r.before!==r.after?"":"coverage-pill-muted"}">
                  ${r.before_count} -> ${r.after_count}
                </span>
              </div>
              <div class="dataset-cleanup-diff">
                <div>
                  <p class="panel-kicker">before</p>
                  <pre>${o(r.before||"(empty)")}</pre>
                </div>
                <div>
                  <p class="panel-kicker">after</p>
                  <pre>${o(r.after||"(empty)")}</pre>
                </div>
              </div>
              <div class="dataset-analysis-sublist">
                <h4>Removed tags</h4>
                ${P(r.removed_tags,"No explicit tag removals in sample.")}
              </div>
              <div class="dataset-analysis-sublist">
                <h4>Added tags</h4>
                ${P(r.added_tags,"No explicit tag additions in sample.")}
              </div>
            </article>
          `).join(""):"<p>No sample caption changes were captured.</p>";h(a,`
      ${n}
      <section class="dataset-analysis-grid">
        ${t.map(r=>`
              <article class="dataset-analysis-stat">
                <span class="metric-label">${o(r.label)}</span>
                <strong class="dataset-analysis-stat-value">${o(r.value)}</strong>
              </article>
            `).join("")}
      </section>
      <section class="dataset-analysis-columns">
        <article class="dataset-analysis-block">
          <p class="panel-kicker">${o(e.mode)}</p>
          <h3>Cleanup scope</h3>
          <p><code>${o(e.root_path)}</code></p>
          <p>Caption extension: <code>${o(e.caption_extension)}</code></p>
          <p>Recursive scan: <strong>${e.recursive?"yes":"no"}</strong></p>
          <p>Whitespace normalize: <strong>${e.options.collapse_whitespace?"yes":"no"}</strong></p>
          <p>Replace underscore: <strong>${e.options.replace_underscore?"yes":"no"}</strong></p>
          ${e.backup?`<p>Auto backup: <code>${o(e.backup.archive_name)}</code></p>`:""}
        </article>
        <article class="dataset-analysis-block">
          <p class="panel-kicker">rules</p>
          <h3>Rule summary</h3>
          ${Fe([e.options.dedupe_tags?{name:"dedupe tags",count:1}:null,e.options.sort_tags?{name:"sort tags",count:1}:null,e.options.use_regex?{name:"regex replace",count:1}:null].filter(Boolean),"No boolean cleanup switches enabled.")}
          <div class="dataset-analysis-sublist">
            <h4>Remove tags</h4>
            ${P(e.options.remove_tags,"No exact tags configured for removal.")}
          </div>
          <div class="dataset-analysis-sublist">
            <h4>Prepend tags</h4>
            ${P(e.options.prepend_tags,"No prepend tags configured.")}
          </div>
          <div class="dataset-analysis-sublist">
            <h4>Append tags</h4>
            ${P(e.options.append_tags,"No append tags configured.")}
          </div>
        </article>
        <article class="dataset-analysis-block">
          <p class="panel-kicker">replace</p>
          <h3>Search and replace</h3>
          <p>Search: <code>${o(e.options.search_text||"(none)")}</code></p>
          <p>Replace: <code>${o(e.options.replace_text||"(empty)")}</code></p>
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
    `)}function Rt(e,a,t="caption-backup-results"){if(!e.length){h(t,`
        <article class="dataset-analysis-block">
          <p class="panel-kicker">snapshots</p>
          <h3>No caption snapshots found</h3>
          <p>Create the first backup for this folder to get a restore point before cleanup or tagging.</p>
        </article>
      `);return}const n=e.map(s=>`
        <article class="dataset-analysis-block ${s.archive_name===a?"dataset-analysis-selected":""}">
          <div class="tool-card-head">
            <h3>${o(s.snapshot_name)}</h3>
            <span class="coverage-pill ${s.archive_name===a?"":"coverage-pill-muted"}">
              ${o(s.archive_name)}
            </span>
          </div>
          <p><code>${o(s.source_root)}</code></p>
          <p>Created: <strong>${o(s.created_at||"unknown")}</strong></p>
          <p>Caption files: <strong>${s.file_count}</strong> · Archive size: <strong>${qt(s.archive_size)}</strong></p>
          <p>Extension: <code>${o(s.caption_extension||".txt")}</code> · Recursive: <strong>${s.recursive?"yes":"no"}</strong></p>
        </article>
      `).join("");h(t,`<div class="dataset-analysis-stack">${n}</div>`)}function Bt(e,a="caption-backup-results"){const t=e.warnings.length?`
      <article class="dataset-analysis-block dataset-analysis-warning">
        <p class="panel-kicker">warnings</p>
        <ul class="dataset-analysis-list-plain">
          ${e.warnings.map(n=>`<li>${o(n)}</li>`).join("")}
        </ul>
      </article>
    `:"";h(a,`
      ${t}
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
          <h3>${o(e.snapshot_name)}</h3>
          <p><code>${o(e.source_root)}</code></p>
          <p>Archive: <code>${o(e.archive_name)}</code></p>
        </article>
        <article class="dataset-analysis-block">
          <p class="panel-kicker">safety</p>
          <h3>Pre-restore backup</h3>
          ${e.pre_restore_backup?`<p>Created <code>${o(e.pre_restore_backup.archive_name)}</code> before restore.</p>`:"<p>Pre-restore backup was not created for this restore operation.</p>"}
        </article>
      </section>
    `)}function Fe(e,a){return e.length?`
    <div class="coverage-list">
      ${e.map(t=>`<span class="coverage-pill">${o(t.name)} <strong>${t.count}</strong></span>`).join("")}
    </div>
  `:`<p>${o(a)}</p>`}function G(e,a){return e.length?`
    <ul class="dataset-analysis-list-plain">
      ${e.map(t=>`<li><code>${o(t.name)}</code> <strong>${t.count}</strong></li>`).join("")}
    </ul>
  `:`<p>${o(a)}</p>`}function P(e,a){return e.length?`
    <ul class="dataset-analysis-list-plain">
      ${e.map(t=>`<li><code>${o(t)}</code></li>`).join("")}
    </ul>
  `:`<p>${o(a)}</p>`}function fe(e){return`${(e*100).toFixed(1)}%`}function qt(e){return e<1024?`${e} B`:e<1024**2?`${(e/1024).toFixed(1)} KB`:e<1024**3?`${(e/1024**2).toFixed(1)} MB`:`${(e/1024**3).toFixed(2)} GB`}function Ue(e){return e.length===0?"No cards reported yet.":e.map((a,t)=>`GPU ${a.index??a.id??t}: ${a.name}`).join(" | ")}function Dt(e){if(e.length===0)return"No tasks currently tracked.";const a=e.filter(t=>t.status&&!["FINISHED","TERMINATED","FAILED"].includes(String(t.status))).length;return`${e.length} tracked, ${a} active`}function jt(e){var t;const a=(t=e.detail)==null?void 0:t.trim();return a?`${e.status} - ${a}`:e.status}async function Ot(){var c,d,l,u,g,m;const e=await Promise.allSettled([mt(),Re(),le(),qe(),De(),oe()]),[a,t,n,s,r,i]=e;if(a.status==="fulfilled"){const b=((c=a.value.data)==null?void 0:c.schemas)??[];p("diag-schemas-title",`${b.length} schema hashes loaded`),p("diag-schemas-detail",b.slice(0,4).map(_=>_.name).join(", ")||"No schema names returned.")}else p("diag-schemas-title","Schema hash request failed"),p("diag-schemas-detail",a.reason instanceof Error?a.reason.message:"Unknown error");if(t.status==="fulfilled"){const b=((d=t.value.data)==null?void 0:d.presets)??[];p("diag-presets-title",`${b.length} presets loaded`),p("diag-presets-detail","Source migration can reuse preset grouping later.")}else p("diag-presets-title","Preset request failed"),p("diag-presets-detail",t.reason instanceof Error?t.reason.message:"Unknown error");if(n.status==="fulfilled"){const b=((l=n.value.data)==null?void 0:l.tasks)??[];p("diag-tasks-title","Task manager reachable"),p("diag-tasks-detail",Dt(b))}else p("diag-tasks-title","Task request failed"),p("diag-tasks-detail",n.reason instanceof Error?n.reason.message:"Unknown error");if(s.status==="fulfilled"){const b=((u=s.value.data)==null?void 0:u.cards)??[],_=(g=s.value.data)==null?void 0:g.xformers,$=_?`xformers: ${_.installed?"installed":"missing"}, ${_.supported?"supported":"fallback"}`:"xformers info unavailable";p("diag-gpu-title",`${b.length} GPU entries reachable`),p("diag-gpu-detail",`${Ue(b)} | ${$}`)}else p("diag-gpu-title","GPU request failed"),p("diag-gpu-detail",s.reason instanceof Error?s.reason.message:"Unknown error");if(r.status==="fulfilled"?(p("diag-tageditor-title","Tag editor status reachable"),p("diag-tageditor-detail",jt(r.value))):(p("diag-tageditor-title","Tag editor status request failed"),p("diag-tageditor-detail",r.reason instanceof Error?r.reason.message:"Unknown error")),i.status==="fulfilled"){const b=((m=i.value.data)==null?void 0:m.schemas)??[];Et(b),Pt(b)}else h("schema-browser",`<p>${i.reason instanceof Error?i.reason.message:"Schema inventory request failed."}</p>`)}async function Ft(){const[e,a]=await Promise.allSettled([bt(),ft()]);if(e.status==="fulfilled"){const t=e.value.data;p("settings-summary-title",`${(t==null?void 0:t.saved_param_count)??0} remembered param groups`),h("settings-summary-body",`
        <p><strong>Config file:</strong> <code>${o((t==null?void 0:t.config_path)??"unknown")}</code></p>
        <p><strong>Last path:</strong> <code>${o((t==null?void 0:t.last_path)||"(empty)")}</code></p>
        <p><strong>Saved keys:</strong> ${((t==null?void 0:t.saved_param_keys)??[]).map(n=>`<code>${o(n)}</code>`).join(", ")||"none"}</p>
      `)}else p("settings-summary-title","Config summary request failed"),p("settings-summary-body",e.reason instanceof Error?e.reason.message:"Unknown error");if(a.status==="fulfilled"){const t=a.value.data??{},n=Object.keys(t);p("settings-params-title",`${n.length} saved param entries`),h("settings-params-body",n.length?`<div class="coverage-list">${n.map(s=>`<span class="coverage-pill coverage-pill-muted">${o(s)}</span>`).join("")}</div>`:"<p>No saved params returned.</p>")}else p("settings-params-title","Saved params request failed"),p("settings-params-body",a.reason instanceof Error?a.reason.message:"Unknown error")}const Ut="".replace(/\/$/,""),Ht=Ut||"";function T(e){return/^https?:\/\//.test(e)?e:(e.startsWith("/")||(e=`/${e}`),`${Ht}${e}`)}async function zt(){try{const e=await De();p("tag-editor-status-title",`Current status: ${e.status}`),h("tag-editor-status-body",`
        <p>${o(e.detail||"No extra detail returned.")}</p>
        <p><a class="text-link" href="${T("/tageditor.html")}" target="_blank" rel="noreferrer">Open current shipped wrapper page</a></p>
      `)}catch(e){p("tag-editor-status-title","Tag editor status request failed"),p("tag-editor-status-body",e instanceof Error?e.message:"Unknown error")}}async function Vt(){var e;Mt(),await Wt(),Xt(),Gt();try{const t=((e=(await yt()).data)==null?void 0:e.scripts)??[];p("tools-summary-title",`${t.length} launcher scripts available`),h("tools-summary-body",`
        <p>Categories: ${[...new Set(t.map(n=>n.category))].map(n=>`<code>${o(n)}</code>`).join(", ")}</p>
        <p>The tools workspace now includes dataset analysis, batch auto-tagging, caption cleanup, and caption restore snapshots, with more curated high-frequency flows still planned.</p>
      `),It(t)}catch(a){p("tools-summary-title","Script inventory request failed"),p("tools-summary-body",a instanceof Error?a.message:"Unknown error"),h("tools-browser","<p>Tool inventory failed to load.</p>")}}function Mt(){const e=Kt();e&&(e.browseButton.addEventListener("click",async()=>{p("dataset-analysis-status","Opening folder picker...");try{e.pathInput.value=await U("folder"),p("dataset-analysis-status","Folder selected. Ready to analyze.")}catch(a){p("dataset-analysis-status",a instanceof Error?a.message:"Folder picker failed.")}}),e.runButton.addEventListener("click",()=>{be(e)}),e.pathInput.addEventListener("keydown",a=>{a.key==="Enter"&&(a.preventDefault(),be(e))}))}async function Wt(){var a;const e=Jt();if(e){e.browseButton.addEventListener("click",async()=>{p("batch-tagger-status","Opening folder picker...");try{e.pathInput.value=await U("folder"),p("batch-tagger-status","Folder selected. Ready to launch batch tagging.")}catch(t){p("batch-tagger-status",t instanceof Error?t.message:"Folder picker failed.")}}),e.runButton.addEventListener("click",()=>{ye(e)}),e.pathInput.addEventListener("keydown",t=>{t.key==="Enter"&&(t.preventDefault(),ye(e))});try{const t=await kt(),n=((a=t.data)==null?void 0:a.interrogators)??[];if(!n.length)throw new Error("No interrogator models returned.");e.modelSelect.innerHTML=n.map(s=>{var c;const r=s.is_default||s.name===((c=t.data)==null?void 0:c.default)?" selected":"",i=s.kind==="cl"?"CL":"WD";return`<option value="${o(s.name)}"${r}>${o(s.name)} (${i})</option>`}).join(""),p("batch-tagger-status",`Loaded ${n.length} interrogator models.`)}catch(t){e.modelSelect.innerHTML='<option value="wd14-convnextv2-v2">wd14-convnextv2-v2 (WD)</option>',p("batch-tagger-status",t instanceof Error?t.message:"Failed to load interrogator inventory."),h("batch-tagger-results",`<article class="dataset-analysis-block dataset-analysis-warning"><p>${o(t instanceof Error?t.message:"Failed to load interrogator inventory.")}</p></article>`)}}}function Xt(){const e=Yt();e&&(e.browseButton.addEventListener("click",async()=>{p("caption-cleanup-status","Opening folder picker...");try{e.pathInput.value=await U("folder"),p("caption-cleanup-status","Folder selected. Ready to preview cleanup.")}catch(a){p("caption-cleanup-status",a instanceof Error?a.message:"Folder picker failed.")}}),e.previewButton.addEventListener("click",()=>{K(e,"preview")}),e.applyButton.addEventListener("click",()=>{K(e,"apply")}),e.pathInput.addEventListener("keydown",a=>{a.key==="Enter"&&(a.preventDefault(),K(e,"preview"))}))}function Gt(){const e=Zt();e&&(e.browseButton.addEventListener("click",async()=>{p("caption-backup-status","Opening folder picker...");try{e.pathInput.value=await U("folder"),p("caption-backup-status","Folder selected. Refreshing snapshots..."),await O(e)}catch(a){p("caption-backup-status",a instanceof Error?a.message:"Folder picker failed.")}}),e.refreshButton.addEventListener("click",()=>{O(e)}),e.createButton.addEventListener("click",()=>{Qt(e)}),e.restoreButton.addEventListener("click",()=>{ea(e)}),e.selectInput.addEventListener("change",()=>{O(e,e.selectInput.value||null)}))}function Kt(){const e=document.querySelector("#dataset-analysis-path"),a=document.querySelector("#dataset-analysis-caption-extension"),t=document.querySelector("#dataset-analysis-top-tags"),n=document.querySelector("#dataset-analysis-sample-limit"),s=document.querySelector("#dataset-analysis-pick"),r=document.querySelector("#dataset-analysis-run");return!e||!a||!t||!n||!s||!r?null:{pathInput:e,captionExtensionInput:a,topTagsInput:t,sampleLimitInput:n,browseButton:s,runButton:r}}function Jt(){const e=document.querySelector("#batch-tagger-path"),a=document.querySelector("#batch-tagger-model"),t=document.querySelector("#batch-tagger-threshold"),n=document.querySelector("#batch-tagger-character-threshold"),s=document.querySelector("#batch-tagger-conflict"),r=document.querySelector("#batch-tagger-additional-tags"),i=document.querySelector("#batch-tagger-backup-name"),c=document.querySelector("#batch-tagger-exclude-tags"),d=document.querySelector("#batch-tagger-recursive"),l=document.querySelector("#batch-tagger-replace-underscore"),u=document.querySelector("#batch-tagger-escape-tag"),g=document.querySelector("#batch-tagger-add-rating-tag"),m=document.querySelector("#batch-tagger-add-model-tag"),b=document.querySelector("#batch-tagger-auto-backup"),_=document.querySelector("#batch-tagger-pick"),$=document.querySelector("#batch-tagger-run");return!e||!a||!t||!n||!s||!r||!i||!c||!d||!l||!u||!g||!m||!b||!_||!$?null:{pathInput:e,modelSelect:a,thresholdInput:t,characterThresholdInput:n,conflictSelect:s,additionalTagsInput:r,backupNameInput:i,excludeTagsInput:c,recursiveInput:d,replaceUnderscoreInput:l,escapeTagInput:u,addRatingTagInput:g,addModelTagInput:m,autoBackupInput:b,browseButton:_,runButton:$}}function Yt(){const e=document.querySelector("#caption-cleanup-path"),a=document.querySelector("#caption-cleanup-extension"),t=document.querySelector("#caption-cleanup-remove-tags"),n=document.querySelector("#caption-cleanup-prepend-tags"),s=document.querySelector("#caption-cleanup-append-tags"),r=document.querySelector("#caption-cleanup-search-text"),i=document.querySelector("#caption-cleanup-replace-text"),c=document.querySelector("#caption-cleanup-backup-name"),d=document.querySelector("#caption-cleanup-sample-limit"),l=document.querySelector("#caption-cleanup-recursive"),u=document.querySelector("#caption-cleanup-collapse-whitespace"),g=document.querySelector("#caption-cleanup-replace-underscore"),m=document.querySelector("#caption-cleanup-dedupe-tags"),b=document.querySelector("#caption-cleanup-sort-tags"),_=document.querySelector("#caption-cleanup-use-regex"),$=document.querySelector("#caption-cleanup-auto-backup"),j=document.querySelector("#caption-cleanup-pick"),ge=document.querySelector("#caption-cleanup-preview"),me=document.querySelector("#caption-cleanup-apply");return!e||!a||!t||!n||!s||!r||!i||!c||!d||!l||!u||!g||!m||!b||!_||!$||!j||!ge||!me?null:{pathInput:e,extensionInput:a,removeTagsInput:t,prependTagsInput:n,appendTagsInput:s,searchTextInput:r,replaceTextInput:i,backupNameInput:c,sampleLimitInput:d,recursiveInput:l,collapseWhitespaceInput:u,replaceUnderscoreInput:g,dedupeTagsInput:m,sortTagsInput:b,useRegexInput:_,autoBackupInput:$,browseButton:j,previewButton:ge,applyButton:me}}function Zt(){const e=document.querySelector("#caption-backup-path"),a=document.querySelector("#caption-backup-extension"),t=document.querySelector("#caption-backup-name"),n=document.querySelector("#caption-backup-select"),s=document.querySelector("#caption-backup-recursive"),r=document.querySelector("#caption-backup-pre-restore"),i=document.querySelector("#caption-backup-pick"),c=document.querySelector("#caption-backup-create"),d=document.querySelector("#caption-backup-refresh"),l=document.querySelector("#caption-backup-restore");return!e||!a||!t||!n||!s||!r||!i||!c||!d||!l?null:{pathInput:e,extensionInput:a,nameInput:t,selectInput:n,recursiveInput:s,preRestoreInput:r,browseButton:i,createButton:c,refreshButton:d,restoreButton:l}}async function be(e){const a=e.pathInput.value.trim();if(!a){p("dataset-analysis-status","Pick a dataset folder first."),h("dataset-analysis-results",'<p class="dataset-analysis-empty">No folder selected yet.</p>');return}e.browseButton.disabled=!0,e.runButton.disabled=!0,p("dataset-analysis-status","Analyzing dataset..."),h("dataset-analysis-results",'<p class="dataset-analysis-empty">Scanning images, captions, and tags...</p>');try{const t=await vt({path:a,caption_extension:e.captionExtensionInput.value.trim()||".txt",top_tags:Q(e.topTagsInput.value,40),sample_limit:Q(e.sampleLimitInput.value,8)});if(t.status!=="success"||!t.data)throw new Error(t.message||"Dataset analysis returned no data.");p("dataset-analysis-status",`Scanned ${t.data.summary.image_count} images across ${t.data.summary.dataset_folder_count} dataset folder(s).`),Ct(t.data)}catch(t){p("dataset-analysis-status",t instanceof Error?t.message:"Dataset analysis failed."),h("dataset-analysis-results",`<article class="dataset-analysis-block dataset-analysis-warning"><p>${o(t instanceof Error?t.message:"Dataset analysis failed.")}</p></article>`)}finally{e.browseButton.disabled=!1,e.runButton.disabled=!1}}async function ye(e){var t,n,s;const a=e.pathInput.value.trim();if(!a){p("batch-tagger-status","Pick an image folder first."),h("batch-tagger-results",'<p class="dataset-analysis-empty">No image folder selected yet.</p>');return}e.browseButton.disabled=!0,e.runButton.disabled=!0,p("batch-tagger-status","Starting batch tagging..."),h("batch-tagger-results",'<p class="dataset-analysis-empty">Submitting interrogator job to the backend...</p>');try{const r=ve(e.thresholdInput.value,.35,0,1),i=ve(e.characterThresholdInput.value,.6,0,1),c=await _t({path:a,interrogator_model:e.modelSelect.value,threshold:r,character_threshold:i,batch_output_action_on_conflict:e.conflictSelect.value,create_backup_before_write:e.autoBackupInput.checked,backup_snapshot_name:e.backupNameInput.value.trim(),additional_tags:e.additionalTagsInput.value.trim(),exclude_tags:e.excludeTagsInput.value.trim(),batch_input_recursive:e.recursiveInput.checked,replace_underscore:e.replaceUnderscoreInput.checked,escape_tag:e.escapeTagInput.checked,add_rating_tag:e.addRatingTagInput.checked,add_model_tag:e.addModelTagInput.checked});if(c.status!=="success")throw new Error(c.message||"Batch tagging failed to start.");p("batch-tagger-status",c.message||"Batch tagging started."),h("batch-tagger-results",`
        <article class="dataset-analysis-block">
          <p class="panel-kicker">launched</p>
          <h3>Batch tagger job submitted</h3>
          <p><code>${o(a)}</code></p>
          <p>Model: <code>${o(e.modelSelect.value)}</code></p>
          <p>
            Threshold: <strong>${o(String(r))}</strong>
            · Character threshold: <strong>${o(String(i))}</strong>
            · Conflict mode: <strong>${o(e.conflictSelect.value)}</strong>
          </p>
          <p>
            Recursive: <strong>${e.recursiveInput.checked?"yes":"no"}</strong>
            · Replace underscore: <strong>${e.replaceUnderscoreInput.checked?"yes":"no"}</strong>
            · Escape tags: <strong>${e.escapeTagInput.checked?"yes":"no"}</strong>
          </p>
          <p>
            Auto backup: <strong>${e.autoBackupInput.checked?"yes":"no"}</strong>
            ${(t=c.data)!=null&&t.backup?`· Snapshot: <code>${o(c.data.backup.archive_name)}</code>`:""}
          </p>
          ${(s=(n=c.data)==null?void 0:n.warnings)!=null&&s.length?`<p>${o(c.data.warnings.join(" "))}</p>`:""}
          <p>The backend runs this in the background. Watch the console output and inspect generated <code>.txt</code> files in the dataset folder.</p>
        </article>
      `)}catch(r){p("batch-tagger-status",r instanceof Error?r.message:"Batch tagging failed."),h("batch-tagger-results",`<article class="dataset-analysis-block dataset-analysis-warning"><p>${o(r instanceof Error?r.message:"Batch tagging failed.")}</p></article>`)}finally{e.browseButton.disabled=!1,e.runButton.disabled=!1}}async function K(e,a){const t=e.pathInput.value.trim();if(!t){p("caption-cleanup-status","Pick a caption folder first."),h("caption-cleanup-results",'<p class="dataset-analysis-empty">No caption folder selected yet.</p>');return}const n={path:t,caption_extension:e.extensionInput.value.trim()||".txt",recursive:e.recursiveInput.checked,collapse_whitespace:e.collapseWhitespaceInput.checked,replace_underscore:e.replaceUnderscoreInput.checked,dedupe_tags:e.dedupeTagsInput.checked,sort_tags:e.sortTagsInput.checked,remove_tags:e.removeTagsInput.value.trim(),prepend_tags:e.prependTagsInput.value.trim(),append_tags:e.appendTagsInput.value.trim(),search_text:e.searchTextInput.value,replace_text:e.replaceTextInput.value,use_regex:e.useRegexInput.checked,create_backup_before_apply:e.autoBackupInput.checked,backup_snapshot_name:e.backupNameInput.value.trim(),sample_limit:Q(e.sampleLimitInput.value,8)};e.browseButton.disabled=!0,e.previewButton.disabled=!0,e.applyButton.disabled=!0,p("caption-cleanup-status",a==="preview"?"Previewing caption cleanup...":"Applying caption cleanup..."),h("caption-cleanup-results",`<p class="dataset-analysis-empty">${a==="preview"?"Scanning caption files and building sample diffs...":"Writing cleaned captions back to disk..."}</p>`);try{const s=a==="preview"?await wt(n):await $t(n);if(s.status!=="success"||!s.data)throw new Error(s.message||`Caption cleanup ${a} failed.`);p("caption-cleanup-status",s.message||(a==="preview"?`Previewed ${s.data.summary.changed_file_count} caption file changes.`:`Applied cleanup to ${s.data.summary.changed_file_count} caption files.`)),Nt(s.data)}catch(s){p("caption-cleanup-status",s instanceof Error?s.message:"Caption cleanup failed."),h("caption-cleanup-results",`<article class="dataset-analysis-block dataset-analysis-warning"><p>${o(s instanceof Error?s.message:"Caption cleanup failed.")}</p></article>`)}finally{e.browseButton.disabled=!1,e.previewButton.disabled=!1,e.applyButton.disabled=!1}}async function O(e,a,t=!0){var s,r;const n=e.pathInput.value.trim();if(!n){p("caption-backup-status","Pick a caption folder first."),h("caption-backup-results",'<p class="dataset-analysis-empty">No caption folder selected yet.</p>'),e.selectInput.innerHTML='<option value="">Refresh snapshots for this folder</option>';return}e.browseButton.disabled=!0,e.createButton.disabled=!0,e.refreshButton.disabled=!0,e.restoreButton.disabled=!0,p("caption-backup-status","Loading caption snapshots...");try{const c=((s=(await St({path:n})).data)==null?void 0:s.backups)??[],d=e.selectInput.value||(((r=c[0])==null?void 0:r.archive_name)??""),l=a??d;e.selectInput.innerHTML=c.length?c.map(u=>{const g=u.archive_name===l?" selected":"";return`<option value="${o(u.archive_name)}"${g}>${o(u.snapshot_name)} · ${o(u.archive_name)}</option>`}).join(""):'<option value="">No snapshots for this folder yet</option>',c.length&&l&&(e.selectInput.value=l),p("caption-backup-status",c.length?`Loaded ${c.length} caption snapshots.`:"No caption snapshots found for this folder."),t&&Rt(c,c.length?l:null)}catch(i){p("caption-backup-status",i instanceof Error?i.message:"Failed to load caption snapshots."),h("caption-backup-results",`<article class="dataset-analysis-block dataset-analysis-warning"><p>${o(i instanceof Error?i.message:"Failed to load caption snapshots.")}</p></article>`)}finally{e.browseButton.disabled=!1,e.createButton.disabled=!1,e.refreshButton.disabled=!1,e.restoreButton.disabled=!1}}async function Qt(e){const a=e.pathInput.value.trim();if(!a){p("caption-backup-status","Pick a caption folder first."),h("caption-backup-results",'<p class="dataset-analysis-empty">No caption folder selected yet.</p>');return}e.browseButton.disabled=!0,e.createButton.disabled=!0,e.refreshButton.disabled=!0,e.restoreButton.disabled=!0,p("caption-backup-status","Creating caption snapshot...");try{const t=await xt({path:a,caption_extension:e.extensionInput.value.trim()||".txt",recursive:e.recursiveInput.checked,snapshot_name:e.nameInput.value.trim()});if(t.status!=="success"||!t.data)throw new Error(t.message||"Caption snapshot creation failed.");p("caption-backup-status",t.message||`Created ${t.data.archive_name}`),e.nameInput.value="",await O(e,t.data.archive_name)}catch(t){p("caption-backup-status",t instanceof Error?t.message:"Caption snapshot creation failed."),h("caption-backup-results",`<article class="dataset-analysis-block dataset-analysis-warning"><p>${o(t instanceof Error?t.message:"Caption snapshot creation failed.")}</p></article>`)}finally{e.browseButton.disabled=!1,e.createButton.disabled=!1,e.refreshButton.disabled=!1,e.restoreButton.disabled=!1}}async function ea(e){const a=e.pathInput.value.trim(),t=e.selectInput.value;if(!a){p("caption-backup-status","Pick a caption folder first."),h("caption-backup-results",'<p class="dataset-analysis-empty">No caption folder selected yet.</p>');return}if(!t){p("caption-backup-status","Select a snapshot to restore.");return}if(window.confirm(`Restore caption snapshot ${t} into this folder?

This overwrites matching caption files from the snapshot.`)){e.browseButton.disabled=!0,e.createButton.disabled=!0,e.refreshButton.disabled=!0,e.restoreButton.disabled=!0,p("caption-backup-status","Restoring caption snapshot..."),h("caption-backup-results",'<p class="dataset-analysis-empty">Writing snapshot files back to the folder...</p>');try{const s=await Tt({path:a,archive_name:t,make_restore_backup:e.preRestoreInput.checked});if(s.status!=="success"||!s.data)throw new Error(s.message||"Caption snapshot restore failed.");p("caption-backup-status",s.message||`Restored ${s.data.restored_file_count} caption files.`),Bt(s.data),await O(e,t,!1)}catch(s){p("caption-backup-status",s instanceof Error?s.message:"Caption snapshot restore failed."),h("caption-backup-results",`<article class="dataset-analysis-block dataset-analysis-warning"><p>${o(s instanceof Error?s.message:"Caption snapshot restore failed.")}</p></article>`)}finally{e.browseButton.disabled=!1,e.createButton.disabled=!1,e.refreshButton.disabled=!1,e.restoreButton.disabled=!1}}}function Q(e,a){const t=Number.parseInt(e,10);return Number.isNaN(t)||t<1?a:t}function ve(e,a,t,n){const s=Number.parseFloat(e);return Number.isNaN(s)?a:Math.min(Math.max(s,t),n)}async function ee(){var e;try{const a=await le();At(((e=a.data)==null?void 0:e.tasks)??[]),document.querySelectorAll("[data-task-terminate]").forEach(t=>{t.addEventListener("click",async()=>{const n=t.dataset.taskTerminate;if(n){t.setAttribute("disabled","true");try{await Be(n)}finally{await ee()}}})})}catch(a){h("task-table-container",`<p>${a instanceof Error?o(a.message):"Task request failed."}</p>`)}}async function ta(){const e=document.querySelector("#refresh-tasks");e==null||e.addEventListener("click",()=>{ee()}),await ee()}class v{constructor(a){w(this,"kind");w(this,"descriptionText");w(this,"defaultValue");w(this,"roleName");w(this,"roleConfig");w(this,"minValue");w(this,"maxValue");w(this,"stepValue");w(this,"disabledFlag",!1);w(this,"requiredFlag",!1);w(this,"literalValue");w(this,"options",[]);w(this,"fields",{});w(this,"itemType");this.kind=a}description(a){return this.descriptionText=a,this}default(a){return this.defaultValue=a,this}role(a,t){return this.roleName=typeof a=="string"?a:"custom",this.roleConfig=t??a,this}min(a){return this.minValue=a,this}max(a){return this.maxValue=a,this}step(a){return this.stepValue=a,this}required(){return this.requiredFlag=!0,this}disabled(){return this.disabledFlag=!0,this}}function B(e){if(e instanceof v)return e;if(e===String)return new v("string");if(e===Number)return new v("number");if(e===Boolean)return new v("boolean");if(typeof e=="string"||typeof e=="number"||typeof e=="boolean"){const a=new v("const");return a.literalValue=e,a.defaultValue=e,a}if(Array.isArray(e)){const a=new v("union");return a.options=e.map(t=>B(t)),a}if(e&&typeof e=="object"){const a=new v("object");return a.fields=Object.fromEntries(Object.entries(e).map(([t,n])=>[t,B(n)])),a}return new v("string")}function aa(){return{string(){return new v("string")},number(){return new v("number")},boolean(){return new v("boolean")},const(e){const a=new v("const");return a.literalValue=e,a.defaultValue=e,a},union(e){const a=new v("union");return a.options=e.map(t=>B(t)),a},intersect(e){const a=new v("intersect");return a.options=e.map(t=>B(t)),a},object(e){const a=new v("object");return a.fields=Object.fromEntries(Object.entries(e).map(([t,n])=>[t,B(n)])),a},array(e){const a=new v("array");return a.itemType=B(e),a}}}function sa(e,a,t){const n={...e,...a};for(const s of t??[])delete n[s];return n}function ke(e,a){const t=aa();return new Function("Schema","UpdateSchema","SHARED_SCHEMAS","String","Number","Boolean","source",'"use strict"; return eval(source);')(t,sa,a??{},String,Number,Boolean,e)}function He(e){const a=e.find(s=>s.name==="shared"),n=(a?ke(a.schema,null):{})||{};return e.map(s=>({name:s.name,hash:s.hash,source:s.schema,runtime:s.name==="shared"?n:ke(s.schema,n)}))}function _e(e,a=""){return Object.entries(e).map(([t,n])=>({name:t,path:a?`${a}.${t}`:t,schema:n})).filter(t=>t.schema.kind!=="const"||!t.schema.requiredFlag)}function we(e){return Object.entries(e).filter(([,a])=>a.kind==="const"&&a.requiredFlag).map(([a,t])=>`${a} = ${String(t.literalValue)}`)}function $e(e){return Object.fromEntries(Object.entries(e).filter(([,a])=>a.kind==="const"&&a.requiredFlag).map(([a,t])=>[a,t.literalValue]))}function te(e,a,t){if(e.kind==="intersect"){e.options.forEach((n,s)=>te(n,`${a}-i${s}`,t));return}if(e.kind==="object"){const n=_e(e.fields);n.length>0&&t.push({id:a,title:e.descriptionText||"Unnamed section",fields:n,conditions:we(e.fields),constants:$e(e.fields)});return}e.kind==="union"&&e.options.forEach((n,s)=>{if(n.kind==="object"){const r=_e(n.fields);r.length>0&&t.push({id:`${a}-u${s}`,title:n.descriptionText||e.descriptionText||`Conditional branch ${s+1}`,fields:r,conditional:!0,conditions:we(n.fields),constants:$e(n.fields)})}else te(n,`${a}-u${s}`,t)})}function na(e){const a=[];return te(e,"section",a),a}function ra(e){const a={};for(const t of e){t.conditional||Object.assign(a,t.constants);for(const n of t.fields)n.schema.defaultValue!==void 0?a[n.path]=n.schema.defaultValue:n.schema.kind==="boolean"?a[n.path]=!1:a[n.path]=""}return a}function ze(e,a){return e.conditional?Object.entries(e.constants).every(([t,n])=>a[t]===n):!0}function ia(e,a){const t={...a};for(const n of e){if(ze(n,a)){Object.assign(t,n.constants);continue}for(const s of n.fields)delete t[s.path]}return t}function ce(e){return`field-${e.replaceAll(/[^a-zA-Z0-9_-]/g,"-")}`}function oa(e){if(e.kind!=="union")return null;const a=e.options.filter(t=>t.kind==="const").map(t=>t.literalValue).filter(t=>typeof t=="string"||typeof t=="number"||typeof t=="boolean");return a.length!==e.options.length?null:a}function la(e,a){if(!e.roleConfig||typeof e.roleConfig!="object"||Array.isArray(e.roleConfig))return;const t=e.roleConfig[a];return typeof t=="string"?t:void 0}function ae(e){return Array.isArray(e)?e.map(a=>String(a??"")):typeof e=="string"&&e.length>0?e.split(/\r?\n/):[]}function ca(e,a,t){const n=ae(a),s=n.length>0?n:[""],r=ce(e.path);return`
    <div class="table-editor" data-table-path="${o(e.path)}">
      <div class="table-editor-rows">
        ${s.map((i,c)=>`
              <div class="table-editor-row">
                <input
                  id="${c===0?r:`${r}-${c}`}"
                  class="field-input"
                  data-field-path="${o(e.path)}"
                  data-field-kind="table-row"
                  data-field-index="${c}"
                  type="text"
                  value="${o(i)}"
                  ${t}
                />
                <button
                  class="action-button action-button-ghost action-button-small"
                  data-table-remove="${o(e.path)}"
                  data-table-index="${c}"
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
          data-table-add="${o(e.path)}"
          type="button"
          ${t}
        >
          Add row
        </button>
        <span class="table-editor-note">One argument per row.</span>
      </div>
    </div>
  `}function da(e,a){const t=e.schema,n=ce(e.path),s=o(e.path),r=oa(t),i=t.disabledFlag?"disabled":"",c=t.roleName||"";if(t.kind==="boolean")return`
      <label class="checkbox-row" for="${n}">
        <input id="${n}" data-field-path="${s}" data-field-kind="boolean" type="checkbox" ${a?"checked":""} ${i} />
        <span>${t.defaultValue===!0?"default on":"toggle"}</span>
      </label>
    `;if(t.kind==="array"){if(c==="table")return ca(e,a,i);const d=Array.isArray(a)?a.join(`
`):"";return`<textarea id="${n}" class="field-input field-textarea" data-field-path="${s}" data-field-kind="array" ${i}>${o(d)}</textarea>`}if(r){const d=r.map(l=>`<option value="${o(l)}" ${String(l)===String(a)?"selected":""}>${o(l)}</option>`).join("");return`<select id="${n}" class="field-input" data-field-path="${s}" data-field-kind="enum" ${i}>${d}</select>`}if(t.kind==="number"){const d=t.minValue!==void 0?`min="${t.minValue}"`:"",l=t.maxValue!==void 0?`max="${t.maxValue}"`:"",u=t.stepValue!==void 0?`step="${t.stepValue}"`:'step="any"';if(c==="slider"&&t.minValue!==void 0&&t.maxValue!==void 0){const g=a===""||a===void 0||a===null?t.defaultValue??t.minValue:a;return`
        <div class="slider-editor">
          <input
            class="field-slider"
            data-field-path="${s}"
            data-field-kind="number"
            data-slider-role="range"
            type="range"
            value="${o(g)}"
            ${d}
            ${l}
            ${u}
            ${i}
          />
          <div class="slider-editor-footer">
            <input
              id="${n}"
              class="field-input slider-number-input"
              data-field-path="${s}"
              data-field-kind="number"
              data-slider-role="number"
              type="number"
              value="${o(g)}"
              ${d}
              ${l}
              ${u}
              ${i}
            />
            <span class="slider-value" data-slider-value-for="${s}">${o(g)}</span>
          </div>
        </div>
      `}return`<input id="${n}" class="field-input" data-field-path="${s}" data-field-kind="number" type="number" value="${o(a)}" ${d} ${l} ${u} ${i} />`}if(c==="textarea")return`<textarea id="${n}" class="field-input field-textarea" data-field-path="${s}" data-field-kind="string" ${i}>${o(a)}</textarea>`;if(c==="filepicker"){const d=la(t,"type")??(e.path.endsWith("_dir")||e.path==="resume"?"folder":"model-file");return`
      <div class="picker-control">
        <div class="picker-row">
          <input
            id="${n}"
            class="field-input"
            data-field-path="${s}"
            data-field-kind="string"
            type="text"
            value="${o(a)}"
            ${i}
          />
          <button
            class="action-button action-button-ghost picker-button"
            data-picker-path="${s}"
            data-picker-type="${o(d)}"
            type="button"
            ${i}
          >
            Browse
          </button>
        </div>
        <p class="picker-status" data-picker-status-for="${s}">
          Uses the backend native ${d==="folder"?"folder":"file"} picker.
        </p>
      </div>
    `}return t.kind==="const"?`<div class="field-readonly"><code>${o(t.literalValue??a)}</code></div>`:`<input id="${n}" class="field-input" data-field-path="${s}" data-field-kind="string" type="text" value="${o(a)}" ${i} />`}function pa(e,a){const t=e.schema,n=[`<span class="mini-badge">${o(t.kind)}</span>`,t.roleName?`<span class="mini-badge mini-badge-muted">${o(t.roleName)}</span>`:"",t.requiredFlag?'<span class="mini-badge mini-badge-accent">required</span>':"",t.disabledFlag?'<span class="mini-badge mini-badge-muted">disabled</span>':""].filter(Boolean).join(""),s=[t.minValue!==void 0?`min ${t.minValue}`:"",t.maxValue!==void 0?`max ${t.maxValue}`:"",t.stepValue!==void 0?`step ${t.stepValue}`:""].filter(Boolean).join(" · ");return`
    <article class="field-card">
      <div class="field-card-head">
        <div>
          <label class="field-label" for="${ce(e.path)}">${o(e.name)}</label>
          <p class="field-path">${o(e.path)}</p>
        </div>
        <div class="mini-badge-row">${n}</div>
      </div>
      <p class="field-description">${o(t.descriptionText||"No description")}</p>
      ${da(e,a)}
      <div class="field-meta">
        <span><strong>Default:</strong> ${o(t.defaultValue??"(none)")}</span>
        ${s?`<span><strong>Constraints:</strong> ${o(s)}</span>`:""}
      </div>
    </article>
  `}function Ve(e){return e.sections.filter(a=>ze(a,e.values))}function Me(e){return ia(e.sections,e.values)}function ua(e,a){const t=Ve(e);if(t.length===0){h(a,"<p>No renderable sections extracted from this schema.</p>");return}const n=t.map(s=>{const r=s.fields.map(c=>pa(c,e.values[c.path])).join(""),i=s.conditions.length?`<div class="condition-list">${s.conditions.map(c=>`<span class="coverage-pill coverage-pill-muted">${o(c)}</span>`).join("")}</div>`:"";return`
        <article class="panel schema-section-card">
          <div class="schema-section-head">
            <div>
              <p class="panel-kicker">${s.conditional?"conditional section":"section"}</p>
              <h3>${o(s.title)}</h3>
            </div>
            <span class="coverage-pill">${s.fields.length} fields</span>
          </div>
          ${i}
          <div class="field-grid">
            ${r}
          </div>
        </article>
      `}).join("");h(a,n)}function se(e,a){const t=Object.fromEntries(Object.entries(Me(e)).sort(([n],[s])=>n.localeCompare(s)));D(a,JSON.stringify(t,null,2))}function X(e){return e.filter(a=>a.name!=="shared"&&a.runtime instanceof v)}function xe(e,a){const t=e.schema;if(t.kind==="boolean")return!!a;if(t.kind==="number"){const n=String(a).trim();if(n==="")return"";const s=Number(n);return Number.isNaN(s)?"":s}return t.kind==="array"?String(a).split(/\r?\n/).map(n=>n.trim()).filter(Boolean):a}function Se(e,a){return e.sections.flatMap(t=>t.fields).find(t=>t.path===a)}function ha(e,a){return[...e.querySelectorAll('[data-field-kind="table-row"]')].filter(t=>t.dataset.fieldPath===a).map(t=>t.value.trim()).filter(Boolean)}function Te(e,a,t,n){const s=String(t??"");e.querySelectorAll("[data-field-path]").forEach(r=>{if(!(r===n||r.dataset.fieldPath!==a||r.dataset.fieldKind==="table-row")){if(r instanceof HTMLInputElement&&r.type==="checkbox"){r.checked=!!t;return}r.value=s}}),e.querySelectorAll("[data-slider-value-for]").forEach(r=>{r.dataset.sliderValueFor===a&&(r.textContent=s)})}function J(e,a,t,n="idle"){e.querySelectorAll("[data-picker-status-for]").forEach(s=>{s.dataset.pickerStatusFor===a&&(s.textContent=t,s.classList.remove("is-success","is-error"),n==="success"?s.classList.add("is-success"):n==="error"&&s.classList.add("is-error"))})}function ga(e,a,t,n){const s=document.querySelector(`#${a.sectionsId}`);if(!s)return;const r=new Set(e.sections.flatMap(i=>i.conditional?Object.keys(i.constants):[]));s.querySelectorAll("[data-field-path]").forEach(i=>{const c=i.dataset.fieldKind,d=i instanceof HTMLInputElement&&i.type==="checkbox"||i instanceof HTMLSelectElement?"change":"input";i.addEventListener(d,()=>{const l=i.dataset.fieldPath;if(!l)return;const u=Se(e,l);if(u){if(c==="table-row")e.values[l]=ha(s,l);else{const g=i instanceof HTMLInputElement&&i.type==="checkbox"?i.checked:i.value;e.values[l]=xe(u,g),Te(s,l,e.values[l],i)}if(r.has(l)){n({...e,values:{...e.values}});return}se(e,a.previewId),t(e)}})}),s.querySelectorAll("[data-table-add]").forEach(i=>{i.addEventListener("click",()=>{const c=i.dataset.tableAdd;c&&(e.values[c]=[...ae(e.values[c]),""],n({...e,values:{...e.values}}))})}),s.querySelectorAll("[data-table-remove]").forEach(i=>{i.addEventListener("click",()=>{const c=i.dataset.tableRemove,d=Number(i.dataset.tableIndex??"-1");if(!c||d<0)return;const l=ae(e.values[c]).filter((u,g)=>g!==d);e.values[c]=l,n({...e,values:{...e.values}})})}),s.querySelectorAll("[data-picker-path]").forEach(i=>{i.addEventListener("click",async()=>{const c=i.dataset.pickerPath,d=i.dataset.pickerType||"model-file";if(!c)return;const l=Se(e,c);if(l){i.setAttribute("disabled","true"),J(s,c,"Waiting for native picker...","idle");try{const u=await U(d);if(e.values[c]=xe(l,u),Te(s,c,e.values[c]),J(s,c,u,"success"),r.has(c)){n({...e,values:{...e.values}});return}se(e,a.previewId),t(e)}catch(u){J(s,c,u instanceof Error?u.message:"The picker failed to return a value.","error")}finally{i.removeAttribute("disabled")}}})})}function z(e,a){const t=X(e).find(s=>s.name===a);if(!t||!(t.runtime instanceof v))return null;const n=na(t.runtime);return{catalog:e,selectedName:a,sections:n,values:ra(n)}}function F(e,a,t,n){if(t(e),!e){p(a.summaryId,"Failed to build schema bridge state."),h(a.sectionsId,"<p>Schema bridge failed to initialize.</p>"),D(a.previewId,"{}");return}const r=X(e.catalog).map(l=>`<option value="${o(l.name)}" ${l.name===e.selectedName?"selected":""}>${o(l.name)}</option>`).join(""),i=Ve(e);h(a.selectId,r),p(a.summaryId,`${e.selectedName} · ${i.length}/${e.sections.length} visible sections · ${i.reduce((l,u)=>l+u.fields.length,0)} visible fields`),ua(e,a.sectionsId),se(e,a.previewId);const c=document.querySelector(`#${a.selectId}`);c&&(c.onchange=()=>{const l=z(e.catalog,c.value);F(l,a,t,n)});const d=document.querySelector(`#${a.resetId}`);d&&(d.onclick=()=>{F(z(e.catalog,e.selectedName),a,t,n)}),ga(e,a,n,l=>F(l,a,t,n)),n(e)}const ma={selectId:"schema-select",summaryId:"schema-summary",sectionsId:"schema-sections",previewId:"schema-preview",resetId:"schema-reset"};function fa(e){return{selectId:`${e}-schema-select`,summaryId:`${e}-summary`,sectionsId:`${e}-sections`,previewId:`${e}-preview`,resetId:`${e}-reset`}}async function ba(e){var a,t,n;try{const r=((a=(await oe()).data)==null?void 0:a.schemas)??[],i=He(r),c=X(i),d=((t=c.find(l=>l.name==="sdxl-lora"))==null?void 0:t.name)??((n=c[0])==null?void 0:n.name);if(!d){p("schema-summary","No selectable schemas were returned."),h("schema-sections","<p>No schema runtime available.</p>");return}F(z(i,d),ma,e,()=>{})}catch(s){p("schema-summary","Schema bridge request failed"),h("schema-sections",`<p>${s instanceof Error?o(s.message):"Unknown error"}</p>`),D("schema-preview","{}")}}function ya(e,a){return`
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
  `}function L(e,a,t){return`
    <section class="page-hero panel">
      <p class="eyebrow">${e}</p>
      <h2>${a}</h2>
      <p class="lede">${t}</p>
    </section>
  `}function Le(e,a,t="module"){return`
    <article class="panel info-card">
      <p class="panel-kicker">${t}</p>
      <h3>${e}</h3>
      <div>${a}</div>
    </article>
  `}function va(){return`
    ${L("about","A clean source-side replacement for the current about page","This page is one of the safest migration targets because it is mostly branding, release context and ownership notes.")}
    <section class="two-column">
      ${Le("Project identity",`
          <p><strong>Product name:</strong> SD-reScripts</p>
          <p><strong>Version target:</strong> v1.0.2</p>
          <p><strong>Lineage:</strong> Fork from 秋葉 aaaki/lora-scripts</p>
          <p><strong>Maintainer:</strong> Modify By Lulynx</p>
        `,"brand")}
      ${Le("Why migrate this page first",`
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
      <p><a class="text-link" href="${T("/other/about.html")}" target="_blank" rel="noreferrer">Open current shipped about page</a></p>
    </section>
  `}function I(e){return`
    ${L(e.heroKicker,e.heroTitle,e.heroLede)}
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
            <p><a class="text-link" href="${T(e.legacyPath)}" target="_blank" rel="noreferrer">${e.legacyLabel}</a></p>
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
  `}function ka(){return I({prefix:"dreambooth",heroKicker:"dreambooth train",heroTitle:"Dreambooth source training page",heroLede:"This route brings the Dreambooth and SDXL full-finetune schema into the same source-side training bridge so we can migrate one of the last big non-LoRA training paths cleanly.",runnerTitle:"Dreambooth source-side runner",startButtonLabel:"Start Dreambooth training",legacyPath:"/dreambooth/",legacyLabel:"Open current shipped Dreambooth page",renderedTitle:"Dreambooth form bridge"})}function _a(){return I({prefix:"flux-controlnet",heroKicker:"flux controlnet",heroTitle:"Flux ControlNet source training page",heroLede:"This route reuses the same source-side training bridge for Flux ControlNet so the DiT-family conditioning workflow stays aligned with the current backend schema and payload rules.",runnerTitle:"Flux ControlNet source-side runner",startButtonLabel:"Start Flux ControlNet training",legacyPath:"/lora/flux-controlnet.html",legacyLabel:"Open current shipped Flux ControlNet page",renderedTitle:"Flux ControlNet form bridge"})}function wa(){return I({prefix:"flux",heroKicker:"flux train",heroTitle:"Flux LoRA source training page",heroLede:"This route reuses the source-side training bridge for Flux so we can keep payload shaping, compatibility checks and launch behavior aligned with the current backend.",runnerTitle:"Flux source-side runner",startButtonLabel:"Start Flux training",legacyPath:"/lora/flux.html",legacyLabel:"Open current shipped Flux page",renderedTitle:"Flux form bridge"})}function $a(){return`
    ${L("schema bridge","Source-side schema explorer and prototype form bridge","This page evaluates the current schema DSL in the browser and turns it into sections, fields and editable defaults. It is the first direct bridge between the new source workspace and the training form core.")}
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
  `}function xa(){return I({prefix:"sd3",heroKicker:"sd3 train",heroTitle:"SD3 LoRA source training page",heroLede:"This route extends the same source-side training bridge to SD3 so we can keep the fast-moving schema-driven trainer paths on one shared foundation.",runnerTitle:"SD3 source-side runner",startButtonLabel:"Start SD3 training",legacyPath:"/lora/sd3.html",legacyLabel:"Open current shipped SD3 page",renderedTitle:"SD3 form bridge"})}function Sa(){return I({prefix:"sd-controlnet",heroKicker:"sd controlnet",heroTitle:"SD ControlNet source training page",heroLede:"This route extends the shared source-side training bridge to the SD1.x / SD2.x ControlNet workflow so conditioning-dataset training can migrate without another bespoke form stack.",runnerTitle:"SD ControlNet source-side runner",startButtonLabel:"Start SD ControlNet training",legacyPath:"/lora/controlnet.html",legacyLabel:"Open current shipped SD ControlNet page",renderedTitle:"SD ControlNet form bridge"})}function Ta(){return I({prefix:"sdxl-controlnet",heroKicker:"sdxl controlnet",heroTitle:"SDXL ControlNet source training page",heroLede:"This route keeps the SDXL ControlNet training path on the same source-side schema bridge, normalized payload builder and launch pipeline as the main LoRA routes.",runnerTitle:"SDXL ControlNet source-side runner",startButtonLabel:"Start SDXL ControlNet training",legacyPath:"/lora/sdxl-controlnet.html",legacyLabel:"Open current shipped SDXL ControlNet page",renderedTitle:"SDXL ControlNet form bridge"})}function La(){return I({prefix:"sdxl-lllite",heroKicker:"sdxl lllite",heroTitle:"SDXL LLLite source training page",heroLede:"This route keeps the SDXL ControlNet-LLLite path on the shared source-side training bridge so even the more specialized conditioning flow no longer needs its own one-off migration path.",runnerTitle:"SDXL LLLite source-side runner",startButtonLabel:"Start SDXL LLLite training",legacyPath:"/lora/sdxl-lllite.html",legacyLabel:"Open current shipped SDXL LLLite page",renderedTitle:"SDXL LLLite form bridge"})}function Ea(){return I({prefix:"sdxl",heroKicker:"sdxl train",heroTitle:"First source-side SDXL training page",heroLede:"This is the first page that moves beyond passive inspection: it renders the SDXL schema, tracks a real config model and can submit to the current training backend.",runnerTitle:"SDXL source-side runner",startButtonLabel:"Start SDXL training",legacyPath:"/lora/sdxl.html",legacyLabel:"Open current shipped SDXL page",renderedTitle:"SDXL form bridge"})}function Pa(){return`
    ${L("settings","Source-side settings page prototype","This route is now close to live backend config data, so we can rebuild it before touching the schema-heavy training forms.")}
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
      <p><a class="text-link" href="${T("/other/settings.html")}" target="_blank" rel="noreferrer">Open current shipped settings page</a></p>
    </section>
  `}function Aa(){return`
    ${L("tag editor","Tag editor wrapper migration page","The current shipped page is mostly a wrapper around startup state and proxy behavior. That makes it a good low-risk source-side rewrite.")}
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
          <p><a class="text-link" href="${T("/tageditor.html")}" target="_blank" rel="noreferrer">Open current shipped tag editor wrapper</a></p>
        </div>
      </article>
    </section>
  `}function Ia(){return`
    ${L("tasks","Task monitor migration page","This route is already talking to the real backend task manager, so it is a strong candidate for early source migration.")}
    <section class="panel task-panel">
      <div class="task-toolbar">
        <button id="refresh-tasks" class="action-button" type="button">Refresh tasks</button>
        <a class="text-link task-legacy-link" href="${T("/task.html")}" target="_blank" rel="noreferrer">Open current shipped task page</a>
      </div>
      <div id="task-table-container" class="task-table-container loading">Loading tasks...</div>
    </section>
  `}function Ca(){return`
    ${L("tensorboard","TensorBoard wrapper migration page","This page can be rebuilt without touching training forms because it mainly needs status text and a proxy destination.")}
    <section class="two-column">
      <article class="panel info-card">
        <p class="panel-kicker">proxy</p>
        <h3>Legacy backend path</h3>
        <div>
          <p>The current runtime proxies TensorBoard through <code>/proxy/tensorboard/</code>.</p>
          <p>This source-side page can later offer a cleaner iframe or open-in-new-tab flow.</p>
          <p><a class="text-link" href="${T("/proxy/tensorboard/")}" target="_blank" rel="noreferrer">Open current TensorBoard proxy</a></p>
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
  `}function Na(){return`
    ${L("tools","Tools workspace","This route now covers both raw script launching and the first reusable dataset utility, so it can grow into a real preflight toolbox instead of staying a placeholder.")}
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
      <p><a class="text-link" href="${T("/tageditor.html")}" target="_blank" rel="noreferrer">Open current shipped tag editor wrapper</a></p>
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
      <p><a class="text-link" href="${T("/lora/tools.html")}" target="_blank" rel="noreferrer">Open current shipped tools page</a></p>
      <div id="tools-browser" class="tools-browser loading">Loading available scripts...</div>
    </section>
  `}const Ra=[{method:"GET",path:"/api/schemas/all",purpose:"Fetch all schema definitions used to render training forms.",migrationPriority:"high"},{method:"GET",path:"/api/schemas/hashes",purpose:"Hot-reload check for schema changes.",migrationPriority:"medium"},{method:"GET",path:"/api/presets",purpose:"Fetch preset configs for pages and tools.",migrationPriority:"high"},{method:"GET",path:"/api/config/saved_params",purpose:"Load stored UI parameter choices.",migrationPriority:"medium"},{method:"GET",path:"/api/config/summary",purpose:"Read app config summary for the rebuilt settings page.",migrationPriority:"medium"},{method:"GET",path:"/api/graphic_cards",purpose:"List GPUs plus xformers support state.",migrationPriority:"high"},{method:"POST",path:"/api/run",purpose:"Start schema-driven training jobs.",migrationPriority:"high"},{method:"POST",path:"/api/run_script",purpose:"Run utility scripts from the tools page.",migrationPriority:"high"},{method:"POST",path:"/api/interrogate",purpose:"Run the built-in tagger/interrogator flow.",migrationPriority:"high"},{method:"GET",path:"/api/interrogators",purpose:"List available batch tagger/interrogator models for the rebuilt tools workspace.",migrationPriority:"high"},{method:"POST",path:"/api/captions/cleanup/preview",purpose:"Preview bulk caption cleanup rules before touching files.",migrationPriority:"high"},{method:"POST",path:"/api/captions/cleanup/apply",purpose:"Apply bulk caption cleanup rules to caption files.",migrationPriority:"high"},{method:"POST",path:"/api/captions/backups/create",purpose:"Create a snapshot archive of caption files for later restore.",migrationPriority:"high"},{method:"POST",path:"/api/captions/backups/list",purpose:"List caption snapshots associated with a folder.",migrationPriority:"high"},{method:"POST",path:"/api/captions/backups/restore",purpose:"Restore caption files from a saved snapshot archive.",migrationPriority:"high"},{method:"GET",path:"/api/pick_file",purpose:"Open native file/folder pickers where supported.",migrationPriority:"medium"},{method:"GET",path:"/api/get_files",purpose:"List model, output or train directories for file pickers.",migrationPriority:"high"},{method:"GET",path:"/api/tasks",purpose:"Fetch active and historical task state.",migrationPriority:"high"},{method:"GET",path:"/api/tasks/terminate/{task_id}",purpose:"Terminate a running task.",migrationPriority:"high"},{method:"GET",path:"/api/tageditor_status",purpose:"Poll tag-editor startup/proxy status.",migrationPriority:"medium"},{method:"GET",path:"/api/scripts",purpose:"List backend-approved utility scripts and positional args for the rebuilt tools page.",migrationPriority:"high"}];function We(){const e=je.map(t=>`
        <article class="panel route-card" data-status="${t.status}">
          <div class="panel-kicker">${t.section}</div>
          <h3>${t.title}</h3>
          <p class="route-path">${t.route}</p>
          <p>${t.notes}</p>
          ${t.schemaHints&&t.schemaHints.length>0?`<p class="schema-linkline">Schema hints: ${t.schemaHints.map(n=>`<code>${n}</code>`).join(", ")}</p>`:""}
          <div class="pill-row">
            <span class="pill ${t.status==="migrate-first"?"pill-hot":"pill-cool"}">${t.status}</span>
          </div>
        </article>
      `).join(""),a=Ra.map(t=>`
        <tr>
          <td><span class="method method-${t.method.toLowerCase()}">${t.method}</span></td>
          <td><code>${t.path}</code></td>
          <td>${t.purpose}</td>
          <td>${t.migrationPriority}</td>
        </tr>
      `).join("");return`
    ${L("workspace","Source migration dashboard","This page stays close to the backend and keeps our migration map explicit instead of hiding it inside hashed dist chunks.")}

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
  `}const R="#/workspace",q=[{id:"overview",label:"Workspace",section:"overview",hash:R,description:"Source migration dashboard and live backend diagnostics."},{id:"about",label:"About",section:"phase1",hash:"#/about",description:"Rebuild branding and release notes in source form."},{id:"settings",label:"Settings",section:"phase1",hash:"#/settings",description:"Read config summary and saved parameter state from the backend."},{id:"tasks",label:"Tasks",section:"phase1",hash:"#/tasks",description:"Inspect and manage task execution state."},{id:"tageditor",label:"Tag Editor",section:"phase1",hash:"#/tageditor",description:"Track startup status and future proxy behavior."},{id:"tensorboard",label:"TensorBoard",section:"phase1",hash:"#/tensorboard",description:"Prepare a cleaner source-side wrapper for TensorBoard access."},{id:"tools",label:"Tools",section:"phase1",hash:"#/tools",description:"Migrate script-launch and utility entry points from the legacy tools page."},{id:"schema-bridge",label:"Schema Bridge",section:"reference",hash:"#/schema-bridge",description:"Evaluate current schema DSL into a source-side explorer and prototype form renderer."},{id:"sdxl-train",label:"SDXL Train",section:"reference",hash:"#/sdxl-train",description:"First source-side training page powered by the schema bridge and current `/api/run` backend."},{id:"flux-train",label:"Flux Train",section:"reference",hash:"#/flux-train",description:"Source-side Flux LoRA training route built on the shared schema bridge and launch pipeline."},{id:"sd3-train",label:"SD3 Train",section:"reference",hash:"#/sd3-train",description:"Source-side SD3 LoRA training route using the same normalized payload workflow."},{id:"dreambooth-train",label:"Dreambooth",section:"reference",hash:"#/dreambooth-train",description:"Source-side Dreambooth and SDXL full-finetune route on the shared schema bridge."},{id:"sd-controlnet-train",label:"SD ControlNet",section:"reference",hash:"#/sd-controlnet-train",description:"Source-side SD ControlNet training route using the shared launch flow."},{id:"sdxl-controlnet-train",label:"SDXL ControlNet",section:"reference",hash:"#/sdxl-controlnet-train",description:"Source-side SDXL ControlNet training route using the shared launch flow."},{id:"flux-controlnet-train",label:"Flux ControlNet",section:"reference",hash:"#/flux-controlnet-train",description:"Source-side Flux ControlNet training route using the shared launch flow."},{id:"sdxl-lllite-train",label:"SDXL LLLite",section:"reference",hash:"#/sdxl-lllite-train",description:"Source-side SDXL ControlNet-LLLite training route on the shared training bridge."}],Xe=new Set(q.map(e=>e.hash)),Ge={"/index.html":R,"/index.md":R,"/404.html":R,"/404.md":R,"/task.html":"#/tasks","/task.md":"#/tasks","/tageditor.html":"#/tageditor","/tageditor.md":"#/tageditor","/tagger.html":"#/tageditor","/tagger.md":"#/tageditor","/tensorboard.html":"#/tensorboard","/tensorboard.md":"#/tensorboard","/other/about.html":"#/about","/other/about.md":"#/about","/other/settings.html":"#/settings","/other/settings.md":"#/settings","/dreambooth/index.html":"#/dreambooth-train","/dreambooth/index.md":"#/dreambooth-train","/lora/index.html":"#/sdxl-train","/lora/index.md":"#/sdxl-train"},Ba=Object.keys(Ge).sort((e,a)=>a.length-e.length);function de(e){const a=e.replace(/\/+$/,"");return a.length>0?`${a}/`:"/"}function qa(e){switch(e){case"flux":case"flux-finetune":return"#/flux-train";case"sd3":case"sd3-finetune":return"#/sd3-train";case"controlnet":return"#/sd-controlnet-train";case"sdxl-controlnet":return"#/sdxl-controlnet-train";case"flux-controlnet":return"#/flux-controlnet-train";case"sdxl-lllite":return"#/sdxl-lllite-train";case"tools":return"#/tools";case"basic":case"master":case"params":case"sdxl":case"sdxl-ti":case"ti":case"xti":case"anima":case"anima-finetune":case"hunyuan":case"lumina":case"lumina-finetune":return"#/sdxl-train";default:return null}}function Da(e){const a=e.match(/^(.*)\/lora\/([^/]+)\.(?:html|md)$/i);if(!a)return null;const[,t,n]=a,s=qa(n.toLowerCase());return s?{hash:s,canonicalRootPath:de(t)}:null}function ja(e){const a=e.toLowerCase();for(const t of Ba)if(a.endsWith(t))return{hash:Ge[t],canonicalRootPath:de(e.slice(0,e.length-t.length))};return Da(e)}function Ee(e,a){const t=`${e}${window.location.search}${a}`,n=`${window.location.pathname}${window.location.search}${window.location.hash}`;t!==n&&window.history.replaceState(null,"",t)}function Oa(){const e=Xe.has(window.location.hash)?window.location.hash:R;return q.find(a=>a.hash===e)??q[0]}function Fa(){if(Xe.has(window.location.hash))return;const e=ja(window.location.pathname);if(e){Ee(e.canonicalRootPath,e.hash);return}Ee(de(window.location.pathname||"/"),R)}const Pe={"sdxl-train":{routeId:"sdxl-train",schemaName:"sdxl-lora",prefix:"sdxl",modelLabel:"SDXL",presetTrainTypes:["sdxl-lora"]},"flux-train":{routeId:"flux-train",schemaName:"flux-lora",prefix:"flux",modelLabel:"Flux",presetTrainTypes:["flux-lora"]},"sd3-train":{routeId:"sd3-train",schemaName:"sd3-lora",prefix:"sd3",modelLabel:"SD3",presetTrainTypes:["sd3-lora"]},"dreambooth-train":{routeId:"dreambooth-train",schemaName:"dreambooth",prefix:"dreambooth",modelLabel:"Dreambooth",presetTrainTypes:["dreambooth","sd-dreambooth","sdxl-finetune"]},"sd-controlnet-train":{routeId:"sd-controlnet-train",schemaName:"sd-controlnet",prefix:"sd-controlnet",modelLabel:"SD ControlNet",presetTrainTypes:["sd-controlnet"]},"sdxl-controlnet-train":{routeId:"sdxl-controlnet-train",schemaName:"sdxl-controlnet",prefix:"sdxl-controlnet",modelLabel:"SDXL ControlNet",presetTrainTypes:["sdxl-controlnet"]},"flux-controlnet-train":{routeId:"flux-controlnet-train",schemaName:"flux-controlnet",prefix:"flux-controlnet",modelLabel:"Flux ControlNet",presetTrainTypes:["flux-controlnet"]},"sdxl-lllite-train":{routeId:"sdxl-lllite-train",schemaName:"sdxl-controlnet-lllite",prefix:"sdxl-lllite",modelLabel:"SDXL LLLite",presetTrainTypes:["sdxl-controlnet-lllite"]}};function Ua(e,a){if(a.length===0){h(e,"<p>No GPUs reported. Training will use the backend default environment.</p>");return}const t=a.map((n,s)=>{const r=n.index??n.id??s,i=String(r);return`
        <label class="gpu-chip">
          <input type="checkbox" data-gpu-id="${o(i)}" />
          <span>GPU ${o(i)}: ${o(n.name)}</span>
        </label>
      `}).join("");h(e,`<div class="gpu-chip-grid">${t}</div>`)}function pe(e){return[...document.querySelectorAll(`#${e} input[data-gpu-id]:checked`)].map(a=>a.dataset.gpuId).filter(a=>!!a)}function ue(e,a=[]){const t=new Set(a.map(n=>String(n)));document.querySelectorAll(`#${e}-gpu-selector input[data-gpu-id]`).forEach(n=>{const s=n.dataset.gpuId??"";n.checked=t.has(s)})}function S(e,a,t,n="idle"){h(`${e}-submit-status`,`
      <div class="submit-status-box submit-status-${n}">
        <strong>${o(a)}</strong>
        <p>${o(t)}</p>
      </div>
    `)}function ne(e,a,t){if(t){h(`${e}-validation-status`,`
        <div class="submit-status-box submit-status-error">
          <strong>Payload preparation failed</strong>
          <p>${o(t)}</p>
        </div>
      `);return}const n=[a.errors.length>0?`
          <div>
            <strong>Errors</strong>
            <ul class="status-list">
              ${a.errors.map(s=>`<li>${o(s)}</li>`).join("")}
            </ul>
          </div>
        `:"",a.warnings.length>0?`
          <div>
            <strong>Warnings</strong>
            <ul class="status-list">
              ${a.warnings.map(s=>`<li>${o(s)}</li>`).join("")}
            </ul>
          </div>
        `:""].filter(Boolean).join("");if(!n){h(`${e}-validation-status`,`
        <div class="submit-status-box submit-status-success">
          <strong>Compatibility checks passed</strong>
          <p>No obvious parameter conflicts were detected in the current payload.</p>
        </div>
      `);return}h(`${e}-validation-status`,`
      <div class="submit-status-box ${a.errors.length>0?"submit-status-error":"submit-status-warning"}">
        <strong>${a.errors.length>0?"Action needed before launch":"Review before launch"}</strong>
        ${n}
      </div>
    `)}function k(e,a,t="idle"){const n=document.querySelector(`#${e}-utility-note`);n&&(n.textContent=a,n.classList.remove("utility-note-success","utility-note-warning","utility-note-error"),t==="success"?n.classList.add("utility-note-success"):t==="warning"?n.classList.add("utility-note-warning"):t==="error"&&n.classList.add("utility-note-error"))}function Ha(e){const a=[];let t="",n=null,s=0;for(let r=0;r<e.length;r+=1){const i=e[r],c=r>0?e[r-1]:"";if(n){t+=i,i===n&&c!=="\\"&&(n=null);continue}if(i==='"'||i==="'"){n=i,t+=i;continue}if(i==="["){s+=1,t+=i;continue}if(i==="]"){s-=1,t+=i;continue}if(i===","&&s===0){a.push(t.trim()),t="";continue}t+=i}return t.trim().length>0&&a.push(t.trim()),a}function za(e){let a=null,t=!1,n="";for(const s of e){if(a){if(n+=s,a==='"'&&s==="\\"&&!t){t=!0;continue}s===a&&!t&&(a=null),t=!1;continue}if(s==='"'||s==="'"){a=s,n+=s;continue}if(s==="#")break;n+=s}return n.trim()}function Ke(e){return e.startsWith('"')&&e.endsWith('"')?e.slice(1,-1).replaceAll('\\"','"').replaceAll("\\n",`
`).replaceAll("\\t","	").replaceAll("\\\\","\\"):e.startsWith("'")&&e.endsWith("'")?e.slice(1,-1):e}function Je(e){const a=e.trim();return a.length===0?"":a.startsWith('"')&&a.endsWith('"')||a.startsWith("'")&&a.endsWith("'")?Ke(a):a==="true"?!0:a==="false"?!1:a.startsWith("[")&&a.endsWith("]")?Ha(a.slice(1,-1)).map(t=>Je(t)):/^[+-]?\d[\d_]*(\.\d[\d_]*)?([eE][+-]?\d+)?$/.test(a)?Number(a.replaceAll("_","")):a}function Ae(e){return e.split(".").map(a=>a.trim()).filter(Boolean).map(a=>Ke(a))}function Va(e,a,t){let n=e;for(let s=0;s<a.length-1;s+=1){const r=a[s],i=n[r];(!i||typeof i!="object"||Array.isArray(i))&&(n[r]={}),n=n[r]}n[a[a.length-1]]=t}function Ye(e){const a={};let t=[];for(const n of e.split(/\r?\n/)){const s=za(n);if(!s)continue;if(s.startsWith("[[")&&s.endsWith("]]"))throw new Error("Array-of-table syntax is not supported in custom params yet.");if(s.startsWith("[")&&s.endsWith("]")){t=Ae(s.slice(1,-1));continue}const r=s.indexOf("=");if(r===-1)throw new Error(`Invalid TOML line: ${n}`);const i=Ae(s.slice(0,r));if(i.length===0)throw new Error(`Invalid TOML key: ${n}`);Va(a,[...t,...i],Je(s.slice(r+1)))}return a}function Y(e){return JSON.stringify(e)}function Ze(e){return typeof e=="string"?Y(e):typeof e=="number"?Number.isFinite(e)?String(e):Y(String(e)):typeof e=="boolean"?e?"true":"false":Array.isArray(e)?`[${e.map(a=>Ze(a)).join(", ")}]`:Y(JSON.stringify(e))}function Qe(e,a=[],t=[]){const n=[];for(const[s,r]of Object.entries(e)){if(r&&typeof r=="object"&&!Array.isArray(r)){Qe(r,[...a,s],t);continue}n.push([s,r])}return t.push({path:a,values:n}),t}function Ma(e){const a=Qe(e).filter(n=>n.values.length>0).sort((n,s)=>n.path.join(".").localeCompare(s.path.join("."))),t=[];for(const n of a){n.path.length>0&&(t.length>0&&t.push(""),t.push(`[${n.path.join(".")}]`));for(const[s,r]of n.values.sort(([i],[c])=>i.localeCompare(c)))t.push(`${s} = ${Ze(r)}`)}return t.join(`
`)}const Wa=["pretrained_model_name_or_path","train_data_dir","reg_data_dir","output_dir","network_weights","conditioning_data_dir","controlnet_model_name_or_path","weights","vae","text_encoder","byt5","qwen3","llm_adapter_path","t5_tokenizer_path","ae","clip_l","clip_g","t5xxl","gemma2"],Xa=["learning_rate","unet_lr","text_encoder_lr","learning_rate_te","learning_rate_te1","learning_rate_te2","learning_rate_te3","sigmoid_scale","guidance_scale","training_shift","control_net_lr","self_attn_lr","cross_attn_lr","mlp_lr","mod_lr","llm_adapter_lr"],Ga=["lycoris_algo","conv_dim","conv_alpha","dropout","dylora_unit","lokr_factor","train_norm","down_lr_weight","mid_lr_weight","up_lr_weight","block_lr_zero_threshold","enable_block_weights","enable_preview","network_args_custom","optimizer_args_custom","enable_base_weight","prodigy_d0","prodigy_d_coef","ui_custom_params"],Ka=["vae","reg_data_dir","network_weights","conditioning_data_dir","controlnet_model_name_or_path","weights","init_word","text_encoder","byt5","qwen3","llm_adapter_path","t5_tokenizer_path","ae","clip_l","clip_g","t5xxl","gemma2","noise_offset","multires_noise_iterations","multires_noise_discount","caption_dropout_rate","network_dropout","scale_weight_norms","gpu_ids"],Ja=["v2","v_parameterization","scale_v_pred_loss_like_noise_pred","clip_skip","learning_rate_te","stop_text_encoder_training"],Ya=["learning_rate_te1","learning_rate_te2"],Za=[["cache_text_encoder_outputs","shuffle_caption"],["noise_offset","multires_noise_iterations"],["cache_latents","color_aug"],["cache_latents","random_crop"]],Ie={algo:"lycoris_algo",unit:"dylora_unit",factor:"lokr_factor"},Qa=new Set(["conv_dim","conv_alpha","dropout","down_lr_weight","mid_lr_weight","up_lr_weight","block_lr_zero_threshold"]),es=new Set(["decouple","weight_decay","use_bias_correction","safeguard_warmup"]),ts=new Set(["base_weights","base_weights_multiplier"]),as={pretrained_model_name_or_path:"./sd-models/model.safetensors",train_data_dir:"./train/aki",resolution:"512,512",enable_bucket:!0,min_bucket_reso:256,max_bucket_reso:1024,output_name:"aki",output_dir:"./output",save_model_as:"safetensors",save_every_n_epochs:2,max_train_epochs:10,train_batch_size:1,network_train_unet_only:!1,network_train_text_encoder_only:!1,learning_rate:1e-4,unet_lr:1e-4,text_encoder_lr:1e-5,lr_scheduler:"cosine_with_restarts",optimizer_type:"AdamW8bit",lr_scheduler_num_cycles:1,network_module:"networks.lora",network_dim:32,network_alpha:32,logging_dir:"./logs",caption_extension:".txt",shuffle_caption:!0,keep_tokens:0,max_token_length:255,seed:1337,prior_loss_weight:1,clip_skip:2,mixed_precision:"fp16",save_precision:"fp16",xformers:!0,cache_latents:!0,persistent_data_loader_workers:!0};function re(e){return JSON.parse(JSON.stringify(e??{}))}function H(e){return Array.isArray(e)?e.map(a=>String(a??"").trim()).filter(Boolean):String(e??"").split(/\r?\n/).map(a=>a.trim()).filter(Boolean)}function C(e,a){return Object.prototype.hasOwnProperty.call(e,a)}function ss(e){return String(e.model_train_type??"").startsWith("sdxl")}function ns(e){return String(e.model_train_type??"")==="sd3-finetune"}function f(e){return e==null?"":String(e)}function rs(e){return f(e).replaceAll("\\","/")}function V(e,a=0){const t=Number.parseFloat(f(e));return Number.isNaN(t)?a:t}function y(e){return!!e}function Ce(e){const a=e.indexOf("=");return a===-1?{key:e.trim(),value:"",hasValue:!1}:{key:e.slice(0,a).trim(),value:e.slice(a+1).trim(),hasValue:!0}}function is(e){if(typeof e=="boolean")return e;const a=f(e).toLowerCase();return a==="true"||a==="1"||a==="yes"}function et(e,a=String(e.model_train_type??"")){const t=a==="lora-basic"?{...as,...re(e)}:re(e),n=[],s=[],r=ss(t),i=ns(t);(r||i)&&[t.learning_rate_te1,t.learning_rate_te2,t.learning_rate_te3].some(y)&&(t.train_text_encoder=!0);for(const l of r||i?Ja:Ya)C(t,l)&&delete t[l];t.network_module==="lycoris.kohya"?(n.push(`conv_dim=${f(t.conv_dim)}`,`conv_alpha=${f(t.conv_alpha)}`,`dropout=${f(t.dropout)}`,`algo=${f(t.lycoris_algo)}`),y(t.lokr_factor)&&n.push(`factor=${f(t.lokr_factor)}`),y(t.train_norm)&&n.push("train_norm=True")):t.network_module==="networks.dylora"&&n.push(`unit=${f(t.dylora_unit)}`);const c=f(t.optimizer_type),d=c.toLowerCase();d.startsWith("dada")?((c==="DAdaptation"||c==="DAdaptAdam")&&s.push("decouple=True","weight_decay=0.01"),t.learning_rate=1,t.unet_lr=1,t.text_encoder_lr=1):d==="prodigy"&&(s.push("decouple=True","weight_decay=0.01","use_bias_correction=True",`d_coef=${f(t.prodigy_d_coef)}`),y(t.lr_warmup_steps)&&s.push("safeguard_warmup=True"),y(t.prodigy_d0)&&s.push(`d0=${f(t.prodigy_d0)}`)),y(t.enable_block_weights)&&(n.push(`down_lr_weight=${f(t.down_lr_weight)}`,`mid_lr_weight=${f(t.mid_lr_weight)}`,`up_lr_weight=${f(t.up_lr_weight)}`,`block_lr_zero_threshold=${f(t.block_lr_zero_threshold)}`),delete t.block_lr_zero_threshold),y(t.enable_base_weight)?(t.base_weights=H(t.base_weights),t.base_weights_multiplier=H(t.base_weights_multiplier).map(l=>V(l))):(delete t.base_weights,delete t.base_weights_multiplier);for(const l of H(t.network_args_custom))n.push(l);for(const l of H(t.optimizer_args_custom))s.push(l);y(t.enable_preview)||(delete t.sample_prompts,delete t.sample_sampler,delete t.sample_every_n_epochs);for(const l of Xa)C(t,l)&&(t[l]=V(t[l]));for(const l of Ka){if(!C(t,l))continue;const u=t[l];(u===0||u===""||Array.isArray(u)&&u.length===0)&&delete t[l]}for(const l of Wa)C(t,l)&&t[l]&&(t[l]=rs(t[l]));if(n.length>0?t.network_args=n:delete t.network_args,s.length>0?t.optimizer_args=s:delete t.optimizer_args,y(t.ui_custom_params)){const l=Ye(f(t.ui_custom_params));Object.assign(t,l)}for(const l of Ga)C(t,l)&&delete t[l];return Array.isArray(t.gpu_ids)&&(t.gpu_ids=t.gpu_ids.map(l=>{const u=f(l),g=u.match(/GPU\s+(\d+):/);return g?g[1]:u})),t}function os(e){const a=[],t=[],n=f(e.optimizer_type),s=n.toLowerCase(),r=f(e.model_train_type),i=r==="sd3-finetune",c=r==="anima-lora"||r==="anima-finetune";n.startsWith("DAdapt")&&e.lr_scheduler!=="constant"&&a.push("DAdaptation works best with lr_scheduler set to constant."),s.startsWith("prodigy")&&(C(e,"unet_lr")||C(e,"text_encoder_lr"))&&(V(e.unet_lr,1)!==1||V(e.text_encoder_lr,1)!==1)&&a.push("Prodigy usually expects unet_lr and text_encoder_lr to stay at 1."),e.network_module==="networks.oft"&&r!=="sdxl-lora"&&t.push("OFT is currently only supported for SDXL LoRA."),i&&y(e.train_text_encoder)&&y(e.cache_text_encoder_outputs)&&!y(e.use_t5xxl_cache_only)&&t.push("SD3 full finetune cannot train text encoders while cache_text_encoder_outputs is enabled."),i&&y(e.train_t5xxl)&&!y(e.train_text_encoder)&&t.push("train_t5xxl requires train_text_encoder to be enabled first."),i&&y(e.train_t5xxl)&&y(e.cache_text_encoder_outputs)&&t.push("train_t5xxl cannot be combined with cache_text_encoder_outputs."),c&&y(e.unsloth_offload_checkpointing)&&y(e.cpu_offload_checkpointing)&&t.push("unsloth_offload_checkpointing cannot be combined with cpu_offload_checkpointing."),c&&y(e.unsloth_offload_checkpointing)&&y(e.blocks_to_swap)&&t.push("unsloth_offload_checkpointing cannot be combined with blocks_to_swap.");for(const[d,l]of Za)y(e[d])&&y(e[l])&&t.push(`Parameters ${d} and ${l} conflict. Please enable only one of them.`);return{warnings:a,errors:t}}function tt(e){const a=re(e);if(Array.isArray(a.network_args)){const t=[];for(const n of a.network_args){const{key:s,value:r,hasValue:i}=Ce(f(n));if(s==="train_norm"){a.train_norm=i?is(r):!0;continue}if((s==="down_lr_weight"||s==="mid_lr_weight"||s==="up_lr_weight"||s==="block_lr_zero_threshold")&&(a.enable_block_weights=!0),Qa.has(s)){a[s]=r;continue}if(Ie[s]){a[Ie[s]]=r;continue}t.push(f(n))}t.length>0&&(a.network_args_custom=t),delete a.network_args}if(Array.isArray(a.optimizer_args)){const t=[];for(const n of a.optimizer_args){const{key:s,value:r}=Ce(f(n));if(s==="d_coef"){a.prodigy_d_coef=r;continue}if(s==="d0"){a.prodigy_d0=r;continue}es.has(s)||t.push(f(n))}t.length>0&&(a.optimizer_args_custom=t),delete a.optimizer_args}for(const t of ts)Array.isArray(a[t])&&(a[t]=a[t].map(n=>f(n)).join(`
`),t==="base_weights"&&(a.enable_base_weight=!0),t==="base_weights_multiplier"&&(a.enable_base_weight=!0));return Array.isArray(a.gpu_ids)&&(a.gpu_ids=a.gpu_ids.map(t=>f(t))),a}function at(e,a){const t=a.values.output_name;return typeof t=="string"&&t.trim().length>0?t.trim():`${e.modelLabel} snapshot`}function ls(e){try{return JSON.stringify(et(W(e.value)),null,2)}catch(a){return a instanceof Error?a.message:"Unable to preview this snapshot."}}function cs(e,a){if(a.length===0){h(`${e}-history-panel`,`
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
      `);return}const t=a.map((n,s)=>`
        <article class="history-card">
          <div class="history-card-head">
            <div>
              <h4>${o(n.name||"Unnamed snapshot")}</h4>
              <p class="history-card-meta">${o(n.time)}</p>
            </div>
            <span class="coverage-pill coverage-pill-muted">${o((n.gpu_ids??[]).join(", ")||"default GPU")}</span>
          </div>
          <pre class="history-preview">${o(ls(n))}</pre>
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
      <div class="history-list">${t}</div>
    `)}function ds(e,a){if(a.length===0){h(`${e}-presets-panel`,`
        <div class="training-side-panel-head">
          <div>
            <p class="panel-kicker">presets</p>
            <h3>Training presets</h3>
          </div>
          <button class="action-button action-button-ghost action-button-small" data-preset-close="${e}" type="button">Close</button>
        </div>
        <p>No presets matched this training route.</p>
      `);return}const t=a.map((n,s)=>{const r=n.metadata??{},i=n.data??{};return`
        <article class="preset-card">
          <div class="preset-card-head">
            <div>
              <h4>${o(r.name||n.name||`Preset ${s+1}`)}</h4>
              <p class="preset-card-meta">
                ${o(String(r.version||"unknown"))}
                · ${o(String(r.author||"unknown author"))}
              </p>
            </div>
            <span class="coverage-pill coverage-pill-muted">${o(String(r.train_type||"shared"))}</span>
          </div>
          <p>${o(String(r.description||"No description"))}</p>
          <pre class="preset-preview">${o(JSON.stringify(i,null,2))}</pre>
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
      <div class="preset-list">${t}</div>
    `)}function ps(e,a){const t=new Set(e.presetTrainTypes);return a.filter(n=>{const r=(n.metadata??{}).train_type;return typeof r!="string"||r.trim().length===0?!0:t.has(r)})}function E(e,a,t){const n=document.querySelector(`#${e}-history-panel`),s=document.querySelector(`#${e}-presets-panel`);n&&(n.hidden=a==="history"?!t:!0),s&&(s.hidden=a==="presets"?!t:!0)}function us(e){var a;(a=document.querySelector(`#${e.prefix}-stop-train`))==null||a.addEventListener("click",async()=>{var t;try{const s=(((t=(await le()).data)==null?void 0:t.tasks)??[]).find(i=>String(i.status).toUpperCase()==="RUNNING");if(!s){k(e.prefix,"No running training task was found.","warning");return}const r=String(s.id??s.task_id??"");if(!r){k(e.prefix,"The running task does not expose an id.","error");return}if(!window.confirm(`Stop running task ${r}?`))return;await Be(r),S(e.prefix,"Training stop requested",`Sent terminate request for task ${r}.`,"warning"),k(e.prefix,`Terminate requested for task ${r}.`,"warning")}catch(n){k(e.prefix,n instanceof Error?n.message:"Failed to stop training.","error")}})}function hs(e,a,t){const n=document.querySelector(`#${e.prefix}-start-train`);n==null||n.addEventListener("click",async()=>{var r;const s=a();if(!s){S(e.prefix,"Editor not ready",`The ${e.modelLabel} schema editor state is not initialized yet.`,"error");return}n.setAttribute("disabled","true"),S(e.prefix,"Submitting training job...","Sending the current payload to /api/run.","idle");try{const i=t(s);if(i.checks.errors.length>0){S(e.prefix,"Fix parameter conflicts first",i.checks.errors.join(" "),"error"),ne(e.prefix,i.checks);return}const c=await Lt(i.payload);if(c.status==="success"){const l=[...i.checks.warnings,...((r=c.data)==null?void 0:r.warnings)??[]].join(" ");S(e.prefix,"Training request accepted",`${c.message||"Training started."}${l?` ${l}`:""}`,l?"warning":"success")}else S(e.prefix,"Training request failed",c.message||"Unknown backend failure.","error")}catch(i){S(e.prefix,"Training request failed",i instanceof Error?i.message:"Unknown network error.","error")}finally{n.removeAttribute("disabled")}})}function he(){return typeof window<"u"?window:null}function st(e,a){const t=he();if(!t)return a;try{const n=t.localStorage.getItem(e);return n?JSON.parse(n):a}catch{return a}}function nt(e,a){const t=he();t&&t.localStorage.setItem(e,JSON.stringify(a))}function rt(e){return`source-training-autosave-${e}`}function it(e){return`source-training-history-${e}`}function gs(e){return st(rt(e),null)}function ms(e,a){nt(rt(e),a)}function N(e){return st(it(e),[])}function M(e,a){nt(it(e),a)}function ot(e,a,t="text/plain;charset=utf-8"){const n=he();if(!n)return;const s=new Blob([a],{type:t}),r=URL.createObjectURL(s),i=n.document.createElement("a");i.href=r,i.download=e,i.click(),URL.revokeObjectURL(r)}function fs(e,a,t){var s;const n=N(e.routeId);n.unshift({time:new Date().toLocaleString(),name:at(e,a),value:W(a.values),gpu_ids:pe(`${e.prefix}-gpu-selector`)}),M(e.routeId,n.slice(0,40)),(s=document.querySelector(`#${e.prefix}-history-panel`))!=null&&s.hidden||t()}function bs(e,a,t,n){var s,r,i;(s=document.querySelector(`#${e.prefix}-download-config`))==null||s.addEventListener("click",()=>{const c=a();if(!c)return;const d=t(c);ot(`${e.prefix}-${Oe()}.toml`,Ma(d.payload)),k(e.prefix,"Exported current config as TOML.","success")}),(r=document.querySelector(`#${e.prefix}-import-config`))==null||r.addEventListener("click",()=>{var c;(c=document.querySelector(`#${e.prefix}-config-file-input`))==null||c.click()}),(i=document.querySelector(`#${e.prefix}-config-file-input`))==null||i.addEventListener("change",c=>{var g;const d=c.currentTarget,l=(g=d.files)==null?void 0:g[0];if(!l)return;const u=new FileReader;u.onload=()=>{try{const m=Ye(String(u.result??""));n(m),k(e.prefix,`Imported config: ${l.name}.`,"success")}catch(m){k(e.prefix,m instanceof Error?m.message:"Failed to import config.","error")}finally{d.value=""}},u.readAsText(l)})}function ys(e,a){var t;(t=document.querySelector(`#${e.prefix}-history-file-input`))==null||t.addEventListener("change",n=>{var c;const s=n.currentTarget,r=(c=s.files)==null?void 0:c[0];if(!r)return;const i=new FileReader;i.onload=()=>{try{const d=JSON.parse(String(i.result??""));if(!Array.isArray(d))throw new Error("History file must contain an array.");const l=d.filter(g=>g&&typeof g=="object"&&g.value&&typeof g.value=="object").map(g=>({time:String(g.time||new Date().toLocaleString()),name:g.name?String(g.name):void 0,value:W(g.value),gpu_ids:Array.isArray(g.gpu_ids)?g.gpu_ids.map(m=>String(m)):[]}));if(l.length===0)throw new Error("History file did not contain valid entries.");const u=[...N(e.routeId),...l].slice(0,80);M(e.routeId,u),a(),k(e.prefix,`Imported ${l.length} history entries.`,"success")}catch(d){k(e.prefix,d instanceof Error?d.message:"Failed to import history.","error")}finally{s.value=""}},i.readAsText(r)})}function vs(e){var g,m,b,_;const{config:a,createDefaultState:t,getCurrentState:n,mountTrainingState:s,onStateChange:r,applyEditableRecord:i,buildPreparedTrainingPayload:c,bindHistoryPanel:d,openHistoryPanel:l,openPresetPanel:u}=e;document.querySelectorAll(`#${a.prefix}-gpu-selector input[data-gpu-id]`).forEach($=>{$.addEventListener("change",()=>{const j=n();j&&r(j)})}),(g=document.querySelector(`#${a.prefix}-reset-all`))==null||g.addEventListener("click",()=>{const $=t();ue(a.prefix,[]),s($),k(a.prefix,"Reset to schema defaults.","warning")}),(m=document.querySelector(`#${a.prefix}-save-params`))==null||m.addEventListener("click",()=>{const $=n();$&&(fs(a,$,d),k(a.prefix,"Current parameters saved to history.","success"))}),(b=document.querySelector(`#${a.prefix}-read-params`))==null||b.addEventListener("click",()=>{l()}),(_=document.querySelector(`#${a.prefix}-load-presets`))==null||_.addEventListener("click",()=>{u()}),bs(a,n,c,i),ys(a,l),us(a),hs(a,n,c)}function ks(e,a){let t=null;const n=()=>{const c=N(e.routeId);cs(e.prefix,c),document.querySelectorAll(`#${e.prefix}-history-panel [data-history-close]`).forEach(d=>{d.addEventListener("click",()=>E(e.prefix,"history",!1))}),document.querySelectorAll(`#${e.prefix}-history-panel [data-history-export]`).forEach(d=>{d.addEventListener("click",()=>{ot(`${e.prefix}-history-${Oe()}.json`,JSON.stringify(N(e.routeId),null,2),"application/json;charset=utf-8"),k(e.prefix,"History exported.","success")})}),document.querySelectorAll(`#${e.prefix}-history-panel [data-history-import]`).forEach(d=>{d.addEventListener("click",()=>{var l;(l=document.querySelector(`#${e.prefix}-history-file-input`))==null||l.click()})}),document.querySelectorAll(`#${e.prefix}-history-panel [data-history-apply]`).forEach(d=>{d.addEventListener("click",()=>{const l=Number(d.dataset.historyApply??"-1"),u=N(e.routeId)[l];u&&(a(u.value,u.gpu_ids,"replace"),E(e.prefix,"history",!1),k(e.prefix,`Applied snapshot: ${u.name||"Unnamed snapshot"}.`,"success"))})}),document.querySelectorAll(`#${e.prefix}-history-panel [data-history-rename]`).forEach(d=>{d.addEventListener("click",()=>{const l=Number(d.dataset.historyRename??"-1"),u=N(e.routeId),g=u[l];if(!g)return;const m=window.prompt("Rename snapshot",g.name||"");m&&(g.name=m.trim(),M(e.routeId,u),n(),k(e.prefix,"Snapshot renamed.","success"))})}),document.querySelectorAll(`#${e.prefix}-history-panel [data-history-delete]`).forEach(d=>{d.addEventListener("click",()=>{const l=Number(d.dataset.historyDelete??"-1"),u=N(e.routeId),g=u[l];g&&window.confirm(`Delete snapshot "${g.name||"Unnamed snapshot"}"?`)&&(u.splice(l,1),M(e.routeId,u),n(),k(e.prefix,"Snapshot deleted.","success"))})})},s=()=>{n(),E(e.prefix,"history",!0)},r=()=>{ds(e.prefix,t??[]),document.querySelectorAll(`#${e.prefix}-presets-panel [data-preset-close]`).forEach(c=>{c.addEventListener("click",()=>E(e.prefix,"presets",!1))}),document.querySelectorAll(`#${e.prefix}-presets-panel [data-preset-apply]`).forEach(c=>{c.addEventListener("click",()=>{const d=Number(c.dataset.presetApply??"-1"),l=t==null?void 0:t[d];if(!l)return;const u=l.data??{};a(u,void 0,"merge"),E(e.prefix,"presets",!1),k(e.prefix,`Applied preset: ${String((l.metadata??{}).name||l.name||"preset")}.`,"success")})})};return{bindHistoryPanel:n,openHistoryPanel:s,openPresetPanel:async()=>{var c;if(!t)try{const d=await Re();t=ps(e,((c=d.data)==null?void 0:c.presets)??[])}catch(d){k(e.prefix,d instanceof Error?d.message:"Failed to load presets.","error");return}r(),E(e.prefix,"presets",!0)}}}async function _s(e){var c,d,l,u;const a=fa(e.prefix),[t,n]=await Promise.allSettled([oe(),qe()]);if(n.status==="fulfilled"){const g=((c=n.value.data)==null?void 0:c.cards)??[],m=(d=n.value.data)==null?void 0:d.xformers;Ua(`${e.prefix}-gpu-selector`,g),p(`${e.prefix}-runtime-title`,`${g.length} GPU entries reachable`),h(`${e.prefix}-runtime-body`,`
        <p>${o(Ue(g))}</p>
        <p>${o(m?`xformers: ${m.installed?"installed":"missing"}, ${m.supported?"supported":"fallback"} (${m.reason})`:"xformers info unavailable")}</p>
      `)}else p(`${e.prefix}-runtime-title`,"GPU runtime request failed"),p(`${e.prefix}-runtime-body`,n.reason instanceof Error?n.reason.message:"Unknown error");if(t.status!=="fulfilled")return p(a.summaryId,`${e.modelLabel} schema request failed`),h(a.sectionsId,`<p>${t.reason instanceof Error?o(t.reason.message):"Unknown error"}</p>`),D(a.previewId,"{}"),S(e.prefix,"Schema unavailable",`The ${e.modelLabel} training bridge could not load the backend schema.`,"error"),null;const s=((l=t.value.data)==null?void 0:l.schemas)??[],r=He(s),i=(u=X(r).find(g=>g.name===e.schemaName))==null?void 0:u.name;return i?{domIds:a,createDefaultState:()=>z(r,i)}:(p(a.summaryId,`No ${e.schemaName} schema was returned.`),h(a.sectionsId,`<p>The backend did not expose ${o(e.schemaName)}.</p>`),S(e.prefix,"Schema missing",`The backend did not expose the ${e.schemaName} schema.`,"error"),null)}const Ne={};function ws(e,a){const t=Me(a),n=pe(`${e}-gpu-selector`);n.length>0&&(t.gpu_ids=n);const s=et(t);return{payload:s,checks:os(s)}}function lt(e){return new Set(e.sections.flatMap(a=>a.fields.map(t=>t.path)))}function ct(e,a){const t=lt(e),n={...e.values};for(const[s,r]of Object.entries(a))t.has(s)&&(n[s]=r);return{...e,values:n}}function $s(e,a){return{...e,values:{...e.values,...Object.fromEntries(Object.entries(a).filter(([t])=>lt(e).has(t)))}}}function xs(e,a){return a&&a.length>0?a.map(t=>String(t)):Array.isArray(e.gpu_ids)?e.gpu_ids.map(t=>String(t)):[]}function Ss(e,a){ms(e.routeId,{time:new Date().toLocaleString(),name:at(e,a),value:W(a.values),gpu_ids:pe(`${e.prefix}-gpu-selector`)})}function Ts(e){const{config:a,createDefaultState:t,mountTrainingState:n}=e,s=gs(a.routeId),r=s!=null&&s.value?ct(t(),tt(s.value)):t();(s==null?void 0:s.gpu_ids)!==void 0&&ue(a.prefix,s.gpu_ids),n(r),s!=null&&s.value&&k(a.prefix,"Restored autosaved parameters for this route.","success")}function Ls(e,a,t,n){return s=>{try{const r=t(s),i=Object.fromEntries(Object.entries(r.payload).sort(([c],[d])=>c.localeCompare(d)));D(a.previewId,JSON.stringify(i,null,2)),ne(e.prefix,r.checks)}catch(r){D(a.previewId,"{}"),ne(e.prefix,{warnings:[],errors:[]},r instanceof Error?r.message:"The current state could not be converted into a launch payload.")}n(s)}}function Es(e,a,t){const n=()=>Ne[e.routeId],s=l=>ws(e.prefix,l),r=Ls(e,a,s,l=>Ss(e,l)),i=l=>{F(l,a,u=>{Ne[e.routeId]=u},r)};return{getCurrentState:n,prepareTrainingPayload:s,onStateChange:r,mountTrainingState:i,applyEditableRecord:(l,u,g="replace")=>{const m=g==="merge"?n()??t():t(),b=tt(l),_=g==="merge"?$s(m,b):ct(m,b);ue(e.prefix,xs(b,u)),i(_)},restoreAutosave:()=>Ts({config:e,createDefaultState:t,mountTrainingState:i})}}async function Ps(e){const a=await _s(e);if(!a)return;const t=Es(e,a.domIds,a.createDefaultState),n=ks(e,t.applyEditableRecord);t.restoreAutosave(),vs({config:e,createDefaultState:a.createDefaultState,getCurrentState:t.getCurrentState,mountTrainingState:t.mountTrainingState,onStateChange:t.onStateChange,applyEditableRecord:t.applyEditableRecord,buildPreparedTrainingPayload:t.prepareTrainingPayload,bindHistoryPanel:n.bindHistoryPanel,openHistoryPanel:n.openHistoryPanel,openPresetPanel:n.openPresetPanel}),S(e.prefix,`${e.modelLabel} bridge ready`,"You can review the generated payload and submit the current config to /api/run.","success"),E(e.prefix,"history",!1),E(e.prefix,"presets",!1)}const As={overview:We,about:va,settings:Pa,tasks:Ia,tageditor:Aa,tensorboard:Ca,tools:Na,"schema-bridge":$a,"sdxl-train":Ea,"flux-train":wa,"sd3-train":xa,"dreambooth-train":ka,"sd-controlnet-train":Sa,"sdxl-controlnet-train":Ta,"flux-controlnet-train":_a,"sdxl-lllite-train":La};function Is(e){const a={overview:q.filter(t=>t.section==="overview"),phase1:q.filter(t=>t.section==="phase1"),reference:q.filter(t=>t.section==="reference")};return`
    <div class="nav-group">
      <p class="nav-heading">Workspace</p>
      ${a.overview.map(t=>Z(t.hash,t.label,t.description,e)).join("")}
    </div>
    <div class="nav-group">
      <p class="nav-heading">Phase 1 Pages</p>
      ${a.phase1.map(t=>Z(t.hash,t.label,t.description,e)).join("")}
    </div>
    <div class="nav-group">
      <p class="nav-heading">Core Bridge</p>
      ${a.reference.map(t=>Z(t.hash,t.label,t.description,e)).join("")}
    </div>
  `}function Z(e,a,t,n){return`
    <a class="nav-link ${e===n?"is-active":""}" href="${e}">
      <span>${a}</span>
      <small>${t}</small>
    </a>
  `}async function Cs(e){e==="overview"?await Ot():e==="settings"?await Ft():e==="tasks"?await ta():e==="tageditor"?await zt():e==="tools"?await Vt():e==="schema-bridge"?await ba(()=>{}):Pe[e]&&await Ps(Pe[e])}async function Ns(e){Fa();const a=Oa(),t=As[a.id]??We;e.innerHTML=ya(a.hash,t());const n=document.querySelector("#side-nav");n&&(n.innerHTML=Is(a.hash)),await Cs(a.id)}const dt=document.querySelector("#app");if(!(dt instanceof HTMLElement))throw new Error("App root not found.");const Rs=dt;async function pt(){await Ns(Rs)}window.addEventListener("hashchange",()=>{pt()});pt();
