import 'app/libs/commands';
import allure from '@wdio/allure-reporter';
import LoginSteps from 'app/libs/steps/login.steps';
import LoginChecks from 'app/libs/expects/login.expect';
import NavigatorChecks from 'app/libs/expects/navigator.expect';
import {config as wdioConfig} from 'wdio.conf';
import IngiproBackendClient from 'app/libs/handles/ingiproBackendClient';
import TestData from 'app/libs/testData';

let UNIQ_LOGIN;
let USER_ID;
let loginSteps = new LoginSteps('0');
let loginChecks = new LoginChecks();
let navigatorChecks = new NavigatorChecks();
let backend = new IngiproBackendClient();
let registration_password = 'password';

describe('Registration: ', () => {

    describe('Registration tests', () => {

        beforeEach(async () => {
            UNIQ_LOGIN = TestData.createUniqLogin();
            await backend.auth(wdioConfig.users.admin);
            await backend.createUser(UNIQ_LOGIN, 60000, 'a', 'b', 'c', '88005553535');
            USER_ID = backend.userId;
        }, 3);

        beforeEach(() => {
            loginSteps.openSignUpPage(backend.userKey);
        }, 3);

        it('should check that user data saving after pressing save button on registration page', () => {
            allure.addTestId('8969');
            allure.addSeverity('blocker');
            loginSteps
                .enterPasswordOnSignUpPage(registration_password)
                .clickSaveBtnOnSignUpPage();
            navigatorChecks.expectTableIsExist();
        });

        it('should check that registration form contains user\'s email', () => {
            allure.addTestId('10677');
            allure.addSeverity('blocker');
            loginChecks.expectLoginOnFormIsUsersEmail(UNIQ_LOGIN);
        });

        afterEach(async () => {
            await browser.deleteAllCookies();
            await backend.editUserBlock(wdioConfig.users.admin, USER_ID, true);
            await browser.pause(500);
        }, 3);
    });

});
