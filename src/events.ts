import { Condition, Operator, Booster, AdvTechTilePos, Command, ResearchField, BoardAction, Faction} from "./enums";
import Reward from "./reward";

function findCondition(spec: string): [Condition, string] {
  let conditionMatch = /^(.+?)(\b| )/.exec(spec);

  if (!conditionMatch) {
    conditionMatch = /^([^ ]*)$/.exec(spec);
  }

  const conditionString = conditionMatch[1];
  const remaining = spec.substr(conditionString.length).trimLeft();

  for (const cond of Object.values(Condition) as Condition[]) {
    if (conditionString === cond) {
      return [cond, remaining];
    }
  }

  // If there's two spaces in the whole string, that means that the first part HAS to be a condition
  if (spec.split(" ").length === 3) {
    return [conditionString as Condition, remaining];
  }

  return [Condition.None, spec];
}

function findOperator(spec: string): [Operator, string, number] {
  let operatorMatch = /^(.+?)(\b| )/.exec(spec);

  if (!operatorMatch) {
    operatorMatch = /^([^ ]*)$/.exec(spec);
  }

  const operatorString = operatorMatch[1];

  for (const op of Object.values(Operator) as Operator[]) {
    if (operatorString === op) {
      const remaining = spec.substr(operatorString.length).trimLeft();
      return [op, remaining, 0];
    }
  }

  // If there's one space in the string, that means that the second part HAS to be a condition
  if (spec.split(" ").length === 2) {
    const [operator, remaining] = spec.split(" ");
    const toPick = parseInt(operator, 10);
    return [operator.slice(('' + toPick).length) as Operator, remaining, toPick];
  }

  return [Operator.Once, spec, 0];
}

export type RoundScoring = 'round1' | 'round2' | 'round3' | 'round4' | 'round5' | 'round6';
export type TechPos = 'tech-gaia' | 'tech-nav' | 'tech-sci' | 'tech-eco' | 'tech-terra' | 'tech-int' | 'tech-free1' | 'tech-free2' | 'tech-free2';
export type EventSource = Booster | TechPos | AdvTechTilePos | Command.ChargePower | Command.Spend | 'final1' | 'final2' | RoundScoring | ResearchField | BoardAction | Command.ChooseIncome | Command.Build | Command.ChooseFederationTile | Command.FormFederation | Command.UpgradeResearch | Faction | Command.MoveShip;

export default class Event {
  spec: string;
  condition: Condition;
  operator: Operator;
  source: EventSource;
  rewards: Reward[];
  /** Number of rewards to pick. Default to ALL */
  toPick: number = 0;
  activated: boolean = false;

  constructor(spec: string | {spec: string, source: EventSource}, source?: EventSource) {
    if (typeof spec === "object") {
      this.spec = spec.spec;
      this.source = spec.source;
    } else {
      this.spec = spec;
      this.source = source;
    }

    if (this.spec.endsWith("!")) {
      this.spec = this.spec.slice(0, this.spec.length - 1);
      this.activated = true;
    }
    let remaining: string;

    if (this.spec.toLowerCase().trim() === Operator.Special.toLowerCase()) {
      this.condition = Condition.None;
      this.rewards = [];
      this.operator = Operator.Special;
    } else {
      [this.condition, remaining] = findCondition(this.spec);
      [this.operator, remaining, this.toPick] = findOperator(remaining);
      this.rewards = Reward.parse(remaining);
    }

    if (this.operator === Operator.Activate && this.condition) {
      this.rewards.splice(0, 0, new Reward(-1, this.condition as any));
      this.condition = undefined;
    }
  }

  toString() {
    return this.spec + (this.activated ? "!" : "");
  }

  toJSON() {
    return {spec: this.toString(), source: this.source};
  }

  action(): {rewards: string, enabled: boolean} {
    const idx = this.spec.indexOf('=>');
    const ret = {rewards: this.spec.slice(idx + 2).trim(), enabled: !this.activated};

    if (idx > 0) {
      ret.rewards = "-" + this.spec.slice(0, idx).trim() + "," + ret.rewards;
    }

    return ret;
  }

  clone() {
    return new Event(this.spec, this.source);
  }

  static parse(events: string[], source: EventSource): Event[] {
    return events.map(ev => new Event(ev, source));
  }
}
