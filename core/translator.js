const fs = require('fs');
const path = require('path');
const axios = require('axios');
const errorRecovery = require('./errorRecovery');

class AdvancedCommandTranslator {
    constructor(bot) {
        this.bot = bot;
        this.commands = new Map();
        this.loadedCommands = new Map();
        this.cache = new Map();
        this.shortcuts = this.createShortcuts();
        this.autoImports = this.createAutoImports();
        this.gaFcaShortcuts = this.createGAFCAShortcuts();
    }

    // Create ultra-minimal shortcuts for all GA-FCA functions
    createGAFCAShortcuts() {
        return {
            // === Ultra-short messaging shortcuts ===
            send: (msg, tid, mid) => this.bot.api.sendMessage(msg, tid, mid),
            reply: (msg, tid, mid) => this.bot.api.sendMessage(msg, tid, mid),
            edit: (msg, mid) => this.bot.api.editMessage(msg, mid),
            unsend: (mid) => this.bot.api.unsendMessage(mid),
            delete: (mid) => this.bot.api.deleteMessage(mid),
            forward: (mid, tid) => this.bot.api.forwardAttachment(mid, tid),
            react: (emoji, mid) => this.bot.api.setMessageReaction(emoji, mid),
            typing: (tid, state = true) => this.bot.api.sendTypingIndicator(tid, state),
            typingV2: (tid, state = true) => this.bot.api.sendTypingIndicatorV2(tid, state),
            
            // === User management shortcuts ===
            userInfo: (uid) => this.bot.api.getUserInfo(uid),
            userId: (name) => this.bot.api.getUserID(name),
            uid: (name) => this.bot.api.getUID(name),
            avatar: (uid) => this.bot.api.getAvatarUser(uid),
            currentId: () => this.bot.api.getCurrentUserID(),
            
            // === Thread/Group management shortcuts ===
            threadInfo: (tid) => this.bot.api.getThreadInfo(tid),
            threadList: () => this.bot.api.getThreadList(),
            threadHistory: (tid, amount) => this.bot.api.getThreadHistory(tid, amount),
            threadPics: (tid) => this.bot.api.getThreadPictures(tid),
            searchThread: (query) => this.bot.api.searchForThread(query),
            
            // === Group admin shortcuts ===
            kick: (uid, tid) => this.bot.api.removeUserFromGroup(uid, tid),
            add: (uid, tid) => this.bot.api.addUserToGroup(uid, tid),
            promote: (tid, uid) => this.bot.api.changeAdminStatus(tid, uid, true),
            demote: (tid, uid) => this.bot.api.changeAdminStatus(tid, uid, false),
            
            // === Thread customization shortcuts ===
            setTitle: (title, tid) => this.bot.api.setTitle(title, tid),
            setEmoji: (emoji, tid) => this.bot.api.changeThreadEmoji(emoji, tid),
            setColor: (color, tid) => this.bot.api.changeThreadColor(color, tid),
            setNick: (nick, tid, uid) => this.bot.api.changeNickname(nick, tid, uid),
            setGroupImg: (img, tid) => this.bot.api.changeGroupImage(img, tid),
            
            // === Message status shortcuts ===
            markRead: (tid) => this.bot.api.markAsRead(tid),
            markDelivered: (tid) => this.bot.api.markAsDelivered(tid),
            markSeen: (tid) => this.bot.api.markAsSeen(tid),
            markAllRead: () => this.bot.api.markAsReadAll(),
            
            // === Thread management shortcuts ===
            archive: (tid, state = true) => this.bot.api.changeArchivedStatus(tid, state),
            mute: (tid, seconds) => this.bot.api.muteThread(tid, seconds),
            deleteThread: (tid) => this.bot.api.deleteThread(tid),
            pin: (mid, action = true) => this.bot.api.pinMessage(mid, action),
            
            // === User profile shortcuts ===
            changeName: (name) => this.bot.api.changeName(name),
            changeUsername: (username) => this.bot.api.changeUsername(username),
            changeBio: (bio) => this.bot.api.changeBio(bio),
            changeAvatar: (img) => this.bot.api.changeAvatar(img),
            changeAvatarV2: (img) => this.bot.api.changeAvatarV2(img),
            changeCover: (img) => this.bot.api.changeCover(img),
            
            // === Friend management shortcuts ===
            friendsList: () => this.bot.api.getFriendsList(),
            follow: (uid) => this.bot.api.follow(uid),
            unfollow: (uid) => this.bot.api.unfriend(uid),
            block: (uid, state = true) => this.bot.api.changeBlockedStatus(uid, state),
            blockMqtt: (uid, state = true) => this.bot.api.changeBlockedStatusMqtt(uid, state),
            handleFriend: (uid, action) => this.bot.api.handleFriendRequest(uid, action),
            handleMsg: (tid, action) => this.bot.api.handleMessageRequest(tid, action),
            
            // === Post/Story shortcuts ===
            createPost: (content, target) => this.bot.api.createPost(content, target),
            commentPost: (content, postId) => this.bot.api.createCommentPost(content, postId),
            reactPost: (postId, type) => this.bot.api.setPostReaction(postId, type),
            reactStory: (storyId, type) => this.bot.api.setStoryReaction(storyId, type),
            
            // === Utility shortcuts ===
            createGroup: (name, ids) => this.bot.api.createNewGroup(name, ids),
            createPoll: (question, options, tid) => this.bot.api.createPoll(question, options, tid),
            shareContact: (contact, tid) => this.bot.api.shareContact(contact, tid),
            shareLink: (link, tid) => this.bot.api.shareLink(link, tid),
            upload: (attachment) => this.bot.api.uploadAttachment(attachment),
            
            // === Search shortcuts ===
            searchStickers: (query) => this.bot.api.searchStickers(query),
            getMessage: (mid) => this.bot.api.getMessage(mid),
            getEmoji: (emoji) => this.bot.api.getEmojiUrl(emoji),
            resolvePhoto: (url) => this.bot.api.resolvePhotoUrl(url),
            
            // === System shortcuts ===
            logout: () => this.bot.api.logout(),
            refresh: () => this.bot.api.refreshFb_dtsg(),
            getAccess: () => this.bot.api.getAccess(),
            addModule: (module) => this.bot.api.addExternalModule(module),
            
            // === HTTP shortcuts ===
            httpGet: (url, options) => this.bot.api.httpGet(url, options),
            httpPost: (url, data, options) => this.bot.api.httpPost(url, data, options),
            httpPostForm: (url, data, options) => this.bot.api.httpPostFormData(url, data, options),
            
            // === Listen shortcuts ===
            listenMqtt: (callback) => this.bot.api.listenMqtt(callback),
            listenNotification: (callback) => this.bot.api.listenNotification(callback),
            
            // === Color utilities ===
            colors: () => this.bot.api.threadColors,
            colorHex: (colorName) => this.bot.api.threadColors[colorName] || colorName
        };
    }

    // Create comprehensive shortcuts for ultra-minimal code with full GA-FCA support
    createShortcuts() {
        return {
            // Ultra-short messaging
            $: (message, threadID, messageID) => this.bot.api.sendMessage(message, threadID, messageID),
            reply: (message, event) => this.bot.api.sendMessage(message, event.threadID, event.messageID),
            react: (emoji, messageID) => this.bot.api.setMessageReaction(emoji, messageID),

            // HTTP shortcuts
            get: async (url) => (await axios.get(url)).data,
            post: async (url, data) => (await axios.post(url, data)).data,
            stream: async (url) => (await axios({ method: 'GET', url, responseType: 'stream' })).data,

            // Group management shortcuts
            kick: (userID, threadID) => this.bot.api.removeUserFromGroup(userID, threadID),
            add: (userID, threadID) => this.bot.api.addUserToGroup(userID, threadID),
            promote: (userID, threadID) => this.bot.api.changeAdminStatus(threadID, userID, true),
            demote: (userID, threadID) => this.bot.api.changeAdminStatus(threadID, userID, false),

            // Thread management shortcuts
            setTitle: (title, threadID) => this.bot.api.setTitle(title, threadID),
            setEmoji: (emoji, threadID) => this.bot.api.changeThreadEmoji(emoji, threadID),
            setColor: (color, threadID) => this.bot.api.changeThreadColor(color, threadID),
            setNickname: (nickname, userID, threadID) => this.bot.api.changeNickname(nickname, threadID, userID),

            // Message management shortcuts
            unsend: (messageID) => this.bot.api.unsendMessage(messageID),
            markRead: (threadID) => this.bot.api.markAsRead(threadID),
            markDelivered: (threadID) => this.bot.api.markAsDelivered(threadID),

            // Utility shortcuts
            sleep: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
            random: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
            choice: (arr) => arr[Math.floor(Math.random() * arr.length)],
            time: () => new Date().toLocaleString(),
            timestamp: () => Date.now(),

            // User/Thread info shortcuts
            uid: (event) => event.senderID,
            tid: (event) => event.threadID,
            args: (event, prefix) => event.body.slice(prefix.length).trim().split(/ +/).slice(1),
            mentions: (event) => event.mentions || {},
            isAdmin: (userID) => this.bot.isAdmin(userID),
            userInfo: async (userID) => await this.bot.getUserInfo(userID),
            threadInfo: async (threadID) => await this.bot.getThreadInfo(threadID),

            // Database shortcuts
            db: this.bot.database,
            
            // GA-FCA shortcuts
            ga: this.gaFcaShortcuts
        };
    }

    // Auto-import common modules
    createAutoImports() {
        return {
            fs: require('fs'),
            path: require('path'),
            axios: require('axios'),
            util: require('util')
        };
    }

    // Load and translate cmd-v2 commands
    async loadV2Commands() {
        // Load from multiple directories
        const cmdDirectories = [
            path.join(__dirname, '..', 'modules', 'cmd-v2'),       // Simple commands
            path.join(__dirname, '..', 'modules', 'commands-v2')   // Complex commands
        ];

        // Create cmd-v2 directory if it doesn't exist
        const mainCmdPath = cmdDirectories[0];
        if (!fs.existsSync(mainCmdPath)) {
            fs.mkdirSync(mainCmdPath, { recursive: true });
            this.bot.logger.info('Created modules/cmd-v2 directory');
        }

        let totalCommands = 0;

        for (const cmdPath of cmdDirectories) {
            if (!fs.existsSync(cmdPath)) {
                this.bot.logger.debug(`CMD-V2 directory not found: ${cmdPath}`);
                continue;
            }

            const commandFiles = fs.readdirSync(cmdPath).filter(file => file.endsWith('.js'));

            for (const file of commandFiles) {
                try {
                    // Clear require cache for hot reload
                    const filePath = path.join(cmdPath, file);
                    delete require.cache[require.resolve(filePath)];

                    const v2Command = require(filePath);

                    // Validate v2 command structure
                    if (!v2Command.config || !v2Command.config.name || !v2Command.run) {
                        this.bot.logger.warn(`Invalid cmd-v2 structure in ${file}. Missing config or run function.`);
                        continue;
                    }

                    // Check for duplicate commands
                    if (this.loadedCommands.has(v2Command.config.name)) {
                        this.bot.logger.warn(`Duplicate cmd-v2 command found: ${v2Command.config.name} in ${file}. Skipping.`);
                        continue;
                    }

                    // Translate v2 command to MiraiV2 format
                    const translatedCommand = this.translateCommand(v2Command);

                    this.loadedCommands.set(v2Command.config.name, translatedCommand);
                    this.bot.logger.debug(`Loaded cmd-v2: ${v2Command.config.name}`);
                    totalCommands++;

                } catch (error) {
                    this.bot.logger.error(`Failed to load cmd-v2 ${file}:`, error.message);
                }
            }
        }

        this.bot.logger.info(`Loaded ${totalCommands} cmd-v2 commands`);
        return this.loadedCommands;
    }

    // Advanced translation with performance optimization and ultra-minimal syntax
    translateCommand(v2Command) {
        // Cache command translation for performance
        const cacheKey = `${v2Command.config.name}_${v2Command.config.version || '1.0.0'}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        const translated = {
            config: {
                name: v2Command.config.name,
                version: v2Command.config.version || "1.0.0",
                hasPermssion: v2Command.config.permission || 0,
                credits: v2Command.config.credits || "Cyber-v2",
                description: v2Command.config.description || "No description",
                commandCategory: v2Command.config.category || "general",
                usages: v2Command.config.usage || v2Command.config.name,
                cooldowns: v2Command.config.cooldown || 3,
                dependencies: v2Command.config.dependencies || {},
                prefix: v2Command.config.prefix !== undefined ? v2Command.config.prefix : true,
                aliases: v2Command.config.aliases || []
            },

            // Pass through additional methods like handleReaction
            handleReaction: v2Command.handleReaction,
            
            languages: v2Command.languages || {
                "en": {},
                "bn": {}
            },
            
            run: async function({ event, api, args, getText }) {
                const self = this;

                // Ultra-minimal context with comprehensive GA-FCA support
                const ctx = {
                    // Core data (ultra-short)
                    e: event,
                    api,
                    args,
                    getText,

                    // Ultra-short messaging
                    $: (msg, tid = event.threadID, mid = event.messageID) => api.sendMessage(msg, tid, mid),
                    reply: (msg) => api.sendMessage(msg, event.threadID, event.messageID),
                    react: (emoji, mid = event.messageID) => api.setMessageReaction(emoji, mid),
                    send: (msg, tid, mid) => api.sendMessage(msg, tid, mid),
                    edit: (msg, mid) => api.editMessage(msg, mid),
                    unsend: (mid = event.messageID) => api.unsendMessage(mid),
                    delete: (mid = event.messageID) => api.deleteMessage(mid),
                    forward: (mid, tid) => api.forwardAttachment(mid, tid),
                    typing: (tid = event.threadID, state = true) => api.sendTypingIndicator(tid, state),
                    typingV2: (tid = event.threadID, state = true) => api.sendTypingIndicatorV2(tid, state),

                    // Reply message support
                    replyMsg: event.messageReply,
                    isReply: !!event.messageReply,
                    replyID: event.messageReply?.senderID,
                    replyBody: event.messageReply?.body,
                    replyAttachments: event.messageReply?.attachments || [],

                    // Message status management
                    markRead: (tid = event.threadID) => api.markAsRead(tid),
                    markDelivered: (tid = event.threadID) => api.markAsDelivered(tid),
                    markSeen: (tid = event.threadID) => api.markAsSeen(tid),
                    markAllRead: () => api.markAsReadAll(),

                    // Ultra-short HTTP with improved error handling
                    get: async (url, opts = {}) => {
                        try {
                            const res = await axios.get(url, { timeout: 15000, ...opts });
                            return res.data;
                        } catch (e) { throw new Error(`GET ${url}: ${e.message}`); }
                    },

                    post: async (url, data, opts = {}) => {
                        try {
                            const res = await axios.post(url, data, { timeout: 15000, ...opts });
                            return res.data;
                        } catch (e) { throw new Error(`POST ${url}: ${e.message}`); }
                    },
                    
                    // Ultra-short stream and attachment support
                    stream: async (url, opts = {}) => {
                        try {
                            const res = await axios({ method: 'GET', url, responseType: 'stream', timeout: 15000, ...opts });
                            return res.data;
                        } catch (e) { throw new Error(`STREAM ${url}: ${e.message}`); }
                    },

                    // Advanced HTTP methods
                    httpGet: (url, opts) => api.httpGet(url, opts),
                    httpPost: (url, data, opts) => api.httpPost(url, data, opts),
                    httpPostForm: (url, data, opts) => api.httpPostFormData(url, data, opts),

                    // Attachment helpers
                    attach: (stream, type = 'photo') => ({ attachment: stream }),
                    photo: (stream) => ({ attachment: stream }),
                    video: (stream) => ({ attachment: stream }),
                    audio: (stream) => ({ attachment: stream }),
                    file: (stream) => ({ attachment: stream }),
                    upload: (attachment) => api.uploadAttachment(attachment),

                    // Ultra-short user (single letter shortcuts) with error recovery
                    u: {
                        id: event.senderID,
                        mentions: event.mentions || {},
                        admin: () => global.client.isAdmin(event.senderID),
                        info: async (uid = event.senderID) => {
                            try {
                                return await api.getUserInfo(uid);
                            } catch (error) {
                                if (errorRecovery.isCriticalError(error)) {
                                    errorRecovery.logCriticalError(error, `getUserInfo for user ${uid}`);
                                }
                                return { [uid]: { name: "Unknown User" } };
                            }
                        },
                        nick: (nickname, tid = event.threadID, uid = event.senderID) => api.changeNickname(nickname, tid, uid),
                        avatar: (uid = event.senderID) => api.getAvatarUser(uid),
                        uid: (name) => api.getUserID(name),
                        getUID: (name) => api.getUID(name),
                        current: () => api.getCurrentUserID(),
                        changeName: (name) => api.changeName(name),
                        changeUsername: (username) => api.changeUsername(username),
                        changeBio: (bio) => api.changeBio(bio),
                        changeAvatar: (img) => api.changeAvatar(img),
                        changeAvatarV2: (img) => api.changeAvatarV2(img),
                        changeCover: (img) => api.changeCover(img),
                        block: (uid, state = true) => api.changeBlockedStatus(uid, state),
                        blockMqtt: (uid, state = true) => api.changeBlockedStatusMqtt(uid, state),
                        follow: (uid) => api.follow(uid),
                        unfollow: (uid) => api.unfriend(uid),
                        friends: () => api.getFriendsList(),
                        handleFriend: (uid, action) => api.handleFriendRequest(uid, action)
                    },

                    // Ultra-short thread with comprehensive management
                    t: {
                        id: event.threadID,
                        info: async (tid = event.threadID) => await api.getThreadInfo(tid),
                        list: () => api.getThreadList(),
                        history: (tid = event.threadID, amount = 20) => api.getThreadHistory(tid, amount),
                        pics: (tid = event.threadID) => api.getThreadPictures(tid),
                        search: (query) => api.searchForThread(query),
                        
                        // Thread management
                        title: (newTitle, tid = event.threadID) => api.setTitle(newTitle, tid),
                        emoji: (newEmoji, tid = event.threadID) => api.changeThreadEmoji(newEmoji, tid),
                        color: (newColor, tid = event.threadID) => api.changeThreadColor(newColor, tid),
                        img: (img, tid = event.threadID) => api.changeGroupImage(img, tid),
                        
                        // Member management
                        kick: (userID, tid = event.threadID) => api.removeUserFromGroup(userID, tid),
                        add: (userID, tid = event.threadID) => api.addUserToGroup(userID, tid),
                        promote: (userID, tid = event.threadID) => api.changeAdminStatus(tid, userID, true),
                        demote: (userID, tid = event.threadID) => api.changeAdminStatus(tid, userID, false),
                        nick: (nickname, userID, tid = event.threadID) => api.changeNickname(nickname, tid, userID),
                        leave: (tid = event.threadID) => api.removeUserFromGroup(api.getCurrentUserID(), tid),
                        
                        // Thread status
                        archive: (tid = event.threadID, state = true) => api.changeArchivedStatus(tid, state),
                        mute: (tid = event.threadID, seconds) => api.muteThread(tid, seconds),
                        delete: (tid = event.threadID) => api.deleteThread(tid),
                        
                        // Message management
                        pin: (mid, action = true) => api.pinMessage(mid, action),
                        handleMsg: (tid, action) => api.handleMessageRequest(tid, action),
                        
                        // Create new
                        create: (name, ids) => api.createNewGroup(name, ids),
                        poll: (question, options, tid = event.threadID) => api.createPoll(question, options, tid)
                    },

                    // Group management shortcuts
                    gc: {
                        kick: (userID, tid = event.threadID) => api.removeUserFromGroup(userID, tid),
                        add: (userID, tid = event.threadID) => api.addUserToGroup(userID, tid),
                        promote: (userID, tid = event.threadID) => api.changeAdminStatus(tid, userID, true),
                        demote: (userID, tid = event.threadID) => api.changeAdminStatus(tid, userID, false),
                        title: (title, tid = event.threadID) => api.setTitle(title, tid),
                        emoji: (emoji, tid = event.threadID) => api.changeThreadEmoji(emoji, tid),
                        color: (color, tid = event.threadID) => api.changeThreadColor(color, tid),
                        img: (img, tid = event.threadID) => api.changeGroupImage(img, tid),
                        nick: (nickname, userID, tid = event.threadID) => api.changeNickname(nickname, tid, userID),
                        leave: (tid = event.threadID) => api.removeUserFromGroup(api.getCurrentUserID(), tid),
                        info: async (tid = event.threadID) => await api.getThreadInfo(tid),
                        create: (name, ids) => api.createNewGroup(name, ids),
                        poll: (question, options, tid = event.threadID) => api.createPoll(question, options, tid)
                    },

                    // Message utilities
                    m: {
                        get: (mid) => api.getMessage(mid),
                        react: (emoji, mid = event.messageID) => api.setMessageReaction(emoji, mid),
                        unsend: (mid = event.messageID) => api.unsendMessage(mid),
                        delete: (mid = event.messageID) => api.deleteMessage(mid),
                        edit: (msg, mid) => api.editMessage(msg, mid),
                        forward: (mid, tid) => api.forwardAttachment(mid, tid),
                        pin: (mid, action = true) => api.pinMessage(mid, action)
                    },

                    // Post/Story utilities
                    p: {
                        create: (content, target) => api.createPost(content, target),
                        comment: (content, postId) => api.createCommentPost(content, postId),
                        react: (postId, type) => api.setPostReaction(postId, type),
                        storyReact: (storyId, type) => api.setStoryReaction(storyId, type)
                    },

                    // Search utilities
                    s: {
                        thread: (query) => api.searchForThread(query),
                        stickers: (query) => api.searchStickers(query),
                        emoji: (emoji) => api.getEmojiUrl(emoji)
                    },

                    // Share utilities
                    share: {
                        contact: (contact, tid = event.threadID) => api.shareContact(contact, tid),
                        link: (link, tid = event.threadID) => api.shareLink(link, tid)
                    },
                    
                    // Ultra-minimal utilities with comprehensive features
                    _: {
                        // File operations
                        read: (p) => fs.readFileSync(p, 'utf8'),
                        write: (p, d) => fs.writeFileSync(p, d, 'utf8'),
                        exists: (p) => fs.existsSync(p),
                        delete: (p) => fs.unlinkSync(p),
                        mkdir: (p) => fs.mkdirSync(p, { recursive: true }),

                        // Random utilities
                        rand: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
                        pick: (arr) => arr[Math.floor(Math.random() * arr.length)],
                        shuffle: (arr) => arr.sort(() => Math.random() - 0.5),
                        uuid: () => Math.random().toString(36).substr(2, 9),

                        // Async utilities
                        sleep: (ms) => new Promise(r => setTimeout(r, ms)),
                        delay: (ms) => new Promise(r => setTimeout(r, ms)),
                        timeout: (promise, ms) => Promise.race([promise, new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms))]),

                        // Text utilities
                        cap: (s) => s.charAt(0).toUpperCase() + s.slice(1),
                        cut: (s, l) => s.length > l ? s.substring(0, l) + '...' : s,
                        clean: (s) => s.replace(/[^\w\s]/gi, ''),
                        escape: (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),

                        // Time utilities
                        now: () => Date.now(),
                        time: () => new Date().toLocaleString(),
                        date: () => new Date().toDateString(),
                        iso: () => new Date().toISOString(),

                        // Data utilities
                        json: (obj) => JSON.stringify(obj),
                        parse: (str) => JSON.parse(str),
                        clone: (obj) => JSON.parse(JSON.stringify(obj)),
                        merge: (obj1, obj2) => ({ ...obj1, ...obj2 }),

                        // Array utilities
                        chunk: (arr, size) => Array.from({ length: Math.ceil(arr.length / size) }, (v, i) => arr.slice(i * size, i * size + size)),
                        unique: (arr) => [...new Set(arr)],
                        flatten: (arr) => arr.flat(Infinity),

                        // Validation utilities
                        isUrl: (str) => /^https?:\/\//.test(str),
                        isEmail: (str) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str),
                        isNumber: (str) => !isNaN(str) && !isNaN(parseFloat(str)),
                        isEmpty: (val) => val == null || val === '' || (Array.isArray(val) && val.length === 0),
                        
                        // String utilities
                        capitalize: (str) => str.charAt(0).toUpperCase() + str.slice(1),
                        trim: (str) => str.trim(),
                        split: (str, sep) => str.split(sep),
                        join: (arr, sep) => arr.join(sep),
                        
                        // Array utilities
                        shuffle: (arr) => arr.sort(() => Math.random() - 0.5),
                        unique: (arr) => [...new Set(arr)],
                        chunk: (arr, size) => {
                            const chunks = [];
                            for (let i = 0; i < arr.length; i += size) {
                                chunks.push(arr.slice(i, i + size));
                            }
                            return chunks;
                        },
                        
                        // Object utilities
                        keys: (obj) => Object.keys(obj),
                        values: (obj) => Object.values(obj),
                        entries: (obj) => Object.entries(obj),
                        
                        // Sleep utility
                        sleep: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
                        
                        // Log utilities
                        log: (...args) => console.log(...args),
                        error: (...args) => console.error(...args),
                        warn: (...args) => console.warn(...args),
                        
                        // JSON utilities
                        json: (obj) => JSON.stringify(obj, null, 2),
                        parse: (str) => JSON.parse(str),
                        
                        // URL utilities
                        url: (base, params) => {
                            const url = new URL(base);
                            Object.entries(params || {}).forEach(([key, value]) => {
                                url.searchParams.append(key, value);
                            });
                            return url.toString();
                        },
                        
                        // Color utilities
                        colors: api.threadColors || {},
                        color: (name) => api.threadColors?.[name] || name,
                        
                        // Resolve utilities
                        resolve: (url) => api.resolvePhotoUrl(url)
                    },
                    
                    // Ultra-minimal bot (single letter)
                    b: {
                        name: global.client.config.botName,
                        prefix: global.client.config.prefix,
                        owner: global.client.config.botOwner,
                        up: () => global.client.getUptime(),
                        stats: global.client.stats
                    },

                    // Ultra-minimal database (single letter)
                    d: {
                        u: {
                            get: (id) => global.client.database.getUser(id),
                            set: (id, data) => global.client.database.updateUser(id, data),
                            exp: (id, exp) => global.client.database.addUserExp(id, exp),
                            money: (id, amt) => global.client.database.addUserMoney(id, amt)
                        },
                        t: {
                            get: (id) => global.client.database.getThread(id),
                            set: (id, data) => global.client.database.updateThread(id, data)
                        }
                    },

                    // Advanced API features
                    api: {
                        ...api,
                        // Enhanced messaging
                        sendTyping: (tid = event.threadID) => api.sendTypingIndicator(tid),
                        stopTyping: (tid = event.threadID) => api.sendTypingIndicator(tid, () => {}),

                        // User management
                        getUserInfo: (uid) => api.getUserInfo(uid),
                        getThreadInfo: (tid) => api.getThreadInfo(tid),
                        getFriendsList: () => api.getFriendsList(),

                        // Message operations
                        forwardMessage: (mid, tid) => api.forwardMessage(mid, tid),
                        searchForThread: (name) => api.getThreadList(100, null, ['INBOX']).then(threads =>
                            threads.filter(t => t.name.toLowerCase().includes(name.toLowerCase()))),

                        // Advanced features
                        createPoll: (title, options, tid = event.threadID) => api.createPoll(title, options, tid),
                        setMessageReaction: (reaction, mid, callback) => api.setMessageReaction(reaction, mid, callback),
                        getCurrentUserID: () => api.getCurrentUserID(),

                        // Bulk operations
                        bulkSend: async (messages, threadIDs) => {
                            const results = [];
                            for (const tid of threadIDs) {
                                for (const msg of messages) {
                                    results.push(await api.sendMessage(msg, tid));
                                }
                            }
                            return results;
                        }
                    },

                    // Event data shortcuts
                    event: {
                        ...event,
                        isGroup: event.isGroup,
                        attachments: event.attachments || [],
                        hasAttachments: !!(event.attachments && event.attachments.length > 0),
                        mentions: event.mentions || {},
                        hasMentions: !!(event.mentions && Object.keys(event.mentions).length > 0),
                        isReply: !!event.messageReply,
                        replyTo: event.messageReply,
                        timestamp: event.timestamp || Date.now(),
                        type: event.type || 'message'
                    },

                    // Database shortcuts
                    db: global.client.database,
                    
                    // Language utilities
                    lang: getText,
                    
                    // System utilities
                    sys: {
                        logout: () => api.logout(),
                        refresh: () => api.refreshFb_dtsg(),
                        access: () => api.getAccess(),
                        listen: (callback) => api.listenMqtt(callback),
                        notification: (callback) => api.listenNotification(callback),
                        module: (module) => api.addExternalModule(module)
                    },

                    // Auto-imports for convenience
                    fs: require('fs'),
                    path: require('path'),
                    axios: require('axios'),
                    util: require('util'),
                    crypto: require('crypto'),
                    
                    // Utility functions
                    utils: global.utils || {},

                    // Global utilities
                    console,
                    setTimeout,
                    setInterval,
                    clearTimeout,
                    clearInterval,
                    Buffer,
                    process: {
                        env: process.env,
                        cwd: process.cwd,
                        platform: process.platform
                    }
                };

                // Execute with error handling and performance monitoring
                try {
                    const startTime = Date.now();
                    const result = await v2Command.run(ctx);
                    const execTime = Date.now() - startTime;

                    // Track slow commands for optimization
                    if (execTime > 1000) {
                        global.client.logger.warn(`Slow cmd-v2 execution: ${v2Command.config.name} took ${execTime}ms`);

                        // Store slow command info for performance monitoring
                        if (!global.client.slowCommands) {
                            global.client.slowCommands = [];
                        }

                        // Add to slow commands list (keep last 10)
                        global.client.slowCommands.unshift({
                            name: v2Command.config.name,
                            time: execTime,
                            timestamp: Date.now()
                        });

                        // Keep only last 10 slow commands
                        if (global.client.slowCommands.length > 10) {
                            global.client.slowCommands = global.client.slowCommands.slice(0, 10);
                        }
                    }

                    // Update stats
                    if (!global.client.stats) {
                        global.client.stats = { commandsExecuted: 0, totalResponseTime: 0 };
                    }
                    global.client.stats.commandsExecuted++;
                    global.client.stats.totalResponseTime += execTime;
                    global.client.stats.averageResponseTime = Math.round(
                        global.client.stats.totalResponseTime / global.client.stats.commandsExecuted
                    );

                    return result;
                } catch (error) {
                    global.client.logger.error(`CMD-V2 Error in ${v2Command.config.name}:`, error.message);

                    // Log critical errors for auto-restart
                    if (errorRecovery.isCriticalError(error)) {
                        errorRecovery.logCriticalError(error, `CMD-V2 command: ${v2Command.config.name}`);
                    }

                    return ctx.reply(`❌ Command error: ${error.message}`);
                }
            }
        };

        // Cache the translated command
        this.cache.set(cacheKey, translated);
        return translated;
    }

    // Get translated command with caching
    getCommand(name) {
        return this.loadedCommands.get(name);
    }

    // Get all translated commands
    getAllCommands() {
        return this.loadedCommands;
    }

    // Clear cache for hot reload
    clearCache() {
        this.cache.clear();
        this.bot.logger.debug('CMD-V2 cache cleared');
    }

    // Get cache statistics
    getCacheStats() {
        return {
            size: this.cache.size,
            commands: this.loadedCommands.size,
            hitRate: this.cache.size > 0 ? (this.cache.size / this.loadedCommands.size * 100).toFixed(2) + '%' : '0%'
        };
    }

    // Optimize performance by preloading common operations
    optimize() {
        // Pre-warm axios
        axios.defaults.timeout = 10000;
        axios.defaults.headers.common['User-Agent'] = 'Cyber-v2-Bot/2.0.0';

        // Pre-compile common regex patterns
        this.patterns = {
            mention: /@\[(\d+):([^\]]+)\]/g,
            url: /https?:\/\/[^\s]+/g,
            emoji: /[\u{1f300}-\u{1f5ff}\u{1f900}-\u{1f9ff}\u{1f600}-\u{1f64f}\u{1f680}-\u{1f6ff}\u{2600}-\u{26ff}\u{2700}-\u{27bf}\u{1f1e6}-\u{1f1ff}\u{1f191}-\u{1f251}\u{1f004}\u{1f0cf}\u{1f170}-\u{1f171}\u{1f17e}-\u{1f17f}\u{1f18e}\u{3030}\u{2b50}\u{2b55}\u{2934}-\u{2935}\u{2b05}-\u{2b07}\u{2b1b}-\u{2b1c}\u{3297}\u{3299}\u{303d}\u{00a9}\u{00ae}\u{2122}\u{23f3}\u{24c2}\u{23e9}-\u{23ef}\u{25b6}\u{23f8}-\u{23fa}]/gu
        };

        this.bot.logger.info('CMD-V2 translator optimized');
    }
}

module.exports = AdvancedCommandTranslator;
