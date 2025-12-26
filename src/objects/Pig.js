import Phaser from 'phaser';

/**
 * Pig - 猪类（需要被消灭的敌人）
 * 支持不同大小：小猪(small)、中猪(medium)、大猪(large)
 */
export default class Pig {
    /**
     * 猪的配置
     */
    static SIZES = {
        small: {
            radius: 20,
            maxHealth: 80,
            score: 5000,
            density: 0.01,
            name: '小猪'
        },
        medium: {
            radius: 30,
            maxHealth: 150,
            score: 10000,
            density: 0.012,
            name: '中猪'
        },
        large: {
            radius: 40,
            maxHealth: 250,
            score: 15000,
            density: 0.015,
            name: '大猪'
        }
    };

    /**
     * 创建猪
     * @param {Phaser.Scene} scene - 场景实例
     * @param {number} x - X 坐标
     * @param {number} y - Y 坐标
     * @param {string} size - 大小类型: 'small', 'medium', 'large'
     */
    constructor(scene, x, y, size = 'medium') {
        this.scene = scene;
        this.size = size;

        // 获取大小配置
        this.config = Pig.SIZES[size];
        if (!this.config) {
            console.error(`未知猪大小: ${size}，使用默认大小 medium`);
            this.config = Pig.SIZES.medium;
            this.size = 'medium';
        }

        // 生命值
        this.maxHealth = this.config.maxHealth;
        this.health = this.maxHealth;
        this.isDestroyed = false;
        this.isDead = false;

        // 分数
        this.score = this.config.score;

        // 创建物理精灵
        const textureKey = this.getTextureKey();
        this.sprite = scene.matter.add.sprite(x, y, textureKey);

        // 设置圆形物理体
        this.sprite.setCircle(this.config.radius, {
            density: this.config.density,
            friction: 0.5,
            restitution: 0.3
        });

        // 保存引用，方便碰撞检测时获取
        this.sprite.pigInstance = this;

        // 添加到场景的猪列表
        if (!scene.pigs) {
            scene.pigs = [];
        }
        scene.pigs.push(this);
    }

    /**
     * 获取纹理键名
     */
    getTextureKey() {
        return `pig-${this.size}`;
    }

    /**
     * 受到伤害
     * @param {number} damage - 伤害值
     * @returns {boolean} - 是否被杀死
     */
    takeDamage(damage) {
        if (this.isDestroyed || this.isDead) return true;

        this.health -= damage;

        // 更新视觉效果
        const healthPercent = this.health / this.maxHealth;
        this.sprite.setAlpha(Math.max(0.3, healthPercent));

        // 如果生命值小于等于0，杀死
        if (this.health <= 0) {
            this.die();
            return true;
        }

        // 受伤效果
        this.flashDamage();
        this.playHurtAnimation();

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
     * 受伤动画（抖动）
     */
    playHurtAnimation() {
        if (!this.sprite || !this.sprite.scene) return;

        // 轻微抖动
        this.scene.tweens.add({
            targets: this.sprite,
            scaleX: 1.1,
            scaleY: 0.9,
            duration: 100,
            yoyo: true,
            ease: 'Sine.easeInOut'
        });
    }

    /**
     * 猪死亡
     */
    die() {
        if (this.isDead) return;

        this.isDead = true;
        this.isDestroyed = true;

        // 播放死亡动画
        this.playDeathAnimation();

        // 触发死亡事件（用于计分等）
        if (this.scene.events) {
            this.scene.events.emit('pigDied', this);
        }

        console.log(`${this.config.name}被消灭了！得分：${this.score}`);
    }

    /**
     * 死亡动画
     */
    playDeathAnimation() {
        if (!this.sprite || !this.sprite.scene) return;

        // 旋转并淡出
        this.scene.tweens.add({
            targets: this.sprite,
            alpha: 0,
            angle: 360,
            scaleX: 1.5,
            scaleY: 1.5,
            duration: 500,
            ease: 'Power2',
            onComplete: () => {
                this.destroy();
            }
        });
    }

    /**
     * 销毁猪
     */
    destroy() {
        if (this.isDestroyed && this.sprite) {
            this.sprite.destroy();
            this.sprite = null;
        }

        // 从场景的猪列表中移除
        if (this.scene.pigs) {
            const index = this.scene.pigs.indexOf(this);
            if (index > -1) {
                this.scene.pigs.splice(index, 1);
            }
        }
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
     * 是否存活
     */
    isAlive() {
        return !this.isDead && !this.isDestroyed;
    }

    /**
     * 获取分数
     */
    getScore() {
        return this.score;
    }

    /**
     * 更新（每帧调用）
     */
    update() {
        // 可以在这里添加每帧更新的逻辑
        // 比如：AI 行为、检测是否掉出地图等
    }
}
