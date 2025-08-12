import { Component, Input } from '@angular/core';
import { SharedModule } from '../../../../../../shared/shared.module';
import { CommonModule } from '@angular/common';
import { SpkReusableTablesComponent } from '../../../../../../../@spk/spk-reusable-tables/spk-reusable-tables.component';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from '../../../../../../core/services/api/api.service';
import { ComanFuncationService } from '../../../../../../shared/services/comanFuncation.service';
import { FORMIDCONFIG } from '../../../../../../../config/formId.config';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MaterialModuleModule } from '../../../../../../material-module/material-module.module';
import { SweetAlertService } from '../../../../../../core/services/alert/sweet-alert.service';
import { ToastrServices } from '../../../../../../shared/services/toastr.service ';
import { DateService } from '../../../../../../shared/services/date.service';
import { InvoiceModalComponent } from '../invoice-modal/invoice-modal.component';
import { LOGIN_TYPES } from '../../../../../../utility/constants';
import { AuthService } from '../../../../../../shared/services/auth.service';
import { HighlightService } from '../../../../../../shared/services/highlight.service';

@Component({
    selector: 'app-invoice-list',
    imports: [
        SharedModule, 
        CommonModule, 
        SpkReusableTablesComponent, 
        MaterialModuleModule, 
        FormsModule],
    templateUrl: './invoice-list.component.html',
})
export class InvoiceListComponent {
    @Input() pageHeader: boolean = true;
    @Input() basicDetail !: any
    page: any = 1;
    LOGIN_TYPES: any = LOGIN_TYPES;
    FORMID: any = FORMIDCONFIG;
    skLoading: boolean = false
    pagination: any = {};
    filter: any = {};
    listing: any = [];
    activeTab: any = 'Pending';
    mainTabs: any = [];
    listingCount: any = {};
    orgData: any;
    pageKey = 'stock';
    today = new Date();
    statusOptions = [{ name: 'Recieved' }, { name: 'Reject' }];
    showChangeStatusBtn: boolean = false;
    allTasksChecked: boolean = false;
    
    constructor(
        public dialog: MatDialog, 
        public api: ApiService, 
        public comanFuncation: ComanFuncationService, 
        public alert: SweetAlertService, 
        private router: Router,
        public toastr: ToastrServices, 
        private dateService: DateService, 
        private authService: AuthService,
        private highlightService: HighlightService
    ) { }
    
    ngOnInit() {
        this.activeTab = 'Pending';
        this.orgData = this.authService.getUser();
        this.getList();
    }
    
    
    setHighLight(rowId: string) {
        this.comanFuncation.setHighLight(this.pageKey, rowId, '', this.filter, this.pagination.cur_page ? this.pagination.cur_page : 1)
    }
    
    onRefresh() {
        this.filter = {};
        this.getList();
    }
    
    goToAddPage() {
        this.router.navigate(['/apps/sfa/accounts/invoice-add']);
    }
    
    goToDetailPage(rowId: any) {
        this.router.navigate(['/apps/sfa/accounts/invoice-detail', rowId]);
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
    
    onDateChange(type: 'billing_date' | 'created_at', event: any) {
        if (event) {
            const formattedDate = this.dateService.formatToYYYYMMDD(event); // Convert date to YYYY-MM-DD
            this.filter[type] = formattedDate;
        } else {
            this.filter[type] = null; // Reset the value if cleared
        }
        if (this.filter.billing_date || this.filter.created_at) {
            this.getList();
        }
    }
    
    goToWarrantyAddPage() {
        const selectedRows = this.listing.filter((row: any) => row.checked);
        if (selectedRows.length === 0) {
            this.toastr.error('Please select at least one row.', '', 'toast-top-right');
            return;
        }
        this.setHighLight(this.basicDetail._id)
        this.router.navigate(['/apps/service/warranty-registration/warranty-add'], { state: { selectedRows, 'customer_id': this.basicDetail._id, } });
    }
    
    toggleRowChecked(row: any): void {
        const selectedInvoiceId = row._id;
        const isChecked = row.checked;
        this.listing.forEach((r: any) => {
            r.checked = r._id === selectedInvoiceId ? isChecked : false;
        });
        const selectableRows = this.listing.filter((r: any) => r.total_quantity > 0);
        this.allTasksChecked = selectableRows.every((r: any) => r.checked);
        this.showChangeStatusBtn = selectableRows.some((r: any) => r.checked);
    }
    
    getList() {
        const { start_date, end_date, ...clonedFilter } = this.filter;
        this.skLoading = true;
        this.api.post({filters: clonedFilter, activeTab: this.activeTab, page: this.pagination.cur_page ?? 1, start_date: this.dateService.formatToYYYYMMDD(start_date), end_date: this.dateService.formatToYYYYMMDD(end_date) }, 'invoice/read').subscribe(result => {
            if (result['statusCode'] == 200) {
                this.skLoading = false;
                this.listing = result['data']['result'].map((row: any) => {
                    const items = row.invoice_items || [];
                    return {
                        ...row,
                        total_product_item: items.length,
                        total_product_qty: items.reduce((sum: number, item: any) => sum + (item.total_quantity || 0), 0)
                    };
                });
                this.listingCount = result['data']['statusTabs'];
                this.pagination = result['pagination'];
            }
        });
    }
    
    statusChange(rowId: any) {
        const dialogRef = this.dialog.open(InvoiceModalComponent, {
            width: '400px',
            data: {
                'lastPage': 'branding-list',
                'DetailId': rowId,
                'options': this.statusOptions,
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result === true) {
                this.getList();
            }
        });
    }
    
    getColumns(): any[] {
        return [
            { label: "" },
            { label: "S.No." },
            { label: 'Created At' },
            { label: 'Invoice Date' },
            { label: 'Invoice No.', table_class: "text-center" },
            { label: 'Customer Name' },
            { label: 'Product Detail' },
            { label: 'Purchase Qty' },
            { label: 'Warranty Registered' },
            { label: 'Balance Qty' },
            { label: 'Batch No.' },
            { label: 'Grade' },
            { label: 'Color' },
            { label: 'Length' },
            { label: 'Width' },
        ];
    }
    
    getConsumeBg(row: any): string {
        return row.consume_quantity ? 'bg-success' : 'bg-secondary';
    }
    
    getBalanceBg(row: any): string {
        return row.balance_quantity === 0 ? 'bg-danger' :
        row.balance_quantity < row.total_quantity ? 'bg-warning' :
        'bg-success/10';
    }
    
    // exportWithDateFilter() {
    //     const start = this.dateService.formatToYYYYMMDD(this.filter.start_date);
    //     const end = this.dateService.formatToYYYYMMDD(this.filter.end_date);
    //     // ✅ Filter clone and remove date fields from inside filters
    //     const clonedFilter = { ...this.filter };
    //     delete clonedFilter.start_date;
    //     delete clonedFilter.end_date;
    //     const payload = {filters: clonedFilter, activeTab: this.activeTab, page: this.pagination.cur_page ?? 1, start_date: start, end_date: end};
    //     this.skLoading = true;
    //     this.api.post(payload, 'invoice/export-data').subscribe(result => {
    //         this.skLoading = false;
    //         if (result?.statusCode === 200 && result.data?.filename) {
    //             const fileUrl = `${this.api.rootUrl}${result.data.filename}`;
    //             const link = document.createElement('a');
    //             link.href = fileUrl;
    //             link.download = result.data.filename.split('/').pop() || 'export.xlsx';
    //             document.body.appendChild(link);
    //             link.click();
    //             document.body.removeChild(link);
    //         } else {
    //             this.toastr.error(result?.message || 'Download failed.', '', 'toast-top-right');
    //         }
    //     });
    // }
    
    exportWithDateFilter(): void {
        const { start_date, end_date, ...clonedFilter } = this.filter;
        const payload = { filters: clonedFilter, activeTab: this.activeTab, page: this.pagination.cur_page ?? 1, start_date: this.dateService.formatToYYYYMMDD(start_date), end_date: this.dateService.formatToYYYYMMDD(end_date)};
        this.skLoading = true;
        this.api.post(payload, 'invoice/export-data').subscribe(result => {
            this.skLoading = false;
            if (result?.statusCode === 200 && result.data?.filename) {
                const fileUrl = `${this.api.rootUrl}${result.data.filename}`;
                const link = document.createElement('a');
                link.href = fileUrl;
                link.download = result.data.filename.split('/').pop() || 'export.xlsx';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        });
    } 
    
}
