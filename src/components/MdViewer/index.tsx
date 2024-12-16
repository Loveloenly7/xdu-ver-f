import { Viewer } from "@bytemd/react";
import gfm from "@bytemd/plugin-gfm";
import highlight from "@bytemd/plugin-highlight";
import "github-markdown-css/github-markdown-light.css";
import "bytemd/dist/index.css";
import "highlight.js/styles/vs.css";
import "./index.css";
import React from "react";


interface Props {
  value?: string;
}

const plugins = [gfm(), highlight()];


const MdViewer = (props: Props) => {
  const { value = "" } = props;

  return (
      <div className="md-viewer">
        <Viewer value={value} plugins={plugins}/>
      </div>
      // <>
      //     <div className="md-viewer">
      //         <Viewer value={value} plugins={plugins}/>
      //     </div>
      //
      // </>
  )
      ;
};

export default MdViewer;
