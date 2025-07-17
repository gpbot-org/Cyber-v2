module.exports.config = {
    name: "userid",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "Grandpa Academy",
    description: "Advanced user ID lookup with multiple features",
    commandCategory: "utility",
    usages: "[@mention] | [reply] | [name search]",
    cooldowns: 2,
    dependencies: {},
    prefix: true  // true = requires prefix, false = no prefix needed
};

module.exports.languages = {
    "en": {
        "yourID": "🆔 Your User ID Information:\n\n👤 Name: %1\n🔢 ID: %2\n📊 Level: %3\n💰 Money: %4\n⭐ Experience: %5",
        "userID": "🆔 User ID Information:\n\n👤 Name: %1\n🔢 ID: %2\n📊 Status: %3",
        "multipleUsers": "👥 Multiple User IDs Found:\n\n%1",
        "userEntry": "🔸 %1\n   ID: %2\n",
        "replyUserID": "🔄 Replied User ID:\n\n👤 Name: %1\n🔢 ID: %2",
        "searchResults": "🔍 Search Results for '%1':\n\n%2",
        "noResults": "❌ No users found matching '%1'",
        "usage": "📋 Usage Examples:\n\n🔸 +userid - Your ID info\n🔸 +userid @user - Mentioned user ID\n🔸 +userid [reply] - Reply to get user ID\n🔸 +userid [name] - Search by name",
        "error": "❌ Error getting user information: %1"
    },
    "bn": {
        "yourID": "🆔 Apnar User ID Information:\n\n👤 Name: %1\n🔢 ID: %2\n📊 Level: %3\n💰 Money: %4\n⭐ Experience: %5",
        "userID": "🆔 User ID Information:\n\n👤 Name: %1\n🔢 ID: %2\n📊 Status: %3",
        "multipleUsers": "👥 Multiple User ID paoa gese:\n\n%1",
        "userEntry": "🔸 %1\n   ID: %2\n",
        "replyUserID": "🔄 Reply kora User ID:\n\n👤 Name: %1\n🔢 ID: %2",
        "searchResults": "🔍 '%1' er jonno Search Results:\n\n%2",
        "noResults": "❌ '%1' er sathe kono user paoa jay nai",
        "usage": "📋 Usage Examples:\n\n🔸 +userid - Apnar ID info\n🔸 +userid @user - Mention kora user ID\n🔸 +userid [reply] - Reply kore user ID nite\n🔸 +userid [name] - Name diye search korte",
        "error": "❌ User information nite error hoise: %1"
    }
};

module.exports.run = async function({ event, api, args, getText }) {
    const { threadID, messageID, senderID, mentions, messageReply } = event;
    const bot = global.client;

    try {
        // Handle reply to message
        if (messageReply) {
            const repliedUserID = messageReply.senderID;
            try {
                const userInfo = await bot.getUserInfo(repliedUserID);
                const userName = userInfo[repliedUserID]?.name || "Unknown User";
                return api.sendMessage(getText("replyUserID", userName, repliedUserID), threadID, messageID);
            } catch (error) {
                return api.sendMessage(getText("error", "Failed to get replied user info"), threadID, messageID);
            }
        }

        // Handle search by name
        if (args.length > 0 && (!mentions || Object.keys(mentions).length === 0)) {
            const searchQuery = args.join(" ").toLowerCase();

            // Show usage if query is too short
            if (searchQuery.length < 2) {
                return api.sendMessage(getText("usage"), threadID, messageID);
            }

            try {
                const threadInfo = await bot.getThreadInfo(threadID);
                const participants = threadInfo.participantIDs;
                const searchResults = [];

                // Search through participants (limit for performance)
                for (const userID of participants.slice(0, 15)) {
                    try {
                        const userInfo = await bot.getUserInfo(userID);
                        const userName = userInfo[userID]?.name || "";
                        if (userName.toLowerCase().includes(searchQuery)) {
                            searchResults.push({ name: userName, id: userID });
                        }
                    } catch (e) {
                        continue; // Skip users we can't get info for
                    }
                }

                if (searchResults.length === 0) {
                    return api.sendMessage(getText("noResults", searchQuery), threadID, messageID);
                }

                let resultText = "";
                for (const user of searchResults.slice(0, 8)) { // Show max 8 results
                    resultText += getText("userEntry", user.name, user.id);
                }

                return api.sendMessage(getText("searchResults", searchQuery, resultText.trim()), threadID, messageID);

            } catch (error) {
                return api.sendMessage(getText("error", "Search failed"), threadID, messageID);
            }
        }

        // Handle mentions
        if (mentions && Object.keys(mentions).length > 0) {
            // Single mention
            if (Object.keys(mentions).length === 1) {
                const mentionedID = Object.keys(mentions)[0];
                const mentionedName = mentions[mentionedID];
                return api.sendMessage(getText("userID", mentionedName, mentionedID, "Active"), threadID, messageID);
            }

            // Multiple mentions
            let userList = "";
            for (const [userID, userName] of Object.entries(mentions)) {
                userList += getText("userEntry", userName, userID);
            }

            return api.sendMessage(getText("multipleUsers", userList.trim()), threadID, messageID);
        }

        // Show sender's ID with detailed info
        try {
            const userInfo = await bot.getUserInfo(senderID);
            const userName = userInfo[senderID]?.name || "Unknown User";
            const userData = bot.database.getUser(senderID);

            return api.sendMessage(getText("yourID",
                userName,
                senderID,
                userData.level || 1,
                userData.money || 0,
                userData.exp || 0
            ), threadID, messageID);

        } catch (error) {
            return api.sendMessage(getText("error", "Failed to get your info"), threadID, messageID);
        }

    } catch (error) {
        console.error("UserID command error:", error);
        return api.sendMessage(getText("error", "Unexpected error occurred"), threadID, messageID);
    }
};
