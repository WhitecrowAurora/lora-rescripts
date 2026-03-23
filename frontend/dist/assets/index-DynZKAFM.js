var aa=Object.defineProperty;var ia=(e,t,a)=>t in e?aa(e,t,{enumerable:!0,configurable:!0,writable:!0,value:a}):e[t]=a;var T=(e,t,a)=>ia(e,typeof t!="symbol"?t+"":t,a);(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))s(i);new MutationObserver(i=>{for(const n of i)if(n.type==="childList")for(const r of n.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&s(r)}).observe(document,{childList:!0,subtree:!0});function a(i){const n={};return i.integrity&&(n.integrity=i.integrity),i.referrerPolicy&&(n.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?n.credentials="include":i.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function s(i){if(i.ep)return;i.ep=!0;const n=a(i);fetch(i.href,n)}})();const qe="".replace(/\/$/,"");async function N(e){const t=await fetch(`${qe}${e}`,{headers:{Accept:"application/json"}});if(!t.ok)throw new Error(`${t.status} ${t.statusText}`);return await t.json()}async function C(e,t){const a=await fetch(`${qe}${e}`,{method:"POST",headers:{Accept:"application/json","Content-Type":"application/json"},body:JSON.stringify(t)});if(!a.ok)throw new Error(`${a.status} ${a.statusText}`);return await a.json()}async function sa(e){const t=await fetch(`${qe}${e}`,{headers:{Accept:"application/json"}});if(!t.ok)throw new Error(`${t.status} ${t.statusText}`);return await t.json()}async function na(){return N("/api/schemas/hashes")}async function ze(){return N("/api/schemas/all")}async function wt(){return N("/api/presets")}async function ra(){return N("/api/config/saved_params")}async function oa(){return N("/api/config/summary")}async function Oe(){return N("/api/tasks")}async function $t(e){return N(`/api/tasks/terminate/${e}`)}async function xt(){return N("/api/graphic_cards")}async function St(){return sa("/api/tageditor_status")}async function la(){return N("/api/scripts")}async function ca(e){return C("/api/dataset/analyze",e)}async function ua(e){return C("/api/dataset/masked_loss_audit",e)}async function da(){return N("/api/interrogators")}async function G(e){var a;const t=await N(`/api/pick_file?picker_type=${encodeURIComponent(e)}`);if(t.status!=="success"||!((a=t.data)!=null&&a.path))throw new Error(t.message||"File picker did not return a path.");return t.data.path}async function pa(e){return C("/api/interrogate",e)}async function ha(e){return C("/api/captions/cleanup/preview",e)}async function ma(e){return C("/api/captions/cleanup/apply",e)}async function ga(e){return C("/api/captions/backups/create",e)}async function fa(e){return C("/api/captions/backups/list",e)}async function ba(e){return C("/api/captions/backups/restore",e)}async function ya(e){return C("/api/run",e)}async function va(e){return C("/api/train/preflight",e)}async function _a(e){return C("/api/train/sample_prompt",e)}function m(e,t){const a=document.querySelector(`#${e}`);a&&(a.textContent=t)}function f(e,t){const a=document.querySelector(`#${e}`);a&&(a.innerHTML=t)}function K(e,t){const a=document.querySelector(`#${e}`);a&&(a.textContent=t)}const Tt=[{route:"index.html",title:"SD-reScripts | SD training UI",section:"core",status:"migrate-first",notes:"Landing page and main navigation entry. Good first candidate for source migration."},{route:"lora/index.html",title:"LoRA training index",section:"training",status:"migrate-first",notes:"Top-level training model selector page.",schemaHints:["shared"]},{route:"lora/sdxl.html",title:"SDXL LoRA training",section:"training",status:"migrate-first",notes:"Primary training page currently used most often.",schemaHints:["sdxl-lora","shared"]},{route:"lora/flux.html",title:"Flux LoRA training",section:"training",status:"migrate-first",notes:"Now mirrored by the shared source-side training bridge.",schemaHints:["flux-lora","shared"]},{route:"lora/sd3.html",title:"SD3 training",section:"training",status:"migrate-first",notes:"Now mirrored by the shared source-side training bridge.",schemaHints:["sd3-lora","shared"]},{route:"lora/controlnet.html",title:"SD ControlNet training",section:"training",status:"migrate-first",notes:"Now mirrored by the shared source-side training bridge.",schemaHints:["sd-controlnet","shared"]},{route:"lora/sdxl-controlnet.html",title:"SDXL ControlNet training",section:"training",status:"migrate-first",notes:"Now mirrored by the shared source-side training bridge.",schemaHints:["sdxl-controlnet","shared"]},{route:"lora/sdxl-lllite.html",title:"SDXL LLLite training",section:"training",status:"migrate-first",notes:"Specialized SDXL conditioning route now mirrored by the shared source-side bridge.",schemaHints:["sdxl-controlnet-lllite","shared"]},{route:"lora/flux-controlnet.html",title:"Flux ControlNet training",section:"training",status:"migrate-first",notes:"Now mirrored by the shared source-side training bridge.",schemaHints:["flux-controlnet","shared"]},{route:"lora/basic.html",title:"LoRA basic mode",section:"training",status:"legacy-dist",notes:"Legacy beginner-mode training route.",schemaHints:["lora-basic","shared"]},{route:"lora/master.html",title:"LoRA expert mode",section:"training",status:"legacy-dist",notes:"Legacy expert-mode training route.",schemaHints:["lora-master","shared"]},{route:"lora/params.html",title:"Training parameter reference",section:"training",status:"migrate-first",notes:"Mostly explanatory UI. Lower risk to recreate cleanly."},{route:"lora/tools.html",title:"LoRA tools",section:"tools",status:"migrate-first",notes:"Tool launcher route for merge, resize, interrogate and conversion flows."},{route:"dreambooth/index.html",title:"Dreambooth training",section:"training",status:"migrate-first",notes:"Now mirrored by the shared source-side training bridge for Dreambooth and SDXL full finetune.",schemaHints:["dreambooth","shared"]},{route:"tagger.html",title:"Tagger tool",section:"tools",status:"migrate-first",notes:"Standalone caption/tag generation route that talks to backend APIs.",schemaHints:["tagger"]},{route:"tageditor.html",title:"Tag editor proxy page",section:"tools",status:"migrate-first",notes:"Wrapper page with progress/failure states. Good candidate to reimplement cleanly."},{route:"task.html",title:"Task monitor",section:"system",status:"migrate-first",notes:"Task status page backed by /api/tasks."},{route:"tensorboard.html",title:"TensorBoard proxy page",section:"system",status:"migrate-first",notes:"Wrapper/proxy page. Safer than schema-heavy form routes."},{route:"other/settings.html",title:"Settings page",section:"system",status:"migrate-first",notes:"Static/system page that should be easy to recreate in source form."},{route:"other/about.html",title:"About page",section:"core",status:"migrate-first",notes:"Mostly branding and release notes. Best low-risk migration target."},{route:"404.html",title:"Fallback page",section:"core",status:"legacy-dist",notes:"Can be replaced after the main router is rebuilt."}];function o(e){return String(e).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;")}function W(e){return JSON.parse(JSON.stringify(e))}function Te(e=new Date){return e.toISOString().replaceAll(":","-").replaceAll(".","-")}function ka(e){if(e.length===0){f("schema-browser","<p>No schemas returned.</p>");return}const t=e.map(a=>{var i;const s=((i=a.schema.split(/\r?\n/).find(n=>n.trim().length>0))==null?void 0:i.trim())||"No preview available.";return`
        <article class="schema-card">
          <div class="schema-head">
            <h3>${o(a.name)}</h3>
            <span class="schema-hash">${o(a.hash.slice(0,8))}</span>
          </div>
          <p>${o(s)}</p>
        </article>
      `}).join("");f("schema-browser",t)}function wa(e){const t=new Set(Tt.flatMap(n=>n.schemaHints??[])),a=new Set(e.map(n=>n.name)),s=[...t].filter(n=>a.has(n)).sort(),i=e.map(n=>n.name).filter(n=>!t.has(n)).sort();f("schema-mapped",s.length?s.map(n=>`<span class="coverage-pill">${o(n)}</span>`).join(""):"<p>No mapped schema hints yet.</p>"),f("schema-unmapped",i.length?i.map(n=>`<span class="coverage-pill coverage-pill-muted">${o(n)}</span>`).join(""):"<p>All schemas are represented in the current route hints.</p>")}function $a(e){if(!e.length){f("training-catalog","<p>No training routes were registered.</p>");return}const t=e.length,a=e.filter(l=>l.schemaAvailable).length,s=e.filter(l=>l.presetCount>0).length,i=e.filter(l=>l.localHistoryCount>0).length,n=e.filter(l=>l.localRecipeCount>0).length,r=e.filter(l=>l.autosaveReady).length,c=new Map,p=new Map;for(const l of e){c.set(l.family,(c.get(l.family)??0)+1);for(const h of l.capabilities)p.set(h,(p.get(h)??0)+1)}const d=`
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
        <strong class="dataset-analysis-stat-value">${s}</strong>
      </article>
      <article class="dataset-analysis-stat">
        <span class="metric-label">Recipe-covered</span>
        <strong class="dataset-analysis-stat-value">${n}</strong>
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
      ${[...p.entries()].sort((l,h)=>h[1]-l[1]||l[0].localeCompare(h[0])).map(([l,h])=>`<span class="coverage-pill">${o(l)} <strong>${h}</strong></span>`).join("")}
    </div>
  `,u=e.map(l=>`
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
            ${l.capabilities.map(h=>`<span class="coverage-pill coverage-pill-muted">${o(h)}</span>`).join("")}
          </div>
        </article>
      `).join("");f("training-catalog",`
      ${d}
      <div class="training-catalog-grid">${u}</div>
    `)}function xa(e){if(e.length===0){f("task-table-container","<p>No tasks currently tracked.</p>");return}const t=e.map(a=>`
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
    `)}function Sa(e){if(e.length===0){f("tools-browser","<p>No scripts returned.</p>");return}const t=e.map(a=>`
        <article class="tool-card">
          <div class="tool-card-head">
            <h3>${o(a.name)}</h3>
            <span class="coverage-pill ${a.category==="networks"?"":"coverage-pill-muted"}">${o(a.category)}</span>
          </div>
          <p>${a.positional_args.length>0?`Positional args: ${a.positional_args.map(s=>`<code>${o(s)}</code>`).join(", ")}`:"No positional args required."}</p>
        </article>
      `).join("");f("tools-browser",t)}function Ta(e){const t=[{label:"Images",value:e.summary.image_count},{label:"Effective images",value:e.summary.effective_image_count},{label:"Alpha-capable candidates",value:e.summary.alpha_capable_image_count},{label:"Caption coverage",value:ce(e.summary.caption_coverage)},{label:"Unique tags",value:e.summary.unique_tag_count},{label:"Caption files",value:e.summary.caption_file_count},{label:"Avg tags / caption",value:e.summary.average_tags_per_caption.toFixed(2)}],a=e.warnings.length?`
      <article class="dataset-analysis-block dataset-analysis-warning">
        <p class="panel-kicker">warnings</p>
        <ul class="dataset-analysis-list-plain">
          ${e.warnings.map(i=>`<li>${o(i)}</li>`).join("")}
        </ul>
      </article>
    `:"",s=e.folders.length?e.folders.map(i=>`
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
          ${Lt(e.top_tags,"No caption tags found yet.")}
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
          <div class="dataset-analysis-stack">${s}</div>
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
    `)}function La(e,t="masked-loss-audit-results"){const a=[{label:"Images",value:e.summary.image_count},{label:"Alpha channel images",value:e.summary.alpha_channel_image_count},{label:"Usable masks",value:e.summary.usable_mask_image_count},{label:"Soft alpha masks",value:e.summary.soft_alpha_image_count},{label:"Binary alpha masks",value:e.summary.binary_alpha_image_count},{label:"Avg masked area",value:ce(e.summary.average_mask_coverage)},{label:"Avg alpha weight",value:ce(e.summary.average_alpha_weight)}],s=e.warnings.length?`
      <article class="dataset-analysis-block dataset-analysis-warning">
        <p class="panel-kicker">warnings</p>
        <ul class="dataset-analysis-list-plain">
          ${e.warnings.map(i=>`<li>${o(i)}</li>`).join("")}
        </ul>
      </article>
    `:"";f(t,`
      ${s}
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
          ${P(e.samples.usable_masks,"No usable alpha-mask samples were found.")}
        </article>
        <article class="dataset-analysis-block">
          <p class="panel-kicker">samples</p>
          <h3>Soft alpha files</h3>
          ${P(e.samples.soft_alpha_masks,"No soft alpha-mask samples were found.")}
        </article>
        <article class="dataset-analysis-block">
          <p class="panel-kicker">samples</p>
          <h3>Opaque alpha files</h3>
          ${P(e.samples.fully_opaque_alpha,"No fully opaque alpha-channel samples were found.")}
        </article>
        <article class="dataset-analysis-block">
          <p class="panel-kicker">samples</p>
          <h3>No alpha files</h3>
          ${P(e.samples.no_alpha,"No non-alpha samples were captured.")}
        </article>
      </section>
    `)}function Aa(e,t="caption-cleanup-results"){const a=[{label:"Caption files",value:e.summary.file_count},{label:"Changed",value:e.summary.changed_file_count},{label:"Unchanged",value:e.summary.unchanged_file_count},{label:"Tag instances removed",value:e.summary.removed_tag_instances},{label:"Tag instances added",value:e.summary.added_tag_instances},{label:"Empty results",value:e.summary.empty_result_count}],s=e.warnings.length?`
      <article class="dataset-analysis-block dataset-analysis-warning">
        <p class="panel-kicker">warnings</p>
        <ul class="dataset-analysis-list-plain">
          ${e.warnings.map(n=>`<li>${o(n)}</li>`).join("")}
        </ul>
      </article>
    `:"",i=e.samples.length?e.samples.map(n=>`
            <article class="dataset-analysis-block">
              <div class="tool-card-head">
                <h3>${o(n.path)}</h3>
                <span class="coverage-pill ${n.before!==n.after?"":"coverage-pill-muted"}">
                  ${n.before_count} -> ${n.after_count}
                </span>
              </div>
              <div class="dataset-cleanup-diff">
                <div>
                  <p class="panel-kicker">before</p>
                  <pre>${o(n.before||"(empty)")}</pre>
                </div>
                <div>
                  <p class="panel-kicker">after</p>
                  <pre>${o(n.after||"(empty)")}</pre>
                </div>
              </div>
              <div class="dataset-analysis-sublist">
                <h4>Removed tags</h4>
                ${P(n.removed_tags,"No explicit tag removals in sample.")}
              </div>
              <div class="dataset-analysis-sublist">
                <h4>Added tags</h4>
                ${P(n.added_tags,"No explicit tag additions in sample.")}
              </div>
            </article>
          `).join(""):"<p>No sample caption changes were captured.</p>";f(t,`
      ${s}
      <section class="dataset-analysis-grid">
        ${a.map(n=>`
              <article class="dataset-analysis-stat">
                <span class="metric-label">${o(n.label)}</span>
                <strong class="dataset-analysis-stat-value">${o(n.value)}</strong>
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
          ${Lt([e.options.dedupe_tags?{name:"dedupe tags",count:1}:null,e.options.sort_tags?{name:"sort tags",count:1}:null,e.options.use_regex?{name:"regex replace",count:1}:null].filter(Boolean),"No boolean cleanup switches enabled.")}
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
          <div class="dataset-analysis-stack">${i}</div>
        </article>
      </section>
    `)}function Ea(e,t,a="caption-backup-results"){if(!e.length){f(a,`
        <article class="dataset-analysis-block">
          <p class="panel-kicker">snapshots</p>
          <h3>No caption snapshots found</h3>
          <p>Create the first backup for this folder to get a restore point before cleanup or tagging.</p>
        </article>
      `);return}const s=e.map(i=>`
        <article class="dataset-analysis-block ${i.archive_name===t?"dataset-analysis-selected":""}">
          <div class="tool-card-head">
            <h3>${o(i.snapshot_name)}</h3>
            <span class="coverage-pill ${i.archive_name===t?"":"coverage-pill-muted"}">
              ${o(i.archive_name)}
            </span>
          </div>
          <p><code>${o(i.source_root)}</code></p>
          <p>Created: <strong>${o(i.created_at||"unknown")}</strong></p>
          <p>Caption files: <strong>${i.file_count}</strong> · Archive size: <strong>${Pa(i.archive_size)}</strong></p>
          <p>Extension: <code>${o(i.caption_extension||".txt")}</code> · Recursive: <strong>${i.recursive?"yes":"no"}</strong></p>
        </article>
      `).join("");f(a,`<div class="dataset-analysis-stack">${s}</div>`)}function Ia(e,t="caption-backup-results"){const a=e.warnings.length?`
      <article class="dataset-analysis-block dataset-analysis-warning">
        <p class="panel-kicker">warnings</p>
        <ul class="dataset-analysis-list-plain">
          ${e.warnings.map(s=>`<li>${o(s)}</li>`).join("")}
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
    `)}function Lt(e,t){return e.length?`
    <div class="coverage-list">
      ${e.map(a=>`<span class="coverage-pill">${o(a.name)} <strong>${a.count}</strong></span>`).join("")}
    </div>
  `:`<p>${o(t)}</p>`}function ke(e,t){return e.length?`
    <ul class="dataset-analysis-list-plain">
      ${e.map(a=>`<li><code>${o(a.name)}</code> <strong>${a.count}</strong></li>`).join("")}
    </ul>
  `:`<p>${o(t)}</p>`}function P(e,t){return e.length?`
    <ul class="dataset-analysis-list-plain">
      ${e.map(a=>`<li><code>${o(a)}</code></li>`).join("")}
    </ul>
  `:`<p>${o(t)}</p>`}function ce(e){return`${(e*100).toFixed(1)}%`}function Pa(e){return e<1024?`${e} B`:e<1024**2?`${(e/1024).toFixed(1)} KB`:e<1024**3?`${(e/1024**2).toFixed(1)} MB`:`${(e/1024**3).toFixed(2)} GB`}function At(e){return e.length===0?"No cards reported yet.":e.map((t,a)=>`GPU ${t.index??t.id??a}: ${t.name}`).join(" | ")}function Ra(e){if(e.length===0)return"No tasks currently tracked.";const t=e.filter(a=>a.status&&!["FINISHED","TERMINATED","FAILED"].includes(String(a.status))).length;return`${e.length} tracked, ${t} active`}function Na(e){var a;const t=(a=e.detail)==null?void 0:a.trim();return t?`${e.status} - ${t}`:e.status}const V="#/workspace",H=[{id:"overview",label:"Workspace",section:"overview",hash:V,description:"Source migration dashboard and live backend diagnostics."},{id:"about",label:"About",section:"phase1",hash:"#/about",description:"Rebuild branding and release notes in source form."},{id:"settings",label:"Settings",section:"phase1",hash:"#/settings",description:"Read config summary and saved parameter state from the backend."},{id:"tasks",label:"Tasks",section:"phase1",hash:"#/tasks",description:"Inspect and manage task execution state."},{id:"tageditor",label:"Tag Editor",section:"phase1",hash:"#/tageditor",description:"Track startup status and future proxy behavior."},{id:"tensorboard",label:"TensorBoard",section:"phase1",hash:"#/tensorboard",description:"Prepare a cleaner source-side wrapper for TensorBoard access."},{id:"tools",label:"Tools",section:"phase1",hash:"#/tools",description:"Migrate script-launch and utility entry points from the legacy tools page."},{id:"schema-bridge",label:"Schema Bridge",section:"reference",hash:"#/schema-bridge",description:"Evaluate current schema DSL into a source-side explorer and prototype form renderer."},{id:"sdxl-train",label:"SDXL Train",section:"reference",hash:"#/sdxl-train",description:"First source-side training page powered by the schema bridge and current `/api/run` backend."},{id:"flux-train",label:"Flux Train",section:"reference",hash:"#/flux-train",description:"Source-side Flux LoRA training route built on the shared schema bridge and launch pipeline."},{id:"sd3-train",label:"SD3 Train",section:"reference",hash:"#/sd3-train",description:"Source-side SD3 LoRA training route using the same normalized payload workflow."},{id:"sd3-finetune-train",label:"SD3 Finetune",section:"reference",hash:"#/sd3-finetune-train",description:"Source-side SD3 finetune route on the shared training bridge."},{id:"dreambooth-train",label:"Dreambooth",section:"reference",hash:"#/dreambooth-train",description:"Source-side Dreambooth and SDXL full-finetune route on the shared schema bridge."},{id:"flux-finetune-train",label:"Flux Finetune",section:"reference",hash:"#/flux-finetune-train",description:"Source-side Flux full-finetune route using the shared launch workflow."},{id:"sd-controlnet-train",label:"SD ControlNet",section:"reference",hash:"#/sd-controlnet-train",description:"Source-side SD ControlNet training route using the shared launch flow."},{id:"sdxl-controlnet-train",label:"SDXL ControlNet",section:"reference",hash:"#/sdxl-controlnet-train",description:"Source-side SDXL ControlNet training route using the shared launch flow."},{id:"flux-controlnet-train",label:"Flux ControlNet",section:"reference",hash:"#/flux-controlnet-train",description:"Source-side Flux ControlNet training route using the shared launch flow."},{id:"sdxl-lllite-train",label:"SDXL LLLite",section:"reference",hash:"#/sdxl-lllite-train",description:"Source-side SDXL ControlNet-LLLite training route on the shared training bridge."},{id:"sd-ti-train",label:"SD TI",section:"reference",hash:"#/sd-ti-train",description:"Source-side SD textual inversion route on the shared training bridge."},{id:"xti-train",label:"SD XTI",section:"reference",hash:"#/xti-train",description:"Source-side SD XTI textual inversion route on the shared training bridge."},{id:"sdxl-ti-train",label:"SDXL TI",section:"reference",hash:"#/sdxl-ti-train",description:"Source-side SDXL textual inversion route on the shared training bridge."},{id:"anima-train",label:"Anima LoRA",section:"reference",hash:"#/anima-train",description:"Source-side Anima LoRA training route using the shared launch flow."},{id:"anima-finetune-train",label:"Anima Finetune",section:"reference",hash:"#/anima-finetune-train",description:"Source-side Anima finetune route using the shared launch flow."},{id:"lumina-train",label:"Lumina LoRA",section:"reference",hash:"#/lumina-train",description:"Source-side Lumina LoRA training route using the shared launch flow."},{id:"lumina-finetune-train",label:"Lumina Finetune",section:"reference",hash:"#/lumina-finetune-train",description:"Source-side Lumina finetune route using the shared launch flow."},{id:"hunyuan-image-train",label:"Hunyuan Image",section:"reference",hash:"#/hunyuan-image-train",description:"Source-side Hunyuan Image LoRA training route using the shared launch flow."}],Et=new Set(H.map(e=>e.hash)),It={"/index.html":V,"/index.md":V,"/404.html":V,"/404.md":V,"/task.html":"#/tasks","/task.md":"#/tasks","/tageditor.html":"#/tageditor","/tageditor.md":"#/tageditor","/tagger.html":"#/tageditor","/tagger.md":"#/tageditor","/tensorboard.html":"#/tensorboard","/tensorboard.md":"#/tensorboard","/other/about.html":"#/about","/other/about.md":"#/about","/other/settings.html":"#/settings","/other/settings.md":"#/settings","/dreambooth/index.html":"#/dreambooth-train","/dreambooth/index.md":"#/dreambooth-train","/lora/index.html":"#/sdxl-train","/lora/index.md":"#/sdxl-train"},Ca=Object.keys(It).sort((e,t)=>t.length-e.length);function Fe(e){const t=e.replace(/\/+$/,"");return t.length>0?`${t}/`:"/"}function Da(e){switch(e){case"flux":return"#/flux-train";case"flux-finetune":return"#/flux-finetune-train";case"sd3":return"#/sd3-train";case"sd3-finetune":return"#/sd3-finetune-train";case"controlnet":return"#/sd-controlnet-train";case"sdxl-controlnet":return"#/sdxl-controlnet-train";case"flux-controlnet":return"#/flux-controlnet-train";case"sdxl-lllite":return"#/sdxl-lllite-train";case"tools":return"#/tools";case"basic":case"master":case"params":case"sdxl":return"#/sdxl-train";case"sdxl-ti":return"#/sdxl-ti-train";case"ti":return"#/sd-ti-train";case"xti":return"#/xti-train";case"anima":return"#/anima-train";case"anima-finetune":return"#/anima-finetune-train";case"hunyuan":return"#/hunyuan-image-train";case"lumina":return"#/lumina-train";case"lumina-finetune":return"#/lumina-finetune-train";default:return null}}function Ba(e){const t=e.match(/^(.*)\/lora\/([^/]+)\.(?:html|md)$/i);if(!t)return null;const[,a,s]=t,i=Da(s.toLowerCase());return i?{hash:i,canonicalRootPath:Fe(a)}:null}function qa(e){const t=e.toLowerCase();for(const a of Ca)if(t.endsWith(a))return{hash:It[a],canonicalRootPath:Fe(e.slice(0,e.length-a.length))};return Ba(e)}function Qe(e,t){const a=`${e}${window.location.search}${t}`,s=`${window.location.pathname}${window.location.search}${window.location.hash}`;a!==s&&window.history.replaceState(null,"",a)}function za(){const e=Et.has(window.location.hash)?window.location.hash:V;return H.find(t=>t.hash===e)??H[0]}function Oa(){if(Et.has(window.location.hash))return;const e=qa(window.location.pathname);if(e){Qe(e.canonicalRootPath,e.hash);return}Qe(Fe(window.location.pathname||"/"),V)}const Le={"sdxl-train":{routeId:"sdxl-train",schemaName:"sdxl-lora",prefix:"sdxl",modelLabel:"SDXL",presetTrainTypes:["sdxl-lora"]},"flux-train":{routeId:"flux-train",schemaName:"flux-lora",prefix:"flux",modelLabel:"Flux",presetTrainTypes:["flux-lora"]},"sd3-train":{routeId:"sd3-train",schemaName:"sd3-lora",prefix:"sd3",modelLabel:"SD3",presetTrainTypes:["sd3-lora"]},"sd3-finetune-train":{routeId:"sd3-finetune-train",schemaName:"sd3-finetune",prefix:"sd3-finetune",modelLabel:"SD3 Finetune",presetTrainTypes:["sd3-finetune"]},"dreambooth-train":{routeId:"dreambooth-train",schemaName:"dreambooth",prefix:"dreambooth",modelLabel:"Dreambooth",presetTrainTypes:["dreambooth","sd-dreambooth","sdxl-finetune"]},"flux-finetune-train":{routeId:"flux-finetune-train",schemaName:"flux-finetune",prefix:"flux-finetune",modelLabel:"Flux Finetune",presetTrainTypes:["flux-finetune"]},"sd-controlnet-train":{routeId:"sd-controlnet-train",schemaName:"sd-controlnet",prefix:"sd-controlnet",modelLabel:"SD ControlNet",presetTrainTypes:["sd-controlnet"]},"sdxl-controlnet-train":{routeId:"sdxl-controlnet-train",schemaName:"sdxl-controlnet",prefix:"sdxl-controlnet",modelLabel:"SDXL ControlNet",presetTrainTypes:["sdxl-controlnet"]},"flux-controlnet-train":{routeId:"flux-controlnet-train",schemaName:"flux-controlnet",prefix:"flux-controlnet",modelLabel:"Flux ControlNet",presetTrainTypes:["flux-controlnet"]},"sdxl-lllite-train":{routeId:"sdxl-lllite-train",schemaName:"sdxl-controlnet-lllite",prefix:"sdxl-lllite",modelLabel:"SDXL LLLite",presetTrainTypes:["sdxl-controlnet-lllite"]},"sd-ti-train":{routeId:"sd-ti-train",schemaName:"sd-textual-inversion",prefix:"sd-ti",modelLabel:"SD Textual Inversion",presetTrainTypes:["sd-textual-inversion"]},"xti-train":{routeId:"xti-train",schemaName:"sd-textual-inversion-xti",prefix:"xti",modelLabel:"SD XTI",presetTrainTypes:["sd-textual-inversion-xti"]},"sdxl-ti-train":{routeId:"sdxl-ti-train",schemaName:"sdxl-textual-inversion",prefix:"sdxl-ti",modelLabel:"SDXL Textual Inversion",presetTrainTypes:["sdxl-textual-inversion"]},"anima-train":{routeId:"anima-train",schemaName:"anima-lora",prefix:"anima",modelLabel:"Anima LoRA",presetTrainTypes:["anima-lora"]},"anima-finetune-train":{routeId:"anima-finetune-train",schemaName:"anima-finetune",prefix:"anima-finetune",modelLabel:"Anima Finetune",presetTrainTypes:["anima-finetune"]},"lumina-train":{routeId:"lumina-train",schemaName:"lumina-lora",prefix:"lumina",modelLabel:"Lumina LoRA",presetTrainTypes:["lumina-lora"]},"lumina-finetune-train":{routeId:"lumina-finetune-train",schemaName:"lumina-finetune",prefix:"lumina-finetune",modelLabel:"Lumina Finetune",presetTrainTypes:["lumina-finetune"]},"hunyuan-image-train":{routeId:"hunyuan-image-train",schemaName:"hunyuan-image-lora",prefix:"hunyuan-image",modelLabel:"Hunyuan Image LoRA",presetTrainTypes:["hunyuan-image-lora"]}},Fa=80,Ma=100;function ye(){return typeof window<"u"?window:null}function Me(e,t){const a=ye();if(!a)return t;try{const s=a.localStorage.getItem(e);return s?JSON.parse(s):t}catch{return t}}function je(e,t){const a=ye();a&&a.localStorage.setItem(e,JSON.stringify(t))}function ja(e){const t=ye();t&&t.localStorage.removeItem(e)}function Ve(e){return`source-training-autosave-${e}`}function Pt(e){return`source-training-history-${e}`}function Rt(e){return`source-training-recipes-${e}`}function Nt(e){return Me(Ve(e),null)}function Va(e,t){je(Ve(e),t)}function Ha(e){ja(Ve(e))}function O(e){return Me(Pt(e),[])}function ue(e,t){je(Pt(e),t)}function R(e){return Me(Rt(e),[])}function Z(e,t){je(Rt(e),t)}function Ct(e){return e.slice(0,Fa)}function He(e){return e.slice(0,Ma)}function X(e,t,a="text/plain;charset=utf-8"){const s=ye();if(!s)return;const i=new Blob([t],{type:a}),n=URL.createObjectURL(i),r=s.document.createElement("a");r.href=n,r.download=e,r.click(),URL.revokeObjectURL(n)}async function Ga(){var c,p,d,u,l,h,g,b;const e=await Promise.allSettled([na(),wt(),Oe(),xt(),St(),ze()]),[t,a,s,i,n,r]=e;if(t.status==="fulfilled"){const y=((c=t.value.data)==null?void 0:c.schemas)??[];m("diag-schemas-title",`${y.length} schema hashes loaded`),m("diag-schemas-detail",y.slice(0,4).map(w=>w.name).join(", ")||"No schema names returned.")}else m("diag-schemas-title","Schema hash request failed"),m("diag-schemas-detail",t.reason instanceof Error?t.reason.message:"Unknown error");if(a.status==="fulfilled"){const y=((p=a.value.data)==null?void 0:p.presets)??[];m("diag-presets-title",`${y.length} presets loaded`),m("diag-presets-detail","Source migration can reuse preset grouping later.")}else m("diag-presets-title","Preset request failed"),m("diag-presets-detail",a.reason instanceof Error?a.reason.message:"Unknown error");if(s.status==="fulfilled"){const y=((d=s.value.data)==null?void 0:d.tasks)??[];m("diag-tasks-title","Task manager reachable"),m("diag-tasks-detail",Ra(y))}else m("diag-tasks-title","Task request failed"),m("diag-tasks-detail",s.reason instanceof Error?s.reason.message:"Unknown error");if(i.status==="fulfilled"){const y=((u=i.value.data)==null?void 0:u.cards)??[],w=(l=i.value.data)==null?void 0:l.xformers,E=w?`xformers: ${w.installed?"installed":"missing"}, ${w.supported?"supported":"fallback"}`:"xformers info unavailable";m("diag-gpu-title",`${y.length} GPU entries reachable`),m("diag-gpu-detail",`${At(y)} | ${E}`)}else m("diag-gpu-title","GPU request failed"),m("diag-gpu-detail",i.reason instanceof Error?i.reason.message:"Unknown error");if(n.status==="fulfilled"?(m("diag-tageditor-title","Tag editor status reachable"),m("diag-tageditor-detail",Na(n.value))):(m("diag-tageditor-title","Tag editor status request failed"),m("diag-tageditor-detail",n.reason instanceof Error?n.reason.message:"Unknown error")),r.status==="fulfilled"){const y=((h=r.value.data)==null?void 0:h.schemas)??[];ka(y),wa(y),et(y,a.status==="fulfilled"?((g=a.value.data)==null?void 0:g.presets)??[]:[])}else f("schema-browser",`<p>${r.reason instanceof Error?r.reason.message:"Schema inventory request failed."}</p>`),et([],a.status==="fulfilled"?((b=a.value.data)==null?void 0:b.presets)??[]:[])}function Wa(e){return e.includes("controlnet")?"ControlNet":e.includes("textual-inversion")||e.includes("xti")?"Textual Inversion":e.includes("finetune")||e==="dreambooth"?"Finetune":"LoRA"}function Ua(e,t,a){const s=["preflight","prompt workspace","history","recipes"];return t.includes("resume:")&&s.push("resume"),(t.includes("prompt_file")||t.includes("positive_prompts"))&&s.push("sample prompts"),t.includes("validation_split")&&s.push("validation"),t.includes("masked_loss")&&s.push("masked loss"),t.includes("save_state")&&s.push("save state"),t.includes("conditioning_data_dir")&&s.push("conditioning"),a==="Textual Inversion"&&s.push("embeddings"),a==="ControlNet"&&s.push("controlnet"),e.routeId.startsWith("sdxl")&&s.push("experimental clip-skip"),[...new Set(s)]}function et(e,t){const a=new Map(e.map(i=>[i.name,String(i.schema??"")])),s=Object.values(Le).map(i=>{var h;const n=H.find(g=>g.id===i.routeId),r=Wa(i.schemaName),c=a.get(i.schemaName)??"",p=t.filter(g=>{const y=(g.metadata??{}).train_type;return typeof y!="string"||y.trim().length===0?!1:i.presetTrainTypes.includes(y)}).length,d=O(i.routeId).length,u=R(i.routeId).length,l=!!((h=Nt(i.routeId))!=null&&h.value);return{routeId:i.routeId,title:(n==null?void 0:n.label)??i.modelLabel,routeHash:(n==null?void 0:n.hash)??"#/workspace",schemaName:i.schemaName,modelLabel:i.modelLabel,family:r,presetCount:p,localHistoryCount:d,localRecipeCount:u,autosaveReady:l,schemaAvailable:a.has(i.schemaName),capabilities:Ua(i,c,r)}}).sort((i,n)=>i.family.localeCompare(n.family)||i.title.localeCompare(n.title));$a(s)}const Dt="source-training-option-visibility-v1",Xa="__custom__:",tt=new Set(["AdaBelief","Adan","CAME","LaProp","MADGRAD","RAdam","Ranger","Ranger21","ScheduleFreeAdamW","SophiaH","StableAdamW"]),Ka=["LBFGS","SGD","Adam","AdamW","NAdam","RMSprop","A2Grad","ADOPT","APOLLO","ASGD","AccSGD","AdEMAMix","AdaBelief","AdaBound","AdaDelta","AdaFactor","AdaGC","AdaGO","AdaHessian","AdaLOMO","AdaMax","AdaMod","AdaMuon","AdaNorm","AdaPNM","AdaShift","AdaSmooth","AdaTAM","Adai","Adalite","AdamC","AdamG","AdamMini","AdamP","AdamS","AdamWSN","Adan","AggMo","Aida","AliG","Alice","BCOS","Amos","Ano","ApolloDQN","AvaGrad","BSAM","CAME","Conda","DAdaptAdaGrad","DAdaptAdam","DAdaptAdan","DAdaptLion","DAdaptSGD","DeMo","DiffGrad","DistributedMuon","EXAdam","EmoFact","EmoLynx","EmoNavi","FAdam","FOCUS","FTRL","Fira","Fromage","GaLore","Grams","Gravity","GrokFastAdamW","Kate","Kron","LARS","LOMO","LaProp","Lamb","Lion","MADGRAD","MARS","MSVAG","Muon","Nero","NovoGrad","PAdam","PID","PNM","Prodigy","QHAdam","QHM","RACS","RAdam","Ranger","Ranger21","Ranger25","SCION","SCIONLight","SGDP","SGDSaI","SGDW","SM3","SOAP","SPAM","SPlus","SRMM","SWATS","ScalableShampoo","ScheduleFreeAdamW","ScheduleFreeRAdam","ScheduleFreeSGD","Shampoo","SignSGD","SimplifiedAdEMAMix","SophiaH","StableAdamW","StableSPAM","TAM","Tiger","VSGD","Yogi","SpectralSphere"],Bt={AdaBelief:"Adam-like optimizer with variance tracking tuned by prediction belief.",Adan:"Fast adaptive optimizer that many diffusion users like for aggressive finetunes.",CAME:"Memory-conscious optimizer from pytorch-optimizer, already popular in diffusion training.",LaProp:"Adam and RMSProp style hybrid that some LoRA users prefer for stable convergence.",MADGRAD:"Momentumized dual averaging optimizer with a good track record on noisy training runs.",RAdam:"Rectified Adam variant that can behave more gently than plain AdamW early on.",Ranger:"RAdam plus Lookahead style optimizer from the Ranger family.",Ranger21:"Heavier Ranger-family optimizer with many training-time stabilizers built in.",ScheduleFreeAdamW:"Schedule-free AdamW variant that reduces dependence on a separate LR scheduler.",ScheduleFreeRAdam:"Schedule-free RAdam variant from pytorch-optimizer.",SophiaH:"Hessian-aware optimizer that some users test for large-batch training.",StableAdamW:"Stabilized AdamW implementation from pytorch-optimizer."},Ge=[{kind:"optimizer",value:"AdamW",label:"AdamW",description:"Standard torch AdamW optimizer.",source:"torch",sourceLabel:"torch.optim",defaultVisible:!0,featured:!0},{kind:"optimizer",value:"AdamW8bit",label:"AdamW8bit",description:"bitsandbytes 8-bit AdamW for lower VRAM usage.",source:"bitsandbytes",sourceLabel:"bitsandbytes",defaultVisible:!0,featured:!0,packageName:"bitsandbytes"},{kind:"optimizer",value:"PagedAdamW8bit",label:"PagedAdamW8bit",description:"Paged 8-bit AdamW from bitsandbytes.",source:"bitsandbytes",sourceLabel:"bitsandbytes",defaultVisible:!0,packageName:"bitsandbytes"},{kind:"optimizer",value:"RAdamScheduleFree",label:"RAdamScheduleFree",description:"Schedule-free RAdam from the schedulefree package.",source:"schedulefree",sourceLabel:"schedulefree",defaultVisible:!0,featured:!0,packageName:"schedulefree"},{kind:"optimizer",value:"Lion",label:"Lion",description:"Lion optimizer using the project's existing training bridge.",source:"bridge",sourceLabel:"bridge built-in",defaultVisible:!0,featured:!0},{kind:"optimizer",value:"Lion8bit",label:"Lion8bit",description:"bitsandbytes 8-bit Lion.",source:"bitsandbytes",sourceLabel:"bitsandbytes",defaultVisible:!0,packageName:"bitsandbytes"},{kind:"optimizer",value:"PagedLion8bit",label:"PagedLion8bit",description:"Paged 8-bit Lion from bitsandbytes.",source:"bitsandbytes",sourceLabel:"bitsandbytes",defaultVisible:!0,packageName:"bitsandbytes"},{kind:"optimizer",value:"SGDNesterov",label:"SGDNesterov",description:"Nesterov SGD handled by the project bridge.",source:"bridge",sourceLabel:"bridge built-in",defaultVisible:!0},{kind:"optimizer",value:"SGDNesterov8bit",label:"SGDNesterov8bit",description:"bitsandbytes 8-bit Nesterov SGD.",source:"bitsandbytes",sourceLabel:"bitsandbytes",defaultVisible:!0,packageName:"bitsandbytes"},{kind:"optimizer",value:"DAdaptation",label:"DAdaptation",description:"Legacy DAdaptation bridge entry used by many existing configs.",source:"bridge",sourceLabel:"bridge built-in",defaultVisible:!0},{kind:"optimizer",value:"DAdaptAdam",label:"DAdaptAdam",description:"DAdapt Adam bridge entry.",source:"bridge",sourceLabel:"bridge built-in",defaultVisible:!0},{kind:"optimizer",value:"DAdaptAdaGrad",label:"DAdaptAdaGrad",description:"DAdapt AdaGrad bridge entry.",source:"bridge",sourceLabel:"bridge built-in",defaultVisible:!0},{kind:"optimizer",value:"DAdaptAdanIP",label:"DAdaptAdanIP",description:"Existing Adan-IP flavored DAdapt bridge entry.",source:"bridge",sourceLabel:"bridge built-in",defaultVisible:!0},{kind:"optimizer",value:"DAdaptLion",label:"DAdaptLion",description:"DAdapt Lion bridge entry.",source:"bridge",sourceLabel:"bridge built-in",defaultVisible:!0},{kind:"optimizer",value:"DAdaptSGD",label:"DAdaptSGD",description:"DAdapt SGD bridge entry.",source:"bridge",sourceLabel:"bridge built-in",defaultVisible:!0},{kind:"optimizer",value:"AdaFactor",label:"AdaFactor",description:"Transformers Adafactor bridge entry.",source:"transformers",sourceLabel:"transformers",defaultVisible:!0},{kind:"optimizer",value:"Prodigy",label:"Prodigy",description:"Prodigy optimizer already supported by the training bridge.",source:"bridge",sourceLabel:"bridge built-in",defaultVisible:!0,featured:!0},{kind:"optimizer",value:"prodigyplus.ProdigyPlusScheduleFree",label:"ProdigyPlusScheduleFree",description:"ProdigyPlus schedule-free optimizer entry.",source:"prodigyplus",sourceLabel:"prodigyplus",defaultVisible:!0,packageName:"prodigyplus"},{kind:"optimizer",value:"pytorch_optimizer.CAME",label:"CAME",description:Bt.CAME,source:"pytorch-optimizer",sourceLabel:"pytorch-optimizer",defaultVisible:!0,featured:!0,packageName:"pytorch_optimizer"},{kind:"optimizer",value:"bitsandbytes.optim.AdEMAMix8bit",label:"AdEMAMix8bit",description:"bitsandbytes AdEMAMix 8-bit optimizer.",source:"bitsandbytes",sourceLabel:"bitsandbytes",defaultVisible:!0,packageName:"bitsandbytes"},{kind:"optimizer",value:"bitsandbytes.optim.PagedAdEMAMix8bit",label:"PagedAdEMAMix8bit",description:"Paged bitsandbytes AdEMAMix 8-bit optimizer.",source:"bitsandbytes",sourceLabel:"bitsandbytes",defaultVisible:!0,packageName:"bitsandbytes"}];function Ja(e){return`${Xa}${e}`}function L(e,t,a,s,i,n=!1,r=!1){return{kind:"scheduler",value:Ja(i),label:e,description:t,source:a,sourceLabel:s,defaultVisible:n,featured:r,schedulerTypePath:i,schedulerFallback:"constant",packageName:a==="pytorch-optimizer"?"pytorch_optimizer":void 0}}const qt=[{kind:"scheduler",value:"linear",label:"linear",description:"Built-in diffusers linear scheduler.",source:"diffusers",sourceLabel:"diffusers",defaultVisible:!0,featured:!0},{kind:"scheduler",value:"cosine",label:"cosine",description:"Built-in diffusers cosine scheduler.",source:"diffusers",sourceLabel:"diffusers",defaultVisible:!0,featured:!0},{kind:"scheduler",value:"cosine_with_restarts",label:"cosine_with_restarts",description:"Built-in diffusers cosine scheduler with restarts.",source:"diffusers",sourceLabel:"diffusers",defaultVisible:!0,featured:!0},{kind:"scheduler",value:"polynomial",label:"polynomial",description:"Built-in diffusers polynomial scheduler.",source:"diffusers",sourceLabel:"diffusers",defaultVisible:!0},{kind:"scheduler",value:"constant",label:"constant",description:"Built-in constant scheduler.",source:"diffusers",sourceLabel:"diffusers",defaultVisible:!0},{kind:"scheduler",value:"constant_with_warmup",label:"constant_with_warmup",description:"Built-in constant scheduler with warmup.",source:"diffusers",sourceLabel:"diffusers",defaultVisible:!0}],Ya=[L("CosineAnnealingLR","Torch cosine annealing scheduler.","torch","torch lr_scheduler","torch.optim.lr_scheduler.CosineAnnealingLR",!0,!0),L("CosineAnnealingWarmRestarts","Torch cosine annealing scheduler with warm restarts.","torch","torch lr_scheduler","torch.optim.lr_scheduler.CosineAnnealingWarmRestarts",!0,!0),L("OneCycleLR","Torch one-cycle scheduler.","torch","torch lr_scheduler","torch.optim.lr_scheduler.OneCycleLR",!0,!0),L("StepLR","Torch step scheduler.","torch","torch lr_scheduler","torch.optim.lr_scheduler.StepLR"),L("MultiStepLR","Torch multi-step scheduler.","torch","torch lr_scheduler","torch.optim.lr_scheduler.MultiStepLR"),L("CyclicLR","Torch cyclic scheduler.","torch","torch lr_scheduler","torch.optim.lr_scheduler.CyclicLR"),L("CosineAnnealingWarmupRestarts","pytorch-optimizer warmup cosine scheduler.","pytorch-optimizer","pytorch-optimizer","pytorch_optimizer.CosineAnnealingWarmupRestarts",!0,!0),L("REXScheduler","pytorch-optimizer REX scheduler.","pytorch-optimizer","pytorch-optimizer","pytorch_optimizer.REXScheduler",!0,!0),L("CosineScheduler","pytorch-optimizer cosine scheduler helper.","pytorch-optimizer","pytorch-optimizer","pytorch_optimizer.CosineScheduler"),L("LinearScheduler","pytorch-optimizer linear scheduler helper.","pytorch-optimizer","pytorch-optimizer","pytorch_optimizer.LinearScheduler"),L("PolyScheduler","pytorch-optimizer polynomial scheduler helper.","pytorch-optimizer","pytorch-optimizer","pytorch_optimizer.PolyScheduler"),L("ProportionScheduler","pytorch-optimizer proportion scheduler.","pytorch-optimizer","pytorch-optimizer","pytorch_optimizer.ProportionScheduler"),L("Chebyshev","pytorch-optimizer chebyshev schedule helper.","pytorch-optimizer","pytorch-optimizer","pytorch_optimizer.get_chebyshev_schedule"),L("WarmupStableDecay","pytorch-optimizer warmup-stable-decay schedule helper.","pytorch-optimizer","pytorch-optimizer","pytorch_optimizer.get_wsd_schedule")];function Za(e){const t=Bt[e]??"Extra optimizer imported from pytorch-optimizer.";return{kind:"optimizer",value:`pytorch_optimizer.${e}`,label:e,description:t,source:"pytorch-optimizer",sourceLabel:"pytorch-optimizer",defaultVisible:tt.has(e),featured:tt.has(e),packageName:"pytorch_optimizer"}}function Qa(e){const t=e.trim(),a=t.lastIndexOf(".");return a===-1?t.toLowerCase():t.slice(a+1).toLowerCase()}const ei=new Set(Ge.map(e=>Qa(e.value))),ti=Ka.filter(e=>!ei.has(e.toLowerCase())).map(e=>Za(e)),M=[...Ge,...ti,...qt,...Ya],ai={optimizer:Ge.map(e=>e.value),scheduler:qt.map(e=>e.value)},ii=new Map(M.map(e=>[`${e.kind}:${e.value}`,e])),zt=new Map(M.filter(e=>e.kind==="scheduler"&&e.schedulerTypePath).map(e=>[e.schedulerTypePath,e]));function si(e,t){return e.defaultVisible!==t.defaultVisible?e.defaultVisible?-1:1:e.featured!==t.featured?e.featured?-1:1:e.sourceLabel!==t.sourceLabel?e.sourceLabel.localeCompare(t.sourceLabel):e.label.localeCompare(t.label)}function Ot(){return typeof window<"u"?window:null}function ie(){const e={optimizer:M.filter(a=>a.kind==="optimizer"&&a.defaultVisible).map(a=>a.value),scheduler:M.filter(a=>a.kind==="scheduler"&&a.defaultVisible).map(a=>a.value)},t=Ot();if(!t)return e;try{const a=t.localStorage.getItem(Dt);if(!a)return e;const s=JSON.parse(a);return{optimizer:Ae("optimizer",s.optimizer,e.optimizer),scheduler:Ae("scheduler",s.scheduler,e.scheduler)}}catch{return e}}function Ae(e,t,a){if(!Array.isArray(t))return[...a];const s=new Set(M.filter(i=>i.kind===e).map(i=>i.value));return t.map(i=>String(i)).filter((i,n,r)=>s.has(i)&&r.indexOf(i)===n)}function ae(e){const t=Ot();t&&t.localStorage.setItem(Dt,JSON.stringify(e))}function ve(e){return M.filter(t=>t.kind===e).slice().sort(si)}function We(e,t){return ii.get(`${e}:${t}`)??null}function Ft(e){return zt.get(e)??null}function Mt(){return ie()}function ni(e,t){const a=ie();a[e]=Ae(e,t,[]),ae(a)}function ri(e){if(!e){ae({optimizer:M.filter(s=>s.kind==="optimizer"&&s.defaultVisible).map(s=>s.value),scheduler:M.filter(s=>s.kind==="scheduler"&&s.defaultVisible).map(s=>s.value)});return}const t=ve(e).filter(s=>s.defaultVisible).map(s=>s.value),a=ie();a[e]=t,ae(a)}function oi(e,t){const a=ve(e).map(i=>i.value),s=ie();s[e]=a,ae(s)}function li(e){const t=ie();t[e]=[...ai[e]],ae(t)}function ci(e,t){const a=[];return t&&a.push("Currently hidden in Settings, but kept because this value is already selected or imported."),(e==null?void 0:e.kind)==="scheduler"&&e.schedulerTypePath&&a.push(`Launch bridge writes lr_scheduler_type=${e.schedulerTypePath}.`),(e==null?void 0:e.packageName)==="pytorch_optimizer"&&a.push("Requires pytorch_optimizer in the active Python environment."),a.join(" ")}function ui(e,t){return{value:e,label:t?`${e} [hidden/imported]`:e,description:"Imported value kept for compatibility.",hiddenBySettings:t,selectionNote:t?"This value is not in the current visible catalog, but it is preserved so older configs keep working.":void 0}}function di(e,t,a){const s=new Set(Mt()[e]),i=a==null?"":String(a),n=[],r=new Set,c=(p,d=!1)=>{if(r.has(p))return;const u=We(e,p),l=!!u&&!s.has(p);if(d?!l||p===i||!u:s.has(p)||p===i){if(!u){n.push(ui(p,p===i&&!d)),r.add(p);return}n.push({value:p,label:`${u.label} [${u.sourceLabel}]${l?" [hidden]":""}`,description:u.description,sourceLabel:u.sourceLabel,hiddenBySettings:l,selectionNote:ci(u,l),entry:u}),r.add(p)}};for(const p of t)c(String(p),!0);for(const p of ve(e))c(p.value);return i.length>0&&!r.has(i)&&c(i),n}function Q(e){return e==null?"":String(e)}function pi(e,t){if(t==="lr_scheduler"){const a=Q(e.lr_scheduler),s=We("scheduler",a);if(s!=null&&s.schedulerTypePath){e.lr_scheduler_type=s.schedulerTypePath;return}const i=Q(e.lr_scheduler_type).trim();i.length>0&&zt.has(i)&&(e.lr_scheduler_type="");return}if(t==="lr_scheduler_type"){const a=Q(e.lr_scheduler_type).trim(),s=Ft(a);s&&(e.lr_scheduler=s.value)}}function hi(e){const t=Q(e.lr_scheduler_type).trim();if(t.length===0)return e;const a=Ft(t);return a&&(e.lr_scheduler=a.value),e}function mi(e){const t=Q(e.lr_scheduler),a=We("scheduler",t);return a!=null&&a.schedulerTypePath&&(e.lr_scheduler_type=a.schedulerTypePath,e.lr_scheduler=a.schedulerFallback??"constant"),e}function gi(e,t){const a=new Map;for(const s of e){const i=a.get(s.sourceLabel)??{total:0,visible:0};i.total+=1,t.has(s.value)&&(i.visible+=1),a.set(s.sourceLabel,i)}return[...a.entries()].map(([s,i])=>`<span class="coverage-pill ${i.visible>0?"":"coverage-pill-muted"}">${o(s)} <strong>${i.visible}/${i.total}</strong></span>`).join("")}function fi(e,t,a){const s=t.schedulerTypePath?`<strong>Bridge:</strong> <code>${o(t.schedulerTypePath)}</code>`:`<strong>Value:</strong> <code>${o(t.value)}</code>`,i=[`<span class="coverage-pill ${a?"":"coverage-pill-muted"}">${a?"visible":"hidden"}</span>`,`<span class="coverage-pill coverage-pill-muted">${o(t.sourceLabel)}</span>`,t.defaultVisible?'<span class="coverage-pill">default</span>':'<span class="coverage-pill coverage-pill-muted">extra</span>',t.packageName?`<span class="coverage-pill coverage-pill-warning">${o(t.packageName)}</span>`:""].filter(Boolean).join("");return`
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
            <p class="settings-option-meta">${s}</p>
          </div>
        </div>
        <div class="coverage-list">${i}</div>
      </div>
      <p class="settings-option-description">${o(t.description)}</p>
    </label>
  `}function de(e){const t=ve(e),a=new Set(Mt()[e]),s=`settings-${e}-title`,i=`settings-${e}-body`,n=t.filter(p=>a.has(p.value)).length,r=e==="optimizer"?"optimizers":"schedulers",c=e==="optimizer"?"Curate what appears in optimizer_type across the rebuilt training routes.":"Custom scheduler entries are converted into lr_scheduler_type automatically when you launch training.";m(s,`${n}/${t.length} ${r} visible`),f(i,`
      <p>${o(c)}</p>
      <div class="settings-option-toolbar">
        <button class="action-button action-button-ghost action-button-small" data-training-option-action="${e}:defaults" type="button">Reset defaults</button>
        <button class="action-button action-button-ghost action-button-small" data-training-option-action="${e}:builtins" type="button">Built-ins only</button>
        <button class="action-button action-button-ghost action-button-small" data-training-option-action="${e}:all" type="button">Show all</button>
      </div>
      <div class="coverage-list settings-option-coverage">
        <span class="coverage-pill">${n} enabled</span>
        ${gi(t,a)}
      </div>
      <div class="settings-option-grid">
        ${t.map(p=>fi(e,p,a.has(p.value))).join("")}
      </div>
    `)}function pe(e){const t=document.querySelector(`#settings-${e}-body`);t&&(t.querySelectorAll(`[data-training-option-toggle="${e}"]`).forEach(a=>{a.addEventListener("change",()=>{const s=t.querySelectorAll(`[data-training-option-toggle="${e}"]:checked`);ni(e,[...s].map(i=>i.value)),de(e),pe(e)})}),t.querySelectorAll(`[data-training-option-action^="${e}:"]`).forEach(a=>{a.addEventListener("click",()=>{var i;const s=(i=a.dataset.trainingOptionAction)==null?void 0:i.split(":")[1];s==="defaults"?ri(e):s==="builtins"?li(e):s==="all"&&oi(e),de(e),pe(e)})}))}function bi(){de("optimizer"),de("scheduler"),pe("optimizer"),pe("scheduler")}async function yi(){const[e,t]=await Promise.allSettled([oa(),ra()]);if(e.status==="fulfilled"){const a=e.value.data;m("settings-summary-title",`${(a==null?void 0:a.saved_param_count)??0} remembered param groups`),f("settings-summary-body",`
        <p><strong>Config file:</strong> <code>${o((a==null?void 0:a.config_path)??"unknown")}</code></p>
        <p><strong>Last path:</strong> <code>${o((a==null?void 0:a.last_path)||"(empty)")}</code></p>
        <p><strong>Saved keys:</strong> ${((a==null?void 0:a.saved_param_keys)??[]).map(s=>`<code>${o(s)}</code>`).join(", ")||"none"}</p>
      `)}else m("settings-summary-title","Config summary request failed"),m("settings-summary-body",e.reason instanceof Error?e.reason.message:"Unknown error");if(t.status==="fulfilled"){const a=t.value.data??{},s=Object.keys(a);m("settings-params-title",`${s.length} saved param entries`),f("settings-params-body",s.length?`<div class="coverage-list">${s.map(i=>`<span class="coverage-pill coverage-pill-muted">${o(i)}</span>`).join("")}</div>`:"<p>No saved params returned.</p>")}else m("settings-params-title","Saved params request failed"),m("settings-params-body",t.reason instanceof Error?t.reason.message:"Unknown error");bi()}const vi="".replace(/\/$/,""),_i=vi||"";function B(e){return/^https?:\/\//.test(e)?e:(e.startsWith("/")||(e=`/${e}`),`${_i}${e}`)}async function ki(){try{const e=await St();m("tag-editor-status-title",`Current status: ${e.status}`),f("tag-editor-status-body",`
        <p>${o(e.detail||"No extra detail returned.")}</p>
        <p><a class="text-link" href="${B("/tageditor.html")}" target="_blank" rel="noreferrer">Open current shipped wrapper page</a></p>
      `)}catch(e){m("tag-editor-status-title","Tag editor status request failed"),m("tag-editor-status-body",e instanceof Error?e.message:"Unknown error")}}async function wi(){var e;xi(),$i(),await Si(),Ti(),Li();try{const a=((e=(await la()).data)==null?void 0:e.scripts)??[];m("tools-summary-title",`${a.length} launcher scripts available`),f("tools-summary-body",`
        <p>Categories: ${[...new Set(a.map(s=>s.category))].map(s=>`<code>${o(s)}</code>`).join(", ")}</p>
        <p>The tools workspace now includes dataset analysis, masked-loss alpha inspection, batch auto-tagging, caption cleanup, and caption restore snapshots, with more curated high-frequency flows still planned.</p>
      `),Sa(a)}catch(t){m("tools-summary-title","Script inventory request failed"),m("tools-summary-body",t instanceof Error?t.message:"Unknown error"),f("tools-browser","<p>Tool inventory failed to load.</p>")}}function $i(){const e=Ei();e&&(e.browseButton.addEventListener("click",async()=>{m("masked-loss-audit-status","Opening folder picker...");try{e.pathInput.value=await G("folder"),m("masked-loss-audit-status","Folder selected. Ready to inspect alpha masks.")}catch(t){m("masked-loss-audit-status",t instanceof Error?t.message:"Folder picker failed.")}}),e.runButton.addEventListener("click",()=>{it(e)}),e.pathInput.addEventListener("keydown",t=>{t.key==="Enter"&&(t.preventDefault(),it(e))}))}function xi(){const e=Ai();e&&(e.browseButton.addEventListener("click",async()=>{m("dataset-analysis-status","Opening folder picker...");try{e.pathInput.value=await G("folder"),m("dataset-analysis-status","Folder selected. Ready to analyze.")}catch(t){m("dataset-analysis-status",t instanceof Error?t.message:"Folder picker failed.")}}),e.runButton.addEventListener("click",()=>{at(e)}),e.pathInput.addEventListener("keydown",t=>{t.key==="Enter"&&(t.preventDefault(),at(e))}))}async function Si(){var t;const e=Ii();if(e){e.browseButton.addEventListener("click",async()=>{m("batch-tagger-status","Opening folder picker...");try{e.pathInput.value=await G("folder"),m("batch-tagger-status","Folder selected. Ready to launch batch tagging.")}catch(a){m("batch-tagger-status",a instanceof Error?a.message:"Folder picker failed.")}}),e.runButton.addEventListener("click",()=>{st(e)}),e.pathInput.addEventListener("keydown",a=>{a.key==="Enter"&&(a.preventDefault(),st(e))});try{const a=await da(),s=((t=a.data)==null?void 0:t.interrogators)??[];if(!s.length)throw new Error("No interrogator models returned.");e.modelSelect.innerHTML=s.map(i=>{var c;const n=i.is_default||i.name===((c=a.data)==null?void 0:c.default)?" selected":"",r=i.kind==="cl"?"CL":"WD";return`<option value="${o(i.name)}"${n}>${o(i.name)} (${r})</option>`}).join(""),m("batch-tagger-status",`Loaded ${s.length} interrogator models.`)}catch(a){e.modelSelect.innerHTML='<option value="wd14-convnextv2-v2">wd14-convnextv2-v2 (WD)</option>',m("batch-tagger-status",a instanceof Error?a.message:"Failed to load interrogator inventory."),f("batch-tagger-results",`<article class="dataset-analysis-block dataset-analysis-warning"><p>${o(a instanceof Error?a.message:"Failed to load interrogator inventory.")}</p></article>`)}}}function Ti(){const e=Pi();e&&(e.browseButton.addEventListener("click",async()=>{m("caption-cleanup-status","Opening folder picker...");try{e.pathInput.value=await G("folder"),m("caption-cleanup-status","Folder selected. Ready to preview cleanup.")}catch(t){m("caption-cleanup-status",t instanceof Error?t.message:"Folder picker failed.")}}),e.previewButton.addEventListener("click",()=>{we(e,"preview")}),e.applyButton.addEventListener("click",()=>{we(e,"apply")}),e.pathInput.addEventListener("keydown",t=>{t.key==="Enter"&&(t.preventDefault(),we(e,"preview"))}))}function Li(){const e=Ri();e&&(e.browseButton.addEventListener("click",async()=>{m("caption-backup-status","Opening folder picker...");try{e.pathInput.value=await G("folder"),m("caption-backup-status","Folder selected. Refreshing snapshots..."),await ee(e)}catch(t){m("caption-backup-status",t instanceof Error?t.message:"Folder picker failed.")}}),e.refreshButton.addEventListener("click",()=>{ee(e)}),e.createButton.addEventListener("click",()=>{Ni(e)}),e.restoreButton.addEventListener("click",()=>{Ci(e)}),e.selectInput.addEventListener("change",()=>{ee(e,e.selectInput.value||null)}))}function Ai(){const e=document.querySelector("#dataset-analysis-path"),t=document.querySelector("#dataset-analysis-caption-extension"),a=document.querySelector("#dataset-analysis-top-tags"),s=document.querySelector("#dataset-analysis-sample-limit"),i=document.querySelector("#dataset-analysis-pick"),n=document.querySelector("#dataset-analysis-run");return!e||!t||!a||!s||!i||!n?null:{pathInput:e,captionExtensionInput:t,topTagsInput:a,sampleLimitInput:s,browseButton:i,runButton:n}}function Ei(){const e=document.querySelector("#masked-loss-audit-path"),t=document.querySelector("#masked-loss-audit-sample-limit"),a=document.querySelector("#masked-loss-audit-recursive"),s=document.querySelector("#masked-loss-audit-pick"),i=document.querySelector("#masked-loss-audit-run");return!e||!t||!a||!s||!i?null:{pathInput:e,sampleLimitInput:t,recursiveInput:a,browseButton:s,runButton:i}}function Ii(){const e=document.querySelector("#batch-tagger-path"),t=document.querySelector("#batch-tagger-model"),a=document.querySelector("#batch-tagger-threshold"),s=document.querySelector("#batch-tagger-character-threshold"),i=document.querySelector("#batch-tagger-conflict"),n=document.querySelector("#batch-tagger-additional-tags"),r=document.querySelector("#batch-tagger-backup-name"),c=document.querySelector("#batch-tagger-exclude-tags"),p=document.querySelector("#batch-tagger-recursive"),d=document.querySelector("#batch-tagger-replace-underscore"),u=document.querySelector("#batch-tagger-escape-tag"),l=document.querySelector("#batch-tagger-add-rating-tag"),h=document.querySelector("#batch-tagger-add-model-tag"),g=document.querySelector("#batch-tagger-auto-backup"),b=document.querySelector("#batch-tagger-pick"),y=document.querySelector("#batch-tagger-run");return!e||!t||!a||!s||!i||!n||!r||!c||!p||!d||!u||!l||!h||!g||!b||!y?null:{pathInput:e,modelSelect:t,thresholdInput:a,characterThresholdInput:s,conflictSelect:i,additionalTagsInput:n,backupNameInput:r,excludeTagsInput:c,recursiveInput:p,replaceUnderscoreInput:d,escapeTagInput:u,addRatingTagInput:l,addModelTagInput:h,autoBackupInput:g,browseButton:b,runButton:y}}function Pi(){const e=document.querySelector("#caption-cleanup-path"),t=document.querySelector("#caption-cleanup-extension"),a=document.querySelector("#caption-cleanup-remove-tags"),s=document.querySelector("#caption-cleanup-prepend-tags"),i=document.querySelector("#caption-cleanup-append-tags"),n=document.querySelector("#caption-cleanup-search-text"),r=document.querySelector("#caption-cleanup-replace-text"),c=document.querySelector("#caption-cleanup-backup-name"),p=document.querySelector("#caption-cleanup-sample-limit"),d=document.querySelector("#caption-cleanup-recursive"),u=document.querySelector("#caption-cleanup-collapse-whitespace"),l=document.querySelector("#caption-cleanup-replace-underscore"),h=document.querySelector("#caption-cleanup-dedupe-tags"),g=document.querySelector("#caption-cleanup-sort-tags"),b=document.querySelector("#caption-cleanup-use-regex"),y=document.querySelector("#caption-cleanup-auto-backup"),w=document.querySelector("#caption-cleanup-pick"),E=document.querySelector("#caption-cleanup-preview"),D=document.querySelector("#caption-cleanup-apply");return!e||!t||!a||!s||!i||!n||!r||!c||!p||!d||!u||!l||!h||!g||!b||!y||!w||!E||!D?null:{pathInput:e,extensionInput:t,removeTagsInput:a,prependTagsInput:s,appendTagsInput:i,searchTextInput:n,replaceTextInput:r,backupNameInput:c,sampleLimitInput:p,recursiveInput:d,collapseWhitespaceInput:u,replaceUnderscoreInput:l,dedupeTagsInput:h,sortTagsInput:g,useRegexInput:b,autoBackupInput:y,browseButton:w,previewButton:E,applyButton:D}}function Ri(){const e=document.querySelector("#caption-backup-path"),t=document.querySelector("#caption-backup-extension"),a=document.querySelector("#caption-backup-name"),s=document.querySelector("#caption-backup-select"),i=document.querySelector("#caption-backup-recursive"),n=document.querySelector("#caption-backup-pre-restore"),r=document.querySelector("#caption-backup-pick"),c=document.querySelector("#caption-backup-create"),p=document.querySelector("#caption-backup-refresh"),d=document.querySelector("#caption-backup-restore");return!e||!t||!a||!s||!i||!n||!r||!c||!p||!d?null:{pathInput:e,extensionInput:t,nameInput:a,selectInput:s,recursiveInput:i,preRestoreInput:n,browseButton:r,createButton:c,refreshButton:p,restoreButton:d}}async function at(e){const t=e.pathInput.value.trim();if(!t){m("dataset-analysis-status","Pick a dataset folder first."),f("dataset-analysis-results",'<p class="dataset-analysis-empty">No folder selected yet.</p>');return}e.browseButton.disabled=!0,e.runButton.disabled=!0,m("dataset-analysis-status","Analyzing dataset..."),f("dataset-analysis-results",'<p class="dataset-analysis-empty">Scanning images, captions, and tags...</p>');try{const a=await ca({path:t,caption_extension:e.captionExtensionInput.value.trim()||".txt",top_tags:he(e.topTagsInput.value,40),sample_limit:he(e.sampleLimitInput.value,8)});if(a.status!=="success"||!a.data)throw new Error(a.message||"Dataset analysis returned no data.");m("dataset-analysis-status",`Scanned ${a.data.summary.image_count} images across ${a.data.summary.dataset_folder_count} dataset folder(s).`),Ta(a.data)}catch(a){m("dataset-analysis-status",a instanceof Error?a.message:"Dataset analysis failed."),f("dataset-analysis-results",`<article class="dataset-analysis-block dataset-analysis-warning"><p>${o(a instanceof Error?a.message:"Dataset analysis failed.")}</p></article>`)}finally{e.browseButton.disabled=!1,e.runButton.disabled=!1}}async function it(e){const t=e.pathInput.value.trim();if(!t){m("masked-loss-audit-status","Pick a dataset folder first."),f("masked-loss-audit-results",'<p class="dataset-analysis-empty">No dataset folder selected yet.</p>');return}e.browseButton.disabled=!0,e.runButton.disabled=!0,m("masked-loss-audit-status","Inspecting alpha-channel masks..."),f("masked-loss-audit-results",'<p class="dataset-analysis-empty">Opening images and checking their alpha channels...</p>');try{const a=await ua({path:t,recursive:e.recursiveInput.checked,sample_limit:he(e.sampleLimitInput.value,8)});if(a.status!=="success"||!a.data)throw new Error(a.message||"Masked-loss audit returned no data.");m("masked-loss-audit-status",`Inspected ${a.data.summary.image_count} images. Found ${a.data.summary.usable_mask_image_count} image(s) with usable alpha masks.`),La(a.data)}catch(a){m("masked-loss-audit-status",a instanceof Error?a.message:"Masked-loss audit failed."),f("masked-loss-audit-results",`<article class="dataset-analysis-block dataset-analysis-warning"><p>${o(a instanceof Error?a.message:"Masked-loss audit failed.")}</p></article>`)}finally{e.browseButton.disabled=!1,e.runButton.disabled=!1}}async function st(e){var a,s,i;const t=e.pathInput.value.trim();if(!t){m("batch-tagger-status","Pick an image folder first."),f("batch-tagger-results",'<p class="dataset-analysis-empty">No image folder selected yet.</p>');return}e.browseButton.disabled=!0,e.runButton.disabled=!0,m("batch-tagger-status","Starting batch tagging..."),f("batch-tagger-results",'<p class="dataset-analysis-empty">Submitting interrogator job to the backend...</p>');try{const n=nt(e.thresholdInput.value,.35,0,1),r=nt(e.characterThresholdInput.value,.6,0,1),c=await pa({path:t,interrogator_model:e.modelSelect.value,threshold:n,character_threshold:r,batch_output_action_on_conflict:e.conflictSelect.value,create_backup_before_write:e.autoBackupInput.checked,backup_snapshot_name:e.backupNameInput.value.trim(),additional_tags:e.additionalTagsInput.value.trim(),exclude_tags:e.excludeTagsInput.value.trim(),batch_input_recursive:e.recursiveInput.checked,replace_underscore:e.replaceUnderscoreInput.checked,escape_tag:e.escapeTagInput.checked,add_rating_tag:e.addRatingTagInput.checked,add_model_tag:e.addModelTagInput.checked});if(c.status!=="success")throw new Error(c.message||"Batch tagging failed to start.");m("batch-tagger-status",c.message||"Batch tagging started."),f("batch-tagger-results",`
        <article class="dataset-analysis-block">
          <p class="panel-kicker">launched</p>
          <h3>Batch tagger job submitted</h3>
          <p><code>${o(t)}</code></p>
          <p>Model: <code>${o(e.modelSelect.value)}</code></p>
          <p>
            Threshold: <strong>${o(String(n))}</strong>
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
          ${(i=(s=c.data)==null?void 0:s.warnings)!=null&&i.length?`<p>${o(c.data.warnings.join(" "))}</p>`:""}
          <p>The backend runs this in the background. Watch the console output and inspect generated <code>.txt</code> files in the dataset folder.</p>
        </article>
      `)}catch(n){m("batch-tagger-status",n instanceof Error?n.message:"Batch tagging failed."),f("batch-tagger-results",`<article class="dataset-analysis-block dataset-analysis-warning"><p>${o(n instanceof Error?n.message:"Batch tagging failed.")}</p></article>`)}finally{e.browseButton.disabled=!1,e.runButton.disabled=!1}}async function we(e,t){const a=e.pathInput.value.trim();if(!a){m("caption-cleanup-status","Pick a caption folder first."),f("caption-cleanup-results",'<p class="dataset-analysis-empty">No caption folder selected yet.</p>');return}const s={path:a,caption_extension:e.extensionInput.value.trim()||".txt",recursive:e.recursiveInput.checked,collapse_whitespace:e.collapseWhitespaceInput.checked,replace_underscore:e.replaceUnderscoreInput.checked,dedupe_tags:e.dedupeTagsInput.checked,sort_tags:e.sortTagsInput.checked,remove_tags:e.removeTagsInput.value.trim(),prepend_tags:e.prependTagsInput.value.trim(),append_tags:e.appendTagsInput.value.trim(),search_text:e.searchTextInput.value,replace_text:e.replaceTextInput.value,use_regex:e.useRegexInput.checked,create_backup_before_apply:e.autoBackupInput.checked,backup_snapshot_name:e.backupNameInput.value.trim(),sample_limit:he(e.sampleLimitInput.value,8)};e.browseButton.disabled=!0,e.previewButton.disabled=!0,e.applyButton.disabled=!0,m("caption-cleanup-status",t==="preview"?"Previewing caption cleanup...":"Applying caption cleanup..."),f("caption-cleanup-results",`<p class="dataset-analysis-empty">${t==="preview"?"Scanning caption files and building sample diffs...":"Writing cleaned captions back to disk..."}</p>`);try{const i=t==="preview"?await ha(s):await ma(s);if(i.status!=="success"||!i.data)throw new Error(i.message||`Caption cleanup ${t} failed.`);m("caption-cleanup-status",i.message||(t==="preview"?`Previewed ${i.data.summary.changed_file_count} caption file changes.`:`Applied cleanup to ${i.data.summary.changed_file_count} caption files.`)),Aa(i.data)}catch(i){m("caption-cleanup-status",i instanceof Error?i.message:"Caption cleanup failed."),f("caption-cleanup-results",`<article class="dataset-analysis-block dataset-analysis-warning"><p>${o(i instanceof Error?i.message:"Caption cleanup failed.")}</p></article>`)}finally{e.browseButton.disabled=!1,e.previewButton.disabled=!1,e.applyButton.disabled=!1}}async function ee(e,t,a=!0){var i,n;const s=e.pathInput.value.trim();if(!s){m("caption-backup-status","Pick a caption folder first."),f("caption-backup-results",'<p class="dataset-analysis-empty">No caption folder selected yet.</p>'),e.selectInput.innerHTML='<option value="">Refresh snapshots for this folder</option>';return}e.browseButton.disabled=!0,e.createButton.disabled=!0,e.refreshButton.disabled=!0,e.restoreButton.disabled=!0,m("caption-backup-status","Loading caption snapshots...");try{const c=((i=(await fa({path:s})).data)==null?void 0:i.backups)??[],p=e.selectInput.value||(((n=c[0])==null?void 0:n.archive_name)??""),d=t??p;e.selectInput.innerHTML=c.length?c.map(u=>{const l=u.archive_name===d?" selected":"";return`<option value="${o(u.archive_name)}"${l}>${o(u.snapshot_name)} · ${o(u.archive_name)}</option>`}).join(""):'<option value="">No snapshots for this folder yet</option>',c.length&&d&&(e.selectInput.value=d),m("caption-backup-status",c.length?`Loaded ${c.length} caption snapshots.`:"No caption snapshots found for this folder."),a&&Ea(c,c.length?d:null)}catch(r){m("caption-backup-status",r instanceof Error?r.message:"Failed to load caption snapshots."),f("caption-backup-results",`<article class="dataset-analysis-block dataset-analysis-warning"><p>${o(r instanceof Error?r.message:"Failed to load caption snapshots.")}</p></article>`)}finally{e.browseButton.disabled=!1,e.createButton.disabled=!1,e.refreshButton.disabled=!1,e.restoreButton.disabled=!1}}async function Ni(e){const t=e.pathInput.value.trim();if(!t){m("caption-backup-status","Pick a caption folder first."),f("caption-backup-results",'<p class="dataset-analysis-empty">No caption folder selected yet.</p>');return}e.browseButton.disabled=!0,e.createButton.disabled=!0,e.refreshButton.disabled=!0,e.restoreButton.disabled=!0,m("caption-backup-status","Creating caption snapshot...");try{const a=await ga({path:t,caption_extension:e.extensionInput.value.trim()||".txt",recursive:e.recursiveInput.checked,snapshot_name:e.nameInput.value.trim()});if(a.status!=="success"||!a.data)throw new Error(a.message||"Caption snapshot creation failed.");m("caption-backup-status",a.message||`Created ${a.data.archive_name}`),e.nameInput.value="",await ee(e,a.data.archive_name)}catch(a){m("caption-backup-status",a instanceof Error?a.message:"Caption snapshot creation failed."),f("caption-backup-results",`<article class="dataset-analysis-block dataset-analysis-warning"><p>${o(a instanceof Error?a.message:"Caption snapshot creation failed.")}</p></article>`)}finally{e.browseButton.disabled=!1,e.createButton.disabled=!1,e.refreshButton.disabled=!1,e.restoreButton.disabled=!1}}async function Ci(e){const t=e.pathInput.value.trim(),a=e.selectInput.value;if(!t){m("caption-backup-status","Pick a caption folder first."),f("caption-backup-results",'<p class="dataset-analysis-empty">No caption folder selected yet.</p>');return}if(!a){m("caption-backup-status","Select a snapshot to restore.");return}if(window.confirm(`Restore caption snapshot ${a} into this folder?

This overwrites matching caption files from the snapshot.`)){e.browseButton.disabled=!0,e.createButton.disabled=!0,e.refreshButton.disabled=!0,e.restoreButton.disabled=!0,m("caption-backup-status","Restoring caption snapshot..."),f("caption-backup-results",'<p class="dataset-analysis-empty">Writing snapshot files back to the folder...</p>');try{const i=await ba({path:t,archive_name:a,make_restore_backup:e.preRestoreInput.checked});if(i.status!=="success"||!i.data)throw new Error(i.message||"Caption snapshot restore failed.");m("caption-backup-status",i.message||`Restored ${i.data.restored_file_count} caption files.`),Ia(i.data),await ee(e,a,!1)}catch(i){m("caption-backup-status",i instanceof Error?i.message:"Caption snapshot restore failed."),f("caption-backup-results",`<article class="dataset-analysis-block dataset-analysis-warning"><p>${o(i instanceof Error?i.message:"Caption snapshot restore failed.")}</p></article>`)}finally{e.browseButton.disabled=!1,e.createButton.disabled=!1,e.refreshButton.disabled=!1,e.restoreButton.disabled=!1}}}function he(e,t){const a=Number.parseInt(e,10);return Number.isNaN(a)||a<1?t:a}function nt(e,t,a,s){const i=Number.parseFloat(e);return Number.isNaN(i)?t:Math.min(Math.max(i,a),s)}async function Ee(){var e;try{const t=await Oe();xa(((e=t.data)==null?void 0:e.tasks)??[]),document.querySelectorAll("[data-task-terminate]").forEach(a=>{a.addEventListener("click",async()=>{const s=a.dataset.taskTerminate;if(s){a.setAttribute("disabled","true");try{await $t(s)}finally{await Ee()}}})})}catch(t){f("task-table-container",`<p>${t instanceof Error?o(t.message):"Task request failed."}</p>`)}}async function Di(){const e=document.querySelector("#refresh-tasks");e==null||e.addEventListener("click",()=>{Ee()}),await Ee()}class ${constructor(t){T(this,"kind");T(this,"descriptionText");T(this,"defaultValue");T(this,"roleName");T(this,"roleConfig");T(this,"minValue");T(this,"maxValue");T(this,"stepValue");T(this,"disabledFlag",!1);T(this,"requiredFlag",!1);T(this,"literalValue");T(this,"options",[]);T(this,"fields",{});T(this,"itemType");this.kind=t}description(t){return this.descriptionText=t,this}default(t){return this.defaultValue=t,this}role(t,a){return this.roleName=typeof t=="string"?t:"custom",this.roleConfig=a??t,this}min(t){return this.minValue=t,this}max(t){return this.maxValue=t,this}step(t){return this.stepValue=t,this}required(){return this.requiredFlag=!0,this}disabled(){return this.disabledFlag=!0,this}}function U(e){if(e instanceof $)return e;if(e===String)return new $("string");if(e===Number)return new $("number");if(e===Boolean)return new $("boolean");if(typeof e=="string"||typeof e=="number"||typeof e=="boolean"){const t=new $("const");return t.literalValue=e,t.defaultValue=e,t}if(Array.isArray(e)){const t=new $("union");return t.options=e.map(a=>U(a)),t}if(e&&typeof e=="object"){const t=new $("object");return t.fields=Object.fromEntries(Object.entries(e).map(([a,s])=>[a,U(s)])),t}return new $("string")}function Bi(){return{string(){return new $("string")},number(){return new $("number")},boolean(){return new $("boolean")},const(e){const t=new $("const");return t.literalValue=e,t.defaultValue=e,t},union(e){const t=new $("union");return t.options=e.map(a=>U(a)),t},intersect(e){const t=new $("intersect");return t.options=e.map(a=>U(a)),t},object(e){const t=new $("object");return t.fields=Object.fromEntries(Object.entries(e).map(([a,s])=>[a,U(s)])),t},array(e){const t=new $("array");return t.itemType=U(e),t}}}function qi(e,t,a){const s={...e,...t};for(const i of a??[])delete s[i];return s}function rt(e,t){const a=Bi();return new Function("Schema","UpdateSchema","SHARED_SCHEMAS","String","Number","Boolean","source",'"use strict"; return eval(source);')(a,qi,t??{},String,Number,Boolean,e)}function jt(e){const t=e.find(i=>i.name==="shared"),s=(t?rt(t.schema,null):{})||{};return e.map(i=>({name:i.name,hash:i.hash,source:i.schema,runtime:i.name==="shared"?s:rt(i.schema,s)}))}function ot(e,t=""){return Object.entries(e).map(([a,s])=>({name:a,path:t?`${t}.${a}`:a,schema:s})).filter(a=>a.schema.kind!=="const"||!a.schema.requiredFlag)}function lt(e){return Object.entries(e).filter(([,t])=>t.kind==="const"&&t.requiredFlag).map(([t,a])=>`${t} = ${String(a.literalValue)}`)}function ct(e){return Object.fromEntries(Object.entries(e).filter(([,t])=>t.kind==="const"&&t.requiredFlag).map(([t,a])=>[t,a.literalValue]))}function Ie(e,t,a){if(e.kind==="intersect"){e.options.forEach((s,i)=>Ie(s,`${t}-i${i}`,a));return}if(e.kind==="object"){const s=ot(e.fields);s.length>0&&a.push({id:t,title:e.descriptionText||"Unnamed section",fields:s,conditions:lt(e.fields),constants:ct(e.fields)});return}e.kind==="union"&&e.options.forEach((s,i)=>{if(s.kind==="object"){const n=ot(s.fields);n.length>0&&a.push({id:`${t}-u${i}`,title:s.descriptionText||e.descriptionText||`Conditional branch ${i+1}`,fields:n,conditional:!0,conditions:lt(s.fields),constants:ct(s.fields)})}else Ie(s,`${t}-u${i}`,a)})}function zi(e){const t=[];return Ie(e,"section",t),t}function Oi(e){const t={};for(const a of e){a.conditional||Object.assign(t,a.constants);for(const s of a.fields)s.schema.defaultValue!==void 0?t[s.path]=s.schema.defaultValue:s.schema.kind==="boolean"?t[s.path]=!1:t[s.path]=""}return t}function Vt(e,t){return e.conditional?Object.entries(e.constants).every(([a,s])=>t[a]===s):!0}function Fi(e,t){const a={...t};for(const s of e){if(Vt(s,t)){Object.assign(a,s.constants);continue}for(const i of s.fields)delete a[i.path]}return a}function Ue(e){return`field-${e.replaceAll(/[^a-zA-Z0-9_-]/g,"-")}`}function Mi(e){if(e.kind!=="union")return null;const t=e.options.filter(a=>a.kind==="const").map(a=>a.literalValue).filter(a=>typeof a=="string"||typeof a=="number"||typeof a=="boolean");return t.length!==e.options.length?null:t}function ji(e){return e.path==="optimizer_type"?"optimizer":e.path==="lr_scheduler"?"scheduler":null}function Vi(e,t){const a=Mi(e.schema);if(!a)return null;const s=ji(e);return s?di(s,a,t):a.map(i=>({value:String(i),label:String(i),description:"",hiddenBySettings:!1}))}function Hi(e){return e!=null&&e.selectionNote?`<p class="field-helper-note">${o(e.selectionNote)}</p>`:""}function Gi(e,t){if(!e.roleConfig||typeof e.roleConfig!="object"||Array.isArray(e.roleConfig))return;const a=e.roleConfig[t];return typeof a=="string"?a:void 0}function Pe(e){return Array.isArray(e)?e.map(t=>String(t??"")):typeof e=="string"&&e.length>0?e.split(/\r?\n/):[]}function Wi(e,t,a){const s=Pe(t),i=s.length>0?s:[""],n=Ue(e.path);return`
    <div class="table-editor" data-table-path="${o(e.path)}">
      <div class="table-editor-rows">
        ${i.map((r,c)=>`
              <div class="table-editor-row">
                <input
                  id="${c===0?n:`${n}-${c}`}"
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
  `}function Ui(e,t){const a=e.schema,s=Ue(e.path),i=o(e.path),n=Vi(e,t),r=a.disabledFlag?"disabled":"",c=a.roleName||"";if(a.kind==="boolean")return`
      <label class="checkbox-row" for="${s}">
        <input id="${s}" data-field-path="${i}" data-field-kind="boolean" type="checkbox" ${t?"checked":""} ${r} />
        <span>${a.defaultValue===!0?"default on":"toggle"}</span>
      </label>
    `;if(a.kind==="array"){if(c==="table")return Wi(e,t,r);const p=Array.isArray(t)?t.join(`
`):"";return`<textarea id="${s}" class="field-input field-textarea" data-field-path="${i}" data-field-kind="array" ${r}>${o(p)}</textarea>`}if(n){const p=n.find(u=>u.value===String(t)),d=n.map(u=>`<option value="${o(u.value)}" ${u.value===String(t)?"selected":""}>${o(u.label)}</option>`).join("");return`
      <div class="enum-field-control">
        <select id="${s}" class="field-input" data-field-path="${i}" data-field-kind="enum" ${r}>${d}</select>
        ${Hi(p)}
      </div>
    `}if(a.kind==="number"){const p=a.minValue!==void 0?`min="${a.minValue}"`:"",d=a.maxValue!==void 0?`max="${a.maxValue}"`:"",u=a.stepValue!==void 0?`step="${a.stepValue}"`:'step="any"';if(c==="slider"&&a.minValue!==void 0&&a.maxValue!==void 0){const l=t===""||t===void 0||t===null?a.defaultValue??a.minValue:t;return`
        <div class="slider-editor">
          <input
            class="field-slider"
            data-field-path="${i}"
            data-field-kind="number"
            data-slider-role="range"
            type="range"
            value="${o(l)}"
            ${p}
            ${d}
            ${u}
            ${r}
          />
          <div class="slider-editor-footer">
            <input
              id="${s}"
              class="field-input slider-number-input"
              data-field-path="${i}"
              data-field-kind="number"
              data-slider-role="number"
              type="number"
              value="${o(l)}"
              ${p}
              ${d}
              ${u}
              ${r}
            />
            <span class="slider-value" data-slider-value-for="${i}">${o(l)}</span>
          </div>
        </div>
      `}return`<input id="${s}" class="field-input" data-field-path="${i}" data-field-kind="number" type="number" value="${o(t)}" ${p} ${d} ${u} ${r} />`}if(c==="textarea")return`<textarea id="${s}" class="field-input field-textarea" data-field-path="${i}" data-field-kind="string" ${r}>${o(t)}</textarea>`;if(c==="filepicker"){const p=Gi(a,"type")??(e.path.endsWith("_dir")||e.path==="resume"?"folder":"model-file");return`
      <div class="picker-control">
        <div class="picker-row">
          <input
            id="${s}"
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
    `}return a.kind==="const"?`<div class="field-readonly"><code>${o(a.literalValue??t)}</code></div>`:`<input id="${s}" class="field-input" data-field-path="${i}" data-field-kind="string" type="text" value="${o(t)}" ${r} />`}function Xi(e,t){const a=e.schema,s=[`<span class="mini-badge">${o(a.kind)}</span>`,a.roleName?`<span class="mini-badge mini-badge-muted">${o(a.roleName)}</span>`:"",a.requiredFlag?'<span class="mini-badge mini-badge-accent">required</span>':"",a.disabledFlag?'<span class="mini-badge mini-badge-muted">disabled</span>':""].filter(Boolean).join(""),i=[a.minValue!==void 0?`min ${a.minValue}`:"",a.maxValue!==void 0?`max ${a.maxValue}`:"",a.stepValue!==void 0?`step ${a.stepValue}`:""].filter(Boolean).join(" · ");return`
    <article class="field-card">
      <div class="field-card-head">
        <div>
          <label class="field-label" for="${Ue(e.path)}">${o(e.name)}</label>
          <p class="field-path">${o(e.path)}</p>
        </div>
        <div class="mini-badge-row">${s}</div>
      </div>
      <p class="field-description">${o(a.descriptionText||"No description")}</p>
      ${Ui(e,t)}
      <div class="field-meta">
        <span><strong>Default:</strong> ${o(a.defaultValue??"(none)")}</span>
        ${i?`<span><strong>Constraints:</strong> ${o(i)}</span>`:""}
      </div>
    </article>
  `}function Ht(e){return e.sections.filter(t=>Vt(t,e.values))}function Gt(e){return Fi(e.sections,e.values)}function Ki(e,t){const a=Ht(e);if(a.length===0){f(t,"<p>No renderable sections extracted from this schema.</p>");return}const s=a.map(i=>{const n=i.fields.map(c=>Xi(c,e.values[c.path])).join(""),r=i.conditions.length?`<div class="condition-list">${i.conditions.map(c=>`<span class="coverage-pill coverage-pill-muted">${o(c)}</span>`).join("")}</div>`:"";return`
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
            ${n}
          </div>
        </article>
      `}).join("");f(t,s)}function Re(e,t){const a=Object.fromEntries(Object.entries(Gt(e)).sort(([s],[i])=>s.localeCompare(i)));K(t,JSON.stringify(a,null,2))}function _e(e){return e.filter(t=>t.name!=="shared"&&t.runtime instanceof $)}function ut(e,t){const a=e.schema;if(a.kind==="boolean")return!!t;if(a.kind==="number"){const s=String(t).trim();if(s==="")return"";const i=Number(s);return Number.isNaN(i)?"":i}return a.kind==="array"?String(t).split(/\r?\n/).map(s=>s.trim()).filter(Boolean):t}function dt(e,t){return e.sections.flatMap(a=>a.fields).find(a=>a.path===t)}function Ji(e,t){return[...e.querySelectorAll('[data-field-kind="table-row"]')].filter(a=>a.dataset.fieldPath===t).map(a=>a.value.trim()).filter(Boolean)}function re(e,t,a,s){const i=String(a??"");e.querySelectorAll("[data-field-path]").forEach(n=>{if(!(n===s||n.dataset.fieldPath!==t||n.dataset.fieldKind==="table-row")){if(n instanceof HTMLInputElement&&n.type==="checkbox"){n.checked=!!a;return}n.value=i}}),e.querySelectorAll("[data-slider-value-for]").forEach(n=>{n.dataset.sliderValueFor===t&&(n.textContent=i)})}function $e(e,t,a,s="idle"){e.querySelectorAll("[data-picker-status-for]").forEach(i=>{i.dataset.pickerStatusFor===t&&(i.textContent=a,i.classList.remove("is-success","is-error"),s==="success"?i.classList.add("is-success"):s==="error"&&i.classList.add("is-error"))})}function Yi(e,t,a,s){const i=document.querySelector(`#${t.sectionsId}`);if(!i)return;const n=new Set(e.sections.flatMap(r=>r.conditional?Object.keys(r.constants):[]));i.querySelectorAll("[data-field-path]").forEach(r=>{const c=r.dataset.fieldKind,p=r instanceof HTMLInputElement&&r.type==="checkbox"||r instanceof HTMLSelectElement?"change":"input";r.addEventListener(p,()=>{const d=r.dataset.fieldPath;if(!d)return;const u=dt(e,d);if(u){if(c==="table-row")e.values[d]=Ji(i,d);else{const l=r instanceof HTMLInputElement&&r.type==="checkbox"?r.checked:r.value;e.values[d]=ut(u,l),pi(e.values,d),re(i,d,e.values[d],r),d==="lr_scheduler"?re(i,"lr_scheduler_type",e.values.lr_scheduler_type):d==="lr_scheduler_type"&&re(i,"lr_scheduler",e.values.lr_scheduler)}if(n.has(d)){s({...e,values:{...e.values}});return}Re(e,t.previewId),a(e)}})}),i.querySelectorAll("[data-table-add]").forEach(r=>{r.addEventListener("click",()=>{const c=r.dataset.tableAdd;c&&(e.values[c]=[...Pe(e.values[c]),""],s({...e,values:{...e.values}}))})}),i.querySelectorAll("[data-table-remove]").forEach(r=>{r.addEventListener("click",()=>{const c=r.dataset.tableRemove,p=Number(r.dataset.tableIndex??"-1");if(!c||p<0)return;const d=Pe(e.values[c]).filter((u,l)=>l!==p);e.values[c]=d,s({...e,values:{...e.values}})})}),i.querySelectorAll("[data-picker-path]").forEach(r=>{r.addEventListener("click",async()=>{const c=r.dataset.pickerPath,p=r.dataset.pickerType||"model-file";if(!c)return;const d=dt(e,c);if(d){r.setAttribute("disabled","true"),$e(i,c,"Waiting for native picker...","idle");try{const u=await G(p);if(e.values[c]=ut(d,u),re(i,c,e.values[c]),$e(i,c,u,"success"),n.has(c)){s({...e,values:{...e.values}});return}Re(e,t.previewId),a(e)}catch(u){$e(i,c,u instanceof Error?u.message:"The picker failed to return a value.","error")}finally{r.removeAttribute("disabled")}}})})}function me(e,t){const a=_e(e).find(i=>i.name===t);if(!a||!(a.runtime instanceof $))return null;const s=zi(a.runtime);return{catalog:e,selectedName:t,sections:s,values:Oi(s)}}function te(e,t,a,s){if(a(e),!e){m(t.summaryId,"Failed to build schema bridge state."),f(t.sectionsId,"<p>Schema bridge failed to initialize.</p>"),K(t.previewId,"{}");return}const n=_e(e.catalog).map(d=>`<option value="${o(d.name)}" ${d.name===e.selectedName?"selected":""}>${o(d.name)}</option>`).join(""),r=Ht(e);f(t.selectId,n),m(t.summaryId,`${e.selectedName} · ${r.length}/${e.sections.length} visible sections · ${r.reduce((d,u)=>d+u.fields.length,0)} visible fields`),Ki(e,t.sectionsId),Re(e,t.previewId);const c=document.querySelector(`#${t.selectId}`);c&&(c.onchange=()=>{const d=me(e.catalog,c.value);te(d,t,a,s)});const p=document.querySelector(`#${t.resetId}`);p&&(p.onclick=()=>{te(me(e.catalog,e.selectedName),t,a,s)}),Yi(e,t,s,d=>te(d,t,a,s)),s(e)}const Zi={selectId:"schema-select",summaryId:"schema-summary",sectionsId:"schema-sections",previewId:"schema-preview",resetId:"schema-reset"};function Qi(e){return{selectId:`${e}-schema-select`,summaryId:`${e}-summary`,sectionsId:`${e}-sections`,previewId:`${e}-preview`,resetId:`${e}-reset`}}async function es(e){var t,a,s;try{const n=((t=(await ze()).data)==null?void 0:t.schemas)??[],r=jt(n),c=_e(r),p=((a=c.find(d=>d.name==="sdxl-lora"))==null?void 0:a.name)??((s=c[0])==null?void 0:s.name);if(!p){m("schema-summary","No selectable schemas were returned."),f("schema-sections","<p>No schema runtime available.</p>");return}te(me(r,p),Zi,e,()=>{})}catch(i){m("schema-summary","Schema bridge request failed"),f("schema-sections",`<p>${i instanceof Error?o(i.message):"Unknown error"}</p>`),K("schema-preview","{}")}}function ts(e,t){return`
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
  `}function pt(e,t,a="module"){return`
    <article class="panel info-card">
      <p class="panel-kicker">${a}</p>
      <h3>${e}</h3>
      <div>${t}</div>
    </article>
  `}function as(){return`
    ${q("about","A clean source-side replacement for the current about page","This page is one of the safest migration targets because it is mostly branding, release context and ownership notes.")}
    <section class="two-column">
      ${pt("Project identity",`
          <p><strong>Product name:</strong> SD-reScripts</p>
          <p><strong>Version target:</strong> v1.0.2</p>
          <p><strong>Lineage:</strong> Fork from 秋葉 aaaki/lora-scripts</p>
          <p><strong>Maintainer:</strong> Modify By Lulynx</p>
        `,"brand")}
      ${pt("Why migrate this page first",`
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
  `}function is(){return x({prefix:"anima-finetune",heroKicker:"anima finetune",heroTitle:"Anima finetune source training page",heroLede:"This route exposes the Anima finetune schema so the source-side bridge covers both LoRA and full finetune variants for that trainer family.",runnerTitle:"Anima finetune source-side runner",startButtonLabel:"Start Anima finetune",legacyPath:"/lora/anima-finetune.html",legacyLabel:"Open current shipped Anima finetune page",renderedTitle:"Anima finetune form bridge"})}function ss(){return x({prefix:"anima",heroKicker:"anima lora",heroTitle:"Anima LoRA source training page",heroLede:"This route surfaces the Anima LoRA schema on the shared training bridge instead of forcing that capability to stay hidden behind the shipped legacy page.",runnerTitle:"Anima LoRA source-side runner",startButtonLabel:"Start Anima LoRA training",legacyPath:"/lora/anima.html",legacyLabel:"Open current shipped Anima LoRA page",renderedTitle:"Anima LoRA form bridge"})}function ns(){return x({prefix:"dreambooth",heroKicker:"dreambooth train",heroTitle:"Dreambooth source training page",heroLede:"This route brings the Dreambooth and SDXL full-finetune schema into the same source-side training bridge so we can migrate one of the last big non-LoRA training paths cleanly.",runnerTitle:"Dreambooth source-side runner",startButtonLabel:"Start Dreambooth training",legacyPath:"/dreambooth/",legacyLabel:"Open current shipped Dreambooth page",renderedTitle:"Dreambooth form bridge"})}function rs(){return x({prefix:"flux-controlnet",heroKicker:"flux controlnet",heroTitle:"Flux ControlNet source training page",heroLede:"This route reuses the same source-side training bridge for Flux ControlNet so the DiT-family conditioning workflow stays aligned with the current backend schema and payload rules.",runnerTitle:"Flux ControlNet source-side runner",startButtonLabel:"Start Flux ControlNet training",legacyPath:"/lora/flux-controlnet.html",legacyLabel:"Open current shipped Flux ControlNet page",renderedTitle:"Flux ControlNet form bridge"})}function os(){return x({prefix:"flux-finetune",heroKicker:"flux finetune",heroTitle:"Flux finetune source training page",heroLede:"This route exposes the dedicated Flux full-finetune schema on the same source-side training bridge so recipe shaping, preflight and launch behavior stay consistent.",runnerTitle:"Flux finetune source-side runner",startButtonLabel:"Start Flux finetune",legacyPath:"/lora/flux-finetune.html",legacyLabel:"Open current shipped Flux finetune page",renderedTitle:"Flux finetune form bridge"})}function ls(){return x({prefix:"flux",heroKicker:"flux train",heroTitle:"Flux LoRA source training page",heroLede:"This route reuses the source-side training bridge for Flux so we can keep payload shaping, compatibility checks and launch behavior aligned with the current backend.",runnerTitle:"Flux source-side runner",startButtonLabel:"Start Flux training",legacyPath:"/lora/flux.html",legacyLabel:"Open current shipped Flux page",renderedTitle:"Flux form bridge"})}function cs(){return x({prefix:"hunyuan-image",heroKicker:"hunyuan image",heroTitle:"Hunyuan Image LoRA source training page",heroLede:"This route exposes the Hunyuan Image LoRA schema so newer image trainer families live on the same source-side bridge instead of staying legacy-only.",runnerTitle:"Hunyuan Image source-side runner",startButtonLabel:"Start Hunyuan Image training",legacyPath:"/lora/hunyuan.html",legacyLabel:"Open current shipped Hunyuan Image page",renderedTitle:"Hunyuan Image form bridge"})}function us(){return x({prefix:"lumina-finetune",heroKicker:"lumina finetune",heroTitle:"Lumina finetune source training page",heroLede:"This route exposes Lumina finetune on the shared source-side bridge so finetune-specific payloads can use the same autosave, preflight and launch safety checks.",runnerTitle:"Lumina finetune source-side runner",startButtonLabel:"Start Lumina finetune",legacyPath:"/lora/lumina-finetune.html",legacyLabel:"Open current shipped Lumina finetune page",renderedTitle:"Lumina finetune form bridge"})}function ds(){return x({prefix:"lumina",heroKicker:"lumina lora",heroTitle:"Lumina LoRA source training page",heroLede:"This route exposes the Lumina LoRA schema on the shared bridge so newer trainer families are available without falling back to older UI entry points.",runnerTitle:"Lumina LoRA source-side runner",startButtonLabel:"Start Lumina LoRA training",legacyPath:"/lora/lumina.html",legacyLabel:"Open current shipped Lumina LoRA page",renderedTitle:"Lumina LoRA form bridge"})}function ps(){return`
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
  `}function hs(){return x({prefix:"sd3-finetune",heroKicker:"sd3 finetune",heroTitle:"SD3 finetune source training page",heroLede:"This route brings the dedicated SD3 finetune schema into the shared source-side bridge so parameter normalization and runtime checks stay aligned with the backend.",runnerTitle:"SD3 finetune source-side runner",startButtonLabel:"Start SD3 finetune",legacyPath:"/lora/sd3-finetune.html",legacyLabel:"Open current shipped SD3 finetune page",renderedTitle:"SD3 finetune form bridge"})}function ms(){return x({prefix:"sd3",heroKicker:"sd3 train",heroTitle:"SD3 LoRA source training page",heroLede:"This route extends the same source-side training bridge to SD3 so we can keep the fast-moving schema-driven trainer paths on one shared foundation.",runnerTitle:"SD3 source-side runner",startButtonLabel:"Start SD3 training",legacyPath:"/lora/sd3.html",legacyLabel:"Open current shipped SD3 page",renderedTitle:"SD3 form bridge"})}function gs(){return x({prefix:"sd-controlnet",heroKicker:"sd controlnet",heroTitle:"SD ControlNet source training page",heroLede:"This route extends the shared source-side training bridge to the SD1.x / SD2.x ControlNet workflow so conditioning-dataset training can migrate without another bespoke form stack.",runnerTitle:"SD ControlNet source-side runner",startButtonLabel:"Start SD ControlNet training",legacyPath:"/lora/controlnet.html",legacyLabel:"Open current shipped SD ControlNet page",renderedTitle:"SD ControlNet form bridge"})}function fs(){return x({prefix:"sd-ti",heroKicker:"sd textual inversion",heroTitle:"SD textual inversion source training page",heroLede:"This route exposes the standard SD textual inversion schema through the shared training bridge, so embeddings can use the same source-side autosave, preflight and launch workflow.",runnerTitle:"SD textual inversion source-side runner",startButtonLabel:"Start SD textual inversion",legacyPath:"/lora/ti.html",legacyLabel:"Open current shipped SD textual inversion page",renderedTitle:"SD textual inversion form bridge"})}function bs(){return x({prefix:"sdxl-controlnet",heroKicker:"sdxl controlnet",heroTitle:"SDXL ControlNet source training page",heroLede:"This route keeps the SDXL ControlNet training path on the same source-side schema bridge, normalized payload builder and launch pipeline as the main LoRA routes.",runnerTitle:"SDXL ControlNet source-side runner",startButtonLabel:"Start SDXL ControlNet training",legacyPath:"/lora/sdxl-controlnet.html",legacyLabel:"Open current shipped SDXL ControlNet page",renderedTitle:"SDXL ControlNet form bridge",routeNotice:{kicker:"experimental",title:"SDXL clip_skip remains experimental here as well",detail:"ControlNet still shares the SDXL text-encoding path. If you enable clip_skip on this route, keep your inference stack aligned with the same SDXL clip-skip behavior."}})}function ys(){return x({prefix:"sdxl-lllite",heroKicker:"sdxl lllite",heroTitle:"SDXL LLLite source training page",heroLede:"This route keeps the SDXL ControlNet-LLLite path on the shared source-side training bridge so even the more specialized conditioning flow no longer needs its own one-off migration path.",runnerTitle:"SDXL LLLite source-side runner",startButtonLabel:"Start SDXL LLLite training",legacyPath:"/lora/sdxl-lllite.html",legacyLabel:"Open current shipped SDXL LLLite page",renderedTitle:"SDXL LLLite form bridge",routeNotice:{kicker:"experimental",title:"SDXL clip_skip is experimental on LLLite too",detail:"The SDXL-side text encoding path is shared here, so clip_skip support is available but still experimental. Keep training and inference behavior matched if you use it."}})}function vs(){return x({prefix:"sdxl-ti",heroKicker:"sdxl textual inversion",heroTitle:"SDXL textual inversion source training page",heroLede:"This route exposes SDXL textual inversion through the same source-side training bridge, so embeddings, prompt helpers and launch safety checks stay unified.",runnerTitle:"SDXL textual inversion source-side runner",startButtonLabel:"Start SDXL textual inversion",legacyPath:"/lora/sdxl-ti.html",legacyLabel:"Open current shipped SDXL textual inversion page",renderedTitle:"SDXL textual inversion form bridge",routeNotice:{kicker:"experimental",title:"SDXL clip_skip support is experimental",detail:"This route can now carry clip_skip into the SDXL text encoding path, but it is still an experimental compatibility feature rather than a long-settled default."}})}function _s(){return x({prefix:"sdxl",heroKicker:"sdxl train",heroTitle:"First source-side SDXL training page",heroLede:"This is the first page that moves beyond passive inspection: it renders the SDXL schema, tracks a real config model and can submit to the current training backend.",runnerTitle:"SDXL source-side runner",startButtonLabel:"Start SDXL training",legacyPath:"/lora/sdxl.html",legacyLabel:"Open current shipped SDXL page",renderedTitle:"SDXL form bridge",routeNotice:{kicker:"experimental",title:"SDXL clip_skip is now opt-in experimental support",detail:"This build can pass clip_skip through the SDXL training path, but it should be treated as experimental. If you rely on it, use matching SDXL clip-skip behavior at inference time too."}})}function ks(){return`
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
  `}function ws(){return`
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
  `}function $s(){return`
    ${q("tasks","Task monitor migration page","This route is already talking to the real backend task manager, so it is a strong candidate for early source migration.")}
    <section class="panel task-panel">
      <div class="task-toolbar">
        <button id="refresh-tasks" class="action-button" type="button">Refresh tasks</button>
        <a class="text-link task-legacy-link" href="${B("/task.html")}" target="_blank" rel="noreferrer">Open current shipped task page</a>
      </div>
      <div id="task-table-container" class="task-table-container loading">Loading tasks...</div>
    </section>
  `}function xs(){return`
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
  `}function Ss(){return`
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
  `}const Ts=[{method:"GET",path:"/api/schemas/all",purpose:"Fetch all schema definitions used to render training forms.",migrationPriority:"high"},{method:"GET",path:"/api/schemas/hashes",purpose:"Hot-reload check for schema changes.",migrationPriority:"medium"},{method:"GET",path:"/api/presets",purpose:"Fetch preset configs for pages and tools.",migrationPriority:"high"},{method:"GET",path:"/api/config/saved_params",purpose:"Load stored UI parameter choices.",migrationPriority:"medium"},{method:"GET",path:"/api/config/summary",purpose:"Read app config summary for the rebuilt settings page.",migrationPriority:"medium"},{method:"GET",path:"/api/graphic_cards",purpose:"List GPUs plus xformers support state.",migrationPriority:"high"},{method:"POST",path:"/api/run",purpose:"Start schema-driven training jobs.",migrationPriority:"high"},{method:"POST",path:"/api/train/preflight",purpose:"Run backend-aware training preflight checks before launch.",migrationPriority:"high"},{method:"POST",path:"/api/train/sample_prompt",purpose:"Resolve and preview the effective training sample prompt text without launching a run.",migrationPriority:"high"},{method:"POST",path:"/api/dataset/masked_loss_audit",purpose:"Inspect alpha-channel mask readiness for masked-loss training workflows.",migrationPriority:"high"},{method:"POST",path:"/api/run_script",purpose:"Run utility scripts from the tools page.",migrationPriority:"high"},{method:"POST",path:"/api/interrogate",purpose:"Run the built-in tagger/interrogator flow.",migrationPriority:"high"},{method:"GET",path:"/api/interrogators",purpose:"List available batch tagger/interrogator models for the rebuilt tools workspace.",migrationPriority:"high"},{method:"POST",path:"/api/captions/cleanup/preview",purpose:"Preview bulk caption cleanup rules before touching files.",migrationPriority:"high"},{method:"POST",path:"/api/captions/cleanup/apply",purpose:"Apply bulk caption cleanup rules to caption files.",migrationPriority:"high"},{method:"POST",path:"/api/captions/backups/create",purpose:"Create a snapshot archive of caption files for later restore.",migrationPriority:"high"},{method:"POST",path:"/api/captions/backups/list",purpose:"List caption snapshots associated with a folder.",migrationPriority:"high"},{method:"POST",path:"/api/captions/backups/restore",purpose:"Restore caption files from a saved snapshot archive.",migrationPriority:"high"},{method:"GET",path:"/api/pick_file",purpose:"Open native file/folder pickers where supported.",migrationPriority:"medium"},{method:"GET",path:"/api/get_files",purpose:"List model, output or train directories for file pickers.",migrationPriority:"high"},{method:"GET",path:"/api/tasks",purpose:"Fetch active and historical task state.",migrationPriority:"high"},{method:"GET",path:"/api/tasks/terminate/{task_id}",purpose:"Terminate a running task.",migrationPriority:"high"},{method:"GET",path:"/api/tageditor_status",purpose:"Poll tag-editor startup/proxy status.",migrationPriority:"medium"},{method:"GET",path:"/api/scripts",purpose:"List backend-approved utility scripts and positional args for the rebuilt tools page.",migrationPriority:"high"}];function Wt(){const e=Tt.map(a=>`
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
      `).join(""),t=Ts.map(a=>`
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
  `}function Ls(){return x({prefix:"xti",heroKicker:"sd xti",heroTitle:"SD XTI source training page",heroLede:"This route exposes the SD XTI schema on the shared source-side bridge so more specialized embedding workflows are no longer hidden behind the legacy page only.",runnerTitle:"SD XTI source-side runner",startButtonLabel:"Start SD XTI training",legacyPath:"/lora/xti.html",legacyLabel:"Open current shipped SD XTI page",renderedTitle:"SD XTI form bridge"})}function As(e,t){if(t.length===0){f(e,"<p>No GPUs reported. Training will use the backend default environment.</p>");return}const a=t.map((s,i)=>{const n=s.index??s.id??i,r=String(n);return`
        <label class="gpu-chip">
          <input type="checkbox" data-gpu-id="${o(r)}" />
          <span>GPU ${o(r)}: ${o(s.name)}</span>
        </label>
      `}).join("");f(e,`<div class="gpu-chip-grid">${a}</div>`)}function Xe(e){return[...document.querySelectorAll(`#${e} input[data-gpu-id]:checked`)].map(t=>t.dataset.gpuId).filter(t=>!!t)}function Ke(e,t=[]){const a=new Set(t.map(s=>String(s)));document.querySelectorAll(`#${e}-gpu-selector input[data-gpu-id]`).forEach(s=>{const i=s.dataset.gpuId??"";s.checked=a.has(i)})}function Es(e){switch(e){case"prompt_file":return"Prompt file";case"generated":return"Generated from current fields";case"random_dataset_prompt_preview":return"Random dataset-derived prompt";case"legacy_sample_prompts_file":return"Legacy sample_prompts file";case"legacy_sample_prompts_inline":return"Legacy sample_prompts text";default:return e}}function I(e,t,a,s="idle"){f(`${e}-submit-status`,`
      <div class="submit-status-box submit-status-${s}">
        <strong>${o(t)}</strong>
        <p>${o(a)}</p>
      </div>
    `)}function ge(e,t,a){if(a){f(`${e}-validation-status`,`
        <div class="submit-status-box submit-status-error">
          <strong>Payload preparation failed</strong>
          <p>${o(a)}</p>
        </div>
      `);return}const s=[t.errors.length>0?`
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
        `:""].filter(Boolean).join("");if(!s){f(`${e}-validation-status`,`
        <div class="submit-status-box submit-status-success">
          <strong>Compatibility checks passed</strong>
          <p>No obvious parameter conflicts were detected in the current payload.</p>
        </div>
      `);return}f(`${e}-validation-status`,`
      <div class="submit-status-box ${t.errors.length>0?"submit-status-error":"submit-status-warning"}">
        <strong>${t.errors.length>0?"Action needed before launch":"Review before launch"}</strong>
        ${s}
      </div>
    `)}function _(e,t,a="idle"){const s=document.querySelector(`#${e}-utility-note`);s&&(s.textContent=t,s.classList.remove("utility-note-success","utility-note-warning","utility-note-error"),a==="success"?s.classList.add("utility-note-success"):a==="warning"?s.classList.add("utility-note-warning"):a==="error"&&s.classList.add("utility-note-error"))}function Je(e,t){if(!(t!=null&&t.value)){f(`${e}-autosave-status`,`
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
    `)}function ht(e,t,a){if(a){f(`${e}-preflight-report`,`
        <div class="submit-status-box submit-status-error">
          <strong>Preflight request failed</strong>
          <p>${o(a)}</p>
        </div>
      `);return}if(!t){f(`${e}-preflight-report`,`
        <div class="submit-status-box">
          <strong>Training preflight has not run yet</strong>
          <p>Run preflight to verify dataset, model, resume path, prompt preview, and runtime fallback expectations before launch.</p>
        </div>
      `);return}const s=[t.errors.length?`
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
            <p class="training-preflight-meta">${o(Es(t.sample_prompt.source))}${t.sample_prompt.detail?` · ${o(t.sample_prompt.detail)}`:""}</p>
            <pre class="preset-preview">${o(t.sample_prompt.preview)}</pre>
          </div>
        `:""].filter(Boolean).join("");f(`${e}-preflight-report`,`
      <div class="submit-status-box ${t.can_start?"submit-status-success":"submit-status-warning"}">
        <strong>${t.can_start?"Backend preflight passed":"Backend preflight found launch blockers"}</strong>
        <p>Training type: ${o(t.training_type)}</p>
        ${s}
      </div>
    `)}function Is(e){const t=[];let a="",s=null,i=0;for(let n=0;n<e.length;n+=1){const r=e[n],c=n>0?e[n-1]:"";if(s){a+=r,r===s&&c!=="\\"&&(s=null);continue}if(r==='"'||r==="'"){s=r,a+=r;continue}if(r==="["){i+=1,a+=r;continue}if(r==="]"){i-=1,a+=r;continue}if(r===","&&i===0){t.push(a.trim()),a="";continue}a+=r}return a.trim().length>0&&t.push(a.trim()),t}function Ps(e){let t=null,a=!1,s="";for(const i of e){if(t){if(s+=i,t==='"'&&i==="\\"&&!a){a=!0;continue}i===t&&!a&&(t=null),a=!1;continue}if(i==='"'||i==="'"){t=i,s+=i;continue}if(i==="#")break;s+=i}return s.trim()}function Ut(e){return e.startsWith('"')&&e.endsWith('"')?e.slice(1,-1).replaceAll('\\"','"').replaceAll("\\n",`
`).replaceAll("\\t","	").replaceAll("\\\\","\\"):e.startsWith("'")&&e.endsWith("'")?e.slice(1,-1):e}function Xt(e){const t=e.trim();return t.length===0?"":t.startsWith('"')&&t.endsWith('"')||t.startsWith("'")&&t.endsWith("'")?Ut(t):t==="true"?!0:t==="false"?!1:t.startsWith("[")&&t.endsWith("]")?Is(t.slice(1,-1)).map(a=>Xt(a)):/^[+-]?\d[\d_]*(\.\d[\d_]*)?([eE][+-]?\d+)?$/.test(t)?Number(t.replaceAll("_","")):t}function mt(e){return e.split(".").map(t=>t.trim()).filter(Boolean).map(t=>Ut(t))}function Rs(e,t,a){let s=e;for(let i=0;i<t.length-1;i+=1){const n=t[i],r=s[n];(!r||typeof r!="object"||Array.isArray(r))&&(s[n]={}),s=s[n]}s[t[t.length-1]]=a}function Ye(e){const t={};let a=[];for(const s of e.split(/\r?\n/)){const i=Ps(s);if(!i)continue;if(i.startsWith("[[")&&i.endsWith("]]"))throw new Error("Array-of-table syntax is not supported in custom params yet.");if(i.startsWith("[")&&i.endsWith("]")){a=mt(i.slice(1,-1));continue}const n=i.indexOf("=");if(n===-1)throw new Error(`Invalid TOML line: ${s}`);const r=mt(i.slice(0,n));if(r.length===0)throw new Error(`Invalid TOML key: ${s}`);Rs(t,[...a,...r],Xt(i.slice(n+1)))}return t}function xe(e){return JSON.stringify(e)}function Kt(e){return typeof e=="string"?xe(e):typeof e=="number"?Number.isFinite(e)?String(e):xe(String(e)):typeof e=="boolean"?e?"true":"false":Array.isArray(e)?`[${e.map(t=>Kt(t)).join(", ")}]`:xe(JSON.stringify(e))}function Jt(e,t=[],a=[]){const s=[];for(const[i,n]of Object.entries(e)){if(n&&typeof n=="object"&&!Array.isArray(n)){Jt(n,[...t,i],a);continue}s.push([i,n])}return a.push({path:t,values:s}),a}function Ne(e){const t=Jt(e).filter(s=>s.values.length>0).sort((s,i)=>s.path.join(".").localeCompare(i.path.join("."))),a=[];for(const s of t){s.path.length>0&&(a.length>0&&a.push(""),a.push(`[${s.path.join(".")}]`));for(const[i,n]of s.values.sort(([r],[c])=>r.localeCompare(c)))a.push(`${i} = ${Kt(n)}`)}return a.join(`
`)}const Ns=["pretrained_model_name_or_path","train_data_dir","reg_data_dir","output_dir","network_weights","conditioning_data_dir","controlnet_model_name_or_path","weights","vae","text_encoder","byt5","qwen3","llm_adapter_path","t5_tokenizer_path","ae","clip_l","clip_g","t5xxl","gemma2"],Cs=["learning_rate","unet_lr","text_encoder_lr","learning_rate_te","learning_rate_te1","learning_rate_te2","learning_rate_te3","sigmoid_scale","guidance_scale","training_shift","control_net_lr","self_attn_lr","cross_attn_lr","mlp_lr","mod_lr","llm_adapter_lr"],Ds=["lycoris_algo","conv_dim","conv_alpha","dropout","dylora_unit","lokr_factor","train_norm","down_lr_weight","mid_lr_weight","up_lr_weight","block_lr_zero_threshold","enable_block_weights","enable_preview","network_args_custom","optimizer_args_custom","enable_base_weight","prodigy_d0","prodigy_d_coef","ui_custom_params"],Bs=["vae","reg_data_dir","network_weights","conditioning_data_dir","controlnet_model_name_or_path","weights","init_word","text_encoder","byt5","qwen3","llm_adapter_path","t5_tokenizer_path","ae","clip_l","clip_g","t5xxl","gemma2","noise_offset","multires_noise_iterations","multires_noise_discount","caption_dropout_rate","network_dropout","scale_weight_norms","gpu_ids"],gt=["v2","v_parameterization","scale_v_pred_loss_like_noise_pred","clip_skip","learning_rate_te","stop_text_encoder_training"],qs=["learning_rate_te1","learning_rate_te2"],zs=[["cache_text_encoder_outputs","shuffle_caption"],["noise_offset","multires_noise_iterations"],["cache_latents","color_aug"],["cache_latents","random_crop"]],ft={algo:"lycoris_algo",unit:"dylora_unit",factor:"lokr_factor"},Os=new Set(["conv_dim","conv_alpha","dropout","down_lr_weight","mid_lr_weight","up_lr_weight","block_lr_zero_threshold"]),Fs=new Set(["decouple","weight_decay","use_bias_correction","safeguard_warmup"]),Ms=new Set(["base_weights","base_weights_multiplier"]),js={pretrained_model_name_or_path:"./sd-models/model.safetensors",train_data_dir:"./train/aki",resolution:"512,512",enable_bucket:!0,min_bucket_reso:256,max_bucket_reso:1024,output_name:"aki",output_dir:"./output",save_model_as:"safetensors",save_every_n_epochs:2,max_train_epochs:10,train_batch_size:1,network_train_unet_only:!1,network_train_text_encoder_only:!1,learning_rate:1e-4,unet_lr:1e-4,text_encoder_lr:1e-5,lr_scheduler:"cosine_with_restarts",optimizer_type:"AdamW8bit",lr_scheduler_num_cycles:1,network_module:"networks.lora",network_dim:32,network_alpha:32,logging_dir:"./logs",caption_extension:".txt",shuffle_caption:!0,keep_tokens:0,max_token_length:255,seed:1337,prior_loss_weight:1,clip_skip:2,mixed_precision:"fp16",save_precision:"fp16",xformers:!0,cache_latents:!0,persistent_data_loader_workers:!0};function Ce(e){return JSON.parse(JSON.stringify(e??{}))}function oe(e){return Array.isArray(e)?e.map(t=>String(t??"").trim()).filter(Boolean):String(e??"").split(/\r?\n/).map(t=>t.trim()).filter(Boolean)}function F(e,t){return Object.prototype.hasOwnProperty.call(e,t)}function Vs(e){return String(e.model_train_type??"").startsWith("sdxl")}function Hs(e){return String(e.model_train_type??"")==="sd3-finetune"}function k(e){return e==null?"":String(e)}function Gs(e){return k(e).replaceAll("\\","/")}function z(e,t=0){const a=Number.parseFloat(k(e));return Number.isNaN(a)?t:a}function v(e){return!!e}function bt(e){const t=e.indexOf("=");return t===-1?{key:e.trim(),value:"",hasValue:!1}:{key:e.slice(0,t).trim(),value:e.slice(t+1).trim(),hasValue:!0}}function Ws(e){if(typeof e=="boolean")return e;const t=k(e).toLowerCase();return t==="true"||t==="1"||t==="yes"}function Ze(e,t=String(e.model_train_type??"")){const a=t==="lora-basic"?{...js,...Ce(e)}:Ce(e);mi(a);const s=[],i=[],n=Vs(a),r=Hs(a);(n||r)&&[a.learning_rate_te1,a.learning_rate_te2,a.learning_rate_te3].some(v)&&(a.train_text_encoder=!0);const c=n?gt.filter(u=>u!=="clip_skip"):r?gt:qs;for(const u of c)F(a,u)&&delete a[u];a.network_module==="lycoris.kohya"?(s.push(`conv_dim=${k(a.conv_dim)}`,`conv_alpha=${k(a.conv_alpha)}`,`dropout=${k(a.dropout)}`,`algo=${k(a.lycoris_algo)}`),v(a.lokr_factor)&&s.push(`factor=${k(a.lokr_factor)}`),v(a.train_norm)&&s.push("train_norm=True")):a.network_module==="networks.dylora"&&s.push(`unit=${k(a.dylora_unit)}`);const p=k(a.optimizer_type),d=p.toLowerCase();d.startsWith("dada")?((p==="DAdaptation"||p==="DAdaptAdam")&&i.push("decouple=True","weight_decay=0.01"),a.learning_rate=1,a.unet_lr=1,a.text_encoder_lr=1):d==="prodigy"&&(i.push("decouple=True","weight_decay=0.01","use_bias_correction=True",`d_coef=${k(a.prodigy_d_coef)}`),v(a.lr_warmup_steps)&&i.push("safeguard_warmup=True"),v(a.prodigy_d0)&&i.push(`d0=${k(a.prodigy_d0)}`)),v(a.enable_block_weights)&&(s.push(`down_lr_weight=${k(a.down_lr_weight)}`,`mid_lr_weight=${k(a.mid_lr_weight)}`,`up_lr_weight=${k(a.up_lr_weight)}`,`block_lr_zero_threshold=${k(a.block_lr_zero_threshold)}`),delete a.block_lr_zero_threshold),v(a.enable_base_weight)?(a.base_weights=oe(a.base_weights),a.base_weights_multiplier=oe(a.base_weights_multiplier).map(u=>z(u))):(delete a.base_weights,delete a.base_weights_multiplier);for(const u of oe(a.network_args_custom))s.push(u);for(const u of oe(a.optimizer_args_custom))i.push(u);v(a.enable_preview)||(delete a.sample_prompts,delete a.sample_sampler,delete a.sample_every_n_epochs);for(const u of Cs)F(a,u)&&(a[u]=z(a[u]));for(const u of Bs){if(!F(a,u))continue;const l=a[u];(l===0||l===""||Array.isArray(l)&&l.length===0)&&delete a[u]}for(const u of Ns)F(a,u)&&a[u]&&(a[u]=Gs(a[u]));if(s.length>0?a.network_args=s:delete a.network_args,i.length>0?a.optimizer_args=i:delete a.optimizer_args,v(a.ui_custom_params)){const u=Ye(k(a.ui_custom_params));Object.assign(a,u)}for(const u of Ds)F(a,u)&&delete a[u];return Array.isArray(a.gpu_ids)&&(a.gpu_ids=a.gpu_ids.map(u=>{const l=k(u),h=l.match(/GPU\s+(\d+):/);return h?h[1]:l})),a}function Us(e){const t=[],a=[],s=k(e.optimizer_type),i=s.toLowerCase(),n=k(e.model_train_type),r=k(e.model_type).trim().toLowerCase(),c=k(e.conditioning_data_dir).trim(),p=k(e.reg_data_dir).trim(),d=k(e.attn_mode).trim().toLowerCase(),u=v(e.cache_text_encoder_outputs),l=!v(e.network_train_unet_only),h=n.startsWith("sdxl"),g=n==="sd3-finetune",b=n==="sd3-lora",y=n==="flux-lora",w=n==="anima-lora"||n==="anima-finetune",E=n==="hunyuan-image-lora",D=n.includes("controlnet"),Y=h||b||y||w||E,ne=h||b||y||E;s.startsWith("DAdapt")&&e.lr_scheduler!=="constant"&&t.push("DAdaptation works best with lr_scheduler set to constant."),i.startsWith("prodigy")&&(F(e,"unet_lr")||F(e,"text_encoder_lr"))&&(z(e.unet_lr,1)!==1||z(e.text_encoder_lr,1)!==1)&&t.push("Prodigy usually expects unet_lr and text_encoder_lr to stay at 1."),e.network_module==="networks.oft"&&n!=="sdxl-lora"&&a.push("OFT is currently only supported for SDXL LoRA."),v(e.network_train_unet_only)&&v(e.network_train_text_encoder_only)&&a.push("network_train_unet_only and network_train_text_encoder_only cannot be enabled at the same time."),g&&v(e.train_text_encoder)&&v(e.cache_text_encoder_outputs)&&!v(e.use_t5xxl_cache_only)&&a.push("SD3 full finetune cannot train text encoders while cache_text_encoder_outputs is enabled."),g&&v(e.train_t5xxl)&&!v(e.train_text_encoder)&&a.push("train_t5xxl requires train_text_encoder to be enabled first."),g&&v(e.train_t5xxl)&&v(e.cache_text_encoder_outputs)&&a.push("train_t5xxl cannot be combined with cache_text_encoder_outputs."),w&&v(e.unsloth_offload_checkpointing)&&v(e.cpu_offload_checkpointing)&&a.push("unsloth_offload_checkpointing cannot be combined with cpu_offload_checkpointing."),w&&v(e.unsloth_offload_checkpointing)&&v(e.blocks_to_swap)&&a.push("unsloth_offload_checkpointing cannot be combined with blocks_to_swap."),D&&c.length===0&&a.push("conditioning_data_dir is required for ControlNet training routes."),D&&p.length>0&&t.push("reg_data_dir is usually ignored for ControlNet training routes. Use conditioning_data_dir pairs instead."),D&&F(e,"prior_loss_weight")&&t.push("prior_loss_weight is not normally used by ControlNet training routes."),p.length>0&&z(e.prior_loss_weight,1)<=0&&t.push("reg_data_dir is set, but prior_loss_weight is 0 or lower, so regularization images may have no effect."),v(e.cache_text_encoder_outputs_to_disk)&&!v(e.cache_text_encoder_outputs)&&t.push("cache_text_encoder_outputs_to_disk will force cache_text_encoder_outputs on during training."),y&&r==="chroma"&&!v(e.apply_t5_attn_mask)&&a.push("FLUX Chroma requires apply_t5_attn_mask to stay enabled."),Y&&u&&l&&a.push("cache_text_encoder_outputs cannot be combined with Text Encoder LoRA training on this route. Enable network_train_unet_only instead."),ne&&u&&z(e.caption_dropout_rate,0)>0&&a.push("cache_text_encoder_outputs cannot be combined with caption_dropout_rate on this route."),Y&&u&&(v(e.shuffle_caption)||z(e.caption_tag_dropout_rate,0)>0||z(e.token_warmup_step,0)>0)&&a.push("cache_text_encoder_outputs cannot be combined with shuffle_caption, caption_tag_dropout_rate, or token_warmup_step on this route."),(y||b)&&u&&v(e.train_t5xxl)&&a.push("train_t5xxl cannot be combined with cache_text_encoder_outputs on this route."),E&&!v(e.network_train_unet_only)&&a.push("Hunyuan Image LoRA currently requires network_train_unet_only."),h&&!v(e.network_train_unet_only)&&!v(e.network_train_text_encoder_only)&&t.push("SDXL LoRA usually behaves best with network_train_unet_only enabled unless you explicitly want Text Encoder LoRA training."),(w||E)&&d==="sageattn"&&a.push("sageattn is inference-only for this trainer and should not be selected for training."),(w||E)&&d==="xformers"&&!v(e.split_attn)&&a.push("attn_mode=xformers requires split_attn for this trainer."),d&&(v(e.xformers)||v(e.sdpa))&&t.push("attn_mode is set, so the plain xformers/sdpa toggles may be ignored by this trainer."),v(e.masked_loss)&&!v(e.alpha_mask)&&!v(e.conditioning_data_dir)&&t.push("masked_loss is on, but alpha_mask is off. For normal alpha-channel datasets this often becomes a no-op."),h&&v(e.clip_skip)&&t.push("SDXL clip_skip in this build is experimental. Use the same clip-skip behavior at inference time if you rely on it.");for(const[S,j]of zs)v(e[S])&&v(e[j])&&a.push(`Parameters ${S} and ${j} conflict. Please enable only one of them.`);return{warnings:t,errors:a}}function Yt(e){const t=Ce(e);if(hi(t),Array.isArray(t.network_args)){const a=[];for(const s of t.network_args){const{key:i,value:n,hasValue:r}=bt(k(s));if(i==="train_norm"){t.train_norm=r?Ws(n):!0;continue}if((i==="down_lr_weight"||i==="mid_lr_weight"||i==="up_lr_weight"||i==="block_lr_zero_threshold")&&(t.enable_block_weights=!0),Os.has(i)){t[i]=n;continue}if(ft[i]){t[ft[i]]=n;continue}a.push(k(s))}a.length>0&&(t.network_args_custom=a),delete t.network_args}if(Array.isArray(t.optimizer_args)){const a=[];for(const s of t.optimizer_args){const{key:i,value:n}=bt(k(s));if(i==="d_coef"){t.prodigy_d_coef=n;continue}if(i==="d0"){t.prodigy_d0=n;continue}Fs.has(i)||a.push(k(s))}a.length>0&&(t.optimizer_args_custom=a),delete t.optimizer_args}for(const a of Ms)Array.isArray(t[a])&&(t[a]=t[a].map(s=>k(s)).join(`
`),a==="base_weights"&&(t.enable_base_weight=!0),a==="base_weights_multiplier"&&(t.enable_base_weight=!0));return Array.isArray(t.gpu_ids)&&(t.gpu_ids=t.gpu_ids.map(a=>k(a))),t}function J(e,t){return`
    <div class="training-library-meta">
      <span class="coverage-pill coverage-pill-muted">${o(e)}</span>
    </div>
    <p class="training-library-note">${o(t)}</p>
  `}function fe(e){return typeof e=="string"&&e.trim().length>0?e.trim():null}function De(e,t){const a=t.metadata??{},s=fe(a.train_type);return s?e.presetTrainTypes.includes(s)?{compatible:!0,label:"route preset",detail:`Preset metadata matches this route via train_type = ${s}.`,tone:"default"}:{compatible:!1,label:"cross-route preset",detail:`Preset metadata targets ${s}, which does not match ${e.schemaName}.`,tone:"warning"}:{compatible:!0,label:"generic preset",detail:"This preset does not declare a train_type, so review route-specific fields before launch.",tone:"muted"}}function Be(e,t){const a=fe(t.route_id),s=fe(t.train_type);return a===e.routeId?{compatible:!0,label:"route recipe",detail:"This recipe was saved from the same source-side route.",tone:"default"}:s&&e.presetTrainTypes.includes(s)?{compatible:!0,label:"family recipe",detail:`Recipe metadata matches this route family via train_type = ${s}.`,tone:"default"}:!a&&!s?{compatible:!0,label:"generic recipe",detail:"This recipe has no route metadata, so review route-specific fields before applying it.",tone:"muted"}:a?{compatible:!1,label:"cross-route recipe",detail:`Recipe metadata says it came from ${a}, not ${e.routeId}.`,tone:"warning"}:{compatible:!1,label:"foreign train type",detail:`Recipe metadata targets ${s}, which does not match ${e.schemaName}.`,tone:"warning"}}function se(e,t){const a=t.values.output_name;return typeof a=="string"&&a.trim().length>0?a.trim():`${e.modelLabel} snapshot`}function Xs(e){try{return JSON.stringify(Ze(W(e.value)),null,2)}catch(t){return t instanceof Error?t.message:"Unable to preview this snapshot."}}function Ks(e,t){if(t.length===0){f(`${e}-history-panel`,`
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
        ${J("0 snapshots","Saved parameter snapshots stay in this browser and can restore form values plus selected GPUs.")}
        <p>No saved parameter snapshots yet.</p>
      `);return}const a=t.map((s,i)=>`
        <article class="history-card">
          <div class="history-card-head">
            <div>
              <h4>${o(s.name||"Unnamed snapshot")}</h4>
              <p class="history-card-meta">${o(s.time)}</p>
            </div>
            <span class="coverage-pill coverage-pill-muted">${o((s.gpu_ids??[]).join(", ")||"default GPU")}</span>
          </div>
          <pre class="history-preview">${o(Xs(s))}</pre>
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
      ${J(`${t.length} snapshot${t.length===1?"":"s"}`,"Saved parameter snapshots stay in this browser and can restore form values plus selected GPUs.")}
      <div class="history-list">${a}</div>
    `)}function Js(e,t,a){if(t.length===0){f(`${e}-presets-panel`,`
        <div class="training-side-panel-head">
          <div>
            <p class="panel-kicker">presets</p>
            <h3>Training presets</h3>
          </div>
          <button class="action-button action-button-ghost action-button-small" data-preset-close="${e}" type="button">Close</button>
        </div>
        ${J("0 presets","Backend presets are shared read-only templates. Save recipe copies one into your local browser library.")}
        <p>No presets matched this training route.</p>
      `);return}const s=t.map((i,n)=>{const r=i.metadata??{},c=i.data??{},p=De(a,i),d=p.tone==="warning"?"coverage-pill-warning":p.tone==="muted"?"coverage-pill-muted":"",u=fe(r.train_type);return`
        <article class="preset-card">
          <div class="preset-card-head">
            <div>
              <h4>${o(r.name||i.name||`Preset ${n+1}`)}</h4>
              <p class="preset-card-meta">
                ${o(String(r.version||"unknown"))}
                · ${o(String(r.author||"unknown author"))}
              </p>
            </div>
            <span class="coverage-pill coverage-pill-muted">${o(String(r.train_type||"shared"))}</span>
          </div>
          <p>${o(String(r.description||"No description"))}</p>
          <div class="coverage-list training-card-compatibility">
            <span class="coverage-pill ${d}">${o(p.label)}</span>
            ${u?`<span class="coverage-pill coverage-pill-muted">${o(u)}</span>`:""}
          </div>
          <p class="training-card-note">${o(p.detail)}</p>
          <pre class="preset-preview">${o(JSON.stringify(c,null,2))}</pre>
          <div class="preset-card-actions">
            <button class="action-button action-button-ghost action-button-small" data-preset-save-recipe="${n}" type="button">Save recipe</button>
            <button class="action-button action-button-ghost action-button-small" data-preset-merge="${n}" type="button">Merge</button>
            <button class="action-button action-button-ghost action-button-small" data-preset-replace="${n}" type="button">Replace</button>
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
      ${J(`${t.length} preset${t.length===1?"":"s"}`,"Backend presets are shared read-only templates. Save recipe copies one into your local browser library.")}
      <div class="preset-list">${s}</div>
    `)}function Ys(e,t,a){if(t.length===0){f(`${e}-recipes-panel`,`
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
        ${J("0 recipes","Recipes are editable local copies stored per route in this browser. Import merges JSON or TOML here, and Export writes preset TOML files.")}
        <p>No saved recipes for this route yet.</p>
      `);return}const s=t.map((i,n)=>{const r=Be(a,i),c=r.tone==="warning"?"coverage-pill-warning":r.tone==="muted"?"coverage-pill-muted":"";return`
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
          <pre class="preset-preview">${o(JSON.stringify(Ze(W(i.value)),null,2))}</pre>
          <div class="preset-card-actions">
            <button class="action-button action-button-ghost action-button-small" data-recipe-merge="${n}" type="button">Merge</button>
            <button class="action-button action-button-ghost action-button-small" data-recipe-replace="${n}" type="button">Replace</button>
            <button class="action-button action-button-ghost action-button-small" data-recipe-export="${n}" type="button">Export</button>
            <button class="action-button action-button-ghost action-button-small" data-recipe-rename="${n}" type="button">Rename</button>
            <button class="action-button action-button-ghost action-button-small" data-recipe-delete="${n}" type="button">Delete</button>
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
      ${J(`${t.length} recipe${t.length===1?"":"s"}`,"Recipes are editable local copies stored per route in this browser. Import merges JSON or TOML here, and Export writes preset TOML files.")}
      <div class="preset-list">${s}</div>
    `)}function Zs(e,t){const a=new Set(e.presetTrainTypes);return t.filter(s=>{const n=(s.metadata??{}).train_type;return typeof n!="string"||n.trim().length===0?!0:a.has(n)})}function A(e,t,a){const s=document.querySelector(`#${e}-history-panel`),i=document.querySelector(`#${e}-recipes-panel`),n=document.querySelector(`#${e}-presets-panel`);s&&(s.hidden=t==="history"?!a:!0),i&&(i.hidden=t==="recipes"?!a:!0),n&&(n.hidden=t==="presets"?!a:!0)}async function yt(e,t){try{const a=await va(t);if(a.status!=="success")throw new Error(a.message||"Training preflight failed.");return ht(e.prefix,a.data??null),a.data??null}catch(a){throw ht(e.prefix,null,a instanceof Error?a.message:"Training preflight failed."),a}}function Qs(e){var t;(t=document.querySelector(`#${e.prefix}-stop-train`))==null||t.addEventListener("click",async()=>{var a;try{const i=(((a=(await Oe()).data)==null?void 0:a.tasks)??[]).find(r=>String(r.status).toUpperCase()==="RUNNING");if(!i){_(e.prefix,"No running training task was found.","warning");return}const n=String(i.id??i.task_id??"");if(!n){_(e.prefix,"The running task does not expose an id.","error");return}if(!window.confirm(`Stop running task ${n}?`))return;await $t(n),I(e.prefix,"Training stop requested",`Sent terminate request for task ${n}.`,"warning"),_(e.prefix,`Terminate requested for task ${n}.`,"warning")}catch(s){_(e.prefix,s instanceof Error?s.message:"Failed to stop training.","error")}})}function en(e,t,a){var i;(i=document.querySelector(`#${e.prefix}-run-preflight`))==null||i.addEventListener("click",async()=>{const n=t();if(!n){I(e.prefix,"Editor not ready",`The ${e.modelLabel} schema editor state is not initialized yet.`,"error");return}try{const r=a(n);ge(e.prefix,r.checks),await yt(e,r.payload),_(e.prefix,"Training preflight completed.","success")}catch(r){_(e.prefix,r instanceof Error?r.message:"Training preflight failed.","error")}});const s=document.querySelector(`#${e.prefix}-start-train`);s==null||s.addEventListener("click",async()=>{var r;const n=t();if(!n){I(e.prefix,"Editor not ready",`The ${e.modelLabel} schema editor state is not initialized yet.`,"error");return}s.setAttribute("disabled","true"),I(e.prefix,"Submitting training job...","Sending the current payload to /api/run.","idle");try{const c=a(n);if(c.checks.errors.length>0){I(e.prefix,"Fix parameter conflicts first",c.checks.errors.join(" "),"error"),ge(e.prefix,c.checks);return}const p=await yt(e,c.payload);if(p&&!p.can_start){I(e.prefix,"Resolve preflight errors first",p.errors.join(" "),"error");return}const d=await ya(c.payload);if(d.status==="success"){const l=[...c.checks.warnings,...(p==null?void 0:p.warnings)??[],...((r=d.data)==null?void 0:r.warnings)??[]].join(" ");I(e.prefix,"Training request accepted",`${d.message||"Training started."}${l?` ${l}`:""}`,l?"warning":"success")}else I(e.prefix,"Training request failed",d.message||"Unknown backend failure.","error")}catch(c){I(e.prefix,"Training request failed",c instanceof Error?c.message:"Unknown network error.","error")}finally{s.removeAttribute("disabled")}})}function tn(e){return e.trim().replace(/[^0-9A-Za-z._-]+/g,"-").replace(/-+/g,"-").replace(/^[-_.]+|[-_.]+$/g,"")||"training-preset"}function an(e,t,a){const s=se(e,t),i=String(a.payload.model_train_type??"");return{metadata:{name:s,version:"1.0",author:"SD-reScripts local export",train_type:i||e.schemaName,description:`Exported from the ${e.modelLabel} source-side training bridge on ${new Date().toLocaleString()}.`},data:a.payload}}function sn(e,t,a,s){const i=se(e,t),n=window.prompt("Recipe name",i);if(!n||!n.trim())return!1;const r=window.prompt("Recipe description (optional)","")??"",c=R(e.routeId);return c.unshift({created_at:new Date().toLocaleString(),name:n.trim(),description:r.trim()||void 0,train_type:String(a.payload.model_train_type??e.schemaName),route_id:e.routeId,value:W(a.payload)}),Z(e.routeId,He(c)),s(),!0}function vt(e,t,a){const s=t.data&&typeof t.data=="object"&&!Array.isArray(t.data)?t.data:t.value&&typeof t.value=="object"&&!Array.isArray(t.value)?t.value:t;if(!s||typeof s!="object"||Array.isArray(s)||Object.keys(s).length===0)return null;const i=t.metadata&&typeof t.metadata=="object"&&!Array.isArray(t.metadata)?t.metadata:{},n=String(i.name||t.name||a||"Imported recipe").trim();return{created_at:String(t.created_at||new Date().toLocaleString()),name:n||"Imported recipe",description:typeof i.description=="string"?i.description:typeof t.description=="string"?t.description:void 0,train_type:typeof i.train_type=="string"?i.train_type:typeof t.train_type=="string"?t.train_type:typeof s.model_train_type=="string"?s.model_train_type:e.schemaName,route_id:typeof t.route_id=="string"?t.route_id:e.routeId,value:W(s)}}function nn(e,t,a){const s=a.trim();if(!s)throw new Error("Recipe file is empty.");const i=t.toLowerCase().endsWith(".json")?JSON.parse(s):Ye(s),n=[];if(Array.isArray(i))i.forEach((r,c)=>{if(!r||typeof r!="object"||Array.isArray(r))return;const p=vt(e,r,`Imported recipe ${c+1}`);p&&n.push(p)});else if(i&&typeof i=="object"){const r=vt(e,i,t.replace(/\.[^.]+$/,""));r&&n.push(r)}if(n.length===0)throw new Error("No valid recipe entries were found in this file.");return n}function rn(e,t,a){var i;const s=O(e.routeId);s.unshift({time:new Date().toLocaleString(),name:se(e,t),value:W(t.values),gpu_ids:Xe(`${e.prefix}-gpu-selector`)}),ue(e.routeId,Ct(s)),(i=document.querySelector(`#${e.prefix}-history-panel`))!=null&&i.hidden||a()}function on(e,t,a,s){var i,n,r,c;(i=document.querySelector(`#${e.prefix}-download-config`))==null||i.addEventListener("click",()=>{const p=t();if(!p)return;const d=a(p);X(`${e.prefix}-${Te()}.toml`,Ne(d.payload)),_(e.prefix,"Exported current config as TOML.","success")}),(n=document.querySelector(`#${e.prefix}-export-preset`))==null||n.addEventListener("click",()=>{const p=t();if(!p)return;const d=a(p),u=an(e,p,d),l=tn(se(e,p)||e.prefix);X(`${l}-preset.toml`,Ne(u)),_(e.prefix,"Exported current config as reusable preset TOML.","success")}),(r=document.querySelector(`#${e.prefix}-import-config`))==null||r.addEventListener("click",()=>{var p;(p=document.querySelector(`#${e.prefix}-config-file-input`))==null||p.click()}),(c=document.querySelector(`#${e.prefix}-config-file-input`))==null||c.addEventListener("change",p=>{var h;const d=p.currentTarget,u=(h=d.files)==null?void 0:h[0];if(!u)return;const l=new FileReader;l.onload=()=>{try{const g=Ye(String(l.result??"")),b=g.data&&typeof g.data=="object"&&!Array.isArray(g.data)?g.data:g;s(b),_(e.prefix,g.data&&typeof g.data=="object"?`Imported preset: ${u.name}.`:`Imported config: ${u.name}.`,"success")}catch(g){_(e.prefix,g instanceof Error?g.message:"Failed to import config.","error")}finally{d.value=""}},l.readAsText(u)})}function ln(e,t){var a;(a=document.querySelector(`#${e.prefix}-history-file-input`))==null||a.addEventListener("change",s=>{var c;const i=s.currentTarget,n=(c=i.files)==null?void 0:c[0];if(!n)return;const r=new FileReader;r.onload=()=>{try{const p=JSON.parse(String(r.result??""));if(!Array.isArray(p))throw new Error("History file must contain an array.");const d=p.filter(l=>l&&typeof l=="object"&&l.value&&typeof l.value=="object").map(l=>({time:String(l.time||new Date().toLocaleString()),name:l.name?String(l.name):void 0,value:W(l.value),gpu_ids:Array.isArray(l.gpu_ids)?l.gpu_ids.map(h=>String(h)):[]}));if(d.length===0)throw new Error("History file did not contain valid entries.");const u=Ct([...O(e.routeId),...d]);ue(e.routeId,u),t(),_(e.prefix,`Imported ${d.length} history entries.`,"success")}catch(p){_(e.prefix,p instanceof Error?p.message:"Failed to import history.","error")}finally{i.value=""}},r.readAsText(n)})}function cn(e,t,a){var s;(s=document.querySelector(`#${e.prefix}-recipe-file-input`))==null||s.addEventListener("change",i=>{var p;const n=i.currentTarget,r=(p=n.files)==null?void 0:p[0];if(!r)return;const c=new FileReader;c.onload=()=>{try{const d=nn(e,r.name,String(c.result??"")),u=He([...d,...R(e.routeId)]);Z(e.routeId,u),t(),a(),_(e.prefix,`Imported ${d.length} recipe ${d.length===1?"entry":"entries"}.`,"success")}catch(d){_(e.prefix,d instanceof Error?d.message:"Failed to import recipe.","error")}finally{n.value=""}},c.readAsText(r)})}function un(e,t,a){f(`${e}-sample-prompt-workspace`,`
      <div class="submit-status-box">
        <strong>${o(t)}</strong>
        <p>${o(a)}</p>
      </div>
    `)}function dn(e){switch(e){case"prompt_file":return"Prompt file";case"generated":return"Generated from current fields";case"random_dataset_prompt_preview":return"Random dataset-derived prompt";case"legacy_sample_prompts_file":return"Legacy sample_prompts file";case"legacy_sample_prompts_inline":return"Legacy sample_prompts text";default:return e}}function be(e){un(e,"Sample prompt workspace is waiting for refresh","Edit prompt fields freely, then click Refresh prompt to inspect the exact text that would be used.")}function le(e,t,a){if(a){f(`${e}-sample-prompt-workspace`,`
        <div class="submit-status-box submit-status-error">
          <strong>Sample prompt preview failed</strong>
          <p>${o(a)}</p>
        </div>
      `);return}if(!t){be(e);return}const s=[t.warnings.length?`
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
        `:""].filter(Boolean).join(""),i=t.warnings.length>0||!t.enabled?"submit-status-warning":"submit-status-success",n=t.line_count>3?`Showing the first 3 non-empty lines out of ${t.line_count}.`:`${t.line_count||0} non-empty line${t.line_count===1?"":"s"} detected.`;f(`${e}-sample-prompt-workspace`,`
      <div class="submit-status-box ${i}">
        <strong>${t.enabled?"Sample prompt resolved":"Sample prompt resolved, but preview is disabled"}</strong>
        <p class="training-preflight-meta">${o(dn(t.source))}${t.detail?` · ${o(t.detail)}`:""}</p>
        <p class="training-preflight-meta">${o(n)} Download will use ${o(t.suggested_file_name)}.</p>
        ${s}
        <pre class="preset-preview">${o(t.preview)}</pre>
      </div>
    `)}async function _t(e,t,a){const s=t();if(!s)throw new Error(`${e.modelLabel} editor is not ready yet.`);const i=a(s),n=await _a(i.payload);if(n.status!=="success"||!n.data)throw new Error(n.message||"Sample prompt preview failed.");return n.data}function pn(e){var n,r,c,p;const{config:t,getCurrentState:a,buildPreparedTrainingPayload:s,applyEditableRecord:i}=e;(n=document.querySelector(`#${t.prefix}-refresh-sample-prompt`))==null||n.addEventListener("click",async()=>{try{const d=await _t(t,a,s);le(t.prefix,d),_(t.prefix,"Sample prompt preview refreshed.","success")}catch(d){le(t.prefix,null,d instanceof Error?d.message:"Sample prompt preview failed."),_(t.prefix,d instanceof Error?d.message:"Sample prompt preview failed.","error")}}),(r=document.querySelector(`#${t.prefix}-download-sample-prompt`))==null||r.addEventListener("click",async()=>{try{const d=await _t(t,a,s);le(t.prefix,d),X(d.suggested_file_name||"sample-prompts.txt",d.content||""),_(t.prefix,`Sample prompt exported as ${d.suggested_file_name}.`,"success")}catch(d){le(t.prefix,null,d instanceof Error?d.message:"Sample prompt export failed."),_(t.prefix,d instanceof Error?d.message:"Sample prompt export failed.","error")}}),(c=document.querySelector(`#${t.prefix}-pick-prompt-file`))==null||c.addEventListener("click",async()=>{try{const d=await G("text-file");i({prompt_file:d},void 0,"merge"),be(t.prefix),_(t.prefix,"Prompt file path inserted into the current form state.","success")}catch(d){_(t.prefix,d instanceof Error?d.message:"Prompt file picker failed.","error")}}),(p=document.querySelector(`#${t.prefix}-clear-prompt-file`))==null||p.addEventListener("click",()=>{i({prompt_file:""},void 0,"merge"),be(t.prefix),_(t.prefix,"prompt_file cleared from the current form state.","warning")})}function hn(e){var g,b,y,w,E,D,Y,ne;const{config:t,createDefaultState:a,getCurrentState:s,mountTrainingState:i,onStateChange:n,applyEditableRecord:r,buildPreparedTrainingPayload:c,bindHistoryPanel:p,bindRecipePanel:d,openHistoryPanel:u,openRecipePanel:l,openPresetPanel:h}=e;document.querySelectorAll(`#${t.prefix}-gpu-selector input[data-gpu-id]`).forEach(S=>{S.addEventListener("change",()=>{const j=s();j&&n(j)})}),(g=document.querySelector(`#${t.prefix}-reset-all`))==null||g.addEventListener("click",()=>{const S=a();Ke(t.prefix,[]),i(S),_(t.prefix,"Reset to schema defaults.","warning")}),(b=document.querySelector(`#${t.prefix}-save-params`))==null||b.addEventListener("click",()=>{const S=s();S&&(rn(t,S,p),_(t.prefix,"Current parameters saved to history.","success"))}),(y=document.querySelector(`#${t.prefix}-read-params`))==null||y.addEventListener("click",()=>{u()}),(w=document.querySelector(`#${t.prefix}-clear-autosave`))==null||w.addEventListener("click",()=>{window.confirm("Clear the local autosave for this training route?")&&(Ha(t.routeId),Je(t.prefix,null),_(t.prefix,"Cleared local autosave for this route.","warning"))}),(E=document.querySelector(`#${t.prefix}-save-recipe`))==null||E.addEventListener("click",()=>{const S=s();if(!S)return;const j=c(S);sn(t,S,j,d)&&_(t.prefix,"Current config saved to the local recipe library.","success")}),(D=document.querySelector(`#${t.prefix}-read-recipes`))==null||D.addEventListener("click",()=>{l()}),(Y=document.querySelector(`#${t.prefix}-import-recipe`))==null||Y.addEventListener("click",()=>{var S;(S=document.querySelector(`#${t.prefix}-recipe-file-input`))==null||S.click()}),(ne=document.querySelector(`#${t.prefix}-load-presets`))==null||ne.addEventListener("click",()=>{h()}),on(t,s,c,r),ln(t,u),cn(t,d,l),pn({config:t,getCurrentState:s,buildPreparedTrainingPayload:c,applyEditableRecord:r}),Qs(t),en(t,s,c)}function mn(e,t){let a=null;const s=(u,l,h)=>window.confirm(`Apply ${u} "${l}" to ${e.modelLabel}?

${h}

You can still continue, but some route-specific fields may need manual review afterwards.`),i=()=>{const u=O(e.routeId);Ks(e.prefix,u),document.querySelectorAll(`#${e.prefix}-history-panel [data-history-close]`).forEach(l=>{l.addEventListener("click",()=>A(e.prefix,"history",!1))}),document.querySelectorAll(`#${e.prefix}-history-panel [data-history-export]`).forEach(l=>{l.addEventListener("click",()=>{X(`${e.prefix}-history-${Te()}.json`,JSON.stringify(O(e.routeId),null,2),"application/json;charset=utf-8"),_(e.prefix,"History exported.","success")})}),document.querySelectorAll(`#${e.prefix}-history-panel [data-history-import]`).forEach(l=>{l.addEventListener("click",()=>{var h;(h=document.querySelector(`#${e.prefix}-history-file-input`))==null||h.click()})}),document.querySelectorAll(`#${e.prefix}-history-panel [data-history-apply]`).forEach(l=>{l.addEventListener("click",()=>{const h=Number(l.dataset.historyApply??"-1"),g=O(e.routeId)[h];g&&(t(g.value,g.gpu_ids,"replace"),A(e.prefix,"history",!1),_(e.prefix,`Applied snapshot: ${g.name||"Unnamed snapshot"}.`,"success"))})}),document.querySelectorAll(`#${e.prefix}-history-panel [data-history-rename]`).forEach(l=>{l.addEventListener("click",()=>{const h=Number(l.dataset.historyRename??"-1"),g=O(e.routeId),b=g[h];if(!b)return;const y=window.prompt("Rename snapshot",b.name||"");y&&(b.name=y.trim(),ue(e.routeId,g),i(),_(e.prefix,"Snapshot renamed.","success"))})}),document.querySelectorAll(`#${e.prefix}-history-panel [data-history-delete]`).forEach(l=>{l.addEventListener("click",()=>{const h=Number(l.dataset.historyDelete??"-1"),g=O(e.routeId),b=g[h];b&&window.confirm(`Delete snapshot "${b.name||"Unnamed snapshot"}"?`)&&(g.splice(h,1),ue(e.routeId,g),i(),_(e.prefix,"Snapshot deleted.","success"))})})},n=()=>{i(),A(e.prefix,"history",!0)},r=()=>{const u=R(e.routeId);Ys(e.prefix,u,e),document.querySelectorAll(`#${e.prefix}-recipes-panel [data-recipe-close]`).forEach(l=>{l.addEventListener("click",()=>A(e.prefix,"recipes",!1))}),document.querySelectorAll(`#${e.prefix}-recipes-panel [data-recipe-export-all]`).forEach(l=>{l.addEventListener("click",()=>{X(`${e.prefix}-recipes-${Te()}.json`,JSON.stringify(R(e.routeId),null,2),"application/json;charset=utf-8"),_(e.prefix,"Recipe library exported.","success")})}),document.querySelectorAll(`#${e.prefix}-recipes-panel [data-recipe-import]`).forEach(l=>{l.addEventListener("click",()=>{var h;(h=document.querySelector(`#${e.prefix}-recipe-file-input`))==null||h.click()})}),document.querySelectorAll(`#${e.prefix}-recipes-panel [data-recipe-merge]`).forEach(l=>{l.addEventListener("click",()=>{const h=Number(l.dataset.recipeMerge??"-1"),g=R(e.routeId)[h];if(!g)return;const b=Be(e,g);!b.compatible&&!s("recipe",g.name,b.detail)||(t(g.value,void 0,"merge"),A(e.prefix,"recipes",!1),_(e.prefix,`Merged recipe: ${g.name}.`,"success"))})}),document.querySelectorAll(`#${e.prefix}-recipes-panel [data-recipe-replace]`).forEach(l=>{l.addEventListener("click",()=>{const h=Number(l.dataset.recipeReplace??"-1"),g=R(e.routeId)[h];if(!g)return;const b=Be(e,g);!b.compatible&&!s("recipe",g.name,b.detail)||(t(g.value,void 0,"replace"),A(e.prefix,"recipes",!1),_(e.prefix,`Replaced current values with recipe: ${g.name}.`,"success"))})}),document.querySelectorAll(`#${e.prefix}-recipes-panel [data-recipe-export]`).forEach(l=>{l.addEventListener("click",()=>{const h=Number(l.dataset.recipeExport??"-1"),g=R(e.routeId)[h];g&&(X(`${g.name.replace(/[^0-9A-Za-z._-]+/g,"-")||"recipe"}-preset.toml`,Ne({metadata:{name:g.name,version:"1.0",author:"SD-reScripts local recipe",train_type:g.train_type||e.schemaName,description:g.description||`Exported recipe from ${e.modelLabel}.`},data:g.value})),_(e.prefix,`Exported recipe: ${g.name}.`,"success"))})}),document.querySelectorAll(`#${e.prefix}-recipes-panel [data-recipe-rename]`).forEach(l=>{l.addEventListener("click",()=>{const h=Number(l.dataset.recipeRename??"-1"),g=R(e.routeId),b=g[h];if(!b)return;const y=window.prompt("Rename recipe",b.name);!y||!y.trim()||(b.name=y.trim(),Z(e.routeId,g),r(),_(e.prefix,"Recipe renamed.","success"))})}),document.querySelectorAll(`#${e.prefix}-recipes-panel [data-recipe-delete]`).forEach(l=>{l.addEventListener("click",()=>{const h=Number(l.dataset.recipeDelete??"-1"),g=R(e.routeId),b=g[h];b&&window.confirm(`Delete recipe "${b.name}"?`)&&(g.splice(h,1),Z(e.routeId,g),r(),_(e.prefix,"Recipe deleted.","success"))})})},c=()=>{r(),A(e.prefix,"recipes",!0)},p=()=>{Js(e.prefix,a??[],e),document.querySelectorAll(`#${e.prefix}-presets-panel [data-preset-close]`).forEach(u=>{u.addEventListener("click",()=>A(e.prefix,"presets",!1))}),document.querySelectorAll(`#${e.prefix}-presets-panel [data-preset-merge]`).forEach(u=>{u.addEventListener("click",()=>{const l=Number(u.dataset.presetMerge??"-1"),h=a==null?void 0:a[l];if(!h)return;const g=De(e,h),b=String((h.metadata??{}).name||h.name||"preset");if(!g.compatible&&!s("preset",b,g.detail))return;const y=h.data??{};t(y,void 0,"merge"),A(e.prefix,"presets",!1),_(e.prefix,`Merged preset: ${b}.`,"success")})}),document.querySelectorAll(`#${e.prefix}-presets-panel [data-preset-save-recipe]`).forEach(u=>{u.addEventListener("click",()=>{var w;const l=Number(u.dataset.presetSaveRecipe??"-1"),h=a==null?void 0:a[l];if(!h)return;const g=h.metadata??{},b=h.data??{},y=R(e.routeId);y.unshift({created_at:new Date().toLocaleString(),name:String(g.name||h.name||"Imported preset recipe"),description:typeof g.description=="string"?g.description:void 0,train_type:typeof g.train_type=="string"?g.train_type:e.schemaName,route_id:e.routeId,value:JSON.parse(JSON.stringify(b))}),Z(e.routeId,He(y)),(w=document.querySelector(`#${e.prefix}-recipes-panel`))!=null&&w.hidden||r(),_(e.prefix,`Saved preset to local recipe library: ${String(g.name||h.name||"preset")}.`,"success")})}),document.querySelectorAll(`#${e.prefix}-presets-panel [data-preset-replace]`).forEach(u=>{u.addEventListener("click",()=>{const l=Number(u.dataset.presetReplace??"-1"),h=a==null?void 0:a[l];if(!h)return;const g=De(e,h),b=String((h.metadata??{}).name||h.name||"preset");if(!g.compatible&&!s("preset",b,g.detail))return;const y=h.data??{};t(y,void 0,"replace"),A(e.prefix,"presets",!1),_(e.prefix,`Replaced current values with preset: ${b}.`,"success")})})};return{bindHistoryPanel:i,bindRecipePanel:r,openHistoryPanel:n,openRecipePanel:c,openPresetPanel:async()=>{var u;if(!a)try{const l=await wt();a=Zs(e,((u=l.data)==null?void 0:u.presets)??[])}catch(l){_(e.prefix,l instanceof Error?l.message:"Failed to load presets.","error");return}p(),A(e.prefix,"presets",!0)}}}async function gn(e){var c,p,d,u;const t=Qi(e.prefix),[a,s]=await Promise.allSettled([ze(),xt()]);if(s.status==="fulfilled"){const l=((c=s.value.data)==null?void 0:c.cards)??[],h=(p=s.value.data)==null?void 0:p.xformers;As(`${e.prefix}-gpu-selector`,l),m(`${e.prefix}-runtime-title`,`${l.length} GPU entries reachable`),f(`${e.prefix}-runtime-body`,`
        <p>${o(At(l))}</p>
        <p>${o(h?`xformers: ${h.installed?"installed":"missing"}, ${h.supported?"supported":"fallback"} (${h.reason})`:"xformers info unavailable")}</p>
      `)}else m(`${e.prefix}-runtime-title`,"GPU runtime request failed"),m(`${e.prefix}-runtime-body`,s.reason instanceof Error?s.reason.message:"Unknown error");if(a.status!=="fulfilled")return m(t.summaryId,`${e.modelLabel} schema request failed`),f(t.sectionsId,`<p>${a.reason instanceof Error?o(a.reason.message):"Unknown error"}</p>`),K(t.previewId,"{}"),I(e.prefix,"Schema unavailable",`The ${e.modelLabel} training bridge could not load the backend schema.`,"error"),null;const i=((d=a.value.data)==null?void 0:d.schemas)??[],n=jt(i),r=(u=_e(n).find(l=>l.name===e.schemaName))==null?void 0:u.name;return r?{domIds:t,createDefaultState:()=>me(n,r)}:(m(t.summaryId,`No ${e.schemaName} schema was returned.`),f(t.sectionsId,`<p>The backend did not expose ${o(e.schemaName)}.</p>`),I(e.prefix,"Schema missing",`The backend did not expose the ${e.schemaName} schema.`,"error"),null)}const kt={};function fn(e,t){const a=Gt(t),s=Xe(`${e}-gpu-selector`);s.length>0&&(a.gpu_ids=s);const i=Ze(a);return{payload:i,checks:Us(i)}}function Zt(e){return new Set(e.sections.flatMap(t=>t.fields.map(a=>a.path)))}function Qt(e,t){const a=Zt(e),s={...e.values};for(const[i,n]of Object.entries(t))a.has(i)&&(s[i]=n);return{...e,values:s}}function bn(e,t){return{...e,values:{...e.values,...Object.fromEntries(Object.entries(t).filter(([a])=>Zt(e).has(a)))}}}function yn(e,t){return t&&t.length>0?t.map(a=>String(a)):Array.isArray(e.gpu_ids)?e.gpu_ids.map(a=>String(a)):[]}function vn(e,t){const a={time:new Date().toLocaleString(),name:se(e,t),value:W(t.values),gpu_ids:Xe(`${e.prefix}-gpu-selector`)};Va(e.routeId,a),Je(e.prefix,a)}function _n(e){const{config:t,createDefaultState:a,mountTrainingState:s}=e,i=Nt(t.routeId);Je(t.prefix,i);const n=i!=null&&i.value?Qt(a(),Yt(i.value)):a();(i==null?void 0:i.gpu_ids)!==void 0&&Ke(t.prefix,i.gpu_ids),s(n),i!=null&&i.value&&_(t.prefix,"Restored autosaved parameters for this route.","success")}function kn(e,t,a,s,i){return n=>{try{const r=a(n),c=Object.fromEntries(Object.entries(r.payload).sort(([p],[d])=>p.localeCompare(d)));K(t.previewId,JSON.stringify(c,null,2)),ge(e.prefix,r.checks)}catch(r){K(t.previewId,"{}"),ge(e.prefix,{warnings:[],errors:[]},r instanceof Error?r.message:"The current state could not be converted into a launch payload.")}s(n),i==null||i()}}function wn(e,t,a){const s=()=>kt[e.routeId],i=d=>fn(e.prefix,d),n=kn(e,t,i,d=>vn(e,d),()=>be(e.prefix)),r=d=>{te(d,t,u=>{kt[e.routeId]=u},n)};return{getCurrentState:s,prepareTrainingPayload:i,onStateChange:n,mountTrainingState:r,applyEditableRecord:(d,u,l="replace")=>{const h=l==="merge"?s()??a():a(),g=Yt(d),b=l==="merge"?bn(h,g):Qt(h,g);Ke(e.prefix,yn(g,u)),r(b)},restoreAutosave:()=>_n({config:e,createDefaultState:a,mountTrainingState:r})}}async function $n(e){const t=await gn(e);if(!t)return;const a=wn(e,t.domIds,t.createDefaultState),s=mn(e,a.applyEditableRecord);a.restoreAutosave(),hn({config:e,createDefaultState:t.createDefaultState,getCurrentState:a.getCurrentState,mountTrainingState:a.mountTrainingState,onStateChange:a.onStateChange,applyEditableRecord:a.applyEditableRecord,buildPreparedTrainingPayload:a.prepareTrainingPayload,bindHistoryPanel:s.bindHistoryPanel,bindRecipePanel:s.bindRecipePanel,openHistoryPanel:s.openHistoryPanel,openRecipePanel:s.openRecipePanel,openPresetPanel:s.openPresetPanel}),I(e.prefix,`${e.modelLabel} bridge ready`,"You can review the generated payload and submit the current config to /api/run.","success"),A(e.prefix,"history",!1),A(e.prefix,"recipes",!1),A(e.prefix,"presets",!1)}const xn={overview:Wt,about:as,settings:ks,tasks:$s,tageditor:ws,tensorboard:xs,tools:Ss,"schema-bridge":ps,"sdxl-train":_s,"flux-train":ls,"sd3-train":ms,"sd3-finetune-train":hs,"dreambooth-train":ns,"flux-finetune-train":os,"sd-controlnet-train":gs,"sdxl-controlnet-train":bs,"flux-controlnet-train":rs,"sdxl-lllite-train":ys,"sd-ti-train":fs,"xti-train":Ls,"sdxl-ti-train":vs,"anima-train":ss,"anima-finetune-train":is,"lumina-train":ds,"lumina-finetune-train":us,"hunyuan-image-train":cs};function Sn(e){const t={overview:H.filter(a=>a.section==="overview"),phase1:H.filter(a=>a.section==="phase1"),reference:H.filter(a=>a.section==="reference")};return`
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
  `}function Se(e,t,a,s){return`
    <a class="nav-link ${e===s?"is-active":""}" href="${e}">
      <span>${t}</span>
      <small>${a}</small>
    </a>
  `}async function Tn(e){e==="overview"?await Ga():e==="settings"?await yi():e==="tasks"?await Di():e==="tageditor"?await ki():e==="tools"?await wi():e==="schema-bridge"?await es(()=>{}):Le[e]&&await $n(Le[e])}async function Ln(e){Oa();const t=za(),a=xn[t.id]??Wt;e.innerHTML=ts(t.hash,a());const s=document.querySelector("#side-nav");s&&(s.innerHTML=Sn(t.hash)),await Tn(t.id)}const ea=document.querySelector("#app");if(!(ea instanceof HTMLElement))throw new Error("App root not found.");const An=ea;async function ta(){await Ln(An)}window.addEventListener("hashchange",()=>{ta()});ta();
