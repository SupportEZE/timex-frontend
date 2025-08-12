import { CommonModule, DOCUMENT, Location } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, Inject, Renderer2, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { Router, RouterModule } from '@angular/router';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { AuthService } from '../../shared/services/auth.service';
import { FirebaseService } from '../../shared/services/firebase.service';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireDatabaseModule } from '@angular/fire/compat/database';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { ToastrServices } from '../../shared/services/toastr.service ';
import { first } from 'rxjs';
import { CommonApiService } from '../../shared/services/common-api.service';
import { ApiService } from '../../core/services/api/api.service';
import { Title } from '@angular/platform-browser';
import { FormValidationService } from '../../utility/form-validation';
import {
    trigger,
    transition,
    style,
    animate
} from '@angular/animations';
import { SpkNgSelectComponent } from '../../../@spk/spk-ng-select/spk-ng-select.component';
import { SharedModule } from '../../shared/shared.module';
import { API_TYPE } from '../../utility/constants';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [
        SharedModule,
        RouterModule,
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        ToastrModule,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    providers: [
        FirebaseService,
        { provide: ToastrService, useClass: ToastrService }
    ],  templateUrl: './login.component.html',
    styleUrl: './login.component.scss',
    animations: [
        trigger('slideFade', [
            transition(':enter', [
                style({ transform: 'translateX(100%)', opacity: 0 }),
                animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
            ]),
            transition(':leave', [
                animate('300ms ease-in', style({ transform: 'translateX(-100%)', opacity: 0 }))
            ])
        ])
    ]
})
export class LoginComponent {
    @ViewChild('swiperContainer1') swiperContainer1!: ElementRef;
    public showPassword: boolean = false;
    loginType: string = '';
    public toggleClass: string = 'ri-eye-fill'; // Default to "eye" icon
    active="Angular";
    firestoreModule: any;
    databaseModule: any;
    authModule: any;
    username = '';
    password = '';
    activeLoginTab:any = 'backend_team'
    activeTab:any = 'login'
    errorMessage = ''; // validation _error handle
    _error: { name: string; message: string } = { name: '', message: '' }; // for firbase _error handle
    disabled = '';
    public loginForm!: FormGroup;
    public individualForm!: FormGroup;
    public authorizedPersonForm!: FormGroup;
    public otpForm!: FormGroup;
    
    
    iconMap: any = {
        Facebook: 'ri-facebook-fill',
        Instagram: 'ri-instagram-fill',
        LinkedIn: 'ri-linkedin-box-fill',
        Youtube: 'ri-youtube-fill',
        'X-Twitter': 'ri-twitter-fill',
        'Google Review': 'ri-google-fill'
    };
    
    constructor(
        private location: Location,
        @Inject(DOCUMENT) private document: Document,private elementRef: ElementRef,
        private auth:AuthService,
        private sanitizer: DomSanitizer,
        public authservice: AuthService,
        private router: Router,
        private formBuilder: FormBuilder,
        private renderer: Renderer2,
        private firebaseService: FirebaseService,
        // public ToastrServices:
        public commonapi:CommonApiService,
        private toastr: ToastrServices,
        public api: ApiService,
        private titleService: Title,
        private authService: AuthService,
        public formValidation: FormValidationService,
    ) {
        // AngularFireModule.initializeApp(environment.firebase);
        document.body.classList.add('authentication-background');
        const bodyElement = this.renderer.selectRootElement('body', true);
        //  this.renderer.setAttribute(bodyElement, 'class', 'cover1 justify-center');
        
    }
    
    // firestoreModule = this.firebaseService.getFirestore();
    // databaseModule = this.firebaseService.getDatabase();
    // authModule = this.firebaseService.getAuth();
    
    ngOnDestroy(): void {
        document.body.classList.remove('authentication-background');    
    }
    ngOnInit(): void {
        this.location.replaceState('auth/login');
        this.loginForm = this.formBuilder.group({
            username: ['', [Validators.required]],
            password: ['', Validators.required],
        });
        
        // Initialize Firebase services here
        this.firestoreModule = this.firebaseService.getFirestore();
        this.databaseModule = this.firebaseService.getDatabase();
        this.authModule = this.firebaseService.getAuth();
    }
    
    
    markAllUntouched(form: FormGroup) {
        Object.keys(form.controls).forEach(key => {
            form.controls[key].markAsPristine();
            form.controls[key].markAsUntouched();
            form.controls[key].updateValueAndValidity();
        });
    }
    
    // ----------------------------------Backend Admin Section Start----------------------------------------- //
    submit() {
        if (!this.loginForm.valid) {
            this.toastr.error('Form Is Invalid', '', 'toast-top-right')
            return; // Stop if any form is invalid
        }
        this.api.disabled = true;
        this.auth.login(this.loginForm.value , 'web-login').pipe(first()).subscribe({
            next: (result: any) => {
                if (result === true) {
                    this.api.disabled = false;
                    if (this.commonapi.fcmToken) {
                        localStorage.setItem('fcmToken', this.commonapi.fcmToken);
                    }
                    // const modulesData = JSON.parse(localStorage.getItem('modules') || '[]');
                    this.api.disabled = false;
                    const orgData = this.authService.getUser();
                    if (orgData?.login_type_id === 2) {
                        this.router.navigate(['/apps/customer/customer-list/5/vendor']);
                    } else if (orgData?.login_type_id === 3) {
                        this.router.navigate(['/apps/service/warranty-registration']);
                    } else if (orgData?.login_type_id === 5) {
                        this.router.navigate(['/apps/customer/customer-list/5/vendor']);
                    }

                } else {
                    this.toastr.error('Login failed. Invalid credentials or user inactive.', '', 'toast-top-right');
                    this.router.navigate(['']);
                }
            },
            error: (err) => {
                this.toastr.error('Something went wrong during login. Please try again later.', '', 'toast-top-right');
            }
        });
    }
    
    // ----------------------------------Backend Admin Section End----------------------------------------- //
    
    public togglePassword() {
        this.showPassword = !this.showPassword; // Toggle the password visibility
        this.toggleClass = this.showPassword ? 'ri-eye-off-fill' : 'ri-eye-fill'; // Toggle the icon
    }
    
    authOrgData = {
        org: {
            org_name: 'Timex Bond',
            title: 'Smart Solutions for Smart People',
            sub_title: 'Smart Solutions for Smart People',
            website_url: 'https://timexbond.com/',
            play_store_link: 'https://timexbond.com/',
            app_store_link: 'https://timexbond.com/',
        },
        social: [
            {
                title: 'Facebook',
                social_url: 'https://www.facebook.com/timexbond.official'
            },
            {
                title: 'Instagram',
                social_url: 'https://www.instagram.com/timexbond.official/'
            },
            {
                title: 'Linkedin',
                social_url: 'https://www.linkedin.com/company/timex-bond/'
            }
        ]
    };
    
    webBanner = [
        { src: './assets/images/media/media-31.png' },
        { src: './assets/images/media/media-32.png' },
        { src: './assets/images/media/media-33.png' }
    ];
}