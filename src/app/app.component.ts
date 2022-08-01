import { Component, OnInit } from '@angular/core';
import {ApiInterfaceService} from "./services/api-interface.service";
import {NavbarDataService} from "./services/navbar-data.service";
import {debounceTime, map, Observable, OperatorFunction} from "rxjs";
import * as Scry from "scryfall-sdk";
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";
import {environment} from "../environments/environment";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'CommanderDash';
  users: any = [];
  current_user: any = "";

  public current_deck: any;
  all_decks: any[] = [];
  deck_colors: any = {};
  current_component = "";

  public commanderNavCollapsed = true;

  constructor(private router: Router, private route: ActivatedRoute, private apiService:ApiInterfaceService, private navDataService: NavbarDataService) {
    this.navDataService.currentUserData.subscribe( cur_user => {
      this.current_user = cur_user;
    });
    this.loadPage();
  }

  ngOnInit(): void {
    this.loadPage();
  }

  loadPage() {
    this.getAllUsers().subscribe(
      (resp) => {
        this.users = resp;
        if(this.users && this.users.length > 0) {
          this.changeUser(this.users[0]);
        }
      }
    );
    this.getAllDecks().subscribe(
      (response:any) => {
        this.all_decks = response;
        this.all_decks.sort((a, b) => (a.name > b.name) ? 1 : -1);
        this.loadDeckScryfallInfo().then(r => {});
      }
    );
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (this.router.url.match('decks\/\d*')) {
          let deck_id = this.router.url.substring(7);
          if(Number(deck_id) > -1) {
            this.current_component = 'deck_edit'
          }
          else {
            this.current_component = 'new_deck'
          }
        }
        else {
          this.current_component = this.router.url;
          console.log(this.router.url);
        }
      }
    });
  }

  getAllUsers() {
    return this.apiService.getApiDataFromServer(environment.users_url);
  }

  getAllDecks() {
    return this.apiService.getApiDataFromServer(environment.decks_url);
  }

  async loadDeckScryfallInfo() {
    for (let deck of this.all_decks) {
      let cur = await Scry.Cards.byName(deck.commander);
      // @ts-ignore
      this.deck_colors[deck.commander] = cur.color_identity;
    }
  }

  deck_search: OperatorFunction<string, readonly any[]> = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      map(term => term === '' ? this.all_decks
        : this.all_decks.filter(v => String(v.friendly_name + ' - ' + v.commander).toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
    );

  deck_formatter = (x: any) => String(x.friendly_name + ' - ' + x.commander);

  searchDeck() {
    if (this.current_deck) {
      this.router.navigate(['/decks', this.current_deck.id]);
    }
  }

  deckViewerChangeSort(sort_type: string) {
    this.navDataService.updateSort(sort_type);
  }

  changeUser(user_obj: any) {
    this.navDataService.setUser(user_obj);
  }
}
