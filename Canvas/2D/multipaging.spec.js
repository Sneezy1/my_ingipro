import 'app/libs/commands';
import {config as wdioConfig} from 'wdio.conf';
import LoginSteps from 'app/libs/steps/login.steps';
import CanvasSteps from 'app/libs/steps/canvas.steps';
import MultipagingChecks from 'app/libs/expects/multipaging.expect';
import MultipagingSteps from 'app/libs/steps/multipaging.steps';
import * as consts from 'app/consts';
import IngiproBackendClient from 'app/libs/handles/ingiproBackendClient';
import TaskBackendClient from 'app/libs/handles/tasks.backendClient';
import allure from '@wdio/allure-reporter';

let backendTask = new TaskBackendClient;
let loginSteps = new LoginSteps('0');
let multipagingSteps = new MultipagingSteps('0');
let multipagingChecks = new MultipagingChecks();
let canvasSteps = new CanvasSteps('0');
let backend = new IngiproBackendClient();
let V1_PAGE_MOUNT = 12;
let V2_PAGE_MOUNT = 7;

describe('Multipage Canvas :', () => {

    before(async () => {
        await backend.auth(wdioConfig.users.homerSimpson);
        await backend.createProject('multipagingProject');
        await backend.uploadFile(backend.newProjectId, consts.BACKEND_UPLOAD_FILE.multipaging1);
        await backend.uploadNewVersionFile(backend.newNodeId, consts.BACKEND_UPLOAD_FILE.multipaging2);
        await backend.uploadNewVersionFile(backend.newNodeId, consts.BACKEND_UPLOAD_FILE.multipaging1);
        await backendTask.createTask(backend.cookie, backend.owners, backend.newVersionId, 'Открыто', 12);
    });

    describe('Common tests', () => {

        before(() => {
            loginSteps.login(wdioConfig.users.homerSimpson);
        }, 3);

        beforeEach(() => {
            canvasSteps
                .openCanvas(backend.newNodeId, backend.newVersionId);
        }, 3);

        it('should check that gallery is visible', () => {
            allure.addTestId('13619');
            allure.addSeverity('medium');
            multipagingChecks.expectMultipagingGalleryIsDisplayed();
        });

        it('should check that gallery toolbar is visible', () => {
            allure.addTestId('13620');
            allure.addSeverity('medium');
            multipagingChecks.expectToolbarIsDisplayed();
        });

        it('should check that gallery is hiding', () => {
            allure.addTestId('2279');
            allure.addSeverity('medium');
            multipagingSteps.hideGallery();
            multipagingChecks.expectGalleryIsHidden();
        });

        it('should check that the gallery expanding' , () => {
            allure.addTestId('2280');
            allure.addSeverity('medium');
            multipagingSteps
                .hideGallery()
                .expandGallery();
            multipagingChecks.expectMultipagingGalleryIsDisplayed();
        }, 2);

        it('should click last page button and check page', () => {
            allure.addTestId('2282');
            allure.addSeverity('medium');
            multipagingSteps.clickLastPageButton();
            multipagingChecks.expectPageId(V1_PAGE_MOUNT);
        });

        it('should click first page button and check page', () => {
            allure.addTestId('2281');
            allure.addSeverity('medium');
            multipagingSteps
                .setPageNumber(V1_PAGE_MOUNT)
                .clickFirstPageButton();
            multipagingChecks.expectPageId('1');
        });


        it('should check that the next page button is disabled on the last page', () => {
            allure.addTestId('2286');
            allure.addSeverity('medium');
            multipagingSteps
                .setPageNumber(V1_PAGE_MOUNT);
            multipagingChecks
                .expectNextPageButtonIsDisabled();
        });

        it('should check that the last page button is disabled on the last page', () => {
            allure.addTestId('2285');
            allure.addSeverity('medium');
            multipagingSteps
                .setPageNumber(V1_PAGE_MOUNT);
            multipagingChecks
                .expectLastPageButtonIsDisabled();
        });

        it('should check that the previous page button is disabled on the first page', () => {
            allure.addTestId('13622');
            allure.addSeverity('medium');
            multipagingChecks.expectPrevPageButtonIsDisabled();
        });

        it('should check that the first page button is disabled on the first page', () => {
            allure.addTestId('13621');
            allure.addSeverity('medium');
            multipagingChecks.expectFirstPageButtonIsDisabled();
        });

        it('should reach needed page by clicking next one preview', () => {
            allure.addTestId('2290');
            allure.addSeverity('medium');
            multipagingSteps
                .scrollGalleryByClickingPreview();
            multipagingChecks.expectPageId(V1_PAGE_MOUNT);
        });

        it('should open task on first page and it should open on needed page ', () => {
            allure.addTestId('13623');
            allure.addSeverity('medium');
            canvasSteps
                .openTask();
            multipagingChecks
                .expectPageId(V1_PAGE_MOUNT);
        });

        it('should check that checkbox "Показать задачи для всех страниц" is checked by default', () => {
            allure.addTestId('13624');
            allure.addSeverity('medium');
            multipagingChecks.expectCheckboxChecked();
        });

        it('should uncheck checkbox and check that its unchecked', () => {
            allure.addTestId('13625');
            allure.addSeverity('medium');
            multipagingSteps
                .clickOnShowAllPagesTasksCheckbox();
            multipagingChecks
                .expectCheckboxUnchecked();
        });

        it('should open task and check that its redirect on the page which written under task preview', () => {
            allure.addTestId('13626');
            allure.addSeverity('medium');
            canvasSteps
                .openTask();
            multipagingChecks
                .expectTaskPageIdUnderPreview(V1_PAGE_MOUNT);
        });

        it('should choose another version on the last page, and it should open on the last page', () => {
            allure.addTestId('13627');
            allure.addSeverity('medium');
            multipagingSteps.setPageNumber(V1_PAGE_MOUNT);
            canvasSteps.clickVersionHeader('Версия-2');
            multipagingChecks.expectPageId(V2_PAGE_MOUNT);
        });

        afterEach(() => {
            browser.refresh();
        }, 3);
    });

    describe('Test page switch', () => {

        before(() => {
            loginSteps.login(wdioConfig.users.homerSimpson);
            canvasSteps
                .openCanvas(backend.newNodeId, backend.newVersionId);
        }, 3);

        let inputPageIdVersions = [
            {args: ['-10'], expected: '1'},
            {args: ['%$^&*()(*&^*)(@!##_#!@_#'], expected: '1'},
            {args: ['привет'], expected: '1'},
            {args: ['hi'], expected: '1'},
            {args: ['0'], expected: '1'},
            {args: ['1'], expected: '1'},
            {args: [V1_PAGE_MOUNT + 1], expected: '1'},
            {args: [V1_PAGE_MOUNT], expected: V1_PAGE_MOUNT},
            {args: [V1_PAGE_MOUNT - 1], expected: V1_PAGE_MOUNT - 1},
        ];

        inputPageIdVersions.forEach((test) => {
            it(`should type page number ${test.args} in input form and check it`, () => {
                allure.addTestId('13628');
                allure.addSeverity('medium');
                multipagingSteps.setPageNumber(test.args);
                multipagingChecks.expectPageId(test.expected);
            });
        });

        let nextArrowPageIdVersions = [
            {args: ['1'], expected: '2'},
            {args: [V1_PAGE_MOUNT - 1], expected: V1_PAGE_MOUNT},
        ];

        nextArrowPageIdVersions.forEach((test) => {
            it(`should click next button on page ${test.args} and check it on the next one`, () => {
                multipagingSteps
                    .setPageNumber(test.args)
                    .clickNextArrowButton();
                multipagingChecks.expectPageId(test.expected);
            });

        });

        let prevArrowPageIdVersions = [
            {args: ['2'], expected: '1'},
            {args: [V1_PAGE_MOUNT], expected: V1_PAGE_MOUNT - 1},
        ];

        prevArrowPageIdVersions.forEach((test) => {
            it(`should click previous button on page ${test.args} and check it on the next one`, () => {
                allure.addTestId('2284');
                allure.addSeverity('medium');
                multipagingSteps
                    .setPageNumber(test.args)
                    .clickPrevArrowButton();
                multipagingChecks.expectPageId(test.expected);
            });

        });

        let prevKeyboardButtonVersions = [
            {args: ['2'], expected: '1'},
            {args: [V1_PAGE_MOUNT], expected: V1_PAGE_MOUNT - 1},
        ];

        prevKeyboardButtonVersions.forEach((test) => {
            it('should choose previous page with arrow button on keyboard', () => {
                allure.addTestId('2283');
                allure.addSeverity('medium');
                multipagingSteps
                    .setPageNumber(test.args)
                    .pressLeftArrowButtonOnKeyBoard();
                multipagingChecks
                    .expectPageId(test.expected);
            });
        });

        let nextKeyboardButtonVersions = [
            {args: ['1'], expected: '2'},
            {args: [V1_PAGE_MOUNT - 1], expected: V1_PAGE_MOUNT},
        ];

        nextKeyboardButtonVersions.forEach((test) => {
            it('should choose next page with arrow button on keyboard', () => {
                allure.addTestId('13629');
                allure.addSeverity('medium');
                multipagingSteps
                    .setPageNumber(test.args)
                    .pressRightArrowButtonOnKeyBoard();
                multipagingChecks
                    .expectPageId(test.expected);
            });
        });
    });

    after(async () => {
        await backend.removeEntity(backend.newProjectId);
    }, 3);
});
