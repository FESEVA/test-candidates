import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CandidateService } from '../../candidate.service';

@Component({
  selector: 'app-add-candidate-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './add-candidate-dialog.component.html',
  styleUrl: './add-candidate-dialog.component.css',
})
export class AddCandidateDialogComponent {
  private fb = inject(FormBuilder);
  private candidateService = inject(CandidateService);
  private dialogRef = inject(MatDialogRef<AddCandidateDialogComponent>);

  isLoading = signal(false);

  candidateForm = this.fb.group({
    name: ['', Validators.required],
    surname: ['', Validators.required],
    excelFile: [null as File | null, Validators.required],
  });

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.candidateForm.patchValue({ excelFile: input.files[0] });
    }
  }

  save() {
    if (this.candidateForm.invalid) return;

    this.isLoading.set(true);
    const { name, surname, excelFile } = this.candidateForm.value;

    this.candidateService
      .uploadCandidate(name!, surname!, excelFile!)
      .subscribe({
        next: (newCandidate) => {
          this.isLoading.set(false);
          this.dialogRef.close(newCandidate);
        },
        error: (err) => {
          this.isLoading.set(false);
          console.error('Error while saving:', err);
        },
      });
  }
}
