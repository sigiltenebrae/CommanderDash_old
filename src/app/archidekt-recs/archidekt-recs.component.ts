import { Component, OnInit } from '@angular/core';
import {Subject, takeUntil, timer} from 'rxjs';
import {ApiInterfaceService} from "../services/api-interface.service";

import { environment } from "../../environments/environment";
import { subthemes } from "../subthemes";
import { top_saved } from "../top_commanders";

import * as Scry from "scryfall-sdk";
import {NavbarDataService} from "../services/navbar-data.service";


@Component({
  selector: 'app-archidekt-recs',
  templateUrl: './archidekt-recs.component.html',
  styleUrls: ['./archidekt-recs.component.scss']
})
export class ArchidektRecsComponent implements OnInit {
  testing_recs = false;

  current_user: any = {};
  calculating_user: any = {};
  calculating_partner = false;

  calculating = false;
  calculated = false;
  calc_clock;
  calc_clock_subscribe;
  subject;

  user_randomness = 50;
  color_randomness = 25;
  theme_randomness = 50;
  search_type = "And";
  toggle_colors = false;
  toggle_w = false;
  toggle_u = false;
  toggle_b = false;
  toggle_r = false;
  toggle_g = false;
  toggle_c = false;
  toggle_tribal = true;
  toggle_top = false;
  toggle_partner = false;

  recs: any = {};
  colors: any = {};
  sorted_recs: any[] = [];
  my_decks: any = {};
  my_commanders: string[] = [];
  my_themes = {};
  color_modifiers: any = {};
  top_week: any = {};

  commander_position = 0;
  commander_total = 0;
  current_commander = "";
  top_deck_position = 0;
  top_deck_total = 0;
  user_deck_position = 0;
  user_deck_total = 0;

  current_deck: any = {};
  final_decks: any[] = [];


  constructor(private apiService:ApiInterfaceService, private navDataService: NavbarDataService) { }

  ngOnInit(): void {
    this.navDataService.currentUserData.subscribe( cur_user => {
      this.current_user = cur_user;
    });
  }

  filtersOn(): boolean {
    return this.toggle_colors || !this.toggle_top;
  }

  assignThemeWeights(themes: string[]) {
    if (themes) {
      let weighted_themes = {};
      let x_coeff = 0;
      let factor = (1 - ((this.theme_randomness) / 100));
      for (let i = 0; i < themes.length; i++) {
        x_coeff += Math.pow(factor, i);
      }
      let base = 100 / x_coeff;
      let cur_coeff = 0;
      for(let i = 0; i < themes.length; i++) {
        cur_coeff += Math.pow(factor, i);
        weighted_themes[themes[i]] = Math.floor(100 - ((cur_coeff - 1) * base)) / 100;
      }
      return weighted_themes;
    }
    else {
      return {};
    }

  }


  getThemesFromSortedColors(colors: string) {
    if (colors === "WUBRG") {
      return subthemes.WUBRG;
    }
    else if (colors === "WUBR") {
      return subthemes.WUBR;
    }
    else if (colors === "UBRG") {
      return subthemes.UBRG;
    }
    else if (colors === "WBRG") {
      return subthemes.BRGW;
    }
    else if (colors === "WUBG") {
      return subthemes.GWUB;
    }
    else if (colors === "WUB") {
      return subthemes.WUB;
    }
    else if (colors === "UBR") {
      return subthemes.UBR;
    }
    else if (colors === "BRG") {
      return subthemes.BRG;
    }
    else if (colors === "WRG") {
      return subthemes.RGW;
    }
    else if (colors === "WUG") {
      return subthemes.GWU;
    }
    else if (colors === "WBG") {
      return subthemes.WBG;
    }
    else if (colors === "WUR") {
      return subthemes.URW;
    }
    else if (colors === "UBG") {
      return subthemes.BGU;
    }
    else if (colors === "WBR") {
      return subthemes.RWB;
    }
    else if (colors === "URG") {
      return subthemes.GUR;
    }
    else if (colors === "WU") {
      return subthemes.WU;
    }
    else if (colors === "UB") {
      return subthemes.UB;
    }
    else if (colors === "BR") {
      return subthemes.BR;
    }
    else if (colors === "RG") {
      return subthemes.RG;
    }
    else if (colors === "WG") {
      return subthemes.GW;
    }
    else if (colors === "WB") {
      return subthemes.WB;
    }
    else if (colors === "UR") {
      return subthemes.UR;
    }
    else if (colors === "BG") {
      return subthemes.BG;
    }
    else if (colors === "WR") {
      return subthemes.RW;
    }
    else if (colors === "UG") {
      return subthemes.GU;
    }
    else if (colors === "W") {
      return subthemes.W;
    }
    else if (colors === "U") {
      return subthemes.U;
    }
    else if (colors === "B") {
      return subthemes.B;
    }
    else if (colors === "R") {
      return subthemes.R;
    }
    else if (colors === "G") {
      return subthemes.G;
    }
    else if (colors === "") {
      return subthemes.C;
    }
    else {
      console.log("Bad Color Combo: " + colors);
      return [];
    }
  }

  getSortedColors(colors: string[]) {
    let out_colors = "";
    if (colors.includes("W")) {
      out_colors += "W";
    }
    if (colors.includes("U")) {
      out_colors += "U";
    }
    if (colors.includes("B")) {
      out_colors += "B";
    }
    if (colors.includes("R")) {
      out_colors += "R";
    }
    if (colors.includes("G")) {
      out_colors += "G";
    }
    return out_colors;
  }

  pickRandomTheme(themes){
    let ind = Math.floor(Math.random() * themes.length);
    return themes[ind];
  }

  getEdhrecData(commander) {
    return this.apiService.postApiDataToServer(environment.edhrec_commander_url, { commander: commander });
  }

  getEdhrecTopWeek() {
    return this.apiService.getApiDataFromServer(environment.edhrec_top_year_url);
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

  filterOutRecommendation(commander): boolean {
    if (this.toggle_colors) {
      let cur_colors = this.colors[commander];
      if (this.toggle_c) {
        if (!(this.toggle_w || this.toggle_u || this.toggle_b || this.toggle_r || this.toggle_g)) { //Don't bother if any color is selected
          if (cur_colors.length == 0) {
            return false;
          }
          else {
            return true;
          }
        }
      }

      if (this.toggle_w) {
        if(cur_colors.includes("W")) {
          if (this.search_type === "Or") {
            return false;
          }
          if (this.search_type === "Not") {
            return true;
          }
        }
        else {
          if (this.search_type === "And") {
            return true;
          }
        }
      }
      if (this.toggle_u) {
        if(cur_colors.includes("U")) {
          if (this.search_type === "Or") {
            return false;
          }
          if (this.search_type === "Not") {
            return true;
          }
        }
        else {
          if (this.search_type === "And") {
            return true;
          }
        }
      }
      if (this.toggle_b) {
        if(cur_colors.includes("B")) {
          if (this.search_type === "Or") {
            return false;
          }
          if (this.search_type === "Not") {
            return true;
          }
        }
        else {
          if (this.search_type === "And") {
            return true;
          }
        }
      }
      if (this.toggle_r) {
        if(cur_colors.includes("R")) {
          if (this.search_type === "Or") {
            return false;
          }
          if (this.search_type === "Not") {
            return true;
          }
        }
        else {
          if (this.search_type === "And") {
            return true;
          }
        }
      }
      if (this.toggle_g) {
        if(cur_colors.includes("G")) {
          if (this.search_type === "Or") {
            return false;
          }
          if (this.search_type === "Not") {
            return true;
          }
        }
        else {
          if (this.search_type === "And") {
            return true;
          }
        }
      }
    }
    if (!this.toggle_top) {
      return this.top_week.includes(commander);
    }
    return false;
  }

  getRecommendation() {
    this.calculating = true;
    this.calculating_user = this.current_user;
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
        if (this.filtersOn()) { //Filter out decks that do not match
          if(!this.toggle_top) {
            await new Promise<void>(
              (re => {
                this.getEdhrecTopWeek().subscribe(
                  (top) => {
                    this.top_week = top;
                    if (!this.top_week || this.top_week.length == 0) {
                      this.top_week = top_saved;
                    }
                    if (this.top_week.length > 30) {
                      this.top_week.length = 30;
                    }
                    re();
                  }
                )
              })
            );
          }
          for(let k = 0; k < this.sorted_recs.length; k++) {
            if (this.filterOutRecommendation(this.sorted_recs[k].cmdr)) {
              this.sorted_recs.splice(k, 1);
              k--;
            }
          }
        }



        for(let j = 0; j < this.sorted_recs.length; j++) {
          if (j > 2) {
            break;
          }
          let final_deck = await this.getScryfallCommanderData(this.sorted_recs[j].cmdr);
          let partner = false;
          if (final_deck.keywords.includes("Partner")) {
            partner = true;
          }
          let final_deck_images = await final_deck.getPrints();
          if (final_deck_images && final_deck_images.length > 0 && final_deck_images[0].image_uris) {
            this.final_decks.push(
              {
                commander: this.sorted_recs[j].cmdr,
                image_url: final_deck_images[0].image_uris.png,
                partner: partner
              }
            );
          }
          else if(!final_deck_images[0].image_uris && final_deck_images[0].card_faces.length > 1) {
            this.final_decks.push(
              {
                commander: this.sorted_recs[j].cmdr,
                image_url: final_deck_images[0].card_faces[0].image_uris.png,
                partner: partner
              }
            )
          }
          else {
            this.final_decks.push(
              {
                commander: this.sorted_recs[j].cmdr,
                image_url: '',
                partner: partner
              }
            )
          }

        }
        this.getThemeRatings();
        for (let final_deck of this.final_decks) {
          await new Promise<void>(
            (res) => {
              this.getEdhrecData(final_deck.commander).subscribe(
                async (com) => {
                  let edhrec_data: any = com;
                  final_deck.themes = edhrec_data.themes;

                  let weighted_themes = this.assignThemeWeights(final_deck.themes);
                  let weighted_themes_list: any[] = [];
                  for (let w_theme of Object.keys(weighted_themes)) {
                    if (this.my_themes[w_theme] != null) {
                      weighted_themes[w_theme] *= Math.pow(this.my_themes[w_theme].val, ((this.theme_randomness / 100)));
                    }
                    let jitter = Math.floor(Math.random() * this.theme_randomness) / 100;
                    weighted_themes[w_theme] *= Math.pow(1 - jitter, ((this.theme_randomness / 100)));
                    weighted_themes_list.push(
                      {
                        theme: w_theme,
                        weight: weighted_themes[w_theme]
                      });
                  }

                  let weighted_subthemes = this.assignThemeWeights(this.getThemesFromSortedColors(this.getSortedColors(this.colors[final_deck.commander])));
                  let weighted_subthemes_list: any[] = [];
                  for (let ws_theme of Object.keys(weighted_subthemes)) {
                    if (this.my_themes[ws_theme] != null) {
                      weighted_subthemes[ws_theme] *= Math.pow(this.my_themes[ws_theme].val, ((this.theme_randomness / 100)));
                    }
                    let jitter = Math.floor(Math.random() * this.theme_randomness) / 100;
                    weighted_subthemes[ws_theme] *= Math.pow(1 - jitter, ((this.theme_randomness / 100)));
                    weighted_subthemes_list.push(
                      {
                        theme: ws_theme,
                        weight: weighted_subthemes[ws_theme]
                      });
                  }

                  weighted_themes_list.sort((a, b) => (b.weight > a.weight) ? 1 : -1);
                  weighted_subthemes_list.sort((a, b) => (b.weight > a.weight) ? 1 : -1);

                  if (!this.toggle_tribal) { //Remove Tribal Results
                    for (let p = 0; p < weighted_themes_list.length; p++) {
                      if (weighted_themes_list[p].theme.toLowerCase().includes("tribal")) {
                        weighted_themes_list.splice(p, 1);
                        p--;
                      }
                    }
                    for (let p = 0; p < weighted_subthemes_list.length; p++) {
                      if (weighted_subthemes_list[p].theme.toLowerCase().includes("tribal")) {
                        weighted_subthemes_list.splice(p, 1);
                        p--;
                      }
                    }
                  }
                  if (final_deck.partner) {
                    console.log("partner");
                    if (weighted_themes_list.length > 0) {
                      console.log("theme list: ");
                      console.log(weighted_themes_list);
                      if (weighted_themes_list[0].theme.toLowerCase() === "see more" || weighted_themes_list[0].theme.toLowerCase() === "none") {
                        weighted_themes_list.splice(0, 1);
                      }
                      if (weighted_themes_list[0].theme.toLowerCase() === "see more" || weighted_themes_list[0].theme.toLowerCase() === "none") {
                        weighted_themes_list.splice(0, 1);
                      }
                      let cur_partner = weighted_themes_list[0].theme;
                      console.log("partner: " + cur_partner);
                      final_deck.partner_commander = cur_partner;
                      let partner_data = await this.getScryfallCommanderData(cur_partner);
                      if (partner_data != null) {
                        console.log(partner_data);
                        let partner_images = await partner_data.getPrints();
                        console.log(partner_images);
                        final_deck.partner_image_url = partner_images[0].image_uris.png;
                        await new Promise<void>(
                          (getPartner) => {
                            this.getEdhrecData(final_deck.commander + " " + final_deck.partner_commander).subscribe(
                              (partcmdr) => {
                                let edhrecpartnerdata: any = partcmdr;
                                console.log(edhrecpartnerdata);
                                final_deck.themes = edhrecpartnerdata.themes;
                                weighted_themes = this.assignThemeWeights(final_deck.themes);
                                weighted_themes_list = [];
                                for (let w_theme of Object.keys(weighted_themes)) {
                                  if (this.my_themes[w_theme] != null) {
                                    weighted_themes[w_theme] *= Math.pow(this.my_themes[w_theme].val, ((this.theme_randomness / 100)));
                                  }
                                  let jitter = Math.floor(Math.random() * this.theme_randomness) / 100;
                                  weighted_themes[w_theme] *= Math.pow(1 - jitter, ((this.theme_randomness / 100)));
                                  weighted_themes_list.push(
                                    {
                                      theme: w_theme,
                                      weight: weighted_themes[w_theme]
                                    });
                                }
                                weighted_themes_list.sort((a, b) => (b.weight > a.weight) ? 1 : -1);
                                if (!this.toggle_tribal) { //Remove Tribal Results
                                  for (let p = 0; p < weighted_themes_list.length; p++) {
                                    if (weighted_themes_list[p].theme.toLowerCase().includes("tribal")) {
                                      weighted_themes_list.splice(p, 1);
                                      p--;
                                    }
                                  }
                                }
                                getPartner();
                              });
                          });
                      }
                    }
                  }
                  final_deck.random_theme = weighted_themes_list.length > 0 ? weighted_themes_list[0].theme : "";
                  final_deck.random_subtheme = weighted_subthemes_list.length > 0 ? weighted_subthemes_list[0].theme : "";

                  res();
                }, (e) => {
                  res();
                });
            });
        }
        this.subject.next();
        console.log("done");
      });
    });
  }

  async getScryfallCommanderData(commander) {
    return new Promise<any>(
      async (resolve) => {
        try {
          let cur = await Scry.Cards.byName(commander);
          resolve(cur);
        }
        catch (e) {
          resolve(null);
        }

      }
    );
  }

  async getRecommendations() {
    return new Promise<void>(
      async (resol) => {
        await new Promise<void>(
          (resolv) => {
            this.getDecksForUser().subscribe(
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
                    if (deck.partner_commander) {
                      this.calculating_partner = true;
                      await new Promise<void>(
                        (resolve) => {
                          this.getRecommendationForCommander(deck.partner_commander, deck.play_rating).then(r => {
                            this.calculating_partner = false;
                            resolve();
                          })
                        }
                      )
                    }
                    if (this.testing_recs) {
                      break;
                    }
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

  getDecks1() {
    return this.apiService.getApiDataFromServer(environment.decks_url);
  }

  getDecksForUser() {
    return this.apiService.getApiDataFromServer(environment.users_url + '/' + this.calculating_user.id);
  }

  async getRecommendationForCommander(commander, score): Promise<void> {
    return new Promise<void>(
      (resolve) => {
        this.getTopDecksForCommander(commander).subscribe(
          async (response) => {
            let top_decks: any = response;
            if (top_decks.results.length > (100 - this.user_randomness)) {
              this.top_deck_total = (100 - this.user_randomness);
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
              if (deck) {
                await new Promise<void> ((resolv) => {
                  this.getDecksForArchidektUser(deck.owner.username).subscribe(
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
                                  if (card.card.oracleCard.name
                                    !== commander &&
                                    card.card.oracleCard.name !== "Kenrith, the Returned King" &&
                                    card.card.oracleCard.name !== "Golos, Tireless Pilgrim" &&
                                    card.card.oracleCard.name !== "Morophon, the Boundless"
                                  ) {
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
              }
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
        for (let deck of this.my_decks) {
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
        this.getDecksForUser().subscribe(
          (response) => {
            this.my_decks = response;
            for (let deck of this.my_decks) {
              this.my_commanders.push(deck.commander);
              this.getThemesForDeck(deck.id).subscribe(
                (resp) => {
                  deck.themes = resp;
                });
            }
            this.loadDeckScryfallInfo().then(r => {
              this.getColorData();
              this.loadDeckColors().then( s => {
                resolve();
              });
            });
          }
        );
      });
  }

  getThemesForDeck(deck_id: number) {
    return this.apiService.getApiDataFromServer(environment.deck_themes_url + deck_id);
  }

  getThemeRatings() {
    for (let deck of this.my_decks) {
      for(let theme of deck.themes) {
        if (this.my_themes[theme.name] != null){
          this.my_themes[theme.name].val += deck.play_rating;
          this.my_themes[theme.name].count++;
        }
        else {
          this.my_themes[theme.name] =
            {
              val: deck.play_rating,
              count: 1
            }
        }
      }
    }
    for (let theme_name of Object.keys(this.my_themes)) {
      this.my_themes[theme_name].val /= this.my_themes[theme_name].count; //convert val to average, than make between 0 and 1
      this.my_themes[theme_name].val /= 5; //convert val to average, than make between 0 and 1
      this.my_themes[theme_name].val += 0.4;
      this.my_themes[theme_name].count = null;
    }
  }

  getColorData() {
    let w = 0; let u = 0; let b = 0; let r = 0; let g = 0;
    let w_play = 0; let u_play = 0; let b_play = 0; let r_play = 0; let g_play = 0;
    for (let deck of this.my_decks) {
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
                  let partner = false;
                  if (cur.keywords.includes("Partner")) {
                    partner = true;
                  }
                  this.colors[deck.cmdr] = cur.color_identity;
                  for (let col of cur.color_identity) {
                    deck.count *=
                      Math.pow(this.color_modifiers[col], (1 - (this.color_randomness / 100)));
                    if (this.toggle_partner) {
                      if (partner) { //debugging for partner TURN OFF
                        deck.count *= 30;
                      }
                    }

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

  getDecksForArchidektUser(user_name) {
    return this.apiService.getApiDataFromServer('/archidekt/api/decks/cards/?owner=' + user_name + '&orderBy=-viewCount');
  }

  getInfoForDeck(deck_id) {
    return this.apiService.getApiDataFromServer('/archidekt/api/decks/' + deck_id + '/');
  }
}
