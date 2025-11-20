import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-accordian',
  imports: [CommonModule, TranslateModule],
  templateUrl: './accordian.html',
  styleUrl: './accordian.css'
})
export class Accordian {
  @Input() items: { title: string, content: any }[] = [];
  @Output() filterChanged = new EventEmitter<{ type: string, event: any }>();

  isStringContent(content: any): boolean {
    return typeof content === 'string';
  }

  isArrayContent(content: any): boolean {
    return Array.isArray(content);
  }

  onFilterChange(type: string, event: any) {
    this.filterChanged.emit({ type, event });
  }
}
