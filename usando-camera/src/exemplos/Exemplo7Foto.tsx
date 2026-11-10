import React, { useRef, useState } from 'react';
import { View, Image, Button } from 'react-native';
import { CameraView } from 'expo-camera';

export default function Exemplo7Foto() {
  const cameraRef = useRef<CameraView>(null);
  const [foto, setFoto] = useState('');

  async function tirarFoto() {
    const resultado = await cameraRef.current?.takePictureAsync();
    if (resultado) {
      setFoto(resultado.uri);
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <CameraView ref={cameraRef} style={{ flex: 1 }} />
      <Button title="Tirar foto" onPress={tirarFoto} />
      {foto !== '' && <Image source={{ uri: foto }} style={{ width: 120, height: 160 }} />}
    </View>
  );
}
