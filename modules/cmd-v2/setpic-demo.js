// Demo command showing setpic with reply image support

module.exports.config = {
    name: "setpicdemo",
    aliases: ["spdemo", "picreply"],
    description: "Demo: Set group picture from URL or replied image",
    usage: "setpicdemo [url] | Reply to image with setpicdemo",
    category: "demo",
    permission: 1,
    cooldown: 5,
    prefix: true
};

module.exports.run = async ({ args, api, t, reply, e, stream }) => {
    if (!e.isGroup) return reply("❌ Groups only!");
    
    const value = args.join(" ");
    
    try {
        let imageStream;
        
        // Method 1: Reply to image
        if (e.messageReply?.attachments?.length > 0) {
            const img = e.messageReply.attachments.find(a => 
                a.type === 'photo' || a.type === 'animated_image'
            );
            
            if (img) {
                const url = img.largePreviewUrl || img.previewUrl || img.url;
                if (url) {
                    imageStream = await stream(url);
                    await api.changeGroupImage(imageStream, t.id);
                    return reply("✅ Group picture set from replied image!");
                }
            }
        }
        
        // Method 2: URL provided
        if (value && (value.startsWith('http://') || value.startsWith('https://'))) {
            imageStream = await stream(value);
            await api.changeGroupImage(imageStream, t.id);
            return reply("✅ Group picture set from URL!");
        }
        
        // Usage instructions
        return reply(`📋 SETPIC DEMO USAGE:

🔸 Method 1: Reply to any image with "setpicdemo"
🔸 Method 2: setpicdemo [image_url]

💡 Examples:
• Reply to a photo → setpicdemo
• setpicdemo https://example.com/image.jpg

🎯 This works in:
• +gm setpic (reply to image)
• +ugm setpic (reply to image)  
• +theme pic (reply to image)`);
        
    } catch (error) {
        return reply(`❌ Failed: ${error.message}`);
    }
};
