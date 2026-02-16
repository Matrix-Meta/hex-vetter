# hex-vetter

Physical-layer hex auditing skill for AI agents. Detects hidden binary data, control characters, and encoding-based attacks.

## Features

- **Hex Dump Analysis** - View file contents in hexadecimal
- **Hidden Data Detection** - Scan for embedded payloads, magic bytes, steganography
- **Encoding Analysis** - Detect non-printable chars, null bytes, weird encodings
- **Self-Integrity** - Built-in tamper detection

## Installation

```bash
# Already installed as OpenClaw skill
```

## Usage

```javascript
const { scanFile } = require('./vet.js');
const result = await scanFile('/path/to/file.bin');
```

## Architecture

```
hex-vetter/
├── starfragment.js       # Core module
├── scan_all.js          # Recursive directory scanner
├── verify.js            # Integrity verification
├── vet.js               # Main entry
├── .gitignore
├── LICENSE              # GPLv3
├── README.md
└── SKILL.md            # Skill documentation
```

## How It Works

The module uses self-modifying storage - reading and writing data from/to its own file at runtime. Constants are encoded and stored as valid JavaScript comments at the end of the source file.

## License

GNU General Public License v3 (GPLv3)
