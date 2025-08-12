import { Component, EventEmitter, Output } from '@angular/core';
import { SharedModule } from '../../../../../shared/shared.module';
import { CommonModule } from '@angular/common';
import { MaterialModuleModule } from '../../../../../material-module/material-module.module';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../../../../core/services/api/api.service';
import { ToastrServices } from '../../../../../shared/services/toastr.service ';
import { CommonApiService } from '../../../../../shared/services/common-api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UploadFileService } from '../../../../../shared/services/upload.service';
import { FormValidationService } from '../../../../../utility/form-validation';
import { SpkNgSelectComponent } from '../../../../../../@spk/spk-ng-select/spk-ng-select.component';
import { SpkReusableTablesComponent } from '../../../../../../@spk/spk-reusable-tables/spk-reusable-tables.component';
import { FilePondModule } from 'ngx-filepond';
import { ComanFuncationService } from '../../../../../shared/services/comanFuncation.service';
import { HighlightService } from '../../../../../shared/services/highlight.service';
@Component({
    selector: 'app-warranty-registration-add',
    imports: [FormsModule,CommonModule, SharedModule,MaterialModuleModule, SpkNgSelectComponent, ReactiveFormsModule, SpkReusableTablesComponent, FilePondModule],
    templateUrl: './warranty-registration-add.component.html',
})
export class WarrantyRegistrationAddComponent {
    addForm: FormGroup = new FormGroup({});
    pageType:any = 'add'
    @Output() valueChange = new EventEmitter<any>();
    today= new Date();
    warranty_items: any = [];
    pondFiles: any[] = [];
    customer_id:any;
    pageKey = 'warranty-registration';
    activeTab:any = 'Warranty Registration';
    pondBannerFiles1: any[] = []; // For "Complete Site Images"
    pondBannerFiles2: any[] = []; // For "Clear Project Photo"
    constructor
    (
        public api: ApiService, 
        public toastr: ToastrServices, 
        public CommonApiService: CommonApiService, 
        private fb: FormBuilder, 
        private router: Router, 
        public route: ActivatedRoute, 
        private formValidation: FormValidationService, 
        private uploadService: UploadFileService, 
        public comanFuncation: ComanFuncationService, 
        private highlightService: HighlightService
    ){
    }
    
    ngOnInit() {
        const nav = this.router.getCurrentNavigation();
        let highlight = this.highlightService.getHighlight(this.pageKey);
        if (highlight != undefined) {
            this.activeTab = highlight.tab;
            this.highlightService.clearHighlight(this.pageKey);
        }
        this.addForm = new FormGroup({
            site_id: new FormControl('', Validators.required),
            site_name: new FormControl(''),
            invoice_number: new FormControl(''),
            invoice_id: new FormControl(''),
            user_id: new FormControl('', Validators.required),
            user_name: new FormControl(''),
            warranty_date: new FormControl('', Validators.required),
            po_no: new FormControl('', Validators.required),
            mtc_number: new FormControl('', Validators.required),
            ro_code: new FormControl('', Validators.required),
            ro_name: new FormControl('', Validators.required),
            application_type: new FormControl('', Validators.required),
            date_of_installation: new FormControl('', Validators.required),
        });
        
        if (nav?.extras?.state?.['detail']) {
            const detailData = nav.extras.state['detail'];
        } else {
            const navigation = history.state;
            console.log(navigation);
            console.log(navigation?.selectedRows , 'navigation?.selectedRows');
            
            this.warranty_items = navigation?.selectedRows;
            this.customer_id = navigation?.customer_id;
            console.log(this.warranty_items);
            
            if (this.warranty_items?.length) {
                const invoiceNumber = this.warranty_items[0].invoice_number;
                const invoiceId = this.warranty_items[0]._id;
                console.log(invoiceNumber , invoiceId);
                
                this.addForm.patchValue({
                    invoice_number: invoiceNumber,
                    invoice_id: invoiceId
                });
                
                // this.addForm.addControl('invoice_number', new FormControl(invoiceNumber));
                // this.addForm.addControl('invoice_id', new FormControl(invoiceId));
            }
            
            this.warranty_items.forEach((row: any, i: number) => {
                const controlName = `inputQty${i}`;
                this.addForm.addControl(controlName, new FormControl('', Validators.required));
                this.addForm.get(controlName)?.setValue(row.inputQty);
            });
        }
        console.log(this.addForm.value , 'addForm');
        
        this.CommonApiService.getUserData();
    }
    
    onSearch(search: string, type: string) {
        if (type === 'user') {
            this.CommonApiService.getUserData('', search)
        }
        // if (type === 'customer') {
        //     this.CommonApiService.getCustomerData('', 8, search)
        // }
    }
    
    getPondOptions(type: 'image' | 'pdf', maxFiles = 6): any {
        const commonOptions = {
            allowFileTypeValidation: true,
            labelIdle: "Click or drag files here to upload...",
            server: {
                process: (_fieldName: any, file: any, _metadata: any, load: (arg0: string) => void) => {
                    setTimeout(() => {
                        load(Date.now().toString());
                    }, 1000);
                },
                revert: (_uniqueFileId: any, load: () => void) => {
                    load();
                }
            }
        };
        
        if (type === 'image') {
            return {
                ...commonOptions,
                allowMultiple: true,
                acceptedFileTypes: ['image/jpeg', 'image/png', 'image/jpg'],
                maxFileSize: '2MB',
                maxFiles: maxFiles,
                allowImageValidateSize: true,
                labelFileTypeNotAllowed: 'Only PNG and JPEG files are allowed',
                fileValidateTypeLabelExpectedTypes: 'Allowed: PNG, JPEG',
                labelImageValidateSizeTooSmall: 'Image is too small. Min: {minWidth}×{minHeight}',
                labelImageValidateSizeTooBig: 'Image is too large. Max: {maxWidth}×{maxHeight}',
            };
        } else {
            return {
                ...commonOptions,
                allowMultiple: false,
                acceptedFileTypes: ['application/pdf'],
                maxFileSize: '10MB',
                labelFileTypeNotAllowed: 'Only PDF files are allowed',
                fileValidateTypeLabelExpectedTypes: 'Allowed: PDF',
            };
        }
    }
    
    onFileProcessed(event: any, imageLabel: string, target: number) {
        const file = event.file.file;
        Object.assign(file, { image_type: imageLabel }); // yahan label set ho raha hai
        if (target === 1) {
            this.pondBannerFiles1 = [...(this.pondBannerFiles1 || []), file];
        } else if (target === 2) {
            this.pondBannerFiles2 = [...(this.pondBannerFiles2 || []), file];
        }
    }
    
    onFileRemove(event: any, target: number) {
        const file = event.file.file;
        if (target === 1) {
            const index = this.pondBannerFiles1.findIndex(f => f.name === file.name && f.size === file.size);
            if (index > -1) this.pondBannerFiles1.splice(index, 1);
        } else if (target === 2) {
            const index = this.pondBannerFiles2.findIndex(f => f.name === file.name && f.size === file.size);
            if (index > -1) this.pondBannerFiles2.splice(index, 1);
        }
    }
    
    findName(value: any, type: string) {
        if (type === 'user') {
            const selectedValue = this.CommonApiService.userData.find((item: any) => item.value === value);
            if (selectedValue) {
                this.addForm.patchValue({ user_name: selectedValue.label });
            }
        }
        
        if (type === 'site') {
            const selectedValue = this.CommonApiService.customerData.find((item: any) => item.value === value);
            if (selectedValue) {
                this.addForm.patchValue({ site_name: selectedValue.label });
            }
        }
    }
    
    onSubmit() {
        if (this.addForm.valid){
            this.pondFiles = [...this.pondBannerFiles1, ...this.pondBannerFiles2];
            
            if (this.pondFiles.length === 0) {
                this.toastr.error('Please upload atleast one attachment', '', 'toast-top-right');
                return;
            }
            this.api.disabled = true;
            const payload = {
                ...this.addForm.value,
                warranty_items: this.warranty_items
            }
            delete this.addForm.value.inputQty0;
            this.formValidation.removeEmptyFields(this.addForm.value);
            const isEditMode = this.pageType === 'edit';
            const httpMethod = isEditMode ? 'patch' : 'post';
            const functionName = isEditMode ? 'warranty/update' : 'warranty/create';
            this.api[httpMethod](payload, functionName).subscribe(result => {
                if (result['statusCode'] == 200) {
                    if (this.pondFiles.length > 0) {
                        // this.comanFuncation.setHighLight(this.pageKey, '', 'Pending', '', '')
                        this.uploadService.uploadFile(result['data']['inserted_id'], 'warranty', this.pondFiles, 'Warranty Images', '/apps/customer/customer-list/5/vendor/customer-detail/' + this.customer_id)
                    }
                    else{
                        this.api.disabled = false;
                        // this.comanFuncation.setHighLight(this.pageKey, '', 'Pending', '', '')
                        this.router.navigate(['/apps/customer/customer-list/5/vendor/customer-detail/' + this.customer_id]);
                        this.toastr.success(result['message'], '', 'toast-top-right');
                        this.addForm.reset();
                    }
                    
                }
            });
        }
        else{
            this.formValidation.markFormGroupTouched(this.addForm); // Call the global function
        }
    }
    
    getColumns(): any[] {
        return [ 
            { label: "S.No."},
            { label: "Product Name"},
            { label: "Product Code"},
            { label: "Purchase Qty", tableHeadColumn:'text-center' },
            { label: "Qty", tableHeadColumn:'text-center' },
            // { label: "Qty (Sq Mtrs)", tableHeadColumn:'text-center' },
            {label: 'Warranty Qty', tableHeadColumn:'text-center' },
            {label: 'Balance Qty', tableHeadColumn:'text-center' },
            { label: 'Batch No.'},
            { label: 'Grade'},
            { label: 'Color'},
            { label: 'Length'},
            { label: 'Width'},
        ];
    }
    
    qtyChange(row: any, index: number): void {
        const controlName = `inputQty${index}`;
        const control = this.addForm.get(controlName);
        const qty = Number(control?.value);
        
        if (isNaN(qty) || qty < 0) {
            this.toastr.error('Enter a valid non-negative quantity.', '', { positionClass: 'toast-top-right' });
            control?.setValue(null);
            return;
        }
        
        if (row.balance_quantity > 0) {
            if (qty > row.balance_quantity) {
                alert('Row number ' + (index + 1) + ': Maximum ' + row.balance_quantity + ' items can be registered under warranty.');
                control?.setValue(row.balance_quantity);
                return;
            }
        } else {
            if (qty > row.total_quantity) {
                alert('Row number ' + (index + 1) + ': You cannot register more than ' + row.total_quantity + ' items.');
                control?.setValue(row.total_quantity);
                return;
            }
        }
        
        row.inputQty = qty;
    }
    
    
    applicationType = [
        { label: 'RVI', value: 'RVI' },
        { label: 'Signage', value: 'Signage' },
        { label: 'Highmast', value: 'Highmast' },
        { label: 'Pol mouted Emblen', value: 'Pol mouted Emblen' },
        { label: 'Canopy Facia', value: 'Canopy Facia' },
        { label: 'Monolith', value: 'Monolith' },
        { label: 'EV Charging Canopy', value: 'EV Charging Canopy' },
        { label: 'QOC Canopy', value: 'MQOC Canopynolith' }
    ];
}


////////////////////////////////////////////////////-----------------------////////////////////////////////////////
// onFileProcessed(event: any, type: string) {
//     const file = event.file.file;
//     Object.assign(file, { image_type: type });
//     if (type === 'image') {
//         this.pondBannerFiles = [...(this.pondBannerFiles || []), file];
//     } else if (type === 'pdf') {
//         this.pondAttachmentFiles = [...(this.pondAttachmentFiles || []), file];
//     }
// }
// onFileRemove(event: any, type: string) {
//     const file = event.file.file;
//     if (type === 'image') {
//         const index = this.pondBannerFiles.findIndex(f => f.name === file.name && f.size === file.size);
//         if (index > -1) {
//             this.pondBannerFiles.splice(index, 1);
//         }
//     } else if (type === 'pdf') {
//         const index = this.pondAttachmentFiles.findIndex(f => f.name === file.name && f.size === file.size);
//         if (index > -1) {
//             this.pondAttachmentFiles.splice(index, 1);
//         }
//     }
// }
////////////////////////////////////////////////////-----------------------////////////////////////////////////////
// getPondOptions(): any {
//     return {
//         allowFileTypeValidation: true,
//         labelIdle: "Click or drag files here to upload...",
//         allowMultiple: true,
//         acceptedFileTypes: ['image/jpeg', 'image/png', 'image/jpg'],
//         maxFiles: 5,
//         maxFileSize: '2MB',
//         allowImageValidateSize: true,
//         labelFileTypeNotAllowed: 'Only PNG and JPEG files are allowed',
//         fileValidateTypeLabelExpectedTypes: 'Allowed: PNG, JPEG',
//         labelImageValidateSizeTooSmall: 'Image is too small. Min: {minWidth}×{minHeight}',
//         labelImageValidateSizeTooBig: 'Image is too large. Max: {maxWidth}×{maxHeight}',
//         server: {
//             process: (_fieldName: any, file: any, _metadata: any, load: (id: string) => void) => {
//                 setTimeout(() => {
//                     load(Date.now().toString());
//                 }, 1000);
//             },
//             revert: (_uniqueFileId: any, load: () => void) => {
//                 load();
//             }
//         }
//     };
// }
////////////////////////////////////////////////////-----------------------////////////////////////////////////////
