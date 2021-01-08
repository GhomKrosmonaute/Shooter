import app, { getAnimatedSprite } from "../app"
import Entity from "./Entity"

export default class AkumaBall extends Entity {
  constructor() {
    super(getAnimatedSprite("akuma-ball"))
  }

  update() {
    this.sprite.position.x++
  }
}
