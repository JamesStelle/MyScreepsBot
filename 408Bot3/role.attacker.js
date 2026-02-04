var roleAttacker = {

    /** @param {Creep} creep **/
    run: function(creep) {
        // Get target room from global memory configuration
        // 从全局内存配置获取目标房间
        const targetRoom = this.getTargetRoom();
        
        if (!targetRoom) {
            creep.say('❌ no target');
            console.log(`Attacker ${creep.name}: 没有设置目标房间，使用控制台命令: roleAttacker.setTargetRoom("房间名")`);
            return;
        }
        
        // Initialize memory if not exists
        // 初始化内存（如果不存在）
        if (!creep.memory.targetRoom) {
            creep.memory.targetRoom = targetRoom;
        }
        if (!creep.memory.pathToTarget) {
            creep.memory.pathToTarget = [];
        }
        if (!creep.memory.state) {
            creep.memory.state = 'moving';
        }

        // Update target room if changed in global config
        // 如果全局配置中的目标房间发生变化，则更新
        if (creep.memory.targetRoom !== targetRoom) {
            creep.memory.targetRoom = targetRoom;
            creep.memory.pathToTarget = []; // Clear cached path
            creep.memory.state = 'moving'; // Reset to moving state
            console.log(`Attacker ${creep.name}: 目标房间已更新为 ${targetRoom}`);
        }

        // State machine for attacker behavior
        // 攻击者行为状态机
        switch(creep.memory.state) {
            case 'moving':
                this.moveToTargetRoom(creep, targetRoom);
                break;
            case 'attacking':
                this.attackInRoom(creep);
                break;
            case 'patrolling':
                this.patrolRoom(creep);
                break;
            default:
                creep.memory.state = 'moving';
                break;
        }
    },

    /**
     * Get target room from Memory configuration
     * 从Memory配置获取目标房间
     */
    getTargetRoom: function() {
        // Initialize attacker config if not exists
        // 如果不存在则初始化攻击者配置
        if (!Memory.attackerConfig) {
            Memory.attackerConfig = {
                targetRoom: null,
                lastUpdated: null,
                attackMode: 'destroy' // 'destroy', 'raid', 'scout'
            };
        }
        
        return Memory.attackerConfig.targetRoom;
    },

    /**
     * Console command: Set target room for all attackers
     * 控制台命令：为所有攻击者设置目标房间
     */
    setTargetRoom: function(roomName) {
        if (!roomName || typeof roomName !== 'string') {
            console.log('❌ 无效的房间名称。使用方法: roleAttacker.setTargetRoom("E45N9")');
            return false;
        }
        
        // Validate room name format
        // 验证房间名称格式
        const roomNamePattern = /^[WE]\d+[NS]\d+$/;
        if (!roomNamePattern.test(roomName)) {
            console.log('❌ 房间名称格式无效。正确格式: E45N9, W12S34 等');
            return false;
        }
        
        // Initialize config if not exists
        // 如果不存在则初始化配置
        if (!Memory.attackerConfig) {
            Memory.attackerConfig = {};
        }
        
        // Update target room
        // 更新目标房间
        Memory.attackerConfig.targetRoom = roomName;
        Memory.attackerConfig.lastUpdated = Game.time;
        
        console.log(`✅ 攻击者目标房间已设置为: ${roomName}`);
        console.log(`📊 配置时间: tick ${Game.time}`);
        
        // Update all existing attacker creeps
        // 更新所有现有的攻击者爬虫
        const attackers = _.filter(Game.creeps, (creep) => creep.memory.role === 'attacker');
        if (attackers.length > 0) {
            console.log(`🔄 正在更新 ${attackers.length} 个攻击者的目标...`);
            for (let attacker of attackers) {
                attacker.memory.targetRoom = roomName;
                attacker.memory.pathToTarget = []; // Clear cached path
                attacker.memory.state = 'moving'; // Reset to moving state
            }
            console.log('✅ 所有攻击者目标已更新');
        }
        
        return true;
    },

    /**
     * Console command: Clear target room
     * 控制台命令：清除目标房间
     */
    clearTargetRoom: function() {
        if (!Memory.attackerConfig) {
            console.log('❌ 没有找到攻击者配置');
            return false;
        }
        
        Memory.attackerConfig.targetRoom = null;
        Memory.attackerConfig.lastUpdated = Game.time;
        
        console.log('✅ 攻击者目标房间已清除');
        
        // Update all existing attacker creeps
        // 更新所有现有的攻击者爬虫
        const attackers = _.filter(Game.creeps, (creep) => creep.memory.role === 'attacker');
        for (let attacker of attackers) {
            attacker.memory.targetRoom = null;
            attacker.memory.state = 'moving';
        }
        
        return true;
    },

    /**
     * Console command: Set attack mode
     * 控制台命令：设置攻击模式
     */
    setAttackMode: function(mode) {
        const validModes = ['destroy', 'raid', 'scout'];
        if (!validModes.includes(mode)) {
            console.log(`❌ 无效的攻击模式。可用模式: ${validModes.join(', ')}`);
            return false;
        }
        
        if (!Memory.attackerConfig) {
            Memory.attackerConfig = {};
        }
        
        Memory.attackerConfig.attackMode = mode;
        Memory.attackerConfig.lastUpdated = Game.time;
        
        console.log(`✅ 攻击模式已设置为: ${mode}`);
        return true;
    },

    /**
     * Console command: Show attacker configuration and status
     * 控制台命令：显示攻击者配置和状态
     */
    showStatus: function() {
        console.log('⚔️ 攻击者系统状态:');
        console.log('═'.repeat(50));
        
        if (!Memory.attackerConfig) {
            console.log('❌ 没有找到攻击者配置');
            console.log('💡 使用 roleAttacker.setTargetRoom("房间名") 设置目标');
            return;
        }
        
        const config = Memory.attackerConfig;
        console.log(`目标房间: ${config.targetRoom || '未设置'}`);
        console.log(`攻击模式: ${config.attackMode || 'destroy'}`);
        console.log(`最后更新: tick ${config.lastUpdated || '未知'}`);
        console.log('');
        
        // Show all attacker creeps status
        // 显示所有攻击者爬虫状态
        const attackers = _.filter(Game.creeps, (creep) => creep.memory.role === 'attacker');
        
        if (attackers.length === 0) {
            console.log('❌ 没有找到攻击者爬虫');
        } else {
            console.log(`🤖 攻击者爬虫 (${attackers.length}个):`);
            for (let attacker of attackers) {
                const state = attacker.memory.state || 'unknown';
                const target = attacker.memory.targetRoom || '未设置';
                const room = attacker.room.name;
                console.log(`${attacker.name}: ${state} | 当前房间: ${room} | 目标: ${target}`);
            }
        }
        
        console.log('');
        console.log('💡 可用命令:');
        console.log('roleAttacker.setTargetRoom("E45N9")  - 设置目标房间');
        console.log('roleAttacker.clearTargetRoom()       - 清除目标房间');
        console.log('roleAttacker.setAttackMode("raid")   - 设置攻击模式');
        console.log('roleAttacker.showStatus()            - 显示状态');
        console.log('═'.repeat(50));
    },

    /**
     * Move to target room with intelligent pathfinding
     * 移动到目标房间，使用智能寻路
     */
    moveToTargetRoom: function(creep, targetRoom) {
        creep.say('🚀 moving');
        
        // Check if we've reached the target room
        // 检查是否已到达目标房间
        if (creep.room.name === targetRoom) {
            creep.memory.state = 'attacking';
            return;
        }
        
        // Use cached path if available and valid
        // 如果有缓存路径且有效，则使用缓存路径
        if (creep.memory.pathToTarget && creep.memory.pathToTarget.length > 0) {
            const result = creep.moveByPath(creep.memory.pathToTarget);
            if (result === ERR_NOT_FOUND || result === ERR_INVALID_ARGS) {
                // Path is invalid, recalculate
                // 路径无效，重新计算
                delete creep.memory.pathToTarget;
            } else {
                return;
            }
        }
        
        // Calculate new path with custom route finding
        // 使用自定义路线查找计算新路径
        const route = Game.map.findRoute(creep.room.name, targetRoom, {
            routeCallback: function(roomName, fromRoomName) {
                // Parse room coordinates
                // 解析房间坐标
                const parsed = /^[WE]([0-9]+)[NS]([0-9]+)$/.exec(roomName);
                if (!parsed) return Infinity;
                
                const x = parseInt(parsed[1]);
                const y = parseInt(parsed[2]);
                
                // Check if room is a highway (corridor room)
                // 检查是否为高速公路房间（过道房间）
                if (x % 10 === 0 || y % 10 === 0) {
                    return 1; // Prefer highway rooms / 优先选择高速公路房间
                }
                
                // Check room status from memory or game data
                // 从内存或游戏数据检查房间状态
                const roomMemory = Memory.rooms && Memory.rooms[roomName];
                if (roomMemory) {
                    // If room has no controller, it's a corridor room
                    // 如果房间没有控制器，则为过道房间
                    if (!roomMemory.controller) {
                        return 2; // Second priority for corridor rooms / 过道房间第二优先级
                    }
                    // If room has controller but no owner, it's neutral
                    // 如果房间有控制器但无主人，则为中性房间
                    if (roomMemory.controller && !roomMemory.controller.owner) {
                        return 3; // Third priority for neutral rooms / 中性房间第三优先级
                    }
                }
                
                // Default cost for unknown or owned rooms
                // 未知或被占领房间的默认成本
                return 10;
            }
        });
        
        if (route !== ERR_NO_PATH && route.length > 0) {
            const nextRoom = route[0].room;
            const exitDir = route[0].exit;
            const exit = creep.room.findExitTo(nextRoom);
            
            if (exit) {
                const path = creep.room.findPath(creep.pos, exit[0], {
                    ignoreCreeps: true,
                    maxOps: 1000
                });
                
                if (path.length > 0) {
                    // Cache the path in memory
                    // 将路径缓存到内存中
                    creep.memory.pathToTarget = Room.serializePath(path);
                    creep.moveByPath(path);
                } else {
                    // Fallback to simple moveTo
                    // 回退到简单的moveTo
                    creep.moveTo(new RoomPosition(25, 25, nextRoom));
                }
            }
        } else {
            // Direct movement if no route found
            // 如果找不到路线则直接移动
            creep.moveTo(new RoomPosition(25, 25, targetRoom));
        }
    },

    /**
     * Attack logic when in target room
     * 在目标房间时的攻击逻辑
     */
    attackInRoom: function(creep) {
        // Priority 1: Attack towers
        // 优先级1：攻击塔楼
        const towers = creep.room.find(FIND_HOSTILE_STRUCTURES, {
            filter: (structure) => structure.structureType === STRUCTURE_TOWER
        });
        
        if (towers.length > 0) {
            creep.say('🎯 tower');
            const target = creep.pos.findClosestByRange(towers);
            
            // Check for obstacles in path to tower
            // 检查到塔楼路径上的障碍物
            const obstacles = creep.pos.findInRange(FIND_STRUCTURES, 1, {
                filter: (structure) => {
                    return (structure.structureType === STRUCTURE_WALL ||
                           structure.structureType === STRUCTURE_RAMPART) &&
                           !structure.my; // Don't attack own ramparts
                }
            });
            
            if (obstacles.length > 0) {
                // Attack obstacle blocking the path
                // 攻击阻挡路径的障碍物
                const obstacle = creep.pos.findClosestByRange(obstacles);
                creep.say('💥 wall');
                creep.attack(obstacle);
                return;
            }
            
            // Move to tower if no obstacles
            // 如果没有障碍物则移动到塔楼
            if (creep.attack(target) === ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {
                    visualizePathStyle: {stroke: '#ff0000'},
                    reusePath: 5
                });
            }
            return;
        }
        
        // Priority 2: Attack spawns
        // 优先级2：攻击孵化器
        const spawns = creep.room.find(FIND_HOSTILE_STRUCTURES, {
            filter: (structure) => structure.structureType === STRUCTURE_SPAWN
        });
        
        if (spawns.length > 0) {
            creep.say('🎯 spawn');
            const target = creep.pos.findClosestByRange(spawns);
            
            // Check for obstacles in path to spawn
            // 检查到孵化器路径上的障碍物
            const obstacles = creep.pos.findInRange(FIND_STRUCTURES, 1, {
                filter: (structure) => {
                    return (structure.structureType === STRUCTURE_WALL ||
                           structure.structureType === STRUCTURE_RAMPART) &&
                           !structure.my; // Don't attack own ramparts
                }
            });
            
            if (obstacles.length > 0) {
                // Attack obstacle blocking the path
                // 攻击阻挡路径的障碍物
                const obstacle = creep.pos.findClosestByRange(obstacles);
                creep.say('💥 wall');
                creep.attack(obstacle);
                return;
            }
            
            // Move to spawn if no obstacles
            // 如果没有障碍物则移动到孵化器
            if (creep.attack(target) === ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {
                    visualizePathStyle: {stroke: '#ff0000'},
                    reusePath: 5
                });
            }
            return;
        }
        
        // Priority 3: Attack other hostile structures
        // 优先级3：攻击其他敌对建筑
        const hostileStructures = creep.room.find(FIND_HOSTILE_STRUCTURES);
        if (hostileStructures.length > 0) {
            creep.say('🎯 struct');
            const target = creep.pos.findClosestByRange(hostileStructures);
            
            // Check for obstacles in path to target
            // 检查到目标路径上的障碍物
            const obstacles = creep.pos.findInRange(FIND_STRUCTURES, 1, {
                filter: (structure) => {
                    return (structure.structureType === STRUCTURE_WALL ||
                           structure.structureType === STRUCTURE_RAMPART) &&
                           !structure.my; // Don't attack own ramparts
                }
            });
            
            if (obstacles.length > 0) {
                // Attack obstacle blocking the path
                // 攻击阻挡路径的障碍物
                const obstacle = creep.pos.findClosestByRange(obstacles);
                creep.say('💥 wall');
                creep.attack(obstacle);
                return;
            }
            
            // Move to target if no obstacles
            // 如果没有障碍物则移动到目标
            if (creep.attack(target) === ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {
                    visualizePathStyle: {stroke: '#ff0000'},
                    reusePath: 5
                });
            }
            return;
        }
        
        // No targets found, switch to patrol mode
        // 没有找到目标，切换到巡逻模式
        creep.memory.state = 'patrolling';
    },

    /**
     * Patrol the room when no targets are available
     * 没有目标时巡逻房间
     */
    patrolRoom: function(creep) {
        creep.say('👁️ patrol');
        
        // Check if new targets appeared
        // 检查是否出现新目标
        const hostileStructures = creep.room.find(FIND_HOSTILE_STRUCTURES);
        if (hostileStructures.length > 0) {
            creep.memory.state = 'attacking';
            return;
        }
        
        // Continue patrolling
        // 继续巡逻
        if (!creep.memory.patrolTarget || Game.time % 10 === 0) {
            creep.memory.patrolTarget = {
                x: Math.floor(Math.random() * 40) + 5,
                y: Math.floor(Math.random() * 40) + 5
            };
        }
        
        const patrolPos = new RoomPosition(
            creep.memory.patrolTarget.x,
            creep.memory.patrolTarget.y,
            creep.room.name
        );
        creep.moveTo(patrolPos);
    }
};

// Set as global variable for console access
// 设置为全局变量以便控制台访问
global.roleAttacker = roleAttacker;

module.exports = roleAttacker;