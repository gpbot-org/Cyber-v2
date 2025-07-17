// Simple time command - stays in cmd-v2

module.exports.config = {
    name: "time",
    aliases: ["now", "date", "clock"],
    description: "Show current time and date",
    usage: "time",
    category: "utility",
    permission: 0,
    cooldown: 2,
    prefix: true
};

module.exports.languages = {
    "en": {
        "usage": "🕐 TIME COMMAND\n\n🔸 time - Show current time\n🔸 now - Same as time\n🔸 date - Same as time\n🔸 clock - Same as time",
        "timeInfo": "🕐 CURRENT TIME\n\n📅 Date: %1\n⏰ Time: %2\n🌍 Timezone: %3\n📊 Timestamp: %4"
    }
};

module.exports.run = async ({ reply, getText }) => {
    const now = new Date();
    const date = now.toLocaleDateString();
    const time = now.toLocaleTimeString();
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const timestamp = now.getTime();
    
    return reply(getText("timeInfo", date, time, timezone, timestamp));
};
