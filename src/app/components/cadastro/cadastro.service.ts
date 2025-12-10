import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env';

@Injectable({ providedIn: 'root' })
export class CadastroService {
  private readonly api = environment.apiUrl + '/users';

  constructor(private http: HttpClient) {}

  cadastrar(data: {
    name: string;
    email: string;
    password: string;
    role: 'ADMIN' | 'MEMBER';
  }): Observable<any> {
    return this.http.post(this.api + '/register', data);
  }
}
