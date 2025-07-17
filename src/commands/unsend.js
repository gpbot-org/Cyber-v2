// Old Syntax Format - Unsend Command (Backward Compatibility)

module.exports.config = {
    name: "unsend",
    version: "1.0.0",
    permission: 0,
    credits: "Cyber-v2",
    description: "Unsend messages from the bot",
    category: "utility",
    usage: "unsend [reply to message]",
    cooldown: 3,
    aliases: ["rem", "uns"]
};

module.exports.run = async function({ event, api, args, getText }) {
    const { threadID, messageID } = event;
    
    try {
        let targetMessageId = null;
        
        // Debug logging
        console.log('Unsend old syntax debug:', {
            hasReply: !!event.messageReply,
            replyMsgId: event.messageReply?.messageID,
            replySenderId: event.messageReply?.senderID,
            commandMsgId: messageID
        });
        
        // Check if replying to a message
        if (event.messageReply && event.messageReply.messageID) {
            targetMessageId = event.messageReply.messageID;
            
            // Check if it's a bot message
            const botUserId = api.getCurrentUserID();
            if (event.messageReply.senderID !== botUserId) {
                return api.sendMessage("❌ Can only unsend bot's own messages!", threadID, messageID);
            }
        }
        // If no reply, unsend the command message
        else {
            targetMessageId = messageID;
        }
        
        // Send processing message
        const processingMsg = await api.sendMessage("🗑️ Unsending message...", threadID);
        
        try {
            // Attempt to unsend the target message
            await api.unsendMessage(targetMessageId);
            
            // Update processing message
            await api.editMessage("✅ Message unsent successfully!", processingMsg.messageID);
            
            // Auto-remove success message after 3 seconds
            setTimeout(async () => {
                try {
                    await api.unsendMessage(processingMsg.messageID);
                } catch (error) {
                    console.warn("Failed to auto-remove success message:", error.message);
                }
            }, 3000);
            
        } catch (error) {
            // Handle unsend error
            let errorMessage = "❌ Failed to unsend message!";
            
            if (error.message.includes("Message not found") || 
                error.message.includes("already unsent")) {
                errorMessage = "❌ Message was already unsent or doesn't exist!";
            } else if (error.message.includes("permission")) {
                errorMessage = "❌ No permission to unsend this message!";
            }
            
            await api.editMessage(errorMessage, processingMsg.messageID);
            
            // Auto-remove error message after 5 seconds
            setTimeout(async () => {
                try {
                    await api.unsendMessage(processingMsg.messageID);
                } catch (err) {
                    console.warn("Failed to auto-remove error message:", err.message);
                }
            }, 5000);
        }
        
    } catch (error) {
        console.error("Unsend command error:", error);
        return api.sendMessage(`❌ Error: ${error.message}`, threadID, messageID);
    }
};