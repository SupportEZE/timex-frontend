import { Component } from '@angular/core';
import { SharedModule } from '../../../../../shared/shared.module';
import { GalleryModule } from '@ks89/angular-modal-gallery';
import { ShowcodeCardComponent } from '../../../../../shared/components/showcode-card/showcode-card.component';
import { MaterialModuleModule } from '../../../../../material-module/material-module.module';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FORMIDCONFIG } from '../../../../../../config/formId.config';
import { SpkProductCardComponent } from '../../../../../../@spk/reusable-apps/spk-product-card/spk-product-card.component';
import { ApiService } from '../../../../../core/services/api/api.service';
import { SpkReusableTablesComponent } from '../../../../../../@spk/spk-reusable-tables/spk-reusable-tables.component';
import { MatDialog } from '@angular/material/dialog';
import { WarrantyModalComponent } from '../warranty-modal/warranty-modal.component';
import { AuthService } from '../../../../../shared/services/auth.service';
import { LOGIN_TYPES } from '../../../../../utility/constants';

@Component({
    selector: 'app-warranty-registration-detail',
    imports: [SharedModule,GalleryModule, ShowcodeCardComponent,CommonModule,MaterialModuleModule,SpkReusableTablesComponent, SpkProductCardComponent],
    templateUrl: './warranty-registration-detail.component.html',
})
export class WarrantyRegistrationDetailComponent {
    
    submodule:any;
    FORMID:any= FORMIDCONFIG;
    LOGIN_TYPES:any= LOGIN_TYPES;
    skLoading:boolean = false;
    DetailId:  any;
    Detail:any = {};
    orgData:any;
    verificationAttachment:any = [];
    
    constructor(public api:ApiService, public route:ActivatedRoute, public dialog:MatDialog, private authService: AuthService) {}
    
    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            this.DetailId = params.get('id');
            if(this.DetailId){
                this.getDetail();
            }
        });
        this.orgData = this.authService.getUser();
    }
    
    siteImages: any[] = [];
    completeImages: any[] = [];
    getDetail() {
        this.skLoading = true;
        this.api.post({_id: this.DetailId}, 'warranty/detail').subscribe(result => {
            if (result['statusCode']  ===  200) {
                this.skLoading = false;
                // this.Detail = result['data'];
                const allDocs = result['data']?.docs || [];
                this.siteImages = allDocs.filter((doc: { label: string; }) => doc.label === 'site_image');
                this.completeImages = allDocs.filter((doc: { label: string; }) => doc.label === 'complete_image');
                // Separate warranty_verification_attachment from allDocs
                this.verificationAttachment = allDocs.filter((doc: any) => doc.label === 'warranty_verification_attachment');
                console.log(this.verificationAttachment);
                
                this.Detail = result['data'];
                this.Detail.docs = allDocs.filter((doc: { label: string; }) =>  !['site_image', 'complete_image', 'warranty_verification_attachment'].includes(doc.label));  
                console.log(this.Detail);
            }
        });
    }
    
    statusChange() {
        const dialogRef = this.dialog.open(WarrantyModalComponent, {
            width: '400px',
            data: {
                'DetailId':this.DetailId,
                'options':this.statusOptions,
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if(result === true){
                this.getDetail();
            }
        });
    }
    
    headerColumn = [
        {label: 'Product Name',},
        {label: 'Product Code',},
        {label: 'Product Qty',},
        { label: 'Batch No.'},
        { label: 'Grade'},
        { label: 'Color'},
        { label: 'Length'},
        { label: 'Width'},
    ];
    
    statusOptions = [{name:'Verified'},{name:'Reject'}]
}
