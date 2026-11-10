import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useCameraPermissions } from 'expo-camera';
import Exemplo from './src/screens/CameraScreen';

export default function App() {
  const [permissao, pedirPermissao] = useCameraPermissions();

  if (!permissao) {
    return <View />;
  }

  if (!permissao.granted) {
    return (
      <View style={styles.centro}>
        <Text style={styles.texto}>Precisamos da sua permissão para usar a câmera.</Text>
        <TouchableOpacity onPress={pedirPermissao} style={styles.botao}>
          <Text style={styles.botaoTexto}>Permitir câmera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return <Exemplo />;
}

const styles = StyleSheet.create({
  centro: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  texto: { fontSize: 18, textAlign: 'center', marginBottom: 16 },
  botao: { backgroundColor: '#2e6de6', borderRadius: 8, paddingVertical: 14, paddingHorizontal: 24 },
  botaoTexto: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
