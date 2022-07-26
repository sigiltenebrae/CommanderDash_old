import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import {ApiInterfaceService} from "../services/api-interface.service";
import * as Scry from "scryfall-sdk";
import {debounceTime, distinctUntilChanged, map, Observable, OperatorFunction, switchMap, tap} from "rxjs";
import {NgbModal, NgbOffcanvas} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-deck-viewer',
  templateUrl: './deck-viewer.component.html',
  styleUrls: ['./deck-viewer.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DeckViewerComponent implements OnInit {

  decks_url = 'http://localhost:3000/decks';
  themes_url = 'http://localhost:3000/deckthemesname/';
  all_themes_url = 'http://localhost:3000/themes';
  decks: any = {} as any;
  all_themes: {id: number, name: string}[] = [];
  delete_themes: any = [];
  temp_theme: any;
  cur_deck: any = null;
  images: any = {};
  colors: any = {};
  cards: string[] = [];
  creating = false;
  searching = false;
  searchFailed = false;
  currentImages = [];
  current_image = -1;
  commander_tab = '';
  new_deck = false;
  deleting = false;

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
    this.getAllThemes().subscribe(
      (response:any) => {
        this.all_themes = response;
        this.all_themes.sort((a, b) => (a.name > b.name) ? 1 : -1);
      }
    );
    this.deleting = false;
  }

  getDecks() {
    return this.apiService.getApiDataFromServer(this.decks_url);
  }

  getThemesForDeck(deck_id: number) {
    return this.apiService.getApiDataFromServer(this.themes_url + deck_id);
  }

  getAllThemes() {
    return this.apiService.getApiDataFromServer(this.all_themes_url);
  }

  async loadDeckScryfallInfo() {
    for (let deck of this.decks) {
      let cur = await Scry.Cards.byName(deck.commander);
      let cur_prints = await cur.getPrints();
      // @ts-ignore
      this.images[deck.commander] = cur_prints[0].image_uris?.png;
      this.colors[deck.commander] = cur.color_identity;
    }
  }

  setDeck(deck: any) {
    this.cur_deck = JSON.parse(JSON.stringify(deck));
  }

  async getImages() {
    if (this.cur_deck.commander !== "") {
      this.currentImages = [];
      if (this.cur_deck.image_url_back !== "") {
        // @ts-ignore
        this.currentImages.push(this.cur_deck.image_url_back);
      }
      let cur = await Scry.Cards.byName(this.cur_deck.commander);
      let cur_prints = await cur.getPrints();
      for (let print of cur_prints) {
        let temp_im: string | undefined = print.image_uris?.png;
        if (temp_im) {
          // @ts-ignore
          this.currentImages.push(temp_im);
        }
      }
      this.current_image = 0;
      this.cur_deck.image_url = this.currentImages[this.current_image];
    }

  }

  openDeckEdit(deck: any) {
    if (deck == null) {
      this.new_deck = true;
      this.cur_deck = {};
      this.cur_deck.commander = "";
      this.cur_deck.friendly_name = "";
      this.cur_deck.url = "";
      this.cur_deck.image_url = "";
      this.cur_deck.image_url_back = "";
      this.cur_deck.build_rating = 0;
      this.cur_deck.play_rating = 0;
      this.cur_deck.win_rating = 0;
      this.cur_deck.themes = [];
      this.cur_deck.deleteThemes = [];
      this.cur_deck.active = true;
      this.creating = true;
    }
    else {
      this.new_deck = false;
      this.setDeck(deck);
      if (deck.image_url !== "") {
        this.current_image = 0;
        // @ts-ignore
        this.currentImages.push(deck.image_url);
      }
      this.cur_deck.image_url_back = deck.image_url;
      this.getImages();
    }
    //this.modalService.open(deckEdit, { centered: true, backdrop: false, size: 'xl'} );
    this.commander_tab = 'edit';
    this.deleting=false;
  }

  closeDeckEdit() {
    //this.modalService.dismissAll();
    this.cur_deck=null;
    this.temp_theme=null;
    this.currentImages = [];
    this.commander_tab = '';
    this.deleting = false;
    this.new_deck = false;
  }

  removeThemeFromDeck(theme: any) {
    const themeIndex = this.cur_deck.themes.indexOf(theme);
    if (themeIndex > -1) {
      this.cur_deck.themes.splice(themeIndex, 1);
      this.cur_deck.deleteThemes.push(theme);
    }
  }

  addThemeToDeck() {
    if (this.temp_theme != null) {
      let themeIndex = -1;
      for (let theme of this.cur_deck.themes) {
        if (theme.name === this.temp_theme.name) {
          themeIndex = 1;
        }
      }
      if (themeIndex == -1) {
        this.cur_deck.themes.push(this.temp_theme);
        this.temp_theme = null;
      }
    }
  }
}
