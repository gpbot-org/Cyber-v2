# GA-FCA Enhanced CMD-V2 Features Documentation

## Overview

The enhanced CMD-V2 system now includes comprehensive GA-FCA (Facebook Chat API) support with ultra-minimal syntax. This document outlines all available features and how to use them.

## Enhanced Context Object

When you create a CMD-V2 command, you get access to an enhanced context object with the following properties:

### Ultra-Short Messaging

```javascript
const { 
    $,           // Ultra-short send: $(message, threadID, messageID)
    reply,       // Reply to current message: reply(message)
    react,       // React to message: react(emoji, messageID)
    send,        // Send message: send(message, threadID, messageID)
    edit,        // Edit message: edit(newMessage, messageID)
    unsend,      // Unsend message: unsend(messageID)
    delete,      // Delete message: delete(messageID)
    forward,     // Forward message: forward(messageID, threadID)
    typing,      // Show typing: typing(threadID, state)
    typingV2     // Enhanced typing: typingV2(threadID, state)
} = ctx;
```

### Message Status Management

```javascript
const {
    markRead,       // Mark thread as read: markRead(threadID)
    markDelivered,  // Mark as delivered: markDelivered(threadID)
    markSeen,       // Mark as seen: markSeen(threadID)
    markAllRead     // Mark all threads as read: markAllRead()
} = ctx;
```

### HTTP Methods

```javascript
const {
    get,            // GET request: get(url, options)
    post,           // POST request: post(url, data, options)
    stream,         // Get stream: stream(url, options)
    httpGet,        // Advanced GET: httpGet(url, options)
    httpPost,       // Advanced POST: httpPost(url, data, options)
    httpPostForm    // Form data POST: httpPostForm(url, data, options)
} = ctx;
```

### File and Attachment Handling

```javascript
const {
    attach,         // Create attachment: attach(stream, type)
    photo,          // Photo attachment: photo(stream)
    video,          // Video attachment: video(stream)
    audio,          // Audio attachment: audio(stream)
    file,           // File attachment: file(stream)
    upload          // Upload attachment: upload(attachment)
} = ctx;
```

### User Management (Ultra-Short: `u`)

```javascript
const { u } = ctx;

// User information
u.id                    // Current user ID
u.info(userID)          // Get user info
u.avatar(userID)        // Get user avatar
u.uid(name)             // Get user ID by name
u.getUID(name)          // Alternative get UID
u.current()             // Get current user ID
u.admin()               // Check if user is admin
u.mentions              // Message mentions

// User profile management
u.changeName(name)      // Change user name
u.changeUsername(user)  // Change username
u.changeBio(bio)        // Change bio
u.changeAvatar(img)     // Change avatar
u.changeAvatarV2(img)   // Change avatar v2
u.changeCover(img)      // Change cover photo
u.nick(nickname, tid, uid) // Change nickname

// Social features
u.block(userID, state)     // Block/unblock user
u.blockMqtt(userID, state) // Block via MQTT
u.follow(userID)           // Follow user
u.unfollow(userID)         // Unfollow user
u.friends()                // Get friends list
u.handleFriend(uid, action) // Handle friend request
```

### Thread Management (Ultra-Short: `t`)

```javascript
const { t } = ctx;

// Thread information
t.id                    // Current thread ID
t.info(threadID)        // Get thread info
t.list()                // Get thread list
t.history(tid, amount)  // Get thread history
t.pics(threadID)        // Get thread pictures
t.search(query)         // Search threads

// Thread customization
t.title(newTitle, tid)  // Set thread title
t.emoji(newEmoji, tid)  // Set thread emoji
t.color(newColor, tid)  // Set thread color
t.img(image, tid)       // Set thread image

// Member management
t.kick(userID, tid)     // Remove user from group
t.add(userID, tid)      // Add user to group
t.promote(userID, tid)  // Promote to admin
t.demote(userID, tid)   // Demote from admin
t.nick(nickname, uid, tid) // Change member nickname
t.leave(threadID)       // Leave thread

// Thread status
t.archive(tid, state)   // Archive thread
t.mute(tid, seconds)    // Mute thread
t.delete(threadID)      // Delete thread

// Advanced features
t.create(name, userIDs) // Create new group
t.poll(question, opts, tid) // Create poll
t.pin(messageID, action)    // Pin message
t.handleMsg(tid, action)    // Handle message request
```

### Group Management (Alias: `gc`)

```javascript
const { gc } = ctx;

// Same as 't' but focused on group operations
gc.kick(userID, tid)
gc.add(userID, tid)
gc.promote(userID, tid)
gc.demote(userID, tid)
gc.title(title, tid)
gc.emoji(emoji, tid)
gc.color(color, tid)
gc.img(image, tid)
gc.nick(nickname, uid, tid)
gc.leave(threadID)
gc.info(threadID)
gc.create(name, userIDs)
gc.poll(question, opts, tid)
```

### Message Utilities (Ultra-Short: `m`)

```javascript
const { m } = ctx;

m.get(messageID)        // Get message by ID
m.react(emoji, mid)     // React to message
m.unsend(messageID)     // Unsend message
m.delete(messageID)     // Delete message
m.edit(newMsg, mid)     // Edit message
m.forward(mid, tid)     // Forward message
m.pin(mid, action)      // Pin/unpin message
```

### Post/Story Utilities (Ultra-Short: `p`)

```javascript
const { p } = ctx;

p.create(content, target)    // Create post
p.comment(content, postID)   // Comment on post
p.react(postID, type)        // React to post
p.storyReact(storyID, type)  // React to story
```

### Search Utilities (Ultra-Short: `s`)

```javascript
const { s } = ctx;

s.thread(query)         // Search threads
s.stickers(query)       // Search stickers
s.emoji(emoji)          // Get emoji URL
```

### Share Utilities

```javascript
const { share } = ctx;

share.contact(contact, tid)  // Share contact
share.link(link, tid)        // Share link
```

### System Utilities

```javascript
const { sys } = ctx;

sys.logout()            // Logout from Facebook
sys.refresh()           // Refresh session
sys.access()            // Get access token
sys.listen(callback)    // Listen for messages
sys.notification(cb)    // Listen for notifications
sys.module(module)      // Add external module
```

### Utility Functions (Ultra-Short: `_`)

```javascript
const { _ } = ctx;

// File operations
_.read(path)           // Read file
_.write(path, data)    // Write file
_.exists(path)         // Check if file exists
_.delete(path)         // Delete file
_.mkdir(path)          // Create directory

// String utilities
_.capitalize(str)      // Capitalize string
_.trim(str)           // Trim string
_.split(str, sep)     // Split string
_.join(arr, sep)      // Join array
_.cut(str, length)    // Cut string to length

// Array utilities
_.shuffle(array)      // Shuffle array
_.unique(array)       // Get unique values
_.chunk(arr, size)    // Split array into chunks
_.pick(array)         // Pick random item
_.flatten(array)      // Flatten array

// Object utilities
_.keys(obj)           // Get object keys
_.values(obj)         // Get object values
_.entries(obj)        // Get object entries
_.clone(obj)          // Clone object
_.merge(obj1, obj2)   // Merge objects

// Time utilities
_.now()               // Current timestamp
_.time()              // Current time string
_.date()              // Current date string
_.iso()               // ISO string
_.sleep(ms)           // Sleep for milliseconds

// Random utilities
_.rand(min, max)      // Random number
_.uuid()              // Generate UUID

// Validation utilities
_.isUrl(str)          // Check if URL
_.isEmail(str)        // Check if email
_.isNumber(str)       // Check if number
_.isEmpty(val)        // Check if empty

// Logging utilities
_.log(...args)        // Console log
_.error(...args)      // Console error
_.warn(...args)       // Console warn

// Data utilities
_.json(obj)           // Stringify JSON
_.parse(str)          // Parse JSON

// URL utilities
_.url(base, params)   // Build URL with params

// Color utilities
_.colors              // Available thread colors
_.color(name)         // Get color by name
_.resolve(url)        // Resolve photo URL
```

## Usage Examples

### Basic Cat Command

```javascript
module.exports.run = async (ctx) => {
    const { reply, get, stream, react } = ctx;
    
    try {
        await react("😍");
        
        const catData = await get("https://api.thecatapi.com/v1/images/search");
        const imageStream = await stream(catData[0].url);
        
        return reply({
            body: "🐱 Here's your cat!",
            attachment: imageStream
        });
    } catch (error) {
        await react("😢");
        return reply("❌ Failed to get cat!");
    }
};
```

### Advanced Group Management

```javascript
module.exports.run = async (ctx) => {
    const { reply, args, u, t, gc } = ctx;
    
    if (!u.admin()) {
        return reply("❌ Admin only!");
    }
    
    const action = args[0];
    const userID = args[1];
    
    switch (action) {
        case 'kick':
            await gc.kick(userID);
            return reply("✅ User kicked!");
            
        case 'promote':
            await gc.promote(userID);
            return reply("✅ User promoted!");
            
        case 'title':
            await gc.title(args.slice(1).join(' '));
            return reply("✅ Title changed!");
            
        case 'color':
            await gc.color(args[1]);
            return reply("✅ Color changed!");
            
        case 'poll':
            await gc.poll("What's your favorite color?", [
                "Red", "Blue", "Green", "Yellow"
            ]);
            return reply("✅ Poll created!");
    }
};
```

### File and Stream Handling

```javascript
module.exports.run = async (ctx) => {
    const { reply, get, stream, upload, _ } = ctx;
    
    try {
        // Download image
        const imageStream = await stream("https://example.com/image.jpg");
        
        // Upload to Facebook
        const uploadedAttachment = await upload(imageStream);
        
        // Send with attachment
        return reply({
            body: "📸 Here's your image!",
            attachment: uploadedAttachment
        });
    } catch (error) {
        _.error("Upload failed:", error);
        return reply("❌ Upload failed!");
    }
};
```

### User Profile Management

```javascript
module.exports.run = async (ctx) => {
    const { reply, args, u } = ctx;
    
    const action = args[0];
    
    switch (action) {
        case 'avatar':
            const avatarUrl = await u.avatar(u.id);
            return reply(`🖼️ Your avatar: ${avatarUrl}`);
            
        case 'info':
            const userInfo = await u.info();
            return reply(`👤 Name: ${userInfo.name}\n📧 ID: ${userInfo.id}`);
            
        case 'friends':
            const friends = await u.friends();
            return reply(`👥 You have ${friends.length} friends!`);
            
        case 'bio':
            await u.changeBio(args.slice(1).join(' '));
            return reply("✅ Bio updated!");
    }
};
```

### Advanced HTTP Operations

```javascript
module.exports.run = async (ctx) => {
    const { reply, httpGet, httpPost, httpPostForm } = ctx;
    
    try {
        // GET request
        const getData = await httpGet("https://api.example.com/data");
        
        // POST request
        const postData = await httpPost("https://api.example.com/submit", {
            key: "value"
        });
        
        // Form data POST
        const formData = await httpPostForm("https://api.example.com/upload", {
            file: "base64data"
        });
        
        return reply("✅ HTTP operations completed!");
    } catch (error) {
        return reply(`❌ HTTP Error: ${error.message}`);
    }
};
```

## Command Structure

### Basic Structure

```javascript
module.exports.config = {
    name: "commandname",
    description: "Command description",
    usage: "commandname [options]",
    category: "category",
    permission: 0,
    cooldown: 3,
    prefix: false,
    aliases: ["alias1", "alias2"]
};

module.exports.languages = {
    "en": {
        "key": "English text"
    },
    "bn": {
        "key": "Bengali text"
    }
};

module.exports.run = async (ctx) => {
    // Command logic here
};

// Optional: Handle reactions
module.exports.handleReaction = async ({ event, api, Threads, Users }) => {
    // Reaction handling logic
};
```

### Advanced Features

- **Reaction Handling**: Commands can respond to message reactions
- **Multi-language Support**: Built-in language system
- **Error Recovery**: Automatic error handling and logging
- **Performance Monitoring**: Built-in performance tracking
- **Hot Reload**: Commands can be reloaded without restart
- **Caching**: Automatic command caching for better performance
- **Permission System**: Built-in permission levels
- **Cooldown System**: Prevent command spam
- **Alias Support**: Multiple names for the same command

## Best Practices

1. **Use Ultra-Short Syntax**: Leverage the single-letter shortcuts (`u`, `t`, `m`, `p`, `s`, `_`)
2. **Error Handling**: Always wrap async operations in try-catch blocks
3. **Performance**: Use caching and avoid unnecessary API calls
4. **User Experience**: Provide clear feedback with reactions and typing indicators
5. **Documentation**: Comment your code for better maintainability
6. **Testing**: Test commands thoroughly before deployment

## Migration Guide

### From Old Format to CMD-V2

Old format:
```javascript
module.exports.run = async ({ event, api, args, getText }) => {
    await api.sendMessage("Hello!", event.threadID);
};
```

New CMD-V2 format:
```javascript
module.exports.run = async (ctx) => {
    const { reply } = ctx;
    await reply("Hello!");
};
```

### Enhanced Features Migration

Old approach:
```javascript
// Old way - multiple lines
await api.sendTypingIndicator(event.threadID);
await api.sendMessage(message, event.threadID);
await api.setMessageReaction("😍", event.messageID);
```

New approach:
```javascript
// New way - ultra-short
const { typing, reply, react } = ctx;
await typing();
await reply(message);
await react("😍");
```

This documentation covers all the enhanced GA-FCA features available in the CMD-V2 system. The ultra-minimal syntax makes bot development faster and more intuitive while providing access to all advanced Facebook Chat API features.