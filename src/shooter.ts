import * as PIXI from "pixi.js"

export const app = new PIXI.Application({
  resizeTo: window,
})

document.body.appendChild(app.view)

export function getAnimatedSprite(
  name: string,
  options: Partial<{
    play: boolean
    loop: boolean
  }> = {}
): PIXI.AnimatedSprite {
  const resource = PIXI.Loader.shared.resources[`assets/sprites/${name}.json`]
  const sprite = new PIXI.AnimatedSprite(Object.values(resource.textures))
  sprite.animationSpeed = 15 / 60
  sprite.anchor.set(0.5)
  sprite.visible = true
  if (options.play) sprite.play()
  sprite.loop = options.loop
  return sprite
}

export function getSprite(name: string): PIXI.Sprite {
  const resource = PIXI.Loader.shared.resources[`assets/sprites/${name}.png`]
  return new PIXI.Sprite(resource.texture)
}

export function listen(callback: (event: PIXI.InteractionEvent) => unknown) {
  return callback
}

export const mouse: PIXI.Point = app.renderer.plugins.interaction.mouse.global
