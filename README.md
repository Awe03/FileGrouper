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

## Updates

We respect your privacy. File Grouper does not query for updates.

To stay notified of new releases:
- Star/Watch this repo on GitHub, or
- Subscribe to the [releases feed](https://github.com/Awe03/FileGrouper/releases.atom)

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
