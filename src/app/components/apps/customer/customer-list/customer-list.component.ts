import { Component, Input } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from '../../../../core/services/api/api.service';
import { ComanFuncationService } from '../../../../shared/services/comanFuncation.service';
import { ModuleService } from '../../../../shared/services/module.service';
import { FORMIDCONFIG } from '../../../../../config/formId.config';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MaterialModuleModule } from '../../../../material-module/material-module.module';
import { LogService } from '../../../../core/services/log/log.service';
import { SweetAlertService } from '../../../../core/services/alert/sweet-alert.service';
import { ToastrServices } from '../../../../shared/services/toastr.service ';
import { HighlightService } from '../../../../shared/services/highlight.service';
import { RemoveSpaceService } from '../../../../core/services/remove-space/removeSpace.service';
import { LOGIN_TYPES } from '../../../../utility/constants';
import { AuthService } from '../../../../shared/services/auth.service';
import { DateService } from '../../../../shared/services/date.service';

@Component({
    selector: 'app-user-list',
    imports: [SharedModule, CommonModule, MaterialModuleModule, FormsModule],
    templateUrl: './customer-list.component.html',
})
export class CustomerListComponent {
    @Input() basicDetail !:any;
    page: any = 1;
    FORMID: any = FORMIDCONFIG;
    LOGIN_TYPES: any = LOGIN_TYPES;
    skLoading: boolean = false
    activeTab: string = 'Active';
    pagination: any = {};
    filter: any = {};
    mainTabs: any = [];
    modules: any = {};
    listingCount: any = {};
    listing: any = [];
    accessRight: any = {};
    customerType: any;
    customerTypeId: any;
    pageKey = 'customer-list';
    highlightedId: string | undefined;
    orgData:any;
    vendors: any[] = [];
    productHeaders: any[] = [];
    grandTotal = { purchase: 0, consume: 0, balance: 0 };
    
    constructor(public dialog: MatDialog, public api: ApiService, public comanFuncation: ComanFuncationService, public moduleService: ModuleService, public alert: SweetAlertService, private router: Router, private logService: LogService, public spaceRemove:RemoveSpaceService, public toastr: ToastrServices, private highlightService: HighlightService, public route: ActivatedRoute, private authService: AuthService,private dateService: DateService) { }
    
    ngOnInit() {
        const accessRight = this.moduleService.getAccessMap('User');
        if (accessRight) {
            this.accessRight = accessRight;
        }
        
        this.route.paramMap.subscribe(params => {
            if (params) {
                this.customerType = params.get('login_type_name');
                this.customerTypeId = params.get('login_type_id');
                this.getList();
                let highlight = this.highlightService.getHighlight(this.pageKey);
                if (highlight != undefined) {
                    this.highlightedId = highlight.rowId;
                    this.pagination.cur_page = highlight.pageIndex;
                    this.filter = highlight.filters
                    this.highlightService.clearHighlight(this.pageKey);
                }
            }
        });
        this.orgData = this.authService.getUser();
    }
    
    
    onRefresh() {
        this.filter = {};
        this.getList();
    }
    
    onTabChange(tab: string) {
        this.activeTab = tab;
        this.getList();
    }
    
    goToAddPage() {
        this.router.navigate(['/apps/customer/customer-list/' + this.customerTypeId + '/' + this.customerType + '/customer-add']);
    }
    
    goToDetailPage(rowId: any) {
        this.router.navigate(['/apps/customer/customer-list/' + this.customerTypeId + '/' + this.customerType + '/customer-detail/'+rowId]);
    }
    
    edit(detail: any) {
        this.router.navigate(['/apps/customer/customer-list/' + this.customerTypeId + '/' + this.customerType + '/customer-edit/' + detail._id], { state: { detail } });
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
    
    onDateChange(type: 'created_at' ,event: any) {
        if (event) {
            const formattedDate = this.dateService.formatToYYYYMMDD(event); // Convert date to YYYY-MM-DD
            this.filter[type] = formattedDate;
        } else {
            this.filter[type] = null; // Reset the value if cleared
        }
        if ((this.filter.created_at)) {
            this.getList();
        }
    }
    
    getList() {
        this.skLoading = true;
        this.api.post({filters: this.filter, customer_type_name: this.spaceRemove.formatText(this.customerType), activeTab: this.activeTab,
            page: this.pagination.cur_page ?? 1}, 'customer/read').subscribe(result => {
            if (result['statusCode'] === 200) {
                this.skLoading = false;
                const rawVendors = result['data']['result'];
                this.listingCount = result['data']['statusTabs'];
                this.pagination = result['pagination'];
                const productMap: { [code: string]: any } = {};
                const dynamicProductColorMap: { [code: string]: string } = {};
                const predefinedColors = ['bg-primary/10', 'bg-secondary/10', 'bg-success/10', 'bg-danger/10', 'bg-warning/10', 'bg-info/10', 'bg-indigo-100', 'bg-purple-100', 'bg-pink-100', 'bg-teal-100'];
                let colorIndex = 0;
                rawVendors.forEach((vendor: { data: any[] }) => {
                    vendor.data.forEach((p: any) => {
                        const code = p.product_code;
                        if (!productMap[code]) {
                            productMap[code] = { name: p.product_name, code: code, length: p.length, width: p.width};
                            if (!dynamicProductColorMap[code]) {
                                dynamicProductColorMap[code] = predefinedColors[colorIndex % predefinedColors.length];
                                colorIndex++;
                            }
                        }
                    });
                });
                this.productHeaders = Object.values(productMap).map((p: any) => ({
                    ...p,
                    colorClass: dynamicProductColorMap[p.code]
                }));
                this.vendors = rawVendors.map((vendor: any) => {
                    const productData: { [code: string]: any } = {};
                    vendor.data.forEach((p: any) => {
                        productData[p.product_code] = { purchase: p.total_purchase, consume: p.total_consume, balance: p.total_balance};
                    });
                    return {
                        _id: vendor._id,
                        name: vendor.customer_name,
                        mobile: vendor.mobile,
                        products: productData,
                        total_purchase: vendor.total_purchase,
                        total_consume: vendor.total_consume,
                        total_balance: vendor.total_balance
                    };
                });
                
                // ✅ Calculate grand total only once
                this.grandTotal = { purchase: 0, consume: 0, balance: 0 };
                this.vendors.forEach(vendor => {
                    this.grandTotal.purchase += vendor.total_purchase || 0;
                    this.grandTotal.consume += vendor.total_consume || 0;
                    this.grandTotal.balance += vendor.total_balance || 0;
                });
            }
        });
    }
    
    // ✅ Vendor-wise total (row end)
    getVendorTotal(vendor: any) {
        let total = { purchase: 0, consume: 0, balance: 0 };
        for (let code of Object.keys(vendor.products)) {
            total.purchase += vendor.products[code]?.purchase || 0;
            total.consume += vendor.products[code]?.consume || 0;
            total.balance += vendor.products[code]?.balance || 0;
        }
        return total;
    }
    
    // ✅ Product-wise total (bottom row)
    getTotals(productCode: string) {
        let total = { purchase: 0, consume: 0, balance: 0 };
        for (let vendor of this.vendors) {
            const p = vendor.products[productCode] || {};
            total.purchase += p.purchase || 0;
            total.consume += p.consume || 0;
            total.balance += p.balance || 0;
        }
        return total;
    }
    
    downloadXLSX() {
        this.skLoading = true;
        this.api.post({filters: this.filter, customer_type_name: this.spaceRemove.formatText(this.customerType), activeTab: this.activeTab, page: this.pagination.cur_page ?? 1}, 'customer/export-data').subscribe(result => {
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
    
    onToggleChange(newState: boolean, id: string, status: string) {
        this.comanFuncation.statusChange(newState, id, status, 'toggle', 'customer/update-status',).subscribe((result: boolean) => {
            if (result) {
                this.getList();
            }
        });
    }
    
    PageHeaders = [
        { label: 'Created At', field: 'Created At' },
        { label: 'Created By', field: 'Created By' },
        { label: 'Customer Name', field: 'Name' },
        { label: 'Mobile', field: 'Mobile' },
        { label: 'Customer Code', field: 'Customer Code' },
        { label: 'Email ID', field: 'Email ID' },
        { label: 'GST No.', field: 'GST No.' },
        { label: 'State', field: 'State' },
        { label: 'District', field: 'District' },
        { label: 'City', field: 'City' },
        { label: 'Address', field: 'Address' },
        { label: 'Pincode', field: 'Pincode' },
        { label: 'Status', field: 'Status' },
        { label: 'Action', field: 'Action' },
    ];
}
