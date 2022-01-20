import {config as wdioConfig} from 'wdio.conf';

import 'app/libs/commands';
import * as consts from 'app/consts';

import LoginSteps from 'app/libs/steps/login.steps';
import NavigatorSteps from 'app/libs/steps/navigator.steps';

import IngiproBackendClient from 'app/libs/handles/ingiproBackendClient';
import NavigatorChecks from 'app/libs/expects/navigator.expect';
import allure from '@wdio/allure-reporter';

let loginSteps = new LoginSteps('0');
let tableSteps = new NavigatorSteps('0');
let tableChecks = new NavigatorChecks();
let backend = new IngiproBackendClient();

describe('Navigator :', () => {

    before(async () => {
        await backend.auth(wdioConfig.users.homerSimpson);
        await backend.createProject('fileUploadTests');
    }, 3);

    describe('Upload : File upload tests', () => {

        beforeEach(() => {
            loginSteps.login(wdioConfig.users.homerSimpson);
            tableSteps.openNode(backend.newProjectId);
        }, 3);

        let files2D = [
            {path: consts.FRONTEND_UPLOAD_TESTS_FILE.png.path , name: consts.FRONTEND_UPLOAD_TESTS_FILE.png.name},
            {path: consts.FRONTEND_UPLOAD_TESTS_FILE.jpg.path , name: consts.FRONTEND_UPLOAD_TESTS_FILE.jpg.name},
            {path: consts.FRONTEND_UPLOAD_TESTS_FILE.tif.path , name: consts.FRONTEND_UPLOAD_TESTS_FILE.tif.name},
        ];

        files2D.forEach((test) => {
            it(`should upload ${test.name} and check that show up in navigator`, () => {
                allure.addTestId('13598');
                allure.addSeverity('blocker');
                tableSteps
                    .uploadFileFromComputer(test.path);
                tableChecks
                    .expectNodeIsDisplayed(test.name);
            });
        });

    });

    after(async () => {
        await backend.removeEntity(backend.newProjectId);
    }, 3);
});
