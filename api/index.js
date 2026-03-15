const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/NtReadVirtualMemory/Roblox-Offsets-Website/main';
const GITHUB_API_COMMITS = 'https://api.github.com/repos/NtReadVirtualMemory/Roblox-Offsets-Website/commits';

// Utility function to seamlessly proxy files directly from the github raw text
const proxyFile = async (req, res, filename) => {
    try {
        const response = await axios.get(`${GITHUB_RAW_BASE}/${filename}`, { responseType: 'text' });
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.send(response.data);
    } catch (error) {
        console.error(`Error fetching ${filename}:`, error.message);
        res.status(500).send(`Error fetching ${filename}`);
    }
};

app.get('/api/offsets.hpp', (req, res) => proxyFile(req, res, 'offsets.hpp'));
app.get('/api/offsets_structured.hpp', (req, res) => proxyFile(req, res, 'offsets_structured.hpp'));
app.get('/api/offsets.json', (req, res) => proxyFile(req, res, 'offsets.json'));
app.get('/api/fflags.hpp', (req, res) => proxyFile(req, res, 'FFlags.hpp'));
app.get('/api/fflags.json', (req, res) => proxyFile(req, res, 'FFlags.json'));
app.get('/api/internal', (req, res) => proxyFile(req, res, 'internal-offsets.hpp'));
app.get('/api/version', (req, res) => proxyFile(req, res, 'version'));

// Serverless Dynamic Logs Endpoint
// Dynamically fetches the last 6 commits SPECIFICALLY made to the "version" file to track game updates.
app.get('/api/logs', async (req, res) => {
    try {
        const response = await axios.get(`${GITHUB_API_COMMITS}?path=version&per_page=6`);
        const commits = response.data;
        
        const logs = await Promise.all(commits.map(async (commit, index) => {
            let versionText = "Unknown Version";
            try {
                // Fetch the exact content of the "version" file at this specific commit in history!
                const rawRes = await axios.get(`https://raw.githubusercontent.com/NtReadVirtualMemory/Roblox-Offsets-Website/${commit.sha}/version`, { responseType: 'text' });
                versionText = String(rawRes.data).trim();
            } catch (err) {
                console.error("Failed to fetch historical version text:", err.message);
            }

            return {
                id: commit.sha,
                date: commit.commit.author.date,
                version: versionText,
                status: index === 0 ? 'Latest Offsets Update' : 'Previous Offsets Update'
            };
        }));

        res.json(logs);
    } catch (error) {
        console.error("Error fetching logs from GitHub API:", error.message);
        res.status(500).json([]);
    }
});

// Since Vercel executes this as a serverless function, we export it rather than using app.listen
module.exports = app;
