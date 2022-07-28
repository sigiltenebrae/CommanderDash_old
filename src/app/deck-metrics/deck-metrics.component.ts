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
  theme_counts: any = {};

  public buildRatingChartData: ChartConfiguration<'bar'>['data'];
  public buildRatingChartLegend = true;
  public buildRatingChartPlugins = [];
  public buildRatingChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: false,
    plugins: {
      title: {
        display: false,
        text: 'Custom title',
        color: 'maroon'
      },
      legend: {
        labels: {
          color: 'maroon'
        }
      },

    },
    scales: {
      y: {
        ticks: {
          color: 'maroon'
        }
      },
      x: {
        ticks: {
          color: 'maroon'
        }
      }
    }
  };

  public deckStatsChartLabels: string[] = [ 'W', 'U', 'B', 'R', 'G' ];
  public deckStatsChartDatasets: ChartConfiguration<'doughnut'>['data']['datasets'];
  public deckStatsChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: false,
    plugins: {
      title: {
        display: true,
        text: 'Deck Color Percentages',
        color: 'maroon'
      }
    }
  };

  public themeCountData: ChartConfiguration<'bar'>['data'];
  public themeCountPlugins = [];
  public themeCountOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: false,
    plugins: {
      title: {
        display: true,
        text: 'Theme Counts',
        color: 'maroon'
      }
    },
    indexAxis: 'y'
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
              for (let theme of deck.themes) {
                if (this.theme_counts[theme.name] != null) {
                  this.theme_counts[theme.name] ++;
                }
                else {
                  this.theme_counts[theme.name] = 1;
                }
              }
            });
        }
        this.loadDeckScryfallInfo().then(r => {
          this.loadRatingData();
          this.loadDeckStats();
          this.loadThemeCounts();
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
    this.deckStatsChartDatasets = [{
      data: [ w/total, u/total, b/total, r/total, g/total ],
      backgroundColor: [
        'rgba(201, 203, 207, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        'rgba(30, 30, 30, 0.2)',
        'rgba(255, 159, 64, 0.2)',
        'rgba(75, 192, 192, 0.2)'
      ],
      borderColor: [
        'rgb(201, 203, 207)',
        'rgb(54, 162, 235)',
        'black',
        'rgb(255, 159, 64)',
        'rgb(75, 192, 192)'
      ],
      hoverBackgroundColor: [
        'rgb(201, 203, 207)',
        'rgb(54, 162, 235)',
        'black',
        'rgb(255, 159, 64)',
        'rgb(75, 192, 192)'
      ],
      hoverBorderColor: [
        'rgb(201, 203, 207)',
        'rgb(54, 162, 235)',
        'black',
        'rgb(255, 159, 64)',
        'rgb(75, 192, 192)'
      ],
      borderWidth: 1,
      label: 'Series A'
    }];
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
        {
          data: [ w_build / w, u_build / u, b_build / b, r_build / r, g_build / g ],
          backgroundColor: [
            'rgba(201, 203, 207, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(30, 30, 30, 0.2)',
            'rgba(255, 159, 64, 0.2)',
            'rgba(75, 192, 192, 0.2)'
          ],
          borderColor: [
            'rgb(201, 203, 207)',
            'rgb(54, 162, 235)',
            'black',
            'rgb(255, 159, 64)',
            'rgb(75, 192, 192)'
          ],
          hoverBackgroundColor: [
            'rgb(201, 203, 207)',
            'rgb(54, 162, 235)',
            'black',
            'rgb(255, 159, 64)',
            'rgb(75, 192, 192)'
          ],
          hoverBorderColor: [
            'rgb(201, 203, 207)',
            'rgb(54, 162, 235)',
            'black',
            'rgb(255, 159, 64)',
            'rgb(75, 192, 192)'
          ],
          borderWidth: 1,
          label: 'Fun to Build',
        },
        {
          data: [ w_play / w, u_play / u, b_play / b, r_play / r, g_play / g ],
          backgroundColor: [
            'rgba(255, 255, 255, 0.2)',
            'rgba(0, 0, 255, 0.2)',
            'rgba(0, 0, 0, 0.2)',
            'rgba(255, 0, 0, 0.2)',
            'rgba(0, 255, 0, 0.2)'
          ],
          borderColor: [
            'white',
            'blue',
            'black',
            'red',
            'green'
          ],
          hoverBackgroundColor: [
            'white',
            'blue',
            'black',
            'red',
            'green'
          ],
          hoverBorderColor: [
            'white',
            'blue',
            'black',
            'red',
            'green'
          ],
          borderWidth: 1,
          label: 'Fun to Play' }
      ]
    };

  }

  loadThemeCounts() {
    let themeArray: {name: string, count: number}[] = [];
    for (let theme_name of Object.keys(this.theme_counts)) {
      themeArray.push( {name: theme_name, count:this.theme_counts[theme_name]} )
    }
    themeArray.sort((a, b) => (b.count > a.count) ? 1 : -1)
    themeArray = themeArray.slice(0, 10);
    let theme_labels: string[] = [];
    let theme_counted: number[] = [];
    for(let theme of themeArray) {
      theme_labels.push(theme.name);
      theme_counted.push(theme.count);
    }
    this.themeCountData = {
        labels: theme_labels,
        datasets: [
          {
            data: theme_counted,
            label: 'Themes',
            backgroundColor: [
              'rgba(201, 203, 207, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(30, 30, 30, 0.2)',
              'rgba(255, 159, 64, 0.2)',
              'rgba(75, 192, 192, 0.2)'
            ],
            borderColor: [
              'rgb(201, 203, 207)',
              'rgb(54, 162, 235)',
              'black',
              'rgb(255, 159, 64)',
              'rgb(75, 192, 192)'
            ],
            borderWidth: 1
          }
        ]
      };
  }
}
