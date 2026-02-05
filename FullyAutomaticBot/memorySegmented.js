var memorySegmented = {
    
    // Initialize segmented memory system
    // 初始化分段内存系统
    init: function() {
        // Activate segments 0, 1, 2, 3, 4, and 5 for transfer tasks
        // 激活分段0、1、2、3、4和5用于搬运任务
        RawMemory.setActiveSegments([0, 1, 2, 3, 4, 5]);
        
        // Initialize segment 0 with storage-lab transfer task if empty
        // 如果分段0为空，初始化Storage-Lab搬运任务
        if (!RawMemory.segments[0]) {
            this.initStorageLabTask();
        }
        
        // Initialize segment 1 with lab-storage transfer task if empty
        // 如果分段1为空，初始化Lab-Storage搬运任务
        if (!RawMemory.segments[1]) {
            this.initLabStorageTask();
        }
        
        // Initialize segment 2 with storage-terminal transfer task if empty
        // 如果分段2为空，初始化Storage-Terminal搬运任务
        if (!RawMemory.segments[2]) {
            this.initStorageTerminalTask();
        }
        
        // Initialize segment 3 with terminal-storage transfer task if empty
        // 如果分段3为空，初始化Terminal-Storage搬运任务
        if (!RawMemory.segments[3]) {
            this.initTerminalStorageTask();
        }
        
        // Initialize segment 4 with terminal-lab transfer task if empty
        // 如果分段4为空，初始化Terminal-Lab搬运任务
        if (!RawMemory.segments[4]) {
            this.initTerminalLabTask();
        }
        
        // Initialize segment 5 with lab-terminal transfer task if empty
        // 如果分段5为空，初始化Lab-Terminal搬运任务
        if (!RawMemory.segments[5]) {
            this.initLabTerminalTask();
        }
        
        console.log('📦 分段内存系统已初始化 - Segments 0,1,2,3,4,5 activated for transfer tasks');
    },
    
    // Initialize Storage to Lab transfer task in segment 0
    // 在分段0中初始化Storage到Lab的搬运任务
    initStorageLabTask: function() {
        var storageLabTask = {
            taskType: 'Storage搬运Lab',
            description: 'Storage到Lab的资源搬运任务',
            resourceType: null, // 搬运资源类型：为空
            status: 'waiting',
            createdTime: Game.time,
            lastUpdated: Game.time,
            config: {
                source: 'Storage',
                target: 'Lab',
                priority: 1,
                autoDetectResource: true // 自动检测需要搬运的资源类型
            }
        };
        
        // Store task in segment 0
        // 将任务存储到分段0
        RawMemory.segments[0] = JSON.stringify(storageLabTask);
        
        console.log('✅ 已在分段内存[0]存入: Storage搬运Lab，搬运资源类型：为空');
    },
    
    // Initialize Lab to Storage transfer task in segment 1
    // 在分段1中初始化Lab到Storage的搬运任务
    initLabStorageTask: function() {
        var labStorageTask = {
            taskType: 'Lab搬运Storage',
            description: 'Lab到Storage的资源搬运任务',
            resourceType: null, // 搬运资源类型：为空
            status: 'waiting',
            createdTime: Game.time,
            lastUpdated: Game.time,
            config: {
                source: 'Lab',
                target: 'Storage',
                priority: 2,
                autoDetectResource: true // 自动检测需要搬运的资源类型
            }
        };
        
        // Store task in segment 1
        // 将任务存储到分段1
        RawMemory.segments[1] = JSON.stringify(labStorageTask);
        
        console.log('✅ 已在分段内存[1]存入: Lab搬运Storage，搬运资源类型：为空');
    },
    
    // Initialize Storage to Terminal transfer task in segment 2
    // 在分段2中初始化Storage到Terminal的搬运任务
    initStorageTerminalTask: function() {
        var storageTerminalTask = {
            taskType: 'Storage搬运Terminal',
            description: 'Storage到Terminal的资源搬运任务',
            resourceType: null, // 搬运资源类型：为空
            status: 'waiting',
            createdTime: Game.time,
            lastUpdated: Game.time,
            config: {
                source: 'Storage',
                target: 'Terminal',
                priority: 3,
                autoDetectResource: true // 自动检测需要搬运的资源类型
            }
        };
        
        // Store task in segment 2
        // 将任务存储到分段2
        RawMemory.segments[2] = JSON.stringify(storageTerminalTask);
        
        console.log('✅ 已在分段内存[2]存入: Storage搬运Terminal，搬运资源类型：为空');
    },
    
    // Initialize Terminal to Storage transfer task in segment 3
    // 在分段3中初始化Terminal到Storage的搬运任务
    initTerminalStorageTask: function() {
        var terminalStorageTask = {
            taskType: 'Terminal搬运Storage',
            description: 'Terminal到Storage的资源搬运任务',
            resourceType: null, // 搬运资源类型：为空
            status: 'waiting',
            createdTime: Game.time,
            lastUpdated: Game.time,
            config: {
                source: 'Terminal',
                target: 'Storage',
                priority: 4,
                autoDetectResource: true // 自动检测需要搬运的资源类型
            }
        };
        
        // Store task in segment 3
        // 将任务存储到分段3
        RawMemory.segments[3] = JSON.stringify(terminalStorageTask);
        
        console.log('✅ 已在分段内存[3]存入: Terminal搬运Storage，搬运资源类型：为空');
    },
    
    // Initialize Terminal to Lab transfer task in segment 4
    // 在分段4中初始化Terminal到Lab的搬运任务
    initTerminalLabTask: function() {
        var terminalLabTask = {
            taskType: 'Terminal搬运Lab',
            description: 'Terminal到Lab的资源搬运任务',
            resourceType: null, // 搬运资源类型：为空
            status: 'waiting',
            createdTime: Game.time,
            lastUpdated: Game.time,
            config: {
                source: 'Terminal',
                target: 'Lab',
                priority: 5,
                autoDetectResource: true // 自动检测需要搬运的资源类型
            }
        };
        
        // Store task in segment 4
        // 将任务存储到分段4
        RawMemory.segments[4] = JSON.stringify(terminalLabTask);
        
        console.log('✅ 已在分段内存[4]存入: Terminal搬运Lab，搬运资源类型：为空');
    },
    
    // Initialize Lab to Terminal transfer task in segment 5
    // 在分段5中初始化Lab到Terminal的搬运任务
    initLabTerminalTask: function() {
        var labTerminalTask = {
            taskType: 'Lab搬运Terminal',
            description: 'Lab到Terminal的资源搬运任务',
            resourceType: null, // 搬运资源类型：为空
            status: 'waiting',
            createdTime: Game.time,
            lastUpdated: Game.time,
            config: {
                source: 'Lab',
                target: 'Terminal',
                priority: 6,
                autoDetectResource: true // 自动检测需要搬运的资源类型
            }
        };
        
        // Store task in segment 5
        // 将任务存储到分段5
        RawMemory.segments[5] = JSON.stringify(labTerminalTask);
        
        console.log('✅ 已在分段内存[5]存入: Lab搬运Terminal，搬运资源类型：为空');
    },
    
    // Get Storage-Lab task from segment 0
    // 从分段0获取Storage-Lab任务
    getStorageLabTask: function() {
        try {
            var taskData = JSON.parse(RawMemory.segments[0] || '{}');
            return taskData;
        } catch (error) {
            console.log('❌ 读取分段内存[0]失败:', error);
            return null;
        }
    },
    
    // Get Lab-Storage task from segment 1
    // 从分段1获取Lab-Storage任务
    getLabStorageTask: function() {
        try {
            var taskData = JSON.parse(RawMemory.segments[1] || '{}');
            return taskData;
        } catch (error) {
            console.log('❌ 读取分段内存[1]失败:', error);
            return null;
        }
    },
    
    // Get Storage-Terminal task from segment 2
    // 从分段2获取Storage-Terminal任务
    getStorageTerminalTask: function() {
        try {
            var taskData = JSON.parse(RawMemory.segments[2] || '{}');
            return taskData;
        } catch (error) {
            console.log('❌ 读取分段内存[2]失败:', error);
            return null;
        }
    },
    
    // Get Terminal-Storage task from segment 3
    // 从分段3获取Terminal-Storage任务
    getTerminalStorageTask: function() {
        try {
            var taskData = JSON.parse(RawMemory.segments[3] || '{}');
            return taskData;
        } catch (error) {
            console.log('❌ 读取分段内存[3]失败:', error);
            return null;
        }
    },
    
    // Get Terminal-Lab task from segment 4
    // 从分段4获取Terminal-Lab任务
    getTerminalLabTask: function() {
        try {
            var taskData = JSON.parse(RawMemory.segments[4] || '{}');
            return taskData;
        } catch (error) {
            console.log('❌ 读取分段内存[4]失败:', error);
            return null;
        }
    },
    
    // Get Lab-Terminal task from segment 5
    // 从分段5获取Lab-Terminal任务
    getLabTerminalTask: function() {
        try {
            var taskData = JSON.parse(RawMemory.segments[5] || '{}');
            return taskData;
        } catch (error) {
            console.log('❌ 读取分段内存[5]失败:', error);
            return null;
        }
    },
    
    // Update Storage-Lab task resource type (Console command)
    // 更新Storage-Lab任务的资源类型（控制台命令）
    updateResourceType: function(resourceType) {
        try {
            var taskData = JSON.parse(RawMemory.segments[0] || '{}');
            
            if (!taskData.taskType) {
                console.log('❌ 分段内存[0]中没有有效的任务数据');
                return false;
            }
            
            taskData.resourceType = resourceType;
            taskData.lastUpdated = Game.time;
            taskData.status = resourceType ? 'active' : 'waiting';
            
            RawMemory.segments[0] = JSON.stringify(taskData);
            
            console.log('🔄 已更新分段内存[0]资源类型: ' + (resourceType || '为空'));
            console.log('📊 任务状态: ' + taskData.status);
            return true;
        } catch (error) {
            console.log('❌ 更新分段内存[0]失败:', error);
            return false;
        }
    },
    
    // Update Lab-Storage task resource type (Console command)
    // 更新Lab-Storage任务的资源类型（控制台命令）
    updateLabResourceType: function(resourceType) {
        try {
            var taskData = JSON.parse(RawMemory.segments[1] || '{}');
            
            if (!taskData.taskType) {
                console.log('❌ 分段内存[1]中没有有效的任务数据');
                return false;
            }
            
            taskData.resourceType = resourceType;
            taskData.lastUpdated = Game.time;
            taskData.status = resourceType ? 'active' : 'waiting';
            
            RawMemory.segments[1] = JSON.stringify(taskData);
            
            console.log('🔄 已更新分段内存[1]资源类型: ' + (resourceType || '为空'));
            console.log('📊 任务状态: ' + taskData.status);
            return true;
        } catch (error) {
            console.log('❌ 更新分段内存[1]失败:', error);
            return false;
        }
    },
    
    // Update Storage-Terminal task resource type (Console command)
    // 更新Storage-Terminal任务的资源类型（控制台命令）
    updateTerminalResourceType: function(resourceType) {
        try {
            var taskData = JSON.parse(RawMemory.segments[2] || '{}');
            
            if (!taskData.taskType) {
                console.log('❌ 分段内存[2]中没有有效的任务数据');
                return false;
            }
            
            taskData.resourceType = resourceType;
            taskData.lastUpdated = Game.time;
            taskData.status = resourceType ? 'active' : 'waiting';
            
            RawMemory.segments[2] = JSON.stringify(taskData);
            
            console.log('🔄 已更新分段内存[2]资源类型: ' + (resourceType || '为空'));
            console.log('📊 任务状态: ' + taskData.status);
            return true;
        } catch (error) {
            console.log('❌ 更新分段内存[2]失败:', error);
            return false;
        }
    },
    
    // Update Terminal-Storage task resource type (Console command)
    // 更新Terminal-Storage任务的资源类型（控制台命令）
    updateTerminalStorageResourceType: function(resourceType) {
        try {
            var taskData = JSON.parse(RawMemory.segments[3] || '{}');
            
            if (!taskData.taskType) {
                console.log('❌ 分段内存[3]中没有有效的任务数据');
                return false;
            }
            
            taskData.resourceType = resourceType;
            taskData.lastUpdated = Game.time;
            taskData.status = resourceType ? 'active' : 'waiting';
            
            RawMemory.segments[3] = JSON.stringify(taskData);
            
            console.log('🔄 已更新分段内存[3]资源类型: ' + (resourceType || '为空'));
            console.log('📊 任务状态: ' + taskData.status);
            return true;
        } catch (error) {
            console.log('❌ 更新分段内存[3]失败:', error);
            return false;
        }
    },
    
    // Update Terminal-Lab task resource type (Console command)
    // 更新Terminal-Lab任务的资源类型（控制台命令）
    updateTerminalLabResourceType: function(resourceType) {
        try {
            var taskData = JSON.parse(RawMemory.segments[4] || '{}');
            
            if (!taskData.taskType) {
                console.log('❌ 分段内存[4]中没有有效的任务数据');
                return false;
            }
            
            taskData.resourceType = resourceType;
            taskData.lastUpdated = Game.time;
            taskData.status = resourceType ? 'active' : 'waiting';
            
            RawMemory.segments[4] = JSON.stringify(taskData);
            
            console.log('🔄 已更新分段内存[4]资源类型: ' + (resourceType || '为空'));
            console.log('📊 任务状态: ' + taskData.status);
            return true;
        } catch (error) {
            console.log('❌ 更新分段内存[4]失败:', error);
            return false;
        }
    },
    
    // Update Lab-Terminal task resource type (Console command)
    // 更新Lab-Terminal任务的资源类型（控制台命令）
    updateLabTerminalResourceType: function(resourceType) {
        try {
            var taskData = JSON.parse(RawMemory.segments[5] || '{}');
            
            if (!taskData.taskType) {
                console.log('❌ 分段内存[5]中没有有效的任务数据');
                return false;
            }
            
            taskData.resourceType = resourceType;
            taskData.lastUpdated = Game.time;
            taskData.status = resourceType ? 'active' : 'waiting';
            
            RawMemory.segments[5] = JSON.stringify(taskData);
            
            console.log('🔄 已更新分段内存[5]资源类型: ' + (resourceType || '为空'));
            console.log('📊 任务状态: ' + taskData.status);
            return true;
        } catch (error) {
            console.log('❌ 更新分段内存[5]失败:', error);
            return false;
        }
    },
    
    // Display current Storage-Lab task status (Console command)
    // 显示当前Storage-Lab任务状态（控制台命令）
    displayTaskStatus: function() {
        var task = this.getStorageLabTask();
        
        if (!task || !task.taskType) {
            console.log('❌ 分段内存[0]中没有有效的任务数据');
            console.log('💡 使用 memorySegmented.resetTask() 重新初始化任务');
            return;
        }
        
        console.log('📦 分段内存[0] - Storage-Lab任务状态:');
        console.log('═'.repeat(50));
        console.log('任务类型: ' + task.taskType);
        console.log('描述: ' + task.description);
        console.log('搬运资源类型: ' + (task.resourceType || '为空'));
        console.log('状态: ' + task.status);
        console.log('创建时间: tick ' + task.createdTime);
        console.log('最后更新: tick ' + task.lastUpdated);
        console.log('配置: ' + task.config.source + ' → ' + task.config.target);
        console.log('优先级: ' + task.config.priority);
        console.log('自动检测资源: ' + (task.config.autoDetectResource ? '是' : '否'));
        console.log('═'.repeat(50));
        console.log('');
        console.log('💡 控制台命令:');
        console.log('// memorySegmented.updateResourceType("H")     - 设置资源类型为H');
        console.log('// memorySegmented.updateResourceType(null)    - 设置资源类型为空');
        console.log('// memorySegmented.displayTaskStatus()         - 查看任务状态');
        console.log('// memorySegmented.resetTask()                 - 重置任务');
    },
    
    // Display current Lab-Storage task status (Console command)
    // 显示当前Lab-Storage任务状态（控制台命令）
    displayLabTaskStatus: function() {
        var task = this.getLabStorageTask();
        
        if (!task || !task.taskType) {
            console.log('❌ 分段内存[1]中没有有效的任务数据');
            console.log('💡 使用 memorySegmented.resetLabTask() 重新初始化任务');
            return;
        }
        
        console.log('🧪 分段内存[1] - Lab-Storage任务状态:');
        console.log('═'.repeat(50));
        console.log('任务类型: ' + task.taskType);
        console.log('描述: ' + task.description);
        console.log('搬运资源类型: ' + (task.resourceType || '为空'));
        console.log('状态: ' + task.status);
        console.log('创建时间: tick ' + task.createdTime);
        console.log('最后更新: tick ' + task.lastUpdated);
        console.log('配置: ' + task.config.source + ' → ' + task.config.target);
        console.log('优先级: ' + task.config.priority);
        console.log('自动检测资源: ' + (task.config.autoDetectResource ? '是' : '否'));
        console.log('═'.repeat(50));
        console.log('');
        console.log('💡 控制台命令:');
        console.log('// memorySegmented.updateLabResourceType("H")  - 设置资源类型为H');
        console.log('// memorySegmented.updateLabResourceType(null) - 设置资源类型为空');
        console.log('// memorySegmented.displayLabTaskStatus()      - 查看任务状态');
        console.log('// memorySegmented.resetLabTask()              - 重置任务');
    },
    
    // Display current Storage-Terminal task status (Console command)
    // 显示当前Storage-Terminal任务状态（控制台命令）
    displayTerminalTaskStatus: function() {
        var task = this.getStorageTerminalTask();
        
        if (!task || !task.taskType) {
            console.log('❌ 分段内存[2]中没有有效的任务数据');
            console.log('💡 使用 memorySegmented.resetTerminalTask() 重新初始化任务');
            return;
        }
        
        console.log('📡 分段内存[2] - Storage-Terminal任务状态:');
        console.log('═'.repeat(50));
        console.log('任务类型: ' + task.taskType);
        console.log('描述: ' + task.description);
        console.log('搬运资源类型: ' + (task.resourceType || '为空'));
        console.log('状态: ' + task.status);
        console.log('创建时间: tick ' + task.createdTime);
        console.log('最后更新: tick ' + task.lastUpdated);
        console.log('配置: ' + task.config.source + ' → ' + task.config.target);
        console.log('优先级: ' + task.config.priority);
        console.log('自动检测资源: ' + (task.config.autoDetectResource ? '是' : '否'));
        console.log('═'.repeat(50));
        console.log('');
        console.log('💡 控制台命令:');
        console.log('// memorySegmented.updateTerminalResourceType("energy") - 设置资源类型为energy');
        console.log('// memorySegmented.updateTerminalResourceType(null)     - 设置资源类型为空');
        console.log('// memorySegmented.displayTerminalTaskStatus()          - 查看任务状态');
        console.log('// memorySegmented.resetTerminalTask()                  - 重置任务');
    },
    
    // Display current Terminal-Storage task status (Console command)
    // 显示当前Terminal-Storage任务状态（控制台命令）
    displayTerminalStorageTaskStatus: function() {
        var task = this.getTerminalStorageTask();
        
        if (!task || !task.taskType) {
            console.log('❌ 分段内存[3]中没有有效的任务数据');
            console.log('💡 使用 memorySegmented.resetTerminalStorageTask() 重新初始化任务');
            return;
        }
        
        console.log('🔄 分段内存[3] - Terminal-Storage任务状态:');
        console.log('═'.repeat(50));
        console.log('任务类型: ' + task.taskType);
        console.log('描述: ' + task.description);
        console.log('搬运资源类型: ' + (task.resourceType || '为空'));
        console.log('状态: ' + task.status);
        console.log('创建时间: tick ' + task.createdTime);
        console.log('最后更新: tick ' + task.lastUpdated);
        console.log('配置: ' + task.config.source + ' → ' + task.config.target);
        console.log('优先级: ' + task.config.priority);
        console.log('自动检测资源: ' + (task.config.autoDetectResource ? '是' : '否'));
        console.log('═'.repeat(50));
        console.log('');
        console.log('💡 控制台命令:');
        console.log('// memorySegmented.updateTerminalStorageResourceType("power") - 设置资源类型为power');
        console.log('// memorySegmented.updateTerminalStorageResourceType(null)    - 设置资源类型为空');
        console.log('// memorySegmented.displayTerminalStorageTaskStatus()         - 查看任务状态');
        console.log('// memorySegmented.resetTerminalStorageTask()                 - 重置任务');
    },
    
    // Display current Terminal-Lab task status (Console command)
    // 显示当前Terminal-Lab任务状态（控制台命令）
    displayTerminalLabTaskStatus: function() {
        var task = this.getTerminalLabTask();
        
        if (!task || !task.taskType) {
            console.log('❌ 分段内存[4]中没有有效的任务数据');
            console.log('💡 使用 memorySegmented.resetTerminalLabTask() 重新初始化任务');
            return;
        }
        
        console.log('⚗️ 分段内存[4] - Terminal-Lab任务状态:');
        console.log('═'.repeat(50));
        console.log('任务类型: ' + task.taskType);
        console.log('描述: ' + task.description);
        console.log('搬运资源类型: ' + (task.resourceType || '为空'));
        console.log('状态: ' + task.status);
        console.log('创建时间: tick ' + task.createdTime);
        console.log('最后更新: tick ' + task.lastUpdated);
        console.log('配置: ' + task.config.source + ' → ' + task.config.target);
        console.log('优先级: ' + task.config.priority);
        console.log('自动检测资源: ' + (task.config.autoDetectResource ? '是' : '否'));
        console.log('═'.repeat(50));
        console.log('');
        console.log('💡 控制台命令:');
        console.log('// memorySegmented.updateTerminalLabResourceType("H")   - 设置资源类型为H');
        console.log('// memorySegmented.updateTerminalLabResourceType(null) - 设置资源类型为空');
        console.log('// memorySegmented.displayTerminalLabTaskStatus()      - 查看任务状态');
        console.log('// memorySegmented.resetTerminalLabTask()              - 重置任务');
    },
    
    // Display current Lab-Terminal task status (Console command)
    // 显示当前Lab-Terminal任务状态（控制台命令）
    displayLabTerminalTaskStatus: function() {
        var task = this.getLabTerminalTask();
        
        if (!task || !task.taskType) {
            console.log('❌ 分段内存[5]中没有有效的任务数据');
            console.log('💡 使用 memorySegmented.resetLabTerminalTask() 重新初始化任务');
            return;
        }
        
        console.log('🔬 分段内存[5] - Lab-Terminal任务状态:');
        console.log('═'.repeat(50));
        console.log('任务类型: ' + task.taskType);
        console.log('描述: ' + task.description);
        console.log('搬运资源类型: ' + (task.resourceType || '为空'));
        console.log('状态: ' + task.status);
        console.log('创建时间: tick ' + task.createdTime);
        console.log('最后更新: tick ' + task.lastUpdated);
        console.log('配置: ' + task.config.source + ' → ' + task.config.target);
        console.log('优先级: ' + task.config.priority);
        console.log('自动检测资源: ' + (task.config.autoDetectResource ? '是' : '否'));
        console.log('═'.repeat(50));
        console.log('');
        console.log('💡 控制台命令:');
        console.log('// memorySegmented.updateLabTerminalResourceType("O")   - 设置资源类型为O');
        console.log('// memorySegmented.updateLabTerminalResourceType(null) - 设置资源类型为空');
        console.log('// memorySegmented.displayLabTerminalTaskStatus()      - 查看任务状态');
        console.log('// memorySegmented.resetLabTerminalTask()              - 重置任务');
    },
    
    // Display all tasks status (Console command)
    // 显示所有任务状态（控制台命令）
    displayAllTasks: function() {
        console.log('📋 所有分段内存任务状态:');
        console.log('');
        this.displayTaskStatus();
        console.log('');
        this.displayLabTaskStatus();
        console.log('');
        this.displayTerminalTaskStatus();
        console.log('');
        this.displayTerminalStorageTaskStatus();
        console.log('');
        this.displayTerminalLabTaskStatus();
        console.log('');
        this.displayLabTerminalTaskStatus();
    },
    
    // Display help information for all available commands (Console command)
    // 显示所有可用命令的帮助信息（控制台命令）
    help: function() {
        console.log('📚 分段内存系统 - 帮助文档');
        console.log('═'.repeat(60));
        console.log('');
        console.log('🏗️ 系统概述:');
        console.log('分段内存系统管理6个不同的搬运任务，分布在分段0-5中：');
        console.log('• 分段0: Storage → Lab 搬运任务');
        console.log('• 分段1: Lab → Storage 搬运任务');
        console.log('• 分段2: Storage → Terminal 搬运任务');
        console.log('• 分段3: Terminal → Storage 搬运任务');
        console.log('• 分段4: Terminal → Lab 搬运任务');
        console.log('• 分段5: Lab → Terminal 搬运任务');
        console.log('');
        console.log('🔧 系统管理命令:');
        console.log('memorySegmented.init()                    - 初始化分段内存系统');
        console.log('memorySegmented.checkSegmentStatus()      - 检查所有分段状态');
        console.log('memorySegmented.displayAllTasks()         - 显示所有任务状态');
        console.log('memorySegmented.help()                    - 显示此帮助信息');
        console.log('');
        console.log('📦 Storage-Lab (分段0) 命令:');
        console.log('memorySegmented.updateResourceType("H")   - 设置资源类型');
        console.log('memorySegmented.displayTaskStatus()       - 查看任务状态');
        console.log('memorySegmented.clearTask()               - 清除任务');
        console.log('memorySegmented.resetTask()               - 重置任务');
        console.log('');
        console.log('🧪 Lab-Storage (分段1) 命令:');
        console.log('memorySegmented.updateLabResourceType("energy") - 设置资源类型');
        console.log('memorySegmented.displayLabTaskStatus()          - 查看任务状态');
        console.log('memorySegmented.clearLabTask()                  - 清除任务');
        console.log('memorySegmented.resetLabTask()                  - 重置任务');
        console.log('');
        console.log('📡 Storage-Terminal (分段2) 命令:');
        console.log('memorySegmented.updateTerminalResourceType("power") - 设置资源类型');
        console.log('memorySegmented.displayTerminalTaskStatus()          - 查看任务状态');
        console.log('memorySegmented.clearTerminalTask()                  - 清除任务');
        console.log('memorySegmented.resetTerminalTask()                  - 重置任务');
        console.log('');
        console.log('🔄 Terminal-Storage (分段3) 命令:');
        console.log('memorySegmented.updateTerminalStorageResourceType("U") - 设置资源类型');
        console.log('memorySegmented.displayTerminalStorageTaskStatus()     - 查看任务状态');
        console.log('memorySegmented.clearTerminalStorageTask()             - 清除任务');
        console.log('memorySegmented.resetTerminalStorageTask()             - 重置任务');
        console.log('');
        console.log('⚗️ Terminal-Lab (分段4) 命令:');
        console.log('memorySegmented.updateTerminalLabResourceType("H")  - 设置资源类型');
        console.log('memorySegmented.displayTerminalLabTaskStatus()      - 查看任务状态');
        console.log('memorySegmented.clearTerminalLabTask()              - 清除任务');
        console.log('memorySegmented.resetTerminalLabTask()              - 重置任务');
        console.log('');
        console.log('🔬 Lab-Terminal (分段5) 命令:');
        console.log('memorySegmented.updateLabTerminalResourceType("O")  - 设置资源类型');
        console.log('memorySegmented.displayLabTerminalTaskStatus()      - 查看任务状态');
        console.log('memorySegmented.clearLabTerminalTask()              - 清除任务');
        console.log('memorySegmented.resetLabTerminalTask()              - 重置任务');
        console.log('');
        console.log('💡 使用提示:');
        console.log('• 设置资源类型为null可清空任务: updateResourceType(null)');
        console.log('• 系统会自动激活所需分段并初始化任务');
        console.log('• 所有任务默认以resourceType=null（为空）状态创建');
        console.log('• 使用displayAllTasks()可快速查看所有任务状态');
        console.log('');
        console.log('🎯 常用资源类型示例:');
        console.log('• 基础资源: "energy", "H", "O", "U", "L", "K", "Z", "X"');
        console.log('• 化合物: "OH", "ZK", "UL", "G", "power"');
        console.log('• 清空资源: null');
        console.log('');
        console.log('═'.repeat(60));
        console.log('💬 需要更多帮助？使用 memorySegmented.displayAllTasks() 查看当前状态');
    },
    
    // Clear Storage-Lab task from segment 0 (Console command)
    // 清除分段0中的Storage-Lab任务（控制台命令）
    clearTask: function() {
        RawMemory.segments[0] = '';
        console.log('🗑️ 已清除分段内存[0]中的Storage-Lab任务');
        console.log('💡 使用 memorySegmented.resetTask() 重新创建任务');
    },
    
    // Clear Lab-Storage task from segment 1 (Console command)
    // 清除分段1中的Lab-Storage任务（控制台命令）
    clearLabTask: function() {
        RawMemory.segments[1] = '';
        console.log('�️ 已清除分段内存[1]中的Lab-Storage任务');
        console.log('� 使用 memorySegmented.resetLabTask() 重新创建任务');
    },
    
    // Reset Storage-Lab task to initial state (Console command)
    // 重置Storage-Lab任务到初始状态（控制台命令）
    resetTask: function() {
        this.initStorageLabTask();
        console.log('🔄 已重置分段内存[0]中的Storage-Lab任务');
        console.log('�📊 资源类型已重置为: 为空');
    },
    
    // Reset Lab-Storage task to initial state (Console command)
    // 重置Lab-Storage任务到初始状态（控制台命令）
    resetLabTask: function() {
        this.initLabStorageTask();
        console.log('🔄 已重置分段内存[1]中的Lab-Storage任务');
        console.log('📊 资源类型已重置为: 为空');
    },
    
    // Clear Storage-Terminal task from segment 2 (Console command)
    // 清除分段2中的Storage-Terminal任务（控制台命令）
    clearTerminalTask: function() {
        RawMemory.segments[2] = '';
        console.log('🗑️ 已清除分段内存[2]中的Storage-Terminal任务');
        console.log('💡 使用 memorySegmented.resetTerminalTask() 重新创建任务');
    },
    
    // Reset Storage-Terminal task to initial state (Console command)
    // 重置Storage-Terminal任务到初始状态（控制台命令）
    resetTerminalTask: function() {
        this.initStorageTerminalTask();
        console.log('🔄 已重置分段内存[2]中的Storage-Terminal任务');
        console.log('📊 资源类型已重置为: 为空');
    },
    
    // Clear Terminal-Storage task from segment 3 (Console command)
    // 清除分段3中的Terminal-Storage任务（控制台命令）
    clearTerminalStorageTask: function() {
        RawMemory.segments[3] = '';
        console.log('🗑️ 已清除分段内存[3]中的Terminal-Storage任务');
        console.log('💡 使用 memorySegmented.resetTerminalStorageTask() 重新创建任务');
    },
    
    // Reset Terminal-Storage task to initial state (Console command)
    // 重置Terminal-Storage任务到初始状态（控制台命令）
    resetTerminalStorageTask: function() {
        this.initTerminalStorageTask();
        console.log('🔄 已重置分段内存[3]中的Terminal-Storage任务');
        console.log('📊 资源类型已重置为: 为空');
    },
    
    // Clear Terminal-Lab task from segment 4 (Console command)
    // 清除分段4中的Terminal-Lab任务（控制台命令）
    clearTerminalLabTask: function() {
        RawMemory.segments[4] = '';
        console.log('🗑️ 已清除分段内存[4]中的Terminal-Lab任务');
        console.log('💡 使用 memorySegmented.resetTerminalLabTask() 重新创建任务');
    },
    
    // Reset Terminal-Lab task to initial state (Console command)
    // 重置Terminal-Lab任务到初始状态（控制台命令）
    resetTerminalLabTask: function() {
        this.initTerminalLabTask();
        console.log('🔄 已重置分段内存[4]中的Terminal-Lab任务');
        console.log('📊 资源类型已重置为: 为空');
    },
    
    // Clear Lab-Terminal task from segment 5 (Console command)
    // 清除分段5中的Lab-Terminal任务（控制台命令）
    clearLabTerminalTask: function() {
        RawMemory.segments[5] = '';
        console.log('🗑️ 已清除分段内存[5]中的Lab-Terminal任务');
        console.log('💡 使用 memorySegmented.resetLabTerminalTask() 重新创建任务');
    },
    
    // Reset Lab-Terminal task to initial state (Console command)
    // 重置Lab-Terminal任务到初始状态（控制台命令）
    resetLabTerminalTask: function() {
        this.initLabTerminalTask();
        console.log('🔄 已重置分段内存[5]中的Lab-Terminal任务');
        console.log('📊 资源类型已重置为: 为空');
    },
    
    // Check if segments 0, 1, 2, 3, 4, 5 are properly activated (Console command)
    // 检查分段0、1、2、3、4、5是否正确激活（控制台命令）
    checkSegmentStatus: function() {
        var activeSegments = RawMemory.activeSegments;
        var isSegment0Active = activeSegments && activeSegments.includes(0);
        var isSegment1Active = activeSegments && activeSegments.includes(1);
        var isSegment2Active = activeSegments && activeSegments.includes(2);
        var isSegment3Active = activeSegments && activeSegments.includes(3);
        var isSegment4Active = activeSegments && activeSegments.includes(4);
        var isSegment5Active = activeSegments && activeSegments.includes(5);
        
        console.log('📊 分段内存状态检查:');
        console.log('═'.repeat(40));
        console.log('激活的分段: [' + (activeSegments || []).join(', ') + ']');
        console.log('分段0状态: ' + (isSegment0Active ? '✅ 已激活' : '❌ 未激活'));
        console.log('分段0数据: ' + (RawMemory.segments[0] ? '✅ 有数据' : '❌ 无数据'));
        console.log('分段1状态: ' + (isSegment1Active ? '✅ 已激活' : '❌ 未激活'));
        console.log('分段1数据: ' + (RawMemory.segments[1] ? '✅ 有数据' : '❌ 无数据'));
        console.log('分段2状态: ' + (isSegment2Active ? '✅ 已激活' : '❌ 未激活'));
        console.log('分段2数据: ' + (RawMemory.segments[2] ? '✅ 有数据' : '❌ 无数据'));
        console.log('分段3状态: ' + (isSegment3Active ? '✅ 已激活' : '❌ 未激活'));
        console.log('分段3数据: ' + (RawMemory.segments[3] ? '✅ 有数据' : '❌ 无数据'));
        console.log('分段4状态: ' + (isSegment4Active ? '✅ 已激活' : '❌ 未激活'));
        console.log('分段4数据: ' + (RawMemory.segments[4] ? '✅ 有数据' : '❌ 无数据'));
        console.log('分段5状态: ' + (isSegment5Active ? '✅ 已激活' : '❌ 未激活'));
        console.log('分段5数据: ' + (RawMemory.segments[5] ? '✅ 有数据' : '❌ 无数据'));
        
        var allActive = isSegment0Active && isSegment1Active && isSegment2Active && isSegment3Active && isSegment4Active && isSegment5Active;
        
        if (!allActive) {
            console.log('');
            console.log('⚠️ 部分分段未激活，使用以下命令激活:');
            console.log('// memorySegmented.init()');
        }
        
        console.log('═'.repeat(40));
        return allActive;
    },
    
    // Silent check if segments are properly activated (Internal use)
    // 静默检查分段是否正确激活（内部使用）
    checkSegmentStatusSilent: function() {
        var activeSegments = RawMemory.activeSegments;
        var isSegment0Active = activeSegments && activeSegments.includes(0);
        var isSegment1Active = activeSegments && activeSegments.includes(1);
        var isSegment2Active = activeSegments && activeSegments.includes(2);
        var isSegment3Active = activeSegments && activeSegments.includes(3);
        var isSegment4Active = activeSegments && activeSegments.includes(4);
        var isSegment5Active = activeSegments && activeSegments.includes(5);
        
        return isSegment0Active && isSegment1Active && isSegment2Active && isSegment3Active && isSegment4Active && isSegment5Active;
    },
    
    // Run segmented memory management
    // 运行分段内存管理
    run: function() {
        // Initialize system status tracking if not exists
        // 如果不存在则初始化系统状态跟踪
        if (!Memory.memorySegmentedStatus) {
            Memory.memorySegmentedStatus = {
                initialized: false,
                lastInitTick: 0
            };
        }
        
        // Use silent check to avoid console spam
        // 使用静默检查避免控制台刷屏
        var allSegmentsActive = this.checkSegmentStatusSilent();
        
        // Only initialize if segments are not active and we haven't initialized recently
        // 只有在分段未激活且最近没有初始化时才进行初始化
        if (!allSegmentsActive && !Memory.memorySegmentedStatus.initialized) {
            console.log('🔧 分段内存系统需要初始化...');
            this.init();
            Memory.memorySegmentedStatus.initialized = true;
            Memory.memorySegmentedStatus.lastInitTick = Game.time;
            return;
        }
        
        // Auto-initialize tasks if segments are empty (only check every 10 ticks to reduce CPU)
        // 如果分段为空则自动初始化任务（每10个tick检查一次以减少CPU消耗）
        if (Game.time % 10 === 0) {
            var needsInit = false;
            
            if (!RawMemory.segments[0]) {
                this.initStorageLabTask();
                needsInit = true;
            }
            
            if (!RawMemory.segments[1]) {
                this.initLabStorageTask();
                needsInit = true;
            }
            
            if (!RawMemory.segments[2]) {
                this.initStorageTerminalTask();
                needsInit = true;
            }
            
            if (!RawMemory.segments[3]) {
                this.initTerminalStorageTask();
                needsInit = true;
            }
            
            if (!RawMemory.segments[4]) {
                this.initTerminalLabTask();
                needsInit = true;
            }
            
            if (!RawMemory.segments[5]) {
                this.initLabTerminalTask();
                needsInit = true;
            }
            
            // Mark as initialized if we had to initialize any segments
            // 如果我们必须初始化任何分段，则标记为已初始化
            if (needsInit) {
                Memory.memorySegmentedStatus.initialized = true;
                Memory.memorySegmentedStatus.lastInitTick = Game.time;
            }
        }
    }
};

// Set as global variable for easy access
// 设置为全局变量以便于访问
global.memorySegmented = memorySegmented;

module.exports = memorySegmented;