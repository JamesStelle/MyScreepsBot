var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep) {
        // State machine: switch between harvesting and upgrading
        // 中文: 状态机：在采集和升级之间切换
        
        // If creep is empty, switch to harvesting state
        // 中文: 如果爬虫能量为空，切换到采集状态
        if(creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.upgrading = false;
            creep.say('🔄 harvest');
        }
        // If creep is full, switch to upgrading state
        // 中文: 如果爬虫能量满了，切换到升级状态
        if(creep.store.getFreeCapacity() == 0) {
            creep.memory.upgrading = true;
            creep.say('⚡ upgrade');
        }

        // Execute current state
        // 中文: 执行当前状态
        if(creep.memory.upgrading) {
            // Upgrading state: upgrade the controller
            // 中文: 升级状态：升级控制器
            if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
            }
        }
        else {
            // Harvesting state: harvest energy from sources
            // 中文: 采集状态：从能量源采集能量
            var sources = creep.room.find(FIND_SOURCES);
            if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#ffaa00'}});
            }
        }
	}
};

module.exports = roleUpgrader;