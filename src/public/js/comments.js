(() => {
  const $root = document.querySelector('[data-comments-root]')
  if (!$root) return

  const projectId = Number($root.dataset.projectId)
  const $list  = $root.querySelector('#c-list')
  const $form  = $root.querySelector('#c-form')
  const $input = $root.querySelector('#c-input')
  const $count = $root.querySelector('#c-count')
  const $avatarPreview = $root.querySelector('#c-avatar-preview')

  const ICONS = ['001-girl.png','002-boy.png','003-girl-1.png','004-girl-2.png','005-boy-1.png','006-man.png','007-girl-3.png','008-girl-4.png','009-person.png','010-girl-5.png']
  const ADJ = ['Ágil','Valiente','Curioso','Leal','Brillante','Sereno','Veloz','Alegre','Sabio','Tenaz']
  const ANM = ['Gato','Zorro','Colibrí','Oruga','Panda','Delfín','Cóndor','Lince','Lobo','Tucán']

  const rand = (arr) => arr[Math.floor(Math.random()*arr.length)]
  const randomIcon = () => rand(ICONS)
  const randomName = () => `${rand(ANM)} ${rand(ADJ)}`

  let currentIcon = randomIcon()
  if ($avatarPreview) $avatarPreview.src = `/img/icons/${currentIcon}`

  function timeShort(iso) {
    try {
      const d = new Date(iso)
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch { return '' }
  }

  function render(items) {
    $list.innerHTML = ''
    items.forEach((c) => {
      const li = document.createElement('li')
      li.className = 'c-item'
      li.innerHTML = `
        <img src="/img/icons/${c.icon}" class="c-avatar" alt="${c.name}">
        <div class="c-bubble">
          <div class="c-meta"><strong>${c.name}</strong><small class="text-muted"> · ${timeShort(c.timeISO)}</small></div>
          <p class="mb-0"></p>
        </div>
      `
      li.querySelector('p').textContent = c.text
      $list.appendChild(li)
    })
    $count.textContent = items.length
  }

  async function fetchComments() {
    const r = await fetch(`/comments/${projectId}`)
    const json = await r.json()
    render(json.items || [])
  }

  $form.addEventListener('submit', async (ev) => {
    ev.preventDefault()
    const text = ($input.value || '').trim()
    if (!text) return
    const name = randomName()
    const res = await fetch('/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, text, name, icon: currentIcon })
    })
    if (res.ok) {
      $input.value = ''
      currentIcon = randomIcon()
      if ($avatarPreview) $avatarPreview.src = `/img/icons/${currentIcon}`
      await fetchComments()
    }
  })

  $input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      $form.requestSubmit()
    }
  })

  fetchComments()
})()
