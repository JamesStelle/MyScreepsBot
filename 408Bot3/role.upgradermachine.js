/**
 * UpgraderMachine 角色 - 远程升级机器
 * 
 * 使用方法：
 * 1. 创建 upgradermachine 角色的 creep
 * 2. 通过控制台分配目标房间：
 *    Game.creeps['upgradermachine名称'].memory.targetRoom = '目标房间名'
 * 3. upgradermachine 会自动寻路到目标房间，挖取能量并升级控制器
 * 
 * 示例：
 *    Game.creeps['UpgraderMachine1'].memory.targetRoom = 'W1N1'
 * 
 * 状态机：
 * - WAITING: 等待目标房间分配
 * - MOVING: 移动到目标房间
 * - HARVESTING: 挖取能量
 * - UPGRADING: 升级控制器
 */

const roleUpgradermachine = {
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
            console.log(`UpgraderMachine ${creep.name} 等待目标房间分配，请使用: Game.creeps['${creep.name}'].memory.targetRoom = '房间名'`);
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
            case 'UPGRADING':
                this.stateUpgrading(creep);
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
            // 清除所有移动相关的缓存，防止反复横跳
            this.clearRoute(creep);
            delete creep.memory._move;
            
            console.log(`UpgraderMachine ${creep.name} 已到达目标房间 ${targetRoom}`);
            
            // 检查房间是否有控制器
            if (!creep.room.controller) {
                console.log(`房间 ${targetRoom} 没有控制器，无法升级`);
                creep.say('❌ 无控制器');
                return;
            }
            
            // 根据能量状态决定下一个状态并立即执行
            if (creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
                creep.memory.state = 'HARVESTING';
                // 在同一tick立即调用挖取逻辑
                this.stateHarvesting(creep);
            } else {
                creep.memory.state = 'UPGRADING';
                // 在同一tick立即调用升级逻辑
                this.stateUpgrading(creep);
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
    },

    /** 定位状态 - 移动到控制器附近 */
    statePositioning: function(creep) {
        const targetRoom = creep.memory.targetRoom;
        
        // 如果不在目标房间，切换回移动状态
        if (creep.room.name !== targetRoom) {
            delete creep.memory._move;
            creep.memory.state = 'MOVING';
            return;
        }
        
        // 移动到控制器附近，避免房间边缘徘徊
        const controller = creep.room.controller;
        if (!controller) {
            console.log(`房间 ${targetRoom} 没有控制器`);
            creep.say('❌ 无控制器');
            return;
        }
        
        if (!creep.pos.inRangeTo(controller, 3)) {
            creep.moveTo(controller, {
                visualizePathStyle: {stroke: '#ffffff'},
                reusePath: 5,
                maxRooms: 1
            });
            creep.say('🚶 → 控制器');
            return;
        }
        
        // 已经在控制器附近，根据能量状态决定下一个状态
        if (creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
            creep.memory.state = 'HARVESTING';
        } else {
            creep.memory.state = 'UPGRADING';
        }
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
        
        // 如果能量满了，切换到升级状态
        if (creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
            creep.memory.state = 'UPGRADING';
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
                console.log(`UpgraderMachine ${creep.name} 挖取失败: ${harvestResult}`);
                creep.say('❌ 挖取失败');
            }
        } else {
            console.log(`房间 ${creep.room.name} 没有找到能量源`);
            creep.say('❌ 无能量源');
        }
    },

    /** 升级状态 */
    stateUpgrading: function(creep) {
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
        
        // 升级控制器
        const controller = creep.room.controller;
        if (!controller) {
            console.log(`房间 ${creep.room.name} 没有控制器`);
            creep.say('❌ 无控制器');
            return;
        }
        
        // 检查控制器是否可以升级
        if (controller.owner && controller.owner.username !== creep.owner.username) {
            console.log(`控制器被其他玩家占领: ${controller.owner.username}`);
            creep.say('❌ 敌对控制器');
            return;
        }
        
        // 如果控制器未被占领，需要先占领
        if (!controller.owner) {
            console.log(`控制器未被占领，需要先使用 claimer 占领房间 ${creep.room.name}`);
            creep.say('❌ 需先占领');
            return;
        }
        
        const upgradeResult = creep.upgradeController(controller);
        if (upgradeResult === ERR_NOT_IN_RANGE) {
            creep.moveTo(controller, {
                visualizePathStyle: {stroke: '#ffffff'},
                reusePath: 5,
                maxRooms: 1  // 限制在当前房间内寻路
            });
            creep.say('🚶 升级中');
        } else if (upgradeResult === OK) {
            creep.say('⚡ 升级中');
            
            // 显示升级进度
            const progress = controller.progress;
            const progressTotal = controller.progressTotal;
            const percentage = Math.floor((progress / progressTotal) * 100);
            
            if (Game.time % 10 === 0) { // 每10tick显示一次进度
                console.log(`房间 ${creep.room.name} 控制器升级进度: ${percentage}% (${progress}/${progressTotal})`);
            }
        } else {
            console.log(`UpgraderMachine ${creep.name} 升级失败: ${upgradeResult}`);
            creep.say('❌ 升级失败');
        }
    }
};

module.exports = roleUpgradermachine;

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