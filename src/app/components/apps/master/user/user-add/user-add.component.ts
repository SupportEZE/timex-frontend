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
    selector: 'app-user-add',
    imports: [FormsModule,CommonModule, SharedModule,MaterialModuleModule, SpkInputComponent, SpkNgSelectComponent, ReactiveFormsModule],
    templateUrl: './user-add.component.html',
})
export class UserAddComponent {
    userForm: FormGroup = new FormGroup({});
    pageType:any = 'add'
    skLoading:boolean = false
    districtList: any = [];
    @Output() valueChange = new EventEmitter<any>();
    id:any;
    
    constructor(public api: ApiService, public toastr: ToastrServices, public CommonApiService: CommonApiService, private fb: FormBuilder, private router: Router, public route: ActivatedRoute, public formValidation: FormValidationService){
    }
    
    ngOnInit() {
        const nav = this.router.getCurrentNavigation();
        this.userForm = new FormGroup({
            name: new FormControl('', Validators.required),
            mobile: new FormControl('', Validators.required),
            email: new FormControl(''),
            user_code: new FormControl('', Validators.required),
            pincode: new FormControl('', Validators.required),
            state: new FormControl('', Validators.required),
            district: new FormControl('', Validators.required),
            city: new FormControl('', Validators.required),
            address: new FormControl(''),
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
                this.userForm.patchValue(detailData)
            }
        }
        
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
                this.userForm.controls['state'].setValue(result['data']['state']);
                this.getDistrict(result['data']['state'])
                this.userForm.controls['district'].setValue(result['data']['district']);
                this.userForm.controls['city'].setValue(result['data']['city']);
            }
        });
    }
    
    onSearch(search: string, type: string) {
        if (type === 'state') {
            this.CommonApiService.getStates(search)
        }
    }
    
    onSubmit() {
        if (this.userForm.valid){
            this.api.disabled = true;
            this.formValidation.removeEmptyFields(this.userForm.value);
            const isEditMode = this.pageType === 'edit';
            const httpMethod = isEditMode ? 'patch' : 'post';
            const functionName = isEditMode ? 'user/update' : 'user/create';
            if (this.pageType === 'edit') {
                this.userForm.value._id = this.id
            }
            this.api[httpMethod](this.userForm.value, functionName).subscribe(result => {
                if (result['statusCode'] == 200) {
                    this.api.disabled = false;
                    this.router.navigate(['/apps/master/user']);
                    this.toastr.success(result['message'], '', 'toast-top-right');
                    this.userForm.reset();
                }
            });
        }
        else{
            this.formValidation.markFormGroupTouched(this.userForm); // Call the global function
        }
    }
}
