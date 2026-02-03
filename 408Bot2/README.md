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
- **传输条件**：仅在源 Link 满载（800 能量）且目标 Link 为空（0 能量）时传输
- **优先级**： 存储 Link > 控制器 Link

### 🏠 通用房间管理系统 (runGeneralRoom.js)
- **多RCL支持**：为RCL1-8提供精确优化的creep身体配置
- **自适应配置**：Extension不足时自动降级使用低等级配置
- **房间轮询**：自动发现所有拥有的房间并分析状态
- **spawn数量管理**：每种角色默认数量为1，支持自定义调整
- **能量计算**：基于单次生产最大能量(1个Spawn + 所有Extensions)设计
- **智能监控**：实时监控房间能量状态、结构数量和creep统计

### 🎯 PRTS 智能监控系统
- **控制台美化**：将错误代码转换为中文描述
- **房间分析**：详细的房间状态分析和监控
- **爬虫监控**：实时监控特定爬虫的详细信息
- **停滞检测**：自动检测房间能量停滞问题
- **视觉警告**：在房间中显示停滞警告信息

### 🏰 Tower 防御系统
- **自动激活**：房间等级达到 3 级且存在 Tower 时启用
- **双模式运行**：战斗模式（全塔攻击）vs 和平模式（单塔维护）
- **友军白名单**：支持友方玩家白名单，通过config.js配置
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
- **主要任务**：矿物和化合物运输
- **智能优先级系统**：
  - 收集优先级：化合物 > 基础矿物
  - 墓碑/废墟选择：优先选择有化合物的目标
  - 传输目标过滤：排除功能区域容器
- **传输目标限制**：
  - ✅ 可传输：Storage、Terminal、远离功能建筑的Container
  - ❌ 不传输：Source 2格内、Extractor 2格内、Controller 2格内的Container
- **特殊功能**：支持ops等高级化合物处理

#### transferee
- **主要任务**：执行指定的资源转移任务
- **任务驱动**：根据控制台输入的内存配置执行转移
- **灵活查找**：支持通过ID、名称、类型等多种方式查找结构
- **任务配置格式**：
  ```javascript
  Game.creeps['转移者名称'].memory.transferTask = {
      from: "源结构ID或名称",
      to: "目标结构ID或名称", 
      what: "资源类型",
      repeat: true/false  // 可选：是否重复执行
  };
  ```
- **状态显示**：⏳ wait、🔍 collect、🚚 deliver、✅ done、🔄 repeat

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
- **生成优先级**：harvester > harvester0 > harvester1 > carrier > carrierMineral > upgrader > builder
- **spawn判定**：使用E39N8房间内名为"E39N8"的spawn
- **能量监控**：实时显示房间能量状态
- **效率分析**：计算能量使用效率

### runGeneralRoom.js - 通用房间管理系统
- **RCL配置系统**：为每个控制器等级(RCL1-8)提供专门优化的creep身体配置
- **能量容量计算**：精确计算各等级的spawn和extension总容量
- **自适应配置**：当Extension数量不足时，自动降级使用低等级配置
- **房间轮询功能**：自动发现所有拥有的房间并分析状态
- **spawn数量管理**：支持自定义各角色的生成数量，默认每种角色1个
- **生成优先级系统**：harvester → harvester0 → harvester1 → carrier → carrierMineral → upgrader → builder
- **实时监控**：房间能量状态、结构数量、creep统计等全面监控

### 监控功能
- **房间能量状态**：Extension + Spawn 总能量/容量
- **creep 成本统计**：所有 creep 的总能量成本
- **效率比率**：creep 成本 / (3000 × 5 × 能量源数量)
- **更新频率**：每 1500 tick 输出到控制台

## runGeneralRoom.js 通用房间管理系统详解

### 系统概述

runGeneralRoom.js 是一个功能完整的通用房间管理系统，为所有控制器等级(RCL1-8)提供精确优化的creep身体配置和全面的房间管理功能。该系统独立于特定房间，可以管理任意数量的房间。

### 核心功能

#### 🎯 精确的RCL配置系统
- **每级专用配置**：为RCL1-8每个等级提供专门优化的creep身体配置
- **能量精确计算**：基于单次生产最大能量(1个Spawn + 所有Extensions)设计
- **成本优化**：所有配置都在对应RCL的能量限制内，确保可以正常生产

#### ⚡ 能量容量管理
```javascript
// RCL等级对应的能量容量
RCL1: 300能量   (1 Spawn + 0 Extensions)
RCL2: 550能量   (1 Spawn + 5×50 Extensions)  
RCL3: 800能量   (1 Spawn + 10×50 Extensions)
RCL4: 1300能量  (1 Spawn + 20×50 Extensions)
RCL5: 1800能量  (1 Spawn + 30×50 Extensions)
RCL6: 2300能量  (1 Spawn + 40×50 Extensions)
RCL7: 5300能量  (1 Spawn + 50×100 Extensions)
RCL8: 12300能量 (1 Spawn + 60×200 Extensions)
```

#### 🔄 自适应配置系统
- **智能降级**：当房间Extension数量不足时，自动使用低等级配置
- **实时检测**：动态检测房间实际Extension数量
- **配置匹配**：根据实际Extension数量匹配最合适的RCL配置

#### 🤖 角色配置管理
支持6种核心角色的完整配置：
- **harvester0/harvester1**：能量采集者，针对不同能量源优化
- **carrier**：通用能量运输者，高载重设计
- **carrierMineral**：矿物运输者，专门处理矿物和化合物
- **upgrader**：控制器升级者，平衡工作和移动能力
- **builder**：建造者，兼顾建造和修复功能

#### 📊 房间轮询和监控
- **自动发现**：扫描所有拥有的房间
- **状态分析**：实时分析房间能量、结构、creep状态
- **问题识别**：自动识别需要关注的房间
- **详细报告**：提供完整的房间状态报告

#### 🎮 spawn数量管理
- **默认配置**：每种角色默认生成数量为1个
- **自定义调整**：支持动态调整各角色的生成数量
- **需求检测**：自动检测房间当前creep数量与目标数量的差异
- **优先级系统**：harvester → harvester0 → harvester1 → carrier → carrierMineral → upgrader → builder

### 主要命令接口

#### 容量计算命令
```javascript
// 显示所有等级的容量表
runGeneralRoom.displayCapacityTable()

// 计算特定等级的容量
runGeneralRoom.calculateTotalCapacity(7)

// 计算单次生产最大能量
runGeneralRoom.calculateMaxCreepEnergy(6)
```

#### 房间分析命令
```javascript
// 分析指定房间
runGeneralRoom.analyzeRoom("E39N8")

// 轮询所有房间
runGeneralRoom.pollRooms()

// 查找有Spawn的房间
runGeneralRoom.findRoomsWithSpawn()

// 快速查看房间状态
runGeneralRoom.quickStatus()
```

#### 角色配置命令
```javascript
// 显示所有等级的角色配置
runGeneralRoom.displayRoleConfigurations()

// 显示特定等级的配置
runGeneralRoom.displayRoleConfigurations(7)

// 获取房间自适应配置
runGeneralRoom.getAdaptiveRoleBodyConfigurations("E39N8")

// 显示房间自适应配置
runGeneralRoom.displayAdaptiveRoleConfigurations("E39N8")

// 获取所有房间的自适应配置
runGeneralRoom.getAllRoomsAdaptiveConfigurations()
```

#### spawn数量管理命令
```javascript
// 显示当前生成数量配置
runGeneralRoom.displaySpawnQuantities()

// 设置单个角色数量
runGeneralRoom.setRoleSpawnQuantity("harvester0", 2)

// 批量设置角色数量
runGeneralRoom.setAllRoleSpawnQuantities({
    harvester0: 2,
    harvester1: 2,
    carrier: 3,
    upgrader: 1,
    builder: 1,
    carrierMineral: 1
})

// 检查房间生成需求
runGeneralRoom.checkSpawnNeeds("E39N8")

// 获取生成优先级列表
runGeneralRoom.getSpawnPriorityList("E39N8")
```

#### 监控命令
```javascript
// 监控特定房间
runGeneralRoom.monitorRoom("E39N8", 20)

// 停止监控
runGeneralRoom.stopMonitor("E39N8")

// 执行监控检查(在main.js中调用)
runGeneralRoom.executeMonitoring()
```

#### 帮助系统
```javascript
// 显示帮助菜单
runGeneralRoom.help()

// 查看特定分类帮助
runGeneralRoom.help("calc")     // 容量计算
runGeneralRoom.help("analyze")  // 房间分析  
runGeneralRoom.help("poll")     // 房间轮询
runGeneralRoom.help("roles")    // 角色配置

// 快捷帮助
runGeneralRoom.h("roles")
```

### 输出示例

#### 房间轮询结果
```
🔍 开始轮询所有拥有的房间...
═══════════════════════════════════════════════════════════════════════════════
📊 房间轮询结果 (2个房间):
────────────────────────────────────────────────────────────────────────────────
房间名称    | RCL | 能量状态      | Spawn | Ext | 单次最大 | 状态
────────────────────────────────────────────────────────────────────────────────
E39N8       | RCL7| 1200/1300(92%)| 2/2   | 50/50| 5300     | ⚡ 满能量
E45N9       | RCL4| 300/1300(23%) | 1/1   | 15/20| 1300     | 🔋 低能量
────────────────────────────────────────────────────────────────────────────────

⚠️ 需要关注的房间:
🏠 E45N9 (RCL4):
  - 缺少 5 个Extension
  - 能量不足: 23%

📈 轮询汇总:
- 总房间数: 2
- 正常房间: 1  
- 需关注房间: 1
═══════════════════════════════════════════════════════════════════════════════
```

#### 自适应配置分析
```
🔍 分析所有房间的自适应body配置...
═══════════════════════════════════════════════════════════════════════════════
⚠️ 房间 E45N9 Extension不足:
  - 实际等级: RCL4 (期望20个Extension)
  - 实际Extension: 15个
  - 有效等级: RCL3 (匹配10个Extension)
  - 将使用RCL3的body配置

📊 自适应配置汇总:
────────────────────────────────────────────────────────────────────────────────
房间名称    | 实际RCL | 有效RCL | Extension | 最大能量 | 状态
────────────────────────────────────────────────────────────────────────────────
E39N8       | RCL7    | RCL7    | 50/50     | 5300     | ✅ 正常
E45N9       | RCL4    | RCL3    | 15/20     | 800      | ⚠️ 降级
────────────────────────────────────────────────────────────────────────────────

⚠️ 需要建设Extension的房间:
  - E45N9: 还需建设 5 个Extension
────────────────────────────────────────────────────────────────────────────────
```

#### 生成需求检查
```
🔍 检查房间 E39N8 的creep生成需求...
────────────────────────────────────────────────────────────────────
角色名称        | 当前数量 | 目标数量 | 状态
────────────────────────────────────────────────────────────────────
harvester0      | 1        | 1        | ✅ 满足
harvester1      | 0        | 1        | ❌ 需要1个
carrier         | 2        | 1        | ✅ 满足
carrierMineral  | 1        | 1        | ✅ 满足
upgrader        | 1        | 1        | ✅ 满足
builder         | 0        | 1        | ❌ 需要1个
────────────────────────────────────────────────────────────────────
📊 汇总: 总creep 5个, 需要生成 2种角色

🎯 房间 E39N8 生成优先级列表:
──────────────────────────────────────────────────
1. harvester1 (需要1个)
2. builder (需要1个)
──────────────────────────────────────────────────
```

### 技术特点

#### 🎯 精确优化
- **能量效率**：每个配置都经过精确计算，确保最大化利用可用能量
- **RCL7/8优化**：考虑1500tick内30000能量生产限制，使用合理的配置
- **部件平衡**：合理平衡WORK、CARRY、MOVE部件比例

#### 🔄 智能适应
- **动态检测**：实时检测房间实际建筑数量
- **自动降级**：Extension不足时自动使用低等级配置
- **无缝切换**：配置切换不影响系统运行

#### 📊 全面监控
- **多维度分析**：能量、结构、creep等全方位监控
- **问题识别**：自动识别需要关注的问题
- **趋势分析**：支持持续监控和趋势分析

#### 🛠️ 易于使用
- **丰富接口**：提供完整的命令行接口
- **详细帮助**：内置完整的中文帮助系统
- **快捷操作**：支持快捷命令和批量操作

### 集成方式

#### 在main.js中集成
```javascript
// 在main.js中添加监控功能
var runGeneralRoom = require('runGeneralRoom');

module.exports.loop = function () {
    // 其他代码...
    
    // 执行房间监控(可选)
    runGeneralRoom.executeMonitoring();
    
    // 其他代码...
}
```

#### 在房间管理中使用
```javascript
// 在房间管理代码中使用自适应配置
var runGeneralRoom = require('runGeneralRoom');

// 获取房间的自适应配置
var roomConfig = runGeneralRoom.getAdaptiveRoleBodyConfigurations(roomName);
if (roomConfig) {
    // 使用roomConfig.bodyConfigurations中的配置生成creep
    var harvesterBody = roomConfig.bodyConfigurations.harvester0;
    spawn.spawnCreep(harvesterBody, 'Harvester0' + Game.time, {
        memory: {role: 'harvester0'}
    });
}
```

### 版本特性

#### v1.0 特性
- ✅ 完整的RCL1-8配置系统
- ✅ 自适应Extension检测和降级
- ✅ 房间轮询和状态分析
- ✅ spawn数量管理系统
- ✅ 完整的中文帮助系统
- ✅ 丰富的命令行接口
- ✅ 实时监控功能
- ✅ 能量效率优化

该系统为Screeps提供了一个强大而灵活的房间管理解决方案，无论是单房间还是多房间管理都能提供优秀的支持。

## PRTS 系统详解

### 精密侦察战术支援系统 (Precision Reconnaissance and Tactical Support)

PRTS 是一个智能监控和控制台美化系统，提供全面的房间管理和状态监控功能。

#### 核心功能

##### 🎨 控制台美化
- **错误代码描述**：将数字错误代码转换为中文描述
- **资源类型描述**：将资源代码转换为带图标的中文名称
- **结构类型描述**：将结构类型转换为带图标的中文名称

##### 📊 房间监控
- **实时分析**：提供详细的房间状态分析
- **能量监控**：监控 Spawn + Extension 能量状态
- **爬虫统计**：统计房间内爬虫数量和类型
- **控制器状态**：显示控制器等级和升级进度

##### ⚠️ 停滞检测
- **自动轮询**：每个游戏循环检查所有拥有的房间
- **停滞条件**：Spawn+Extension总容量>300且能量维持在300+超过1500tick
- **视觉警告**：在房间坐标(25,25)显示"⚠️ 房间停滞"警告
- **持久化监控**：监控数据保存在Memory中，重启后继续监控

#### PRTS 控制台命令

```javascript
// 错误代码描述
prts.describeError(-6);  // 输出: ❌ 距离太远

// 动作结果描述
prts.describeAction('moveTo', result, creep.name, 'storage');

// 列出所有爬虫
prts.listCreeps();

// 分析房间状态
prts.energy('E39N8');

// 监控特定爬虫
prts.monitor('E39N8Carrier123');

// 查看房间停滞状态
prts.stagnation('E39N8');  // 特定房间
prts.stagnation();         // 所有房间

// 清除停滞监控数据
prts.clearStagnation('E39N8');  // 特定房间
prts.clearStagnation();         // 所有房间

// 测试视觉警告效果
prts.testVisualWarning('E39N8');
```

#### 输出示例

##### 房间分析
```
🏠 房间分析: E39N8
🎯 控制器: RCL7 (45000/90000 - 50%)
⚡ 能量: 1200/1300 (92%)
🤖 爬虫数量: 7
💎 能量源: 2个
```

##### 爬虫监控
```
🤖 爬虫监控: E39N8Carrier123
📍 位置: (25, 15) 房间: E39N8
🎭 角色: carrier
💾 存储: 500/1000
⏱️ 生命周期: 1234
🔋 疲劳: 0
🦾 身体: CARRY×10, MOVE×10
```

##### 停滞监控
```
🏠 房间停滞监控: E39N8
⚡ 当前能量: 350/1300
⏳ 状态: 监控中 (已维持300+能量 800/1500 tick)
```

## 系统架构

### 文件结构
```
├── main.js                 # 主循环入口
├── config.js               # 系统配置文件
├── runCreep.js            # creep 执行调度器
├── runRoom.js             # 房间管理
├── runGeneralRoom.js      # 通用房间管理系统
├── runLink.js             # Link 传输系统
├── Tower.js               # Tower 防御系统
├── E39N8.js               # 房间 E39N8 专用控制
├── PRTS.js                # 精密侦察战术支援系统
├── memoryCleaner.js       # 内存清理
├── pixelGenerator.js      # 像素生成
└── role.*.js              # 各角色行为定义
```

### 配置系统

#### config.js - 系统配置文件
- **排除房间**：`excludeRooms` - 指定不使用runGeneralRoom管理的房间
- **友军白名单**：`whitelist` - Tower防御系统的友方玩家列表
- **扩展性**：支持添加更多配置选项

**配置示例：**
```javascript
module.exports = {
    excludeRooms: ['E39N8'],        // 排除E39N8使用专用管理
    whitelist: ['MoSaSa'],          // Tower不攻击MoSaSa的creep
    // 未来可添加更多配置...
};
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
- PRTS 监控系统

#### PRTS.js
精密侦察战术支援系统，负责：
- 控制台返回值美化和错误代码描述
- 房间状态分析和实时监控
- 爬虫性能监控和统计
- 房间停滞检测和视觉警告
- 提供丰富的控制台命令接口

#### runLink.js
Link 传输系统，负责：
- 轮询所有房间的 Link 建筑
- 识别源 Link（能量源 3 格内）和目标 Link（控制器/存储 2 格内）
- 执行智能能量传输（仅在源 Link 满载且目标 Link 为空时）
- 优先级管理：存储 Link > 控制器 Link

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

### 系统特色

#### 🎯 智能化管理
- **自适应配置**：根据房间实际Extension数量自动调整creep配置
- **多房间支持**：单一系统管理多个房间，支持房间排除配置
- **优先级系统**：智能的creep生成和资源分配优先级
- **状态监控**：实时监控房间能量、结构、creep状态

#### 🔧 易于配置
- **配置文件**：通过config.js统一管理系统配置
- **全局变量**：runGeneralRoom设为全局变量，命令调用更简便
- **帮助系统**：内置完整的中文帮助文档和命令参考
- **兼容性**：与现有E39N8专用系统完全兼容

#### 📊 数据驱动
- **精确计算**：基于RCL等级的精确能量和结构配置
- **效率分析**：实时计算能量使用效率和creep成本
- **智能降级**：Extension不足时自动使用合适的低等级配置
- **详细统计**：提供房间轮询、creep统计、结构分析等功能

## 使用指南

### 快速开始

#### 1. 基础部署
```javascript
// 1. 上传所有文件到Screeps代码库
// 2. 确保房间名称为E39N8（或修改config.js中的excludeRooms配置）
// 3. 系统将自动开始运行

// 检查系统状态
runGeneralRoom.quickStatus();
```

#### 2. 配置系统
```javascript
// 修改config.js文件进行系统配置
module.exports = {
    excludeRooms: ['E39N8'],        // 排除使用runGeneralRoom管理的房间
    whitelist: ['MoSaSa'],          // Tower防御系统友军白名单
};
```

#### 3. 房间管理
```javascript
// 查看所有房间状态
runGeneralRoom.pollRooms();

// 分析特定房间
runGeneralRoom.analyzeRoom("E39N8");

// 检查creep生成需求
runGeneralRoom.checkSpawnNeeds("E39N8");
```

### 常见问题 FAQ

#### Q: 如何添加新房间到系统管理？
A: 新房间会自动被runGeneralRoom系统发现和管理。如果需要排除某个房间，在config.js的excludeRooms数组中添加房间名称。

#### Q: 如何自定义creep生成数量？
```javascript
// 设置单个角色数量
runGeneralRoom.setRoleSpawnQuantity("harvester0", 2);

// 批量设置
runGeneralRoom.setAllRoleSpawnQuantities({
    harvester0: 2,
    harvester1: 2,
    carrier: 3
});
```

#### Q: Extension不足时系统如何处理？
A: 系统会自动检测Extension数量，如果不足会降级使用低等级的creep配置，确保正常运行。

#### Q: 如何添加友军到Tower白名单？
A: 在config.js文件中的whitelist数组添加玩家名称：
```javascript
whitelist: ['MoSaSa', '新友军名称']
```

#### Q: Link传输系统何时激活？
A: 房间达到RCL5且存在2个以上Link时自动激活。传输条件：源Link满载(800能量)且目标Link为空(0能量)。

#### Q: 如何监控房间状态？
```javascript
// 持续监控特定房间
runGeneralRoom.monitorRoom("E39N8", 50);

// 查看帮助
runGeneralRoom.help();
```

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

// 生成 transferee（任务驱动型运输者）
Game.spawns['E39N8'].spawnCreep([CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], 'Transferee' + Game.time, {memory: {role: 'transferee'}})

// 为 transferee 分配任务
Game.creeps['Transferee名称'].memory.transferTask = {
    from: "storage的ID",
    to: "terminal的ID",
    what: "energy",
    repeat: true
};
```

### 监控命令
```javascript
// 查看房间状态
Game.rooms['E39N8']

// 查看所有 creep
_.forEach(Game.creeps, (creep) => console.log(creep.name + ': ' + creep.memory.role))

// PRTS 系统命令
prts.energy('E39N8');           // 房间能量分析
prts.listCreeps();              // 列出所有爬虫
prts.monitor('爬虫名称');        // 监控特定爬虫
prts.stagnation('E39N8');       // 查看房间停滞状态
prts.testVisualWarning('E39N8'); // 测试视觉警告

// runGeneralRoom 系统命令
runGeneralRoom.help();                     // 显示帮助菜单
runGeneralRoom.pollRooms();               // 轮询所有房间
runGeneralRoom.findRoomsWithSpawn();      // 查找有Spawn的房间
runGeneralRoom.analyzeRoom('E39N8');      // 分析指定房间
runGeneralRoom.displayCapacityTable();    // 显示容量表
runGeneralRoom.displayRoleConfigurations(7); // 显示RCL7配置
runGeneralRoom.getAdaptiveRoleBodyConfigurations('E39N8'); // 获取自适应配置
runGeneralRoom.checkSpawnNeeds('E39N8');  // 检查生成需求
runGeneralRoom.displaySpawnQuantities();  // 显示生成数量配置
runGeneralRoom.setRoleSpawnQuantity('harvester0', 2); // 设置角色数量

// 查看房间能量效率
console.log('Room E39N8 efficiency: ' + Math.round((totalCreepCost / totalEnergyProduction) * 100) + '%')

// 强制回收 creep
Game.spawns['E39N8'].recycleCreep(Game.creeps['creepName'])

// 移动 carrierMineral 到指定位置
let carrierMineral = Object.values(Game.creeps).find(creep => creep.memory.role === 'carrierMineral');
if(carrierMineral) {
    carrierMineral.moveTo(28, 19, {visualizePathStyle: {stroke: '#ff0000'}});
}

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
- **v2.1**：添加 carrierMineral 智能优先级系统
- **v2.2**：实现 transferee 任务驱动型运输者
- **v2.3**：集成 PRTS 精密侦察战术支援系统
- **v2.4**：添加房间停滞检测和视觉警告功能
- **v3.0**：集成 runGeneralRoom.js 通用房间管理系统
  - 完整的RCL1-8精确配置系统
  - 自适应Extension检测和智能降级
  - 全面的房间轮询和状态分析
  - spawn数量管理和优先级系统
  - 丰富的中文帮助系统和命令接口
- **v3.1**：优化E39N8 spawn判定系统
  - 明确指定使用E39N8房间内名为"E39N8"的spawn
  - 简化spawn状态显示和日志记录
  - 确保spawn判定的准确性和可靠性
- **v3.2**：系统配置和全局变量优化
  - 创建config.js配置文件系统，支持排除房间和友军白名单
  - runGeneralRoom设置为全局变量，简化命令调用
  - Tower防御系统集成配置文件白名单功能
  - Link传输系统优先级调整：存储Link > 控制器Link
  - Link传输条件优化：源Link满载(800)且目标Link为空(0)时传输
  - 修正所有RCL等级配置中的能量成本注释错误
  - 统一E39N8.js和runGeneralRoom.js的creep生成优先级
  - 增强房间过滤功能，确保creep统计的准确性

### 技术特点
- **语言**：JavaScript (ES5)
- **架构**：模块化 + 状态机
- **优化**：内存和 CPU 使用优化
- **可维护性**：清晰的代码结构和注释

### 技术特点
- **语言**：JavaScript (ES5)
- **架构**：模块化 + 状态机
- **优化**：内存和 CPU 使用优化
- **可维护性**：清晰的代码结构和注释
- **扩展性**：支持多房间、多spawn、自定义配置
- **稳定性**：完善的错误处理和异常恢复机制

### 系统要求
- Screeps游戏环境
- 支持ES5语法的JavaScript运行时
- 至少一个拥有的房间和spawn

### 性能指标
- **CPU效率**：优化的算法减少不必要的计算
- **内存管理**：自动清理死亡creep内存
- **能量效率**：智能的能量分配和传输系统
- **响应速度**：实时状态监控和快速决策

## 贡献指南

欢迎提交 Issue 和 Pull Request 来改进这个项目！

### 开发规范
- 所有角色文件以 `role.` 开头
- 使用中英文双语注释
- 遵循现有的代码风格
- 添加适当的状态提示

### 开发规范
- 所有角色文件以 `role.` 开头
- 使用中英文双语注释
- 遵循现有的代码风格
- 添加适当的状态提示
- 新功能需要更新README文档
- 配置项统一在config.js中管理

### 提交规范
- 功能开发：`feat: 添加新功能描述`
- 问题修复：`fix: 修复问题描述`
- 文档更新：`docs: 更新文档内容`
- 代码重构：`refactor: 重构代码描述`
- 性能优化：`perf: 性能优化描述`

### 测试指南
- 在测试环境中验证新功能
- 确保不影响现有房间运行
- 测试多种RCL等级的兼容性
- 验证配置文件的正确性

## 更新日志

### 最近更新
- **2024年最新版本**：集成配置系统和全局变量优化
- **Link系统优化**：调整传输优先级和条件
- **文档完善**：添加FAQ、快速开始指南和系统特色介绍
- **代码质量**：修正注释错误，统一命名规范

### 未来计划
- [ ] 添加更多creep角色类型
- [ ] 实现跨房间资源调配
- [ ] 增强AI决策算法
- [ ] 添加图形化监控界面
- [ ] 支持更多游戏机制

## 许可证

MIT License

## 致谢

感谢所有为这个项目做出贡献的开发者和Screeps社区的支持。

## 联系方式

如有问题或建议，欢迎通过以下方式联系：
- 提交Issue到项目仓库
- 在Screeps游戏内联系
- 参与社区讨论

---

**愿此行，终抵群星** ⭐

> 这是一个持续发展的项目，我们致力于为Screeps玩家提供最优秀的AI管理系统。