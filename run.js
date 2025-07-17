#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

class BotRunner {
    constructor() {
        this.botProcess = null;
        this.isRunning = false;
        this.restartCount = 0;
        this.maxRestarts = 10;
        this.restartDelay = 3000;
        this.logFile = path.join(__dirname, 'logs', 'runner.log');
        
        this.ensureLogDirectory();
        this.setupSignalHandlers();
    }
    
    ensureLogDirectory() {
        const logDir = path.dirname(this.logFile);
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
    }
    
    log(message) {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] ${message}`;
        
        console.log(logMessage);
        
        try {
            fs.appendFileSync(this.logFile, logMessage + '\n');
        } catch (error) {
            console.error('Failed to write to log file:', error.message);
        }
    }
    
    async start() {
        this.log('🚀 GA Bot Runner starting...');
        
        // Check if main.js exists
        const mainPath = path.join(__dirname, 'main.js');
        if (!fs.existsSync(mainPath)) {
            this.log('❌ main.js not found!');
            process.exit(1);
        }
        
        // Check if config.json exists
        const configPath = path.join(__dirname, 'config.json');
        if (!fs.existsSync(configPath)) {
            this.log('❌ config.json not found! Please create it first.');
            process.exit(1);
        }
        
        this.startBot();
    }
    
    startBot() {
        if (this.isRunning) {
            this.log('⚠️  Bot is already running');
            return;
        }
        
        this.log(`🔄 Starting bot process (attempt ${this.restartCount + 1}/${this.maxRestarts + 1})...`);
        
        // Spawn the bot process
        this.botProcess = spawn('node', ['main.js'], {
            cwd: __dirname,
            stdio: ['inherit', 'inherit', 'inherit'],
            env: { ...process.env, NODE_ENV: 'production' }
        });
        
        this.isRunning = true;
        
        // Handle bot process events
        this.botProcess.on('spawn', () => {
            this.log('✅ Bot process spawned successfully');
        });
        
        this.botProcess.on('exit', (code, signal) => {
            this.isRunning = false;
            
            if (signal) {
                this.log(`🛑 Bot process killed with signal: ${signal}`);
            } else {
                this.log(`🔚 Bot process exited with code: ${code}`);
            }
            
            // Handle restart logic
            if (code !== 0 && this.restartCount < this.maxRestarts) {
                this.restartCount++;
                this.log(`🔄 Scheduling restart in ${this.restartDelay/1000} seconds...`);
                
                setTimeout(() => {
                    this.startBot();
                }, this.restartDelay);
            } else if (this.restartCount >= this.maxRestarts) {
                this.log('💀 Maximum restart attempts reached. Stopping runner.');
                process.exit(1);
            } else {
                this.log('✅ Bot exited normally');
                process.exit(0);
            }
        });
        
        this.botProcess.on('error', (error) => {
            this.log(`❌ Bot process error: ${error.message}`);
            this.isRunning = false;
        });
        
        // Reset restart count on successful run (after 5 minutes)
        setTimeout(() => {
            if (this.isRunning) {
                this.restartCount = 0;
                this.log('✅ Bot running stable, reset restart counter');
            }
        }, 300000); // 5 minutes
    }
    
    stopBot() {
        if (!this.isRunning || !this.botProcess) {
            this.log('⚠️  Bot is not running');
            return;
        }
        
        this.log('🛑 Stopping bot process...');
        
        // Try graceful shutdown first
        this.botProcess.kill('SIGTERM');
        
        // Force kill after 10 seconds if still running
        setTimeout(() => {
            if (this.isRunning) {
                this.log('💀 Force killing bot process...');
                this.botProcess.kill('SIGKILL');
            }
        }, 10000);
    }
    
    restartBot() {
        this.log('🔄 Manual restart requested...');
        
        if (this.isRunning) {
            this.botProcess.once('exit', () => {
                setTimeout(() => {
                    this.startBot();
                }, 2000);
            });
            
            this.stopBot();
        } else {
            this.startBot();
        }
    }
    
    setupSignalHandlers() {
        // Handle Ctrl+C
        process.on('SIGINT', () => {
            this.log('\n🛑 Received SIGINT (Ctrl+C)');
            this.shutdown();
        });
        
        // Handle termination
        process.on('SIGTERM', () => {
            this.log('\n🛑 Received SIGTERM');
            this.shutdown();
        });
        
        // Handle uncaught exceptions
        process.on('uncaughtException', (error) => {
            this.log(`💥 Runner uncaught exception: ${error.message}`);
            this.log(`Stack: ${error.stack}`);
            this.shutdown();
        });
        
        process.on('unhandledRejection', (reason, promise) => {
            this.log(`💥 Runner unhandled rejection: ${reason}`);
        });
    }
    
    shutdown() {
        this.log('🛑 Runner shutting down...');
        
        if (this.isRunning) {
            this.stopBot();
            
            // Wait for bot to stop
            setTimeout(() => {
                this.log('👋 Runner shutdown complete');
                process.exit(0);
            }, 5000);
        } else {
            this.log('👋 Runner shutdown complete');
            process.exit(0);
        }
    }
    
    showStatus() {
        this.log(`📊 Runner Status:`);
        this.log(`   Running: ${this.isRunning}`);
        this.log(`   Restart Count: ${this.restartCount}/${this.maxRestarts}`);
        this.log(`   Process PID: ${this.botProcess ? this.botProcess.pid : 'N/A'}`);
    }
}

// Handle command line arguments
const args = process.argv.slice(2);
const runner = new BotRunner();

switch (args[0]) {
    case 'start':
        runner.start();
        break;
    case 'stop':
        runner.stopBot();
        break;
    case 'restart':
        runner.restartBot();
        break;
    case 'status':
        runner.showStatus();
        break;
    default:
        console.log(`
GA Bot Runner - Usage:

  node run.js start     - Start the bot
  node run.js stop      - Stop the bot  
  node run.js restart   - Restart the bot
  node run.js status    - Show bot status

Examples:
  node run.js start
  npm start
        `);
        
        // If no arguments, start by default
        if (args.length === 0) {
            runner.start();
        }
        break;
}
