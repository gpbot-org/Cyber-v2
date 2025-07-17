module.exports.config = {
    name: "admin",
    version: "1.0.0",
    hasPermssion: 2,
    credits: "Grandpa Academy",
    description: "Manage bot administrators",
    commandCategory: "admin",
    usages: "[add|remove|list] [userID]",
    cooldowns: 0,
    dependencies: {
        "fs-extra": ""
    },
    prefix: true  // true = requires prefix, false = no prefix needed
};

module.exports.languages = {
    "en": {
        "usage": "📋 Usage: %1admin [add|remove|list] [userID]",
        "added": "✅ Added %1 as admin",
        "removed": "✅ Removed %1 from admin list",
        "adminList": "👑 ADMIN LIST:\n%1",
        "noAdmins": "👑 No admins configured",
        "alreadyAdmin": "❌ User is already an admin",
        "notAdmin": "❌ User is not an admin",
        "invalidUser": "❌ Invalid user ID or user not found",
        "invalidAction": "❌ Invalid action. Use: add, remove, or list",
        "needUserID": "❌ Please provide a user ID"
    },
    "bn": {
        "usage": "📋 Usage: %1admin [add|remove|list] [userID]",
        "added": "✅ %1 ke admin banano hoye gese",
        "removed": "✅ %1 ke admin list theke remove kora hoye gese",
        "adminList": "👑 ADMIN LIST:\n%1",
        "noAdmins": "👑 Kono admin configure kora nai",
        "alreadyAdmin": "❌ User already admin ase",
        "notAdmin": "❌ User admin na",
        "invalidUser": "❌ Invalid user ID ba user paoa jay nai",
        "invalidAction": "❌ Invalid action. Use koren: add, remove, ba list",
        "needUserID": "❌ Doya kore user ID din"
    }
};

module.exports.run = async function({ event, api, args, getText, prefix }) {
    const { threadID, messageID, senderID } = event;
    const bot = global.client;
    const fs = global.nodemodule["fs-extra"];
    const path = require('path');
    
    if (args.length === 0) {
        return api.sendMessage(getText("usage", prefix), threadID, messageID);
    }
    
    const action = args[0].toLowerCase();
    
    switch (action) {
        case 'add':
            await addAdmin(api, args[1], threadID, messageID, getText, bot, fs, path);
            break;
        case 'remove':
            await removeAdmin(api, args[1], threadID, messageID, getText, bot, fs, path);
            break;
        case 'list':
            await listAdmins(api, threadID, messageID, getText, bot);
            break;
        default:
            return api.sendMessage(getText("invalidAction"), threadID, messageID);
    }
};

async function addAdmin(api, userID, threadID, messageID, getText, bot, fs, path) {
    if (!userID) {
        return api.sendMessage(getText("needUserID"), threadID, messageID);
    }
    
    if (!/^\d+$/.test(userID)) {
        return api.sendMessage(getText("invalidUser"), threadID, messageID);
    }
    
    if (bot.config.admins.includes(userID)) {
        return api.sendMessage(getText("alreadyAdmin"), threadID, messageID);
    }
    
    try {
        const userInfo = await bot.getUserInfo(userID);
        
        bot.config.admins.push(userID);
        saveConfig(bot, fs, path);
        
        return api.sendMessage(getText("added", userInfo.name), threadID, messageID);
    } catch (error) {
        return api.sendMessage(getText("invalidUser"), threadID, messageID);
    }
}

async function removeAdmin(api, userID, threadID, messageID, getText, bot, fs, path) {
    if (!userID) {
        return api.sendMessage(getText("needUserID"), threadID, messageID);
    }
    
    const adminIndex = bot.config.admins.indexOf(userID);
    if (adminIndex === -1) {
        return api.sendMessage(getText("notAdmin"), threadID, messageID);
    }
    
    try {
        const userInfo = await bot.getUserInfo(userID);
        
        bot.config.admins.splice(adminIndex, 1);
        saveConfig(bot, fs, path);
        
        return api.sendMessage(getText("removed", userInfo.name), threadID, messageID);
    } catch (error) {
        bot.config.admins.splice(adminIndex, 1);
        saveConfig(bot, fs, path);
        
        return api.sendMessage(getText("removed", `User (${userID})`), threadID, messageID);
    }
}

async function listAdmins(api, threadID, messageID, getText, bot) {
    if (bot.config.admins.length === 0) {
        return api.sendMessage(getText("noAdmins"), threadID, messageID);
    }
    
    let adminList = '';
    
    for (const adminID of bot.config.admins) {
        try {
            const userInfo = await bot.getUserInfo(adminID);
            adminList += `👑 ${userInfo.name} (${adminID})\n`;
        } catch (error) {
            adminList += `👑 Unknown User (${adminID})\n`;
        }
    }
    
    return api.sendMessage(getText("adminList", adminList.trim()), threadID, messageID);
}

function saveConfig(bot, fs, path) {
    try {
        const configPath = path.join(__dirname, '..', '..', 'config.json');
        fs.writeFileSync(configPath, JSON.stringify(bot.config, null, 2));
    } catch (error) {
        bot.logger.error('Failed to save config:', error.message);
    }
}
