# 🚀 CMD-V2 Ultimate System

The CMD-V2 system provides **COMPREHENSIVE FACEBOOK CHAT API SUPPORT** with ultra-minimal syntax. Access ALL GA-FCA features in just 1-5 lines of code!

## 🎯 Key Features

- **🚀 Ultra-Minimal Syntax** - Full-featured commands in 1-5 lines
- **⚡ High Performance** - Advanced caching and optimization
- **🔧 Flexible Prefix System** - Commands can require prefix or work without
- **🌐 Complete HTTP Client** - Ultra-short `get()`, `post()`, `stream()`
- **📁 File System Shortcuts** - Single-letter file operations
- **💾 Database Shortcuts** - Ultra-short database access
- **🎯 Attachment Support** - Easy image/video/audio/file handling
- **📱 Group Management** - Complete group admin features
- **💬 Reply Message Support** - Handle message replies effortlessly
- **🔄 Auto Translation** - Automatic MiraiV2 compatibility
- **📊 Performance Monitoring** - Automatic slow command detection
- **🎨 Thread Customization** - Title, emoji, color, nickname management
- **👥 User Management** - Add, remove, promote, demote users
- **📨 Advanced Messaging** - Typing indicators, reactions, forwarding
- **🔍 Search & Discovery** - Thread and user search capabilities

## 📁 Basic Structure

```javascript
// Ultra-minimal command structure
module.exports.config = {
    name: "commandname",
    description: "Command description",
    usage: "commandname [args]",
    category: "utility",
    permission: 0,        // 0=everyone, 1=moderator, 2=admin
    cooldown: 3,         // seconds
    prefix: true         // true=requires prefix (+cmd), false=no prefix (cmd)
};

module.exports.languages = {
    "en": {
        "message": "Hello %1!"
    }
};

module.exports.run = async (ctx) => {
    const { reply, getText } = ctx;
    return reply(getText("message", "World"));
};
```

## 🎯 Prefix Configuration

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

## 🔧 Quick Reference

### Core Shortcuts
- `reply(msg)` - Reply to current message
- `$(msg, tid, mid)` - Send message (ultra-short)
- `react(emoji, mid)` - React to message
- `get(url)` - HTTP GET request
- `post(url, data)` - HTTP POST request
- `stream(url)` - Get attachment stream

### User & Thread
- `u.id` - User ID
- `u.mentions` - Mentioned users
- `u.admin()` - Check if admin
- `t.id` - Thread ID
- `t.group()` - Is group chat
- `t.kick(userID)` - Remove user
- `t.title(newTitle)` - Change title

### Utilities
- `_.rand(min, max)` - Random number
- `_.time()` - Current time
- `_.json(obj)` - JSON stringify
- `_.sleep(ms)` - Async delay

## 📖 Detailed Documentation

For complete documentation, see:
- [Context Object Reference](./context-reference.md)
- [Basic Examples](./basic-examples.md)
- [Advanced Examples](./advanced-examples.md)
- [GA-FCA Integration](./ga-fca-integration.md)

## 🎉 Ultra-Minimal Examples

### Echo Command (1 line!)
```javascript
module.exports.run = async ({ args, reply }) => reply(args.length ? `🔊 ${args.join(" ")}` : "❌ No message!");
```

### User Info (2 lines!)
```javascript
module.exports.run = async ({ u, d, reply }) => {
    const user = d.u.get(u.id), info = await u.info();
    return reply(`👤 ${info[u.id].name}\n⭐ Level: ${user.level}\n💰 Money: ${user.money}`);
};
```

### Group Kick (1 line!)
```javascript
module.exports.run = async ({ u, t, reply }) => Object.keys(u.mentions)[0] ? (t.kick(Object.keys(u.mentions)[0]), reply("✅ Kicked!")) : reply("❌ Mention someone!");
```

### API Call (1 line!)
```javascript
module.exports.run = async ({ get, reply }) => reply(`😂 ${(await get("https://official-joke-api.appspot.com/random_joke")).setup}`);
```

---

**Next**: [Context Object Reference](./context-reference.md) | [Basic Examples](./basic-examples.md)
