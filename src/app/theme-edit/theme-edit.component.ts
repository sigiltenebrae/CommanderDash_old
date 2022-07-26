import { Component, OnInit } from '@angular/core';
import {ApiInterfaceService} from "../services/api-interface.service";

@Component({
  selector: 'app-theme-edit',
  templateUrl: './theme-edit.component.html',
  styleUrls: ['./theme-edit.component.scss']
})
export class ThemeEditComponent implements OnInit {

  all_themes_url = 'http://localhost:3000/themes';
  all_themes: {id: number, name: string}[] = [];
  delete_themes: any = [];
  temp_theme: any;

  constructor(private apiService:ApiInterfaceService) { }

  ngOnInit(): void {
    this.loadPage();
  }

  loadPage() {
    this.getAllThemes().subscribe(
      (response:any) => {
        this.all_themes = response;
        this.all_themes.sort((a, b) => (a.name > b.name) ? 1 : -1);
      }
    );
  }

  getAllThemes() {
    return this.apiService.getApiDataFromServer(this.all_themes_url);
  }

  createTheme() {
    if(this.temp_theme && this.temp_theme !== "") {
      for (let theme of this.all_themes) {
        if (this.temp_theme.toLowerCase() === theme.name.toLowerCase()) {
          this.temp_theme = "";
          return;
        }
      }
      let temp_new_theme = {id: -1, name: this.temp_theme};
      this.all_themes.push(temp_new_theme);
      this.temp_theme = "";
    }
  }

  deleteTheme(theme: any) {
    const themeIndex = this.all_themes.indexOf(theme);
    if (themeIndex > -1) {
      this.all_themes.splice(themeIndex, 1);
      this.delete_themes.push(theme);
    }
  }

  async updateThemes() {
    for (let theme of this.delete_themes) {
      if (theme.id > -1) {
        await new Promise<void> ((resolve) => {
          this.apiService.deleteApiDataFromServer(this.all_themes_url + '/' + theme.id).subscribe((resp) => {
            resolve();
          }, error => {
            resolve();
          });
        })
      }
    }
    for (let theme of this.all_themes) {
      if (theme.id < 0) {
        await new Promise<void> ((resolve) => {
          this.apiService.postApiDataToServer(this.all_themes_url, JSON.stringify(theme)).subscribe((resp) => {
            resolve();
          }, error => {
            resolve();
          })
        });
      }
    }
    this.loadPage();
  }

}
