// Ultra-minimal attachment handler - Just 6 lines!

module.exports.config = {
    name: "attach",
    description: "Handle attachments from URLs or replied messages",
    usage: "attach [url] | [reply to message with attachment]",
    category: "utility",
    permission: 0,
    cooldown: 5,
    prefix: true
};

module.exports.languages = {
    "en": {
        "processing": "⏳ Processing attachment...",
        "fromReply": "📎 Attachment from replied message:",
        "fromUrl": "🔗 Attachment from URL:",
        "multipleAttachments": "📁 Multiple attachments (%1 files):",
        "noAttachment": "❌ No attachment found! Reply to a message with attachment or provide URL",
        "invalidUrl": "❌ Invalid URL provided",
        "error": "❌ Failed to process attachment: %1"
    }
};

module.exports.run = async ({ args, isReply, replyAttachments, stream, reply, getText, _ }) => {
    await reply(getText("processing"));
    
    try {
        // Handle replied message attachments
        if (isReply && replyAttachments.length > 0) {
            if (replyAttachments.length === 1) {
                const attachment = await stream(replyAttachments[0].url);
                return reply({ 
                    body: getText("fromReply"), 
                    attachment 
                });
            } else {
                const attachments = await Promise.all(
                    replyAttachments.slice(0, 5).map(att => stream(att.url))
                );
                return reply({ 
                    body: getText("multipleAttachments", attachments.length), 
                    attachment: attachments 
                });
            }
        }
        
        // Handle URL attachment
        if (args.length > 0) {
            const url = args[0];
            if (!_.isUrl(url)) return reply(getText("invalidUrl"));
            
            const attachment = await stream(url);
            return reply({ 
                body: getText("fromUrl"), 
                attachment 
            });
        }
        
        return reply(getText("noAttachment"));
        
    } catch (error) {
        return reply(getText("error", error.message));
    }
};
