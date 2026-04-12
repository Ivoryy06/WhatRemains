const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const ROOT = __dirname;

const MIME = {
    '.html': 'text/html',
    '.css':  'text/css',
    '.js':   'application/javascript',
    '.png':  'image/png',
    '.json': 'application/json',
    '.jpg':  'image/jpeg',
    '.gif':  'image/gif',
    '.svg':  'image/svg+xml',
    '.ico':  'image/x-icon',
};

let clients = [];

const INJECT = `<script>const es=new EventSource('/__reload');es.onmessage=()=>location.reload()<\/script>`;

const server = http.createServer((req, res) => {
    if (req.url === '/__reload') {
        res.writeHead(200, {
            'content-type': 'text/event-stream',
            'cache-control': 'no-cache',
            'connection': 'keep-alive',
        });
        res.write('\n');
        clients.push(res);
        req.on('close', () => {
            clients = clients.filter(c => c !== res);
        });
        return;
    }

    let filepath = path.join(ROOT, req.url === '/' ? 'index.html' : req.url);
    filepath = filepath.split('?')[0];

    fs.readFile(filepath, (err, data) => {
        if (err) {
            res.writeHead(404);
            return res.end('Not Found');
        }

        const ext = path.extname(filepath);
        const mime = MIME[ext] || 'application/octet-stream';
        res.writeHead(200, { 'content-type': mime });

        if (ext === '.html') {
            data = Buffer.from(data.toString().replace('</body>', INJECT + '</body>'));
        }
        res.end(data);
    });
});

fs.watch(ROOT, { recursive: true }, (event, filename) => {
    if (!filename || filename.includes('node_modules')) return;
    console.log(`[reload] ${filename} changed`);
    clients.forEach(c => c.write('data: reload\n\n'));
});

server.listen(PORT, () => {
    console.log(`Server running -> http://localhost:${PORT}`);
});
