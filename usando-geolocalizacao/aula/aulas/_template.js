/* =========================================================================
   TEMPLATE DE AULA: copie este arquivo para criar uma aula nova.

   1. Copie para aulas/minha-aula.js
   2. Troque meta, deps e steps
   3. Troque o nome do registro no final (global.MINHA_AULA)
   4. Copie o HTML de exemplo (veja player/README.md) apontando para ele
   ========================================================================= */
(function (global) {
'use strict';

/* Projeto começa vazio. Para começar com arquivos já existentes:
   INITIAL_ENTRIES = [{path:'App.js', type:'file'}]
   INITIAL_FILES   = {'App.js': 'console.log("oi");\n'}            */
const INITIAL_ENTRIES = [];
const INITIAL_FILES = {};

/* Dependências mostradas na lateral. 'desde' = índice (base 0) da etapa a
   partir da qual elas aparecem acesas. Remova o bloco se a aula não usa. */
const DEP_STEP = 0;
const DEPS = [
  // {name:'alguma-lib', ver:'^1.0.0'},
];

/* =========================================================================
   ROTEIRO
   ops: intro | note | challenge | outro | folder | file | code | insert | replace | clear | delete | rename
   ========================================================================= */
const STEPS = [
{
  part:'Preparação', op:'intro',
  title:'Título da aula',
  eyebrow:'Disciplina · Ferramenta',
  lead:'Uma frase dizendo o que a turma vai construir.',
  bullets:[
    '<b>Ponto 1:</b> o que será visto.',
    '<b>Ponto 2:</b> o que será visto.',
  ],
  tip:'<b>→</b> avança &nbsp;·&nbsp; <b>←</b> volta &nbsp;·&nbsp; <b>↑ ↓</b> mudam a velocidade.'
},
{
  part:'Preparação', op:'note',
  title:'Passo 1: Preparar o ambiente',
  lead:'Explicação em texto, sem código; aparece como cartão por cima do editor.',
  bullets:['Instrução A', 'Instrução B'],
  tip:'Dica opcional no rodapé do cartão.'
},
{
  part:'Código', op:'file', target:'src/exemplo.ts',
  title:'Criar src/exemplo.ts',
  explain:'A pasta <code>src</code> é criada junto, automaticamente.'
},
{
  part:'Código', op:'code', file:'src/exemplo.ts',
  title:'Primeiro trecho',
  explain:'O texto de <code>code</code> é digitado no fim do arquivo, letra por letra.',
  code:
`export function ola(nome: string){
  return \`Olá, \${nome}!\`;
}
`
},
{
  part:'Código', op:'insert', file:'src/exemplo.ts',
  after:'export function ola(nome: string){',
  title:'Inserir no meio do arquivo',
  explain:'Com <code>after</code> (ou <code>before</code>) o texto entra logo depois da linha indicada.',
  code:
`  console.log('chamou ola');
`
},
{
  part:'Fechamento', op:'outro',
  title:'Pronto!',
  lead:'Resumo do que foi construído e qual é a entrega.',
  bullets:['O que a turma aprendeu.', 'O que fazer em casa.'],
  tip:'Como entregar o exercício.'
},
];

global.MINHA_AULA = {
  meta: {
    titulo:    'Aula: Título',
    projeto:   'nome-do-projeto',
    subtitulo: 'ferramenta · linguagem',
    vazio:     'Projeto vazio.<br>Vamos criar tudo do zero.',
  },
  inicial: { entries: INITIAL_ENTRIES, files: INITIAL_FILES },
  deps:    { titulo: 'Dependências', desde: DEP_STEP, lista: DEPS },
  steps:   STEPS,
};

})(window);
