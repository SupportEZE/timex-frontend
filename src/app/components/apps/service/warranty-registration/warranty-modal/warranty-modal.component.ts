import { CommonModule } from '@angular/common';
import { Component, Inject, Input } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from '../../../../../core/services/api/api.service';
import { ToastrServices } from '../../../../../shared/services/toastr.service ';
import { ModalHeaderComponent } from '../../../../../shared/components/modal-header/modal-header.component';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../../../../shared/shared.module';
import { MaterialModuleModule } from '../../../../../material-module/material-module.module';
import { FilePondModule } from 'ngx-filepond';
import { UploadFileService } from '../../../../../shared/services/upload.service';

@Component({
    selector: 'app-warranty-modal',
    imports: [SharedModule,CommonModule,FormsModule,ModalHeaderComponent, MaterialModuleModule, FilePondModule],
    templateUrl: './warranty-modal.component.html',
})
export class WarrantyModalComponent {
    skLoading:boolean = false
    data:any ={};
    status: string = '';
    
    constructor(@Inject(MAT_DIALOG_DATA) public modalData: any, private dialogRef: MatDialogRef<WarrantyModalComponent>, public api: ApiService, public toastr: ToastrServices, public uploadService: UploadFileService){}
    
    ngOnInit() {
        this.data._id = this.modalData.DetailId
        if (this.data?.options?.length) {
            this.status = this.data.options[0].name; // default to 'Verified'
        }
    }
    
    pondFiles: any[] = [];
    pondAttachmentFiles: any[] = [];
    pondOptions = this.getPondOptions('image');
    pondDocumentOptions = this.getPondOptions('warranty_verification_attachment');
    getPondOptions(type: 'image' | 'warranty_verification_attachment'): any {
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
                allowMultiple: true,
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
        if (type === 'warranty_verification_attachment') {
            this.pondAttachmentFiles = [...(this.pondAttachmentFiles || []), file];
        }
    }
    onFileRemove(event: any, type: string) {
        const file = event.file.file;
        if (type === 'warranty_verification_attachment') {
            const index = this.pondAttachmentFiles.findIndex(f => f.name === file.name && f.size === file.size);
            if (index > -1) {
                this.pondAttachmentFiles.splice(index, 1);
            }
        }
    }
    
    statusChange(){
        this.pondFiles = [...this.pondAttachmentFiles];
        
        if (this.status === 'Verified' && this.pondFiles.length === 0) {
            this.toastr.error('Please upload atleast one attachment', '', 'toast-top-right');
            return;
        }
        this.api.disabled = true;
        this.api.patch(this.data,'warranty/update-status').subscribe((result: any) => {
            if (result['statusCode'] === 200) {
                if (this.pondFiles.length > 0) {
                    this.uploadService.uploadFile(this.data._id, 'warranty', this.pondFiles, 'Warranty Verification Attachment', undefined, () => this.dialogRef.close(true))
                }
                else{
                    this.api.disabled = false;
                    this.toastr.success(result['message'], '', 'toast-top-right');
                    this.api.disabled = false;
                    this.dialogRef.close(true);
                }
            }
        });
    }
    
    closeModal() {
        this.dialogRef.close(); // Closes the dialog
    }
}
