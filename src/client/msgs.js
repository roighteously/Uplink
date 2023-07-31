const messages = {};
window.uplink.getMsg().then(res => {
	res.FILES.forEach(fileDat => {
		id = fileDat.id;
		content = fileDat.content;
		beforeSplitLen = content.split('\n').length;
		content = content.replace(/=\r\n/g, "")
		lenAfterSplit = content.split('\n').length;
		newLenAddable = Number(beforeSplitLen - lenAfterSplit);
		newLen = Number(Number(res.END) + newLenAddable);

		messages[id] = { subject: "", body: [] }
		const lines = content.split("\n")
		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			if (line.startsWith('Subject:')) {
				messages[id].subject = line.split('Subject: [Uplink, at ')[1].split(']')[0];
			}
			if (i > lenAfterSplit - 3) {
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
		const msg = document.createElement('div');
		const subj = document.createElement('h1');
		const bdy = document.createElement('p');
		subj.innerText = subject;
		// body.split('https://')[1].split(' ')[0];
		bdy.innerHTML = body;
		msg.className = 'msg';

		msg.appendChild(subj)
		msg.appendChild(bdy);

		document.querySelector('.flex').appendChild(msg);
	})
})