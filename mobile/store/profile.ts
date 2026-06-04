import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persist, createJSONStorage } from 'zustand/middleware';

type ThemeName = 'blue' | 'purple' | 'teal';

export type AvatarName = 'astronaut' | 'rocket' | 'cypher' | 'phoenix';

export type Profile = {
  username: string;
  display_name?: string;
  avatar?: AvatarName;
  theme?: ThemeName;
  isPrivate?: boolean;
};

type ProfileState = {
  profile: Profile | null;
  setProfile: (p: Profile) => void;
  clearProfile: () => void;
};

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      profile: null,
      setProfile: (p) => set({ profile: p }),
      clearProfile: () => set({ profile: null }),
    }),
    {
      name: 'levelyn:profile',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useProfileStore;
