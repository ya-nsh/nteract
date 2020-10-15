import Immutable from "immutable";
import React from "react";
import { connect } from "react-redux";

import { AppState, ContentRef, selectors } from "@nteract/core";

import Cell from "./cell";
import CodeCell from "./code-cell";
import MarkdownCell from "./markdown-cell";
import RawCell from "./raw-cell";

interface NamedCellSlots {
  code?: (props: { id: string; contentRef: string }) => JSX.Element;
  markdown?: (props: { id: string; contentRef: string }) => JSX.Element;
  raw?: (props: { id: string; contentRef: string }) => JSX.Element;
}
interface ComponentProps {
  contentRef: ContentRef;
  children?: NamedCellSlots;
}

interface StateProps {
  cellOrder: Immutable.List<string>;
}

interface CellProps {
  id: string;
  contentRef: ContentRef;
}

export class Cells extends React.Component<StateProps & ComponentProps> {
  render() {
    const { cellOrder, contentRef, children } = this.props;
    const defaults = {
      markdown: (props: CellProps) => (
        <MarkdownCell
          id={props.id}
          contentRef={props.contentRef}
          cell_type="markdown"
        />
      ),
      code: (props: CellProps) => (
        <CodeCell
          id={props.id}
          contentRef={props.contentRef}
          cell_type="code"
        />
      ),
      raw: (props: CellProps) => (
        <RawCell id={props.id} contentRef={props.contentRef} cell_type="raw" />
      )
    };

    const code = children?.code || defaults.code;
    const markdown = children?.markdown || defaults.markdown;
    const raw = children?.raw || defaults.raw;

    return (
      <div className="nteract-cells">
        {cellOrder.map((id: string) => (
          <Cell id={id} contentRef={contentRef} key={id}>
            {markdown({ id, contentRef })}
            {raw({ id, contentRef })}
            {code({ id, contentRef })}
          </Cell>
        ))}
      </div>
    );
  }
}

export const makeMapStateToProps = (
  state: AppState,
  ownProps: ComponentProps
): ((state: AppState, ownProps: ComponentProps) => StateProps) => {

  const mapStateToProps = (state: AppState, ownProps: ComponentProps) => {
    const { contentRef } = ownProps;
    const model = selectors.model(state, { contentRef });
    let cellOrder = Immutable.List();

    if (model && model.type === "notebook") {
      cellOrder = model.notebook.cellOrder;
    }

    return {
      cellOrder
    };
  };
  return mapStateToProps;
};

export default connect<StateProps, void, ComponentProps, AppState>(
  makeMapStateToProps
)(Cells);
