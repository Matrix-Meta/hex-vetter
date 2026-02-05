---
name: hex-vetter
version: 0.1.0
description: Physical-layer hex auditing for skills. Detects hidden binary data, control characters, and encoding-based attacks.
---

# Hex Vetter 🔬

Deep hex-level analysis of skill files to detect what text-based reviewers miss.

## Usage

```bash
node vet.js <file_path>
```

## What it detects

- **Null Bytes (00)**: Signs of binary injection or file padding.
- **Control Characters**: Hidden terminal sequences or Unicode directional overrides.
- **Non-ASCII Ratios**: Detects Base64 obfuscation or high-density encoded payloads.
