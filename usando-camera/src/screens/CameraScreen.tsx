import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { CameraView, CameraType } from 'expo-camera';

export default function CameraScreen() {
  const cameraRef = useRef<CameraView>(null);
  const [foto, setFoto] = useState('');
  const [lado, setLado] = useState<CameraType>('back');

  async function tirarFoto() {
    const resultado = await cameraRef.current?.takePictureAsync();
    if (resultado) {
      setFoto(resultado.uri);
    }
  }

  function virarCamera() {
    setLado(lado === 'back' ? 'front' : 'back');
  }

  if (foto !== '') {
    return (
      <View style={styles.container}>
        <Image source={{ uri: foto }} style={styles.foto} />
        <View style={styles.barra}>
          <TouchableOpacity onPress={() => setFoto('')} style={styles.botao}>
            <Text style={styles.botaoTexto}>Tirar outra</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing={lado} />
      <View style={styles.barra}>
        <TouchableOpacity onPress={virarCamera} style={styles.botao}>
          <Text style={styles.botaoTexto}>Virar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={tirarFoto} style={styles.botao}>
          <Text style={styles.botaoTexto}>Tirar foto</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  foto: { flex: 1 },
  barra: { flexDirection: 'row', justifyContent: 'space-around', padding: 20 },
  botao: { backgroundColor: '#2e6de6', borderRadius: 8, paddingVertical: 14, paddingHorizontal: 24 },
  botaoTexto: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
