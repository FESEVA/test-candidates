import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Candidate } from '../../candidate.model';
import { CandidateService } from '../../candidate.service';

@Component({
  selector: 'app-edit-candidate-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCheckboxModule,
  ],
  templateUrl: './edit-candidate-dialog.component.html',
})
export class EditCandidateDialogComponent {
  private fb = inject(FormBuilder);
  private candidateService = inject(CandidateService);
  private dialogRef = inject(MatDialogRef<EditCandidateDialogComponent>);

  data = inject<Candidate>(MAT_DIALOG_DATA);

  isLoading = signal(false);

  editForm = this.fb.group({
    name: [this.data.name, Validators.required],
    surname: [this.data.surname, Validators.required],
    seniority: [this.data.seniority, Validators.required],
    yearsOfExperience: [
      this.data.yearsOfExperience,
      [Validators.required, Validators.min(0)],
    ],
    availability: [this.data.availability],
  });

  update() {
    if (this.editForm.invalid) return;

    this.isLoading.set(true);
    this.candidateService
      .update(this.data.id, this.editForm.value as any)
      .subscribe({
        next: (updated) => {
          this.isLoading.set(false);
          this.dialogRef.close(updated);
        },
        error: () => this.isLoading.set(false),
      });
  }
}
