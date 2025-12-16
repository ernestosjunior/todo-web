import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { BoardCard } from '../board/types';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { User } from '../userSelect/types';
import { UserSelectComponent } from '../userSelect/user-select';

@Component({
  standalone: true,
  selector: 'app-board-card-dialog',
  providers: [provideNativeDateAdapter(), { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' }],
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatDatepickerModule,
    MatSelectModule,
    UserSelectComponent,
  ],
  templateUrl: './board-card-dialog.html',
  styleUrl: './board-card-dialog.css',
})
export class BoardCardDialogComponent {
  isEditing = false;
  isNewTask = false;

  originalData: BoardCard;

  constructor(
    private dialogRef: MatDialogRef<BoardCardDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: BoardCard
  ) {
    if (!data.id) {
      this.isNewTask = true;
      this.isEditing = true;
      this.originalData = {} as BoardCard;
    } else {
      this.originalData = structuredClone(data);
    }
  }

  close() {
    if (this.isEditing) {
      this.data = structuredClone(this.originalData);
      this.isEditing = false;
    } else {
      this.dialogRef.close();
    }
  }

  toggleEdit() {
    this.isEditing = true;
  }

  save() {
    if (this.data.deadline && new Date(this.data.deadline) < new Date(this.data.createdAt)) {
      alert('Prazo não pode ser anterior à data de criação.');
      return;
    }

    if (!this.data.description) {
      this.data.description = '';
    }

    this.dialogRef.close(this.data);
  }

  onUserSelected(userId: number) {
    console.log('Usuário selecionado:', userId);
    this.data.userId = userId;
  }
}
