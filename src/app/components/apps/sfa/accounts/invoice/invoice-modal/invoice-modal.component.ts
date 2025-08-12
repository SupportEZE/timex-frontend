import { CommonModule } from '@angular/common';
import { Component, Inject, Input } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from '../../../../../../core/services/api/api.service';
import { ToastrServices } from '../../../../../../shared/services/toastr.service ';
import { ModalHeaderComponent } from '../../../../../../shared/components/modal-header/modal-header.component';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../../../../../shared/shared.module';
import { MaterialModuleModule } from '../../../../../../material-module/material-module.module';

@Component({
    selector: 'app-invoice-modal',
    imports: [SharedModule,CommonModule,FormsModule,ModalHeaderComponent, MaterialModuleModule],
    templateUrl: './invoice-modal.component.html',
})
export class InvoiceModalComponent {
    skLoading:boolean = false
    data:any ={};
    
    
    constructor(@Inject(MAT_DIALOG_DATA) public modalData: any, private dialogRef: MatDialogRef<InvoiceModalComponent>, public api: ApiService, public toastr: ToastrServices){}
    
    ngOnInit() {
        this.data._id = this.modalData.DetailId
    }
    
    statusChange(){
        this.api.disabled = true;
        this.api.post(this.data,'stock/create').subscribe((result: any) => {
            if (result['statusCode'] === 200) {
                this.toastr.success(result['message'], '', 'toast-top-right');
                this.api.disabled = false;
                this.dialogRef.close(true);
            }
        });
    }
    
    closeModal() {
        this.dialogRef.close(); // Closes the dialog
    }
}
