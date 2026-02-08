/*
 * ========================================
 * ATTACKER 角色使用教程
 * ========================================
 * 
 * Attacker是智能攻击角色，支持跨房间作战、智能寻路和目标优先级攻击。
 * 配合Healer角色可以形成强大的双人攻击小队。
 * 
 * 📋 主要功能:
 * - 跨房间智能寻路 (高速公路优先)
 * - 目标房间动态配置 (通过Memory存储)
 * - 攻击优先级系统 (塔楼→孵化器→其他建筑)
 * - 自动障碍物清理 (墙壁和城墙)
 * - 状态机管理 (移动→攻击→巡逻)
 * 
 * 🚀 快速开始:
 * 
 * 1. 设置攻击目标:
 *    roleAttacker.setTargetRoom("E45N9")  // 设置目标房间
 * 
 * 2. 生成攻击者:
 *    Game.spawns['Spawn1'].spawnCreep([ATTACK,ATTACK,MOVE,MOVE], 'attacker1', {memory: {role: 'attacker'}})
 * 
 * 3. 可选：生成治疗者组成双人小队:
 *    Game.spawns['Spawn1'].spawnCreep([HEAL,HEAL,MOVE,MOVE], 'healer1', {memory: {role: 'healer'}})
 * 
 * 4. 攻击者会自动:
 *    - 移动到目标房间
 *    - 按优先级攻击敌方建筑
 *    - 清理路径上的障碍物
 *    - 完成后进入巡逻模式
 * 
 * 💻 控制台命令:
 * 
 * // 攻击模式设置
 * roleAttacker.setTargetRoom("E45N9")     // 设置目标房间
 * roleAttacker.clearTargetRoom()          // 清除目标房间
 * 
 * // 状态查看
 * roleAttacker.showStatus()               // 显示所有攻击者状态
 * 
 * 🎯 攻击优先级:
 * 
 * 1. 路径障碍物 - 阻挡移动的墙壁和城墙 (最高优先级)
 * 2. 塔楼 (STRUCTURE_TOWER) - 主要威胁目标
 * 3. 孵化器 (STRUCTURE_SPAWN) - 生产设施
 * 4. 其他敌对建筑 - 次要目标
 * 
 * 🗺️ 智能寻路:
 * 
 * - 高速公路房间 (坐标%10=0) - 优先级1
 * - 过道房间 (无控制器) - 优先级2  
 * - 中性房间 (有控制器无主人) - 优先级3
 * - 其他房间 - 优先级10
 * 
 * 📊 状态显示:
 * - 🚀 moving: 正在移动到目标房间
 * - 🎯 tower: 正在攻击塔楼
 * - 🎯 spawn: 正在攻击孵化器
 * - 🎯 struct: 正在攻击其他建筑
 * - 💥 wall: 正在清理障碍物
 * - 👁️ patrol: 巡逻模式 (无目标时)
 * 
 * 🔧 高级配置:
 * 
 * for(let i = 1; i <= 3; i++) {
 *     Game.spawns['Spawn1'].spawnCreep([ATTACK,ATTACK,MOVE,MOVE], `attacker${i}`, {memory: {role: 'attacker'}})
 *     Game.spawns['Spawn1'].spawnCreep([HEAL,HEAL,MOVE,MOVE], `healer${i}`, {memory: {role: 'healer'}})
 * }
 * 
 * // 动态目标切换
 * roleAttacker.setTargetRoom("E45N9")     // 攻击房间1
 * // 等待攻击完成...
 * roleAttacker.setTargetRoom("W10S20")    // 切换到房间2
 * 
 * 🤝 双人小队配合:
 * 
 * Attacker + Healer 组成紧密编队:
 * - Healer自动寻找并跟随Attacker
 * - 保持1格距离的战术编队
 * - Healer优先治疗Attacker
 * - 支持白名单盟友治疗
 * 
 * 编队示例:
 * ```
 * H . .    . H .    . . H
 * . A .    . A .    . A .
 * . . .    . . .    . . .
 * ```
 * A=Attacker, H=Healer
 * 
 * 💡 战术技巧:
 * 
 * 1. 路径规划: 系统自动选择最安全的路径
 * 2. 障碍清理: 遇到墙壁会自动攻击，无需手动操作
 * 3. 目标切换: 可以随时更改目标房间，所有攻击者会自动更新
 * 4. 编队作战: Healer会自动跟随，形成高效战斗单位
 * 5. 持续作战: 攻击完成后会巡逻，等待新目标
 * 
 * ⚠️ 注意事项:
 * 
 * - 确保攻击者有足够的ATTACK部件
 * - 跨房间移动需要时间，请耐心等待
 * - 敌方防御可能很强，建议多个攻击者协同
 * - 设置目标前确认房间名称格式正确 (如E45N9)
 * - 攻击者会攻击所有敌对建筑，包括中性玩家的建筑
 * 
 * 🔗 相关系统:
 * - role.healer: 治疗者支援系统
 * - config.whitelist: 友方玩家白名单
 * - Memory.attackerConfig: 攻击配置存储
 * - runGeneralRoom: 自动爬虫生成
 * 
 * 📈 性能优化:
 * - 路径缓存: 减少重复计算
 * - 智能寻路: 避开危险区域
 * - 状态机: 高效的行为管理
 * - 内存管理: 自动清理无效数据
 * 
 * ========================================
 */

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
                lastUpdated: null
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
        console.log('roleAttacker.showStatus()            - 显示状态');
        console.log('═'.repeat(50));
    },

    /**
     * Move to target room with intelligent pathfinding
     * 移动到目标房间，使用智能寻路
     */
    moveToTargetRoom: function(creep, targetRoom) {
        // Check if we've reached the target room
        // 检查是否已到达目标房间
        if (creep.room.name === targetRoom) {
            creep.memory.state = 'attacking';
            // Clear path cache when reaching target room
            // 到达目标房间时清除路径缓存
            creep.memory.pathToTarget = [];
            // Immediately call attack logic in the same tick
            // 在同一tick立即调用攻击逻辑
            this.attackInRoom(creep);
            return;
        }
        
        creep.say('🚀 moving');
        
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
            
            // Check if exit is valid (not an error code)
            // 检查出口是否有效（不是错误代码）
            if (exit !== ERR_NO_PATH && exit !== ERR_INVALID_ARGS && Array.isArray(exit) && exit.length > 0) {
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
            } else {
                // Exit not found, use direct movement
                // 找不到出口，使用直接移动
                creep.moveTo(new RoomPosition(25, 25, nextRoom));
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
            const target = creep.pos.findClosestByPath(towers, {ignoreDestructibleStructures: false});
            
            if (!target) {
                // No path found, try to attack blocking walls
                // 找不到路径，尝试攻击阻挡的墙壁
                const closestTower = creep.pos.findClosestByRange(towers);
                if (closestTower) {
                    this.attackBlockingWall(creep, closestTower);
                }
                return;
            }
            
            // Move to tower and attack
            // 移动到塔楼并攻击
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
            const target = creep.pos.findClosestByPath(spawns, {ignoreDestructibleStructures: false});
            
            if (!target) {
                // No path found, try to attack blocking walls
                // 找不到路径，尝试攻击阻挡的墙壁
                const closestSpawn = creep.pos.findClosestByRange(spawns);
                if (closestSpawn) {
                    this.attackBlockingWall(creep, closestSpawn);
                }
                return;
            }
            
            // Move to spawn and attack
            // 移动到孵化器并攻击
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
            const target = creep.pos.findClosestByPath(hostileStructures, {ignoreDestructibleStructures: false});
            
            if (!target) {
                // No path found, try to attack blocking walls
                // 找不到路径，尝试攻击阻挡的墙壁
                const closestStructure = creep.pos.findClosestByRange(hostileStructures);
                if (closestStructure) {
                    this.attackBlockingWall(creep, closestStructure);
                }
                return;
            }
            
            // Move to target and attack
            // 移动到目标并攻击
            if (creep.attack(target) === ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {
                    visualizePathStyle: {stroke: '#ff0000'},
                    reusePath: 5
                });
            }
            return;
        }
        
        // No hostile structures found, log and switch to patrol mode
        // 没有找到敌对建筑，记录日志并切换到巡逻模式
        console.log(`Attacker ${creep.name}: 目标房间 ${creep.room.name} 中没有敌对建筑`);
        creep.memory.state = 'patrolling';
        // Immediately call patrol logic in the same tick
        // 在同一tick立即调用巡逻逻辑
        this.patrolRoom(creep);
    },

    /**
     * Attack blocking wall when no path is available
     * 当没有可用路径时攻击阻挡的墙壁
     */
    attackBlockingWall: function(creep, target) {
        // Find walls and ramparts in range
        // 查找范围内的墙壁和城墙
        const obstacles = creep.pos.findInRange(FIND_STRUCTURES, 1, {
            filter: (structure) => {
                return (structure.structureType === STRUCTURE_WALL ||
                       structure.structureType === STRUCTURE_RAMPART) &&
                       !structure.my;
            }
        });
        
        if (obstacles.length > 0) {
            // Attack the closest obstacle
            // 攻击最近的障碍物
            const obstacle = creep.pos.findClosestByRange(obstacles);
            creep.say('💥 wall');
            creep.attack(obstacle);
        } else {
            // No obstacles nearby, try to move closer to target
            // 附近没有障碍物，尝试靠近目标
            creep.moveTo(target, {
                visualizePathStyle: {stroke: '#ff0000'},
                reusePath: 5,
                ignoreDestructibleStructures: false
            });
        }
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