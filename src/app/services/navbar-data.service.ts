import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NavbarDataService {

  private deckSortType = new BehaviorSubject('id');
  sharedDeckSort = this.deckSortType.asObservable();

  constructor() { }

  updateSort(sort_type: string) {
    this.deckSortType.next(sort_type);
  }
}
