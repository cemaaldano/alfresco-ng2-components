/*!
 * @license
 * Copyright 2016 Alfresco Software, Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SimpleChange } from '@angular/core';
import { By } from '@angular/platform-browser';

import { setupTestBed } from '@alfresco/adf-core';
import { ProcessServiceCloudTestingModule } from '../../../testing/process-service-cloud.testing.module';
import { MatDialog } from '@angular/material';
import { of } from 'rxjs';
import { ProcessFilterDialogCloudComponent } from './process-filter-dialog-cloud.component';
import { EditProcessFilterCloudComponent } from './edit-process-filter-cloud.component';
import { ProcessFiltersCloudModule } from '../process-filters-cloud.module';
import { ProcessFilterCloudModel } from '../models/process-filter-cloud.model';
import { ProcessFilterCloudService } from '../services/process-filter-cloud.service';
import { AppsProcessCloudService } from '../../../app/services/apps-process-cloud.service';
import { fakeApplicationInstance } from './../../../app/mock/app-model.mock';

describe('EditProcessFilterCloudComponent', () => {
    let component: EditProcessFilterCloudComponent;
    let service: ProcessFilterCloudService;
    let fixture: ComponentFixture<EditProcessFilterCloudComponent>;
    let dialog: MatDialog;
    let appsService: AppsProcessCloudService;
    let getRunningApplicationsSpy: jasmine.Spy;
    let getProcessFilterByIdSpy: jasmine.Spy;

    let fakeFilter = new ProcessFilterCloudModel({
        name: 'FakeRunningProcess',
        icon: 'adjust',
        id: 'mock-process-filter-id',
        state: 'RUNNING',
        appName: 'mock-app-name',
        processDefinitionId: 'process-def-id',
        assignment: 'fake-involved',
        order: 'ASC',
        sort: 'id'
    });

    setupTestBed({
        imports: [ProcessServiceCloudTestingModule, ProcessFiltersCloudModule],
        providers: [MatDialog]
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(EditProcessFilterCloudComponent);
        component = fixture.componentInstance;
        service = TestBed.get(ProcessFilterCloudService);
        appsService = TestBed.get(AppsProcessCloudService);
        dialog = TestBed.get(MatDialog);
        spyOn(dialog, 'open').and.returnValue({ afterClosed() { return of({
            action: ProcessFilterDialogCloudComponent.ACTION_SAVE,
            icon: 'icon',
            name: 'fake-name'
        }); }});
        getProcessFilterByIdSpy = spyOn(service, 'getProcessFilterById').and.returnValue(fakeFilter);
        getRunningApplicationsSpy = spyOn(appsService, 'getDeployedApplicationsByStatus').and.returnValue(of(fakeApplicationInstance));
    });

    it('should create EditProcessFilterCloudComponent', () => {
        expect(component instanceof EditProcessFilterCloudComponent).toBeTruthy();
    });

    it('should fetch process instance filter by id', async(() => {
        let processFilterIDchange = new SimpleChange(undefined, 'mock-process-filter-id', true);
        component.ngOnChanges({'id': processFilterIDchange});
        fixture.detectChanges();
        fixture.whenStable().then(() => {
            fixture.detectChanges();
            expect(getProcessFilterByIdSpy).toHaveBeenCalled();
            expect(component.processFilter.name).toEqual('FakeRunningProcess');
            expect(component.processFilter.icon).toEqual('adjust');
            expect(component.processFilter.state).toEqual('RUNNING');
            expect(component.processFilter.order).toEqual('ASC');
            expect(component.processFilter.sort).toEqual('id');
        });
    }));

    it('should display filter name as title', () => {
        let processFilterIDchange = new SimpleChange(undefined, 'mock-process-filter-id', true);
        component.ngOnChanges({'id': processFilterIDchange});
        fixture.detectChanges();
        const title = fixture.debugElement.nativeElement.querySelector('#adf-edit-process-filter-title-id');
        const subTitle = fixture.debugElement.nativeElement.querySelector('#adf-edit-process-filter-sub-title-id');
        expect(title).toBeDefined();
        expect(subTitle).toBeDefined();
        expect(title.innerText).toEqual('FakeRunningProcess');
        expect(subTitle.innerText.trim()).toEqual('ADF_CLOUD_EDIT_PROCESS_FILTER.TITLE');
    });

    describe('EditProcessFilter form', () => {

        beforeEach(() => {
            let processFilterIDchange = new SimpleChange(undefined, 'mock-process-filter-id', true);
            component.ngOnChanges({'id': processFilterIDchange});
            fixture.detectChanges();
        });

        it('should defined editProcessFilter form', () => {
            expect(component.editProcessFilterForm).toBeDefined();
        });

        it('should create editProcessFilter form', async(() => {
            fixture.detectChanges();
            fixture.whenStable().then(() => {
                const stateController = component.editProcessFilterForm.get('state');
                const sortController = component.editProcessFilterForm.get('sort');
                const orderController = component.editProcessFilterForm.get('order');
                expect(component.editProcessFilterForm).toBeDefined();
                expect(stateController).toBeDefined();
                expect(sortController).toBeDefined();
                expect(orderController).toBeDefined();

                expect(stateController.value).toBe('RUNNING');
                expect(sortController.value).toBe('id');
                expect(orderController.value).toBe('ASC');
            });
        }));

        it('should disable save button if the process filter is not changed', async(() => {
            component.toggleFilterActions = true;
            let expansionPanel = fixture.debugElement.nativeElement.querySelector('mat-expansion-panel-header');
            expansionPanel.click();
            fixture.detectChanges();
            fixture.whenStable().then(() => {
                let saveButton = fixture.debugElement.nativeElement.querySelector('#adf-save-id');
                expect(saveButton.disabled).toBe(true);
            });
        }));

        it('should disable saveAs button if the process filter is not changed', async(() => {
            component.toggleFilterActions = true;
            let expansionPanel = fixture.debugElement.nativeElement.querySelector('mat-expansion-panel-header');
            expansionPanel.click();
            fixture.detectChanges();
            fixture.whenStable().then(() => {
                let saveButton = fixture.debugElement.nativeElement.querySelector('#adf-save-as-id');
                expect(saveButton.disabled).toBe(true);
            });
        }));

        it('should enable delete button by default', async(() => {
            component.toggleFilterActions = true;
            let expansionPanel = fixture.debugElement.nativeElement.querySelector('mat-expansion-panel-header');
            expansionPanel.click();
            fixture.detectChanges();
            fixture.whenStable().then(() => {
                let deleteButton = fixture.debugElement.nativeElement.querySelector('#adf-delete-id');
                expect(deleteButton.disabled).toBe(false);
            });
        }));

        it('should display current process filter details', async(() => {
            fixture.detectChanges();
            fixture.whenStable().then(() => {
                let expansionPanel = fixture.debugElement.nativeElement.querySelector('mat-expansion-panel-header');
                expansionPanel.click();
                fixture.detectChanges();
                let stateElement = fixture.debugElement.nativeElement.querySelector('[data-automation-id="adf-cloud-edit-process-property-state"]');
                let sortElement = fixture.debugElement.nativeElement.querySelector('[data-automation-id="adf-cloud-edit-process-property-sort"]');
                let orderElement = fixture.debugElement.nativeElement.querySelector('[data-automation-id="adf-cloud-edit-process-property-order"]');
                expect(stateElement).toBeDefined();
                expect(sortElement).toBeDefined();
                expect(orderElement).toBeDefined();
                expect(stateElement.innerText.trim()).toBe('RUNNING');
                expect(sortElement.innerText.trim()).toBe('ID');
                expect(orderElement.innerText.trim()).toBe('ASC');
            });
        }));

        it('should enable save button if the process filter is changed', async(() => {
            fixture.detectChanges();
            let expansionPanel = fixture.debugElement.nativeElement.querySelector('mat-expansion-panel-header');
            expansionPanel.click();
            let stateElement = fixture.debugElement.nativeElement.querySelector('[data-automation-id="adf-cloud-edit-process-property-state"] .mat-select-trigger');
            stateElement.click();
            fixture.detectChanges();
            const saveButton = fixture.debugElement.nativeElement.querySelector('#adf-save-id');
            const options = fixture.debugElement.queryAll(By.css('.mat-option-text'));
            options[2].nativeElement.click();
            fixture.detectChanges();
            fixture.whenStable().then(() => {
                expect(saveButton.disabled).toBe(false);
            });
        }));

        it('should display state drop down', async(() => {
            fixture.detectChanges();
            let expansionPanel = fixture.debugElement.nativeElement.querySelector('mat-expansion-panel-header');
            expansionPanel.click();
            const stateElement = fixture.debugElement.nativeElement.querySelector('[data-automation-id="adf-cloud-edit-process-property-state"] .mat-select-trigger');
            stateElement.click();
            fixture.detectChanges();
            fixture.whenStable().then(() => {
                const statusOptions = fixture.debugElement.queryAll(By.css('.mat-option-text'));
                expect(statusOptions.length).toEqual(3);
            });
        }));

        it('should display sort drop down', async(() => {
            fixture.detectChanges();
            let expansionPanel = fixture.debugElement.nativeElement.querySelector('mat-expansion-panel-header');
            expansionPanel.click();
            const sortElement = fixture.debugElement.nativeElement.querySelector('[data-automation-id="adf-cloud-edit-process-property-sort"] .mat-select-trigger');
            sortElement.click();
            fixture.detectChanges();
            fixture.whenStable().then(() => {
                const sortOptions = fixture.debugElement.queryAll(By.css('.mat-option-text'));
                expect(sortOptions.length).toEqual(4);
            });
        }));

        it('should display order drop down', async(() => {
            fixture.detectChanges();
            let expansionPanel = fixture.debugElement.nativeElement.querySelector('mat-expansion-panel-header');
            expansionPanel.click();
            const orderElement = fixture.debugElement.nativeElement.querySelector('[data-automation-id="adf-cloud-edit-process-property-order"] .mat-select-trigger');
            orderElement.click();
            fixture.detectChanges();
            fixture.whenStable().then(() => {
                const orderOptions = fixture.debugElement.queryAll(By.css('.mat-option-text'));
                expect(orderOptions.length).toEqual(2);
            });
        }));

        it('should able to build a editProcessFilter form with default properties if input is empty', async(() => {
            let processFilterIDchange = new SimpleChange(undefined, 'mock-process-filter-id', true);
            component.ngOnChanges({'id': processFilterIDchange});
            component.filterProperties = [];
            fixture.detectChanges();
            fixture.whenStable().then(() => {
                const stateController = component.editProcessFilterForm.get('state');
                const sortController = component.editProcessFilterForm.get('sort');
                const orderController = component.editProcessFilterForm.get('order');
                fixture.detectChanges();
                expect(component.processFilterProperties).toBeDefined();
                expect(component.processFilterProperties.length).toBe(3);
                expect(component.editProcessFilterForm).toBeDefined();
                expect(stateController).toBeDefined();
                expect(sortController).toBeDefined();
                expect(orderController).toBeDefined();
                expect(stateController.value).toBe('RUNNING');
                expect(sortController.value).toBe('id');
                expect(orderController.value).toBe('ASC');
            });
        }));
    });

    describe('Process filterProperties', () => {

        beforeEach(() => {
            component.filterProperties = ['appName', 'processInstanceId', 'processName'];
        });

        it('should able to fetch running applications when appName property defined in the input', async(() => {
            fixture.detectChanges();
            let processFilterIDchange = new SimpleChange(undefined, 'mock-process-filter-id', true);
            component.ngOnChanges({'id': processFilterIDchange});
            const appController = component.editProcessFilterForm.get('appName');
            fixture.detectChanges();
            fixture.whenStable().then(() => {
                expect(getRunningApplicationsSpy).toHaveBeenCalled();
                expect(appController).toBeDefined();
                expect(appController.value).toBe('mock-app-name');
            });
        }));

        it('should able to build a editProcessFilter form with given input properties', async(() => {
            fixture.detectChanges();
            getProcessFilterByIdSpy.and.returnValue({ appName: 'mock-app-name', processInstanceId: 'process-instance-id', processName: 'mock-process-name' });
            let processFilterIDchange = new SimpleChange(undefined, 'mock-process-filter-id', true);
            component.ngOnChanges({'id': processFilterIDchange});
            fixture.detectChanges();
            const appController = component.editProcessFilterForm.get('appName');
            const processNameController = component.editProcessFilterForm.get('processName');
            const processInsIdController = component.editProcessFilterForm.get('processInstanceId');
            fixture.detectChanges();
            fixture.whenStable().then(() => {
                fixture.detectChanges();
                expect(getRunningApplicationsSpy).toHaveBeenCalled();
                expect(component.processFilterProperties).toBeDefined();
                expect(component.editProcessFilterForm).toBeDefined();
                expect(component.processFilterProperties.length).toBe(3);
                expect(appController).toBeDefined();
                expect(processNameController).toBeDefined();
                expect(processInsIdController).toBeDefined();
                expect(appController.value).toBe('mock-app-name');
            });
        }));
    });

    describe('edit filter actions', () => {

        beforeEach(() => {
            let processFilterIDchange = new SimpleChange(undefined, 'mock-process-filter-id', true);
            component.ngOnChanges({'id': processFilterIDchange});
            fixture.detectChanges();
        });

        it('should emit save event and save the filter on click save button', async(() => {
            component.toggleFilterActions = true;
            const saveFilterSpy = spyOn(service, 'updateFilter').and.returnValue(fakeFilter);
            let saveSpy: jasmine.Spy = spyOn(component.action, 'emit');

            fixture.detectChanges();
            const expansionPanel = fixture.debugElement.nativeElement.querySelector('mat-expansion-panel-header');
            expansionPanel.click();
            fixture.detectChanges();
            const stateElement = fixture.debugElement.nativeElement.querySelector('[data-automation-id="adf-cloud-edit-process-property-state"] .mat-select-trigger');
            stateElement.click();
            fixture.detectChanges();
            const saveButton = fixture.debugElement.nativeElement.querySelector('#adf-save-id');
            const stateOptions = fixture.debugElement.queryAll(By.css('.mat-option-text'));
            stateOptions[2].nativeElement.click();
            saveButton.click();
            fixture.detectChanges();
            fixture.whenStable().then(() => {
                expect(saveFilterSpy).toHaveBeenCalled();
                expect(saveSpy).toHaveBeenCalled();
            });
        }));

        it('should emit delete event and delete the filter on click of delete button', async(() => {
            component.toggleFilterActions = true;
            const deleteFilterSpy = spyOn(service, 'deleteFilter').and.callThrough();
            let deleteSpy: jasmine.Spy = spyOn(component.action, 'emit');
            fixture.detectChanges();

            const expansionPanel = fixture.debugElement.nativeElement.querySelector('mat-expansion-panel-header');
            expansionPanel.click();
            fixture.detectChanges();
            const stateElement = fixture.debugElement.nativeElement.querySelector('[data-automation-id="adf-cloud-edit-process-property-state"] .mat-select-trigger');
            stateElement.click();
            fixture.detectChanges();
            const deleteButton = fixture.debugElement.nativeElement.querySelector('#adf-delete-id');
            deleteButton.click();
            fixture.detectChanges();
            fixture.whenStable().then(() => {
                expect(deleteFilterSpy).toHaveBeenCalled();
                expect(deleteSpy).toHaveBeenCalled();
            });
        }));

        it('should emit saveAs event and add filter on click saveAs button', async(() => {
            component.toggleFilterActions = true;
            const saveAsFilterSpy = spyOn(service, 'addFilter').and.callThrough();
            let saveAsSpy: jasmine.Spy = spyOn(component.action, 'emit');
            fixture.detectChanges();

            const expansionPanel = fixture.debugElement.nativeElement.querySelector('mat-expansion-panel-header');
            expansionPanel.click();
            fixture.detectChanges();
            const stateElement = fixture.debugElement.nativeElement.querySelector('[data-automation-id="adf-cloud-edit-process-property-state"] .mat-select-trigger');
            stateElement.click();
            fixture.detectChanges();
            const saveButton = fixture.debugElement.nativeElement.querySelector('#adf-save-as-id');
            const stateOptions = fixture.debugElement.queryAll(By.css('.mat-option-text'));
            stateOptions[2].nativeElement.click();
            fixture.detectChanges();
            saveButton.click();
            fixture.detectChanges();
            fixture.whenStable().then(() => {
                expect(saveAsFilterSpy).toHaveBeenCalled();
                expect(saveAsSpy).toHaveBeenCalled();
                expect(dialog.open).toHaveBeenCalled();
            });
        }));
    });
});
