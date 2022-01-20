import allure from '@wdio/allure-reporter';
import NavigatorSteps from 'app/libs/steps/navigator.steps';
import EtableChecks from 'app/libs/expects/etable.expect';
import LoginSteps from 'app/libs/steps/login.steps';
import PopupSteps from 'app/libs/steps/popup.steps';
import IngiproBackendClient from 'app/libs/handles/ingiproBackendClient';
import {config as wdioConfig} from 'wdio.conf';
import TestData from 'app/libs/testData';

let tableSteps = new NavigatorSteps('0');
let popupSteps = new PopupSteps();
let etableChecks = new EtableChecks();
let loginSteps = new LoginSteps('0');
let backend = new IngiproBackendClient();
let newDocument = {};

describe('Etable tests :', () => {

    before(async () => {
        await backend.auth(wdioConfig.users.homerSimpson);
        await backend.createProject('etableProject');
    }, 3);

    beforeEach(() => {
        loginSteps.login(wdioConfig.users.homerSimpson);
    }, 3);

    it('Check that etable page opens after click on project access button', () => {
        allure.addTestId('748');
        allure.addSeverity('blocker');
        tableSteps.clickProjectAccessIconBtn('etableProject');
        etableChecks.expectEtablePageIsDisplayed();
    });

    let bimStatuses = [
        {args: 'S0'},
        {args: 'S3'},
        {args: 'D1'},
        {args: 'D3'},
        {args: 'D4'},
        {args: 'B1'},
        {args: 'B3'},
        {args: 'CR'},
    ];

    bimStatuses.forEach((test) => {
        it(`Check that Bim status edit popup opens on ${test.args} status`, () => {
            allure.addTestId('759');
            allure.addSeverity('blocker');
            tableSteps
                .openETable(backend.newProjectId)
                .clickProjectBimStatus(test.args);
            etableChecks.expectBimStatusPopupIsDisplayed();
        });
    });

    it('Check that create new status popup appears while clicking on add new status button', () => {
        allure.addTestId('758');
        allure.addSeverity('blocker');
        tableSteps
            .openETable(backend.newProjectId)
            .clickAddBimStatusBtn();
        etableChecks.expectAddBimStatusPopupIsDisplayed();
    });


    after(async () => {
        await backend.removeEntity(backend.newProjectId);
    }, 3);
});

describe('Etable tests : Test with creating node before steps', () => {

    before(async () => {
        newDocument.name = TestData.createUniqNodeName();
        await backend.auth(wdioConfig.users.homerSimpson);
        await backend.createProject('etableProject');
        await backend.createNode(backend.newProjectId, newDocument.name);
    }, 3);

    before(() => {
        loginSteps.login(wdioConfig.users.homerSimpson);
    }, 3);

    it('Check that BIM user can`t delete specified BIM status because of documents in this status', () => {
        allure.addTestId('762');
        allure.addSeverity('blocker');
        tableSteps
            .openETable(backend.newProjectId)
            .clickProjectBimStatus('S0');
        popupSteps.clickDeleteBimStatusBtn();
        etableChecks.expectAlertBimStatusCantBeDeleted('Невозможно удалить: существует версия документа с этим статусом.');
    });

    after(async () => {
        await backend.removeEntity(backend.newProjectId);
    }, 3);
});
