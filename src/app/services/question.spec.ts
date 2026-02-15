import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, it, expect } from 'vitest';
import { QuestionService } from './question';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { QuestionModel } from '../model/questionModel.type';

describe('QuestionService', () => {
  let service: QuestionService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule], // <-- important
      providers: [QuestionService], // <-- ONLY your service
    });

    service = TestBed.inject(QuestionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getLoading should expose loading signal', () => {
    const loadingSignal = service.getLoading();
    expect(loadingSignal()).toBeFalsy(); // default value is false
  });

  it('getError should expose error signal', () => {
    const errorSignal = service.getError();
    expect(errorSignal()).toBeNull(); // default value is null
  });

  // Example of how you will test methods that toggle loading / error later:
  // it('should set loading to true when calling someMethod', fakeAsync(() => {
  //   httpClientSpy.get.and.returnValue(of([])); // mock HTTP call
  //   service.someMethod();
  //   expect(service.getLoading()()).toBeTrue();
  // }));
  it('should set loading true and call base URL when only amount is passed', () => {
    const questionsSignal = service.fetchAllQuestions(10);

    // loading and error immediately after call
    const loadingSignal = service.getLoading();
    expect(loadingSignal()).toBeTruthy();

    const errorSignal = service.getError();
    expect(errorSignal()).toBeNull(); // default value is null

    const req = httpMock.expectOne('https://localhost:7231/api/questions?amount=10');
    expect(req.request.method).toBe('GET');

    const mockData: QuestionModel[] = [
      {
        /* minimal mock */
      } as QuestionModel,
    ];
    req.flush(mockData);

    // after success
    const loadingSignal2 = service.getLoading();
    expect(loadingSignal2()).toBeFalsy(); // default value is false

    expect(questionsSignal()).toEqual(mockData);

    const errorSignal2 = service.getError();
    expect(errorSignal2()).toBeNull(); // default value is null
  });

  it('should build URL with all filters and encode parameters', () => {
    service.fetchAllQuestions(5, 'Science & Nature', 'medium', 'boolean', 'Base64');

    const expectedUrl =
      'https://localhost:7231/api/questions' +
      '?amount=5' +
      '&category=' +
      encodeURIComponent('Science & Nature') +
      '&difficulty=medium' +
      '&type=boolean' +
      '&encode=Base64';

    const req = httpMock.expectOne(expectedUrl);
    expect(req.request.method).toBe('GET');

    req.flush([] as QuestionModel[]);

    expect(service.getLoading()()).toBeFalsy();
    expect(service.getError()()).toBeNull();
  });

  it('should skip filters when value is falsy or Any/Default', () => {
    service.fetchAllQuestions(10, 'Any', 'Any', 'Any', 'Default');

    const req = httpMock.expectOne('https://localhost:7231/api/questions?amount=10');
    expect(req.request.method).toBe('GET');
    req.flush([] as QuestionModel[]);

    expect(service.getLoading()()).toBeFalsy();
    expect(service.getError()()).toBeNull();
  });

  it('should set error signal and loading false on HTTP error', () => {
    const questionsSignal = service.fetchAllQuestions(10);

    const req = httpMock.expectOne('https://localhost:7231/api/questions?amount=10');
    expect(req.request.method).toBe('GET');

    req.flush('Error', { status: 500, statusText: 'Server Error' });

    expect(service.getLoading()()).toBeFalsy();
    expect(service.getError()()).toBe('Failed to load questions.');
    expect(questionsSignal()).toEqual([]); // still previous value (initially empty)
  });

  it('should POST questions to /checkanswers and update questions + loading on success', () => {
    const inputQuestions: QuestionModel[] = [
      {
        /* minimal */
      } as QuestionModel,
    ];

    const questionsSignal = service.getAnswers(inputQuestions);

    // immediately after call
    expect(service.getLoading()()).toBeTruthy();
    expect(service.getError()()).toBeNull();

    const req = httpMock.expectOne('https://localhost:7231/api/questions/checkanswers');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(inputQuestions);

    const returnedData: QuestionModel[] = [
      {
        /* minimal */
      } as QuestionModel,
    ];
    req.flush(returnedData);

    // after success
    expect(service.getLoading()()).toBeFalsy();
    expect(service.getError()()).toBeNull();
    expect(questionsSignal()).toEqual(returnedData);
  });

  it('should set error signal and loading false on POST error', () => {
    const inputQuestions: QuestionModel[] = [
      {
        /* minimal */
      } as QuestionModel,
    ];

    const questionsSignal = service.getAnswers(inputQuestions);

    const req = httpMock.expectOne('https://localhost:7231/api/questions/checkanswers');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(inputQuestions);

    req.flush('Error', { status: 500, statusText: 'Server Error' });

    expect(service.getLoading()()).toBeFalsy();
    expect(service.getError()()).toBe('Failed to load questions.');
    // questionsSignal still holds previous value (initially [])
    expect(questionsSignal()).toEqual([]);
  });
});
