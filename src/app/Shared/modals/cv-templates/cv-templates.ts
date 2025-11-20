import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-cv-templates',
  imports: [CommonModule],
  templateUrl: './cv-templates.html',
  styleUrl: './cv-templates.css'
})
export class CvTemplates {
  @Input() showTemplates = false;
  @Input() selectedTemplate = 1;

  @Output() close = new EventEmitter<void>();
  @Output() templateSelected = new EventEmitter<number>();

  applyTemplate(templateId: number) {
    this.templateSelected.emit(templateId);
  }

  onClose() {
    this.close.emit();
  }
}
