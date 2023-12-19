function sortMessages() {
	const messages = {};
	document.querySelector('.flex').innerHTML = `<div class="msg">
	<h1 id="title">
		Uplink
	</h1>
	<p>The missing link between desktop and phone.</p>
	<p>v0.2.0</p>
	<button onclick="sortMessages()">Get new messages</button>
	<button onclick="window.location.href = '/'">Reload</button>
	</div>`
	fetch('/msgs').then(res=>res.json()).then(res => {
		res.FILES.forEach(fileDat => {
			id = fileDat.id;
			content = fileDat.content;
			headers = content.split('=3DENDHEADERS')[0];
			msgcontent = content.split('=3DENDHEADERS')[1];
			uplink_m_ver = content.split('+META=3Dv:')[1].split('+')[0];
			uplink_proc_data = content.split('+UPLINKDATA=')[1];
			console.log(headers)
			messages[id] = { subject: "", body: [] }
			const lines = headers.split("\n")
			for (let i = 0; i < lines.length; i++) {
				let line = lines[i];
				if (line.startsWith('Subject:')) {
					messages[id].subject = line.split('Subject: [Uplink, at ')[1].split(']')[0];
				}
			}
			const msgline = msgcontent.split("\n")
			for (let i = 0; i < msgline.length; i ++) {
				console.log(line)
				let line = lines[i];
				if (line.includes('https://')) {
					link = line.split('https://')[1].split(' ')[0];
					line = `<a href="https://${link}" target="_blank">https://${link}</a>`
				}
				if (line.includes('.jpeg') || line.includes('.jpg') || line.includes('.gif') || line.includes('.png')) {
					link = line.split('https://')[1].split(' ')[0];
					line = `<img src="https://${link}" alt="Uplink Image">`
				}
				messages[id].body.push(line.trim());
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
}
sortMessages();