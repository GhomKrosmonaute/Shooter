import * as PIXI from "pixi.js"
import * as shooter from "../shooter"
import Entity from "./Entity"

interface AkumaBallOptions {
  position: PIXI.IPointData
}

export default class AkumaBall extends Entity<PIXI.AnimatedSprite> {
  constructor(options: AkumaBallOptions) {
    super(
      shooter.getAnimatedSprite("akuma-ball", {
        loop: false,
        play: false,
      })
    )

    this.sprite.interactive = true
    this.sprite.on("pointerup", this.blink.bind(this))

    if (options.position) {
      this.sprite.position.copyFrom(options.position)
    }

    this.sprite.onFrameChange = () => {
      if (this.sprite.currentFrame === 5) {
        // le neuye est fermé
      }
    }
  }

  blink() {
    this.sprite.gotoAndPlay(0)
  }

  update() {}
}
