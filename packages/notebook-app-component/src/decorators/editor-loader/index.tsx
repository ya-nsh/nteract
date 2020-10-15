import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { actions } from "@nteract/core";

interface Props {
  addEditor(editorType: string, component: any): void;
}

export class EditorLoader extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  loadEditors() {
    // Add the editor components to state
    import(
      /* webpackChunkName: "codemirror" */ "@nteract/stateful-components/src/inputs/connected-editors/codemirror"
    ).then(cm => {
      this.props.addEditor("codemirror", cm.default);
    });

    import(
      /* webpackChunkName: "monaco" */ "@nteract/stateful-components/src/inputs/connected-editors/monacoEditor"
    ).then(monaco => {
      this.props.addEditor("monaco", monaco.default);
    });
  }
  componentDidMount() {
    this.loadEditors();
  }

  render() {
    return null;
  }
}

const makeMapDispatchToProps = (
  initialDispatch: Dispatch
) => {
  const mapDispatchToProps = (dispatch: Dispatch) => {
    return {
      addEditor: (editorType: string, component: any) => {
        return dispatch(
          actions.addEditor({
            editorType,
            component
          })
        );
      }
    };
  };
  return mapDispatchToProps;
};

export default connect(null, makeMapDispatchToProps)(EditorLoader);