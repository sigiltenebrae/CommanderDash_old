import { Component, OnInit } from '@angular/core';
import {ApiInterfaceService} from "../services/api-interface.service";
import {environment} from "../../environments/environment";
import * as Scry from "scryfall-sdk";
import {Subject, takeUntil, timer} from 'rxjs';

@Component({
  selector: 'app-archidekt-recs',
  templateUrl: './archidekt-recs.component.html',
  styleUrls: ['./archidekt-recs.component.scss']
})
export class ArchidektRecsComponent implements OnInit {

  calculating = false;
  calculated = false;
  calc_clock;
  calc_clock_subscribe;
  subject;
  randomness = 75;


  recs: any = {};
  colors: any = {};
  sorted_recs: any[] = [];
  decks: any = {};
  my_commanders: string[] = [];
  color_modifiers: any = {};

  commander_position = 0;
  commander_total = 0;
  current_commander = "";
  top_deck_position = 0;
  top_deck_total = 0;
  user_deck_position = 0;
  user_deck_total = 0;

  current_deck: any = {};
  final_decks: any[] = [];


  constructor(private apiService:ApiInterfaceService) { }

  ngOnInit(): void {

  }

  pickRandomTheme(themes){
    let ind = Math.floor(Math.random() * themes.length);
    return themes[ind];
  }

  getEdhrecData(commander) {
    return this.apiService.postApiDataToServer('http://localhost:2525/commander', { commander: commander });
  }

  restart_Recs() {
    this.calculating = false;
    this.calculated = false;
    this.recs = {};
    this.sorted_recs = [];
    this.final_decks = [];
    this.calc_clock_subscribe = {};
    this.calc_clock = 0;
  }

  secondsToString(all_seconds: number) {
    let seconds: string | number = Math.floor(all_seconds % 60)
    let minutes: string | number = Math.floor( (all_seconds / 60) % 60)
    let hours: string | number = Math.floor((all_seconds / (60 * 60)) % 60)
    seconds = (seconds < 10) ? '0' + seconds : seconds;
    minutes = (minutes < 10) ? '0' + minutes : minutes;
    hours = (hours < 10) ? '0' + hours : hours;
    return `${hours}:${minutes}:${seconds}`;
  }

  getRecommendation() {
    this.calculating = true;
    this.subject = new Subject();
    this.calc_clock_subscribe = timer(1000, 1000);
    timer(1000, 1000).pipe(
      takeUntil(this.subject),
    ).subscribe(val => {
        this.calc_clock = val;
    });
    this.getRecommendations().then(r => {
      this.getBest();
      this.loadDeckInfo().then(async s => {
        for (let i = 0; i < this.sorted_recs.length; i++) {
          if (this.my_commanders.includes(this.sorted_recs[i].cmdr)) {
            this.sorted_recs.splice(i, 1);
            i--;
          }
        }
        this.sorted_recs.sort((a, b) => (b.count > a.count) ? 1 : -1);
        this.calculating = false;
        this.calculated = true;
        if (this.sorted_recs.length > 0) {
          let final_deck = await this.getScryfallCommanderData(this.sorted_recs[0].cmdr);
          let final_deck_images = await final_deck.getPrints();
          this.final_decks.push(
            {
              commander: this.sorted_recs[0].cmdr,
              image_url: final_deck_images[0].image_uris.png
            }
          );
        }
        if (this.sorted_recs.length > 1) {
          let final_deck = await this.getScryfallCommanderData(this.sorted_recs[1].cmdr);
          let final_deck_images = await final_deck.getPrints();
          this.final_decks.push(
            {
              commander: this.sorted_recs[1].cmdr,
              image_url: final_deck_images[1].image_uris.png
            }
          );
        }
        if (this.sorted_recs.length > 2) {
          let final_deck = await this.getScryfallCommanderData(this.sorted_recs[2].cmdr);
          let final_deck_images = await final_deck.getPrints();
          this.final_decks.push(
            {
              commander: this.sorted_recs[2].cmdr,
              image_url: final_deck_images[2].image_uris.png
            }
          );
        }
        this.subject.next();
        for (let final_deck of this.final_decks) {
          await new Promise<void>(
            (res) => {
              this.getEdhrecData(final_deck.commander).subscribe(
                (com) => {
                  let edhrec_data: any = com;
                  final_deck.themes = edhrec_data.themes;
                  final_deck.random_theme = this.pickRandomTheme(final_deck.themes);
                  res()
                }, (e) => {
                  res();
                });
            });
        }
        console.log("done");
      });
    });
  }

  async getScryfallCommanderData(commander) {
    return new Promise<any>(
      async (resolve) => {
        let cur = await Scry.Cards.byName(commander)
        resolve(cur);
      }
    );
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

                  this.current_commander = deck.commander;
                  this.current_deck = deck;
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
                  this.commander_position++;
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
            if (top_decks.results.length > (100 - this.randomness)) {
              this.top_deck_total = (100 - this.randomness);
              if (this.top_deck_total == 0) {
                this.top_deck_total = 1;
              }
            }
            else {
              this.top_deck_total = top_decks.results.length;
            }
            this.top_deck_position = 0;
            for (let i = 0; i < this.top_deck_total; i++) {
              let random_user = Math.floor(Math.random() * (top_decks.results.length - i));
              let deck = top_decks.results[random_user];
              await new Promise<void> ((resolv) => {
                this.getDecksForUser(deck.owner.username).subscribe(
                  async (resp) => {
                    let user_decks: any = resp;
                    this.user_deck_total = user_decks.results.length;
                    this.user_deck_position = 0;
                    for (let user_deck of user_decks.results) {
                      await new Promise<void>((resol) => {
                        this.getInfoForDeck(user_deck.id).subscribe(
                          (r) => {
                            let deck_info: any = r;
                            for (let card of deck_info.cards) {
                              if (card.categories.includes("Commander")) {
                                if (card.card.oracleCard.name !== commander && card.card.oracleCard.name !== "Kenrith, the Returned King") {
                                  if (this.recs[card.card.oracleCard.name] != null) {
                                    this.recs[card.card.oracleCard.name] += (score / 5);
                                  } else {
                                    this.recs[card.card.oracleCard.name] = (score / 5);
                                  }
                                }
                              }
                            }
                            resol();
                          },
                          (err) => {
                            resol();
                          }
                        );
                      });
                      this.user_deck_position++;
                    }
                    resolv();
                  },
                  (erro) => {
                    resolv();
                  }
                )
              });
              top_decks.results.splice(random_user, 1);
              this.top_deck_position++;
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
            async (resolve) => {
              let cur = await Scry.Cards.byName(deck.commander)
              this.colors[deck.commander] = cur.color_identity;
              resolve();
            }
          );
        }
        reso();
      }
    );
  }

  async loadDeckInfo() {
    return new Promise<void>(
      resolve => {
        this.getDecks().subscribe(
          (response) => {
            this.decks = response;
            for (let deck of this.decks) {
              this.my_commanders.push(deck.commander);
            }
            this.loadDeckScryfallInfo().then(r => {
              this.getColorData();
              this.loadDeckColors().then( s => {
                resolve();
              });
            });
          }
        );
      }
    )

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
    this.color_modifiers['W'] = ((w_play / w) / 5) + 0.4;
    this.color_modifiers['U'] = ((u_play / u) / 5) + 0.4;
    this.color_modifiers['B'] = ((b_play / b) / 5) + 0.4;
    this.color_modifiers['R'] = ((r_play / r) / 5) + 0.4;
    this.color_modifiers['G'] = ((g_play / g) / 5) + 0.4;
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
        reso();
      }
    );
  }

  getTopDecksForCommander(commander) {
    //return this.apiService.getApiDataFromServer('/archidekt/api/decks/cards/?deckFormat=3&commanders="' + commander + '"&orderBy=-viewCount&pageSize=40');
    return this.apiService.getApiDataFromServer('/archidekt/api/decks/cards/?deckFormat=3&commanders="' + commander + '"&orderBy=-viewCount&pageSize=100');
  }

  getDecksForUser(user_name) {
    return this.apiService.getApiDataFromServer('/archidekt/api/decks/cards/?owner=' + user_name + '&orderBy=-viewCount');
  }

  getInfoForDeck(deck_id) {
    return this.apiService.getApiDataFromServer('/archidekt/api/decks/' + deck_id + '/');
  }
}
