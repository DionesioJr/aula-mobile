import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MapView, { Marker, LatLng } from 'react-native-maps';

export default function MeusLugaresScreen() {
  const [lugares, setLugares] = useState<LatLng[]>([]);
  const [satelite, setSatelite] = useState(false);

  function adicionarLugar(ponto: LatLng) {
    setLugares([...lugares, ponto]);
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.mapa}
        showsUserLocation
        mapType={satelite ? 'satellite' : 'standard'}
        initialRegion={{
          latitude: -15.795,
          longitude: -47.88,
          latitudeDelta: 0.04,
          longitudeDelta: 0.04,
        }}
        onPress={(evento) => adicionarLugar(evento.nativeEvent.coordinate)}
      >
        {lugares.map((lugar, indice) => (
          <Marker key={indice} coordinate={lugar} title={`Lugar ${indice + 1}`} />
        ))}
      </MapView>
      <View style={styles.barra}>
        <Text style={styles.contador}>{lugares.length} lugares marcados</Text>
        <View style={styles.botoes}>
          <TouchableOpacity onPress={() => setSatelite(!satelite)} style={styles.botao}>
            <Text style={styles.botaoTexto}>{satelite ? 'Mapa' : 'Satélite'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setLugares([])} style={styles.botao}>
            <Text style={styles.botaoTexto}>Limpar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  mapa: { flex: 1 },
  barra: { padding: 16, backgroundColor: '#fff' },
  contador: { fontSize: 18, textAlign: 'center', marginBottom: 12 },
  botoes: { flexDirection: 'row', justifyContent: 'space-around' },
  botao: { backgroundColor: '#2e6de6', borderRadius: 8, paddingVertical: 14, paddingHorizontal: 24 },
  botaoTexto: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
