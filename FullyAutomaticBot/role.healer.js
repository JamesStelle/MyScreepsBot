var roleHealer = {

    /** @param {Creep} creep **/
    run: function(creep) {
        // Initialize memory if not exists
        // 初始化内存（如果不存在）
        if (!creep.memory.state) {
            creep.memory.state = 'following';
        }
        if (!creep.memory.attackerName) {
            // Find an attacker to follow
            // 寻找要跟随的攻击者
            this.findAttackerToFollow(creep);
        }

        // State machine for healer behavior
        // 治疗者行为状态机
        switch(creep.memory.state) {
            case 'following':
                this.followAttacker(creep);
                break;
            case 'healing':
                this.performHealing(creep);
                break;
            case 'moving':
                this.moveToPosition(creep);
                break;
            default:
                creep.memory.state = 'following';
                break;
        }
    },

    /**
     * Find an attacker creep to follow
     * 寻找要跟随的攻击者爬虫
     */
    findAttackerToFollow: function(creep) {
        // Look for MY attacker creeps in the same room or nearby
        // 在同一房间或附近寻找我的攻击者爬虫
        const attackers = _.filter(Game.creeps, (c) => 
            c.memory.role === 'attacker' && 
            c.id !== creep.id && 
            c.my === true  // 确保是自己的爬虫
        );
        
        if (attackers.length > 0) {
            // Choose the closest attacker or the first one found
            // 选择最近的攻击者或找到的第一个
            const attacker = creep.pos.findClosestByRange(attackers) || attackers[0];
            creep.memory.attackerName = attacker.name;
            creep.say('🤝 found');
        } else {
            creep.say('❓ no att');
        }
    },

    /**
     * Follow the assigned attacker
     * 跟随指定的攻击者
     */
    followAttacker: function(creep) {
        const attacker = Game.creeps[creep.memory.attackerName];
        
        // Check if attacker still exists and belongs to us
        // 检查攻击者是否仍然存在且属于我们
        if (!attacker || !attacker.my) {
            creep.memory.attackerName = null;
            this.findAttackerToFollow(creep);
            return;
        }

        // Check if healing is needed (priority check)
        // 检查是否需要治疗（优先级检查）
        if (this.needsHealing(creep, attacker)) {
            creep.memory.state = 'healing';
            return;
        }

        // Follow attacker using their cached path if available
        // 如果可用，使用攻击者的缓存路径跟随
        if (attacker.memory.pathToTarget && attacker.memory.pathToTarget.length > 0) {
            // Try to use attacker's path
            // 尝试使用攻击者的路径
            const result = creep.moveByPath(attacker.memory.pathToTarget);
            if (result === ERR_NOT_FOUND || result === ERR_INVALID_ARGS) {
                // Path is invalid, follow directly
                // 路径无效，直接跟随
                this.followDirectly(creep, attacker);
            } else {
                creep.say('📍 path');
            }
        } else {
            // No cached path available, follow directly
            // 没有缓存路径，直接跟随
            this.followDirectly(creep, attacker);
        }
    },

    /**
     * Follow attacker directly without using cached path
     * 直接跟随攻击者，不使用缓存路径
     */
    followDirectly: function(creep, attacker) {
        const distance = creep.pos.getRangeTo(attacker);
        
        if (distance > 3) {
            // Too far, move closer
            // 距离太远，靠近一些
            creep.moveTo(attacker, {
                visualizePathStyle: {stroke: '#00ff00'},
                reusePath: 3
            });
            creep.say('🏃 catch');
        } else if (distance < 1) {
            // Too close, maintain some distance
            // 距离太近，保持一些距离
            const direction = creep.pos.getDirectionTo(attacker);
            const oppositeDir = (direction + 3) % 8 + 1; // Get opposite direction
            creep.move(oppositeDir);
            creep.say('↩️ space');
        } else {
            // Good distance, stay in position
            // 距离合适，保持位置
            creep.say('✅ follow');
        }
    },

    /**
     * Check if healing is needed for self or attacker
     * 检查自己或攻击者是否需要治疗
     */
    needsHealing: function(creep, attacker) {
        // Check if self needs healing
        // 检查自己是否需要治疗
        if (creep.hits < creep.hitsMax) {
            return true;
        }
        
        // Check if attacker needs healing
        // 检查攻击者是否需要治疗
        if (attacker && attacker.hits < attacker.hitsMax) {
            return true;
        }
        
        // Check for other damaged creeps nearby
        // 检查附近其他受损的爬虫
        const damagedCreeps = creep.pos.findInRange(FIND_MY_CREEPS, 3, {
            filter: (c) => c.hits < c.hitsMax
        });
        
        return damagedCreeps.length > 0;
    },

    /**
     * Perform healing actions
     * 执行治疗行为
     */
    performHealing: function(creep) {
        const attacker = Game.creeps[creep.memory.attackerName];
        
        // Verify attacker is still ours
        // 验证攻击者仍然属于我们
        if (attacker && !attacker.my) {
            creep.memory.attackerName = null;
            creep.memory.state = 'following';
            return;
        }
        
        // Priority 1: Heal self if critically damaged
        // 优先级1：如果自己严重受损则治疗自己
        if (creep.hits < creep.hitsMax * 0.5) {
            creep.heal(creep);
            creep.say('💚 self');
            
            // Stay close to attacker while healing self
            // 治疗自己时保持靠近攻击者
            if (attacker && creep.pos.getRangeTo(attacker) > 2) {
                creep.moveTo(attacker, {visualizePathStyle: {stroke: '#00ff00'}});
            }
            return;
        }
        
        // Priority 2: Heal attacker if damaged
        // 优先级2：如果攻击者受损则治疗攻击者
        if (attacker && attacker.hits < attacker.hitsMax) {
            const distance = creep.pos.getRangeTo(attacker);
            
            if (distance <= 1) {
                // Close range healing
                // 近距离治疗
                creep.heal(attacker);
                creep.say('💚 att');
            } else if (distance <= 3) {
                // Ranged healing
                // 远程治疗
                creep.rangedHeal(attacker);
                creep.say('💙 ratt');
                
                // Move closer for better healing
                // 靠近以获得更好的治疗效果
                if (distance > 1) {
                    creep.moveTo(attacker, {visualizePathStyle: {stroke: '#00ff00'}});
                }
            } else {
                // Too far, move closer
                // 距离太远，靠近
                creep.moveTo(attacker, {visualizePathStyle: {stroke: '#00ff00'}});
                creep.say('🏃 heal');
            }
            return;
        }
        
        // Priority 3: Heal self if any damage
        // 优先级3：如果自己有任何伤害则治疗自己
        if (creep.hits < creep.hitsMax) {
            creep.heal(creep);
            creep.say('💚 self');
            return;
        }
        
        // Priority 4: Heal other nearby damaged creeps
        // 优先级4：治疗附近其他受损的爬虫
        const damagedCreeps = creep.pos.findInRange(FIND_MY_CREEPS, 3, {
            filter: (c) => c.hits < c.hitsMax && c.id !== creep.id
        });
        
        if (damagedCreeps.length > 0) {
            const target = creep.pos.findClosestByRange(damagedCreeps);
            const distance = creep.pos.getRangeTo(target);
            
            if (distance <= 1) {
                creep.heal(target);
                creep.say('💚 ally');
            } else if (distance <= 3) {
                creep.rangedHeal(target);
                creep.say('💙 raly');
            }
            return;
        }
        
        // No healing needed, return to following state
        // 不需要治疗，返回跟随状态
        creep.memory.state = 'following';
        creep.say('✅ done');
    },

    /**
     * Move to a specific position (used by state machine)
     * 移动到特定位置（状态机使用）
     */
    moveToPosition: function(creep) {
        if (creep.memory.targetPos) {
            const target = new RoomPosition(
                creep.memory.targetPos.x,
                creep.memory.targetPos.y,
                creep.memory.targetPos.roomName
            );
            
            if (creep.pos.isEqualTo(target)) {
                // Reached target position
                // 到达目标位置
                delete creep.memory.targetPos;
                creep.memory.state = 'following';
                creep.say('✅ pos');
            } else {
                creep.moveTo(target, {visualizePathStyle: {stroke: '#00ff00'}});
                creep.say('🎯 move');
            }
        } else {
            // No target position, return to following
            // 没有目标位置，返回跟随状态
            creep.memory.state = 'following';
        }
    }
};

module.exports = roleHealer;