import React from 'react';
import MapView, { Marker } from 'react-native-maps';

export default function Exemplo3Marcador() {
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
      <Marker
        coordinate={{ latitude: -15.7983, longitude: -47.8756 }}
        title="Catedral"
        description="Obra de Oscar Niemeyer"
      />
    </MapView>
  );
}
