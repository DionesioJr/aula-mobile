import React, { useState } from 'react';
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
