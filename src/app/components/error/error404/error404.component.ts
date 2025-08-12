import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Location } from '@angular/common';


@Component({
  selector: 'app-error404',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './error404.component.html',
  styleUrl: './error404.component.scss'
})


export class Error404Component {
  constructor(public location: Location){}
  
  back(): void {
    this.location.back()
  }
}
