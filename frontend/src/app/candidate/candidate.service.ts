import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Candidate, CandidateFilters } from './candidate.model';

@Injectable({
  providedIn: 'root',
})
export class CandidateService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/candidates`;

  #candidates = signal<Candidate[]>([]);
  candidates = this.#candidates.asReadonly();

  loadCandidates(page: number, limit: number, filters: CandidateFilters) {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    if (filters.name) params = params.set('name', filters.name);
    if (filters.seniority) params = params.set('seniority', filters.seniority);
    if (filters.minYears)
      params = params.set('minYears', filters.minYears.toString());
    if (filters.availability !== undefined) {
      params = params.set('available', filters.availability.toString());
    }

    return this.http
      .get<{ data: Candidate[]; meta: any }>(this.apiUrl, { params })
      .pipe(
        tap((response) => {
          this.#candidates.set(response.data);
        })
      );
  }

  findOne(id: number) {
    return this.http.get<Candidate>(`${this.apiUrl}/${id}`);
  }

  update(id: number, changes: Partial<Candidate>) {
    return this.http.put<Candidate>(`${this.apiUrl}/${id}`, changes).pipe(
      tap((updatedCandidate) => {
        this.#candidates.update((list) =>
          list.map((c) => (c.id === id ? updatedCandidate : c))
        );
      })
    );
  }

  uploadCandidate(name: string, surname: string, file: File) {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('surname', surname);
    formData.append('excelFile', file);

    return this.http.post<Candidate>(`${this.apiUrl}/upload`, formData).pipe(
      tap((newCandidate) => {
        if (this.#candidates().length >= 10) {
          this.#candidates.update((list) => [
            newCandidate,
            ...list.slice(0, -1),
          ]);
        } else {
          this.#candidates.update((list) => [newCandidate, ...list]);
        }
      })
    );
  }

  deleteCandidate(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
