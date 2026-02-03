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
            
            // Priority 1: Extensions
            // 优先级1：扩展结构
            var extensions = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return structure.structureType == STRUCTURE_EXTENSION &&
                           structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                }
            });
            
            if(extensions.length > 0) {
                if(creep.transfer(extensions[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(extensions[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
            // Priority 2: Spawns
            // 优先级2：孵化器
            else {
                var spawns = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return structure.structureType == STRUCTURE_SPAWN &&
                               structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                    }
                });
                
                if(spawns.length > 0) {
                    if(creep.transfer(spawns[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(spawns[0], {visualizePathStyle: {stroke: '#ffffff'}});
                    }
                }
                // Priority 3: Transfer to containers near controller
                // 优先级3：向控制器附近的容器传输能量
                else {
                    var controller = creep.room.controller;
                    var controllerContainers = [];
                    
                    if(controller) {
                        controllerContainers = controller.pos.findInRange(FIND_STRUCTURES, 2, {
                            filter: (structure) => {
                                return structure.structureType == STRUCTURE_CONTAINER &&
                                       structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0 &&
                                       structure.store[RESOURCE_ENERGY] < structure.store.getCapacity() * 0.8;
                            }
                        });
                    }
                    
                    if(controllerContainers.length > 0) {
                        if(creep.transfer(controllerContainers[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(controllerContainers[0], {visualizePathStyle: {stroke: '#ffffff'}});
                        }
                    }
                    // Priority 4: Towers
                    // 优先级4：塔楼
                    else {
                        var towers = creep.room.find(FIND_STRUCTURES, {
                            filter: (structure) => {
                                return structure.structureType == STRUCTURE_TOWER &&
                                       structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                            }
                        });
                        
                        if(towers.length > 0) {
                            if(creep.transfer(towers[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(towers[0], {visualizePathStyle: {stroke: '#ffffff'}});
                            }
                        }
                        // Priority 5: Transfer to containers near controller (no conditions)
                        // 优先级5：向控制器附近的容器传输能量（无条件限制）
                        else {
                            var controller = creep.room.controller;
                            var controllerContainers = [];
                            
                            if(controller) {
                                controllerContainers = controller.pos.findInRange(FIND_STRUCTURES, 2, {
                                    filter: (structure) => {
                                        return structure.structureType == STRUCTURE_CONTAINER &&
                                               structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                                    }
                                });
                            }
                            
                            if(controllerContainers.length > 0) {
                                if(creep.transfer(controllerContainers[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                    creep.moveTo(controllerContainers[0], {visualizePathStyle: {stroke: '#ffffff'}});
                                }
                            }
                            else {
                                // No targets available, wait
                                // 中文: 没有可用目标，等待
                                creep.say('⏳ wait');
                            }
                        }
                    }
                }
            }
        }
        else {
            // Collecting state: gather energy with strict priority order
            // 中文: 收集状态：按严格优先级顺序收集能量
            
            // Priority 1: Look for dropped resources with energy >= 50
            // 优先级1：寻找掉落的资源，能量 >= 50
            var droppedResources = creep.room.find(FIND_DROPPED_RESOURCES, {
                filter: (resource) => {
                    return resource.resourceType == RESOURCE_ENERGY && resource.amount >= 50;
                }
            });
            
            if(droppedResources.length > 0) {
                // Sort by amount (highest first), then by distance (closest first)
                // 按资源量排序（最高优先），然后按距离排序（最近优先）
                droppedResources.sort((a, b) => {
                    if(b.amount !== a.amount) {
                        return b.amount - a.amount;
                    }
                    return creep.pos.getRangeTo(a) - creep.pos.getRangeTo(b);
                });
                
                creep.say('⚡ pickup');
                if(creep.pickup(droppedResources[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(droppedResources[0], {visualizePathStyle: {stroke: '#ffff00'}});
                }
            }
            // Priority 2: Look for tombstones with energy >= 50
            // 优先级2：寻找墓碑中的能量 >= 50
            else {
                var tombstones = creep.room.find(FIND_TOMBSTONES, {
                    filter: (tombstone) => {
                        return tombstone.store[RESOURCE_ENERGY] >= 50;
                    }
                });
                
                if(tombstones.length > 0) {
                    // Sort by amount (highest first), then by distance (closest first)
                    // 按资源量排序（最高优先），然后按距离排序（最近优先）
                    tombstones.sort((a, b) => {
                        if(b.store[RESOURCE_ENERGY] !== a.store[RESOURCE_ENERGY]) {
                            return b.store[RESOURCE_ENERGY] - a.store[RESOURCE_ENERGY];
                        }
                        return creep.pos.getRangeTo(a) - creep.pos.getRangeTo(b);
                    });
                    
                    creep.say('💀 tomb');
                    if(creep.withdraw(tombstones[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(tombstones[0], {visualizePathStyle: {stroke: '#ff0000'}});
                    }
                }
                // Priority 3: Look for ruins with energy >= 50
                // 优先级3：寻找废墟中的能量 >= 50
                else {
                    var ruins = creep.room.find(FIND_RUINS, {
                        filter: (ruin) => {
                            return ruin.store[RESOURCE_ENERGY] >= 50;
                        }
                    });
                    
                    if(ruins.length > 0) {
                        // Sort by amount (highest first), then by distance (closest first)
                        // 按资源量排序（最高优先），然后按距离排序（最近优先）
                        ruins.sort((a, b) => {
                            if(b.store[RESOURCE_ENERGY] !== a.store[RESOURCE_ENERGY]) {
                                return b.store[RESOURCE_ENERGY] - a.store[RESOURCE_ENERGY];
                            }
                            return creep.pos.getRangeTo(a) - creep.pos.getRangeTo(b);
                        });
                        
                        creep.say('🏚️ ruins');
                        if(creep.withdraw(ruins[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(ruins[0], {visualizePathStyle: {stroke: '#8B4513'}});
                        }
                    }
                    // Priority 3.5: Look for Links with energy near Storage
                    // 优先级3.5：寻找Storage两格范围内有能量的Link
                    else {
                        var storage = creep.room.storage;
                        var linksNearStorage = [];
                        
                        if(storage) {
                            linksNearStorage = storage.pos.findInRange(FIND_STRUCTURES, 2, {
                                filter: (structure) => {
                                    return structure.structureType == STRUCTURE_LINK &&
                                           structure.store[RESOURCE_ENERGY] > 0;
                                }
                            });
                        }
                        
                        if(linksNearStorage.length > 0) {
                            // Sort by amount (highest first), then by distance (closest first)
                            // 按资源量排序（最高优先），然后按距离排序（最近优先）
                            linksNearStorage.sort((a, b) => {
                                if(b.store[RESOURCE_ENERGY] !== a.store[RESOURCE_ENERGY]) {
                                    return b.store[RESOURCE_ENERGY] - a.store[RESOURCE_ENERGY];
                                }
                                return creep.pos.getRangeTo(a) - creep.pos.getRangeTo(b);
                            });
                            
                            creep.say('🔗 link');
                            if(creep.withdraw(linksNearStorage[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(linksNearStorage[0], {visualizePathStyle: {stroke: '#00ffff'}});
                            }
                        }
                        // Priority 4: Look for containers with energy near sources
                        // 优先级4：寻找能量源附近有能量的容器
                        else {
                        var sources = creep.room.find(FIND_SOURCES);
                        var containers = [];
                        
                        // Find containers near all sources
                        // 寻找所有能量源附近的容器
                        sources.forEach(source => {
                            var sourceContainers = source.pos.findInRange(FIND_STRUCTURES, 2, {
                                filter: (structure) => {
                                    return structure.structureType == STRUCTURE_CONTAINER && 
                                           structure.store[RESOURCE_ENERGY] > 0;
                                }
                            });
                            containers = containers.concat(sourceContainers);
                        });
                        
                        if(containers.length > 0) {
                            // Remove duplicates (in case same container is near multiple sources)
                            // 去除重复（防止同一容器靠近多个能量源）
                            var uniqueContainers = containers.filter((container, index, self) => 
                                index === self.findIndex(c => c.id === container.id)
                            );
                            
                            // Sort by amount (highest first), then by distance (closest first)
                            // 按资源量排序（最高优先），然后按距离排序（最近优先）
                            uniqueContainers.sort((a, b) => {
                                if(b.store[RESOURCE_ENERGY] !== a.store[RESOURCE_ENERGY]) {
                                    return b.store[RESOURCE_ENERGY] - a.store[RESOURCE_ENERGY];
                                }
                                return creep.pos.getRangeTo(a) - creep.pos.getRangeTo(b);
                            });
                            
                            creep.say('📦 container');
                            if(creep.withdraw(uniqueContainers[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(uniqueContainers[0], {visualizePathStyle: {stroke: '#ffaa00'}});
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
	}
};

module.exports = roleCarrier;