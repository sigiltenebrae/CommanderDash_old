import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {ApiInterfaceService} from "./api-interface.service";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class NavbarDataService {

  private deckSortType = new BehaviorSubject('id');
  sharedDeckSort = this.deckSortType.asObservable();

  private currentUser = new BehaviorSubject({});
  currentUserData = this.currentUser.asObservable();

  constructor(private apiService:ApiInterfaceService) { }

  updateSort(sort_type: string) {
    this.deckSortType.next(sort_type);
  }

  setUser(user: any) {
    this.currentUser.next(user);
  }
}
