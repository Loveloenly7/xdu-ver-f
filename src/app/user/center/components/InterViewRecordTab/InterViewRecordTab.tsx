import React, {useEffect, useState} from "react";
import {List, Button} from "antd";
import {listInterviewRecordVoByPageUsingPost} from "@/api/interviewRecordController";
import {CheckCircleOutlined, CloseCircleOutlined, BookOutlined} from "@ant-design/icons";
import dayjs from "dayjs";

const InterViewRecordTab = ({userId}) => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    //这个就是和那个蓝色的转圈圈的东西有关的东西。。
    const [pagination, setPagination] = useState({current: 1, pageSize: 5, total: 0});
    //有点东西 把分页的状态抽象出来成为一个模式。。。

    const [sortOrder, setSortOrder] = useState("descend"); // 新增：默认排序为降序

    // 切换排序方式
    const toggleSortOrder = () => {
        setSortOrder((prevOrder) => (prevOrder === "ascend" ? "descend" : "ascend"));
        fetchRecords(pagination.current); // 切换后重新加载数据
    };

    //获取面试记录的函数
    const fetchRecords = async (page = 1) => {
        setLoading(true);
        try {
            const response = await listInterviewRecordVoByPageUsingPost({
                userId,
                current: page,
                pageSize: pagination.pageSize,
                sortField: "createTime",
                sortOrder,
            });

            //加入排序。。？为什么不分页的时候就干。？

            //这相当于把排序交给前端来干。。

            //不不不 这个只是当前页面的升序可以这样干
            //
            // const sortedRecords =
            //     sortOrder === "ascend"
            //         ? response.data.records.sort((a, b) => new Date(a.createTime) - new Date(b.createTime))
            //         : response.data.records.sort((a, b) => new Date(b.createTime) - new Date(a.createTime));
            const sortedRecords =response.data.records || [];


            setRecords(sortedRecords || []);


            setPagination({...pagination, total: response.data.total, current: page});
        } catch (error) {
            console.error("加载面试记录失败", error);
        }
        setLoading(false);
    };



    //todo 有延迟bug 功能是正常的 但是有的时候降序排列我不知道为什么会出bug

    //todo 升序和降序的可以换一下ICON 让其更适合我们的需要。。。

    //初始化的时候 只加载第一页就可以
    useEffect(() => {
        fetchRecords(pagination.current);
    }, [sortOrder]);
    // 依赖项为空数组（[]），表示只在组件首次渲染时执行一次。


    //跟status有关的 挂在每一条后面表示状态的图标。。
    const renderIcon = (status) => {
        switch (status) {
            case 0:
                return <CloseCircleOutlined style={{color: "red"}}/>;
            case 1:
                return <CheckCircleOutlined style={{color: "green"}}/>;
            case 2:
                return <BookOutlined style={{color: "blue"}}/>;
            default:
                return null;
        }
    };


    //主体是一个列表 我还是喜欢用列表
    return (
        <>
            <div style={{textAlign: "right", marginBottom: 16}}>
                <Button onClick={toggleSortOrder}>
                    {sortOrder === "ascend" ? "升序" : "降序"}
                </Button>
            </div>

            <List
                loading={loading}
                dataSource={records}
                pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: pagination.total,
                    onChange: fetchRecords,
                }}
                renderItem={(item) => (
                    /*点击跳转居然还可以这样。。。？*/
                    <List.Item onClick={() => window.open(`/test/${item.id}`)} style={{cursor: "pointer"}}>
                        <List.Item.Meta
                            title={`面试记录 ID:${item.id}`}
                            description={`创建时间：${dayjs(item.createTime).format("YYYY-MM-DD HH:mm")}`}
                        />
                        {renderIcon(item.status)}
                    </List.Item>
                )}
            />

        </>

    );
};

export default InterViewRecordTab;
