# 🔗 GA-FCA Integration

Complete integration with **GA-FCA (Grandpa Academy - Facebook Chat API)** providing full access to all Facebook Chat features through ultra-minimal syntax.

## 🎯 Overview

The CMD-V2 system provides seamless integration with GA-FCA, allowing you to access every Facebook Chat API feature through simple, ultra-minimal shortcuts.

## 📱 Core GA-FCA Features

### 💬 Messaging Features
- **Send Messages** - Text, attachments, stickers
- **Message Reactions** - React to messages with emojis
- **Message Management** - Unsend, forward, mark as read
- **Typing Indicators** - Show/hide typing status
- **Message Replies** - Reply to specific messages

### 👥 User Management
- **User Information** - Get user profiles and data
- **Friend Management** - Add, remove, block users
- **User Search** - Find users by name or ID
- **Nickname Management** - Set custom nicknames

### 🏠 Thread Management
- **Thread Information** - Get chat details and participants
- **Thread Customization** - Change title, emoji, color
- **Thread Search** - Find chats by name
- **Thread Settings** - Modify chat settings

### 👑 Group Administration
- **Member Management** - Add, remove, kick members
- **Admin Controls** - Promote, demote administrators
- **Group Settings** - Modify group properties
- **Group Moderation** - Control group behavior

## 🚀 Ultra-Minimal Access

### Basic Messaging
```javascript
// Send message (1 line)
reply("Hello World!");

// React to message (1 line)
react("😍");

// Send with attachment (1 line)
reply({ body: "Photo!", attachment: await stream(imageUrl) });
```

### User Operations
```javascript
// Get user info (2 lines)
const info = await u.info();
reply(`Hello ${info[u.id].name}!`);

// Check if admin (1 line)
if (u.admin()) reply("You're an admin!");

// Set nickname (1 line)
u.nick("New Nickname");
```

### Group Management
```javascript
// Kick user (1 line)
t.kick(Object.keys(u.mentions)[0]);

// Change group title (1 line)
t.title("New Group Name");

// Promote user (1 line)
t.promote(userID);
```

### Thread Customization
```javascript
// Change thread emoji (1 line)
t.emoji("🎉");

// Change thread color (1 line)
t.color("#FF0000");

// Get thread info (2 lines)
const info = await t.info();
reply(`Group: ${info.threadName}, Members: ${info.participantIDs.length}`);
```

## 🔧 Advanced GA-FCA Features

### Typing Indicators
```javascript
// Show typing for 3 seconds
api.sendTyping(t.id);
await _.sleep(3000);
reply("Done typing!");
```

### Message Forwarding
```javascript
// Forward message to another thread
api.forwardMessage(messageID, targetThreadID);
```

### Bulk Operations
```javascript
// Send to multiple threads
await api.bulkSend(["Hello everyone!"], [thread1, thread2, thread3]);
```

### Thread Search
```javascript
// Search for threads
const threads = await api.searchForThread("group name");
reply(`Found ${threads.length} matching threads`);
```

### Poll Creation
```javascript
// Create a poll
api.createPoll("What's your favorite color?", ["Red", "Blue", "Green"], t.id);
```

## 📊 Data Access

### User Data
```javascript
// Get comprehensive user info
const userInfo = await api.getUserInfo(userID);
const userData = d.u.get(userID);

reply(`User: ${userInfo[userID].name}
Level: ${userData.level}
Money: ${userData.money}
Experience: ${userData.exp}`);
```

### Thread Data
```javascript
// Get thread details
const threadInfo = await api.getThreadInfo(t.id);
const threadData = d.t.get(t.id);

reply(`Thread: ${threadInfo.threadName}
Members: ${threadInfo.participantIDs.length}
Admins: ${threadInfo.adminIDs.length}
Custom Data: ${_.json(threadData)}`);
```

## 🎨 Customization Features

### Thread Appearance
```javascript
// Complete thread makeover (4 lines)
t.title("🎉 Party Group");
t.emoji("🎊");
t.color("#FF6B6B");
reply("Group updated!");
```

### User Nicknames
```javascript
// Set nicknames for mentioned users
Object.keys(u.mentions).forEach(userID => {
    t.nick(`👑 ${u.mentions[userID]}`, userID);
});
reply("Nicknames updated!");
```

## 📎 Attachment Handling

### Image Processing
```javascript
// Handle image from URL or reply
if (isReply && replyAttachments.length > 0) {
    const imageStream = await stream(replyAttachments[0].url);
    reply({ body: "Processed image!", attachment: imageStream });
} else if (args[0] && _.isUrl(args[0])) {
    const imageStream = await stream(args[0]);
    reply({ body: "Image from URL!", attachment: imageStream });
}
```

### Multiple Attachments
```javascript
// Send multiple files
const attachments = await Promise.all([
    stream("https://example.com/image1.jpg"),
    stream("https://example.com/image2.jpg"),
    stream("https://example.com/video.mp4")
]);
reply({ body: "Multiple files!", attachment: attachments });
```

## 🔍 Search & Discovery

### User Search
```javascript
// Search users in current thread
const threadInfo = await t.info();
const searchQuery = args.join(" ").toLowerCase();
const matches = [];

for (const userID of threadInfo.participantIDs.slice(0, 20)) {
    const info = await api.getUserInfo(userID);
    if (info[userID].name.toLowerCase().includes(searchQuery)) {
        matches.push(`${info[userID].name} (${userID})`);
    }
}

reply(`Found ${matches.length} users:\n${matches.join("\n")}`);
```

### Thread Discovery
```javascript
// Find threads by name
const searchResults = await api.searchForThread(args.join(" "));
const threadList = searchResults.slice(0, 10).map(thread => 
    `${thread.name} (${thread.threadID})`
).join("\n");

reply(`Found threads:\n${threadList}`);
```

## 🛡️ Permission System

### Admin Checks
```javascript
// Multi-level permission check
if (u.admin()) {
    // Bot admin actions
    reply("Bot admin access granted!");
} else if (await isGroupAdmin(u.id, t.id)) {
    // Group admin actions
    reply("Group admin access granted!");
} else {
    reply("Insufficient permissions!");
}

async function isGroupAdmin(userID, threadID) {
    const info = await api.getThreadInfo(threadID);
    return info.adminIDs.includes(userID);
}
```

## 🔄 Event Integration

### Message Events
```javascript
// Handle different message types
switch (event.type) {
    case 'message':
        reply("Regular message received!");
        break;
    case 'message_reply':
        reply(`Reply to: ${replyBody}`);
        break;
    case 'message_unsend':
        reply("Message was unsent!");
        break;
}
```

### Attachment Events
```javascript
// Handle different attachment types
if (event.hasAttachments) {
    event.attachments.forEach(attachment => {
        switch (attachment.type) {
            case 'photo':
                reply("Photo received!");
                break;
            case 'video':
                reply("Video received!");
                break;
            case 'audio':
                reply("Audio received!");
                break;
            case 'file':
                reply("File received!");
                break;
        }
    });
}
```

## 🎯 Performance Optimization

### Efficient Operations
```javascript
// Batch user info requests
const userIDs = Object.keys(u.mentions);
const userInfos = await Promise.all(
    userIDs.map(id => api.getUserInfo(id))
);

// Process results efficiently
const userNames = userInfos.map(info => 
    Object.values(info)[0]?.name || "Unknown"
);

reply(`Users: ${userNames.join(", ")}`);
```

### Caching
```javascript
// Use built-in caching for repeated operations
const cachedThreadInfo = await t.info(); // Cached automatically
const cachedUserInfo = await u.info();   // Cached automatically
```

## 🌟 Best Practices

### Error Handling
```javascript
try {
    await t.kick(targetUserID);
    reply("✅ User kicked successfully!");
} catch (error) {
    reply(`❌ Failed to kick user: ${error.message}`);
}
```

### Rate Limiting
```javascript
// Respect Facebook's rate limits
await _.sleep(1000); // Wait 1 second between operations
```

### Resource Management
```javascript
// Limit resource-intensive operations
const participants = (await t.info()).participantIDs.slice(0, 50); // Limit to 50
```

---

**Next**: [Reply Messages](./reply-messages.md) | [Group Management](./group-management.md)
