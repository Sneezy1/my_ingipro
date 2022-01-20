import {config as wdioConfig} from 'wdio.conf';
import 'app/libs/commands';
import TestData from 'app/libs/testData';
import LoginSteps from 'app/libs/steps/login.steps';
import NavigatorSteps from 'app/libs/steps/navigator.steps';
import NavigatorChecks from 'app/libs/expects/navigator.expect';
import IngiproBackendClient from 'app/libs/handles/ingiproBackendClient';
import allure from '@wdio/allure-reporter';

let tableSteps = new NavigatorSteps('0');
let tableChecks = new NavigatorChecks();
let loginSteps = new LoginSteps('0');
let backend = new IngiproBackendClient();
let UNIQ_NODE_NAME;

describe('Navigator :', () => {

    beforeEach(() => {
        UNIQ_NODE_NAME = TestData.createUniqNodeName();
        loginSteps.login(wdioConfig.users.homerSimpson);
    }, 3);

    describe('Node rename tests', () => {
        before(async () => {
            await backend.auth(wdioConfig.users.homerSimpson);
            await backend.createProject('nodeRenameTests');
        }, 3);

        beforeEach(() => {
            loginSteps.login(wdioConfig.users.homerSimpson);
            tableSteps
                .openNode(backend.newProjectId);
        }, 3);

        it('should rename node', () => {
            allure.addTestId('871');
            allure.addSeverity('medium');
            tableSteps
                .createNodeAndCloseAlert(UNIQ_NODE_NAME)
                .selectNode(UNIQ_NODE_NAME)
                .openNodeEditor()
                .changeNodeTitle('checkingRename');
            tableChecks
                .expectNodeTitleIsChanged('checkingRename');
        });

        it('should change additional name and check', () => {
            allure.addTestId('872');
            allure.addSeverity('medium');
            tableSteps
                .createNodeAndCloseAlert(UNIQ_NODE_NAME)
                .selectNode(UNIQ_NODE_NAME)
                .openNodeEditor()
                .changeNodeDescription('checkingAdditionalRename');
            tableChecks
                .expectNodeDescriptionChange(UNIQ_NODE_NAME, 'checkingAdditionalRename');
        });

        it('should check that edit mode is not displayed after clicking on cancel button on bulk-panel', () => {
            allure.addTestId('13605');
            allure.addSeverity('medium');
            tableSteps
                .createNodeAndCloseAlert(UNIQ_NODE_NAME)
                .selectNode(UNIQ_NODE_NAME)
                .openNodeEditor()
                .clickOnNodeCancelButton();
            tableChecks
                .expectEditModeIsNotDisplayed();
        });

        after(async () => {
            await backend.removeEntity(backend.newProjectId);
        }, 3);
    });

    describe('Project rename tests', () => {

        beforeEach(async () => {
            await backend.auth(wdioConfig.users.homerSimpson);
            await backend.createProject(UNIQ_NODE_NAME);
        }, 3);

        beforeEach(() => {
            loginSteps.login(wdioConfig.users.homerSimpson);
        }, 3);

        it('should rename project', () => {
            allure.addTestId('12057');
            allure.addSeverity('critical');
            tableSteps
                .selectNode(UNIQ_NODE_NAME)
                .openNodeEditor()
                .changeNodeTitle('NewProjectName');
            tableChecks
                .expectNodeTitleIsChanged('NewProjectName');
        });

        afterEach(async () => {
            await backend.removeEntity(backend.newProjectId);
        }, 3);

    });

    describe('Project description rename tests', () => {
        beforeEach(async () => {
            await backend.auth(wdioConfig.users.homerSimpson);
            await backend.createProject(UNIQ_NODE_NAME);
        }, 3);

        beforeEach(() => {
            loginSteps.login(wdioConfig.users.homerSimpson);
        }, 3);

        it('should change additional project name', () => {
            allure.addTestId('12056');
            allure.addSeverity('critical');
            tableSteps
                .selectNode(UNIQ_NODE_NAME)
                .openNodeEditor()
                .changeNodeDescription('checkingAdditionalRename');
            tableChecks
                .expectNodeDescriptionChange(UNIQ_NODE_NAME, 'checkingAdditionalRename');
        });

        afterEach(async () => {
            await backend.removeEntity(backend.newProjectId);
        }, 3);
    });

});
