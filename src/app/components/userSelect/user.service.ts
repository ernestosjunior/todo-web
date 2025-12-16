import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from './types';
import { environment } from '@env';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  listAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }
}
