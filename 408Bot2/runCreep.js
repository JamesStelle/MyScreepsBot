var roleHarvester = require('role.harvester');
var roleHarvester0 = require('role.harvester0');
var roleHarvester1 = require('role.harvester1');
//var roleHarvesterMineral = require('role.harvesterMineral');
var roleBuilder = require('role.builder');
var roleUpgrader = require('role.upgrader');    
var roleCarrier = require('role.carrier');
//var roleCarrierMineral = require('role.carrierMineral');
var roleAttacker = require('role.attacker');
var roleHealer = require('role.healer');
var roleDefender = require('role.defender');
var roleSigner = require('role.signer');
//var roleRepairerWall = require('role.repairerWall');
//var roleRepairerRoad = require('role.repairerRoad');
//var roleRepairerContainer = require('role.repairerContainer');
//var roleStrikerEureka = require('role.StrikerEureka');
//var roleChernoAlpha = require('role.ChernoAlpha');
//var roleCrimsonTyphoon = require('role.CrimsonTyphoon');
//var roleGipsyDanger = require('role.GipsyDanger');

// Map roles to their corresponding modules
// 中文: 将角色映射到其对应的模块
const roleFunc = {
    harvester: roleHarvester,
    harvester0: roleHarvester0,
    harvester1: roleHarvester1,
    //harvesterMineral: roleHarvesterMineral,
    upgrader: roleUpgrader,
    builder: roleBuilder,
    carrier: roleCarrier,
    //carrierMineral: roleCarrierMineral,
    attacker: roleAttacker,
    healer: roleHealer,
    defender: roleDefender,
    signer: roleSigner,
    //repairerWall: roleRepairerWall,
    //repairerRoad: roleRepairerRoad,
    //repairerContainer: roleRepairerContainer,
    ///StrikerEureka: roleStrikerEureka,
    //ChernoAlpha: roleChernoAlpha,
    //CrimsonTyphoon: roleCrimsonTyphoon,
    //GipsyDanger: roleGipsyDanger
};

// Main run function to execute each creep's role
// 中文: 主运行函数以执行每个爬虫的角色
var runCreep = {
    run: function() {
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