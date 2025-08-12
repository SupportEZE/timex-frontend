import { Component, Input } from '@angular/core';
import { ListingTabComponent } from '../../../../shared/components/listing-tab/listing-tab.component';
import { CommonModule } from '@angular/common';
import { SpkReusableTablesComponent } from '../../../../../@spk/spk-reusable-tables/spk-reusable-tables.component';
import { ApiService } from '../../../../core/services/api/api.service';
import { DateService } from '../../../../shared/services/date.service';
import { PaginationFooterComponent } from '../../../../shared/components/pagination-footer/pagination-footer.component';
import { ShowcodeCardComponent } from '../../../../shared/components/showcode-card/showcode-card.component';
import { SkeletonComponent } from '../../../../shared/components/skeleton/skeleton.component';
import { DataNotFoundComponent } from '../../../../shared/components/data-not-found/data-not-found.component';
import { MaterialModuleModule } from '../../../../material-module/material-module.module';
import { FormsModule } from '@angular/forms';
import { LOGIN_TYPES } from '../../../../utility/constants';
import { ComanFuncationService } from '../../../../shared/services/comanFuncation.service';
import { HighlightService } from '../../../../shared/services/highlight.service';
import { SharedModule } from '../../../../shared/shared.module';
import { Router } from '@angular/router';
import { ToastrServices } from '../../../../shared/services/toastr.service ';
import { AuthService } from '../../../../shared/services/auth.service';


@Component({
    selector: 'app-stock',
    imports: [CommonModule, SharedModule, PaginationFooterComponent, SpkReusableTablesComponent, SkeletonComponent, DataNotFoundComponent, MaterialModuleModule, FormsModule],
    templateUrl: './stock.component.html'
})
export class StockComponent {
    @Input() pageHeader: boolean = true;
    @Input() basicDetail !:any
    activeTab:any ='Stock';
    listingCount:any={};
    pagination:any={};
    skLoading:boolean = false;
    data_hide :boolean = true
    stockList:any =[];
    filter:any ={};
    pageKey = 'stock';
    LOGIN_TYPES = LOGIN_TYPES
    showChangeStatusBtn: boolean = false;
    mainTabs:any=[];
    orgData:any;
    
    constructor(public api: ApiService, public comanFuncation:ComanFuncationService, private highlightService: HighlightService, public date:DateService, private router: Router, public toastr: ToastrServices,private authService: AuthService){}
    
    ngOnChanges(){
        let highlight = this.highlightService.getHighlight(this.pageKey);
        if (highlight != undefined) {
            this.activeTab = highlight.tab;
            this.highlightService.clearHighlight(this.pageKey);
        }
        else{
            if (this.basicDetail.login_type_id === LOGIN_TYPES.PRIMARY || this.basicDetail.login_type_id === LOGIN_TYPES.SUB_PRIMARY) {
                this.activeTab = 'Stock';
                this.getStock();
            }
            else {
                this.activeTab = 'Purchase Request'
                this.basicDetail.pageFrom = this.activeTab;
            }
        }
        this.orgData = this.authService.getUser();
    }
    
    
    onRefresh()
    {
        this.filter = {};
        this.getStock();
    }
    
    goToWarrantyAddPage()
    {
        
        const selectedRows = this.stockList.filter((row: any) => row.checked);
        if (selectedRows.length === 0) {
            this.toastr.error('Please select at least one row.', '', 'toast-top-right');
            return;
        }
        this.setHighLight(this.basicDetail._id)
        this.router.navigate(['/apps/service/warranty-registration/warranty-add'], { state: { selectedRows, 'customer_id': this.basicDetail._id, } });
    }
    
    allTasksChecked: boolean=false;
    handleToggleSelectAll(checked: boolean) {
        this.stockList.forEach((row: any) => {
            if (row.stock_quantity > 0) {
                row.checked = checked;
            } else {
                row.checked = false;
            }
        });
        
        this.allTasksChecked = checked;
        this.showChangeStatusBtn = this.stockList.some((row: any) => row.checked);
    }
    toggleRowChecked(row: any): void {
        const selectableRows = this.stockList.filter((r: any) => r.stock_quantity > 0);
        this.allTasksChecked = selectableRows.every((r: any) => r.checked);
        this.showChangeStatusBtn = selectableRows.some((r: any) => r.checked);
    }
    
    onTabChange(tab: string) {
        this.activeTab = tab;
        if (tab === 'Stock' || tab === 'Out of stock'){
            this.getStock();
        }
        
        if (tab === 'Stock Transfer' || tab === 'Purchase Request') {
            this.basicDetail.pageFrom = tab;
        }
        this.setHighLight(this.basicDetail._id)
    }
    
    getColumns(): any[] {
        return [ 
            { label: ""},
            { label: "S.No."},
            { label: "Product Name"},
            { label: "Product Code"},
            { label: "Stock Qty", tableHeadColumn:'text-center'},
            { label: "Qty (Sq Mtrs)", tableHeadColumn:'text-center'},
            { label: 'Batch No.'},
            { label: 'Grade'},
            { label: 'Color'},
            { label: 'Length'},
            { label: 'Width'},
        ];
    }
    
    getStock() {
        this.skLoading = true
        this.api.post({ filters: this.filter, 'customer_id': this.basicDetail._id, 'activeTab': this.activeTab, 'page': this.pagination.cur_page ?? 1 }, 'stock/read').subscribe(result => {
            if (result['statusCode'] === 200) {
                this.stockList = result['data']['result'];
                this.listingCount = result['data']['statusTabs'];
                this.pagination = result['pagination'];
                this.skLoading = false
                
                
                this.mainTabs = [
                    ...(this.showForLoginTypes([LOGIN_TYPES.PRIMARY, LOGIN_TYPES.SUB_PRIMARY, LOGIN_TYPES.SALES_VENDOR]) ? [ 
                        { name: 'Stock', label: 'In Stock', icon: 'ri-checkbox-circle-fill', count: this.listingCount?.inStockCount || 0 },
                        { name: 'Out of stock', label: 'Out of Stock', icon: 'ri-close-circle-fill', count: this.listingCount?.outStockCount || 0 },
                    ] : []),
                ];
            }
        });
    }
    
    
    
    
    setHighLight(rowId: string) {
        this.comanFuncation.setHighLight(this.pageKey, rowId, '', this.filter, this.pagination.cur_page ? this.pagination.cur_page : 1)
    }
    
    
    // -------- Pagination//
    changeToPagination(btnType: string) {
        if (btnType == 'Previous') {
            if (this.pagination.prev && this.pagination.cur_page > 1) {
                this.pagination.cur_page--;  // Decrement the page number
                this.getStock();
            }
        }
        else
        {
            if (this.pagination.next) {
                this.pagination.cur_page++;  // Increment the page number
                this.getStock();
            }
        }
    }
    
    changeToPage(newPage: number) {
        this.pagination.cur_page = newPage;
        this.getStock();
    }
    // --------//
    
    showForLoginTypes(types: number[], options: { exclude?: boolean } = {}): boolean {
        const isIncluded = types.includes(this.basicDetail.login_type_id);
        return options.exclude ? !isIncluded : isIncluded;
    }
    
}
