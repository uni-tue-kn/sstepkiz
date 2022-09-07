import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Result, UserGameSheet, UserGameSheetUpdateData } from "@sstepkiz";
import { environment } from "projects/patient-ui/src/environments/environment";
import { BehaviorSubject } from "rxjs";
import { ImeraApiService } from "projects/imera-api/src/public-api";
import {
  ConsoleLogger,
  LogicalFileSystem,
} from "@angular/compiler-cli/private/localize";
import { HotToastService } from "@ngneat/hot-toast";

@Injectable({
  providedIn: "root",
})
export class UserInformationService {
  private EMPTYSHEET: UserGameSheet = {
    avatarName: "",
    currentTitle: "",
    coins: 0,
    highestMap: 0,
    titles: [],
    purchasedClothes: [],
    entertMaps: [],
    activeClothes: [],
  };

  private DEBUGGSHEET: UserGameSheet = {
    avatarName: "Test",
    currentTitle: "Test",
    coins: 2000,
    highestMap: 0,
    titles: [],
    purchasedClothes: [],
    entertMaps: [],
    activeClothes: [],
  };

  private DEBUGG: boolean = true;

  private userGameSheetSource: any = new BehaviorSubject(this.EMPTYSHEET);
  userGameSheet = this.userGameSheetSource.asObservable();
  private apiUpdateUserSheetData: string =
    environment.urls.gameApi + "/update-core-data/";
  private apiUpdateUser: string = environment.urls.gameApi + "/update-all/";
  private apiUpdateMap: string = environment.urls.gameApi + "/update-map/";
  private apiNewMap: string = environment.urls.gameApi + "/new-map/";
  private contextResults: Result[];

  constructor(
    private http: HttpClient,
    private imeraApi: ImeraApiService,
    private toast: HotToastService
  ) {}

  private getUserGameSheetBackend(): any {
    return this.http.get<UserGameSheet>(environment.urls.gameApi);
  }

  loadUserGameSheet() {
    this.getUserGameSheetBackend().subscribe(
      (data) => {
        this.userGameSheetSource.next(data);
      },
      (error) => {
        console.log("Error in Game Server, empty data");
        this.toast.error("Das hat leider nicht funktioniert! Tut uns leid!");
        //Only for debugg
        console.log(error);
        if (this.DEBUGG) {
          this.userGameSheetSource.next(this.DEBUGGSHEET);
        }
      }
    );
  }

  /**
   * Only updates the values in User_Game_Sheet not the dependencies.
   * Use for update: Name, currentTitle, highestMap, coins
   * @param toUpdateValue
   */
  updateGameSheetCoreData(toUpdateValue: UserGameSheetUpdateData, callback?) {
    const headers = { "content-type": "application/json" };
    const body = JSON.stringify(toUpdateValue);
    this.http.put(this.apiUpdateUserSheetData, body, { headers }).subscribe(
      (response) => {
        if (callback) {
          callback();
        }
        this.loadUserGameSheet();
      },
      (error) => {
        console.log(error);
        this.toast.error("Das hat leider nicht funktioniert! Tut uns leid!");
        if (callback) {
          callback();
        }
      }
    );
  }

  /**
   * Update User_Game_Sheet and dependencies
   * Use for update: Clothes, Maps, Titles, activeClothes
   * @param toUpdateValue
   */
  async updateGameSheetAllData(toUpdateValue: UserGameSheet) {
    console.log("updating all data: ", toUpdateValue);
    const headers = { "content-type": "application/json" };
    const body = JSON.stringify(toUpdateValue);

    await this.http.put(this.apiUpdateUser, body, { headers }).subscribe(
      (response) => {
        this.loadUserGameSheet();
      },
      (error) => {
        console.log(error);
        this.toast.error("Das hat leider nicht funktioniert! Tut uns leid!");
      }
    );
  }

  async newMap(map: number) {
    const headers = { "content-type": "application/json" };
    const body = JSON.stringify(map);

    await this.http.put(this.apiNewMap, body, { headers }).subscribe(
      (response) => {
        this.loadUserGameSheet();
      },
      (error) => console.log(error)
    );
  }

  setUser() {
    this.imeraApi.getMe().then((user) => {
      sessionStorage.setItem("user", JSON.stringify(user));
    });
  }

  get user() {
    return JSON.parse(sessionStorage.getItem("user"));
  }

  setResults(results: Result[]) {
    this.contextResults = results;
    //sessionStorage.setItem("results", JSON.stringify(results));
  }

  get results(): Result[] {
    return this.contextResults;
    //return JSON.parse(sessionStorage.getItem("results"));
  }

  /** Tracks if a patient is making a exercise. */
  get startedExersice(): boolean {
    return JSON.parse(sessionStorage.getItem("started"));
  }

  /** Tracks if a patient is making a exercise. */
  startExersice(started: boolean) {
    sessionStorage.setItem("started", JSON.stringify(started));
  }

  test() {
    this.http.get(environment.urls.gameApi + "/test").subscribe(
      (response) => {
        console.log(response);
      },
      (error) => console.log(error)
    );
  }
}
