import event from "events"
import * as PIXI from "pixi.js"
import app from "../app";

export default abstract class Entity extends event.EventEmitter {
  sprite: PIXI.Sprite | PIXI.AnimatedSprite

  abstract update(): unknown

  onSetup?: () => unknown
  onTeardown?: () => unknown

  protected constructor(sprite: PIXI.AnimatedSprite | PIXI.Sprite) {
    this.sprite = sprite
  }

  setup(){
    this.onSetup?.()
    app.stage.addChild(this.sprite)
  }

  teardown(){
    app.stage.removeChild(this.sprite)
    this.onTeardown?.()
  }
}