<div align="center">

<img src="https://raw.githubusercontent.com/NdondaDaniel2020/antigravity-history-restorer/main/icon.png" width="128" height="128" alt="Antigravity History Restorer Logo" />

# Antigravity History Restorer

**Instantly recover and re-index missing AI chat history in Google Antigravity IDE with 1 click.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Open VSX](https://img.shields.io/badge/Open%20VSX-available-purple.svg)](https://open-vsx.org/extension/NdondaDaniel2020/antigravity-history-restorer)
[![Platform](https://img.shields.io/badge/Platform-Linux%20%7C%20macOS%20%7C%20Windows-lightgrey.svg)](#)

</div>

---

## ⚡ Overview

Did your previous AI chats disappear after updating, reinstalling, or switching Antigravity IDE installations (e.g., Snap vs. Standalone)? 

**Your data is not lost.** Antigravity IDE safely persists all conversation trajectories as SQLite databases on disk (`~/.gemini/antigravity-ide/conversations/`), but the editor UI may drop them from its memory cache due to index resets, cache eviction, or transient disconnects.

**Antigravity History Restorer** automatically detects your active local Language Server and wakes up all persisted trajectories, re-indexing them directly into the editor interface in seconds.

---

## Features

- **1-Click Restoration:** Single command from the Command Palette restores your entire conversation history.
- **Auto-Detection:** Dynamically discovers the active Language Server PID, local listening port, and CSRF authentication token.
- **Real-Time Progress:** Native VS Code notification bar displays live restoration count and progress.
- **100% Local & Private:** All communication happens entirely on `127.0.0.1` via internal Connect-Protocol RPC. No data leaves your machine.
- **Cross-Platform:** Full out-of-the-box support for **Linux** (including Snap classic confinement), **macOS**, and **Windows**.

---

## How to Use

1. Open **Antigravity IDE**.
2. Open the Command Palette:
   - **Linux / Windows:** `Ctrl + Shift + P` (or `F1`)
   - **macOS:** `Cmd + Shift + P`
3. Type and run:
   ```text
   Antigravity: Restore Missing Chats
   ```
4. Watch the progress notification restore your conversations in the bottom-right corner.
5. Open the **Agent History** clock icon (`🕒`) or press `Search all convos...` — all your previous chats are back!

---

## How It Works Behind the Scenes

```
┌────────────────────────────────────────────────────────┐
│                   VS Code UI (Frontend)                 │
│  - Restores items in unified conversation picker       │
└───────────────────────────▲────────────────────────────┘
                            │
               Connect RPC (HTTP/POST on localhost)
               X-Codeium-Csrf-Token Authentication
                            │
┌───────────────────────────▼────────────────────────────┐
│      Antigravity Language Server (Daemon Process)      │
│  - Loads trajectory metadata into active memory cache  │
└───────────────────────────▲────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│            Persistent Local Storage (Disk)             │
│  ~/.gemini/antigravity-ide/conversations/*.db (SQLite) │
└────────────────────────────────────────────────────────┘
```

1. Scans `~/.gemini/antigravity-ide/conversations/` for all `.db` trajectory files.
2. Identifies the active Antigravity Language Server daemon and queries its listening ports.
3. Sends a lightweight `GetCascadeTrajectorySteps` activation request for each conversation ID.
4. The Language Server reads the database from disk, loads it into active state, and pushes a state-sync event to the IDE frontend.

---

## Privacy & Security

- **No External Network Calls:** The extension communicates exclusively with the local loopback interface (`127.0.0.1`).
- **No Data Collection:** Zero analytics, zero telemetry, and zero tracking.
- **Read-Only Wakeup:** The extension does not modify, delete, or overwrite your existing conversation databases.

---

## Frequently Asked Questions (FAQ)

<details>
<summary><b>Why did my conversations disappear in the first place?</b></summary>

Antigravity IDE stores actual conversation data in SQLite files on disk, but its frontend displays conversations from a separate UI cache (`state.vscdb`). When you reinstall the IDE, clear application caches, or when the editor evicts older chats to conserve memory, the UI cache is reset. The underlying files remain intact on disk.
</details>

<details>
<summary><b>Does this extension delete or overwrite my chat content?</b></summary>

**No.** It issues read-only initialization requests to the Language Server to reload existing trajectories into memory. Your files are never overwritten.
</details>

<details>
<summary><b>Does this work with both Snap and Standalone (.tar.gz) installs?</b></summary>

**Yes.** It has been tested and verified across both standard standalone installations and Ubuntu Snap classic confinement packages.
</details>

---

## License & Source Code

- **License:** [MIT License](LICENSE)
- **Source Code:** [GitHub Repository](https://github.com/NdondaDaniel2020/antigravity-history-restorer)
- **Issues & Feedback:** [GitHub Issues](https://github.com/NdondaDaniel2020/antigravity-history-restorer/issues)
