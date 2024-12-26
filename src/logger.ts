export class Logger {
    public static enableLogging = true;

    public static group(title: string): void {
        if (this.enableLogging) console.groupCollapsed(title);
    }

    public static groupEnd(): void {
        if (this.enableLogging) console.groupEnd();
    }

    public static log(...params: any[]): void;
    public static log(message?: any, ...params: any[]): void

    public static log(message?: any, ...params: any[]): void {
        if (!this.enableLogging) return;

        const time = new Date().toLocaleTimeString();

        if (message) console.log(`${time} ${message}`, ...params);
        else console.log(time, ...params);
    }

    public static warn(message: string, ...params: any[]): void {
        console.warn(message, ...params);
    }
}

//#region Decorator

export function LogGroup(title?: string) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const className = title ?? target.name ?? target.prototype?.name ?? target.constructor.name;
        const name = `${className}::${propertyKey}()`;
        
        const originalMethod = descriptor.value;

        descriptor.value = function (...args: any[]) {
            Logger.group(name);

            const result = originalMethod.apply(this, args);

            Logger.groupEnd();

            return result;
        }

        return descriptor;
    }
}

//#endregion