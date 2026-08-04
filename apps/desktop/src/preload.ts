import { contextBridge, ipcRenderer } from 'electron';

// Expose safe IPC endpoints to client context
contextBridge.exposeInMainWorld('electronAPI', {
  readLocalFile: (filePath: string) => ipcRenderer.invoke('read-local-file', filePath),
  saveOfflineBookmark: (bookmarkData: any) => ipcRenderer.invoke('save-offline-bookmark', bookmarkData),
  onTTSToggle: (callback: () => void) => {
    ipcRenderer.on('tts-toggle', () => callback());
    return () => {
      ipcRenderer.removeAllListeners('tts-toggle');
    };
  }
});
