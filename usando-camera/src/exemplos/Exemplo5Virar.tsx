import React, { useState } from 'react';
import { View, Button } from 'react-native';
import { CameraView, CameraType } from 'expo-camera';

export default function Exemplo5Virar() {
  const [lado, setLado] = useState<CameraType>('back');

  return (
    <View style={{ flex: 1 }}>
      <CameraView style={{ flex: 1 }} facing={lado} />
      <Button
        title="Virar câmera"
        onPress={() => setLado(lado === 'back' ? 'front' : 'back')}
      />
    </View>
  );
}
