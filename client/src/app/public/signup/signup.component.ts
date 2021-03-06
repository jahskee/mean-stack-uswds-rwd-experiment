import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { passwordMatchValidator } from "../../_validators/password.match.validator";
import { InputText } from "../../_components/input-text/input-text";
import { InputPhone } from "../../_components/input-phone/input-phone";
import { InputPasswordAndConfirm } from "../../_components/input-password-and-confirm/input-password-and-confirm";
import { CookieService } from 'angular2-cookie/services/cookies.service';
import { Router, NavigationExtras } from '@angular/router';

import { CrudService } from  "../../_services/_crud-service/crud.service";
import { AppService } from  "../../_services/app-service/app.service";

@Component({
  selector: "app-signup",
  templateUrl: "./signup.component.html",
  styleUrls: ["./signup.component.scss"]
})
export class SignupComponent implements OnInit {
  constructor(
    private _cookieService:CookieService, 
    private _crudService: CrudService,
    private appService: AppService,
    private router: Router) {}

  @Output() addCustomerEvent = new EventEmitter();

  message = "";
  isShowSuccessMessage = false;
  isShowErrorMessage = false;

  customer: FormGroup;
  ngOnInit() {
    this.customer = new FormGroup(
      {
        firstname: new FormControl(
          "",
          Validators.pattern("^[a-zA-z ,']{1,30}$")
        ),
        lastname: new FormControl(
          "",
          Validators.pattern("^[a-zA-z ,']{1,30}$")
        ),
        email: new FormControl(
          "",
          Validators.pattern(
            /^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/
          )
        ),
        phone: new FormControl(
          "",
          Validators.pattern(/^\(\d{3}\)\s\d{3}\-\d{4}$/)
        ),
        password1: new FormControl("", Validators.required),
        password2: new FormControl("", Validators.required)
      },
      passwordMatchValidator
    );

  }

  onSubmit() {
  
    try {
  
      this.clearMessages();

      if (!this.customer.valid) {
        this.message = "Customer creation error.";
        this.isShowErrorMessage = true;
        return false;
      }

      // reshape customerObj obj literal
      let customerObj = this.customer.value;
      customerObj = {
        ...customerObj,
        password: customerObj.password1,
        createdAt: null,
        updatedAt: null
      };
      delete customerObj.password1;
      delete customerObj.password2;
  
      this._crudService.create("Customer", customerObj).subscribe(data => {
        this.addCustomerEvent.emit();
        console.log("create new customer success!");
        this.customer.reset();
        sessionStorage.setItem('email', customerObj.email)     
      });
      
      const jwtPayload = {
        email: customerObj.email,
        firstname: customerObj.firstname,
        lastname: customerObj.lastname,
        role: 'customer',
      }

      this.appService.getToken(jwtPayload).subscribe(
        jwtToken => {
         //alert(JSON.stringify(jwtToken));
         sessionStorage.setItem('jwtToken', JSON.stringify(jwtToken));
         
        },
        error => {
          alert(JSON.stringify(error))
        }
      );
      
      this.message = "Customer create success.";   
      this.isShowSuccessMessage = true;
    
      this.router.navigate(['/signin2']);
      
    } catch (err) {
      this.message = "Customer create failed.";
 
      return false;
    }
  }

  formClick() {
    this.message = "";
    this.clearMessages();
  }

  clearMessages() {
    this.isShowSuccessMessage = false;
    this.isShowErrorMessage = false;
  }
}
