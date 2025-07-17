# GA-FCA Documentation

## Installation

```bash
npm install ga-fca
```

## Usage

```javascript
const login = require('ga-fca');

// Login with email and password
login({email: "FB_EMAIL", password: "FB_PASSWORD"}, (err, api) => {
    if(err) return console.error(err);
    
    // Use the api object to interact with Facebook
    api.sendMessage("Hello World!", "THREAD_ID");
});

// Login with appState (recommended for production)
login({appState: JSON.parse(fs.readFileSync('appstate.json', 'utf8'))}, (err, api) => {
    if(err) return console.error(err);
    
    // Use the api object
    api.listen((err, message) => {
        if(err) return console.error(err);
        
        console.log(message);
        
        // Echo back the message
        api.sendMessage(message.body, message.threadID);
    });
});
```

## API Methods

### sendMessage(message, threadID, callback)
Send a message to a thread.

### listen(callback)
Listen for incoming messages.

### getThreadList(limit, timestamp, tags, callback)
Get list of threads.

### getUserInfo(ids, callback)
Get user information.

### getThreadInfo(threadID, callback)
Get thread information.

### logout(callback)
Logout from Facebook.

## Options

```javascript
const options = {
    selfListen: false,
    listenEvents: false,
    updatePresence: false,
    forceLogin: false,
    autoMarkDelivery: true,
    autoMarkRead: false,
    autoReconnect: true,
    logLevel: "silent",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_2) AppleWebKit/600.3.18 (KHTML, like Gecko) Version/8.0.3 Safari/600.3.18"
};

login(loginData, options, callback);
```

## Error Handling

Always handle errors properly:

```javascript
login(loginData, (err, api) => {
    if(err) {
        switch(err.error) {
            case 'login-approval':
                console.log('Enter code: ');
                // Handle 2FA
                break;
            case 'checkpoint':
                console.log('Go to Facebook and check checkpoint');
                break;
            default:
                console.error(err);
        }
        return;
    }
    
    // API is ready to use
});
```

## License

MIT
