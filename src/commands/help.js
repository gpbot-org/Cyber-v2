// Old Syntax Command - Help Command

module.exports.config = {
    name: "help",
    version: "1.0.0",
    permission: 0,
    credits: "Cyber-v2",
    description: "Show available commands",
    category: "system",
    usage: "help [command]",
    cooldown: 3
};

module.exports.run = async function({ event, api, args, getText }) {
    const { threadID, messageID } = event;
    
    try {
        if (args[0]) {
            // Show help for specific command
            const commandName = args[0].toLowerCase();
            const command = global.client.commands.get(commandName);
            
            if (!command) {
                return api.sendMessage(`❌ Command "${commandName}" not found!`, threadID, messageID);
            }
            
            const helpText = `📋 **${command.config.name}**\n\n` +
                           `📝 Description: ${command.config.description}\n` +
                           `📖 Usage: ${global.client.config.prefix}${command.config.usage}\n` +
                           `🏷️ Category: ${command.config.category}\n` +
                           `⏱️ Cooldown: ${command.config.cooldown}s\n` +
                           `👑 Permission: ${command.config.permission}\n` +
                           `👨‍💻 Credits: ${command.config.credits}`;
            
            return api.sendMessage(helpText, threadID, messageID);
        }
        
        // Show all commands
        const commands = global.client.commands;
        const categories = {};
        
        // Group commands by category
        commands.forEach((command, name) => {
            const category = command.config.category || 'other';
            if (!categories[category]) {
                categories[category] = [];
            }
            categories[category].push(command.config.name);
        });
        
        let helpMessage = "📚 **Available Commands**\n\n";
        
        Object.keys(categories).forEach(category => {
            helpMessage += `🏷️ **${category.toUpperCase()}**\n`;
            helpMessage += `${categories[category].join(', ')}\n\n`;
        });
        
        helpMessage += `💡 Use ${global.client.config.prefix}help [command] for detailed info\n`;
        helpMessage += `🤖 Total commands: ${commands.size}`;
        
        return api.sendMessage(helpMessage, threadID, messageID);
        
    } catch (error) {
        return api.sendMessage(`❌ Error: ${error.message}`, threadID, messageID);
    }
};