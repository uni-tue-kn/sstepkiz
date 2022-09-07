import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AvatarComponent } from './avatar/avatar.component';
import { GameWardorbeComponent } from './game-wardorbe/game-wardorbe.component';
import { GameOverviewComponent } from './game-overview/game-overview.component';
import { GameMapComponent } from './game-map/game-map.component';
import { GameWardrobeMenuComponent } from './game-wardrobe-menu/game-wardrobe-menu.component';
import { GameHeaderComponent} from './game-header/game-header.component';
import { AppRoutingModule } from '../app-routing.module';
import { NewEtapeComponent } from './new-etape/new-etape.component';
import { MatDialogModule } from "@angular/material/dialog";
import { NorthAmerikaPlaceDialogComponent } from './game-map/north-amerika-place-dialog/north-amerika-place-dialog.component';

@NgModule({
  declarations: [GameWardorbeComponent,
    AvatarComponent,
    GameHeaderComponent,
    GameMapComponent,
    GameOverviewComponent,
    GameWardrobeMenuComponent,
    NewEtapeComponent,
    NorthAmerikaPlaceDialogComponent,
  ],
  imports: [
    AppRoutingModule,
    CommonModule,
    DragDropModule,
    NgbModule,
      MatDialogModule
  ],
  exports: [
    GameOverviewComponent,
    GameHeaderComponent,
    NewEtapeComponent,
  ],
})
export class GameModule { }
