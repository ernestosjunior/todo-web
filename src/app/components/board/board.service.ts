import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env';
import { BoardCard } from './types';

@Injectable({ providedIn: 'root' })
export class BoardService {
  private readonly api = environment.apiUrl + '/todos';

  constructor(private http: HttpClient) {}

  getBoard(): Observable<any> {
    return this.http.get(this.api + '/board');
  }

  patchCard(id: number, updates: Partial<BoardCard>): Observable<BoardCard> {
    console.log(updates);
    return this.http.patch<BoardCard>(`${this.api}/${id}`, updates);
  }
}
