
# QuickNotes — Chrome Extension Plan

A Manifest V3 Chrome extension for fast note-taking, link saving, text clipping, and screenshots, with a premium light UI that mirrors the uploaded reference.

## What you'll get

1. A working unpacked Chrome extension (`/extension` folder in the project).
2. A packaged `quicknotes-extension.zip` served from the preview site.
3. A simple landing page in the preview with a Download button + install instructions.

## Popup UI (matches reference)

Popup size: **420 × 600**. Light theme with optional dark toggle.

```text
┌──────────────────────────────────────────────┐
│ [icon] QuickNotes        🔍 📌 🌙 ⚙   [+ New]│  Header
├──────┬───────────────────────────────────────┤
│ 📝   │ 🔍 Search notes...           ⌘K       │
│ ❤   │ [All] Notes Links Clips Ideas         │
│ 🗑   │ ┌─────────────────────────────────┐   │
│      │ │ 💡 Product Idea (selected)      │   │
│      │ │ 10:30 AM · preview text…        │   │
│      │ └─────────────────────────────────┘   │
│      │   UX Inspiration · Yesterday          │
│      │   Meeting Notes · Yesterday           │
│      │   Quick Thought · 22 May              │
│      │ 12 notes              ● Synced        │
├──────┴───────────────────────────────────────┤
│ Title input        #tag #tag  +Add tag       │
│ B  I  S  H1 H2  • ☐  🔗 🖼 </> ❝  …          │
│                                               │
│ contenteditable note body…                   │
│                                               │
│ Created: 24 May, 10:30 AM   Updated: now     │
├──────────────────────────────────────────────┤
│ 📝 Take Note  🔗 Save Link  ✂ Clip  📷 Shot │  Floating action bar
│   Alt+N         Alt+L        Alt+S  ⇧Alt+S   │
└──────────────────────────────────────────────┘
```

Note: Chrome popups are constrained in width (~800px max). 420px is plenty for the layout, but the 3-column reference (icon rail + list + editor) will be condensed: thin icon rail (40px) + collapsible list/editor that swap based on selection, OR a 2-pane layout (list on top / editor below) with a back button. We'll use **list-then-editor navigation** inside the popup (tap a note → editor opens with back arrow) so the design stays uncluttered at 420px wide. The reference visual styling (cards, chips, toolbar, action bar) is preserved exactly.

## Design tokens

- Primary `#7C5CFF`, Background `#F7F8FA`, Card `#FFFFFF`
- Text `#1F2937` / secondary `#6B7280`, Border `#E5E7EB`
- Radius 12–16px, soft shadows, 150–200ms transitions, 8px spacing grid
- Inter / system-ui
- Dark mode: inverted neutrals with same purple accent

## Features

- Create / edit / delete notes (auto-save to `chrome.storage.local`)
- Tabs filter: All, Notes, Links, Clips, Ideas (by note `type`)
- Search across title, body, tags
- Tag chips (add/remove)
- Pin notes
- Rich text toolbar: bold, italic, strike, H1, H2, bullet list, checkbox list, link, code, quote (via `document.execCommand` on a contenteditable for simplicity)
- Save current tab as Link note (title + URL + favicon)
- Clip selection: content script reads `window.getSelection()` and sends to popup
- Screenshot: `chrome.tabs.captureVisibleTab` → saved as a Clip note with image
- Dark mode toggle (persisted)
- Keyboard shortcuts via `commands` API: Alt+N, Alt+L, Alt+S, Alt+Shift+S
- Empty state: "No notes yet. Capture your first idea."

## File structure

```text
extension/
├── manifest.json          # MV3
├── popup.html
├── popup.js               # all UI logic, vanilla JS
├── styles.css             # design system + components
├── background.js          # service worker: commands, screenshot, link save
├── content.js             # selection capture
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

## Manifest highlights

- `manifest_version: 3`
- Permissions: `storage`, `activeTab`, `tabs`, `scripting`
- `action.default_popup: popup.html`
- `background.service_worker: background.js`
- `commands`: `take-note` (Alt+N), `save-link` (Alt+L), `clip-selection` (Alt+S), `screenshot` (Alt+Shift+S)

## Packaging & download

- Zip the `extension/` folder to `public/quicknotes-extension.zip` using `nix run nixpkgs#zip`.
- Preview app (`src/pages/Index.tsx`): a clean landing card with QuickNotes branding, a **Download Extension** button (fetch+blob to bypass auth on static asset), and 4-step install instructions for `chrome://extensions` → Developer mode → Load unpacked.

## Out of scope

- No real cloud sync (the "Synced" badge is cosmetic, matching the reference). Storage is local only.
- No account / auth.
- No Chrome Web Store publishing (manual unpacked install).

