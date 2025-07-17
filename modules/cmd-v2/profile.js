// CMD-V2 Format - User profile with database made easy!

module.exports.config = {
    name: "profile",
    description: "Show user profile with stats",
    usage: "profile [@mention]",
    category: "user",
    permission: 0,
    cooldown: 3,
    prefix: true  // true = requires prefix, false = no prefix needed
};

module.exports.languages = {
    "en": {
        "profile": "👤 Profile: %1\n\n🆔 ID: %2\n⭐ Level: %3\n🎯 EXP: %4\n💰 Money: %5\n📊 Commands Used: %6\n🕐 Last Active: %7\n🎭 Role: %8",
        "notFound": "❌ User not found!"
    },
    "bn": {
        "profile": "👤 Profile: %1\n\n🆔 ID: %2\n⭐ Level: %3\n🎯 EXP: %4\n💰 Money: %5\n📊 Commands Used: %6\n🕐 Last Active: %7\n🎭 Role: %8",
        "notFound": "❌ User khuje pawa jay nai!"
    }
};

module.exports.run = async (ctx) => {
    // Super easy syntax with user and database shortcuts!
    const { reply, getText, user, bot } = ctx;
    
    try {
        // Get target user (mentioned user or sender)
        const targetUserID = Object.keys(user.mentions)[0] || user.id;
        
        // Easy database access!
        const userData = bot.db.user.get(targetUserID);
        
        // Easy user info access!
        const userInfo = await user.info();
        
        // Calculate time since last active
        const timeDiff = Date.now() - userData.lastActive;
        const lastActive = timeDiff < 60000 ? 'Just now' : 
                          timeDiff < 3600000 ? `${Math.floor(timeDiff/60000)}m ago` :
                          timeDiff < 86400000 ? `${Math.floor(timeDiff/3600000)}h ago` :
                          `${Math.floor(timeDiff/86400000)}d ago`;
        
        // Determine role
        const role = user.isAdmin() ? "Admin" : "User";
        
        // Format profile
        const profile = getText("profile",
            userInfo.name || "Unknown User",
            targetUserID,
            userData.level || 1,
            userData.exp || 0,
            userData.money?.toLocaleString() || "0",
            userData.commandCount || 0,
            lastActive,
            role
        );
        
        return reply(profile);
        
    } catch (error) {
        return reply(getText("notFound"));
    }
};
