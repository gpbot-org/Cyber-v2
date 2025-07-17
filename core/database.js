const fs = require('fs');
const path = require('path');

class Database {
    constructor(config) {
        this.config = config;
        this.dataPath = path.resolve(config.path);
        this.data = {
            users: {},
            threads: {},
            global: {}
        };
        
        this.ensureDataDirectory();
        this.load();
    }
    
    ensureDataDirectory() {
        if (!fs.existsSync(this.dataPath)) {
            fs.mkdirSync(this.dataPath, { recursive: true });
        }
    }
    
    load() {
        try {
            const files = ['users.json', 'threads.json', 'global.json'];
            
            for (const file of files) {
                const filePath = path.join(this.dataPath, file);
                const key = path.basename(file, '.json');
                
                if (fs.existsSync(filePath)) {
                    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                    this.data[key] = data;
                } else {
                    this.data[key] = key === 'global' ? {} : {};
                    this.save(key);
                }
            }
            
            console.log('✅ Database loaded successfully');
        } catch (error) {
            console.error('❌ Database load error:', error.message);
            this.createBackup();
            this.reset();
        }
    }
    
    save(type = null) {
        try {
            if (type) {
                const filePath = path.join(this.dataPath, `${type}.json`);
                fs.writeFileSync(filePath, JSON.stringify(this.data[type], null, 2));
            } else {
                // Save all
                for (const [key, data] of Object.entries(this.data)) {
                    const filePath = path.join(this.dataPath, `${key}.json`);
                    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
                }
            }
        } catch (error) {
            console.error('❌ Database save error:', error.message);
        }
    }
    
    // User data methods
    getUser(userID) {
        if (!this.data.users[userID]) {
            this.data.users[userID] = {
                id: userID,
                name: '',
                exp: 0,
                level: 1,
                money: 0,
                lastActive: Date.now(),
                commandCount: 0,
                banned: false,
                warnings: 0,
                data: {}
            };
            this.save('users');
        }
        return this.data.users[userID];
    }
    
    setUser(userID, userData) {
        this.data.users[userID] = { ...this.getUser(userID), ...userData };
        this.save('users');
    }
    
    updateUser(userID, updates) {
        const user = this.getUser(userID);
        Object.assign(user, updates);
        this.save('users');
        return user;
    }
    
    deleteUser(userID) {
        delete this.data.users[userID];
        this.save('users');
    }
    
    getAllUsers() {
        return this.data.users;
    }
    
    // Thread data methods
    getThread(threadID) {
        if (!this.data.threads[threadID]) {
            this.data.threads[threadID] = {
                id: threadID,
                name: '',
                messageCount: 0,
                lastActive: Date.now(),
                settings: {
                    welcome: true,
                    goodbye: true,
                    antiSpam: true,
                    language: 'en'
                },
                data: {}
            };
            this.save('threads');
        }
        return this.data.threads[threadID];
    }
    
    setThread(threadID, threadData) {
        this.data.threads[threadID] = { ...this.getThread(threadID), ...threadData };
        this.save('threads');
    }
    
    updateThread(threadID, updates) {
        const thread = this.getThread(threadID);
        Object.assign(thread, updates);
        this.save('threads');
        return thread;
    }
    
    deleteThread(threadID) {
        delete this.data.threads[threadID];
        this.save('threads');
    }
    
    getAllThreads() {
        return this.data.threads;
    }
    
    // Global data methods
    getGlobal(key, defaultValue = null) {
        return this.data.global[key] !== undefined ? this.data.global[key] : defaultValue;
    }
    
    setGlobal(key, value) {
        this.data.global[key] = value;
        this.save('global');
    }
    
    deleteGlobal(key) {
        delete this.data.global[key];
        this.save('global');
    }
    
    // Statistics methods
    incrementUserCommand(userID) {
        const user = this.getUser(userID);
        user.commandCount++;
        user.lastActive = Date.now();
        this.save('users');
    }
    
    incrementThreadMessage(threadID) {
        const thread = this.getThread(threadID);
        thread.messageCount++;
        thread.lastActive = Date.now();
        this.save('threads');
    }
    
    addUserExp(userID, exp) {
        const user = this.getUser(userID);
        user.exp += exp;
        
        // Level up calculation
        const newLevel = Math.floor(user.exp / 100) + 1;
        if (newLevel > user.level) {
            user.level = newLevel;
            this.save('users');
            return { levelUp: true, newLevel };
        }
        
        this.save('users');
        return { levelUp: false, newLevel: user.level };
    }
    
    addUserMoney(userID, amount) {
        const user = this.getUser(userID);
        user.money += amount;
        this.save('users');
        return user.money;
    }
    
    // Search methods
    findUserByName(name) {
        const users = Object.values(this.data.users);
        return users.find(user => user.name.toLowerCase().includes(name.toLowerCase()));
    }
    
    findThreadByName(name) {
        const threads = Object.values(this.data.threads);
        return threads.find(thread => thread.name.toLowerCase().includes(name.toLowerCase()));
    }
    
    // Top users methods
    getTopUsers(type = 'exp', limit = 10) {
        const users = Object.values(this.data.users);
        return users
            .sort((a, b) => (b[type] || 0) - (a[type] || 0))
            .slice(0, limit);
    }
    
    getTopThreads(type = 'messageCount', limit = 10) {
        const threads = Object.values(this.data.threads);
        return threads
            .sort((a, b) => (b[type] || 0) - (a[type] || 0))
            .slice(0, limit);
    }
    
    // Backup and restore methods
    createBackup() {
        try {
            const backupPath = path.join(this.dataPath, 'backups');
            if (!fs.existsSync(backupPath)) {
                fs.mkdirSync(backupPath, { recursive: true });
            }
            
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupFile = path.join(backupPath, `backup-${timestamp}.json`);
            
            fs.writeFileSync(backupFile, JSON.stringify(this.data, null, 2));
            console.log(`✅ Database backup created: ${backupFile}`);
            
            // Clean old backups (keep last 5)
            const backupFiles = fs.readdirSync(backupPath)
                .filter(file => file.startsWith('backup-'))
                .sort()
                .reverse();
            
            if (backupFiles.length > 5) {
                for (let i = 5; i < backupFiles.length; i++) {
                    fs.unlinkSync(path.join(backupPath, backupFiles[i]));
                }
            }
            
        } catch (error) {
            console.error('❌ Backup creation error:', error.message);
        }
    }
    
    reset() {
        this.data = {
            users: {},
            threads: {},
            global: {}
        };
        this.save();
        console.log('✅ Database reset completed');
    }
    
    // Cleanup methods
    cleanupInactiveUsers(days = 30) {
        const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
        let cleaned = 0;
        
        for (const [userID, user] of Object.entries(this.data.users)) {
            if (user.lastActive < cutoff) {
                delete this.data.users[userID];
                cleaned++;
            }
        }
        
        if (cleaned > 0) {
            this.save('users');
            console.log(`✅ Cleaned ${cleaned} inactive users`);
        }
        
        return cleaned;
    }
    
    cleanupInactiveThreads(days = 60) {
        const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
        let cleaned = 0;
        
        for (const [threadID, thread] of Object.entries(this.data.threads)) {
            if (thread.lastActive < cutoff) {
                delete this.data.threads[threadID];
                cleaned++;
            }
        }
        
        if (cleaned > 0) {
            this.save('threads');
            console.log(`✅ Cleaned ${cleaned} inactive threads`);
        }
        
        return cleaned;
    }
}

module.exports = Database;
