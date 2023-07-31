const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('uplink', {
  getMsg: () => ipcRenderer.invoke('get_msg')
})