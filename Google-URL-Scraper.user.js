// ==UserScript==
// @name         Google URL Parser
// @version      1.0
// @homepage        https://github.com/mtfy
// @homepageURL     https://github.com/mtfy
// @description  Scrape raw URLs from Google Search results
// @author       mtfy
// @require      https://cdnjs.cloudflare.com/ajax/libs/clipboard.js/2.0.8/clipboard.min.js
// @match        *www.google.com/*
// @icon         https://icons.duckduckgo.com/ip2/google.com.ico
// @grant        none
// @run-at          document-end
// ==/UserScript==

(async() => {
	async function removeImageResults() {
		const rso = document.getElementById('rso');
		if ( rso !== null ) {
			if (rso.children.length) {
				rso.children[0].remove();
			}
		}
	}

    async function getURIs() {
		await removeImageResults();
		const a = document.querySelectorAll('div>div>div>a[href][data-ved][ping][target="_blank"][rel="noopener"]');
		if ( a.length && a[0] !== null) {
			var r = '';
			for (var i = 0; i != a.length; ++i) {
				if (a[i] !== null && typeof a[i] !== 'undefined') {
					let url = decodeURIComponent(a[i].ping.replace(/^\/url\?(?:.*)?url=/g, '').replace(/(?:&ved=[A-Za-z0-9_-]{10,60})?(?:&cshid=[0-9]*)?$/g, '').trim());//a[i].ping.replace(/^\/url\?(?:.*)?url=/g, '').replace(/(?:&ved=[A-Za-z0-9]{10,60}&cshid=[0-9]*)?/g, '');
					a[i].ping = '';
					a[i].href = url;
					a[i].dataset.ved = '';
					r += `${url}\n`;
					const t = a[i].getAttribute('target');
					if (t !== null && t !== '_blank')
					{
						a[i].target = '_blank';
					}
					let div = a[i].parentElement.parentElement.parentElement.parentNode;
					div.dataset.ved = '';
					div.dataset.hveid = '';
					div.dataset.jscontroller = '';
					div.dataset.jsaction = '';

					setTimeout(() => {
						try {
							var old_div = document.querySelector('div#rso div#search>div');
							if ( old_div !== null )
							{
								old_div.dataset.hveid = '';
								old_div.dataset.ved = '';
								const new_div = old_div.cloneNode(true);
								old_div.parentNode.replaceChild(new_div, old_div);
							}
						} catch (err) {
							console.error(`[SCRIPT]\t"${err}"`);
						}
					}, 301);

				}
			}
			if ( r !== '' ) {
				await f_text(r);
			}
		}
	}

	async function f_text(txt) {
		const textarea = document.createElement('textarea'), div = document.createElement('div'), button = document.createElement('button');
		div.classList.add('appbar');
		div.classList.add('mtfy__appbar');
		div.dataset.st_cnt = 'top';
		const code = `.mtfy__appbar button { margin-top: .35em; font-size: 10px; padding: 6px 8px; font-family: 'Verdana', sans-serif; font-size: 14px; border: 1px solid #454545; border-radius: 7px; }.mtfy__appbar { display:block !important;margin-bottom:2.3em;width: 60%; height: 240px !important; } .mtfy__txt { width: 100%; height: 195px !important; font-family: monospace, auto; !important; display:block !important; background: #00000025; padding: 8px; border: 1px solid #444; border-radius: 14px; font-size: 12px; } `, css = document.createElement('style');
		css.innerText = code;
		document.getElementsByTagName('head')[0].appendChild(css);
		textarea.classList.add('mtfy__txt');
		textarea.textContent = txt;
		textarea.id = 'mtfy__urls';
		div.appendChild(textarea);
		button.dataset.clipboardAction = 'copy';
		button.dataset.clipboardTarget = '#mtfy__urls';
		button.innerText = 'Copy to clipboard';
		var clipBoard = new ClipboardJS(button);
		clipBoard.on('success', function (e) {
			console.log(`[Clipboard.js]\tCopied to clipboard!`);
		});
	
		clipBoard.on('error', function (e) {
			console.error(`[Clipboard.js]\t"${e.toString()}"`);
		});
		textarea.parentNode.insertBefore(button, textarea.nextSibling);
		const appbar = document.querySelector('div.appbar#appbar');
		if (appbar !== null) {
			appbar.parentNode.insertBefore(div, appbar.nextSibling);
		}
		/*setTimeout(() => {
			const s = document.createElement('script');
			s.type = 'text/javascript';
			s.referrerPolicy = 'no-referrer';
			s.integrity = 'sha512-sIqUEnRn31BgngPmHt2JenzleDDsXwYO+iyvQ46Mw6RL+udAUZj2n/u/PGY80NxRxynO7R9xIGx5LEzw4INWJQ==';
			s.crossOrigin = 'anonymous';
			s.src = 'https://cdnjs.cloudflare.com/ajax/libs/clipboard.js/2.0.8/clipboard.min.js';
			document.getElementsByTagName('body')[0].appendChild(s);
			setTimeout(() => {
				var clipBoard = new ClipboardJS(document.getElementById('mtfy__urls'));
				clipBoard.on('success', function (e) {
					console.log(`[Clipboard.js]\tCopied to clipboard!`);
				});
			
				clipBoard.on('error', function (e) {
					console.error(`[Clipboard.js]\t"${e.toString()}"`);
				});
			}, 1000);
		}, 10);*/
	}

	await getURIs();

})();