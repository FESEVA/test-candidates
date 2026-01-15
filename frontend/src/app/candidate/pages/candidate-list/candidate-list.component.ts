import { UpperCasePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatOption, MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { ConfirmDialogComponent } from '../../../common/components/confirm-dialog/confirm-dialog.component';
import { Candidate, CandidateFilters } from '../../candidate.model';
import { CandidateService } from '../../candidate.service';
import { AddCandidateDialogComponent } from '../../components/add-candidate-dialog/add-candidate-dialog.component';
import { EditCandidateDialogComponent } from '../../components/edit-candidate-dialog/edit-candidate-dialog.component';
import { AlertService } from '../../../common/services/alert.service';

@Component({
  selector: 'app-candidate-list',
  standalone: true,
  imports: [
    MatTableModule,
    MatPaginator,
    MatLabel,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOption,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDialogModule,
    UpperCasePipe,
    RouterModule,
  ],
  templateUrl: './candidate-list.component.html',
  styleUrl: './candidate-list.component.css',
})
export class CandidateListComponent implements OnInit {
  private candidateService = inject(CandidateService);
  private dialog = inject(MatDialog);
  private alertService = inject(AlertService);

  displayedColumns: string[] = [
    'name',
    'surname',
    'seniority',
    'experience',
    'availability',
    'actions',
  ];

  candidates = this.candidateService.candidates;
  isLoading = false;
  filters = signal<CandidateFilters>({});
  totalItems = signal(0);
  pageSize = signal(10);
  currentPage = signal(1);

  ngOnInit() {
    this.refreshData();
  }

  onPageChange(event: PageEvent) {
    this.currentPage.set(event.pageIndex + 1);
    this.pageSize.set(event.pageSize);
    this.refreshData();
  }

  applySearch(value: string) {
    this.filters.update((f) => ({ ...f, name: value }));
    this.refreshData();
  }

  onSeniorityChange(value: string) {
    this.filters.update((f) => ({ ...f, seniority: value }));
    this.refreshData();
  }

  onMinYearsChange(value: number) {
    this.filters.update((f) => ({ ...f, minYears: value }));
    this.refreshData();
  }

  onAvailabilityChange(value: boolean) {
    this.filters.update((f) => ({ ...f, availability: value }));
    this.refreshData();
  }

  refreshData() {
    this.isLoading = true;
    this.candidateService
      .loadCandidates(this.currentPage(), this.pageSize(), this.filters())
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.totalItems.set(response.meta.total);
        },
        error: (err) => {
          this.isLoading = false;
          console.error('Error loading data', err);
        },
      });
  }

  openAddDialog() {
    const dialogRef = this.dialog.open(AddCandidateDialogComponent, {
      width: '500px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.totalItems.set(this.totalItems() + 1);
        this.alertService.showSuccess('Candidate added successfully!');
      }
    });
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
            this.refreshData();
            this.alertService.showSuccess('Candidate deleted successfully!');
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
        this.alertService.showSuccess('Candidate updated successfully!');
      }
    });
  }
}
