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
        this.add.text(width / 2, 50, '程序化图形展示', {
            fontSize: '32px',
            fill: '#000000'
        }).setOrigin(0.5);

        this.add.text(width / 2, 90, '点击屏幕添加物体', {
            fontSize: '18px',
            fill: '#666666'
        }).setOrigin(0.5);

        // 展示生成的纹理
        this.displayGeneratedTextures();

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
     * 展示生成的纹理
     */
    displayGeneratedTextures() {
        // 展示小鸟
        this.add.text(150, 130, '小鸟', { fontSize: '16px', fill: '#000' }).setOrigin(0.5);
        const redBird = this.matter.add.sprite(100, 180, 'bird-red');
        redBird.setCircle(25, { density: 0.01, restitution: 0.5 });

        const yellowBird = this.matter.add.sprite(150, 180, 'bird-yellow');
        yellowBird.setCircle(22, { density: 0.008, restitution: 0.5 });

        const bombBird = this.matter.add.sprite(200, 180, 'bird-bomb');
        bombBird.setCircle(30, { density: 0.015, restitution: 0.3 });

        // 展示猪
        this.add.text(350, 130, '猪', { fontSize: '16px', fill: '#000' }).setOrigin(0.5);
        const smallPig = this.matter.add.sprite(300, 180, 'pig-small');
        smallPig.setCircle(20, { density: 0.01, restitution: 0.3 });

        const mediumPig = this.matter.add.sprite(360, 180, 'pig-medium');
        mediumPig.setCircle(30, { density: 0.012, restitution: 0.3 });

        const largePig = this.matter.add.sprite(430, 180, 'pig-large');
        largePig.setCircle(40, { density: 0.015, restitution: 0.3 });

        // 展示方块 - 木头
        this.add.text(600, 130, '木头方块', { fontSize: '16px', fill: '#000' }).setOrigin(0.5);
        const woodH = this.matter.add.sprite(560, 200, 'block-wood-h');
        woodH.setBody({ type: 'rectangle', width: 80, height: 20 });
        woodH.setDensity(0.003);

        const woodV = this.matter.add.sprite(640, 180, 'block-wood-v');
        woodV.setBody({ type: 'rectangle', width: 20, height: 80 });
        woodV.setDensity(0.003);

        // 展示方块 - 石头
        this.add.text(750, 280, '石头方块', { fontSize: '16px', fill: '#000' }).setOrigin(0.5);
        const stoneH = this.matter.add.sprite(710, 330, 'block-stone-h');
        stoneH.setBody({ type: 'rectangle', width: 80, height: 20 });
        stoneH.setDensity(0.008);

        const stoneSquare = this.matter.add.sprite(790, 320, 'block-stone-square');
        stoneSquare.setBody({ type: 'rectangle', width: 40, height: 40 });
        stoneSquare.setDensity(0.008);

        // 展示方块 - 玻璃
        this.add.text(150, 280, '玻璃方块', { fontSize: '16px', fill: '#000' }).setOrigin(0.5);
        const glassH = this.matter.add.sprite(110, 330, 'block-glass-h');
        glassH.setBody({ type: 'rectangle', width: 80, height: 20 });
        glassH.setDensity(0.002);

        const glassV = this.matter.add.sprite(190, 310, 'block-glass-v');
        glassV.setBody({ type: 'rectangle', width: 20, height: 80 });
        glassV.setDensity(0.002);

        // 展示弹弓（静态）
        this.add.text(350, 280, '弹弓', { fontSize: '16px', fill: '#000' }).setOrigin(0.5);
        this.add.sprite(350, 350, 'slingshot');

        // 添加点击交互
        let clickCount = 0;
        this.input.on('pointerdown', (pointer) => {
            clickCount++;
            const textures = ['bird-red', 'pig-medium', 'block-wood-square', 'block-stone-square', 'block-glass-square'];
            const texture = textures[clickCount % textures.length];

            const size = texture.includes('bird') || texture.includes('pig') ? 25 : 40;
            const sprite = this.matter.add.sprite(pointer.x, pointer.y, texture);

            if (texture.includes('bird') || texture.includes('pig')) {
                sprite.setCircle(size, { density: 0.01, restitution: 0.6 });
            } else {
                sprite.setBody({ type: 'rectangle', width: 40, height: 40 });
                sprite.setDensity(0.005);
            }

            // 5秒后销毁
            this.time.delayedCall(5000, () => {
                if (sprite && sprite.body) {
                    sprite.destroy();
                }
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
