/**
 * Claimer 角色 - 房间占领者
 * 
 * 使用方法：
 * 1. 创建 claimer 角色的 creep
 * 2. 通过控制台分配目标房间：
 *    Game.creeps['claimer名称'].memory.targetRoom = '目标房间名'
 * 3. claimer 会自动寻路到目标房间并占领控制器
 * 
 * 示例：
 *    Game.creeps['Claimer1'].memory.targetRoom = 'W1N1'
 */

const roleClaimer = {
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

        // 在目标房间，执行占领任务
        this.claimRoom(creep);
    },

    /** 初始化 creep 设置 */
    initializeCreep: function(creep) {
        if (!creep.memory.targetRoom) {
            // 目标房间需要由控制台分配，如果没有分配则等待
            console.log(`Claimer ${creep.name} 等待目标房间分配，请使用: Game.creeps['${creep.name}'].memory.targetRoom = '房间名'`);
            creep.say('⏳ 等待分配');
            return false;
        }
        return true;
    },

    /** 执行房间占领逻辑 */
    claimRoom: function(creep) {
        const controller = creep.room.controller;
        
        if (!controller) {
            console.log(`房间 ${creep.room.name} 没有控制器`);
            creep.say('❌ 无控制器');
            return;
        }

        // 检查控制器状态
        if (controller.owner && controller.owner.username === creep.owner.username) {
            creep.say('✅ 已占领');
            console.log(`Claimer ${creep.name} 已成功占领房间 ${creep.room.name}`);
            // 任务完成，可以考虑回收或转换角色
            return;
        }

        // 尝试占领控制器
        const claimResult = creep.claimController(controller);
        if (claimResult === ERR_NOT_IN_RANGE) {
            creep.moveTo(controller, {
                visualizePathStyle: {stroke: '#ffffff'},
                reusePath: 10
            });
            creep.say('🚶 接近中');
        } else if (claimResult === OK) {
            creep.say('🏴 占领中');
        } else {
            console.log(`Claimer ${creep.name} 占领失败: ${claimResult}`);
            creep.say('❌ 占领失败');
        }
    },

    /** 智能寻路到目标房间 */
    moveToTargetRoom: function(creep) {
        const targetRoom = creep.memory.targetRoom;
        
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
                visualizePathStyle: {stroke: '#ffffff'},
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

module.exports = roleClaimer;

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