import { StringLiteral } from "@babel/types";
import { MapLike } from "typescript";
import TSConfig from "@main/interfaces/TSConfig";
import AliasesData from "@main/interfaces/AliasesData";
export default class ConfigCompiler {
    protected target: string;
    protected workSpace: string;
    constructor(target: string, workSpace: string);
    compile(source: StringLiteral, tsConfig: TSConfig): void;
    isInScope(tsConfig: TSConfig): boolean;
    checkRoots(tsConfig: TSConfig): boolean;
    protected createRelativeSourcePath(target: string, reference: string): string;
    getIncludes(tsConfig: TSConfig): Array<string> | null;
    getBaseURL(tsConfig: TSConfig): string | null;
    getPaths(tsConfig: TSConfig): MapLike<Array<string>> | null;
    protected getAliasesData(tsConfig: TSConfig): AliasesData;
    protected matchPatterns(path: string): boolean;
    get rel(): string;
}
