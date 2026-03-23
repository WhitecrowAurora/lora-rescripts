var Lt=Object.defineProperty;var It=(e,t,a)=>t in e?Lt(e,t,{enumerable:!0,configurable:!0,writable:!0,value:a}):e[t]=a;var $=(e,t,a)=>It(e,typeof t!="symbol"?t+"":t,a);(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))n(s);new MutationObserver(s=>{for(const i of s)if(i.type==="childList")for(const o of i.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&n(o)}).observe(document,{childList:!0,subtree:!0});function a(s){const i={};return s.integrity&&(i.integrity=s.integrity),s.referrerPolicy&&(i.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?i.credentials="include":s.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function n(s){if(s.ep)return;s.ep=!0;const i=a(s);fetch(s.href,i)}})();const ke="".replace(/\/$/,"");async function P(e){const t=await fetch(`${ke}${e}`,{headers:{Accept:"application/json"}});if(!t.ok)throw new Error(`${t.status} ${t.statusText}`);return await t.json()}async function R(e,t){const a=await fetch(`${ke}${e}`,{method:"POST",headers:{Accept:"application/json","Content-Type":"application/json"},body:JSON.stringify(t)});if(!a.ok)throw new Error(`${a.status} ${a.statusText}`);return await a.json()}async function At(e){const t=await fetch(`${ke}${e}`,{headers:{Accept:"application/json"}});if(!t.ok)throw new Error(`${t.status} ${t.statusText}`);return await t.json()}async function Et(){return P("/api/schemas/hashes")}async function _e(){return P("/api/schemas/all")}async function tt(){return P("/api/presets")}async function Pt(){return P("/api/config/saved_params")}async function Rt(){return P("/api/config/summary")}async function xe(){return P("/api/tasks")}async function at(e){return P(`/api/tasks/terminate/${e}`)}async function st(){return P("/api/graphic_cards")}async function nt(){return At("/api/tageditor_status")}async function Nt(){return P("/api/scripts")}async function Ct(e){return R("/api/dataset/analyze",e)}async function Dt(e){return R("/api/dataset/masked_loss_audit",e)}async function Bt(){return P("/api/interrogators")}async function O(e){var a;const t=await P(`/api/pick_file?picker_type=${encodeURIComponent(e)}`);if(t.status!=="success"||!((a=t.data)!=null&&a.path))throw new Error(t.message||"File picker did not return a path.");return t.data.path}async function qt(e){return R("/api/interrogate",e)}async function Ft(e){return R("/api/captions/cleanup/preview",e)}async function jt(e){return R("/api/captions/cleanup/apply",e)}async function Ot(e){return R("/api/captions/backups/create",e)}async function Ht(e){return R("/api/captions/backups/list",e)}async function zt(e){return R("/api/captions/backups/restore",e)}async function Mt(e){return R("/api/run",e)}async function Ut(e){return R("/api/train/preflight",e)}async function Xt(e){return R("/api/train/sample_prompt",e)}function h(e,t){const a=document.querySelector(`#${e}`);a&&(a.textContent=t)}function g(e,t){const a=document.querySelector(`#${e}`);a&&(a.innerHTML=t)}function U(e,t){const a=document.querySelector(`#${e}`);a&&(a.textContent=t)}const it=[{route:"index.html",title:"SD-reScripts | SD training UI",section:"core",status:"migrate-first",notes:"Landing page and main navigation entry. Good first candidate for source migration."},{route:"lora/index.html",title:"LoRA training index",section:"training",status:"migrate-first",notes:"Top-level training model selector page.",schemaHints:["shared"]},{route:"lora/sdxl.html",title:"SDXL LoRA training",section:"training",status:"migrate-first",notes:"Primary training page currently used most often.",schemaHints:["sdxl-lora","shared"]},{route:"lora/flux.html",title:"Flux LoRA training",section:"training",status:"migrate-first",notes:"Now mirrored by the shared source-side training bridge.",schemaHints:["flux-lora","shared"]},{route:"lora/sd3.html",title:"SD3 training",section:"training",status:"migrate-first",notes:"Now mirrored by the shared source-side training bridge.",schemaHints:["sd3-lora","shared"]},{route:"lora/controlnet.html",title:"SD ControlNet training",section:"training",status:"migrate-first",notes:"Now mirrored by the shared source-side training bridge.",schemaHints:["sd-controlnet","shared"]},{route:"lora/sdxl-controlnet.html",title:"SDXL ControlNet training",section:"training",status:"migrate-first",notes:"Now mirrored by the shared source-side training bridge.",schemaHints:["sdxl-controlnet","shared"]},{route:"lora/sdxl-lllite.html",title:"SDXL LLLite training",section:"training",status:"migrate-first",notes:"Specialized SDXL conditioning route now mirrored by the shared source-side bridge.",schemaHints:["sdxl-controlnet-lllite","shared"]},{route:"lora/flux-controlnet.html",title:"Flux ControlNet training",section:"training",status:"migrate-first",notes:"Now mirrored by the shared source-side training bridge.",schemaHints:["flux-controlnet","shared"]},{route:"lora/basic.html",title:"LoRA basic mode",section:"training",status:"legacy-dist",notes:"Legacy beginner-mode training route.",schemaHints:["lora-basic","shared"]},{route:"lora/master.html",title:"LoRA expert mode",section:"training",status:"legacy-dist",notes:"Legacy expert-mode training route.",schemaHints:["lora-master","shared"]},{route:"lora/params.html",title:"Training parameter reference",section:"training",status:"migrate-first",notes:"Mostly explanatory UI. Lower risk to recreate cleanly."},{route:"lora/tools.html",title:"LoRA tools",section:"tools",status:"migrate-first",notes:"Tool launcher route for merge, resize, interrogate and conversion flows."},{route:"dreambooth/index.html",title:"Dreambooth training",section:"training",status:"migrate-first",notes:"Now mirrored by the shared source-side training bridge for Dreambooth and SDXL full finetune.",schemaHints:["dreambooth","shared"]},{route:"tagger.html",title:"Tagger tool",section:"tools",status:"migrate-first",notes:"Standalone caption/tag generation route that talks to backend APIs.",schemaHints:["tagger"]},{route:"tageditor.html",title:"Tag editor proxy page",section:"tools",status:"migrate-first",notes:"Wrapper page with progress/failure states. Good candidate to reimplement cleanly."},{route:"task.html",title:"Task monitor",section:"system",status:"migrate-first",notes:"Task status page backed by /api/tasks."},{route:"tensorboard.html",title:"TensorBoard proxy page",section:"system",status:"migrate-first",notes:"Wrapper/proxy page. Safer than schema-heavy form routes."},{route:"other/settings.html",title:"Settings page",section:"system",status:"migrate-first",notes:"Static/system page that should be easy to recreate in source form."},{route:"other/about.html",title:"About page",section:"core",status:"migrate-first",notes:"Mostly branding and release notes. Best low-risk migration target."},{route:"404.html",title:"Fallback page",section:"core",status:"legacy-dist",notes:"Can be replaced after the main router is rebuilt."}];function l(e){return String(e).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;")}function H(e){return JSON.parse(JSON.stringify(e))}function pe(e=new Date){return e.toISOString().replaceAll(":","-").replaceAll(".","-")}function Vt(e){if(e.length===0){g("schema-browser","<p>No schemas returned.</p>");return}const t=e.map(a=>{var s;const n=((s=a.schema.split(/\r?\n/).find(i=>i.trim().length>0))==null?void 0:s.trim())||"No preview available.";return`
        <article class="schema-card">
          <div class="schema-head">
            <h3>${l(a.name)}</h3>
            <span class="schema-hash">${l(a.hash.slice(0,8))}</span>
          </div>
          <p>${l(n)}</p>
        </article>
      `}).join("");g("schema-browser",t)}function Wt(e){const t=new Set(it.flatMap(i=>i.schemaHints??[])),a=new Set(e.map(i=>i.name)),n=[...t].filter(i=>a.has(i)).sort(),s=e.map(i=>i.name).filter(i=>!t.has(i)).sort();g("schema-mapped",n.length?n.map(i=>`<span class="coverage-pill">${l(i)}</span>`).join(""):"<p>No mapped schema hints yet.</p>"),g("schema-unmapped",s.length?s.map(i=>`<span class="coverage-pill coverage-pill-muted">${l(i)}</span>`).join(""):"<p>All schemas are represented in the current route hints.</p>")}function Gt(e){if(!e.length){g("training-catalog","<p>No training routes were registered.</p>");return}const t=e.length,a=e.filter(r=>r.schemaAvailable).length,n=e.filter(r=>r.presetCount>0).length,s=e.filter(r=>r.localRecipeCount>0).length,i=new Map,o=new Map;for(const r of e){i.set(r.family,(i.get(r.family)??0)+1);for(const d of r.capabilities)o.set(d,(o.get(d)??0)+1)}const c=`
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
        <span class="metric-label">Recipe-covered</span>
        <strong class="dataset-analysis-stat-value">${s}</strong>
      </article>
      <article class="dataset-analysis-stat">
        <span class="metric-label">Families</span>
        <strong class="dataset-analysis-stat-value">${i.size}</strong>
      </article>
    </section>
    <div class="coverage-list training-catalog-capabilities">
      ${[...o.entries()].sort((r,d)=>d[1]-r[1]||r[0].localeCompare(d[0])).map(([r,d])=>`<span class="coverage-pill">${l(r)} <strong>${d}</strong></span>`).join("")}
    </div>
  `,p=e.map(r=>`
        <article class="training-catalog-card" data-family="${l(r.family)}">
          <div class="training-catalog-head">
            <div>
              <p class="panel-kicker">${l(r.family)}</p>
              <h3>${l(r.title)}</h3>
            </div>
            <a class="text-link" href="${l(r.routeHash)}">Open</a>
          </div>
          <p class="training-catalog-route"><code>${l(r.routeHash)}</code></p>
          <p class="training-catalog-meta">
            Schema: <code>${l(r.schemaName)}</code>
            · Model: <strong>${l(r.modelLabel)}</strong>
          </p>
          <div class="coverage-list">
            <span class="coverage-pill ${r.schemaAvailable?"":"coverage-pill-muted"}">${r.schemaAvailable?"schema ok":"schema missing"}</span>
            <span class="coverage-pill ${r.presetCount>0?"":"coverage-pill-muted"}">${r.presetCount} presets</span>
            <span class="coverage-pill ${r.localRecipeCount>0?"":"coverage-pill-muted"}">${r.localRecipeCount} recipes</span>
          </div>
          <div class="coverage-list training-catalog-capability-row">
            ${r.capabilities.map(d=>`<span class="coverage-pill coverage-pill-muted">${l(d)}</span>`).join("")}
          </div>
        </article>
      `).join("");g("training-catalog",`
      ${c}
      <div class="training-catalog-grid">${p}</div>
    `)}function Kt(e){if(e.length===0){g("task-table-container","<p>No tasks currently tracked.</p>");return}const t=e.map(a=>`
        <tr>
          <td><code>${l(a.id??a.task_id??"unknown")}</code></td>
          <td>${l(a.status??"unknown")}</td>
          <td>
            <button class="action-button action-button-small" data-task-terminate="${l(a.id??a.task_id??"")}" type="button">
              Terminate
            </button>
          </td>
        </tr>
      `).join("");g("task-table-container",`
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
    `)}function Jt(e){if(e.length===0){g("tools-browser","<p>No scripts returned.</p>");return}const t=e.map(a=>`
        <article class="tool-card">
          <div class="tool-card-head">
            <h3>${l(a.name)}</h3>
            <span class="coverage-pill ${a.category==="networks"?"":"coverage-pill-muted"}">${l(a.category)}</span>
          </div>
          <p>${a.positional_args.length>0?`Positional args: ${a.positional_args.map(n=>`<code>${l(n)}</code>`).join(", ")}`:"No positional args required."}</p>
        </article>
      `).join("");g("tools-browser",t)}function Yt(e){const t=[{label:"Images",value:e.summary.image_count},{label:"Effective images",value:e.summary.effective_image_count},{label:"Alpha-capable candidates",value:e.summary.alpha_capable_image_count},{label:"Caption coverage",value:Q(e.summary.caption_coverage)},{label:"Unique tags",value:e.summary.unique_tag_count},{label:"Caption files",value:e.summary.caption_file_count},{label:"Avg tags / caption",value:e.summary.average_tags_per_caption.toFixed(2)}],a=e.warnings.length?`
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
                  ${Q(s.caption_coverage)}
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
          `).join(""):"<p>No dataset folder summary returned.</p>";g("dataset-analysis-results",`
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
          ${rt(e.top_tags,"No caption tags found yet.")}
        </article>
        <article class="dataset-analysis-block">
          <p class="panel-kicker">images</p>
          <h3>Top resolutions</h3>
          ${oe(e.top_resolutions,"No resolution data collected.")}
        </article>
        <article class="dataset-analysis-block">
          <p class="panel-kicker">mix</p>
          <h3>Orientation + formats</h3>
          <div>${oe(e.orientation_counts,"No orientation data.")}</div>
          <div class="dataset-analysis-sublist">${oe(e.image_extensions,"No image extension data.")}</div>
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
            ${I(e.samples.images_without_caption,"No missing-caption samples.")}
          </div>
          <div class="dataset-analysis-sublist">
            <h4>Orphan captions</h4>
            ${I(e.samples.orphan_captions,"No orphan-caption samples.")}
          </div>
          <div class="dataset-analysis-sublist">
            <h4>Broken images</h4>
            ${I(e.samples.broken_images,"No broken-image samples.")}
          </div>
        </article>
      </section>
    `)}function Zt(e,t="masked-loss-audit-results"){const a=[{label:"Images",value:e.summary.image_count},{label:"Alpha channel images",value:e.summary.alpha_channel_image_count},{label:"Usable masks",value:e.summary.usable_mask_image_count},{label:"Soft alpha masks",value:e.summary.soft_alpha_image_count},{label:"Binary alpha masks",value:e.summary.binary_alpha_image_count},{label:"Avg masked area",value:Q(e.summary.average_mask_coverage)},{label:"Avg alpha weight",value:Q(e.summary.average_alpha_weight)}],n=e.warnings.length?`
      <article class="dataset-analysis-block dataset-analysis-warning">
        <p class="panel-kicker">warnings</p>
        <ul class="dataset-analysis-list-plain">
          ${e.warnings.map(s=>`<li>${l(s)}</li>`).join("")}
        </ul>
      </article>
    `:"";g(t,`
      ${n}
      <section class="dataset-analysis-grid">
        ${a.map(s=>`
              <article class="dataset-analysis-stat">
                <span class="metric-label">${l(s.label)}</span>
                <strong class="dataset-analysis-stat-value">${l(s.value)}</strong>
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
            ${e.guidance.map(s=>`<li>${l(s)}</li>`).join("")}
          </ul>
        </article>
      </section>
      <section class="dataset-analysis-columns">
        <article class="dataset-analysis-block">
          <p class="panel-kicker">samples</p>
          <h3>Usable mask files</h3>
          ${I(e.samples.usable_masks,"No usable alpha-mask samples were found.")}
        </article>
        <article class="dataset-analysis-block">
          <p class="panel-kicker">samples</p>
          <h3>Soft alpha files</h3>
          ${I(e.samples.soft_alpha_masks,"No soft alpha-mask samples were found.")}
        </article>
        <article class="dataset-analysis-block">
          <p class="panel-kicker">samples</p>
          <h3>Opaque alpha files</h3>
          ${I(e.samples.fully_opaque_alpha,"No fully opaque alpha-channel samples were found.")}
        </article>
        <article class="dataset-analysis-block">
          <p class="panel-kicker">samples</p>
          <h3>No alpha files</h3>
          ${I(e.samples.no_alpha,"No non-alpha samples were captured.")}
        </article>
      </section>
    `)}function Qt(e,t="caption-cleanup-results"){const a=[{label:"Caption files",value:e.summary.file_count},{label:"Changed",value:e.summary.changed_file_count},{label:"Unchanged",value:e.summary.unchanged_file_count},{label:"Tag instances removed",value:e.summary.removed_tag_instances},{label:"Tag instances added",value:e.summary.added_tag_instances},{label:"Empty results",value:e.summary.empty_result_count}],n=e.warnings.length?`
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
                ${I(i.removed_tags,"No explicit tag removals in sample.")}
              </div>
              <div class="dataset-analysis-sublist">
                <h4>Added tags</h4>
                ${I(i.added_tags,"No explicit tag additions in sample.")}
              </div>
            </article>
          `).join(""):"<p>No sample caption changes were captured.</p>";g(t,`
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
          ${rt([e.options.dedupe_tags?{name:"dedupe tags",count:1}:null,e.options.sort_tags?{name:"sort tags",count:1}:null,e.options.use_regex?{name:"regex replace",count:1}:null].filter(Boolean),"No boolean cleanup switches enabled.")}
          <div class="dataset-analysis-sublist">
            <h4>Remove tags</h4>
            ${I(e.options.remove_tags,"No exact tags configured for removal.")}
          </div>
          <div class="dataset-analysis-sublist">
            <h4>Prepend tags</h4>
            ${I(e.options.prepend_tags,"No prepend tags configured.")}
          </div>
          <div class="dataset-analysis-sublist">
            <h4>Append tags</h4>
            ${I(e.options.append_tags,"No append tags configured.")}
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
    `)}function ea(e,t,a="caption-backup-results"){if(!e.length){g(a,`
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
          <p>Caption files: <strong>${s.file_count}</strong> · Archive size: <strong>${aa(s.archive_size)}</strong></p>
          <p>Extension: <code>${l(s.caption_extension||".txt")}</code> · Recursive: <strong>${s.recursive?"yes":"no"}</strong></p>
        </article>
      `).join("");g(a,`<div class="dataset-analysis-stack">${n}</div>`)}function ta(e,t="caption-backup-results"){const a=e.warnings.length?`
      <article class="dataset-analysis-block dataset-analysis-warning">
        <p class="panel-kicker">warnings</p>
        <ul class="dataset-analysis-list-plain">
          ${e.warnings.map(n=>`<li>${l(n)}</li>`).join("")}
        </ul>
      </article>
    `:"";g(t,`
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
    `)}function rt(e,t){return e.length?`
    <div class="coverage-list">
      ${e.map(a=>`<span class="coverage-pill">${l(a.name)} <strong>${a.count}</strong></span>`).join("")}
    </div>
  `:`<p>${l(t)}</p>`}function oe(e,t){return e.length?`
    <ul class="dataset-analysis-list-plain">
      ${e.map(a=>`<li><code>${l(a.name)}</code> <strong>${a.count}</strong></li>`).join("")}
    </ul>
  `:`<p>${l(t)}</p>`}function I(e,t){return e.length?`
    <ul class="dataset-analysis-list-plain">
      ${e.map(a=>`<li><code>${l(a)}</code></li>`).join("")}
    </ul>
  `:`<p>${l(t)}</p>`}function Q(e){return`${(e*100).toFixed(1)}%`}function aa(e){return e<1024?`${e} B`:e<1024**2?`${(e/1024).toFixed(1)} KB`:e<1024**3?`${(e/1024**2).toFixed(1)} MB`:`${(e/1024**3).toFixed(2)} GB`}function ot(e){return e.length===0?"No cards reported yet.":e.map((t,a)=>`GPU ${t.index??t.id??a}: ${t.name}`).join(" | ")}function sa(e){if(e.length===0)return"No tasks currently tracked.";const t=e.filter(a=>a.status&&!["FINISHED","TERMINATED","FAILED"].includes(String(a.status))).length;return`${e.length} tracked, ${t} active`}function na(e){var a;const t=(a=e.detail)==null?void 0:a.trim();return t?`${e.status} - ${t}`:e.status}const F="#/workspace",j=[{id:"overview",label:"Workspace",section:"overview",hash:F,description:"Source migration dashboard and live backend diagnostics."},{id:"about",label:"About",section:"phase1",hash:"#/about",description:"Rebuild branding and release notes in source form."},{id:"settings",label:"Settings",section:"phase1",hash:"#/settings",description:"Read config summary and saved parameter state from the backend."},{id:"tasks",label:"Tasks",section:"phase1",hash:"#/tasks",description:"Inspect and manage task execution state."},{id:"tageditor",label:"Tag Editor",section:"phase1",hash:"#/tageditor",description:"Track startup status and future proxy behavior."},{id:"tensorboard",label:"TensorBoard",section:"phase1",hash:"#/tensorboard",description:"Prepare a cleaner source-side wrapper for TensorBoard access."},{id:"tools",label:"Tools",section:"phase1",hash:"#/tools",description:"Migrate script-launch and utility entry points from the legacy tools page."},{id:"schema-bridge",label:"Schema Bridge",section:"reference",hash:"#/schema-bridge",description:"Evaluate current schema DSL into a source-side explorer and prototype form renderer."},{id:"sdxl-train",label:"SDXL Train",section:"reference",hash:"#/sdxl-train",description:"First source-side training page powered by the schema bridge and current `/api/run` backend."},{id:"flux-train",label:"Flux Train",section:"reference",hash:"#/flux-train",description:"Source-side Flux LoRA training route built on the shared schema bridge and launch pipeline."},{id:"sd3-train",label:"SD3 Train",section:"reference",hash:"#/sd3-train",description:"Source-side SD3 LoRA training route using the same normalized payload workflow."},{id:"sd3-finetune-train",label:"SD3 Finetune",section:"reference",hash:"#/sd3-finetune-train",description:"Source-side SD3 finetune route on the shared training bridge."},{id:"dreambooth-train",label:"Dreambooth",section:"reference",hash:"#/dreambooth-train",description:"Source-side Dreambooth and SDXL full-finetune route on the shared schema bridge."},{id:"flux-finetune-train",label:"Flux Finetune",section:"reference",hash:"#/flux-finetune-train",description:"Source-side Flux full-finetune route using the shared launch workflow."},{id:"sd-controlnet-train",label:"SD ControlNet",section:"reference",hash:"#/sd-controlnet-train",description:"Source-side SD ControlNet training route using the shared launch flow."},{id:"sdxl-controlnet-train",label:"SDXL ControlNet",section:"reference",hash:"#/sdxl-controlnet-train",description:"Source-side SDXL ControlNet training route using the shared launch flow."},{id:"flux-controlnet-train",label:"Flux ControlNet",section:"reference",hash:"#/flux-controlnet-train",description:"Source-side Flux ControlNet training route using the shared launch flow."},{id:"sdxl-lllite-train",label:"SDXL LLLite",section:"reference",hash:"#/sdxl-lllite-train",description:"Source-side SDXL ControlNet-LLLite training route on the shared training bridge."},{id:"sd-ti-train",label:"SD TI",section:"reference",hash:"#/sd-ti-train",description:"Source-side SD textual inversion route on the shared training bridge."},{id:"xti-train",label:"SD XTI",section:"reference",hash:"#/xti-train",description:"Source-side SD XTI textual inversion route on the shared training bridge."},{id:"sdxl-ti-train",label:"SDXL TI",section:"reference",hash:"#/sdxl-ti-train",description:"Source-side SDXL textual inversion route on the shared training bridge."},{id:"anima-train",label:"Anima LoRA",section:"reference",hash:"#/anima-train",description:"Source-side Anima LoRA training route using the shared launch flow."},{id:"anima-finetune-train",label:"Anima Finetune",section:"reference",hash:"#/anima-finetune-train",description:"Source-side Anima finetune route using the shared launch flow."},{id:"lumina-train",label:"Lumina LoRA",section:"reference",hash:"#/lumina-train",description:"Source-side Lumina LoRA training route using the shared launch flow."},{id:"lumina-finetune-train",label:"Lumina Finetune",section:"reference",hash:"#/lumina-finetune-train",description:"Source-side Lumina finetune route using the shared launch flow."},{id:"hunyuan-image-train",label:"Hunyuan Image",section:"reference",hash:"#/hunyuan-image-train",description:"Source-side Hunyuan Image LoRA training route using the shared launch flow."}],lt=new Set(j.map(e=>e.hash)),ct={"/index.html":F,"/index.md":F,"/404.html":F,"/404.md":F,"/task.html":"#/tasks","/task.md":"#/tasks","/tageditor.html":"#/tageditor","/tageditor.md":"#/tageditor","/tagger.html":"#/tageditor","/tagger.md":"#/tageditor","/tensorboard.html":"#/tensorboard","/tensorboard.md":"#/tensorboard","/other/about.html":"#/about","/other/about.md":"#/about","/other/settings.html":"#/settings","/other/settings.md":"#/settings","/dreambooth/index.html":"#/dreambooth-train","/dreambooth/index.md":"#/dreambooth-train","/lora/index.html":"#/sdxl-train","/lora/index.md":"#/sdxl-train"},ia=Object.keys(ct).sort((e,t)=>t.length-e.length);function we(e){const t=e.replace(/\/+$/,"");return t.length>0?`${t}/`:"/"}function ra(e){switch(e){case"flux":return"#/flux-train";case"flux-finetune":return"#/flux-finetune-train";case"sd3":return"#/sd3-train";case"sd3-finetune":return"#/sd3-finetune-train";case"controlnet":return"#/sd-controlnet-train";case"sdxl-controlnet":return"#/sdxl-controlnet-train";case"flux-controlnet":return"#/flux-controlnet-train";case"sdxl-lllite":return"#/sdxl-lllite-train";case"tools":return"#/tools";case"basic":case"master":case"params":case"sdxl":return"#/sdxl-train";case"sdxl-ti":return"#/sdxl-ti-train";case"ti":return"#/sd-ti-train";case"xti":return"#/xti-train";case"anima":return"#/anima-train";case"anima-finetune":return"#/anima-finetune-train";case"hunyuan":return"#/hunyuan-image-train";case"lumina":return"#/lumina-train";case"lumina-finetune":return"#/lumina-finetune-train";default:return null}}function oa(e){const t=e.match(/^(.*)\/lora\/([^/]+)\.(?:html|md)$/i);if(!t)return null;const[,a,n]=t,s=ra(n.toLowerCase());return s?{hash:s,canonicalRootPath:we(a)}:null}function la(e){const t=e.toLowerCase();for(const a of ia)if(t.endsWith(a))return{hash:ct[a],canonicalRootPath:we(e.slice(0,e.length-a.length))};return oa(e)}function Ne(e,t){const a=`${e}${window.location.search}${t}`,n=`${window.location.pathname}${window.location.search}${window.location.hash}`;a!==n&&window.history.replaceState(null,"",a)}function ca(){const e=lt.has(window.location.hash)?window.location.hash:F;return j.find(t=>t.hash===e)??j[0]}function da(){if(lt.has(window.location.hash))return;const e=la(window.location.pathname);if(e){Ne(e.canonicalRootPath,e.hash);return}Ne(we(window.location.pathname||"/"),F)}const he={"sdxl-train":{routeId:"sdxl-train",schemaName:"sdxl-lora",prefix:"sdxl",modelLabel:"SDXL",presetTrainTypes:["sdxl-lora"]},"flux-train":{routeId:"flux-train",schemaName:"flux-lora",prefix:"flux",modelLabel:"Flux",presetTrainTypes:["flux-lora"]},"sd3-train":{routeId:"sd3-train",schemaName:"sd3-lora",prefix:"sd3",modelLabel:"SD3",presetTrainTypes:["sd3-lora"]},"sd3-finetune-train":{routeId:"sd3-finetune-train",schemaName:"sd3-finetune",prefix:"sd3-finetune",modelLabel:"SD3 Finetune",presetTrainTypes:["sd3-finetune"]},"dreambooth-train":{routeId:"dreambooth-train",schemaName:"dreambooth",prefix:"dreambooth",modelLabel:"Dreambooth",presetTrainTypes:["dreambooth","sd-dreambooth","sdxl-finetune"]},"flux-finetune-train":{routeId:"flux-finetune-train",schemaName:"flux-finetune",prefix:"flux-finetune",modelLabel:"Flux Finetune",presetTrainTypes:["flux-finetune"]},"sd-controlnet-train":{routeId:"sd-controlnet-train",schemaName:"sd-controlnet",prefix:"sd-controlnet",modelLabel:"SD ControlNet",presetTrainTypes:["sd-controlnet"]},"sdxl-controlnet-train":{routeId:"sdxl-controlnet-train",schemaName:"sdxl-controlnet",prefix:"sdxl-controlnet",modelLabel:"SDXL ControlNet",presetTrainTypes:["sdxl-controlnet"]},"flux-controlnet-train":{routeId:"flux-controlnet-train",schemaName:"flux-controlnet",prefix:"flux-controlnet",modelLabel:"Flux ControlNet",presetTrainTypes:["flux-controlnet"]},"sdxl-lllite-train":{routeId:"sdxl-lllite-train",schemaName:"sdxl-controlnet-lllite",prefix:"sdxl-lllite",modelLabel:"SDXL LLLite",presetTrainTypes:["sdxl-controlnet-lllite"]},"sd-ti-train":{routeId:"sd-ti-train",schemaName:"sd-textual-inversion",prefix:"sd-ti",modelLabel:"SD Textual Inversion",presetTrainTypes:["sd-textual-inversion"]},"xti-train":{routeId:"xti-train",schemaName:"sd-textual-inversion-xti",prefix:"xti",modelLabel:"SD XTI",presetTrainTypes:["sd-textual-inversion-xti"]},"sdxl-ti-train":{routeId:"sdxl-ti-train",schemaName:"sdxl-textual-inversion",prefix:"sdxl-ti",modelLabel:"SDXL Textual Inversion",presetTrainTypes:["sdxl-textual-inversion"]},"anima-train":{routeId:"anima-train",schemaName:"anima-lora",prefix:"anima",modelLabel:"Anima LoRA",presetTrainTypes:["anima-lora"]},"anima-finetune-train":{routeId:"anima-finetune-train",schemaName:"anima-finetune",prefix:"anima-finetune",modelLabel:"Anima Finetune",presetTrainTypes:["anima-finetune"]},"lumina-train":{routeId:"lumina-train",schemaName:"lumina-lora",prefix:"lumina",modelLabel:"Lumina LoRA",presetTrainTypes:["lumina-lora"]},"lumina-finetune-train":{routeId:"lumina-finetune-train",schemaName:"lumina-finetune",prefix:"lumina-finetune",modelLabel:"Lumina Finetune",presetTrainTypes:["lumina-finetune"]},"hunyuan-image-train":{routeId:"hunyuan-image-train",schemaName:"hunyuan-image-lora",prefix:"hunyuan-image",modelLabel:"Hunyuan Image LoRA",presetTrainTypes:["hunyuan-image-lora"]}};function $e(){return typeof window<"u"?window:null}function Se(e,t){const a=$e();if(!a)return t;try{const n=a.localStorage.getItem(e);return n?JSON.parse(n):t}catch{return t}}function Te(e,t){const a=$e();a&&a.localStorage.setItem(e,JSON.stringify(t))}function dt(e){return`source-training-autosave-${e}`}function ut(e){return`source-training-history-${e}`}function pt(e){return`source-training-recipes-${e}`}function ua(e){return Se(dt(e),null)}function pa(e,t){Te(dt(e),t)}function B(e){return Se(ut(e),[])}function ee(e,t){Te(ut(e),t)}function E(e){return Se(pt(e),[])}function V(e,t){Te(pt(e),t)}function M(e,t,a="text/plain;charset=utf-8"){const n=$e();if(!n)return;const s=new Blob([t],{type:a}),i=URL.createObjectURL(s),o=n.document.createElement("a");o.href=i,o.download=e,o.click(),URL.revokeObjectURL(i)}async function ha(){var c,p,r,d,u,m,f,v;const e=await Promise.allSettled([Et(),tt(),xe(),st(),nt(),_e()]),[t,a,n,s,i,o]=e;if(t.status==="fulfilled"){const k=((c=t.value.data)==null?void 0:c.schemas)??[];h("diag-schemas-title",`${k.length} schema hashes loaded`),h("diag-schemas-detail",k.slice(0,4).map(A=>A.name).join(", ")||"No schema names returned.")}else h("diag-schemas-title","Schema hash request failed"),h("diag-schemas-detail",t.reason instanceof Error?t.reason.message:"Unknown error");if(a.status==="fulfilled"){const k=((p=a.value.data)==null?void 0:p.presets)??[];h("diag-presets-title",`${k.length} presets loaded`),h("diag-presets-detail","Source migration can reuse preset grouping later.")}else h("diag-presets-title","Preset request failed"),h("diag-presets-detail",a.reason instanceof Error?a.reason.message:"Unknown error");if(n.status==="fulfilled"){const k=((r=n.value.data)==null?void 0:r.tasks)??[];h("diag-tasks-title","Task manager reachable"),h("diag-tasks-detail",sa(k))}else h("diag-tasks-title","Task request failed"),h("diag-tasks-detail",n.reason instanceof Error?n.reason.message:"Unknown error");if(s.status==="fulfilled"){const k=((d=s.value.data)==null?void 0:d.cards)??[],A=(u=s.value.data)==null?void 0:u.xformers,D=A?`xformers: ${A.installed?"installed":"missing"}, ${A.supported?"supported":"fallback"}`:"xformers info unavailable";h("diag-gpu-title",`${k.length} GPU entries reachable`),h("diag-gpu-detail",`${ot(k)} | ${D}`)}else h("diag-gpu-title","GPU request failed"),h("diag-gpu-detail",s.reason instanceof Error?s.reason.message:"Unknown error");if(i.status==="fulfilled"?(h("diag-tageditor-title","Tag editor status reachable"),h("diag-tageditor-detail",na(i.value))):(h("diag-tageditor-title","Tag editor status request failed"),h("diag-tageditor-detail",i.reason instanceof Error?i.reason.message:"Unknown error")),o.status==="fulfilled"){const k=((m=o.value.data)==null?void 0:m.schemas)??[];Vt(k),Wt(k),Ce(k,a.status==="fulfilled"?((f=a.value.data)==null?void 0:f.presets)??[]:[])}else g("schema-browser",`<p>${o.reason instanceof Error?o.reason.message:"Schema inventory request failed."}</p>`),Ce([],a.status==="fulfilled"?((v=a.value.data)==null?void 0:v.presets)??[]:[])}function ma(e){return e.includes("controlnet")?"ControlNet":e.includes("textual-inversion")||e.includes("xti")?"Textual Inversion":e.includes("finetune")||e==="dreambooth"?"Finetune":"LoRA"}function ga(e,t){const a=["preflight","prompt workspace","history","recipes"];return e.includes("resume:")&&a.push("resume"),(e.includes("prompt_file")||e.includes("positive_prompts"))&&a.push("sample prompts"),e.includes("validation_split")&&a.push("validation"),e.includes("masked_loss")&&a.push("masked loss"),e.includes("save_state")&&a.push("save state"),e.includes("conditioning_data_dir")&&a.push("conditioning"),t==="Textual Inversion"&&a.push("embeddings"),t==="ControlNet"&&a.push("controlnet"),[...new Set(a)]}function Ce(e,t){const a=new Map(e.map(s=>[s.name,String(s.schema??"")])),n=Object.values(he).map(s=>{const i=j.find(d=>d.id===s.routeId),o=ma(s.schemaName),c=a.get(s.schemaName)??"",p=t.filter(d=>{const m=(d.metadata??{}).train_type;return typeof m!="string"||m.trim().length===0?!1:s.presetTrainTypes.includes(m)}).length,r=E(s.routeId).length;return{routeId:s.routeId,title:(i==null?void 0:i.label)??s.modelLabel,routeHash:(i==null?void 0:i.hash)??"#/workspace",schemaName:s.schemaName,modelLabel:s.modelLabel,family:o,presetCount:p,localRecipeCount:r,schemaAvailable:a.has(s.schemaName),capabilities:ga(c,o)}}).sort((s,i)=>s.family.localeCompare(i.family)||s.title.localeCompare(i.title));Gt(n)}async function fa(){const[e,t]=await Promise.allSettled([Rt(),Pt()]);if(e.status==="fulfilled"){const a=e.value.data;h("settings-summary-title",`${(a==null?void 0:a.saved_param_count)??0} remembered param groups`),g("settings-summary-body",`
        <p><strong>Config file:</strong> <code>${l((a==null?void 0:a.config_path)??"unknown")}</code></p>
        <p><strong>Last path:</strong> <code>${l((a==null?void 0:a.last_path)||"(empty)")}</code></p>
        <p><strong>Saved keys:</strong> ${((a==null?void 0:a.saved_param_keys)??[]).map(n=>`<code>${l(n)}</code>`).join(", ")||"none"}</p>
      `)}else h("settings-summary-title","Config summary request failed"),h("settings-summary-body",e.reason instanceof Error?e.reason.message:"Unknown error");if(t.status==="fulfilled"){const a=t.value.data??{},n=Object.keys(a);h("settings-params-title",`${n.length} saved param entries`),g("settings-params-body",n.length?`<div class="coverage-list">${n.map(s=>`<span class="coverage-pill coverage-pill-muted">${l(s)}</span>`).join("")}</div>`:"<p>No saved params returned.</p>")}else h("settings-params-title","Saved params request failed"),h("settings-params-body",t.reason instanceof Error?t.reason.message:"Unknown error")}const ba="".replace(/\/$/,""),ya=ba||"";function N(e){return/^https?:\/\//.test(e)?e:(e.startsWith("/")||(e=`/${e}`),`${ya}${e}`)}async function va(){try{const e=await nt();h("tag-editor-status-title",`Current status: ${e.status}`),g("tag-editor-status-body",`
        <p>${l(e.detail||"No extra detail returned.")}</p>
        <p><a class="text-link" href="${N("/tageditor.html")}" target="_blank" rel="noreferrer">Open current shipped wrapper page</a></p>
      `)}catch(e){h("tag-editor-status-title","Tag editor status request failed"),h("tag-editor-status-body",e instanceof Error?e.message:"Unknown error")}}async function ka(){var e;xa(),_a(),await wa(),$a(),Sa();try{const a=((e=(await Nt()).data)==null?void 0:e.scripts)??[];h("tools-summary-title",`${a.length} launcher scripts available`),g("tools-summary-body",`
        <p>Categories: ${[...new Set(a.map(n=>n.category))].map(n=>`<code>${l(n)}</code>`).join(", ")}</p>
        <p>The tools workspace now includes dataset analysis, masked-loss alpha inspection, batch auto-tagging, caption cleanup, and caption restore snapshots, with more curated high-frequency flows still planned.</p>
      `),Jt(a)}catch(t){h("tools-summary-title","Script inventory request failed"),h("tools-summary-body",t instanceof Error?t.message:"Unknown error"),g("tools-browser","<p>Tool inventory failed to load.</p>")}}function _a(){const e=La();e&&(e.browseButton.addEventListener("click",async()=>{h("masked-loss-audit-status","Opening folder picker...");try{e.pathInput.value=await O("folder"),h("masked-loss-audit-status","Folder selected. Ready to inspect alpha masks.")}catch(t){h("masked-loss-audit-status",t instanceof Error?t.message:"Folder picker failed.")}}),e.runButton.addEventListener("click",()=>{Be(e)}),e.pathInput.addEventListener("keydown",t=>{t.key==="Enter"&&(t.preventDefault(),Be(e))}))}function xa(){const e=Ta();e&&(e.browseButton.addEventListener("click",async()=>{h("dataset-analysis-status","Opening folder picker...");try{e.pathInput.value=await O("folder"),h("dataset-analysis-status","Folder selected. Ready to analyze.")}catch(t){h("dataset-analysis-status",t instanceof Error?t.message:"Folder picker failed.")}}),e.runButton.addEventListener("click",()=>{De(e)}),e.pathInput.addEventListener("keydown",t=>{t.key==="Enter"&&(t.preventDefault(),De(e))}))}async function wa(){var t;const e=Ia();if(e){e.browseButton.addEventListener("click",async()=>{h("batch-tagger-status","Opening folder picker...");try{e.pathInput.value=await O("folder"),h("batch-tagger-status","Folder selected. Ready to launch batch tagging.")}catch(a){h("batch-tagger-status",a instanceof Error?a.message:"Folder picker failed.")}}),e.runButton.addEventListener("click",()=>{qe(e)}),e.pathInput.addEventListener("keydown",a=>{a.key==="Enter"&&(a.preventDefault(),qe(e))});try{const a=await Bt(),n=((t=a.data)==null?void 0:t.interrogators)??[];if(!n.length)throw new Error("No interrogator models returned.");e.modelSelect.innerHTML=n.map(s=>{var c;const i=s.is_default||s.name===((c=a.data)==null?void 0:c.default)?" selected":"",o=s.kind==="cl"?"CL":"WD";return`<option value="${l(s.name)}"${i}>${l(s.name)} (${o})</option>`}).join(""),h("batch-tagger-status",`Loaded ${n.length} interrogator models.`)}catch(a){e.modelSelect.innerHTML='<option value="wd14-convnextv2-v2">wd14-convnextv2-v2 (WD)</option>',h("batch-tagger-status",a instanceof Error?a.message:"Failed to load interrogator inventory."),g("batch-tagger-results",`<article class="dataset-analysis-block dataset-analysis-warning"><p>${l(a instanceof Error?a.message:"Failed to load interrogator inventory.")}</p></article>`)}}}function $a(){const e=Aa();e&&(e.browseButton.addEventListener("click",async()=>{h("caption-cleanup-status","Opening folder picker...");try{e.pathInput.value=await O("folder"),h("caption-cleanup-status","Folder selected. Ready to preview cleanup.")}catch(t){h("caption-cleanup-status",t instanceof Error?t.message:"Folder picker failed.")}}),e.previewButton.addEventListener("click",()=>{le(e,"preview")}),e.applyButton.addEventListener("click",()=>{le(e,"apply")}),e.pathInput.addEventListener("keydown",t=>{t.key==="Enter"&&(t.preventDefault(),le(e,"preview"))}))}function Sa(){const e=Ea();e&&(e.browseButton.addEventListener("click",async()=>{h("caption-backup-status","Opening folder picker...");try{e.pathInput.value=await O("folder"),h("caption-backup-status","Folder selected. Refreshing snapshots..."),await W(e)}catch(t){h("caption-backup-status",t instanceof Error?t.message:"Folder picker failed.")}}),e.refreshButton.addEventListener("click",()=>{W(e)}),e.createButton.addEventListener("click",()=>{Pa(e)}),e.restoreButton.addEventListener("click",()=>{Ra(e)}),e.selectInput.addEventListener("change",()=>{W(e,e.selectInput.value||null)}))}function Ta(){const e=document.querySelector("#dataset-analysis-path"),t=document.querySelector("#dataset-analysis-caption-extension"),a=document.querySelector("#dataset-analysis-top-tags"),n=document.querySelector("#dataset-analysis-sample-limit"),s=document.querySelector("#dataset-analysis-pick"),i=document.querySelector("#dataset-analysis-run");return!e||!t||!a||!n||!s||!i?null:{pathInput:e,captionExtensionInput:t,topTagsInput:a,sampleLimitInput:n,browseButton:s,runButton:i}}function La(){const e=document.querySelector("#masked-loss-audit-path"),t=document.querySelector("#masked-loss-audit-sample-limit"),a=document.querySelector("#masked-loss-audit-recursive"),n=document.querySelector("#masked-loss-audit-pick"),s=document.querySelector("#masked-loss-audit-run");return!e||!t||!a||!n||!s?null:{pathInput:e,sampleLimitInput:t,recursiveInput:a,browseButton:n,runButton:s}}function Ia(){const e=document.querySelector("#batch-tagger-path"),t=document.querySelector("#batch-tagger-model"),a=document.querySelector("#batch-tagger-threshold"),n=document.querySelector("#batch-tagger-character-threshold"),s=document.querySelector("#batch-tagger-conflict"),i=document.querySelector("#batch-tagger-additional-tags"),o=document.querySelector("#batch-tagger-backup-name"),c=document.querySelector("#batch-tagger-exclude-tags"),p=document.querySelector("#batch-tagger-recursive"),r=document.querySelector("#batch-tagger-replace-underscore"),d=document.querySelector("#batch-tagger-escape-tag"),u=document.querySelector("#batch-tagger-add-rating-tag"),m=document.querySelector("#batch-tagger-add-model-tag"),f=document.querySelector("#batch-tagger-auto-backup"),v=document.querySelector("#batch-tagger-pick"),k=document.querySelector("#batch-tagger-run");return!e||!t||!a||!n||!s||!i||!o||!c||!p||!r||!d||!u||!m||!f||!v||!k?null:{pathInput:e,modelSelect:t,thresholdInput:a,characterThresholdInput:n,conflictSelect:s,additionalTagsInput:i,backupNameInput:o,excludeTagsInput:c,recursiveInput:p,replaceUnderscoreInput:r,escapeTagInput:d,addRatingTagInput:u,addModelTagInput:m,autoBackupInput:f,browseButton:v,runButton:k}}function Aa(){const e=document.querySelector("#caption-cleanup-path"),t=document.querySelector("#caption-cleanup-extension"),a=document.querySelector("#caption-cleanup-remove-tags"),n=document.querySelector("#caption-cleanup-prepend-tags"),s=document.querySelector("#caption-cleanup-append-tags"),i=document.querySelector("#caption-cleanup-search-text"),o=document.querySelector("#caption-cleanup-replace-text"),c=document.querySelector("#caption-cleanup-backup-name"),p=document.querySelector("#caption-cleanup-sample-limit"),r=document.querySelector("#caption-cleanup-recursive"),d=document.querySelector("#caption-cleanup-collapse-whitespace"),u=document.querySelector("#caption-cleanup-replace-underscore"),m=document.querySelector("#caption-cleanup-dedupe-tags"),f=document.querySelector("#caption-cleanup-sort-tags"),v=document.querySelector("#caption-cleanup-use-regex"),k=document.querySelector("#caption-cleanup-auto-backup"),A=document.querySelector("#caption-cleanup-pick"),D=document.querySelector("#caption-cleanup-preview"),X=document.querySelector("#caption-cleanup-apply");return!e||!t||!a||!n||!s||!i||!o||!c||!p||!r||!d||!u||!m||!f||!v||!k||!A||!D||!X?null:{pathInput:e,extensionInput:t,removeTagsInput:a,prependTagsInput:n,appendTagsInput:s,searchTextInput:i,replaceTextInput:o,backupNameInput:c,sampleLimitInput:p,recursiveInput:r,collapseWhitespaceInput:d,replaceUnderscoreInput:u,dedupeTagsInput:m,sortTagsInput:f,useRegexInput:v,autoBackupInput:k,browseButton:A,previewButton:D,applyButton:X}}function Ea(){const e=document.querySelector("#caption-backup-path"),t=document.querySelector("#caption-backup-extension"),a=document.querySelector("#caption-backup-name"),n=document.querySelector("#caption-backup-select"),s=document.querySelector("#caption-backup-recursive"),i=document.querySelector("#caption-backup-pre-restore"),o=document.querySelector("#caption-backup-pick"),c=document.querySelector("#caption-backup-create"),p=document.querySelector("#caption-backup-refresh"),r=document.querySelector("#caption-backup-restore");return!e||!t||!a||!n||!s||!i||!o||!c||!p||!r?null:{pathInput:e,extensionInput:t,nameInput:a,selectInput:n,recursiveInput:s,preRestoreInput:i,browseButton:o,createButton:c,refreshButton:p,restoreButton:r}}async function De(e){const t=e.pathInput.value.trim();if(!t){h("dataset-analysis-status","Pick a dataset folder first."),g("dataset-analysis-results",'<p class="dataset-analysis-empty">No folder selected yet.</p>');return}e.browseButton.disabled=!0,e.runButton.disabled=!0,h("dataset-analysis-status","Analyzing dataset..."),g("dataset-analysis-results",'<p class="dataset-analysis-empty">Scanning images, captions, and tags...</p>');try{const a=await Ct({path:t,caption_extension:e.captionExtensionInput.value.trim()||".txt",top_tags:te(e.topTagsInput.value,40),sample_limit:te(e.sampleLimitInput.value,8)});if(a.status!=="success"||!a.data)throw new Error(a.message||"Dataset analysis returned no data.");h("dataset-analysis-status",`Scanned ${a.data.summary.image_count} images across ${a.data.summary.dataset_folder_count} dataset folder(s).`),Yt(a.data)}catch(a){h("dataset-analysis-status",a instanceof Error?a.message:"Dataset analysis failed."),g("dataset-analysis-results",`<article class="dataset-analysis-block dataset-analysis-warning"><p>${l(a instanceof Error?a.message:"Dataset analysis failed.")}</p></article>`)}finally{e.browseButton.disabled=!1,e.runButton.disabled=!1}}async function Be(e){const t=e.pathInput.value.trim();if(!t){h("masked-loss-audit-status","Pick a dataset folder first."),g("masked-loss-audit-results",'<p class="dataset-analysis-empty">No dataset folder selected yet.</p>');return}e.browseButton.disabled=!0,e.runButton.disabled=!0,h("masked-loss-audit-status","Inspecting alpha-channel masks..."),g("masked-loss-audit-results",'<p class="dataset-analysis-empty">Opening images and checking their alpha channels...</p>');try{const a=await Dt({path:t,recursive:e.recursiveInput.checked,sample_limit:te(e.sampleLimitInput.value,8)});if(a.status!=="success"||!a.data)throw new Error(a.message||"Masked-loss audit returned no data.");h("masked-loss-audit-status",`Inspected ${a.data.summary.image_count} images. Found ${a.data.summary.usable_mask_image_count} image(s) with usable alpha masks.`),Zt(a.data)}catch(a){h("masked-loss-audit-status",a instanceof Error?a.message:"Masked-loss audit failed."),g("masked-loss-audit-results",`<article class="dataset-analysis-block dataset-analysis-warning"><p>${l(a instanceof Error?a.message:"Masked-loss audit failed.")}</p></article>`)}finally{e.browseButton.disabled=!1,e.runButton.disabled=!1}}async function qe(e){var a,n,s;const t=e.pathInput.value.trim();if(!t){h("batch-tagger-status","Pick an image folder first."),g("batch-tagger-results",'<p class="dataset-analysis-empty">No image folder selected yet.</p>');return}e.browseButton.disabled=!0,e.runButton.disabled=!0,h("batch-tagger-status","Starting batch tagging..."),g("batch-tagger-results",'<p class="dataset-analysis-empty">Submitting interrogator job to the backend...</p>');try{const i=Fe(e.thresholdInput.value,.35,0,1),o=Fe(e.characterThresholdInput.value,.6,0,1),c=await qt({path:t,interrogator_model:e.modelSelect.value,threshold:i,character_threshold:o,batch_output_action_on_conflict:e.conflictSelect.value,create_backup_before_write:e.autoBackupInput.checked,backup_snapshot_name:e.backupNameInput.value.trim(),additional_tags:e.additionalTagsInput.value.trim(),exclude_tags:e.excludeTagsInput.value.trim(),batch_input_recursive:e.recursiveInput.checked,replace_underscore:e.replaceUnderscoreInput.checked,escape_tag:e.escapeTagInput.checked,add_rating_tag:e.addRatingTagInput.checked,add_model_tag:e.addModelTagInput.checked});if(c.status!=="success")throw new Error(c.message||"Batch tagging failed to start.");h("batch-tagger-status",c.message||"Batch tagging started."),g("batch-tagger-results",`
        <article class="dataset-analysis-block">
          <p class="panel-kicker">launched</p>
          <h3>Batch tagger job submitted</h3>
          <p><code>${l(t)}</code></p>
          <p>Model: <code>${l(e.modelSelect.value)}</code></p>
          <p>
            Threshold: <strong>${l(String(i))}</strong>
            · Character threshold: <strong>${l(String(o))}</strong>
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
      `)}catch(i){h("batch-tagger-status",i instanceof Error?i.message:"Batch tagging failed."),g("batch-tagger-results",`<article class="dataset-analysis-block dataset-analysis-warning"><p>${l(i instanceof Error?i.message:"Batch tagging failed.")}</p></article>`)}finally{e.browseButton.disabled=!1,e.runButton.disabled=!1}}async function le(e,t){const a=e.pathInput.value.trim();if(!a){h("caption-cleanup-status","Pick a caption folder first."),g("caption-cleanup-results",'<p class="dataset-analysis-empty">No caption folder selected yet.</p>');return}const n={path:a,caption_extension:e.extensionInput.value.trim()||".txt",recursive:e.recursiveInput.checked,collapse_whitespace:e.collapseWhitespaceInput.checked,replace_underscore:e.replaceUnderscoreInput.checked,dedupe_tags:e.dedupeTagsInput.checked,sort_tags:e.sortTagsInput.checked,remove_tags:e.removeTagsInput.value.trim(),prepend_tags:e.prependTagsInput.value.trim(),append_tags:e.appendTagsInput.value.trim(),search_text:e.searchTextInput.value,replace_text:e.replaceTextInput.value,use_regex:e.useRegexInput.checked,create_backup_before_apply:e.autoBackupInput.checked,backup_snapshot_name:e.backupNameInput.value.trim(),sample_limit:te(e.sampleLimitInput.value,8)};e.browseButton.disabled=!0,e.previewButton.disabled=!0,e.applyButton.disabled=!0,h("caption-cleanup-status",t==="preview"?"Previewing caption cleanup...":"Applying caption cleanup..."),g("caption-cleanup-results",`<p class="dataset-analysis-empty">${t==="preview"?"Scanning caption files and building sample diffs...":"Writing cleaned captions back to disk..."}</p>`);try{const s=t==="preview"?await Ft(n):await jt(n);if(s.status!=="success"||!s.data)throw new Error(s.message||`Caption cleanup ${t} failed.`);h("caption-cleanup-status",s.message||(t==="preview"?`Previewed ${s.data.summary.changed_file_count} caption file changes.`:`Applied cleanup to ${s.data.summary.changed_file_count} caption files.`)),Qt(s.data)}catch(s){h("caption-cleanup-status",s instanceof Error?s.message:"Caption cleanup failed."),g("caption-cleanup-results",`<article class="dataset-analysis-block dataset-analysis-warning"><p>${l(s instanceof Error?s.message:"Caption cleanup failed.")}</p></article>`)}finally{e.browseButton.disabled=!1,e.previewButton.disabled=!1,e.applyButton.disabled=!1}}async function W(e,t,a=!0){var s,i;const n=e.pathInput.value.trim();if(!n){h("caption-backup-status","Pick a caption folder first."),g("caption-backup-results",'<p class="dataset-analysis-empty">No caption folder selected yet.</p>'),e.selectInput.innerHTML='<option value="">Refresh snapshots for this folder</option>';return}e.browseButton.disabled=!0,e.createButton.disabled=!0,e.refreshButton.disabled=!0,e.restoreButton.disabled=!0,h("caption-backup-status","Loading caption snapshots...");try{const c=((s=(await Ht({path:n})).data)==null?void 0:s.backups)??[],p=e.selectInput.value||(((i=c[0])==null?void 0:i.archive_name)??""),r=t??p;e.selectInput.innerHTML=c.length?c.map(d=>{const u=d.archive_name===r?" selected":"";return`<option value="${l(d.archive_name)}"${u}>${l(d.snapshot_name)} · ${l(d.archive_name)}</option>`}).join(""):'<option value="">No snapshots for this folder yet</option>',c.length&&r&&(e.selectInput.value=r),h("caption-backup-status",c.length?`Loaded ${c.length} caption snapshots.`:"No caption snapshots found for this folder."),a&&ea(c,c.length?r:null)}catch(o){h("caption-backup-status",o instanceof Error?o.message:"Failed to load caption snapshots."),g("caption-backup-results",`<article class="dataset-analysis-block dataset-analysis-warning"><p>${l(o instanceof Error?o.message:"Failed to load caption snapshots.")}</p></article>`)}finally{e.browseButton.disabled=!1,e.createButton.disabled=!1,e.refreshButton.disabled=!1,e.restoreButton.disabled=!1}}async function Pa(e){const t=e.pathInput.value.trim();if(!t){h("caption-backup-status","Pick a caption folder first."),g("caption-backup-results",'<p class="dataset-analysis-empty">No caption folder selected yet.</p>');return}e.browseButton.disabled=!0,e.createButton.disabled=!0,e.refreshButton.disabled=!0,e.restoreButton.disabled=!0,h("caption-backup-status","Creating caption snapshot...");try{const a=await Ot({path:t,caption_extension:e.extensionInput.value.trim()||".txt",recursive:e.recursiveInput.checked,snapshot_name:e.nameInput.value.trim()});if(a.status!=="success"||!a.data)throw new Error(a.message||"Caption snapshot creation failed.");h("caption-backup-status",a.message||`Created ${a.data.archive_name}`),e.nameInput.value="",await W(e,a.data.archive_name)}catch(a){h("caption-backup-status",a instanceof Error?a.message:"Caption snapshot creation failed."),g("caption-backup-results",`<article class="dataset-analysis-block dataset-analysis-warning"><p>${l(a instanceof Error?a.message:"Caption snapshot creation failed.")}</p></article>`)}finally{e.browseButton.disabled=!1,e.createButton.disabled=!1,e.refreshButton.disabled=!1,e.restoreButton.disabled=!1}}async function Ra(e){const t=e.pathInput.value.trim(),a=e.selectInput.value;if(!t){h("caption-backup-status","Pick a caption folder first."),g("caption-backup-results",'<p class="dataset-analysis-empty">No caption folder selected yet.</p>');return}if(!a){h("caption-backup-status","Select a snapshot to restore.");return}if(window.confirm(`Restore caption snapshot ${a} into this folder?

This overwrites matching caption files from the snapshot.`)){e.browseButton.disabled=!0,e.createButton.disabled=!0,e.refreshButton.disabled=!0,e.restoreButton.disabled=!0,h("caption-backup-status","Restoring caption snapshot..."),g("caption-backup-results",'<p class="dataset-analysis-empty">Writing snapshot files back to the folder...</p>');try{const s=await zt({path:t,archive_name:a,make_restore_backup:e.preRestoreInput.checked});if(s.status!=="success"||!s.data)throw new Error(s.message||"Caption snapshot restore failed.");h("caption-backup-status",s.message||`Restored ${s.data.restored_file_count} caption files.`),ta(s.data),await W(e,a,!1)}catch(s){h("caption-backup-status",s instanceof Error?s.message:"Caption snapshot restore failed."),g("caption-backup-results",`<article class="dataset-analysis-block dataset-analysis-warning"><p>${l(s instanceof Error?s.message:"Caption snapshot restore failed.")}</p></article>`)}finally{e.browseButton.disabled=!1,e.createButton.disabled=!1,e.refreshButton.disabled=!1,e.restoreButton.disabled=!1}}}function te(e,t){const a=Number.parseInt(e,10);return Number.isNaN(a)||a<1?t:a}function Fe(e,t,a,n){const s=Number.parseFloat(e);return Number.isNaN(s)?t:Math.min(Math.max(s,a),n)}async function me(){var e;try{const t=await xe();Kt(((e=t.data)==null?void 0:e.tasks)??[]),document.querySelectorAll("[data-task-terminate]").forEach(a=>{a.addEventListener("click",async()=>{const n=a.dataset.taskTerminate;if(n){a.setAttribute("disabled","true");try{await at(n)}finally{await me()}}})})}catch(t){g("task-table-container",`<p>${t instanceof Error?l(t.message):"Task request failed."}</p>`)}}async function Na(){const e=document.querySelector("#refresh-tasks");e==null||e.addEventListener("click",()=>{me()}),await me()}class x{constructor(t){$(this,"kind");$(this,"descriptionText");$(this,"defaultValue");$(this,"roleName");$(this,"roleConfig");$(this,"minValue");$(this,"maxValue");$(this,"stepValue");$(this,"disabledFlag",!1);$(this,"requiredFlag",!1);$(this,"literalValue");$(this,"options",[]);$(this,"fields",{});$(this,"itemType");this.kind=t}description(t){return this.descriptionText=t,this}default(t){return this.defaultValue=t,this}role(t,a){return this.roleName=typeof t=="string"?t:"custom",this.roleConfig=a??t,this}min(t){return this.minValue=t,this}max(t){return this.maxValue=t,this}step(t){return this.stepValue=t,this}required(){return this.requiredFlag=!0,this}disabled(){return this.disabledFlag=!0,this}}function z(e){if(e instanceof x)return e;if(e===String)return new x("string");if(e===Number)return new x("number");if(e===Boolean)return new x("boolean");if(typeof e=="string"||typeof e=="number"||typeof e=="boolean"){const t=new x("const");return t.literalValue=e,t.defaultValue=e,t}if(Array.isArray(e)){const t=new x("union");return t.options=e.map(a=>z(a)),t}if(e&&typeof e=="object"){const t=new x("object");return t.fields=Object.fromEntries(Object.entries(e).map(([a,n])=>[a,z(n)])),t}return new x("string")}function Ca(){return{string(){return new x("string")},number(){return new x("number")},boolean(){return new x("boolean")},const(e){const t=new x("const");return t.literalValue=e,t.defaultValue=e,t},union(e){const t=new x("union");return t.options=e.map(a=>z(a)),t},intersect(e){const t=new x("intersect");return t.options=e.map(a=>z(a)),t},object(e){const t=new x("object");return t.fields=Object.fromEntries(Object.entries(e).map(([a,n])=>[a,z(n)])),t},array(e){const t=new x("array");return t.itemType=z(e),t}}}function Da(e,t,a){const n={...e,...t};for(const s of a??[])delete n[s];return n}function je(e,t){const a=Ca();return new Function("Schema","UpdateSchema","SHARED_SCHEMAS","String","Number","Boolean","source",'"use strict"; return eval(source);')(a,Da,t??{},String,Number,Boolean,e)}function ht(e){const t=e.find(s=>s.name==="shared"),n=(t?je(t.schema,null):{})||{};return e.map(s=>({name:s.name,hash:s.hash,source:s.schema,runtime:s.name==="shared"?n:je(s.schema,n)}))}function Oe(e,t=""){return Object.entries(e).map(([a,n])=>({name:a,path:t?`${t}.${a}`:a,schema:n})).filter(a=>a.schema.kind!=="const"||!a.schema.requiredFlag)}function He(e){return Object.entries(e).filter(([,t])=>t.kind==="const"&&t.requiredFlag).map(([t,a])=>`${t} = ${String(a.literalValue)}`)}function ze(e){return Object.fromEntries(Object.entries(e).filter(([,t])=>t.kind==="const"&&t.requiredFlag).map(([t,a])=>[t,a.literalValue]))}function ge(e,t,a){if(e.kind==="intersect"){e.options.forEach((n,s)=>ge(n,`${t}-i${s}`,a));return}if(e.kind==="object"){const n=Oe(e.fields);n.length>0&&a.push({id:t,title:e.descriptionText||"Unnamed section",fields:n,conditions:He(e.fields),constants:ze(e.fields)});return}e.kind==="union"&&e.options.forEach((n,s)=>{if(n.kind==="object"){const i=Oe(n.fields);i.length>0&&a.push({id:`${t}-u${s}`,title:n.descriptionText||e.descriptionText||`Conditional branch ${s+1}`,fields:i,conditional:!0,conditions:He(n.fields),constants:ze(n.fields)})}else ge(n,`${t}-u${s}`,a)})}function Ba(e){const t=[];return ge(e,"section",t),t}function qa(e){const t={};for(const a of e){a.conditional||Object.assign(t,a.constants);for(const n of a.fields)n.schema.defaultValue!==void 0?t[n.path]=n.schema.defaultValue:n.schema.kind==="boolean"?t[n.path]=!1:t[n.path]=""}return t}function mt(e,t){return e.conditional?Object.entries(e.constants).every(([a,n])=>t[a]===n):!0}function Fa(e,t){const a={...t};for(const n of e){if(mt(n,t)){Object.assign(a,n.constants);continue}for(const s of n.fields)delete a[s.path]}return a}function Le(e){return`field-${e.replaceAll(/[^a-zA-Z0-9_-]/g,"-")}`}function ja(e){if(e.kind!=="union")return null;const t=e.options.filter(a=>a.kind==="const").map(a=>a.literalValue).filter(a=>typeof a=="string"||typeof a=="number"||typeof a=="boolean");return t.length!==e.options.length?null:t}function Oa(e,t){if(!e.roleConfig||typeof e.roleConfig!="object"||Array.isArray(e.roleConfig))return;const a=e.roleConfig[t];return typeof a=="string"?a:void 0}function fe(e){return Array.isArray(e)?e.map(t=>String(t??"")):typeof e=="string"&&e.length>0?e.split(/\r?\n/):[]}function Ha(e,t,a){const n=fe(t),s=n.length>0?n:[""],i=Le(e.path);return`
    <div class="table-editor" data-table-path="${l(e.path)}">
      <div class="table-editor-rows">
        ${s.map((o,c)=>`
              <div class="table-editor-row">
                <input
                  id="${c===0?i:`${i}-${c}`}"
                  class="field-input"
                  data-field-path="${l(e.path)}"
                  data-field-kind="table-row"
                  data-field-index="${c}"
                  type="text"
                  value="${l(o)}"
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
  `}function za(e,t){const a=e.schema,n=Le(e.path),s=l(e.path),i=ja(a),o=a.disabledFlag?"disabled":"",c=a.roleName||"";if(a.kind==="boolean")return`
      <label class="checkbox-row" for="${n}">
        <input id="${n}" data-field-path="${s}" data-field-kind="boolean" type="checkbox" ${t?"checked":""} ${o} />
        <span>${a.defaultValue===!0?"default on":"toggle"}</span>
      </label>
    `;if(a.kind==="array"){if(c==="table")return Ha(e,t,o);const p=Array.isArray(t)?t.join(`
`):"";return`<textarea id="${n}" class="field-input field-textarea" data-field-path="${s}" data-field-kind="array" ${o}>${l(p)}</textarea>`}if(i){const p=i.map(r=>`<option value="${l(r)}" ${String(r)===String(t)?"selected":""}>${l(r)}</option>`).join("");return`<select id="${n}" class="field-input" data-field-path="${s}" data-field-kind="enum" ${o}>${p}</select>`}if(a.kind==="number"){const p=a.minValue!==void 0?`min="${a.minValue}"`:"",r=a.maxValue!==void 0?`max="${a.maxValue}"`:"",d=a.stepValue!==void 0?`step="${a.stepValue}"`:'step="any"';if(c==="slider"&&a.minValue!==void 0&&a.maxValue!==void 0){const u=t===""||t===void 0||t===null?a.defaultValue??a.minValue:t;return`
        <div class="slider-editor">
          <input
            class="field-slider"
            data-field-path="${s}"
            data-field-kind="number"
            data-slider-role="range"
            type="range"
            value="${l(u)}"
            ${p}
            ${r}
            ${d}
            ${o}
          />
          <div class="slider-editor-footer">
            <input
              id="${n}"
              class="field-input slider-number-input"
              data-field-path="${s}"
              data-field-kind="number"
              data-slider-role="number"
              type="number"
              value="${l(u)}"
              ${p}
              ${r}
              ${d}
              ${o}
            />
            <span class="slider-value" data-slider-value-for="${s}">${l(u)}</span>
          </div>
        </div>
      `}return`<input id="${n}" class="field-input" data-field-path="${s}" data-field-kind="number" type="number" value="${l(t)}" ${p} ${r} ${d} ${o} />`}if(c==="textarea")return`<textarea id="${n}" class="field-input field-textarea" data-field-path="${s}" data-field-kind="string" ${o}>${l(t)}</textarea>`;if(c==="filepicker"){const p=Oa(a,"type")??(e.path.endsWith("_dir")||e.path==="resume"?"folder":"model-file");return`
      <div class="picker-control">
        <div class="picker-row">
          <input
            id="${n}"
            class="field-input"
            data-field-path="${s}"
            data-field-kind="string"
            type="text"
            value="${l(t)}"
            ${o}
          />
          <button
            class="action-button action-button-ghost picker-button"
            data-picker-path="${s}"
            data-picker-type="${l(p)}"
            type="button"
            ${o}
          >
            Browse
          </button>
        </div>
        <p class="picker-status" data-picker-status-for="${s}">
          Uses the backend native ${p==="folder"?"folder":"file"} picker.
        </p>
      </div>
    `}return a.kind==="const"?`<div class="field-readonly"><code>${l(a.literalValue??t)}</code></div>`:`<input id="${n}" class="field-input" data-field-path="${s}" data-field-kind="string" type="text" value="${l(t)}" ${o} />`}function Ma(e,t){const a=e.schema,n=[`<span class="mini-badge">${l(a.kind)}</span>`,a.roleName?`<span class="mini-badge mini-badge-muted">${l(a.roleName)}</span>`:"",a.requiredFlag?'<span class="mini-badge mini-badge-accent">required</span>':"",a.disabledFlag?'<span class="mini-badge mini-badge-muted">disabled</span>':""].filter(Boolean).join(""),s=[a.minValue!==void 0?`min ${a.minValue}`:"",a.maxValue!==void 0?`max ${a.maxValue}`:"",a.stepValue!==void 0?`step ${a.stepValue}`:""].filter(Boolean).join(" · ");return`
    <article class="field-card">
      <div class="field-card-head">
        <div>
          <label class="field-label" for="${Le(e.path)}">${l(e.name)}</label>
          <p class="field-path">${l(e.path)}</p>
        </div>
        <div class="mini-badge-row">${n}</div>
      </div>
      <p class="field-description">${l(a.descriptionText||"No description")}</p>
      ${za(e,t)}
      <div class="field-meta">
        <span><strong>Default:</strong> ${l(a.defaultValue??"(none)")}</span>
        ${s?`<span><strong>Constraints:</strong> ${l(s)}</span>`:""}
      </div>
    </article>
  `}function gt(e){return e.sections.filter(t=>mt(t,e.values))}function ft(e){return Fa(e.sections,e.values)}function Ua(e,t){const a=gt(e);if(a.length===0){g(t,"<p>No renderable sections extracted from this schema.</p>");return}const n=a.map(s=>{const i=s.fields.map(c=>Ma(c,e.values[c.path])).join(""),o=s.conditions.length?`<div class="condition-list">${s.conditions.map(c=>`<span class="coverage-pill coverage-pill-muted">${l(c)}</span>`).join("")}</div>`:"";return`
        <article class="panel schema-section-card">
          <div class="schema-section-head">
            <div>
              <p class="panel-kicker">${s.conditional?"conditional section":"section"}</p>
              <h3>${l(s.title)}</h3>
            </div>
            <span class="coverage-pill">${s.fields.length} fields</span>
          </div>
          ${o}
          <div class="field-grid">
            ${i}
          </div>
        </article>
      `}).join("");g(t,n)}function be(e,t){const a=Object.fromEntries(Object.entries(ft(e)).sort(([n],[s])=>n.localeCompare(s)));U(t,JSON.stringify(a,null,2))}function re(e){return e.filter(t=>t.name!=="shared"&&t.runtime instanceof x)}function Me(e,t){const a=e.schema;if(a.kind==="boolean")return!!t;if(a.kind==="number"){const n=String(t).trim();if(n==="")return"";const s=Number(n);return Number.isNaN(s)?"":s}return a.kind==="array"?String(t).split(/\r?\n/).map(n=>n.trim()).filter(Boolean):t}function Ue(e,t){return e.sections.flatMap(a=>a.fields).find(a=>a.path===t)}function Xa(e,t){return[...e.querySelectorAll('[data-field-kind="table-row"]')].filter(a=>a.dataset.fieldPath===t).map(a=>a.value.trim()).filter(Boolean)}function Xe(e,t,a,n){const s=String(a??"");e.querySelectorAll("[data-field-path]").forEach(i=>{if(!(i===n||i.dataset.fieldPath!==t||i.dataset.fieldKind==="table-row")){if(i instanceof HTMLInputElement&&i.type==="checkbox"){i.checked=!!a;return}i.value=s}}),e.querySelectorAll("[data-slider-value-for]").forEach(i=>{i.dataset.sliderValueFor===t&&(i.textContent=s)})}function ce(e,t,a,n="idle"){e.querySelectorAll("[data-picker-status-for]").forEach(s=>{s.dataset.pickerStatusFor===t&&(s.textContent=a,s.classList.remove("is-success","is-error"),n==="success"?s.classList.add("is-success"):n==="error"&&s.classList.add("is-error"))})}function Va(e,t,a,n){const s=document.querySelector(`#${t.sectionsId}`);if(!s)return;const i=new Set(e.sections.flatMap(o=>o.conditional?Object.keys(o.constants):[]));s.querySelectorAll("[data-field-path]").forEach(o=>{const c=o.dataset.fieldKind,p=o instanceof HTMLInputElement&&o.type==="checkbox"||o instanceof HTMLSelectElement?"change":"input";o.addEventListener(p,()=>{const r=o.dataset.fieldPath;if(!r)return;const d=Ue(e,r);if(d){if(c==="table-row")e.values[r]=Xa(s,r);else{const u=o instanceof HTMLInputElement&&o.type==="checkbox"?o.checked:o.value;e.values[r]=Me(d,u),Xe(s,r,e.values[r],o)}if(i.has(r)){n({...e,values:{...e.values}});return}be(e,t.previewId),a(e)}})}),s.querySelectorAll("[data-table-add]").forEach(o=>{o.addEventListener("click",()=>{const c=o.dataset.tableAdd;c&&(e.values[c]=[...fe(e.values[c]),""],n({...e,values:{...e.values}}))})}),s.querySelectorAll("[data-table-remove]").forEach(o=>{o.addEventListener("click",()=>{const c=o.dataset.tableRemove,p=Number(o.dataset.tableIndex??"-1");if(!c||p<0)return;const r=fe(e.values[c]).filter((d,u)=>u!==p);e.values[c]=r,n({...e,values:{...e.values}})})}),s.querySelectorAll("[data-picker-path]").forEach(o=>{o.addEventListener("click",async()=>{const c=o.dataset.pickerPath,p=o.dataset.pickerType||"model-file";if(!c)return;const r=Ue(e,c);if(r){o.setAttribute("disabled","true"),ce(s,c,"Waiting for native picker...","idle");try{const d=await O(p);if(e.values[c]=Me(r,d),Xe(s,c,e.values[c]),ce(s,c,d,"success"),i.has(c)){n({...e,values:{...e.values}});return}be(e,t.previewId),a(e)}catch(d){ce(s,c,d instanceof Error?d.message:"The picker failed to return a value.","error")}finally{o.removeAttribute("disabled")}}})})}function ae(e,t){const a=re(e).find(s=>s.name===t);if(!a||!(a.runtime instanceof x))return null;const n=Ba(a.runtime);return{catalog:e,selectedName:t,sections:n,values:qa(n)}}function G(e,t,a,n){if(a(e),!e){h(t.summaryId,"Failed to build schema bridge state."),g(t.sectionsId,"<p>Schema bridge failed to initialize.</p>"),U(t.previewId,"{}");return}const i=re(e.catalog).map(r=>`<option value="${l(r.name)}" ${r.name===e.selectedName?"selected":""}>${l(r.name)}</option>`).join(""),o=gt(e);g(t.selectId,i),h(t.summaryId,`${e.selectedName} · ${o.length}/${e.sections.length} visible sections · ${o.reduce((r,d)=>r+d.fields.length,0)} visible fields`),Ua(e,t.sectionsId),be(e,t.previewId);const c=document.querySelector(`#${t.selectId}`);c&&(c.onchange=()=>{const r=ae(e.catalog,c.value);G(r,t,a,n)});const p=document.querySelector(`#${t.resetId}`);p&&(p.onclick=()=>{G(ae(e.catalog,e.selectedName),t,a,n)}),Va(e,t,n,r=>G(r,t,a,n)),n(e)}const Wa={selectId:"schema-select",summaryId:"schema-summary",sectionsId:"schema-sections",previewId:"schema-preview",resetId:"schema-reset"};function Ga(e){return{selectId:`${e}-schema-select`,summaryId:`${e}-summary`,sectionsId:`${e}-sections`,previewId:`${e}-preview`,resetId:`${e}-reset`}}async function Ka(e){var t,a,n;try{const i=((t=(await _e()).data)==null?void 0:t.schemas)??[],o=ht(i),c=re(o),p=((a=c.find(r=>r.name==="sdxl-lora"))==null?void 0:a.name)??((n=c[0])==null?void 0:n.name);if(!p){h("schema-summary","No selectable schemas were returned."),g("schema-sections","<p>No schema runtime available.</p>");return}G(ae(o,p),Wa,e,()=>{})}catch(s){h("schema-summary","Schema bridge request failed"),g("schema-sections",`<p>${s instanceof Error?l(s.message):"Unknown error"}</p>`),U("schema-preview","{}")}}function Ja(e,t){return`
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
  `}function C(e,t,a){return`
    <section class="page-hero panel">
      <p class="eyebrow">${e}</p>
      <h2>${t}</h2>
      <p class="lede">${a}</p>
    </section>
  `}function Ve(e,t,a="module"){return`
    <article class="panel info-card">
      <p class="panel-kicker">${a}</p>
      <h3>${e}</h3>
      <div>${t}</div>
    </article>
  `}function Ya(){return`
    ${C("about","A clean source-side replacement for the current about page","This page is one of the safest migration targets because it is mostly branding, release context and ownership notes.")}
    <section class="two-column">
      ${Ve("Project identity",`
          <p><strong>Product name:</strong> SD-reScripts</p>
          <p><strong>Version target:</strong> v1.0.2</p>
          <p><strong>Lineage:</strong> Fork from 秋葉 aaaki/lora-scripts</p>
          <p><strong>Maintainer:</strong> Modify By Lulynx</p>
        `,"brand")}
      ${Ve("Why migrate this page first",`
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
      <p><a class="text-link" href="${N("/other/about.html")}" target="_blank" rel="noreferrer">Open current shipped about page</a></p>
    </section>
  `}function w(e){return`
    ${C(e.heroKicker,e.heroTitle,e.heroLede)}
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
            <p><a class="text-link" href="${N(e.legacyPath)}" target="_blank" rel="noreferrer">${e.legacyLabel}</a></p>
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
        <button id="${e.prefix}-import-recipe" class="action-button action-button-ghost" type="button">Import recipe</button>
        <button id="${e.prefix}-download-config" class="action-button action-button-ghost" type="button">Download config</button>
        <button id="${e.prefix}-export-preset" class="action-button action-button-ghost" type="button">Export preset</button>
        <button id="${e.prefix}-import-config" class="action-button action-button-ghost" type="button">Import config</button>
        <button id="${e.prefix}-load-presets" class="action-button action-button-ghost" type="button">Load presets</button>
        <button id="${e.prefix}-stop-train" class="action-button action-button-ghost" type="button">Stop train</button>
      </div>
      <p id="${e.prefix}-utility-note" class="section-note">Autosave is enabled for this source route.</p>
      <input id="${e.prefix}-config-file-input" type="file" accept=".toml" hidden />
      <input id="${e.prefix}-history-file-input" type="file" accept=".json" hidden />
      <input id="${e.prefix}-recipe-file-input" type="file" accept=".json,.toml" hidden />
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
  `}function Za(){return w({prefix:"anima-finetune",heroKicker:"anima finetune",heroTitle:"Anima finetune source training page",heroLede:"This route exposes the Anima finetune schema so the source-side bridge covers both LoRA and full finetune variants for that trainer family.",runnerTitle:"Anima finetune source-side runner",startButtonLabel:"Start Anima finetune",legacyPath:"/lora/anima-finetune.html",legacyLabel:"Open current shipped Anima finetune page",renderedTitle:"Anima finetune form bridge"})}function Qa(){return w({prefix:"anima",heroKicker:"anima lora",heroTitle:"Anima LoRA source training page",heroLede:"This route surfaces the Anima LoRA schema on the shared training bridge instead of forcing that capability to stay hidden behind the shipped legacy page.",runnerTitle:"Anima LoRA source-side runner",startButtonLabel:"Start Anima LoRA training",legacyPath:"/lora/anima.html",legacyLabel:"Open current shipped Anima LoRA page",renderedTitle:"Anima LoRA form bridge"})}function es(){return w({prefix:"dreambooth",heroKicker:"dreambooth train",heroTitle:"Dreambooth source training page",heroLede:"This route brings the Dreambooth and SDXL full-finetune schema into the same source-side training bridge so we can migrate one of the last big non-LoRA training paths cleanly.",runnerTitle:"Dreambooth source-side runner",startButtonLabel:"Start Dreambooth training",legacyPath:"/dreambooth/",legacyLabel:"Open current shipped Dreambooth page",renderedTitle:"Dreambooth form bridge"})}function ts(){return w({prefix:"flux-controlnet",heroKicker:"flux controlnet",heroTitle:"Flux ControlNet source training page",heroLede:"This route reuses the same source-side training bridge for Flux ControlNet so the DiT-family conditioning workflow stays aligned with the current backend schema and payload rules.",runnerTitle:"Flux ControlNet source-side runner",startButtonLabel:"Start Flux ControlNet training",legacyPath:"/lora/flux-controlnet.html",legacyLabel:"Open current shipped Flux ControlNet page",renderedTitle:"Flux ControlNet form bridge"})}function as(){return w({prefix:"flux-finetune",heroKicker:"flux finetune",heroTitle:"Flux finetune source training page",heroLede:"This route exposes the dedicated Flux full-finetune schema on the same source-side training bridge so recipe shaping, preflight and launch behavior stay consistent.",runnerTitle:"Flux finetune source-side runner",startButtonLabel:"Start Flux finetune",legacyPath:"/lora/flux-finetune.html",legacyLabel:"Open current shipped Flux finetune page",renderedTitle:"Flux finetune form bridge"})}function ss(){return w({prefix:"flux",heroKicker:"flux train",heroTitle:"Flux LoRA source training page",heroLede:"This route reuses the source-side training bridge for Flux so we can keep payload shaping, compatibility checks and launch behavior aligned with the current backend.",runnerTitle:"Flux source-side runner",startButtonLabel:"Start Flux training",legacyPath:"/lora/flux.html",legacyLabel:"Open current shipped Flux page",renderedTitle:"Flux form bridge"})}function ns(){return w({prefix:"hunyuan-image",heroKicker:"hunyuan image",heroTitle:"Hunyuan Image LoRA source training page",heroLede:"This route exposes the Hunyuan Image LoRA schema so newer image trainer families live on the same source-side bridge instead of staying legacy-only.",runnerTitle:"Hunyuan Image source-side runner",startButtonLabel:"Start Hunyuan Image training",legacyPath:"/lora/hunyuan.html",legacyLabel:"Open current shipped Hunyuan Image page",renderedTitle:"Hunyuan Image form bridge"})}function is(){return w({prefix:"lumina-finetune",heroKicker:"lumina finetune",heroTitle:"Lumina finetune source training page",heroLede:"This route exposes Lumina finetune on the shared source-side bridge so finetune-specific payloads can use the same autosave, preflight and launch safety checks.",runnerTitle:"Lumina finetune source-side runner",startButtonLabel:"Start Lumina finetune",legacyPath:"/lora/lumina-finetune.html",legacyLabel:"Open current shipped Lumina finetune page",renderedTitle:"Lumina finetune form bridge"})}function rs(){return w({prefix:"lumina",heroKicker:"lumina lora",heroTitle:"Lumina LoRA source training page",heroLede:"This route exposes the Lumina LoRA schema on the shared bridge so newer trainer families are available without falling back to older UI entry points.",runnerTitle:"Lumina LoRA source-side runner",startButtonLabel:"Start Lumina LoRA training",legacyPath:"/lora/lumina.html",legacyLabel:"Open current shipped Lumina LoRA page",renderedTitle:"Lumina LoRA form bridge"})}function os(){return`
    ${C("schema bridge","Source-side schema explorer and prototype form bridge","This page evaluates the current schema DSL in the browser and turns it into sections, fields and editable defaults. It is the first direct bridge between the new source workspace and the training form core.")}
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
  `}function ls(){return w({prefix:"sd3-finetune",heroKicker:"sd3 finetune",heroTitle:"SD3 finetune source training page",heroLede:"This route brings the dedicated SD3 finetune schema into the shared source-side bridge so parameter normalization and runtime checks stay aligned with the backend.",runnerTitle:"SD3 finetune source-side runner",startButtonLabel:"Start SD3 finetune",legacyPath:"/lora/sd3-finetune.html",legacyLabel:"Open current shipped SD3 finetune page",renderedTitle:"SD3 finetune form bridge"})}function cs(){return w({prefix:"sd3",heroKicker:"sd3 train",heroTitle:"SD3 LoRA source training page",heroLede:"This route extends the same source-side training bridge to SD3 so we can keep the fast-moving schema-driven trainer paths on one shared foundation.",runnerTitle:"SD3 source-side runner",startButtonLabel:"Start SD3 training",legacyPath:"/lora/sd3.html",legacyLabel:"Open current shipped SD3 page",renderedTitle:"SD3 form bridge"})}function ds(){return w({prefix:"sd-controlnet",heroKicker:"sd controlnet",heroTitle:"SD ControlNet source training page",heroLede:"This route extends the shared source-side training bridge to the SD1.x / SD2.x ControlNet workflow so conditioning-dataset training can migrate without another bespoke form stack.",runnerTitle:"SD ControlNet source-side runner",startButtonLabel:"Start SD ControlNet training",legacyPath:"/lora/controlnet.html",legacyLabel:"Open current shipped SD ControlNet page",renderedTitle:"SD ControlNet form bridge"})}function us(){return w({prefix:"sd-ti",heroKicker:"sd textual inversion",heroTitle:"SD textual inversion source training page",heroLede:"This route exposes the standard SD textual inversion schema through the shared training bridge, so embeddings can use the same source-side autosave, preflight and launch workflow.",runnerTitle:"SD textual inversion source-side runner",startButtonLabel:"Start SD textual inversion",legacyPath:"/lora/ti.html",legacyLabel:"Open current shipped SD textual inversion page",renderedTitle:"SD textual inversion form bridge"})}function ps(){return w({prefix:"sdxl-controlnet",heroKicker:"sdxl controlnet",heroTitle:"SDXL ControlNet source training page",heroLede:"This route keeps the SDXL ControlNet training path on the same source-side schema bridge, normalized payload builder and launch pipeline as the main LoRA routes.",runnerTitle:"SDXL ControlNet source-side runner",startButtonLabel:"Start SDXL ControlNet training",legacyPath:"/lora/sdxl-controlnet.html",legacyLabel:"Open current shipped SDXL ControlNet page",renderedTitle:"SDXL ControlNet form bridge"})}function hs(){return w({prefix:"sdxl-lllite",heroKicker:"sdxl lllite",heroTitle:"SDXL LLLite source training page",heroLede:"This route keeps the SDXL ControlNet-LLLite path on the shared source-side training bridge so even the more specialized conditioning flow no longer needs its own one-off migration path.",runnerTitle:"SDXL LLLite source-side runner",startButtonLabel:"Start SDXL LLLite training",legacyPath:"/lora/sdxl-lllite.html",legacyLabel:"Open current shipped SDXL LLLite page",renderedTitle:"SDXL LLLite form bridge"})}function ms(){return w({prefix:"sdxl-ti",heroKicker:"sdxl textual inversion",heroTitle:"SDXL textual inversion source training page",heroLede:"This route exposes SDXL textual inversion through the same source-side training bridge, so embeddings, prompt helpers and launch safety checks stay unified.",runnerTitle:"SDXL textual inversion source-side runner",startButtonLabel:"Start SDXL textual inversion",legacyPath:"/lora/sdxl-ti.html",legacyLabel:"Open current shipped SDXL textual inversion page",renderedTitle:"SDXL textual inversion form bridge"})}function gs(){return w({prefix:"sdxl",heroKicker:"sdxl train",heroTitle:"First source-side SDXL training page",heroLede:"This is the first page that moves beyond passive inspection: it renders the SDXL schema, tracks a real config model and can submit to the current training backend.",runnerTitle:"SDXL source-side runner",startButtonLabel:"Start SDXL training",legacyPath:"/lora/sdxl.html",legacyLabel:"Open current shipped SDXL page",renderedTitle:"SDXL form bridge"})}function fs(){return`
    ${C("settings","Source-side settings page prototype","This route is now close to live backend config data, so we can rebuild it before touching the schema-heavy training forms.")}
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
      <p><a class="text-link" href="${N("/other/settings.html")}" target="_blank" rel="noreferrer">Open current shipped settings page</a></p>
    </section>
  `}function bs(){return`
    ${C("tag editor","Tag editor wrapper migration page","The current shipped page is mostly a wrapper around startup state and proxy behavior. That makes it a good low-risk source-side rewrite.")}
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
          <p><a class="text-link" href="${N("/tageditor.html")}" target="_blank" rel="noreferrer">Open current shipped tag editor wrapper</a></p>
        </div>
      </article>
    </section>
  `}function ys(){return`
    ${C("tasks","Task monitor migration page","This route is already talking to the real backend task manager, so it is a strong candidate for early source migration.")}
    <section class="panel task-panel">
      <div class="task-toolbar">
        <button id="refresh-tasks" class="action-button" type="button">Refresh tasks</button>
        <a class="text-link task-legacy-link" href="${N("/task.html")}" target="_blank" rel="noreferrer">Open current shipped task page</a>
      </div>
      <div id="task-table-container" class="task-table-container loading">Loading tasks...</div>
    </section>
  `}function vs(){return`
    ${C("tensorboard","TensorBoard wrapper migration page","This page can be rebuilt without touching training forms because it mainly needs status text and a proxy destination.")}
    <section class="two-column">
      <article class="panel info-card">
        <p class="panel-kicker">proxy</p>
        <h3>Legacy backend path</h3>
        <div>
          <p>The current runtime proxies TensorBoard through <code>/proxy/tensorboard/</code>.</p>
          <p>This source-side page can later offer a cleaner iframe or open-in-new-tab flow.</p>
          <p><a class="text-link" href="${N("/proxy/tensorboard/")}" target="_blank" rel="noreferrer">Open current TensorBoard proxy</a></p>
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
  `}function ks(){return`
    ${C("tools","Tools workspace","This route now covers both raw script launching and the first reusable dataset utility, so it can grow into a real preflight toolbox instead of staying a placeholder.")}
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
      <p><a class="text-link" href="${N("/tageditor.html")}" target="_blank" rel="noreferrer">Open current shipped tag editor wrapper</a></p>
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
      <p><a class="text-link" href="${N("/lora/tools.html")}" target="_blank" rel="noreferrer">Open current shipped tools page</a></p>
      <div id="tools-browser" class="tools-browser loading">Loading available scripts...</div>
    </section>
  `}const _s=[{method:"GET",path:"/api/schemas/all",purpose:"Fetch all schema definitions used to render training forms.",migrationPriority:"high"},{method:"GET",path:"/api/schemas/hashes",purpose:"Hot-reload check for schema changes.",migrationPriority:"medium"},{method:"GET",path:"/api/presets",purpose:"Fetch preset configs for pages and tools.",migrationPriority:"high"},{method:"GET",path:"/api/config/saved_params",purpose:"Load stored UI parameter choices.",migrationPriority:"medium"},{method:"GET",path:"/api/config/summary",purpose:"Read app config summary for the rebuilt settings page.",migrationPriority:"medium"},{method:"GET",path:"/api/graphic_cards",purpose:"List GPUs plus xformers support state.",migrationPriority:"high"},{method:"POST",path:"/api/run",purpose:"Start schema-driven training jobs.",migrationPriority:"high"},{method:"POST",path:"/api/train/preflight",purpose:"Run backend-aware training preflight checks before launch.",migrationPriority:"high"},{method:"POST",path:"/api/train/sample_prompt",purpose:"Resolve and preview the effective training sample prompt text without launching a run.",migrationPriority:"high"},{method:"POST",path:"/api/dataset/masked_loss_audit",purpose:"Inspect alpha-channel mask readiness for masked-loss training workflows.",migrationPriority:"high"},{method:"POST",path:"/api/run_script",purpose:"Run utility scripts from the tools page.",migrationPriority:"high"},{method:"POST",path:"/api/interrogate",purpose:"Run the built-in tagger/interrogator flow.",migrationPriority:"high"},{method:"GET",path:"/api/interrogators",purpose:"List available batch tagger/interrogator models for the rebuilt tools workspace.",migrationPriority:"high"},{method:"POST",path:"/api/captions/cleanup/preview",purpose:"Preview bulk caption cleanup rules before touching files.",migrationPriority:"high"},{method:"POST",path:"/api/captions/cleanup/apply",purpose:"Apply bulk caption cleanup rules to caption files.",migrationPriority:"high"},{method:"POST",path:"/api/captions/backups/create",purpose:"Create a snapshot archive of caption files for later restore.",migrationPriority:"high"},{method:"POST",path:"/api/captions/backups/list",purpose:"List caption snapshots associated with a folder.",migrationPriority:"high"},{method:"POST",path:"/api/captions/backups/restore",purpose:"Restore caption files from a saved snapshot archive.",migrationPriority:"high"},{method:"GET",path:"/api/pick_file",purpose:"Open native file/folder pickers where supported.",migrationPriority:"medium"},{method:"GET",path:"/api/get_files",purpose:"List model, output or train directories for file pickers.",migrationPriority:"high"},{method:"GET",path:"/api/tasks",purpose:"Fetch active and historical task state.",migrationPriority:"high"},{method:"GET",path:"/api/tasks/terminate/{task_id}",purpose:"Terminate a running task.",migrationPriority:"high"},{method:"GET",path:"/api/tageditor_status",purpose:"Poll tag-editor startup/proxy status.",migrationPriority:"medium"},{method:"GET",path:"/api/scripts",purpose:"List backend-approved utility scripts and positional args for the rebuilt tools page.",migrationPriority:"high"}];function bt(){const e=it.map(a=>`
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
      `).join(""),t=_s.map(a=>`
        <tr>
          <td><span class="method method-${a.method.toLowerCase()}">${a.method}</span></td>
          <td><code>${a.path}</code></td>
          <td>${a.purpose}</td>
          <td>${a.migrationPriority}</td>
        </tr>
      `).join("");return`
    ${C("workspace","Source migration dashboard","This page stays close to the backend and keeps our migration map explicit instead of hiding it inside hashed dist chunks.")}

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
  `}function xs(){return w({prefix:"xti",heroKicker:"sd xti",heroTitle:"SD XTI source training page",heroLede:"This route exposes the SD XTI schema on the shared source-side bridge so more specialized embedding workflows are no longer hidden behind the legacy page only.",runnerTitle:"SD XTI source-side runner",startButtonLabel:"Start SD XTI training",legacyPath:"/lora/xti.html",legacyLabel:"Open current shipped SD XTI page",renderedTitle:"SD XTI form bridge"})}function ws(e,t){if(t.length===0){g(e,"<p>No GPUs reported. Training will use the backend default environment.</p>");return}const a=t.map((n,s)=>{const i=n.index??n.id??s,o=String(i);return`
        <label class="gpu-chip">
          <input type="checkbox" data-gpu-id="${l(o)}" />
          <span>GPU ${l(o)}: ${l(n.name)}</span>
        </label>
      `}).join("");g(e,`<div class="gpu-chip-grid">${a}</div>`)}function Ie(e){return[...document.querySelectorAll(`#${e} input[data-gpu-id]:checked`)].map(t=>t.dataset.gpuId).filter(t=>!!t)}function Ae(e,t=[]){const a=new Set(t.map(n=>String(n)));document.querySelectorAll(`#${e}-gpu-selector input[data-gpu-id]`).forEach(n=>{const s=n.dataset.gpuId??"";n.checked=a.has(s)})}function $s(e){switch(e){case"prompt_file":return"Prompt file";case"generated":return"Generated from current fields";case"random_dataset_prompt_preview":return"Random dataset-derived prompt";case"legacy_sample_prompts_file":return"Legacy sample_prompts file";case"legacy_sample_prompts_inline":return"Legacy sample_prompts text";default:return e}}function L(e,t,a,n="idle"){g(`${e}-submit-status`,`
      <div class="submit-status-box submit-status-${n}">
        <strong>${l(t)}</strong>
        <p>${l(a)}</p>
      </div>
    `)}function se(e,t,a){if(a){g(`${e}-validation-status`,`
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
        `:""].filter(Boolean).join("");if(!n){g(`${e}-validation-status`,`
        <div class="submit-status-box submit-status-success">
          <strong>Compatibility checks passed</strong>
          <p>No obvious parameter conflicts were detected in the current payload.</p>
        </div>
      `);return}g(`${e}-validation-status`,`
      <div class="submit-status-box ${t.errors.length>0?"submit-status-error":"submit-status-warning"}">
        <strong>${t.errors.length>0?"Action needed before launch":"Review before launch"}</strong>
        ${n}
      </div>
    `)}function b(e,t,a="idle"){const n=document.querySelector(`#${e}-utility-note`);n&&(n.textContent=t,n.classList.remove("utility-note-success","utility-note-warning","utility-note-error"),a==="success"?n.classList.add("utility-note-success"):a==="warning"?n.classList.add("utility-note-warning"):a==="error"&&n.classList.add("utility-note-error"))}function We(e,t,a){if(a){g(`${e}-preflight-report`,`
        <div class="submit-status-box submit-status-error">
          <strong>Preflight request failed</strong>
          <p>${l(a)}</p>
        </div>
      `);return}if(!t){g(`${e}-preflight-report`,`
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
            <p class="training-preflight-meta">${l($s(t.sample_prompt.source))}${t.sample_prompt.detail?` · ${l(t.sample_prompt.detail)}`:""}</p>
            <pre class="preset-preview">${l(t.sample_prompt.preview)}</pre>
          </div>
        `:""].filter(Boolean).join("");g(`${e}-preflight-report`,`
      <div class="submit-status-box ${t.can_start?"submit-status-success":"submit-status-warning"}">
        <strong>${t.can_start?"Backend preflight passed":"Backend preflight found launch blockers"}</strong>
        <p>Training type: ${l(t.training_type)}</p>
        ${n}
      </div>
    `)}function Ss(e){const t=[];let a="",n=null,s=0;for(let i=0;i<e.length;i+=1){const o=e[i],c=i>0?e[i-1]:"";if(n){a+=o,o===n&&c!=="\\"&&(n=null);continue}if(o==='"'||o==="'"){n=o,a+=o;continue}if(o==="["){s+=1,a+=o;continue}if(o==="]"){s-=1,a+=o;continue}if(o===","&&s===0){t.push(a.trim()),a="";continue}a+=o}return a.trim().length>0&&t.push(a.trim()),t}function Ts(e){let t=null,a=!1,n="";for(const s of e){if(t){if(n+=s,t==='"'&&s==="\\"&&!a){a=!0;continue}s===t&&!a&&(t=null),a=!1;continue}if(s==='"'||s==="'"){t=s,n+=s;continue}if(s==="#")break;n+=s}return n.trim()}function yt(e){return e.startsWith('"')&&e.endsWith('"')?e.slice(1,-1).replaceAll('\\"','"').replaceAll("\\n",`
`).replaceAll("\\t","	").replaceAll("\\\\","\\"):e.startsWith("'")&&e.endsWith("'")?e.slice(1,-1):e}function vt(e){const t=e.trim();return t.length===0?"":t.startsWith('"')&&t.endsWith('"')||t.startsWith("'")&&t.endsWith("'")?yt(t):t==="true"?!0:t==="false"?!1:t.startsWith("[")&&t.endsWith("]")?Ss(t.slice(1,-1)).map(a=>vt(a)):/^[+-]?\d[\d_]*(\.\d[\d_]*)?([eE][+-]?\d+)?$/.test(t)?Number(t.replaceAll("_","")):t}function Ge(e){return e.split(".").map(t=>t.trim()).filter(Boolean).map(t=>yt(t))}function Ls(e,t,a){let n=e;for(let s=0;s<t.length-1;s+=1){const i=t[s],o=n[i];(!o||typeof o!="object"||Array.isArray(o))&&(n[i]={}),n=n[i]}n[t[t.length-1]]=a}function Ee(e){const t={};let a=[];for(const n of e.split(/\r?\n/)){const s=Ts(n);if(!s)continue;if(s.startsWith("[[")&&s.endsWith("]]"))throw new Error("Array-of-table syntax is not supported in custom params yet.");if(s.startsWith("[")&&s.endsWith("]")){a=Ge(s.slice(1,-1));continue}const i=s.indexOf("=");if(i===-1)throw new Error(`Invalid TOML line: ${n}`);const o=Ge(s.slice(0,i));if(o.length===0)throw new Error(`Invalid TOML key: ${n}`);Ls(t,[...a,...o],vt(s.slice(i+1)))}return t}function de(e){return JSON.stringify(e)}function kt(e){return typeof e=="string"?de(e):typeof e=="number"?Number.isFinite(e)?String(e):de(String(e)):typeof e=="boolean"?e?"true":"false":Array.isArray(e)?`[${e.map(t=>kt(t)).join(", ")}]`:de(JSON.stringify(e))}function _t(e,t=[],a=[]){const n=[];for(const[s,i]of Object.entries(e)){if(i&&typeof i=="object"&&!Array.isArray(i)){_t(i,[...t,s],a);continue}n.push([s,i])}return a.push({path:t,values:n}),a}function ye(e){const t=_t(e).filter(n=>n.values.length>0).sort((n,s)=>n.path.join(".").localeCompare(s.path.join("."))),a=[];for(const n of t){n.path.length>0&&(a.length>0&&a.push(""),a.push(`[${n.path.join(".")}]`));for(const[s,i]of n.values.sort(([o],[c])=>o.localeCompare(c)))a.push(`${s} = ${kt(i)}`)}return a.join(`
`)}const Is=["pretrained_model_name_or_path","train_data_dir","reg_data_dir","output_dir","network_weights","conditioning_data_dir","controlnet_model_name_or_path","weights","vae","text_encoder","byt5","qwen3","llm_adapter_path","t5_tokenizer_path","ae","clip_l","clip_g","t5xxl","gemma2"],As=["learning_rate","unet_lr","text_encoder_lr","learning_rate_te","learning_rate_te1","learning_rate_te2","learning_rate_te3","sigmoid_scale","guidance_scale","training_shift","control_net_lr","self_attn_lr","cross_attn_lr","mlp_lr","mod_lr","llm_adapter_lr"],Es=["lycoris_algo","conv_dim","conv_alpha","dropout","dylora_unit","lokr_factor","train_norm","down_lr_weight","mid_lr_weight","up_lr_weight","block_lr_zero_threshold","enable_block_weights","enable_preview","network_args_custom","optimizer_args_custom","enable_base_weight","prodigy_d0","prodigy_d_coef","ui_custom_params"],Ps=["vae","reg_data_dir","network_weights","conditioning_data_dir","controlnet_model_name_or_path","weights","init_word","text_encoder","byt5","qwen3","llm_adapter_path","t5_tokenizer_path","ae","clip_l","clip_g","t5xxl","gemma2","noise_offset","multires_noise_iterations","multires_noise_discount","caption_dropout_rate","network_dropout","scale_weight_norms","gpu_ids"],Rs=["v2","v_parameterization","scale_v_pred_loss_like_noise_pred","clip_skip","learning_rate_te","stop_text_encoder_training"],Ns=["learning_rate_te1","learning_rate_te2"],Cs=[["cache_text_encoder_outputs","shuffle_caption"],["noise_offset","multires_noise_iterations"],["cache_latents","color_aug"],["cache_latents","random_crop"]],Ke={algo:"lycoris_algo",unit:"dylora_unit",factor:"lokr_factor"},Ds=new Set(["conv_dim","conv_alpha","dropout","down_lr_weight","mid_lr_weight","up_lr_weight","block_lr_zero_threshold"]),Bs=new Set(["decouple","weight_decay","use_bias_correction","safeguard_warmup"]),qs=new Set(["base_weights","base_weights_multiplier"]),Fs={pretrained_model_name_or_path:"./sd-models/model.safetensors",train_data_dir:"./train/aki",resolution:"512,512",enable_bucket:!0,min_bucket_reso:256,max_bucket_reso:1024,output_name:"aki",output_dir:"./output",save_model_as:"safetensors",save_every_n_epochs:2,max_train_epochs:10,train_batch_size:1,network_train_unet_only:!1,network_train_text_encoder_only:!1,learning_rate:1e-4,unet_lr:1e-4,text_encoder_lr:1e-5,lr_scheduler:"cosine_with_restarts",optimizer_type:"AdamW8bit",lr_scheduler_num_cycles:1,network_module:"networks.lora",network_dim:32,network_alpha:32,logging_dir:"./logs",caption_extension:".txt",shuffle_caption:!0,keep_tokens:0,max_token_length:255,seed:1337,prior_loss_weight:1,clip_skip:2,mixed_precision:"fp16",save_precision:"fp16",xformers:!0,cache_latents:!0,persistent_data_loader_workers:!0};function ve(e){return JSON.parse(JSON.stringify(e??{}))}function Y(e){return Array.isArray(e)?e.map(t=>String(t??"").trim()).filter(Boolean):String(e??"").split(/\r?\n/).map(t=>t.trim()).filter(Boolean)}function q(e,t){return Object.prototype.hasOwnProperty.call(e,t)}function js(e){return String(e.model_train_type??"").startsWith("sdxl")}function Os(e){return String(e.model_train_type??"")==="sd3-finetune"}function y(e){return e==null?"":String(e)}function Hs(e){return y(e).replaceAll("\\","/")}function ne(e,t=0){const a=Number.parseFloat(y(e));return Number.isNaN(a)?t:a}function _(e){return!!e}function Je(e){const t=e.indexOf("=");return t===-1?{key:e.trim(),value:"",hasValue:!1}:{key:e.slice(0,t).trim(),value:e.slice(t+1).trim(),hasValue:!0}}function zs(e){if(typeof e=="boolean")return e;const t=y(e).toLowerCase();return t==="true"||t==="1"||t==="yes"}function Pe(e,t=String(e.model_train_type??"")){const a=t==="lora-basic"?{...Fs,...ve(e)}:ve(e),n=[],s=[],i=js(a),o=Os(a);(i||o)&&[a.learning_rate_te1,a.learning_rate_te2,a.learning_rate_te3].some(_)&&(a.train_text_encoder=!0);for(const r of i||o?Rs:Ns)q(a,r)&&delete a[r];a.network_module==="lycoris.kohya"?(n.push(`conv_dim=${y(a.conv_dim)}`,`conv_alpha=${y(a.conv_alpha)}`,`dropout=${y(a.dropout)}`,`algo=${y(a.lycoris_algo)}`),_(a.lokr_factor)&&n.push(`factor=${y(a.lokr_factor)}`),_(a.train_norm)&&n.push("train_norm=True")):a.network_module==="networks.dylora"&&n.push(`unit=${y(a.dylora_unit)}`);const c=y(a.optimizer_type),p=c.toLowerCase();p.startsWith("dada")?((c==="DAdaptation"||c==="DAdaptAdam")&&s.push("decouple=True","weight_decay=0.01"),a.learning_rate=1,a.unet_lr=1,a.text_encoder_lr=1):p==="prodigy"&&(s.push("decouple=True","weight_decay=0.01","use_bias_correction=True",`d_coef=${y(a.prodigy_d_coef)}`),_(a.lr_warmup_steps)&&s.push("safeguard_warmup=True"),_(a.prodigy_d0)&&s.push(`d0=${y(a.prodigy_d0)}`)),_(a.enable_block_weights)&&(n.push(`down_lr_weight=${y(a.down_lr_weight)}`,`mid_lr_weight=${y(a.mid_lr_weight)}`,`up_lr_weight=${y(a.up_lr_weight)}`,`block_lr_zero_threshold=${y(a.block_lr_zero_threshold)}`),delete a.block_lr_zero_threshold),_(a.enable_base_weight)?(a.base_weights=Y(a.base_weights),a.base_weights_multiplier=Y(a.base_weights_multiplier).map(r=>ne(r))):(delete a.base_weights,delete a.base_weights_multiplier);for(const r of Y(a.network_args_custom))n.push(r);for(const r of Y(a.optimizer_args_custom))s.push(r);_(a.enable_preview)||(delete a.sample_prompts,delete a.sample_sampler,delete a.sample_every_n_epochs);for(const r of As)q(a,r)&&(a[r]=ne(a[r]));for(const r of Ps){if(!q(a,r))continue;const d=a[r];(d===0||d===""||Array.isArray(d)&&d.length===0)&&delete a[r]}for(const r of Is)q(a,r)&&a[r]&&(a[r]=Hs(a[r]));if(n.length>0?a.network_args=n:delete a.network_args,s.length>0?a.optimizer_args=s:delete a.optimizer_args,_(a.ui_custom_params)){const r=Ee(y(a.ui_custom_params));Object.assign(a,r)}for(const r of Es)q(a,r)&&delete a[r];return Array.isArray(a.gpu_ids)&&(a.gpu_ids=a.gpu_ids.map(r=>{const d=y(r),u=d.match(/GPU\s+(\d+):/);return u?u[1]:d})),a}function Ms(e){const t=[],a=[],n=y(e.optimizer_type),s=n.toLowerCase(),i=y(e.model_train_type),o=i==="sd3-finetune",c=i==="anima-lora"||i==="anima-finetune";n.startsWith("DAdapt")&&e.lr_scheduler!=="constant"&&t.push("DAdaptation works best with lr_scheduler set to constant."),s.startsWith("prodigy")&&(q(e,"unet_lr")||q(e,"text_encoder_lr"))&&(ne(e.unet_lr,1)!==1||ne(e.text_encoder_lr,1)!==1)&&t.push("Prodigy usually expects unet_lr and text_encoder_lr to stay at 1."),e.network_module==="networks.oft"&&i!=="sdxl-lora"&&a.push("OFT is currently only supported for SDXL LoRA."),o&&_(e.train_text_encoder)&&_(e.cache_text_encoder_outputs)&&!_(e.use_t5xxl_cache_only)&&a.push("SD3 full finetune cannot train text encoders while cache_text_encoder_outputs is enabled."),o&&_(e.train_t5xxl)&&!_(e.train_text_encoder)&&a.push("train_t5xxl requires train_text_encoder to be enabled first."),o&&_(e.train_t5xxl)&&_(e.cache_text_encoder_outputs)&&a.push("train_t5xxl cannot be combined with cache_text_encoder_outputs."),c&&_(e.unsloth_offload_checkpointing)&&_(e.cpu_offload_checkpointing)&&a.push("unsloth_offload_checkpointing cannot be combined with cpu_offload_checkpointing."),c&&_(e.unsloth_offload_checkpointing)&&_(e.blocks_to_swap)&&a.push("unsloth_offload_checkpointing cannot be combined with blocks_to_swap."),_(e.masked_loss)&&!_(e.alpha_mask)&&!_(e.conditioning_data_dir)&&t.push("masked_loss is on, but alpha_mask is off. For normal alpha-channel datasets this often becomes a no-op.");for(const[p,r]of Cs)_(e[p])&&_(e[r])&&a.push(`Parameters ${p} and ${r} conflict. Please enable only one of them.`);return{warnings:t,errors:a}}function xt(e){const t=ve(e);if(Array.isArray(t.network_args)){const a=[];for(const n of t.network_args){const{key:s,value:i,hasValue:o}=Je(y(n));if(s==="train_norm"){t.train_norm=o?zs(i):!0;continue}if((s==="down_lr_weight"||s==="mid_lr_weight"||s==="up_lr_weight"||s==="block_lr_zero_threshold")&&(t.enable_block_weights=!0),Ds.has(s)){t[s]=i;continue}if(Ke[s]){t[Ke[s]]=i;continue}a.push(y(n))}a.length>0&&(t.network_args_custom=a),delete t.network_args}if(Array.isArray(t.optimizer_args)){const a=[];for(const n of t.optimizer_args){const{key:s,value:i}=Je(y(n));if(s==="d_coef"){t.prodigy_d_coef=i;continue}if(s==="d0"){t.prodigy_d0=i;continue}Bs.has(s)||a.push(y(n))}a.length>0&&(t.optimizer_args_custom=a),delete t.optimizer_args}for(const a of qs)Array.isArray(t[a])&&(t[a]=t[a].map(n=>y(n)).join(`
`),a==="base_weights"&&(t.enable_base_weight=!0),a==="base_weights_multiplier"&&(t.enable_base_weight=!0));return Array.isArray(t.gpu_ids)&&(t.gpu_ids=t.gpu_ids.map(a=>y(a))),t}function K(e,t){const a=t.values.output_name;return typeof a=="string"&&a.trim().length>0?a.trim():`${e.modelLabel} snapshot`}function Us(e){try{return JSON.stringify(Pe(H(e.value)),null,2)}catch(t){return t instanceof Error?t.message:"Unable to preview this snapshot."}}function Xs(e,t){if(t.length===0){g(`${e}-history-panel`,`
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
          <pre class="history-preview">${l(Us(n))}</pre>
          <div class="history-card-actions">
            <button class="action-button action-button-ghost action-button-small" data-history-apply="${s}" type="button">Apply</button>
            <button class="action-button action-button-ghost action-button-small" data-history-rename="${s}" type="button">Rename</button>
            <button class="action-button action-button-ghost action-button-small" data-history-delete="${s}" type="button">Delete</button>
          </div>
        </article>
      `).join("");g(`${e}-history-panel`,`
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
    `)}function Vs(e,t){if(t.length===0){g(`${e}-presets-panel`,`
        <div class="training-side-panel-head">
          <div>
            <p class="panel-kicker">presets</p>
            <h3>Training presets</h3>
          </div>
          <button class="action-button action-button-ghost action-button-small" data-preset-close="${e}" type="button">Close</button>
        </div>
        <p>No presets matched this training route.</p>
      `);return}const a=t.map((n,s)=>{const i=n.metadata??{},o=n.data??{};return`
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
          <pre class="preset-preview">${l(JSON.stringify(o,null,2))}</pre>
          <div class="preset-card-actions">
            <button class="action-button action-button-ghost action-button-small" data-preset-save-recipe="${s}" type="button">Save recipe</button>
            <button class="action-button action-button-ghost action-button-small" data-preset-merge="${s}" type="button">Merge</button>
            <button class="action-button action-button-ghost action-button-small" data-preset-replace="${s}" type="button">Replace</button>
          </div>
        </article>
      `}).join("");g(`${e}-presets-panel`,`
      <div class="training-side-panel-head">
        <div>
          <p class="panel-kicker">presets</p>
          <h3>Training presets</h3>
        </div>
        <button class="action-button action-button-ghost action-button-small" data-preset-close="${e}" type="button">Close</button>
      </div>
      <div class="preset-list">${a}</div>
    `)}function Ws(e,t){if(t.length===0){g(`${e}-recipes-panel`,`
        <div class="training-side-panel-head">
          <div>
            <p class="panel-kicker">recipes</p>
            <h3>Local recipe library</h3>
          </div>
          <div class="history-toolbar">
            <button class="action-button action-button-ghost action-button-small" data-recipe-export-all="${e}" type="button">Export</button>
            <button class="action-button action-button-ghost action-button-small" data-recipe-import="${e}" type="button">Import</button>
            <button class="action-button action-button-ghost action-button-small" data-recipe-close="${e}" type="button">Close</button>
          </div>
        </div>
        <p>No saved recipes for this route yet.</p>
      `);return}const a=t.map((n,s)=>`
        <article class="preset-card">
          <div class="preset-card-head">
            <div>
              <h4>${l(n.name)}</h4>
              <p class="preset-card-meta">
                ${l(n.created_at)}
                ${n.train_type?` · ${l(n.train_type)}`:""}
              </p>
            </div>
            <span class="coverage-pill coverage-pill-muted">${l(n.route_id||"local")}</span>
          </div>
          <p>${l(n.description||"No description")}</p>
          <pre class="preset-preview">${l(JSON.stringify(Pe(H(n.value)),null,2))}</pre>
          <div class="preset-card-actions">
            <button class="action-button action-button-ghost action-button-small" data-recipe-merge="${s}" type="button">Merge</button>
            <button class="action-button action-button-ghost action-button-small" data-recipe-replace="${s}" type="button">Replace</button>
            <button class="action-button action-button-ghost action-button-small" data-recipe-export="${s}" type="button">Export</button>
            <button class="action-button action-button-ghost action-button-small" data-recipe-rename="${s}" type="button">Rename</button>
            <button class="action-button action-button-ghost action-button-small" data-recipe-delete="${s}" type="button">Delete</button>
          </div>
        </article>
      `).join("");g(`${e}-recipes-panel`,`
      <div class="training-side-panel-head">
        <div>
          <p class="panel-kicker">recipes</p>
          <h3>Local recipe library</h3>
        </div>
        <div class="history-toolbar">
          <button class="action-button action-button-ghost action-button-small" data-recipe-export-all="${e}" type="button">Export</button>
          <button class="action-button action-button-ghost action-button-small" data-recipe-import="${e}" type="button">Import</button>
          <button class="action-button action-button-ghost action-button-small" data-recipe-close="${e}" type="button">Close</button>
        </div>
      </div>
      <div class="preset-list">${a}</div>
    `)}function Gs(e,t){const a=new Set(e.presetTrainTypes);return t.filter(n=>{const i=(n.metadata??{}).train_type;return typeof i!="string"||i.trim().length===0?!0:a.has(i)})}function S(e,t,a){const n=document.querySelector(`#${e}-history-panel`),s=document.querySelector(`#${e}-recipes-panel`),i=document.querySelector(`#${e}-presets-panel`);n&&(n.hidden=t==="history"?!a:!0),s&&(s.hidden=t==="recipes"?!a:!0),i&&(i.hidden=t==="presets"?!a:!0)}async function Ye(e,t){try{const a=await Ut(t);if(a.status!=="success")throw new Error(a.message||"Training preflight failed.");return We(e.prefix,a.data??null),a.data??null}catch(a){throw We(e.prefix,null,a instanceof Error?a.message:"Training preflight failed."),a}}function Ks(e){var t;(t=document.querySelector(`#${e.prefix}-stop-train`))==null||t.addEventListener("click",async()=>{var a;try{const s=(((a=(await xe()).data)==null?void 0:a.tasks)??[]).find(o=>String(o.status).toUpperCase()==="RUNNING");if(!s){b(e.prefix,"No running training task was found.","warning");return}const i=String(s.id??s.task_id??"");if(!i){b(e.prefix,"The running task does not expose an id.","error");return}if(!window.confirm(`Stop running task ${i}?`))return;await at(i),L(e.prefix,"Training stop requested",`Sent terminate request for task ${i}.`,"warning"),b(e.prefix,`Terminate requested for task ${i}.`,"warning")}catch(n){b(e.prefix,n instanceof Error?n.message:"Failed to stop training.","error")}})}function Js(e,t,a){var s;(s=document.querySelector(`#${e.prefix}-run-preflight`))==null||s.addEventListener("click",async()=>{const i=t();if(!i){L(e.prefix,"Editor not ready",`The ${e.modelLabel} schema editor state is not initialized yet.`,"error");return}try{const o=a(i);se(e.prefix,o.checks),await Ye(e,o.payload),b(e.prefix,"Training preflight completed.","success")}catch(o){b(e.prefix,o instanceof Error?o.message:"Training preflight failed.","error")}});const n=document.querySelector(`#${e.prefix}-start-train`);n==null||n.addEventListener("click",async()=>{var o;const i=t();if(!i){L(e.prefix,"Editor not ready",`The ${e.modelLabel} schema editor state is not initialized yet.`,"error");return}n.setAttribute("disabled","true"),L(e.prefix,"Submitting training job...","Sending the current payload to /api/run.","idle");try{const c=a(i);if(c.checks.errors.length>0){L(e.prefix,"Fix parameter conflicts first",c.checks.errors.join(" "),"error"),se(e.prefix,c.checks);return}const p=await Ye(e,c.payload);if(p&&!p.can_start){L(e.prefix,"Resolve preflight errors first",p.errors.join(" "),"error");return}const r=await Mt(c.payload);if(r.status==="success"){const u=[...c.checks.warnings,...(p==null?void 0:p.warnings)??[],...((o=r.data)==null?void 0:o.warnings)??[]].join(" ");L(e.prefix,"Training request accepted",`${r.message||"Training started."}${u?` ${u}`:""}`,u?"warning":"success")}else L(e.prefix,"Training request failed",r.message||"Unknown backend failure.","error")}catch(c){L(e.prefix,"Training request failed",c instanceof Error?c.message:"Unknown network error.","error")}finally{n.removeAttribute("disabled")}})}function Ys(e){return e.trim().replace(/[^0-9A-Za-z._-]+/g,"-").replace(/-+/g,"-").replace(/^[-_.]+|[-_.]+$/g,"")||"training-preset"}function Zs(e,t,a){const n=K(e,t),s=String(a.payload.model_train_type??"");return{metadata:{name:n,version:"1.0",author:"SD-reScripts local export",train_type:s||e.schemaName,description:`Exported from the ${e.modelLabel} source-side training bridge on ${new Date().toLocaleString()}.`},data:a.payload}}function Qs(e,t,a,n){const s=K(e,t),i=window.prompt("Recipe name",s);if(!i||!i.trim())return!1;const o=window.prompt("Recipe description (optional)","")??"",c=E(e.routeId);return c.unshift({created_at:new Date().toLocaleString(),name:i.trim(),description:o.trim()||void 0,train_type:String(a.payload.model_train_type??e.schemaName),route_id:e.routeId,value:H(a.payload)}),V(e.routeId,c.slice(0,60)),n(),!0}function Ze(e,t,a){const n=t.data&&typeof t.data=="object"&&!Array.isArray(t.data)?t.data:t.value&&typeof t.value=="object"&&!Array.isArray(t.value)?t.value:t;if(!n||typeof n!="object"||Array.isArray(n)||Object.keys(n).length===0)return null;const s=t.metadata&&typeof t.metadata=="object"&&!Array.isArray(t.metadata)?t.metadata:{},i=String(s.name||t.name||a||"Imported recipe").trim();return{created_at:String(t.created_at||new Date().toLocaleString()),name:i||"Imported recipe",description:typeof s.description=="string"?s.description:typeof t.description=="string"?t.description:void 0,train_type:typeof s.train_type=="string"?s.train_type:typeof t.train_type=="string"?t.train_type:typeof n.model_train_type=="string"?n.model_train_type:e.schemaName,route_id:typeof t.route_id=="string"?t.route_id:e.routeId,value:H(n)}}function en(e,t,a){const n=a.trim();if(!n)throw new Error("Recipe file is empty.");const s=t.toLowerCase().endsWith(".json")?JSON.parse(n):Ee(n),i=[];if(Array.isArray(s))s.forEach((o,c)=>{if(!o||typeof o!="object"||Array.isArray(o))return;const p=Ze(e,o,`Imported recipe ${c+1}`);p&&i.push(p)});else if(s&&typeof s=="object"){const o=Ze(e,s,t.replace(/\.[^.]+$/,""));o&&i.push(o)}if(i.length===0)throw new Error("No valid recipe entries were found in this file.");return i}function tn(e,t,a){var s;const n=B(e.routeId);n.unshift({time:new Date().toLocaleString(),name:K(e,t),value:H(t.values),gpu_ids:Ie(`${e.prefix}-gpu-selector`)}),ee(e.routeId,n.slice(0,40)),(s=document.querySelector(`#${e.prefix}-history-panel`))!=null&&s.hidden||a()}function an(e,t,a,n){var s,i,o,c;(s=document.querySelector(`#${e.prefix}-download-config`))==null||s.addEventListener("click",()=>{const p=t();if(!p)return;const r=a(p);M(`${e.prefix}-${pe()}.toml`,ye(r.payload)),b(e.prefix,"Exported current config as TOML.","success")}),(i=document.querySelector(`#${e.prefix}-export-preset`))==null||i.addEventListener("click",()=>{const p=t();if(!p)return;const r=a(p),d=Zs(e,p,r),u=Ys(K(e,p)||e.prefix);M(`${u}-preset.toml`,ye(d)),b(e.prefix,"Exported current config as reusable preset TOML.","success")}),(o=document.querySelector(`#${e.prefix}-import-config`))==null||o.addEventListener("click",()=>{var p;(p=document.querySelector(`#${e.prefix}-config-file-input`))==null||p.click()}),(c=document.querySelector(`#${e.prefix}-config-file-input`))==null||c.addEventListener("change",p=>{var m;const r=p.currentTarget,d=(m=r.files)==null?void 0:m[0];if(!d)return;const u=new FileReader;u.onload=()=>{try{const f=Ee(String(u.result??"")),v=f.data&&typeof f.data=="object"&&!Array.isArray(f.data)?f.data:f;n(v),b(e.prefix,f.data&&typeof f.data=="object"?`Imported preset: ${d.name}.`:`Imported config: ${d.name}.`,"success")}catch(f){b(e.prefix,f instanceof Error?f.message:"Failed to import config.","error")}finally{r.value=""}},u.readAsText(d)})}function sn(e,t){var a;(a=document.querySelector(`#${e.prefix}-history-file-input`))==null||a.addEventListener("change",n=>{var c;const s=n.currentTarget,i=(c=s.files)==null?void 0:c[0];if(!i)return;const o=new FileReader;o.onload=()=>{try{const p=JSON.parse(String(o.result??""));if(!Array.isArray(p))throw new Error("History file must contain an array.");const r=p.filter(u=>u&&typeof u=="object"&&u.value&&typeof u.value=="object").map(u=>({time:String(u.time||new Date().toLocaleString()),name:u.name?String(u.name):void 0,value:H(u.value),gpu_ids:Array.isArray(u.gpu_ids)?u.gpu_ids.map(m=>String(m)):[]}));if(r.length===0)throw new Error("History file did not contain valid entries.");const d=[...B(e.routeId),...r].slice(0,80);ee(e.routeId,d),t(),b(e.prefix,`Imported ${r.length} history entries.`,"success")}catch(p){b(e.prefix,p instanceof Error?p.message:"Failed to import history.","error")}finally{s.value=""}},o.readAsText(i)})}function nn(e,t,a){var n;(n=document.querySelector(`#${e.prefix}-recipe-file-input`))==null||n.addEventListener("change",s=>{var p;const i=s.currentTarget,o=(p=i.files)==null?void 0:p[0];if(!o)return;const c=new FileReader;c.onload=()=>{try{const r=en(e,o.name,String(c.result??"")),d=[...r,...E(e.routeId)].slice(0,100);V(e.routeId,d),t(),a(),b(e.prefix,`Imported ${r.length} recipe entry${r.length===1?"":"ies"}.`,"success")}catch(r){b(e.prefix,r instanceof Error?r.message:"Failed to import recipe.","error")}finally{i.value=""}},c.readAsText(o)})}function rn(e,t,a){g(`${e}-sample-prompt-workspace`,`
      <div class="submit-status-box">
        <strong>${l(t)}</strong>
        <p>${l(a)}</p>
      </div>
    `)}function on(e){switch(e){case"prompt_file":return"Prompt file";case"generated":return"Generated from current fields";case"random_dataset_prompt_preview":return"Random dataset-derived prompt";case"legacy_sample_prompts_file":return"Legacy sample_prompts file";case"legacy_sample_prompts_inline":return"Legacy sample_prompts text";default:return e}}function ie(e){rn(e,"Sample prompt workspace is waiting for refresh","Edit prompt fields freely, then click Refresh prompt to inspect the exact text that would be used.")}function Z(e,t,a){if(a){g(`${e}-sample-prompt-workspace`,`
        <div class="submit-status-box submit-status-error">
          <strong>Sample prompt preview failed</strong>
          <p>${l(a)}</p>
        </div>
      `);return}if(!t){ie(e);return}const n=[t.warnings.length?`
          <div>
            <strong>Warnings</strong>
            <ul class="status-list">
              ${t.warnings.map(o=>`<li>${l(o)}</li>`).join("")}
            </ul>
          </div>
        `:"",t.notes.length?`
          <div>
            <strong>Notes</strong>
            <ul class="status-list">
              ${t.notes.map(o=>`<li>${l(o)}</li>`).join("")}
            </ul>
          </div>
        `:""].filter(Boolean).join(""),s=t.warnings.length>0||!t.enabled?"submit-status-warning":"submit-status-success",i=t.line_count>3?`Showing the first 3 non-empty lines out of ${t.line_count}.`:`${t.line_count||0} non-empty line${t.line_count===1?"":"s"} detected.`;g(`${e}-sample-prompt-workspace`,`
      <div class="submit-status-box ${s}">
        <strong>${t.enabled?"Sample prompt resolved":"Sample prompt resolved, but preview is disabled"}</strong>
        <p class="training-preflight-meta">${l(on(t.source))}${t.detail?` · ${l(t.detail)}`:""}</p>
        <p class="training-preflight-meta">${l(i)} Download will use ${l(t.suggested_file_name)}.</p>
        ${n}
        <pre class="preset-preview">${l(t.preview)}</pre>
      </div>
    `)}async function Qe(e,t,a){const n=t();if(!n)throw new Error(`${e.modelLabel} editor is not ready yet.`);const s=a(n),i=await Xt(s.payload);if(i.status!=="success"||!i.data)throw new Error(i.message||"Sample prompt preview failed.");return i.data}function ln(e){var i,o,c,p;const{config:t,getCurrentState:a,buildPreparedTrainingPayload:n,applyEditableRecord:s}=e;(i=document.querySelector(`#${t.prefix}-refresh-sample-prompt`))==null||i.addEventListener("click",async()=>{try{const r=await Qe(t,a,n);Z(t.prefix,r),b(t.prefix,"Sample prompt preview refreshed.","success")}catch(r){Z(t.prefix,null,r instanceof Error?r.message:"Sample prompt preview failed."),b(t.prefix,r instanceof Error?r.message:"Sample prompt preview failed.","error")}}),(o=document.querySelector(`#${t.prefix}-download-sample-prompt`))==null||o.addEventListener("click",async()=>{try{const r=await Qe(t,a,n);Z(t.prefix,r),M(r.suggested_file_name||"sample-prompts.txt",r.content||""),b(t.prefix,`Sample prompt exported as ${r.suggested_file_name}.`,"success")}catch(r){Z(t.prefix,null,r instanceof Error?r.message:"Sample prompt export failed."),b(t.prefix,r instanceof Error?r.message:"Sample prompt export failed.","error")}}),(c=document.querySelector(`#${t.prefix}-pick-prompt-file`))==null||c.addEventListener("click",async()=>{try{const r=await O("text-file");s({prompt_file:r},void 0,"merge"),ie(t.prefix),b(t.prefix,"Prompt file path inserted into the current form state.","success")}catch(r){b(t.prefix,r instanceof Error?r.message:"Prompt file picker failed.","error")}}),(p=document.querySelector(`#${t.prefix}-clear-prompt-file`))==null||p.addEventListener("click",()=>{s({prompt_file:""},void 0,"merge"),ie(t.prefix),b(t.prefix,"prompt_file cleared from the current form state.","warning")})}function cn(e){var f,v,k,A,D,X,Re;const{config:t,createDefaultState:a,getCurrentState:n,mountTrainingState:s,onStateChange:i,applyEditableRecord:o,buildPreparedTrainingPayload:c,bindHistoryPanel:p,bindRecipePanel:r,openHistoryPanel:d,openRecipePanel:u,openPresetPanel:m}=e;document.querySelectorAll(`#${t.prefix}-gpu-selector input[data-gpu-id]`).forEach(T=>{T.addEventListener("change",()=>{const J=n();J&&i(J)})}),(f=document.querySelector(`#${t.prefix}-reset-all`))==null||f.addEventListener("click",()=>{const T=a();Ae(t.prefix,[]),s(T),b(t.prefix,"Reset to schema defaults.","warning")}),(v=document.querySelector(`#${t.prefix}-save-params`))==null||v.addEventListener("click",()=>{const T=n();T&&(tn(t,T,p),b(t.prefix,"Current parameters saved to history.","success"))}),(k=document.querySelector(`#${t.prefix}-read-params`))==null||k.addEventListener("click",()=>{d()}),(A=document.querySelector(`#${t.prefix}-save-recipe`))==null||A.addEventListener("click",()=>{const T=n();if(!T)return;const J=c(T);Qs(t,T,J,r)&&b(t.prefix,"Current config saved to the local recipe library.","success")}),(D=document.querySelector(`#${t.prefix}-read-recipes`))==null||D.addEventListener("click",()=>{u()}),(X=document.querySelector(`#${t.prefix}-import-recipe`))==null||X.addEventListener("click",()=>{var T;(T=document.querySelector(`#${t.prefix}-recipe-file-input`))==null||T.click()}),(Re=document.querySelector(`#${t.prefix}-load-presets`))==null||Re.addEventListener("click",()=>{m()}),an(t,n,c,o),sn(t,d),nn(t,r,u),ln({config:t,getCurrentState:n,buildPreparedTrainingPayload:c,applyEditableRecord:o}),Ks(t),Js(t,n,c)}function dn(e,t){let a=null;const n=()=>{const r=B(e.routeId);Xs(e.prefix,r),document.querySelectorAll(`#${e.prefix}-history-panel [data-history-close]`).forEach(d=>{d.addEventListener("click",()=>S(e.prefix,"history",!1))}),document.querySelectorAll(`#${e.prefix}-history-panel [data-history-export]`).forEach(d=>{d.addEventListener("click",()=>{M(`${e.prefix}-history-${pe()}.json`,JSON.stringify(B(e.routeId),null,2),"application/json;charset=utf-8"),b(e.prefix,"History exported.","success")})}),document.querySelectorAll(`#${e.prefix}-history-panel [data-history-import]`).forEach(d=>{d.addEventListener("click",()=>{var u;(u=document.querySelector(`#${e.prefix}-history-file-input`))==null||u.click()})}),document.querySelectorAll(`#${e.prefix}-history-panel [data-history-apply]`).forEach(d=>{d.addEventListener("click",()=>{const u=Number(d.dataset.historyApply??"-1"),m=B(e.routeId)[u];m&&(t(m.value,m.gpu_ids,"replace"),S(e.prefix,"history",!1),b(e.prefix,`Applied snapshot: ${m.name||"Unnamed snapshot"}.`,"success"))})}),document.querySelectorAll(`#${e.prefix}-history-panel [data-history-rename]`).forEach(d=>{d.addEventListener("click",()=>{const u=Number(d.dataset.historyRename??"-1"),m=B(e.routeId),f=m[u];if(!f)return;const v=window.prompt("Rename snapshot",f.name||"");v&&(f.name=v.trim(),ee(e.routeId,m),n(),b(e.prefix,"Snapshot renamed.","success"))})}),document.querySelectorAll(`#${e.prefix}-history-panel [data-history-delete]`).forEach(d=>{d.addEventListener("click",()=>{const u=Number(d.dataset.historyDelete??"-1"),m=B(e.routeId),f=m[u];f&&window.confirm(`Delete snapshot "${f.name||"Unnamed snapshot"}"?`)&&(m.splice(u,1),ee(e.routeId,m),n(),b(e.prefix,"Snapshot deleted.","success"))})})},s=()=>{n(),S(e.prefix,"history",!0)},i=()=>{const r=E(e.routeId);Ws(e.prefix,r),document.querySelectorAll(`#${e.prefix}-recipes-panel [data-recipe-close]`).forEach(d=>{d.addEventListener("click",()=>S(e.prefix,"recipes",!1))}),document.querySelectorAll(`#${e.prefix}-recipes-panel [data-recipe-export-all]`).forEach(d=>{d.addEventListener("click",()=>{M(`${e.prefix}-recipes-${pe()}.json`,JSON.stringify(E(e.routeId),null,2),"application/json;charset=utf-8"),b(e.prefix,"Recipe library exported.","success")})}),document.querySelectorAll(`#${e.prefix}-recipes-panel [data-recipe-import]`).forEach(d=>{d.addEventListener("click",()=>{var u;(u=document.querySelector(`#${e.prefix}-recipe-file-input`))==null||u.click()})}),document.querySelectorAll(`#${e.prefix}-recipes-panel [data-recipe-merge]`).forEach(d=>{d.addEventListener("click",()=>{const u=Number(d.dataset.recipeMerge??"-1"),m=E(e.routeId)[u];m&&(t(m.value,void 0,"merge"),S(e.prefix,"recipes",!1),b(e.prefix,`Merged recipe: ${m.name}.`,"success"))})}),document.querySelectorAll(`#${e.prefix}-recipes-panel [data-recipe-replace]`).forEach(d=>{d.addEventListener("click",()=>{const u=Number(d.dataset.recipeReplace??"-1"),m=E(e.routeId)[u];m&&(t(m.value,void 0,"replace"),S(e.prefix,"recipes",!1),b(e.prefix,`Replaced current values with recipe: ${m.name}.`,"success"))})}),document.querySelectorAll(`#${e.prefix}-recipes-panel [data-recipe-export]`).forEach(d=>{d.addEventListener("click",()=>{const u=Number(d.dataset.recipeExport??"-1"),m=E(e.routeId)[u];m&&(M(`${m.name.replace(/[^0-9A-Za-z._-]+/g,"-")||"recipe"}-preset.toml`,ye({metadata:{name:m.name,version:"1.0",author:"SD-reScripts local recipe",train_type:m.train_type||e.schemaName,description:m.description||`Exported recipe from ${e.modelLabel}.`},data:m.value})),b(e.prefix,`Exported recipe: ${m.name}.`,"success"))})}),document.querySelectorAll(`#${e.prefix}-recipes-panel [data-recipe-rename]`).forEach(d=>{d.addEventListener("click",()=>{const u=Number(d.dataset.recipeRename??"-1"),m=E(e.routeId),f=m[u];if(!f)return;const v=window.prompt("Rename recipe",f.name);!v||!v.trim()||(f.name=v.trim(),V(e.routeId,m),i(),b(e.prefix,"Recipe renamed.","success"))})}),document.querySelectorAll(`#${e.prefix}-recipes-panel [data-recipe-delete]`).forEach(d=>{d.addEventListener("click",()=>{const u=Number(d.dataset.recipeDelete??"-1"),m=E(e.routeId),f=m[u];f&&window.confirm(`Delete recipe "${f.name}"?`)&&(m.splice(u,1),V(e.routeId,m),i(),b(e.prefix,"Recipe deleted.","success"))})})},o=()=>{i(),S(e.prefix,"recipes",!0)},c=()=>{Vs(e.prefix,a??[]),document.querySelectorAll(`#${e.prefix}-presets-panel [data-preset-close]`).forEach(r=>{r.addEventListener("click",()=>S(e.prefix,"presets",!1))}),document.querySelectorAll(`#${e.prefix}-presets-panel [data-preset-merge]`).forEach(r=>{r.addEventListener("click",()=>{const d=Number(r.dataset.presetMerge??"-1"),u=a==null?void 0:a[d];if(!u)return;const m=u.data??{};t(m,void 0,"merge"),S(e.prefix,"presets",!1),b(e.prefix,`Merged preset: ${String((u.metadata??{}).name||u.name||"preset")}.`,"success")})}),document.querySelectorAll(`#${e.prefix}-presets-panel [data-preset-save-recipe]`).forEach(r=>{r.addEventListener("click",()=>{var k;const d=Number(r.dataset.presetSaveRecipe??"-1"),u=a==null?void 0:a[d];if(!u)return;const m=u.metadata??{},f=u.data??{},v=E(e.routeId);v.unshift({created_at:new Date().toLocaleString(),name:String(m.name||u.name||"Imported preset recipe"),description:typeof m.description=="string"?m.description:void 0,train_type:typeof m.train_type=="string"?m.train_type:e.schemaName,route_id:e.routeId,value:JSON.parse(JSON.stringify(f))}),V(e.routeId,v.slice(0,60)),(k=document.querySelector(`#${e.prefix}-recipes-panel`))!=null&&k.hidden||i(),b(e.prefix,`Saved preset to local recipe library: ${String(m.name||u.name||"preset")}.`,"success")})}),document.querySelectorAll(`#${e.prefix}-presets-panel [data-preset-replace]`).forEach(r=>{r.addEventListener("click",()=>{const d=Number(r.dataset.presetReplace??"-1"),u=a==null?void 0:a[d];if(!u)return;const m=u.data??{};t(m,void 0,"replace"),S(e.prefix,"presets",!1),b(e.prefix,`Replaced current values with preset: ${String((u.metadata??{}).name||u.name||"preset")}.`,"success")})})};return{bindHistoryPanel:n,bindRecipePanel:i,openHistoryPanel:s,openRecipePanel:o,openPresetPanel:async()=>{var r;if(!a)try{const d=await tt();a=Gs(e,((r=d.data)==null?void 0:r.presets)??[])}catch(d){b(e.prefix,d instanceof Error?d.message:"Failed to load presets.","error");return}c(),S(e.prefix,"presets",!0)}}}async function un(e){var c,p,r,d;const t=Ga(e.prefix),[a,n]=await Promise.allSettled([_e(),st()]);if(n.status==="fulfilled"){const u=((c=n.value.data)==null?void 0:c.cards)??[],m=(p=n.value.data)==null?void 0:p.xformers;ws(`${e.prefix}-gpu-selector`,u),h(`${e.prefix}-runtime-title`,`${u.length} GPU entries reachable`),g(`${e.prefix}-runtime-body`,`
        <p>${l(ot(u))}</p>
        <p>${l(m?`xformers: ${m.installed?"installed":"missing"}, ${m.supported?"supported":"fallback"} (${m.reason})`:"xformers info unavailable")}</p>
      `)}else h(`${e.prefix}-runtime-title`,"GPU runtime request failed"),h(`${e.prefix}-runtime-body`,n.reason instanceof Error?n.reason.message:"Unknown error");if(a.status!=="fulfilled")return h(t.summaryId,`${e.modelLabel} schema request failed`),g(t.sectionsId,`<p>${a.reason instanceof Error?l(a.reason.message):"Unknown error"}</p>`),U(t.previewId,"{}"),L(e.prefix,"Schema unavailable",`The ${e.modelLabel} training bridge could not load the backend schema.`,"error"),null;const s=((r=a.value.data)==null?void 0:r.schemas)??[],i=ht(s),o=(d=re(i).find(u=>u.name===e.schemaName))==null?void 0:d.name;return o?{domIds:t,createDefaultState:()=>ae(i,o)}:(h(t.summaryId,`No ${e.schemaName} schema was returned.`),g(t.sectionsId,`<p>The backend did not expose ${l(e.schemaName)}.</p>`),L(e.prefix,"Schema missing",`The backend did not expose the ${e.schemaName} schema.`,"error"),null)}const et={};function pn(e,t){const a=ft(t),n=Ie(`${e}-gpu-selector`);n.length>0&&(a.gpu_ids=n);const s=Pe(a);return{payload:s,checks:Ms(s)}}function wt(e){return new Set(e.sections.flatMap(t=>t.fields.map(a=>a.path)))}function $t(e,t){const a=wt(e),n={...e.values};for(const[s,i]of Object.entries(t))a.has(s)&&(n[s]=i);return{...e,values:n}}function hn(e,t){return{...e,values:{...e.values,...Object.fromEntries(Object.entries(t).filter(([a])=>wt(e).has(a)))}}}function mn(e,t){return t&&t.length>0?t.map(a=>String(a)):Array.isArray(e.gpu_ids)?e.gpu_ids.map(a=>String(a)):[]}function gn(e,t){pa(e.routeId,{time:new Date().toLocaleString(),name:K(e,t),value:H(t.values),gpu_ids:Ie(`${e.prefix}-gpu-selector`)})}function fn(e){const{config:t,createDefaultState:a,mountTrainingState:n}=e,s=ua(t.routeId),i=s!=null&&s.value?$t(a(),xt(s.value)):a();(s==null?void 0:s.gpu_ids)!==void 0&&Ae(t.prefix,s.gpu_ids),n(i),s!=null&&s.value&&b(t.prefix,"Restored autosaved parameters for this route.","success")}function bn(e,t,a,n,s){return i=>{try{const o=a(i),c=Object.fromEntries(Object.entries(o.payload).sort(([p],[r])=>p.localeCompare(r)));U(t.previewId,JSON.stringify(c,null,2)),se(e.prefix,o.checks)}catch(o){U(t.previewId,"{}"),se(e.prefix,{warnings:[],errors:[]},o instanceof Error?o.message:"The current state could not be converted into a launch payload.")}n(i),s==null||s()}}function yn(e,t,a){const n=()=>et[e.routeId],s=r=>pn(e.prefix,r),i=bn(e,t,s,r=>gn(e,r),()=>ie(e.prefix)),o=r=>{G(r,t,d=>{et[e.routeId]=d},i)};return{getCurrentState:n,prepareTrainingPayload:s,onStateChange:i,mountTrainingState:o,applyEditableRecord:(r,d,u="replace")=>{const m=u==="merge"?n()??a():a(),f=xt(r),v=u==="merge"?hn(m,f):$t(m,f);Ae(e.prefix,mn(f,d)),o(v)},restoreAutosave:()=>fn({config:e,createDefaultState:a,mountTrainingState:o})}}async function vn(e){const t=await un(e);if(!t)return;const a=yn(e,t.domIds,t.createDefaultState),n=dn(e,a.applyEditableRecord);a.restoreAutosave(),cn({config:e,createDefaultState:t.createDefaultState,getCurrentState:a.getCurrentState,mountTrainingState:a.mountTrainingState,onStateChange:a.onStateChange,applyEditableRecord:a.applyEditableRecord,buildPreparedTrainingPayload:a.prepareTrainingPayload,bindHistoryPanel:n.bindHistoryPanel,bindRecipePanel:n.bindRecipePanel,openHistoryPanel:n.openHistoryPanel,openRecipePanel:n.openRecipePanel,openPresetPanel:n.openPresetPanel}),L(e.prefix,`${e.modelLabel} bridge ready`,"You can review the generated payload and submit the current config to /api/run.","success"),S(e.prefix,"history",!1),S(e.prefix,"recipes",!1),S(e.prefix,"presets",!1)}const kn={overview:bt,about:Ya,settings:fs,tasks:ys,tageditor:bs,tensorboard:vs,tools:ks,"schema-bridge":os,"sdxl-train":gs,"flux-train":ss,"sd3-train":cs,"sd3-finetune-train":ls,"dreambooth-train":es,"flux-finetune-train":as,"sd-controlnet-train":ds,"sdxl-controlnet-train":ps,"flux-controlnet-train":ts,"sdxl-lllite-train":hs,"sd-ti-train":us,"xti-train":xs,"sdxl-ti-train":ms,"anima-train":Qa,"anima-finetune-train":Za,"lumina-train":rs,"lumina-finetune-train":is,"hunyuan-image-train":ns};function _n(e){const t={overview:j.filter(a=>a.section==="overview"),phase1:j.filter(a=>a.section==="phase1"),reference:j.filter(a=>a.section==="reference")};return`
    <div class="nav-group">
      <p class="nav-heading">Workspace</p>
      ${t.overview.map(a=>ue(a.hash,a.label,a.description,e)).join("")}
    </div>
    <div class="nav-group">
      <p class="nav-heading">Phase 1 Pages</p>
      ${t.phase1.map(a=>ue(a.hash,a.label,a.description,e)).join("")}
    </div>
    <div class="nav-group">
      <p class="nav-heading">Core Bridge</p>
      ${t.reference.map(a=>ue(a.hash,a.label,a.description,e)).join("")}
    </div>
  `}function ue(e,t,a,n){return`
    <a class="nav-link ${e===n?"is-active":""}" href="${e}">
      <span>${t}</span>
      <small>${a}</small>
    </a>
  `}async function xn(e){e==="overview"?await ha():e==="settings"?await fa():e==="tasks"?await Na():e==="tageditor"?await va():e==="tools"?await ka():e==="schema-bridge"?await Ka(()=>{}):he[e]&&await vn(he[e])}async function wn(e){da();const t=ca(),a=kn[t.id]??bt;e.innerHTML=Ja(t.hash,a());const n=document.querySelector("#side-nav");n&&(n.innerHTML=_n(t.hash)),await xn(t.id)}const St=document.querySelector("#app");if(!(St instanceof HTMLElement))throw new Error("App root not found.");const $n=St;async function Tt(){await wn($n)}window.addEventListener("hashchange",()=>{Tt()});Tt();
