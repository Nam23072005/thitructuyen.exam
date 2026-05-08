import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterLink, RouterOutlet } from '@angular/router';
import { DemoNgZorroAntdModule } from '../../DemoNgZorroAntdModule';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterOutlet,
    RouterLink,
    DemoNgZorroAntdModule,
    NzTooltipModule,
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterOutlet,
    RouterLink,
    DemoNgZorroAntdModule,
  ],
})
export class SharedModule {}
