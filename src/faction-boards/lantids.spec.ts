import { expect } from "chai";
import Engine from "../engine";
import { Player, Building, Command } from '../enums';



const parseMoves = Engine.parseMoves;

describe("Lantids", () => {
  it ("should be able to build a mine on other players' planets", () => {
    const moves = parseMoves(`
      init 2 randomSeed
      p1 faction lantids
      p2 faction xenos
      p1 build m -3x4
      p2 build m -2x2
      p2 build m -5x5
      p1 build m -1x2
      p2 build m 1x2
      p2 booster booster3
      p1 booster booster7
      p1 build m -2x2.
      p2 charge 1pw
    `);

    expect(() => new Engine(moves)).to.not.throw();
  });

  it ("should gain knowledge when having a PI and building on someone else's planet", () => {
    const engine = new Engine(parseMoves(`
      init 2 randomSeed
      p1 faction lantids
      p2 faction xenos
      p1 build m -3x4
      p2 build m -2x2
      p2 build m -5x5
      p1 build m -1x2
      p2 build m 1x2
      p2 booster booster3
      p1 booster booster7
    `));

    engine.player(Player.Player1).data.buildings[Building.PlanetaryInstitute] = 1;
    const k = engine.player(Player.Player1).data.knowledge;
    engine.move("p1 build m -2x2.");
    expect(engine.player(Player.Player1).data.knowledge).to.equal(k + 2);
  });

  it ("should gain only 1 knowledge when getting pt | vp", () => {
    const engine = new Engine(parseMoves(`
    init 2 randomSeed
    p1 faction lantids
    p2 faction hadsch-hallas
    lantids build m -4x-1
    hadsch-hallas build m -5x0
    hadsch-hallas build m -2x-4
    lantids build m -4x2
    hadsch-hallas booster booster3
    lantids booster booster4
    lantids pass booster5
    hadsch-hallas build m -4x0.
    lantids decline
    hadsch-hallas pass booster4
    lantids build m -5x0.
    hadsch-hallas decline
    hadsch-hallas pass booster3
    lantids build ts -4x-1.
    hadsch-hallas decline
    `));

    const pl = engine.player(Player.Player1);
    const k = pl.data.knowledge;
    engine.move("lantids build lab -4x-1. tech gaia. up gaia.");
    expect(pl.data.knowledge).to.equal(k + 1);
  });

  it("should not get the option to build a federation using other players' buildings", () => {
    const moves = parseMoves(`
      init 2 zadbd
      p1 faction geodens
      p2 faction lantids
      geodens build m 2x-1
      lantids build m 3x-1
      lantids build m 1x-3
      geodens build m 4x-5
      lantids booster booster1
      geodens booster booster4
      geodens build ts 2x-1.
      lantids charge 1pw
      lantids build ts 3x-1.
      geodens charge 2pw
      geodens build PI 2x-1.
      lantids charge 2pw
      lantids build PI 3x-1.
      geodens charge 3pw
      geodens special step. build m 3x-2.
      lantids charge 3pw
      lantids build m 3x-2.
      geodens charge 3pw
      geodens action power5.
      lantids build m 2x-1.
      geodens charge 3pw
      geodens up terra.
    `);

    const engine = new Engine(moves);

    const commands = engine.generateAvailableCommands();

    // tslint:disable-next-line no-unused-expression
    expect(commands.some(cmd => cmd.name === Command.FormFederation)).to.be.false;
  });
});
