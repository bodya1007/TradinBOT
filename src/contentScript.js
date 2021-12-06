function makeOffer() {  
    const lastMsgId = (function(){
        let id = 1;
        
        return {
            get() {
                return id;
            },
            update(newId) {
                id = newId;
            }
        }
    })()

    const closedOrders = (function() {
        let orders = [];

        return {
            get() {
                return orders;
            },
            update() {
                if(orders.length) {
                    orders = [];
                }
                // closed
                document.evaluate('//*[@id="bar-chart"]/div/div/div[2]/div/div[1]/div[2]/ul', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.children[1].firstChild.click()
                
                let listItems = document.getElementsByClassName('deals-list__item');
                for(let i = 0; i < listItems.length; i++) {
                    let curr = listItems[i].children[0].firstChild.innerText;
                    let money = listItems[i].children[1].firstChild.innerText;
                    let timeExp = listItems[i].getElementsByClassName("item-row")[1].children[2].innerText;
                    let income = false; 
                    let type = null;

                    if(listItems[i].getElementsByClassName('price-up').length) {
                        income = true;
                    }

                    if(listItems[i].getElementsByClassName('fa-arrow-up')) {
                        type = 'up';
                    } else {
                        type = 'down';
                    }
                    
                    orders.push({curr, money, type, timeExp, income});
                }
            }
        }
    })()

    const needOverlapOrders = (function() {
        let orders = []; // list of money closed orders 

        return {
            get() {
                // return last element of array or 0.
                
                // if value is equil to 0, this meant that order don't need overlvap
                // if value more than 0, this meant that order overlap is equil to value*2
                let result = 0;
                if(orders.length) {
                    result = orders.pop()
                }
                return result;
            },
            add(order) { 
                orders.unshift(order)
                console.log(`Need overlap orders: ${orders} \n`)
            }
        }
    })()

    const addedToNeedOverlap = (function() {
        let orders = [];
        
        return {
            get() {
                return orders;
            },
            add(order) {
                orders.push(order);
            },
            clear(count) {
                orders = orders.slice(count);
            }
        }
    })()

    function pause(millis) {
        const date = Date.now();
        let curDate = null;
        do {
            curDate = Date.now();
        } while (curDate-date < millis);
    }

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

    function findDigit(str) {
        let matches = str.match(/(\d+)/);
        let result = null;

        if (matches) {
            result = parseInt(matches[0]);
        }

        return result;
    }

    function increaseCurrency(currentValue) {
        let increase = true;
        while(increase) {
            let value = findDigit(document.getElementsByClassName('value__val')[1].children[1].value);

            if(value / currentValue < 2) {
                document.getElementsByClassName('buttons__plus')[1].click();
            }

            if(value / currentValue >= 2) {
                increase = false;
            }

            pause(5)
        }
    }

    function decreaseCurrencyToLow(low) {
        let decrease = true;
        
        while(decrease) {
            let value = findDigit(document.getElementsByClassName('value__val')[1].children[1].value);

            if(value != low) {
                document.getElementsByClassName('buttons__minus')[1].click();
            } else {
                decrease = false;
            }
        }

        pause(6)
    }

    function selectCurrValue() {
        let needOverlap = needOverlapOrders.get();
        decreaseCurrencyToLow(1);
        if(needOverlap > 0) {
            increaseCurrency(needOverlap);
        }
    }

    function selectTimeDigital(time) { // find time in digital format. For example: '5 минут' 
        document.getElementsByClassName('value__val')[0].click()
        const digitalTimeList = document.getElementsByClassName('list__k');
        console.log('digitalTimeList length', digitalTimeList.length);
        
        let text = '';
        for(let i = 0; i < digitalTimeList.length; i++) {
            text = document.getElementsByClassName('list__k')[i].childNodes[1].textContent;

            if(text == time) {
                // document.getElementsByClassName('list__k')[i].childNodes[1].click();
                document.getElementsByClassName('list__k')[i].click();
                break;
            }
        }

        document.getElementsByClassName('value__val')[0].click(); // close time bar
    }

    function selectUpDown(up = false, down = false) {
        if(up) {
            document.getElementsByClassName('btn btn-call')[0].click();
            // document.getElementsByClassName('switch-state-block__item')[3].click();
        } else if(down) {
            document.getElementsByClassName('btn btn-put')[0].click();
            // document.getElementsByClassName('switch-state-block__item')[1].click();
        }
    }

    function compareOrderArrs(arr1, arr2) { 
        function equil(order1, order2) {
            let result = false;
            if(order1.type == order2.type && order1.money == order2.money && order1.curr == order2.curr && order1.timeExp == order2.timeExp) {
                result = true;
            }

            return result;
        }

        let notEquil = [];

        for(let elem1 of arr1) {
            let found = false;

            for(let elem2 of arr2) {
                if(equil(elem1, elem2)) {
                    found = true;
                    break;
                }
            }

            if(!found) {
                notEquil.push(elem1);
            }
        }

        return notEquil;
    }

    function doOffer(response) {
            
        console.log('Background script response:', response, '.');
        
        for(let resp of response) {
            if(resp && resp.new) {
                console.log("New MSG:", resp);
                nextTimeout = 2710;

                if(resp.messageId && resp.messageId != lastMsgId.get()) {
                    lastMsgId.update(resp.messageId);
                    
                    selectCurrValue()

                    const offer = () => {
                        selectCurrency(resp.currency);
                        pause(50)
                        selectTimeDigital(resp.time);
                        pause(55)
                        selectUpDown(resp.up, resp.down)
                    }

                    offer();
                    pause(10)

                    closedOrders.update()
                    let notExistInNeedOverlap = compareOrderArrs(closedOrders.get(), addedToNeedOverlap.get())

                    for(let order of notExistInNeedOverlap) {
                        if(!order.income) {
                            needOverlapOrders.add(findDigit(order.money));
                            addedToNeedOverlap.add(order);
                        }
                    }
                    
                    if(addedToNeedOverlap.get().length > 50) {
                        addedToNeedOverlap.clear(5);
                    }
                }
            }
        }
    }
    
    return {
        doOffer: doOffer
    }
}

let offerInfo = makeOffer();

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
            // makeOffer([request.offer])
            offerInfo.doOffer([request.offer]);
        }
	}
);
