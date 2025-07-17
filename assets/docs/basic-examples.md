# 🎯 Basic Examples

Simple, practical examples to get you started with CMD-V2 development.

## 🚀 Ultra-Minimal Examples

### 1. Echo Command (1 line!)
```javascript
module.exports.config = {
    name: "echo",
    description: "Echo back the message",
    prefix: true
};

module.exports.run = async ({ args, reply }) => reply(args.length ? `🔊 ${args.join(" ")}` : "❌ No message!");
```

### 2. Random Number (1 line!)
```javascript
module.exports.config = {
    name: "random",
    description: "Generate random number",
    prefix: false
};

module.exports.run = async ({ args, _, reply }) => reply(`🎲 ${_.rand(1, args[0] || 100)}`);
```

### 3. Current Time (1 line!)
```javascript
module.exports.config = {
    name: "time",
    description: "Show current time",
    prefix: false
};

module.exports.run = async ({ _, reply }) => reply(`🕐 ${_.time()}`);
```

## 👤 User Information Examples

### 4. User Info (2 lines!)
```javascript
module.exports.config = {
    name: "me",
    description: "Show your information",
    prefix: true
};

module.exports.run = async ({ u, d, reply }) => {
    const user = d.u.get(u.id), info = await u.info();
    return reply(`👤 ${info[u.id].name}\n⭐ Level: ${user.level}\n💰 Money: ${user.money}`);
};
```

### 5. User ID Lookup (3 lines!)
```javascript
module.exports.config = {
    name: "whois",
    description: "Get user ID from mention",
    prefix: true
};

module.exports.run = async ({ u, reply }) => {
    const mentioned = Object.keys(u.mentions)[0];
    if (!mentioned) return reply("❌ Mention someone!");
    return reply(`👤 ${u.mentions[mentioned]}\n🆔 ID: ${mentioned}`);
};
```

## 🌐 HTTP Request Examples

### 6. Random Joke (1 line!)
```javascript
module.exports.config = {
    name: "joke",
    description: "Get a random joke",
    prefix: false
};

module.exports.run = async ({ get, reply }) => reply(`😂 ${(await get("https://official-joke-api.appspot.com/random_joke")).setup}`);
```

### 7. Weather Info (3 lines!)
```javascript
module.exports.config = {
    name: "weather",
    description: "Get weather information",
    prefix: false
};

module.exports.run = async ({ args, get, reply }) => {
    if (!args.length) return reply("❌ Provide a city name!");
    const weather = await get(`https://wttr.in/${args[0]}?format=j1`);
    return reply(`🌤️ ${weather.nearest_area[0].areaName[0].value}: ${weather.current_condition[0].temp_C}°C`);
};
```

## 📎 Attachment Examples

### 8. Send Image (1 line!)
```javascript
module.exports.config = {
    name: "image",
    description: "Send image from URL",
    prefix: true
};

module.exports.run = async ({ args, stream, reply }) => reply({ body: "📸 Image!", attachment: await stream(args[0]) });
```

### 9. Cat Pictures (2 lines!)
```javascript
module.exports.config = {
    name: "cat",
    description: "Random cat picture",
    prefix: false
};

module.exports.run = async ({ get, stream, reply }) => {
    const cat = await get("https://api.thecatapi.com/v1/images/search");
    return reply({ body: "🐱 Meow!", attachment: await stream(cat[0].url) });
};
```

## 💾 Database Examples

### 10. Save Note (2 lines!)
```javascript
module.exports.config = {
    name: "note",
    description: "Save a personal note",
    prefix: true
};

module.exports.run = async ({ args, u, _, reply }) => {
    _.write(`./notes/${u.id}.txt`, args.join(" "));
    return reply("📝 Note saved!");
};
```

### 11. Read Note (3 lines!)
```javascript
module.exports.config = {
    name: "readnote",
    description: "Read your saved note",
    prefix: true
};

module.exports.run = async ({ u, _, reply }) => {
    if (!_.exists(`./notes/${u.id}.txt`)) return reply("❌ No note found!");
    const note = _.read(`./notes/${u.id}.txt`);
    return reply(`📖 Your note: ${note}`);
};
```

## 🎮 Fun Examples

### 12. Coin Flip (1 line!)
```javascript
module.exports.config = {
    name: "flip",
    description: "Flip a coin",
    prefix: false
};

module.exports.run = async ({ _, reply }) => reply(`🪙 ${_.pick(["Heads", "Tails"])}!`);
```

### 13. Magic 8-Ball (2 lines!)
```javascript
module.exports.config = {
    name: "8ball",
    description: "Ask the magic 8-ball",
    prefix: false
};

module.exports.run = async ({ args, _, reply }) => {
    const answers = ["Yes", "No", "Maybe", "Ask again later", "Definitely", "Probably not"];
    return reply(`🎱 ${_.pick(answers)}`);
};
```

## 🔧 Utility Examples

### 14. Text Reverser (1 line!)
```javascript
module.exports.config = {
    name: "reverse",
    description: "Reverse text",
    prefix: true
};

module.exports.run = async ({ args, reply }) => reply(args.join(" ").split("").reverse().join(""));
```

### 15. Word Counter (2 lines!)
```javascript
module.exports.config = {
    name: "count",
    description: "Count words in text",
    prefix: true
};

module.exports.run = async ({ args, reply }) => {
    const text = args.join(" ");
    return reply(`📊 Characters: ${text.length}, Words: ${text.split(" ").length}`);
};
```

## 📱 Group Examples

### 16. Group Info (3 lines!)
```javascript
module.exports.config = {
    name: "groupinfo",
    description: "Show group information",
    prefix: true
};

module.exports.run = async ({ t, reply }) => {
    if (!(await t.group())) return reply("❌ Groups only!");
    const info = await t.info();
    return reply(`🏠 ${info.threadName}\n👥 Members: ${info.participantIDs.length}\n👑 Admins: ${info.adminIDs.length}`);
};
```

### 17. Member Count (2 lines!)
```javascript
module.exports.config = {
    name: "members",
    description: "Count group members",
    prefix: false
};

module.exports.run = async ({ t, reply }) => {
    const info = await t.info();
    return reply(`👥 This group has ${info.participantIDs.length} members`);
};
```

## 🎨 Creative Examples

### 18. ASCII Art (3 lines!)
```javascript
module.exports.config = {
    name: "ascii",
    description: "Generate ASCII art",
    prefix: true
};

module.exports.run = async ({ args, reply }) => {
    const text = args.join(" ") || "HELLO";
    const ascii = text.split("").map(char => `[${char}]`).join(" ");
    return reply(`🎨\n${ascii}`);
};
```

### 19. Color Code (2 lines!)
```javascript
module.exports.config = {
    name: "color",
    description: "Generate random color",
    prefix: false
};

module.exports.run = async ({ _, reply }) => {
    const color = `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;
    return reply(`🎨 Random color: ${color}`);
};
```

## 📊 Data Examples

### 20. JSON Formatter (2 lines!)
```javascript
module.exports.config = {
    name: "json",
    description: "Format JSON data",
    prefix: true
};

module.exports.run = async ({ args, _, reply }) => {
    try { return reply(`\`\`\`json\n${JSON.stringify(_.parse(args.join(" ")), null, 2)}\n\`\`\``); }
    catch (e) { return reply("❌ Invalid JSON!"); }
};
```

## 🔍 Search Examples

### 21. Dictionary (3 lines!)
```javascript
module.exports.config = {
    name: "define",
    description: "Define a word",
    prefix: true
};

module.exports.run = async ({ args, get, reply }) => {
    if (!args.length) return reply("❌ Provide a word!");
    const data = await get(`https://api.dictionaryapi.dev/api/v2/entries/en/${args[0]}`);
    return reply(`📖 ${args[0]}: ${data[0].meanings[0].definitions[0].definition}`);
};
```

## 🎯 Tips for Basic Commands

### Best Practices
1. **Keep it simple** - Start with 1-3 line commands
2. **Handle errors** - Always check for required arguments
3. **Use shortcuts** - Leverage `u`, `t`, `_` for minimal code
4. **Test thoroughly** - Verify edge cases
5. **Add descriptions** - Help users understand your commands

### Common Patterns
```javascript
// Argument validation
if (!args.length) return reply("❌ Provide arguments!");

// Mention handling
const target = Object.keys(u.mentions)[0];
if (!target) return reply("❌ Mention someone!");

// Group check
if (!(await t.group())) return reply("❌ Groups only!");

// Admin check
if (!u.admin()) return reply("❌ Admin only!");

// Error handling
try {
    // Your code here
} catch (error) {
    return reply(`❌ Error: ${error.message}`);
}
```

---

**Next**: [Advanced Examples](./advanced-examples.md) | [Context Reference](./context-reference.md)
