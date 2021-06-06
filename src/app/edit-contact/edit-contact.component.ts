import { Contact } from './../models/contact.mode';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ContactService } from '../service/contact.service';
import { filter, pluck, switchMap } from "rxjs/operators";
declare var $: any;

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
  existingContacts!: Set<Contact>;
  contactAlreadyExist: boolean = false;
  toastKlassRef: string = '.toast';
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
  * Initialize toaster
  * Retrieve existing contacts for valdiation
  * Initialize contact form and added requried validators
  * Name Validator(only allow for characters, numbers and space )
  * Email Validator(default email validator from angular forms)
  * Phone number Validator(only allow for numbers starting with +95)
  * @memberof EditContactComponent
  */
  ngOnInit(): void {

    $(this.toastKlassRef).toast({
      autohide: true,
      animation: true,
      delay: 3 * 1000
    });

    this.retrieveExistingContacts();

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
    ).subscribe(({ name, email, phone, id }) => {
      this.formControls.id.setValue(id);
      this.formControls.name.setValue(name);
      this.formControls.email.setValue(email);
      this.formControls.phone.setValue(phone);
    })
  }

  private retrieveExistingContacts() {
    this.contactService.getAllContacts().subscribe(contacts => {
      this.existingContacts = new Set([...contacts])
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

      for (const c of this.existingContacts) {
        const { id, email, phone } = c;
        if (id === this.formControls.id.value) {
          const index = Array.from(this.existingContacts)
            .filter(a => a.id != this.formControls.id.value)
            .findIndex(a => a.email === this.formControls.email.value || this.removeSpace(a.phone) === this.removeSpace(this.formControls.phone.value));
          this.contactAlreadyExist = index != -1;

        } else if (this.removeSpace(email) === this.removeSpace(this.formControls.email.value) || this.removeSpace(phone) === this.removeSpace(this.formControls.phone.value)) {
          this.contactAlreadyExist = true;
        }

      }

      if (this.contactAlreadyExist) {
        $(this.toastKlassRef).toast('show');
      } else {
        this.contactService.createOrUpdateContact(this.contactForm.value).subscribe(_ => {
          this.submitted = false;
          this.router.navigateByUrl('./contacts');
        })
      }
    }
  }

  /**
   *
   * @param text required to remove space from given string value
   * @returns string type value without space
   */
  private removeSpace(text: string) {
    return text.replace(/\s/g, '');
  }

  /**
   * unsubscribed subscription when component get destroyed
   * @memberof EditContactComponent
   */
  ngOnDestroy(): void {
    this.contactSubscription?.unsubscribe();
  }

}
