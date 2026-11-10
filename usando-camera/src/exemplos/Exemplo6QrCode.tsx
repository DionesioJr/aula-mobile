import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { CameraView } from 'expo-camera';

export default function Exemplo6QrCode() {
  const [texto, setTexto] = useState('Aponte para um QR code');

  return (
    <View style={{ flex: 1 }}>
      <CameraView
        style={{ flex: 1 }}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={(leitura) => setTexto(leitura.data)}
      />
      <Text style={{ fontSize: 18, padding: 24, textAlign: 'center' }}>{texto}</Text>
    </View>
  );
}
