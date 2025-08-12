import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ContentChild, ElementRef, EventEmitter, Input, Output, Renderer2, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-showcode-card',
  templateUrl: './showcode-card.component.html',
  styleUrl: './showcode-card.component.scss',
  standalone: true,
  imports : [CommonModule,FormsModule]
})
export class ShowcodeCardComponent {
  @Input() actionIcons: boolean = false;
  @Input() iconClass!:string;
  @Input() iconName!:string;
  @Input() buttonName!:string;
  @Input('title') title!:string;
  @Input('titleView') titleView !: boolean;
  @Input('view') view!:boolean;
  @Input('prism') prism!:string;
  @Input('overallCount') overallCount!:number;
  @Input('tsCode') tsCode!:string;
  @Input() class!:string;
  @Input('classbody') classbody!:string;
  @Input('boxClass') boxClass!:string;
  @Input('boxHeader') boxHeader?:string;
  toggleStatus = false;
  @Input() overallCountShow!: boolean;
  @Input() refresBtnShow!: boolean;
  @Input() logBtnShow!: boolean;
  @Input() btn1!: boolean;
  @Input() activeTab?: string;
  @Input() searchPlaceholder: string = 'Search...';
  @Input() showSearch :boolean=false;
  
  @Output() refresh = new EventEmitter<string>();
  @Output() action = new EventEmitter<string>();
  @Output() logBtn = new EventEmitter<string>();
  @Output() search = new EventEmitter<string>();
  @Output() btnClick = new EventEmitter<string>();
  
  
  searchTerm: string = '';
  hasTsCode = false;

  constructor(private cdr: ChangeDetectorRef) {}
  
  toggleShowCode(){
    this.toggleStatus = !this.toggleStatus;
  }
  
  onRefreshClick() {
    this.searchTerm = '';
    this.activeTab ? this.refresh.emit(this.activeTab) : this.refresh.emit();
  }
  
  onlogBtnClick() {
    this.activeTab ? this.logBtn.emit(this.activeTab) : this.logBtn.emit();
  }


  onSearchClick() {
    this.search.emit(this.searchTerm); // ✅ Emits search term when clicking search
  }
  
  onActionClick(value:any) {
    this.action.emit(value);
  }

  onBtnClick(value:any) {
    this.btnClick.emit(value);
  }
}
