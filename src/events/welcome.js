// Welcome Event Handler

module.exports.config = {
    name: "welcome",
    version: "1.0.0",
    credits: "Cyber-v2",
    description: "Handle user join events"
};

module.exports.run = async function({ event, api, Users, Threads }) {
    const { threadID, addedParticipants } = event;
    
    try {
        // Skip if no added participants
        if (!addedParticipants || addedParticipants.length === 0) return;
        
        // Get thread info
        const threadInfo = await api.getThreadInfo(threadID);
        const threadName = threadInfo.threadName || "this group";
        
        for (const participant of addedParticipants) {
            const userID = participant.userFbId;
            
            // Skip if bot was added
            if (userID === api.getCurrentUserID()) {
                await api.sendMessage(
                    `🤖 Hello everyone! I'm ${global.client.config.botName}!\n\n` +
                    `✨ Thanks for adding me to ${threadName}!\n` +
                    `📚 Use "${global.client.config.prefix}help" to see my commands\n` +
                    `🎉 Let's have fun together!`,
                    threadID
                );
                continue;
            }
            
            // Get user info
            let userName = "New Member";
            try {
                const userInfo = await api.getUserInfo(userID);
                userName = userInfo[userID].name;
            } catch (error) {
                console.error("Error getting user info:", error);
            }
            
            // Create user data
            if (Users) {
                await Users.createData(userID, {
                    name: userName,
                    joinDate: Date.now(),
                    experience: 0,
                    money: 100 // Starting money
                });
            }
            
            // Send welcome message
            const welcomeMessage = `🎉 Welcome to ${threadName}!\n\n` +
                                 `👋 Hello ${userName}!\n` +
                                 `🎊 We're excited to have you here!\n` +
                                 `📋 Use "${global.client.config.prefix}help" to see available commands\n` +
                                 `💝 Enjoy your stay!`;
            
            await api.sendMessage(welcomeMessage, threadID);
            
            // Optional: React to the system message
            await api.setMessageReaction("🎉", event.messageID);
        }
        
    } catch (error) {
        console.error("Welcome event error:", error);
        await api.sendMessage("❌ Error processing welcome event", threadID);
    }
};