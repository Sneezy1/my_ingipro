import 'app/libs/commands';
import allure from '@wdio/allure-reporter';
import LoginSteps from 'app/libs/steps/login.steps';
import LoginChecks from 'app/libs/expects/login.expect';
import NavigatorChecks from 'app/libs/expects/navigator.expect';
import * as consts from 'app/consts';
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
let restore_password = 'passw0rd';
let correctTestEmail = 'ingiprotest+homer@gmail.com';

describe('Restore page :', () => {

    describe('Visual tests', () => {

        before(() => {
            loginSteps.openRestorePage();
        }, 3);

        it('Check title text on restore page', () => {
            allure.addSeverity('normal');
            allure.addTestId('8781');
            loginChecks
                .expectTitleOnRestorePage('Восстановление доступа к Ingipro');
        });

        it('Check subtitle text on restore page', () => {
            allure.addSeverity('minor');
            allure.addTestId('8781');
            loginChecks
                .expectSubtitleOnRestorePage('Укажите Email, для которого вы хотите восстановить пароль');
        });

        it('Check email input field placeholder on restore page', () => {
            allure.addSeverity('minor');
            loginChecks
                .expectPlaceholderInEmailInputOnRestorePage('Email');
        });

        it('Check color of submit button if e-mail input is empty', () => {
            allure.addTestId('8783');
            allure.addSeverity('normal');
            loginChecks
                .expectSubmitBtnColor('#e8e8e8');
        });

    });

    describe('Errors', () => {

        before(() => {
            browser.refresh();
            loginSteps.openRestorePage();
        }, 3);

        it('Check error text, when incorrect email was submitted', () => {
            allure.addSeverity('normal');
            allure.addTestId('8785');
            loginSteps
                .enterUserEmailOnRestorePage(consts.INCORRECT_LOGIN)
                .clickNextBtn();
            loginChecks
                .expectErrorOnRestorePage('Неверно указан Email');
        });

        it('Check red contour around email input field, when incorrect email was sent', () => {
            allure.addSeverity('minor');
            allure.addTestId('8785');
            loginSteps
                .enterUserEmailOnRestorePage(consts.INCORRECT_LOGIN)
                .clickNextBtn();
            loginChecks
                .expectContourOfEmailOnRestorePageIsDisplayed();
        });
    });

    describe('Functional tests w/o login', () => {

        before(() => {
            loginSteps.openRestorePage();
            browser.refresh();
        }, 3);

        it('Check that e-mail input became active, after pressing "Tab" several times', () => {
            allure.addTestId('8958');
            allure.addSeverity('normal');
            loginSteps
                .setInputElementFocused();
            loginChecks
                .expectInputIsFocused();
        });

        it('Check that next button should be disabled if e-mail input is empty', () => {
            allure.addTestId('8783');
            allure.addSeverity('normal');
            loginChecks
                .expectNextBtnIsDisabled();
        });

        it('Check that next button should be enabled after email was inputted', () => {
            allure.addTestId('8802');
            allure.addSeverity('critical');
            loginSteps
                .enterUserEmailOnRestorePage(correctTestEmail);
            loginChecks
                .expectNextBtnIsNotDisabled();
        });
    });

    describe('Functional tests', () => {

        it('Check that "/#/node" opens, if we are trying to open "/#/restore" when we are logged in', () => {
            allure.addTestId('8960');
            allure.addSeverity('normal');
            loginSteps
                .login(wdioConfig.users.margeSimpson);
            browser.openUrl(consts.RESTORE_URL);
            navigatorChecks
                .expectTableIsExist();
        });

        it('Check that restore page opens, by clicking "restore password" button on login page', () => {
            allure.addTestId('8780');
            allure.addSeverity('critical');
            browser.openUrl(consts.AUTH_URL);
            loginSteps
                .clickRestoreBtn();
            browser
                .expectUrl(consts.RESTORE_URL);

        });

        afterEach(() => {
            loginSteps.logOut();
        }, 3);
    });

    describe('Functional tests using Backend (login with key)', () => {

        beforeEach(async () => {
            UNIQ_LOGIN = TestData.createUniqLogin();
            await backend.auth(wdioConfig.users.admin);
            await backend.createUser(UNIQ_LOGIN, 60000, 'a', 'b', 'c', '88005553535');
            USER_ID = backend.userId;
        }, 3);

        it('Check that Should open /#/node when opening someone else`s recovery link if user is logged in', () => {
            allure.addTestId('10536');
            allure.addSeverity('normal');
            loginSteps.login(wdioConfig.users.margeSimpson);
            browser.openUrl(consts.RESTORE_URL);
            browser.expectUrl(`${consts.BASE_URL}#/node`);
        }, 3);

        it('Check that recovery link doesnt end up if it was opened for the second time', () => {
            allure.addTestId('10634');
            allure.addSeverity('critical');
            loginSteps
                .openRestorePage(backend.userKey);
            loginChecks
                .expectRestorePageOpen();
        });

        afterEach(async () => {
            await backend.editUserBlock(wdioConfig.users.admin, USER_ID, true);
        }, 3);

        afterEach(() => {
            loginSteps.logOut();
        }, 3);
    });

    describe('Functional tests using Backend with expired links', () => {

        beforeEach(async () => {
            UNIQ_LOGIN = TestData.createUniqLogin();
            await backend.auth(wdioConfig.users.admin);
            await backend.createUser(UNIQ_LOGIN, '', 'expired', 'link', 'check', '88005553535');
            USER_ID = backend.userId;
        }, 3);

        beforeEach(() => {
            loginSteps.openRestorePage(backend.userKey);
        }, 3);

        it('Check that parked page is being displayed if key expiration time have passed', () => {
            allure.addTestId('10534');
            allure.addSeverity('critical');
            loginChecks.expectParkedPageTitle();
        }, 2);

        it('Check that "/#/restore" opens when clicking try again button on parked page', () => {
            allure.addTestId('10626');
            allure.addSeverity('critical');
            loginSteps
                .clickRetryBtnOnParkedPage();
            browser
                .expectUrl(consts.RESTORE_URL);
        }, 2);

        afterEach(async () => {
            await backend.editUserBlock(wdioConfig.users.admin, USER_ID, true);
        }, 3);

        afterEach(() => {
            loginSteps.logOut();
        }, 3);

    });

    describe('Functional tests using Backend (login with password)', () => {

        beforeEach(async () => {
            UNIQ_LOGIN = await TestData.createUniqLogin();
            await backend.auth(wdioConfig.users.admin);
            await backend.createUser(UNIQ_LOGIN, 60000, 'a', 'b', 'c', '88005553535');
            USER_ID = await backend.userId;
        }, 3);

        beforeEach(() => {
            loginSteps
                .openRestorePage(backend.userKey)
                .enterPasswordOnRestorePage(restore_password)
                .clickSubmitBtnOnRestorePage();
        }, 3);

        it('Check that parked page is being displayed if recovery link was used', () => {
            allure.addTestId('10729');
            allure.addSeverity('critical');
            loginSteps
                .clickEnterBtnOnRestorePage()
                .logOut()
                .openRestorePage(backend.userKey);
            loginChecks.expectParkedPageTitle();
        });

        it('Check that unregistered user will register when recovering password', () => {
            allure.addTestId('10538');
            allure.addSeverity('critical');
            loginSteps
                .clickEnterBtnOnRestorePage();
            navigatorChecks
                .expectTableIsExist();
        });

        it('Check displayed title after changing password', () => {
            allure.addTestId('10640');
            allure.addSeverity('normal');
            loginChecks
                .expectRestorePageChangeTitle('Пароль успешно изменен');
        });

        it('Check displayed subtitle after changing password', () => {
            allure.addTestId('10640');
            allure.addSeverity('normal');
            loginChecks
                .expectRestorePageChangeSubtitle('Чтобы продолжить работу, вам необходимо войти в экосистему');
        });

        it('Check redirect to /#/node after recovering password and clicking on submit button', () => {
            allure.addTestId('10730');
            allure.addSeverity('normal');
            loginSteps
                .clickEnterBtnOnRestorePage();
            navigatorChecks
                .expectTableIsExist();
        });

        it('Check that cookie sets after recovering password', () => {
            allure.addTestId('10765');
            allure.addSeverity('critical');
            loginSteps
                .clickEnterBtnOnRestorePage();
            loginChecks
                .expectTokenIsNotEmpty();
        });

        afterEach(async () => {
            await backend.editUserBlock(wdioConfig.users.admin, USER_ID,true);
        }, 3);

        afterEach(() => {
            loginSteps.logOut();
        }, 3);
    });

    describe('Functional tests using Backend with valid restore link and logging with it', () => {

        beforeEach(async () => {
            await backend.auth(wdioConfig.users.admin);
            UNIQ_LOGIN = TestData.createUniqLogin();
            await backend.createUser(UNIQ_LOGIN, 60000, 'a', 'b', 'c', '88005553535');
            USER_ID = backend.userId;
            let user = { login: UNIQ_LOGIN, password: '', world: 'test', key: backend.userKey};
            await backend.editUserPassword(user , registration_password, backend.userKey);
            user.password = registration_password;
            await backend.editUserPassword(user, restore_password);
            user.password = restore_password;
        }, 3);

        it('Check sign in after recovering password', () => {
            allure.addTestId('10635');
            allure.addSeverity('critical');
            let newUser = {login: UNIQ_LOGIN, password: restore_password, world: 'test'};
            loginSteps
                .login(newUser);
            browser
                .expectUrl(`${consts.BASE_URL }#/node`);

        });

        it('Check that u cant sign in, with old password, after recovering it', () => {
            allure.addTestId('10636');
            allure.addSeverity('critical');
            let newUser = {login: UNIQ_LOGIN, password: registration_password, world: 'test'};
            browser.openUrl(consts.AUTH_URL);
            loginSteps
                .submitUserData(newUser);
            loginChecks
                .expectErrorInLoginForm('Неверно указан Логин или Пароль');
        });

        afterEach(async () => {
            await backend.editUserBlock(wdioConfig.users.admin, USER_ID,true);
            browser.deleteCookie('token');
        }, 3);
    });

    describe('Login test (with backend)', () => {

        before(async () => {
            UNIQ_LOGIN = TestData.createUniqLogin();
            await backend.auth(wdioConfig.users.admin);
            await backend.createUser(UNIQ_LOGIN, 60000, 'a', 'b', 'c', '88005553535');
            USER_ID = backend.userId;
            let user = {login: UNIQ_LOGIN, password: registration_password, world: 'test', key: backend.userKey};
            await backend.editUserPassword(user, registration_password, backend.userKey);
        }, 3);

        it('should check that user can log in after registration with backend', () => {
            allure.addTestId('8969');
            allure.addSeverity('blocker');
            let user = {login: UNIQ_LOGIN, password: registration_password, world: 'test'};
            loginSteps.login(user);
            navigatorChecks.expectTableIsExist();
        });

        after(async () => {
            await backend.editUserBlock(wdioConfig.users.admin, USER_ID, true);
            browser.deleteAllCookies();
        }, 3);
    });
});
