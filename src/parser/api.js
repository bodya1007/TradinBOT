const MTProto = require('@mtproto/core/envs/browser');
const storage = require('./LocalStorage');

const api_id = 1414884;
const api_hash = '2d50b0920114ae6552b713e577163c45';

const api = new MTProto({
	api_id,
	api_hash,
	test: false,
	storageOptions: {
		instance: storage,
	}
});

export default api;
