var app = require('http').createServer(handler)
    , io = require('socket.io').listen(app)
    , fs = require('fs')
    , redis = require("redis")
    , config = require('./config');


// ===== http listener / handler ===================
app.listen(config.http.port);
console.log('[info] listening to port', config.http.port);

/**
 * http handler, currently just sends index.html on new connection
 */
function handler (req, res) {
    fs.readFile(__dirname + '/../www/index.html',
    function (err, data) {
        if (err) {
            res.writeHead(500);
            return res.end('Error loading index.html' + __dirname);
        }

        res.writeHead(200);
        res.end(data);
    });
}

// ========== redis listener ===================
// Our redis client which subscribes to channels for updates
var redisClient = redis.createClient(
    config.redis.port,
    config.redis.host,
    config.redis.options
    );

// Redis client to get data from redis
var redisMClient = redis.createClient(
    config.redis.port,
    config.redis.host,
    config.redis.options
    );

// look for connection errors and log
redisClient.on("error", function (err) {
    console.log("[redis error] " + redisClient.host
        + ":" + redisClient.port + " - " + err);
});

// subscribe to redis channel when client in ready
redisClient.on('ready', function() {
    console.log('[info] redis server ready');
});

// Just to indicate the status during server startup
redisMClient.on('ready', function() {
    console.log('[info] redis data server ready');
});

/**
 * wait for messages from redis channel, on message
 * send updates on the rooms named after channels. 
 * 
 * This sends updates to users. 
 */
redisClient.on('message', function(channel, message) {
    // response variable
    var resp = {
        text: message,
        channel: channel,
        data: null
    };

    // retirve the key from channel value
    // TODO: incase we dont get correct val from
    // this regex @deadline: 1 week
    var key = /.*:(.*)/.exec(channel)[1];

    // callback for the events
    var callback = function(err, data) {
        if (err) {
            console.log('[subscribe data error]', err);
            return;
        }
        resp.data = data;
        io.sockets.in(key).emit('message', resp);
    }

    // depending upon data type get such data
    if (config.commands.get.indexOf(message) != -1) {
        redisMClient.get(key, callback);
    } else if (config.commands.lrange.indexOf(message) != -1) {
        redisMClient.lrange(key, 0, -1, callback);
    } else if (config.commands.none.indexOf(message) != -1) {
        callback(null, null);
    } else if (config.commands.hash.indexOf(message) != -1) {
        redisMClient.hgetall(key, callback);
    }
});

// ========== Socket IO listener =================== 

/**
 * socket io client, which listens for new websocket connection
 * and then handles various requests
 */
io.sockets.on('connection', function (socket) {
  
    //on connect send a welcome message
    socket.emit('message', { hello : 'world' });

    //on subscription request joins specified room
    //later messages are broadcasted on the rooms
    socket.on('subscribe', function (data) {
        // Check if this key is allowed
        if (config.keys.allowed.indexOf(data.channel) == -1) {
            socket.emit('message', {
                channel: data.channel,
                error: true,
                message: 'No access to key!',
                data: null
            });
            return;
        }

        var key = '__keyspace@0__:' +data.channel;

        // subscribe to redis notification channel
        redisClient.subscribe(key);

        // bind to this channel
        socket.join(data.channel);

        // TODO: return the current value of the key {data.channel}
        // @note -  it can be of any data type
    });

    socket.on('dicsonnect', function() {
        redisClient.unsubscribe();
    });
});