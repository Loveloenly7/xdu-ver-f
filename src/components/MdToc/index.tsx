'use client'

import {Anchor} from 'antd';
import {useEffect, useState} from "react";

//这是给md viewer的目录 组件 能用好用
//但是暂时没确定题目详情页面的排版 所以先放着


/*todo 这玩意现在只是能用了 但是集成的时候会出问题。。。*/
const MdList = () => {
    const [anchors, setAnchors] = useState([]);

    const updateToc = () => {
        setTimeout(() => {
            const article = document.querySelector(".markdown-body");
            if (null === article || article.hasAttribute('querySelectorAll')) return;
            const hs = article.querySelectorAll('h1,h2,h3,h4');
            const anchor = [];
            hs.forEach((item, idx) => {
                const h = item.nodeName.substring(0, 2).toLowerCase();
                item.id = `Anchor-${h}-${idx}`;
                anchor.push({id: `Anchor-${h}-${idx}`, text: item.textContent});
            })
            setAnchors(anchor)
        }, 100);
    }

    useEffect(() => {
        updateToc();
    }, []);


    //监听节点 然后更新目录。。
    useEffect(() => {
        const targetNode = document.querySelector(".markdown-body");
        if (!targetNode) return;

        // 创建 MutationObserver 实例
        const observer = new MutationObserver(() => {
            updateToc(); // 当目标节点发生变化时执行更新
        });

        // 配置 MutationObserver 监听内容变化和子节点变化
        observer.observe(targetNode, {
            childList: true, // 监听子节点的增删
            subtree: true,   // 监听后代节点的变化
            characterData: true, // 监听文本内容的变化
        });

        // 清理操作，组件卸载时停止监听
        return () => observer.disconnect();
    }, []);

    return (
        <>
            <Anchor
                offsetTop={1}
                affix={false}
                showInkInFixed={true}
            >
                {anchors.map((anchor, idx) => {
                    switch (anchor.id[8]) {
                        case "1":
                            return <Anchor.Link key={idx} href={`#${anchor.id}`}
                                                title={<span style={{paddingLeft: 0}}>{anchor.text}</span>}/>
                        case "2":
                            return <Anchor.Link key={idx} href={`#${anchor.id}`}
                                                title={<span style={{paddingLeft: 16}}>{anchor.text}</span>}/>
                        case "3":
                            return <Anchor.Link key={idx} href={`#${anchor.id}`}
                                                title={<span style={{paddingLeft: 32}}>{anchor.text}</span>}/>
                        default:
                            return <></>
                    }
                })}
            </Anchor>
        </>
    );

}
export default MdList;
