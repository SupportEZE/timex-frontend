import {
    Component,
    ViewChild,
    ElementRef,
    Renderer2,
    HostListener,
} from '@angular/core';
import { Menu, NavService } from '../../services/nav.service';
import { Subscription, fromEvent } from 'rxjs';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { ApiService } from '../../../core/services/api/api.service';
import { CommonApiService } from '../../services/common-api.service';
import { AuthService } from '../../services/auth.service';
@Component({
    selector: 'app-sidebar',
    standalone:false,
    templateUrl: './sidebar.component.html',
    styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
    eventTriggered: boolean = false;
    screenWidth!: number;
    profileNumber: number = 0;
    orgData:any;
    public localdata = localStorage;
    public windowSubscribe$!: Subscription;
    options = { autoHide: false, scrollbarMinSize: 100 };
    public menuItems!: Menu[];
    public menuitemsSubscribe$!: Subscription;
    constructor(
        public api: ApiService,
        private authService: AuthService,
        private navServices: NavService,
        public router: Router,
        public renderer: Renderer2,
        private sanitizer: DomSanitizer,
        public commonApi:CommonApiService
    ) {
        this.orgData = this.authService.getUser();
    }
    
    
    
    clearNavDropdown() {
        this.menuItems?.forEach((a: any) => {
            a.active = false;
            a?.children?.forEach((b: any) => {
                b.active = false;
                b?.children?.forEach((c: any) => {
                    c.active = false;
                });
            });
        });
    }
    
    ngOnInit() {
        let bodyElement: any = document.querySelector('.main-content');
        bodyElement.onclick = () => {
            if (
                localStorage.getItem('layoutStyles') == 'icon-click' ||
                localStorage.getItem('layoutStyles') == 'menu-click' ||
                localStorage.getItem('layoutStyles') == 'icon-hover' ||
                localStorage.getItem('data-nav-layout') == 'horizontal'
            ) {
                document
                .querySelectorAll('.main-menu .slide-menu.child1')
                .forEach((ele: any) => {
                    ele.style.display = 'none';
                });
            }
            
            if (localStorage.getItem('layoutStyles') == 'icontext') {
                document.querySelector('html')?.removeAttribute('data-icon-text')
            }
        };
        
        // this.menuitemsSubscribe$ = this.navServices.items.subscribe((items) => {
        //   this.menuItems = items;
        // });  
        
        const allMenuItems = [
            { headTitle: 'Modules' },
            {
                title: 'Vendor',
                type: 'link',
                path: '/apps/customer/customer-list/5/vendor',
                icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" class="w-6 h-6 side-menu__icon" fill="currentColor"><path d="M40-160v-160q0-29 20.5-49.5T110-390h141q17 0 32.5 8.5T310-358q29 42 74 65t96 23q51 0 96-23t75-65q11-15 26-23.5t32-8.5h141q29 0 49.5 20.5T920-320v160H660v-119q-36 33-82.5 51T480-210q-51 0-97-18t-83-51v119H40Zm440-170q-35 0-67.5-16.5T360-392q-16-23-38.5-37T273-448q29-30 91-46t116-16q54 0 116.5 16t91.5 46q-26 5-48.5 19T601-392q-20 29-52.5 45.5T480-330ZM160-460q-45 0-77.5-32.5T50-570q0-46 32.5-78t77.5-32q46 0 78 32t32 78q0 45-32 77.5T160-460Zm640 0q-45 0-77.5-32.5T690-570q0-46 32.5-78t77.5-32q46 0 78 32t32 78q0 45-32 77.5T800-460ZM480-580q-45 0-77.5-32.5T370-690q0-46 32.5-78t77.5-32q46 0 78 32t32 78q0 45-32 77.5T480-580Z"></path></svg>`,
                selected: false,
                active: false,
                dirchange: false,
            },
            {
                title: 'Site',
                type: 'link',
                path: '/apps/site/site-list/8/site',
                icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 side-menu__icon" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75"></path> </svg>`,
                selected: false,
                active: false,
                dirchange: false,
            },
            {
                title: 'Invoice',
                type: 'link',
                path: '/apps/sfa/accounts/invoice',
                icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 side-menu__icon" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75"></path> </svg>`,
                selected: false,
                active: false,
                dirchange: false,
            },
            {
                title: 'Warranty Register',
                type: 'link',
                path: '/apps/service/warranty-registration',
                icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 side-menu__icon" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 2h4l2 2-3 3 6 6 3-3 2 2-3 3 1 1-2 2-1-1-3 3-2-2 3-3-6-6-3 3-2-2 3-3-1-1 2-2z"></path>
                </svg>`,
                selected: false,
                active: false,
                dirchange: false,
            },
            {
                title: 'Users',
                type: 'link',
                path: '/apps/master/user',
                icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" class="w-6 h-6 side-menu__icon" fill="currentColor"><path d="M40-160v-160q0-29 20.5-49.5T110-390h141q17 0 32.5 8.5T310-358q29 42 74 65t96 23q51 0 96-23t75-65q11-15 26-23.5t32-8.5h141q29 0 49.5 20.5T920-320v160H660v-119q-36 33-82.5 51T480-210q-51 0-97-18t-83-51v119H40Zm440-170q-35 0-67.5-16.5T360-392q-16-23-38.5-37T273-448q29-30 91-46t116-16q54 0 116.5 16t91.5 46q-26 5-48.5 19T601-392q-20 29-52.5 45.5T480-330ZM160-460q-45 0-77.5-32.5T50-570q0-46 32.5-78t77.5-32q46 0 78 32t32 78q0 45-32 77.5T160-460Zm640 0q-45 0-77.5-32.5T690-570q0-46 32.5-78t77.5-32q46 0 78 32t32 78q0 45-32 77.5T800-460ZM480-580q-45 0-77.5-32.5T370-690q0-46 32.5-78t77.5-32q46 0 78 32t32 78q0 45-32 77.5T480-580Z"></path></svg>`,
                selected: false,
                active: false,
                dirchange: false,
            },
            {
                title: 'Products',
                type: 'link',
                path: '/apps/master/products-list',
                icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 side-menu__icon" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 0 0 2.25-2.25V6a2.25 2.25 0 0 0-2.25-2.25H6A2.25 2.25 0 0 0 3.75 6v2.25A2.25 2.25 0 0 0 6 10.5Zm0 9.75h2.25A2.25 2.25 0 0 0 10.5 18v-2.25a2.25 2.25 0 0 0-2.25-2.25H6a2.25 2.25 0 0 0-2.25 2.25V18A2.25 2.25 0 0 0 6 20.25Zm9.75-9.75H18a2.25 2.25 0 0 0 2.25-2.25V6A2.25 2.25 0 0 0 18 3.75h-2.25A2.25 2.25 0 0 0 13.5 6v2.25a2.25 2.25 0 0 0 2.25 2.25Z"></path> </svg>`,
                selected: false,
                active: false,
                dirchange: false,
            },
            // {
            //     title: 'Reports',
            //     type: 'link',
            //     path: '/apps/master/report',
            //     icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 side-menu__icon" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75"></path> </svg>`,
            //     selected: false,
            //     active: false,
            //     dirchange: false,
            // },
        ];


        if (this.orgData.login_type_id === 2) {
            this.menuItems = allMenuItems; // Show all
        } else if (this.orgData.login_type_id === 3) {
            this.menuItems = allMenuItems.filter(item =>
                item.title === 'Warranty Register'||
                item.title === 'Vendor' ||
                item.title === 'Site' ||
                item.title === 'Invoice'
            );
        } else if (this.orgData.login_type_id === 5) {
            this.menuItems = allMenuItems.filter(item =>
                item.title === 'Vendor' ||
                item.title === 'Site'
            );
        }
        
        this.setNavActive(null, this.router.url);
        this.router.events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
                this.setNavActive(null, this.router.url);
            }
        });
        
        const WindowResize = fromEvent(window, 'resize');
        // subscribing the Observable
        if (WindowResize) {
            this.windowSubscribe$ = WindowResize.subscribe(() => {
                // to check and adjst the menu on screen size change
                // checkHoriMenu();
            });
        }
        
        if (document.querySelector('html')?.getAttribute('data-nav-layout') == 'horizontal' && window.innerWidth >= 992) { this.clearNavDropdown(); }
    }
    // Start of Set menu Active event
    setNavActive(event:any, currentPath: string, menuData = this.menuItems) {
        if(event){
            if (event?.ctrlKey) {
                return;
            }
        }
        let html = document.documentElement;
        if (html.getAttribute('data-nav-style') != "icon-hover" && html.getAttribute('data-nav-style') != "menu-hover") {
            // if (!event?.ctrlKey) {
            for (const item of menuData) {
                if (item.path === currentPath) {
                    item.active = true;
                    item.selected = true;
                    this.setMenuAncestorsActive(item);
                } else if (!item.active && !item.selected) {
                    item.active = false; // Set active to false for items not matching the target
                    item.selected = false; // Set active to false for items not matching the target
                } else {
                    this.removeActiveOtherMenus(item);
                }
                if (item.children && item.children.length > 0) {
                    this.setNavActive(event, currentPath, item.children);
                }
            }
            // }
        }
    }
    
    getParentObject(obj: any, childObject: Menu) {
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (typeof obj[key] === 'object' && JSON.stringify(obj[key]) === JSON.stringify(childObject)) {
                    return obj; // Return the parent object
                }
                if (typeof obj[key] === 'object') {
                    const parentObject: any = this.getParentObject(obj[key], childObject);
                    if (parentObject !== null) {
                        return parentObject;
                    }
                }
            }
        }
        return null; // Object not found
    }
    
    hasParent = false;
    hasParentLevel = 0;
    
    setMenuAncestorsActive(targetObject: Menu) {
        const parent = this.getParentObject(this.menuItems, targetObject);
        let html = document.documentElement;    
        if (parent) {
            if (this.hasParentLevel >= 2) {        
                this.hasParent = true;
            }
            parent.active = true;
            parent.selected = true;
            this.hasParentLevel += 1;
            this.setMenuAncestorsActive(parent);
        }
        else if (!this.hasParent) {
            this.hasParentLevel = 0;
            if (html.getAttribute('data-vertical-style') == 'doublemenu') {
                html.setAttribute('data-toggled', 'double-menu-close');
            }
        }else{
            this.hasParentLevel = 0;
            this.hasParent = false;
        }
    }
    removeActiveOtherMenus(item: any) {
        if (item) {
            if (Array.isArray(item)) {
                for (const val of item) {
                    val.active = false;
                    val.selected = false;
                }
            }
            item.active = false;
            item.selected = false;
            
            if (item.children && item.children.length > 0) {
                this.removeActiveOtherMenus(item.children);
            }
        }
        else {
            return;
        }
    }
    
    // Start of Toggle menu event
    toggleNavActive(event:any, targetObject:Menu, menuData = this.menuItems, state?:any) {
        let html = document.documentElement;
        let element = event.target;
        if (html.getAttribute('data-nav-style') != "icon-hover" && html.getAttribute('data-nav-style') != "menu-hover"  || (window.innerWidth < 992) || (html.getAttribute('data-nav-layout')!= "horizontal") && (html.getAttribute('data-nav-style') != "icon-hover-closed" && html.getAttribute('data-nav-style') != "menu-hover-closed")) {
            for (const item of menuData) {
                if (item === targetObject) {
                    if (html.getAttribute('data-vertical-style') == 'doublemenu' && item.active && window.innerWidth > 992 && state) { return }
                    item.active = !item.active;
                    if (item.active) {
                        this.closeOtherMenus(menuData, item);
                    }
                    this.setAncestorsActive(menuData, item);
                    
                } else if (!item.active) {
                    if (html.getAttribute('data-vertical-style') != 'doublemenu') {
                        item.active = false; // Set active to false for items not matching the target
                    }
                }
                if (item.children && item.children.length > 0) {
                    this.toggleNavActive(event, targetObject, item.children);
                }
            }
            if (targetObject?.children && targetObject.active) {
                if (html.getAttribute('data-vertical-style') == 'doublemenu' && html.getAttribute('data-toggled') != 'double-menu-open') {
                    html.setAttribute('data-toggled', 'double-menu-open');
                }
            }
            
            if (element && html.getAttribute("data-nav-layout") == 'horizontal' && (html.getAttribute("data-nav-style") == 'menu-click' || html.getAttribute("data-nav-style") == 'icon-click')) {
                const listItem = element.closest("li");
                if (listItem) {
                    // Find the first sibling <ul> element
                    const siblingUL = listItem.querySelector("ul");
                    let outterUlWidth = 0;
                    let listItemUL = listItem.closest('ul:not(.main-menu)');
                    while (listItemUL) {
                        listItemUL = listItemUL.parentElement.closest('ul:not(.main-menu)');
                        if (listItemUL) {
                            outterUlWidth += listItemUL.clientWidth;
                        }
                    }
                    if (siblingUL) {
                        // You've found the sibling <ul> element
                        let siblingULRect = listItem.getBoundingClientRect();
                        if (html.getAttribute('dir') == 'rtl') {
                            if ((siblingULRect.left - siblingULRect.width - outterUlWidth + 150 < 0 && outterUlWidth < window.innerWidth) && (outterUlWidth + siblingULRect.width + siblingULRect.width < window.innerWidth)) {
                                targetObject.dirchange = true;
                            } else {
                                targetObject.dirchange = false;
                            }
                        } else {
                            if ((outterUlWidth + siblingULRect.right + siblingULRect.width + 50 > window.innerWidth && siblingULRect.right >= 0) && (outterUlWidth + siblingULRect.width + siblingULRect.width < window.innerWidth)) {
                                targetObject.dirchange = true;
                            } else {
                                targetObject.dirchange = false;
                            }
                        }
                    }
                    setTimeout(() => {
                        let computedValue = siblingUL.getBoundingClientRect();
                        if ((computedValue.bottom) > window.innerHeight) {
                            siblingUL.style.height = (window.innerHeight - computedValue.top - 8) + 'px !important';
                            siblingUL.style.overflow = 'auto !important';
                        }
                    }, 100);
                }
            }
        }else {
            for (const item of menuData) {
                if (item === targetObject) {
                    if (html.getAttribute('data-vertical-style') == 'doublemenu' && item.active && window.innerWidth > 992 && state) { return }
                    item.active = !item.active;
                    if (item.active) {
                        this.closeOtherMenus(menuData, item);
                    }
                    this.setAncestorsActive(menuData, item);
                } 
            }
        }
        
        if (html.getAttribute('data-vertical-style') == 'icontext') {
            document.querySelector('html')?.setAttribute('data-icon-text','open')
        }else{
            document.querySelector('html')?.removeAttribute('data-icon-text')
        }
        
    }
    
    setAncestorsActive(menuData:Menu[], targetObject:Menu) {
        let html = document.documentElement;
        const parent = this.findParent(menuData, targetObject);
        
        if (parent) {
            parent.active = true;
            if (parent.active) {
                html.setAttribute('data-toggled', 'double-menu-open');
            }
            this.setAncestorsActive(menuData, parent);
        }
    }
    closeOtherMenus(menuData:Menu[], targetObject:Menu) {
        for (const item of menuData) {
            if (item !== targetObject) {
                item.active = false;
                if (item.children && item.children.length > 0) {
                    this.closeOtherMenus(item.children, targetObject);
                }
            }
        }
    }
    findParent(menuData:Menu[], targetObject:Menu) {
        for (const item of menuData) {
            if (item.children && item.children.includes(targetObject)) {
                return item;
            }
            if (item.children && item.children.length > 0) {
                const parent:any = this.findParent(item.children, targetObject);
                if (parent) {
                    return parent;
                }
            }
        }
        return null;
    }
    // End of Toggle menu event
    HoverToggleInnerMenuFn(event:Event, item:Menu) {
        let html = document.documentElement;
        let element = event.target as HTMLElement;
        if (element && html.getAttribute("data-nav-layout") == 'horizontal' && (html.getAttribute("data-nav-style") == 'menu-hover' || html.getAttribute("data-nav-style") == 'icon-hover')) {
            const listItem = element.closest("li");
            if (listItem) {
                // Find the first sibling <ul> element
                const siblingUL = listItem.querySelector("ul");
                let outterUlWidth = 0;
                let listItemUL:any = listItem.closest('ul:not(.main-menu)');
                while (listItemUL) {
                    listItemUL = listItemUL.parentElement?.closest('ul:not(.main-menu)');
                    if (listItemUL) {
                        outterUlWidth += listItemUL.clientWidth;
                    }
                }
                if (siblingUL) {
                    // You've found the sibling <ul> element
                    let siblingULRect = listItem.getBoundingClientRect();
                    if (html.getAttribute('dir') == 'rtl') {
                        if ((siblingULRect.left - siblingULRect.width - outterUlWidth + 150 < 0 && outterUlWidth < window.innerWidth) && (outterUlWidth + siblingULRect.width + siblingULRect.width < window.innerWidth)) {
                            item.dirchange = true;
                        } else {
                            item.dirchange = false;
                        }
                    } else {
                        if ((outterUlWidth + siblingULRect.right + siblingULRect.width + 50 > window.innerWidth && siblingULRect.right >= 0) && (outterUlWidth + siblingULRect.width + siblingULRect.width < window.innerWidth)) {
                            item.dirchange = true;
                        } else {
                            item.dirchange = false;
                        }
                    }
                }
            }
        }
    }
    
    ngAfterViewInit(): void {
        //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
        //Add 'implements AfterViewInit' to the class.
        // checkHoriMenu();
        
    }
    
    ngOnDestroy() {
        // this.menuitemsSubscribe$.unsubscribe();
        // this.windowSubscribe$.unsubscribe();
        document.querySelector('html')?.setAttribute('data-vertical-style', 'overlay');
        document.querySelector('html')?.setAttribute('data-nav-layout', 'vertical');
    }
    
    leftArrowFn() {
        // Used to move the slide of the menu in Horizontal and also remove the arrows after click  if there was no space 
        // Used to Slide the menu to Left side
        let slideLeft = document.querySelector('.slide-left') as HTMLElement;
        let slideRight = document.querySelector('.slide-right') as HTMLElement;
        let menuNav = document.querySelector('.main-menu') as HTMLElement;
        let mainContainer1 = document.querySelector('.main-sidebar') as HTMLElement;
        let marginRightValue = Math.ceil(Number(window.getComputedStyle(menuNav).marginInlineStart.split('px')[0]));
        let mainContainer1Width = mainContainer1.offsetWidth;
        if (menuNav.scrollWidth > mainContainer1.offsetWidth) {
            if (marginRightValue < 0 && !(Math.abs(marginRightValue) < mainContainer1Width)) {
                menuNav.style.marginInlineStart = Number(menuNav.style.marginInlineStart.split('px')[0]) + Math.abs(mainContainer1Width) + 'px';
                slideRight.classList.remove('d-none');
            } else if (marginRightValue >= 0) {
                menuNav.style.marginInlineStart = '0px';
                slideLeft.classList.add('d-none');
                slideRight.classList.remove('d-none');
            } else {
                menuNav.style.marginInlineStart = '0px';
                slideLeft.classList.add('d-none');
                slideRight.classList.remove('d-none');
            }
        }
        else {
            menuNav.style.marginInlineStart = "0px";
            slideLeft.classList.add('d-none');
        }
        
        let element = document.querySelector(".main-menu > .slide.open") as HTMLElement;
        let element1 = document.querySelector(".main-menu > .slide.open >ul") as HTMLElement;
        if (element) {
            element.classList.remove("open")
        }
        if (element1) {
            element1.style.display = "none"
        }
    }
    rightArrowFn() {
        // Used to move the slide of the menu in Horizontal and also remove the arrows after click  if there was no space 
        // Used to Slide the menu to Right side
        let slideLeft = document.querySelector('.slide-left') as HTMLElement;
        let slideRight = document.querySelector('.slide-right') as HTMLElement;
        let menuNav = document.querySelector('.main-menu') as HTMLElement;
        let mainContainer1 = document.querySelector('.main-sidebar') as HTMLElement;
        let marginRightValue = Math.ceil(Number(window.getComputedStyle(menuNav).marginInlineStart.split('px')[0]));
        let check = menuNav.scrollWidth - mainContainer1.offsetWidth;
        let mainContainer1Width = mainContainer1.offsetWidth;
        if (menuNav.scrollWidth > mainContainer1.offsetWidth) {
            if (Math.abs(check) > Math.abs(marginRightValue)) {
                if (!(Math.abs(check) > Math.abs(marginRightValue) + mainContainer1Width)) {
                    mainContainer1Width = Math.abs(check) - Math.abs(marginRightValue);
                    slideRight.classList.add('d-none');
                }
                menuNav.style.marginInlineStart = Number(menuNav.style.marginInlineStart.split('px')[0]) - Math.abs(mainContainer1Width) + 'px';
                slideLeft.classList.remove('d-none');
            }
        }
        
        let element = document.querySelector(".main-menu > .slide.open") as HTMLElement
        let element1 = document.querySelector(".main-menu > .slide.open >ul") as HTMLElement
        if (element) {
            element.classList.remove("open")
        }
        if (element1) {
            element1.style.display = "none"
        }
    }
    
    // Addding sticky-pin
    scrolled = false;
    
    @HostListener('window:scroll', [])
    onWindowScroll() {
        this.scrolled = window.scrollY > 10;
        
        const sections = document.querySelectorAll('.side-menu__item');
        const scrollPos =
        window.pageYOffset ||
        document.documentElement.scrollTop ||
        document.body.scrollTop;
        
        sections.forEach((ele, i) => {
            const currLink = sections[i];
            const val: any = currLink.getAttribute('value');
            const refElement: any = document.querySelector('#' + val);
            
            // Add a null check here before accessing properties of refElement
            if (refElement !== null) {
                const scrollTopMinus = scrollPos + 73;
                if (
                    refElement.offsetTop <= scrollTopMinus &&
                    refElement.offsetTop + refElement.offsetHeight > scrollTopMinus
                ) {
                    document.querySelector('.nav-scroll')?.classList.remove('active');
                    currLink.classList.add('active');
                } else {
                    currLink.classList.remove('active');
                }
            }
        });
    }
    
    @HostListener('window:resize', ['$event'])
    onResize(event: any): void {
        this.menuResizeFn();
        
        this.screenWidth = window.innerWidth;
        
        // Check if the event hasn't been triggered and the screen width is less than or equal to your breakpoint
        if (!this.eventTriggered && this.screenWidth <= 992) {
            document.documentElement?.setAttribute('data-toggled', 'close')
            
            
            // Trigger your event or perform any action here
            this.eventTriggered = true; // Set the flag to true to prevent further triggering
        } else if (this.screenWidth > 992) {
            // Reset the flag when the screen width goes beyond the breakpoint
            this.eventTriggered = false;
        }
    }
    WindowPreSize: number[] = [window.innerWidth];
    menuResizeFn(): void {
        this.WindowPreSize.push(window.innerWidth);
        
        if (this.WindowPreSize.length > 2) {
            this.WindowPreSize.shift();
        }
        if (this.WindowPreSize.length > 1) {
            const html = document.documentElement;
            
            if (this.WindowPreSize[this.WindowPreSize.length - 1] < 992 && this.WindowPreSize[this.WindowPreSize.length - 2] >= 992) {
                // less than 992
                html.setAttribute('data-toggled', 'close');
            }
            
            if (this.WindowPreSize[this.WindowPreSize.length - 1] >= 992 && this.WindowPreSize[this.WindowPreSize.length - 2] < 992) {
                // greater than 992
                html.removeAttribute('data-toggled');
                document.querySelector('#responsive-overlay')?.classList.remove('active');
            }
        }
    }
}