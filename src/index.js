const Imap = require('node-imap');
const fs = require('fs');
const express = require('express');
const http = require('http');
const path = require('path');
const { app, BrowserWindow, ipcMain } = require('electron');
// require('electron-reload')(__dirname)

const happ = express();
const server = http.createServer(happ);
const port = process.env.PORT || process.argv[3] || 9069;
const cfg = require('../config.json');
const e = require('express');

let IS_STARTED = false;

function init() {
	let imap = new Imap({
		user: cfg.imap.username,
		password: cfg.imap.password,
		host: cfg.imap.host,
		port: cfg.imap.port,
		tls: cfg.imap.tls
	});

	function openInbox(cb) {
		imap.openBox('INBOX', true, cb);
	}

	imap.once('ready', function () {
		openInbox(function (err, box) {
			if (err) throw err;
			imap.search([['SUBJECT', '[Uplink']], function (err, results) {
				if (err) throw err;
				var f = imap.fetch(results, { bodies: '' });
				f.on('message', function (msg, seqno) {
					msg.on('body', function (stream, info) {
						stream.pipe(fs.createWriteStream('./uplinks/' + seqno + '.uplinkmsg'));
					});
				});
				f.once('error', function (err) {
					console.log('Fetch error: ' + err);
				});
				f.once('end', function () {
					console.log('Done fetching all messages!');
					imap.end();
					if (!IS_STARTED) start();
				});
			});
		});
	});

	imap.once('error', function (err) {
		console.log(err);
	});

	imap.once('end', function () {
		console.log('IMAP closed');
	});

	imap.connect();
}

function start() {
	IS_STARTED = true;

	if (process.argv[2] !== 'headless') {
		app.whenReady().then(() => {
			startWindow();
		});

		app.on('window-all-closed', function () {
			if (process.platform !== 'darwin') app.quit()
		});
	}

	happ.get('/msgs', (req, res) => {
		init();
		const FILES = [];
		fs.readdirSync(path.resolve('./uplinks')).forEach(file => {
			if (file === '.gitkeep') return;
			FILES.push({
				id: file,
				content: fs.readFileSync(path.resolve('./uplinks/' + file)).toString()
			});
		})
		res.send({ FILES, END: cfg['header_end'] });
	})

	happ.post('/login', (req, res) => {
		if (!"hi" in req.headers || !"v" in req.headers || !"mo" in req.headers) { res.sendStatus({ bruh: "try again" }); return; }
		if (req.headers.hi === "HELLO!" && req.headers.v === '0.2.0' && req.headers.mo === 'gu mogu') {
			if (!"up" in req.headers) {
				res.send({ bruh: "youre missing auth" })
				return;
			}
			user = req.headers.up.split(':')[0];
			passwd = req.headers.up.split(':')[1];
			if (passwd !== cfg['passwd']) {
				res.send({ bruh: "passwd wrong" })
			} else {
				if (user === cfg['user']) {
					res.send({ bruh: "OK" })
				} else {
					res.send({ bruh: "user wrong" })
				}
			}
		}
	})
}

function startWindow() {
	const window = new BrowserWindow({
		width: 800,
		height: 600,
		minWidth: 800,
		minHeight: 600,
	})

	window.loadURL(`http://localhost:9069`)
}

init();

happ.use('/', express.static(path.resolve('./src/client')))

server.listen(port, () => {
	console.log('HTTP server started on port', port);
})