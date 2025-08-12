import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, inject, ViewChild } from '@angular/core';
import { NavigationEnd, Router, Event,RouterOutlet } from '@angular/router';
import { AppStateService } from './shared/services/app-state.service';
import { SharedModule } from './shared/shared.module';
import { getMessaging, onMessage, getToken, Messaging } from '@angular/fire/messaging';
import { environment } from '../environments/environment';
import { ToastrServices } from './shared/services/toastr.service ';
import { CommonApiService } from './shared/services/common-api.service';
import { messaging } from './firebase.init'; 
import { ApiService } from './core/services/api/api.service';
import { AuthService } from './shared/services/auth.service';

@Component({
  standalone:true,
  selector: 'app-root',
  imports: [RouterOutlet,CommonModule,SharedModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})

export class AppComponent {
  title = 'ezeone';
  private devToolsAlreadyDetected = false;
  private devToolsTriggered = false;
  
  
  constructor(private appState: AppStateService, private commapi: CommonApiService, private router: Router, public toastr: ToastrServices, public api: ApiService, private authService: AuthService){
    (window as any).APP_ROOT_URL = this.api.rootUrl;
    this.appState.updateState();
    setTimeout(() => {
      this.requestPermission();
      this.listenForMessages();
    }, 1000);
  }
  // private messaging = inject(Messaging);
  
  requestPermission() {
    getToken(messaging, {
      vapidKey: environment.firebase.vapidKey
    })
    .then((token) => {
      localStorage.setItem('fcmToken',token);
      this.commapi.fcmToken = token
    })
    .catch((err) => {
      // console.error('Permission denied or error occurred', err);
    });
  }
  
  listenForMessages() {
    // Handle foreground messages
    onMessage(messaging, (payload:any) => {
      // this.commapi.getUnreadChat();
      this.toastr.notification(payload['notification']['title'] ,payload['notification']['body'],  'toast-bottom-right',false);
      this.playAudio();
      
      // Handle the message (showing a notification or custom logic)
    });
  }
  userInteracted:any
  ngOnInit() {
    
    // this.watchDevTools();
    // this.detectDomTampering();
    
    
    window.addEventListener('click', () => {
      this.userInteracted = true;
    }, { once: true });
    window.onload = () => {
      document.getElementById("webLoading")?.classList.add("Hide");
    };
    
    document.getElementById("webLoading")?.addEventListener('transitionend', () => {
      document.getElementById("webLoading")!.style.display = 'none';
    });
    
    
    
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        setTimeout(() => {
          // @ts-ignore
          HSStaticMethods.autoInit();
        }, 100);
      }
    });
    
    
    window.addEventListener('storage', (event) => {
      if (event.key === 'logout-event') {
        this.handleAutoLogout();
      }
    });
    
    // if ('BroadcastChannel' in window) {
    //   const channel = new BroadcastChannel('firebase-messages');
    //   channel.onmessage = (event) => {
    //     const payload = event.data;
    //     this.commapi.getUnreadChat();
    //     this.toastr.notification(payload['notification']['title'] ,payload['notification']['body'],  'toast-bottom-right',true);
    //     this.playAudio();
    //     if (document.hidden) {
    //       document.title = `🔔 ${payload.notification.title}`;
    //       setTimeout(() => document.title = this.title, 5000);
    //     }
    //   };
    // }
    // if (typeof BroadcastChannel !== "undefined") {
    //   const channel = new BroadcastChannel('firebase-messages');
    //   channel.onmessage = (event) => {
    //     this.commapi.getUnreadChat();
    //     if (Notification.permission === 'granted') {
    //       // Show the notification on other tabs if needed
    //       const notificationTitle = event.data.notification.title;
    //       const notificationOptions = {
    //         body: event.data.notification.body,
    //         // icon: '/firebase-logo.png',  // Customize with your own icon
    //       };
    
    //       // Display the notification in the other tab
    //       new Notification(notificationTitle, notificationOptions);
    //     }
    //   };
    // }
    
    
    const token = localStorage.getItem('authToken');
    if(token){
      // this.commapi.getUnreadChat();
    }
  }
  @ViewChild('audioPlayer', { static: false }) audioPlayerRef!: ElementRef<HTMLAudioElement>;
  playAudio() {
    const audioPlayer = this.audioPlayerRef.nativeElement;
    audioPlayer.play().then(() => {
    }).catch((error) => {
      // console.error('Error playing audio: ', error);
    });
  }

  handleAutoLogout() {
    localStorage.removeItem('auth_token');
    this.router.navigate(['/auth/login']);
  }
  
  
  
  watchDevTools() {
    setInterval(() => {
      if (this.isDevToolsOpen() && !this.devToolsAlreadyDetected) {
        this.devToolsAlreadyDetected = true;
        alert('call')
        this.authService.logout();
      }
    }, 1000);
  }
  
  isDevToolsOpen(): boolean {
    const threshold = 160;
    return (
      window.outerWidth - window.innerWidth > threshold ||
      window.outerHeight - window.innerHeight > threshold
    );
  }
  
  detectDomTampering() {
    const observer = new MutationObserver(() => {
      if (!this.devToolsTriggered) {
        this.devToolsTriggered = true;
        this.authService.logout();
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true
    });
  }
  
  
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    const key = event.key.toLowerCase();
    if (event.ctrlKey && key === 'u') {
      event.preventDefault();
    }
    
    // 🔒 Block F12
    if ((key === 'f12') || (event.ctrlKey && event.shiftKey && key === 'i') || (event.ctrlKey && event.shiftKey && key === 'j')) {
      event.preventDefault();
    }
  }
  
  @HostListener('document:contextmenu', ['$event'])
  onRightClick(event: MouseEvent) {
    event.preventDefault();
  }
}
