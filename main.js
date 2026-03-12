const { app, BrowserWindow, dialog, Menu, Notification, ipcMain } = require('electron')
const path = require('node:path')
const fs = require('node:fs').promises

let mainWindow
let currentFilePath = null

function updateTitle() {
  if (!mainWindow) return
  const name = currentFilePath ? path.basename(currentFilePath) : 'Untitled'
  mainWindow.setTitle(`Bloc-Notes — ${name}`)
}

async function openFileFromDialog() {
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [{ name: 'Text Files', extensions: ['txt', 'text'] }]
  })
  if (canceled || !filePaths || filePaths.length === 0) return null
  const filePath = filePaths[0]
  const content = await fs.readFile(filePath, 'utf8')
  currentFilePath = filePath
  updateTitle()
  mainWindow.webContents.send('file-opened', { filePath, content })
  return { filePath, content }
}

async function saveFileFromDialog(content, filePath) {
  let savePath = filePath
  if (!savePath) {
    const { canceled, filePath: chosen } = await dialog.showSaveDialog(mainWindow, {
      filters: [{ name: 'Text Files', extensions: ['txt', 'text'] }]
    })
    if (canceled || !chosen) return { canceled: true }
    savePath = chosen
  }
  await fs.writeFile(savePath, content, 'utf8')
  currentFilePath = savePath
  updateTitle()
  try {
    new Notification({ title: 'Sauvegarde', body: `Fichier enregistré: ${path.basename(savePath)}` }).show()
  } catch (e) {}
  mainWindow.webContents.send('file-saved', { filePath: savePath })
  return { canceled: false, filePath: savePath }
}

function createMenu() {
  const template = [
    {
      label: 'Fichier',
      submenu: [
        { label: 'Nouveau', accelerator: 'Ctrl+N', click: () => { currentFilePath = null; updateTitle(); mainWindow.webContents.send('file-new') } },
        { type: 'separator' },
        { label: 'Ouvrir', accelerator: 'Ctrl+O', click: () => openFileFromDialog() },
        { label: 'Sauvegarder', accelerator: 'Ctrl+S', click: () => mainWindow.webContents.send('menu-save') },
        { type: 'separator' },
        { label: 'Quitter', role: 'quit' }
      ]
    }
  ]
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })
  mainWindow.loadFile('index.html')
  createMenu()
  mainWindow.on('closed', () => { mainWindow = null })
  updateTitle()
}

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow() })
})

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })

// IPC handlers
ipcMain.handle('file:open', async () => {
  return await openFileFromDialog()
})

ipcMain.handle('file:save', async (event, { content, filePath }) => {
  return await saveFileFromDialog(content, filePath)
})

ipcMain.handle('file:new', async () => {
  currentFilePath = null
  updateTitle()
  return { ok: true }
})

// Allow renderer to request read/write by path
ipcMain.handle('file:read', async (event, filePath) => {
  const content = await fs.readFile(filePath, 'utf8')
  currentFilePath = filePath
  updateTitle()
  return { filePath, content }
})

ipcMain.handle('file:write', async (event, { filePath, content }) => {
  await fs.writeFile(filePath, content, 'utf8')
  currentFilePath = filePath
  updateTitle()
  try { new Notification({ title: 'Sauvegarde', body: `Fichier enregistré: ${path.basename(filePath)}` }).show() } catch (e) {}
  return { filePath }
})

ipcMain.handle('store-get',    (_e, key, def)   => store.get(key, def));
ipcMain.handle('store-set',    (_e, key, value) => store.set(key, value));
ipcMain.handle('store-delete', (_e, key)        => store.delete(key));