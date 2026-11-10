import React, { useState } from 'react';
import { View, Button } from 'react-native';
import { CameraView } from 'expo-camera';

export default function Exemplo4Lanterna() {
  const [ligada, setLigada] = useState(false);

  return (
    <View style={{ flex: 1 }}>
      <CameraView style={{ flex: 1 }} enableTorch={ligada} />
      <Button
        title={ligada ? 'Desligar lanterna' : 'Ligar lanterna'}
        onPress={() => setLigada(!ligada)}
      />
    </View>
  );
}
