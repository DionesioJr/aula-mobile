import React from 'react';
import { View, Text } from 'react-native';
import { CameraView } from 'expo-camera';

export default function Exemplo3Quadrado() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 28, marginBottom: 16 }}>Sorria!</Text>
      <CameraView style={{ width: 300, height: 300 }} facing="front" />
    </View>
  );
}
