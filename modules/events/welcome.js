module.exports.config = {
    name: "welcome",
    version: "1.0.0",
    description: "Handle welcome messages for new members",
    eventCategory: "group"
};

module.exports.languages = {
    "en": {
        "welcomeMessage": "🎉 Welcome to %1!\n\n👋 Hello %2!\n📊 You are member #%3\n\n💡 Type %4help to see available commands\n🌐 Language: %5"
    },
    "bn": {
        "welcomeMessage": "🎉 %1 e khosh amdeed!\n\n👋 Hello %2!\n📊 Apni member #%3\n\n💡 %4help type koren available commands dekhte\n🌐 Language: %5"
    }
};

module.exports.run = async function({ api, event, Users, Threads, getText }) {
    const bot = global.client;
    try {
        // Get thread settings from database
        const threadData = bot.database.getThread(event.threadID);

        if (!threadData.settings.welcome) {
            return; // Welcome disabled for this thread
        }

        // Handle join events
        if (event.logMessageType === 'log:subscribe' && event.logMessageData.addedParticipants) {
            for (const userID of event.logMessageData.addedParticipants) {
                try {
                    const userInfo = await bot.getUserInfo(userID);
                    const threadInfo = await bot.getThreadInfo(event.threadID);

                    // Update user data
                    bot.database.updateUser(userID, {
                        name: userInfo.name,
                        lastActive: Date.now()
                    });

                    // Create welcome message
                    const welcomeMsg = getText("welcomeMessage",
                        threadInfo.threadName,
                        userInfo.name,
                        threadInfo.participantIDs.length,
                        bot.config.prefix,
                        threadData.settings.language || bot.config.language
                    );

                    api.sendMessage(welcomeMsg, event.threadID);

                    // Log the event
                    bot.logger.info(`Welcome: ${userInfo.name} joined ${threadInfo.threadName}`);

                    // Update thread statistics
                    bot.database.updateThread(event.threadID, {
                        name: threadInfo.threadName,
                        lastActive: Date.now()
                    });

                } catch (error) {
                    bot.logger.error('Welcome event error:', error.message);
                }
            }
        }

    } catch (error) {
        bot.logger.error('Welcome event error:', error.message);
    }
};
