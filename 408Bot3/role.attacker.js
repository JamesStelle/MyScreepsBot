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