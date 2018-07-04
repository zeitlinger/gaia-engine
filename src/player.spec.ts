import {expect} from "chai";
import 'mocha';
import Player from "./player";
import { Faction, Planet, Building, Resource, Player as PlayerEnum, Operator } from "./enums";
import Reward from "./reward";
import Event from "./events";

describe("Player", () => {
  describe("canBuild", () => {
    it("should take addedCost into account", () => {
      const player = new Player(PlayerEnum.Player1);

      player.loadFaction(Faction.Terrans);

      const cost = player.canBuild(Planet.Terra, Building.Mine, {addedCost: [new Reward(1, Resource.Qic)]});

      expect(Reward.match(Reward.parse("2c,o,q"), cost)).to.be.true;
    });
  });

  describe("removeEvent", () => {
    it("should work", () => {
      const player = new Player();

      player.loadEvents(Event.parse(["+k", "+o", "+c"]));
      player.removeEvent(new Event("+o"));

      expect(player.events[Operator.Income]).to.have.lengthOf(2);
      expect(Reward.match(player.events[Operator.Income][0].rewards, [new Reward("k")])).to.be.true;
      expect(Reward.match(player.events[Operator.Income][1].rewards, [new Reward("1c")])).to.be.true;
    });

    it ("should work on events that were activated", () => {
      const player = new Player();

      player.loadEvents(Event.parse(["+k", "=> 4c", "+c"]));
      player.events[Operator.Activate][0].activated = true;
      player.removeEvent(new Event("=> 4c"));

      expect(player.events[Operator.Activate]).to.have.lengthOf(0);
    });
  });
});