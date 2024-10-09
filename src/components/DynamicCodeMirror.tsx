import React, { forwardRef } from "react";
import CodeMirror, { type ReactCodeMirrorProps } from "@uiw/react-codemirror";

export const DynamicCodeMirror = forwardRef<any, ReactCodeMirrorProps>(
  (props, ref) => {
    if (typeof window === "undefined") {
      return null;
    }

    return <CodeMirror {...props} ref={ref} />;
  }
);

DynamicCodeMirror.displayName = "DynamicCodeMirror";
