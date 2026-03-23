var na=Object.defineProperty;var sa=(e,t,a)=>t in e?na(e,t,{enumerable:!0,configurable:!0,writable:!0,value:a}):e[t]=a;var L=(e,t,a)=>sa(e,typeof t!="symbol"?t+"":t,a);(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))n(i);new MutationObserver(i=>{for(const s of i)if(s.type==="childList")for(const r of s.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&n(r)}).observe(document,{childList:!0,subtree:!0});function a(i){const s={};return i.integrity&&(s.integrity=i.integrity),i.referrerPolicy&&(s.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?s.credentials="include":i.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function n(i){if(i.ep)return;i.ep=!0;const s=a(i);fetch(i.href,s)}})();const qe="".replace(/\/$/,"");async function C(e){const t=await fetch(`${qe}${e}`,{headers:{Accept:"application/json"}});if(!t.ok)throw new Error(`${t.status} ${t.statusText}`);return await t.json()}async function D(e,t){const a=await fetch(`${qe}${e}`,{method:"POST",headers:{Accept:"application/json","Content-Type":"application/json"},body:JSON.stringify(t)});if(!a.ok)throw new Error(`${a.status} ${a.statusText}`);return await a.json()}async function ra(e){const t=await fetch(`${qe}${e}`,{headers:{Accept:"application/json"}});if(!t.ok)throw new Error(`${t.status} ${t.statusText}`);return await t.json()}async function oa(){return C("/api/schemas/hashes")}async function ze(){return C("/api/schemas/all")}async function xt(){return C("/api/presets")}async function la(){return C("/api/config/saved_params")}async function ca(){return C("/api/config/summary")}async function Oe(){return C("/api/tasks")}async function St(e){return C(`/api/tasks/terminate/${e}`)}async function Fe(){return C("/api/graphic_cards")}async function Tt(){return ra("/api/tageditor_status")}async function ua(){return C("/api/scripts")}async function da(e){return D("/api/dataset/analyze",e)}async function pa(e){return D("/api/dataset/masked_loss_audit",e)}async function ha(){return C("/api/interrogators")}async function U(e){var a;const t=await C(`/api/pick_file?picker_type=${encodeURIComponent(e)}`);if(t.status!=="success"||!((a=t.data)!=null&&a.path))throw new Error(t.message||"File picker did not return a path.");return t.data.path}async function ma(e){return D("/api/interrogate",e)}async function ga(e){return D("/api/captions/cleanup/preview",e)}async function fa(e){return D("/api/captions/cleanup/apply",e)}async function ba(e){return D("/api/captions/backups/create",e)}async function ya(e){return D("/api/captions/backups/list",e)}async function va(e){return D("/api/captions/backups/restore",e)}async function _a(e){return D("/api/run",e)}async function ka(e){return D("/api/train/preflight",e)}async function $a(e){return D("/api/train/sample_prompt",e)}function h(e,t){const a=document.querySelector(`#${e}`);a&&(a.textContent=t)}function f(e,t){const a=document.querySelector(`#${e}`);a&&(a.innerHTML=t)}function Y(e,t){const a=document.querySelector(`#${e}`);a&&(a.textContent=t)}const Lt=[{route:"index.html",title:"SD-reScripts | SD training UI",section:"core",status:"migrate-first",notes:"Landing page and main navigation entry. Good first candidate for source migration."},{route:"lora/index.html",title:"LoRA training index",section:"training",status:"migrate-first",notes:"Top-level training model selector page.",schemaHints:["shared"]},{route:"lora/sdxl.html",title:"SDXL LoRA training",section:"training",status:"migrate-first",notes:"Primary training page currently used most often.",schemaHints:["sdxl-lora","shared"]},{route:"lora/flux.html",title:"Flux LoRA training",section:"training",status:"migrate-first",notes:"Now mirrored by the shared source-side training bridge.",schemaHints:["flux-lora","shared"]},{route:"lora/sd3.html",title:"SD3 training",section:"training",status:"migrate-first",notes:"Now mirrored by the shared source-side training bridge.",schemaHints:["sd3-lora","shared"]},{route:"lora/controlnet.html",title:"SD ControlNet training",section:"training",status:"migrate-first",notes:"Now mirrored by the shared source-side training bridge.",schemaHints:["sd-controlnet","shared"]},{route:"lora/sdxl-controlnet.html",title:"SDXL ControlNet training",section:"training",status:"migrate-first",notes:"Now mirrored by the shared source-side training bridge.",schemaHints:["sdxl-controlnet","shared"]},{route:"lora/sdxl-lllite.html",title:"SDXL LLLite training",section:"training",status:"migrate-first",notes:"Specialized SDXL conditioning route now mirrored by the shared source-side bridge.",schemaHints:["sdxl-controlnet-lllite","shared"]},{route:"lora/flux-controlnet.html",title:"Flux ControlNet training",section:"training",status:"migrate-first",notes:"Now mirrored by the shared source-side training bridge.",schemaHints:["flux-controlnet","shared"]},{route:"lora/basic.html",title:"LoRA basic mode",section:"training",status:"legacy-dist",notes:"Legacy beginner-mode training route.",schemaHints:["lora-basic","shared"]},{route:"lora/master.html",title:"LoRA expert mode",section:"training",status:"legacy-dist",notes:"Legacy expert-mode training route.",schemaHints:["lora-master","shared"]},{route:"lora/params.html",title:"Training parameter reference",section:"training",status:"migrate-first",notes:"Mostly explanatory UI. Lower risk to recreate cleanly."},{route:"lora/tools.html",title:"LoRA tools",section:"tools",status:"migrate-first",notes:"Tool launcher route for merge, resize, interrogate and conversion flows."},{route:"dreambooth/index.html",title:"Dreambooth training",section:"training",status:"migrate-first",notes:"Now mirrored by the shared source-side training bridge for Dreambooth and SDXL full finetune.",schemaHints:["dreambooth","shared"]},{route:"tagger.html",title:"Tagger tool",section:"tools",status:"migrate-first",notes:"Standalone caption/tag generation route that talks to backend APIs.",schemaHints:["tagger"]},{route:"tageditor.html",title:"Tag editor proxy page",section:"tools",status:"migrate-first",notes:"Wrapper page with progress/failure states. Good candidate to reimplement cleanly."},{route:"task.html",title:"Task monitor",section:"system",status:"migrate-first",notes:"Task status page backed by /api/tasks."},{route:"tensorboard.html",title:"TensorBoard proxy page",section:"system",status:"migrate-first",notes:"Wrapper/proxy page. Safer than schema-heavy form routes."},{route:"other/settings.html",title:"Settings page",section:"system",status:"migrate-first",notes:"Static/system page that should be easy to recreate in source form."},{route:"other/about.html",title:"About page",section:"core",status:"migrate-first",notes:"Mostly branding and release notes. Best low-risk migration target."},{route:"404.html",title:"Fallback page",section:"core",status:"legacy-dist",notes:"Can be replaced after the main router is rebuilt."}];function o(e){return String(e).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;")}function W(e){return JSON.parse(JSON.stringify(e))}function Te(e=new Date){return e.toISOString().replaceAll(":","-").replaceAll(".","-")}function wa(e){if(e.length===0){f("schema-browser","<p>No schemas returned.</p>");return}const t=e.map(a=>{var i;const n=((i=a.schema.split(/\r?\n/).find(s=>s.trim().length>0))==null?void 0:i.trim())||"No preview available.";return`
        <article class="schema-card">
          <div class="schema-head">
            <h3>${o(a.name)}</h3>
            <span class="schema-hash">${o(a.hash.slice(0,8))}</span>
          </div>
          <p>${o(n)}</p>
        </article>
      `}).join("");f("schema-browser",t)}function xa(e){const t=new Set(Lt.flatMap(s=>s.schemaHints??[])),a=new Set(e.map(s=>s.name)),n=[...t].filter(s=>a.has(s)).sort(),i=e.map(s=>s.name).filter(s=>!t.has(s)).sort();f("schema-mapped",n.length?n.map(s=>`<span class="coverage-pill">${o(s)}</span>`).join(""):"<p>No mapped schema hints yet.</p>"),f("schema-unmapped",i.length?i.map(s=>`<span class="coverage-pill coverage-pill-muted">${o(s)}</span>`).join(""):"<p>All schemas are represented in the current route hints.</p>")}function Sa(e){if(!e.length){f("training-catalog","<p>No training routes were registered.</p>");return}const t=e.length,a=e.filter(l=>l.schemaAvailable).length,n=e.filter(l=>l.presetCount>0).length,i=e.filter(l=>l.localHistoryCount>0).length,s=e.filter(l=>l.localRecipeCount>0).length,r=e.filter(l=>l.autosaveReady).length,c=new Map,p=new Map;for(const l of e){c.set(l.family,(c.get(l.family)??0)+1);for(const g of l.capabilities)p.set(g,(p.get(g)??0)+1)}const u=`
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
        <span class="metric-label">History-covered</span>
        <strong class="dataset-analysis-stat-value">${i}</strong>
      </article>
      <article class="dataset-analysis-stat">
        <span class="metric-label">Autosave-ready</span>
        <strong class="dataset-analysis-stat-value">${r}</strong>
      </article>
      <article class="dataset-analysis-stat">
        <span class="metric-label">Families</span>
        <strong class="dataset-analysis-stat-value">${c.size}</strong>
      </article>
    </section>
    <div class="coverage-list training-catalog-capabilities">
      ${[...p.entries()].sort((l,g)=>g[1]-l[1]||l[0].localeCompare(g[0])).map(([l,g])=>`<span class="coverage-pill">${o(l)} <strong>${g}</strong></span>`).join("")}
    </div>
  `,d=e.map(l=>`
        <article class="training-catalog-card" data-family="${o(l.family)}">
          <div class="training-catalog-head">
            <div>
              <p class="panel-kicker">${o(l.family)}</p>
              <h3>${o(l.title)}</h3>
            </div>
            <a class="text-link" href="${o(l.routeHash)}">Open</a>
          </div>
          <p class="training-catalog-route"><code>${o(l.routeHash)}</code></p>
          <p class="training-catalog-meta">
            Schema: <code>${o(l.schemaName)}</code>
            · Model: <strong>${o(l.modelLabel)}</strong>
          </p>
          <div class="coverage-list">
            <span class="coverage-pill ${l.schemaAvailable?"":"coverage-pill-muted"}">${l.schemaAvailable?"schema ok":"schema missing"}</span>
            <span class="coverage-pill ${l.presetCount>0?"":"coverage-pill-muted"}">${l.presetCount} presets</span>
            <span class="coverage-pill ${l.localHistoryCount>0?"":"coverage-pill-muted"}">${l.localHistoryCount} history</span>
            <span class="coverage-pill ${l.localRecipeCount>0?"":"coverage-pill-muted"}">${l.localRecipeCount} recipes</span>
            <span class="coverage-pill ${l.autosaveReady?"":"coverage-pill-muted"}">${l.autosaveReady?"autosave ready":"no autosave"}</span>
          </div>
          <div class="coverage-list training-catalog-capability-row">
            ${l.capabilities.map(g=>`<span class="coverage-pill coverage-pill-muted">${o(g)}</span>`).join("")}
          </div>
        </article>
      `).join("");f("training-catalog",`
      ${u}
      <div class="training-catalog-grid">${d}</div>
    `)}function Ta(e){if(e.length===0){f("task-table-container","<p>No tasks currently tracked.</p>");return}const t=e.map(a=>`
        <tr>
          <td><code>${o(a.id??a.task_id??"unknown")}</code></td>
          <td>${o(a.status??"unknown")}</td>
          <td>
            <button class="action-button action-button-small" data-task-terminate="${o(a.id??a.task_id??"")}" type="button">
              Terminate
            </button>
          </td>
        </tr>
      `).join("");f("task-table-container",`
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
    `)}function La(e){if(e.length===0){f("tools-browser","<p>No scripts returned.</p>");return}const t=e.map(a=>`
        <article class="tool-card">
          <div class="tool-card-head">
            <h3>${o(a.name)}</h3>
            <span class="coverage-pill ${a.category==="networks"?"":"coverage-pill-muted"}">${o(a.category)}</span>
          </div>
          <p>${a.positional_args.length>0?`Positional args: ${a.positional_args.map(n=>`<code>${o(n)}</code>`).join(", ")}`:"No positional args required."}</p>
        </article>
      `).join("");f("tools-browser",t)}function Aa(e){const t=[{label:"Images",value:e.summary.image_count},{label:"Effective images",value:e.summary.effective_image_count},{label:"Alpha-capable candidates",value:e.summary.alpha_capable_image_count},{label:"Caption coverage",value:ce(e.summary.caption_coverage)},{label:"Unique tags",value:e.summary.unique_tag_count},{label:"Caption files",value:e.summary.caption_file_count},{label:"Avg tags / caption",value:e.summary.average_tags_per_caption.toFixed(2)}],a=e.warnings.length?`
      <article class="dataset-analysis-block dataset-analysis-warning">
        <p class="panel-kicker">warnings</p>
        <ul class="dataset-analysis-list-plain">
          ${e.warnings.map(i=>`<li>${o(i)}</li>`).join("")}
        </ul>
      </article>
    `:"",n=e.folders.length?e.folders.map(i=>`
            <article class="dataset-analysis-block">
              <div class="tool-card-head">
                <h3>${o(i.name)}</h3>
                <span class="coverage-pill ${i.caption_coverage>=1?"":"coverage-pill-muted"}">
                  ${ce(i.caption_coverage)}
                </span>
              </div>
              <p><code>${o(i.path)}</code></p>
              <p>
                Images: <strong>${i.image_count}</strong>
                · Effective: <strong>${i.effective_image_count}</strong>
                · Repeats: <strong>${i.repeats??1}</strong>
              </p>
              <p>Alpha-capable candidates: <strong>${i.alpha_capable_image_count}</strong></p>
              <p>
                Missing captions: <strong>${i.missing_caption_count}</strong>
                · Orphan captions: <strong>${i.orphan_caption_count}</strong>
                · Empty captions: <strong>${i.empty_caption_count}</strong>
              </p>
            </article>
          `).join(""):"<p>No dataset folder summary returned.</p>";f("dataset-analysis-results",`
      ${a}
      <section class="dataset-analysis-grid">
        ${t.map(i=>`
              <article class="dataset-analysis-stat">
                <span class="metric-label">${o(i.label)}</span>
                <strong class="dataset-analysis-stat-value">${o(i.value)}</strong>
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
          ${At(e.top_tags,"No caption tags found yet.")}
        </article>
        <article class="dataset-analysis-block">
          <p class="panel-kicker">images</p>
          <h3>Top resolutions</h3>
          ${ke(e.top_resolutions,"No resolution data collected.")}
        </article>
        <article class="dataset-analysis-block">
          <p class="panel-kicker">mix</p>
          <h3>Orientation + formats</h3>
          <div>${ke(e.orientation_counts,"No orientation data.")}</div>
          <div class="dataset-analysis-sublist">${ke(e.image_extensions,"No image extension data.")}</div>
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
            ${R(e.samples.images_without_caption,"No missing-caption samples.")}
          </div>
          <div class="dataset-analysis-sublist">
            <h4>Orphan captions</h4>
            ${R(e.samples.orphan_captions,"No orphan-caption samples.")}
          </div>
          <div class="dataset-analysis-sublist">
            <h4>Broken images</h4>
            ${R(e.samples.broken_images,"No broken-image samples.")}
          </div>
        </article>
      </section>
    `)}function Ea(e,t="masked-loss-audit-results"){const a=[{label:"Images",value:e.summary.image_count},{label:"Alpha channel images",value:e.summary.alpha_channel_image_count},{label:"Usable masks",value:e.summary.usable_mask_image_count},{label:"Soft alpha masks",value:e.summary.soft_alpha_image_count},{label:"Binary alpha masks",value:e.summary.binary_alpha_image_count},{label:"Avg masked area",value:ce(e.summary.average_mask_coverage)},{label:"Avg alpha weight",value:ce(e.summary.average_alpha_weight)}],n=e.warnings.length?`
      <article class="dataset-analysis-block dataset-analysis-warning">
        <p class="panel-kicker">warnings</p>
        <ul class="dataset-analysis-list-plain">
          ${e.warnings.map(i=>`<li>${o(i)}</li>`).join("")}
        </ul>
      </article>
    `:"";f(t,`
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
            ${e.guidance.map(i=>`<li>${o(i)}</li>`).join("")}
          </ul>
        </article>
      </section>
      <section class="dataset-analysis-columns">
        <article class="dataset-analysis-block">
          <p class="panel-kicker">samples</p>
          <h3>Usable mask files</h3>
          ${R(e.samples.usable_masks,"No usable alpha-mask samples were found.")}
        </article>
        <article class="dataset-analysis-block">
          <p class="panel-kicker">samples</p>
          <h3>Soft alpha files</h3>
          ${R(e.samples.soft_alpha_masks,"No soft alpha-mask samples were found.")}
        </article>
        <article class="dataset-analysis-block">
          <p class="panel-kicker">samples</p>
          <h3>Opaque alpha files</h3>
          ${R(e.samples.fully_opaque_alpha,"No fully opaque alpha-channel samples were found.")}
        </article>
        <article class="dataset-analysis-block">
          <p class="panel-kicker">samples</p>
          <h3>No alpha files</h3>
          ${R(e.samples.no_alpha,"No non-alpha samples were captured.")}
        </article>
      </section>
    `)}function Ia(e,t="caption-cleanup-results"){const a=[{label:"Caption files",value:e.summary.file_count},{label:"Changed",value:e.summary.changed_file_count},{label:"Unchanged",value:e.summary.unchanged_file_count},{label:"Tag instances removed",value:e.summary.removed_tag_instances},{label:"Tag instances added",value:e.summary.added_tag_instances},{label:"Empty results",value:e.summary.empty_result_count}],n=e.warnings.length?`
      <article class="dataset-analysis-block dataset-analysis-warning">
        <p class="panel-kicker">warnings</p>
        <ul class="dataset-analysis-list-plain">
          ${e.warnings.map(s=>`<li>${o(s)}</li>`).join("")}
        </ul>
      </article>
    `:"",i=e.samples.length?e.samples.map(s=>`
            <article class="dataset-analysis-block">
              <div class="tool-card-head">
                <h3>${o(s.path)}</h3>
                <span class="coverage-pill ${s.before!==s.after?"":"coverage-pill-muted"}">
                  ${s.before_count} -> ${s.after_count}
                </span>
              </div>
              <div class="dataset-cleanup-diff">
                <div>
                  <p class="panel-kicker">before</p>
                  <pre>${o(s.before||"(empty)")}</pre>
                </div>
                <div>
                  <p class="panel-kicker">after</p>
                  <pre>${o(s.after||"(empty)")}</pre>
                </div>
              </div>
              <div class="dataset-analysis-sublist">
                <h4>Removed tags</h4>
                ${R(s.removed_tags,"No explicit tag removals in sample.")}
              </div>
              <div class="dataset-analysis-sublist">
                <h4>Added tags</h4>
                ${R(s.added_tags,"No explicit tag additions in sample.")}
              </div>
            </article>
          `).join(""):"<p>No sample caption changes were captured.</p>";f(t,`
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
          ${At([e.options.dedupe_tags?{name:"dedupe tags",count:1}:null,e.options.sort_tags?{name:"sort tags",count:1}:null,e.options.use_regex?{name:"regex replace",count:1}:null].filter(Boolean),"No boolean cleanup switches enabled.")}
          <div class="dataset-analysis-sublist">
            <h4>Remove tags</h4>
            ${R(e.options.remove_tags,"No exact tags configured for removal.")}
          </div>
          <div class="dataset-analysis-sublist">
            <h4>Prepend tags</h4>
            ${R(e.options.prepend_tags,"No prepend tags configured.")}
          </div>
          <div class="dataset-analysis-sublist">
            <h4>Append tags</h4>
            ${R(e.options.append_tags,"No append tags configured.")}
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
          <div class="dataset-analysis-stack">${i}</div>
        </article>
      </section>
    `)}function Pa(e,t,a="caption-backup-results"){if(!e.length){f(a,`
        <article class="dataset-analysis-block">
          <p class="panel-kicker">snapshots</p>
          <h3>No caption snapshots found</h3>
          <p>Create the first backup for this folder to get a restore point before cleanup or tagging.</p>
        </article>
      `);return}const n=e.map(i=>`
        <article class="dataset-analysis-block ${i.archive_name===t?"dataset-analysis-selected":""}">
          <div class="tool-card-head">
            <h3>${o(i.snapshot_name)}</h3>
            <span class="coverage-pill ${i.archive_name===t?"":"coverage-pill-muted"}">
              ${o(i.archive_name)}
            </span>
          </div>
          <p><code>${o(i.source_root)}</code></p>
          <p>Created: <strong>${o(i.created_at||"unknown")}</strong></p>
          <p>Caption files: <strong>${i.file_count}</strong> · Archive size: <strong>${Na(i.archive_size)}</strong></p>
          <p>Extension: <code>${o(i.caption_extension||".txt")}</code> · Recursive: <strong>${i.recursive?"yes":"no"}</strong></p>
        </article>
      `).join("");f(a,`<div class="dataset-analysis-stack">${n}</div>`)}function Ra(e,t="caption-backup-results"){const a=e.warnings.length?`
      <article class="dataset-analysis-block dataset-analysis-warning">
        <p class="panel-kicker">warnings</p>
        <ul class="dataset-analysis-list-plain">
          ${e.warnings.map(n=>`<li>${o(n)}</li>`).join("")}
        </ul>
      </article>
    `:"";f(t,`
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
    `)}function At(e,t){return e.length?`
    <div class="coverage-list">
      ${e.map(a=>`<span class="coverage-pill">${o(a.name)} <strong>${a.count}</strong></span>`).join("")}
    </div>
  `:`<p>${o(t)}</p>`}function ke(e,t){return e.length?`
    <ul class="dataset-analysis-list-plain">
      ${e.map(a=>`<li><code>${o(a.name)}</code> <strong>${a.count}</strong></li>`).join("")}
    </ul>
  `:`<p>${o(t)}</p>`}function R(e,t){return e.length?`
    <ul class="dataset-analysis-list-plain">
      ${e.map(a=>`<li><code>${o(a)}</code></li>`).join("")}
    </ul>
  `:`<p>${o(t)}</p>`}function ce(e){return`${(e*100).toFixed(1)}%`}function Na(e){return e<1024?`${e} B`:e<1024**2?`${(e/1024).toFixed(1)} KB`:e<1024**3?`${(e/1024**2).toFixed(1)} MB`:`${(e/1024**3).toFixed(2)} GB`}function Ca(e){return typeof e=="object"&&e!==null}function Et(e){return e.length===0?"No cards reported yet.":e.map((t,a)=>Ca(t)?`GPU ${t.index??t.id??a}: ${t.name}`:t).join(" | ")}function Da(e){if(e.length===0)return"No tasks currently tracked.";const t=e.filter(a=>a.status&&!["FINISHED","TERMINATED","FAILED"].includes(String(a.status))).length;return`${e.length} tracked, ${t} active`}function Ba(e){var a;const t=(a=e.detail)==null?void 0:a.trim();return t?`${e.status} - ${t}`:e.status}const H="#/workspace",G=[{id:"overview",label:"Workspace",section:"overview",hash:H,description:"Source migration dashboard and live backend diagnostics."},{id:"about",label:"About",section:"phase1",hash:"#/about",description:"Rebuild branding and release notes in source form."},{id:"settings",label:"Settings",section:"phase1",hash:"#/settings",description:"Read config summary and saved parameter state from the backend."},{id:"tasks",label:"Tasks",section:"phase1",hash:"#/tasks",description:"Inspect and manage task execution state."},{id:"tageditor",label:"Tag Editor",section:"phase1",hash:"#/tageditor",description:"Track startup status and future proxy behavior."},{id:"tensorboard",label:"TensorBoard",section:"phase1",hash:"#/tensorboard",description:"Prepare a cleaner source-side wrapper for TensorBoard access."},{id:"tools",label:"Tools",section:"phase1",hash:"#/tools",description:"Migrate script-launch and utility entry points from the legacy tools page."},{id:"schema-bridge",label:"Schema Bridge",section:"reference",hash:"#/schema-bridge",description:"Evaluate current schema DSL into a source-side explorer and prototype form renderer."},{id:"sdxl-train",label:"SDXL Train",section:"reference",hash:"#/sdxl-train",description:"First source-side training page powered by the schema bridge and current `/api/run` backend."},{id:"flux-train",label:"Flux Train",section:"reference",hash:"#/flux-train",description:"Source-side Flux LoRA training route built on the shared schema bridge and launch pipeline."},{id:"sd3-train",label:"SD3 Train",section:"reference",hash:"#/sd3-train",description:"Source-side SD3 LoRA training route using the same normalized payload workflow."},{id:"sd3-finetune-train",label:"SD3 Finetune",section:"reference",hash:"#/sd3-finetune-train",description:"Source-side SD3 finetune route on the shared training bridge."},{id:"dreambooth-train",label:"Dreambooth",section:"reference",hash:"#/dreambooth-train",description:"Source-side Dreambooth and SDXL full-finetune route on the shared schema bridge."},{id:"flux-finetune-train",label:"Flux Finetune",section:"reference",hash:"#/flux-finetune-train",description:"Source-side Flux full-finetune route using the shared launch workflow."},{id:"sd-controlnet-train",label:"SD ControlNet",section:"reference",hash:"#/sd-controlnet-train",description:"Source-side SD ControlNet training route using the shared launch flow."},{id:"sdxl-controlnet-train",label:"SDXL ControlNet",section:"reference",hash:"#/sdxl-controlnet-train",description:"Source-side SDXL ControlNet training route using the shared launch flow."},{id:"flux-controlnet-train",label:"Flux ControlNet",section:"reference",hash:"#/flux-controlnet-train",description:"Source-side Flux ControlNet training route using the shared launch flow."},{id:"sdxl-lllite-train",label:"SDXL LLLite",section:"reference",hash:"#/sdxl-lllite-train",description:"Source-side SDXL ControlNet-LLLite training route on the shared training bridge."},{id:"sd-ti-train",label:"SD TI",section:"reference",hash:"#/sd-ti-train",description:"Source-side SD textual inversion route on the shared training bridge."},{id:"xti-train",label:"SD XTI",section:"reference",hash:"#/xti-train",description:"Source-side SD XTI textual inversion route on the shared training bridge."},{id:"sdxl-ti-train",label:"SDXL TI",section:"reference",hash:"#/sdxl-ti-train",description:"Source-side SDXL textual inversion route on the shared training bridge."},{id:"anima-train",label:"Anima LoRA",section:"reference",hash:"#/anima-train",description:"Source-side Anima LoRA training route using the shared launch flow."},{id:"anima-finetune-train",label:"Anima Finetune",section:"reference",hash:"#/anima-finetune-train",description:"Source-side Anima finetune route using the shared launch flow."},{id:"lumina-train",label:"Lumina LoRA",section:"reference",hash:"#/lumina-train",description:"Source-side Lumina LoRA training route using the shared launch flow."},{id:"lumina-finetune-train",label:"Lumina Finetune",section:"reference",hash:"#/lumina-finetune-train",description:"Source-side Lumina finetune route using the shared launch flow."},{id:"hunyuan-image-train",label:"Hunyuan Image",section:"reference",hash:"#/hunyuan-image-train",description:"Source-side Hunyuan Image LoRA training route using the shared launch flow."}],It=new Set(G.map(e=>e.hash)),Pt={"/index.html":H,"/index.md":H,"/404.html":H,"/404.md":H,"/task.html":"#/tasks","/task.md":"#/tasks","/tageditor.html":"#/tageditor","/tageditor.md":"#/tageditor","/tagger.html":"#/tageditor","/tagger.md":"#/tageditor","/tensorboard.html":"#/tensorboard","/tensorboard.md":"#/tensorboard","/other/about.html":"#/about","/other/about.md":"#/about","/other/settings.html":"#/settings","/other/settings.md":"#/settings","/dreambooth/index.html":"#/dreambooth-train","/dreambooth/index.md":"#/dreambooth-train","/lora/index.html":"#/sdxl-train","/lora/index.md":"#/sdxl-train"},qa=Object.keys(Pt).sort((e,t)=>t.length-e.length);function je(e){const t=e.replace(/\/+$/,"");return t.length>0?`${t}/`:"/"}function za(e){switch(e){case"flux":return"#/flux-train";case"flux-finetune":return"#/flux-finetune-train";case"sd3":return"#/sd3-train";case"sd3-finetune":return"#/sd3-finetune-train";case"controlnet":return"#/sd-controlnet-train";case"sdxl-controlnet":return"#/sdxl-controlnet-train";case"flux-controlnet":return"#/flux-controlnet-train";case"sdxl-lllite":return"#/sdxl-lllite-train";case"tools":return"#/tools";case"basic":case"master":case"params":case"sdxl":return"#/sdxl-train";case"sdxl-ti":return"#/sdxl-ti-train";case"ti":return"#/sd-ti-train";case"xti":return"#/xti-train";case"anima":return"#/anima-train";case"anima-finetune":return"#/anima-finetune-train";case"hunyuan":return"#/hunyuan-image-train";case"lumina":return"#/lumina-train";case"lumina-finetune":return"#/lumina-finetune-train";default:return null}}function Oa(e){const t=e.match(/^(.*)\/lora\/([^/]+)\.(?:html|md)$/i);if(!t)return null;const[,a,n]=t,i=za(n.toLowerCase());return i?{hash:i,canonicalRootPath:je(a)}:null}function Fa(e){const t=e.toLowerCase();for(const a of qa)if(t.endsWith(a))return{hash:Pt[a],canonicalRootPath:je(e.slice(0,e.length-a.length))};return Oa(e)}function et(e,t){const a=`${e}${window.location.search}${t}`,n=`${window.location.pathname}${window.location.search}${window.location.hash}`;a!==n&&window.history.replaceState(null,"",a)}function ja(){const e=It.has(window.location.hash)?window.location.hash:H;return G.find(t=>t.hash===e)??G[0]}function Ma(){if(It.has(window.location.hash))return;const e=Fa(window.location.pathname);if(e){et(e.canonicalRootPath,e.hash);return}et(je(window.location.pathname||"/"),H)}const Le={"sdxl-train":{routeId:"sdxl-train",schemaName:"sdxl-lora",prefix:"sdxl",modelLabel:"SDXL",presetTrainTypes:["sdxl-lora"]},"flux-train":{routeId:"flux-train",schemaName:"flux-lora",prefix:"flux",modelLabel:"Flux",presetTrainTypes:["flux-lora"]},"sd3-train":{routeId:"sd3-train",schemaName:"sd3-lora",prefix:"sd3",modelLabel:"SD3",presetTrainTypes:["sd3-lora"]},"sd3-finetune-train":{routeId:"sd3-finetune-train",schemaName:"sd3-finetune",prefix:"sd3-finetune",modelLabel:"SD3 Finetune",presetTrainTypes:["sd3-finetune"]},"dreambooth-train":{routeId:"dreambooth-train",schemaName:"dreambooth",prefix:"dreambooth",modelLabel:"Dreambooth",presetTrainTypes:["dreambooth","sd-dreambooth","sdxl-finetune"]},"flux-finetune-train":{routeId:"flux-finetune-train",schemaName:"flux-finetune",prefix:"flux-finetune",modelLabel:"Flux Finetune",presetTrainTypes:["flux-finetune"]},"sd-controlnet-train":{routeId:"sd-controlnet-train",schemaName:"sd-controlnet",prefix:"sd-controlnet",modelLabel:"SD ControlNet",presetTrainTypes:["sd-controlnet"]},"sdxl-controlnet-train":{routeId:"sdxl-controlnet-train",schemaName:"sdxl-controlnet",prefix:"sdxl-controlnet",modelLabel:"SDXL ControlNet",presetTrainTypes:["sdxl-controlnet"]},"flux-controlnet-train":{routeId:"flux-controlnet-train",schemaName:"flux-controlnet",prefix:"flux-controlnet",modelLabel:"Flux ControlNet",presetTrainTypes:["flux-controlnet"]},"sdxl-lllite-train":{routeId:"sdxl-lllite-train",schemaName:"sdxl-controlnet-lllite",prefix:"sdxl-lllite",modelLabel:"SDXL LLLite",presetTrainTypes:["sdxl-controlnet-lllite"]},"sd-ti-train":{routeId:"sd-ti-train",schemaName:"sd-textual-inversion",prefix:"sd-ti",modelLabel:"SD Textual Inversion",presetTrainTypes:["sd-textual-inversion"]},"xti-train":{routeId:"xti-train",schemaName:"sd-textual-inversion-xti",prefix:"xti",modelLabel:"SD XTI",presetTrainTypes:["sd-textual-inversion-xti"]},"sdxl-ti-train":{routeId:"sdxl-ti-train",schemaName:"sdxl-textual-inversion",prefix:"sdxl-ti",modelLabel:"SDXL Textual Inversion",presetTrainTypes:["sdxl-textual-inversion"]},"anima-train":{routeId:"anima-train",schemaName:"anima-lora",prefix:"anima",modelLabel:"Anima LoRA",presetTrainTypes:["anima-lora"]},"anima-finetune-train":{routeId:"anima-finetune-train",schemaName:"anima-finetune",prefix:"anima-finetune",modelLabel:"Anima Finetune",presetTrainTypes:["anima-finetune"]},"lumina-train":{routeId:"lumina-train",schemaName:"lumina-lora",prefix:"lumina",modelLabel:"Lumina LoRA",presetTrainTypes:["lumina-lora"]},"lumina-finetune-train":{routeId:"lumina-finetune-train",schemaName:"lumina-finetune",prefix:"lumina-finetune",modelLabel:"Lumina Finetune",presetTrainTypes:["lumina-finetune"]},"hunyuan-image-train":{routeId:"hunyuan-image-train",schemaName:"hunyuan-image-lora",prefix:"hunyuan-image",modelLabel:"Hunyuan Image LoRA",presetTrainTypes:["hunyuan-image-lora"]}},Va=80,Ha=100;function ye(){return typeof window<"u"?window:null}function Me(e,t){const a=ye();if(!a)return t;try{const n=a.localStorage.getItem(e);return n?JSON.parse(n):t}catch{return t}}function Ve(e,t){const a=ye();a&&a.localStorage.setItem(e,JSON.stringify(t))}function Ga(e){const t=ye();t&&t.localStorage.removeItem(e)}function He(e){return`source-training-autosave-${e}`}function Rt(e){return`source-training-history-${e}`}function Nt(e){return`source-training-recipes-${e}`}function Ct(e){return Me(He(e),null)}function Ua(e,t){Ve(He(e),t)}function Wa(e){Ga(He(e))}function O(e){return Me(Rt(e),[])}function ue(e,t){Ve(Rt(e),t)}function N(e){return Me(Nt(e),[])}function Q(e,t){Ve(Nt(e),t)}function Dt(e){return e.slice(0,Va)}function Ge(e){return e.slice(0,Ha)}function J(e,t,a="text/plain;charset=utf-8"){const n=ye();if(!n)return;const i=new Blob([t],{type:a}),s=URL.createObjectURL(i),r=n.document.createElement("a");r.href=s,r.download=e,r.click(),URL.revokeObjectURL(s)}const Xa=["pytorch_optimizer","schedulefree","bitsandbytes","prodigyplus"];function Ka(e){if(!e)return"runtime packages unavailable";const t=Xa.map(a=>e[a]).filter(a=>!!a);return t.length===0?"runtime packages unavailable":t.map(a=>`${a.display_name}:${a.importable?"ready":a.installed?"broken":"missing"}`).join(" | ")}async function Ja(){var c,p,u,d,l,g,m,b,_;const e=await Promise.allSettled([oa(),xt(),Oe(),Fe(),Tt(),ze()]),[t,a,n,i,s,r]=e;if(t.status==="fulfilled"){const $=((c=t.value.data)==null?void 0:c.schemas)??[];h("diag-schemas-title",`${$.length} schema hashes loaded`),h("diag-schemas-detail",$.slice(0,4).map(S=>S.name).join(", ")||"No schema names returned.")}else h("diag-schemas-title","Schema hash request failed"),h("diag-schemas-detail",t.reason instanceof Error?t.reason.message:"Unknown error");if(a.status==="fulfilled"){const $=((p=a.value.data)==null?void 0:p.presets)??[];h("diag-presets-title",`${$.length} presets loaded`),h("diag-presets-detail","Source migration can reuse preset grouping later.")}else h("diag-presets-title","Preset request failed"),h("diag-presets-detail",a.reason instanceof Error?a.reason.message:"Unknown error");if(n.status==="fulfilled"){const $=((u=n.value.data)==null?void 0:u.tasks)??[];h("diag-tasks-title","Task manager reachable"),h("diag-tasks-detail",Da($))}else h("diag-tasks-title","Task request failed"),h("diag-tasks-detail",n.reason instanceof Error?n.reason.message:"Unknown error");if(i.status==="fulfilled"){const $=((d=i.value.data)==null?void 0:d.cards)??[],S=(l=i.value.data)==null?void 0:l.xformers,A=(g=i.value.data)==null?void 0:g.runtime,M=S?`xformers: ${S.installed?"installed":"missing"}, ${S.supported?"supported":"fallback"}`:"xformers info unavailable",X=A?`${A.environment} Python ${A.python_version} | ${Ka(A.packages)}`:"runtime dependency status unavailable";h("diag-gpu-title",`${$.length} GPU entries reachable`),h("diag-gpu-detail",`${Et($)} | ${M} | ${X}`)}else h("diag-gpu-title","GPU request failed"),h("diag-gpu-detail",i.reason instanceof Error?i.reason.message:"Unknown error");if(s.status==="fulfilled"?(h("diag-tageditor-title","Tag editor status reachable"),h("diag-tageditor-detail",Ba(s.value))):(h("diag-tageditor-title","Tag editor status request failed"),h("diag-tageditor-detail",s.reason instanceof Error?s.reason.message:"Unknown error")),r.status==="fulfilled"){const $=((m=r.value.data)==null?void 0:m.schemas)??[];wa($),xa($),tt($,a.status==="fulfilled"?((b=a.value.data)==null?void 0:b.presets)??[]:[])}else f("schema-browser",`<p>${r.reason instanceof Error?r.reason.message:"Schema inventory request failed."}</p>`),tt([],a.status==="fulfilled"?((_=a.value.data)==null?void 0:_.presets)??[]:[])}function Ya(e){return e.includes("controlnet")?"ControlNet":e.includes("textual-inversion")||e.includes("xti")?"Textual Inversion":e.includes("finetune")||e==="dreambooth"?"Finetune":"LoRA"}function Za(e,t,a){const n=["preflight","prompt workspace","history","recipes"];return t.includes("resume:")&&n.push("resume"),(t.includes("prompt_file")||t.includes("positive_prompts"))&&n.push("sample prompts"),t.includes("validation_split")&&n.push("validation"),t.includes("masked_loss")&&n.push("masked loss"),t.includes("save_state")&&n.push("save state"),t.includes("conditioning_data_dir")&&n.push("conditioning"),a==="Textual Inversion"&&n.push("embeddings"),a==="ControlNet"&&n.push("controlnet"),e.routeId.startsWith("sdxl")&&n.push("experimental clip-skip"),[...new Set(n)]}function tt(e,t){const a=new Map(e.map(i=>[i.name,String(i.schema??"")])),n=Object.values(Le).map(i=>{var g;const s=G.find(m=>m.id===i.routeId),r=Ya(i.schemaName),c=a.get(i.schemaName)??"",p=t.filter(m=>{const _=(m.metadata??{}).train_type;return typeof _!="string"||_.trim().length===0?!1:i.presetTrainTypes.includes(_)}).length,u=O(i.routeId).length,d=N(i.routeId).length,l=!!((g=Ct(i.routeId))!=null&&g.value);return{routeId:i.routeId,title:(s==null?void 0:s.label)??i.modelLabel,routeHash:(s==null?void 0:s.hash)??"#/workspace",schemaName:i.schemaName,modelLabel:i.modelLabel,family:r,presetCount:p,localHistoryCount:u,localRecipeCount:d,autosaveReady:l,schemaAvailable:a.has(i.schemaName),capabilities:Za(i,c,r)}}).sort((i,s)=>i.family.localeCompare(s.family)||i.title.localeCompare(s.title));Sa(n)}const Bt="source-training-option-visibility-v1",Qa="__custom__:",at=new Set(["AdaBelief","Adan","CAME","LaProp","MADGRAD","RAdam","Ranger","Ranger21","ScheduleFreeAdamW","SophiaH","StableAdamW"]),ei=["LBFGS","SGD","Adam","AdamW","NAdam","RMSprop","A2Grad","ADOPT","APOLLO","ASGD","AccSGD","AdEMAMix","AdaBelief","AdaBound","AdaDelta","AdaFactor","AdaGC","AdaGO","AdaHessian","AdaLOMO","AdaMax","AdaMod","AdaMuon","AdaNorm","AdaPNM","AdaShift","AdaSmooth","AdaTAM","Adai","Adalite","AdamC","AdamG","AdamMini","AdamP","AdamS","AdamWSN","Adan","AggMo","Aida","AliG","Alice","BCOS","Amos","Ano","ApolloDQN","AvaGrad","BSAM","CAME","Conda","DAdaptAdaGrad","DAdaptAdam","DAdaptAdan","DAdaptLion","DAdaptSGD","DeMo","DiffGrad","DistributedMuon","EXAdam","EmoFact","EmoLynx","EmoNavi","FAdam","FOCUS","FTRL","Fira","Fromage","GaLore","Grams","Gravity","GrokFastAdamW","Kate","Kron","LARS","LOMO","LaProp","Lamb","Lion","MADGRAD","MARS","MSVAG","Muon","Nero","NovoGrad","PAdam","PID","PNM","Prodigy","QHAdam","QHM","RACS","RAdam","Ranger","Ranger21","Ranger25","SCION","SCIONLight","SGDP","SGDSaI","SGDW","SM3","SOAP","SPAM","SPlus","SRMM","SWATS","ScalableShampoo","ScheduleFreeAdamW","ScheduleFreeRAdam","ScheduleFreeSGD","Shampoo","SignSGD","SimplifiedAdEMAMix","SophiaH","StableAdamW","StableSPAM","TAM","Tiger","VSGD","Yogi","SpectralSphere"],qt={AdaBelief:"Adam-like optimizer with variance tracking tuned by prediction belief.",Adan:"Fast adaptive optimizer that many diffusion users like for aggressive finetunes.",CAME:"Memory-conscious optimizer from pytorch-optimizer, already popular in diffusion training.",LaProp:"Adam and RMSProp style hybrid that some LoRA users prefer for stable convergence.",MADGRAD:"Momentumized dual averaging optimizer with a good track record on noisy training runs.",RAdam:"Rectified Adam variant that can behave more gently than plain AdamW early on.",Ranger:"RAdam plus Lookahead style optimizer from the Ranger family.",Ranger21:"Heavier Ranger-family optimizer with many training-time stabilizers built in.",ScheduleFreeAdamW:"Schedule-free AdamW variant that reduces dependence on a separate LR scheduler.",ScheduleFreeRAdam:"Schedule-free RAdam variant from pytorch-optimizer.",SophiaH:"Hessian-aware optimizer that some users test for large-batch training.",StableAdamW:"Stabilized AdamW implementation from pytorch-optimizer."},Ue=[{kind:"optimizer",value:"AdamW",label:"AdamW",description:"Standard torch AdamW optimizer.",source:"torch",sourceLabel:"torch.optim",defaultVisible:!0,featured:!0},{kind:"optimizer",value:"AdamW8bit",label:"AdamW8bit",description:"bitsandbytes 8-bit AdamW for lower VRAM usage.",source:"bitsandbytes",sourceLabel:"bitsandbytes",defaultVisible:!0,featured:!0,packageName:"bitsandbytes"},{kind:"optimizer",value:"PagedAdamW8bit",label:"PagedAdamW8bit",description:"Paged 8-bit AdamW from bitsandbytes.",source:"bitsandbytes",sourceLabel:"bitsandbytes",defaultVisible:!0,packageName:"bitsandbytes"},{kind:"optimizer",value:"RAdamScheduleFree",label:"RAdamScheduleFree",description:"Schedule-free RAdam from the schedulefree package.",source:"schedulefree",sourceLabel:"schedulefree",defaultVisible:!0,featured:!0,packageName:"schedulefree"},{kind:"optimizer",value:"Lion",label:"Lion",description:"Lion optimizer using the project's existing training bridge.",source:"bridge",sourceLabel:"bridge built-in",defaultVisible:!0,featured:!0,packageName:"lion_pytorch"},{kind:"optimizer",value:"Lion8bit",label:"Lion8bit",description:"bitsandbytes 8-bit Lion.",source:"bitsandbytes",sourceLabel:"bitsandbytes",defaultVisible:!0,packageName:"bitsandbytes"},{kind:"optimizer",value:"PagedLion8bit",label:"PagedLion8bit",description:"Paged 8-bit Lion from bitsandbytes.",source:"bitsandbytes",sourceLabel:"bitsandbytes",defaultVisible:!0,packageName:"bitsandbytes"},{kind:"optimizer",value:"SGDNesterov",label:"SGDNesterov",description:"Nesterov SGD handled by the project bridge.",source:"bridge",sourceLabel:"bridge built-in",defaultVisible:!0},{kind:"optimizer",value:"SGDNesterov8bit",label:"SGDNesterov8bit",description:"bitsandbytes 8-bit Nesterov SGD.",source:"bitsandbytes",sourceLabel:"bitsandbytes",defaultVisible:!0,packageName:"bitsandbytes"},{kind:"optimizer",value:"DAdaptation",label:"DAdaptation",description:"Legacy DAdaptation bridge entry used by many existing configs.",source:"bridge",sourceLabel:"bridge built-in",defaultVisible:!0,packageName:"dadaptation"},{kind:"optimizer",value:"DAdaptAdam",label:"DAdaptAdam",description:"DAdapt Adam bridge entry.",source:"bridge",sourceLabel:"bridge built-in",defaultVisible:!0,packageName:"dadaptation"},{kind:"optimizer",value:"DAdaptAdaGrad",label:"DAdaptAdaGrad",description:"DAdapt AdaGrad bridge entry.",source:"bridge",sourceLabel:"bridge built-in",defaultVisible:!0,packageName:"dadaptation"},{kind:"optimizer",value:"DAdaptAdanIP",label:"DAdaptAdanIP",description:"Existing Adan-IP flavored DAdapt bridge entry.",source:"bridge",sourceLabel:"bridge built-in",defaultVisible:!0,packageName:"dadaptation"},{kind:"optimizer",value:"DAdaptLion",label:"DAdaptLion",description:"DAdapt Lion bridge entry.",source:"bridge",sourceLabel:"bridge built-in",defaultVisible:!0,packageName:"dadaptation"},{kind:"optimizer",value:"DAdaptSGD",label:"DAdaptSGD",description:"DAdapt SGD bridge entry.",source:"bridge",sourceLabel:"bridge built-in",defaultVisible:!0,packageName:"dadaptation"},{kind:"optimizer",value:"AdaFactor",label:"AdaFactor",description:"Transformers Adafactor bridge entry.",source:"transformers",sourceLabel:"transformers",defaultVisible:!0,packageName:"transformers"},{kind:"optimizer",value:"Prodigy",label:"Prodigy",description:"Prodigy optimizer already supported by the training bridge.",source:"bridge",sourceLabel:"bridge built-in",defaultVisible:!0,featured:!0,packageName:"prodigyopt"},{kind:"optimizer",value:"prodigyplus.ProdigyPlusScheduleFree",label:"ProdigyPlusScheduleFree",description:"ProdigyPlus schedule-free optimizer entry.",source:"prodigyplus",sourceLabel:"prodigyplus",defaultVisible:!0,packageName:"prodigyplus"},{kind:"optimizer",value:"pytorch_optimizer.CAME",label:"CAME",description:qt.CAME,source:"pytorch-optimizer",sourceLabel:"pytorch-optimizer",defaultVisible:!0,featured:!0,packageName:"pytorch_optimizer"},{kind:"optimizer",value:"bitsandbytes.optim.AdEMAMix8bit",label:"AdEMAMix8bit",description:"bitsandbytes AdEMAMix 8-bit optimizer.",source:"bitsandbytes",sourceLabel:"bitsandbytes",defaultVisible:!0,packageName:"bitsandbytes"},{kind:"optimizer",value:"bitsandbytes.optim.PagedAdEMAMix8bit",label:"PagedAdEMAMix8bit",description:"Paged bitsandbytes AdEMAMix 8-bit optimizer.",source:"bitsandbytes",sourceLabel:"bitsandbytes",defaultVisible:!0,packageName:"bitsandbytes"}];function ti(e){return`${Qa}${e}`}function E(e,t,a,n,i,s=!1,r=!1){return{kind:"scheduler",value:ti(i),label:e,description:t,source:a,sourceLabel:n,defaultVisible:s,featured:r,schedulerTypePath:i,schedulerFallback:"constant",packageName:a==="pytorch-optimizer"?"pytorch_optimizer":void 0}}const zt=[{kind:"scheduler",value:"linear",label:"linear",description:"Built-in diffusers linear scheduler.",source:"diffusers",sourceLabel:"diffusers",defaultVisible:!0,featured:!0},{kind:"scheduler",value:"cosine",label:"cosine",description:"Built-in diffusers cosine scheduler.",source:"diffusers",sourceLabel:"diffusers",defaultVisible:!0,featured:!0},{kind:"scheduler",value:"cosine_with_restarts",label:"cosine_with_restarts",description:"Built-in diffusers cosine scheduler with restarts.",source:"diffusers",sourceLabel:"diffusers",defaultVisible:!0,featured:!0},{kind:"scheduler",value:"polynomial",label:"polynomial",description:"Built-in diffusers polynomial scheduler.",source:"diffusers",sourceLabel:"diffusers",defaultVisible:!0},{kind:"scheduler",value:"constant",label:"constant",description:"Built-in constant scheduler.",source:"diffusers",sourceLabel:"diffusers",defaultVisible:!0},{kind:"scheduler",value:"constant_with_warmup",label:"constant_with_warmup",description:"Built-in constant scheduler with warmup.",source:"diffusers",sourceLabel:"diffusers",defaultVisible:!0}],ai=[E("CosineAnnealingLR","Torch cosine annealing scheduler.","torch","torch lr_scheduler","torch.optim.lr_scheduler.CosineAnnealingLR",!0,!0),E("CosineAnnealingWarmRestarts","Torch cosine annealing scheduler with warm restarts.","torch","torch lr_scheduler","torch.optim.lr_scheduler.CosineAnnealingWarmRestarts",!0,!0),E("OneCycleLR","Torch one-cycle scheduler.","torch","torch lr_scheduler","torch.optim.lr_scheduler.OneCycleLR",!0,!0),E("StepLR","Torch step scheduler.","torch","torch lr_scheduler","torch.optim.lr_scheduler.StepLR"),E("MultiStepLR","Torch multi-step scheduler.","torch","torch lr_scheduler","torch.optim.lr_scheduler.MultiStepLR"),E("CyclicLR","Torch cyclic scheduler.","torch","torch lr_scheduler","torch.optim.lr_scheduler.CyclicLR"),E("CosineAnnealingWarmupRestarts","pytorch-optimizer warmup cosine scheduler.","pytorch-optimizer","pytorch-optimizer","pytorch_optimizer.CosineAnnealingWarmupRestarts",!0,!0),E("REXScheduler","pytorch-optimizer REX scheduler.","pytorch-optimizer","pytorch-optimizer","pytorch_optimizer.REXScheduler",!0,!0),E("CosineScheduler","pytorch-optimizer cosine scheduler helper.","pytorch-optimizer","pytorch-optimizer","pytorch_optimizer.CosineScheduler"),E("LinearScheduler","pytorch-optimizer linear scheduler helper.","pytorch-optimizer","pytorch-optimizer","pytorch_optimizer.LinearScheduler"),E("PolyScheduler","pytorch-optimizer polynomial scheduler helper.","pytorch-optimizer","pytorch-optimizer","pytorch_optimizer.PolyScheduler"),E("ProportionScheduler","pytorch-optimizer proportion scheduler.","pytorch-optimizer","pytorch-optimizer","pytorch_optimizer.ProportionScheduler"),E("Chebyshev","pytorch-optimizer chebyshev schedule helper.","pytorch-optimizer","pytorch-optimizer","pytorch_optimizer.get_chebyshev_schedule"),E("WarmupStableDecay","pytorch-optimizer warmup-stable-decay schedule helper.","pytorch-optimizer","pytorch-optimizer","pytorch_optimizer.get_wsd_schedule")];function ii(e){const t=qt[e]??"Extra optimizer imported from pytorch-optimizer.";return{kind:"optimizer",value:`pytorch_optimizer.${e}`,label:e,description:t,source:"pytorch-optimizer",sourceLabel:"pytorch-optimizer",defaultVisible:at.has(e),featured:at.has(e),packageName:"pytorch_optimizer"}}function ni(e){const t=e.trim(),a=t.lastIndexOf(".");return a===-1?t.toLowerCase():t.slice(a+1).toLowerCase()}const si=new Set(Ue.map(e=>ni(e.value))),ri=ei.filter(e=>!si.has(e.toLowerCase())).map(e=>ii(e)),j=[...Ue,...ri,...zt,...ai],oi={optimizer:Ue.map(e=>e.value),scheduler:zt.map(e=>e.value)},li=new Map(j.map(e=>[`${e.kind}:${e.value}`,e])),Ot=new Map(j.filter(e=>e.kind==="scheduler"&&e.schedulerTypePath).map(e=>[e.schedulerTypePath,e]));function ci(e,t){return e.defaultVisible!==t.defaultVisible?e.defaultVisible?-1:1:e.featured!==t.featured?e.featured?-1:1:e.sourceLabel!==t.sourceLabel?e.sourceLabel.localeCompare(t.sourceLabel):e.label.localeCompare(t.label)}function Ft(){return typeof window<"u"?window:null}function ne(){const e={optimizer:j.filter(a=>a.kind==="optimizer"&&a.defaultVisible).map(a=>a.value),scheduler:j.filter(a=>a.kind==="scheduler"&&a.defaultVisible).map(a=>a.value)},t=Ft();if(!t)return e;try{const a=t.localStorage.getItem(Bt);if(!a)return e;const n=JSON.parse(a);return{optimizer:Ae("optimizer",n.optimizer,e.optimizer),scheduler:Ae("scheduler",n.scheduler,e.scheduler)}}catch{return e}}function Ae(e,t,a){if(!Array.isArray(t))return[...a];const n=new Set(j.filter(i=>i.kind===e).map(i=>i.value));return t.map(i=>String(i)).filter((i,s,r)=>n.has(i)&&r.indexOf(i)===s)}function ie(e){const t=Ft();t&&t.localStorage.setItem(Bt,JSON.stringify(e))}function ve(e){return j.filter(t=>t.kind===e).slice().sort(ci)}function We(e,t){return li.get(`${e}:${t}`)??null}function jt(e){return Ot.get(e)??null}function Mt(){return ne()}function ui(e,t){const a=ne();a[e]=Ae(e,t,[]),ie(a)}function di(e){if(!e){ie({optimizer:j.filter(n=>n.kind==="optimizer"&&n.defaultVisible).map(n=>n.value),scheduler:j.filter(n=>n.kind==="scheduler"&&n.defaultVisible).map(n=>n.value)});return}const t=ve(e).filter(n=>n.defaultVisible).map(n=>n.value),a=ne();a[e]=t,ie(a)}function pi(e,t){const a=ve(e).map(i=>i.value),n=ne();n[e]=a,ie(n)}function hi(e){const t=ne();t[e]=[...oi[e]],ie(t)}function mi(e,t){const a=[];return t&&a.push("Currently hidden in Settings, but kept because this value is already selected or imported."),(e==null?void 0:e.kind)==="scheduler"&&e.schedulerTypePath&&a.push(`Launch bridge writes lr_scheduler_type=${e.schedulerTypePath}.`),e!=null&&e.packageName&&a.push(`Requires ${e.packageName} in the active Python environment.`),a.join(" ")}function gi(e,t){return{value:e,label:t?`${e} [hidden/imported]`:e,description:"Imported value kept for compatibility.",hiddenBySettings:t,selectionNote:t?"This value is not in the current visible catalog, but it is preserved so older configs keep working.":void 0}}function fi(e,t,a){const n=new Set(Mt()[e]),i=a==null?"":String(a),s=[],r=new Set,c=(p,u=!1)=>{if(r.has(p))return;const d=We(e,p),l=!!d&&!n.has(p);if(u?!l||p===i||!d:n.has(p)||p===i){if(!d){s.push(gi(p,p===i&&!u)),r.add(p);return}s.push({value:p,label:`${d.label} [${d.sourceLabel}]${l?" [hidden]":""}`,description:d.description,sourceLabel:d.sourceLabel,hiddenBySettings:l,selectionNote:mi(d,l),entry:d}),r.add(p)}};for(const p of t)c(String(p),!0);for(const p of ve(e))c(p.value);return i.length>0&&!r.has(i)&&c(i),s}function ee(e){return e==null?"":String(e)}function bi(e,t){if(t==="lr_scheduler"){const a=ee(e.lr_scheduler),n=We("scheduler",a);if(n!=null&&n.schedulerTypePath){e.lr_scheduler_type=n.schedulerTypePath;return}const i=ee(e.lr_scheduler_type).trim();i.length>0&&Ot.has(i)&&(e.lr_scheduler_type="");return}if(t==="lr_scheduler_type"){const a=ee(e.lr_scheduler_type).trim(),n=jt(a);n&&(e.lr_scheduler=n.value)}}function yi(e){const t=ee(e.lr_scheduler_type).trim();if(t.length===0)return e;const a=jt(t);return a&&(e.lr_scheduler=a.value),e}function vi(e){const t=ee(e.lr_scheduler),a=We("scheduler",t);return a!=null&&a.schedulerTypePath&&(e.lr_scheduler_type=a.schedulerTypePath,e.lr_scheduler=a.schedulerFallback??"constant"),e}const _i=["pytorch_optimizer","schedulefree","bitsandbytes","prodigyplus","prodigyopt","lion_pytorch","dadaptation","transformers"];function ki(e,t){const a=new Map;for(const n of e){const i=a.get(n.sourceLabel)??{total:0,visible:0};i.total+=1,t.has(n.value)&&(i.visible+=1),a.set(n.sourceLabel,i)}return[...a.entries()].map(([n,i])=>`<span class="coverage-pill ${i.visible>0?"":"coverage-pill-muted"}">${o(n)} <strong>${i.visible}/${i.total}</strong></span>`).join("")}function Vt(e){return e?e.importable?`<span class="coverage-pill">${o(e.version?`${e.display_name} ${e.version}`:`${e.display_name} ready`)}</span>`:e.installed?`<span class="coverage-pill coverage-pill-warning">${o(`${e.display_name} import failed`)}</span>`:`<span class="coverage-pill coverage-pill-muted">${o(`${e.display_name} missing`)}</span>`:""}function $i(e,t,a,n){const i=t.schedulerTypePath?`<strong>Bridge:</strong> <code>${o(t.schedulerTypePath)}</code>`:`<strong>Value:</strong> <code>${o(t.value)}</code>`,s=t.packageName?n==null?void 0:n[t.packageName]:void 0,r=[`<span class="coverage-pill ${a?"":"coverage-pill-muted"}">${a?"visible":"hidden"}</span>`,`<span class="coverage-pill coverage-pill-muted">${o(t.sourceLabel)}</span>`,t.defaultVisible?'<span class="coverage-pill">default</span>':'<span class="coverage-pill coverage-pill-muted">extra</span>',t.packageName?`<span class="coverage-pill coverage-pill-muted">${o(t.packageName)}</span>`:"",Vt(s)].filter(Boolean).join(""),c=s&&!s.importable?`<p class="settings-option-runtime-note">${o(s.reason||"This package is not importable in the active runtime.")}</p>`:"";return`
    <label class="settings-option-card ${a?"is-enabled":"is-disabled"}">
      <div class="settings-option-card-head">
        <div class="settings-option-check">
          <input
            type="checkbox"
            data-training-option-toggle="${e}"
            value="${o(t.value)}"
            ${a?"checked":""}
          />
          <div>
            <strong>${o(t.label)}</strong>
            <p class="settings-option-meta">${i}</p>
          </div>
        </div>
        <div class="coverage-list">${r}</div>
      </div>
      <p class="settings-option-description">${o(t.description)}</p>
      ${c}
    </label>
  `}function wi(e,t){if(h("settings-runtime-title",e),!t){h("settings-runtime-body","No runtime package information was returned.");return}const a=_i.map(i=>t[i]).filter(i=>!!i);if(a.length===0){f("settings-runtime-body","<p>No tracked runtime package records were returned.</p>");return}const n=a.filter(i=>i.importable).length;f("settings-runtime-body",`
      <p>${o(`${n}/${a.length} tracked training packages are importable in the active runtime.`)}</p>
      <div class="coverage-list">
        ${a.map(i=>Vt(i)).join("")}
      </div>
      <div class="settings-runtime-grid">
        ${a.map(i=>`
              <article class="settings-runtime-card">
                <strong>${o(i.display_name)}</strong>
                <p class="settings-option-meta"><code>${o(i.module_name)}</code></p>
                <p class="settings-option-description">
                  ${o(i.importable?`Ready${i.version?` (${i.version})`:""}`:i.reason||"Package is not importable in the active runtime.")}
                </p>
              </article>
            `).join("")}
      </div>
    `)}function de(e,t){const a=ve(e),n=new Set(Mt()[e]),i=`settings-${e}-title`,s=`settings-${e}-body`,r=a.filter(u=>n.has(u.value)).length,c=e==="optimizer"?"optimizers":"schedulers",p=e==="optimizer"?"Curate what appears in optimizer_type across the rebuilt training routes.":"Custom scheduler entries are converted into lr_scheduler_type automatically when you launch training.";h(i,`${r}/${a.length} ${c} visible`),f(s,`
      <p>${o(p)}</p>
      <div class="settings-option-toolbar">
        <button class="action-button action-button-ghost action-button-small" data-training-option-action="${e}:defaults" type="button">Reset defaults</button>
        <button class="action-button action-button-ghost action-button-small" data-training-option-action="${e}:builtins" type="button">Built-ins only</button>
        <button class="action-button action-button-ghost action-button-small" data-training-option-action="${e}:all" type="button">Show all</button>
      </div>
      <div class="coverage-list settings-option-coverage">
        <span class="coverage-pill">${r} enabled</span>
        ${ki(a,n)}
      </div>
      <div class="settings-option-grid">
        ${a.map(u=>$i(e,u,n.has(u.value),t)).join("")}
      </div>
    `)}function pe(e,t){const a=document.querySelector(`#settings-${e}-body`);a&&(a.querySelectorAll(`[data-training-option-toggle="${e}"]`).forEach(n=>{n.addEventListener("change",()=>{const i=a.querySelectorAll(`[data-training-option-toggle="${e}"]:checked`);ui(e,[...i].map(s=>s.value)),de(e,t),pe(e,t)})}),a.querySelectorAll(`[data-training-option-action^="${e}:"]`).forEach(n=>{n.addEventListener("click",()=>{var s;const i=(s=n.dataset.trainingOptionAction)==null?void 0:s.split(":")[1];i==="defaults"?di(e):i==="builtins"?hi(e):i==="all"&&pi(e),de(e,t),pe(e,t)})}))}function it(e){de("optimizer",e),de("scheduler",e),pe("optimizer",e),pe("scheduler",e)}async function xi(){var n;const[e,t,a]=await Promise.allSettled([ca(),la(),Fe()]);if(e.status==="fulfilled"){const i=e.value.data;h("settings-summary-title",`${(i==null?void 0:i.saved_param_count)??0} remembered param groups`),f("settings-summary-body",`
        <p><strong>Config file:</strong> <code>${o((i==null?void 0:i.config_path)??"unknown")}</code></p>
        <p><strong>Last path:</strong> <code>${o((i==null?void 0:i.last_path)||"(empty)")}</code></p>
        <p><strong>Saved keys:</strong> ${((i==null?void 0:i.saved_param_keys)??[]).map(s=>`<code>${o(s)}</code>`).join(", ")||"none"}</p>
      `)}else h("settings-summary-title","Config summary request failed"),h("settings-summary-body",e.reason instanceof Error?e.reason.message:"Unknown error");if(t.status==="fulfilled"){const i=t.value.data??{},s=Object.keys(i);h("settings-params-title",`${s.length} saved param entries`),f("settings-params-body",s.length?`<div class="coverage-list">${s.map(r=>`<span class="coverage-pill coverage-pill-muted">${o(r)}</span>`).join("")}</div>`:"<p>No saved params returned.</p>")}else h("settings-params-title","Saved params request failed"),h("settings-params-body",t.reason instanceof Error?t.reason.message:"Unknown error");if(a.status==="fulfilled"){const i=(n=a.value.data)==null?void 0:n.runtime;wi(i?`${i.environment} runtime · Python ${i.python_version}`:"Runtime dependency status unavailable",i==null?void 0:i.packages),it(i==null?void 0:i.packages);return}h("settings-runtime-title","Runtime dependency request failed"),h("settings-runtime-body",a.reason instanceof Error?a.reason.message:"Unknown error"),it()}const Si="".replace(/\/$/,""),Ti=Si||"";function B(e){return/^https?:\/\//.test(e)?e:(e.startsWith("/")||(e=`/${e}`),`${Ti}${e}`)}async function Li(){try{const e=await Tt();h("tag-editor-status-title",`Current status: ${e.status}`),f("tag-editor-status-body",`
        <p>${o(e.detail||"No extra detail returned.")}</p>
        <p><a class="text-link" href="${B("/tageditor.html")}" target="_blank" rel="noreferrer">Open current shipped wrapper page</a></p>
      `)}catch(e){h("tag-editor-status-title","Tag editor status request failed"),h("tag-editor-status-body",e instanceof Error?e.message:"Unknown error")}}async function Ai(){var e;Ii(),Ei(),await Pi(),Ri(),Ni();try{const a=((e=(await ua()).data)==null?void 0:e.scripts)??[];h("tools-summary-title",`${a.length} launcher scripts available`),f("tools-summary-body",`
        <p>Categories: ${[...new Set(a.map(n=>n.category))].map(n=>`<code>${o(n)}</code>`).join(", ")}</p>
        <p>The tools workspace now includes dataset analysis, masked-loss alpha inspection, batch auto-tagging, caption cleanup, and caption restore snapshots, with more curated high-frequency flows still planned.</p>
      `),La(a)}catch(t){h("tools-summary-title","Script inventory request failed"),h("tools-summary-body",t instanceof Error?t.message:"Unknown error"),f("tools-browser","<p>Tool inventory failed to load.</p>")}}function Ei(){const e=Di();e&&(e.browseButton.addEventListener("click",async()=>{h("masked-loss-audit-status","Opening folder picker...");try{e.pathInput.value=await U("folder"),h("masked-loss-audit-status","Folder selected. Ready to inspect alpha masks.")}catch(t){h("masked-loss-audit-status",t instanceof Error?t.message:"Folder picker failed.")}}),e.runButton.addEventListener("click",()=>{st(e)}),e.pathInput.addEventListener("keydown",t=>{t.key==="Enter"&&(t.preventDefault(),st(e))}))}function Ii(){const e=Ci();e&&(e.browseButton.addEventListener("click",async()=>{h("dataset-analysis-status","Opening folder picker...");try{e.pathInput.value=await U("folder"),h("dataset-analysis-status","Folder selected. Ready to analyze.")}catch(t){h("dataset-analysis-status",t instanceof Error?t.message:"Folder picker failed.")}}),e.runButton.addEventListener("click",()=>{nt(e)}),e.pathInput.addEventListener("keydown",t=>{t.key==="Enter"&&(t.preventDefault(),nt(e))}))}async function Pi(){var t;const e=Bi();if(e){e.browseButton.addEventListener("click",async()=>{h("batch-tagger-status","Opening folder picker...");try{e.pathInput.value=await U("folder"),h("batch-tagger-status","Folder selected. Ready to launch batch tagging.")}catch(a){h("batch-tagger-status",a instanceof Error?a.message:"Folder picker failed.")}}),e.runButton.addEventListener("click",()=>{rt(e)}),e.pathInput.addEventListener("keydown",a=>{a.key==="Enter"&&(a.preventDefault(),rt(e))});try{const a=await ha(),n=((t=a.data)==null?void 0:t.interrogators)??[];if(!n.length)throw new Error("No interrogator models returned.");e.modelSelect.innerHTML=n.map(i=>{var c;const s=i.is_default||i.name===((c=a.data)==null?void 0:c.default)?" selected":"",r=i.kind==="cl"?"CL":"WD";return`<option value="${o(i.name)}"${s}>${o(i.name)} (${r})</option>`}).join(""),h("batch-tagger-status",`Loaded ${n.length} interrogator models.`)}catch(a){e.modelSelect.innerHTML='<option value="wd14-convnextv2-v2">wd14-convnextv2-v2 (WD)</option>',h("batch-tagger-status",a instanceof Error?a.message:"Failed to load interrogator inventory."),f("batch-tagger-results",`<article class="dataset-analysis-block dataset-analysis-warning"><p>${o(a instanceof Error?a.message:"Failed to load interrogator inventory.")}</p></article>`)}}}function Ri(){const e=qi();e&&(e.browseButton.addEventListener("click",async()=>{h("caption-cleanup-status","Opening folder picker...");try{e.pathInput.value=await U("folder"),h("caption-cleanup-status","Folder selected. Ready to preview cleanup.")}catch(t){h("caption-cleanup-status",t instanceof Error?t.message:"Folder picker failed.")}}),e.previewButton.addEventListener("click",()=>{$e(e,"preview")}),e.applyButton.addEventListener("click",()=>{$e(e,"apply")}),e.pathInput.addEventListener("keydown",t=>{t.key==="Enter"&&(t.preventDefault(),$e(e,"preview"))}))}function Ni(){const e=zi();e&&(e.browseButton.addEventListener("click",async()=>{h("caption-backup-status","Opening folder picker...");try{e.pathInput.value=await U("folder"),h("caption-backup-status","Folder selected. Refreshing snapshots..."),await te(e)}catch(t){h("caption-backup-status",t instanceof Error?t.message:"Folder picker failed.")}}),e.refreshButton.addEventListener("click",()=>{te(e)}),e.createButton.addEventListener("click",()=>{Oi(e)}),e.restoreButton.addEventListener("click",()=>{Fi(e)}),e.selectInput.addEventListener("change",()=>{te(e,e.selectInput.value||null)}))}function Ci(){const e=document.querySelector("#dataset-analysis-path"),t=document.querySelector("#dataset-analysis-caption-extension"),a=document.querySelector("#dataset-analysis-top-tags"),n=document.querySelector("#dataset-analysis-sample-limit"),i=document.querySelector("#dataset-analysis-pick"),s=document.querySelector("#dataset-analysis-run");return!e||!t||!a||!n||!i||!s?null:{pathInput:e,captionExtensionInput:t,topTagsInput:a,sampleLimitInput:n,browseButton:i,runButton:s}}function Di(){const e=document.querySelector("#masked-loss-audit-path"),t=document.querySelector("#masked-loss-audit-sample-limit"),a=document.querySelector("#masked-loss-audit-recursive"),n=document.querySelector("#masked-loss-audit-pick"),i=document.querySelector("#masked-loss-audit-run");return!e||!t||!a||!n||!i?null:{pathInput:e,sampleLimitInput:t,recursiveInput:a,browseButton:n,runButton:i}}function Bi(){const e=document.querySelector("#batch-tagger-path"),t=document.querySelector("#batch-tagger-model"),a=document.querySelector("#batch-tagger-threshold"),n=document.querySelector("#batch-tagger-character-threshold"),i=document.querySelector("#batch-tagger-conflict"),s=document.querySelector("#batch-tagger-additional-tags"),r=document.querySelector("#batch-tagger-backup-name"),c=document.querySelector("#batch-tagger-exclude-tags"),p=document.querySelector("#batch-tagger-recursive"),u=document.querySelector("#batch-tagger-replace-underscore"),d=document.querySelector("#batch-tagger-escape-tag"),l=document.querySelector("#batch-tagger-add-rating-tag"),g=document.querySelector("#batch-tagger-add-model-tag"),m=document.querySelector("#batch-tagger-auto-backup"),b=document.querySelector("#batch-tagger-pick"),_=document.querySelector("#batch-tagger-run");return!e||!t||!a||!n||!i||!s||!r||!c||!p||!u||!d||!l||!g||!m||!b||!_?null:{pathInput:e,modelSelect:t,thresholdInput:a,characterThresholdInput:n,conflictSelect:i,additionalTagsInput:s,backupNameInput:r,excludeTagsInput:c,recursiveInput:p,replaceUnderscoreInput:u,escapeTagInput:d,addRatingTagInput:l,addModelTagInput:g,autoBackupInput:m,browseButton:b,runButton:_}}function qi(){const e=document.querySelector("#caption-cleanup-path"),t=document.querySelector("#caption-cleanup-extension"),a=document.querySelector("#caption-cleanup-remove-tags"),n=document.querySelector("#caption-cleanup-prepend-tags"),i=document.querySelector("#caption-cleanup-append-tags"),s=document.querySelector("#caption-cleanup-search-text"),r=document.querySelector("#caption-cleanup-replace-text"),c=document.querySelector("#caption-cleanup-backup-name"),p=document.querySelector("#caption-cleanup-sample-limit"),u=document.querySelector("#caption-cleanup-recursive"),d=document.querySelector("#caption-cleanup-collapse-whitespace"),l=document.querySelector("#caption-cleanup-replace-underscore"),g=document.querySelector("#caption-cleanup-dedupe-tags"),m=document.querySelector("#caption-cleanup-sort-tags"),b=document.querySelector("#caption-cleanup-use-regex"),_=document.querySelector("#caption-cleanup-auto-backup"),$=document.querySelector("#caption-cleanup-pick"),S=document.querySelector("#caption-cleanup-preview"),A=document.querySelector("#caption-cleanup-apply");return!e||!t||!a||!n||!i||!s||!r||!c||!p||!u||!d||!l||!g||!m||!b||!_||!$||!S||!A?null:{pathInput:e,extensionInput:t,removeTagsInput:a,prependTagsInput:n,appendTagsInput:i,searchTextInput:s,replaceTextInput:r,backupNameInput:c,sampleLimitInput:p,recursiveInput:u,collapseWhitespaceInput:d,replaceUnderscoreInput:l,dedupeTagsInput:g,sortTagsInput:m,useRegexInput:b,autoBackupInput:_,browseButton:$,previewButton:S,applyButton:A}}function zi(){const e=document.querySelector("#caption-backup-path"),t=document.querySelector("#caption-backup-extension"),a=document.querySelector("#caption-backup-name"),n=document.querySelector("#caption-backup-select"),i=document.querySelector("#caption-backup-recursive"),s=document.querySelector("#caption-backup-pre-restore"),r=document.querySelector("#caption-backup-pick"),c=document.querySelector("#caption-backup-create"),p=document.querySelector("#caption-backup-refresh"),u=document.querySelector("#caption-backup-restore");return!e||!t||!a||!n||!i||!s||!r||!c||!p||!u?null:{pathInput:e,extensionInput:t,nameInput:a,selectInput:n,recursiveInput:i,preRestoreInput:s,browseButton:r,createButton:c,refreshButton:p,restoreButton:u}}async function nt(e){const t=e.pathInput.value.trim();if(!t){h("dataset-analysis-status","Pick a dataset folder first."),f("dataset-analysis-results",'<p class="dataset-analysis-empty">No folder selected yet.</p>');return}e.browseButton.disabled=!0,e.runButton.disabled=!0,h("dataset-analysis-status","Analyzing dataset..."),f("dataset-analysis-results",'<p class="dataset-analysis-empty">Scanning images, captions, and tags...</p>');try{const a=await da({path:t,caption_extension:e.captionExtensionInput.value.trim()||".txt",top_tags:he(e.topTagsInput.value,40),sample_limit:he(e.sampleLimitInput.value,8)});if(a.status!=="success"||!a.data)throw new Error(a.message||"Dataset analysis returned no data.");h("dataset-analysis-status",`Scanned ${a.data.summary.image_count} images across ${a.data.summary.dataset_folder_count} dataset folder(s).`),Aa(a.data)}catch(a){h("dataset-analysis-status",a instanceof Error?a.message:"Dataset analysis failed."),f("dataset-analysis-results",`<article class="dataset-analysis-block dataset-analysis-warning"><p>${o(a instanceof Error?a.message:"Dataset analysis failed.")}</p></article>`)}finally{e.browseButton.disabled=!1,e.runButton.disabled=!1}}async function st(e){const t=e.pathInput.value.trim();if(!t){h("masked-loss-audit-status","Pick a dataset folder first."),f("masked-loss-audit-results",'<p class="dataset-analysis-empty">No dataset folder selected yet.</p>');return}e.browseButton.disabled=!0,e.runButton.disabled=!0,h("masked-loss-audit-status","Inspecting alpha-channel masks..."),f("masked-loss-audit-results",'<p class="dataset-analysis-empty">Opening images and checking their alpha channels...</p>');try{const a=await pa({path:t,recursive:e.recursiveInput.checked,sample_limit:he(e.sampleLimitInput.value,8)});if(a.status!=="success"||!a.data)throw new Error(a.message||"Masked-loss audit returned no data.");h("masked-loss-audit-status",`Inspected ${a.data.summary.image_count} images. Found ${a.data.summary.usable_mask_image_count} image(s) with usable alpha masks.`),Ea(a.data)}catch(a){h("masked-loss-audit-status",a instanceof Error?a.message:"Masked-loss audit failed."),f("masked-loss-audit-results",`<article class="dataset-analysis-block dataset-analysis-warning"><p>${o(a instanceof Error?a.message:"Masked-loss audit failed.")}</p></article>`)}finally{e.browseButton.disabled=!1,e.runButton.disabled=!1}}async function rt(e){var a,n,i;const t=e.pathInput.value.trim();if(!t){h("batch-tagger-status","Pick an image folder first."),f("batch-tagger-results",'<p class="dataset-analysis-empty">No image folder selected yet.</p>');return}e.browseButton.disabled=!0,e.runButton.disabled=!0,h("batch-tagger-status","Starting batch tagging..."),f("batch-tagger-results",'<p class="dataset-analysis-empty">Submitting interrogator job to the backend...</p>');try{const s=ot(e.thresholdInput.value,.35,0,1),r=ot(e.characterThresholdInput.value,.6,0,1),c=await ma({path:t,interrogator_model:e.modelSelect.value,threshold:s,character_threshold:r,batch_output_action_on_conflict:e.conflictSelect.value,create_backup_before_write:e.autoBackupInput.checked,backup_snapshot_name:e.backupNameInput.value.trim(),additional_tags:e.additionalTagsInput.value.trim(),exclude_tags:e.excludeTagsInput.value.trim(),batch_input_recursive:e.recursiveInput.checked,replace_underscore:e.replaceUnderscoreInput.checked,escape_tag:e.escapeTagInput.checked,add_rating_tag:e.addRatingTagInput.checked,add_model_tag:e.addModelTagInput.checked});if(c.status!=="success")throw new Error(c.message||"Batch tagging failed to start.");h("batch-tagger-status",c.message||"Batch tagging started."),f("batch-tagger-results",`
        <article class="dataset-analysis-block">
          <p class="panel-kicker">launched</p>
          <h3>Batch tagger job submitted</h3>
          <p><code>${o(t)}</code></p>
          <p>Model: <code>${o(e.modelSelect.value)}</code></p>
          <p>
            Threshold: <strong>${o(String(s))}</strong>
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
          ${(i=(n=c.data)==null?void 0:n.warnings)!=null&&i.length?`<p>${o(c.data.warnings.join(" "))}</p>`:""}
          <p>The backend runs this in the background. Watch the console output and inspect generated <code>.txt</code> files in the dataset folder.</p>
        </article>
      `)}catch(s){h("batch-tagger-status",s instanceof Error?s.message:"Batch tagging failed."),f("batch-tagger-results",`<article class="dataset-analysis-block dataset-analysis-warning"><p>${o(s instanceof Error?s.message:"Batch tagging failed.")}</p></article>`)}finally{e.browseButton.disabled=!1,e.runButton.disabled=!1}}async function $e(e,t){const a=e.pathInput.value.trim();if(!a){h("caption-cleanup-status","Pick a caption folder first."),f("caption-cleanup-results",'<p class="dataset-analysis-empty">No caption folder selected yet.</p>');return}const n={path:a,caption_extension:e.extensionInput.value.trim()||".txt",recursive:e.recursiveInput.checked,collapse_whitespace:e.collapseWhitespaceInput.checked,replace_underscore:e.replaceUnderscoreInput.checked,dedupe_tags:e.dedupeTagsInput.checked,sort_tags:e.sortTagsInput.checked,remove_tags:e.removeTagsInput.value.trim(),prepend_tags:e.prependTagsInput.value.trim(),append_tags:e.appendTagsInput.value.trim(),search_text:e.searchTextInput.value,replace_text:e.replaceTextInput.value,use_regex:e.useRegexInput.checked,create_backup_before_apply:e.autoBackupInput.checked,backup_snapshot_name:e.backupNameInput.value.trim(),sample_limit:he(e.sampleLimitInput.value,8)};e.browseButton.disabled=!0,e.previewButton.disabled=!0,e.applyButton.disabled=!0,h("caption-cleanup-status",t==="preview"?"Previewing caption cleanup...":"Applying caption cleanup..."),f("caption-cleanup-results",`<p class="dataset-analysis-empty">${t==="preview"?"Scanning caption files and building sample diffs...":"Writing cleaned captions back to disk..."}</p>`);try{const i=t==="preview"?await ga(n):await fa(n);if(i.status!=="success"||!i.data)throw new Error(i.message||`Caption cleanup ${t} failed.`);h("caption-cleanup-status",i.message||(t==="preview"?`Previewed ${i.data.summary.changed_file_count} caption file changes.`:`Applied cleanup to ${i.data.summary.changed_file_count} caption files.`)),Ia(i.data)}catch(i){h("caption-cleanup-status",i instanceof Error?i.message:"Caption cleanup failed."),f("caption-cleanup-results",`<article class="dataset-analysis-block dataset-analysis-warning"><p>${o(i instanceof Error?i.message:"Caption cleanup failed.")}</p></article>`)}finally{e.browseButton.disabled=!1,e.previewButton.disabled=!1,e.applyButton.disabled=!1}}async function te(e,t,a=!0){var i,s;const n=e.pathInput.value.trim();if(!n){h("caption-backup-status","Pick a caption folder first."),f("caption-backup-results",'<p class="dataset-analysis-empty">No caption folder selected yet.</p>'),e.selectInput.innerHTML='<option value="">Refresh snapshots for this folder</option>';return}e.browseButton.disabled=!0,e.createButton.disabled=!0,e.refreshButton.disabled=!0,e.restoreButton.disabled=!0,h("caption-backup-status","Loading caption snapshots...");try{const c=((i=(await ya({path:n})).data)==null?void 0:i.backups)??[],p=e.selectInput.value||(((s=c[0])==null?void 0:s.archive_name)??""),u=t??p;e.selectInput.innerHTML=c.length?c.map(d=>{const l=d.archive_name===u?" selected":"";return`<option value="${o(d.archive_name)}"${l}>${o(d.snapshot_name)} · ${o(d.archive_name)}</option>`}).join(""):'<option value="">No snapshots for this folder yet</option>',c.length&&u&&(e.selectInput.value=u),h("caption-backup-status",c.length?`Loaded ${c.length} caption snapshots.`:"No caption snapshots found for this folder."),a&&Pa(c,c.length?u:null)}catch(r){h("caption-backup-status",r instanceof Error?r.message:"Failed to load caption snapshots."),f("caption-backup-results",`<article class="dataset-analysis-block dataset-analysis-warning"><p>${o(r instanceof Error?r.message:"Failed to load caption snapshots.")}</p></article>`)}finally{e.browseButton.disabled=!1,e.createButton.disabled=!1,e.refreshButton.disabled=!1,e.restoreButton.disabled=!1}}async function Oi(e){const t=e.pathInput.value.trim();if(!t){h("caption-backup-status","Pick a caption folder first."),f("caption-backup-results",'<p class="dataset-analysis-empty">No caption folder selected yet.</p>');return}e.browseButton.disabled=!0,e.createButton.disabled=!0,e.refreshButton.disabled=!0,e.restoreButton.disabled=!0,h("caption-backup-status","Creating caption snapshot...");try{const a=await ba({path:t,caption_extension:e.extensionInput.value.trim()||".txt",recursive:e.recursiveInput.checked,snapshot_name:e.nameInput.value.trim()});if(a.status!=="success"||!a.data)throw new Error(a.message||"Caption snapshot creation failed.");h("caption-backup-status",a.message||`Created ${a.data.archive_name}`),e.nameInput.value="",await te(e,a.data.archive_name)}catch(a){h("caption-backup-status",a instanceof Error?a.message:"Caption snapshot creation failed."),f("caption-backup-results",`<article class="dataset-analysis-block dataset-analysis-warning"><p>${o(a instanceof Error?a.message:"Caption snapshot creation failed.")}</p></article>`)}finally{e.browseButton.disabled=!1,e.createButton.disabled=!1,e.refreshButton.disabled=!1,e.restoreButton.disabled=!1}}async function Fi(e){const t=e.pathInput.value.trim(),a=e.selectInput.value;if(!t){h("caption-backup-status","Pick a caption folder first."),f("caption-backup-results",'<p class="dataset-analysis-empty">No caption folder selected yet.</p>');return}if(!a){h("caption-backup-status","Select a snapshot to restore.");return}if(window.confirm(`Restore caption snapshot ${a} into this folder?

This overwrites matching caption files from the snapshot.`)){e.browseButton.disabled=!0,e.createButton.disabled=!0,e.refreshButton.disabled=!0,e.restoreButton.disabled=!0,h("caption-backup-status","Restoring caption snapshot..."),f("caption-backup-results",'<p class="dataset-analysis-empty">Writing snapshot files back to the folder...</p>');try{const i=await va({path:t,archive_name:a,make_restore_backup:e.preRestoreInput.checked});if(i.status!=="success"||!i.data)throw new Error(i.message||"Caption snapshot restore failed.");h("caption-backup-status",i.message||`Restored ${i.data.restored_file_count} caption files.`),Ra(i.data),await te(e,a,!1)}catch(i){h("caption-backup-status",i instanceof Error?i.message:"Caption snapshot restore failed."),f("caption-backup-results",`<article class="dataset-analysis-block dataset-analysis-warning"><p>${o(i instanceof Error?i.message:"Caption snapshot restore failed.")}</p></article>`)}finally{e.browseButton.disabled=!1,e.createButton.disabled=!1,e.refreshButton.disabled=!1,e.restoreButton.disabled=!1}}}function he(e,t){const a=Number.parseInt(e,10);return Number.isNaN(a)||a<1?t:a}function ot(e,t,a,n){const i=Number.parseFloat(e);return Number.isNaN(i)?t:Math.min(Math.max(i,a),n)}async function Ee(){var e;try{const t=await Oe();Ta(((e=t.data)==null?void 0:e.tasks)??[]),document.querySelectorAll("[data-task-terminate]").forEach(a=>{a.addEventListener("click",async()=>{const n=a.dataset.taskTerminate;if(n){a.setAttribute("disabled","true");try{await St(n)}finally{await Ee()}}})})}catch(t){f("task-table-container",`<p>${t instanceof Error?o(t.message):"Task request failed."}</p>`)}}async function ji(){const e=document.querySelector("#refresh-tasks");e==null||e.addEventListener("click",()=>{Ee()}),await Ee()}class w{constructor(t){L(this,"kind");L(this,"descriptionText");L(this,"defaultValue");L(this,"roleName");L(this,"roleConfig");L(this,"minValue");L(this,"maxValue");L(this,"stepValue");L(this,"disabledFlag",!1);L(this,"requiredFlag",!1);L(this,"literalValue");L(this,"options",[]);L(this,"fields",{});L(this,"itemType");this.kind=t}description(t){return this.descriptionText=t,this}default(t){return this.defaultValue=t,this}role(t,a){return this.roleName=typeof t=="string"?t:"custom",this.roleConfig=a??t,this}min(t){return this.minValue=t,this}max(t){return this.maxValue=t,this}step(t){return this.stepValue=t,this}required(){return this.requiredFlag=!0,this}disabled(){return this.disabledFlag=!0,this}}function K(e){if(e instanceof w)return e;if(e===String)return new w("string");if(e===Number)return new w("number");if(e===Boolean)return new w("boolean");if(typeof e=="string"||typeof e=="number"||typeof e=="boolean"){const t=new w("const");return t.literalValue=e,t.defaultValue=e,t}if(Array.isArray(e)){const t=new w("union");return t.options=e.map(a=>K(a)),t}if(e&&typeof e=="object"){const t=new w("object");return t.fields=Object.fromEntries(Object.entries(e).map(([a,n])=>[a,K(n)])),t}return new w("string")}function Mi(){return{string(){return new w("string")},number(){return new w("number")},boolean(){return new w("boolean")},const(e){const t=new w("const");return t.literalValue=e,t.defaultValue=e,t},union(e){const t=new w("union");return t.options=e.map(a=>K(a)),t},intersect(e){const t=new w("intersect");return t.options=e.map(a=>K(a)),t},object(e){const t=new w("object");return t.fields=Object.fromEntries(Object.entries(e).map(([a,n])=>[a,K(n)])),t},array(e){const t=new w("array");return t.itemType=K(e),t}}}function Vi(e,t,a){const n={...e,...t};for(const i of a??[])delete n[i];return n}function lt(e,t){const a=Mi();return new Function("Schema","UpdateSchema","SHARED_SCHEMAS","String","Number","Boolean","source",'"use strict"; return eval(source);')(a,Vi,t??{},String,Number,Boolean,e)}function Ht(e){const t=e.find(i=>i.name==="shared"),n=(t?lt(t.schema,null):{})||{};return e.map(i=>({name:i.name,hash:i.hash,source:i.schema,runtime:i.name==="shared"?n:lt(i.schema,n)}))}function ct(e,t=""){return Object.entries(e).map(([a,n])=>({name:a,path:t?`${t}.${a}`:a,schema:n})).filter(a=>a.schema.kind!=="const"||!a.schema.requiredFlag)}function ut(e){return Object.entries(e).filter(([,t])=>t.kind==="const"&&t.requiredFlag).map(([t,a])=>`${t} = ${String(a.literalValue)}`)}function dt(e){return Object.fromEntries(Object.entries(e).filter(([,t])=>t.kind==="const"&&t.requiredFlag).map(([t,a])=>[t,a.literalValue]))}function Ie(e,t,a){if(e.kind==="intersect"){e.options.forEach((n,i)=>Ie(n,`${t}-i${i}`,a));return}if(e.kind==="object"){const n=ct(e.fields);n.length>0&&a.push({id:t,title:e.descriptionText||"Unnamed section",fields:n,conditions:ut(e.fields),constants:dt(e.fields)});return}e.kind==="union"&&e.options.forEach((n,i)=>{if(n.kind==="object"){const s=ct(n.fields);s.length>0&&a.push({id:`${t}-u${i}`,title:n.descriptionText||e.descriptionText||`Conditional branch ${i+1}`,fields:s,conditional:!0,conditions:ut(n.fields),constants:dt(n.fields)})}else Ie(n,`${t}-u${i}`,a)})}function Hi(e){const t=[];return Ie(e,"section",t),t}function Gi(e){const t={};for(const a of e){a.conditional||Object.assign(t,a.constants);for(const n of a.fields)n.schema.defaultValue!==void 0?t[n.path]=n.schema.defaultValue:n.schema.kind==="boolean"?t[n.path]=!1:t[n.path]=""}return t}function Gt(e,t){return e.conditional?Object.entries(e.constants).every(([a,n])=>t[a]===n):!0}function Ui(e,t){const a={...t};for(const n of e){if(Gt(n,t)){Object.assign(a,n.constants);continue}for(const i of n.fields)delete a[i.path]}return a}function Xe(e){return`field-${e.replaceAll(/[^a-zA-Z0-9_-]/g,"-")}`}function Wi(e){if(e.kind!=="union")return null;const t=e.options.filter(a=>a.kind==="const").map(a=>a.literalValue).filter(a=>typeof a=="string"||typeof a=="number"||typeof a=="boolean");return t.length!==e.options.length?null:t}function Xi(e){return e.path==="optimizer_type"?"optimizer":e.path==="lr_scheduler"?"scheduler":null}function Ki(e,t){const a=Wi(e.schema);if(!a)return null;const n=Xi(e);return n?fi(n,a,t):a.map(i=>({value:String(i),label:String(i),description:"",hiddenBySettings:!1}))}function Ji(e){return e!=null&&e.selectionNote?`<p class="field-helper-note">${o(e.selectionNote)}</p>`:""}function Yi(e,t){if(!e.roleConfig||typeof e.roleConfig!="object"||Array.isArray(e.roleConfig))return;const a=e.roleConfig[t];return typeof a=="string"?a:void 0}function Pe(e){return Array.isArray(e)?e.map(t=>String(t??"")):typeof e=="string"&&e.length>0?e.split(/\r?\n/):[]}function Zi(e,t,a){const n=Pe(t),i=n.length>0?n:[""],s=Xe(e.path);return`
    <div class="table-editor" data-table-path="${o(e.path)}">
      <div class="table-editor-rows">
        ${i.map((r,c)=>`
              <div class="table-editor-row">
                <input
                  id="${c===0?s:`${s}-${c}`}"
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
  `}function Qi(e,t){const a=e.schema,n=Xe(e.path),i=o(e.path),s=Ki(e,t),r=a.disabledFlag?"disabled":"",c=a.roleName||"";if(a.kind==="boolean")return`
      <label class="checkbox-row" for="${n}">
        <input id="${n}" data-field-path="${i}" data-field-kind="boolean" type="checkbox" ${t?"checked":""} ${r} />
        <span>${a.defaultValue===!0?"default on":"toggle"}</span>
      </label>
    `;if(a.kind==="array"){if(c==="table")return Zi(e,t,r);const p=Array.isArray(t)?t.join(`
`):"";return`<textarea id="${n}" class="field-input field-textarea" data-field-path="${i}" data-field-kind="array" ${r}>${o(p)}</textarea>`}if(s){const p=s.find(d=>d.value===String(t)),u=s.map(d=>`<option value="${o(d.value)}" ${d.value===String(t)?"selected":""}>${o(d.label)}</option>`).join("");return`
      <div class="enum-field-control">
        <select id="${n}" class="field-input" data-field-path="${i}" data-field-kind="enum" ${r}>${u}</select>
        ${Ji(p)}
      </div>
    `}if(a.kind==="number"){const p=a.minValue!==void 0?`min="${a.minValue}"`:"",u=a.maxValue!==void 0?`max="${a.maxValue}"`:"",d=a.stepValue!==void 0?`step="${a.stepValue}"`:'step="any"';if(c==="slider"&&a.minValue!==void 0&&a.maxValue!==void 0){const l=t===""||t===void 0||t===null?a.defaultValue??a.minValue:t;return`
        <div class="slider-editor">
          <input
            class="field-slider"
            data-field-path="${i}"
            data-field-kind="number"
            data-slider-role="range"
            type="range"
            value="${o(l)}"
            ${p}
            ${u}
            ${d}
            ${r}
          />
          <div class="slider-editor-footer">
            <input
              id="${n}"
              class="field-input slider-number-input"
              data-field-path="${i}"
              data-field-kind="number"
              data-slider-role="number"
              type="number"
              value="${o(l)}"
              ${p}
              ${u}
              ${d}
              ${r}
            />
            <span class="slider-value" data-slider-value-for="${i}">${o(l)}</span>
          </div>
        </div>
      `}return`<input id="${n}" class="field-input" data-field-path="${i}" data-field-kind="number" type="number" value="${o(t)}" ${p} ${u} ${d} ${r} />`}if(c==="textarea")return`<textarea id="${n}" class="field-input field-textarea" data-field-path="${i}" data-field-kind="string" ${r}>${o(t)}</textarea>`;if(c==="filepicker"){const p=Yi(a,"type")??(e.path.endsWith("_dir")||e.path==="resume"?"folder":"model-file");return`
      <div class="picker-control">
        <div class="picker-row">
          <input
            id="${n}"
            class="field-input"
            data-field-path="${i}"
            data-field-kind="string"
            type="text"
            value="${o(t)}"
            ${r}
          />
          <button
            class="action-button action-button-ghost picker-button"
            data-picker-path="${i}"
            data-picker-type="${o(p)}"
            type="button"
            ${r}
          >
            Browse
          </button>
        </div>
        <p class="picker-status" data-picker-status-for="${i}">
          Uses the backend native ${p==="folder"?"folder":"file"} picker.
        </p>
      </div>
    `}return a.kind==="const"?`<div class="field-readonly"><code>${o(a.literalValue??t)}</code></div>`:`<input id="${n}" class="field-input" data-field-path="${i}" data-field-kind="string" type="text" value="${o(t)}" ${r} />`}function en(e,t){const a=e.schema,n=[`<span class="mini-badge">${o(a.kind)}</span>`,a.roleName?`<span class="mini-badge mini-badge-muted">${o(a.roleName)}</span>`:"",a.requiredFlag?'<span class="mini-badge mini-badge-accent">required</span>':"",a.disabledFlag?'<span class="mini-badge mini-badge-muted">disabled</span>':""].filter(Boolean).join(""),i=[a.minValue!==void 0?`min ${a.minValue}`:"",a.maxValue!==void 0?`max ${a.maxValue}`:"",a.stepValue!==void 0?`step ${a.stepValue}`:""].filter(Boolean).join(" · ");return`
    <article class="field-card">
      <div class="field-card-head">
        <div>
          <label class="field-label" for="${Xe(e.path)}">${o(e.name)}</label>
          <p class="field-path">${o(e.path)}</p>
        </div>
        <div class="mini-badge-row">${n}</div>
      </div>
      <p class="field-description">${o(a.descriptionText||"No description")}</p>
      ${Qi(e,t)}
      <div class="field-meta">
        <span><strong>Default:</strong> ${o(a.defaultValue??"(none)")}</span>
        ${i?`<span><strong>Constraints:</strong> ${o(i)}</span>`:""}
      </div>
    </article>
  `}function Ut(e){return e.sections.filter(t=>Gt(t,e.values))}function Wt(e){return Ui(e.sections,e.values)}function tn(e,t){const a=Ut(e);if(a.length===0){f(t,"<p>No renderable sections extracted from this schema.</p>");return}const n=a.map(i=>{const s=i.fields.map(c=>en(c,e.values[c.path])).join(""),r=i.conditions.length?`<div class="condition-list">${i.conditions.map(c=>`<span class="coverage-pill coverage-pill-muted">${o(c)}</span>`).join("")}</div>`:"";return`
        <article class="panel schema-section-card">
          <div class="schema-section-head">
            <div>
              <p class="panel-kicker">${i.conditional?"conditional section":"section"}</p>
              <h3>${o(i.title)}</h3>
            </div>
            <span class="coverage-pill">${i.fields.length} fields</span>
          </div>
          ${r}
          <div class="field-grid">
            ${s}
          </div>
        </article>
      `}).join("");f(t,n)}function Re(e,t){const a=Object.fromEntries(Object.entries(Wt(e)).sort(([n],[i])=>n.localeCompare(i)));Y(t,JSON.stringify(a,null,2))}function _e(e){return e.filter(t=>t.name!=="shared"&&t.runtime instanceof w)}function pt(e,t){const a=e.schema;if(a.kind==="boolean")return!!t;if(a.kind==="number"){const n=String(t).trim();if(n==="")return"";const i=Number(n);return Number.isNaN(i)?"":i}return a.kind==="array"?String(t).split(/\r?\n/).map(n=>n.trim()).filter(Boolean):t}function ht(e,t){return e.sections.flatMap(a=>a.fields).find(a=>a.path===t)}function an(e,t){return[...e.querySelectorAll('[data-field-kind="table-row"]')].filter(a=>a.dataset.fieldPath===t).map(a=>a.value.trim()).filter(Boolean)}function re(e,t,a,n){const i=String(a??"");e.querySelectorAll("[data-field-path]").forEach(s=>{if(!(s===n||s.dataset.fieldPath!==t||s.dataset.fieldKind==="table-row")){if(s instanceof HTMLInputElement&&s.type==="checkbox"){s.checked=!!a;return}s.value=i}}),e.querySelectorAll("[data-slider-value-for]").forEach(s=>{s.dataset.sliderValueFor===t&&(s.textContent=i)})}function we(e,t,a,n="idle"){e.querySelectorAll("[data-picker-status-for]").forEach(i=>{i.dataset.pickerStatusFor===t&&(i.textContent=a,i.classList.remove("is-success","is-error"),n==="success"?i.classList.add("is-success"):n==="error"&&i.classList.add("is-error"))})}function nn(e,t,a,n){const i=document.querySelector(`#${t.sectionsId}`);if(!i)return;const s=new Set(e.sections.flatMap(r=>r.conditional?Object.keys(r.constants):[]));i.querySelectorAll("[data-field-path]").forEach(r=>{const c=r.dataset.fieldKind,p=r instanceof HTMLInputElement&&r.type==="checkbox"||r instanceof HTMLSelectElement?"change":"input";r.addEventListener(p,()=>{const u=r.dataset.fieldPath;if(!u)return;const d=ht(e,u);if(d){if(c==="table-row")e.values[u]=an(i,u);else{const l=r instanceof HTMLInputElement&&r.type==="checkbox"?r.checked:r.value;e.values[u]=pt(d,l),bi(e.values,u),re(i,u,e.values[u],r),u==="lr_scheduler"?re(i,"lr_scheduler_type",e.values.lr_scheduler_type):u==="lr_scheduler_type"&&re(i,"lr_scheduler",e.values.lr_scheduler)}if(s.has(u)){n({...e,values:{...e.values}});return}Re(e,t.previewId),a(e)}})}),i.querySelectorAll("[data-table-add]").forEach(r=>{r.addEventListener("click",()=>{const c=r.dataset.tableAdd;c&&(e.values[c]=[...Pe(e.values[c]),""],n({...e,values:{...e.values}}))})}),i.querySelectorAll("[data-table-remove]").forEach(r=>{r.addEventListener("click",()=>{const c=r.dataset.tableRemove,p=Number(r.dataset.tableIndex??"-1");if(!c||p<0)return;const u=Pe(e.values[c]).filter((d,l)=>l!==p);e.values[c]=u,n({...e,values:{...e.values}})})}),i.querySelectorAll("[data-picker-path]").forEach(r=>{r.addEventListener("click",async()=>{const c=r.dataset.pickerPath,p=r.dataset.pickerType||"model-file";if(!c)return;const u=ht(e,c);if(u){r.setAttribute("disabled","true"),we(i,c,"Waiting for native picker...","idle");try{const d=await U(p);if(e.values[c]=pt(u,d),re(i,c,e.values[c]),we(i,c,d,"success"),s.has(c)){n({...e,values:{...e.values}});return}Re(e,t.previewId),a(e)}catch(d){we(i,c,d instanceof Error?d.message:"The picker failed to return a value.","error")}finally{r.removeAttribute("disabled")}}})})}function me(e,t){const a=_e(e).find(i=>i.name===t);if(!a||!(a.runtime instanceof w))return null;const n=Hi(a.runtime);return{catalog:e,selectedName:t,sections:n,values:Gi(n)}}function ae(e,t,a,n){if(a(e),!e){h(t.summaryId,"Failed to build schema bridge state."),f(t.sectionsId,"<p>Schema bridge failed to initialize.</p>"),Y(t.previewId,"{}");return}const s=_e(e.catalog).map(u=>`<option value="${o(u.name)}" ${u.name===e.selectedName?"selected":""}>${o(u.name)}</option>`).join(""),r=Ut(e);f(t.selectId,s),h(t.summaryId,`${e.selectedName} · ${r.length}/${e.sections.length} visible sections · ${r.reduce((u,d)=>u+d.fields.length,0)} visible fields`),tn(e,t.sectionsId),Re(e,t.previewId);const c=document.querySelector(`#${t.selectId}`);c&&(c.onchange=()=>{const u=me(e.catalog,c.value);ae(u,t,a,n)});const p=document.querySelector(`#${t.resetId}`);p&&(p.onclick=()=>{ae(me(e.catalog,e.selectedName),t,a,n)}),nn(e,t,n,u=>ae(u,t,a,n)),n(e)}const sn={selectId:"schema-select",summaryId:"schema-summary",sectionsId:"schema-sections",previewId:"schema-preview",resetId:"schema-reset"};function rn(e){return{selectId:`${e}-schema-select`,summaryId:`${e}-summary`,sectionsId:`${e}-sections`,previewId:`${e}-preview`,resetId:`${e}-reset`}}async function on(e){var t,a,n;try{const s=((t=(await ze()).data)==null?void 0:t.schemas)??[],r=Ht(s),c=_e(r),p=((a=c.find(u=>u.name==="sdxl-lora"))==null?void 0:a.name)??((n=c[0])==null?void 0:n.name);if(!p){h("schema-summary","No selectable schemas were returned."),f("schema-sections","<p>No schema runtime available.</p>");return}ae(me(r,p),sn,e,()=>{})}catch(i){h("schema-summary","Schema bridge request failed"),f("schema-sections",`<p>${i instanceof Error?o(i.message):"Unknown error"}</p>`),Y("schema-preview","{}")}}function ln(e,t){return`
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
  `}function q(e,t,a){return`
    <section class="page-hero panel">
      <p class="eyebrow">${e}</p>
      <h2>${t}</h2>
      <p class="lede">${a}</p>
    </section>
  `}function mt(e,t,a="module"){return`
    <article class="panel info-card">
      <p class="panel-kicker">${a}</p>
      <h3>${e}</h3>
      <div>${t}</div>
    </article>
  `}function cn(){return`
    ${q("about","A clean source-side replacement for the current about page","This page is one of the safest migration targets because it is mostly branding, release context and ownership notes.")}
    <section class="two-column">
      ${mt("Project identity",`
          <p><strong>Product name:</strong> SD-reScripts</p>
          <p><strong>Version target:</strong> v1.0.2</p>
          <p><strong>Lineage:</strong> Fork from 秋葉 aaaki/lora-scripts</p>
          <p><strong>Maintainer:</strong> Modify By Lulynx</p>
        `,"brand")}
      ${mt("Why migrate this page first",`
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
      <p><a class="text-link" href="${B("/other/about.html")}" target="_blank" rel="noreferrer">Open current shipped about page</a></p>
    </section>
  `}function x(e){return`
    ${q(e.heroKicker,e.heroTitle,e.heroLede)}
    ${e.routeNotice?`
          <section class="panel info-card training-route-notice">
            <p class="panel-kicker">${e.routeNotice.kicker}</p>
            <h3>${e.routeNotice.title}</h3>
            <p>${e.routeNotice.detail}</p>
          </section>
        `:""}
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
            <p><a class="text-link" href="${B(e.legacyPath)}" target="_blank" rel="noreferrer">${e.legacyLabel}</a></p>
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
        <button id="${e.prefix}-clear-autosave" class="action-button action-button-ghost" type="button">Clear autosave</button>
        <button id="${e.prefix}-save-recipe" class="action-button action-button-ghost" type="button">Save recipe</button>
        <button id="${e.prefix}-read-recipes" class="action-button action-button-ghost" type="button">Recipes</button>
        <button id="${e.prefix}-import-recipe" class="action-button action-button-ghost" type="button">Import recipe</button>
        <button id="${e.prefix}-download-config" class="action-button action-button-ghost" type="button">Download config</button>
        <button id="${e.prefix}-export-preset" class="action-button action-button-ghost" type="button">Export preset</button>
        <button id="${e.prefix}-import-config" class="action-button action-button-ghost" type="button">Import config</button>
        <button id="${e.prefix}-load-presets" class="action-button action-button-ghost" type="button">Load presets</button>
        <button id="${e.prefix}-stop-train" class="action-button action-button-ghost" type="button">Stop train</button>
      </div>
      <p id="${e.prefix}-utility-note" class="section-note">Autosave and local recipe storage stay in this browser for this source route.</p>
      <div id="${e.prefix}-autosave-status" class="training-autosave-status"></div>
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
  `}function un(){return x({prefix:"anima-finetune",heroKicker:"anima finetune",heroTitle:"Anima finetune source training page",heroLede:"This route exposes the Anima finetune schema so the source-side bridge covers both LoRA and full finetune variants for that trainer family.",runnerTitle:"Anima finetune source-side runner",startButtonLabel:"Start Anima finetune",legacyPath:"/lora/anima-finetune.html",legacyLabel:"Open current shipped Anima finetune page",renderedTitle:"Anima finetune form bridge"})}function dn(){return x({prefix:"anima",heroKicker:"anima lora",heroTitle:"Anima LoRA source training page",heroLede:"This route surfaces the Anima LoRA schema on the shared training bridge instead of forcing that capability to stay hidden behind the shipped legacy page.",runnerTitle:"Anima LoRA source-side runner",startButtonLabel:"Start Anima LoRA training",legacyPath:"/lora/anima.html",legacyLabel:"Open current shipped Anima LoRA page",renderedTitle:"Anima LoRA form bridge"})}function pn(){return x({prefix:"dreambooth",heroKicker:"dreambooth train",heroTitle:"Dreambooth source training page",heroLede:"This route brings the Dreambooth and SDXL full-finetune schema into the same source-side training bridge so we can migrate one of the last big non-LoRA training paths cleanly.",runnerTitle:"Dreambooth source-side runner",startButtonLabel:"Start Dreambooth training",legacyPath:"/dreambooth/",legacyLabel:"Open current shipped Dreambooth page",renderedTitle:"Dreambooth form bridge"})}function hn(){return x({prefix:"flux-controlnet",heroKicker:"flux controlnet",heroTitle:"Flux ControlNet source training page",heroLede:"This route reuses the same source-side training bridge for Flux ControlNet so the DiT-family conditioning workflow stays aligned with the current backend schema and payload rules.",runnerTitle:"Flux ControlNet source-side runner",startButtonLabel:"Start Flux ControlNet training",legacyPath:"/lora/flux-controlnet.html",legacyLabel:"Open current shipped Flux ControlNet page",renderedTitle:"Flux ControlNet form bridge"})}function mn(){return x({prefix:"flux-finetune",heroKicker:"flux finetune",heroTitle:"Flux finetune source training page",heroLede:"This route exposes the dedicated Flux full-finetune schema on the same source-side training bridge so recipe shaping, preflight and launch behavior stay consistent.",runnerTitle:"Flux finetune source-side runner",startButtonLabel:"Start Flux finetune",legacyPath:"/lora/flux-finetune.html",legacyLabel:"Open current shipped Flux finetune page",renderedTitle:"Flux finetune form bridge"})}function gn(){return x({prefix:"flux",heroKicker:"flux train",heroTitle:"Flux LoRA source training page",heroLede:"This route reuses the source-side training bridge for Flux so we can keep payload shaping, compatibility checks and launch behavior aligned with the current backend.",runnerTitle:"Flux source-side runner",startButtonLabel:"Start Flux training",legacyPath:"/lora/flux.html",legacyLabel:"Open current shipped Flux page",renderedTitle:"Flux form bridge"})}function fn(){return x({prefix:"hunyuan-image",heroKicker:"hunyuan image",heroTitle:"Hunyuan Image LoRA source training page",heroLede:"This route exposes the Hunyuan Image LoRA schema so newer image trainer families live on the same source-side bridge instead of staying legacy-only.",runnerTitle:"Hunyuan Image source-side runner",startButtonLabel:"Start Hunyuan Image training",legacyPath:"/lora/hunyuan.html",legacyLabel:"Open current shipped Hunyuan Image page",renderedTitle:"Hunyuan Image form bridge"})}function bn(){return x({prefix:"lumina-finetune",heroKicker:"lumina finetune",heroTitle:"Lumina finetune source training page",heroLede:"This route exposes Lumina finetune on the shared source-side bridge so finetune-specific payloads can use the same autosave, preflight and launch safety checks.",runnerTitle:"Lumina finetune source-side runner",startButtonLabel:"Start Lumina finetune",legacyPath:"/lora/lumina-finetune.html",legacyLabel:"Open current shipped Lumina finetune page",renderedTitle:"Lumina finetune form bridge"})}function yn(){return x({prefix:"lumina",heroKicker:"lumina lora",heroTitle:"Lumina LoRA source training page",heroLede:"This route exposes the Lumina LoRA schema on the shared bridge so newer trainer families are available without falling back to older UI entry points.",runnerTitle:"Lumina LoRA source-side runner",startButtonLabel:"Start Lumina LoRA training",legacyPath:"/lora/lumina.html",legacyLabel:"Open current shipped Lumina LoRA page",renderedTitle:"Lumina LoRA form bridge"})}function vn(){return`
    ${q("schema bridge","Source-side schema explorer and prototype form bridge","This page evaluates the current schema DSL in the browser and turns it into sections, fields and editable defaults. It is the first direct bridge between the new source workspace and the training form core.")}
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
  `}function _n(){return x({prefix:"sd3-finetune",heroKicker:"sd3 finetune",heroTitle:"SD3 finetune source training page",heroLede:"This route brings the dedicated SD3 finetune schema into the shared source-side bridge so parameter normalization and runtime checks stay aligned with the backend.",runnerTitle:"SD3 finetune source-side runner",startButtonLabel:"Start SD3 finetune",legacyPath:"/lora/sd3-finetune.html",legacyLabel:"Open current shipped SD3 finetune page",renderedTitle:"SD3 finetune form bridge"})}function kn(){return x({prefix:"sd3",heroKicker:"sd3 train",heroTitle:"SD3 LoRA source training page",heroLede:"This route extends the same source-side training bridge to SD3 so we can keep the fast-moving schema-driven trainer paths on one shared foundation.",runnerTitle:"SD3 source-side runner",startButtonLabel:"Start SD3 training",legacyPath:"/lora/sd3.html",legacyLabel:"Open current shipped SD3 page",renderedTitle:"SD3 form bridge"})}function $n(){return x({prefix:"sd-controlnet",heroKicker:"sd controlnet",heroTitle:"SD ControlNet source training page",heroLede:"This route extends the shared source-side training bridge to the SD1.x / SD2.x ControlNet workflow so conditioning-dataset training can migrate without another bespoke form stack.",runnerTitle:"SD ControlNet source-side runner",startButtonLabel:"Start SD ControlNet training",legacyPath:"/lora/controlnet.html",legacyLabel:"Open current shipped SD ControlNet page",renderedTitle:"SD ControlNet form bridge"})}function wn(){return x({prefix:"sd-ti",heroKicker:"sd textual inversion",heroTitle:"SD textual inversion source training page",heroLede:"This route exposes the standard SD textual inversion schema through the shared training bridge, so embeddings can use the same source-side autosave, preflight and launch workflow.",runnerTitle:"SD textual inversion source-side runner",startButtonLabel:"Start SD textual inversion",legacyPath:"/lora/ti.html",legacyLabel:"Open current shipped SD textual inversion page",renderedTitle:"SD textual inversion form bridge"})}function xn(){return x({prefix:"sdxl-controlnet",heroKicker:"sdxl controlnet",heroTitle:"SDXL ControlNet source training page",heroLede:"This route keeps the SDXL ControlNet training path on the same source-side schema bridge, normalized payload builder and launch pipeline as the main LoRA routes.",runnerTitle:"SDXL ControlNet source-side runner",startButtonLabel:"Start SDXL ControlNet training",legacyPath:"/lora/sdxl-controlnet.html",legacyLabel:"Open current shipped SDXL ControlNet page",renderedTitle:"SDXL ControlNet form bridge",routeNotice:{kicker:"experimental",title:"SDXL clip_skip remains experimental here as well",detail:"ControlNet still shares the SDXL text-encoding path. If you enable clip_skip on this route, keep your inference stack aligned with the same SDXL clip-skip behavior."}})}function Sn(){return x({prefix:"sdxl-lllite",heroKicker:"sdxl lllite",heroTitle:"SDXL LLLite source training page",heroLede:"This route keeps the SDXL ControlNet-LLLite path on the shared source-side training bridge so even the more specialized conditioning flow no longer needs its own one-off migration path.",runnerTitle:"SDXL LLLite source-side runner",startButtonLabel:"Start SDXL LLLite training",legacyPath:"/lora/sdxl-lllite.html",legacyLabel:"Open current shipped SDXL LLLite page",renderedTitle:"SDXL LLLite form bridge",routeNotice:{kicker:"experimental",title:"SDXL clip_skip is experimental on LLLite too",detail:"The SDXL-side text encoding path is shared here, so clip_skip support is available but still experimental. Keep training and inference behavior matched if you use it."}})}function Tn(){return x({prefix:"sdxl-ti",heroKicker:"sdxl textual inversion",heroTitle:"SDXL textual inversion source training page",heroLede:"This route exposes SDXL textual inversion through the same source-side training bridge, so embeddings, prompt helpers and launch safety checks stay unified.",runnerTitle:"SDXL textual inversion source-side runner",startButtonLabel:"Start SDXL textual inversion",legacyPath:"/lora/sdxl-ti.html",legacyLabel:"Open current shipped SDXL textual inversion page",renderedTitle:"SDXL textual inversion form bridge",routeNotice:{kicker:"experimental",title:"SDXL clip_skip support is experimental",detail:"This route can now carry clip_skip into the SDXL text encoding path, but it is still an experimental compatibility feature rather than a long-settled default."}})}function Ln(){return x({prefix:"sdxl",heroKicker:"sdxl train",heroTitle:"First source-side SDXL training page",heroLede:"This is the first page that moves beyond passive inspection: it renders the SDXL schema, tracks a real config model and can submit to the current training backend.",runnerTitle:"SDXL source-side runner",startButtonLabel:"Start SDXL training",legacyPath:"/lora/sdxl.html",legacyLabel:"Open current shipped SDXL page",renderedTitle:"SDXL form bridge",routeNotice:{kicker:"experimental",title:"SDXL clip_skip is now opt-in experimental support",detail:"This build can pass clip_skip through the SDXL training path, but it should be treated as experimental. If you rely on it, use matching SDXL clip-skip behavior at inference time too."}})}function An(){return`
    ${q("settings","Settings and Training Catalog Controls","Tune what the rebuilt source-side trainer surfaces by default, including curated optimizer and scheduler visibility.")}
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
    <section class="panel prose-panel settings-callout">
      <h3>Training option visibility</h3>
      <p>
        The source-side training forms can now expose a curated set of optimizers and schedulers by default.
        Hidden items stay available in Settings so you can turn them back on without touching schema files.
      </p>
      <p>
        External scheduler selections are bridged into <code>lr_scheduler_type</code> automatically.
        External optimizer selections still require the matching Python package in the active environment.
      </p>
      <p><a class="text-link" href="${B("/other/settings.html")}" target="_blank" rel="noreferrer">Open current shipped settings page</a></p>
    </section>
    <section class="panel info-card">
      <p class="panel-kicker">runtime packages</p>
      <h3 id="settings-runtime-title">Loading runtime dependency status...</h3>
      <div id="settings-runtime-body">Checking /api/graphic_cards</div>
    </section>
    <section class="two-column settings-option-sections">
      <article class="panel info-card">
        <p class="panel-kicker">optimizer catalog</p>
        <h3 id="settings-optimizer-title">Loading optimizer visibility...</h3>
        <div id="settings-optimizer-body">Preparing optimizer registry</div>
      </article>
      <article class="panel info-card">
        <p class="panel-kicker">scheduler catalog</p>
        <h3 id="settings-scheduler-title">Loading scheduler visibility...</h3>
        <div id="settings-scheduler-body">Preparing scheduler registry</div>
      </article>
    </section>
  `}function En(){return`
    ${q("tag editor","Tag editor wrapper migration page","The current shipped page is mostly a wrapper around startup state and proxy behavior. That makes it a good low-risk source-side rewrite.")}
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
          <p><a class="text-link" href="${B("/tageditor.html")}" target="_blank" rel="noreferrer">Open current shipped tag editor wrapper</a></p>
        </div>
      </article>
    </section>
  `}function In(){return`
    ${q("tasks","Task monitor migration page","This route is already talking to the real backend task manager, so it is a strong candidate for early source migration.")}
    <section class="panel task-panel">
      <div class="task-toolbar">
        <button id="refresh-tasks" class="action-button" type="button">Refresh tasks</button>
        <a class="text-link task-legacy-link" href="${B("/task.html")}" target="_blank" rel="noreferrer">Open current shipped task page</a>
      </div>
      <div id="task-table-container" class="task-table-container loading">Loading tasks...</div>
    </section>
  `}function Pn(){return`
    ${q("tensorboard","TensorBoard wrapper migration page","This page can be rebuilt without touching training forms because it mainly needs status text and a proxy destination.")}
    <section class="two-column">
      <article class="panel info-card">
        <p class="panel-kicker">proxy</p>
        <h3>Legacy backend path</h3>
        <div>
          <p>The current runtime proxies TensorBoard through <code>/proxy/tensorboard/</code>.</p>
          <p>This source-side page can later offer a cleaner iframe or open-in-new-tab flow.</p>
          <p><a class="text-link" href="${B("/proxy/tensorboard/")}" target="_blank" rel="noreferrer">Open current TensorBoard proxy</a></p>
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
  `}function Rn(){return`
    ${q("tools","Tools workspace","This route now covers both raw script launching and the first reusable dataset utility, so it can grow into a real preflight toolbox instead of staying a placeholder.")}
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
      <p><a class="text-link" href="${B("/tageditor.html")}" target="_blank" rel="noreferrer">Open current shipped tag editor wrapper</a></p>
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
      <p><a class="text-link" href="${B("/lora/tools.html")}" target="_blank" rel="noreferrer">Open current shipped tools page</a></p>
      <div id="tools-browser" class="tools-browser loading">Loading available scripts...</div>
    </section>
  `}const Nn=[{method:"GET",path:"/api/schemas/all",purpose:"Fetch all schema definitions used to render training forms.",migrationPriority:"high"},{method:"GET",path:"/api/schemas/hashes",purpose:"Hot-reload check for schema changes.",migrationPriority:"medium"},{method:"GET",path:"/api/presets",purpose:"Fetch preset configs for pages and tools.",migrationPriority:"high"},{method:"GET",path:"/api/config/saved_params",purpose:"Load stored UI parameter choices.",migrationPriority:"medium"},{method:"GET",path:"/api/config/summary",purpose:"Read app config summary for the rebuilt settings page.",migrationPriority:"medium"},{method:"GET",path:"/api/graphic_cards",purpose:"List GPUs plus runtime dependency and xformers support state.",migrationPriority:"high"},{method:"POST",path:"/api/run",purpose:"Start schema-driven training jobs.",migrationPriority:"high"},{method:"POST",path:"/api/train/preflight",purpose:"Run backend-aware training preflight checks before launch.",migrationPriority:"high"},{method:"POST",path:"/api/train/sample_prompt",purpose:"Resolve and preview the effective training sample prompt text without launching a run.",migrationPriority:"high"},{method:"POST",path:"/api/dataset/masked_loss_audit",purpose:"Inspect alpha-channel mask readiness for masked-loss training workflows.",migrationPriority:"high"},{method:"POST",path:"/api/run_script",purpose:"Run utility scripts from the tools page.",migrationPriority:"high"},{method:"POST",path:"/api/interrogate",purpose:"Run the built-in tagger/interrogator flow.",migrationPriority:"high"},{method:"GET",path:"/api/interrogators",purpose:"List available batch tagger/interrogator models for the rebuilt tools workspace.",migrationPriority:"high"},{method:"POST",path:"/api/captions/cleanup/preview",purpose:"Preview bulk caption cleanup rules before touching files.",migrationPriority:"high"},{method:"POST",path:"/api/captions/cleanup/apply",purpose:"Apply bulk caption cleanup rules to caption files.",migrationPriority:"high"},{method:"POST",path:"/api/captions/backups/create",purpose:"Create a snapshot archive of caption files for later restore.",migrationPriority:"high"},{method:"POST",path:"/api/captions/backups/list",purpose:"List caption snapshots associated with a folder.",migrationPriority:"high"},{method:"POST",path:"/api/captions/backups/restore",purpose:"Restore caption files from a saved snapshot archive.",migrationPriority:"high"},{method:"GET",path:"/api/pick_file",purpose:"Open native file/folder pickers where supported.",migrationPriority:"medium"},{method:"GET",path:"/api/get_files",purpose:"List model, output or train directories for file pickers.",migrationPriority:"high"},{method:"GET",path:"/api/tasks",purpose:"Fetch active and historical task state.",migrationPriority:"high"},{method:"GET",path:"/api/tasks/terminate/{task_id}",purpose:"Terminate a running task.",migrationPriority:"high"},{method:"GET",path:"/api/tageditor_status",purpose:"Poll tag-editor startup/proxy status.",migrationPriority:"medium"},{method:"GET",path:"/api/scripts",purpose:"List backend-approved utility scripts and positional args for the rebuilt tools page.",migrationPriority:"high"}];function Xt(){const e=Lt.map(a=>`
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
      `).join(""),t=Nn.map(a=>`
        <tr>
          <td><span class="method method-${a.method.toLowerCase()}">${a.method}</span></td>
          <td><code>${a.path}</code></td>
          <td>${a.purpose}</td>
          <td>${a.migrationPriority}</td>
        </tr>
      `).join("");return`
    ${q("workspace","Source migration dashboard","This page stays close to the backend and keeps our migration map explicit instead of hiding it inside hashed dist chunks.")}

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
  `}function Cn(){return x({prefix:"xti",heroKicker:"sd xti",heroTitle:"SD XTI source training page",heroLede:"This route exposes the SD XTI schema on the shared source-side bridge so more specialized embedding workflows are no longer hidden behind the legacy page only.",runnerTitle:"SD XTI source-side runner",startButtonLabel:"Start SD XTI training",legacyPath:"/lora/xti.html",legacyLabel:"Open current shipped SD XTI page",renderedTitle:"SD XTI form bridge"})}function Dn(e){return typeof e=="object"&&e!==null}function Bn(e,t){if(!Dn(e)){const i=e.match(/GPU\s+(\d+):/i);return{value:i?i[1]:String(t),label:e}}const a=e.index??e.id??t,n=String(a);return{value:n,label:`GPU ${n}: ${e.name}`}}function qn(e,t){if(t.length===0){f(e,"<p>No GPUs reported. Training will use the backend default environment.</p>");return}const a=t.map((n,i)=>{const s=Bn(n,i);return`
        <label class="gpu-chip">
          <input type="checkbox" data-gpu-id="${o(s.value)}" />
          <span>${o(s.label)}</span>
        </label>
      `}).join("");f(e,`<div class="gpu-chip-grid">${a}</div>`)}function Ke(e){return[...document.querySelectorAll(`#${e} input[data-gpu-id]:checked`)].map(t=>t.dataset.gpuId).filter(t=>!!t)}function Je(e,t=[]){const a=new Set(t.map(n=>String(n)));document.querySelectorAll(`#${e}-gpu-selector input[data-gpu-id]`).forEach(n=>{const i=n.dataset.gpuId??"";n.checked=a.has(i)})}function zn(e){switch(e){case"prompt_file":return"Prompt file";case"generated":return"Generated from current fields";case"random_dataset_prompt_preview":return"Random dataset-derived prompt";case"legacy_sample_prompts_file":return"Legacy sample_prompts file";case"legacy_sample_prompts_inline":return"Legacy sample_prompts text";default:return e}}function On(e){return!e||e.required.length===0?"":`
    <div>
      <strong>Runtime dependencies</strong>
      <ul class="status-list">
        ${e.required.map(t=>{const a=t.required_for.join(", "),n=t.importable?`${t.display_name} ready${t.version?` (${t.version})`:""}`:`${t.display_name} unavailable${t.reason?`: ${t.reason}`:""}`;return`<li>${o(`${n} · ${a}`)}</li>`}).join("")}
      </ul>
    </div>
  `}function P(e,t,a,n="idle"){f(`${e}-submit-status`,`
      <div class="submit-status-box submit-status-${n}">
        <strong>${o(t)}</strong>
        <p>${o(a)}</p>
      </div>
    `)}function ge(e,t,a){if(a){f(`${e}-validation-status`,`
        <div class="submit-status-box submit-status-error">
          <strong>Payload preparation failed</strong>
          <p>${o(a)}</p>
        </div>
      `);return}const n=[t.errors.length>0?`
          <div>
            <strong>Errors</strong>
            <ul class="status-list">
              ${t.errors.map(i=>`<li>${o(i)}</li>`).join("")}
            </ul>
          </div>
        `:"",t.warnings.length>0?`
          <div>
            <strong>Warnings</strong>
            <ul class="status-list">
              ${t.warnings.map(i=>`<li>${o(i)}</li>`).join("")}
            </ul>
          </div>
        `:""].filter(Boolean).join("");if(!n){f(`${e}-validation-status`,`
        <div class="submit-status-box submit-status-success">
          <strong>Compatibility checks passed</strong>
          <p>No obvious parameter conflicts were detected in the current payload.</p>
        </div>
      `);return}f(`${e}-validation-status`,`
      <div class="submit-status-box ${t.errors.length>0?"submit-status-error":"submit-status-warning"}">
        <strong>${t.errors.length>0?"Action needed before launch":"Review before launch"}</strong>
        ${n}
      </div>
    `)}function v(e,t,a="idle"){const n=document.querySelector(`#${e}-utility-note`);n&&(n.textContent=t,n.classList.remove("utility-note-success","utility-note-warning","utility-note-error"),a==="success"?n.classList.add("utility-note-success"):a==="warning"?n.classList.add("utility-note-warning"):a==="error"&&n.classList.add("utility-note-error"))}function Ye(e,t){if(!(t!=null&&t.value)){f(`${e}-autosave-status`,`
        <div class="coverage-list">
          <span class="coverage-pill coverage-pill-muted">No local autosave stored yet</span>
        </div>
      `);return}const a=Array.isArray(t.gpu_ids)?t.gpu_ids.length:0;f(`${e}-autosave-status`,`
      <div class="coverage-list">
        <span class="coverage-pill">Autosave ready</span>
        <span class="coverage-pill coverage-pill-muted">${o(t.time)}</span>
        <span class="coverage-pill coverage-pill-muted">${a>0?`${a} GPU${a===1?"":"s"}`:"default GPU selection"}</span>
      </div>
      <p class="training-autosave-note">${o(t.name||"Unnamed autosave snapshot")}</p>
    `)}function gt(e,t,a){if(a){f(`${e}-preflight-report`,`
        <div class="submit-status-box submit-status-error">
          <strong>Preflight request failed</strong>
          <p>${o(a)}</p>
        </div>
      `);return}if(!t){f(`${e}-preflight-report`,`
        <div class="submit-status-box">
          <strong>Training preflight has not run yet</strong>
          <p>Run preflight to verify dataset, model, resume path, prompt preview, and runtime fallback expectations before launch.</p>
        </div>
      `);return}const n=[t.errors.length?`
          <div>
            <strong>Errors</strong>
            <ul class="status-list">
              ${t.errors.map(i=>`<li>${o(i)}</li>`).join("")}
            </ul>
          </div>
        `:"",t.warnings.length?`
          <div>
            <strong>Warnings</strong>
            <ul class="status-list">
              ${t.warnings.map(i=>`<li>${o(i)}</li>`).join("")}
            </ul>
          </div>
        `:"",t.notes.length?`
          <div>
            <strong>Notes</strong>
            <ul class="status-list">
              ${t.notes.map(i=>`<li>${o(i)}</li>`).join("")}
            </ul>
          </div>
        `:"",On(t.dependencies),t.dataset?`
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
            <p class="training-preflight-meta">${o(zn(t.sample_prompt.source))}${t.sample_prompt.detail?` · ${o(t.sample_prompt.detail)}`:""}</p>
            <pre class="preset-preview">${o(t.sample_prompt.preview)}</pre>
          </div>
        `:""].filter(Boolean).join("");f(`${e}-preflight-report`,`
      <div class="submit-status-box ${t.errors.length>0?"submit-status-error":t.can_start?"submit-status-success":"submit-status-warning"}">
        <strong>${t.can_start?"Backend preflight passed":"Backend preflight found launch blockers"}</strong>
        <p>Training type: ${o(t.training_type)}</p>
        ${n}
      </div>
    `)}function Fn(e){const t=[];let a="",n=null,i=0;for(let s=0;s<e.length;s+=1){const r=e[s],c=s>0?e[s-1]:"";if(n){a+=r,r===n&&c!=="\\"&&(n=null);continue}if(r==='"'||r==="'"){n=r,a+=r;continue}if(r==="["){i+=1,a+=r;continue}if(r==="]"){i-=1,a+=r;continue}if(r===","&&i===0){t.push(a.trim()),a="";continue}a+=r}return a.trim().length>0&&t.push(a.trim()),t}function jn(e){let t=null,a=!1,n="";for(const i of e){if(t){if(n+=i,t==='"'&&i==="\\"&&!a){a=!0;continue}i===t&&!a&&(t=null),a=!1;continue}if(i==='"'||i==="'"){t=i,n+=i;continue}if(i==="#")break;n+=i}return n.trim()}function Kt(e){return e.startsWith('"')&&e.endsWith('"')?e.slice(1,-1).replaceAll('\\"','"').replaceAll("\\n",`
`).replaceAll("\\t","	").replaceAll("\\\\","\\"):e.startsWith("'")&&e.endsWith("'")?e.slice(1,-1):e}function Jt(e){const t=e.trim();return t.length===0?"":t.startsWith('"')&&t.endsWith('"')||t.startsWith("'")&&t.endsWith("'")?Kt(t):t==="true"?!0:t==="false"?!1:t.startsWith("[")&&t.endsWith("]")?Fn(t.slice(1,-1)).map(a=>Jt(a)):/^[+-]?\d[\d_]*(\.\d[\d_]*)?([eE][+-]?\d+)?$/.test(t)?Number(t.replaceAll("_","")):t}function ft(e){return e.split(".").map(t=>t.trim()).filter(Boolean).map(t=>Kt(t))}function Mn(e,t,a){let n=e;for(let i=0;i<t.length-1;i+=1){const s=t[i],r=n[s];(!r||typeof r!="object"||Array.isArray(r))&&(n[s]={}),n=n[s]}n[t[t.length-1]]=a}function Ze(e){const t={};let a=[];for(const n of e.split(/\r?\n/)){const i=jn(n);if(!i)continue;if(i.startsWith("[[")&&i.endsWith("]]"))throw new Error("Array-of-table syntax is not supported in custom params yet.");if(i.startsWith("[")&&i.endsWith("]")){a=ft(i.slice(1,-1));continue}const s=i.indexOf("=");if(s===-1)throw new Error(`Invalid TOML line: ${n}`);const r=ft(i.slice(0,s));if(r.length===0)throw new Error(`Invalid TOML key: ${n}`);Mn(t,[...a,...r],Jt(i.slice(s+1)))}return t}function xe(e){return JSON.stringify(e)}function Yt(e){return typeof e=="string"?xe(e):typeof e=="number"?Number.isFinite(e)?String(e):xe(String(e)):typeof e=="boolean"?e?"true":"false":Array.isArray(e)?`[${e.map(t=>Yt(t)).join(", ")}]`:xe(JSON.stringify(e))}function Zt(e,t=[],a=[]){const n=[];for(const[i,s]of Object.entries(e)){if(s&&typeof s=="object"&&!Array.isArray(s)){Zt(s,[...t,i],a);continue}n.push([i,s])}return a.push({path:t,values:n}),a}function Ne(e){const t=Zt(e).filter(n=>n.values.length>0).sort((n,i)=>n.path.join(".").localeCompare(i.path.join("."))),a=[];for(const n of t){n.path.length>0&&(a.length>0&&a.push(""),a.push(`[${n.path.join(".")}]`));for(const[i,s]of n.values.sort(([r],[c])=>r.localeCompare(c)))a.push(`${i} = ${Yt(s)}`)}return a.join(`
`)}const Vn=["pretrained_model_name_or_path","train_data_dir","reg_data_dir","output_dir","network_weights","conditioning_data_dir","controlnet_model_name_or_path","weights","vae","text_encoder","byt5","qwen3","llm_adapter_path","t5_tokenizer_path","ae","clip_l","clip_g","t5xxl","gemma2"],Hn=["learning_rate","unet_lr","text_encoder_lr","learning_rate_te","learning_rate_te1","learning_rate_te2","learning_rate_te3","sigmoid_scale","guidance_scale","training_shift","control_net_lr","self_attn_lr","cross_attn_lr","mlp_lr","mod_lr","llm_adapter_lr"],Gn=["lycoris_algo","conv_dim","conv_alpha","dropout","dylora_unit","lokr_factor","train_norm","down_lr_weight","mid_lr_weight","up_lr_weight","block_lr_zero_threshold","enable_block_weights","enable_preview","network_args_custom","optimizer_args_custom","enable_base_weight","prodigy_d0","prodigy_d_coef","ui_custom_params"],Un=["vae","reg_data_dir","network_weights","conditioning_data_dir","controlnet_model_name_or_path","weights","init_word","text_encoder","byt5","qwen3","llm_adapter_path","t5_tokenizer_path","ae","clip_l","clip_g","t5xxl","gemma2","noise_offset","multires_noise_iterations","multires_noise_discount","caption_dropout_rate","network_dropout","scale_weight_norms","gpu_ids"],bt=["v2","v_parameterization","scale_v_pred_loss_like_noise_pred","clip_skip","learning_rate_te","stop_text_encoder_training"],Wn=["learning_rate_te1","learning_rate_te2"],Xn=[["cache_text_encoder_outputs","shuffle_caption"],["noise_offset","multires_noise_iterations"],["cache_latents","color_aug"],["cache_latents","random_crop"]],yt={algo:"lycoris_algo",unit:"dylora_unit",factor:"lokr_factor"},Kn=new Set(["conv_dim","conv_alpha","dropout","down_lr_weight","mid_lr_weight","up_lr_weight","block_lr_zero_threshold"]),Jn=new Set(["decouple","weight_decay","use_bias_correction","safeguard_warmup"]),Yn=new Set(["base_weights","base_weights_multiplier"]),Zn={pretrained_model_name_or_path:"./sd-models/model.safetensors",train_data_dir:"./train/aki",resolution:"512,512",enable_bucket:!0,min_bucket_reso:256,max_bucket_reso:1024,output_name:"aki",output_dir:"./output",save_model_as:"safetensors",save_every_n_epochs:2,max_train_epochs:10,train_batch_size:1,network_train_unet_only:!1,network_train_text_encoder_only:!1,learning_rate:1e-4,unet_lr:1e-4,text_encoder_lr:1e-5,lr_scheduler:"cosine_with_restarts",optimizer_type:"AdamW8bit",lr_scheduler_num_cycles:1,network_module:"networks.lora",network_dim:32,network_alpha:32,logging_dir:"./logs",caption_extension:".txt",shuffle_caption:!0,keep_tokens:0,max_token_length:255,seed:1337,prior_loss_weight:1,clip_skip:2,mixed_precision:"fp16",save_precision:"fp16",xformers:!0,cache_latents:!0,persistent_data_loader_workers:!0};function Ce(e){return JSON.parse(JSON.stringify(e??{}))}function oe(e){return Array.isArray(e)?e.map(t=>String(t??"").trim()).filter(Boolean):String(e??"").split(/\r?\n/).map(t=>t.trim()).filter(Boolean)}function F(e,t){return Object.prototype.hasOwnProperty.call(e,t)}function Qn(e){return String(e.model_train_type??"").startsWith("sdxl")}function es(e){return String(e.model_train_type??"")==="sd3-finetune"}function k(e){return e==null?"":String(e)}function ts(e){return k(e).replaceAll("\\","/")}function z(e,t=0){const a=Number.parseFloat(k(e));return Number.isNaN(a)?t:a}function y(e){return!!e}function vt(e){const t=e.indexOf("=");return t===-1?{key:e.trim(),value:"",hasValue:!1}:{key:e.slice(0,t).trim(),value:e.slice(t+1).trim(),hasValue:!0}}function as(e){if(typeof e=="boolean")return e;const t=k(e).toLowerCase();return t==="true"||t==="1"||t==="yes"}function Qe(e,t=String(e.model_train_type??"")){const a=t==="lora-basic"?{...Zn,...Ce(e)}:Ce(e);vi(a);const n=[],i=[],s=Qn(a),r=es(a);(s||r)&&[a.learning_rate_te1,a.learning_rate_te2,a.learning_rate_te3].some(y)&&(a.train_text_encoder=!0);const c=s?bt.filter(d=>d!=="clip_skip"):r?bt:Wn;for(const d of c)F(a,d)&&delete a[d];a.network_module==="lycoris.kohya"?(n.push(`conv_dim=${k(a.conv_dim)}`,`conv_alpha=${k(a.conv_alpha)}`,`dropout=${k(a.dropout)}`,`algo=${k(a.lycoris_algo)}`),y(a.lokr_factor)&&n.push(`factor=${k(a.lokr_factor)}`),y(a.train_norm)&&n.push("train_norm=True")):a.network_module==="networks.dylora"&&n.push(`unit=${k(a.dylora_unit)}`);const p=k(a.optimizer_type),u=p.toLowerCase();u.startsWith("dada")?((p==="DAdaptation"||p==="DAdaptAdam")&&i.push("decouple=True","weight_decay=0.01"),a.learning_rate=1,a.unet_lr=1,a.text_encoder_lr=1):u==="prodigy"&&(i.push("decouple=True","weight_decay=0.01","use_bias_correction=True",`d_coef=${k(a.prodigy_d_coef)}`),y(a.lr_warmup_steps)&&i.push("safeguard_warmup=True"),y(a.prodigy_d0)&&i.push(`d0=${k(a.prodigy_d0)}`)),y(a.enable_block_weights)&&(n.push(`down_lr_weight=${k(a.down_lr_weight)}`,`mid_lr_weight=${k(a.mid_lr_weight)}`,`up_lr_weight=${k(a.up_lr_weight)}`,`block_lr_zero_threshold=${k(a.block_lr_zero_threshold)}`),delete a.block_lr_zero_threshold),y(a.enable_base_weight)?(a.base_weights=oe(a.base_weights),a.base_weights_multiplier=oe(a.base_weights_multiplier).map(d=>z(d))):(delete a.base_weights,delete a.base_weights_multiplier);for(const d of oe(a.network_args_custom))n.push(d);for(const d of oe(a.optimizer_args_custom))i.push(d);y(a.enable_preview)||(delete a.sample_prompts,delete a.sample_sampler,delete a.sample_every_n_epochs);for(const d of Hn)F(a,d)&&(a[d]=z(a[d]));for(const d of Un){if(!F(a,d))continue;const l=a[d];(l===0||l===""||Array.isArray(l)&&l.length===0)&&delete a[d]}for(const d of Vn)F(a,d)&&a[d]&&(a[d]=ts(a[d]));if(n.length>0?a.network_args=n:delete a.network_args,i.length>0?a.optimizer_args=i:delete a.optimizer_args,y(a.ui_custom_params)){const d=Ze(k(a.ui_custom_params));Object.assign(a,d)}for(const d of Gn)F(a,d)&&delete a[d];return Array.isArray(a.gpu_ids)&&(a.gpu_ids=a.gpu_ids.map(d=>{const l=k(d),g=l.match(/GPU\s+(\d+):/);return g?g[1]:l})),a}function is(e){const t=[],a=[],n=k(e.optimizer_type),i=n.toLowerCase(),s=k(e.model_train_type),r=k(e.model_type).trim().toLowerCase(),c=k(e.conditioning_data_dir).trim(),p=k(e.reg_data_dir).trim(),u=k(e.attn_mode).trim().toLowerCase(),d=y(e.cache_text_encoder_outputs),l=!y(e.network_train_unet_only),g=s.startsWith("sdxl"),m=s==="sd3-finetune",b=s==="sd3-lora",_=s==="flux-lora",$=s==="anima-lora"||s==="anima-finetune",S=s==="hunyuan-image-lora",A=s.includes("controlnet"),M=g||b||_||$||S,X=g||b||_||S;n.startsWith("DAdapt")&&e.lr_scheduler!=="constant"&&t.push("DAdaptation works best with lr_scheduler set to constant."),i.startsWith("prodigy")&&(F(e,"unet_lr")||F(e,"text_encoder_lr"))&&(z(e.unet_lr,1)!==1||z(e.text_encoder_lr,1)!==1)&&t.push("Prodigy usually expects unet_lr and text_encoder_lr to stay at 1."),e.network_module==="networks.oft"&&s!=="sdxl-lora"&&a.push("OFT is currently only supported for SDXL LoRA."),y(e.network_train_unet_only)&&y(e.network_train_text_encoder_only)&&a.push("network_train_unet_only and network_train_text_encoder_only cannot be enabled at the same time."),m&&y(e.train_text_encoder)&&y(e.cache_text_encoder_outputs)&&!y(e.use_t5xxl_cache_only)&&a.push("SD3 full finetune cannot train text encoders while cache_text_encoder_outputs is enabled."),m&&y(e.train_t5xxl)&&!y(e.train_text_encoder)&&a.push("train_t5xxl requires train_text_encoder to be enabled first."),m&&y(e.train_t5xxl)&&y(e.cache_text_encoder_outputs)&&a.push("train_t5xxl cannot be combined with cache_text_encoder_outputs."),$&&y(e.unsloth_offload_checkpointing)&&y(e.cpu_offload_checkpointing)&&a.push("unsloth_offload_checkpointing cannot be combined with cpu_offload_checkpointing."),$&&y(e.unsloth_offload_checkpointing)&&y(e.blocks_to_swap)&&a.push("unsloth_offload_checkpointing cannot be combined with blocks_to_swap."),A&&c.length===0&&a.push("conditioning_data_dir is required for ControlNet training routes."),A&&p.length>0&&t.push("reg_data_dir is usually ignored for ControlNet training routes. Use conditioning_data_dir pairs instead."),A&&F(e,"prior_loss_weight")&&t.push("prior_loss_weight is not normally used by ControlNet training routes."),p.length>0&&z(e.prior_loss_weight,1)<=0&&t.push("reg_data_dir is set, but prior_loss_weight is 0 or lower, so regularization images may have no effect."),y(e.cache_text_encoder_outputs_to_disk)&&!y(e.cache_text_encoder_outputs)&&t.push("cache_text_encoder_outputs_to_disk will force cache_text_encoder_outputs on during training."),_&&r==="chroma"&&!y(e.apply_t5_attn_mask)&&a.push("FLUX Chroma requires apply_t5_attn_mask to stay enabled."),M&&d&&l&&a.push("cache_text_encoder_outputs cannot be combined with Text Encoder LoRA training on this route. Enable network_train_unet_only instead."),X&&d&&z(e.caption_dropout_rate,0)>0&&a.push("cache_text_encoder_outputs cannot be combined with caption_dropout_rate on this route."),M&&d&&(y(e.shuffle_caption)||z(e.caption_tag_dropout_rate,0)>0||z(e.token_warmup_step,0)>0)&&a.push("cache_text_encoder_outputs cannot be combined with shuffle_caption, caption_tag_dropout_rate, or token_warmup_step on this route."),(_||b)&&d&&y(e.train_t5xxl)&&a.push("train_t5xxl cannot be combined with cache_text_encoder_outputs on this route."),S&&!y(e.network_train_unet_only)&&a.push("Hunyuan Image LoRA currently requires network_train_unet_only."),g&&!y(e.network_train_unet_only)&&!y(e.network_train_text_encoder_only)&&t.push("SDXL LoRA usually behaves best with network_train_unet_only enabled unless you explicitly want Text Encoder LoRA training."),($||S)&&u==="sageattn"&&a.push("sageattn is inference-only for this trainer and should not be selected for training."),($||S)&&u==="xformers"&&!y(e.split_attn)&&a.push("attn_mode=xformers requires split_attn for this trainer."),u&&(y(e.xformers)||y(e.sdpa))&&t.push("attn_mode is set, so the plain xformers/sdpa toggles may be ignored by this trainer."),y(e.masked_loss)&&!y(e.alpha_mask)&&!y(e.conditioning_data_dir)&&t.push("masked_loss is on, but alpha_mask is off. For normal alpha-channel datasets this often becomes a no-op."),g&&y(e.clip_skip)&&t.push("SDXL clip_skip in this build is experimental. Use the same clip-skip behavior at inference time if you rely on it.");for(const[T,V]of Xn)y(e[T])&&y(e[V])&&a.push(`Parameters ${T} and ${V} conflict. Please enable only one of them.`);return{warnings:t,errors:a}}function Qt(e){const t=Ce(e);if(yi(t),Array.isArray(t.network_args)){const a=[];for(const n of t.network_args){const{key:i,value:s,hasValue:r}=vt(k(n));if(i==="train_norm"){t.train_norm=r?as(s):!0;continue}if((i==="down_lr_weight"||i==="mid_lr_weight"||i==="up_lr_weight"||i==="block_lr_zero_threshold")&&(t.enable_block_weights=!0),Kn.has(i)){t[i]=s;continue}if(yt[i]){t[yt[i]]=s;continue}a.push(k(n))}a.length>0&&(t.network_args_custom=a),delete t.network_args}if(Array.isArray(t.optimizer_args)){const a=[];for(const n of t.optimizer_args){const{key:i,value:s}=vt(k(n));if(i==="d_coef"){t.prodigy_d_coef=s;continue}if(i==="d0"){t.prodigy_d0=s;continue}Jn.has(i)||a.push(k(n))}a.length>0&&(t.optimizer_args_custom=a),delete t.optimizer_args}for(const a of Yn)Array.isArray(t[a])&&(t[a]=t[a].map(n=>k(n)).join(`
`),a==="base_weights"&&(t.enable_base_weight=!0),a==="base_weights_multiplier"&&(t.enable_base_weight=!0));return Array.isArray(t.gpu_ids)&&(t.gpu_ids=t.gpu_ids.map(a=>k(a))),t}function Z(e,t){return`
    <div class="training-library-meta">
      <span class="coverage-pill coverage-pill-muted">${o(e)}</span>
    </div>
    <p class="training-library-note">${o(t)}</p>
  `}function fe(e){return typeof e=="string"&&e.trim().length>0?e.trim():null}function De(e,t){const a=t.metadata??{},n=fe(a.train_type);return n?e.presetTrainTypes.includes(n)?{compatible:!0,label:"route preset",detail:`Preset metadata matches this route via train_type = ${n}.`,tone:"default"}:{compatible:!1,label:"cross-route preset",detail:`Preset metadata targets ${n}, which does not match ${e.schemaName}.`,tone:"warning"}:{compatible:!0,label:"generic preset",detail:"This preset does not declare a train_type, so review route-specific fields before launch.",tone:"muted"}}function Be(e,t){const a=fe(t.route_id),n=fe(t.train_type);return a===e.routeId?{compatible:!0,label:"route recipe",detail:"This recipe was saved from the same source-side route.",tone:"default"}:n&&e.presetTrainTypes.includes(n)?{compatible:!0,label:"family recipe",detail:`Recipe metadata matches this route family via train_type = ${n}.`,tone:"default"}:!a&&!n?{compatible:!0,label:"generic recipe",detail:"This recipe has no route metadata, so review route-specific fields before applying it.",tone:"muted"}:a?{compatible:!1,label:"cross-route recipe",detail:`Recipe metadata says it came from ${a}, not ${e.routeId}.`,tone:"warning"}:{compatible:!1,label:"foreign train type",detail:`Recipe metadata targets ${n}, which does not match ${e.schemaName}.`,tone:"warning"}}function se(e,t){const a=t.values.output_name;return typeof a=="string"&&a.trim().length>0?a.trim():`${e.modelLabel} snapshot`}function ns(e){try{return JSON.stringify(Qe(W(e.value)),null,2)}catch(t){return t instanceof Error?t.message:"Unable to preview this snapshot."}}function ss(e,t){if(t.length===0){f(`${e}-history-panel`,`
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
        ${Z("0 snapshots","Saved parameter snapshots stay in this browser and can restore form values plus selected GPUs.")}
        <p>No saved parameter snapshots yet.</p>
      `);return}const a=t.map((n,i)=>`
        <article class="history-card">
          <div class="history-card-head">
            <div>
              <h4>${o(n.name||"Unnamed snapshot")}</h4>
              <p class="history-card-meta">${o(n.time)}</p>
            </div>
            <span class="coverage-pill coverage-pill-muted">${o((n.gpu_ids??[]).join(", ")||"default GPU")}</span>
          </div>
          <pre class="history-preview">${o(ns(n))}</pre>
          <div class="history-card-actions">
            <button class="action-button action-button-ghost action-button-small" data-history-apply="${i}" type="button">Apply</button>
            <button class="action-button action-button-ghost action-button-small" data-history-rename="${i}" type="button">Rename</button>
            <button class="action-button action-button-ghost action-button-small" data-history-delete="${i}" type="button">Delete</button>
          </div>
        </article>
      `).join("");f(`${e}-history-panel`,`
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
      ${Z(`${t.length} snapshot${t.length===1?"":"s"}`,"Saved parameter snapshots stay in this browser and can restore form values plus selected GPUs.")}
      <div class="history-list">${a}</div>
    `)}function rs(e,t,a){if(t.length===0){f(`${e}-presets-panel`,`
        <div class="training-side-panel-head">
          <div>
            <p class="panel-kicker">presets</p>
            <h3>Training presets</h3>
          </div>
          <button class="action-button action-button-ghost action-button-small" data-preset-close="${e}" type="button">Close</button>
        </div>
        ${Z("0 presets","Backend presets are shared read-only templates. Save recipe copies one into your local browser library.")}
        <p>No presets matched this training route.</p>
      `);return}const n=t.map((i,s)=>{const r=i.metadata??{},c=i.data??{},p=De(a,i),u=p.tone==="warning"?"coverage-pill-warning":p.tone==="muted"?"coverage-pill-muted":"",d=fe(r.train_type);return`
        <article class="preset-card">
          <div class="preset-card-head">
            <div>
              <h4>${o(r.name||i.name||`Preset ${s+1}`)}</h4>
              <p class="preset-card-meta">
                ${o(String(r.version||"unknown"))}
                · ${o(String(r.author||"unknown author"))}
              </p>
            </div>
            <span class="coverage-pill coverage-pill-muted">${o(String(r.train_type||"shared"))}</span>
          </div>
          <p>${o(String(r.description||"No description"))}</p>
          <div class="coverage-list training-card-compatibility">
            <span class="coverage-pill ${u}">${o(p.label)}</span>
            ${d?`<span class="coverage-pill coverage-pill-muted">${o(d)}</span>`:""}
          </div>
          <p class="training-card-note">${o(p.detail)}</p>
          <pre class="preset-preview">${o(JSON.stringify(c,null,2))}</pre>
          <div class="preset-card-actions">
            <button class="action-button action-button-ghost action-button-small" data-preset-save-recipe="${s}" type="button">Save recipe</button>
            <button class="action-button action-button-ghost action-button-small" data-preset-merge="${s}" type="button">Merge</button>
            <button class="action-button action-button-ghost action-button-small" data-preset-replace="${s}" type="button">Replace</button>
          </div>
        </article>
      `}).join("");f(`${e}-presets-panel`,`
      <div class="training-side-panel-head">
        <div>
          <p class="panel-kicker">presets</p>
          <h3>Training presets</h3>
        </div>
        <button class="action-button action-button-ghost action-button-small" data-preset-close="${e}" type="button">Close</button>
      </div>
      ${Z(`${t.length} preset${t.length===1?"":"s"}`,"Backend presets are shared read-only templates. Save recipe copies one into your local browser library.")}
      <div class="preset-list">${n}</div>
    `)}function os(e,t,a){if(t.length===0){f(`${e}-recipes-panel`,`
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
        ${Z("0 recipes","Recipes are editable local copies stored per route in this browser. Import merges JSON or TOML here, and Export writes preset TOML files.")}
        <p>No saved recipes for this route yet.</p>
      `);return}const n=t.map((i,s)=>{const r=Be(a,i),c=r.tone==="warning"?"coverage-pill-warning":r.tone==="muted"?"coverage-pill-muted":"";return`
        <article class="preset-card">
          <div class="preset-card-head">
            <div>
              <h4>${o(i.name)}</h4>
              <p class="preset-card-meta">
                ${o(i.created_at)}
                ${i.train_type?` · ${o(i.train_type)}`:""}
              </p>
            </div>
            <span class="coverage-pill coverage-pill-muted">${o(i.route_id||"local")}</span>
          </div>
          <p>${o(i.description||"No description")}</p>
          <div class="coverage-list training-card-compatibility">
            <span class="coverage-pill ${c}">${o(r.label)}</span>
            ${i.train_type?`<span class="coverage-pill coverage-pill-muted">${o(i.train_type)}</span>`:""}
          </div>
          <p class="training-card-note">${o(r.detail)}</p>
          <pre class="preset-preview">${o(JSON.stringify(Qe(W(i.value)),null,2))}</pre>
          <div class="preset-card-actions">
            <button class="action-button action-button-ghost action-button-small" data-recipe-merge="${s}" type="button">Merge</button>
            <button class="action-button action-button-ghost action-button-small" data-recipe-replace="${s}" type="button">Replace</button>
            <button class="action-button action-button-ghost action-button-small" data-recipe-export="${s}" type="button">Export</button>
            <button class="action-button action-button-ghost action-button-small" data-recipe-rename="${s}" type="button">Rename</button>
            <button class="action-button action-button-ghost action-button-small" data-recipe-delete="${s}" type="button">Delete</button>
          </div>
        </article>
      `}).join("");f(`${e}-recipes-panel`,`
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
      ${Z(`${t.length} recipe${t.length===1?"":"s"}`,"Recipes are editable local copies stored per route in this browser. Import merges JSON or TOML here, and Export writes preset TOML files.")}
      <div class="preset-list">${n}</div>
    `)}function ls(e,t){const a=new Set(e.presetTrainTypes);return t.filter(n=>{const s=(n.metadata??{}).train_type;return typeof s!="string"||s.trim().length===0?!0:a.has(s)})}function I(e,t,a){const n=document.querySelector(`#${e}-history-panel`),i=document.querySelector(`#${e}-recipes-panel`),s=document.querySelector(`#${e}-presets-panel`);n&&(n.hidden=t==="history"?!a:!0),i&&(i.hidden=t==="recipes"?!a:!0),s&&(s.hidden=t==="presets"?!a:!0)}async function _t(e,t){try{const a=await ka(t);if(a.status!=="success")throw new Error(a.message||"Training preflight failed.");return gt(e.prefix,a.data??null),a.data??null}catch(a){throw gt(e.prefix,null,a instanceof Error?a.message:"Training preflight failed."),a}}function cs(e){var t;(t=document.querySelector(`#${e.prefix}-stop-train`))==null||t.addEventListener("click",async()=>{var a;try{const i=(((a=(await Oe()).data)==null?void 0:a.tasks)??[]).find(r=>String(r.status).toUpperCase()==="RUNNING");if(!i){v(e.prefix,"No running training task was found.","warning");return}const s=String(i.id??i.task_id??"");if(!s){v(e.prefix,"The running task does not expose an id.","error");return}if(!window.confirm(`Stop running task ${s}?`))return;await St(s),P(e.prefix,"Training stop requested",`Sent terminate request for task ${s}.`,"warning"),v(e.prefix,`Terminate requested for task ${s}.`,"warning")}catch(n){v(e.prefix,n instanceof Error?n.message:"Failed to stop training.","error")}})}function us(e,t,a){var i;(i=document.querySelector(`#${e.prefix}-run-preflight`))==null||i.addEventListener("click",async()=>{const s=t();if(!s){P(e.prefix,"Editor not ready",`The ${e.modelLabel} schema editor state is not initialized yet.`,"error");return}try{const r=a(s);ge(e.prefix,r.checks),await _t(e,r.payload),v(e.prefix,"Training preflight completed.","success")}catch(r){v(e.prefix,r instanceof Error?r.message:"Training preflight failed.","error")}});const n=document.querySelector(`#${e.prefix}-start-train`);n==null||n.addEventListener("click",async()=>{var r;const s=t();if(!s){P(e.prefix,"Editor not ready",`The ${e.modelLabel} schema editor state is not initialized yet.`,"error");return}n.setAttribute("disabled","true"),P(e.prefix,"Submitting training job...","Sending the current payload to /api/run.","idle");try{const c=a(s);if(c.checks.errors.length>0){P(e.prefix,"Fix parameter conflicts first",c.checks.errors.join(" "),"error"),ge(e.prefix,c.checks);return}const p=await _t(e,c.payload);if(p&&!p.can_start){P(e.prefix,"Resolve preflight errors first",p.errors.join(" "),"error");return}const u=await _a(c.payload);if(u.status==="success"){const l=[...c.checks.warnings,...(p==null?void 0:p.warnings)??[],...((r=u.data)==null?void 0:r.warnings)??[]].join(" ");P(e.prefix,"Training request accepted",`${u.message||"Training started."}${l?` ${l}`:""}`,l?"warning":"success")}else P(e.prefix,"Training request failed",u.message||"Unknown backend failure.","error")}catch(c){P(e.prefix,"Training request failed",c instanceof Error?c.message:"Unknown network error.","error")}finally{n.removeAttribute("disabled")}})}function ds(e){return e.trim().replace(/[^0-9A-Za-z._-]+/g,"-").replace(/-+/g,"-").replace(/^[-_.]+|[-_.]+$/g,"")||"training-preset"}function ps(e,t,a){const n=se(e,t),i=String(a.payload.model_train_type??"");return{metadata:{name:n,version:"1.0",author:"SD-reScripts local export",train_type:i||e.schemaName,description:`Exported from the ${e.modelLabel} source-side training bridge on ${new Date().toLocaleString()}.`},data:a.payload}}function hs(e,t,a,n){const i=se(e,t),s=window.prompt("Recipe name",i);if(!s||!s.trim())return!1;const r=window.prompt("Recipe description (optional)","")??"",c=N(e.routeId);return c.unshift({created_at:new Date().toLocaleString(),name:s.trim(),description:r.trim()||void 0,train_type:String(a.payload.model_train_type??e.schemaName),route_id:e.routeId,value:W(a.payload)}),Q(e.routeId,Ge(c)),n(),!0}function kt(e,t,a){const n=t.data&&typeof t.data=="object"&&!Array.isArray(t.data)?t.data:t.value&&typeof t.value=="object"&&!Array.isArray(t.value)?t.value:t;if(!n||typeof n!="object"||Array.isArray(n)||Object.keys(n).length===0)return null;const i=t.metadata&&typeof t.metadata=="object"&&!Array.isArray(t.metadata)?t.metadata:{},s=String(i.name||t.name||a||"Imported recipe").trim();return{created_at:String(t.created_at||new Date().toLocaleString()),name:s||"Imported recipe",description:typeof i.description=="string"?i.description:typeof t.description=="string"?t.description:void 0,train_type:typeof i.train_type=="string"?i.train_type:typeof t.train_type=="string"?t.train_type:typeof n.model_train_type=="string"?n.model_train_type:e.schemaName,route_id:typeof t.route_id=="string"?t.route_id:e.routeId,value:W(n)}}function ms(e,t,a){const n=a.trim();if(!n)throw new Error("Recipe file is empty.");const i=t.toLowerCase().endsWith(".json")?JSON.parse(n):Ze(n),s=[];if(Array.isArray(i))i.forEach((r,c)=>{if(!r||typeof r!="object"||Array.isArray(r))return;const p=kt(e,r,`Imported recipe ${c+1}`);p&&s.push(p)});else if(i&&typeof i=="object"){const r=kt(e,i,t.replace(/\.[^.]+$/,""));r&&s.push(r)}if(s.length===0)throw new Error("No valid recipe entries were found in this file.");return s}function gs(e,t,a){var i;const n=O(e.routeId);n.unshift({time:new Date().toLocaleString(),name:se(e,t),value:W(t.values),gpu_ids:Ke(`${e.prefix}-gpu-selector`)}),ue(e.routeId,Dt(n)),(i=document.querySelector(`#${e.prefix}-history-panel`))!=null&&i.hidden||a()}function fs(e,t,a,n){var i,s,r,c;(i=document.querySelector(`#${e.prefix}-download-config`))==null||i.addEventListener("click",()=>{const p=t();if(!p)return;const u=a(p);J(`${e.prefix}-${Te()}.toml`,Ne(u.payload)),v(e.prefix,"Exported current config as TOML.","success")}),(s=document.querySelector(`#${e.prefix}-export-preset`))==null||s.addEventListener("click",()=>{const p=t();if(!p)return;const u=a(p),d=ps(e,p,u),l=ds(se(e,p)||e.prefix);J(`${l}-preset.toml`,Ne(d)),v(e.prefix,"Exported current config as reusable preset TOML.","success")}),(r=document.querySelector(`#${e.prefix}-import-config`))==null||r.addEventListener("click",()=>{var p;(p=document.querySelector(`#${e.prefix}-config-file-input`))==null||p.click()}),(c=document.querySelector(`#${e.prefix}-config-file-input`))==null||c.addEventListener("change",p=>{var g;const u=p.currentTarget,d=(g=u.files)==null?void 0:g[0];if(!d)return;const l=new FileReader;l.onload=()=>{try{const m=Ze(String(l.result??"")),b=m.data&&typeof m.data=="object"&&!Array.isArray(m.data)?m.data:m;n(b),v(e.prefix,m.data&&typeof m.data=="object"?`Imported preset: ${d.name}.`:`Imported config: ${d.name}.`,"success")}catch(m){v(e.prefix,m instanceof Error?m.message:"Failed to import config.","error")}finally{u.value=""}},l.readAsText(d)})}function bs(e,t){var a;(a=document.querySelector(`#${e.prefix}-history-file-input`))==null||a.addEventListener("change",n=>{var c;const i=n.currentTarget,s=(c=i.files)==null?void 0:c[0];if(!s)return;const r=new FileReader;r.onload=()=>{try{const p=JSON.parse(String(r.result??""));if(!Array.isArray(p))throw new Error("History file must contain an array.");const u=p.filter(l=>l&&typeof l=="object"&&l.value&&typeof l.value=="object").map(l=>({time:String(l.time||new Date().toLocaleString()),name:l.name?String(l.name):void 0,value:W(l.value),gpu_ids:Array.isArray(l.gpu_ids)?l.gpu_ids.map(g=>String(g)):[]}));if(u.length===0)throw new Error("History file did not contain valid entries.");const d=Dt([...O(e.routeId),...u]);ue(e.routeId,d),t(),v(e.prefix,`Imported ${u.length} history entries.`,"success")}catch(p){v(e.prefix,p instanceof Error?p.message:"Failed to import history.","error")}finally{i.value=""}},r.readAsText(s)})}function ys(e,t,a){var n;(n=document.querySelector(`#${e.prefix}-recipe-file-input`))==null||n.addEventListener("change",i=>{var p;const s=i.currentTarget,r=(p=s.files)==null?void 0:p[0];if(!r)return;const c=new FileReader;c.onload=()=>{try{const u=ms(e,r.name,String(c.result??"")),d=Ge([...u,...N(e.routeId)]);Q(e.routeId,d),t(),a(),v(e.prefix,`Imported ${u.length} recipe ${u.length===1?"entry":"entries"}.`,"success")}catch(u){v(e.prefix,u instanceof Error?u.message:"Failed to import recipe.","error")}finally{s.value=""}},c.readAsText(r)})}function vs(e,t,a){f(`${e}-sample-prompt-workspace`,`
      <div class="submit-status-box">
        <strong>${o(t)}</strong>
        <p>${o(a)}</p>
      </div>
    `)}function _s(e){switch(e){case"prompt_file":return"Prompt file";case"generated":return"Generated from current fields";case"random_dataset_prompt_preview":return"Random dataset-derived prompt";case"legacy_sample_prompts_file":return"Legacy sample_prompts file";case"legacy_sample_prompts_inline":return"Legacy sample_prompts text";default:return e}}function be(e){vs(e,"Sample prompt workspace is waiting for refresh","Edit prompt fields freely, then click Refresh prompt to inspect the exact text that would be used.")}function le(e,t,a){if(a){f(`${e}-sample-prompt-workspace`,`
        <div class="submit-status-box submit-status-error">
          <strong>Sample prompt preview failed</strong>
          <p>${o(a)}</p>
        </div>
      `);return}if(!t){be(e);return}const n=[t.warnings.length?`
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
        `:""].filter(Boolean).join(""),i=t.warnings.length>0||!t.enabled?"submit-status-warning":"submit-status-success",s=t.line_count>3?`Showing the first 3 non-empty lines out of ${t.line_count}.`:`${t.line_count||0} non-empty line${t.line_count===1?"":"s"} detected.`;f(`${e}-sample-prompt-workspace`,`
      <div class="submit-status-box ${i}">
        <strong>${t.enabled?"Sample prompt resolved":"Sample prompt resolved, but preview is disabled"}</strong>
        <p class="training-preflight-meta">${o(_s(t.source))}${t.detail?` · ${o(t.detail)}`:""}</p>
        <p class="training-preflight-meta">${o(s)} Download will use ${o(t.suggested_file_name)}.</p>
        ${n}
        <pre class="preset-preview">${o(t.preview)}</pre>
      </div>
    `)}async function $t(e,t,a){const n=t();if(!n)throw new Error(`${e.modelLabel} editor is not ready yet.`);const i=a(n),s=await $a(i.payload);if(s.status!=="success"||!s.data)throw new Error(s.message||"Sample prompt preview failed.");return s.data}function ks(e){var s,r,c,p;const{config:t,getCurrentState:a,buildPreparedTrainingPayload:n,applyEditableRecord:i}=e;(s=document.querySelector(`#${t.prefix}-refresh-sample-prompt`))==null||s.addEventListener("click",async()=>{try{const u=await $t(t,a,n);le(t.prefix,u),v(t.prefix,"Sample prompt preview refreshed.","success")}catch(u){le(t.prefix,null,u instanceof Error?u.message:"Sample prompt preview failed."),v(t.prefix,u instanceof Error?u.message:"Sample prompt preview failed.","error")}}),(r=document.querySelector(`#${t.prefix}-download-sample-prompt`))==null||r.addEventListener("click",async()=>{try{const u=await $t(t,a,n);le(t.prefix,u),J(u.suggested_file_name||"sample-prompts.txt",u.content||""),v(t.prefix,`Sample prompt exported as ${u.suggested_file_name}.`,"success")}catch(u){le(t.prefix,null,u instanceof Error?u.message:"Sample prompt export failed."),v(t.prefix,u instanceof Error?u.message:"Sample prompt export failed.","error")}}),(c=document.querySelector(`#${t.prefix}-pick-prompt-file`))==null||c.addEventListener("click",async()=>{try{const u=await U("text-file");i({prompt_file:u},void 0,"merge"),be(t.prefix),v(t.prefix,"Prompt file path inserted into the current form state.","success")}catch(u){v(t.prefix,u instanceof Error?u.message:"Prompt file picker failed.","error")}}),(p=document.querySelector(`#${t.prefix}-clear-prompt-file`))==null||p.addEventListener("click",()=>{i({prompt_file:""},void 0,"merge"),be(t.prefix),v(t.prefix,"prompt_file cleared from the current form state.","warning")})}function $s(e){var m,b,_,$,S,A,M,X;const{config:t,createDefaultState:a,getCurrentState:n,mountTrainingState:i,onStateChange:s,applyEditableRecord:r,buildPreparedTrainingPayload:c,bindHistoryPanel:p,bindRecipePanel:u,openHistoryPanel:d,openRecipePanel:l,openPresetPanel:g}=e;document.querySelectorAll(`#${t.prefix}-gpu-selector input[data-gpu-id]`).forEach(T=>{T.addEventListener("change",()=>{const V=n();V&&s(V)})}),(m=document.querySelector(`#${t.prefix}-reset-all`))==null||m.addEventListener("click",()=>{const T=a();Je(t.prefix,[]),i(T),v(t.prefix,"Reset to schema defaults.","warning")}),(b=document.querySelector(`#${t.prefix}-save-params`))==null||b.addEventListener("click",()=>{const T=n();T&&(gs(t,T,p),v(t.prefix,"Current parameters saved to history.","success"))}),(_=document.querySelector(`#${t.prefix}-read-params`))==null||_.addEventListener("click",()=>{d()}),($=document.querySelector(`#${t.prefix}-clear-autosave`))==null||$.addEventListener("click",()=>{window.confirm("Clear the local autosave for this training route?")&&(Wa(t.routeId),Ye(t.prefix,null),v(t.prefix,"Cleared local autosave for this route.","warning"))}),(S=document.querySelector(`#${t.prefix}-save-recipe`))==null||S.addEventListener("click",()=>{const T=n();if(!T)return;const V=c(T);hs(t,T,V,u)&&v(t.prefix,"Current config saved to the local recipe library.","success")}),(A=document.querySelector(`#${t.prefix}-read-recipes`))==null||A.addEventListener("click",()=>{l()}),(M=document.querySelector(`#${t.prefix}-import-recipe`))==null||M.addEventListener("click",()=>{var T;(T=document.querySelector(`#${t.prefix}-recipe-file-input`))==null||T.click()}),(X=document.querySelector(`#${t.prefix}-load-presets`))==null||X.addEventListener("click",()=>{g()}),fs(t,n,c,r),bs(t,d),ys(t,u,l),ks({config:t,getCurrentState:n,buildPreparedTrainingPayload:c,applyEditableRecord:r}),cs(t),us(t,n,c)}function ws(e,t){let a=null;const n=(d,l,g)=>window.confirm(`Apply ${d} "${l}" to ${e.modelLabel}?

${g}

You can still continue, but some route-specific fields may need manual review afterwards.`),i=()=>{const d=O(e.routeId);ss(e.prefix,d),document.querySelectorAll(`#${e.prefix}-history-panel [data-history-close]`).forEach(l=>{l.addEventListener("click",()=>I(e.prefix,"history",!1))}),document.querySelectorAll(`#${e.prefix}-history-panel [data-history-export]`).forEach(l=>{l.addEventListener("click",()=>{J(`${e.prefix}-history-${Te()}.json`,JSON.stringify(O(e.routeId),null,2),"application/json;charset=utf-8"),v(e.prefix,"History exported.","success")})}),document.querySelectorAll(`#${e.prefix}-history-panel [data-history-import]`).forEach(l=>{l.addEventListener("click",()=>{var g;(g=document.querySelector(`#${e.prefix}-history-file-input`))==null||g.click()})}),document.querySelectorAll(`#${e.prefix}-history-panel [data-history-apply]`).forEach(l=>{l.addEventListener("click",()=>{const g=Number(l.dataset.historyApply??"-1"),m=O(e.routeId)[g];m&&(t(m.value,m.gpu_ids,"replace"),I(e.prefix,"history",!1),v(e.prefix,`Applied snapshot: ${m.name||"Unnamed snapshot"}.`,"success"))})}),document.querySelectorAll(`#${e.prefix}-history-panel [data-history-rename]`).forEach(l=>{l.addEventListener("click",()=>{const g=Number(l.dataset.historyRename??"-1"),m=O(e.routeId),b=m[g];if(!b)return;const _=window.prompt("Rename snapshot",b.name||"");_&&(b.name=_.trim(),ue(e.routeId,m),i(),v(e.prefix,"Snapshot renamed.","success"))})}),document.querySelectorAll(`#${e.prefix}-history-panel [data-history-delete]`).forEach(l=>{l.addEventListener("click",()=>{const g=Number(l.dataset.historyDelete??"-1"),m=O(e.routeId),b=m[g];b&&window.confirm(`Delete snapshot "${b.name||"Unnamed snapshot"}"?`)&&(m.splice(g,1),ue(e.routeId,m),i(),v(e.prefix,"Snapshot deleted.","success"))})})},s=()=>{i(),I(e.prefix,"history",!0)},r=()=>{const d=N(e.routeId);os(e.prefix,d,e),document.querySelectorAll(`#${e.prefix}-recipes-panel [data-recipe-close]`).forEach(l=>{l.addEventListener("click",()=>I(e.prefix,"recipes",!1))}),document.querySelectorAll(`#${e.prefix}-recipes-panel [data-recipe-export-all]`).forEach(l=>{l.addEventListener("click",()=>{J(`${e.prefix}-recipes-${Te()}.json`,JSON.stringify(N(e.routeId),null,2),"application/json;charset=utf-8"),v(e.prefix,"Recipe library exported.","success")})}),document.querySelectorAll(`#${e.prefix}-recipes-panel [data-recipe-import]`).forEach(l=>{l.addEventListener("click",()=>{var g;(g=document.querySelector(`#${e.prefix}-recipe-file-input`))==null||g.click()})}),document.querySelectorAll(`#${e.prefix}-recipes-panel [data-recipe-merge]`).forEach(l=>{l.addEventListener("click",()=>{const g=Number(l.dataset.recipeMerge??"-1"),m=N(e.routeId)[g];if(!m)return;const b=Be(e,m);!b.compatible&&!n("recipe",m.name,b.detail)||(t(m.value,void 0,"merge"),I(e.prefix,"recipes",!1),v(e.prefix,`Merged recipe: ${m.name}.`,"success"))})}),document.querySelectorAll(`#${e.prefix}-recipes-panel [data-recipe-replace]`).forEach(l=>{l.addEventListener("click",()=>{const g=Number(l.dataset.recipeReplace??"-1"),m=N(e.routeId)[g];if(!m)return;const b=Be(e,m);!b.compatible&&!n("recipe",m.name,b.detail)||(t(m.value,void 0,"replace"),I(e.prefix,"recipes",!1),v(e.prefix,`Replaced current values with recipe: ${m.name}.`,"success"))})}),document.querySelectorAll(`#${e.prefix}-recipes-panel [data-recipe-export]`).forEach(l=>{l.addEventListener("click",()=>{const g=Number(l.dataset.recipeExport??"-1"),m=N(e.routeId)[g];m&&(J(`${m.name.replace(/[^0-9A-Za-z._-]+/g,"-")||"recipe"}-preset.toml`,Ne({metadata:{name:m.name,version:"1.0",author:"SD-reScripts local recipe",train_type:m.train_type||e.schemaName,description:m.description||`Exported recipe from ${e.modelLabel}.`},data:m.value})),v(e.prefix,`Exported recipe: ${m.name}.`,"success"))})}),document.querySelectorAll(`#${e.prefix}-recipes-panel [data-recipe-rename]`).forEach(l=>{l.addEventListener("click",()=>{const g=Number(l.dataset.recipeRename??"-1"),m=N(e.routeId),b=m[g];if(!b)return;const _=window.prompt("Rename recipe",b.name);!_||!_.trim()||(b.name=_.trim(),Q(e.routeId,m),r(),v(e.prefix,"Recipe renamed.","success"))})}),document.querySelectorAll(`#${e.prefix}-recipes-panel [data-recipe-delete]`).forEach(l=>{l.addEventListener("click",()=>{const g=Number(l.dataset.recipeDelete??"-1"),m=N(e.routeId),b=m[g];b&&window.confirm(`Delete recipe "${b.name}"?`)&&(m.splice(g,1),Q(e.routeId,m),r(),v(e.prefix,"Recipe deleted.","success"))})})},c=()=>{r(),I(e.prefix,"recipes",!0)},p=()=>{rs(e.prefix,a??[],e),document.querySelectorAll(`#${e.prefix}-presets-panel [data-preset-close]`).forEach(d=>{d.addEventListener("click",()=>I(e.prefix,"presets",!1))}),document.querySelectorAll(`#${e.prefix}-presets-panel [data-preset-merge]`).forEach(d=>{d.addEventListener("click",()=>{const l=Number(d.dataset.presetMerge??"-1"),g=a==null?void 0:a[l];if(!g)return;const m=De(e,g),b=String((g.metadata??{}).name||g.name||"preset");if(!m.compatible&&!n("preset",b,m.detail))return;const _=g.data??{};t(_,void 0,"merge"),I(e.prefix,"presets",!1),v(e.prefix,`Merged preset: ${b}.`,"success")})}),document.querySelectorAll(`#${e.prefix}-presets-panel [data-preset-save-recipe]`).forEach(d=>{d.addEventListener("click",()=>{var $;const l=Number(d.dataset.presetSaveRecipe??"-1"),g=a==null?void 0:a[l];if(!g)return;const m=g.metadata??{},b=g.data??{},_=N(e.routeId);_.unshift({created_at:new Date().toLocaleString(),name:String(m.name||g.name||"Imported preset recipe"),description:typeof m.description=="string"?m.description:void 0,train_type:typeof m.train_type=="string"?m.train_type:e.schemaName,route_id:e.routeId,value:JSON.parse(JSON.stringify(b))}),Q(e.routeId,Ge(_)),($=document.querySelector(`#${e.prefix}-recipes-panel`))!=null&&$.hidden||r(),v(e.prefix,`Saved preset to local recipe library: ${String(m.name||g.name||"preset")}.`,"success")})}),document.querySelectorAll(`#${e.prefix}-presets-panel [data-preset-replace]`).forEach(d=>{d.addEventListener("click",()=>{const l=Number(d.dataset.presetReplace??"-1"),g=a==null?void 0:a[l];if(!g)return;const m=De(e,g),b=String((g.metadata??{}).name||g.name||"preset");if(!m.compatible&&!n("preset",b,m.detail))return;const _=g.data??{};t(_,void 0,"replace"),I(e.prefix,"presets",!1),v(e.prefix,`Replaced current values with preset: ${b}.`,"success")})})};return{bindHistoryPanel:i,bindRecipePanel:r,openHistoryPanel:s,openRecipePanel:c,openPresetPanel:async()=>{var d;if(!a)try{const l=await xt();a=ls(e,((d=l.data)==null?void 0:d.presets)??[])}catch(l){v(e.prefix,l instanceof Error?l.message:"Failed to load presets.","error");return}p(),I(e.prefix,"presets",!0)}}}const xs=["pytorch_optimizer","schedulefree","bitsandbytes","prodigyplus","prodigyopt","lion_pytorch","dadaptation","transformers"];function Ss(e){if(!e)return"runtime dependency status unavailable";const t=xs.map(a=>e[a]).filter(a=>!!a);return t.length===0?"runtime dependency status unavailable":t.map(a=>`${a.display_name}:${a.importable?"ready":a.installed?"broken":"missing"}`).join(" | ")}async function Ts(e){var c,p,u,d,l;const t=rn(e.prefix),[a,n]=await Promise.allSettled([ze(),Fe()]);if(n.status==="fulfilled"){const g=((c=n.value.data)==null?void 0:c.cards)??[],m=(p=n.value.data)==null?void 0:p.xformers,b=(u=n.value.data)==null?void 0:u.runtime;qn(`${e.prefix}-gpu-selector`,g),h(`${e.prefix}-runtime-title`,`${g.length} GPU entries reachable${b?` · ${b.environment} Python ${b.python_version}`:""}`),f(`${e.prefix}-runtime-body`,`
        <p>${o(Et(g))}</p>
        <p>${o(m?`xformers: ${m.installed?"installed":"missing"}, ${m.supported?"supported":"fallback"} (${m.reason})`:"xformers info unavailable")}</p>
        <p>${o(Ss(b==null?void 0:b.packages))}</p>
      `)}else h(`${e.prefix}-runtime-title`,"GPU runtime request failed"),h(`${e.prefix}-runtime-body`,n.reason instanceof Error?n.reason.message:"Unknown error");if(a.status!=="fulfilled")return h(t.summaryId,`${e.modelLabel} schema request failed`),f(t.sectionsId,`<p>${a.reason instanceof Error?o(a.reason.message):"Unknown error"}</p>`),Y(t.previewId,"{}"),P(e.prefix,"Schema unavailable",`The ${e.modelLabel} training bridge could not load the backend schema.`,"error"),null;const i=((d=a.value.data)==null?void 0:d.schemas)??[],s=Ht(i),r=(l=_e(s).find(g=>g.name===e.schemaName))==null?void 0:l.name;return r?{domIds:t,createDefaultState:()=>me(s,r)}:(h(t.summaryId,`No ${e.schemaName} schema was returned.`),f(t.sectionsId,`<p>The backend did not expose ${o(e.schemaName)}.</p>`),P(e.prefix,"Schema missing",`The backend did not expose the ${e.schemaName} schema.`,"error"),null)}const wt={};function Ls(e,t){const a=Wt(t),n=Ke(`${e}-gpu-selector`);n.length>0&&(a.gpu_ids=n);const i=Qe(a);return{payload:i,checks:is(i)}}function ea(e){return new Set(e.sections.flatMap(t=>t.fields.map(a=>a.path)))}function ta(e,t){const a=ea(e),n={...e.values};for(const[i,s]of Object.entries(t))a.has(i)&&(n[i]=s);return{...e,values:n}}function As(e,t){return{...e,values:{...e.values,...Object.fromEntries(Object.entries(t).filter(([a])=>ea(e).has(a)))}}}function Es(e,t){return t&&t.length>0?t.map(a=>String(a)):Array.isArray(e.gpu_ids)?e.gpu_ids.map(a=>String(a)):[]}function Is(e,t){const a={time:new Date().toLocaleString(),name:se(e,t),value:W(t.values),gpu_ids:Ke(`${e.prefix}-gpu-selector`)};Ua(e.routeId,a),Ye(e.prefix,a)}function Ps(e){const{config:t,createDefaultState:a,mountTrainingState:n}=e,i=Ct(t.routeId);Ye(t.prefix,i);const s=i!=null&&i.value?ta(a(),Qt(i.value)):a();(i==null?void 0:i.gpu_ids)!==void 0&&Je(t.prefix,i.gpu_ids),n(s),i!=null&&i.value&&v(t.prefix,"Restored autosaved parameters for this route.","success")}function Rs(e,t,a,n,i){return s=>{try{const r=a(s),c=Object.fromEntries(Object.entries(r.payload).sort(([p],[u])=>p.localeCompare(u)));Y(t.previewId,JSON.stringify(c,null,2)),ge(e.prefix,r.checks)}catch(r){Y(t.previewId,"{}"),ge(e.prefix,{warnings:[],errors:[]},r instanceof Error?r.message:"The current state could not be converted into a launch payload.")}n(s),i==null||i()}}function Ns(e,t,a){const n=()=>wt[e.routeId],i=u=>Ls(e.prefix,u),s=Rs(e,t,i,u=>Is(e,u),()=>be(e.prefix)),r=u=>{ae(u,t,d=>{wt[e.routeId]=d},s)};return{getCurrentState:n,prepareTrainingPayload:i,onStateChange:s,mountTrainingState:r,applyEditableRecord:(u,d,l="replace")=>{const g=l==="merge"?n()??a():a(),m=Qt(u),b=l==="merge"?As(g,m):ta(g,m);Je(e.prefix,Es(m,d)),r(b)},restoreAutosave:()=>Ps({config:e,createDefaultState:a,mountTrainingState:r})}}async function Cs(e){const t=await Ts(e);if(!t)return;const a=Ns(e,t.domIds,t.createDefaultState),n=ws(e,a.applyEditableRecord);a.restoreAutosave(),$s({config:e,createDefaultState:t.createDefaultState,getCurrentState:a.getCurrentState,mountTrainingState:a.mountTrainingState,onStateChange:a.onStateChange,applyEditableRecord:a.applyEditableRecord,buildPreparedTrainingPayload:a.prepareTrainingPayload,bindHistoryPanel:n.bindHistoryPanel,bindRecipePanel:n.bindRecipePanel,openHistoryPanel:n.openHistoryPanel,openRecipePanel:n.openRecipePanel,openPresetPanel:n.openPresetPanel}),P(e.prefix,`${e.modelLabel} bridge ready`,"You can review the generated payload and submit the current config to /api/run.","success"),I(e.prefix,"history",!1),I(e.prefix,"recipes",!1),I(e.prefix,"presets",!1)}const Ds={overview:Xt,about:cn,settings:An,tasks:In,tageditor:En,tensorboard:Pn,tools:Rn,"schema-bridge":vn,"sdxl-train":Ln,"flux-train":gn,"sd3-train":kn,"sd3-finetune-train":_n,"dreambooth-train":pn,"flux-finetune-train":mn,"sd-controlnet-train":$n,"sdxl-controlnet-train":xn,"flux-controlnet-train":hn,"sdxl-lllite-train":Sn,"sd-ti-train":wn,"xti-train":Cn,"sdxl-ti-train":Tn,"anima-train":dn,"anima-finetune-train":un,"lumina-train":yn,"lumina-finetune-train":bn,"hunyuan-image-train":fn};function Bs(e){const t={overview:G.filter(a=>a.section==="overview"),phase1:G.filter(a=>a.section==="phase1"),reference:G.filter(a=>a.section==="reference")};return`
    <div class="nav-group">
      <p class="nav-heading">Workspace</p>
      ${t.overview.map(a=>Se(a.hash,a.label,a.description,e)).join("")}
    </div>
    <div class="nav-group">
      <p class="nav-heading">Phase 1 Pages</p>
      ${t.phase1.map(a=>Se(a.hash,a.label,a.description,e)).join("")}
    </div>
    <div class="nav-group">
      <p class="nav-heading">Core Bridge</p>
      ${t.reference.map(a=>Se(a.hash,a.label,a.description,e)).join("")}
    </div>
  `}function Se(e,t,a,n){return`
    <a class="nav-link ${e===n?"is-active":""}" href="${e}">
      <span>${t}</span>
      <small>${a}</small>
    </a>
  `}async function qs(e){e==="overview"?await Ja():e==="settings"?await xi():e==="tasks"?await ji():e==="tageditor"?await Li():e==="tools"?await Ai():e==="schema-bridge"?await on(()=>{}):Le[e]&&await Cs(Le[e])}async function zs(e){Ma();const t=ja(),a=Ds[t.id]??Xt;e.innerHTML=ln(t.hash,a());const n=document.querySelector("#side-nav");n&&(n.innerHTML=Bs(t.hash)),await qs(t.id)}const aa=document.querySelector("#app");if(!(aa instanceof HTMLElement))throw new Error("App root not found.");const Os=aa;async function ia(){await zs(Os)}window.addEventListener("hashchange",()=>{ia()});ia();
