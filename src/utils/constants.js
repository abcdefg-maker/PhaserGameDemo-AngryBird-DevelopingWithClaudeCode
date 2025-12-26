// 游戏常量配置（简化版）

// 颜色定义
export const COLORS = {
    // 环境颜色
    ground: 0x8b4513,
    grass: 0x228b22,
    sky: 0x87ceeb,

    // UI颜色
    white: 0xffffff,
    black: 0x000000,
    gold: 0xffd700
};

// 字体配置（支持中文显示）
export const FONTS = {
    // 中文字体家族，优先级从左到右
    family: 'Arial, "Microsoft YaHei", "PingFang SC", "Hiragino Sans GB", "SimHei", "STHeiti", sans-serif',

    // 预定义的文本样式
    title: {
        fontFamily: 'Arial, "Microsoft YaHei", "PingFang SC", "Hiragino Sans GB", "SimHei", sans-serif',
        fontSize: '48px',
        fontStyle: 'bold',
        fill: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4
    },

    subtitle: {
        fontFamily: 'Arial, "Microsoft YaHei", "PingFang SC", "Hiragino Sans GB", "SimHei", sans-serif',
        fontSize: '32px',
        fill: '#000000'
    },

    normal: {
        fontFamily: 'Arial, "Microsoft YaHei", "PingFang SC", "Hiragino Sans GB", "SimHei", sans-serif',
        fontSize: '20px',
        fill: '#000000'
    },

    small: {
        fontFamily: 'Arial, "Microsoft YaHei", "PingFang SC", "Hiragino Sans GB", "SimHei", sans-serif',
        fontSize: '16px',
        fill: '#000000'
    },

    button: {
        fontFamily: 'Arial, "Microsoft YaHei", "PingFang SC", "Hiragino Sans GB", "SimHei", sans-serif',
        fontSize: '24px',
        fill: '#000000',
        backgroundColor: '#ffffff',
        padding: { x: 20, y: 10 }
    }
};

// 游戏配置
export const GAME_CONFIG = {
    worldWidth: 1200,
    worldHeight: 600,
    gravity: 1.5
};
