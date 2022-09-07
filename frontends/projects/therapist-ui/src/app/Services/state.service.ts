import { Injectable } from '@angular/core';
import { Study, Instrument, Observation, Context, User, Result } from '@sstepkiz';

@Injectable({
  providedIn: 'root'
})
export class StateService {

  public STUDY: Study = {
    title: 'SSteP-KiZ',
    text: 'Willkommen in der SSteP-KiZ Studie, hier können Sie die Befragungen anpassen, sowie mit den Patienten interagieren'
  };

  get currentInstrument(): Instrument {
    return JSON.parse(window.localStorage.getItem('instrument'));
  }

  get currentContextId(): string {
    return window.localStorage.getItem('contextId');
  }

  get currentContext(): Context {
    return JSON.parse(window.localStorage.getItem('context'));
  }

  get currentObservation(): Observation {
    return JSON.parse(window.localStorage.getItem('observation'));
  }

  get observations(): Observation[] {
    return JSON.parse(window.localStorage.getItem('observations'));
  }

  get instruments(): Instrument[] {
    return JSON.parse(window.localStorage.getItem('instruments'));
  }

  get currentUser(): User {
    return JSON.parse(window.localStorage.getItem('user'));
  }

  get currentResults(): Result[] {
    return JSON.parse(window.localStorage.getItem('results'));
  }

  setInstruments(instruments: Instrument[]): void{
    window.localStorage.setItem('instruments', JSON.stringify(instruments));
  }

  setCurrentInstrument(instrument: Instrument) {
    window.localStorage.setItem('instrument', JSON.stringify(instrument));
  }

  setCurrentObservation(observation: Observation) {
    window.localStorage.setItem('observation', JSON.stringify(observation));
  }

  setCurrentContext(context: Context): void {
    window.localStorage.setItem('context', JSON.stringify(context));
    window.localStorage.setItem('contextId', JSON.stringify(context.id));
  }

  setObservations(observations: Observation[]){
    window.localStorage.setItem('observations', JSON.stringify(observations));
  }

  setCurrentContextId(contextId: string): void {
    window.localStorage.setItem('contextId', contextId);
  }

  setCurrentUser(user: User): void{
    window.localStorage.setItem('user', JSON.stringify(user));
  }

  setCurrentResults(result: Result[]) {
    window.localStorage.setItem('results', JSON.stringify(result));
  }

  removeCurrentResults(){
    window.localStorage.removeItem('results');
  }

  removeCurrentInstrument(){
    window.localStorage.removeItem('instrument');
  }
}
