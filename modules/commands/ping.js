module.exports.config = {
    name: "ping",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Grandpa Academy",
    description: "Check bot response time and system status",
    commandCategory: "system",
    usages: "",
    cooldowns: 2,
    dependencies: {},
    prefix: true  // true = requires prefix, false = no prefix needed
};

module.exports.languages = {
    "en": {
        "pinging": "🏓 Pinging...",
        "pong": "🏓 Pong!\n⏱️ Response Time: %1ms\n🤖 Bot: Cyber-v2\n📊 Status: Online\n💾 Memory: %2MB\n⏰ Uptime: %3"
    },
    "bn": {
        "pinging": "🏓 Ping korchi...",
        "pong": "🏓 Pong!\n⏱️ Response Time: %1ms\n🤖 Bot: Cyber-v2\n📊 Status: Online\n💾 Memory: %2MB\n⏰ Uptime: %3"
    }
};

module.exports.run = async function({ event, api, args, getText }) {
    const { threadID, messageID } = event;
    const bot = global.client;
    const startTime = Date.now();

    try {
        // Calculate response time and system info
        const responseTime = Date.now() - startTime;
        const memoryUsage = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
        const uptime = bot.lang.formatTime(bot.getUptime());

        const response = getText("pong", responseTime, memoryUsage, uptime);

        // Send the ping response directly
        return api.sendMessage(response, threadID, messageID);

    } catch (error) {
        console.error("Ping command error:", error);
        return api.sendMessage("❌ Ping command failed", threadID, messageID);
    }
};
