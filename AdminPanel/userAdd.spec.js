import {config as wdioConfig} from 'wdio.conf';
import 'app/libs/commands';
import LoginSteps from 'app/libs/steps/login.steps';
import AdminPanelSteps from 'app/libs/steps/adminPanel.steps';
import TestData from 'app/libs/testData';
import allure from '@wdio/allure-reporter';
import AdminPanelChecks from 'app/libs/expects/adminPanel.expect';
import * as consts from 'app/consts';

let adminSteps = new AdminPanelSteps();
let adminChecks = new AdminPanelChecks();
let loginSteps = new LoginSteps('0');
let user;

describe('Admin Panel :', () => {

    beforeEach(() => {
        user = {name: 'Name', lastname: 'lastname', email: TestData.createUniqLogin()};
    }, 3);

    describe('CSV parse tests', () => {

        before(() => {
            loginSteps.login(wdioConfig.users.admin);
            adminSteps.openAdminPanelPageUrl();
        }, 3);

        let inputData = [
            {user: {name: 'Иван - 1', lastname: 'Иванов - 1', patronymic: 'Иванович - 1', email: 'ingiprotest+1@gmail.com'}, row: 1},
            {user: {name: 'Иван - 5', lastname: 'Иванов - 5', patronymic: 'Иванович - 5', email: 'ingiprotest+5@gmail.com'}, row: 5},
            {user: {name: 'Иван - 10', lastname: 'Иванов - 10', patronymic: 'Иванович - 10', email: 'ingiprotest+10@gmail.com'}, row: 10},
        ];

        it('Check that CSV file parse and fill in the inputs after uploading it', () => {
            allure.addTestId('13');
            allure.addSeverity('blocker');
            adminSteps.uploadCSVFile(consts.FRONTEND_UPLOAD_TESTS_FILE.csv.path);
            inputData.forEach((test) => {
                adminChecks.expectRowData(test.user, test.row);
            });
        }, 3);
    });

    describe('Send link button tests', () => {
        before(() => {
            loginSteps.login(wdioConfig.users.admin);
            adminSteps.openAdminPanelPageUrl();
        }, 3);

        it('Check that send invite link button is displaying, when user input fulfilled', () => {
            allure.addTestId('16');
            allure.addSeverity('blocker');
            adminSteps.fillUserDataInRow(user);
            adminChecks.expectSendInviteLinkBtnIsDisplayed();
        });
    });

    describe('Input rows cases : ', () => {
        before(() => {
            loginSteps.login(wdioConfig.users.admin);
            adminSteps.openAdminPanelPageUrl();
        }, 3);

        it('Check that 5 more rows for user data show up, when 5 previous rows are fulfilled', () => {
            allure.addTestId('15');
            allure.addSeverity('critical');
            adminSteps.fillCycledUserDataInRow([user], 1, 5);
            adminChecks.expectRowAmount(10);
        });
    });

    describe('Input Error cases : ', () => {
        before(() => {
            loginSteps.login(wdioConfig.users.admin);
            adminSteps.openAdminPanelPageUrl();
        }, 3);

        describe('Input error contour cases', () => {

            let emailVariants = [
                {args: '  '},
                {args: ' @ .ru'},
                {args: 'email@.ru'},
                {args: '@domen.ru'},
            ];

            emailVariants.forEach((test) => {
                it('Check that email input has error contour ,if value does not match regular expression *@*.*', () => {
                    allure.addTestId('833');
                    allure.addSeverity('critical');
                    adminSteps.fillUserDataInRow({name: 'name', lastname: 'lastname', email: test.args});
                    adminChecks.expectErrorContourOnEmailInput();
                });
            });

            it('Check that email input has NO error contour if value match regular expression *@*.* ', () => {
                allure.addTestId('833');
                allure.addSeverity('critical');
                adminSteps.fillUserDataInRow({name: 'name', lastname: 'lastname', email: 'email@domen.ru'});
                adminChecks.expectSendInviteLinkBtnIsDisplayed();
            });
        });
    });
});
