import sys
import os

def analyze_hex(file_path):
    if not os.path.exists(file_path):
        print(f"Error: File {file_path} not found.")
        return

    print(f"=== Hex Analysis Report for: {file_path} ===")
    
    try:
        with open(file_path, 'rb') as f:
            data = f.read()
    except Exception as e:
        print(f"Error reading file: {e}")
        return

    total_bytes = len(data)
    non_ascii_count = 0
    control_chars_count = 0
    null_bytes_count = 0
    
    # Statistics
    for byte in data:
        if byte == 0:
            null_bytes_count += 1
        if byte < 32 and byte not in [9, 10, 13]: # Not TAB, LF, CR
            control_chars_count += 1
        if byte > 126:
            non_ascii_count += 1

    # Display first 256 bytes hex
    print(f"\n[First 256 bytes in Hex]:")
    hex_dump = " ".join(f"{b:02x}" for b in data[:256])
    for i in range(0, len(hex_dump), 48):
        print(hex_dump[i:i+48])
    
    if total_bytes > 256:
        print("... (truncated)")

    # Report
    print(f"\n[Metrics]:")
    print(f"- Total Size: {total_bytes} bytes")
    print(f"- Null Bytes (00): {null_bytes_count}")
    print(f"- Control Characters: {control_chars_count} (Suspicious if high)")
    print(f"- Non-ASCII Bytes: {non_ascii_count} (Possible obfuscation)")

    # Verdict
    print(f"\n[Verdict]:")
    if null_bytes_count > 0 or control_chars_count > 0:
        print("🔴 HIGH RISK: Binary embedding or suspicious control characters detected.")
    elif (non_ascii_count / total_bytes > 0.1) if total_bytes > 0 else 0:
        print("🟡 MEDIUM RISK: High ratio of non-ASCII characters. Check for encoding attacks.")
    else:
        print("🟢 LOW RISK: File appears to be clean text.")
    
    print("=" * 40)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python vet.py <file_path>")
    else:
        analyze_hex(sys.argv[1])
