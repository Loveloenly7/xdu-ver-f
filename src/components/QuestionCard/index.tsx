// "use client";
// // import { Card } from "antd";
// import Title from "antd/es/typography/Title";
// import TagList from "@/components/TagList";
// import MdViewer from "@/components/MdViewer";
// import useAddUserSignInRecord from "@/hooks/useAddUserSignInRecord";
// import "./index.css";
//
//
// import React, {useEffect, useState} from 'react';
// import {Card, Button, message, Dropdown, Menu} from 'antd';
// import {
//     ShareAltOutlined,
//     HeartOutlined,
//     HeartFilled,
//     CheckOutlined,
//     FlagOutlined,
//     FlagFilled,
//     CheckCircleFilled, CheckCircleOutlined
// } from '@ant-design/icons';
// import loginUser from "@/stores/loginUser";
// import {useSelector} from "react-redux";
// import {RootState} from "@/stores";
// import {
//     addFavoriteUsingPost, deleteFavoriteUsingPost,
//     getFavoriteVoByIdUsingGet,
//     listFavoriteVoByPageUsingPost,
//     updateFavoriteUsingPost
// } from "@/api/favoriteController";
//
// interface Props {
//     question: API.QuestionVO;
// }
//
// /**
//  * 题目卡片
//  * @param props
//  * @constructor
//  */
// const QuestionCard = (props: Props) => {
//     const {question} = props;
//     /*我要在这个card里面 贴底部增加三个按钮 要求三个按钮一行排列
//      采用Block类型的button 把贴近底部的地方占满，一个是收藏按钮
//      点击后变为取消收藏的按钮 一个是分享按钮 点击后
//      提示消息 “已经复制URL到剪贴板” 最后一个是标记按
//     钮 光标放上去会有两个选择的按钮 一个是标记为已掌握 一个是标记为易错 */
//
// // loginUser()
//
//     //当前用户的获取
//     const loginUser = useSelector((state: RootState) => state.loginUser);
//
//     const userId = loginUser.id;
//
//
//     // 签到
//     useAddUserSignInRecord();
//
//
//     //不不不 默认直接把这一页的favorite当作钩子函数就好
//     const [favorite, setFavorite] = useState<any>(null); // 收藏状态
//
//     //页面初次加载的时候 加载收藏状态
//     const handleLoad = async () => {
//
//
//         const response = await listFavoriteVoByPageUsingPost({
//             current: 1,
//             pageSize: 1,
//             questionId: question.id,
//             userId
//         });
//         // {
//         //     "current": 1,
//         //     "pageSize": 1,
//         //     "questionId": 1,
//         //     "userId": 5
//         // }
//         if (response.data.records.length > 0) {
//             setFavorite(response.data.records[0]);
//
//         }
//
//     }
//     //写一个useEffect 监控favorite 然后刷新三个button的渲染方式
//
//     // 使用 useEffect
//     useEffect(() => {
//         handleLoad(); // 页面加载时或 favorite 更新时执行
//     }, [favorite]); // 依赖项为 favorite
//
//     // 点击 状态变为已收藏
//     const handleFavorite0 = async () => {
//
// //根据当前状态 进行设计
//
//         if (favorite) {
//
//             await updateFavoriteUsingPost({
//                 // ...favorite 这个写法是可以的 但是我后端只写了两个字段 所以这里直接饮用就好
//
//                 id: favorite.id,
//                 favoriteType: 0
//             })
//
//             /*在 React 中，当你使用 useState 声明状态时，直接修改对象属性（例如 favorite.id = 1）并不会触发组件的重新渲染。React 的状态管理要求通过 setState 方法更新状态，从而确保状态变更后组件可以重新渲染。
//             * 说白了 不能这么干。。。那更新之后就去重新查吧那就。。。？*/
//             favorite.id = 0;
//
//             // const {data} = await getFavoriteVoByIdUsingGet({id:favorite.id});
//
//             /*那我只能每次更新之后 又去后端查这个对象的数据了     const {data} = await getFavoriteVoByIdUsingGet({id:favorite.id});
//
//             setFavorite(data); 像这样 但是这样的话 向后端发送的请求就多了 但是没必要啊 因为更新的数据是在本地的 能不能在本地构建对象然后穿进去？*/
//
//             //对的没必要
//             //但是这里要确定后端成功了之后再说吧。。？
//             const updatedFavorite = {
//                 ...favorite, // 保留原有字段
//                 favoriteType: 0, // 更新需要修改的字段
//             };
//
//             setFavorite(updatedFavorite);
//
//
//         } else {
//             const response1 = await addFavoriteUsingPost({
//                 userId,
//                 questionId: question.id,
//                 favoriteType: 0
//             });
//
//             const fid = response1.data;
//
//             //这里是因为 本地还没有的时候 id可能是雪花算法
//             const {data} = await getFavoriteVoByIdUsingGet({id: fid});
//
//             setFavorite(data);
//         }
//
//         //如果存在
//
//         //如果不存在 调用add方法
//
//
//         //设置钩子 重新渲染当前的三个按钮的状态
//         //收藏夹子里面有三种收藏的方式 默认 已经掌握 难解决。。。
//         message.success('已收藏');
//     };
//
//     //点击 状态变为1 易错
//     const handleFavorite1 = async () => {
//
//         if (favorite) {
//
//             await updateFavoriteUsingPost({
//                 // ...favorite 这个写法是可以的 但是我后端只写了两个字段 所以这里直接饮用就好
//
//                 id: favorite.id,
//                 favoriteType: 1
//             })
//
//             /*在 React 中，当你使用 useState 声明状态时，直接修改对象属性（例如 favorite.id = 1）并不会触发组件的重新渲染。React 的状态管理要求通过 setState 方法更新状态，从而确保状态变更后组件可以重新渲染。
//             * 说白了 不能这么干。。。那更新之后就去重新查吧那就。。。？*/
//             favorite.id = 0;
//
//             // const {data} = await getFavoriteVoByIdUsingGet({id:favorite.id});
//
//             /*那我只能每次更新之后 又去后端查这个对象的数据了     const {data} = await getFavoriteVoByIdUsingGet({id:favorite.id});
//
//             setFavorite(data); 像这样 但是这样的话 向后端发送的请求就多了 但是没必要啊 因为更新的数据是在本地的 能不能在本地构建对象然后穿进去？*/
//
//             //对的没必要
//             //但是这里要确定后端成功了之后再说吧。。？
//             const updatedFavorite = {
//                 ...favorite, // 保留原有字段
//                 favoriteType: 0, // 更新需要修改的字段
//             };
//
//             setFavorite(updatedFavorite);
//
//
//         } else {
//             const response1 = await addFavoriteUsingPost({
//                 userId,
//                 questionId: question.id,
//                 favoriteType: 1
//             });
//
//             const fid = response1.data;
//
//             //这里是因为 本地还没有的时候 id可能是雪花算法
//             const {data} = await getFavoriteVoByIdUsingGet({id: fid});
//
//             setFavorite(data);
//         }
//
//         //如果存在
//
//         //如果不存在 调用add方法
//
//
//         //设置钩子 重新渲染当前的三个按钮的状态
//         //收藏夹子里面有三种收藏的方式 默认 已经掌握 难解决。。。
//         message.success('已收藏');
//
//     }
//
//     //点击 状态变为2 已掌握
//     const handleFavorite2 = async () => {
//         if (favorite) {
//
//             await updateFavoriteUsingPost({
//                 // ...favorite 这个写法是可以的 但是我后端只写了两个字段 所以这里直接饮用就好
//
//                 id: favorite.id,
//                 favoriteType: 2
//             })
//
//             /*在 React 中，当你使用 useState 声明状态时，直接修改对象属性（例如 favorite.id = 1）并不会触发组件的重新渲染。React 的状态管理要求通过 setState 方法更新状态，从而确保状态变更后组件可以重新渲染。
//             * 说白了 不能这么干。。。那更新之后就去重新查吧那就。。。？*/
//             favorite.id = 0;
//
//             // const {data} = await getFavoriteVoByIdUsingGet({id:favorite.id});
//
//             /*那我只能每次更新之后 又去后端查这个对象的数据了     const {data} = await getFavoriteVoByIdUsingGet({id:favorite.id});
//
//             setFavorite(data); 像这样 但是这样的话 向后端发送的请求就多了 但是没必要啊 因为更新的数据是在本地的 能不能在本地构建对象然后穿进去？*/
//
//             //对的没必要
//             //但是这里要确定后端成功了之后再说吧。。？
//             const updatedFavorite = {
//                 ...favorite, // 保留原有字段
//                 favoriteType: 1, // 更新需要修改的字段
//             };
//
//             setFavorite(updatedFavorite);
//
//
//         } else {
//             const response1 = await addFavoriteUsingPost({
//                 userId,
//                 questionId: question.id,
//                 favoriteType: 2
//             });
//
//             const fid = response1.data;
//
//             //这里是因为 本地还没有的时候 id可能是雪花算法
//             const {data} = await getFavoriteVoByIdUsingGet({id: fid});
//
//             setFavorite(data);
//         }
//
//         //如果存在
//
//         //如果不存在 调用add方法
//
//
//         //设置钩子 重新渲染当前的三个按钮的状态
//         //收藏夹子里面有三种收藏的方式 默认 已经掌握 难解决。。。
//         message.success('已收藏');
//
//     }
//
//     //点击 状态变为取消
//     const handleCancel = async () => {
//         //删除
//
//         if (favorite) {
//
//             await deleteFavoriteUsingPost({
//                 id: favorite.id,
//             })
//             setFavorite(null);
//         } else {
//
//             message.warning('没必要删除 favorite==null');
//
//         }
//
//         //如果存在
//
//         //如果不存在 调用add方法
//
//
//         //设置钩子 重新渲染当前的三个按钮的状态
//         //收藏夹子里面有三种收藏的方式 默认 已经掌握 难解决。。。
//         message.success('已取消');
//         //重新加载这三个按钮的渲染状态
//     }
//
//     //
//
//
//     // 分享按钮点击事件
//     const handleShare = () => {
//         const url = window.location.href; // 当前页面的 URL
//         navigator.clipboard.writeText(url); // 复制到剪贴板
//         message.success('已经复制URL到剪贴板');
//     };
//
//     /*不同的菜单项 不同的方法执行*/
//     const handleMenuClick = ({key}: { key: string }) => {
//         if (key === "1") {
//             // 执行标记为已掌握的方法
//             if (favorite?.favoriteType == 2) {
//                 handleCancel();
//
//             } else {
//                 handleFavorite2();
//
//             }
//         } else if (key === "2") {
//             // 执行标记为易错的方法
//
//             if (favorite?.favoriteType == 1) {
//                 handleCancel();
//
//             } else {
//
//                 handleFavorite1();
//
//             }
//         }
//     };
//     // 标记按钮菜单
//     const markMenu = (
//         <Menu onClick={handleMenuClick}>
//             <Menu.Item key="1" icon={favorite?.favoriteType == 2 ? <CheckCircleFilled/> : <CheckCircleOutlined/>}>
//                 {favorite?.favoriteType!=2? '标记为已掌握' : '取消标记'}
//             </Menu.Item>
//             <Menu.Item key="2" icon={favorite?.favoriteType == 1 ? <FlagFilled/> : <FlagOutlined/>}>
//                 {favorite?.favoriteType!=1? '标记为易错' : '取消标记'}
//             </Menu.Item>
//         </Menu>
//     );
//
//
//
//     /*我决定把这个变成内嵌的*/
//     //todo 读懂这里的设计思路
//     return (
//         <div className="question-card">
//             <Card
//                 style={{borderRadius: 8, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'}}
//                 bodyStyle={{paddingBottom: 80}} // 留出底部按钮的空间
//             >
//                 {/*  /!* 卡片标题 *!/*/}
//                 {/*  <h1 style={{ fontSize: 24 }}>{question.title}</h1>*/}
//
//                 {/*  /!* 标签列表 *!/*/}
//                 {/*  <div style={{ marginBottom: 16 }}>*/}
//                 {/*      {question.tagList?.map((tag, index) => (*/}
//                 {/*          <span key={index} style={{ marginRight: 8, color: '#1890ff' }}>*/}
//                 {/*  {tag}*/}
//                 {/*</span>*/}
//                 {/*      ))}*/}
//                 {/*  </div>*/}
//
//                 {/*  /!* 内容区域 *!/*/}
//                 {/*  <div style={{ marginBottom: 16 }}>{question.content}</div>*/}
//                 <Title level={1} style={{fontSize: 24}}>
//                     {question.title}
//                 </Title>
//                 <TagList tagList={question.tagList}/>
//                 <div style={{marginBottom: 16}}/>
//                 <MdViewer value={question.content}/>
//
//                 {/* 底部按钮 */}
//                 <div style={{
//                     position: 'absolute',
//                     bottom: 0,
//                     left: 0,
//                     right: 0,
//                     display: 'flex',
//                     justifyContent: 'space-between',
//                     padding: '12px',
//                     background: '#f9f9f9',
//                     borderTop: '1px solid #e8e8e8'
//                 }}>
//                     {/* 收藏按钮 */}
//                     <Button
//                         type="text"
//                         block
//                         icon={favorite ? <HeartFilled/> : <HeartOutlined/>}
//                         onClick={favorite ? handleCancel : handleFavorite0}
//                     >
//
//                         {/*/!*这里实际上 只要favorite*存在 就会自动显示为已经被收藏了/}*/}
//                     {favorite ? '取消收藏' : '收藏'}
//                     </Button>
//
//                 {/* 分享按钮 */}
//                         <Button
//                             type="text"
//                             block
//                             icon={<ShareAltOutlined/>}
//                             onClick={handleShare}
//                         >
//                             分享
//                         </Button>
//
//                         {/* 标记按钮 */}
//                         <Dropdown overlay={markMenu} placement="topCenter" arrow>
//                             <Button type="text" block>
//                                 标记
//                             </Button>
//                         </Dropdown>
//                 </div>
//             </Card>
//             {/*<Card>*/}
//             {/*  <Title level={1} style={{ fontSize: 24 }}>*/}
//             {/*    {question.title}*/}
//             {/*  </Title>*/}
//             {/*  <TagList tagList={question.tagList} />*/}
//             {/*  <div style={{ marginBottom: 16 }} />*/}
//             {/*  <MdViewer value={question.content} />*/}
//             {/*</Card>*/}
//
//
//             <div style={{marginBottom: 16}}/>
//             <Card title="推荐答案">
//                 <MdViewer value={question.answer}/>
//             </Card>
//         </div>
// );
// };
//
// export default QuestionCard;

//GPT 精简优化之后的版本

"use client";
import React, { useEffect, useState } from "react";
import { Card, Button, message, Dropdown, Menu } from "antd";
import {
    ShareAltOutlined,
    HeartOutlined,
    HeartFilled,
    CheckCircleFilled,
    CheckCircleOutlined,
    FlagFilled,
    FlagOutlined,
} from "@ant-design/icons";
import { useSelector } from "react-redux";
import { RootState } from "@/stores";
import {
    addFavoriteUsingPost,
    deleteFavoriteUsingPost,
    getFavoriteVoByIdUsingGet,
    listFavoriteVoByPageUsingPost,
    updateFavoriteUsingPost,
} from "@/api/favoriteController";
import Title from "antd/es/typography/Title";
import TagList from "@/components/TagList";
import MdViewer from "@/components/MdViewer";
import useAddUserSignInRecord from "@/hooks/useAddUserSignInRecord";

import "./index.css";
import CommentSection from "@/components/CommentSection/page";
import MarkdownTOC from "@/components/MdToc";
import MdList from "@/components/MdToc";

interface Props {
    question: API.QuestionVO;
}

const QuestionCard: React.FC<Props> = ({ question }) => {
    const loginUser = useSelector((state: RootState) => state.loginUser);
    const userId = loginUser.id;
    const [favorite, setFavorite] = useState<any>(null);

    useAddUserSignInRecord();

    const handleLoad = async () => {
        const response = await listFavoriteVoByPageUsingPost({
            current: 1,
            pageSize: 1,
            questionId: question.id,
            userId,
        });
        if (response.data.records.length > 0) setFavorite(response.data.records[0]);
    };

    useEffect(() => {
        handleLoad();
    }, []); // 页面加载时执行

    const handleFavorite = async (type: number | null) => {
        if (type === null) {
            // 取消收藏
            if (favorite) {
                await deleteFavoriteUsingPost({ id: favorite.id });
                setFavorite(null);
                message.success("已取消收藏");
            }
        } else if (favorite) {
            // 更新收藏类型
            await updateFavoriteUsingPost({ id: favorite.id, favoriteType: type });
            setFavorite({ ...favorite, favoriteType: type });
            message.success("收藏状态已更新");
        } else {
            // 添加收藏
            const response = await addFavoriteUsingPost({
                userId,
                questionId: question.id,
                favoriteType: type,
            });
            const newFavorite = await getFavoriteVoByIdUsingGet({ id: response.data });
            setFavorite(newFavorite.data);
            message.success("已添加收藏");
        }
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        message.success("URL 已复制到剪贴板");
    };

    const handleMenuClick = ({ key }: { key: string }) => {
        const type = parseInt(key, 10);
        if (favorite?.favoriteType === type) {
            handleFavorite(null); // 取消当前标记
        } else {
            handleFavorite(type); // 更新标记
        }
    };

    const markMenu = (
        <Menu onClick={handleMenuClick}>
            <Menu.Item key="2" icon={favorite?.favoriteType === 2 ? <CheckCircleFilled /> : <CheckCircleOutlined />}>
                {favorite?.favoriteType !== 2 ? "标记为已掌握" : "取消标记"}
            </Menu.Item>
            <Menu.Item key="1" icon={favorite?.favoriteType === 1 ? <FlagFilled /> : <FlagOutlined />}>
                {favorite?.favoriteType !== 1 ? "标记为易错" : "取消标记"}
            </Menu.Item>
        </Menu>
    );

    return (
        <div className="question-card">
            <Card
                style={{borderRadius: 8, boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)"}}
                bodyStyle={{paddingBottom: 80}}
            >
                {/*<Title level={1} style={{ fontSize: 24 }}>*/}
                {/*    {question.title}*/}
                {/*</Title>*/}
                <div style={{display: 'flex', alignItems: 'center'}}>
                    <Title level={1} style={{fontSize: 24, margin: 0}}>
                        {question.title}
                    </Title>
                    {/*成功让标题这里实现了图标的同步 我大概知道怎么做了。。*/}
                    <div style={{marginLeft: 8, fontSize: 20}}>
                        {favorite?.favoriteType === 2 ? (
                            <CheckCircleFilled style={{color: '#52c41a'}}/>
                        ) : favorite?.favoriteType === 1 ? (
                            <FlagFilled style={{color: '#fa1414'}}/>
                        ) : favorite?.favoriteType === 0 ? (
                            <HeartFilled style={{color: '#fa14b1'}}/>
                        ) : (<div/>)}
                    </div>
                </div>
                <TagList tagList={question.tagList}/>
                <MdViewer value={question.content}/>


                <div
                    style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "12px",
                        background: "#f9f9f9",
                        borderTop: "1px solid #e8e8e8",
                    }}
                >
                    <Button
                        type="text"
                        block
                        icon={favorite ? <HeartFilled/> : <HeartOutlined/>}
                        onClick={() => handleFavorite(favorite ? null : 0)}
                    >
                        {favorite ? "取消收藏" : "收藏"}
                    </Button>
                    <Button type="text" block icon={<ShareAltOutlined/>} onClick={handleShare}>
                        分享
                    </Button>
                    <Dropdown overlay={markMenu} placement="topCenter" arrow>
                        <Button type="text" block>
                            标记
                        </Button>
                    </Dropdown>
                </div>


            </Card>
            <div style={{marginBottom: 16}}/>
            <Card title="推荐答案">
                <MdViewer value={question.answer}/>
            </Card>
            {/*我顿时觉得 自己似乎真的对这个理解还不够深刻*/}
            {/*加入垂直艰巨*/}
            <div style={{marginBottom: 16}}/>
            <CommentSection qId={question.id}></CommentSection>
        </div>
    );
};

export default QuestionCard;
