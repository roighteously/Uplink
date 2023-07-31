const messages = {};
window.uplink.getMsg().then(res => {
	res.FILES.forEach(fileDat => {
		id = fileDat.id;
		content = fileDat.content;
		messages[id] = { subject: "", body: [] }
		const lines = content.split("\n")
		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			if (line.startsWith('Subject:')) {
				messages[id].subject = line.split('Subject: [Uplink, at ')[1].split(']')[0];
			}
			if (i > res.END) {
				if (line !== '') {
					messages[id].body.push(line.trim());
				}
			}
		}
	})
}).finally(() => {
	let subject;
	let body;
	Object.keys(messages).forEach(msgID => {
		subject = messages[msgID].subject;
		body = messages[msgID].body.join('<br>');
		console.log(messages[msgID])
		const msg = document.createElement('div');
		const subj = document.createElement('h1');
		const bdy = document.createElement('p');
		subj.innerText = subject;
		bdy.innerHTML = body;

		msg.appendChild(subj)
		msg.appendChild(bdy);

		document.body.appendChild(msg);
	})
})