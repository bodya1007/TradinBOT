chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if(request.type === 'ping') {
		sendResponse('ping from backgroung!!!')
	}
	return true;
});

