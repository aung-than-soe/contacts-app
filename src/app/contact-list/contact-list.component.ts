import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Contact } from '../models/contact.mode';
import { ContactService } from '../service/contact.service';

/**
 * @export
 * @class ContactListComponent
 * @implements {OnInit}
 */
@Component({
  selector: 'app-contact-list',
  templateUrl: './contact-list.component.html',
  styleUrls: ['./contact-list.component.scss']
})
export class ContactListComponent implements OnInit {

  contacts$!: Observable<Contact[]>;

  constructor(private contactService: ContactService) {

  }
  ngOnInit(): void {
    this.contacts$ = this.contactService.getAllContacts();
  }

}
