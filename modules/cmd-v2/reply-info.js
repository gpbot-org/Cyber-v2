// Ultra-minimal reply message handler - Just 4 lines!

module.exports.config = {
    name: "rinfo",
    description: "Get detailed info about replied message",
    usage: "rinfo [reply to a message]",
    category: "utility",
    permission: 0,
    cooldown: 3,
    prefix: true
};

module.exports.languages = {
    "en": {
        "replyInfo": "📝 Reply Message Info:\n\n👤 Sender: %1 (ID: %2)\n💬 Content: %3\n📎 Attachments: %4\n⏰ Time: %5",
        "noReply": "❌ Please reply to a message to get its info!",
        "hasAttachments": "Yes (%1)",
        "noAttachments": "None"
    }
};

module.exports.run = async ({ isReply, replyMsg, replyID, replyBody, replyAttachments, api, reply, getText, _ }) => {
    if (!isReply) return reply(getText("noReply"));
    
    const userInfo = await api.getUserInfo(replyID);
    const userName = userInfo[replyID]?.name || "Unknown User";
    const attachmentInfo = replyAttachments.length > 0 ? 
        getText("hasAttachments", replyAttachments.length) : 
        getText("noAttachments");
    
    return reply(getText("replyInfo", 
        userName, 
        replyID, 
        _.cut(replyBody || "No text content", 100),
        attachmentInfo,
        _.time()
    ));
};
