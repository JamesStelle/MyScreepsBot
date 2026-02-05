// runGeneralRoom.js - 通用房间管理系统
// General Room Management System

// Load configuration
// 加载配置文件
var config = require('config');

var runGeneralRoom = {
    
    // Room Controller Level Configuration
    // 房间控制器等级配置
    roomLevelConfig: {
        // Spawn configuration by controller level
        // 按控制器等级的Spawn配置
        spawns: {
            1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1,  // RCL 1-6: 1 spawn
            7: 2,                                   // RCL 7: 2 spawns  
            8: 3                                    // RCL 8: 3 spawns
        },
        
        // Extension configuration by controller level
        // 按控制器等级的Extension配置
        extensions: {
            1: 0,   // RCL 1: 0 extensions
            2: 5,   // RCL 2: 5 extensions
            3: 10,  // RCL 3: 10 extensions
            4: 20,  // RCL 4: 20 extensions
            5: 30,  // RCL 5: 30 extensions
            6: 40,  // RCL 6: 40 extensions
            7: 50,  // RCL 7: 50 extensions
            8: 60   // RCL 8: 60 extensions
        },
        
        // Extension energy capacity by controller level
        // 按控制器等级的Extension能量容量
        extensionCapacity: {
            1: 0,   // RCL 1: 0 capacity (no extensions)
            2: 50,  // RCL 2: 50 energy per extension
            3: 50,  // RCL 3: 50 energy per extension
            4: 50,  // RCL 4: 50 energy per extension
            5: 50,  // RCL 5: 50 energy per extension
            6: 50,  // RCL 6: 50 energy per extension
            7: 100, // RCL 7: 100 energy per extension
            8: 200  // RCL 8: 200 energy per extension
        }
    },
    
    // Constants
    // 常量
    SPAWN_ENERGY_CAPACITY: 300,  // Each spawn has 300 energy capacity
    
    // Role spawn quantity configuration by RCL level
    // 按RCL等级的角色生成数量配置
    roleSpawnQuantity: {
        // RCL1: 基础生存阶段，只需要基本角色
        1: {
            harvester0: 1,      // 采集者0数量
            harvester1: 1,      // 采集者1数量
            carrier: 0,         // 运输者数量 - RCL1通常没有Container
            carrierMineral: 0,  // 矿物运输者数量 - RCL1没有矿物开采
            upgrader: 2,        // 升级者数量
            builder: 2          // 建造者数量
        },
        
        // RCL2: 开始扩展，但Container可能还未建造
        2: {
            harvester0: 1,      // 采集者0数量
            harvester1: 1,      // 采集者1数量
            carrier: 0,         // 运输者数量 - RCL2可能还没有Container
            carrierMineral: 0,  // 矿物运输者数量 - RCL2没有矿物开采
            upgrader: 2,        // 升级者数量
            builder: 2          // 建造者数量
        },
        
        // RCL3: 开始使用Container和更复杂的物流
        3: {
            harvester0: 1,      // 采集者0数量
            harvester1: 1,      // 采集者1数量
            carrier: 1,         // 运输者数量 - RCL3开始需要carrier
            carrierMineral: 0,  // 矿物运输者数量 - RCL3还没有矿物开采
            upgrader: 1,        // 升级者数量
            builder: 1          // 建造者数量
        },
        
        // RCL4: 稳定发展阶段
        4: {
            harvester0: 1,      // 采集者0数量
            harvester1: 1,      // 采集者1数量
            carrier: 1,         // 运输者数量
            carrierMineral: 0,  // 矿物运输者数量 - RCL4还没有矿物开采
            upgrader: 1,        // 升级者数量
            builder: 1          // 建造者数量
        },
        
        // RCL5: 中级发展阶段
        5: {
            harvester0: 1,      // 采集者0数量
            harvester1: 1,      // 采集者1数量
            carrier: 1,         // 运输者数量
            carrierMineral: 0,  // 矿物运输者数量 - RCL5还没有矿物开采
            upgrader: 1,        // 升级者数量
            builder: 1          // 建造者数量
        },
        
        // RCL6: 开始矿物开采，有Extractor和Terminal
        6: {
            harvester0: 1,      // 采集者0数量
            harvester1: 1,      // 采集者1数量
            carrier: 1,         // 运输者数量
            carrierMineral: 1,  // 矿物运输者数量 - RCL6开始矿物开采
            upgrader: 1,        // 升级者数量
            builder: 1          // 建造者数量
        },
        
        // RCL7: 高级发展阶段，多个Spawn
        7: {
            harvester0: 1,      // 采集者0数量
            harvester1: 1,      // 采集者1数量
            carrier: 1,         // 运输者数量
            carrierMineral: 1,  // 矿物运输者数量
            upgrader: 1,        // 升级者数量
            builder: 1          // 建造者数量
        },
        
        // RCL8: 最高等级，资源充足
        8: {
            harvester0: 1,      // 采集者0数量
            harvester1: 1,      // 采集者1数量
            carrier: 1,         // 运输者数量
            carrierMineral: 1,  // 矿物运输者数量
            upgrader: 1,        // 升级者数量
            builder: 1          // 建造者数量
        }
    },

    // Role body configurations for each specific RCL level
    // 每个RCL等级的专用角色身体配置
    roleBodyConfigurations: {
        // RCL1: 1 Spawn(300) + 0 Extensions = 300 energy max per creep
        // RCL1: 1个Spawn(300) + 0个Extensions = 单次生产最大300能量
        1: {
            harvester0: [MOVE,MOVE,WORK,CARRY,CARRY], // 300 energy
            harvester1: [MOVE,MOVE,WORK,CARRY,CARRY], // 300 energy
            carrier: [CARRY, CARRY, CARRY, CARRY, MOVE, MOVE], // 300 energy
            carrierMineral: [CARRY, CARRY, CARRY, CARRY, MOVE, MOVE], // 300 energy
            upgrader: [MOVE,MOVE,WORK,CARRY,CARRY], // 300 energy
            builder: [MOVE,MOVE,WORK,CARRY,CARRY] // 300 energy
        },
        
        // RCL2: 1 Spawn(300) + 5 Extensions(50×5=250) = 550 energy max per creep
        // RCL2: 1个Spawn(300) + 5个Extensions(50×5=250) = 单次生产最大550能量
        2: {
            harvester0: [MOVE,MOVE,MOVE,WORK,WORK,WORK,CARRY,CARRY], // 500 energy
            harvester1: [MOVE,MOVE,MOVE,WORK,WORK,WORK,CARRY,CARRY], // 500 energy
            carrier: [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], // 550 energy
            carrierMineral: [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], // 550 energy
            upgrader: [MOVE,MOVE,MOVE,WORK,WORK,WORK,CARRY,CARRY], // 500 energy
            builder: [MOVE,MOVE,MOVE,WORK,WORK,WORK,CARRY,CARRY] // 550 energy
        },
        
        // RCL3: 1 Spawn(300) + 10 Extensions(50×10=500) = 800 energy max per creep
        // RCL3: 1个Spawn(300) + 10个Extensions(50×10=500) = 单次生产最大800能量
        3: {
            harvester0: [MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,CARRY], // 800 energy
            harvester1: [MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,CARRY], // 800 energy
            carrier: [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE], // 800 energy
            carrierMineral: [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE], // 800 energy
            upgrader: [MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,CARRY], // 800 energy
            builder: [MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,CARRY,CARRY] // 750 energy
        },
        
        // RCL4: 1 Spawn(300) + 20 Extensions(50×20=1000) = 1300 energy max per creep
        // RCL4: 1个Spawn(300) + 20个Extensions(50×20=1000) = 单次生产最大1300能量
        4: {
            harvester0: [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE], // 1300 energy
            harvester1: [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE], // 1300 energy
            carrier: [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], // 1200 energy
            carrierMineral: [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], // 1200 energy
            upgrader: [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], // 1200 energy
            builder: [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE] // 1200 energy
        },
        
        // RCL5: 1 Spawn(300) + 30 Extensions(50×30=1500) = 1800 energy max per creep
        // RCL5: 1个Spawn(300) + 30个Extensions(50×30=1500) = 单次生产最大1800能量
        5: {
            harvester0: [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], // 1350 energy
            harvester1: [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], // 1350 energy
            carrier: [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], // 1350 energy
            carrierMineral: [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], // 1350 energy
            upgrader: [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY], // 1450 energy
            builder: [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE] // 1400 energy
        },
        
        // RCL6: 1 Spawn(300) + 40 Extensions(50×40=2000) = 2300 energy max per creep
        // RCL6: 1个Spawn(300) + 40个Extensions(50×40=2000) = 单次生产最大2300能量
        6: {
            harvester0: [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], // 1600 energy
            harvester1: [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], // 1600 energy
            carrier: [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], // 1650 energy
            carrierMineral: [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], // 1650 energy
            upgrader: [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], // 1700 energy
            builder: [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE] // 1550 energy
        },
        
        // RCL7: 1 Spawn(300) + 50 Extensions(100×50=5000) = 5300 energy max per creep
        // RCL7: 1个Spawn(300) + 50个Extensions(100×50=5000) = 单次生产最大5300能量
        // 注意：使用RCL6配置以适应1500tick内30000能量的生产限制
        7: {
            harvester0: [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], // 1600 energy
            harvester1: [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], // 1600 energy
            carrier: [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], // 1650 energy
            carrierMineral: [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], // 1650 energy
            upgrader: [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], // 1700 energy
            builder: [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE] // 1550 energy
        },
        
        // RCL8: 1 Spawn(300) + 60 Extensions(200×60=12000) = 12300 energy max per creep
        // RCL8: 1个Spawn(300) + 60个Extensions(200×60=12000) = 单次生产最大12300能量
        // 注意：使用RCL6配置以适应1500tick内30000能量的生产限制
        8: {
            harvester0: [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], // 1600 energy
            harvester1: [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], // 1600 energy
            carrier: [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], // 1650 energy
            carrierMineral: [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], // 1650 energy
            upgrader: [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], // 1700 energy
            builder: [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE] // 1550 energy
        }
    },
    
    // Calculate total energy capacity for a given controller level
    // 计算指定控制器等级的总能量容量
    calculateTotalCapacity: function(controllerLevel) {
        if (controllerLevel < 1 || controllerLevel > 8) {
            console.log('❌ 无效的控制器等级: ' + controllerLevel + ' (有效范围: 1-8)');
            return null;
        }
        
        // Get configuration for this level
        // 获取此等级的配置
        var spawnCount = this.roomLevelConfig.spawns[controllerLevel];
        var extensionCount = this.roomLevelConfig.extensions[controllerLevel];
        var extensionCapacity = this.roomLevelConfig.extensionCapacity[controllerLevel];
        
        // Calculate capacities
        // 计算容量
        var totalSpawnCapacity = spawnCount * this.SPAWN_ENERGY_CAPACITY;
        var totalExtensionCapacity = extensionCount * extensionCapacity;
        var totalCapacity = totalSpawnCapacity + totalExtensionCapacity;
        
        return {
            level: controllerLevel,
            spawns: {
                count: spawnCount,
                capacity: this.SPAWN_ENERGY_CAPACITY,
                totalCapacity: totalSpawnCapacity
            },
            extensions: {
                count: extensionCount,
                capacity: extensionCapacity,
                totalCapacity: totalExtensionCapacity
            },
            total: {
                structures: spawnCount + extensionCount,
                capacity: totalCapacity
            }
        };
    },
    
    // Calculate maximum energy available for single creep production
    // 计算单次生产爬虫的最大可用能量
    calculateMaxCreepEnergy: function(controllerLevel) {
        if (controllerLevel < 1 || controllerLevel > 8) {
            return 0;
        }
        
        // Single spawn energy (300) + all extensions energy
        // 单个spawn能量(300) + 所有extension能量
        var extensionCount = this.roomLevelConfig.extensions[controllerLevel];
        var extensionCapacity = this.roomLevelConfig.extensionCapacity[controllerLevel];
        var totalExtensionCapacity = extensionCount * extensionCapacity;
        
        // Maximum energy for single creep = 1 spawn + all extensions
        // 单次生产最大能量 = 1个spawn + 所有extensions
        return this.SPAWN_ENERGY_CAPACITY + totalExtensionCapacity;
    },
    
    // Get role spawn quantities for a specific RCL level
    // 获取指定RCL等级的角色生成数量
    getRoleSpawnQuantities: function(controllerLevel) {
        if (controllerLevel >= 1 && controllerLevel <= 8) {
            return this.roleSpawnQuantity[controllerLevel];
        } else {
            console.log('❌ 无效的控制器等级: ' + controllerLevel + ' (有效范围: 1-8)');
            return this.roleSpawnQuantity[1]; // 默认返回RCL1配置
        }
    },

    // Set role spawn quantity for a specific role and RCL level
    // 设置特定角色和RCL等级的生成数量
    setRoleSpawnQuantity: function(controllerLevel, roleName, quantity) {
        if (controllerLevel < 1 || controllerLevel > 8) {
            console.log('❌ 无效的控制器等级: ' + controllerLevel + ' (有效范围: 1-8)');
            return false;
        }
        
        if (this.roleSpawnQuantity[controllerLevel] && this.roleSpawnQuantity[controllerLevel].hasOwnProperty(roleName)) {
            var oldQuantity = this.roleSpawnQuantity[controllerLevel][roleName];
            this.roleSpawnQuantity[controllerLevel][roleName] = quantity;
            console.log('✅ 已更新 RCL' + controllerLevel + ' ' + roleName + ' 生成数量: ' + oldQuantity + ' → ' + quantity);
            return true;
        } else {
            console.log('❌ 未知角色: ' + roleName + ' 或无效等级: RCL' + controllerLevel);
            console.log('💡 可用角色: ' + Object.keys(this.roleSpawnQuantity[1]).join(', '));
            return false;
        }
    },

    // Set spawn quantities for all roles at a specific RCL level
    // 设置特定RCL等级所有角色的生成数量
    setAllRoleSpawnQuantities: function(controllerLevel, quantities) {
        if (controllerLevel < 1 || controllerLevel > 8) {
            console.log('❌ 无效的控制器等级: ' + controllerLevel + ' (有效范围: 1-8)');
            return { updated: 0, failed: 1 };
        }
        
        console.log('🔧 批量设置RCL' + controllerLevel + '角色生成数量...');
        var updated = 0;
        var failed = 0;
        
        for (var roleName in quantities) {
            if (this.setRoleSpawnQuantity(controllerLevel, roleName, quantities[roleName])) {
                updated++;
            } else {
                failed++;
            }
        }
        
        console.log('📊 批量设置结果: 成功' + updated + '个, 失败' + failed + '个');
        return { updated: updated, failed: failed };
    },

    // Display current spawn quantities for a specific RCL level or all levels
    // 显示特定RCL等级或所有等级的当前生成数量配置
    displaySpawnQuantities: function(controllerLevel) {
        if (controllerLevel) {
            // Display for specific level
            // 显示特定等级的配置
            if (controllerLevel < 1 || controllerLevel > 8) {
                console.log('❌ 无效的控制器等级: ' + controllerLevel + ' (有效范围: 1-8)');
                return;
            }
            
            console.log('🤖 RCL' + controllerLevel + ' 角色生成数量配置:');
            console.log('─'.repeat(40));
            console.log('角色名称        | 生成数量');
            console.log('─'.repeat(40));
            
            var quantities = this.roleSpawnQuantity[controllerLevel];
            for (var roleName in quantities) {
                var line = roleName.padEnd(15) + ' | ' + quantities[roleName] + '个';
                console.log(line);
            }
            
            console.log('─'.repeat(40));
            console.log('💡 使用 setRoleSpawnQuantity(' + controllerLevel + ', 角色名, 数量) 修改');
        } else {
            // Display for all levels
            // 显示所有等级的配置
            console.log('🤖 所有RCL等级角色生成数量配置:');
            console.log('═'.repeat(80));
            
            for (var level = 1; level <= 8; level++) {
                console.log('');
                console.log('📊 RCL' + level + ':');
                console.log('─'.repeat(60));
                console.log('角色名称        | 生成数量 | 说明');
                console.log('─'.repeat(60));
                
                var quantities = this.roleSpawnQuantity[level];
                for (var roleName in quantities) {
                    var explanation = '';
                    if (quantities[roleName] === 0) {
                        explanation = '(此等级不需要)';
                    }
                    
                    var line = roleName.padEnd(15) + ' | ' + 
                              (quantities[roleName] + '个').padEnd(8) + ' | ' + 
                              explanation;
                    console.log(line);
                }
            }
            
            console.log('');
            console.log('═'.repeat(80));
            console.log('💡 使用 displaySpawnQuantities(等级) 查看特定等级配置');
            console.log('💡 使用 setRoleSpawnQuantity(等级, 角色名, 数量) 修改');
        }
    },

    // Get room creep counts by role
    // 获取房间按角色分类的creep数量
    getRoomCreepCounts: function(roomName) {
        var room = Game.rooms[roomName];
        if (!room || !room.controller || !room.controller.my) {
            return { error: '房间不存在或不属于你: ' + roomName };
        }
        
        var controllerLevel = room.controller.level;
        var targetQuantities = this.getRoleSpawnQuantities(controllerLevel);
        var creeps = room.find(FIND_MY_CREEPS);
        var counts = {};
        
        // Initialize counts
        // 初始化计数
        for (var roleName in targetQuantities) {
            counts[roleName] = 0;
        }
        
        // Count creeps by role
        // 按角色统计creep
        creeps.forEach(function(creep) {
            var role = creep.memory.role;
            if (counts.hasOwnProperty(role)) {
                counts[role]++;
            } else {
                // Handle unknown roles
                // 处理未知角色
                if (!counts.unknown) counts.unknown = 0;
                counts.unknown++;
            }
        });
        
        return {
            roomName: roomName,
            controllerLevel: controllerLevel,
            totalCreeps: creeps.length,
            counts: counts,
            targetQuantities: targetQuantities
        };
    },

    // Check which creeps need to be spawned in a room
    // 检查房间中需要生成哪些creep
    checkSpawnNeeds: function(roomName) {
        var creepCounts = this.getRoomCreepCounts(roomName);
        if (creepCounts.error) {
            console.log('❌ ' + creepCounts.error);
            return null;
        }
        
        var spawnNeeds = [];
        var satisfied = [];
        var targetQuantities = creepCounts.targetQuantities;
        
        console.log('🔍 检查房间 ' + roomName + ' (RCL' + creepCounts.controllerLevel + ') 的creep生成需求...');
        console.log('─'.repeat(60));
        console.log('角色名称        | 当前数量 | 目标数量 | 状态');
        console.log('─'.repeat(60));
        
        for (var roleName in targetQuantities) {
            var current = creepCounts.counts[roleName] || 0;
            var target = targetQuantities[roleName];
            var needed = Math.max(0, target - current);
            
            var status = needed > 0 ? '❌ 需要' + needed + '个' : '✅ 满足';
            
            // Special status for roles with 0 target
            // 对目标数量为0的角色显示特殊状态
            if (target === 0) {
                status = '⚪ 不需要';
            }
            
            var line = roleName.padEnd(15) + ' | ' +
                      current.toString().padEnd(8) + ' | ' +
                      target.toString().padEnd(8) + ' | ' +
                      status;
            console.log(line);
            
            if (needed > 0) {
                spawnNeeds.push({
                    role: roleName,
                    current: current,
                    target: target,
                    needed: needed
                });
            } else {
                satisfied.push(roleName);
            }
        }
        
        console.log('─'.repeat(60));
        console.log('📊 汇总: 总creep ' + creepCounts.totalCreeps + '个, 需要生成 ' + spawnNeeds.length + '种角色');
        
        return {
            roomName: roomName,
            controllerLevel: creepCounts.controllerLevel,
            spawnNeeds: spawnNeeds,
            satisfied: satisfied,
            totalCreeps: creepCounts.totalCreeps,
            targetQuantities: targetQuantities
        };
    },

    // Get spawn priority list for a room
    // 获取房间的生成优先级列表
    getSpawnPriorityList: function(roomName) {
        var spawnCheck = this.checkSpawnNeeds(roomName);
        if (!spawnCheck) {
            return null;
        }
        
        // Define spawn priority order
        // 定义生成优先级顺序
        var priorityOrder = ['harvester', 'harvester0', 'harvester1', 'carrier', 'carrierMineral', 'upgrader', 'builder'];
        
        var priorityList = [];
        
        // Sort spawn needs by priority
        // 按优先级排序生成需求
        priorityOrder.forEach(function(roleName) {
            var need = spawnCheck.spawnNeeds.find(function(item) {
                return item.role === roleName;
            });
            if (need) {
                priorityList.push(need);
            }
        });
        
        // Add any remaining roles not in priority order
        // 添加不在优先级列表中的其他角色
        spawnCheck.spawnNeeds.forEach(function(need) {
            if (!priorityOrder.includes(need.role)) {
                priorityList.push(need);
            }
        });
        
        console.log('');
        console.log('🎯 房间 ' + roomName + ' 生成优先级列表:');
        console.log('─'.repeat(50));
        
        if (priorityList.length === 0) {
            console.log('✅ 所有角色数量已满足，无需生成');
        } else {
            priorityList.forEach(function(item, index) {
                console.log((index + 1) + '. ' + item.role + ' (需要' + item.needed + '个)');
            });
        }
        
        console.log('─'.repeat(50));
        
        return {
            roomName: roomName,
            priorityList: priorityList,
            nextToSpawn: priorityList.length > 0 ? priorityList[0] : null
        };
    },

    // Get adaptive role body configurations based on actual room structures
    // 根据房间实际结构获取自适应角色身体配置
    getAdaptiveRoleBodyConfigurations: function(roomName) {
        var room = Game.rooms[roomName];
        if (!room || !room.controller || !room.controller.my) {
            console.log('❌ 房间不存在或不属于你: ' + roomName);
            return null;
        }
        
        var actualLevel = room.controller.level;
        var expectedExtensions = this.roomLevelConfig.extensions[actualLevel];
        
        // Count actual extensions
        // 统计实际Extension数量
        var actualExtensions = room.find(FIND_STRUCTURES, {
            filter: function(structure) {
                return structure.structureType === STRUCTURE_EXTENSION;
            }
        });
        
        var actualExtensionCount = actualExtensions.length;
        var effectiveLevel = actualLevel;
        
        // If extensions are insufficient, downgrade the effective level
        // 如果Extension数量不足，降低有效等级
        if (actualExtensionCount < expectedExtensions) {
            // Find the appropriate level based on actual extension count
            // 根据实际Extension数量找到合适的等级
            for (var level = actualLevel - 1; level >= 1; level--) {
                if (actualExtensionCount >= this.roomLevelConfig.extensions[level]) {
                    effectiveLevel = level;
                    break;
                }
            }
            
            console.log('⚠️ 房间 ' + roomName + ' Extension不足:');
            console.log('  - 实际等级: RCL' + actualLevel + ' (期望' + expectedExtensions + '个Extension)');
            console.log('  - 实际Extension: ' + actualExtensionCount + '个');
            console.log('  - 有效等级: RCL' + effectiveLevel + ' (匹配' + this.roomLevelConfig.extensions[effectiveLevel] + '个Extension)');
            console.log('  - 将使用RCL' + effectiveLevel + '的body配置');
        } else {
            console.log('✅ 房间 ' + roomName + ' Extension充足，使用RCL' + actualLevel + '配置');
        }
        
        return {
            roomName: roomName,
            actualLevel: actualLevel,
            effectiveLevel: effectiveLevel,
            actualExtensions: actualExtensionCount,
            expectedExtensions: expectedExtensions,
            bodyConfigurations: this.getRoleBodyConfigurations(effectiveLevel),
            maxCreepEnergy: this.calculateMaxCreepEnergy(effectiveLevel),
            isDowngraded: effectiveLevel < actualLevel
        };
    },

    // Get role body configurations based on controller level
    // 根据控制器等级获取角色身体配置
    getRoleBodyConfigurations: function(controllerLevel) {
        if (controllerLevel >= 1 && controllerLevel <= 8) {
            return this.roleBodyConfigurations[controllerLevel];
        } else {
            console.log('❌ 无效的控制器等级: ' + controllerLevel + ' (有效范围: 1-8)');
            return this.roleBodyConfigurations[1]; // 默认返回RCL1配置
        }
    },
    
    // Calculate body cost for a given body array
    // 计算指定身体数组的成本
    calculateBodyCost: function(bodyArray) {
        var cost = 0;
        bodyArray.forEach(function(part) {
            switch(part) {
                case WORK: cost += 100; break;
                case CARRY: cost += 50; break;
                case MOVE: cost += 50; break;
                case ATTACK: cost += 80; break;
                case RANGED_ATTACK: cost += 150; break;
                case HEAL: cost += 250; break;
                case TOUGH: cost += 10; break;
                case CLAIM: cost += 600; break;
                default: cost += 0; break;
            }
        });
        return cost;
    },
    
    // Get role configurations with costs for a specific controller level
    // 获取指定控制器等级的角色配置和成本
    getRoleConfigurationsWithCosts: function(controllerLevel) {
        var bodyConfigs = this.getRoleBodyConfigurations(controllerLevel);
        var roleConfigs = {};
        
        for (var role in bodyConfigs) {
            roleConfigs[role] = {
                body: bodyConfigs[role],
                cost: this.calculateBodyCost(bodyConfigs[role]),
                parts: this.countBodyParts(bodyConfigs[role])
            };
        }
        
        return roleConfigs;
    },
    
    // Count body parts in a body array
    // 统计身体数组中的部件数量
    countBodyParts: function(bodyArray) {
        var partCounts = {};
        
        bodyArray.forEach(function(part) {
            var partName;
            switch(part) {
                case WORK: partName = 'WORK'; break;
                case CARRY: partName = 'CARRY'; break;
                case MOVE: partName = 'MOVE'; break;
                case ATTACK: partName = 'ATTACK'; break;
                case RANGED_ATTACK: partName = 'RANGED_ATTACK'; break;
                case HEAL: partName = 'HEAL'; break;
                case TOUGH: partName = 'TOUGH'; break;
                case CLAIM: partName = 'CLAIM'; break;
                default: partName = part.toString(); break;
            }
            
            partCounts[partName] = (partCounts[partName] || 0) + 1;
        });
        
        return partCounts;
    },
    
    // Calculate and display capacity table for all controller levels
    // 计算并显示所有控制器等级的容量表
    displayCapacityTable: function() {
        console.log('🏠 房间控制器等级能量容量表');
        console.log('═'.repeat(95));
        console.log('等级 | Spawns | Extensions | Spawn容量 | Extension容量 | 总容量 | 单次生产最大');
        console.log('─'.repeat(95));
        
        var grandTotal = 0;
        
        for (var level = 1; level <= 8; level++) {
            var config = this.calculateTotalCapacity(level);
            if (config) {
                // Calculate maximum energy available for single creep production
                // 计算单次生产爬虫的最大可用能量
                var maxCreepEnergy = this.calculateMaxCreepEnergy(level);
                
                var line = 'RCL' + level.toString().padStart(1) + ' | ' +
                          config.spawns.count.toString().padStart(6) + ' | ' +
                          config.extensions.count.toString().padStart(10) + ' | ' +
                          config.spawns.totalCapacity.toString().padStart(9) + ' | ' +
                          config.extensions.totalCapacity.toString().padStart(13) + ' | ' +
                          config.total.capacity.toString().padStart(6) + ' | ' +
                          maxCreepEnergy.toString().padStart(10);
                console.log(line);
                grandTotal += config.total.capacity;
            }
        }
        
        console.log('─'.repeat(95));
        console.log('💡 说明:');
        console.log('- Spawn容量: 每个300能量');
        console.log('- Extension容量: RCL2-6为50能量，RCL7为100能量，RCL8为200能量');
        console.log('- RCL1-6: 1个Spawn, RCL7: 2个Spawn, RCL8: 3个Spawn');
        console.log('- 单次生产最大: 1个Spawn(300) + 所有Extensions的总能量');
        console.log('- RCL7/8多个Spawn不能共享能量，每个Spawn只能使用自己的300能量');
        console.log('═'.repeat(95));
    },
    
    // Display role configurations for different controller levels
    // 显示不同控制器等级的角色配置
    displayRoleConfigurations: function(controllerLevel) {
        if (controllerLevel) {
            // Display for specific level
            // 显示特定等级的配置
            this.displayRoleConfigForLevel(controllerLevel);
        } else {
            // Display for all levels
            // 显示所有等级的配置
            console.log('🤖 角色配置表 - 所有等级');
            console.log('═'.repeat(100));
            
            for (var level = 1; level <= 8; level++) {
                console.log('');
                console.log('📊 RCL' + level + ' 配置:');
                this.displayRoleConfigForLevel(level);
            }
            
            console.log('═'.repeat(100));
        }
    },
    
    // Display role configuration for a specific controller level
    // 显示特定控制器等级的角色配置
    displayRoleConfigForLevel: function(controllerLevel) {
        var maxEnergy = this.calculateMaxCreepEnergy(controllerLevel);
        var roleConfigs = this.getRoleConfigurationsWithCosts(controllerLevel);
        
        console.log('─'.repeat(100));
        console.log('RCL' + controllerLevel + ' | 单次生产最大: ' + maxEnergy + ' 能量');
        console.log('─'.repeat(100));
        console.log('角色名称        | 身体配置                                    | 成本  | 适用性');
        console.log('─'.repeat(100));
        
        var roles = ['harvester', 'harvester0', 'harvester1', 'carrier', 'carrierMineral', 'upgrader', 'builder'];
        
        roles.forEach(function(role) {
            if (roleConfigs[role]) {
                var config = roleConfigs[role];
                var bodyPartsStr = Object.keys(config.parts)
                    .map(function(part) { return part + '×' + config.parts[part]; })
                    .join(', ');
                
                var suitability = config.cost <= maxEnergy ? '✅ 可用' : '❌ 超出(' + (config.cost - maxEnergy) + ')';
                
                var line = role.padEnd(15) + ' | ' +
                          bodyPartsStr.padEnd(43) + ' | ' +
                          config.cost.toString().padEnd(5) + ' | ' +
                          suitability;
                console.log(line);
            }
        });
        
        console.log('─'.repeat(100));
    },
    
    // Get room energy statistics
    // 获取房间能量统计
    getRoomEnergyStats: function(roomName) {
        var room = Game.rooms[roomName];
        if (!room || !room.controller || !room.controller.my) {
            return {
                error: '房间不存在或不属于你: ' + roomName
            };
        }
        
        var controllerLevel = room.controller.level;
        var expectedConfig = this.calculateTotalCapacity(controllerLevel);
        
        // Find actual spawns and extensions
        // 查找实际的spawn和extension
        var actualSpawns = room.find(FIND_STRUCTURES, {
            filter: (structure) => structure.structureType === STRUCTURE_SPAWN
        });
        
        var actualExtensions = room.find(FIND_STRUCTURES, {
            filter: (structure) => structure.structureType === STRUCTURE_EXTENSION
        });
        
        // Calculate actual energy
        // 计算实际能量
        var actualCurrentEnergy = 0;
        var actualMaxCapacity = 0;
        
        actualSpawns.forEach(spawn => {
            actualCurrentEnergy += spawn.store[RESOURCE_ENERGY] || 0;
            actualMaxCapacity += spawn.store.getCapacity(RESOURCE_ENERGY) || 0;
        });
        
        actualExtensions.forEach(extension => {
            actualCurrentEnergy += extension.store[RESOURCE_ENERGY] || 0;
            actualMaxCapacity += extension.store.getCapacity(RESOURCE_ENERGY) || 0;
        });
        
        var energyPercentage = actualMaxCapacity > 0 ? Math.round((actualCurrentEnergy / actualMaxCapacity) * 100) : 0;
        
        return {
            roomName: roomName,
            controllerLevel: controllerLevel,
            expected: expectedConfig,
            actual: {
                spawns: {
                    count: actualSpawns.length,
                    totalCapacity: actualSpawns.length * this.SPAWN_ENERGY_CAPACITY
                },
                extensions: {
                    count: actualExtensions.length,
                    totalCapacity: actualMaxCapacity - (actualSpawns.length * this.SPAWN_ENERGY_CAPACITY)
                },
                energy: {
                    current: actualCurrentEnergy,
                    max: actualMaxCapacity,
                    percentage: energyPercentage
                }
            },
            comparison: {
                spawnDeficit: expectedConfig.spawns.count - actualSpawns.length,
                extensionDeficit: expectedConfig.extensions.count - actualExtensions.length,
                capacityDeficit: expectedConfig.total.capacity - actualMaxCapacity
            }
        };
    },
    
    // Display room analysis
    // 显示房间分析
    analyzeRoom: function(roomName) {
        var stats = this.getRoomEnergyStats(roomName);
        
        if (stats.error) {
            console.log('❌ ' + stats.error);
            return;
        }
        
        console.log('🏠 房间分析: ' + stats.roomName + ' (RCL' + stats.controllerLevel + ')');
        console.log('═'.repeat(70));
        
        // Expected vs Actual
        // 期望值 vs 实际值
        console.log('📊 结构对比:');
        console.log('Spawns    - 期望: ' + stats.expected.spawns.count + 
                   ', 实际: ' + stats.actual.spawns.count + 
                   (stats.comparison.spawnDeficit > 0 ? ' (缺少' + stats.comparison.spawnDeficit + '个)' : ' ✅'));
        
        console.log('Extensions- 期望: ' + stats.expected.extensions.count + 
                   ', 实际: ' + stats.actual.extensions.count + 
                   (stats.comparison.extensionDeficit > 0 ? ' (缺少' + stats.comparison.extensionDeficit + '个)' : ' ✅'));
        
        console.log('');
        console.log('⚡ 能量状态:');
        console.log('当前能量: ' + stats.actual.energy.current + '/' + stats.actual.energy.max + 
                   ' (' + stats.actual.energy.percentage + '%)');
        
        console.log('期望总容量: ' + stats.expected.total.capacity);
        console.log('实际总容量: ' + stats.actual.energy.max);
        
        // Calculate and display maximum creep energy
        // 计算并显示单次生产最大能量
        var maxCreepEnergy = this.calculateMaxCreepEnergy(stats.controllerLevel);
        console.log('单次生产最大: ' + maxCreepEnergy + ' 能量 (1个Spawn + 所有Extensions)');
        
        if (stats.comparison.capacityDeficit > 0) {
            console.log('容量缺口: ' + stats.comparison.capacityDeficit + ' 能量');
        } else {
            console.log('容量状态: ✅ 完整');
        }
        
        console.log('═'.repeat(70));
    },
    
    // Main run function with automatic creep spawning
    // 主运行函数，包含自动爬虫生成功能
    run: function() {
        // Initialize system status tracking if not exists
        // 如果不存在则初始化系统状态跟踪
        if (!Memory.runGeneralRoomStatus) {
            Memory.runGeneralRoomStatus = {
                initialized: false,
                lastLogTick: 0,
                logInterval: 100, // 每100个tick输出一次状态
                spawnAttempts: 0,
                successfulSpawns: 0
            };
        }
        
        // Get excluded rooms from config
        // 从配置文件获取排除的房间
        var excludeRooms = config.excludeRooms || [];
        
        // Only log startup message once or every logInterval ticks
        // 只在首次或每隔logInterval个tick输出启动信息
        var shouldLog = !Memory.runGeneralRoomStatus.initialized || 
                       (Game.time - Memory.runGeneralRoomStatus.lastLogTick) >= Memory.runGeneralRoomStatus.logInterval;
        
        if (shouldLog) {
            console.log('🏠 runGeneralRoom: 通用房间管理系统启动');
            console.log('📋 排除房间: ' + excludeRooms.join(', '));
            Memory.runGeneralRoomStatus.lastLogTick = Game.time;
            Memory.runGeneralRoomStatus.initialized = true;
        }
        
        var processedRooms = 0;
        var totalSpawnAttempts = 0;
        var totalSuccessfulSpawns = 0;
        
        // Loop through all owned rooms
        // 轮询所有拥有的房间
        for (var roomName in Game.rooms) {
            var room = Game.rooms[roomName];
            
            // Skip if room is not mine or is in exclude list
            // 跳过不属于我的房间或在排除列表中的房间
            if (!room.controller || !room.controller.my || excludeRooms.includes(roomName)) {
                continue;
            }
            
            processedRooms++;
            
            // Only log room processing if shouldLog is true
            // 只在shouldLog为true时输出房间处理信息
            if (shouldLog) {
                console.log('🔄 处理房间: ' + roomName);
            }
            
            // Process spawning for this room
            // 处理此房间的生成逻辑
            var spawnResult = this.processRoomSpawning(roomName, shouldLog);
            if (spawnResult) {
                totalSpawnAttempts += spawnResult.attempts;
                totalSuccessfulSpawns += spawnResult.successes;
            }
        }
        
        // Update global statistics
        // 更新全局统计
        Memory.runGeneralRoomStatus.spawnAttempts += totalSpawnAttempts;
        Memory.runGeneralRoomStatus.successfulSpawns += totalSuccessfulSpawns;
        
        // Only log completion message if shouldLog is true
        // 只在shouldLog为true时输出完成信息
        if (shouldLog) {
            console.log('✅ runGeneralRoom: 处理完成 (处理了' + processedRooms + '个房间)');
            if (totalSpawnAttempts > 0) {
                console.log('🤖 本轮生成统计: 尝试' + totalSpawnAttempts + '次, 成功' + totalSuccessfulSpawns + '次');
            }
        }
        
        // Execute room monitoring if active
        // 如果有活跃监控则执行
        this.executeMonitoring();
    },

    // Process spawning logic for a single room
    // 处理单个房间的生成逻辑
    processRoomSpawning: function(roomName, shouldLog) {
        var room = Game.rooms[roomName];
        if (!room || !room.controller || !room.controller.my) {
            return null;
        }
        
        // Find available spawns in this room
        // 查找此房间中可用的spawn
        var spawns = room.find(FIND_STRUCTURES, {
            filter: function(structure) {
                return structure.structureType === STRUCTURE_SPAWN && !structure.spawning;
            }
        });
        
        if (spawns.length === 0) {
            // No available spawns
            // 没有可用的spawn
            return { attempts: 0, successes: 0 };
        }
        
        // Check what creeps need to be spawned
        // 检查需要生成什么爬虫
        var spawnNeeds = this.checkSpawnNeeds(roomName);
        if (!spawnNeeds || spawnNeeds.spawnNeeds.length === 0) {
            // No spawning needed
            // 不需要生成
            return { attempts: 0, successes: 0 };
        }
        
        // Get spawn priority list
        // 获取生成优先级列表
        var priorityList = this.getSpawnPriorityList(roomName);
        if (!priorityList || priorityList.priorityList.length === 0) {
            return { attempts: 0, successes: 0 };
        }
        
        // Get adaptive body configurations for this room
        // 获取此房间的自适应身体配置
        var adaptiveConfig = this.getAdaptiveRoleBodyConfigurations(roomName);
        if (!adaptiveConfig) {
            if (shouldLog) {
                console.log('❌ 无法获取房间 ' + roomName + ' 的自适应配置');
            }
            return { attempts: 0, successes: 0 };
        }
        
        var attempts = 0;
        var successes = 0;
        
        // Try to spawn the highest priority creep with each available spawn
        // 尝试用每个可用的spawn生成最高优先级的爬虫
        for (var i = 0; i < spawns.length && i < priorityList.priorityList.length; i++) {
            var spawn = spawns[i];
            var spawnNeed = priorityList.priorityList[i];
            var roleName = spawnNeed.role;
            
            // Get body configuration for this role
            // 获取此角色的身体配置
            var bodyConfig = adaptiveConfig.bodyConfigurations[roleName];
            if (!bodyConfig) {
                if (shouldLog) {
                    console.log('❌ 未找到角色 ' + roleName + ' 的身体配置');
                }
                continue;
            }
            
            // Calculate body cost
            // 计算身体成本
            var bodyCost = this.calculateBodyCost(bodyConfig);
            
            // Check if spawn has enough energy
            // 检查spawn是否有足够能量
            var availableEnergy = room.energyAvailable;
            if (bodyCost > availableEnergy) {
                if (shouldLog) {
                    console.log('⚠️ 房间 ' + roomName + ' 能量不足: 需要' + bodyCost + ', 可用' + availableEnergy);
                }
                continue;
            }
            
            // Generate unique creep name
            // 生成唯一的爬虫名称
            var creepName = this.generateCreepName(roleName, roomName);
            
            // Attempt to spawn creep
            // 尝试生成爬虫
            attempts++;
            var spawnResult = spawn.spawnCreep(bodyConfig, creepName, {
                memory: {
                    role: roleName,
                    room: roomName,
                    working: false
                }
            });
            
            if (spawnResult === OK) {
                successes++;
                if (shouldLog) {
                    console.log('✅ 成功生成: ' + creepName + ' (' + roleName + ') 在 ' + spawn.name + 
                               ' | 成本: ' + bodyCost + ' | 房间: ' + roomName);
                }
            } else {
                if (shouldLog) {
                    console.log('❌ 生成失败: ' + creepName + ' (' + roleName + ') 在 ' + spawn.name + 
                               ' | 错误: ' + this.getSpawnErrorMessage(spawnResult) + ' | 房间: ' + roomName);
                }
            }
        }
        
        return { attempts: attempts, successes: successes };
    },

    // Generate unique creep name
    // 生成唯一的爬虫名称
    generateCreepName: function(roleName, roomName) {
        var timestamp = Game.time.toString().slice(-4); // 取时间戳后4位
        var roomCode = roomName.replace(/[^A-Z0-9]/g, ''); // 移除非字母数字字符
        return roleName + '_' + roomCode + '_' + timestamp;
    },

    // Get spawn error message
    // 获取生成错误信息
    getSpawnErrorMessage: function(errorCode) {
        switch(errorCode) {
            case ERR_NOT_OWNER: return '不是拥有者';
            case ERR_NAME_EXISTS: return '名称已存在';
            case ERR_BUSY: return 'Spawn忙碌中';
            case ERR_NOT_ENOUGH_ENERGY: return '能量不足';
            case ERR_INVALID_ARGS: return '无效参数';
            case ERR_RCL_NOT_ENOUGH: return 'RCL等级不足';
            default: return '未知错误(' + errorCode + ')';
        }
    },

    // Poll all owned rooms and analyze their status
    // 轮询所有拥有的房间并分析其状态
    pollRooms: function() {
        console.log('🔍 开始轮询所有拥有的房间...');
        console.log('═'.repeat(80));
        
        var ownedRooms = [];
        var totalRooms = 0;
        var roomSummary = [];
        
        // Find all owned rooms
        // 查找所有拥有的房间
        for (var roomName in Game.rooms) {
            var room = Game.rooms[roomName];
            if (room.controller && room.controller.my) {
                ownedRooms.push(roomName);
                totalRooms++;
                
                // Get room statistics
                // 获取房间统计信息
                var stats = this.getRoomEnergyStats(roomName);
                if (!stats.error) {
                    roomSummary.push({
                        name: roomName,
                        level: stats.controllerLevel,
                        energy: stats.actual.energy,
                        structures: {
                            spawns: stats.actual.spawns.count,
                            extensions: stats.actual.extensions.count
                        },
                        deficits: stats.comparison
                    });
                }
            }
        }
        
        if (totalRooms === 0) {
            console.log('❌ 未找到任何拥有的房间');
            return;
        }
        
        console.log('📊 房间轮询结果 (' + totalRooms + '个房间):');
        console.log('─'.repeat(80));
        
        // Display summary table
        // 显示汇总表
        console.log('房间名称    | RCL | 能量状态      | Spawn | Ext | 单次最大 | 状态');
        console.log('─'.repeat(80));
        
        roomSummary.forEach(function(room) {
            var energyStatus = room.energy.current + '/' + room.energy.max + 
                             ' (' + room.energy.percentage + '%)';
            var status = '✅';
            
            // Calculate maximum creep energy for this room
            // 计算此房间的单次生产最大能量
            var maxCreepEnergy = this.calculateMaxCreepEnergy(room.level);
            
            // Check for deficits
            // 检查缺口
            if (room.deficits.spawnDeficit > 0 || room.deficits.extensionDeficit > 0) {
                status = '⚠️ 缺建筑';
            } else if (room.energy.percentage < 50) {
                status = '🔋 低能量';
            } else if (room.energy.percentage >= 90) {
                status = '⚡ 满能量';
            }
            
            var line = room.name.padEnd(11) + ' | ' +
                      ('RCL' + room.level).padEnd(3) + ' | ' +
                      energyStatus.padEnd(13) + ' | ' +
                      (room.structures.spawns + '/' + (room.level >= 7 ? (room.level === 8 ? '3' : '2') : '1')).padEnd(5) + ' | ' +
                      (room.structures.extensions + '/' + this.roomLevelConfig.extensions[room.level]).toString().padEnd(3) + ' | ' +
                      maxCreepEnergy.toString().padEnd(8) + ' | ' +
                      status;
            console.log(line);
        }.bind(this));
        
        console.log('─'.repeat(80));
        
        // Display detailed analysis for rooms with issues
        // 为有问题的房间显示详细分析
        var roomsWithIssues = roomSummary.filter(function(room) {
            return room.deficits.spawnDeficit > 0 || 
                   room.deficits.extensionDeficit > 0 || 
                   room.energy.percentage < 30;
        });
        
        if (roomsWithIssues.length > 0) {
            console.log('');
            console.log('⚠️ 需要关注的房间:');
            roomsWithIssues.forEach(function(room) {
                console.log('');
                console.log('🏠 ' + room.name + ' (RCL' + room.level + '):');
                
                if (room.deficits.spawnDeficit > 0) {
                    console.log('  - 缺少 ' + room.deficits.spawnDeficit + ' 个Spawn');
                }
                if (room.deficits.extensionDeficit > 0) {
                    console.log('  - 缺少 ' + room.deficits.extensionDeficit + ' 个Extension');
                }
                if (room.energy.percentage < 30) {
                    console.log('  - 能量不足: ' + room.energy.percentage + '%');
                }
            });
        }
        
        console.log('');
        console.log('📈 轮询汇总:');
        console.log('- 总房间数: ' + totalRooms);
        console.log('- 正常房间: ' + (totalRooms - roomsWithIssues.length));
        console.log('- 需关注房间: ' + roomsWithIssues.length);
        console.log('═'.repeat(80));
        
        return {
            totalRooms: totalRooms,
            roomSummary: roomSummary,
            roomsWithIssues: roomsWithIssues
        };
    },

    // Get adaptive configurations for all owned rooms
    // 获取所有拥有房间的自适应配置
    getAllRoomsAdaptiveConfigurations: function() {
        var allConfigurations = [];
        var roomsWithIssues = [];
        
        console.log('🔍 分析所有房间的自适应body配置...');
        console.log('═'.repeat(80));
        
        for (var roomName in Game.rooms) {
            var room = Game.rooms[roomName];
            if (room.controller && room.controller.my) {
                var config = this.getAdaptiveRoleBodyConfigurations(roomName);
                if (config) {
                    allConfigurations.push(config);
                    if (config.isDowngraded) {
                        roomsWithIssues.push(config);
                    }
                }
                console.log(''); // 空行分隔
            }
        }
        
        // Summary
        // 汇总
        console.log('📊 自适应配置汇总:');
        console.log('─'.repeat(80));
        console.log('房间名称    | 实际RCL | 有效RCL | Extension | 最大能量 | 状态');
        console.log('─'.repeat(80));
        
        allConfigurations.forEach(function(config) {
            var extensionStatus = config.actualExtensions + '/' + config.expectedExtensions;
            var status = config.isDowngraded ? '⚠️ 降级' : '✅ 正常';
            
            var line = config.roomName.padEnd(11) + ' | ' +
                      ('RCL' + config.actualLevel).padEnd(7) + ' | ' +
                      ('RCL' + config.effectiveLevel).padEnd(7) + ' | ' +
                      extensionStatus.padEnd(9) + ' | ' +
                      config.maxCreepEnergy.toString().padEnd(8) + ' | ' +
                      status;
            console.log(line);
        });
        
        if (roomsWithIssues.length > 0) {
            console.log('');
            console.log('⚠️ 需要建设Extension的房间:');
            roomsWithIssues.forEach(function(config) {
                var needed = config.expectedExtensions - config.actualExtensions;
                console.log('  - ' + config.roomName + ': 还需建设 ' + needed + ' 个Extension');
            });
        }
        
        console.log('─'.repeat(80));
        
        return {
            allConfigurations: allConfigurations,
            roomsWithIssues: roomsWithIssues,
            totalRooms: allConfigurations.length
        };
    },

    // Display adaptive role configurations for a specific room
    // 显示特定房间的自适应角色配置
    displayAdaptiveRoleConfigurations: function(roomName) {
        var config = this.getAdaptiveRoleBodyConfigurations(roomName);
        if (!config) {
            return;
        }
        
        console.log('');
        console.log('🤖 房间 ' + roomName + ' 自适应角色配置:');
        console.log('─'.repeat(100));
        console.log('使用等级: RCL' + config.effectiveLevel + ' | 单次生产最大: ' + config.maxCreepEnergy + ' 能量');
        console.log('─'.repeat(100));
        console.log('角色名称        | 身体配置                                    | 成本  | 适用性');
        console.log('─'.repeat(100));
        
        var roleConfigs = this.getRoleConfigurationsWithCosts(config.effectiveLevel);
        var roles = ['harvester', 'harvester0', 'harvester1', 'carrier', 'carrierMineral', 'upgrader', 'builder'];
        
        roles.forEach(function(role) {
            if (roleConfigs[role]) {
                var roleConfig = roleConfigs[role];
                var bodyPartsStr = Object.keys(roleConfig.parts)
                    .map(function(part) { return part + '×' + roleConfig.parts[part]; })
                    .join(', ');
                
                var suitability = roleConfig.cost <= config.maxCreepEnergy ? '✅ 可用' : '❌ 超出(' + (roleConfig.cost - config.maxCreepEnergy) + ')';
                
                var line = role.padEnd(15) + ' | ' +
                          bodyPartsStr.padEnd(43) + ' | ' +
                          roleConfig.cost.toString().padEnd(5) + ' | ' +
                          suitability;
                console.log(line);
            }
        });
        
        console.log('─'.repeat(100));
        
        return config;
    },

    // Find all owned rooms with at least one spawn
    // 查找所有拥有的房间且至少有一个Spawn
    findRoomsWithSpawn: function() {
        var roomsWithSpawn = [];
        var totalRooms = 0;
        var roomsWithoutSpawn = [];
        
        console.log('🔍 搜索拥有的房间且至少有一个Spawn...');
        console.log('═'.repeat(70));
        
        // Find all owned rooms
        // 查找所有拥有的房间
        for (var roomName in Game.rooms) {
            var room = Game.rooms[roomName];
            if (room.controller && room.controller.my) {
                totalRooms++;
                
                // Find spawns in this room
                // 查找此房间中的spawn
                var spawns = room.find(FIND_STRUCTURES, {
                    filter: function(structure) {
                        return structure.structureType === STRUCTURE_SPAWN;
                    }
                });
                
                var roomInfo = {
                    name: roomName,
                    level: room.controller.level,
                    spawnCount: spawns.length,
                    spawns: spawns.map(function(spawn) {
                        return {
                            name: spawn.name,
                            id: spawn.id,
                            energy: spawn.store[RESOURCE_ENERGY] || 0,
                            energyCapacity: spawn.store.getCapacity(RESOURCE_ENERGY) || 0,
                            spawning: spawn.spawning ? spawn.spawning.name : null
                        };
                    })
                };
                
                if (spawns.length > 0) {
                    roomsWithSpawn.push(roomInfo);
                } else {
                    roomsWithoutSpawn.push(roomInfo);
                }
            }
        }
        
        // Display results
        // 显示结果
        if (roomsWithSpawn.length > 0) {
            console.log('✅ 找到 ' + roomsWithSpawn.length + ' 个有Spawn的房间:');
            console.log('─'.repeat(70));
            console.log('房间名称    | RCL | Spawn数量 | Spawn状态');
            console.log('─'.repeat(70));
            
            roomsWithSpawn.forEach(function(room) {
                var spawnStatus = '';
                room.spawns.forEach(function(spawn, index) {
                    if (index > 0) spawnStatus += ', ';
                    var energyPercent = spawn.energyCapacity > 0 ? 
                        Math.round((spawn.energy / spawn.energyCapacity) * 100) : 0;
                    spawnStatus += spawn.name + '(' + energyPercent + '%)';
                    if (spawn.spawning) {
                        spawnStatus += '[生产中]';
                    }
                });
                
                var line = room.name.padEnd(11) + ' | ' +
                          ('RCL' + room.level).padEnd(3) + ' | ' +
                          (room.spawnCount + '个').padEnd(9) + ' | ' +
                          spawnStatus;
                console.log(line);
            });
        } else {
            console.log('❌ 没有找到任何有Spawn的房间');
        }
        
        if (roomsWithoutSpawn.length > 0) {
            console.log('');
            console.log('⚠️ 没有Spawn的房间 (' + roomsWithoutSpawn.length + '个):');
            roomsWithoutSpawn.forEach(function(room) {
                console.log('  - ' + room.name + ' (RCL' + room.level + ')');
            });
        }
        
        console.log('');
        console.log('📊 汇总:');
        console.log('- 总拥有房间: ' + totalRooms + '个');
        console.log('- 有Spawn房间: ' + roomsWithSpawn.length + '个');
        console.log('- 无Spawn房间: ' + roomsWithoutSpawn.length + '个');
        console.log('═'.repeat(70));
        
        return {
            roomsWithSpawn: roomsWithSpawn,
            roomsWithoutSpawn: roomsWithoutSpawn,
            totalRooms: totalRooms
        };
    },

    // Get quick status of all owned rooms
    // 获取所有拥有房间的快速状态
    quickStatus: function() {
        var ownedRooms = [];
        
        for (var roomName in Game.rooms) {
            var room = Game.rooms[roomName];
            if (room.controller && room.controller.my) {
                var level = room.controller.level;
                var progress = room.controller.progress || 0;
                var progressTotal = room.controller.progressTotal || 0;
                var percentage = progressTotal > 0 ? Math.round((progress / progressTotal) * 100) : 0;
                
                // Get energy status
                // 获取能量状态
                var energyStructures = room.find(FIND_STRUCTURES, {
                    filter: function(structure) {
                        return structure.structureType === STRUCTURE_SPAWN ||
                               structure.structureType === STRUCTURE_EXTENSION;
                    }
                });
                
                var currentEnergy = 0;
                var maxCapacity = 0;
                
                energyStructures.forEach(function(structure) {
                    currentEnergy += structure.store[RESOURCE_ENERGY] || 0;
                    maxCapacity += structure.store.getCapacity(RESOURCE_ENERGY) || 0;
                });
                
                var energyPercentage = maxCapacity > 0 ? Math.round((currentEnergy / maxCapacity) * 100) : 0;
                
                ownedRooms.push({
                    name: roomName,
                    level: level,
                    progress: percentage,
                    energy: energyPercentage,
                    creeps: room.find(FIND_MY_CREEPS).length
                });
            }
        }
        
        if (ownedRooms.length === 0) {
            console.log('❌ 未找到任何拥有的房间');
            return;
        }
        
        console.log('⚡ 房间快速状态:');
        console.log('─'.repeat(50));
        
        ownedRooms.forEach(function(room) {
            var statusIcon = '🏠';
            if (room.energy < 30) statusIcon = '🔋';
            else if (room.energy >= 90) statusIcon = '⚡';
            
            console.log(statusIcon + ' ' + room.name + 
                       ' | RCL' + room.level + 
                       ' (' + room.progress + '%) | ' +
                       '能量:' + room.energy + '% | ' +
                       '爬虫:' + room.creeps + '个');
        });
        
        console.log('─'.repeat(50));
        return ownedRooms;
    },

    // Monitor specific room continuously
    // 持续监控特定房间
    monitorRoom: function(roomName, duration) {
        duration = duration || 10; // Default 10 ticks
        
        if (!Memory.roomMonitor) {
            Memory.roomMonitor = {};
        }
        
        Memory.roomMonitor[roomName] = {
            startTick: Game.time,
            duration: duration,
            active: true
        };
        
        console.log('🔍 开始监控房间 ' + roomName + ' (持续 ' + duration + ' tick)');
        console.log('💡 使用 runGeneralRoom.stopMonitor("' + roomName + '") 停止监控');
        
        return true;
    },

    // Stop monitoring a specific room
    // 停止监控特定房间
    stopMonitor: function(roomName) {
        if (Memory.roomMonitor && Memory.roomMonitor[roomName]) {
            delete Memory.roomMonitor[roomName];
            console.log('⏹️ 已停止监控房间 ' + roomName);
            return true;
        } else {
            console.log('❌ 房间 ' + roomName + ' 未在监控中');
            return false;
        }
    },

    // Check and execute room monitoring
    // 检查并执行房间监控
    executeMonitoring: function() {
        if (!Memory.roomMonitor) return;
        
        for (var roomName in Memory.roomMonitor) {
            var monitor = Memory.roomMonitor[roomName];
            
            if (!monitor.active) continue;
            
            var elapsed = Game.time - monitor.startTick;
            
            if (elapsed >= monitor.duration) {
                console.log('⏰ 房间 ' + roomName + ' 监控时间结束');
                delete Memory.roomMonitor[roomName];
                continue;
            }
            
            // Display monitoring info every 5 ticks
            // 每5个tick显示监控信息
            if (elapsed % 5 === 0) {
                var stats = this.getRoomEnergyStats(roomName);
                if (!stats.error) {
                    console.log('📊 [' + roomName + '] RCL' + stats.controllerLevel + 
                               ' | 能量:' + stats.actual.energy.percentage + '% | ' +
                               '剩余:' + (monitor.duration - elapsed) + 'tick');
                }
            }
        }
    },

    // Help command: Show all available runGeneralRoom commands
    // 帮助命令：显示所有可用的runGeneralRoom命令
    help: function(category) {
        if (!category) {
            // Show main help menu
            // 显示主帮助菜单
            console.log('🏠 runGeneralRoom 通用房间管理系统 - 帮助菜单');
            console.log('═'.repeat(55));
            console.log('');
            console.log('📋 可用命令分类:');
            console.log('// runGeneralRoom.help("calc")     - 容量计算命令');
            console.log('// runGeneralRoom.help("analyze")  - 房间分析命令');
            console.log('// runGeneralRoom.help("poll")     - 房间轮询命令');
            console.log('// runGeneralRoom.help("roles")    - 角色配置命令');
            console.log('// runGeneralRoom.help("spawn")    - 生成数量管理命令');
            console.log('// runGeneralRoom.help("system")   - 系统控制命令');
            console.log('// runGeneralRoom.help("all")      - 显示所有命令');
            console.log('');
            console.log('💡 使用方法: runGeneralRoom.help("分类名") 查看具体命令');
            console.log('💡 快捷方式: runGeneralRoom.h("分类名")');
            console.log('');
            console.log('🔧 正确的调用方式:');
            console.log('// runGeneralRoom.help();');
            console.log('// 或者直接: runGeneralRoom.help();');
            console.log('');
            console.log('🔧 系统状态: 已就绪 (未在main.js中调用)');
            console.log('═'.repeat(55));
            return;
        }

        category = category.toLowerCase();
        
        switch(category) {
            case 'calc':
            case 'c':
                this.showCalcHelp();
                break;
            case 'analyze':
            case 'a':
                this.showAnalyzeHelp();
                break;
            case 'poll':
            case 'p':
                this.showPollHelp();
                break;
            case 'roles':
            case 'r':
                this.showRolesHelp();
                break;
            case 'spawn':
            case 'sp':
                this.showSpawnHelp();
                break;
            case 'system':
            case 'sys':
                this.showSystemHelp();
                break;
            case 'all':
            case 'al':
                this.showAllHelp();
                break;
            default:
                console.log('❌ 未知分类: ' + category);
                console.log('💡 使用 runGeneralRoom.help() 查看可用分类');
        }
    },

    // Show capacity calculation commands help
    // 显示容量计算命令帮助
    showCalcHelp: function() {
        console.log('📊 runGeneralRoom - 容量计算命令');
        console.log('─'.repeat(50));
        console.log('// runGeneralRoom.calculateTotalCapacity(7)  - 计算RCL7的总容量');
        console.log('// runGeneralRoom.displayCapacityTable()     - 显示所有等级容量表');
        console.log('');
        console.log('💡 容量计算规则:');
        console.log('- RCL1-6: 1个Spawn, RCL7: 2个Spawn, RCL8: 3个Spawn');
        console.log('- 每个Spawn: 300能量');
        console.log('- Extension: RCL2-6为50能量, RCL7为100能量, RCL8为200能量');
        console.log('- Extension数量: RCL1(0), RCL2(5), RCL3(10), RCL4(20), RCL5(30), RCL6(40), RCL7(50), RCL8(60)');
    },

    // Show room analysis commands help
    // 显示房间分析命令帮助
    showAnalyzeHelp: function() {
        console.log('🔍 runGeneralRoom - 房间分析命令');
        console.log('─'.repeat(50));
        console.log('// runGeneralRoom.analyzeRoom("E39N8")       - 分析指定房间状态');
        console.log('// runGeneralRoom.getRoomEnergyStats("E39N8") - 获取房间能量统计');
        console.log('');
        console.log('💡 分析功能:');
        console.log('- 对比期望结构数量与实际数量');
        console.log('- 显示能量容量缺口');
        console.log('- 实时能量状态监控');
        console.log('- 结构建设进度评估');
    },

    // Show room polling commands help
    // 显示房间轮询命令帮助
    showPollHelp: function() {
        console.log('🔍 runGeneralRoom - 房间轮询命令');
        console.log('─'.repeat(50));
        console.log('// runGeneralRoom.pollRooms()          - 轮询所有拥有的房间');
        console.log('// runGeneralRoom.findRoomsWithSpawn() - 查找有Spawn的房间');
        console.log('// runGeneralRoom.quickStatus()        - 快速查看房间状态');
        console.log('// runGeneralRoom.monitorRoom("E39N8", 20) - 监控特定房间20tick');
        console.log('// runGeneralRoom.stopMonitor("E39N8") - 停止监控房间');
        console.log('// runGeneralRoom.executeMonitoring()  - 执行监控检查');
        console.log('');
        console.log('💡 轮询功能:');
        console.log('- 自动发现所有拥有的房间');
        console.log('- 筛选至少有一个Spawn的房间');
        console.log('- 显示房间等级、能量状态、结构数量');
        console.log('- 识别需要关注的房间');
        console.log('- 支持持续监控特定房间');
    },

    // Show role configuration commands help
    // 显示角色配置命令帮助
    showRolesHelp: function() {
        console.log('🤖 runGeneralRoom - 角色配置命令');
        console.log('─'.repeat(50));
        console.log('// runGeneralRoom.displayRoleConfigurations()    - 显示所有等级角色配置');
        console.log('// runGeneralRoom.displayRoleConfigurations(7)   - 显示RCL7角色配置');
        console.log('// runGeneralRoom.getRoleBodyConfigurations(6)   - 获取RCL6身体配置');
        console.log('// runGeneralRoom.getRoleConfigurationsWithCosts(8) - 获取RCL8配置和成本');
        console.log('');
        console.log('🔄 自适应配置命令:');
        console.log('// runGeneralRoom.getAdaptiveRoleBodyConfigurations("E39N8") - 获取房间自适应配置');
        console.log('// runGeneralRoom.displayAdaptiveRoleConfigurations("E39N8")  - 显示房间自适应配置');
        console.log('// runGeneralRoom.getAllRoomsAdaptiveConfigurations()         - 获取所有房间自适应配置');
        console.log('');
        console.log('💡 角色配置功能:');
        console.log('- 为每个RCL等级提供精确优化的creep身体配置');
        console.log('- 基于单次生产最大能量设计(1个Spawn + 所有Extensions)');
        console.log('- RCL1(300能量) → RCL8(12300能量)，每级都有专用配置');
        console.log('- 自动验证配置是否超出房间能量限制');
        console.log('- 智能降级：Extension不足时自动使用低等级配置');
        console.log('- 与E39N8.js现有配置保持兼容');
        console.log('- 支持harvester0/1, carrier, carrierMineral, upgrader, builder');
    },

    // Show all commands help
    // 显示所有命令帮助
    showAllHelp: function() {
        console.log('🏠 runGeneralRoom - 所有可用命令');
        console.log('═'.repeat(55));
        this.showCalcHelp();
        console.log('');
        this.showAnalyzeHelp();
        console.log('');
        this.showPollHelp();
        console.log('');
        this.showRolesHelp();
        console.log('');
        this.showSpawnHelp();
        console.log('');
        this.showSystemHelp();
        console.log('');
        console.log('❓ 帮助命令:');
        console.log('// runGeneralRoom.help()           - 显示帮助菜单');
        console.log('// runGeneralRoom.h("分类")        - 快捷帮助');
        console.log('');
        console.log('🎯 使用示例:');
        console.log('// runGeneralRoom.displayCapacityTable();');
        console.log('// runGeneralRoom.displayRoleConfigurations(7);');
        console.log('// runGeneralRoom.analyzeRoom("E39N8");');
        console.log('');
        console.log('💡 所有命令以 "// " 开头防止误触，使用时请去掉');
        console.log('═'.repeat(55));
    },

    // Short alias for help command
    // help命令的简写别名
    h: function(category) {
        this.help(category);
    },
    
    // Set log interval for run function
    // 设置run函数的日志输出间隔
    setLogInterval: function(interval) {
        if (!interval || interval < 1) {
            console.log('❌ 无效的间隔时间，必须大于0');
            return false;
        }
        
        if (!Memory.runGeneralRoomStatus) {
            Memory.runGeneralRoomStatus = {};
        }
        
        Memory.runGeneralRoomStatus.logInterval = interval;
        console.log('✅ 日志输出间隔已设置为: ' + interval + ' tick');
        return true;
    },
    
    // Enable logging for run function
    // 启用run函数的日志输出
    enableLogging: function() {
        if (!Memory.runGeneralRoomStatus) {
            Memory.runGeneralRoomStatus = {};
        }
        
        Memory.runGeneralRoomStatus.logInterval = 1; // 每tick都输出
        Memory.runGeneralRoomStatus.lastLogTick = 0; // 重置计时器
        console.log('✅ 已启用日志输出 (每tick输出)');
        return true;
    },
    
    // Disable logging for run function
    // 禁用run函数的日志输出
    disableLogging: function() {
        if (!Memory.runGeneralRoomStatus) {
            Memory.runGeneralRoomStatus = {};
        }
        
        Memory.runGeneralRoomStatus.logInterval = Infinity; // 永不输出
        console.log('✅ 已禁用日志输出');
        return true;
    },
    
    // Get system status
    // 获取系统状态
    getSystemStatus: function() {
        if (!Memory.runGeneralRoomStatus) {
            console.log('❌ 系统尚未初始化');
            return null;
        }
        
        var status = Memory.runGeneralRoomStatus;
        var nextLogIn = status.logInterval - (Game.time - status.lastLogTick);
        
        console.log('🔧 runGeneralRoom系统状态:');
        console.log('─'.repeat(40));
        console.log('初始化状态: ' + (status.initialized ? '✅ 已初始化' : '❌ 未初始化'));
        console.log('日志间隔: ' + status.logInterval + ' tick');
        console.log('上次日志: tick ' + status.lastLogTick);
        console.log('当前tick: tick ' + Game.time);
        
        if (status.logInterval === Infinity) {
            console.log('下次日志: 已禁用');
        } else if (nextLogIn <= 0) {
            console.log('下次日志: 下个tick');
        } else {
            console.log('下次日志: ' + nextLogIn + ' tick后');
        }
        
        // Display spawn statistics if available
        // 显示生成统计信息（如果可用）
        if (status.spawnAttempts !== undefined) {
            console.log('');
            console.log('🤖 生成统计:');
            console.log('总尝试次数: ' + (status.spawnAttempts || 0));
            console.log('总成功次数: ' + (status.successfulSpawns || 0));
            var successRate = status.spawnAttempts > 0 ? 
                Math.round((status.successfulSpawns / status.spawnAttempts) * 100) : 0;
            console.log('成功率: ' + successRate + '%');
        }
        
        console.log('─'.repeat(40));
        return status;
    },

    // Show spawn quantity management help
    // 显示生成数量管理帮助
    showSpawnHelp: function() {
        console.log('📊 runGeneralRoom - 生成数量管理命令');
        console.log('─'.repeat(50));
        console.log('// runGeneralRoom.displaySpawnQuantities()                    - 显示所有等级生成数量配置');
        console.log('// runGeneralRoom.displaySpawnQuantities(7)                  - 显示RCL7生成数量配置');
        console.log('// runGeneralRoom.setRoleSpawnQuantity(6, "harvester0", 2)   - 设置RCL6单个角色数量');
        console.log('// runGeneralRoom.setAllRoleSpawnQuantities(5, {...})        - 批量设置RCL5角色数量');
        console.log('// runGeneralRoom.getRoomCreepCounts("E39N8")                - 获取房间creep统计');
        console.log('// runGeneralRoom.checkSpawnNeeds("E39N8")                   - 检查房间生成需求');
        console.log('// runGeneralRoom.getSpawnPriorityList("E39N8")              - 获取生成优先级列表');
        console.log('');
        console.log('💡 按RCL等级生成数量管理功能:');
        console.log('- RCL1-2: carrier和carrierMineral为0 (通常没有Container)');
        console.log('- RCL3-5: carrier为1，carrierMineral为0 (没有矿物开采)');
        console.log('- RCL6-8: carrier和carrierMineral都为1 (完整功能)');
        console.log('- 每种角色在每个等级都有专门优化的数量配置');
        console.log('- 自动根据房间RCL等级选择对应的生成数量');
        console.log('- 支持按等级自定义调整各角色的生成数量');
        console.log('- 优先级顺序: harvester → harvester0 → harvester1 → carrier → carrierMineral → upgrader → builder');
    },

    // Reset spawn statistics
    // 重置生成统计
    resetSpawnStats: function() {
        if (!Memory.runGeneralRoomStatus) {
            Memory.runGeneralRoomStatus = {};
        }
        
        Memory.runGeneralRoomStatus.spawnAttempts = 0;
        Memory.runGeneralRoomStatus.successfulSpawns = 0;
        
        console.log('✅ 生成统计已重置');
        return true;
    },

    // Manual spawn test for a specific room
    // 手动测试特定房间的生成
    testSpawn: function(roomName) {
        if (!roomName) {
            console.log('❌ 请指定房间名称');
            console.log('💡 使用方法: runGeneralRoom.testSpawn("E39N8")');
            return false;
        }
        
        console.log('🧪 测试房间 ' + roomName + ' 的生成逻辑...');
        console.log('─'.repeat(50));
        
        var result = this.processRoomSpawning(roomName, true);
        
        if (result) {
            console.log('');
            console.log('📊 测试结果:');
            console.log('- 尝试次数: ' + result.attempts);
            console.log('- 成功次数: ' + result.successes);
            console.log('- 成功率: ' + (result.attempts > 0 ? Math.round((result.successes / result.attempts) * 100) : 0) + '%');
        } else {
            console.log('❌ 测试失败，无法处理房间生成');
        }
        
        console.log('─'.repeat(50));
        return result;
    },

    // Show system control commands help
    // 显示系统控制命令帮助
    showSystemHelp: function() {
        console.log('🔧 runGeneralRoom - 系统控制命令');
        console.log('─'.repeat(50));
        console.log('// runGeneralRoom.run()                    - 手动运行一次系统');
        console.log('// runGeneralRoom.testSpawn("E39N8")       - 测试特定房间的生成逻辑');
        console.log('// runGeneralRoom.getSystemStatus()        - 查看系统状态');
        console.log('// runGeneralRoom.resetSpawnStats()        - 重置生成统计');
        console.log('// runGeneralRoom.setLogInterval(50)       - 设置日志输出间隔');
        console.log('// runGeneralRoom.enableLogging()          - 启用详细日志');
        console.log('// runGeneralRoom.disableLogging()         - 禁用日志输出');
        console.log('');
        console.log('💡 系统控制功能:');
        console.log('- 自动爬虫生成：根据房间RCL等级和当前creep数量自动生成');
        console.log('- 智能优先级：harvester → carrier → upgrader → builder');
        console.log('- 自适应配置：根据实际Extension数量调整creep身体配置');
        console.log('- 能量检查：确保有足够能量才尝试生成');
        console.log('- 统计跟踪：记录生成尝试次数和成功率');
        console.log('- 日志控制：可调节日志输出频率或完全禁用');
        console.log('');
        console.log('🚀 使用方法:');
        console.log('1. 在main.js中调用 runGeneralRoom.run() 启用自动生成');
        console.log('2. 使用 testSpawn() 测试特定房间的生成逻辑');
        console.log('3. 使用 getSystemStatus() 监控系统运行状态');
    }
};

// Set as global variable for easy access
// 设置为全局变量以便于访问
global.runGeneralRoom = runGeneralRoom;

module.exports = runGeneralRoom;