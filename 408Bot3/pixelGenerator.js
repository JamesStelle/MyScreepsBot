// pixelGenerator.js
module.exports = {
    generatePixel: function() {
        // 检查 CPU Bucket 是否足够生成 PIXEL
        if (Game.cpu.bucket >= 10000) {
            const result = Game.cpu.generatePixel();
            if (result === OK) {
                //console.log(`✅ [Pixel] Generated 1 PIXEL. CPU Bucket: ${Game.cpu.bucket}`);
                return true;
            } else {
                //console.log(`❌ [Pixel] Failed to generate PIXEL. Error code: ${result}`);
                return false;
            }
        } else {
                //console.log(`⚠️ [Pixel] Not enough CPU Bucket (${Game.cpu.bucket}/10000)`);
            return false;
        }
    }
};