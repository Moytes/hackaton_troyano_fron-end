import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    CheckboxModule,
    CardModule,
    MessageModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  errorMessage = '';
  usuariosDemostracion = [
    { usuario: 'admin', contrasena: 'admin2024', rol: 'Administrador' },
    { usuario: 'doctor', contrasena: 'doctor', rol: 'Doctor' },
    { usuario: 'superadmin', contrasena: 'super', rol: 'Super Administrador' }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
      remember: [false]
    });
  }

  login(): void {
    if (this.loginForm.invalid) {
      this.errorMessage = 'Por favor completa todos los campos';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const { username, password, remember } = this.loginForm.value;
    const loginExitoso = this.authService.login(
      { username, password },
      remember
    );

    this.loading = false;

    if (!loginExitoso) {
      this.errorMessage = 'Usuario o contraseña incorrectos';
    }
  }

  usarCredencialDemostracion(usuario: string, contrasena: string): void {
    this.loginForm.patchValue({
      username: usuario,
      password: contrasena
    });
  }
}
