# Aulas de Mobile

Plataforma com todas as aulas de React Native. Cada aula é uma apresentação
interativa que constrói um app passo a passo, direto no navegador, sem
instalar nada. [`index.html`](index.html) é a página inicial, com um card
por aula.

Publicado na Vercel como site estático (sem build): a raiz do repositório é
servida como está, então basta apontar o projeto da Vercel para este
repositório sem nenhuma configuração extra.

## Estrutura

Cada aula mora numa pasta com nome descritivo (o que ela implementa, não o
número da aula):

```
index.html                      página inicial (catálogo de aulas)
shared/player/                   motor da apresentação, usado por todas as aulas
criando-tela-login/               projeto React Native, tela de login
  aula/
    index.html                   apresentação interativa
    aulas/*.js                    conteúdo da aula (etapas, slides, desafios)
implementando-navegacao/          projeto React Native, cadastro + navegação
  aula/...                        idem
listando-tarefas/                 projeto React Native, login leva à lista de tarefas
  aula/...                        idem
usando-react-navigation/          projeto React Native, navegação com React Navigation
  aula/...                        idem
editando-tarefas/                 projeto React Native, CRUD de tarefas sobre as rotas
  aula/...                        idem
notificacoes-push/                mini app de push + servidor Node da turma
  aula/...                        idem
usando-camera/                    React Native + expo-camera, tirar e mostrar uma foto
  aula/...                        idem
usando-geolocalizacao/            React Native + react-native-maps + expo-location, mapas e GPS
  aula/...                        idem
```

As aulas de lógica de programação (TypeScript, JavaScript e DOM) ficam no
repositório de Coding (`Aulas/Coding/coding`), não aqui.

Cada pasta de aula também tem o projeto Expo usado em aula (`App.tsx`,
`src/screens/`, `package.json`), isso é o código que os alunos acompanham
sendo digitado na apresentação, não faz parte do site publicado.

## Adicionar uma aula nova

1. Duplique uma pasta de aula existente (ex.: `implementando-navegacao/`)
   com um nome descritivo do que a aula implementa (ex.:
   `consumindo-api/`).
2. Escreva o conteúdo da aula em `<pasta>/aula/aulas/minha-aula.js`: use
   [`shared/player/README.md`](shared/player/README.md) como referência do
   formato (`meta`, `inicial`, `steps`). O arquivo
   `<pasta>/aula/aulas/_template.js` é o ponto de partida.
3. Em `<pasta>/aula/index.html`, aponte os `<script>`/`<link>` do player
   para `../../shared/player/...` (copie o `index.html` de uma aula
   existente e troque só o título e o nome do arquivo em `aulas/`).
4. Acrescente um item ao array `AULAS` em [`index.html`](index.html) da
   raiz, com `titulo`, `subtitulo`, `conceito`, `resumo` e o `href` para
   `<pasta>/aula/index.html`.

O player é compartilhado (`shared/player/`), não copie essa pasta para a
aula nova, todas as aulas usam a mesma versão.

## Rodar localmente

Não precisa de servidor: abra `index.html` (ou o `aula/index.html` de
qualquer pasta de aula) direto no navegador, ou sirva a pasta com qualquer
servidor estático:

```bash
npx serve .
```

Para rodar o app React Native de uma aula específica:

```bash
cd implementando-navegacao
npm install
npx expo start
```
