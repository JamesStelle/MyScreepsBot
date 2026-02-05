// Safe require function with error handling
// 安全的 require 函数，带错误处理
function safeRequire(moduleName) {
    try {
        return require(moduleName);
    } catch (error) {
        console.log(`Warning: Failed to require ${moduleName}: ${error}`);
        return null;
    }
}

// Load role modules with error handling
// 使用错误处理加载角色模块
var roleHarvester = safeRequire('role.harvester');
var roleHarvester0 = safeRequire('role.harvester0');
var roleHarvester1 = safeRequire('role.harvester1');
//var roleHarvesterMineral = safeRequire('role.harvesterMineral');
var roleBuilder = safeRequire('role.builder');
var roleUpgrader = safeRequire('role.upgrader');    
var roleCarrier = safeRequire('role.carrier');
var roleCarrierMineral = safeRequire('role.carrierMineral');
var roleTransferee = safeRequire('role.transferee');
var roleAttacker = safeRequire('role.attacker');
var roleHealer = safeRequire('role.healer');
var roleDefender = safeRequire('role.defender');
var roleSigner = safeRequire('role.signer');
var roleClaimer = safeRequire('role.claimer');
var roleBuildermachine = safeRequire('role.buildermachine');
var roleUpgradermachine = safeRequire('role.upgradermachine');
//var roleRepairerWall = safeRequire('role.repairerWall');
//var roleRepairerRoad = safeRequire('role.repairerRoad');
//var roleRepairerContainer = safeRequire('role.repairerContainer');
//var roleStrikerEureka = safeRequire('role.StrikerEureka');
//var roleChernoAlpha = safeRequire('role.ChernoAlpha');
//var roleCrimsonTyphoon = safeRequire('role.CrimsonTyphoon');
//var roleGipsyDanger = safeRequire('role.GipsyDanger');

// Map roles to their corresponding modules (only if successfully loaded)
// 中文: 将角色映射到其对应的模块（仅当成功加载时）
const roleFunc = {};

// Add roles to mapping only if they were successfully loaded
// 只有成功加载的角色才添加到映射中
if (roleHarvester) roleFunc.harvester = roleHarvester;
if (roleHarvester0) roleFunc.harvester0 = roleHarvester0;
if (roleHarvester1) roleFunc.harvester1 = roleHarvester1;
//if (roleHarvesterMineral) roleFunc.harvesterMineral = roleHarvesterMineral;
if (roleUpgrader) roleFunc.upgrader = roleUpgrader;
if (roleBuilder) roleFunc.builder = roleBuilder;
if (roleCarrier) roleFunc.carrier = roleCarrier;
if (roleCarrierMineral) roleFunc.carrierMineral = roleCarrierMineral;
if (roleTransferee) roleFunc.transferee = roleTransferee;
if (roleAttacker) roleFunc.attacker = roleAttacker;
if (roleHealer) roleFunc.healer = roleHealer;
if (roleDefender) roleFunc.defender = roleDefender;
if (roleSigner) roleFunc.signer = roleSigner;
if (roleClaimer) roleFunc.claimer = roleClaimer;
if (roleBuildermachine) roleFunc.buildermachine = roleBuildermachine;
if (roleUpgradermachine) roleFunc.upgradermachine = roleUpgradermachine;
//if (roleRepairerWall) roleFunc.repairerWall = roleRepairerWall;
//if (roleRepairerRoad) roleFunc.repairerRoad = roleRepairerRoad;
//if (roleRepairerContainer) roleFunc.repairerContainer = roleRepairerContainer;
//if (roleStrikerEureka) roleFunc.StrikerEureka = roleStrikerEureka;
//if (roleChernoAlpha) roleFunc.ChernoAlpha = roleChernoAlpha;
//if (roleCrimsonTyphoon) roleFunc.CrimsonTyphoon = roleCrimsonTyphoon;
//if (roleGipsyDanger) roleFunc.GipsyDanger = roleGipsyDanger;

// Main run function to execute each creep's role
// 中文: 主运行函数以执行每个爬虫的角色
var runCreep = {
    run: function() {
        for(var name in Game.creeps) {
            var creep = Game.creeps[name];
            var role = creep.memory.role;
            
            // Check if role function exists and is valid
            // 检查角色函数是否存在且有效
            if(roleFunc[role] && typeof roleFunc[role].run === 'function') {
                try {
                    roleFunc[role].run(creep);
                } catch (error) {
                    console.log(`Error running ${role} for creep ${name}: ${error}`);
                    // Set creep to idle state to prevent repeated errors
                    // 将爬虫设置为空闲状态以防止重复错误
                    creep.say('❌ error');
                }
            } else if (role) {
                // Role not found, log warning
                // 角色未找到，记录警告
                console.log(`Warning: Role '${role}' not found for creep ${name}`);
                creep.say('❓ no role');
            }
        }
    }
};
module.exports = runCreep;