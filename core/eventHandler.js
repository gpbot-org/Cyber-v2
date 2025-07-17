class EventHandler {
    constructor(bot) {
        this.bot = bot;
        this.antiSpam = new Map();
        this.antiRaid = new Map();
    }
    
    async handle(message) {
        try {
            // Check if thread is banned
            if (this.bot.isThreadBanned(message.threadID)) {
                return;
            }
            
            // Handle different event types with MiraiV2 events
            switch (message.logMessageType) {
                case 'log:subscribe':
                    await this.runEvent('welcome', message);
                    break;
                case 'log:unsubscribe':
                    await this.runEvent('goodbye', message);
                    break;
                case 'log:thread-name':
                    await this.handleNameChange(message);
                    break;
                case 'log:thread-color':
                    await this.handleColorChange(message);
                    break;
                case 'log:thread-icon':
                    await this.handleIconChange(message);
                    break;
                case 'log:user-nickname':
                    await this.handleNicknameChange(message);
                    break;
                default:
                    // Handle regular messages and custom events
                    await this.runEvent('message', message);
                    break;
            }
        } catch (error) {
            this.bot.logger.error('Event handling error:', error.message);
        }
    }

    // Run MiraiV2 style events
    async runEvent(eventName, message) {
        const event = this.bot.events.get(eventName);
        if (!event) {
            return;
        }

        try {
            // Create getText function for MiraiV2 compatibility
            const getText = (key, ...replacements) => {
                const langData = event.languages || {};
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

            // Execute event with MiraiV2 style parameters
            if (event.run) {
                await event.run({
                    event: message,
                    api: this.bot.api,
                    getText: getText,
                    Users: this.bot.database,
                    Threads: this.bot.database,
                    Currencies: this.bot.database
                });
            } else if (event.execute) {
                // Fallback for old-style events
                await event.execute(this.bot, message);
            }

        } catch (error) {
            this.bot.logger.error(`Event execution error (${eventName}):`, error.message);
        }
    }
    
    async handleJoin(message) {
        if (!this.bot.config.events.welcome.enabled) {
            return;
        }
        
        // Anti-raid protection
        if (await this.checkRaid(message)) {
            return;
        }
        
        for (const userID of message.logMessageData.addedParticipants) {
            try {
                const userInfo = await this.bot.getUserInfo(userID);
                const threadInfo = await this.bot.getThreadInfo(message.threadID);
                
                const welcomeMessage = this.bot.lang.t('events.welcome.message', {
                    name: userInfo.name,
                    threadName: threadInfo.threadName,
                    prefix: this.bot.config.prefix
                });
                
                await this.bot.sendMessage(message.threadID, welcomeMessage);
                
                // Run custom welcome event if exists
                const welcomeEvent = this.bot.events.get('welcome');
                if (welcomeEvent) {
                    await welcomeEvent.execute(this.bot, message, userInfo, threadInfo);
                }
                
            } catch (error) {
                this.bot.logger.error('Welcome message error:', error.message);
            }
        }
    }
    
    async handleLeave(message) {
        if (!this.bot.config.events.goodbye.enabled) {
            return;
        }
        
        for (const userID of message.logMessageData.leftParticipantFbId ? [message.logMessageData.leftParticipantFbId] : []) {
            try {
                const userInfo = await this.bot.getUserInfo(userID);
                const threadInfo = await this.bot.getThreadInfo(message.threadID);
                
                const goodbyeMessage = this.bot.lang.t('events.goodbye.message', {
                    name: userInfo.name,
                    threadName: threadInfo.threadName
                });
                
                await this.bot.sendMessage(message.threadID, goodbyeMessage);
                
                // Run custom goodbye event if exists
                const goodbyeEvent = this.bot.events.get('goodbye');
                if (goodbyeEvent) {
                    await goodbyeEvent.execute(this.bot, message, userInfo, threadInfo);
                }
                
            } catch (error) {
                this.bot.logger.error('Goodbye message error:', error.message);
            }
        }
    }
    
    async handleNameChange(message) {
        const nameChangeEvent = this.bot.events.get('nameChange');
        if (nameChangeEvent) {
            await nameChangeEvent.execute(this.bot, message);
        }
    }
    
    async handleColorChange(message) {
        const colorChangeEvent = this.bot.events.get('colorChange');
        if (colorChangeEvent) {
            await colorChangeEvent.execute(this.bot, message);
        }
    }
    
    async handleIconChange(message) {
        const iconChangeEvent = this.bot.events.get('iconChange');
        if (iconChangeEvent) {
            await iconChangeEvent.execute(this.bot, message);
        }
    }
    
    async handleNicknameChange(message) {
        const nicknameChangeEvent = this.bot.events.get('nicknameChange');
        if (nicknameChangeEvent) {
            await nicknameChangeEvent.execute(this.bot, message);
        }
    }
    
    async handleCustomEvent(message) {
        // Handle any custom events that might be registered
        for (const [name, event] of this.bot.events) {
            if (event.type === 'custom' && event.condition && event.condition(message)) {
                try {
                    await event.execute(this.bot, message);
                } catch (error) {
                    this.bot.logger.error(`Custom event error (${name}):`, error.message);
                }
            }
        }
    }
    
    async checkSpam(message) {
        if (!this.bot.config.security.antiSpam.enabled) {
            return false;
        }
        
        const userID = message.senderID;
        const now = Date.now();
        const timeWindow = this.bot.config.security.antiSpam.timeWindow;
        const maxMessages = this.bot.config.security.antiSpam.maxMessages;
        
        // Skip for admins and moderators
        if (this.bot.isModerator(userID)) {
            return false;
        }
        
        if (!this.antiSpam.has(userID)) {
            this.antiSpam.set(userID, []);
        }
        
        const userMessages = this.antiSpam.get(userID);
        
        // Remove old messages outside time window
        const recentMessages = userMessages.filter(time => now - time < timeWindow);
        recentMessages.push(now);
        
        this.antiSpam.set(userID, recentMessages);
        
        if (recentMessages.length > maxMessages) {
            await this.handleSpam(message, userID);
            return true;
        }
        
        return false;
    }
    
    async handleSpam(message, userID) {
        const punishment = this.bot.config.security.antiSpam.punishment;
        const userInfo = await this.bot.getUserInfo(userID);
        
        switch (punishment) {
            case 'warn':
                await this.bot.sendMessage(message.threadID, 
                    this.bot.lang.t('security.spam.warning', { name: userInfo.name }));
                break;
            case 'mute':
                // Implement mute functionality if needed
                await this.bot.sendMessage(message.threadID, 
                    this.bot.lang.t('security.spam.muted', { name: userInfo.name }));
                break;
            case 'ban':
                this.bot.config.bannedUsers.push(userID);
                await this.bot.sendMessage(message.threadID, 
                    this.bot.lang.t('security.spam.banned', { name: userInfo.name }));
                break;
        }
        
        this.bot.logger.warn(`Spam detected from ${userID} (${userInfo.name})`);
    }
    
    async checkRaid(message) {
        if (!this.bot.config.security.antiRaid.enabled) {
            return false;
        }
        
        const threadID = message.threadID;
        const now = Date.now();
        const timeWindow = this.bot.config.security.antiRaid.timeWindow;
        const maxJoins = this.bot.config.security.antiRaid.maxJoins;
        
        if (!this.antiRaid.has(threadID)) {
            this.antiRaid.set(threadID, []);
        }
        
        const threadJoins = this.antiRaid.get(threadID);
        
        // Remove old joins outside time window
        const recentJoins = threadJoins.filter(time => now - time < timeWindow);
        recentJoins.push(now);
        
        this.antiRaid.set(threadID, recentJoins);
        
        if (recentJoins.length > maxJoins) {
            await this.handleRaid(message, threadID);
            return true;
        }
        
        return false;
    }
    
    async handleRaid(message, threadID) {
        await this.bot.sendMessage(threadID, 
            this.bot.lang.t('security.raid.detected'));
        
        // Remove new members if possible
        try {
            for (const userID of message.logMessageData.addedParticipants) {
                if (!this.bot.isModerator(userID)) {
                    await this.bot.api.removeUserFromGroup(userID, threadID);
                    
                    const userInfo = await this.bot.getUserInfo(userID);
                    await this.bot.sendMessage(threadID, 
                        this.bot.lang.t('security.raid.blocked', { name: userInfo.name }));
                }
            }
        } catch (error) {
            this.bot.logger.error('Raid protection error:', error.message);
        }
        
        this.bot.logger.warn(`Raid detected in thread ${threadID}`);
    }
}

module.exports = EventHandler;
