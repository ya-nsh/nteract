import React from "react";
import { shallow } from "enzyme";
import Immutable from "immutable";

import { mockAppState, fixtureStore } from "@nteract/fixtures";

import { Cells, makeMapStateToProps } from "../../src/cells/cells";

describe("makeMapStateToProps", () => {
  it("returns an empty list of cell ids for non-notebook content", () => {
    const state = mockAppState({});
    const ownProps = { contentRef: "not real" };
    const result = makeMapStateToProps(state, ownProps)(state, ownProps);
    expect(result.cellOrder.size).toBe(0);
  });
  it("returns the correct length of cell ids for notebook content", () => {
    const state = mockAppState({ codeCellCount: 3 });
    const contentRef = state.core.entities.contents.byRef.keySeq().first()
    const ownProps = { contentRef: contentRef as string};
    const result = makeMapStateToProps(state, ownProps)(state, ownProps);
    expect(result.cellOrder.size).toBe(3);
  });
});

describe("Cells", () => {
  it("renders without crashing", () => {
    const component = shallow(
      <Cells
        contentRef={"contentRef"}
        cellOrder={Immutable.List(["a", "b", "c"])}
      />
    );
    expect(component).not.toBeNull();
  });
});
