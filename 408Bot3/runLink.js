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
            
            // Find the best destination Link (must have at least 50 free capacity)
            // 寻找最佳目标 Link（必须至少有50的空余容量）
            const bestLinkTo = this.findBestDestination(linkFrom, linkTos);
            
            if (bestLinkTo) {
                // Transfer energy
                // 传输能量
                const result = linkFrom.transferEnergy(bestLinkTo);
                
                if (result === OK) {
                    // Log successful transfer
                    // 记录成功传输
                    console.log(`Link transfer: ${linkFrom.pos} -> ${bestLinkTo.pos} (${linkFrom.store[RESOURCE_ENERGY]} energy)`);
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
        
        const availableLinks = linkTos.filter(linkTo => {
            const freeCapacity = linkTo.store.getFreeCapacity(RESOURCE_ENERGY);
            return freeCapacity >= 50;
        });
        
        if (availableLinks.length === 0) {
            return null;
        }
        
        availableLinks.sort((a, b) => {
            return a.store[RESOURCE_ENERGY] - b.store[RESOURCE_ENERGY];
        });
        return availableLinks[0];
    }
};

module.exports = runLink;
