# Brief: Notificações push

## Por que essa aula existe
Notificação push é o recurso mais "mobile" que o curso ainda não tocou, e
dois pontos dela são conteúdo de prova:

1. **Entrega com o app encerrado e o token do aparelho:** a notificação
   chega mesmo com o app fechado porque quem entrega é o serviço de
   notificação do sistema operacional, e o destino é identificado por um
   token único de app + aparelho.
2. **Registro do token no servidor e o papel do serviço do sistema:** o app
   envia o token ao servidor da aplicação, que decide quando e para quem
   avisar; o FCM (Android) e o APNs (iOS) só fazem a entrega.

A aula existe para que esses dois pontos não fiquem decorados: a turma vê o
token no próprio celular, cadastra num servidor e recebe uma push com o app
encerrado.

## Formato: teoria primeiro, depois um mini app
Seis slides de teoria seguidos (Parte 2), antes de qualquer código. Depois
a turma escreve um **mini app autocontido**, que não continua o app de
tarefas: uma tela só, feita para testar. O escopo pequeno é proposital, a
dificuldade da aula está no ambiente (aparelho físico, permissão, projeto
Expo), não no código.

Além do app, a turma escreve um **servidor Node puro** (sem Express, sem
dependências), para que o "seu servidor" do diagrama seja algo concreto, com
um `POST /tokens` de verdade. O painel web do servidor já vem pronto: HTML
não é assunto da aula.

Mantido das aulas anteriores: a apresentação **para em três desafios**, e
quando um arquivo já existe ele é ajustado ponto a ponto (`insert`), não
redigitado.

## Ponto de partida
Um projeto Expo novo. Só o `app.json` (com o plugin `expo-notifications`) e
o `servidor/painel.html` já estão na árvore.

## Os conceitos novos
1. **Local x push:** quem cria a notificação, o app ou um servidor.
2. **Serviço de notificação do sistema operacional** (FCM, APNs): uma
   conexão mantida pelo sistema para todos os apps; por isso a entrega
   independe do app estar rodando.
3. **Token:** endereço único de app + aparelho, que muda (reinstalação,
   restauração) e só existe após a permissão. O Expo Push Token embrulha o
   token nativo.
4. **Registro do token no servidor** e o envio sempre a partir do servidor,
   onde ficam as credenciais.
5. **Os três estados do app:** `setNotificationHandler` (primeiro plano),
   `addNotificationReceivedListener`, `useLastNotificationResponse` (toque,
   inclusive com o app encerrado).
6. **Permissão e canal Android.**
7. Como ferramentas: `useEffect` com limpeza, `throw` + `try/catch`,
   encadeamento opcional `?.`, `fetch` com `POST`, e um servidor `http` do
   Node.

## Progressão da aula
| Parte | Entrega | Formato |
|---|---|---|
| 1. Abertura | O que é o mini app | Slides |
| 2. Teoria | Local x push, FCM/APNs, token, caminho completo, estados, requisitos | **6 slides** |
| 3. Instalando | `npx expo install` + `eas init` | Slide |
| 4. Registrar o aparelho | `registrar.ts` | **Desafio** |
| 5. A tela | `App.tsx` + `NotificacoesScreen` | **Desafio** |
| 6. Servidor da turma | `servidor/servidor.js` | Código guiado |
| 7. App cadastra o token | `api.ts` + campo e botão na tela | **Desafio** |
| 8. Teste em sala | Aberto, segundo plano, encerrado, toque, desinstalação | Slides |
| 9. Fechamento | Revisão estilo prova + 5 desafios pra casa | Slides |

**48 etapas, 3 desafios ao vivo** (~23 min só de desafio).

## O que a aula deliberadamente não faz
- **Não usa banco nem login.** Os tokens ficam num `Map`; o slide diz que
  num sistema real seria uma tabela ligada ao usuário.
- **Não navega pelo toque.** Abrir uma tela específica a partir do `data`
  da notificação fica de desafio de casa.
- **Não configura FCM/APNs com a turma.** O professor prepara o APK Android
  antes da aula; credenciais de envio são mencionadas, não configuradas.
- **Não trata receipts** (a confirmação de entrega do FCM/APNs), só tickets.
  Fica como desafio avançado.

## Linguagem / Bibliotecas
- **TypeScript** no app, **JavaScript (CommonJS)** no servidor.
- **Três dependências novas:** `expo-notifications`, `expo-device`,
  `expo-constants`.

## Compatibilidade com Expo Snack
**Não compatível**, e o slide de instalação diz isso: push exige app
instalado, permissão do sistema e um projeto Expo com `projectId`.

## Desafios pra casa
1. Abrir uma "tela" a partir do `data` da notificação tocada.
2. Rota `POST /enviar/um` para mandar a um aparelho só.
3. Notificação local diária (`SchedulableTriggerInputTypes.DAILY`).
4. Cadastro automático do token, sem botão.
5. (avançado) Receipts da API do Expo.

---
**Escopo confirmado.** Este documento descreve o resultado final; o roteiro
de apresentação está em [`AULA-ROTEIRO.md`](AULA-ROTEIRO.md).
