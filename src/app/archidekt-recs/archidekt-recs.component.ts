import { Component, OnInit } from '@angular/core';
import {ApiInterfaceService} from "../services/api-interface.service";
import {error} from "@angular/compiler-cli/src/transformers/util";
import {environment} from "../../environments/environment";

@Component({
  selector: 'app-archidekt-recs',
  templateUrl: './archidekt-recs.component.html',
  styleUrls: ['./archidekt-recs.component.scss']
})
export class ArchidektRecsComponent implements OnInit {

  recs: any = {};
  sorted_recs: any[] = [];

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
    })
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


  getTopDecksForCommander(commander) {
    return this.apiService.getApiDataFromServer('/archidekt/api/decks/cards/?deckFormat=3&commanders="' + commander + '"&orderBy=-viewCount&pageSize=40');
  }

  getDecksForUser(user_name) {
    return this.apiService.getApiDataFromServer('/archidekt/api/decks/cards/?owner=' + user_name + '&orderBy=-viewCount');
  }

  getInfoForDeck(deck_id) {
    return this.apiService.getApiDataFromServer('/archidekt/api/decks/' + deck_id + '/');
  }
}
