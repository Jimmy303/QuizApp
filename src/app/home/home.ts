import { ChangeDetectionStrategy, Component, inject, signal, WritableSignal } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
  FormBuilder,
  FormGroup,
} from '@angular/forms';
import { QuestionService } from '../services/question';
import { QuestionModel } from '../model/questionModel.type';
import { Options } from '../model/options.type';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { NgFor, NgIf } from '@angular/common';
import { MatRadioModule } from '@angular/material/radio';

@Component({
  selector: 'app-home',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
    MatCardModule,
    NgFor,
    MatRadioModule,
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  form: FormGroup;
  hasStarted: boolean;
  hasSubmitted: boolean;
  questions: WritableSignal<QuestionModel[]>;

  private questionservice = inject(QuestionService);

  loading = this.questionservice.getLoading();
  error = this.questionservice.getError();

  constructor(private fb: FormBuilder) {
    this.questions = signal<QuestionModel[]>([]);
    this.hasStarted = false;
    this.hasSubmitted = false;
    this.form = this.fb.group({
      amount: ['10', Validators.required],
      category: ['Any'],
      difficulty: ['Any'],
      type: ['Any'],
      encoding: ['Default'],
    });
  }

  onSubmit() {
    if (this.form.valid) {
      console.log(this.form.getRawValue());
      const options: Options = this.form.getRawValue();
      this.hasStarted = true;

      this.questions = signal<QuestionModel[]>([]);
      this.questions = this.questionservice.fetchAllQuestions(
        options.amount,
        options.category,
        options.difficulty,
        options.type,
        options.encoding,
      );
    } else {
      // Optionally, mark form fields as touched to show validation errors
      // this.form.markAllAsTouched();
    }
  }
  return() {
    this.hasStarted = false;
    this.hasSubmitted = false;
  }
  submitAnswers() {
    this.hasSubmitted = true;
    this.questions = this.questionservice.getAnswers(this.questions());
  }

  onAnswerSelected(question: QuestionModel, answer: string): void {
    question.selectedAnswer = answer;
    // do whatever you need here: send to store, signal, API, etc.
    console.log('Selected', question.id, '=>', answer);
    this.questions().forEach((element) => {
      console.log('asdsadsad' + element.selectedAnswer);
    });
  }
}
