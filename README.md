# realtime-notification
[![todofy badge](https://todofy.org/b/mebjas/realtime-notification)](https://todofy.org/r/mebjas/realtime-notification)

Subscribe to a redis data structure directly from web client for any change. Its based on `node.js`, `socket.io` and `redis`. Pretty useful for implementing realtime **notifications**, **statistics**, **realtime chat** etc.

Currently works on:
 - simple redis string
 - list
 - hash table

## How to use it
### Server

**Installations**
 1. Install `node js` - https://nodejs.org/en/download/
 2. Install `redis` - http://redis.io/download
 3. Install `socket.io` module for node
 `npm install socket.io `
 4. Install `redis` module for node
 `npm install redis`

**Start redis**<br>
`linux / OS X`: run `redis-server`<br>
`windows`: [read](http://www.saltwebsites.com/2012/how-run-redis-service-under-windows)

**Run Server**
goto `./server/` & run `node server.js`

**Configuration**: you can configure few properties of server by editting `./server/config.js`.

### Client
On the html page include these scripts
```html
<script src="https://cdn.socket.io/socket.io-1.3.7.js"></script>
<script src="./client/socket.notification.js"></script>
<script>
var n = new notification({
	url: 'http://127.0.0.1:8090',
	connect: function(data) {
		console.log('connected to server, callback');
	}
});
n.bind({
	channel: 'test',
	message: function(data) {
		if (typeof data.hello != 'undefined') return;
		document.body.innerHTML += ' <div> New Message: ' +JSON.stringify(data.data) +'</div>';
	}
});
</script>
```

### Documentation
**Create an object of class `notification`**. Format:
```js
var n = new notification({
	url: 'http://127.0.0.1:8090',
	reconnect: function(data) {
    	console.info('reconnecting to realtime notification server');
 	},
 	connect: function(data) {
		console.log('connected to server, callback');
	},
	error: function(data) {
		alert('ERROR: ' +data.message);
	}
});
```
The constructor takes one object as argument with following format.
object
```js
{
  url:  (string) (required) the url of the socket server,
  reconnect: (function) callback, when client reconnects to server
  connect: (function) callback function called when client connects to the socket server,
  error: (function) callback function called when error message is sent from server
}
```

**Then bind to a certain key on server**
```js
n.bind({
	channel: 'test',
	message: function(data) {
		if (typeof data.hello != 'undefined') return;
		$('body').append(' <div> New Message: ' +JSON.stringify(data.data) +'</div>');
	}
});
```
The `bind()` method subscribes to a certain key on redis cache. It takes object as argument of following format
```js
{
  channel: (string) (required) - key of the variable to bind to in redis cache,
  message: (function) callback function called when ever a change occurs to variable defined by key (channel),
}
```

===============
## TODOs
1. Add list of keys to be accessible, on server config
2. Add access control layer, to define who can connect to server

## Demo
coming soon...
