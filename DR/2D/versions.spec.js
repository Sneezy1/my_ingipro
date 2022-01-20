import {config as wdioConfig} from 'wdio.conf';
import 'app/libs/commands';
import CanvasSteps from 'app/libs/steps/canvas.steps';
import LoginSteps from 'app/libs/steps/login.steps';
import CanvasChecks from 'app/libs/expects/canvas.expect';
import IngiproBackendClient from 'app/libs/handles/ingiproBackendClient';
import allure from '@wdio/allure-reporter';
import * as consts from 'app/consts';
import TestData from 'app/libs/testData';

let loginSteps = new LoginSteps('0');
let canvasSteps = new CanvasSteps('0');
let backend = new IngiproBackendClient();
let canvasChecks = new CanvasChecks();
let CREATE_TIME;

describe('2D Canvas :', () => {

    before(async () => {
        await backend.auth(wdioConfig.users.homerSimpson);
        await backend.createProject('versionsTestsProject');
        await backend.uploadFile(backend.newProjectId, consts.BACKEND_UPLOAD_FILE.png);
        await backend.uploadNewVersionFile(backend.newNodeId, consts.BACKEND_UPLOAD_FILE.png);
    });

    before(async () => {
        CREATE_TIME = await TestData.getVersionTimeStamp(wdioConfig.users.homerSimpson, backend.newVersionId);
    });

    describe('Versions: Common canvas version\'s tests', () => {

        beforeEach(() => {
            loginSteps.login(wdioConfig.users.homerSimpson);
            canvasSteps
                .openCanvas(backend.newNodeId, backend.newVersionId);
        }, 3);

        let groupVersions = [
            {args: ['Версия-1'], expected: 'Версия-1'},
            {args: ['Версия-2'], expected: 'Версия-2'},
        ];

        groupVersions.forEach((test) => {
            allure.addTestId('13592');
            allure.addSeverity('medium');
            it('should click group header and check that the active group has changed', () => {
                canvasSteps
                    .clickVersionHeader(test.args);
                canvasChecks
                    .expectActiveVersion(test.expected);
            });
        });

        it('should minimize version and check that it was minimized', () => {
            allure.addTestId('13593');
            allure.addSeverity('medium');
            canvasSteps
                .resizeVersion('Версия-1');
            canvasChecks
                .expectVersionIsMinimized('Версия-1');
        });

        it('should expand version and check that it was expanded', () => {
            allure.addTestId('13594');
            allure.addSeverity('medium');
            canvasSteps
                .resizeVersion('Версия-2');
            canvasChecks
                .expectVersionIsExpanded('Версия-2');
        });

        it('should show active version creation date', () => {
            allure.addTestId('13595');
            allure.addSeverity('medium');
            canvasSteps
                .clickOnSortButton('По версии');
            canvasChecks
                .expectActiveVersionDate(CREATE_TIME);
        });

        it('should check that the last version has tag "Актуальное"', () => {
            allure.addTestId('13596');
            allure.addSeverity('medium');
            canvasChecks.expectActualHeaderGroup('Версия-2', 'Версия-2 (актуальная)\nS0');
        });

        it('should show active version header title(number of version + title: actual)', () => {
            allure.addTestId('13596');
            allure.addSeverity('medium');
            canvasSteps
                .clickOnSortButton('По версии');
            canvasChecks
                .expectActiveVersionHeaderTitle('Версия-2 (актуальная)');
        });

        it('should check available versions in download dropdown', () => {
            allure.addTestId('13597');
            allure.addSeverity('medium');
            allure.addIssue('FRONTEND-2219');
            canvasSteps
                .hoverOnDownloadButton();
            canvasChecks
                .expectDownloadVersion('Версия 2.png');
        });

    });

    after(async () => {
        await backend.removeEntity(backend.newProjectId);
    }, 3);
});
