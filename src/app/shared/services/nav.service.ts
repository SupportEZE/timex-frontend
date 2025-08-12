import { Injectable, OnDestroy } from '@angular/core';
import { Subject, BehaviorSubject, fromEvent } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';
import { Router } from '@angular/router';
// Menu
export interface Menu {
    headTitle?: string;
    headTitle2?: string;
    path?: string;
    title?: string;
    icon?: string;
    type?: string;
    badgeValue?: string;
    badgeClass?: string;
    badgeText?: string;
    active?: boolean;
    selected?: boolean;
    bookmark?: boolean;
    children?: Menu[];
    children2?: Menu[];
    Menusub?: boolean;
    target?: boolean;
    menutype?:string;
    dirchange?: boolean;
    nochild?: any;
    [key: string]: any;

}

@Injectable({
    providedIn: 'root',
})
export class NavService implements OnDestroy {
    modules:any =[];
    MENUITEMS: Menu[] = []
    
    private unsubscriber: Subject<any> = new Subject();
    public screenWidth: BehaviorSubject<number> = new BehaviorSubject(
        window.innerWidth
    );
    
    // Search Box
    public search = false;
    
    // Language
    public language = false;
    
    // Mega Menu
    public megaMenu = false;
    public levelMenu = false;
    public megaMenuColapse: boolean = window.innerWidth < 1199 ? true : false;
    
    // Collapse Sidebar
    public collapseSidebar: boolean = window.innerWidth < 991 ? true : false;
    
    // For Horizontal Layout Mobile
    public horizontal: boolean = window.innerWidth < 991 ? false : true;
    
    // Full screen
    public fullScreen = false;
    active: any;
    public items: BehaviorSubject<Menu[]> = new BehaviorSubject<Menu[]>(this.MENUITEMS);
    
    constructor(private router: Router) {
        const modulesString = localStorage.getItem('modules');
        this.modules = modulesString ? JSON.parse(modulesString) : null;
        this.MENUITEMS = this.modules?.length ? this.modules : this.MENUITEMS;
        this.items.next(this.MENUITEMS);
        this.setScreenWidth(window.innerWidth);
        fromEvent(window, 'resize')
        .pipe(debounceTime(1000), takeUntil(this.unsubscriber))
        .subscribe((evt: any) => {
            this.setScreenWidth(evt.target.innerWidth);
            if (evt.target.innerWidth < 991) {
                this.collapseSidebar = true;
                this.megaMenu = false;
                this.levelMenu = false;
            }
            if (evt.target.innerWidth < 1199) {
                this.megaMenuColapse = true;
            }
        });
        if (window.innerWidth < 991) {
            // Detect Route change sidebar close
            this.router.events.subscribe((event) => {
                this.collapseSidebar = true;
                this.megaMenu = false;
                this.levelMenu = false;
            });
        }
    }
    
    ngOnDestroy() {
        this.unsubscriber.next;
        this.unsubscriber.complete();
    }
    
    private setScreenWidth(width: number): void {
        this.screenWidth.next(width);
    }
    // MENUITEMS: Menu[] = this.modules
    
    //     MENUITEMS: Menu[] = [
    //         // Dashboard
    //         { headTitle: 'Analytics' },
    //         {
    //             title: 'Dashboards',
    //             icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 side-menu__icon" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"></path></svg>`,
    //             type: 'sub',
    //             selected: false,
    //             active: false,
    //             dirchange: false,
    //             children: [
    //                 { path: '/dashboards/sales', title: 'Sales', type: 'link', dirchange: false },
    //                 {
    //                     path: '/dashboards/crm',
    //                     title: 'DMS',
    //                     type: 'link',
    //                     dirchange: false,
    //                 },
    //                 {
    //                     path: '/dashboards/crm',
    //                     title: 'Loyalty',
    //                     type: 'link',
    //                     dirchange: false,
    //                 },
    //                 {
    //                     path: '/dashboards/crm',
    //                     title: 'Wharehouse',
    //                     type: 'link',
    //                     dirchange: false,
    //                 },
    //             ],
    //         },        
    
    //         // --------------Apps Modules Start------------------//
    //         { headTitle: 'Apps Modules' },
    //         {
    //             title: 'SFA',
    //             icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 side-menu__icon" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75"></path> </svg>`,
    //             type: 'sub',
    //             active: false,
    //             dirchange: false,
    //             children: [
    //                 {
    //                     title: 'Customer Network',
    //                     type: 'sub',
    //                     badgeClass: 'badge bg-secondary-transparent',
    //                     badgeValue: 'New',
    //                     active: false,
    //                     dirchange: false,
    //                     children: [
    //                         {
    //                             title: 'Distributor',
    //                             type: 'link',
    //                             path: '/apps/ecommerce/add-product',
    //                             dirchange: false,
    //                         },
    //                         {
    //                             title: 'Direct Dealer',
    //                             type: 'link',
    //                             path: '/apps/ecommerce/add-product',
    //                             dirchange: false,
    //                         },
    //                         {
    //                             title: 'Dealer',
    //                             type: 'link',
    //                             path: '/apps/ecommerce/add-product',
    //                             dirchange: false,
    //                         },
    //                     ],
    //                 },
    //             ],
    //         },
    //         {
    //             title: 'Loyalty',
    //             icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 side-menu__icon" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"></path> </svg>`,
    //             type: 'sub',
    //             active: false,
    //             dirchange: false,
    //             children: [
    //                 {
    //                     title: 'Influencer Network',
    //                     type: 'sub',
    //                     badgeClass: 'badge bg-secondary-transparent',
    //                     badgeValue: 'New',
    //                     active: false,
    //                     dirchange: false,
    //                     children: [
    //                         {
    //                             title: 'Contractor',
    //                             type: 'link',
    //                             path: '/apps/ecommerce/add-product',
    //                             dirchange: false,
    //                         },
    //                         {
    //                             title: 'Carpenter',
    //                             type: 'link',
    //                             path: '/apps/ecommerce/add-product',
    //                             dirchange: false,
    //                         },
    //                     ],
    //                 },
    //                 {
    //                     title: 'Gift Gallery',
    //                     type: 'link',
    //                     dirchange: false,
    //                     path: 'apps/master/product-list',
    //                 },
    //                 {
    //                     title: 'QR Code Label',
    //                     type: 'link',
    //                     dirchange: false,
    //                     path: 'apps/master/product-list',
    //                 },
    //             ],
    //         },
    //         // --------------Apps Modules End------------------//
    
    //         // --------------Master Modules Start------------------//
    
    //         { headTitle: 'Configuration' },
    //         {
    //             title: 'Master Modules',
    //             type: 'sub',
    //             icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 side-menu__icon" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 0 0 2.25-2.25V6a2.25 2.25 0 0 0-2.25-2.25H6A2.25 2.25 0 0 0 3.75 6v2.25A2.25 2.25 0 0 0 6 10.5Zm0 9.75h2.25A2.25 2.25 0 0 0 10.5 18v-2.25a2.25 2.25 0 0 0-2.25-2.25H6a2.25 2.25 0 0 0-2.25 2.25V18A2.25 2.25 0 0 0 6 20.25Zm9.75-9.75H18a2.25 2.25 0 0 0 2.25-2.25V6A2.25 2.25 0 0 0 18 3.75h-2.25A2.25 2.25 0 0 0 13.5 6v2.25a2.25 2.25 0 0 0 2.25 2.25Z"></path> </svg>`,
    //             active: false,
    //             selected: false,
    //             dirchange: false,
    //             children: [
    //                 {
    //                     title: 'Category',
    //                     type: 'link',
    //                     dirchange: false,
    //                     path: 'apps/master/product-list',
    //                 },
    //                 {
    //                     title: 'Sub Category',
    //                     type: 'link',
    //                     dirchange: false,
    //                     path: 'apps/master/product-list',
    //                 },
    //                 {
    //                     title: 'Products',
    //                     type: 'link',
    //                     dirchange: false,
    //                     path: 'apps/master/products-list',
    //                 },
    //             ],
    //         },
    //         // --------------Master Modules Start------------------//
    // ]
    
    
    
    // items = new BehaviorSubject<Menu[]>(this.MENUITEMS);
}
