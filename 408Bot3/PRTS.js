// 可用命令（PRTS）
// [系统初始化]
// - init(): 初始化PRTS系统并挂载到 global.prts
//
// [房间停滞监控]
// - monitorRoomStagnation(): 扫描并记录房间停滞状态
// - getRoomStagnationStatus(roomName): 获取指定房间停滞报告
// - clearRoomStagnationData(roomName?): 清除某房或全部房间的停滞数据
//
// [控制器能量跟踪]
// - trackControllerEnergy(): 记录控制器进度历史（每tick）
// - getControllerEnergyStats(roomName): 获取指定房间能量统计
// - clearControllerEnergyData(roomName?): 清除控制器能量跟踪数据
//
// [控制台美化与描述]
// - describeError(code): 将错误码转为中文描述
// - describeResource(type): 将资源类型转为中文描述
// - describeStructure(type): 将结构类型转为中文描述
// - describeAction(action, result, creepName, target?): 美化动作结果
//
// [房间/爬虫分析]
// - analyzeRoom(roomName): 输出房间详细分析
// - monitorCreep(creepName): 输出爬虫详细信息
//
// [快捷命令]
// - listCreeps(): 按角色列出爬虫
// - energy(roomName?): 显示房间能量状态（默认E39N8）
// - monitor(creepName): 监控特定爬虫
// - stagnation(roomName?): 显示房间或全部房间的停滞状态
// - clearStagnation(roomName?): 清除停滞监控数据
// - controllerStats(roomName?): 显示房间或全部房间的控制器能量统计
// - clearControllerStats(roomName?): 清除控制器能量跟踪数据
//
// [帮助]
// - help(category?): 显示帮助菜单或分类命令
// - h(category?): 帮助命令简写
// - showBasicHelp(): 基础监控命令说明
// - showControllerHelp(): 控制器能量命令说明
// - showStagnationHelp(): 停滞监控命令说明
// - showFormatHelp(): 控制台美化命令说明
// - showDebugHelp(): 测试调试命令说明
// - showAllHelp(): 显示所有命令列表
//
// [可视化测试]
// - testVisualWarning(roomName?): 在房间显示停滞警告可视化
// PRTS (Precision Reconnaissance and Tactical Support) System
// PRTS（精密侦察战术支援）系统 - 控制台返回值美化器


// PRTS (Precision Reconnaissance and Tactical Support) System
// PRTS（精密侦察战术支援）系统 - 控制台返回值美化器
var PRTS = {
    
    // Room stagnation monitoring data
    // 房间停滞监控数据
    roomMonitoring: {},
    
    // Controller energy tracking data
    // 控制器能量跟踪数据
    controllerEnergyTracking: {},
    
    // Error code descriptions mapping
    // 错误代码描述映射
    errorDescriptions: {
        0: "✅ 操作成功",
        [-1]: "❌ 操作失败",
        [-2]: "❌ 目标不存在",
        [-3]: "❌ 目标已满",
        [-4]: "❌ 资源不足",
        [-5]: "❌ 名称无效",
        [-6]: "❌ 距离太远",
        [-7]: "❌ 名称已存在",
        [-8]: "❌ 爬虫忙碌中",
        [-9]: "❌ 资源类型错误",
        [-10]: "❌ 控制器等级不足",
        [-11]: "❌ GCL等级不足",
        [-12]: "❌ 权限不足",
        [-14]: "❌ 疲劳状态",
        [-15]: "❌ 房间不存在"
    },

    // Resource type descriptions
    // 资源类型描述
    resourceDescriptions: {
        'energy': '⚡ 能量',
        'power': '🔋 Power',
        'H': '🧪 氢',
        'O': '🧪 氧',
        'U': '🧪 钍',
        'L': '🧪 锂',
        'K': '🧪 钾',
        'Z': '🧪 锌',
        'X': '🧪 催化剂',
        'G': '🧪 Ghodium',
        'ops': '🔬 Ops'
    },

    // Structure type descriptions
    // 结构类型描述
    structureDescriptions: {
        'spawn': '🏭 孵化器',
        'extension': '🔌 扩展',
        'road': '🛤️ 道路',
        'constructedWall': '🧱 城墙',
        'rampart': '🛡️ 城垛',
        'controller': '🎯 控制器',
        'link': '🔗 Link',
        'storage': '📦 存储',
        'tower': '🗼 塔楼',
        'observer': '👁️ 观察者',
        'extractor': '⛏️ 提取器',
        'lab': '🧪 实验室',
        'terminal': '📡 终端',
        'container': '📦 容器'
    },

    // Initialize PRTS system
    // 初始化PRTS系统
    init: function() {
        // Add PRTS commands to global scope
        // 将PRTS命令添加到全局作用域
        global.prts = this;
        
        // Initialize room monitoring data from Memory
        // 从Memory初始化房间监控数据
        if (!Memory.prtsRoomMonitoring) {
            Memory.prtsRoomMonitoring = {};
        }
        this.roomMonitoring = Memory.prtsRoomMonitoring;
        
        // Initialize controller energy tracking from Memory
        // 从Memory初始化控制器能量跟踪数据
        if (!Memory.prtsControllerEnergyTracking) {
            Memory.prtsControllerEnergyTracking = {};
        }
        this.controllerEnergyTracking = Memory.prtsControllerEnergyTracking;
        
        console.log("🤖 PRTS系统已激活 - Precision Reconnaissance and Tactical Support Online");
    },

    // Monitor room stagnation
    // 监控房间停滞
    monitorRoomStagnation: function() {
        // Check all owned rooms
        // 检查所有拥有的房间
        for (var roomName in Game.rooms) {
            var room = Game.rooms[roomName];
            
            // Only monitor owned rooms with controller
            // 只监控有控制器的拥有房间
            if (!room.controller || !room.controller.my) {
                continue;
            }
            
            // Get spawn and extension structures
            // 获取spawn和extension结构
            var energyStructures = room.find(FIND_STRUCTURES, {
                filter: function(structure) {
                    return structure.structureType === STRUCTURE_SPAWN ||
                           structure.structureType === STRUCTURE_EXTENSION;
                }
            });
            
            // Calculate total energy capacity and current energy
            // 计算总能量容量和当前能量
            var totalCapacity = 0;
            var currentEnergy = 0;
            
            for (var i = 0; i < energyStructures.length; i++) {
                var structure = energyStructures[i];
                totalCapacity += structure.store.getCapacity(RESOURCE_ENERGY) || 0;
                currentEnergy += structure.store[RESOURCE_ENERGY] || 0;
            }
            
            // Skip rooms with capacity <= 300
            // 跳过容量 <= 300 的房间
            if (totalCapacity <= 300) {
                continue;
            }
            
            // Initialize room monitoring data if not exists
            // 如果不存在则初始化房间监控数据
            if (!this.roomMonitoring[roomName]) {
                this.roomMonitoring[roomName] = {
                    stagnantSince: null,
                    lastEnergyCheck: currentEnergy,
                    isStagnant: false
                };
            }
            
            var roomData = this.roomMonitoring[roomName];
            
            // Check if energy is at 300 or above
            // 检查能量是否在300
            if (currentEnergy === 300) {
                // If this is the first time we see 300+ energy, record the time
                // 如果这是第一次看到300+能量，记录时间
                if (roomData.stagnantSince === null) {
                    roomData.stagnantSince = Game.time;
                    roomData.lastEnergyCheck = currentEnergy;
                }
                // Check if it has been stagnant for 1500 ticks
                // 检查是否已经停滞了1500个tick
                else if (Game.time - roomData.stagnantSince >= 1500) {
                    if (!roomData.isStagnant) {
                        roomData.isStagnant = true;
                        console.log("⚠️ 房间 " + roomName + " 检测到停滞状态 - 能量维持在300+已超过1500tick");
                    }
                    
                    // Display stagnation warning in room visual
                    // 在房间视觉中显示停滞警告
                    room.visual.text("⚠️ 房间停滞", 25, 25, {
                        color: '#ff0000',
                        font: 1.2,
                        stroke: '#000000',
                        strokeWidth: 0.1,
                        backgroundColor: '#ffff00',
                        backgroundPadding: 0.3
                    });
                }
            }
            else {
                // Energy dropped below 300, reset monitoring
                // 能量降到300以下，重置监控
                if (roomData.stagnantSince !== null) {
                    if (roomData.isStagnant) {
                        console.log("✅ 房间 " + roomName + " 停滞状态已解除");
                    }
                    roomData.stagnantSince = null;
                    roomData.isStagnant = false;
                }
                roomData.lastEnergyCheck = currentEnergy;
            }
        }
        
        // Save monitoring data to Memory
        // 将监控数据保存到Memory
        Memory.prtsRoomMonitoring = this.roomMonitoring;
        
        // Also run controller energy tracking
        // 同时运行控制器能量跟踪
        this.trackControllerEnergy();
    },

    // Get room stagnation status
    // 获取房间停滞状态
    getRoomStagnationStatus: function(roomName) {
        if (!this.roomMonitoring[roomName]) {
            return "📊 房间 " + roomName + " 未在监控中";
        }
        
        var roomData = this.roomMonitoring[roomName];
        var room = Game.rooms[roomName];
        
        if (!room) {
            return "❌ 房间 " + roomName + " 不可见";
        }
        
        // Get current energy info
        // 获取当前能量信息
        var energyStructures = room.find(FIND_STRUCTURES, {
            filter: function(structure) {
                return structure.structureType === STRUCTURE_SPAWN ||
                       structure.structureType === STRUCTURE_EXTENSION;
            }
        });
        
        var totalCapacity = 0;
        var currentEnergy = 0;
        
        for (var i = 0; i < energyStructures.length; i++) {
            var structure = energyStructures[i];
            totalCapacity += structure.store.getCapacity(RESOURCE_ENERGY) || 0;
            currentEnergy += structure.store[RESOURCE_ENERGY] || 0;
        }
        
        var status = ["🏠 房间停滞监控: " + roomName];
        status.push("⚡ 当前能量: " + currentEnergy + "/" + totalCapacity);
        
        if (roomData.isStagnant) {
            var stagnantDuration = Game.time - roomData.stagnantSince;
            status.push("⚠️ 状态: 停滞中 (已持续 " + stagnantDuration + " tick)");
        } else if (roomData.stagnantSince !== null) {
            var currentDuration = Game.time - roomData.stagnantSince;
            status.push("⏳ 状态: 监控中 (已维持300+能量 " + currentDuration + "/1500 tick)");
        } else {
            status.push("✅ 状态: 正常");
        }
        
        return status.join('\n');
    },

    // Clear room stagnation data
    // 清除房间停滞数据
    clearRoomStagnationData: function(roomName) {
        if (roomName) {
            delete this.roomMonitoring[roomName];
            delete Memory.prtsRoomMonitoring[roomName];
            console.log("🗑️ 已清除房间 " + roomName + " 的停滞监控数据");
        } else {
            this.roomMonitoring = {};
            Memory.prtsRoomMonitoring = {};
            console.log("🗑️ 已清除所有房间的停滞监控数据");
        }
    },

    // Track controller energy progress over 1500 ticks
    // 跟踪控制器在1500tick内的能量进度
    trackControllerEnergy: function() {
        // Check all owned rooms
        // 检查所有拥有的房间
        for (var roomName in Game.rooms) {
            var room = Game.rooms[roomName];
            
            // Only monitor owned rooms with controller
            // 只监控有控制器的拥有房间
            if (!room.controller || !room.controller.my) {
                continue;
            }
            
            var controller = room.controller;
            var currentProgress = controller.progress || 0;
            var currentTick = Game.time;
            
            // Initialize tracking data if not exists
            // 如果不存在则初始化跟踪数据
            if (!this.controllerEnergyTracking[roomName]) {
                this.controllerEnergyTracking[roomName] = {
                    startTick: currentTick,
                    startProgress: currentProgress,
                    progressHistory: []
                };
            }
            
            var trackingData = this.controllerEnergyTracking[roomName];
            
            // Add current progress to history
            // 将当前进度添加到历史记录
            trackingData.progressHistory.push({
                tick: currentTick,
                progress: currentProgress
            });
            
            // Keep only last 1500 ticks of data
            // 只保留最近1500tick的数据
            var cutoffTick = currentTick - 1500;
            trackingData.progressHistory = trackingData.progressHistory.filter(function(entry) {
                return entry.tick > cutoffTick;
            });
            
            // Update start point if we have data older than 1500 ticks
            // 如果有超过1500tick的数据，更新起始点
            if (trackingData.progressHistory.length > 0) {
                var oldestEntry = trackingData.progressHistory[0];
                trackingData.startTick = oldestEntry.tick;
                trackingData.startProgress = oldestEntry.progress;
            }
            
            // Calculate and display energy increase over 1500 ticks
            // 计算并显示1500tick内的能量增加
            if (currentTick - trackingData.startTick >= 1500 || trackingData.progressHistory.length >= 1500) {
                var energyIncrease = currentProgress - trackingData.startProgress;
                var ticksPassed = currentTick - trackingData.startTick;
                var averagePerTick = ticksPassed > 0 ? (energyIncrease / ticksPassed).toFixed(2) : 0;
                
                console.log("📊 房间 " + roomName + " 控制器能量统计 (过去" + Math.min(ticksPassed, 1500) + "tick):");
                console.log("  ⚡ 能量增加: " + energyIncrease + " (从 " + trackingData.startProgress + " 到 " + currentProgress + ")");
                console.log("  📈 平均每tick: " + averagePerTick);
                console.log("  🎯 当前等级: RCL" + controller.level + " (" + currentProgress + "/" + (controller.progressTotal || 0) + ")");
            }
        }
        
        // Save tracking data to Memory
        // 将跟踪数据保存到Memory
        Memory.prtsControllerEnergyTracking = this.controllerEnergyTracking;
    },

    // Get controller energy statistics for a specific room
    // 获取特定房间的控制器能量统计
    getControllerEnergyStats: function(roomName) {
        if (!this.controllerEnergyTracking[roomName]) {
            return "📊 房间 " + roomName + " 未在控制器能量跟踪中";
        }
        
        var room = Game.rooms[roomName];
        if (!room || !room.controller || !room.controller.my) {
            return "❌ 房间 " + roomName + " 不可见或无控制器";
        }
        
        var trackingData = this.controllerEnergyTracking[roomName];
        var controller = room.controller;
        var currentProgress = controller.progress || 0;
        var currentTick = Game.time;
        
        var ticksPassed = currentTick - trackingData.startTick;
        var energyIncrease = currentProgress - trackingData.startProgress;
        var averagePerTick = ticksPassed > 0 ? (energyIncrease / ticksPassed).toFixed(2) : 0;
        
        var stats = ["🎯 控制器能量统计: " + roomName];
        stats.push("📅 跟踪时长: " + Math.min(ticksPassed, 1500) + " tick");
        stats.push("⚡ 能量增加: " + energyIncrease + " (从 " + trackingData.startProgress + " 到 " + currentProgress + ")");
        stats.push("📈 平均每tick: " + averagePerTick);
        stats.push("🎯 当前等级: RCL" + controller.level);
        stats.push("📊 当前进度: " + currentProgress + "/" + (controller.progressTotal || 0) + " (" + 
                  Math.round((currentProgress / (controller.progressTotal || 1)) * 100) + "%)");
        
        return stats.join('\n');
    },

    // Clear controller energy tracking data
    // 清除控制器能量跟踪数据
    clearControllerEnergyData: function(roomName) {
        if (roomName) {
            delete this.controllerEnergyTracking[roomName];
            delete Memory.prtsControllerEnergyTracking[roomName];
            console.log("🗑️ 已清除房间 " + roomName + " 的控制器能量跟踪数据");
        } else {
            this.controllerEnergyTracking = {};
            Memory.prtsControllerEnergyTracking = {};
            console.log("🗑️ 已清除所有房间的控制器能量跟踪数据");
        }
    },

    // Describe error code
    // 描述错误代码
    describeError: function(errorCode) {
        return this.errorDescriptions[errorCode] || `未知错误: ${errorCode}`;
    },

    // Describe resource
    // 描述资源
    describeResource: function(resourceType) {
        return this.resourceDescriptions[resourceType] || resourceType;
    },

    // Describe structure
    // 描述结构
    describeStructure: function(structureType) {
        return this.structureDescriptions[structureType] || structureType;
    },

    // Describe creep action result
    // 描述爬虫动作结果
    describeAction: function(action, result, creepName, target) {
        var description = this.errorDescriptions[result] || ("未知结果: " + result);
        var actionName = this.getActionName(action);
        var targetDesc = target ? (" 目标: " + target) : '';
        
        return "🤖 " + creepName + " " + actionName + " - " + description + targetDesc;
    },

    // Get action name in Chinese
    // 获取中文动作名称
    getActionName: function(action) {
        var actionNames = {
            'move': '移动',
            'moveTo': '移动到',
            'harvest': '采集',
            'withdraw': '提取',
            'transfer': '传输',
            'build': '建造',
            'repair': '修复',
            'upgradeController': '升级控制器',
            'attack': '攻击',
            'heal': '治疗',
            'pickup': '拾取',
            'drop': '丢弃'
        };
        return actionNames[action] || action;
    },

    // Analyze room status
    // 分析房间状态
    analyzeRoom: function(roomName) {
        var room = Game.rooms[roomName];
        if (!room) {
            return "❌ 房间 " + roomName + " 不可见";
        }

        var analysis = ["🏠 房间分析: " + roomName];
        
        // Controller info
        // 控制器信息
        if (room.controller) {
            var controller = room.controller;
            var level = controller.level || 0;
            var progress = controller.progress || 0;
            var progressTotal = controller.progressTotal || 0;
            var percentage = progressTotal > 0 ? Math.round((progress / progressTotal) * 100) : 0;
            
            analysis.push("🎯 控制器: RCL" + level + " (" + progress + "/" + progressTotal + " - " + percentage + "%)");
        }

        // Energy info
        // 能量信息
        var structures = room.find(FIND_STRUCTURES);
        var spawns = structures.filter(function(s) { return s.structureType === STRUCTURE_SPAWN; });
        var extensions = structures.filter(function(s) { return s.structureType === STRUCTURE_EXTENSION; });
        
        var totalEnergy = 0;
        var totalCapacity = 0;
        var allEnergyStructures = spawns.concat(extensions);
        for (var i = 0; i < allEnergyStructures.length; i++) {
            var s = allEnergyStructures[i];
            totalEnergy += s.store[RESOURCE_ENERGY] || 0;
            totalCapacity += s.store.getCapacity(RESOURCE_ENERGY) || 0;
        }
        
        var energyPercentage = totalCapacity > 0 ? Math.round((totalEnergy / totalCapacity) * 100) : 0;
        analysis.push("⚡ 能量: " + totalEnergy + "/" + totalCapacity + " (" + energyPercentage + "%)");

        // Creep count
        // 爬虫数量
        var creeps = room.find(FIND_MY_CREEPS);
        analysis.push("🤖 爬虫数量: " + creeps.length);

        // Sources
        // 能量源
        var sources = room.find(FIND_SOURCES);
        analysis.push("💎 能量源: " + sources.length + "个");

        return analysis.join('\n');
    },

    // Monitor creep performance
    // 监控爬虫性能
    monitorCreep: function(creepName) {
        var creep = Game.creeps[creepName];
        if (!creep) {
            return "❌ 爬虫 " + creepName + " 不存在";
        }

        var info = ["🤖 爬虫监控: " + creepName];
        info.push("📍 位置: (" + creep.pos.x + ", " + creep.pos.y + ") 房间: " + creep.pos.roomName);
        info.push("🎭 角色: " + (creep.memory.role || '未设置'));
        info.push("💾 存储: " + creep.store.getUsedCapacity() + "/" + creep.store.getCapacity());
        info.push("⏱️ 生命周期: " + (creep.ticksToLive || '永久'));
        info.push("🔋 疲劳: " + creep.fatigue);
        
        // Body parts
        // 身体部件
        var bodyParts = {};
        for (var i = 0; i < creep.body.length; i++) {
            var part = creep.body[i];
            bodyParts[part.type] = (bodyParts[part.type] || 0) + 1;
        }
        var bodyStr = Object.keys(bodyParts).map(function(type) {
            return type + "×" + bodyParts[type];
        }).join(', ');
        info.push("🦾 身体: " + bodyStr);

        return info.join('\n');
    },

    // Quick command: List all creeps by role
    // 快捷命令：按角色列出所有爬虫
    listCreeps: function() {
        var roles = {};
        for (var name in Game.creeps) {
            var role = Game.creeps[name].memory.role || 'unknown';
            if (!roles[role]) roles[role] = [];
            roles[role].push(name);
        }
        
        console.log('🤖 爬虫列表:');
        for (var role in roles) {
            console.log('  ' + role + ': ' + roles[role].length + '个 - ' + roles[role].join(', '));
        }
    },

    // Quick command: Show room energy status
    // 快捷命令：显示房间能量状态
    energy: function(roomName) {
        roomName = roomName || 'E39N8';
        console.log(this.analyzeRoom(roomName));
    },

    // Quick command: Monitor specific creep
    // 快捷命令：监控特定爬虫
    monitor: function(creepName) {
        console.log(this.monitorCreep(creepName));
    },

    // Quick command: Check room stagnation status
    // 快捷命令：检查房间停滞状态
    stagnation: function(roomName) {
        if (roomName) {
            console.log(this.getRoomStagnationStatus(roomName));
        } else {
            console.log("📊 所有房间停滞监控状态:");
            for (var room in this.roomMonitoring) {
                console.log(this.getRoomStagnationStatus(room));
                console.log("─".repeat(40));
            }
        }
    },

    // Quick command: Clear stagnation data
    // 快捷命令：清除停滞数据
    clearStagnation: function(roomName) {
        this.clearRoomStagnationData(roomName);
    },

    // Quick command: Show controller energy statistics
    // 快捷命令：显示控制器能量统计
    controllerStats: function(roomName) {
        if (roomName) {
            console.log(this.getControllerEnergyStats(roomName));
        } else {
            console.log("📊 所有房间控制器能量统计:");
            for (var room in this.controllerEnergyTracking) {
                console.log(this.getControllerEnergyStats(room));
                console.log("─".repeat(40));
            }
        }
    },

    // Quick command: Clear controller energy tracking data
    // 快捷命令：清除控制器能量跟踪数据
    clearControllerStats: function(roomName) {
        this.clearControllerEnergyData(roomName);
    },

    // Help command: Show all available PRTS commands
    // 帮助命令：显示所有可用的PRTS命令
    help: function(category) {
        if (!category) {
            // Show main help menu
            // 显示主帮助菜单
            console.log('🤖 PRTS 精密侦察战术支援系统 - 帮助菜单');
            console.log('═'.repeat(50));
            console.log('');
            console.log('� 可用命令分类:');
            console.log('// prts.help("basic")     - 基础监控命令');
            console.log('// prts.help("controller") - 控制器能量跟踪命令');
            console.log('// prts.help("stagnation") - 停滞监控命令');
            console.log('// prts.help("format")    - 控制台美化命令');
            console.log('// prts.help("debug")     - 测试调试命令');
            console.log('// prts.help("all")       - 显示所有命令');
            console.log('');
            console.log('💡 使用方法: prts.help("分类名") 查看具体命令');
            console.log('💡 快捷方式: prts.h("分类名")');
            console.log('');
            console.log('🔧 系统状态:');
            var monitoredRooms = Object.keys(this.roomMonitoring).length;
            var trackedControllers = Object.keys(this.controllerEnergyTracking).length;
            console.log('- 监控房间: ' + monitoredRooms + ' 个');
            console.log('- 跟踪控制器: ' + trackedControllers + ' 个');
            console.log('- 系统状态: 运行中');
            console.log('═'.repeat(50));
            return;
        }

        category = category.toLowerCase();
        
        switch(category) {
            case 'basic':
            case 'b':
                this.showBasicHelp();
                break;
            case 'controller':
            case 'c':
                this.showControllerHelp();
                break;
            case 'stagnation':
            case 's':
                this.showStagnationHelp();
                break;
            case 'format':
            case 'f':
                this.showFormatHelp();
                break;
            case 'debug':
            case 'd':
                this.showDebugHelp();
                break;
            case 'all':
            case 'a':
                this.showAllHelp();
                break;
            default:
                console.log('❌ 未知分类: ' + category);
                console.log('💡 使用 prts.help() 查看可用分类');
        }
    },

    // Show basic monitoring commands help
    // 显示基础监控命令帮助
    showBasicHelp: function() {
        console.log('📊 PRTS - 基础监控命令');
        console.log('─'.repeat(40));
        console.log('// prts.listCreeps()              - 按角色列出所有爬虫');
        console.log('// prts.energy("E39N8")           - 显示房间能量状态');
        console.log('// prts.monitor("爬虫名称")        - 监控特定爬虫详细信息');
        console.log('');
        console.log('💡 房间名称可选，默认为 "E39N8"');
    },

    // Show controller energy tracking commands help
    // 显示控制器能量跟踪命令帮助
    showControllerHelp: function() {
        console.log('🎯 PRTS - 控制器能量跟踪命令');
        console.log('─'.repeat(40));
        console.log('// prts.controllerStats("E39N8")  - 查看特定房间控制器能量统计');
        console.log('// prts.controllerStats()         - 查看所有房间控制器能量统计');
        console.log('// prts.clearControllerStats("E39N8") - 清除特定房间控制器跟踪数据');
        console.log('// prts.clearControllerStats()    - 清除所有房间控制器跟踪数据');
        console.log('');
        console.log('💡 自动跟踪1500tick内控制器能量增加');
        console.log('💡 每tick自动在控制台输出统计信息');
        console.log('💡 显示平均每tick能量增长率');
    },

    // Show stagnation monitoring commands help
    // 显示停滞监控命令帮助
    showStagnationHelp: function() {
        console.log('⚠️ PRTS - 停滞监控命令');
        console.log('─'.repeat(40));
        console.log('// prts.stagnation("E39N8")       - 查看特定房间停滞状态');
        console.log('// prts.stagnation()              - 查看所有房间停滞状态');
        console.log('// prts.clearStagnation("E39N8")  - 清除特定房间停滞数据');
        console.log('// prts.clearStagnation()         - 清除所有房间停滞数据');
        console.log('');
        console.log('💡 停滞条件: 容量>300且能量维持300+超过1500tick');
        console.log('💡 停滞时会在房间(25,25)显示视觉警告');
    },

    // Show format commands help
    // 显示格式化命令帮助
    showFormatHelp: function() {
        console.log('🎨 PRTS - 控制台美化命令');
        console.log('─'.repeat(40));
        console.log('// prts.describeError(-6)         - 描述错误代码');
        console.log('// prts.describeResource("energy") - 描述资源类型');
        console.log('// prts.describeStructure("spawn") - 描述结构类型');
        console.log('// prts.describeAction("moveTo", result, "creepName", "target")');
        console.log('');
        console.log('💡 将游戏返回值转换为中文描述');
    },

    // Show debug commands help
    // 显示调试命令帮助
    showDebugHelp: function() {
        console.log('🧪 PRTS - 测试调试命令');
        console.log('─'.repeat(40));
        console.log('// prts.testVisualWarning("E39N8") - 测试房间视觉警告效果');
        console.log('// prts.analyzeRoom("E39N8")       - 详细分析房间状态');
        console.log('// prts.monitorCreep("爬虫名称")   - 获取爬虫详细监控信息');
        console.log('');
        console.log('💡 用于测试和调试PRTS功能');
    },

    // Show all commands help
    // 显示所有命令帮助
    showAllHelp: function() {
        console.log('🤖 PRTS - 所有可用命令');
        console.log('═'.repeat(50));
        this.showBasicHelp();
        console.log('');
        this.showControllerHelp();
        console.log('');
        this.showStagnationHelp();
        console.log('');
        this.showFormatHelp();
        console.log('');
        this.showDebugHelp();
        console.log('');
        console.log('❓ 帮助命令:');
        console.log('// prts.help()                    - 显示帮助菜单');
        console.log('// prts.h("分类")                 - 快捷帮助');
        console.log('');
        console.log('💡 所有命令以 "// " 开头防止误触，使用时请去掉');
        console.log('═'.repeat(50));
    },

    // Short alias for help command
    // help命令的简写别名
    h: function(category) {
        this.help(category);
    },

    // Test visual warning display
    // 测试视觉警告显示
    testVisualWarning: function(roomName) {
        roomName = roomName || 'E39N8';
        var room = Game.rooms[roomName];
        
        if (!room) {
            console.log("❌ 房间 " + roomName + " 不可见，无法显示视觉警告");
            return;
        }
        
        // Display the stagnation warning at (25,25)
        // 在(25,25)位置显示停滞警告
        room.visual.text("⚠️ 房间停滞", 25, 25, {
            color: '#ff0000',
            font: 1.2,
            stroke: '#000000',
            strokeWidth: 0.1,
            backgroundColor: '#ffff00',
            backgroundPadding: 0.3
        });
        
        // Also add some additional test visuals for comparison
        // 同时添加一些额外的测试视觉效果进行对比
        room.visual.text("测试文本 - 普通", 20, 20, {
            color: '#ffffff',
            font: 1.0
        });
        
        room.visual.text("测试文本 - 大号", 20, 22, {
            color: '#00ff00',
            font: 1.5
        });
        
        room.visual.text("测试文本 - 带背景", 20, 24, {
            color: '#0000ff',
            font: 1.0,
            backgroundColor: '#ffffff',
            backgroundPadding: 0.2
        });
        
        room.visual.text("测试文本 - 带描边", 20, 26, {
            color: '#ffffff',
            font: 1.0,
            stroke: '#000000',
            strokeWidth: 0.15
        });
        
        // Add coordinate markers for reference
        // 添加坐标标记作为参考
        room.visual.circle(25, 25, {
            radius: 0.5,
            fill: 'transparent',
            stroke: '#ff0000',
            strokeWidth: 0.1,
            opacity: 0.8
        });
        
        room.visual.text("(25,25)", 25, 27, {
            color: '#ff0000',
            font: 0.8
        });
        
        console.log("🎨 已在房间 " + roomName + " 显示测试视觉警告");
        console.log("📍 主警告位置: (25, 25)");
        console.log("📍 测试文本位置: (20, 20-26)");
        console.log("🔴 红色圆圈标记了(25,25)的确切位置");
        console.log("⏰ 视觉效果将在下一个tick刷新时消失");
    }
};

// Auto-initialize PRTS when loaded
// 加载时自动初始化PRTS
PRTS.init();

module.exports = PRTS;