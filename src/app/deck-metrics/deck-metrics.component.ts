import { Component, OnInit } from '@angular/core';
import { ChartConfiguration, ChartOptions } from "chart.js";
import {environment} from "../../environments/environment";
import {ApiInterfaceService} from "../services/api-interface.service";
import {NavbarDataService} from "../services/navbar-data.service";
import * as Scry from "scryfall-sdk";

@Component({
  selector: 'app-deck-metrics',
  templateUrl: './deck-metrics.component.html',
  styleUrls: ['./deck-metrics.component.scss']
})
export class DeckMetricsComponent implements OnInit {

  decks: any = [];
  colors: any = {};

  public buildRatingChartData: ChartConfiguration<'bar'>['data'];
  public buildRatingChartLegend = true;
  public buildRatingChartPlugins = [];
  public buildRatingChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: false,
  };

  public deckStatsChartLabels: string[] = [ 'W', 'U', 'B', 'R', 'G' ];
  public deckStatsChartDatasets: ChartConfiguration<'doughnut'>['data']['datasets'];
  public deckStatsChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: false
  };

  constructor(private apiService:ApiInterfaceService, private navDataService: NavbarDataService) {
  }

  ngOnInit() {
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
        this.loadDeckScryfallInfo().then(r => {
          this.loadRatingData();
          this.loadDeckStats();
        });
      }
    );
  }

  getDecks() {
    return this.apiService.getApiDataFromServer(environment.decks_url);
  }

  getThemesForDeck(deck_id: number) {
    return this.apiService.getApiDataFromServer(environment.deck_themes_url + deck_id);
  }

  async loadDeckScryfallInfo() {
    for (let deck of this.decks) {
      let cur = await Scry.Cards.byName(deck.commander);
      // @ts-ignore
      this.colors[deck.commander] = cur.color_identity;
    }
  }

  loadDeckStats() {
    let w = 0; let u = 0; let b = 0; let r = 0; let g = 0; let total = 0;
    for (let deck of this.decks) {
      if(deck.active) {
        if (this.colors[deck.commander].includes('W')) {
          w++;
        }
        if (this.colors[deck.commander].includes('U')) {
          u++;
        }
        if (this.colors[deck.commander].includes('B')) {
          b++;
        }
        if (this.colors[deck.commander].includes('R')) {
          r++;
        }
        if (this.colors[deck.commander].includes('G')) {
          g++;
        }
        total++;
      }
    }
    this.deckStatsChartDatasets = [
      { data: [ w/total, u/total, b/total, r/total, g/total ], label: 'Series A' },
    ];
  }

  loadRatingData() {
    let w = 0; let u = 0; let b = 0; let r = 0; let g = 0;
    let w_build = 0; let u_build = 0; let b_build = 0; let r_build = 0; let g_build = 0;
    let w_play = 0; let u_play = 0; let b_play = 0; let r_play = 0; let g_play = 0;
    for (let deck of this.decks) {
      if (deck.build_rating > 0 && deck.play_rating > 0) {
        if (this.colors[deck.commander].includes('W')) {
          w_build += (deck.build_rating);
          w_play += (deck.play_rating);
          w++;
        }
        if (this.colors[deck.commander].includes('U')) {
          u_build += (deck.build_rating);
          u_play += (deck.play_rating);
          u++;
        }
        if (this.colors[deck.commander].includes('B')) {
          b_build += (deck.build_rating);
          b_play += (deck.play_rating);
          b++;
        }
        if (this.colors[deck.commander].includes('R')) {
          r_build += (deck.build_rating);
          r_play += (deck.play_rating);
          r++;
        }
        if (this.colors[deck.commander].includes('G')) {
          g_build += (deck.build_rating);
          g_play += (deck.play_rating);
          g++;
        }

      }
    }
    this.buildRatingChartData = {
      labels: [ 'W', 'U', 'B', 'R', 'G' ],
      datasets: [
        { data: [ w_build / w, u_build / u, b_build / b, r_build / r, g_build / g ], label: 'Fun to Build' },
        { data: [ w_play / w, u_play / u, b_play / b, r_play / r, g_play / g ], label: 'Fun to Play' }
      ]
    };

  }

}
