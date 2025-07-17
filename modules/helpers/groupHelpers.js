// Group management helper functions

const errorRecovery = require('../../core/errorRecovery');

// Helper function to show complete group information
async function showGroupInfo(api, t, reply, getText) {
    try {
        const info = await t.info();
        const createdDate = info.timestamp ? new Date(info.timestamp).toLocaleDateString() : "Unknown";
        const description = info.description || "No description";
        
        return reply(getText("groupInfo",
            info.threadName || "Unnamed Group",
            t.id,
            info.participantIDs.length,
            info.adminIDs.length,
            info.emoji || "None",
            info.color || "Default",
            createdDate,
            description
        ));
    } catch (error) {
        if (errorRecovery.isCriticalError(error)) {
            errorRecovery.logCriticalError(error, 'showGroupInfo');
        }
        return reply("❌ Unable to load group information");
    }
}

// Helper function to show group picture
async function showGroupPicture(api, t, reply, getText, stream) {
    try {
        const info = await t.info();
        
        if (!info.imageSrc) {
            return reply(getText("noPicture"));
        }
        
        return reply({
            body: getText("groupPicture", info.threadName || "Unnamed Group", info.imageSrc),
            attachment: await stream(info.imageSrc)
        });
    } catch (error) {
        if (errorRecovery.isCriticalError(error)) {
            errorRecovery.logCriticalError(error, 'showGroupPicture');
        }
        return reply("❌ Unable to load group picture");
    }
}

// Helper function to show group name
async function showGroupName(api, t, reply, getText) {
    try {
        const info = await t.info();
        
        return reply(getText("groupName",
            info.threadName || "Unnamed Group",
            t.id
        ));
    } catch (error) {
        if (errorRecovery.isCriticalError(error)) {
            errorRecovery.logCriticalError(error, 'showGroupName');
        }
        return reply("❌ Unable to load group name");
    }
}

// Helper function to show user list with robust error handling
async function showUserList(api, t, reply, getText) {
    try {
        await reply(getText("loadingUsers"));
        
        const info = await t.info();
        const participants = info.participantIDs;
        
        let userList = "";
        let processedCount = 0;
        let errorCount = 0;
        
        // Process users in smaller batches to avoid rate limiting
        for (let i = 0; i < Math.min(participants.length, 20); i++) {
            try {
                // Add delay before each request to avoid rate limiting
                if (i > 0) {
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
                
                const userInfo = await api.getUserInfo(participants[i]);
                const userName = userInfo[participants[i]]?.name || "Unknown User";
                userList += getText("userEntry", userName, participants[i]);
                processedCount++;
                
            } catch (error) {
                errorCount++;
                // Add user ID only if we can't get name
                userList += getText("userEntry", "Unknown User", participants[i]);
                
                // If too many errors, stop trying
                if (errorCount > 5) {
                    break;
                }
            }
        }
        
        // Add summary information
        if (participants.length > 20) {
            userList += `\n... and ${participants.length - 20} more members`;
        }
        
        if (errorCount > 0) {
            userList += `\n\n⚠️ ${errorCount} users couldn't be loaded (Facebook API limitations)`;
        }
        
        return reply(getText("userList", participants.length, userList.trim()));
        
    } catch (error) {
        if (errorRecovery.isCriticalError(error)) {
            errorRecovery.logCriticalError(error, 'showUserList');
        }
        
        // Fallback: show basic member count without names
        try {
            const info = await t.info();
            return reply(`👥 GROUP MEMBERS: ${info.participantIDs.length} total\n\n⚠️ Member names unavailable (Facebook API limitations)\n\nMember IDs:\n${info.participantIDs.slice(0, 10).map(id => `• ${id}`).join('\n')}${info.participantIDs.length > 10 ? `\n... and ${info.participantIDs.length - 10} more` : ''}`);
        } catch (fallbackError) {
            return reply("❌ Unable to load member list (Facebook API error)");
        }
    }
}

// Helper function to show admin list with robust error handling
async function showAdminList(api, t, reply, getText) {
    try {
        const info = await t.info();
        const admins = info.adminIDs;
        
        if (!admins || admins.length === 0) {
            return reply(getText("noAdmins"));
        }
        
        let adminList = "";
        let errorCount = 0;
        
        // Get admin names with error handling
        for (const adminID of admins) {
            try {
                // Add delay between requests
                if (adminList.length > 0) {
                    await new Promise(resolve => setTimeout(resolve, 300));
                }
                
                const userInfo = await api.getUserInfo(adminID);
                const userName = userInfo[adminID]?.name || "Unknown Admin";
                adminList += getText("adminEntry", userName, adminID);
                
            } catch (error) {
                errorCount++;
                adminList += getText("adminEntry", "Unknown Admin", adminID);
                
                // Log error for monitoring
                console.log(`Failed to get admin info for ${adminID}: ${error.message}`);
                
                // If too many errors, stop trying to avoid spam
                if (errorCount > 3) {
                    adminList += `\n⚠️ Some admin names unavailable (Facebook API limitations)`;
                    break;
                }
            }
        }
        
        if (errorCount > 0 && errorCount <= 3) {
            adminList += `\n\n⚠️ ${errorCount} admin names couldn't be loaded`;
        }
        
        return reply(getText("adminList", admins.length, adminList.trim()));
        
    } catch (error) {
        if (errorRecovery.isCriticalError(error)) {
            errorRecovery.logCriticalError(error, 'showAdminList');
        }
        
        // Fallback: show basic admin count without names
        try {
            const info = await t.info();
            const admins = info.adminIDs;
            
            if (!admins || admins.length === 0) {
                return reply(getText("noAdmins"));
            }
            
            return reply(`👑 GROUP ADMINS: ${admins.length} total\n\n⚠️ Admin names unavailable (Facebook API limitations)\n\nAdmin IDs:\n${admins.map(id => `👑 ${id}`).join('\n')}`);
            
        } catch (fallbackError) {
            return reply("❌ Unable to load admin list (Facebook API error)");
        }
    }
}

// Helper function to handle setting group picture (URL or replied image)
async function handleSetPicture(api, t, reply, getText, value, e, stream) {
    try {
        let imageStream;
        
        // Check if this is a reply to a message
        if (e.messageReply) {
            const replyMsg = e.messageReply;
            
            // Check if the replied message has attachments
            if (!replyMsg.attachments || replyMsg.attachments.length === 0) {
                return reply(getText("noImageFound"));
            }
            
            // Find image attachment
            const imageAttachment = replyMsg.attachments.find(att => 
                att.type === 'photo' || 
                att.type === 'animated_image' || 
                (att.type === 'file' && att.filename && /\.(jpg|jpeg|png|gif|webp)$/i.test(att.filename))
            );
            
            if (!imageAttachment) {
                return reply(getText("invalidImageType"));
            }
            
            // Get image URL from attachment
            let imageUrl;
            if (imageAttachment.type === 'photo') {
                imageUrl = imageAttachment.largePreviewUrl || imageAttachment.previewUrl || imageAttachment.url;
            } else if (imageAttachment.type === 'animated_image') {
                imageUrl = imageAttachment.previewUrl || imageAttachment.url;
            } else {
                imageUrl = imageAttachment.url;
            }
            
            if (!imageUrl) {
                return reply(getText("noImageFound"));
            }
            
            // Get image stream from attachment URL
            imageStream = await stream(imageUrl);
            
        } else if (value) {
            // Handle URL input
            if (!isValidUrl(value)) {
                return reply(getText("noUrl"));
            }
            
            imageStream = await stream(value);
            
        } else {
            // No URL provided and no reply
            return reply(getText("noUrl"));
        }
        
        // Set the group image
        await api.changeGroupImage(imageStream, t.id);
        return reply(getText("pictureChanged"));
        
    } catch (error) {
        if (errorRecovery.isCriticalError(error)) {
            errorRecovery.logCriticalError(error, 'handleSetPicture');
        }
        return reply(getText("error", error.message));
    }
}

// Helper function to validate URL
function isValidUrl(string) {
    try {
        new URL(string);
        return string.startsWith('http://') || string.startsWith('https://');
    } catch (_) {
        return false;
    }
}

module.exports = {
    showGroupInfo,
    showGroupPicture,
    showGroupName,
    showUserList,
    showAdminList,
    handleSetPicture,
    isValidUrl
};
