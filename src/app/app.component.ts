import { Component, OnInit } from '@angular/core';
import {ApiInterfaceService} from "./services/api-interface.service";
import {debounceTime, map, Observable, OperatorFunction} from "rxjs";
import * as Scry from "scryfall-sdk";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'CommanderDash';

  decks_url = 'http://localhost:3000/decks';

  public current_deck: any;
  all_decks: any[] = [];
  deck_colors: any = {};

  public commanderNavCollapsed = true;

  constructor(private apiService:ApiInterfaceService) {
  }

  ngOnInit(): void {
    this.loadPage();
  }

  loadPage() {
    this.getAllDecks().subscribe(
      (response:any) => {
        this.all_decks = response;
        this.all_decks.sort((a, b) => (a.name > b.name) ? 1 : -1);
        this.loadDeckScryfallInfo().then(r => {});
      }
    );
  }

  getAllDecks() {
    return this.apiService.getApiDataFromServer(this.decks_url);
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
    return;
  }
}
