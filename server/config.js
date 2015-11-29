var config = {};

// http configuration
config.http = {
	port: 8090
};

// redis configuration
config.redis = {
	port: 6379,
	host: '127.0.0.1',
	options: {}
};

config.keys = {
	allowed: ['test']
}

// TODO: add more command, cover each required one
config.commands = {
    get: [
    	'set',
    	'incr',
    	'decr'
    ],
    lrange: [
    	'lpush',
    	'rpush',
    	'lpop',
    	'rpop'
    ],
    none: [
    	'del'
    ],
    hash: [
    	'hset',
    	'hdel',
    	'hincrby',
    	'hkeys',
        'hmget',
        'hlen',
        'hsetnx'
    ]
};

module.exports = config;