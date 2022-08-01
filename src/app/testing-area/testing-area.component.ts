import { Component, OnInit } from '@angular/core';
import * as Scry from "scryfall-sdk";

@Component({
  selector: 'app-testing-area',
  templateUrl: './testing-area.component.html',
  styleUrls: ['./testing-area.component.scss']
})
export class TestingAreaComponent implements OnInit {

  scryOut: any = {};

  async testScryfall() {
    this.scryOut = await Scry.Cards.byName("Esika, God of the Tree // The Prismatic Bridge")
  }

  constructor() { }

  ngOnInit(): void {
  }

}
