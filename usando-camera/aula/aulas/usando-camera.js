/* =========================================================================
   AULA: Usando a câmera do celular

   Aula independente, projeto vazio. Em vez de um app grande, a turma faz
   SETE EXEMPLOS PEQUENOS, um arquivo cada (de 5 a 20 linhas), do mais
   fácil ao mais difícil:

     1. só a câmera            5. botão de virar a câmera
     2. câmera da frente       6. leitor de QR code
     3. câmera num quadrado    7. tirar uma foto
     4. lanterna

   A permissão é pedida UMA vez só, no App.tsx, e cada exemplo é trocado
   mudando uma única linha (o import). Cada exemplo segue o mesmo ciclo:
   slide de TEORIA curto -> cartão roxo "Sua vez" (a turma cria sozinha)
   -> solução digitada -> teste no celular.

   No fim: um desafio que junta os exemplos num app completo e uma
   atividade em que os GRUPOS pesquisam e trazem a teoria de um tema
   para apresentar à turma.

   Motor da apresentação: ../../shared/player/player.js
   ========================================================================= */
(function (global) {
'use strict';

/* Projeto começa vazio: tudo é criado durante a aula. */
const INITIAL_ENTRIES = [];
const INITIAL_FILES = {};

/* Dependência mostrada na lateral. Acende a partir do slide de instalação
   (índice 3). */
const DEP_STEP = 3;
const DEPS = [
  {name:'expo-camera', ver:'~17.0.10'},
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
   TEORIA GERAL (índices 0 a 4)
   ---------------------------------------------------------------------- */
{
  part:'Teoria', op:'intro',
  title:'Usando a câmera do celular',
  eyebrow:'React Native · expo-camera',
  md:
`Hoje o app vai usar uma peça **de verdade** do celular: a câmera. Em vez de um app grande, vamos fazer **sete exemplos pequenos**, cada um num arquivo curtinho:

1. **Só a câmera** na tela.
2. **Câmera da frente** (selfie).
3. **Câmera num quadrado**, com um título.
4. **Lanterna** liga/desliga.
5. **Botão de virar** a câmera.
6. **Leitor de QR code**.
7. **Tirar uma foto** e mostrar.

No fim, vocês juntam tudo num app de câmera completo e **trazem a teoria** de um tema pesquisado em grupo.

> Tenha o app **Expo Go** instalado no celular. Nos cartões **roxos** a aula para e é a vez da turma. **→** avança · **←** volta · **↑ ↓** mudam a velocidade.`
},
{
  part:'Teoria', op:'note',
  title:'As peças da expo-camera',
  md:
`O React Native sozinho não sabe ligar a câmera. Quem faz isso é a biblioteca **\`expo-camera\`**. A aula usa só isto dela:

\`\`\`tsx
import { CameraView, useCameraPermissions } from 'expo-camera';
\`\`\`

1. **\`useCameraPermissions()\`**, um hook (parecido com o \`useState\`) que diz se o usuário **deixou ou não** o app usar a câmera, e dá uma função pra **pedir**.
2. **\`<CameraView />\`**, um componente, igual a \`<View>\`. A diferença é que, em vez de um fundo colorido, ele mostra **o que a câmera está vendo**.
3. **Props do \`CameraView\`**, que mudam o jeito da câmera: \`facing\` (qual câmera), \`enableTorch\` (lanterna), \`onBarcodeScanned\` (ler QR code).
4. **\`takePictureAsync()\`**, a função que **tira a foto**.

> Cada exemplo da aula apresenta **uma peça nova** por vez. Ninguém precisa decorar tudo agora.`
},
{
  part:'Teoria', op:'note',
  title:'Por que precisa de permissão?',
  md:
`Câmera é **privacidade**. Por isso o Android e o iOS não deixam nenhum app ligar a câmera sem o usuário autorizar. É aquela janelinha que todo mundo já viu:

\`\`\`
┌─────────────────────────────────────┐
│ Permitir que o app tire fotos e     │
│ grave vídeos?                       │
│                                     │
│   [ Permitir ]      [ Não permitir ]│
└─────────────────────────────────────┘
\`\`\`

O \`useCameraPermissions()\` devolve um par, igual ao \`useState\`:

\`\`\`tsx
const [permissao, pedirPermissao] = useCameraPermissions();
\`\`\`

A variável **\`permissao\`** pode estar em três situações:

1. **\`null\`**: ainda carregando (o app está perguntando pro celular).
2. **\`permissao.granted\` é \`false\`**: ainda não deixou (ou negou).
3. **\`permissao.granted\` é \`true\`**: liberado, pode mostrar a câmera.

E a função **\`pedirPermissao()\`** abre a janelinha do sistema.

> **Pergunta pra turma:** que outros recursos do celular vocês acham que também pedem permissão? (Pensem em apps que vocês usam.)`
},
{
  part:'Teoria', op:'note',
  title:'Instalando e testando no celular',
  md:
`**No Expo Snack** (snack.expo.dev): não precisa instalar nada. Basta escrever o \`import\` e o Snack baixa a biblioteca sozinho.

**No computador**, dentro da pasta do projeto:

\`\`\`bash
npx expo install expo-camera
npx expo start
\`\`\`

- Use **\`npx expo install\`**, e não \`npm install\`: o Expo escolhe a versão da biblioteca que combina com o seu projeto.
- Depois do \`npx expo start\`, **escaneie o QR code** com o Expo Go (Android) ou com a câmera do iPhone.

> O emulador do computador normalmente **não tem câmera**. Para essa aula, teste **no celular de verdade**. Repare na lateral: a \`expo-camera\` acabou de aparecer nas dependências.`
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

Os exemplos ficam na pasta \`src/exemplos/\`, um arquivo cada. O \`App.tsx\` pede a permissão **uma vez só** e mostra o exemplo escolhido:

\`\`\`tsx
import Exemplo from './src/exemplos/Exemplo1Camera';  // troque só esta linha
...
return <Exemplo />;
\`\`\`

> Errou? Ótimo, é pra isso que serve o "Sua vez". Compare com a solução e descubra **onde** foi a diferença.`
},

/* ----------------------------------------------------------------------
   PREPARAÇÃO: a permissão, uma vez só, no App.tsx
   ---------------------------------------------------------------------- */
{
  part:'Preparação: permissão', op:'file', target:'App.tsx',
  title:'Criar o App.tsx',
  explain:'O <code>App.tsx</code> vai cuidar da permissão. Assim os exemplos ficam curtinhos.'
},
{
  part:'Preparação: permissão', op:'code', file:'App.tsx',
  title:'Três situações, três returns',
  explain:'<code>null</code> = carregando (tela vazia). <code>granted</code> falso = botão que chama <code>pedirPermissao</code>. Passou pelos dois <code>if</code> = liberado.',
  code:
`import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useCameraPermissions } from 'expo-camera';

export default function App() {
  const [permissao, pedirPermissao] = useCameraPermissions();

  if (!permissao) {
    return <View />;
  }

  if (!permissao.granted) {
    return (
      <View style={styles.centro}>
        <Text style={styles.texto}>Precisamos da sua permissão para usar a câmera.</Text>
        <TouchableOpacity onPress={pedirPermissao} style={styles.botao}>
          <Text style={styles.botaoTexto}>Permitir câmera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.centro}>
      <Text style={styles.texto}>Câmera liberada!</Text>
    </View>
  );
}
`
},
{
  part:'Preparação: permissão', op:'code', file:'App.tsx',
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
  part:'Preparação: permissão', op:'note',
  title:'Teste: a janelinha da permissão',
  md:
`Rode o app no celular e confira:

1. Aparece o texto **"Precisamos da sua permissão..."** e o botão azul.
2. Toque em **Permitir câmera**: a janelinha **do sistema** aparece.
3. Toque em **Permitir**: a tela muda sozinha para **"Câmera liberada!"**.

Por que mudou sozinha? Porque \`permissao\` funciona como um estado: quando o usuário responde, ele muda, e o React **desenha a tela de novo**, agora passando pelos dois \`if\`.

> **Negou sem querer?** O celular lembra da resposta. Vá em **Configurações → Apps → Expo Go → Permissões → Câmera** e libere de novo.`
},

/* ----------------------------------------------------------------------
   EXEMPLO 1: só a câmera
   ---------------------------------------------------------------------- */
{
  part:'Exemplo 1: só a câmera', op:'note',
  title:'Teoria: a câmera é só uma View',
  md:
`O \`<CameraView>\` se usa **igualzinho** a uma \`<View>\`. A única coisa obrigatória é dar **tamanho** pra ele:

\`\`\`tsx
<CameraView style={{ flex: 1 }} />
\`\`\`

- **\`flex: 1\`** quer dizer "ocupe todo o espaço que sobrar". Como ele é o único na tela, ocupa a tela toda.
- **Sem tamanho**, a câmera fica com altura zero e **não aparece nada** (é o erro mais comum!).
- **\`style={{ ... }}\`**: as chaves duplas são um objeto de estilo escrito direto ali, sem \`StyleSheet\`. Nos exemplos curtos isso deixa o código menor.

> **Pense:** se a gente trocasse \`flex: 1\` por \`height: 200\`, o que vocês acham que ia acontecer?`
},
{
  part:'Exemplo 1: só a câmera', op:'file', target:'src/exemplos/Exemplo1Camera.tsx',
  title:'Criar o Exemplo 1',
  explain:'As pastas <code>src</code> e <code>exemplos</code> são criadas junto.'
},
{
  part:'Exemplo 1: só a câmera', op:'code', file:'src/exemplos/Exemplo1Camera.tsx',
  title:'O menor app de câmera possível',
  explain:'Cinco linhas. Toda a parte difícil (ligar o sensor, desenhar a imagem 30 vezes por segundo) fica escondida dentro da biblioteca.',
  code:
`import React from 'react';
import { CameraView } from 'expo-camera';

export default function Exemplo1Camera() {
  return <CameraView style={{ flex: 1 }} />;
}
`
},
{
  part:'Exemplo 1: só a câmera', op:'insert', file:'App.tsx',
  after:"import { useCameraPermissions } from 'expo-camera';",
  title:'Importar o exemplo no App',
  explain:'O nome <code>Exemplo</code> é escolhido por nós: com <code>export default</code>, quem importa dá o nome que quiser.',
  code:
`import Exemplo from './src/exemplos/Exemplo1Camera';
`
},
{
  part:'Exemplo 1: só a câmera', op:'replace', file:'App.tsx',
  find:
`  return (
    <View style={styles.centro}>
      <Text style={styles.texto}>Câmera liberada!</Text>
    </View>
  );
`,
  title:'Mostrar o exemplo',
  explain:'Permissão liberada? Então mostra o exemplo escolhido. Daqui pra frente este <code>return</code> nunca mais muda.',
  code:
`  return <Exemplo />;
`
},
{
  part:'Exemplo 1: só a câmera', op:'note',
  title:'Teste: a câmera ao vivo',
  md:
`Salve e olhe o celular: **a tela inteira virou a câmera**. Mexa o celular, aponte pra turma, pro quadro.

Agora volte na pergunta do slide de teoria e **teste a resposta**: troque \`flex: 1\` por \`height: 200\` e veja o que acontece. Depois desfaça.

> Por padrão o \`CameraView\` usa a câmera **traseira**. O próximo exemplo muda isso com uma prop.`
},

/* ----------------------------------------------------------------------
   EXEMPLO 2: câmera da frente
   ---------------------------------------------------------------------- */
{
  part:'Exemplo 2: câmera da frente', op:'note',
  title:'Teoria: props mudam o componente',
  md:
`Lembra das **props**? São as "configurações" que a gente passa pra um componente, como o \`placeholder\` de um \`TextInput\`. O \`CameraView\` também tem as dele.

A prop **\`facing\`** escolhe **qual câmera** usar:

\`\`\`
facing="back"    câmera traseira  (é o padrão, se não passar nada)
facing="front"   câmera frontal   (a da selfie)
\`\`\`

> **Pergunta pra turma:** por que vocês acham que o padrão é a traseira, e não a frontal?`
},
{
  part:'Exemplo 2: câmera da frente', op:'challenge',
  title:'Sua vez: Exemplo 2, a selfie',
  time:'3 min',
  md:
`Crie o arquivo \`src/exemplos/Exemplo2Frontal.tsx\`:

1. **Copie** o Exemplo 1 inteiro.
2. Troque o nome da função para \`Exemplo2Frontal\`.
3. Acrescente **uma prop** no \`CameraView\` pra usar a câmera da frente.
4. No \`App.tsx\`, troque a linha do \`import Exemplo\` pra apontar pro arquivo novo.

> Funcionou se você se ver na tela!`
},
{
  part:'Exemplo 2: câmera da frente', op:'file', target:'src/exemplos/Exemplo2Frontal.tsx',
  title:'Solução: criar o Exemplo 2',
},
{
  part:'Exemplo 2: câmera da frente', op:'code', file:'src/exemplos/Exemplo2Frontal.tsx',
  title:'Uma prop a mais',
  explain:'Igual ao Exemplo 1, só com <code>facing="front"</code>.',
  code:
`import React from 'react';
import { CameraView } from 'expo-camera';

export default function Exemplo2Frontal() {
  return <CameraView style={{ flex: 1 }} facing="front" />;
}
`
},
trocarExemplo('Exemplo1Camera', 'Exemplo2Frontal', 'Exemplo 2: câmera da frente'),

/* ----------------------------------------------------------------------
   EXEMPLO 3: câmera num quadrado
   ---------------------------------------------------------------------- */
{
  part:'Exemplo 3: câmera num quadrado', op:'note',
  title:'Teoria: tamanho fixo e layout',
  md:
`Como a câmera é só uma View, ela obedece às mesmas regras de **layout** de qualquer outra:

\`\`\`
┌─────────────────────┐
│                     │
│      Sorria!        │  ← <Text>
│   ┌─────────────┐   │
│   │             │   │
│   │   câmera    │   │  ← <CameraView> 300 x 300
│   │             │   │
│   └─────────────┘   │
│                     │
└─────────────────────┘
\`\`\`

- **\`width\` e \`height\`** dão um tamanho fixo, em vez de \`flex: 1\`.
- Uma **\`<View>\` por fora** com \`justifyContent: 'center'\` e \`alignItems: 'center'\` centraliza tudo, como já fizemos na tela de login.
- Os filhos ficam **um embaixo do outro**: primeiro o texto, depois a câmera.`
},
{
  part:'Exemplo 3: câmera num quadrado', op:'challenge',
  title:'Sua vez: Exemplo 3, a moldura',
  time:'5 min',
  md:
`Crie \`src/exemplos/Exemplo3Quadrado.tsx\` com o desenho do slide anterior:

1. Uma \`<View>\` ocupando a tela toda, centralizando o conteúdo.
2. Dentro dela, um \`<Text>\` com **"Sorria!"** em letra grande.
3. Abaixo, um \`<CameraView>\` de **300 por 300**, com a câmera da frente.
4. Troque o \`import Exemplo\` no \`App.tsx\`.

> Não esqueça de importar \`View\` e \`Text\` do \`react-native\`. Terminou antes? Mude as cores e o tamanho.`
},
{
  part:'Exemplo 3: câmera num quadrado', op:'file', target:'src/exemplos/Exemplo3Quadrado.tsx',
  title:'Solução: criar o Exemplo 3',
},
{
  part:'Exemplo 3: câmera num quadrado', op:'code', file:'src/exemplos/Exemplo3Quadrado.tsx',
  title:'Texto em cima, câmera embaixo',
  explain:'A <code>View</code> de fora centraliza; a câmera tem tamanho fixo de 300 por 300.',
  code:
`import React from 'react';
import { View, Text } from 'react-native';
import { CameraView } from 'expo-camera';

export default function Exemplo3Quadrado() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 28, marginBottom: 16 }}>Sorria!</Text>
      <CameraView style={{ width: 300, height: 300 }} facing="front" />
    </View>
  );
}
`
},
trocarExemplo('Exemplo2Frontal', 'Exemplo3Quadrado', 'Exemplo 3: câmera num quadrado'),

/* ----------------------------------------------------------------------
   EXEMPLO 4: lanterna
   ---------------------------------------------------------------------- */
{
  part:'Exemplo 4: lanterna', op:'note',
  title:'Teoria: um estado liga/desliga',
  md:
`A prop **\`enableTorch\`** acende a **lanterna** (o flash) do celular: \`true\` acesa, \`false\` apagada.

Pra um botão ligar e desligar, a gente precisa **lembrar** se ela está acesa. Isso é um **estado**:

\`\`\`tsx
const [ligada, setLigada] = useState(false);   // começa apagada

<CameraView enableTorch={ligada} />           // a câmera obedece o estado

<Button onPress={() => setLigada(!ligada)} /> // o ! inverte: true vira false
\`\`\`

- **\`!ligada\`** quer dizer "o contrário de \`ligada\`". É o truque de todo botão liga/desliga.
- O **\`<Button>\`** é o botão mais simples do React Native: só precisa de \`title\` e \`onPress\`.
- O texto do botão pode mudar com o **ternário**: \`ligada ? 'Desligar' : 'Ligar'\` (se ligada, "Desligar"; senão, "Ligar").`
},
{
  part:'Exemplo 4: lanterna', op:'challenge',
  title:'Sua vez: Exemplo 4, a lanterna',
  time:'7 min',
  md:
`Crie \`src/exemplos/Exemplo4Lanterna.tsx\`:

1. Um estado \`ligada\`, começando em \`false\`.
2. Uma \`<View style={{ flex: 1 }}>\` com dois filhos: o \`<CameraView>\` (com \`flex: 1\` e \`enableTorch={ligada}\`) e um \`<Button>\` embaixo.
3. O botão inverte o estado ao ser tocado.
4. **Extra:** o texto do botão muda entre "Ligar lanterna" e "Desligar lanterna".

> Importe o \`useState\` do \`react\` e o \`View\` e o \`Button\` do \`react-native\`.`
},
{
  part:'Exemplo 4: lanterna', op:'file', target:'src/exemplos/Exemplo4Lanterna.tsx',
  title:'Solução: criar o Exemplo 4',
},
{
  part:'Exemplo 4: lanterna', op:'code', file:'src/exemplos/Exemplo4Lanterna.tsx',
  title:'Estado + prop = lanterna',
  explain:'Toda vez que o botão muda <code>ligada</code>, o React redesenha e o <code>CameraView</code> recebe o valor novo em <code>enableTorch</code>.',
  code:
`import React, { useState } from 'react';
import { View, Button } from 'react-native';
import { CameraView } from 'expo-camera';

export default function Exemplo4Lanterna() {
  const [ligada, setLigada] = useState(false);

  return (
    <View style={{ flex: 1 }}>
      <CameraView style={{ flex: 1 }} enableTorch={ligada} />
      <Button
        title={ligada ? 'Desligar lanterna' : 'Ligar lanterna'}
        onPress={() => setLigada(!ligada)}
      />
    </View>
  );
}
`
},
trocarExemplo('Exemplo3Quadrado', 'Exemplo4Lanterna', 'Exemplo 4: lanterna'),
{
  part:'Exemplo 4: lanterna', op:'note',
  title:'Teste: acendeu?',
  md:
`Toque no botão: a lanterna atrás do celular **acende**. Toque de novo: **apaga**. E o texto do botão acompanha.

> **Por que não funcionaria com \`facing="front"\`?** Porque a lanterna fica do lado de **trás** do celular, junto da câmera traseira. Teste e veja!`
},

/* ----------------------------------------------------------------------
   EXEMPLO 5: virar a câmera
   ---------------------------------------------------------------------- */
{
  part:'Exemplo 5: virar a câmera', op:'challenge',
  title:'Sua vez: Exemplo 5, o botão de virar',
  time:'7 min',
  md:
`**Teoria nova: nenhuma!** É a lanterna de novo, só que o estado guarda **uma palavra** em vez de \`true\`/\`false\`:

\`\`\`
lanterna:  false  ⇄  true
virar:     'back' ⇄  'front'
\`\`\`

Crie \`src/exemplos/Exemplo5Virar.tsx\`:

1. Copie o Exemplo 4.
2. Troque o estado por \`lado\`, começando em \`'back'\`. O tipo dele é \`CameraType\` (importe da \`expo-camera\`): \`useState<CameraType>('back')\`.
3. Passe \`facing={lado}\` pro \`CameraView\`.
4. O botão "Virar câmera" troca: se é \`'back'\` vira \`'front'\`, senão vira \`'back'\`. (Dica: ternário!)

> Essa é a ideia mais importante da aula: **estado + prop**. Quase tudo no React Native é isso.`
},
{
  part:'Exemplo 5: virar a câmera', op:'file', target:'src/exemplos/Exemplo5Virar.tsx',
  title:'Solução: criar o Exemplo 5',
},
{
  part:'Exemplo 5: virar a câmera', op:'code', file:'src/exemplos/Exemplo5Virar.tsx',
  title:'Mesma ideia da lanterna',
  explain:'<code>CameraType</code> é só um tipo do TypeScript: <code>\'front\' | \'back\'</code>. Ele impede de escrever, por exemplo, <code>\'frente\'</code> sem querer.',
  code:
`import React, { useState } from 'react';
import { View, Button } from 'react-native';
import { CameraView, CameraType } from 'expo-camera';

export default function Exemplo5Virar() {
  const [lado, setLado] = useState<CameraType>('back');

  return (
    <View style={{ flex: 1 }}>
      <CameraView style={{ flex: 1 }} facing={lado} />
      <Button
        title="Virar câmera"
        onPress={() => setLado(lado === 'back' ? 'front' : 'back')}
      />
    </View>
  );
}
`
},
trocarExemplo('Exemplo4Lanterna', 'Exemplo5Virar', 'Exemplo 5: virar a câmera'),

/* ----------------------------------------------------------------------
   EXEMPLO 6: leitor de QR code
   ---------------------------------------------------------------------- */
{
  part:'Exemplo 6: QR code', op:'note',
  title:'Teoria: a câmera também lê QR code',
  md:
`Um **QR code** é um desenho de quadradinhos pretos e brancos que guarda um **texto** (um link, um Pix, uma senha de Wi-Fi). A câmera "lê" o desenho e devolve o texto.

O \`CameraView\` já sabe fazer isso, com duas props:

\`\`\`tsx
<CameraView
  barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
  onBarcodeScanned={(leitura) => setTexto(leitura.data)}
/>
\`\`\`

- **\`barcodeScannerSettings\`** diz **o que** procurar: aqui, só QR codes.
- **\`onBarcodeScanned\`** é um **evento**, igual ao \`onPress\`. A diferença: no \`onPress\` quem "aperta" é o dedo; aqui quem avisa é a **câmera**, quando acha um QR code.
- **\`leitura.data\`** é o texto que estava guardado no QR code.

> **Pergunta pra turma:** em quais apps do dia a dia vocês já leram um QR code?`
},
{
  part:'Exemplo 6: QR code', op:'challenge',
  title:'Sua vez: Exemplo 6, o leitor',
  time:'7 min',
  md:
`Crie \`src/exemplos/Exemplo6QrCode.tsx\`:

1. Um estado \`texto\` começando com **"Aponte para um QR code"**.
2. Uma \`<View style={{ flex: 1 }}>\` com o \`<CameraView>\` em cima e um \`<Text>\` embaixo mostrando o \`texto\`.
3. Use as duas props do slide anterior pra, quando ler um QR code, guardar \`leitura.data\` no estado.

> Pra testar, o professor vai projetar um QR code no quadro (qualquer gerador on-line de QR code serve).`
},
{
  part:'Exemplo 6: QR code', op:'file', target:'src/exemplos/Exemplo6QrCode.tsx',
  title:'Solução: criar o Exemplo 6',
},
{
  part:'Exemplo 6: QR code', op:'code', file:'src/exemplos/Exemplo6QrCode.tsx',
  title:'A câmera avisa, o estado guarda',
  explain:'Quando a câmera acha um QR code, chama a função do <code>onBarcodeScanned</code>, que guarda o texto lido no estado.',
  code:
`import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { CameraView } from 'expo-camera';

export default function Exemplo6QrCode() {
  const [texto, setTexto] = useState('Aponte para um QR code');

  return (
    <View style={{ flex: 1 }}>
      <CameraView
        style={{ flex: 1 }}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={(leitura) => setTexto(leitura.data)}
      />
      <Text style={{ fontSize: 18, padding: 24, textAlign: 'center' }}>{texto}</Text>
    </View>
  );
}
`
},
trocarExemplo('Exemplo5Virar', 'Exemplo6QrCode', 'Exemplo 6: QR code'),
{
  part:'Exemplo 6: QR code', op:'note',
  title:'Teste: lendo o QR code',
  md:
`Aponte o celular pro QR code projetado: o texto embaixo da câmera muda pro conteúdo dele.

Experimentem também:

- Gerar um QR code com o **nome de vocês** e ler no celular do colega.
- Ler o QR code de alguma embalagem ou cartaz da sala.

> Repare que a gente **não escreveu nada** sobre como decifrar os quadradinhos. Isso é o poder de uma biblioteca: alguém já resolveu a parte difícil.`
},

/* ----------------------------------------------------------------------
   EXEMPLO 7: tirar uma foto
   ---------------------------------------------------------------------- */
{
  part:'Exemplo 7: tirar foto', op:'note',
  title:'Teoria: useRef, um controle remoto',
  md:
`Pra tirar a foto, alguém precisa **apertar o botão da câmera**. Mas o \`<Button>\` e o \`<CameraView>\` são componentes diferentes: como o botão fala com a câmera?

Com o **\`useRef\`**. Ele cria uma "caixinha" que guarda o próprio componente da câmera, e aí dá pra chamar funções dele:

\`\`\`tsx
const cameraRef = useRef<CameraView>(null);   // a caixinha, vazia

<CameraView ref={cameraRef} />                // o React guarda a câmera nela

cameraRef.current?.takePictureAsync();        // usa a câmera guardada
\`\`\`

- **\`ref={cameraRef}\`** liga a caixinha ao componente.
- **\`cameraRef.current\`** é a câmera em si. O **\`?.\`** protege o caso de ela ainda não existir.

> Pense no \`useRef\` como um **controle remoto**: o \`ref\` pareia o controle com a TV, o \`.current\` é apertar os botões.`
},
{
  part:'Exemplo 7: tirar foto', op:'note',
  title:'Teoria: esperar a foto e mostrar',
  md:
`Mais três ideias, e o exemplo está completo:

1. **\`async\` / \`await\`**: tirar a foto **demora** um pouquinho (por isso o nome termina em **Async**). O \`await\` faz a função **esperar** a foto ficar pronta antes de seguir.
2. **\`uri\`**: a foto vira um arquivo no celular, e o resultado traz o **endereço** desse arquivo, a \`uri\`. É como o endereço de uma casa: não é a casa, mas leva até ela.
3. **\`<Image source={{ uri: foto }} />\`** vai até o endereço e mostra a foto.

\`\`\`tsx
async function tirarFoto() {
  const resultado = await cameraRef.current?.takePictureAsync();
  if (resultado) {
    setFoto(resultado.uri);
  }
}
\`\`\`

> E pra só mostrar a \`<Image>\` **depois** que tiver foto: \`{foto !== '' && <Image ... />}\`. Lê-se: "se tem foto, **então** mostra a imagem".`
},
{
  part:'Exemplo 7: tirar foto', op:'file', target:'src/exemplos/Exemplo7Foto.tsx',
  title:'Criar o Exemplo 7',
  explain:'Esse é o exemplo com mais coisa nova, então a gente faz <b>junto</b>, sem cartão de desafio.'
},
{
  part:'Exemplo 7: tirar foto', op:'code', file:'src/exemplos/Exemplo7Foto.tsx',
  title:'Câmera, botão e miniatura',
  explain:'O botão chama <code>tirarFoto</code>, que usa o controle remoto (<code>cameraRef</code>) e guarda a <code>uri</code> no estado. A miniatura aparece embaixo.',
  code:
`import React, { useRef, useState } from 'react';
import { View, Image, Button } from 'react-native';
import { CameraView } from 'expo-camera';

export default function Exemplo7Foto() {
  const cameraRef = useRef<CameraView>(null);
  const [foto, setFoto] = useState('');

  async function tirarFoto() {
    const resultado = await cameraRef.current?.takePictureAsync();
    if (resultado) {
      setFoto(resultado.uri);
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <CameraView ref={cameraRef} style={{ flex: 1 }} />
      <Button title="Tirar foto" onPress={tirarFoto} />
      {foto !== '' && <Image source={{ uri: foto }} style={{ width: 120, height: 160 }} />}
    </View>
  );
}
`
},
trocarExemplo('Exemplo6QrCode', 'Exemplo7Foto', 'Exemplo 7: tirar foto'),
{
  part:'Exemplo 7: tirar foto', op:'note',
  title:'Teste: a primeira foto',
  md:
`Toque em **Tirar foto**: depois de um instante, a **miniatura** aparece embaixo da câmera. Tire outra: a miniatura é trocada pela nova.

Pra ver o endereço da foto, coloque um \`console.log(resultado.uri)\` dentro do \`if\` e olhe o terminal:

\`\`\`
file:///data/user/0/host.exp.exponent/cache/Camera/4f1c...e2.jpg
\`\`\`

> Recapitulando os sete exemplos: **ver** (1, 2, 3), **estado + prop** (4, 5), **evento da câmera** (6) e **controle remoto** (7). Agora vocês têm todas as peças.`
},

/* ----------------------------------------------------------------------
   DESAFIO FINAL: o app completo
   ---------------------------------------------------------------------- */
{
  part:'Desafio final: app completo', op:'challenge',
  title:'Desafio final: um app de câmera de verdade',
  time:'20 min',
  md:
`Juntem os exemplos **5** e **7** numa tela só, \`src/screens/CameraScreen.tsx\`, que funciona como o app de câmera do celular:

1. A câmera ocupa a tela, com uma **barra embaixo** com dois botões lado a lado: **"Virar"** e **"Tirar foto"**.
2. Ao tirar a foto, **a câmera some** e a foto aparece **em tela cheia**, com um botão **"Tirar outra"**.
3. "Tirar outra" volta pra câmera.

Dicas:

- Pra trocar a tela inteira, use um \`if (foto !== '')\` com um \`return\` próprio, antes do \`return\` da câmera.
- Botões lado a lado: uma \`<View>\` com \`flexDirection: 'row'\`.
- Pra deixar mais bonito, use \`TouchableOpacity\` e \`StyleSheet\`, como no \`App.tsx\`.

> No \`App.tsx\`, aponte o \`import Exemplo\` pra \`'./src/screens/CameraScreen'\`.`
},
{
  part:'Desafio final: app completo', op:'file', target:'src/screens/CameraScreen.tsx',
  title:'Solução: criar a CameraScreen',
},
{
  part:'Desafio final: app completo', op:'code', file:'src/screens/CameraScreen.tsx',
  title:'Os estados e as funções',
  explain:'Nada novo: o controle remoto e a foto do Exemplo 7, o lado do Exemplo 5.',
  code:
`import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { CameraView, CameraType } from 'expo-camera';

export default function CameraScreen() {
  const cameraRef = useRef<CameraView>(null);
  const [foto, setFoto] = useState('');
  const [lado, setLado] = useState<CameraType>('back');

  async function tirarFoto() {
    const resultado = await cameraRef.current?.takePictureAsync();
    if (resultado) {
      setFoto(resultado.uri);
    }
  }

  function virarCamera() {
    setLado(lado === 'back' ? 'front' : 'back');
  }

`
},
{
  part:'Desafio final: app completo', op:'code', file:'src/screens/CameraScreen.tsx',
  title:'Se tem foto, mostra a foto',
  explain:'Tela condicional, igual às da permissão no <code>App.tsx</code>. "Tirar outra" volta o estado para vazio e a câmera reaparece.',
  code:
`  if (foto !== '') {
    return (
      <View style={styles.container}>
        <Image source={{ uri: foto }} style={styles.foto} />
        <View style={styles.barra}>
          <TouchableOpacity onPress={() => setFoto('')} style={styles.botao}>
            <Text style={styles.botaoTexto}>Tirar outra</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

`
},
{
  part:'Desafio final: app completo', op:'code', file:'src/screens/CameraScreen.tsx',
  title:'Senão, mostra a câmera',
  explain:'A câmera com <code>ref</code> e <code>facing</code>, e a barra com os dois botões lado a lado.',
  code:
`  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing={lado} />
      <View style={styles.barra}>
        <TouchableOpacity onPress={virarCamera} style={styles.botao}>
          <Text style={styles.botaoTexto}>Virar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={tirarFoto} style={styles.botao}>
          <Text style={styles.botaoTexto}>Tirar foto</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
`
},
{
  part:'Desafio final: app completo', op:'code', file:'src/screens/CameraScreen.tsx',
  title:'Os estilos',
  explain:'<code>flexDirection: \'row\'</code> deixa os botões lado a lado; o fundo preto imita um app de câmera.',
  code:
`
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  foto: { flex: 1 },
  barra: { flexDirection: 'row', justifyContent: 'space-around', padding: 20 },
  botao: { backgroundColor: '#2e6de6', borderRadius: 8, paddingVertical: 14, paddingHorizontal: 24 },
  botaoTexto: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
`
},
{
  part:'Desafio final: app completo', op:'replace', file:'App.tsx',
  find:"import Exemplo from './src/exemplos/Exemplo7Foto';\n",
  title:'Mostrar o app completo',
  explain:'Mesmo truque de sempre: uma linha muda e o App passa a mostrar a <code>CameraScreen</code>.',
  code:
`import Exemplo from './src/screens/CameraScreen';
`
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

1. **Como a câmera do celular forma uma foto**: sensor, pixels, megapixels. Por que a foto da câmera frontal costuma ser pior?
2. **Permissões e privacidade**: por que o celular pede permissão? O que a **LGPD** diz sobre fotos e imagem das pessoas?
3. **Como funciona um QR code**: por que ele tem três quadrados nos cantos? Por que ainda funciona um pouco rasgado?
4. **\`useState\` x \`useRef\`**: qual a diferença? Quando usar cada um? Mostrem um exemplo que não seja de câmera.
5. **\`async\`, \`await\` e Promise**: o que significa "esperar" em programação? Outro exemplo além da foto.
6. **Salvar a foto na galeria**: pesquisem a biblioteca \`expo-media-library\` e mostrem como guardar a foto tirada.
7. **Escolher foto da galeria**: pesquisem a \`expo-image-picker\`. Qual a diferença pra \`expo-camera\`?

**Cada grupo traz:**

- **Uma explicação de 5 minutos**, com as palavras de vocês (vale desenho no quadro ou 2 a 3 slides).
- **Um exemplo curtinho** no Snack, no estilo dos exemplos de hoje (até 20 linhas).
- **Uma pergunta** pra testar se a turma entendeu.

> Dica de pesquisa: comecem pela documentação oficial (docs.expo.dev), e **testem** o que encontrarem antes de apresentar. Explicar pros colegas é a melhor forma de aprender de verdade.`
},

/* ----------------------------------------------------------------------
   FECHAMENTO
   ---------------------------------------------------------------------- */
{
  part:'Fechamento', op:'outro',
  title:'Pronto: sete exemplos e um app de câmera!',
  md:
`Com uma biblioteca só, a turma fez a câmera aparecer, virar, acender a lanterna, ler QR code e tirar foto, e juntou tudo num app completo.

## Conceitos de hoje
**Permissão** com \`useCameraPermissions\`, o componente \`CameraView\` e suas props (\`facing\`, \`enableTorch\`, \`barcodeScannerSettings\`, \`onBarcodeScanned\`), **estado + prop** (lanterna e virar), **evento da câmera** (QR code), \`useRef\` como "controle remoto", \`takePictureAsync\` com \`async\`/\`await\`, \`uri\` como endereço de um arquivo e telas condicionais com \`if\` + \`return\`.

## Desafios pra casa
1. **Botão redondo**: transforme o "Tirar foto" num círculo branco, como nos apps de câmera (\`width\`, \`height\` e \`borderRadius\` igual à metade).
2. **Lanterna no app completo**: acrescente o botão da lanterna (Exemplo 4) na \`CameraScreen\`.
3. **Contador**: mostre quantas fotos já foram tiradas desde que o app abriu.
4. **Galeria simples**: guarde **todas** as fotos num array (\`useState<string[]>([])\`) e mostre as miniaturas numa \`FlatList\` horizontal.

> Entrega: o link do Snack com o app completo funcionando, e a pesquisa do grupo pronta pra apresentar na próxima aula.`
},
];

global.AULA_USANDO_CAMERA = {
  meta: {
    titulo:    'Usando a câmera do celular',
    projeto:   'usando-camera',
    subtitulo: 'React Native · expo-camera',
    vazio:     'Projeto vazio.<br>Vamos criar tudo do zero.',
  },
  inicial: { entries: INITIAL_ENTRIES, files: INITIAL_FILES },
  deps:    { titulo: 'Dependências', desde: DEP_STEP, lista: DEPS },
  steps:   STEPS,
};

})(window);
