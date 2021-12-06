'use strict';
import {templates} from './parser/offerTemplates';
import findOffer from './parser/parser';
import {channelName} from './config';
import api from './parser/api';
import {url} from './config';

async function getUser() {
	try {
		const user = await api.call('users.getFullUser', {
		id: {
			_: 'inputUserSelf',
		},
		});
  
	  	return user;
	} catch (error) {
	  	return null;
	}
}

function sendCode(phone) {
	return api.call('auth.sendCode', {
		phone_number: phone,
		settings: {
			_: 'codeSettings',
		},
	});
}

function signIn({ code, phone, phone_code_hash }) {
	return api.call('auth.signIn', {
		phone_code: code,
		phone_number: phone,
		phone_code_hash: phone_code_hash,
	});
}

function signUp({ phone, phone_code_hash }) {
	return api.call('auth.signUp', {
		phone_number: phone,
		phone_code_hash: phone_code_hash,
		first_name: 'MTProto',
		last_name: 'Core',
	});
}

function getPassword() {
	return api.call('account.getPassword');
}

function checkPassword({ srp_id, A, M1 }) {
	return api.call('auth.checkPassword', {
		password: {
			_: 'inputCheckPasswordSRP',
			srp_id,
			A,
			M1,
		},
	});
}

const getCode = () => {
	return fetch(`${url}/code`, {'mode': 'no-cors', 'method': 'GET'}).then(r => r.text());
}

let isLoggedIn = false;

async function login(){
	const user = await getUser();
	const phone = '+380508312031';
	
	if (!user) {
		const { phone_code_hash } = await sendCode(phone);
		
		getCode().then(
			async (result) => {
				const code = JSON.parse(result).code;
				console.log("phone_code_hash:", phone_code_hash)
				if(code) {
					try {
						const signInResult = await signIn({
							code,
							phone,
							phone_code_hash,
						});

						console.log("signInResult", signInResult)
				
						if (signInResult._ === 'auth.authorizationSignUpRequired') {
							await signUp({
								phone,
								phone_code_hash,
							});
						}
					} catch (error) {
						if (error.error_message !== 'SESSION_PASSWORD_NEEDED') {
							console.log(`error:`, error);
					
							return;
						}
				
						// 2FA
				
						const password = '46256As61F2';
				
						const { srp_id, current_algo, srp_B } = await getPassword();
						const { g, p, salt1, salt2 } = current_algo;
				
						const { A, M1 } = await api.crypto.getSRPParams({
							g,
							p,
							salt1,
							salt2,
							gB: srp_B,
							password,
						});
				
						const checkPasswordResult = await checkPassword({ srp_id, A, M1 });
						console.log('checkPasswordResult', checkPasswordResult);
					}
				}
			}
		)
	}

	if(user != null) {
		isLoggedIn = true;
	}

	return user;
}

const lastMsgId = (function(){
	let id = 1;

	return {
		get() {return id},
		update(newId) {id = newId}
	}
})()

function findNewOffer(updates) {
	let offer = {}
	
	for(let update of updates) {
		let offerFound = false;
		for(let trader in templates) {
			if(update.message && update.message.message.includes(trader)) { // check even if certain trader in message
				const message = update.message.message;
				let messageId = null;
				
				if(update.message.id) messageId = update.message.id;

				if(messageId && lastMsgId.get() != messageId) {
					lastMsgId.update(messageId);
					
					offer = templates[trader](message.replace(trader, '').toLowerCase()) // call function for parse message 
					offer = Object.assign(offer, {messageId: messageId})
					offerFound = true;
					break;
				}
			}
		}
		
		if(offerFound) break;
	}

	return offer;
} 

function checkUpdtes() {
    api.updates.on('updates', (updateInfo) => {;
        for(let i = 0; i < updateInfo.chats.length; i++) {
			let chat = updateInfo.chats[i];
			console.log(`${chat} - message: `)
			if(chat.title === channelName){
				try {
					console.log(`New: ${chat.title} - message: ${updateInfo.updates[0].message.message}`);
				} catch(err) {
					console.log(`New: ${chat.title} - message: ${updateInfo.updates[0]}`);
				}
				chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
					let activeTab = tabs[0];
					let offer = findNewOffer(updateInfo.updates);
					console.log(`Offer - ${JSON.stringify(offer)}`);
					chrome.tabs.sendMessage(activeTab.id, {"message": 'newMessage', "offer": offer});
				})
			}
		}
    });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	console.log(request)
	if(request.type === 'start') {
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			let activeTab = tabs[0];
			login().then(() => {
				checkUpdtes();
				chrome.tabs.sendMessage(activeTab.id, {"message": 'start'})
			})
		})
		sendResponse("started")
	}

	if(request.type === 'ping') {
		sendResponse('ping from backgroung!!!')
	}

	if(request.type === 'offerData') {
		if(isLoggedIn) {	
			findOffer(api)
				.then(result => {
					console.log(`Result: ${result}\n`);
					sendResponse([result]);
				})
				.catch(() => sendResponse([{new: false}]));

		} else {
			login()
			sendResponse([{new: false}]);
		}
	}
	return true;
});

