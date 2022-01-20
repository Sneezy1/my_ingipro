import {config as wdioConfig} from 'wdio.conf';

import 'app/libs/commands';

import CanvasSteps from 'app/libs/steps/canvas.steps';
import LoginSteps from 'app/libs/steps/login.steps';

import CanvasChecks from 'app/libs/expects/canvas.expect';
import IngiproBackendClient from 'app/libs/handles/ingiproBackendClient';
import allure from '@wdio/allure-reporter';

let loginSteps = new LoginSteps('0');
let canvasSteps = new CanvasSteps('0');
let backend = new IngiproBackendClient();
let canvasChecks = new CanvasChecks();

describe('2D Canvas :', () => {

    before(async () => {
        await backend.auth(wdioConfig.users.homerSimpson);
        await backend.createProject('taskStatusesTestsProject');
    }, 3);

    describe('Task Statuses : Common task statuses tests', () => {

        beforeEach(async () => {
            await backend.createNode(backend.newProjectId, 'statusTests');
        }, 3);

        beforeEach(() => {
            loginSteps.login(wdioConfig.users.homerSimpson);
            canvasSteps
                .openCanvas(backend.newNodeId, backend.newVersionId);
        }, 3);

        it('should show status selectbox after click', () => {
            allure.addTestId('3760');
            allure.addSeverity('medium');
            canvasSteps
                .chooseTool('Карандаш')
                .drawLine()
                .clickStatusChooseButton();
            canvasChecks
                .expectSelectBoxStatusOpen();
        });

        let statusCases = [
            {args: ['Открыта'], expected: 'Открыта'},
            {args: ['В работе'], expected: 'В работе'},
            {args: ['Нужна информация'], expected: 'Нужна информация'},
            {args: ['Проверить'], expected: 'Проверить'},
            {args: ['Решена'], expected: 'Решена'},
            {args: ['Удалена'], expected: 'Удалена'},
        ];

        statusCases.forEach((test) => {
            allure.addTestId('13591');
            allure.addSeverity('medium');
            it(`should change status "${test.args}" and check it`, () => {
                canvasSteps
                    .chooseTool('Карандаш')
                    .drawLine()
                    .clickStatusChooseButton()
                    .clickOnTaskStatus(test.args);
                canvasChecks
                    .expectTaskStatus(test.expected);
            });
        });
    });

    after(async () => {
        await backend.removeEntity(backend.newProjectId);
    }, 3);
});
