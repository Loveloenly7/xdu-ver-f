'use client'

import React, {useState, useEffect} from "react";
import {Tabs, List, Button, message} from "antd";
import {
    updateMessageUsingPost,
    listMessageByPageUsingPost, deleteMessageUsingPost
    //todo 他妈的VO不传content？？？
} from "@/api/messageController";
import dayjs from "dayjs";

const {TabPane} = Tabs;


//消息中心 功能基本完成
//未读消息和已读消息 不同的渲染模式 未读的显示高亮
//然后加入全部的消息列表
//加入已读消息的删除功能
//加入批量的消息删除功能。。？

const MessageTabs = ({userId}) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentTab, setCurrentTab] = useState("comment_unread");
    const [pagination, setPagination] = useState({current: 1, pageSize: 5, total: 0});
    const [sortOrder, setSortOrder] = useState("descend"); // 默认降序

    const fetchMessages = async (type, isRead, page = 1) => {
        setLoading(true);
        try {
            const response = await listMessageByPageUsingPost({
                userId,
                type,
                isRead,
                current: page,
                pageSize: pagination.pageSize,
                sortField: "createTime",
                sortOrder,
            });
            setMessages(response.data.records || []);
            setPagination({...pagination, total: response.data.total, current: page});
        } catch (error) {
            console.error("加载消息失败", error);
        }
        setLoading(false);
    };

    const handleTabChange = (key) => {
        setCurrentTab(key);
        const [type, isRead] = key.split("_");
        fetchMessages(type, isRead === "read" ? 1 : 0, 1);
    };

    const handleSortToggle = () => {
        const newSortOrder = sortOrder === "ascend" ? "descend" : "ascend";
        setSortOrder(newSortOrder);
        const [type, isRead] = currentTab.split("_");
        fetchMessages(type, isRead === "read" ? 1 : 0, pagination.current);
    };

    // const handleMarkAsRead = async (messageId) => {
    //     try {
    //         await updateMessageUsingPost({id: messageId, isRead: 1});  // 调用单个更新接口
    //         // message.success("消息标记为已读！");
    //         const [type, isRead] = currentTab.split("_");
    //         await fetchMessages(type, isRead === "read" ? 1 : 0, pagination.current); // 更新消息列表
    //     } catch (error) {
    //         console.error("标记消息为已读失败", error);
    //     }
    // };

    //避免重复请求 本地直接更新状态
    const handleMarkAsRead = async (messageId) => {
        try {
            // 调用单个更新接口，标记为已读
            await updateMessageUsingPost({id: messageId, isRead: 1});

            // 前端直接更新消息列表（减少一次接口调用）
            //todo 重点学这里的思路
            //遍历到 更改字段 更新整体状态
            const updatedMessages = messages.map((message) =>
                message.id === messageId ? {...message, isRead: 1} : message
            );
            setMessages(updatedMessages); // 假设用 `useState` 管理消息列表

            // 更新成功提示
            // message.success("消息标记为已读！");

        } catch (error) {
            // 错误提示
            console.error("标记消息为已读失败", error);
            message.error("操作失败，请稍后重试！");
        }
    };


    const handleMarkAllAsRead = async () => {
        try {
            for (const msg of messages) {
                await updateMessageUsingPost({id: msg.id, isRead: 1}); // 批量调用单个更新接口
            }
            message.success("本页所有未读消息已标记为已读！");
            handleTabChange(currentTab); // 重新获取消息列表
        } catch (error) {
            console.error("一键已读失败", error);
        }
    };

    useEffect(() => {
        const [type, isRead] = currentTab.split("_");
        fetchMessages(type, isRead === "read" ? 1 : 0, pagination.current);
    }, [currentTab, sortOrder]);


    const handleMarkAllAsDeleted = async () => {
        try {
            for (const msg of messages) {
                await deleteMessageUsingPost({id: msg.id}); // 批量调用单个删除接口
                //todo 后端可以写一个批量删除
            }
            message.success("本页所有已读消息已经删除！");
            handleTabChange(currentTab); // 重新获取消息列表
        } catch (error) {
            console.error("一键删除失败", error);
        }
    }

    return (
        <Tabs defaultActiveKey="comment_unread" onChange={handleTabChange}>
            {/* 评论消息 Tab */}
            <TabPane tab="评论消息" key="comment_unread">
                <Tabs defaultActiveKey="unread" onChange={(key) => handleTabChange(`comment_${key}`)}>
                    {/* 未读评论消息 */}
                    <TabPane tab="未读消息" key="unread">
                        <div style={{textAlign: "right", marginBottom: 16}}>
                            <Button onClick={handleSortToggle}>
                                {sortOrder === "ascend" ? "升序" : "降序"}
                            </Button>
                            <Button type="link" onClick={handleMarkAllAsRead}>
                                一键已读
                            </Button>
                        </div>

                        <List
                            loading={loading}
                            dataSource={messages}
                            pagination={{
                                current: pagination.current,
                                pageSize: pagination.pageSize,
                                total: pagination.total,
                                onChange: (page) => {
                                    const [type, isRead] = currentTab.split("_");
                                    fetchMessages(type, isRead === "read" ? 1 : 0, page);
                                },
                            }}
                            renderItem={(item) => {

                                //原来是在渲染之前进行处理。。
                                // 处理 item.content，提取 msg 和 questionId
                                const regex = /「「「(.*?)」」」/;

                                console.log(item.content);
                                //我日 VO没有content 后端在干嘛！！！！！
                                // 提取 questionId
                                const match = item?.content?.match(regex);
                                const questionId = match ? match[1] : null;  // 获取 questionId（如果没有匹配到，返回 null）

                                // 移除 questionId 部分，提取剩下的消息内容
                                const msg = item?.content?.replace(regex, "").trim();  // 删除 questionId 部分，得到纯粹的消息

                                return (
                                    //他这个直接给Listitem绑定onClick事件 我觉得挺有意思的。。。
                                    <List.Item
                                        style={{cursor: "pointer"}}
                                        onClick={() => {
                                            // 调用标记为已读的方法，并在成功后跳转到对应的详情页面
                                            handleMarkAsRead(item.id)
                                                .then(() => {
                                                    if (questionId) {
                                                        window.open(`/question/${questionId}`, "_blank");
                                                    }
                                                })
                                                .catch((error) => {
                                                    console.error("标记为已读失败:", error);
                                                });
                                        }}
                                    >
                                        {/*请看清楚 这是 评论里面的未读。。*/}

                                        <List.Item.Meta
                                            title={`您的评论收到回复`}
                                            description={msg}  // 渲染纯粹的消息内容
                                        />
                                        {/* 渲染 questionId 为隐藏的链接，点击时跳转 */}
                                        <div>{dayjs(item.createTime).format("YYYY-MM-DD HH:mm")}</div>
                                    </List.Item>
                                );
                            }}
                        />

                    </TabPane>
                    {/* 已读评论消息 */}
                    <TabPane tab="已读消息" key="read">
                        <div style={{textAlign: "right", marginBottom: 16}}>
                            <Button onClick={handleSortToggle}>
                                {sortOrder === "ascend" ? "升序" : "降序"}
                            </Button>
                            <Button type="link" onClick={handleMarkAllAsDeleted}>
                                一键删除已读
                            </Button>
                        </div>

                        <List
                            loading={loading}
                            dataSource={messages}
                            pagination={{
                                current: pagination.current,
                                pageSize: pagination.pageSize,
                                total: pagination.total,
                                onChange: (page) => {
                                    const [type, isRead] = currentTab.split("_");
                                    fetchMessages(type, isRead === "read" ? 1 : 0, page);
                                },
                            }}
                            renderItem={(item) => {

                                //原来是在渲染之前进行处理。。
                                // 处理 item.content，提取 msg 和 questionId
                                const regex = /「「「(.*?)」」」/;

                                console.log(item.content);
                                //我日 VO没有content 后端在干嘛！！！！！
                                // 提取 questionId
                                const match = item?.content?.match(regex);
                                const questionId = match ? match[1] : null;  // 获取 questionId（如果没有匹配到，返回 null）

                                // 移除 questionId 部分，提取剩下的消息内容
                                const msg = item?.content?.replace(regex, "").trim();  // 删除 questionId 部分，得到纯粹的消息

                                return (
                                    //他这个直接给Listitem绑定onClick事件 我觉得挺有意思的。。。
                                    <List.Item
                                        style={{cursor: "pointer"}}
                                        onClick={() => {


                                            if (questionId) {
                                                window.open(`/question/${questionId}`, "_blank");
                                            }

                                        }}
                                    >
                                        {/*破防了 我改了半天才看到 老子改的是他妈的系统消息里面的· 然后在这测试半天*/}
                                        <List.Item.Meta
                                            title={`您的评论收到回复`}
                                            description={msg}  // 渲染纯粹的消息内容
                                        />
                                        {/* 渲染 questionId 为隐藏的链接，点击时跳转 */}
                                        <div>{dayjs(item.createTime).format("YYYY-MM-DD HH:mm")}</div>
                                    </List.Item>
                                );
                            }}
                        />
                    </TabPane>
                </Tabs>
            </TabPane>

            {/* 系统消息 Tab */}
            <TabPane tab="系统消息" key="system_unread">
                <Tabs defaultActiveKey="unread" onChange={(key) => handleTabChange(`system_${key}`)}>
                    {/* 未读系统消息 */}
                    <TabPane tab="未读消息" key="unread">
                        <div style={{textAlign: "right", marginBottom: 16}}>
                            <Button onClick={handleSortToggle}>
                                {sortOrder === "ascend" ? "升序" : "降序"}
                            </Button>
                            <Button type="link" onClick={handleMarkAllAsRead}>
                                一键已读
                            </Button>
                        </div>

                        <List
                            loading={loading}
                            dataSource={messages}
                            pagination={{
                                current: pagination.current,
                                pageSize: pagination.pageSize,
                                total: pagination.total,
                                onChange: (page) => {
                                    //这里居然是把key拆了来搞的。。？
                                    const [type, isRead] = currentTab.split("_");
                                    fetchMessages(type, isRead === "read" ? 1 : 0, page);
                                },
                            }}
                            renderItem={(item) => {

                                //原来是在渲染之前进行处理。。
                                // 处理 item.content，提取 msg 和 questionId

                                const regex1 = /报告ID：(\d+)/; // 不加 g 标志


                                // 移除 questionId 部分，提取剩下的消息内容
                                const msg = item?.content?.trim();

                                // const regex1 = /报告ID：(\d+)/g;
                                // const regex1 = /报告ID：(\d+)/; // 不加 g 标志
                                const match1 = msg.match(regex1);
                                const reportId = match1 ? match1[1] : null; // 捕获组中的数字

                                return (
                                    //他这个直接给Listitem绑定onClick事件 我觉得挺有意思的。。。
                                    //todo 设置点击之后标记为已读 然后再跳转
                                    <List.Item
                                        style={{cursor: "pointer"}}
                                        onClick={() => {
                                            // 调用标记为已读的方法，并在成功后跳转到对应的详情页面
                                            handleMarkAsRead(item.id)

                                                    //改成报告ID
                                                    if (reportId) {
                                                        window.open(`/test/${reportId}`, "_blank");
                                                    }


                                        }}
                                    >


                                        <List.Item.Meta
                                            title={`系统消息`}
                                            description={msg}  // 渲染纯粹的消息内容
                                        />
                                        {/* 渲染 questionId 为隐藏的链接，点击时跳转 */}
                                        <div>{dayjs(item.createTime).format("YYYY-MM-DD HH:mm")}</div>
                                    </List.Item>
                                );
                            }}
                        />
                    </TabPane>
                    {/* 已读系统消息 */}
                    <TabPane tab="已读消息" key="read">

                        <div style={{textAlign: "right", marginBottom: 16}}>
                            <Button onClick={handleSortToggle}>
                                {sortOrder === "ascend" ? "升序" : "降序"}
                            </Button>
                            <Button type="link" onClick={handleMarkAllAsDeleted}>
                                一键删除已读
                            </Button>
                        </div>

                        <List
                            loading={loading}
                            dataSource={messages}
                            pagination={{
                                current: pagination.current,
                                pageSize: pagination.pageSize,
                                total: pagination.total,
                                onChange: (page) => {
                                    //这里居然是把key拆了来搞的。。？
                                    const [type, isRead] = currentTab.split("_");
                                    fetchMessages(type, isRead === "read" ? 1 : 0, page);
                                },
                            }}
                            renderItem={(item) => {

                                //原来是在渲染之前进行处理。。
                                // 处理 item.content，提取 msg 和 questionId
                                const regex = /「「「(.*?)」」」/;

                                // console.log(item.content);
                                //我日 VO没有content 后端在干嘛！！！！！
                                // 提取 questionId
                                const match = item?.content?.match(regex);
                                const questionId = match ? match[1] : null;  // 获取 questionId（如果没有匹配到，返回 null）

                                // 移除 questionId 部分，提取剩下的消息内容
                                const msg = item?.content?.replace(regex, "").trim();  // 删除 questionId 部分，得到纯粹的消息

                                // const regex1 = /报告ID：(\d+)/g;
                                const regex1 = /报告ID：(\d+)/; // 不加 g 标志
                                const match1 = msg.match(regex1);
                                const reportId = match1 ? match1[1] : null; // 捕获组中的数字

                                return (
                                    //他这个直接给Listitem绑定onClick事件 我觉得挺有意思的。。。
                                    //todo 设置点击之后标记为已读 然后再跳转
                                    <List.Item
                                        style={{cursor: "pointer"}}
                                        onClick={() => {
                                            // 调用标记为已读的方法，并在成功后跳转到对应的详情页面
                                            // handleMarkAsRead(item.id)
                                            //     .then(() => {
                                            //         if (questionId) {
                                            //             window.open(`/question/${questionId}`, "_blank");
                                            //         }
                                            //改成报告ID
                                            if (reportId) {
                                                window.open(`/test/${reportId}`, "_blank");
                                            }
                                        }}
                                    >


                                        <List.Item.Meta
                                            title={`系统消息`}
                                            description={msg}  // 渲染纯粹的消息内容
                                        />
                                        {/* 渲染 questionId 为隐藏的链接，点击时跳转 */}
                                        <div>{dayjs(item.createTime).format("YYYY-MM-DD HH:mm")}</div>
                                    </List.Item>
                                );
                            }}
                        />
                    </TabPane>
                </Tabs>
            </TabPane>
        </Tabs>

    );
};

export default MessageTabs;

