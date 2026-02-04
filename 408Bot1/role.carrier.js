var roleCarrier = {

    /** @param {Creep} creep **/
    run: function(creep) {
        // State machine: switch between collecting and delivering
        // 中文: 状态机：在收集和传输之间切换
        
        // If creep is empty, switch to collecting state
        // 中文: 如果爬虫能量为空，切换到收集状态
        if(creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.delivering = false;
            creep.say('🔍 collect');
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
            // Delivering state: transfer energy to structures
            // 中文: 传输状态：向建筑传输能量
            var targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION ||
                           structure.structureType == STRUCTURE_SPAWN ||
                           structure.structureType == STRUCTURE_TOWER) &&
                           structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                }
            });
            
            if(targets.length > 0) {
                if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
            else {
                // No targets available, wait
                // 中文: 没有可用目标，等待
                creep.say('⏳ wait');
            }
        }
        else {
            // Collecting state: gather energy from tombstones, ruins, dropped resources or containers
            // 中文: 收集状态：从墓碑、废墟、掉落资源或容器收集能量
            
            // Priority 1: Look for dropped resources
            // 优先级1：寻找掉落的资源
            var droppedResources = creep.room.find(FIND_DROPPED_RESOURCES);
            
            if(droppedResources.length > 0) {
                // Prioritize energy, then other resources
                // 优先能量，然后其他资源
                var energyResource = droppedResources.find(resource => resource.resourceType == RESOURCE_ENERGY);
                var target = energyResource || droppedResources[0];
                
                creep.say('⚡ pickup');
                if(creep.pickup(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffff00'}});
                }
            }
            // Priority 2: Look for tombstones with energy
            // 优先级2：寻找墓碑中的能量
            else {
                var tombstones = creep.room.find(FIND_TOMBSTONES, {
                    filter: (tombstone) => {
                        return tombstone.store[RESOURCE_ENERGY] > 0;
                    }
                });
                
                if(tombstones.length > 0) {
                    creep.say('💀 tomb');
                    if(creep.withdraw(tombstones[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(tombstones[0], {visualizePathStyle: {stroke: '#ff0000'}});
                    }
                }
                // Priority 3: Look for ruins with energy
                // 优先级3：寻找废墟中的能量
                else {
                    var ruins = creep.room.find(FIND_RUINS, {
                        filter: (ruin) => {
                            return ruin.store[RESOURCE_ENERGY] > 0;
                        }
                    });
                    
                    if(ruins.length > 0) {
                        creep.say('🏚️ ruins');
                        if(creep.withdraw(ruins[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(ruins[0], {visualizePathStyle: {stroke: '#8B4513'}});
                        }
                    }
                    // Priority 4: Look for containers with energy
                    // 优先级4：寻找有能量的容器
                    else {
                        var containers = creep.room.find(FIND_STRUCTURES, {
                            filter: (structure) => {
                                return structure.structureType == STRUCTURE_CONTAINER && 
                                       structure.store[RESOURCE_ENERGY] > 0;
                            }
                        });
                        
                        if(containers.length > 0) {
                            creep.say('📦 carry');
                            if(creep.withdraw(containers[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(containers[0], {visualizePathStyle: {stroke: '#ffaa00'}});
                            }
                        }
                        // No sources available, show debug info
                        // 中文: 没有可用资源，显示调试信息
                        else {
                            var energy = creep.store[RESOURCE_ENERGY];
                            var capacity = creep.store.getCapacity();
                            creep.say(`E:${energy}/${capacity}`);
                        }
                    }
                }
            }
        }
	}
};

module.exports = roleCarrier;