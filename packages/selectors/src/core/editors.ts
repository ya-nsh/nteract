import { AppState } from "@nteract/types";

export const editorbyEditorType = (state: AppState) =>
  state.core.entities.editors.byEditorType;

export const editor = (state: AppState, { id }: { id: string }) =>
  editorbyEditorType(state).get(id);
