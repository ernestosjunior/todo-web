import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env';

@Injectable({ providedIn: 'root' })
export class LoginService {
  private readonly api = environment.apiUrl + '/users';

  constructor(private http: HttpClient) {}

  login(data: { email: string; password: string }): Observable<any> {
    return this.http.post(this.api + '/login', data);
  }
}
