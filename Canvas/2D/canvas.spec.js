import {config as wdioConfig} from 'wdio.conf';
import 'app/libs/commands';
import * as consts from 'app/consts';
import CanvasSteps from 'app/libs/steps/canvas.steps';
import LoginSteps from 'app/libs/steps/login.steps';
import NavigatorSteps from 'app/libs/steps/navigator.steps';
import CanvasChecks from 'app/libs/expects/canvas.expect';
import NavigatorChecks from 'app/libs/expects/navigator.expect';
import IngiproBackendClient from 'app/libs/handles/ingiproBackendClient';
import allure from '@wdio/allure-reporter';

let loginSteps = new LoginSteps('0');
let tableSteps = new NavigatorSteps('0');
let canvasSteps = new CanvasSteps('0');
let tableChecks = new NavigatorChecks();
let canvasChecks = new CanvasChecks();
let backend = new IngiproBackendClient();

describe('Canvas :', () => {

    describe('Common tests', () => {

        before(async () => {
            await backend.auth(wdioConfig.users.homerSimpson);
            await backend.createProject('canvasProject');
            await backend.createNode(backend.newProjectId, 'canvasNodeTest', 'selenium tests for canvas');
        }, 3);

        beforeEach(() => {
            loginSteps.login(wdioConfig.users.homerSimpson);
            canvasSteps
                .openCanvas(backend.newNodeId, backend.newVersionId);
        }, 3);

        it('should open canvas', () => {
            allure.addTestId('13571');
            allure.addSeverity('blocker');
            canvasChecks.expectCanvasIsOpen();
        });

        it('should return to navigator after click on back button', () => {
            allure.addTestId('986');
            allure.addSeverity('critical');
            canvasSteps.clickOnBackButton();
            tableChecks.expectTableIsExist();
        }, 2);

        it('should show dynamic report after canvas is open', () => {
            allure.addTestId('13572');
            allure.addSeverity('medium');
            canvasChecks.expectDynamicReportIsActive();
        }, 2);

        it('should close dynamic report after click on dynamic report button', () => {
            allure.addTestId('13573');
            allure.addSeverity('blocker');
            canvasSteps
                .clickOnDynamicReportButton();
            canvasChecks
                .expectDynamicReportIsNotActive();
        });

        // skip до переделки метода загрузки файлов
        it.skip('should show message about tiles generation after upload and open canvas', () => {
            allure.addIssue('TESTING-398');
            tableSteps
                .uploadFileFromComputer(consts.DEFAULT_FILE_PATH)
                .closeUploadProgress()
                .clickOn2DButton(consts.TEST_NODE_TITLE);
            canvasChecks
                .expectCanvasIsOpen();
        });

        after(async () => {
            await backend.removeEntity(backend.newProjectId);
        }, 3);
    });

    describe('Eye button tests', () => {

        before(async () => {
            await backend.auth(wdioConfig.users.homerSimpson);
            await backend.createProject('canvasProject');
            await backend.createNode(backend.newProjectId, 'canvasNodeTest', 'selenium tests for canvas');
            await backend.createVersion(backend.newNodeId);
        }, 3);

        beforeEach(() => {
            loginSteps.login(wdioConfig.users.homerSimpson);
            canvasSteps
                .openCanvas(backend.newNodeId, backend.newVersionId);
        }, 3);

        it('should click version header and check that the "eye" button turned off', () => {
            allure.addTestId('13574');
            allure.addSeverity('medium');
            canvasSteps
                .clickEyeButton()
                .clickVersionHeader('Версия-1');
            canvasChecks
                .expectEyeButtonOff();
        });

        it('should check "eye" button on dynamic report', () => {
            allure.addTestId('13575');
            allure.addSeverity('critical');
            canvasSteps
                .clickEyeButton();
            canvasChecks
                .expectEyeButtonOff();
        });

        //TODO переделать тест,по другому работает алерт
        it.skip('should check alert with task link', () => {
            allure.addIssue('TESTING-400');
            canvasSteps
                .openTask();
            canvasChecks
                .expectTaskLinkAlert('Ссылка на задачу');
            browser.alertDismiss();
        });

        after(async () => {
            await backend.removeEntity(backend.newProjectId);
        }, 3);
    });
});
