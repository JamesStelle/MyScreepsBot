var roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep) {
		// Check if creep is building or harvesting
		// 中文: 检查爬虫是建造还是采集
	    if(creep.memory.building && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.building = false;
            creep.say('🔄 harvest');
	    }
	    if(!creep.memory.building && creep.store.getFreeCapacity() == 0) {
	        creep.memory.building = true;
	        creep.say('🚧 build');
	    }
		// If building, find construction sites and build
		// 中文: 如果在建造，寻找施工地点并建造
	    if(creep.memory.building) {
	        var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
            if(targets.length) {
                if(creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
            // If no construction sites, look for structures to repair
            // 中文: 如果没有建造任务，寻找需要修理的建筑
            else {
                var repairTargets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return structure.hits < structure.hitsMax;
                    }
                });
                
                if(repairTargets.length > 0) {
                    creep.say('🔧 repair');
                    // Find the structure with lowest hit percentage
                    // 中文: 寻找血量百分比最低的建筑
                    var target = repairTargets.reduce((min, structure) => {
                        return (structure.hits / structure.hitsMax) < (min.hits / min.hitsMax) ? structure : min;
                    });
                    
                    if(creep.repair(target) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target, {visualizePathStyle: {stroke: '#00ff00'}});
                    }
                }
                // If nothing to repair, upgrade controller as fallback
                // 中文: 如果没有修理任务，作为备选升级控制器
                else {
                    creep.say('⚡ upgrade');
                    if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
                    }
                }
            }
	    }
		// If not building, harvest energy
		// 中文: 如果不在建造，采集能量
	    else {
	        var sources = creep.room.find(FIND_SOURCES);
            if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#ffaa00'}});
            }
	    }
	}
};

module.exports = roleBuilder;