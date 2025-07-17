const login = require('./ga-fca');
const fs = require('fs');
const readline = require('readline');

console.log('🔐 Facebook Appstate Generator');
console.log('This script will help you generate a fresh appstate.json file\n');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function askQuestion(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
}

async function getAppstate() {
    try {
        console.log('Please enter your Facebook credentials:');
        const email = await askQuestion('Email: ');
        const password = await askQuestion('Password: ');

        console.log('\n🔄 Attempting to login...');

        const credentials = { email, password };
        const options = {
            logLevel: "silent",
            selfListen: false,
            listenEvents: false,
            updatePresence: false
        };

        login(credentials, options, (err, api) => {
            if (err) {
                console.error('❌ Login failed:', err.message);
                
                if (err.error === 'login-approval') {
                    console.log('\n📱 Two-factor authentication required!');
                    console.log('Please check your phone/email for the approval code.');
                    
                    askQuestion('Enter the approval code: ').then((code) => {
                        err.continue(code);
                    });
                    
                    return;
                }
                
                rl.close();
                return;
            }

            console.log('✅ Login successful!');
            
            // Get and save appstate
            const appState = api.getAppState();
            
            try {
                fs.writeFileSync('appstate.json', JSON.stringify(appState, null, 2));
                console.log('📝 Appstate saved to appstate.json');
                console.log('🎉 You can now use the echo bot with: node echo_bot.js');
            } catch (saveError) {
                console.error('❌ Failed to save appstate:', saveError.message);
            }

            // Logout to clean up
            api.logout((logoutErr) => {
                if (logoutErr) {
                    console.warn('⚠️  Logout warning:', logoutErr.message);
                }
                rl.close();
            });
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
        rl.close();
    }
}

// Handle 2FA continuation
function handle2FA(err) {
    if (err.error === 'login-approval') {
        console.log('\n📱 Two-factor authentication detected!');
        console.log('Check your phone or email for the approval notification.');
        
        askQuestion('Enter the approval code (or press Enter to continue): ').then((code) => {
            if (code.trim()) {
                err.continue(code);
            } else {
                err.continue();
            }
        });
    }
}

console.log('⚠️  Security Notice:');
console.log('- Your credentials are only used to generate the appstate');
console.log('- No credentials are stored, only the session cookies');
console.log('- Keep your appstate.json file secure and private\n');

askQuestion('Do you want to continue? (y/N): ').then((answer) => {
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
        getAppstate();
    } else {
        console.log('👋 Cancelled by user');
        rl.close();
    }
});

rl.on('close', () => {
    console.log('\n👋 Goodbye!');
    process.exit(0);
});
