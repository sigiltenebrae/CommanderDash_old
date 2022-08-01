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

  current_user: any = {};
  decks: any = [];
  colors: any = {};

  constructor(private apiService:ApiInterfaceService, private navDataService: NavbarDataService) {
    this.current_user = this.navDataService.getUser();
    this.navDataService.currentUserData.subscribe( cur_user => {
      this.current_user = cur_user;
      if (this.current_user.id) {
        this.loadPage();
        this.navDataService.sharedDeckSort.subscribe(sort_type => {
          this.sortDecks(sort_type);
        })
      }
    });
  }

  ngOnInit(): void {
    this.current_user = this.navDataService.getUser();
    this.loadPage();
  }

  loadPage() {
    this.getDecksForUser().subscribe(
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

  hasColor(check_deck, check_color) {
    if (check_deck && check_deck.commander) {
      if (this.colors && this.colors[check_deck.commander]) {
        if (this.colors[check_deck.commander].includes(check_color)) {
          return true;
        }
      } else {
        return false;
      }
      if (check_deck.partner_commander) {
        if (this.colors[check_deck.partner_commander] && this.colors[check_deck.partner_commander].includes(check_color)) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    }
    return false;
  }

  getDecks1() {
    return this.apiService.getApiDataFromServer(environment.decks_url);
  }

  getDecksForUser() {
    return this.apiService.getApiDataFromServer(environment.users_url + '/' + this.current_user.id);
  }

  getThemesForDeck(deck_id: number) {
    return this.apiService.getApiDataFromServer(environment.deck_themes_url + deck_id);
  }

  async loadDeckScryfallInfo() {
    for (let deck of this.decks) {
      let cur = await Scry.Cards.byName(deck.commander);
      // @ts-ignore
      this.colors[deck.commander] = cur.color_identity;
      if (deck.partner_commander) {
        let cur_2 = await Scry.Cards.byName(deck.partner_commander);
        this.colors[deck.partner_commander] = cur_2.color_identity;
      }
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
