import * as PIXI from "pixi.js"
import * as Mousetrap from "mousetrap"

class Key extends PIXI.utils.EventEmitter {
  private _isPressed: boolean = false
  private _pressedAt: number = 0

  constructor(private name: string) {
    super()
    Mousetrap.bind(
      name,
      () => {
        this._isPressed = true
        this._pressedAt = Date.now()
      },
      "keydown"
    )
    Mousetrap.bind(name, () => (this._isPressed = false), "keyup")
    Mousetrap.bind(name, () => this.emit("press", this.duration), "keypress")
  }

  get duration(): number {
    if (!this._isPressed) return 0
    return Date.now() - this._pressedAt
  }

  get isPressed(): boolean {
    return this._isPressed
  }
}

export const up = new Key("up")
export const left = new Key("left")
export const right = new Key("right")
export const down = new Key("down")
