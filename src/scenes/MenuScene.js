import Phaser from 'phaser';

/**
 * MenuScene - 主菜单场景（简化版）
 */
export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // 背景渐变（使用矩形模拟）
        const bg1 = this.add.rectangle(0, 0, width, height / 2, 0x87ceeb).setOrigin(0);
        const bg2 = this.add.rectangle(0, height / 2, width, height / 2, 0x6ba3d4).setOrigin(0);

        // 游戏标题
        const title = this.add.text(width / 2, height / 3, '愤怒的小鸟', {
            fontSize: '72px',
            fontFamily: 'Arial Black',
            fill: '#ff0000',
            stroke: '#000000',
            strokeThickness: 8,
            shadow: {
                offsetX: 4,
                offsetY: 4,
                color: '#000',
                blur: 10,
                fill: true
            }
        }).setOrigin(0.5);

        // 添加标题动画
        this.tweens.add({
            targets: title,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // 副标题
        this.add.text(width / 2, height / 3 + 80, 'Phaser 3 + Matter.js', {
            fontSize: '24px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);

        // 开始游戏按钮
        const startButton = this.createButton(
            width / 2,
            height / 2 + 50,
            '开始游戏',
            () => {
                this.scene.start('LevelSelectScene');
            }
        );

        // 版本信息
        this.add.text(width - 10, height - 10, 'v0.1.0 基础版', {
            fontSize: '14px',
            fill: '#ffffff',
            alpha: 0.6
        }).setOrigin(1);

        // 说明文字
        this.add.text(width / 2, height - 50, '基础物理引擎框架 - 准备添加游戏对象', {
            fontSize: '16px',
            fill: '#ffffff',
            alpha: 0.7
        }).setOrigin(0.5);
    }

    /**
     * 创建按钮
     */
    createButton(x, y, text, callback) {
        const button = this.add.container(x, y);

        // 按钮背景
        const bg = this.add.rectangle(0, 0, 200, 60, 0x4a90e2, 1);
        bg.setStrokeStyle(4, 0xffffff);

        // 按钮文字
        const label = this.add.text(0, 0, text, {
            fontSize: '28px',
            fontFamily: 'Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);

        button.add([bg, label]);

        // 设置交互
        button.setSize(200, 60);
        button.setInteractive({ useHandCursor: true });

        button.on('pointerover', () => {
            bg.setFillStyle(0x5aa5f5);
            button.setScale(1.05);
        });

        button.on('pointerout', () => {
            bg.setFillStyle(0x4a90e2);
            button.setScale(1);
        });

        button.on('pointerdown', () => {
            button.setScale(0.95);
        });

        button.on('pointerup', () => {
            button.setScale(1.05);
            callback();
        });

        return button;
    }
}
