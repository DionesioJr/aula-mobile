import React, { useState } from 'react';
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
