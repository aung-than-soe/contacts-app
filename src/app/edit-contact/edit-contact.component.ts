import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ContactService } from '../service/contact.service';
import { filter, pluck, switchMap } from "rxjs/operators";
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
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private contactService: ContactService,
    private route: ActivatedRoute) { }

   /**
   * Initialize contact form and added requried validators
   * Name Validator(only allow for characters, numbers and space )
   * Email Validator(default email validator from angular forms)
   * Phone number Validator(only allow for numbers starting with +95)
   * @memberof EditContactComponent
   */
  ngOnInit(): void {
    // initialize contact form including Validators
    this.contactForm = this.formBuilder.group({
      id: new FormControl(''),
      name: new FormControl('', Validators.compose([Validators.required, Validators.pattern('[a-zA-Z ][0-9a-zA-Z ]*')])),
      email: new FormControl('', [Validators.required, Validators.email]),
      phone: new FormControl('', Validators.compose([Validators.required, Validators.pattern('^(\\+95-?)|0-?[0-9]$')]))
    });

    this.route.params.pipe(
      pluck('id'),
      filter(id => id && id != '0'),
      switchMap(id => this.contactService.getContactById(id))
      ).subscribe(({name, email, phone}) => {
      this.formControls.name.setValue(name);
      this.formControls.email.setValue(email);
      this.formControls.phone.setValue(phone);
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
      this.contactSubscription = this.contactService.createOrUpdateContact(this.contactForm.value).subscribe(console.log);
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
