// CMD-V2 Format - Advanced Group Management

module.exports.config = {
    name: "group",
    description: "Advanced group management with GA-FCA features",
    usage: "group [action] [options]",
    category: "admin",
    permission: 1,
    cooldown: 5,
    prefix: false,
    aliases: ["gc", "grp"]
};

module.exports.languages = {
    "en": {
        "no_permission": "❌ You don't have permission to use this command!",
        "not_group": "❌ This command can only be used in groups!",
        "invalid_action": "❌ Invalid action! Use: info, members, title, emoji, color, image, kick, add, promote, demote, poll, leave",
        "success": "✅ Action completed successfully!",
        "group_info": "📋 **Group Information**\n👥 **Name:** {name}\n🆔 **ID:** {id}\n👤 **Members:** {members}\n👑 **Admins:** {admins}\n📅 **Created:** {created}\n🎨 **Theme:** {theme}",
        "members_list": "👥 **Group Members ({count})**\n{members}",
        "title_changed": "✅ Group title changed to: {title}",
        "emoji_changed": "✅ Group emoji changed to: {emoji}",
        "color_changed": "✅ Group color changed to: {color}",
        "image_changed": "✅ Group image updated!",
        "user_kicked": "✅ User {name} has been removed from the group",
        "user_added": "✅ User {name} has been added to the group",
        "user_promoted": "✅ User {name} has been promoted to admin",
        "user_demoted": "✅ User {name} has been demoted from admin",
        "poll_created": "📊 Poll created successfully!",
        "left_group": "👋 Bot has left the group"
    },
    "bn": {
        "no_permission": "❌ Apnar ei command use korar permission nai!",
        "not_group": "❌ Ei command khali group e use korte paren!",
        "invalid_action": "❌ Invalid action! Use korun: info, members, title, emoji, color, image, kick, add, promote, demote, poll, leave",
        "success": "✅ Action successfully complete hoise!",
        "group_info": "📋 **Group Information**\n👥 **Name:** {name}\n🆔 **ID:** {id}\n👤 **Members:** {members}\n👑 **Admins:** {admins}\n📅 **Created:** {created}\n🎨 **Theme:** {theme}",
        "members_list": "👥 **Group Members ({count})**\n{members}",
        "title_changed": "✅ Group title change kora hoise: {title}",
        "emoji_changed": "✅ Group emoji change kora hoise: {emoji}",
        "color_changed": "✅ Group color change kora hoise: {color}",
        "image_changed": "✅ Group image update kora hoise!",
        "user_kicked": "✅ User {name} ke group theke remove kora hoise",
        "user_added": "✅ User {name} ke group e add kora hoise",
        "user_promoted": "✅ User {name} ke admin banano hoise",
        "user_demoted": "✅ User {name} ke admin theke remove kora hoise",
        "poll_created": "📊 Poll successfully create kora hoise!",
        "left_group": "👋 Bot group leave korse"
    }
};

module.exports.run = async (ctx) => {
    const { reply, getText, args, react, typing, u, t, gc, _, send } = ctx;
    
    try {
        // Check permissions
        if (!u.admin() && !await t.info().then(info => info.adminIDs.includes(u.id))) {
            return reply(getText("no_permission"));
        }
        
        // Check if it's a group
        const threadInfo = await t.info();
        if (!threadInfo.isGroup) {
            return reply(getText("not_group"));
        }
        
        await typing(true);
        await react("⚙️");
        
        const action = args[0]?.toLowerCase();
        
        if (!action) {
            const helpText = `🔧 **Group Management Commands:**\n\n` +
                           `📋 \`group info\` - Show group information\n` +
                           `👥 \`group members\` - List all members\n` +
                           `🏷️ \`group title <new title>\` - Change group title\n` +
                           `😀 \`group emoji <emoji>\` - Change group emoji\n` +
                           `🎨 \`group color <color>\` - Change group color\n` +
                           `🖼️ \`group image\` - Change group image (reply to image)\n` +
                           `👢 \`group kick <user>\` - Remove user from group\n` +
                           `➕ \`group add <user>\` - Add user to group\n` +
                           `👑 \`group promote <user>\` - Promote user to admin\n` +
                           `👤 \`group demote <user>\` - Demote user from admin\n` +
                           `📊 \`group poll <question>\` - Create a poll\n` +
                           `🚪 \`group leave\` - Bot leaves the group`;
            
            await typing(false);
            return reply(helpText);
        }
        
        switch (action) {
            case 'info':
                const info = await t.info();
                const memberCount = info.participantIDs.length;
                const adminCount = info.adminIDs.length;
                const createdDate = new Date(info.timestamp).toLocaleDateString();
                const theme = info.color || "Default";
                
                const infoText = getText("group_info", {
                    name: info.threadName || "Unnamed Group",
                    id: info.threadID,
                    members: memberCount,
                    admins: adminCount,
                    created: createdDate,
                    theme: theme
                });
                
                await typing(false);
                return reply(infoText);
                
            case 'members':
                const memberList = await t.info();
                let membersText = "";
                
                for (let i = 0; i < memberList.participantIDs.length; i++) {
                    const userID = memberList.participantIDs[i];
                    try {
                        const userInfo = await u.info(userID);
                        const isAdmin = memberList.adminIDs.includes(userID);
                        const role = isAdmin ? "👑" : "👤";
                        membersText += `${role} ${userInfo[userID].name} (${userID})\n`;
                    } catch (error) {
                        membersText += `👤 Unknown User (${userID})\n`;
                    }
                }
                
                const membersMessage = getText("members_list", {
                    count: memberList.participantIDs.length,
                    members: membersText
                });
                
                await typing(false);
                return reply(membersMessage);
                
            case 'title':
                if (!args[1]) {
                    return reply("❌ Please provide a new title!");
                }
                
                const newTitle = args.slice(1).join(' ');
                await gc.title(newTitle);
                await typing(false);
                return reply(getText("title_changed", { title: newTitle }));
                
            case 'emoji':
                if (!args[1]) {
                    return reply("❌ Please provide an emoji!");
                }
                
                const newEmoji = args[1];
                await gc.emoji(newEmoji);
                await typing(false);
                return reply(getText("emoji_changed", { emoji: newEmoji }));
                
            case 'color':
                if (!args[1]) {
                    const colors = Object.keys(_.colors);
                    return reply(`🎨 **Available Colors:**\n${colors.join(', ')}`);
                }
                
                const newColor = args[1];
                await gc.color(newColor);
                await typing(false);
                return reply(getText("color_changed", { color: newColor }));
                
            case 'image':
                // This would typically handle image upload
                await typing(false);
                return reply("🖼️ Please reply to an image to change the group picture");
                
            case 'kick':
                if (!args[1]) {
                    return reply("❌ Please mention a user to kick!");
                }
                
                const kickUser = args[1];
                await gc.kick(kickUser);
                await typing(false);
                return reply(getText("user_kicked", { name: kickUser }));
                
            case 'add':
                if (!args[1]) {
                    return reply("❌ Please provide a user ID to add!");
                }
                
                const addUser = args[1];
                await gc.add(addUser);
                await typing(false);
                return reply(getText("user_added", { name: addUser }));
                
            case 'promote':
                if (!args[1]) {
                    return reply("❌ Please mention a user to promote!");
                }
                
                const promoteUser = args[1];
                await gc.promote(promoteUser);
                await typing(false);
                return reply(getText("user_promoted", { name: promoteUser }));
                
            case 'demote':
                if (!args[1]) {
                    return reply("❌ Please mention a user to demote!");
                }
                
                const demoteUser = args[1];
                await gc.demote(demoteUser);
                await typing(false);
                return reply(getText("user_demoted", { name: demoteUser }));
                
            case 'poll':
                if (!args[1]) {
                    return reply("❌ Please provide a poll question!");
                }
                
                const question = args.slice(1).join(' ');
                const options = ["Yes", "No", "Maybe", "Don't know"];
                await gc.poll(question, options);
                await typing(false);
                return reply(getText("poll_created"));
                
            case 'leave':
                await typing(false);
                await reply(getText("left_group"));
                await _.sleep(2000);
                await gc.leave();
                return;
                
            default:
                await typing(false);
                return reply(getText("invalid_action"));
        }
        
    } catch (error) {
        await react("❌");
        _.error("Group command error:", error);
        return reply(`❌ Error: ${error.message}`);
    }
};