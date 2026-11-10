import React from 'react';
import { CameraView } from 'expo-camera';

export default function Exemplo2Frontal() {
  return <CameraView style={{ flex: 1 }} facing="front" />;
}
