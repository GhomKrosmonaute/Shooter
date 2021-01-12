import * as PIXI from "pixi.js"
import app from "../app"

export default abstract class Entity extends PIXI.utils.EventEmitter {
  static children: Entity[] = []

  private readonly _sprite: PIXI.Sprite | PIXI.AnimatedSprite
  private _isSetup: boolean = false

  get sprite(): PIXI.Sprite | PIXI.AnimatedSprite {
    return this._sprite
  }

  get isSetup(): boolean {
    return this._isSetup
  }

  abstract update(): unknown

  protected constructor(sprite: PIXI.AnimatedSprite | PIXI.Sprite) {
    super()
    this._sprite = sprite
  }

  setup() {
    this.emit("setup")
    app.stage.addChild(this._sprite)
    this._isSetup = true
  }

  teardown() {
    app.stage.removeChild(this._sprite)
    this.emit("teardown")
  }
}
