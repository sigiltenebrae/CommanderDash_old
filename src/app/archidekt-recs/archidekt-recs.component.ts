import { Component, OnInit } from '@angular/core';
import {ApiInterfaceService} from "../services/api-interface.service";
import {error} from "@angular/compiler-cli/src/transformers/util";

@Component({
  selector: 'app-archidekt-recs',
  templateUrl: './archidekt-recs.component.html',
  styleUrls: ['./archidekt-recs.component.scss']
})
export class ArchidektRecsComponent implements OnInit {

  constructor(private apiService:ApiInterfaceService) { }

  ngOnInit(): void {

  }

  GetRecommendation() {
    let commander = "Alela, Artful Provocateur";
    this.getTopDecksForCommander(commander).subscribe(
      (response) => {
        console.log(response);
      },
      (error) => {
        console.log(error);
      }
    );
  }



  getTopDecksForCommander(commander) {
    return this.apiService.getApiDataFromServer('/archidekt/api/decks/cards/?deckFormat=3&commanders="' + commander + '"&orderBy=-viewCount&pageSize=10');
  }

}
