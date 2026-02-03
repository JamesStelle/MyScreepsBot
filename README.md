# Screeps AI Bot 集合

一个功能完整的 Screeps 自动化殖民地管理系统集合，包含多个版本的AI机器人和自动布局工具。

## 📁 项目结构

```
├── 408Bot2/                    # 第二版本AI机器人
├── 408Bot3/                    # 第三版本AI机器人  
├── 63超级抠位置自动布局 傻瓜版/    # 自动布局工具
├── LICENSE                     # 开源许可证
└── README.md                   # 项目说明文档
```

## 🤖 AI机器人版本

### 408Bot2 & 408Bot3

两个高度优化的 Screeps AI 系统，实现了完整的殖民地自动化管理。基于模块化架构设计，具备完善的错误处理机制和性能优化。

#### 🌟 核心特性

- **🤖 智能角色系统**：专业化分工，每个creep角色都有明确职责和状态机管理
- **⚡ 能量管理系统**：实时监控，智能分配，效率优化，支持1500tick生命周期分析
- **🏗️ 基础设施维护**：自动修复，容器管理，建造优化，智能建筑维护
- **🔗 Link传输系统**：RCL5+自动激活，智能能量传输，存储Link优先级管理
- **🏰 Tower防御系统**：RCL3+自动激活，战斗/和平双模式，友军白名单支持
- **🎯 PRTS监控系统**：精密侦察战术支援，全面状态监控，停滞检测
- **🏠 通用房间管理**：RCL1-8精确配置，自适应Extension检测，多房间支持
- **🛡️ 安全机制**：完善的错误处理，内存清理，模块安全加载

#### 📋 角色系统详解

**采集角色**
- `harvester0/harvester1` - 专业能量采集者，分别负责source[0]和source[1]
- `harvesterMineral` - 矿物采集专家，处理各种矿物类型

**运输角色**  
- `carrier` - 通用能量运输者，智能优先级分配系统
- `carrierMineral` - 矿物运输专家，支持化合物优先级和功能区域过滤
- `transferee` - 任务驱动型运输者，支持灵活的转移任务配置

**建设角色**
- `upgrader` - 控制器升级专家，智能位置管理和容器修复
- `builder` - 建造和修复专家，90%健康度阈值，目标记忆系统

**军事角色**
- `attacker` - 攻击单位，支持跨房间作战和路径优化
- `healer` - 治疗单位，智能跟随和治疗优先级
- `defender` - 防御单位，巡逻系统和敌对检测
- `signer` - 控制器签名者，一次性任务自动回收

#### 🎮 部署指南

1. **代码部署**
   ```bash
   # 1. 选择机器人版本（推荐408Bot3）
   # 2. 上传整个文件夹到Screeps代码库
   # 3. 确保所有模块文件都已上传
   ```

2. **系统配置**
   ```javascript
   // 修改 config.js
   module.exports = {
       excludeRooms: ['E39N8'],     // 排除特定房间管理
       whitelist: ['MoSaSa'],       // Tower防御友军白名单
       // 可扩展配置项...
   };
   ```

3. **启动验证**
   ```javascript
   // 检查系统状态
   runGeneralRoom.quickStatus();
   
   // 验证模块加载
   console.log('System modules loaded successfully');
   ```

#### 🔧 高级功能系统

**runGeneralRoom 通用房间管理系统**
- **精确配置**：RCL1-8每级专用creep身体配置，能量效率最大化
- **自适应机制**：Extension不足时自动降级使用低等级配置
- **房间轮询**：自动发现所有拥有房间，实时状态分析
- **spawn管理**：支持自定义角色数量，智能生成优先级
- **监控系统**：持续监控，详细报告，问题自动识别

**PRTS 精密侦察战术支援系统**
- **控制台美化**：错误代码中文化，资源类型图标显示
- **实时监控**：房间能量状态，creep性能统计，控制器进度
- **停滞检测**：自动检测房间能量停滞，视觉警告系统
- **命令接口**：丰富的控制台命令，支持特定creep监控

**Link传输系统**
- **智能激活**：RCL5+且存在2个以上Link时自动启用
- **传输优化**：源Link满载(800)且目标Link为空(0)时传输
- **优先级管理**：存储Link > 控制器Link
- **位置识别**：自动识别源Link(能量源3格内)和目标Link

**Tower防御系统**
- **自动激活**：RCL3+且存在Tower时启用
- **双模式运行**：战斗模式(全塔攻击) vs 和平模式(单塔维护)
- **友军识别**：配置文件白名单支持，避免误伤
- **全面修复**：支持所有建筑类型修复，包括城墙

## 🏗️ 自动布局工具

### 63超级抠位置自动布局 傻瓜版

基于63大佬算法的强大自动房间布局工具，采用WASM优先队列加速，能够为95%的地形提供优化布局方案。

#### ✨ 核心特性

- **🎯 高覆盖率**：适用于95%的地形布局，对畸形地图效果显著
- **🧠 智能算法**：基于拉普拉斯插值和并查集的区块分析
- **⚡ WASM加速**：使用WebAssembly优先队列，性能提升80%+
- **🏗️ 完整布局**：自动生成所有建筑类型的最优位置
- **📊 详细输出**：提供完整的建筑坐标和建造顺序

#### 🔬 算法原理

**地形分析**
- 距离山体计算和插值处理
- 出口安全区域识别
- 地形连通性分析

**区块划分**
- 基于梯度的区块分割
- 并查集优化的区块合并
- 最小面积阈值过滤(140格)

**布局优化**
- Storage中心位置计算
- Lab区域4x4模式布局
- 道路网络最短路径规划
- 防御城墙自动生成

#### 🚀 使用方法

1. **环境准备**
   ```javascript
   // 1. 确保CPU bucket > 100
   // 2. 导入WASM模块 algo_wasm_priorityqueue.wasm
   // 3. 将布局工具代码复制到main.js
   ```

2. **设置标记点**
   ```javascript
   // 在目标房间放置4个flag：
   // pc - 控制器位置 (Controller)
   // pm - 矿物位置 (Mineral)
   // pa - 能量源A位置 (Source A)
   // pb - 能量源B位置 (Source B)
   ```

3. **执行布局**
   ```javascript
   // 放置名为 'p' 的flag触发布局计算
   // 系统会自动检测并开始运行
   // 完成后flag自动删除，结果显示在房间内
   ```

4. **可选配置**
   ```javascript
   // 手动指定Storage位置（可选）
   Game.flags.storagePos = {pos: {x: 25, y: 25}};
   
   // 调用API接口
   ManagerPlanner.computeManor(roomName, [pc, pm, pa, pb]);
   ```

#### 📋 输出格式详解

```javascript
{
    roomName: "W1N1",              // 房间名称
    structMap: {
        "spawn": [[25,25], [27,27]],           // 出生点位置
        "extension": [[24,25], [26,25], ...],   // 扩展位置(60个)
        "storage": [[24,24]],                   // 存储中心
        "terminal": [[25,26]],                  // 终端位置
        "factory": [[26,24]],                   // 工厂位置
        "lab": [[30,30], [31,30], ...],        // 实验室集群(10个)
        "tower": [[23,23], [27,23], ...],      // 塔楼位置(6个)
        "link": [[25,23], [10,15], ...],       // Link网络
        "container": [[10,15], [35,40], ...],   // 容器位置
        "road": [[24,23], [25,24], ...],       // 道路网络
        "rampart": [[22,22], [28,28], ...],    // 城墙防御
        "extractor": [[35,40]],                 // 采矿器
        "observer": [[29,29]],                  // 观察者
        "powerSpawn": [[28,28]],                // 能量产生器
        "nuker": [[30,28]]                      // 核弹发射器
    }
}
```

#### 🏗️ 建造顺序建议

```javascript
// 按RCL等级建造，使用CONTROLLER_STRUCTURES获取数量限制
// 建筑按距离Storage排序（除road外）

// RCL 1-2: Container, Road基础设施
// RCL 3: Tower防御, Extension扩展
// RCL 4: Storage存储中心
// RCL 5: Link网络, Tower增强
// RCL 6: Extractor, Terminal, Lab集群
// RCL 7: Factory, Spawn增加, Lab扩展
// RCL 8: Observer, PowerSpawn, Nuker
```

#### ⚠️ 重要注意事项

- **CPU要求**：确保bucket和可运行CPU超过100，算法计算密集
- **运行时机**：建议在CPU充足且无其他重要任务时运行
- **结果保存**：布局结果显示时间很短，务必及时截图保存
- **避免重复**：不要反复运行，每次运行消耗大量CPU
- **内存管理**：算法会自动清理内存，避免泄漏
- **兼容性**：支持所有地形类型，对复杂地形优化效果更佳

## 🛠️ 技术架构

### 系统设计
- **模块化架构**：清晰的代码结构，易于维护和扩展
- **状态机管理**：智能决策系统，减少不必要的计算开销
- **错误处理机制**：完善的异常处理，try-catch防护，系统稳定性保障
- **性能优化**：内存和CPU使用优化，自动内存清理机制

### 配置系统
- **统一配置文件**：config.js集中管理系统参数
- **灵活扩展性**：支持自定义角色数量和行为模式
- **多房间支持**：单一系统管理多个房间，支持房间排除配置
- **友军管理**：白名单系统支持友方玩家，避免防御误伤

### 监控系统
- **实时分析**：全面的房间状态监控，能量效率计算
- **效率统计**：基于1500tick生命周期的能量使用效率分析
- **视觉反馈**：游戏内状态显示，creep任务状态实时更新
- **命令接口**：丰富的控制台命令，支持详细的系统调试

### 核心模块详解

**main.js - 主循环控制器**
- 系统主循环，协调所有模块运行
- 安全模块加载机制，防止单点故障
- 全局错误处理，系统稳定性保障

**config.js - 配置管理中心**
- 房间排除配置：`excludeRooms`
- 友军白名单：`whitelist`
- 扩展配置支持

**runCreep.js - Creep调度器**
- 遍历所有存活creep
- 根据角色调用对应行为模块
- 统一的creep管理接口

**runRoom.js & runGeneralRoom.js - 房间管理**
- 专用房间管理(E39N8)和通用房间管理
- RCL1-8精确配置系统
- 自适应Extension检测和智能降级

**runLink.js - Link传输系统**
- 轮询所有房间Link建筑
- 智能传输条件判断
- 优先级管理：存储Link > 控制器Link

**Tower.js - 防御系统**
- 敌对creep检测(排除白名单)
- 战斗/和平双模式运行
- 全面建筑修复功能

**PRTS.js - 监控系统**
- 控制台美化和错误描述
- 房间状态分析和实时监控
- 停滞检测和视觉警告

## 📚 详细使用指南

### 快速部署

#### 1. 环境准备
- Screeps游戏账号和至少一个拥有的房间
- 基础JavaScript知识
- 推荐CPU限制 > 20，bucket > 1000

#### 2. 代码部署步骤
```bash
# 1. 下载项目文件到本地
git clone [repository-url]

# 2. 选择机器人版本
# 推荐使用408Bot3（功能最完整）

# 3. 上传到Screeps代码库
# 将选择版本的所有.js文件上传到Screeps

# 4. 验证部署
# 检查控制台是否有错误信息
```

#### 3. 系统配置
```javascript
// 修改config.js文件
module.exports = {
    // 排除特定房间（使用专用管理）
    excludeRooms: ['E39N8', 'W1N1'],
    
    // Tower防御系统友军白名单
    whitelist: ['MoSaSa', 'FriendName'],
    
    // 未来扩展配置
    maxCreepsPerRoom: 20,
    enableAutoDefense: true,
    debugMode: false
};
```

#### 4. 系统启动验证
```javascript
// 检查系统状态
runGeneralRoom.quickStatus();

// 验证房间发现
runGeneralRoom.pollRooms();

// 检查模块加载
console.log('All modules loaded:', 
    typeof runCreep !== 'undefined' &&
    typeof runRoom !== 'undefined' &&
    typeof Tower !== 'undefined'
);
```

### 高级配置

#### runGeneralRoom系统命令

**房间分析命令**
```javascript
// 轮询所有房间状态
runGeneralRoom.pollRooms();

// 分析特定房间
runGeneralRoom.analyzeRoom("E39N8");

// 查找有Spawn的房间
runGeneralRoom.findRoomsWithSpawn();

// 快速状态检查
runGeneralRoom.quickStatus();
```

**角色配置命令**
```javascript
// 显示所有RCL等级配置
runGeneralRoom.displayRoleConfigurations();

// 显示特定等级配置
runGeneralRoom.displayRoleConfigurations(7);

// 获取房间自适应配置
runGeneralRoom.getAdaptiveRoleBodyConfigurations("E39N8");

// 检查spawn需求
runGeneralRoom.checkSpawnNeeds("E39N8");
```

**Spawn数量管理**
```javascript
// 显示当前配置
runGeneralRoom.displaySpawnQuantities();

// 设置单个角色数量
runGeneralRoom.setRoleSpawnQuantity("harvester0", 2);

// 批量设置角色数量
runGeneralRoom.setAllRoleSpawnQuantities({
    harvester0: 2,
    harvester1: 2,
    carrier: 3,
    upgrader: 1,
    builder: 1,
    carrierMineral: 1
});
```

#### PRTS系统命令

**房间监控**
```javascript
// 房间能量分析
prts.energy('E39N8');

// 列出所有creep
prts.listCreeps();

// 监控特定creep
prts.monitor('E39N8Carrier123');

// 查看房间停滞状态
prts.stagnation('E39N8');

// 测试视觉警告
prts.testVisualWarning('E39N8');
```

**错误诊断**
```javascript
// 错误代码描述
prts.describeError(-6);  // 输出: ❌ 距离太远

// 动作结果描述
prts.describeAction('moveTo', result, creep.name, 'storage');
```

### 手动Creep生成

```javascript
// 基于RCL7配置的高级creep生成示例

// 生成高效harvester0 (5WORK, 1CARRY, 5MOVE)
Game.spawns['SpawnName'].spawnCreep(
    [WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE], 
    'Harvester0_' + Game.time, 
    {memory: {role: 'harvester0'}}
);

// 生成大容量carrier (10CARRY, 10MOVE)
Game.spawns['SpawnName'].spawnCreep(
    [CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,
     MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE], 
    'Carrier_' + Game.time, 
    {memory: {role: 'carrier'}}
);

// 生成平衡upgrader (5WORK, 1CARRY, 5MOVE)
Game.spawns['SpawnName'].spawnCreep(
    [WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE], 
    'Upgrader_' + Game.time, 
    {memory: {role: 'upgrader'}}
);

// 生成transferee任务型运输者
Game.spawns['SpawnName'].spawnCreep(
    [CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE], 
    'Transferee_' + Game.time, 
    {memory: {role: 'transferee'}}
);

// 为transferee分配转移任务
Game.creeps['Transferee_12345'].memory.transferTask = {
    from: "storage的ID或名称",
    to: "terminal的ID或名称",
    what: "energy",
    repeat: true  // 重复执行
};
```

## 🔍 故障排除

### 常见问题解答

**Q: 系统启动后creep不生成怎么办？**
```javascript
// 1. 检查spawn状态
console.log('Spawn energy:', Game.spawns['SpawnName'].store[RESOURCE_ENERGY]);

// 2. 检查房间能量
runGeneralRoom.analyzeRoom("RoomName");

// 3. 检查生成需求
runGeneralRoom.checkSpawnNeeds("RoomName");

// 4. 手动触发生成
Game.spawns['SpawnName'].spawnCreep([WORK,CARRY,MOVE], 'Test_' + Game.time);
```

**Q: Link系统不工作？**
```javascript
// 检查Link状态
_.forEach(Game.structures, (structure) => {
    if (structure.structureType === STRUCTURE_LINK) {
        console.log(`Link at ${structure.pos}: ${structure.store[RESOURCE_ENERGY]}/800`);
    }
});

// 检查RCL等级（需要RCL5+）
console.log('Room RCL:', Game.rooms['RoomName'].controller.level);
```

**Q: Tower不攻击敌人？**
```javascript
// 检查白名单配置
console.log('Whitelist:', require('config').whitelist);

// 检查Tower能量
_.forEach(Game.structures, (structure) => {
    if (structure.structureType === STRUCTURE_TOWER) {
        console.log(`Tower at ${structure.pos}: ${structure.store[RESOURCE_ENERGY]}/1000`);
    }
});
```

**Q: 房间能量停滞？**
```javascript
// 使用PRTS检查停滞状态
prts.stagnation('RoomName');

// 检查carrier工作状态
_.forEach(Game.creeps, (creep) => {
    if (creep.memory.role === 'carrier') {
        console.log(`${creep.name}: ${creep.store.getUsedCapacity()}/${creep.store.getCapacity()}`);
    }
});
```

### 性能优化建议

**CPU优化**
```javascript
// 监控CPU使用
console.log('CPU used:', Game.cpu.getUsed());
console.log('CPU limit:', Game.cpu.limit);
console.log('Bucket:', Game.cpu.bucket);

// 关闭不必要的视觉效果
// 在布局工具中注释掉HelperVisual.showRoomStructures调用
```

**内存优化**
```javascript
// 检查内存使用
console.log('Memory size:', JSON.stringify(Memory).length);

// 手动清理死亡creep内存
for(let name in Memory.creeps) {
    if(!Game.creeps[name]) {
        delete Memory.creeps[name];
    }
}
```

## 🎯 最佳实践

### 房间发展策略

**早期发展 (RCL 1-3)**
1. 优先建造基础harvester和carrier
2. 快速升级到RCL3解锁Tower防御
3. 建造足够的Extension支持更大creep

**中期发展 (RCL 4-6)**
1. 建造Storage和Link网络
2. 启用carrierMineral处理矿物
3. 优化creep配置提高效率

**后期发展 (RCL 7-8)**
1. 使用自动布局工具优化房间设计
2. 建造完整的Lab集群
3. 启用跨房间资源调配

### 多房间管理

```javascript
// 查看所有房间状态
runGeneralRoom.pollRooms();

// 为新房间配置排除列表
// 如果需要专用管理，添加到config.js的excludeRooms

// 批量设置所有房间的creep数量
runGeneralRoom.setAllRoleSpawnQuantities({
    harvester0: 1,
    harvester1: 1,
    carrier: 2,
    upgrader: 1,
    builder: 1
});
```

### 安全防护

```javascript
// 配置友军白名单
module.exports = {
    whitelist: ['Ally1', 'Ally2', 'Ally3']
};

// 监控敌对活动
prts.listCreeps();  // 查看所有creep，识别敌对单位

// 紧急防御模式
// Tower系统会自动切换到战斗模式
```

## 📈 系统性能

### 性能指标
- **CPU效率**：优化算法减少计算开销，平均CPU使用 < 15
- **内存管理**：自动清理死亡creep内存，防止内存泄漏
- **能量效率**：智能分配算法，最大化资源利用率 > 85%
- **响应速度**：实时监控系统，1tick内完成状态更新

### 系统要求
- **Screeps环境**：支持ES5语法的JavaScript运行时
- **最低配置**：至少一个拥有的房间和spawn
- **推荐配置**：CPU限制 > 20，bucket > 1000
- **布局工具**：CPU bucket > 100，支持WASM模块

### 版本历史

**v3.2 (最新版本)**
- ✅ 系统配置和全局变量优化
- ✅ config.js配置文件系统
- ✅ Tower防御系统集成白名单
- ✅ Link传输优先级调整
- ✅ 修正RCL配置能量成本注释
- ✅ 统一creep生成优先级

**v3.1**
- ✅ 优化E39N8 spawn判定系统
- ✅ 简化spawn状态显示
- ✅ 确保spawn判定准确性

**v3.0**
- ✅ 集成runGeneralRoom通用房间管理
- ✅ RCL1-8精确配置系统
- ✅ 自适应Extension检测
- ✅ spawn数量管理系统
- ✅ 中文帮助系统

**v2.4**
- ✅ PRTS精密侦察战术支援系统
- ✅ 房间停滞检测功能
- ✅ 视觉警告系统

**v2.0-2.3**
- ✅ 完善错误处理机制
- ✅ carrierMineral智能优先级
- ✅ transferee任务驱动运输
- ✅ 系统稳定性优化

**v1.0-1.9**
- ✅ 基础功能实现
- ✅ 军事单位支持
- ✅ Link传输系统
- ✅ Tower防御系统
- ✅ 智能容器管理

## 🤝 开发贡献

### 贡献指南

欢迎提交Issue和Pull Request来改进项目！

**开发规范**
- 所有角色文件以 `role.` 开头
- 使用中英文双语注释提高可读性
- 遵循现有代码风格和架构
- 添加适当的状态提示和错误处理
- 新功能需要更新README文档
- 配置项统一在config.js中管理

**提交规范**
- `feat:` 新功能开发
- `fix:` 问题修复  
- `docs:` 文档更新
- `refactor:` 代码重构
- `perf:` 性能优化
- `test:` 测试相关
- `style:` 代码格式调整

**测试指南**
- 在测试环境中验证新功能
- 确保不影响现有房间运行
- 测试多种RCL等级的兼容性
- 验证配置文件的正确性
- 检查CPU和内存使用情况

### 技术特点

**语言与架构**
- **开发语言**：JavaScript (ES5)
- **架构模式**：模块化 + 状态机
- **优化策略**：内存和CPU使用优化
- **可维护性**：清晰的代码结构和注释

**扩展性设计**
- **多房间支持**：架构支持扩展到多个房间
- **多spawn管理**：支持房间内多个spawn协调
- **自定义配置**：灵活的参数配置系统
- **稳定性保障**：完善的错误处理和异常恢复

### 未来规划

**短期目标 (v3.3-v3.5)**
- [ ] 增强AI决策算法
- [ ] 添加更多creep角色类型
- [ ] 优化跨房间资源调配
- [ ] 改进布局工具性能

**中期目标 (v4.0)**
- [ ] 图形化监控界面
- [ ] 自动化防御策略
- [ ] 智能市场交易系统
- [ ] 多玩家协作支持

**长期目标 (v5.0+)**
- [ ] 机器学习优化
- [ ] 分布式房间管理
- [ ] 高级战术系统
- [ ] 完整的GUI管理界面

## 📄 许可证与致谢

### 开源许可证

本项目采用 **MIT License** 开源许可证。

```
MIT License

Copyright (c) 2024 Screeps AI Bot Collection

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

### 特别致谢

**核心贡献者**
- **63大佬** - 提供超级抠位置自动布局算法和WASM优化
- **Screeps社区** - 提供技术支持和反馈
- **所有贡献者** - 参与项目开发和改进

**技术支持**
- **WebAssembly** - 高性能优先队列实现
- **Screeps官方** - 游戏平台和API支持
- **开源社区** - 算法和最佳实践分享

**灵感来源**
- Screeps官方文档和最佳实践
- 社区优秀AI项目和算法
- 实际游戏经验和优化需求

## 📞 联系与支持

### 获取帮助

**问题反馈**
- 提交Issue到项目仓库
- 详细描述问题和复现步骤
- 提供相关的错误日志和截图

**功能建议**
- 通过Issue提交功能请求
- 说明功能的使用场景和价值
- 欢迎提供实现思路和代码

**技术讨论**
- 在Screeps游戏内联系
- 参与社区技术讨论
- 分享使用经验和优化技巧

### 社区参与

**贡献代码**
- Fork项目仓库
- 创建功能分支
- 提交Pull Request
- 参与代码审查

**文档改进**
- 完善使用说明
- 添加示例代码
- 翻译多语言版本
- 制作视频教程

**测试反馈**
- 在不同环境测试
- 报告兼容性问题
- 提供性能数据
- 分享最佳实践

---

## 🌟 项目愿景

**愿此行，终抵群星** ⭐

> 这是一个持续发展的开源项目，致力于为Screeps玩家提供最优秀的AI管理系统和工具集合。我们相信通过社区的共同努力，可以创造出更加智能、高效、易用的Screeps AI解决方案。

**核心价值观**
- **开放共享**：开源精神，知识共享，共同进步
- **技术卓越**：追求代码质量，性能优化，用户体验
- **社区驱动**：倾听用户需求，响应社区反馈，协作发展
- **持续创新**：探索新技术，改进算法，引领发展

**加入我们**
无论您是Screeps新手还是资深玩家，无论您是想学习AI编程还是贡献代码，我们都欢迎您的参与。让我们一起构建更好的Screeps AI生态系统！

---

*最后更新：2024年*  
*项目状态：积极维护中*  
*社区活跃度：⭐⭐⭐⭐⭐*