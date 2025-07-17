// Ultra-minimal unsend command - Just 6 lines with full functionality!

module.exports.config = {
    name: "uunsend",
    aliases: ["urem", "uuns", "uremove"],
    description: "Ultra-minimal unsend (reply to message)",
    usage: "uunsend [reply to message]",
    category: "utility",
    permission: 0,
    cooldown: 1,
    prefix: true
};

module.exports.run = async ({ event, api, reply, getText, permssion }) => {
    // Check if this is a reply message using the event structure
    if (event.type !== "message_reply" || !event.messageReply) {
        return reply("❌ Reply to a message!");
    }
    
    const replyMsg = event.messageReply;
    const userID = event.senderID;
    const botID = api.getCurrentUserID();
    
    // Permission check: own message, bot message, or admin
    const canDelete = replyMsg.senderID === userID || 
                     replyMsg.senderID === botID || 
                     permssion >= 1;
    
    if (!canDelete) {
        return reply("❌ You can only delete your own messages!");
    }
    
    try {
        await api.unsendMessage(replyMsg.messageID);
        return reply("✅ Deleted!");
    } catch (e) {
        return reply(`❌ Failed: ${e.message}`);
    }
};
