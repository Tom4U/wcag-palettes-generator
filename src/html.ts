import { ContrastColor } from "./contrast-color";

export class HtmlBuilder {
    public static readonly COLORS_ELEMENT_CSS_CLASS = 'color-group';
    public static readonly COLORS_SWATCH_ELEMENT_CSS_CLASS = 'swatch';
    public static readonly COLORS_STRING_ELEMENT_CSS_CLASS = 'color-string';
    public static readonly COLORS_NAME_ELEMENT_CSS_CLASS = 'color-name';
    public static readonly COLORS_DATA_NAME = 'palette';
    public static readonly COLORS_DATA_PRIMARY = 'primary';
    public static readonly COLORS_DATA_COMPLEMENTARY = 'complementary';
    public static readonly COLORS_DATA_ANALOGOUS1 = 'analogous1';
    public static readonly COLORS_DATA_ANALOGOUS2 = 'analogous2';
    public static readonly COLORS_DATA_TRIAD1 = 'triad1';
    public static readonly COLORS_DATA_TRIAD2 = 'triad2';

    private element!: HTMLElement;

    private constructor() {}

    public static withElement(element: HTMLElement): HtmlBuilder {
        if (!element) throw new Error('Element not provided');
        
        const result = new HtmlBuilder;

        result.element = element;

        return result;
    }

    public addSeedColorInput(onChange: (color: string) => void): void {
        const label = document.createElement('label');
        const seedColorInput = document.createElement('input');
        const seedColorValue = document.createElement('input');

        label.innerText = 'Seed color'

        seedColorInput.addEventListener('input', event => this.onColorChange(event.target as HTMLInputElement, seedColorValue, onChange));
        seedColorValue.addEventListener('input', event => this.onColorChange(event.target as HTMLInputElement, seedColorInput, onChange));

        seedColorInput.id = 'seed-color';
        seedColorInput.type = 'color';

        seedColorValue.id = 'seed-color-value';
        seedColorValue.type = 'text';
        seedColorValue.value = seedColorInput.value;

        this.element.appendChild(label);
        this.element.appendChild(seedColorInput);
        this.element.appendChild(seedColorValue);
    }

    public addColors(colors: string[], title = 'Colors'): void {
        const h2 = document.createElement('h2');
        h2.innerText = title;
        this.element.appendChild(h2);

        const lightColors = colors.filter(next => !next.startsWith('dark_'));
        const darkColors = colors.filter(next => next.startsWith('dark_'));

        const lightElement = document.createElement('div');
        const darkElement = document.createElement('div');
        const colorsElement = document.createElement('div');

        colorsElement.className = 'colors-group-container';

        lightColors.forEach(next => {
            const div = this.createColorsGroupElement(next);

            lightElement.appendChild(div);
        });

        darkColors.forEach(next => {
            const div = this.createColorsGroupElement(next);

            darkElement.appendChild(div);
        });

        colorsElement.appendChild(lightElement);
        colorsElement.appendChild(darkElement);

        this.element.appendChild(colorsElement);
    }

    private onColorChange(input: HTMLInputElement, syncElement: HTMLInputElement, callback: (color: string) => void): void {
        const color = input.value;
            
            if (!ContrastColor.validateHex(color)) return;

            syncElement.value = color

            callback(color);
    }

    private createColorsGroupElement(colorName: string): HTMLElement {
        const name = `${colorName.charAt(0).toUpperCase()}${colorName.substring(1).replace(/_/g, ' ')}`;
        const div = document.createElement('div');
        div.className = HtmlBuilder.COLORS_ELEMENT_CSS_CLASS;

        const p = document.createElement('p');
        const textSpan = document.createElement('span');
        p.id = colorName;
        textSpan.className = HtmlBuilder.COLORS_NAME_ELEMENT_CSS_CLASS;
        textSpan.innerText = name;

        const swatchSpan = document.createElement('span');
        swatchSpan.className = HtmlBuilder.COLORS_SWATCH_ELEMENT_CSS_CLASS;

        const colorStringSpan = document.createElement('span');
        colorStringSpan.className = HtmlBuilder.COLORS_STRING_ELEMENT_CSS_CLASS;

        p.appendChild(swatchSpan);
        p.appendChild(textSpan);
        p.appendChild(colorStringSpan);

        div.appendChild(p);
        return div;
    }
}