import { DatePipe, UpperCasePipe } from '@angular/common';
import { Component, inject, input, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { Candidate, Seniority } from '../../candidate.model';
import { CandidateService } from '../../candidate.service';
import { Router, RouterLink } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../common/components/confirm-dialog/confirm-dialog.component';
import { EditCandidateDialogComponent } from '../../components/edit-candidate-dialog/edit-candidate-dialog.component';
import { AlertService } from '../../../common/services/alert.service';

@Component({
  selector: 'app-candidate-detail',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDialogModule,
    UpperCasePipe,
    DatePipe,
    RouterLink,
  ],
  templateUrl: './candidate-detail.component.html',
  styleUrl: './candidate-detail.component.css',
})
export class CandidateDetailComponent implements OnInit {
  id = input.required<string>();

  private candidateService = inject(CandidateService);
  private dialog = inject(MatDialog);
  private router = inject(Router);
  private alertService = inject(AlertService);

  candidate = signal<Candidate | null>(null);

  ngOnInit() {
    this.candidateService.findOne(Number(this.id())).subscribe((data) => {
      this.candidate.set(data);
    });
  }

  goToCandidates() {
    this.router.navigate(['/candidates']);
  }

  confirmDelete(candidate: Candidate) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        title: 'Delete Candidate',
        message: `Are you sure you want to delete ${candidate.name}?`,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === true) {
        this.candidateService.deleteCandidate(candidate.id).subscribe({
          next: () => {
            this.alertService.showSuccess('Candidate deleted successfully!');
            this.goToCandidates();
          },
          error: (err) => {
            console.error('Error deleting candidate', err);
          },
        });
      }
    });
  }

  openEditDialog(candidate: Candidate) {
    const dialogRef = this.dialog.open(EditCandidateDialogComponent, {
      width: '500px',
      data: candidate,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.candidateService.findOne(candidate.id).subscribe((data) => {
          this.candidate.set(data);
        });
        this.alertService.showSuccess('Candidate updated successfully!');
      }
    });
  }
}
