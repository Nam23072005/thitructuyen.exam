import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterLink, RouterOutlet } from '@angular/router';
import { DemoNgZorroAntdModule } from '../../DemoNgZorroAntdModule';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterOutlet,
    RouterLink,
    DemoNgZorroAntdModule,
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
