import { CompilerOptions } from "typescript"


export default interface TSConfig
{
    extends?: string
    compilerOptions?: CompilerOptions
    include?: Array<string>
}
