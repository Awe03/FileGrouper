# File Grouper

[![Build](https://github.com/Awe03/FileGrouper/actions/workflows/build.yml/badge.svg)](https://github.com/Awe03/FileGrouper/actions/workflows/build.yml)
[![Release](https://github.com/Awe03/FileGrouper/actions/workflows/release.yml/badge.svg)](https://github.com/Awe03/FileGrouper/actions/workflows/release.yml)

A simple file browser that groups files by common prefixes.

## Overview

Groups files with similar names together for easier browsing:

-   `Lotus1.mp4`, `Lotus2.mp4`, `Lotus3.mp4` → **Lotus** (3 files)
-   `Rose-A.mp4`, `Rose-B.mp4` → **Rose** (2 files)

Click to expand groups, click files to open with default app.

## Features

-   Auto groups files by longest common prefix
-   Supports all file types (videos, images, documents)
-   Supports backward and forward navigation using mouse side buttons (tested with a G502 Hero)
-   Clean, minimal UI
-   No analytics or advertising

## Installation

### Linux (Ubuntu / Debian)

Download the `.deb` file from [Releases](https://github.com/Awe03/FileGrouper/releases)
Run

```bash
sudo dpkg -i File.Grouper_<version>_amd64.deb
```

Or use the AppImage (no installation required):

```bash
chmod +x File.Grouper_<version>_amd64.AppImage
./File.Grouper_<version>_amd64.AppImage
```

### Windows

Download the .exe / .msi installer from [Releases](https://github.com/Awe03/FileGrouper/releases) and run it.

### macOS (Apple Silicon Only)

Download `File.Grouper_<version>_aarch64.dmg` from [Releases](https://github.com/Awe03/FileGrouper/releases)

1. Open the .dmg
2. Drag `File Grouper.app` to Applications
3. Remove the quarantine flag (one-time fix):
```bash
   xattr -cr "/Applications/File Grouper.app"
```

4. Launch the app

**Note:** Intel Macs are not currently supported. Build from source or open an Issue to request Intel builds. macOS blocks unsigned apps by default, the `xattr` command bypasses this (I cannot afford an Apple Developer certificate).

## Updates

We respect your privacy. File Grouper does not query for updates.

To stay notified of new releases:

-   Star/Watch this repo on GitHub, or
-   Subscribe to the [releases feed](https://github.com/Awe03/FileGrouper/releases.atom)

## Build from source

```bash
# Install dependencies
pnpm install

# Development
pnpm run tauri dev

# Production build
pnpm run tauri build
```

## License

This project is licensed under the AGPL-3.0 License - see the LICENSE file for details.
This repository is not available for use in training AI models, machine learning systems, or similar technologies without explicit permission from the author(s).
