var roleSigner = {

    /** @param {Creep} creep **/
    run: function(creep) {
        const controller = creep.room.controller;
        
        if (!controller) {
            return;
        }

        // Check if creep is close to death or task is completed, then recycle
        // 检查 creep 是否接近死亡或任务完成，然后回收
        if (creep.ticksToLive < 50 || creep.memory.taskCompleted) {
            creep.say('♻️ recycle');
            var spawn = creep.room.find(FIND_MY_SPAWNS)[0];
            if (spawn && spawn.recycleCreep(creep) == ERR_NOT_IN_RANGE) {
                creep.moveTo(spawn, {visualizePathStyle: {stroke: '#ff0000'}});
            }
            return;
        }

        // Move to controller and sign it
        // 移动到控制器并签名
        if (creep.pos.getRangeTo(controller) > 1) {
            creep.say('🚶 moving');
            creep.moveTo(controller, {visualizePathStyle: {stroke: '#ffffff'}});
        } else {
            // Sign the controller
            // 签名控制器
            var result = creep.signController(controller, '愿此行，终抵群星');
            /*重铸未来，方舟启航*/
            /*跨越边境，直至前线*/
            /*世界全剧终，欢迎来到新艾利都*/
            /*鸣潮往复，文明不屈*/
            /*旅途总有一天会迎来终点,不必匆忙。*/
            if (result == OK) {
                creep.say('✍️ signed');
                creep.memory.taskCompleted = true;
            } else {
                creep.say('✍️ signing');
            }
        }
    }
};

module.exports = roleSigner;