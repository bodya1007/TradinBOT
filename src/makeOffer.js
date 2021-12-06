function makeOffer() {  
	function selectCurrency(currency) { // example EUR/USD
		console.log("Currency!", currency);
        document.getElementsByClassName('current-symbol')[0].click(); // click on dropdown list
        const currList  = document.getElementsByClassName('asset-label'); // list of currencies

        for(let curr of currList) {
			console.log("Curr", curr.textContent.toLowerCase())
            if(curr.textContent.toLowerCase().search(currency.toLowerCase()) != -1) {
                console.log('Currency found: ', curr.textContent, '.')
                curr.click(); // select currency
                curr.click(); // select currency
                break;
            }
        }
    }

    function selectTimeDigital(time) { // find time in digital format. For examle: '5 минут' 
        document.getElementsByClassName('value__val')[0].click()
        const digitalTimeList = document.getElementsByClassName('list__k');
        console.log('digitalTimeList length', digitalTimeList.length);
        //*[@id="put-call-buttons-chart-1"]/div/div[2]/div[2]/div[2]/ul/li[1]/ul/li[3]/a/span[1]

        let text = ''
        for(let i = 1; i <= 3; i++) {
            for(let j = 1; j <= 4; j++) {
                text = document.evaluate(`//*[@id="put-call-buttons-chart-1"]/div/div[2]/div[2]/div[2]/ul/li[${i}]/ul/li[${j}]/a/span[1]/i`, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.firstChild.textContent;
                console.log(text);
                if(text == time) {
                    document.evaluate(`//*[@id="put-call-buttons-chart-1"]/div/div[2]/div[2]/div[2]/ul/li[${i}]/ul/li[${j}]/a/span[1]/i`, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.click();
                    break;
                }
            }
        }
    }

    function selectUpDown(up = false, down = false) {
        if(up) {
            document.getElementsByClassName('switch-state-block__item')[3].click();
        } else if(down) {
            document.getElementsByClassName('switch-state-block__item')[1].click();
        }
    }

    function doOffer() {
        chrome.runtime.sendMessage({type: 'offerData'}, response => {
            let timeout = 200;
            console.log('Background script response:', response, '.');
            
            for(let resp of response) {
                let nextTimeout = 0;
				if(resp && resp.new) {
                    console.log("New MSG:", resp);
                    nextTimeout = 2710;
                    const offer = () => {
                        setTimeout(() => selectCurrency(resp.currency), 500);
                        setTimeout(() => selectTimeDigital(resp.time), 800);
                        setTimeout(() => selectUpDown(resp.up, resp.down), 1000)
                    }

                    setTimeout(offer, timeout);
                }
                timeout += nextTimeout;
            }
        })
    }

    setInterval(doOffer, 2500);
}

exports.makeOffer = makeOffer;
// export default makeOffer;