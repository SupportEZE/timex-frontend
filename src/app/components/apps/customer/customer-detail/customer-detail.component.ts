import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { GalleryItem, Gallery, ImageItem, ImageSize, ThumbnailsPosition } from 'ng-gallery';
import { Lightbox, LightboxModule } from 'ng-gallery/lightbox';
import { OverlayscrollbarsModule } from 'overlayscrollbars-ngx';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../../../shared/shared.module';
import { ActivatedRoute, Router } from '@angular/router';
import { ModuleService } from '../../../../shared/services/module.service';
import { FORMIDCONFIG } from '../../../../../config/formId.config';
import { ApiService } from '../../../../core/services/api/api.service';
import { DateService } from '../../../../shared/services/date.service';
import { MatDialog } from '@angular/material/dialog';
import { CustomerModalComponent } from '../customer-modal/customer-modal.component';
import { ShowcodeCardComponent } from '../../../../shared/components/showcode-card/showcode-card.component';
import Swiper from 'swiper';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import { register } from 'swiper/element';
import { LogService } from '../../../../core/services/log/log.service';
import { LogsComponent } from '../../../../shared/components/logs/logs.component';
import { ComanFuncationService } from '../../../../shared/services/comanFuncation.service';
import { NameUtilsService } from '../../../../utility/name-utils';
import { MaterialModuleModule } from '../../../../material-module/material-module.module';
import { PrimaryDashboardComponent } from '../dashboard/primary-dashboard/primary-dashboard.component';
import { SpkProductCardComponent } from '../../../../../@spk/reusable-apps/spk-product-card/spk-product-card.component';
import { StockComponent } from '../stock/stock.component';
import { SpkMapsComponent } from '../../../../../@spk/spk-maps/spk-maps.component';
import { LOGIN_TYPES } from '../../../../utility/constants';
import { HighlightService } from '../../../../shared/services/highlight.service';
import { InvoiceListComponent } from '../../sfa/accounts/invoice/invoice-list/invoice-list.component';
import { RemoveSpaceService } from '../../../../core/services/remove-space/removeSpace.service';
import { WarrantyRegistrationListComponent } from '../../service/warranty-registration/warranty-registration-list/warranty-registration-list.component';

Swiper.use([Autoplay, Navigation, Pagination]);
register();
@Component({
    selector: 'app-customer-detail',
    standalone: true,
    imports: [SharedModule,NgSelectModule, LightboxModule, OverlayscrollbarsModule, ShowcodeCardComponent, FormsModule, ReactiveFormsModule, PrimaryDashboardComponent, MaterialModuleModule, StockComponent, WarrantyRegistrationListComponent, InvoiceListComponent],
    templateUrl: './customer-detail.component.html'
})

export class CustomerDetailComponent {
    @ViewChild('swiperContainer') swiperContainer!: ElementRef;
    customerType:any;
    customerTypeId:any
    customerLoginType:any;
    customerLoginTypeId: any;
    customerId:any;
    zoom = 4;
    profileNumber: number = 0;
    submodule:any;
    FORMID:any= FORMIDCONFIG;
    basicDetail:any ={};
    skLoading:boolean = false;
    activeTab:any = 'Basic Detail';
    LOGIN_TYPES:any;
    subActiveTab: any = 'Primary Orders'
    pageKey = 'customer-detail';
    accessRight:any = {};
    
    constructor(public gallery: Gallery, public api: ApiService, public lightbox: Lightbox, public route: ActivatedRoute, public moduleService: ModuleService, private logService: LogService, public date: DateService, public dialog: MatDialog, private router: Router, public comanFuncation: ComanFuncationService, private highlightService: HighlightService, public nameUtils: NameUtilsService, public spaceRemove:RemoveSpaceService) {}
    ngOnInit() {
        this.LOGIN_TYPES = LOGIN_TYPES
        
        let highlight = this.highlightService.getHighlight(this.pageKey);
        if (highlight != undefined) {
            this.activeTab = highlight.tab;
            this.highlightService.clearHighlight(this.pageKey);
        }
        
        this.route.paramMap.subscribe(params => {
            if(params){
                this.customerLoginType = params.get('login_type');
                this.customerLoginTypeId = params.get('login_type_id') ? Number(params.get('login_type_id')) : '';
                console.log(this.customerLoginTypeId, 'customerLoginTypeId');
                
                if (LOGIN_TYPES.SECONDARY === this.customerLoginTypeId){
                    this.subActiveTab = 'Secondary Orders'
                }
                this.customerType = params.get('login_type_name');
                this.customerTypeId = params.get('login_type_id');
                this.customerId = params.get('id');
                this.getDetail();
            }
        });
    }
    
    onTabChange(tab: string) {
        this.activeTab = tab;
        if (this.activeTab === 'Account'){
            this.subActiveTab = 'Invoice';
        }
        if (this.activeTab === 'Orders'){
            if (LOGIN_TYPES.SECONDARY === this.customerLoginTypeId) {
                this.subActiveTab = 'Secondary Orders'
            }
            else{
                this.subActiveTab = 'Primary Orders'
            }
        }
        this.setHighLight()
    }
    
    setHighLight() {
        this.comanFuncation.setHighLight(this.pageKey, '', this.activeTab, '', '')
    }
    
    
    mainTabs(): any[] {
        let tabs: any[] = [];
        if (this.customerTypeId === '5') {
            tabs = [
                { name: 'Basic Detail', label: 'Basic Detail', icon: 'ri-user-3-fill' },
                { name: 'Invoice', label: 'Invoice', icon: 'ri-file-edit-line' },
                // { name: 'Stock', label: 'Stock', icon: 'ri-box-3-fill' },
                { name: 'warranty-registration', label: 'Warranty Registration', icon: 'ri-file-edit-fill' }
            ];
        }
        if (this.customerTypeId === '8') {
            tabs = [
                { name: 'Basic Detail', label: 'Basic Detail', icon: 'ri-user-3-fill' },
                { name: 'warranty-registration', label: 'Warranty Registration', icon: 'ri-file-edit-fill' }
            ];
        }
        return tabs;
    }
    
    getDetail(){
        this.skLoading = true
        this.api.post({ "_id": this.customerId}, 'customer/detail').subscribe(result => {
            if(result['statusCode'] === 200){
                this.basicDetail =result['data'];
                this.skLoading = false
            }
            else{
                this.skLoading = false
            }
        });
    }
    
    getIds(data:any){
        return data.map((item: any) => (item.parent_customer_id));
    }
    
    getuserIds(data: any) {
        return data.map((item: any) => (item.user_id));
    }
    
    
    openModal(type:string, row?:any) {
        let data ={}
        
        if(type == 'contact_person'){
            data = row ? row : ''
        }
        if(type == 'shipping_address'){
            data = row ? row : ''
        }
        
        if (type == 'document_number' || type ==  'document_image'){
            data = row ? row : ''
        }
        
        if(type == 'wallet_history'){
            data = this.basicDetail ? this.basicDetail : ''
        }
        
        if (type == 'shop_gallery') {
            data = this.basicDetail ? this.basicDetail : ''
        }
        
        if(type == 'kyc'){
            data = row ? row : ''
        }
        
        if(type == 'profile_status'){
            data = this.basicDetail.profile_status ? this.basicDetail.profile_status : ''
        }
        
        const dialogRef = this.dialog.open(CustomerModalComponent, {
            width: (type == 'document_number' || type == 'document_image') ?  '400px' : '768px',
            data: {
                'pageType': type,
                'data':data,
                fromPrimaryOrderAdd: false,
                'customer_id':this.customerId,
                'customer_type':this.customerType,
                'customer_type_id': this.customerTypeId,
                'customer_name': this.basicDetail.customer_name,
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if(result === true){
                this.getDetail();
            }
        });
    }
    
    // delete funcation start //
    delete(id: string, api:string, label:string) {
        this.comanFuncation.delete(id, this.submodule, label, api, 'single_action',this.customerId).subscribe((result: boolean) => {
            if (result === true) {
                this.getDetail();
            }
        });
    }
    // delete funcation end
    
    editPage(event:any){
        if(this.activeTab === 'Basic'){
            const detail = this.basicDetail
            this.router.navigate(['/apps/customer/customer-list/' + this.customerTypeId + '/' + this.customerType + '/customer-edit/' + this.customerId], { state: { detail } });
        }
        else{
            this.openModal(this.activeTab.toLowerCase().replace(/\s+/g, "_"))
        }
    }
    
    onError(event: any) {
        event.target.src = './assets/images/faces/profile_palceholder.png';
    }
    
    // ******status change funcation start*****//
    onToggleChange(newState: boolean, id: string, status: string) {
        this.comanFuncation.statusChange(newState, id, status, this.submodule, 'toggle', 'customer/update-status').subscribe((result: boolean) => {
            this.getDetail();
        });
    }
    
    showForLoginTypes(types: number[], options: { exclude?: boolean } = {}): boolean {
        const isIncluded = types.includes(this.customerLoginTypeId);
        return options.exclude ? !isIncluded : isIncluded;
    }
}
