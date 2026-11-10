import React, { useEffect, useState } from 'react';
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

  if (!posicao) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 18 }}>Procurando você...</Text>
      </View>
    );
  }

  return (
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
