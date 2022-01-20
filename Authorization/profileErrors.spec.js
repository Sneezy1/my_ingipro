import 'app/libs/commands';
import {config as wdioConfig} from 'wdio.conf';
import LoginSteps from 'app/libs/steps/login.steps';
import NavigatorSteps from 'app/libs/steps/navigator.steps';
import NavigatorChecks from 'app/libs/expects/navigator.expect';
import ProfileSteps from 'app/libs/steps/profile.steps';
import ProfileChecks from 'app/libs/expects/profile.expect';
import * as consts from 'app/consts';
import allure from '@wdio/allure-reporter';
import IngiproBackendClient from 'app/libs/handles/ingiproBackendClient';
import TestData from 'app/libs/testData';

let backend = new IngiproBackendClient();
let tableSteps = new NavigatorSteps('0');
let navigatorChecks = new NavigatorChecks();
let profileSteps = new ProfileSteps('0');
let profileChecks = new ProfileChecks();
let loginSteps = new LoginSteps();
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

let passSuccessfullyChanged = 'Пароль успешно изменен';

describe('Profile page', () => {

    describe('Profile page opening tests', () => {

        beforeEach(() => {
            loginSteps.login(wdioConfig.users.homerSimpson);
        }, 3);

        it(`should open profile page following URL ${consts.PROFILE_URL}`, () => {
            allure.addTestId('8709');
            allure.addSeverity('blocker');
            profileSteps.openProfileURL();
            profileChecks
                .expectProfilePageIsOpened();
        });

        it('should open profile page after click on profile icon', () => {
            allure.addTestId('8708');
            allure.addSeverity('blocker');
            tableSteps.clickOnProfileIcon();
            profileChecks
                .expectProfilePageIsOpened();
        });
    });

    describe('Common tests', () => {

        before(() => {
            loginSteps.login(wdioConfig.users.homerSimpson);
            tableSteps.clickOnProfileIcon();
            profileSteps.clickOnProfileEditButton();
        }, 3);

        it('should check user management button is absent', () => {
            allure.addTestId('8797');
            allure.addSeverity('blocker');
            profileChecks
                .expectUserManagementButtonNotExist();
        });

        it('should check default active tab is personal information tab', () => {
            allure.addTestId('8710');
            allure.addSeverity('minor');
            profileChecks
                .expectPersonalInformationActiveTab();
        });

        PERSONAL_INFORMATION_TAB_LABELS.all.forEach((label) => {
            it(`should check ${label} input label after click on edit profile button`, () => {
                allure.addTestId('8712');
                allure.addSeverity('medium');
                profileChecks
                    .expectInputLabel(label);
            });
        });

        it('should check patronymic and phone number are not required fields', () => {
            allure.addTestId('8715');
            allure.addSeverity('critical');
            profileSteps
                .enterPersonalData(PERSONAL_INFORMATION_TAB_LABELS, NEW_USER_PERSONAL_DATA);
            profileChecks
                .expectSaveButtonNotDisabled();
        });
    });

    describe('Edit user data tests', () => {

        beforeEach(async () => {
            NEW_USER_PERSONAL_DATA.email = TestData.createUniqLogin();
            NEW_USER_PERSONAL_DATA.login = NEW_USER_PERSONAL_DATA.email;
            NEW_USER_PERSONAL_DATA.newEmail = `new${NEW_USER_PERSONAL_DATA.email}`;
            await backend.auth(wdioConfig.users.admin);
            await backend.createUser(NEW_USER_PERSONAL_DATA.login, '', NEW_USER_PERSONAL_DATA.firstName, NEW_USER_PERSONAL_DATA.lastName, '', '', NEW_USER_PERSONAL_DATA.password);
            NEW_USER_PERSONAL_DATA.id = backend.userId;
        });

        beforeEach(() => {
            loginSteps.login(NEW_USER_PERSONAL_DATA);
            profileSteps.openProfileURL();
        }, 3);

        describe('Error tests', () => {

            let emailAlreadyExist = [
                {
                    expect: () => {
                        profileChecks.expectErrorMessage(ERROR_MESSAGES.emailAlreadyExist);
                    }, text: 'error message',
                },
                {
                    expect: () => {
                        profileChecks.expectInputError(PERSONAL_INFORMATION_TAB_LABELS.email);
                    }, text: 'email input error',
                },
            ];

            emailAlreadyExist.forEach((cur) => {
                it(`should check ${cur.text} email already exist error`, () => {
                    allure.addTestId('8792');
                    allure.addSeverity('medium');
                    profileSteps
                        .clickOnProfileEditButton()
                        .enterTextInInput(PERSONAL_INFORMATION_TAB_LABELS.email, wdioConfig.users.margeSimpson.login)
                        .enterTextInInput(PERSONAL_INFORMATION_TAB_LABELS.password, NEW_USER_PERSONAL_DATA.password)
                        .clickOnSaveButton();
                    cur.expect();
                });
            });

            it('should check email already exist error is absent', () => {
                allure.addTestId('12017');
                allure.addSeverity('medium');
                profileSteps
                    .clickOnProfileEditButton()
                    .enterTextInInput(PERSONAL_INFORMATION_TAB_LABELS.email, wdioConfig.users.margeSimpson.login)
                    .enterTextInInput(PERSONAL_INFORMATION_TAB_LABELS.password, NEW_USER_PERSONAL_DATA.password)
                    .clickOnSaveButton();
                profileChecks
                    .expectInputError(PERSONAL_INFORMATION_TAB_LABELS.email);
                profileSteps
                    .enterTextInInput(PERSONAL_INFORMATION_TAB_LABELS.email, NEW_USER_PERSONAL_DATA.email);
                profileChecks
                    .expectInputError(PERSONAL_INFORMATION_TAB_LABELS.email, consts.NOT_EXIST);
            });

            let wrongPass = [
                {
                    expect: () => {
                        profileChecks.expectErrorMessage(ERROR_MESSAGES.wrongPassword);
                    }, text: 'error message',
                },
                {
                    expect: () => {
                        profileChecks.expectInputError(PERSONAL_INFORMATION_TAB_LABELS.password);
                    }, text: 'password input error',
                },
            ];

            wrongPass.forEach((cur) => {
                it(`should check ${cur.text} wrong password error`, () => {
                    allure.addTestId('10558');
                    allure.addSeverity('medium');
                    profileSteps
                        .clickOnProfileEditButton()
                        .enterTextInInput(PERSONAL_INFORMATION_TAB_LABELS.email, NEW_USER_PERSONAL_DATA.newEmail)
                        .enterTextInInput(PERSONAL_INFORMATION_TAB_LABELS.password, NEW_USER_PERSONAL_DATA.newPassword)
                        .clickOnSaveButton();
                    cur.expect();
                });
            });

            it('should check wrong password error is absent', () => {
                allure.addTestId('12018');
                allure.addSeverity('medium');
                profileSteps
                    .clickOnProfileEditButton()
                    .enterTextInInput(PERSONAL_INFORMATION_TAB_LABELS.email, NEW_USER_PERSONAL_DATA.newEmail)
                    .enterTextInInput(PERSONAL_INFORMATION_TAB_LABELS.password, NEW_USER_PERSONAL_DATA.newPassword)
                    .clickOnSaveButton();
                profileChecks
                    .expectInputError(PERSONAL_INFORMATION_TAB_LABELS.password);
                profileSteps
                    .enterTextInInput(PERSONAL_INFORMATION_TAB_LABELS.password, NEW_USER_PERSONAL_DATA.password);
                profileChecks
                    .expectInputError(PERSONAL_INFORMATION_TAB_LABELS.password, consts.NOT_EXIST);
            });

            let wrongCurPas = [
                {
                    expect: () => {
                        profileChecks.expectErrorMessage(ERROR_MESSAGES.wrongCurrentPassword);
                    }, text: 'error message',
                },
                {
                    expect: () => {
                        profileChecks.expectInputError(CHANGE_PASSWORD_TAB_LABELS.currentPass);
                    }, text: 'current password input error',
                },
            ];

            wrongCurPas.forEach((cur) => {
                it(`should check ${cur.text} in wrong current password error`, () => {
                    allure.addTestId('8793');
                    allure.addSeverity('blocker');
                    profileSteps
                        .clickOnChangePasswordTab()
                        .enterTextInInput(CHANGE_PASSWORD_TAB_LABELS.currentPass, NEW_USER_PERSONAL_DATA.newPassword)
                        .enterTextInInput(CHANGE_PASSWORD_TAB_LABELS.newPass, NEW_USER_PERSONAL_DATA.newPassword)
                        .enterTextInInput(CHANGE_PASSWORD_TAB_LABELS.repeatNewPass, NEW_USER_PERSONAL_DATA.newPassword)
                        .clickOnSaveButton();
                    cur.expect();
                });
            });

            it('should check wrong current password error is absent', () => {
                allure.addTestId('12019');
                allure.addSeverity('medium');
                profileSteps
                    .clickOnChangePasswordTab()
                    .enterTextInInput(CHANGE_PASSWORD_TAB_LABELS.currentPass, NEW_USER_PERSONAL_DATA.newPassword)
                    .enterTextInInput(CHANGE_PASSWORD_TAB_LABELS.newPass, NEW_USER_PERSONAL_DATA.newPassword)
                    .enterTextInInput(CHANGE_PASSWORD_TAB_LABELS.repeatNewPass, NEW_USER_PERSONAL_DATA.newPassword)
                    .clickOnSaveButton();
                profileChecks
                    .expectInputError(CHANGE_PASSWORD_TAB_LABELS.currentPass);
                profileSteps
                    .enterTextInInput(CHANGE_PASSWORD_TAB_LABELS.currentPass, NEW_USER_PERSONAL_DATA.password);
                profileChecks
                    .expectInputError(CHANGE_PASSWORD_TAB_LABELS.currentPass, consts.NOT_EXIST);
            });

            let passDontMatch = [
                {
                    expect: () => {
                        profileChecks.expectErrorMessage(ERROR_MESSAGES.passwordsDontMatch);
                    }, text: 'error message',
                },
                {
                    expect: () => {
                        profileChecks.expectInputError(CHANGE_PASSWORD_TAB_LABELS.newPass);
                    }, text: 'new password input error',
                },
                {
                    expect: () => {
                        profileChecks.expectInputError(CHANGE_PASSWORD_TAB_LABELS.repeatNewPass);
                    }, text: 'repeat new password input error',
                },
            ];

            passDontMatch.forEach((cur) => {
                it(`should check ${cur.text} in 'passwords do not match' error`, () => {
                    allure.addTestId('8794');
                    allure.addSeverity('critical');
                    profileSteps
                        .clickOnChangePasswordTab()
                        .enterTextInInput(CHANGE_PASSWORD_TAB_LABELS.currentPass, NEW_USER_PERSONAL_DATA.password)
                        .enterTextInInput(CHANGE_PASSWORD_TAB_LABELS.newPass, NEW_USER_PERSONAL_DATA.newPassword)
                        .enterTextInInput(CHANGE_PASSWORD_TAB_LABELS.repeatNewPass, NEW_USER_PERSONAL_DATA.password);
                    cur.expect();
                });
            });

            let passDontMatchInputs = [
                CHANGE_PASSWORD_TAB_LABELS.newPass,
                CHANGE_PASSWORD_TAB_LABELS.repeatNewPass,
            ];

            passDontMatchInputs.forEach((input) => {
                it.skip('should check passwords \'do not match error\' is absent', () => {
                    allure.addTestId('10550');
                    allure.addSeverity('medium');
                    allure.addIssue('TESTING-309');
                    profileSteps
                        .clickOnChangePasswordTab()
                        .enterTextInInput(CHANGE_PASSWORD_TAB_LABELS.currentPass, NEW_USER_PERSONAL_DATA.password)
                        .enterTextInInput(CHANGE_PASSWORD_TAB_LABELS.newPass, NEW_USER_PERSONAL_DATA.newPassword)
                        .enterTextInInput(CHANGE_PASSWORD_TAB_LABELS.repeatNewPass, NEW_USER_PERSONAL_DATA.password);
                    profileChecks
                        .expectInputError(input);
                    profileSteps
                        .enterTextInInput(input, NEW_USER_PERSONAL_DATA.newPassword);
                    profileChecks
                        .expectInputError(input, consts.NOT_EXIST);
                });
            });
        });

        describe('Edit profile data tests', () => {

            beforeEach(() => {
                profileSteps.clickOnProfileEditButton();
            });

            let editingInputs = [
                {input: PERSONAL_INFORMATION_TAB_LABELS.firstName, text: NEW_USER_PERSONAL_DATA.newFirstName},
                {input: PERSONAL_INFORMATION_TAB_LABELS.lastName, text: NEW_USER_PERSONAL_DATA.newLastName},
                {input: PERSONAL_INFORMATION_TAB_LABELS.patronymic, text: NEW_USER_PERSONAL_DATA.newPatronymic},
                {input: PERSONAL_INFORMATION_TAB_LABELS.phoneNumber, text: NEW_USER_PERSONAL_DATA.newPhoneNumber},
            ];

            editingInputs.forEach((current) => {
                it(`should check new ${current.input} is saved`, () => {
                    allure.addTestId('8713');
                    allure.addSeverity('blocker');
                    profileSteps
                        .enterTextInInput(current.input, current.text)
                        .clickOnSaveButton()
                        .clickOnProfileEditButton();
                    profileChecks
                        .expectTextInInput(current.input, current.text);
                });
            });

            it('should check new email is saved', () => {
                allure.addTestId('9607');
                allure.addSeverity('blocker');
                profileSteps
                    .enterTextInInput(PERSONAL_INFORMATION_TAB_LABELS.email, NEW_USER_PERSONAL_DATA.newEmail)
                    .enterTextInInput(PERSONAL_INFORMATION_TAB_LABELS.password, NEW_USER_PERSONAL_DATA.password)
                    .clickOnSaveButton()
                    .clickOnProfileEditButton();
                profileChecks
                    .expectTextInInput(PERSONAL_INFORMATION_TAB_LABELS.email, NEW_USER_PERSONAL_DATA.newEmail);
            });
        });

        describe('Change password tests', () => {

            beforeEach(() => {
                profileSteps
                    .clickOnChangePasswordTab()
                    .enterTextInInput(CHANGE_PASSWORD_TAB_LABELS.currentPass, NEW_USER_PERSONAL_DATA.password)
                    .enterTextInInput(CHANGE_PASSWORD_TAB_LABELS.newPass, NEW_USER_PERSONAL_DATA.newPassword)
                    .enterTextInInput(CHANGE_PASSWORD_TAB_LABELS.repeatNewPass, NEW_USER_PERSONAL_DATA.newPassword)
                    .clickOnSaveButton();
            });

            it('should check new password is saved alert message', () => {
                allure.addTestId('12025');
                allure.addSeverity('critical');
                navigatorChecks
                    .expectAlertMessage(passSuccessfullyChanged);
            });

            it('should check new password is saved', () => {
                allure.addTestId('10548');
                allure.addSeverity('blocker');
                tableSteps.closeAlert();
                profileSteps.clickOnLogOutButton();
                loginSteps.login({login: NEW_USER_PERSONAL_DATA.email, password: NEW_USER_PERSONAL_DATA.newPassword});
                navigatorChecks.expectTableIsExist();
            });
        });

        afterEach(async () => {
            await backend.editUserBlock(wdioConfig.users.admin, NEW_USER_PERSONAL_DATA.id, true);
        });
    });
});
