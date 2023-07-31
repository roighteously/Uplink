const Imap = require('node-imap');
const fs = require('fs');
const path = require('path');
const { app, BrowserWindow, ipcMain } = require('electron');
require('electron-reload')(__dirname)

const cfg = require('../config.json');

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
				});
			});
		});
	});
	
	imap.once('error', function (err) {
		console.log(err);
	});
	
	imap.once('end', function () {
		console.log('Got Uplink data');
		if (!IS_STARTED) start();
	});
	
	imap.connect();
}

function start() {
	IS_STARTED = true;

	app.whenReady().then(() => {
		ipcMain.handle('get_msg', async () => {
			const FILES = [];
			fs.readdirSync(path.resolve('./uplinks')).forEach(file => {
				if(file === '.gitkeep') return;
				FILES.push({
					id: file,
					content: fs.readFileSync(path.resolve('./uplinks/' + file)).toString()
				});
			})
			return {FILES, END: cfg['header_end']};
		})
		startWindow();
	});

	app.on('window-all-closed', function () {
		if (process.platform !== 'darwin') app.quit()
	});
}

function startWindow() {
	const window = new BrowserWindow({
		width: 800,
		height: 600,
		minWidth: 800,
		minHeight: 600,
		webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
	})

	window.loadFile(path.join(__dirname, "client/index.html"))
}

init();