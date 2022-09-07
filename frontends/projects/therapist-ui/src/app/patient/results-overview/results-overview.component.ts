import { Component } from "@angular/core";
import { ImeraApiService } from "projects/imera-api/src/public-api";
import { Result } from "@sstepkiz";
import { StateService } from "../../Services/state.service";

@Component({
  selector: "app-results-overview",
  templateUrl: "./results-overview.component.html",
  styleUrls: ["./results-overview.component.scss"],
})
export class ResultsOverviewComponent {
  routerLinkBack: string = "/studie/patienten/patient";

  routerLinkResults: string = "/studie/patienten/patient/ergebnisse";

  listContextResults: { id: number; name: string; result: Result[] }[] = [];

  text: string = "Wählen Sie die Befragung aus, deren Ergebnisse Sie sehen wollen.";

  constructor(private state: StateService, private imeraApiService: ImeraApiService) {
    console.log("current user id: ", this.state.currentUser);
    this.imeraApiService.getResult(String(this.state.currentUser.id)).then((data) => {
      data.forEach((element) => {
        console.log("result element: ", element);
        let index = this.listContextResults.findIndex((context) => context.id == element.context.id);
        if (index === -1) {
          this.listContextResults.push({ id: element.context.id, name: element.context.name, result: [element] });
        } else {
          this.listContextResults[index].result.push(element);
        }
      });
    });
  }

  /**
   * Saves the selected results in the local storge.
   */
  show(context: { id: number; name: string; result: Result[] }): void {
    this.state.setCurrentResults(context.result);
    this.state.setCurrentContextId(context.id.toString());
  }
}
