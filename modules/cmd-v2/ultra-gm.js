// Ultra-minimal group manager - Just 15 lines for all features!

module.exports.config = {
    name: "ugm",
    aliases: ["ugroup", "ugc"],
    description: "Ultra-minimal group management (info/pic/users/admins/title/emoji/color/kick/add/promote)",
    usage: "ugm [action] [value]",
    category: "admin",
    permission: 1,
    cooldown: 2,
    prefix: true
};

module.exports.run = async ({ args, u, t, api, reply, e, stream }) => {
    if (!e.isGroup) return reply("❌ Groups only!");
    if (!args.length) return reply("📋 ugm [info|pic|users|admins|title|emoji|color|setpic|kick|add|promote|demote] [value]");

    const [action, ...rest] = args;
    const value = rest.join(" ");
    const target = Object.keys(u.mentions)[0];
    const info = await t.info();

    try {
        switch (action.toLowerCase()) {
            case "info": return reply(`📊 ${info.threadName}\n👥 ${info.participantIDs.length} members\n👑 ${info.adminIDs.length} admins\n🎨 ${info.emoji || "None"}`);
            case "pic": return info.imageSrc ? reply({ body: `🖼️ ${info.threadName}`, attachment: await stream(info.imageSrc) }) : reply("❌ No picture");
            case "users": return reply(`👥 Members: ${info.participantIDs.length}\n${info.participantIDs.slice(0,10).map(id => `• ${id}`).join('\n')}${info.participantIDs.length > 10 ? `\n... +${info.participantIDs.length-10} more` : ''}`);
            case "admins": return reply(`👑 Admins: ${info.adminIDs.length}\n${info.adminIDs.map(id => `• ${id}`).join('\n') || 'None'}`);
            case "title": return value ? (await t.title(value), reply(`✅ Title: ${value}`)) : reply("❌ Provide title");
            case "emoji": return value ? (await t.emoji(value), reply(`✅ Emoji: ${value}`)) : reply("❌ Provide emoji");
            case "color": return value ? await handleUltraColor(api, t, reply, value) : reply("❌ Provide color");
            case "setpic": return await handleUltraSetPic(api, t, reply, value, e, stream);
            case "kick": return target ? (await t.kick(target), reply(`✅ Kicked ${u.mentions[target]}`)) : reply("❌ Mention user");
            case "add": return value ? (await t.add(value), reply(`✅ Added ${value}`)) : reply("❌ Provide userID");
            case "promote": return target ? (await t.promote(target), reply(`✅ Promoted ${u.mentions[target]}`)) : reply("❌ Mention user");
            case "demote": return target ? (await t.demote(target), reply(`✅ Demoted ${u.mentions[target]}`)) : reply("❌ Mention user");
            default: return reply("❌ Invalid action");
        }
    } catch (e) { return reply(`❌ Error: ${e.message}`); }
};

// Ultra-minimal setpic handler (URL or replied image)
async function handleUltraSetPic(api, t, reply, value, e, stream) {
    try {
        let imageStream;

        // Check replied image first
        if (e.messageReply?.attachments?.length > 0) {
            const img = e.messageReply.attachments.find(a => a.type === 'photo' || a.type === 'animated_image');
            if (img) {
                const url = img.largePreviewUrl || img.previewUrl || img.url;
                if (url) imageStream = await stream(url);
            }
        }

        // Fallback to URL if provided
        if (!imageStream && value && (value.startsWith('http://') || value.startsWith('https://'))) {
            imageStream = await stream(value);
        }

        if (!imageStream) return reply("❌ Provide URL or reply to image");

        await api.changeGroupImage(imageStream, t.id);
        return reply("✅ Picture updated!");

    } catch (error) {
        return reply(`❌ Failed: ${error.message}`);
    }
};

// Ultra-minimal color handler with fallbacks
async function handleUltraColor(api, t, reply, value) {
    try {
        await t.color(value);
        return reply("✅ Color changed");
    } catch (e1) {
        try {
            await api.changeThreadColor(value, t.id);
            return reply("✅ Color changed");
        } catch (e2) {
            const colors = { blue: '#0084FF', red: '#FF0000', green: '#00FF00', purple: '#8B00FF', pink: '#FF69B4', orange: '#FFA500' };
            const color = colors[value.toLowerCase()] || value;
            try {
                await api.changeThreadColor(color, t.id);
                return reply("✅ Color changed");
            } catch (e3) {
                return reply("⚠️ Color change unavailable (Facebook API limit)");
            }
        }
    }
}
