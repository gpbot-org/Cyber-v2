// Simple ping command - stays in cmd-v2

module.exports.config = {
    name: "ping",
    aliases: ["pong", "latency"],
    description: "Check bot response time",
    usage: "ping",
    category: "utility",
    permission: 0,
    cooldown: 3,
    prefix: true
};

module.exports.languages = {
    "en": {
        "usage": "🏓 PING COMMAND\n\n🔸 ping - Check response time\n🔸 pong - Same as ping\n🔸 latency - Same as ping",
        "pong": "🏓 Pong!\n\n⚡ Response Time: %1ms\n🕐 Server Time: %2\n✅ Bot Status: Online"
    }
};

module.exports.run = async ({ reply, getText }) => {
    const startTime = Date.now();
    const serverTime = new Date().toLocaleTimeString();
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 10));
    
    const responseTime = Date.now() - startTime;
    
    return reply(getText("pong", responseTime, serverTime));
};
