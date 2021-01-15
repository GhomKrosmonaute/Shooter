import * as PIXI from "pixi.js"
import * as shooter from "../app/shooter"
import * as keyboard from "../app/keyboard"
import Character from "./Character"

export default class Player extends Character<PIXI.Sprite> {
  constructor() {
    super(
      shooter.getAnimatedSprite("akuma-ball", {
        loop: false,
        play: false,
      })
    )
  }

  update() {
    // todo: implement key events
  }
}
