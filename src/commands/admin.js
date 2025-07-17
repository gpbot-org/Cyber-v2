// Old Syntax Command - Admin Command

module.exports.config = {
    name: "admin",
    version: "1.0.0",
    permission: 2,
    credits: "Cyber-v2",
    description: "Bot admin management",
    category: "admin",
    usage: "admin [add|remove|list] [userID]",
    cooldown: 5
};

module.exports.run = async function({ event, api, args, getText }) {
    const { threadID, messageID, senderID } = event;
    
    try {
        // Check if user is admin
        if (!global.client.config.admins.includes(senderID)) {
            return api.sendMessage("❌ You don't have permission to use this command!", threadID, messageID);
        }
        
        const action = args[0];
        const userID = args[1];
        
        if (!action) {
            return api.sendMessage("📋 Usage: admin [add|remove|list] [userID]", threadID, messageID);
        }
        
        switch (action.toLowerCase()) {
            case 'add':
                if (!userID) {
                    return api.sendMessage("❌ Please provide a user ID!", threadID, messageID);
                }
                
                if (global.client.config.admins.includes(userID)) {
                    return api.sendMessage("❌ User is already an admin!", threadID, messageID);
                }
                
                global.client.config.admins.push(userID);
                // Here you would typically save to config file
                
                return api.sendMessage(`✅ Successfully added ${userID} as admin!`, threadID, messageID);
                
            case 'remove':
                if (!userID) {
                    return api.sendMessage("❌ Please provide a user ID!", threadID, messageID);
                }
                
                const index = global.client.config.admins.indexOf(userID);
                if (index === -1) {
                    return api.sendMessage("❌ User is not an admin!", threadID, messageID);
                }
                
                global.client.config.admins.splice(index, 1);
                // Here you would typically save to config file
                
                return api.sendMessage(`✅ Successfully removed ${userID} from admin list!`, threadID, messageID);
                
            case 'list':
                const adminList = global.client.config.admins;
                if (adminList.length === 0) {
                    return api.sendMessage("📋 No admins found!", threadID, messageID);
                }
                
                let adminMessage = "👑 **Bot Admins**\n\n";
                for (let i = 0; i < adminList.length; i++) {
                    try {
                        const userInfo = await api.getUserInfo(adminList[i]);
                        const userName = userInfo[adminList[i]].name;
                        adminMessage += `${i + 1}. ${userName} (${adminList[i]})\n`;
                    } catch (error) {
                        adminMessage += `${i + 1}. Unknown User (${adminList[i]})\n`;
                    }
                }
                
                return api.sendMessage(adminMessage, threadID, messageID);
                
            default:
                return api.sendMessage("❌ Invalid action! Use: add, remove, or list", threadID, messageID);
        }
        
    } catch (error) {
        return api.sendMessage(`❌ Error: ${error.message}`, threadID, messageID);
    }
};