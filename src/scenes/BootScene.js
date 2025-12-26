import Phaser from 'phaser';
import GraphicsGenerator from '../utils/GraphicsGenerator.js';

/**
 * BootScene - 启动场景（简化版）
 */
export default class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // 显示加载文字
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        const loadingText = this.add.text(width / 2, height / 2, '生成游戏纹理...', {
            fontSize: '32px',
            fill: '#ffffff'
        }).setOrigin(0.5);
    }

    create() {
        console.log('BootScene: 启动完成');

        // 生成所有游戏纹理
        GraphicsGenerator.generateAllTextures(this);

        // 进入主菜单
        this.time.delayedCall(500, () => {
            this.scene.start('MenuScene');
        });
    }
}
