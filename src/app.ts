import { HtmlBuilder } from "./html";
import { Logger, LogGroup } from "./logger";
import { Palette } from "./palette";

export class App {
    private static readonly registeredPalettes: Record<string, Palette> = {};
    private static activeTab = HtmlBuilder.COLORS_DATA_PRIMARY;

    private constructor() {}

    public static configure(): App {
        return new App;
    }

    public withLogging(enable = true): App {
        Logger.enableLogging = false;

        return this;
    }

    public addInputTo(element: HTMLElement): App {
        HtmlBuilder.withElement(element).addSeedColorInput(this.onColorChange);

        const darkModeToggler = document.createElement('button');
        darkModeToggler.innerText = 'Toggle dark mode';
        darkModeToggler.addEventListener('click', () => document.documentElement.classList.toggle('dark'));

        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) { document.documentElement.classList.add('dark'); }

        element.appendChild(darkModeToggler);

        return this;
    }

    public addColorsTo(element: HTMLElement, title: string): App {
        element.classList.add('palette');

        HtmlBuilder.withElement(element).addColors(Palette.COLORS, title);

        return this;
    }

    public start() {
        this.tabify();

        this.onColorChange('#000000');

        Logger.log('App started')
    }

    @LogGroup()
    private onColorChange(color: string): void {
        Logger.log('Color changed to', color);

        const primaryPalette = Palette.forSeedAndPrefix(color).generate();
        const complementaryPalette = Palette.forSeedAndPrefix(primaryPalette.complementary).generate();
        const analogous1Palette = Palette.forSeedAndPrefix(primaryPalette.analogous1).generate();
        const analogous2Palette = Palette.forSeedAndPrefix(primaryPalette.analogous2).generate();
        const triad1Palette = Palette.forSeedAndPrefix(primaryPalette.triad1).generate();
        const triad2Palette = Palette.forSeedAndPrefix(primaryPalette.triad2).generate();

        App.registeredPalettes[HtmlBuilder.COLORS_DATA_PRIMARY] = primaryPalette;
        App.registeredPalettes[HtmlBuilder.COLORS_DATA_COMPLEMENTARY] = complementaryPalette;
        App.registeredPalettes[HtmlBuilder.COLORS_DATA_ANALOGOUS1] = analogous1Palette;
        App.registeredPalettes[HtmlBuilder.COLORS_DATA_ANALOGOUS2] = analogous2Palette;
        App.registeredPalettes[HtmlBuilder.COLORS_DATA_TRIAD1] = triad1Palette;
        App.registeredPalettes[HtmlBuilder.COLORS_DATA_TRIAD2] = triad2Palette;

        App.paletteToElements(primaryPalette, HtmlBuilder.COLORS_DATA_PRIMARY);
        App.paletteToElements(complementaryPalette, HtmlBuilder.COLORS_DATA_COMPLEMENTARY);
        App.paletteToElements(analogous1Palette, HtmlBuilder.COLORS_DATA_ANALOGOUS1);
        App.paletteToElements(analogous2Palette, HtmlBuilder.COLORS_DATA_ANALOGOUS2);
        App.paletteToElements(triad1Palette, HtmlBuilder.COLORS_DATA_TRIAD1);
        App.paletteToElements(triad2Palette, HtmlBuilder.COLORS_DATA_TRIAD2);

        App.updateCssPaletteProperties(App.registeredPalettes[App.activeTab]);

        Logger.groupEnd();
    }

    private static paletteToElements(palette: Palette, paletteData: string) {
        Logger.group('Updating color elements ...');

        const elementSelector = `[data-${HtmlBuilder.COLORS_DATA_NAME}="${paletteData}"]`;
        const paletteElement = document.querySelector(elementSelector);

        if (!paletteElement) throw new Error(`Palette element with ${elementSelector} attribute not found.`);

        Palette.COLORS.forEach(next => {
            const colorElement = paletteElement.querySelector(`#${next}`);

            if (!colorElement) throw new Error(`Color element with ID #${next} not found.`);

            Logger.log('color element found', colorElement);

            const colorNameElement = colorElement.querySelector(`.${HtmlBuilder.COLORS_NAME_ELEMENT_CSS_CLASS}`) as HTMLElement;
            const swatchElement = colorElement.querySelector(`.${HtmlBuilder.COLORS_SWATCH_ELEMENT_CSS_CLASS}`) as HTMLElement;
            const colorStringElement = colorElement.querySelector(`.${HtmlBuilder.COLORS_STRING_ELEMENT_CSS_CLASS}`) as HTMLElement;

            if (!colorNameElement || !swatchElement || !colorStringElement) throw new Error('Swatch, color name and/or color string element(s) not found.');

            const paletteColor = palette[next] as string;
            let alpha = paletteColor.substring(7, 9);

            const withoutAlpha = paletteColor.substring(0, 7);
            const alphaPercent = (parseFloat((parseInt(alpha, 16) / 255).toFixed(4)) * 100).toFixed(2) + '%';

            Logger.log('palette color determined', paletteColor);

            swatchElement.style.backgroundColor = paletteColor;
            colorStringElement.innerText = alpha === 'FF' ? withoutAlpha : `${withoutAlpha} at ${alphaPercent}`;
        });
    }

    private tabify(): void {
        const palettes = document.querySelectorAll(`[data-${HtmlBuilder.COLORS_DATA_NAME}]`);

        palettes.forEach(next => {
            const element = next as HTMLElement;

            if (element.dataset[HtmlBuilder.COLORS_DATA_NAME] === App.activeTab)
                element.classList.add('active');
            else
                element.classList.remove('active');
            
        });

        const tabsContainer = this.searchTabsContainer();

        const tabs = tabsContainer.querySelectorAll('.tab');

        tabs.forEach(next => this.registerTabEvent(next as HTMLElement));
    }

    private searchTabsContainer(): HTMLElement {
        let tabs = document.querySelector('#tabs');

        if (tabs) return tabs as HTMLElement;

        const palettes = document.querySelectorAll(`[data-${HtmlBuilder.COLORS_DATA_NAME}]`);

        if (palettes.length === 0) throw new Error('No palettes found.');

        tabs = this.generateTabs(palettes);

        return tabs as HTMLElement;
    }

    private generateTabs(palettes: NodeListOf<Element>): HTMLElement {
        const container = document.createElement('nav');
        container.id = 'tabs';

        const tabList = document.createElement('ul');

        palettes.forEach(next => {
            const element = next as HTMLElement;
            const name = element.dataset[HtmlBuilder.COLORS_DATA_NAME];
            const tab = document.createElement('li');
            const header = element.querySelector('h2');
            const title = header?.innerText;

            tab.innerText = title || 'No header h2 set';

            tab.dataset.tabFor = name;

            tab.classList.add('tab');

            if (name === App.activeTab)
                tab.classList.add('active');

            tabList.appendChild(tab);
        });

        container.appendChild(tabList);

        palettes[0].parentNode?.insertBefore(container, palettes[0]);

        return container;
    }

    private registerTabEvent(tab: HTMLElement): void {
        tab.addEventListener('click', event => this.onTabClick(event.target as HTMLElement))
    }

    private onTabClick(tab: HTMLElement): any {
        const tabs = this.searchTabsContainer().querySelectorAll('.tab');
        let activePalette = tab.dataset.tabFor || '';

        tabs.forEach(next => {
            const element = next as HTMLElement;

            if (activePalette === element.dataset.tabFor)
                element.classList.add('active');
            else
                element.classList.remove('active');

        });

        const paletteElements = document.querySelectorAll(`[data-${HtmlBuilder.COLORS_DATA_NAME}]`);

        paletteElements.forEach(next => {
            const element = next as HTMLElement;

            if (activePalette === element.dataset.palette) {
                element.classList.add('active');

                App.updateCssPaletteProperties(App.registeredPalettes[activePalette])
            } else {
                element.classList.remove('active');
            }
        });

        App.activeTab = activePalette;
    }

    private static updateCssPaletteProperties(palette: Palette) {
        let defaultCss = '';
        let darkCss = '';
        
        Palette.COLORS.filter(next => !next.includes('dark')).forEach(next => {
            const color = palette[next] as string;

            defaultCss += `--color-${next.replaceAll('_', '-')}: ${color};`;
        });

        Palette.COLORS.filter(next => next.includes('dark')).forEach(next => {
            const color = palette[next] as string;

            darkCss += `--color-${next.replace('dark_', '').replaceAll('_', '-')}: ${color};`;
        });

        const css = `
            :root {
                ${defaultCss}
            }

            .dark {
                ${darkCss}
            }
        `;

        const style = document.createElement('style');

        style.appendChild(document.createTextNode(css));

        document.head.appendChild(style);
    }
}