const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function runSafeUpdate() {
    console.log("🔄 Starting Safe Update Protocol...");

    try {
        // 1. Git Pull
        console.log("📥 Pulling latest changes from Git...");
        const pullOutput = execSync('git pull', { encoding: 'utf8' });
        console.log(pullOutput);

        if (pullOutput.includes('Already up to date.')) {
            console.log("✅ Everything is already current.");
            return;
        }

        // 2. Find changed files
        console.log("🔍 Identifying changed skill files...");
        const changedFiles = execSync('git diff --name-only HEAD@{1} HEAD', { encoding: 'utf8' })
            .split('\n')
            .filter(f => f.startsWith('skills/') && fs.existsSync(f));

        if (changedFiles.length === 0) {
            console.log("ℹ️ No skill files were modified in this update.");
            return;
        }

        console.log(`\nDetected ${changedFiles.length} modified skill files:`);
        changedFiles.forEach(f => console.log(` - ${f}`));

        // 3. Run Hex Vetter on modified files
        console.log("\n🔬 Running Hex Analysis on updates...");
        const VETTER_BIN = path.join(__dirname, 'vet.js');
        changedFiles.forEach(f => {
            try {
                const output = execSync(`node "${VETTER_BIN}" "${f}"`, { encoding: 'utf8' });
                // We only show the summary/verdict to keep it clean
                const verdict = output.match(/\[Verdict\]:\n(.*?)\n/);
                console.log(`\n[${f}] Result: ${verdict ? verdict[1] : 'Unknown'}`);
            } catch (e) {
                console.error(`Error vetting ${f}: ${e.message}`);
            }
        });

        console.log("\n⚠️  ACTION REQUIRED:");
        console.log("If these changes are expected, run the following to update your security baseline:");
        console.log("node skills/hex-vetter/scan_all.js");

    } catch (error) {
        console.error(`❌ Update Failed: ${error.message}`);
        if (error.message.includes('conflict')) {
            console.log("\n🚨 MERGE CONFLICT DETECTED!");
            console.log("Please resolve the conflicts manually, then run 'node skills/hex-vetter/scan_all.js' to re-baseline.");
        }
    }
}

runSafeUpdate();
