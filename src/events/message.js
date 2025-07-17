// Message Event Handler

module.exports.config = {
    name: "message",
    version: "1.0.0",
    credits: "Cyber-v2",
    description: "Handle incoming messages"
};

module.exports.run = async function({ event, api, Users, Threads, Currencies }) {
    const { threadID, messageID, senderID, body } = event;
    
    try {
        // Skip if message is from bot itself
        if (senderID === api.getCurrentUserID()) return;
        
        // Skip if no message body
        if (!body) return;
        
        // Update user data
        if (Users) {
            await Users.createData(senderID, {
                name: (await api.getUserInfo(senderID))[senderID].name,
                lastActive: Date.now(),
                messageCount: 1
            });
        }
        
        // Update thread data
        if (Threads) {
            await Threads.createData(threadID, {
                name: (await api.getThreadInfo(threadID)).threadName,
                lastActive: Date.now(),
                messageCount: 1
            });
        }
        
        // Auto-react to specific keywords
        const autoReactWords = ['love', 'heart', 'cute', 'awesome', 'amazing'];
        const lowerBody = body.toLowerCase();
        
        for (const word of autoReactWords) {
            if (lowerBody.includes(word)) {
                await api.setMessageReaction("❤️", messageID);
                break;
            }
        }
        
        // Auto-reply to mentions
        if (body.includes(`@${global.client.config.botName}`)) {
            await api.sendMessage("👋 Hello! I'm here to help. Use the help command to see what I can do!", threadID);
        }
        
        // Log message for debugging (optional)
        if (global.client.config.debugMode) {
            console.log(`[MESSAGE] ${senderID} in ${threadID}: ${body}`);
        }
        
    } catch (error) {
        console.error("Message event error:", error);
    }
};