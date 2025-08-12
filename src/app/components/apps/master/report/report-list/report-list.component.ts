import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MaterialModuleModule } from '../../../../../material-module/material-module.module';
import { SpkReusableTablesComponent } from '../../../../../../@spk/spk-reusable-tables/spk-reusable-tables.component';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../../../../shared/shared.module';
import { AuthService } from '../../../../../shared/services/auth.service';
import { DateService } from '../../../../../shared/services/date.service';
import { ToastrServices } from '../../../../../shared/services/toastr.service ';
import { Router } from '@angular/router';
import { SweetAlertService } from '../../../../../core/services/alert/sweet-alert.service';
import { ComanFuncationService } from '../../../../../shared/services/comanFuncation.service';
import { ApiService } from '../../../../../core/services/api/api.service';
import { MatDialog } from '@angular/material/dialog';
import { LOGIN_TYPES } from '../../../../../utility/constants';

@Component({
  selector: 'app-report-list',
  imports: [
    SharedModule,
    CommonModule,
    SpkReusableTablesComponent,
    MaterialModuleModule,
    FormsModule
  ],
  templateUrl: './report-list.component.html',
  styleUrl: './report-list.component.scss'
})
export class ReportListComponent {
  @Input() pageHeader: boolean = true;
  @Input() basicDetail !:any;
  LOGIN_TYPES:any= LOGIN_TYPES;
  page:any = 1;
  skLoading:boolean = false
  pagination:any={};
  filter: any = {};
  listing:any=[];
  orgData:any;
  today= new Date();
  
  constructor(
    public dialog:MatDialog,
    public api: ApiService,
    public comanFuncation: ComanFuncationService, 
    public alert : SweetAlertService,
    private router: Router,
    public toastr: ToastrServices, 
    private dateService: DateService, 
    private authService: AuthService
  ){}
  
  ngOnInit() {
    this.orgData = this.authService.getUser();
    this.getList();
  }
  
  
  onRefresh()
  {
    this.filter = {};
    this.getList();
  }
  
  onTabChange(tab: string) {
    this.getList();
  }
  
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
  
  onDateChange(type: 'created_at' | 'billing_date',event: any) {
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
  
  dateFilter(){
    this.getList();
  }
  
  getList(){
    this.skLoading = true;
    this.api.post({ filters: this.filter, page: this.pagination.cur_page ?? 1}, 'report/read').subscribe(result => {
      if(result['statusCode'] == 200){
        this.skLoading = false;
        this.listing = result['data']['result'];
        this.pagination = result['pagination'];
      }
    });
  }
  
  downloadCSV() {
    this.skLoading = true;
    this.api.post({filters: this.filter, 'customer_id': this.basicDetail?._id, page: this.pagination.cur_page ?? 1}, 'report/export-csv').subscribe(result => {
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
  
  PageHeaders = [
    {label: 'Created Name'},
    {label: 'Created At'},
    {label: 'Vendor Name'},
    {label: 'Product Detail'},
    {label: 'Qty'},
    {label: 'Warranty Consumed'},
    {label: 'Qty (Sq Mtrs)'},
    {label: 'MTC No.'},
    {label: 'Warranty No'},
    {label: 'Site Name'},
    {label: 'Site Code'},
    {label: 'PO No'},
    {label: 'Status'}
  ];
  
}
