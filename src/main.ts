import { App } from "./app";
import { HtmlBuilder } from "./html";

(function init() {
    const main = document.querySelector('main');

    if (main) {
        const dataElement = document.createElement('section');
        dataElement.id = 'data';

        const primaryColorsElement = document.createElement('section');
        primaryColorsElement.dataset[HtmlBuilder.COLORS_DATA_NAME] = HtmlBuilder.COLORS_DATA_PRIMARY;

        const complementaryColorsElement = document.createElement('section');
        complementaryColorsElement.dataset[HtmlBuilder.COLORS_DATA_NAME] = HtmlBuilder.COLORS_DATA_COMPLEMENTARY;

        const analogous1ColorsElement = document.createElement('section');
        analogous1ColorsElement.dataset[HtmlBuilder.COLORS_DATA_NAME] = HtmlBuilder.COLORS_DATA_ANALOGOUS1;

        const analogous2ColorsElement = document.createElement('section');
        analogous2ColorsElement.dataset[HtmlBuilder.COLORS_DATA_NAME] = HtmlBuilder.COLORS_DATA_ANALOGOUS2;

        const triad1ColorsElement = document.createElement('section');
        triad1ColorsElement.dataset[HtmlBuilder.COLORS_DATA_NAME] = HtmlBuilder.COLORS_DATA_TRIAD1;

        const triad2ColorsElement = document.createElement('section');
        triad2ColorsElement.dataset[HtmlBuilder.COLORS_DATA_NAME] = HtmlBuilder.COLORS_DATA_TRIAD2;

        const app = App
        .configure()
        .withLogging(true)
        .addInputTo(dataElement)
        .addColorsTo(primaryColorsElement, 'Primary')
        .addColorsTo(complementaryColorsElement, 'Complementary')
        .addColorsTo(analogous1ColorsElement, 'Analogous 1')
        .addColorsTo(analogous2ColorsElement, 'Analogous 2')
        .addColorsTo(triad1ColorsElement, 'Triad 1')
        .addColorsTo(triad2ColorsElement, 'Triad 2');

        main.appendChild(dataElement);
        main.appendChild(primaryColorsElement);
        main.appendChild(complementaryColorsElement);
        main.appendChild(analogous1ColorsElement);
        main.appendChild(analogous2ColorsElement);
        main.appendChild(triad1ColorsElement);
        main.appendChild(triad2ColorsElement);

        app.start();
    } else {
        console.error('main element not found in index.html');
    }
})();