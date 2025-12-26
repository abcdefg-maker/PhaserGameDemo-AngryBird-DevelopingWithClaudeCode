/**
 * 程序化图形生成器
 * 使用 Phaser Graphics API 动态生成游戏对象的纹理
 */
export default class GraphicsGenerator {
    /**
     * 生成圆形小鸟纹理
     * @param {Phaser.Scene} scene - 场景实例
     * @param {string} key - 纹理键名
     * @param {number} radius - 半径
     * @param {number} color - 颜色
     * @param {number} shineColor - 高光颜色
     */
    static generateBird(scene, key, radius = 25, color = 0xff0000, shineColor = 0xff6666) {
        const graphics = scene.add.graphics();
        const size = radius * 2 + 4; // 添加一些边距

        // 主体圆形
        graphics.fillStyle(color, 1);
        graphics.fillCircle(size / 2, size / 2, radius);

        // 高光效果
        graphics.fillStyle(shineColor, 0.6);
        graphics.fillCircle(size / 2 - radius * 0.3, size / 2 - radius * 0.3, radius * 0.4);

        // 眼睛 - 白色底
        const eyeOffsetX = radius * 0.3;
        const eyeOffsetY = -radius * 0.2;
        const eyeRadius = radius * 0.25;

        graphics.fillStyle(0xffffff, 1);
        graphics.fillCircle(size / 2 + eyeOffsetX, size / 2 + eyeOffsetY, eyeRadius);

        // 眼睛 - 黑色瞳孔
        graphics.fillStyle(0x000000, 1);
        graphics.fillCircle(size / 2 + eyeOffsetX + eyeRadius * 0.2, size / 2 + eyeOffsetY, eyeRadius * 0.5);

        // 嘴巴
        graphics.fillStyle(0xffaa00, 1);
        graphics.fillTriangle(
            size / 2 + radius * 0.6, size / 2,
            size / 2 + radius * 0.9, size / 2 - radius * 0.15,
            size / 2 + radius * 0.9, size / 2 + radius * 0.15
        );

        // 生成纹理
        graphics.generateTexture(key, size, size);
        graphics.destroy();
    }

    /**
     * 生成方块纹理
     * @param {Phaser.Scene} scene - 场景实例
     * @param {string} key - 纹理键名
     * @param {number} width - 宽度
     * @param {number} height - 高度
     * @param {string} material - 材质类型: 'wood', 'stone', 'glass'
     */
    static generateBlock(scene, key, width = 60, height = 20, material = 'wood') {
        const graphics = scene.add.graphics();

        // 材质颜色配置
        const materials = {
            wood: { base: 0x8B4513, dark: 0x654321, light: 0xA0522D },
            stone: { base: 0x808080, dark: 0x606060, light: 0xA0A0A0 },
            glass: { base: 0x87CEEB, dark: 0x6BB6D8, light: 0xAFEEEE }
        };

        const colors = materials[material] || materials.wood;

        // 主体
        graphics.fillStyle(colors.base, material === 'glass' ? 0.6 : 1);
        graphics.fillRect(0, 0, width, height);

        // 边框 - 深色
        graphics.lineStyle(2, colors.dark, 1);
        graphics.strokeRect(1, 1, width - 2, height - 2);

        // 高光 - 浅色
        if (material === 'glass') {
            graphics.fillStyle(0xffffff, 0.3);
            graphics.fillRect(width * 0.1, height * 0.1, width * 0.3, height * 0.2);
        } else {
            graphics.lineStyle(1, colors.light, 0.5);
            graphics.strokeRect(3, 3, width - 6, height - 6);
        }

        // 纹理细节
        if (material === 'wood') {
            // 木纹
            graphics.lineStyle(1, colors.dark, 0.3);
            for (let i = 0; i < 3; i++) {
                const y = height * (0.3 + i * 0.2);
                graphics.lineBetween(0, y, width, y);
            }
        }

        graphics.generateTexture(key, width, height);
        graphics.destroy();
    }

    /**
     * 生成猪的纹理
     * @param {Phaser.Scene} scene - 场景实例
     * @param {string} key - 纹理键名
     * @param {number} radius - 半径
     * @param {number} color - 颜色
     */
    static generatePig(scene, key, radius = 30, color = 0x88cc44) {
        const graphics = scene.add.graphics();
        const size = radius * 2 + 10;

        // 主体 - 绿色圆形
        graphics.fillStyle(color, 1);
        graphics.fillCircle(size / 2, size / 2, radius);

        // 高光
        graphics.fillStyle(0xaaddaa, 0.5);
        graphics.fillCircle(size / 2 - radius * 0.3, size / 2 - radius * 0.3, radius * 0.4);

        // 眼睛
        const eyeY = size / 2 - radius * 0.2;
        const eyeSpacing = radius * 0.4;
        const eyeRadius = radius * 0.2;

        // 左眼
        graphics.fillStyle(0xffffff, 1);
        graphics.fillCircle(size / 2 - eyeSpacing, eyeY, eyeRadius);
        graphics.fillStyle(0x000000, 1);
        graphics.fillCircle(size / 2 - eyeSpacing, eyeY, eyeRadius * 0.5);

        // 右眼
        graphics.fillStyle(0xffffff, 1);
        graphics.fillCircle(size / 2 + eyeSpacing, eyeY, eyeRadius);
        graphics.fillStyle(0x000000, 1);
        graphics.fillCircle(size / 2 + eyeSpacing, eyeY, eyeRadius * 0.5);

        // 鼻孔
        const noseY = size / 2 + radius * 0.1;
        const noseSpacing = radius * 0.15;
        graphics.fillStyle(0x006600, 1);
        graphics.fillCircle(size / 2 - noseSpacing, noseY, radius * 0.1);
        graphics.fillCircle(size / 2 + noseSpacing, noseY, radius * 0.1);

        // 耳朵
        graphics.fillStyle(color, 1);
        // 左耳
        graphics.fillTriangle(
            size / 2 - radius * 0.7, size / 2 - radius * 0.7,
            size / 2 - radius * 0.5, size / 2 - radius * 0.9,
            size / 2 - radius * 0.4, size / 2 - radius * 0.6
        );
        // 右耳
        graphics.fillTriangle(
            size / 2 + radius * 0.7, size / 2 - radius * 0.7,
            size / 2 + radius * 0.5, size / 2 - radius * 0.9,
            size / 2 + radius * 0.4, size / 2 - radius * 0.6
        );

        graphics.generateTexture(key, size, size);
        graphics.destroy();
    }

    /**
     * 生成弹弓纹理
     * @param {Phaser.Scene} scene - 场景实例
     * @param {string} key - 纹理键名
     * @param {number} width - 宽度
     * @param {number} height - 高度
     */
    static generateSlingshot(scene, key, width = 40, height = 100) {
        const graphics = scene.add.graphics();

        // 木头底座
        graphics.fillStyle(0x654321, 1);
        graphics.fillRect(width * 0.35, height * 0.7, width * 0.3, height * 0.3);

        // 左支架
        graphics.lineStyle(8, 0x654321, 1);
        graphics.lineBetween(width * 0.2, height * 0.7, width * 0.2, height * 0.2);

        // 右支架
        graphics.lineBetween(width * 0.8, height * 0.7, width * 0.8, height * 0.2);

        // 橡皮筋
        graphics.lineStyle(3, 0x331100, 1);
        graphics.lineBetween(width * 0.2, height * 0.2, width * 0.8, height * 0.2);

        graphics.generateTexture(key, width, height);
        graphics.destroy();
    }

    /**
     * 生成地面纹理
     * @param {Phaser.Scene} scene - 场景实例
     * @param {string} key - 纹理键名
     * @param {number} width - 宽度
     * @param {number} height - 高度
     */
    static generateGround(scene, key, width = 800, height = 60) {
        const graphics = scene.add.graphics();

        // 草地主色
        graphics.fillStyle(0x4a752c, 1);
        graphics.fillRect(0, 0, width, height);

        // 泥土层
        graphics.fillStyle(0x6b4423, 1);
        graphics.fillRect(0, height * 0.4, width, height * 0.6);

        // 草丛纹理
        graphics.lineStyle(2, 0x5a8a3c, 1);
        for (let i = 0; i < width; i += 10) {
            const grassHeight = Math.random() * 10 + 5;
            graphics.lineBetween(i, height * 0.4, i, height * 0.4 - grassHeight);
        }

        graphics.generateTexture(key, width, height);
        graphics.destroy();
    }

    /**
     * 批量生成所有基础纹理
     * @param {Phaser.Scene} scene - 场景实例
     */
    static generateAllTextures(scene) {
        // 生成小鸟纹理
        this.generateBird(scene, 'bird-red', 25, 0xcc3333, 0xff6666);
        this.generateBird(scene, 'bird-yellow', 22, 0xffdd33, 0xffee77);
        this.generateBird(scene, 'bird-bomb', 30, 0x222222, 0x444444);

        // 生成方块纹理
        this.generateBlock(scene, 'block-wood-h', 80, 20, 'wood');
        this.generateBlock(scene, 'block-wood-v', 20, 80, 'wood');
        this.generateBlock(scene, 'block-wood-square', 40, 40, 'wood');

        this.generateBlock(scene, 'block-stone-h', 80, 20, 'stone');
        this.generateBlock(scene, 'block-stone-v', 20, 80, 'stone');
        this.generateBlock(scene, 'block-stone-square', 40, 40, 'stone');

        this.generateBlock(scene, 'block-glass-h', 80, 20, 'glass');
        this.generateBlock(scene, 'block-glass-v', 20, 80, 'glass');
        this.generateBlock(scene, 'block-glass-square', 40, 40, 'glass');

        // 生成猪纹理
        this.generatePig(scene, 'pig-small', 20, 0x88cc44);
        this.generatePig(scene, 'pig-medium', 30, 0x88cc44);
        this.generatePig(scene, 'pig-large', 40, 0x77bb33);

        // 生成弹弓
        this.generateSlingshot(scene, 'slingshot', 40, 100);

        // 生成地面
        this.generateGround(scene, 'ground', 800, 60);

        console.log('✅ 所有纹理生成完成');
    }
}
