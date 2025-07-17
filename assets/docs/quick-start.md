# ⚡ Quick Start Guide

Get your Cyber-v2 Bot running in just 5 minutes!

## 🚀 Super Quick Setup

### 1. Install & Configure (2 minutes)
```bash
# Clone and install
git clone https://github.com/your-repo/cyber-v2-bot.git
cd cyber-v2-bot
npm install

# Configure
cp config.example.json config.json
```

### 2. Edit Configuration (1 minute)
Edit `config.json`:
```json
{
  "botName": "My Bot",
  "prefix": "+",
  "adminIDs": ["your-facebook-user-id"],
  "language": "en"
}
```

### 3. Facebook Login (1 minute)
- Login to Facebook in your browser
- Extract cookies to `cookies.json` (use browser extension)
- Or use email/password in config (less secure)

### 4. Start Bot (1 minute)
```bash
npm start
```

Look for: `✅ Cyber-v2 Bot started successfully!`

## 🎯 Test Your Bot

Send these messages to test:
- `+ping` - Check if bot responds
- `+help` - Show command list
- `hi` - Test no-prefix command
- `+info` - Bot information

## 🚀 Create Your First CMD-V2 Command

Create `modules/cmd-v2/hello.js`:
```javascript
module.exports.config = {
    name: "hello",
    description: "Say hello",
    prefix: false  // No prefix needed
};

module.exports.run = async ({ reply }) => reply("👋 Hello World!");
```

Now users can type `hello` to get a response!

## 🎉 Ultra-Minimal Examples

### Echo Command (1 line!)
```javascript
module.exports.run = async ({ args, reply }) => reply(args.length ? `🔊 ${args.join(" ")}` : "❌ No message!");
```

### Random Number (1 line!)
```javascript
module.exports.run = async ({ args, _, reply }) => reply(`🎲 ${_.rand(1, args[0] || 100)}`);
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

## 🔧 Common Issues & Solutions

### Bot Won't Start
- Check Node.js version: `node --version` (need 16+)
- Install dependencies: `npm install`
- Check config.json syntax

### Login Failed
- Update cookies.json with fresh cookies
- Check Facebook account status
- Try different login method

### Commands Not Working
- Check prefix in config.json
- Verify command file syntax
- Check bot permissions

## 📚 Next Steps

1. **[CMD-V2 System](./cmd-v2-system.md)** - Learn ultra-minimal development
2. **[Basic Examples](./basic-examples.md)** - More command examples
3. **[Context Reference](./context-reference.md)** - Complete API reference
4. **[GA-FCA Integration](./ga-fca-integration.md)** - Advanced features

## 🎯 Pro Tips

- Use `prefix: false` for natural language commands
- Leverage single-letter shortcuts: `u`, `t`, `_`, `d`, `b`
- Check the logs if something goes wrong
- Start simple, then add complexity
- Test commands thoroughly

---

**You're ready to build amazing Facebook Chat Bots! 🚀**

**Next**: [CMD-V2 System](./cmd-v2-system.md) | [Basic Examples](./basic-examples.md)
