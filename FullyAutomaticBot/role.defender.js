var roleDefender = {

    /** @param {Creep} creep **/
    run: function(creep) {
        // Initialize memory if not exists
        // 初始化内存（如果不存在）
        if (!creep.memory.state) {
            creep.memory.state = 'patrolling';
        }
        if (!creep.memory.homeRoom) {
            creep.memory.homeRoom = creep.room.name;
        }

        // State machine for defender behavior
        // 防御者行为状态机
        switch(creep.memory.state) {
            case 'patrolling':
                this.patrolRoom(creep);
                break;
            case 'defending':
                this.defendRoom(creep);
                break;
            default:
                creep.memory.state = 'patrolling';
                break;
        }
    },

    /**
     * Patrol the home room looking for threats
     * 巡逻主房间寻找威胁
     */
    patrolRoom: function(creep) {
        // Look for hostile creeps
        // 寻找敌对爬虫
        const hostileCreeps = creep.room.find(FIND_HOSTILE_CREEPS);
        
        if (hostileCreeps.length > 0) {
            creep.memory.state = 'defending';
            creep.memory.targetId = hostileCreeps[0].id;
            return;
        }

        // No threats found, continue patrolling
        // 没有发现威胁，继续巡逻
        creep.say('👁️ patrol');
        this.performPatrol(creep);
    },

    /**
     * Perform patrol movement
     * 执行巡逻移动
     */
    performPatrol: function(creep) {
        // Define patrol points around important structures
        // 定义围绕重要建筑的巡逻点
        if (!creep.memory.patrolPoints) {
            const spawn = creep.room.find(FIND_MY_SPAWNS)[0];
            const controller = creep.room.controller;
            const sources = creep.room.find(FIND_SOURCES);
            
            creep.memory.patrolPoints = [];
            
            // Add spawn area
            // 添加孵化器区域
            if (spawn) {
                creep.memory.patrolPoints.push({x: spawn.pos.x + 3, y: spawn.pos.y + 3});
                creep.memory.patrolPoints.push({x: spawn.pos.x - 3, y: spawn.pos.y - 3});
            }
            
            // Add controller area
            // 添加控制器区域
            if (controller) {
                creep.memory.patrolPoints.push({x: controller.pos.x + 2, y: controller.pos.y + 2});
                creep.memory.patrolPoints.push({x: controller.pos.x - 2, y: controller.pos.y - 2});
            }
            
            // Add source areas
            // 添加能量源区域
            sources.forEach(source => {
                creep.memory.patrolPoints.push({x: source.pos.x + 2, y: source.pos.y});
                creep.memory.patrolPoints.push({x: source.pos.x - 2, y: source.pos.y});
            });
            
            creep.memory.currentPatrolIndex = 0;
            
            // Store patrol path in memory for reuse
            // 将巡逻路径存储到内存中以便重复使用
            creep.memory.patrolPath = [];
            for (let i = 0; i < creep.memory.patrolPoints.length; i++) {
                const currentPoint = creep.memory.patrolPoints[i];
                const nextPoint = creep.memory.patrolPoints[(i + 1) % creep.memory.patrolPoints.length];
                
                const currentPos = new RoomPosition(currentPoint.x, currentPoint.y, creep.room.name);
                const nextPos = new RoomPosition(nextPoint.x, nextPoint.y, creep.room.name);
                
                // Calculate path between patrol points
                // 计算巡逻点之间的路径
                const pathResult = PathFinder.search(currentPos, {pos: nextPos, range: 1});
                if (!pathResult.incomplete) {
                    creep.memory.patrolPath = creep.memory.patrolPath.concat(pathResult.path.map(pos => ({x: pos.x, y: pos.y})));
                }
            }
            
            creep.memory.currentPathIndex = 0;
        }

        // Follow stored patrol path
        // 跟随存储的巡逻路径
        if (creep.memory.patrolPath && creep.memory.patrolPath.length > 0) {
            const currentPathPoint = creep.memory.patrolPath[creep.memory.currentPathIndex];
            if (currentPathPoint) {
                const targetPos = new RoomPosition(currentPathPoint.x, currentPathPoint.y, creep.room.name);
                
                if (creep.pos.isEqualTo(targetPos)) {
                    // Reached current path point, move to next
                    // 到达当前路径点，移动到下一个
                    creep.memory.currentPathIndex = (creep.memory.currentPathIndex + 1) % creep.memory.patrolPath.length;
                } else {
                    creep.moveTo(targetPos, {visualizePathStyle: {stroke: '#00ff00'}});
                }
            }
        }
    },

    /**
     * Defend the room against threats
     * 防御房间抵御威胁
     */
    defendRoom: function(creep) {
        const target = Game.getObjectById(creep.memory.targetId);
        
        if (!target || (target.room && target.room.name !== creep.memory.homeRoom)) {
            // Target no longer exists or left our room, return to patrol
            // 目标不再存在或离开了我们的房间，返回巡逻
            delete creep.memory.targetId;
            creep.memory.state = 'patrolling';
            return;
        }

        // Attack the hostile creep
        // 攻击敌对爬虫
        creep.say('⚔️ fight');
        
        // Prioritize ranged attack if available
        // 如果可用，优先使用远程攻击
        if (creep.rangedAttack(target) === ERR_NOT_IN_RANGE) {
            if (creep.attack(target) === ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {visualizePathStyle: {stroke: '#ff0000'}});
            }
        }
    }

};

module.exports = roleDefender;