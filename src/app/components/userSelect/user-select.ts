import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { UserService } from './user.service';
import { User } from './types';

@Component({
  selector: 'app-user-select',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatSelectModule, ReactiveFormsModule],
  template: `
    <mat-form-field style="width: 100%;">
      <mat-label>Responsável</mat-label>
      <mat-select
        required
        [formControl]="control"
        [compareWith]="compareFn"
        (selectionChange)="onSelect($event.value)"
      >
        <mat-option *ngFor="let user of users" [value]="user.id">
          {{ user.name }}
        </mat-option>
      </mat-select>
    </mat-form-field>
  `,
})
export class UserSelectComponent implements OnInit, OnChanges {
  @Input() disabled = false;
  @Input() selectedUser?: number;
  @Output() userSelected = new EventEmitter<number>();

  control = new FormControl();
  users: User[] = [];

  constructor(private userService: UserService, private cd: ChangeDetectorRef) {}

  ngOnInit() {
    this.userService.listAllUsers().subscribe((users) => {
      this.users = users;

      if (this.selectedUser != null) {
        this.control.setValue(this.selectedUser, { emitEvent: false });
      }

      this.cd.detectChanges();
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedUser']) {
      const val = changes['selectedUser'].currentValue;

      this.control.setValue(val || null, { emitEvent: false });
    }

    if (changes['disabled']) {
      this.disabled
        ? this.control.disable({ emitEvent: false })
        : this.control.enable({ emitEvent: false });
    }
  }

  compareFn(v1: any, v2: any): boolean {
    return String(v1) === String(v2);
  }

  onSelect(userId: number) {
    this.userSelected.emit(userId);
  }
}
