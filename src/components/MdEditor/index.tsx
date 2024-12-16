
//todo 折腾
import React from 'react';
import MDEditor from '@uiw/react-md-editor';
import 'github-markdown-css/github-markdown-light.css'; // GitHub 风格的 CSS
import "highlight.js/styles/vs.css"; // highlight.js 样式

import './index.css'; // 自定义CSS

interface Props {
    value?: string;
    onChange?: (v: string) => void;
    placeholder?: string;
}

/**
 * Markdown 编辑器
 * @param props
 * @constructor
 */
const MdEditor = (props: Props) => {
    const { value = "", onChange, placeholder } = props;

    return (
        <div className="md-editor">
            <MDEditor
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                height={400} // 设置高度
                preview="live" // 预览模式
                visibleDragbar={false} // 禁用拖拽
            />
        </div>
    );
};

export default MdEditor;
