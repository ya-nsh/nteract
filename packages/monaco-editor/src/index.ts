export { default, IMonacoProps, IMonacoShortCutProps } from "./MonacoEditor";

export { completionProvider } from "./completions/completionItemProvider";
export {Mode, mapCodeMirrorModeToMonaco } from "./converter";

export { DocumentUri } from "./documentUri";
export {LightThemeName, DarkThemeName } from "./theme";
export * from "monaco-editor/esm/vs/editor/editor.api";