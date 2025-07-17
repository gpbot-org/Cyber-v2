const fs = require('fs');
const path = require('path');

class Logger {
    constructor(config) {
        this.config = config;
        this.logPath = path.resolve(config.logPath);
        this.levels = {
            error: 0,
            warn: 1,
            info: 2,
            debug: 3
        };
        
        this.colors = {
            error: '\x1b[31m',
            warn: '\x1b[33m',
            info: '\x1b[36m',
            debug: '\x1b[37m',
            reset: '\x1b[0m'
        };
        
        if (config.enabled && config.logToFile) {
            this.ensureLogDirectory();
            this.setupLogRotation();
        }
    }
    
    ensureLogDirectory() {
        if (!fs.existsSync(this.logPath)) {
            fs.mkdirSync(this.logPath, { recursive: true });
        }
    }
    
    setupLogRotation() {
        // Clean old logs if needed
        try {
            const logFiles = fs.readdirSync(this.logPath)
                .filter(file => file.endsWith('.log'))
                .map(file => ({
                    name: file,
                    path: path.join(this.logPath, file),
                    stats: fs.statSync(path.join(this.logPath, file))
                }))
                .sort((a, b) => b.stats.mtime - a.stats.mtime);
            
            // Remove excess log files
            if (logFiles.length > this.config.maxLogFiles) {
                for (let i = this.config.maxLogFiles; i < logFiles.length; i++) {
                    fs.unlinkSync(logFiles[i].path);
                }
            }
        } catch (error) {
            console.error('Log rotation error:', error.message);
        }
    }
    
    getCurrentLogFile() {
        const date = new Date().toISOString().split('T')[0];
        return path.join(this.logPath, `bot-${date}.log`);
    }
    
    formatMessage(level, message, ...args) {
        const timestamp = new Date().toISOString();
        const formattedArgs = args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ');
        
        const fullMessage = formattedArgs ? `${message} ${formattedArgs}` : message;
        return `[${timestamp}] [${level.toUpperCase()}] ${fullMessage}`;
    }
    
    log(level, message, ...args) {
        if (!this.config.enabled) {
            return;
        }
        
        const formattedMessage = this.formatMessage(level, message, ...args);
        
        // Console output with colors
        const color = this.colors[level] || this.colors.reset;
        console.log(`${color}${formattedMessage}${this.colors.reset}`);
        
        // File output
        if (this.config.logToFile) {
            try {
                const logFile = this.getCurrentLogFile();
                fs.appendFileSync(logFile, formattedMessage + '\n');
                
                // Check file size and rotate if needed
                this.checkLogRotation(logFile);
            } catch (error) {
                console.error('File logging error:', error.message);
            }
        }
    }
    
    checkLogRotation(logFile) {
        try {
            const stats = fs.statSync(logFile);
            const maxSize = this.parseSize(this.config.maxLogSize);
            
            if (stats.size > maxSize) {
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const rotatedFile = logFile.replace('.log', `-${timestamp}.log`);
                
                fs.renameSync(logFile, rotatedFile);
                this.setupLogRotation();
            }
        } catch (error) {
            console.error('Log rotation check error:', error.message);
        }
    }
    
    parseSize(sizeStr) {
        const units = {
            'B': 1,
            'KB': 1024,
            'MB': 1024 * 1024,
            'GB': 1024 * 1024 * 1024
        };
        
        const match = sizeStr.match(/^(\d+)([A-Z]+)$/);
        if (!match) {
            return 10 * 1024 * 1024; // Default 10MB
        }
        
        const [, size, unit] = match;
        return parseInt(size) * (units[unit] || 1);
    }
    
    error(message, ...args) {
        this.log('error', message, ...args);
    }
    
    warn(message, ...args) {
        this.log('warn', message, ...args);
    }
    
    info(message, ...args) {
        this.log('info', message, ...args);
    }
    
    debug(message, ...args) {
        this.log('debug', message, ...args);
    }
    
    // Command logging
    logCommand(userID, userName, threadID, threadName, command, args) {
        this.info(`Command executed: ${command} by ${userName} (${userID}) in ${threadName} (${threadID}) with args: [${args.join(', ')}]`);
    }
    
    // Event logging
    logEvent(eventType, threadID, threadName, details = '') {
        this.info(`Event: ${eventType} in ${threadName} (${threadID}) ${details}`);
    }
    
    // Error logging with stack trace
    logError(error, context = '') {
        const contextStr = context ? `[${context}] ` : '';
        this.error(`${contextStr}${error.message}`);
        
        if (error.stack) {
            this.error(`Stack trace:\n${error.stack}`);
        }
    }
    
    // Performance logging
    logPerformance(operation, duration, details = '') {
        const detailsStr = details ? ` - ${details}` : '';
        this.debug(`Performance: ${operation} took ${duration}ms${detailsStr}`);
    }
    
    // API logging
    logAPI(method, endpoint, status, duration) {
        this.debug(`API: ${method} ${endpoint} - ${status} (${duration}ms)`);
    }
    
    // Security logging
    logSecurity(event, userID, threadID, details = '') {
        this.warn(`Security: ${event} - User: ${userID}, Thread: ${threadID} - ${details}`);
    }
    
    // Database logging
    logDatabase(operation, table, recordId, details = '') {
        this.debug(`Database: ${operation} on ${table}${recordId ? ` (${recordId})` : ''} - ${details}`);
    }
    
    // Get recent logs
    getRecentLogs(lines = 100) {
        try {
            const logFile = this.getCurrentLogFile();
            if (!fs.existsSync(logFile)) {
                return [];
            }
            
            const content = fs.readFileSync(logFile, 'utf8');
            const logLines = content.split('\n').filter(line => line.trim());
            
            return logLines.slice(-lines);
        } catch (error) {
            this.error('Error reading recent logs:', error.message);
            return [];
        }
    }
    
    // Search logs
    searchLogs(query, maxResults = 50) {
        try {
            const logFile = this.getCurrentLogFile();
            if (!fs.existsSync(logFile)) {
                return [];
            }
            
            const content = fs.readFileSync(logFile, 'utf8');
            const logLines = content.split('\n').filter(line => 
                line.trim() && line.toLowerCase().includes(query.toLowerCase())
            );
            
            return logLines.slice(-maxResults);
        } catch (error) {
            this.error('Error searching logs:', error.message);
            return [];
        }
    }
    
    // Clear logs
    clearLogs() {
        try {
            const logFiles = fs.readdirSync(this.logPath)
                .filter(file => file.endsWith('.log'));
            
            for (const file of logFiles) {
                fs.unlinkSync(path.join(this.logPath, file));
            }
            
            this.info('All logs cleared');
            return true;
        } catch (error) {
            this.error('Error clearing logs:', error.message);
            return false;
        }
    }
}

module.exports = Logger;
