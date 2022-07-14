import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class ApiInterfaceService {

  constructor(private httpClient: HttpClient) { }

  getApiDataFromServer(api_call: string) {
    return this.httpClient.get(api_call);
  }

  putApiDataToServer(api_call: string, body: any) {
    return this.httpClient.put<any>(api_call, body, {headers : new HttpHeaders({'Content-Type': 'application/json'})});
  }

  postApiDataToServer(api_call: string, body: any) {
    return this.httpClient.post(api_call, body, {headers : new HttpHeaders({'Content-Type': 'application/json'})})
  }

  deleteApiDataFromServer(api_call: string) {
    return this.httpClient.delete(api_call);
  }
}
