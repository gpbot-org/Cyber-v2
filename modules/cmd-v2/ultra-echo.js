// Ultra-minimal CMD-V2 example - Just 3 lines of code!

module.exports.config = {
    name: "uecho",
    description: "Ultra-minimal echo command",
    prefix: true
};

module.exports.run = async ({ args, reply }) => {
    return reply(args.length ? `🔊 ${args.join(" ")}` : "❌ No message!");
};
