import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@vibe:rememberedUser';

export interface RememberedUser {
  email: string;
  displayName: string;
  provider: 'google';
}

export const authStorage = {
  saveRememberedUser: async (user: RememberedUser): Promise<void> => {
    await AsyncStorage.setItem(KEY, JSON.stringify(user));
  },

  getRememberedUser: async (): Promise<RememberedUser | null> => {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as RememberedUser;
    } catch {
      return null;
    }
  },

  clearRememberedUser: async (): Promise<void> => {
    await AsyncStorage.removeItem(KEY);
  },
};
