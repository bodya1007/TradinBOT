chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		if(request.message === "start" ) {
            alert("Started!!!")
            const ping = () => {
                chrome.runtime.sendMessage({type: 'ping'}, response => {
                    console.log(`${response}`)
                })
            }

            setInterval(ping, 10000 * 6 * 2 + 10) // 2 minutes and 10 miliseconds
        }
        
        if(request.message === 'newMessage') {
            // call function
        }
	}
);
