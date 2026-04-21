import{f as defineComponent,C as onMounted,o as openBlock,c as createElementBlock,a as createBaseVNode,b as createTextVNode}from"./app.547295de.js";

const _hoisted_1={class:"community-ui-settings"};
const _hoisted_2=createBaseVNode("h1",{id:"ui切换",tabindex:"-1"},[
createBaseVNode("a",{class:"header-anchor",href:"#ui切换","aria-hidden":"true"},"#"),
createTextVNode(" UI切换 ")
],-1);
const _hoisted_3=createBaseVNode("p",null,"这里切换的是整套 UI，不只是颜色主题。切换后页面会自动刷新。",-1);
const _hoisted_4=createBaseVNode("div",{id:"community-ui-manager",style:"margin-top:20px;padding:16px;border:1px solid var(--c-border,#dcdfe6);border-radius:12px;background:var(--c-bg-light,#f8f8f8);"},[
createBaseVNode("p",{style:"margin:0 0 12px 0;font-weight:600;"},"社区UI"),
createBaseVNode("p",{style:"margin:0 0 12px 0;line-height:1.7;"},"已安装的社区UI会显示在下面。你也可以直接输入 GitHub 仓库地址安装。选择后会立即切换到对应UI。"),
createBaseVNode("div",{style:"display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin:12px 0 16px 0;padding:12px;border-radius:10px;border:1px dashed var(--c-border,#dcdfe6);background:var(--c-bg,#fff);"},[
createBaseVNode("label",{for:"community-ui-repo-url",style:"min-width:84px;font-weight:600;"},"GitHub 仓库"),
createBaseVNode("input",{id:"community-ui-repo-url",type:"text",placeholder:"https://github.com/owner/repo",style:"flex:1 1 360px;min-width:280px;padding:8px 10px;border-radius:8px;border:1px solid var(--c-border,#dcdfe6);background:var(--c-bg,#fff);color:inherit;"}),
createBaseVNode("button",{id:"community-ui-install",type:"button",style:"padding:8px 14px;border-radius:8px;border:1px solid var(--c-border,#dcdfe6);background:var(--vp-c-brand,#3eaf7c);color:#fff;cursor:pointer;opacity:0.95;"},"安装社区UI")
],-1),
createBaseVNode("p",{id:"community-ui-active",style:"margin:0 0 10px 0;padding:10px 12px;border-radius:10px;background:rgba(62,175,124,0.12);color:inherit;font-weight:600;line-height:1.7;"},"当前UI：读取中..."),
createBaseVNode("div",{style:"display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin:12px 0;"},[
createBaseVNode("label",{for:"community-ui-profile-select",style:"min-width:84px;font-weight:600;"},"当前UI"),
createBaseVNode("select",{id:"community-ui-profile-select",disabled:"disabled",style:"min-width:280px;padding:8px 10px;border-radius:8px;border:1px solid var(--c-border,#dcdfe6);background:var(--c-bg,#fff);color:inherit;"},[
createBaseVNode("option",{value:""},"正在加载UI列表...")
]),
createBaseVNode("button",{id:"community-ui-refresh",type:"button",style:"padding:8px 14px;border-radius:8px;border:1px solid var(--c-border,#dcdfe6);background:var(--c-bg,#fff);cursor:pointer;"},"刷新UI列表"),
createBaseVNode("button",{id:"community-ui-apply",type:"button",disabled:"disabled",style:"padding:8px 14px;border-radius:8px;border:1px solid var(--c-border,#dcdfe6);background:var(--vp-c-brand,#3eaf7c);color:#fff;cursor:pointer;opacity:0.95;"},"切换UI并刷新"),
createBaseVNode("button",{id:"community-ui-uninstall",type:"button",disabled:"disabled",style:"padding:8px 14px;border-radius:8px;border:1px solid #e36d6d;background:#fff5f5;color:#c45656;cursor:pointer;opacity:0.95;"},"卸载社区UI")
],-1),
createBaseVNode("p",{id:"community-ui-meta",style:"margin:0 0 8px 0;color:var(--c-text-light,#666);line-height:1.7;"},"读取已安装社区UI中..."),
createBaseVNode("p",{id:"community-ui-plugin-root",style:"margin:0 0 8px 0;color:var(--c-text-light,#666);line-height:1.7;"},""),
createBaseVNode("p",{id:"community-ui-status",style:"margin:0;color:var(--c-text-light,#666);line-height:1.7;"},"")
],-1);
const _hoisted_5=[_hoisted_2,_hoisted_3,_hoisted_4];

const _sfc_main=defineComponent({
name:"CommunityUISettings",
setup(){
onMounted(()=>{
const select=document.getElementById("community-ui-profile-select");
const refreshBtn=document.getElementById("community-ui-refresh");
const applyBtn=document.getElementById("community-ui-apply");
const uninstallBtn=document.getElementById("community-ui-uninstall");
const installBtn=document.getElementById("community-ui-install");
const repoInput=document.getElementById("community-ui-repo-url");
const activeLine=document.getElementById("community-ui-active");
const meta=document.getElementById("community-ui-meta");
const status=document.getElementById("community-ui-status");
const pluginRoot=document.getElementById("community-ui-plugin-root");
let profiles=[];
let activeProfileId="";

if(!select||!refreshBtn||!applyBtn||!uninstallBtn||!installBtn||!repoInput||!activeLine||!meta||!status||!pluginRoot){
return;
}

const setStatus=(message,isError=false)=>{
status.textContent=message||"";
status.style.color=isError?"#c45656":"var(--c-text-light,#666)";
};

const renderProfileMeta=()=>{
const selectedId=select.value;
const profile=profiles.find(item=>item.id===selectedId);
const activeProfile=profiles.find(item=>item.id===activeProfileId);
if(activeProfile){
activeLine.textContent=`当前UI：${activeProfile.name}${activeProfile.version?` v${activeProfile.version}`:""}`;
}else{
activeLine.textContent="当前UI：未识别";
}
if(!profile){
meta.textContent="未找到当前UI信息。";
applyBtn.disabled=true;
uninstallBtn.disabled=true;
return;
}
const kindLabel=profile.kind==="community"?"社区":"内置";
const versionText=profile.version?` | 版本：${profile.version}`:"";
const sourceText=profile.source_path?` | 入口：${profile.source_path}`:"";
const sourceUrlText=profile.source_url?` | 来源：${profile.source_url}`:"";
meta.textContent=`UI类型：${kindLabel}${versionText}${sourceText}${sourceUrlText}`;
applyBtn.disabled=!profile.available||selectedId===activeProfileId;
uninstallBtn.disabled=!(profile.kind==="community"&&profile.removable);
};

const loadProfiles=async()=>{
setStatus("正在读取已安装社区UI...");
refreshBtn.disabled=true;
applyBtn.disabled=true;
uninstallBtn.disabled=true;
installBtn.disabled=true;
repoInput.disabled=true;
select.disabled=true;
try{
const response=await fetch("/api/ui_profiles",{cache:"no-store"});
let payload=null;
try{
payload=await response.json();
}catch(error){
throw new Error("UI列表接口返回的 JSON 无效。");
}
if(!response.ok||payload?.status!=="success"){
throw new Error(payload?.message||`请求失败：${response.status}`);
}

profiles=Array.isArray(payload.data?.profiles)?payload.data.profiles:[];
activeProfileId=payload.data?.active_profile_id||"";
pluginRoot.textContent=payload.data?.plugin_root?`插件目录：${payload.data.plugin_root}`:"";

select.innerHTML="";
if(profiles.length===0){
const option=document.createElement("option");
option.value="";
option.textContent="未发现可用社区UI";
select.appendChild(option);
meta.textContent="当前没有可切换的社区UI。";
setStatus("未发现可用社区UI。",true);
return;
}

for(const profile of profiles){
const option=document.createElement("option");
option.value=profile.id;
const prefix=profile.kind==="community"?"[社区] ":"[内置] ";
const version=profile.version?` v${profile.version}`:"";
const suffix=profile.available?"":" (未就绪)";
const activeMark=profile.id===activeProfileId?" ★当前":"";
option.textContent=`${prefix}${profile.name}${version}${suffix}${activeMark}`;
if(profile.id===activeProfileId){
option.selected=true;
}
select.appendChild(option);
}

select.disabled=false;
renderProfileMeta();
setStatus("UI列表已刷新。");
}catch(error){
meta.textContent="UI列表读取失败。";
setStatus(error instanceof Error?error.message:"UI列表读取失败。",true);
}finally{
refreshBtn.disabled=false;
installBtn.disabled=false;
repoInput.disabled=false;
if(!select.disabled){
renderProfileMeta();
}
}
};

select.onchange=()=>{
renderProfileMeta();
setStatus("");
};

refreshBtn.onclick=()=>{
loadProfiles();
};

installBtn.onclick=async()=>{
const repoUrl=String(repoInput.value||"").trim();
if(!repoUrl){
setStatus("请输入 GitHub 仓库地址。",true);
return;
}
if(!window.confirm(`即将从以下 GitHub 仓库下载并安装社区UI：\n\n${repoUrl}\n\n是否继续？`)){
setStatus("已取消安装社区UI。");
return;
}
installBtn.disabled=true;
refreshBtn.disabled=true;
applyBtn.disabled=true;
uninstallBtn.disabled=true;
select.disabled=true;
repoInput.disabled=true;
setStatus("正在从 GitHub 下载并安装社区UI...");
try{
const response=await fetch("/api/ui_profiles/install",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({repo_url:repoUrl}),
});
let payload=null;
try{
payload=await response.json();
}catch(error){
throw new Error("安装社区UI接口返回的 JSON 无效。");
}
if(!response.ok||payload?.status!=="success"){
throw new Error(payload?.message||`请求失败：${response.status}`);
}
repoInput.value="";
setStatus("安装成功，正在刷新UI列表...");
await loadProfiles();
const installedId=payload?.data?.installed_profile?.id||"";
if(installedId){
select.value=installedId;
renderProfileMeta();
}
setStatus("安装完成。现在可以直接切换到新UI。");
}catch(error){
setStatus(error instanceof Error?error.message:"安装社区UI失败。",true);
refreshBtn.disabled=false;
installBtn.disabled=false;
repoInput.disabled=false;
if(!select.disabled){
renderProfileMeta();
}
}
};

uninstallBtn.onclick=async()=>{
const profileId=select.value;
const profile=profiles.find(item=>item.id===profileId);
if(!profile){
setStatus("未找到要卸载的社区UI。",true);
return;
}
if(profile.kind!=="community"){
setStatus("内置UI不能在这里卸载。",true);
return;
}
if(!profile.removable){
setStatus(profile.remove_block_reason||"这个社区UI不能在这里卸载。",true);
return;
}
if(!window.confirm(`即将卸载社区UI：\n\n${profile.name}\n\n卸载后将删除其插件目录。是否继续？`)){
setStatus("已取消卸载社区UI。");
return;
}
installBtn.disabled=true;
refreshBtn.disabled=true;
applyBtn.disabled=true;
uninstallBtn.disabled=true;
select.disabled=true;
repoInput.disabled=true;
setStatus("正在卸载社区UI...");
try{
const response=await fetch("/api/ui_profiles/uninstall",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({profile_id:profileId}),
});
let payload=null;
try{
payload=await response.json();
}catch(error){
throw new Error("卸载接口返回的 JSON 无效。");
}
if(!response.ok||payload?.status!=="success"){
throw new Error(payload?.message||`请求失败：${response.status}`);
}
setStatus("卸载成功，正在刷新UI列表...");
await loadProfiles();
if(payload?.data?.reload_required){
setStatus("卸载完成，正在刷新页面...");
window.setTimeout(()=>window.location.assign("/"),200);
}else{
setStatus("卸载完成。");
}
}catch(error){
setStatus(error instanceof Error?error.message:"卸载社区UI失败。",true);
refreshBtn.disabled=false;
installBtn.disabled=false;
repoInput.disabled=false;
if(!select.disabled){
renderProfileMeta();
}
}
};

applyBtn.onclick=async()=>{
const profileId=select.value;
if(!profileId){
setStatus("请选择要切换的UI。",true);
return;
}
applyBtn.disabled=true;
refreshBtn.disabled=true;
uninstallBtn.disabled=true;
setStatus("正在切换UI...");
try{
const response=await fetch("/api/ui_profiles/activate",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({profile_id:profileId}),
});
let payload=null;
try{
payload=await response.json();
}catch(error){
throw new Error("UI切换接口返回的 JSON 无效。");
}
if(!response.ok||payload?.status!=="success"){
throw new Error(payload?.message||`请求失败：${response.status}`);
}
setStatus("UI切换成功，正在刷新页面...");
window.setTimeout(()=>window.location.assign("/"),200);
}catch(error){
setStatus(error instanceof Error?error.message:"切换UI失败。",true);
refreshBtn.disabled=false;
installBtn.disabled=false;
repoInput.disabled=false;
renderProfileMeta();
}
};

loadProfiles();
});
return()=>(
openBlock(),
createElementBlock("div",_hoisted_1,_hoisted_5)
);
}
});

export{_sfc_main as default};
