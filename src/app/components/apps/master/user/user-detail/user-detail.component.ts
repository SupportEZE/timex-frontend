import { Component } from '@angular/core';
import { SharedModule } from '../../../../../shared/shared.module';
import { GalleryModule } from '@ks89/angular-modal-gallery';
import { ShowcodeCardComponent } from '../../../../../shared/components/showcode-card/showcode-card.component';
import { MaterialModuleModule } from '../../../../../material-module/material-module.module';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../../../core/services/api/api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FORMIDCONFIG } from '../../../../../../config/formId.config';
import { ModuleService } from '../../../../../shared/services/module.service';
import { ComanFuncationService } from '../../../../../shared/services/comanFuncation.service';

@Component({
    selector: 'app-user-detail',
    imports: [SharedModule,GalleryModule, ShowcodeCardComponent,CommonModule,MaterialModuleModule],
    templateUrl: './user-detail.component.html',
})
export class UserDetailComponent {
    submodule:any;
    FORMID:any= FORMIDCONFIG;
    skLoading:boolean = false;
    detailId:  any;
    detail:any = {};
    accessRight: any = {};

    constructor(public api: ApiService, public comanFuncation:ComanFuncationService, private moduleService:ModuleService, private router: Router, public route:ActivatedRoute) {}
    
    ngOnInit() {

        const accessRight = this.moduleService.getAccessMap('User');
        if (accessRight) {
            this.accessRight = accessRight;
        }


        this.route.paramMap.subscribe(params => {
            this.detailId = params.get('id');
            if(this.detailId){
                this.getDetail();
            }
        });
    }
    
    getDetail() {
        this.skLoading = true;
        this.api.post({_id: this.detailId}, 'user/detail').subscribe(result => {
            if (result['statusCode']  ===  200) {
                this.skLoading = false;
                this.detail = result['data'];
            }
        });
    }

    onToggleChange(newState: boolean, id: string, status: string) {
        this.comanFuncation.statusChange(newState, id, status, 'toggle', 'user/update-status',).subscribe((result: boolean) => {
            if (result) {
                this.getDetail();
            }
        });
    }


    editPage(event:any){
        const detail = this.detail
        this.router.navigate(['/apps/master/user/user-edit/' + this.detailId], { state: { detail } });
    }
}
