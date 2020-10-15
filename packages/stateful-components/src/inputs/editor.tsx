import { defineConfigOption } from "@nteract/mythic-configuration";
import React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";

import { actions, AppState, ContentRef, selectors } from "@nteract/core";

const {
  selector: editorTypeConfig,
} = defineConfigOption({
  key: "editorType",
  label: "Editor Type",
  defaultValue: "codemirror",
  values: [
    { value: "codemirror", label: "CodeMirror" },
    { value: "monaco", label: "Monaco" },
  ],
});

export interface PassedEditorProps {
  id: string;
  contentRef: ContentRef;
  editorType: string;
  editorFocused: boolean;
  value: string;
  channels: any;
  kernelStatus: string;
  onChange: (text: string) => void;
  onFocusChange: (focused: boolean) => void;
  className: string;
}

export interface EditorSlots {
  [key: string]: (props: PassedEditorProps) => React.ReactNode;
}

interface ComponentProps {
  id: string;
  contentRef: ContentRef;
  children?: EditorSlots;
}

interface StateProps {
  editorType: string;
  editorFocused: boolean;
  value: string;
  channels: any;
  kernelStatus: string;
  editorComponent?: any;
}

interface DispatchProps {
  onChange: (text: string) => void;
  onFocusChange: (focused: boolean) => void;
}

type Props = ComponentProps & StateProps & DispatchProps;

export class Editor extends React.PureComponent<Props> {
  render(): React.ReactNode {
    const { editorComponent, editorType, children } = this.props;

    const editorProps = {
      id: this.props.id,
      contentRef: this.props.contentRef,
      editorType: this.props.editorType,
      value: this.props.value,
      editorFocused: this.props.editorFocused,
      channels: this.props.channels,
      kernelStatus: this.props.kernelStatus,
      onChange: this.props.onChange,
      onFocusChange: this.props.onFocusChange,
      className: "nteract-cell-editor",
    };

    /**
     * We filter on the children Editor Slots and render the correct editorType
     */
    if (children && children[editorType]) {
      const chosenEditor = children[editorType];
      return chosenEditor(editorProps);
    } else if(editorComponent) {
    /**
     * Fallback to the editor component stored in the state from dynamic import
     * We'd eventually want to deprecate the static imports and move entirely to on-demand loading
     */

      return React.createElement(editorComponent, editorProps);
    }

    return null;
  }
}

export const makeMapStateToProps = (
  initialState: AppState,
  ownProps: ComponentProps
) => {
  const { id, contentRef } = ownProps;
  const mapStateToProps = (state: AppState): StateProps => {
    const model = selectors.model(state, { contentRef });

    let editorFocused = false;
    let channels = null;
    let kernelStatus = "not connected";
    let value = "";
    const editorType = editorTypeConfig(state);
    const editorComponent = selectors.editor(state, { id: editorType });

    if (model && model.type === "notebook") {
      const cell = selectors.notebook.cellById(model, { id });
      if (cell) {
        editorFocused = model.editorFocused === id;
        value = cell.get("source", "");
        if (cell.cell_type === "code") {
          const kernel = selectors.kernelByContentRef(state, { contentRef });
          if (kernel) {
            channels = kernel.channels;
            kernelStatus = kernel.status || "not connected";
          }
        }
      }
    }

    return {
      editorFocused,
      value,
      channels,
      kernelStatus,
      editorType,
      editorComponent,
    };
  };

  return mapStateToProps;
};

export const makeMapDispatchToProps = (
  initialDispatch: Dispatch,
  ownProps: ComponentProps
) => {
  const { id, contentRef } = ownProps;
  const mapDispatchToProps = (dispatch: Dispatch) => {
    return {
      onChange: (text: string) => {
        dispatch(actions.updateCellSource({ id, value: text, contentRef }));
      },

      onFocusChange(focused: boolean): void {
        if (focused) {
          dispatch(actions.focusCellEditor({ id, contentRef }));
          // Assume we can focus the cell if now focusing the editor
          // If this doesn't work, we need to go back to checking !cellFocused
          dispatch(actions.focusCell({ id, contentRef }));
        }
      }
    };
  };
  return mapDispatchToProps;
};

export default connect(makeMapStateToProps, makeMapDispatchToProps)(Editor);
