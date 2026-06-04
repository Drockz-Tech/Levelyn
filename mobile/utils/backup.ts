import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { SessionEvent, useEventsStore } from '../store/events';
import { useProfileStore } from '../store/profile';

export async function exportBackup(filename = 'levelyn-backup.json'){
  const events = useEventsStore.getState().events;
  const profile = useProfileStore.getState().profile;
  const payload = { events, profile, exportedAt: new Date().toISOString() };
  const path = FileSystem.cacheDirectory + filename;
  await FileSystem.writeAsStringAsync(path, JSON.stringify(payload), { encoding: FileSystem.EncodingType.UTF8 });
  await Sharing.shareAsync(path);
}

export async function importBackup(): Promise<{events?: SessionEvent[]; profile?: any} | null>{
  try{
    const res = await DocumentPicker.getDocumentAsync({ type: 'application/json' });
    if (res.canceled || !res.assets || res.assets.length === 0) return null;
    const contents = await FileSystem.readAsStringAsync(res.assets[0].uri, { encoding: FileSystem.EncodingType.UTF8 });
    const parsed = JSON.parse(contents);
    return parsed;
  }catch(e){
    console.warn('import failed', e);
    return null;
  }
}
