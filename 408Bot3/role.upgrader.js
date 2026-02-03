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
            // Upgrading state: upgrade the controller while staying on container
            // 中文: 升级状态：在容器上升级控制器
            var controller = creep.room.controller;
            
            if(controller) {
                // Check if controller containers need repair (below 90% health)
                // 检查控制器附近的容器是否需要修复（生命值低于90%）
                var containersToRepair = controller.pos.findInRange(FIND_STRUCTURES, 2, {
                    filter: (structure) => {
                        return structure.structureType == STRUCTURE_CONTAINER &&
                               structure.hits < structure.hitsMax * 0.9;
                    }
                });
                
                if(containersToRepair.length > 0) {
                    creep.say('🔧 repair');
                    var targetContainer = containersToRepair[0];
                    if(creep.repair(targetContainer) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(targetContainer, {visualizePathStyle: {stroke: '#00ff00'}});
                    }
                }
                // If no repair needed, proceed with normal upgrade logic
                // 如果不需要修复，继续正常的升级逻辑
                else {
                    // Find container near controller
                    // 寻找控制器附近的容器
                    var containers = controller.pos.findInRange(FIND_STRUCTURES, 2, {
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
                            creep.moveTo(targetContainer.pos, {visualizePathStyle: {stroke: '#ffffff'}});
                        } else {
                            // Already on container, upgrade controller
                            // 已经在容器上，升级控制器
                            creep.say('⚡ upgrade');
                            if(creep.upgradeController(controller) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(controller, {visualizePathStyle: {stroke: '#ffffff'}});
                            }
                        }
                    } else {
                        // No container found, upgrade normally
                        // 没有找到容器，正常升级
                        creep.say('⚡ upgrade');
                        if(creep.upgradeController(controller) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(controller, {visualizePathStyle: {stroke: '#ffffff'}});
                        }
                    }
                }
            }
        }
        else {
            // Harvesting state: get energy from containers first, then sources
            // 中文: 采集状态：优先从容器获取能量，然后从能量源采集
            
            var controller = creep.room.controller;
            
            if(controller) {
                // Check if there are any containers near controller (regardless of energy)
                // 检查控制器附近是否有容器（不管是否有能量）
                var allContainers = controller.pos.findInRange(FIND_STRUCTURES, 2, {
                    filter: (structure) => {
                        return structure.structureType == STRUCTURE_CONTAINER;
                    }
                });
                
                if(allContainers.length > 0) {
                    // Priority 1: Get energy from containers with energy
                    // 优先级1：从有能量的容器获取能量
                    var containersWithEnergy = allContainers.filter(container => {
                        return container.store[RESOURCE_ENERGY] > 0;
                    });
                    
                    if(containersWithEnergy.length > 0) {
                        var targetContainer = containersWithEnergy[0];
                        creep.say('📦 container');
                        
                        // Stay on the container
                        // 停留在容器上
                        if(creep.pos.isEqualTo(targetContainer.pos)) {
                            // Already on container, just withdraw
                            // 已经在容器上，直接取能量
                            creep.say('� withdraw');
                            creep.withdraw(targetContainer, RESOURCE_ENERGY);
                        } else {
                            // Move to container position
                            // 移动到容器位置
                            creep.say('🚶 to box');
                            if(creep.withdraw(targetContainer, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(targetContainer.pos, {visualizePathStyle: {stroke: '#ffaa00'}});
                            }
                        }
                    }
                    // Priority 2: If containers exist but have no energy, wait
                    // 优先级2：如果有容器但容器没有能量，则等待
                    else {
                        var targetContainer = allContainers[0];
                        creep.say('⏳ wait');
                        
                        // Move to container position and wait
                        // 移动到容器位置并等待
                        if(!creep.pos.isEqualTo(targetContainer.pos)) {
                            creep.moveTo(targetContainer.pos, {visualizePathStyle: {stroke: '#ffaa00'}});
                        }
                    }
                }
                // Priority 3: If no containers exist, harvest from sources
                // 优先级3：如果没有容器，从能量源采集
                else {
                    var sources = creep.room.find(FIND_SOURCES);
                    creep.say('⛏️ harvest');
                    if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#ffaa00'}});
                    }
                }
            }
            // Fallback: harvest from sources if no controller
            // 备选：如果没有控制器则从能量源采集
            else {
                var sources = creep.room.find(FIND_SOURCES);
                creep.say('⛏️ harvest');
                if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#ffaa00'}});
                }
            }
        }
	}
};

module.exports = roleUpgrader;