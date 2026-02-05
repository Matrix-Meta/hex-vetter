const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const crypto = require('crypto');

const SKILLS_DIR = path.join(__dirname, '..');
const AUDIT_DIR = path.join(__dirname, '../../security_audits');
const HEX_DUMPS_DIR = path.join(AUDIT_DIR, 'hex_dumps');
const VETTER_BIN = path.join(__dirname, 'vet.js');

function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);
    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function(file) {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file !== '.git' && file !== 'node_modules') {
                arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
            }
        } else {
            arrayOfFiles.push(fullPath);
        }
    });

    return arrayOfFiles;
}

function getHashes(data) {
    const sha256 = crypto.createHash('sha256').update(data).digest('hex');
    const md5 = crypto.createHash('md5').update(data).digest('hex');
    return { sha256, md5 };
}

function scanAllSkills() {
    console.log(`🚀 Starting Global DEEP Hex Audit for all skills in: ${SKILLS_DIR}`);
    
    if (!fs.existsSync(HEX_DUMPS_DIR)) {
        fs.mkdirSync(HEX_DUMPS_DIR, { recursive: true });
    }

    const skills = fs.readdirSync(SKILLS_DIR).filter(f => fs.statSync(path.join(SKILLS_DIR, f)).isDirectory());
    const report = [];

    skills.forEach(skill => {
        const skillPath = path.join(SKILLS_DIR, skill);
        
        // DEEP SCAN: Every single file except .git and node_modules
        const allFiles = getAllFiles(skillPath);

        console.log(`\nScanning skill: [${skill}] (${allFiles.length} files total)`);
        
        allFiles.forEach(filePath => {
            const relativePath = path.relative(skillPath, filePath);
            const outputFileName = `${skill}_${relativePath.replace(/[\/\\]/g, '_')}.hex.txt`;
            const outputPath = path.join(HEX_DUMPS_DIR, outputFileName);

            try {
                // Run vet.js and capture output
                const auditOutput = execSync(`node "${VETTER_BIN}" "${filePath}"`, { encoding: 'utf8' });
                
                // Calculate Hashes of the SOURCE file
                const sourceData = fs.readFileSync(filePath);
                const hashes = getHashes(sourceData);
                
                // Final metadata for self-verification
                const metaHeader = `SOURCE_FILE: ${filePath}\nSHA256: ${hashes.sha256}\nMD5: ${hashes.md5}\n`;
                const selfHash = crypto.createHash('sha256').update(metaHeader + auditOutput).digest('hex');
                
                // Prepend report with hashes and a self-integrity signature
                const fullReport = `${metaHeader}SELF_SIGNATURE: ${selfHash}\n\n${auditOutput}`;
                
                // Write the full hex dump and report to a central location
                fs.writeFileSync(outputPath, fullReport);
                
                // Extract verdict for the summary
                const verdictMatch = auditOutput.match(/\[Verdict\]:\n(.*?)\n/);
                const verdict = verdictMatch ? verdictMatch[1].trim() : "Unknown";
                
                report.push({ 
                    skill, 
                    file: relativePath, 
                    verdict, 
                    reportPath: outputPath,
                    sha256: hashes.sha256,
                    md5: hashes.md5
                });
                
                if (verdict.includes('HIGH') || verdict.includes('MEDIUM')) {
                    console.log(`⚠️  ${verdict}: ${skill}/${relativePath}`);
                } else {
                    console.log(`✅ Clean: ${skill}/${relativePath}`);
                }
            } catch (err) {
                console.error(`❌ Error auditing ${skill}/${relativePath}: ${err.message}`);
            }
        });
    });

    // Create a master summary
    const summaryPath = path.join(AUDIT_DIR, 'audit_summary.md');
    let summaryContent = `# Global DEEP Skill Audit Summary\nGenerated on: ${new Date().toISOString()}\n\n`;
    summaryContent += `| Skill | File | Verdict | SHA256 (Source) | MD5 (Source) | Report |\n|-------|------|---------|-----------------|-------------|--------|\n`;
    report.forEach(r => {
        summaryContent += `| ${r.skill} | ${r.file} | ${r.verdict} | \`${r.sha256.substring(0,8)}...\` | \`${r.md5}\` | [View Hex](${path.relative(AUDIT_DIR, r.reportPath)}) |\n`;
    });

    fs.writeFileSync(summaryPath, summaryContent);
    console.log(`\n✨ Deep Audit Complete! Summary written to: ${summaryPath}`);
    console.log(`📂 All ${report.length} file hex dumps consolidated in: ${HEX_DUMPS_DIR}`);
}

scanAllSkills();
