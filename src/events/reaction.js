// Reaction Event Handler

module.exports.config = {
    name: "reaction",
    version: "1.0.0",
    credits: "Cyber-v2",
    description: "Handle message reactions"
};

module.exports.run = async function({ event, api, Users, Threads }) {
    const { threadID, messageID, senderID, reaction } = event;
    
    try {
        // Skip if reaction is from bot itself
        if (senderID === api.getCurrentUserID()) return;
        
        // Get user info
        let userName = "User";
        try {
            const userInfo = await api.getUserInfo(senderID);
            userName = userInfo[senderID].name;
        } catch (error) {
            console.error("Error getting user info:", error);
        }
        
        // Handle specific reactions
        switch (reaction) {
            case "❤️":
                // Award points for love reactions
                if (Users) {
                    try {
                        const userData = await Users.getData(senderID);
                        if (userData) {
                            userData.loveReactions = (userData.loveReactions || 0) + 1;
                            userData.experience = (userData.experience || 0) + 5;
                            await Users.setData(senderID, userData);
                        }
                    } catch (error) {
                        console.error("Error updating user love reactions:", error);
                    }
                }
                break;
                
            case "😍":
                // Special response for love eyes
                if (Math.random() < 0.1) { // 10% chance
                    await api.sendMessage("😍 Someone's feeling the love!", threadID);
                }
                break;
                
            case "😂":
                // Track funny reactions
                if (Users) {
                    try {
                        const userData = await Users.getData(senderID);
                        if (userData) {
                            userData.funnyReactions = (userData.funnyReactions || 0) + 1;
                            userData.experience = (userData.experience || 0) + 2;
                            await Users.setData(senderID, userData);
                        }
                    } catch (error) {
                        console.error("Error updating user funny reactions:", error);
                    }
                }
                break;
                
            case "🔥":
                // Fire reaction - something's hot!
                if (Math.random() < 0.15) { // 15% chance
                    await api.sendMessage("🔥 That's fire! 🔥", threadID);
                }
                break;
                
            case "💯":
                // Perfect score!
                if (Math.random() < 0.2) { // 20% chance
                    await api.sendMessage("💯 Absolutely perfect! 💯", threadID);
                }
                break;
                
            case "🎉":
                // Party time!
                if (Math.random() < 0.1) { // 10% chance
                    await api.sendMessage("🎉 Let's celebrate! 🎊", threadID);
                }
                break;
        }
        
        // Log reaction for debugging
        if (global.client.config.debugMode) {
            console.log(`[REACTION] ${userName} reacted ${reaction} to message ${messageID} in ${threadID}`);
        }
        
        // Check if this is a command reaction handler
        const command = global.client.commands.find(cmd => cmd.handleReaction);
        if (command && command.handleReaction) {
            try {
                await command.handleReaction({ event, api, Users, Threads });
            } catch (error) {
                console.error("Command reaction handler error:", error);
            }
        }
        
    } catch (error) {
        console.error("Reaction event error:", error);
    }
};