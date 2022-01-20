import 'app/libs/commands';
import {config as wdioConfig} from 'wdio.conf';
import IngiproBackendClient from 'app/libs/handles/ingiproBackendClient';
import LoginSteps from 'app/libs/steps/login.steps';
import NavigatorSteps from 'app/libs/steps/navigator.steps';
import PopupChecks from 'app/libs/expects/popup.expect';
import PopupSteps from 'app/libs/steps/popup.steps';
import NavigatorChecks from 'app/libs/expects/navigator.expect';
import TestData from 'app/libs/testData';
import * as consts from 'app/consts';
import allure from '@wdio/allure-reporter';


let loginSteps = new LoginSteps('0');
let tableSteps = new NavigatorSteps('0');
let tableChecks = new NavigatorChecks();
let popupSteps = new PopupSteps();
let popupChecks = new PopupChecks();
let UNIQ_NODE_NAME;
let backend = new IngiproBackendClient();

describe('Navigator :', () => {

    before(async () => {
        await backend.auth(wdioConfig.users.homerSimpson);
        await backend.createProject('statusesTestsProject');
    }, 3);

    before(() => {
        UNIQ_NODE_NAME = TestData.createUniqNodeName();
    }, 3);

    describe('Common, node status, tests', () => {

        beforeEach(async () => {
            await backend.createNode(backend.newProjectId, UNIQ_NODE_NAME);
        }, 3);

        beforeEach(() => {
            loginSteps.login(wdioConfig.users.homerSimpson);
            tableSteps
                .openNode(backend.newProjectId);
        }, 3);

        it('should check that status of the file shows up in the navigator', () => {
            allure.addTestId('13606');
            allure.addSeverity('medium');
            tableChecks
                .expectDocumentHasStatusIcon(UNIQ_NODE_NAME);
        });

        it('should check that status popup disappear after click somewhere out of popup', () => {
            allure.addTestId('13607');
            allure.addSeverity('medium');
            tableSteps
                .openBulkPanel(UNIQ_NODE_NAME)
                .clickChangeStatusBtn()
                .clickBulkPanelCancelButton();
            popupChecks
                .expectPopupDisappeared();

        });

        it('should check that status of the file shows up in the version dropdown', () => {
            allure.addTestId('13608');
            allure.addSeverity('medium');
            tableSteps
                .hoverStatusIcon(UNIQ_NODE_NAME);
            popupChecks
                .expectDocumentHasStatusInVersionList('Версия 1');
        });

        it('should check that status popup is showing up after bulk-panel button click', () => {
            allure.addTestId('13609');
            allure.addSeverity('medium');
            tableSteps
                .openBulkPanel(UNIQ_NODE_NAME)
                .clickChangeStatusBtn();
            popupChecks
                .expectStatusPopupShowsUp();
        });

        let statusColors = [
            {status: ['S0'], expected: ['blue']},
            {status: ['S1'], expected: ['yellow']},
            {status: ['D1'], expected: ['green']},
            //{status: ['Archive'], expected: ['white']},
        ];

        statusColors.forEach((test) => {
            it(`should check that the color of status ${test.status} changes`, () => {
                allure.addTestId('13610');
                allure.addSeverity('medium');
                tableSteps
                    .openBulkPanel(UNIQ_NODE_NAME)
                    .clickChangeStatusBtn();
                popupSteps
                    .clickStatusOnStatusList(test.status);
                browser.refresh();
                tableChecks
                    .expectDocumentHasColoredStatus(UNIQ_NODE_NAME, test.expected);
            });
        });

        let statuses = [
            {status: ['B1'], expected: ['B1']},
            {status: ['S1'], expected: ['S1']},
            {status: ['D1'], expected: ['D1']},
        ];

        statuses.forEach((test) => {
            it(`should change node status to ${test.status} by clicking status in version popup`, () => {
                allure.addTestId('13611');
                allure.addSeverity('medium');
                tableSteps
                    .openBulkPanel(UNIQ_NODE_NAME)
                    .clickChangeStatusBtn();
                popupSteps
                    .clickStatusOnStatusList(test.status);
                browser.refresh();
                tableChecks
                    .expectDocumentHasSpecifiedDocumentStatus(UNIQ_NODE_NAME, test.expected);
            });
        });

        it('should check that status group titles is ok', () => {
            allure.addTestId('13612');
            allure.addSeverity('medium');
            tableSteps
                .openBulkPanel(UNIQ_NODE_NAME)
                .clickChangeStatusBtn();
            popupChecks
                .expectStatusGroupTitlesInPopup(consts.STATUS_GROUP_TITLES);
        });

        afterEach(async () => {
            await backend.removeEntity(backend.newNodeId);
        }, 3);
    });

    after(async () => {
        await backend.removeEntity(backend.newProjectId);
    }, 3);
});
