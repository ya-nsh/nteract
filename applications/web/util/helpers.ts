import map from "lang-map";
import { AjaxResponse } from "rxjs/ajax";
import { IContent } from "@nteract/types";
import { useState } from "react";

export const getLanguage = (extension: string) => {
  return map.languages(extension)[0]
}

export const useInput = (val: string | undefined) => {
  const [value, setValue] = useState(val);

  function handleChange(e: React.FormEvent<HTMLInputElement> | React.FormEvent<HTMLSelectElement>) {
    setValue(e.currentTarget.value);
  }

  return {
    value,
    onChange: handleChange
  }
}

export const useCheckInput = (val: boolean | undefined) => {
  const [value, setValue] = useState(val);

  function handleChange(e: React.FormEvent<HTMLInputElement>) {
    setValue(e.currentTarget.checked);
  }

  return {
    value,
    onChange: handleChange
  }
}

export function createNotebookModel(filePath: string, content?: string): IContent<"notebook"> {
  const name = filePath
  const writable = true
  const created = ""
  // tslint:disable-next-line variable-name -- jupyter camel case naming convention for API
  const last_modified = ""
  return {
    name,
    path: filePath,
    type: "notebook",
    writable,
    created,
    last_modified,
    mimetype: "application/x-ipynb+json",
    content: content ? JSON.parse(content) : null,
    format: "json"
  };
}

export function createSuccessAjaxResponse(notebook: IContent<"notebook">): AjaxResponse {
  return {
    originalEvent: new Event("no-op"),
    xhr: new XMLHttpRequest(),
    request: {},
    status: 200,
    response: notebook,
    responseText: JSON.stringify(notebook),
    responseType: "json"
  };
}
