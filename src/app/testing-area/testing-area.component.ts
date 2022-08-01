import { Component, OnInit } from '@angular/core';
import * as Scry from "scryfall-sdk";
import {environment} from "../../environments/environment";
import {ApiInterfaceService} from "../services/api-interface.service";

@Component({
  selector: 'app-testing-area',
  templateUrl: './testing-area.component.html',
  styleUrls: ['./testing-area.component.scss']
})
export class TestingAreaComponent implements OnInit {

  deck: any = null;
  colors: any = {};
  has_partner = {};
  deck_id = 89;

  async loadDeckScryfallInfo() {
    let cur = await Scry.Cards.byName(this.deck.commander);
    // @ts-ignore
    this.colors[this.deck.commander] = cur.color_identity;
    if (this.deck.partner_commander) {
      let cur_2 = await Scry.Cards.byName(this.deck.partner_commander);
      this.colors[this.deck.partner_commander] = cur_2.color_identity;
    }
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

  getThemesForDeck() {
    return this.apiService.getApiDataFromServer(environment.deck_themes_url + this.deck_id);
  }

  getDeck() {
    return this.apiService.getApiDataFromServer(environment.decks_url + '/' + this.deck_id);
  }

  loadPage() {
    this.getDeck().subscribe(
      (response) => {
        this.deck = response;
        this.deck.image_url_back = "";
        this.deck.commander_new = this.deck.commander;
        this.deck.partner_new = this.deck.partner_commander;
        if (this.deck.partner_commander) {
          this.has_partner = true;
        }
        this.loadDeckScryfallInfo().then(r => {});
        this.getThemesForDeck().subscribe(
          (resp) => {
            this.deck.themes = resp;
            this.deck.deleteThemes = [];
          });
      }
    )
  }

  constructor(private apiService:ApiInterfaceService) { }

  ngOnInit(): void {
    this.loadPage();
  }

}
