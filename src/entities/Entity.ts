import * as PIXI from "pixi.js"
import * as shooter from "../shooter"

export default abstract class Entity<
  Sprite extends PIXI.Sprite | PIXI.AnimatedSprite =
    | PIXI.Sprite
    | PIXI.AnimatedSprite
> extends PIXI.utils.EventEmitter {
  static children: Set<Entity> = new Set()

  children: Set<Entity> = new Set()
  parent?: Entity

  private readonly _sprite: Sprite
  private _isSetup: boolean = false

  // abstract id: string

  abstract update(): unknown

  protected constructor(sprite: Sprite, setup?: boolean) {
    super()
    this._sprite = sprite
    this.on("update", () => {
      this.children.forEach((child) => child.update())
    })
    if (setup) this.setup()
  }

  get sprite(): Sprite {
    return this._sprite
  }

  get isSetup(): boolean {
    return this._isSetup
  }

  get container(): PIXI.Container {
    return this.parent ? this.parent.sprite : shooter.app.stage
  }

  setup() {
    this.emit("setup")
    this.container.addChild(this._sprite)
    Entity.children.add(this)
    this._isSetup = true
  }

  destroy() {
    this._isSetup = false
    this.container.removeChild(this._sprite)
    Entity.children.delete(this)
    this._sprite.removeChildren()
    this.children.forEach((child) => child.destroy())
    this.emit("destroy")
  }

  addChild(entity: Entity, setup?: boolean) {
    entity.parent = this
    this.children.add(entity)
    if (setup) entity.setup()
  }

  removeChild(entity: Entity, destroy?: boolean) {
    entity.parent = null
    this.children.delete(entity)
    if (destroy) entity.destroy()
  }
}
