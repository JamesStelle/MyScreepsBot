var roleTransferee = {

    /** @param {Creep} creep **/
    run: function(creep) {
        // Check if creep has transfer task in memory
        // 中文: 检查爬虫内存中是否有转移任务
        if (!creep.memory.transferTask) {
            // No task assigned, wait for console input
            // 中文: 没有分配任务，等待控制台输入
            creep.say('⏳ wait');
            return;
        }

        var task = creep.memory.transferTask;
        
        // Validate task parameters
        // 中文: 验证任务参数
        if (!task.from || !task.to || !task.what) {
            creep.say('❌ invalid');
            console.log(`Transferee ${creep.name}: Invalid task parameters. Need from, to, what.`);
            return;
        }

        // State machine: switch between collecting and delivering
        // 中文: 状态机：在收集和传输之间切换
        
        // If creep is empty, switch to collecting state
        // 中文: 如果爬虫存储为空，切换到收集状态
        if(creep.store.getUsedCapacity() == 0) {
            creep.memory.delivering = false;
            creep.say('🔍 collect');
        }
        // If creep is full, switch to delivering state
        // 中文: 如果爬虫存储满了，切换到传输状态
        if(creep.store.getFreeCapacity() == 0) {
            creep.memory.delivering = true;
            creep.say('🚚 deliver');
        }

        // Execute current state
        // 中文: 执行当前状态
        if(creep.memory.delivering) {
            // Delivering state: transfer resource to target
            // 中文: 传输状态：向目标传输资源
            this.deliverResource(creep, task);
        }
        else {
            // Collecting state: collect resource from source
            // 中文: 收集状态：从源头收集资源
            this.collectResource(creep, task);
        }
    },

    // Function to collect resource from source
    // 中文: 从源头收集资源的函数
    collectResource: function(creep, task) {
        // Find the source structure by ID or name
        // 中文: 通过ID或名称找到源结构
        var source = this.findStructure(creep.room, task.from);
        
        if (!source) {
            creep.say('❌ no src');
            console.log(`Transferee ${creep.name}: Source '${task.from}' not found.`);
            return;
        }

        // Check if source has the required resource
        // 中文: 检查源是否有所需资源
        if (!source.store || source.store[task.what] <= 0) {
            creep.say('⚠️ empty');
            console.log(`Transferee ${creep.name}: Source '${task.from}' has no ${task.what}.`);
            return;
        }

        // Withdraw resource from source
        // 中文: 从源头提取资源
        var result = creep.withdraw(source, task.what);
        if (result == ERR_NOT_IN_RANGE) {
            creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
        } else if (result != OK) {
            creep.say('❌ fail');
            console.log(`Transferee ${creep.name}: Withdraw failed with code ${result}.`);
        }
    },

    // Function to deliver resource to target
    // 中文: 向目标传输资源的函数
    deliverResource: function(creep, task) {
        // Find the target structure by ID or name
        // 中文: 通过ID或名称找到目标结构
        var target = this.findStructure(creep.room, task.to);
        
        if (!target) {
            creep.say('❌ no tgt');
            console.log(`Transferee ${creep.name}: Target '${task.to}' not found.`);
            return;
        }

        // Check if target has space for the resource
        // 中文: 检查目标是否有空间存放资源
        if (target.store && target.store.getFreeCapacity(task.what) <= 0) {
            creep.say('⚠️ full');
            console.log(`Transferee ${creep.name}: Target '${task.to}' is full for ${task.what}.`);
            return;
        }

        // Transfer resource to target
        // 中文: 向目标传输资源
        var result = creep.transfer(target, task.what);
        if (result == ERR_NOT_IN_RANGE) {
            creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
        } else if (result == OK) {
            // Task completed successfully
            // 中文: 任务成功完成
            console.log(`Transferee ${creep.name}: Successfully transferred ${task.what} from ${task.from} to ${task.to}.`);
            
            // Check if we should repeat the task or clear it
            // 中文: 检查是否应该重复任务或清除任务
            if (task.repeat) {
                creep.say('🔄 repeat');
            } else {
                // Clear the task
                // 中文: 清除任务
                delete creep.memory.transferTask;
                creep.say('✅ done');
                console.log(`Transferee ${creep.name}: Task completed and cleared.`);
            }
        } else {
            creep.say('❌ fail');
            console.log(`Transferee ${creep.name}: Transfer failed with code ${result}.`);
        }
    },

    // Function to find structure by ID or name
    // 中文: 通过ID或名称查找结构的函数
    findStructure: function(room, identifier) {
        // Try to find by ID first
        // 中文: 首先尝试通过ID查找
        var structure = Game.getObjectById(identifier);
        if (structure) {
            return structure;
        }

        // Try to find by structure type and name/position
        // 中文: 尝试通过结构类型和名称/位置查找
        var structures = room.find(FIND_STRUCTURES);
        
        // Look for structures with matching name or type
        // 中文: 查找匹配名称或类型的结构
        for (let struct of structures) {
            if (struct.name === identifier || 
                struct.structureType === identifier ||
                (struct.id && struct.id.includes(identifier))) {
                return struct;
            }
        }

        // Try to find spawns by name
        // 中文: 尝试通过名称查找spawn
        if (Game.spawns[identifier]) {
            return Game.spawns[identifier];
        }

        return null;
    }
};

module.exports = roleTransferee;