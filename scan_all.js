const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const crypto = require('crypto');

const SKILLS_DIR = path.join(__dirname, '..');
const AUDIT_DIR = path.join(__dirname, '../../security_audits');
const HEX_DUMPS_DIR = path.join(AUDIT_DIR, 'hex_dumps');
const VETTER_BIN = path.join(__dirname, 'vet.js');

function getHashes(data) {
    const sha256 = crypto.createHash('sha256').update(data).digest('hex');
    const md5 = crypto.createHash('md5').update(data).digest('hex');
    return { sha256, md5 };
}

function scanAllSkills() {
    console.log(`🚀 Starting Global Hex Audit for all skills in: ${SKILLS_DIR}`);
    
    if (!fs.existsSync(HEX_DUMPS_DIR)) {
        fs.mkdirSync(HEX_DUMPS_DIR, { recursive: true });
    }

    const skills = fs.readdirSync(SKILLS_DIR).filter(f => fs.statSync(path.join(SKILLS_DIR, f)).isDirectory());
    const report = [];

    skills.forEach(skill => {
        const skillPath = path.join(SKILLS_DIR, skill);
        // Scrutinize only core files to keep dumps meaningful
        const files = fs.readdirSync(skillPath).filter(f => 
            f === 'SKILL.md' || f.endsWith('.js') || (f.endsWith('.py') && !f.startsWith('test_')) || f === 'package.json'
        );

        console.log(`\nScanning skill: [${skill}] (${files.length} files)`);
        
        files.forEach(file => {
            const filePath = path.join(skillPath, file);
            const outputFileName = `${skill}_${file.replace(/\//g, '_')}.hex.txt`;
            const outputPath = path.join(HEX_DUMPS_DIR, outputFileName);

            try {
                // Run vet.js and capture output
                const auditOutput = execSync(`node "${VETTER_BIN}" "${filePath}"`, { encoding: 'utf8' });
                
                // Calculate Hashes of the SOURCE file (before we dump it)
                const sourceData = fs.readFileSync(filePath);
                const hashes = getHashes(sourceData);
                
                // Prepended report with hashes
                const fullReport = `FILE_HASHES:\nSHA256: ${hashes.sha256}\nMD5: ${hashes.md5}\n\n${auditOutput}`;
                
                // Write the full hex dump and report to a central location
                fs.writeFileSync(outputPath, fullReport);
                
                // Extract verdict for the summary
                const verdictMatch = auditOutput.match(/\[Verdict\]:\n(.*?)\n/);
                const verdict = verdictMatch ? verdictMatch[1].trim() : "Unknown";
                
                report.push({ 
                    skill, 
                    file, 
                    verdict, 
                    reportPath: outputPath,
                    sha256: hashes.sha256,
                    md5: hashes.md5
                });
                
                if (verdict.includes('HIGH') || verdict.includes('MEDIUM')) {
                    console.log(`⚠️  ${verdict}: ${skill}/${file}`);
                } else {
                    console.log(`✅ Clean: ${skill}/${file}`);
                }
            } catch (err) {
                console.error(`❌ Error auditing ${skill}/${file}: ${err.message}`);
            }
        });
    });

    // Create a master summary
    const summaryPath = path.join(AUDIT_DIR, 'audit_summary.md');
    let summaryContent = `# Global Skill Audit Summary\nGenerated on: ${new Date().toISOString()}\n\n`;
    summaryContent += `| Skill | File | Verdict | SHA256 (Source) | MD5 (Source) | Report |\n|-------|------|---------|-----------------|-------------|--------|\n`;
    report.forEach(r => {
        summaryContent += `| ${r.skill} | ${r.file} | ${r.verdict} | \`${r.sha256.substring(0,8)}...\` | \`${r.md5}\` | [View Hex](${path.relative(AUDIT_DIR, r.reportPath)}) |\n`;
    });

    fs.writeFileSync(summaryPath, summaryContent);
    console.log(`\n✨ Audit Complete! Summary written to: ${summaryPath}`);
    console.log(`📂 All Hex Dumps consolidated in: ${HEX_DUMPS_DIR}`);
}

scanAllSkills();
