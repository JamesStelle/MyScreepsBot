var roleHarvester0 = {

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
            // Delivering state: transfer energy to containers first, then spawn or extensions
            // 中文: 传输状态：优先向容器传输能量，然后是孵化器或扩展结构
            
            // Priority 1: Look for containers with free capacity near source[0]
            // 优先级1：寻找 source[0] 附近有空余容量的容器
            var sources = creep.room.find(FIND_SOURCES);
            var containers = [];
            
            if(sources.length > 0 && sources[0]) {
                containers = sources[0].pos.findInRange(FIND_STRUCTURES, 2, {
                    filter: (structure) => {
                        return structure.structureType == STRUCTURE_CONTAINER &&
                               structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                    }
                });
            }
            
            if(containers.length > 0) {
                creep.say('📦 container');
                if(creep.transfer(containers[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(containers[0], {visualizePathStyle: {stroke: '#ffaa00'}});
                }
            }
            // Priority 2: If containers exist but are not available, wait
            // 优先级2：存在容器且容器不可用时，改为等待
            else {
                // Check if containers exist near source[0] (regardless of capacity)
                // 检查 source[0] 附近是否存在容器（不考虑容量）
                var allContainers = [];
                if(sources.length > 0 && sources[0]) {
                    allContainers = sources[0].pos.findInRange(FIND_STRUCTURES, 2, {
                        filter: (structure) => {
                            return structure.structureType == STRUCTURE_CONTAINER;
                        }
                    });
                }
                
                if(allContainers.length > 0) {
                    // Containers exist but are full, repair them instead of waiting
                    // 容器存在但已满，修复容器而不是等待
                    var containersToRepair = sources[0].pos.findInRange(FIND_STRUCTURES, 2, {
                        filter: (structure) => {
                            return structure.structureType == STRUCTURE_CONTAINER &&
                                   structure.hits < structure.hitsMax;
                        }
                    });
                    
                    if(containersToRepair.length > 0) {
                        creep.say('🔧 repair');
                        if(creep.repair(containersToRepair[0]) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(containersToRepair[0], {visualizePathStyle: {stroke: '#00ff00'}});
                        }
                    } else {
                        // Containers are full and don't need repair, wait
                        // 容器已满且不需要修复，等待
                        creep.say('⏳ wait');
                    }
                }
                // Priority 3: If no containers exist, transfer to spawn or extensions
                // 优先级3：无容器时，则传输到孵化器或扩展结构
                else {
                    var targets = creep.room.find(FIND_STRUCTURES, {
                            filter: (structure) => {
                                return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) &&
                                    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                            }
                    });
                    // Find the closest target and transfer energy
                    // 中文: 寻找最近的目标并传输能量
                    if(targets.length > 0) {
                        creep.say('🏢 spawn/ext');
                        if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                        }
                    }
                    // If no targets available, repair containers near source[0]
                    // 中文: 如果没有可用目标，修复 source[0] 附近的容器
                    else {
                        var sources = creep.room.find(FIND_SOURCES);
                        var containers = [];
                        
                        if(sources.length > 0 && sources[0]) {
                            containers = sources[0].pos.findInRange(FIND_STRUCTURES, 2, {
                                filter: (structure) => {
                                    return structure.structureType == STRUCTURE_CONTAINER &&
                                           structure.hits < structure.hitsMax;
                                }
                            });
                        }
                        
                        if(containers.length > 0) {
                            creep.say('🔧 repair');
                            if(creep.repair(containers[0]) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(containers[0], {visualizePathStyle: {stroke: '#00ff00'}});
                            }
                        }
                    }
                }
            }
        }
        else {
            // Harvesting state: harvest energy from sources and stay on container
            // 中文: 采集状态：从能量源采集能量并停留在容器上
            
            var sources = creep.room.find(FIND_SOURCES);
            var source = sources[0];
            
            if(source) {
                // Find container near source[0]
                // 寻找 source[0] 附近的容器
                var containers = source.pos.findInRange(FIND_STRUCTURES, 2, {
                    filter: (structure) => {
                        return structure.structureType == STRUCTURE_CONTAINER;
                    }
                });
                
                if(containers.length > 0) {
                    var targetContainer = containers[0];
                    
                    // Move to container position if not already there
                    // 如果不在容器位置则移动到容器上
                    if(!creep.pos.isEqualTo(targetContainer.pos)) {
                        creep.say('🚶 to box');
                        creep.moveTo(targetContainer.pos, {visualizePathStyle: {stroke: '#ffaa00'}});
                    } else {
                        // Already on container, harvest from source
                        // 已经在容器上，从能量源采集
                        creep.say('⛏️ harvest');
                        if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
                        }
                    }
                } else {
                    // No container found, harvest normally
                    // 没有找到容器，正常采集
                    creep.say('⛏️ harvest');
                    if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
                    }
                }
            }
        }
	}
};

module.exports = roleHarvester0;