// Simple echo command - stays in cmd-v2

module.exports.config = {
    name: "echo",
    aliases: ["say", "repeat"],
    description: "Echo back the message",
    usage: "echo [message]",
    category: "utility",
    permission: 0,
    cooldown: 1,
    prefix: true
};

module.exports.languages = {
    "en": {
        "usage": "📢 ECHO COMMAND\n\n🔸 echo [message] - Repeat your message\n🔸 say [message] - Same as echo\n🔸 repeat [message] - Same as echo",
        "noMessage": "❌ Please provide a message to echo",
        "echoed": "📢 %1"
    }
};

module.exports.run = async ({ args, reply, getText }) => {
    if (!args.length) {
        return reply(getText("noMessage"));
    }
    
    const message = args.join(" ");
    return reply(getText("echoed", message));
};
