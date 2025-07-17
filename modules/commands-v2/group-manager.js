// Advanced group management system - Complete group control

const {
    showGroupInfo,
    showGroupPicture,
    showGroupName,
    showUserList,
    handleSetPicture
} = require('../helpers/groupHelpers');

module.exports.config = {
    name: "gm",
    aliases: ["group", "gc", "groupmanager"],
    description: "Complete group management system with info, customization, and admin controls",
    usage: "gm [info|pic|name|users|title|emoji|setpic|kick|add|promote|demote] [value]",
    category: "admin",
    permission: 1,
    cooldown: 3,
    prefix: true
};

module.exports.languages = {
    "en": {
        "usage": "📋 Complete Group Manager:\n\n📊 INFO COMMANDS:\n🔸 +gm info - Complete group information\n🔸 +gm pic - Get group picture\n🔸 +gm name - Get group name\n🔸 +gm users - List all members\n\n🎨 CUSTOMIZATION:\n🔸 +gm title [new title] - Change title\n🔸 +gm emoji [emoji] - Change emoji\n🔸 +gm setpic [image_url] - Set group picture\n\n� ADMIN CONTROLS:\n�🔸 +gm kick @user - Remove user\n🔸 +gm add [userID] - Add user\n🔸 +gm promote @user - Make admin\n🔸 +gm demote @user - Remove admin",

        "groupInfo": "📊 GROUP INFORMATION\n\n🏠 Name: %1\n🆔 ID: %2\n👥 Total Members: %3\n👑 Total Admins: %4\n🎨 Emoji: %5\n🌈 Color: %6\n📅 Created: %7\n📝 Description: %8",

        "groupPicture": "🖼️ GROUP PICTURE:\n\n🏠 Group: %1\n📸 Picture URL: %2",
        "noPicture": "❌ This group has no profile picture",

        "groupName": "🏠 GROUP NAME:\n\n📝 Current Name: %1\n🆔 Group ID: %2",

        "userList": "👥 GROUP MEMBERS (%1 total):\n\n%2",
        "userEntry": "🔸 %1 (ID: %2)\n",
        "loadingUsers": "⏳ Loading member list...",

        "titleChanged": "✅ Group title changed to: %1",
        "emojiChanged": "✅ Group emoji changed to: %1",
        "pictureChanged": "✅ Group picture updated successfully!",

        "userKicked": "✅ User %1 has been removed from the group",
        "userAdded": "✅ User %1 has been added to the group",
        "userPromoted": "✅ User %1 is now an admin",
        "userDemoted": "✅ User %1 is no longer an admin",

        "noMention": "❌ Please mention a user",
        "noValue": "❌ Please provide a value",
        "noUrl": "❌ Please provide a valid image URL or reply to an image",
        "noImageFound": "❌ No image found in the replied message",
        "invalidImageType": "❌ Please reply to a valid image (photo/gif)",
        "groupOnly": "❌ This command only works in groups",
        "error": "❌ Operation failed: %1",
        "permissionDenied": "❌ You don't have permission to perform this action"
    },

    "bn": {
        "usage": "📋 Complete Group Manager:\n\n📊 INFO COMMANDS:\n🔸 +gm info - Group er sob info\n🔸 +gm pic - Group er picture\n🔸 +gm name - Group er name\n🔸 +gm users - Sob member list\n\n🎨 CUSTOMIZATION:\n🔸 +gm title [notun title] - Title change\n🔸 +gm emoji [emoji] - Emoji change\n🔸 +gm setpic [image_url] - Picture set\n\n👑 ADMIN CONTROLS:\n🔸 +gm kick @user - User kick\n🔸 +gm add [userID] - User add\n🔸 +gm promote @user - Admin banano\n🔸 +gm demote @user - Admin remove",

        "groupInfo": "📊 GROUP INFORMATION\n\n🏠 Name: %1\n🆔 ID: %2\n👥 Total Members: %3\n👑 Total Admins: %4\n🎨 Emoji: %5\n🌈 Color: %6\n📅 Created: %7\n📝 Description: %8",

        "groupPicture": "🖼️ GROUP PICTURE:\n\n🏠 Group: %1\n📸 Picture URL: %2",
        "noPicture": "❌ Ei group er kono profile picture nai",

        "groupName": "🏠 GROUP NAME:\n\n📝 Current Name: %1\n🆔 Group ID: %2",

        "userList": "👥 GROUP MEMBERS (%1 jon):\n\n%2",
        "userEntry": "🔸 %1 (ID: %2)\n",
        "loadingUsers": "⏳ Member list load korchi...",

        "titleChanged": "✅ Group title change hoye gese: %1",
        "emojiChanged": "✅ Group emoji change hoye gese: %1",
        "pictureChanged": "✅ Group picture update hoye gese!",

        "userKicked": "✅ User %1 ke group theke remove kora hoise",
        "userAdded": "✅ User %1 ke group e add kora hoise",
        "userPromoted": "✅ User %1 ekhon admin",
        "userDemoted": "✅ User %1 ar admin na",

        "noMention": "❌ Kono user ke mention koren",
        "noValue": "❌ Ekta value den",
        "noUrl": "❌ Ekta valid image URL den ba kono image ke reply koren",
        "noImageFound": "❌ Reply kora message e kono image nai",
        "invalidImageType": "❌ Ekta valid image (photo/gif) ke reply koren",
        "groupOnly": "❌ Ei command shudhu group e kaj kore",
        "error": "❌ Operation fail hoise: %1",
        "permissionDenied": "❌ Apnar ei kaj korar permission nai"
    }
};

module.exports.run = async ({ args, u, t, api, reply, getText, _, e }) => {
    // Quick group check without async call
    if (!e.isGroup) return reply(getText("groupOnly"));
    if (!args.length) return reply(getText("usage"));

    const action = args[0].toLowerCase();
    const value = args.slice(1).join(" ");
    const mentionedUser = Object.keys(u.mentions)[0];

    try {
        switch (action) {
            // INFO COMMANDS
            case "info":
                return await showGroupInfo(api, t, reply, getText);

            case "pic":
            case "picture":
                return await showGroupPicture(api, t, reply, getText, stream);

            case "name":
                return await showGroupName(api, t, reply, getText);

            case "users":
            case "members":
            case "userlist":
                return await showUserList(api, t, reply, getText);

            // CUSTOMIZATION COMMANDS
            case "title":
                if (!value) return reply(getText("noValue"));
                await t.title(value);
                return reply(getText("titleChanged", value));

            case "emoji":
                if (!value) return reply(getText("noValue"));
                await t.emoji(value);
                return reply(getText("emojiChanged", value));

            case "setpic":
            case "setpicture":
                return await handleSetPicture(api, t, reply, getText, value, e, stream);

            // ADMIN CONTROL COMMANDS
            case "kick":
                if (!mentionedUser) return reply(getText("noMention"));
                await t.kick(mentionedUser);
                return reply(getText("userKicked", u.mentions[mentionedUser]));

            case "add":
                if (!value) return reply(getText("noValue"));
                await t.add(value);
                return reply(getText("userAdded", value));

            case "promote":
                if (!mentionedUser) return reply(getText("noMention"));
                await t.promote(mentionedUser);
                return reply(getText("userPromoted", u.mentions[mentionedUser]));

            case "demote":
                if (!mentionedUser) return reply(getText("noMention"));
                await t.demote(mentionedUser);
                return reply(getText("userDemoted", u.mentions[mentionedUser]));

            default:
                return reply(getText("usage"));
        }
    } catch (error) {
        return reply(getText("error", error.message));
    }
};
