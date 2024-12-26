import { expect, it, describe, beforeEach } from "bun:test";
import { Palette } from "./palette";
import { Logger } from "./logger";

describe('Color palette', () => {
    const seedColor = '#BA7542';
    const complementary = '#458ABDFF';

    let target: Palette;

    Logger.enableLogging = false;

    beforeEach(() => {
        target = Palette.forSeedAndPrefix(seedColor).generate();
    });

    it('provides complementary color', () => {
        expect(target.complementary).toBe(complementary);
    });

    describe('Light colors', () => {
        it('generates baseline', () => {
            expect(target.baseline).toBe('#A3673AFF');
        });
    
        it('generates canvas', () => {
            expect(target.canvas).toBe('#FAF5F1FF');
        });
    
        it('generates accent', () => {
            expect(target.accent).toBe('#724829FF');
        });
    
        it('generates accent subdued', () => {
            expect(target.accent_subdued).toBe('#724829CC');
        });
    
        it('generates neutral', () => {
            expect(target.neutral).toBe('#2B1B0FFF');
        });
    
        it('generates neutral subdued', () => {
            expect(target.neutral_subdued).toBe('#2B1B0F9C');
        });
    });
    describe('Dark colors', () => {
        it('generates baseline', () => {
            expect(target.dark_baseline).toBe('#92694BFF');
        });
    
        it('generates canvas', () => {
            expect(target.dark_canvas).toBe('#2B1B0FFF');
        });
    
        it('generates accent', () => {
            expect(target.dark_accent).toBe('#B99276FF');
        });
    
        it('generates accent subdued', () => {
            expect(target.dark_accent_subdued).toBe('#B99276D4');
        });
    
        it('generates neutral', () => {
            expect(target.dark_neutral).toBe('#EBE0D8FF');
        });
    
        it('generates neutral subdued', () => {
            expect(target.dark_neutral_subdued).toBe('#EBE0D885');
        });
    });
});