import Phaser from 'phaser';

/**
 * LevelSelectScene - 关卡选择场景（简化版）
 */
export default class LevelSelectScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LevelSelectScene' });
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // 标题
        this.add.text(width / 2, 100, '关卡选择', {
            fontSize: '48px',
            fill: '#000000'
        }).setOrigin(0.5);

        // 说明文字
        this.add.text(width / 2, height / 2, '这里将来会显示关卡列表\n\n现在点击下方按钮进入游戏场景', {
            fontSize: '20px',
            fill: '#666666',
            align: 'center'
        }).setOrigin(0.5);

        // 进入游戏按钮
        this.createButton(
            width / 2,
            height / 2 + 100,
            '进入游戏场景',
            () => {
                this.scene.start('GameScene', { levelId: 1 });
            }
        );

        // 返回按钮
        const backButton = this.add.text(50, 50, '< 返回', {
            fontSize: '24px',
            fill: '#000000'
        });

        backButton.setInteractive({ useHandCursor: true });
        backButton.on('pointerup', () => {
            this.scene.start('MenuScene');
        });
    }

    createButton(x, y, text, callback) {
        const button = this.add.container(x, y);

        const bg = this.add.rectangle(0, 0, 250, 60, 0x4a90e2);
        bg.setStrokeStyle(4, 0xffffff);

        const label = this.add.text(0, 0, text, {
            fontSize: '24px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        button.add([bg, label]);
        button.setSize(250, 60);
        button.setInteractive({ useHandCursor: true });

        button.on('pointerover', () => {
            bg.setFillStyle(0x5aa5f5);
            button.setScale(1.05);
        });

        button.on('pointerout', () => {
            bg.setFillStyle(0x4a90e2);
            button.setScale(1);
        });

        button.on('pointerup', callback);

        return button;
    }
}
