import { Component } from '@angular/core';
import { SharedModule } from '../../../../../shared/shared.module';
import { CommonModule } from '@angular/common';
import { SpkReusableTablesComponent } from '../../../../../../@spk/spk-reusable-tables/spk-reusable-tables.component';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from '../../../../../core/services/api/api.service';
import { ComanFuncationService } from '../../../../../shared/services/comanFuncation.service';
import { ModuleService } from '../../../../../shared/services/module.service';
import { FORMIDCONFIG } from '../../../../../../config/formId.config';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MaterialModuleModule } from '../../../../../material-module/material-module.module';
import { LogService } from '../../../../../core/services/log/log.service';
import Swal from 'sweetalert2';
import { SweetAlertService } from '../../../../../core/services/alert/sweet-alert.service';
import { ToastrServices } from '../../../../../shared/services/toastr.service ';

@Component({
    selector: 'app-user-list',
    imports: [SharedModule,CommonModule,SpkReusableTablesComponent,MaterialModuleModule,FormsModule],
    templateUrl: './user-list.component.html',
})
export class UserListComponent {
    page:any = 1;
    FORMID:any= FORMIDCONFIG;
    skLoading:boolean = false
    activeTab: string = 'Active';
    pagination:any={};
    filter: any = {};
    mainTabs:any=[];
    modules:any={};
    listingCount:any={};
    listing:any=[];
    accessRight:any = {};
    constructor(public dialog:MatDialog,public api: ApiService,public comanFuncation: ComanFuncationService,public moduleService: ModuleService,public alert : SweetAlertService,private router: Router, private logService : LogService,public toastr: ToastrServices){}
    
    ngOnInit() {
        this.getList();
    }
    
    
    onRefresh()
    {
        this.filter = {};
        this.getList();
    }
    
    onTabChange(tab: string) {
        this.activeTab = tab;
        this.getList();
    }
    
    goToAddPage()
    {
        this.router.navigate(['/apps/master/user/user-add']);
    }
    
    goToDetailPage(rowId:any)
    {
        this.router.navigate(['/apps/master/user/user-detail' , rowId]);
    }
    
    // -------- Pagination//
    
    changeToPage(page: number) {
        this.pagination.cur_page = page; 
        this.getList(); // API call with the updated page
    }
    
    changeToPagination(action: string) {
        if (action === 'Next' && this.pagination.cur_page < this.pagination.total_pages) {
            this.pagination.cur_page++;
        } else if (action === 'Previous' && this.pagination.cur_page > 1) {
            this.pagination.cur_page--;
        }
        this.getList(); 
    }
    // -------- Pagination//
    
    getList(){
        this.skLoading = true;
        this.api.post({ filters: this.filter, activeTab: this.activeTab, page: this.pagination.cur_page ?? 1}, 'user/read').subscribe(result => {
            if(result['statusCode'] == 200){
                this.skLoading = false;
                this.listing = result['data']['result'];
                this.listingCount = result['data']['statusTabs'];
                this.listing.forEach((list: any) => list.isChecked = list.status === 'Active');
                this.pagination = result['pagination'];
                
                this.mainTabs = [
                    { name: 'Active', label: 'Active', icon: 'ri-check-double-line', count: this.listingCount?.activeCount},
                    { name: 'Inactive', label: 'Inactive', icon: 'ri-file-forbid-line', count: this.listingCount?.inactiveCount}
                ];
            }
        });
    }
    
    onDeleteRow(rowId: any) {
        this.alert.confirm("Are you sure?")
        .then((result) => {
            if (result.isConfirmed) {
                this.api.patch({ _id: rowId, is_delete: 1}, 'user/delete').subscribe(result => {
                    if (result['statusCode']  ===  200) {
                        Swal.fire('Deleted!', result.message, 'success');
                        this.getList();
                    }                        
                });
            }
        });
    }


    editPage(row: any) {
        const detail = row
        this.router.navigate(['/apps/master/user/user-edit/' + row._id], { state: { detail } });
    }


    onToggleChange(newState: boolean, id: string, status: string) {
        this.comanFuncation.statusChange(newState, id, status, 'toggle', 'user/update-status',).subscribe((result: boolean) => {
            if (result) {
                this.getList();
            }
        });
      }
    
    PageHeaders = [
        {label: 'Created At', field: 'Created At'},
        {label: 'Created By', field: 'Created By'},
        {label: 'Name', field: 'Name'},
        {label: 'Mobile', field: 'Mobile'},
        {label: 'State', field: 'State'},
        {label: 'Status', field: 'Status'},
    ];
    
}
