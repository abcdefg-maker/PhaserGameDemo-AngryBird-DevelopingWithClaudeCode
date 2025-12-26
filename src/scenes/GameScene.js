import Phaser from 'phaser';

/**
 * GameScene - 游戏场景（基础版）
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

        // 添加示例文字
        this.add.text(width / 2, 100, '基础物理场景', {
            fontSize: '32px',
            fill: '#000000'
        }).setOrigin(0.5);

        this.add.text(width / 2, 150, '物理引擎已启动', {
            fontSize: '20px',
            fill: '#666666'
        }).setOrigin(0.5);

        // 创建一些测试方块
        this.createTestBoxes();

        // 返回按钮
        this.createBackButton();

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
     * 创建测试方块
     */
    createTestBoxes() {
        // 创建几个可以互动的方块
        const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00];

        for (let i = 0; i < 4; i++) {
            const x = 400 + i * 100;
            const y = 300;
            const size = 50;

            // 创建物理方块
            const box = this.matter.add.rectangle(x, y, size, size, {
                density: 0.005,
                friction: 0.8,
                restitution: 0.3
            });

            // 创建视觉方块
            const graphics = this.add.graphics();
            graphics.fillStyle(colors[i], 1);
            graphics.fillRect(-size / 2, -size / 2, size, size);
            graphics.lineStyle(2, 0x000000, 0.5);
            graphics.strokeRect(-size / 2, -size / 2, size, size);

            const sprite = this.add.sprite(x, y);
            graphics.generateTexture('box_' + i, size, size);
            sprite.setTexture('box_' + i);

            // 绑定物理和视觉
            this.matter.add.gameObject(sprite, box);
        }

        // 添加提示
        this.add.text(this.cameras.main.width / 2, 200, '点击方块可以与其互动', {
            fontSize: '18px',
            fill: '#666666'
        }).setOrigin(0.5);

        // 添加点击交互
        this.input.on('pointerdown', (pointer) => {
            // 在点击位置创建一个动态圆形
            const circle = this.matter.add.circle(pointer.x, pointer.y, 20, {
                density: 0.01,
                restitution: 0.8
            });

            // 添加视觉
            const graphics = this.add.graphics();
            graphics.fillStyle(0xff6600, 1);
            graphics.fillCircle(0, 0, 20);
            const circleSprite = this.add.sprite(pointer.x, pointer.y);
            graphics.generateTexture('circle_temp', 40, 40);
            circleSprite.setTexture('circle_temp');

            this.matter.add.gameObject(circleSprite, circle);

            // 3秒后销毁
            this.time.delayedCall(3000, () => {
                circleSprite.destroy();
            });
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
