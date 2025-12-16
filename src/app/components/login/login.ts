import { ChangeDetectorRef, Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import {
  Validators,
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
  FormBuilder,
} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { LoginService } from './login.service';
import { finalize } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  imports: [
    RouterModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatButtonModule,
  ],
  styleUrl: './login.css',
})
export class Login {
  form: FormGroup;

  loading = false;

  constructor(
    private fb: FormBuilder,
    private loginService: LoginService,
    private cd: ChangeDetectorRef,
    private router: Router
  ) {
    this.form = this.fb.group({
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

    this.loginService
      .login(this.form.value)
      .pipe(
        finalize(() => {
          this.loading = false;
          try {
            this.cd.markForCheck();
          } catch (e) {}
        })
      )
      .subscribe({
        next: (value) => {
          localStorage.setItem('token', value.token);
          localStorage.setItem('user', JSON.stringify(value.user));

          this.router.navigateByUrl('/board');
          this.form.reset();
        },
        error: (err) => {
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
