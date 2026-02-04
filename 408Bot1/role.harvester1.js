var roleHarvester1 = {

    /** @param {Creep} creep **/
    run: function(creep) {
        // State machine: switch between harvesting and delivering
        // 中文: 状态机：在采集和传输之间切换
        
        // If creep is empty, switch to harvesting state
        // 中文: 如果爬虫能量为空，切换到采集状态
        if(creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.delivering = false;
            creep.say('🔄 harvest');
        }
        // If creep is full, switch to delivering state
        // 中文: 如果爬虫能量满了，切换到传输状态
        if(creep.store.getFreeCapacity() == 0) {
            creep.memory.delivering = true;
            creep.say('🚚 deliver');
        }

        // Execute current state
        // 中文: 执行当前状态
        if(creep.memory.delivering) {
            // Delivering state: transfer energy to spawn or extensions
            // 中文: 传输状态：向孵化器或扩展结构传输能量
            var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) &&
                            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                    }
            });
            // Find the closest target and transfer energy
            // 中文: 寻找最近的目标并传输能量
            if(targets.length > 0) {
                if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
            // If no targets available, help with construction
            // 中文: 如果没有可用目标，帮助建造
            else {
                var constructionSites = creep.room.find(FIND_CONSTRUCTION_SITES);
                if(constructionSites.length > 0) {
                    creep.say('🚧 build');
                    if(creep.build(constructionSites[0]) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(constructionSites[0], {visualizePathStyle: {stroke: '#00ff00'}});
                    }
                }
                // If nothing to build, upgrade controller as fallback
                // 中文: 如果没有建造任务，作为备选升级控制器
                else {
                    creep.say('⚡ upgrade');
                    if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
                    }
                }
            }
        }
        else {
            // Harvesting state: harvest energy from sources
            // 中文: 采集状态：从能量源采集能量
            var sources = creep.room.find(FIND_SOURCES);
            if(creep.harvest(sources[1]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[1], {visualizePathStyle: {stroke: '#ffaa00'}});
            }
        }
	}
};

module.exports = roleHarvester1;