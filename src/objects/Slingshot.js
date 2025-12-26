import Phaser from 'phaser';

/**
 * Slingshot - 弹弓类
 * 实现拖拽、力度计算、轨迹预测和发射功能
 */
export default class Slingshot {
    /**
     * 弹弓配置
     */
    static CONFIG = {
        // 弹弓位置和尺寸
        anchorX: 400,           // 锚点 X 坐标
        anchorY: 1000,           // 锚点 Y 坐标
        poleHeight: 150,        // 柱子高度（加高到150）
        poleWidth: 10,          // 柱子宽度
        poleDistance: 40,       // 两柱子间距

        // 拉力限制
        maxPullDistance: 150,   // 最大拉伸距离
        minPullDistance: 10,    // 最小有效拉伸距离

        // 力度配置
        forceFactor: 0.15,      // 力度系数（平衡速度和弹力感）

        // 轨迹预测
        trajectoryPoints: 50,   // 轨迹点数量
        trajectorySpacing: 5   // 轨迹点间距
    };

    /**
     * 弹弓状态
     */
    static STATES = {
        IDLE: 'idle',           // 待机
        PULLING: 'pulling',     // 拉伸中
        LAUNCHED: 'launched'    // 已发射
    };

    /**
     * 创建弹弓
     * @param {Phaser.Scene} scene - 场景实例
     * @param {number} x - X 坐标
     * @param {number} y - Y 坐标
     */
    constructor(scene, x, y) {
        this.scene = scene;
        this.x = x;
        this.y = y;

        // 状态
        this.state = Slingshot.STATES.IDLE;
        this.currentBird = null;

        // 拖拽数据
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.dragCurrentX = 0;
        this.dragCurrentY = 0;

        // 创建容器
        this.container = scene.add.container(x, y);
        // 设置较低的深度，让小鸟在弹弓上层
        this.container.setDepth(-10);

        // 创建弹弓各部分
        this.createPoles();
        this.createBands();
        this.addFrontBand();
        this.createTrajectory();

        // 设置交互
        this.setupInteraction();
    }

    /**
     * 创建弹弓柱子（使用 Graphics 绘制，无物理碰撞）
     */
    createPoles() {
        const config = Slingshot.CONFIG;
        const poleColor = 0x8b4513; // 棕色

        // 使用 Graphics 绘制柱子，避免任何物理碰撞
        this.polesGraphics = this.scene.add.graphics();
        this.polesGraphics.fillStyle(poleColor, 1);

        // 左柱子
        this.polesGraphics.fillRect(
            -config.poleDistance / 2 - config.poleWidth / 2,
            -config.poleHeight,
            config.poleWidth,
            config.poleHeight
        );

        // 右柱子
        this.polesGraphics.fillRect(
            config.poleDistance / 2 - config.poleWidth / 2,
            -config.poleHeight,
            config.poleWidth,
            config.poleHeight
        );

        // 添加到容器
        this.container.add(this.polesGraphics);
    }

    /**
     * 创建橡皮筋
     */
    createBands() {
        // 后橡皮筋（在小鸟后面）
        this.backBand = this.scene.add.graphics();
        this.container.add(this.backBand);

        // 前橡皮筋（在小鸟前面）- 待创建
        this.frontBand = this.scene.add.graphics();
        // 前橡皮筋将在后面添加，这样它在小鸟上层
    }

    /**
     * 添加前橡皮筋到容器
     */
    addFrontBand() {
        // 前橡皮筋添加到容器（保证在小鸟上层）
        this.container.add(this.frontBand);
    }

    /**
     * 创建轨迹预测系统
     *
     * 功能说明：
     * 这个方法创建一系列用于显示小鸟飞行轨迹的可视化点。
     * 当玩家拖拽弹弓时，这些点会显示小鸟发射后的预测飞行路径。
     *
     * 实现原理：
     * 1. 创建一个空数组 trajectoryDots 用于存储所有轨迹点
     * 2. 根据配置中的 trajectoryPoints（默认50个点）循环创建圆形对象
     * 3. 每个圆形代表飞行路径上的一个预测位置点
     *
     * 视觉属性：
     * - 位置: (0, 0) - 初始位置，会在 updateTrajectory() 中动态更新
     * - 半径: 3 像素 - 小圆点，不遮挡视线
     * - 颜色: 0xffffff (白色) - 清晰可见的轨迹
     * - 透明度: 0.6 - 半透明效果，更自然
     * - 初始状态: 不可见 - 只在拖拽时显示
     *
     * 后续使用：
     * - updateTrajectory() 会计算并更新每个点的位置，模拟物理飞行路径
     * - hideTrajectory() 会隐藏所有轨迹点
     * - 在发射小鸟后，轨迹会被隐藏
     */
    createTrajectory() {
        // 初始化轨迹点数组
        this.trajectoryDots = [];
        const config = Slingshot.CONFIG;

        // 循环创建指定数量的轨迹点
        for (let i = 0; i < config.trajectoryPoints; i++) {
            // 创建圆形作为轨迹点
            // 参数：x坐标, y坐标, 半径, 颜色(白色), 透明度
            const dot = this.scene.add.circle(0, 0, 3, 0xffffff, 0.6);

            // 初始隐藏，只在拖拽弹弓时显示
            dot.setVisible(false);

            // 确保轨迹点不参与物理碰撞
            if (dot.body) {
                dot.body.enable = false;
            }

            // 添加到轨迹点数组，用于后续更新和管理
            this.trajectoryDots.push(dot);
        }
    }

    /**
     * 设置交互
     */
    setupInteraction() {
        // 创建一个透明的交互区域（不添加到容器，使用全局坐标）
        this.interactionZone = this.scene.add.rectangle(
            this.x, this.y,
            500,    // 交互区域宽度：500 像素
            500,    // 交互区域高度：500 像素
            0x000000,
            0
        );
        this.interactionZone.setInteractive({ useHandCursor: true });

        // 确保交互区域不参与物理碰撞
        if (this.interactionZone.body) {
            this.interactionZone.body.enable = false;
        }

        // 拖拽事件
        this.interactionZone.on('pointerdown', this.onDragStart, this);
        this.scene.input.on('pointermove', this.onDragMove, this);
        this.scene.input.on('pointerup', this.onDragEnd, this);
    }

    /**
     * 加载小鸟到弹弓
     * @param {Bird} bird - 小鸟实例
     */
    loadBird(bird) {
        if (this.state !== Slingshot.STATES.IDLE) return false;

        this.currentBird = bird;

        // 将小鸟移动到弹弓柱子最高点的中间位置
        if (bird.sprite) {
            const birdY = this.y - Slingshot.CONFIG.poleHeight;
            bird.sprite.setPosition(this.x, birdY);
            bird.sprite.setStatic(true);
        }

        this.state = Slingshot.STATES.IDLE;
        console.log('小鸟已加载到弹弓（柱子最高点）');
        return true;
    }

    /**
     * 开始拖拽
     */
    onDragStart(pointer) {
        if (!this.currentBird || this.state === Slingshot.STATES.LAUNCHED) return;

        this.state = Slingshot.STATES.PULLING;
        this.dragStartX = pointer.x;
        this.dragStartY = pointer.y;

        console.log('开始拖拽弹弓');
    }

    /**
     * 拖拽中
     */
    onDragMove(pointer) {
        if (this.state !== Slingshot.STATES.PULLING) return;

        // 计算拖拽偏移（相对于弹弓锚点）
        let offsetX = pointer.x - this.x;
        let offsetY = pointer.y - this.y;

        // 限制拖拽距离
        const distance = Math.sqrt(offsetX * offsetX + offsetY * offsetY);
        const maxDist = Slingshot.CONFIG.maxPullDistance;

        if (distance > maxDist) {
            // 限制在最大距离内
            const angle = Math.atan2(offsetY, offsetX);
            this.dragCurrentX = this.x + Math.cos(angle) * maxDist;
            this.dragCurrentY = this.y + Math.sin(angle) * maxDist;
        } else {
            this.dragCurrentX = pointer.x;
            this.dragCurrentY = pointer.y;
        }

        // 限制Y轴，不能拖到地面以下（地面Y约为550）
        const groundY = this.scene.cameras.main.height - 50;
        const minY = 100; // 最高不能超过屏幕顶部

        // 限制Y轴范围
        if (this.dragCurrentY > groundY - 30) {
            this.dragCurrentY = groundY - 30; // 距离地面至少30像素
        }
        if (this.dragCurrentY < minY) {
            this.dragCurrentY = minY;
        }

        // 更新小鸟位置
        if (this.currentBird && this.currentBird.sprite) {
            this.currentBird.sprite.setPosition(this.dragCurrentX, this.dragCurrentY);
        }

        // 更新橡皮筋
        this.updateBands();

        // 更新轨迹预测
        this.updateTrajectory();
    }

    /**
     * 结束拖拽（发射）
     */
    onDragEnd() {
        if (this.state !== Slingshot.STATES.PULLING) return;

        // 计算拉伸距离
        const offsetX = this.dragCurrentX - this.x;
        const offsetY = this.dragCurrentY - this.y;
        const pullDistance = Math.sqrt(offsetX * offsetX + offsetY * offsetY);

        // 检查是否达到最小拉力
        if (pullDistance < Slingshot.CONFIG.minPullDistance) {
            console.log('拉力不足，取消发射');
            this.reset();
            return;
        }

        // 计算发射速度（方向与拉伸方向相反）
        const forceFactor = Slingshot.CONFIG.forceFactor;
        const velocityX = -(offsetX * forceFactor);
        const velocityY = (offsetY * forceFactor);

        // 发射小鸟
        if (this.currentBird) {
            this.currentBird.launch(velocityX, velocityY);
            console.log(`弹弓发射！速度: (${velocityX.toFixed(2)}, ${velocityY.toFixed(2)})`);
        }

        // 重置弹弓（立即清除橡皮筋，避免遮挡飞行的小鸟）
        this.state = Slingshot.STATES.LAUNCHED;
        this.currentBird = null;
        this.hideTrajectory();
        this.reset();
    }

    /**
     * 更新橡皮筋
     */
    updateBands() {
        const config = Slingshot.CONFIG;
        const bandColor = 0x654321;
        const bandWidth = 4;

        // 计算小鸟相对于弹弓的位置
        const birdLocalX = this.dragCurrentX - this.x;
        const birdLocalY = this.dragCurrentY - this.y;

        // 左边橡皮筋连接点
        const leftX = -config.poleDistance / 2;
        const leftY = -config.poleHeight;

        // 右边橡皮筋连接点
        const rightX = config.poleDistance / 2;
        const rightY = -config.poleHeight;

        // 绘制后橡皮筋（左侧）
        this.backBand.clear();
        this.backBand.lineStyle(bandWidth, bandColor);
        this.backBand.beginPath();
        this.backBand.moveTo(leftX, leftY);
        this.backBand.lineTo(birdLocalX, birdLocalY);
        this.backBand.strokePath();

        // 绘制前橡皮筋（右侧）
        this.frontBand.clear();
        this.frontBand.lineStyle(bandWidth, bandColor);
        this.frontBand.beginPath();
        this.frontBand.moveTo(rightX, rightY);
        this.frontBand.lineTo(birdLocalX, birdLocalY);
        this.frontBand.strokePath();
    }

    /**
     * 更新轨迹预测
     */
    updateTrajectory() {
        // 计算发射速度
        const offsetX = this.dragCurrentX - this.x;
        const offsetY = this.dragCurrentY - this.y;
        const forceFactor = Slingshot.CONFIG.forceFactor;
        const velocityX = -(offsetX * forceFactor);
        const velocityY = -(offsetY * forceFactor);

        // 模拟轨迹 - 使用更精确的物理参数匹配 Matter.js
        const gravity = this.scene.matter.world.localWorld.gravity.y;

        // Matter.js 使用的是每帧的时间步长（1/60秒）
        // 我们需要模拟多个时间步
        const stepsPerDot = 3; // 每个轨迹点之间跳过的物理步数

        let x = this.dragCurrentX;
        let y = this.dragCurrentY;
        let vx = velocityX;
        let vy = velocityY;

        for (let i = 0; i < this.trajectoryDots.length; i++) {
            // 模拟多个物理步骤
            for (let step = 0; step < stepsPerDot; step++) {
                // Matter.js 的重力加速度（每帧）
                vy += gravity;

                // 更新位置（每帧的位移）
                x += vx;
                y += vy;
            }

            // 显示轨迹点
            this.trajectoryDots[i].setPosition(x, y);
            this.trajectoryDots[i].setVisible(true);

            // 如果超出屏幕或碰到地面，停止绘制
            const groundY = this.scene.cameras.main.height - 50;
            if (y > groundY || y < 0 || x < 0 || x > this.scene.cameras.main.width) {
                // 隐藏剩余的点
                for (let j = i + 1; j < this.trajectoryDots.length; j++) {
                    this.trajectoryDots[j].setVisible(false);
                }
                break;
            }
        }
    }

    /**
     * 隐藏轨迹预测
     */
    hideTrajectory() {
        this.trajectoryDots.forEach(dot => dot.setVisible(false));
    }

    /**
     * 重置弹弓
     */
    reset() {
        this.state = Slingshot.STATES.IDLE;
        this.dragCurrentX = this.x;
        this.dragCurrentY = this.y - Slingshot.CONFIG.poleHeight;

        // 重置橡皮筋
        this.backBand.clear();
        this.frontBand.clear();

        // 隐藏轨迹
        this.hideTrajectory();
    }

    /**
     * 获取弹弓状态
     */
    getState() {
        return this.state;
    }

    /**
     * 是否可以加载小鸟
     */
    canLoadBird() {
        return this.state === Slingshot.STATES.IDLE && !this.currentBird;
    }

    /**
     * 销毁弹弓
     */
    destroy() {
        // 移除事件监听
        if (this.interactionZone) {
            this.interactionZone.off('pointerdown', this.onDragStart, this);
        }
        this.scene.input.off('pointermove', this.onDragMove, this);
        this.scene.input.off('pointerup', this.onDragEnd, this);

        // 销毁轨迹点
        this.trajectoryDots.forEach(dot => dot.destroy());

        // 销毁容器
        if (this.container) {
            this.container.destroy();
        }
    }
}
