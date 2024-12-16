import React from "react";
import "./index.css";

/**
 * 全局底部栏组件
 * @constructor
 */
export default function GlobalFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="global-footer">
      <div>© {currentYear}北雷村校招备考系统</div>
      <div>
        <a href="https://github.com/Loveloenly7" target="_blank">
          Presented By HW
        </a>
      </div>
    </div>
  );
}
