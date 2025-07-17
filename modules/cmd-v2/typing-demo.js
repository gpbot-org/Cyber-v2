// Ultra-minimal typing indicator demo - Just 5 lines!

module.exports.config = {
    name: "typing",
    description: "Demonstrate typing indicator with delayed response",
    usage: "typing [seconds] [message]",
    category: "fun",
    permission: 0,
    cooldown: 10,
    prefix: false
};

module.exports.languages = {
    "en": {
        "startTyping": "⌨️ Starting to type...",
        "typing": "✍️ Typing for %1 seconds...",
        "finished": "✅ Finished typing! Message: %1",
        "defaultMessage": "Hello! I was typing for %1 seconds!"
    }
};

module.exports.run = async ({ args, api, t, reply, getText, _ }) => {
    const seconds = parseInt(args[0]) || 3;
    const message = args.slice(1).join(" ") || getText("defaultMessage", seconds);
    const maxSeconds = Math.min(seconds, 10); // Limit to 10 seconds

    try {
        // Start typing indicator (with error handling)
        api.sendTyping(t.id);
    } catch (error) {
        // Ignore typing indicator errors - Facebook API limitation
    }

    await reply(getText("typing", maxSeconds));

    // Keep typing for specified duration
    await _.sleep(maxSeconds * 1000);

    // Stop typing and send final message
    return reply(getText("finished", message));
};
