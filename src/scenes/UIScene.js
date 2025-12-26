import Phaser from 'phaser';

/**
 * UIScene - UI覆盖层场景（占位符）
 */
export default class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene', active: false });
    }

    create(data) {
        console.log('UIScene: 暂未实现');
    }
}
