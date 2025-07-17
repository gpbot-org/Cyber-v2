# GA Facebook Bot Setup Guide

This guide will help you set up and configure your GA Facebook Bot.

## 📋 Prerequisites

Before starting, make sure you have:

- **Node.js 14.0.0+** installed on your system
- A **Facebook account** to use as the bot
- Basic knowledge of **command line/terminal**
- A **code editor** (VS Code recommended)

## 🔧 Step-by-Step Setup

### 1. Download and Install

```bash
# Clone or download the project
git clone <repository-url>
cd ga-facebook-bot

# Install dependencies
npm install
```

### 2. Configure the Bot

Edit `config.json` with your preferences:

```json
{
  "botName": "Your Bot Name",
  "botOwner": "Your Name",
  "prefix": "!",
  "language": "en",
  "admins": ["YOUR_FACEBOOK_USER_ID"],
  
  "facebook": {
    "email": "",
    "password": "",
    "appStatePath": "./appstate.json"
  }
}
```

**Important Settings:**
- `botName`: What your bot will be called
- `prefix`: Command prefix (e.g., `!`, `.`, `/`)
- `language`: Default language (`en` or `bn`)
- `admins`: Your Facebook user ID (get from facebook.com/your.profile → view source → search for "USER_ID")

### 3. Get Facebook Login State

**Option A: Using Email/Password (Not Recommended)**
```json
{
  "facebook": {
    "email": "your-email@example.com",
    "password": "your-password"
  }
}
```

**Option B: Using AppState (Recommended)**
1. Install a browser extension to get Facebook cookies
2. Export cookies as JSON
3. Save as `appstate.json`

**Option C: Using Login Script**
```bash
npm run login
```
Follow the prompts to login and generate `appstate.json`

### 4. Test the Bot

```bash
# Start in development mode
npm run dev

# Or start with auto-restart
npm start
```

Look for these messages:
```
✅ Configuration loaded
✅ Database loaded successfully
✅ Loaded X language(s): en, bn
✅ Loaded X commands
✅ Loaded X events
✅ Login successful
✅ Bot started successfully!
```

### 5. Add Bot to Groups

1. Add your bot account to Facebook groups
2. Test with `!ping` command
3. Use `!help` to see available commands

## ⚙️ Configuration Options

### Basic Settings

```json
{
  "botName": "GA Bot",
  "botOwner": "Grandpa Academy",
  "prefix": "!",
  "language": "en",
  "adminOnly": false,
  "autoRestart": true
}
```

### Security Settings

```json
{
  "security": {
    "antiSpam": {
      "enabled": true,
      "maxMessages": 5,
      "timeWindow": 10000,
      "punishment": "warn"
    },
    "antiRaid": {
      "enabled": true,
      "maxJoins": 3,
      "timeWindow": 30000
    }
  }
}
```

### Event Settings

```json
{
  "events": {
    "welcome": {
      "enabled": true,
      "message": "Welcome {name} to {threadName}! 🎉"
    },
    "goodbye": {
      "enabled": true,
      "message": "Goodbye {name}! We'll miss you 👋"
    }
  }
}
```

## 🎯 Adding Your First Admin

1. Get your Facebook user ID:
   - Go to facebook.com/your.profile
   - View page source (Ctrl+U)
   - Search for "USER_ID"
   - Copy the number

2. Add to config.json:
   ```json
   {
     "admins": ["123456789012345"]
   }
   ```

3. Restart the bot:
   ```bash
   npm restart
   ```

## 🚀 Running the Bot

### Development Mode
```bash
npm run dev
```
- Direct output to console
- No auto-restart
- Good for testing

### Production Mode
```bash
npm start
```
- Auto-restart on crashes
- Background process management
- Recommended for 24/7 operation

### Other Commands
```bash
npm run stop      # Stop the bot
npm run restart   # Restart the bot
npm run status    # Check bot status
```

## 🔍 Troubleshooting

### Common Issues

**1. Login Failed**
- Check Facebook credentials
- Verify appstate.json is valid
- Try using fresh appstate
- Check for 2FA requirements

**2. Commands Not Working**
- Verify prefix in config.json
- Check if bot is admin in group
- Look for error messages in logs

**3. Bot Crashes**
- Check logs in `logs/` directory
- Verify all dependencies installed
- Check Node.js version (14.0.0+)

**4. Permission Errors**
- Add your ID to admins array
- Restart bot after config changes
- Check command permissions

### Getting Help

1. Check the logs: `logs/bot-YYYY-MM-DD.log`
2. Enable debug logging in config
3. Test commands in private message first
4. Check Facebook API status

## 📝 Next Steps

After setup:

1. **Customize Commands**: Edit files in `src/commands/`
2. **Add Events**: Create files in `src/events/`
3. **Modify Languages**: Edit files in `lang/`
4. **Add Assets**: Place files in `assets/`
5. **Configure Database**: Adjust settings in config.json

## 🛡️ Security Best Practices

1. **Never share your appstate.json**
2. **Use a dedicated Facebook account**
3. **Enable 2FA on your Facebook account**
4. **Regularly update the bot**
5. **Monitor logs for suspicious activity**
6. **Use strong passwords**
7. **Keep dependencies updated**

## 📚 Additional Resources

- [Facebook API Documentation](https://developers.facebook.com/docs/)
- [Node.js Documentation](https://nodejs.org/docs/)
- [Bot Commands Reference](./COMMANDS.md)
- [Event System Guide](./EVENTS.md)

---

**Need help? Contact Grandpa Academy <GA>**
