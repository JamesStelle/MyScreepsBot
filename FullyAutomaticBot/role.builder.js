var roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep) {
        // Initialize state if not exists
        // 初始化状态（如果不存在）
        if (!creep.memory.state) {
            creep.memory.state = 'harvesting';
        }
        
		// Check energy levels and switch states
		// 中文: 检查能量水平并切换状态
	    if(creep.memory.state !== 'harvesting' && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.state = 'harvesting';
            creep.say('🔄 harvest');
	    }
	    if(creep.memory.state === 'harvesting' && creep.store.getFreeCapacity() == 0) {
	        // Determine next state based on available tasks
	        // 根据可用任务确定下一个状态
	        var constructionSites = creep.room.find(FIND_CONSTRUCTION_SITES);
	        var repairTargets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return structure.hits < structure.hitsMax * 0.9;
                }
            });
            
            if(constructionSites.length > 0) {
                creep.memory.state = 'building';
                creep.say('🚧 build');
            } else if(repairTargets.length > 0) {
                creep.memory.state = 'repairing';
                creep.say('🔧 repair');
            } else {
                creep.memory.state = 'upgrading';
                creep.say('⚡ upgrade');
            }
	    }
        
        // Execute current state
        // 执行当前状态
        switch(creep.memory.state) {
            case 'harvesting':
                this.harvestEnergy(creep);
                break;
            case 'building':
                this.buildStructures(creep);
                break;
            case 'repairing':
                this.repairStructures(creep);
                break;
            case 'upgrading':
                this.upgradeController(creep);
                break;
            default:
                creep.memory.state = 'harvesting';
                break;
        }
    },
    
    /**
     * Harvest energy from containers or sources
     * 从容器或能量源采集能量
     */
    harvestEnergy: function(creep) {
        // Priority 1: Get energy from controller containers
        // 优先级1：从控制器附近的容器获取能量
        var controller = creep.room.controller;
        var controllerContainers = [];
        
        if(controller) {
            controllerContainers = controller.pos.findInRange(FIND_STRUCTURES, 2, {
                filter: (structure) => {
                    return structure.structureType == STRUCTURE_CONTAINER &&
                           structure.store[RESOURCE_ENERGY] > 0;
                }
            });
        }
        
        if(controllerContainers.length > 0) {
            creep.say('📦 controller');
            if(creep.withdraw(controllerContainers[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(controllerContainers[0], {visualizePathStyle: {stroke: '#ffaa00'}});
            }
        }
        // Priority 2: Get energy from other containers if no controller containers
        // 优先级2：如果控制器附近没有容器，从其他容器获取能量
        else {
            var containers = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return structure.structureType == STRUCTURE_CONTAINER &&
                           structure.store[RESOURCE_ENERGY] > 0;
                }
            });
            
            if(containers.length > 0) {
                creep.say('📦 container');
                if(creep.withdraw(containers[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(containers[0], {visualizePathStyle: {stroke: '#ffaa00'}});
                }
            }
            // Priority 3: Harvest from sources if no containers available
            // 优先级3：如果没有容器可用，从能量源采集
            else {
                var sources = creep.room.find(FIND_SOURCES);
                creep.say('⛏️ harvest');
                if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#ffaa00'}});
                }
            }
        }
    },
    
    /**
     * Build construction sites
     * 建造施工地点
     */
    buildStructures: function(creep) {
        var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
        if(targets.length > 0) {
            creep.say('🚧 build');
            if(creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
            }
        } else {
            // No construction sites, switch to repair or upgrade
            // 没有建造任务，切换到修复或升级
            var repairTargets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return structure.hits < structure.hitsMax * 0.9;
                }
            });
            
            if(repairTargets.length > 0) {
                creep.memory.state = 'repairing';
                creep.say('🔧 repair');
            } else {
                creep.memory.state = 'upgrading';
                creep.say('⚡ upgrade');
            }
        }
    },
    
    /**
     * Repair damaged structures
     * 修复受损建筑
     */
    repairStructures: function(creep) {
        // Check if we're already repairing a specific target
        // 检查是否已经在修理特定目标
        var currentTarget = null;
        if (creep.memory.repairTargetId) {
            currentTarget = Game.getObjectById(creep.memory.repairTargetId);
            // Check if current target still needs repair (below 100%)
            // 检查当前目标是否仍需修理（低于100%）
            if (currentTarget && currentTarget.hits >= currentTarget.hitsMax) {
                // Target is fully repaired, clear it
                // 目标已完全修复，清除它
                delete creep.memory.repairTargetId;
                currentTarget = null;
            }
        }
        
        // If no current target or target is gone, find a new one
        // 如果没有当前目标或目标消失，寻找新目标
        if (!currentTarget) {
            var repairTargets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    // Only repair if health is below 90%
                    // 只有健康度低于90%时才修复
                    return structure.hits < structure.hitsMax * 0.9;
                }
            });
            
            if (repairTargets.length > 0) {
                // Find the structure with lowest hit percentage
                // 寻找血量百分比最低的建筑
                currentTarget = repairTargets.reduce((min, structure) => {
                    return (structure.hits / structure.hitsMax) < (min.hits / min.hitsMax) ? structure : min;
                });
                // Remember this target
                // 记住这个目标
                creep.memory.repairTargetId = currentTarget.id;
            }
        }
        
        // Repair the current target
        // 修理当前目标
        if (currentTarget) {
            creep.say('🔧 repair');
            if (creep.repair(currentTarget) == ERR_NOT_IN_RANGE) {
                creep.moveTo(currentTarget, {visualizePathStyle: {stroke: '#00ff00'}});
            }
        } else {
            // No repair targets, switch to upgrade
            // 没有修复目标，切换到升级
            creep.memory.state = 'upgrading';
            creep.say('⚡ upgrade');
        }
    },
    
    /**
     * Upgrade controller
     * 升级控制器
     */
    upgradeController: function(creep) {
        var controller = creep.room.controller;
        if(controller) {
            // Check if creep has energy, if not, get from controller containers
            // 检查爬虫是否有能量，如果没有，从控制器附近的容器取能量
            if(creep.store[RESOURCE_ENERGY] == 0) {
                var controllerContainers = controller.pos.findInRange(FIND_STRUCTURES, 2, {
                    filter: (structure) => {
                        return structure.structureType == STRUCTURE_CONTAINER &&
                               structure.store[RESOURCE_ENERGY] > 0;
                    }
                });
                
                if(controllerContainers.length > 0) {
                    creep.say('📦 get energy');
                    if(creep.withdraw(controllerContainers[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(controllerContainers[0], {visualizePathStyle: {stroke: '#ffaa00'}});
                    }
                    return; // Exit early to get energy first
                } else {
                    // No energy available, switch back to harvesting
                    // 没有可用能量，切换回采集状态
                    creep.memory.state = 'harvesting';
                    creep.say('🔄 harvest');
                    return;
                }
            }
            
            // Upgrade controller
            // 升级控制器
            creep.say('⚡ upgrade');
            if(creep.upgradeController(controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(controller, {visualizePathStyle: {stroke: '#ffffff'}});
            }
        }
    }
};

module.exports = roleBuilder;