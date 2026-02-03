// runRoom.js
// Safe require function with error handling
// 安全的 require 函数，带错误处理
function safeRequire(moduleName) {
    try {
        return require(moduleName);
    } catch (error) {
        console.log(`Warning: Failed to require ${moduleName}: ${error}`);
        return null;
    }
}

// Load room modules with error handling
// 使用错误处理加载房间模块
const roomE**N** = safeRequire('E**N**');

// Room management mapping
// 房间管理映射
const roomModules = {
    'E**N**': roomE**N**
    // Add more rooms here as needed
    // 根据需要在此添加更多房间
    // 'E40N8': safeRequire('E40N8'),
    // 'E39N9': safeRequire('E39N9')
};

module.exports = {
    run: function() {
        // Execute room logic with error handling
        // 使用错误处理执行房间逻辑
        
        // Method 1: Execute specific room modules
        // 方法1：执行特定房间模块
        for (let roomName in roomModules) {
            const roomModule = roomModules[roomName];
            
            if (roomModule && typeof roomModule.run === 'function') {
                try {
                    roomModule.run();
                } catch (error) {
                    console.log(`Error running room module ${roomName}: ${error}`);
                    console.log(`Stack trace: ${error.stack}`);
                }
            } else if (roomModule === null) {
                // Module failed to load, already logged in safeRequire
                // 模块加载失败，已在 safeRequire 中记录
            } else {
                console.log(`Warning: Room module ${roomName} does not have a run function`);
            }
        }
        
        // Method 2: Execute logic for all visible rooms (optional)
        // 方法2：为所有可见房间执行逻辑（可选）
        this.runVisibleRooms();
    },
    
    /**
     * Run logic for all visible rooms
     * 为所有可见房间运行逻辑
     */
    runVisibleRooms: function() {
        try {
            for (let roomName in Game.rooms) {
                const room = Game.rooms[roomName];
                
                // Only process rooms we own
                // 只处理我们拥有的房间
                if (room.controller && room.controller.my) {
                    this.runGenericRoomLogic(room);
                }
            }
        } catch (error) {
            console.log(`Error in runVisibleRooms: ${error}`);
        }
    },
    
    /**
     * Generic room logic that can be applied to any room
     * 可应用于任何房间的通用房间逻辑
     */
    runGenericRoomLogic: function(room) {
        try {
            // Add generic room management logic here
            // 在此添加通用房间管理逻辑
            
            // Monitor room energy (memoryCleaner handles creep cleanup globally)
            // 监控房间能量（memoryCleaner 全局处理 creep 清理）
            this.monitorRoomEnergy(room);
            
            // Monitor room structures
            // 监控房间建筑
            this.monitorRoomStructures(room);
            
        } catch (error) {
            console.log(`Error in generic room logic for ${room.name}: ${error}`);
        }
    },
    
    /**
     * Monitor room energy status
     * 监控房间能量状态
     */
    monitorRoomEnergy: function(room) {
        try {
            // Only log every 100 ticks to avoid spam
            // 每100个tick记录一次以避免刷屏
            if (Game.time % 100 === 0) {
                const energyAvailable = room.energyAvailable;
                const energyCapacityAvailable = room.energyCapacityAvailable;
                const percentage = energyCapacityAvailable > 0 ? 
                    Math.round((energyAvailable / energyCapacityAvailable) * 100) : 0;
                
                if (percentage < 20) {
                    console.log(`Warning: Room ${room.name} energy low: ${energyAvailable}/${energyCapacityAvailable} (${percentage}%)`);
                }
            }
        } catch (error) {
            console.log(`Error monitoring room energy for ${room.name}: ${error}`);
        }
    },
    
    /**
     * Monitor room structures for damage or issues
     * 监控房间建筑的损坏或问题
     */
    monitorRoomStructures: function(room) {
        try {
            // Only check every 50 ticks to avoid performance issues
            // 每50个tick检查一次以避免性能问题
            if (Game.time % 50 === 0) {
                // Check for critically damaged structures
                // 检查严重损坏的建筑
                const damagedStructures = room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return structure.hits < structure.hitsMax * 0.1; // Less than 10% health
                    }
                });
                
                if (damagedStructures.length > 0) {
                    console.log(`Warning: Room ${room.name} has ${damagedStructures.length} critically damaged structures`);
                }
                
                // Check for blocked construction sites
                // 检查被阻塞的建造地点
                const constructionSites = room.find(FIND_CONSTRUCTION_SITES);
                if (constructionSites.length > 10) {
                    console.log(`Info: Room ${room.name} has ${constructionSites.length} construction sites pending`);
                }
            }
        } catch (error) {
            console.log(`Error monitoring room structures for ${room.name}: ${error}`);
        }
    },
    
    /**
     * Add a new room module dynamically
     * 动态添加新的房间模块
     */
    addRoomModule: function(roomName, moduleName) {
        try {
            const roomModule = safeRequire(moduleName);
            if (roomModule) {
                roomModules[roomName] = roomModule;
                console.log(`Successfully added room module: ${roomName} -> ${moduleName}`);
                return true;
            } else {
                console.log(`Failed to add room module: ${roomName} -> ${moduleName}`);
                return false;
            }
        } catch (error) {
            console.log(`Error adding room module ${roomName}: ${error}`);
            return false;
        }
    },
    
    /**
     * Get status of all room modules
     * 获取所有房间模块的状态
     */
    getModuleStatus: function() {
        console.log('Room Module Status:');
        for (let roomName in roomModules) {
            const module = roomModules[roomName];
            const status = module ? 
                (typeof module.run === 'function' ? 'OK' : 'NO_RUN_FUNCTION') : 
                'FAILED_TO_LOAD';
            console.log(`  ${roomName}: ${status}`);
        }
    }
};