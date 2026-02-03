/**
 * Attacker 角色使用指南 / Attacker Role Usage Guide
 * 
 * 功能概述 / Overview:
 * Attacker 是一个专门用于攻击敌方房间和建筑的军事角色
 * Attacker is a specialized military role for attacking enemy rooms and structures
 * 
 * 使用步骤 / Usage Steps:
 * 
 * 1. 创建 Attacker 爬虫 / Create Attacker Creep:
 *    推荐配置 / Recommended configuration:
 *    Game.spawns['你的Spawn名称'].spawnCreep([ATTACK,ATTACK,MOVE,MOVE], '攻击者名称', {memory:{role:'attacker'}});
 *    或更强配置 / Or stronger configuration:
 *    Game.spawns['你的Spawn名称'].spawnCreep([TOUGH,TOUGH,ATTACK,ATTACK,ATTACK,MOVE,MOVE,MOVE], '攻击者名称', {memory:{role:'attacker'}});
 * 
 * 2. 配置目标房间 / Configure Target Room:
 *    在代码中修改 targetRoom 变量，或通过内存设置：
 *    Modify targetRoom variable in code, or set via memory:
 *    Game.creeps['攻击者名称'].memory.targetRoom = 'E45N9';
 * 
 * 攻击优先级 / Attack Priority:
 * 1. 塔楼 (Towers) - 🎯 tower - 最高威胁，优先摧毁 / Highest threat, destroy first
 * 2. 孵化器 (Spawns) - 🎯 spawn - 阻止敌方生产爬虫 / Prevent enemy creep production
 * 3. 其他敌对建筑 - 🎯 struct - 清理剩余建筑 / Clean up remaining structures
 * 
 * 工作状态说明 / Status Indicators:
 * 🚀 moving - 正在前往目标房间 / Moving to target room
 * 🎯 tower - 正在攻击塔楼 / Attacking towers
 * 🎯 spawn - 正在攻击孵化器 / Attacking spawns
 * 🎯 struct - 正在攻击其他建筑 / Attacking other structures
 * 💥 wall - 正在清除障碍物 / Clearing obstacles
 * 👁️ patrol - 巡逻模式，寻找新目标 / Patrol mode, looking for new targets
 * 
 * 智能特性 / Smart Features:
 * - 自动路径规划，优先使用高速公路房间 / Auto pathfinding, prefers highway rooms
 * - 路径缓存，提高移动效率 / Path caching for improved movement efficiency
 * - 障碍物清除，自动破坏阻挡的墙壁和城墙 / Obstacle clearing, auto-destroy blocking walls
 * - 巡逻模式，在清理完毕后继续监视 / Patrol mode, continues monitoring after clearing
 * 
 * 使用示例 / Usage Examples:
 * 
 * 示例1：基础攻击者 / Example 1: Basic attacker
 * Game.spawns['Spawn1'].spawnCreep([ATTACK,ATTACK,MOVE,MOVE], 'attacker1', {memory:{role:'attacker'}});
 * 
 * 示例2：重装攻击者 / Example 2: Heavy attacker
 * Game.spawns['Spawn1'].spawnCreep([TOUGH,TOUGH,ATTACK,ATTACK,ATTACK,MOVE,MOVE,MOVE], 'heavy_attacker', {memory:{role:'attacker'}});
 * 
 * 示例3：设置特定目标房间 / Example 3: Set specific target room
 * Game.creeps['attacker1'].memory.targetRoom = 'W1N1';
 * 
 * 注意事项 / Important Notes:
 * - 确保有足够的能量生产攻击者 / Ensure sufficient energy production for attackers
 * - 考虑敌方防御，可能需要多个攻击者 / Consider enemy defenses, may need multiple attackers
 * - 攻击者会自动寻路，但复杂地形可能需要手动引导 / Auto-pathfinding, but complex terrain may need manual guidance
 * - 修改 targetRoom 变量来改变攻击目标 / Modify targetRoom variable to change attack target
 */

var roleAttacker = {

    /** @param {Creep} creep **/
    run: function(creep) {
        // Target room configuration
        // 目标房间配置
        const targetRoom = 'E45N9';
        
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

        // State machine for attacker behavior
        // 攻击者行为状态机
        switch(creep.memory.state) {
            case 'moving':
                this.moveToTargetRoom(creep, targetRoom);
                break;
            case 'attacking':
                this.attackInRoom(creep);
                break;
            case 'clearing_obstacles':
                this.clearObstacles(creep);
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
        // Check for obstacles in path first
        // 首先检查路径上的障碍物
        const obstacles = creep.pos.findInRange(FIND_STRUCTURES, 1, {
            filter: (structure) => {
                return structure.structureType === STRUCTURE_WALL ||
                       structure.structureType === STRUCTURE_RAMPART;
            }
        });
        
        if (obstacles.length > 0) {
            creep.memory.state = 'clearing_obstacles';
            return;
        }
        
        // Priority 1: Attack towers
        // 优先级1：攻击塔楼
        const towers = creep.room.find(FIND_HOSTILE_STRUCTURES, {
            filter: (structure) => structure.structureType === STRUCTURE_TOWER
        });
        
        if (towers.length > 0) {
            creep.say('🎯 tower');
            const target = creep.pos.findClosestByRange(towers);
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
     * Clear obstacles in the path
     * 清除路径上的障碍物
     */
    clearObstacles: function(creep) {
        const obstacles = creep.pos.findInRange(FIND_STRUCTURES, 1, {
            filter: (structure) => {
                return structure.structureType === STRUCTURE_WALL ||
                       structure.structureType === STRUCTURE_RAMPART;
            }
        });
        
        if (obstacles.length > 0) {
            // Attack the closest obstacle
            // 攻击最近的障碍物
            const obstacle = creep.pos.findClosestByRange(obstacles);
            creep.say('💥 wall');
            creep.attack(obstacle);
        } else {
            // No more obstacles, return to attacking
            // 没有更多障碍物，返回攻击状态
            creep.memory.state = 'attacking';
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

module.exports = roleAttacker;