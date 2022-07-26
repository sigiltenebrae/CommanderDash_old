import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import {ApiInterfaceService} from "../services/api-interface.service";
import * as Scry from "scryfall-sdk";
import {NgbOffcanvas} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-deck-viewer',
  templateUrl: './deck-viewer.component.html',
  styleUrls: ['./deck-viewer.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DeckViewerComponent implements OnInit {

  decks_url = 'http://localhost:3000/decks';
  themes_url = 'http://localhost:3000/deckthemesname/';
  decks: any = {} as any;
  delete_themes: any = [];
  colors: any = {};

  constructor(private apiService:ApiInterfaceService, private offcanvas: NgbOffcanvas) { }

  ngOnInit(): void {
    this.loadPage();
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
    return this.apiService.getApiDataFromServer(this.decks_url);
  }

  getThemesForDeck(deck_id: number) {
    return this.apiService.getApiDataFromServer(this.themes_url + deck_id);
  }

  async loadDeckScryfallInfo() {
    for (let deck of this.decks) {
      let cur = await Scry.Cards.byName(deck.commander);
      // @ts-ignore
      this.colors[deck.commander] = cur.color_identity;
    }
  }
}
