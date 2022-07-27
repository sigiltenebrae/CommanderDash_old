import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import {ApiInterfaceService} from "../services/api-interface.service";
import {NavbarDataService} from "../services/navbar-data.service";
import * as Scry from "scryfall-sdk";
import {environment} from "../../environments/environment";

@Component({
  selector: 'app-deck-viewer',
  templateUrl: './deck-viewer.component.html',
  styleUrls: ['./deck-viewer.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DeckViewerComponent implements OnInit {

  decks: any = [];
  colors: any = {};

  constructor(private apiService:ApiInterfaceService, private navDataService: NavbarDataService) { }

  ngOnInit(): void {
    this.loadPage();
    this.navDataService.sharedDeckSort.subscribe(sort_type => {
      this.sortDecks(sort_type);
    })
  }

  loadPage() {
    this.getDecks().subscribe(
      (response) => {
        this.decks = response;
        for (let deck of this.decks) {
          this.getThemesForDeck(deck.id).subscribe(
            (resp) => {
              deck.themes = resp;
              deck.deleteThemes = [];
            });
        }
        this.loadDeckScryfallInfo().then(r => {});
      }
    );
  }

  getDecks() {
    console.log(environment.decks_url);
    return this.apiService.getApiDataFromServer(environment.decks_url);
  }

  getThemesForDeck(deck_id: number) {
    return this.apiService.getApiDataFromServer(environment.deck_themes_url + deck_id);
  }

  async loadDeckScryfallInfo() {
    for (let deck of this.decks) {
      let cur = await Scry.Cards.byName(deck.commander);
      // @ts-ignore
      this.colors[deck.commander] = cur.color_identity;
    }
  }

  sortDecks(sort_type: string) {
    if (this.decks) {
      if (sort_type === 'Commander') {
        this.decks.sort((a, b) => (a.commander > b.commander) ? 1 : -1);
      }
      else if (sort_type === 'Deck Name') {
        this.decks.sort((a, b) => (a.friendly_name > b.friendly_name) ? 1 : -1);
      }
      else if (sort_type === 'id') {
        this.decks.sort((a, b) => (a.id > b.id) ? 1 : -1);
      }
    }
  }
}
