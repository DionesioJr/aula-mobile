/* =========================================================================
   AULA: Geolocalização e mapas

   Aula independente, projeto vazio, pensada para o Expo Snack
   (snack.expo.dev). Em vez de um app grande, a turma faz DEZ EXEMPLOS
   PEQUENOS, um arquivo cada (de 5 a 30 linhas), em três partes:

     PARTE A, o mapa (sem GPS, sem permissão)
       1. só o mapa                4. vários marcadores
       2. mapa na cidade           5. desenhar: linha e círculo
       3. um marcador              6. mapa ou satélite

     PARTE B, a localização (com permissão)
       7. onde estou? (texto)      9. mapa começando em mim
       8. a bolinha azul

     PARTE C, interação
      10. tocar no mapa para marcar

   O App.tsx começa com uma linha que escolhe o exemplo. Na Parte B ele
   ganha o pedido de permissão, feito UMA vez só. Cada exemplo segue o
   mesmo ciclo: slide de TEORIA curto -> cartão roxo "Sua vez" (a turma
   cria sozinha) -> solução digitada -> teste no celular.

   No fim: um desafio que junta os exemplos num app "Meus lugares" e uma
   atividade em que os GRUPOS pesquisam e trazem a teoria de um tema.

   Motor da apresentação: ../../shared/player/player.js
   ========================================================================= */
(function (global) {
'use strict';

/* Projeto começa vazio: tudo é criado durante a aula. */
const INITIAL_ENTRIES = [];
const INITIAL_FILES = {};

/* Dependências mostradas na lateral. Acendem a partir do slide do Snack
   (índice 4). */
const DEP_STEP = 4;
const DEPS = [
  {name:'react-native-maps', ver:'1.20.1'},
  {name:'expo-location',     ver:'~19.0.8'},
];

/* Cada exemplo troca só esta linha do App.tsx. */
function trocarExemplo(de, para, titulo){
  return {
    part:titulo, op:'replace', file:'App.tsx',
    find:`import Exemplo from './src/exemplos/${de}';\n`,
    title:'Trocar o exemplo no App.tsx',
    explain:'Só <b>uma linha</b> muda: o arquivo de onde vem o <code>Exemplo</code>. O resto do App continua igual.',
    code:`import Exemplo from './src/exemplos/${para}';\n`,
  };
}

/* =========================================================================
   ROTEIRO
   ops: intro | note | challenge | outro | file | code | insert | replace
   ========================================================================= */
const STEPS = [

/* ----------------------------------------------------------------------
   TEORIA GERAL (índices 0 a 5)
   ---------------------------------------------------------------------- */
{
  part:'Teoria', op:'intro',
  title:'Geolocalização e mapas',
  eyebrow:'React Native · react-native-maps · expo-location',
  md:
`Hoje o app vai mostrar um **mapa de verdade** e descobrir **onde o celular está**. Em vez de um app grande, vamos fazer **dez exemplos pequenos**, cada um num arquivo curtinho:

1. **Parte A, o mapa:** mostrar o mapa, ir pra uma cidade, colocar marcadores, desenhar linhas e círculos, trocar pra satélite.
2. **Parte B, a localização:** descobrir a latitude e a longitude do celular, mostrar a "bolinha azul" e abrir o mapa onde você está.
3. **Parte C, interação:** tocar no mapa pra marcar um lugar.

No fim, vocês juntam tudo num app **"Meus lugares"** e **trazem a teoria** de um tema pesquisado em grupo.

> Tudo funciona no **Expo Snack** (snack.expo.dev), sem instalar nada no computador. Tenha o app **Expo Go** no celular. Nos cartões **roxos** a aula para e é a vez da turma. **→** avança · **←** volta · **↑ ↓** mudam a velocidade.`
},
{
  part:'Teoria', op:'note',
  title:'O que é geolocalização?',
  md:
`**Geolocalização** é descobrir **onde um aparelho está** no planeta. O celular usa várias "pistas" ao mesmo tempo:

1. **GPS**: um chip no celular escuta sinais de **satélites** que estão girando em volta da Terra. Com o sinal de pelo menos 4 satélites, ele calcula a posição. É o mais preciso (erro de poucos metros), mas funciona mal **dentro de prédios**.
2. **Wi-Fi**: as redes Wi-Fi por perto têm posição conhecida. Funciona bem em lugar fechado.
3. **Antenas de celular**: a operadora sabe de qual antena você está perto. É a pista menos precisa (às vezes centenas de metros).

O resultado de tudo isso é sempre o mesmo: **dois números**, a **latitude** e a **longitude**, e uma estimativa de **precisão** ("estou aqui, com erro de 15 metros").

> **Pergunta pra turma:** que apps do dia a dia de vocês usam a localização? O que cada um faz com ela?`
},
{
  part:'Teoria', op:'note',
  title:'Latitude e longitude',
  md:
`Imagine a Terra coberta por uma **grade** de linhas, como um papel quadriculado. Qualquer lugar é um **cruzamento** de duas linhas:

\`\`\`
                Norte (+)
                   ▲
       ┌───────────┼───────────┐
       │           │           │
 Oeste ◄───────────┼───────────► Leste
  (−)  │       Equador (lat 0) │  (+)
       │           │           │
       └───────────┼───────────┘
                   ▼          lon 0 = Greenwich
                Sul (−)       (Inglaterra)
\`\`\`

- **Latitude**: quanto pra **cima ou pra baixo** do Equador. Vai de **−90** (Polo Sul) a **+90** (Polo Norte).
- **Longitude**: quanto pra **esquerda ou pra direita** de Greenwich, na Inglaterra. Vai de **−180** a **+180**.
- O Brasil fica **abaixo** do Equador e **à esquerda** de Greenwich, por isso aqui os **dois números são negativos**.

\`\`\`
Catedral de Brasília   latitude: -15.7983   longitude: -47.8756
\`\`\`

> **Dica:** no Google Maps, clique com o **botão direito** num lugar: os dois números aparecem e dá pra copiar. Vamos usar isso pra colocar a cidade de vocês no mapa.`
},
{
  part:'Teoria', op:'note',
  title:'As duas bibliotecas da aula',
  md:
`O React Native sozinho não sabe desenhar mapa nem falar com o GPS. A aula usa **duas bibliotecas**, cada uma com um trabalho:

1. **\`react-native-maps\`**, **desenha o mapa**. Pense nele como um **mapa de papel**: mostra ruas, deixa colocar marcadores e desenhar em cima, mas não sabe onde você está.
2. **\`expo-location\`**, **descobre onde o celular está**. Pense nela como o adesivo **"você está aqui"** do mapa do shopping.

\`\`\`tsx
import MapView, { Marker } from 'react-native-maps';
import { getCurrentPositionAsync } from 'expo-location';
\`\`\`

- \`MapView\` vem **sem chaves** porque é o \`export default\` da biblioteca, igual ao nosso \`Exemplo\`.
- \`Marker\` vem **com chaves** porque é uma das várias peças que ela exporta pelo nome.

> No iPhone o mapa é o **da Apple**; no Android, o **do Google**. Por isso eles parecem um pouco diferentes, mas o código é o mesmo.`
},
{
  part:'Teoria', op:'note',
  title:'Usando no Expo Snack',
  md:
`1. Abra **snack.expo.dev** e entre com a sua conta (assim o Snack fica salvo).
2. Renomeie o **\`App.js\`** para **\`App.tsx\`** (vamos usar TypeScript, como nas outras aulas).
3. Pra criar um arquivo numa pasta, clique no **+** de novo arquivo e digite o caminho inteiro, por exemplo \`src/exemplos/Exemplo1Mapa.tsx\`: as pastas são criadas junto.
4. Quando vocês escreverem o \`import\` de uma biblioteca nova, o Snack mostra um aviso de dependência faltando: clique em **Add dependency**. Pronto, instalada.
5. Pra testar, abra a aba **My Device** e escaneie o QR code com o **Expo Go**.

> **Atenção:** a prévia **Web** do Snack **não mostra o mapa** (o \`react-native-maps\` só funciona no celular). Testem **no celular de verdade**. Repare na lateral: as duas bibliotecas acabaram de aparecer nas dependências.

**No computador** (opcional), dentro da pasta do projeto:

\`\`\`bash
npx expo install react-native-maps expo-location
npx expo start
\`\`\``
},
{
  part:'Teoria', op:'note',
  title:'Como cada exemplo funciona',
  md:
`Todo exemplo segue os mesmos quatro passos:

1. **Teoria**: um slide curto com a peça nova do dia.
2. **Sua vez** (cartão roxo): vocês tentam criar o exemplo **sozinhos**, com dicas.
3. **Solução**: o código aparece sendo digitado, pra comparar com o de vocês.
4. **Teste**: rodar no celular e ver funcionando.

Os exemplos ficam na pasta \`src/exemplos/\`, um arquivo cada. O \`App.tsx\` só **escolhe qual exemplo mostrar**:

\`\`\`tsx
import Exemplo from './src/exemplos/Exemplo1Mapa';  // troque só esta linha
...
return <Exemplo />;
\`\`\`

> Errou? Ótimo, é pra isso que serve o "Sua vez". Compare com a solução e descubra **onde** foi a diferença.`
},

/* ----------------------------------------------------------------------
   EXEMPLO 1: só o mapa
   ---------------------------------------------------------------------- */
{
  part:'Exemplo 1: só o mapa', op:'note',
  title:'Teoria: o mapa é só uma View',
  md:
`**Parte A: o mapa.** Mostrar um mapa **não precisa de permissão**: o app não está descobrindo nada sobre você, só desenhando ruas.

O \`<MapView>\` se usa **igualzinho** a uma \`<View>\`. A única coisa obrigatória é dar **tamanho** pra ele:

\`\`\`tsx
<MapView style={{ flex: 1 }} />
\`\`\`

- **\`flex: 1\`** quer dizer "ocupe todo o espaço que sobrar". Como ele é o único na tela, ocupa a tela toda.
- **Sem tamanho**, o mapa fica com altura zero e **não aparece nada** (é o erro mais comum!).
- **\`style={{ ... }}\`**: as chaves duplas são um objeto de estilo escrito direto ali, sem \`StyleSheet\`. Nos exemplos curtos isso deixa o código menor.

> Esse primeiro exemplo a gente faz **junto**, pra montar o projeto.`
},
{
  part:'Exemplo 1: só o mapa', op:'file', target:'src/exemplos/Exemplo1Mapa.tsx',
  title:'Criar o Exemplo 1',
  explain:'As pastas <code>src</code> e <code>exemplos</code> são criadas junto. No Snack: botão de novo arquivo e o caminho inteiro.'
},
{
  part:'Exemplo 1: só o mapa', op:'code', file:'src/exemplos/Exemplo1Mapa.tsx',
  title:'O menor app de mapa possível',
  explain:'Cinco linhas. Toda a parte difícil (baixar as ruas, arrastar, dar zoom com dois dedos) fica escondida dentro da biblioteca.',
  code:
`import React from 'react';
import MapView from 'react-native-maps';

export default function Exemplo1Mapa() {
  return <MapView style={{ flex: 1 }} />;
}
`
},
{
  part:'Exemplo 1: só o mapa', op:'file', target:'App.tsx',
  title:'Criar o App.tsx',
  explain:'No Snack ele já existe (renomeado de <code>App.js</code>): apague o que tem dentro.'
},
{
  part:'Exemplo 1: só o mapa', op:'code', file:'App.tsx',
  title:'O App só escolhe o exemplo',
  explain:'O nome <code>Exemplo</code> é escolhido por nós: com <code>export default</code>, quem importa dá o nome que quiser.',
  code:
`import React from 'react';
import Exemplo from './src/exemplos/Exemplo1Mapa';

export default function App() {
  return <Exemplo />;
}
`
},
{
  part:'Exemplo 1: só o mapa', op:'note',
  title:'Teste: o mapa na mão',
  md:
`Abra no celular (aba **My Device** do Snack + Expo Go): **a tela inteira virou um mapa**.

Experimentem:

- **Arrastar** com um dedo pra andar pelo mapa.
- **Pinça** com dois dedos pra dar zoom.
- Girar com dois dedos (no iPhone).

> Repare que o mapa abre num lugar "qualquer", bem longe. O próximo exemplo escolhe **onde** o mapa começa.`
},

/* ----------------------------------------------------------------------
   EXEMPLO 2: mapa na cidade
   ---------------------------------------------------------------------- */
{
  part:'Exemplo 2: mapa na cidade', op:'note',
  title:'Teoria: a região = centro + zoom',
  md:
`A prop **\`initialRegion\`** diz **onde o mapa começa**. Ela é um objeto com quatro números:

\`\`\`tsx
initialRegion={{
  latitude: -15.795,      // o centro do mapa...
  longitude: -47.88,      // ...é este ponto
  latitudeDelta: 0.04,    // quanto cabe na altura
  longitudeDelta: 0.04,   // quanto cabe na largura
}}
\`\`\`

\`\`\`
        ◄──── longitudeDelta ────►
       ┌──────────────────────────┐  ▲
       │                          │  │
       │            ●             │  latitudeDelta
       │  (latitude, longitude)   │  │
       │                          │  │
       └──────────────────────────┘  ▼
\`\`\`

- Os **deltas** são o **zoom**: número **pequeno** = pouca coisa cabe na tela = **perto**. Número **grande** = longe.
- \`0.01\` mostra um bairro. \`0.1\` mostra uma cidade. \`10\` mostra vários estados.

> **Pense:** se a gente trocar \`0.04\` por \`40\`, o que vai aparecer?`
},
{
  part:'Exemplo 2: mapa na cidade', op:'challenge',
  title:'Sua vez: Exemplo 2, a nossa cidade',
  time:'5 min',
  md:
`Crie o arquivo \`src/exemplos/Exemplo2Cidade.tsx\`:

1. **Copie** o Exemplo 1 inteiro.
2. Troque o nome da função para \`Exemplo2Cidade\`.
3. Acrescente a prop \`initialRegion\` no \`MapView\`, com a região do slide anterior (Brasília).
4. No \`App.tsx\`, troque a linha do \`import Exemplo\` pra apontar pro arquivo novo.

> **Extra:** troque pelo centro da **cidade de vocês** (botão direito no Google Maps copia a latitude e a longitude).`
},
{
  part:'Exemplo 2: mapa na cidade', op:'file', target:'src/exemplos/Exemplo2Cidade.tsx',
  title:'Solução: criar o Exemplo 2',
},
{
  part:'Exemplo 2: mapa na cidade', op:'code', file:'src/exemplos/Exemplo2Cidade.tsx',
  title:'Uma prop a mais',
  explain:'Igual ao Exemplo 1, com <code>initialRegion</code>. As chaves duplas: as de fora dizem "aqui vai JavaScript", as de dentro são o objeto.',
  code:
`import React from 'react';
import MapView from 'react-native-maps';

export default function Exemplo2Cidade() {
  return (
    <MapView
      style={{ flex: 1 }}
      initialRegion={{
        latitude: -15.795,
        longitude: -47.88,
        latitudeDelta: 0.04,
        longitudeDelta: 0.04,
      }}
    />
  );
}
`
},
trocarExemplo('Exemplo1Mapa', 'Exemplo2Cidade', 'Exemplo 2: mapa na cidade'),
{
  part:'Exemplo 2: mapa na cidade', op:'note',
  title:'Teste: brincando com o zoom',
  md:
`O mapa agora abre **direto no centro de Brasília**.

Agora testem a pergunta do slide de teoria:

1. Troquem os dois deltas por \`0.005\`: o mapa abre **bem de perto**.
2. Troquem por \`40\`: aparece **quase o Brasil inteiro**.
3. Voltem pra \`0.04\`.

> \`initialRegion\` é só **o começo**: o usuário continua podendo arrastar e dar zoom depois.`
},

/* ----------------------------------------------------------------------
   EXEMPLO 3: um marcador
   ---------------------------------------------------------------------- */
{
  part:'Exemplo 3: um marcador', op:'note',
  title:'Teoria: Marker, o alfinete',
  md:
`O **\`<Marker>\`** é o **alfinete** vermelho do mapa. Ele vai **dentro** do \`MapView\`, como um \`<Text>\` vai dentro de uma \`<View>\`:

\`\`\`tsx
<MapView style={{ flex: 1 }}>
  <Marker
    coordinate={{ latitude: -15.7983, longitude: -47.8756 }}
    title="Catedral"
    description="Obra de Oscar Niemeyer"
  />
</MapView>
\`\`\`

- **\`coordinate\`** (obrigatória): **onde** espetar o alfinete, com latitude e longitude.
- **\`title\`** e **\`description\`**: o balãozinho que aparece quando **toca** no alfinete.
- **\`pinColor\`**: a cor do alfinete, por exemplo \`"blue"\`.

> Repare: agora o \`MapView\` **abre e fecha** (\`<MapView>...</MapView>\`), porque tem filhos. Antes ele se fechava sozinho (\`<MapView />\`).`
},
{
  part:'Exemplo 3: um marcador', op:'challenge',
  title:'Sua vez: Exemplo 3, o alfinete',
  time:'5 min',
  md:
`Crie \`src/exemplos/Exemplo3Marcador.tsx\`:

1. Copie o Exemplo 2 e troque o nome da função.
2. Importe também o \`Marker\`: \`import MapView, { Marker } from 'react-native-maps';\`
3. Coloque um \`<Marker>\` **dentro** do \`MapView\`, na Catedral, com título e descrição.
4. Troque o \`import Exemplo\` no \`App.tsx\`.

> **Extra:** mude a cor com \`pinColor\`, ou coloque o alfinete num lugar da cidade de vocês (a escola, a casa de vocês, a lanchonete preferida).`
},
{
  part:'Exemplo 3: um marcador', op:'file', target:'src/exemplos/Exemplo3Marcador.tsx',
  title:'Solução: criar o Exemplo 3',
},
{
  part:'Exemplo 3: um marcador', op:'code', file:'src/exemplos/Exemplo3Marcador.tsx',
  title:'O mapa com um filho',
  explain:'<code>MapView</code> agora tem abertura e fechamento, com o <code>Marker</code> no meio.',
  code:
`import React from 'react';
import MapView, { Marker } from 'react-native-maps';

export default function Exemplo3Marcador() {
  return (
    <MapView
      style={{ flex: 1 }}
      initialRegion={{
        latitude: -15.795,
        longitude: -47.88,
        latitudeDelta: 0.04,
        longitudeDelta: 0.04,
      }}
    >
      <Marker
        coordinate={{ latitude: -15.7983, longitude: -47.8756 }}
        title="Catedral"
        description="Obra de Oscar Niemeyer"
      />
    </MapView>
  );
}
`
},
trocarExemplo('Exemplo2Cidade', 'Exemplo3Marcador', 'Exemplo 3: um marcador'),
{
  part:'Exemplo 3: um marcador', op:'note',
  title:'Teste: toque no alfinete',
  md:
`O alfinete aparece em cima da Catedral. **Toque nele**: abre o balão com o título e a descrição.

> **Pergunta pra turma:** e se a gente quisesse **dez** alfinetes? Copiar e colar o \`<Marker>\` dez vezes? O próximo exemplo mostra um jeito melhor.`
},

/* ----------------------------------------------------------------------
   EXEMPLO 4: vários marcadores
   ---------------------------------------------------------------------- */
{
  part:'Exemplo 4: vários marcadores', op:'note',
  title:'Teoria: uma lista vira vários alfinetes',
  md:
`Lembra da \`FlatList\`, que transforma uma **lista de dados** numa lista na tela? Aqui é a mesma ideia, com o **\`.map()\`** do JavaScript:

\`\`\`tsx
const LUGARES = [
  { nome: 'Congresso Nacional', latitude: -15.7997, longitude: -47.8641 },
  { nome: 'Catedral',           latitude: -15.7983, longitude: -47.8756 },
  { nome: 'Torre de TV',        latitude: -15.7905, longitude: -47.8929 },
];

{LUGARES.map((lugar) => (
  <Marker key={lugar.nome} ... title={lugar.nome} />
))}
\`\`\`

- **\`.map()\`** lê assim: "**para cada** \`lugar\` da lista, desenhe um \`<Marker>\`".
- **\`key\`** é um nome **único** pra cada item, pro React saber quem é quem (como o \`keyExtractor\` da \`FlatList\`).
- Quer mais um alfinete? **Só acrescenta uma linha na lista.** O código da tela não muda.

> A lista fica **fora** da função, em letras maiúsculas, porque são dados fixos: não mudam enquanto o app roda.`
},
{
  part:'Exemplo 4: vários marcadores', op:'challenge',
  title:'Sua vez: Exemplo 4, os pontos turísticos',
  time:'7 min',
  md:
`Crie \`src/exemplos/Exemplo4VariosMarcadores.tsx\`:

1. Copie o Exemplo 3 e troque o nome da função.
2. **Antes** da função, crie a lista \`LUGARES\` com os três lugares do slide anterior.
3. Dentro do \`MapView\`, troque o \`<Marker>\` único por um \`LUGARES.map(...)\` que desenha um \`<Marker>\` por lugar.
4. Cada \`Marker\` recebe \`key\`, \`coordinate\` (montada com \`lugar.latitude\` e \`lugar.longitude\`) e \`title\`.
5. Troque o \`import Exemplo\` no \`App.tsx\`.

> **Extra:** acrescente um quarto lugar na lista, de preferência da cidade de vocês.`
},
{
  part:'Exemplo 4: vários marcadores', op:'file', target:'src/exemplos/Exemplo4VariosMarcadores.tsx',
  title:'Solução: criar o Exemplo 4',
},
{
  part:'Exemplo 4: vários marcadores', op:'code', file:'src/exemplos/Exemplo4VariosMarcadores.tsx',
  title:'Os dados fora, a tela dentro',
  explain:'A lista <code>LUGARES</code> são só dados. O <code>.map()</code> transforma cada item num <code>Marker</code>.',
  code:
`import React from 'react';
import MapView, { Marker } from 'react-native-maps';

const LUGARES = [
  { nome: 'Congresso Nacional', latitude: -15.7997, longitude: -47.8641 },
  { nome: 'Catedral', latitude: -15.7983, longitude: -47.8756 },
  { nome: 'Torre de TV', latitude: -15.7905, longitude: -47.8929 },
];

export default function Exemplo4VariosMarcadores() {
  return (
    <MapView
      style={{ flex: 1 }}
      initialRegion={{
        latitude: -15.795,
        longitude: -47.88,
        latitudeDelta: 0.04,
        longitudeDelta: 0.04,
      }}
    >
      {LUGARES.map((lugar) => (
        <Marker
          key={lugar.nome}
          coordinate={{ latitude: lugar.latitude, longitude: lugar.longitude }}
          title={lugar.nome}
        />
      ))}
    </MapView>
  );
}
`
},
trocarExemplo('Exemplo3Marcador', 'Exemplo4VariosMarcadores', 'Exemplo 4: vários marcadores'),

/* ----------------------------------------------------------------------
   EXEMPLO 5: desenhar no mapa
   ---------------------------------------------------------------------- */
{
  part:'Exemplo 5: linha e círculo', op:'note',
  title:'Teoria: desenhando em cima do mapa',
  md:
`Além de alfinetes, dá pra **desenhar** no mapa. Duas peças bem úteis:

\`\`\`tsx
<Polyline
  coordinates={[ponto1, ponto2, ponto3]}   // uma lista de pontos
  strokeColor="blue"                       // cor da linha
  strokeWidth={4}                          // grossura
/>

<Circle
  center={ponto}                           // o centro
  radius={300}                             // o raio, em METROS
  fillColor="rgba(255, 0, 0, 0.3)"         // cor de dentro
/>
\`\`\`

- **\`Polyline\`** liga os pontos **na ordem** da lista, como ligar os pontinhos de um passatempo. É assim que apps de corrida desenham o seu trajeto.
- **\`Circle\`** desenha um círculo de verdade, em **metros**: se der zoom, ele cresce junto com o mapa. É a "área de entrega" de um app de comida.
- **\`rgba(vermelho, verde, azul, transparência)\`**: o último número vai de \`0\` (invisível) a \`1\` (sólido). Com \`0.3\` dá pra ver as ruas por baixo.

> **Pergunta pra turma:** que outros apps desenham linhas ou círculos no mapa?`
},
{
  part:'Exemplo 5: linha e círculo', op:'challenge',
  title:'Sua vez: Exemplo 5, o passeio',
  time:'7 min',
  md:
`Crie \`src/exemplos/Exemplo5Desenhar.tsx\`, desenhando um passeio pelo Eixo Monumental:

1. Copie o Exemplo 2 (o da cidade, sem alfinetes) e troque o nome da função.
2. Importe \`Polyline\` e \`Circle\` junto com o \`MapView\`.
3. Dentro do \`MapView\`, uma \`Polyline\` azul ligando: Torre de TV → Catedral → Congresso (as coordenadas estão no slide do Exemplo 4).
4. Um \`Circle\` vermelho transparente de **300 metros** em volta do Congresso.
5. Troque o \`import Exemplo\` no \`App.tsx\`.

> Cada ponto é um objeto: \`{ latitude: ..., longitude: ... }\`. A \`Polyline\` recebe uma **lista** desses objetos.`
},
{
  part:'Exemplo 5: linha e círculo', op:'file', target:'src/exemplos/Exemplo5Desenhar.tsx',
  title:'Solução: criar o Exemplo 5',
},
{
  part:'Exemplo 5: linha e círculo', op:'code', file:'src/exemplos/Exemplo5Desenhar.tsx',
  title:'Uma linha e um círculo',
  explain:'Os pontos ficam em constantes com nome, pra não repetir os números na <code>Polyline</code> e no <code>Circle</code>.',
  code:
`import React from 'react';
import MapView, { Polyline, Circle } from 'react-native-maps';

const TORRE = { latitude: -15.7905, longitude: -47.8929 };
const CATEDRAL = { latitude: -15.7983, longitude: -47.8756 };
const CONGRESSO = { latitude: -15.7997, longitude: -47.8641 };

export default function Exemplo5Desenhar() {
  return (
    <MapView
      style={{ flex: 1 }}
      initialRegion={{
        latitude: -15.795,
        longitude: -47.88,
        latitudeDelta: 0.04,
        longitudeDelta: 0.04,
      }}
    >
      <Polyline coordinates={[TORRE, CATEDRAL, CONGRESSO]} strokeColor="blue" strokeWidth={4} />
      <Circle center={CONGRESSO} radius={300} fillColor="rgba(255, 0, 0, 0.3)" />
    </MapView>
  );
}
`
},
trocarExemplo('Exemplo4VariosMarcadores', 'Exemplo5Desenhar', 'Exemplo 5: linha e círculo'),
{
  part:'Exemplo 5: linha e círculo', op:'note',
  title:'Teste: zoom no desenho',
  md:
`A linha azul liga os três lugares e o círculo vermelho cobre o Congresso.

Experimentem:

- Dar **zoom**: o círculo cresce junto, porque o raio é em **metros**, não em pixels.
- Trocar \`radius={300}\` por \`radius={1000}\` (um quilômetro).
- Mudar a **ordem** dos pontos na \`Polyline\`: a linha muda de caminho.

> **Extra:** coloquem também os alfinetes do Exemplo 4 neste mapa. Dá pra misturar \`Marker\`, \`Polyline\` e \`Circle\` à vontade dentro do mesmo \`MapView\`.`
},

/* ----------------------------------------------------------------------
   EXEMPLO 6: mapa ou satélite
   ---------------------------------------------------------------------- */
{
  part:'Exemplo 6: mapa ou satélite', op:'note',
  title:'Teoria: um estado liga/desliga',
  md:
`A prop **\`mapType\`** muda o **jeito** do mapa:

\`\`\`
mapType="standard"    o mapa normal, com ruas (é o padrão)
mapType="satellite"   foto tirada do espaço
mapType="hybrid"      foto + nome das ruas
\`\`\`

Pra um botão trocar entre mapa e satélite, a gente precisa **lembrar** qual está ligado. Isso é um **estado**:

\`\`\`tsx
const [satelite, setSatelite] = useState(false);       // começa no mapa normal

<MapView mapType={satelite ? 'satellite' : 'standard'} />

<Button onPress={() => setSatelite(!satelite)} />     // o ! inverte
\`\`\`

- **\`!satelite\`** quer dizer "o contrário de \`satelite\`": \`true\` vira \`false\` e vice-versa. É o truque de todo botão liga/desliga.
- O **ternário** \`satelite ? 'satellite' : 'standard'\` lê assim: "**se** satélite, usa \`'satellite'\`, **senão**, \`'standard'\`".
- O **\`<Button>\`** é o botão mais simples do React Native: só precisa de \`title\` e \`onPress\`.`
},
{
  part:'Exemplo 6: mapa ou satélite', op:'challenge',
  title:'Sua vez: Exemplo 6, o botão satélite',
  time:'7 min',
  md:
`Crie \`src/exemplos/Exemplo6Satelite.tsx\`:

1. Um estado \`satelite\`, começando em \`false\`.
2. Uma \`<View style={{ flex: 1 }}>\` com dois filhos: o \`<MapView>\` (com \`flex: 1\`, a \`initialRegion\` de Brasília e o \`mapType\` vindo do estado) e um \`<Button>\` embaixo.
3. O botão inverte o estado ao ser tocado.
4. **Extra:** o texto do botão muda entre "Ver satélite" e "Ver mapa".

> Importe o \`useState\` do \`react\` e o \`View\` e o \`Button\` do \`react-native\`.`
},
{
  part:'Exemplo 6: mapa ou satélite', op:'file', target:'src/exemplos/Exemplo6Satelite.tsx',
  title:'Solução: criar o Exemplo 6',
},
{
  part:'Exemplo 6: mapa ou satélite', op:'code', file:'src/exemplos/Exemplo6Satelite.tsx',
  title:'Estado + prop = satélite',
  explain:'Toda vez que o botão muda <code>satelite</code>, o React redesenha e o <code>MapView</code> recebe o valor novo em <code>mapType</code>.',
  code:
`import React, { useState } from 'react';
import { View, Button } from 'react-native';
import MapView from 'react-native-maps';

export default function Exemplo6Satelite() {
  const [satelite, setSatelite] = useState(false);

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1 }}
        mapType={satelite ? 'satellite' : 'standard'}
        initialRegion={{
          latitude: -15.795,
          longitude: -47.88,
          latitudeDelta: 0.04,
          longitudeDelta: 0.04,
        }}
      />
      <Button
        title={satelite ? 'Ver mapa' : 'Ver satélite'}
        onPress={() => setSatelite(!satelite)}
      />
    </View>
  );
}
`
},
trocarExemplo('Exemplo5Desenhar', 'Exemplo6Satelite', 'Exemplo 6: mapa ou satélite'),
{
  part:'Exemplo 6: mapa ou satélite', op:'note',
  title:'Teste: Brasília vista do espaço',
  md:
`Toque no botão: o mapa vira **foto de satélite**. Toque de novo: volta pro mapa. E o texto do botão acompanha.

Afastem o zoom no satélite e procurem o formato de **avião** do Plano Piloto de Brasília.

> **Fim da Parte A.** Repare que até aqui o app **nunca pediu permissão**: ele só desenha o mapa, não sabe onde vocês estão. Isso muda agora.`
},

/* ----------------------------------------------------------------------
   PARTE B: a permissão, uma vez só, no App.tsx
   ---------------------------------------------------------------------- */
{
  part:'Parte B: permissão', op:'note',
  title:'Por que precisa de permissão?',
  md:
`**Parte B: a localização.** Saber **onde a pessoa está** é uma informação **muito pessoal**: mostra onde ela mora, estuda, trabalha. Por isso o Android e o iOS não deixam nenhum app descobrir a localização sem o usuário autorizar:

\`\`\`
┌─────────────────────────────────────┐
│ Permitir que o app acesse a         │
│ localização deste dispositivo?      │
│                                     │
│  [ Durante o uso do app ]           │
│  [ Apenas esta vez ]                │
│  [ Não permitir ]                   │
└─────────────────────────────────────┘
\`\`\`

A \`expo-location\` tem um hook que funciona **igual** ao da câmera:

\`\`\`tsx
const [permissao, pedirPermissao] = useForegroundPermissions();
\`\`\`

- **"Foreground"** quer dizer "**primeiro plano**": só enquanto o app está **aberto** na tela. É o que a aula usa.
- Existe também a permissão de **segundo plano** (com o app fechado), que apps de corrida e de entrega usam. Ela é bem mais difícil de conseguir, de propósito.
- \`permissao\` pode ser **\`null\`** (carregando), ter **\`granted\` falso** (não deixou) ou **\`granted\` verdadeiro** (liberado).

> **Pergunta pra turma:** vocês deixariam um app de **lanterna** saber onde vocês estão? Por quê?`
},
{
  part:'Parte B: permissão', op:'insert', file:'App.tsx',
  after:"import React from 'react';",
  title:'Importar o que a permissão precisa',
  explain:'As peças de tela do <code>react-native</code> e o hook <code>useForegroundPermissions</code> da <code>expo-location</code>.',
  code:
`import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useForegroundPermissions } from 'expo-location';
`
},
{
  part:'Parte B: permissão', op:'replace', file:'App.tsx',
  find:
`export default function App() {
  return <Exemplo />;
}
`,
  title:'Três situações, três returns',
  explain:'<code>null</code> = carregando (tela vazia). <code>granted</code> falso = botão que chama <code>pedirPermissao</code>. Passou pelos dois <code>if</code> = liberado, mostra o exemplo.',
  code:
`export default function App() {
  const [permissao, pedirPermissao] = useForegroundPermissions();

  if (!permissao) {
    return <View />;
  }

  if (!permissao.granted) {
    return (
      <View style={styles.centro}>
        <Text style={styles.texto}>Precisamos da sua permissão para saber onde você está.</Text>
        <TouchableOpacity onPress={pedirPermissao} style={styles.botao}>
          <Text style={styles.botaoTexto}>Permitir localização</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return <Exemplo />;
}
`
},
{
  part:'Parte B: permissão', op:'code', file:'App.tsx',
  title:'Os estilos',
  explain:'<code>centro</code> centraliza o texto e o botão no meio da tela.',
  code:
`
const styles = StyleSheet.create({
  centro: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  texto: { fontSize: 18, textAlign: 'center', marginBottom: 16 },
  botao: { backgroundColor: '#2e6de6', borderRadius: 8, paddingVertical: 14, paddingHorizontal: 24 },
  botaoTexto: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
`
},
{
  part:'Parte B: permissão', op:'note',
  title:'Teste: a janelinha da permissão',
  md:
`Rode o app no celular e confira:

1. Aparece o texto **"Precisamos da sua permissão..."** e o botão azul.
2. Toque em **Permitir localização**: a janelinha **do sistema** aparece.
3. Escolha **Durante o uso do app**: a tela muda sozinha e o mapa de satélite volta.

Por que mudou sozinha? Porque \`permissao\` funciona como um estado: quando o usuário responde, ele muda, e o React **desenha a tela de novo**, agora passando pelos dois \`if\`.

> **Negou sem querer?** O celular lembra da resposta. Vá em **Configurações → Apps → Expo Go → Permissões → Localização** e libere de novo. E deixe a **localização (GPS) ligada** no celular.`
},

/* ----------------------------------------------------------------------
   EXEMPLO 7: onde estou?
   ---------------------------------------------------------------------- */
{
  part:'Exemplo 7: onde estou?', op:'note',
  title:'Teoria: perguntar a posição pro celular',
  md:
`A função **\`getCurrentPositionAsync()\`** pergunta pro celular: "**onde eu estou agora?**".

\`\`\`tsx
async function buscarPosicao() {
  const resultado = await getCurrentPositionAsync();
  setPosicao(resultado);
}
\`\`\`

- **\`async\` / \`await\`**: achar a posição **demora** (o GPS precisa ouvir os satélites, às vezes leva alguns segundos). Por isso o nome termina em **Async**. O \`await\` faz a função **esperar** a resposta antes de seguir.
- O \`resultado\` é um objeto assim:

\`\`\`
{
  coords: {
    latitude: -15.7983,
    longitude: -47.8756,
    accuracy: 12,        ← precisão: erro de uns 12 metros
    altitude: 1102,      ← altura em relação ao mar, em metros
    speed: 0,            ← velocidade, em metros por segundo
  },
  timestamp: 1762380000000   ← quando foi medido
}
\`\`\`

- O que interessa está dentro de **\`coords\`**: \`resultado.coords.latitude\` e \`resultado.coords.longitude\`.

> Antes de buscar, a posição **ainda não existe**. Por isso o estado começa em **\`null\`**, igualzinho à permissão.`
},
{
  part:'Exemplo 7: onde estou?', op:'challenge',
  title:'Sua vez: Exemplo 7, o botão "Onde estou?"',
  time:'8 min',
  md:
`Crie \`src/exemplos/Exemplo7OndeEstou.tsx\`, **sem mapa**, só texto:

1. Um estado \`posicao\` que começa em \`null\`. O tipo é \`LocationObject | null\` (importe \`LocationObject\` da \`expo-location\`).
2. Uma função \`async\` chamada \`buscarPosicao\`, que espera o \`getCurrentPositionAsync()\` e guarda o resultado no estado.
3. Uma tela centralizada com um \`<Button>\` **"Onde estou?"** que chama \`buscarPosicao\`.
4. **Se** já tiver posição, mostrar dois \`<Text>\`: a latitude e a longitude.
5. Troque o \`import Exemplo\` no \`App.tsx\`.

> Dica pro item 4: \`{posicao && ( ... )}\` lê-se "**se** tem posição, **então** mostra isto".`
},
{
  part:'Exemplo 7: onde estou?', op:'file', target:'src/exemplos/Exemplo7OndeEstou.tsx',
  title:'Solução: criar o Exemplo 7',
},
{
  part:'Exemplo 7: onde estou?', op:'code', file:'src/exemplos/Exemplo7OndeEstou.tsx',
  title:'Pergunta, espera, mostra',
  explain:'O botão chama <code>buscarPosicao</code>, que espera o GPS e guarda o resultado. Quando o estado muda, os dois <code>Text</code> aparecem.',
  code:
`import React, { useState } from 'react';
import { View, Text, Button } from 'react-native';
import { getCurrentPositionAsync, LocationObject } from 'expo-location';

export default function Exemplo7OndeEstou() {
  const [posicao, setPosicao] = useState<LocationObject | null>(null);

  async function buscarPosicao() {
    const resultado = await getCurrentPositionAsync();
    setPosicao(resultado);
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 }}>
      <Button title="Onde estou?" onPress={buscarPosicao} />
      {posicao && (
        <View>
          <Text style={{ fontSize: 18 }}>Latitude: {posicao.coords.latitude}</Text>
          <Text style={{ fontSize: 18 }}>Longitude: {posicao.coords.longitude}</Text>
        </View>
      )}
    </View>
  );
}
`
},
trocarExemplo('Exemplo6Satelite', 'Exemplo7OndeEstou', 'Exemplo 7: onde estou?'),
{
  part:'Exemplo 7: onde estou?', op:'note',
  title:'Teste: seus números no planeta',
  md:
`Toque em **"Onde estou?"**: depois de um instante aparecem a **latitude** e a **longitude** de vocês.

Confiram:

1. Os dois números são **negativos**? (Se vocês estão no Brasil, deviam ser!)
2. Copiem os números, colem na **busca do Google Maps** e vejam se cai na sala de aula.
3. Comparem com o colega do lado: os números são **quase iguais**, só mudam lá no final.

> Como não tem mapa, esse exemplo costuma **funcionar até na prévia Web** do Snack: o navegador também sabe a localização. E demorou? É normal: dentro de prédio o GPS demora mais.`
},

/* ----------------------------------------------------------------------
   EXEMPLO 8: a bolinha azul
   ---------------------------------------------------------------------- */
{
  part:'Exemplo 8: a bolinha azul', op:'note',
  title:'Teoria: o mapa já sabe mostrar você',
  md:
`Mostrar **a bolinha azul** ("você está aqui") é tão comum que o \`MapView\` já faz isso sozinho, com uma prop:

\`\`\`tsx
<MapView style={{ flex: 1 }} showsUserLocation />
\`\`\`

- **\`showsUserLocation\`** sozinha, sem \`={...}\`, é um atalho pra \`showsUserLocation={true}\`. Vale pra qualquer prop que é \`true\` ou \`false\`.
- Ela **só funciona com a permissão liberada**. Por isso a gente deixou pra depois da Parte B.
- **\`showsMyLocationButton\`** mostra o botãozinho de "ir até mim" no canto (**só no Android**; no iPhone ela é ignorada).

> **Pense:** essa prop resolve "mostrar onde estou". Mas o mapa **abre centralizado em mim**? Testem e vejam.`
},
{
  part:'Exemplo 8: a bolinha azul', op:'file', target:'src/exemplos/Exemplo8BolinhaAzul.tsx',
  title:'Criar o Exemplo 8',
  explain:'Esse é curtinho, a gente faz <b>junto</b>, sem cartão de desafio.'
},
{
  part:'Exemplo 8: a bolinha azul', op:'code', file:'src/exemplos/Exemplo8BolinhaAzul.tsx',
  title:'Duas props e pronto',
  explain:'O Exemplo 1 com <code>showsUserLocation</code> e <code>showsMyLocationButton</code>. Quem busca a posição e desenha a bolinha é a própria biblioteca.',
  code:
`import React from 'react';
import MapView from 'react-native-maps';

export default function Exemplo8BolinhaAzul() {
  return <MapView style={{ flex: 1 }} showsUserLocation showsMyLocationButton />;
}
`
},
trocarExemplo('Exemplo7OndeEstou', 'Exemplo8BolinhaAzul', 'Exemplo 8: a bolinha azul'),
{
  part:'Exemplo 8: a bolinha azul', op:'note',
  title:'Teste: cadê a bolinha?',
  md:
`O mapa provavelmente abre... **longe** de vocês. Mas a bolinha azul está lá: no **Android**, toquem no botão do canto pra ir até ela; no **iPhone**, arrastem o mapa até a cidade de vocês.

Respondendo a pergunta do slide: \`showsUserLocation\` **mostra** a bolinha, mas **não centraliza** o mapa nela.

> Pra o mapa **já abrir** em cima de vocês, precisamos juntar o Exemplo 7 (descobrir a posição) com o Exemplo 2 (\`initialRegion\`). É o próximo exemplo.`
},

/* ----------------------------------------------------------------------
   EXEMPLO 9: mapa começando em mim
   ---------------------------------------------------------------------- */
{
  part:'Exemplo 9: mapa em mim', op:'note',
  title:'Teoria: buscar a posição quando a tela abre',
  md:
`No Exemplo 7 a posição só era buscada quando **tocava no botão**. Agora queremos buscar **sozinho, assim que a tela abre**. Pra isso existe o **\`useEffect\`** com \`[]\`:

\`\`\`tsx
useEffect(() => {
  async function buscarPosicao() {
    const resultado = await getCurrentPositionAsync();
    setPosicao(resultado);
  }
  buscarPosicao();
}, []);   // [] = roda UMA vez, quando a tela aparece
\`\`\`

E enquanto o GPS não responde? \`posicao\` ainda é \`null\`, e **não dá pra montar a região** sem latitude e longitude. A solução é uma **tela de espera**:

\`\`\`
posicao é null?   →  mostra "Procurando você..."
posicao chegou?   →  mostra o mapa centralizado nela
\`\`\`

- É o mesmo truque do \`App.tsx\`: um \`if\` com \`return\` **antes** do \`return\` principal.
- Bônus: \`posicao.coords\` **já tem** \`latitude\` e \`longitude\` dentro, então dá pra passar direto pro \`Marker\`: \`coordinate={posicao.coords}\`.`
},
{
  part:'Exemplo 9: mapa em mim', op:'challenge',
  title:'Sua vez: Exemplo 9, o mapa que te encontra',
  time:'10 min',
  md:
`Crie \`src/exemplos/Exemplo9MapaEmMim.tsx\`, juntando os Exemplos **7**, **2** e **3**:

1. O mesmo estado \`posicao\` do Exemplo 7, começando em \`null\`.
2. Um \`useEffect\` com \`[]\` que busca a posição quando a tela abre.
3. **Se** \`posicao\` for \`null\`: um \`return\` com o texto **"Procurando você..."** centralizado.
4. **Senão**: o \`MapView\` com \`initialRegion\` usando \`posicao.coords.latitude\` e \`posicao.coords.longitude\`, e deltas de \`0.01\` (bem perto).
5. Dentro do mapa, um \`<Marker>\` com o título **"Você está aqui"**.
6. Troque o \`import Exemplo\` no \`App.tsx\`.

> Esse é o mais longo da aula. Vá por partes e teste a cada passo: primeiro só o texto, depois o mapa, depois o alfinete.`
},
{
  part:'Exemplo 9: mapa em mim', op:'file', target:'src/exemplos/Exemplo9MapaEmMim.tsx',
  title:'Solução: criar o Exemplo 9',
},
{
  part:'Exemplo 9: mapa em mim', op:'code', file:'src/exemplos/Exemplo9MapaEmMim.tsx',
  title:'O estado e o useEffect',
  explain:'A mesma busca do Exemplo 7, só que dentro de um <code>useEffect</code> com <code>[]</code>: roda sozinha quando a tela abre.',
  code:
`import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { getCurrentPositionAsync, LocationObject } from 'expo-location';

export default function Exemplo9MapaEmMim() {
  const [posicao, setPosicao] = useState<LocationObject | null>(null);

  useEffect(() => {
    async function buscarPosicao() {
      const resultado = await getCurrentPositionAsync();
      setPosicao(resultado);
    }
    buscarPosicao();
  }, []);

`
},
{
  part:'Exemplo 9: mapa em mim', op:'code', file:'src/exemplos/Exemplo9MapaEmMim.tsx',
  title:'Enquanto não chega: a tela de espera',
  explain:'Sem posição não dá pra montar a região do mapa. Então, enquanto <code>posicao</code> é <code>null</code>, mostra só um texto.',
  code:
`  if (!posicao) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 18 }}>Procurando você...</Text>
      </View>
    );
  }

`
},
{
  part:'Exemplo 9: mapa em mim', op:'code', file:'src/exemplos/Exemplo9MapaEmMim.tsx',
  title:'Chegou: o mapa centralizado em você',
  explain:'A região usa a posição do GPS como centro. O <code>Marker</code> recebe <code>posicao.coords</code> direto, porque ele já tem latitude e longitude.',
  code:
`  return (
    <MapView
      style={{ flex: 1 }}
      initialRegion={{
        latitude: posicao.coords.latitude,
        longitude: posicao.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }}
    >
      <Marker coordinate={posicao.coords} title="Você está aqui" />
    </MapView>
  );
}
`
},
trocarExemplo('Exemplo8BolinhaAzul', 'Exemplo9MapaEmMim', 'Exemplo 9: mapa em mim'),
{
  part:'Exemplo 9: mapa em mim', op:'note',
  title:'Teste: o mapa te encontrou',
  md:
`Ao abrir, aparece **"Procurando você..."** por um instante e depois o mapa abre **em cima da escola**, com o alfinete **"Você está aqui"**.

> **Desafio rápido:** acrescentem \`showsUserLocation\` nesse \`MapView\`. Agora tem o alfinete **e** a bolinha azul. Eles ficam no mesmo lugar? Se não, a diferença é a **precisão** do GPS (lembram do \`accuracy\`?).`
},

/* ----------------------------------------------------------------------
   EXEMPLO 10: tocar no mapa
   ---------------------------------------------------------------------- */
{
  part:'Exemplo 10: tocar no mapa', op:'note',
  title:'Teoria: o mapa avisa onde foi o toque',
  md:
`**Parte C: interação.** O \`MapView\` também tem um **\`onPress\`**, igual ao de um botão. A diferença é que ele conta **onde** no mapa o dedo tocou:

\`\`\`tsx
<MapView onPress={(evento) => setPonto(evento.nativeEvent.coordinate)} />
\`\`\`

- **\`evento\`** é o "relatório" do toque, que o mapa entrega pra nossa função.
- **\`evento.nativeEvent.coordinate\`** é a **latitude e longitude** do ponto tocado. O mapa faz a conta de "pixel da tela" pra "lugar no planeta" pra gente.
- Guardando esse ponto num estado, dá pra desenhar um \`<Marker>\` nele.

O tipo do estado é **\`LatLng | null\`**: \`LatLng\` (de **Lat**itude e **L**o**ng**itude) é o tipo que a \`react-native-maps\` usa pra um ponto. Começa \`null\` porque ninguém tocou ainda.

> **Pergunta pra turma:** em qual app vocês já tocaram no mapa pra escolher um lugar?`
},
{
  part:'Exemplo 10: tocar no mapa', op:'challenge',
  title:'Sua vez: Exemplo 10, toque para marcar',
  time:'8 min',
  md:
`Crie \`src/exemplos/Exemplo10Tocar.tsx\`:

1. Importe \`MapView\`, \`Marker\` e o tipo \`LatLng\` da \`react-native-maps\`.
2. Um estado \`ponto\` do tipo \`LatLng | null\`, começando em \`null\`.
3. Um \`MapView\` com a \`initialRegion\` de Brasília (ou da cidade de vocês) e um \`onPress\` que guarda \`evento.nativeEvent.coordinate\` no estado.
4. **Se** tiver ponto, um \`<Marker>\` nele com o título **"Você tocou aqui"**.
5. Troque o \`import Exemplo\` no \`App.tsx\`.

> Dica pro item 4: o mesmo \`{ponto && ( ... )}\` do Exemplo 7, agora dentro do \`MapView\`.`
},
{
  part:'Exemplo 10: tocar no mapa', op:'file', target:'src/exemplos/Exemplo10Tocar.tsx',
  title:'Solução: criar o Exemplo 10',
},
{
  part:'Exemplo 10: tocar no mapa', op:'code', file:'src/exemplos/Exemplo10Tocar.tsx',
  title:'O mapa avisa, o estado guarda',
  explain:'Cada toque troca o <code>ponto</code> do estado, e o React redesenha o <code>Marker</code> no lugar novo.',
  code:
`import React, { useState } from 'react';
import MapView, { Marker, LatLng } from 'react-native-maps';

export default function Exemplo10Tocar() {
  const [ponto, setPonto] = useState<LatLng | null>(null);

  return (
    <MapView
      style={{ flex: 1 }}
      initialRegion={{
        latitude: -15.795,
        longitude: -47.88,
        latitudeDelta: 0.04,
        longitudeDelta: 0.04,
      }}
      onPress={(evento) => setPonto(evento.nativeEvent.coordinate)}
    >
      {ponto && <Marker coordinate={ponto} title="Você tocou aqui" />}
    </MapView>
  );
}
`
},
trocarExemplo('Exemplo9MapaEmMim', 'Exemplo10Tocar', 'Exemplo 10: tocar no mapa'),
{
  part:'Exemplo 10: tocar no mapa', op:'note',
  title:'Teste: marque um lugar',
  md:
`Toque em qualquer lugar do mapa: o alfinete **pula** pra lá. Toque em outro: ele **muda de lugar** (o estado guarda **um** ponto só).

Pra ver os números do toque, coloque um \`console.log(evento.nativeEvent.coordinate)\` e olhe os **logs** do Snack (aba embaixo do editor):

\`\`\`
{ latitude: -15.79712, longitude: -47.87931 }
\`\`\`

> Recapitulando os dez exemplos: **ver o mapa** (1, 2), **colocar coisas nele** (3, 4, 5), **estado + prop** (6), **descobrir onde estou** (7, 8, 9) e **evento do mapa** (10). Agora vocês têm todas as peças.`
},

/* ----------------------------------------------------------------------
   DESAFIO FINAL: Meus lugares
   ---------------------------------------------------------------------- */
{
  part:'Desafio final: Meus lugares', op:'challenge',
  title:'Desafio final: o app "Meus lugares"',
  time:'20 min',
  md:
`Juntem os exemplos **4**, **6**, **8** e **10** numa tela só, \`src/screens/MeusLugaresScreen.tsx\`, um app pra marcar lugares favoritos:

1. O mapa ocupa a tela, com a **bolinha azul** ligada.
2. **Cada toque** no mapa **acrescenta** um alfinete (sem apagar os anteriores), com o título "Lugar 1", "Lugar 2"...
3. Uma **barra embaixo** mostra **quantos lugares** já foram marcados e dois botões lado a lado: **"Satélite"/"Mapa"** e **"Limpar"**.

Dicas:

- Agora o estado é uma **lista** de pontos: \`useState<LatLng[]>([])\`.
- Pra acrescentar sem perder os antigos: \`setLugares([...lugares, ponto])\`. Os \`...\` "espalham" a lista antiga dentro da nova.
- Pra desenhar todos: \`lugares.map((lugar, indice) => ...)\`. O \`indice\` começa em 0, então o título é \`indice + 1\`.
- "Limpar" é só voltar a lista pra \`[]\`. Botões lado a lado: \`flexDirection: 'row'\`.

> No \`App.tsx\`, aponte o \`import Exemplo\` pra \`'./src/screens/MeusLugaresScreen'\`.`
},
{
  part:'Desafio final: Meus lugares', op:'file', target:'src/screens/MeusLugaresScreen.tsx',
  title:'Solução: criar a MeusLugaresScreen',
},
{
  part:'Desafio final: Meus lugares', op:'code', file:'src/screens/MeusLugaresScreen.tsx',
  title:'Os estados e a função de acrescentar',
  explain:'A lista de lugares (Exemplo 4, agora num estado) e o liga/desliga do satélite (Exemplo 6).',
  code:
`import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MapView, { Marker, LatLng } from 'react-native-maps';

export default function MeusLugaresScreen() {
  const [lugares, setLugares] = useState<LatLng[]>([]);
  const [satelite, setSatelite] = useState(false);

  function adicionarLugar(ponto: LatLng) {
    setLugares([...lugares, ponto]);
  }

`
},
{
  part:'Desafio final: Meus lugares', op:'code', file:'src/screens/MeusLugaresScreen.tsx',
  title:'O mapa com todos os alfinetes',
  explain:'Bolinha azul (Exemplo 8), <code>mapType</code> do estado (Exemplo 6), <code>onPress</code> acrescentando (Exemplo 10) e um <code>.map()</code> desenhando a lista (Exemplo 4).',
  code:
`  return (
    <View style={styles.container}>
      <MapView
        style={styles.mapa}
        showsUserLocation
        mapType={satelite ? 'satellite' : 'standard'}
        initialRegion={{
          latitude: -15.795,
          longitude: -47.88,
          latitudeDelta: 0.04,
          longitudeDelta: 0.04,
        }}
        onPress={(evento) => adicionarLugar(evento.nativeEvent.coordinate)}
      >
        {lugares.map((lugar, indice) => (
          <Marker key={indice} coordinate={lugar} title={\`Lugar \${indice + 1}\`} />
        ))}
      </MapView>
`
},
{
  part:'Desafio final: Meus lugares', op:'code', file:'src/screens/MeusLugaresScreen.tsx',
  title:'A barra de baixo',
  explain:'<code>lugares.length</code> é o tamanho da lista. "Limpar" troca a lista inteira por uma vazia.',
  code:
`      <View style={styles.barra}>
        <Text style={styles.contador}>{lugares.length} lugares marcados</Text>
        <View style={styles.botoes}>
          <TouchableOpacity onPress={() => setSatelite(!satelite)} style={styles.botao}>
            <Text style={styles.botaoTexto}>{satelite ? 'Mapa' : 'Satélite'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setLugares([])} style={styles.botao}>
            <Text style={styles.botaoTexto}>Limpar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
`
},
{
  part:'Desafio final: Meus lugares', op:'code', file:'src/screens/MeusLugaresScreen.tsx',
  title:'Os estilos',
  explain:'<code>flexDirection: \'row\'</code> deixa os botões lado a lado.',
  code:
`
const styles = StyleSheet.create({
  container: { flex: 1 },
  mapa: { flex: 1 },
  barra: { padding: 16, backgroundColor: '#fff' },
  contador: { fontSize: 18, textAlign: 'center', marginBottom: 12 },
  botoes: { flexDirection: 'row', justifyContent: 'space-around' },
  botao: { backgroundColor: '#2e6de6', borderRadius: 8, paddingVertical: 14, paddingHorizontal: 24 },
  botaoTexto: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
`
},
{
  part:'Desafio final: Meus lugares', op:'replace', file:'App.tsx',
  find:"import Exemplo from './src/exemplos/Exemplo10Tocar';\n",
  title:'Mostrar o app completo',
  explain:'Mesmo truque de sempre: uma linha muda e o App passa a mostrar a <code>MeusLugaresScreen</code>.',
  code:
`import Exemplo from './src/screens/MeusLugaresScreen';
`
},
{
  part:'Desafio final: Meus lugares', op:'note',
  title:'Teste: marquem a cidade',
  md:
`Toquem em vários lugares: cada toque **acrescenta** um alfinete e o contador sobe. Toquem num alfinete pra ver "Lugar 1", "Lugar 2"... Troquem pra satélite e depois **Limpar**: tudo some e o contador volta a zero.

> O texto diz "1 lugares marcados" quando só tem um. Como vocês consertariam? (Dica: ternário com \`lugares.length === 1\`.)`
},

/* ----------------------------------------------------------------------
   PESQUISA: os alunos trazem a teoria
   ---------------------------------------------------------------------- */
{
  part:'Pesquisa: tragam a teoria', op:'challenge',
  title:'Agora é a vez de vocês trazerem a teoria',
  time:'próxima aula',
  md:
`Em **grupos de 3 ou 4**, cada grupo escolhe **um tema**, pesquisa e **explica pra turma** na próxima aula:

1. **Como o GPS funciona**: quantos satélites existem? O que é **trilateração**? Por que o GPS funciona mal dentro de prédios e túneis?
2. **Latitude, longitude e fusos**: por que o Equador e Greenwich foram escolhidos como "zero"? Quais as coordenadas extremas do Brasil?
3. **Privacidade e LGPD**: localização é **dado pessoal**? Qual a diferença entre a permissão "durante o uso" e "sempre"? Mostrem um caso real de vazamento de localização.
4. **Seguir em tempo real**: pesquisem o \`watchPositionAsync\` da \`expo-location\`. Por que seguir a posição o tempo todo **gasta bateria**?
5. **Endereço ↔ coordenadas**: pesquisem \`geocodeAsync\` e \`reverseGeocodeAsync\`. Como o app transforma "Rua X, 100" em latitude e longitude, e o contrário?
6. **Distância entre dois pontos**: pesquisem a **fórmula de Haversine** e escrevam uma função em TypeScript que calcula a distância entre a Catedral e o Congresso.
7. **Por trás dos apps**: escolham um app (Uber, iFood, Waze, Strava) e expliquem **o que** ele faz com a localização e **quando** ele pede permissão.

**Cada grupo traz:**

- **Uma explicação de 5 minutos**, com as palavras de vocês (vale desenho no quadro ou 2 a 3 slides).
- **Um exemplo curtinho** no Snack, no estilo dos exemplos de hoje (até 30 linhas).
- **Uma pergunta** pra testar se a turma entendeu.

> Dica de pesquisa: comecem pela documentação oficial (docs.expo.dev e a página do \`react-native-maps\` no GitHub), e **testem** o que encontrarem antes de apresentar.`
},

/* ----------------------------------------------------------------------
   FECHAMENTO
   ---------------------------------------------------------------------- */
{
  part:'Fechamento', op:'outro',
  title:'Pronto: dez exemplos e um app de mapa!',
  md:
`Com duas bibliotecas, a turma mostrou um mapa, levou ele pra uma cidade, espetou alfinetes, desenhou linhas e círculos, trocou pra satélite, descobriu a própria posição e marcou lugares com o dedo, e juntou tudo num app completo.

## Conceitos de hoje
**Geolocalização** (GPS, Wi-Fi, antenas), **latitude e longitude**, o componente \`MapView\` e suas props (\`initialRegion\`, \`mapType\`, \`showsUserLocation\`, \`onPress\`), **região** com centro e deltas, \`Marker\`, \`Polyline\` e \`Circle\`, listas com \`.map()\` e \`key\`, **permissão** com \`useForegroundPermissions\`, \`getCurrentPositionAsync\` com \`async\`/\`await\`, \`useEffect\` com \`[]\`, tela de espera com \`if\` + \`return\` e o tipo \`LatLng\`.

## Desafios pra casa
1. **Trilha**: no "Meus lugares", ligue os alfinetes com uma \`Polyline\`, na ordem em que foram marcados.
2. **Começar em mim**: faça o "Meus lugares" abrir na posição de vocês (use o Exemplo 9).
3. **Cores**: o primeiro alfinete verde, o último vermelho e os do meio azuis (\`pinColor\`).
4. **Meus lugares de verdade**: troque a lista \`LUGARES\` do Exemplo 4 por 5 lugares importantes da cidade de vocês, com título e descrição.

> Entrega: o link do Snack com o app "Meus lugares" funcionando, e a pesquisa do grupo pronta pra apresentar na próxima aula.`
},
];

global.AULA_USANDO_GEOLOCALIZACAO = {
  meta: {
    titulo:    'Geolocalização e mapas',
    projeto:   'usando-geolocalizacao',
    subtitulo: 'React Native · react-native-maps · expo-location',
    vazio:     'Projeto vazio.<br>Vamos criar tudo do zero.',
  },
  inicial: { entries: INITIAL_ENTRIES, files: INITIAL_FILES },
  deps:    { titulo: 'Dependências', desde: DEP_STEP, lista: DEPS },
  steps:   STEPS,
};

})(window);
