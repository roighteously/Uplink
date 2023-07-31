const Imap = require('node-imap');

const cfg = require('../config.json');
const fs = require('fs')

var imap = new Imap({
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
					stream.pipe(fs.createWriteStream('msg-' + seqno + '-body.txt'));
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
	start();
});

imap.connect();

function start() {

}