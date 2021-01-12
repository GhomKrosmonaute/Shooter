import * as PIXI from "pixi.js"

const app = new PIXI.Application({
  resizeTo: window,
})

document.body.appendChild(app.view)

export function getAnimatedSprite(name: string): PIXI.AnimatedSprite {
  const sheet =
    PIXI.Loader.shared.resources[`assets/sprites/${name}.json`].spritesheet
  const sprite = new PIXI.AnimatedSprite(sheet.animations.image_sequence)
  sprite.animationSpeed = 60 / 15
  sprite.position.set(100, 100)
  sprite.scale.set(5)
  sprite.visible = true
  sprite.play()
  return sprite
}

export default app
