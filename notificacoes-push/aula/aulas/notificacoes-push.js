/* =========================================================================
   AULA 6: Notificações push

   Aula autocontida: em vez de continuar o app de tarefas, a turma monta um
   mini app que existe só para testar push no próprio celular, e um servidor
   pequeno (Node puro, sem dependências) que o professor roda na sala para
   mandar uma notificação para todos os aparelhos ao mesmo tempo.

   Os dois conceitos de prova que a aula cobre:
   1. A notificação chega com o app ENCERRADO, porque quem entrega é o
      serviço de notificação do sistema operacional (FCM no Android, APNs no
      iOS), e o destino é identificado por um TOKEN único do aparelho;
   2. o app precisa REGISTRAR esse token no servidor da aplicação, porque é
      o servidor que decide quando e para quem enviar.

   Formato: a teoria vem antes (Parte 2, seis slides seguidos), o código
   depois, com três cartões roxos de desafio. Todos os arquivos do app e do
   servidor são escritos do zero, só o app.json e o painel.html do servidor
   já estão na árvore.

   Motor da apresentação: ../../shared/player/player.js
   ========================================================================= */
(function (global) {
'use strict';

/* =========================================================================
   PONTO DE PARTIDA: um projeto Expo novo, com a configuração pronta e o
   painel web do servidor (HTML, não é assunto da aula).
   ========================================================================= */
const INITIAL_ENTRIES = [
  {path:'app.json', type:'file'},
  {path:'servidor', type:'dir'},
  {path:'servidor/painel.html', type:'file'},
];

const INITIAL_FILES = {
'app.json':
`{
  "expo": {
    "name": "Notificações Push",
    "slug": "notificacoes-push",
    "version": "1.0.0",
    "orientation": "portrait",
    "android": {
      "package": "com.aulasmobile.notificacoespush"
    },
    "ios": {
      "bundleIdentifier": "com.aulasmobile.notificacoespush"
    },
    "plugins": ["expo-notifications"]
  }
}
`,
'servidor/painel.html':
`<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Painel de push da turma</title>
<style>
  body { font-family: system-ui, sans-serif; max-width: 640px; margin: 32px auto; padding: 0 16px; color: #20242a; }
  input, textarea, button { width: 100%; font: inherit; padding: 10px; margin-bottom: 10px; box-sizing: border-box; }
  button { background: #2e6de6; color: #fff; border: 0; border-radius: 8px; font-weight: bold; cursor: pointer; }
  li { font-size: 13px; margin-bottom: 4px; word-break: break-all; }
  pre { background: #f2f4f8; padding: 12px; border-radius: 8px; white-space: pre-wrap; font-size: 12px; }
</style>
</head>
<body>
  <h1>Painel de push da turma</h1>

  <h2>Aparelhos cadastrados (<span id="total">0</span>)</h2>
  <ul id="aparelhos"></ul>

  <h2>Enviar para todos</h2>
  <input id="titulo" placeholder="Título" value="Aula de Mobile" />
  <textarea id="corpo" rows="3" placeholder="Mensagem">Feche o app e espere por mim!</textarea>
  <button id="enviar">Enviar push</button>

  <h2>Resposta do serviço de push</h2>
  <pre id="resultado">nada enviado ainda</pre>

<script>
  async function atualizar() {
    const lista = await (await fetch('/tokens')).json();
    document.getElementById('total').textContent = lista.length;
    document.getElementById('aparelhos').innerHTML = lista
      .map(function (item) { return '<li><b>' + item.aparelho + '</b><br>' + item.token + '</li>'; })
      .join('');
  }

  document.getElementById('enviar').onclick = async function () {
    const resposta = await fetch('/enviar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        titulo: document.getElementById('titulo').value,
        corpo: document.getElementById('corpo').value,
      }),
    });
    document.getElementById('resultado').textContent = JSON.stringify(await resposta.json(), null, 2);
    atualizar();
  };

  atualizar();
  setInterval(atualizar, 3000);
</script>
</body>
</html>
`,
};

/* As três bibliotecas do Expo instaladas hoje, acesas a partir do slide de
   instalação (DEP_STEP, calculado no fim do arquivo). */
const DEPS = [
  {name:'expo-notifications', ver:'~0.32.12'},
  {name:'expo-device', ver:'~8.0.9'},
  {name:'expo-constants', ver:'~18.0.9'},
];

/* =========================================================================
   ROTEIRO
   ops: intro | note | challenge | outro | folder | file | code | insert |
        replace | clear
   ========================================================================= */
const STEPS = [

/* ----------------------------------------------------------------------
   PARTE 1: Abertura
   ---------------------------------------------------------------------- */
{
  part:'Abertura', op:'intro',
  title:'Notificações push',
  eyebrow:'Aula 6 · React Native',
  md:
`Aquele aviso que aparece na tela do celular com o app **fechado**: "seu pedido saiu para entrega", "nova mensagem", "a aula começou". Hoje a turma entende **quem** entrega essa mensagem, **como** o servidor sabe para qual aparelho mandar, e testa isso no próprio celular.

- **Teoria primeiro:** o caminho completo de uma notificação, do servidor até a tela, e por que ela chega mesmo com o app encerrado.
- **Prática depois:** um mini app que mostra o **token** do seu aparelho, e um servidor da turma que manda push para todos ao mesmo tempo.

> Nos cartões **roxos de desafio** a aula para e é a vez da turma tentar. **→** avança · **←** volta · **↑ ↓** mudam a velocidade.`
},
{
  part:'Abertura', op:'note',
  title:'O mini app de hoje',
  md:
`Uma tela só, feita para testar, não para ser bonita:

- Mostra o **token** do aparelho e um botão para compartilhá-lo.
- Cadastra esse token no **servidor da turma**, que roda no computador do professor.
- Agenda uma **notificação local**, para comparar com a remota.
- Mostra a última notificação **recebida** com o app aberto e a última **tocada** na bandeja.

Do lado do professor, um servidor Node com quatro rotas e um painel web: a turma cadastra, o professor escreve uma mensagem, clica em **Enviar**, e os celulares da sala tocam juntos.

> Para testar push de verdade é preciso um **celular físico**. O slide "O que precisa para testar" explica o que muda entre Android e iPhone.`
},

/* ----------------------------------------------------------------------
   PARTE 2: Teoria
   ---------------------------------------------------------------------- */
{
  part:'Teoria', op:'note',
  title:'Notificação local x notificação push',
  md:
`As duas aparecem igual na tela. A diferença é **quem cria** a notificação:

- **Local:** o próprio app agenda ("me lembre daqui a 10 minutos"). Não precisa de internet nem de servidor. O app precisa ter rodado antes para agendar.
- **Push (remota):** a mensagem nasce **fora do aparelho**, num servidor, e viaja pela internet até o celular. É o que permite avisar sobre algo que aconteceu longe dali: um pagamento aprovado, uma mensagem nova, uma aula começando.

\`\`\`tsx
// local: o app agenda para si mesmo
Notifications.scheduleNotificationAsync({ content, trigger });

// push: o SERVIDOR manda, o app nem precisa estar aberto
POST https://exp.host/--/api/v2/push/send  { to: token, title, body }
\`\`\`

> Hoje a turma faz as duas, e a local serve de comparação: ela prova que a permissão e a exibição funcionam, mesmo quando a push ainda não chega.`
},
{
  part:'Teoria', op:'note',
  title:'Quem entrega: o serviço do sistema operacional',
  md:
`O servidor da aplicação **não fala direto com o celular**. Ele não sabe o IP do aparelho (que muda o tempo todo, Wi-Fi, 4G, outra rede), e o celular não aceita conexões chegando de qualquer servidor.

Quem faz a entrega é um serviço mantido pelo **dono do sistema operacional**:

- **Android:** FCM, o Firebase Cloud Messaging, do Google.
- **iOS:** APNs, o Apple Push Notification service.

O próprio sistema operacional mantém **uma única conexão** aberta e econômica com esse serviço, o tempo todo, para **todos** os apps do aparelho. Quando chega uma mensagem, é o sistema que acorda e mostra o aviso.

> É por isso que a notificação chega com o app **encerrado**: o app não precisa estar rodando nem "escutando" nada. Quem está escutando é o sistema operacional. Um app que mantivesse a própria conexão aberta gastaria bateria e seria fechado pelo sistema.`
},
{
  part:'Teoria', op:'note',
  title:'O token: o endereço do aparelho',
  md:
`Se o servidor não fala direto com o celular, como ele diz **para quem** é a mensagem? Com um **token**: um identificador único, gerado pelo serviço de push, que aponta para **este app neste aparelho**.

\`\`\`text
ExponentPushToken[xGh2kP0aQ1n7Zt3LmB9cWd]
\`\`\`

- É **por app e por aparelho**: o mesmo celular tem um token diferente para cada app; o mesmo app tem um token diferente em cada celular.
- **Não é fixo:** reinstalar o app, limpar os dados ou restaurar o aparelho gera um token novo. Por isso o app pede o token **toda vez que abre**, em vez de guardar um valor para sempre.
- Só existe **depois da permissão**: sem o usuário aceitar receber notificações, não há token.
- Não é segredo como uma senha, mas é dado pessoal: quem tem o token consegue mandar avisos para aquele aparelho.

> O Expo entrega um **Expo Push Token**, que embrulha o token nativo (do FCM ou do APNs). Assim o mesmo código de servidor manda para Android e iPhone, e o Expo traduz para o serviço certo.`
},
{
  part:'Teoria', op:'note',
  title:'O caminho completo de uma notificação',
  md:
`Juntando as peças, uma push faz duas viagens: uma **de ida** (cadastro do token, acontece uma vez) e uma **de volta** (o envio, acontece sempre que o servidor quiser avisar).

\`\`\`text
CADASTRO (quando o app abre)
1. App       pede permissão ao usuário
2. Sistema   FCM / APNs gera o TOKEN deste app neste aparelho
3. App       envia o token para o SEU servidor     POST /tokens
4. Servidor  guarda o token (num banco; hoje, num Map)

ENVIO (horas ou dias depois)
5. Servidor  manda { to: token, title, body }      Expo Push API
6. Expo      repassa para o FCM (Android) ou o APNs (iOS)
7. Sistema   entrega e mostra o aviso, app aberto ou encerrado
\`\`\`

O passo 3 é o que mais cai em prova: **o app registra o token no servidor da aplicação**. Sem ele, o servidor não tem para onde mandar. O serviço do sistema operacional só sabe entregar; quem sabe **quando** e **para quem** avisar é o seu servidor, porque é ele que conhece os usuários, os pedidos, as mensagens.

> O envio sai **do servidor**, nunca do app: as credenciais de envio (a chave do FCM, o certificado da Apple) ficam no servidor. Colocar isso dentro do app distribuído deixaria qualquer um que abrisse o pacote mandar notificação em nome da empresa.`
},
{
  part:'Teoria', op:'note',
  title:'Os três estados do app',
  md:
`Quando a notificação chega, o que acontece depende de como o app está:

- **Encerrado:** o sistema mostra o aviso na bandeja sozinho. Se o usuário tocar, o sistema **abre o app**, e o app pode descobrir qual notificação foi tocada.
- **Em segundo plano:** igual, o sistema mostra. O toque traz o app de volta para a frente.
- **Em primeiro plano (aberto na tela):** aqui o sistema **pergunta ao app** o que fazer. Por padrão, nada aparece, porque o usuário já está olhando para o app.

No código, cada estado tem uma ferramenta:

\`\`\`tsx
Notifications.setNotificationHandler(...)            // app aberto: mostra ou não?
Notifications.addNotificationReceivedListener(...)   // app aberto: chegou uma
Notifications.useLastNotificationResponse()          // qualquer estado: qual foi tocada
\`\`\`

> \`useLastNotificationResponse\` é o que funciona até com o app **encerrado**: o toque abre o app do zero, e o hook devolve a notificação que causou a abertura.`
},
{
  part:'Teoria', op:'note',
  title:'O que precisa para testar',
  md:
`Push tem mais exigências que o resto do curso. Antes de digitar, cada um confere o seu caso:

- **Celular físico.** Emulador não recebe push, e o código vai checar isso com \`Device.isDevice\`.
- **iPhone:** o **Expo Go** recebe push normalmente. Basta rodar o projeto.
- **Android:** desde o SDK 53, o Expo Go **não recebe push remota**. Instale o **APK da turma** (link no quadro), um build deste mesmo app que o professor gerou com \`eas build\`. A notificação **local** funciona no Expo Go.
- **projectId do Expo:** o token é emitido para um projeto. \`npx eas-cli init\` cria o projeto na sua conta Expo (gratuita) e grava o \`projectId\` no \`app.json\`.
- **Mesma rede do servidor:** o celular precisa alcançar o computador do professor (mesmo Wi-Fi), ou o servidor exposto por um túnel HTTPS.

> **Plano B**, que sempre funciona: copie o token do app e cole na ferramenta web do Expo, \`expo.dev/notifications\`. Ela faz o papel do servidor.`
},

/* ----------------------------------------------------------------------
   PARTE 3: Instalando
   ---------------------------------------------------------------------- */
{
  part:'Instalando', op:'note',
  title:'Três bibliotecas do Expo',
  md:
`No terminal, dentro do projeto:

\`\`\`bash
npx expo install expo-notifications expo-device expo-constants
\`\`\`

- \`expo-notifications\`, a principal: permissão, token, listeners, notificação local.
- \`expo-device\`, para saber se é um aparelho de verdade (\`Device.isDevice\`) e o nome do modelo.
- \`expo-constants\`, para ler o \`projectId\` gravado no \`app.json\`.

Como na aula de navegação: \`npx expo install\`, não \`npm install\`, para pegar a versão compatível com o SDK do projeto.

Depois, uma vez só por projeto:

\`\`\`bash
npx eas-cli init
\`\`\`

Ele pede login na conta Expo, cria o projeto e acrescenta ao \`app.json\` o \`extra.eas.projectId\`. O \`app.json\` da barra lateral já tem o plugin \`expo-notifications\` declarado em \`plugins\`.

> Este projeto **não roda no Expo Snack**: push precisa de um app instalado de verdade, com permissão do sistema e um projeto Expo. Hoje é no celular.`
},

/* ----------------------------------------------------------------------
   PARTE 4: Registrar o aparelho
   ---------------------------------------------------------------------- */
{
  part:'Registrar o aparelho', op:'challenge', time:'8 min',
  title:'Escreva o registrarParaPush',
  md:
`Crie \`src/notificacoes/registrar.ts\` com uma função \`async\` que devolve o token do aparelho, ou lança um erro explicando por que não deu:

1. Se \`!Device.isDevice\`, lance \`new Error('Push só funciona em aparelho físico...')\`.
2. No Android (\`Platform.OS === 'android'\`), crie o **canal** com \`Notifications.setNotificationChannelAsync('default', { name, importance })\`.
3. Leia a permissão atual com \`getPermissionsAsync()\`; se não for \`'granted'\`, peça com \`requestPermissionsAsync()\`. Se mesmo assim não vier \`'granted'\`, lance um erro.
4. Leia \`Constants.expoConfig?.extra?.eas?.projectId\`; se não existir, erro.
5. \`await Notifications.getExpoPushTokenAsync({ projectId })\` e devolva o \`.data\`.

> \`throw new Error(...)\` interrompe a função e entrega o problema para quem chamou, que vai mostrar a mensagem na tela com \`try/catch\`. E o \`?.\` é o **encadeamento opcional**: se algum pedaço do caminho não existir, o resultado é \`undefined\` em vez de o app quebrar.`
},
{
  part:'Registrar o aparelho', op:'file', target:'src/notificacoes/registrar.ts',
  title:'Criar src/notificacoes/registrar.ts',
  explain:'Um arquivo sem tela, só lógica: tudo o que o app faz para conseguir o token fica aqui, longe do JSX.'
},
{
  part:'Registrar o aparelho', op:'code', file:'src/notificacoes/registrar.ts',
  title:'Os imports',
  explain:'<code>import * as Notifications</code> traz a biblioteca inteira com um nome só, e é por isso que tudo dela vai aparecer como <code>Notifications.alguma</code>. O <code>Platform</code> do React Native diz se o app está no Android ou no iOS.',
  code:
`import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

`
},
{
  part:'Registrar o aparelho', op:'code', file:'src/notificacoes/registrar.ts',
  title:'Aparelho físico e o canal do Android',
  explain:'No Android 8+, toda notificação pertence a um <b>canal</b>, que o usuário pode silenciar nas configurações. <code>importance: MAX</code> faz o aviso aparecer no topo da tela. O canal é criado <b>antes</b> de pedir permissão: no Android 13+ é isso que faz a pergunta aparecer.',
  code:
`export async function registrarParaPush(): Promise<string> {
  if (!Device.isDevice) {
    throw new Error('Push só funciona em aparelho físico, não no emulador.');
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Avisos da turma',
      importance: Notifications.AndroidImportance.MAX,
    });
  }

`
},
{
  part:'Registrar o aparelho', op:'code', file:'src/notificacoes/registrar.ts',
  title:'Permissão: primeiro olha, depois pergunta',
  explain:'Perguntar só se ainda não tiver permissão: quem já aceitou não vê a pergunta de novo. Se o usuário recusar, o sistema não deixa perguntar outra vez, só nas configurações do aparelho.',
  code:
`  const atual = await Notifications.getPermissionsAsync();
  let status = atual.status;
  if (status !== 'granted') {
    const pedido = await Notifications.requestPermissionsAsync();
    status = pedido.status;
  }
  if (status !== 'granted') {
    throw new Error('Permissão de notificação negada.');
  }

`
},
{
  part:'Registrar o aparelho', op:'code', file:'src/notificacoes/registrar.ts',
  title:'O token, finalmente',
  explain:'<code>getExpoPushTokenAsync</code> conversa com o FCM/APNs pelo sistema e devolve o Expo Push Token. É o passo 2 do caminho completo: daqui pra frente, este aparelho tem um endereço.',
  code:
`  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  if (!projectId) {
    throw new Error('projectId não encontrado: rode "npx eas-cli init" no projeto.');
  }

  const token = await Notifications.getExpoPushTokenAsync({ projectId });
  return token.data;
}
`
},

/* ----------------------------------------------------------------------
   PARTE 5: A tela
   ---------------------------------------------------------------------- */
{
  part:'A tela', op:'file', target:'App.tsx',
  title:'Criar App.tsx',
  explain:'O <code>App.tsx</code> de hoje é pequeno: decide o que fazer com notificações em primeiro plano e mostra a única tela.'
},
{
  part:'A tela', op:'code', file:'App.tsx',
  title:'O que fazer com o app aberto',
  explain:'Sem <code>setNotificationHandler</code>, a notificação que chega com o app <b>aberto</b> não aparece. Aqui ele responde "mostra o banner, coloca na lista e toca o som". Fica fora do componente porque vale para o app inteiro e só precisa ser dito uma vez.',
  code:
`import React from 'react';
import * as Notifications from 'expo-notifications';
import NotificacoesScreen from './src/screens/NotificacoesScreen';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  return <NotificacoesScreen />;
}
`
},
{
  part:'A tela', op:'note',
  title:'useEffect: o que roda quando a tela aparece',
  md:
`A tela precisa fazer duas coisas assim que aparece, uma vez só: pedir o token e começar a ouvir as notificações que chegarem. Isso é trabalho para o \`useEffect\` com a lista de dependências **vazia**:

\`\`\`tsx
useEffect(() => {
  // roda UMA vez, logo depois da primeira renderização
  const assinatura = Notifications.addNotificationReceivedListener(...);

  return () => assinatura.remove();  // roda quando a tela sai
}, []);
\`\`\`

- O \`[]\` no fim diz: "não depende de nada, não precisa rodar de novo".
- A função **devolvida** pelo efeito é a **limpeza**: tira o listener quando a tela some, para não ficar ouvindo à toa.
- O \`useEffect\` não aceita uma função \`async\` direto, então o pedido do token fica numa função \`async\` **de dentro**, chamada logo em seguida.

E para o toque na bandeja, nem precisa de efeito: \`Notifications.useLastNotificationResponse()\` é um **hook** pronto da biblioteca, que já devolve a última notificação tocada, inclusive a que abriu o app encerrado.`
},
{
  part:'A tela', op:'challenge', time:'8 min',
  title:'Monte a NotificacoesScreen',
  md:
`Crie \`src/screens/NotificacoesScreen.tsx\` com:

1. Três estados: \`token\`, \`erro\` e \`ultimaRecebida\` (todos texto, começando vazios), e \`const ultimaTocada = Notifications.useLastNotificationResponse();\`
2. Um \`useEffect(..., [])\` que chama \`registrarParaPush()\` dentro de um \`try/catch\` (sucesso vai para \`setToken\`, erro vai para \`setErro\`) e registra um \`addNotificationReceivedListener\` que guarda o \`title\` da notificação.
3. Um \`handleNotificacaoLocal\` que agenda uma notificação para daqui a **5 segundos**, com \`trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 5 }\`.
4. O JSX: o token (ou o erro, em vermelho), um botão **Compartilhar token** com \`Share.share({ message: token })\`, o botão da notificação local e as duas últimas notificações.

> Use \`ScrollView\` em vez de \`View\` como raiz: num celular pequeno, com o teclado aberto, a tela não cabe. E \`<Text selectable>\` deixa o usuário segurar o dedo no token para copiar.`
},
{
  part:'A tela', op:'file', target:'src/screens/NotificacoesScreen.tsx',
  title:'Criar NotificacoesScreen.tsx',
  explain:'A única tela do app. Ela não sabe <b>como</b> o token é conseguido, só chama <code>registrarParaPush</code> e mostra o resultado.'
},
{
  part:'A tela', op:'code', file:'src/screens/NotificacoesScreen.tsx',
  title:'Imports',
  explain:'<code>Share</code> é do próprio React Native: abre a folha de compartilhar do sistema (WhatsApp, e-mail, copiar). É o jeito mais rápido de tirar o token do celular e levar para o computador.',
  code:
`import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, StyleSheet, Alert, Share, ScrollView } from 'react-native';
import * as Notifications from 'expo-notifications';
import { registrarParaPush } from '../notificacoes/registrar';

`
},
{
  part:'A tela', op:'code', file:'src/screens/NotificacoesScreen.tsx',
  title:'Os estados e o hook do toque',
  explain:'<code>ultimaTocada</code> não é <code>useState</code>: quem guarda e atualiza esse valor é a própria biblioteca. A tela só lê.',
  code:
`export default function NotificacoesScreen() {
  const [token, setToken] = useState('');
  const [erro, setErro] = useState('');
  const [ultimaRecebida, setUltimaRecebida] = useState('');
  const ultimaTocada = Notifications.useLastNotificationResponse();

`
},
{
  part:'A tela', op:'code', file:'src/screens/NotificacoesScreen.tsx',
  title:'Ao abrir: pede o token e começa a ouvir',
  explain:'<code>(e as Error).message</code> diz ao TypeScript "trate isso como um <code>Error</code>": no <code>catch</code>, o erro chega sem tipo. A mensagem é a mesma que <code>registrarParaPush</code> escreveu no <code>throw</code>.',
  code:
`  useEffect(() => {
    async function iniciar() {
      try {
        setToken(await registrarParaPush());
      } catch (e) {
        setErro((e as Error).message);
      }
    }
    iniciar();

    const assinatura = Notifications.addNotificationReceivedListener((notificacao) => {
      setUltimaRecebida(notificacao.request.content.title || '(sem título)');
    });
    return () => assinatura.remove();
  }, []);

`
},
{
  part:'A tela', op:'code', file:'src/screens/NotificacoesScreen.tsx',
  title:'A notificação local, para comparar',
  explain:'Sem servidor e sem token: o próprio app pede ao sistema "me avise daqui a 5 segundos". Dá tempo de sair do app e ver o aviso chegar com ele em segundo plano.',
  code:
`  async function handleNotificacaoLocal() {
    await Notifications.scheduleNotificationAsync({
      content: { title: 'Notificação local', body: 'Agendada pelo próprio app, sem servidor.' },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 5,
      },
    });
    Alert.alert('Agendada', 'Saia do app: ela chega em 5 segundos.');
  }

`
},
{
  part:'A tela', op:'code', file:'src/screens/NotificacoesScreen.tsx',
  title:'O JSX',
  explain:'<code>{erro ? ... : ...}</code> escolhe entre mostrar o erro ou o token. Enquanto o token não chega, o texto diz "Gerando token...". Nas duas últimas linhas, a notificação tocada vem de dentro do objeto que o hook devolve: <code>notification.request.content.title</code>.',
  code:
`  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Notificações push</Text>

      <Text style={styles.rotulo}>Token deste aparelho</Text>
      {erro ? (
        <Text style={styles.erro}>{erro}</Text>
      ) : (
        <Text style={styles.token} selectable>
          {token || 'Gerando token...'}
        </Text>
      )}

      <TouchableOpacity onPress={() => Share.share({ message: token })} style={styles.botao}>
        <Text style={styles.botaoTexto}>Compartilhar token</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleNotificacaoLocal} style={styles.botaoSecundario}>
        <Text style={styles.botaoSecundarioTexto}>Testar notificação local (5 s)</Text>
      </TouchableOpacity>

      <Text style={styles.rotulo}>Última recebida com o app aberto</Text>
      <Text style={styles.valor}>{ultimaRecebida || 'nenhuma ainda'}</Text>

      <Text style={styles.rotulo}>Última tocada na bandeja</Text>
      <Text style={styles.valor}>
        {ultimaTocada ? ultimaTocada.notification.request.content.title : 'nenhuma ainda'}
      </Text>
    </ScrollView>
  );
}

`
},
{
  part:'A tela', op:'code', file:'src/screens/NotificacoesScreen.tsx',
  title:'Estilos',
  explain:'No <code>ScrollView</code>, o estilo vai em <code>contentContainerStyle</code> e usa <code>flexGrow: 1</code> (não <code>flex: 1</code>), para o conteúdo poder crescer além da tela e rolar.',
  code:
`const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  titulo: { fontSize: 24, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  rotulo: { fontSize: 12, color: '#999', textTransform: 'uppercase', marginTop: 16, marginBottom: 6 },
  token: { fontSize: 13, backgroundColor: '#f2f4f8', borderRadius: 8, padding: 12 },
  erro: { color: '#d33', backgroundColor: '#fdecec', borderRadius: 8, padding: 12 },
  valor: { fontSize: 16 },
  botao: { backgroundColor: '#2e6de6', borderRadius: 8, padding: 14, marginTop: 12 },
  botaoTexto: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  botaoSecundario: {
    borderWidth: 1,
    borderColor: '#2e6de6',
    borderRadius: 8,
    padding: 14,
    marginTop: 24,
  },
  botaoSecundarioTexto: { color: '#2e6de6', textAlign: 'center', fontWeight: 'bold' },
});
`
},
{
  part:'A tela', op:'note',
  title:'Primeiro teste: o token aparece?',
  md:
`Rode \`npx expo start\` e abra no celular (Expo Go no iPhone, APK da turma no Android).

1. O sistema pergunta se o app pode mandar notificações: **Permitir**.
2. Em um ou dois segundos, o token aparece na tela: \`ExponentPushToken[...]\`.
3. Toque em **Testar notificação local**, saia do app e espere: o aviso chega em 5 segundos.

Se apareceu uma mensagem vermelha no lugar do token, ela diz o porquê:

- "aparelho físico": você está num emulador.
- "Permissão negada": libere nas configurações do celular, em Notificações.
- "projectId não encontrado": falta rodar \`npx eas-cli init\`.

> Com o token na tela, já dá para receber uma push de verdade: **Compartilhar token**, mande para o computador e cole em \`expo.dev/notifications\`. Mas o certo é o app entregar o token sozinho para um servidor, e é o que vem agora.`
},

/* ----------------------------------------------------------------------
   PARTE 6: O servidor da turma
   ---------------------------------------------------------------------- */
{
  part:'Servidor da turma', op:'note',
  title:'Um servidor com quatro rotas',
  md:
`O servidor faz o papel do "seu servidor" do caminho completo: **guarda os tokens** que os apps mandam e, quando alguém pede, **envia** uma push para todos eles pela API do Expo.

\`\`\`text
GET  /          o painel web (servidor/painel.html, já pronto)
GET  /tokens    lista os aparelhos cadastrados
POST /tokens    o app cadastra o próprio token     ← passo 3
POST /enviar    manda uma push para todos          ← passo 5
\`\`\`

- **Node puro**, sem Express e sem nenhuma dependência: \`http\` para o servidor, \`fetch\` para chamar o Expo (o Node 18+ já tem).
- Os tokens ficam num \`Map\` na memória: reiniciou o servidor, perdeu tudo. Num sistema de verdade, seria uma tabela no banco, ligada ao usuário logado.
- A resposta do Expo diz, token por token, se deu certo. Se vier \`DeviceNotRegistered\`, aquele token morreu (o app foi desinstalado, por exemplo), e o servidor **apaga** o token.

> Rodar: \`node servidor/servidor.js\` (ou \`npm run servidor\`). O terminal mostra o endereço do painel e o endereço que os celulares devem usar.`
},
{
  part:'Servidor da turma', op:'file', target:'servidor/servidor.js',
  title:'Criar servidor/servidor.js',
  explain:'JavaScript puro rodando no Node, fora do app. Mesma pasta do <code>painel.html</code>, que já estava pronto.'
},
{
  part:'Servidor da turma', op:'code', file:'servidor/servidor.js',
  title:'Módulos do Node e o "banco" de tokens',
  explain:'<code>require</code> é o <code>import</code> antigo do Node. O <code>Map</code> guarda pares <b>token → nome do aparelho</b>: cadastrar o mesmo token duas vezes só sobrescreve, não duplica.',
  code:
`const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');

const PORTA = Number(process.env.PORTA) || 3000;
const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

const tokens = new Map();

`
},
{
  part:'Servidor da turma', op:'code', file:'servidor/servidor.js',
  title:'Duas ajudantes: ler e responder JSON',
  explain:'O <code>http</code> do Node entrega o corpo da requisição em pedaços (<code>data</code>) e avisa quando acabou (<code>end</code>). <code>lerJson</code> junta os pedaços e devolve uma <code>Promise</code>, para poder usar <code>await</code>.',
  code:
`function lerJson(req) {
  return new Promise((resolve, reject) => {
    let corpo = '';
    req.on('data', (pedaco) => (corpo += pedaco));
    req.on('end', () => {
      try {
        resolve(corpo ? JSON.parse(corpo) : {});
      } catch (erro) {
        reject(erro);
      }
    });
  });
}

function responder(res, status, dados) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(dados));
}

`
},
{
  part:'Servidor da turma', op:'code', file:'servidor/servidor.js',
  title:'Cadastrar: o passo 3 do lado do servidor',
  explain:'A expressão regular confere o formato <code>ExponentPushToken[...]</code> antes de guardar: servidor nunca confia no que chega. Formato inválido devolve <code>false</code>, e a rota responde 400.',
  code:
`function cadastrarToken(dados) {
  if (!/^Expo(nent)?PushToken\\[.+\\]$/.test(dados.token || '')) {
    return false;
  }
  tokens.set(dados.token, dados.aparelho || 'aparelho sem nome');
  console.log(\`+ token cadastrado: \${tokens.get(dados.token)} (\${tokens.size} no total)\`);
  return true;
}

`
},
{
  part:'Servidor da turma', op:'code', file:'servidor/servidor.js',
  title:'Enviar: o passo 5',
  explain:'Uma requisição por token, todas ao mesmo tempo com <code>Promise.all</code>. A resposta do Expo é um <b>ticket</b>: <code>status: "ok"</code> quer dizer "aceitei e vou repassar ao FCM/APNs"; <code>DeviceNotRegistered</code> quer dizer "esse endereço não existe mais".',
  code:
`async function enviarPara(token, titulo, corpo) {
  const aparelho = tokens.get(token);
  const resposta = await fetch(EXPO_PUSH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      to: token,
      title: titulo,
      body: corpo,
      sound: 'default',
      data: { enviadaEm: new Date().toISOString() },
    }),
  });
  const json = await resposta.json();
  const ticket = json.data || { status: 'error', message: JSON.stringify(json.errors) };

  if (ticket.details && ticket.details.error === 'DeviceNotRegistered') {
    console.log(\`- token inválido removido: \${aparelho}\`);
    tokens.delete(token);
  }
  return { aparelho, ...ticket };
}

function enviarParaTodos(titulo, corpo) {
  return Promise.all([...tokens.keys()].map((token) => enviarPara(token, titulo, corpo)));
}

`
},
{
  part:'Servidor da turma', op:'code', file:'servidor/servidor.js',
  title:'As quatro rotas',
  explain:'Um <code>if</code> por rota, olhando método e caminho. É o que o Express faria por baixo com <code>app.get</code>/<code>app.post</code>. O <code>try/catch</code> em volta transforma qualquer falha em resposta 500, em vez de derrubar o servidor.',
  code:
`const servidor = http.createServer(async (req, res) => {
  try {
    if (req.method === 'GET' && req.url === '/') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(fs.readFileSync(path.join(__dirname, 'painel.html')));
    } else if (req.method === 'GET' && req.url === '/tokens') {
      responder(res, 200, [...tokens].map(([token, aparelho]) => ({ token, aparelho })));
    } else if (req.method === 'POST' && req.url === '/tokens') {
      const ok = cadastrarToken(await lerJson(req));
      responder(res, ok ? 201 : 400, { ok });
    } else if (req.method === 'POST' && req.url === '/enviar') {
      const { titulo, corpo } = await lerJson(req);
      responder(res, 200, await enviarParaTodos(titulo, corpo));
    } else {
      responder(res, 404, { erro: 'rota não encontrada' });
    }
  } catch (erro) {
    responder(res, 500, { erro: erro.message });
  }
});

`
},
{
  part:'Servidor da turma', op:'code', file:'servidor/servidor.js',
  title:'Ligar o servidor e mostrar o endereço',
  explain:'<code>localhost</code> só funciona no próprio computador. O celular precisa do <b>IP na rede</b>, e o servidor procura e imprime esse endereço sozinho, para o professor escrever no quadro.',
  code:
`servidor.on('error', (erro) => {
  console.log(\`Não deu para abrir a porta \${PORTA} (\${erro.code}). Escolha outra na variável PORTA.\`);
});

servidor.listen(PORTA, () => {
  console.log(\`Painel: http://localhost:\${PORTA}\`);
  Object.values(os.networkInterfaces()).flat().forEach((rede) => {
    if (rede.family === 'IPv4' && !rede.internal) {
      console.log(\`No celular, use: http://\${rede.address}:\${PORTA}\`);
    }
  });
});
`
},

/* ----------------------------------------------------------------------
   PARTE 7: O app cadastra o token
   ---------------------------------------------------------------------- */
{
  part:'App cadastra o token', op:'challenge', time:'7 min',
  title:'O app entrega o token ao servidor',
  md:
`Falta o passo 3 do lado do app.

Crie \`src/notificacoes/api.ts\` com \`cadastrarToken(urlServidor: string, token: string)\`:

1. Um \`fetch\` para o endereço do servidor + \`/tokens\`, com \`method: 'POST'\` e o header \`'Content-Type': 'application/json'\`.
2. No \`body\`, um \`JSON.stringify\` com o \`token\` e um nome para o aparelho: \`Device.modelName\` mais o \`Platform.OS\`.
3. Se \`!resposta.ok\`, lance um erro com o \`resposta.status\`.

Depois, na \`NotificacoesScreen\`:

- Um estado \`urlServidor\` (comece com o endereço que o servidor imprimiu) e um \`TextInput\` para editá-lo.
- Um \`handleCadastrar\` com \`try/catch\`, e um botão **Cadastrar token no servidor**.

> \`resposta.ok\` é \`true\` para os códigos 200 a 299. O \`fetch\` **não** lança erro quando o servidor responde 400 ou 500, só quando nem consegue chegar nele, por isso a conferência manual.`
},
{
  part:'App cadastra o token', op:'file', target:'src/notificacoes/api.ts',
  title:'Criar src/notificacoes/api.ts',
  explain:'Conversar com o servidor também fica fora da tela, ao lado do <code>registrar.ts</code>.'
},
{
  part:'App cadastra o token', op:'code', file:'src/notificacoes/api.ts',
  title:'POST /tokens',
  explain:'O nome do aparelho (<code>"iPhone 13 (ios)"</code>) é só para o painel ficar legível: quem identifica de verdade o destino é o token. Num app real, aqui iria também o id do <b>usuário logado</b>, para o servidor saber de quem é cada aparelho.',
  code:
`import { Platform } from 'react-native';
import * as Device from 'expo-device';

export async function cadastrarToken(urlServidor: string, token: string) {
  const resposta = await fetch(\`\${urlServidor}/tokens\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token: token,
      aparelho: \`\${Device.modelName} (\${Platform.OS})\`,
    }),
  });
  if (!resposta.ok) {
    throw new Error(\`O servidor respondeu \${resposta.status}.\`);
  }
}
`
},
{
  part:'App cadastra o token', op:'replace', file:'src/screens/NotificacoesScreen.tsx',
  title:'TextInput entra nos imports',
  explain:'Para o campo do endereço do servidor.',
  find:
`import { Text, TouchableOpacity, StyleSheet, Alert, Share, ScrollView } from 'react-native';
`,
  code:
`import { Text, TextInput, TouchableOpacity, StyleSheet, Alert, Share, ScrollView } from 'react-native';
`
},
{
  part:'App cadastra o token', op:'insert', file:'src/screens/NotificacoesScreen.tsx',
  after:`import { registrarParaPush } from '../notificacoes/registrar';`,
  title:'E a função nova',
  explain:'Mesma pasta do <code>registrarParaPush</code>.',
  code:
`import { cadastrarToken } from '../notificacoes/api';
`
},
{
  part:'App cadastra o token', op:'insert', file:'src/screens/NotificacoesScreen.tsx',
  after:`  const [erro, setErro] = useState('');`,
  title:'O endereço do servidor vira estado',
  explain:'Troque pelo endereço que o terminal do servidor mostrou ("No celular, use: ..."). Como é estado ligado a um <code>TextInput</code>, dá para corrigir na hora, pelo próprio celular.',
  code:
`  const [urlServidor, setUrlServidor] = useState('http://192.168.0.10:3000');
`
},
{
  part:'App cadastra o token', op:'insert', file:'src/screens/NotificacoesScreen.tsx',
  before:`  async function handleNotificacaoLocal() {`,
  title:'handleCadastrar',
  explain:'Se o servidor estiver fora do ar ou em outra rede, o <code>fetch</code> lança erro e o <code>catch</code> mostra a mensagem. Se o formato do token for rejeitado, é o <code>throw</code> do <code>api.ts</code> que aparece.',
  code:
`  async function handleCadastrar() {
    try {
      await cadastrarToken(urlServidor, token);
      Alert.alert('Pronto!', 'Token cadastrado no servidor da turma.');
    } catch (e) {
      Alert.alert('Erro', (e as Error).message);
    }
  }

`
},
{
  part:'App cadastra o token', op:'insert', file:'src/screens/NotificacoesScreen.tsx',
  before:`      <TouchableOpacity onPress={handleNotificacaoLocal}`,
  title:'O campo e o botão',
  explain:'<code>keyboardType="url"</code> abre o teclado com <code>/</code> e <code>.</code> à mão; <code>autoCapitalize="none"</code> evita o "Http://" com maiúscula.',
  code:
`      <Text style={styles.rotulo}>Servidor da turma</Text>
      <TextInput
        style={styles.input}
        value={urlServidor}
        onChangeText={setUrlServidor}
        autoCapitalize="none"
        keyboardType="url"
      />

      <TouchableOpacity onPress={handleCadastrar} style={styles.botao}>
        <Text style={styles.botaoTexto}>Cadastrar token no servidor</Text>
      </TouchableOpacity>

`
},
{
  part:'App cadastra o token', op:'insert', file:'src/screens/NotificacoesScreen.tsx',
  after:`  erro: { color: '#d33', backgroundColor: '#fdecec', borderRadius: 8, padding: 12 },`,
  title:'Estilo do campo',
  explain:'O mesmo campo com borda das telas de login e cadastro, sem a margem de baixo: quem dá o respiro é o botão logo depois.',
  code:
`  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12 },
`
},

/* ----------------------------------------------------------------------
   PARTE 8: Teste em sala
   ---------------------------------------------------------------------- */
{
  part:'Teste em sala', op:'note',
  title:'Hora de tocar todos os celulares',
  md:
`O professor roda \`node servidor/servidor.js\` e abre o painel no navegador. Cada aluno:

1. Confere o endereço no campo **Servidor da turma** e toca em **Cadastrar token no servidor**. O aparelho aparece no painel.
2. **App aberto:** o professor envia. O aviso aparece no topo (é o \`setNotificationHandler\`) e "Última recebida com o app aberto" muda.
3. **Segundo plano:** aperte o botão de início do celular. O professor envia de novo. O aviso chega na bandeja.
4. **App encerrado:** abra a lista de apps recentes e **arraste o app para fora**. O professor envia. O aviso chega mesmo assim, porque quem entregou foi o FCM/APNs.
5. **Toque no aviso:** o app abre do zero e "Última tocada na bandeja" mostra o título, graças ao \`useLastNotificationResponse\`.

Para fechar: desinstale o app e peça um envio. No terminal do servidor aparece \`- token inválido removido\`: o token morreu junto com o app.

> Não chegou nada? Confira no painel a **resposta do serviço de push**. \`status: "ok"\` quer dizer que o Expo aceitou, e aí o problema está no aparelho (permissão, modo não perturbe, economia de bateria). \`status: "error"\` traz o motivo escrito.`
},
{
  part:'Teste em sala', op:'note',
  title:'Mandando push sem o painel',
  md:
`O painel é só uma casca: por baixo, tudo é HTTP. O mesmo envio pelo terminal, direto na API do Expo, sem o servidor da turma:

\`\`\`bash
curl -X POST https://exp.host/--/api/v2/push/send \\
  -H "Content-Type: application/json" \\
  -d '{"to":"ExponentPushToken[...]","title":"Oi","body":"Pelo terminal"}'
\`\`\`

Ou pelo servidor da turma, que repassa para todos:

\`\`\`bash
curl -X POST http://localhost:3000/enviar \\
  -H "Content-Type: application/json" \\
  -d '{"titulo":"Oi","corpo":"Para a sala inteira"}'
\`\`\`

E a ferramenta web \`expo.dev/notifications\` faz o mesmo com um formulário.

> Repare que o primeiro comando **não** precisa de senha nenhuma: a API do Expo aceita qualquer token. É por isso que, num app real, o projeto Expo é configurado para exigir um **access token** no envio, guardado no servidor, e o token do aparelho é tratado como dado pessoal.`
},

/* ----------------------------------------------------------------------
   PARTE 9: Fechamento
   ---------------------------------------------------------------------- */
{
  part:'Fechamento', op:'note',
  title:'Revisão: como isso cai na prova',
  md:
`**1.** Um usuário fechou o app pela lista de apps recentes e, minutos depois, recebeu uma notificação dele. Isso é possível porque:

- **a)** o app mantém um processo escondido conectado ao servidor da empresa.
- **b)** o servidor da empresa envia a mensagem diretamente para o IP do aparelho.
- **c)** a entrega é feita pelo serviço de notificação do sistema operacional (FCM/APNs), que mantém a conexão com o aparelho e identifica o destino pelo token.
- **d)** toda notificação é agendada localmente no momento da instalação.

**2.** Por que o app envia o seu token de push para o servidor da aplicação?

- **a)** Porque o token substitui a senha do usuário no login.
- **b)** Porque é o servidor que decide quando e para quem avisar, e o serviço de notificação só sabe entregar a um aparelho identificado pelo token.
- **c)** Porque sem isso o sistema operacional bloqueia notificações locais.
- **d)** Porque o token é fixo e precisa ser gravado uma única vez, na instalação.

> **Gabarito:** 1-c e 2-b. Na 1, nenhum processo do app precisa estar vivo, e o IP do celular nem é conhecido. Na 2, o token não é credencial de login e **muda** (reinstalação, restauração), por isso o app o reenvia sempre que abre.`
},
{
  part:'Fechamento', op:'outro',
  title:'Push de ponta a ponta',
  md:
`A turma viu uma notificação sair de um servidor, passar pelo Expo, pelo FCM ou APNs, e chegar num celular com o app encerrado, e escreveu os dois lados: o app que consegue e registra o token, e o servidor que guarda e envia.

## Conceitos de hoje
Notificação local x push, o serviço de notificação do sistema operacional (FCM/APNs) e por que a entrega independe do app estar rodando, o **token** como endereço único de app + aparelho, o **registro do token no servidor**, permissão e canal no Android, os três estados do app (\`setNotificationHandler\`, \`addNotificationReceivedListener\`, \`useLastNotificationResponse\`), \`useEffect\` com limpeza, \`throw\`/\`try/catch\` e o encadeamento opcional \`?.\`.

## Desafios pra casa
1. **Abrir uma tela pelo toque:** mande no \`data\` da push um campo \`tela\` e, ao tocar, mostre esse valor (gancho para navegar até a tela certa com React Navigation).
2. **Enviar para um aparelho só:** uma rota \`POST /enviar/um\` no servidor que recebe o token no corpo.
3. **Notificação diária:** troque o \`trigger\` da local por um horário fixo (pesquise \`SchedulableTriggerInputTypes.DAILY\`).
4. **Cadastro automático:** faça o app cadastrar o token sozinho assim que ele chegar, sem botão.
5. **(avançado)** Leia sobre **receipts** na documentação do Expo: o ticket diz que o Expo aceitou, o receipt diz se o FCM/APNs entregou.

> Entrega: um print do celular com a notificação que **você** mandou pelo \`curl\` ou pelo \`expo.dev/notifications\`, com o app encerrado.`
},
];

/* As dependências acendem na barra lateral a partir do slide de instalação. */
const DEP_STEP = STEPS.findIndex(s => s.part === 'Instalando');

global.AULA_NOTIFICACOES_PUSH = {
  meta: {
    titulo:    'Notificações push (React Native)',
    projeto:   'notificacoes-push',
    subtitulo: 'expo-notifications · token · FCM/APNs',
    vazio:     'Projeto Expo novo.<br>Só a configuração e o painel do servidor estão prontos.',
  },
  inicial: { entries: INITIAL_ENTRIES, files: INITIAL_FILES },
  deps:    { titulo: 'Dependências novas', desde: DEP_STEP, lista: DEPS },
  steps:   STEPS,
};

})(window);
