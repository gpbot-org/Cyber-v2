module.exports.config = {
    name: "user",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Grandpa Academy",
    description: "Show user profile and statistics",
    commandCategory: "utility",
    usages: "[@mention|userID]",
    cooldowns: 5,
    dependencies: {},
    prefix: true  // true = requires prefix, false = no prefix needed
};

module.exports.languages = {
    "en": {
        "userProfile": "👤 USER PROFILE\n\n📝 Name: %1\n🆔 ID: %2\n⭐ Level: %3\n✨ Experience: %4 XP\n📊 Progress: %5/100 XP (%6 needed)\n💰 Money: %7\n🎯 Commands Used: %8\n⏰ Last Active: %9\n🔐 Role: %10",
        "userNotFound": "❌ User not found or invalid user ID",
        "roles": "User,Moderator,Admin"
    },
    "bn": {
        "userProfile": "👤 USER PROFILE\n\n📝 Naam: %1\n🆔 ID: %2\n⭐ Level: %3\n✨ Experience: %4 XP\n📊 Progress: %5/100 XP (%6 lagbe)\n💰 Money: %7\n🎯 Commands Used: %8\n⏰ Last Active: %9\n🔐 Role: %10",
        "userNotFound": "❌ User paoa jay nai ba invalid user ID",
        "roles": "User,Moderator,Admin"
    }
};

module.exports.run = async function({ event, api, args, getText, Users, permssion }) {
    const { threadID, messageID, senderID, mentions } = event;
    const bot = global.client;
    
    let targetUserID = senderID;
    
    // Check if user mentioned someone or provided ID
    if (mentions && Object.keys(mentions).length > 0) {
        targetUserID = Object.keys(mentions)[0];
    } else if (args[0] && /^\d+$/.test(args[0])) {
        targetUserID = args[0];
    }
    
    try {
        // Get user data from database first
        const userData = bot.database.getUser(targetUserID);

        // Get user info from Facebook (now with built-in fallback)
        const userInfo = await bot.getUserInfo(targetUserID);

        // Update database with current name if available
        if (userInfo.name && userInfo.name !== "Facebook User" && userInfo.name !== "Unknown User") {
            bot.database.updateUser(targetUserID, { name: userInfo.name });
        }

        // Calculate level progress
        const currentLevelExp = (userData.level - 1) * 100;
        const nextLevelExp = userData.level * 100;
        const progressExp = Math.max(0, userData.exp - currentLevelExp);
        const neededExp = Math.max(0, nextLevelExp - userData.exp);

        // Format last active time
        const timeDiff = Date.now() - userData.lastActive;
        const lastActiveStr = timeDiff < 60000 ? 'Just now' :
                             timeDiff < 3600000 ? `${Math.floor(timeDiff/60000)}m ago` :
                             timeDiff < 86400000 ? `${Math.floor(timeDiff/3600000)}h ago` :
                             `${Math.floor(timeDiff/86400000)}d ago`;

        // Determine user role
        const roles = getText("roles").split(',');
        let userRole = roles[0] || "User"; // Default: User
        if (bot.isAdmin(targetUserID)) {
            userRole = roles[2] || "Admin"; // Admin
        } else if (bot.isModerator(targetUserID)) {
            userRole = roles[1] || "Moderator"; // Moderator
        }

        // Format money
        const formattedMoney = userData.money ? userData.money.toLocaleString() : "0";

        const userProfile = getText("userProfile",
            userInfo.name || "Unknown User",
            targetUserID,
            userData.level || 1,
            userData.exp || 0,
            progressExp,
            neededExp,
            formattedMoney,
            userData.commandCount || 0,
            lastActiveStr,
            userRole
        );

        return api.sendMessage(userProfile, threadID, messageID);

    } catch (error) {
        console.error("User command error:", error);
        return api.sendMessage(getText("userNotFound"), threadID, messageID);
    }
};
