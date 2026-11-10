import React, { useState } from 'react';
import { View, Button } from 'react-native';
import MapView from 'react-native-maps';

export default function Exemplo6Satelite() {
  const [satelite, setSatelite] = useState(false);

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1 }}
        mapType={satelite ? 'satellite' : 'standard'}
        initialRegion={{
          latitude: -15.795,
          longitude: -47.88,
          latitudeDelta: 0.04,
          longitudeDelta: 0.04,
        }}
      />
      <Button
        title={satelite ? 'Ver mapa' : 'Ver satélite'}
        onPress={() => setSatelite(!satelite)}
      />
    </View>
  );
}
