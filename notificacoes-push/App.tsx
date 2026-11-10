import React from 'react';
import * as Notifications from 'expo-notifications';
import NotificacoesScreen from './src/screens/NotificacoesScreen';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  return <NotificacoesScreen />;
}
