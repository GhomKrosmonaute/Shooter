import Entity from "./Entity"

export abstract class Projectile extends Entity {
  /** Angle to direction */
  abstract direction: number
  abstract speed: number
}
