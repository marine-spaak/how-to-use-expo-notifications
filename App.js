// J'importe les hooks dont je vais avoir besoin
import { useState, useEffect, useRef } from 'react';

import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

// J'importe ce dont j'ai besoin pour gérer les Notifications
import * as Notifications from 'expo-notifications';

// Paramétrage des notifications (alerte / son / etc.)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function App() {
  // Ce bloc stocke le jeton et les notifications dans le state
  // Il permet que l'écouteur de notification reste actif quand l'application est fermée.
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();

  // Fonction qui programme la notification
  async function schedulePushNotification() {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🙂 Coucou',
        body: 'Ca fait plaisir de recevoir une notification souriante !',
      },
      trigger: { seconds: 2 },
    });
  }

  // Fonction qui gère les permissions et le jeton
  async function registerForPushNotificationsAsync() {
    let token;
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
  
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
  
      if (finalStatus !== 'granted') {
        Alert.alert(
          'No Notification Permission',
          'please goto setting and on notification permission manual',
          [
            { text: 'cancel', onPress: () => console.log('cancel') },
            { text: 'Allow', onPress: () => Linking.openURL('app-settings:') },
          ],
          { cancelable: false },
        );
        return;
      }
  
      token = (await Notifications.getExpoPushTokenAsync()).data;
  
      if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
    }
  
    return token;
  }

  // Premier useEffect pour gérer les permissions
  useEffect(() => {
    registerForPushNotificationsAsync().then((token) => setExpoPushToken(token));
  
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      setNotification(notification);
    });
  
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log(response);
    });
  
    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, []);

  // Deuxième useEffect pour envoyer ma notification personnelle
  useEffect(() => {
    schedulePushNotification();
  }, []);
  
  return (
    <View style={styles.container}>
      <Text>Une application qui envoie des notifications souriantes !</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
