import {config as wdioConfig} from 'wdio.conf';
import 'app/libs/commands';
import CanvasSteps from 'app/libs/steps/canvas.steps';
import LoginSteps from 'app/libs/steps/login.steps';
import CanvasChecks from 'app/libs/expects/canvas.expect';
import IngiproBackendClient from 'app/libs/handles/ingiproBackendClient';
import allure from '@wdio/allure-reporter';

let loginSteps = new LoginSteps('0');
let canvasSteps = new CanvasSteps('0');
let canvasChecks = new CanvasChecks();
let backend = new IngiproBackendClient();

describe('2D Canvas :', () => {

    before(async () => {
        await backend.auth(wdioConfig.users.homerSimpson);
        await backend.createProject('linkDecorTestsProject');
    }, 3);

    describe('Link Decor : Link creation/redirect/tooltip in comment\'s, tests', () => {

        before(() =>{
            loginSteps.login(wdioConfig.users.homerSimpson);
        }, 3);

        beforeEach(async () => {
            await backend.createNode(backend.newProjectId, 'linkDecorTests');
        }, 3);

        beforeEach(() => {
            canvasSteps
                .openCanvas(backend.newNodeId, backend.newVersionId);
        }, 3);

        let webSiteTooltipCases = [
            {args: ['www.github.com'], expected: 'www.github.com'},
            {args: ['https://github.com'], expected: 'https://github.com'},
            {args: ['http://github.com'], expected: 'http://github.com'},
            {args: ['https://www.github.com'], expected: 'https://www.github.com'},
            {args: ['Здароваwww.github.com darova'], expected: 'www.github.com'},
            {args: [wdioConfig.baseUrl], expected: wdioConfig.baseUrl},
            {args: ['http://www.example.com/%D0%BF%D0%B8%D0%BD%D0%B3%D0%B2%D0%B8%D0%BD'], expected: 'http://www.example.com/%D0%BF%D0%B8%D0%BD%D0%B3%D0%B2%D0%B8%D0%BD'},
            {args: ['http://www.example.com/пингвин'], expected: 'http://www.example.com/пингвин'},
            {args: ['http://www.example.com/düsseldorf?neighbourhood=Lörick'], expected: 'http://www.example.com/düsseldorf?neighbourhood=Lörick'},
            {args: ['https://мвд.рф'], expected: 'https://мвд.рф'},
        ];

        webSiteTooltipCases.forEach((test) => {
            allure.addTestId('13577');
            allure.addSeverity('medium');
            it(`should write "${test.args}" in comment and check it`, () => {
                canvasSteps
                    .chooseTool('Карандаш')
                    .drawLine()
                    .writeComment(test.args);
                canvasChecks
                    .expectLinkTooltip(test.expected);
            });
        });

        let webSiteRedirectCases = [
            {args: ['www.github.com'], expected: 'https://github.com/'},
            {args: ['https://github.com'], expected: 'https://github.com/'},
            {args: ['https://www.github.com'], expected: 'https://github.com/'},
            {args: [`http://${wdioConfig.ecosystemUrl}`], expected: `https://${wdioConfig.ecosystemUrl}`},
            {args: ['http://президент.рф'], expected: 'http://kremlin.ru'},
            {args: [`https://${wdioConfig.ecosystemUrl}`], expected: `https://${wdioConfig.ecosystemUrl}/`},
        ];

        webSiteRedirectCases.forEach((test) => {
            allure.addIssue('FRONTEND-2503');
            allure.addTestId('13578');
            allure.addSeverity('critical');
            it(`should open "${test.args}" in another tab and check URL`, () => {
                canvasSteps
                    .chooseTool('Карандаш')
                    .drawLine()
                    .writeComment(test.args)
                    .clickLinkTooltip();
                canvasChecks
                    .expectUrlInNextTab(test.expected);
            });
        });

        it('should check bug,about br tag between links', () => {
            allure.addTestId('13579');
            allure.addSeverity('minor');
            canvasSteps
                .chooseTool('Карандаш')
                .drawLine()
                .writeComment('www.vk.com\n');
            canvasChecks
                .expectBrTagIsNotDisplayed();
        });
    });

    after(async () => {
        await backend.removeEntity(backend.newProjectId);
    }, 3);
});
