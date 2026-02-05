const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SKILLS_DIR = path.join(__dirname, '..');
const AUDIT_DIR = path.join(__dirname, '../../security_audits');
const HEX_DUMPS_DIR = path.join(AUDIT_DIR, 'hex_dumps');
const VETTER_BIN = path.join(__dirname, 'vet.js');

function scanAllSkills() {
    console.log(`🚀 Starting Global Hex Audit for all skills in: ${SKILLS_DIR}`);
    
    if (!fs.existsSync(HEX_DUMPS_DIR)) {
        fs.mkdirSync(HEX_DUMPS_DIR, { recursive: true });
    }

    const skills = fs.readdirSync(SKILLS_DIR).filter(f => fs.statSync(path.join(SKILLS_DIR, f)).isDirectory());
    const report = [];

    skills.forEach(skill => {
        const skillPath = path.join(SKILLS_DIR, skill);
        const files = fs.readdirSync(skillPath).filter(f => f.endsWith('.md') || f.endsWith('.js') || f.endsWith('.py') || f.endsWith('.json'));

        console.log(`\nScanning skill: [${skill}] (${files.length} files)`);
        
        files.forEach(file => {
            const filePath = path.join(skillPath, file);
            const outputFileName = `${skill}_${file.replace(/\//g, '_')}.hex.txt`;
            const outputPath = path.join(HEX_DUMPS_DIR, outputFileName);

            try {
                // Run vet.js and capture output
                const auditOutput = execSync(`node "${VETTER_BIN}" "${filePath}"`, { encoding: 'utf8' });
                
                // Write the full hex dump and report to a central location
                fs.writeFileSync(outputPath, auditOutput);
                
                // Extract verdict for the summary
                const verdictMatch = auditOutput.match(/\[Verdict\]:\n(.*?)\n/);
                const verdict = verdictMatch ? verdictMatch[1].trim() : "Unknown";
                
                report.push({ skill, file, verdict, reportPath: outputPath });
                
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
    summaryContent += `| Skill | File | Verdict | Report |\n|-------|------|---------|--------|\n`;
    report.forEach(r => {
        summaryContent += `| ${r.skill} | ${r.file} | ${r.verdict} | [View Hex](${path.relative(AUDIT_DIR, r.reportPath)}) |\n`;
    });

    fs.writeFileSync(summaryPath, summaryContent);
    console.log(`\n✨ Audit Complete! Summary written to: ${summaryPath}`);
}

scanAllSkills();
