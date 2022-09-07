import {
  Component,
  ElementRef,
  Input,
  OnDestroy,
  ViewChild,
} from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
} from "@angular/forms";
import { MatDialogRef } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { Subscription } from "rxjs";
import { ImeraApiService } from "projects/imera-api/src/public-api";
import { StateService } from "../../Services/state.service";

/**
 * @Todo add update existig Context
 * @Todo Feedback is uploaded
 */

@Component({
  selector: "app-import",
  templateUrl: "./import.component.html",
  styleUrls: ["./import.component.scss"],
})
export class ImportComponent implements OnDestroy {
  @Input() update;
  form: FormGroup;
  successful = false;
  errorMessage: string;
  formDataImport: any = new FormData();
  private subscription: Subscription;

  @ViewChild("downloadLink")
  private downloadLink: ElementRef;

  constructor(
    private state: StateService,
    public dialogRef: MatDialogRef<ImportComponent>,
    public fb: FormBuilder,
    private imeraApiService: ImeraApiService,
    private router: Router
  ) {
    this.form = this.fb.group({
      fileOne: new FormControl("", [Validators.required]),
      fileTwo: new FormControl("", [Validators.required]),
    });
  }

  /**
   * Gets the selected files from the form.
   * @param event
   * @param input
   */
  uploadFile(event, input) {
    const file = (event.target as HTMLInputElement).files[0];
    if (input == "fileOne") {
      this.form.patchValue({
        fileOne: file,
      });
    } else {
      this.form.patchValue({
        fileTwo: file,
      });
    }
    this.form.get(input).updateValueAndValidity();
  }

  /**
   * Creates a new Context and imports the observation files.
   */
  submitForm() {
    // if(this.update){
    this.importObservations();
    this.subscription = this.imeraApiService
      .upload(this.formDataImport, this.state.currentContextId)
      .subscribe({
        next: (data) => {
          this.close(), this.router.navigate(["studie/befragung"]);
        },
        error: (error) => {
          if (error.status == "200") {
            this.close(), this.router.navigate(["studie/befragung"]);
          } else {
            this.errorMessage = error.error;
            console.log("error: ", error);
            console.log(error.status);

            console.error("There was an error!", error);
          }
        },
      });
  }

  /**
   * Imports the Observation to the corresponding Name of the new created Context
   */

  importObservations() {
    this.formDataImport.append("files", this.form.get("fileOne").value);
    this.formDataImport.append("files", this.form.get("fileTwo").value);
  }

  close(): void {
    this.dialogRef.close();
  }

  /**
   * Download example context or layout
   * @param element
   */
  async download(element): Promise<void> {
    let blob;
    let name;
    if (element == "layout") {
      blob = await this.imeraApiService.export(this.imeraApiService.LAYOUT_ID);
      name = "Layout.zip";
    } else {
      blob = await this.imeraApiService.export(this.imeraApiService.EXAMPLE_ID);
      name = "Beispielbefragung.zip";
    }
    const url = window.URL.createObjectURL(blob);
    const link = this.downloadLink.nativeElement;
    link.href = url;
    link.download = name;
    link.click();

    window.URL.revokeObjectURL(url);
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }
}
