// CMD-V2 Format - Enhanced Ping Command

module.exports.config = {
    name: "ping",
    description: "Check bot response time with advanced metrics",
    usage: "ping [--detailed]",
    category: "system",
    permission: 0,
    cooldown: 3,
    prefix: false,
    aliases: ["latency", "speed"]
};

module.exports.languages = {
    "en": {
        "checking": "🏓 Checking ping...",
        "result": "🏓 **Pong!**\n⚡ **Response Time:** {time}ms\n🔄 **Status:** {status}\n📊 **Performance:** {performance}",
        "detailed": "🔍 **Detailed Metrics:**\n📈 **Average:** {avg}ms\n📉 **Best:** {best}ms\n📊 **Worst:** {worst}ms\n🎯 **Accuracy:** {accuracy}%"
    },
    "bn": {
        "checking": "🏓 Ping check korcchi...",
        "result": "🏓 **Pong!**\n⚡ **Response Time:** {time}ms\n🔄 **Status:** {status}\n📊 **Performance:** {performance}",
        "detailed": "🔍 **Detailed Metrics:**\n📈 **Average:** {avg}ms\n📉 **Best:** {best}ms\n📊 **Worst:** {worst}ms\n🎯 **Accuracy:** {accuracy}%"
    }
};

module.exports.run = async (ctx) => {
    const { reply, getText, args, react, typing, edit, _, u, t } = ctx;
    
    try {
        // Only use typing indicator if session is valid
        const sessionValid = ctx.bot?.sessionValid !== false;
        
        if (sessionValid) {
            // Show typing indicator only if session is valid
            await typing(true);
        }
        
        // React to show processing
        await react("🏓");
        
        const startTime = Date.now();
        
        // Send initial message
        const message = await reply(getText("checking"));
        
        // Calculate response time
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        if (sessionValid) {
            // Stop typing only if we started it
            await typing(false);
        }
        
        // Determine status and performance
        let status = "🟢 Excellent";
        let performance = "⚡ Lightning Fast";
        
        if (responseTime > 100) {
            status = "🟡 Good";
            performance = "🚀 Fast";
        }
        if (responseTime > 300) {
            status = "🟠 Average";
            performance = "🐢 Slow";
        }
        if (responseTime > 500) {
            status = "🔴 Poor";
            performance = "🐌 Very Slow";
        }
        
        // Build response message
        let responseMessage = getText("result", {
            time: responseTime,
            status: status,
            performance: performance
        });
        
        // Add detailed metrics if requested
        if (args.includes('--detailed')) {
            // Get historical data (mock for demonstration)
            const stats = global.client.stats || {
                averageResponseTime: responseTime,
                bestResponseTime: Math.min(responseTime, 50),
                worstResponseTime: Math.max(responseTime, 200),
                totalRequests: 1
            };
            
            const accuracy = Math.max(0, 100 - (responseTime / 10));
            
            responseMessage += "\n\n" + getText("detailed", {
                avg: Math.round(stats.averageResponseTime),
                best: stats.bestResponseTime,
                worst: stats.worstResponseTime,
                accuracy: Math.round(accuracy)
            });
        }
        
        // Add system info
        responseMessage += `\n\n🤖 **Bot Info:**\n` +
                          `⏱️ **Uptime:** ${_.time()}\n` +
                          `💾 **Memory:** ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB\n` +
                          `🔧 **Node.js:** ${process.version}\n` +
                          `📍 **Thread:** ${t.id}\n` +
                          `👤 **User:** ${u.id}\n` +
                          `🔐 **Session:** ${sessionValid ? 'Valid' : 'Invalid/Limited'}`;
        
        // Edit the message with results
        await edit(responseMessage, message.messageID);
        
        // React with success
        await react("✅");
        
        // Log the ping
        _.log(`Ping command: ${responseTime}ms by ${u.id}`);
        
        return message;
        
    } catch (error) {
        await react("❌");
        _.error("Ping command error:", error);
        return reply(`❌ Error: ${error.message}`);
    }
};