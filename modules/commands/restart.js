module.exports.config = {
    name: "restart",
    version: "1.0.0",
    hasPermssion: 2,
    credits: "Grandpa Academy",
    description: "Restart the bot system",
    commandCategory: "admin",
    usages: "",
    cooldowns: 0,
    dependencies: {},
    prefix: true  // true = requires prefix, false = no prefix needed
};

module.exports.languages = {
    "en": {
        "restarting": "🔄 Restarting Cyber-v2 Bot...\n⏳ Please wait a moment...",
        "restartInitiated": "✅ Restart initiated by %1"
    },
    "bn": {
        "restarting": "🔄 Cyber-v2 Bot restart hocche...\n⏳ Ektu wait koren...",
        "restartInitiated": "✅ %1 restart korse"
    }
};

module.exports.run = async function({ event, api, args, getText }) {
    const { threadID, messageID, senderID } = event;
    const bot = global.client;
    
    try {
        // Get user info for logging
        const userInfo = await bot.getUserInfo(senderID);
        
        // Send restart message
        await api.sendMessage(getText("restarting"), threadID, messageID);
        
        // Log the restart
        bot.logger.info(getText("restartInitiated", userInfo.name));
        
        // Give time for the message to send
        setTimeout(() => {
            bot.restart();
        }, 1000);
        
    } catch (error) {
        bot.logger.error('Restart command error:', error.message);
        
        // Send restart message anyway
        await api.sendMessage(getText("restarting"), threadID, messageID);
        
        setTimeout(() => {
            bot.restart();
        }, 1000);
    }
};
