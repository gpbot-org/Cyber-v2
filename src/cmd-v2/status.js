// CMD-V2 Format - Bot Status Command

module.exports.config = {
    name: "status",
    description: "Check bot status and session health",
    usage: "status [--detailed]",
    category: "system",
    permission: 0,
    cooldown: 5,
    prefix: false,
    aliases: ["health", "info"]
};

module.exports.languages = {
    "en": {
        "status": "🤖 **Bot Status**\n\n🔐 **Session:** {session}\n⏱️ **Uptime:** {uptime}\n💾 **Memory:** {memory}MB\n📊 **Commands:** {commands}\n💬 **Messages:** {messages}\n❌ **Errors:** {errors}\n🔧 **Node.js:** {nodejs}\n📍 **Thread:** {thread}\n👤 **User:** {user}",
        "detailed": "\n\n🔍 **Detailed Status:**\n📈 **CPU Usage:** {cpu}%\n💾 **Memory Details:** {memoryDetails}\n🌐 **Platform:** {platform}\n📝 **Process ID:** {pid}\n⏰ **Start Time:** {startTime}\n🔄 **Events:** {events}",
        "session_valid": "✅ Valid",
        "session_invalid": "❌ Invalid/Limited",
        "session_unknown": "⚠️ Unknown"
    },
    "bn": {
        "status": "🤖 **Bot Status**\n\n🔐 **Session:** {session}\n⏱️ **Uptime:** {uptime}\n💾 **Memory:** {memory}MB\n📊 **Commands:** {commands}\n💬 **Messages:** {messages}\n❌ **Errors:** {errors}\n🔧 **Node.js:** {nodejs}\n📍 **Thread:** {thread}\n👤 **User:** {user}",
        "detailed": "\n\n🔍 **Detailed Status:**\n📈 **CPU Usage:** {cpu}%\n💾 **Memory Details:** {memoryDetails}\n🌐 **Platform:** {platform}\n📝 **Process ID:** {pid}\n⏰ **Start Time:** {startTime}\n🔄 **Events:** {events}",
        "session_valid": "✅ Valid",
        "session_invalid": "❌ Invalid/Limited",
        "session_unknown": "⚠️ Unknown"
    }
};

module.exports.run = async (ctx) => {
    const { reply, getText, args, react, _, u, t, bot } = ctx;
    
    try {
        // Don't use typing indicator to avoid session issues
        await react("🤖");
        
        // Get session status
        const sessionValid = bot?.sessionValid;
        let sessionStatus;
        
        if (sessionValid === true) {
            sessionStatus = getText("session_valid");
        } else if (sessionValid === false) {
            sessionStatus = getText("session_invalid");
        } else {
            sessionStatus = getText("session_unknown");
        }
        
        // Calculate uptime
        const uptime = process.uptime();
        const uptimeString = formatUptime(uptime);
        
        // Get memory usage
        const memoryUsage = process.memoryUsage();
        const memoryMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
        
        // Get bot stats
        const stats = bot?.stats || {
            commandsExecuted: 0,
            messagesReceived: 0,
            errors: 0
        };
        
        // Build main status message
        let statusMessage = getText("status", {
            session: sessionStatus,
            uptime: uptimeString,
            memory: memoryMB,
            commands: stats.commandsExecuted,
            messages: stats.messagesReceived,
            errors: stats.errors,
            nodejs: process.version,
            thread: t.id,
            user: u.id
        });
        
        // Add detailed info if requested
        if (args.includes('--detailed')) {
            const cpuUsage = process.cpuUsage();
            const cpuPercent = Math.round((cpuUsage.user + cpuUsage.system) / 1000000 * 100);
            
            const memoryDetails = `Used: ${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB / Total: ${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`;
            
            const startTime = new Date(Date.now() - uptime * 1000).toLocaleString();
            
            statusMessage += getText("detailed", {
                cpu: cpuPercent,
                memoryDetails: memoryDetails,
                platform: process.platform,
                pid: process.pid,
                startTime: startTime,
                events: bot?.events?.size || 0
            });
        }
        
        // Add session health tips
        if (sessionValid === false) {
            statusMessage += `\n\n⚠️ **Session Issues Detected:**\n` +
                           `• Some features may not work properly\n` +
                           `• Typing indicators are disabled\n` +
                           `• Consider refreshing the session\n` +
                           `• Check appstate.json file`;
        }
        
        await reply(statusMessage);
        await react("✅");
        
        // Log status check
        _.log(`Status checked by ${u.id} in ${t.id}`);
        
    } catch (error) {
        await react("❌");
        _.error("Status command error:", error);
        return reply(`❌ Error: ${error.message}`);
    }
};

function formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    let parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (secs > 0) parts.push(`${secs}s`);
    
    return parts.join(' ') || '0s';
}