const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('uplink', {
  getMsg: async () => await ipcRenderer.invoke('get_msg')
})