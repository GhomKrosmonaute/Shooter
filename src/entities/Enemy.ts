import Entity from "./Entity"

export default abstract class Enemy extends Entity {
  // todo : implement a rea pattern like RPG Maker, The binding of Isaac
  abstract pattern: (() => {})[]
}
