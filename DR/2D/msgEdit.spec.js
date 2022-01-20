import {config as wdioConfig} from 'wdio.conf';
import 'app/libs/commands';
import TestData from 'app/libs/testData';
import CanvasSteps from 'app/libs/steps/canvas.steps';
import LoginSteps from 'app/libs/steps/login.steps';
import CanvasChecks from 'app/libs/expects/canvas.expect';
import IngiproBackendClient from 'app/libs/handles/ingiproBackendClient';
import allure from '@wdio/allure-reporter';
import moment from 'moment';

let loginSteps = new LoginSteps('0');
let canvasSteps = new CanvasSteps('0');
let canvasChecks = new CanvasChecks();
let UNIQ_COMMENT;
let backend = new IngiproBackendClient();
let PROJECT_OWNERS = [];
let NEW_USER_NAME;
let COMMENT_FROM_ANOTHER_USER;
let registration_password = 'password';
let newUser = {};
moment.locale('ru');

describe('2D Canvas :', () => {

    before(async () => {
        await backend.auth(wdioConfig.users.homerSimpson);
        await backend.createProject('msgEditTestsProject', PROJECT_OWNERS);
    }, 3);

    describe('Msg Edit : Common comment edit tests', () => {

        beforeEach(async () => {
            await backend.createNode(backend.newProjectId, 'msgEditTests');
        }, 3);

        beforeEach(() => {
            UNIQ_COMMENT = TestData.createUniqComment();
            loginSteps.login(wdioConfig.users.homerSimpson);
            canvasSteps
                .openCanvas(backend.newNodeId, backend.newVersionId);
        }, 3);

        it('should check that the cancel edit comment button is visible', () => {
            allure.addTestId('6025');
            allure.addSeverity('medium');
            canvasSteps
                .chooseTool('Карандаш')
                .drawLine()
                .writeComment(UNIQ_COMMENT)
                .enterCommentEditMode();
            canvasChecks
                .expectCancelEditCommentBtnIsDisplayed();
        });

        it('should check that the comment edit input is visible', () => {
            allure.addTestId('13580');
            allure.addSeverity('blocker');
            canvasSteps
                .chooseTool('Карандаш')
                .drawLine()
                .writeComment(UNIQ_COMMENT)
                .enterCommentEditMode();
            canvasChecks
                .expectCommentEditInputIsDisplayed();
        });

        it('should edit message and check', () => {
            allure.addTestId('13581');
            allure.addSeverity('blocker');
            canvasSteps
                .chooseTool('Карандаш')
                .drawLine()
                .writeComment(`${UNIQ_COMMENT}1`)
                .editComment(`${UNIQ_COMMENT}2`);
            canvasChecks
                .expectCommentContent(`${UNIQ_COMMENT}2`);
        });

        it('should exit edit comment form after ESC', () => {
            allure.addTestId('3747');
            allure.addSeverity('medium');
            canvasSteps
                .chooseTool('Карандаш')
                .drawLine()
                .writeComment(UNIQ_COMMENT)
                .enterCommentEditMode()
                .exitCommentEditFormWithESC();
            canvasChecks
                .expectCommentEditFormIsNotDisplayed();
        });

        it('should enter edit mode and then cancel', () => {
            allure.addTestId('13582');
            allure.addSeverity('medium');
            canvasSteps
                .chooseTool('Карандаш')
                .drawLine()
                .writeComment(UNIQ_COMMENT)
                .enterCommentEditMode()
                .clickCancelCommentEditButton();
            canvasChecks
                .expectCommentEditFormIsNotDisplayed();
        });

        it('should check that user cant edit deleted comment', () => {
            allure.addTestId('13583');
            allure.addSeverity('medium');
            canvasSteps
                .chooseTool('Карандаш')
                .drawLine()
                .writeComment(UNIQ_COMMENT)
                .deleteComment();
            canvasChecks
                .expectCommentEditBtnIsNotDisplayed();
        });

        it('should check that height of the input form is rising', () => {
            allure.addTestId('13584');
            allure.addSeverity('medium');
            canvasSteps
                .chooseTool('Карандаш')
                .drawLine()
                .writeComment(UNIQ_COMMENT)
                .enterCommentEditMode();
            canvasChecks
                .expectCommentEditInputHeight('32');
        });

        it('should check that the edit button unavailable under "Пометка изменена" message', () => {
            allure.addTestId('13585');
            allure.addSeverity('medium');
            canvasSteps
                .chooseTool('Карандаш')
                .drawLine()
                .drawLine()
                .closeTask()
                .openTask();
            canvasChecks
                .expectCommentEditBtnIsNotDisplayed();
        });

        it('should check that the edit comment button is visible', () => {
            allure.addTestId('13586');
            allure.addSeverity('medium');
            canvasSteps
                .chooseTool('Карандаш')
                .drawLine()
                .writeComment(UNIQ_COMMENT);
            canvasChecks
                .expectEditCommentBtnIsDisplayed();
        });

        it('should edit message and check message edit time', () => {
            canvasSteps
                .chooseTool('Карандаш')
                .drawLine()
                .writeComment(`${UNIQ_COMMENT}1`);
            let current_unix_time = moment().format('Ред. D MMM YYYY (HH:mm)');
            canvasSteps.editComment(`${UNIQ_COMMENT}2`);
            canvasChecks.expectEditDate(current_unix_time);
        });
    }, 2);

    after(async () => {
        await backend.removeEntity(backend.newProjectId);
    }, 3);
});

describe('2D Canvas :', () => {

    before(async () => {
        await backend.auth(wdioConfig.users.admin);
        await backend.createUser(TestData.createUniqLogin(), 60000, 'Tester', 'Tester', '', '88005553535', registration_password);
        newUser = { login: backend.userLogin, password: registration_password, world: 'test', key: backend.userKey, id: backend.userId};
        PROJECT_OWNERS[0] = newUser.id;
        await backend.auth(wdioConfig.users.homerSimpson);
        await backend.getUserInformation(wdioConfig.users.homerSimpson);
        PROJECT_OWNERS[1] = backend.userId;
        await backend.createProject('msgEditTestsProject', PROJECT_OWNERS);
        NEW_USER_NAME = await TestData.getUserName(newUser);
        await backend.createNode(backend.newProjectId, 'msgEditTests');
    }, 3);

    describe('Msg Edit : Test with comments from 2 users', () => {

        before(() => {
            UNIQ_COMMENT = TestData.createUniqComment();
            loginSteps.login(wdioConfig.users.homerSimpson);
            canvasSteps
                .openCanvas(backend.newNodeId, backend.newVersionId);
        },);

        it('should check the another author is shown between your comments', () => {
            canvasSteps
                .chooseTool('Карандаш')
                .drawLine()
                .writeComment(UNIQ_COMMENT);
            browser.deleteAllCookies();
            COMMENT_FROM_ANOTHER_USER = TestData.createUniqComment();
            loginSteps.login(newUser);
            canvasSteps
                .openCanvas(backend.newNodeId, backend.newVersionId)
                .openTask()
                .writeComment(COMMENT_FROM_ANOTHER_USER);
            canvasChecks.expectCommentAuthor(NEW_USER_NAME, COMMENT_FROM_ANOTHER_USER);
        });
    }, 2);

    after(async () => {
        await backend.removeEntity(backend.newProjectId);
        await backend.editUserBlock(wdioConfig.users.admin, newUser.id, true);
    },);
});
