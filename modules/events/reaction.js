// Reaction event handler for unsend functionality

module.exports.config = {
    name: "reaction",
    version: "1.0.0",
    credits: "Grandpa Academy",
    description: "Handle message reactions for unsend functionality"
};

module.exports.run = async function({ event, api }) {
    const bot = global.client;
    
    try {
        // Only handle message_reaction events
        if (event.type !== "message_reaction") {
            return;
        }
        
        // Check if it's a delete emoji reaction
        const deleteEmojis = ["🗑️", "🚮", "🚯"];
        
        if (!deleteEmojis.includes(event.reaction)) {
            return;
        }
        
        // Get the unsend command
        const unsendCommand = bot.commands.get("unsend");
        if (!unsendCommand || !unsendCommand.handleReaction) {
            return;
        }
        
        // Call the unsend command's reaction handler
        await unsendCommand.handleReaction(api, event);
        
    } catch (error) {
        console.error("Reaction event error:", error);
        bot.logger.error("Reaction event error:", error.message);
    }
};
