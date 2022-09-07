import {Injectable} from "@angular/core";
import {GameCategory as GameCategory} from "@sstepkiz";
import {UserInformationService} from "../services/user-information.service";

@Injectable({
  providedIn: "root",
})
export class GameService {
  constructor(private userInformationService: UserInformationService) {}

  requiredResultsFor1: number = 5;
  requiredResultsFor2: number = 12;
  requiredResultsFor3: number = 18;
  requiredResultsFor4: number = 27;
  requiredResultsFor5: number = 37;
  requiredResultsFor6: number = 48;
  requiredResultsFor7: number = 60;

  calcEtape(resultsNr: number): number {
    if (resultsNr < this.requiredResultsFor1) {
      return 0;
    }
    if (resultsNr < this.requiredResultsFor2) {
      return 1;
    }
    if (resultsNr < this.requiredResultsFor3) {
      return 2;
    }
    if (resultsNr < this.requiredResultsFor4) {
      return 3;
    }
    if (resultsNr < this.requiredResultsFor5) {
      return 4;
    }
    if (resultsNr < this.requiredResultsFor6) {
      return 5;
    }
    if (resultsNr < this.requiredResultsFor7) {
      return 6;
    } else {
      return 7;
    }
  }

  get maxEtape(): number {
    return 8;
  }

  async buyClothes(allCategorys: GameCategory[], coins: number) {
    await this.userInformationService.updateGameSheetAllData({
      purchasedClothes: allCategorys,
      coins,
    });
  }

  safeClothes(categorys: GameCategory[]) {
    this.userInformationService.updateGameSheetAllData({
      purchasedClothes: categorys,
    });
  }

  safeItems(categorys: GameCategory[]) {
    this.userInformationService.updateGameSheetAllData({
      entertMaps: categorys,
    });
  }

  async buyItems(categorys: GameCategory[], coins: number) {
    await this.userInformationService.updateGameSheetAllData({
      entertMaps: categorys,
      coins,
    });
  }
}
