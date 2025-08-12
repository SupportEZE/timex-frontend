import { Component, Input } from '@angular/core';
import { FORMIDCONFIG } from '../../../../../../config/formId.config';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from '../../../../../core/services/api/api.service';
import { ComanFuncationService } from '../../../../../shared/services/comanFuncation.service';
import { SweetAlertService } from '../../../../../core/services/alert/sweet-alert.service';
import { Router } from '@angular/router';
import { ToastrServices } from '../../../../../shared/services/toastr.service ';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { MaterialModuleModule } from '../../../../../material-module/material-module.module';
import { SpkReusableTablesComponent } from '../../../../../../@spk/spk-reusable-tables/spk-reusable-tables.component';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../../../../shared/shared.module';
import { WarrantyModalComponent } from '../warranty-modal/warranty-modal.component';
import { LOGIN_TYPES } from '../../../../../utility/constants';
import { AuthService } from '../../../../../shared/services/auth.service';
import { DateService } from '../../../../../shared/services/date.service';
@Component({
    selector: 'app-warranty-registration-list',
    imports: [SharedModule,CommonModule,SpkReusableTablesComponent,MaterialModuleModule,FormsModule],
    templateUrl: './warranty-registration-list.component.html',
})
export class WarrantyRegistrationListComponent {
    @Input() basicDetail !:any
    @Input() pageHeader: boolean = true;
    page:any = 1;
    FORMID:any= FORMIDCONFIG;
    LOGIN_TYPES:any= LOGIN_TYPES;
    skLoading:boolean = false
    activeTab: string = 'Pending';
    pagination:any={};
    filter: any = {};
    mainTabs:any=[];
    modules:any={};
    listingCount:any={};
    listing:any=[];
    accessRight:any = {};
    orgData:any;
    
    
    constructor(public dialog:MatDialog,public api: ApiService,public comanFuncation: ComanFuncationService, public alert : SweetAlertService, private router: Router,public toastr: ToastrServices, private authService: AuthService,private dateService: DateService){}
    
    ngOnInit() {
        console.log(this.basicDetail , 'basicDetail');
        
        this.orgData = this.authService.getUser();
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
        // this.router.navigate(['/apps/service/warranty-registration/warranty-add']);
    }
    
    goToDetailPage(rowId:any)
    {
        this.router.navigate(['/apps/service/warranty-registration/warranty-detail' , rowId , this.activeTab]);
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
    
    onDateChange(type: 'created_at' | 'warranty_date' | 'date_of_installation',event: any) {
        if (event) {
            const formattedDate = this.dateService.formatToYYYYMMDD(event); // Convert date to YYYY-MM-DD
            this.filter[type] = formattedDate;
        } else {
            this.filter[type] = null; // Reset the value if cleared
        }
        if ((this.filter.created_at || this.filter.warranty_date)) {
            this.getList();
        }
    }
    
    getList(){
        this.skLoading = true;
        this.api.post({ filters: this.filter, 'customer_id': this.basicDetail?._id, activeTab: this.activeTab, page: this.pagination.cur_page ?? 1}, 'warranty/read').subscribe(result => {
            if(result['statusCode'] == 200){
                this.skLoading = false;
                this.listing = result['data']['result'].map((row: any) => {
                    const items = row.warranty_items || [];
                    return {
                        ...row,
                        total_product_item: items.length,
                        total_product_qty: items.reduce((sum: number, item: any) => sum + (item.inputQty || 0), 0)
                    };
                });
                this.listingCount = result['data']['statusTabs'];
                this.pagination = result['pagination'];
                
                this.mainTabs = [
                    { name: 'Pending', label: 'Pending', icon: 'ri-check-double-line', count: this.listingCount?.pendingCount || 0},
                    { name: 'Verified', label: 'Verified', icon: 'ri-file-forbid-line', count: this.listingCount?.verifiedCount || 0},
                    { name: 'Reject', label: 'Reject', icon: 'ri-file-forbid-line', count: this.listingCount?.rejectCount || 0}
                ];
            }
        });
    }
    
    onDeleteRow(rowId: any) {
        this.alert.confirm("Are you sure?")
        .then((result) => {
            if (result.isConfirmed) {
                this.api.patch({ _id: rowId, is_delete: 1}, 'warranty/delete').subscribe(result => {
                    if (result['statusCode']  ===  200) {
                        Swal.fire('Deleted!', result.message, 'success');
                        this.getList();
                    }                        
                });
            }
        });
    }
    
    // PageHeaders = [
    //     {label: 'Created At'},
    //     {label: 'Created By'},
    //     {label: 'User'},
    //     {label: 'Site'},
    //     {label: 'Warranty Date'},
    //     {label: 'Warranty No.'},
    //     {label: 'Application Type'},
    //     {label: 'PO No.'},
    //     {label: 'RO Name'},
    //     {label: 'RO Code.'},
    //     {label: 'Date Of Installation'},
    //     {label: 'Total Items', tableHeadColumn:'text-center'},
    //     {label: 'Total Qty', tableHeadColumn:'text-center'},
    // ];
    selectedRowId: string | null = null;
    
    onRowSelect(rowId: string) {
        this.selectedRowId = rowId;
    }
    
    selectedInvoiceId: string | null = null;
    showChangeStatusBtn: boolean = false;
    allTasksChecked: boolean = false;
    
    toggleRowChecked(row: any): void {
        const invoiceId = row._id;
        const isChecked = row.checked;
        
        if (isChecked && !this.selectedInvoiceId) {
            // First time selection — set selectedInvoiceId
            this.selectedInvoiceId = invoiceId;
        }
        
        // Sync selection across same invoice ID rows
        this.listing.forEach((r: any) => {
            if (r._id === invoiceId) {
                r.checked = isChecked;
            }
        });
        
        // ✅ Set selectedRowId to first checked row
        const checkedRows = this.listing.filter((r: { checked: any; }) => r.checked);
        this.selectedRowId = checkedRows.length ? checkedRows[0]._id : null;
        
        // If all rows are unchecked → reset selectedInvoiceId
        const anyChecked = this.listing.some((r: any) => r.checked);
        if (!anyChecked) {
            this.selectedInvoiceId = null;
        }
        
        // Show button only if at least one row is selected
        const selectableRows = this.listing.filter((r: { total_quantity: number; }) => r.total_quantity > 0);
        this.allTasksChecked = selectableRows.every((r: { checked: any; }) => r.checked);
        this.showChangeStatusBtn = selectableRows.some((r: { checked: any; }) => r.checked);
    }
    
    
    statusChange(rowId:any) {
        const dialogRef = this.dialog.open(WarrantyModalComponent, {
            width: '400px',
            data: {
                'lastPage':'branding-list',
                'DetailId':rowId,
                'options':this.statusOptions,
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if(result === true){
                this.getList();
                this.selectedInvoiceId = null;
                this.selectedRowId = null;
                this.showChangeStatusBtn = false;
                this.allTasksChecked = false;
                // Uncheck all rows
                this.listing.forEach((row: any) => row.checked = false);
            }
        });
    }
    
    statusOptions = [{name:'Verified'},{name:'Reject'}]

    downloadCSV() {
        this.skLoading = true;
        this.api.post({filters: this.filter, 'customer_id': this.basicDetail?._id, activeTab: this.activeTab, page: this.pagination.cur_page ?? 1}, 'warranty/export-csv').subscribe(result => {
            this.skLoading = false;
            if (result['statusCode'] === 200) {
                const filename = result['data']['filename'];
                const fileNameOnly = filename.split('/').pop() || 'download.csv';
                const fileUrl = `${this.api.rootUrl}${filename}`;
                const link = document.createElement('a');
                link.href = fileUrl;
                link.download = fileNameOnly;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                this.toastr.error(result['message'] || 'Download failed.', '', 'toast-top-right');
            }
        });
    }
    
    getColumns(): any[] {
        return [ 
            { label: ""},
            { label: "S.No."},
            {label: 'Created At'},
            {label: 'Created By'},
            {label: 'User'},
            {label: 'Site'},
            {label: 'Warranty Date'},
            {label: 'Warranty No.'},
            {label: 'Invoice No.'},
            {label: 'Product Detail'},
            {label: 'Qty'},
            {label: 'Application Type'},
            {label: 'PO No.'},
            {label: 'RO Name'},
            {label: 'RO Code.'},
            {label: 'MTC  No.'},
            {label: 'Date Of Installation'},
        ];
    }
    
}
