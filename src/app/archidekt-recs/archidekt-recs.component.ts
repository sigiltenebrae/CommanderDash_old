import { Component, OnInit } from '@angular/core';
import {ApiInterfaceService} from "../services/api-interface.service";
import {error} from "@angular/compiler-cli/src/transformers/util";
import {environment} from "../../environments/environment";
import * as Scry from "scryfall-sdk";

@Component({
  selector: 'app-archidekt-recs',
  templateUrl: './archidekt-recs.component.html',
  styleUrls: ['./archidekt-recs.component.scss']
})
export class ArchidektRecsComponent implements OnInit {

  recs: any = {};
  colors: any = {};
  sorted_recs: any[] = [];
  decks: any = {};
  color_modifiers: any = {};

  commander_position = 0;
  commander_total = 0;
  current_commander = "";
  top_deck_position = 0;
  top_deck_total = 0;
  user_deck_position = 0;
  user_deck_total = 0;
  card_position = 0;
  card_total = 0;



  constructor(private apiService:ApiInterfaceService) { }

  ngOnInit(): void {

  }

  getRecommendation() {
    this.getRecommendations().then(r => {
      this.getBest();
      this.loadDeckInfo().then(s => {
      });
    });
  }

  async getRecommendations() {
    return new Promise<void>(
      async (resol) => {
        await new Promise<void>(
          (resolv) => {
            this.getDecks().subscribe(
              async (response) => {
                let decks: any = response;
                this.commander_total = decks.length;
                this.commander_position = 0;
                for (let deck of decks) {
                  this.commander_position++;
                  this.current_commander = deck.commander;
                  if (deck.play_rating > 0) {

                    await new Promise<void>(
                      (resolve) => {
                        this.getRecommendationForCommander(deck.commander, deck.play_rating).then(r => {
                          resolve();
                        })
                      }
                    );
                    break; //THIS IS FOR TESTING ONLY!!!
                  }
                }
                resolv();
              },
              (error) => {
                resolv();
              }
            );
          }
        );
        resol();
      }
    );
  }

  getDecks() {
    return this.apiService.getApiDataFromServer(environment.decks_url);
  }

  async getRecommendationForCommander(commander, score): Promise<void> {
    return new Promise<void>(
      (resolve) => {
        this.getTopDecksForCommander(commander).subscribe(
          async (response) => {
            let top_decks: any = response;
            this.top_deck_total = top_decks.results.length;
            this.top_deck_position = 0;
            for (let deck of top_decks.results) {
              this.top_deck_position ++;
              await new Promise<void> ((resolv) => {
                this.getDecksForUser(deck.owner.username).subscribe(
                  async (resp) => {
                    let user_decks: any = resp;
                    this.user_deck_total = user_decks.results.length;
                    this.user_deck_position = 0;
                    for (let user_deck of user_decks.results) {
                      this.user_deck_position++;
                      await new Promise<void>((resol) => {
                        this.getInfoForDeck(user_deck.id).subscribe(
                          (r) => {
                            let deck_info: any = r;
                            this.card_total = deck_info.cards.length;
                            this.card_position = 0;
                            for (let card of deck_info.cards) {
                              this.card_position++;
                              if (card.categories.includes("Commander")) {
                                if (card.card.oracleCard.name !== commander && card.card.oracleCard.name !== "Kenrith, the Returned King") {
                                  if (this.recs[card.card.oracleCard.name] != null) {
                                    this.recs[card.card.oracleCard.name] += (score / 5);
                                  } else {
                                    this.recs[card.card.oracleCard.name] = (score / 5);
                                  }
                                }
                                break;
                              }
                            }
                            resol();
                          },
                          (err) => {
                            resol();
                          }
                        );
                      });
                    }
                    resolv();
                  },
                  (erro) => {
                    resolv();
                  }
                )
              });
            }
            resolve();
          }, (error) => {
            resolve();
          }
        );
      }
    );
  }

  getBest() {
    for (let commander of Object.keys(this.recs)) {
      this.sorted_recs.push(
        {
          cmdr: commander,
          count: this.recs[commander]
        }
      )
    }
    this.sorted_recs.sort((a, b) => (b.count > a.count) ? 1 : -1);
  }

  async loadDeckScryfallInfo() {
    return new Promise<void>(
      async (reso) => {
        for (let deck of this.decks) {
          await new Promise<void>(
            (resolve) => {
              Scry.Cards.byName(deck.commander).then( cur =>{
                this.colors[deck.commander] = cur.color_identity;
                resolve();
              });
            }
          );
        }
        reso();
      }
    );
  }

  async loadDeckInfo() {
    this.getDecks().subscribe(
      (response) => {
        this.decks = response;
        this.loadDeckScryfallInfo().then(r => {
          this.getColorData();
          this.loadDeckColors();
        });
      }
    );
  }

  getColorData() {
    let w = 0; let u = 0; let b = 0; let r = 0; let g = 0;
    let w_play = 0; let u_play = 0; let b_play = 0; let r_play = 0; let g_play = 0;
    for (let deck of this.decks) {
      if (deck.build_rating > 0 && deck.play_rating > 0) {
        if (this.colors[deck.commander].includes('W')) {
          w_play += (deck.play_rating);
          w++;
        }
        if (this.colors[deck.commander].includes('U')) {
          u_play += (deck.play_rating);
          u++;
        }
        if (this.colors[deck.commander].includes('B')) {
          b_play += (deck.play_rating);
          b++;
        }
        if (this.colors[deck.commander].includes('R')) {
          r_play += (deck.play_rating);
          r++;
        }
        if (this.colors[deck.commander].includes('G')) {
          g_play += (deck.play_rating);
          g++;
        }
      }
    }
    this.color_modifiers['W'] = ((w_play / w) / 5) + 1;
    this.color_modifiers['U'] = ((u_play / u) / 5) + 1;
    this.color_modifiers['B'] = ((b_play / b) / 5) + 1;
    this.color_modifiers['R'] = ((r_play / r) / 5) + 1;
    this.color_modifiers['G'] = ((g_play / g) / 5) + 1;
  }

  async loadDeckColors() {
    return new Promise<void>(
      async (reso) => {
        for (let deck of this.sorted_recs) {
          await new Promise<void>(
            (resolve) => {
              Scry.Cards.byName(deck.cmdr).then(
                cur =>
                {
                  for (let col of cur.color_identity) {
                    deck.count *= this.color_modifiers[col];
                  }
                  resolve();
                }
              );
            }
          );
        }
        this.sorted_recs.sort((a, b) => (b.count > a.count) ? 1 : -1);
        reso();
      }
    );
  }

  getTopDecksForCommander(commander) {
    //return this.apiService.getApiDataFromServer('/archidekt/api/decks/cards/?deckFormat=3&commanders="' + commander + '"&orderBy=-viewCount&pageSize=40');
    return this.apiService.getApiDataFromServer('/archidekt/api/decks/cards/?deckFormat=3&commanders="' + commander + '"&orderBy=-viewCount&pageSize=10');
  }

  getDecksForUser(user_name) {
    return this.apiService.getApiDataFromServer('/archidekt/api/decks/cards/?owner=' + user_name + '&orderBy=-viewCount');
  }

  getInfoForDeck(deck_id) {
    return this.apiService.getApiDataFromServer('/archidekt/api/decks/' + deck_id + '/');
  }
}
