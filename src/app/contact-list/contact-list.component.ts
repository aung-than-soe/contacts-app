import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { fromEvent, Observable, Subscription } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';
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
export class ContactListComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild("searchInput") searchInput!: ElementRef;
  contacts$!: Observable<Contact[]>;
  contacts: Contact[] = [];
  idToDelete!: string;
  subscriptions: Subscription[] = [];
  toastKlassRef: string = '.toast';
  noContact: boolean = false;
  searching: boolean = false;

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
   * searching implementation after view has been initialized
   */
  ngAfterViewInit(): void {
    const sub = fromEvent(this.searchInput.nativeElement as HTMLInputElement, 'keyup').pipe(
      map((event: any) => event.target.value),
      tap(val => {
        if(!val) {
          this.searching = false;
          this.retrieveAllContacts()
        }
      }),
      filter(val => val && val.trim())
    ).subscribe(val => {
      this.searching = !!val;
      this.contacts = this.contacts.filter(({name, phone, email}) => name.includes(val) || email.includes(val) || phone.includes(val));
      this.subscriptions.push(sub);
    })
  }

  /**
   * retrieve private function
   */
  private retrieveAllContacts(): void {
    const sub = this.contactService.getAllContacts().subscribe(contacts => {
      this.contacts = [...contacts];
      if(this.contacts && this.contacts.length == 0) {
        this.noContact = true;
      }
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
