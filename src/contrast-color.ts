import { Logger, LogGroup } from "./logger";
import Color from "color";

export class ContrastColor {
    public static readonly HEX_PATTERN = /^#?([a-f0-9]{6})([a-f0-9]{2})?$/i;

    public static validateHex(hex: string): boolean {
        return this.HEX_PATTERN.test(hex);
    }

    @LogGroup()
    public static generateByLightness(options: ContrastColorByLightnessOptions): string {
        Logger.log('Options', options);

        let foregroundColor = Color(options.foregroundColor);
        const backgroundColor = Color(options.backgroundColor);

        Logger.log('Converted foreground & background colors', foregroundColor, backgroundColor);

        let contrastRatio = this.calculateContrastRatio(foregroundColor, backgroundColor);
        options.increaseLightness = options.increaseLightness || contrastRatio > options.requiredContrastRatio;

        Logger.log('initial contrastRatio', contrastRatio);
        Logger.group('Color search');

        let contrastRatioCheck = contrastRatio;

        while (this.hasColorFound(contrastRatio, options.requiredContrastRatio, options.increaseRatio) === false) {
            const lightness = foregroundColor.lightness();
            const nextLightness = options.increaseLightness ? lightness + 1 : lightness - 1;

            if (nextLightness > 100 || nextLightness < 0) {
                options.increaseLightness = !options.increaseLightness;
                continue;
            }

            foregroundColor = foregroundColor.lightness(nextLightness);
            contrastRatio = this.calculateContrastRatio(foregroundColor, backgroundColor);

            if (contrastRatioCheck === contrastRatio) {
                Logger.warn('Contrast ratio did not change.', options, contrastRatio, foregroundColor);
                break;
            }

            contrastRatioCheck = contrastRatio;

            Logger.log('Next ratio', contrastRatio);
        }

        Logger.groupEnd();

        const result = foregroundColor.hexa();

        Logger.log('Color found', result);

        return result;
    }

    @LogGroup()
    public static generateByAlpha(options: ContrastColorByAlphaOptions): string {
        Logger.log('Options', options);

        let foregroundColor = Color(options.foregroundColor);
        const backgroundColor = Color(options.backgroundColor);

        Logger.log('Converted foreground & background colors', foregroundColor, backgroundColor);

        let contrastRatio = this.calculateContrastRatio(foregroundColor, backgroundColor);
        let contrastRatioCheck = contrastRatio;
        const increaseRatio = contrastRatio < options.requiredContrastRatio;

        Logger.log('initial contrastRatio', contrastRatio);
        Logger.group('Color search');
        
        while (this.hasColorFound(contrastRatio, options.requiredContrastRatio, increaseRatio) === false) {
            const alpha = foregroundColor.alpha();
            const nextAlpha = alpha - 0.01;
            
            foregroundColor = foregroundColor.alpha(nextAlpha);
            contrastRatio = this.calculateContrastRatio(foregroundColor, backgroundColor);

            if (contrastRatioCheck === contrastRatio) {
                Logger.warn('Contrast ratio did not change.', options, contrastRatio, foregroundColor);
                break;
            }

            contrastRatioCheck = contrastRatio;

            Logger.log('Next ratio', contrastRatio);
        }

        Logger.groupEnd();

        const result = foregroundColor.hexa();

        Logger.log('Color found', result);

        return result;
    }

    @LogGroup()
    private static calculateContrastRatio(foreground: Color, background: Color): number {
        const color1 = this.blendWithBackground(foreground, background);
        const color2 = this.blendWithBackground(background, background);
        
        const result = color1.contrast(color2);
        
        Logger.log('final contrast', result);

        return result;
    }

    private static hasColorFound(ratio: number, requiredRatio: number, increase?: boolean): boolean {
        return increase ? ratio >= requiredRatio : ratio <= requiredRatio;
    }

    private static blendWithBackground(color: Color, background: Color): Color {
        const alpha = color.alpha();
        const bgAlpha = background.alpha();

        const blended = color.rgb().array().map((channel, i) => {
            return Math.round(channel * alpha + background.rgb().array()[i] * (1 - alpha));
        });

        return Color.rgb(blended).alpha(bgAlpha);
    }
}

export interface ContrastColorByLightnessOptions {
    foregroundColor: string;
    backgroundColor: string;
    requiredContrastRatio: number;
    increaseRatio?: boolean;
    increaseLightness?: boolean;
}

export interface ContrastColorByAlphaOptions {
    foregroundColor: string;
    backgroundColor: string;
    requiredContrastRatio: number;
}