const fs = require('fs');
const path = require('path');
const axios = require('axios');

const DATA_DIR = path.join(__dirname, 'data');

if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

if (!fs.existsSync(path.join(DATA_DIR, 'logs.json'))) {
    fs.writeFileSync(path.join(DATA_DIR, 'logs.json'), '[]');
}

const GITHUB_BASE_URL = 'https://raw.githubusercontent.com/NtReadVirtualMemory/Roblox-Offsets-Website/main';

const TRACKED_FILES = [
    { name: 'offsets.hpp', repoName: 'offsets.hpp' },
    { name: 'offsets_structured.hpp', repoName: 'offsets_structured.hpp' },
    { name: 'offsets.json', repoName: 'offsets.json' },
    { name: 'fflags.hpp', repoName: 'FFlags.hpp' },
    { name: 'fflags.json', repoName: 'FFlags.json' },
    { name: 'internal-offsets.hpp', repoName: 'internal-offsets.hpp' }
];

async function checkForUpdates() {
    console.log("[*] Checking for upstream offset updates...");
    
    try {
        const versionRes = await axios.get(`${GITHUB_BASE_URL}/version`, { responseType: 'text' });
        const latestVersion = versionRes.data.trim();
        
        const currentVersionPath = path.join(DATA_DIR, 'version.txt');
        let currentVersion = '';
        if (fs.existsSync(currentVersionPath)) {
            currentVersion = fs.readFileSync(currentVersionPath, 'utf8').trim();
        }

        if (latestVersion !== currentVersion) {
            console.log(`[!] NEW ROBLOX OFFSETS DETECTED! (${currentVersion} -> ${latestVersion})`);
            console.log("[*] Downloading latest offsets...");
            
            for (const file of TRACKED_FILES) {
                try {
                    const fileContent = await axios.get(`${GITHUB_BASE_URL}/${file.repoName}`, { responseType: 'text' });
                    fs.writeFileSync(path.join(DATA_DIR, file.name), fileContent.data);
                    console.log(`  -> Downloaded ${file.name}`);
                } catch (e) {
                    console.error(`  -> Failed to download ${file.name}: ${e.message}`);
                }
            }

            fs.writeFileSync(currentVersionPath, latestVersion);

            const logsPath = path.join(DATA_DIR, 'logs.json');
            let logs = [];
            if (fs.existsSync(logsPath)) {
                try {
                    logs = JSON.parse(fs.readFileSync(logsPath, 'utf8'));
                }catch(e){}
            }
            logs.unshift({
                id: Date.now(),
                date: new Date().toISOString(),
                version: latestVersion,
                status: 'Successfully Extracted & Saved'
            });
            logs = logs.slice(0, 6);
            fs.writeFileSync(logsPath, JSON.stringify(logs, null, 2));

            console.log("[+] Auto-update complete!");
        } else {
            console.log(`[-] Local provider is already up to date with version (${latestVersion}).`);
        }
    } catch (error) {
        console.error("[-] Error communicating with upstream offset provider:", error.message);
    }
}

module.exports = { checkForUpdates };
