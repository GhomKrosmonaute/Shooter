import * as PIXI from "pixi.js"
import Entity from "./Entity"

export abstract class Projectile<
  Sprite extends PIXI.Sprite | PIXI.AnimatedSprite =
    | PIXI.Sprite
    | PIXI.AnimatedSprite
> extends Entity<Sprite> {
  /** Angle to direction */
  abstract direction: number
  abstract speed: number
}