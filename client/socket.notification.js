
/**
 * Constructor of the notification class
 * @param: arg (Object)
 * @param: arg.url (string) url of web socket
 * @param: arg.reconnect (function) callback function
 * 		called when reconncted with the server
 */
var notification = function(arg) {
	this.arg = arg;
	if (typeof this.arg.url == 'undefined') {
		console.error('[redis notification] url property is required');
		return;
	}

	//socket io client
	this.socket = io.connect(this.arg.url);
	this.connected = false;

	this.reconnect(this.arg.reconnect);
}

/**
 * Function to listen to successful connection with
 * socket server.
 * @param: callback (function), called upon
 *		succesful connection
 */
notification.prototype.connect = function(callback) {
	var _this = this;

	// On connetion, updates connection state
	// and sends subscribe request
	this.socket.on('connect', function(data){
		console.info('[redis notification] connected');
		// setStatus('connected');
		_this.connected = true;

		if (typeof callback == 'function') {
			callback();
		}
	});
}

/**
 * Function to listen to reconnecting event with
 * socket server.
 * @param: callback (function), called upon
 *		reconnection :D
 */
notification.prototype.reconnect = function(callback) {
	// When reconnection is attempted, updates status 
	this.socket.on('reconnecting', function(data){
		console.info('[redis notification] reconnecting');
		if (typeof callback == 'function') {
			callback(data);
		}
	});
} 

/**
 * Function to bind to a {key}
 * @param: arg (Object)
 * @param: arg.channel (string) redis key to track
 * @param: arg.reconnect (function) callback function
 * 		called when reconncted with the server
 * @param: arg.message (function) callback function
 *		when a new message is recieved, when value of
 *		{key} changes
 */
notification.prototype.bind = function(arg) {
	if (typeof arg.channel == 'undefined') {
		console.error('[redis notification::bind()] channel property is required');
		return;
	}

	var _this = this;
	this.channel = arg.channel;

	if (!this.connected) {
		if (typeof arg.connect == 'function') {
			var _f = arg.connect;
			arg.connect = function(data) {
				_this.socket.emit('subscribe', {channel: arg.channel});
				_f(data);
			}
		} else {
			arg.connect = function(data) {
				_this.socket.emit('subscribe', {channel: arg.channel});
			}
		}

		this.connect(arg.connect);
	} else {
		// TODO: dont know what to do yet @deadline: 1 week
		console.error('[redis notification] not connected yet');
	}

	//on new message adds a new message to display
	this.socket.on('message', function (data) {
		if (typeof arg.message == 'function') {
			arg.message(data);
		}
	});
}