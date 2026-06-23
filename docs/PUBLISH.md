# Publish Phoenix to GitHub

## 1. Push the marketing repo

```bash
cd /mnt/e/Business/phoenix-upscaler
git remote add origin https://github.com/thekillsquad007/phoenix-upscaler.git
git push -u origin main
```

## 2. Enable GitHub Pages

**Settings → Pages → Build and deployment → Source: GitHub Actions**

The site deploys automatically on push to `main` when `docs/` changes.

Live URL: **https://thekillsquad007.github.io/phoenix-upscaler/**

## 3. Create a GitHub Release (installers)

**Actions → Build Phoenix Upscaler → Run workflow** (builds Windows, Linux, macOS)

Or build locally:

```bash
python scripts/build_installer.py    # bundles AI models (~130 MB extra)
```

Upload artifacts from `dist/` to **Releases → New release → v0.6.0**:

| Upload as | File |
|---|---|
| Windows Setup | `PhoenixUpscaler-Setup-0.6.0.exe` |
| Linux AppImage | `PhoenixUpscaler-0.6.0-x86_64.AppImage` |
| Linux portable | `PhoenixUpscaler-0.6.0-linux-x64.tar.gz` |
| macOS | `PhoenixUpscaler-0.6.0.dmg` |

Name files to match download links in `docs/index.html`.

## 4. Gumroad

Point buyers to the GitHub Releases page and the live website. License keys flow unchanged via email.