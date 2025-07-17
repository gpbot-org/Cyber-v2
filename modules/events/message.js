module.exports.config = {
    name: "message",
    version: "1.0.0",
    description: "Handle regular message events",
    eventCategory: "message"
};

module.exports.languages = {
    "en": {
        "levelUp": "🎉 Congratulations %1! You reached level %2!"
    },
    "bn": {
        "levelUp": "🎉 Congratulations %1! Apni level %2 e pouchese!"
    }
};

module.exports.run = async function({ api, event, Users, Threads, getText }) {
    const bot = global.client;
    try {
        // Only handle regular messages
        if (event.type !== 'message' || !event.body) {
            return;
        }

        // Skip if user is banned
        if (bot.isBanned(event.senderID)) {
            return;
        }

        // Skip if thread is banned
        if (bot.isThreadBanned(event.threadID)) {
            return;
        }

        // Update user and thread statistics
        bot.database.incrementUserCommand(event.senderID);
        bot.database.incrementThreadMessage(event.threadID);

        // Update user info
        try {
            const userInfo = await bot.getUserInfo(event.senderID);
            bot.database.updateUser(event.senderID, {
                name: userInfo.name,
                lastActive: Date.now()
            });
        } catch (error) {
            // Ignore user info errors
        }

        // Update thread info
        try {
            const threadInfo = await bot.getThreadInfo(event.threadID);
            bot.database.updateThread(event.threadID, {
                name: threadInfo.threadName,
                lastActive: Date.now()
            });
        } catch (error) {
            // Ignore thread info errors
        }

        // Add experience points for active users
        const expGained = Math.floor(Math.random() * 5) + 1;
        const levelResult = bot.database.addUserExp(event.senderID, expGained);

        // Notify on level up
        if (levelResult.levelUp) {
            const userInfo = await bot.getUserInfo(event.senderID);
            const levelUpMsg = getText("levelUp", userInfo.name, levelResult.newLevel);
            api.sendMessage(levelUpMsg, event.threadID);
        }

        // Handle auto-responses
        await handleAutoResponses(api, event, bot);

    } catch (error) {
        bot.logger.error('Message event error:', error.message);
    }
};

// Helper function for auto-responses
async function handleAutoResponses(api, event, bot) {
    const body = event.body.toLowerCase();

    // Simple auto-responses
    const responses = {
        'hello': '👋 Hello there!',
        'hi': '👋 Hi!',
        'good morning': '🌅 Good morning!',
        'good night': '🌙 Good night!',
        'thank you': '😊 You\'re welcome!',
        'thanks': '😊 You\'re welcome!'
    };

    for (const [trigger, response] of Object.entries(responses)) {
        if (body.includes(trigger)) {
            // Random chance to respond (30%)
            if (Math.random() < 0.3) {
                api.sendMessage(response, event.threadID, event.messageID);
                break;
            }
        }
    }

    // Handle mentions
    if (event.mentions && Object.keys(event.mentions).length > 0) {
        try {
            const botID = bot.api.getCurrentUserID();
            if (event.mentions[botID]) {
                const responses = [
                    '👋 You called me?',
                    '🤖 How can I help you?',
                    '😊 Yes?',
                    `💡 Type ${bot.config.prefix}help for commands!`
                ];

                const randomResponse = responses[Math.floor(Math.random() * responses.length)];
                api.sendMessage(randomResponse, event.threadID, event.messageID);
            }
        } catch (error) {
            // Ignore mention errors
        }
    }
}
