# Node.js Setup (Offline / Portable Strategy)

Because the environment currently lacks a global Node.js installation and `npm`/`yarn` are unavailable, follow one of these approaches locally:

## 1. Recommended (Install Node.js Normally)
Download LTS installer from: https://nodejs.org/en/download
Then run:
```
npm ci
npm run dev
```

## 2. Portable Extraction Method (If Installer Not Allowed)
1. Download ZIP (example for v20.x):
   https://nodejs.org/dist/v20.11.0/node-v20.11.0-win-x64.zip
2. Extract into `frontend/.portable-node`
3. Add to PATH for this session:
   ```powershell
   $env:Path = (Resolve-Path .portable-node\node-v20.11.0-win-x64).Path + ';' + $env:Path
   node --version
   ```
4. Install deps:
   ```powershell
   .portable-node\node-v20.11.0-win-x64\node.exe .portable-node\node-v20.11.0-win-x64\node_modules\npm\bin\npm-cli.js install
   ```

## 3. If `npm` Folder Missing Inside Portable Zip
Run once to initialize corepack (only if present):
```
node corepack enable
```
Otherwise manually download npm bundle (not covered here for brevity).

## 4. TypeScript Editor Errors Before Installing Deps
The current red squiggles ("Cannot find module 'react'") stem from missing `node_modules`. Once dependencies are installed they disappear.

## 5. Version Alignment Changes Made
- Moved `@types/react-dom` to devDependencies
- Aligned `@types/react` / `@types/react-dom` to React 18 versions
- Added `engines.node >= 18.17.0`

## 6. Clean Reinstall After You Obtain Node
```powershell
# From frontend directory
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item package-lock.json -ErrorAction SilentlyContinue
npm install
npm run dev
```

## 7. Troubleshooting
| Symptom | Fix |
|---------|-----|
| Still sees type errors | Ensure `node_modules` exists and VS Code TypeScript server restarted |
| Wrong React types (19.x) | Delete lock file, reinstall |
| Tailwind classes not working | Ensure `postcss`, `tailwindcss` installed & `npm run dev` running |
| ESLint failing on import | Confirm correct relative paths and that `moduleResolution: bundler` is OK (Next 14) |

---
Once Node is installed properly, run:
```powershell
npm install
npm run dev
```
Then navigate to http://localhost:3000
