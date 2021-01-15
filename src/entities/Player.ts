import * as PIXI from "pixi.js"
import * as shooter from "../app/shooter"
import * as keyboard from "../app/keyboard"
import Character from "./Character"

export default class Player extends Character<PIXI.Sprite> {
  id = "player"

  constructor() {
    super(
      shooter.getAnimatedSprite("akuma-ball", {
        loop: false,
        play: false,
      })
    )
  }

  update() {
    if (keyboard.up.isPressed) this.sprite.position.y -= 5
    if (keyboard.down.isPressed) this.sprite.position.y += 5
    if (keyboard.left.isPressed) this.sprite.position.x -= 5
    if (keyboard.right.isPressed) this.sprite.position.x += 5
    super.update()
  }
}
