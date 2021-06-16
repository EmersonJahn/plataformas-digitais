import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { GlobalConstants } from '../common/global-constants';
import { AppService } from '../app.service';
import { Person } from '../classes/Person';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css', '../app.component.css']
})
export class SignUpComponent implements OnInit {

  private servicesUrl = GlobalConstants.servicesUrl;

  public userId = Number(localStorage.getItem("userId"));

  public personType:Number = 0;
  public name              = "";
  public cpf               = "";
  public cnpj              = "";
  public email             = "";
  public password          = "";
  public passwordConfirm   = "";
  public profilePhoto      = this.getDefaultProfilePhotoBase64();

  public isValidName           = true;
  public isValidCpfCnpj        = true;
  public isValidEmail          = true;
  public isValidPassword       = true;
  public isValidPasswordConfim = true;

  constructor(private appService: AppService, private toastr: ToastrService, private http: HttpClient) { }

  ngOnInit(): void {
    this.getPerson();
  }

  public signUp() {
    if (this.name.trim().length > 0) {
      this.isValidName = true;
    } else {
      this.isValidName = false;
    }

    if (this.cpf.trim().length > 0 || this.cnpj.trim().length > 0) {
      this.isValidCpfCnpj = true;
    } else {
      this.isValidCpfCnpj = false;
    }

    if (this.email.trim().length > 0) {
      this.isValidEmail = true;
    } else {
      this.isValidEmail = false;
    }

    if (this.password.trim().length > 0 || this.userId) {
      this.isValidPassword = true;
    } else {
      this.isValidPassword = false;
    }

    if (this.passwordConfirm.trim().length > 0 || this.userId) {
      this.isValidPasswordConfim = true;
    } else {
      this.isValidPasswordConfim = false;
    }

    if (!this.isValidName || !this.isValidCpfCnpj || !this.isValidEmail || !this.isValidPassword || !this.isValidPasswordConfim) {
      this.toastr.error("Todos os campos devem ser preenchidos.");
      return;
    }

    if (this.password.trim() != this.passwordConfirm.trim()) {
      this.isValidPassword       = false;
      this.isValidPasswordConfim = false;
      this.toastr.error("Senhas não coincidem.")
      return;
    }

    const personId = this.userId ? this.userId : 0
    const person   = new Person(personId, this.personType, this.name, this.cpf, this.cnpj, this.email, this.password, this.profilePhoto);

    this.http.post<any>(this.servicesUrl + 'SavePerson.php', {'person': person}).subscribe(
      sucess => {
        console.log(sucess);
        if (sucess['status'] == 1) {
          this.toastr.success(sucess['message']);
          localStorage.setItem('profilePhoto', this.profilePhoto);
        } else {
          this.toastr.error(sucess['message']);
        }

      },
      error => {
        console.log(error);
        this.toastr.error("Ocorreu um erro desconhecido ao salvar o cadatro.");
      }
    )

  }

  public onFileChanged(event: Event) {
    const input = event.target as HTMLInputElement;
    let reader = new FileReader();

    if (input.files) {
      reader.readAsDataURL(input.files[0]);
      reader.onload = (event) => {
        const photo = event.target!.result;
        if (typeof photo == 'string') {
          this.profilePhoto = photo;
        }
      }
    }    
  }

  private getPerson() {
    if (this.userId) {
      this.appService.getPersonById(this.userId).then(person => {
        this.personType   = person['person_type_id'];
        this.name         = person['name'];
        this.cpf          = person['cpf'];
        this.cnpj         = person['cnpj'];
        this.email        = person['email'];
        this.profilePhoto = person['profile_photo'];
      })
    }
  }

  private getDefaultProfilePhotoBase64() {
    return "data:image/png;base64,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";
  }
  
}
