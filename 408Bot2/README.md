# Screeps AI Bot - E39N8 Colony

一个功能完整的 Screeps 自动化殖民地管理系统，专为房间 E39N8 设计。

## 项目概述

这是一个高度优化的 Screeps AI 系统，实现了完整的殖民地自动化管理，包括资源采集、建造、升级、防御和能量效率监控等功能。

## 核心特性

### 🤖 智能角色系统
- **专业化分工**：每个 creep 角色都有明确的职责和优化的行为模式
- **状态机管理**：所有角色使用状态机进行智能决策
- **实时状态显示**：creep 会显示当前执行的任务状态

### ⚡ 能量管理系统
- **实时监控**：显示房间能量状态和使用效率
- **智能分配**：优化能量传输优先级
- **效率计算**：基于 1500 tick 生命周期的能量效率分析

### 🏗️ 基础设施维护
- **自动修复**：智能检测和修复受损建筑
- **容器管理**：专业化的容器维护和能量分配
- **建造优化**：自动建造和升级基础设施

### 🔗 Link 传输系统
- **自动激活**：房间等级达到 5 级且存在 2 个以上 Link 时启用
- **智能传输**：从能量源附近 Link 向控制器/存储区域 Link 传输能量
- **传输条件**：仅在源 Link 满载（800 能量）时传输
- **优先级**：控制器 Link > 存储 Link

### 🏰 Tower 防御系统
- **自动激活**：房间等级达到 3 级且存在 Tower 时启用
- **双模式运行**：战斗模式（全塔攻击）vs 和平模式（单塔维护）
- **友军白名单**：支持友方玩家白名单（如 MoSaSa）
- **全面修复**：修复所有建筑类型，包括城墙和城墙

## 角色系统详解

### 采集角色 (Harvesters)

#### harvester0
- **工作区域**：source[0] 附近
- **主要任务**：采集能量并存储到指定容器
- **优先级**：
  1. 向容器传输能量
  2. 容器满时修复容器
  3. 无容器时传输到 spawn/extensions

#### harvester1  
- **工作区域**：source[1] 附近
- **主要任务**：采集能量并存储到指定容器
- **行为模式**：与 harvester0 相同，但专注于 source[1]

#### harvesterMineral
- **工作区域**：矿物采集点
- **主要任务**：采集矿物资源
- **特殊功能**：处理各种矿物类型

### 运输角色 (Carriers)

#### carrier
- **主要任务**：能量运输和分配
- **传输优先级**：
  1. Extensions（扩展结构）
  2. Spawns（孵化器）
  3. 控制器附近容器（50%-80%）
  4. Towers（塔楼）
  5. 控制器附近容器（无条件）
- **收集优先级**：
  1. 掉落资源（≥50 能量）
  2. 墓碑（≥50 能量）
  3. 废墟（≥50 能量）
  4. 能量源附近容器（优先能量最多的）

#### carrierMineral
- **主要任务**：矿物运输
- **特殊功能**：处理化合物和基础矿物

### 升级角色 (Upgrader)

#### upgrader
- **主要任务**：升级控制器
- **工作模式**：停留在控制器附近容器上工作
- **特殊功能**：
  - 优先修复控制器附近容器（<90% 生命值）
  - 从控制器附近容器取能量
  - 智能位置管理

### 建造角色 (Builder)

#### builder
- **主要任务**：建造和修复
- **工作优先级**：
  1. 建造施工地点
  2. 修复受损建筑（健康度 < 90%）
  3. 升级控制器（备选）
- **修复机制**：
  - 修复阈值：90% 健康度以下触发
  - 修复目标：100% 健康度
  - 目标记忆：记住当前修复目标直到完成
- **能量管理**：
  - 优先从控制器附近容器取能量
  - 升级控制器时也可从控制器附近容器取能量

### 军事角色

#### attacker
- **主要任务**：攻击指定房间
- **目标房间**：E45N9
- **寻路策略**：
  - 优先选择高速公路房间
  - 其次选择无人占领的中性房间
- **攻击优先级**：Tower > Spawn > 其他建筑
- **特殊功能**：清除路径障碍物

#### healer
- **主要任务**：跟随并治疗 attacker
- **跟随机制**：读取 attacker 存储的路径信息
- **治疗优先级**：自身（危急）> attacker > 自身（轻伤）> 其他友军

#### defender
- **主要任务**：房间防御
- **工作模式**：巡逻和防御入侵者
- **状态机**：
  - **巡逻状态**：在重要建筑周围巡逻
  - **防御状态**：攻击敌对 creep
- **巡逻路径**：存储在内存中，使用 PathFinder 优化
- **攻击方式**：优先远程攻击，备选近战攻击

### 专业角色

#### signer
- **主要任务**：为控制器签名
- **签名内容**：「愿此行，终抵群星」
- **生命周期**：完成任务后自动回收
- **回收条件**：任务完成或生命值 < 50 tick

#### 修复专家
- **repairerWall**：专门修复城墙
- **repairerRoad**：专门修复道路  
- **repairerContainer**：专门修复容器

#### 机甲单位
- **StrikerEureka**：重型攻击单位
- **ChernoAlpha**：防御型机甲
- **CrimsonTyphoon**：快速攻击机甲
- **GipsyDanger**：多功能机甲

## 房间管理系统

### E39N8.js - 主控制模块
- **creep 生成管理**：根据需求自动生成各类 creep
- **生成优先级**：harvester0 > harvester1 > carrier > upgrader > builder
- **能量监控**：实时显示房间能量状态
- **效率分析**：计算能量使用效率

### 监控功能
- **房间能量状态**：Extension + Spawn 总能量/容量
- **creep 成本统计**：所有 creep 的总能量成本
- **效率比率**：creep 成本 / (3000 × 5 × 能量源数量)
- **更新频率**：每 1500 tick 输出到控制台

## 系统架构

### 文件结构
```
├── main.js                 # 主循环入口
├── runCreep.js            # creep 执行调度器
├── runRoom.js             # 房间管理
├── runLink.js             # Link 传输系统
├── Tower.js               # Tower 防御系统
├── E39N8.js               # 房间 E39N8 专用控制
├── memoryCleaner.js       # 内存清理
├── pixelGenerator.js      # 像素生成
└── role.*.js              # 各角色行为定义
```

### 核心模块

#### main.js
系统主循环，协调所有模块运行：
- 内存清理
- 像素生成  
- creep 管理
- 房间管理
- Link 管理
- Tower 管理

#### runLink.js
Link 传输系统，负责：
- 轮询所有房间的 Link 建筑
- 识别源 Link（能量源 3 格内）和目标 Link（控制器/存储 2 格内）
- 执行智能能量传输（仅在源 Link 满载时）
- 优先级管理：控制器 Link > 存储 Link

#### Tower.js
Tower 防御系统，负责：
- 轮询所有房间的 Tower 建筑
- 检测敌对 creep（排除白名单玩家）
- 战斗模式：所有 Tower 攻击敌人
- 和平模式：单个 Tower 修复建筑
- 支持友军白名单功能

#### runCreep.js
creep 执行调度器，负责：
- 遍历所有存活的 creep
- 根据角色调用对应的行为模块
- 统一的 creep 管理接口

## 使用指南

### 部署步骤
1. 将所有文件上传到 Screeps 代码库
2. 确保房间名称为 E39N8（或修改相应配置）
3. 系统将自动开始运行

### 手动生成 creep
```javascript
// 生成基础 harvester0
Game.spawns['E39N8'].spawnCreep([WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE], 'Harvester0' + Game.time, {memory: {role: 'harvester0'}})

// 生成基础 harvester1
Game.spawns['E39N8'].spawnCreep([WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE], 'Harvester1' + Game.time, {memory: {role: 'harvester1'}})

// 生成 carrier
Game.spawns['E39N8'].spawnCreep([CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], 'Carrier' + Game.time, {memory: {role: 'carrier'}})

// 生成 upgrader
Game.spawns['E39N8'].spawnCreep([WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE], 'Upgrader' + Game.time, {memory: {role: 'upgrader'}})

// 生成 builder
Game.spawns['E39N8'].spawnCreep([WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], 'Builder' + Game.time, {memory: {role: 'builder'}})

// 生成 signer（一次性任务）
Game.spawns['E39N8'].spawnCreep([MOVE], 'Signer' + Game.time, {memory: {role: 'signer'}})

// 生成 defender
Game.spawns['E39N8'].spawnCreep([TOUGH, TOUGH, MOVE, MOVE, ATTACK, ATTACK, RANGED_ATTACK], 'Defender' + Game.time, {memory: {role: 'defender'}})
```

### 监控命令
```javascript
// 查看房间状态
Game.rooms['E39N8']

// 查看所有 creep
_.forEach(Game.creeps, (creep) => console.log(creep.name + ': ' + creep.memory.role))

// 查看房间能量效率
console.log('Room E39N8 efficiency: ' + Math.round((totalCreepCost / totalEnergyProduction) * 100) + '%')

// 强制回收 creep
Game.spawns['E39N8'].recycleCreep(Game.creeps['creepName'])

// 查看 Link 状态
_.forEach(Game.structures, (structure) => {
    if (structure.structureType === STRUCTURE_LINK) {
        console.log('Link at ' + structure.pos + ': ' + structure.store[RESOURCE_ENERGY] + '/800 energy')
    }
})

// 查看 Tower 状态
_.forEach(Game.structures, (structure) => {
    if (structure.structureType === STRUCTURE_TOWER) {
        console.log('Tower at ' + structure.pos + ': ' + structure.store[RESOURCE_ENERGY] + '/1000 energy')
    }
})
```

## 优化特性

### 能量效率优化
- **智能传输**：优先级系统确保能量高效分配
- **容器管理**：专业化容器维护减少能量浪费
- **回收机制**：一次性任务 creep 自动回收
- **Link 系统**：高效的长距离能量传输
- **Tower 优化**：战斗和维护模式智能切换

### 性能优化
- **状态机**：减少不必要的计算
- **专业分工**：避免角色冲突
- **内存管理**：定期清理死亡 creep 内存
- **错误处理**：try-catch 机制防止单点故障
- **路径缓存**：defender 巡逻路径存储优化

### 可扩展性
- **模块化设计**：易于添加新角色和功能
- **配置化**：关键参数可轻松调整
- **多房间支持**：架构支持扩展到多个房间
- **白名单系统**：支持友军管理

## 开发信息

### 版本历史
- **v1.0**：基础功能实现
- **v1.1**：添加军事单位支持
- **v1.2**：优化能量管理系统
- **v1.3**：添加专业修复角色
- **v1.4**：实现智能容器管理
- **v1.5**：添加效率监控系统
- **v1.6**：实现 Link 传输系统
- **v1.7**：添加 Tower 防御系统
- **v1.8**：优化 builder 修复机制
- **v1.9**：简化 defender 巡逻系统
- **v2.0**：完善错误处理和系统稳定性

### 技术特点
- **语言**：JavaScript (ES5)
- **架构**：模块化 + 状态机
- **优化**：内存和 CPU 使用优化
- **可维护性**：清晰的代码结构和注释

## 贡献指南

欢迎提交 Issue 和 Pull Request 来改进这个项目！

### 开发规范
- 所有角色文件以 `role.` 开头
- 使用中英文双语注释
- 遵循现有的代码风格
- 添加适当的状态提示

## 许可证

MIT License

---

**愿此行，终抵群星** ⭐