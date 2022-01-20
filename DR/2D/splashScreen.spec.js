import {config as wdioConfig} from 'wdio.conf';
import 'app/libs/commands';
import * as consts from 'app/consts';
import CanvasSteps from 'app/libs/steps/canvas.steps';
import LoginSteps from 'app/libs/steps/login.steps';
import CanvasChecks from 'app/libs/expects/canvas.expect';
import IngiproBackendClient from 'app/libs/handles/ingiproBackendClient';
import allure from '@wdio/allure-reporter';

let loginSteps = new LoginSteps('0');
let canvasSteps = new CanvasSteps('0');
let backend = new IngiproBackendClient();
let canvasChecks = new CanvasChecks();

describe('2D Canvas :', () => {

    before(async () => {
        await backend.auth(wdioConfig.users.homerSimpson);
        await backend.createProject('splashScreenTestsProject');
    }, 3);

    describe('Splash Screen : Common tests with empty DR', () => {

        before(async () => {
            await backend.createNode(backend.newProjectId, 'splashScreenTests');
        }, 3);

        before(() => {
            loginSteps.login(wdioConfig.users.homerSimpson);
            canvasSteps
                .openCanvas(backend.newNodeId, backend.newVersionId);
        }, 3);

        it('should check title on splash screen', () => {
            allure.addTestId('3737');
            allure.addSeverity('medium');
            canvasChecks
                .expectSplashTitle(consts.SPLASH_TEXT.title);
        });

        it('should check description on splash screen', () => {
            allure.addTestId('3737');
            allure.addSeverity('medium');
            canvasChecks
                .expectSplashDescription(consts.SPLASH_TEXT.description);
        });

        it('should check emoji on splash screen', () => {
            allure.addTestId('3737');
            allure.addSeverity('medium');
            canvasChecks
                .expectSplashEmojiIsDisplayed();
        });

        it('should check "Как это?" message', () => {
            allure.addTestId('3738');
            allure.addSeverity('medium');
            canvasChecks
                .expectHowToMsgIsDisplayed();
        });
    }, 2);

    describe('Splash Screen : check "How to?" links on empty DR', () => {

        beforeEach(async () => {
            await backend.createNode(backend.newProjectId, 'splashScreenTests');
        }, 3);

        before(() => {
            loginSteps.login(wdioConfig.users.homerSimpson);
        }, 3);

        beforeEach(() => {
            canvasSteps
                .openCanvas(backend.newNodeId, backend.newVersionId);
        }, 3);

        it('should click "How to" msg and open hidden content', () => {
            allure.addTestId('3738');
            allure.addSeverity('medium');
            canvasSteps
                .clickHowToMsg();
            canvasChecks
                .expectHiddenHint(consts.SPLASH_TEXT.hiddenText);
        });

        it(`should check hidden youTube link on ${wdioConfig.ecosystemUrl}`, () => {
            allure.addTestId('3738');
            allure.addSeverity('medium');
            canvasSteps
                .clickHowToMsg();
            canvasChecks
                .expectHiddenLink(consts.SPLASH_TEXT.hiddenLink);
        });

        it('should check youTube link in next tab', () => {
            allure.addTestId('3739');
            allure.addSeverity('medium');
            canvasSteps
                .clickHowToMsg()
                .clickHiddenLink();
            canvasChecks
                .expectUrlInNextTab(consts.SPLASH_TEXT.youTubeLink);
        });
    }, 2);

    after(async () => {
        await backend.removeEntity(backend.newProjectId);
    }, 3);
});
