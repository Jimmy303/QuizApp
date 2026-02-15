import { Injectable, signal } from '@angular/core';
import { QuestionModel } from '../model/questionModel.type';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class QuestionService {
  private apiUrl = `https://localhost:7231/api/questions`;
  private questions = signal<QuestionModel[]>([]);
  private loading = signal<boolean>(false);
  private error = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  fetchAllQuestions(
    amount: number,
    category?: string,
    difficulty?: string,
    type?: string,
    encode?: string,
  ) {
    this.loading.set(true);
    this.error.set(null);

    let url = this.apiUrl;
    if (amount && amount > 0) {
      const queryParam = encodeURIComponent(amount);
      url += `?amount=${queryParam}`;
    }
    if (category && category.trim().length > 0 && category !== 'Any') {
      const queryParam = encodeURIComponent(category.trim());
      url += `&category=${queryParam}`;
    }
    if (difficulty && difficulty.trim().length > 0 && difficulty !== 'Any') {
      const queryParam = encodeURIComponent(difficulty.trim());
      url += `&difficulty=${queryParam}`;
    }
    if (type && type.trim().length > 0 && type !== 'Any') {
      const queryParam = encodeURIComponent(type.trim());
      url += `&type=${queryParam}`;
    }
    if (encode && encode.trim().length > 0 && encode !== 'Default') {
      const queryParam = encodeURIComponent(encode.trim());
      url += `&encode=${queryParam}`;
    }

    this.http.get<QuestionModel[]>(url).subscribe({
      next: (data) => {
        this.questions.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load questions.');
        this.loading.set(false);
      },
    });

    return this.questions;
  }

  getAnswers(questions: QuestionModel[]) {
    this.loading.set(true);
    this.error.set(null);

    let url = this.apiUrl;

    this.http.post<QuestionModel[]>(url + '/checkanswers', questions).subscribe({
      next: (data) => {
        this.questions.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load questions.');
        this.loading.set(false);
      },
    });

    return this.questions;
  }

  getLoading() {
    return this.loading;
  }

  getError() {
    return this.error;
  }
}
