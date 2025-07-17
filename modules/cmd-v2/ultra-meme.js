// Ultra-minimal meme with image - Just 5 lines!

module.exports.config = {
    name: "meme",
    description: "Random meme image (no prefix)",
    prefix: false
};

module.exports.run = async ({ get, stream, reply }) => {
    try {
        const meme = await get("https://meme-api.com/gimme");
        return reply({ body: `😂 ${meme.title}`, attachment: await stream(meme.url) });
    } catch (error) {
        // Fallback to a different API
        try {
            const meme = await get("https://api.imgflip.com/get_memes");
            const randomMeme = meme.data.memes[Math.floor(Math.random() * meme.data.memes.length)];
            return reply({ body: `😂 ${randomMeme.name}`, attachment: await stream(randomMeme.url) });
        } catch (fallbackError) {
            return reply("😅 Sorry, meme service is temporarily unavailable!");
        }
    }
};
