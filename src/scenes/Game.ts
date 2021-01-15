import * as PIXI from "pixi.js"
import * as shooter from "../app/shooter"
import Scene from "./Scene"
import AkumaBall from "../entities/AkumaBall"

export default class Game extends Scene<PIXI.Sprite> {
  id = "game"
  akumaBall: AkumaBall

  constructor() {
    super(shooter.getSprite("game-background"))

    this.akumaBall = new AkumaBall({
      position: new PIXI.Point(100, 300),
    })

    this.addChild(this.akumaBall, true)
  }

  update() {}
}
