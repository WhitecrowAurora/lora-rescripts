var vt=Object.defineProperty;var kt=(e,t,a)=>t in e?vt(e,t,{enumerable:!0,configurable:!0,writable:!0,value:a}):e[t]=a;var x=(e,t,a)=>kt(e,typeof t!="symbol"?t+"":t,a);(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))s(n);new MutationObserver(n=>{for(const i of n)if(i.type==="childList")for(const r of i.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&s(r)}).observe(document,{childList:!0,subtree:!0});function a(n){const i={};return n.integrity&&(i.integrity=n.integrity),n.referrerPolicy&&(i.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?i.credentials="include":n.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function s(n){if(n.ep)return;n.ep=!0;const i=a(n);fetch(n.href,i)}})();const ue="".replace(/\/$/,"");async function L(e){const t=await fetch(`${ue}${e}`,{headers:{Accept:"application/json"}});if(!t.ok)throw new Error(`${t.status} ${t.statusText}`);return await t.json()}async function P(e,t){const a=await fetch(`${ue}${e}`,{method:"POST",headers:{Accept:"application/json","Content-Type":"application/json"},body:JSON.stringify(t)});if(!a.ok)throw new Error(`${a.status} ${a.statusText}`);return await a.json()}async function _t(e){const t=await fetch(`${ue}${e}`,{headers:{Accept:"application/json"}});if(!t.ok)throw new Error(`${t.status} ${t.statusText}`);return await t.json()}async function wt(){return L("/api/schemas/hashes")}async function pe(){return L("/api/schemas/all")}async function Ue(){return L("/api/presets")}async function xt(){return L("/api/config/saved_params")}async function $t(){return L("/api/config/summary")}async function he(){return L("/api/tasks")}async function Me(e){return L(`/api/tasks/terminate/${e}`)}async function Xe(){return L("/api/graphic_cards")}async function Ve(){return _t("/api/tageditor_status")}async function St(){return L("/api/scripts")}async function Tt(e){return P("/api/dataset/analyze",e)}async function Lt(e){return P("/api/dataset/masked_loss_audit",e)}async function Pt(){return L("/api/interrogators")}async function D(e){var a;const t=await L(`/api/pick_file?picker_type=${encodeURIComponent(e)}`);if(t.status!=="success"||!((a=t.data)!=null&&a.path))throw new Error(t.message||"File picker did not return a path.");return t.data.path}async function At(e){return P("/api/interrogate",e)}async function It(e){return P("/api/captions/cleanup/preview",e)}async function Et(e){return P("/api/captions/cleanup/apply",e)}async function Nt(e){return P("/api/captions/backups/create",e)}async function Rt(e){return P("/api/captions/backups/list",e)}async function Ct(e){return P("/api/captions/backups/restore",e)}async function Dt(e){return P("/api/run",e)}async function Bt(e){return P("/api/train/preflight",e)}async function qt(e){return P("/api/train/sample_prompt",e)}function u(e,t){const a=document.querySelector(`#${e}`);a&&(a.textContent=t)}function h(e,t){const a=document.querySelector(`#${e}`);a&&(a.innerHTML=t)}function F(e,t){const a=document.querySelector(`#${e}`);a&&(a.textContent=t)}const We=[{route:"index.html",title:"SD-reScripts | SD training UI",section:"core",status:"migrate-first",notes:"Landing page and main navigation entry. Good first candidate for source migration."},{route:"lora/index.html",title:"LoRA training index",section:"training",status:"migrate-first",notes:"Top-level training model selector page.",schemaHints:["shared"]},{route:"lora/sdxl.html",title:"SDXL LoRA training",section:"training",status:"migrate-first",notes:"Primary training page currently used most often.",schemaHints:["sdxl-lora","shared"]},{route:"lora/flux.html",title:"Flux LoRA training",section:"training",status:"migrate-first",notes:"Now mirrored by the shared source-side training bridge.",schemaHints:["flux-lora","shared"]},{route:"lora/sd3.html",title:"SD3 training",section:"training",status:"migrate-first",notes:"Now mirrored by the shared source-side training bridge.",schemaHints:["sd3-lora","shared"]},{route:"lora/controlnet.html",title:"SD ControlNet training",section:"training",status:"migrate-first",notes:"Now mirrored by the shared source-side training bridge.",schemaHints:["sd-controlnet","shared"]},{route:"lora/sdxl-controlnet.html",title:"SDXL ControlNet training",section:"training",status:"migrate-first",notes:"Now mirrored by the shared source-side training bridge.",schemaHints:["sdxl-controlnet","shared"]},{route:"lora/sdxl-lllite.html",title:"SDXL LLLite training",section:"training",status:"migrate-first",notes:"Specialized SDXL conditioning route now mirrored by the shared source-side bridge.",schemaHints:["sdxl-controlnet-lllite","shared"]},{route:"lora/flux-controlnet.html",title:"Flux ControlNet training",section:"training",status:"migrate-first",notes:"Now mirrored by the shared source-side training bridge.",schemaHints:["flux-controlnet","shared"]},{route:"lora/basic.html",title:"LoRA basic mode",section:"training",status:"legacy-dist",notes:"Legacy beginner-mode training route.",schemaHints:["lora-basic","shared"]},{route:"lora/master.html",title:"LoRA expert mode",section:"training",status:"legacy-dist",notes:"Legacy expert-mode training route.",schemaHints:["lora-master","shared"]},{route:"lora/params.html",title:"Training parameter reference",section:"training",status:"migrate-first",notes:"Mostly explanatory UI. Lower risk to recreate cleanly."},{route:"lora/tools.html",title:"LoRA tools",section:"tools",status:"migrate-first",notes:"Tool launcher route for merge, resize, interrogate and conversion flows."},{route:"dreambooth/index.html",title:"Dreambooth training",section:"training",status:"migrate-first",notes:"Now mirrored by the shared source-side training bridge for Dreambooth and SDXL full finetune.",schemaHints:["dreambooth","shared"]},{route:"tagger.html",title:"Tagger tool",section:"tools",status:"migrate-first",notes:"Standalone caption/tag generation route that talks to backend APIs.",schemaHints:["tagger"]},{route:"tageditor.html",title:"Tag editor proxy page",section:"tools",status:"migrate-first",notes:"Wrapper page with progress/failure states. Good candidate to reimplement cleanly."},{route:"task.html",title:"Task monitor",section:"system",status:"migrate-first",notes:"Task status page backed by /api/tasks."},{route:"tensorboard.html",title:"TensorBoard proxy page",section:"system",status:"migrate-first",notes:"Wrapper/proxy page. Safer than schema-heavy form routes."},{route:"other/settings.html",title:"Settings page",section:"system",status:"migrate-first",notes:"Static/system page that should be easy to recreate in source form."},{route:"other/about.html",title:"About page",section:"core",status:"migrate-first",notes:"Mostly branding and release notes. Best low-risk migration target."},{route:"404.html",title:"Fallback page",section:"core",status:"legacy-dist",notes:"Can be replaced after the main router is rebuilt."}];function l(e){return String(e).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;")}function Z(e){return JSON.parse(JSON.stringify(e))}function Ge(e=new Date){return e.toISOString().replaceAll(":","-").replaceAll(".","-")}function Ft(e){if(e.length===0){h("schema-browser","<p>No schemas returned.</p>");return}const t=e.map(a=>{var n;const s=((n=a.schema.split(/\r?\n/).find(i=>i.trim().length>0))==null?void 0:n.trim())||"No preview available.";return`
        <article class="schema-card">
          <div class="schema-head">
            <h3>${l(a.name)}</h3>
            <span class="schema-hash">${l(a.hash.slice(0,8))}</span>
          </div>
          <p>${l(s)}</p>
        </article>
      `}).join("");h("schema-browser",t)}function jt(e){const t=new Set(We.flatMap(i=>i.schemaHints??[])),a=new Set(e.map(i=>i.name)),s=[...t].filter(i=>a.has(i)).sort(),n=e.map(i=>i.name).filter(i=>!t.has(i)).sort();h("schema-mapped",s.length?s.map(i=>`<span class="coverage-pill">${l(i)}</span>`).join(""):"<p>No mapped schema hints yet.</p>"),h("schema-unmapped",n.length?n.map(i=>`<span class="coverage-pill coverage-pill-muted">${l(i)}</span>`).join(""):"<p>All schemas are represented in the current route hints.</p>")}function Ot(e){if(e.length===0){h("task-table-container","<p>No tasks currently tracked.</p>");return}const t=e.map(a=>`
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
    `)}function Ht(e){if(e.length===0){h("tools-browser","<p>No scripts returned.</p>");return}const t=e.map(a=>`
        <article class="tool-card">
          <div class="tool-card-head">
            <h3>${l(a.name)}</h3>
            <span class="coverage-pill ${a.category==="networks"?"":"coverage-pill-muted"}">${l(a.category)}</span>
          </div>
          <p>${a.positional_args.length>0?`Positional args: ${a.positional_args.map(s=>`<code>${l(s)}</code>`).join(", ")}`:"No positional args required."}</p>
        </article>
      `).join("");h("tools-browser",t)}function zt(e){const t=[{label:"Images",value:e.summary.image_count},{label:"Effective images",value:e.summary.effective_image_count},{label:"Alpha-capable candidates",value:e.summary.alpha_capable_image_count},{label:"Caption coverage",value:M(e.summary.caption_coverage)},{label:"Unique tags",value:e.summary.unique_tag_count},{label:"Caption files",value:e.summary.caption_file_count},{label:"Avg tags / caption",value:e.summary.average_tags_per_caption.toFixed(2)}],a=e.warnings.length?`
      <article class="dataset-analysis-block dataset-analysis-warning">
        <p class="panel-kicker">warnings</p>
        <ul class="dataset-analysis-list-plain">
          ${e.warnings.map(n=>`<li>${l(n)}</li>`).join("")}
        </ul>
      </article>
    `:"",s=e.folders.length?e.folders.map(n=>`
            <article class="dataset-analysis-block">
              <div class="tool-card-head">
                <h3>${l(n.name)}</h3>
                <span class="coverage-pill ${n.caption_coverage>=1?"":"coverage-pill-muted"}">
                  ${M(n.caption_coverage)}
                </span>
              </div>
              <p><code>${l(n.path)}</code></p>
              <p>
                Images: <strong>${n.image_count}</strong>
                · Effective: <strong>${n.effective_image_count}</strong>
                · Repeats: <strong>${n.repeats??1}</strong>
              </p>
              <p>Alpha-capable candidates: <strong>${n.alpha_capable_image_count}</strong></p>
              <p>
                Missing captions: <strong>${n.missing_caption_count}</strong>
                · Orphan captions: <strong>${n.orphan_caption_count}</strong>
                · Empty captions: <strong>${n.empty_caption_count}</strong>
              </p>
            </article>
          `).join(""):"<p>No dataset folder summary returned.</p>";h("dataset-analysis-results",`
      ${a}
      <section class="dataset-analysis-grid">
        ${t.map(n=>`
              <article class="dataset-analysis-stat">
                <span class="metric-label">${l(n.label)}</span>
                <strong class="dataset-analysis-stat-value">${l(n.value)}</strong>
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
          ${Ke(e.top_tags,"No caption tags found yet.")}
        </article>
        <article class="dataset-analysis-block">
          <p class="panel-kicker">images</p>
          <h3>Top resolutions</h3>
          ${te(e.top_resolutions,"No resolution data collected.")}
        </article>
        <article class="dataset-analysis-block">
          <p class="panel-kicker">mix</p>
          <h3>Orientation + formats</h3>
          <div>${te(e.orientation_counts,"No orientation data.")}</div>
          <div class="dataset-analysis-sublist">${te(e.image_extensions,"No image extension data.")}</div>
        </article>
      </section>
      <section class="dataset-analysis-columns">
        <article class="dataset-analysis-block">
          <p class="panel-kicker">folders</p>
          <h3>Per-folder coverage</h3>
          <div class="dataset-analysis-stack">${s}</div>
        </article>
        <article class="dataset-analysis-block">
          <p class="panel-kicker">samples</p>
          <h3>Quick path samples</h3>
          <div class="dataset-analysis-sublist">
            <h4>Missing captions</h4>
            ${T(e.samples.images_without_caption,"No missing-caption samples.")}
          </div>
          <div class="dataset-analysis-sublist">
            <h4>Orphan captions</h4>
            ${T(e.samples.orphan_captions,"No orphan-caption samples.")}
          </div>
          <div class="dataset-analysis-sublist">
            <h4>Broken images</h4>
            ${T(e.samples.broken_images,"No broken-image samples.")}
          </div>
        </article>
      </section>
    `)}function Ut(e,t="masked-loss-audit-results"){const a=[{label:"Images",value:e.summary.image_count},{label:"Alpha channel images",value:e.summary.alpha_channel_image_count},{label:"Usable masks",value:e.summary.usable_mask_image_count},{label:"Soft alpha masks",value:e.summary.soft_alpha_image_count},{label:"Binary alpha masks",value:e.summary.binary_alpha_image_count},{label:"Avg masked area",value:M(e.summary.average_mask_coverage)},{label:"Avg alpha weight",value:M(e.summary.average_alpha_weight)}],s=e.warnings.length?`
      <article class="dataset-analysis-block dataset-analysis-warning">
        <p class="panel-kicker">warnings</p>
        <ul class="dataset-analysis-list-plain">
          ${e.warnings.map(n=>`<li>${l(n)}</li>`).join("")}
        </ul>
      </article>
    `:"";h(t,`
      ${s}
      <section class="dataset-analysis-grid">
        ${a.map(n=>`
              <article class="dataset-analysis-stat">
                <span class="metric-label">${l(n.label)}</span>
                <strong class="dataset-analysis-stat-value">${l(n.value)}</strong>
              </article>
            `).join("")}
      </section>
      <section class="dataset-analysis-columns">
        <article class="dataset-analysis-block">
          <p class="panel-kicker">dataset</p>
          <h3>Alpha mask readiness</h3>
          <p><code>${l(e.root_path)}</code></p>
          <p>Recursive scan: <strong>${e.recursive?"yes":"no"}</strong></p>
          <p>No alpha channel: <strong>${e.summary.no_alpha_image_count}</strong></p>
          <p>Fully opaque alpha: <strong>${e.summary.fully_opaque_alpha_image_count}</strong></p>
          <p>Fully transparent: <strong>${e.summary.fully_transparent_image_count}</strong></p>
          <p>Broken images: <strong>${e.summary.broken_image_count}</strong></p>
        </article>
        <article class="dataset-analysis-block">
          <p class="panel-kicker">guidance</p>
          <h3>Training recommendations</h3>
          <ul class="dataset-analysis-list-plain">
            ${e.guidance.map(n=>`<li>${l(n)}</li>`).join("")}
          </ul>
        </article>
      </section>
      <section class="dataset-analysis-columns">
        <article class="dataset-analysis-block">
          <p class="panel-kicker">samples</p>
          <h3>Usable mask files</h3>
          ${T(e.samples.usable_masks,"No usable alpha-mask samples were found.")}
        </article>
        <article class="dataset-analysis-block">
          <p class="panel-kicker">samples</p>
          <h3>Soft alpha files</h3>
          ${T(e.samples.soft_alpha_masks,"No soft alpha-mask samples were found.")}
        </article>
        <article class="dataset-analysis-block">
          <p class="panel-kicker">samples</p>
          <h3>Opaque alpha files</h3>
          ${T(e.samples.fully_opaque_alpha,"No fully opaque alpha-channel samples were found.")}
        </article>
        <article class="dataset-analysis-block">
          <p class="panel-kicker">samples</p>
          <h3>No alpha files</h3>
          ${T(e.samples.no_alpha,"No non-alpha samples were captured.")}
        </article>
      </section>
    `)}function Mt(e,t="caption-cleanup-results"){const a=[{label:"Caption files",value:e.summary.file_count},{label:"Changed",value:e.summary.changed_file_count},{label:"Unchanged",value:e.summary.unchanged_file_count},{label:"Tag instances removed",value:e.summary.removed_tag_instances},{label:"Tag instances added",value:e.summary.added_tag_instances},{label:"Empty results",value:e.summary.empty_result_count}],s=e.warnings.length?`
      <article class="dataset-analysis-block dataset-analysis-warning">
        <p class="panel-kicker">warnings</p>
        <ul class="dataset-analysis-list-plain">
          ${e.warnings.map(i=>`<li>${l(i)}</li>`).join("")}
        </ul>
      </article>
    `:"",n=e.samples.length?e.samples.map(i=>`
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
                ${T(i.removed_tags,"No explicit tag removals in sample.")}
              </div>
              <div class="dataset-analysis-sublist">
                <h4>Added tags</h4>
                ${T(i.added_tags,"No explicit tag additions in sample.")}
              </div>
            </article>
          `).join(""):"<p>No sample caption changes were captured.</p>";h(t,`
      ${s}
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
          ${Ke([e.options.dedupe_tags?{name:"dedupe tags",count:1}:null,e.options.sort_tags?{name:"sort tags",count:1}:null,e.options.use_regex?{name:"regex replace",count:1}:null].filter(Boolean),"No boolean cleanup switches enabled.")}
          <div class="dataset-analysis-sublist">
            <h4>Remove tags</h4>
            ${T(e.options.remove_tags,"No exact tags configured for removal.")}
          </div>
          <div class="dataset-analysis-sublist">
            <h4>Prepend tags</h4>
            ${T(e.options.prepend_tags,"No prepend tags configured.")}
          </div>
          <div class="dataset-analysis-sublist">
            <h4>Append tags</h4>
            ${T(e.options.append_tags,"No append tags configured.")}
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
          <div class="dataset-analysis-stack">${n}</div>
        </article>
      </section>
    `)}function Xt(e,t,a="caption-backup-results"){if(!e.length){h(a,`
        <article class="dataset-analysis-block">
          <p class="panel-kicker">snapshots</p>
          <h3>No caption snapshots found</h3>
          <p>Create the first backup for this folder to get a restore point before cleanup or tagging.</p>
        </article>
      `);return}const s=e.map(n=>`
        <article class="dataset-analysis-block ${n.archive_name===t?"dataset-analysis-selected":""}">
          <div class="tool-card-head">
            <h3>${l(n.snapshot_name)}</h3>
            <span class="coverage-pill ${n.archive_name===t?"":"coverage-pill-muted"}">
              ${l(n.archive_name)}
            </span>
          </div>
          <p><code>${l(n.source_root)}</code></p>
          <p>Created: <strong>${l(n.created_at||"unknown")}</strong></p>
          <p>Caption files: <strong>${n.file_count}</strong> · Archive size: <strong>${Wt(n.archive_size)}</strong></p>
          <p>Extension: <code>${l(n.caption_extension||".txt")}</code> · Recursive: <strong>${n.recursive?"yes":"no"}</strong></p>
        </article>
      `).join("");h(a,`<div class="dataset-analysis-stack">${s}</div>`)}function Vt(e,t="caption-backup-results"){const a=e.warnings.length?`
      <article class="dataset-analysis-block dataset-analysis-warning">
        <p class="panel-kicker">warnings</p>
        <ul class="dataset-analysis-list-plain">
          ${e.warnings.map(s=>`<li>${l(s)}</li>`).join("")}
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
    `)}function Ke(e,t){return e.length?`
    <div class="coverage-list">
      ${e.map(a=>`<span class="coverage-pill">${l(a.name)} <strong>${a.count}</strong></span>`).join("")}
    </div>
  `:`<p>${l(t)}</p>`}function te(e,t){return e.length?`
    <ul class="dataset-analysis-list-plain">
      ${e.map(a=>`<li><code>${l(a.name)}</code> <strong>${a.count}</strong></li>`).join("")}
    </ul>
  `:`<p>${l(t)}</p>`}function T(e,t){return e.length?`
    <ul class="dataset-analysis-list-plain">
      ${e.map(a=>`<li><code>${l(a)}</code></li>`).join("")}
    </ul>
  `:`<p>${l(t)}</p>`}function M(e){return`${(e*100).toFixed(1)}%`}function Wt(e){return e<1024?`${e} B`:e<1024**2?`${(e/1024).toFixed(1)} KB`:e<1024**3?`${(e/1024**2).toFixed(1)} MB`:`${(e/1024**3).toFixed(2)} GB`}function Je(e){return e.length===0?"No cards reported yet.":e.map((t,a)=>`GPU ${t.index??t.id??a}: ${t.name}`).join(" | ")}function Gt(e){if(e.length===0)return"No tasks currently tracked.";const t=e.filter(a=>a.status&&!["FINISHED","TERMINATED","FAILED"].includes(String(a.status))).length;return`${e.length} tracked, ${t} active`}function Kt(e){var a;const t=(a=e.detail)==null?void 0:a.trim();return t?`${e.status} - ${t}`:e.status}async function Jt(){var c,d,o,p,m,b;const e=await Promise.allSettled([wt(),Ue(),he(),Xe(),Ve(),pe()]),[t,a,s,n,i,r]=e;if(t.status==="fulfilled"){const g=((c=t.value.data)==null?void 0:c.schemas)??[];u("diag-schemas-title",`${g.length} schema hashes loaded`),u("diag-schemas-detail",g.slice(0,4).map(k=>k.name).join(", ")||"No schema names returned.")}else u("diag-schemas-title","Schema hash request failed"),u("diag-schemas-detail",t.reason instanceof Error?t.reason.message:"Unknown error");if(a.status==="fulfilled"){const g=((d=a.value.data)==null?void 0:d.presets)??[];u("diag-presets-title",`${g.length} presets loaded`),u("diag-presets-detail","Source migration can reuse preset grouping later.")}else u("diag-presets-title","Preset request failed"),u("diag-presets-detail",a.reason instanceof Error?a.reason.message:"Unknown error");if(s.status==="fulfilled"){const g=((o=s.value.data)==null?void 0:o.tasks)??[];u("diag-tasks-title","Task manager reachable"),u("diag-tasks-detail",Gt(g))}else u("diag-tasks-title","Task request failed"),u("diag-tasks-detail",s.reason instanceof Error?s.reason.message:"Unknown error");if(n.status==="fulfilled"){const g=((p=n.value.data)==null?void 0:p.cards)??[],k=(m=n.value.data)==null?void 0:m.xformers,$=k?`xformers: ${k.installed?"installed":"missing"}, ${k.supported?"supported":"fallback"}`:"xformers info unavailable";u("diag-gpu-title",`${g.length} GPU entries reachable`),u("diag-gpu-detail",`${Je(g)} | ${$}`)}else u("diag-gpu-title","GPU request failed"),u("diag-gpu-detail",n.reason instanceof Error?n.reason.message:"Unknown error");if(i.status==="fulfilled"?(u("diag-tageditor-title","Tag editor status reachable"),u("diag-tageditor-detail",Kt(i.value))):(u("diag-tageditor-title","Tag editor status request failed"),u("diag-tageditor-detail",i.reason instanceof Error?i.reason.message:"Unknown error")),r.status==="fulfilled"){const g=((b=r.value.data)==null?void 0:b.schemas)??[];Ft(g),jt(g)}else h("schema-browser",`<p>${r.reason instanceof Error?r.reason.message:"Schema inventory request failed."}</p>`)}async function Yt(){const[e,t]=await Promise.allSettled([$t(),xt()]);if(e.status==="fulfilled"){const a=e.value.data;u("settings-summary-title",`${(a==null?void 0:a.saved_param_count)??0} remembered param groups`),h("settings-summary-body",`
        <p><strong>Config file:</strong> <code>${l((a==null?void 0:a.config_path)??"unknown")}</code></p>
        <p><strong>Last path:</strong> <code>${l((a==null?void 0:a.last_path)||"(empty)")}</code></p>
        <p><strong>Saved keys:</strong> ${((a==null?void 0:a.saved_param_keys)??[]).map(s=>`<code>${l(s)}</code>`).join(", ")||"none"}</p>
      `)}else u("settings-summary-title","Config summary request failed"),u("settings-summary-body",e.reason instanceof Error?e.reason.message:"Unknown error");if(t.status==="fulfilled"){const a=t.value.data??{},s=Object.keys(a);u("settings-params-title",`${s.length} saved param entries`),h("settings-params-body",s.length?`<div class="coverage-list">${s.map(n=>`<span class="coverage-pill coverage-pill-muted">${l(n)}</span>`).join("")}</div>`:"<p>No saved params returned.</p>")}else u("settings-params-title","Saved params request failed"),u("settings-params-body",t.reason instanceof Error?t.reason.message:"Unknown error")}const Zt="".replace(/\/$/,""),Qt=Zt||"";function I(e){return/^https?:\/\//.test(e)?e:(e.startsWith("/")||(e=`/${e}`),`${Qt}${e}`)}async function ea(){try{const e=await Ve();u("tag-editor-status-title",`Current status: ${e.status}`),h("tag-editor-status-body",`
        <p>${l(e.detail||"No extra detail returned.")}</p>
        <p><a class="text-link" href="${I("/tageditor.html")}" target="_blank" rel="noreferrer">Open current shipped wrapper page</a></p>
      `)}catch(e){u("tag-editor-status-title","Tag editor status request failed"),u("tag-editor-status-body",e instanceof Error?e.message:"Unknown error")}}async function ta(){var e;na(),aa(),await sa(),ia(),ra();try{const a=((e=(await St()).data)==null?void 0:e.scripts)??[];u("tools-summary-title",`${a.length} launcher scripts available`),h("tools-summary-body",`
        <p>Categories: ${[...new Set(a.map(s=>s.category))].map(s=>`<code>${l(s)}</code>`).join(", ")}</p>
        <p>The tools workspace now includes dataset analysis, masked-loss alpha inspection, batch auto-tagging, caption cleanup, and caption restore snapshots, with more curated high-frequency flows still planned.</p>
      `),Ht(a)}catch(t){u("tools-summary-title","Script inventory request failed"),u("tools-summary-body",t instanceof Error?t.message:"Unknown error"),h("tools-browser","<p>Tool inventory failed to load.</p>")}}function aa(){const e=la();e&&(e.browseButton.addEventListener("click",async()=>{u("masked-loss-audit-status","Opening folder picker...");try{e.pathInput.value=await D("folder"),u("masked-loss-audit-status","Folder selected. Ready to inspect alpha masks.")}catch(t){u("masked-loss-audit-status",t instanceof Error?t.message:"Folder picker failed.")}}),e.runButton.addEventListener("click",()=>{we(e)}),e.pathInput.addEventListener("keydown",t=>{t.key==="Enter"&&(t.preventDefault(),we(e))}))}function na(){const e=oa();e&&(e.browseButton.addEventListener("click",async()=>{u("dataset-analysis-status","Opening folder picker...");try{e.pathInput.value=await D("folder"),u("dataset-analysis-status","Folder selected. Ready to analyze.")}catch(t){u("dataset-analysis-status",t instanceof Error?t.message:"Folder picker failed.")}}),e.runButton.addEventListener("click",()=>{_e(e)}),e.pathInput.addEventListener("keydown",t=>{t.key==="Enter"&&(t.preventDefault(),_e(e))}))}async function sa(){var t;const e=ca();if(e){e.browseButton.addEventListener("click",async()=>{u("batch-tagger-status","Opening folder picker...");try{e.pathInput.value=await D("folder"),u("batch-tagger-status","Folder selected. Ready to launch batch tagging.")}catch(a){u("batch-tagger-status",a instanceof Error?a.message:"Folder picker failed.")}}),e.runButton.addEventListener("click",()=>{xe(e)}),e.pathInput.addEventListener("keydown",a=>{a.key==="Enter"&&(a.preventDefault(),xe(e))});try{const a=await Pt(),s=((t=a.data)==null?void 0:t.interrogators)??[];if(!s.length)throw new Error("No interrogator models returned.");e.modelSelect.innerHTML=s.map(n=>{var c;const i=n.is_default||n.name===((c=a.data)==null?void 0:c.default)?" selected":"",r=n.kind==="cl"?"CL":"WD";return`<option value="${l(n.name)}"${i}>${l(n.name)} (${r})</option>`}).join(""),u("batch-tagger-status",`Loaded ${s.length} interrogator models.`)}catch(a){e.modelSelect.innerHTML='<option value="wd14-convnextv2-v2">wd14-convnextv2-v2 (WD)</option>',u("batch-tagger-status",a instanceof Error?a.message:"Failed to load interrogator inventory."),h("batch-tagger-results",`<article class="dataset-analysis-block dataset-analysis-warning"><p>${l(a instanceof Error?a.message:"Failed to load interrogator inventory.")}</p></article>`)}}}function ia(){const e=da();e&&(e.browseButton.addEventListener("click",async()=>{u("caption-cleanup-status","Opening folder picker...");try{e.pathInput.value=await D("folder"),u("caption-cleanup-status","Folder selected. Ready to preview cleanup.")}catch(t){u("caption-cleanup-status",t instanceof Error?t.message:"Folder picker failed.")}}),e.previewButton.addEventListener("click",()=>{ae(e,"preview")}),e.applyButton.addEventListener("click",()=>{ae(e,"apply")}),e.pathInput.addEventListener("keydown",t=>{t.key==="Enter"&&(t.preventDefault(),ae(e,"preview"))}))}function ra(){const e=ua();e&&(e.browseButton.addEventListener("click",async()=>{u("caption-backup-status","Opening folder picker...");try{e.pathInput.value=await D("folder"),u("caption-backup-status","Folder selected. Refreshing snapshots..."),await O(e)}catch(t){u("caption-backup-status",t instanceof Error?t.message:"Folder picker failed.")}}),e.refreshButton.addEventListener("click",()=>{O(e)}),e.createButton.addEventListener("click",()=>{pa(e)}),e.restoreButton.addEventListener("click",()=>{ha(e)}),e.selectInput.addEventListener("change",()=>{O(e,e.selectInput.value||null)}))}function oa(){const e=document.querySelector("#dataset-analysis-path"),t=document.querySelector("#dataset-analysis-caption-extension"),a=document.querySelector("#dataset-analysis-top-tags"),s=document.querySelector("#dataset-analysis-sample-limit"),n=document.querySelector("#dataset-analysis-pick"),i=document.querySelector("#dataset-analysis-run");return!e||!t||!a||!s||!n||!i?null:{pathInput:e,captionExtensionInput:t,topTagsInput:a,sampleLimitInput:s,browseButton:n,runButton:i}}function la(){const e=document.querySelector("#masked-loss-audit-path"),t=document.querySelector("#masked-loss-audit-sample-limit"),a=document.querySelector("#masked-loss-audit-recursive"),s=document.querySelector("#masked-loss-audit-pick"),n=document.querySelector("#masked-loss-audit-run");return!e||!t||!a||!s||!n?null:{pathInput:e,sampleLimitInput:t,recursiveInput:a,browseButton:s,runButton:n}}function ca(){const e=document.querySelector("#batch-tagger-path"),t=document.querySelector("#batch-tagger-model"),a=document.querySelector("#batch-tagger-threshold"),s=document.querySelector("#batch-tagger-character-threshold"),n=document.querySelector("#batch-tagger-conflict"),i=document.querySelector("#batch-tagger-additional-tags"),r=document.querySelector("#batch-tagger-backup-name"),c=document.querySelector("#batch-tagger-exclude-tags"),d=document.querySelector("#batch-tagger-recursive"),o=document.querySelector("#batch-tagger-replace-underscore"),p=document.querySelector("#batch-tagger-escape-tag"),m=document.querySelector("#batch-tagger-add-rating-tag"),b=document.querySelector("#batch-tagger-add-model-tag"),g=document.querySelector("#batch-tagger-auto-backup"),k=document.querySelector("#batch-tagger-pick"),$=document.querySelector("#batch-tagger-run");return!e||!t||!a||!s||!n||!i||!r||!c||!d||!o||!p||!m||!b||!g||!k||!$?null:{pathInput:e,modelSelect:t,thresholdInput:a,characterThresholdInput:s,conflictSelect:n,additionalTagsInput:i,backupNameInput:r,excludeTagsInput:c,recursiveInput:d,replaceUnderscoreInput:o,escapeTagInput:p,addRatingTagInput:m,addModelTagInput:b,autoBackupInput:g,browseButton:k,runButton:$}}function da(){const e=document.querySelector("#caption-cleanup-path"),t=document.querySelector("#caption-cleanup-extension"),a=document.querySelector("#caption-cleanup-remove-tags"),s=document.querySelector("#caption-cleanup-prepend-tags"),n=document.querySelector("#caption-cleanup-append-tags"),i=document.querySelector("#caption-cleanup-search-text"),r=document.querySelector("#caption-cleanup-replace-text"),c=document.querySelector("#caption-cleanup-backup-name"),d=document.querySelector("#caption-cleanup-sample-limit"),o=document.querySelector("#caption-cleanup-recursive"),p=document.querySelector("#caption-cleanup-collapse-whitespace"),m=document.querySelector("#caption-cleanup-replace-underscore"),b=document.querySelector("#caption-cleanup-dedupe-tags"),g=document.querySelector("#caption-cleanup-sort-tags"),k=document.querySelector("#caption-cleanup-use-regex"),$=document.querySelector("#caption-cleanup-auto-backup"),j=document.querySelector("#caption-cleanup-pick"),ve=document.querySelector("#caption-cleanup-preview"),ke=document.querySelector("#caption-cleanup-apply");return!e||!t||!a||!s||!n||!i||!r||!c||!d||!o||!p||!m||!b||!g||!k||!$||!j||!ve||!ke?null:{pathInput:e,extensionInput:t,removeTagsInput:a,prependTagsInput:s,appendTagsInput:n,searchTextInput:i,replaceTextInput:r,backupNameInput:c,sampleLimitInput:d,recursiveInput:o,collapseWhitespaceInput:p,replaceUnderscoreInput:m,dedupeTagsInput:b,sortTagsInput:g,useRegexInput:k,autoBackupInput:$,browseButton:j,previewButton:ve,applyButton:ke}}function ua(){const e=document.querySelector("#caption-backup-path"),t=document.querySelector("#caption-backup-extension"),a=document.querySelector("#caption-backup-name"),s=document.querySelector("#caption-backup-select"),n=document.querySelector("#caption-backup-recursive"),i=document.querySelector("#caption-backup-pre-restore"),r=document.querySelector("#caption-backup-pick"),c=document.querySelector("#caption-backup-create"),d=document.querySelector("#caption-backup-refresh"),o=document.querySelector("#caption-backup-restore");return!e||!t||!a||!s||!n||!i||!r||!c||!d||!o?null:{pathInput:e,extensionInput:t,nameInput:a,selectInput:s,recursiveInput:n,preRestoreInput:i,browseButton:r,createButton:c,refreshButton:d,restoreButton:o}}async function _e(e){const t=e.pathInput.value.trim();if(!t){u("dataset-analysis-status","Pick a dataset folder first."),h("dataset-analysis-results",'<p class="dataset-analysis-empty">No folder selected yet.</p>');return}e.browseButton.disabled=!0,e.runButton.disabled=!0,u("dataset-analysis-status","Analyzing dataset..."),h("dataset-analysis-results",'<p class="dataset-analysis-empty">Scanning images, captions, and tags...</p>');try{const a=await Tt({path:t,caption_extension:e.captionExtensionInput.value.trim()||".txt",top_tags:X(e.topTagsInput.value,40),sample_limit:X(e.sampleLimitInput.value,8)});if(a.status!=="success"||!a.data)throw new Error(a.message||"Dataset analysis returned no data.");u("dataset-analysis-status",`Scanned ${a.data.summary.image_count} images across ${a.data.summary.dataset_folder_count} dataset folder(s).`),zt(a.data)}catch(a){u("dataset-analysis-status",a instanceof Error?a.message:"Dataset analysis failed."),h("dataset-analysis-results",`<article class="dataset-analysis-block dataset-analysis-warning"><p>${l(a instanceof Error?a.message:"Dataset analysis failed.")}</p></article>`)}finally{e.browseButton.disabled=!1,e.runButton.disabled=!1}}async function we(e){const t=e.pathInput.value.trim();if(!t){u("masked-loss-audit-status","Pick a dataset folder first."),h("masked-loss-audit-results",'<p class="dataset-analysis-empty">No dataset folder selected yet.</p>');return}e.browseButton.disabled=!0,e.runButton.disabled=!0,u("masked-loss-audit-status","Inspecting alpha-channel masks..."),h("masked-loss-audit-results",'<p class="dataset-analysis-empty">Opening images and checking their alpha channels...</p>');try{const a=await Lt({path:t,recursive:e.recursiveInput.checked,sample_limit:X(e.sampleLimitInput.value,8)});if(a.status!=="success"||!a.data)throw new Error(a.message||"Masked-loss audit returned no data.");u("masked-loss-audit-status",`Inspected ${a.data.summary.image_count} images. Found ${a.data.summary.usable_mask_image_count} image(s) with usable alpha masks.`),Ut(a.data)}catch(a){u("masked-loss-audit-status",a instanceof Error?a.message:"Masked-loss audit failed."),h("masked-loss-audit-results",`<article class="dataset-analysis-block dataset-analysis-warning"><p>${l(a instanceof Error?a.message:"Masked-loss audit failed.")}</p></article>`)}finally{e.browseButton.disabled=!1,e.runButton.disabled=!1}}async function xe(e){var a,s,n;const t=e.pathInput.value.trim();if(!t){u("batch-tagger-status","Pick an image folder first."),h("batch-tagger-results",'<p class="dataset-analysis-empty">No image folder selected yet.</p>');return}e.browseButton.disabled=!0,e.runButton.disabled=!0,u("batch-tagger-status","Starting batch tagging..."),h("batch-tagger-results",'<p class="dataset-analysis-empty">Submitting interrogator job to the backend...</p>');try{const i=$e(e.thresholdInput.value,.35,0,1),r=$e(e.characterThresholdInput.value,.6,0,1),c=await At({path:t,interrogator_model:e.modelSelect.value,threshold:i,character_threshold:r,batch_output_action_on_conflict:e.conflictSelect.value,create_backup_before_write:e.autoBackupInput.checked,backup_snapshot_name:e.backupNameInput.value.trim(),additional_tags:e.additionalTagsInput.value.trim(),exclude_tags:e.excludeTagsInput.value.trim(),batch_input_recursive:e.recursiveInput.checked,replace_underscore:e.replaceUnderscoreInput.checked,escape_tag:e.escapeTagInput.checked,add_rating_tag:e.addRatingTagInput.checked,add_model_tag:e.addModelTagInput.checked});if(c.status!=="success")throw new Error(c.message||"Batch tagging failed to start.");u("batch-tagger-status",c.message||"Batch tagging started."),h("batch-tagger-results",`
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
          ${(n=(s=c.data)==null?void 0:s.warnings)!=null&&n.length?`<p>${l(c.data.warnings.join(" "))}</p>`:""}
          <p>The backend runs this in the background. Watch the console output and inspect generated <code>.txt</code> files in the dataset folder.</p>
        </article>
      `)}catch(i){u("batch-tagger-status",i instanceof Error?i.message:"Batch tagging failed."),h("batch-tagger-results",`<article class="dataset-analysis-block dataset-analysis-warning"><p>${l(i instanceof Error?i.message:"Batch tagging failed.")}</p></article>`)}finally{e.browseButton.disabled=!1,e.runButton.disabled=!1}}async function ae(e,t){const a=e.pathInput.value.trim();if(!a){u("caption-cleanup-status","Pick a caption folder first."),h("caption-cleanup-results",'<p class="dataset-analysis-empty">No caption folder selected yet.</p>');return}const s={path:a,caption_extension:e.extensionInput.value.trim()||".txt",recursive:e.recursiveInput.checked,collapse_whitespace:e.collapseWhitespaceInput.checked,replace_underscore:e.replaceUnderscoreInput.checked,dedupe_tags:e.dedupeTagsInput.checked,sort_tags:e.sortTagsInput.checked,remove_tags:e.removeTagsInput.value.trim(),prepend_tags:e.prependTagsInput.value.trim(),append_tags:e.appendTagsInput.value.trim(),search_text:e.searchTextInput.value,replace_text:e.replaceTextInput.value,use_regex:e.useRegexInput.checked,create_backup_before_apply:e.autoBackupInput.checked,backup_snapshot_name:e.backupNameInput.value.trim(),sample_limit:X(e.sampleLimitInput.value,8)};e.browseButton.disabled=!0,e.previewButton.disabled=!0,e.applyButton.disabled=!0,u("caption-cleanup-status",t==="preview"?"Previewing caption cleanup...":"Applying caption cleanup..."),h("caption-cleanup-results",`<p class="dataset-analysis-empty">${t==="preview"?"Scanning caption files and building sample diffs...":"Writing cleaned captions back to disk..."}</p>`);try{const n=t==="preview"?await It(s):await Et(s);if(n.status!=="success"||!n.data)throw new Error(n.message||`Caption cleanup ${t} failed.`);u("caption-cleanup-status",n.message||(t==="preview"?`Previewed ${n.data.summary.changed_file_count} caption file changes.`:`Applied cleanup to ${n.data.summary.changed_file_count} caption files.`)),Mt(n.data)}catch(n){u("caption-cleanup-status",n instanceof Error?n.message:"Caption cleanup failed."),h("caption-cleanup-results",`<article class="dataset-analysis-block dataset-analysis-warning"><p>${l(n instanceof Error?n.message:"Caption cleanup failed.")}</p></article>`)}finally{e.browseButton.disabled=!1,e.previewButton.disabled=!1,e.applyButton.disabled=!1}}async function O(e,t,a=!0){var n,i;const s=e.pathInput.value.trim();if(!s){u("caption-backup-status","Pick a caption folder first."),h("caption-backup-results",'<p class="dataset-analysis-empty">No caption folder selected yet.</p>'),e.selectInput.innerHTML='<option value="">Refresh snapshots for this folder</option>';return}e.browseButton.disabled=!0,e.createButton.disabled=!0,e.refreshButton.disabled=!0,e.restoreButton.disabled=!0,u("caption-backup-status","Loading caption snapshots...");try{const c=((n=(await Rt({path:s})).data)==null?void 0:n.backups)??[],d=e.selectInput.value||(((i=c[0])==null?void 0:i.archive_name)??""),o=t??d;e.selectInput.innerHTML=c.length?c.map(p=>{const m=p.archive_name===o?" selected":"";return`<option value="${l(p.archive_name)}"${m}>${l(p.snapshot_name)} · ${l(p.archive_name)}</option>`}).join(""):'<option value="">No snapshots for this folder yet</option>',c.length&&o&&(e.selectInput.value=o),u("caption-backup-status",c.length?`Loaded ${c.length} caption snapshots.`:"No caption snapshots found for this folder."),a&&Xt(c,c.length?o:null)}catch(r){u("caption-backup-status",r instanceof Error?r.message:"Failed to load caption snapshots."),h("caption-backup-results",`<article class="dataset-analysis-block dataset-analysis-warning"><p>${l(r instanceof Error?r.message:"Failed to load caption snapshots.")}</p></article>`)}finally{e.browseButton.disabled=!1,e.createButton.disabled=!1,e.refreshButton.disabled=!1,e.restoreButton.disabled=!1}}async function pa(e){const t=e.pathInput.value.trim();if(!t){u("caption-backup-status","Pick a caption folder first."),h("caption-backup-results",'<p class="dataset-analysis-empty">No caption folder selected yet.</p>');return}e.browseButton.disabled=!0,e.createButton.disabled=!0,e.refreshButton.disabled=!0,e.restoreButton.disabled=!0,u("caption-backup-status","Creating caption snapshot...");try{const a=await Nt({path:t,caption_extension:e.extensionInput.value.trim()||".txt",recursive:e.recursiveInput.checked,snapshot_name:e.nameInput.value.trim()});if(a.status!=="success"||!a.data)throw new Error(a.message||"Caption snapshot creation failed.");u("caption-backup-status",a.message||`Created ${a.data.archive_name}`),e.nameInput.value="",await O(e,a.data.archive_name)}catch(a){u("caption-backup-status",a instanceof Error?a.message:"Caption snapshot creation failed."),h("caption-backup-results",`<article class="dataset-analysis-block dataset-analysis-warning"><p>${l(a instanceof Error?a.message:"Caption snapshot creation failed.")}</p></article>`)}finally{e.browseButton.disabled=!1,e.createButton.disabled=!1,e.refreshButton.disabled=!1,e.restoreButton.disabled=!1}}async function ha(e){const t=e.pathInput.value.trim(),a=e.selectInput.value;if(!t){u("caption-backup-status","Pick a caption folder first."),h("caption-backup-results",'<p class="dataset-analysis-empty">No caption folder selected yet.</p>');return}if(!a){u("caption-backup-status","Select a snapshot to restore.");return}if(window.confirm(`Restore caption snapshot ${a} into this folder?

This overwrites matching caption files from the snapshot.`)){e.browseButton.disabled=!0,e.createButton.disabled=!0,e.refreshButton.disabled=!0,e.restoreButton.disabled=!0,u("caption-backup-status","Restoring caption snapshot..."),h("caption-backup-results",'<p class="dataset-analysis-empty">Writing snapshot files back to the folder...</p>');try{const n=await Ct({path:t,archive_name:a,make_restore_backup:e.preRestoreInput.checked});if(n.status!=="success"||!n.data)throw new Error(n.message||"Caption snapshot restore failed.");u("caption-backup-status",n.message||`Restored ${n.data.restored_file_count} caption files.`),Vt(n.data),await O(e,a,!1)}catch(n){u("caption-backup-status",n instanceof Error?n.message:"Caption snapshot restore failed."),h("caption-backup-results",`<article class="dataset-analysis-block dataset-analysis-warning"><p>${l(n instanceof Error?n.message:"Caption snapshot restore failed.")}</p></article>`)}finally{e.browseButton.disabled=!1,e.createButton.disabled=!1,e.refreshButton.disabled=!1,e.restoreButton.disabled=!1}}}function X(e,t){const a=Number.parseInt(e,10);return Number.isNaN(a)||a<1?t:a}function $e(e,t,a,s){const n=Number.parseFloat(e);return Number.isNaN(n)?t:Math.min(Math.max(n,a),s)}async function re(){var e;try{const t=await he();Ot(((e=t.data)==null?void 0:e.tasks)??[]),document.querySelectorAll("[data-task-terminate]").forEach(a=>{a.addEventListener("click",async()=>{const s=a.dataset.taskTerminate;if(s){a.setAttribute("disabled","true");try{await Me(s)}finally{await re()}}})})}catch(t){h("task-table-container",`<p>${t instanceof Error?l(t.message):"Task request failed."}</p>`)}}async function ma(){const e=document.querySelector("#refresh-tasks");e==null||e.addEventListener("click",()=>{re()}),await re()}class _{constructor(t){x(this,"kind");x(this,"descriptionText");x(this,"defaultValue");x(this,"roleName");x(this,"roleConfig");x(this,"minValue");x(this,"maxValue");x(this,"stepValue");x(this,"disabledFlag",!1);x(this,"requiredFlag",!1);x(this,"literalValue");x(this,"options",[]);x(this,"fields",{});x(this,"itemType");this.kind=t}description(t){return this.descriptionText=t,this}default(t){return this.defaultValue=t,this}role(t,a){return this.roleName=typeof t=="string"?t:"custom",this.roleConfig=a??t,this}min(t){return this.minValue=t,this}max(t){return this.maxValue=t,this}step(t){return this.stepValue=t,this}required(){return this.requiredFlag=!0,this}disabled(){return this.disabledFlag=!0,this}}function B(e){if(e instanceof _)return e;if(e===String)return new _("string");if(e===Number)return new _("number");if(e===Boolean)return new _("boolean");if(typeof e=="string"||typeof e=="number"||typeof e=="boolean"){const t=new _("const");return t.literalValue=e,t.defaultValue=e,t}if(Array.isArray(e)){const t=new _("union");return t.options=e.map(a=>B(a)),t}if(e&&typeof e=="object"){const t=new _("object");return t.fields=Object.fromEntries(Object.entries(e).map(([a,s])=>[a,B(s)])),t}return new _("string")}function ga(){return{string(){return new _("string")},number(){return new _("number")},boolean(){return new _("boolean")},const(e){const t=new _("const");return t.literalValue=e,t.defaultValue=e,t},union(e){const t=new _("union");return t.options=e.map(a=>B(a)),t},intersect(e){const t=new _("intersect");return t.options=e.map(a=>B(a)),t},object(e){const t=new _("object");return t.fields=Object.fromEntries(Object.entries(e).map(([a,s])=>[a,B(s)])),t},array(e){const t=new _("array");return t.itemType=B(e),t}}}function fa(e,t,a){const s={...e,...t};for(const n of a??[])delete s[n];return s}function Se(e,t){const a=ga();return new Function("Schema","UpdateSchema","SHARED_SCHEMAS","String","Number","Boolean","source",'"use strict"; return eval(source);')(a,fa,t??{},String,Number,Boolean,e)}function Ye(e){const t=e.find(n=>n.name==="shared"),s=(t?Se(t.schema,null):{})||{};return e.map(n=>({name:n.name,hash:n.hash,source:n.schema,runtime:n.name==="shared"?s:Se(n.schema,s)}))}function Te(e,t=""){return Object.entries(e).map(([a,s])=>({name:a,path:t?`${t}.${a}`:a,schema:s})).filter(a=>a.schema.kind!=="const"||!a.schema.requiredFlag)}function Le(e){return Object.entries(e).filter(([,t])=>t.kind==="const"&&t.requiredFlag).map(([t,a])=>`${t} = ${String(a.literalValue)}`)}function Pe(e){return Object.fromEntries(Object.entries(e).filter(([,t])=>t.kind==="const"&&t.requiredFlag).map(([t,a])=>[t,a.literalValue]))}function oe(e,t,a){if(e.kind==="intersect"){e.options.forEach((s,n)=>oe(s,`${t}-i${n}`,a));return}if(e.kind==="object"){const s=Te(e.fields);s.length>0&&a.push({id:t,title:e.descriptionText||"Unnamed section",fields:s,conditions:Le(e.fields),constants:Pe(e.fields)});return}e.kind==="union"&&e.options.forEach((s,n)=>{if(s.kind==="object"){const i=Te(s.fields);i.length>0&&a.push({id:`${t}-u${n}`,title:s.descriptionText||e.descriptionText||`Conditional branch ${n+1}`,fields:i,conditional:!0,conditions:Le(s.fields),constants:Pe(s.fields)})}else oe(s,`${t}-u${n}`,a)})}function ba(e){const t=[];return oe(e,"section",t),t}function ya(e){const t={};for(const a of e){a.conditional||Object.assign(t,a.constants);for(const s of a.fields)s.schema.defaultValue!==void 0?t[s.path]=s.schema.defaultValue:s.schema.kind==="boolean"?t[s.path]=!1:t[s.path]=""}return t}function Ze(e,t){return e.conditional?Object.entries(e.constants).every(([a,s])=>t[a]===s):!0}function va(e,t){const a={...t};for(const s of e){if(Ze(s,t)){Object.assign(a,s.constants);continue}for(const n of s.fields)delete a[n.path]}return a}function me(e){return`field-${e.replaceAll(/[^a-zA-Z0-9_-]/g,"-")}`}function ka(e){if(e.kind!=="union")return null;const t=e.options.filter(a=>a.kind==="const").map(a=>a.literalValue).filter(a=>typeof a=="string"||typeof a=="number"||typeof a=="boolean");return t.length!==e.options.length?null:t}function _a(e,t){if(!e.roleConfig||typeof e.roleConfig!="object"||Array.isArray(e.roleConfig))return;const a=e.roleConfig[t];return typeof a=="string"?a:void 0}function le(e){return Array.isArray(e)?e.map(t=>String(t??"")):typeof e=="string"&&e.length>0?e.split(/\r?\n/):[]}function wa(e,t,a){const s=le(t),n=s.length>0?s:[""],i=me(e.path);return`
    <div class="table-editor" data-table-path="${l(e.path)}">
      <div class="table-editor-rows">
        ${n.map((r,c)=>`
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
  `}function xa(e,t){const a=e.schema,s=me(e.path),n=l(e.path),i=ka(a),r=a.disabledFlag?"disabled":"",c=a.roleName||"";if(a.kind==="boolean")return`
      <label class="checkbox-row" for="${s}">
        <input id="${s}" data-field-path="${n}" data-field-kind="boolean" type="checkbox" ${t?"checked":""} ${r} />
        <span>${a.defaultValue===!0?"default on":"toggle"}</span>
      </label>
    `;if(a.kind==="array"){if(c==="table")return wa(e,t,r);const d=Array.isArray(t)?t.join(`
`):"";return`<textarea id="${s}" class="field-input field-textarea" data-field-path="${n}" data-field-kind="array" ${r}>${l(d)}</textarea>`}if(i){const d=i.map(o=>`<option value="${l(o)}" ${String(o)===String(t)?"selected":""}>${l(o)}</option>`).join("");return`<select id="${s}" class="field-input" data-field-path="${n}" data-field-kind="enum" ${r}>${d}</select>`}if(a.kind==="number"){const d=a.minValue!==void 0?`min="${a.minValue}"`:"",o=a.maxValue!==void 0?`max="${a.maxValue}"`:"",p=a.stepValue!==void 0?`step="${a.stepValue}"`:'step="any"';if(c==="slider"&&a.minValue!==void 0&&a.maxValue!==void 0){const m=t===""||t===void 0||t===null?a.defaultValue??a.minValue:t;return`
        <div class="slider-editor">
          <input
            class="field-slider"
            data-field-path="${n}"
            data-field-kind="number"
            data-slider-role="range"
            type="range"
            value="${l(m)}"
            ${d}
            ${o}
            ${p}
            ${r}
          />
          <div class="slider-editor-footer">
            <input
              id="${s}"
              class="field-input slider-number-input"
              data-field-path="${n}"
              data-field-kind="number"
              data-slider-role="number"
              type="number"
              value="${l(m)}"
              ${d}
              ${o}
              ${p}
              ${r}
            />
            <span class="slider-value" data-slider-value-for="${n}">${l(m)}</span>
          </div>
        </div>
      `}return`<input id="${s}" class="field-input" data-field-path="${n}" data-field-kind="number" type="number" value="${l(t)}" ${d} ${o} ${p} ${r} />`}if(c==="textarea")return`<textarea id="${s}" class="field-input field-textarea" data-field-path="${n}" data-field-kind="string" ${r}>${l(t)}</textarea>`;if(c==="filepicker"){const d=_a(a,"type")??(e.path.endsWith("_dir")||e.path==="resume"?"folder":"model-file");return`
      <div class="picker-control">
        <div class="picker-row">
          <input
            id="${s}"
            class="field-input"
            data-field-path="${n}"
            data-field-kind="string"
            type="text"
            value="${l(t)}"
            ${r}
          />
          <button
            class="action-button action-button-ghost picker-button"
            data-picker-path="${n}"
            data-picker-type="${l(d)}"
            type="button"
            ${r}
          >
            Browse
          </button>
        </div>
        <p class="picker-status" data-picker-status-for="${n}">
          Uses the backend native ${d==="folder"?"folder":"file"} picker.
        </p>
      </div>
    `}return a.kind==="const"?`<div class="field-readonly"><code>${l(a.literalValue??t)}</code></div>`:`<input id="${s}" class="field-input" data-field-path="${n}" data-field-kind="string" type="text" value="${l(t)}" ${r} />`}function $a(e,t){const a=e.schema,s=[`<span class="mini-badge">${l(a.kind)}</span>`,a.roleName?`<span class="mini-badge mini-badge-muted">${l(a.roleName)}</span>`:"",a.requiredFlag?'<span class="mini-badge mini-badge-accent">required</span>':"",a.disabledFlag?'<span class="mini-badge mini-badge-muted">disabled</span>':""].filter(Boolean).join(""),n=[a.minValue!==void 0?`min ${a.minValue}`:"",a.maxValue!==void 0?`max ${a.maxValue}`:"",a.stepValue!==void 0?`step ${a.stepValue}`:""].filter(Boolean).join(" · ");return`
    <article class="field-card">
      <div class="field-card-head">
        <div>
          <label class="field-label" for="${me(e.path)}">${l(e.name)}</label>
          <p class="field-path">${l(e.path)}</p>
        </div>
        <div class="mini-badge-row">${s}</div>
      </div>
      <p class="field-description">${l(a.descriptionText||"No description")}</p>
      ${xa(e,t)}
      <div class="field-meta">
        <span><strong>Default:</strong> ${l(a.defaultValue??"(none)")}</span>
        ${n?`<span><strong>Constraints:</strong> ${l(n)}</span>`:""}
      </div>
    </article>
  `}function Qe(e){return e.sections.filter(t=>Ze(t,e.values))}function et(e){return va(e.sections,e.values)}function Sa(e,t){const a=Qe(e);if(a.length===0){h(t,"<p>No renderable sections extracted from this schema.</p>");return}const s=a.map(n=>{const i=n.fields.map(c=>$a(c,e.values[c.path])).join(""),r=n.conditions.length?`<div class="condition-list">${n.conditions.map(c=>`<span class="coverage-pill coverage-pill-muted">${l(c)}</span>`).join("")}</div>`:"";return`
        <article class="panel schema-section-card">
          <div class="schema-section-head">
            <div>
              <p class="panel-kicker">${n.conditional?"conditional section":"section"}</p>
              <h3>${l(n.title)}</h3>
            </div>
            <span class="coverage-pill">${n.fields.length} fields</span>
          </div>
          ${r}
          <div class="field-grid">
            ${i}
          </div>
        </article>
      `}).join("");h(t,s)}function ce(e,t){const a=Object.fromEntries(Object.entries(et(e)).sort(([s],[n])=>s.localeCompare(n)));F(t,JSON.stringify(a,null,2))}function Q(e){return e.filter(t=>t.name!=="shared"&&t.runtime instanceof _)}function Ae(e,t){const a=e.schema;if(a.kind==="boolean")return!!t;if(a.kind==="number"){const s=String(t).trim();if(s==="")return"";const n=Number(s);return Number.isNaN(n)?"":n}return a.kind==="array"?String(t).split(/\r?\n/).map(s=>s.trim()).filter(Boolean):t}function Ie(e,t){return e.sections.flatMap(a=>a.fields).find(a=>a.path===t)}function Ta(e,t){return[...e.querySelectorAll('[data-field-kind="table-row"]')].filter(a=>a.dataset.fieldPath===t).map(a=>a.value.trim()).filter(Boolean)}function Ee(e,t,a,s){const n=String(a??"");e.querySelectorAll("[data-field-path]").forEach(i=>{if(!(i===s||i.dataset.fieldPath!==t||i.dataset.fieldKind==="table-row")){if(i instanceof HTMLInputElement&&i.type==="checkbox"){i.checked=!!a;return}i.value=n}}),e.querySelectorAll("[data-slider-value-for]").forEach(i=>{i.dataset.sliderValueFor===t&&(i.textContent=n)})}function ne(e,t,a,s="idle"){e.querySelectorAll("[data-picker-status-for]").forEach(n=>{n.dataset.pickerStatusFor===t&&(n.textContent=a,n.classList.remove("is-success","is-error"),s==="success"?n.classList.add("is-success"):s==="error"&&n.classList.add("is-error"))})}function La(e,t,a,s){const n=document.querySelector(`#${t.sectionsId}`);if(!n)return;const i=new Set(e.sections.flatMap(r=>r.conditional?Object.keys(r.constants):[]));n.querySelectorAll("[data-field-path]").forEach(r=>{const c=r.dataset.fieldKind,d=r instanceof HTMLInputElement&&r.type==="checkbox"||r instanceof HTMLSelectElement?"change":"input";r.addEventListener(d,()=>{const o=r.dataset.fieldPath;if(!o)return;const p=Ie(e,o);if(p){if(c==="table-row")e.values[o]=Ta(n,o);else{const m=r instanceof HTMLInputElement&&r.type==="checkbox"?r.checked:r.value;e.values[o]=Ae(p,m),Ee(n,o,e.values[o],r)}if(i.has(o)){s({...e,values:{...e.values}});return}ce(e,t.previewId),a(e)}})}),n.querySelectorAll("[data-table-add]").forEach(r=>{r.addEventListener("click",()=>{const c=r.dataset.tableAdd;c&&(e.values[c]=[...le(e.values[c]),""],s({...e,values:{...e.values}}))})}),n.querySelectorAll("[data-table-remove]").forEach(r=>{r.addEventListener("click",()=>{const c=r.dataset.tableRemove,d=Number(r.dataset.tableIndex??"-1");if(!c||d<0)return;const o=le(e.values[c]).filter((p,m)=>m!==d);e.values[c]=o,s({...e,values:{...e.values}})})}),n.querySelectorAll("[data-picker-path]").forEach(r=>{r.addEventListener("click",async()=>{const c=r.dataset.pickerPath,d=r.dataset.pickerType||"model-file";if(!c)return;const o=Ie(e,c);if(o){r.setAttribute("disabled","true"),ne(n,c,"Waiting for native picker...","idle");try{const p=await D(d);if(e.values[c]=Ae(o,p),Ee(n,c,e.values[c]),ne(n,c,p,"success"),i.has(c)){s({...e,values:{...e.values}});return}ce(e,t.previewId),a(e)}catch(p){ne(n,c,p instanceof Error?p.message:"The picker failed to return a value.","error")}finally{r.removeAttribute("disabled")}}})})}function V(e,t){const a=Q(e).find(n=>n.name===t);if(!a||!(a.runtime instanceof _))return null;const s=ba(a.runtime);return{catalog:e,selectedName:t,sections:s,values:ya(s)}}function H(e,t,a,s){if(a(e),!e){u(t.summaryId,"Failed to build schema bridge state."),h(t.sectionsId,"<p>Schema bridge failed to initialize.</p>"),F(t.previewId,"{}");return}const i=Q(e.catalog).map(o=>`<option value="${l(o.name)}" ${o.name===e.selectedName?"selected":""}>${l(o.name)}</option>`).join(""),r=Qe(e);h(t.selectId,i),u(t.summaryId,`${e.selectedName} · ${r.length}/${e.sections.length} visible sections · ${r.reduce((o,p)=>o+p.fields.length,0)} visible fields`),Sa(e,t.sectionsId),ce(e,t.previewId);const c=document.querySelector(`#${t.selectId}`);c&&(c.onchange=()=>{const o=V(e.catalog,c.value);H(o,t,a,s)});const d=document.querySelector(`#${t.resetId}`);d&&(d.onclick=()=>{H(V(e.catalog,e.selectedName),t,a,s)}),La(e,t,s,o=>H(o,t,a,s)),s(e)}const Pa={selectId:"schema-select",summaryId:"schema-summary",sectionsId:"schema-sections",previewId:"schema-preview",resetId:"schema-reset"};function Aa(e){return{selectId:`${e}-schema-select`,summaryId:`${e}-summary`,sectionsId:`${e}-sections`,previewId:`${e}-preview`,resetId:`${e}-reset`}}async function Ia(e){var t,a,s;try{const i=((t=(await pe()).data)==null?void 0:t.schemas)??[],r=Ye(i),c=Q(r),d=((a=c.find(o=>o.name==="sdxl-lora"))==null?void 0:a.name)??((s=c[0])==null?void 0:s.name);if(!d){u("schema-summary","No selectable schemas were returned."),h("schema-sections","<p>No schema runtime available.</p>");return}H(V(r,d),Pa,e,()=>{})}catch(n){u("schema-summary","Schema bridge request failed"),h("schema-sections",`<p>${n instanceof Error?l(n.message):"Unknown error"}</p>`),F("schema-preview","{}")}}function Ea(e,t){return`
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
  `}function E(e,t,a){return`
    <section class="page-hero panel">
      <p class="eyebrow">${e}</p>
      <h2>${t}</h2>
      <p class="lede">${a}</p>
    </section>
  `}function Ne(e,t,a="module"){return`
    <article class="panel info-card">
      <p class="panel-kicker">${a}</p>
      <h3>${e}</h3>
      <div>${t}</div>
    </article>
  `}function Na(){return`
    ${E("about","A clean source-side replacement for the current about page","This page is one of the safest migration targets because it is mostly branding, release context and ownership notes.")}
    <section class="two-column">
      ${Ne("Project identity",`
          <p><strong>Product name:</strong> SD-reScripts</p>
          <p><strong>Version target:</strong> v1.0.2</p>
          <p><strong>Lineage:</strong> Fork from 秋葉 aaaki/lora-scripts</p>
          <p><strong>Maintainer:</strong> Modify By Lulynx</p>
        `,"brand")}
      ${Ne("Why migrate this page first",`
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
      <p><a class="text-link" href="${I("/other/about.html")}" target="_blank" rel="noreferrer">Open current shipped about page</a></p>
    </section>
  `}function w(e){return`
    ${E(e.heroKicker,e.heroTitle,e.heroLede)}
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
            <p><a class="text-link" href="${I(e.legacyPath)}" target="_blank" rel="noreferrer">${e.legacyLabel}</a></p>
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
        <button id="${e.prefix}-export-preset" class="action-button action-button-ghost" type="button">Export preset</button>
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
  `}function Ra(){return w({prefix:"anima-finetune",heroKicker:"anima finetune",heroTitle:"Anima finetune source training page",heroLede:"This route exposes the Anima finetune schema so the source-side bridge covers both LoRA and full finetune variants for that trainer family.",runnerTitle:"Anima finetune source-side runner",startButtonLabel:"Start Anima finetune",legacyPath:"/lora/anima-finetune.html",legacyLabel:"Open current shipped Anima finetune page",renderedTitle:"Anima finetune form bridge"})}function Ca(){return w({prefix:"anima",heroKicker:"anima lora",heroTitle:"Anima LoRA source training page",heroLede:"This route surfaces the Anima LoRA schema on the shared training bridge instead of forcing that capability to stay hidden behind the shipped legacy page.",runnerTitle:"Anima LoRA source-side runner",startButtonLabel:"Start Anima LoRA training",legacyPath:"/lora/anima.html",legacyLabel:"Open current shipped Anima LoRA page",renderedTitle:"Anima LoRA form bridge"})}function Da(){return w({prefix:"dreambooth",heroKicker:"dreambooth train",heroTitle:"Dreambooth source training page",heroLede:"This route brings the Dreambooth and SDXL full-finetune schema into the same source-side training bridge so we can migrate one of the last big non-LoRA training paths cleanly.",runnerTitle:"Dreambooth source-side runner",startButtonLabel:"Start Dreambooth training",legacyPath:"/dreambooth/",legacyLabel:"Open current shipped Dreambooth page",renderedTitle:"Dreambooth form bridge"})}function Ba(){return w({prefix:"flux-controlnet",heroKicker:"flux controlnet",heroTitle:"Flux ControlNet source training page",heroLede:"This route reuses the same source-side training bridge for Flux ControlNet so the DiT-family conditioning workflow stays aligned with the current backend schema and payload rules.",runnerTitle:"Flux ControlNet source-side runner",startButtonLabel:"Start Flux ControlNet training",legacyPath:"/lora/flux-controlnet.html",legacyLabel:"Open current shipped Flux ControlNet page",renderedTitle:"Flux ControlNet form bridge"})}function qa(){return w({prefix:"flux-finetune",heroKicker:"flux finetune",heroTitle:"Flux finetune source training page",heroLede:"This route exposes the dedicated Flux full-finetune schema on the same source-side training bridge so recipe shaping, preflight and launch behavior stay consistent.",runnerTitle:"Flux finetune source-side runner",startButtonLabel:"Start Flux finetune",legacyPath:"/lora/flux-finetune.html",legacyLabel:"Open current shipped Flux finetune page",renderedTitle:"Flux finetune form bridge"})}function Fa(){return w({prefix:"flux",heroKicker:"flux train",heroTitle:"Flux LoRA source training page",heroLede:"This route reuses the source-side training bridge for Flux so we can keep payload shaping, compatibility checks and launch behavior aligned with the current backend.",runnerTitle:"Flux source-side runner",startButtonLabel:"Start Flux training",legacyPath:"/lora/flux.html",legacyLabel:"Open current shipped Flux page",renderedTitle:"Flux form bridge"})}function ja(){return w({prefix:"hunyuan-image",heroKicker:"hunyuan image",heroTitle:"Hunyuan Image LoRA source training page",heroLede:"This route exposes the Hunyuan Image LoRA schema so newer image trainer families live on the same source-side bridge instead of staying legacy-only.",runnerTitle:"Hunyuan Image source-side runner",startButtonLabel:"Start Hunyuan Image training",legacyPath:"/lora/hunyuan.html",legacyLabel:"Open current shipped Hunyuan Image page",renderedTitle:"Hunyuan Image form bridge"})}function Oa(){return w({prefix:"lumina-finetune",heroKicker:"lumina finetune",heroTitle:"Lumina finetune source training page",heroLede:"This route exposes Lumina finetune on the shared source-side bridge so finetune-specific payloads can use the same autosave, preflight and launch safety checks.",runnerTitle:"Lumina finetune source-side runner",startButtonLabel:"Start Lumina finetune",legacyPath:"/lora/lumina-finetune.html",legacyLabel:"Open current shipped Lumina finetune page",renderedTitle:"Lumina finetune form bridge"})}function Ha(){return w({prefix:"lumina",heroKicker:"lumina lora",heroTitle:"Lumina LoRA source training page",heroLede:"This route exposes the Lumina LoRA schema on the shared bridge so newer trainer families are available without falling back to older UI entry points.",runnerTitle:"Lumina LoRA source-side runner",startButtonLabel:"Start Lumina LoRA training",legacyPath:"/lora/lumina.html",legacyLabel:"Open current shipped Lumina LoRA page",renderedTitle:"Lumina LoRA form bridge"})}function za(){return`
    ${E("schema bridge","Source-side schema explorer and prototype form bridge","This page evaluates the current schema DSL in the browser and turns it into sections, fields and editable defaults. It is the first direct bridge between the new source workspace and the training form core.")}
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
  `}function Ua(){return w({prefix:"sd3-finetune",heroKicker:"sd3 finetune",heroTitle:"SD3 finetune source training page",heroLede:"This route brings the dedicated SD3 finetune schema into the shared source-side bridge so parameter normalization and runtime checks stay aligned with the backend.",runnerTitle:"SD3 finetune source-side runner",startButtonLabel:"Start SD3 finetune",legacyPath:"/lora/sd3-finetune.html",legacyLabel:"Open current shipped SD3 finetune page",renderedTitle:"SD3 finetune form bridge"})}function Ma(){return w({prefix:"sd3",heroKicker:"sd3 train",heroTitle:"SD3 LoRA source training page",heroLede:"This route extends the same source-side training bridge to SD3 so we can keep the fast-moving schema-driven trainer paths on one shared foundation.",runnerTitle:"SD3 source-side runner",startButtonLabel:"Start SD3 training",legacyPath:"/lora/sd3.html",legacyLabel:"Open current shipped SD3 page",renderedTitle:"SD3 form bridge"})}function Xa(){return w({prefix:"sd-controlnet",heroKicker:"sd controlnet",heroTitle:"SD ControlNet source training page",heroLede:"This route extends the shared source-side training bridge to the SD1.x / SD2.x ControlNet workflow so conditioning-dataset training can migrate without another bespoke form stack.",runnerTitle:"SD ControlNet source-side runner",startButtonLabel:"Start SD ControlNet training",legacyPath:"/lora/controlnet.html",legacyLabel:"Open current shipped SD ControlNet page",renderedTitle:"SD ControlNet form bridge"})}function Va(){return w({prefix:"sd-ti",heroKicker:"sd textual inversion",heroTitle:"SD textual inversion source training page",heroLede:"This route exposes the standard SD textual inversion schema through the shared training bridge, so embeddings can use the same source-side autosave, preflight and launch workflow.",runnerTitle:"SD textual inversion source-side runner",startButtonLabel:"Start SD textual inversion",legacyPath:"/lora/ti.html",legacyLabel:"Open current shipped SD textual inversion page",renderedTitle:"SD textual inversion form bridge"})}function Wa(){return w({prefix:"sdxl-controlnet",heroKicker:"sdxl controlnet",heroTitle:"SDXL ControlNet source training page",heroLede:"This route keeps the SDXL ControlNet training path on the same source-side schema bridge, normalized payload builder and launch pipeline as the main LoRA routes.",runnerTitle:"SDXL ControlNet source-side runner",startButtonLabel:"Start SDXL ControlNet training",legacyPath:"/lora/sdxl-controlnet.html",legacyLabel:"Open current shipped SDXL ControlNet page",renderedTitle:"SDXL ControlNet form bridge"})}function Ga(){return w({prefix:"sdxl-lllite",heroKicker:"sdxl lllite",heroTitle:"SDXL LLLite source training page",heroLede:"This route keeps the SDXL ControlNet-LLLite path on the shared source-side training bridge so even the more specialized conditioning flow no longer needs its own one-off migration path.",runnerTitle:"SDXL LLLite source-side runner",startButtonLabel:"Start SDXL LLLite training",legacyPath:"/lora/sdxl-lllite.html",legacyLabel:"Open current shipped SDXL LLLite page",renderedTitle:"SDXL LLLite form bridge"})}function Ka(){return w({prefix:"sdxl-ti",heroKicker:"sdxl textual inversion",heroTitle:"SDXL textual inversion source training page",heroLede:"This route exposes SDXL textual inversion through the same source-side training bridge, so embeddings, prompt helpers and launch safety checks stay unified.",runnerTitle:"SDXL textual inversion source-side runner",startButtonLabel:"Start SDXL textual inversion",legacyPath:"/lora/sdxl-ti.html",legacyLabel:"Open current shipped SDXL textual inversion page",renderedTitle:"SDXL textual inversion form bridge"})}function Ja(){return w({prefix:"sdxl",heroKicker:"sdxl train",heroTitle:"First source-side SDXL training page",heroLede:"This is the first page that moves beyond passive inspection: it renders the SDXL schema, tracks a real config model and can submit to the current training backend.",runnerTitle:"SDXL source-side runner",startButtonLabel:"Start SDXL training",legacyPath:"/lora/sdxl.html",legacyLabel:"Open current shipped SDXL page",renderedTitle:"SDXL form bridge"})}function Ya(){return`
    ${E("settings","Source-side settings page prototype","This route is now close to live backend config data, so we can rebuild it before touching the schema-heavy training forms.")}
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
      <p><a class="text-link" href="${I("/other/settings.html")}" target="_blank" rel="noreferrer">Open current shipped settings page</a></p>
    </section>
  `}function Za(){return`
    ${E("tag editor","Tag editor wrapper migration page","The current shipped page is mostly a wrapper around startup state and proxy behavior. That makes it a good low-risk source-side rewrite.")}
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
          <p><a class="text-link" href="${I("/tageditor.html")}" target="_blank" rel="noreferrer">Open current shipped tag editor wrapper</a></p>
        </div>
      </article>
    </section>
  `}function Qa(){return`
    ${E("tasks","Task monitor migration page","This route is already talking to the real backend task manager, so it is a strong candidate for early source migration.")}
    <section class="panel task-panel">
      <div class="task-toolbar">
        <button id="refresh-tasks" class="action-button" type="button">Refresh tasks</button>
        <a class="text-link task-legacy-link" href="${I("/task.html")}" target="_blank" rel="noreferrer">Open current shipped task page</a>
      </div>
      <div id="task-table-container" class="task-table-container loading">Loading tasks...</div>
    </section>
  `}function en(){return`
    ${E("tensorboard","TensorBoard wrapper migration page","This page can be rebuilt without touching training forms because it mainly needs status text and a proxy destination.")}
    <section class="two-column">
      <article class="panel info-card">
        <p class="panel-kicker">proxy</p>
        <h3>Legacy backend path</h3>
        <div>
          <p>The current runtime proxies TensorBoard through <code>/proxy/tensorboard/</code>.</p>
          <p>This source-side page can later offer a cleaner iframe or open-in-new-tab flow.</p>
          <p><a class="text-link" href="${I("/proxy/tensorboard/")}" target="_blank" rel="noreferrer">Open current TensorBoard proxy</a></p>
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
  `}function tn(){return`
    ${E("tools","Tools workspace","This route now covers both raw script launching and the first reusable dataset utility, so it can grow into a real preflight toolbox instead of staying a placeholder.")}
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
          <p class="panel-kicker">alpha</p>
          <h2>Masked loss assistant</h2>
          <p class="section-note">Inspect whether your dataset actually contains usable alpha masks, and get concrete guidance on when to enable <code>alpha_mask</code> versus <code>masked_loss</code>.</p>
        </div>
      </div>
      <div class="tool-form-grid">
        <label class="tool-field tool-field-wide">
          <span>Dataset folder</span>
          <div class="tool-inline-actions">
            <input id="masked-loss-audit-path" class="field-input" type="text" placeholder="Select a dataset folder to inspect alpha masks" />
            <button id="masked-loss-audit-pick" class="action-button action-button-ghost" type="button">Browse</button>
            <button id="masked-loss-audit-run" class="action-button" type="button">Inspect</button>
          </div>
        </label>
        <label class="tool-field">
          <span>Sample paths</span>
          <input id="masked-loss-audit-sample-limit" class="field-input" type="number" value="8" min="1" max="50" step="1" />
        </label>
      </div>
      <div class="tool-toggle-grid">
        <label class="tool-toggle"><input id="masked-loss-audit-recursive" type="checkbox" checked /> Recursive scan subfolders</label>
      </div>
      <p id="masked-loss-audit-status" class="section-note">Check whether alpha-channel images in this dataset would really contribute to masked-loss training.</p>
      <div id="masked-loss-audit-results" class="dataset-analysis-empty">
        This audit looks past file extensions and checks whether images actually carry useful alpha values instead of fully opaque channels.
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
      <p><a class="text-link" href="${I("/tageditor.html")}" target="_blank" rel="noreferrer">Open current shipped tag editor wrapper</a></p>
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
      <p><a class="text-link" href="${I("/lora/tools.html")}" target="_blank" rel="noreferrer">Open current shipped tools page</a></p>
      <div id="tools-browser" class="tools-browser loading">Loading available scripts...</div>
    </section>
  `}const an=[{method:"GET",path:"/api/schemas/all",purpose:"Fetch all schema definitions used to render training forms.",migrationPriority:"high"},{method:"GET",path:"/api/schemas/hashes",purpose:"Hot-reload check for schema changes.",migrationPriority:"medium"},{method:"GET",path:"/api/presets",purpose:"Fetch preset configs for pages and tools.",migrationPriority:"high"},{method:"GET",path:"/api/config/saved_params",purpose:"Load stored UI parameter choices.",migrationPriority:"medium"},{method:"GET",path:"/api/config/summary",purpose:"Read app config summary for the rebuilt settings page.",migrationPriority:"medium"},{method:"GET",path:"/api/graphic_cards",purpose:"List GPUs plus xformers support state.",migrationPriority:"high"},{method:"POST",path:"/api/run",purpose:"Start schema-driven training jobs.",migrationPriority:"high"},{method:"POST",path:"/api/train/preflight",purpose:"Run backend-aware training preflight checks before launch.",migrationPriority:"high"},{method:"POST",path:"/api/train/sample_prompt",purpose:"Resolve and preview the effective training sample prompt text without launching a run.",migrationPriority:"high"},{method:"POST",path:"/api/dataset/masked_loss_audit",purpose:"Inspect alpha-channel mask readiness for masked-loss training workflows.",migrationPriority:"high"},{method:"POST",path:"/api/run_script",purpose:"Run utility scripts from the tools page.",migrationPriority:"high"},{method:"POST",path:"/api/interrogate",purpose:"Run the built-in tagger/interrogator flow.",migrationPriority:"high"},{method:"GET",path:"/api/interrogators",purpose:"List available batch tagger/interrogator models for the rebuilt tools workspace.",migrationPriority:"high"},{method:"POST",path:"/api/captions/cleanup/preview",purpose:"Preview bulk caption cleanup rules before touching files.",migrationPriority:"high"},{method:"POST",path:"/api/captions/cleanup/apply",purpose:"Apply bulk caption cleanup rules to caption files.",migrationPriority:"high"},{method:"POST",path:"/api/captions/backups/create",purpose:"Create a snapshot archive of caption files for later restore.",migrationPriority:"high"},{method:"POST",path:"/api/captions/backups/list",purpose:"List caption snapshots associated with a folder.",migrationPriority:"high"},{method:"POST",path:"/api/captions/backups/restore",purpose:"Restore caption files from a saved snapshot archive.",migrationPriority:"high"},{method:"GET",path:"/api/pick_file",purpose:"Open native file/folder pickers where supported.",migrationPriority:"medium"},{method:"GET",path:"/api/get_files",purpose:"List model, output or train directories for file pickers.",migrationPriority:"high"},{method:"GET",path:"/api/tasks",purpose:"Fetch active and historical task state.",migrationPriority:"high"},{method:"GET",path:"/api/tasks/terminate/{task_id}",purpose:"Terminate a running task.",migrationPriority:"high"},{method:"GET",path:"/api/tageditor_status",purpose:"Poll tag-editor startup/proxy status.",migrationPriority:"medium"},{method:"GET",path:"/api/scripts",purpose:"List backend-approved utility scripts and positional args for the rebuilt tools page.",migrationPriority:"high"}];function tt(){const e=We.map(a=>`
        <article class="panel route-card" data-status="${a.status}">
          <div class="panel-kicker">${a.section}</div>
          <h3>${a.title}</h3>
          <p class="route-path">${a.route}</p>
          <p>${a.notes}</p>
          ${a.schemaHints&&a.schemaHints.length>0?`<p class="schema-linkline">Schema hints: ${a.schemaHints.map(s=>`<code>${s}</code>`).join(", ")}</p>`:""}
          <div class="pill-row">
            <span class="pill ${a.status==="migrate-first"?"pill-hot":"pill-cool"}">${a.status}</span>
          </div>
        </article>
      `).join(""),t=an.map(a=>`
        <tr>
          <td><span class="method method-${a.method.toLowerCase()}">${a.method}</span></td>
          <td><code>${a.path}</code></td>
          <td>${a.purpose}</td>
          <td>${a.migrationPriority}</td>
        </tr>
      `).join("");return`
    ${E("workspace","Source migration dashboard","This page stays close to the backend and keeps our migration map explicit instead of hiding it inside hashed dist chunks.")}

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
  `}function nn(){return w({prefix:"xti",heroKicker:"sd xti",heroTitle:"SD XTI source training page",heroLede:"This route exposes the SD XTI schema on the shared source-side bridge so more specialized embedding workflows are no longer hidden behind the legacy page only.",runnerTitle:"SD XTI source-side runner",startButtonLabel:"Start SD XTI training",legacyPath:"/lora/xti.html",legacyLabel:"Open current shipped SD XTI page",renderedTitle:"SD XTI form bridge"})}const C="#/workspace",q=[{id:"overview",label:"Workspace",section:"overview",hash:C,description:"Source migration dashboard and live backend diagnostics."},{id:"about",label:"About",section:"phase1",hash:"#/about",description:"Rebuild branding and release notes in source form."},{id:"settings",label:"Settings",section:"phase1",hash:"#/settings",description:"Read config summary and saved parameter state from the backend."},{id:"tasks",label:"Tasks",section:"phase1",hash:"#/tasks",description:"Inspect and manage task execution state."},{id:"tageditor",label:"Tag Editor",section:"phase1",hash:"#/tageditor",description:"Track startup status and future proxy behavior."},{id:"tensorboard",label:"TensorBoard",section:"phase1",hash:"#/tensorboard",description:"Prepare a cleaner source-side wrapper for TensorBoard access."},{id:"tools",label:"Tools",section:"phase1",hash:"#/tools",description:"Migrate script-launch and utility entry points from the legacy tools page."},{id:"schema-bridge",label:"Schema Bridge",section:"reference",hash:"#/schema-bridge",description:"Evaluate current schema DSL into a source-side explorer and prototype form renderer."},{id:"sdxl-train",label:"SDXL Train",section:"reference",hash:"#/sdxl-train",description:"First source-side training page powered by the schema bridge and current `/api/run` backend."},{id:"flux-train",label:"Flux Train",section:"reference",hash:"#/flux-train",description:"Source-side Flux LoRA training route built on the shared schema bridge and launch pipeline."},{id:"sd3-train",label:"SD3 Train",section:"reference",hash:"#/sd3-train",description:"Source-side SD3 LoRA training route using the same normalized payload workflow."},{id:"sd3-finetune-train",label:"SD3 Finetune",section:"reference",hash:"#/sd3-finetune-train",description:"Source-side SD3 finetune route on the shared training bridge."},{id:"dreambooth-train",label:"Dreambooth",section:"reference",hash:"#/dreambooth-train",description:"Source-side Dreambooth and SDXL full-finetune route on the shared schema bridge."},{id:"flux-finetune-train",label:"Flux Finetune",section:"reference",hash:"#/flux-finetune-train",description:"Source-side Flux full-finetune route using the shared launch workflow."},{id:"sd-controlnet-train",label:"SD ControlNet",section:"reference",hash:"#/sd-controlnet-train",description:"Source-side SD ControlNet training route using the shared launch flow."},{id:"sdxl-controlnet-train",label:"SDXL ControlNet",section:"reference",hash:"#/sdxl-controlnet-train",description:"Source-side SDXL ControlNet training route using the shared launch flow."},{id:"flux-controlnet-train",label:"Flux ControlNet",section:"reference",hash:"#/flux-controlnet-train",description:"Source-side Flux ControlNet training route using the shared launch flow."},{id:"sdxl-lllite-train",label:"SDXL LLLite",section:"reference",hash:"#/sdxl-lllite-train",description:"Source-side SDXL ControlNet-LLLite training route on the shared training bridge."},{id:"sd-ti-train",label:"SD TI",section:"reference",hash:"#/sd-ti-train",description:"Source-side SD textual inversion route on the shared training bridge."},{id:"xti-train",label:"SD XTI",section:"reference",hash:"#/xti-train",description:"Source-side SD XTI textual inversion route on the shared training bridge."},{id:"sdxl-ti-train",label:"SDXL TI",section:"reference",hash:"#/sdxl-ti-train",description:"Source-side SDXL textual inversion route on the shared training bridge."},{id:"anima-train",label:"Anima LoRA",section:"reference",hash:"#/anima-train",description:"Source-side Anima LoRA training route using the shared launch flow."},{id:"anima-finetune-train",label:"Anima Finetune",section:"reference",hash:"#/anima-finetune-train",description:"Source-side Anima finetune route using the shared launch flow."},{id:"lumina-train",label:"Lumina LoRA",section:"reference",hash:"#/lumina-train",description:"Source-side Lumina LoRA training route using the shared launch flow."},{id:"lumina-finetune-train",label:"Lumina Finetune",section:"reference",hash:"#/lumina-finetune-train",description:"Source-side Lumina finetune route using the shared launch flow."},{id:"hunyuan-image-train",label:"Hunyuan Image",section:"reference",hash:"#/hunyuan-image-train",description:"Source-side Hunyuan Image LoRA training route using the shared launch flow."}],at=new Set(q.map(e=>e.hash)),nt={"/index.html":C,"/index.md":C,"/404.html":C,"/404.md":C,"/task.html":"#/tasks","/task.md":"#/tasks","/tageditor.html":"#/tageditor","/tageditor.md":"#/tageditor","/tagger.html":"#/tageditor","/tagger.md":"#/tageditor","/tensorboard.html":"#/tensorboard","/tensorboard.md":"#/tensorboard","/other/about.html":"#/about","/other/about.md":"#/about","/other/settings.html":"#/settings","/other/settings.md":"#/settings","/dreambooth/index.html":"#/dreambooth-train","/dreambooth/index.md":"#/dreambooth-train","/lora/index.html":"#/sdxl-train","/lora/index.md":"#/sdxl-train"},sn=Object.keys(nt).sort((e,t)=>t.length-e.length);function ge(e){const t=e.replace(/\/+$/,"");return t.length>0?`${t}/`:"/"}function rn(e){switch(e){case"flux":return"#/flux-train";case"flux-finetune":return"#/flux-finetune-train";case"sd3":return"#/sd3-train";case"sd3-finetune":return"#/sd3-finetune-train";case"controlnet":return"#/sd-controlnet-train";case"sdxl-controlnet":return"#/sdxl-controlnet-train";case"flux-controlnet":return"#/flux-controlnet-train";case"sdxl-lllite":return"#/sdxl-lllite-train";case"tools":return"#/tools";case"basic":case"master":case"params":case"sdxl":return"#/sdxl-train";case"sdxl-ti":return"#/sdxl-ti-train";case"ti":return"#/sd-ti-train";case"xti":return"#/xti-train";case"anima":return"#/anima-train";case"anima-finetune":return"#/anima-finetune-train";case"hunyuan":return"#/hunyuan-image-train";case"lumina":return"#/lumina-train";case"lumina-finetune":return"#/lumina-finetune-train";default:return null}}function on(e){const t=e.match(/^(.*)\/lora\/([^/]+)\.(?:html|md)$/i);if(!t)return null;const[,a,s]=t,n=rn(s.toLowerCase());return n?{hash:n,canonicalRootPath:ge(a)}:null}function ln(e){const t=e.toLowerCase();for(const a of sn)if(t.endsWith(a))return{hash:nt[a],canonicalRootPath:ge(e.slice(0,e.length-a.length))};return on(e)}function Re(e,t){const a=`${e}${window.location.search}${t}`,s=`${window.location.pathname}${window.location.search}${window.location.hash}`;a!==s&&window.history.replaceState(null,"",a)}function cn(){const e=at.has(window.location.hash)?window.location.hash:C;return q.find(t=>t.hash===e)??q[0]}function dn(){if(at.has(window.location.hash))return;const e=ln(window.location.pathname);if(e){Re(e.canonicalRootPath,e.hash);return}Re(ge(window.location.pathname||"/"),C)}const Ce={"sdxl-train":{routeId:"sdxl-train",schemaName:"sdxl-lora",prefix:"sdxl",modelLabel:"SDXL",presetTrainTypes:["sdxl-lora"]},"flux-train":{routeId:"flux-train",schemaName:"flux-lora",prefix:"flux",modelLabel:"Flux",presetTrainTypes:["flux-lora"]},"sd3-train":{routeId:"sd3-train",schemaName:"sd3-lora",prefix:"sd3",modelLabel:"SD3",presetTrainTypes:["sd3-lora"]},"sd3-finetune-train":{routeId:"sd3-finetune-train",schemaName:"sd3-finetune",prefix:"sd3-finetune",modelLabel:"SD3 Finetune",presetTrainTypes:["sd3-finetune"]},"dreambooth-train":{routeId:"dreambooth-train",schemaName:"dreambooth",prefix:"dreambooth",modelLabel:"Dreambooth",presetTrainTypes:["dreambooth","sd-dreambooth","sdxl-finetune"]},"flux-finetune-train":{routeId:"flux-finetune-train",schemaName:"flux-finetune",prefix:"flux-finetune",modelLabel:"Flux Finetune",presetTrainTypes:["flux-finetune"]},"sd-controlnet-train":{routeId:"sd-controlnet-train",schemaName:"sd-controlnet",prefix:"sd-controlnet",modelLabel:"SD ControlNet",presetTrainTypes:["sd-controlnet"]},"sdxl-controlnet-train":{routeId:"sdxl-controlnet-train",schemaName:"sdxl-controlnet",prefix:"sdxl-controlnet",modelLabel:"SDXL ControlNet",presetTrainTypes:["sdxl-controlnet"]},"flux-controlnet-train":{routeId:"flux-controlnet-train",schemaName:"flux-controlnet",prefix:"flux-controlnet",modelLabel:"Flux ControlNet",presetTrainTypes:["flux-controlnet"]},"sdxl-lllite-train":{routeId:"sdxl-lllite-train",schemaName:"sdxl-controlnet-lllite",prefix:"sdxl-lllite",modelLabel:"SDXL LLLite",presetTrainTypes:["sdxl-controlnet-lllite"]},"sd-ti-train":{routeId:"sd-ti-train",schemaName:"sd-textual-inversion",prefix:"sd-ti",modelLabel:"SD Textual Inversion",presetTrainTypes:["sd-textual-inversion"]},"xti-train":{routeId:"xti-train",schemaName:"sd-textual-inversion-xti",prefix:"xti",modelLabel:"SD XTI",presetTrainTypes:["sd-textual-inversion-xti"]},"sdxl-ti-train":{routeId:"sdxl-ti-train",schemaName:"sdxl-textual-inversion",prefix:"sdxl-ti",modelLabel:"SDXL Textual Inversion",presetTrainTypes:["sdxl-textual-inversion"]},"anima-train":{routeId:"anima-train",schemaName:"anima-lora",prefix:"anima",modelLabel:"Anima LoRA",presetTrainTypes:["anima-lora"]},"anima-finetune-train":{routeId:"anima-finetune-train",schemaName:"anima-finetune",prefix:"anima-finetune",modelLabel:"Anima Finetune",presetTrainTypes:["anima-finetune"]},"lumina-train":{routeId:"lumina-train",schemaName:"lumina-lora",prefix:"lumina",modelLabel:"Lumina LoRA",presetTrainTypes:["lumina-lora"]},"lumina-finetune-train":{routeId:"lumina-finetune-train",schemaName:"lumina-finetune",prefix:"lumina-finetune",modelLabel:"Lumina Finetune",presetTrainTypes:["lumina-finetune"]},"hunyuan-image-train":{routeId:"hunyuan-image-train",schemaName:"hunyuan-image-lora",prefix:"hunyuan-image",modelLabel:"Hunyuan Image LoRA",presetTrainTypes:["hunyuan-image-lora"]}};function un(e,t){if(t.length===0){h(e,"<p>No GPUs reported. Training will use the backend default environment.</p>");return}const a=t.map((s,n)=>{const i=s.index??s.id??n,r=String(i);return`
        <label class="gpu-chip">
          <input type="checkbox" data-gpu-id="${l(r)}" />
          <span>GPU ${l(r)}: ${l(s.name)}</span>
        </label>
      `}).join("");h(e,`<div class="gpu-chip-grid">${a}</div>`)}function fe(e){return[...document.querySelectorAll(`#${e} input[data-gpu-id]:checked`)].map(t=>t.dataset.gpuId).filter(t=>!!t)}function be(e,t=[]){const a=new Set(t.map(s=>String(s)));document.querySelectorAll(`#${e}-gpu-selector input[data-gpu-id]`).forEach(s=>{const n=s.dataset.gpuId??"";s.checked=a.has(n)})}function pn(e){switch(e){case"prompt_file":return"Prompt file";case"generated":return"Generated from current fields";case"random_dataset_prompt_preview":return"Random dataset-derived prompt";case"legacy_sample_prompts_file":return"Legacy sample_prompts file";case"legacy_sample_prompts_inline":return"Legacy sample_prompts text";default:return e}}function S(e,t,a,s="idle"){h(`${e}-submit-status`,`
      <div class="submit-status-box submit-status-${s}">
        <strong>${l(t)}</strong>
        <p>${l(a)}</p>
      </div>
    `)}function W(e,t,a){if(a){h(`${e}-validation-status`,`
        <div class="submit-status-box submit-status-error">
          <strong>Payload preparation failed</strong>
          <p>${l(a)}</p>
        </div>
      `);return}const s=[t.errors.length>0?`
          <div>
            <strong>Errors</strong>
            <ul class="status-list">
              ${t.errors.map(n=>`<li>${l(n)}</li>`).join("")}
            </ul>
          </div>
        `:"",t.warnings.length>0?`
          <div>
            <strong>Warnings</strong>
            <ul class="status-list">
              ${t.warnings.map(n=>`<li>${l(n)}</li>`).join("")}
            </ul>
          </div>
        `:""].filter(Boolean).join("");if(!s){h(`${e}-validation-status`,`
        <div class="submit-status-box submit-status-success">
          <strong>Compatibility checks passed</strong>
          <p>No obvious parameter conflicts were detected in the current payload.</p>
        </div>
      `);return}h(`${e}-validation-status`,`
      <div class="submit-status-box ${t.errors.length>0?"submit-status-error":"submit-status-warning"}">
        <strong>${t.errors.length>0?"Action needed before launch":"Review before launch"}</strong>
        ${s}
      </div>
    `)}function f(e,t,a="idle"){const s=document.querySelector(`#${e}-utility-note`);s&&(s.textContent=t,s.classList.remove("utility-note-success","utility-note-warning","utility-note-error"),a==="success"?s.classList.add("utility-note-success"):a==="warning"?s.classList.add("utility-note-warning"):a==="error"&&s.classList.add("utility-note-error"))}function De(e,t,a){if(a){h(`${e}-preflight-report`,`
        <div class="submit-status-box submit-status-error">
          <strong>Preflight request failed</strong>
          <p>${l(a)}</p>
        </div>
      `);return}if(!t){h(`${e}-preflight-report`,`
        <div class="submit-status-box">
          <strong>Training preflight has not run yet</strong>
          <p>Run preflight to verify dataset, model, resume path, prompt preview, and runtime fallback expectations before launch.</p>
        </div>
      `);return}const s=[t.errors.length?`
          <div>
            <strong>Errors</strong>
            <ul class="status-list">
              ${t.errors.map(n=>`<li>${l(n)}</li>`).join("")}
            </ul>
          </div>
        `:"",t.warnings.length?`
          <div>
            <strong>Warnings</strong>
            <ul class="status-list">
              ${t.warnings.map(n=>`<li>${l(n)}</li>`).join("")}
            </ul>
          </div>
        `:"",t.notes.length?`
          <div>
            <strong>Notes</strong>
            <ul class="status-list">
              ${t.notes.map(n=>`<li>${l(n)}</li>`).join("")}
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
            <p class="training-preflight-meta">${l(pn(t.sample_prompt.source))}${t.sample_prompt.detail?` · ${l(t.sample_prompt.detail)}`:""}</p>
            <pre class="preset-preview">${l(t.sample_prompt.preview)}</pre>
          </div>
        `:""].filter(Boolean).join("");h(`${e}-preflight-report`,`
      <div class="submit-status-box ${t.can_start?"submit-status-success":"submit-status-warning"}">
        <strong>${t.can_start?"Backend preflight passed":"Backend preflight found launch blockers"}</strong>
        <p>Training type: ${l(t.training_type)}</p>
        ${s}
      </div>
    `)}function hn(e){const t=[];let a="",s=null,n=0;for(let i=0;i<e.length;i+=1){const r=e[i],c=i>0?e[i-1]:"";if(s){a+=r,r===s&&c!=="\\"&&(s=null);continue}if(r==='"'||r==="'"){s=r,a+=r;continue}if(r==="["){n+=1,a+=r;continue}if(r==="]"){n-=1,a+=r;continue}if(r===","&&n===0){t.push(a.trim()),a="";continue}a+=r}return a.trim().length>0&&t.push(a.trim()),t}function mn(e){let t=null,a=!1,s="";for(const n of e){if(t){if(s+=n,t==='"'&&n==="\\"&&!a){a=!0;continue}n===t&&!a&&(t=null),a=!1;continue}if(n==='"'||n==="'"){t=n,s+=n;continue}if(n==="#")break;s+=n}return s.trim()}function st(e){return e.startsWith('"')&&e.endsWith('"')?e.slice(1,-1).replaceAll('\\"','"').replaceAll("\\n",`
`).replaceAll("\\t","	").replaceAll("\\\\","\\"):e.startsWith("'")&&e.endsWith("'")?e.slice(1,-1):e}function it(e){const t=e.trim();return t.length===0?"":t.startsWith('"')&&t.endsWith('"')||t.startsWith("'")&&t.endsWith("'")?st(t):t==="true"?!0:t==="false"?!1:t.startsWith("[")&&t.endsWith("]")?hn(t.slice(1,-1)).map(a=>it(a)):/^[+-]?\d[\d_]*(\.\d[\d_]*)?([eE][+-]?\d+)?$/.test(t)?Number(t.replaceAll("_","")):t}function Be(e){return e.split(".").map(t=>t.trim()).filter(Boolean).map(t=>st(t))}function gn(e,t,a){let s=e;for(let n=0;n<t.length-1;n+=1){const i=t[n],r=s[i];(!r||typeof r!="object"||Array.isArray(r))&&(s[i]={}),s=s[i]}s[t[t.length-1]]=a}function rt(e){const t={};let a=[];for(const s of e.split(/\r?\n/)){const n=mn(s);if(!n)continue;if(n.startsWith("[[")&&n.endsWith("]]"))throw new Error("Array-of-table syntax is not supported in custom params yet.");if(n.startsWith("[")&&n.endsWith("]")){a=Be(n.slice(1,-1));continue}const i=n.indexOf("=");if(i===-1)throw new Error(`Invalid TOML line: ${s}`);const r=Be(n.slice(0,i));if(r.length===0)throw new Error(`Invalid TOML key: ${s}`);gn(t,[...a,...r],it(n.slice(i+1)))}return t}function se(e){return JSON.stringify(e)}function ot(e){return typeof e=="string"?se(e):typeof e=="number"?Number.isFinite(e)?String(e):se(String(e)):typeof e=="boolean"?e?"true":"false":Array.isArray(e)?`[${e.map(t=>ot(t)).join(", ")}]`:se(JSON.stringify(e))}function lt(e,t=[],a=[]){const s=[];for(const[n,i]of Object.entries(e)){if(i&&typeof i=="object"&&!Array.isArray(i)){lt(i,[...t,n],a);continue}s.push([n,i])}return a.push({path:t,values:s}),a}function qe(e){const t=lt(e).filter(s=>s.values.length>0).sort((s,n)=>s.path.join(".").localeCompare(n.path.join("."))),a=[];for(const s of t){s.path.length>0&&(a.length>0&&a.push(""),a.push(`[${s.path.join(".")}]`));for(const[n,i]of s.values.sort(([r],[c])=>r.localeCompare(c)))a.push(`${n} = ${ot(i)}`)}return a.join(`
`)}const fn=["pretrained_model_name_or_path","train_data_dir","reg_data_dir","output_dir","network_weights","conditioning_data_dir","controlnet_model_name_or_path","weights","vae","text_encoder","byt5","qwen3","llm_adapter_path","t5_tokenizer_path","ae","clip_l","clip_g","t5xxl","gemma2"],bn=["learning_rate","unet_lr","text_encoder_lr","learning_rate_te","learning_rate_te1","learning_rate_te2","learning_rate_te3","sigmoid_scale","guidance_scale","training_shift","control_net_lr","self_attn_lr","cross_attn_lr","mlp_lr","mod_lr","llm_adapter_lr"],yn=["lycoris_algo","conv_dim","conv_alpha","dropout","dylora_unit","lokr_factor","train_norm","down_lr_weight","mid_lr_weight","up_lr_weight","block_lr_zero_threshold","enable_block_weights","enable_preview","network_args_custom","optimizer_args_custom","enable_base_weight","prodigy_d0","prodigy_d_coef","ui_custom_params"],vn=["vae","reg_data_dir","network_weights","conditioning_data_dir","controlnet_model_name_or_path","weights","init_word","text_encoder","byt5","qwen3","llm_adapter_path","t5_tokenizer_path","ae","clip_l","clip_g","t5xxl","gemma2","noise_offset","multires_noise_iterations","multires_noise_discount","caption_dropout_rate","network_dropout","scale_weight_norms","gpu_ids"],kn=["v2","v_parameterization","scale_v_pred_loss_like_noise_pred","clip_skip","learning_rate_te","stop_text_encoder_training"],_n=["learning_rate_te1","learning_rate_te2"],wn=[["cache_text_encoder_outputs","shuffle_caption"],["noise_offset","multires_noise_iterations"],["cache_latents","color_aug"],["cache_latents","random_crop"]],Fe={algo:"lycoris_algo",unit:"dylora_unit",factor:"lokr_factor"},xn=new Set(["conv_dim","conv_alpha","dropout","down_lr_weight","mid_lr_weight","up_lr_weight","block_lr_zero_threshold"]),$n=new Set(["decouple","weight_decay","use_bias_correction","safeguard_warmup"]),Sn=new Set(["base_weights","base_weights_multiplier"]),Tn={pretrained_model_name_or_path:"./sd-models/model.safetensors",train_data_dir:"./train/aki",resolution:"512,512",enable_bucket:!0,min_bucket_reso:256,max_bucket_reso:1024,output_name:"aki",output_dir:"./output",save_model_as:"safetensors",save_every_n_epochs:2,max_train_epochs:10,train_batch_size:1,network_train_unet_only:!1,network_train_text_encoder_only:!1,learning_rate:1e-4,unet_lr:1e-4,text_encoder_lr:1e-5,lr_scheduler:"cosine_with_restarts",optimizer_type:"AdamW8bit",lr_scheduler_num_cycles:1,network_module:"networks.lora",network_dim:32,network_alpha:32,logging_dir:"./logs",caption_extension:".txt",shuffle_caption:!0,keep_tokens:0,max_token_length:255,seed:1337,prior_loss_weight:1,clip_skip:2,mixed_precision:"fp16",save_precision:"fp16",xformers:!0,cache_latents:!0,persistent_data_loader_workers:!0};function de(e){return JSON.parse(JSON.stringify(e??{}))}function z(e){return Array.isArray(e)?e.map(t=>String(t??"").trim()).filter(Boolean):String(e??"").split(/\r?\n/).map(t=>t.trim()).filter(Boolean)}function N(e,t){return Object.prototype.hasOwnProperty.call(e,t)}function Ln(e){return String(e.model_train_type??"").startsWith("sdxl")}function Pn(e){return String(e.model_train_type??"")==="sd3-finetune"}function y(e){return e==null?"":String(e)}function An(e){return y(e).replaceAll("\\","/")}function G(e,t=0){const a=Number.parseFloat(y(e));return Number.isNaN(a)?t:a}function v(e){return!!e}function je(e){const t=e.indexOf("=");return t===-1?{key:e.trim(),value:"",hasValue:!1}:{key:e.slice(0,t).trim(),value:e.slice(t+1).trim(),hasValue:!0}}function In(e){if(typeof e=="boolean")return e;const t=y(e).toLowerCase();return t==="true"||t==="1"||t==="yes"}function ct(e,t=String(e.model_train_type??"")){const a=t==="lora-basic"?{...Tn,...de(e)}:de(e),s=[],n=[],i=Ln(a),r=Pn(a);(i||r)&&[a.learning_rate_te1,a.learning_rate_te2,a.learning_rate_te3].some(v)&&(a.train_text_encoder=!0);for(const o of i||r?kn:_n)N(a,o)&&delete a[o];a.network_module==="lycoris.kohya"?(s.push(`conv_dim=${y(a.conv_dim)}`,`conv_alpha=${y(a.conv_alpha)}`,`dropout=${y(a.dropout)}`,`algo=${y(a.lycoris_algo)}`),v(a.lokr_factor)&&s.push(`factor=${y(a.lokr_factor)}`),v(a.train_norm)&&s.push("train_norm=True")):a.network_module==="networks.dylora"&&s.push(`unit=${y(a.dylora_unit)}`);const c=y(a.optimizer_type),d=c.toLowerCase();d.startsWith("dada")?((c==="DAdaptation"||c==="DAdaptAdam")&&n.push("decouple=True","weight_decay=0.01"),a.learning_rate=1,a.unet_lr=1,a.text_encoder_lr=1):d==="prodigy"&&(n.push("decouple=True","weight_decay=0.01","use_bias_correction=True",`d_coef=${y(a.prodigy_d_coef)}`),v(a.lr_warmup_steps)&&n.push("safeguard_warmup=True"),v(a.prodigy_d0)&&n.push(`d0=${y(a.prodigy_d0)}`)),v(a.enable_block_weights)&&(s.push(`down_lr_weight=${y(a.down_lr_weight)}`,`mid_lr_weight=${y(a.mid_lr_weight)}`,`up_lr_weight=${y(a.up_lr_weight)}`,`block_lr_zero_threshold=${y(a.block_lr_zero_threshold)}`),delete a.block_lr_zero_threshold),v(a.enable_base_weight)?(a.base_weights=z(a.base_weights),a.base_weights_multiplier=z(a.base_weights_multiplier).map(o=>G(o))):(delete a.base_weights,delete a.base_weights_multiplier);for(const o of z(a.network_args_custom))s.push(o);for(const o of z(a.optimizer_args_custom))n.push(o);v(a.enable_preview)||(delete a.sample_prompts,delete a.sample_sampler,delete a.sample_every_n_epochs);for(const o of bn)N(a,o)&&(a[o]=G(a[o]));for(const o of vn){if(!N(a,o))continue;const p=a[o];(p===0||p===""||Array.isArray(p)&&p.length===0)&&delete a[o]}for(const o of fn)N(a,o)&&a[o]&&(a[o]=An(a[o]));if(s.length>0?a.network_args=s:delete a.network_args,n.length>0?a.optimizer_args=n:delete a.optimizer_args,v(a.ui_custom_params)){const o=rt(y(a.ui_custom_params));Object.assign(a,o)}for(const o of yn)N(a,o)&&delete a[o];return Array.isArray(a.gpu_ids)&&(a.gpu_ids=a.gpu_ids.map(o=>{const p=y(o),m=p.match(/GPU\s+(\d+):/);return m?m[1]:p})),a}function En(e){const t=[],a=[],s=y(e.optimizer_type),n=s.toLowerCase(),i=y(e.model_train_type),r=i==="sd3-finetune",c=i==="anima-lora"||i==="anima-finetune";s.startsWith("DAdapt")&&e.lr_scheduler!=="constant"&&t.push("DAdaptation works best with lr_scheduler set to constant."),n.startsWith("prodigy")&&(N(e,"unet_lr")||N(e,"text_encoder_lr"))&&(G(e.unet_lr,1)!==1||G(e.text_encoder_lr,1)!==1)&&t.push("Prodigy usually expects unet_lr and text_encoder_lr to stay at 1."),e.network_module==="networks.oft"&&i!=="sdxl-lora"&&a.push("OFT is currently only supported for SDXL LoRA."),r&&v(e.train_text_encoder)&&v(e.cache_text_encoder_outputs)&&!v(e.use_t5xxl_cache_only)&&a.push("SD3 full finetune cannot train text encoders while cache_text_encoder_outputs is enabled."),r&&v(e.train_t5xxl)&&!v(e.train_text_encoder)&&a.push("train_t5xxl requires train_text_encoder to be enabled first."),r&&v(e.train_t5xxl)&&v(e.cache_text_encoder_outputs)&&a.push("train_t5xxl cannot be combined with cache_text_encoder_outputs."),c&&v(e.unsloth_offload_checkpointing)&&v(e.cpu_offload_checkpointing)&&a.push("unsloth_offload_checkpointing cannot be combined with cpu_offload_checkpointing."),c&&v(e.unsloth_offload_checkpointing)&&v(e.blocks_to_swap)&&a.push("unsloth_offload_checkpointing cannot be combined with blocks_to_swap."),v(e.masked_loss)&&!v(e.alpha_mask)&&!v(e.conditioning_data_dir)&&t.push("masked_loss is on, but alpha_mask is off. For normal alpha-channel datasets this often becomes a no-op.");for(const[d,o]of wn)v(e[d])&&v(e[o])&&a.push(`Parameters ${d} and ${o} conflict. Please enable only one of them.`);return{warnings:t,errors:a}}function dt(e){const t=de(e);if(Array.isArray(t.network_args)){const a=[];for(const s of t.network_args){const{key:n,value:i,hasValue:r}=je(y(s));if(n==="train_norm"){t.train_norm=r?In(i):!0;continue}if((n==="down_lr_weight"||n==="mid_lr_weight"||n==="up_lr_weight"||n==="block_lr_zero_threshold")&&(t.enable_block_weights=!0),xn.has(n)){t[n]=i;continue}if(Fe[n]){t[Fe[n]]=i;continue}a.push(y(s))}a.length>0&&(t.network_args_custom=a),delete t.network_args}if(Array.isArray(t.optimizer_args)){const a=[];for(const s of t.optimizer_args){const{key:n,value:i}=je(y(s));if(n==="d_coef"){t.prodigy_d_coef=i;continue}if(n==="d0"){t.prodigy_d0=i;continue}$n.has(n)||a.push(y(s))}a.length>0&&(t.optimizer_args_custom=a),delete t.optimizer_args}for(const a of Sn)Array.isArray(t[a])&&(t[a]=t[a].map(s=>y(s)).join(`
`),a==="base_weights"&&(t.enable_base_weight=!0),a==="base_weights_multiplier"&&(t.enable_base_weight=!0));return Array.isArray(t.gpu_ids)&&(t.gpu_ids=t.gpu_ids.map(a=>y(a))),t}function ee(e,t){const a=t.values.output_name;return typeof a=="string"&&a.trim().length>0?a.trim():`${e.modelLabel} snapshot`}function Nn(e){try{return JSON.stringify(ct(Z(e.value)),null,2)}catch(t){return t instanceof Error?t.message:"Unable to preview this snapshot."}}function Rn(e,t){if(t.length===0){h(`${e}-history-panel`,`
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
      `);return}const a=t.map((s,n)=>`
        <article class="history-card">
          <div class="history-card-head">
            <div>
              <h4>${l(s.name||"Unnamed snapshot")}</h4>
              <p class="history-card-meta">${l(s.time)}</p>
            </div>
            <span class="coverage-pill coverage-pill-muted">${l((s.gpu_ids??[]).join(", ")||"default GPU")}</span>
          </div>
          <pre class="history-preview">${l(Nn(s))}</pre>
          <div class="history-card-actions">
            <button class="action-button action-button-ghost action-button-small" data-history-apply="${n}" type="button">Apply</button>
            <button class="action-button action-button-ghost action-button-small" data-history-rename="${n}" type="button">Rename</button>
            <button class="action-button action-button-ghost action-button-small" data-history-delete="${n}" type="button">Delete</button>
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
    `)}function Cn(e,t){if(t.length===0){h(`${e}-presets-panel`,`
        <div class="training-side-panel-head">
          <div>
            <p class="panel-kicker">presets</p>
            <h3>Training presets</h3>
          </div>
          <button class="action-button action-button-ghost action-button-small" data-preset-close="${e}" type="button">Close</button>
        </div>
        <p>No presets matched this training route.</p>
      `);return}const a=t.map((s,n)=>{const i=s.metadata??{},r=s.data??{};return`
        <article class="preset-card">
          <div class="preset-card-head">
            <div>
              <h4>${l(i.name||s.name||`Preset ${n+1}`)}</h4>
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
            <button class="action-button action-button-ghost action-button-small" data-preset-merge="${n}" type="button">Merge</button>
            <button class="action-button action-button-ghost action-button-small" data-preset-replace="${n}" type="button">Replace</button>
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
    `)}function Dn(e,t){const a=new Set(e.presetTrainTypes);return t.filter(s=>{const i=(s.metadata??{}).train_type;return typeof i!="string"||i.trim().length===0?!0:a.has(i)})}function A(e,t,a){const s=document.querySelector(`#${e}-history-panel`),n=document.querySelector(`#${e}-presets-panel`);s&&(s.hidden=t==="history"?!a:!0),n&&(n.hidden=t==="presets"?!a:!0)}async function Oe(e,t){try{const a=await Bt(t);if(a.status!=="success")throw new Error(a.message||"Training preflight failed.");return De(e.prefix,a.data??null),a.data??null}catch(a){throw De(e.prefix,null,a instanceof Error?a.message:"Training preflight failed."),a}}function Bn(e){var t;(t=document.querySelector(`#${e.prefix}-stop-train`))==null||t.addEventListener("click",async()=>{var a;try{const n=(((a=(await he()).data)==null?void 0:a.tasks)??[]).find(r=>String(r.status).toUpperCase()==="RUNNING");if(!n){f(e.prefix,"No running training task was found.","warning");return}const i=String(n.id??n.task_id??"");if(!i){f(e.prefix,"The running task does not expose an id.","error");return}if(!window.confirm(`Stop running task ${i}?`))return;await Me(i),S(e.prefix,"Training stop requested",`Sent terminate request for task ${i}.`,"warning"),f(e.prefix,`Terminate requested for task ${i}.`,"warning")}catch(s){f(e.prefix,s instanceof Error?s.message:"Failed to stop training.","error")}})}function qn(e,t,a){var n;(n=document.querySelector(`#${e.prefix}-run-preflight`))==null||n.addEventListener("click",async()=>{const i=t();if(!i){S(e.prefix,"Editor not ready",`The ${e.modelLabel} schema editor state is not initialized yet.`,"error");return}try{const r=a(i);W(e.prefix,r.checks),await Oe(e,r.payload),f(e.prefix,"Training preflight completed.","success")}catch(r){f(e.prefix,r instanceof Error?r.message:"Training preflight failed.","error")}});const s=document.querySelector(`#${e.prefix}-start-train`);s==null||s.addEventListener("click",async()=>{var r;const i=t();if(!i){S(e.prefix,"Editor not ready",`The ${e.modelLabel} schema editor state is not initialized yet.`,"error");return}s.setAttribute("disabled","true"),S(e.prefix,"Submitting training job...","Sending the current payload to /api/run.","idle");try{const c=a(i);if(c.checks.errors.length>0){S(e.prefix,"Fix parameter conflicts first",c.checks.errors.join(" "),"error"),W(e.prefix,c.checks);return}const d=await Oe(e,c.payload);if(d&&!d.can_start){S(e.prefix,"Resolve preflight errors first",d.errors.join(" "),"error");return}const o=await Dt(c.payload);if(o.status==="success"){const m=[...c.checks.warnings,...(d==null?void 0:d.warnings)??[],...((r=o.data)==null?void 0:r.warnings)??[]].join(" ");S(e.prefix,"Training request accepted",`${o.message||"Training started."}${m?` ${m}`:""}`,m?"warning":"success")}else S(e.prefix,"Training request failed",o.message||"Unknown backend failure.","error")}catch(c){S(e.prefix,"Training request failed",c instanceof Error?c.message:"Unknown network error.","error")}finally{s.removeAttribute("disabled")}})}function ye(){return typeof window<"u"?window:null}function ut(e,t){const a=ye();if(!a)return t;try{const s=a.localStorage.getItem(e);return s?JSON.parse(s):t}catch{return t}}function pt(e,t){const a=ye();a&&a.localStorage.setItem(e,JSON.stringify(t))}function ht(e){return`source-training-autosave-${e}`}function mt(e){return`source-training-history-${e}`}function Fn(e){return ut(ht(e),null)}function jn(e,t){pt(ht(e),t)}function R(e){return ut(mt(e),[])}function K(e,t){pt(mt(e),t)}function J(e,t,a="text/plain;charset=utf-8"){const s=ye();if(!s)return;const n=new Blob([t],{type:a}),i=URL.createObjectURL(n),r=s.document.createElement("a");r.href=i,r.download=e,r.click(),URL.revokeObjectURL(i)}function On(e){return e.trim().replace(/[^0-9A-Za-z._-]+/g,"-").replace(/-+/g,"-").replace(/^[-_.]+|[-_.]+$/g,"")||"training-preset"}function Hn(e,t,a){const s=ee(e,t),n=String(a.payload.model_train_type??"");return{metadata:{name:s,version:"1.0",author:"SD-reScripts local export",train_type:n||e.schemaName,description:`Exported from the ${e.modelLabel} source-side training bridge on ${new Date().toLocaleString()}.`},data:a.payload}}function zn(e,t,a){var n;const s=R(e.routeId);s.unshift({time:new Date().toLocaleString(),name:ee(e,t),value:Z(t.values),gpu_ids:fe(`${e.prefix}-gpu-selector`)}),K(e.routeId,s.slice(0,40)),(n=document.querySelector(`#${e.prefix}-history-panel`))!=null&&n.hidden||a()}function Un(e,t,a,s){var n,i,r,c;(n=document.querySelector(`#${e.prefix}-download-config`))==null||n.addEventListener("click",()=>{const d=t();if(!d)return;const o=a(d);J(`${e.prefix}-${Ge()}.toml`,qe(o.payload)),f(e.prefix,"Exported current config as TOML.","success")}),(i=document.querySelector(`#${e.prefix}-export-preset`))==null||i.addEventListener("click",()=>{const d=t();if(!d)return;const o=a(d),p=Hn(e,d,o),m=On(ee(e,d)||e.prefix);J(`${m}-preset.toml`,qe(p)),f(e.prefix,"Exported current config as reusable preset TOML.","success")}),(r=document.querySelector(`#${e.prefix}-import-config`))==null||r.addEventListener("click",()=>{var d;(d=document.querySelector(`#${e.prefix}-config-file-input`))==null||d.click()}),(c=document.querySelector(`#${e.prefix}-config-file-input`))==null||c.addEventListener("change",d=>{var b;const o=d.currentTarget,p=(b=o.files)==null?void 0:b[0];if(!p)return;const m=new FileReader;m.onload=()=>{try{const g=rt(String(m.result??"")),k=g.data&&typeof g.data=="object"&&!Array.isArray(g.data)?g.data:g;s(k),f(e.prefix,g.data&&typeof g.data=="object"?`Imported preset: ${p.name}.`:`Imported config: ${p.name}.`,"success")}catch(g){f(e.prefix,g instanceof Error?g.message:"Failed to import config.","error")}finally{o.value=""}},m.readAsText(p)})}function Mn(e,t){var a;(a=document.querySelector(`#${e.prefix}-history-file-input`))==null||a.addEventListener("change",s=>{var c;const n=s.currentTarget,i=(c=n.files)==null?void 0:c[0];if(!i)return;const r=new FileReader;r.onload=()=>{try{const d=JSON.parse(String(r.result??""));if(!Array.isArray(d))throw new Error("History file must contain an array.");const o=d.filter(m=>m&&typeof m=="object"&&m.value&&typeof m.value=="object").map(m=>({time:String(m.time||new Date().toLocaleString()),name:m.name?String(m.name):void 0,value:Z(m.value),gpu_ids:Array.isArray(m.gpu_ids)?m.gpu_ids.map(b=>String(b)):[]}));if(o.length===0)throw new Error("History file did not contain valid entries.");const p=[...R(e.routeId),...o].slice(0,80);K(e.routeId,p),t(),f(e.prefix,`Imported ${o.length} history entries.`,"success")}catch(d){f(e.prefix,d instanceof Error?d.message:"Failed to import history.","error")}finally{n.value=""}},r.readAsText(i)})}function Xn(e,t,a){h(`${e}-sample-prompt-workspace`,`
      <div class="submit-status-box">
        <strong>${l(t)}</strong>
        <p>${l(a)}</p>
      </div>
    `)}function Vn(e){switch(e){case"prompt_file":return"Prompt file";case"generated":return"Generated from current fields";case"random_dataset_prompt_preview":return"Random dataset-derived prompt";case"legacy_sample_prompts_file":return"Legacy sample_prompts file";case"legacy_sample_prompts_inline":return"Legacy sample_prompts text";default:return e}}function Y(e){Xn(e,"Sample prompt workspace is waiting for refresh","Edit prompt fields freely, then click Refresh prompt to inspect the exact text that would be used.")}function U(e,t,a){if(a){h(`${e}-sample-prompt-workspace`,`
        <div class="submit-status-box submit-status-error">
          <strong>Sample prompt preview failed</strong>
          <p>${l(a)}</p>
        </div>
      `);return}if(!t){Y(e);return}const s=[t.warnings.length?`
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
        `:""].filter(Boolean).join(""),n=t.warnings.length>0||!t.enabled?"submit-status-warning":"submit-status-success",i=t.line_count>3?`Showing the first 3 non-empty lines out of ${t.line_count}.`:`${t.line_count||0} non-empty line${t.line_count===1?"":"s"} detected.`;h(`${e}-sample-prompt-workspace`,`
      <div class="submit-status-box ${n}">
        <strong>${t.enabled?"Sample prompt resolved":"Sample prompt resolved, but preview is disabled"}</strong>
        <p class="training-preflight-meta">${l(Vn(t.source))}${t.detail?` · ${l(t.detail)}`:""}</p>
        <p class="training-preflight-meta">${l(i)} Download will use ${l(t.suggested_file_name)}.</p>
        ${s}
        <pre class="preset-preview">${l(t.preview)}</pre>
      </div>
    `)}async function He(e,t,a){const s=t();if(!s)throw new Error(`${e.modelLabel} editor is not ready yet.`);const n=a(s),i=await qt(n.payload);if(i.status!=="success"||!i.data)throw new Error(i.message||"Sample prompt preview failed.");return i.data}function Wn(e){var i,r,c,d;const{config:t,getCurrentState:a,buildPreparedTrainingPayload:s,applyEditableRecord:n}=e;(i=document.querySelector(`#${t.prefix}-refresh-sample-prompt`))==null||i.addEventListener("click",async()=>{try{const o=await He(t,a,s);U(t.prefix,o),f(t.prefix,"Sample prompt preview refreshed.","success")}catch(o){U(t.prefix,null,o instanceof Error?o.message:"Sample prompt preview failed."),f(t.prefix,o instanceof Error?o.message:"Sample prompt preview failed.","error")}}),(r=document.querySelector(`#${t.prefix}-download-sample-prompt`))==null||r.addEventListener("click",async()=>{try{const o=await He(t,a,s);U(t.prefix,o),J(o.suggested_file_name||"sample-prompts.txt",o.content||""),f(t.prefix,`Sample prompt exported as ${o.suggested_file_name}.`,"success")}catch(o){U(t.prefix,null,o instanceof Error?o.message:"Sample prompt export failed."),f(t.prefix,o instanceof Error?o.message:"Sample prompt export failed.","error")}}),(c=document.querySelector(`#${t.prefix}-pick-prompt-file`))==null||c.addEventListener("click",async()=>{try{const o=await D("text-file");n({prompt_file:o},void 0,"merge"),Y(t.prefix),f(t.prefix,"Prompt file path inserted into the current form state.","success")}catch(o){f(t.prefix,o instanceof Error?o.message:"Prompt file picker failed.","error")}}),(d=document.querySelector(`#${t.prefix}-clear-prompt-file`))==null||d.addEventListener("click",()=>{n({prompt_file:""},void 0,"merge"),Y(t.prefix),f(t.prefix,"prompt_file cleared from the current form state.","warning")})}function Gn(e){var m,b,g,k;const{config:t,createDefaultState:a,getCurrentState:s,mountTrainingState:n,onStateChange:i,applyEditableRecord:r,buildPreparedTrainingPayload:c,bindHistoryPanel:d,openHistoryPanel:o,openPresetPanel:p}=e;document.querySelectorAll(`#${t.prefix}-gpu-selector input[data-gpu-id]`).forEach($=>{$.addEventListener("change",()=>{const j=s();j&&i(j)})}),(m=document.querySelector(`#${t.prefix}-reset-all`))==null||m.addEventListener("click",()=>{const $=a();be(t.prefix,[]),n($),f(t.prefix,"Reset to schema defaults.","warning")}),(b=document.querySelector(`#${t.prefix}-save-params`))==null||b.addEventListener("click",()=>{const $=s();$&&(zn(t,$,d),f(t.prefix,"Current parameters saved to history.","success"))}),(g=document.querySelector(`#${t.prefix}-read-params`))==null||g.addEventListener("click",()=>{o()}),(k=document.querySelector(`#${t.prefix}-load-presets`))==null||k.addEventListener("click",()=>{p()}),Un(t,s,c,r),Mn(t,o),Wn({config:t,getCurrentState:s,buildPreparedTrainingPayload:c,applyEditableRecord:r}),Bn(t),qn(t,s,c)}function Kn(e,t){let a=null;const s=()=>{const c=R(e.routeId);Rn(e.prefix,c),document.querySelectorAll(`#${e.prefix}-history-panel [data-history-close]`).forEach(d=>{d.addEventListener("click",()=>A(e.prefix,"history",!1))}),document.querySelectorAll(`#${e.prefix}-history-panel [data-history-export]`).forEach(d=>{d.addEventListener("click",()=>{J(`${e.prefix}-history-${Ge()}.json`,JSON.stringify(R(e.routeId),null,2),"application/json;charset=utf-8"),f(e.prefix,"History exported.","success")})}),document.querySelectorAll(`#${e.prefix}-history-panel [data-history-import]`).forEach(d=>{d.addEventListener("click",()=>{var o;(o=document.querySelector(`#${e.prefix}-history-file-input`))==null||o.click()})}),document.querySelectorAll(`#${e.prefix}-history-panel [data-history-apply]`).forEach(d=>{d.addEventListener("click",()=>{const o=Number(d.dataset.historyApply??"-1"),p=R(e.routeId)[o];p&&(t(p.value,p.gpu_ids,"replace"),A(e.prefix,"history",!1),f(e.prefix,`Applied snapshot: ${p.name||"Unnamed snapshot"}.`,"success"))})}),document.querySelectorAll(`#${e.prefix}-history-panel [data-history-rename]`).forEach(d=>{d.addEventListener("click",()=>{const o=Number(d.dataset.historyRename??"-1"),p=R(e.routeId),m=p[o];if(!m)return;const b=window.prompt("Rename snapshot",m.name||"");b&&(m.name=b.trim(),K(e.routeId,p),s(),f(e.prefix,"Snapshot renamed.","success"))})}),document.querySelectorAll(`#${e.prefix}-history-panel [data-history-delete]`).forEach(d=>{d.addEventListener("click",()=>{const o=Number(d.dataset.historyDelete??"-1"),p=R(e.routeId),m=p[o];m&&window.confirm(`Delete snapshot "${m.name||"Unnamed snapshot"}"?`)&&(p.splice(o,1),K(e.routeId,p),s(),f(e.prefix,"Snapshot deleted.","success"))})})},n=()=>{s(),A(e.prefix,"history",!0)},i=()=>{Cn(e.prefix,a??[]),document.querySelectorAll(`#${e.prefix}-presets-panel [data-preset-close]`).forEach(c=>{c.addEventListener("click",()=>A(e.prefix,"presets",!1))}),document.querySelectorAll(`#${e.prefix}-presets-panel [data-preset-merge]`).forEach(c=>{c.addEventListener("click",()=>{const d=Number(c.dataset.presetMerge??"-1"),o=a==null?void 0:a[d];if(!o)return;const p=o.data??{};t(p,void 0,"merge"),A(e.prefix,"presets",!1),f(e.prefix,`Merged preset: ${String((o.metadata??{}).name||o.name||"preset")}.`,"success")})}),document.querySelectorAll(`#${e.prefix}-presets-panel [data-preset-replace]`).forEach(c=>{c.addEventListener("click",()=>{const d=Number(c.dataset.presetReplace??"-1"),o=a==null?void 0:a[d];if(!o)return;const p=o.data??{};t(p,void 0,"replace"),A(e.prefix,"presets",!1),f(e.prefix,`Replaced current values with preset: ${String((o.metadata??{}).name||o.name||"preset")}.`,"success")})})};return{bindHistoryPanel:s,openHistoryPanel:n,openPresetPanel:async()=>{var c;if(!a)try{const d=await Ue();a=Dn(e,((c=d.data)==null?void 0:c.presets)??[])}catch(d){f(e.prefix,d instanceof Error?d.message:"Failed to load presets.","error");return}i(),A(e.prefix,"presets",!0)}}}async function Jn(e){var c,d,o,p;const t=Aa(e.prefix),[a,s]=await Promise.allSettled([pe(),Xe()]);if(s.status==="fulfilled"){const m=((c=s.value.data)==null?void 0:c.cards)??[],b=(d=s.value.data)==null?void 0:d.xformers;un(`${e.prefix}-gpu-selector`,m),u(`${e.prefix}-runtime-title`,`${m.length} GPU entries reachable`),h(`${e.prefix}-runtime-body`,`
        <p>${l(Je(m))}</p>
        <p>${l(b?`xformers: ${b.installed?"installed":"missing"}, ${b.supported?"supported":"fallback"} (${b.reason})`:"xformers info unavailable")}</p>
      `)}else u(`${e.prefix}-runtime-title`,"GPU runtime request failed"),u(`${e.prefix}-runtime-body`,s.reason instanceof Error?s.reason.message:"Unknown error");if(a.status!=="fulfilled")return u(t.summaryId,`${e.modelLabel} schema request failed`),h(t.sectionsId,`<p>${a.reason instanceof Error?l(a.reason.message):"Unknown error"}</p>`),F(t.previewId,"{}"),S(e.prefix,"Schema unavailable",`The ${e.modelLabel} training bridge could not load the backend schema.`,"error"),null;const n=((o=a.value.data)==null?void 0:o.schemas)??[],i=Ye(n),r=(p=Q(i).find(m=>m.name===e.schemaName))==null?void 0:p.name;return r?{domIds:t,createDefaultState:()=>V(i,r)}:(u(t.summaryId,`No ${e.schemaName} schema was returned.`),h(t.sectionsId,`<p>The backend did not expose ${l(e.schemaName)}.</p>`),S(e.prefix,"Schema missing",`The backend did not expose the ${e.schemaName} schema.`,"error"),null)}const ze={};function Yn(e,t){const a=et(t),s=fe(`${e}-gpu-selector`);s.length>0&&(a.gpu_ids=s);const n=ct(a);return{payload:n,checks:En(n)}}function gt(e){return new Set(e.sections.flatMap(t=>t.fields.map(a=>a.path)))}function ft(e,t){const a=gt(e),s={...e.values};for(const[n,i]of Object.entries(t))a.has(n)&&(s[n]=i);return{...e,values:s}}function Zn(e,t){return{...e,values:{...e.values,...Object.fromEntries(Object.entries(t).filter(([a])=>gt(e).has(a)))}}}function Qn(e,t){return t&&t.length>0?t.map(a=>String(a)):Array.isArray(e.gpu_ids)?e.gpu_ids.map(a=>String(a)):[]}function es(e,t){jn(e.routeId,{time:new Date().toLocaleString(),name:ee(e,t),value:Z(t.values),gpu_ids:fe(`${e.prefix}-gpu-selector`)})}function ts(e){const{config:t,createDefaultState:a,mountTrainingState:s}=e,n=Fn(t.routeId),i=n!=null&&n.value?ft(a(),dt(n.value)):a();(n==null?void 0:n.gpu_ids)!==void 0&&be(t.prefix,n.gpu_ids),s(i),n!=null&&n.value&&f(t.prefix,"Restored autosaved parameters for this route.","success")}function as(e,t,a,s,n){return i=>{try{const r=a(i),c=Object.fromEntries(Object.entries(r.payload).sort(([d],[o])=>d.localeCompare(o)));F(t.previewId,JSON.stringify(c,null,2)),W(e.prefix,r.checks)}catch(r){F(t.previewId,"{}"),W(e.prefix,{warnings:[],errors:[]},r instanceof Error?r.message:"The current state could not be converted into a launch payload.")}s(i),n==null||n()}}function ns(e,t,a){const s=()=>ze[e.routeId],n=o=>Yn(e.prefix,o),i=as(e,t,n,o=>es(e,o),()=>Y(e.prefix)),r=o=>{H(o,t,p=>{ze[e.routeId]=p},i)};return{getCurrentState:s,prepareTrainingPayload:n,onStateChange:i,mountTrainingState:r,applyEditableRecord:(o,p,m="replace")=>{const b=m==="merge"?s()??a():a(),g=dt(o),k=m==="merge"?Zn(b,g):ft(b,g);be(e.prefix,Qn(g,p)),r(k)},restoreAutosave:()=>ts({config:e,createDefaultState:a,mountTrainingState:r})}}async function ss(e){const t=await Jn(e);if(!t)return;const a=ns(e,t.domIds,t.createDefaultState),s=Kn(e,a.applyEditableRecord);a.restoreAutosave(),Gn({config:e,createDefaultState:t.createDefaultState,getCurrentState:a.getCurrentState,mountTrainingState:a.mountTrainingState,onStateChange:a.onStateChange,applyEditableRecord:a.applyEditableRecord,buildPreparedTrainingPayload:a.prepareTrainingPayload,bindHistoryPanel:s.bindHistoryPanel,openHistoryPanel:s.openHistoryPanel,openPresetPanel:s.openPresetPanel}),S(e.prefix,`${e.modelLabel} bridge ready`,"You can review the generated payload and submit the current config to /api/run.","success"),A(e.prefix,"history",!1),A(e.prefix,"presets",!1)}const is={overview:tt,about:Na,settings:Ya,tasks:Qa,tageditor:Za,tensorboard:en,tools:tn,"schema-bridge":za,"sdxl-train":Ja,"flux-train":Fa,"sd3-train":Ma,"sd3-finetune-train":Ua,"dreambooth-train":Da,"flux-finetune-train":qa,"sd-controlnet-train":Xa,"sdxl-controlnet-train":Wa,"flux-controlnet-train":Ba,"sdxl-lllite-train":Ga,"sd-ti-train":Va,"xti-train":nn,"sdxl-ti-train":Ka,"anima-train":Ca,"anima-finetune-train":Ra,"lumina-train":Ha,"lumina-finetune-train":Oa,"hunyuan-image-train":ja};function rs(e){const t={overview:q.filter(a=>a.section==="overview"),phase1:q.filter(a=>a.section==="phase1"),reference:q.filter(a=>a.section==="reference")};return`
    <div class="nav-group">
      <p class="nav-heading">Workspace</p>
      ${t.overview.map(a=>ie(a.hash,a.label,a.description,e)).join("")}
    </div>
    <div class="nav-group">
      <p class="nav-heading">Phase 1 Pages</p>
      ${t.phase1.map(a=>ie(a.hash,a.label,a.description,e)).join("")}
    </div>
    <div class="nav-group">
      <p class="nav-heading">Core Bridge</p>
      ${t.reference.map(a=>ie(a.hash,a.label,a.description,e)).join("")}
    </div>
  `}function ie(e,t,a,s){return`
    <a class="nav-link ${e===s?"is-active":""}" href="${e}">
      <span>${t}</span>
      <small>${a}</small>
    </a>
  `}async function os(e){e==="overview"?await Jt():e==="settings"?await Yt():e==="tasks"?await ma():e==="tageditor"?await ea():e==="tools"?await ta():e==="schema-bridge"?await Ia(()=>{}):Ce[e]&&await ss(Ce[e])}async function ls(e){dn();const t=cn(),a=is[t.id]??tt;e.innerHTML=Ea(t.hash,a());const s=document.querySelector("#side-nav");s&&(s.innerHTML=rs(t.hash)),await os(t.id)}const bt=document.querySelector("#app");if(!(bt instanceof HTMLElement))throw new Error("App root not found.");const cs=bt;async function yt(){await ls(cs)}window.addEventListener("hashchange",()=>{yt()});yt();
