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
        //console.log(`Harvesters: ${creepCount.harvester}`);
        //console.log(`Harvester0s: ${creepCount.harvester0}`);
        //console.log(`Harvester1s: ${creepCount.harvester1}`);
        //console.log(`Carriers: ${creepCount.carrier}`);
        //console.log(`Upgraders: ${creepCount.upgrader}`);
        //console.log(`Builders: ${creepCount.builder}`);
        
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
            carrier: 1,
            upgrader: 2,
            builder: 2
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
                creepBody = [WORK, CARRY, MOVE, MOVE];
                break;
            case creepCount.harvester0 < minCreeps.harvester0:
                roleToSpawn = 'harvester0';
                creepBody = [WORK, CARRY, MOVE, MOVE];
                break;
            case creepCount.harvester1 < minCreeps.harvester1:
                roleToSpawn = 'harvester1';
                creepBody = [WORK, CARRY, MOVE, MOVE];
                break;
            case creepCount.carrier < minCreeps.carrier:
                roleToSpawn = 'carrier';
                creepBody = [CARRY, CARRY, MOVE, MOVE];
                break;
            case creepCount.upgrader < minCreeps.upgrader:
                roleToSpawn = 'upgrader';
                creepBody = [WORK, CARRY, MOVE, MOVE];
                break;
            case creepCount.builder < minCreeps.builder:
                roleToSpawn = 'builder';
                creepBody = [WORK, CARRY, MOVE, MOVE];
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
    }
};