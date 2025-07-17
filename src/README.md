# Source Directory Structure

This directory contains all the bot's source code organized into three main folders:

## 📁 Directory Structure

```
src/
├── cmd-v2/          # Enhanced CMD-V2 commands with GA-FCA support
├── commands/        # Traditional old syntax commands
└── events/          # Event handlers for different bot events
```

## 🚀 CMD-V2 Commands (`src/cmd-v2/`)

Enhanced commands with minimal syntax and full GA-FCA support:

- **cat.js** - Advanced cat image command with breed filtering, polls, and sharing
- **ping.js** - Enhanced ping command with detailed metrics
- **group.js** - Comprehensive group management with all GA-FCA features
- **unsend.js** - Message deletion with priority system and auto-cleanup

### Features:
- ✨ Ultra-minimal syntax with single-letter shortcuts
- 🔧 Full GA-FCA API integration
- 🎯 Enhanced error handling and recovery
- 📊 Performance monitoring
- 🌐 Multi-language support
- ⚡ Typing indicators and reactions
- 🎨 Advanced messaging features

### Usage Example:
```javascript
module.exports.run = async (ctx) => {
    const { reply, u, t, react, typing } = ctx;
    
    await typing(true);
    await react("⚡");
    
    if (!u.admin()) {
        return reply("❌ Admin only!");
    }
    
    await t.title("New Group Title");
    return reply("✅ Title changed!");
};
```

## 🔧 Old Syntax Commands (`src/commands/`)

Traditional commands for backward compatibility:

- **ping.js** - Basic ping command
- **help.js** - Show available commands
- **admin.js** - Admin management
- **unsend.js** - Simple message deletion (backward compatibility)

### Features:
- 🔄 Backward compatibility
- 📚 Traditional syntax
- 🛠️ Basic functionality
- 🎯 Simple structure

### Usage Example:
```javascript
module.exports.run = async function({ event, api, args, getText }) {
    const { threadID, messageID } = event;
    
    await api.sendMessage("Hello from old syntax!", threadID, messageID);
};
```

## 📡 Event Handlers (`src/events/`)

Handle different bot events:

- **message.js** - Process incoming messages
- **welcome.js** - Handle user join events
- **goodbye.js** - Handle user leave events
- **reaction.js** - Handle message reactions

### Features:
- 🎪 Event-driven architecture
- 🔄 Automatic user/thread data management
- 📊 Activity tracking
- 🎭 Auto-reactions and responses
- 🗃️ Database integration

### Usage Example:
```javascript
module.exports.run = async function({ event, api, Users, Threads }) {
    const { threadID, senderID } = event;
    
    // Update user data
    await Users.createData(senderID, { lastActive: Date.now() });
    
    // Send welcome message
    await api.sendMessage("Welcome to the group!", threadID);
};
```

## 📋 Command Configuration

### CMD-V2 Configuration:
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
```

### Old Syntax Configuration:
```javascript
module.exports.config = {
    name: "commandname",
    version: "1.0.0",
    permission: 0,
    credits: "Author",
    description: "Command description",
    category: "category",
    usage: "commandname",
    cooldown: 5
};
```

## 🌐 Multi-language Support

Both command types support multiple languages:

```javascript
module.exports.languages = {
    "en": {
        "key": "English text"
    },
    "bn": {
        "key": "Bengali text"
    }
};
```

## 📊 Performance Features

- 🚀 Command caching for faster execution
- 📈 Performance monitoring and statistics
- 🔄 Hot reload support
- 💾 Memory optimization
- ⚡ Async/await patterns

## 🛠️ Development Guidelines

1. **CMD-V2 Commands**: Use for new commands that need advanced features
2. **Old Syntax Commands**: Use for simple commands or backward compatibility
3. **Event Handlers**: Use for automatic bot responses and data management
4. **Error Handling**: Always include comprehensive error handling
5. **Documentation**: Comment your code thoroughly
6. **Testing**: Test commands in different scenarios

## 🔧 Migration

To migrate from old syntax to CMD-V2:

1. Update the configuration structure
2. Change the run function signature
3. Use the enhanced context object
4. Add language support
5. Implement error handling

## 📚 Documentation

For detailed documentation on all features, see:
- `docs/GA-FCA-Features.md` - Complete feature documentation
- Individual command files for usage examples
- Event handler files for event processing examples

This structure provides maximum flexibility while maintaining backward compatibility and adding powerful new features through the enhanced CMD-V2 system.