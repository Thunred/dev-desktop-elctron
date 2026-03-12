const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
	openFile: () => ipcRenderer.invoke('file:open'),
	saveFile: (content, filePath) => ipcRenderer.invoke('file:save', { content, filePath }),
	newFile: () => ipcRenderer.invoke('file:new'),
	readFile: (filePath) => ipcRenderer.invoke('file:read', filePath),
	writeFile: (filePath, content) => ipcRenderer.invoke('file:write', { filePath, content }),
	onFileOpened: (cb) => ipcRenderer.on('file-opened', (e, data) => cb(data)),
	onFileSaved: (cb) => ipcRenderer.on('file-saved', (e, data) => cb(data)),
	onFileNew: (cb) => ipcRenderer.on('file-new', () => cb()),
	onMenuSave: (cb) => ipcRenderer.on('menu-save', () => cb()),
	getPreference: (key, defaultValue) => ipcRenderer.invoke('store-get', key, defaultValue),
})