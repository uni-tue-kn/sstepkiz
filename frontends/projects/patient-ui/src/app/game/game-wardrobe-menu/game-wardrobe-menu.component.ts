import { AfterViewInit, Component, EventEmitter, Output } from "@angular/core";
import { DocumentCategory } from "@sstepkiz";

declare const WARDROBE: DocumentCategory;

@Component({
  selector: "app-game-wardrobe-menu",
  styleUrls: ["./game-wardrobe-menu.component.scss"],
  templateUrl: "./game-wardrobe-menu.component.html",
})
export class GameWardrobeMenuComponent implements AfterViewInit {
  categoryIndex: number = 0;

  @Output()
  categoryIndexEmitter: EventEmitter<number> = new EventEmitter();

  wardrobe: DocumentCategory = WARDROBE;

  selectCategory(index: number) {
    //recolor new category and prev category
    let oldCategory = document.getElementById(this.wardrobe[this.categoryIndex].name);
    oldCategory.style.fill = "#7b7b7b";

    let newCategory = document.getElementById(this.wardrobe[index].name);
    newCategory.style.fill = "#B5D932";

    //emit new category
    this.categoryIndex = index;
    this.categoryIndexEmitter.emit(index);
  }

  ngAfterViewInit(): void {
    //markinng current category green
    let newCategory = document.getElementById(this.wardrobe[0].name);
    newCategory.style.fill = "#B5D932";
  }
}
