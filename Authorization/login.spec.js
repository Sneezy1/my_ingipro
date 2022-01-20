import 'app/libs/commands';
import {config as wdioConfig} from 'wdio.conf';
import allure from '@wdio/allure-reporter';
import LoginSteps from 'app/libs/steps/login.steps';
import LoginChecks from 'app/libs/expects/login.expect';
import * as consts from 'app/consts';
import TestData from 'app/libs/testData';
import IngiproBackendClient from 'app/libs/handles/ingiproBackendClient';

let UNIQ_LOGIN;
let UNIQ_OLD_LOGIN;
let USER_ID;
let backend = new IngiproBackendClient();
let registration_password = 'password';
let loginSteps = new LoginSteps('0');
let loginChecks = new LoginChecks();

describe('Login :', () => {

    describe('Authorization tests', () => {
        allure.addFeature('Login Feature');

        beforeEach(() => {
            loginSteps.login(wdioConfig.users.homerSimpson);
        }, 3);

        it('should open url "/#/node" after click on url in auth page', () => {
            allure.addTestId('6278');
            allure.addSeverity('blocker');
            loginChecks.expectUrlAfterLogin('node');
        });

        it('Page charset equals utf-8', () => {
            allure.addTestId('13568');
            allure.addSeverity('medium');
            loginChecks.expectPageCharset('utf-8');
        });
    });

    describe('Authorization page tests', () => {
        allure.addFeature('Login Feature');

        beforeEach(() => {
            browser.deleteAllCookies();
            browser.openUrl(consts.AUTH_URL);
        }, 3);

        it('should check title on login page', () => {
            allure.addTestId('13569');
            allure.addSeverity('minor');
            loginChecks.expectTitleOnLoginPage('Вход в систему Ingipro');
        });

        it('should check error message after input incorrect login', () => {
            allure.addTestId('13570');
            allure.addSeverity('medium');
            loginSteps.submitUserData({
                login: consts.INCORRECT_LOGIN,
                password: wdioConfig.users.homerSimpson.password,
            });
            loginChecks.expectErrorInLoginForm('Неверно указан Логин или Пароль');
        });

        it('should check error message after input incorrect password', () => {
            allure.addTestId('13570');
            allure.addSeverity('medium');
            loginSteps.submitUserData({login: wdioConfig.users.homerSimpson.login, password: consts.INCORRECT_PASS});
            loginChecks.expectErrorInLoginForm('Неверно указан Логин или Пароль');
        });

        it('should check placeholder on login page for email input', () => {
            allure.addTestId('8775');
            allure.addSeverity('minor');
            loginChecks.expectEmailPlaceholderOnLoginPage('Email');
        });

        it('should check placeholder on login page for password input', () => {
            allure.addTestId('8776');
            allure.addSeverity('minor');
            loginChecks.expectPasswordPlaceholderOnLoginPage('Пароль');
        });

        it('Submit button should be not clickable if login input is empty', () => {
            allure.addTestId('8799');
            allure.addSeverity('medium');
            loginSteps
                .enterUserPassword(consts.INCORRECT_PASS)
                .clearEmailInput();
            loginChecks.expectSubmitBtnIsDisabled();
        });

        it('Submit button should be clickable after input login and password', () => {
            allure.addTestId('8800');
            allure.addSeverity('blocker');
            loginSteps
                .enterUserEmail(wdioConfig.users.homerSimpson.login)
                .enterUserPassword(wdioConfig.users.homerSimpson.password);
            loginChecks.expectSubmitBtnIsNotDisabled();
        });

        it('Cookies should be empty after clicking enter if user is not exist', () => {
            allure.addTestId('8953');
            allure.addSeverity('critical');
            loginSteps
                .enterUserEmail(consts.INCORRECT_LOGIN)
                .enterUserPassword(consts.INCORRECT_PASS)
                .clickSubmitBtn();
            loginChecks.expectTokenIsEmpty();
        });

        it('Current page should not change after clicking enter if user is not exist', () => {
            allure.addTestId('8953');
            allure.addSeverity('critical');
            loginSteps
                .enterUserEmail(consts.INCORRECT_LOGIN)
                .enterUserPassword(consts.INCORRECT_PASS)
                .clickSubmitBtn();
            loginChecks.expectTitleOnLoginPage('Вход в систему Ingipro');
        });

        it(`Should open #node when opening ${wdioConfig.ecosystemUrl} if user is logged in`, () => {
            allure.addTestId('8796');
            allure.addSeverity('critical');
            loginSteps
                .login(wdioConfig.users.homerSimpson);
            browser.openUrl(consts.BASE_URL);
            loginChecks.expectUrlAfterLogin('node');
        });

        it('Submit button should be disabled if password input is empty', () => {
            allure.addTestId('8799');
            allure.addSeverity('medium');
            loginSteps
                .enterUserEmail(consts.INCORRECT_LOGIN)
                .clearPasswordInput();
            loginChecks.expectSubmitBtnIsDisabled();
        });

        it('should login, after pressing enter if all fields are fulfilled', () => {
            allure.addTestId('8955');
            allure.addSeverity('critical');
            loginSteps.submitUserData(wdioConfig.users.homerSimpson);
            browser.keys('Enter');
            loginChecks.expectUrlAfterLogin('node');
        });

        it('should not login, after pressing enter if all fields are not filfilled', () => {
            allure.addTestId('10532');
            allure.addSeverity('medium');
            loginSteps
                .enterUserEmail(consts.INCORRECT_LOGIN)
                .clearPasswordInput();
            browser.keys('Enter');
            loginChecks.expectUrlAfterLogin('signin');
        });

        it('Should write "  " (spaces) in email input and check that submit btn isnt clickable', () => {
            allure.addTestId('10633');
            allure.addSeverity('medium');
            loginSteps
                .clearEmailInput()
                .clearPasswordInput()
                .enterUserEmail('  ')
                .enterUserPassword(consts.INCORRECT_PASS);
            loginChecks
                .expectSubmitBtnIsDisabled();
        });
    });

    describe('Login after changing profile data', () => {

        beforeEach(async () => {
            await backend.auth(wdioConfig.users.admin);
            UNIQ_OLD_LOGIN = TestData.createUniqLogin();
            await backend.createUser(UNIQ_OLD_LOGIN, 60000, 'a', 'b', 'c', '88005553535');
            USER_ID = backend.userId;
            let user = {login: UNIQ_OLD_LOGIN, password: '', key: backend.userKey};
            await backend.editUserPassword(user, registration_password, backend.userKey);
            user.password = registration_password;
            UNIQ_LOGIN = TestData.createUniqLogin();
            await backend.editUserLogin(user, UNIQ_LOGIN);
        }, 3);

        beforeEach(() => {
            browser.openUrl(consts.AUTH_URL);
        }, 3);

        it('should сheck that user can`t log in with old email', () => {
            allure.addTestId('10630');
            allure.addSeverity('critical');
            let newUser = {login: UNIQ_OLD_LOGIN, password: registration_password};
            loginSteps
                .enterUserEmail(newUser.login)
                .enterUserPassword(newUser.password)
                .clickSubmitBtn();
            loginChecks
                .expectErrorInLoginForm('Неверно указан Логин или Пароль');
        });

        it('should сheck that user can log in with new email', () => {
            allure.addTestId('10631');
            allure.addSeverity('critical');
            let newUser = {login: UNIQ_LOGIN, password: registration_password};
            loginSteps
                .login(newUser);
            loginChecks.expectUrlAfterLogin('node');
        });

        afterEach(async () => {
            await backend.editUserBlock(wdioConfig.users.admin, USER_ID, true);
            browser.deleteCookie('token');
        }, 3);

    });
})
;
