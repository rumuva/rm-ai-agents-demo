"use strict";
(function(root){
  const sectors=new Set(["Academia","Comercio","Restaurante","Inmobiliaria","Servicios","Otro"]);
  function validateAgentImport(data){
    if(!data||typeof data!=="object"||Array.isArray(data))throw new Error("El archivo no contiene un agente válido.");
    const keys=Object.keys(data);
    if(keys.length!==5||!["format","version","name","sector","facts"].every(k=>Object.hasOwn(data,k)))throw new Error("El archivo tiene una estructura inesperada.");
    if(data.format!=="rm-ai-agents-demo"||data.version!==1)throw new Error("Formato o versión no compatibles.");
    if(typeof data.name!=="string"||!data.name.trim()||data.name.length>80)throw new Error("Nombre inválido (máximo 80 caracteres).");
    if(typeof data.sector!=="string"||!sectors.has(data.sector))throw new Error("Sector no reconocido.");
    if(typeof data.facts!=="string"||!data.facts.trim()||data.facts.length>5000)throw new Error("Información verificada inválida (máximo 5000 caracteres).");
    return {name:data.name.trim(),sector:data.sector,facts:data.facts.trim()};
  }
  root.validateAgentImport=validateAgentImport;
})(globalThis);
