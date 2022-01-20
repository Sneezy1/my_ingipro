import {config as wdioConfig} from 'wdio.conf';
import 'app/libs/commands';
import LoginSteps from 'app/libs/steps/login.steps';
import NavigatorSteps from 'app/libs/steps/navigator.steps';
import TestData from 'app/libs/testData';
import PopupChecks from 'app/libs/expects/popup.expect';
import PopupSteps from 'app/libs/steps/popup.steps';
import NavigatorChecks from 'app/libs/expects/navigator.expect';
import IngiproBackendClient from 'app/libs/handles/ingiproBackendClient';
import allure from '@wdio/allure-reporter';

let popupSteps = new PopupSteps();
let popupChecks = new PopupChecks();
let loginSteps = new LoginSteps('0');
let tableSteps = new NavigatorSteps('0');
let tableChecks = new NavigatorChecks();
let backend = new IngiproBackendClient();
let UNIQ_ORGANIZATION_NAME;
let UNIQ_GROUP_NAME;
let RANDOM_GROUP_COLOR;
let HOMER_NAME;
let MARGE_NAME;
let LIZA_NAME;
let BART_NAME;
let newGroup = {};

describe('Project groups :', () => {

    beforeEach(async () => {
        UNIQ_ORGANIZATION_NAME = await TestData.createUniqOrganizationName();
        await backend.auth(wdioConfig.users.homerSimpson);
        await backend.createProject('groupsProject');
        await backend.createOrganization(backend.newProjectId, UNIQ_ORGANIZATION_NAME);
        HOMER_NAME = await TestData.getUserName(wdioConfig.users.homerSimpson);
        MARGE_NAME = await TestData.getUserName(wdioConfig.users.margeSimpson);
        LIZA_NAME = await TestData.getUserName(wdioConfig.users.lizaSimpson);
        BART_NAME = await TestData.getUserName(wdioConfig.users.bartSimpson);
    }, 3);

    beforeEach(() => {
        loginSteps.login(wdioConfig.users.homerSimpson);
    }, 3);

    beforeEach(() => {
        RANDOM_GROUP_COLOR = TestData.chooseRandomColor();
        UNIQ_GROUP_NAME = TestData.createUniqGroupName();
        tableSteps
            .openGroupsController(backend.newProjectId);
    }, 3);

    describe('Create form tests', () => {
        beforeEach(() => {
            tableSteps
                .clickCreateGroupBtn(UNIQ_ORGANIZATION_NAME);
        }, 3);

        it('should check title in group create form header', () => {
            allure.addTestId('2297');
            allure.addTestId('802');
            allure.addSeverity('blocker');
            popupChecks
                .expectHeaderTitleInGroupForm('Новая группа');
        });

        it('should check placeholder in create group form name input', () => {
            allure.addTestId('2302');
            allure.addSeverity('minor');
            popupChecks
                .expectPlaceholderInGroupCreateInput('Укажите название новой группы');
        });

        it('should check that add users form opens, after click on \'add users in group\' button', () => {
            allure.addTestId('1097');
            allure.addSeverity('blocker');
            popupSteps
                .clickAddGroupUserBtn();
            tableChecks
                .expectAddUserFormIsDisplayed();
        });

        it('should check placeholder in add user form name input', () => {
            allure.addTestId('13555');
            allure.addSeverity('minor');
            popupSteps
                .clickAddGroupUserBtn();
            popupChecks
                .expectPlaceholderInAddUserInput('Введите фамилию или имя');
        });

        it('should check that organization in which was add group button pressed is selected by defalut in create group form', () => {
            allure.addTestId('807');
            allure.addSeverity('minor');
            popupChecks
                .expectSelectedOrganizationInGroupCreateForm(UNIQ_ORGANIZATION_NAME);
        });

        it('should check that gray color set by default in create group form', () => {
            allure.addTestId('2217');
            allure.addSeverity('minor');
            popupChecks
                .expectGroupColorInGroupCreateForm('gray');
        });

        it('should check that exclude user button in create group form is disabled by default', () => {
            allure.addTestId('2303');
            allure.addSeverity('minor');
            popupChecks
                .expectGroupCreateExcludeUserBtnIsDisabled();
        });

        it('should check that save group button in create group form is disabled by default', () => {
            allure.addTestId('13556');
            allure.addSeverity('medium');
            popupChecks
                .expectGroupCreateSaveBtnIsDisabled();
        });

        it('should try to create groups with similar names, and save button must be inactive', () => {
            allure.addTestId('2219');
            allure.addTestId('T20329');
            allure.addSeverity('сritical');
            popupSteps
                .createDefaultGroup('Группа #1');
            tableChecks
                .expectGroupCreated('Группа #1');
            tableSteps
                .clickCreateGroupBtn(UNIQ_ORGANIZATION_NAME);
            popupSteps
                .enterNameForGroup('Группа #1')
                .addUserInGroup(HOMER_NAME);
            popupChecks
                .expectGroupCreateSaveBtnIsDisabled();
        });

        it('should add user uncheck his flag and check if it was unchecked', () => {
            popupSteps
                .addUserInGroup(HOMER_NAME)
                .uncheckUsersFlag(HOMER_NAME);
            popupChecks
                .expectUserFlagUnchecked(HOMER_NAME);
        });

        it('should add user and uncheck flag on it, and save button should become inactive', () => {
            allure.addTestId('1102');
            allure.addTestId('20326');
            allure.addSeverity('Critical');
            popupSteps
                .addUserInGroup(HOMER_NAME)
                .uncheckUsersFlag(HOMER_NAME);
            popupChecks
                .expectGroupCreateSaveBtnIsDisabled();
        });

        it('should click color in group create and it should become active', () => {
            allure.addTestId('13558');
            allure.addSeverity('minor');
            popupSteps
                .chooseColorForGroup(RANDOM_GROUP_COLOR);
            popupChecks
                .expectGroupColorInGroupCreateForm(RANDOM_GROUP_COLOR);
        });

        it('should add user,exclude him and check it in group form popup', () => {
            allure.addTestId('1100');
            allure.addSeverity('blocker');
            popupSteps
                .enterNameForGroup(UNIQ_GROUP_NAME)
                .addUserInGroup(HOMER_NAME, MARGE_NAME, LIZA_NAME, BART_NAME)
                .excludeUserInGroupCreateForm(LIZA_NAME, BART_NAME);
            popupChecks
                .expectUsersInUserList([HOMER_NAME, MARGE_NAME]);
        });

        it('should create group and check users', () => {
            allure.addTestId('13559');
            allure.addSeverity('blocker');
            popupSteps
                .enterNameForGroup(UNIQ_GROUP_NAME)
                .addUserInGroup(HOMER_NAME, MARGE_NAME)
                .clickSaveGroupBtn();
            tableChecks
                .expectUsersInGroup(UNIQ_GROUP_NAME, [HOMER_NAME, MARGE_NAME]);
        });

        it('should create group with color and check in group controller', () => {
            allure.addTestId('13560');
            allure.addSeverity('minor');
            popupSteps
                .enterNameForGroup(UNIQ_GROUP_NAME)
                .chooseColorForGroup(RANDOM_GROUP_COLOR)
                .addUserInGroup(HOMER_NAME, MARGE_NAME)
                .clickSaveGroupBtn();
            tableChecks
                .expectGroupColor(UNIQ_GROUP_NAME, RANDOM_GROUP_COLOR);
        });

        it('should create group, mark all users with flag and check it', () => {
            allure.addTestId('2221');
            allure.addSeverity('blocker');
            popupSteps
                .enterNameForGroup(UNIQ_GROUP_NAME)
                .addUserInGroup(HOMER_NAME, MARGE_NAME, LIZA_NAME)
                .checkUsersFlag(MARGE_NAME, LIZA_NAME)
                .clickSaveGroupBtn();
            tableChecks
                .expectUsersFlaggedInGroupController(UNIQ_GROUP_NAME, [HOMER_NAME, MARGE_NAME, LIZA_NAME]);
        });

        it('should check that delete button is not appear, if all admins are selected', () => {
            allure.addTestId('1141');
            allure.addSeverity('critical');
            popupSteps
                .enterNameForGroup(UNIQ_GROUP_NAME)
                .addUserInGroup(HOMER_NAME, MARGE_NAME, LIZA_NAME)
                .checkUsersFlag(MARGE_NAME)
                .clickSaveGroupBtn();
            tableSteps
                .clickOnUserCheckBox(HOMER_NAME)
                .clickOnUserCheckBox(MARGE_NAME);
            tableChecks
                .expectExcludeUserBtnIsNotDisplayed();
        });

        it('should check that save button is disabled, if group title is empty', () => {
            allure.addTestId('1101');
            allure.addSeverity('medium');
            popupSteps.addUserInGroup(HOMER_NAME);
            popupChecks.expectGroupCreateSaveBtnIsDisabled();
        });

        afterEach(async () => {
            await backend.removeEntity(newGroup.id);
        }, 3);
    });

    describe('Edit tests', () => {

        beforeEach(() => {
            tableSteps
                .clickCreateGroupBtn(UNIQ_ORGANIZATION_NAME);
            popupSteps
                .createDefaultGroup(UNIQ_GROUP_NAME);
            tableSteps
                .chooseGroupInGroupController(UNIQ_GROUP_NAME);
        }, 3);

        it('should enter edit group form and check header title', () => {
            allure.addTestId('2298');
            allure.addTestId('2305');
            allure.addSeverity('blocker');
            tableSteps
                .clickEditGroupBtn(UNIQ_GROUP_NAME);
            popupChecks
                .expectHeaderTitleInGroupForm('Настройка группы');
        });

        it('should enter edit group form add user, and save group', () => {
            allure.addTestId('13561');
            allure.addSeverity('blocker');
            tableSteps
                .clickEditGroupBtn(UNIQ_GROUP_NAME);
            popupSteps
                .addUserInGroup(MARGE_NAME)
                .clickSaveGroupBtn();
            tableChecks
                .expectUsersInGroup(UNIQ_GROUP_NAME, [HOMER_NAME, MARGE_NAME]);
        });

        it('should edit group title and check that new title is displayed', () => {
            allure.addTestId('1106');
            allure.addSeverity('critical');
            tableSteps
                .clickEditGroupBtn(UNIQ_GROUP_NAME);
            popupSteps
                .enterNameForGroup('New Group Name')
                .clickSaveGroupBtn();
            tableChecks
                .expectGroupInOrganization('New Group Name', UNIQ_ORGANIZATION_NAME);
        });

        it('should check that BIM user can add users via add user button on group in group controller', () => {
            allure.addTestId('1125');
            allure.addTestId('1105');
            allure.addSeverity('blocker');
            tableSteps
                .clickAddUserBtnOnGroupController(UNIQ_GROUP_NAME);
            popupSteps
                .chooseUsersForGroup(MARGE_NAME);
            tableSteps
                .closeAddUserGroupControllerForm();
            tableChecks
                .expectUsersInGroup(UNIQ_GROUP_NAME, [HOMER_NAME, MARGE_NAME]);
        });

        it('should check that user with flag is on top of the group', () => {
            allure.addTestId('2220');
            allure.addSeverity('medium');
            tableSteps
                .clickEditGroupBtn(UNIQ_GROUP_NAME);
            popupSteps
                .addUserInGroup(MARGE_NAME, LIZA_NAME)
                .checkUsersFlag(MARGE_NAME, LIZA_NAME)
                .uncheckUsersFlag(HOMER_NAME)
                .clickSaveGroupBtn();
            tableChecks
                .expectUsersInGroup(UNIQ_GROUP_NAME, [MARGE_NAME, LIZA_NAME, HOMER_NAME]);
        });

        it('should exclude user and then try to add', () => {
            allure.addTestId('13562');
            allure.addSeverity('blocker');
            tableSteps
                .clickEditGroupBtn(UNIQ_GROUP_NAME);
            popupSteps
                .excludeUserInGroupCreateForm(HOMER_NAME)
                .addUserInGroup(HOMER_NAME);
            popupChecks
                .expectUsersInUserList([HOMER_NAME]);
        });

        afterEach(async () => {
            await backend.removeEntity(newGroup.id);
        }, 3);
    });

    describe('Common tests', () => {

        it('should choose another organization in selector and make group in it', () => {
            allure.addTestId('1103');
            allure.addSeverity('blocker');
            tableSteps
                .createOrganization('Проверочная организация')
                .clickCreateGroupBtn(UNIQ_ORGANIZATION_NAME);
            popupSteps
                .chooseOrgInSelector('Проверочная организация')
                .createDefaultGroup(UNIQ_GROUP_NAME);
            tableChecks
                .expectGroupInOrganization(UNIQ_GROUP_NAME, 'Проверочная организация');
        });

        it('should check text on add group button', () => {
            allure.addTestId('13564');
            allure.addSeverity('medium');
            tableSteps
                .clickCreateGroupBtn(UNIQ_ORGANIZATION_NAME);
            tableChecks
                .expectTextOnAddGroupBtn('Создать новую группу');
        });

        it('should click group header and it should become active', () => {
            allure.addTestId('13565');
            allure.addSeverity('medium');
            tableSteps
                .clickCreateGroupBtn(UNIQ_ORGANIZATION_NAME);
            popupSteps
                .createDefaultGroup(UNIQ_GROUP_NAME);
            tableSteps
                .chooseGroupInGroupController(UNIQ_GROUP_NAME);
            tableChecks
                .expectGroupIsActive(UNIQ_GROUP_NAME);
        });

        it('should check that breadcrumbs is active on group setting page', () => {
            allure.addTestId('13566');
            allure.addSeverity('medium');
            tableChecks
                .expectBreadcrumbsItemIsActive('Настройка и создание групп');
        });

        it('should delete group with delete button on group controller page', () => {
            allure.addTestId('1108');
            allure.addSeverity('blocker');
            tableSteps
                .clickCreateGroupBtn(UNIQ_ORGANIZATION_NAME);
            popupSteps
                .createDefaultGroup(UNIQ_GROUP_NAME);
            tableSteps
                .deleteGroup(UNIQ_GROUP_NAME);
            tableChecks
                .expectGroupDeleted(UNIQ_GROUP_NAME);
        });

        it('should click cancel button after choosing group and it should become inactive', () => {
            allure.addTestId('13567');
            allure.addSeverity('medium');
            tableSteps
                .clickCreateGroupBtn(UNIQ_ORGANIZATION_NAME);
            popupSteps
                .createDefaultGroup(UNIQ_GROUP_NAME);
            tableSteps
                .chooseGroupInGroupController(UNIQ_GROUP_NAME)
                .clickCancelBtnInGroupController(UNIQ_GROUP_NAME);
            tableChecks
                .expectGroupInactive();
        });

        afterEach(async () => {
            await backend.removeEntity(newGroup.id);
        }, 3);
    });

    describe('Group admin tests:', () => {
        beforeEach(async () => {
            newGroup.name = UNIQ_GROUP_NAME;
            await backend.getUserInformation(wdioConfig.users.bartSimpson);
            newGroup.flags = [backend.userId];
            let bartId = backend.userId;
            newGroup.members = [bartId];
            await backend.auth(wdioConfig.users.homerSimpson);
            await backend.createGroup(backend.newProjectId, backend.newOrgId, newGroup.name, newGroup.members, newGroup.flags);
            newGroup.id = [backend.groupId];
            await backend.updateProject(backend.newProjectId, newGroup.id);
        }, 3);

        beforeEach(() => {
            loginSteps
                .login(wdioConfig.users.bartSimpson);
            tableSteps
                .openGroupsController(backend.newProjectId);
        }, 3);

        it('should check that group admin not able to delete groups', () => {
            allure.addTestId('2224');
            allure.addSeverity('blocker');
            tableSteps
                .chooseGroupInGroupController(UNIQ_GROUP_NAME);
            tableChecks
                .expectDeleteGroupBtnNotExist(UNIQ_GROUP_NAME);
        });

        it('should check that group admin able to edit group', () => {
            allure.addTestId('2225');
            allure.addSeverity('blocker');
            tableSteps
                .chooseGroupInGroupController(UNIQ_GROUP_NAME)
                .clickEditGroupBtn(UNIQ_GROUP_NAME);
            popupSteps
                .addUserInGroup(HOMER_NAME)
                .clickSaveGroupBtn();
            tableChecks
                .expectUsersInGroup(UNIQ_GROUP_NAME, [BART_NAME, HOMER_NAME]);
        });

        it('should check that group admin not able to create groups', () => {
            allure.addTestId('2228');
            allure.addSeverity('blocker');
            tableChecks
                .expectAddGroupBtnNotExist();
        });

        it('should check that group admin user can add users via add user button on group in group controller', () => {
            allure.addTestId('1125');
            allure.addSeverity('blocker');
            tableSteps
                .clickAddUserBtnOnGroupController(UNIQ_GROUP_NAME);
            popupSteps
                .chooseUsersForGroup(MARGE_NAME);
            tableSteps
                .closeAddUserGroupControllerForm();
            tableChecks
                .expectUsersInGroup(UNIQ_GROUP_NAME, [BART_NAME, MARGE_NAME]);
        });

        afterEach(async () => {
            await backend.removeEntity(newGroup.id);
        }, 3);
    });

    describe('Change org tests:', () => {
        beforeEach(async () => {
            newGroup.name = UNIQ_GROUP_NAME;
            await backend.getUserInformation(wdioConfig.users.bartSimpson);
            newGroup.flags = [backend.userId];
            let bartId = backend.userId;
            newGroup.members = [bartId];
            await backend.auth(wdioConfig.users.homerSimpson);
            await backend.createGroup(backend.newProjectId, backend.newOrgId, newGroup.name, newGroup.members, newGroup.flags);
            newGroup.id = [backend.groupId];
            await backend.updateProject(backend.newProjectId, newGroup.id);
        }, 3);

        beforeEach(() => {
            loginSteps
                .login(wdioConfig.users.homerSimpson);
            tableSteps
                .openGroupsController(backend.newProjectId);
        }, 3);

        it('should move group into another organization and check that group displaying in that organization', () => {
            allure.addTestId('2301');
            allure.addSeverity('critical');
            tableSteps
                .createOrganization('Проверочная организация')
                .chooseGroupInGroupController(UNIQ_GROUP_NAME)
                .clickEditGroupBtn(UNIQ_GROUP_NAME);
            popupSteps
                .chooseOrgInSelector('Проверочная организация')
                .clickSaveGroupBtn();
            tableChecks
                .expectGroupInOrganization(UNIQ_GROUP_NAME, 'Проверочная организация');
        });

        after(async () => {
            await backend.removeEntity(newGroup.id);
        }, 3);
    });

    afterEach(async () => {
        await backend.removeEntity(backend.newProjectId);
    }, 3);
});

describe('Project groups :', () => {

    before(async () => {
        UNIQ_ORGANIZATION_NAME = await TestData.createUniqOrganizationName();
        await backend.auth(wdioConfig.users.homerSimpson);
        await backend.createProject('groupsProject');
        await backend.createOrganization(backend.newProjectId, UNIQ_ORGANIZATION_NAME);
        HOMER_NAME = await TestData.getUserName(wdioConfig.users.homerSimpson);
        MARGE_NAME = await TestData.getUserName(wdioConfig.users.margeSimpson);
        LIZA_NAME = await TestData.getUserName(wdioConfig.users.lizaSimpson);
        BART_NAME = await TestData.getUserName(wdioConfig.users.bartSimpson);
    }, 3);

    beforeEach(() => {
        loginSteps.login(wdioConfig.users.margeSimpson);
    }, 3);

    beforeEach(() => {
        RANDOM_GROUP_COLOR = TestData.chooseRandomColor();
        UNIQ_GROUP_NAME = TestData.createUniqGroupName();
        tableSteps
            .openGroupsController(backend.newProjectId);
    }, 3);

    describe('Access rights tests:', () => {

        before(async () => {
            newGroup.name = TestData.createUniqGroupName();
            await backend.getUserInformation(wdioConfig.users.homerSimpson);
            newGroup.flags = [backend.userId];
            let homerId = backend.userId;
            await backend.getUserInformation(wdioConfig.users.margeSimpson);
            let margeId = backend.userId;
            newGroup.members = [homerId, margeId];
            await backend.auth(wdioConfig.users.homerSimpson);
            await backend.createGroup(backend.newProjectId, backend.newOrgId, newGroup.name, newGroup.members, newGroup.flags);
            newGroup.id = [backend.groupId];
            await backend.updateProject(backend.newProjectId, newGroup.id);
        }, 3);

        it('should add non admin user in group and check that he can`t add user in group', () => {
            allure.addTestId('2308');
            allure.addSeverity('critical');
            tableChecks
                .expectAddUserBtnIsNotDisplayed();
        });

        after(async () => {
            await backend.removeEntity(newGroup.id);
        }, 3);
    });

    after(async () => {
        await backend.removeEntity(backend.newProjectId);
    }, 3);
});
