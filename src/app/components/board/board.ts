import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { MatCardModule } from '@angular/material/card';
import { RouterModule } from '@angular/router';
import { BoardService } from './board.service';
import { BoardCard } from './types';
import { MatDialog } from '@angular/material/dialog';
import { BoardCardDialogComponent } from '../boardCardDialog/board-card-dialog';
import { User } from '../userSelect/types';
import { UserService } from '../userSelect/user.service';
import { MatMenuModule } from '@angular/material/menu';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [RouterModule, CommonModule, DragDropModule, MatCardModule, MatMenuModule],
  templateUrl: './board.html',
  styleUrl: './board.css',
})
export class Board {
  todo: BoardCard[] = [];

  doing: BoardCard[] = [];

  done: BoardCard[] = [];

  users: User[] = [];

  getUserById(userId?: number): User | undefined {
    return this.users.find((u) => u.id === userId);
  }

  private readonly laneStatusMap: Record<string, string> = {
    todo: 'TODO',
    doing: 'IN_PROGRESS',
    done: 'COMPLETED',
  };

  private mapLaneToStatus(laneId: string): string {
    const status = this.laneStatusMap[laneId];
    if (!status) throw new Error('Raia inválida');
    return status;
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'LOW':
        return 'card-low';
      case 'MEDIUM':
        return 'card-medium';
      case 'HIGH':
        return 'card-high';
      case 'URGENT':
        return 'card-urgent';
      default:
        return '';
    }
  }

  getCardClasses(card: BoardCard) {
    if (card.status === 'CANCELED') {
      return 'card-canceled';
    }

    return this.getPriorityClass(card.priority);
  }

  getPriorityLabel(priority: string): string {
    switch (priority) {
      case 'LOW':
        return 'Baixa 🟢';
      case 'MEDIUM':
        return 'Média 🟡';
      case 'HIGH':
        return 'Alta 🔴';
      case 'URGENT':
        return 'Urgente 🚨';
      default:
        return '';
    }
  }

  private removeCardFromBoard(card: BoardCard) {
    this.todo = this.todo.filter((c) => c.id !== card.id);
    this.doing = this.doing.filter((c) => c.id !== card.id);
    this.done = this.done.filter((c) => c.id !== card.id);
  }

  private moveCardBetweenLanes(card: BoardCard, newStatus: BoardCard['status']) {
    this.removeCardFromBoard(card);

    switch (newStatus) {
      case 'TODO':
        this.todo.push(card);
        break;
      case 'IN_PROGRESS':
        this.doing.push(card);
        break;
      case 'COMPLETED':
        this.done.push(card);
        break;
      case 'CANCELED':
        this.done.push(card);
        break;
    }
  }

  constructor(
    private boardService: BoardService,
    private userService: UserService,
    private cd: ChangeDetectorRef,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.boardService.getBoard().subscribe((board) => {
      this.todo = board.TODO ?? [];
      this.doing = board.IN_PROGRESS ?? [];
      this.done = (board.COMPLETED ?? []).concat(board.CANCELED ?? []);

      this.cd.detectChanges();
    });

    this.userService.listAllUsers().subscribe((users) => {
      this.users = users;

      this.cd.detectChanges();
    });
  }

  drop(event: CdkDragDrop<any[]>) {
    const card = event.previousContainer.data[event.previousIndex];

    if (card.status === 'CANCELED' && event.container.id !== 'done') {
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'Você não pode movimentar uma tarefa cancelada. Atualize o status da tarefa.',
        timer: 5000,
        showConfirmButton: false,
        timerProgressBar: true,
      });
      return;
    }

    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }

    const newStatus = this.mapLaneToStatus(event.container.id);
    const newOrd = event.currentIndex + 1;

    this.boardService
      .patchCard(card.id, { status: newStatus as BoardCard['status'], ord: newOrd })
      .subscribe({
        next: (savedCard) => {
          Object.assign(card, savedCard);

          event.container.data.sort((a, b) => a.ord - b.ord);
        },
        error: () => {
          if (event.previousContainer === event.container) {
            moveItemInArray(event.container.data, event.currentIndex, event.previousIndex);
          } else {
            transferArrayItem(
              event.container.data,
              event.previousContainer.data,
              event.currentIndex,
              event.previousIndex
            );
          }
        },
      });
  }

  openCard(card: BoardCard) {
    const dialogRef = this.dialog.open(BoardCardDialogComponent, {
      width: '500px',
      data: structuredClone(card),
    });

    dialogRef.afterClosed().subscribe((updatedCard) => {
      if (!updatedCard) return;

      const previousStatus = card.status;
      const { id, createdAt, ...payload } = updatedCard;

      this.boardService.patchCard(card.id, payload).subscribe((savedCard) => {
        if (previousStatus !== savedCard.status) {
          this.moveCardBetweenLanes(card, savedCard.status);
        }

        Object.assign(card, savedCard);
        this.cd.detectChanges();
      });
    });
  }

  getInitials(name: string): string {
    if (!name) return '';
    const words = name.split(' ');
    if (words.length === 1) return words[0].charAt(0);
    return words[0].charAt(0) + words[words.length - 1].charAt(0);
  }

  createCard() {
    const dialogRef = this.dialog.open(BoardCardDialogComponent, {
      width: '500px',
      data: {},
    });

    dialogRef.afterClosed().subscribe((newCard: BoardCard) => {
      if (!newCard) return;

      switch (newCard.status) {
        case 'TODO':
          newCard.ord = this.todo.length + 1;
          break;
        case 'IN_PROGRESS':
          newCard.ord = this.doing.length + 1;
          break;
        case 'COMPLETED':
          newCard.ord = this.done.length + 1;
          break;
        case 'CANCELED':
          newCard.ord = this.done.length + 1;
          break;
      }

      this.boardService.createCard(newCard).subscribe((createdCard) => {
        this.moveCardBetweenLanes(createdCard, createdCard.status);
        this.cd.detectChanges();
      });
    });
  }
}
