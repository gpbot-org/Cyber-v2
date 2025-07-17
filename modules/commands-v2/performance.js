// Ultra-minimal performance monitor - Just 8 lines!

module.exports.config = {
    name: "perf",
    aliases: ["performance", "speed", "stats"],
    description: "Show bot performance statistics",
    usage: "perf",
    category: "admin",
    permission: 1,
    cooldown: 5,
    prefix: true
};

module.exports.languages = {
    "en": {
        "performance": "⚡ Performance Statistics:\n\n🚀 Bot Uptime: %1\n💾 Memory Usage: %2 MB\n📊 Commands Executed: %3\n⏱️ Average Response: %4ms\n🔥 Cache Hit Rate: %5\n📈 CPU Usage: %6%\n🌐 Active Threads: %7\n⚙️ Node.js Version: %8",
        "slowCommands": "\n🐌 Slow Commands (>1000ms):\n%1",
        "noSlowCommands": "\n✅ No slow commands detected!"
    }
};

module.exports.run = async ({ b, reply, getText, _ }) => {
    const startTime = Date.now();
    
    // Get memory usage
    const memUsage = process.memoryUsage();
    const memMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    
    // Get bot stats
    const uptime = formatUptime(b.up());
    const commandCount = global.client.stats?.commandsExecuted || 0;
    const avgResponse = global.client.stats?.averageResponseTime || 0;
    
    // Get cache stats
    const cacheStats = global.client.translator?.getCacheStats?.() || { hitRate: "N/A" };
    
    // Get CPU usage (approximate)
    const cpuUsage = process.cpuUsage();
    const cpuPercent = Math.round((cpuUsage.user + cpuUsage.system) / 1000000);
    
    // Get active threads (approximate)
    const activeThreads = process.env.UV_THREADPOOL_SIZE || 4;
    
    // Check for slow commands
    const slowCommands = global.client.slowCommands || [];
    const slowCommandsText = slowCommands.length > 0 ? 
        getText("slowCommands", slowCommands.slice(0, 5).map(cmd => `• ${cmd.name}: ${cmd.time}ms`).join("\n")) :
        getText("noSlowCommands");
    
    const responseTime = Date.now() - startTime;
    
    const perfStats = getText("performance",
        uptime,
        memMB,
        commandCount,
        responseTime,
        cacheStats.hitRate,
        cpuPercent,
        activeThreads,
        process.version
    ) + slowCommandsText;
    
    return reply(perfStats);
};

function formatUptime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
}
