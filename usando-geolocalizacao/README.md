# Geolocalização e mapas

App React Native que mostra um mapa com **react-native-maps** e descobre a
posição do celular com **expo-location**, aprendido em **dez exemplos
pequenos** (de 5 a 40 linhas cada), do mais fácil ao mais difícil, e um
desafio final que junta tudo num app "Meus lugares".

Aula independente: o projeto começa vazio. Pensada para o
[Expo Snack](https://snack.expo.dev/), sem instalar nada no computador.

## Usar no Expo Snack

1. Abra [snack.expo.dev](https://snack.expo.dev/) e renomeie `App.js` para
   `App.tsx`.
2. Crie os arquivos com o caminho inteiro (ex.:
   `src/exemplos/Exemplo1Mapa.tsx`), as pastas são criadas junto.
3. Ao escrever o `import` de `react-native-maps` ou `expo-location`, clique
   em **Add dependency** no aviso do Snack.
4. Teste pela aba **My Device**, escaneando o QR code com o **Expo Go**.

A prévia **Web** do Snack não desenha o mapa (`react-native-maps` só
funciona em Android e iOS): use o celular.

## Rodar no computador (opcional)

```bash
npm install
npx expo start
```

As dependências novas foram escolhidas pelo Expo, com
`npx expo install react-native-maps expo-location`, que pega as versões
compatíveis com o SDK do projeto.

## Estrutura

```
App.tsx                           escolhe o exemplo (e, a partir da Parte B, pede a permissão)
src/
  exemplos/
    Exemplo1Mapa.tsx              só o mapa na tela (flex: 1)
    Exemplo2Cidade.tsx            mapa começando numa cidade (initialRegion, deltas)
    Exemplo3Marcador.tsx          um alfinete com título e descrição (Marker)
    Exemplo4VariosMarcadores.tsx  vários alfinetes a partir de uma lista (.map + key)
    Exemplo5Desenhar.tsx          linha e círculo no mapa (Polyline, Circle)
    Exemplo6Satelite.tsx          botão mapa/satélite (estado + mapType)
    Exemplo7OndeEstou.tsx         latitude e longitude em texto (getCurrentPositionAsync)
    Exemplo8BolinhaAzul.tsx       a bolinha azul (showsUserLocation)
    Exemplo9MapaEmMim.tsx         mapa abrindo na posição do celular (useEffect + tela de espera)
    Exemplo10Tocar.tsx            tocar no mapa para marcar (onPress + LatLng)
  screens/
    MeusLugaresScreen.tsx         desafio final: marcar vários lugares, contador, satélite, limpar
```

Para trocar de exemplo, mude só a linha `import Exemplo from '...'` do
`App.tsx`.

## Aula interativa

Abra [`aula/index.html`](aula/index.html) no navegador. A aula tem três
partes:

- **Parte A, o mapa** (exemplos 1 a 6): nada de GPS nem permissão, só
  desenhar o mapa e coisas em cima dele.
- **Parte B, a localização** (exemplos 7 a 9): o `App.tsx` ganha o pedido
  de permissão com `useForegroundPermissions` e o app descobre onde está.
- **Parte C, interação** (exemplo 10): o mapa avisa onde o dedo tocou.

Cada exemplo segue o mesmo ciclo:

1. **Teoria**: slide curto com a peça nova (e uma pergunta para a turma).
2. **Sua vez** (cartão roxo): os alunos criam o exemplo sozinhos, com dicas.
3. **Solução** digitada na apresentação, para comparar.
4. **Teste** no celular.

Antes dos exemplos há uma base teórica curta: o que é geolocalização (GPS,
Wi-Fi, antenas), latitude e longitude, o papel de cada biblioteca e como
usar o Snack. No fim há o desafio "Meus lugares" e uma **atividade de
pesquisa em grupo** (como o GPS funciona, coordenadas, LGPD,
`watchPositionAsync`, geocodificação, fórmula de Haversine, como apps reais
usam a localização).

Os exemplos usam lugares de Brasília (Catedral, Congresso, Torre de TV)
como referência; os desafios pedem para os alunos trocarem pela cidade
deles.

- [`aula/aulas/usando-geolocalizacao.js`](aula/aulas/usando-geolocalizacao.js),
  o conteúdo da aula.
- [`shared/player/`](../shared/player/), o motor da apresentação,
  compartilhado com as outras aulas.

### Mantendo a aula sincronizada com o código

```bash
npm run check-aula
```

Reconstrói o `App.tsx`, os dez exemplos e a `MeusLugaresScreen.tsx` a
partir das etapas da aula e compara com os arquivos reais, além de conferir
as dependências.
