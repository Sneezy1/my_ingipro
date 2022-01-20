import {config as wdioConfig} from 'wdio.conf';
import 'app/libs/commands';
import LoginSteps from 'app/libs/steps/login.steps';
import CanvasSteps from 'app/libs/steps/canvas.steps';
import CanvasChecks from 'app/libs/expects/canvas.expect';
import IngiproBackendClient from 'app/libs/handles/ingiproBackendClient';
import allure from '@wdio/allure-reporter';

let loginSteps = new LoginSteps('0');
let canvasChecks = new CanvasChecks();
let backend = new IngiproBackendClient();
let canvasSteps = new CanvasSteps('0');

describe('2D Canvas :', () => {

    before(async () => {
        await backend.auth(wdioConfig.users.homerSimpson);
        await backend.createProject('tasksTestsProject');
    }, 3);

    describe('Tasks : Common task tests', () => {

        beforeEach(async () => {
            await backend.createNode(backend.newProjectId, 'tasksTests');
        }, 3);

        beforeEach(() => {
            loginSteps.login(wdioConfig.users.homerSimpson);
            canvasSteps
                .openCanvas(backend.newNodeId, backend.newVersionId);
        }, 3);

        it('should select task and check', () => {
            allure.addTestId('3741');
            allure.addSeverity('medium');
            canvasSteps
                .chooseTool('Карандаш')
                .drawLine()
                .openTask();
            canvasChecks
                .expectTaskOpen();
        });

        it('should draw line and check it', () => {
            allure.addTestId('3740');
            allure.addSeverity('medium');
            canvasSteps
                .chooseTool('Карандаш')
                .drawLine();
            canvasChecks
                .expectDrawLine();
        });

    });

    after(async () => {
        await backend.removeEntity(backend.newProjectId);
    }, 3);
});
