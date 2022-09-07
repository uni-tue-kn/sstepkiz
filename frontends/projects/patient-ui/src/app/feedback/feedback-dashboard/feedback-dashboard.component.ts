import { Component } from "@angular/core";
import { ComplaintDegree } from "@sstepkiz";
import { ImeraApiService } from "projects/imera-api/src/public-api";
import { Result } from "@sstepkiz";
import { ResultPoint } from "@sstepkiz";
import { UserInformationService } from "../../services/user-information.service";
import { HotToastService } from "@ngneat/hot-toast";

import { FeedbackService } from "../feedback.service";

@Component({
  selector: "app-feedback-dashboard",
  styleUrls: ["./feedback-dashboard.component.scss"],
  templateUrl: "./feedback-dashboard.component.html",
})
export class FeedbackDashboardComponent {
  constructor(
    private readonly feedbackService: FeedbackService,
    private imeraApiService: ImeraApiService,
    private userInfo: UserInformationService,
    private toast: HotToastService
  ) {}

  /**
   * Declares complaint degree enum for template.
   */
  ComplaintDegree = ComplaintDegree;

  show = false;

  resultpointSmily: ResultPoint = {
    observation: {
      id: this.imeraApiService.FEEDBACK_OBSERVATION_IDS[0],
    },
    option: {
      id: 2,
    },
  };
  resultpointText: ResultPoint = {
    observation: {
      id: this.imeraApiService.FEEDBACK_OBSERVATION_IDS[1],
    },
    textValue: "",
  };

  /**
   * Gets if component is sending a feedback.
   */
  get isSending(): boolean {
    return this.sendingDegree !== null;
  }

  /**
   * The degree that is currently sending.
   */
  sendingDegree: ComplaintDegree | null = null;

  /**
   * Initiates sending of complaint and visualizes process.
   * @param degree Degree of complaint.
   */
  // complain(degree: ComplaintDegree): void {
  //   this.sendingDegree = degree;
  //   this.feedbackService.sendComplaint(degree).finally(() => {
  //     this.sendingDegree = null;
  //   });
  // }

  send() {
    // BKU TODO Hier wird die observation ID aus dem ImeraService geladen.

    //fix:
    /**
     * 1. context in web ui anlegen mit "feedback + magic number"
     * 2. get all contexts
     * 3. filter auf contexts nach feedback + magic number
     * 4. getObservations by context -> feedback observation
     * 5. observation id nehmen und neues result object erzeugen
     *
     */

    let feedback: Result = new Result(
      //user
      { id: this.userInfo.user.id },
      //context
      {
        id: this.imeraApiService.FEEDBACK_ID,
        contextType: { id: 3, name: "Feedback" },
      },
      //resultpoints
      [this.resultpointSmily, this.resultpointText]
    );
    this.imeraApiService
      .postNewResult(feedback)
      .then((data) => {
        this.show = true;
        setTimeout(() => {
          this.show = false;
        }, 2000);
      })
      .catch((error) => {
        console.error(error);
        this.toast.error("Das hat leider nicht funktioniert! Tut uns leid!");
      });
    this.resultpointSmily.option.id = 2;
    this.resultpointText.textValue = "";
  }
}
