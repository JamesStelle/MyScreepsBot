module.exports = {
    // Centralized role configurations - single source of truth
    // 中文: 集中式角色配置 - 单一数据源
    getRoleBodyConfigurations: function() {
        return {
            harvester: [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], // 100*8+50+50*8=1250
            harvester0: [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], // 1250
            harvester1: [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], // 1250
            carrier: [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], // 1000
            carrierMineral: [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], 
            upgrader: [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY], // 1450
            builder: [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE] // 1300
        };
    },

    // Get minimum creep counts for each role
    // 中文: 获取每个角色的最小爬虫数量
    getMinCreepCounts: function() {
        return {
            harvester: 0,
            harvester0: 1,
            harvester1: 1,
            carrier: 2,
            carrierMineral: 1,
            upgrader: 1,
            builder: 1,
        };
    },

    run:function() {
        // Count creeps by role (ordered by spawn priority) - only in E39N8 room
        // 中文: 统计各角色的爬虫数量（按生成优先级排序）- 仅统计E39N8房间内的
        const creepCount = {
            harvester: _.filter(Game.creeps, c => c.memory.role === 'harvester' && c.room.name === 'E39N8').length,
            harvester0: _.filter(Game.creeps, c => c.memory.role === 'harvester0' && c.room.name === 'E39N8').length,
            harvester1: _.filter(Game.creeps, c => c.memory.role === 'harvester1' && c.room.name === 'E39N8').length,
            carrier: _.filter(Game.creeps, c => c.memory.role === 'carrier' && c.room.name === 'E39N8').length,
            carrierMineral: _.filter(Game.creeps, c => c.memory.role === 'carrierMineral' && c.room.name === 'E39N8').length,
            upgrader: _.filter(Game.creeps, c => c.memory.role === 'upgrader' && c.room.name === 'E39N8').length,
            builder: _.filter(Game.creeps, c => c.memory.role === 'builder' && c.room.name === 'E39N8').length
        };
        
        // Log current creep counts (ordered by spawn priority)
        // 中文: 输出当前各角色爬虫数量（按生成优先级排序）
        this.logCreepStatistics(creepCount);
        // Get spawns in E39N8 room for multi-spawn support
        // 中文: 获取E39N8房间内的spawn以支持多spawn情况
        const room = Game.rooms['E39N8'];
        if (!room) {
            console.log('Warning: Room E39N8 not found or not visible!');
            return;
        }
        
        // Find the spawn named "E39N8" in E39N8 room
        // 查找E39N8房间内名为"E39N8"的spawn
        const spawn = Game.spawns['E39N8'];
        
        if (!spawn) {
            console.log('Warning: Spawn "E39N8" not found in room E39N8!');
            return;
        }
        
        if (spawn.spawning) {
            // Spawn is busy, show status
            // Spawn正在忙碌，显示状态
            this.showSpawningStatus(spawn);
            return;
        }

        // Get configurations from centralized source
        // 中文: 从集中式数据源获取配置
        const minCreeps = this.getMinCreepCounts();
        const bodyConfigs = this.getRoleBodyConfigurations();
        
        // Determine which role to spawn next
        // 中文: 确定下一个要生成的角色
        let roleToSpawn;
        
        // Prioritize spawning based on role shortages (ordered by priority)
        // 中文: 根据角色短缺优先生成（按优先级排序）
        const rolesPriority = ['harvester', 'harvester0', 'harvester1', 'carrier', 'carrierMineral', 'upgrader', 'builder'];
        
        for (const role of rolesPriority) {
            if (creepCount[role] < minCreeps[role]) {
                roleToSpawn = role;
                break;
            }
        }
        
        // Spawn the creep if a role is determined
        // 中文: 如果确定了角色则生成爬虫
        if (roleToSpawn) {
            this.spawnCreep(spawn, roleToSpawn, bodyConfigs[roleToSpawn]);
        }
        
        // Display spawning status for all spawns in E39N8
        // 中文: 显示E39N8房间内所有spawn的状态
        this.showSpawningStatus(spawn);
        
        // Display room energy status
        // 中文: 显示房间能量状态
        this.showRoomEnergyStatus(spawn.room);
        
        // Display creep energy cost
        // 中文: 显示爬虫能量花费
        this.showCreepEnergyCost(spawn.room);
    },
    // Function to spawn a creep
    // 中文: 生成爬虫的函数
    spawnCreep(spawn, role, body) {
        const newName = `E39N8${role.charAt(0).toUpperCase() + role.slice(1)}${Game.time}`;
        console.log(`Spawning new ${role}: ${newName}`);
        spawn.spawnCreep(body, newName, { memory: { role } });
    },
    // Function to display spawning status for spawn E39N8
    // 中文: 显示E39N8 spawn的生成状态
    showSpawningStatus(spawn) {
        // Display status every 10 ticks
        // 每10个tick显示状态
        if (Game.time % 10 === 0) {
            if (spawn.spawning) {
                const creep = Game.creeps[spawn.spawning.name];
                console.log(`Spawning: ${creep.memory.role} (${spawn.spawning.name})`);
            }
        }
    },
    
    // Function to display room energy status
    // 中文: 显示房间能量状态的函数
    showRoomEnergyStatus(room) {
        // Find all extensions and spawns in the room
        // 寻找房间内所有的扩展和孵化器
        const structures = room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType === STRUCTURE_EXTENSION ||
                       structure.structureType === STRUCTURE_SPAWN;
            }
        });
        
        let currentEnergy = 0;
        let maxCapacity = 0;
        
        // Calculate total energy and capacity
        // 计算总能量和总容量
        structures.forEach(structure => {
            currentEnergy += structure.store[RESOURCE_ENERGY] || 0;
            maxCapacity += structure.store.getCapacity(RESOURCE_ENERGY) || 0;
        });
        
        // Store energy data for combined output in logCreepStatistics
        // 存储能量数据，在logCreepStatistics中合并输出
        const energyPercentage = maxCapacity > 0 ? Math.round((currentEnergy / maxCapacity) * 100) : 0;
        this.roomEnergyData = {
            name: room.name,
            currentEnergy: currentEnergy,
            maxCapacity: maxCapacity,
            percentage: energyPercentage
        };
    },
    
    // Function to display creep energy cost
    // 中文: 显示爬虫能量花费的函数
    showCreepEnergyCost(room) {
        // Calculate total energy cost of all creeps in the room
        // 计算房间内所有爬虫的总能量花费
        let totalEnergyCost = 0;
        
        // Get all creeps in the room
        // 获取房间内所有爬虫
        const roomCreeps = room.find(FIND_MY_CREEPS);
        
        roomCreeps.forEach(creep => {
            // Calculate energy cost based on body parts
            // 根据身体部件计算能量花费
            creep.body.forEach(part => {
                switch(part.type) {
                    case WORK:
                        totalEnergyCost += 100;
                        break;
                    case CARRY:
                        totalEnergyCost += 50;
                        break;
                    case MOVE:
                        totalEnergyCost += 50;
                        break;
                    case ATTACK:
                        totalEnergyCost += 80;
                        break;
                    case RANGED_ATTACK:
                        totalEnergyCost += 150;
                        break;
                    case HEAL:
                        totalEnergyCost += 250;
                        break;
                    case TOUGH:
                        totalEnergyCost += 10;
                        break;
                    case CLAIM:
                        totalEnergyCost += 600;
                        break;
                }
            });
        });
        
        // Display creep energy cost in console instead of room visual
        // 在控制台而不是房间视觉中显示爬虫能量花费
        // Removed: Room creeps count and total cost output
        // 已移除：房间爬虫数量和总成本输出
        
        // Calculate energy efficiency ratio
        // 计算能量效率比
        this.calculateEnergyEfficiency(room, roomCreeps.length, totalEnergyCost);
    },
    
    // Function to calculate energy efficiency ratio
    // 中文: 计算能量效率比的函数
    calculateEnergyEfficiency(room, creepCount, totalEnergyCost) {
        // Constants for calculation
        // 计算常量
        const SOURCE_CAPACITY = 3000;           // 每个source的能量容量
        const REGEN_INTERVAL = 300;             // 能量再生间隔 (tick)
        const CREEP_LIFETIME = 1500;            // 爬虫生命周期 (tick)
        
        // Calculate energy production in 1500 ticks
        // 计算1500tick内的能量产出
        const regenCycles = CREEP_LIFETIME / REGEN_INTERVAL; // 1500/300 = 5次再生
        
        // Get number of sources in room
        // 获取房间内source数量
        const sources = room.find(FIND_SOURCES);
        const sourceCount = sources.length;
        
        // Total energy production in 1500 ticks
        // 1500tick内总能量产出
        const totalEnergyProduction = SOURCE_CAPACITY * regenCycles * sourceCount; // 3000 * 5 * source数量
        
        // Calculate efficiency ratio
        // 计算效率比
        const efficiencyRatio = totalEnergyProduction > 0 ? (totalEnergyCost / totalEnergyProduction) : 0;
        const efficiencyPercentage = Math.round(efficiencyRatio * 100);
        
        // Display efficiency in console instead of room visual
        // 在控制台而不是房间视觉中显示效率
        // Removed: Energy efficiency output
        // 已移除：能量效率输出
    },
    
    // Function to log detailed creep statistics with room energy status
    // 中文: 记录详细爬虫统计信息和房间能量状态的函数
    logCreepStatistics: function(creepCount) {
        // Only log every 500 ticks to avoid spam
        // 每500个tick记录一次以避免刷屏
        if (Game.time % 500 === 0) {
            console.log('=== E39N8 Room Status ===');
            
            // Display room energy status first
            // 首先显示房间能量状态
            if (this.roomEnergyData) {
                console.log(`房间能量: ${this.roomEnergyData.currentEnergy}/${this.roomEnergyData.maxCapacity} (${this.roomEnergyData.percentage}%)`);
                console.log('─'.repeat(50));
            }
            
            console.log('角色统计 (按生成优先级排序):');
            
            // Get role configurations dynamically from spawn logic
            // 从生成逻辑中动态获取角色配置
            const roleConfigs = this.getRoleConfigurations();
            
            // Sort roles by priority
            // 按优先级排序角色
            const sortedRoles = Object.keys(roleConfigs).sort((a, b) => 
                roleConfigs[a].priority - roleConfigs[b].priority
            );
            
            let totalCreeps = 0;
            let totalEnergyCost = 0;
            
            // Log each role's statistics
            // 记录每个角色的统计信息
            sortedRoles.forEach(role => {
                const count = creepCount[role] || 0;
                const config = roleConfigs[role];
                const roleTotalCost = count * config.cost;
                
                totalCreeps += count;
                totalEnergyCost += roleTotalCost;
                
                // Count body parts
                // 统计身体部件
                const bodyParts = this.countBodyParts(config.body);
                const bodyPartsStr = Object.keys(bodyParts)
                    .map(part => `${part}×${bodyParts[part]}`)
                    .join(', ');
                
                console.log(`${role.padEnd(15)} | 数量: ${count.toString().padStart(2)} | 单体: ${bodyPartsStr} | 单价: ${config.cost} | 总计: ${roleTotalCost}`);
            });
            
            console.log('─'.repeat(80));
            console.log(`总计爬虫: ${totalCreeps} | 总能量消耗: ${totalEnergyCost}`);
            console.log('='.repeat(30));
        }
    },
    
    // Function to get role configurations dynamically from spawn logic
    // 中文: 从生成逻辑中动态获取角色配置的函数
    getRoleConfigurations: function() {
        // This function uses the centralized body configurations
        // 此函数使用集中式身体配置
        const roleConfigs = {};
        const minCreeps = this.getMinCreepCounts();
        const bodyConfigs = this.getRoleBodyConfigurations();
        
        let priority = 1;
        
        // Generate configurations for all roles that have minimum counts > 0
        // 为所有最小数量 > 0 的角色生成配置
        const rolesPriority = ['harvester', 'harvester0', 'harvester1', 'carrier', 'carrierMineral', 'upgrader', 'builder'];
        
        rolesPriority.forEach(role => {
            if (minCreeps[role] > 0 || role !== 'harvester') { // Include all roles except disabled harvester
                roleConfigs[role] = {
                    body: bodyConfigs[role],
                    cost: this.calculateBodyCost(bodyConfigs[role]),
                    priority: priority++
                };
            }
        });
        
        return roleConfigs;
    },
    
    // Function to calculate body cost dynamically
    // 中文: 动态计算身体成本的函数
    calculateBodyCost: function(bodyArray) {
        let cost = 0;
        bodyArray.forEach(part => {
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
    
    // Function to count body parts
    // 中文: 统计身体部件的函数
    countBodyParts: function(bodyArray) {
        const partCounts = {};
        
        bodyArray.forEach(part => {
            // Convert body part constants to readable names
            // 将身体部件常量转换为可读名称
            let partName;
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
    }
};