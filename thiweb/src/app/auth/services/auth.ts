import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const BASIC_HOST="http://localhost:8080/"

@Injectable({
  providedIn: 'root',
})
export class Auth {
  constructor(private http:HttpClient) {
  }
  register(data):Observable<any>{
    return this.http.post(BASIC_HOST + "api/auth/sign-up",data)
  }
  login(loginRequest):Observable<any>{
    return this.http.post(BASIC_HOST + 'api/auth/login', loginRequest);
  }
}
