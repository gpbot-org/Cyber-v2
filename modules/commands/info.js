module.exports.config = {
    name: "info",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Grandpa Academy",
    description: "Show detailed bot information and statistics",
    commandCategory: "system",
    usages: "",
    cooldowns: 5,
    dependencies: {},
    prefix: true  // true = requires prefix, false = no prefix needed
};

module.exports.languages = {
    "en": {
        "botInfo": "🤖 CYBER-V2 BOT INFORMATION\n\n📝 Name: %1\n👑 Owner: %2\n🔧 Prefix: %3\n⏰ Uptime: %4\n📊 Commands: %5\n🌐 Language: %6\n\n📈 STATISTICS:\n• Messages Received: %7\n• Commands Executed: %8\n• Errors: %9\n\n💾 SYSTEM:\n• Memory Usage: %10MB\n• Node.js: %11\n• Platform: %12\n\n🔧 FEATURES:\n• Multi-language Support ✅\n• Command Cooldowns ✅\n• Permission System ✅\n• Auto-restart ✅\n• Database Support ✅"
    },
    "bn": {
        "botInfo": "🤖 CYBER-V2 BOT INFORMATION\n\n📝 Naam: %1\n👑 Owner: %2\n🔧 Prefix: %3\n⏰ Uptime: %4\n📊 Commands: %5\n🌐 Language: %6\n\n📈 STATISTICS:\n• Messages Received: %7\n• Commands Executed: %8\n• Errors: %9\n\n💾 SYSTEM:\n• Memory Usage: %10MB\n• Node.js: %11\n• Platform: %12\n\n🔧 FEATURES:\n• Multi-language Support ✅\n• Command Cooldowns ✅\n• Permission System ✅\n• Auto-restart ✅\n• Database Support ✅"
    }
};

module.exports.run = async function({ event, api, args, getText }) {
    const { threadID, messageID } = event;
    const bot = global.client;

    try {
        // Get system information
        const uptime = bot.lang.formatTime(bot.getUptime());
        const memoryUsage = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
        const nodeVersion = process.version;
        const platform = process.platform;

        const info = getText("botInfo",
            bot.config.botName,
            bot.config.botOwner,
            bot.config.prefix,
            uptime,
            bot.commandHandler.commands.size,
            bot.lang.getLanguage(),
            bot.stats.messagesReceived,
            bot.stats.commandsExecuted,
            bot.stats.errors,
            memoryUsage,
            nodeVersion,
            platform
        );

        // Create message object with attachment
        const messageData = {
            body: info,
            attachment: await global.utils.getStreamFromURL("https://i.pinimg.com/originals/80/9a/26/809a26a5dae1a426c3bf7462423685c5.gif")
        };

        return api.sendMessage(messageData, threadID, messageID);

    } catch (error) {
        console.error("Info command error:", error);
        // Fallback to text-only message if attachment fails
        const info = getText("botInfo",
            bot.config.botName || "Cyber-v2",
            bot.config.botOwner || "Grandpa Academy",
            bot.config.prefix || "!",
            bot.lang.formatTime(bot.getUptime()),
            bot.commandHandler.commands.size,
            bot.lang.getLanguage(),
            bot.stats.messagesReceived,
            bot.stats.commandsExecuted,
            bot.stats.errors,
            Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
            process.version,
            process.platform
        );

        return api.sendMessage(info, threadID, messageID);
    }
};
