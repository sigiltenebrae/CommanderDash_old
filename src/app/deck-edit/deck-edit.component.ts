import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {ApiInterfaceService} from "../services/api-interface.service";
import {debounceTime, distinctUntilChanged, map, Observable, OperatorFunction, switchMap, tap} from "rxjs";
import * as Scry from "scryfall-sdk";

@Component({
  selector: 'app-deck-edit',
  templateUrl: './deck-edit.component.html',
  styleUrls: ['./deck-edit.component.scss']
})
export class DeckEditComponent implements OnInit {

  new_deck: boolean = false;
  creating: boolean = false;

  deck: any = null;
  deckId: any = null;
  decks_url = 'http://localhost:3000/decks';
  themes_url = 'http://localhost:3000/deckthemesname/';
  all_themes_url = 'http://localhost:3000/themes';
  colors: any = {};
  images: any = {};
  all_themes: {id: number, name: string}[] = [];
  temp_theme: any;
  searching = false;
  current_image = -1;
  currentImages = [];

  deleting = false;

  constructor(public router: Router, private route: ActivatedRoute, private apiService:ApiInterfaceService) { }

  ngOnInit(): void {
    const routeParams = this.route.snapshot.paramMap;
    this.deckId = Number(routeParams.get('deckId'));
    this.new_deck = false;
    this.creating = false;
    this.loadPage();
  }

  loadPage() {
    this.getDeck().subscribe(
      (response) => {
        this.deck = response;
        this.deck.image_url_back = "";
        this.deck.commander_new = this.deck.commander;
        this.getThemesForDeck(this.deck.id).subscribe(
          (resp) => {
            this.deck.themes = resp;
            this.deck.deleteThemes = [];
          });
        if (this.deck.image_url !== "") {
          this.current_image = 0;
          // @ts-ignore
          this.currentImages.push(this.deck.image_url);
        }
        this.deck.image_url_back = this.deck.image_url;
        this.getImages().then( r => {});
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
      tap(() => {
        this.searching = false;
      })
    )

  theme_search: OperatorFunction<string, readonly {id: number, name: string}[]> = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      map(term => term === '' ? this.all_themes
        : this.all_themes.filter(v => v.name.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
    );

  theme_formatter = (x: {name: string}) => x.name;

  updateCommander() {
    if (this.deck.commander_new && this.deck.commander_new !== "") {
      this.deck.commander = this.deck.commander_new;
      this.deck.image_url = "";
      this.deck.image_url_back = "";
      this.getImages();
    }

  }

  getDeck() {
    return this.apiService.getApiDataFromServer(this.decks_url + '/' + this.deckId);
  }

  async getImages() {
    if (this.deck.commander !== "") {
      this.currentImages = [];
      if (this.deck.image_url_back !== "") {
        // @ts-ignore
        this.currentImages.push(this.deck.image_url_back);
      }
      let cur = await Scry.Cards.byName(this.deck.commander);
      let cur_prints = await cur.getPrints();
      for (let print of cur_prints) {
        let temp_im: string | undefined = print.image_uris?.png;
        if (temp_im) {
          // @ts-ignore
          this.currentImages.push(temp_im);
        }
      }
      this.current_image = 0;
      this.deck.image_url = this.currentImages[this.current_image];
    }
  }

  upImage() {
    if (this.current_image < this.currentImages.length - 1) {
      this.current_image ++;
    }
    else {
      this.current_image = 0;
    }
    this.deck.image_url = this.currentImages[this.current_image];
  }

  downImage() {
    if (this.current_image > 0) {
      this.current_image --;
    }
    else {
      this.current_image = this.currentImages.length - 1;
    }
    this.deck.image_url = this.currentImages[this.current_image];
  }

  getThemesForDeck(deck_id: number) {
    return this.apiService.getApiDataFromServer(this.themes_url + deck_id);
  }

  getAllThemes() {
    return this.apiService.getApiDataFromServer(this.all_themes_url);
  }

  removeTheme(theme: any) {
    const themeIndex = this.deck.themes.indexOf(theme);
    if (themeIndex > -1) {
      this.deck.themes.splice(themeIndex, 1);
      this.deck.deleteThemes.push(theme);
    }
  }

  addTheme() {
    if (this.temp_theme != null) {
      let themeIndex = -1;
      for (let theme of this.deck.themes) {
        if (theme.name === this.temp_theme.name) {
          themeIndex = 1;
        }
      }
      if (themeIndex == -1) {
        this.deck.themes.push(this.temp_theme);
        this.temp_theme = null;
      }
    }
  }

  updateDeck() {
    if (!this.creating) {
      if (this.deck) {
        this.apiService.putApiDataToServer(this.decks_url + "/" + this.deck.id, JSON.stringify(this.deck)).subscribe(
          (response) => {
            //this.router.navigate(['/']);
            this.loadPage();
          },
          (error)=> {
            //this.router.navigate(['/']);
            this.loadPage();
          });
      }
    }
    else {
      if (this.deck.commander && this.deck.commander !== "") {
        if (this.deck.friendly_name && this.deck.friendly_name !== "") {
          this.apiService.postApiDataToServer(this.decks_url, JSON.stringify(this.deck)).subscribe(
            (response) => {
              this.creating = false;
              this.router.navigate(['/']);
            }, (error) => {
              this.creating = false;
              this.router.navigate(['/']);
            });
        }
      }
    }
  }

  deleteDeck() {
    if (this.deck) {
      if (this.deleting) {
        this.apiService.deleteApiDataFromServer(this.decks_url + '/' + this.deck.id).subscribe(
          (response) => {
            this.router.navigate(['/']);
          },
          (error) => {
            this.router.navigate(['/']);
          }
        );
      }
      else {
        this.deleting = true;
      }
    }
  }

}
