# 📖 Context Object Reference

Complete reference for the CMD-V2 context object with full GA-FCA support.

## 🎯 Core Data

### Basic Properties
- `e` - Event object with enhanced properties
- `api` - Enhanced Facebook API object with all GA-FCA features
- `args` - Command arguments array
- `getText(key, ...args)` - Get translated text

## 💬 Messaging

### Ultra-Short Messaging
- `$(msg, tid, mid)` - Send message (ultra-short)
- `reply(msg)` - Reply to current message
- `react(emoji, mid)` - React to message
- `send(msg, tid, mid)` - Send message to specific thread
- `unsend(mid)` - Unsend/delete message
- `markRead(tid)` - Mark thread as read
- `markDelivered(tid)` - Mark thread as delivered

### Examples
```javascript
// Basic reply
reply("Hello!");

// Send to specific thread
send("Message", "threadID", "messageID");

// React to message
react("😍");

// Unsend message
unsend(messageID);
```

## 🔄 Reply Message Support

### Reply Properties
- `replyMsg` - Full reply message object
- `isReply` - Boolean: is this a reply to another message
- `replyID` - User ID of replied message sender
- `replyBody` - Text content of replied message
- `replyAttachments` - Attachments in replied message

### Examples
```javascript
// Check if reply
if (isReply) {
    reply(`You replied to: ${replyBody}`);
}

// Get reply sender info
if (isReply) {
    const info = await api.getUserInfo(replyID);
    reply(`Reply from: ${info[replyID].name}`);
}
```

## 🌐 HTTP & Streams

### HTTP Requests
- `get(url, opts)` - HTTP GET request
- `post(url, data, opts)` - HTTP POST request
- `stream(url)` - Get stream from URL for attachments

### Examples
```javascript
// Simple GET request
const data = await get("https://api.example.com/data");

// POST with data
const result = await post("https://api.example.com/submit", { key: "value" });

// Get image stream
const imageStream = await stream("https://example.com/image.jpg");
reply({ body: "Image!", attachment: imageStream });
```

## 📎 Attachment Helpers

### Attachment Functions
- `attach(stream)` - Create attachment object
- `photo(stream)` - Send photo attachment
- `video(stream)` - Send video attachment
- `audio(stream)` - Send audio attachment
- `file(stream)` - Send file attachment

### Examples
```javascript
// Send photo
const photoStream = await stream(imageUrl);
reply({ body: "Photo!", attachment: photoStream });

// Multiple attachments
const attachments = await Promise.all(urls.map(url => stream(url)));
reply({ body: "Files!", attachment: attachments });
```

## 👤 User Management (u)

### User Properties & Methods
- `u.id` - Sender's user ID
- `u.mentions` - Mentioned users object
- `u.admin()` - Check if user is admin
- `u.info()` - Get user information (async)
- `u.nick(nickname, tid)` - Set user's nickname

### Examples
```javascript
// Check if user is admin
if (u.admin()) {
    reply("You are an admin!");
}

// Get user info
const info = await u.info();
reply(`Hello ${info[u.id].name}!`);

// Handle mentions
const mentionedUsers = Object.keys(u.mentions);
if (mentionedUsers.length > 0) {
    reply(`You mentioned: ${Object.values(u.mentions).join(", ")}`);
}
```

## 🏠 Thread Management (t)

### Thread Properties & Methods
- `t.id` - Current thread ID
- `t.info()` - Get thread information (async)
- `t.group()` - Check if in group (async)
- `t.title(newTitle)` - Change thread title
- `t.emoji(newEmoji)` - Change thread emoji
- `t.color(newColor)` - Change thread color
- `t.kick(userID)` - Remove user from group
- `t.add(userID)` - Add user to group
- `t.promote(userID)` - Make user admin
- `t.demote(userID)` - Remove admin status
- `t.nick(nickname, userID)` - Set user nickname
- `t.leave()` - Leave the group

### Examples
```javascript
// Check if group
if (await t.group()) {
    reply("This is a group chat!");
}

// Change group title
t.title("New Group Name");

// Kick user
const target = Object.keys(u.mentions)[0];
if (target) {
    t.kick(target);
    reply("User kicked!");
}
```

## 👥 Group Management (gc)

### Group Control Functions
- `gc.kick(userID, tid)` - Remove user from group
- `gc.add(userID, tid)` - Add user to group
- `gc.promote(userID, tid)` - Make user admin
- `gc.demote(userID, tid)` - Remove admin status
- `gc.title(title, tid)` - Change group title
- `gc.emoji(emoji, tid)` - Change group emoji
- `gc.color(color, tid)` - Change group color
- `gc.nick(nickname, userID, tid)` - Set user nickname
- `gc.leave(tid)` - Leave group
- `gc.info(tid)` - Get group information

## 🛠️ Utilities (_)

### File Operations
- `_.read(path)` - Read file content
- `_.write(path, data)` - Write file content
- `_.exists(path)` - Check if file exists
- `_.delete(path)` - Delete file
- `_.mkdir(path)` - Create directory

### Random & Generation
- `_.rand(min, max)` - Random number
- `_.pick(array)` - Random array element
- `_.shuffle(array)` - Shuffle array
- `_.uuid()` - Generate unique ID

### Async Utilities
- `_.sleep(ms)` - Async sleep
- `_.delay(ms)` - Async delay
- `_.timeout(promise, ms)` - Promise with timeout

### Text Processing
- `_.cap(str)` - Capitalize string
- `_.cut(str, len)` - Truncate string
- `_.clean(str)` - Remove special characters
- `_.escape(str)` - Escape regex characters

### Time & Date
- `_.now()` - Current timestamp
- `_.time()` - Current time string
- `_.date()` - Current date string
- `_.iso()` - ISO timestamp

### Data Processing
- `_.json(obj)` - JSON stringify
- `_.parse(str)` - JSON parse
- `_.clone(obj)` - Deep clone object
- `_.merge(obj1, obj2)` - Merge objects

### Array Operations
- `_.chunk(arr, size)` - Split array into chunks
- `_.unique(arr)` - Remove duplicates
- `_.flatten(arr)` - Flatten nested arrays

### Validation
- `_.isUrl(str)` - Check if valid URL
- `_.isEmail(str)` - Check if valid email
- `_.isNumber(str)` - Check if valid number
- `_.isEmpty(val)` - Check if empty

## 🤖 Bot Info (b)

### Bot Properties
- `b.name` - Bot name
- `b.prefix` - Command prefix
- `b.owner` - Bot owner
- `b.up()` - Bot uptime
- `b.stats` - Bot statistics

## 💾 Database (d)

### User Database
- `d.u.get(id)` - Get user data
- `d.u.set(id, data)` - Update user data
- `d.u.exp(id, exp)` - Add experience
- `d.u.money(id, amount)` - Add money

### Thread Database
- `d.t.get(id)` - Get thread data
- `d.t.set(id, data)` - Update thread data

## 🔧 Enhanced API

### Advanced API Methods
- `api.sendTyping(tid)` - Show typing indicator
- `api.stopTyping(tid)` - Stop typing indicator
- `api.getUserInfo(uid)` - Get user information
- `api.getThreadInfo(tid)` - Get thread information
- `api.getFriendsList()` - Get friends list
- `api.forwardMessage(mid, tid)` - Forward message
- `api.searchForThread(name)` - Search threads by name
- `api.createPoll(title, options, tid)` - Create poll
- `api.getCurrentUserID()` - Get bot's user ID
- `api.bulkSend(messages, threadIDs)` - Send to multiple threads

## 📱 Enhanced Event

### Event Properties
- `event.isGroup` - Is this a group chat
- `event.attachments` - Message attachments
- `event.hasAttachments` - Has attachments boolean
- `event.mentions` - Mentioned users
- `event.hasMentions` - Has mentions boolean
- `event.isReply` - Is reply to another message
- `event.replyTo` - Reply message object
- `event.timestamp` - Message timestamp
- `event.type` - Message type

## 🌐 Auto-Imports

### Available Modules
- `fs` - File system module
- `path` - Path module
- `axios` - HTTP client module
- `console` - Console logging
- `setTimeout` - Set timeout
- `setInterval` - Set interval
- `Buffer` - Buffer utilities
- `process.env` - Environment variables

---

**Next**: [Basic Examples](./basic-examples.md) | [Advanced Examples](./advanced-examples.md)
