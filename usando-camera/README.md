# Usando a câmera do celular

App React Native que usa a câmera do aparelho com a biblioteca
**expo-camera**, aprendida em **sete exemplos pequenos** (de 5 a 20 linhas
cada), do mais fácil ao mais difícil, e um desafio final que junta tudo
num app de câmera completo.

Aula independente: o projeto começa vazio.

## Instalar

```bash
npm install
```

A dependência nova foi escolhida pelo Expo, com
`npx expo install expo-camera`, que pega a versão compatível com o SDK do
projeto.

## Executar

```bash
npx expo start
```

Escaneie o QR code com o app **Expo Go**. Teste no **celular de verdade**:
o emulador normalmente não tem câmera.

> Também funciona no [Expo Snack](https://snack.expo.dev/): basta colar os
> arquivos, o `import` de `expo-camera` já resolve a dependência.

## Estrutura

```
App.tsx                         pede a permissão uma vez e mostra o exemplo escolhido
src/
  exemplos/
    Exemplo1Camera.tsx          só a câmera na tela (flex: 1)
    Exemplo2Frontal.tsx         câmera da frente (prop facing)
    Exemplo3Quadrado.tsx        câmera 300x300 com um título (layout)
    Exemplo4Lanterna.tsx        lanterna liga/desliga (estado + enableTorch)
    Exemplo5Virar.tsx           botão de virar a câmera (estado + facing)
    Exemplo6QrCode.tsx          leitor de QR code (onBarcodeScanned)
    Exemplo7Foto.tsx            tirar foto e mostrar miniatura (useRef)
  screens/
    CameraScreen.tsx            desafio final: app completo (virar, foto em tela cheia)
```

Para trocar de exemplo, mude só a linha `import Exemplo from '...'` do
`App.tsx`.

## Aula interativa

Abra [`aula/index.html`](aula/index.html) no navegador. Cada exemplo segue
o mesmo ciclo:

1. **Teoria**: slide curto com a peça nova (e uma pergunta para a turma).
2. **Sua vez** (cartão roxo): os alunos criam o exemplo sozinhos, com dicas.
3. **Solução** digitada na apresentação, para comparar.
4. **Teste** no celular.

No fim há um desafio que junta os exemplos 5 e 7 na `CameraScreen` e uma
**atividade de pesquisa em grupo**: cada grupo escolhe um tema (como a
câmera forma a foto, permissões e LGPD, QR code, `useState` x `useRef`,
`async`/`await`, `expo-media-library`, `expo-image-picker`) e traz a
teoria para a turma na aula seguinte, com explicação de 5 minutos, um
exemplo curto no Snack e uma pergunta.

- [`aula/aulas/usando-camera.js`](aula/aulas/usando-camera.js), o conteúdo
  da aula.
- [`shared/player/`](../shared/player/), o motor da apresentação,
  compartilhado com as outras aulas.

### Mantendo a aula sincronizada com o código

```bash
npm run check-aula
```

Reconstrói o `App.tsx`, os sete exemplos e a `CameraScreen.tsx` a partir das etapas da aula e
compara com os arquivos reais, além de conferir as dependências.
