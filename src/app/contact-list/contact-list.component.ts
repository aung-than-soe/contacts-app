import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { Contact } from '../models/contact.mode';
import { ContactService } from '../service/contact.service';
declare var $: any;

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
export class ContactListComponent implements OnInit, OnDestroy {

  contacts$!: Observable<Contact[]>;
  contacts: Contact[] = [];
  idToDelete!: string;

  subscriptions: Subscription[] = [];
  toastKlassRef: string = '.toast';

  constructor(private contactService: ContactService) {
  }

  /**
   * Retrieve all contacts when initialize component
   * @memberof ContactListComponent
   */
  ngOnInit(): void {
    $(this.toastKlassRef).toast({
      autohide: true,
      animation: true,
      delay: 3 * 1000
    });
    this.retrieveAllContacts();

  }

  /**
   * retrieve private function
   */
  private retrieveAllContacts(): void {
    const sub = this.contactService.getAllContacts().subscribe(contacts => {
      this.contacts = [...contacts];
      this.subscriptions.push(sub);
    })
  }

  /**
   * on delete action trigger
   * @param id
   */
  onDelete(id: string) {
    this.idToDelete = id;
  }

  /**
   * Delete contact via ContactService
   */
  deleteContact() {
    const deleteSub = this.contactService.deleteContactById(this.idToDelete).subscribe(_ => {
      this.retrieveAllContacts();
      $('#confirmModal').modal('hide');
      $(this.toastKlassRef).toast('show');
      this.subscriptions.push(deleteSub);
    });
  }

  /**
   * angular trackBy function when adding or removing contact from contact list.
   * @param index
   * @param contact
   * @returns
   */
  trackById(index: any, contact: Contact) {
    return contact.id;
  }

  /**
   * remove all subscription when component get destroyed
   */
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => {
      sub?.unsubscribe();
    })
  }
}
