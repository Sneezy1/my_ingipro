import {config as wdioConfig} from 'wdio.conf';
import 'app/libs/commands';
import CanvasSteps from 'app/libs/steps/canvas.steps';
import LoginSteps from 'app/libs/steps/login.steps';
import CanvasChecks from 'app/libs/expects/canvas.expect';
import TestData from 'app/libs/testData';
import IngiproBackendClient from 'app/libs/handles/ingiproBackendClient';
import TaskBackendClient from 'app/libs/handles/tasks.backendClient';
import allure from '@wdio/allure-reporter';

let loginSteps = new LoginSteps('0');
let canvasSteps = new CanvasSteps('0');
let canvasChecks = new CanvasChecks();
let backend = new IngiproBackendClient();
let backendTask = new TaskBackendClient;
let HOMER_NAME;
let MARGE_NAME;
let PROJECT_USERS;

describe('2D Canvas :', () => {

    before(async () => {
        HOMER_NAME = await TestData.getUserName(wdioConfig.users.homerSimpson);
        MARGE_NAME = await TestData.getUserName(wdioConfig.users.margeSimpson);
        PROJECT_USERS = await TestData.getUserId([wdioConfig.users.margeSimpson, wdioConfig.users.homerSimpson]);
    }, 3);

    before(async () => {
        await backend.auth(wdioConfig.users.homerSimpson);
        await backend.createProject('sortTabProject', PROJECT_USERS);
        await backend.createNode(backend.newProjectId, 'sortTabNode');
        await backendTask.createTask(backend.cookie, backend.owners, backend.newVersionId, 'Открыто');
        await backendTask.createTask(backend.cookie, backend.owners, backend.newVersionId, 'В работе');
        await backendTask.createTask(backend.cookie, backend.owners, backend.newVersionId, 'Нужна информация');
        await backendTask.createTask(backend.cookie, backend.owners, backend.newVersionId, 'Проверить');
        await backendTask.createTask(backend.cookie, backend.owners, backend.newVersionId, 'Решена');
        await backend.auth(wdioConfig.users.margeSimpson);
        await backendTask.createTask(backend.cookie, backend.owners, backend.newVersionId, 'Удалена');
    }, 3);

    describe('Sort Tabs : Common sort tabs tests', () => {

        beforeEach(() => {
            loginSteps.login(wdioConfig.users.homerSimpson);
            canvasSteps
                .openCanvas(backend.newNodeId, backend.newVersionId);
        }, 3);

        it('should open dynamic report with default version sort', () => {
            allure.addTestId('13587');
            allure.addSeverity('medium');
            canvasChecks.expectSortTabIsActive('По версии');
        });

        let sortTabs = [
            {args: ['По статусу'], expected: 'По статусу'},
            {args: ['По автору'], expected: 'По автору'},
            {args: ['По версии'], expected: 'По версии'},
        ];

        sortTabs.forEach((test) => {
            allure.addTestId('13588');
            allure.addSeverity('critical');
            it(`should change sort after click on "${test.args}" sort button`, () => {
                canvasSteps
                    .clickOnSortButton(test.args);
                canvasChecks
                    .expectSortTabIsActive(test.expected);
            });
        });

        it('should show active username header title', () => {
            allure.addTestId('13589');
            allure.addSeverity('medium');
            canvasSteps
                .clickOnSortButton('По автору');
            canvasChecks
                .expectActiveAuthorHeaderTitleArray([HOMER_NAME, MARGE_NAME]);
        });

        it('should show active status header title', () => {
            allure.addTestId('13590');
            allure.addSeverity('medium');
            let status = ['Открыта',
                'В работе',
                'Нужна информация',
                'Проверить',
                'Решена',
                'Удалена'];
            canvasSteps
                .clickOnSortButton('По статусу');
            canvasChecks
                .expectActiveHeaderTitle(status);
        });

    });

    after(async () => {
        await backend.removeEntity(backend.newProjectId);
    }, 3);
});
