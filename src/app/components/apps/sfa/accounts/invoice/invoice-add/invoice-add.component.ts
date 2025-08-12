import { Component, EventEmitter, Output } from '@angular/core';
import { SharedModule } from '../../../../../../shared/shared.module';
import { CommonModule } from '@angular/common';
import { MaterialModuleModule } from '../../../../../../material-module/material-module.module';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../../../../../core/services/api/api.service';
import { ToastrServices } from '../../../../../../shared/services/toastr.service ';
import { CommonApiService } from '../../../../../../shared/services/common-api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormValidationService } from '../../../../../../utility/form-validation';
import { SpkInputComponent } from '../../../../../../../@spk/spk-input/spk-input.component';
import { SpkNgSelectComponent } from '../../../../../../../@spk/spk-ng-select/spk-ng-select.component';
import { SpkFlatpickrComponent } from '../../../../../../../@spk/spk-flatpickr/spk-flatpickr.component';
import { SpkReusableTablesComponent } from '../../../../../../../@spk/spk-reusable-tables/spk-reusable-tables.component';
import { LOGIN_TYPES } from '../../../../../../utility/constants';
import { UploadFileService } from '../../../../../../shared/services/upload.service';
import { FilePondModule } from 'ngx-filepond';

@Component({
    selector: 'app-invoice-add',
    imports: [FormsModule,CommonModule, SharedModule,MaterialModuleModule, SpkInputComponent, SpkNgSelectComponent, ReactiveFormsModule, SpkFlatpickrComponent, SpkReusableTablesComponent, FilePondModule],
    templateUrl: './invoice-add.component.html',
})
export class InvoiceAddComponent {
    invoiceForm: FormGroup = new FormGroup({});
    pageType:any = 'add'
    skLoading:boolean = false
    invoiceList: any = [];
    @Output() valueChange = new EventEmitter<any>();
    today= new Date();
    
    constructor(public api: ApiService, public toastr: ToastrServices, public CommonApiService: CommonApiService, private fb: FormBuilder, private router: Router, public route: ActivatedRoute, public formValidation: FormValidationService, public uploadService: UploadFileService){
    }
    
    ngOnInit() {
        this.invoiceForm = new FormGroup({
            billing_to_company: new FormControl('', Validators.required),
            billing_to_contact: new FormControl('', Validators.required),
            billing_to_mobile: new FormControl('', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]),
            billing_to_email: new FormControl('', Validators.required),
            billing_to_gst_no: new FormControl('', [Validators.required, Validators.pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)]),
            billing_to_address: new FormControl('', Validators.required),
            shipping_to_company: new FormControl('', Validators.required),
            shipping_to_contact: new FormControl('', Validators.required),
            shipping_to_mobile: new FormControl('', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]),
            shipping_to_email: new FormControl('', Validators.required),
            shipping_to_gst_no: new FormControl('', [Validators.required, Validators.pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)]),
            shipping_to_address: new FormControl('', Validators.required),
            customer_type_id: new FormControl('', Validators.required),
            customer_id: new FormControl('', Validators.required),
            billing_date: new FormControl('', Validators.required),
            invoice_number: new FormControl('', Validators.required),
            product_id: new FormControl(''),
            batch_no: new FormControl(''),
            product_name: new FormControl(''),
            product_code: new FormControl(''),
            total_quantity: new FormControl(''),
            customer_type_name: new FormControl(''),
            customer_name: new FormControl(''),
            customer_code: new FormControl(''),
            login_type_id: new FormControl(''),
            login_type_name: new FormControl(''),
        });
        
        this.CommonApiService.getCustomerTypeData([LOGIN_TYPES.PRIMARY]);
        this.CommonApiService.getProduct();
    }
    
    pondFiles: any[] = [];
    pondAttachmentFiles: any[] = [];
    pondOptions = this.getPondOptions('image');
    pondDocumentOptions = this.getPondOptions('pdf');
    getPondOptions(type: 'image' | 'pdf'): any {
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
                // maxFiles: this.giftList.length,
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
    onFileProcessed(event: any, type: string) {
        const file = event.file.file;
        Object.assign(file, { image_type: type });
        if (type === 'pdf') {
            this.pondAttachmentFiles = [...(this.pondAttachmentFiles || []), file];
        }
    }
    onFileRemove(event: any, type: string) {
        const file = event.file.file;
        if (type === 'pdf') {
            const index = this.pondAttachmentFiles.findIndex(f => f.name === file.name && f.size === file.size);
            if (index > -1) {
                this.pondAttachmentFiles.splice(index, 1);
            }
        }
    }
    
    private lastSearchTerm: string = '';
    onSearch(search: string, type:any) {
        const trimmedSearch = search?.trim() || '';
        if (trimmedSearch === this.lastSearchTerm) {
            return;
        }
        this.lastSearchTerm = trimmedSearch;
        
        if(type === 'customer'){
            this.CommonApiService.getCustomerData('', this.invoiceForm.value.customer_type_id, '', search)
        }
        if (type === 'product') {
            this.CommonApiService.getProduct(search);
        }
    }
    
    selectedProduct: any = {};
    findName(value: any, type: string) {
        if (type === 'customer_name' ){
            const selectedValue = this.CommonApiService.customerData.find((item: any) => item.value === value);
            if (selectedValue) {
                this.invoiceForm.patchValue({ customer_type_name: selectedValue.customer_type_name });
                this.invoiceForm.patchValue({ customer_name: selectedValue.label });
                this.invoiceForm.patchValue({ customer_code: selectedValue.customer_code });
                this.invoiceForm.patchValue({ login_type_id: selectedValue.login_type_id });
                this.invoiceForm.patchValue({ login_type_name: selectedValue.login_type_name });
            }
        }
        if (type === 'product_name'){
            const selectedValue = this.CommonApiService.productList.find((item: any) => item.value === value);
            if (selectedValue) {
                this.selectedProduct = selectedValue;
                this.invoiceForm.patchValue({ product_name: selectedValue.label });
                this.invoiceForm.patchValue({ product_code: selectedValue.product_code });
                console.log(this.selectedProduct);
                
            }
        }
    }
    
    
    addToList() {
        if (!this.invoiceForm.value.product_id || !this.invoiceForm.value.total_quantity || !this.invoiceForm.value.batch_no) {
            this.toastr.error('Please select a product.', '', 'toast-top-right');
            return;
        }
        
        if (this.invoiceForm.value.total_quantity <= 0) {
            this.toastr.error('Please enter a valid quantity greater than 0.', '', 'toast-top-right');
            return;
        }
        
        const existingItem = this.invoiceList.find((item: any) => item.product_id === this.invoiceForm.value.product_id);
        
        if (existingItem) {
            existingItem.total_quantity += this.invoiceForm.value.total_quantity;
        } else {
            console.log(this.selectedProduct , 'selectedProduct');
            
            const width = Number(this.selectedProduct.width) || 0;
            const length = Number(this.selectedProduct.length) || 0;
            const qty = Number(this.invoiceForm.value.total_quantity) || 0;
            
            // ✅ Square meter calculation
            const square_meter = (width * length / 1000000) * qty;
            
            const formattedExpense = {
                product_id: this.invoiceForm.value.product_id,
                total_quantity: qty,
                product_name: this.invoiceForm.value.product_name,
                product_code: this.invoiceForm.value.product_code,
                batch_no: this.invoiceForm.value.batch_no,
                color_code: this.selectedProduct.color_code,
                product_grade: this.selectedProduct.product_grade,
                length: length,
                width: width,
                square_meter: square_meter
            };
            
            this.formValidation.removeEmptyFields(formattedExpense);
            this.invoiceList.push(formattedExpense);
        }
        this.invoiceForm.get('product_id')?.reset();
        this.invoiceForm.get('total_quantity')?.reset();
        this.invoiceForm.get('batch_no')?.reset();
        this.selectedProduct = {};
        console.log(this.selectedProduct, 'selectedProduct');
        
    }
    
    deleteRow(index: number) {
        this.invoiceList.splice(index, 1);
    }
    
    onSubmit() {
        if (this.invoiceForm.valid){
            if (this.invoiceList.length === 0) {
                this.toastr.error('Please add at least one product.', '', 'toast-top-right');
                return;
            }
            
            this.pondFiles = [...this.pondAttachmentFiles];
            
            if (this.pondFiles.length === 0) {
                this.toastr.error('Please upload atleast one attachment', '', 'toast-top-right');
                return;
            }
            const payload = {
                ...this.invoiceForm.value,
                invoice_items : this.invoiceList
            };
            this.api.disabled = true;
            this.formValidation.removeEmptyFields(this.invoiceForm.value)
            this.api.post(payload, 'invoice/create').subscribe(result => {
                if (result['statusCode'] == 200) {
                    
                    if (this.pondFiles.length > 0) {
                        this.uploadService.uploadFile(result['data']['inserted_id'], 'invoice', this.pondFiles, 'Invoice Attachment', '/apps/sfa/accounts/invoice')
                    }
                    else{
                        this.api.disabled = false;
                        this.router.navigate(['/apps/sfa/accounts/invoice']);
                        this.toastr.success(result['message'], '', 'toast-top-right');
                        this.invoiceForm.reset();
                    }
                }
            });
        }
        else{
            this.formValidation.markFormGroupTouched(this.invoiceForm); // Call the global function
        }
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
}
