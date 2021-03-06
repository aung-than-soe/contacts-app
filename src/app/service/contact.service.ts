import { Contact } from './../models/contact.mode';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { shareReplay } from 'rxjs/operators';

/**
 * @export
 * @class ContactService
 */
@Injectable({
  providedIn: 'root'
})
export class ContactService {

  /**
   * Creates an instance of ContactService.
   * @param {HttpClient} httpClient inject Angualr HttpClient for HTTP request
   * @memberof ContactService
   */
  constructor(private httpClient: HttpClient) { }

  /**
   * Retrieved all contacts from server
   * @return {*}  {Observable<Contact[]>}
   * @memberof ContactService
   */
  getAllContacts(): Observable<Contact[]> {
    return this.retrieveAllContacts();
  }

  private retrieveAllContacts() {
    return this.httpClient.get<Contact[]>(`${environment.BASE_URL}/contacts`).pipe(shareReplay());
  }
  /**
   * Send HTTP request to create or update contact
   * @param {Contact} contact required
   * @return {*} {Observable<Contact>}
   * @memberof ContactService
   */
  createOrUpdateContact(contact: Contact): Observable<Contact> {
    if(contact.id && contact.id != '0') {
      return this.httpClient.put<Contact>(`${environment.BASE_URL}/contacts/${contact.id}`, contact);
    }
    return this.httpClient.post<Contact>(`${environment.BASE_URL}/contacts`, contact);
  }

  /**
   *
   * @param id required to retrieve a contact
   * @returns {Observable<Contact>}
   */
  getContactById(id: string): Observable<Contact> {
    return this.httpClient.get<Contact>(`${environment.BASE_URL}/contacts/${id}`);
  }

  /**
   *
   * @param id required to delete a contact
   * @returns {Observable<any>}
   */
  deleteContactById(id: string) {
    return this.httpClient.delete<any>(`${environment.BASE_URL}/contacts/${id}`);
  }

}
