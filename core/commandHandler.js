class CommandHandler {
    constructor(bot) {
        this.bot = bot;
        this.cooldowns = new Map();
        this.commands = new Map();
        this.aliases = new Map();
    }

    // Load all commands from modules directory
    loadCommands() {
        const fs = require('fs');
        const path = require('path');

        const commandsPath = path.join(__dirname, '..', 'modules', 'commands');

        // Create commands directory if it doesn't exist
        if (!fs.existsSync(commandsPath)) {
            fs.mkdirSync(commandsPath, { recursive: true });
        }

        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            try {
                // Clear require cache for hot reload
                delete require.cache[require.resolve(path.join(commandsPath, file))];

                const command = require(path.join(commandsPath, file));

                // Validate MiraiV2 command structure
                if (!command.config || !command.config.name || !command.run) {
                    this.bot.logger.warn(`Invalid command structure in ${file}. Missing config or run function.`);
                    continue;
                }

                // Load dependencies
                if (command.config.dependencies) {
                    global.nodemodule = global.nodemodule || {};
                    for (const dep of Object.keys(command.config.dependencies)) {
                        try {
                            global.nodemodule[dep] = require(dep);
                        } catch (error) {
                            this.bot.logger.warn(`Failed to load dependency ${dep} for command ${command.config.name}`);
                        }
                    }
                }

                // Register command
                this.commands.set(command.config.name, command);

                // Register aliases if any
                if (command.config.aliases) {
                    for (const alias of command.config.aliases) {
                        this.aliases.set(alias, command.config.name);
                    }
                }

                this.bot.logger.debug(`Loaded command: ${command.config.name} v${command.config.version || '1.0.0'}`);
            } catch (error) {
                this.bot.logger.error(`Failed to load command ${file}:`, error.message);
            }
        }

        this.bot.logger.info(`Loaded ${this.commands.size} commands`);
    }

    // Handle incoming message and execute command if found
    async handleMessage(event) {
        if (!event.body) {
            return;
        }

        // Debug log to check message type
        if (event.type === "message_reply") {
            this.bot.logger.debug(`Reply message detected: ${event.body}`);
        }

        let args, commandName, command;
        let usedPrefix = false;

        // Check for prefix commands first
        if (event.body.startsWith(this.bot.config.prefix)) {
            args = event.body.slice(this.bot.config.prefix.length).trim().split(/ +/);
            commandName = args.shift().toLowerCase();
            usedPrefix = true;

            // Find command by name or alias
            command = this.commands.get(commandName);
            if (!command && this.aliases.has(commandName)) {
                command = this.commands.get(this.aliases.get(commandName));
            }
        }

        // If no prefix command found, check for no-prefix commands
        if (!command) {
            args = event.body.trim().split(/ +/);
            commandName = args.shift().toLowerCase();
            usedPrefix = false;

            // Find no-prefix command
            command = this.commands.get(commandName);
            if (!command && this.aliases.has(commandName)) {
                command = this.commands.get(this.aliases.get(commandName));
            }

            // Check if this command requires prefix
            if (command && command.config.prefix !== false) {
                command = null; // Command requires prefix but none was used
            }
        }

        if (!command) {
            return; // Command not found or prefix mismatch
        }

        // Check if prefix usage matches command requirement
        const requiresPrefix = command.config.prefix !== false;
        if (requiresPrefix && !usedPrefix) {
            return; // Command requires prefix but none was used
        }
        if (!requiresPrefix && usedPrefix) {
            return; // Command doesn't need prefix but one was used
        }

        // Execute command
        await this.executeCommand(command, event, args);
    }

    // Execute a specific command
    async executeCommand(command, event, args) {
        try {
            // Check if commands are enabled
            if (!this.bot.config.commands.enabled) {
                return;
            }

            // Check if user is banned
            if (this.bot.isBanned(event.senderID)) {
                return;
            }

            // Check if thread is banned
            if (this.bot.isThreadBanned(event.threadID)) {
                return;
            }

            // Check admin only mode
            if (this.bot.config.adminOnly && !this.bot.isAdmin(event.senderID)) {
                return this.bot.api.sendMessage(
                    this.bot.lang.t('system.adminOnly'),
                    event.threadID,
                    event.messageID
                );
            }

            // Check command permissions
            if (!this.checkPermission(command, event.senderID)) {
                return this.bot.api.sendMessage(
                    this.bot.lang.t('system.noPermission'),
                    event.threadID,
                    event.messageID
                );
            }

            // Check cooldown
            if (this.checkCooldown(command, event)) {
                return;
            }

            // Log command execution
            if (this.bot.config.commands.logCommands) {
                this.bot.logger.info(`Command executed: ${command.config.name} by ${event.senderID} in ${event.threadID}`);
            }

            // Create getText function for MiraiV2 compatibility
            const getText = (key, ...replacements) => {
                const langData = command.languages || {};
                const currentLang = this.bot.lang.getLanguage();

                let text = langData[currentLang] && langData[currentLang][key]
                    ? langData[currentLang][key]
                    : (langData['en'] && langData['en'][key] ? langData['en'][key] : key);

                // Replace %1, %2, etc. with arguments
                replacements.forEach((replacement, index) => {
                    text = text.replace(new RegExp(`%${index + 1}`, 'g'), replacement);
                });

                return text;
            };

            // Execute command with MiraiV2 style parameters
            await command.run({
                event: event,
                api: this.bot.api,
                args: args,
                getText: getText,
                Users: this.bot.database,
                Threads: this.bot.database,
                Currencies: this.bot.database,
                permssion: this.getPermissionLevel(event.senderID),
                prefix: this.bot.config.prefix
            });

            // Update statistics
            this.bot.stats.commandsExecuted++;

        } catch (error) {
            this.bot.logger.error(`Command execution error (${command.config.name}):`, error.message);
            this.bot.stats.errors++;

            this.bot.api.sendMessage(
                this.bot.lang.t('system.error', error.message),
                event.threadID,
                event.messageID
            );
        }
    }
    
    // Check command permissions
    checkPermission(command, userID) {
        const hasPermssion = command.config.hasPermssion || 0;

        switch (hasPermssion) {
            case 0: // Everyone
                return true;
            case 1: // Moderator
                return this.bot.isModerator(userID);
            case 2: // Admin
                return this.bot.isAdmin(userID);
            default:
                return true;
        }
    }

    // Check command cooldown
    checkCooldown(command, event) {
        const cooldownTime = command.config.cooldowns || this.bot.config.commands.cooldown;

        if (cooldownTime <= 0) {
            return false;
        }

        // Admins bypass cooldown
        if (this.bot.isAdmin(event.senderID)) {
            return false;
        }

        const now = Date.now();
        const cooldownKey = `${command.config.name}_${event.senderID}`;

        if (this.cooldowns.has(cooldownKey)) {
            const expirationTime = this.cooldowns.get(cooldownKey) + (cooldownTime * 1000);

            if (now < expirationTime) {
                const timeLeft = Math.ceil((expirationTime - now) / 1000);

                this.bot.api.sendMessage(
                    this.bot.lang.t('system.cooldown', timeLeft),
                    event.threadID,
                    event.messageID
                );

                return true;
            }
        }

        this.cooldowns.set(cooldownKey, now);

        // Clean up old cooldowns
        setTimeout(() => {
            this.cooldowns.delete(cooldownKey);
        }, cooldownTime * 1000);

        return false;
    }

    // Get user permission level
    getPermissionLevel(userID) {
        if (this.bot.isAdmin(userID)) return 2;
        if (this.bot.isModerator(userID)) return 1;
        return 0;
    }

    // Get command info for help system
    getCommandInfo(commandName) {
        let command = this.commands.get(commandName);
        if (!command && this.aliases.has(commandName)) {
            command = this.commands.get(this.aliases.get(commandName));
        }

        if (!command) {
            return null;
        }

        return {
            name: command.config.name,
            description: command.config.description,
            usage: command.config.usages ? `${this.bot.config.prefix}${command.config.name} ${command.config.usages}` : `${this.bot.config.prefix}${command.config.name}`,
            aliases: command.config.aliases || [],
            adminOnly: command.config.hasPermssion === 2,
            moderatorOnly: command.config.hasPermssion === 1,
            cooldown: command.config.cooldowns || this.bot.config.commands.cooldown,
            category: command.config.commandCategory || 'general',
            version: command.config.version || '1.0.0',
            credits: command.config.credits || 'Unknown'
        };
    }

    // Get all available commands for a user
    getAvailableCommands(userID) {
        const commands = [];
        const userPermission = this.getPermissionLevel(userID);

        for (const [name, command] of this.commands) {
            const requiredPermission = command.config.hasPermssion || 0;

            if (userPermission >= requiredPermission) {
                commands.push({
                    name: command.config.name,
                    description: command.config.description,
                    category: command.config.commandCategory || 'general',
                    version: command.config.version || '1.0.0',
                    credits: command.config.credits || 'Unknown',
                    permission: requiredPermission
                });
            }
        }

        return commands;
    }

    // Get all commands (for admin use)
    getAllCommands() {
        const commands = [];
        for (const [name, command] of this.commands) {
            commands.push({
                name: command.config.name,
                description: command.config.description,
                category: command.config.commandCategory || 'general',
                version: command.config.version || '1.0.0',
                credits: command.config.credits || 'Unknown',
                permission: command.config.hasPermssion || 0,
                cooldown: command.config.cooldowns || 0
            });
        }
        return commands;
    }

    // Reload all commands
    reloadCommands() {
        this.commands.clear();
        this.aliases.clear();
        this.loadCommands();
    }
}

module.exports = CommandHandler;
