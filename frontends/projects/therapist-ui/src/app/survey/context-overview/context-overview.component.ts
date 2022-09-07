import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {Context} from "@sstepkiz";
import {DeleteContextComponent} from "../../page/delete/delete-context/delete-context.component";
import {ImeraApiService} from "projects/imera-api/src/public-api";
import {StateService} from "../../Services/state.service";
import {Subscription} from "rxjs";
import {DownloadeComponent} from "../downloade/downloade.component";
import {HotToastService} from "@ngneat/hot-toast";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort, MatSortable} from "@angular/material/sort";
import dayjs from "dayjs";

@Component({
  selector: "app-context-overview",
  templateUrl: "./context-overview.component.html",
  styleUrls: ["./context-overview.component.scss"],
})
export class ContextOverviewComponent implements OnInit, OnDestroy, AfterViewInit {
  isLoading = true;
  isInitialSort = true;

  routerLink = "/studie/befragung";
  newContextLink = "/studie/neue-befragung";
  listElements: Context[];
  subscriptions: Subscription[] = [];
  routerLinkBack: any = "";
  text: string;

  displayedColumns: string[] = ['name', 'created', 'actions'];
  contextDatSource = new MatTableDataSource<Context>();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  @ViewChild("downloadLink") private downloadLink: ElementRef;

  constructor(private state: StateService, private router: Router, private imeraApiService: ImeraApiService, public dialog: MatDialog, private toast: HotToastService) {}

  ngOnDestroy() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  ngOnInit(): void {
    this.imeraApiService.loadContextList();
    this.subscriptions.push(
      this.imeraApiService.contextList.subscribe(
        (data) => {
          this.contextDatSource.data = data.filter(
              (element) => element.contextType.name !== "Feedback" && element.id !== this.imeraApiService.LAYOUT_ID
          );
          this.isLoading = false;
        },
        (error) => console.log(error)
      )
    );
  }

  ngAfterViewInit() {
    this.contextDatSource.paginator = this.paginator;
    this.contextDatSource.sort = this.sort;
    if (this.isInitialSort) {
      this.sort.sort(({ id: 'created', start: 'desc'}) as MatSortable);
      this.isInitialSort = false;
    }
  }

  edit(element: Context): void {
    this.state.setCurrentContext(element);
    this.router.navigate([this.routerLink]);
  }

  openDialogDelete(id: string, event): void {
    event.stopPropagation();

    const dialogRef = this.dialog.open(DeleteContextComponent, {
      width: "500px",
      data: { contextId: id },
    });
    this.subscriptions.push(
      dialogRef.afterClosed().subscribe(async (result) => {
        if (result.sucessfull) {
          this.toast.success("Löschen Erfolgreich");
          this.imeraApiService.loadContextList();
        }
      })
    );
  }

  openDialogDownload(context: Context, event): void {
    event.stopPropagation();
    const dialogRef = this.dialog.open(DownloadeComponent, {
      width: "500px",
      data: { context },
    });
  }

  update(context: Context, event) {
    event.stopPropagation();

    context.published = !context.published;
    this.imeraApiService
      .updateContext(context)
      .then((result) => {
        this.imeraApiService.loadContextList();
      })
      .catch((err) => {
        console.log(err);
        console.log("updating context error: ", err);
        if (err.status === 200) {
          this.imeraApiService.loadContextList();
        }
      });
  }

  formatDate(dateString: string): string {
    return dayjs(dateString).format("DD.MM.YYYY - HH:mm");

  }
}
