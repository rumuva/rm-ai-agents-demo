"use strict";
const $=id=>document.getElementById(id);
const KEY="rm-ai-agents-demo-v1";
let agents=[],active=null;
try{const parsed=JSON.parse(localStorage.getItem(KEY)||"[]");if(Array.isArray(parsed))agents=parsed.filter(a=>a&&typeof a.id==="string"&&typeof a.name==="string"&&typeof a.facts==="string").slice(0,50);}catch{}
function save(){try{localStorage.setItem(KEY,JSON.stringify(agents));return true;}catch{alert("No se pudo guardar en este navegador.");return false;}}
function node(tag,content){const el=document.createElement(tag);el.textContent=content;return el;}
function render(){const root=$("agents");root.replaceChildren();if(!agents.length)root.append(node("p","Todavía no tienes asistentes. Completa los tres pasos de arriba para crear el primero."));for(const a of agents){const card=document.createElement("article");card.className="agent-card";card.append(node("h3",a.name),node("p",a.sector));const test=node("button","Probar conversación");test.type="button";test.addEventListener("click",()=>{active=a.id;$("chat-section").hidden=false;$("chat-title").textContent="Chat de prueba: "+a.name;$("messages").replaceChildren();$("question").focus();});const remove=node("button","Eliminar");remove.type="button";remove.addEventListener("click",()=>{if(confirm("¿Eliminar este asistente? Esta acción no se puede deshacer.")){agents=agents.filter(x=>x.id!==a.id);if(active===a.id){active=null;$("chat-section").hidden=true;}save();render();}});const download=node("button","Guardar copia en mi equipo");download.type="button";download.addEventListener("click",()=>{
  const exportData={format:"rm-ai-agents-demo",version:1,name:a.name,sector:a.sector,facts:a.facts};
  const blob=new Blob([JSON.stringify(exportData,null,2)],{type:"application/json"});
  const url=URL.createObjectURL(blob);
  const link=document.createElement("a");
  link.href=url;link.download="agente-"+a.id+".json";
  document.body.append(link);link.click();link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
});card.append(test,download,remove);root.append(card);}}
const sectorExamples={
  Academia:"Horario: lunes a viernes de 9:00 a 14:00.\nCursos: informática básica y ofimática.\nMatrícula: solicitar información en recepción.",
  Comercio:"Horario: lunes a sábado de 10:00 a 14:00.\nProductos: artículos para el hogar.\nDevoluciones: consultar condiciones en tienda.",
  Restaurante:"Horario: martes a domingo de 13:00 a 16:00.\nReservas: consultar disponibilidad por teléfono.\nCarta: platos del día y opciones vegetarianas.",
  Inmobiliaria:"Horario de atención: lunes a viernes de 10:00 a 18:00.\nServicios: alquiler y compraventa de viviendas.\nVisitas: solicitar cita previa.",
  Servicios:"Horario: lunes a viernes de 9:00 a 18:00.\nServicios: asesoramiento y atención al cliente.\nPresupuestos: solicitar valoración sin compromiso.",
  Otro:"Horario: lunes a viernes de 9:00 a 14:00.\nServicios: información y atención al público.\nContacto: consultar con el equipo."
};
$("fill-example").addEventListener("click",()=>{
  const field=$("agent-facts");
  if(field.value.trim()&&!confirm("¿Quieres sustituir el texto actual por un ejemplo ficticio?"))return;
  field.value=sectorExamples[$("agent-sector").value]||sectorExamples.Otro;
  $("example-explanation").textContent="Ejemplo añadido. Revisa y cambia los datos para adaptarlos a tu negocio.";
  field.focus();
});
let wizardStep=1;
function showWizardStep(step){
  wizardStep=step;
  for(const panel of document.querySelectorAll(".wizard-step"))panel.hidden=Number(panel.dataset.step)!==step;
  $("wizard-progress").value=step;
  $("wizard-progress-text").textContent=["","Paso 1 de 3: presenta tu negocio","Paso 2 de 3: explica qué debe saber","Paso 3 de 3: revisa y guarda"][step];
  $("wizard-feedback").textContent="";
  if(step===3){
    const review=$("wizard-review");review.replaceChildren();
    review.append(node("p","Asistente: "+$("agent-name").value.trim()),node("p","Negocio: "+$("agent-sector").value),node("p","Información:"));
    const pre=node("p",$("agent-facts").value.trim());pre.style.whiteSpace="pre-wrap";review.append(pre);
  }
}
document.querySelectorAll(".wizard-next").forEach(button=>button.addEventListener("click",()=>{
  const step=Number(button.dataset.next);
  if(step===2&&!$("agent-name").reportValidity())return;
  if(step===3&&!$("agent-facts").reportValidity())return;
  showWizardStep(step);
}));
document.querySelectorAll(".wizard-back").forEach(button=>button.addEventListener("click",()=>showWizardStep(Number(button.dataset.back))));
$("agent-form").addEventListener("submit",e=>{e.preventDefault();const name=$("agent-name").value.trim(),facts=$("agent-facts").value.trim();if(!name||!facts)return;if(agents.length>=50){alert("Límite de 50 agentes de demostración.");return;}const entry={id:crypto.randomUUID(),name,sector:$("agent-sector").value,facts};agents.push(entry);if(!save()){agents=agents.filter(item=>item.id!==entry.id);return;}$("agent-form").reset();showWizardStep(1);render();$("wizard-feedback").textContent="Asistente creado correctamente. Abajo encontrarás el botón para probar una conversación.";$("agents").scrollIntoView({behavior:"smooth",block:"start"});});
function respond(agent,question){const words=question.toLocaleLowerCase("es").match(/[\p{L}\p{N}]{4,}/gu)||[];const stop=new Set(["para","sobre","tiene","tienen","quiero","puedo","cuanto","cuando","donde","cuales","hacer","este","esta","estos","estas","hola","buenas","favor","informacion"]);const useful=words.filter(w=>!stop.has(w));if(!useful.length)return "¿Puedes concretar tu consulta?";const lines=agent.facts.split(/\n+/).map(s=>s.trim()).filter(Boolean);const hits=lines.map(line=>({line,score:useful.filter(w=>line.toLocaleLowerCase("es").includes(w)).length})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,3);return hits.length?"Información facilitada por el negocio:\n"+hits.map(x=>"- "+x.line).join("\n"):"No tengo información confirmada para responder. Consulta con una persona responsable del negocio.";}
$("chat-form").addEventListener("submit",e=>{e.preventDefault();const a=agents.find(x=>x.id===active);if(!a)return;const q=$("question").value.trim();if(!q)return;const box=$("messages");box.append(node("p","Tú: "+q),node("p","Simulador: "+respond(a,q)));$("question").value="";});

$("import-button").addEventListener("click",async()=>{
  const status=$("import-status");
  const file=$("import-file").files?.[0];
  if(!file){status.textContent="Primero selecciona el archivo de copia que guardaste.";return;}
  if(file.size>16384){status.textContent="Archivo demasiado grande (máximo 16 KB).";return;}
  if(agents.length>=50){status.textContent="Se ha alcanzado el límite de 50 agentes.";return;}
  const button=$("import-button");button.disabled=true;
  try{
    const data=JSON.parse(await file.text());
    const agent=validateAgentImport(data);
    const entry={id:crypto.randomUUID(),...agent};
    agents.push(entry);
    if(!save()){agents=agents.filter(item=>item.id!==entry.id);throw new Error("No se pudo guardar el agente importado.");}
    render();
    $("import-file").value="";
    status.textContent="Agente importado en este navegador: "+agent.name;
  }catch(error){
    status.textContent=error instanceof SyntaxError?"No podemos leer este archivo. Selecciona una copia creada desde este programa.":error.message||"No se pudo importar el archivo.";
  }finally{button.disabled=false;}
});

render();