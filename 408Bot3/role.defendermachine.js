/**
 * DefenderMachine 角色 - 远程防御机器
 * 
 * 使用方法：
 * 1. 创建 defendermachine 角色的 creep
 * 2. 通过控制台分配目标房间：
 *    Game.creeps['defendermachine名称'].memory.targetRoom = '目标房间名'
 * 3. defendermachine 会自动寻路到目标房间，进行防御和维护
 * 
 * 示例：
 *    Game.creeps['DefenderMachine1'].memory.targetRoom = 'W1N1'
 * 
 * 状态机：
 * - WAITING: 等待目标房间分配
 * - MOVING: 移动到目标房间
 * - HARVESTING: 挖取能量
 * - DEFENDING: 攻击敌对单位
 * - REPAIRING: 修复受损结构
 * - PATROLLING: 巡逻待命
 */

const roleDefendermachine = {
    /** @param {Creep} creep **/
    run: function(creep) {
        // 初始化状态机
        if (!this.initializeCreep(creep)) {
            return; // 等待目标房间分配
        }
        
        // 记录房间信息
        recordRoomInfo(creep.room.name);
        
        // 状态机执行
        this.runStateMachine(creep);
    },

    /** 初始化 creep 设置 */
    initializeCreep: function(creep) {
        if (!creep.memory.targetRoom) {
            console.log(`DefenderMachine ${creep.name} 等待目标房间分配，请使用: Game.creeps['${creep.name}'].memory.targetRoom = '房间名'`);
            creep.say('⏳ 等待分配');
            creep.memory.state = 'WAITING';
            return false;
        }
        
        // 初始化状态
        if (!creep.memory.state) {
            creep.memory.state = 'MOVING';
        }
        
        return true;
    },

    /** 状态机主控制器 */
    runStateMachine: function(creep) {
        switch (creep.memory.state) {
            case 'WAITING':
                this.stateWaiting(creep);
                break;
            case 'MOVING':
                this.stateMoving(creep);
                break;
            case 'HARVESTING':
                this.stateHarvesting(creep);
                break;
            case 'DEFENDING':
                this.stateDefending(creep);
                break;
            case 'REPAIRING':
                this.stateRepairing(creep);
                break;
            case 'PATROLLING':
                this.statePatrolling(creep);
                break;
            default:
                creep.memory.state = 'MOVING';
                break;
        }
    },

    /** 等待状态 */
    stateWaiting: function(creep) {
        creep.say('⏳ 等待分配');
        // 如果有目标房间了，切换到移动状态
        if (creep.memory.targetRoom) {
            creep.memory.state = 'MOVING';
        }
    },

    /** 移动状态 */
    stateMoving: function(creep) {
        const targetRoom = creep.memory.targetRoom;
        
        // 移动到目标房间 - 使用智能寻路
        this.moveToTargetRoom(creep);
        creep.say(`🚶 → ${targetRoom}`);
    },
    /** 智能寻路到目标房间 */
    moveToTargetRoom: function(creep) {
        const targetRoom = creep.memory.targetRoom;
        
        // 检查是否已到达目标房间
        if (creep.room.name === targetRoom) {
            this.clearRoute(creep);
            delete creep.memory._move;
            creep.memory.state = 'PATROLLING';
            const x = creep.pos.x;
            const y = creep.pos.y;
            if (x === 0 || x === 49 || y === 0 || y === 49) {
                const tx = Math.min(48, Math.max(1, x + (x === 0 ? 1 : (x === 49 ? -1 : 0))));
                const ty = Math.min(48, Math.max(1, y + (y === 0 ? 1 : (y === 49 ? -1 : 0))));
                const inward = new RoomPosition(tx, ty, targetRoom);
                creep.moveTo(inward, {visualizePathStyle: {stroke: '#0000ff'}, reusePath: 5, maxRooms: 1});
            } else {
                this.statePatrolling(creep);
            }
            return;
        }
        
        // 检查并更新路径缓存
        if (!this.isRouteValid(creep)) {
            this.calculateNewRoute(creep, targetRoom);
        }
        
        // 执行移动
        this.executeMovement(creep);
    },

    /** 检查当前路径是否有效 */
    isRouteValid: function(creep) {
        if (!creep.memory.route || creep.memory.routeIndex === undefined) {
            return false;
        }
        
        const currentStep = creep.memory.route[creep.memory.routeIndex];
        if (currentStep && creep.room.name === currentStep.room) {
            creep.memory.routeIndex++;
            
            // 路径完成检查
            if (creep.memory.routeIndex >= creep.memory.route.length) {
                this.clearRoute(creep);
                return false;
            }
        }
        
        return true;
    },

    /** 计算新的路径 */
    calculateNewRoute: function(creep, targetRoom) {
        const route = Game.map.findRoute(creep.room.name, targetRoom, {
            routeCallback: (roomName) => this.getRoomCost(roomName, creep)
        });

        if (route === ERR_NO_PATH) {
            console.log(`无法找到从 ${creep.room.name} 到 ${targetRoom} 的路径`);
            return;
        }
        
        // 缓存新路径
        creep.memory.route = route;
        creep.memory.routeIndex = 0;
    },

    /** 获取房间移动成本 */
    getRoomCost: function(roomName, creep) {
        // 检查房间状态
        const roomStatus = Game.map.getRoomStatus(roomName);
        if (roomStatus && roomStatus.status === 'closed') {
            return Infinity;
        }
        
        // 从内存获取房间信息
        const roomMemory = Memory.rooms && Memory.rooms[roomName];
        if (roomMemory) {
            // 过道房间优先
            if (roomMemory.isHighway || roomMemory.noController) {
                return 1;
            }
            
            // 未占领房间次优
            if (roomMemory.controllerOwner === undefined) {
                return 2;
            }
            
            // 避免敌对房间
            if (roomMemory.controllerOwner && roomMemory.controllerOwner !== creep.owner.username) {
                return 10;
            }
        }
        
        // 通过坐标判断过道房间
        if (this.isHighwayRoom(roomName)) {
            return 1;
        }
        
        return 2.5; // 默认成本
    },

    /** 判断是否为过道房间 */
    isHighwayRoom: function(roomName) {
        const parsed = /^[WE]([0-9]+)[NS]([0-9]+)$/.exec(roomName);
        if (parsed) {
            const x = parseInt(parsed[1]);
            const y = parseInt(parsed[2]);
            return (x % 10 === 0 || y % 10 === 0);
        }
        return false;
    },

    /** 执行移动操作 */
    executeMovement: function(creep) {
        const currentStep = creep.memory.route[creep.memory.routeIndex];
        if (!currentStep) {
            this.clearRoute(creep);
            return;
        }
        
        const nextRoom = currentStep.room;
        
        // 已在目标房间，继续下一步
        if (creep.room.name === nextRoom) {
            creep.memory.routeIndex++;
            return;
        }
        
        // 寻找并移动到出口
        const exitDir = creep.room.findExitTo(nextRoom);
        if (exitDir === ERR_NO_PATH || exitDir === ERR_INVALID_ARGS) {
            console.log(`无法找到从 ${creep.room.name} 到 ${nextRoom} 的出口`);
            this.clearRoute(creep);
            return;
        }
        
        const exit = creep.pos.findClosestByRange(exitDir);
        if (exit) {
            const moveResult = creep.moveTo(exit, {
                visualizePathStyle: {stroke: '#ff0000'},
                reusePath: 5,
                serializeMemory: true,
                maxRooms: 1
            });
            
            if (moveResult === ERR_NO_PATH) {
                this.clearRoute(creep);
                delete creep.memory._move;
            }
            
            creep.say(`🚶 → ${nextRoom}`);
        }
    },

    /** 清除路径缓存 */
    clearRoute: function(creep) {
        delete creep.memory.route;
        delete creep.memory.routeIndex;
    },
    /** 挖取状态 */
    stateHarvesting: function(creep) {
        const targetRoom = creep.memory.targetRoom;
        
        // 如果不在目标房间，切换到移动状态
        if (creep.room.name !== targetRoom) {
            delete creep.memory._move;
            creep.memory.state = 'MOVING';
            return;
        }
        
        // 如果能量满了，切换到巡逻状态
        if (creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
            creep.memory.state = 'PATROLLING';
            return;
        }
        
        // 寻找最近的 source 进行挖取
        const sources = creep.room.find(FIND_SOURCES);
        if (sources.length > 0) {
            const targetSource = creep.pos.findClosestByRange(sources);
            
            const harvestResult = creep.harvest(targetSource);
            if (harvestResult === ERR_NOT_IN_RANGE) {
                creep.moveTo(targetSource, {
                    visualizePathStyle: {stroke: '#ffaa00'},
                    reusePath: 5,
                    maxRooms: 1  // 限制在当前房间内寻路
                });
            } else if (harvestResult === OK) {
                creep.say('⛏️ 挖取中');
            } else {
                console.log(`DefenderMachine ${creep.name} 挖取失败: ${harvestResult}`);
                creep.say('❌ 挖取失败');
            }
        } else {
            console.log(`房间 ${creep.room.name} 没有找到能量源`);
            creep.say('❌ 无能量源');
        }
    },

    /** 防御状态 */
    stateDefending: function(creep) {
        const targetRoom = creep.memory.targetRoom;
        
        // 如果不在目标房间，切换到移动状态
        if (creep.room.name !== targetRoom) {
            delete creep.memory._move;
            creep.memory.state = 'MOVING';
            return;
        }
        
        // 寻找敌对目标
        const hostileCreeps = creep.room.find(FIND_HOSTILE_CREEPS);
        const hostileStructures = creep.room.find(FIND_HOSTILE_STRUCTURES, {
            filter: (structure) => structure.structureType !== STRUCTURE_CONTROLLER
        });
        
        let target = null;
        
        // 优先攻击敌对 creep
        if (hostileCreeps.length > 0) {
            // 优先攻击有攻击部件的敌对 creep
            target = hostileCreeps.find(creep => 
                creep.body.some(part => part.type === ATTACK || part.type === RANGED_ATTACK)
            );
            
            // 如果没有攻击型 creep，攻击最近的
            if (!target) {
                target = creep.pos.findClosestByRange(hostileCreeps);
            }
        }
        // 其次攻击敌对建筑
        else if (hostileStructures.length > 0) {
            // 优先攻击 spawn 和 tower
            target = hostileStructures.find(structure => 
                structure.structureType === STRUCTURE_SPAWN || 
                structure.structureType === STRUCTURE_TOWER
            );
            
            if (!target) {
                target = creep.pos.findClosestByRange(hostileStructures);
            }
        }
        
        if (target) {
            const attackResult = creep.attack(target);
            if (attackResult === ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {
                    visualizePathStyle: {stroke: '#ff0000'},
                    reusePath: 3,
                    maxRooms: 1
                });
                creep.say('🚶 攻击中');
            } else if (attackResult === OK) {
                creep.say('⚔️ 攻击中');
            } else {
                console.log(`DefenderMachine ${creep.name} 攻击失败: ${attackResult}`);
                creep.say('❌ 攻击失败');
            }
        } else {
            // 没有敌对目标，切换到巡逻状态
            creep.memory.state = 'PATROLLING';
        }
    },

    /** 修复状态 */
    stateRepairing: function(creep) {
        const targetRoom = creep.memory.targetRoom;
        
        // 如果不在目标房间，切换到移动状态
        if (creep.room.name !== targetRoom) {
            delete creep.memory._move;
            creep.memory.state = 'MOVING';
            return;
        }
        
        // 如果能量空了，切换到挖取状态
        if (creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
            creep.memory.state = 'HARVESTING';
            return;
        }
        
        // 寻找需要修复的结构
        const damagedStructures = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return structure.hits < structure.hitsMax && 
                       structure.structureType !== STRUCTURE_WALL &&
                       structure.structureType !== STRUCTURE_RAMPART;
            }
        });
        
        if (damagedStructures.length > 0) {
            // 优先修复重要建筑：spawn > tower > extension > 其他
            const priorityOrder = [STRUCTURE_SPAWN, STRUCTURE_TOWER, STRUCTURE_EXTENSION];
            let targetStructure = null;
            
            for (const structureType of priorityOrder) {
                targetStructure = damagedStructures.find(structure => structure.structureType === structureType);
                if (targetStructure) break;
            }
            
            // 如果没有找到优先级建筑，选择血量最少的
            if (!targetStructure) {
                targetStructure = damagedStructures.reduce((min, structure) => 
                    structure.hits < min.hits ? structure : min
                );
            }
            
            const repairResult = creep.repair(targetStructure);
            if (repairResult === ERR_NOT_IN_RANGE) {
                creep.moveTo(targetStructure, {
                    visualizePathStyle: {stroke: '#00ff00'},
                    reusePath: 5,
                    maxRooms: 1
                });
                creep.say('🚶 修复中');
            } else if (repairResult === OK) {
                creep.say('🔧 修复中');
            } else {
                console.log(`DefenderMachine ${creep.name} 修复失败: ${repairResult}`);
                creep.say('❌ 修复失败');
            }
        } else {
            // 没有需要修复的结构，切换到巡逻状态
            creep.memory.state = 'PATROLLING';
        }
    },
    /** 巡逻状态 */
    statePatrolling: function(creep) {
        const targetRoom = creep.memory.targetRoom;
        
        // 如果不在目标房间，切换到移动状态
        if (creep.room.name !== targetRoom) {
            delete creep.memory._move;
            creep.memory.state = 'MOVING';
            return;
        }
        
        // 检查是否有敌对目标，优先级最高
        const hostileCreeps = creep.room.find(FIND_HOSTILE_CREEPS);
        const hostileStructures = creep.room.find(FIND_HOSTILE_STRUCTURES, {
            filter: (structure) => structure.structureType !== STRUCTURE_CONTROLLER
        });
        
        if (hostileCreeps.length > 0 || hostileStructures.length > 0) {
            creep.memory.state = 'DEFENDING';
            return;
        }
        
        // 检查是否有需要修复的结构
        const damagedStructures = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return structure.hits < structure.hitsMax && 
                       structure.structureType !== STRUCTURE_WALL &&
                       structure.structureType !== STRUCTURE_RAMPART;
            }
        });
        
        if (damagedStructures.length > 0 && creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
            creep.memory.state = 'REPAIRING';
            return;
        }
        
        // 如果能量不足，去挖取
        if (creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
            creep.memory.state = 'HARVESTING';
            return;
        }
        
        // 执行巡逻移动
        this.performPatrol(creep);
    },

    /** 执行巡逻移动 */
    performPatrol: function(creep) {
        // 初始化巡逻点
        if (!creep.memory.patrolPoints) {
            creep.memory.patrolPoints = this.generatePatrolPoints(creep.room.name);
            creep.memory.currentPatrolIndex = 0;
        }
        
        const patrolPoints = creep.memory.patrolPoints;
        const currentIndex = creep.memory.currentPatrolIndex;
        
        if (patrolPoints.length === 0) {
            creep.say('🛡️ 待命中');
            return;
        }
        
        const targetPoint = patrolPoints[currentIndex];
        const targetPos = new RoomPosition(targetPoint.x, targetPoint.y, creep.room.name);
        
        // 如果到达当前巡逻点，移动到下一个
        if (creep.pos.inRangeTo(targetPos, 2)) {
            creep.memory.currentPatrolIndex = (currentIndex + 1) % patrolPoints.length;
            creep.say('🛡️ 巡逻中');
        } else {
            creep.moveTo(targetPos, {
                visualizePathStyle: {stroke: '#0000ff'},
                reusePath: 10,
                maxRooms: 1
            });
            creep.say('🚶 巡逻中');
        }
    },

    /** 生成巡逻点 */
    generatePatrolPoints: function(roomName) {
        const room = Game.rooms[roomName];
        if (!room) return [];
        
        const patrolPoints = [];
        
        // 添加房间四个角落的巡逻点
        patrolPoints.push({x: 10, y: 10});
        patrolPoints.push({x: 40, y: 10});
        patrolPoints.push({x: 40, y: 40});
        patrolPoints.push({x: 10, y: 40});
        
        // 如果有控制器，添加控制器附近的巡逻点
        if (room.controller) {
            const controller = room.controller;
            patrolPoints.push({x: controller.pos.x, y: controller.pos.y});
        }
        
        // 添加 spawn 附近的巡逻点
        const spawns = room.find(FIND_MY_SPAWNS);
        spawns.forEach(spawn => {
            patrolPoints.push({x: spawn.pos.x, y: spawn.pos.y});
        });
        
        // 添加能量源附近的巡逻点
        const sources = room.find(FIND_SOURCES);
        sources.forEach(source => {
            patrolPoints.push({x: source.pos.x, y: source.pos.y});
        });
        
        return patrolPoints;
    }
};

module.exports = roleDefendermachine;

/** 记录房间信息到内存 */
function recordRoomInfo(roomName) {
    if (!Memory.rooms) {
        Memory.rooms = {};
    }
    
    if (!Memory.rooms[roomName]) {
        Memory.rooms[roomName] = {};
    }
    
    const room = Game.rooms[roomName];
    if (!room) return;
    
    const controller = room.controller;
    const roomMemory = Memory.rooms[roomName];
    
    // 记录控制器信息
    if (!controller) {
        roomMemory.noController = true;
    } else {
        roomMemory.noController = false;
        roomMemory.controllerOwner = controller.owner ? controller.owner.username : undefined;
    }
    
    // 记录过道房间信息
    roomMemory.isHighway = isHighwayRoom(roomName);
    
    // 记录威胁信息
    const hostileCreeps = room.find(FIND_HOSTILE_CREEPS);
    const hostileStructures = room.find(FIND_HOSTILE_STRUCTURES, {
        filter: (structure) => structure.structureType !== STRUCTURE_CONTROLLER
    });
    
    roomMemory.hostileCreeps = hostileCreeps.length;
    roomMemory.hostileStructures = hostileStructures.length;
    roomMemory.lastThreatCheck = Game.time;
}

/** 判断是否为过道房间 */
function isHighwayRoom(roomName) {
    const parsed = /^[WE]([0-9]+)[NS]([0-9]+)$/.exec(roomName);
    if (parsed) {
        const x = parseInt(parsed[1]);
        const y = parseInt(parsed[2]);
        return (x % 10 === 0 || y % 10 === 0);
    }
    return false;
}
