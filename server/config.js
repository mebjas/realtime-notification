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

module.exports = config;