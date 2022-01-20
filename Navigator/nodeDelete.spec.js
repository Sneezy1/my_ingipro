import {config as wdioConfig} from 'wdio.conf';
import 'app/libs/commands';
import TestData from 'app/libs/testData';
import LoginSteps from 'app/libs/steps/login.steps';
import NavigatorSteps from 'app/libs/steps/navigator.steps';
import NavigatorChecks from 'app/libs/expects/navigator.expect';
import IngiproBackendClient from 'app/libs/handles/ingiproBackendClient';
import allure from '@wdio/allure-reporter';

let loginSteps = new LoginSteps('0');
let tableSteps = new NavigatorSteps('0');
let tableChecks = new NavigatorChecks();
let backend = new IngiproBackendClient();
let UNIQ_NODE_NAME;

describe('Navigator :', () => {

    before(async () => {
        await backend.auth(wdioConfig.users.homerSimpson);
        await backend.createProject('nodeDeleteTests');
    }, 3);

    describe('Node deletion tests', () => {

        beforeEach(() => {
            UNIQ_NODE_NAME = TestData.createUniqNodeName();
            loginSteps.login(wdioConfig.users.homerSimpson);
            tableSteps
                .openNode(backend.newProjectId);
        }, 3);

        it('should delete node', () => {
            allure.addTestId('868');
            allure.addSeverity('medium');
            tableSteps
                .createNodeAndCloseAlert(UNIQ_NODE_NAME)
                .selectNode(UNIQ_NODE_NAME);
            tableChecks
                .expectNodeDelete();
        });

        it('should return deleted node', () => {
            allure.addTestId('13603');
            allure.addSeverity('medium');
            tableSteps
                .createNodeAndCloseAlert(UNIQ_NODE_NAME)
                .selectNode(UNIQ_NODE_NAME)
                .deleteNode()
                .returnNode()
                .closeAlert();
            tableChecks
                .expectNodeReturn(UNIQ_NODE_NAME);
        });

        it('should select all nodes in table', () => {
            allure.addTestId('7960');
            allure.addSeverity('medium');
            tableSteps
                .createNodeAndCloseAlert(UNIQ_NODE_NAME)
                .selectAllNodes();
            tableChecks
                .expectAllNodesAreSelected();
        });

        it('should delete all selected nodes in table', () => {
            allure.addTestId('870');
            allure.addSeverity('medium');
            const UNIQ_NODE_NAME1 = `1${TestData.createUniqNodeName()}`;
            const UNIQ_NODE_NAME2 = `2${TestData.createUniqNodeName()}`;
            tableSteps
                .createNodeAndCloseAlert(UNIQ_NODE_NAME1)
                .createNodeAndCloseAlert(UNIQ_NODE_NAME2)
                .deleteAllNodes();
            tableChecks
                .expectNodeCount(1);
        });
    });

    after(async () => {
        await backend.removeEntity(backend.newProjectId);
    }, 3);
});
