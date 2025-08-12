import { Component } from '@angular/core';
import { SharedModule } from '../../../../../shared/shared.module';
import { GalleryModule } from '@ks89/angular-modal-gallery';
import { ShowcodeCardComponent } from '../../../../../shared/components/showcode-card/showcode-card.component';
import { MaterialModuleModule } from '../../../../../material-module/material-module.module';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../../../core/services/api/api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FORMIDCONFIG } from '../../../../../../config/formId.config';

@Component({
    selector: 'app-product-detail',
    imports: [SharedModule,GalleryModule, ShowcodeCardComponent,CommonModule,MaterialModuleModule],
    templateUrl: './product-detail.component.html',
})
export class ProductDetailComponent {
    submodule:any;
    FORMID:any= FORMIDCONFIG;
    skLoading:boolean = false;
    DetailId:  any;
    Detail:any = {};
    
    constructor(public api:ApiService, public route:ActivatedRoute) {}
    
    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            this.DetailId = params.get('id');
            if(this.DetailId){
                this.getDetail();
            }
        });
    }
    
    getDetail() {
        this.skLoading = true;
        this.api.post({_id: this.DetailId}, 'product/detail').subscribe(result => {
            if (result['statusCode']  ===  200) {
                this.skLoading = false;
                this.Detail = result['data'];
            }
        });
    }
}
