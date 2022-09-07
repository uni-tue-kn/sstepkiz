import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Context } from "@sstepkiz";
import { Observable, of, BehaviorSubject } from "rxjs";
import { Observation } from "@sstepkiz";
import { Instrument } from "@sstepkiz";
import { ExtendObservations } from "@sstepkiz";
import { ContextSchedule } from "@sstepkiz";
import { Result } from "@sstepkiz";
import { ObservationDto } from "@sstepkiz";
import { CSVImportFilesDto } from "@sstepkiz";
import { User } from "@sstepkiz";
import { OptionsDto } from "@sstepkiz";
import { ImeraApiModuleConfiguration } from "../types/imera-api-module-configuration.class";

@Injectable({
  providedIn: "root",
})
export class ImeraApiService {
  constructor(private httpClient: HttpClient, private moduleConfig: ImeraApiModuleConfiguration) {}

  private url = this.moduleConfig.imeraServerRootUrl;
  private apiUrlImport: string = this.url + "/csv/importToContext/";
  private apiUrlExport: string = this.url + "/csv/context/";
  private apiUrlContexts: string = this.url + "/contexts";
  private apiUrlObservationsByContextId: string = this.url + "/observations/contexts/";
  private apiUrlContextSchedule: string = this.url + "/contextSchedules/";
  private apiUrlUser: string = this.url + "/users";
  private apiUrlResult: string = this.url + "/results";
  private apiUrlMe: string = this.url + "/me";
  private apiUrlContextJson: string = this.url + "/csv/importToContext/json/";

  /**
   * IDs of Contexts which are used for certain tasks
   */
  get FEEDBACK_ID(): number {
    return 15;
  }

  get FEEDBACK_CONTEXTTYP_ID(): number {
    return 3;
  }

  /*get TESTIMPORT_ID(): number {
    return 2;
  }*/

  get EXAMPLE_ID(): number {
    return 3;
  }

  get TIME_ID(): number {
    return 16;
  }

  get LAYOUT_ID(): number {
    return 27;
  }

  get FEEDBACK_OBSERVATION_IDS(): number[] {
    return [1, 2];
  }

  get TIME_OBSERVATION_IDS(): number[] {
    return [174, 173];
  }

  private contextListSource: any = new BehaviorSubject([]);
  contextList: Observable<Context[]> = this.contextListSource.asObservable();
  private observationsSource: any = new BehaviorSubject([]);
  observations: Observable<Observation[]> = this.observationsSource.asObservable();

  changeObservationToCSVImportFilesDto(observations: Observation[]): CSVImportFilesDto {
    const csvImportFilesDto: CSVImportFilesDto = new CSVImportFilesDto();
    observations.forEach((element) => {
      const observation = new ObservationDto();
      for (const key of Object.getOwnPropertyNames(observation)) {
        observation[key] = element[key];
      }

      observation.nextObservationNumber = element.nextObservation?.observationNumber;
      observation.observationType = "Frage";
      observation.topic1 = element.topic.name;
      observation.topic1Description = element.topic.descriptionText;
      csvImportFilesDto.csvObservationDtos.push(observation);
      if (element.dataType == "Option" || element.dataType == "Double" || element.dataType == "Integer") {
        element.options.forEach((option) => {
          const optionDto = new OptionsDto({
            observationNumber: element.observationNumber,
            textValue: option.textValue,
            numberValue: option.numberValue,
            nextObservationNumber: element.dataType != "Double" ? option.nextObservation.observationNumber : null,
          });
          csvImportFilesDto.csvOptionDtos.push(optionDto);
        });
      }
    });
    return csvImportFilesDto;
  }

  createContextSchedule(contextSchedule) {
    const headers = { "content-type": "application/json" };
    return this.httpClient.post<ContextSchedule>(this.apiUrlContextSchedule, contextSchedule, { headers });
  }

  async postNewResult(result: Result): Promise<Result> {
    const headers = { "content-type": "application/json" };
    return await this.httpClient.post<Result>(this.apiUrlResult, result, { headers }).toPromise();
  }

  async createNewContext(context: Context): Promise<Context> {
    const headers = { "content-type": "application/json" };
    return await this.httpClient.post<Context>(this.apiUrlContexts, context, { headers }).toPromise();
  }

  async createObservation(csvImportFilesDto: CSVImportFilesDto, contextId: number): Promise<CSVImportFilesDto> {
    const headers = { "content-type": "application/json" };
    //return await this.httpClient.post(this.apiUrlContextJson + contextId, csvImportFilesDto, { headers, responseType: "text" }).toPromise();
    return await this.httpClient.post<CSVImportFilesDto>(this.apiUrlContextJson + contextId, csvImportFilesDto, { headers }).toPromise();
  }

  /*async createObservation(csvImportFilesDto: CSVImportFilesDto, contextId: number): Promise<any> {
    const headers = { "content-type": "application/json" };
    return await this.httpClient.post(this.apiUrlContextJson + contextId, csvImportFilesDto, { headers, responseType: "text" }).toPromise();
  }*/

  /**
   *
   * @param contextId
   */
  async deleteContext(contextId: string) {
    return await this.httpClient.delete(this.apiUrlContexts + "/" + contextId).toPromise();
  }

  /**
   *
   * @param contextScheduleId
   */
  deleteContextSchedule(contextScheduleId: number) {
    return this.httpClient.delete(this.apiUrlContextSchedule + contextScheduleId, { responseType: "text" });
  }

  /**
   *
   * @param contextId
   */
  async deleteObservations(contextId: number) {
    return await this.httpClient.delete(this.apiUrlObservationsByContextId + contextId, { responseType: "text" }).toPromise();
  }

  /**
   * Extends the observations by class and type for layout purposes.
   * @param data
   */

  extendObservations(data: Observation[]): Observable<ExtendObservations[]> {
    console.log("extending observations...");
    const observations: ExtendObservations[] = [];
    data.forEach((observation) => {
      console.log("observation: ", observation);
      const extendedObservation: ExtendObservations = new ExtendObservations(observation);
      switch (extendedObservation.dataType) {
        case "Option": {
          extendedObservation.class = "form-check form-group";
          extendedObservation.options = extendedObservation.options.sort((a, b) => a.numberValue - b.numberValue);
          if (extendedObservation.flag_singlechoice) {
            extendedObservation.type = "radio";
          } else {
            extendedObservation.dataType = "Checkbox";
            extendedObservation.type = "checkbox";
          }
          extendedObservation.inputClass = "form-check-input";
          observations.push(extendedObservation);
          break;
        }
        case "String": {
          extendedObservation.type = "text";
          observations.push(extendedObservation);
          break;
        }
        case "Integer": {
          extendedObservation.options = extendedObservation.options.sort((a, b) => a.numberValue - b.numberValue);
          extendedObservation.dataType = "Option";
          extendedObservation.class = "form-check form-check-inline m-2 ";
          extendedObservation.type = "radio";
          extendedObservation.integer = true;
          extendedObservation.inputClass = "form-check-input m-2";
          observations.push(extendedObservation);
          break;
        }
        case "Double": {
          extendedObservation.class = "form-check form-check-inline";
          observations.push(extendedObservation);
          break;
        }
        case "Date": {
          extendedObservation.class = "form-check form-check-inline";
          extendedObservation.time = { hour: 0o0, minute: 0o0 };
          observations.push(extendedObservation);
          break;
        }
        default: {
          console.log("no match");
          break;
        }
      }
    });
    return of(observations.sort((a, b) => a.observationNumber - b.observationNumber));
  }

  async export(contextId: number): Promise<Blob> {
    const file = await this.httpClient.get<Blob>(this.apiUrlExport + contextId, { responseType: "blob" as "json" }).toPromise();
    return file;
  }

  async exportResult(contextId: number): Promise<Blob> {
    const file = await this.httpClient.get<Blob>(this.apiUrlExport + contextId + "/resultpoints", { responseType: "blob" as "json" }).toPromise();
    return file;
  }

  /**
   *
   * @param contextScheduleId
   */
  getContextScheduleById(contextScheduleId: string): Observable<ContextSchedule> {
    return this.httpClient.get<ContextSchedule>(this.apiUrlContextSchedule + contextScheduleId);
  }

  getContextSchedulesByUserId(userId: string): Observable<ContextSchedule[]> {
    return this.httpClient.get<ContextSchedule[]>(this.apiUrlUser + "/" + userId + "/contextSchedules");
  }

  getContextSchedulesByContext(contextId: string): Observable<ContextSchedule[]> {
    return this.httpClient.get<ContextSchedule[]>(this.apiUrlContexts + "/" + contextId + "/contextSchedules");
  }

  async getContextSchedulesByContextNew(contextId: string): Promise<ContextSchedule[]> {
    return await this.httpClient.get<ContextSchedule[]>(this.apiUrlContexts + "/" + contextId + "/contextSchedules").toPromise();
  }

  async getUserContextSchedules(): Promise<ContextSchedule[]> {
    return await this.httpClient.get<ContextSchedule[]>(this.apiUrlMe + "/contextSchedules").toPromise();
  }

  async getMe(): Promise<User> {
    return await this.httpClient.get<User>(this.apiUrlMe).toPromise();
  }

  async getResult(userId: string): Promise<Result[]> {
    return await this.httpClient.get<Result[]>(this.apiUrlResult + "/user/" + userId).toPromise();
  }

  async getUserResult(): Promise<Result[]> {
    return await this.httpClient.get<Result[]>(this.apiUrlMe + "/results").toPromise();
  }

  /**
   * Get Results without Feedback
   * @returns
   */
  async getFilteredResult(): Promise<Result[]> {
    let results = await this.getUserResult();
    if (results) {
      return results.filter((result) => result.context.contextType.id != this.FEEDBACK_CONTEXTTYP_ID);
    }
    return [];
  }

  /**
   * Gets all surveys in a study.
   * @return List of contexts
   */
  getListOfContexts(): Observable<Context[]> {
    return this.httpClient.get<Context[]>(this.apiUrlContexts);
  }

  /**
   * Gets the question of survey by survey id.
   * @param contextId
   * @return List of questions
   */
  getObservationsByContextId(contextId: string): Observable<Observation[]> {
    return this.httpClient.get<Observation[]>(this.apiUrlObservationsByContextId + contextId);
  }

  /**
   * Gets the patients
   */

  getUsers(): User[] {
    const users = [];
    this.httpClient.get<User[]>(this.apiUrlUser).subscribe((data) => {
      const allUsers = data;
      let onlyRoleUser = allUsers.filter((user) => user.roles.some((elem) => elem.name == "USER"));
      users.push(...onlyRoleUser);
    });
    return users;
  }

  loadAllUsers(): Observable<User[]> {
    return this.httpClient.get<User[]>(this.apiUrlUser);
  }

  /**
   * Sorts the topics of the questions (Observations) into an array of instruments.
   * @param observations
   */

  getInstruments(observations: any[]): Instrument[] {
    const instruments: Instrument[] = [];
    observations.forEach((observation) => {
      const topicIndex = instruments.findIndex(({ id }) => id === observation.topic.id);
      if (topicIndex == -1 && observation.topic !== null && observation.topic !== undefined) {
        instruments.push({ id: observation.topic.id, name: observation.topic.name, descriptionText: observation.topic.descriptionText });
      }
    });

    return instruments;
  }

  get TIME_MARKER_CONTEXT_ID(): number {
    return 39;
  }

  get TIME_MARKER_OBSERVATION_ID(): number {
    return 358;
  }

  loadContextList(): void {
    this.getListOfContexts().subscribe(
      (data) => {
        this.contextListSource.next(data);
      },
      (error) => console.log(error)
    );
  }

  loadObservations(contextId): void {
    this.getObservationsByContextId(contextId).subscribe(
      (data) => {
        this.observationsSource.next(data);
      },
      (error) => console.log(error)
    );
  }

  upload(formData: any, id: string): any {
    return this.httpClient.post(this.apiUrlImport + id, formData);
  }

  async updateContext(context: Context) {
    const headers = { "content-type": "application/json" };
    return await this.httpClient.put(this.apiUrlContexts + "/" + context.id, context, { headers }).toPromise();
  }
}
