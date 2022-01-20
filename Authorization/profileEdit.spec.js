import 'app/libs/commands';
import {config as wdioConfig} from 'wdio.conf';
import LoginSteps from 'app/libs/steps/login.steps';
import NavigatorSteps from 'app/libs/steps/navigator.steps';
import ProfileSteps from 'app/libs/steps/profile.steps';
import ProfileChecks from 'app/libs/expects/profile.expect';
import LoginChecks from 'app/libs/expects/login.expect';
import * as consts from 'app/consts';
import allure from '@wdio/allure-reporter';
import IngiproBackendClient from 'app/libs/handles/ingiproBackendClient';
import TestData from 'app/libs/testData';

let backend = new IngiproBackendClient();
let tableSteps = new NavigatorSteps('0');
let profileSteps = new ProfileSteps('0');
let profileChecks = new ProfileChecks();
let loginSteps = new LoginSteps();
let loginChecks = new LoginChecks();
let newPassword = '12345';
let incorrectNewPassword = '54321';
let UNIQ_LOGIN;
let USER_ID;
let registration_password = 'password';
let user = {login: '', password: registration_password, key: ''};
let NEW_USER_PERSONAL_DATA = {
    firstName: 'Имя',
    lastName: 'Фамилия',
    patronymic: '',
    phoneNumber: '',
    email: 'ingiproautotest+newuseremail@gmail.com',
    password: 'password',
    newPassword: 'new password',
    newFirstName: 'новое имя',
    newLastName: 'новая фамилия',
    newPatronymic: 'отчество',
    newPhoneNumber: '88005553535',
    keyExpiration: '',
    world: 'test',
};

let PERSONAL_INFORMATION_TAB_LABELS = {
    all: [
        'Имя',
        'Фамилия',
        'Отчество',
        'Телефон',
        'Email'],
    firstName: 'Имя',
    lastName: 'Фамилия',
    patronymic: 'Отчество',
    phoneNumber: 'Телефон',
    email: 'Email',
    password: 'Пароль',
};

let ERROR_MESSAGES = {
    emailAlreadyExist: 'Email уже используется',
    wrongPassword: 'Введен неверный пароль',
    wrongCurrentPassword: 'Введен неверный текущий пароль',
    passwordsDontMatch: 'Пароли не совпадают. Попробуйте еще раз',
};

let CHANGE_PASSWORD_TAB_LABELS = {
    all: [
        'Текущий пароль',
        'Новый пароль',
        'Повторите пароль еще раз'],
    currentPass: 'Текущий пароль',
    newPass: 'Новый пароль',
    repeatNewPass: 'Повторите пароль еще раз',
};

describe('Profile page :', () => {

    describe('Logout tests', () => {

        beforeEach(()=> {
            loginSteps.login(wdioConfig.users.homerSimpson);
            tableSteps.clickOnProfileIcon();
        }, 3);

        it('should check redirect after click logout button', () => {
            allure.addTestId('8719');
            allure.addSeverity('blocker');
            profileSteps
                .clickOnLogOutButton();
            profileChecks
                .expectRedirectToSiteUrl(wdioConfig.siteUrl);
        });

        it.skip('should check cleared token cookie after exit from account', () => {
            allure.addTestId('8798');
            allure.addSeverity('blocker');
            allure.addIssue('TESTING-309');
            profileSteps
                .clickOnLogOutButton();
            profileChecks
                .expectClearedTokenCookie();
        });

        describe('Required personal data fields tests', ()=>{

            beforeEach(() => {
                profileSteps.clickOnProfileEditButton();
            });

            let requiredFields = [
                PERSONAL_INFORMATION_TAB_LABELS.firstName,
                PERSONAL_INFORMATION_TAB_LABELS.lastName,
                PERSONAL_INFORMATION_TAB_LABELS.email,
                PERSONAL_INFORMATION_TAB_LABELS.password,
            ];

            requiredFields.forEach((requiredField) => {
                it(`should check ${requiredField} is required field to fill`, () => {
                    allure.addTestId('8714');
                    allure.addSeverity('medium');
                    profileSteps
                        .enterPersonalData(PERSONAL_INFORMATION_TAB_LABELS, NEW_USER_PERSONAL_DATA)
                        .enterTextInInput(requiredField, '  ');
                    profileChecks
                        .expectSaveButtonDisabled();
                });
            });

            let errorInputs = [
                PERSONAL_INFORMATION_TAB_LABELS.firstName,
                PERSONAL_INFORMATION_TAB_LABELS.lastName,
                PERSONAL_INFORMATION_TAB_LABELS.email,
            ];

            errorInputs.forEach((input) => {
                it(`should check ${input} red input field filled with spaces`, () => {
                    allure.addTestId('10561');
                    allure.addSeverity('medium');
                    profileSteps
                        .enterTextInInput(input, '  ');
                    profileChecks
                        .expectInputError(input);
                });
            });

            errorInputs.forEach((input) => {
                it(`should check ${input} input error is absent`, () => {
                    allure.addTestId('10540');
                    allure.addSeverity('minor');
                    profileSteps
                        .enterTextInInput(input, '  ');
                    profileChecks
                        .expectInputError(input);
                    profileSteps
                        .enterTextInInput(input, NEW_USER_PERSONAL_DATA.email);
                    profileChecks
                        .expectInputError(input, consts.NOT_EXIST);
                });
            });

        });

        it('should check change password tab opens after click on it', () => {
            allure.addTestId('10547');
            allure.addSeverity('blocker');
            profileSteps
                .clickOnChangePasswordTab();
            profileChecks
                .expectChangePasswordActiveTab();
        });

        it('should check personal information tab opens after click on it', () => {
            allure.addTestId('10560');
            allure.addSeverity('critical');
            profileSteps
                .clickOnChangePasswordTab()
                .clickOnPersonalInformationTab();
            profileChecks
                .expectPersonalInformationActiveTab();
        });

        it('should check personal information tab labels are exist', () => {
            allure.addTestId('8717');
            allure.addSeverity('medium');
            profileChecks.expectLabels(PERSONAL_INFORMATION_TAB_LABELS.all);
        });

        it('should check change password tab labels are exist', () => {
            allure.addTestId('11938');
            allure.addSeverity('medium');
            profileSteps.clickOnChangePasswordTab();
            profileChecks.expectLabels(CHANGE_PASSWORD_TAB_LABELS.all);
        });
    });

    describe('Change password / email tests', () => {

        beforeEach(async () => {
            await backend.auth(wdioConfig.users.admin);
            UNIQ_LOGIN = TestData.createUniqLogin();
            await backend.createUser(UNIQ_LOGIN, 60000, 'a', 'b', 'c', '88005553535');
            user.login = UNIQ_LOGIN;
            user.key = backend.userKey;
            USER_ID = backend.userId;
            await backend.editUserPassword(user, registration_password, backend.userKey);

        }, 3);

        beforeEach(() => {
            loginSteps.login(user);
            profileSteps.openProfileURL();
        },3);

        it('should check that user can login after changing the email to a previously used one', () => {
            allure.addTestId('10554');
            allure.addSeverity('blocker');
            profileSteps
                .clickOnProfileEditButton()
                .enterTextInInput('Email', UNIQ_LOGIN)
                .enterTextInInput('Пароль', registration_password)
                .clickOnSaveButton();
            browser.deleteAllCookies();
            loginSteps.login(user);
            loginChecks.expectUrlAfterLogin('node');
        });

        it('should check that user can log in after an unsuccessful email change', () => {
            allure.addTestId('10554');
            allure.addSeverity('blocker');
            profileSteps
                .clickOnProfileEditButton()
                .clearProfileEmailInput()
                .enterTextInInput('Email', UNIQ_LOGIN)
                .enterTextInInput('Пароль', registration_password)
                .clickOnSaveButton();
            loginSteps.logOut();
            loginSteps.login(user);
        });

        it('should check that user can`t set new password if new password and repeat password don`t match', () => {
            allure.addTestId('10559');
            allure.addSeverity('blocker');
            profileSteps
                .clickOnChangePasswordTab()
                .enterTextInInput('Текущий пароль',registration_password)
                .enterTextInInput('Новый пароль', newPassword)
                .enterTextInInput('Повторите пароль еще раз', incorrectNewPassword)
                .clickOnSaveButton();
            profileChecks.expectErrorMessage(ERROR_MESSAGES.passwordsDontMatch);
        });

        it('should check that user can log in after an unsuccessful password change', () => {
            allure.addTestId('10559');
            allure.addSeverity('blocker');
            profileSteps
                .clickOnChangePasswordTab()
                .enterTextInInput('Текущий пароль', registration_password)
                .enterTextInInput('Новый пароль', newPassword)
                .enterTextInInput('Повторите пароль еще раз', incorrectNewPassword)
                .clickOnSaveButton();
            loginSteps.logOut();
            loginSteps.login(user);
        });

        it('should check that user can`t set new password if current password is invalid', () => {
            allure.addTestId('10553');
            allure.addSeverity('blocker');
            profileSteps
                .clickOnChangePasswordTab()
                .enterTextInInput('Текущий пароль',incorrectNewPassword)
                .enterTextInInput('Новый пароль', newPassword)
                .enterTextInInput('Повторите пароль еще раз', newPassword)
                .clickOnSaveButton();
            profileChecks.expectErrorMessage(ERROR_MESSAGES.wrongCurrentPassword);
        });

        it('should check that user can log in after an unsuccessful password change', () => {
            allure.addTestId('10553');
            allure.addSeverity('blocker');
            profileSteps
                .clickOnChangePasswordTab()
                .enterTextInInput('Текущий пароль', incorrectNewPassword)
                .enterTextInInput('Новый пароль', newPassword)
                .enterTextInInput('Повторите пароль еще раз', newPassword)
                .clickOnSaveButton();
            loginSteps.logOut();
            loginSteps.login(user);
        });

        afterEach(async () => {
            await backend.editUserBlock(wdioConfig.users.admin, USER_ID,true);
            browser.deleteAllCookies();
        }, 3);
    });

    describe('Admin user interface test profile1', () => {

        before(() => {
            loginSteps.login(wdioConfig.users.admin);
            profileSteps.openProfileURL();
        }, 3);

        it('should check that user management button is displayed', () => {
            allure.addTestId('8709');
            allure.addSeverity('blocker');
            profileChecks.expectUserManagementButtonIsDisplayed();
        });

        after(() => {
            browser.deleteAllCookies();
        }, 3);

    });
});
