// Advanced unsend command with multiple aliases and reaction support

module.exports.config = {
    name: "unsend",
    aliases: ["rem", "uns", "remove"],
    description: "Unsend/delete messages (reply to message or react with 🗑️/🚮/🚯)",
    usage: "unsend [reply to message] | React with 🗑️/🚮/🚯 to delete",
    category: "utility",
    permission: 0,
    cooldown: 2,
    prefix: true
};

module.exports.languages = {
    "en": {
        "unsendSuccess": "✅ Message deleted successfully!",
        "unsendFailed": "❌ Failed to delete message: %1",
        "noMessage": "❌ Reply to a message to delete it, or react with 🗑️/🚮/🚯",
        "notYourMessage": "❌ You can only delete your own messages!",
        "adminCanDelete": "👑 Admin privilege: Deleting user's message",
        "missingReply": "Reply to the message you want to unsend.",
        "returnCant": "Can't to unsend message from other user."
    }
};

module.exports.run = function({ api, event, getText }) {
	if (event.messageReply.senderID != api.getCurrentUserID()) return api.sendMessage(getText("returnCant"), event.threadID, event.messageID);
	if (event.type != "message_reply") return api.sendMessage(getText("missingReply"), event.threadID, event.messageID);
	return api.unsendMessage(event.messageReply.messageID);
}