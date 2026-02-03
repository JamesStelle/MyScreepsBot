// Load configuration
// 加载配置文件
var config = require('config');

module.exports = {
    
    /**
     * Main run function for Tower management
     * Tower 管理的主运行函数
     */
    run: function() {
        // Loop through all my rooms
        // 轮循环我的房间
        for (let roomName in Game.rooms) {
            const room = Game.rooms[roomName];
            
            // Check if room is mine
            // 检查房间是否属于我
            if (room.controller && room.controller.my) {
                this.manageRoomTowers(room);
            }
        }
    },
    
    /**
     * Manage Towers for a specific room
     * 管理特定房间的 Tower
     */
    manageRoomTowers: function(room) {
        // Check if room level is 3 or higher
        // 检查房间等级是否达到3级
        if (room.controller.level < 3) {
            return;
        }
        
        // Find all Towers in the room
        // 寻找房间内所有的 Tower
        const towers = room.find(FIND_MY_STRUCTURES, {
            filter: (structure) => structure.structureType === STRUCTURE_TOWER
        });
        
        // Check if there are any Towers
        // 检查是否存在 Tower
        if (towers.length === 0) {
            return;
        }
        
        // Check for hostile creeps in the room (excluding whitelisted players)
        // 检查房间内是否有敌对爬虫（排除白名单玩家）
        const hostileCreeps = room.find(FIND_HOSTILE_CREEPS, {
            filter: (creep) => {
                return !config.whitelist.includes(creep.owner.username);
            }
        });
        
        if (hostileCreeps.length > 0) {
            // Combat mode: Use all towers to attack
            // 战斗模式：启用所有塔楼攻击
            towers.forEach(tower => {
                this.combatMode(tower);
            });
        } else {
            // Peaceful mode: Use only one tower for maintenance
            // 和平模式：仅启用一个塔楼进行维护
            this.peacefulMode(towers[0]);
        }
    },
    
    /**
     * Combat mode - all towers attack hostile creeps
     * 战斗模式 - 所有塔楼攻击敌对爬虫
     */
    combatMode: function(tower) {
        const closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {
            filter: (creep) => {
                return !config.whitelist.includes(creep.owner.username);
            }
        });
        if (closestHostile) {
            tower.attack(closestHostile);
        }
    },
    
    /**
     * Peaceful mode - single tower handles maintenance
     * 和平模式 - 单个塔楼处理维护工作
     */
    peacefulMode: function(tower) {
        // Repair damaged structures (including walls and ramparts)
        // 修复受损建筑（包括城墙和城墙）
        const closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => {
                return structure.hits < structure.hitsMax;
            }
        });
        if (closestDamagedStructure) {
            tower.repair(closestDamagedStructure);
        }
    }
};