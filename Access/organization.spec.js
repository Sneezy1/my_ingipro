import {config as wdioConfig} from 'wdio.conf';
import 'app/libs/commands';
import LoginSteps from 'app/libs/steps/login.steps';
import NavigatorSteps from 'app/libs/steps/navigator.steps';
import TestData from 'app/libs/testData';
import NavigatorChecks from 'app/libs/expects/navigator.expect';
import IngiproBackendClient from 'app/libs/handles/ingiproBackendClient';
import allure from '@wdio/allure-reporter';

let tableSteps = new NavigatorSteps('0');
let tableChecks = new NavigatorChecks();
let backend = new IngiproBackendClient();
let UNIQ_ORGANIZATION_NAME;
let UNIQ_PROJECT_NAME;
let loginSteps = new LoginSteps('0');
//eslint-disable-next-line
let UNIQ_GROUP_NAME;

describe('Project organizations : ', () => {

    describe('Projects created by backend : ', () => {
        before(async () => {
            await backend.auth(wdioConfig.users.homerSimpson);
            await backend.createProject('organizationTestsProject');
        }, 3);

        beforeEach(() => {
            UNIQ_ORGANIZATION_NAME = TestData.createUniqOrganizationName();
            UNIQ_GROUP_NAME = TestData.createUniqGroupName();
            loginSteps.login(wdioConfig.users.homerSimpson);
            tableSteps
                .openETable(backend.newProjectId)
                .clickVisitGroupPageBtn();
        }, 3);

        describe('Page header tests', () => {

            it('should check that "Все организации" is active by default', () => {
                tableChecks
                    .expectActiveOrganization('Все организации');
            });

            let organizaionFilter = [
                {expect: () => {tableChecks.expectActiveOrganization(UNIQ_ORGANIZATION_NAME);}, text: 'become active'},
                {expect: () => {tableChecks.expectFilteredOrganization([UNIQ_ORGANIZATION_NAME]);}, text: 'filtering'},
            ];

            organizaionFilter.forEach((cur) => {
                it(`should check that organization ${cur.text} after click on it in header`, () => {
                    allure.addTestId('866');
                    allure.addSeverity('critical');
                    tableSteps
                        .createOrganization(UNIQ_ORGANIZATION_NAME)
                        .createOrganization(`${UNIQ_ORGANIZATION_NAME}2`)
                        .clickOrganizationInHeader(UNIQ_ORGANIZATION_NAME);
                    cur.expect();
                });
            });
        });

        describe('Create tests', () => {

            it('should enter organization create form and press cancel', () => {
                allure.addTestId('751');
                allure.addSeverity('medium');
                tableSteps
                    .enterCreateOrgForm(UNIQ_ORGANIZATION_NAME)
                    .clickCancelBtnInCreateOrgForm();
                tableChecks
                    .expectOrgCreateFormDisappear();
            });

            it('should open groups controller and create new organization', () => {
                allure.addTestId('865');
                allure.addSeverity('blocker');
                tableSteps
                    .createOrganization(UNIQ_ORGANIZATION_NAME);
                tableChecks
                    .expectOrganizationExist(UNIQ_ORGANIZATION_NAME);
            });
        });

        it('should enter organization edit form and rename organization', () => {
            allure.addTestId('803');
            allure.addSeverity('critical');
            tableSteps
                .createOrganization(UNIQ_ORGANIZATION_NAME)
                .renameOrganization(UNIQ_ORGANIZATION_NAME, `${UNIQ_ORGANIZATION_NAME}new`);
            tableChecks
                .expectOrganizationExist(`${UNIQ_ORGANIZATION_NAME}new`);
        });

        it('should enter organization edit form and remove organization', () => {
            allure.addTestId('796');
            allure.addSeverity('critical');
            tableSteps
                .createOrganization(UNIQ_ORGANIZATION_NAME)
                .removeOrganization(UNIQ_ORGANIZATION_NAME);
            tableChecks
                .expectOrganizationNotExist(UNIQ_ORGANIZATION_NAME);
        });

        after(async () => {
            await backend.removeEntity(backend.newProjectId);
        }, 3);
    });

    describe('Projects created by frontend : ', () => {

        beforeEach(()=> {
            UNIQ_PROJECT_NAME = TestData.createUniqNodeName();
            loginSteps.login(wdioConfig.users.homerSimpson);
        }, 3);

        it('should create organization with server name', () => {
            allure.addTestId('2294');
            allure.addSeverity('critical');
            tableSteps
                .createProjectAndCloseAlert(UNIQ_PROJECT_NAME)
                .clickProjectAccessIconBtn(UNIQ_PROJECT_NAME)
                .clickVisitGroupPageBtn();
            tableChecks
                .expectOrganizationExist(/\/\/(.*)\./.exec(wdioConfig.backendUrl)[1]);
        });

        after(async () => {
            let regExp = /project\/(.+)\/groups/;
            let url = await browser.getUrl();
            const projectId = await regExp.exec(url)[1];
            await backend.auth(wdioConfig.users.homerSimpson);
            await backend.removeEntity(projectId);
        }, 3);
    });

});

