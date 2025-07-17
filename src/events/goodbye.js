// Goodbye Event Handler

module.exports.config = {
    name: "goodbye",
    version: "1.0.0",
    credits: "Cyber-v2",
    description: "Handle user leave events"
};

module.exports.run = async function({ event, api, Users, Threads }) {
    const { threadID, leftParticipantFbId } = event;
    
    try {
        // Skip if no left participant
        if (!leftParticipantFbId) return;
        
        // Skip if bot left
        if (leftParticipantFbId === api.getCurrentUserID()) return;
        
        // Get thread info
        const threadInfo = await api.getThreadInfo(threadID);
        const threadName = threadInfo.threadName || "this group";
        
        // Get user info
        let userName = "Member";
        try {
            const userInfo = await api.getUserInfo(leftParticipantFbId);
            userName = userInfo[leftParticipantFbId].name;
        } catch (error) {
            console.error("Error getting user info:", error);
        }
        
        // Update user data to mark as left
        if (Users) {
            try {
                const userData = await Users.getData(leftParticipantFbId);
                if (userData) {
                    userData.leftDate = Date.now();
                    userData.status = "left";
                    await Users.setData(leftParticipantFbId, userData);
                }
            } catch (error) {
                console.error("Error updating user data:", error);
            }
        }
        
        // Send goodbye message
        const goodbyeMessage = `😢 Goodbye ${userName}!\n\n` +
                              `👋 ${userName} has left ${threadName}\n` +
                              `💔 We'll miss you!\n` +
                              `🚪 The door is always open for you to come back`;
        
        await api.sendMessage(goodbyeMessage, threadID);
        
        // Optional: React to the system message
        await api.setMessageReaction("😢", event.messageID);
        
    } catch (error) {
        console.error("Goodbye event error:", error);
        await api.sendMessage("❌ Error processing goodbye event", threadID);
    }
};