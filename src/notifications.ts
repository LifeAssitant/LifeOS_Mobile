import Constants, { ExecutionEnvironment } from "expo-constants";
import { Platform } from "react-native";

import { api } from "./api/client";

/** Expo Go (store client) no longer supports expo-notifications push on Android (SDK 53+). */
export const isExpoGo =
  Constants.appOwnership === "expo" ||
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

type NotificationsModule = typeof import("expo-notifications");

let notificationsModule: NotificationsModule | null | undefined;
let handlerReady = false;

async function getNotifications(): Promise<NotificationsModule | null> {
  if (isExpoGo) return null;
  if (notificationsModule !== undefined) return notificationsModule;
  try {
    notificationsModule = await import("expo-notifications");
    if (!handlerReady && notificationsModule) {
      notificationsModule.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });
      handlerReady = true;
    }
    return notificationsModule;
  } catch {
    notificationsModule = null;
    return null;
  }
}

export async function registerForPushNotifications(): Promise<string | null> {
  const Notifications = await getNotifications();
  if (!Notifications) return null;

  const Device = await import("expo-device");
  if (!Device.isDevice) return null;

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;
  if (existing !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== "granted") return null;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "LifeOS",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;
  try {
    await api.updateMe({ expo_push_token: token });
  } catch {
    // ignore until authenticated
  }
  return token;
}

export async function scheduleLocalReminder(
  id: string,
  title: string,
  body: string,
  when: Date
): Promise<void> {
  const Notifications = await getNotifications();
  if (!Notifications) return;

  const seconds = Math.max(1, Math.floor((when.getTime() - Date.now()) / 1000));
  if (seconds > 60 * 60 * 24 * 30) return;

  await Notifications.scheduleNotificationAsync({
    content: { title, body, data: { id } },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds,
      repeats: false,
    },
  });
}
