module.exports.config = {
    name: "anime",
    version: "1.0.2",
    hasPermssion: 0,
    credits: "Grandpa Academy",
    description: "Get random anime images (Safe For Work)",
    commandCategory: "entertainment",
    usages: "[tag]",
    cooldowns: 5,
    dependencies: {
        "axios": "",
        "fs-extra": "",
        "path": ""
    },
    prefix: true  // true = requires prefix, false = no prefix needed
};

module.exports.languages = {
    "en": {
        "availableTags": "🎌 Available anime tags:\n%1\n\n💡 Usage: %2anime <tag>",
        "gettingImage": "🎌 Getting anime image...",
        "imageCaption": "🎌 Here's your %1 anime image!",
        "error": "❌ Failed to get anime image. Please try again.",
        "invalidTag": "❌ Invalid tag. Use %1anime to see available tags."
    },
    "bn": {
        "availableTags": "🎌 Available anime tags:\n%1\n\n💡 Usage: %2anime <tag>",
        "gettingImage": "🎌 Anime image ante dacci...",
        "imageCaption": "🎌 Apnar %1 anime image!",
        "error": "❌ Anime image ante parchi na. Abar try koren.",
        "invalidTag": "❌ Invalid tag. %1anime use koren available tags dekhte."
    }
};

module.exports.getAnime = async function (type) {
    try {
        const { join } = global.nodemodule["path"];
        const { getContent, downloadFile, randomString } = global.utils;
        
        // Anime API endpoints
        const animeData = {
            "neko": "https://api.waifu.pics/sfw/neko",
            "waifu": "https://api.waifu.pics/sfw/waifu",
            "shinobu": "https://api.waifu.pics/sfw/shinobu",
            "megumin": "https://api.waifu.pics/sfw/megumin",
            "bully": "https://api.waifu.pics/sfw/bully",
            "cuddle": "https://api.waifu.pics/sfw/cuddle",
            "cry": "https://api.waifu.pics/sfw/cry",
            "hug": "https://api.waifu.pics/sfw/hug",
            "awoo": "https://api.waifu.pics/sfw/awoo",
            "kiss": "https://api.waifu.pics/sfw/kiss",
            "lick": "https://api.waifu.pics/sfw/lick",
            "pat": "https://api.waifu.pics/sfw/pat",
            "smug": "https://api.waifu.pics/sfw/smug",
            "bonk": "https://api.waifu.pics/sfw/bonk",
            "yeet": "https://api.waifu.pics/sfw/yeet",
            "blush": "https://api.waifu.pics/sfw/blush",
            "smile": "https://api.waifu.pics/sfw/smile",
            "wave": "https://api.waifu.pics/sfw/wave",
            "highfive": "https://api.waifu.pics/sfw/highfive",
            "handhold": "https://api.waifu.pics/sfw/handhold"
        };
        
        const dataImage = await getContent(animeData[type]);
        const urlImage = dataImage.data.url;
        const ext = urlImage.substring(urlImage.lastIndexOf(".") + 1);
        const string = randomString(5);
        const path = join(__dirname, "..", "..", "assets", "temp", `${string}.${ext}`);
        
        await downloadFile(urlImage, path);
        return path;
    } catch (e) { 
        console.log(e);
        return null;
    }
};

module.exports.run = async function({ event, api, args, getText, prefix }) {
    const { createReadStream, unlinkSync } = global.nodemodule["fs-extra"];
    const { threadID, messageID } = event;

    // Available anime tags
    const animeTags = [
        "neko", "waifu", "shinobu", "megumin", "bully", "cuddle", 
        "cry", "hug", "awoo", "kiss", "lick", "pat", "smug", 
        "bonk", "yeet", "blush", "smile", "wave", "highfive", "handhold"
    ];
    
    if (args.length === 0 || !animeTags.includes(args[0].toLowerCase())) {
        const tagList = animeTags.map(tag => `• ${tag}`).join('\n');
        return api.sendMessage(getText("availableTags", tagList, prefix), threadID, messageID);
    }

    const tag = args[0].toLowerCase();
    
    try {
        // Send loading message
        const loadingMsg = await api.sendMessage(getText("gettingImage"), threadID, messageID);
        
        const imagePath = await this.getAnime(tag);
        
        if (!imagePath) {
            return api.editMessage(getText("error"), loadingMsg.messageID);
        }
        
        // Send image
        api.sendMessage({
            body: getText("imageCaption", tag),
            attachment: createReadStream(imagePath)
        }, threadID, function () {
            try {
                unlinkSync(imagePath);
            } catch (e) {
                console.log("Failed to delete temp file:", e);
            }
        }, messageID);
        
        // Delete loading message
        api.unsendMessage(loadingMsg.messageID);
        
    } catch (e) { 
        console.log(e);
        return api.sendMessage(getText("error"), threadID, messageID);
    }
};
