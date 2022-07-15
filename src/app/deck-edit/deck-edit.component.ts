import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {ApiInterfaceService} from "../services/api-interface.service";
import * as Scry from "scryfall-sdk";

@Component({
  selector: 'app-deck-edit',
  templateUrl: './deck-edit.component.html',
  styleUrls: ['./deck-edit.component.scss']
})
export class DeckEditComponent implements OnInit {

  deck: any = null;
  deckId: any = null;
  decks_url = 'http://localhost:3000/decks';
  themes_url = 'http://localhost:3000/deckthemesname/';
  all_themes_url = 'http://localhost:3000/themes';
  colors: any = {};
  images: any = {};
  all_themes: {id: number, name: string}[] = [];
  deleting = false;

  constructor(private route: ActivatedRoute, private apiService:ApiInterfaceService) { }

  ngOnInit(): void {
    const routeParams = this.route.snapshot.paramMap;
    this.deckId = Number(routeParams.get('deckId'));
    this.loadPage();
  }

  getDeck() {
    console.log(this.decks_url + '/' + this.deckId);
    return this.apiService.getApiDataFromServer(this.decks_url + '/' + this.deckId);
  }

  getThemesForDeck(deck_id: number) {

    return this.apiService.getApiDataFromServer(this.themes_url + deck_id);
  }

  async loadDeckScryfallInfo() {

    let cur = await Scry.Cards.byName(this.deck.commander);
    let cur_prints = await cur.getPrints();
    // @ts-ignore
    this.images[this.deck.commander] = cur_prints[0].image_uris?.png;
    this.colors[this.deck.commander] = cur.color_identity;

  }

  getAllThemes() {
    return this.apiService.getApiDataFromServer(this.all_themes_url);
  }

  loadPage() {
    this.getDeck().subscribe(
      (response) => {
        this.deck = response;
        this.getThemesForDeck(this.deck.id).subscribe(
          (resp) => {
            this.deck.themes = resp;
            this.deck.deleteThemes = [];
          });
        this.loadDeckScryfallInfo().then(r => {});
      }
    );
    this.getAllThemes().subscribe(
      (response:any) => {
        this.all_themes = response;
        this.all_themes.sort((a, b) => (a.name > b.name) ? 1 : -1);
      }
    );
    this.deleting = false;
  }
}
