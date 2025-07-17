// Ultra-minimal userid command - Just 8 lines!

module.exports.config = {
    name: "uid",
    description: "Ultra-minimal user ID lookup",
    usage: "uid [@user] | [reply] | [name]",
    category: "utility",
    permission: 0,
    cooldown: 2,
    prefix: true
};

module.exports.run = async ({ e, u, args, reply, _ }) => {
    // Handle reply
    if (e.messageReply) {
        const id = e.messageReply.senderID;
        const info = await global.client.getUserInfo(id);
        return reply(`🔄 ${info[id]?.name || "Unknown"}\nID: ${id}`);
    }
    
    // Handle mentions
    if (u.mentions && Object.keys(u.mentions).length > 0) {
        const entries = Object.entries(u.mentions);
        if (entries.length === 1) {
            const [id, name] = entries[0];
            return reply(`👤 ${name}\nID: ${id}`);
        }
        return reply(`👥 Multiple IDs:\n${entries.map(([id, name]) => `• ${name}: ${id}`).join('\n')}`);
    }
    
    // Handle search
    if (args.length > 0) {
        const query = args.join(" ").toLowerCase();
        if (query.length < 2) return reply("❌ Query too short (min 2 chars)");
        
        try {
            const thread = await global.client.getThreadInfo(e.threadID);
            const results = [];
            
            for (const id of thread.participantIDs.slice(0, 10)) {
                try {
                    const info = await global.client.getUserInfo(id);
                    const name = info[id]?.name || "";
                    if (name.toLowerCase().includes(query)) {
                        results.push({ name, id });
                    }
                } catch (err) { continue; }
            }
            
            if (!results.length) return reply(`❌ No users found for "${query}"`);
            return reply(`🔍 Results for "${query}":\n${results.slice(0, 5).map(r => `• ${r.name}: ${r.id}`).join('\n')}`);
            
        } catch (err) {
            return reply("❌ Search failed");
        }
    }
    
    // Show own ID with stats
    try {
        const info = await global.client.getUserInfo(u.id);
        const userData = global.client.database.getUser(u.id);
        return reply(`🆔 Your Info:\n👤 ${info[u.id]?.name || "Unknown"}\n🔢 ID: ${u.id}\n📊 Level: ${userData.level || 1}\n💰 Money: ${userData.money || 0}`);
    } catch (err) {
        return reply(`🆔 Your ID: ${u.id}`);
    }
};
