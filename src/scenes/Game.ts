import * as PIXI from "pixi.js"
import * as shooter from "../shooter"
import Scene from "./Scene"
import AkumaBall from "../entities/AkumaBall"

export default class Game extends Scene<PIXI.Sprite> {
  akumaBall: AkumaBall

  constructor() {
    super(shooter.getSprite("game-background"))

    this.akumaBall = new AkumaBall({
      position: new PIXI.Point(500, 300),
    })

    this.addChild(this.akumaBall, true)
  }

  update() {}
}
