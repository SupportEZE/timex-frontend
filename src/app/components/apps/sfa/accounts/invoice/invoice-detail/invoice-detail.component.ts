import { Component } from '@angular/core';
import { SharedModule } from '../../../../../../shared/shared.module';
import { GalleryModule } from '@ks89/angular-modal-gallery';
import { ShowcodeCardComponent } from '../../../../../../shared/components/showcode-card/showcode-card.component';
import { MaterialModuleModule } from '../../../../../../material-module/material-module.module';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FORMIDCONFIG } from '../../../../../../../config/formId.config';
import { SpkProductCardComponent } from '../../../../../../../@spk/reusable-apps/spk-product-card/spk-product-card.component';
import { ApiService } from '../../../../../../core/services/api/api.service';
import { SpkReusableTablesComponent } from '../../../../../../../@spk/spk-reusable-tables/spk-reusable-tables.component';
import { InvoiceModalComponent } from '../invoice-modal/invoice-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../../../../../shared/services/auth.service';
import { LOGIN_TYPES } from '../../../../../../utility/constants';

@Component({
    selector: 'app-invoice-detail',
    imports: [SharedModule,GalleryModule, ShowcodeCardComponent,CommonModule,MaterialModuleModule,SpkReusableTablesComponent, SpkProductCardComponent],
    templateUrl: './invoice-detail.component.html',
})
export class InvoiceDetailComponent {
    submodule:any;
    FORMID:any= FORMIDCONFIG;
    LOGIN_TYPES:any= LOGIN_TYPES;
    skLoading:boolean = false;
    DetailId:  any;
    Detail:any = {};
    orgData:any;
    
    constructor(public api:ApiService, public route:ActivatedRoute, public dialog:MatDialog, private authService: AuthService) {}
    
    ngOnInit() {
        this.orgData = this.authService.getUser();

        this.route.paramMap.subscribe(params => {
            this.DetailId = params.get('id');
            if(this.DetailId){
                this.getDetail();
            }
        });
    }
    
    getDetail() {
        this.skLoading = true;
        this.api.post({_id: this.DetailId}, 'invoice/detail').subscribe(result => {
            if (result['statusCode']  ===  200) {
                this.skLoading = false;
                this.Detail = result['data'];
            }
        });
    }
    
    statusChange() {
        const dialogRef = this.dialog.open(InvoiceModalComponent, {
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
        {label: 'Product Name'},
        {label: 'Product Code'},
        {label: 'Qty'},
        {label: 'Qty (Sq Mtrs)'},
        {label: 'Batch No.'},
        {label: 'Grade'},
        {label: 'Color'},
        {label: 'Length'},
        {label: 'Width'},
    ];
    
    statusOptions = [{name:'Recieved'},{name:'Reject'}]
    
}
