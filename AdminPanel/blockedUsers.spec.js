import 'app/libs/commands';
import {config as wdioConfig} from 'wdio.conf';
import LoginSteps from 'app/libs/steps/login.steps';
import * as consts from 'app/consts';
import allure from '@wdio/allure-reporter';
import IngiproBackendClient from 'app/libs/handles/ingiproBackendClient';
import TestData from 'app/libs/testData';
import LoginChecks from 'app/libs/expects/login.expect';
import NavigatorChecks from 'app/libs/expects/navigator.expect';
import AdminPanelSteps from 'app/libs/steps/adminPanel.steps';

let backend = new IngiproBackendClient();
let adminSteps = new AdminPanelSteps();
let loginSteps = new LoginSteps();
let loginChecks = new LoginChecks();
let navigatorChecks = new NavigatorChecks();
let blockedUser;
let registration_password = 'password';

describe('AdminPanel: ', () => {

    describe('Blocked users', () => {

        before(async () => {
            await backend.auth(wdioConfig.users.admin);
            await backend.createUser(TestData.createUniqLogin(), 60000, 'a', 'b', 'c', '88005553535', registration_password);
            blockedUser = { login: backend.userLogin, password: registration_password, world: 'test', key: backend.userKey, id: backend.userId};
            await backend.editUserBlock(wdioConfig.users.admin, blockedUser.id, true);
        }, 3);

        it('Check that blocked user can`t log in to specific ecosystem', () => {
            allure.addSeverity('blocker');
            allure.addTestId('834');
            browser.openUrl(consts.AUTH_URL);
            loginSteps
                .enterUserEmail(blockedUser.login)
                .enterUserPassword(blockedUser.password)
                .clickSubmitBtn();
            loginChecks.expectNoAccessTitleOnLoginPage('Доступ заблокирован');
        });

        after(async () => {
            browser.deleteAllCookies();
            browser.refresh();
        }, 3);
    });

    describe('Blocked users (blocking with interface)', () => {

        beforeEach(async () => {
            await backend.auth(wdioConfig.users.admin);
            await backend.createUser(TestData.createUniqLogin(), 60000, 'a', 'b', 'c', '88005553535', registration_password);
            blockedUser = { login: backend.userLogin, password: registration_password, world: 'test', key: backend.userKey, id: backend.userId};
            await backend.editUserBlock(wdioConfig.users.admin, blockedUser.id, true);
        }, 3);

        beforeEach(() => {
            loginSteps.login(wdioConfig.users.admin);
            adminSteps
                .openAdminPanelPageUrl()
                .clickNavButton(consts.BLOCKED_USERS_BUTTON_TITLE);
        }, 3);

        it('Check restoring access for a user after clicking the "Restore" button opposite his name in admin panel', () => {
            allure.addSeverity('blocker');
            allure.addTestId('35');
            adminSteps.findBlockedUser(blockedUser.login);
            adminSteps.restoreUser(blockedUser.login);
            browser.deleteAllCookies();
            browser.openUrl(consts.AUTH_URL);
            loginSteps.submitUserData(blockedUser);
            navigatorChecks.expectTableIsExist();
        });

        after(async () => {
            browser.deleteAllCookies();
            await backend.editUserBlock(wdioConfig.users.admin, blockedUser.id, true);
        }, 3);
    });
});
