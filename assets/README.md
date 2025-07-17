# Assets Directory

This directory contains various assets used by the GA Bot.

## Directory Structure

```
assets/
├── images/          # Bot images, avatars, backgrounds
├── fonts/           # Custom fonts for image generation
├── temp/            # Temporary files (auto-cleaned)
├── data/            # Static data files
└── README.md        # This file
```

## Usage

### Images
- Place bot avatars, welcome images, and other graphics here
- Supported formats: PNG, JPG, GIF, WebP
- Recommended sizes:
  - Avatar: 512x512px
  - Welcome banner: 1200x400px
  - Thumbnails: 256x256px

### Fonts
- Place custom fonts for text rendering
- Supported formats: TTF, OTF
- Used for generating images with text

### Temp
- Automatically managed temporary files
- Downloaded images, generated content
- Cleaned up periodically by the bot

### Data
- Static data files (JSON, CSV, etc.)
- Configuration templates
- Language packs

## File Naming Convention

- Use lowercase with hyphens: `welcome-banner.png`
- Include size in filename if multiple sizes: `avatar-512.png`
- Use descriptive names: `error-icon.png` not `img1.png`

## Adding New Assets

1. Place files in appropriate subdirectory
2. Update any relevant configuration files
3. Test that the bot can access the files
4. Document usage in command/event files

## Auto-cleanup

The temp/ directory is automatically cleaned:
- Files older than 24 hours are removed
- Maximum 100MB total size limit
- Runs every hour when bot is active
