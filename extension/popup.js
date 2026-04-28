// QuickNotes — popup logic
(() => {
  const STORAGE_KEY = 'quicknotes_v1';
  const THEME_KEY = 'quicknotes_theme';

  const state = {
    notes: [],
    selectedId: null,
    filter: 'all',
    search: '',
    showPinnedOnly: false,
    saveTimer: null,
  };

  const $ = (sel) => document.querySelector(sel);
  const app = $('#app');
  const listEl = $('#notes-list');
  const countEl = $('#notes-count');
  const titleInput = $('#title-input');
  const editorEl = $('#editor');
  const tagsEl = $('#tags');
  const tagInput = $('#tag-input');
  const createdEl = $('#created-at');
  const updatedEl = $('#updated-at');
  const savedIndicator = $('#saved-indicator');

  const TYPE_EMOJI = { note: '📝', link: '🔗', clip: '✂️', idea: '💡', clip_image: '🖼️' };
  const TYPE_OF_TAB = { all: null, note: 'note', link: 'link', clip: 'clip', idea: 'idea' };

  const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
  const now = () => Date.now();

  function fmtTime(ts) {
    const d = new Date(ts);
    const today = new Date(); today.setHours(0,0,0,0);
    const noteDay = new Date(ts); noteDay.setHours(0,0,0,0);
    const diff = (today - noteDay) / 86400000;
    if (diff === 0) return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    if (diff === 1) return 'Yesterday';
    if (diff < 7) return d.toLocaleDateString([], { weekday: 'short' });
    return d.toLocaleDateString([], { day: 'numeric', month: 'short' });
  }
  function fmtFull(ts) {
    return new Date(ts).toLocaleString([], { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
  }

  // --- storage ---
  const storage = {
    get(key) {
      return new Promise((resolve) => {
        if (typeof chrome !== 'undefined' && chrome.storage) {
          chrome.storage.local.get([key], (r) => resolve(r[key]));
        } else {
          try { resolve(JSON.parse(localStorage.getItem(key))); } catch { resolve(null); }
        }
      });
    },
    set(key, val) {
      return new Promise((resolve) => {
        if (typeof chrome !== 'undefined' && chrome.storage) {
          chrome.storage.local.set({ [key]: val }, resolve);
        } else {
          localStorage.setItem(key, JSON.stringify(val));
          resolve();
        }
      });
    },
  };

  async function load() {
    const data = await storage.get(STORAGE_KEY);
    state.notes = Array.isArray(data) ? data : [];
    const theme = await storage.get(THEME_KEY);
    if (theme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
  }
  async function persist() {
    await storage.set(STORAGE_KEY, state.notes);
  }

  // --- rendering ---
  function filtered() {
    const t = TYPE_OF_TAB[state.filter];
    const q = state.search.trim().toLowerCase();
    return state.notes
      .filter(n => !t || n.type === t)
      .filter(n => !state.showPinnedOnly || n.pinned)
      .filter(n => !q || (n.title + ' ' + (n.body || '') + ' ' + (n.tags||[]).join(' ')).toLowerCase().includes(q))
      .sort((a, b) => (b.pinned?1:0) - (a.pinned?1:0) || b.updatedAt - a.updatedAt);
  }

  function plainPreview(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html || '';
    return (tmp.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function renderList() {
    const items = filtered();
    countEl.textContent = `${state.notes.length} note${state.notes.length===1?'':'s'}`;
    if (items.length === 0) {
      listEl.innerHTML = `
        <div class="empty">
          <div class="empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          </div>
          <div class="empty-title">No notes yet</div>
          <div class="empty-sub">Capture your first idea.</div>
        </div>`;
      return;
    }
    listEl.innerHTML = items.map(n => `
      <div class="note-card ${n.id === state.selectedId ? 'selected' : ''}" data-id="${n.id}">
        <div class="note-card-head">
          <span class="note-emoji">${TYPE_EMOJI[n.type] || '📝'}</span>
          <span class="note-title">${escapeHtml(n.title || 'Untitled')}</span>
          <span class="note-time">${fmtTime(n.updatedAt)}</span>
          ${n.pinned ? `<span class="note-pin"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2z"/></svg></span>` : ''}
        </div>
        <div class="note-preview">${escapeHtml(plainPreview(n.body)) || '<em style="opacity:.6">Empty note</em>'}</div>
        <div class="note-actions">
          <button data-act="edit" data-id="${n.id}" title="Edit">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          </button>
          <button class="danger" data-act="delete" data-id="${n.id}" title="Delete">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
          </button>
        </div>
      </div>
    `).join('');
  }

  function escapeHtml(s) {
    return (s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  function renderEditor() {
    const n = state.notes.find(x => x.id === state.selectedId);
    if (!n) { app.dataset.view = 'list'; return; }
    titleInput.value = n.title || '';
    editorEl.innerHTML = n.body || '';
    renderTags(n);
    createdEl.textContent = `Created: ${fmtFull(n.createdAt)}`;
    updatedEl.textContent = `Updated: ${fmtFull(n.updatedAt)}`;
    $('#btn-pin').classList.toggle('active', !!n.pinned);
    flashSaved();
  }

  function renderTags(n) {
    tagsEl.innerHTML = (n.tags || []).map(t => `
      <span class="tag">#${escapeHtml(t)}<button data-tag="${escapeHtml(t)}" title="Remove">×</button></span>
    `).join('');
  }

  function flashSaved() {
    savedIndicator.style.opacity = '1';
    clearTimeout(flashSaved._t);
    flashSaved._t = setTimeout(() => { savedIndicator.style.opacity = '.6'; }, 1200);
  }

  // --- actions ---
  const editorView = document.querySelector('.editor-view');
  function setMode(mode) {
    editorView.dataset.mode = mode;
    const editing = mode === 'edit';
    editorEl.setAttribute('contenteditable', editing ? 'true' : 'false');
    if (editing) titleInput.removeAttribute('readonly');
    else titleInput.setAttribute('readonly', '');
  }
  function openNote(id, mode = 'read') {
    state.selectedId = id;
    app.dataset.view = 'editor';
    setMode(mode);
    renderEditor();
    renderList();
  }
  function backToList() {
    app.dataset.view = 'list';
    renderList();
  }

  function newNote(partial = {}) {
    const t = now();
    const n = {
      id: uid(),
      type: 'note',
      title: '',
      body: '',
      tags: [],
      pinned: false,
      createdAt: t,
      updatedAt: t,
      ...partial,
    };
    state.notes.unshift(n);
    persist();
    openNote(n.id, 'edit');
    setTimeout(() => titleInput.focus(), 60);
    return n;
  }

  function deleteNoteById(id) {
    if (!confirm('Delete this note?')) return;
    state.notes = state.notes.filter(n => n.id !== id);
    if (state.selectedId === id) {
      state.selectedId = null;
      backToList();
    } else {
      renderList();
    }
    persist();
  }

  function deleteCurrent() {
    if (!state.selectedId) return;
    deleteNoteById(state.selectedId);
  }


  function scheduleSave() {
    const n = state.notes.find(x => x.id === state.selectedId);
    if (!n) return;
    n.title = titleInput.value;
    n.body = editorEl.innerHTML;
    n.updatedAt = now();
    updatedEl.textContent = `Updated: ${fmtFull(n.updatedAt)}`;
    clearTimeout(state.saveTimer);
    state.saveTimer = setTimeout(async () => {
      await persist();
      flashSaved();
    }, 250);
  }

  // --- chrome features ---
  async function getActiveTab() {
    if (typeof chrome === 'undefined' || !chrome.tabs) return null;
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return tab || null;
  }

  async function saveLink() {
    const tab = await getActiveTab();
    if (!tab) return newNote({ type: 'link', title: 'New Link' });
    newNote({
      type: 'link',
      title: tab.title || tab.url,
      body: `<p><a href="${tab.url}" target="_blank">${escapeHtml(tab.url)}</a></p>`,
    });
  }

  async function clipSelection() {
    const tab = await getActiveTab();
    if (!tab || !chrome.scripting) return newNote({ type: 'clip', title: 'New Clip' });
    try {
      const [res] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => window.getSelection()?.toString() || '',
      });
      const text = (res && res.result) || '';
      newNote({
        type: 'clip',
        title: text ? text.slice(0, 60) : `Clip from ${tab.title || 'page'}`,
        body: `<blockquote>${escapeHtml(text || 'No text selected.')}</blockquote><p><small>From <a href="${tab.url}" target="_blank">${escapeHtml(tab.title || tab.url)}</a></small></p>`,
      });
    } catch {
      newNote({ type: 'clip', title: 'New Clip' });
    }
  }

  async function screenshot() {
    if (!chrome.tabs?.captureVisibleTab) return newNote({ type: 'clip', title: 'Screenshot' });
    try {
      const dataUrl = await chrome.tabs.captureVisibleTab({ format: 'png' });
      const tab = await getActiveTab();
      newNote({
        type: 'clip',
        title: `Screenshot — ${tab?.title || 'page'}`,
        body: `<p><img src="${dataUrl}" alt="screenshot" /></p><p><small>${escapeHtml(tab?.url || '')}</small></p>`,
      });
    } catch (e) {
      console.error(e);
    }
  }

  // --- toolbar commands ---
  function execCmd(cmd, arg) {
    editorEl.focus();
    if (cmd === 'checkbox') {
      document.execCommand('insertHTML', false, '<label><input type="checkbox"> </label>&nbsp;');
    } else if (cmd === 'link') {
      const url = prompt('Enter URL:');
      if (url) document.execCommand('createLink', false, url);
    } else if (cmd === 'code') {
      document.execCommand('insertHTML', false, '<code>code</code>&nbsp;');
    } else if (cmd === 'quote') {
      document.execCommand('formatBlock', false, 'BLOCKQUOTE');
    } else {
      document.execCommand(cmd, false, arg);
    }
    scheduleSave();
  }

  // --- event wiring ---
  function bind() {
    $('#btn-new').addEventListener('click', () => newNote({ type: 'note', title: '' }));
    $('#btn-back').addEventListener('click', backToList);
    $('#btn-delete').addEventListener('click', deleteCurrent);
    $('#btn-pin').addEventListener('click', () => {
      const n = state.notes.find(x => x.id === state.selectedId);
      if (!n) return;
      n.pinned = !n.pinned;
      $('#btn-pin').classList.toggle('active', n.pinned);
      persist();
    });
    $('#btn-pin-toggle').addEventListener('click', (e) => {
      state.showPinnedOnly = !state.showPinnedOnly;
      e.currentTarget.classList.toggle('active', state.showPinnedOnly);
      renderList();
    });
    $('#btn-search').addEventListener('click', () => $('#search-input').focus());
    $('#btn-theme').addEventListener('click', async () => {
      const dark = document.documentElement.getAttribute('data-theme') === 'dark';
      if (dark) document.documentElement.removeAttribute('data-theme');
      else document.documentElement.setAttribute('data-theme', 'dark');
      await storage.set(THEME_KEY, dark ? 'light' : 'dark');
    });

    $('#search-input').addEventListener('input', (e) => {
      state.search = e.target.value;
      renderList();
    });

    $('#tabs').addEventListener('click', (e) => {
      const btn = e.target.closest('.tab');
      if (!btn) return;
      $('#tabs').querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.filter = btn.dataset.tab;
      renderList();
    });

    listEl.addEventListener('click', (e) => {
      const actBtn = e.target.closest('button[data-act]');
      if (actBtn) {
        e.stopPropagation();
        const id = actBtn.dataset.id;
        if (actBtn.dataset.act === 'delete') deleteNoteById(id);
        else if (actBtn.dataset.act === 'edit') openNote(id, 'edit');
        return;
      }
      const card = e.target.closest('.note-card');
      if (card) openNote(card.dataset.id, 'read');
    });

    $('#btn-edit').addEventListener('click', () => setMode('edit'));
    $('#btn-done').addEventListener('click', () => setMode('read'));

    titleInput.addEventListener('input', scheduleSave);
    editorEl.addEventListener('input', scheduleSave);

    tagInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && tagInput.value.trim()) {
        e.preventDefault();
        const n = state.notes.find(x => x.id === state.selectedId);
        if (!n) return;
        const t = tagInput.value.trim().replace(/^#/, '');
        n.tags = Array.from(new Set([...(n.tags || []), t]));
        tagInput.value = '';
        renderTags(n);
        scheduleSave();
      }
    });
    tagsEl.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-tag]');
      if (!btn) return;
      const n = state.notes.find(x => x.id === state.selectedId);
      if (!n) return;
      n.tags = (n.tags || []).filter(t => t !== btn.dataset.tag);
      renderTags(n);
      scheduleSave();
    });

    $('#toolbar').addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-cmd]');
      if (!btn) return;
      execCmd(btn.dataset.cmd, btn.dataset.arg);
    });

    document.querySelectorAll('.action').forEach(b => {
      b.addEventListener('click', () => {
        const a = b.dataset.action;
        if (a === 'note') newNote({ type: 'note' });
        else if (a === 'link') saveLink();
        else if (a === 'clip') clipSelection();
        else if (a === 'screenshot') screenshot();
      });
    });

    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault(); $('#search-input').focus();
      }
      if (e.key === 'Escape' && app.dataset.view === 'editor') backToList();
    });

    // Handle background-triggered actions
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get(['pending_action'], (r) => {
        if (!r.pending_action) return;
        const a = r.pending_action;
        chrome.storage.local.remove('pending_action');
        if (a === 'note') newNote({ type: 'note' });
        else if (a === 'link') saveLink();
        else if (a === 'clip') clipSelection();
        else if (a === 'screenshot') screenshot();
      });
    }
  }

  (async function init() {
    await load();
    bind();
    renderList();
  })();
})();
