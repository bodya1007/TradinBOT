function firstTemplate(text) {
    let offer = {
        time: '',
        currency: '',
        up: false,
        down: false,
        new: false
    };

    if(text.includes('через') || text.includes('минус') || text.includes('плюс') || text.includes("от уровня")) {
        return;
    }

    text = text.replace('\n', ' ')
    let regexp = new RegExp((/(\b\w{3})(\/)(\b\w{3})/));
    let currency = text.match(regexp);
    if(!currency) {
        regexp = new RegExp((/(\b\w{3}) (\b\w{3})/));
        currency = text.match(regexp);
        if(currency) {
            currency = currency[0].replace(' ', '/');
        }
    } else {
        currency = currency[0].replace(' ', '/');
    }

    const up = 'вверх'
    const down = 'вниз'

    if((text.toLowerCase().includes(up) || text.toLowerCase().includes(down)) && currency) {
        offer.new = true;
        offer.currency = currency;

        if(text.includes(up)) {
            offer.up = true;
        } else {
            offer.down = true;
        }

        let minutes = "";

        for(let i = 0; i < text.length; i++) {
            if(parseInt(text[i])) {
                minutes += text[i];
            }
        }

        if(minutes) {
            offer.new = true;
            offer.time = minutes;
        } 
    }
    return offer;
}

function secondTemplate(text) {
    let offer = {
        new: false,
        up: false,
        down: false,
    };

    let done = ['✅', '❌']

    if(text.includes('через') || text.includes(done[0]) || text.includes(done[1])) {
        return;
    }

    const up = 'вверх';
    const down = 'вниз';

    if(text.includes(up) || text.includes(down)) {
        const currency_text = text.split(' ')[0];
        const currency = `${currency_text.slice(0,3)}/${currency_text.slice(3)}`;
        offer.currency = currency;
        offer.new = true
    } else {
        return offer;
    }

    if(text.includes(up)) offer.up = true;
    else offer.down = true;

    let minutes = "";

    for(let i = 0; i < text.length; i++) {
        if(parseInt(text[i])) {
            minutes += text[i];
        }
    }

    if(minutes) {
        offer.new = true;
        offer.time = minutes;
    }

    return offer;
}

function GoodWillTemplate(text) {
    function replaceChar(origString, replaceChar, index) {
        let firstPart = origString.substr(0, index);
        let lastPart = origString.substr(index + 1);
        let newString = firstPart + replaceChar + lastPart;
        return newString;
    }

    let done = ['✅', '❌']

    if(text.includes(done[0]) || text.includes(done[1])) {
        return {};
    }

    let offer = {
        new: false,
        up: false,
        down: false
    }

    if(text.includes("buy")) {
        offer.up = true
    } else if(text.includes("sell")){
        offer.down = true;
    }
    let regexp = new RegExp((/(\b\w{3})( \/ )(\b\w{3})/));
    let currency = text.match(regexp);

    if(currency){
        offer.currency = currency[0].replaceAll(' ', '');
    }

    if(offer.up || offer.down && offer.currency) {
        let index = text.indexOf('goodwill');
        for(let i = text.length; i > index-1; i--) {
            text = replaceChar(text, '', i);
        }

        let minutes = "";

        for(let i = 0; i < text.length; i++) {
            if(parseInt(text[i])) {
                minutes += text[i];
            }
        }

        if(minutes) {
            offer.new = true;
            offer.time = minutes;
        }
    }

    return offer
}

templates = {
    // 'Трейдера с умом': firstTemplate,
    // 'Русского трейдера': firstTemplate, // handle 4 minutes
    // 'Небора': firstTemplate,
    // 'Сингапура': secondTemplate,
    // 'Трейдера Дмитрия': firstTemplate,
    // 'MH trade': firstTemplate,
    // 'Егора Егорова': firstTemplate,
    // 'Секретный трейдер': firstTemplate,
    // 'Scrooge Money': template_2,
    // 'WORLDWIDE': secondTemplate,
    // 'Сообщества трейдеров №1': secondTemplate,
    'GOODWILL TRADERS': GoodWillTemplate
}

exports.templates = templates;
