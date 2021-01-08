import * as events from "events"
import * as PIXI from "pixi.js"
import app from "../app";

export default abstract class Entity extends events.EventEmitter {
  sprite: PIXI.Sprite | PIXI.AnimatedSprite

  abstract update(): unknown

  protected constructor(sprite: PIXI.AnimatedSprite | PIXI.Sprite) {
    super()
    this.sprite = sprite
  }

  setup(){
    this.emit("setup")
    app.stage.addChild(this.sprite)
  }

  teardown(){
    app.stage.removeChild(this.sprite)
    this.emit("teardown")
  }
}