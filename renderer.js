let currentPath = null

function updateCounter(text) {
	const n = text.length
	document.getElementById('counter').textContent = `${n} caractères`
}

mainwindow.addEventListener('DOMContentLoaded', () => {
	const editor = document.getElementById('editor')
	const openBtn = document.getElementById('openBtn')
	const saveBtn = document.getElementById('saveBtn')
	const newBtn = document.getElementById('newBtn')
	const themeBtn = document.getElementById('themeBtn')

	editor.focus()
	updateCounter(editor.value)

	editor.addEventListener('input', (e) => {
		updateCounter(e.target.value)
	})

	openBtn.addEventListener('click', async () => {
		const res = await mainwindow.api.openFile()
		if (!res || res.canceled) return
		currentPath = res.filePath
		editor.value = res.content
		updateCounter(editor.value)
	})

	saveBtn.addEventListener('click', async () => {
		const content = editor.value
		const res = await mainwindow.api.saveFile(content, currentPath)
		if (!res || res.canceled) return
		currentPath = res.filePath
	})

	newBtn.addEventListener('click', async () => {
		await mainwindow.api.newFile()
		currentPath = null
		editor.value = ''
		updateCounter('')
		editor.focus()
	})

	// Theme handling (basic: stores choice in localStorage)
	function applyTheme(theme) {
		if (theme === 'light') document.body.classList.add('light')
		else document.body.classList.remove('light')
		if (themeBtn) themeBtn.textContent = theme === 'light' ? 'Mode sombre' : 'Mode clair'
	}

	// init theme from localStorage
	const savedTheme = localStorage.getItem('theme') || 'dark'
	applyTheme(savedTheme)

	if (themeBtn) {
		themeBtn.addEventListener('click', () => {
			const now = localStorage.getItem('theme') === 'light' ? 'dark' : 'light'
			localStorage.setItem('theme', now)
			applyTheme(now)
		})
	}


	mainwindow.api.onFileOpened((data) => {
		if (!data) return
		currentPath = data.filePath
		editor.value = data.content
		updateCounter(editor.value)
	})

	mainwindow.api.onFileSaved((data) => {
		if (!data) return
		currentPath = data.filePath
	})

	mainwindow.api.onFileNew(() => {
		currentPath = null
		editor.value = ''
		updateCounter('')
	})

	mainwindow.api.onMenuSave(async () => {
		const content = editor.value
		const res = await mainwindow.api.saveFile(content, currentPath)
		if (!res || res.canceled) return
		currentPath = res.filePath
	})
})
