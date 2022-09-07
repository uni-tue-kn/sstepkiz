import { Component, Input } from "@angular/core";
import { Item } from "@sstepkiz";

@Component({
  selector: "app-avatar",
  templateUrl: "./avatar.component.html",
  styleUrls: ["./avatar.component.scss"],
})
export class AvatarComponent {
  @Input() items: Item[];

  path = "../../assets/game/wardrobe/";
}
