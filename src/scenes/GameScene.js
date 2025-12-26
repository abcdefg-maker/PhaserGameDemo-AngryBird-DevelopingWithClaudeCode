import Phaser from 'phaser';
import Block from '../objects/Block.js';

/**
 * GameScene - 游戏场景（方块系统测试）
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
        this.add.text(width / 2, 30, '建筑方块系统测试', {
            fontSize: '32px',
            fill: '#000000'
        }).setOrigin(0.5);

        this.add.text(width / 2, 70, '点击方块可以造成伤害', {
            fontSize: '18px',
            fill: '#666666'
        }).setOrigin(0.5);

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
        // 木头塔 - 左侧
        this.add.text(200, 120, '木头塔 (HP:100)', {
            fontSize: '14px',
            fill: '#000'
        }).setOrigin(0.5);

        new Block(this, 150, 480, 'wood', Block.SHAPES.VERTICAL);
        new Block(this, 250, 480, 'wood', Block.SHAPES.VERTICAL);
        new Block(this, 200, 420, 'wood', Block.SHAPES.HORIZONTAL);
        new Block(this, 200, 380, 'wood', Block.SHAPES.SQUARE);

        // 石头塔 - 中间
        this.add.text(600, 120, '石头塔 (HP:300)', {
            fontSize: '14px',
            fill: '#000'
        }).setOrigin(0.5);

        new Block(this, 550, 480, 'stone', Block.SHAPES.VERTICAL);
        new Block(this, 650, 480, 'stone', Block.SHAPES.VERTICAL);
        new Block(this, 600, 420, 'stone', Block.SHAPES.HORIZONTAL);
        new Block(this, 600, 380, 'stone', Block.SHAPES.SQUARE);

        // 玻璃塔 - 右侧
        this.add.text(1000, 120, '玻璃塔 (HP:50)', {
            fontSize: '14px',
            fill: '#000'
        }).setOrigin(0.5);

        new Block(this, 950, 480, 'glass', Block.SHAPES.VERTICAL);
        new Block(this, 1050, 480, 'glass', Block.SHAPES.VERTICAL);
        new Block(this, 1000, 420, 'glass', Block.SHAPES.HORIZONTAL);
        new Block(this, 1000, 380, 'glass', Block.SHAPES.SQUARE);

        // 显示统计信息
        this.statsText = this.add.text(20, 120, '', {
            fontSize: '16px',
            fill: '#000',
            backgroundColor: '#fff',
            padding: { x: 10, y: 5 }
        });

        this.updateStats();
    }

    /**
     * 更新统计信息
     */
    updateStats() {
        if (!this.blocks) return;

        const woodCount = this.blocks.filter(b => b.material === 'wood').length;
        const stoneCount = this.blocks.filter(b => b.material === 'stone').length;
        const glassCount = this.blocks.filter(b => b.material === 'glass').length;

        this.statsText.setText([
            `剩余方块: ${this.blocks.length}`,
            `木头: ${woodCount}`,
            `石头: ${stoneCount}`,
            `玻璃: ${glassCount}`
        ].join('\n'));
    }

    /**
     * 设置点击交互
     */
    setupClickInteraction() {
        this.input.on('pointerdown', (pointer) => {
            // 检查是否点击到方块
            const bodies = this.matter.world.localWorld.bodies;

            for (let body of bodies) {
                if (body.gameObject && body.gameObject.blockInstance) {
                    const sprite = body.gameObject;
                    const bounds = sprite.getBounds();

                    // 检查点击是否在方块范围内
                    if (bounds.contains(pointer.x, pointer.y)) {
                        const block = sprite.blockInstance;

                        // 对方块造成伤害
                        const damage = 30;
                        block.takeDamage(damage);

                        // 显示伤害数字
                        this.showDamageText(pointer.x, pointer.y, damage);

                        // 更新统计
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
