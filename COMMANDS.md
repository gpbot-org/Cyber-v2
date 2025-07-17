# Cyber-v2 MiraiV2 Command System

This bot uses the complete MiraiV2 command structure with ga-fca integration for easy command creation and management.

## Command Structure

Every command follows this structure:

```javascript
module.exports.config = {
    name: "commandname",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Author Name",
    description: "Command description",
    commandCategory: "category",
    usages: "[arguments]",
    cooldowns: 5,
    dependencies: {
        "package-name": ""
    }
};

module.exports.languages = {
    "bn": {
        "key": "Bangla text with %1 placeholders"
    },
    "en": {
        "key": "English text with %1 placeholders"
    }
};

module.exports.run = async function({ event, api, args, getText, Users, Threads, Currencies }) {
    // Command logic here
};
```

## Configuration Options

### `config` Object

- **`name`** (string): Command name (lowercase, no spaces)
- **`version`** (string): Command version
- **`hasPermssion`** (number): Permission level
  - `0`: Everyone can use
  - `1`: Moderators only
  - `2`: Admins only
- **`credits`** (string): Command author
- **`description`** (string): What the command does
- **`commandCategory`** (string): Command category for help system
- **`usages`** (string): How to use the command (without prefix)
- **`cooldowns`** (number): Cooldown in seconds
- **`dependencies`** (object): Required npm packages

### `languages` Object

Multi-language support with placeholders:
- Use `%1`, `%2`, etc. for dynamic values
- Support for `vi` (Vietnamese) and `en` (English)
- Falls back to English if current language not found

### `run` Function Parameters

- **`event`**: Facebook message event object
  - `event.threadID`: Thread/group ID
  - `event.senderID`: User ID who sent command
  - `event.messageID`: Message ID
  - `event.body`: Full message text
- **`api`**: Facebook API object
  - `api.sendMessage(message, threadID, callback, messageID)`
  - `api.editMessage(newText, messageID, callback)`
  - `api.unsendMessage(messageID, callback)`
- **`args`**: Array of command arguments
- **`getText(key, ...replacements)`**: Get localized text
- **`Users`**: Database access for user data
- **`Threads`**: Database access for thread data
- **`Currencies`**: Database access for currency data

## Global Objects

### `global.client`
Access to the main bot instance:
```javascript
const bot = global.client;
bot.config // Bot configuration
bot.commands // All loaded commands
bot.database // Database instance
bot.lang // Language manager
```

### `global.utils`
Utility functions:
```javascript
global.utils.getContent(url) // HTTP GET request
global.utils.downloadFile(url, path) // Download file
global.utils.randomString(length) // Generate random string
global.utils.assets.data(name) // Get asset file path
```

### `global.nodemodule`
Access to required modules:
```javascript
global.nodemodule["fs-extra"] // File system operations
global.nodemodule["path"] // Path utilities
global.nodemodule["axios"] // HTTP client
```

## Example Commands

### Simple Command
```javascript
module.exports.config = {
    name: "hello",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Your Name",
    description: "Say hello",
    commandCategory: "general",
    usages: "",
    cooldowns: 3
};

module.exports.languages = {
    "en": {
        "hello": "Hello %1! 👋"
    }
};

module.exports.run = async function({ event, api, getText }) {
    const { threadID, messageID, senderID } = event;
    const bot = global.client;
    
    const userInfo = await bot.getUserInfo(senderID);
    const message = getText("hello", userInfo.name);
    
    return api.sendMessage(message, threadID, messageID);
};
```

### Command with Arguments
```javascript
module.exports.config = {
    name: "say",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Your Name",
    description: "Make the bot say something",
    commandCategory: "fun",
    usages: "<message>",
    cooldowns: 2
};

module.exports.run = async function({ event, api, args }) {
    const { threadID, messageID } = event;
    
    if (args.length === 0) {
        return api.sendMessage("❌ Please provide a message to say", threadID, messageID);
    }
    
    const message = args.join(" ");
    return api.sendMessage(message, threadID, messageID);
};
```

### Command with File Operations
```javascript
module.exports.config = {
    name: "image",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Your Name",
    description: "Send a random image",
    commandCategory: "media",
    usages: "",
    cooldowns: 5,
    dependencies: {
        "fs-extra": "",
        "path": ""
    }
};

module.exports.run = async function({ event, api }) {
    const { createReadStream, unlinkSync } = global.nodemodule["fs-extra"];
    const { join } = global.nodemodule["path"];
    const { threadID, messageID } = event;
    
    try {
        // Download image
        const imageUrl = "https://picsum.photos/800/600";
        const imagePath = join(__dirname, "..", "..", "assets", "temp", "random.jpg");
        
        await global.utils.downloadFile(imageUrl, imagePath);
        
        return api.sendMessage({
            body: "🖼️ Here's a random image!",
            attachment: createReadStream(imagePath)
        }, threadID, function() {
            unlinkSync(imagePath); // Clean up
        }, messageID);
        
    } catch (error) {
        return api.sendMessage("❌ Failed to get image", threadID, messageID);
    }
};
```

## Best Practices

1. **Always handle errors** with try-catch blocks
2. **Clean up temporary files** after use
3. **Use getText()** for all user-facing messages
4. **Validate arguments** before processing
5. **Set appropriate cooldowns** to prevent spam
6. **Use descriptive command names** and categories
7. **Include proper credits** and version info
8. **Test commands thoroughly** before deployment

## Migration from Old System

To convert old commands to MiraiV2 style:

1. Replace `module.exports = { ... }` with `module.exports.config = { ... }`
2. Add `module.exports.languages = { ... }` for text
3. Change `execute(bot, message, args)` to `run({ event, api, args, getText })`
4. Update message sending: `bot.sendMessage()` → `api.sendMessage()`
5. Update event properties: `message.threadID` → `event.threadID`
6. Replace language calls: `bot.lang.t()` → `getText()`

## Available Commands

- **help** - Show command list and information
- **ping** - Check bot response time
- **info** - Show bot information and stats
- **anime** - Get random anime images with tags
- **admin** - Admin management (converted to MiraiV2 style)
- **restart** - Restart the bot (admin only)

All commands support both English and Vietnamese languages with automatic fallback.
