module.exports.config = {
    name: "gcadmin",
    version: "1.0.0",
    hasPermssion: 1,
    credits: "Grandpa Academy",
    description: "Group chat admin management commands",
    commandCategory: "admin",
    usages: "[add|remove|promote|demote|kick|title|emoji|color|cover] [args]",
    cooldowns: 5,
    dependencies: {},
    prefix: true  // true = requires prefix, false = no prefix needed
};

module.exports.languages = {
    "en": {
        "usage": "📋 GC Admin Commands:\n\n🔹 %1gcadmin add @user - Add user to group\n🔹 %1gcadmin kick @user - Remove user from group\n🔹 %1gcadmin promote @user - Make user admin\n🔹 %1gcadmin demote @user - Remove admin status\n🔹 %1gcadmin title [new title] - Change group title\n🔹 %1gcadmin emoji [emoji] - Change group emoji\n🔹 %1gcadmin color [color] - Change group color\n🔹 %1gcadmin cover [image_url] - Change group cover",
        "userAdded": "✅ Successfully added %1 to the group",
        "userRemoved": "✅ Successfully removed %1 from the group",
        "userPromoted": "✅ Successfully promoted %1 to admin",
        "userDemoted": "✅ Successfully demoted %1 from admin",
        "titleChanged": "✅ Group title changed to: %1",
        "emojiChanged": "✅ Group emoji changed to: %1",
        "colorChanged": "✅ Group color changed",
        "coverChanged": "✅ Group cover changed",
        "noPermission": "❌ You don't have permission to use this command",
        "notInGroup": "❌ This command can only be used in groups",
        "invalidUser": "❌ Please mention a valid user",
        "error": "❌ Error: %1",
        "missingArgs": "❌ Missing arguments. Use %1gcadmin for help"
    },
    "bn": {
        "usage": "📋 GC Admin Commands:\n\n🔹 %1gcadmin add @user - Group e user add koren\n🔹 %1gcadmin kick @user - Group theke user remove koren\n🔹 %1gcadmin promote @user - User ke admin banaben\n🔹 %1gcadmin demote @user - Admin status remove koren\n🔹 %1gcadmin title [new title] - Group title change koren\n🔹 %1gcadmin emoji [emoji] - Group emoji change koren\n🔹 %1gcadmin color [color] - Group color change koren\n🔹 %1gcadmin cover [image_url] - Group cover change koren",
        "userAdded": "✅ Successfully %1 ke group e add kora hoyeche",
        "userRemoved": "✅ Successfully %1 ke group theke remove kora hoyeche",
        "userPromoted": "✅ Successfully %1 ke admin banano hoyeche",
        "userDemoted": "✅ Successfully %1 er admin status remove kora hoyeche",
        "titleChanged": "✅ Group title change kora hoyeche: %1",
        "emojiChanged": "✅ Group emoji change kora hoyeche: %1",
        "colorChanged": "✅ Group color change kora hoyeche",
        "coverChanged": "✅ Group cover change kora hoyeche",
        "noPermission": "❌ Apnar ei command use korar permission nei",
        "notInGroup": "❌ Ei command shudhu group e use kora jay",
        "invalidUser": "❌ Doya kore valid user mention koren",
        "error": "❌ Error: %1",
        "missingArgs": "❌ Arguments missing. %1gcadmin help er jonno use koren"
    }
};

module.exports.run = async function({ event, api, args, getText }) {
    const { threadID, messageID, senderID, mentions } = event;
    const bot = global.client;
    
    try {
        // Check if in group
        const threadInfo = await bot.getThreadInfo(threadID);
        if (!threadInfo.isGroup) {
            return api.sendMessage(getText("notInGroup"), threadID, messageID);
        }
        
        // Check if user is admin
        if (!bot.isAdmin(senderID) && !threadInfo.adminIDs.includes(senderID)) {
            return api.sendMessage(getText("noPermission"), threadID, messageID);
        }
        
        const action = args[0]?.toLowerCase();
        
        if (!action) {
            return api.sendMessage(getText("usage", bot.config.prefix), threadID, messageID);
        }
        
        switch (action) {
            case 'add':
                if (!mentions || Object.keys(mentions).length === 0) {
                    return api.sendMessage(getText("invalidUser"), threadID, messageID);
                }
                
                for (const userID of Object.keys(mentions)) {
                    try {
                        await bot.addUserToGroup(userID, threadID);
                        const userName = mentions[userID];
                        api.sendMessage(getText("userAdded", userName), threadID, messageID);
                    } catch (error) {
                        api.sendMessage(getText("error", error.message), threadID, messageID);
                    }
                }
                break;
                
            case 'kick':
            case 'remove':
                if (!mentions || Object.keys(mentions).length === 0) {
                    return api.sendMessage(getText("invalidUser"), threadID, messageID);
                }
                
                for (const userID of Object.keys(mentions)) {
                    try {
                        await bot.removeUserFromGroup(userID, threadID);
                        const userName = mentions[userID];
                        api.sendMessage(getText("userRemoved", userName), threadID, messageID);
                    } catch (error) {
                        api.sendMessage(getText("error", error.message), threadID, messageID);
                    }
                }
                break;
                
            case 'promote':
                if (!mentions || Object.keys(mentions).length === 0) {
                    return api.sendMessage(getText("invalidUser"), threadID, messageID);
                }
                
                for (const userID of Object.keys(mentions)) {
                    try {
                        await bot.changeAdminStatus(threadID, userID, true);
                        const userName = mentions[userID];
                        api.sendMessage(getText("userPromoted", userName), threadID, messageID);
                    } catch (error) {
                        api.sendMessage(getText("error", error.message), threadID, messageID);
                    }
                }
                break;
                
            case 'demote':
                if (!mentions || Object.keys(mentions).length === 0) {
                    return api.sendMessage(getText("invalidUser"), threadID, messageID);
                }
                
                for (const userID of Object.keys(mentions)) {
                    try {
                        await bot.changeAdminStatus(threadID, userID, false);
                        const userName = mentions[userID];
                        api.sendMessage(getText("userDemoted", userName), threadID, messageID);
                    } catch (error) {
                        api.sendMessage(getText("error", error.message), threadID, messageID);
                    }
                }
                break;
                
            case 'title':
                const newTitle = args.slice(1).join(' ');
                if (!newTitle) {
                    return api.sendMessage(getText("missingArgs", bot.config.prefix), threadID, messageID);
                }
                
                try {
                    await bot.setTitle(newTitle, threadID);
                    api.sendMessage(getText("titleChanged", newTitle), threadID, messageID);
                } catch (error) {
                    api.sendMessage(getText("error", error.message), threadID, messageID);
                }
                break;
                
            case 'emoji':
                const newEmoji = args[1];
                if (!newEmoji) {
                    return api.sendMessage(getText("missingArgs", bot.config.prefix), threadID, messageID);
                }
                
                try {
                    await bot.changeThreadEmoji(newEmoji, threadID);
                    api.sendMessage(getText("emojiChanged", newEmoji), threadID, messageID);
                } catch (error) {
                    api.sendMessage(getText("error", error.message), threadID, messageID);
                }
                break;
                
            case 'color':
                const newColor = args[1];
                if (!newColor) {
                    return api.sendMessage(getText("missingArgs", bot.config.prefix), threadID, messageID);
                }
                
                try {
                    await bot.changeThreadColor(newColor, threadID);
                    api.sendMessage(getText("colorChanged"), threadID, messageID);
                } catch (error) {
                    api.sendMessage(getText("error", error.message), threadID, messageID);
                }
                break;
                
            case 'cover':
                const coverURL = args[1];
                if (!coverURL) {
                    return api.sendMessage(getText("missingArgs", bot.config.prefix), threadID, messageID);
                }
                
                try {
                    await bot.changeCover(coverURL, threadID);
                    api.sendMessage(getText("coverChanged"), threadID, messageID);
                } catch (error) {
                    api.sendMessage(getText("error", error.message), threadID, messageID);
                }
                break;
                
            default:
                return api.sendMessage(getText("usage", bot.config.prefix), threadID, messageID);
        }
        
    } catch (error) {
        console.error("GCAdmin command error:", error);
        return api.sendMessage(getText("error", error.message), threadID, messageID);
    }
};
