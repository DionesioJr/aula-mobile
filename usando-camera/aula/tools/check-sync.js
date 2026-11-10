#!/usr/bin/env node
/* =========================================================================
   CHECK-SYNC, detector de divergência entre a aula e o código real
   ---------------------------------------------------------------------------
   Reconstrói o estado final de cada arquivo a partir das etapas da aula
   (mesma lógica de aula/player/virtual-fs.js) e compara com o arquivo
   correspondente no projeto real. Não corrige nada sozinho, só aponta
   onde a aula ficou desatualizada.

   Uso: node aula/tools/check-sync.js
        pnpm check-aula
   ========================================================================= */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const AULA_DIR = path.resolve(__dirname, '..');
const ROOT_DIR = path.resolve(AULA_DIR, '..');
const REPO_ROOT = path.resolve(ROOT_DIR, '..');
const LESSON_FILE = path.join(AULA_DIR, 'aulas/usando-camera.js');

/* Dependências que o Expo Snack já inclui por padrão em todo projeto novo:
   a aula não ensina o aluno a declará-las, então não é divergência real. */
const DEPS_BASE_DO_SNACK = new Set([
  'expo', 'react', 'react-dom', 'react-native', 'react-native-web',
  '@types/react', 'typescript', '@expo/metro-runtime',
]);

/* Executa os scripts da aula num sandbox com um `window` falso e devolve
   o objeto final da aula (a global AULA_*) já resolvido. */
function carregarAula(){
  const sandbox = { window: {}, console };
  sandbox.window.window = sandbox.window;
  vm.createContext(sandbox);
  const arquivos = [path.join(REPO_ROOT, 'shared/player/virtual-fs.js'), LESSON_FILE];
  for (const arquivo of arquivos){
    const codigo = fs.readFileSync(arquivo, 'utf8');
    vm.runInContext(codigo, sandbox, { filename: arquivo });
  }
  const nomeGlobal = Object.keys(sandbox.window).find(k => /^AULA_/.test(k));
  const aula = nomeGlobal ? sandbox.window[nomeGlobal] : null;
  const { snapshot } = sandbox.window.AulaEngine.fs;
  if (!aula) throw new Error('Nenhuma global AULA_* foi montada, verifique ' + path.relative(ROOT_DIR, LESSON_FILE));
  return { aula, snapshot };
}

/* ---------- Diff simples de linhas (LCS) ---------- */
function diffLinhas(a, b){
  const n = a.length, m = b.length;
  const dp = Array.from({length: n+1}, () => new Uint32Array(m+1));
  for (let i = n-1; i >= 0; i--){
    for (let j = m-1; j >= 0; j--){
      dp[i][j] = a[i] === b[j] ? dp[i+1][j+1] + 1 : Math.max(dp[i+1][j], dp[i][j+1]);
    }
  }
  const out = [];
  let i = 0, j = 0;
  while (i < n && j < m){
    if (a[i] === b[j]){ out.push({t:'=', v:a[i]}); i++; j++; }
    else if (dp[i+1][j] >= dp[i][j+1]){ out.push({t:'-', v:a[i]}); i++; }
    else { out.push({t:'+', v:b[j]}); j++; }
  }
  while (i < n) out.push({t:'-', v:a[i++]});
  while (j < m) out.push({t:'+', v:b[j++]});
  return out;
}
function imprimirDiff(diff, contexto){
  const CTX = contexto || 2;
  let ultimoImpresso = -1;
  diff.forEach((linha, idx) => {
    if (linha.t === '=') return;
    const de = Math.max(0, idx - CTX);
    if (de > ultimoImpresso + 1) console.log('    ...');
    for (let k = Math.max(de, ultimoImpresso + 1); k < idx; k++){
      console.log('      ' + diff[k].v);
    }
    console.log((linha.t === '-' ? '    - ' : '    + ') + linha.v);
    ultimoImpresso = idx;
  });
}

/* ---------- Comparação ---------- */
function normaliza(txt){ return txt.replace(/\r\n/g, '\n').replace(/\s+$/, '') + '\n'; }

function checarDependencias(aula){
  const pkgReal = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'package.json'), 'utf8'));
  const depsReais = { ...(pkgReal.dependencies||{}), ...(pkgReal.devDependencies||{}) };
  const problemas = [];
  const lista = (aula.deps && aula.deps.lista) || [];
  lista.forEach(d => {
    if (!(d.name in depsReais)) problemas.push(`  falta no package.json real: ${d.name}@${d.ver}`);
    else if (d.ver && d.ver !== '*' && depsReais[d.name] !== d.ver){
      problemas.push(`  versão diferente: ${d.name}, aula diz ${d.ver}, projeto real tem ${depsReais[d.name]}`);
    }
  });
  Object.keys(depsReais).forEach(nome => {
    if (DEPS_BASE_DO_SNACK.has(nome)) return; // já vem de fábrica no Snack
    if (!lista.some(d => d.name === nome)){
      problemas.push(`  no projeto real mas não listado na aula: ${nome}@${depsReais[nome]}`);
    }
  });
  return problemas;
}

function main(){
  const { aula, snapshot } = carregarAula();
  const steps = aula.steps;
  const final = snapshot(steps, aula.inicial, steps.length - 1);

  let divergencias = 0;
  let cobertos = 0;
  let semCorrespondente = [];

  Object.keys(final.files).sort().forEach(relPath => {
    if (relPath === 'package.json') return; // conferido à parte, é curado
    const abs = path.join(ROOT_DIR, relPath);
    if (!fs.existsSync(abs)){
      semCorrespondente.push(relPath);
      return;
    }
    cobertos++;
    const conteudoAula = normaliza(final.files[relPath] || '');
    const conteudoReal = normaliza(fs.readFileSync(abs, 'utf8'));
    if (conteudoAula !== conteudoReal){
      divergencias++;
      console.log(`\n✗ ${relPath}, aula desatualizada em relação ao projeto real`);
      imprimirDiff(diffLinhas(conteudoAula.split('\n'), conteudoReal.split('\n')));
    }
  });

  const problemasDeps = checarDependencias(aula);

  console.log('\n' + '-'.repeat(60));
  console.log(`Arquivos comparados: ${cobertos}`);
  console.log(`Divergentes: ${divergencias}`);
  if (semCorrespondente.length){
    console.log(`\nArquivos citados na aula mas que não existem mais no projeto real:`);
    semCorrespondente.forEach(p => console.log('  ' + p));
  }
  if (problemasDeps.length){
    console.log(`\nDependências fora de sincronia (aula vs package.json real):`);
    problemasDeps.forEach(p => console.log(p));
  }
  console.log('-'.repeat(60));

  if (divergencias > 0 || semCorrespondente.length || problemasDeps.length){
    console.log('\nAtualize os blocos `code`/`insert` correspondentes em aula/aulas/usando-camera.js.');
    process.exitCode = 1;
  } else {
    console.log('\nAula em sincronia com o código real.');
  }
}

main();
