/**
 * Reserver 角色 - 房间预定者
 * 
 * 使用方法：
 * 1. 创建 reserver 角色的 creep（需要 CLAIM 部件）
 * 2. 通过控制台分配目标房间：
 *    Game.creeps['reserver名称'].memory.targetRoom = '目标房间名'
 * 3. reserver 会自动寻路到目标房间并预定控制器
 * 
 * 示例：
 *    Game.creeps['Reserver1'].memory.targetRoom = 'W1N1'
 * 
 * 注意：
 * - 需要 CLAIM 部件才能预定控制器
 * - 每个 CLAIM 部件提供 1 tick 的预定时间
 * - 预定最多可累积到 5000 ticks
 * - 用于在中性房间获得采集和建造权限
 */

const roleReserver = {
    /** @param {Creep} creep **/
    run: function(creep) {
        // 初始化和记录房间信息
        if (!this.initializeCreep(creep)) {
            return; // 等待目标房间分配
        }
        
        recordRoomInfo(creep.room.name);
        
        // 如果不在目标房间，移动到目标房间
        if (creep.room.name !== creep.memory.targetRoom) {
            this.moveToTargetRoom(creep);
            return;
        }

        // 在目标房间，执行预定任务
        this.reserveRoom(creep);
    },

    /** 初始化 creep 设置 */
    initializeCreep: function(creep) {
        if (!creep.memory.targetRoom) {
            // 目标房间需要由控制台分配，如果没有分配则等待
            console.log(`Reserver ${creep.name} 等待目标房间分配，请使用: Game.creeps['${creep.name}'].memory.targetRoom = '房间名'`);
            creep.say('⏳ 等待分配');
            return false;
        }
        return true;
    },

    /** 执行房间预定逻辑 */
    reserveRoom: function(creep) {
        const controller = creep.room.controller;
        
        if (!controller) {
            console.log(`房间 ${creep.room.name} 没有控制器`);
            creep.say('❌ 无控制器');
            return;
        }

        // 检查控制器状态
        if (controller.owner) {
            if (controller.owner.username === creep.owner.username) {
                creep.say('✅ 己方房间');
                console.log(`Reserver ${creep.name}: 房间 ${creep.room.name} 已是己方占领，无需预定`);
                return;
            } else {
                // 其他玩家占领，攻击控制器
                creep.say('⚔️ 攻击占领');
                const attackResult = creep.attackController(controller);
                if (attackResult === ERR_NOT_IN_RANGE) {
                    creep.moveTo(controller, {
                        visualizePathStyle: {stroke: '#ff0000'},
                        reusePath: 10
                    });
                } else if (attackResult === OK) {
                    console.log(`Reserver ${creep.name}: 正在攻击 ${controller.owner.username} 的控制器 (等级 ${controller.level})`);
                }
                return;
            }
        }

        // 检查预定状态
        if (controller.reservation) {
            if (controller.reservation.username === creep.owner.username) {
                // 己方预定，显示剩余时间
                const ticksLeft = controller.reservation.ticksToEnd;
                creep.say(`🔄 ${ticksLeft}`);
            } else {
                // 其他玩家的预定，攻击控制器清除预定
                creep.say('⚔️ 攻击预定');
                const attackResult = creep.attackController(controller);
                if (attackResult === ERR_NOT_IN_RANGE) {
                    creep.moveTo(controller, {
                        visualizePathStyle: {stroke: '#ff0000'},
                        reusePath: 10
                    });
                } else if (attackResult === OK) {
                    console.log(`Reserver ${creep.name}: 正在攻击 ${controller.reservation.username} 的预定`);
                }
                return;
            }
        }

        // 尝试预定控制器
        const reserveResult = creep.reserveController(controller);
        if (reserveResult === ERR_NOT_IN_RANGE) {
            creep.moveTo(controller, {
                visualizePathStyle: {stroke: '#00ff00'},
                reusePath: 10
            });
            creep.say('🚶 接近中');
        } else if (reserveResult === OK) {
            creep.say('📌 预定中');
            
            // 显示预定进度
            if (controller.reservation) {
                const ticksLeft = controller.reservation.ticksToEnd;
                console.log(`Reserver ${creep.name}: 成功预定，剩余时间 ${ticksLeft} ticks`);
            }
        } else if (reserveResult === ERR_NO_BODYPART) {
            console.log(`Reserver ${creep.name} 错误：缺少 CLAIM 部件`);
            creep.say('❌ 无CLAIM');
        } else {
            console.log(`Reserver ${creep.name} 预定失败: ${reserveResult}`);
            creep.say('❌ 预定失败');
        }
    },

    /** 智能寻路到目标房间 */
    moveToTargetRoom: function(creep) {
        const targetRoom = creep.memory.targetRoom;
        
        // 检查是否已到达目标房间
        if (creep.room.name === targetRoom) {
            // 清除所有移动相关的缓存，防止反复横跳
            this.clearRoute(creep);
            delete creep.memory._move;
            
            console.log(`Reserver ${creep.name} 已到达目标房间 ${targetRoom}`);
            
            // 在同一tick立即调用预定逻辑
            this.reserveRoom(creep);
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
                visualizePathStyle: {stroke: '#00ff00'},
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
    }
};

module.exports = roleReserver;

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
