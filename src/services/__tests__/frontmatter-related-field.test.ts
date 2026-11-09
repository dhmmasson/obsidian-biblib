import { DEFAULT_SETTINGS } from '../../types/settings';
import { FrontmatterBuilderService } from '../frontmatter-builder-service';
import { TemplateVariableBuilderService } from '../template-variable-builder-service';

// Return the frontmatter as JSON so the test can read it back as an object
jest.mock('obsidian', () => ({ ...jest.requireActual('obsidian'), stringifyYaml: JSON.stringify }));

describe('Default related custom field (issue #53)', () => {
    const builder = new FrontmatterBuilderService(new TemplateVariableBuilderService());

    async function relatedFor(relatedNotePaths: string[]): Promise<unknown> {
        const frontmatter = await builder.buildYamlFrontmatter({
            citation: { id: 'smith2020', type: 'article-journal', title: 'Deep Things' },
            contributors: [],
            additionalFields: [],
            attachmentPaths: [],
            pluginSettings: DEFAULT_SETTINGS,
            relatedNotePaths,
        });
        return (JSON.parse(frontmatter) as { related?: unknown }).related;
    }

    it('writes an empty list when there are no related notes', async () => {
        expect(await relatedFor([])).toEqual([]);
    });

    it('writes related notes as a flat list of links', async () => {
        expect(await relatedFor(['Notes/A.md', 'B.md'])).toEqual(['[[Notes/A.md]]', '[[B.md]]']);
    });

    it('keeps commas and quotes in note names', async () => {
        // The loop form [{{#links}}{{.}},{{/links}}] would split "Smith, 2020" in two
        expect(await relatedFor(['Smith, 2020.md', 'Say "hi".md'])).toEqual(['[[Smith, 2020.md]]', '[[Say "hi".md]]']);
    });
});
