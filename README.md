# Cyber-v2 Facebook Bot 🤖

The world's most advanced Facebook Chat Bot system with **ultra-minimal command development** and **complete GA-FCA integration**.

**Created by Grandpa Academy -GA**

## ✨ Revolutionary Features

- 🚀 **Ultra-Minimal Syntax** - Create powerful commands in just 1-5 lines of code
- ⚡ **High Performance** - Advanced caching and optimization with 100% cache hit rate
- 📱 **Complete GA-FCA Support** - Every Facebook Chat API feature accessible
- 🔧 **Flexible Prefix System** - Commands can require prefix or work without
- 👥 **Advanced Group Management** - Complete admin capabilities with ultra-short syntax
- 💬 **Reply Message System** - Handle message replies effortlessly
- 📎 **Attachment Support** - Images, videos, files with simple commands
- 🎨 **Thread Customization** - Title, emoji, color, nickname management
- 📊 **Performance Monitoring** - Automatic slow command detection
- 🌐 **Multi-Language Support** - English and Bengali-English with easy expansion
- 🔐 **Advanced Admin System** - Multi-level permissions and security
- 💾 **Smart Database** - User and thread data with ultra-short shortcuts
- 📨 **Advanced Messaging** - Typing indicators, reactions, forwarding
- 🔍 **Search & Discovery** - Thread and user search capabilities
- 🔄 **Auto-restart** - Automatic recovery from crashes with monitoring

## 📚 Complete Documentation

### 🚀 Quick Start
- **[📖 Complete Documentation](./assets/docs/README.md)** - Comprehensive guide to everything
- **[🚀 Installation Guide](./assets/docs/installation.md)** - Get your bot running in 5 minutes
- **[⚡ CMD-V2 System](./assets/docs/cmd-v2-system.md)** - Ultra-minimal command development
- **[📖 Context Reference](./assets/docs/context-reference.md)** - Complete API reference

### 💻 Development
- **[🎯 Basic Examples](./assets/docs/basic-examples.md)** - Simple command examples
- **[🔧 Advanced Examples](./assets/docs/advanced-examples.md)** - Complex use cases
- **[🔗 GA-FCA Integration](./assets/docs/ga-fca-integration.md)** - Complete Facebook Chat API support
- **[✨ Best Practices](./assets/docs/best-practices.md)** - Code quality and optimization

### 🔧 Advanced Features
- **[💬 Reply Messages](./assets/docs/reply-messages.md)** - Handle message replies
- **[👥 Group Management](./assets/docs/group-management.md)** - Complete group admin features
- **[📎 Attachments](./assets/docs/attachments.md)** - Images, videos, files handling
- **[⚡ Performance](./assets/docs/performance.md)** - Speed and efficiency optimization

## 🎯 Ultra-Minimal Examples

### Echo Command (1 line!)
```javascript
module.exports.run = async ({ args, reply }) => reply(args.length ? `🔊 ${args.join(" ")}` : "❌ No message!");
```

### Group Kick (1 line!)
```javascript
module.exports.run = async ({ u, t, reply }) => Object.keys(u.mentions)[0] ? (t.kick(Object.keys(u.mentions)[0]), reply("✅ Kicked!")) : reply("❌ Mention someone!");
```

### API Call (1 line!)
```javascript
module.exports.run = async ({ get, reply }) => reply(`😂 ${(await get("https://official-joke-api.appspot.com/random_joke")).setup}`);
```

## 📁 Project Structure

```
cyber-v2-bot/
├── main.js              # Main bot entry point
├── run.js               # Bot runner with auto-restart
├── config.json          # Bot configuration
├── package.json         # Dependencies and scripts
├── cookies.json         # Facebook login cookies
├── ga-fca/              # GA Facebook Chat API
├── lang/                # Language files
│   ├── en.json          # English translations
│   └── bn.json          # Bengali-English translations
├── core/                # Core bot framework
│   ├── bot.js           # Main bot class
│   ├── commandHandler.js # MiraiV2 command processing
│   ├── eventHandler.js  # Event processing
│   ├── language.js      # Language manager
│   ├── database.js      # Database manager
│   ├── logger.js        # Logging system
│   └── utils.js         # Utility functions
├── modules/             # Bot modules
│   ├── commands/        # Regular MiraiV2 commands
│   ├── cmd-v2/          # 🚀 Ultra-minimal CMD-V2 commands
│   │   ├── help.js      # Help command
│   │   ├── ping.js      # Ping command
│   │   ├── admin.js     # Admin management
│   │   ├── info.js      # Bot information
│   │   ├── restart.js   # Restart command
│   │   ├── anime.js     # Anime images
│   │   └── user.js      # User profiles
│   └── events/          # Event handlers
├── assets/              # Bot assets
│   ├── data/            # Database files
│   ├── docs/            # 📚 Complete Documentation
│   ├── temp/            # Temporary files
│   └── logs/            # Log files
└── core/                # Core bot functionality
    ├── bot.js           # Main bot class
    ├── commandHandler.js # Command processing
    ├── translator.js    # 🚀 CMD-V2 translator system
    └── database.js      # Database management
```

## 🚀 Quick Start

### Get Started in 5 Minutes!

1. **📖 Read the [Installation Guide](./assets/docs/installation.md)** - Complete setup instructions
2. **⚡ Check [CMD-V2 System](./assets/docs/cmd-v2-system.md)** - Learn ultra-minimal command development
3. **🎯 Browse [Basic Examples](./assets/docs/basic-examples.md)** - See commands in action
4. **📚 Explore [Complete Documentation](./assets/docs/README.md)** - Everything you need to know

### Prerequisites
- Node.js 16.0.0 or higher
- Facebook account for bot login
- Basic JavaScript knowledge

### Installation

1. **Clone or download this project**
   ```bash
   git clone <repository-url>
   cd ga-facebook-bot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure the bot**
   - Edit `config.json` with your settings
   - Add your Facebook credentials
   - Set up admin users
   - Configure bot preferences

4. **Get Facebook login state**
   ```bash
   npm run login
   ```
   Follow the prompts to login and generate `appstate.json`

5. **Start the bot**
   ```bash
   npm start
   ```

## ⚙️ Configuration

Edit `config.json` to customize your bot:

```json
{
  "botName": "GA Bot",
  "botOwner": "Grandpa Academy <GA>",
  "prefix": "+",
  "language": "en",
  "admins": ["your-facebook-id"],
  "facebook": {
    "appStatePath": "./appstate.json"
  }
}
```

### Key Settings

- `botName`: Display name for your bot
- `prefix`: Command prefix (default: `+`)
- `language`: Default language (`en` or `bn`)
- `admins`: Array of Facebook user IDs with admin access
- `events.welcome.enabled`: Enable/disable welcome messages
- `security.antiSpam.enabled`: Enable/disable spam protection

## 🎯 Commands

### General Commands
- `+help` - Show available commands
- `+ping` - Check bot response time
- `+info` - Display bot information

### Admin Commands
- `+admin add <userID>` - Add admin
- `+admin remove <userID>` - Remove admin
- `+admin list` - List all admins
- `+restart` - Restart the bot

## 🌐 Language Support

The bot supports multiple languages:

- **English** (`en`) - Default language
- **Banglish** (`bn`) - Bengali-English mix

Switch language by editing `config.json` or use per-thread settings.

## 🛠️ Creating Commands

Create a new file in `src/commands/`:

```javascript
module.exports = {
    name: 'mycommand',
    description: 'My custom command',
    usage: '{prefix}mycommand [args]',
    category: 'general',
    cooldown: 3,
    
    async execute(bot, message, args) {
        await bot.sendMessage(message.threadID, 'Hello World!', message.messageID);
    }
};
```

## 🎉 Creating Events

Create a new file in `src/events/`:

```javascript
module.exports = {
    name: 'myevent',
    description: 'My custom event',
    
    async execute(bot, message, ...args) {
        // Handle the event
    }
};
```

## 📊 Database

The bot includes a built-in JSON database for:
- User data and statistics
- Thread settings and data
- Global bot configuration

Access via `bot.database` in commands and events.

## 🔧 Scripts

- `npm start` - Start the bot with auto-restart
- `npm run dev` - Start in development mode
- `npm run stop` - Stop the bot
- `npm run restart` - Restart the bot
- `npm run status` - Check bot status
- `npm run login` - Generate Facebook login state

## 🛡️ Security Features

- **Anti-spam**: Prevents message flooding
- **Anti-raid**: Protects against mass joins
- **User banning**: Block problematic users
- **Thread banning**: Disable bot in specific groups
- **Admin-only mode**: Restrict bot to admins only

## 📝 Logging

Comprehensive logging system with:
- Console output with colors
- File logging with rotation
- Different log levels (error, warn, info, debug)
- Performance and security logging

## 🔄 Auto-restart

The bot includes automatic restart functionality:
- Recovers from crashes
- Handles uncaught exceptions
- Configurable restart attempts
- Graceful shutdown handling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📚 Documentation Links

### 🚀 Essential Guides
- **[📖 Complete Documentation](./assets/docs/README.md)** - Everything you need to know
- **[🚀 Installation Guide](./assets/docs/installation.md)** - Get started in 5 minutes
- **[⚡ CMD-V2 System](./assets/docs/cmd-v2-system.md)** - Ultra-minimal command development
- **[📖 Context Reference](./assets/docs/context-reference.md)** - Complete API reference

### 💻 Development Resources
- **[🎯 Basic Examples](./assets/docs/basic-examples.md)** - Simple command examples
- **[🔧 Advanced Examples](./assets/docs/advanced-examples.md)** - Complex use cases
- **[🔗 GA-FCA Integration](./assets/docs/ga-fca-integration.md)** - Complete Facebook Chat API
- **[✨ Best Practices](./assets/docs/best-practices.md)** - Code quality tips

### 🔧 Advanced Features
- **[💬 Reply Messages](./assets/docs/reply-messages.md)** - Handle message replies
- **[👥 Group Management](./assets/docs/group-management.md)** - Group admin features
- **[📎 Attachments](./assets/docs/attachments.md)** - Images, videos, files
- **[⚡ Performance](./assets/docs/performance.md)** - Speed optimization

## 🆘 Support

For support and questions:
- **📚 Check the [Complete Documentation](./assets/docs/README.md)** first
- **🔍 Browse [Troubleshooting Guide](./assets/docs/troubleshooting.md)**
- Create an issue on GitHub with detailed information
- Contact Grandpa Academy <GA>

## 🙏 Acknowledgments

- **MiraiV2 Architecture** - Inspired by the robust MiraiV2 bot framework
- **GA-FCA Integration** - Built with complete Facebook Chat API support
- **Ultra-Minimal Design** - Revolutionary CMD-V2 system for 1-5 line commands
- **Community Driven** - Created by Grandpa Academy team with community feedback

---

**🚀 Cyber-v2 Bot - Making Facebook Chat Bot development 100x faster and easier!**

**Made with ❤️ by Grandpa Academy <GA>**
