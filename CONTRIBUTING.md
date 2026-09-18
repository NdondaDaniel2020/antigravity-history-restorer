# Contributing & Building Antigravity History Restorer

Instructions for developers who want to build, package, or contribute to this extension locally.

---

## 🛠️ Development Setup

### 1. Prerequisites
- Node.js (v18 or higher)
- npm

### 2. Install Dependencies
```bash
npm install
```
*(Note: If working on an NTFS partition, add `--no-bin-links`: `npm install --no-bin-links`)*

### 3. Build & Watch
To compile the TypeScript code using esbuild:
```bash
npm run build
```

For continuous build during development:
```bash
npm run watch
```

---

## 📦 Packaging & Distribution

### 1. Package to `.vsix`
```bash
npx @vscode/vsce package --no-git-tag-version
```

### 2. Install Locally into Antigravity IDE
```bash
antigravity-ide --install-extension antigravity-history-restorer-*.vsix
```

### 3. Publish to Open VSX Registry
```bash
npx ovsx publish antigravity-history-restorer-*.vsix -p <YOUR_OVSX_ACCESS_TOKEN>
```
