/*
 * ========================================
 * TRANSFEREE 角色使用教程
 * ========================================
 * 
 * Transferee是基于memorySegmented分段内存系统的自动化搬运角色。
 * 它能够自动从6个分段中获取激活的搬运任务并执行。
 * 
 * 📋 支持的搬运任务:
 * - 分段0: Storage → Lab 搬运任务
 * - 分段1: Lab → Storage 搬运任务  
 * - 分段2: Storage → Terminal 搬运任务
 * - 分段3: Terminal → Storage 搬运任务
 * - 分段4: Terminal → Lab 搬运任务
 * - 分段5: Lab → Terminal 搬运任务
 * 
 * 🚀 快速开始:
 * 
 * 1. 激活分段内存任务:
 *  
 * // 激活多个任务
 * 分段0 (Storage → Lab)
 * memorySegmented.updateResourceType("H")  // 激活，搬运氢气
 *
 * 分段1 (Lab → Storage)
 * memorySegmented.updateLabResourceType("energy")  // 激活，搬运能量
 *
 * 分段2 (Storage → Terminal)
 * memorySegmented.updateTerminalResourceType("power")  // 激活，搬运power
 *
 * 分段3 (Terminal → Storage)
 * memorySegmented.updateTerminalStorageResourceType("U")  // 激活，搬运U
 *
 * 分段4 (Terminal → Lab)
 * memorySegmented.updateTerminalLabResourceType("H")  // 激活，搬运氢气
 *
 * 分段5 (Lab → Terminal)
 * memorySegmented.updateLabTerminalResourceType("O")  // 激活，搬运氧气
 * 
 *
 * 2. 生成transferee爬虫:
 *    Game.spawns['Spawn1'].spawnCreep([CARRY,CARRY,MOVE], 'transferee1', {memory: {role: 'transferee'}})
 * 
 * 3. 爬虫会自动:
 *    - 检测激活的任务 (status='active' 且 resourceType不为null)
 *    - 分配到合适的分段 (基于爬虫名称哈希)
 *    - 执行搬运工作
 *    - 显示实时状态
 * 
 * 💻 控制台命令:
 * 
 * // 查看所有transferee状态
 * roleTransferee.showStatus()
 * 
 * // 手动分配爬虫到特定分段
 * roleTransferee.assignTask("transferee1", 0)  // 分配到分段0 (Storage→Lab)
 * roleTransferee.assignTask("transferee2", 2)  // 分配到分段2 (Storage→Terminal)
 * 
 * // 清除爬虫分配
 * roleTransferee.clearAssignment("transferee1")
 * 
 * 🎯 工作原理:
 * 
 * 1. 任务检测: 扫描分段0-5，寻找status='active'的任务
 * 2. 智能分配: 基于爬虫名称哈希自动分配到不同分段，避免冲突
 * 3. 结构查找: 自动找到房间内的Storage、Terminal、Lab结构
 * 4. 状态机: 收集状态 ↔ 传输状态 自动切换
 * 5. 实时反馈: 显示当前任务、资源类型、传输路径
 * 
 * 📊 状态显示:
 * - 🔍 collect: 正在收集资源
 * - 🚚 deliver: 正在传输资源
 * - ⏳ wait: 等待任务分配
 * - ❌ no target: 没有激活的任务
 * 
 * 🔧 高级配置:
 * 
 * // 多个transferee并行工作
 * for(let i = 1; i <= 3; i++) {
 *     Game.spawns['Spawn1'].spawnCreep([CARRY,CARRY,MOVE], `transferee${i}`, {memory: {role: 'transferee'}})
 * }
 * 
 * 💡 使用技巧:
 * - transferee会自动分配到不同分段，避免多个爬虫争抢同一任务
 * - 可以同时激活多个分段的任务，系统会智能分配
 * - 使用roleTransferee.showStatus()随时查看工作状态
 * - 任务完成后爬虫会持续工作，无需重新分配
 * 
 * ⚠️ 注意事项:
 * - 确保房间内有对应的结构 (Storage/Terminal/Lab)
 * - 分段内存任务必须先激活 (设置resourceType)
 * - 爬虫需要足够的CARRY部件来搬运资源
 * 
 * 🔗 相关系统:
 * - memorySegmented: 分段内存任务管理
 * - runGeneralRoom: 自动爬虫生成
 * - main.js: 系统集成和错误处理
 * 
 * ========================================
 */

require('memorySegmented');
var roleTransferee = {

    /** @param {Creep} creep **/
    run: function(creep) {
        // Initialize transferee if not done
        // 初始化transferee（如果尚未完成）
        if (!creep.memory.initialized) {
            this.initializeTransferee(creep);
        }

        // Get active task from segmented memory
        // 从分段内存获取激活的任务
        var activeTask = this.getActiveTask(creep);
        
        if (!activeTask) {
            // No active task found, wait
            // 没有找到激活的任务，等待
            creep.say('⏳ wait');
            return;
        }

        // Update creep's current task info
        // 更新爬虫当前任务信息
        creep.memory.currentTask = {
            segment: activeTask.segment,
            taskType: activeTask.task.taskType,
            resourceType: activeTask.task.resourceType,
            source: activeTask.task.config.source,
            target: activeTask.task.config.target
        };

        // State machine: switch between collecting and delivering
        // 状态机：在收集和传输之间切换
        
        // If creep is empty, switch to collecting state
        // 如果爬虫存储为空，切换到收集状态
        if(creep.store.getUsedCapacity() == 0) {
            creep.memory.delivering = false;
            creep.say('🔍 collect');
        }
        // If creep is full, switch to delivering state
        // 如果爬虫存储满了，切换到传输状态
        if(creep.store.getFreeCapacity() == 0) {
            creep.memory.delivering = true;
            creep.say('🚚 deliver');
        }

        // Execute current state
        // 执行当前状态
        if(creep.memory.delivering) {
            // Delivering state: transfer resource to target
            // 传输状态：向目标传输资源
            this.deliverResource(creep, activeTask.task);
        }
        else {
            // Collecting state: collect resource from source
            // 收集状态：从源头收集资源
            this.collectResource(creep, activeTask.task);
        }
    },

    // Initialize transferee creep
    // 初始化transferee爬虫
    initializeTransferee: function(creep) {
        creep.memory.initialized = true;
        creep.memory.delivering = false;
        creep.memory.currentTask = null;
        console.log(`🤖 Transferee ${creep.name} 已初始化，等待分段内存任务`);
    },

    // Get active task from segmented memory
    // 从分段内存获取激活的任务
    getActiveTask: function(creep) {
        if (!global.memorySegmented) {
            console.log(`❌ Transferee ${creep.name}: memorySegmented not available`);
            return null;
        }
        var tasks = [
            { segment: 0, task: global.memorySegmented.getStorageLabTask() },
            { segment: 1, task: global.memorySegmented.getLabStorageTask() },
            { segment: 2, task: global.memorySegmented.getStorageTerminalTask() },
            { segment: 3, task: global.memorySegmented.getTerminalStorageTask() },
            { segment: 4, task: global.memorySegmented.getTerminalLabTask() },
            { segment: 5, task: global.memorySegmented.getLabTerminalTask() }
        ];
        var active = [];
        for (let taskInfo of tasks) {
            if (taskInfo.task && taskInfo.task.status === 'active' && taskInfo.task.resourceType && taskInfo.task.resourceType !== null) {
                active.push(taskInfo);
            }
        }
        if (active.length === 0) {
            return null;
        }
        for (let taskInfo of active) {
            if (this.shouldHandleTask(creep, taskInfo)) {
                return taskInfo;
            }
        }
        return active[0];
    },

    // Check if creep should handle this specific task
    // 检查爬虫是否应该处理此特定任务
    shouldHandleTask: function(creep, taskInfo) {
        var assigned = creep.memory.assignedSegment;
        if (assigned !== undefined && assigned !== null) {
            return assigned === taskInfo.segment;
        }
        var creepHash = this.hashString(creep.name) % 6;
        return creepHash === taskInfo.segment;
    },

    // Simple hash function for string
    // 字符串的简单哈希函数
    hashString: function(str) {
        var hash = 0;
        for (var i = 0; i < str.length; i++) {
            var char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash);
    },

    // Function to collect resource from source
    // 从源头收集资源的函数
    collectResource: function(creep, task) {
        // Find the source structure
        // 找到源结构
        var source = this.findStructureByType(creep.room, task.config.source);
        
        if (!source) {
            creep.say('❌ no src');
            console.log(`Transferee ${creep.name}: Source '${task.config.source}' not found.`);
            return;
        }

        // Check if source has the required resource
        // 检查源是否有所需资源
        if (!source.store || source.store[task.resourceType] <= 0) {
            creep.say('⚠️ empty');
            return;
        }

        // Withdraw resource from source
        // 从源头提取资源
        var result = creep.withdraw(source, task.resourceType);
        if (result == ERR_NOT_IN_RANGE) {
            creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
        } else if (result == OK) {
            console.log(`📦 Transferee ${creep.name}: 从${task.config.source}收集${task.resourceType}`);
        } else if (result != OK) {
            creep.say('❌ fail');
            console.log(`Transferee ${creep.name}: Withdraw failed with code ${result}.`);
        }
    },

    // Function to deliver resource to target
    // 向目标传输资源的函数
    deliverResource: function(creep, task) {
        // Find the target structure
        // 找到目标结构
        var target = this.findStructureByType(creep.room, task.config.target);
        
        if (!target) {
            creep.say('❌ no tgt');
            console.log(`Transferee ${creep.name}: Target '${task.config.target}' not found.`);
            return;
        }

        // Check if target has space for the resource
        // 检查目标是否有空间存放资源
        if (target.store && target.store.getFreeCapacity(task.resourceType) <= 0) {
            creep.say('⚠️ full');
            return;
        }

        // Transfer resource to target
        // 向目标传输资源
        var result = creep.transfer(target, task.resourceType);
        if (result == ERR_NOT_IN_RANGE) {
            creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
        } else if (result == OK) {
            // Task completed successfully
            // 任务成功完成
            console.log(`✅ Transferee ${creep.name}: 成功传输${task.resourceType}从${task.config.source}到${task.config.target}`);
            creep.say('✅ done');
        } else {
            creep.say('❌ fail');
            console.log(`Transferee ${creep.name}: Transfer failed with code ${result}.`);
        }
    },

    // Function to find structure by type
    // 通过类型查找结构的函数
    findStructureByType: function(room, structureType) {
        var structures;
        
        switch(structureType.toLowerCase()) {
            case 'storage':
                structures = room.find(FIND_MY_STRUCTURES, {
                    filter: (structure) => structure.structureType == STRUCTURE_STORAGE
                });
                break;
                
            case 'terminal':
                structures = room.find(FIND_MY_STRUCTURES, {
                    filter: (structure) => structure.structureType == STRUCTURE_TERMINAL
                });
                break;
                
            case 'lab':
                structures = room.find(FIND_MY_STRUCTURES, {
                    filter: (structure) => structure.structureType == STRUCTURE_LAB
                });
                // Return first available lab
                // 返回第一个可用的lab
                break;
                
            default:
                console.log(`❌ Unknown structure type: ${structureType}`);
                return null;
        }
        
        return structures && structures.length > 0 ? structures[0] : null;
    },

    // Console command to assign specific task to creep
    // 控制台命令：为爬虫分配特定任务
    assignTask: function(creepName, segment) {
        var creep = Game.creeps[creepName];
        if (!creep) {
            console.log(`❌ Creep ${creepName} not found`);
            return false;
        }
        
        if (segment < 0 || segment > 5) {
            console.log(`❌ Invalid segment ${segment}. Must be 0-5`);
            return false;
        }
        
        creep.memory.assignedSegment = segment;
        console.log(`✅ Transferee ${creepName} 已分配到分段${segment}`);
        return true;
    },

    // Console command to clear creep assignment
    // 控制台命令：清除爬虫分配
    clearAssignment: function(creepName) {
        var creep = Game.creeps[creepName];
        if (!creep) {
            console.log(`❌ Creep ${creepName} not found`);
            return false;
        }
        
        delete creep.memory.assignedSegment;
        delete creep.memory.currentTask;
        creep.memory.delivering = false;
        console.log(`✅ Transferee ${creepName} 分配已清除`);
        return true;
    },

    // Console command to show transferee status
    // 控制台命令：显示transferee状态
    showStatus: function() {
        var transferees = _.filter(Game.creeps, (creep) => creep.memory.role == 'transferee');
        
        if (transferees.length === 0) {
            console.log('❌ 没有找到transferee爬虫');
            return;
        }
        
        console.log('🤖 Transferee状态报告:');
        console.log('═'.repeat(50));
        
        for (let creep of transferees) {
            var status = creep.memory.delivering ? '🚚 传输中' : '🔍 收集中';
            var task = creep.memory.currentTask;
            
            console.log(`${creep.name}: ${status}`);
            if (task) {
                console.log(`  任务: ${task.taskType}`);
                console.log(`  资源: ${task.resourceType}`);
                console.log(`  路径: ${task.source} → ${task.target}`);
                console.log(`  分段: ${task.segment}`);
            } else {
                console.log(`  状态: ⏳ 等待任务`);
            }
            console.log('');
        }
    }
};

// Set as global variable for console access
// 设置为全局变量以便控制台访问
global.roleTransferee = roleTransferee;

module.exports = roleTransferee;
