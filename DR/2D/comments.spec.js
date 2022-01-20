import {config as wdioConfig} from 'wdio.conf';

import 'app/libs/commands';
import TestData from 'app/libs/testData';

import CanvasSteps from 'app/libs/steps/canvas.steps';
import LoginSteps from 'app/libs/steps/login.steps';

import CanvasChecks from 'app/libs/expects/canvas.expect';
import IngiproBackendClient from 'app/libs/handles/ingiproBackendClient';
import allure from '@wdio/allure-reporter';

let loginSteps = new LoginSteps('0');
let canvasSteps = new CanvasSteps();
let canvasChecks = new CanvasChecks();
let backend = new IngiproBackendClient();
let UNIQ_COMMENT;
let HOMER_NAME;

describe('2D Canvas :', () => {

    before(async () => {
        await backend.auth(wdioConfig.users.homerSimpson);
        await backend.createProject('commentTestsProject');
        HOMER_NAME = await TestData.getUserName(wdioConfig.users.homerSimpson);
    }, 3);

    describe('Comments : Common comment\'s tests', () => {

        beforeEach(async () => {
            await backend.createNode(backend.newProjectId, 'commentTests');
        }, 3);

        beforeEach(() => {
            UNIQ_COMMENT = TestData.createUniqComment();
            loginSteps.login(wdioConfig.users.homerSimpson);
            canvasSteps
                .openCanvas(backend.newNodeId, backend.newVersionId);
        }, 3);

        it('should write comment and check if send button is displayed', () => {
            allure.addTestId('3751');
            allure.addSeverity('medium');
            canvasSteps
                .chooseTool('Карандаш')
                .drawLine()
                .writeCommentWithoutSending(UNIQ_COMMENT);
            canvasChecks
                .expectSendBtnIsDisplayed();
        });

        it('should write comment and check it', () => {
            allure.addTestId('3752');
            allure.addSeverity('critical');
            canvasSteps
                .chooseTool('Карандаш')
                .drawLine()
                .writeComment(UNIQ_COMMENT);
            canvasChecks
                .expectCommentIsWrite(UNIQ_COMMENT);
        });

        it('should write comment and check its author', () => {
            allure.addTestId('3743');
            allure.addSeverity('medium');
            canvasSteps
                .chooseTool('Карандаш')
                .drawLine()
                .writeComment(UNIQ_COMMENT);
            canvasChecks
                .expectCommentAuthor(HOMER_NAME, UNIQ_COMMENT);
        });

        it('should check msg "polyline changed"', () => {
            canvasSteps
                .chooseTool('Карандаш')
                .drawLine()
                .waitForTaskCreation()
                .drawLine()
                .closeTask();
            canvasChecks
                .expectMsgPolylineChange('Пометка изменена');
        });
    });

    after(async () => {
        await backend.removeEntity(backend.newProjectId);
    }, 3);
});
