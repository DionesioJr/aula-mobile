import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

export async function registrarParaPush(): Promise<string> {
  if (!Device.isDevice) {
    throw new Error('Push só funciona em aparelho físico, não no emulador.');
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Avisos da turma',
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  const atual = await Notifications.getPermissionsAsync();
  let status = atual.status;
  if (status !== 'granted') {
    const pedido = await Notifications.requestPermissionsAsync();
    status = pedido.status;
  }
  if (status !== 'granted') {
    throw new Error('Permissão de notificação negada.');
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  if (!projectId) {
    throw new Error('projectId não encontrado: rode "npx eas-cli init" no projeto.');
  }

  const token = await Notifications.getExpoPushTokenAsync({ projectId });
  return token.data;
}
