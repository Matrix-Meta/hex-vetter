const fs = require('fs');
const path = require('path');

function analyzeHex(filePath) {
    if (!fs.existsSync(filePath)) {
        console.error(`Error: File ${filePath} not found.`);
        return;
    }

    console.log(`=== Hex Analysis Report (JS) for: ${filePath} ===`);

    let data;
    try {
        data = fs.readFileSync(filePath);
    } catch (e) {
        console.error(`Error reading file: ${e.message}`);
        return;
    }

    const totalBytes = data.length;
    let nullBytesCount = 0;
    let controlCharsCount = 0;
    let nonAsciiCount = 0;

    for (let i = 0; i < totalBytes; i++) {
        const byte = data[i];
        if (byte === 0) nullBytesCount++;
        if (byte < 32 && ![9, 10, 13].includes(byte)) controlCharsCount++;
        if (byte > 126) nonAsciiCount++;
    }

    // Display first 256 bytes hex
    console.log(`\n[First 256 bytes in Hex]:`);
    const slice = data.slice(0, 256);
    let hexRow = "";
    for (let i = 0; i < slice.length; i++) {
        hexRow += slice[i].toString(16).padStart(2, '0') + " ";
        if ((i + 1) % 16 === 0) {
            console.log(hexRow.trim());
            hexRow = "";
        }
    }
    if (hexRow) console.log(hexRow.trim());
    if (totalBytes > 256) console.log("... (truncated)");

    // Report
    console.log(`\n[Metrics]:`);
    console.log(`- Total Size: ${totalBytes} bytes`);
    console.log(`- Null Bytes (00): ${nullBytesCount}`);
    console.log(`- Control Characters: ${controlCharsCount} (Suspicious if high)`);
    console.log(`- Non-ASCII Bytes: ${nonAsciiCount} (Possible obfuscation)`);

    // Verdict
    console.log(`\n[Verdict]:`);
    const nonAsciiRatio = totalBytes > 0 ? nonAsciiCount / totalBytes : 0;

    if (nullBytesCount > 0 || controlCharsCount > 0) {
        console.log("🔴 HIGH RISK: Binary embedding or suspicious control characters detected.");
    } else if (nonAsciiRatio > 0.1) {
        console.log("🟡 MEDIUM RISK: High ratio of non-ASCII characters. Check for encoding attacks.");
    } else {
        console.log("🟢 LOW RISK: File appears to be clean text.");
    }
    
    console.log("=".repeat(40));
}

const args = process.argv.slice(2);
if (args.length < 1) {
    console.log("Usage: node vet.js <file_path>");
} else {
    analyzeHex(args[0]);
}
