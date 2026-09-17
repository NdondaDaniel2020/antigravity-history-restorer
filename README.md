# Antigravity History Restorer

Restore missing or unindexed AI chat conversations into **Antigravity IDE** after reinstallation, updates, or configuration wipes.

---

## 🌟 Features

- **1-Click Conversation Recovery:** Scans `~/.gemini/antigravity-ide/conversations/` and re-indexes all `.db` / `.pb` conversation files into the active IDE session.
- **Native & Automatic:** Dynamically detects the active Antigravity Language Server port and CSRF token.
- **Zero Configuration:** Works out of the box on Linux, macOS, and Windows.
- **Visual Progress:** Displays a real-time progress notification while waking up trajectories.

---

## 🚀 How to Use

1. Open **Antigravity IDE**.
2. Press `Ctrl + Shift + P` (or `Cmd + Shift + P` on macOS) to open the Command Palette.
3. Type and select:
   ```text
   Antigravity: Restore Missing Chats
   ```
4. Watch the progress notification restore your conversations.
5. Click the history clock icon (`🕒`) in the Agent sidebar or open **Search all convos...** to see all your conversations restored!

---

## 📦 Building & Publishing

### 1. Install Dependencies
```bash
npm install
```

### 2. Build the Extension
```bash
npm run build
```

### 3. Package to `.vsix`
```bash
npm run package
# or
npx @vscode/vsce package
```

### 4. Publish to Open VSX Registry
```bash
npx ovsx publish antigravity-history-restorer-0.1.0.vsix -p <YOUR_OVSX_TOKEN>
```

---

## 📄 License
MIT License.
