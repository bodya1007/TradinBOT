const MTProto = require('@mtproto/core/envs/browser');
const storage = require('./LocalStorage');

import {templates} from './offerTemplates';
import {findMessage} from './utils';
import channelName from '../config';

function createMsgId() {
    let lastMsgId = 1;
    return {
        get: () => {return lastMsgId},
        update: (msgId) => {lastMsgId = msgId}
    }
}

const msgId = createMsgId(); // create message id storage

function findOffer(api) {

    return new Promise((resolve, reject) => {
        // const ch = 'Сигналы VIP клуб-а Tradinburg';
        findMessage(Object.assign(api, {ch: channelName})).then(result => {
            if(result.id != msgId.get()) {
                msgId.update(result.id); // update message id locally
                for(let trader in templates) {
                    if(result.text.includes(trader)) { // check even if certain trader in message
                        const offer = templates[trader](result.text.replace(trader, '').toLowerCase()) // call function for parse message 
                        resolve(offer);
                        break;
                    }
                }
            }
            reject();
        })
    })
}


// export default api;
export default findOffer;
// exports.api = api;
// exports.findOffer = findOffer;
