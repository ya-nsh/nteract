import { AppState, ContentRef, selectors, actions } from "@nteract/core";
import CodeMirrorEditor from "@nteract/editor";
import { createConfigCollection, createDeprecatedConfigOption, defineConfigOption, HasPrivateConfigurationState } from "@nteract/mythic-configuration";
import { connect } from "react-redux";
import { Dispatch } from "redux";

const codeMirrorConfig = createConfigCollection({
  key: "codeMirror",
});

createDeprecatedConfigOption({
  key: "cursorBlinkRate",
  changeTo: (value: number) => ({
    "codeMirror.cursorBlinkRate": value,
  }),
});

const BOOLEAN = [
  { label: "Yes", value: true },
  { label: "No", value: false },
];

defineConfigOption({
  label: "Blink Editor Cursor",
  key: "codeMirror.cursorBlinkRate",
  values: [
    { label: "Yes", value: 530 },
    { label: "No", value: 0 },
  ],
  defaultValue: 0,
});

defineConfigOption({
  label: "Show Cursor When Selecting",
  key: "codeMirror.showCursorWhenSelecting",
  values: BOOLEAN,
  defaultValue: false,
});

defineConfigOption({
  label: "Close Brackets Automatically",
  key: "codeMirror.autoCloseBrackets",
  values: BOOLEAN,
  defaultValue: false,
});

defineConfigOption({
  label: "Show Matching Brackets",
  key: "codeMirror.matchBrackets",
  values: BOOLEAN,
  defaultValue: true,
});

defineConfigOption({
  label: "Use Smart Indent",
  key: "codeMirror.smartIndent",
  values: BOOLEAN,
  defaultValue: true,
});

defineConfigOption({
  label: "Tab Size",
  key: "codeMirror.tabSize",
  values: [
    { label: "2 Spaces", value: 2 },
    { label: "3 Spaces", value: 3 },
    { label: "4 Spaces", value: 4 },
  ],
  defaultValue: 4,
});

defineConfigOption({
  label: "Show Line Numbers",
  key: "codeMirror.lineNumbers",
  values: BOOLEAN,
  defaultValue: false,
});

const markdownMode = {
  name: "gfm",
  tokenTypeOverrides: {
    emoji: "emoji",
  },
};

const rawMode = {
  name: "text/plain",
  tokenTypeOverrides: {
    emoji: "emoji",
  },
};

interface ComponentProps {
  id: string;
  contentRef: ContentRef;
  editorType: string;
}

interface DispatchProps {
  focusAbove: () => void;
  focusBelow: () => void;
}

const makeMapStateToProps = (state: AppState & HasPrivateConfigurationState, ownProps: ComponentProps) => {
  const { id, contentRef } = ownProps;
  const mapStateToProps = (state: AppState & HasPrivateConfigurationState) => {
    let mode = rawMode;
    let lineWrapping = true;

    const model = selectors.model(state, { contentRef });
    const kernel = selectors.kernelByContentRef(state, { contentRef });

    if (model && model.type === "notebook") {
      const cell = selectors.notebook.cellById(model, { id });
      if (cell) {
        switch (cell.cell_type) {
          case "markdown":
            mode = markdownMode;
            break;
          case "code":
            lineWrapping = false;
            mode =
              kernel?.info?.codemirrorMode ||
              selectors.notebook.codeMirrorMode(model);
            break;
          default:
            mode = rawMode;
            break;
        }
      }
    }

    // FIXME: The type for mode is wrong; it can also be a string or a Map at
    //        this point! Hence:
    // tslint:disable-next-line:strict-type-predicates
    mode = typeof mode === "object" && "toJS" in mode
      ? (mode as any).toJS()
      : mode;

    const codeMirror = {
      mode,
      ...codeMirrorConfig(state as any),
    };

    return {
      mode,
      codeMirror,
      lineWrapping,
      tip: true,
      completion: true,
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
      focusBelow: () => {
        dispatch(actions.focusNextCell({ id, contentRef, createCellIfUndefined: true }));
        dispatch(actions.focusNextCellEditor({ id, contentRef }));
      },
      focusAbove: () => {
        dispatch(actions.focusPreviousCell({ id, contentRef }));
        dispatch(actions.focusPreviousCellEditor({ id, contentRef }));
      }
    }
  };
  return mapDispatchToProps;
};

export default connect(makeMapStateToProps, makeMapDispatchToProps)(CodeMirrorEditor);
