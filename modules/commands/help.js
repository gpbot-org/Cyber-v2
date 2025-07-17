module.exports.config = {
    name: "help",
    version: "3.0.0",
    hasPermssion: 0,
    credits: "Grandpa Academy",
    description: "Flowchart-style command list with bot name header",
    commandCategory: "system",
    usages: "",
    cooldowns: 2,
    dependencies: {},
    prefix: false
};

module.exports.languages = {
    "en": {
        "helpTitle": "🤖 CYBER-V2 ADVANCED HELP SYSTEM",
        "helpHeader": "╔══════════════════════════════════════╗\n║          🎯 COMMAND CENTER          ║\n╚══════════════════════════════════════╝",
        "helpStats": "📊 Total Commands: %1 | Categories: %2 | Page: %3/%4",
        "helpCategory": "\n📁 %1 Commands (%2):",
        "helpCommand": "  %1%2 - %3",
        "helpCommandPrefix": "  🔸 %1%2 - %3",
        "helpCommandNoPrefix": "  🔹 %1 - %2",
        "helpFooter": "\n💡 Usage Examples:\n• help [command] - Detailed info\n• help [category] - Category commands\n• help [page] - Navigate pages\n\n🎯 Categories: %1",
        "helpNavigation": "\n📄 Navigation: help prev | help next | help [1-%1]",
        "commandInfo": "╔══════════════════════════════════════╗\n║            📖 COMMAND INFO           ║\n╚══════════════════════════════════════╝\n\n🏷️ Name: %1\n📝 Description: %2\n🔧 Usage: %3%4 %5\n📂 Category: %6\n🏷️ Version: %7\n👤 Credits: %8\n⏰ Cooldown: %9s\n🔐 Permission: %10\n🎯 Prefix Required: %11",
        "commandNotFound": "❌ Command '%1' not found!\n💡 Use 'help' to see all commands",
        "categoryNotFound": "❌ Category '%1' not found!\n💡 Available categories: %2",
        "categoryInfo": "╔══════════════════════════════════════╗\n║         📁 CATEGORY: %1         ║\n╚══════════════════════════════════════╝\n\n📊 Commands in this category: %2\n\n%3\n\n💡 Use 'help [command]' for detailed information",
        "permissionLevels": ["Everyone", "Moderator", "Admin"],
        "categories": {
            "system": "System",
            "utility": "Utility",
            "fun": "Fun",
            "admin": "Admin",
            "user": "User",
            "entertainment": "Entertainment",
            "image": "Image",
            "general": "General"
        },
        "prefixStatus": ["No", "Yes"]
    },
    "bn": {
        "helpTitle": "🤖 CYBER-V2 ADVANCED HELP SYSTEM",
        "helpHeader": "╔══════════════════════════════════════╗\n║          🎯 COMMAND CENTER          ║\n╚══════════════════════════════════════╝",
        "helpStats": "📊 Total Commands: %1 | Categories: %2 | Page: %3/%4",
        "helpCategory": "\n📁 %1 Commands (%2):",
        "helpCommand": "  %1%2 - %3",
        "helpCommandPrefix": "  🔸 %1%2 - %3",
        "helpCommandNoPrefix": "  🔹 %1 - %2",
        "helpFooter": "\n💡 Usage Examples:\n• help [command] - Details dekhte\n• help [category] - Category commands\n• help [page] - Page navigate korte\n\n🎯 Categories: %1",
        "helpNavigation": "\n📄 Navigation: help prev | help next | help [1-%1]",
        "commandInfo": "╔══════════════════════════════════════╗\n║            📖 COMMAND INFO           ║\n╚══════════════════════════════════════╝\n\n🏷️ Name: %1\n📝 Description: %2\n🔧 Usage: %3%4 %5\n📂 Category: %6\n🏷️ Version: %7\n👤 Credits: %8\n⏰ Cooldown: %9s\n🔐 Permission: %10\n🎯 Prefix Required: %11",
        "commandNotFound": "❌ Command '%1' paoa jay nai!\n💡 'help' use koren sob commands dekhte",
        "categoryNotFound": "❌ Category '%1' paoa jay nai!\n💡 Available categories: %2",
        "categoryInfo": "╔══════════════════════════════════════╗\n║         📁 CATEGORY: %1         ║\n╚══════════════════════════════════════╝\n\n📊 Commands in this category: %2\n\n%3\n\n💡 'help [command]' use koren details er jonno",
        "permissionLevels": ["Sobai", "Moderator", "Admin"],
        "categories": {
            "system": "System",
            "utility": "Utility",
            "fun": "Fun",
            "admin": "Admin",
            "user": "User",
            "entertainment": "Entertainment",
            "image": "Image",
            "general": "General"
        },
        "prefixStatus": ["Na", "Ha"]
    }
};

module.exports.run = async function({ event, api, args, getText, permssion, prefix }) {
    const { threadID, messageID } = event;

    // Create flowchart-style command list
    const createFlowchartHelp = () => { 

        const commandList = `
🎯 ADMIN COMMANDS:
├── +admin - Bot administration
├── +gm info - Group information
├── +gm users - Member list
├── +gm title [text] - Change title
├── +gm emoji [emoji] - Change emoji
├── +gm setpic [url] - Set picture
├── +gm kick @user - Remove user
├── +gm add [id] - Add user
├── +gm promote @user - Make admin
├── +gm demote @user - Remove admin
└── +restart - Restart bot

📊 INFO COMMANDS:
├── +user - User information
├── +info - Bot information
├── +ping - Response time
└── +help - This command list

🎮 UTILITY COMMANDS:
├── +echo [text] - Repeat message
├── +time - Current time
├── +weather [city] - Weather info
├── +anime [name] - Anime search
├── +uid - Get your ID
└── +hi - Simple greeting

🔧 SYSTEM COMMANDS:
├── +errmon - Error monitoring
├── +apimon - API monitoring
├── +perf - Performance stats
└── +unsend - Message management`;

        return commandList + `

📝 Usage: Type command name with + prefix
🎯 Total Commands: 25+ available
👑 Admin Level Required: Some commands
⚡ Response Time: < 1 second

Made with ❤️ by Grandpa Academy`;
    };

    // Send the flowchart help
    return api.sendMessage(createFlowchartHelp(), threadID, messageID);
};
