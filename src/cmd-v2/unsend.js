// CMD-V2 Format - Unsend Command

module.exports.config = {
    name: "unsend",
    description: "Unsend messages from the bot or replied messages",
    usage: "unsend [reply to message] or unsend [message_id]",
    category: "utility",
    permission: 0,
    cooldown: 3,
    prefix: true, // Prefix required
    aliases: ["rem", "uns", "unsend"]
};

module.exports.languages = {
    "en": {
        "help": "🗑️ **Unsend Command**\n\n📝 **Usage:**\n• Reply to a message and use `unsend` to delete it\n• Use `unsend [message_id]` to delete specific message\n• Use `unsend` without reply to delete the command message\n\n⚠️ **Note:** Can only unsend bot's own messages",
        "unsending": "🗑️ Unsending message...",
        "success": "✅ Message unsent successfully!",
        "success_self": "✅ Command message unsent!",
        "no_message": "❌ No message to unsend. Reply to a message or provide message ID.",
        "not_bot_message": "❌ Can only unsend bot's own messages!",
        "already_unsent": "❌ Message was already unsent or doesn't exist!",
        "no_permission": "❌ You don't have permission to unsend this message!",
        "error": "❌ Error unsending message: {error}",
        "invalid_id": "❌ Invalid message ID format!",
        "rate_limit": "⏰ Please wait before using unsend again.",
        "multiple_success": "✅ {count} messages unsent successfully!"
    },
    "bn": {
        "help": "🗑️ **Unsend Command**\n\n📝 **Usage:**\n• Message e reply kore `unsend` use koren delete korar jonno\n• `unsend [message_id]` use koren specific message delete korar jonno\n• `unsend` without reply use korle command message delete hobe\n\n⚠️ **Note:** Sudhu bot er nijer message delete korte parbe",
        "unsending": "🗑️ Message delete korcchi...",
        "success": "✅ Message successfully delete kora hoise!",
        "success_self": "✅ Command message delete kora hoise!",
        "no_message": "❌ Delete korar jonno kono message nai. Message e reply koren ba message ID den.",
        "not_bot_message": "❌ Sudhu bot er nijer message delete korte parbo!",
        "already_unsent": "❌ Message age thekei delete kora ba exist kore na!",
        "no_permission": "❌ Ei message delete korar permission nai!",
        "error": "❌ Message delete korte error: {error}",
        "invalid_id": "❌ Invalid message ID format!",
        "rate_limit": "⏰ Unsend use korar age ektu wait koren.",
        "multiple_success": "✅ {count}ta message successfully delete kora hoise!"
    }
};

module.exports.run = async (ctx) => {
    const { reply, getText, args, react, event, api, _, u, t, replyMsg, isReply } = ctx;
    
    try {
        // Check for rate limiting with fallback cache
        const userId = u.id;
        const now = Date.now();
        const cooldownKey = `unsend_${userId}`;
        
        // Use cache if available, otherwise use temporary storage
        let cache = _.cache || { store: new Map() };
        const lastUsed = cache.get ? cache.get(cooldownKey) : (cache.store?.get(cooldownKey) || 0);
        
        if (now - lastUsed < 3000) { // 3 second cooldown
            await react("⏰");
            return reply(getText("rate_limit"));
        }
        
        // Set cache
        if (cache.set) {
            cache.set(cooldownKey, now);
        } else if (cache.store) {
            cache.store.set(cooldownKey, now);
        }
        
        // Show processing reaction
        await react("🗑️");
        
        let targetMessageId = null;
        
        // Debug logging
        console.log('Unsend debug:', {
            hasArgs: args.length > 0,
            isReply: isReply,
            hasReplyMsg: !!replyMsg,
            replyMsgId: replyMsg?.messageID,
            replySenderId: replyMsg?.senderID,
            eventType: event.type
        });
        
        // Priority 1: Check if user provided message ID in args
        if (args.length > 0) {
            const providedId = args[0];
            
            // Validate message ID format (basic check)
            if (providedId.length > 5 && !providedId.includes(' ')) {
                targetMessageId = providedId;
            } else {
                await react("❌");
                return reply(getText("invalid_id"));
            }
        }
        // Priority 2: Check if replying to a message
        else if (event.messageReply && event.messageReply.messageID) {
            targetMessageId = event.messageReply.messageID;
            
            // Additional check: ensure it's a bot message
            const botUserId = api.getCurrentUserID();
            if (event.messageReply.senderID !== botUserId) {
                await react("❌");
                return reply(getText("not_bot_message"));
            }
        }
        // Priority 3: Unsend the command message itself
        else {
            targetMessageId = event.messageID;
            
            // Send success message first, then unsend the command
            const successMsg = await reply(getText("success_self"));
            
            // Wait a moment then unsend both messages
            setTimeout(async () => {
                try {
                    await api.unsendMessage(targetMessageId);
                    await api.unsendMessage(successMsg.messageID);
                } catch (error) {
                    console.warn("Failed to unsend command message:", error.message);
                }
            }, 1000);
            
            return;
        }
        
        // Validate message ID exists
        if (!targetMessageId) {
            await react("❌");
            return reply(getText("no_message"));
        }
        
        // Send processing message
        const processingMsg = await reply(getText("unsending"));
        
        try {
            // Attempt to unsend the message
            await api.unsendMessage(targetMessageId);
            
            // Update processing message to success
            await api.editMessage(getText("success"), processingMsg.messageID);
            await react("✅");
            
            // Log the action
            _.log(`Message unsent by ${u.id} in ${t.id}: ${targetMessageId}`);
            
            // Auto-remove success message after 3 seconds
            setTimeout(async () => {
                try {
                    await api.unsendMessage(processingMsg.messageID);
                } catch (error) {
                    console.warn("Failed to auto-remove success message:", error.message);
                }
            }, 3000);
            
        } catch (error) {
            await react("❌");
            
            // Handle specific error types
            if (error.message.includes("Message not found") || 
                error.message.includes("already unsent") ||
                error.code === 1545012) {
                await api.editMessage(getText("already_unsent"), processingMsg.messageID);
            } else if (error.message.includes("permission") || 
                       error.message.includes("not authorized")) {
                await api.editMessage(getText("no_permission"), processingMsg.messageID);
            } else {
                await api.editMessage(getText("error", { error: error.message }), processingMsg.messageID);
            }
            
            // Log error
            _.error(`Unsend error by ${u.id}:`, error);
            
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
        await react("❌");
        _.error("Unsend command error:", error);
        return reply(getText("error", { error: error.message }));
    }
};

// Helper function for admin mass unsend (bonus feature)
module.exports.massUnsend = async (ctx, messageIds) => {
    const { reply, getText, react, api, _, u, t } = ctx;
    
    if (!u.admin()) {
        await react("❌");
        return reply(getText("no_permission"));
    }
    
    try {
        await react("🗑️");
        const processingMsg = await reply(`🗑️ Unsending ${messageIds.length} messages...`);
        
        let successCount = 0;
        let failCount = 0;
        
        for (const messageId of messageIds) {
            try {
                await api.unsendMessage(messageId);
                successCount++;
                await _.sleep(100); // Small delay to avoid rate limiting
            } catch (error) {
                failCount++;
                console.warn(`Failed to unsend ${messageId}:`, error.message);
            }
        }
        
        const resultMsg = `✅ Mass unsend completed!\n` +
                         `📊 Success: ${successCount}\n` +
                         `❌ Failed: ${failCount}`;
        
        await api.editMessage(resultMsg, processingMsg.messageID);
        await react("✅");
        
        _.log(`Mass unsend by ${u.id}: ${successCount}/${messageIds.length} successful`);
        
    } catch (error) {
        await react("❌");
        _.error("Mass unsend error:", error);
        return reply(getText("error", { error: error.message }));
    }
};