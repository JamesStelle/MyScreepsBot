/**
 * Healer 角色使用指南 / Healer Role Usage Guide
 * 
 * 功能概述 / Overview:
 * Healer 是一个专门用于治疗和支援其他爬虫的医疗角色，主要跟随攻击者提供治疗支持
 * Healer is a specialized medical role for healing and supporting other creeps, primarily following attackers to provide healing support
 * 
 * 使用步骤 / Usage Steps:
 * 
 * 1. 创建 Healer 爬虫 / Create Healer Creep:
 *    推荐配置 / Recommended configuration:
 *    Game.spawns['你的Spawn名称'].spawnCreep([HEAL,HEAL,MOVE,MOVE], '治疗者名称', {memory:{role:'healer'}});
 *    或更强配置 / Or stronger configuration:
 *    Game.spawns['你的Spawn名称'].spawnCreep([TOUGH,HEAL,HEAL,HEAL,MOVE,MOVE,MOVE], '强力治疗者', {memory:{role:'healer'}});
 * 
 * 2. 自动配对攻击者 / Auto-pair with Attacker:
 *    治疗者会自动寻找并跟随攻击者，无需手动配置
 *    Healer will automatically find and follow attackers, no manual configuration needed
 * 
 * 3. 手动指定跟随目标 / Manually assign follow target (optional):
 *    Game.creeps['治疗者名称'].memory.attackerName = '攻击者名称';
 * 
 * 治疗优先级 / Healing Priority:
 * 1. 自己严重受损 (< 50% HP) - 💚 self - 确保治疗者生存 / Self critically damaged, ensure healer survival
 * 2. 攻击者受损 - 💚 att / 💙 ratt - 保护主要战斗单位 / Damaged attacker, protect main combat unit
 * 3. 自己轻微受损 - 💚 self - 维持满血状态 / Self minor damage, maintain full health
 * 4. 附近盟友受损 - 💚 ally / 💙 raly - 支援其他友军 / Nearby allies damaged, support other friendlies
 * 
 * 工作状态说明 / Status Indicators:
 * 🤝 found - 找到攻击者目标 / Found attacker target
 * ❓ no att - 没有找到攻击者 / No attacker found
 * 📍 path - 使用攻击者路径跟随 / Following using attacker's path
 * 🏃 catch - 追赶攻击者 / Catching up to attacker
 * ↩️ space - 保持适当距离 / Maintaining proper distance
 * ✅ follow - 跟随状态良好 / Following status good
 * 💚 self - 治疗自己 / Healing self
 * 💚 att - 近距离治疗攻击者 / Close-range healing attacker
 * 💙 ratt - 远程治疗攻击者 / Ranged healing attacker
 * 💚 ally - 近距离治疗盟友 / Close-range healing ally
 * 💙 raly - 远程治疗盟友 / Ranged healing ally
 * 🏃 heal - 移动到治疗位置 / Moving to healing position
 * ✅ done - 治疗完成 / Healing completed
 * 🎯 move - 移动到指定位置 / Moving to specified position
 * ✅ pos - 到达目标位置 / Reached target position
 * 
 * 智能特性 / Smart Features:
 * - 自动寻找攻击者并建立跟随关系 / Auto-find attackers and establish following relationship
 * - 智能距离控制，保持1-3格最佳治疗距离 / Smart distance control, maintain 1-3 range optimal healing distance
 * - 路径共享，使用攻击者的缓存路径提高效率 / Path sharing, use attacker's cached path for efficiency
 * - 优先级治疗系统，确保关键单位存活 / Priority healing system, ensure critical units survive
 * - 近程和远程治疗自动切换 / Auto-switch between close and ranged healing
 * 
 * 使用示例 / Usage Examples:
 * 
 * 示例1：基础治疗者 / Example 1: Basic healer
 * Game.spawns['Spawn1'].spawnCreep([HEAL,HEAL,MOVE,MOVE], 'healer1', {memory:{role:'healer'}});
 * 
 * 示例2：重装治疗者 / Example 2: Heavy healer
 * Game.spawns['Spawn1'].spawnCreep([TOUGH,HEAL,HEAL,HEAL,MOVE,MOVE,MOVE], 'heavy_healer', {memory:{role:'healer'}});
 * 
 * 示例3：指定跟随特定攻击者 / Example 3: Assign to specific attacker
 * Game.creeps['healer1'].memory.attackerName = 'attacker1';
 * 
 * 示例4：移动到指定位置 / Example 4: Move to specific position
 * Game.creeps['healer1'].memory.targetPos = {x: 25, y: 25, roomName: 'E45N9'};
 * Game.creeps['healer1'].memory.state = 'moving';
 * 
 * 最佳实践 / Best Practices:
 * - 攻击者与治疗者比例建议 1:1 或 2:1 / Recommended attacker:healer ratio 1:1 or 2:1
 * - 治疗者应该有足够的 MOVE 部件保持机动性 / Healers should have enough MOVE parts for mobility
 * - 在危险区域优先生产治疗者支援 / Prioritize healer production in dangerous areas
 * - 治疗者可以作为侦察兵使用 / Healers can be used as scouts
 * 
 * 注意事项 / Important Notes:
 * - 治疗者会自动验证攻击者归属，防止跟随敌方单位 / Auto-verify attacker ownership to prevent following enemies
 * - 如果攻击者死亡，治疗者会自动寻找新的攻击者 / If attacker dies, healer will auto-find new attacker
 * - 治疗者优先保证自己存活，然后支援他人 / Healer prioritizes own survival, then supports others
 */

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