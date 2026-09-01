import { resolve, relative, isAbsolute, dirname, parse, format } from "path"
import { globSync } from "glob"
import { StringLiteral } from "@babel/types"
import { MapLike } from "typescript"
import rootPath from "../hooks/rootPath"
import TSConfig from "../interfaces/TSConfig"
import AliasesData from "../interfaces/AliasesData"


export default class ConfigCompiler
{
    protected target: string

    protected workSpace: string

    public constructor(target: string, workSpace: string)
    {
        this.target = target
        this.workSpace = workSpace
    }

    public compile(source: StringLiteral, tsConfig: TSConfig): void
    {
        if (!this.isInScope(tsConfig)) {
            return
        }

        const { baseUrl, paths } = this.getAliasesData(tsConfig)

        if (!baseUrl || !paths) {
            return
        }

        for (const alias in paths) {
            const patterns = paths[alias]

            patterns.forEach(pattern => {
                const root = resolve(this.workSpace, baseUrl, rootPath(pattern))
                const reference = source.value.replace(new RegExp(`^${rootPath(alias)}`), root)

                if (isAbsolute(reference)) {
                    source.value = this.createRelativeSourcePath(this.target, reference)
                }
            })
        }
    }

    public isInScope(tsConfig: TSConfig): boolean
    {
        const includes = this.getIncludes(tsConfig)
        if (!includes) {
            return false
        }

        for (const include of includes) {
            const scope = resolve(this.workSpace, include)

            if (this.matchPatterns(scope)) {
                return this.checkRoots(tsConfig)
            }
        }

        return false
    }

    public checkRoots(tsConfig: TSConfig): boolean
    {
        if (!tsConfig.compilerOptions) {
            return true
        }

        const { rootDir, rootDirs } = tsConfig.compilerOptions

        if (rootDir) {
            const scope = resolve(this.workSpace, rootDir)
            return this.matchPatterns(scope)
        }

        if (!rootDirs) {
            return true
        }

        for (const dir of rootDirs) {
            const scope = resolve(this.workSpace, dir)

            if (this.matchPatterns(scope)) {
                return true
            }
        }

        return false
    }

    protected createRelativeSourcePath(target: string, reference: string): string
    {
        const result = parse(relative(dirname(target), reference))

        if (result.dir === "") {
            result.root = "./"
        }
        else if (!/^\.\.?\//.test(result.dir)) {
            result.dir = `./${result.dir}`
        }

        return format(result)
    }

    public getIncludes(tsConfig: TSConfig): Array<string> | null
    {
        if (tsConfig.include) {
            return tsConfig.include
        }
        
        return null
    }

    public getBaseURL(tsConfig: TSConfig): string | null
    {
        if (tsConfig.compilerOptions?.baseUrl) {
            return tsConfig.compilerOptions.baseUrl
        }

        return null
    }

    public getPaths(tsConfig: TSConfig): MapLike<Array<string>> | null
    {
        if (tsConfig.compilerOptions?.paths) {
            return tsConfig.compilerOptions.paths
        }

        return null
    }

    protected getAliasesData(tsConfig: TSConfig): AliasesData
    {
        return {
            baseUrl: this.getBaseURL(tsConfig),
            paths: this.getPaths(tsConfig)
        }
    }

    protected matchPatterns(path: string): boolean
    {
        for (const pattern of globSync(path)) {
            if (new RegExp(`^${pattern}`).test(path)) {
                return true
            }
        }
        return false
    }

    public get rel(): string
    {
        return relative(this.workSpace, this.target)
    }
}