# 愤怒的小鸟游戏 - 基础框架版

基于 Phaser 3 + Matter.js + Vite 的游戏开发框架。

## 当前版本：v0.2.0 程序化图形生成

这是一个基础物理引擎框架，已配置好 Phaser 3 和 Matter.js，并实现了程序化图形生成系统。

### 已实现功能 ✅

- ✅ **项目配置** - Vite 开发环境，支持热更新
- ✅ **基础场景系统** - 启动场景、主菜单、关卡选择、游戏场景
- ✅ **Matter.js 物理引擎** - 完整的物理世界配置
- ✅ **程序化图形生成系统** - 动态生成所有游戏对象纹理（小鸟、猪、方块、弹弓）
- ✅ **纹理演示场景** - 展示所有生成的游戏对象，带物理交互
- ✅ **UI 框架** - 菜单、按钮交互

### 待实现功能 📋

- ⬜ 建筑方块系统（木头、石头、玻璃）- 创建 Block 类和物理属性
- ⬜ 猪系统 - 创建 Pig 类和生命值系统
- ⬜ 小鸟基类和红鸟 - 创建 Bird 基类和飞行物理
- ⬜ 弹弓系统 - 拖拽、力度计算、轨迹预测
- ⬜ 碰撞伤害计算 - 伤害公式和对象销毁逻辑
- ⬜ 黄鸟和炸弹鸟特殊能力
- ⬜ 关卡数据和管理器
- ⬜ 相机跟随系统
- ⬜ 分数和星级系统

## 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 启动开发服务器
```bash
npm run dev
```

游戏将在浏览器中打开：http://localhost:3000

### 3. 构建生产版本
```bash
npm run build
```

## 项目结构

```
angry-birds/
├── src/
│   ├── main.js                 # 游戏入口，Phaser 配置
│   ├── scenes/
│   │   ├── BootScene.js        # 启动场景，生成纹理
│   │   ├── MenuScene.js        # 主菜单
│   │   ├── LevelSelectScene.js # 关卡选择（占位符）
│   │   ├── GameScene.js        # 游戏场景（纹理展示）
│   │   └── UIScene.js          # UI场景（占位符）
│   └── utils/
│       ├── constants.js        # 常量配置
│       └── GraphicsGenerator.js # 程序化图形生成器
├── index.html
├── package.json
├── vite.config.js
├── CLAUDE.md                   # 开发计划和规范
└── README.md
```

## 当前演示功能

### 主菜单
- 显示游戏标题和开始按钮
- 标题呼吸动画效果

### 游戏场景
- **物理地面** - 带视觉的静态地面
- **可交互方块** - 4个彩色方块，受重力影响
- **点击交互** - 点击屏幕任意位置生成可碰撞的圆球
- **物理模拟** - 真实的碰撞、重力、摩擦力

## 技术栈

- **游戏引擎**: Phaser 3.70.0
- **物理引擎**: Matter.js (Phaser 内置)
- **构建工具**: Vite 5.0
- **语言**: JavaScript (ES6+)

## 物理配置

```javascript
physics: {
    default: 'matter',
    matter: {
        gravity: { x: 0, y: 1.5 },
        debug: false,
        enableSleeping: true
    }
}
```

## 开发建议

### 添加调试模式
在 `src/main.js` 中设置：
```javascript
physics: {
    matter: {
        debug: true  // 显示物理边界
    }
}
```

### 下一步开发方向

1. **创建游戏对象类**
   - 在 `src/objects/` 目录下创建 Bird.js, Block.js, Pig.js

2. **添加程序化图形**
   - 在 `src/utils/` 创建 GraphicsGenerator.js
   - 使用 Phaser Graphics API 生成纹理

3. **实现弹弓系统**
   - 创建 Slingshot.js
   - 实现拖拽、力度计算、轨迹预测

4. **添加管理器**
   - LevelManager - 关卡管理
   - ScoreManager - 分数管理
   - CollisionManager - 碰撞处理

5. **设计关卡数据**
   - 在 `src/data/levels.js` 配置关卡

## 常见问题

### 如何修改重力？
修改 `src/main.js` 中的 `gravity.y` 值（默认 1.5）

### 如何调整窗口大小？
修改 `src/main.js` 中的 `width` 和 `height` 配置

### 物理性能优化
- 使用 `enableSleeping: true` 让静止物体休眠
- 合理设置物体密度和碰撞分类
- 限制场景中的物体数量

## 许可证

MIT License

## 参考资源

- [Phaser 3 官方文档](https://photonstorm.github.io/phaser3-docs/)
- [Matter.js 文档](https://brm.io/matter-js/docs/)
- [Phaser 3 示例](https://phaser.io/examples)

---

**基础框架已就绪，开始构建您的愤怒的小鸟游戏吧！** 🎮
