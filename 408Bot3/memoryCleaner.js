module.exports = {
    run: function() {
        // 清理不存在的creep内存
        for(const name in Memory.creeps) {
            if(!Game.creeps[name]) {
                delete Memory.creeps[name];
                console.log('清理不存在的creep内存:', name);
            }
        }
        
        // 可以在这里添加其他内存清理逻辑
        // 例如清理过期flags、rooms等
    }
};