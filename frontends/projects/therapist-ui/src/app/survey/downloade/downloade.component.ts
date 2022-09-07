import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Context } from '@sstepkiz';
import { ImeraApiService } from 'projects/imera-api/src/public-api';

@Component({
  selector: 'app-downloade',
  templateUrl: './downloade.component.html',
  styleUrls: ['./downloade.component.scss']
})
export class DownloadeComponent {

  constructor(
    private imeraApiService: ImeraApiService,
    public dialogRef: MatDialogRef<DownloadeComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { context: Context }) { }

    @ViewChild('downloadLink') private downloadLink: ElementRef;

    async downloade(element): Promise<void> {
      let blob;
      let name;
      if(element == "results"){
        blob = await this.imeraApiService.exportResult(this.data.context.id);
        name = 'Befragung' + this.data.context.name + 'Ergebnisse.csv';

      } else {
        blob = await this.imeraApiService.export(this.data.context.id);
        name = 'Befragung' + this.data.context.name + '.zip';
      }
      const url = window.URL.createObjectURL(blob);
      const link = this.downloadLink.nativeElement;
      link.href = url;
      link.download = name;
      link.click();
  
      window.URL.revokeObjectURL(url);
  
    }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
