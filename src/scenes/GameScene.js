import Phaser from 'phaser';
import Block from '../objects/Block.js';
import Pig from '../objects/Pig.js';

/**
 * GameScene - 游戏场景（方块和猪系统测试）
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
        this.add.text(width / 2, 30, '方块 & 猪系统测试', {
            fontSize: '32px',
            fill: '#000000'
        }).setOrigin(0.5);

        this.add.text(width / 2, 70, '点击方块或猪造成伤害', {
            fontSize: '18px',
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
        // 木头塔 - 左侧（带猪）
        this.add.text(200, 120, '木头塔 + 小猪', {
            fontSize: '14px',
            fill: '#000'
        }).setOrigin(0.5);

        new Block(this, 150, 480, 'wood', Block.SHAPES.VERTICAL);
        new Block(this, 250, 480, 'wood', Block.SHAPES.VERTICAL);
        new Block(this, 200, 420, 'wood', Block.SHAPES.HORIZONTAL);
        new Pig(this, 200, 370, 'small');  // 小猪在顶部

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

        // 监听猪死亡事件
        this.events.on('pigDied', this.onPigDied, this);

        this.updateStats();
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

        this.statsText.setText([
            `方块: ${blockCount} (木${woodCount} 石${stoneCount} 玻${glassCount})`,
            `猪: ${pigCount} (小${smallPigCount} 中${mediumPigCount} 大${largePigCount})`
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
     * 设置点击交互
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
        // 可以在这里添加更新逻辑
    }
}
