import { Platform } from 'react-native';
import * as Device from 'expo-device';

export async function cadastrarToken(urlServidor: string, token: string) {
  const resposta = await fetch(`${urlServidor}/tokens`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token: token,
      aparelho: `${Device.modelName} (${Platform.OS})`,
    }),
  });
  if (!resposta.ok) {
    throw new Error(`O servidor respondeu ${resposta.status}.`);
  }
}
