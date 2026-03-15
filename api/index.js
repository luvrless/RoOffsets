const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/luvrless/RoOffsets/main';
const GITHUB_API_COMMITS = 'https://api.github.com/repos/luvrless/RoOffsets/commits';

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
// We dynamically fetch the last 6 commits from the github repository to act as live "update logs"
app.get('/api/logs', async (req, res) => {
    try {
        const response = await axios.get(`${GITHUB_API_COMMITS}?per_page=6`);
        const commits = response.data;
        
        const logs = commits.map((commit, index) => {
            return {
                id: commit.sha,
                date: commit.commit.author.date,
                // Shorten the hash to act as the "version" ID for the UI
                version: `version-${commit.sha.substring(0, 16)}`,
                status: index === 0 ? 'Latest Offsets Update' : 'Previous Offsets Update'
            };
        });

        res.json(logs);
    } catch (error) {
        console.error("Error fetching logs from GitHub API:", error.message);
        res.status(500).json([]);
    }
});

// Since Vercel executes this as a serverless function, we export it rather than using app.listen
module.exports = app;
