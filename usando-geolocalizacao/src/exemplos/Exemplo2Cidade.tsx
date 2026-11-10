import React from 'react';
import MapView from 'react-native-maps';

export default function Exemplo2Cidade() {
  return (
    <MapView
      style={{ flex: 1 }}
      initialRegion={{
        latitude: -15.795,
        longitude: -47.88,
        latitudeDelta: 0.04,
        longitudeDelta: 0.04,
      }}
    />
  );
}
