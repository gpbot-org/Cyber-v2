// Old Syntax Command - Ping Command

module.exports.config = {
    name: "ping",
    version: "1.0.0",
    permission: 0,
    credits: "Cyber-v2",
    description: "Check bot response time",
    category: "system",
    usage: "ping",
    cooldown: 5
};

module.exports.run = async function({ event, api, args, getText }) {
    const startTime = Date.now();
    
    try {
        const message = await api.sendMessage("🏓 Pinging...", event.threadID);
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        await api.editMessage(
            `🏓 Pong!\n⏱️ Response time: ${responseTime}ms\n🤖 Bot is running smoothly!`, 
            message.messageID
        );
        
    } catch (error) {
        await api.sendMessage(`❌ Error: ${error.message}`, event.threadID);
    }
};