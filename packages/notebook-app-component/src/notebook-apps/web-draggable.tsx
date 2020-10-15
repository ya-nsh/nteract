import { CellType } from "@nteract/commutable";
import { ContentRef } from "@nteract/core";
import {
  Cells,
  CodeCell,
  MarkdownCell,
  RawCell,
} from "@nteract/stateful-components";
import { ThemeFromConfig } from "@nteract/stateful-components";
import React from "react";

import { ThemableNotifications } from "../derived-components/themable-notifications";
import CellToolbar from "../derived-components/toolbar";

import { DragDropContext as dragDropContext } from "react-dnd";
import HTML5Backend from "react-dnd-html5-backend";

import DraggableCell from "../decorators/draggable";
import HijackScroll from "../decorators/hijack-scroll";
import KeyboardShortcuts from "../decorators/kbd-shortcuts";
import UndoableCellDelete from "../decorators/undoable/undoable-cell-delete";
import styled from "styled-components";

// Custom CSS
// .nteract-cell-container:focus .nteract-cell, .nteract-cell-container:focus-within .nteract-cell, .nteract-cell-container.selected .nteract-cell 
const Wrapper = styled.div`

.nteract-cell {
  box-shadow: none !important;
}

.nteract-cell-gutter {
  background-color: hsl(240, 100%, 99%);
  border-right: 1px solid #fbecec;
}

`

interface ComponentProps {
  contentRef: ContentRef;
}

const decorate = (
  id: string,
  contentRef: ContentRef,
  cell_type: CellType,
  children: React.ReactNode
) => {
  const Cell = () => (
    <DraggableCell id={id} contentRef={contentRef}>
      <HijackScroll id={id} contentRef={contentRef}>
        <UndoableCellDelete id={id} contentRef={contentRef}>
          {children}
        </UndoableCellDelete>
      </HijackScroll>
    </DraggableCell>
  );

  Cell.defaultProps = { cell_type };
  return <Cell />;
};

export class NotebookApp extends React.Component<ComponentProps> {
  render(): JSX.Element {
    return (
      <Wrapper>
      <React.Fragment>
        <ThemeFromConfig>
          <KeyboardShortcuts contentRef={this.props.contentRef}>
            <Cells contentRef={this.props.contentRef}>
              {{
                code: (props: { id: string; contentRef: ContentRef }) =>
                  decorate(
                    props.id,
                    props.contentRef,
                    "code",
                    <CodeCell
                      id={props.id}
                      contentRef={props.contentRef}
                      cell_type="code"
                    >
                      {{
                        toolbar: () => (
                          <CellToolbar
                            id={props.id}
                            contentRef={props.contentRef}
                          />
                        ),
                      }}
                    </CodeCell>
                  ),
                markdown: (props: { id: string; contentRef: ContentRef }) =>
                  decorate(
                    props.id,
                    props.contentRef,
                    "markdown",
                    <MarkdownCell
                      id={props.id}
                      contentRef={props.contentRef}
                      cell_type="markdown"
                    >
                      {{
                        toolbar: () => (
                          <CellToolbar
                            id={props.id}
                            contentRef={props.contentRef}
                          />
                        ),
                      }}
                    </MarkdownCell>
                  ),
                raw: (props: { id: string; contentRef: ContentRef }) =>
                  decorate(
                    props.id,
                    props.contentRef,
                    "raw",
                    <RawCell
                      id={props.id}
                      contentRef={props.contentRef}
                      cell_type="raw"
                    >
                      {{
                        toolbar: () => (
                          <CellToolbar
                            id={props.id}
                            contentRef={props.contentRef}
                          />
                        ),
                      }}
                    </RawCell>
                  ),
              }}
            </Cells>
            <ThemableNotifications />
          </KeyboardShortcuts>
        </ThemeFromConfig>
      </React.Fragment>
    </Wrapper>
    );
  }
}

const DraggableNotebookApp = dragDropContext(HTML5Backend)(NotebookApp);
export default DraggableNotebookApp;
