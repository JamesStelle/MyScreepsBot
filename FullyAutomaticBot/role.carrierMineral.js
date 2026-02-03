var roleCarrierMineral = {

    /** @param {Creep} creep **/
    run: function(creep) {
        // State machine: switch between collecting and delivering minerals
        // 中文: 状态机：在收集和传输矿物之间切换
        
        // If creep is empty, switch to collecting state
        // 中文: 如果爬虫存储为空，切换到收集状态
        if(creep.store.getUsedCapacity() == 0) {
            creep.memory.delivering = false;
            creep.say('🔍 collect');
        }
        // If creep is full, switch to delivering state
        // 中文: 如果爬虫存储满了，切换到传输状态
        if(creep.store.getFreeCapacity() == 0) {
            creep.memory.delivering = true;
            creep.say('🚚 deliver');
        }

        // Execute current state
        // 中文: 执行当前状态
        if(creep.memory.delivering) {
            // Delivering state: transfer minerals to storage, terminal, or container (excluding source, extractor, and controller containers)
            // 中文: 传输状态：向存储、终端或容器传输矿物（排除source容器、extractor容器和控制器容器）
            var targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    if (structure.structureType == STRUCTURE_STORAGE ||
                        structure.structureType == STRUCTURE_TERMINAL) {
                        return structure.store.getFreeCapacity() > 0;
                    }
                    
                    if (structure.structureType == STRUCTURE_CONTAINER) {
                        // Check if container is not within 2 range of sources
                        // 检查容器是否不在source两格范围内
                        var sources = creep.room.find(FIND_SOURCES);
                        var isNearSource = false;
                        
                        for (let source of sources) {
                            if (structure.pos.getRangeTo(source) <= 2) {
                                isNearSource = true;
                                break;
                            }
                        }
                        
                        // Check if container is not within 2 range of extractors
                        // 检查容器是否不在extractor两格范围内
                        var extractors = creep.room.find(FIND_STRUCTURES, {
                            filter: (s) => s.structureType == STRUCTURE_EXTRACTOR
                        });
                        var isNearExtractor = false;
                        
                        for (let extractor of extractors) {
                            if (structure.pos.getRangeTo(extractor) <= 2) {
                                isNearExtractor = true;
                                break;
                            }
                        }
                        
                        // Check if container is not within 2 range of controller
                        // 检查容器是否不在控制器两格范围内
                        var controller = creep.room.controller;
                        var isNearController = false;
                        
                        if (controller && structure.pos.getRangeTo(controller) <= 2) {
                            isNearController = true;
                        }
                        
                        // Only use containers that are NOT within 2 range of sources, extractors, controller, and have free capacity
                        // 只使用不在source两格范围内、不在extractor两格范围内、不在控制器两格范围内且有空间的容器
                        return !isNearSource && !isNearExtractor && !isNearController && structure.store.getFreeCapacity() > 0;
                    }
                    
                    return false;
                }
            });
            
            if(targets.length > 0) {
                // Transfer the first mineral type found in creep's store
                // 传输爬虫存储中找到的第一种矿物类型
                var mineralTypes = Object.keys(creep.store).filter(resourceType => 
                    resourceType !== RESOURCE_ENERGY && creep.store[resourceType] > 0
                );
                
                // Check for compounds (合成物) first
                // 优先检查合成物
                var compounds = mineralTypes.filter(resourceType => {
                    // Common compounds in Screeps including ops
                    // Screeps中常见的合成物包括ops
                    return ['OH', 'ZK', 'UL', 'G', 'LO', 'LH', 'ZO', 'ZH', 'GH', 'GO', 
                           'UH', 'UO', 'KH', 'KO', 'LH2O', 'KHO2', 'LHOS', 'LHO2', 
                           'KHOS', 'KH2O', 'GH2O', 'GHO2', 'GHOS', 'UH2O', 'UHO2', 
                           'UHOS', 'ZH2O', 'ZHO2', 'ZHOS', 'XUH2O', 'XUHO2', 'XLH2O', 
                           'XLHO2', 'XZH2O', 'XZHO2', 'XKH2O', 'XKHO2', 'XGH2O', 
                           'XGHO2', 'ops'].includes(resourceType);
                });
                
                if(compounds.length > 0) {
                    var resourceType = compounds[0];
                    if(creep.transfer(targets[0], resourceType) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                    }
                } else if(mineralTypes.length > 0) {
                    var resourceType = mineralTypes[0];
                    if(creep.transfer(targets[0], resourceType) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                    }
                }
            }
            else {
                // No targets available, wait
                // 中文: 没有可用目标，等待
                creep.say('⏳ wait');
            }
        }
        else {
            // Collecting state: gather minerals from tombstones, ruins, dropped resources or containers
            // 中文: 收集状态：从墓碑、废墟、掉落资源或容器收集矿物
            
            // Priority 1: Look for tombstones with minerals or compounds - prioritize by content value
            // 优先级1：寻找墓碑中的矿物或合成物 - 按内容价值优先
            var tombstones = creep.room.find(FIND_TOMBSTONES, {
                filter: (tombstone) => {
                    // Check if tombstone has any minerals or compounds (non-energy resources)
                    // 检查墓碑是否有任何矿物或合成物（非能量资源）
                    return Object.keys(tombstone.store).some(resourceType => 
                        resourceType !== RESOURCE_ENERGY && tombstone.store[resourceType] > 0
                    );
                }
            });
            
            if(tombstones.length > 0) {
                creep.say('💀 tomb');
                
                // Find the best tombstone: prioritize tombstones with compounds over basic minerals
                // 找到最佳墓碑：优先选择有合成物的墓碑而非基础矿物
                var bestTombstone = null;
                var bestResource = null;
                
                // First pass: look for tombstones with compounds
                // 第一轮：寻找有合成物的墓碑
                for(let tombstone of tombstones) {
                    var resourceTypes = Object.keys(tombstone.store).filter(resourceType => 
                        resourceType !== RESOURCE_ENERGY && tombstone.store[resourceType] > 0
                    );
                    
                    var compounds = resourceTypes.filter(resourceType => {
                        return ['OH', 'ZK', 'UL', 'G', 'LO', 'LH', 'ZO', 'ZH', 'GH', 'GO', 
                               'UH', 'UO', 'KH', 'KO', 'LH2O', 'KHO2', 'LHOS', 'LHO2', 
                               'KHOS', 'KH2O', 'GH2O', 'GHO2', 'GHOS', 'UH2O', 'UHO2', 
                               'UHOS', 'ZH2O', 'ZHO2', 'ZHOS', 'XUH2O', 'XUHO2', 'XLH2O', 
                               'XLHO2', 'XZH2O', 'XZHO2', 'XKH2O', 'XKHO2', 'XGH2O', 
                               'XGHO2', 'ops'].includes(resourceType);
                    });
                    
                    if(compounds.length > 0) {
                        bestTombstone = tombstone;
                        bestResource = compounds[0];
                        break; // Found compound, use this tombstone
                    }
                }
                
                // If no compounds found, use first tombstone with basic minerals
                // 如果没找到合成物，使用第一个有基础矿物的墓碑
                if(!bestTombstone) {
                    bestTombstone = tombstones[0];
                    var resourceTypes = Object.keys(bestTombstone.store).filter(resourceType => 
                        resourceType !== RESOURCE_ENERGY && bestTombstone.store[resourceType] > 0
                    );
                    bestResource = resourceTypes[0];
                }
                
                if(bestTombstone && bestResource) {
                    if(creep.withdraw(bestTombstone, bestResource) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(bestTombstone, {visualizePathStyle: {stroke: '#ff0000'}});
                    }
                }
            }
            // Priority 2: Look for ruins with minerals - prioritize by content value
            // 优先级2：寻找废墟中的矿物 - 按内容价值优先
            else {
                var ruins = creep.room.find(FIND_RUINS, {
                    filter: (ruin) => {
                        // Check if ruin has any minerals (non-energy resources)
                        // 检查废墟是否有任何矿物（非能量资源）
                        return Object.keys(ruin.store).some(resourceType => 
                            resourceType !== RESOURCE_ENERGY && ruin.store[resourceType] > 0
                        );
                    }
                });
                
                if(ruins.length > 0) {
                    creep.say('🏚️ ruins');
                    
                    // Find the best ruin: prioritize ruins with compounds over basic minerals
                    // 找到最佳废墟：优先选择有合成物的废墟而非基础矿物
                    var bestRuin = null;
                    var bestResource = null;
                    var isCompound = false;
                    
                    // First pass: look for ruins with compounds
                    // 第一轮：寻找有合成物的废墟
                    for(let ruin of ruins) {
                        var mineralTypes = Object.keys(ruin.store).filter(resourceType => 
                            resourceType !== RESOURCE_ENERGY && ruin.store[resourceType] > 0
                        );
                        
                        var compounds = mineralTypes.filter(resourceType => {
                            return ['OH', 'ZK', 'UL', 'G', 'LO', 'LH', 'ZO', 'ZH', 'GH', 'GO', 
                                   'UH', 'UO', 'KH', 'KO', 'LH2O', 'KHO2', 'LHOS', 'LHO2', 
                                   'KHOS', 'KH2O', 'GH2O', 'GHO2', 'GHOS', 'UH2O', 'UHO2', 
                                   'UHOS', 'ZH2O', 'ZHO2', 'ZHOS', 'XUH2O', 'XUHO2', 'XLH2O', 
                                   'XLHO2', 'XZH2O', 'XZHO2', 'XKH2O', 'XKHO2', 'XGH2O', 
                                   'XGHO2', 'ops'].includes(resourceType);
                        });
                        
                        if(compounds.length > 0) {
                            bestRuin = ruin;
                            bestResource = compounds[0];
                            isCompound = true;
                            break; // Found compound, use this ruin
                        }
                    }
                    
                    // If no compounds found, use first ruin with basic minerals
                    // 如果没找到合成物，使用第一个有基础矿物的废墟
                    if(!bestRuin) {
                        bestRuin = ruins[0];
                        var mineralTypes = Object.keys(bestRuin.store).filter(resourceType => 
                            resourceType !== RESOURCE_ENERGY && bestRuin.store[resourceType] > 0
                        );
                        bestResource = mineralTypes[0];
                    }
                    
                    if(bestRuin && bestResource) {
                        if(creep.withdraw(bestRuin, bestResource) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(bestRuin, {visualizePathStyle: {stroke: '#8B4513'}});
                        }
                    }
                }
                // Priority 3: Look for dropped mineral resources or compounds
                // 优先级3：寻找掉落的矿物资源或合成物
                else {
                    var droppedResources = creep.room.find(FIND_DROPPED_RESOURCES, {
                        filter: (resource) => {
                            // Only pick up non-energy resources (minerals and compounds)
                            // 只拾取非能量资源（矿物和合成物）
                            return resource.resourceType !== RESOURCE_ENERGY;
                        }
                    });
                    
                    if(droppedResources.length > 0) {
                        // Prioritize compounds over basic minerals
                        // 优先选择合成物而非基础矿物
                        var compounds = droppedResources.filter(resource => {
                            return ['OH', 'ZK', 'UL', 'G', 'LO', 'LH', 'ZO', 'ZH', 'GH', 'GO', 
                                   'UH', 'UO', 'KH', 'KO', 'LH2O', 'KHO2', 'LHOS', 'LHO2', 
                                   'KHOS', 'KH2O', 'GH2O', 'GHO2', 'GHOS', 'UH2O', 'UHO2', 
                                   'UHOS', 'ZH2O', 'ZHO2', 'ZHOS', 'XUH2O', 'XUHO2', 'XLH2O', 
                                   'XLHO2', 'XZH2O', 'XZHO2', 'XKH2O', 'XKHO2', 'XGH2O', 
                                   'XGHO2', 'ops'].includes(resource.resourceType);
                        });
                        
                        var targetResource = compounds.length > 0 ? compounds[0] : droppedResources[0];
                        creep.say('⚡ pickup');
                        if(creep.pickup(targetResource) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(targetResource, {visualizePathStyle: {stroke: '#ffff00'}});
                        }
                    }
                    // Priority 4: Look for containers with minerals
                    // 优先级4：寻找有矿物的容器
                    else {
                        var containers = creep.room.find(FIND_STRUCTURES, {
                            filter: (structure) => {
                                if(structure.structureType !== STRUCTURE_CONTAINER) return false;
                                // Check if container has any minerals (non-energy resources)
                                // 检查容器是否有任何矿物（非能量资源）
                                return Object.keys(structure.store).some(resourceType => 
                                    resourceType !== RESOURCE_ENERGY && structure.store[resourceType] > 0
                                );
                            }
                        });
                        
                        if(containers.length > 0) {
                            creep.say('📦 carry');
                            // Find mineral types in container
                            var mineralTypes = Object.keys(containers[0].store).filter(resourceType => 
                                resourceType !== RESOURCE_ENERGY && containers[0].store[resourceType] > 0
                            );
                            
                            // Prioritize compounds over basic minerals
                            // 优先选择合成物而非基础矿物
                            var compounds = mineralTypes.filter(resourceType => {
                                return ['OH', 'ZK', 'UL', 'G', 'LO', 'LH', 'ZO', 'ZH', 'GH', 'GO', 
                                       'UH', 'UO', 'KH', 'KO', 'LH2O', 'KHO2', 'LHOS', 'LHO2', 
                                       'KHOS', 'KH2O', 'GH2O', 'GHO2', 'GHOS', 'UH2O', 'UHO2', 
                                       'UHOS', 'ZH2O', 'ZHO2', 'ZHOS', 'XUH2O', 'XUHO2', 'XLH2O', 
                                       'XLHO2', 'XZH2O', 'XZHO2', 'XKH2O', 'XKHO2', 'XGH2O', 
                                       'XGHO2', 'ops'].includes(resourceType);
                            });
                            
                            var targetResource = compounds.length > 0 ? compounds[0] : mineralTypes[0];
                            if(targetResource) {
                                if(creep.withdraw(containers[0], targetResource) == ERR_NOT_IN_RANGE) {
                                    creep.moveTo(containers[0], {visualizePathStyle: {stroke: '#ffaa00'}});
                                }
                            }
                        }
                        // No sources available, show debug info
                        // 中文: 没有可用资源，显示调试信息
                        else {
                            var used = creep.store.getUsedCapacity();
                            var capacity = creep.store.getCapacity();
                            creep.say(`M:${used}/${capacity}`);
                        }
                    }
                }
            }
        }
	}
};

module.exports = roleCarrierMineral;