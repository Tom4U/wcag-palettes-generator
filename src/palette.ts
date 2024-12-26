import Color from "color";
import { ContrastColor } from "./contrast-color";
import { Logger, LogGroup } from "./logger";
import { WCAG_Score } from "./wcag-score";

export class Palette {
    public static readonly COLORS: (keyof Palette)[] = ['baseline', 'canvas', 'accent', 'accent_subdued', 'neutral', 'neutral_subdued', 'dark_baseline', 'dark_canvas', 'dark_accent', 'dark_accent_subdued', 'dark_neutral', 'dark_neutral_subdued'];
    
    private static readonly WHITE = '#FFFFFFFF';
    private static readonly BLACK = '#00000000';

    private _baseline = Palette.WHITE;
    private _canvas = Palette.WHITE;
    private _accent = Palette.WHITE;
    private _accent_subdued = Palette.WHITE;
    private _neutral = Palette.WHITE;
    private _neutral_subdued = Palette.WHITE;
    private _dark_baseline = Palette.BLACK;
    private _dark_accent = Palette.BLACK;
    private _dark_accent_subdued = Palette.BLACK;
    private _dark_neutral = Palette.BLACK;
    private _dark_neutral_subdued = Palette.BLACK;

    private constructor(private _seedColor: string) {
        if (!ContrastColor.validateHex(_seedColor)) throw new Error('Invalid seed color format. Hex format expected.');
    }

    public static forSeedAndPrefix(seed: string): Palette {
        const palette = new Palette(seed);

        Logger.log('Seed color', seed);

        return palette;
    }

    @LogGroup()
    public generate(): Palette {
        this.generateBaseline();
        this.generateCanvas();
        this.generateAccent();
        this.generateAccentSubdued();
        this.generateNeutral();
        this.generateNeutralSubdued();
        this.generateDarkBaseline();
        this.generateDarkAccent();
        this.generateDarkAccentSubdued();
        this.generateDarkNeutral();
        this.generateDarkNeutralSubdued();

        return new Proxy(this, {
            get(target, property: string) {
                if (property in target) {
                    return (target as any)[property];
                } else {
                    const getter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(target), property);

                    if(getter && typeof getter.get === 'function') {
                        return getter.get.call(target);
                    }
                }

                return undefined;
            }
        });
    }

    private generateBaseline(): void {
        const baseline = ContrastColor.generateByLightness({
            foregroundColor: this._seedColor,
            backgroundColor: Palette.WHITE,
            increaseRatio: true,
            requiredContrastRatio: WCAG_Score.AA
        });

        Logger.log('Baseline color', baseline);

        this._baseline = baseline;
    }

    private generateCanvas(): void {
        const canvas = ContrastColor.generateByLightness({
            foregroundColor: this.baseline,
            backgroundColor: Palette.WHITE,
            increaseRatio: false,
            requiredContrastRatio: 1.1
        });

        Logger.log('Canvas color', canvas);

        this._canvas = canvas;
    }

    private generateAccent(): void {
        const accent = ContrastColor.generateByLightness({
            foregroundColor: this.baseline,
            backgroundColor: this.baseline,
            increaseRatio: true,
            requiredContrastRatio: 1.7
        });

        Logger.log('Accent color', accent);

        this._accent = accent;
    }

    private generateAccentSubdued(): void {
        const accentSubdued = ContrastColor.generateByAlpha({
            foregroundColor: this.accent,
            backgroundColor: this.canvas,
            requiredContrastRatio: WCAG_Score.AA
        });

        Logger.log('Accent subdued color', accentSubdued);

        this._accent_subdued = accentSubdued;
    }

    private generateNeutral(): void {
        const neutral = ContrastColor.generateByLightness({
            foregroundColor: this.accent,
            backgroundColor: Palette.BLACK,
            increaseRatio: false,
            requiredContrastRatio: 1.3
        });

        Logger.log('Neutral color', neutral);

        this._neutral = neutral;
    }

    private generateNeutralSubdued(): void {
        const neutralSubdued = ContrastColor.generateByAlpha({
            foregroundColor: this.neutral,
            backgroundColor: this.canvas,
            requiredContrastRatio: WCAG_Score.AA
        });

        Logger.log('Neutral subdued color', neutralSubdued);

        this._neutral_subdued = neutralSubdued;
    }

    private generateDarkBaseline(): void {
        const darkBaselineInitial = Color(this.baseline).desaturate(0.33);
        const darkBaseline = ContrastColor.generateByLightness({
            foregroundColor: darkBaselineInitial.hex(),
            backgroundColor: Palette.BLACK,
            requiredContrastRatio: WCAG_Score.AA,
            increaseLightness: false
        });

        Logger.log('Dark baseline color', darkBaseline);

        this._dark_baseline = darkBaseline;
    }

    private generateDarkAccent(): void {
        const darkAccent = ContrastColor.generateByLightness({
            foregroundColor: this.dark_baseline,
            backgroundColor: this.dark_baseline,
            requiredContrastRatio: 1.7,
            increaseRatio: true,
            increaseLightness: true
        });

        Logger.log('Dark accent color', darkAccent);

        this._dark_accent = darkAccent;
    }

    private generateDarkAccentSubdued(): void {
        const accentSubdued = ContrastColor.generateByAlpha({
            foregroundColor: this.dark_accent,
            backgroundColor: this.dark_canvas,
            requiredContrastRatio: WCAG_Score.AA
        });

        Logger.log('Dark accent subdued color', accentSubdued);

        this._dark_accent_subdued = accentSubdued;
    }

    private generateDarkNeutral(): void {
        const neutral = ContrastColor.generateByLightness({
            foregroundColor: this.dark_accent,
            backgroundColor: Palette.WHITE,
            increaseRatio: false,
            requiredContrastRatio: 1.3
        });

        Logger.log('Dark neutral color', neutral);

        this._dark_neutral = neutral;
    }

    private generateDarkNeutralSubdued(): void {
        const neutralSubdued = ContrastColor.generateByAlpha({
            foregroundColor: this.dark_neutral,
            backgroundColor: this.dark_canvas,
            requiredContrastRatio: WCAG_Score.AA
        });

        Logger.log('Dark neutral subdued color', neutralSubdued);

        this._dark_neutral_subdued = neutralSubdued;
    }

    public get baseline() { return this._baseline; }
    public get canvas() { return this._canvas; }
    public get accent() { return this._accent; }
    public get accent_subdued() { return this._accent_subdued; }
    public get neutral() { return this._neutral; }
    public get neutral_subdued() { return this._neutral_subdued; }
    public get dark_baseline() { return this._dark_baseline; }
    public get dark_canvas() { return this.neutral; }
    public get dark_accent() { return this._dark_accent; }
    public get dark_accent_subdued() { return this._dark_accent_subdued; }
    public get dark_neutral() { return this._dark_neutral; }
    public get dark_neutral_subdued() { return this._dark_neutral_subdued; }
    
    public get complementary() { 
        let {r, g, b} = Color(this._seedColor).object();

        r = 255 - r;
        g = 255 - g;
        b = 255 - b

        return Color([r, g, b]).hexa();
     }

    public get analogous1() { 
        return Color(this._seedColor).rotate(30).hexa();
    }

    public get analogous2() { 
        return Color(this._seedColor).rotate(-30).hexa();
    }

    public get triad1() {
        return Color(this._seedColor).rotate(120).hexa();
    }

    public get triad2() {
        return Color(this._seedColor).rotate(240).hexa();
    }
}