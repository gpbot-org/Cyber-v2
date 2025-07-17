const fs = require('fs');
const path = require('path');
const GABot = require('./core/bot');

// ASCII Art Banner
const banner = `
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   ██████╗██╗   ██╗██████╗ ███████╗██████╗       ██╗   ██╗██████╗ ║
║  ██╔════╝╚██╗ ██╔╝██╔══██╗██╔════╝██╔══██╗      ██║   ██║╚════██╗║
║  ██║      ╚████╔╝ ██████╔╝█████╗  ██████╔╝█████╗██║   ██║ █████╔╝║
║  ██║       ╚██╔╝  ██╔══██╗██╔══╝  ██╔══██╗╚════╝╚██╗ ██╔╝██╔═══╝ ║
║  ╚██████╗   ██║   ██████╔╝███████╗██║  ██║       ╚████╔╝ ███████╗║
║   ╚═════╝   ╚═╝   ╚═════╝ ╚══════╝╚═╝  ╚═╝        ╚═══╝  ╚══════╝║
║                                                               ║
║              Facebook Chat Bot by Grandpa Academy            ║
║                     Version 2.0.0                            ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
`;

class BotManager {
    constructor() {
        this.bot = null;
        this.config = null;
        this.restartCount = 0;
        this.maxRestarts = 5;
        this.restartDelay = 5000; // 5 seconds
    }
    
    async start() {
        console.log(banner);
        console.log('🚀 Starting Cyber-v2 Bot...\n');
        
        try {
            // Load configuration
            await this.loadConfig();
            
            // Validate configuration
            this.validateConfig();
            
            // Create directories
            this.createDirectories();
            
            // Initialize and start bot
            this.bot = new GABot(this.config);
            await this.bot.start();
            
            // Setup restart handler
            this.setupRestartHandler();
            
            console.log('✅ Cyber-v2 Bot is now running!');
            console.log(`📝 Prefix: ${this.config.prefix}`);
            console.log(`🌐 Language: ${this.config.language}`);
            console.log(`👑 Owner: ${this.config.botOwner}`);
            console.log('\n📊 Bot Statistics will be shown here...\n');
            
            // Show periodic statistics
            this.showPeriodicStats();
            
        } catch (error) {
            console.error('❌ Failed to start bot:', error.message);
            
            if (this.config && this.config.autoRestart && this.restartCount < this.maxRestarts) {
                console.log(`🔄 Attempting restart ${this.restartCount + 1}/${this.maxRestarts} in ${this.restartDelay/1000} seconds...`);
                setTimeout(() => this.restart(), this.restartDelay);
            } else {
                console.log('💀 Bot startup failed. Exiting...');
                process.exit(1);
            }
        }
    }
    
    async loadConfig() {
        const configPath = path.join(__dirname, 'config.json');
        
        if (!fs.existsSync(configPath)) {
            throw new Error('config.json not found. Please create it first.');
        }
        
        try {
            const configData = fs.readFileSync(configPath, 'utf8');
            this.config = JSON.parse(configData);
            console.log('✅ Configuration loaded');
        } catch (error) {
            throw new Error(`Failed to load config.json: ${error.message}`);
        }
    }
    
    validateConfig() {
        const required = [
            'botName',
            'botOwner', 
            'prefix',
            'language',
            'facebook',
            'admins'
        ];
        
        for (const field of required) {
            if (!this.config[field]) {
                throw new Error(`Missing required config field: ${field}`);
            }
        }
        
        // Validate Facebook config
        if (!this.config.facebook.appStatePath) {
            throw new Error('Facebook appStatePath is required');
        }
        
        // Check if appstate file exists
        const appStatePath = path.resolve(this.config.facebook.appStatePath);
        if (!fs.existsSync(appStatePath)) {
            console.warn('⚠️  AppState file not found. You may need to login first.');
        }
        
        console.log('✅ Configuration validated');
    }
    
    createDirectories() {
        const dirs = [
            this.config.database.path,
            this.config.logs.logPath,
            'assets/temp'
        ];
        
        for (const dir of dirs) {
            const dirPath = path.resolve(dir);
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
            }
        }
        
        console.log('✅ Directories created');
    }
    
    setupRestartHandler() {
        // Handle graceful shutdown
        process.on('SIGINT', () => {
            console.log('\n🛑 Received SIGINT. Shutting down gracefully...');
            this.shutdown();
        });
        
        process.on('SIGTERM', () => {
            console.log('\n🛑 Received SIGTERM. Shutting down gracefully...');
            this.shutdown();
        });
        
        // Handle uncaught exceptions
        process.on('uncaughtException', (error) => {
            console.error('💥 Uncaught Exception:', error);
            
            if (this.config.autoRestart && this.restartCount < this.maxRestarts) {
                this.restart();
            } else {
                this.shutdown();
            }
        });
        
        process.on('unhandledRejection', (reason, promise) => {
            console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
        });
    }
    
    async restart() {
        this.restartCount++;
        console.log(`🔄 Restarting bot (attempt ${this.restartCount}/${this.maxRestarts})...`);
        
        if (this.bot) {
            try {
                this.bot.stop();
            } catch (error) {
                console.error('Error stopping bot:', error.message);
            }
        }
        
        // Wait a bit before restarting
        setTimeout(async () => {
            try {
                await this.start();
                this.restartCount = 0; // Reset counter on successful restart
            } catch (error) {
                console.error('Restart failed:', error.message);
                
                if (this.restartCount < this.maxRestarts) {
                    setTimeout(() => this.restart(), this.restartDelay);
                } else {
                    console.log('💀 Max restart attempts reached. Exiting...');
                    process.exit(1);
                }
            }
        }, 2000);
    }
    
    shutdown() {
        console.log('🛑 Shutting down bot...');
        
        if (this.bot) {
            try {
                this.bot.stop();
            } catch (error) {
                console.error('Error during shutdown:', error.message);
            }
        }
        
        console.log('👋 Goodbye!');
        process.exit(0);
    }
    
    showPeriodicStats() {
        setInterval(() => {
            if (this.bot && this.bot.isReady) {
                const uptime = this.bot.getUptime();
                const stats = this.bot.stats;
                
                console.log(`📊 [${new Date().toLocaleTimeString()}] Uptime: ${this.formatTime(uptime)} | Messages: ${stats.messagesReceived} | Commands: ${stats.commandsExecuted} | Errors: ${stats.errors}`);
            }
        }, 300000); // Every 5 minutes
    }
    
    formatTime(seconds) {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        let parts = [];
        if (days > 0) parts.push(`${days}d`);
        if (hours > 0) parts.push(`${hours}h`);
        if (minutes > 0) parts.push(`${minutes}m`);
        if (secs > 0) parts.push(`${secs}s`);
        
        return parts.join(' ') || '0s';
    }
}

// Start the bot
const botManager = new BotManager();
botManager.start().catch(error => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
});
