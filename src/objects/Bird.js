import Phaser from 'phaser';

/**
 * Bird - 小鸟基类
 * 支持不同类型：红鸟(red)、黄鸟(yellow)、炸弹鸟(bomb)
 */
export default class Bird {
    /**
     * 小鸟配置
     */
    static TYPES = {
        red: {
            radius: 25,
            density: 0.01,
            restitution: 0.5,
            name: '红鸟',
            ability: null  // 红鸟无特殊能力
        },
        yellow: {
            radius: 22,
            density: 0.008,
            restitution: 0.5,
            name: '黄鸟',
            ability: 'speed'  // 加速能力
        },
        bomb: {
            radius: 30,
            density: 0.015,
            restitution: 0.3,
            name: '炸弹鸟',
            ability: 'explode'  // 爆炸能力
        }
    };

    /**
     * 小鸟状态
     */
    static STATES = {
        IDLE: 'idle',           // 待机（在弹弓上）
        FLYING: 'flying',       // 飞行中
        LANDED: 'landed',       // 着陆
        DESTROYED: 'destroyed'  // 已销毁
    };

    /**
     * 创建小鸟
     * @param {Phaser.Scene} scene - 场景实例
     * @param {number} x - X 坐标
     * @param {number} y - Y 坐标
     * @param {string} type - 类型: 'red', 'yellow', 'bomb'
     */
    constructor(scene, x, y, type = 'red') {
        this.scene = scene;
        this.type = type;

        // 获取类型配置
        this.config = Bird.TYPES[type];
        if (!this.config) {
            console.error(`未知小鸟类型: ${type}，使用默认类型 red`);
            this.config = Bird.TYPES.red;
            this.type = 'red';
        }

        // 状态
        this.state = Bird.STATES.IDLE;
        this.hasUsedAbility = false;
        this.isDestroyed = false;

        // 飞行追踪
        this.trail = [];  // 轨迹点
        this.maxTrailLength = 20;

        // 创建物理精灵
        const textureKey = this.getTextureKey();
        this.sprite = scene.matter.add.sprite(x, y, textureKey);

        // 设置圆形物理体
        this.sprite.setCircle(this.config.radius, {
            density: this.config.density,
            friction: 0.5,
            restitution: this.config.restitution
        });

        // 初始时设置为静态（在弹弓上）
        this.sprite.setStatic(true);

        // 保存引用
        this.sprite.birdInstance = this;

        // 添加到场景的小鸟列表
        if (!scene.birds) {
            scene.birds = [];
        }
        scene.birds.push(this);
    }

    /**
     * 获取纹理键名
     */
    getTextureKey() {
        return `bird-${this.type}`;
    }

    /**
     * 发射小鸟
     * @param {number} velocityX - X 方向速度
     * @param {number} velocityY - Y 方向速度
     */
    launch(velocityX, velocityY) {
        if (this.state !== Bird.STATES.IDLE) return;

        // 切换到飞行状态
        this.state = Bird.STATES.FLYING;

        // 设置为动态物体
        this.sprite.setStatic(false);

        // 应用速度
        this.sprite.setVelocity(velocityX, velocityY);

        // 启用旋转
        this.sprite.setAngularVelocity(0.1);

        console.log(`${this.config.name}发射了！速度: (${velocityX.toFixed(1)}, ${velocityY.toFixed(1)})`);

        // 触发发射事件
        if (this.scene.events) {
            this.scene.events.emit('birdLaunched', this);
        }
    }

    /**
     * 使用特殊能力
     */
    useAbility() {
        if (this.hasUsedAbility || this.state !== Bird.STATES.FLYING) return;

        this.hasUsedAbility = true;

        switch (this.config.ability) {
            case 'speed':
                this.abilitySpeed();
                break;
            case 'explode':
                this.abilityExplode();
                break;
            default:
                // 红鸟无特殊能力
                break;
        }
    }

    /**
     * 黄鸟加速能力
     */
    abilitySpeed() {
        if (!this.sprite || !this.sprite.body) return;

        const currentVelocity = this.sprite.body.velocity;
        const speedMultiplier = 2.0;

        this.sprite.setVelocity(
            currentVelocity.x * speedMultiplier,
            currentVelocity.y * speedMultiplier
        );

        console.log(`${this.config.name}使用了加速能力！`);

        // 视觉效果
        this.sprite.setTint(0xffff00);
        this.scene.time.delayedCall(200, () => {
            if (this.sprite) {
                this.sprite.clearTint();
            }
        });
    }

    /**
     * 炸弹鸟爆炸能力
     */
    abilityExplode() {
        if (!this.sprite || !this.sprite.body) return;

        console.log(`${this.config.name}爆炸了！`);

        const explosionRadius = 150;
        const explosionForce = 0.05;

        // 获取爆炸范围内的所有物体
        const bodies = this.scene.matter.world.localWorld.bodies;
        const birdPos = { x: this.sprite.x, y: this.sprite.y };

        bodies.forEach(body => {
            if (!body.gameObject || body.isStatic) return;
            if (body.gameObject === this.sprite) return;

            const targetPos = { x: body.position.x, y: body.position.y };
            const distance = Phaser.Math.Distance.Between(
                birdPos.x, birdPos.y,
                targetPos.x, targetPos.y
            );

            // 在爆炸范围内
            if (distance < explosionRadius) {
                const angle = Phaser.Math.Angle.Between(
                    birdPos.x, birdPos.y,
                    targetPos.x, targetPos.y
                );

                const force = explosionForce * (1 - distance / explosionRadius);
                const forceX = Math.cos(angle) * force;
                const forceY = Math.sin(angle) * force;

                body.gameObject.applyForce({ x: forceX, y: forceY });

                // 对方块和猪造成伤害
                if (body.gameObject.blockInstance) {
                    body.gameObject.blockInstance.takeDamage(50);
                }
                if (body.gameObject.pigInstance) {
                    body.gameObject.pigInstance.takeDamage(80);
                }
            }
        });

        // 爆炸视觉效果
        this.showExplosionEffect();
    }

    /**
     * 显示爆炸效果
     */
    showExplosionEffect() {
        if (!this.sprite) return;

        const x = this.sprite.x;
        const y = this.sprite.y;

        // 创建爆炸圆圈
        const explosion = this.scene.add.circle(x, y, 10, 0xff6600, 0.8);

        this.scene.tweens.add({
            targets: explosion,
            radius: 150,
            alpha: 0,
            duration: 500,
            ease: 'Power2',
            onComplete: () => {
                explosion.destroy();
            }
        });
    }

    /**
     * 更新小鸟状态（每帧调用）
     */
    update() {
        if (this.isDestroyed || !this.sprite || !this.sprite.body) return;

        // 飞行中记录轨迹
        if (this.state === Bird.STATES.FLYING) {
            this.updateTrail();
            this.updateRotation();
            this.checkLanded();
        }
    }

    /**
     * 更新轨迹
     */
    updateTrail() {
        this.trail.push({ x: this.sprite.x, y: this.sprite.y });

        if (this.trail.length > this.maxTrailLength) {
            this.trail.shift();
        }
    }

    /**
     * 更新旋转（根据速度方向）
     */
    updateRotation() {
        if (!this.sprite.body) return;

        const velocity = this.sprite.body.velocity;
        const angle = Math.atan2(velocity.y, velocity.x);
        this.sprite.setRotation(angle);
    }

    /**
     * 检查是否着陆
     */
    checkLanded() {
        if (!this.sprite.body) return;

        const velocity = this.sprite.body.velocity;
        const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);

        // 速度很低时认为已着陆
        if (speed < 0.5 && this.state === Bird.STATES.FLYING) {
            this.land();
        }
    }

    /**
     * 着陆
     */
    land() {
        this.state = Bird.STATES.LANDED;
        console.log(`${this.config.name}着陆了`);

        // 触发着陆事件
        if (this.scene.events) {
            this.scene.events.emit('birdLanded', this);
        }

        // 3秒后消失
        this.scene.time.delayedCall(3000, () => {
            this.destroy();
        });
    }

    /**
     * 销毁小鸟
     */
    destroy() {
        if (this.isDestroyed) return;

        this.isDestroyed = true;
        this.state = Bird.STATES.DESTROYED;

        // 淡出动画
        if (this.sprite) {
            this.scene.tweens.add({
                targets: this.sprite,
                alpha: 0,
                duration: 500,
                onComplete: () => {
                    if (this.sprite) {
                        this.sprite.destroy();
                        this.sprite = null;
                    }
                }
            });
        }

        // 从场景列表中移除
        if (this.scene.birds) {
            const index = this.scene.birds.indexOf(this);
            if (index > -1) {
                this.scene.birds.splice(index, 1);
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
     * 是否可用
     */
    isActive() {
        return !this.isDestroyed && this.state !== Bird.STATES.DESTROYED;
    }

    /**
     * 是否在飞行
     */
    isFlying() {
        return this.state === Bird.STATES.FLYING;
    }
}
