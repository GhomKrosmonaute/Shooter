import * as PIXI from "pixi.js"
import Entity from "./Entity"

export default abstract class Character<
  Sprite extends PIXI.Sprite | PIXI.AnimatedSprite =
    | PIXI.Sprite
    | PIXI.AnimatedSprite
> extends Entity<Sprite> {}
