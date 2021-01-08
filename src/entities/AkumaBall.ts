import * as PIXI from "pixi.js";
import app, {getAnimatedSprite} from "../app";
import Entity from "./Entity";

export default class AkumaBall extends Entity {
  constructor() {
    super(getAnimatedSprite("akuma-ball"));
  }

  update() {

  }
}