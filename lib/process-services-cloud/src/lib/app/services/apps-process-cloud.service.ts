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

import { Injectable } from '@angular/core';
import { Observable, from, throwError, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AlfrescoApiService } from '@alfresco/adf-core';
import { AppConfigService, LogService } from '@alfresco/adf-core';
import { Oauth2Auth } from '@alfresco/js-api';
import { ApplicationInstanceModel } from '../models/application-instance.model';

@Injectable()
export class AppsProcessCloudService {

    constructor(
        private apiService: AlfrescoApiService,
        private logService: LogService,
        private appConfigService: AppConfigService) {}

    /**
     * Gets a list of deployed apps for this user by status.
     * @returns The list of deployed apps
     */
    getDeployedApplicationsByStatus(status: string): Observable<ApplicationInstanceModel[]> {
        const api: Oauth2Auth = this.apiService.getInstance().oauth2Auth;
        const path = `${this.contextRoot}/alfresco-deployment-service/v1/applications`;
        const pathParams = {}, queryParams = {},
            headerParams = {}, formParams = {}, bodyParam = {},
            contentTypes = ['application/json'], accepts = ['application/json'];

        return from(api.callCustomApi(path, 'GET', pathParams, queryParams, headerParams, formParams, bodyParam,
            contentTypes, accepts))
            .pipe(
                map((apps: Array<{}>) => {
                        return apps.filter((app: ApplicationInstanceModel) => app.status === status)
                            .map((app) => {
                                return new ApplicationInstanceModel(app);
                            });
                    }
                ),
                catchError((err) => this.handleError(err))
            );
    }

    getRunningApplications(): Observable<any> {
        const url = this.getApplicationUrl();
        const httpMethod = 'GET', pathParams = {}, queryParams = {status: status}, bodyParam = {}, headerParams = {},
            formParams = {}, authNames = [], contentTypes = ['application/json'], accepts = ['application/json'];

        return (from(this.apiService.getInstance().oauth2Auth.callCustomApi(
            url, httpMethod, pathParams, queryParams,
            headerParams, formParams, bodyParam, authNames,
            contentTypes, accepts, Object, null, null)
        )).pipe(
            map((applications: ApplicationInstanceModel[]) => {
                    return applications.map((application) => {
                        return new ApplicationInstanceModel(application);
                    });
            }),
            catchError((err) => this.handleError(err))
        );
    }

    private getApplicationUrl() {
        return `${this.appConfigService.get('bpmHost')}/alfresco-deployment-service/v1/applications`;
    }

    private handleError(error?: any) {
        this.logService.error(error);
        return throwError(error || 'Server error');
    }
}
