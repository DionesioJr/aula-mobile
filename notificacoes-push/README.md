# Notificações push

Mini app React Native (Expo) para testar notificações push no próprio
celular, mais um servidor Node pequeno que guarda os tokens da turma e manda
uma push para todos os aparelhos de uma vez.

Diferente das aulas anteriores, esta **não continua o app de tarefas**: é um
projeto autocontido, feito só para ver uma notificação sair de um servidor e
chegar no celular com o app encerrado.

## O que o app faz

Uma tela só ([`src/screens/NotificacoesScreen.tsx`](src/screens/NotificacoesScreen.tsx)):

- pede permissão e mostra o **Expo Push Token** do aparelho, com botão para
  compartilhá-lo;
- cadastra o token no **servidor da turma** (`POST /tokens`);
- agenda uma **notificação local** para daqui a 5 segundos, para comparar;
- mostra a última notificação recebida com o app aberto e a última tocada
  na bandeja (inclusive a que abriu o app encerrado).

## Instalar

```bash
npm install
npx eas-cli init
```

O `eas-cli init` cria o projeto na sua conta Expo (gratuita) e grava o
`extra.eas.projectId` no `app.json`. Sem ele não existe token.

As três dependências novas foram escolhidas com `npx expo install
expo-notifications expo-device expo-constants`, que pega as versões
compatíveis com o SDK do projeto.

## Executar

Em um terminal, o servidor da turma:

```bash
npm run servidor          # ou: node servidor/servidor.js
```

Ele imprime o endereço do painel (`http://localhost:3000`) e o endereço que
os celulares devem usar (`http://<ip-do-computador>:3000`). A porta muda com a
variável `PORTA`.

Em outro terminal, o app:

```bash
npx expo start
```

### Onde a push funciona

| Aparelho | Notificação local | Push remota |
|---|---|---|
| iPhone com Expo Go | sim | sim |
| Android com Expo Go | sim | **não** (removido do Expo Go no SDK 53) |
| Android com o APK da turma (`eas build`) | sim | sim |
| Emulador / simulador | sim | não |

Para Android, o professor gera um APK uma vez antes da aula, o passo a passo
está em [`AULA-ROTEIRO.md`](AULA-ROTEIRO.md), seção "Preparação".

> Plano B que sempre funciona: copie o token do app e cole em
> [expo.dev/notifications](https://expo.dev/notifications).

> **Não roda no Expo Snack**: push precisa de um app instalado de verdade,
> com permissão do sistema e um projeto Expo.

## Estrutura

```
App.tsx                         setNotificationHandler + a única tela
app.json                        plugin expo-notifications (+ projectId do eas init)
eas.json                        perfil "preview" que gera o APK da turma
src/
  notificacoes/
    registrar.ts                permissão, canal Android e o token
    api.ts                      POST /tokens no servidor da turma
  screens/
    NotificacoesScreen.tsx      token, cadastro, notificação local, listeners
servidor/
  servidor.js                   Node puro: guarda tokens e envia pela API do Expo
  painel.html                   painel web do professor (lista + enviar)
```

### Rotas do servidor

| Método | Rota | O que faz |
|---|---|---|
| GET | `/` | painel web |
| GET | `/tokens` | lista os aparelhos cadastrados |
| POST | `/tokens` | `{ token, aparelho }`, cadastra um aparelho |
| POST | `/enviar` | `{ titulo, corpo }`, manda push para todos |

Os tokens ficam num `Map` em memória. Quando a API do Expo responde
`DeviceNotRegistered`, o servidor apaga aquele token.

## Aula interativa

Tudo fica na pasta [`aula/`](aula/). Abra [`aula/index.html`](aula/index.html)
no navegador para a apresentação: seis slides de teoria (local x push,
FCM/APNs, token, o caminho completo, os três estados do app, o que precisa
para testar), depois o código, com três desafios para a turma, e um teste
em sala com todos os celulares.

- [`AULA-ROTEIRO.md`](AULA-ROTEIRO.md), roteiro do professor, incluindo a
  preparação do APK e os problemas comuns.
- [`BRIEF.md`](BRIEF.md), o escopo.
- [`aula/aulas/notificacoes-push.js`](aula/aulas/notificacoes-push.js), o
  conteúdo da aula.

### Mantendo a aula sincronizada com o código

```bash
npm run check-aula
```

Reconstrói cada arquivo a partir das etapas da aula e compara com o código
real, inclusive o `servidor/`. Saída limpa = aula em sincronia.
