module.exports = {
    run:function() {
        // Count creeps by role (ordered by spawn priority)
        // 中文: 统计各角色的爬虫数量（按生成优先级排序）
        const creepCount = {
            harvester: _.filter(Game.creeps, c => c.memory.role === 'harvester').length,
            harvester0: _.filter(Game.creeps, c => c.memory.role === 'harvester0').length,
            harvester1: _.filter(Game.creeps, c => c.memory.role === 'harvester1').length,
            carrier: _.filter(Game.creeps, c => c.memory.role === 'carrier').length,
            upgrader: _.filter(Game.creeps, c => c.memory.role === 'upgrader').length,
            builder: _.filter(Game.creeps, c => c.memory.role === 'builder').length
        };
        
        // Log current creep counts (ordered by spawn priority)
        // 中文: 输出当前各角色爬虫数量（按生成优先级排序）
        /*
        console.log(`Harvesters: ${creepCount.harvester}`);
        console.log(`Harvester0s: ${creepCount.harvester0}`);
        console.log(`Harvester1s: ${creepCount.harvester1}`);
        console.log(`Carriers: ${creepCount.carrier}`);
        console.log(`Upgraders: ${creepCount.upgrader}`);
        console.log(`Builders: ${creepCount.builder}`);
        */
        // Spawn new creeps based on role counts
        // 中文: 根据角色数量生成新的爬虫
        const spawn = Game.spawns['E39N8'];
        
        // Check if spawn exists and is not spawning
        // 中文: 检查spawn是否存在且未在生成中
        if (!spawn) {
            console.log('Warning: Spawn E39N8 not found!');
            return;
        }
        
        if (spawn.spawning) {
            this.showSpawningStatus(spawn);
            return;
        }

        // Individual minimum number of creeps per role (ordered by spawn priority)
        // 中文: 每个角色的最小爬虫数量（按生成优先级排序）
        const minCreeps = {
            harvester: 0,
            harvester0: 1,
            harvester1: 1,
            carrier: 2,
            upgrader: 1,
            builder: 2,
        };
        
        // Determine which role to spawn next
        // 中文: 确定下一个要生成的角色
        let roleToSpawn;
        // Define body configurations for each role
        // 中文: 定义每个角色的身体配置
        let creepBody;
        
        // Prioritize spawning based on role shortages
        // 中文: 根据角色短缺优先生成
        switch (true) {
            case creepCount.harvester < minCreeps.harvester:
                roleToSpawn = 'harvester';
                creepBody = [WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE];
                break;
            case creepCount.harvester0 < minCreeps.harvester0:
                roleToSpawn = 'harvester0';
                creepBody = [WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE];
                break;
            case creepCount.harvester1 < minCreeps.harvester1:
                roleToSpawn = 'harvester1';
                creepBody = [WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE];
                break;
            case creepCount.carrier < minCreeps.carrier:
                roleToSpawn = 'carrier';
                creepBody = [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE];
                break;
            case creepCount.upgrader < minCreeps.upgrader:
                roleToSpawn = 'upgrader';
                creepBody = [WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE];
                break;
            case creepCount.builder < minCreeps.builder:
                roleToSpawn = 'builder';
                creepBody = [WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE];
                break;
        }
        // Spawn the creep if a role is determined
        // 中文: 如果确定了角色则生成爬虫
        if (roleToSpawn) {
            this.spawnCreep(spawn, roleToSpawn, creepBody);
        }
        
        // Display spawning status
        // 中文: 显示生成状态
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
        //console.log(`Spawning new ${role}: ${newName}`);
        spawn.spawnCreep(body, newName, { memory: { role } });
    },
    // Function to display spawning status
    // 中文: 显示生成状态的函数
    showSpawningStatus(spawn) {
        if (spawn.spawning) {
            const creep = Game.creeps[spawn.spawning.name];
            spawn.room.visual.text(
                `🛠️${creep.memory.role}`,
                spawn.pos.x + 1,
                spawn.pos.y,
                { align: 'left', opacity: 0.8 }
            );
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
        
        // Display energy status in room visual
        // 在房间视觉中显示能量状态
        const energyPercentage = maxCapacity > 0 ? Math.round((currentEnergy / maxCapacity) * 100) : 0;
        room.visual.text(
            `⚡ ${currentEnergy}/${maxCapacity} (${energyPercentage}%)`,
            1, 1,
            { align: 'left', opacity: 0.8, font: 0.6 }
        );
        
        // Also log to console every 1500 ticks
        // 每1500个tick也输出到控制台
        if (Game.time % 1500 === 0) {
            console.log(`Room ${room.name} Energy: ${currentEnergy}/${maxCapacity} (${energyPercentage}%)`);
        }
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
        
        // Display creep energy cost in room visual
        // 在房间视觉中显示爬虫能量花费
        room.visual.text(
            `👥 Creeps: ${roomCreeps.length} (${totalEnergyCost} energy)`,
            1, 2,
            { align: 'left', opacity: 0.8, font: 0.6 }
        );
        
        // Also log to console every 1500 ticks
        // 每1500个tick也输出到控制台
        if (Game.time % 1500 === 0) {
            console.log(`Room ${room.name} Creeps: ${roomCreeps.length} units, Total cost: ${totalEnergyCost} energy`);
        }
        
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
        
        // Display efficiency in room visual
        // 在房间视觉中显示效率
        room.visual.text(
            `📊 Efficiency: ${efficiencyPercentage}% (${totalEnergyCost}/${totalEnergyProduction})`,
            1, 3,
            { align: 'left', opacity: 0.8, font: 0.6 }
        );
        
        // Also log to console every 1500 ticks
        // 每1500个tick也输出到控制台
        if (Game.time % 1500 === 0) {
            console.log(`Room ${room.name} Energy Efficiency: ${efficiencyPercentage}% - Cost: ${totalEnergyCost}, Production: ${totalEnergyProduction} (${sourceCount} sources)`);
        }
    }
};