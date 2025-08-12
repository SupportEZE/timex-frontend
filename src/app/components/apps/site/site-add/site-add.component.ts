import { Component, EventEmitter, Output } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { CommonModule } from '@angular/common';
import { MaterialModuleModule } from '../../../../material-module/material-module.module';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from '../../../../core/services/api/api.service';
import { ToastrServices } from '../../../../shared/services/toastr.service ';
import { CommonApiService } from '../../../../shared/services/common-api.service';
import { DateService } from '../../../../shared/services/date.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ModuleService } from '../../../../shared/services/module.service';
import { UploadFileService } from '../../../../shared/services/upload.service';
import { FormValidationService } from '../../../../utility/form-validation';
import { SpkInputComponent } from '../../../../../@spk/spk-input/spk-input.component';
import { SpkNgSelectComponent } from '../../../../../@spk/spk-ng-select/spk-ng-select.component';
import { AuthService } from '../../../../shared/services/auth.service';
import { RemoveSpaceService } from '../../../../core/services/remove-space/removeSpace.service';
import { LOGIN_TYPES } from '../../../../utility/constants';

@Component({
  selector: 'app-site-add',
  imports: [FormsModule, CommonModule, SharedModule, MaterialModuleModule, SpkInputComponent, SpkNgSelectComponent, ReactiveFormsModule],
  templateUrl: './site-add.component.html',
})
export class SiteAddComponent {
  LOGIN_TYPES: any = LOGIN_TYPES;
  customerForm: FormGroup = new FormGroup({});
  pageType: any = 'add'
  skLoading: boolean = false
  districtList: any = [];
  customerType:any;
  customerTypeId:any;
  id: any;
  @Output() valueChange = new EventEmitter<any>();
  
  constructor(public api: ApiService, public toastr: ToastrServices, public CommonApiService: CommonApiService, private fb: FormBuilder, public spaceRemove:RemoveSpaceService, private router: Router, public route: ActivatedRoute, public formValidation: FormValidationService) {
  }
  
  ngOnInit() {
    this.customerForm = new FormGroup({
      user_id: new FormControl(''),
      customer_name: new FormControl('', Validators.required),
      mobile: new FormControl('', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]),
      email: new FormControl(''),
      gst_no: new FormControl('', [Validators.pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)]),
      pincode: new FormControl('', Validators.required),
      state: new FormControl('', Validators.required),
      district: new FormControl('', Validators.required),
      city: new FormControl('', Validators.required),
      address: new FormControl(''),
    });
    
    if (this.customerTypeId === '8') {
      this.customerForm.get('user_id')?.setValidators(Validators.required);
    } else {
      this.customerForm.get('user_id')?.clearValidators();
    }
    this.customerForm.get('user_id')?.updateValueAndValidity();
    
    const nav = this.router.getCurrentNavigation();
    this.route.paramMap.subscribe(params => {
      if (params) {
        this.customerType = params.get('login_type_name');
        this.customerTypeId = params.get('login_type_id');
      }
    });
    if (nav?.extras?.state?.['detail']) {
      const detailData = nav.extras.state['detail'];
    } else {
      const navigation = history.state;
      if (navigation?.detail) {
        const detailData = navigation.detail;
        this.id = detailData._id;
        this.pageType = 'edit';
        if (detailData.state) {
          this.getDistrict(detailData.state)
        }
        this.customerForm.patchValue(detailData)
      }
    }
    
    
    this.CommonApiService.getUserData();
    this.CommonApiService.getStates()
  }
  
  onSingleSelectChange(value: any, type?: any) {
    if (type === 'state') {
      this.getDistrict(value)
    }
  }
  
  getDistrict(state: string) {
    this.api.post({ "state": state, }, 'postal-code/districts').subscribe(result => {
      if (result['statusCode'] == 200) {
        this.districtList = result['data'];
        
      }
    });
  }
  
  onValueChange(event: any, type?: string) {
    const valueStr = event?.toString(); // Convert to string
    if (valueStr.length === 6 && type === 'pincode') {
      this.getPostalMaster(event)
    }
    this.valueChange.emit(event);
  }
  
  getPostalMaster(pincode: any) {
    this.api.post({ "pincode": pincode }, 'postal-code/read-using-pincode').subscribe(result => {
      if (result['statusCode'] == 200) {
        this.customerForm.controls['state'].setValue(result['data']['state']);
        this.getDistrict(result['data']['state'])
        this.customerForm.controls['district'].setValue(result['data']['district']);
        this.customerForm.controls['city'].setValue(result['data']['city']);
      }
    });
  }
  
  onSearch(search: string, type: string) {
    if (type === 'state') {
      this.CommonApiService.getStates(search)
    }
    if (type === 'user') {
      this.CommonApiService.getUserData(search)
    }
  }
  
  onSubmit() {
    if (this.customerForm.valid) {
      this.api.disabled = true;
      this.formValidation.removeEmptyFields(this.customerForm.value);
      this.customerForm.value.customer_type_name = this.spaceRemove.formatText(this.customerType);
      const isEditMode = this.pageType === 'edit';
      const httpMethod = isEditMode ? 'patch' : 'post';
      const functionName = isEditMode ? 'customer/update' : 'customer/create';
      if (this.pageType === 'edit') {
        this.customerForm.value._id = this.id
      }
      this.api[httpMethod](this.customerForm.value, functionName).subscribe(result => {
        if (result['statusCode'] == 200) {
          this.api.disabled = false;
          this.router.navigate(['/apps/customer/customer-list/' + this.customerTypeId  +'/'+ this.customerType]);
          this.toastr.success(result['message'], '', 'toast-top-right');
          this.customerForm.reset();
        }
      });
    }
    else {
      this.formValidation.markFormGroupTouched(this.customerForm); // Call the global function
    }
  }
}
