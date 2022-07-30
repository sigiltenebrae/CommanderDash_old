import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

import { AppComponent } from './app.component';

import { RouterModule } from "@angular/router";
import { DeckViewerComponent } from './deck-viewer/deck-viewer.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import { NgChartsModule } from "ng2-charts";

import { DeckEditComponent } from './deck-edit/deck-edit.component';
import { ThemeEditComponent } from './theme-edit/theme-edit.component';
import { DeckMetricsComponent } from './deck-metrics/deck-metrics.component';
import { ArchidektRecsComponent } from './archidekt-recs/archidekt-recs.component';
import { MatSliderModule } from "@angular/material/slider";


@NgModule({
  declarations: [
    AppComponent,
    DeckViewerComponent,
    DeckEditComponent,
    ThemeEditComponent,
    DeckMetricsComponent,
    ArchidektRecsComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    RouterModule.forRoot([
      {path: '', component: DeckViewerComponent},
      {path: 'decks/:deckId', component: DeckEditComponent},
      {path: 'themes', component: ThemeEditComponent},
      {path: 'metrics', component: DeckMetricsComponent},
      {path: 'recommendations', component: ArchidektRecsComponent}
    ]),
    NgbModule,
    FormsModule,
    NgChartsModule,
    MatSliderModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
