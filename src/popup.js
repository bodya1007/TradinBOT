function start() {
	chrome.runtime.sendMessage({type: 'start'}, response => {
		console.log("started")
	})
}
document.getElementById('start').addEventListener('click', start)
// document.getElementById('start').addEventListener('click', makeOffer)
