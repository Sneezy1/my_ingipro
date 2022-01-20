import {config as wdioConfig} from 'wdio.conf';
import 'app/libs/commands';
import * as consts from 'app/consts';
import CanvasSteps from 'app/libs/steps/canvas.steps';
import LoginSteps from 'app/libs/steps/login.steps';
import CanvasChecks from 'app/libs/expects/canvas.expect';
import IngiproBackendClient from 'app/libs/handles/ingiproBackendClient';
import allure from '@wdio/allure-reporter';

let loginSteps = new LoginSteps('0');
let canvasSteps = new CanvasSteps('0', '3d');
let canvasChecks = new CanvasChecks('0', '3d');
let backend = new IngiproBackendClient();

describe('3D Canvas :', () => {

    before (async () => {
        await backend.auth(wdioConfig.users.homerSimpson);
        await backend.createProject('canvasProject');
        await backend.uploadFile(backend.newProjectId, consts.BACKEND_UPLOAD_FILE.ifc);
    }, 3);

    before(() => {
        loginSteps.login(wdioConfig.users.homerSimpson);
        canvasSteps
            .openCanvas(backend.newNodeId, backend.newVersionId, '3d')
            .clickOnDynamicReportButton();
    }, 3);

    describe('Splash Screen : Test with "How to?" button', () => {

        it('should check "Как это?" message on 3d splash screen', () => {
            allure.addTestId('3738');
            allure.addSeverity('medium');
            canvasChecks
                .expectHowToMsgIsDisplayed();
        });

    });

    describe('Common tests with empty DR', () => {

        before(() => {
            canvasSteps
                .clickHowToMsg();
        }, 3);

        it('should check title on 3d splash screen', () => {
            allure.addTestId('3737');
            allure.addSeverity('medium');
            canvasChecks
                .expectSplashTitle(consts.SPLASH_TEXT.title);

        });

        it('should check description on 3d splash screen', () => {
            allure.addTestId('3737');
            allure.addSeverity('medium');
            canvasChecks
                .expectSplashDescription(consts.SPLASH_TEXT.description);
        });

        it('should check emoji on 3d splash screen', () => {
            allure.addTestId('3737');
            allure.addSeverity('medium');
            canvasChecks
                .expectSplashEmojiIsDisplayed();
        });

        it('should click "How to" msg and open hidden content on 3d splash screen', () => {
            allure.addTestId('3738');
            allure.addSeverity('medium');
            canvasChecks
                .expectHiddenHint(consts.SPLASH_TEXT.hiddenText);
        });

        it(`should check hidden youTube link on ${wdioConfig.ecosystemUrl} on 3d splash screen`, () => {
            allure.addTestId('3738');
            allure.addSeverity('medium');
            canvasChecks
                .expectHiddenLink(consts.SPLASH_TEXT.hiddenLink);
        });

        it('should check youTube link in next tab on 3d canvas', () => {
            allure.addTestId('3739');
            allure.addSeverity('medium');
            canvasSteps
                .clickHiddenLink();
            canvasChecks
                .expectUrlInNextTab(consts.SPLASH_TEXT.youTubeLink);
        });
    });

    after(async () => {
        await backend.removeEntity(backend.newProjectId);
    }, 3);
});
