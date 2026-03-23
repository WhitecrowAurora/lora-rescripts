var qt=Object.defineProperty;var Ft=(e,t,a)=>t in e?qt(e,t,{enumerable:!0,configurable:!0,writable:!0,value:a}):e[t]=a;var x=(e,t,a)=>Ft(e,typeof t!="symbol"?t+"":t,a);(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))n(s);new MutationObserver(s=>{for(const i of s)if(i.type==="childList")for(const r of i.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&n(r)}).observe(document,{childList:!0,subtree:!0});function a(s){const i={};return s.integrity&&(i.integrity=s.integrity),s.referrerPolicy&&(i.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?i.credentials="include":s.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function n(s){if(s.ep)return;s.ep=!0;const i=a(s);fetch(s.href,i)}})();const Se="".replace(/\/$/,"");async function P(e){const t=await fetch(`${Se}${e}`,{headers:{Accept:"application/json"}});if(!t.ok)throw new Error(`${t.status} ${t.statusText}`);return await t.json()}async function N(e,t){const a=await fetch(`${Se}${e}`,{method:"POST",headers:{Accept:"application/json","Content-Type":"application/json"},body:JSON.stringify(t)});if(!a.ok)throw new Error(`${a.status} ${a.statusText}`);return await a.json()}async function jt(e){const t=await fetch(`${Se}${e}`,{headers:{Accept:"application/json"}});if(!t.ok)throw new Error(`${t.status} ${t.statusText}`);return await t.json()}async function Ot(){return P("/api/schemas/hashes")}async function Te(){return P("/api/schemas/all")}async function pt(){return P("/api/presets")}async function Ht(){return P("/api/config/saved_params")}async function Mt(){return P("/api/config/summary")}async function Le(){return P("/api/tasks")}async function ut(e){return P(`/api/tasks/terminate/${e}`)}async function dt(){return P("/api/graphic_cards")}async function ht(){return jt("/api/tageditor_status")}async function zt(){return P("/api/scripts")}async function Ut(e){return N("/api/dataset/analyze",e)}async function Xt(e){return N("/api/dataset/masked_loss_audit",e)}async function Wt(){return P("/api/interrogators")}async function O(e){var a;const t=await P(`/api/pick_file?picker_type=${encodeURIComponent(e)}`);if(t.status!=="success"||!((a=t.data)!=null&&a.path))throw new Error(t.message||"File picker did not return a path.");return t.data.path}async function Vt(e){return N("/api/interrogate",e)}async function Gt(e){return N("/api/captions/cleanup/preview",e)}async function Kt(e){return N("/api/captions/cleanup/apply",e)}async function Jt(e){return N("/api/captions/backups/create",e)}async function Yt(e){return N("/api/captions/backups/list",e)}async function Zt(e){return N("/api/captions/backups/restore",e)}async function Qt(e){return N("/api/run",e)}async function ea(e){return N("/api/train/preflight",e)}async function ta(e){return N("/api/train/sample_prompt",e)}function h(e,t){const a=document.querySelector(`#${e}`);a&&(a.textContent=t)}function f(e,t){const a=document.querySelector(`#${e}`);a&&(a.innerHTML=t)}function U(e,t){const a=document.querySelector(`#${e}`);a&&(a.textContent=t)}const mt=[{route:"index.html",title:"SD-reScripts | SD training UI",section:"core",status:"migrate-first",notes:"Landing page and main navigation entry. Good first candidate for source migration."},{route:"lora/index.html",title:"LoRA training index",section:"training",status:"migrate-first",notes:"Top-level training model selector page.",schemaHints:["shared"]},{route:"lora/sdxl.html",title:"SDXL LoRA training",section:"training",status:"migrate-first",notes:"Primary training page currently used most often.",schemaHints:["sdxl-lora","shared"]},{route:"lora/flux.html",title:"Flux LoRA training",section:"training",status:"migrate-first",notes:"Now mirrored by the shared source-side training bridge.",schemaHints:["flux-lora","shared"]},{route:"lora/sd3.html",title:"SD3 training",section:"training",status:"migrate-first",notes:"Now mirrored by the shared source-side training bridge.",schemaHints:["sd3-lora","shared"]},{route:"lora/controlnet.html",title:"SD ControlNet training",section:"training",status:"migrate-first",notes:"Now mirrored by the shared source-side training bridge.",schemaHints:["sd-controlnet","shared"]},{route:"lora/sdxl-controlnet.html",title:"SDXL ControlNet training",section:"training",status:"migrate-first",notes:"Now mirrored by the shared source-side training bridge.",schemaHints:["sdxl-controlnet","shared"]},{route:"lora/sdxl-lllite.html",title:"SDXL LLLite training",section:"training",status:"migrate-first",notes:"Specialized SDXL conditioning route now mirrored by the shared source-side bridge.",schemaHints:["sdxl-controlnet-lllite","shared"]},{route:"lora/flux-controlnet.html",title:"Flux ControlNet training",section:"training",status:"migrate-first",notes:"Now mirrored by the shared source-side training bridge.",schemaHints:["flux-controlnet","shared"]},{route:"lora/basic.html",title:"LoRA basic mode",section:"training",status:"legacy-dist",notes:"Legacy beginner-mode training route.",schemaHints:["lora-basic","shared"]},{route:"lora/master.html",title:"LoRA expert mode",section:"training",status:"legacy-dist",notes:"Legacy expert-mode training route.",schemaHints:["lora-master","shared"]},{route:"lora/params.html",title:"Training parameter reference",section:"training",status:"migrate-first",notes:"Mostly explanatory UI. Lower risk to recreate cleanly."},{route:"lora/tools.html",title:"LoRA tools",section:"tools",status:"migrate-first",notes:"Tool launcher route for merge, resize, interrogate and conversion flows."},{route:"dreambooth/index.html",title:"Dreambooth training",section:"training",status:"migrate-first",notes:"Now mirrored by the shared source-side training bridge for Dreambooth and SDXL full finetune.",schemaHints:["dreambooth","shared"]},{route:"tagger.html",title:"Tagger tool",section:"tools",status:"migrate-first",notes:"Standalone caption/tag generation route that talks to backend APIs.",schemaHints:["tagger"]},{route:"tageditor.html",title:"Tag editor proxy page",section:"tools",status:"migrate-first",notes:"Wrapper page with progress/failure states. Good candidate to reimplement cleanly."},{route:"task.html",title:"Task monitor",section:"system",status:"migrate-first",notes:"Task status page backed by /api/tasks."},{route:"tensorboard.html",title:"TensorBoard proxy page",section:"system",status:"migrate-first",notes:"Wrapper/proxy page. Safer than schema-heavy form routes."},{route:"other/settings.html",title:"Settings page",section:"system",status:"migrate-first",notes:"Static/system page that should be easy to recreate in source form."},{route:"other/about.html",title:"About page",section:"core",status:"migrate-first",notes:"Mostly branding and release notes. Best low-risk migration target."},{route:"404.html",title:"Fallback page",section:"core",status:"legacy-dist",notes:"Can be replaced after the main router is rebuilt."}];function o(e){return String(e).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;")}function H(e){return JSON.parse(JSON.stringify(e))}function ge(e=new Date){return e.toISOString().replaceAll(":","-").replaceAll(".","-")}function aa(e){if(e.length===0){f("schema-browser","<p>No schemas returned.</p>");return}const t=e.map(a=>{var s;const n=((s=a.schema.split(/\r?\n/).find(i=>i.trim().length>0))==null?void 0:s.trim())||"No preview available.";return`
        <article class="schema-card">
          <div class="schema-head">
            <h3>${o(a.name)}</h3>
            <span class="schema-hash">${o(a.hash.slice(0,8))}</span>
          </div>
          <p>${o(n)}</p>
        </article>
      `}).join("");f("schema-browser",t)}function sa(e){const t=new Set(mt.flatMap(i=>i.schemaHints??[])),a=new Set(e.map(i=>i.name)),n=[...t].filter(i=>a.has(i)).sort(),s=e.map(i=>i.name).filter(i=>!t.has(i)).sort();f("schema-mapped",n.length?n.map(i=>`<span class="coverage-pill">${o(i)}</span>`).join(""):"<p>No mapped schema hints yet.</p>"),f("schema-unmapped",s.length?s.map(i=>`<span class="coverage-pill coverage-pill-muted">${o(i)}</span>`).join(""):"<p>All schemas are represented in the current route hints.</p>")}function na(e){if(!e.length){f("training-catalog","<p>No training routes were registered.</p>");return}const t=e.length,a=e.filter(l=>l.schemaAvailable).length,n=e.filter(l=>l.presetCount>0).length,s=e.filter(l=>l.localHistoryCount>0).length,i=e.filter(l=>l.localRecipeCount>0).length,r=e.filter(l=>l.autosaveReady).length,c=new Map,d=new Map;for(const l of e){c.set(l.family,(c.get(l.family)??0)+1);for(const m of l.capabilities)d.set(m,(d.get(m)??0)+1)}const p=`
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
        <strong class="dataset-analysis-stat-value">${i}</strong>
      </article>
      <article class="dataset-analysis-stat">
        <span class="metric-label">History-covered</span>
        <strong class="dataset-analysis-stat-value">${s}</strong>
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
      ${[...d.entries()].sort((l,m)=>m[1]-l[1]||l[0].localeCompare(m[0])).map(([l,m])=>`<span class="coverage-pill">${o(l)} <strong>${m}</strong></span>`).join("")}
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
            ${l.capabilities.map(m=>`<span class="coverage-pill coverage-pill-muted">${o(m)}</span>`).join("")}
          </div>
        </article>
      `).join("");f("training-catalog",`
      ${p}
      <div class="training-catalog-grid">${u}</div>
    `)}function ia(e){if(e.length===0){f("task-table-container","<p>No tasks currently tracked.</p>");return}const t=e.map(a=>`
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
    `)}function ra(e){if(e.length===0){f("tools-browser","<p>No scripts returned.</p>");return}const t=e.map(a=>`
        <article class="tool-card">
          <div class="tool-card-head">
            <h3>${o(a.name)}</h3>
            <span class="coverage-pill ${a.category==="networks"?"":"coverage-pill-muted"}">${o(a.category)}</span>
          </div>
          <p>${a.positional_args.length>0?`Positional args: ${a.positional_args.map(n=>`<code>${o(n)}</code>`).join(", ")}`:"No positional args required."}</p>
        </article>
      `).join("");f("tools-browser",t)}function oa(e){const t=[{label:"Images",value:e.summary.image_count},{label:"Effective images",value:e.summary.effective_image_count},{label:"Alpha-capable candidates",value:e.summary.alpha_capable_image_count},{label:"Caption coverage",value:ee(e.summary.caption_coverage)},{label:"Unique tags",value:e.summary.unique_tag_count},{label:"Caption files",value:e.summary.caption_file_count},{label:"Avg tags / caption",value:e.summary.average_tags_per_caption.toFixed(2)}],a=e.warnings.length?`
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
                  ${ee(s.caption_coverage)}
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
          `).join(""):"<p>No dataset folder summary returned.</p>";f("dataset-analysis-results",`
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
          ${gt(e.top_tags,"No caption tags found yet.")}
        </article>
        <article class="dataset-analysis-block">
          <p class="panel-kicker">images</p>
          <h3>Top resolutions</h3>
          ${pe(e.top_resolutions,"No resolution data collected.")}
        </article>
        <article class="dataset-analysis-block">
          <p class="panel-kicker">mix</p>
          <h3>Orientation + formats</h3>
          <div>${pe(e.orientation_counts,"No orientation data.")}</div>
          <div class="dataset-analysis-sublist">${pe(e.image_extensions,"No image extension data.")}</div>
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
    `)}function la(e,t="masked-loss-audit-results"){const a=[{label:"Images",value:e.summary.image_count},{label:"Alpha channel images",value:e.summary.alpha_channel_image_count},{label:"Usable masks",value:e.summary.usable_mask_image_count},{label:"Soft alpha masks",value:e.summary.soft_alpha_image_count},{label:"Binary alpha masks",value:e.summary.binary_alpha_image_count},{label:"Avg masked area",value:ee(e.summary.average_mask_coverage)},{label:"Avg alpha weight",value:ee(e.summary.average_alpha_weight)}],n=e.warnings.length?`
      <article class="dataset-analysis-block dataset-analysis-warning">
        <p class="panel-kicker">warnings</p>
        <ul class="dataset-analysis-list-plain">
          ${e.warnings.map(s=>`<li>${o(s)}</li>`).join("")}
        </ul>
      </article>
    `:"";f(t,`
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
    `)}function ca(e,t="caption-cleanup-results"){const a=[{label:"Caption files",value:e.summary.file_count},{label:"Changed",value:e.summary.changed_file_count},{label:"Unchanged",value:e.summary.unchanged_file_count},{label:"Tag instances removed",value:e.summary.removed_tag_instances},{label:"Tag instances added",value:e.summary.added_tag_instances},{label:"Empty results",value:e.summary.empty_result_count}],n=e.warnings.length?`
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
          `).join(""):"<p>No sample caption changes were captured.</p>";f(t,`
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
          ${gt([e.options.dedupe_tags?{name:"dedupe tags",count:1}:null,e.options.sort_tags?{name:"sort tags",count:1}:null,e.options.use_regex?{name:"regex replace",count:1}:null].filter(Boolean),"No boolean cleanup switches enabled.")}
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
    `)}function pa(e,t,a="caption-backup-results"){if(!e.length){f(a,`
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
          <p>Caption files: <strong>${s.file_count}</strong> · Archive size: <strong>${da(s.archive_size)}</strong></p>
          <p>Extension: <code>${o(s.caption_extension||".txt")}</code> · Recursive: <strong>${s.recursive?"yes":"no"}</strong></p>
        </article>
      `).join("");f(a,`<div class="dataset-analysis-stack">${n}</div>`)}function ua(e,t="caption-backup-results"){const a=e.warnings.length?`
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
    `)}function gt(e,t){return e.length?`
    <div class="coverage-list">
      ${e.map(a=>`<span class="coverage-pill">${o(a.name)} <strong>${a.count}</strong></span>`).join("")}
    </div>
  `:`<p>${o(t)}</p>`}function pe(e,t){return e.length?`
    <ul class="dataset-analysis-list-plain">
      ${e.map(a=>`<li><code>${o(a.name)}</code> <strong>${a.count}</strong></li>`).join("")}
    </ul>
  `:`<p>${o(t)}</p>`}function A(e,t){return e.length?`
    <ul class="dataset-analysis-list-plain">
      ${e.map(a=>`<li><code>${o(a)}</code></li>`).join("")}
    </ul>
  `:`<p>${o(t)}</p>`}function ee(e){return`${(e*100).toFixed(1)}%`}function da(e){return e<1024?`${e} B`:e<1024**2?`${(e/1024).toFixed(1)} KB`:e<1024**3?`${(e/1024**2).toFixed(1)} MB`:`${(e/1024**3).toFixed(2)} GB`}function ft(e){return e.length===0?"No cards reported yet.":e.map((t,a)=>`GPU ${t.index??t.id??a}: ${t.name}`).join(" | ")}function ha(e){if(e.length===0)return"No tasks currently tracked.";const t=e.filter(a=>a.status&&!["FINISHED","TERMINATED","FAILED"].includes(String(a.status))).length;return`${e.length} tracked, ${t} active`}function ma(e){var a;const t=(a=e.detail)==null?void 0:a.trim();return t?`${e.status} - ${t}`:e.status}const F="#/workspace",j=[{id:"overview",label:"Workspace",section:"overview",hash:F,description:"Source migration dashboard and live backend diagnostics."},{id:"about",label:"About",section:"phase1",hash:"#/about",description:"Rebuild branding and release notes in source form."},{id:"settings",label:"Settings",section:"phase1",hash:"#/settings",description:"Read config summary and saved parameter state from the backend."},{id:"tasks",label:"Tasks",section:"phase1",hash:"#/tasks",description:"Inspect and manage task execution state."},{id:"tageditor",label:"Tag Editor",section:"phase1",hash:"#/tageditor",description:"Track startup status and future proxy behavior."},{id:"tensorboard",label:"TensorBoard",section:"phase1",hash:"#/tensorboard",description:"Prepare a cleaner source-side wrapper for TensorBoard access."},{id:"tools",label:"Tools",section:"phase1",hash:"#/tools",description:"Migrate script-launch and utility entry points from the legacy tools page."},{id:"schema-bridge",label:"Schema Bridge",section:"reference",hash:"#/schema-bridge",description:"Evaluate current schema DSL into a source-side explorer and prototype form renderer."},{id:"sdxl-train",label:"SDXL Train",section:"reference",hash:"#/sdxl-train",description:"First source-side training page powered by the schema bridge and current `/api/run` backend."},{id:"flux-train",label:"Flux Train",section:"reference",hash:"#/flux-train",description:"Source-side Flux LoRA training route built on the shared schema bridge and launch pipeline."},{id:"sd3-train",label:"SD3 Train",section:"reference",hash:"#/sd3-train",description:"Source-side SD3 LoRA training route using the same normalized payload workflow."},{id:"sd3-finetune-train",label:"SD3 Finetune",section:"reference",hash:"#/sd3-finetune-train",description:"Source-side SD3 finetune route on the shared training bridge."},{id:"dreambooth-train",label:"Dreambooth",section:"reference",hash:"#/dreambooth-train",description:"Source-side Dreambooth and SDXL full-finetune route on the shared schema bridge."},{id:"flux-finetune-train",label:"Flux Finetune",section:"reference",hash:"#/flux-finetune-train",description:"Source-side Flux full-finetune route using the shared launch workflow."},{id:"sd-controlnet-train",label:"SD ControlNet",section:"reference",hash:"#/sd-controlnet-train",description:"Source-side SD ControlNet training route using the shared launch flow."},{id:"sdxl-controlnet-train",label:"SDXL ControlNet",section:"reference",hash:"#/sdxl-controlnet-train",description:"Source-side SDXL ControlNet training route using the shared launch flow."},{id:"flux-controlnet-train",label:"Flux ControlNet",section:"reference",hash:"#/flux-controlnet-train",description:"Source-side Flux ControlNet training route using the shared launch flow."},{id:"sdxl-lllite-train",label:"SDXL LLLite",section:"reference",hash:"#/sdxl-lllite-train",description:"Source-side SDXL ControlNet-LLLite training route on the shared training bridge."},{id:"sd-ti-train",label:"SD TI",section:"reference",hash:"#/sd-ti-train",description:"Source-side SD textual inversion route on the shared training bridge."},{id:"xti-train",label:"SD XTI",section:"reference",hash:"#/xti-train",description:"Source-side SD XTI textual inversion route on the shared training bridge."},{id:"sdxl-ti-train",label:"SDXL TI",section:"reference",hash:"#/sdxl-ti-train",description:"Source-side SDXL textual inversion route on the shared training bridge."},{id:"anima-train",label:"Anima LoRA",section:"reference",hash:"#/anima-train",description:"Source-side Anima LoRA training route using the shared launch flow."},{id:"anima-finetune-train",label:"Anima Finetune",section:"reference",hash:"#/anima-finetune-train",description:"Source-side Anima finetune route using the shared launch flow."},{id:"lumina-train",label:"Lumina LoRA",section:"reference",hash:"#/lumina-train",description:"Source-side Lumina LoRA training route using the shared launch flow."},{id:"lumina-finetune-train",label:"Lumina Finetune",section:"reference",hash:"#/lumina-finetune-train",description:"Source-side Lumina finetune route using the shared launch flow."},{id:"hunyuan-image-train",label:"Hunyuan Image",section:"reference",hash:"#/hunyuan-image-train",description:"Source-side Hunyuan Image LoRA training route using the shared launch flow."}],bt=new Set(j.map(e=>e.hash)),yt={"/index.html":F,"/index.md":F,"/404.html":F,"/404.md":F,"/task.html":"#/tasks","/task.md":"#/tasks","/tageditor.html":"#/tageditor","/tageditor.md":"#/tageditor","/tagger.html":"#/tageditor","/tagger.md":"#/tageditor","/tensorboard.html":"#/tensorboard","/tensorboard.md":"#/tensorboard","/other/about.html":"#/about","/other/about.md":"#/about","/other/settings.html":"#/settings","/other/settings.md":"#/settings","/dreambooth/index.html":"#/dreambooth-train","/dreambooth/index.md":"#/dreambooth-train","/lora/index.html":"#/sdxl-train","/lora/index.md":"#/sdxl-train"},ga=Object.keys(yt).sort((e,t)=>t.length-e.length);function Ie(e){const t=e.replace(/\/+$/,"");return t.length>0?`${t}/`:"/"}function fa(e){switch(e){case"flux":return"#/flux-train";case"flux-finetune":return"#/flux-finetune-train";case"sd3":return"#/sd3-train";case"sd3-finetune":return"#/sd3-finetune-train";case"controlnet":return"#/sd-controlnet-train";case"sdxl-controlnet":return"#/sdxl-controlnet-train";case"flux-controlnet":return"#/flux-controlnet-train";case"sdxl-lllite":return"#/sdxl-lllite-train";case"tools":return"#/tools";case"basic":case"master":case"params":case"sdxl":return"#/sdxl-train";case"sdxl-ti":return"#/sdxl-ti-train";case"ti":return"#/sd-ti-train";case"xti":return"#/xti-train";case"anima":return"#/anima-train";case"anima-finetune":return"#/anima-finetune-train";case"hunyuan":return"#/hunyuan-image-train";case"lumina":return"#/lumina-train";case"lumina-finetune":return"#/lumina-finetune-train";default:return null}}function ba(e){const t=e.match(/^(.*)\/lora\/([^/]+)\.(?:html|md)$/i);if(!t)return null;const[,a,n]=t,s=fa(n.toLowerCase());return s?{hash:s,canonicalRootPath:Ie(a)}:null}function ya(e){const t=e.toLowerCase();for(const a of ga)if(t.endsWith(a))return{hash:yt[a],canonicalRootPath:Ie(e.slice(0,e.length-a.length))};return ba(e)}function He(e,t){const a=`${e}${window.location.search}${t}`,n=`${window.location.pathname}${window.location.search}${window.location.hash}`;a!==n&&window.history.replaceState(null,"",a)}function va(){const e=bt.has(window.location.hash)?window.location.hash:F;return j.find(t=>t.hash===e)??j[0]}function ka(){if(bt.has(window.location.hash))return;const e=ya(window.location.pathname);if(e){He(e.canonicalRootPath,e.hash);return}He(Ie(window.location.pathname||"/"),F)}const fe={"sdxl-train":{routeId:"sdxl-train",schemaName:"sdxl-lora",prefix:"sdxl",modelLabel:"SDXL",presetTrainTypes:["sdxl-lora"]},"flux-train":{routeId:"flux-train",schemaName:"flux-lora",prefix:"flux",modelLabel:"Flux",presetTrainTypes:["flux-lora"]},"sd3-train":{routeId:"sd3-train",schemaName:"sd3-lora",prefix:"sd3",modelLabel:"SD3",presetTrainTypes:["sd3-lora"]},"sd3-finetune-train":{routeId:"sd3-finetune-train",schemaName:"sd3-finetune",prefix:"sd3-finetune",modelLabel:"SD3 Finetune",presetTrainTypes:["sd3-finetune"]},"dreambooth-train":{routeId:"dreambooth-train",schemaName:"dreambooth",prefix:"dreambooth",modelLabel:"Dreambooth",presetTrainTypes:["dreambooth","sd-dreambooth","sdxl-finetune"]},"flux-finetune-train":{routeId:"flux-finetune-train",schemaName:"flux-finetune",prefix:"flux-finetune",modelLabel:"Flux Finetune",presetTrainTypes:["flux-finetune"]},"sd-controlnet-train":{routeId:"sd-controlnet-train",schemaName:"sd-controlnet",prefix:"sd-controlnet",modelLabel:"SD ControlNet",presetTrainTypes:["sd-controlnet"]},"sdxl-controlnet-train":{routeId:"sdxl-controlnet-train",schemaName:"sdxl-controlnet",prefix:"sdxl-controlnet",modelLabel:"SDXL ControlNet",presetTrainTypes:["sdxl-controlnet"]},"flux-controlnet-train":{routeId:"flux-controlnet-train",schemaName:"flux-controlnet",prefix:"flux-controlnet",modelLabel:"Flux ControlNet",presetTrainTypes:["flux-controlnet"]},"sdxl-lllite-train":{routeId:"sdxl-lllite-train",schemaName:"sdxl-controlnet-lllite",prefix:"sdxl-lllite",modelLabel:"SDXL LLLite",presetTrainTypes:["sdxl-controlnet-lllite"]},"sd-ti-train":{routeId:"sd-ti-train",schemaName:"sd-textual-inversion",prefix:"sd-ti",modelLabel:"SD Textual Inversion",presetTrainTypes:["sd-textual-inversion"]},"xti-train":{routeId:"xti-train",schemaName:"sd-textual-inversion-xti",prefix:"xti",modelLabel:"SD XTI",presetTrainTypes:["sd-textual-inversion-xti"]},"sdxl-ti-train":{routeId:"sdxl-ti-train",schemaName:"sdxl-textual-inversion",prefix:"sdxl-ti",modelLabel:"SDXL Textual Inversion",presetTrainTypes:["sdxl-textual-inversion"]},"anima-train":{routeId:"anima-train",schemaName:"anima-lora",prefix:"anima",modelLabel:"Anima LoRA",presetTrainTypes:["anima-lora"]},"anima-finetune-train":{routeId:"anima-finetune-train",schemaName:"anima-finetune",prefix:"anima-finetune",modelLabel:"Anima Finetune",presetTrainTypes:["anima-finetune"]},"lumina-train":{routeId:"lumina-train",schemaName:"lumina-lora",prefix:"lumina",modelLabel:"Lumina LoRA",presetTrainTypes:["lumina-lora"]},"lumina-finetune-train":{routeId:"lumina-finetune-train",schemaName:"lumina-finetune",prefix:"lumina-finetune",modelLabel:"Lumina Finetune",presetTrainTypes:["lumina-finetune"]},"hunyuan-image-train":{routeId:"hunyuan-image-train",schemaName:"hunyuan-image-lora",prefix:"hunyuan-image",modelLabel:"Hunyuan Image LoRA",presetTrainTypes:["hunyuan-image-lora"]}},_a=80,$a=100;function le(){return typeof window<"u"?window:null}function Ae(e,t){const a=le();if(!a)return t;try{const n=a.localStorage.getItem(e);return n?JSON.parse(n):t}catch{return t}}function Ee(e,t){const a=le();a&&a.localStorage.setItem(e,JSON.stringify(t))}function wa(e){const t=le();t&&t.localStorage.removeItem(e)}function Pe(e){return`source-training-autosave-${e}`}function vt(e){return`source-training-history-${e}`}function kt(e){return`source-training-recipes-${e}`}function _t(e){return Ae(Pe(e),null)}function xa(e,t){Ee(Pe(e),t)}function Sa(e){wa(Pe(e))}function D(e){return Ae(vt(e),[])}function te(e,t){Ee(vt(e),t)}function E(e){return Ae(kt(e),[])}function V(e,t){Ee(kt(e),t)}function $t(e){return e.slice(0,_a)}function Ne(e){return e.slice(0,$a)}function z(e,t,a="text/plain;charset=utf-8"){const n=le();if(!n)return;const s=new Blob([t],{type:a}),i=URL.createObjectURL(s),r=n.document.createElement("a");r.href=i,r.download=e,r.click(),URL.revokeObjectURL(i)}async function Ta(){var c,d,p,u,l,m,g,b;const e=await Promise.allSettled([Ot(),pt(),Le(),dt(),ht(),Te()]),[t,a,n,s,i,r]=e;if(t.status==="fulfilled"){const y=((c=t.value.data)==null?void 0:c.schemas)??[];h("diag-schemas-title",`${y.length} schema hashes loaded`),h("diag-schemas-detail",y.slice(0,4).map(S=>S.name).join(", ")||"No schema names returned.")}else h("diag-schemas-title","Schema hash request failed"),h("diag-schemas-detail",t.reason instanceof Error?t.reason.message:"Unknown error");if(a.status==="fulfilled"){const y=((d=a.value.data)==null?void 0:d.presets)??[];h("diag-presets-title",`${y.length} presets loaded`),h("diag-presets-detail","Source migration can reuse preset grouping later.")}else h("diag-presets-title","Preset request failed"),h("diag-presets-detail",a.reason instanceof Error?a.reason.message:"Unknown error");if(n.status==="fulfilled"){const y=((p=n.value.data)==null?void 0:p.tasks)??[];h("diag-tasks-title","Task manager reachable"),h("diag-tasks-detail",ha(y))}else h("diag-tasks-title","Task request failed"),h("diag-tasks-detail",n.reason instanceof Error?n.reason.message:"Unknown error");if(s.status==="fulfilled"){const y=((u=s.value.data)==null?void 0:u.cards)??[],S=(l=s.value.data)==null?void 0:l.xformers,B=S?`xformers: ${S.installed?"installed":"missing"}, ${S.supported?"supported":"fallback"}`:"xformers info unavailable";h("diag-gpu-title",`${y.length} GPU entries reachable`),h("diag-gpu-detail",`${ft(y)} | ${B}`)}else h("diag-gpu-title","GPU request failed"),h("diag-gpu-detail",s.reason instanceof Error?s.reason.message:"Unknown error");if(i.status==="fulfilled"?(h("diag-tageditor-title","Tag editor status reachable"),h("diag-tageditor-detail",ma(i.value))):(h("diag-tageditor-title","Tag editor status request failed"),h("diag-tageditor-detail",i.reason instanceof Error?i.reason.message:"Unknown error")),r.status==="fulfilled"){const y=((m=r.value.data)==null?void 0:m.schemas)??[];aa(y),sa(y),Me(y,a.status==="fulfilled"?((g=a.value.data)==null?void 0:g.presets)??[]:[])}else f("schema-browser",`<p>${r.reason instanceof Error?r.reason.message:"Schema inventory request failed."}</p>`),Me([],a.status==="fulfilled"?((b=a.value.data)==null?void 0:b.presets)??[]:[])}function La(e){return e.includes("controlnet")?"ControlNet":e.includes("textual-inversion")||e.includes("xti")?"Textual Inversion":e.includes("finetune")||e==="dreambooth"?"Finetune":"LoRA"}function Ia(e,t,a){const n=["preflight","prompt workspace","history","recipes"];return t.includes("resume:")&&n.push("resume"),(t.includes("prompt_file")||t.includes("positive_prompts"))&&n.push("sample prompts"),t.includes("validation_split")&&n.push("validation"),t.includes("masked_loss")&&n.push("masked loss"),t.includes("save_state")&&n.push("save state"),t.includes("conditioning_data_dir")&&n.push("conditioning"),a==="Textual Inversion"&&n.push("embeddings"),a==="ControlNet"&&n.push("controlnet"),e.routeId.startsWith("sdxl")&&n.push("experimental clip-skip"),[...new Set(n)]}function Me(e,t){const a=new Map(e.map(s=>[s.name,String(s.schema??"")])),n=Object.values(fe).map(s=>{var m;const i=j.find(g=>g.id===s.routeId),r=La(s.schemaName),c=a.get(s.schemaName)??"",d=t.filter(g=>{const y=(g.metadata??{}).train_type;return typeof y!="string"||y.trim().length===0?!1:s.presetTrainTypes.includes(y)}).length,p=D(s.routeId).length,u=E(s.routeId).length,l=!!((m=_t(s.routeId))!=null&&m.value);return{routeId:s.routeId,title:(i==null?void 0:i.label)??s.modelLabel,routeHash:(i==null?void 0:i.hash)??"#/workspace",schemaName:s.schemaName,modelLabel:s.modelLabel,family:r,presetCount:d,localHistoryCount:p,localRecipeCount:u,autosaveReady:l,schemaAvailable:a.has(s.schemaName),capabilities:Ia(s,c,r)}}).sort((s,i)=>s.family.localeCompare(i.family)||s.title.localeCompare(i.title));na(n)}async function Aa(){const[e,t]=await Promise.allSettled([Mt(),Ht()]);if(e.status==="fulfilled"){const a=e.value.data;h("settings-summary-title",`${(a==null?void 0:a.saved_param_count)??0} remembered param groups`),f("settings-summary-body",`
        <p><strong>Config file:</strong> <code>${o((a==null?void 0:a.config_path)??"unknown")}</code></p>
        <p><strong>Last path:</strong> <code>${o((a==null?void 0:a.last_path)||"(empty)")}</code></p>
        <p><strong>Saved keys:</strong> ${((a==null?void 0:a.saved_param_keys)??[]).map(n=>`<code>${o(n)}</code>`).join(", ")||"none"}</p>
      `)}else h("settings-summary-title","Config summary request failed"),h("settings-summary-body",e.reason instanceof Error?e.reason.message:"Unknown error");if(t.status==="fulfilled"){const a=t.value.data??{},n=Object.keys(a);h("settings-params-title",`${n.length} saved param entries`),f("settings-params-body",n.length?`<div class="coverage-list">${n.map(s=>`<span class="coverage-pill coverage-pill-muted">${o(s)}</span>`).join("")}</div>`:"<p>No saved params returned.</p>")}else h("settings-params-title","Saved params request failed"),h("settings-params-body",t.reason instanceof Error?t.reason.message:"Unknown error")}const Ea="".replace(/\/$/,""),Pa=Ea||"";function R(e){return/^https?:\/\//.test(e)?e:(e.startsWith("/")||(e=`/${e}`),`${Pa}${e}`)}async function Na(){try{const e=await ht();h("tag-editor-status-title",`Current status: ${e.status}`),f("tag-editor-status-body",`
        <p>${o(e.detail||"No extra detail returned.")}</p>
        <p><a class="text-link" href="${R("/tageditor.html")}" target="_blank" rel="noreferrer">Open current shipped wrapper page</a></p>
      `)}catch(e){h("tag-editor-status-title","Tag editor status request failed"),h("tag-editor-status-body",e instanceof Error?e.message:"Unknown error")}}async function Ra(){var e;Da(),Ca(),await Ba(),qa(),Fa();try{const a=((e=(await zt()).data)==null?void 0:e.scripts)??[];h("tools-summary-title",`${a.length} launcher scripts available`),f("tools-summary-body",`
        <p>Categories: ${[...new Set(a.map(n=>n.category))].map(n=>`<code>${o(n)}</code>`).join(", ")}</p>
        <p>The tools workspace now includes dataset analysis, masked-loss alpha inspection, batch auto-tagging, caption cleanup, and caption restore snapshots, with more curated high-frequency flows still planned.</p>
      `),ra(a)}catch(t){h("tools-summary-title","Script inventory request failed"),h("tools-summary-body",t instanceof Error?t.message:"Unknown error"),f("tools-browser","<p>Tool inventory failed to load.</p>")}}function Ca(){const e=Oa();e&&(e.browseButton.addEventListener("click",async()=>{h("masked-loss-audit-status","Opening folder picker...");try{e.pathInput.value=await O("folder"),h("masked-loss-audit-status","Folder selected. Ready to inspect alpha masks.")}catch(t){h("masked-loss-audit-status",t instanceof Error?t.message:"Folder picker failed.")}}),e.runButton.addEventListener("click",()=>{Ue(e)}),e.pathInput.addEventListener("keydown",t=>{t.key==="Enter"&&(t.preventDefault(),Ue(e))}))}function Da(){const e=ja();e&&(e.browseButton.addEventListener("click",async()=>{h("dataset-analysis-status","Opening folder picker...");try{e.pathInput.value=await O("folder"),h("dataset-analysis-status","Folder selected. Ready to analyze.")}catch(t){h("dataset-analysis-status",t instanceof Error?t.message:"Folder picker failed.")}}),e.runButton.addEventListener("click",()=>{ze(e)}),e.pathInput.addEventListener("keydown",t=>{t.key==="Enter"&&(t.preventDefault(),ze(e))}))}async function Ba(){var t;const e=Ha();if(e){e.browseButton.addEventListener("click",async()=>{h("batch-tagger-status","Opening folder picker...");try{e.pathInput.value=await O("folder"),h("batch-tagger-status","Folder selected. Ready to launch batch tagging.")}catch(a){h("batch-tagger-status",a instanceof Error?a.message:"Folder picker failed.")}}),e.runButton.addEventListener("click",()=>{Xe(e)}),e.pathInput.addEventListener("keydown",a=>{a.key==="Enter"&&(a.preventDefault(),Xe(e))});try{const a=await Wt(),n=((t=a.data)==null?void 0:t.interrogators)??[];if(!n.length)throw new Error("No interrogator models returned.");e.modelSelect.innerHTML=n.map(s=>{var c;const i=s.is_default||s.name===((c=a.data)==null?void 0:c.default)?" selected":"",r=s.kind==="cl"?"CL":"WD";return`<option value="${o(s.name)}"${i}>${o(s.name)} (${r})</option>`}).join(""),h("batch-tagger-status",`Loaded ${n.length} interrogator models.`)}catch(a){e.modelSelect.innerHTML='<option value="wd14-convnextv2-v2">wd14-convnextv2-v2 (WD)</option>',h("batch-tagger-status",a instanceof Error?a.message:"Failed to load interrogator inventory."),f("batch-tagger-results",`<article class="dataset-analysis-block dataset-analysis-warning"><p>${o(a instanceof Error?a.message:"Failed to load interrogator inventory.")}</p></article>`)}}}function qa(){const e=Ma();e&&(e.browseButton.addEventListener("click",async()=>{h("caption-cleanup-status","Opening folder picker...");try{e.pathInput.value=await O("folder"),h("caption-cleanup-status","Folder selected. Ready to preview cleanup.")}catch(t){h("caption-cleanup-status",t instanceof Error?t.message:"Folder picker failed.")}}),e.previewButton.addEventListener("click",()=>{ue(e,"preview")}),e.applyButton.addEventListener("click",()=>{ue(e,"apply")}),e.pathInput.addEventListener("keydown",t=>{t.key==="Enter"&&(t.preventDefault(),ue(e,"preview"))}))}function Fa(){const e=za();e&&(e.browseButton.addEventListener("click",async()=>{h("caption-backup-status","Opening folder picker...");try{e.pathInput.value=await O("folder"),h("caption-backup-status","Folder selected. Refreshing snapshots..."),await G(e)}catch(t){h("caption-backup-status",t instanceof Error?t.message:"Folder picker failed.")}}),e.refreshButton.addEventListener("click",()=>{G(e)}),e.createButton.addEventListener("click",()=>{Ua(e)}),e.restoreButton.addEventListener("click",()=>{Xa(e)}),e.selectInput.addEventListener("change",()=>{G(e,e.selectInput.value||null)}))}function ja(){const e=document.querySelector("#dataset-analysis-path"),t=document.querySelector("#dataset-analysis-caption-extension"),a=document.querySelector("#dataset-analysis-top-tags"),n=document.querySelector("#dataset-analysis-sample-limit"),s=document.querySelector("#dataset-analysis-pick"),i=document.querySelector("#dataset-analysis-run");return!e||!t||!a||!n||!s||!i?null:{pathInput:e,captionExtensionInput:t,topTagsInput:a,sampleLimitInput:n,browseButton:s,runButton:i}}function Oa(){const e=document.querySelector("#masked-loss-audit-path"),t=document.querySelector("#masked-loss-audit-sample-limit"),a=document.querySelector("#masked-loss-audit-recursive"),n=document.querySelector("#masked-loss-audit-pick"),s=document.querySelector("#masked-loss-audit-run");return!e||!t||!a||!n||!s?null:{pathInput:e,sampleLimitInput:t,recursiveInput:a,browseButton:n,runButton:s}}function Ha(){const e=document.querySelector("#batch-tagger-path"),t=document.querySelector("#batch-tagger-model"),a=document.querySelector("#batch-tagger-threshold"),n=document.querySelector("#batch-tagger-character-threshold"),s=document.querySelector("#batch-tagger-conflict"),i=document.querySelector("#batch-tagger-additional-tags"),r=document.querySelector("#batch-tagger-backup-name"),c=document.querySelector("#batch-tagger-exclude-tags"),d=document.querySelector("#batch-tagger-recursive"),p=document.querySelector("#batch-tagger-replace-underscore"),u=document.querySelector("#batch-tagger-escape-tag"),l=document.querySelector("#batch-tagger-add-rating-tag"),m=document.querySelector("#batch-tagger-add-model-tag"),g=document.querySelector("#batch-tagger-auto-backup"),b=document.querySelector("#batch-tagger-pick"),y=document.querySelector("#batch-tagger-run");return!e||!t||!a||!n||!s||!i||!r||!c||!d||!p||!u||!l||!m||!g||!b||!y?null:{pathInput:e,modelSelect:t,thresholdInput:a,characterThresholdInput:n,conflictSelect:s,additionalTagsInput:i,backupNameInput:r,excludeTagsInput:c,recursiveInput:d,replaceUnderscoreInput:p,escapeTagInput:u,addRatingTagInput:l,addModelTagInput:m,autoBackupInput:g,browseButton:b,runButton:y}}function Ma(){const e=document.querySelector("#caption-cleanup-path"),t=document.querySelector("#caption-cleanup-extension"),a=document.querySelector("#caption-cleanup-remove-tags"),n=document.querySelector("#caption-cleanup-prepend-tags"),s=document.querySelector("#caption-cleanup-append-tags"),i=document.querySelector("#caption-cleanup-search-text"),r=document.querySelector("#caption-cleanup-replace-text"),c=document.querySelector("#caption-cleanup-backup-name"),d=document.querySelector("#caption-cleanup-sample-limit"),p=document.querySelector("#caption-cleanup-recursive"),u=document.querySelector("#caption-cleanup-collapse-whitespace"),l=document.querySelector("#caption-cleanup-replace-underscore"),m=document.querySelector("#caption-cleanup-dedupe-tags"),g=document.querySelector("#caption-cleanup-sort-tags"),b=document.querySelector("#caption-cleanup-use-regex"),y=document.querySelector("#caption-cleanup-auto-backup"),S=document.querySelector("#caption-cleanup-pick"),B=document.querySelector("#caption-cleanup-preview"),W=document.querySelector("#caption-cleanup-apply");return!e||!t||!a||!n||!s||!i||!r||!c||!d||!p||!u||!l||!m||!g||!b||!y||!S||!B||!W?null:{pathInput:e,extensionInput:t,removeTagsInput:a,prependTagsInput:n,appendTagsInput:s,searchTextInput:i,replaceTextInput:r,backupNameInput:c,sampleLimitInput:d,recursiveInput:p,collapseWhitespaceInput:u,replaceUnderscoreInput:l,dedupeTagsInput:m,sortTagsInput:g,useRegexInput:b,autoBackupInput:y,browseButton:S,previewButton:B,applyButton:W}}function za(){const e=document.querySelector("#caption-backup-path"),t=document.querySelector("#caption-backup-extension"),a=document.querySelector("#caption-backup-name"),n=document.querySelector("#caption-backup-select"),s=document.querySelector("#caption-backup-recursive"),i=document.querySelector("#caption-backup-pre-restore"),r=document.querySelector("#caption-backup-pick"),c=document.querySelector("#caption-backup-create"),d=document.querySelector("#caption-backup-refresh"),p=document.querySelector("#caption-backup-restore");return!e||!t||!a||!n||!s||!i||!r||!c||!d||!p?null:{pathInput:e,extensionInput:t,nameInput:a,selectInput:n,recursiveInput:s,preRestoreInput:i,browseButton:r,createButton:c,refreshButton:d,restoreButton:p}}async function ze(e){const t=e.pathInput.value.trim();if(!t){h("dataset-analysis-status","Pick a dataset folder first."),f("dataset-analysis-results",'<p class="dataset-analysis-empty">No folder selected yet.</p>');return}e.browseButton.disabled=!0,e.runButton.disabled=!0,h("dataset-analysis-status","Analyzing dataset..."),f("dataset-analysis-results",'<p class="dataset-analysis-empty">Scanning images, captions, and tags...</p>');try{const a=await Ut({path:t,caption_extension:e.captionExtensionInput.value.trim()||".txt",top_tags:ae(e.topTagsInput.value,40),sample_limit:ae(e.sampleLimitInput.value,8)});if(a.status!=="success"||!a.data)throw new Error(a.message||"Dataset analysis returned no data.");h("dataset-analysis-status",`Scanned ${a.data.summary.image_count} images across ${a.data.summary.dataset_folder_count} dataset folder(s).`),oa(a.data)}catch(a){h("dataset-analysis-status",a instanceof Error?a.message:"Dataset analysis failed."),f("dataset-analysis-results",`<article class="dataset-analysis-block dataset-analysis-warning"><p>${o(a instanceof Error?a.message:"Dataset analysis failed.")}</p></article>`)}finally{e.browseButton.disabled=!1,e.runButton.disabled=!1}}async function Ue(e){const t=e.pathInput.value.trim();if(!t){h("masked-loss-audit-status","Pick a dataset folder first."),f("masked-loss-audit-results",'<p class="dataset-analysis-empty">No dataset folder selected yet.</p>');return}e.browseButton.disabled=!0,e.runButton.disabled=!0,h("masked-loss-audit-status","Inspecting alpha-channel masks..."),f("masked-loss-audit-results",'<p class="dataset-analysis-empty">Opening images and checking their alpha channels...</p>');try{const a=await Xt({path:t,recursive:e.recursiveInput.checked,sample_limit:ae(e.sampleLimitInput.value,8)});if(a.status!=="success"||!a.data)throw new Error(a.message||"Masked-loss audit returned no data.");h("masked-loss-audit-status",`Inspected ${a.data.summary.image_count} images. Found ${a.data.summary.usable_mask_image_count} image(s) with usable alpha masks.`),la(a.data)}catch(a){h("masked-loss-audit-status",a instanceof Error?a.message:"Masked-loss audit failed."),f("masked-loss-audit-results",`<article class="dataset-analysis-block dataset-analysis-warning"><p>${o(a instanceof Error?a.message:"Masked-loss audit failed.")}</p></article>`)}finally{e.browseButton.disabled=!1,e.runButton.disabled=!1}}async function Xe(e){var a,n,s;const t=e.pathInput.value.trim();if(!t){h("batch-tagger-status","Pick an image folder first."),f("batch-tagger-results",'<p class="dataset-analysis-empty">No image folder selected yet.</p>');return}e.browseButton.disabled=!0,e.runButton.disabled=!0,h("batch-tagger-status","Starting batch tagging..."),f("batch-tagger-results",'<p class="dataset-analysis-empty">Submitting interrogator job to the backend...</p>');try{const i=We(e.thresholdInput.value,.35,0,1),r=We(e.characterThresholdInput.value,.6,0,1),c=await Vt({path:t,interrogator_model:e.modelSelect.value,threshold:i,character_threshold:r,batch_output_action_on_conflict:e.conflictSelect.value,create_backup_before_write:e.autoBackupInput.checked,backup_snapshot_name:e.backupNameInput.value.trim(),additional_tags:e.additionalTagsInput.value.trim(),exclude_tags:e.excludeTagsInput.value.trim(),batch_input_recursive:e.recursiveInput.checked,replace_underscore:e.replaceUnderscoreInput.checked,escape_tag:e.escapeTagInput.checked,add_rating_tag:e.addRatingTagInput.checked,add_model_tag:e.addModelTagInput.checked});if(c.status!=="success")throw new Error(c.message||"Batch tagging failed to start.");h("batch-tagger-status",c.message||"Batch tagging started."),f("batch-tagger-results",`
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
      `)}catch(i){h("batch-tagger-status",i instanceof Error?i.message:"Batch tagging failed."),f("batch-tagger-results",`<article class="dataset-analysis-block dataset-analysis-warning"><p>${o(i instanceof Error?i.message:"Batch tagging failed.")}</p></article>`)}finally{e.browseButton.disabled=!1,e.runButton.disabled=!1}}async function ue(e,t){const a=e.pathInput.value.trim();if(!a){h("caption-cleanup-status","Pick a caption folder first."),f("caption-cleanup-results",'<p class="dataset-analysis-empty">No caption folder selected yet.</p>');return}const n={path:a,caption_extension:e.extensionInput.value.trim()||".txt",recursive:e.recursiveInput.checked,collapse_whitespace:e.collapseWhitespaceInput.checked,replace_underscore:e.replaceUnderscoreInput.checked,dedupe_tags:e.dedupeTagsInput.checked,sort_tags:e.sortTagsInput.checked,remove_tags:e.removeTagsInput.value.trim(),prepend_tags:e.prependTagsInput.value.trim(),append_tags:e.appendTagsInput.value.trim(),search_text:e.searchTextInput.value,replace_text:e.replaceTextInput.value,use_regex:e.useRegexInput.checked,create_backup_before_apply:e.autoBackupInput.checked,backup_snapshot_name:e.backupNameInput.value.trim(),sample_limit:ae(e.sampleLimitInput.value,8)};e.browseButton.disabled=!0,e.previewButton.disabled=!0,e.applyButton.disabled=!0,h("caption-cleanup-status",t==="preview"?"Previewing caption cleanup...":"Applying caption cleanup..."),f("caption-cleanup-results",`<p class="dataset-analysis-empty">${t==="preview"?"Scanning caption files and building sample diffs...":"Writing cleaned captions back to disk..."}</p>`);try{const s=t==="preview"?await Gt(n):await Kt(n);if(s.status!=="success"||!s.data)throw new Error(s.message||`Caption cleanup ${t} failed.`);h("caption-cleanup-status",s.message||(t==="preview"?`Previewed ${s.data.summary.changed_file_count} caption file changes.`:`Applied cleanup to ${s.data.summary.changed_file_count} caption files.`)),ca(s.data)}catch(s){h("caption-cleanup-status",s instanceof Error?s.message:"Caption cleanup failed."),f("caption-cleanup-results",`<article class="dataset-analysis-block dataset-analysis-warning"><p>${o(s instanceof Error?s.message:"Caption cleanup failed.")}</p></article>`)}finally{e.browseButton.disabled=!1,e.previewButton.disabled=!1,e.applyButton.disabled=!1}}async function G(e,t,a=!0){var s,i;const n=e.pathInput.value.trim();if(!n){h("caption-backup-status","Pick a caption folder first."),f("caption-backup-results",'<p class="dataset-analysis-empty">No caption folder selected yet.</p>'),e.selectInput.innerHTML='<option value="">Refresh snapshots for this folder</option>';return}e.browseButton.disabled=!0,e.createButton.disabled=!0,e.refreshButton.disabled=!0,e.restoreButton.disabled=!0,h("caption-backup-status","Loading caption snapshots...");try{const c=((s=(await Yt({path:n})).data)==null?void 0:s.backups)??[],d=e.selectInput.value||(((i=c[0])==null?void 0:i.archive_name)??""),p=t??d;e.selectInput.innerHTML=c.length?c.map(u=>{const l=u.archive_name===p?" selected":"";return`<option value="${o(u.archive_name)}"${l}>${o(u.snapshot_name)} · ${o(u.archive_name)}</option>`}).join(""):'<option value="">No snapshots for this folder yet</option>',c.length&&p&&(e.selectInput.value=p),h("caption-backup-status",c.length?`Loaded ${c.length} caption snapshots.`:"No caption snapshots found for this folder."),a&&pa(c,c.length?p:null)}catch(r){h("caption-backup-status",r instanceof Error?r.message:"Failed to load caption snapshots."),f("caption-backup-results",`<article class="dataset-analysis-block dataset-analysis-warning"><p>${o(r instanceof Error?r.message:"Failed to load caption snapshots.")}</p></article>`)}finally{e.browseButton.disabled=!1,e.createButton.disabled=!1,e.refreshButton.disabled=!1,e.restoreButton.disabled=!1}}async function Ua(e){const t=e.pathInput.value.trim();if(!t){h("caption-backup-status","Pick a caption folder first."),f("caption-backup-results",'<p class="dataset-analysis-empty">No caption folder selected yet.</p>');return}e.browseButton.disabled=!0,e.createButton.disabled=!0,e.refreshButton.disabled=!0,e.restoreButton.disabled=!0,h("caption-backup-status","Creating caption snapshot...");try{const a=await Jt({path:t,caption_extension:e.extensionInput.value.trim()||".txt",recursive:e.recursiveInput.checked,snapshot_name:e.nameInput.value.trim()});if(a.status!=="success"||!a.data)throw new Error(a.message||"Caption snapshot creation failed.");h("caption-backup-status",a.message||`Created ${a.data.archive_name}`),e.nameInput.value="",await G(e,a.data.archive_name)}catch(a){h("caption-backup-status",a instanceof Error?a.message:"Caption snapshot creation failed."),f("caption-backup-results",`<article class="dataset-analysis-block dataset-analysis-warning"><p>${o(a instanceof Error?a.message:"Caption snapshot creation failed.")}</p></article>`)}finally{e.browseButton.disabled=!1,e.createButton.disabled=!1,e.refreshButton.disabled=!1,e.restoreButton.disabled=!1}}async function Xa(e){const t=e.pathInput.value.trim(),a=e.selectInput.value;if(!t){h("caption-backup-status","Pick a caption folder first."),f("caption-backup-results",'<p class="dataset-analysis-empty">No caption folder selected yet.</p>');return}if(!a){h("caption-backup-status","Select a snapshot to restore.");return}if(window.confirm(`Restore caption snapshot ${a} into this folder?

This overwrites matching caption files from the snapshot.`)){e.browseButton.disabled=!0,e.createButton.disabled=!0,e.refreshButton.disabled=!0,e.restoreButton.disabled=!0,h("caption-backup-status","Restoring caption snapshot..."),f("caption-backup-results",'<p class="dataset-analysis-empty">Writing snapshot files back to the folder...</p>');try{const s=await Zt({path:t,archive_name:a,make_restore_backup:e.preRestoreInput.checked});if(s.status!=="success"||!s.data)throw new Error(s.message||"Caption snapshot restore failed.");h("caption-backup-status",s.message||`Restored ${s.data.restored_file_count} caption files.`),ua(s.data),await G(e,a,!1)}catch(s){h("caption-backup-status",s instanceof Error?s.message:"Caption snapshot restore failed."),f("caption-backup-results",`<article class="dataset-analysis-block dataset-analysis-warning"><p>${o(s instanceof Error?s.message:"Caption snapshot restore failed.")}</p></article>`)}finally{e.browseButton.disabled=!1,e.createButton.disabled=!1,e.refreshButton.disabled=!1,e.restoreButton.disabled=!1}}}function ae(e,t){const a=Number.parseInt(e,10);return Number.isNaN(a)||a<1?t:a}function We(e,t,a,n){const s=Number.parseFloat(e);return Number.isNaN(s)?t:Math.min(Math.max(s,a),n)}async function be(){var e;try{const t=await Le();ia(((e=t.data)==null?void 0:e.tasks)??[]),document.querySelectorAll("[data-task-terminate]").forEach(a=>{a.addEventListener("click",async()=>{const n=a.dataset.taskTerminate;if(n){a.setAttribute("disabled","true");try{await ut(n)}finally{await be()}}})})}catch(t){f("task-table-container",`<p>${t instanceof Error?o(t.message):"Task request failed."}</p>`)}}async function Wa(){const e=document.querySelector("#refresh-tasks");e==null||e.addEventListener("click",()=>{be()}),await be()}class ${constructor(t){x(this,"kind");x(this,"descriptionText");x(this,"defaultValue");x(this,"roleName");x(this,"roleConfig");x(this,"minValue");x(this,"maxValue");x(this,"stepValue");x(this,"disabledFlag",!1);x(this,"requiredFlag",!1);x(this,"literalValue");x(this,"options",[]);x(this,"fields",{});x(this,"itemType");this.kind=t}description(t){return this.descriptionText=t,this}default(t){return this.defaultValue=t,this}role(t,a){return this.roleName=typeof t=="string"?t:"custom",this.roleConfig=a??t,this}min(t){return this.minValue=t,this}max(t){return this.maxValue=t,this}step(t){return this.stepValue=t,this}required(){return this.requiredFlag=!0,this}disabled(){return this.disabledFlag=!0,this}}function M(e){if(e instanceof $)return e;if(e===String)return new $("string");if(e===Number)return new $("number");if(e===Boolean)return new $("boolean");if(typeof e=="string"||typeof e=="number"||typeof e=="boolean"){const t=new $("const");return t.literalValue=e,t.defaultValue=e,t}if(Array.isArray(e)){const t=new $("union");return t.options=e.map(a=>M(a)),t}if(e&&typeof e=="object"){const t=new $("object");return t.fields=Object.fromEntries(Object.entries(e).map(([a,n])=>[a,M(n)])),t}return new $("string")}function Va(){return{string(){return new $("string")},number(){return new $("number")},boolean(){return new $("boolean")},const(e){const t=new $("const");return t.literalValue=e,t.defaultValue=e,t},union(e){const t=new $("union");return t.options=e.map(a=>M(a)),t},intersect(e){const t=new $("intersect");return t.options=e.map(a=>M(a)),t},object(e){const t=new $("object");return t.fields=Object.fromEntries(Object.entries(e).map(([a,n])=>[a,M(n)])),t},array(e){const t=new $("array");return t.itemType=M(e),t}}}function Ga(e,t,a){const n={...e,...t};for(const s of a??[])delete n[s];return n}function Ve(e,t){const a=Va();return new Function("Schema","UpdateSchema","SHARED_SCHEMAS","String","Number","Boolean","source",'"use strict"; return eval(source);')(a,Ga,t??{},String,Number,Boolean,e)}function wt(e){const t=e.find(s=>s.name==="shared"),n=(t?Ve(t.schema,null):{})||{};return e.map(s=>({name:s.name,hash:s.hash,source:s.schema,runtime:s.name==="shared"?n:Ve(s.schema,n)}))}function Ge(e,t=""){return Object.entries(e).map(([a,n])=>({name:a,path:t?`${t}.${a}`:a,schema:n})).filter(a=>a.schema.kind!=="const"||!a.schema.requiredFlag)}function Ke(e){return Object.entries(e).filter(([,t])=>t.kind==="const"&&t.requiredFlag).map(([t,a])=>`${t} = ${String(a.literalValue)}`)}function Je(e){return Object.fromEntries(Object.entries(e).filter(([,t])=>t.kind==="const"&&t.requiredFlag).map(([t,a])=>[t,a.literalValue]))}function ye(e,t,a){if(e.kind==="intersect"){e.options.forEach((n,s)=>ye(n,`${t}-i${s}`,a));return}if(e.kind==="object"){const n=Ge(e.fields);n.length>0&&a.push({id:t,title:e.descriptionText||"Unnamed section",fields:n,conditions:Ke(e.fields),constants:Je(e.fields)});return}e.kind==="union"&&e.options.forEach((n,s)=>{if(n.kind==="object"){const i=Ge(n.fields);i.length>0&&a.push({id:`${t}-u${s}`,title:n.descriptionText||e.descriptionText||`Conditional branch ${s+1}`,fields:i,conditional:!0,conditions:Ke(n.fields),constants:Je(n.fields)})}else ye(n,`${t}-u${s}`,a)})}function Ka(e){const t=[];return ye(e,"section",t),t}function Ja(e){const t={};for(const a of e){a.conditional||Object.assign(t,a.constants);for(const n of a.fields)n.schema.defaultValue!==void 0?t[n.path]=n.schema.defaultValue:n.schema.kind==="boolean"?t[n.path]=!1:t[n.path]=""}return t}function xt(e,t){return e.conditional?Object.entries(e.constants).every(([a,n])=>t[a]===n):!0}function Ya(e,t){const a={...t};for(const n of e){if(xt(n,t)){Object.assign(a,n.constants);continue}for(const s of n.fields)delete a[s.path]}return a}function Re(e){return`field-${e.replaceAll(/[^a-zA-Z0-9_-]/g,"-")}`}function Za(e){if(e.kind!=="union")return null;const t=e.options.filter(a=>a.kind==="const").map(a=>a.literalValue).filter(a=>typeof a=="string"||typeof a=="number"||typeof a=="boolean");return t.length!==e.options.length?null:t}function Qa(e,t){if(!e.roleConfig||typeof e.roleConfig!="object"||Array.isArray(e.roleConfig))return;const a=e.roleConfig[t];return typeof a=="string"?a:void 0}function ve(e){return Array.isArray(e)?e.map(t=>String(t??"")):typeof e=="string"&&e.length>0?e.split(/\r?\n/):[]}function es(e,t,a){const n=ve(t),s=n.length>0?n:[""],i=Re(e.path);return`
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
  `}function ts(e,t){const a=e.schema,n=Re(e.path),s=o(e.path),i=Za(a),r=a.disabledFlag?"disabled":"",c=a.roleName||"";if(a.kind==="boolean")return`
      <label class="checkbox-row" for="${n}">
        <input id="${n}" data-field-path="${s}" data-field-kind="boolean" type="checkbox" ${t?"checked":""} ${r} />
        <span>${a.defaultValue===!0?"default on":"toggle"}</span>
      </label>
    `;if(a.kind==="array"){if(c==="table")return es(e,t,r);const d=Array.isArray(t)?t.join(`
`):"";return`<textarea id="${n}" class="field-input field-textarea" data-field-path="${s}" data-field-kind="array" ${r}>${o(d)}</textarea>`}if(i){const d=i.map(p=>`<option value="${o(p)}" ${String(p)===String(t)?"selected":""}>${o(p)}</option>`).join("");return`<select id="${n}" class="field-input" data-field-path="${s}" data-field-kind="enum" ${r}>${d}</select>`}if(a.kind==="number"){const d=a.minValue!==void 0?`min="${a.minValue}"`:"",p=a.maxValue!==void 0?`max="${a.maxValue}"`:"",u=a.stepValue!==void 0?`step="${a.stepValue}"`:'step="any"';if(c==="slider"&&a.minValue!==void 0&&a.maxValue!==void 0){const l=t===""||t===void 0||t===null?a.defaultValue??a.minValue:t;return`
        <div class="slider-editor">
          <input
            class="field-slider"
            data-field-path="${s}"
            data-field-kind="number"
            data-slider-role="range"
            type="range"
            value="${o(l)}"
            ${d}
            ${p}
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
              value="${o(l)}"
              ${d}
              ${p}
              ${u}
              ${r}
            />
            <span class="slider-value" data-slider-value-for="${s}">${o(l)}</span>
          </div>
        </div>
      `}return`<input id="${n}" class="field-input" data-field-path="${s}" data-field-kind="number" type="number" value="${o(t)}" ${d} ${p} ${u} ${r} />`}if(c==="textarea")return`<textarea id="${n}" class="field-input field-textarea" data-field-path="${s}" data-field-kind="string" ${r}>${o(t)}</textarea>`;if(c==="filepicker"){const d=Qa(a,"type")??(e.path.endsWith("_dir")||e.path==="resume"?"folder":"model-file");return`
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
            data-picker-type="${o(d)}"
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
    `}return a.kind==="const"?`<div class="field-readonly"><code>${o(a.literalValue??t)}</code></div>`:`<input id="${n}" class="field-input" data-field-path="${s}" data-field-kind="string" type="text" value="${o(t)}" ${r} />`}function as(e,t){const a=e.schema,n=[`<span class="mini-badge">${o(a.kind)}</span>`,a.roleName?`<span class="mini-badge mini-badge-muted">${o(a.roleName)}</span>`:"",a.requiredFlag?'<span class="mini-badge mini-badge-accent">required</span>':"",a.disabledFlag?'<span class="mini-badge mini-badge-muted">disabled</span>':""].filter(Boolean).join(""),s=[a.minValue!==void 0?`min ${a.minValue}`:"",a.maxValue!==void 0?`max ${a.maxValue}`:"",a.stepValue!==void 0?`step ${a.stepValue}`:""].filter(Boolean).join(" · ");return`
    <article class="field-card">
      <div class="field-card-head">
        <div>
          <label class="field-label" for="${Re(e.path)}">${o(e.name)}</label>
          <p class="field-path">${o(e.path)}</p>
        </div>
        <div class="mini-badge-row">${n}</div>
      </div>
      <p class="field-description">${o(a.descriptionText||"No description")}</p>
      ${ts(e,t)}
      <div class="field-meta">
        <span><strong>Default:</strong> ${o(a.defaultValue??"(none)")}</span>
        ${s?`<span><strong>Constraints:</strong> ${o(s)}</span>`:""}
      </div>
    </article>
  `}function St(e){return e.sections.filter(t=>xt(t,e.values))}function Tt(e){return Ya(e.sections,e.values)}function ss(e,t){const a=St(e);if(a.length===0){f(t,"<p>No renderable sections extracted from this schema.</p>");return}const n=a.map(s=>{const i=s.fields.map(c=>as(c,e.values[c.path])).join(""),r=s.conditions.length?`<div class="condition-list">${s.conditions.map(c=>`<span class="coverage-pill coverage-pill-muted">${o(c)}</span>`).join("")}</div>`:"";return`
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
      `}).join("");f(t,n)}function ke(e,t){const a=Object.fromEntries(Object.entries(Tt(e)).sort(([n],[s])=>n.localeCompare(s)));U(t,JSON.stringify(a,null,2))}function ce(e){return e.filter(t=>t.name!=="shared"&&t.runtime instanceof $)}function Ye(e,t){const a=e.schema;if(a.kind==="boolean")return!!t;if(a.kind==="number"){const n=String(t).trim();if(n==="")return"";const s=Number(n);return Number.isNaN(s)?"":s}return a.kind==="array"?String(t).split(/\r?\n/).map(n=>n.trim()).filter(Boolean):t}function Ze(e,t){return e.sections.flatMap(a=>a.fields).find(a=>a.path===t)}function ns(e,t){return[...e.querySelectorAll('[data-field-kind="table-row"]')].filter(a=>a.dataset.fieldPath===t).map(a=>a.value.trim()).filter(Boolean)}function Qe(e,t,a,n){const s=String(a??"");e.querySelectorAll("[data-field-path]").forEach(i=>{if(!(i===n||i.dataset.fieldPath!==t||i.dataset.fieldKind==="table-row")){if(i instanceof HTMLInputElement&&i.type==="checkbox"){i.checked=!!a;return}i.value=s}}),e.querySelectorAll("[data-slider-value-for]").forEach(i=>{i.dataset.sliderValueFor===t&&(i.textContent=s)})}function de(e,t,a,n="idle"){e.querySelectorAll("[data-picker-status-for]").forEach(s=>{s.dataset.pickerStatusFor===t&&(s.textContent=a,s.classList.remove("is-success","is-error"),n==="success"?s.classList.add("is-success"):n==="error"&&s.classList.add("is-error"))})}function is(e,t,a,n){const s=document.querySelector(`#${t.sectionsId}`);if(!s)return;const i=new Set(e.sections.flatMap(r=>r.conditional?Object.keys(r.constants):[]));s.querySelectorAll("[data-field-path]").forEach(r=>{const c=r.dataset.fieldKind,d=r instanceof HTMLInputElement&&r.type==="checkbox"||r instanceof HTMLSelectElement?"change":"input";r.addEventListener(d,()=>{const p=r.dataset.fieldPath;if(!p)return;const u=Ze(e,p);if(u){if(c==="table-row")e.values[p]=ns(s,p);else{const l=r instanceof HTMLInputElement&&r.type==="checkbox"?r.checked:r.value;e.values[p]=Ye(u,l),Qe(s,p,e.values[p],r)}if(i.has(p)){n({...e,values:{...e.values}});return}ke(e,t.previewId),a(e)}})}),s.querySelectorAll("[data-table-add]").forEach(r=>{r.addEventListener("click",()=>{const c=r.dataset.tableAdd;c&&(e.values[c]=[...ve(e.values[c]),""],n({...e,values:{...e.values}}))})}),s.querySelectorAll("[data-table-remove]").forEach(r=>{r.addEventListener("click",()=>{const c=r.dataset.tableRemove,d=Number(r.dataset.tableIndex??"-1");if(!c||d<0)return;const p=ve(e.values[c]).filter((u,l)=>l!==d);e.values[c]=p,n({...e,values:{...e.values}})})}),s.querySelectorAll("[data-picker-path]").forEach(r=>{r.addEventListener("click",async()=>{const c=r.dataset.pickerPath,d=r.dataset.pickerType||"model-file";if(!c)return;const p=Ze(e,c);if(p){r.setAttribute("disabled","true"),de(s,c,"Waiting for native picker...","idle");try{const u=await O(d);if(e.values[c]=Ye(p,u),Qe(s,c,e.values[c]),de(s,c,u,"success"),i.has(c)){n({...e,values:{...e.values}});return}ke(e,t.previewId),a(e)}catch(u){de(s,c,u instanceof Error?u.message:"The picker failed to return a value.","error")}finally{r.removeAttribute("disabled")}}})})}function se(e,t){const a=ce(e).find(s=>s.name===t);if(!a||!(a.runtime instanceof $))return null;const n=Ka(a.runtime);return{catalog:e,selectedName:t,sections:n,values:Ja(n)}}function K(e,t,a,n){if(a(e),!e){h(t.summaryId,"Failed to build schema bridge state."),f(t.sectionsId,"<p>Schema bridge failed to initialize.</p>"),U(t.previewId,"{}");return}const i=ce(e.catalog).map(p=>`<option value="${o(p.name)}" ${p.name===e.selectedName?"selected":""}>${o(p.name)}</option>`).join(""),r=St(e);f(t.selectId,i),h(t.summaryId,`${e.selectedName} · ${r.length}/${e.sections.length} visible sections · ${r.reduce((p,u)=>p+u.fields.length,0)} visible fields`),ss(e,t.sectionsId),ke(e,t.previewId);const c=document.querySelector(`#${t.selectId}`);c&&(c.onchange=()=>{const p=se(e.catalog,c.value);K(p,t,a,n)});const d=document.querySelector(`#${t.resetId}`);d&&(d.onclick=()=>{K(se(e.catalog,e.selectedName),t,a,n)}),is(e,t,n,p=>K(p,t,a,n)),n(e)}const rs={selectId:"schema-select",summaryId:"schema-summary",sectionsId:"schema-sections",previewId:"schema-preview",resetId:"schema-reset"};function os(e){return{selectId:`${e}-schema-select`,summaryId:`${e}-summary`,sectionsId:`${e}-sections`,previewId:`${e}-preview`,resetId:`${e}-reset`}}async function ls(e){var t,a,n;try{const i=((t=(await Te()).data)==null?void 0:t.schemas)??[],r=wt(i),c=ce(r),d=((a=c.find(p=>p.name==="sdxl-lora"))==null?void 0:a.name)??((n=c[0])==null?void 0:n.name);if(!d){h("schema-summary","No selectable schemas were returned."),f("schema-sections","<p>No schema runtime available.</p>");return}K(se(r,d),rs,e,()=>{})}catch(s){h("schema-summary","Schema bridge request failed"),f("schema-sections",`<p>${s instanceof Error?o(s.message):"Unknown error"}</p>`),U("schema-preview","{}")}}function cs(e,t){return`
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
  `}function et(e,t,a="module"){return`
    <article class="panel info-card">
      <p class="panel-kicker">${a}</p>
      <h3>${e}</h3>
      <div>${t}</div>
    </article>
  `}function ps(){return`
    ${C("about","A clean source-side replacement for the current about page","This page is one of the safest migration targets because it is mostly branding, release context and ownership notes.")}
    <section class="two-column">
      ${et("Project identity",`
          <p><strong>Product name:</strong> SD-reScripts</p>
          <p><strong>Version target:</strong> v1.0.2</p>
          <p><strong>Lineage:</strong> Fork from 秋葉 aaaki/lora-scripts</p>
          <p><strong>Maintainer:</strong> Modify By Lulynx</p>
        `,"brand")}
      ${et("Why migrate this page first",`
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
    ${C(e.heroKicker,e.heroTitle,e.heroLede)}
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
  `}function us(){return w({prefix:"anima-finetune",heroKicker:"anima finetune",heroTitle:"Anima finetune source training page",heroLede:"This route exposes the Anima finetune schema so the source-side bridge covers both LoRA and full finetune variants for that trainer family.",runnerTitle:"Anima finetune source-side runner",startButtonLabel:"Start Anima finetune",legacyPath:"/lora/anima-finetune.html",legacyLabel:"Open current shipped Anima finetune page",renderedTitle:"Anima finetune form bridge"})}function ds(){return w({prefix:"anima",heroKicker:"anima lora",heroTitle:"Anima LoRA source training page",heroLede:"This route surfaces the Anima LoRA schema on the shared training bridge instead of forcing that capability to stay hidden behind the shipped legacy page.",runnerTitle:"Anima LoRA source-side runner",startButtonLabel:"Start Anima LoRA training",legacyPath:"/lora/anima.html",legacyLabel:"Open current shipped Anima LoRA page",renderedTitle:"Anima LoRA form bridge"})}function hs(){return w({prefix:"dreambooth",heroKicker:"dreambooth train",heroTitle:"Dreambooth source training page",heroLede:"This route brings the Dreambooth and SDXL full-finetune schema into the same source-side training bridge so we can migrate one of the last big non-LoRA training paths cleanly.",runnerTitle:"Dreambooth source-side runner",startButtonLabel:"Start Dreambooth training",legacyPath:"/dreambooth/",legacyLabel:"Open current shipped Dreambooth page",renderedTitle:"Dreambooth form bridge"})}function ms(){return w({prefix:"flux-controlnet",heroKicker:"flux controlnet",heroTitle:"Flux ControlNet source training page",heroLede:"This route reuses the same source-side training bridge for Flux ControlNet so the DiT-family conditioning workflow stays aligned with the current backend schema and payload rules.",runnerTitle:"Flux ControlNet source-side runner",startButtonLabel:"Start Flux ControlNet training",legacyPath:"/lora/flux-controlnet.html",legacyLabel:"Open current shipped Flux ControlNet page",renderedTitle:"Flux ControlNet form bridge"})}function gs(){return w({prefix:"flux-finetune",heroKicker:"flux finetune",heroTitle:"Flux finetune source training page",heroLede:"This route exposes the dedicated Flux full-finetune schema on the same source-side training bridge so recipe shaping, preflight and launch behavior stay consistent.",runnerTitle:"Flux finetune source-side runner",startButtonLabel:"Start Flux finetune",legacyPath:"/lora/flux-finetune.html",legacyLabel:"Open current shipped Flux finetune page",renderedTitle:"Flux finetune form bridge"})}function fs(){return w({prefix:"flux",heroKicker:"flux train",heroTitle:"Flux LoRA source training page",heroLede:"This route reuses the source-side training bridge for Flux so we can keep payload shaping, compatibility checks and launch behavior aligned with the current backend.",runnerTitle:"Flux source-side runner",startButtonLabel:"Start Flux training",legacyPath:"/lora/flux.html",legacyLabel:"Open current shipped Flux page",renderedTitle:"Flux form bridge"})}function bs(){return w({prefix:"hunyuan-image",heroKicker:"hunyuan image",heroTitle:"Hunyuan Image LoRA source training page",heroLede:"This route exposes the Hunyuan Image LoRA schema so newer image trainer families live on the same source-side bridge instead of staying legacy-only.",runnerTitle:"Hunyuan Image source-side runner",startButtonLabel:"Start Hunyuan Image training",legacyPath:"/lora/hunyuan.html",legacyLabel:"Open current shipped Hunyuan Image page",renderedTitle:"Hunyuan Image form bridge"})}function ys(){return w({prefix:"lumina-finetune",heroKicker:"lumina finetune",heroTitle:"Lumina finetune source training page",heroLede:"This route exposes Lumina finetune on the shared source-side bridge so finetune-specific payloads can use the same autosave, preflight and launch safety checks.",runnerTitle:"Lumina finetune source-side runner",startButtonLabel:"Start Lumina finetune",legacyPath:"/lora/lumina-finetune.html",legacyLabel:"Open current shipped Lumina finetune page",renderedTitle:"Lumina finetune form bridge"})}function vs(){return w({prefix:"lumina",heroKicker:"lumina lora",heroTitle:"Lumina LoRA source training page",heroLede:"This route exposes the Lumina LoRA schema on the shared bridge so newer trainer families are available without falling back to older UI entry points.",runnerTitle:"Lumina LoRA source-side runner",startButtonLabel:"Start Lumina LoRA training",legacyPath:"/lora/lumina.html",legacyLabel:"Open current shipped Lumina LoRA page",renderedTitle:"Lumina LoRA form bridge"})}function ks(){return`
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
  `}function _s(){return w({prefix:"sd3-finetune",heroKicker:"sd3 finetune",heroTitle:"SD3 finetune source training page",heroLede:"This route brings the dedicated SD3 finetune schema into the shared source-side bridge so parameter normalization and runtime checks stay aligned with the backend.",runnerTitle:"SD3 finetune source-side runner",startButtonLabel:"Start SD3 finetune",legacyPath:"/lora/sd3-finetune.html",legacyLabel:"Open current shipped SD3 finetune page",renderedTitle:"SD3 finetune form bridge"})}function $s(){return w({prefix:"sd3",heroKicker:"sd3 train",heroTitle:"SD3 LoRA source training page",heroLede:"This route extends the same source-side training bridge to SD3 so we can keep the fast-moving schema-driven trainer paths on one shared foundation.",runnerTitle:"SD3 source-side runner",startButtonLabel:"Start SD3 training",legacyPath:"/lora/sd3.html",legacyLabel:"Open current shipped SD3 page",renderedTitle:"SD3 form bridge"})}function ws(){return w({prefix:"sd-controlnet",heroKicker:"sd controlnet",heroTitle:"SD ControlNet source training page",heroLede:"This route extends the shared source-side training bridge to the SD1.x / SD2.x ControlNet workflow so conditioning-dataset training can migrate without another bespoke form stack.",runnerTitle:"SD ControlNet source-side runner",startButtonLabel:"Start SD ControlNet training",legacyPath:"/lora/controlnet.html",legacyLabel:"Open current shipped SD ControlNet page",renderedTitle:"SD ControlNet form bridge"})}function xs(){return w({prefix:"sd-ti",heroKicker:"sd textual inversion",heroTitle:"SD textual inversion source training page",heroLede:"This route exposes the standard SD textual inversion schema through the shared training bridge, so embeddings can use the same source-side autosave, preflight and launch workflow.",runnerTitle:"SD textual inversion source-side runner",startButtonLabel:"Start SD textual inversion",legacyPath:"/lora/ti.html",legacyLabel:"Open current shipped SD textual inversion page",renderedTitle:"SD textual inversion form bridge"})}function Ss(){return w({prefix:"sdxl-controlnet",heroKicker:"sdxl controlnet",heroTitle:"SDXL ControlNet source training page",heroLede:"This route keeps the SDXL ControlNet training path on the same source-side schema bridge, normalized payload builder and launch pipeline as the main LoRA routes.",runnerTitle:"SDXL ControlNet source-side runner",startButtonLabel:"Start SDXL ControlNet training",legacyPath:"/lora/sdxl-controlnet.html",legacyLabel:"Open current shipped SDXL ControlNet page",renderedTitle:"SDXL ControlNet form bridge",routeNotice:{kicker:"experimental",title:"SDXL clip_skip remains experimental here as well",detail:"ControlNet still shares the SDXL text-encoding path. If you enable clip_skip on this route, keep your inference stack aligned with the same SDXL clip-skip behavior."}})}function Ts(){return w({prefix:"sdxl-lllite",heroKicker:"sdxl lllite",heroTitle:"SDXL LLLite source training page",heroLede:"This route keeps the SDXL ControlNet-LLLite path on the shared source-side training bridge so even the more specialized conditioning flow no longer needs its own one-off migration path.",runnerTitle:"SDXL LLLite source-side runner",startButtonLabel:"Start SDXL LLLite training",legacyPath:"/lora/sdxl-lllite.html",legacyLabel:"Open current shipped SDXL LLLite page",renderedTitle:"SDXL LLLite form bridge",routeNotice:{kicker:"experimental",title:"SDXL clip_skip is experimental on LLLite too",detail:"The SDXL-side text encoding path is shared here, so clip_skip support is available but still experimental. Keep training and inference behavior matched if you use it."}})}function Ls(){return w({prefix:"sdxl-ti",heroKicker:"sdxl textual inversion",heroTitle:"SDXL textual inversion source training page",heroLede:"This route exposes SDXL textual inversion through the same source-side training bridge, so embeddings, prompt helpers and launch safety checks stay unified.",runnerTitle:"SDXL textual inversion source-side runner",startButtonLabel:"Start SDXL textual inversion",legacyPath:"/lora/sdxl-ti.html",legacyLabel:"Open current shipped SDXL textual inversion page",renderedTitle:"SDXL textual inversion form bridge",routeNotice:{kicker:"experimental",title:"SDXL clip_skip support is experimental",detail:"This route can now carry clip_skip into the SDXL text encoding path, but it is still an experimental compatibility feature rather than a long-settled default."}})}function Is(){return w({prefix:"sdxl",heroKicker:"sdxl train",heroTitle:"First source-side SDXL training page",heroLede:"This is the first page that moves beyond passive inspection: it renders the SDXL schema, tracks a real config model and can submit to the current training backend.",runnerTitle:"SDXL source-side runner",startButtonLabel:"Start SDXL training",legacyPath:"/lora/sdxl.html",legacyLabel:"Open current shipped SDXL page",renderedTitle:"SDXL form bridge",routeNotice:{kicker:"experimental",title:"SDXL clip_skip is now opt-in experimental support",detail:"This build can pass clip_skip through the SDXL training path, but it should be treated as experimental. If you rely on it, use matching SDXL clip-skip behavior at inference time too."}})}function As(){return`
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
      <p><a class="text-link" href="${R("/other/settings.html")}" target="_blank" rel="noreferrer">Open current shipped settings page</a></p>
    </section>
  `}function Es(){return`
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
          <p><a class="text-link" href="${R("/tageditor.html")}" target="_blank" rel="noreferrer">Open current shipped tag editor wrapper</a></p>
        </div>
      </article>
    </section>
  `}function Ps(){return`
    ${C("tasks","Task monitor migration page","This route is already talking to the real backend task manager, so it is a strong candidate for early source migration.")}
    <section class="panel task-panel">
      <div class="task-toolbar">
        <button id="refresh-tasks" class="action-button" type="button">Refresh tasks</button>
        <a class="text-link task-legacy-link" href="${R("/task.html")}" target="_blank" rel="noreferrer">Open current shipped task page</a>
      </div>
      <div id="task-table-container" class="task-table-container loading">Loading tasks...</div>
    </section>
  `}function Ns(){return`
    ${C("tensorboard","TensorBoard wrapper migration page","This page can be rebuilt without touching training forms because it mainly needs status text and a proxy destination.")}
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
  `}function Rs(){return`
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
  `}const Cs=[{method:"GET",path:"/api/schemas/all",purpose:"Fetch all schema definitions used to render training forms.",migrationPriority:"high"},{method:"GET",path:"/api/schemas/hashes",purpose:"Hot-reload check for schema changes.",migrationPriority:"medium"},{method:"GET",path:"/api/presets",purpose:"Fetch preset configs for pages and tools.",migrationPriority:"high"},{method:"GET",path:"/api/config/saved_params",purpose:"Load stored UI parameter choices.",migrationPriority:"medium"},{method:"GET",path:"/api/config/summary",purpose:"Read app config summary for the rebuilt settings page.",migrationPriority:"medium"},{method:"GET",path:"/api/graphic_cards",purpose:"List GPUs plus xformers support state.",migrationPriority:"high"},{method:"POST",path:"/api/run",purpose:"Start schema-driven training jobs.",migrationPriority:"high"},{method:"POST",path:"/api/train/preflight",purpose:"Run backend-aware training preflight checks before launch.",migrationPriority:"high"},{method:"POST",path:"/api/train/sample_prompt",purpose:"Resolve and preview the effective training sample prompt text without launching a run.",migrationPriority:"high"},{method:"POST",path:"/api/dataset/masked_loss_audit",purpose:"Inspect alpha-channel mask readiness for masked-loss training workflows.",migrationPriority:"high"},{method:"POST",path:"/api/run_script",purpose:"Run utility scripts from the tools page.",migrationPriority:"high"},{method:"POST",path:"/api/interrogate",purpose:"Run the built-in tagger/interrogator flow.",migrationPriority:"high"},{method:"GET",path:"/api/interrogators",purpose:"List available batch tagger/interrogator models for the rebuilt tools workspace.",migrationPriority:"high"},{method:"POST",path:"/api/captions/cleanup/preview",purpose:"Preview bulk caption cleanup rules before touching files.",migrationPriority:"high"},{method:"POST",path:"/api/captions/cleanup/apply",purpose:"Apply bulk caption cleanup rules to caption files.",migrationPriority:"high"},{method:"POST",path:"/api/captions/backups/create",purpose:"Create a snapshot archive of caption files for later restore.",migrationPriority:"high"},{method:"POST",path:"/api/captions/backups/list",purpose:"List caption snapshots associated with a folder.",migrationPriority:"high"},{method:"POST",path:"/api/captions/backups/restore",purpose:"Restore caption files from a saved snapshot archive.",migrationPriority:"high"},{method:"GET",path:"/api/pick_file",purpose:"Open native file/folder pickers where supported.",migrationPriority:"medium"},{method:"GET",path:"/api/get_files",purpose:"List model, output or train directories for file pickers.",migrationPriority:"high"},{method:"GET",path:"/api/tasks",purpose:"Fetch active and historical task state.",migrationPriority:"high"},{method:"GET",path:"/api/tasks/terminate/{task_id}",purpose:"Terminate a running task.",migrationPriority:"high"},{method:"GET",path:"/api/tageditor_status",purpose:"Poll tag-editor startup/proxy status.",migrationPriority:"medium"},{method:"GET",path:"/api/scripts",purpose:"List backend-approved utility scripts and positional args for the rebuilt tools page.",migrationPriority:"high"}];function Lt(){const e=mt.map(a=>`
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
      `).join(""),t=Cs.map(a=>`
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
  `}function Ds(){return w({prefix:"xti",heroKicker:"sd xti",heroTitle:"SD XTI source training page",heroLede:"This route exposes the SD XTI schema on the shared source-side bridge so more specialized embedding workflows are no longer hidden behind the legacy page only.",runnerTitle:"SD XTI source-side runner",startButtonLabel:"Start SD XTI training",legacyPath:"/lora/xti.html",legacyLabel:"Open current shipped SD XTI page",renderedTitle:"SD XTI form bridge"})}function Bs(e,t){if(t.length===0){f(e,"<p>No GPUs reported. Training will use the backend default environment.</p>");return}const a=t.map((n,s)=>{const i=n.index??n.id??s,r=String(i);return`
        <label class="gpu-chip">
          <input type="checkbox" data-gpu-id="${o(r)}" />
          <span>GPU ${o(r)}: ${o(n.name)}</span>
        </label>
      `}).join("");f(e,`<div class="gpu-chip-grid">${a}</div>`)}function Ce(e){return[...document.querySelectorAll(`#${e} input[data-gpu-id]:checked`)].map(t=>t.dataset.gpuId).filter(t=>!!t)}function De(e,t=[]){const a=new Set(t.map(n=>String(n)));document.querySelectorAll(`#${e}-gpu-selector input[data-gpu-id]`).forEach(n=>{const s=n.dataset.gpuId??"";n.checked=a.has(s)})}function qs(e){switch(e){case"prompt_file":return"Prompt file";case"generated":return"Generated from current fields";case"random_dataset_prompt_preview":return"Random dataset-derived prompt";case"legacy_sample_prompts_file":return"Legacy sample_prompts file";case"legacy_sample_prompts_inline":return"Legacy sample_prompts text";default:return e}}function I(e,t,a,n="idle"){f(`${e}-submit-status`,`
      <div class="submit-status-box submit-status-${n}">
        <strong>${o(t)}</strong>
        <p>${o(a)}</p>
      </div>
    `)}function ne(e,t,a){if(a){f(`${e}-validation-status`,`
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
    `)}function v(e,t,a="idle"){const n=document.querySelector(`#${e}-utility-note`);n&&(n.textContent=t,n.classList.remove("utility-note-success","utility-note-warning","utility-note-error"),a==="success"?n.classList.add("utility-note-success"):a==="warning"?n.classList.add("utility-note-warning"):a==="error"&&n.classList.add("utility-note-error"))}function Be(e,t){if(!(t!=null&&t.value)){f(`${e}-autosave-status`,`
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
    `)}function tt(e,t,a){if(a){f(`${e}-preflight-report`,`
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
            <p class="training-preflight-meta">${o(qs(t.sample_prompt.source))}${t.sample_prompt.detail?` · ${o(t.sample_prompt.detail)}`:""}</p>
            <pre class="preset-preview">${o(t.sample_prompt.preview)}</pre>
          </div>
        `:""].filter(Boolean).join("");f(`${e}-preflight-report`,`
      <div class="submit-status-box ${t.can_start?"submit-status-success":"submit-status-warning"}">
        <strong>${t.can_start?"Backend preflight passed":"Backend preflight found launch blockers"}</strong>
        <p>Training type: ${o(t.training_type)}</p>
        ${n}
      </div>
    `)}function Fs(e){const t=[];let a="",n=null,s=0;for(let i=0;i<e.length;i+=1){const r=e[i],c=i>0?e[i-1]:"";if(n){a+=r,r===n&&c!=="\\"&&(n=null);continue}if(r==='"'||r==="'"){n=r,a+=r;continue}if(r==="["){s+=1,a+=r;continue}if(r==="]"){s-=1,a+=r;continue}if(r===","&&s===0){t.push(a.trim()),a="";continue}a+=r}return a.trim().length>0&&t.push(a.trim()),t}function js(e){let t=null,a=!1,n="";for(const s of e){if(t){if(n+=s,t==='"'&&s==="\\"&&!a){a=!0;continue}s===t&&!a&&(t=null),a=!1;continue}if(s==='"'||s==="'"){t=s,n+=s;continue}if(s==="#")break;n+=s}return n.trim()}function It(e){return e.startsWith('"')&&e.endsWith('"')?e.slice(1,-1).replaceAll('\\"','"').replaceAll("\\n",`
`).replaceAll("\\t","	").replaceAll("\\\\","\\"):e.startsWith("'")&&e.endsWith("'")?e.slice(1,-1):e}function At(e){const t=e.trim();return t.length===0?"":t.startsWith('"')&&t.endsWith('"')||t.startsWith("'")&&t.endsWith("'")?It(t):t==="true"?!0:t==="false"?!1:t.startsWith("[")&&t.endsWith("]")?Fs(t.slice(1,-1)).map(a=>At(a)):/^[+-]?\d[\d_]*(\.\d[\d_]*)?([eE][+-]?\d+)?$/.test(t)?Number(t.replaceAll("_","")):t}function at(e){return e.split(".").map(t=>t.trim()).filter(Boolean).map(t=>It(t))}function Os(e,t,a){let n=e;for(let s=0;s<t.length-1;s+=1){const i=t[s],r=n[i];(!r||typeof r!="object"||Array.isArray(r))&&(n[i]={}),n=n[i]}n[t[t.length-1]]=a}function qe(e){const t={};let a=[];for(const n of e.split(/\r?\n/)){const s=js(n);if(!s)continue;if(s.startsWith("[[")&&s.endsWith("]]"))throw new Error("Array-of-table syntax is not supported in custom params yet.");if(s.startsWith("[")&&s.endsWith("]")){a=at(s.slice(1,-1));continue}const i=s.indexOf("=");if(i===-1)throw new Error(`Invalid TOML line: ${n}`);const r=at(s.slice(0,i));if(r.length===0)throw new Error(`Invalid TOML key: ${n}`);Os(t,[...a,...r],At(s.slice(i+1)))}return t}function he(e){return JSON.stringify(e)}function Et(e){return typeof e=="string"?he(e):typeof e=="number"?Number.isFinite(e)?String(e):he(String(e)):typeof e=="boolean"?e?"true":"false":Array.isArray(e)?`[${e.map(t=>Et(t)).join(", ")}]`:he(JSON.stringify(e))}function Pt(e,t=[],a=[]){const n=[];for(const[s,i]of Object.entries(e)){if(i&&typeof i=="object"&&!Array.isArray(i)){Pt(i,[...t,s],a);continue}n.push([s,i])}return a.push({path:t,values:n}),a}function _e(e){const t=Pt(e).filter(n=>n.values.length>0).sort((n,s)=>n.path.join(".").localeCompare(s.path.join("."))),a=[];for(const n of t){n.path.length>0&&(a.length>0&&a.push(""),a.push(`[${n.path.join(".")}]`));for(const[s,i]of n.values.sort(([r],[c])=>r.localeCompare(c)))a.push(`${s} = ${Et(i)}`)}return a.join(`
`)}const Hs=["pretrained_model_name_or_path","train_data_dir","reg_data_dir","output_dir","network_weights","conditioning_data_dir","controlnet_model_name_or_path","weights","vae","text_encoder","byt5","qwen3","llm_adapter_path","t5_tokenizer_path","ae","clip_l","clip_g","t5xxl","gemma2"],Ms=["learning_rate","unet_lr","text_encoder_lr","learning_rate_te","learning_rate_te1","learning_rate_te2","learning_rate_te3","sigmoid_scale","guidance_scale","training_shift","control_net_lr","self_attn_lr","cross_attn_lr","mlp_lr","mod_lr","llm_adapter_lr"],zs=["lycoris_algo","conv_dim","conv_alpha","dropout","dylora_unit","lokr_factor","train_norm","down_lr_weight","mid_lr_weight","up_lr_weight","block_lr_zero_threshold","enable_block_weights","enable_preview","network_args_custom","optimizer_args_custom","enable_base_weight","prodigy_d0","prodigy_d_coef","ui_custom_params"],Us=["vae","reg_data_dir","network_weights","conditioning_data_dir","controlnet_model_name_or_path","weights","init_word","text_encoder","byt5","qwen3","llm_adapter_path","t5_tokenizer_path","ae","clip_l","clip_g","t5xxl","gemma2","noise_offset","multires_noise_iterations","multires_noise_discount","caption_dropout_rate","network_dropout","scale_weight_norms","gpu_ids"],st=["v2","v_parameterization","scale_v_pred_loss_like_noise_pred","clip_skip","learning_rate_te","stop_text_encoder_training"],Xs=["learning_rate_te1","learning_rate_te2"],Ws=[["cache_text_encoder_outputs","shuffle_caption"],["noise_offset","multires_noise_iterations"],["cache_latents","color_aug"],["cache_latents","random_crop"]],nt={algo:"lycoris_algo",unit:"dylora_unit",factor:"lokr_factor"},Vs=new Set(["conv_dim","conv_alpha","dropout","down_lr_weight","mid_lr_weight","up_lr_weight","block_lr_zero_threshold"]),Gs=new Set(["decouple","weight_decay","use_bias_correction","safeguard_warmup"]),Ks=new Set(["base_weights","base_weights_multiplier"]),Js={pretrained_model_name_or_path:"./sd-models/model.safetensors",train_data_dir:"./train/aki",resolution:"512,512",enable_bucket:!0,min_bucket_reso:256,max_bucket_reso:1024,output_name:"aki",output_dir:"./output",save_model_as:"safetensors",save_every_n_epochs:2,max_train_epochs:10,train_batch_size:1,network_train_unet_only:!1,network_train_text_encoder_only:!1,learning_rate:1e-4,unet_lr:1e-4,text_encoder_lr:1e-5,lr_scheduler:"cosine_with_restarts",optimizer_type:"AdamW8bit",lr_scheduler_num_cycles:1,network_module:"networks.lora",network_dim:32,network_alpha:32,logging_dir:"./logs",caption_extension:".txt",shuffle_caption:!0,keep_tokens:0,max_token_length:255,seed:1337,prior_loss_weight:1,clip_skip:2,mixed_precision:"fp16",save_precision:"fp16",xformers:!0,cache_latents:!0,persistent_data_loader_workers:!0};function $e(e){return JSON.parse(JSON.stringify(e??{}))}function Z(e){return Array.isArray(e)?e.map(t=>String(t??"").trim()).filter(Boolean):String(e??"").split(/\r?\n/).map(t=>t.trim()).filter(Boolean)}function q(e,t){return Object.prototype.hasOwnProperty.call(e,t)}function Ys(e){return String(e.model_train_type??"").startsWith("sdxl")}function Zs(e){return String(e.model_train_type??"")==="sd3-finetune"}function _(e){return e==null?"":String(e)}function Qs(e){return _(e).replaceAll("\\","/")}function ie(e,t=0){const a=Number.parseFloat(_(e));return Number.isNaN(a)?t:a}function k(e){return!!e}function it(e){const t=e.indexOf("=");return t===-1?{key:e.trim(),value:"",hasValue:!1}:{key:e.slice(0,t).trim(),value:e.slice(t+1).trim(),hasValue:!0}}function en(e){if(typeof e=="boolean")return e;const t=_(e).toLowerCase();return t==="true"||t==="1"||t==="yes"}function Fe(e,t=String(e.model_train_type??"")){const a=t==="lora-basic"?{...Js,...$e(e)}:$e(e),n=[],s=[],i=Ys(a),r=Zs(a);(i||r)&&[a.learning_rate_te1,a.learning_rate_te2,a.learning_rate_te3].some(k)&&(a.train_text_encoder=!0);const c=i?st.filter(u=>u!=="clip_skip"):r?st:Xs;for(const u of c)q(a,u)&&delete a[u];a.network_module==="lycoris.kohya"?(n.push(`conv_dim=${_(a.conv_dim)}`,`conv_alpha=${_(a.conv_alpha)}`,`dropout=${_(a.dropout)}`,`algo=${_(a.lycoris_algo)}`),k(a.lokr_factor)&&n.push(`factor=${_(a.lokr_factor)}`),k(a.train_norm)&&n.push("train_norm=True")):a.network_module==="networks.dylora"&&n.push(`unit=${_(a.dylora_unit)}`);const d=_(a.optimizer_type),p=d.toLowerCase();p.startsWith("dada")?((d==="DAdaptation"||d==="DAdaptAdam")&&s.push("decouple=True","weight_decay=0.01"),a.learning_rate=1,a.unet_lr=1,a.text_encoder_lr=1):p==="prodigy"&&(s.push("decouple=True","weight_decay=0.01","use_bias_correction=True",`d_coef=${_(a.prodigy_d_coef)}`),k(a.lr_warmup_steps)&&s.push("safeguard_warmup=True"),k(a.prodigy_d0)&&s.push(`d0=${_(a.prodigy_d0)}`)),k(a.enable_block_weights)&&(n.push(`down_lr_weight=${_(a.down_lr_weight)}`,`mid_lr_weight=${_(a.mid_lr_weight)}`,`up_lr_weight=${_(a.up_lr_weight)}`,`block_lr_zero_threshold=${_(a.block_lr_zero_threshold)}`),delete a.block_lr_zero_threshold),k(a.enable_base_weight)?(a.base_weights=Z(a.base_weights),a.base_weights_multiplier=Z(a.base_weights_multiplier).map(u=>ie(u))):(delete a.base_weights,delete a.base_weights_multiplier);for(const u of Z(a.network_args_custom))n.push(u);for(const u of Z(a.optimizer_args_custom))s.push(u);k(a.enable_preview)||(delete a.sample_prompts,delete a.sample_sampler,delete a.sample_every_n_epochs);for(const u of Ms)q(a,u)&&(a[u]=ie(a[u]));for(const u of Us){if(!q(a,u))continue;const l=a[u];(l===0||l===""||Array.isArray(l)&&l.length===0)&&delete a[u]}for(const u of Hs)q(a,u)&&a[u]&&(a[u]=Qs(a[u]));if(n.length>0?a.network_args=n:delete a.network_args,s.length>0?a.optimizer_args=s:delete a.optimizer_args,k(a.ui_custom_params)){const u=qe(_(a.ui_custom_params));Object.assign(a,u)}for(const u of zs)q(a,u)&&delete a[u];return Array.isArray(a.gpu_ids)&&(a.gpu_ids=a.gpu_ids.map(u=>{const l=_(u),m=l.match(/GPU\s+(\d+):/);return m?m[1]:l})),a}function tn(e){const t=[],a=[],n=_(e.optimizer_type),s=n.toLowerCase(),i=_(e.model_train_type),r=i.startsWith("sdxl"),c=i==="sd3-finetune",d=i==="anima-lora"||i==="anima-finetune";n.startsWith("DAdapt")&&e.lr_scheduler!=="constant"&&t.push("DAdaptation works best with lr_scheduler set to constant."),s.startsWith("prodigy")&&(q(e,"unet_lr")||q(e,"text_encoder_lr"))&&(ie(e.unet_lr,1)!==1||ie(e.text_encoder_lr,1)!==1)&&t.push("Prodigy usually expects unet_lr and text_encoder_lr to stay at 1."),e.network_module==="networks.oft"&&i!=="sdxl-lora"&&a.push("OFT is currently only supported for SDXL LoRA."),c&&k(e.train_text_encoder)&&k(e.cache_text_encoder_outputs)&&!k(e.use_t5xxl_cache_only)&&a.push("SD3 full finetune cannot train text encoders while cache_text_encoder_outputs is enabled."),c&&k(e.train_t5xxl)&&!k(e.train_text_encoder)&&a.push("train_t5xxl requires train_text_encoder to be enabled first."),c&&k(e.train_t5xxl)&&k(e.cache_text_encoder_outputs)&&a.push("train_t5xxl cannot be combined with cache_text_encoder_outputs."),d&&k(e.unsloth_offload_checkpointing)&&k(e.cpu_offload_checkpointing)&&a.push("unsloth_offload_checkpointing cannot be combined with cpu_offload_checkpointing."),d&&k(e.unsloth_offload_checkpointing)&&k(e.blocks_to_swap)&&a.push("unsloth_offload_checkpointing cannot be combined with blocks_to_swap."),k(e.masked_loss)&&!k(e.alpha_mask)&&!k(e.conditioning_data_dir)&&t.push("masked_loss is on, but alpha_mask is off. For normal alpha-channel datasets this often becomes a no-op."),r&&k(e.clip_skip)&&t.push("SDXL clip_skip in this build is experimental. Use the same clip-skip behavior at inference time if you rely on it.");for(const[p,u]of Ws)k(e[p])&&k(e[u])&&a.push(`Parameters ${p} and ${u} conflict. Please enable only one of them.`);return{warnings:t,errors:a}}function Nt(e){const t=$e(e);if(Array.isArray(t.network_args)){const a=[];for(const n of t.network_args){const{key:s,value:i,hasValue:r}=it(_(n));if(s==="train_norm"){t.train_norm=r?en(i):!0;continue}if((s==="down_lr_weight"||s==="mid_lr_weight"||s==="up_lr_weight"||s==="block_lr_zero_threshold")&&(t.enable_block_weights=!0),Vs.has(s)){t[s]=i;continue}if(nt[s]){t[nt[s]]=i;continue}a.push(_(n))}a.length>0&&(t.network_args_custom=a),delete t.network_args}if(Array.isArray(t.optimizer_args)){const a=[];for(const n of t.optimizer_args){const{key:s,value:i}=it(_(n));if(s==="d_coef"){t.prodigy_d_coef=i;continue}if(s==="d0"){t.prodigy_d0=i;continue}Gs.has(s)||a.push(_(n))}a.length>0&&(t.optimizer_args_custom=a),delete t.optimizer_args}for(const a of Ks)Array.isArray(t[a])&&(t[a]=t[a].map(n=>_(n)).join(`
`),a==="base_weights"&&(t.enable_base_weight=!0),a==="base_weights_multiplier"&&(t.enable_base_weight=!0));return Array.isArray(t.gpu_ids)&&(t.gpu_ids=t.gpu_ids.map(a=>_(a))),t}function X(e,t){return`
    <div class="training-library-meta">
      <span class="coverage-pill coverage-pill-muted">${o(e)}</span>
    </div>
    <p class="training-library-note">${o(t)}</p>
  `}function re(e){return typeof e=="string"&&e.trim().length>0?e.trim():null}function we(e,t){const a=t.metadata??{},n=re(a.train_type);return n?e.presetTrainTypes.includes(n)?{compatible:!0,label:"route preset",detail:`Preset metadata matches this route via train_type = ${n}.`,tone:"default"}:{compatible:!1,label:"cross-route preset",detail:`Preset metadata targets ${n}, which does not match ${e.schemaName}.`,tone:"warning"}:{compatible:!0,label:"generic preset",detail:"This preset does not declare a train_type, so review route-specific fields before launch.",tone:"muted"}}function xe(e,t){const a=re(t.route_id),n=re(t.train_type);return a===e.routeId?{compatible:!0,label:"route recipe",detail:"This recipe was saved from the same source-side route.",tone:"default"}:n&&e.presetTrainTypes.includes(n)?{compatible:!0,label:"family recipe",detail:`Recipe metadata matches this route family via train_type = ${n}.`,tone:"default"}:!a&&!n?{compatible:!0,label:"generic recipe",detail:"This recipe has no route metadata, so review route-specific fields before applying it.",tone:"muted"}:a?{compatible:!1,label:"cross-route recipe",detail:`Recipe metadata says it came from ${a}, not ${e.routeId}.`,tone:"warning"}:{compatible:!1,label:"foreign train type",detail:`Recipe metadata targets ${n}, which does not match ${e.schemaName}.`,tone:"warning"}}function J(e,t){const a=t.values.output_name;return typeof a=="string"&&a.trim().length>0?a.trim():`${e.modelLabel} snapshot`}function an(e){try{return JSON.stringify(Fe(H(e.value)),null,2)}catch(t){return t instanceof Error?t.message:"Unable to preview this snapshot."}}function sn(e,t){if(t.length===0){f(`${e}-history-panel`,`
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
        ${X("0 snapshots","Saved parameter snapshots stay in this browser and can restore form values plus selected GPUs.")}
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
          <pre class="history-preview">${o(an(n))}</pre>
          <div class="history-card-actions">
            <button class="action-button action-button-ghost action-button-small" data-history-apply="${s}" type="button">Apply</button>
            <button class="action-button action-button-ghost action-button-small" data-history-rename="${s}" type="button">Rename</button>
            <button class="action-button action-button-ghost action-button-small" data-history-delete="${s}" type="button">Delete</button>
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
      ${X(`${t.length} snapshot${t.length===1?"":"s"}`,"Saved parameter snapshots stay in this browser and can restore form values plus selected GPUs.")}
      <div class="history-list">${a}</div>
    `)}function nn(e,t,a){if(t.length===0){f(`${e}-presets-panel`,`
        <div class="training-side-panel-head">
          <div>
            <p class="panel-kicker">presets</p>
            <h3>Training presets</h3>
          </div>
          <button class="action-button action-button-ghost action-button-small" data-preset-close="${e}" type="button">Close</button>
        </div>
        ${X("0 presets","Backend presets are shared read-only templates. Save recipe copies one into your local browser library.")}
        <p>No presets matched this training route.</p>
      `);return}const n=t.map((s,i)=>{const r=s.metadata??{},c=s.data??{},d=we(a,s),p=d.tone==="warning"?"coverage-pill-warning":d.tone==="muted"?"coverage-pill-muted":"",u=re(r.train_type);return`
        <article class="preset-card">
          <div class="preset-card-head">
            <div>
              <h4>${o(r.name||s.name||`Preset ${i+1}`)}</h4>
              <p class="preset-card-meta">
                ${o(String(r.version||"unknown"))}
                · ${o(String(r.author||"unknown author"))}
              </p>
            </div>
            <span class="coverage-pill coverage-pill-muted">${o(String(r.train_type||"shared"))}</span>
          </div>
          <p>${o(String(r.description||"No description"))}</p>
          <div class="coverage-list training-card-compatibility">
            <span class="coverage-pill ${p}">${o(d.label)}</span>
            ${u?`<span class="coverage-pill coverage-pill-muted">${o(u)}</span>`:""}
          </div>
          <p class="training-card-note">${o(d.detail)}</p>
          <pre class="preset-preview">${o(JSON.stringify(c,null,2))}</pre>
          <div class="preset-card-actions">
            <button class="action-button action-button-ghost action-button-small" data-preset-save-recipe="${i}" type="button">Save recipe</button>
            <button class="action-button action-button-ghost action-button-small" data-preset-merge="${i}" type="button">Merge</button>
            <button class="action-button action-button-ghost action-button-small" data-preset-replace="${i}" type="button">Replace</button>
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
      ${X(`${t.length} preset${t.length===1?"":"s"}`,"Backend presets are shared read-only templates. Save recipe copies one into your local browser library.")}
      <div class="preset-list">${n}</div>
    `)}function rn(e,t,a){if(t.length===0){f(`${e}-recipes-panel`,`
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
        ${X("0 recipes","Recipes are editable local copies stored per route in this browser. Import merges JSON or TOML here, and Export writes preset TOML files.")}
        <p>No saved recipes for this route yet.</p>
      `);return}const n=t.map((s,i)=>{const r=xe(a,s),c=r.tone==="warning"?"coverage-pill-warning":r.tone==="muted"?"coverage-pill-muted":"";return`
        <article class="preset-card">
          <div class="preset-card-head">
            <div>
              <h4>${o(s.name)}</h4>
              <p class="preset-card-meta">
                ${o(s.created_at)}
                ${s.train_type?` · ${o(s.train_type)}`:""}
              </p>
            </div>
            <span class="coverage-pill coverage-pill-muted">${o(s.route_id||"local")}</span>
          </div>
          <p>${o(s.description||"No description")}</p>
          <div class="coverage-list training-card-compatibility">
            <span class="coverage-pill ${c}">${o(r.label)}</span>
            ${s.train_type?`<span class="coverage-pill coverage-pill-muted">${o(s.train_type)}</span>`:""}
          </div>
          <p class="training-card-note">${o(r.detail)}</p>
          <pre class="preset-preview">${o(JSON.stringify(Fe(H(s.value)),null,2))}</pre>
          <div class="preset-card-actions">
            <button class="action-button action-button-ghost action-button-small" data-recipe-merge="${i}" type="button">Merge</button>
            <button class="action-button action-button-ghost action-button-small" data-recipe-replace="${i}" type="button">Replace</button>
            <button class="action-button action-button-ghost action-button-small" data-recipe-export="${i}" type="button">Export</button>
            <button class="action-button action-button-ghost action-button-small" data-recipe-rename="${i}" type="button">Rename</button>
            <button class="action-button action-button-ghost action-button-small" data-recipe-delete="${i}" type="button">Delete</button>
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
      ${X(`${t.length} recipe${t.length===1?"":"s"}`,"Recipes are editable local copies stored per route in this browser. Import merges JSON or TOML here, and Export writes preset TOML files.")}
      <div class="preset-list">${n}</div>
    `)}function on(e,t){const a=new Set(e.presetTrainTypes);return t.filter(n=>{const i=(n.metadata??{}).train_type;return typeof i!="string"||i.trim().length===0?!0:a.has(i)})}function T(e,t,a){const n=document.querySelector(`#${e}-history-panel`),s=document.querySelector(`#${e}-recipes-panel`),i=document.querySelector(`#${e}-presets-panel`);n&&(n.hidden=t==="history"?!a:!0),s&&(s.hidden=t==="recipes"?!a:!0),i&&(i.hidden=t==="presets"?!a:!0)}async function rt(e,t){try{const a=await ea(t);if(a.status!=="success")throw new Error(a.message||"Training preflight failed.");return tt(e.prefix,a.data??null),a.data??null}catch(a){throw tt(e.prefix,null,a instanceof Error?a.message:"Training preflight failed."),a}}function ln(e){var t;(t=document.querySelector(`#${e.prefix}-stop-train`))==null||t.addEventListener("click",async()=>{var a;try{const s=(((a=(await Le()).data)==null?void 0:a.tasks)??[]).find(r=>String(r.status).toUpperCase()==="RUNNING");if(!s){v(e.prefix,"No running training task was found.","warning");return}const i=String(s.id??s.task_id??"");if(!i){v(e.prefix,"The running task does not expose an id.","error");return}if(!window.confirm(`Stop running task ${i}?`))return;await ut(i),I(e.prefix,"Training stop requested",`Sent terminate request for task ${i}.`,"warning"),v(e.prefix,`Terminate requested for task ${i}.`,"warning")}catch(n){v(e.prefix,n instanceof Error?n.message:"Failed to stop training.","error")}})}function cn(e,t,a){var s;(s=document.querySelector(`#${e.prefix}-run-preflight`))==null||s.addEventListener("click",async()=>{const i=t();if(!i){I(e.prefix,"Editor not ready",`The ${e.modelLabel} schema editor state is not initialized yet.`,"error");return}try{const r=a(i);ne(e.prefix,r.checks),await rt(e,r.payload),v(e.prefix,"Training preflight completed.","success")}catch(r){v(e.prefix,r instanceof Error?r.message:"Training preflight failed.","error")}});const n=document.querySelector(`#${e.prefix}-start-train`);n==null||n.addEventListener("click",async()=>{var r;const i=t();if(!i){I(e.prefix,"Editor not ready",`The ${e.modelLabel} schema editor state is not initialized yet.`,"error");return}n.setAttribute("disabled","true"),I(e.prefix,"Submitting training job...","Sending the current payload to /api/run.","idle");try{const c=a(i);if(c.checks.errors.length>0){I(e.prefix,"Fix parameter conflicts first",c.checks.errors.join(" "),"error"),ne(e.prefix,c.checks);return}const d=await rt(e,c.payload);if(d&&!d.can_start){I(e.prefix,"Resolve preflight errors first",d.errors.join(" "),"error");return}const p=await Qt(c.payload);if(p.status==="success"){const l=[...c.checks.warnings,...(d==null?void 0:d.warnings)??[],...((r=p.data)==null?void 0:r.warnings)??[]].join(" ");I(e.prefix,"Training request accepted",`${p.message||"Training started."}${l?` ${l}`:""}`,l?"warning":"success")}else I(e.prefix,"Training request failed",p.message||"Unknown backend failure.","error")}catch(c){I(e.prefix,"Training request failed",c instanceof Error?c.message:"Unknown network error.","error")}finally{n.removeAttribute("disabled")}})}function pn(e){return e.trim().replace(/[^0-9A-Za-z._-]+/g,"-").replace(/-+/g,"-").replace(/^[-_.]+|[-_.]+$/g,"")||"training-preset"}function un(e,t,a){const n=J(e,t),s=String(a.payload.model_train_type??"");return{metadata:{name:n,version:"1.0",author:"SD-reScripts local export",train_type:s||e.schemaName,description:`Exported from the ${e.modelLabel} source-side training bridge on ${new Date().toLocaleString()}.`},data:a.payload}}function dn(e,t,a,n){const s=J(e,t),i=window.prompt("Recipe name",s);if(!i||!i.trim())return!1;const r=window.prompt("Recipe description (optional)","")??"",c=E(e.routeId);return c.unshift({created_at:new Date().toLocaleString(),name:i.trim(),description:r.trim()||void 0,train_type:String(a.payload.model_train_type??e.schemaName),route_id:e.routeId,value:H(a.payload)}),V(e.routeId,Ne(c)),n(),!0}function ot(e,t,a){const n=t.data&&typeof t.data=="object"&&!Array.isArray(t.data)?t.data:t.value&&typeof t.value=="object"&&!Array.isArray(t.value)?t.value:t;if(!n||typeof n!="object"||Array.isArray(n)||Object.keys(n).length===0)return null;const s=t.metadata&&typeof t.metadata=="object"&&!Array.isArray(t.metadata)?t.metadata:{},i=String(s.name||t.name||a||"Imported recipe").trim();return{created_at:String(t.created_at||new Date().toLocaleString()),name:i||"Imported recipe",description:typeof s.description=="string"?s.description:typeof t.description=="string"?t.description:void 0,train_type:typeof s.train_type=="string"?s.train_type:typeof t.train_type=="string"?t.train_type:typeof n.model_train_type=="string"?n.model_train_type:e.schemaName,route_id:typeof t.route_id=="string"?t.route_id:e.routeId,value:H(n)}}function hn(e,t,a){const n=a.trim();if(!n)throw new Error("Recipe file is empty.");const s=t.toLowerCase().endsWith(".json")?JSON.parse(n):qe(n),i=[];if(Array.isArray(s))s.forEach((r,c)=>{if(!r||typeof r!="object"||Array.isArray(r))return;const d=ot(e,r,`Imported recipe ${c+1}`);d&&i.push(d)});else if(s&&typeof s=="object"){const r=ot(e,s,t.replace(/\.[^.]+$/,""));r&&i.push(r)}if(i.length===0)throw new Error("No valid recipe entries were found in this file.");return i}function mn(e,t,a){var s;const n=D(e.routeId);n.unshift({time:new Date().toLocaleString(),name:J(e,t),value:H(t.values),gpu_ids:Ce(`${e.prefix}-gpu-selector`)}),te(e.routeId,$t(n)),(s=document.querySelector(`#${e.prefix}-history-panel`))!=null&&s.hidden||a()}function gn(e,t,a,n){var s,i,r,c;(s=document.querySelector(`#${e.prefix}-download-config`))==null||s.addEventListener("click",()=>{const d=t();if(!d)return;const p=a(d);z(`${e.prefix}-${ge()}.toml`,_e(p.payload)),v(e.prefix,"Exported current config as TOML.","success")}),(i=document.querySelector(`#${e.prefix}-export-preset`))==null||i.addEventListener("click",()=>{const d=t();if(!d)return;const p=a(d),u=un(e,d,p),l=pn(J(e,d)||e.prefix);z(`${l}-preset.toml`,_e(u)),v(e.prefix,"Exported current config as reusable preset TOML.","success")}),(r=document.querySelector(`#${e.prefix}-import-config`))==null||r.addEventListener("click",()=>{var d;(d=document.querySelector(`#${e.prefix}-config-file-input`))==null||d.click()}),(c=document.querySelector(`#${e.prefix}-config-file-input`))==null||c.addEventListener("change",d=>{var m;const p=d.currentTarget,u=(m=p.files)==null?void 0:m[0];if(!u)return;const l=new FileReader;l.onload=()=>{try{const g=qe(String(l.result??"")),b=g.data&&typeof g.data=="object"&&!Array.isArray(g.data)?g.data:g;n(b),v(e.prefix,g.data&&typeof g.data=="object"?`Imported preset: ${u.name}.`:`Imported config: ${u.name}.`,"success")}catch(g){v(e.prefix,g instanceof Error?g.message:"Failed to import config.","error")}finally{p.value=""}},l.readAsText(u)})}function fn(e,t){var a;(a=document.querySelector(`#${e.prefix}-history-file-input`))==null||a.addEventListener("change",n=>{var c;const s=n.currentTarget,i=(c=s.files)==null?void 0:c[0];if(!i)return;const r=new FileReader;r.onload=()=>{try{const d=JSON.parse(String(r.result??""));if(!Array.isArray(d))throw new Error("History file must contain an array.");const p=d.filter(l=>l&&typeof l=="object"&&l.value&&typeof l.value=="object").map(l=>({time:String(l.time||new Date().toLocaleString()),name:l.name?String(l.name):void 0,value:H(l.value),gpu_ids:Array.isArray(l.gpu_ids)?l.gpu_ids.map(m=>String(m)):[]}));if(p.length===0)throw new Error("History file did not contain valid entries.");const u=$t([...D(e.routeId),...p]);te(e.routeId,u),t(),v(e.prefix,`Imported ${p.length} history entries.`,"success")}catch(d){v(e.prefix,d instanceof Error?d.message:"Failed to import history.","error")}finally{s.value=""}},r.readAsText(i)})}function bn(e,t,a){var n;(n=document.querySelector(`#${e.prefix}-recipe-file-input`))==null||n.addEventListener("change",s=>{var d;const i=s.currentTarget,r=(d=i.files)==null?void 0:d[0];if(!r)return;const c=new FileReader;c.onload=()=>{try{const p=hn(e,r.name,String(c.result??"")),u=Ne([...p,...E(e.routeId)]);V(e.routeId,u),t(),a(),v(e.prefix,`Imported ${p.length} recipe ${p.length===1?"entry":"entries"}.`,"success")}catch(p){v(e.prefix,p instanceof Error?p.message:"Failed to import recipe.","error")}finally{i.value=""}},c.readAsText(r)})}function yn(e,t,a){f(`${e}-sample-prompt-workspace`,`
      <div class="submit-status-box">
        <strong>${o(t)}</strong>
        <p>${o(a)}</p>
      </div>
    `)}function vn(e){switch(e){case"prompt_file":return"Prompt file";case"generated":return"Generated from current fields";case"random_dataset_prompt_preview":return"Random dataset-derived prompt";case"legacy_sample_prompts_file":return"Legacy sample_prompts file";case"legacy_sample_prompts_inline":return"Legacy sample_prompts text";default:return e}}function oe(e){yn(e,"Sample prompt workspace is waiting for refresh","Edit prompt fields freely, then click Refresh prompt to inspect the exact text that would be used.")}function Q(e,t,a){if(a){f(`${e}-sample-prompt-workspace`,`
        <div class="submit-status-box submit-status-error">
          <strong>Sample prompt preview failed</strong>
          <p>${o(a)}</p>
        </div>
      `);return}if(!t){oe(e);return}const n=[t.warnings.length?`
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
        `:""].filter(Boolean).join(""),s=t.warnings.length>0||!t.enabled?"submit-status-warning":"submit-status-success",i=t.line_count>3?`Showing the first 3 non-empty lines out of ${t.line_count}.`:`${t.line_count||0} non-empty line${t.line_count===1?"":"s"} detected.`;f(`${e}-sample-prompt-workspace`,`
      <div class="submit-status-box ${s}">
        <strong>${t.enabled?"Sample prompt resolved":"Sample prompt resolved, but preview is disabled"}</strong>
        <p class="training-preflight-meta">${o(vn(t.source))}${t.detail?` · ${o(t.detail)}`:""}</p>
        <p class="training-preflight-meta">${o(i)} Download will use ${o(t.suggested_file_name)}.</p>
        ${n}
        <pre class="preset-preview">${o(t.preview)}</pre>
      </div>
    `)}async function lt(e,t,a){const n=t();if(!n)throw new Error(`${e.modelLabel} editor is not ready yet.`);const s=a(n),i=await ta(s.payload);if(i.status!=="success"||!i.data)throw new Error(i.message||"Sample prompt preview failed.");return i.data}function kn(e){var i,r,c,d;const{config:t,getCurrentState:a,buildPreparedTrainingPayload:n,applyEditableRecord:s}=e;(i=document.querySelector(`#${t.prefix}-refresh-sample-prompt`))==null||i.addEventListener("click",async()=>{try{const p=await lt(t,a,n);Q(t.prefix,p),v(t.prefix,"Sample prompt preview refreshed.","success")}catch(p){Q(t.prefix,null,p instanceof Error?p.message:"Sample prompt preview failed."),v(t.prefix,p instanceof Error?p.message:"Sample prompt preview failed.","error")}}),(r=document.querySelector(`#${t.prefix}-download-sample-prompt`))==null||r.addEventListener("click",async()=>{try{const p=await lt(t,a,n);Q(t.prefix,p),z(p.suggested_file_name||"sample-prompts.txt",p.content||""),v(t.prefix,`Sample prompt exported as ${p.suggested_file_name}.`,"success")}catch(p){Q(t.prefix,null,p instanceof Error?p.message:"Sample prompt export failed."),v(t.prefix,p instanceof Error?p.message:"Sample prompt export failed.","error")}}),(c=document.querySelector(`#${t.prefix}-pick-prompt-file`))==null||c.addEventListener("click",async()=>{try{const p=await O("text-file");s({prompt_file:p},void 0,"merge"),oe(t.prefix),v(t.prefix,"Prompt file path inserted into the current form state.","success")}catch(p){v(t.prefix,p instanceof Error?p.message:"Prompt file picker failed.","error")}}),(d=document.querySelector(`#${t.prefix}-clear-prompt-file`))==null||d.addEventListener("click",()=>{s({prompt_file:""},void 0,"merge"),oe(t.prefix),v(t.prefix,"prompt_file cleared from the current form state.","warning")})}function _n(e){var g,b,y,S,B,W,je,Oe;const{config:t,createDefaultState:a,getCurrentState:n,mountTrainingState:s,onStateChange:i,applyEditableRecord:r,buildPreparedTrainingPayload:c,bindHistoryPanel:d,bindRecipePanel:p,openHistoryPanel:u,openRecipePanel:l,openPresetPanel:m}=e;document.querySelectorAll(`#${t.prefix}-gpu-selector input[data-gpu-id]`).forEach(L=>{L.addEventListener("change",()=>{const Y=n();Y&&i(Y)})}),(g=document.querySelector(`#${t.prefix}-reset-all`))==null||g.addEventListener("click",()=>{const L=a();De(t.prefix,[]),s(L),v(t.prefix,"Reset to schema defaults.","warning")}),(b=document.querySelector(`#${t.prefix}-save-params`))==null||b.addEventListener("click",()=>{const L=n();L&&(mn(t,L,d),v(t.prefix,"Current parameters saved to history.","success"))}),(y=document.querySelector(`#${t.prefix}-read-params`))==null||y.addEventListener("click",()=>{u()}),(S=document.querySelector(`#${t.prefix}-clear-autosave`))==null||S.addEventListener("click",()=>{window.confirm("Clear the local autosave for this training route?")&&(Sa(t.routeId),Be(t.prefix,null),v(t.prefix,"Cleared local autosave for this route.","warning"))}),(B=document.querySelector(`#${t.prefix}-save-recipe`))==null||B.addEventListener("click",()=>{const L=n();if(!L)return;const Y=c(L);dn(t,L,Y,p)&&v(t.prefix,"Current config saved to the local recipe library.","success")}),(W=document.querySelector(`#${t.prefix}-read-recipes`))==null||W.addEventListener("click",()=>{l()}),(je=document.querySelector(`#${t.prefix}-import-recipe`))==null||je.addEventListener("click",()=>{var L;(L=document.querySelector(`#${t.prefix}-recipe-file-input`))==null||L.click()}),(Oe=document.querySelector(`#${t.prefix}-load-presets`))==null||Oe.addEventListener("click",()=>{m()}),gn(t,n,c,r),fn(t,u),bn(t,p,l),kn({config:t,getCurrentState:n,buildPreparedTrainingPayload:c,applyEditableRecord:r}),ln(t),cn(t,n,c)}function $n(e,t){let a=null;const n=(u,l,m)=>window.confirm(`Apply ${u} "${l}" to ${e.modelLabel}?

${m}

You can still continue, but some route-specific fields may need manual review afterwards.`),s=()=>{const u=D(e.routeId);sn(e.prefix,u),document.querySelectorAll(`#${e.prefix}-history-panel [data-history-close]`).forEach(l=>{l.addEventListener("click",()=>T(e.prefix,"history",!1))}),document.querySelectorAll(`#${e.prefix}-history-panel [data-history-export]`).forEach(l=>{l.addEventListener("click",()=>{z(`${e.prefix}-history-${ge()}.json`,JSON.stringify(D(e.routeId),null,2),"application/json;charset=utf-8"),v(e.prefix,"History exported.","success")})}),document.querySelectorAll(`#${e.prefix}-history-panel [data-history-import]`).forEach(l=>{l.addEventListener("click",()=>{var m;(m=document.querySelector(`#${e.prefix}-history-file-input`))==null||m.click()})}),document.querySelectorAll(`#${e.prefix}-history-panel [data-history-apply]`).forEach(l=>{l.addEventListener("click",()=>{const m=Number(l.dataset.historyApply??"-1"),g=D(e.routeId)[m];g&&(t(g.value,g.gpu_ids,"replace"),T(e.prefix,"history",!1),v(e.prefix,`Applied snapshot: ${g.name||"Unnamed snapshot"}.`,"success"))})}),document.querySelectorAll(`#${e.prefix}-history-panel [data-history-rename]`).forEach(l=>{l.addEventListener("click",()=>{const m=Number(l.dataset.historyRename??"-1"),g=D(e.routeId),b=g[m];if(!b)return;const y=window.prompt("Rename snapshot",b.name||"");y&&(b.name=y.trim(),te(e.routeId,g),s(),v(e.prefix,"Snapshot renamed.","success"))})}),document.querySelectorAll(`#${e.prefix}-history-panel [data-history-delete]`).forEach(l=>{l.addEventListener("click",()=>{const m=Number(l.dataset.historyDelete??"-1"),g=D(e.routeId),b=g[m];b&&window.confirm(`Delete snapshot "${b.name||"Unnamed snapshot"}"?`)&&(g.splice(m,1),te(e.routeId,g),s(),v(e.prefix,"Snapshot deleted.","success"))})})},i=()=>{s(),T(e.prefix,"history",!0)},r=()=>{const u=E(e.routeId);rn(e.prefix,u,e),document.querySelectorAll(`#${e.prefix}-recipes-panel [data-recipe-close]`).forEach(l=>{l.addEventListener("click",()=>T(e.prefix,"recipes",!1))}),document.querySelectorAll(`#${e.prefix}-recipes-panel [data-recipe-export-all]`).forEach(l=>{l.addEventListener("click",()=>{z(`${e.prefix}-recipes-${ge()}.json`,JSON.stringify(E(e.routeId),null,2),"application/json;charset=utf-8"),v(e.prefix,"Recipe library exported.","success")})}),document.querySelectorAll(`#${e.prefix}-recipes-panel [data-recipe-import]`).forEach(l=>{l.addEventListener("click",()=>{var m;(m=document.querySelector(`#${e.prefix}-recipe-file-input`))==null||m.click()})}),document.querySelectorAll(`#${e.prefix}-recipes-panel [data-recipe-merge]`).forEach(l=>{l.addEventListener("click",()=>{const m=Number(l.dataset.recipeMerge??"-1"),g=E(e.routeId)[m];if(!g)return;const b=xe(e,g);!b.compatible&&!n("recipe",g.name,b.detail)||(t(g.value,void 0,"merge"),T(e.prefix,"recipes",!1),v(e.prefix,`Merged recipe: ${g.name}.`,"success"))})}),document.querySelectorAll(`#${e.prefix}-recipes-panel [data-recipe-replace]`).forEach(l=>{l.addEventListener("click",()=>{const m=Number(l.dataset.recipeReplace??"-1"),g=E(e.routeId)[m];if(!g)return;const b=xe(e,g);!b.compatible&&!n("recipe",g.name,b.detail)||(t(g.value,void 0,"replace"),T(e.prefix,"recipes",!1),v(e.prefix,`Replaced current values with recipe: ${g.name}.`,"success"))})}),document.querySelectorAll(`#${e.prefix}-recipes-panel [data-recipe-export]`).forEach(l=>{l.addEventListener("click",()=>{const m=Number(l.dataset.recipeExport??"-1"),g=E(e.routeId)[m];g&&(z(`${g.name.replace(/[^0-9A-Za-z._-]+/g,"-")||"recipe"}-preset.toml`,_e({metadata:{name:g.name,version:"1.0",author:"SD-reScripts local recipe",train_type:g.train_type||e.schemaName,description:g.description||`Exported recipe from ${e.modelLabel}.`},data:g.value})),v(e.prefix,`Exported recipe: ${g.name}.`,"success"))})}),document.querySelectorAll(`#${e.prefix}-recipes-panel [data-recipe-rename]`).forEach(l=>{l.addEventListener("click",()=>{const m=Number(l.dataset.recipeRename??"-1"),g=E(e.routeId),b=g[m];if(!b)return;const y=window.prompt("Rename recipe",b.name);!y||!y.trim()||(b.name=y.trim(),V(e.routeId,g),r(),v(e.prefix,"Recipe renamed.","success"))})}),document.querySelectorAll(`#${e.prefix}-recipes-panel [data-recipe-delete]`).forEach(l=>{l.addEventListener("click",()=>{const m=Number(l.dataset.recipeDelete??"-1"),g=E(e.routeId),b=g[m];b&&window.confirm(`Delete recipe "${b.name}"?`)&&(g.splice(m,1),V(e.routeId,g),r(),v(e.prefix,"Recipe deleted.","success"))})})},c=()=>{r(),T(e.prefix,"recipes",!0)},d=()=>{nn(e.prefix,a??[],e),document.querySelectorAll(`#${e.prefix}-presets-panel [data-preset-close]`).forEach(u=>{u.addEventListener("click",()=>T(e.prefix,"presets",!1))}),document.querySelectorAll(`#${e.prefix}-presets-panel [data-preset-merge]`).forEach(u=>{u.addEventListener("click",()=>{const l=Number(u.dataset.presetMerge??"-1"),m=a==null?void 0:a[l];if(!m)return;const g=we(e,m),b=String((m.metadata??{}).name||m.name||"preset");if(!g.compatible&&!n("preset",b,g.detail))return;const y=m.data??{};t(y,void 0,"merge"),T(e.prefix,"presets",!1),v(e.prefix,`Merged preset: ${b}.`,"success")})}),document.querySelectorAll(`#${e.prefix}-presets-panel [data-preset-save-recipe]`).forEach(u=>{u.addEventListener("click",()=>{var S;const l=Number(u.dataset.presetSaveRecipe??"-1"),m=a==null?void 0:a[l];if(!m)return;const g=m.metadata??{},b=m.data??{},y=E(e.routeId);y.unshift({created_at:new Date().toLocaleString(),name:String(g.name||m.name||"Imported preset recipe"),description:typeof g.description=="string"?g.description:void 0,train_type:typeof g.train_type=="string"?g.train_type:e.schemaName,route_id:e.routeId,value:JSON.parse(JSON.stringify(b))}),V(e.routeId,Ne(y)),(S=document.querySelector(`#${e.prefix}-recipes-panel`))!=null&&S.hidden||r(),v(e.prefix,`Saved preset to local recipe library: ${String(g.name||m.name||"preset")}.`,"success")})}),document.querySelectorAll(`#${e.prefix}-presets-panel [data-preset-replace]`).forEach(u=>{u.addEventListener("click",()=>{const l=Number(u.dataset.presetReplace??"-1"),m=a==null?void 0:a[l];if(!m)return;const g=we(e,m),b=String((m.metadata??{}).name||m.name||"preset");if(!g.compatible&&!n("preset",b,g.detail))return;const y=m.data??{};t(y,void 0,"replace"),T(e.prefix,"presets",!1),v(e.prefix,`Replaced current values with preset: ${b}.`,"success")})})};return{bindHistoryPanel:s,bindRecipePanel:r,openHistoryPanel:i,openRecipePanel:c,openPresetPanel:async()=>{var u;if(!a)try{const l=await pt();a=on(e,((u=l.data)==null?void 0:u.presets)??[])}catch(l){v(e.prefix,l instanceof Error?l.message:"Failed to load presets.","error");return}d(),T(e.prefix,"presets",!0)}}}async function wn(e){var c,d,p,u;const t=os(e.prefix),[a,n]=await Promise.allSettled([Te(),dt()]);if(n.status==="fulfilled"){const l=((c=n.value.data)==null?void 0:c.cards)??[],m=(d=n.value.data)==null?void 0:d.xformers;Bs(`${e.prefix}-gpu-selector`,l),h(`${e.prefix}-runtime-title`,`${l.length} GPU entries reachable`),f(`${e.prefix}-runtime-body`,`
        <p>${o(ft(l))}</p>
        <p>${o(m?`xformers: ${m.installed?"installed":"missing"}, ${m.supported?"supported":"fallback"} (${m.reason})`:"xformers info unavailable")}</p>
      `)}else h(`${e.prefix}-runtime-title`,"GPU runtime request failed"),h(`${e.prefix}-runtime-body`,n.reason instanceof Error?n.reason.message:"Unknown error");if(a.status!=="fulfilled")return h(t.summaryId,`${e.modelLabel} schema request failed`),f(t.sectionsId,`<p>${a.reason instanceof Error?o(a.reason.message):"Unknown error"}</p>`),U(t.previewId,"{}"),I(e.prefix,"Schema unavailable",`The ${e.modelLabel} training bridge could not load the backend schema.`,"error"),null;const s=((p=a.value.data)==null?void 0:p.schemas)??[],i=wt(s),r=(u=ce(i).find(l=>l.name===e.schemaName))==null?void 0:u.name;return r?{domIds:t,createDefaultState:()=>se(i,r)}:(h(t.summaryId,`No ${e.schemaName} schema was returned.`),f(t.sectionsId,`<p>The backend did not expose ${o(e.schemaName)}.</p>`),I(e.prefix,"Schema missing",`The backend did not expose the ${e.schemaName} schema.`,"error"),null)}const ct={};function xn(e,t){const a=Tt(t),n=Ce(`${e}-gpu-selector`);n.length>0&&(a.gpu_ids=n);const s=Fe(a);return{payload:s,checks:tn(s)}}function Rt(e){return new Set(e.sections.flatMap(t=>t.fields.map(a=>a.path)))}function Ct(e,t){const a=Rt(e),n={...e.values};for(const[s,i]of Object.entries(t))a.has(s)&&(n[s]=i);return{...e,values:n}}function Sn(e,t){return{...e,values:{...e.values,...Object.fromEntries(Object.entries(t).filter(([a])=>Rt(e).has(a)))}}}function Tn(e,t){return t&&t.length>0?t.map(a=>String(a)):Array.isArray(e.gpu_ids)?e.gpu_ids.map(a=>String(a)):[]}function Ln(e,t){const a={time:new Date().toLocaleString(),name:J(e,t),value:H(t.values),gpu_ids:Ce(`${e.prefix}-gpu-selector`)};xa(e.routeId,a),Be(e.prefix,a)}function In(e){const{config:t,createDefaultState:a,mountTrainingState:n}=e,s=_t(t.routeId);Be(t.prefix,s);const i=s!=null&&s.value?Ct(a(),Nt(s.value)):a();(s==null?void 0:s.gpu_ids)!==void 0&&De(t.prefix,s.gpu_ids),n(i),s!=null&&s.value&&v(t.prefix,"Restored autosaved parameters for this route.","success")}function An(e,t,a,n,s){return i=>{try{const r=a(i),c=Object.fromEntries(Object.entries(r.payload).sort(([d],[p])=>d.localeCompare(p)));U(t.previewId,JSON.stringify(c,null,2)),ne(e.prefix,r.checks)}catch(r){U(t.previewId,"{}"),ne(e.prefix,{warnings:[],errors:[]},r instanceof Error?r.message:"The current state could not be converted into a launch payload.")}n(i),s==null||s()}}function En(e,t,a){const n=()=>ct[e.routeId],s=p=>xn(e.prefix,p),i=An(e,t,s,p=>Ln(e,p),()=>oe(e.prefix)),r=p=>{K(p,t,u=>{ct[e.routeId]=u},i)};return{getCurrentState:n,prepareTrainingPayload:s,onStateChange:i,mountTrainingState:r,applyEditableRecord:(p,u,l="replace")=>{const m=l==="merge"?n()??a():a(),g=Nt(p),b=l==="merge"?Sn(m,g):Ct(m,g);De(e.prefix,Tn(g,u)),r(b)},restoreAutosave:()=>In({config:e,createDefaultState:a,mountTrainingState:r})}}async function Pn(e){const t=await wn(e);if(!t)return;const a=En(e,t.domIds,t.createDefaultState),n=$n(e,a.applyEditableRecord);a.restoreAutosave(),_n({config:e,createDefaultState:t.createDefaultState,getCurrentState:a.getCurrentState,mountTrainingState:a.mountTrainingState,onStateChange:a.onStateChange,applyEditableRecord:a.applyEditableRecord,buildPreparedTrainingPayload:a.prepareTrainingPayload,bindHistoryPanel:n.bindHistoryPanel,bindRecipePanel:n.bindRecipePanel,openHistoryPanel:n.openHistoryPanel,openRecipePanel:n.openRecipePanel,openPresetPanel:n.openPresetPanel}),I(e.prefix,`${e.modelLabel} bridge ready`,"You can review the generated payload and submit the current config to /api/run.","success"),T(e.prefix,"history",!1),T(e.prefix,"recipes",!1),T(e.prefix,"presets",!1)}const Nn={overview:Lt,about:ps,settings:As,tasks:Ps,tageditor:Es,tensorboard:Ns,tools:Rs,"schema-bridge":ks,"sdxl-train":Is,"flux-train":fs,"sd3-train":$s,"sd3-finetune-train":_s,"dreambooth-train":hs,"flux-finetune-train":gs,"sd-controlnet-train":ws,"sdxl-controlnet-train":Ss,"flux-controlnet-train":ms,"sdxl-lllite-train":Ts,"sd-ti-train":xs,"xti-train":Ds,"sdxl-ti-train":Ls,"anima-train":ds,"anima-finetune-train":us,"lumina-train":vs,"lumina-finetune-train":ys,"hunyuan-image-train":bs};function Rn(e){const t={overview:j.filter(a=>a.section==="overview"),phase1:j.filter(a=>a.section==="phase1"),reference:j.filter(a=>a.section==="reference")};return`
    <div class="nav-group">
      <p class="nav-heading">Workspace</p>
      ${t.overview.map(a=>me(a.hash,a.label,a.description,e)).join("")}
    </div>
    <div class="nav-group">
      <p class="nav-heading">Phase 1 Pages</p>
      ${t.phase1.map(a=>me(a.hash,a.label,a.description,e)).join("")}
    </div>
    <div class="nav-group">
      <p class="nav-heading">Core Bridge</p>
      ${t.reference.map(a=>me(a.hash,a.label,a.description,e)).join("")}
    </div>
  `}function me(e,t,a,n){return`
    <a class="nav-link ${e===n?"is-active":""}" href="${e}">
      <span>${t}</span>
      <small>${a}</small>
    </a>
  `}async function Cn(e){e==="overview"?await Ta():e==="settings"?await Aa():e==="tasks"?await Wa():e==="tageditor"?await Na():e==="tools"?await Ra():e==="schema-bridge"?await ls(()=>{}):fe[e]&&await Pn(fe[e])}async function Dn(e){ka();const t=va(),a=Nn[t.id]??Lt;e.innerHTML=cs(t.hash,a());const n=document.querySelector("#side-nav");n&&(n.innerHTML=Rn(t.hash)),await Cn(t.id)}const Dt=document.querySelector("#app");if(!(Dt instanceof HTMLElement))throw new Error("App root not found.");const Bn=Dt;async function Bt(){await Dn(Bn)}window.addEventListener("hashchange",()=>{Bt()});Bt();
