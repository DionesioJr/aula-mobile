# Roteiro: Notificações push

Documento de apoio do professor para a apresentação interativa
[`aula/index.html`](aula/index.html).

---

## 1. Onde essa aula entra

As aulas 1 a 5 construíram um app de tarefas, tela por tela. Esta aula sai
dessa trilha de propósito: push depende de ambiente (aparelho físico,
permissão, projeto Expo, um servidor), e misturar isso com o CRUD esconderia
o conceito atrás de código que a turma já conhece. Então a aula usa um
**mini app de uma tela**, feito só para testar.

| | Aula 5 | Aula 6 |
|---|---|---|
| Ponto de partida | Código da aula 4 | **Projeto novo** (só `app.json` e o painel) |
| Escopo | CRUD em memória | Receber push com o app encerrado |
| Conceito central | Lista como estado | **Token** e **serviço de notificação do SO** |
| Código fora do app | Nenhum | **Servidor Node** (`servidor/servidor.js`) |
| Bibliotecas | Nenhuma nova | `expo-notifications`, `expo-device`, `expo-constants` |

Os dois pontos de prova que a aula precisa deixar firmes:

1. **A notificação chega com o app encerrado** porque quem entrega é o
   serviço de notificação do sistema operacional (FCM/APNs), e o destino é
   identificado por um **token único** do app no aparelho.
2. **O app registra o token no servidor da aplicação**, porque o servidor
   decide quando e para quem avisar; o FCM/APNs só entrega.

Os dois aparecem na teoria (Parte 2), no código (Partes 4, 6 e 7), no teste
em sala (Parte 8) e na revisão estilo prova (Parte 9).

---

## 2. Preparação (antes do dia da aula)

Push é a aula que mais depende de preparo. Faça uma vez, com antecedência.

### 2.1 Projeto Expo
```bash
cd notificacoes-push
npm install
npx eas-cli init          # login na conta Expo, grava o projectId no app.json
```

### 2.2 APK para quem tem Android
Desde o SDK 53 o **Expo Go no Android não recebe push remota**. A saída é um
APK deste mesmo app, gerado uma vez e instalado pelos alunos.

1. No [console do Firebase](https://console.firebase.google.com), crie um
   projeto e adicione um app Android com o pacote
   `com.aulasmobile.notificacoespush` (o mesmo do `app.json`).
2. Baixe o `google-services.json` para a raiz do projeto e acrescente no
   `app.json`, dentro de `"android"`:
   `"googleServicesFile": "./google-services.json"`.
3. Ainda no Firebase: Configurações do projeto → Contas de serviço → **Gerar
   nova chave privada**. Isso baixa um JSON com a credencial de envio.
4. `npx eas-cli credentials` → Android → Google Service Account → **Push
   Notifications (FCM V1)** → envie o JSON do passo 3.
5. `npx eas-cli build -p android --profile preview`. No fim, o EAS mostra
   um link e um QR code do APK: é isso que vai para o quadro.

> A chave do passo 3 é **segredo**: ela permite mandar push em nome do
> projeto. Não commite, não mande no grupo. O EAS guarda uma cópia.
> (Ótimo exemplo vivo do slide "o envio sai do servidor, nunca do app".)

### 2.3 Rede
O celular precisa alcançar o servidor. Duas situações atrapalham:

- **Wi-Fi da faculdade com isolamento de clientes:** um aparelho não
  enxerga o outro, e o `http://<ip>:3000` não responde.
- **APK de release:** o Android bloqueia `http://` sem criptografia em
  builds de release; só `https://` passa.

A saída para as duas é um **túnel HTTPS** para o servidor, por exemplo:
```bash
npx cloudflared tunnel --url http://localhost:3000
```
O comando imprime um endereço `https://...trycloudflare.com`; é ele que vai
no campo **Servidor da turma** do app. (Ngrok ou outro túnel servem igual.)

Se a rede for doméstica ou um roteador próprio, e todos usarem Expo Go no
iPhone, o `http://<ip>:3000` impresso pelo servidor basta.

### 2.4 Checklist do dia
- [ ] `npm run servidor` funcionando e o painel abrindo no navegador.
- [ ] Túnel no ar (se for usar) e o endereço escrito no quadro.
- [ ] Link/QR do APK no quadro.
- [ ] Um celular seu já testado do começo ao fim, com o app encerrado.
- [ ] Plano B aberto numa aba: [expo.dev/notifications](https://expo.dev/notifications).

---

## 3. Como usar a apresentação

Abra `aula/index.html` no navegador (duplo clique), tela cheia (`F11`).
Mesmos atalhos das outras aulas: `→`/`Espaço`/`Enter` avança, `←` volta,
`↑`/`↓` mudam a velocidade da digitação, clique na barra de progresso pula
para um ponto. `C` recolhe o cabeçalho e `R` esconde o rodapé.

As três dependências acendem na barra lateral no slide de instalação.

### Os cartões de desafio

Quando aparecer um cartão **roxo** com "Desafio":

1. **Pare de apertar seta.** Leia o enunciado em voz alta.
2. Dê o tempo do selo (7–8 min) para a turma tentar no próprio projeto.
3. Circule, veja quem travou, aponte a dica do rodapé do cartão.
4. Só depois avance: as etapas seguintes digitam a solução oficial, e a
   turma **compara** com o que fez.

---

## 4. Estrutura da aula, 48 etapas em 9 partes

| # | Parte | Etapas | O que entrega |
|---|---|---|---|
| 1 | Abertura | 1–2 | O que é o mini app e o que precisa |
| 2 | Teoria | 3–8 | Local x push, FCM/APNs, token, caminho completo, estados, requisitos |
| 3 | Instalando | 9 | `npx expo install` + `npx eas-cli init` |
| 4 | Registrar o aparelho | 10–15 | `registrar.ts`, **desafio** |
| 5 | A tela | 16–27 | `App.tsx` + `NotificacoesScreen`, **desafio**, primeiro teste |
| 6 | Servidor da turma | 28–35 | `servidor/servidor.js` (guiado) |
| 7 | App cadastra o token | 36–44 | `api.ts` + campo e botão, **desafio** |
| 8 | Teste em sala | 45–46 | Os cinco cenários + `curl` |
| 9 | Fechamento | 47–48 | Revisão estilo prova + desafios pra casa |

**3 desafios ao vivo**, ~23 min só de desafio. Duração sugerida:
**90–100 min**, contando o tempo de instalação e de teste nos celulares.

### Se o tempo apertar
A aula fica completa no fim da **Parte 5** se você usar o plano B: cada um
compartilha o token e você envia por `expo.dev/notifications`. Os dois
conceitos de prova continuam visíveis (token na tela, entrega com o app
encerrado). As Partes 6 e 7 viram demonstração rápida sua: rode o servidor
pronto, cadastre só o seu celular e mostre o `POST /tokens` chegando no
terminal.

**Não corte a teoria (Parte 2).** É ela que transforma "o celular apitou"
em resposta de prova.

---

## 5. O que cada parte ensina

### Parte 2: Teoria
Seis slides seguidos, sem código do projeto. Vale desenhar no quadro o
diagrama do slide "O caminho completo", com as duas viagens.

> **Fale sobre:** por que o servidor não fala direto com o celular. Peça
> para a turma pensar: qual é o IP do seu celular agora? E daqui a dez
> minutos, no 4G? E quem deixaria qualquer servidor abrir conexão com o
> celular? É daí que nasce a necessidade de um intermediário.

> **Fale sobre:** por que uma conexão só, do sistema, e não uma por app.
> Bateria. Se cada app mantivesse a própria conexão aberta, o celular não
> passaria da hora do almoço, e o sistema operacional mata app em segundo
> plano justamente para economizar. Por isso o app **não precisa** estar
> rodando: quem escuta é o sistema.

> **Fale sobre:** o token muda. Pergunta de prova comum: "o token é fixo e
> pode ser gravado uma vez". Não é: reinstalação, limpeza de dados e
> restauração geram outro. Por isso o app pede e reenvia o token sempre que
> abre, e o servidor apaga os que morrem (`DeviceNotRegistered`).

> **Fale sobre:** o envio sai do servidor. É a mesma lógica da questão de
> chaves de API: credencial dentro do app distribuído é credencial
> pública.

### Parte 4: Registrar o aparelho
Primeira função que **lança erro** de propósito (`throw`) para quem chamou
tratar. Cada `if` corresponde a um motivo real de não haver token: emulador,
permissão negada, projeto sem `projectId`.

> **Fale sobre:** o canal do Android antes da permissão. No Android 13+, sem
> um canal criado, a pergunta de permissão nem aparece.

> **Fale sobre:** perguntar uma vez só. Se o usuário recusar, o sistema não
> deixa o app perguntar de novo; só as configurações do aparelho resolvem.
> Por isso apps bons explicam **antes** por que querem mandar notificação.

### Parte 5: A tela
`useEffect(..., [])` é o ponto de conceito: roda uma vez depois da primeira
renderização, e a função devolvida limpa o listener quando a tela sai.

> **Fale sobre:** `ultimaTocada` não é `useState`. É um hook da biblioteca,
> e é ele que resolve o caso "app encerrado, usuário tocou na notificação":
> o app abre do zero e o hook já devolve a notificação que causou a abertura.

O slide "Primeiro teste" é a primeira parada com celular na mão. Espere
todo mundo ver o token (ou entender a mensagem vermelha) antes de seguir.

### Parte 6: Servidor da turma
Código guiado, sem desafio: o foco é reconhecer as duas rotas que importam,
`POST /tokens` (passo 3 do diagrama) e `POST /enviar` (passo 5).

> **Fale sobre:** o `Map` como "banco". Num sistema real, o token iria numa
> tabela junto com o id do usuário logado, porque o servidor quer avisar
> **a Maria**, não "o aparelho tal". Um usuário pode ter vários aparelhos.

> **Fale sobre:** ticket não é entrega. `status: "ok"` quer dizer que o
> Expo aceitou e vai repassar; se chegou mesmo no aparelho, só o receipt
> diz (desafio avançado de casa).

### Parte 7: App cadastra o token
Fecha o passo 3 do lado do app. `fetch` com `POST` e `resposta.ok`.

> **Fale sobre:** o `fetch` não lança erro para 400 ou 500, só quando nem
> chega no servidor. Por isso o `if (!resposta.ok) throw`.

### Parte 8: Teste em sala
O momento da aula. Siga a ordem do slide: aberto, segundo plano,
**encerrado**, toque, desinstalação. No encerrado, confira que todo mundo
realmente arrastou o app para fora dos recentes antes de você clicar em
Enviar.

---

## 6. Problemas comuns na hora da aula

**"Aparece 'Push só funciona em aparelho físico'."**
Está no emulador/simulador. Notificação local ainda funciona; para push,
celular.

**"No Android, o token não aparece / dá erro no Expo Go."**
Esperado desde o SDK 53: instale o APK da turma. Enquanto isso, a
notificação local funciona no Expo Go.

**"'projectId não encontrado'."**
Falta `npx eas-cli init` no projeto do aluno. Quem usa o APK da turma não
passa por isso, o `projectId` já está embutido.

**"Cadastrar dá erro de rede."**
O celular não alcança o servidor: rede diferente, isolamento de clientes,
ou `http://` num APK de release. Use o endereço do túnel HTTPS.

**"O servidor diz que enviou (`ok`), mas não chegou."**
Do lado do aparelho: permissão desligada, modo Não perturbe, economia de
bateria agressiva (comum em Xiaomi, Samsung e Motorola, que fecham apps e
atrasam notificações). Peça para conferir as configurações de notificação
do app.

**"Mudou o token depois que eu reinstalei."**
Exatamente: é o slide do token na prática. Cadastre de novo.

**"Tokens de iPhone (Expo Go) e de Android (APK) no mesmo servidor
funcionam?"**
Sim. Eles pertencem a projetos Expo diferentes (o do aluno e o da turma), e
a API do Expo não aceita misturar projetos numa mesma requisição; por isso o
servidor envia **uma requisição por token**.

---

## 7. Estrutura final do projeto

```
App.tsx                         setNotificationHandler + a única tela
app.json                        plugin expo-notifications (+ projectId)
eas.json                        perfil preview (APK)
src/
  notificacoes/
    registrar.ts                permissão, canal, token
    api.ts                      POST /tokens
  screens/
    NotificacoesScreen.tsx      token, cadastro, local, listeners
servidor/
  servidor.js                   Map de tokens, POST /tokens, POST /enviar
  painel.html                   já vinha pronto
```

---

## 8. Conceitos cobertos

| Conceito | Onde aparece |
|---|---|
| Local x push | Parte 2, Parte 5 (botão de teste local) |
| FCM / APNs e entrega com o app encerrado | Parte 2, Parte 8 |
| Token único de app + aparelho, e por que muda | Parte 2, Parte 4, Parte 8 |
| Registro do token no servidor | Parte 2, Partes 6 e 7 |
| Permissão e canal Android | Parte 4 |
| `setNotificationHandler`, listeners, `useLastNotificationResponse` | Parte 5 |
| `useEffect` com `[]` e limpeza | Parte 5 |
| `throw`, `try/catch`, `?.` | Partes 4, 5 e 7 |
| Servidor `http` do Node e a API de push do Expo | Parte 6 |

---

## 9. Manutenção da apresentação

Todo o conteúdo está em
[`aula/aulas/notificacoes-push.js`](aula/aulas/notificacoes-push.js), no
formato do [`_template.js`](aula/aulas/_template.js); referência do formato
em [`shared/player/README.md`](../shared/player/README.md).

Depois de mudar qualquer arquivo do app ou do servidor, rode:

```bash
npm run check-aula
```
