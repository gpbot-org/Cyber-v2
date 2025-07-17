// CMD-V2 Format - Group management made super easy!

module.exports.config = {
    name: "kick",
    description: "Kick user from group (Admin only)",
    usage: "kick @user",
    category: "admin",
    permission: 1,
    cooldown: 5,
    prefix: true  // true = requires prefix, false = no prefix needed
};

module.exports.languages = {
    "en": {
        "noMention": "❌ Please mention a user to kick!",
        "notInGroup": "❌ This command only works in groups!",
        "noPermission": "❌ You need admin permission to use this command!",
        "kicked": "✅ Successfully kicked %1 from the group!",
        "error": "❌ Failed to kick user: %1"
    },
    "bn": {
        "noMention": "❌ Doya kore kick korar jonno user mention koren!",
        "notInGroup": "❌ Ei command shudhu group e kaj kore!",
        "noPermission": "❌ Ei command use korar jonno admin permission lagbe!",
        "kicked": "✅ Successfully %1 ke group theke kick kora hoyeche!",
        "error": "❌ User kick korte parini: %1"
    }
};

module.exports.run = async (ctx) => {
    // Super easy syntax with group and permission handling!
    const { reply, getText, user, thread, api } = ctx;
    
    try {
        // Easy group check!
        if (!(await thread.isGroup())) {
            return reply(getText("notInGroup"));
        }
        
        // Easy permission check!
        if (!user.isAdmin()) {
            return reply(getText("noPermission"));
        }
        
        // Check if user mentioned
        if (Object.keys(user.mentions).length === 0) {
            return reply(getText("noMention"));
        }
        
        // Get mentioned user
        const targetUserID = Object.keys(user.mentions)[0];
        const targetUserName = user.mentions[targetUserID];
        
        // Easy group management!
        await api.removeUserFromGroup(targetUserID, thread.id);
        
        return reply(getText("kicked", targetUserName));
        
    } catch (error) {
        return reply(getText("error", error.message));
    }
};
