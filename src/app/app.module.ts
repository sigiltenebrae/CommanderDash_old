import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';

import {RouterModule} from "@angular/router";
import { DeckViewerComponent } from './deck-viewer/deck-viewer.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import {FormsModule} from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import { DeckEditComponent } from './deck-edit/deck-edit.component';

@NgModule({
  declarations: [
    AppComponent,
    DeckViewerComponent,
    DeckEditComponent
  ],
    imports: [
        BrowserModule,
        HttpClientModule,
        RouterModule.forRoot([
          {path: '', component: DeckViewerComponent},
          {path: 'decks/:deckId', component: DeckEditComponent}
        ]),
        NgbModule,
        FormsModule
    ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
