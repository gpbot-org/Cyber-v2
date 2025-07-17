// Error recovery and auto-restart system

const fs = require('fs');
const path = require('path');

class ErrorRecovery {
    constructor() {
        this.criticalErrors = [];
        this.errorThreshold = 10; // Max errors before restart
        this.timeWindow = 300000; // 5 minutes in milliseconds
        this.restartCooldown = 60000; // 1 minute cooldown between restarts
        this.lastRestart = 0;
        this.errorLogPath = path.join(__dirname, '../assets/logs/critical-errors.log');
        
        // Ensure log directory exists
        const logDir = path.dirname(this.errorLogPath);
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
    }
    
    // Check if error is critical and requires restart
    isCriticalError(error) {
        const criticalPatterns = [
            'parseAndCheckLogin got status code: 404',
            'ENOTFOUND',
            'ECONNRESET',
            'ETIMEDOUT',
            'Login failed',
            'Connection lost',
            'Session expired',
            'Rate limit exceeded',
            'Too many requests',
            'field_exception',
            'Query error',
            'server error',
            'You can\'t use this feature at the moment',
            'We limit how often you can post',
            'blockedAction'
        ];

        // Non-critical temporary errors (should not trigger restart)
        const temporaryPatterns = [
            '1545012',
            'Temporary Failure',
            'There was a temporary error',
            'transientError',
            'not part of the conversation',
            'This might mean that you\'re not part of the conversation'
        ];

        const errorMessage = error.message || error.toString() || JSON.stringify(error);

        // Don't treat temporary errors as critical
        if (temporaryPatterns.some(pattern => errorMessage.includes(pattern))) {
            return false;
        }

        return criticalPatterns.some(pattern => errorMessage.includes(pattern));
    }
    
    // Log critical error
    logCriticalError(error, context = '') {
        const errorEntry = {
            timestamp: Date.now(),
            message: error.message || error.toString(),
            stack: error.stack,
            context: context,
            type: this.getErrorType(error)
        };
        
        this.criticalErrors.push(errorEntry);
        
        // Write to log file
        const logEntry = `[${new Date().toISOString()}] CRITICAL ERROR: ${errorEntry.message}\nContext: ${context}\nStack: ${errorEntry.stack}\n\n`;
        fs.appendFileSync(this.errorLogPath, logEntry);
        
        // Clean old errors (older than time window)
        this.cleanOldErrors();
        
        console.error(`🚨 Critical error logged: ${errorEntry.message}`);
        
        // Check if restart is needed
        if (this.shouldRestart()) {
            this.initiateRestart(errorEntry);
        }
    }
    
    // Determine error type
    getErrorType(error) {
        const message = error.message || error.toString();
        
        if (message.includes('parseAndCheckLogin')) return 'FACEBOOK_API';
        if (message.includes('getUserInfo')) return 'USER_INFO';
        if (message.includes('ENOTFOUND')) return 'NETWORK';
        if (message.includes('ECONNRESET')) return 'CONNECTION';
        if (message.includes('ETIMEDOUT')) return 'TIMEOUT';
        if (message.includes('Login')) return 'LOGIN';
        if (message.includes('Rate limit')) return 'RATE_LIMIT';
        
        return 'UNKNOWN';
    }
    
    // Clean errors older than time window
    cleanOldErrors() {
        const cutoff = Date.now() - this.timeWindow;
        this.criticalErrors = this.criticalErrors.filter(error => error.timestamp > cutoff);
    }
    
    // Check if restart is needed
    shouldRestart() {
        // Don't restart if we just restarted recently
        if (Date.now() - this.lastRestart < this.restartCooldown) {
            return false;
        }
        
        // Count recent critical errors
        const recentErrors = this.criticalErrors.filter(error => 
            Date.now() - error.timestamp < this.timeWindow
        );
        
        // Restart if too many errors in time window
        if (recentErrors.length >= this.errorThreshold) {
            return true;
        }
        
        // Restart for specific critical error types
        const facebookApiErrors = recentErrors.filter(error => error.type === 'FACEBOOK_API');
        if (facebookApiErrors.length >= 5) {
            return true;
        }
        
        const networkErrors = recentErrors.filter(error => 
            error.type === 'NETWORK' || error.type === 'CONNECTION' || error.type === 'TIMEOUT'
        );
        if (networkErrors.length >= 3) {
            return true;
        }
        
        return false;
    }
    
    // Initiate bot restart
    initiateRestart(triggerError) {
        this.lastRestart = Date.now();
        
        console.log(`🔄 Initiating auto-restart due to critical errors...`);
        console.log(`🚨 Trigger error: ${triggerError.message}`);
        console.log(`📊 Recent errors: ${this.criticalErrors.length}`);
        
        // Log restart reason
        const restartLog = `[${new Date().toISOString()}] AUTO-RESTART INITIATED\nTrigger: ${triggerError.message}\nRecent errors: ${this.criticalErrors.length}\n\n`;
        fs.appendFileSync(this.errorLogPath, restartLog);
        
        // Notify about restart (if possible)
        try {
            if (global.client && global.client.api) {
                // Try to send restart notification to admin
                const adminID = global.client.config?.adminIDs?.[0];
                if (adminID) {
                    global.client.api.sendMessage(
                        `🔄 Bot auto-restarting due to critical errors\n\n🚨 Trigger: ${triggerError.message}\n📊 Recent errors: ${this.criticalErrors.length}\n⏰ Time: ${new Date().toLocaleString()}`,
                        adminID
                    ).catch(() => {}); // Ignore if this fails
                }
            }
        } catch (e) {
            // Ignore notification errors
        }
        
        // Perform restart
        setTimeout(() => {
            process.exit(1); // Exit with error code to trigger runner restart
        }, 2000); // Give time for cleanup
    }
    
    // Get error statistics
    getErrorStats() {
        this.cleanOldErrors();
        
        const stats = {
            totalErrors: this.criticalErrors.length,
            errorsByType: {},
            recentErrors: this.criticalErrors.filter(error => 
                Date.now() - error.timestamp < 3600000 // Last hour
            ).length,
            lastRestart: this.lastRestart,
            nextRestartThreshold: this.errorThreshold - this.criticalErrors.length
        };
        
        // Count errors by type
        this.criticalErrors.forEach(error => {
            stats.errorsByType[error.type] = (stats.errorsByType[error.type] || 0) + 1;
        });
        
        return stats;
    }
    
    // Reset error counter (for manual recovery)
    resetErrors() {
        this.criticalErrors = [];
        console.log('🔄 Error counter reset');
    }
    
    // Handle graceful shutdown
    gracefulShutdown() {
        console.log('🛑 Graceful shutdown initiated...');
        
        // Save final error log
        const shutdownLog = `[${new Date().toISOString()}] GRACEFUL SHUTDOWN\nTotal errors handled: ${this.criticalErrors.length}\n\n`;
        fs.appendFileSync(this.errorLogPath, shutdownLog);
        
        // Clear error list
        this.criticalErrors = [];
    }

    // Check if error is Facebook temporary failure (1545012)
    isTemporaryFailure(error) {
        const errorMessage = error.message || error.toString() || JSON.stringify(error);
        return errorMessage.includes('1545012') ||
               errorMessage.includes('Temporary Failure') ||
               errorMessage.includes('There was a temporary error') ||
               errorMessage.includes('transientError');
    }

    // Check if error is "not part of conversation"
    isNotPartOfConversation(error) {
        const errorMessage = error.message || error.toString() || JSON.stringify(error);
        return errorMessage.includes('not part of the conversation') ||
               errorMessage.includes('This might mean that you\'re not part of the conversation');
    }

    // Check if error is rate limiting
    isRateLimited(error) {
        const errorMessage = error.message || error.toString() || JSON.stringify(error);
        return errorMessage.includes('Rate limit') ||
               errorMessage.includes('Too many requests') ||
               errorMessage.includes('We limit how often') ||
               errorMessage.includes('You can\'t use this feature at the moment');
    }

    // Check if error is network related
    isNetworkError(error) {
        const errorMessage = error.message || error.toString() || JSON.stringify(error);
        return errorMessage.includes('ENOTFOUND') ||
               errorMessage.includes('ECONNRESET') ||
               errorMessage.includes('ETIMEDOUT') ||
               errorMessage.includes('Connection lost') ||
               errorMessage.includes('Network error');
    }

    // Handle different types of errors
    async handleError(error, context = 'Unknown') {
        const errorMessage = error.message || error.toString() || JSON.stringify(error);

        this.logError(error, context);

        // Handle Facebook temporary failures (1545012)
        if (this.isTemporaryFailure(error)) {
            console.log(`⚠️ Facebook temporary failure detected in ${context}. Implementing delay...`);
            await this.delay(3000); // 3 second delay for temporary failures
            return { handled: true, shouldRetry: true, delay: 3000 };
        }

        // Handle "not part of conversation" errors
        if (this.isNotPartOfConversation(error)) {
            console.log(`⚠️ Not part of conversation error in ${context}. Skipping...`);
            return { handled: true, shouldRetry: false, skip: true };
        }

        // Check for rate limiting
        if (this.isRateLimited(error)) {
            console.log(`⚠️ Rate limiting detected in ${context}. Implementing delay...`);
            await this.delay(5000); // 5 second delay for rate limits
            return { handled: true, shouldRetry: true, delay: 5000 };
        }

        // Check for temporary network issues
        if (this.isNetworkError(error)) {
            console.log(`⚠️ Network error detected in ${context}. Implementing retry...`);
            await this.delay(2000); // 2 second delay for network issues
            return { handled: true, shouldRetry: true, delay: 2000 };
        }

        // Check if critical error
        if (this.isCriticalError(error)) {
            console.error(`❌ Critical error detected in ${context}: ${errorMessage}`);
            return { handled: true, shouldRetry: false, critical: true };
        }

        // Default handling for non-critical errors
        console.log(`ℹ️ Non-critical error in ${context}: ${errorMessage}`);
        return { handled: true, shouldRetry: false, critical: false };
    }

    // Delay utility
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Create singleton instance
const errorRecovery = new ErrorRecovery();

// Global error handlers
process.on('uncaughtException', (error) => {
    console.error('🚨 Uncaught Exception:', error);
    errorRecovery.logCriticalError(error, 'UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', async (reason, promise) => {
    console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason);

    // Try to handle the error gracefully
    try {
        const result = await errorRecovery.handleError(new Error(reason), 'UNHANDLED_REJECTION');

        if (result.skip) {
            console.log('⏭️ Skipping non-critical unhandled rejection');
            return;
        }

        if (!result.critical) {
            console.log('ℹ️ Non-critical unhandled rejection handled gracefully');
            return;
        }
    } catch (handleError) {
        console.error('❌ Error while handling unhandled rejection:', handleError);
    }

    // Log as critical if not handled gracefully
    errorRecovery.logCriticalError(new Error(reason), 'UNHANDLED_REJECTION');
});

// Graceful shutdown handlers
process.on('SIGINT', () => {
    errorRecovery.gracefulShutdown();
    process.exit(0);
});

process.on('SIGTERM', () => {
    errorRecovery.gracefulShutdown();
    process.exit(0);
});

module.exports = errorRecovery;
