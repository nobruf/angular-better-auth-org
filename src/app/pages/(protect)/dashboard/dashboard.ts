import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styles: ``,
})
export class Dashboard {
  performanceBars = [
    { height: 6, opacity: 100 },
    { height: 7, opacity: 100 },
    { height: 5, opacity: 100 },
    { height: 8, opacity: 100 },
    { height: 6, opacity: 100 },
    { height: 7, opacity: 100 },
    { height: 5, opacity: 100 },
    { height: 6, opacity: 100 },
    { height: 7, opacity: 100 },
    { height: 8, opacity: 100 },
    { height: 6, opacity: 100 },
    { height: 5, opacity: 100 },
    { height: 7, opacity: 100 },
    { height: 6, opacity: 100 },
    { height: 8, opacity: 100 },
    { height: 5, opacity: 100 },
    { height: 4, opacity: 40 },
    { height: 3, opacity: 40 },
    { height: 4, opacity: 40 },
    { height: 3, opacity: 40 },
  ];
}
