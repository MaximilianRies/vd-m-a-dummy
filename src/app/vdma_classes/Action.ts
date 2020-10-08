export class Action {
  actionID: string;
  actionName: string;
  actionDescription?: string;
  blockingType?: string;  // "noBlock", "softBlock", "hardBlock"
  static blockingTypes = ["noBlock", "softBlock", "hardBlock"];
  triggerPointType?: string;  // "time", "distance"
  static triggerPointTypes = ["time", "distance"];
  triggerPointValue?: number;
  durationType?: string;  // "time", "distance"
  static durationTypes = ["time", "distance"]
  durationValue?: number;
  actionParameter?: string;
}
