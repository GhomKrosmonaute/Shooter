import * as PIXI from "pixi.js"
import Entity from "./entities/Entity"
import AkumaBall from "./entities/AkumaBall"

async function setup() {
  await new Promise((resolve) => {
    PIXI.Loader.shared.add("assets/sprites/akuma-ball.json").load(resolve)
  })

  const akumaBall = new AkumaBall()

  akumaBall.setup()
}

function update() {
  Entity.children.forEach((entity) => {
    if (entity.isSetup) entity.update()
  })
  requestAnimationFrame(update)
}

setup()
  .then(() => requestAnimationFrame(update))
  .catch()
