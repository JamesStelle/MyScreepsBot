/**
 * AttackController 角色 - 控制器攻击者
 * 
 * 使用方法：
 * 1. 创建 attackController 角色的 creep（需要 CLAIM 部件）
 * 2. 通过控制台分配目标房间：
 *    Game.creeps['attackController名称'].memory.targetRoom = '目标房间名'
 * 3. attackController 会自动寻路到目标房间并攻击控制器
 * 
 * 示例：
 *    Game.creeps['AttackController1'].memory.targetRoom = 'W1N1'
 * 
 * 注意：
 * - 需要 CLAIM 部件才能攻击控制器
 * - 每次攻击降低控制器 300 点升级进度或 1 级等级
 * - 用于削弱或摧毁敌对房间的控制权
 */

const roleAttackController = {
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

        // 在目标房间，执行攻击任务
        this.attackControllerInRoom(creep);
    },

    /** 初始化 creep 设置 */
    initializeCreep: function(creep) {
        if (!creep.memory.targetRoom) {
            // 目标房间需要由控制台分配，如果没有分配则等待
            console.log(`AttackController ${creep.name} 等待目标房间分配，请使用: Game.creeps['${creep.name}'].memory.targetRoom = '房间名'`);
            creep.say('⏳ 等待分配');
            return false;
        }
        return true;
    },

    /** 执行控制器攻击逻辑 */
    attackControllerInRoom: function(creep) {
        const controller = creep.room.controller;
        
        if (!controller) {
            console.log(`房间 ${creep.room.name} 没有控制器`);
            creep.say('❌ 无控制器');
            return;
        }

        // 检查控制器状态
        if (controller.owner && controller.owner.username === creep.owner.username) {
            creep.say('⚠️ 己方控制器');
            console.log(`AttackController ${creep.name} 警告：目标是己方控制器`);
            return;
        }

        // 检查是否有控制器所有者
        if (!controller.owner && !controller.reservation) {
            creep.say('⚠️ 中性房间');
            console.log(`AttackController ${creep.name}: 房间 ${creep.room.name} 是中性房间，无需攻击`);
            return;
        }

        // 尝试攻击控制器
        const attackResult = creep.attackController(controller);
        if (attackResult === ERR_NOT_IN_RANGE) {
            creep.moveTo(controller, {
                visualizePathStyle: {stroke: '#ff0000'},
                reusePath: 10
            });
            creep.say('🚶 接近中');
        } else if (attackResult === OK) {
            creep.say('⚔️ 攻击中');
            
            // 显示攻击进度
            if (controller.owner) {
                console.log(`AttackController ${creep.name}: 正在攻击 ${controller.owner.username} 的控制器 (等级 ${controller.level})`);
            } else if (controller.reservation) {
                console.log(`AttackController ${creep.name}: 正在攻击预定控制器 (${controller.reservation.username})`);
            }
        } else if (attackResult === ERR_NO_BODYPART) {
            console.log(`AttackController ${creep.name} 错误：缺少 CLAIM 部件`);
            creep.say('❌ 无CLAIM');
        } else {
            console.log(`AttackController ${creep.name} 攻击失败: ${attackResult}`);
            creep.say('❌ 攻击失败');
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
            
            console.log(`AttackController ${creep.name} 已到达目标房间 ${targetRoom}`);
            
            // 在同一tick立即调用攻击逻辑
            this.attackControllerInRoom(creep);
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
    }
};

module.exports = roleAttackController;

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
