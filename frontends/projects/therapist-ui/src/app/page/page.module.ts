import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { HeaderComponent } from "./header/header.component";
import { PageNotFoundComponent } from "./page-not-found/page-not-found.component";
import { SelectionPageComponent } from "./selection-page/selection-page.component";
import { TitleComponent } from "./title/title.component";
import { AppRoutingModule } from "../app-routing.module";
import { AuthModule } from "projects/auth/src/public-api";
import { DeleteDialogComponent } from "./delete/delet.component";
import { DeleteContextComponent } from "./delete/delete-context/delete-context.component";
import { ErrorComponent } from "./error/error.component";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatIconModule } from "@angular/material/icon";

@NgModule({
  declarations: [HeaderComponent, PageNotFoundComponent, SelectionPageComponent, TitleComponent, DeleteDialogComponent, DeleteContextComponent, ErrorComponent],
  exports: [HeaderComponent, PageNotFoundComponent, SelectionPageComponent, TitleComponent, ErrorComponent, DeleteDialogComponent, DeleteContextComponent],
  imports: [CommonModule, AppRoutingModule, AuthModule, MatProgressSpinnerModule, MatIconModule],
})
export class PageModule {}
