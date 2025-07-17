// Simple unsend command - reply to message to delete it

module.exports.config = {
    name: "del",
    aliases: ["delete", "remove"],
    description: "Delete a message (reply to the message you want to delete)",
    usage: "del [reply to message]",
    category: "utility",
    permission: 0,
    cooldown: 1,
    prefix: true
};

module.exports.languages = {
    "en": {
        "usage": "❌ Reply to a message to delete it\n\n💡 Usage: +del (reply to message)",
        "success": "✅ Message deleted!",
        "failed": "❌ Failed to delete message: %1",
        "noPermission": "❌ You can only delete your own messages!"
    }
};

module.exports.run = function({ api, event, getText }) {
    // Check if this is a reply to a message
    if (event.type != "message_reply") {
        return api.sendMessage(getText("usage"), event.threadID, event.messageID);
    }

    // Check if user can delete this message (only bot messages or user's own messages)
    if (event.messageReply.senderID != api.getCurrentUserID() && event.messageReply.senderID != event.senderID) {
        return api.sendMessage(getText("noPermission"), event.threadID, event.messageID);
    }

    // Delete the message
    return api.unsendMessage(event.messageReply.messageID);
};
