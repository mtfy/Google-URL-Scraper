// ==UserScript==
// @name         Google URL Scraper
// @version      1.1
// @homepage     https://github.com/mtfy/Google-URL-Scraper
// @homepageURL  https://github.com/mtfy/Google-URL-Scraper
// @description  Scrape raw URLs from Google Search results
// @author       mtfy
// @require      https://cdnjs.cloudflare.com/ajax/libs/clipboard.js/2.0.8/clipboard.min.js
// @match        *www.google.com/*
// @icon         https://icons.duckduckgo.com/ip2/google.com.ico
// @grant        none
// @run-at       document-end
// @copyright    2022 mtfy
// @supportURL   https://github.com/mtfy/Google-URL-Scraper/issues
// @updateURL    https://github.com/mtfy/Google-URL-Scraper/raw/main/Google-URL-Scraper.user.js
// @downloadURL  https://github.com/mtfy/Google-URL-Scraper/raw/main/Google-URL-Scraper.user.js
// ==/UserScript==

(async() => {

	console.clear();

	const logger__prefix = atob('WyBnaXRodWIuY29tL210ZnkgXQ==') + '\t';
	var ls_timer = null;

	function isUrlEncoded(uri) {
		if ( typeof uri !== 'string')
			return false;

		var e = uri;
		try {
			e = decodeURIComponent(e);
		} catch (e) {}

		return ( e !== uri );
	}

	async function removeLocalStorageJunk() {
		if (window !== null) {
			if (window.hasOwnProperty('localStorage') && window.localStorage !== null && 'undefined' !== typeof window.localStorage) {
				const ls = [
					'sb_wiz.zpc.gws-wiz-serp.',
					'_grecaptcha'
				];

				if ( ls_timer === null) {
					ls_timer = setInterval(() => {
						if (!ls.length) {
							clearInterval(ls_timer);
							return;
						}
						for (let i = 0; i != ls.length; ++i) {
							let item = ls[i].trim();
							if (localStorage.getItem(item) !== null) {
								localStorage.removeItem(item);
								console.log(`${logger__prefix}Removed item "${item}" from window.localStorage`);
							}
						}
					}, 665);
				}
			}
		}
	}

	async function removeTrackingEventListeners() {
		setTimeout(() => {
			try {
				const selector = 'div#search>div', old_div = document.querySelector(selector);
				if ( old_div !== null )
				{
					old_div.dataset.hveid = '';
					old_div.dataset.ved = '';
					const new_div = old_div.cloneNode(true);
					old_div.parentNode.replaceChild(new_div, old_div);
					console.log(`${logger__prefix}Removed all event listeners for CSS selector:\t"${selector}"`);
				} else {
					console.log(`\n${logger__prefix}Unable to find CSS selector:\t"${selector}"\n${logger__prefix}Skipping...\n`);
				}
			} catch (err) {
				console.error(`${logger__prefix}"${err.toString()}"`);
			}
		}, 301);
	}

	async function removeImageResults() {
		const rso = document.getElementById('rso');
		if ( rso !== null ) {
			if (rso.children.length) {
				rso.children[0].remove();
			}
		}
	}

	async function removePeopleSearchForBox() {
		const div = document.querySelector('#rso div>div>div[data-initq]');
		if ( div !== null ) {
			div.remove();
			return true;
		}
		return false;
	}

    async function getURIs() {
		//await removeImageResults();
		await removePeopleSearchForBox();
		const a = document.querySelectorAll('#search div>div>div>a[href]');
		if ( a.length && a[0] !== null) {
			var r = '';
			for (var i = 0; i != a.length; ++i) {
				if (a[i] !== null && typeof a[i] !== 'undefined') {
					var url = '';
					if (a[i].getAttribute('ping') !== null) {
						url = url
							.replace(/^\/url\?(?:.*)?url=/g, '')
							.replace(/(?:&ved=[A-Za-z0-9_-]{10,60})?(?:&cshid=[0-9]*)?$/g, '')
							.trim();

						console.log(`${logger__prefix}Parsed attribute "ping"`);
					} else if (a[i].getAttribute('href') !== null) {
						url = a[i].href.trim();
						console.log(`${logger__prefix}Extracted attribute "href"`);
					} else {
						console.log(`${logger__prefix}Unable to find any of the following attributes ["ping", "href"]. Skipping...`);
						continue;
					}

					if ( isUrlEncoded(url) ) {
						url = decodeURIComponent(url);
						console.log(`${logger__prefix}Decoded URI components for "${url}".`);
					}


					if ( a[i].getAttribute('ping') !== null )
					{
						a[i].ping = '';
						console.log(`${logger__prefix}Erased attribute "ping".`);
					}

					a[i].href = url;
					console.log(`${logger__prefix}Altered attribute "href" =>\t"${url}".`);
					if ('string' === typeof a[i].dataset.ved) {
						a[i].dataset.ved = '';
						console.log(`${logger__prefix}Erased data attribute "ved".`);
					}

					if ('string' === typeof a[i].dataset.usg) {
						a[i].dataset.usg = '';
						console.log(`${logger__prefix}Erased data attribute "usg".`);
					}

					if ('string' === typeof a[i].dataset.jsarwt) {
						a[i].dataset.jsarwt = '';
						console.log(`${logger__prefix}Erased data attribute "jsarwt".`);
					}

					r += `${url}\n`;
					const t = a[i].getAttribute('target');
					if (t !== null && t !== '_blank')
					{
						a[i].target = '_blank';
						console.log(`${logger__prefix}Altered "target" attribute to "_blank".`);
					}
					let div = a[i].parentElement.parentElement.parentElement.parentNode;
					div.dataset.ved = '';
					div.dataset.hveid = '';
					div.dataset.jscontroller = '';
					div.dataset.jsaction = '';

				}
			}
			if ( r !== '' ) {
				await f_text(r);
			}

			await removeTrackingEventListeners();

			const selector_rso = 'rso', rso = document.getElementById(selector_rso);
			if (rso !== null) {
				if (rso.getAttribute('eid') !== null) {
					console.log(`${logger__prefix}Erased data attribute "eid" for element with ID "#${selector_rso}".`);
				}
			}
		}
	}

	async function f_text(txt) {
		const textarea = document.createElement('textarea'), div = document.createElement('div'), button = document.createElement('button');
		div.classList.add('appbar');
		div.classList.add('mtfy__appbar');
		div.dataset.st_cnt = 'top';
		const code = `.mtfy__appbar button { margin-top: .75em; font-size: 10px; padding: 6px 8px; font-family: 'Verdana', sans-serif; font-size: 14px; border: 1px solid #454545; border-radius: 7px; }.mtfy__appbar { display:block !important;margin-bottom:2.3em;width: 60%; height: 240px !important; } .mtfy__txt { width: 100%; height: 195px !important; font-family: monospace, auto; !important; display:block !important; background: #00000025; padding: 8px; border: 1px solid #444; border-radius: 14px; font-size: 12px; } `, css = document.createElement('style');
		css.innerText = code;
		document.getElementsByTagName('head')[0].appendChild(css);
		textarea.classList.add('mtfy__txt');
		textarea.textContent = txt;
		textarea.id = 'mtfy__urls';
		div.appendChild(textarea);
		button.dataset.clipboardAction = 'copy';
		button.dataset.clipboardTarget = '#mtfy__urls';
		button.innerText = 'Copy to clipboard';
		try {
			const clipBoard = new ClipboardJS(button);
			clipBoard.on('success', function (e) {
				console.log(`\n${logger__prefix}Clipboard.js => Successfully copied text to clipboard.\n`);
			});

			clipBoard.on('error', function (e) {
				console.warn(`\n${logger__prefix}Clipboard.js => "${e.toString()}"\n`);
			});
		} catch (err) {
			console.error(`\n${logger__prefix}Clipboard.js => "${err.toString()}"\n`);
		}
		
		textarea.parentNode.insertBefore(button, textarea.nextSibling);
		const appbar = document.querySelector('div.appbar#appbar');
		if (appbar !== null) {
			appbar.parentNode.insertBefore(div, appbar.nextSibling);
		}
	}
	await getURIs();
	await removeLocalStorageJunk();
})();
