import * as PIXI from "pixi.js"

const app = new PIXI.Application({
  resizeTo: window,
})

document.body.appendChild(app.view)

export function getAnimatedSprite(name: string): PIXI.AnimatedSprite {
  const sheet = PIXI.Loader.shared.resources[`assets/${name}.json`].spritesheet
  const sprite = new PIXI.AnimatedSprite(sheet.animations.image_sequence)
  sprite.animationSpeed = 60 / 15
  return sprite
}

export default app
