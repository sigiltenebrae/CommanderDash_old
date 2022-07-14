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

  constructor(private apiService:ApiInterfaceService, private modalService: NgbModal, private offcanvas: NgbOffcanvas) { }

  // @ts-ignore
  card_search: OperatorFunction<string, readonly string[]> = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => this.searching = true),
      // @ts-ignore
      switchMap(async term => {
        this.searching = true;
        return await Scry.Cards.autoCompleteName(term);
      }),
      tap(() => this.searching = false)
    );

  theme_search: OperatorFunction<string, readonly {id: number, name: string}[]> = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      map(term => term === '' ? []
        : this.all_themes.filter(v => v.name.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
    );
  theme_formatter = (x: {name: string}) => x.name;

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

  upImage() {
    if (this.current_image < this.currentImages.length - 1) {
      this.current_image ++;
    }
    else {
      this.current_image = 0;
    }
    this.cur_deck.image_url = this.currentImages[this.current_image];
  }

  downImage() {
    if (this.current_image > 0) {
      this.current_image --;
    }
    else {
      this.current_image = this.currentImages.length - 1;
    }
    this.cur_deck.image_url = this.currentImages[this.current_image];
  }

  updateDeck() {
    if (!this.creating) {
      if (this.cur_deck) {
        this.apiService.putApiDataToServer(this.decks_url + "/" + this.cur_deck.id, JSON.stringify(this.cur_deck)).subscribe(
          (response) => {
            this.loadPage();
          },
          (error)=> {
            this.loadPage();
          });
      }
    }
    else {
      if (this.cur_deck.commander && this.cur_deck.commander !== "") {
        if (this.cur_deck.friendly_name && this.cur_deck.friendly_name !== "") {
          this.apiService.postApiDataToServer(this.decks_url, JSON.stringify(this.cur_deck)).subscribe(
            (response) => {
              this.creating = false;
              this.closeDeckEdit();
              this.loadPage();
            }, (error) => {
              this.creating = false;
              this.closeDeckEdit();
              this.loadPage();
            });
        }
      }
    }
  }

  deleteDeck() {
    if (this.cur_deck) {
      if (this.deleting) {
        this.apiService.deleteApiDataFromServer(this.decks_url + '/' + this.cur_deck.id).subscribe(
          (response) => {
            this.closeDeckEdit();
            this.loadPage();
          },
          (error) => {
            this.closeDeckEdit();
            this.loadPage();
          }
        );
      }
      else {
        this.deleting = true;
      }
    }
  }

  openThemeEdit(themeEdit: any) {
    this.commander_tab = 'themes';
    this.deleting = false;
  }

  closeThemeEdit() {
    this.delete_themes = [];
    let i = 0;
    while (i < this.all_themes.length) {
      if (this.all_themes[i].id < 0) {
        this.all_themes.splice(i, 1);
        continue;
      }
      i++;
    }
    this.temp_theme=null;
    this.commander_tab = '';
    this.deleting = false;
  }

  createTheme() {
    if(this.temp_theme && this.temp_theme !== "") {
      for (let theme of this.all_themes) {
        if (this.temp_theme.toLowerCase() === theme.name.toLowerCase()) {
          this.temp_theme = "";
          return;
        }
      }
      let temp_new_theme = {id: -1, name: this.temp_theme};
      this.all_themes.push(temp_new_theme);
      this.temp_theme = "";
    }
  }

  deleteTheme(theme: any) {
    const themeIndex = this.all_themes.indexOf(theme);
    if (themeIndex > -1) {
      this.all_themes.splice(themeIndex, 1);
      this.delete_themes.push(theme);
    }
  }
  async updateThemes() {
    for (let theme of this.delete_themes) {
      if (theme.id > -1) {
        await new Promise<void> ((resolve) => {
          this.apiService.deleteApiDataFromServer(this.all_themes_url + '/' + theme.id).subscribe((resp) => {
            resolve();
          }, error => {
            resolve();
          });
        })
      }
    }
    for (let theme of this.all_themes) {
      if (theme.id < 0) {
        await new Promise<void> ((resolve) => {
          this.apiService.postApiDataToServer(this.all_themes_url, JSON.stringify(theme)).subscribe((resp) => {
            resolve();
          }, error => {
            resolve();
          })
        });
      }
    }
    this.loadPage();
  }

  openNavMenu(content: any){
    this.offcanvas.open(content, {scroll: true, keyboard: false});
  }

  closeNavMenu() {
    this.offcanvas.dismiss();
  }
}
