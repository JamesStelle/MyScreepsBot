var runLink = {
    
    /** 
     * Main run function for Link management
     * Link 管理的主运行函数
     */
    run: function() {
        // Loop through all my rooms
        // 轮循环我的房间
        for (let roomName in Game.rooms) {
            const room = Game.rooms[roomName];
            
            // Check if room is mine
            // 检查房间是否属于我
            if (room.controller && room.controller.my) {
                this.manageRoomLinks(room);
            }
        }
    },
    
    /**
     * Manage Links for a specific room
     * 管理特定房间的 Link
     */
    manageRoomLinks: function(room) {
        // Check if room level is 5 or higher
        // 检查房间等级是否达到5级
        if (room.controller.level < 5) {
            return;
        }
        
        // Find all Links in the room
        // 寻找房间内所有的 Link
        const allLinks = room.find(FIND_MY_STRUCTURES, {
            filter: (structure) => structure.structureType === STRUCTURE_LINK
        });
        
        // Check if there are at least 2 Links
        // 检查是否存在至少两个 Link
        if (allLinks.length < 2) {
            return;
        }
        
        // Find source Links (linkFrom)
        // 寻找能量源附近的 Link (linkFrom)
        const linkFroms = this.findSourceLinks(room);
        
        // Find destination Links (linkTo)
        // 寻找目标 Link (linkTo)
        const linkTos = this.findDestinationLinks(room);
        
        // Perform energy transfer
        // 执行能量传输
        this.transferEnergy(linkFroms, linkTos);
    },
    
    /**
     * Find Links near sources (within 3 range)
     * 寻找能量源附近的 Link（3格范围内）
     */
    findSourceLinks: function(room) {
        const sources = room.find(FIND_SOURCES);
        const sourceLinks = [];
        
        sources.forEach(source => {
            // Find Links within 3 range of each source
            // 寻找每个能量源3格范围内的 Link
            const nearbyLinks = source.pos.findInRange(FIND_MY_STRUCTURES, 3, {
                filter: (structure) => structure.structureType === STRUCTURE_LINK
            });
            
            nearbyLinks.forEach(link => {
                // Add source reference for tracking
                // 添加能量源引用以便跟踪
                link.sourceRef = source;
                sourceLinks.push(link);
            });
        });
        
        return sourceLinks;
    },
    
    /**
     * Find Links near controller and storage (within 2 range)
     * 寻找控制器和 storage 附近的 Link（2格范围内）
     */
    findDestinationLinks: function(room) {
        const destinationLinks = [];
        
        // Find Links near controller (within 2 range)
        // 寻找控制器2格范围内的 Link
        if (room.controller) {
            const controllerLinks = room.controller.pos.findInRange(FIND_MY_STRUCTURES, 2, {
                filter: (structure) => structure.structureType === STRUCTURE_LINK
            });
            
            controllerLinks.forEach(link => {
                link.destinationType = 'controller';
                destinationLinks.push(link);
            });
        }
        
        // Find Links near storage (within 2 range)
        // 寻找 storage 2格范围内的 Link
        if (room.storage) {
            const storageLinks = room.storage.pos.findInRange(FIND_MY_STRUCTURES, 2, {
                filter: (structure) => structure.structureType === STRUCTURE_LINK
            });
            
            storageLinks.forEach(link => {
                link.destinationType = 'storage';
                destinationLinks.push(link);
            });
        }
        
        return destinationLinks;
    },
    
    /**
     * Transfer energy from source Links to destination Links
     * 从能量源 Link 向目标 Link 传输能量
     */
    transferEnergy: function(linkFroms, linkTos) {
        linkFroms.forEach(linkFrom => {
            // Check if linkFrom is full (800 energy)
            // 检查 linkFrom 是否满能量（800能量）
            if (linkFrom.store[RESOURCE_ENERGY] < 800) {
                return;
            }
            
            // Check cooldown
            // 检查冷却时间
            if (linkFrom.cooldown > 0) {
                return;
            }
            
            // Find the best destination Link
            // 寻找最佳目标 Link
            const bestLinkTo = this.findBestDestination(linkFrom, linkTos);
            
            if (bestLinkTo) {
                // Transfer energy
                // 传输能量
                const result = linkFrom.transferEnergy(bestLinkTo);
                
                if (result === OK) {
                    // Log successful transfer
                    // 记录成功传输
                    console.log(`Link transfer: ${linkFrom.pos} -> ${bestLinkTo.pos} (800 energy)`);
                } else {
                    // Log transfer error
                    // 记录传输错误
                    console.log(`Link transfer failed: ${result}`);
                }
            }
        });
    },
    
    /**
     * Find the best destination Link for energy transfer
     * 寻找能量传输的最佳目标 Link
     */
    findBestDestination: function(linkFrom, linkTos) {
        if (linkTos.length === 0) {
            return null;
        }
        
        // Filter Links that can receive energy
        // 筛选可以接收能量的 Link
        const availableLinks = linkTos.filter(linkTo => {
            return linkTo.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
        });
        
        if (availableLinks.length === 0) {
            return null;
        }
        
        // Priority 1: Controller Links (for upgrading)
        // 优先级1：控制器附近的 Link（用于升级）
        const controllerLinks = availableLinks.filter(link => link.destinationType === 'controller');
        if (controllerLinks.length > 0) {
            // Return the one with most free capacity
            // 返回空余容量最大的
            return controllerLinks.reduce((best, current) => {
                return current.store.getFreeCapacity(RESOURCE_ENERGY) > best.store.getFreeCapacity(RESOURCE_ENERGY) ? current : best;
            });
        }
        
        // Priority 2: Storage Links (for storage)
        // 优先级2：Storage 附近的 Link（用于存储）
        const storageLinks = availableLinks.filter(link => link.destinationType === 'storage');
        if (storageLinks.length > 0) {
            // Return the one with most free capacity
            // 返回空余容量最大的
            return storageLinks.reduce((best, current) => {
                return current.store.getFreeCapacity(RESOURCE_ENERGY) > best.store.getFreeCapacity(RESOURCE_ENERGY) ? current : best;
            });
        }
        
        // No suitable destination found
        // 没有找到合适的目标
        return null;
    }
};

module.exports = runLink;