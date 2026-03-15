const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const { checkForUpdates } = require('./updater');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.get('/api/offsets.hpp', (req, res) => {
    res.sendFile(path.join(__dirname, 'data', 'offsets.hpp'));
});

app.get('/api/offsets_structured.hpp', (req, res) => {
    res.sendFile(path.join(__dirname, 'data', 'offsets_structured.hpp'));
});

app.get('/api/offsets.json', (req, res) => {
    res.sendFile(path.join(__dirname, 'data', 'offsets.json'));
});

app.get('/api/fflags.hpp', (req, res) => {
    res.sendFile(path.join(__dirname, 'data', 'fflags.hpp'));
});

app.get('/api/fflags.json', (req, res) => {
    res.sendFile(path.join(__dirname, 'data', 'fflags.json'));
});

app.get('/api/internal', (req, res) => {
    res.sendFile(path.join(__dirname, 'data', 'internal-offsets.hpp'));
});

app.get('/api/version', (req, res) => {
    try {
        const v = fs.readFileSync(path.join(__dirname, 'data', 'version.txt'), 'utf8');
        res.send(v);
    } catch {
        res.send("version-unknown");
    }
});

app.get('/api/logs', (req, res) => {
    try {
        const logs = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'logs.json'), 'utf8'));
        res.json(logs.slice(0, 6));
    } catch (e) {
        res.json([]);
    }
});

app.listen(PORT, () => {
    console.log(`[+] Custom Offsets API running on port ${PORT}`);
    checkForUpdates();
    setInterval(checkForUpdates, 900000);
});
