import Phaser from 'phaser';
import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';
import LevelSelectScene from './scenes/LevelSelectScene.js';
import GameScene from './scenes/GameScene.js';
import UIScene from './scenes/UIScene.js';

// 游戏配置
const config = {
    type: Phaser.AUTO,
    width: 1200,
    height: 600,
    parent: 'game-container',
    backgroundColor: '#87CEEB',
    physics: {
        default: 'matter',
        matter: {
            gravity: { x: 0, y: 1.5 },
            debug: false, // 开发时可设为 true
            enableSleeping: true
        }
    },
    scene: [BootScene, MenuScene, LevelSelectScene, GameScene, UIScene]
};

// 启动游戏
const game = new Phaser.Game(config);
