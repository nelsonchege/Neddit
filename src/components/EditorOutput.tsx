"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import React from "react";

const Output = dynamic(
  async () => (await import("editorjs-react-renderer")).default,
  { ssr: false }
);
type EditorOutputProps = {
  content: any;
};

const styles = {
  paragraph: {
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
  },
};

const renderers = {
  image: CustomImageRenderer,
  code: CustomCodeRenderer,
};

function CustomImageRenderer({ data }: any) {
  return (
    <div className="relative w-full min-h-[15rem]">
      <Image
        alt="image"
        className="object-container"
        fill
        src={data.file.url}
      />
    </div>
  );
}

function CustomCodeRenderer({ data }: any) {
  return (
    <pre className="bg-gray-800 rounded-md p-4">
      <code className="text-gray-100 text-sm">{data.code}</code>
    </pre>
  );
}
const EditorOutput = ({ content }: EditorOutputProps) => {
  return (
    <Output
      data={content}
      style={styles}
      className="text-sm"
      renderers={renderers}
    />
  );
};

export default EditorOutput;
