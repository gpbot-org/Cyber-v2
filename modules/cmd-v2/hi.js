// CMD-V2 Format - No prefix greeting command

module.exports.config = {
    name: "hi",
    description: "Simple greeting (no prefix needed)",
    usage: "hi",
    category: "fun",
    permission: 0,
    cooldown: 2,
    prefix: false  // No prefix needed - just type "hi"
};

module.exports.languages = {
    "en": {
        "greeting": "👋 Hello %1! How are you doing today?",
        "greetingGroup": "👋 Hello everyone! I'm Cyber-v2, your friendly bot!"
    },
    "bn": {
        "greeting": "👋 Hello %1! Apni kemon achen?",
        "greetingGroup": "👋 Hello sobai! Ami Cyber-v2, apnader friendly bot!"
    }
};

module.exports.run = async (ctx) => {
    const { reply, getText, user, thread } = ctx;
    
    try {
        // Get user info
        const userInfo = await user.info();
        
        // Check if in group
        const isGroup = await thread.isGroup();
        
        if (isGroup) {
            return reply(getText("greetingGroup"));
        } else {
            return reply(getText("greeting", userInfo.name || "Friend"));
        }
        
    } catch (error) {
        return reply("👋 Hello there!");
    }
};
