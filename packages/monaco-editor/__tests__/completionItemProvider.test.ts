import { createMessage, JupyterMessage } from "@nteract/messaging";
import { Subject } from "rxjs";
import * as Monaco from "monaco-editor";
import { completionProvider } from "../src/completions/completionItemProvider";
import * as editorBase from "../src/editor-base";

// Setup items shared by all tests
// Create Editor Model and Position
const testModel = Monaco.editor.createModel("some test code", "python");
const testPos = new Monaco.Position(1, 3);

// Mock the completion Request method
const mockFn = jest.spyOn(editorBase, "completionRequest");

const mockCompletionRequest = createMessage("complete_request", {
  content: {
    code: "foo",
    cursor_pos: 2
  }
});

mockFn.mockReturnValue(mockCompletionRequest);
describe("Completions should not get trigerred when channels/messages are missing", () => {
  beforeAll(() => {
    jest.clearAllMocks();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  it("Should not return any suggestions when channels is undefined", (done) => {
    completionProvider.setChannels(undefined);

    completionProvider.provideCompletionItems(testModel, testPos).then((result) => {
      expect(result).toHaveProperty("suggestions");
      expect(result.suggestions.length).toEqual(0);
      done();
    });
  });

  it("Should not return any suggestions when channels is empty", (done) => {
    // Create an empty channel with no messages
    const channels = new Subject<JupyterMessage>();
    completionProvider.setChannels(channels);

    completionProvider.provideCompletionItems(testModel, testPos).then((result) => {
      expect(result).toHaveProperty("suggestions");
      expect(result.suggestions.length).toEqual(0);
      done();
    });
    channels.complete();
  });

  it("Should not return any suggestions when channels don't contain a complete_reply message", (done) => {
    const testMessage = createMessage("kernel_info_reply");

    const channels = new Subject<JupyterMessage>();
    completionProvider.setChannels(channels);

    completionProvider.provideCompletionItems(testModel, testPos).then((result) => {
      expect(result).toHaveProperty("suggestions");
      expect(result.suggestions.length).toEqual(0);
      done();
    });
    // No suggestions should be provided for incompatible message type
    channels.next(testMessage);
    channels.complete();
  });

  it("Should not return any suggestions when channels don't have the correct response message", (done) => {
    const testMessage = createMessage("complete_reply", {
      content: {
        status: "some_status",
        cursor_start: 3,
        cursor_end: 5,
        matches: ["some_completion"]
      }
    });

    const channels = new Subject<JupyterMessage>();
    completionProvider.setChannels(channels);

    completionProvider.provideCompletionItems(testModel, testPos).then((result) => {
      expect(result).toHaveProperty("suggestions");
      expect(result.suggestions.length).toEqual(0);
      done();
    });
    // Although we have a complete reply message, it is not the child of the appropriate complete_request message
    channels.next(testMessage);
    channels.complete();
  });
});

describe("Appropriate completions should be provided", () => {
  beforeAll(() => {
    jest.clearAllMocks();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  it("Should return a suggestion when channels contain a single reply with string match", (done) => {
    const mockCompleteReply = createMessage("complete_reply", {
      content: {
        status: "some_status",
        cursor_start: 3,
        cursor_end: 5,
        matches: ["some_completion"]
      },
      parent_header: mockCompletionRequest.header
    });

    const channels = new Subject<JupyterMessage>();
    completionProvider.setChannels(channels);
    completionProvider.provideCompletionItems(testModel, testPos).then((result) => {
      expect(result).toHaveProperty("suggestions");
      const returnedSuggestions = result.suggestions;
      expect(returnedSuggestions.length).toEqual(1);
      expect(returnedSuggestions[0].kind).toEqual(Monaco.languages.CompletionItemKind.Field);
      expect(returnedSuggestions[0].insertText).toEqual("some_completion");
      done();
    });
    // Set the reply message on channels and complete the stream
    channels.next(mockCompleteReply);
    channels.complete();
  });

  it("Should return all suggestions from the received matches", (done) => {
    const mockCompleteReply = createMessage("complete_reply", {
      content: {
        status: "some_status",
        cursor_start: 3,
        cursor_end: 5,
        matches: ["completion1", "completion2"]
      },
      parent_header: mockCompletionRequest.header
    });

    const channels = new Subject<JupyterMessage>();
    completionProvider.setChannels(channels);
    completionProvider.provideCompletionItems(testModel, testPos).then((result) => {
      expect(result).toHaveProperty("suggestions");
      const returnedSuggestions = result.suggestions;
      expect(returnedSuggestions.length).toEqual(2);
      expect(returnedSuggestions[0].kind).toEqual(Monaco.languages.CompletionItemKind.Field);
      expect(returnedSuggestions[0].insertText).toEqual("completion1");
      expect(returnedSuggestions[1].kind).toEqual(Monaco.languages.CompletionItemKind.Field);
      expect(returnedSuggestions[1].insertText).toEqual("completion2");
      done();
    });
    // Set the reply message on channels and complete the stream
    channels.next(mockCompleteReply);
    channels.complete();
  });

  it("Should return a suggestion when channels contain a single reply with a completionItem match", (done) => {
    const mockCompleteReply = createMessage("complete_reply", {
      content: {
        status: "some_status",
        cursor_start: 3,
        cursor_end: 5,
        matches: [
          {
            end: 5,
            start: 3,
            type: "keyword",
            text: "some_completion"
          }
        ]
      },
      parent_header: mockCompletionRequest.header
    });

    const channels = new Subject<JupyterMessage>();
    completionProvider.setChannels(channels);
    completionProvider.provideCompletionItems(testModel, testPos).then((result) => {
      expect(result).toHaveProperty("suggestions");
      const returnedSuggestions = result.suggestions;
      expect(returnedSuggestions.length).toEqual(1);
      expect(returnedSuggestions[0].kind).toEqual(Monaco.languages.CompletionItemKind.Keyword);
      expect(returnedSuggestions[0].insertText).toEqual("some_completion");
      done();
    });
    // Set the reply message on channels and complete the stream
    channels.next(mockCompleteReply);
    channels.complete();
  });

  it("Should return suggestions when matches received in _jupyter_types_experimental metadata property", (done) => {
    const mockCompleteReply = createMessage("complete_reply", {
      content: {
        status: "some_status",
        cursor_start: 3,
        cursor_end: 5,
        metadata: {
          _jupyter_types_experimental: ["some_completion"]
        }
      },
      parent_header: mockCompletionRequest.header
    });

    const channels = new Subject<JupyterMessage>();
    completionProvider.setChannels(channels);
    completionProvider.provideCompletionItems(testModel, testPos).then((result) => {
      expect(result).toHaveProperty("suggestions");
      const returnedSuggestions = result.suggestions;
      expect(returnedSuggestions.length).toEqual(1);
      expect(returnedSuggestions[0].kind).toEqual(Monaco.languages.CompletionItemKind.Field);
      expect(returnedSuggestions[0].insertText).toEqual("some_completion");
      done();
    });
    // Set the reply message on channels and complete the stream
    channels.next(mockCompleteReply);
    channels.complete();
  });
});
