import { resolve } from "path"
import { transformFileSync } from "@babel/core"
import plugin from "../src/index"


const sourceCodeFile = resolve(__dirname, "code.ts")


test("Test", () =>
{
    const result = transformFileSync(sourceCodeFile, { plugins: [ "@babel/plugin-syntax-typescript", plugin ] })
    const output = result?.code

    expect(output).toBeTruthy()
    expect(output).toMatchSnapshot()
})
