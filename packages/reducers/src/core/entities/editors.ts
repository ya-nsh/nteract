import * as actions from "@nteract/actions";
import { makeEditorsRecord } from "@nteract/types";
import { Map } from "immutable";
import { Action, Reducer } from "redux";
import { combineReducers } from "redux-immutable";

export const byEditorType = (
  state = Map<string, any>(),
  action: Action
): Map<string, any> => {
  let typedAction;
  switch (action.type) {
    case actions.ADD_EDITOR:
      typedAction = action as actions.AddEditor;
      return state.set(
        typedAction.payload.editorType,
        typedAction.payload.component
      );
    default:
      return state;
  }
};

export const editors: Reducer<
  {
    byEditorType: Map<string, any>;
  },
  Action<any>
> = combineReducers({ byEditorType }, makeEditorsRecord as any);