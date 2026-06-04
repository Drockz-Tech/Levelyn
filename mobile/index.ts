import { StyleSheet } from 'nativewind';

// NativeWind v4 / react-native-css-interop uses getFlag("darkMode") to determine the dark mode strategy.
// On web, it reads from the compiled CSS variables, which may not be loaded yet when the JS runtime starts,
// or might default to 'media'. By overriding getFlag, we force it to 'class' mode, allowing manual toggling.
const anyStyleSheet = StyleSheet as any;
const originalGetFlag = anyStyleSheet.getFlag;
anyStyleSheet.getFlag = (name: string) => {
  if (name === 'darkMode') {
    return 'class dark';
  }
  return originalGetFlag ? originalGetFlag(name) : undefined;
};

// Also define setFlag to satisfy any explicit calls or error suggestions
anyStyleSheet.setFlag = (name: string, value: string) => {
  // getFlag is already mocked to return 'class dark'
};

import 'expo-router/entry';

