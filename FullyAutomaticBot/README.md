# Screeps AI Bot

一个功能完整的 Screeps 游戏 AI 机器人，具有智能爬虫管理、房间监控和自动化建设功能。

## 功能特性

### 🤖 智能爬虫管理
- **多角色系统**: 支持采集者、建造者、升级者、运输者等多种角色
- **状态机逻辑**: 爬虫根据任务状态智能切换行为
- **错误处理**: 完善的错误处理机制，防止单个爬虫错误影响整体运行
- **角色优化**: 每个角色都有专门的行为逻辑和优先级系统

### 🏠 房间管理系统
- **自动化建设**: 智能建造和维护房间基础设施
- **能量管理**: 高效的能量收集、存储和分配系统
- **防御系统**: 自动塔楼防御，支持友方玩家白名单
- **Link 网络**: 智能 Link 传输系统优化能量流动

### 📊 PRTS 监控系统
精密侦察战术支援系统 (Precision Reconnaissance and Tactical Support)

- **房间停滞监控**: 自动检测房间能量停滞状态
- **控制器能量跟踪**: 1500 tick 内控制器升级进度统计
- **实时数据分析**: 详细的房间状态和爬虫性能分析
- **可视化警告**: 房间内直观的状态提示

### 🛡️ 安全特性
- **模块化设计**: 安全的模块加载机制，单个模块错误不影响整体
- **内存清理**: 自动清理无效爬虫内存，防止内存泄漏
- **友方识别**: 可配置的友方玩家白名单系统

## 项目结构

```
├── main.js                 # 主循环入口
├── config.js              # 配置文件
├── runCreep.js            # 爬虫管理器
├── memoryCleaner.js       # 内存清理模块
├── pixelGenerator.js      # 像素生成器
├── PRTS.js               # 监控系统
├── Tower.js              # 塔楼管理
├── runLink.js            # Link 管理
├── runGeneralRoom.js     # 通用房间管理
└── role.*.js             # 各种角色模块
    ├── role.harvester.js     # 采集者
    ├── role.builder.js       # 建造者
    ├── role.upgrader.js      # 升级者
    ├── role.carrier.js       # 运输者
    ├── role.defender.js      # 防御者
    └── ...                   # 其他角色
```

## 快速开始

1. **部署代码**: 将所有文件上传到你的 Screeps 账户
2. **配置设置**: 编辑 `config.js` 文件设置房间和白名单
3. **启动系统**: 代码将自动开始运行

### 配置选项

编辑 `config.js` 文件：

```javascript
module.exports = {
    // 排除在通用房间管理之外的房间
    excludeRooms: ['房间号'],
    
    // 友方玩家白名单（塔楼不会攻击）
    whitelist: ['FriendlyPlayer1', 'FriendlyPlayer2'],
};
```

## 爬虫角色说明

### 基础角色
- **harvester**: 基础采集者，采集能量并供应 spawn/extension
- **harvester0/harvester1**: 专门的能量源采集者
- **builder**: 建造者，负责建设和维修
- **upgrader**: 升级者，专门升级控制器
- **carrier**: 运输者，在建筑间运输资源

### 高级角色
- **defender**: 防御者，保护房间安全
- **attacker**: 攻击者，用于进攻作战
- **healer**: 治疗者，支援作战单位
- **signer**: 签名者，为控制器签名

## PRTS 监控系统使用

### 基础命令
```javascript
// 查看所有爬虫
prts.listCreeps()

// 查看房间状态
prts.energy("房间号")

// 监控特定爬虫
prts.monitor("Harvester1")
```

### 停滞监控
```javascript
// 查看房间停滞状态
prts.stagnation("房间号")

// 清除停滞数据
prts.clearStagnation("房间号")
```

### 控制器统计
```javascript
// 查看控制器能量统计
prts.controllerStats("房间号")

// 清除统计数据
prts.clearControllerStats("房间号")
```

### 帮助系统
```javascript
// 查看帮助菜单
prts.help()

// 查看特定分类帮助
prts.help("basic")      // 基础命令
prts.help("controller") // 控制器命令
prts.help("stagnation") // 停滞监控命令
```

## 系统特性

### 智能状态管理
- 爬虫使用状态机模式，根据任务需求智能切换行为
- 自动优先级调整，确保关键任务优先执行
- 容错设计，单个爬虫错误不影响整体运行

### 高效资源管理
- 智能能量分配算法
- 容器和 Link 网络优化
- 自动建设队列管理

### 实时监控
- 房间停滞自动检测（能量维持 300+ 超过 1500 tick）
- 控制器升级进度跟踪
- 详细的性能统计和分析

## 开发说明

### 添加新角色
1. 创建 `role.newRole.js` 文件
2. 实现 `run(creep)` 方法
3. 在 `runCreep.js` 中注册新角色

### 自定义配置
- 修改 `config.js` 添加新的配置选项
- 在相关模块中引用配置

### 扩展监控
- 在 `PRTS.js` 中添加新的监控功能
- 使用 Memory 存储持久化数据

## 许可证

本项目采用 MIT 许可证。

## 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目！

---

*这是一个为 Screeps 游戏设计的智能 AI 机器人，具有完整的房间管理、爬虫控制和实时监控功能。*