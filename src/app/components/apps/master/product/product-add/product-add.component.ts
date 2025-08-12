import { Component, EventEmitter, Output } from '@angular/core';
import { SharedModule } from '../../../../../shared/shared.module';
import { CommonModule } from '@angular/common';
import { MaterialModuleModule } from '../../../../../material-module/material-module.module';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from '../../../../../core/services/api/api.service';
import { ToastrServices } from '../../../../../shared/services/toastr.service ';
import { CommonApiService } from '../../../../../shared/services/common-api.service';
import { DateService } from '../../../../../shared/services/date.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ModuleService } from '../../../../../shared/services/module.service';
import { UploadFileService } from '../../../../../shared/services/upload.service';
import { FormValidationService } from '../../../../../utility/form-validation';
import { SpkInputComponent } from '../../../../../../@spk/spk-input/spk-input.component';
import { SpkNgSelectComponent } from '../../../../../../@spk/spk-ng-select/spk-ng-select.component';
import { AuthService } from '../../../../../shared/services/auth.service';

@Component({
    selector: 'app-product-add',
    imports: [FormsModule,CommonModule, SharedModule,MaterialModuleModule, SpkInputComponent, ReactiveFormsModule],
        templateUrl: './product-add.component.html',
})
export class ProductAddComponent {
    productForm: FormGroup = new FormGroup({});
    pageType:any = 'add'
    id:any;
    skLoading:boolean = false
    districtList: any = [];
    productId: any;
    @Output() valueChange = new EventEmitter<any>();
    
    constructor(public api: ApiService, public toastr: ToastrServices, public CommonApiService: CommonApiService, private fb: FormBuilder, private router: Router, public route: ActivatedRoute, private formValidation: FormValidationService){
    }
    
    ngOnInit() {
        const nav = this.router.getCurrentNavigation();
        this.productForm = new FormGroup({
            product_name: new FormControl('', Validators.required),
            product_code: new FormControl('', Validators.required),
            product_grade: new FormControl('', Validators.required),
            length: new FormControl('', Validators.required),
            width: new FormControl('', Validators.required),
            color_code: new FormControl('', Validators.required),
        });

        if (nav?.extras?.state?.['detail']) {
            const detailData = nav.extras.state['detail'];
        } else {
            const navigation = history.state;
            if (navigation?.detail) {
                const detailData = navigation.detail;
                this.pageType = 'edit';
                this.id = detailData._id;
                this.productForm.patchValue(detailData)
            }
          }
    }
    
    
    
 
    
    onSubmit() {
        if (this.productForm.valid){
            this.api.disabled = true;
            this.formValidation.removeEmptyFields(this.productForm.value);
            const isEditMode = this.pageType === 'edit';
            const httpMethod = isEditMode ? 'patch' : 'post';
            const functionName = isEditMode ? 'product/update' : 'product/create';
            if (this.pageType === 'edit'){
                this.productForm.value._id = this.id
            }
            this.api[httpMethod](this.productForm.value, functionName).subscribe(result => {
                if (result['statusCode'] == 200) {
                    this.api.disabled = false;
                    this.router.navigate(['/apps/master/products-list']);
                    this.toastr.success(result['message'], '', 'toast-top-right');
                    this.productForm.reset();
                }
            });
        }
        else{
            this.formValidation.markFormGroupTouched(this.productForm); // Call the global function
        }
    }
}
