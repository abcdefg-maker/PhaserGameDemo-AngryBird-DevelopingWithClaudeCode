import Phaser from 'phaser';
import Block from '../objects/Block.js';
import Pig from '../objects/Pig.js';
import Bird from '../objects/Bird.js';
import Slingshot from '../objects/Slingshot.js';

/**
 * GameScene - 游戏场景（弹弓系统测试）
 */
export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    init(data) {
        this.levelId = data.levelId || 1;
    }

    create() {
        console.log(`GameScene: 创建游戏场景 - 关卡 ${this.levelId}`);

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // 创建地面
        this.createGround(width, height);

        // 标题
        this.add.text(width / 2, 30, '弹弓系统测试', {
            fontSize: '32px',
            fill: '#000000'
        }).setOrigin(0.5);

        this.add.text(width / 2, 70, '拖拽弹弓发射小鸟 | 空格使用能力 | 点击方块/猪造成伤害', {
            fontSize: '16px',
            fill: '#666666'
        }).setOrigin(0.5);

        // 初始化分数
        this.totalScore = 0;

        // 创建测试方块结构
        this.createTestStructure();

        // 返回按钮
        this.createBackButton();

        // 添加点击交互
        this.setupClickInteraction();

        // 启用调试模式查看物理边界
        this.matter.world.drawDebug = false;
    }

    /**
     * 创建地面
     */
    createGround(width, height) {
        const groundY = height - 50;

        // 物理地面
        const ground = this.matter.add.rectangle(
            width / 2,
            groundY,
            width,
            100,
            {
                isStatic: true,
                label: 'ground',
                friction: 0.9
            }
        );

        // 视觉地面
        const graphics = this.add.graphics();
        graphics.fillStyle(0x8b4513, 1);
        graphics.fillRect(0, groundY - 50, width, 100);

        // 草地表面
        graphics.fillStyle(0x228b22, 1);
        graphics.fillRect(0, groundY - 50, width, 20);
    }

    /**
     * 创建测试方块结构
     */
    createTestStructure() {
        // 石头塔 - 中间（带猪）
        this.add.text(600, 120, '石头塔 + 中猪', {
            fontSize: '14px',
            fill: '#000'
        }).setOrigin(0.5);

        new Block(this, 550, 480, 'stone', Block.SHAPES.VERTICAL);
        new Block(this, 650, 480, 'stone', Block.SHAPES.VERTICAL);
        new Block(this, 600, 420, 'stone', Block.SHAPES.HORIZONTAL);
        new Pig(this, 600, 370, 'medium');  // 中猪在顶部

        // 玻璃塔 - 右侧（带猪）
        this.add.text(1000, 120, '玻璃塔 + 大猪', {
            fontSize: '14px',
            fill: '#000'
        }).setOrigin(0.5);

        new Block(this, 950, 480, 'glass', Block.SHAPES.VERTICAL);
        new Block(this, 1050, 480, 'glass', Block.SHAPES.VERTICAL);
        new Block(this, 1000, 420, 'glass', Block.SHAPES.HORIZONTAL);
        new Pig(this, 1000, 370, 'large');  // 大猪在顶部

        // 额外的猪（地面上）
        new Pig(this, 400, 500, 'small');
        new Pig(this, 800, 500, 'medium');

        // 显示统计信息
        this.statsText = this.add.text(20, 120, '', {
            fontSize: '16px',
            fill: '#000',
            backgroundColor: '#fff',
            padding: { x: 10, y: 5 }
        });

        // 分数显示
        this.scoreText = this.add.text(this.cameras.main.width - 20, 120, '', {
            fontSize: '20px',
            fill: '#000',
            backgroundColor: '#ffff00',
            padding: { x: 10, y: 5 }
        }).setOrigin(1, 0);

        // 创建小鸟
        this.createBirds();

        // 监听事件
        this.events.on('pigDied', this.onPigDied, this);
        this.events.on('birdLaunched', this.onBirdLaunched, this);

        // 监听键盘
        this.input.keyboard.on('keydown-SPACE', this.onSpaceKey, this);

        this.updateStats();
    }

    /**
     * 创建弹弓和小鸟
     */
    createBirds() {
        // 使用弹弓配置中的位置（确保在屏幕可见范围内）
        const slingshotConfig = {
            x: 200,
            y: 500,
            poleHeight: 150
        };

        // 创建弹弓
        this.slingshot = new Slingshot(this, slingshotConfig.x, slingshotConfig.y);

        // 小鸟初始位置：弹弓一半高度
        const slingshotX = slingshotConfig.x;
        const slingshotY = slingshotConfig.y - slingshotConfig.poleHeight / 2;
        this.birdQueue = [
            new Bird(this, slingshotX, slingshotY, 'red'),      // 红鸟
            new Bird(this, slingshotX, slingshotY, 'yellow'),   // 黄鸟
            new Bird(this, slingshotX, slingshotY, 'bomb')      // 炸弹鸟
        ];

        // 隐藏等待的小鸟（除了第一只），避免重叠
        for (let i = 1; i < this.birdQueue.length; i++) {
            this.birdQueue[i].sprite.setVisible(false);
        }

        // 当前小鸟索引
        this.currentBirdIndex = 0;

        // 加载状态锁（防止重复加载）
        this.isLoadingBird = false;
        this.isProcessingLanding = false;

        // 先显示等待中的小鸟（必须在 loadNextBird 之前）
        this.displayWaitingBirds();

        // 加载第一只小鸟到弹弓
        this.loadNextBird();

        // 提示文字（跟随弹弓位置）
        this.add.text(slingshotConfig.x, slingshotConfig.y + 100, '↑ 拖拽弹弓发射', {
            fontSize: '18px',
            fill: '#ff0000',
            fontStyle: 'bold'
        }).setOrigin(0.5);
    }

    /**
     * 显示等待中的小鸟
     */
    displayWaitingBirds() {
        // 在左下角显示等待的小鸟
        const startX = 50;
        const startY = 550;
        const spacing = 40;

        this.waitingBirdSprites = [];

        for (let i = 0; i < this.birdQueue.length; i++) {
            const bird = this.birdQueue[i];
            const x = startX + i * spacing;
            const y = startY;

            // 创建小图标显示
            const icon = this.add.circle(x, y, 12, this.getBirdColor(bird.type), 0.6);
            icon.setStrokeStyle(2, 0x000000);
            this.waitingBirdSprites.push(icon);
        }
    }

    /**
     * 获取小鸟颜色（用于队列图标）
     */
    getBirdColor(type) {
        switch (type) {
            case 'red': return 0xff0000;
            case 'yellow': return 0xffff00;
            case 'bomb': return 0x000000;
            default: return 0xffffff;
        }
    }

    /**
     * 加载下一只小鸟到弹弓
     */
    loadNextBird() {
        // 防止重复加载
        if (this.isLoadingBird) {
            console.log('⚠ 正在加载小鸟，忽略重复调用');
            return;
        }

        if (this.currentBirdIndex >= this.birdQueue.length) {
            console.log('✓ 所有小鸟已用完');
            // 可以在这里添加关卡结束逻辑
            return;
        }

        this.isLoadingBird = true;

        const bird = this.birdQueue[this.currentBirdIndex];

        // 确保小鸟可见（可能之前被隐藏）
        if (bird.sprite) {
            bird.sprite.setVisible(true);
        }

        this.slingshot.loadBird(bird);
        this.currentBird = bird;

        // 隐藏对应的等待图标
        if (this.waitingBirdSprites[this.currentBirdIndex]) {
            this.waitingBirdSprites[this.currentBirdIndex].setAlpha(0.3);
        }

        console.log(`✓ 加载小鸟 ${this.currentBirdIndex + 1}/${this.birdQueue.length}: ${bird.config.name}`);

        // 加载完成，解锁
        this.isLoadingBird = false;
    }

    /**
     * 更新统计信息
     */
    updateStats() {
        // 方块统计
        const blockCount = this.blocks ? this.blocks.length : 0;
        const woodCount = this.blocks ? this.blocks.filter(b => b.material === 'wood').length : 0;
        const stoneCount = this.blocks ? this.blocks.filter(b => b.material === 'stone').length : 0;
        const glassCount = this.blocks ? this.blocks.filter(b => b.material === 'glass').length : 0;

        // 猪统计
        const pigCount = this.pigs ? this.pigs.length : 0;
        const smallPigCount = this.pigs ? this.pigs.filter(p => p.size === 'small').length : 0;
        const mediumPigCount = this.pigs ? this.pigs.filter(p => p.size === 'medium').length : 0;
        const largePigCount = this.pigs ? this.pigs.filter(p => p.size === 'large').length : 0;

        // 小鸟统计
        const birdCount = this.birds ? this.birds.filter(b => b.isActive()).length : 0;

        this.statsText.setText([
            `方块: ${blockCount} (木${woodCount} 石${stoneCount} 玻${glassCount})`,
            `猪: ${pigCount} (小${smallPigCount} 中${mediumPigCount} 大${largePigCount})`,
            `小鸟: ${birdCount}`
        ].join('\n'));

        // 更新分数
        this.scoreText.setText(`得分: ${this.totalScore}`);
    }

    /**
     * 猪死亡处理
     */
    onPigDied(pig) {
        this.totalScore += pig.getScore();
        this.updateStats();

        // 显示得分动画
        this.showScoreText(pig.getPosition().x, pig.getPosition().y, `+${pig.getScore()}`);
    }

    /**
     * 小鸟发射处理
     */
    onBirdLaunched(bird) {
        console.log(`✓ ${bird.config.name} 已发射，等待着陆...`);

        // 监听小鸟着陆（使用 once 确保每次只响应一次）
        this.events.once('birdLanded', this.onBirdLanded, this);
        console.log('✓ 着陆监听器已注册');
    }

    /**
     * 小鸟着陆处理
     */
    onBirdLanded(bird) {
        console.log(`✓ GameScene 收到着陆事件：${bird.config.name}`);
        console.log(`当前小鸟索引: ${this.currentBirdIndex}, 总数: ${this.birdQueue.length}`);

        // 检查是否已经在处理着陆（防止重复）
        if (this.isProcessingLanding) {
            console.log('⚠ 已经在处理着陆，忽略重复事件');
            return;
        }

        this.isProcessingLanding = true;

        // 延迟 1.5 秒后加载下一只小鸟
        this.time.delayedCall(1500, () => {
            this.currentBirdIndex++;
            console.log(`准备加载下一只小鸟，索引: ${this.currentBirdIndex}`);
            this.loadNextBird();

            // 重置标志，允许下一次着陆
            this.isProcessingLanding = false;
        });
    }

    /**
     * 空格键处理
     */
    onSpaceKey() {
        if (this.currentBird && this.currentBird.isFlying()) {
            this.currentBird.useAbility();
        }
    }

    /**
     * 设置点击交互（测试用：点击方块/猪造成伤害）
     */
    setupClickInteraction() {
        this.input.on('pointerdown', (pointer) => {
            const bodies = this.matter.world.localWorld.bodies;

            for (let body of bodies) {
                if (!body.gameObject) continue;

                const sprite = body.gameObject;
                const bounds = sprite.getBounds();

                // 检查点击是否在物体范围内
                if (bounds.contains(pointer.x, pointer.y)) {
                    // 检查是否是方块
                    if (sprite.blockInstance) {
                        const block = sprite.blockInstance;
                        const damage = 30;
                        block.takeDamage(damage);
                        this.showDamageText(pointer.x, pointer.y, damage);
                        this.updateStats();
                        break;
                    }

                    // 检查是否是猪
                    if (sprite.pigInstance) {
                        const pig = sprite.pigInstance;
                        const damage = 40;
                        pig.takeDamage(damage);
                        this.showDamageText(pointer.x, pointer.y, damage);
                        this.updateStats();
                        break;
                    }
                }
            }
        });
    }

    /**
     * 显示伤害数字
     */
    showDamageText(x, y, damage) {
        const text = this.add.text(x, y, `-${damage}`, {
            fontSize: '24px',
            fill: '#ff0000',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.tweens.add({
            targets: text,
            y: y - 50,
            alpha: 0,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => {
                text.destroy();
            }
        });
    }

    /**
     * 显示得分文字
     */
    showScoreText(x, y, scoreText) {
        const text = this.add.text(x, y, scoreText, {
            fontSize: '28px',
            fill: '#00ff00',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);

        this.tweens.add({
            targets: text,
            y: y - 70,
            alpha: 0,
            scale: 1.5,
            duration: 1500,
            ease: 'Power2',
            onComplete: () => {
                text.destroy();
            }
        });
    }

    /**
     * 创建返回按钮
     */
    createBackButton() {
        const backButton = this.add.text(50, 50, '< 返回菜单', {
            fontSize: '20px',
            fill: '#000000',
            backgroundColor: '#ffffff',
            padding: { x: 10, y: 5 }
        });

        backButton.setInteractive({ useHandCursor: true });

        backButton.on('pointerover', () => {
            backButton.setStyle({ fill: '#ff0000' });
        });

        backButton.on('pointerout', () => {
            backButton.setStyle({ fill: '#000000' });
        });

        backButton.on('pointerup', () => {
            this.scene.start('MenuScene');
        });
    }

    update() {
        // 更新所有小鸟
        if (this.birds) {
            this.birds.forEach(bird => bird.update());
        }
    }
}
