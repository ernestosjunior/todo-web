import { ChangeDetectorRef, Component } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';
import { CadastroService } from './cadastro.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-cadastro',
  templateUrl: './cadastro.html',
  styleUrls: ['./cadastro.css'],
  imports: [RouterModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
})
export class Cadastro {
  form: FormGroup;

  loading = false;

  constructor(
    private fb: FormBuilder,
    private cadastroService: CadastroService,
    private cd: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;

    this.cadastroService
      .cadastrar({ ...this.form.value, role: 'ADMIN' })
      .pipe(
        finalize(() => {
          this.loading = false;
          try {
            this.cd.markForCheck();
          } catch (e) {}
        })
      )
      .subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Cadastrado',
            text: 'Usuário cadastrado com sucesso.',
            confirmButtonColor: 'var(--mat-sys-primary)',
          });
          this.form.reset();
        },
        error: (err) => {
          if (err.status === 409) {
            Swal.fire({
              icon: 'error',
              title: 'Erro',
              text: 'Usuário já cadastrado.',
              confirmButtonColor: 'var(--mat-sys-primary)',
            });
            return;
          }

          Swal.fire({
            icon: 'error',
            title: 'Erro',
            text: err?.message ?? 'Ocorreu um erro',
            confirmButtonColor: 'var(--mat-sys-primary)',
          });
        },
      });
  }
}
