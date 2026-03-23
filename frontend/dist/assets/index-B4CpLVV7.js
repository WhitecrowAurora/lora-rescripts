var St=Object.defineProperty;var Tt=(e,t,a)=>t in e?St(e,t,{enumerable:!0,configurable:!0,writable:!0,value:a}):e[t]=a;var $=(e,t,a)=>Tt(e,typeof t!="symbol"?t+"":t,a);(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))n(s);new MutationObserver(s=>{for(const i of s)if(i.type==="childList")for(const r of i.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&n(r)}).observe(document,{childList:!0,subtree:!0});function a(s){const i={};return s.integrity&&(i.integrity=s.integrity),s.referrerPolicy&&(i.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?i.credentials="include":s.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function n(s){if(s.ep)return;s.ep=!0;const i=a(s);fetch(s.href,i)}})();const ke="".replace(/\/$/,"");async function P(e){const t=await fetch(`${ke}${e}`,{headers:{Accept:"application/json"}});if(!t.ok)throw new Error(`${t.status} ${t.statusText}`);return await t.json()}async function E(e,t){const a=await fetch(`${ke}${e}`,{method:"POST",headers:{Accept:"application/json","Content-Type":"application/json"},body:JSON.stringify(t)});if(!a.ok)throw new Error(`${a.status} ${a.statusText}`);return await a.json()}async function Lt(e){const t=await fetch(`${ke}${e}`,{headers:{Accept:"application/json"}});if(!t.ok)throw new Error(`${t.status} ${t.statusText}`);return await t.json()}async function At(){return P("/api/schemas/hashes")}async function _e(){return P("/api/schemas/all")}async function Ze(){return P("/api/presets")}async function Pt(){return P("/api/config/saved_params")}async function Et(){return P("/api/config/summary")}async function xe(){return P("/api/tasks")}async function Qe(e){return P(`/api/tasks/terminate/${e}`)}async function et(){return P("/api/graphic_cards")}async function tt(){return Lt("/api/tageditor_status")}async function It(){return P("/api/scripts")}async function Rt(e){return E("/api/dataset/analyze",e)}async function Nt(e){return E("/api/dataset/masked_loss_audit",e)}async function Ct(){return P("/api/interrogators")}async function O(e){var a;const t=await P(`/api/pick_file?picker_type=${encodeURIComponent(e)}`);if(t.status!=="success"||!((a=t.data)!=null&&a.path))throw new Error(t.message||"File picker did not return a path.");return t.data.path}async function Dt(e){return E("/api/interrogate",e)}async function Bt(e){return E("/api/captions/cleanup/preview",e)}async function qt(e){return E("/api/captions/cleanup/apply",e)}async function Ft(e){return E("/api/captions/backups/create",e)}async function jt(e){return E("/api/captions/backups/list",e)}async function Ot(e){return E("/api/captions/backups/restore",e)}async function Ht(e){return E("/api/run",e)}async function zt(e){return E("/api/train/preflight",e)}async function Mt(e){return E("/api/train/sample_prompt",e)}function u(e,t){const a=document.querySelector(`#${e}`);a&&(a.textContent=t)}function m(e,t){const a=document.querySelector(`#${e}`);a&&(a.innerHTML=t)}function M(e,t){const a=document.querySelector(`#${e}`);a&&(a.textContent=t)}const at=[{route:"index.html",title:"SD-reScripts | SD training UI",section:"core",status:"migrate-first",notes:"Landing page and main navigation entry. Good first candidate for source migration."},{route:"lora/index.html",title:"LoRA training index",section:"training",status:"migrate-first",notes:"Top-level training model selector page.",schemaHints:["shared"]},{route:"lora/sdxl.html",title:"SDXL LoRA training",section:"training",status:"migrate-first",notes:"Primary training page currently used most often.",schemaHints:["sdxl-lora","shared"]},{route:"lora/flux.html",title:"Flux LoRA training",section:"training",status:"migrate-first",notes:"Now mirrored by the shared source-side training bridge.",schemaHints:["flux-lora","shared"]},{route:"lora/sd3.html",title:"SD3 training",section:"training",status:"migrate-first",notes:"Now mirrored by the shared source-side training bridge.",schemaHints:["sd3-lora","shared"]},{route:"lora/controlnet.html",title:"SD ControlNet training",section:"training",status:"migrate-first",notes:"Now mirrored by the shared source-side training bridge.",schemaHints:["sd-controlnet","shared"]},{route:"lora/sdxl-controlnet.html",title:"SDXL ControlNet training",section:"training",status:"migrate-first",notes:"Now mirrored by the shared source-side training bridge.",schemaHints:["sdxl-controlnet","shared"]},{route:"lora/sdxl-lllite.html",title:"SDXL LLLite training",section:"training",status:"migrate-first",notes:"Specialized SDXL conditioning route now mirrored by the shared source-side bridge.",schemaHints:["sdxl-controlnet-lllite","shared"]},{route:"lora/flux-controlnet.html",title:"Flux ControlNet training",section:"training",status:"migrate-first",notes:"Now mirrored by the shared source-side training bridge.",schemaHints:["flux-controlnet","shared"]},{route:"lora/basic.html",title:"LoRA basic mode",section:"training",status:"legacy-dist",notes:"Legacy beginner-mode training route.",schemaHints:["lora-basic","shared"]},{route:"lora/master.html",title:"LoRA expert mode",section:"training",status:"legacy-dist",notes:"Legacy expert-mode training route.",schemaHints:["lora-master","shared"]},{route:"lora/params.html",title:"Training parameter reference",section:"training",status:"migrate-first",notes:"Mostly explanatory UI. Lower risk to recreate cleanly."},{route:"lora/tools.html",title:"LoRA tools",section:"tools",status:"migrate-first",notes:"Tool launcher route for merge, resize, interrogate and conversion flows."},{route:"dreambooth/index.html",title:"Dreambooth training",section:"training",status:"migrate-first",notes:"Now mirrored by the shared source-side training bridge for Dreambooth and SDXL full finetune.",schemaHints:["dreambooth","shared"]},{route:"tagger.html",title:"Tagger tool",section:"tools",status:"migrate-first",notes:"Standalone caption/tag generation route that talks to backend APIs.",schemaHints:["tagger"]},{route:"tageditor.html",title:"Tag editor proxy page",section:"tools",status:"migrate-first",notes:"Wrapper page with progress/failure states. Good candidate to reimplement cleanly."},{route:"task.html",title:"Task monitor",section:"system",status:"migrate-first",notes:"Task status page backed by /api/tasks."},{route:"tensorboard.html",title:"TensorBoard proxy page",section:"system",status:"migrate-first",notes:"Wrapper/proxy page. Safer than schema-heavy form routes."},{route:"other/settings.html",title:"Settings page",section:"system",status:"migrate-first",notes:"Static/system page that should be easy to recreate in source form."},{route:"other/about.html",title:"About page",section:"core",status:"migrate-first",notes:"Mostly branding and release notes. Best low-risk migration target."},{route:"404.html",title:"Fallback page",section:"core",status:"legacy-dist",notes:"Can be replaced after the main router is rebuilt."}];function o(e){return String(e).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;")}function U(e){return JSON.parse(JSON.stringify(e))}function ue(e=new Date){return e.toISOString().replaceAll(":","-").replaceAll(".","-")}function Ut(e){if(e.length===0){m("schema-browser","<p>No schemas returned.</p>");return}const t=e.map(a=>{var s;const n=((s=a.schema.split(/\r?\n/).find(i=>i.trim().length>0))==null?void 0:s.trim())||"No preview available.";return`
        <article class="schema-card">
          <div class="schema-head">
            <h3>${o(a.name)}</h3>
            <span class="schema-hash">${o(a.hash.slice(0,8))}</span>
          </div>
          <p>${o(n)}</p>
        </article>
      `}).join("");m("schema-browser",t)}function Xt(e){const t=new Set(at.flatMap(i=>i.schemaHints??[])),a=new Set(e.map(i=>i.name)),n=[...t].filter(i=>a.has(i)).sort(),s=e.map(i=>i.name).filter(i=>!t.has(i)).sort();m("schema-mapped",n.length?n.map(i=>`<span class="coverage-pill">${o(i)}</span>`).join(""):"<p>No mapped schema hints yet.</p>"),m("schema-unmapped",s.length?s.map(i=>`<span class="coverage-pill coverage-pill-muted">${o(i)}</span>`).join(""):"<p>All schemas are represented in the current route hints.</p>")}function Vt(e){if(!e.length){m("training-catalog","<p>No training routes were registered.</p>");return}const t=e.length,a=e.filter(c=>c.schemaAvailable).length,n=e.filter(c=>c.presetCount>0).length,s=new Map;for(const c of e)s.set(c.family,(s.get(c.family)??0)+1);const i=`
    <section class="dataset-analysis-grid training-catalog-summary">
      <article class="dataset-analysis-stat">
        <span class="metric-label">Training routes</span>
        <strong class="dataset-analysis-stat-value">${t}</strong>
      </article>
      <article class="dataset-analysis-stat">
        <span class="metric-label">Schema-backed</span>
        <strong class="dataset-analysis-stat-value">${a}</strong>
      </article>
      <article class="dataset-analysis-stat">
        <span class="metric-label">Preset-covered</span>
        <strong class="dataset-analysis-stat-value">${n}</strong>
      </article>
      <article class="dataset-analysis-stat">
        <span class="metric-label">Families</span>
        <strong class="dataset-analysis-stat-value">${s.size}</strong>
      </article>
    </section>
  `,r=e.map(c=>`
        <article class="training-catalog-card" data-family="${o(c.family)}">
          <div class="training-catalog-head">
            <div>
              <p class="panel-kicker">${o(c.family)}</p>
              <h3>${o(c.title)}</h3>
            </div>
            <a class="text-link" href="${o(c.routeHash)}">Open</a>
          </div>
          <p class="training-catalog-route"><code>${o(c.routeHash)}</code></p>
          <p class="training-catalog-meta">
            Schema: <code>${o(c.schemaName)}</code>
            · Model: <strong>${o(c.modelLabel)}</strong>
          </p>
          <div class="coverage-list">
            <span class="coverage-pill ${c.schemaAvailable?"":"coverage-pill-muted"}">${c.schemaAvailable?"schema ok":"schema missing"}</span>
            <span class="coverage-pill ${c.presetCount>0?"":"coverage-pill-muted"}">${c.presetCount} presets</span>
          </div>
        </article>
      `).join("");m("training-catalog",`
      ${i}
      <div class="training-catalog-grid">${r}</div>
    `)}function Wt(e){if(e.length===0){m("task-table-container","<p>No tasks currently tracked.</p>");return}const t=e.map(a=>`
        <tr>
          <td><code>${o(a.id??a.task_id??"unknown")}</code></td>
          <td>${o(a.status??"unknown")}</td>
          <td>
            <button class="action-button action-button-small" data-task-terminate="${o(a.id??a.task_id??"")}" type="button">
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
        <tbody>${t}</tbody>
      </table>
    `)}function Gt(e){if(e.length===0){m("tools-browser","<p>No scripts returned.</p>");return}const t=e.map(a=>`
        <article class="tool-card">
          <div class="tool-card-head">
            <h3>${o(a.name)}</h3>
            <span class="coverage-pill ${a.category==="networks"?"":"coverage-pill-muted"}">${o(a.category)}</span>
          </div>
          <p>${a.positional_args.length>0?`Positional args: ${a.positional_args.map(n=>`<code>${o(n)}</code>`).join(", ")}`:"No positional args required."}</p>
        </article>
      `).join("");m("tools-browser",t)}function Kt(e){const t=[{label:"Images",value:e.summary.image_count},{label:"Effective images",value:e.summary.effective_image_count},{label:"Alpha-capable candidates",value:e.summary.alpha_capable_image_count},{label:"Caption coverage",value:Z(e.summary.caption_coverage)},{label:"Unique tags",value:e.summary.unique_tag_count},{label:"Caption files",value:e.summary.caption_file_count},{label:"Avg tags / caption",value:e.summary.average_tags_per_caption.toFixed(2)}],a=e.warnings.length?`
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
                  ${Z(s.caption_coverage)}
                </span>
              </div>
              <p><code>${o(s.path)}</code></p>
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
          `).join(""):"<p>No dataset folder summary returned.</p>";m("dataset-analysis-results",`
      ${a}
      <section class="dataset-analysis-grid">
        ${t.map(s=>`
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
          <p>Alpha-capable candidates: <strong>${e.summary.alpha_capable_image_count}</strong></p>
          <p>Images without captions: <strong>${e.summary.images_without_caption_count}</strong></p>
          <p>Broken images: <strong>${e.summary.broken_image_count}</strong></p>
        </article>
        <article class="dataset-analysis-block">
          <p class="panel-kicker">tags</p>
          <h3>Top tags</h3>
          ${st(e.top_tags,"No caption tags found yet.")}
        </article>
        <article class="dataset-analysis-block">
          <p class="panel-kicker">images</p>
          <h3>Top resolutions</h3>
          ${re(e.top_resolutions,"No resolution data collected.")}
        </article>
        <article class="dataset-analysis-block">
          <p class="panel-kicker">mix</p>
          <h3>Orientation + formats</h3>
          <div>${re(e.orientation_counts,"No orientation data.")}</div>
          <div class="dataset-analysis-sublist">${re(e.image_extensions,"No image extension data.")}</div>
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
    `)}function Jt(e,t="masked-loss-audit-results"){const a=[{label:"Images",value:e.summary.image_count},{label:"Alpha channel images",value:e.summary.alpha_channel_image_count},{label:"Usable masks",value:e.summary.usable_mask_image_count},{label:"Soft alpha masks",value:e.summary.soft_alpha_image_count},{label:"Binary alpha masks",value:e.summary.binary_alpha_image_count},{label:"Avg masked area",value:Z(e.summary.average_mask_coverage)},{label:"Avg alpha weight",value:Z(e.summary.average_alpha_weight)}],n=e.warnings.length?`
      <article class="dataset-analysis-block dataset-analysis-warning">
        <p class="panel-kicker">warnings</p>
        <ul class="dataset-analysis-list-plain">
          ${e.warnings.map(s=>`<li>${o(s)}</li>`).join("")}
        </ul>
      </article>
    `:"";m(t,`
      ${n}
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
          <p class="panel-kicker">dataset</p>
          <h3>Alpha mask readiness</h3>
          <p><code>${o(e.root_path)}</code></p>
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
            ${e.guidance.map(s=>`<li>${o(s)}</li>`).join("")}
          </ul>
        </article>
      </section>
      <section class="dataset-analysis-columns">
        <article class="dataset-analysis-block">
          <p class="panel-kicker">samples</p>
          <h3>Usable mask files</h3>
          ${A(e.samples.usable_masks,"No usable alpha-mask samples were found.")}
        </article>
        <article class="dataset-analysis-block">
          <p class="panel-kicker">samples</p>
          <h3>Soft alpha files</h3>
          ${A(e.samples.soft_alpha_masks,"No soft alpha-mask samples were found.")}
        </article>
        <article class="dataset-analysis-block">
          <p class="panel-kicker">samples</p>
          <h3>Opaque alpha files</h3>
          ${A(e.samples.fully_opaque_alpha,"No fully opaque alpha-channel samples were found.")}
        </article>
        <article class="dataset-analysis-block">
          <p class="panel-kicker">samples</p>
          <h3>No alpha files</h3>
          ${A(e.samples.no_alpha,"No non-alpha samples were captured.")}
        </article>
      </section>
    `)}function Yt(e,t="caption-cleanup-results"){const a=[{label:"Caption files",value:e.summary.file_count},{label:"Changed",value:e.summary.changed_file_count},{label:"Unchanged",value:e.summary.unchanged_file_count},{label:"Tag instances removed",value:e.summary.removed_tag_instances},{label:"Tag instances added",value:e.summary.added_tag_instances},{label:"Empty results",value:e.summary.empty_result_count}],n=e.warnings.length?`
      <article class="dataset-analysis-block dataset-analysis-warning">
        <p class="panel-kicker">warnings</p>
        <ul class="dataset-analysis-list-plain">
          ${e.warnings.map(i=>`<li>${o(i)}</li>`).join("")}
        </ul>
      </article>
    `:"",s=e.samples.length?e.samples.map(i=>`
            <article class="dataset-analysis-block">
              <div class="tool-card-head">
                <h3>${o(i.path)}</h3>
                <span class="coverage-pill ${i.before!==i.after?"":"coverage-pill-muted"}">
                  ${i.before_count} -> ${i.after_count}
                </span>
              </div>
              <div class="dataset-cleanup-diff">
                <div>
                  <p class="panel-kicker">before</p>
                  <pre>${o(i.before||"(empty)")}</pre>
                </div>
                <div>
                  <p class="panel-kicker">after</p>
                  <pre>${o(i.after||"(empty)")}</pre>
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
          `).join(""):"<p>No sample caption changes were captured.</p>";m(t,`
      ${n}
      <section class="dataset-analysis-grid">
        ${a.map(i=>`
              <article class="dataset-analysis-stat">
                <span class="metric-label">${o(i.label)}</span>
                <strong class="dataset-analysis-stat-value">${o(i.value)}</strong>
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
          ${st([e.options.dedupe_tags?{name:"dedupe tags",count:1}:null,e.options.sort_tags?{name:"sort tags",count:1}:null,e.options.use_regex?{name:"regex replace",count:1}:null].filter(Boolean),"No boolean cleanup switches enabled.")}
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
    `)}function Zt(e,t,a="caption-backup-results"){if(!e.length){m(a,`
        <article class="dataset-analysis-block">
          <p class="panel-kicker">snapshots</p>
          <h3>No caption snapshots found</h3>
          <p>Create the first backup for this folder to get a restore point before cleanup or tagging.</p>
        </article>
      `);return}const n=e.map(s=>`
        <article class="dataset-analysis-block ${s.archive_name===t?"dataset-analysis-selected":""}">
          <div class="tool-card-head">
            <h3>${o(s.snapshot_name)}</h3>
            <span class="coverage-pill ${s.archive_name===t?"":"coverage-pill-muted"}">
              ${o(s.archive_name)}
            </span>
          </div>
          <p><code>${o(s.source_root)}</code></p>
          <p>Created: <strong>${o(s.created_at||"unknown")}</strong></p>
          <p>Caption files: <strong>${s.file_count}</strong> · Archive size: <strong>${ea(s.archive_size)}</strong></p>
          <p>Extension: <code>${o(s.caption_extension||".txt")}</code> · Recursive: <strong>${s.recursive?"yes":"no"}</strong></p>
        </article>
      `).join("");m(a,`<div class="dataset-analysis-stack">${n}</div>`)}function Qt(e,t="caption-backup-results"){const a=e.warnings.length?`
      <article class="dataset-analysis-block dataset-analysis-warning">
        <p class="panel-kicker">warnings</p>
        <ul class="dataset-analysis-list-plain">
          ${e.warnings.map(n=>`<li>${o(n)}</li>`).join("")}
        </ul>
      </article>
    `:"";m(t,`
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
    `)}function st(e,t){return e.length?`
    <div class="coverage-list">
      ${e.map(a=>`<span class="coverage-pill">${o(a.name)} <strong>${a.count}</strong></span>`).join("")}
    </div>
  `:`<p>${o(t)}</p>`}function re(e,t){return e.length?`
    <ul class="dataset-analysis-list-plain">
      ${e.map(a=>`<li><code>${o(a.name)}</code> <strong>${a.count}</strong></li>`).join("")}
    </ul>
  `:`<p>${o(t)}</p>`}function A(e,t){return e.length?`
    <ul class="dataset-analysis-list-plain">
      ${e.map(a=>`<li><code>${o(a)}</code></li>`).join("")}
    </ul>
  `:`<p>${o(t)}</p>`}function Z(e){return`${(e*100).toFixed(1)}%`}function ea(e){return e<1024?`${e} B`:e<1024**2?`${(e/1024).toFixed(1)} KB`:e<1024**3?`${(e/1024**2).toFixed(1)} MB`:`${(e/1024**3).toFixed(2)} GB`}function nt(e){return e.length===0?"No cards reported yet.":e.map((t,a)=>`GPU ${t.index??t.id??a}: ${t.name}`).join(" | ")}function ta(e){if(e.length===0)return"No tasks currently tracked.";const t=e.filter(a=>a.status&&!["FINISHED","TERMINATED","FAILED"].includes(String(a.status))).length;return`${e.length} tracked, ${t} active`}function aa(e){var a;const t=(a=e.detail)==null?void 0:a.trim();return t?`${e.status} - ${t}`:e.status}const F="#/workspace",j=[{id:"overview",label:"Workspace",section:"overview",hash:F,description:"Source migration dashboard and live backend diagnostics."},{id:"about",label:"About",section:"phase1",hash:"#/about",description:"Rebuild branding and release notes in source form."},{id:"settings",label:"Settings",section:"phase1",hash:"#/settings",description:"Read config summary and saved parameter state from the backend."},{id:"tasks",label:"Tasks",section:"phase1",hash:"#/tasks",description:"Inspect and manage task execution state."},{id:"tageditor",label:"Tag Editor",section:"phase1",hash:"#/tageditor",description:"Track startup status and future proxy behavior."},{id:"tensorboard",label:"TensorBoard",section:"phase1",hash:"#/tensorboard",description:"Prepare a cleaner source-side wrapper for TensorBoard access."},{id:"tools",label:"Tools",section:"phase1",hash:"#/tools",description:"Migrate script-launch and utility entry points from the legacy tools page."},{id:"schema-bridge",label:"Schema Bridge",section:"reference",hash:"#/schema-bridge",description:"Evaluate current schema DSL into a source-side explorer and prototype form renderer."},{id:"sdxl-train",label:"SDXL Train",section:"reference",hash:"#/sdxl-train",description:"First source-side training page powered by the schema bridge and current `/api/run` backend."},{id:"flux-train",label:"Flux Train",section:"reference",hash:"#/flux-train",description:"Source-side Flux LoRA training route built on the shared schema bridge and launch pipeline."},{id:"sd3-train",label:"SD3 Train",section:"reference",hash:"#/sd3-train",description:"Source-side SD3 LoRA training route using the same normalized payload workflow."},{id:"sd3-finetune-train",label:"SD3 Finetune",section:"reference",hash:"#/sd3-finetune-train",description:"Source-side SD3 finetune route on the shared training bridge."},{id:"dreambooth-train",label:"Dreambooth",section:"reference",hash:"#/dreambooth-train",description:"Source-side Dreambooth and SDXL full-finetune route on the shared schema bridge."},{id:"flux-finetune-train",label:"Flux Finetune",section:"reference",hash:"#/flux-finetune-train",description:"Source-side Flux full-finetune route using the shared launch workflow."},{id:"sd-controlnet-train",label:"SD ControlNet",section:"reference",hash:"#/sd-controlnet-train",description:"Source-side SD ControlNet training route using the shared launch flow."},{id:"sdxl-controlnet-train",label:"SDXL ControlNet",section:"reference",hash:"#/sdxl-controlnet-train",description:"Source-side SDXL ControlNet training route using the shared launch flow."},{id:"flux-controlnet-train",label:"Flux ControlNet",section:"reference",hash:"#/flux-controlnet-train",description:"Source-side Flux ControlNet training route using the shared launch flow."},{id:"sdxl-lllite-train",label:"SDXL LLLite",section:"reference",hash:"#/sdxl-lllite-train",description:"Source-side SDXL ControlNet-LLLite training route on the shared training bridge."},{id:"sd-ti-train",label:"SD TI",section:"reference",hash:"#/sd-ti-train",description:"Source-side SD textual inversion route on the shared training bridge."},{id:"xti-train",label:"SD XTI",section:"reference",hash:"#/xti-train",description:"Source-side SD XTI textual inversion route on the shared training bridge."},{id:"sdxl-ti-train",label:"SDXL TI",section:"reference",hash:"#/sdxl-ti-train",description:"Source-side SDXL textual inversion route on the shared training bridge."},{id:"anima-train",label:"Anima LoRA",section:"reference",hash:"#/anima-train",description:"Source-side Anima LoRA training route using the shared launch flow."},{id:"anima-finetune-train",label:"Anima Finetune",section:"reference",hash:"#/anima-finetune-train",description:"Source-side Anima finetune route using the shared launch flow."},{id:"lumina-train",label:"Lumina LoRA",section:"reference",hash:"#/lumina-train",description:"Source-side Lumina LoRA training route using the shared launch flow."},{id:"lumina-finetune-train",label:"Lumina Finetune",section:"reference",hash:"#/lumina-finetune-train",description:"Source-side Lumina finetune route using the shared launch flow."},{id:"hunyuan-image-train",label:"Hunyuan Image",section:"reference",hash:"#/hunyuan-image-train",description:"Source-side Hunyuan Image LoRA training route using the shared launch flow."}],it=new Set(j.map(e=>e.hash)),rt={"/index.html":F,"/index.md":F,"/404.html":F,"/404.md":F,"/task.html":"#/tasks","/task.md":"#/tasks","/tageditor.html":"#/tageditor","/tageditor.md":"#/tageditor","/tagger.html":"#/tageditor","/tagger.md":"#/tageditor","/tensorboard.html":"#/tensorboard","/tensorboard.md":"#/tensorboard","/other/about.html":"#/about","/other/about.md":"#/about","/other/settings.html":"#/settings","/other/settings.md":"#/settings","/dreambooth/index.html":"#/dreambooth-train","/dreambooth/index.md":"#/dreambooth-train","/lora/index.html":"#/sdxl-train","/lora/index.md":"#/sdxl-train"},sa=Object.keys(rt).sort((e,t)=>t.length-e.length);function we(e){const t=e.replace(/\/+$/,"");return t.length>0?`${t}/`:"/"}function na(e){switch(e){case"flux":return"#/flux-train";case"flux-finetune":return"#/flux-finetune-train";case"sd3":return"#/sd3-train";case"sd3-finetune":return"#/sd3-finetune-train";case"controlnet":return"#/sd-controlnet-train";case"sdxl-controlnet":return"#/sdxl-controlnet-train";case"flux-controlnet":return"#/flux-controlnet-train";case"sdxl-lllite":return"#/sdxl-lllite-train";case"tools":return"#/tools";case"basic":case"master":case"params":case"sdxl":return"#/sdxl-train";case"sdxl-ti":return"#/sdxl-ti-train";case"ti":return"#/sd-ti-train";case"xti":return"#/xti-train";case"anima":return"#/anima-train";case"anima-finetune":return"#/anima-finetune-train";case"hunyuan":return"#/hunyuan-image-train";case"lumina":return"#/lumina-train";case"lumina-finetune":return"#/lumina-finetune-train";default:return null}}function ia(e){const t=e.match(/^(.*)\/lora\/([^/]+)\.(?:html|md)$/i);if(!t)return null;const[,a,n]=t,s=na(n.toLowerCase());return s?{hash:s,canonicalRootPath:we(a)}:null}function ra(e){const t=e.toLowerCase();for(const a of sa)if(t.endsWith(a))return{hash:rt[a],canonicalRootPath:we(e.slice(0,e.length-a.length))};return ia(e)}function Ie(e,t){const a=`${e}${window.location.search}${t}`,n=`${window.location.pathname}${window.location.search}${window.location.hash}`;a!==n&&window.history.replaceState(null,"",a)}function oa(){const e=it.has(window.location.hash)?window.location.hash:F;return j.find(t=>t.hash===e)??j[0]}function la(){if(it.has(window.location.hash))return;const e=ra(window.location.pathname);if(e){Ie(e.canonicalRootPath,e.hash);return}Ie(we(window.location.pathname||"/"),F)}const pe={"sdxl-train":{routeId:"sdxl-train",schemaName:"sdxl-lora",prefix:"sdxl",modelLabel:"SDXL",presetTrainTypes:["sdxl-lora"]},"flux-train":{routeId:"flux-train",schemaName:"flux-lora",prefix:"flux",modelLabel:"Flux",presetTrainTypes:["flux-lora"]},"sd3-train":{routeId:"sd3-train",schemaName:"sd3-lora",prefix:"sd3",modelLabel:"SD3",presetTrainTypes:["sd3-lora"]},"sd3-finetune-train":{routeId:"sd3-finetune-train",schemaName:"sd3-finetune",prefix:"sd3-finetune",modelLabel:"SD3 Finetune",presetTrainTypes:["sd3-finetune"]},"dreambooth-train":{routeId:"dreambooth-train",schemaName:"dreambooth",prefix:"dreambooth",modelLabel:"Dreambooth",presetTrainTypes:["dreambooth","sd-dreambooth","sdxl-finetune"]},"flux-finetune-train":{routeId:"flux-finetune-train",schemaName:"flux-finetune",prefix:"flux-finetune",modelLabel:"Flux Finetune",presetTrainTypes:["flux-finetune"]},"sd-controlnet-train":{routeId:"sd-controlnet-train",schemaName:"sd-controlnet",prefix:"sd-controlnet",modelLabel:"SD ControlNet",presetTrainTypes:["sd-controlnet"]},"sdxl-controlnet-train":{routeId:"sdxl-controlnet-train",schemaName:"sdxl-controlnet",prefix:"sdxl-controlnet",modelLabel:"SDXL ControlNet",presetTrainTypes:["sdxl-controlnet"]},"flux-controlnet-train":{routeId:"flux-controlnet-train",schemaName:"flux-controlnet",prefix:"flux-controlnet",modelLabel:"Flux ControlNet",presetTrainTypes:["flux-controlnet"]},"sdxl-lllite-train":{routeId:"sdxl-lllite-train",schemaName:"sdxl-controlnet-lllite",prefix:"sdxl-lllite",modelLabel:"SDXL LLLite",presetTrainTypes:["sdxl-controlnet-lllite"]},"sd-ti-train":{routeId:"sd-ti-train",schemaName:"sd-textual-inversion",prefix:"sd-ti",modelLabel:"SD Textual Inversion",presetTrainTypes:["sd-textual-inversion"]},"xti-train":{routeId:"xti-train",schemaName:"sd-textual-inversion-xti",prefix:"xti",modelLabel:"SD XTI",presetTrainTypes:["sd-textual-inversion-xti"]},"sdxl-ti-train":{routeId:"sdxl-ti-train",schemaName:"sdxl-textual-inversion",prefix:"sdxl-ti",modelLabel:"SDXL Textual Inversion",presetTrainTypes:["sdxl-textual-inversion"]},"anima-train":{routeId:"anima-train",schemaName:"anima-lora",prefix:"anima",modelLabel:"Anima LoRA",presetTrainTypes:["anima-lora"]},"anima-finetune-train":{routeId:"anima-finetune-train",schemaName:"anima-finetune",prefix:"anima-finetune",modelLabel:"Anima Finetune",presetTrainTypes:["anima-finetune"]},"lumina-train":{routeId:"lumina-train",schemaName:"lumina-lora",prefix:"lumina",modelLabel:"Lumina LoRA",presetTrainTypes:["lumina-lora"]},"lumina-finetune-train":{routeId:"lumina-finetune-train",schemaName:"lumina-finetune",prefix:"lumina-finetune",modelLabel:"Lumina Finetune",presetTrainTypes:["lumina-finetune"]},"hunyuan-image-train":{routeId:"hunyuan-image-train",schemaName:"hunyuan-image-lora",prefix:"hunyuan-image",modelLabel:"Hunyuan Image LoRA",presetTrainTypes:["hunyuan-image-lora"]}};async function ca(){var c,h,l,d,p,g,f,k;const e=await Promise.allSettled([At(),Ze(),xe(),et(),tt(),_e()]),[t,a,n,s,i,r]=e;if(t.status==="fulfilled"){const _=((c=t.value.data)==null?void 0:c.schemas)??[];u("diag-schemas-title",`${_.length} schema hashes loaded`),u("diag-schemas-detail",_.slice(0,4).map(T=>T.name).join(", ")||"No schema names returned.")}else u("diag-schemas-title","Schema hash request failed"),u("diag-schemas-detail",t.reason instanceof Error?t.reason.message:"Unknown error");if(a.status==="fulfilled"){const _=((h=a.value.data)==null?void 0:h.presets)??[];u("diag-presets-title",`${_.length} presets loaded`),u("diag-presets-detail","Source migration can reuse preset grouping later.")}else u("diag-presets-title","Preset request failed"),u("diag-presets-detail",a.reason instanceof Error?a.reason.message:"Unknown error");if(n.status==="fulfilled"){const _=((l=n.value.data)==null?void 0:l.tasks)??[];u("diag-tasks-title","Task manager reachable"),u("diag-tasks-detail",ta(_))}else u("diag-tasks-title","Task request failed"),u("diag-tasks-detail",n.reason instanceof Error?n.reason.message:"Unknown error");if(s.status==="fulfilled"){const _=((d=s.value.data)==null?void 0:d.cards)??[],T=(p=s.value.data)==null?void 0:p.xformers,D=T?`xformers: ${T.installed?"installed":"missing"}, ${T.supported?"supported":"fallback"}`:"xformers info unavailable";u("diag-gpu-title",`${_.length} GPU entries reachable`),u("diag-gpu-detail",`${nt(_)} | ${D}`)}else u("diag-gpu-title","GPU request failed"),u("diag-gpu-detail",s.reason instanceof Error?s.reason.message:"Unknown error");if(i.status==="fulfilled"?(u("diag-tageditor-title","Tag editor status reachable"),u("diag-tageditor-detail",aa(i.value))):(u("diag-tageditor-title","Tag editor status request failed"),u("diag-tageditor-detail",i.reason instanceof Error?i.reason.message:"Unknown error")),r.status==="fulfilled"){const _=((g=r.value.data)==null?void 0:g.schemas)??[];Ut(_),Xt(_),Re(_.map(T=>T.name),a.status==="fulfilled"?((f=a.value.data)==null?void 0:f.presets)??[]:[])}else m("schema-browser",`<p>${r.reason instanceof Error?r.reason.message:"Schema inventory request failed."}</p>`),Re([],a.status==="fulfilled"?((k=a.value.data)==null?void 0:k.presets)??[]:[])}function da(e){return e.includes("controlnet")?"ControlNet":e.includes("textual-inversion")||e.includes("xti")?"Textual Inversion":e.includes("finetune")||e==="dreambooth"?"Finetune":"LoRA"}function Re(e,t){const a=new Set(e),n=Object.values(pe).map(s=>{const i=j.find(c=>c.id===s.routeId),r=t.filter(c=>{const l=(c.metadata??{}).train_type;return typeof l!="string"||l.trim().length===0?!1:s.presetTrainTypes.includes(l)}).length;return{routeId:s.routeId,title:(i==null?void 0:i.label)??s.modelLabel,routeHash:(i==null?void 0:i.hash)??"#/workspace",schemaName:s.schemaName,modelLabel:s.modelLabel,family:da(s.schemaName),presetCount:r,schemaAvailable:a.has(s.schemaName)}}).sort((s,i)=>s.family.localeCompare(i.family)||s.title.localeCompare(i.title));Vt(n)}async function ua(){const[e,t]=await Promise.allSettled([Et(),Pt()]);if(e.status==="fulfilled"){const a=e.value.data;u("settings-summary-title",`${(a==null?void 0:a.saved_param_count)??0} remembered param groups`),m("settings-summary-body",`
        <p><strong>Config file:</strong> <code>${o((a==null?void 0:a.config_path)??"unknown")}</code></p>
        <p><strong>Last path:</strong> <code>${o((a==null?void 0:a.last_path)||"(empty)")}</code></p>
        <p><strong>Saved keys:</strong> ${((a==null?void 0:a.saved_param_keys)??[]).map(n=>`<code>${o(n)}</code>`).join(", ")||"none"}</p>
      `)}else u("settings-summary-title","Config summary request failed"),u("settings-summary-body",e.reason instanceof Error?e.reason.message:"Unknown error");if(t.status==="fulfilled"){const a=t.value.data??{},n=Object.keys(a);u("settings-params-title",`${n.length} saved param entries`),m("settings-params-body",n.length?`<div class="coverage-list">${n.map(s=>`<span class="coverage-pill coverage-pill-muted">${o(s)}</span>`).join("")}</div>`:"<p>No saved params returned.</p>")}else u("settings-params-title","Saved params request failed"),u("settings-params-body",t.reason instanceof Error?t.reason.message:"Unknown error")}const pa="".replace(/\/$/,""),ha=pa||"";function R(e){return/^https?:\/\//.test(e)?e:(e.startsWith("/")||(e=`/${e}`),`${ha}${e}`)}async function ma(){try{const e=await tt();u("tag-editor-status-title",`Current status: ${e.status}`),m("tag-editor-status-body",`
        <p>${o(e.detail||"No extra detail returned.")}</p>
        <p><a class="text-link" href="${R("/tageditor.html")}" target="_blank" rel="noreferrer">Open current shipped wrapper page</a></p>
      `)}catch(e){u("tag-editor-status-title","Tag editor status request failed"),u("tag-editor-status-body",e instanceof Error?e.message:"Unknown error")}}async function ga(){var e;ba(),fa(),await ya(),va(),ka();try{const a=((e=(await It()).data)==null?void 0:e.scripts)??[];u("tools-summary-title",`${a.length} launcher scripts available`),m("tools-summary-body",`
        <p>Categories: ${[...new Set(a.map(n=>n.category))].map(n=>`<code>${o(n)}</code>`).join(", ")}</p>
        <p>The tools workspace now includes dataset analysis, masked-loss alpha inspection, batch auto-tagging, caption cleanup, and caption restore snapshots, with more curated high-frequency flows still planned.</p>
      `),Gt(a)}catch(t){u("tools-summary-title","Script inventory request failed"),u("tools-summary-body",t instanceof Error?t.message:"Unknown error"),m("tools-browser","<p>Tool inventory failed to load.</p>")}}function fa(){const e=xa();e&&(e.browseButton.addEventListener("click",async()=>{u("masked-loss-audit-status","Opening folder picker...");try{e.pathInput.value=await O("folder"),u("masked-loss-audit-status","Folder selected. Ready to inspect alpha masks.")}catch(t){u("masked-loss-audit-status",t instanceof Error?t.message:"Folder picker failed.")}}),e.runButton.addEventListener("click",()=>{Ce(e)}),e.pathInput.addEventListener("keydown",t=>{t.key==="Enter"&&(t.preventDefault(),Ce(e))}))}function ba(){const e=_a();e&&(e.browseButton.addEventListener("click",async()=>{u("dataset-analysis-status","Opening folder picker...");try{e.pathInput.value=await O("folder"),u("dataset-analysis-status","Folder selected. Ready to analyze.")}catch(t){u("dataset-analysis-status",t instanceof Error?t.message:"Folder picker failed.")}}),e.runButton.addEventListener("click",()=>{Ne(e)}),e.pathInput.addEventListener("keydown",t=>{t.key==="Enter"&&(t.preventDefault(),Ne(e))}))}async function ya(){var t;const e=wa();if(e){e.browseButton.addEventListener("click",async()=>{u("batch-tagger-status","Opening folder picker...");try{e.pathInput.value=await O("folder"),u("batch-tagger-status","Folder selected. Ready to launch batch tagging.")}catch(a){u("batch-tagger-status",a instanceof Error?a.message:"Folder picker failed.")}}),e.runButton.addEventListener("click",()=>{De(e)}),e.pathInput.addEventListener("keydown",a=>{a.key==="Enter"&&(a.preventDefault(),De(e))});try{const a=await Ct(),n=((t=a.data)==null?void 0:t.interrogators)??[];if(!n.length)throw new Error("No interrogator models returned.");e.modelSelect.innerHTML=n.map(s=>{var c;const i=s.is_default||s.name===((c=a.data)==null?void 0:c.default)?" selected":"",r=s.kind==="cl"?"CL":"WD";return`<option value="${o(s.name)}"${i}>${o(s.name)} (${r})</option>`}).join(""),u("batch-tagger-status",`Loaded ${n.length} interrogator models.`)}catch(a){e.modelSelect.innerHTML='<option value="wd14-convnextv2-v2">wd14-convnextv2-v2 (WD)</option>',u("batch-tagger-status",a instanceof Error?a.message:"Failed to load interrogator inventory."),m("batch-tagger-results",`<article class="dataset-analysis-block dataset-analysis-warning"><p>${o(a instanceof Error?a.message:"Failed to load interrogator inventory.")}</p></article>`)}}}function va(){const e=$a();e&&(e.browseButton.addEventListener("click",async()=>{u("caption-cleanup-status","Opening folder picker...");try{e.pathInput.value=await O("folder"),u("caption-cleanup-status","Folder selected. Ready to preview cleanup.")}catch(t){u("caption-cleanup-status",t instanceof Error?t.message:"Folder picker failed.")}}),e.previewButton.addEventListener("click",()=>{oe(e,"preview")}),e.applyButton.addEventListener("click",()=>{oe(e,"apply")}),e.pathInput.addEventListener("keydown",t=>{t.key==="Enter"&&(t.preventDefault(),oe(e,"preview"))}))}function ka(){const e=Sa();e&&(e.browseButton.addEventListener("click",async()=>{u("caption-backup-status","Opening folder picker...");try{e.pathInput.value=await O("folder"),u("caption-backup-status","Folder selected. Refreshing snapshots..."),await V(e)}catch(t){u("caption-backup-status",t instanceof Error?t.message:"Folder picker failed.")}}),e.refreshButton.addEventListener("click",()=>{V(e)}),e.createButton.addEventListener("click",()=>{Ta(e)}),e.restoreButton.addEventListener("click",()=>{La(e)}),e.selectInput.addEventListener("change",()=>{V(e,e.selectInput.value||null)}))}function _a(){const e=document.querySelector("#dataset-analysis-path"),t=document.querySelector("#dataset-analysis-caption-extension"),a=document.querySelector("#dataset-analysis-top-tags"),n=document.querySelector("#dataset-analysis-sample-limit"),s=document.querySelector("#dataset-analysis-pick"),i=document.querySelector("#dataset-analysis-run");return!e||!t||!a||!n||!s||!i?null:{pathInput:e,captionExtensionInput:t,topTagsInput:a,sampleLimitInput:n,browseButton:s,runButton:i}}function xa(){const e=document.querySelector("#masked-loss-audit-path"),t=document.querySelector("#masked-loss-audit-sample-limit"),a=document.querySelector("#masked-loss-audit-recursive"),n=document.querySelector("#masked-loss-audit-pick"),s=document.querySelector("#masked-loss-audit-run");return!e||!t||!a||!n||!s?null:{pathInput:e,sampleLimitInput:t,recursiveInput:a,browseButton:n,runButton:s}}function wa(){const e=document.querySelector("#batch-tagger-path"),t=document.querySelector("#batch-tagger-model"),a=document.querySelector("#batch-tagger-threshold"),n=document.querySelector("#batch-tagger-character-threshold"),s=document.querySelector("#batch-tagger-conflict"),i=document.querySelector("#batch-tagger-additional-tags"),r=document.querySelector("#batch-tagger-backup-name"),c=document.querySelector("#batch-tagger-exclude-tags"),h=document.querySelector("#batch-tagger-recursive"),l=document.querySelector("#batch-tagger-replace-underscore"),d=document.querySelector("#batch-tagger-escape-tag"),p=document.querySelector("#batch-tagger-add-rating-tag"),g=document.querySelector("#batch-tagger-add-model-tag"),f=document.querySelector("#batch-tagger-auto-backup"),k=document.querySelector("#batch-tagger-pick"),_=document.querySelector("#batch-tagger-run");return!e||!t||!a||!n||!s||!i||!r||!c||!h||!l||!d||!p||!g||!f||!k||!_?null:{pathInput:e,modelSelect:t,thresholdInput:a,characterThresholdInput:n,conflictSelect:s,additionalTagsInput:i,backupNameInput:r,excludeTagsInput:c,recursiveInput:h,replaceUnderscoreInput:l,escapeTagInput:d,addRatingTagInput:p,addModelTagInput:g,autoBackupInput:f,browseButton:k,runButton:_}}function $a(){const e=document.querySelector("#caption-cleanup-path"),t=document.querySelector("#caption-cleanup-extension"),a=document.querySelector("#caption-cleanup-remove-tags"),n=document.querySelector("#caption-cleanup-prepend-tags"),s=document.querySelector("#caption-cleanup-append-tags"),i=document.querySelector("#caption-cleanup-search-text"),r=document.querySelector("#caption-cleanup-replace-text"),c=document.querySelector("#caption-cleanup-backup-name"),h=document.querySelector("#caption-cleanup-sample-limit"),l=document.querySelector("#caption-cleanup-recursive"),d=document.querySelector("#caption-cleanup-collapse-whitespace"),p=document.querySelector("#caption-cleanup-replace-underscore"),g=document.querySelector("#caption-cleanup-dedupe-tags"),f=document.querySelector("#caption-cleanup-sort-tags"),k=document.querySelector("#caption-cleanup-use-regex"),_=document.querySelector("#caption-cleanup-auto-backup"),T=document.querySelector("#caption-cleanup-pick"),D=document.querySelector("#caption-cleanup-preview"),X=document.querySelector("#caption-cleanup-apply");return!e||!t||!a||!n||!s||!i||!r||!c||!h||!l||!d||!p||!g||!f||!k||!_||!T||!D||!X?null:{pathInput:e,extensionInput:t,removeTagsInput:a,prependTagsInput:n,appendTagsInput:s,searchTextInput:i,replaceTextInput:r,backupNameInput:c,sampleLimitInput:h,recursiveInput:l,collapseWhitespaceInput:d,replaceUnderscoreInput:p,dedupeTagsInput:g,sortTagsInput:f,useRegexInput:k,autoBackupInput:_,browseButton:T,previewButton:D,applyButton:X}}function Sa(){const e=document.querySelector("#caption-backup-path"),t=document.querySelector("#caption-backup-extension"),a=document.querySelector("#caption-backup-name"),n=document.querySelector("#caption-backup-select"),s=document.querySelector("#caption-backup-recursive"),i=document.querySelector("#caption-backup-pre-restore"),r=document.querySelector("#caption-backup-pick"),c=document.querySelector("#caption-backup-create"),h=document.querySelector("#caption-backup-refresh"),l=document.querySelector("#caption-backup-restore");return!e||!t||!a||!n||!s||!i||!r||!c||!h||!l?null:{pathInput:e,extensionInput:t,nameInput:a,selectInput:n,recursiveInput:s,preRestoreInput:i,browseButton:r,createButton:c,refreshButton:h,restoreButton:l}}async function Ne(e){const t=e.pathInput.value.trim();if(!t){u("dataset-analysis-status","Pick a dataset folder first."),m("dataset-analysis-results",'<p class="dataset-analysis-empty">No folder selected yet.</p>');return}e.browseButton.disabled=!0,e.runButton.disabled=!0,u("dataset-analysis-status","Analyzing dataset..."),m("dataset-analysis-results",'<p class="dataset-analysis-empty">Scanning images, captions, and tags...</p>');try{const a=await Rt({path:t,caption_extension:e.captionExtensionInput.value.trim()||".txt",top_tags:Q(e.topTagsInput.value,40),sample_limit:Q(e.sampleLimitInput.value,8)});if(a.status!=="success"||!a.data)throw new Error(a.message||"Dataset analysis returned no data.");u("dataset-analysis-status",`Scanned ${a.data.summary.image_count} images across ${a.data.summary.dataset_folder_count} dataset folder(s).`),Kt(a.data)}catch(a){u("dataset-analysis-status",a instanceof Error?a.message:"Dataset analysis failed."),m("dataset-analysis-results",`<article class="dataset-analysis-block dataset-analysis-warning"><p>${o(a instanceof Error?a.message:"Dataset analysis failed.")}</p></article>`)}finally{e.browseButton.disabled=!1,e.runButton.disabled=!1}}async function Ce(e){const t=e.pathInput.value.trim();if(!t){u("masked-loss-audit-status","Pick a dataset folder first."),m("masked-loss-audit-results",'<p class="dataset-analysis-empty">No dataset folder selected yet.</p>');return}e.browseButton.disabled=!0,e.runButton.disabled=!0,u("masked-loss-audit-status","Inspecting alpha-channel masks..."),m("masked-loss-audit-results",'<p class="dataset-analysis-empty">Opening images and checking their alpha channels...</p>');try{const a=await Nt({path:t,recursive:e.recursiveInput.checked,sample_limit:Q(e.sampleLimitInput.value,8)});if(a.status!=="success"||!a.data)throw new Error(a.message||"Masked-loss audit returned no data.");u("masked-loss-audit-status",`Inspected ${a.data.summary.image_count} images. Found ${a.data.summary.usable_mask_image_count} image(s) with usable alpha masks.`),Jt(a.data)}catch(a){u("masked-loss-audit-status",a instanceof Error?a.message:"Masked-loss audit failed."),m("masked-loss-audit-results",`<article class="dataset-analysis-block dataset-analysis-warning"><p>${o(a instanceof Error?a.message:"Masked-loss audit failed.")}</p></article>`)}finally{e.browseButton.disabled=!1,e.runButton.disabled=!1}}async function De(e){var a,n,s;const t=e.pathInput.value.trim();if(!t){u("batch-tagger-status","Pick an image folder first."),m("batch-tagger-results",'<p class="dataset-analysis-empty">No image folder selected yet.</p>');return}e.browseButton.disabled=!0,e.runButton.disabled=!0,u("batch-tagger-status","Starting batch tagging..."),m("batch-tagger-results",'<p class="dataset-analysis-empty">Submitting interrogator job to the backend...</p>');try{const i=Be(e.thresholdInput.value,.35,0,1),r=Be(e.characterThresholdInput.value,.6,0,1),c=await Dt({path:t,interrogator_model:e.modelSelect.value,threshold:i,character_threshold:r,batch_output_action_on_conflict:e.conflictSelect.value,create_backup_before_write:e.autoBackupInput.checked,backup_snapshot_name:e.backupNameInput.value.trim(),additional_tags:e.additionalTagsInput.value.trim(),exclude_tags:e.excludeTagsInput.value.trim(),batch_input_recursive:e.recursiveInput.checked,replace_underscore:e.replaceUnderscoreInput.checked,escape_tag:e.escapeTagInput.checked,add_rating_tag:e.addRatingTagInput.checked,add_model_tag:e.addModelTagInput.checked});if(c.status!=="success")throw new Error(c.message||"Batch tagging failed to start.");u("batch-tagger-status",c.message||"Batch tagging started."),m("batch-tagger-results",`
        <article class="dataset-analysis-block">
          <p class="panel-kicker">launched</p>
          <h3>Batch tagger job submitted</h3>
          <p><code>${o(t)}</code></p>
          <p>Model: <code>${o(e.modelSelect.value)}</code></p>
          <p>
            Threshold: <strong>${o(String(i))}</strong>
            · Character threshold: <strong>${o(String(r))}</strong>
            · Conflict mode: <strong>${o(e.conflictSelect.value)}</strong>
          </p>
          <p>
            Recursive: <strong>${e.recursiveInput.checked?"yes":"no"}</strong>
            · Replace underscore: <strong>${e.replaceUnderscoreInput.checked?"yes":"no"}</strong>
            · Escape tags: <strong>${e.escapeTagInput.checked?"yes":"no"}</strong>
          </p>
          <p>
            Auto backup: <strong>${e.autoBackupInput.checked?"yes":"no"}</strong>
            ${(a=c.data)!=null&&a.backup?`· Snapshot: <code>${o(c.data.backup.archive_name)}</code>`:""}
          </p>
          ${(s=(n=c.data)==null?void 0:n.warnings)!=null&&s.length?`<p>${o(c.data.warnings.join(" "))}</p>`:""}
          <p>The backend runs this in the background. Watch the console output and inspect generated <code>.txt</code> files in the dataset folder.</p>
        </article>
      `)}catch(i){u("batch-tagger-status",i instanceof Error?i.message:"Batch tagging failed."),m("batch-tagger-results",`<article class="dataset-analysis-block dataset-analysis-warning"><p>${o(i instanceof Error?i.message:"Batch tagging failed.")}</p></article>`)}finally{e.browseButton.disabled=!1,e.runButton.disabled=!1}}async function oe(e,t){const a=e.pathInput.value.trim();if(!a){u("caption-cleanup-status","Pick a caption folder first."),m("caption-cleanup-results",'<p class="dataset-analysis-empty">No caption folder selected yet.</p>');return}const n={path:a,caption_extension:e.extensionInput.value.trim()||".txt",recursive:e.recursiveInput.checked,collapse_whitespace:e.collapseWhitespaceInput.checked,replace_underscore:e.replaceUnderscoreInput.checked,dedupe_tags:e.dedupeTagsInput.checked,sort_tags:e.sortTagsInput.checked,remove_tags:e.removeTagsInput.value.trim(),prepend_tags:e.prependTagsInput.value.trim(),append_tags:e.appendTagsInput.value.trim(),search_text:e.searchTextInput.value,replace_text:e.replaceTextInput.value,use_regex:e.useRegexInput.checked,create_backup_before_apply:e.autoBackupInput.checked,backup_snapshot_name:e.backupNameInput.value.trim(),sample_limit:Q(e.sampleLimitInput.value,8)};e.browseButton.disabled=!0,e.previewButton.disabled=!0,e.applyButton.disabled=!0,u("caption-cleanup-status",t==="preview"?"Previewing caption cleanup...":"Applying caption cleanup..."),m("caption-cleanup-results",`<p class="dataset-analysis-empty">${t==="preview"?"Scanning caption files and building sample diffs...":"Writing cleaned captions back to disk..."}</p>`);try{const s=t==="preview"?await Bt(n):await qt(n);if(s.status!=="success"||!s.data)throw new Error(s.message||`Caption cleanup ${t} failed.`);u("caption-cleanup-status",s.message||(t==="preview"?`Previewed ${s.data.summary.changed_file_count} caption file changes.`:`Applied cleanup to ${s.data.summary.changed_file_count} caption files.`)),Yt(s.data)}catch(s){u("caption-cleanup-status",s instanceof Error?s.message:"Caption cleanup failed."),m("caption-cleanup-results",`<article class="dataset-analysis-block dataset-analysis-warning"><p>${o(s instanceof Error?s.message:"Caption cleanup failed.")}</p></article>`)}finally{e.browseButton.disabled=!1,e.previewButton.disabled=!1,e.applyButton.disabled=!1}}async function V(e,t,a=!0){var s,i;const n=e.pathInput.value.trim();if(!n){u("caption-backup-status","Pick a caption folder first."),m("caption-backup-results",'<p class="dataset-analysis-empty">No caption folder selected yet.</p>'),e.selectInput.innerHTML='<option value="">Refresh snapshots for this folder</option>';return}e.browseButton.disabled=!0,e.createButton.disabled=!0,e.refreshButton.disabled=!0,e.restoreButton.disabled=!0,u("caption-backup-status","Loading caption snapshots...");try{const c=((s=(await jt({path:n})).data)==null?void 0:s.backups)??[],h=e.selectInput.value||(((i=c[0])==null?void 0:i.archive_name)??""),l=t??h;e.selectInput.innerHTML=c.length?c.map(d=>{const p=d.archive_name===l?" selected":"";return`<option value="${o(d.archive_name)}"${p}>${o(d.snapshot_name)} · ${o(d.archive_name)}</option>`}).join(""):'<option value="">No snapshots for this folder yet</option>',c.length&&l&&(e.selectInput.value=l),u("caption-backup-status",c.length?`Loaded ${c.length} caption snapshots.`:"No caption snapshots found for this folder."),a&&Zt(c,c.length?l:null)}catch(r){u("caption-backup-status",r instanceof Error?r.message:"Failed to load caption snapshots."),m("caption-backup-results",`<article class="dataset-analysis-block dataset-analysis-warning"><p>${o(r instanceof Error?r.message:"Failed to load caption snapshots.")}</p></article>`)}finally{e.browseButton.disabled=!1,e.createButton.disabled=!1,e.refreshButton.disabled=!1,e.restoreButton.disabled=!1}}async function Ta(e){const t=e.pathInput.value.trim();if(!t){u("caption-backup-status","Pick a caption folder first."),m("caption-backup-results",'<p class="dataset-analysis-empty">No caption folder selected yet.</p>');return}e.browseButton.disabled=!0,e.createButton.disabled=!0,e.refreshButton.disabled=!0,e.restoreButton.disabled=!0,u("caption-backup-status","Creating caption snapshot...");try{const a=await Ft({path:t,caption_extension:e.extensionInput.value.trim()||".txt",recursive:e.recursiveInput.checked,snapshot_name:e.nameInput.value.trim()});if(a.status!=="success"||!a.data)throw new Error(a.message||"Caption snapshot creation failed.");u("caption-backup-status",a.message||`Created ${a.data.archive_name}`),e.nameInput.value="",await V(e,a.data.archive_name)}catch(a){u("caption-backup-status",a instanceof Error?a.message:"Caption snapshot creation failed."),m("caption-backup-results",`<article class="dataset-analysis-block dataset-analysis-warning"><p>${o(a instanceof Error?a.message:"Caption snapshot creation failed.")}</p></article>`)}finally{e.browseButton.disabled=!1,e.createButton.disabled=!1,e.refreshButton.disabled=!1,e.restoreButton.disabled=!1}}async function La(e){const t=e.pathInput.value.trim(),a=e.selectInput.value;if(!t){u("caption-backup-status","Pick a caption folder first."),m("caption-backup-results",'<p class="dataset-analysis-empty">No caption folder selected yet.</p>');return}if(!a){u("caption-backup-status","Select a snapshot to restore.");return}if(window.confirm(`Restore caption snapshot ${a} into this folder?

This overwrites matching caption files from the snapshot.`)){e.browseButton.disabled=!0,e.createButton.disabled=!0,e.refreshButton.disabled=!0,e.restoreButton.disabled=!0,u("caption-backup-status","Restoring caption snapshot..."),m("caption-backup-results",'<p class="dataset-analysis-empty">Writing snapshot files back to the folder...</p>');try{const s=await Ot({path:t,archive_name:a,make_restore_backup:e.preRestoreInput.checked});if(s.status!=="success"||!s.data)throw new Error(s.message||"Caption snapshot restore failed.");u("caption-backup-status",s.message||`Restored ${s.data.restored_file_count} caption files.`),Qt(s.data),await V(e,a,!1)}catch(s){u("caption-backup-status",s instanceof Error?s.message:"Caption snapshot restore failed."),m("caption-backup-results",`<article class="dataset-analysis-block dataset-analysis-warning"><p>${o(s instanceof Error?s.message:"Caption snapshot restore failed.")}</p></article>`)}finally{e.browseButton.disabled=!1,e.createButton.disabled=!1,e.refreshButton.disabled=!1,e.restoreButton.disabled=!1}}}function Q(e,t){const a=Number.parseInt(e,10);return Number.isNaN(a)||a<1?t:a}function Be(e,t,a,n){const s=Number.parseFloat(e);return Number.isNaN(s)?t:Math.min(Math.max(s,a),n)}async function he(){var e;try{const t=await xe();Wt(((e=t.data)==null?void 0:e.tasks)??[]),document.querySelectorAll("[data-task-terminate]").forEach(a=>{a.addEventListener("click",async()=>{const n=a.dataset.taskTerminate;if(n){a.setAttribute("disabled","true");try{await Qe(n)}finally{await he()}}})})}catch(t){m("task-table-container",`<p>${t instanceof Error?o(t.message):"Task request failed."}</p>`)}}async function Aa(){const e=document.querySelector("#refresh-tasks");e==null||e.addEventListener("click",()=>{he()}),await he()}class x{constructor(t){$(this,"kind");$(this,"descriptionText");$(this,"defaultValue");$(this,"roleName");$(this,"roleConfig");$(this,"minValue");$(this,"maxValue");$(this,"stepValue");$(this,"disabledFlag",!1);$(this,"requiredFlag",!1);$(this,"literalValue");$(this,"options",[]);$(this,"fields",{});$(this,"itemType");this.kind=t}description(t){return this.descriptionText=t,this}default(t){return this.defaultValue=t,this}role(t,a){return this.roleName=typeof t=="string"?t:"custom",this.roleConfig=a??t,this}min(t){return this.minValue=t,this}max(t){return this.maxValue=t,this}step(t){return this.stepValue=t,this}required(){return this.requiredFlag=!0,this}disabled(){return this.disabledFlag=!0,this}}function H(e){if(e instanceof x)return e;if(e===String)return new x("string");if(e===Number)return new x("number");if(e===Boolean)return new x("boolean");if(typeof e=="string"||typeof e=="number"||typeof e=="boolean"){const t=new x("const");return t.literalValue=e,t.defaultValue=e,t}if(Array.isArray(e)){const t=new x("union");return t.options=e.map(a=>H(a)),t}if(e&&typeof e=="object"){const t=new x("object");return t.fields=Object.fromEntries(Object.entries(e).map(([a,n])=>[a,H(n)])),t}return new x("string")}function Pa(){return{string(){return new x("string")},number(){return new x("number")},boolean(){return new x("boolean")},const(e){const t=new x("const");return t.literalValue=e,t.defaultValue=e,t},union(e){const t=new x("union");return t.options=e.map(a=>H(a)),t},intersect(e){const t=new x("intersect");return t.options=e.map(a=>H(a)),t},object(e){const t=new x("object");return t.fields=Object.fromEntries(Object.entries(e).map(([a,n])=>[a,H(n)])),t},array(e){const t=new x("array");return t.itemType=H(e),t}}}function Ea(e,t,a){const n={...e,...t};for(const s of a??[])delete n[s];return n}function qe(e,t){const a=Pa();return new Function("Schema","UpdateSchema","SHARED_SCHEMAS","String","Number","Boolean","source",'"use strict"; return eval(source);')(a,Ea,t??{},String,Number,Boolean,e)}function ot(e){const t=e.find(s=>s.name==="shared"),n=(t?qe(t.schema,null):{})||{};return e.map(s=>({name:s.name,hash:s.hash,source:s.schema,runtime:s.name==="shared"?n:qe(s.schema,n)}))}function Fe(e,t=""){return Object.entries(e).map(([a,n])=>({name:a,path:t?`${t}.${a}`:a,schema:n})).filter(a=>a.schema.kind!=="const"||!a.schema.requiredFlag)}function je(e){return Object.entries(e).filter(([,t])=>t.kind==="const"&&t.requiredFlag).map(([t,a])=>`${t} = ${String(a.literalValue)}`)}function Oe(e){return Object.fromEntries(Object.entries(e).filter(([,t])=>t.kind==="const"&&t.requiredFlag).map(([t,a])=>[t,a.literalValue]))}function me(e,t,a){if(e.kind==="intersect"){e.options.forEach((n,s)=>me(n,`${t}-i${s}`,a));return}if(e.kind==="object"){const n=Fe(e.fields);n.length>0&&a.push({id:t,title:e.descriptionText||"Unnamed section",fields:n,conditions:je(e.fields),constants:Oe(e.fields)});return}e.kind==="union"&&e.options.forEach((n,s)=>{if(n.kind==="object"){const i=Fe(n.fields);i.length>0&&a.push({id:`${t}-u${s}`,title:n.descriptionText||e.descriptionText||`Conditional branch ${s+1}`,fields:i,conditional:!0,conditions:je(n.fields),constants:Oe(n.fields)})}else me(n,`${t}-u${s}`,a)})}function Ia(e){const t=[];return me(e,"section",t),t}function Ra(e){const t={};for(const a of e){a.conditional||Object.assign(t,a.constants);for(const n of a.fields)n.schema.defaultValue!==void 0?t[n.path]=n.schema.defaultValue:n.schema.kind==="boolean"?t[n.path]=!1:t[n.path]=""}return t}function lt(e,t){return e.conditional?Object.entries(e.constants).every(([a,n])=>t[a]===n):!0}function Na(e,t){const a={...t};for(const n of e){if(lt(n,t)){Object.assign(a,n.constants);continue}for(const s of n.fields)delete a[s.path]}return a}function $e(e){return`field-${e.replaceAll(/[^a-zA-Z0-9_-]/g,"-")}`}function Ca(e){if(e.kind!=="union")return null;const t=e.options.filter(a=>a.kind==="const").map(a=>a.literalValue).filter(a=>typeof a=="string"||typeof a=="number"||typeof a=="boolean");return t.length!==e.options.length?null:t}function Da(e,t){if(!e.roleConfig||typeof e.roleConfig!="object"||Array.isArray(e.roleConfig))return;const a=e.roleConfig[t];return typeof a=="string"?a:void 0}function ge(e){return Array.isArray(e)?e.map(t=>String(t??"")):typeof e=="string"&&e.length>0?e.split(/\r?\n/):[]}function Ba(e,t,a){const n=ge(t),s=n.length>0?n:[""],i=$e(e.path);return`
    <div class="table-editor" data-table-path="${o(e.path)}">
      <div class="table-editor-rows">
        ${s.map((r,c)=>`
              <div class="table-editor-row">
                <input
                  id="${c===0?i:`${i}-${c}`}"
                  class="field-input"
                  data-field-path="${o(e.path)}"
                  data-field-kind="table-row"
                  data-field-index="${c}"
                  type="text"
                  value="${o(r)}"
                  ${a}
                />
                <button
                  class="action-button action-button-ghost action-button-small"
                  data-table-remove="${o(e.path)}"
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
          data-table-add="${o(e.path)}"
          type="button"
          ${a}
        >
          Add row
        </button>
        <span class="table-editor-note">One argument per row.</span>
      </div>
    </div>
  `}function qa(e,t){const a=e.schema,n=$e(e.path),s=o(e.path),i=Ca(a),r=a.disabledFlag?"disabled":"",c=a.roleName||"";if(a.kind==="boolean")return`
      <label class="checkbox-row" for="${n}">
        <input id="${n}" data-field-path="${s}" data-field-kind="boolean" type="checkbox" ${t?"checked":""} ${r} />
        <span>${a.defaultValue===!0?"default on":"toggle"}</span>
      </label>
    `;if(a.kind==="array"){if(c==="table")return Ba(e,t,r);const h=Array.isArray(t)?t.join(`
`):"";return`<textarea id="${n}" class="field-input field-textarea" data-field-path="${s}" data-field-kind="array" ${r}>${o(h)}</textarea>`}if(i){const h=i.map(l=>`<option value="${o(l)}" ${String(l)===String(t)?"selected":""}>${o(l)}</option>`).join("");return`<select id="${n}" class="field-input" data-field-path="${s}" data-field-kind="enum" ${r}>${h}</select>`}if(a.kind==="number"){const h=a.minValue!==void 0?`min="${a.minValue}"`:"",l=a.maxValue!==void 0?`max="${a.maxValue}"`:"",d=a.stepValue!==void 0?`step="${a.stepValue}"`:'step="any"';if(c==="slider"&&a.minValue!==void 0&&a.maxValue!==void 0){const p=t===""||t===void 0||t===null?a.defaultValue??a.minValue:t;return`
        <div class="slider-editor">
          <input
            class="field-slider"
            data-field-path="${s}"
            data-field-kind="number"
            data-slider-role="range"
            type="range"
            value="${o(p)}"
            ${h}
            ${l}
            ${d}
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
              value="${o(p)}"
              ${h}
              ${l}
              ${d}
              ${r}
            />
            <span class="slider-value" data-slider-value-for="${s}">${o(p)}</span>
          </div>
        </div>
      `}return`<input id="${n}" class="field-input" data-field-path="${s}" data-field-kind="number" type="number" value="${o(t)}" ${h} ${l} ${d} ${r} />`}if(c==="textarea")return`<textarea id="${n}" class="field-input field-textarea" data-field-path="${s}" data-field-kind="string" ${r}>${o(t)}</textarea>`;if(c==="filepicker"){const h=Da(a,"type")??(e.path.endsWith("_dir")||e.path==="resume"?"folder":"model-file");return`
      <div class="picker-control">
        <div class="picker-row">
          <input
            id="${n}"
            class="field-input"
            data-field-path="${s}"
            data-field-kind="string"
            type="text"
            value="${o(t)}"
            ${r}
          />
          <button
            class="action-button action-button-ghost picker-button"
            data-picker-path="${s}"
            data-picker-type="${o(h)}"
            type="button"
            ${r}
          >
            Browse
          </button>
        </div>
        <p class="picker-status" data-picker-status-for="${s}">
          Uses the backend native ${h==="folder"?"folder":"file"} picker.
        </p>
      </div>
    `}return a.kind==="const"?`<div class="field-readonly"><code>${o(a.literalValue??t)}</code></div>`:`<input id="${n}" class="field-input" data-field-path="${s}" data-field-kind="string" type="text" value="${o(t)}" ${r} />`}function Fa(e,t){const a=e.schema,n=[`<span class="mini-badge">${o(a.kind)}</span>`,a.roleName?`<span class="mini-badge mini-badge-muted">${o(a.roleName)}</span>`:"",a.requiredFlag?'<span class="mini-badge mini-badge-accent">required</span>':"",a.disabledFlag?'<span class="mini-badge mini-badge-muted">disabled</span>':""].filter(Boolean).join(""),s=[a.minValue!==void 0?`min ${a.minValue}`:"",a.maxValue!==void 0?`max ${a.maxValue}`:"",a.stepValue!==void 0?`step ${a.stepValue}`:""].filter(Boolean).join(" · ");return`
    <article class="field-card">
      <div class="field-card-head">
        <div>
          <label class="field-label" for="${$e(e.path)}">${o(e.name)}</label>
          <p class="field-path">${o(e.path)}</p>
        </div>
        <div class="mini-badge-row">${n}</div>
      </div>
      <p class="field-description">${o(a.descriptionText||"No description")}</p>
      ${qa(e,t)}
      <div class="field-meta">
        <span><strong>Default:</strong> ${o(a.defaultValue??"(none)")}</span>
        ${s?`<span><strong>Constraints:</strong> ${o(s)}</span>`:""}
      </div>
    </article>
  `}function ct(e){return e.sections.filter(t=>lt(t,e.values))}function dt(e){return Na(e.sections,e.values)}function ja(e,t){const a=ct(e);if(a.length===0){m(t,"<p>No renderable sections extracted from this schema.</p>");return}const n=a.map(s=>{const i=s.fields.map(c=>Fa(c,e.values[c.path])).join(""),r=s.conditions.length?`<div class="condition-list">${s.conditions.map(c=>`<span class="coverage-pill coverage-pill-muted">${o(c)}</span>`).join("")}</div>`:"";return`
        <article class="panel schema-section-card">
          <div class="schema-section-head">
            <div>
              <p class="panel-kicker">${s.conditional?"conditional section":"section"}</p>
              <h3>${o(s.title)}</h3>
            </div>
            <span class="coverage-pill">${s.fields.length} fields</span>
          </div>
          ${r}
          <div class="field-grid">
            ${i}
          </div>
        </article>
      `}).join("");m(t,n)}function fe(e,t){const a=Object.fromEntries(Object.entries(dt(e)).sort(([n],[s])=>n.localeCompare(s)));M(t,JSON.stringify(a,null,2))}function ie(e){return e.filter(t=>t.name!=="shared"&&t.runtime instanceof x)}function He(e,t){const a=e.schema;if(a.kind==="boolean")return!!t;if(a.kind==="number"){const n=String(t).trim();if(n==="")return"";const s=Number(n);return Number.isNaN(s)?"":s}return a.kind==="array"?String(t).split(/\r?\n/).map(n=>n.trim()).filter(Boolean):t}function ze(e,t){return e.sections.flatMap(a=>a.fields).find(a=>a.path===t)}function Oa(e,t){return[...e.querySelectorAll('[data-field-kind="table-row"]')].filter(a=>a.dataset.fieldPath===t).map(a=>a.value.trim()).filter(Boolean)}function Me(e,t,a,n){const s=String(a??"");e.querySelectorAll("[data-field-path]").forEach(i=>{if(!(i===n||i.dataset.fieldPath!==t||i.dataset.fieldKind==="table-row")){if(i instanceof HTMLInputElement&&i.type==="checkbox"){i.checked=!!a;return}i.value=s}}),e.querySelectorAll("[data-slider-value-for]").forEach(i=>{i.dataset.sliderValueFor===t&&(i.textContent=s)})}function le(e,t,a,n="idle"){e.querySelectorAll("[data-picker-status-for]").forEach(s=>{s.dataset.pickerStatusFor===t&&(s.textContent=a,s.classList.remove("is-success","is-error"),n==="success"?s.classList.add("is-success"):n==="error"&&s.classList.add("is-error"))})}function Ha(e,t,a,n){const s=document.querySelector(`#${t.sectionsId}`);if(!s)return;const i=new Set(e.sections.flatMap(r=>r.conditional?Object.keys(r.constants):[]));s.querySelectorAll("[data-field-path]").forEach(r=>{const c=r.dataset.fieldKind,h=r instanceof HTMLInputElement&&r.type==="checkbox"||r instanceof HTMLSelectElement?"change":"input";r.addEventListener(h,()=>{const l=r.dataset.fieldPath;if(!l)return;const d=ze(e,l);if(d){if(c==="table-row")e.values[l]=Oa(s,l);else{const p=r instanceof HTMLInputElement&&r.type==="checkbox"?r.checked:r.value;e.values[l]=He(d,p),Me(s,l,e.values[l],r)}if(i.has(l)){n({...e,values:{...e.values}});return}fe(e,t.previewId),a(e)}})}),s.querySelectorAll("[data-table-add]").forEach(r=>{r.addEventListener("click",()=>{const c=r.dataset.tableAdd;c&&(e.values[c]=[...ge(e.values[c]),""],n({...e,values:{...e.values}}))})}),s.querySelectorAll("[data-table-remove]").forEach(r=>{r.addEventListener("click",()=>{const c=r.dataset.tableRemove,h=Number(r.dataset.tableIndex??"-1");if(!c||h<0)return;const l=ge(e.values[c]).filter((d,p)=>p!==h);e.values[c]=l,n({...e,values:{...e.values}})})}),s.querySelectorAll("[data-picker-path]").forEach(r=>{r.addEventListener("click",async()=>{const c=r.dataset.pickerPath,h=r.dataset.pickerType||"model-file";if(!c)return;const l=ze(e,c);if(l){r.setAttribute("disabled","true"),le(s,c,"Waiting for native picker...","idle");try{const d=await O(h);if(e.values[c]=He(l,d),Me(s,c,e.values[c]),le(s,c,d,"success"),i.has(c)){n({...e,values:{...e.values}});return}fe(e,t.previewId),a(e)}catch(d){le(s,c,d instanceof Error?d.message:"The picker failed to return a value.","error")}finally{r.removeAttribute("disabled")}}})})}function ee(e,t){const a=ie(e).find(s=>s.name===t);if(!a||!(a.runtime instanceof x))return null;const n=Ia(a.runtime);return{catalog:e,selectedName:t,sections:n,values:Ra(n)}}function W(e,t,a,n){if(a(e),!e){u(t.summaryId,"Failed to build schema bridge state."),m(t.sectionsId,"<p>Schema bridge failed to initialize.</p>"),M(t.previewId,"{}");return}const i=ie(e.catalog).map(l=>`<option value="${o(l.name)}" ${l.name===e.selectedName?"selected":""}>${o(l.name)}</option>`).join(""),r=ct(e);m(t.selectId,i),u(t.summaryId,`${e.selectedName} · ${r.length}/${e.sections.length} visible sections · ${r.reduce((l,d)=>l+d.fields.length,0)} visible fields`),ja(e,t.sectionsId),fe(e,t.previewId);const c=document.querySelector(`#${t.selectId}`);c&&(c.onchange=()=>{const l=ee(e.catalog,c.value);W(l,t,a,n)});const h=document.querySelector(`#${t.resetId}`);h&&(h.onclick=()=>{W(ee(e.catalog,e.selectedName),t,a,n)}),Ha(e,t,n,l=>W(l,t,a,n)),n(e)}const za={selectId:"schema-select",summaryId:"schema-summary",sectionsId:"schema-sections",previewId:"schema-preview",resetId:"schema-reset"};function Ma(e){return{selectId:`${e}-schema-select`,summaryId:`${e}-summary`,sectionsId:`${e}-sections`,previewId:`${e}-preview`,resetId:`${e}-reset`}}async function Ua(e){var t,a,n;try{const i=((t=(await _e()).data)==null?void 0:t.schemas)??[],r=ot(i),c=ie(r),h=((a=c.find(l=>l.name==="sdxl-lora"))==null?void 0:a.name)??((n=c[0])==null?void 0:n.name);if(!h){u("schema-summary","No selectable schemas were returned."),m("schema-sections","<p>No schema runtime available.</p>");return}W(ee(r,h),za,e,()=>{})}catch(s){u("schema-summary","Schema bridge request failed"),m("schema-sections",`<p>${s instanceof Error?o(s.message):"Unknown error"}</p>`),M("schema-preview","{}")}}function Xa(e,t){return`
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
  `}function N(e,t,a){return`
    <section class="page-hero panel">
      <p class="eyebrow">${e}</p>
      <h2>${t}</h2>
      <p class="lede">${a}</p>
    </section>
  `}function Ue(e,t,a="module"){return`
    <article class="panel info-card">
      <p class="panel-kicker">${a}</p>
      <h3>${e}</h3>
      <div>${t}</div>
    </article>
  `}function Va(){return`
    ${N("about","A clean source-side replacement for the current about page","This page is one of the safest migration targets because it is mostly branding, release context and ownership notes.")}
    <section class="two-column">
      ${Ue("Project identity",`
          <p><strong>Product name:</strong> SD-reScripts</p>
          <p><strong>Version target:</strong> v1.0.2</p>
          <p><strong>Lineage:</strong> Fork from 秋葉 aaaki/lora-scripts</p>
          <p><strong>Maintainer:</strong> Modify By Lulynx</p>
        `,"brand")}
      ${Ue("Why migrate this page first",`
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
      <p><a class="text-link" href="${R("/other/about.html")}" target="_blank" rel="noreferrer">Open current shipped about page</a></p>
    </section>
  `}function w(e){return`
    ${N(e.heroKicker,e.heroTitle,e.heroLede)}
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
            <p><a class="text-link" href="${R(e.legacyPath)}" target="_blank" rel="noreferrer">${e.legacyLabel}</a></p>
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
        <button id="${e.prefix}-save-recipe" class="action-button action-button-ghost" type="button">Save recipe</button>
        <button id="${e.prefix}-read-recipes" class="action-button action-button-ghost" type="button">Recipes</button>
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
      <section id="${e.prefix}-recipes-panel" class="training-side-panel" hidden></section>
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
  `}function Wa(){return w({prefix:"anima-finetune",heroKicker:"anima finetune",heroTitle:"Anima finetune source training page",heroLede:"This route exposes the Anima finetune schema so the source-side bridge covers both LoRA and full finetune variants for that trainer family.",runnerTitle:"Anima finetune source-side runner",startButtonLabel:"Start Anima finetune",legacyPath:"/lora/anima-finetune.html",legacyLabel:"Open current shipped Anima finetune page",renderedTitle:"Anima finetune form bridge"})}function Ga(){return w({prefix:"anima",heroKicker:"anima lora",heroTitle:"Anima LoRA source training page",heroLede:"This route surfaces the Anima LoRA schema on the shared training bridge instead of forcing that capability to stay hidden behind the shipped legacy page.",runnerTitle:"Anima LoRA source-side runner",startButtonLabel:"Start Anima LoRA training",legacyPath:"/lora/anima.html",legacyLabel:"Open current shipped Anima LoRA page",renderedTitle:"Anima LoRA form bridge"})}function Ka(){return w({prefix:"dreambooth",heroKicker:"dreambooth train",heroTitle:"Dreambooth source training page",heroLede:"This route brings the Dreambooth and SDXL full-finetune schema into the same source-side training bridge so we can migrate one of the last big non-LoRA training paths cleanly.",runnerTitle:"Dreambooth source-side runner",startButtonLabel:"Start Dreambooth training",legacyPath:"/dreambooth/",legacyLabel:"Open current shipped Dreambooth page",renderedTitle:"Dreambooth form bridge"})}function Ja(){return w({prefix:"flux-controlnet",heroKicker:"flux controlnet",heroTitle:"Flux ControlNet source training page",heroLede:"This route reuses the same source-side training bridge for Flux ControlNet so the DiT-family conditioning workflow stays aligned with the current backend schema and payload rules.",runnerTitle:"Flux ControlNet source-side runner",startButtonLabel:"Start Flux ControlNet training",legacyPath:"/lora/flux-controlnet.html",legacyLabel:"Open current shipped Flux ControlNet page",renderedTitle:"Flux ControlNet form bridge"})}function Ya(){return w({prefix:"flux-finetune",heroKicker:"flux finetune",heroTitle:"Flux finetune source training page",heroLede:"This route exposes the dedicated Flux full-finetune schema on the same source-side training bridge so recipe shaping, preflight and launch behavior stay consistent.",runnerTitle:"Flux finetune source-side runner",startButtonLabel:"Start Flux finetune",legacyPath:"/lora/flux-finetune.html",legacyLabel:"Open current shipped Flux finetune page",renderedTitle:"Flux finetune form bridge"})}function Za(){return w({prefix:"flux",heroKicker:"flux train",heroTitle:"Flux LoRA source training page",heroLede:"This route reuses the source-side training bridge for Flux so we can keep payload shaping, compatibility checks and launch behavior aligned with the current backend.",runnerTitle:"Flux source-side runner",startButtonLabel:"Start Flux training",legacyPath:"/lora/flux.html",legacyLabel:"Open current shipped Flux page",renderedTitle:"Flux form bridge"})}function Qa(){return w({prefix:"hunyuan-image",heroKicker:"hunyuan image",heroTitle:"Hunyuan Image LoRA source training page",heroLede:"This route exposes the Hunyuan Image LoRA schema so newer image trainer families live on the same source-side bridge instead of staying legacy-only.",runnerTitle:"Hunyuan Image source-side runner",startButtonLabel:"Start Hunyuan Image training",legacyPath:"/lora/hunyuan.html",legacyLabel:"Open current shipped Hunyuan Image page",renderedTitle:"Hunyuan Image form bridge"})}function es(){return w({prefix:"lumina-finetune",heroKicker:"lumina finetune",heroTitle:"Lumina finetune source training page",heroLede:"This route exposes Lumina finetune on the shared source-side bridge so finetune-specific payloads can use the same autosave, preflight and launch safety checks.",runnerTitle:"Lumina finetune source-side runner",startButtonLabel:"Start Lumina finetune",legacyPath:"/lora/lumina-finetune.html",legacyLabel:"Open current shipped Lumina finetune page",renderedTitle:"Lumina finetune form bridge"})}function ts(){return w({prefix:"lumina",heroKicker:"lumina lora",heroTitle:"Lumina LoRA source training page",heroLede:"This route exposes the Lumina LoRA schema on the shared bridge so newer trainer families are available without falling back to older UI entry points.",runnerTitle:"Lumina LoRA source-side runner",startButtonLabel:"Start Lumina LoRA training",legacyPath:"/lora/lumina.html",legacyLabel:"Open current shipped Lumina LoRA page",renderedTitle:"Lumina LoRA form bridge"})}function as(){return`
    ${N("schema bridge","Source-side schema explorer and prototype form bridge","This page evaluates the current schema DSL in the browser and turns it into sections, fields and editable defaults. It is the first direct bridge between the new source workspace and the training form core.")}
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
  `}function ss(){return w({prefix:"sd3-finetune",heroKicker:"sd3 finetune",heroTitle:"SD3 finetune source training page",heroLede:"This route brings the dedicated SD3 finetune schema into the shared source-side bridge so parameter normalization and runtime checks stay aligned with the backend.",runnerTitle:"SD3 finetune source-side runner",startButtonLabel:"Start SD3 finetune",legacyPath:"/lora/sd3-finetune.html",legacyLabel:"Open current shipped SD3 finetune page",renderedTitle:"SD3 finetune form bridge"})}function ns(){return w({prefix:"sd3",heroKicker:"sd3 train",heroTitle:"SD3 LoRA source training page",heroLede:"This route extends the same source-side training bridge to SD3 so we can keep the fast-moving schema-driven trainer paths on one shared foundation.",runnerTitle:"SD3 source-side runner",startButtonLabel:"Start SD3 training",legacyPath:"/lora/sd3.html",legacyLabel:"Open current shipped SD3 page",renderedTitle:"SD3 form bridge"})}function is(){return w({prefix:"sd-controlnet",heroKicker:"sd controlnet",heroTitle:"SD ControlNet source training page",heroLede:"This route extends the shared source-side training bridge to the SD1.x / SD2.x ControlNet workflow so conditioning-dataset training can migrate without another bespoke form stack.",runnerTitle:"SD ControlNet source-side runner",startButtonLabel:"Start SD ControlNet training",legacyPath:"/lora/controlnet.html",legacyLabel:"Open current shipped SD ControlNet page",renderedTitle:"SD ControlNet form bridge"})}function rs(){return w({prefix:"sd-ti",heroKicker:"sd textual inversion",heroTitle:"SD textual inversion source training page",heroLede:"This route exposes the standard SD textual inversion schema through the shared training bridge, so embeddings can use the same source-side autosave, preflight and launch workflow.",runnerTitle:"SD textual inversion source-side runner",startButtonLabel:"Start SD textual inversion",legacyPath:"/lora/ti.html",legacyLabel:"Open current shipped SD textual inversion page",renderedTitle:"SD textual inversion form bridge"})}function os(){return w({prefix:"sdxl-controlnet",heroKicker:"sdxl controlnet",heroTitle:"SDXL ControlNet source training page",heroLede:"This route keeps the SDXL ControlNet training path on the same source-side schema bridge, normalized payload builder and launch pipeline as the main LoRA routes.",runnerTitle:"SDXL ControlNet source-side runner",startButtonLabel:"Start SDXL ControlNet training",legacyPath:"/lora/sdxl-controlnet.html",legacyLabel:"Open current shipped SDXL ControlNet page",renderedTitle:"SDXL ControlNet form bridge"})}function ls(){return w({prefix:"sdxl-lllite",heroKicker:"sdxl lllite",heroTitle:"SDXL LLLite source training page",heroLede:"This route keeps the SDXL ControlNet-LLLite path on the shared source-side training bridge so even the more specialized conditioning flow no longer needs its own one-off migration path.",runnerTitle:"SDXL LLLite source-side runner",startButtonLabel:"Start SDXL LLLite training",legacyPath:"/lora/sdxl-lllite.html",legacyLabel:"Open current shipped SDXL LLLite page",renderedTitle:"SDXL LLLite form bridge"})}function cs(){return w({prefix:"sdxl-ti",heroKicker:"sdxl textual inversion",heroTitle:"SDXL textual inversion source training page",heroLede:"This route exposes SDXL textual inversion through the same source-side training bridge, so embeddings, prompt helpers and launch safety checks stay unified.",runnerTitle:"SDXL textual inversion source-side runner",startButtonLabel:"Start SDXL textual inversion",legacyPath:"/lora/sdxl-ti.html",legacyLabel:"Open current shipped SDXL textual inversion page",renderedTitle:"SDXL textual inversion form bridge"})}function ds(){return w({prefix:"sdxl",heroKicker:"sdxl train",heroTitle:"First source-side SDXL training page",heroLede:"This is the first page that moves beyond passive inspection: it renders the SDXL schema, tracks a real config model and can submit to the current training backend.",runnerTitle:"SDXL source-side runner",startButtonLabel:"Start SDXL training",legacyPath:"/lora/sdxl.html",legacyLabel:"Open current shipped SDXL page",renderedTitle:"SDXL form bridge"})}function us(){return`
    ${N("settings","Source-side settings page prototype","This route is now close to live backend config data, so we can rebuild it before touching the schema-heavy training forms.")}
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
      <p><a class="text-link" href="${R("/other/settings.html")}" target="_blank" rel="noreferrer">Open current shipped settings page</a></p>
    </section>
  `}function ps(){return`
    ${N("tag editor","Tag editor wrapper migration page","The current shipped page is mostly a wrapper around startup state and proxy behavior. That makes it a good low-risk source-side rewrite.")}
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
          <p><a class="text-link" href="${R("/tageditor.html")}" target="_blank" rel="noreferrer">Open current shipped tag editor wrapper</a></p>
        </div>
      </article>
    </section>
  `}function hs(){return`
    ${N("tasks","Task monitor migration page","This route is already talking to the real backend task manager, so it is a strong candidate for early source migration.")}
    <section class="panel task-panel">
      <div class="task-toolbar">
        <button id="refresh-tasks" class="action-button" type="button">Refresh tasks</button>
        <a class="text-link task-legacy-link" href="${R("/task.html")}" target="_blank" rel="noreferrer">Open current shipped task page</a>
      </div>
      <div id="task-table-container" class="task-table-container loading">Loading tasks...</div>
    </section>
  `}function ms(){return`
    ${N("tensorboard","TensorBoard wrapper migration page","This page can be rebuilt without touching training forms because it mainly needs status text and a proxy destination.")}
    <section class="two-column">
      <article class="panel info-card">
        <p class="panel-kicker">proxy</p>
        <h3>Legacy backend path</h3>
        <div>
          <p>The current runtime proxies TensorBoard through <code>/proxy/tensorboard/</code>.</p>
          <p>This source-side page can later offer a cleaner iframe or open-in-new-tab flow.</p>
          <p><a class="text-link" href="${R("/proxy/tensorboard/")}" target="_blank" rel="noreferrer">Open current TensorBoard proxy</a></p>
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
  `}function gs(){return`
    ${N("tools","Tools workspace","This route now covers both raw script launching and the first reusable dataset utility, so it can grow into a real preflight toolbox instead of staying a placeholder.")}
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
      <p><a class="text-link" href="${R("/tageditor.html")}" target="_blank" rel="noreferrer">Open current shipped tag editor wrapper</a></p>
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
      <p><a class="text-link" href="${R("/lora/tools.html")}" target="_blank" rel="noreferrer">Open current shipped tools page</a></p>
      <div id="tools-browser" class="tools-browser loading">Loading available scripts...</div>
    </section>
  `}const fs=[{method:"GET",path:"/api/schemas/all",purpose:"Fetch all schema definitions used to render training forms.",migrationPriority:"high"},{method:"GET",path:"/api/schemas/hashes",purpose:"Hot-reload check for schema changes.",migrationPriority:"medium"},{method:"GET",path:"/api/presets",purpose:"Fetch preset configs for pages and tools.",migrationPriority:"high"},{method:"GET",path:"/api/config/saved_params",purpose:"Load stored UI parameter choices.",migrationPriority:"medium"},{method:"GET",path:"/api/config/summary",purpose:"Read app config summary for the rebuilt settings page.",migrationPriority:"medium"},{method:"GET",path:"/api/graphic_cards",purpose:"List GPUs plus xformers support state.",migrationPriority:"high"},{method:"POST",path:"/api/run",purpose:"Start schema-driven training jobs.",migrationPriority:"high"},{method:"POST",path:"/api/train/preflight",purpose:"Run backend-aware training preflight checks before launch.",migrationPriority:"high"},{method:"POST",path:"/api/train/sample_prompt",purpose:"Resolve and preview the effective training sample prompt text without launching a run.",migrationPriority:"high"},{method:"POST",path:"/api/dataset/masked_loss_audit",purpose:"Inspect alpha-channel mask readiness for masked-loss training workflows.",migrationPriority:"high"},{method:"POST",path:"/api/run_script",purpose:"Run utility scripts from the tools page.",migrationPriority:"high"},{method:"POST",path:"/api/interrogate",purpose:"Run the built-in tagger/interrogator flow.",migrationPriority:"high"},{method:"GET",path:"/api/interrogators",purpose:"List available batch tagger/interrogator models for the rebuilt tools workspace.",migrationPriority:"high"},{method:"POST",path:"/api/captions/cleanup/preview",purpose:"Preview bulk caption cleanup rules before touching files.",migrationPriority:"high"},{method:"POST",path:"/api/captions/cleanup/apply",purpose:"Apply bulk caption cleanup rules to caption files.",migrationPriority:"high"},{method:"POST",path:"/api/captions/backups/create",purpose:"Create a snapshot archive of caption files for later restore.",migrationPriority:"high"},{method:"POST",path:"/api/captions/backups/list",purpose:"List caption snapshots associated with a folder.",migrationPriority:"high"},{method:"POST",path:"/api/captions/backups/restore",purpose:"Restore caption files from a saved snapshot archive.",migrationPriority:"high"},{method:"GET",path:"/api/pick_file",purpose:"Open native file/folder pickers where supported.",migrationPriority:"medium"},{method:"GET",path:"/api/get_files",purpose:"List model, output or train directories for file pickers.",migrationPriority:"high"},{method:"GET",path:"/api/tasks",purpose:"Fetch active and historical task state.",migrationPriority:"high"},{method:"GET",path:"/api/tasks/terminate/{task_id}",purpose:"Terminate a running task.",migrationPriority:"high"},{method:"GET",path:"/api/tageditor_status",purpose:"Poll tag-editor startup/proxy status.",migrationPriority:"medium"},{method:"GET",path:"/api/scripts",purpose:"List backend-approved utility scripts and positional args for the rebuilt tools page.",migrationPriority:"high"}];function ut(){const e=at.map(a=>`
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
      `).join(""),t=fs.map(a=>`
        <tr>
          <td><span class="method method-${a.method.toLowerCase()}">${a.method}</span></td>
          <td><code>${a.path}</code></td>
          <td>${a.purpose}</td>
          <td>${a.migrationPriority}</td>
        </tr>
      `).join("");return`
    ${N("workspace","Source migration dashboard","This page stays close to the backend and keeps our migration map explicit instead of hiding it inside hashed dist chunks.")}

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
        <p class="eyebrow">Training catalog</p>
        <h2>Source-side trainer coverage</h2>
      </div>
      <p class="section-note">
        This catalog tracks which trainer families already have source-side routes, schema coverage and preset coverage.
      </p>
    </section>
    <section class="panel coverage-panel">
      <div id="training-catalog" class="coverage-list loading">Preparing training route catalog...</div>
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
  `}function bs(){return w({prefix:"xti",heroKicker:"sd xti",heroTitle:"SD XTI source training page",heroLede:"This route exposes the SD XTI schema on the shared source-side bridge so more specialized embedding workflows are no longer hidden behind the legacy page only.",runnerTitle:"SD XTI source-side runner",startButtonLabel:"Start SD XTI training",legacyPath:"/lora/xti.html",legacyLabel:"Open current shipped SD XTI page",renderedTitle:"SD XTI form bridge"})}function ys(e,t){if(t.length===0){m(e,"<p>No GPUs reported. Training will use the backend default environment.</p>");return}const a=t.map((n,s)=>{const i=n.index??n.id??s,r=String(i);return`
        <label class="gpu-chip">
          <input type="checkbox" data-gpu-id="${o(r)}" />
          <span>GPU ${o(r)}: ${o(n.name)}</span>
        </label>
      `}).join("");m(e,`<div class="gpu-chip-grid">${a}</div>`)}function Se(e){return[...document.querySelectorAll(`#${e} input[data-gpu-id]:checked`)].map(t=>t.dataset.gpuId).filter(t=>!!t)}function Te(e,t=[]){const a=new Set(t.map(n=>String(n)));document.querySelectorAll(`#${e}-gpu-selector input[data-gpu-id]`).forEach(n=>{const s=n.dataset.gpuId??"";n.checked=a.has(s)})}function vs(e){switch(e){case"prompt_file":return"Prompt file";case"generated":return"Generated from current fields";case"random_dataset_prompt_preview":return"Random dataset-derived prompt";case"legacy_sample_prompts_file":return"Legacy sample_prompts file";case"legacy_sample_prompts_inline":return"Legacy sample_prompts text";default:return e}}function L(e,t,a,n="idle"){m(`${e}-submit-status`,`
      <div class="submit-status-box submit-status-${n}">
        <strong>${o(t)}</strong>
        <p>${o(a)}</p>
      </div>
    `)}function te(e,t,a){if(a){m(`${e}-validation-status`,`
        <div class="submit-status-box submit-status-error">
          <strong>Payload preparation failed</strong>
          <p>${o(a)}</p>
        </div>
      `);return}const n=[t.errors.length>0?`
          <div>
            <strong>Errors</strong>
            <ul class="status-list">
              ${t.errors.map(s=>`<li>${o(s)}</li>`).join("")}
            </ul>
          </div>
        `:"",t.warnings.length>0?`
          <div>
            <strong>Warnings</strong>
            <ul class="status-list">
              ${t.warnings.map(s=>`<li>${o(s)}</li>`).join("")}
            </ul>
          </div>
        `:""].filter(Boolean).join("");if(!n){m(`${e}-validation-status`,`
        <div class="submit-status-box submit-status-success">
          <strong>Compatibility checks passed</strong>
          <p>No obvious parameter conflicts were detected in the current payload.</p>
        </div>
      `);return}m(`${e}-validation-status`,`
      <div class="submit-status-box ${t.errors.length>0?"submit-status-error":"submit-status-warning"}">
        <strong>${t.errors.length>0?"Action needed before launch":"Review before launch"}</strong>
        ${n}
      </div>
    `)}function b(e,t,a="idle"){const n=document.querySelector(`#${e}-utility-note`);n&&(n.textContent=t,n.classList.remove("utility-note-success","utility-note-warning","utility-note-error"),a==="success"?n.classList.add("utility-note-success"):a==="warning"?n.classList.add("utility-note-warning"):a==="error"&&n.classList.add("utility-note-error"))}function Xe(e,t,a){if(a){m(`${e}-preflight-report`,`
        <div class="submit-status-box submit-status-error">
          <strong>Preflight request failed</strong>
          <p>${o(a)}</p>
        </div>
      `);return}if(!t){m(`${e}-preflight-report`,`
        <div class="submit-status-box">
          <strong>Training preflight has not run yet</strong>
          <p>Run preflight to verify dataset, model, resume path, prompt preview, and runtime fallback expectations before launch.</p>
        </div>
      `);return}const n=[t.errors.length?`
          <div>
            <strong>Errors</strong>
            <ul class="status-list">
              ${t.errors.map(s=>`<li>${o(s)}</li>`).join("")}
            </ul>
          </div>
        `:"",t.warnings.length?`
          <div>
            <strong>Warnings</strong>
            <ul class="status-list">
              ${t.warnings.map(s=>`<li>${o(s)}</li>`).join("")}
            </ul>
          </div>
        `:"",t.notes.length?`
          <div>
            <strong>Notes</strong>
            <ul class="status-list">
              ${t.notes.map(s=>`<li>${o(s)}</li>`).join("")}
            </ul>
          </div>
        `:"",t.dataset?`
          <div>
            <strong>Dataset</strong>
            <ul class="status-list">
              <li>${o(t.dataset.path)}</li>
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
              <li>${o(t.conditioning_dataset.path)}</li>
              <li>${t.conditioning_dataset.image_count} images · ${(t.conditioning_dataset.caption_coverage*100).toFixed(1)}% caption coverage</li>
            </ul>
          </div>
        `:"",t.sample_prompt?`
          <div>
            <strong>Sample prompt preview</strong>
            <p class="training-preflight-meta">${o(vs(t.sample_prompt.source))}${t.sample_prompt.detail?` · ${o(t.sample_prompt.detail)}`:""}</p>
            <pre class="preset-preview">${o(t.sample_prompt.preview)}</pre>
          </div>
        `:""].filter(Boolean).join("");m(`${e}-preflight-report`,`
      <div class="submit-status-box ${t.can_start?"submit-status-success":"submit-status-warning"}">
        <strong>${t.can_start?"Backend preflight passed":"Backend preflight found launch blockers"}</strong>
        <p>Training type: ${o(t.training_type)}</p>
        ${n}
      </div>
    `)}function ks(e){const t=[];let a="",n=null,s=0;for(let i=0;i<e.length;i+=1){const r=e[i],c=i>0?e[i-1]:"";if(n){a+=r,r===n&&c!=="\\"&&(n=null);continue}if(r==='"'||r==="'"){n=r,a+=r;continue}if(r==="["){s+=1,a+=r;continue}if(r==="]"){s-=1,a+=r;continue}if(r===","&&s===0){t.push(a.trim()),a="";continue}a+=r}return a.trim().length>0&&t.push(a.trim()),t}function _s(e){let t=null,a=!1,n="";for(const s of e){if(t){if(n+=s,t==='"'&&s==="\\"&&!a){a=!0;continue}s===t&&!a&&(t=null),a=!1;continue}if(s==='"'||s==="'"){t=s,n+=s;continue}if(s==="#")break;n+=s}return n.trim()}function pt(e){return e.startsWith('"')&&e.endsWith('"')?e.slice(1,-1).replaceAll('\\"','"').replaceAll("\\n",`
`).replaceAll("\\t","	").replaceAll("\\\\","\\"):e.startsWith("'")&&e.endsWith("'")?e.slice(1,-1):e}function ht(e){const t=e.trim();return t.length===0?"":t.startsWith('"')&&t.endsWith('"')||t.startsWith("'")&&t.endsWith("'")?pt(t):t==="true"?!0:t==="false"?!1:t.startsWith("[")&&t.endsWith("]")?ks(t.slice(1,-1)).map(a=>ht(a)):/^[+-]?\d[\d_]*(\.\d[\d_]*)?([eE][+-]?\d+)?$/.test(t)?Number(t.replaceAll("_","")):t}function Ve(e){return e.split(".").map(t=>t.trim()).filter(Boolean).map(t=>pt(t))}function xs(e,t,a){let n=e;for(let s=0;s<t.length-1;s+=1){const i=t[s],r=n[i];(!r||typeof r!="object"||Array.isArray(r))&&(n[i]={}),n=n[i]}n[t[t.length-1]]=a}function mt(e){const t={};let a=[];for(const n of e.split(/\r?\n/)){const s=_s(n);if(!s)continue;if(s.startsWith("[[")&&s.endsWith("]]"))throw new Error("Array-of-table syntax is not supported in custom params yet.");if(s.startsWith("[")&&s.endsWith("]")){a=Ve(s.slice(1,-1));continue}const i=s.indexOf("=");if(i===-1)throw new Error(`Invalid TOML line: ${n}`);const r=Ve(s.slice(0,i));if(r.length===0)throw new Error(`Invalid TOML key: ${n}`);xs(t,[...a,...r],ht(s.slice(i+1)))}return t}function ce(e){return JSON.stringify(e)}function gt(e){return typeof e=="string"?ce(e):typeof e=="number"?Number.isFinite(e)?String(e):ce(String(e)):typeof e=="boolean"?e?"true":"false":Array.isArray(e)?`[${e.map(t=>gt(t)).join(", ")}]`:ce(JSON.stringify(e))}function ft(e,t=[],a=[]){const n=[];for(const[s,i]of Object.entries(e)){if(i&&typeof i=="object"&&!Array.isArray(i)){ft(i,[...t,s],a);continue}n.push([s,i])}return a.push({path:t,values:n}),a}function be(e){const t=ft(e).filter(n=>n.values.length>0).sort((n,s)=>n.path.join(".").localeCompare(s.path.join("."))),a=[];for(const n of t){n.path.length>0&&(a.length>0&&a.push(""),a.push(`[${n.path.join(".")}]`));for(const[s,i]of n.values.sort(([r],[c])=>r.localeCompare(c)))a.push(`${s} = ${gt(i)}`)}return a.join(`
`)}const ws=["pretrained_model_name_or_path","train_data_dir","reg_data_dir","output_dir","network_weights","conditioning_data_dir","controlnet_model_name_or_path","weights","vae","text_encoder","byt5","qwen3","llm_adapter_path","t5_tokenizer_path","ae","clip_l","clip_g","t5xxl","gemma2"],$s=["learning_rate","unet_lr","text_encoder_lr","learning_rate_te","learning_rate_te1","learning_rate_te2","learning_rate_te3","sigmoid_scale","guidance_scale","training_shift","control_net_lr","self_attn_lr","cross_attn_lr","mlp_lr","mod_lr","llm_adapter_lr"],Ss=["lycoris_algo","conv_dim","conv_alpha","dropout","dylora_unit","lokr_factor","train_norm","down_lr_weight","mid_lr_weight","up_lr_weight","block_lr_zero_threshold","enable_block_weights","enable_preview","network_args_custom","optimizer_args_custom","enable_base_weight","prodigy_d0","prodigy_d_coef","ui_custom_params"],Ts=["vae","reg_data_dir","network_weights","conditioning_data_dir","controlnet_model_name_or_path","weights","init_word","text_encoder","byt5","qwen3","llm_adapter_path","t5_tokenizer_path","ae","clip_l","clip_g","t5xxl","gemma2","noise_offset","multires_noise_iterations","multires_noise_discount","caption_dropout_rate","network_dropout","scale_weight_norms","gpu_ids"],Ls=["v2","v_parameterization","scale_v_pred_loss_like_noise_pred","clip_skip","learning_rate_te","stop_text_encoder_training"],As=["learning_rate_te1","learning_rate_te2"],Ps=[["cache_text_encoder_outputs","shuffle_caption"],["noise_offset","multires_noise_iterations"],["cache_latents","color_aug"],["cache_latents","random_crop"]],We={algo:"lycoris_algo",unit:"dylora_unit",factor:"lokr_factor"},Es=new Set(["conv_dim","conv_alpha","dropout","down_lr_weight","mid_lr_weight","up_lr_weight","block_lr_zero_threshold"]),Is=new Set(["decouple","weight_decay","use_bias_correction","safeguard_warmup"]),Rs=new Set(["base_weights","base_weights_multiplier"]),Ns={pretrained_model_name_or_path:"./sd-models/model.safetensors",train_data_dir:"./train/aki",resolution:"512,512",enable_bucket:!0,min_bucket_reso:256,max_bucket_reso:1024,output_name:"aki",output_dir:"./output",save_model_as:"safetensors",save_every_n_epochs:2,max_train_epochs:10,train_batch_size:1,network_train_unet_only:!1,network_train_text_encoder_only:!1,learning_rate:1e-4,unet_lr:1e-4,text_encoder_lr:1e-5,lr_scheduler:"cosine_with_restarts",optimizer_type:"AdamW8bit",lr_scheduler_num_cycles:1,network_module:"networks.lora",network_dim:32,network_alpha:32,logging_dir:"./logs",caption_extension:".txt",shuffle_caption:!0,keep_tokens:0,max_token_length:255,seed:1337,prior_loss_weight:1,clip_skip:2,mixed_precision:"fp16",save_precision:"fp16",xformers:!0,cache_latents:!0,persistent_data_loader_workers:!0};function ye(e){return JSON.parse(JSON.stringify(e??{}))}function J(e){return Array.isArray(e)?e.map(t=>String(t??"").trim()).filter(Boolean):String(e??"").split(/\r?\n/).map(t=>t.trim()).filter(Boolean)}function B(e,t){return Object.prototype.hasOwnProperty.call(e,t)}function Cs(e){return String(e.model_train_type??"").startsWith("sdxl")}function Ds(e){return String(e.model_train_type??"")==="sd3-finetune"}function y(e){return e==null?"":String(e)}function Bs(e){return y(e).replaceAll("\\","/")}function ae(e,t=0){const a=Number.parseFloat(y(e));return Number.isNaN(a)?t:a}function v(e){return!!e}function Ge(e){const t=e.indexOf("=");return t===-1?{key:e.trim(),value:"",hasValue:!1}:{key:e.slice(0,t).trim(),value:e.slice(t+1).trim(),hasValue:!0}}function qs(e){if(typeof e=="boolean")return e;const t=y(e).toLowerCase();return t==="true"||t==="1"||t==="yes"}function Le(e,t=String(e.model_train_type??"")){const a=t==="lora-basic"?{...Ns,...ye(e)}:ye(e),n=[],s=[],i=Cs(a),r=Ds(a);(i||r)&&[a.learning_rate_te1,a.learning_rate_te2,a.learning_rate_te3].some(v)&&(a.train_text_encoder=!0);for(const l of i||r?Ls:As)B(a,l)&&delete a[l];a.network_module==="lycoris.kohya"?(n.push(`conv_dim=${y(a.conv_dim)}`,`conv_alpha=${y(a.conv_alpha)}`,`dropout=${y(a.dropout)}`,`algo=${y(a.lycoris_algo)}`),v(a.lokr_factor)&&n.push(`factor=${y(a.lokr_factor)}`),v(a.train_norm)&&n.push("train_norm=True")):a.network_module==="networks.dylora"&&n.push(`unit=${y(a.dylora_unit)}`);const c=y(a.optimizer_type),h=c.toLowerCase();h.startsWith("dada")?((c==="DAdaptation"||c==="DAdaptAdam")&&s.push("decouple=True","weight_decay=0.01"),a.learning_rate=1,a.unet_lr=1,a.text_encoder_lr=1):h==="prodigy"&&(s.push("decouple=True","weight_decay=0.01","use_bias_correction=True",`d_coef=${y(a.prodigy_d_coef)}`),v(a.lr_warmup_steps)&&s.push("safeguard_warmup=True"),v(a.prodigy_d0)&&s.push(`d0=${y(a.prodigy_d0)}`)),v(a.enable_block_weights)&&(n.push(`down_lr_weight=${y(a.down_lr_weight)}`,`mid_lr_weight=${y(a.mid_lr_weight)}`,`up_lr_weight=${y(a.up_lr_weight)}`,`block_lr_zero_threshold=${y(a.block_lr_zero_threshold)}`),delete a.block_lr_zero_threshold),v(a.enable_base_weight)?(a.base_weights=J(a.base_weights),a.base_weights_multiplier=J(a.base_weights_multiplier).map(l=>ae(l))):(delete a.base_weights,delete a.base_weights_multiplier);for(const l of J(a.network_args_custom))n.push(l);for(const l of J(a.optimizer_args_custom))s.push(l);v(a.enable_preview)||(delete a.sample_prompts,delete a.sample_sampler,delete a.sample_every_n_epochs);for(const l of $s)B(a,l)&&(a[l]=ae(a[l]));for(const l of Ts){if(!B(a,l))continue;const d=a[l];(d===0||d===""||Array.isArray(d)&&d.length===0)&&delete a[l]}for(const l of ws)B(a,l)&&a[l]&&(a[l]=Bs(a[l]));if(n.length>0?a.network_args=n:delete a.network_args,s.length>0?a.optimizer_args=s:delete a.optimizer_args,v(a.ui_custom_params)){const l=mt(y(a.ui_custom_params));Object.assign(a,l)}for(const l of Ss)B(a,l)&&delete a[l];return Array.isArray(a.gpu_ids)&&(a.gpu_ids=a.gpu_ids.map(l=>{const d=y(l),p=d.match(/GPU\s+(\d+):/);return p?p[1]:d})),a}function Fs(e){const t=[],a=[],n=y(e.optimizer_type),s=n.toLowerCase(),i=y(e.model_train_type),r=i==="sd3-finetune",c=i==="anima-lora"||i==="anima-finetune";n.startsWith("DAdapt")&&e.lr_scheduler!=="constant"&&t.push("DAdaptation works best with lr_scheduler set to constant."),s.startsWith("prodigy")&&(B(e,"unet_lr")||B(e,"text_encoder_lr"))&&(ae(e.unet_lr,1)!==1||ae(e.text_encoder_lr,1)!==1)&&t.push("Prodigy usually expects unet_lr and text_encoder_lr to stay at 1."),e.network_module==="networks.oft"&&i!=="sdxl-lora"&&a.push("OFT is currently only supported for SDXL LoRA."),r&&v(e.train_text_encoder)&&v(e.cache_text_encoder_outputs)&&!v(e.use_t5xxl_cache_only)&&a.push("SD3 full finetune cannot train text encoders while cache_text_encoder_outputs is enabled."),r&&v(e.train_t5xxl)&&!v(e.train_text_encoder)&&a.push("train_t5xxl requires train_text_encoder to be enabled first."),r&&v(e.train_t5xxl)&&v(e.cache_text_encoder_outputs)&&a.push("train_t5xxl cannot be combined with cache_text_encoder_outputs."),c&&v(e.unsloth_offload_checkpointing)&&v(e.cpu_offload_checkpointing)&&a.push("unsloth_offload_checkpointing cannot be combined with cpu_offload_checkpointing."),c&&v(e.unsloth_offload_checkpointing)&&v(e.blocks_to_swap)&&a.push("unsloth_offload_checkpointing cannot be combined with blocks_to_swap."),v(e.masked_loss)&&!v(e.alpha_mask)&&!v(e.conditioning_data_dir)&&t.push("masked_loss is on, but alpha_mask is off. For normal alpha-channel datasets this often becomes a no-op.");for(const[h,l]of Ps)v(e[h])&&v(e[l])&&a.push(`Parameters ${h} and ${l} conflict. Please enable only one of them.`);return{warnings:t,errors:a}}function bt(e){const t=ye(e);if(Array.isArray(t.network_args)){const a=[];for(const n of t.network_args){const{key:s,value:i,hasValue:r}=Ge(y(n));if(s==="train_norm"){t.train_norm=r?qs(i):!0;continue}if((s==="down_lr_weight"||s==="mid_lr_weight"||s==="up_lr_weight"||s==="block_lr_zero_threshold")&&(t.enable_block_weights=!0),Es.has(s)){t[s]=i;continue}if(We[s]){t[We[s]]=i;continue}a.push(y(n))}a.length>0&&(t.network_args_custom=a),delete t.network_args}if(Array.isArray(t.optimizer_args)){const a=[];for(const n of t.optimizer_args){const{key:s,value:i}=Ge(y(n));if(s==="d_coef"){t.prodigy_d_coef=i;continue}if(s==="d0"){t.prodigy_d0=i;continue}Is.has(s)||a.push(y(n))}a.length>0&&(t.optimizer_args_custom=a),delete t.optimizer_args}for(const a of Rs)Array.isArray(t[a])&&(t[a]=t[a].map(n=>y(n)).join(`
`),a==="base_weights"&&(t.enable_base_weight=!0),a==="base_weights_multiplier"&&(t.enable_base_weight=!0));return Array.isArray(t.gpu_ids)&&(t.gpu_ids=t.gpu_ids.map(a=>y(a))),t}function G(e,t){const a=t.values.output_name;return typeof a=="string"&&a.trim().length>0?a.trim():`${e.modelLabel} snapshot`}function js(e){try{return JSON.stringify(Le(U(e.value)),null,2)}catch(t){return t instanceof Error?t.message:"Unable to preview this snapshot."}}function Os(e,t){if(t.length===0){m(`${e}-history-panel`,`
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
              <h4>${o(n.name||"Unnamed snapshot")}</h4>
              <p class="history-card-meta">${o(n.time)}</p>
            </div>
            <span class="coverage-pill coverage-pill-muted">${o((n.gpu_ids??[]).join(", ")||"default GPU")}</span>
          </div>
          <pre class="history-preview">${o(js(n))}</pre>
          <div class="history-card-actions">
            <button class="action-button action-button-ghost action-button-small" data-history-apply="${s}" type="button">Apply</button>
            <button class="action-button action-button-ghost action-button-small" data-history-rename="${s}" type="button">Rename</button>
            <button class="action-button action-button-ghost action-button-small" data-history-delete="${s}" type="button">Delete</button>
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
      <div class="history-list">${a}</div>
    `)}function Hs(e,t){if(t.length===0){m(`${e}-presets-panel`,`
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
              <h4>${o(i.name||n.name||`Preset ${s+1}`)}</h4>
              <p class="preset-card-meta">
                ${o(String(i.version||"unknown"))}
                · ${o(String(i.author||"unknown author"))}
              </p>
            </div>
            <span class="coverage-pill coverage-pill-muted">${o(String(i.train_type||"shared"))}</span>
          </div>
          <p>${o(String(i.description||"No description"))}</p>
          <pre class="preset-preview">${o(JSON.stringify(r,null,2))}</pre>
          <div class="preset-card-actions">
            <button class="action-button action-button-ghost action-button-small" data-preset-merge="${s}" type="button">Merge</button>
            <button class="action-button action-button-ghost action-button-small" data-preset-replace="${s}" type="button">Replace</button>
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
      <div class="preset-list">${a}</div>
    `)}function zs(e,t){if(t.length===0){m(`${e}-recipes-panel`,`
        <div class="training-side-panel-head">
          <div>
            <p class="panel-kicker">recipes</p>
            <h3>Local recipe library</h3>
          </div>
          <div class="history-toolbar">
            <button class="action-button action-button-ghost action-button-small" data-recipe-export-all="${e}" type="button">Export</button>
            <button class="action-button action-button-ghost action-button-small" data-recipe-close="${e}" type="button">Close</button>
          </div>
        </div>
        <p>No saved recipes for this route yet.</p>
      `);return}const a=t.map((n,s)=>`
        <article class="preset-card">
          <div class="preset-card-head">
            <div>
              <h4>${o(n.name)}</h4>
              <p class="preset-card-meta">
                ${o(n.created_at)}
                ${n.train_type?` · ${o(n.train_type)}`:""}
              </p>
            </div>
            <span class="coverage-pill coverage-pill-muted">${o(n.route_id||"local")}</span>
          </div>
          <p>${o(n.description||"No description")}</p>
          <pre class="preset-preview">${o(JSON.stringify(Le(U(n.value)),null,2))}</pre>
          <div class="preset-card-actions">
            <button class="action-button action-button-ghost action-button-small" data-recipe-merge="${s}" type="button">Merge</button>
            <button class="action-button action-button-ghost action-button-small" data-recipe-replace="${s}" type="button">Replace</button>
            <button class="action-button action-button-ghost action-button-small" data-recipe-export="${s}" type="button">Export</button>
            <button class="action-button action-button-ghost action-button-small" data-recipe-rename="${s}" type="button">Rename</button>
            <button class="action-button action-button-ghost action-button-small" data-recipe-delete="${s}" type="button">Delete</button>
          </div>
        </article>
      `).join("");m(`${e}-recipes-panel`,`
      <div class="training-side-panel-head">
        <div>
          <p class="panel-kicker">recipes</p>
          <h3>Local recipe library</h3>
        </div>
        <div class="history-toolbar">
          <button class="action-button action-button-ghost action-button-small" data-recipe-export-all="${e}" type="button">Export</button>
          <button class="action-button action-button-ghost action-button-small" data-recipe-close="${e}" type="button">Close</button>
        </div>
      </div>
      <div class="preset-list">${a}</div>
    `)}function Ms(e,t){const a=new Set(e.presetTrainTypes);return t.filter(n=>{const i=(n.metadata??{}).train_type;return typeof i!="string"||i.trim().length===0?!0:a.has(i)})}function S(e,t,a){const n=document.querySelector(`#${e}-history-panel`),s=document.querySelector(`#${e}-recipes-panel`),i=document.querySelector(`#${e}-presets-panel`);n&&(n.hidden=t==="history"?!a:!0),s&&(s.hidden=t==="recipes"?!a:!0),i&&(i.hidden=t==="presets"?!a:!0)}async function Ke(e,t){try{const a=await zt(t);if(a.status!=="success")throw new Error(a.message||"Training preflight failed.");return Xe(e.prefix,a.data??null),a.data??null}catch(a){throw Xe(e.prefix,null,a instanceof Error?a.message:"Training preflight failed."),a}}function Us(e){var t;(t=document.querySelector(`#${e.prefix}-stop-train`))==null||t.addEventListener("click",async()=>{var a;try{const s=(((a=(await xe()).data)==null?void 0:a.tasks)??[]).find(r=>String(r.status).toUpperCase()==="RUNNING");if(!s){b(e.prefix,"No running training task was found.","warning");return}const i=String(s.id??s.task_id??"");if(!i){b(e.prefix,"The running task does not expose an id.","error");return}if(!window.confirm(`Stop running task ${i}?`))return;await Qe(i),L(e.prefix,"Training stop requested",`Sent terminate request for task ${i}.`,"warning"),b(e.prefix,`Terminate requested for task ${i}.`,"warning")}catch(n){b(e.prefix,n instanceof Error?n.message:"Failed to stop training.","error")}})}function Xs(e,t,a){var s;(s=document.querySelector(`#${e.prefix}-run-preflight`))==null||s.addEventListener("click",async()=>{const i=t();if(!i){L(e.prefix,"Editor not ready",`The ${e.modelLabel} schema editor state is not initialized yet.`,"error");return}try{const r=a(i);te(e.prefix,r.checks),await Ke(e,r.payload),b(e.prefix,"Training preflight completed.","success")}catch(r){b(e.prefix,r instanceof Error?r.message:"Training preflight failed.","error")}});const n=document.querySelector(`#${e.prefix}-start-train`);n==null||n.addEventListener("click",async()=>{var r;const i=t();if(!i){L(e.prefix,"Editor not ready",`The ${e.modelLabel} schema editor state is not initialized yet.`,"error");return}n.setAttribute("disabled","true"),L(e.prefix,"Submitting training job...","Sending the current payload to /api/run.","idle");try{const c=a(i);if(c.checks.errors.length>0){L(e.prefix,"Fix parameter conflicts first",c.checks.errors.join(" "),"error"),te(e.prefix,c.checks);return}const h=await Ke(e,c.payload);if(h&&!h.can_start){L(e.prefix,"Resolve preflight errors first",h.errors.join(" "),"error");return}const l=await Ht(c.payload);if(l.status==="success"){const p=[...c.checks.warnings,...(h==null?void 0:h.warnings)??[],...((r=l.data)==null?void 0:r.warnings)??[]].join(" ");L(e.prefix,"Training request accepted",`${l.message||"Training started."}${p?` ${p}`:""}`,p?"warning":"success")}else L(e.prefix,"Training request failed",l.message||"Unknown backend failure.","error")}catch(c){L(e.prefix,"Training request failed",c instanceof Error?c.message:"Unknown network error.","error")}finally{n.removeAttribute("disabled")}})}function Ae(){return typeof window<"u"?window:null}function Pe(e,t){const a=Ae();if(!a)return t;try{const n=a.localStorage.getItem(e);return n?JSON.parse(n):t}catch{return t}}function Ee(e,t){const a=Ae();a&&a.localStorage.setItem(e,JSON.stringify(t))}function yt(e){return`source-training-autosave-${e}`}function vt(e){return`source-training-history-${e}`}function kt(e){return`source-training-recipes-${e}`}function Vs(e){return Pe(yt(e),null)}function Ws(e,t){Ee(yt(e),t)}function q(e){return Pe(vt(e),[])}function se(e,t){Ee(vt(e),t)}function C(e){return Pe(kt(e),[])}function ve(e,t){Ee(kt(e),t)}function z(e,t,a="text/plain;charset=utf-8"){const n=Ae();if(!n)return;const s=new Blob([t],{type:a}),i=URL.createObjectURL(s),r=n.document.createElement("a");r.href=i,r.download=e,r.click(),URL.revokeObjectURL(i)}function Gs(e){return e.trim().replace(/[^0-9A-Za-z._-]+/g,"-").replace(/-+/g,"-").replace(/^[-_.]+|[-_.]+$/g,"")||"training-preset"}function Ks(e,t,a){const n=G(e,t),s=String(a.payload.model_train_type??"");return{metadata:{name:n,version:"1.0",author:"SD-reScripts local export",train_type:s||e.schemaName,description:`Exported from the ${e.modelLabel} source-side training bridge on ${new Date().toLocaleString()}.`},data:a.payload}}function Js(e,t,a,n){const s=G(e,t),i=window.prompt("Recipe name",s);if(!i||!i.trim())return!1;const r=window.prompt("Recipe description (optional)","")??"",c=C(e.routeId);return c.unshift({created_at:new Date().toLocaleString(),name:i.trim(),description:r.trim()||void 0,train_type:String(a.payload.model_train_type??e.schemaName),route_id:e.routeId,value:U(a.payload)}),ve(e.routeId,c.slice(0,60)),n(),!0}function Ys(e,t,a){var s;const n=q(e.routeId);n.unshift({time:new Date().toLocaleString(),name:G(e,t),value:U(t.values),gpu_ids:Se(`${e.prefix}-gpu-selector`)}),se(e.routeId,n.slice(0,40)),(s=document.querySelector(`#${e.prefix}-history-panel`))!=null&&s.hidden||a()}function Zs(e,t,a,n){var s,i,r,c;(s=document.querySelector(`#${e.prefix}-download-config`))==null||s.addEventListener("click",()=>{const h=t();if(!h)return;const l=a(h);z(`${e.prefix}-${ue()}.toml`,be(l.payload)),b(e.prefix,"Exported current config as TOML.","success")}),(i=document.querySelector(`#${e.prefix}-export-preset`))==null||i.addEventListener("click",()=>{const h=t();if(!h)return;const l=a(h),d=Ks(e,h,l),p=Gs(G(e,h)||e.prefix);z(`${p}-preset.toml`,be(d)),b(e.prefix,"Exported current config as reusable preset TOML.","success")}),(r=document.querySelector(`#${e.prefix}-import-config`))==null||r.addEventListener("click",()=>{var h;(h=document.querySelector(`#${e.prefix}-config-file-input`))==null||h.click()}),(c=document.querySelector(`#${e.prefix}-config-file-input`))==null||c.addEventListener("change",h=>{var g;const l=h.currentTarget,d=(g=l.files)==null?void 0:g[0];if(!d)return;const p=new FileReader;p.onload=()=>{try{const f=mt(String(p.result??"")),k=f.data&&typeof f.data=="object"&&!Array.isArray(f.data)?f.data:f;n(k),b(e.prefix,f.data&&typeof f.data=="object"?`Imported preset: ${d.name}.`:`Imported config: ${d.name}.`,"success")}catch(f){b(e.prefix,f instanceof Error?f.message:"Failed to import config.","error")}finally{l.value=""}},p.readAsText(d)})}function Qs(e,t){var a;(a=document.querySelector(`#${e.prefix}-history-file-input`))==null||a.addEventListener("change",n=>{var c;const s=n.currentTarget,i=(c=s.files)==null?void 0:c[0];if(!i)return;const r=new FileReader;r.onload=()=>{try{const h=JSON.parse(String(r.result??""));if(!Array.isArray(h))throw new Error("History file must contain an array.");const l=h.filter(p=>p&&typeof p=="object"&&p.value&&typeof p.value=="object").map(p=>({time:String(p.time||new Date().toLocaleString()),name:p.name?String(p.name):void 0,value:U(p.value),gpu_ids:Array.isArray(p.gpu_ids)?p.gpu_ids.map(g=>String(g)):[]}));if(l.length===0)throw new Error("History file did not contain valid entries.");const d=[...q(e.routeId),...l].slice(0,80);se(e.routeId,d),t(),b(e.prefix,`Imported ${l.length} history entries.`,"success")}catch(h){b(e.prefix,h instanceof Error?h.message:"Failed to import history.","error")}finally{s.value=""}},r.readAsText(i)})}function en(e,t,a){m(`${e}-sample-prompt-workspace`,`
      <div class="submit-status-box">
        <strong>${o(t)}</strong>
        <p>${o(a)}</p>
      </div>
    `)}function tn(e){switch(e){case"prompt_file":return"Prompt file";case"generated":return"Generated from current fields";case"random_dataset_prompt_preview":return"Random dataset-derived prompt";case"legacy_sample_prompts_file":return"Legacy sample_prompts file";case"legacy_sample_prompts_inline":return"Legacy sample_prompts text";default:return e}}function ne(e){en(e,"Sample prompt workspace is waiting for refresh","Edit prompt fields freely, then click Refresh prompt to inspect the exact text that would be used.")}function Y(e,t,a){if(a){m(`${e}-sample-prompt-workspace`,`
        <div class="submit-status-box submit-status-error">
          <strong>Sample prompt preview failed</strong>
          <p>${o(a)}</p>
        </div>
      `);return}if(!t){ne(e);return}const n=[t.warnings.length?`
          <div>
            <strong>Warnings</strong>
            <ul class="status-list">
              ${t.warnings.map(r=>`<li>${o(r)}</li>`).join("")}
            </ul>
          </div>
        `:"",t.notes.length?`
          <div>
            <strong>Notes</strong>
            <ul class="status-list">
              ${t.notes.map(r=>`<li>${o(r)}</li>`).join("")}
            </ul>
          </div>
        `:""].filter(Boolean).join(""),s=t.warnings.length>0||!t.enabled?"submit-status-warning":"submit-status-success",i=t.line_count>3?`Showing the first 3 non-empty lines out of ${t.line_count}.`:`${t.line_count||0} non-empty line${t.line_count===1?"":"s"} detected.`;m(`${e}-sample-prompt-workspace`,`
      <div class="submit-status-box ${s}">
        <strong>${t.enabled?"Sample prompt resolved":"Sample prompt resolved, but preview is disabled"}</strong>
        <p class="training-preflight-meta">${o(tn(t.source))}${t.detail?` · ${o(t.detail)}`:""}</p>
        <p class="training-preflight-meta">${o(i)} Download will use ${o(t.suggested_file_name)}.</p>
        ${n}
        <pre class="preset-preview">${o(t.preview)}</pre>
      </div>
    `)}async function Je(e,t,a){const n=t();if(!n)throw new Error(`${e.modelLabel} editor is not ready yet.`);const s=a(n),i=await Mt(s.payload);if(i.status!=="success"||!i.data)throw new Error(i.message||"Sample prompt preview failed.");return i.data}function an(e){var i,r,c,h;const{config:t,getCurrentState:a,buildPreparedTrainingPayload:n,applyEditableRecord:s}=e;(i=document.querySelector(`#${t.prefix}-refresh-sample-prompt`))==null||i.addEventListener("click",async()=>{try{const l=await Je(t,a,n);Y(t.prefix,l),b(t.prefix,"Sample prompt preview refreshed.","success")}catch(l){Y(t.prefix,null,l instanceof Error?l.message:"Sample prompt preview failed."),b(t.prefix,l instanceof Error?l.message:"Sample prompt preview failed.","error")}}),(r=document.querySelector(`#${t.prefix}-download-sample-prompt`))==null||r.addEventListener("click",async()=>{try{const l=await Je(t,a,n);Y(t.prefix,l),z(l.suggested_file_name||"sample-prompts.txt",l.content||""),b(t.prefix,`Sample prompt exported as ${l.suggested_file_name}.`,"success")}catch(l){Y(t.prefix,null,l instanceof Error?l.message:"Sample prompt export failed."),b(t.prefix,l instanceof Error?l.message:"Sample prompt export failed.","error")}}),(c=document.querySelector(`#${t.prefix}-pick-prompt-file`))==null||c.addEventListener("click",async()=>{try{const l=await O("text-file");s({prompt_file:l},void 0,"merge"),ne(t.prefix),b(t.prefix,"Prompt file path inserted into the current form state.","success")}catch(l){b(t.prefix,l instanceof Error?l.message:"Prompt file picker failed.","error")}}),(h=document.querySelector(`#${t.prefix}-clear-prompt-file`))==null||h.addEventListener("click",()=>{s({prompt_file:""},void 0,"merge"),ne(t.prefix),b(t.prefix,"prompt_file cleared from the current form state.","warning")})}function sn(e){var f,k,_,T,D,X;const{config:t,createDefaultState:a,getCurrentState:n,mountTrainingState:s,onStateChange:i,applyEditableRecord:r,buildPreparedTrainingPayload:c,bindHistoryPanel:h,bindRecipePanel:l,openHistoryPanel:d,openRecipePanel:p,openPresetPanel:g}=e;document.querySelectorAll(`#${t.prefix}-gpu-selector input[data-gpu-id]`).forEach(I=>{I.addEventListener("change",()=>{const K=n();K&&i(K)})}),(f=document.querySelector(`#${t.prefix}-reset-all`))==null||f.addEventListener("click",()=>{const I=a();Te(t.prefix,[]),s(I),b(t.prefix,"Reset to schema defaults.","warning")}),(k=document.querySelector(`#${t.prefix}-save-params`))==null||k.addEventListener("click",()=>{const I=n();I&&(Ys(t,I,h),b(t.prefix,"Current parameters saved to history.","success"))}),(_=document.querySelector(`#${t.prefix}-read-params`))==null||_.addEventListener("click",()=>{d()}),(T=document.querySelector(`#${t.prefix}-save-recipe`))==null||T.addEventListener("click",()=>{const I=n();if(!I)return;const K=c(I);Js(t,I,K,l)&&b(t.prefix,"Current config saved to the local recipe library.","success")}),(D=document.querySelector(`#${t.prefix}-read-recipes`))==null||D.addEventListener("click",()=>{p()}),(X=document.querySelector(`#${t.prefix}-load-presets`))==null||X.addEventListener("click",()=>{g()}),Zs(t,n,c,r),Qs(t,d),an({config:t,getCurrentState:n,buildPreparedTrainingPayload:c,applyEditableRecord:r}),Us(t),Xs(t,n,c)}function nn(e,t){let a=null;const n=()=>{const l=q(e.routeId);Os(e.prefix,l),document.querySelectorAll(`#${e.prefix}-history-panel [data-history-close]`).forEach(d=>{d.addEventListener("click",()=>S(e.prefix,"history",!1))}),document.querySelectorAll(`#${e.prefix}-history-panel [data-history-export]`).forEach(d=>{d.addEventListener("click",()=>{z(`${e.prefix}-history-${ue()}.json`,JSON.stringify(q(e.routeId),null,2),"application/json;charset=utf-8"),b(e.prefix,"History exported.","success")})}),document.querySelectorAll(`#${e.prefix}-history-panel [data-history-import]`).forEach(d=>{d.addEventListener("click",()=>{var p;(p=document.querySelector(`#${e.prefix}-history-file-input`))==null||p.click()})}),document.querySelectorAll(`#${e.prefix}-history-panel [data-history-apply]`).forEach(d=>{d.addEventListener("click",()=>{const p=Number(d.dataset.historyApply??"-1"),g=q(e.routeId)[p];g&&(t(g.value,g.gpu_ids,"replace"),S(e.prefix,"history",!1),b(e.prefix,`Applied snapshot: ${g.name||"Unnamed snapshot"}.`,"success"))})}),document.querySelectorAll(`#${e.prefix}-history-panel [data-history-rename]`).forEach(d=>{d.addEventListener("click",()=>{const p=Number(d.dataset.historyRename??"-1"),g=q(e.routeId),f=g[p];if(!f)return;const k=window.prompt("Rename snapshot",f.name||"");k&&(f.name=k.trim(),se(e.routeId,g),n(),b(e.prefix,"Snapshot renamed.","success"))})}),document.querySelectorAll(`#${e.prefix}-history-panel [data-history-delete]`).forEach(d=>{d.addEventListener("click",()=>{const p=Number(d.dataset.historyDelete??"-1"),g=q(e.routeId),f=g[p];f&&window.confirm(`Delete snapshot "${f.name||"Unnamed snapshot"}"?`)&&(g.splice(p,1),se(e.routeId,g),n(),b(e.prefix,"Snapshot deleted.","success"))})})},s=()=>{n(),S(e.prefix,"history",!0)},i=()=>{const l=C(e.routeId);zs(e.prefix,l),document.querySelectorAll(`#${e.prefix}-recipes-panel [data-recipe-close]`).forEach(d=>{d.addEventListener("click",()=>S(e.prefix,"recipes",!1))}),document.querySelectorAll(`#${e.prefix}-recipes-panel [data-recipe-export-all]`).forEach(d=>{d.addEventListener("click",()=>{z(`${e.prefix}-recipes-${ue()}.json`,JSON.stringify(C(e.routeId),null,2),"application/json;charset=utf-8"),b(e.prefix,"Recipe library exported.","success")})}),document.querySelectorAll(`#${e.prefix}-recipes-panel [data-recipe-merge]`).forEach(d=>{d.addEventListener("click",()=>{const p=Number(d.dataset.recipeMerge??"-1"),g=C(e.routeId)[p];g&&(t(g.value,void 0,"merge"),S(e.prefix,"recipes",!1),b(e.prefix,`Merged recipe: ${g.name}.`,"success"))})}),document.querySelectorAll(`#${e.prefix}-recipes-panel [data-recipe-replace]`).forEach(d=>{d.addEventListener("click",()=>{const p=Number(d.dataset.recipeReplace??"-1"),g=C(e.routeId)[p];g&&(t(g.value,void 0,"replace"),S(e.prefix,"recipes",!1),b(e.prefix,`Replaced current values with recipe: ${g.name}.`,"success"))})}),document.querySelectorAll(`#${e.prefix}-recipes-panel [data-recipe-export]`).forEach(d=>{d.addEventListener("click",()=>{const p=Number(d.dataset.recipeExport??"-1"),g=C(e.routeId)[p];g&&(z(`${g.name.replace(/[^0-9A-Za-z._-]+/g,"-")||"recipe"}-preset.toml`,be({metadata:{name:g.name,version:"1.0",author:"SD-reScripts local recipe",train_type:g.train_type||e.schemaName,description:g.description||`Exported recipe from ${e.modelLabel}.`},data:g.value})),b(e.prefix,`Exported recipe: ${g.name}.`,"success"))})}),document.querySelectorAll(`#${e.prefix}-recipes-panel [data-recipe-rename]`).forEach(d=>{d.addEventListener("click",()=>{const p=Number(d.dataset.recipeRename??"-1"),g=C(e.routeId),f=g[p];if(!f)return;const k=window.prompt("Rename recipe",f.name);!k||!k.trim()||(f.name=k.trim(),ve(e.routeId,g),i(),b(e.prefix,"Recipe renamed.","success"))})}),document.querySelectorAll(`#${e.prefix}-recipes-panel [data-recipe-delete]`).forEach(d=>{d.addEventListener("click",()=>{const p=Number(d.dataset.recipeDelete??"-1"),g=C(e.routeId),f=g[p];f&&window.confirm(`Delete recipe "${f.name}"?`)&&(g.splice(p,1),ve(e.routeId,g),i(),b(e.prefix,"Recipe deleted.","success"))})})},r=()=>{i(),S(e.prefix,"recipes",!0)},c=()=>{Hs(e.prefix,a??[]),document.querySelectorAll(`#${e.prefix}-presets-panel [data-preset-close]`).forEach(l=>{l.addEventListener("click",()=>S(e.prefix,"presets",!1))}),document.querySelectorAll(`#${e.prefix}-presets-panel [data-preset-merge]`).forEach(l=>{l.addEventListener("click",()=>{const d=Number(l.dataset.presetMerge??"-1"),p=a==null?void 0:a[d];if(!p)return;const g=p.data??{};t(g,void 0,"merge"),S(e.prefix,"presets",!1),b(e.prefix,`Merged preset: ${String((p.metadata??{}).name||p.name||"preset")}.`,"success")})}),document.querySelectorAll(`#${e.prefix}-presets-panel [data-preset-replace]`).forEach(l=>{l.addEventListener("click",()=>{const d=Number(l.dataset.presetReplace??"-1"),p=a==null?void 0:a[d];if(!p)return;const g=p.data??{};t(g,void 0,"replace"),S(e.prefix,"presets",!1),b(e.prefix,`Replaced current values with preset: ${String((p.metadata??{}).name||p.name||"preset")}.`,"success")})})};return{bindHistoryPanel:n,bindRecipePanel:i,openHistoryPanel:s,openRecipePanel:r,openPresetPanel:async()=>{var l;if(!a)try{const d=await Ze();a=Ms(e,((l=d.data)==null?void 0:l.presets)??[])}catch(d){b(e.prefix,d instanceof Error?d.message:"Failed to load presets.","error");return}c(),S(e.prefix,"presets",!0)}}}async function rn(e){var c,h,l,d;const t=Ma(e.prefix),[a,n]=await Promise.allSettled([_e(),et()]);if(n.status==="fulfilled"){const p=((c=n.value.data)==null?void 0:c.cards)??[],g=(h=n.value.data)==null?void 0:h.xformers;ys(`${e.prefix}-gpu-selector`,p),u(`${e.prefix}-runtime-title`,`${p.length} GPU entries reachable`),m(`${e.prefix}-runtime-body`,`
        <p>${o(nt(p))}</p>
        <p>${o(g?`xformers: ${g.installed?"installed":"missing"}, ${g.supported?"supported":"fallback"} (${g.reason})`:"xformers info unavailable")}</p>
      `)}else u(`${e.prefix}-runtime-title`,"GPU runtime request failed"),u(`${e.prefix}-runtime-body`,n.reason instanceof Error?n.reason.message:"Unknown error");if(a.status!=="fulfilled")return u(t.summaryId,`${e.modelLabel} schema request failed`),m(t.sectionsId,`<p>${a.reason instanceof Error?o(a.reason.message):"Unknown error"}</p>`),M(t.previewId,"{}"),L(e.prefix,"Schema unavailable",`The ${e.modelLabel} training bridge could not load the backend schema.`,"error"),null;const s=((l=a.value.data)==null?void 0:l.schemas)??[],i=ot(s),r=(d=ie(i).find(p=>p.name===e.schemaName))==null?void 0:d.name;return r?{domIds:t,createDefaultState:()=>ee(i,r)}:(u(t.summaryId,`No ${e.schemaName} schema was returned.`),m(t.sectionsId,`<p>The backend did not expose ${o(e.schemaName)}.</p>`),L(e.prefix,"Schema missing",`The backend did not expose the ${e.schemaName} schema.`,"error"),null)}const Ye={};function on(e,t){const a=dt(t),n=Se(`${e}-gpu-selector`);n.length>0&&(a.gpu_ids=n);const s=Le(a);return{payload:s,checks:Fs(s)}}function _t(e){return new Set(e.sections.flatMap(t=>t.fields.map(a=>a.path)))}function xt(e,t){const a=_t(e),n={...e.values};for(const[s,i]of Object.entries(t))a.has(s)&&(n[s]=i);return{...e,values:n}}function ln(e,t){return{...e,values:{...e.values,...Object.fromEntries(Object.entries(t).filter(([a])=>_t(e).has(a)))}}}function cn(e,t){return t&&t.length>0?t.map(a=>String(a)):Array.isArray(e.gpu_ids)?e.gpu_ids.map(a=>String(a)):[]}function dn(e,t){Ws(e.routeId,{time:new Date().toLocaleString(),name:G(e,t),value:U(t.values),gpu_ids:Se(`${e.prefix}-gpu-selector`)})}function un(e){const{config:t,createDefaultState:a,mountTrainingState:n}=e,s=Vs(t.routeId),i=s!=null&&s.value?xt(a(),bt(s.value)):a();(s==null?void 0:s.gpu_ids)!==void 0&&Te(t.prefix,s.gpu_ids),n(i),s!=null&&s.value&&b(t.prefix,"Restored autosaved parameters for this route.","success")}function pn(e,t,a,n,s){return i=>{try{const r=a(i),c=Object.fromEntries(Object.entries(r.payload).sort(([h],[l])=>h.localeCompare(l)));M(t.previewId,JSON.stringify(c,null,2)),te(e.prefix,r.checks)}catch(r){M(t.previewId,"{}"),te(e.prefix,{warnings:[],errors:[]},r instanceof Error?r.message:"The current state could not be converted into a launch payload.")}n(i),s==null||s()}}function hn(e,t,a){const n=()=>Ye[e.routeId],s=l=>on(e.prefix,l),i=pn(e,t,s,l=>dn(e,l),()=>ne(e.prefix)),r=l=>{W(l,t,d=>{Ye[e.routeId]=d},i)};return{getCurrentState:n,prepareTrainingPayload:s,onStateChange:i,mountTrainingState:r,applyEditableRecord:(l,d,p="replace")=>{const g=p==="merge"?n()??a():a(),f=bt(l),k=p==="merge"?ln(g,f):xt(g,f);Te(e.prefix,cn(f,d)),r(k)},restoreAutosave:()=>un({config:e,createDefaultState:a,mountTrainingState:r})}}async function mn(e){const t=await rn(e);if(!t)return;const a=hn(e,t.domIds,t.createDefaultState),n=nn(e,a.applyEditableRecord);a.restoreAutosave(),sn({config:e,createDefaultState:t.createDefaultState,getCurrentState:a.getCurrentState,mountTrainingState:a.mountTrainingState,onStateChange:a.onStateChange,applyEditableRecord:a.applyEditableRecord,buildPreparedTrainingPayload:a.prepareTrainingPayload,bindHistoryPanel:n.bindHistoryPanel,bindRecipePanel:n.bindRecipePanel,openHistoryPanel:n.openHistoryPanel,openRecipePanel:n.openRecipePanel,openPresetPanel:n.openPresetPanel}),L(e.prefix,`${e.modelLabel} bridge ready`,"You can review the generated payload and submit the current config to /api/run.","success"),S(e.prefix,"history",!1),S(e.prefix,"recipes",!1),S(e.prefix,"presets",!1)}const gn={overview:ut,about:Va,settings:us,tasks:hs,tageditor:ps,tensorboard:ms,tools:gs,"schema-bridge":as,"sdxl-train":ds,"flux-train":Za,"sd3-train":ns,"sd3-finetune-train":ss,"dreambooth-train":Ka,"flux-finetune-train":Ya,"sd-controlnet-train":is,"sdxl-controlnet-train":os,"flux-controlnet-train":Ja,"sdxl-lllite-train":ls,"sd-ti-train":rs,"xti-train":bs,"sdxl-ti-train":cs,"anima-train":Ga,"anima-finetune-train":Wa,"lumina-train":ts,"lumina-finetune-train":es,"hunyuan-image-train":Qa};function fn(e){const t={overview:j.filter(a=>a.section==="overview"),phase1:j.filter(a=>a.section==="phase1"),reference:j.filter(a=>a.section==="reference")};return`
    <div class="nav-group">
      <p class="nav-heading">Workspace</p>
      ${t.overview.map(a=>de(a.hash,a.label,a.description,e)).join("")}
    </div>
    <div class="nav-group">
      <p class="nav-heading">Phase 1 Pages</p>
      ${t.phase1.map(a=>de(a.hash,a.label,a.description,e)).join("")}
    </div>
    <div class="nav-group">
      <p class="nav-heading">Core Bridge</p>
      ${t.reference.map(a=>de(a.hash,a.label,a.description,e)).join("")}
    </div>
  `}function de(e,t,a,n){return`
    <a class="nav-link ${e===n?"is-active":""}" href="${e}">
      <span>${t}</span>
      <small>${a}</small>
    </a>
  `}async function bn(e){e==="overview"?await ca():e==="settings"?await ua():e==="tasks"?await Aa():e==="tageditor"?await ma():e==="tools"?await ga():e==="schema-bridge"?await Ua(()=>{}):pe[e]&&await mn(pe[e])}async function yn(e){la();const t=oa(),a=gn[t.id]??ut;e.innerHTML=Xa(t.hash,a());const n=document.querySelector("#side-nav");n&&(n.innerHTML=fn(t.hash)),await bn(t.id)}const wt=document.querySelector("#app");if(!(wt instanceof HTMLElement))throw new Error("App root not found.");const vn=wt;async function $t(){await yn(vn)}window.addEventListener("hashchange",()=>{$t()});$t();
