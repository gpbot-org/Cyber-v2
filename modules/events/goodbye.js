module.exports.config = {
    name: "goodbye",
    version: "1.0.0",
    description: "Handle goodbye messages for leaving members",
    eventCategory: "group"
};

module.exports.languages = {
    "en": {
        "goodbyeMessage": "👋 Goodbye %1!\n\n😢 We'll miss you in %2\n📊 Members remaining: %3"
    },
    "bn": {
        "goodbyeMessage": "👋 Goodbye %1!\n\n😢 Amra tomake miss korbo %2 te\n📊 Members baki ase: %3"
    }
};

module.exports.run = async function({ api, event, Users, Threads, getText }) {
    const bot = global.client;

    try {
        // Get thread settings from database
        const threadData = bot.database.getThread(event.threadID);

        if (!threadData.settings.goodbye) {
            return; // Goodbye disabled for this thread
        }

        // Handle leave events
        if (event.logMessageType === 'log:unsubscribe' && event.logMessageData.leftParticipantFbId) {
            const userID = event.logMessageData.leftParticipantFbId;

            try {
                const userInfo = await bot.getUserInfo(userID);
                const threadInfo = await bot.getThreadInfo(event.threadID);

                // Create goodbye message
                const goodbyeMsg = getText("goodbyeMessage",
                    userInfo.name,
                    threadInfo.threadName,
                    threadInfo.participantIDs.length
                );

                // Try to send goodbye message with error handling
                try {
                    await api.sendMessage(goodbyeMsg, event.threadID);

                    // Log the event
                    bot.logger.info(`Goodbye: ${userInfo.name} left ${threadInfo.threadName}`);

                    // Update thread statistics
                    bot.database.updateThread(event.threadID, {
                        name: threadInfo.threadName,
                        lastActive: Date.now()
                    });

                } catch (sendError) {
                    // Handle specific Facebook API errors
                    const errorMessage = sendError.message || sendError.toString() || JSON.stringify(sendError);

                    if (errorMessage.includes('1545012') || errorMessage.includes('not part of the conversation')) {
                        bot.logger.warn(`Goodbye: Cannot send message to ${threadInfo.threadName} - bot not part of conversation`);
                        return; // Skip silently for "not part of conversation" errors
                    }

                    // Log other errors
                    bot.logger.error('Goodbye sendMessage error:', sendError.message);
                }

            } catch (error) {
                // Handle user/thread info errors
                const errorMessage = error.message || error.toString() || JSON.stringify(error);

                if (errorMessage.includes('1545012') || errorMessage.includes('not part of the conversation')) {
                    bot.logger.warn(`Goodbye: Cannot get info for thread ${event.threadID} - bot not part of conversation`);
                    return; // Skip silently
                }

                bot.logger.error('Goodbye event error:', error.message);
            }
        }

    } catch (error) {
        bot.logger.error('Goodbye event error:', error.message);
    }
};
