// CMD-V2 Format - Demo Command showing all features

module.exports.config = {
    name: "demo",
    description: "Demonstration of CMD-V2 features with GA-FCA support",
    usage: "demo [feature]",
    category: "example",
    permission: 0,
    cooldown: 5,
    prefix: false,
    aliases: ["example", "test"]
};

module.exports.languages = {
    "en": {
        "help": "🎮 **CMD-V2 Demo Features**\n\n🔧 **Usage Examples:**\n• `demo react` - Test reactions\n• `demo typing` - Test typing indicators\n• `demo user` - Test user management\n• `demo group` - Test group features\n• `demo message` - Test message operations\n• `demo utils` - Test utility functions\n• `demo all` - Test all features\n\n✨ **Available Features:**\n• Ultra-short syntax (u, t, m, p, s, _)\n• Enhanced reactions and typing\n• User and group management\n• Message operations\n• Utility functions\n• Error handling\n• Performance monitoring",
        "react_demo": "🎭 **Reaction Demo**\n\nI'll show you different reactions!",
        "typing_demo": "⌨️ **Typing Demo**\n\nTyping indicators in action!",
        "user_demo": "👤 **User Demo**\n\nHi {name}! Your ID is {id}",
        "group_demo": "👥 **Group Demo**\n\nGroup: {groupName}\nMembers: {memberCount}",
        "message_demo": "💬 **Message Demo**\n\nMessage operations completed!",
        "utils_demo": "🛠️ **Utils Demo**\n\nTime: {time}\nRandom: {random}\nUUID: {uuid}",
        "all_demo": "🎉 **All Features Demo**\n\nTesting all CMD-V2 features!"
    },
    "bn": {
        "help": "🎮 **CMD-V2 Demo Features**\n\n🔧 **Usage Examples:**\n• `demo react` - Reaction test\n• `demo typing` - Typing test\n• `demo user` - User management test\n• `demo group` - Group features test\n• `demo message` - Message operations test\n• `demo utils` - Utility functions test\n• `demo all` - Sob feature test\n\n✨ **Available Features:**\n• Ultra-short syntax (u, t, m, p, s, _)\n• Enhanced reactions and typing\n• User and group management\n• Message operations\n• Utility functions\n• Error handling\n• Performance monitoring",
        "react_demo": "🎭 **Reaction Demo**\n\nReaction dekhabo!",
        "typing_demo": "⌨️ **Typing Demo**\n\nTyping indicator dekhano hocche!",
        "user_demo": "👤 **User Demo**\n\nHi {name}! Apnar ID holo {id}",
        "group_demo": "👥 **Group Demo**\n\nGroup: {groupName}\nMembers: {memberCount}",
        "message_demo": "💬 **Message Demo**\n\nMessage operations complete!",
        "utils_demo": "🛠️ **Utils Demo**\n\nTime: {time}\nRandom: {random}\nUUID: {uuid}",
        "all_demo": "🎉 **All Features Demo**\n\nSob CMD-V2 features test korchi!"
    }
};

module.exports.run = async (ctx) => {
    const { 
        reply, getText, args, react, typing, typingV2, 
        u, t, m, _, send, edit, unsend, forward
    } = ctx;
    
    try {
        const feature = args[0]?.toLowerCase();
        
        // Show help if no feature specified
        if (!feature) {
            await react("❤️");
            return reply(getText("help"));
        }
        
        // Test different features
        switch (feature) {
            case 'react':
                await reply(getText("react_demo"));
                
                // Test different reactions
                await react("😍");
                await _.sleep(1000);
                await react("❤️");
                await _.sleep(1000);
                await react("😂");
                await _.sleep(1000);
                await react("👍");
                
                break;
                
            case 'typing':
                await reply(getText("typing_demo"));
                
                // Test typing indicators
                await typing();
                await _.sleep(2000);
                await typing(t.id, false);
                
                await typingV2();
                await _.sleep(2000);
                await typingV2(t.id, false);
                
                await reply("✅ Typing demo completed!");
                break;
                
            case 'user':
                await typing();
                const userInfo = await u.info();
                const userName = userInfo[u.id]?.name || 'Unknown';
                
                await reply(getText("user_demo", {
                    name: userName,
                    id: u.id
                }));
                
                await react("👤");
                break;
                
            case 'group':
                await typing();
                const threadInfo = await t.info();
                
                await reply(getText("group_demo", {
                    groupName: threadInfo.threadName || 'Unknown Group',
                    memberCount: threadInfo.participantIDs?.length || 0
                }));
                
                await react("👥");
                break;
                
            case 'message':
                const msg = await reply(getText("message_demo"));
                
                await _.sleep(1000);
                await edit("💬 **Message Demo - Edited!**\n\nMessage was edited successfully!", msg.messageID);
                
                await _.sleep(2000);
                await react("✅", msg.messageID);
                
                break;
                
            case 'utils':
                await typing();
                
                const demoData = {
                    time: _.time(),
                    random: _.rand(1, 100),
                    uuid: _.uuid().substring(0, 8)
                };
                
                await reply(getText("utils_demo", demoData));
                await react("🛠️");
                break;
                
            case 'all':
                await reply(getText("all_demo"));
                
                // Test all features in sequence
                await typing();
                await _.sleep(1000);
                await react("🎉");
                await _.sleep(1000);
                
                const allUserInfo = await u.info();
                const allUserName = allUserInfo[u.id]?.name || 'User';
                
                const allThreadInfo = await t.info();
                const allGroupName = allThreadInfo.threadName || 'Group';
                
                const allMsg = await reply(`🎮 **Complete Demo Results:**\n\n` +
                    `👤 **User:** ${allUserName}\n` +
                    `👥 **Group:** ${allGroupName}\n` +
                    `⏰ **Time:** ${_.time()}\n` +
                    `🎲 **Random:** ${_.rand(1, 100)}\n` +
                    `🆔 **UUID:** ${_.uuid().substring(0, 8)}\n` +
                    `📊 **Performance:** Excellent!`);
                
                await _.sleep(2000);
                await react("✅", allMsg.messageID);
                
                break;
                
            default:
                await react("❓");
                return reply("❌ Invalid feature! Use: react, typing, user, group, message, utils, all");
        }
        
        // Log command usage
        _.log(`Demo command used: ${feature} by ${u.id} in ${t.id}`);
        
    } catch (error) {
        await react("❌");
        _.error("Demo command error:", error);
        return reply(`❌ Error: ${error.message}`);
    }
};