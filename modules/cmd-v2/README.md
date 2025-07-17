# CMD-V2 ULTIMATE System Documentation

## Overview
The CMD-V2 Ultimate system provides **COMPREHENSIVE FACEBOOK CHAT API SUPPORT** with ultra-minimal syntax. Access ALL GA-FCA features in just 1-5 lines of code!

## Key Features
- 🚀 **ULTRA-MINIMAL Syntax** - Full-featured commands in 1-5 lines
- ⚡ **High Performance** - Advanced caching and optimization
- 🔧 **Flexible Prefix System** - Commands can require prefix or work without
- 🌐 **Complete HTTP Client** - Ultra-short `get()`, `post()`, `stream()`
- 📁 **File System Shortcuts** - Single-letter file operations
- 💾 **Database Shortcuts** - Ultra-short database access
- 🎯 **Attachment Support** - Easy image/video/audio/file handling
- 📱 **Group Management** - Complete group admin features
- 💬 **Reply Message Support** - Handle message replies effortlessly
- 🔄 **Auto Translation** - Automatic MiraiV2 compatibility
- 📊 **Performance Monitoring** - Automatic slow command detection
- 🎨 **Thread Customization** - Title, emoji, color, nickname management
- 👥 **User Management** - Add, remove, promote, demote users
- 📨 **Advanced Messaging** - Typing indicators, reactions, forwarding
- 🔍 **Search & Discovery** - Thread and user search capabilities

## Prefix Configuration

Commands can be configured to work with or without the bot prefix:

### Prefix Required (prefix: true)
```javascript
// User must type: +ping
module.exports.config = {
    name: "ping",
    prefix: true  // Requires prefix
};
```

### No Prefix Needed (prefix: false)
```javascript
// User can just type: hi
module.exports.config = {
    name: "hi",
    prefix: false  // No prefix needed
};
```

### Examples:
- **With Prefix**: `+ping`, `+info`, `+kick @user`
- **Without Prefix**: `hi`, `time`, `weather London`

## Basic Command Structure

```javascript
// CMD-V2 Format
module.exports.config = {
    name: "commandname",
    description: "Command description",
    usage: "commandname [args]",
    category: "utility",
    permission: 0,        // 0=everyone, 1=admin
    cooldown: 3,         // seconds
    prefix: true         // true=requires prefix (!cmd), false=no prefix (cmd)
};

module.exports.languages = {
    "en": {
        "key": "English text with %1 placeholder"
    },
    "bn": {
        "key": "Bengali text with %1 placeholder"
    }
};

module.exports.run = async (ctx) => {
    // Your command logic here
    const { reply, getText } = ctx;
    return reply(getText("key", "value"));
};
```

## Comprehensive Context (ctx) Object - Full GA-FCA Support

### Core Data (Ultra-Short)
- `e` - Event object with enhanced properties
- `api` - Enhanced Facebook API object with all GA-FCA features
- `args` - Command arguments array
- `getText` - Get translated text

### Ultra-Short Messaging
- `$(msg, tid, mid)` - Send message (ultra-short)
- `reply(msg)` - Reply to current message
- `react(emoji, mid)` - React to message
- `send(msg, tid, mid)` - Send message to specific thread
- `unsend(mid)` - Unsend/delete message
- `markRead(tid)` - Mark thread as read
- `markDelivered(tid)` - Mark thread as delivered

### Reply Message Support
- `replyMsg` - Full reply message object
- `isReply` - Boolean: is this a reply to another message
- `replyID` - User ID of replied message sender
- `replyBody` - Text content of replied message
- `replyAttachments` - Attachments in replied message

### Ultra-Short HTTP & Streams
- `get(url, opts)` - HTTP GET request
- `post(url, data, opts)` - HTTP POST request
- `stream(url)` - Get stream from URL for attachments

### Attachment Helpers
- `attach(stream)` - Create attachment object
- `photo(stream)` - Send photo attachment
- `video(stream)` - Send video attachment
- `audio(stream)` - Send audio attachment
- `file(stream)` - Send file attachment

### Ultra-Short User Management (Single Letter)
- `u.id` - Sender's user ID
- `u.mentions` - Mentioned users object
- `u.admin()` - Check if user is admin
- `u.info()` - Get user information (async)
- `u.nick(nickname, tid)` - Set user's nickname

### Ultra-Short Thread Management (Single Letter)
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

### Group Management Shortcuts
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

### Ultra-Short Utilities (Comprehensive)
- `_.read(path)` - Read file content
- `_.write(path, data)` - Write file content
- `_.exists(path)` - Check if file exists
- `_.delete(path)` - Delete file
- `_.mkdir(path)` - Create directory
- `_.rand(min, max)` - Random number
- `_.pick(array)` - Random array element
- `_.shuffle(array)` - Shuffle array
- `_.uuid()` - Generate unique ID
- `_.sleep(ms)` - Async sleep
- `_.delay(ms)` - Async delay
- `_.timeout(promise, ms)` - Promise with timeout
- `_.cap(str)` - Capitalize string
- `_.cut(str, len)` - Truncate string
- `_.clean(str)` - Remove special characters
- `_.escape(str)` - Escape regex characters
- `_.now()` - Current timestamp
- `_.time()` - Current time string
- `_.date()` - Current date string
- `_.iso()` - ISO timestamp
- `_.json(obj)` - JSON stringify
- `_.parse(str)` - JSON parse
- `_.clone(obj)` - Deep clone object
- `_.merge(obj1, obj2)` - Merge objects
- `_.chunk(arr, size)` - Split array into chunks
- `_.unique(arr)` - Remove duplicates
- `_.flatten(arr)` - Flatten nested arrays
- `_.isUrl(str)` - Check if valid URL
- `_.isEmail(str)` - Check if valid email
- `_.isNumber(str)` - Check if valid number
- `_.isEmpty(val)` - Check if empty

### Ultra-Short Bot (Single Letter)
- `b.name` - Bot name
- `b.prefix` - Command prefix
- `b.owner` - Bot owner
- `b.up()` - Bot uptime
- `b.stats` - Bot statistics

### Ultra-Short Database (Single Letter)
- `d.u.get(id)` - Get user data
- `d.u.set(id, data)` - Update user data
- `d.u.exp(id, exp)` - Add experience
- `d.u.money(id, amount)` - Add money
- `d.t.get(id)` - Get thread data
- `d.t.set(id, data)` - Update thread data

### Enhanced API Object
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

### Enhanced Event Object
- `event.isGroup` - Is this a group chat
- `event.attachments` - Message attachments
- `event.hasAttachments` - Has attachments boolean
- `event.mentions` - Mentioned users
- `event.hasMentions` - Has mentions boolean
- `event.isReply` - Is reply to another message
- `event.replyTo` - Reply message object
- `event.timestamp` - Message timestamp
- `event.type` - Message type

### Auto-Imports & Globals
- `fs` - File system module
- `path` - Path module
- `axios` - HTTP client module
- `console` - Console logging
- `setTimeout` - Set timeout
- `setInterval` - Set interval
- `Buffer` - Buffer utilities
- `process.env` - Environment variables

## Comprehensive Examples - Full GA-FCA Features

### 1. Basic Examples

#### Echo Command (1 line!)
```javascript
module.exports.run = async ({ args, reply }) => reply(args.length ? `🔊 ${args.join(" ")}` : "❌ No message!");
```

#### User Info with Database (2 lines!)
```javascript
module.exports.run = async ({ u, d, reply }) => {
    const user = d.u.get(u.id), info = await u.info();
    return reply(`👤 ${info[u.id].name}\n⭐ Level: ${user.level}\n💰 Money: ${user.money}`);
};
```

#### Random API Call (1 line!)
```javascript
module.exports.run = async ({ get, reply }) => reply(`😂 ${(await get("https://official-joke-api.appspot.com/random_joke")).setup}`);
```

### 2. Reply Message Examples

#### Reply Info (2 lines!)
```javascript
module.exports.run = async ({ isReply, replyID, replyBody, reply }) => {
    return isReply ? reply(`📝 Reply from ${replyID}: "${replyBody}"`) : reply("❌ Reply to a message!");
};
```

#### Reply with User Info (3 lines!)
```javascript
module.exports.run = async ({ isReply, replyID, api, reply }) => {
    if (!isReply) return reply("❌ Reply to someone's message!");
    const info = await api.getUserInfo(replyID);
    return reply(`👤 ${info[replyID].name} (ID: ${replyID})`);
};
```

### 3. Attachment Examples

#### Send Photo from URL (1 line!)
```javascript
module.exports.run = async ({ args, stream, reply }) => reply({ body: "📸 Photo!", attachment: await stream(args[0]) });
```

#### Multiple Attachments (2 lines!)
```javascript
module.exports.run = async ({ args, stream, reply }) => {
    const attachments = await Promise.all(args.map(url => stream(url)));
    return reply({ body: "📁 Multiple files!", attachment: attachments });
};
```

#### File Upload with Info (3 lines!)
```javascript
module.exports.run = async ({ args, stream, _, reply }) => {
    const fileStream = await stream(args[0]);
    const fileInfo = `📄 File: ${_.cut(args[0], 50)}\n📅 ${_.time()}`;
    return reply({ body: fileInfo, attachment: fileStream });
};
```

### 4. Group Management Examples

#### Ultra-Minimal Kick (1 line!)
```javascript
module.exports.run = async ({ u, t, reply }) => Object.keys(u.mentions)[0] ? (t.kick(Object.keys(u.mentions)[0]), reply("✅ Kicked!")) : reply("❌ Mention someone!");
```

#### Group Title Change (1 line!)
```javascript
module.exports.run = async ({ args, t, reply }) => args.length ? (t.title(args.join(" ")), reply("✅ Title changed!")) : reply("❌ Provide title!");
```

#### Promote User (2 lines!)
```javascript
module.exports.run = async ({ u, t, reply }) => {
    const target = Object.keys(u.mentions)[0];
    return target ? (t.promote(target), reply("✅ Promoted!")) : reply("❌ Mention someone!");
};
```

#### Group Info Display (3 lines!)
```javascript
module.exports.run = async ({ t, reply }) => {
    const info = await t.info();
    return reply(`📊 Group: ${info.threadName}\n👥 Members: ${info.participantIDs.length}\n👑 Admins: ${info.adminIDs.length}`);
};
```

### 5. Advanced Features

#### Typing Indicator (2 lines!)
```javascript
module.exports.run = async ({ api, t, reply, _ }) => {
    api.sendTyping(t.id); await _.sleep(2000);
    return reply("✅ Done thinking!");
};
```

#### Bulk Message Send (3 lines!)
```javascript
module.exports.run = async ({ args, api, reply }) => {
    const message = args.join(" ");
    const threads = ["thread1", "thread2", "thread3"]; // Your thread IDs
    await api.bulkSend([message], threads);
    return reply("✅ Sent to all groups!");
};
```

#### Search and Add User (4 lines!)
```javascript
module.exports.run = async ({ args, api, t, reply }) => {
    const searchName = args.join(" ");
    const threads = await api.searchForThread(searchName);
    if (!threads.length) return reply("❌ No threads found!");
    return reply(`🔍 Found: ${threads.slice(0,5).map(th => th.name).join(", ")}`);
};
```

### 6. File & Data Operations

#### Save User Data (2 lines!)
```javascript
module.exports.run = async ({ args, u, _, reply }) => {
    _.write(`./users/${u.id}.json`, _.json({ name: args.join(" "), saved: _.now() }));
    return reply("✅ Data saved!");
};
```

#### Load and Display Data (3 lines!)
```javascript
module.exports.run = async ({ u, _, reply }) => {
    if (!_.exists(`./users/${u.id}.json`)) return reply("❌ No data found!");
    const data = _.parse(_.read(`./users/${u.id}.json`));
    return reply(`📄 Your data: ${data.name} (saved: ${new Date(data.saved).toLocaleString()})`);
};
```

### 7. Utility Examples

#### Random Team Generator (3 lines!)
```javascript
module.exports.run = async ({ t, _, reply }) => {
    const info = await t.info(), members = _.shuffle(info.participantIDs);
    const teams = _.chunk(members, Math.ceil(members.length / 2));
    return reply(`🏆 Team 1: ${teams[0]?.length || 0} members\n🏆 Team 2: ${teams[1]?.length || 0} members`);
};
```

#### URL Validator (1 line!)
```javascript
module.exports.run = async ({ args, _, reply }) => reply(_.isUrl(args[0]) ? "✅ Valid URL!" : "❌ Invalid URL!");
```

#### Data Merger (2 lines!)
```javascript
module.exports.run = async ({ args, _, reply }) => {
    const merged = _.merge({ default: true }, _.parse(args.join(" ") || "{}"));
    return reply(`🔗 Merged: ${_.json(merged)}`);
};
```

### 8. Complex Examples (Still Ultra-Minimal!)

#### Smart Reply Handler (4 lines!)
```javascript
module.exports.run = async ({ isReply, replyBody, args, reply, _ }) => {
    if (isReply && _.isUrl(replyBody)) return reply({ body: "🖼️ Image from reply!", attachment: await stream(replyBody) });
    if (isReply) return reply(`📝 You replied to: "${_.cut(replyBody, 50)}"`);
    return reply(args.length ? `💬 ${args.join(" ")}` : "❌ Say something or reply to a message!");
};
```

#### Group Statistics (5 lines!)
```javascript
module.exports.run = async ({ t, api, reply, _ }) => {
    const info = await t.info();
    const activeUsers = info.participantIDs.slice(0, 10); // Limit for performance
    const userInfos = await Promise.all(activeUsers.map(id => api.getUserInfo(id)));
    const names = userInfos.map(ui => Object.values(ui)[0]?.name || "Unknown");
    return reply(`📊 Group Stats:\n👥 Total: ${info.participantIDs.length}\n👑 Admins: ${info.adminIDs.length}\n🔥 Active: ${names.slice(0,5).join(", ")}`);
};
```

## File Structure
```
modules/cmd-v2/
├── README.md          # This documentation
├── echo.js           # Simple echo command
├── weather.js        # HTTP request example
├── profile.js        # Database example
├── cat.js           # Image/stream example
└── kick.js          # Group management example
```

## Migration from Regular Commands
CMD-V2 commands are automatically translated to MiraiV2 format, so they work seamlessly with existing commands.

## Best Practices
1. Always handle errors with try-catch
2. Use `react()` to show command status
3. Validate user input before processing
4. Use database shortcuts for user data
5. Keep commands simple and focused
6. Add proper language support

## Troubleshooting
- Commands not loading? Check syntax and file structure
- HTTP requests failing? Check URL and network
- Database errors? Ensure user/thread exists
- Stream errors? Verify URL and file type
