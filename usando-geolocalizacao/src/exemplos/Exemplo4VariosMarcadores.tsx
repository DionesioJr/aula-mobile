import React from 'react';
import MapView, { Marker } from 'react-native-maps';

const LUGARES = [
  { nome: 'Congresso Nacional', latitude: -15.7997, longitude: -47.8641 },
  { nome: 'Catedral', latitude: -15.7983, longitude: -47.8756 },
  { nome: 'Torre de TV', latitude: -15.7905, longitude: -47.8929 },
];

export default function Exemplo4VariosMarcadores() {
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
      {LUGARES.map((lugar) => (
        <Marker
          key={lugar.nome}
          coordinate={{ latitude: lugar.latitude, longitude: lugar.longitude }}
          title={lugar.nome}
        />
      ))}
    </MapView>
  );
}
