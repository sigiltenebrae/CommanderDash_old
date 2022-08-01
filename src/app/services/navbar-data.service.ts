import { Injectable } from '@angular/core';
import {BehaviorSubject, Subject} from 'rxjs';
import {ApiInterfaceService} from "./api-interface.service";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class NavbarDataService {

  private deckSortType = new BehaviorSubject('id');
  sharedDeckSort = this.deckSortType.asObservable();

  private currentUser = new Subject();
  currentUserData = this.currentUser.asObservable();
  currentUserNum = 1;

  constructor(private apiService:ApiInterfaceService) { }

  updateSort(sort_type: string) {
    this.deckSortType.next(sort_type);
  }

  getUser() {
    return this.currentUserNum;
  }

  setUser(user: any) {
    this.currentUserNum = user;
    this.currentUser.next(user);
  }
}
