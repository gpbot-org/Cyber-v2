// Ultra-minimal joke API - Just 4 lines!

module.exports.config = {
    name: "joke",
    description: "Get random joke (no prefix)",
    prefix: false
};

module.exports.run = async ({ get, reply }) => {
    const joke = await get("https://official-joke-api.appspot.com/random_joke");
    return reply(`😂 ${joke.setup}\n\n${joke.punchline}`);
};
