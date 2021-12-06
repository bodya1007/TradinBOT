const chatInfo = (function(){
    const chatInfo = {
        id: 1163371061,
        title: '',
        access_hash: ''
    };
    
    return {
        get() {return chatInfo},
        updateId(id) {chatInfo.id = id},
        updateTitle(title) {chatInfo.title = title},
        updateAccessHash(hash) {chatInfo.access_hash = hash}
    }
})()

async function findMessage(api) {
    const resolvedPeer = await api.call('messages.getAllChats', 
        { except_ids: [] }
    );

    if(!chatInfo.get().title) {

        for(let i = 0; i < resolvedPeer.chats.length; i++) {
            let chat = resolvedPeer.chats[i];
            if(chat.title === api.channelName) {
                chatInfo.updateTitle(chat.title);
                chatInfo.updateId(chat.id);
                // chatInfo.updateAccessHash(chat.migrated_to.access_hash);
                break;
            }
        }
    }

    console.log('ChatInfo:', chatInfo.get());

    const channel = resolvedPeer.chats.find(
        (chat) => chat.id === chatInfo.get().id
    );
  
    const inputPeer = {
        _: 'inputPeerChannel',
        channel_id: channel.id,
        access_hash: channel.access_hash,
    };

    if(inputPeer.access_hash) {
        chatInfo.updateAccessHash(inputPeer.access_hash);
    }   
    const LIMIT_COUNT = 1;
  
    const firstHistoryResult = await api.call('messages.getHistory', {
        peer: inputPeer,
        limit: LIMIT_COUNT,
    });


    const message = firstHistoryResult.messages[0];
    const msgObj = {
        id: message.id,
        text: message.message,
        date: message.date
    }

    return msgObj;
}

exports.findMessage = findMessage;