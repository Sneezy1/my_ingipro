import {config as wdioConfig} from 'wdio.conf';
import 'app/libs/commands';
import TestData from 'app/libs/testData';
import IngiproBackendClient from 'app/libs/handles/ingiproBackendClient';
import LoginSteps from 'app/libs/steps/login.steps';
import NavigatorSteps from 'app/libs/steps/navigator.steps';
import NavigatorChecks from 'app/libs/expects/navigator.expect';
import allure from '@wdio/allure-reporter';

let loginSteps = new LoginSteps('0');
let tableSteps = new NavigatorSteps('0');
let tableChecks = new NavigatorChecks();
let backend = new IngiproBackendClient();
let UNIQ_NODE_NAME;

describe('Navigator :', () => {

    before(async () => {
        await backend.auth(wdioConfig.users.homerSimpson);
        await backend.createProject('nodeCreationTests');
    });

    describe('Node creation tests', () => {

        beforeEach(() => {
            UNIQ_NODE_NAME = TestData.createUniqNodeName();
            loginSteps.login(wdioConfig.users.homerSimpson);
            tableSteps
                .openNode(backend.newProjectId);

        }, 3);

        it('should create new node', () => {
            allure.addTestId('13599');
            allure.addSeverity('blocker');
            tableChecks
                .expectNodeCreate(UNIQ_NODE_NAME);
        });

        let zeroNodeNames = [
            {args: ['0'], expected: '0'},
            {args: ['00'], expected: '00'},
            {args: ['0000000000'], expected: '0000000000'},
        ];

        zeroNodeNames.forEach((test) => {
            allure.addTestId('13600');
            allure.addSeverity('medium');
            it(`should create node with title ${test.args}, and check that its title isn't blank`, () => {
                tableSteps
                    .createNodeAndCloseAlert(test.args);
                tableChecks
                    .expectNodeIsDisplayed(test.expected);
            });
        });

        it('should create node with space instead of title and check error', () => {
            allure.addTestId('13601');
            allure.addSeverity('medium');
            tableSteps
                .createNode('  ');
            tableChecks
                .expectNodeTitleErrorMsg('Укажите название');
        });

        it('should check error message after creation 2 nodes with similar titles' , () => {
            allure.addTestId('13602');
            allure.addSeverity('critical');
            tableSteps
                .createNodeAndCloseAlert(UNIQ_NODE_NAME)
                .createNode(UNIQ_NODE_NAME);
            tableChecks
                .expectNodeTitleErrorMsg('Документ с таким именем уже существует');
        });

        it('should try to create blank node and check error message', () => {
            allure.addTestId('13601');
            allure.addSeverity('medium');
            tableSteps
                .createNode('');
            tableChecks
                .expectNodeTitleErrorMsg('Укажите название');
        });
    });

    describe('Backend node creation tests', () => {

        before(async () => {
            UNIQ_NODE_NAME = await TestData.createUniqNodeName();
            await backend.createNode(backend.newProjectId, UNIQ_NODE_NAME);
        });

        beforeEach(() => {
            loginSteps.login(wdioConfig.users.homerSimpson);
        }, 3);

        //TODO нужен ли нам этот тест?
        it('should create node with uniq node name using backend', () => {
            tableSteps
                .openNode(backend.newProjectId);
            tableChecks
                .expectNodeIsDisplayed(UNIQ_NODE_NAME);
        });
    });

    after(async () => {
        await backend.removeEntity(backend.newProjectId);
    }, 3);
});
