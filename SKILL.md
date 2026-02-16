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

## ⚠️ Security Policy

1. **Mandatory Review**: Any file flagged as 🔴 **HIGH RISK** MUST be manually inspected by a human or a trusted agent before the skill is used.
2. **False Positives**: Risk ratings are heuristic. Common false positives include `.env` mentions in `.npmignore` or documentation.
3. **Agent Action**: If an agent performs an audit and finds HIGH RISK, it MUST notify the user and provide the specific reason (e.g., signature match vs. binary data).
