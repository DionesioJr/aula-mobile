import React from 'react';
import MapView, { Polyline, Circle } from 'react-native-maps';

const TORRE = { latitude: -15.7905, longitude: -47.8929 };
const CATEDRAL = { latitude: -15.7983, longitude: -47.8756 };
const CONGRESSO = { latitude: -15.7997, longitude: -47.8641 };

export default function Exemplo5Desenhar() {
  return (
    <MapView
      style={{ flex: 1 }}
      initialRegion={{
        latitude: -15.795,
        longitude: -47.88,
        latitudeDelta: 0.04,
        longitudeDelta: 0.04,
      }}
    >
      <Polyline coordinates={[TORRE, CATEDRAL, CONGRESSO]} strokeColor="blue" strokeWidth={4} />
      <Circle center={CONGRESSO} radius={300} fillColor="rgba(255, 0, 0, 0.3)" />
    </MapView>
  );
}
