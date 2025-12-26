import Phaser from 'phaser';

/**
 * Block - 建筑方块类
 * 支持不同材质：木头(wood)、石头(stone)、玻璃(glass)
 */
export default class Block {
    /**
     * 材质配置
     */
    static MATERIALS = {
        wood: {
            density: 0.003,
            friction: 0.8,
            restitution: 0.2,
            maxHealth: 100,
            color: 0x8B4513,
            name: '木头'
        },
        stone: {
            density: 0.008,
            friction: 0.9,
            restitution: 0.1,
            maxHealth: 300,
            color: 0x808080,
            name: '石头'
        },
        glass: {
            density: 0.002,
            friction: 0.3,
            restitution: 0.8,
            maxHealth: 50,
            color: 0x87CEEB,
            name: '玻璃'
        }
    };

    /**
     * 形状类型
     */
    static SHAPES = {
        HORIZONTAL: 'h',  // 横向长条
        VERTICAL: 'v',    // 竖向长条
        SQUARE: 'square'  // 正方形
    };

    /**
     * 创建方块
     * @param {Phaser.Scene} scene - 场景实例
     * @param {number} x - X 坐标
     * @param {number} y - Y 坐标
     * @param {string} material - 材质类型: 'wood', 'stone', 'glass'
     * @param {string} shape - 形状类型: 'h', 'v', 'square'
     */
    constructor(scene, x, y, material = 'wood', shape = 'square') {
        this.scene = scene;
        this.material = material;
        this.shape = shape;

        // 获取材质配置
        this.config = Block.MATERIALS[material];
        if (!this.config) {
            console.error(`未知材质: ${material}，使用默认材质 wood`);
            this.config = Block.MATERIALS.wood;
            this.material = 'wood';
        }

        // 生命值
        this.maxHealth = this.config.maxHealth;
        this.health = this.maxHealth;
        this.isDestroyed = false;

        // 根据形状确定尺寸和纹理
        const textureKey = this.getTextureKey();
        const { width, height } = this.getDimensions();

        // 创建物理精灵
        this.sprite = scene.matter.add.sprite(x, y, textureKey);

        // 设置物理属性
        this.sprite.setBody({
            type: 'rectangle',
            width: width,
            height: height
        });

        this.sprite.setDensity(this.config.density);
        this.sprite.setFriction(this.config.friction);
        this.sprite.setBounce(this.config.restitution);

        // 保存引用，方便碰撞检测时获取
        this.sprite.blockInstance = this;

        // 添加到场景的方块列表
        if (!scene.blocks) {
            scene.blocks = [];
        }
        scene.blocks.push(this);
    }

    /**
     * 获取纹理键名
     */
    getTextureKey() {
        return `block-${this.material}-${this.shape}`;
    }

    /**
     * 获取方块尺寸
     */
    getDimensions() {
        switch (this.shape) {
            case Block.SHAPES.HORIZONTAL:
                return { width: 80, height: 20 };
            case Block.SHAPES.VERTICAL:
                return { width: 20, height: 80 };
            case Block.SHAPES.SQUARE:
                return { width: 40, height: 40 };
            default:
                return { width: 40, height: 40 };
        }
    }

    /**
     * 受到伤害
     * @param {number} damage - 伤害值
     * @returns {boolean} - 是否被摧毁
     */
    takeDamage(damage) {
        if (this.isDestroyed) return true;

        this.health -= damage;

        // 更新视觉效果（透明度表示损伤程度）
        const healthPercent = this.health / this.maxHealth;
        this.sprite.setAlpha(Math.max(0.3, healthPercent));

        // 如果生命值小于等于0，销毁
        if (this.health <= 0) {
            this.destroy();
            return true;
        }

        // 受伤闪烁效果
        this.flashDamage();

        return false;
    }

    /**
     * 受伤闪烁效果
     */
    flashDamage() {
        if (!this.sprite || !this.sprite.scene) return;

        // 短暂变红表示受伤
        this.sprite.setTint(0xff0000);

        this.scene.time.delayedCall(100, () => {
            if (this.sprite && this.sprite.scene) {
                this.sprite.clearTint();
            }
        });
    }

    /**
     * 销毁方块
     */
    destroy() {
        if (this.isDestroyed) return;

        this.isDestroyed = true;

        // 播放销毁动画（淡出 + 缩小）
        if (this.sprite && this.sprite.scene) {
            this.scene.tweens.add({
                targets: this.sprite,
                alpha: 0,
                scaleX: 0.5,
                scaleY: 0.5,
                duration: 200,
                ease: 'Power2',
                onComplete: () => {
                    if (this.sprite) {
                        this.sprite.destroy();
                        this.sprite = null;
                    }
                }
            });
        }

        // 从场景的方块列表中移除
        if (this.scene.blocks) {
            const index = this.scene.blocks.indexOf(this);
            if (index > -1) {
                this.scene.blocks.splice(index, 1);
            }
        }

        console.log(`${this.config.name}方块被摧毁`);
    }

    /**
     * 获取当前位置
     */
    getPosition() {
        if (!this.sprite || !this.sprite.body) {
            return { x: 0, y: 0 };
        }
        return {
            x: this.sprite.x,
            y: this.sprite.y
        };
    }

    /**
     * 获取健康百分比
     */
    getHealthPercent() {
        return (this.health / this.maxHealth) * 100;
    }

    /**
     * 是否已摧毁
     */
    isAlive() {
        return !this.isDestroyed;
    }

    /**
     * 更新（每帧调用）
     */
    update() {
        // 检测是否掉出地图
        if (!this.isDestroyed && this.sprite && this.sprite.body && this.sprite.y > 1000) {
            console.log(`${this.config.name}方块掉出地图，自动清理`);
            this.destroy();
        }
    }
}
