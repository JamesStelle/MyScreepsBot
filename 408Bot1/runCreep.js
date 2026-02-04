var roleHarvester = require('role.harvester');
var roleHarvester0 = require('role.harvester0');
var roleHarvester1 = require('role.harvester1');
var roleBuilder = require('role.builder');
var roleUpgrader = require('role.upgrader');    
var roleCarrier = require('role.carrier');

// Map roles to their corresponding modules
// 中文: 将角色映射到其对应的模块
const roleFunc = {
    harvester: roleHarvester,
    harvester0: roleHarvester0,
    harvester1: roleHarvester1,
    upgrader: roleUpgrader,
    builder: roleBuilder,
    carrier: roleCarrier
};

// Main run function to execute each creep's role
// 中文: 主运行函数以执行每个爬虫的角色
var runCreep = {
    run: function(creep) {
        for(var name in Game.creeps) {
            var creep = Game.creeps[name];
            var role = creep.memory.role;
            if(roleFunc[role]) {
                roleFunc[role].run(creep);
            }
        }
    }
};
module.exports = runCreep;