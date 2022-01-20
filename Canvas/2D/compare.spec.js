import {config as wdioConfig} from 'wdio.conf';
import 'app/libs/commands';
import CanvasSteps from 'app/libs/steps/canvas.steps';
import LoginSteps from 'app/libs/steps/login.steps';
import CanvasChecks from 'app/libs/expects/canvas.expect';
import IngiproBackendClient from 'app/libs/handles/ingiproBackendClient';
import TaskBackendClient from 'app/libs/handles/tasks.backendClient';
import allure from '@wdio/allure-reporter';

let loginSteps = new LoginSteps('0');
let canvasSteps = new CanvasSteps('0');
let canvasChecks = new CanvasChecks();
let backend = new IngiproBackendClient();
let backendTask = new TaskBackendClient;

describe('2D Canvas :', () => {

    before(async () => {
        await backend.auth(wdioConfig.users.homerSimpson);
        await backend.createProject('compareProject');
        await backend.createNode(backend.newProjectId, 'compareTestNode');
        await backend.createVersion(backend.newNodeId);
        await backendTask.createTask(backend.cookie, backend.owners, backend.newVersionId, 'Открыта');
    }, 3);

    describe('Compare : Compare mode tests', () => {

        beforeEach(() => {
            loginSteps.login(wdioConfig.users.homerSimpson);
            canvasSteps
                .openCanvas(backend.newNodeId, backend.newVersionId);
        }, 3);

        it('should open compare mode and check', () => {
            allure.addTestId('2240');
            allure.addSeverity('blocker');
            canvasSteps
                .openTask()
                .openCompareMode();
            canvasChecks
                .expectCompareModeOpen();
        });

        it('should open overlay mode and check', () => {
            allure.addTestId('2241');
            allure.addSeverity('blocker');
            canvasSteps
                .openTask()
                .openOverlayMode();
            canvasChecks
                .expectOverlayModeOpen();
        });
    });

    after(async () => {
        await backend.removeEntity(backend.newProjectId);
    }, 3);
});
