import * as PIXI from "pixi.js"

export const keys = new Set<Key>()

class Key extends PIXI.utils.EventEmitter {
  private _isPressed: boolean = false
  private _pressedAt: number = 0

  constructor(public readonly name: string) {
    super()
  }

  handle(event: KeyboardEvent, action: "up" | "down") {
    this.emit(action, event, this.duration)
    if (action === "down") {
      this._isPressed = true
      this._pressedAt = Date.now()
    } else {
      this._isPressed = false
    }
  }

  get duration(): number {
    if (!this._isPressed) return 0
    return Date.now() - this._pressedAt
  }

  get isPressed(): boolean {
    return this._isPressed
  }
}

export const up = new Key("ArrowUp")
export const left = new Key("ArrowLeft")
export const right = new Key("ArrowRight")
export const down = new Key("ArrowDown")

keys.add(up).add(left).add(right).add(down)

document.addEventListener("keydown", (event) => {
  keys.forEach((key) => {
    if (event.key === key.name) key.handle(event, "down")
  })
})

document.addEventListener("keyup", (event) => {
  keys.forEach((key) => {
    if (event.key === key.name) key.handle(event, "up")
  })
})
