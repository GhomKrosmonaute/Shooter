import * as PIXI from "pixi.js"

import "./app"

import AkumaBall from "./entities/AkumaBall"

async function setup() {
  await new Promise((resolve) => {
    PIXI.Loader.shared
      // .add('akuma-ball', 'assets/akuma-ball.json')
      .add("assets/akuma-ball.json")
      .load(resolve)
  })

  new AkumaBall()
}
