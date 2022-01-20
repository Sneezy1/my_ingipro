import 'app/libs/commands';
import TestData from 'app/libs/testData';
import {config as wdioConfig} from 'wdio.conf';
import allure from '@wdio/allure-reporter';
import IngiproBackendClient from 'app/libs/handles/ingiproBackendClient';
import LoginSteps from 'app/libs/steps/login.steps';
import NavigatorSteps from 'app/libs/steps/navigator.steps';
import CanvasSteps from 'app/libs/steps/canvas.steps';
import NavigatorChecks from 'app/libs/expects/navigator.expect';

let tableSteps = new NavigatorSteps('0');
let tableChecks = new NavigatorChecks();
let canvasSteps = new CanvasSteps('0');
let loginSteps = new LoginSteps('0');
let newDocument = {};
let newProject = {};
let newSecondProject = {};
let newOrganization = {};
let newGroup = {};
let backend = new IngiproBackendClient();

describe('Navigator :', () => {

    describe('Common tests', () => {

        before(async () => {
            await backend.auth(wdioConfig.users.homerSimpson);
            await backend.createProject('navigatorTests');
            newProject.id = backend.newProjectId;
            await backend.createNode(newProject.id, 'Navigator', 'navigator selenium tests');
            newDocument.id = backend.newNodeId;
        }, 3);

        beforeEach(() => {
            newDocument.name = TestData.createUniqNodeName();
            loginSteps.login(wdioConfig.users.homerSimpson);
            tableSteps
                .openNode(newDocument.id);
        }, 3);

        it('should check sub-node name in breadcrumbs ', () => {
            allure.addTestId('7936');
            tableChecks
                .expectBreadcrumbsItemIsActive('Navigator');
        });

        it('should hide bulkpanel after click on cancel button', () => {
            tableSteps
                .createNodeAndCloseAlert(newDocument.name)
                .selectNode(newDocument.name)
                .clickBulkPanelCancelButton();
            tableChecks
                .expectBulkPanelIsNotDisplayed();
        });

        it('should show responsible in node row', () => {
            tableSteps
                .createNodeAndCloseAlert(newDocument.name);
            tableChecks
                .expectResponsibleIsNotNull(newDocument.name);
        });

        it('should show active breadcrumbs after exit from canvas', () => {
            allure.addIssue('FRONTEND-2124');
            tableSteps
                .createNodeAndCloseAlert(newDocument.name)
                .clickOn2DButton(newDocument.name);
            canvasSteps
                .clickOnBackButton();
            tableChecks
                .expectBreadcrumbsItemIsActive('Navigator');
        });

        after(async () => {
            await backend.removeEntity(newProject.id);
        }, 3);
    });

    describe('Node sorting tests', () => {

        before(async () => {
            await backend.auth(wdioConfig.users.homerSimpson);
            await backend.createProject('sortNavigatorTests');
            newProject.id = backend.newProjectId;
            await backend.createNode(newProject.id, '11', '1');
            await backend.createNode(newProject.id, '2', '2');
            await backend.createNode(newProject.id, '34', '3');
            await backend.createNode(newProject.id, '4', '4');
            await backend.createNode(newProject.id, 'ab', 'aa');
            await backend.createNode(newProject.id, 'abc', 'ab');
            await backend.createNode(newProject.id, 'bc', '5');
        }, 3);

        before(() => {
            loginSteps.login(wdioConfig.users.homerSimpson);
        }, 3);

        beforeEach(() => {
            tableSteps.openNode(newProject.id);
        }, 3);

        it('should check that the sort button shows up on title header by default', () => {
            tableChecks
                .expectTitleSortBtnInHeader();
        });

        it('should check that the sort button shows up on description header', () => {
            tableSteps
                .clickDescriptionBtn();
            tableChecks
                .expectDescriptionSortBtnInHeader();
        });

        it('should sort by title', () => {
            allure.addTestId('13613');
            allure.addSeverity('medium');
            tableChecks
                .expectNodesOrderByTitle(['11', '2', '34', '4', 'ab', 'abc', 'bc', 'Доступные документы']);
        });

        it('should sort nodes backwards by title', () => {
            allure.addTestId('13614');
            allure.addSeverity('medium');
            tableSteps
                .clickTitleSortBtn();
            tableChecks
                .expectNodesOrderByTitle(['bc', 'abc', 'ab', '4', '34', '2', '11', 'Доступные документы']);
        });

        it('should sort nodes by description', () => {
            allure.addTestId('13615');
            allure.addSeverity('medium');
            tableSteps
                .clickDescriptionBtn();
            tableChecks
                .expectNodesOrderByDescription(['1', '2', '3', '4', '5', 'aa', 'ab', 'Чужие документы к которым есть доступ']);
        });

        it('should sort nodes backwards by description', () => {
            allure.addTestId('13616');
            allure.addSeverity('medium');
            tableSteps
                .clickDescriptionBtn()
                .clickDescriptionSortBtn();
            tableChecks
                .expectNodesOrderByDescription(['ab', 'aa', '5', '4', '3', '2', '1', 'Чужие документы к которым есть доступ']);
        });

        after(async () => {
            await backend.removeEntity(newProject.id);
        }, 3);
    });

    describe('CRUD project', () => {

        beforeEach(async () => {
            newProject.name = TestData.createUniqNodeName();
            newOrganization.name = TestData.createUniqOrganizationName();
            newGroup.name = TestData.createUniqGroupName();
            await backend.auth(wdioConfig.users.homerSimpson);
            await backend.createProject(newProject.name);
            newProject.id = backend.newProjectId;
            await backend.createOrganization(newProject.id, newOrganization.name);
        }, 3);

        it('Check user can\'t see project, if user is not a project\'s member', () => {
            allure.addSeverity('blocker');
            allure.addTestId('11627');
            loginSteps
                .login(wdioConfig.users.margeSimpson);
            tableChecks
                .expectNodeNotExist(newProject.name);
        });

        it('Check BIM user can edit project', () => {
            allure.addSeverity('blocker');
            allure.addTestId('11626');
            loginSteps
                .login(wdioConfig.users.homerSimpson);
            tableSteps
                .selectNode(newProject.name)
                .openNodeEditor()
                .changeNodeDescription('AdditionalName');
            tableChecks
                .expectNodeDescriptionChange(newProject.name, 'AdditionalName');
        });

        it('Check user sees parked page when opening project link, if user is not a project\'s member', () => {
            allure.addSeverity('blocker');
            allure.addTestId('11629');
            loginSteps
                .login(wdioConfig.users.margeSimpson);
            browser.openUrl(`node/${newProject.id}`);
            tableChecks
                .expectSplashScreenHasTitle('У вас нет доступа');
        });

        it('Check project is restored by click on "restore" button in alert', () => {
            allure.addSeverity('blocker');
            allure.addTestId('11634');
            loginSteps
                .login(wdioConfig.users.homerSimpson);
            tableSteps
                .selectNode(newProject.name)
                .deleteNode()
                .returnNode()
                .closeAlert();

            tableChecks
                .expectNodeIsDisplayed(newProject.name);
        });

        afterEach(async () => {
            await backend.removeEntity(newProject.id);
        }, 3);

    });

    describe('Access to project', () => {

        before(async () => {
            newProject.name = TestData.createUniqNodeName();
            newOrganization.name = TestData.createUniqOrganizationName();
            newGroup.name = TestData.createUniqGroupName();
            await backend.getUserInformation(wdioConfig.users.margeSimpson);
            newGroup.flags = [backend.userId];
            newGroup.members = [backend.userId];
            await backend.auth(wdioConfig.users.homerSimpson);
            await backend.createProject(newProject.name);
            newProject.id = backend.newProjectId;
            await backend.createOrganization(newProject.id, newOrganization.name);
            newOrganization.id = backend.newOrgId;
            await backend.createGroup(newProject.id, newOrganization.id, newGroup.name, newGroup.members, newGroup.flags);
            newGroup.id = [backend.groupId];
            await backend.updateProject(newProject.id, newGroup.id);

        }, 3);

        it('Check user can see project, if user is a project\'s member', () => {
            allure.addSeverity('blocker');
            allure.addTestId('11625');
            loginSteps.login(wdioConfig.users.margeSimpson);
            tableChecks.expectNodeIsDisplayed(newProject.name);

        });

        it('Check user can`t edit project, if user is not a BIM user', () => {
            allure.addSeverity('critical');
            allure.addTestId('12099');
            loginSteps.login(wdioConfig.users.margeSimpson);
            tableChecks.expectNodeCheckboxIsNotDisplayed(newProject.name);
        });

        after(async () => {
            await backend.removeEntity(newProject.id);
        }, 3);
    });

    describe('Project creation', () => {

        beforeEach(() => {
            newProject.name = TestData.createUniqNodeName();
            loginSteps.login(wdioConfig.users.homerSimpson);
        }, 3);

        it('Check project edit form is opened by click on "create project" button', () => {
            allure.addSeverity('blocker');
            allure.addTestId('11605');
            tableSteps
                .clickOnCreateProjectButton();
            tableChecks
                .expectEditProjectFormOpened();
        });

        it('Check project is created by click on "save" button in creation form', () => {
            allure.addSeverity('blocker');
            allure.addTestId('11630');
            tableSteps
                .createProjectAndCloseAlert(newProject.name);
            tableChecks
                .expectNodeIsDisplayed(newProject.name);
        });

        it('Check can`t save project with another user in owner field', () => {
            allure.addSeverity('critical');
            allure.addTestId('11607');
            tableSteps
                .clickOnCreateProjectButton()
                .setMainProjectName(newProject.name)
                .addParticipant('Симпсон М.')
                .deleteParticipant('Симпсон Г.')
                .saveProject();
            tableChecks.expectNodeErrorMsg('Пользователь не обладает правами администратора в этом проекте');
        });

        it('Check that can save project with more than one owner', () => {
            allure.addSeverity('critical');
            allure.addTestId('12084');
            tableSteps
                .clickOnCreateProjectButton()
                .setMainProjectName(newProject.name)
                .addParticipant('Симпсон М.')
                .saveProject();
            tableChecks.expectNodeWithOwnersIsDisplayed(newProject.name, ['Симпсон Г.', 'Симпсон М.']);
        });
    });

    describe('Project creation with admin user', () => {

        before(() => {
            newProject.name = TestData.createUniqNodeName();
            loginSteps.login(wdioConfig.users.admin);
        }, 3);

        it('Check that admin user can create project with non-admin user in owners field', () => {
            allure.addSeverity('critical');
            allure.addTestId('11608');
            tableSteps
                .clickOnCreateProjectButton()
                .setMainProjectName(newProject.name)
                .addParticipant('Симпсон М.')
                .deleteParticipant('Коркунова Д.')
                .saveProject();
            tableChecks.expectNodeWithOwnersIsDisplayed(newProject.name, ['Симпсон М.']);
        });
    });


    describe('Multiple projects CRUD', () => {

        beforeEach(async () => {
            newProject.name = TestData.createUniqNodeName();
            newSecondProject.name = `${TestData.createUniqNodeName()}1`;
            newOrganization.name = TestData.createUniqOrganizationName();
            newGroup.name = TestData.createUniqGroupName();
            await backend.getUserInformation(wdioConfig.users.margeSimpson);
            newGroup.flags = [backend.userId];
            newGroup.members = [backend.userId];
            await backend.auth(wdioConfig.users.margeSimpson);
            await backend.createProject(newProject.name);
            newProject.id = backend.newProjectId;
            await backend.createOrganization(newProject.id, newOrganization.name);
            newOrganization.id = backend.newOrgId;
            await backend.createGroup(newProject.id, newOrganization.id, newGroup.name, newGroup.members, newGroup.flags);
            newGroup.id = [backend.groupId];
            await backend.updateProject(newProject.id, newGroup.id);
            await backend.createProject(newSecondProject.name);
            newSecondProject.id = backend.newProjectId;
            await backend.createOrganization(newSecondProject.id, newOrganization.name);
            newOrganization.id = backend.newOrgId;
            await backend.createGroup(newSecondProject.id, newOrganization.id, newGroup.name, newGroup.members, newGroup.flags);
            newGroup.id = [backend.groupId];
            await backend.updateProject(newSecondProject.id, newGroup.id);

        }, 3);

        beforeEach(() => {
            loginSteps.login(wdioConfig.users.margeSimpson);
        }, 3);

        it('Check that you can delete 2 projects simultaneously', () => {
            allure.addSeverity('critical');
            allure.addTestId('7926');
            tableSteps
                .selectNode(newProject.name)
                .selectNode(newSecondProject.name)
                .deleteNode();
            tableChecks.expectNodesNotExist(newProject.name);
            tableChecks.expectNodesNotExist(newSecondProject.name);
        });

        it('Check that you can edit nodes additional name with template', () => {
            allure.addSeverity('critical');
            allure.addTestId('859');
            tableSteps
                .selectNode(newProject.name)
                .selectNode(newSecondProject.name)
                .openNodeTemplateEditor()
                .setAdditionalProjectName('Additional name')
                .saveMultipleNodes();
            tableChecks.expectNodesWithAdditionalNameIsDisplayed('Additional name', [newProject.name, newSecondProject.name]);
        });

        afterEach(async () => {
            await backend.removeEntity(newProject.id);
            await backend.removeEntity(newSecondProject.id);
        }, 3);
    });
});
