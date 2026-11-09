import { Plugin } from 'obsidian';
import { SettingsManager } from '../settings-manager';
import { CustomFrontmatterField } from '../../types/settings';

async function loadFields(customFrontmatterFields: CustomFrontmatterField[]): Promise<CustomFrontmatterField[]> {
    const plugin = { loadData: async () => ({ customFrontmatterFields }) } as unknown as Plugin;
    return (await new SettingsManager(plugin).loadSettings()).customFrontmatterFields;
}

describe('SettingsManager.loadSettings related field migration (issue #53)', () => {
    it('replaces the old default related template and keeps the enabled flag', async () => {
        expect(await loadFields([{ name: 'related', template: '[{{links}}]', enabled: false }]))
            .toEqual([{ name: 'related', template: '{{links|json}}', enabled: false }]);
    });

    it('keeps a customized related template', async () => {
        const custom = { name: 'related', template: '[{{links_string}}]', enabled: true };

        expect(await loadFields([custom])).toEqual([custom]);
    });

    it('only migrates the field named related', async () => {
        const other = { name: 'see-also', template: '[{{links}}]', enabled: true };

        expect(await loadFields([other])).toEqual([other]);
    });
});
