import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ContactService } from '../service/contact.service';

/**
 * @export
 * @class EditContactComponent
 * @implements {OnInit}
 */
@Component({
  selector: 'app-edit-contact',
  templateUrl: './edit-contact.component.html',
  styleUrls: ['./edit-contact.component.scss']
})
export class EditContactComponent implements OnInit, OnDestroy {

  submitted: boolean = false;
  contactForm!: FormGroup;
  contactSubscription!: Subscription;

  /**
   * Creates an instance of EditContactComponent.
   * @param {FormBuilder} formBuilder
   * @param {Router} router
   * @param {ContactService} contactService
   * @memberof EditContactComponent
   */
  constructor(private formBuilder: FormBuilder, private router: Router, private contactService: ContactService) { }

   /**
   * Initialize contact form and added requried validators
   * Name Validator(only allow for characters, numbers and no special characters except underscore '_' )
   * Email Validator(default email validator from angular forms)
   * Phone number Validator(only allow for numbers starting with +95)
   * @memberof EditContactComponent
   */
  ngOnInit(): void {
    // initialize contact form including Validators
    this.contactForm = this.formBuilder.group({
      name: new FormControl('', Validators.compose([Validators.required, Validators.pattern('[a-zA-Z_][0-9a-zA-Z_]*')])),
      email: new FormControl('', [Validators.required, Validators.email]),
      phone: new FormControl('', Validators.compose([Validators.required, Validators.pattern('^(\\+95-?)|0-?[0-9]$')]))
    })
  }

  /**
   * only for accessing form controls
   * @readonly
   * @memberof EditContactComponent
   * @see FormControl
   */
  get formControls() {
    return this.contactForm.controls;
  }
  /**
   * form submittion function when save
   * if submitted form is valid, data will be updated on json server(created contact id is auto-generated)
   * and redirect to contacts list
   * @see ContactService
   */
  onSubmit() {
    this.submitted = true;
    if (this.contactForm.valid) {
      this.contactSubscription = this.contactService.createContact(this.contactForm.value).subscribe(console.log);
      this.submitted = false;
      this.router.navigateByUrl('./contacts');
    }
  }

  /**
   * unsubscribed subscription when component get destroyed
   * @memberof EditContactComponent
   */
  ngOnDestroy(): void {
    this.contactSubscription?.unsubscribe();
  }

}
