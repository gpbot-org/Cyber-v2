// CMD-V2 Format - Enhanced Cat Command with full GA-FCA support!

module.exports.config = {
    name: "cat",
    description: "Get random cat images with advanced features",
    usage: "cat [breed] [--info] [--share] [--poll]",
    category: "fun",
    permission: 0,
    cooldown: 3,
    prefix: false,
    aliases: ["kitty", "kitten", "meow"]
};

module.exports.languages = {
    "en": {
        "loading": "🐱 Getting a cute cat for you...",
        "error": "❌ Failed to get cat image!",
        "success": "🐱 Here's your adorable cat!",
        "breed_info": "📋 Breed: {breed}\n⭐ Temperament: {temperament}\n🏠 Origin: {origin}\n📝 Description: {description}",
        "shared": "✅ Cat image shared successfully!",
        "poll_created": "📊 Cat poll created! Vote for your favorite!"
    },
    "bn": {
        "loading": "🐱 Apnar jonno cute cat ante hocche...",
        "error": "❌ Cat image ante parini!",
        "success": "🐱 Apnar jonno cute cat!",
        "breed_info": "📋 Breed: {breed}\n⭐ Temperament: {temperament}\n🏠 Origin: {origin}\n📝 Description: {description}",
        "shared": "✅ Cat image successfully share korsi!",
        "poll_created": "📊 Cat poll create korsi! Vote din!"
    }
};

module.exports.run = async (ctx) => {
    // Destructure all the enhanced GA-FCA features
    const { 
        reply, getText, args, react, typing, typingV2, 
        get, stream, u, t, gc, m, p, s, share, sys, _,
        send, edit, unsend, forward, markRead, upload
    } = ctx;
    
    try {
        // Show typing indicator (GA-FCA feature)
        await typing(true);

        // React to show processing
        await react("😍");

        // Parse arguments for advanced features
        const breed = args[0];
        const showInfo = args.includes('--info');
        const shareMode = args.includes('--share');
        const createPoll = args.includes('--poll');

        // Send loading message with typing indicator
        const loadingMsg = await reply(getText("loading"));
        await typingV2(t.id, true);

        // Get cat data with optional breed filter
        let apiUrl = "https://api.thecatapi.com/v1/images/search";
        if (breed) {
            // Search for breed first
            const breedData = await get(`https://api.thecatapi.com/v1/breeds/search?q=${breed}`);
            if (breedData && breedData[0]) {
                apiUrl += `?breed_ids=${breedData[0].id}`;
            }
        }

        const catData = await get(apiUrl);

        if (!catData || !catData[0] || !catData[0].url) {
            throw new Error("No cat image found");
        }

        const catImageUrl = catData[0].url;
        const catBreed = catData[0].breeds && catData[0].breeds[0];

        // Get image stream
        const imageStream = await stream(catImageUrl);

        // Stop typing indicator
        await typingV2(t.id, false);

        // Build message
        let messageBody = getText("success");
        
        // Add breed info if available and requested
        if (showInfo && catBreed) {
            messageBody += "\n\n" + getText("breed_info", {
                breed: catBreed.name || "Unknown",
                temperament: catBreed.temperament || "Playful",
                origin: catBreed.origin || "Unknown",
                description: _.cut(catBreed.description || "A wonderful cat breed", 100)
            });
        }

        const messageData = {
            body: messageBody,
            attachment: imageStream
        };

        // Delete loading message using GA-FCA
        await unsend(loadingMsg.messageID);

        // Send the cat image
        const sentMessage = await reply(messageData);

        // Mark as read
        await markRead();

        // Advanced features demonstration
        if (shareMode) {
            // Share to multiple threads (if user is admin)
            if (u.admin()) {
                const threadList = await t.list();
                const randomThreads = _.shuffle(threadList.slice(0, 3));
                
                for (const thread of randomThreads) {
                    await send(messageData, thread.threadID);
                }
                
                await reply(getText("shared"));
            }
        }

        if (createPoll) {
            // Create a cat poll using GA-FCA
            const pollOptions = [
                "😍 Super Cute!",
                "😊 Very Nice!",
                "😸 Adorable!",
                "🥰 Love It!"
            ];
            
            await t.poll("Rate this cat!", pollOptions);
            await reply(getText("poll_created"));
        }

        // React with success
        await react("😍");

        // Pin message if it's a group and user is admin
        if (await t.info().then(info => info.isGroup)) {
            const threadInfo = await t.info();
            if (threadInfo.adminIDs.includes(u.id)) {
                await m.pin(sentMessage.messageID);
            }
        }

        // Log command usage
        _.log(`Cat command used by ${u.id} in ${t.id}`);

        return sentMessage;

    } catch (error) {
        // Stop typing on error
        await typingV2(t.id, false);
        
        // React with error
        await react("😢");

        // Log error
        _.error("Cat command error:", error.message);

        // Send error with enhanced formatting
        const errorMessage = `${getText("error")}\n\n🔧 Debug info:\n${error.message}`;
        return reply(errorMessage);
    }
};

// Handle message reactions (GA-FCA feature)
module.exports.handleReaction = async ({ event, api, Threads, Users }) => {
    if (event.reaction === "😍") {
        // User loved the cat, send another one!
        const anotherCat = await api.httpGet("https://api.thecatapi.com/v1/images/search");
        
        if (anotherCat && anotherCat[0]) {
            const stream = await global.utils.getStreamFromURL(anotherCat[0].url);
            
            await api.sendMessage({
                body: "🐱 Since you loved that cat, here's another one!",
                attachment: stream
            }, event.threadID);
        }
    }
    
    if (event.reaction === "❤️") {
        // Add to user's favorites
        const userData = await Users.getData(event.userID);
        if (!userData.favoriteCats) userData.favoriteCats = [];
        
        userData.favoriteCats.push({
            messageID: event.messageID,
            timestamp: Date.now()
        });
        
        await Users.setData(event.userID, userData);
        
        await api.sendMessage("❤️ Cat added to your favorites!", event.threadID);
    }
};