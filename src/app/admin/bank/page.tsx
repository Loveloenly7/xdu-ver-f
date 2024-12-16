"use client";
import CreateModal from "./components/CreateModal";
import UpdateModal from "./components/UpdateModal";
import {
    deleteQuestionBankUsingPost,
    listQuestionBankByPageUsingPost,
} from "@/api/questionBankController";
import {PlusOutlined} from "@ant-design/icons";
import type {ActionType, ProColumns} from "@ant-design/pro-components";
import {PageContainer, ProTable} from "@ant-design/pro-components";
import {Button, message, Space, Typography, Upload,Image} from "antd";
import React, {useRef, useState} from "react";
import './index.css';
import {uploadFileUsingPost} from "@/api/fileController";

/**
 * 题库管理页面
 *
 * @constructor
 */
const QuestionBankAdminPage: React.FC = () => {
    // 是否显示新建窗口
    const [createModalVisible, setCreateModalVisible] = useState<boolean>(false);
    // 是否显示更新窗口
    const [updateModalVisible, setUpdateModalVisible] = useState<boolean>(false);
    const actionRef = useRef<ActionType>();
    // 当前题库点击的数据
    const [currentRow, setCurrentRow] = useState<API.QuestionBank>();

    /**
     * 删除节点
     *
     * @param row
     */
    const handleDelete = async (row: API.QuestionBank) => {
        const hide = message.loading("正在删除");
        if (!row) return true;
        try {
            await deleteQuestionBankUsingPost({
                id: row.id as any,
            });
            hide();
            message.success("删除成功");
            actionRef?.current?.reload();
            return true;
        } catch (error: any) {
            hide();
            message.error("删除失败，" + error.message);
            return false;
        }
    };

    /**
     * 表格列配置
     */
    const columns: ProColumns<API.QuestionBank>[] = [
        {
            title: "id",
            dataIndex: "id",
            valueType: "text",
            hideInForm: true,
        },
        {
            title: "标题",
            dataIndex: "title",
            valueType: "text",
        },
        {
            title: "描述",
            dataIndex: "description",
            valueType: "text",
        },
        // {
        //   title: "图片",
        //   dataIndex: "picture",
        //   valueType: "image",
        //   fieldProps: {
        //     width: 72,
        //   },
        //   hideInSearch: true,
        // },
        {
            title: '图片',
            dataIndex: 'picture',
            valueType: 'image',
            fieldProps: {
                width: 72,
            },
            renderFormItem: (_, {type, defaultRender, record, ...rest}, form) => {
                const customRequest = async (options: any) => {
                    const {file, onSuccess, onError} = options;
                    try {
                        //todo biz这里是传枚举的名字还是说。。？
                        const response = await uploadFileUsingPost({biz: 'user_avatar'}, {}, file); // 调用后端方法
                        // console.log(response);
                        const url = response.data; // 假设后端返回的是上传文件的 URL 好像不是 返回的东西有点多我只能说 我草 为什么返回的东西那么离谱
                        //我怎么确定是这个字段呢
                        form.setFieldValue('picture', url); // 更新表单字段
                        onSuccess(response, file); // 通知上传成功
                    } catch (error) {
                        onError(error); // 通知上传失败
                    }
                };

                /*要调整 Upload 和 Image 的间距，使它们在同一行并且左右有间距，
                你可以使用 flex 布局来控制它们的排列和间距。*/
                return (

                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                        {form.getFieldValue('picture') && (
                            <div style={{ marginRight: 20 }}> {/* 右侧间距调整 */}
                                <Image
                                    width={100}
                                    src={form.getFieldValue('picture')} // 显示上传后的图片
                                    alt="Uploaded Image"
                                />
                            </div>
                        )}

                        <Upload
                            customRequest={customRequest} // 使用自定义上传方法
                            listType="picture-card"
                            maxCount={1}
                            showUploadList={false} // 不显示文件列表，只显示图片上传按钮
                            style={{ display: 'flex', alignItems: 'center' }} // 使用flex布局
                        >
                            {/* 上传按钮 */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <PlusOutlined />
                                <div style={{ marginTop: 8 }}>上传</div>
                            </div>
                        </Upload>


                    </div>


                );
            },
            hideInSearch: true,
        },
        {
            title: "创建时间",
            sorter: true,
            dataIndex: "createTime",
            valueType: "dateTime",
            hideInSearch: true,
            hideInForm: true,
        },
        {
            title: "编辑时间",
            sorter: true,
            dataIndex: "editTime",
            valueType: "dateTime",
            hideInSearch: true,
            hideInForm: true,
        },
        {
            title: "更新时间",
            sorter: true,
            dataIndex: "updateTime",
            valueType: "dateTime",
            hideInSearch: true,
            hideInForm: true,
        },
        {
            title: "操作",
            dataIndex: "option",
            valueType: "option",
            render: (_, record) => (
                <Space size="middle">
                    <Typography.Link
                        onClick={() => {
                            setCurrentRow(record);
                            setUpdateModalVisible(true);
                        }}
                    >
                        修改
                    </Typography.Link>
                    <Typography.Link type="danger" onClick={() => handleDelete(record)}>
                        删除
                    </Typography.Link>
                </Space>
            ),
        },
    ];

    return (
        <PageContainer>
            <ProTable<API.QuestionBank>
                headerTitle={"查询表格"}
                actionRef={actionRef}
                rowKey="key"
                search={{
                    labelWidth: 120,
                }}
                toolBarRender={() => [
                    <Button
                        type="primary"
                        key="primary"
                        onClick={() => {
                            setCreateModalVisible(true);
                        }}
                    >
                        <PlusOutlined/> 新建
                    </Button>,
                ]}
                request={async (params, sort, filter) => {
                    const sortField = Object.keys(sort)?.[0];
                    const sortOrder = sort?.[sortField] ?? undefined;

                    const {data, code} = await listQuestionBankByPageUsingPost({
                        ...params,
                        sortField,
                        sortOrder,
                        ...filter,
                    } as API.QuestionBankQueryRequest);

                    return {
                        success: code === 0,
                        data: data?.records || [],
                        total: Number(data?.total) || 0,
                    };
                }}
                columns={columns}
            />
            <CreateModal
                visible={createModalVisible}
                columns={columns}
                onSubmit={() => {
                    setCreateModalVisible(false);
                    actionRef.current?.reload();
                }}
                onCancel={() => {
                    setCreateModalVisible(false);
                }}
            />
            <UpdateModal
                visible={updateModalVisible}
                columns={columns}
                oldData={currentRow}
                onSubmit={() => {
                    setUpdateModalVisible(false);
                    setCurrentRow(undefined);
                    actionRef.current?.reload();
                }}
                onCancel={() => {
                    setUpdateModalVisible(false);
                }}
            />
        </PageContainer>
    );
};
export default QuestionBankAdminPage;
