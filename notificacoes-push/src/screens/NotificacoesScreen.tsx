import React, { useEffect, useState } from 'react';
import { Text, TextInput, TouchableOpacity, StyleSheet, Alert, Share, ScrollView } from 'react-native';
import * as Notifications from 'expo-notifications';
import { registrarParaPush } from '../notificacoes/registrar';
import { cadastrarToken } from '../notificacoes/api';

export default function NotificacoesScreen() {
  const [token, setToken] = useState('');
  const [erro, setErro] = useState('');
  const [urlServidor, setUrlServidor] = useState('http://192.168.0.10:3000');
  const [ultimaRecebida, setUltimaRecebida] = useState('');
  const ultimaTocada = Notifications.useLastNotificationResponse();

  useEffect(() => {
    async function iniciar() {
      try {
        setToken(await registrarParaPush());
      } catch (e) {
        setErro((e as Error).message);
      }
    }
    iniciar();

    const assinatura = Notifications.addNotificationReceivedListener((notificacao) => {
      setUltimaRecebida(notificacao.request.content.title || '(sem título)');
    });
    return () => assinatura.remove();
  }, []);

  async function handleCadastrar() {
    try {
      await cadastrarToken(urlServidor, token);
      Alert.alert('Pronto!', 'Token cadastrado no servidor da turma.');
    } catch (e) {
      Alert.alert('Erro', (e as Error).message);
    }
  }

  async function handleNotificacaoLocal() {
    await Notifications.scheduleNotificationAsync({
      content: { title: 'Notificação local', body: 'Agendada pelo próprio app, sem servidor.' },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 5,
      },
    });
    Alert.alert('Agendada', 'Saia do app: ela chega em 5 segundos.');
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Notificações push</Text>

      <Text style={styles.rotulo}>Token deste aparelho</Text>
      {erro ? (
        <Text style={styles.erro}>{erro}</Text>
      ) : (
        <Text style={styles.token} selectable>
          {token || 'Gerando token...'}
        </Text>
      )}

      <TouchableOpacity onPress={() => Share.share({ message: token })} style={styles.botao}>
        <Text style={styles.botaoTexto}>Compartilhar token</Text>
      </TouchableOpacity>

      <Text style={styles.rotulo}>Servidor da turma</Text>
      <TextInput
        style={styles.input}
        value={urlServidor}
        onChangeText={setUrlServidor}
        autoCapitalize="none"
        keyboardType="url"
      />

      <TouchableOpacity onPress={handleCadastrar} style={styles.botao}>
        <Text style={styles.botaoTexto}>Cadastrar token no servidor</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleNotificacaoLocal} style={styles.botaoSecundario}>
        <Text style={styles.botaoSecundarioTexto}>Testar notificação local (5 s)</Text>
      </TouchableOpacity>

      <Text style={styles.rotulo}>Última recebida com o app aberto</Text>
      <Text style={styles.valor}>{ultimaRecebida || 'nenhuma ainda'}</Text>

      <Text style={styles.rotulo}>Última tocada na bandeja</Text>
      <Text style={styles.valor}>
        {ultimaTocada ? ultimaTocada.notification.request.content.title : 'nenhuma ainda'}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  titulo: { fontSize: 24, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  rotulo: { fontSize: 12, color: '#999', textTransform: 'uppercase', marginTop: 16, marginBottom: 6 },
  token: { fontSize: 13, backgroundColor: '#f2f4f8', borderRadius: 8, padding: 12 },
  erro: { color: '#d33', backgroundColor: '#fdecec', borderRadius: 8, padding: 12 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12 },
  valor: { fontSize: 16 },
  botao: { backgroundColor: '#2e6de6', borderRadius: 8, padding: 14, marginTop: 12 },
  botaoTexto: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  botaoSecundario: {
    borderWidth: 1,
    borderColor: '#2e6de6',
    borderRadius: 8,
    padding: 14,
    marginTop: 24,
  },
  botaoSecundarioTexto: { color: '#2e6de6', textAlign: 'center', fontWeight: 'bold' },
});
