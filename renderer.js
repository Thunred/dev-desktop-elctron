let currentPath = null

function updateCounter(text) {
	const n = (typeof text === 'number') ? text : text.length
	document.getElementById('counter').textContent = `${n} caractère${n > 1 ? 's' : ''}`
}

window.addEventListener('DOMContentLoaded', () => {
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
		const res = await window.api.openFile()
		if (!res || res.canceled) return
		currentPath = res.filePath
		editor.value = res.content
		updateCounter(editor.value)
	})

		saveBtn.addEventListener('click', async () => {
			const content = editor.value
			const res = await window.api.saveFile(content, currentPath)
		if (!res || res.canceled) return
		currentPath = res.filePath
	})

		newBtn.addEventListener('click', async () => {
			await window.api.newFile()
		currentPath = null
		editor.value = ''
		updateCounter('')
		editor.focus()
	})

	function applyTheme(theme) {
		if (theme === 'light') document.body.setAttribute('data-theme', 'light')
		else document.body.removeAttribute('data-theme')
		if (themeBtn) themeBtn.textContent = theme === 'light' ? 'Mode sombre' : 'Mode clair'
	}

	const savedTheme = localStorage.getItem('theme') || 'dark'
	applyTheme(savedTheme)

	if (themeBtn) {
		themeBtn.addEventListener('click', () => {
			const now = localStorage.getItem('theme') === 'light' ? 'dark' : 'light'
			localStorage.setItem('theme', now)
			applyTheme(now)
		})
	}


	window.api.onFileOpened((data) => {
		if (!data) return
		currentPath = data.filePath
		editor.value = data.content
		updateCounter(editor.value)
	})

	window.api.onFileSaved((data) => {
		if (!data) return
		currentPath = data.filePath
	})

	window.api.onFileNew(() => {
		currentPath = null
		editor.value = ''
		updateCounter('')
	})

	window.api.onMenuSave(async () => {
		const content = editor.value
		const res = await window.api.saveFile(content, currentPath)
		if (!res || res.canceled) return
		currentPath = res.filePath
	})

	// editor input already updates the counter via updateCounter above
})
