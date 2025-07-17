const fs = require('fs');
const path = require('path');
const login = require('../ga-fca');
const LanguageManager = require('./language');
const CommandHandler = require('./commandHandler');
const EventHandler = require('./eventHandler');
const Database = require('./database');
const Logger = require('./logger');
const AdvancedCommandTranslator = require('./translator');
const errorRecovery = require('./errorRecovery');

class GABot {
    constructor(config) {
        this.config = config;
        this.api = null;
        this.startTime = Date.now();
        
        // Initialize components
        this.lang = new LanguageManager(config.language);
        this.logger = new Logger(config.logs);
        this.database = new Database(config.database);
        this.commandHandler = new CommandHandler(this);
        this.eventHandler = new EventHandler(this);
        this.translator = new AdvancedCommandTranslator(this);

        // Setup global objects for MiraiV2 compatibility
        this.setupGlobals();
        
        // Bot state
        this.isReady = false;
        this.commands = new Map();
        this.events = new Map();
        this.cooldowns = new Map();
        
        // Statistics
        this.stats = {
            commandsExecuted: 0,
            messagesReceived: 0,
            errors: 0
        };
        
        this.setupErrorHandlers();
    }

    setupGlobals() {
        const Utils = require('./utils');
        const axios = require('axios');
        const fs = require('fs-extra');

        // Setup global utils for MiraiV2 compatibility
        global.utils = {
            getContent: async (url) => {
                try {
                    return await axios.get(url);
                } catch (error) {
                    throw error;
                }
            },

            downloadFile: async (url, path) => {
                try {
                    const response = await axios({
                        method: 'GET',
                        url: url,
                        responseType: 'stream'
                    });

                    const writer = fs.createWriteStream(path);
                    response.data.pipe(writer);

                    return new Promise((resolve, reject) => {
                        writer.on('finish', resolve);
                        writer.on('error', reject);
                    });
                } catch (error) {
                    throw error;
                }
            },

            randomString: (length) => {
                const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                let result = '';
                for (let i = 0; i < length; i++) {
                    result += chars.charAt(Math.floor(Math.random() * chars.length));
                }
                return result;
            },

            getStreamFromURL: async (url) => {
                try {
                    const response = await axios({
                        method: 'GET',
                        url: url,
                        responseType: 'stream',
                        timeout: 10000,
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                        }
                    });
                    return response.data;
                } catch (error) {
                    console.error('Error getting stream from URL:', error.message);
                    throw error;
                }
            },

            assets: {
                data: async (name) => {
                    return path.join(__dirname, '..', 'assets', 'data', `${name}.json`);
                }
            }
        };

        // Setup global nodemodule object
        global.nodemodule = {
            'fs-extra': fs,
            'path': path,
            'axios': axios
        };
    }
    
    async start() {
        try {
            this.logger.info(this.lang.t('system.loading'));

            // Set global client for MiraiV2 compatibility
            global.client = this;

            // Load commands and events
            await this.loadCommands();
            await this.loadEvents();

            // Login to Facebook
            await this.login();

            this.logger.info(this.lang.t('system.botStarted'));
            this.isReady = true;

        } catch (error) {
            this.logger.error(this.lang.t('system.error', error.message));
            process.exit(1);
        }
    }
    
    async login() {
        return new Promise((resolve, reject) => {
            const loginOptions = {
                appState: this.loadAppState(),
                ...this.config.facebook
            };
            
            login(loginOptions, (err, api) => {
                if (err) {
                    this.logger.error(this.lang.t('system.loginFailed', { error: err.message }));
                    return reject(err);
                }
                
                this.api = api;
                this.setupApiOptions();
                this.setupMessageListener();
                
                this.logger.info(this.lang.t('system.loginSuccess'));
                resolve();
            });
        });
    }
    
    loadAppState() {
        try {
            const appStatePath = path.resolve(this.config.facebook.appStatePath);
            if (fs.existsSync(appStatePath)) {
                return JSON.parse(fs.readFileSync(appStatePath, 'utf8'));
            }
        } catch (error) {
            this.logger.warn('Failed to load appstate:', error.message);
        }
        return null;
    }
    
    setupApiOptions() {
        this.api.setOptions({
            listenEvents: this.config.facebook.listenEvents,
            logRecordSize: this.config.facebook.logRecordSize,
            selfListen: this.config.facebook.selfListen,
            userAgent: this.config.facebook.userAgent
        });
    }
    
    setupMessageListener() {
        this.api.listenMqtt((err, message) => {
            if (err) {
                this.logger.error('Listen error:', err.message);
                return;
            }

            this.stats.messagesReceived++;
            this.handleMessage(message);
        });
    }
    
    async handleMessage(message) {
        try {
            // Handle different message types
            switch (message.type) {
                case 'message':
                    await this.handleTextMessage(message);
                    break;
                case 'event':
                    await this.eventHandler.handle(message);
                    break;
                default:
                    // Handle other message types if needed
                    break;
            }
        } catch (error) {
            this.stats.errors++;
            this.logger.error('Message handling error:', error.message);
        }
    }
    
    async handleTextMessage(message) {
        // Let the command handler handle all message processing
        await this.commandHandler.handleMessage(message);
    }
    
    async loadCommands() {
        // Use the command handler to load commands
        this.commandHandler.loadCommands();

        // Load cmd-v2 commands using advanced translator
        const v2Commands = await this.translator.loadV2Commands();

        // Optimize translator for performance
        this.translator.optimize();

        // Merge cmd-v2 commands with regular commands
        for (const [name, command] of v2Commands) {
            this.commandHandler.commands.set(name, command);
        }

        // Update bot's commands reference for compatibility
        this.commands = this.commandHandler.commands;

        this.logger.info(`Total commands loaded: ${this.commands.size} (including cmd-v2)`);

        // Log translator stats
        const stats = this.translator.getCacheStats();
        this.logger.debug(`CMD-V2 Cache: ${stats.size} entries, Hit rate: ${stats.hitRate}`);
    }
    
    async loadEvents() {
        const eventsPath = path.join(__dirname, '..', 'modules', 'events');

        // Create events directory if it doesn't exist
        if (!fs.existsSync(eventsPath)) {
            fs.mkdirSync(eventsPath, { recursive: true });
            this.logger.info('Created modules/events directory');
        }

        const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

        for (const file of eventFiles) {
            try {
                // Clear require cache for hot reload
                delete require.cache[require.resolve(path.join(eventsPath, file))];

                const event = require(path.join(eventsPath, file));

                // Support both old and new event structures
                if (event.config && event.config.name && event.run) {
                    // New MiraiV2 style event
                    this.events.set(event.config.name, event);
                } else if (event.name && event.execute) {
                    // Old style event - convert to new format
                    const convertedEvent = {
                        config: { name: event.name },
                        run: event.execute
                    };
                    this.events.set(event.name, convertedEvent);
                } else {
                    this.logger.warn(`Invalid event structure in ${file}. Missing required properties.`);
                    continue;
                }
                const eventName = event.config ? event.config.name : event.name;
                this.logger.debug(`Loaded event: ${eventName}`);
            } catch (error) {
                this.logger.error(`Failed to load event ${file}:`, error.message);
            }
        }

        this.logger.info(`Loaded ${this.events.size} events`);
    }
    
    // Utility methods
    sendMessage(threadID, message, messageID = null) {
        return new Promise((resolve, reject) => {
            const options = messageID ? { replyTo: messageID } : {};
            
            this.api.sendMessage(message, threadID, options, (err, info) => {
                if (err) return reject(err);
                resolve(info);
            });
        });
    }
    
    getUserInfo(userID) {
        return new Promise((resolve) => {
            this.api.getUserInfo(userID, (err, info) => {
                if (err) {
                    // Log critical getUserInfo errors
                    if (errorRecovery.isCriticalError(err)) {
                        errorRecovery.logCriticalError(err, `Bot.getUserInfo for user ${userID}`);
                    }

                    // Return fallback user info instead of rejecting
                    resolve({
                        id: userID,
                        name: "Facebook User",
                        firstName: "Facebook",
                        vanity: null,
                        thumbSrc: null,
                        profileUrl: null,
                        gender: null,
                        type: "user",
                        isFriend: false,
                        isBirthday: false
                    });
                    return;
                }
                resolve(info[userID] || {
                    id: userID,
                    name: "Unknown User",
                    firstName: "Unknown"
                });
            });
        });
    }

    getThreadInfo(threadID) {
        return new Promise((resolve) => {
            this.api.getThreadInfo(threadID, (err, info) => {
                if (err) {
                    // Return fallback thread info instead of rejecting
                    resolve({
                        threadID: threadID,
                        threadName: "Facebook Group",
                        participantIDs: [],
                        userInfo: [],
                        nicknames: {},
                        color: null,
                        emoji: null,
                        adminIDs: [],
                        approvalMode: false,
                        approvalQueue: [],
                        reactionsMuteMode: "REACTIONS_NOT_MUTED",
                        mentionsMuteMode: "MENTIONS_NOT_MUTED",
                        isGroup: true,
                        isSubscribed: true,
                        timestamp: Date.now()
                    });
                    return;
                }
                resolve(info);
            });
        });
    }

    // === GA-FCA API METHODS ===

    // Message Methods
    sendMessage(message, threadID, messageID = null) {
        return new Promise((resolve, reject) => {
            this.api.sendMessage(message, threadID, (err, info) => {
                if (err) return reject(err);
                resolve(info);
            }, messageID);
        });
    }

    replyMessage(message, messageID, threadID) {
        return new Promise((resolve, reject) => {
            this.api.sendMessage(message, threadID, (err, info) => {
                if (err) return reject(err);
                resolve(info);
            }, messageID);
        });
    }

    editMessage(newMessage, messageID) {
        return new Promise((resolve, reject) => {
            this.api.editMessage(newMessage, messageID, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }

    deleteMessage(messageID) {
        return new Promise((resolve, reject) => {
            this.api.deleteMessage(messageID, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }

    unsendMessage(messageID) {
        return new Promise((resolve, reject) => {
            this.api.unsendMessage(messageID, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }

    forwardAttachment(attachmentID, userOrUsers) {
        return new Promise((resolve, reject) => {
            this.api.forwardAttachment(attachmentID, userOrUsers, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }

    setMessageReaction(reaction, messageID) {
        return new Promise((resolve, reject) => {
            this.api.setMessageReaction(reaction, messageID, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }

    // Group Management Methods
    addUserToGroup(userID, threadID) {
        return new Promise((resolve, reject) => {
            this.api.addUserToGroup(userID, threadID, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }

    removeUserFromGroup(userID, threadID) {
        return new Promise((resolve, reject) => {
            this.api.removeUserFromGroup(userID, threadID, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }

    changeAdminStatus(threadID, adminIDs, adminStatus) {
        return new Promise((resolve, reject) => {
            this.api.changeAdminStatus(threadID, adminIDs, adminStatus, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }

    changeGroupImage(image, threadID) {
        return new Promise((resolve, reject) => {
            this.api.changeGroupImage(image, threadID, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }

    changeCover(coverURL, threadID) {
        return new Promise((resolve, reject) => {
            this.api.changeCover(coverURL, threadID, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }

    changeThreadColor(color, threadID) {
        return new Promise((resolve, reject) => {
            this.api.changeThreadColor(color, threadID, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }

    changeThreadEmoji(emoji, threadID) {
        return new Promise((resolve, reject) => {
            this.api.changeThreadEmoji(emoji, threadID, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }

    setTitle(newTitle, threadID) {
        return new Promise((resolve, reject) => {
            this.api.setTitle(newTitle, threadID, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }

    changeNickname(nickname, threadID, participantID) {
        return new Promise((resolve, reject) => {
            this.api.changeNickname(nickname, threadID, participantID, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }

    muteThread(threadID, muteSeconds) {
        return new Promise((resolve, reject) => {
            this.api.muteThread(threadID, muteSeconds, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }

    // User Profile Methods
    changeAvatar(image) {
        return new Promise((resolve, reject) => {
            this.api.changeAvatar(image, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }

    changeBio(bio) {
        return new Promise((resolve, reject) => {
            this.api.changeBio(bio, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }

    changeName(name) {
        return new Promise((resolve, reject) => {
            this.api.changeName(name, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }

    changeUsername(username) {
        return new Promise((resolve, reject) => {
            this.api.changeUsername(username, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }

    // Thread Management Methods
    createNewGroup(participantIDs, groupTitle) {
        return new Promise((resolve, reject) => {
            this.api.createNewGroup(participantIDs, groupTitle, (err, threadID) => {
                if (err) return reject(err);
                resolve(threadID);
            });
        });
    }

    deleteThread(threadID) {
        return new Promise((resolve, reject) => {
            this.api.deleteThread(threadID, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }

    changeArchivedStatus(threadID, archive) {
        return new Promise((resolve, reject) => {
            this.api.changeArchivedStatus(threadID, archive, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }

    // Information Methods
    getThreadList(limit, timestamp, tags) {
        return new Promise((resolve, reject) => {
            this.api.getThreadList(limit, timestamp, tags, (err, list) => {
                if (err) return reject(err);
                resolve(list);
            });
        });
    }

    getThreadHistory(threadID, amount, timestamp) {
        return new Promise((resolve, reject) => {
            this.api.getThreadHistory(threadID, amount, timestamp, (err, history) => {
                if (err) return reject(err);
                resolve(history);
            });
        });
    }

    getFriendsList() {
        return new Promise((resolve, reject) => {
            this.api.getFriendsList((err, data) => {
                if (err) return reject(err);
                resolve(data);
            });
        });
    }

    getCurrentUserID() {
        return this.api.getCurrentUserID();
    }

    getUserID(name) {
        return new Promise((resolve, reject) => {
            this.api.getUserID(name, (err, data) => {
                if (err) return reject(err);
                resolve(data);
            });
        });
    }

    // Utility Methods
    sendTypingIndicator(threadID) {
        return new Promise((resolve, reject) => {
            this.api.sendTypingIndicator(threadID, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }

    markAsRead(threadID) {
        return new Promise((resolve, reject) => {
            this.api.markAsRead(threadID, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }

    markAsDelivered(threadID) {
        return new Promise((resolve, reject) => {
            this.api.markAsDelivered(threadID, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }

    markAsSeen() {
        return new Promise((resolve, reject) => {
            this.api.markAsSeen((err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }

    // Social Methods
    handleFriendRequest(userID, accept) {
        return new Promise((resolve, reject) => {
            this.api.handleFriendRequest(userID, accept, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }

    handleMessageRequest(threadID, accept) {
        return new Promise((resolve, reject) => {
            this.api.handleMessageRequest(threadID, accept, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }

    changeBlockedStatus(userID, block) {
        return new Promise((resolve, reject) => {
            this.api.changeBlockedStatus(userID, block, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }

    // Content Methods
    createPoll(title, threadID, options) {
        return new Promise((resolve, reject) => {
            this.api.createPoll(title, threadID, options, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }

    createPost(content, url) {
        return new Promise((resolve, reject) => {
            this.api.createPost(content, url, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }

    uploadAttachment(attachment, threadID) {
        return new Promise((resolve, reject) => {
            this.api.uploadAttachment(attachment, threadID, (err, data) => {
                if (err) return reject(err);
                resolve(data);
            });
        });
    }

    // === ADDITIONAL GA-FCA METHODS ===

    // Message Management Methods
    getMessage(messageID) {
        return new Promise((resolve, reject) => {
            this.api.getMessage(messageID, (err, data) => {
                if (err) return reject(err);
                resolve(data);
            });
        });
    }

    pinMessage(messageID, pin = true) {
        return new Promise((resolve, reject) => {
            this.api.pinMessage(messageID, pin, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }

    sendTypingIndicatorV2(threadID, isTyping = true) {
        return new Promise((resolve, reject) => {
            this.api.sendTypingIndicatorV2(threadID, isTyping, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }

    // User Profile Methods
    changeAvatarV2(image) {
        return new Promise((resolve, reject) => {
            this.api.changeAvatarV2(image, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }

    getAvatarUser(userID) {
        return new Promise((resolve, reject) => {
            this.api.getAvatarUser(userID, (err, data) => {
                if (err) return reject(err);
                resolve(data);
            });
        });
    }

    getUID(name) {
        return new Promise((resolve, reject) => {
            this.api.getUID(name, (err, data) => {
                if (err) return reject(err);
                resolve(data);
            });
        });
    }

    // Thread Management Methods
    getThreadPictures(threadID) {
        return new Promise((resolve, reject) => {
            this.api.getThreadPictures(threadID, (err, data) => {
                if (err) return reject(err);
                resolve(data);
            });
        });
    }

    searchForThread(name) {
        return new Promise((resolve, reject) => {
            this.api.searchForThread(name, (err, data) => {
                if (err) return reject(err);
                resolve(data);
            });
        });
    }

    markAsReadAll() {
        return new Promise((resolve, reject) => {
            this.api.markAsReadAll((err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }

    // Social Methods
    follow(userID) {
        return new Promise((resolve, reject) => {
            this.api.follow(userID, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }

    unfriend(userID) {
        return new Promise((resolve, reject) => {
            this.api.unfriend(userID, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }

    changeBlockedStatusMqtt(userID, block) {
        return new Promise((resolve, reject) => {
            this.api.changeBlockedStatusMqtt(userID, block, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }

    // Content Methods
    createCommentPost(content, postID) {
        return new Promise((resolve, reject) => {
            this.api.createCommentPost(content, postID, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }

    setPostReaction(postID, type) {
        return new Promise((resolve, reject) => {
            this.api.setPostReaction(postID, type, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }

    setStoryReaction(storyID, type) {
        return new Promise((resolve, reject) => {
            this.api.setStoryReaction(storyID, type, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }

    shareContact(contact, threadID) {
        return new Promise((resolve, reject) => {
            this.api.shareContact(contact, threadID, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }

    shareLink(link, threadID) {
        return new Promise((resolve, reject) => {
            this.api.shareLink(link, threadID, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }

    // Search Methods
    searchStickers(query) {
        return new Promise((resolve, reject) => {
            this.api.searchStickers(query, (err, data) => {
                if (err) return reject(err);
                resolve(data);
            });
        });
    }

    getEmojiUrl(emoji) {
        return new Promise((resolve, reject) => {
            this.api.getEmojiUrl(emoji, (err, data) => {
                if (err) return reject(err);
                resolve(data);
            });
        });
    }

    resolvePhotoUrl(photoURL) {
        return new Promise((resolve, reject) => {
            this.api.resolvePhotoUrl(photoURL, (err, data) => {
                if (err) return reject(err);
                resolve(data);
            });
        });
    }

    // HTTP Methods
    httpGet(url, options = {}) {
        return new Promise((resolve, reject) => {
            this.api.httpGet(url, options, (err, data) => {
                if (err) return reject(err);
                resolve(data);
            });
        });
    }

    httpPost(url, form, options = {}) {
        return new Promise((resolve, reject) => {
            this.api.httpPost(url, form, options, (err, data) => {
                if (err) return reject(err);
                resolve(data);
            });
        });
    }

    httpPostFormData(url, form, options = {}) {
        return new Promise((resolve, reject) => {
            this.api.httpPostFormData(url, form, options, (err, data) => {
                if (err) return reject(err);
                resolve(data);
            });
        });
    }

    // System Methods
    logout() {
        return new Promise((resolve, reject) => {
            this.api.logout((err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }

    refreshFb_dtsg() {
        return new Promise((resolve, reject) => {
            this.api.refreshFb_dtsg((err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }

    getAccess() {
        return new Promise((resolve, reject) => {
            this.api.getAccess((err, data) => {
                if (err) return reject(err);
                resolve(data);
            });
        });
    }

    addExternalModule(moduleObject) {
        return new Promise((resolve, reject) => {
            this.api.addExternalModule(moduleObject, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }

    // Listen Methods
    listenMqtt(callback) {
        return this.api.listenMqtt(callback);
    }

    listenNotification(callback) {
        return this.api.listenNotification(callback);
    }

    // Thread Colors
    get threadColors() {
        return this.api.threadColors || {
            MessengerBlue: '#0084ff',
            Viking: '#44bec7',
            GoldenPoppy: '#ffc300',
            BrightRed: '#fa3c4c',
            Fern: '#4c7957',
            Rose: '#f25084',
            Lavender: '#8b6cbf',
            Maple: '#e68858',
            Mango: '#ff7e29',
            BlueBerry: '#6699cc',
            Citrus: '#13cf13',
            Candy: '#ff69b4',
            DefaultBlue: '#0084ff',
            HotPink: '#ff69b4',
            AquaBlue: '#0084ff',
            BrightPurple: '#8b6cbf',
            CoralPink: '#ff7674',
            Orange: '#ff7e29',
            GreenBlue: '#20cef5',
            Red: '#fa3c4c',
            Chatroom: '#0084ff',
            Blue: '#0084ff',
            Green: '#13cf13',
            Purple: '#8b6cbf',
            Pink: '#ff69b4'
        };
    }
    
    getThreadInfo(threadID) {
        return new Promise((resolve, reject) => {
            this.api.getThreadInfo(threadID, (err, info) => {
                if (err) return reject(err);
                resolve(info);
            });
        });
    }
    
    isAdmin(userID) {
        return this.config.admins.includes(userID);
    }
    
    isModerator(userID) {
        return this.config.moderators.includes(userID) || this.isAdmin(userID);
    }
    
    isBanned(userID) {
        return this.config.bannedUsers.includes(userID);
    }
    
    isThreadBanned(threadID) {
        return this.config.bannedThreads.includes(threadID);
    }
    
    getUptime() {
        return Math.floor((Date.now() - this.startTime) / 1000);
    }
    
    setupErrorHandlers() {
        process.on('uncaughtException', (error) => {
            this.logger.error('Uncaught Exception:', error);
            if (this.config.autoRestart) {
                this.restart();
            }
        });
        
        process.on('unhandledRejection', (reason, promise) => {
            this.logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
        });
    }
    
    restart() {
        this.logger.info('Restarting bot...');
        process.exit(0);
    }
    
    stop() {
        this.logger.info(this.lang.t('system.botStopped'));
        if (this.api) {
            this.api.logout();
        }
        process.exit(0);
    }
}

module.exports = GABot;
