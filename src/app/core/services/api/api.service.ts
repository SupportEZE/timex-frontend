import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';

import { catchError, map, Observable, of, throwError } from 'rxjs';

// import { CookieService } from 'ngx-cookie-service';
import { CryptoService } from '../crypto/crypto.service';
import { UtilService } from '../../../utility/util.service';
import { ToastrServices } from '../../../shared/services/toastr.service ';
import { AuthService } from '../../../shared/services/auth.service';
import { API_TYPE } from '../../../utility/constants';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  encrypt: boolean = false
  canActive: boolean = false;
  disabled: boolean = false;
  isDuplicate: boolean = false;
  userData: any = {}
  navApi: any;
  
  //-----For local----//
  
  //Vikas
  // public rootUrl = 'http://172.16.0.90:9002/timex/';
  // public url = 'http://172.16.0.90:9002/timex/';
  // public baseUrl = 'http://192.168.5.77:9002/timex/';
  // public authUrl = 'http://172.16.0.90:9002/timex/';
  // public upload = 'http://172.16.0.90:9002/timex/';
  
  
  // Lal`s Ip
  // public rootUrl = 'http://192.168.0.110:9002/';
  // public url = 'https://192.168.0.103/timex/';
  // public upload = 'http://172.16.0.138:9002/';
  // public baseUrl  ='http://192.168.0.110:9002/timex/';
  // public authUrl = 'http://192.168.0.110:9002/timex/auth/';
  // public adminUrl = 'https://192.168.0.103/timex/admin';
  // public webSocketUrl = 'https://192.168.0.103/timex';

  //-----For Live----//
  
  // ---- For Development ---- //
  
  public rootUrl = 'https://ezeone.tech:9002/';
  public url = 'https://ezeone.tech:9002/timex/';
  public upload = 'https://ezeone.tech:9002/';
  public baseUrl  ='https://ezeone.tech:9002/timex/';
  public authUrl = 'https://ezeone.tech:9002/timex/auth/';
  public adminUrl = 'https://ezeone.tech:9002/timex/admin';
  public webSocketUrl = 'https://ezeone.tech:9002/timex';
  
  constructor(private http: HttpClient, public crypto: CryptoService, public toastr: ToastrServices, private utilService: UtilService, private authService :AuthService) {}
  
  ngOnInit() {
  }
  
  // Method to set headers with token
  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept-Language': 'en',
    });
  }
  
  
  // test() {
  //   this.crypto.decryptData({ encryptedData: "YWJjZGVmMTIzNDU2Nzg5MA==::SAQHuMLxSqtOeuP7qncwutPNh4kX1lmCtB/52I1/WLphtgyq4ZuA0wnBLAUcUcMBt2+6FZQHs63vSHNJ6GPhgRen+KIj+X4dUzP60jjT9fU=" });
  //   console.log('test');
  // }
  
  
  // GET method
  get(endpoint: string): Observable<any> {
    const url = `${this.baseUrl}/${endpoint}`;
    return this.http.get(url, { headers: this.getHeaders() }).pipe(map((result: any) => {
      const decrypt = this.crypto.decryptData(JSON.stringify(result));
      return decrypt;
    }));
  }

  // POST method
  post(body: any, endpoint: string, urlType?:string): Observable<any> {
    const url = `${urlType === API_TYPE.AUTH ? this.authUrl : this.baseUrl}${endpoint}`;
    const isEncryptionEnabled = this.encrypt === true;
    const requestBody = isEncryptionEnabled
    ? this.crypto.encryptData(body)
    : body;
    const headers = this.getHeaders();
    
    return this.http.post(url, requestBody, { headers }).pipe(
      map((result: any) => {
        if (isEncryptionEnabled) {
          try {
            return this.crypto.decryptData(result);
          } catch (e) {
            console.error('Decryption error:', e);
            throw new Error('Failed to decrypt response data.');
          }
        } else {
          return result;
        }
      }),
      catchError((error: HttpErrorResponse) => {
        this.disabled = false;
        const errorMessage = this.utilService.handleApiError(error);
        this.toastr.error(errorMessage, '', 'toast-top-right');
        return of(error);
      })
    );
  }
 
  // PATCH method

  patch(body: any, endpoint: string): Observable<any> {
    const url = `${this.baseUrl}${endpoint}`;
    const isEncryptionEnabled = this.encrypt === true;
    
    const requestBody = isEncryptionEnabled
    ? { encryptedData: this.crypto.encryptData(body) }
    : body;
    
    const headers = this.getHeaders();
    
    return this.http.patch(url, requestBody, { headers }).pipe(
      map((result: any) => {
        if (isEncryptionEnabled) {
          try {
            return this.crypto.decryptData(result);
          } catch (e) {
            console.error('Decryption error:', e);
            throw new Error('Failed to decrypt response data.');
          }
        } else {
          return result;
        }
      }),
      catchError((error: HttpErrorResponse) => {
        this.disabled = false;
        const errorMessage = this.utilService.handleApiError(error);
        this.toastr.warning(errorMessage, '', 'toast-top-right');
        return of(error);
      })
    );
  }

  

  private getHeadersWithoutContentType(): HttpHeaders {
    const headers = this.getHeaders();
    return headers.delete('Content-Type'); // Let Angular set it automatically
  }
  uploadFile(formData: FormData, endpoint: string): Observable<any> {
    const url = `${this.baseUrl}${endpoint}`;
    return this.http.post(url, formData, {
      headers: this.getHeadersWithoutContentType(), // Remove Content-Type manually
    }).pipe(map((result: any) => result),
    catchError((error: HttpErrorResponse) => {
      this.disabled = false
      let errorMessage = this.utilService.handleApiError(error);
      this.toastr.error(errorMessage, '', 'toast-top-right');
      return of(error);
    }));
  }
  
  async getForms(id: any): Promise<any> {
    let data: any = localStorage.getItem('formBuilder');
    data = data ? JSON.parse(data) : [];
    return data.find((row: any) => row.form_id === id) || null;
  }
  
}
