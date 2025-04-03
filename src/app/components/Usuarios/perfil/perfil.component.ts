import { Component, OnInit } from '@angular/core';
import { Usuario } from '../../../Models/models';
import { ServicesService } from '../../../Services/services.service';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css'],
})
export class PerfilComponent implements OnInit {
  usuarios: Usuario[] = [];
  usuario_id: number = 0;
  usuarioSeleccionado: Usuario | null = null;
  form: FormGroup;

  imagePreviewUrl: string | null = null; // Nueva propiedad para la vista previa de la imagen
  selectedImage: File | null = null; // Propiedad para almacenar la imagen seleccionada

  isPasswordVisible = false;

  constructor(private perfilService: ServicesService, private fb: FormBuilder) {
    this.form = this.fb.group({
      nombre_usuario: ['', Validators.required],
      apellido: ['', Validators.required],
      fecha_nacimiento: ['', Validators.required],
      telefono: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      correo: ['', [Validators.required, Validators.email]],
      password: ['', this.passwordValidator], // Solo el validador personalizado, sin Validators.required
      ci: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      ci_departamento: ['', Validators.required],
      estado_Usuario: [true],
      imagen: [null],
    });
  }

  ngOnInit(): void {
    this.getUsuarios();
    this.recuperarUsuario();
  }
  getUsuarios() {
    this.perfilService.getUsuarios().subscribe((data) => {
      this.usuarios = data;
    });
  }
  private getUsuarioLocalStorage() {
    if (typeof window !== 'undefined') {
      try {
        const usuario = localStorage.getItem('usuario');
        return usuario ? JSON.parse(usuario) : null;
      } catch (error) {
        console.error('Error al recuperar usuario de localStorage', error);
        return null;
      }
    }
    return null;
  }

  recuperarUsuario() {
    const usuario = this.getUsuarioLocalStorage();
    if (usuario) {
      this.usuario_id = usuario.usuario_id || 0;

      this.perfilService
        .verificarUsuario(this.usuario_id)
        .subscribe((usuarioExistente) => {
          if (usuarioExistente) {
            const usuarioSeleccionado = this.usuarios.find(
              (u) => u.id === this.usuario_id
            );
            if (usuarioSeleccionado) {
              this.usuarioSeleccionado = usuarioSeleccionado;
              this.cargarDatosEnFormulario(usuarioSeleccionado);
            }
          }
        });
    }
  }

  private cargarDatosEnFormulario(usuario: Usuario) {
    this.form.patchValue({
      nombre_usuario: usuario.nombre_usuario,
      apellido: usuario.apellido,
      fecha_nacimiento: usuario.fecha_nacimiento,
      telefono: usuario.telefono,
      correo: usuario.correo,
      /* password: usuario.password, */
      ci: usuario.ci,
      ci_departamento: usuario.ci_departamento,
      estado_Usuario: usuario.estado_Usuario,
    });
  }

  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedImage = input.files[0]; // Almacena la imagen seleccionada
      const reader = new FileReader();
      reader.onload = (e) => {
        // Establece la URL de la vista previa
        this.imagePreviewUrl = e.target?.result as string;
      };
      reader.readAsDataURL(this.selectedImage); // Lee la imagen como URL
    } else {
      this.selectedImage = null; // Resetea la imagen seleccionada si no hay archivo
      this.imagePreviewUrl = null; // Resetea la vista previa
    }
  }

  onSubmit() {
    // Verifica que el formulario sea válido
    if (this.form.valid) {
      const usuarioActualizado: FormData = new FormData();
      usuarioActualizado.append(
        'nombre_usuario',
        this.form.get('nombre_usuario')?.value
      );
      usuarioActualizado.append('apellido', this.form.get('apellido')?.value);
      usuarioActualizado.append(
        'fecha_nacimiento',
        this.form.get('fecha_nacimiento')?.value
      );
      usuarioActualizado.append('telefono', this.form.get('telefono')?.value);
      usuarioActualizado.append('correo', this.form.get('correo')?.value);

      // Solo agregar la contraseña si se ha proporcionado
      const passwordValue = this.form.get('password')?.value;
      if (passwordValue) {
        usuarioActualizado.append('password', passwordValue);
      }

      usuarioActualizado.append('ci', this.form.get('ci')?.value);
      usuarioActualizado.append(
        'ci_departamento',
        this.form.get('ci_departamento')?.value
      );
      usuarioActualizado.append(
        'estado_Usuario',
        this.form.get('estado_Usuario')?.value ? 'true' : 'false'
      );

      // Solo agregar la imagen si se ha seleccionado una nueva
      if (this.selectedImage) {
        usuarioActualizado.append(
          'imagen_url',
          this.selectedImage,
          this.selectedImage.name
        );
      }

      // Llama al servicio para editar el usuario
      this.perfilService
        .editarUsuario(this.usuario_id, usuarioActualizado)
        .subscribe(
          (response) => {
            alert('Usuario actualizado exitosamente');
            // Aquí puedes redirigir o hacer otra acción
          },
          (error) => {
            console.error('Error al actualizar el usuario:', error);
            alert(
              'Hubo un error al actualizar el usuario. Inténtalo de nuevo.'
            );
          }
        );
    } else {
      // Solo muestra el mensaje de error si hay campos obligatorios que no se han completado
      const invalidFields = Object.keys(this.form.controls).filter(
        (field) => this.form.get(field)?.invalid
      );
      if (invalidFields.length > 0) {
        alert('Por favor, completa todos los campos obligatorios.');
      }
    }
  }

  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }
  // Validador de contraseña
  passwordValidator(control: AbstractControl) {
    const value = control.value;

    // Si el campo está vacío, no se aplica la validación
    if (!value) {
      return null; // No hay error
    }

    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumber = /\d/.test(value);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
    const isValidLength = value.length >= 6;

    const valid =
      hasUpperCase &&
      hasLowerCase &&
      hasNumber &&
      hasSpecialChar &&
      isValidLength;

    return valid ? null : { invalidPassword: true };
  }
}
