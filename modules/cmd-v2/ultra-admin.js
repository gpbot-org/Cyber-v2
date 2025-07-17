// Ultra-minimal admin kick - Just 6 lines!

module.exports.config = {
    name: "ukick",
    description: "Ultra-minimal kick command",
    permission: 1,
    prefix: true
};

module.exports.run = async ({ u, t, api, reply, e }) => {
    // Quick group check without async call
    if (!e.isGroup) return reply("❌ Groups only!");
    const target = Object.keys(u.mentions)[0];
    if (!target) return reply("❌ Mention someone!");

    try {
        await api.removeUserFromGroup(target, t.id);
        return reply("✅ Kicked!");
    } catch (error) {
        return reply(`❌ Failed to kick: ${error.message}`);
    }
};
