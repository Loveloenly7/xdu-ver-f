"use client";

import React, {useEffect, useState} from "react";

import html2canvas from "html2canvas";
import {Card, Button, Table, message, Modal, Space, Spin} from "antd";
import Image from "next/image";
import {
    deleteInterviewRecordUsingPost, listInterviewRecordByPageUsingPost,
} from "@/api/interviewRecordController";
import {listInterviewRecordDetailVoByPageUsingPost} from "@/api/interviewRecordDetailController";
import "./index.css";
import MdViewer from "@/components/MdViewer";
import {usePathname} from "next/navigation";
import {getQuestionVoByIdUsingGet} from "@/api/questionController";
import Link from "next/link";
import {Pie, Radar, WordCloud} from "@ant-design/plots";
import {aiGenerateTestMqUsingPost} from "@/api/aiController";

import QuestionRecord = API.QuestionRecord;
import {CloseCircleOutlined, LoadingOutlined} from "@ant-design/icons";

import {
    batchAddFavoritesUsingPost,
    batchDeleteFavoritesUsingPost,
    listFavoriteByPageUsingPost
} from "@/api/favoriteController";
import {useSelector} from "react-redux";
import {RootState} from "@/stores";
import TagList from "@/components/TagList";


const TestResultPage = () => {

    const pathname = usePathname();

    //获取当前的登录用户
    const loginUser = useSelector((state: RootState) => state.loginUser);

    // 解析路径，提取参数
    /*字符串处理*/
    const parts = pathname.split("/").filter((part) => part); // 去掉空字符串

    //拿到路径test/1 这里面的1 这是面试记录的id
    const id = parseInt(parts[1], 10); // 路径的第二段是参数
    /*parseInt 的作用：
  它会将一个字符串解析成整数，结果是一个 number 类型。*/

    // 状态管理
    /*面试记录 单个*/
    const [record, setRecord] = useState<any>(null);
    /*面试记录详情 集合*/
    const [details, setDetails] = useState<any>([]);
    /*题目详情 集合*/
    const [questions, setQuestions] = useState<any>([]);
    /*加载？*/
    const [loading, setLoading] = useState(true);

    //词云的数据源
    const [cloud, setCloud] = useState([]);
    //来一个数组作为词云的来源 包含字符串数组
    const cloudWords = [];

    //饼图数据源 数组里面包含对象

    const [pieData, setPieData] = useState([]);

    //favorite也存着吧 当前用户的favorite集合
    const [favorite, setFavorite] = useState([]);

    //全局用来存的数组
    const pies = [];


    //经过处理的报告
    const [report, setReport] = useState("\n" +
        "\n" +
        "---\n" +
        "\n" +
        "\n" +
        "\n" +
        "# 题目（来自\"questionTitle\"）\n" +
        "\n" +
        "分析（用正文）（来自\"analysis\"）\n" +
        "\n" +
        "*建议（用md斜体格式）（来自\"suggestion\"）*\n" +
        "\n" +
        "注意每一题之间要生成分割线");


    //经过处理之后的雷达图数据
    const [dataRadar, setDataRadar] = useState([
        {question: '题目1', fitPercentage: 85},
        {question: '题目2', fitPercentage: 60},
        {question: '题目3', fitPercentage: 40},
        {question: '题目4', fitPercentage: 90},
        {question: '题目5', fitPercentage: 70},
    ]);

    //这里连着问题一并获取了！
    //返回的promise被忽略。？

    // 页面加载时请求数据
    // useEffect(() => {
    //     if (id) {
    //         fetchRecord();
    //         fetchDetails();
    //         fetchQuestions();
    //     }
    // }, [id]);

    //确保异步！

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 首先获取面试记录
                await fetchRecord();
                // 获取面试详情
                await fetchDetails();
                // 获取问题列表
                await fetchQuestions();

                // 所有数据获取完成，更新加载状态
                setLoading(false); // 当数据获取完成，设置 loading 为 false，渲染页面
            } catch (error) {
                console.error("Error fetching data:", error);
                setLoading(false); // 即使发生错误，也将 loading 设置为 false，以避免永远不渲染
            }
        };

        fetchData(); // 调用异步数据获取函数
    }, []); // 空依赖数组，确保只在组件挂载时调用一次

    /*在组件加载或 id 参数变化时调用 并且要求的是id变化而且存在 */

    const fetchRecord = async () => {
        try {
            // setLoading(true);
            //别 有ai报告就拿
            // const { data } = await getInterviewRecordVoByIdUsingGet({ id: id });
            // setRecord(data);

            //这里暂时用分页的方法吧 get单个没有

            const {data} = await listInterviewRecordByPageUsingPost({id: id, pageSize: 1, current: 1});

            setRecord(data.records[0]);


        } catch (error) {
            console.error(error);
            message.error("getInterviewRecordVoByIdUsingGet 加载面试记录时出现错误");
        } finally {
            // setLoading(false);
        }
    };

    //饼图会用到的 格式化时间的函数
    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return minutes > 0
            ? `${minutes}m ${remainingSeconds}s`
            : `${remainingSeconds}s`;
    };

    //加载多条面试详情
    const fetchDetails = async () => {
        // setLoading(true);

        try {
            // listInterviewRecordDetailByPage
            //             const {data} = await listInterviewRecordDetailVoByPageUsingPost({
            //                 current: 1,
            //                 interviewRecordId: 1,
            //                 pageSize: 15,
            //                 sortField: 'createTime',
            //                 sortOrder: "ascend"
            //             });
            //
            //             console.log('data'+data);
            //             //
            //             /*{
            //   "current": 1,
            //   "interviewRecordId": 1,
            //   "pageSize": 10,
            //   "sortField": "createTime",
            //   "sortOrder": "ascend"
            // }*/
            //             setDetails(data.records || []);
            const response = await listInterviewRecordDetailVoByPageUsingPost({
                current: 1,
                interviewRecordId: id,
                pageSize: 10,
                sortField: "id",
                sortOrder: "ascend",
            });
            //保证对应 换成了id进行排序
            //奇怪 我用解构为什么拿不到数据。。？
            //能的 这里是异步问题
            setDetails(response.data.records);
            // 使用 forEach 遍历 records

            //用for循环遍历response.data.records 里面的每一个元素的timeTaken字段内容（number） 记录到一个新对象里 记为value属性 然后把这个新对象推进数组pies
            // response.data.records.forEach((record) => {
            //     const newObject = {
            //         value: record.timeTaken, // 将 timeTaken 记录为 value 属性
            //         time: formatTime(record.timeTaken),
            //     };
            //
            //     pies.push(newObject); // 将新对象推进 pies 数组
            // });

            // console.log('dangqian')
            // console.log(response.data.records)
            // response.data.records.forEach((record, index) => {
            for (const [index, record] of response.data.records.entries()) {
                /*forEach 循环会遍历 response.data.records 数组。forEach 的回调函数可以接受两个参数：
        record：当前遍历的元素。
        index：当前元素在数组中的索引。*/

                // 判断对应 index 的位置是否已经存在对象

                console.log("当前pies数组");

                console.log(pies);
                console.log("当前遍历到的下标");

                console.log(index);
                console.log("拿到时间");
                console.log("当前下标的pies里面的元素");

                //OK 总之不是undefined了
                console.log(pies[index]);
                if (pies[index]) {
                    // 如果存在对象，直接添加属性
                    pies[index].value = record.timeTaken;
                    pies[index].time = formatTime(record.timeTaken);
                } else {
                    // 如果不存在对象，创建新对象并添加到 pies 数组
                    pies[index] = {
                        value: record.timeTaken, // 将 timeTaken 记录为 value 属性
                        time: formatTime(record.timeTaken), // 格式化后的时间
                        type: null,
                    };
                }
            }

            setPieData(pies);
        } catch (error) {
            console.error(error);
            message.error("加载多条面试详情时出现错误");
        }

        //接下来是根据拿到的details查询id 拿到questionId的集合 再查询拿到。。
        //但是这样是不是发的请求稍微有点多。。？
        //todo 后端考虑写一个传id数组进去就能查询的方法。。。减少了请求数量 但是。。还是要执行那么多条查询语句啊 意义何在呢。？

        // details是一个包含多个对象的数组 请遍历提取这个数组里面的每个对象里的questionId字段到另一个数组里面（保持顺序）

        // setLoading(false);
    };

    //加载多条题目数据
    const fetchQuestions = async () => {

        //todo 这里parseInt的时候 丢失了数据 在id为雪花算法的时候 不能这样。。
        const questionIds = details.map((item) => item.questionId);
        //测试拿到的题目id列表
        //注意这里是保持了顺序的！
        //todo bug
        // console.log(questionIds);

        /*遍历questionIds数组 根据里面的id调用getQuestionVOById方法 把拿到的对象封装到一个questions的数组里面*/
        const qs = [];
        //要不要规定类型呢。？

        //改造
        //论for循环的好处
        // for (const qid of questionIds) {
        //     try {
        //         const res = await getQuestionVoByIdUsingGet({id: qid}); // 调用 API
        //         if (res.data) {
        //             qs.push(res.data); // 成功时将结果添加到数组
        //
        //             res.data.title
        //
        //             const tagList=res.data.tagList;
        //             tagList.forEach((tag) => {
        //                 cloudWords.push(tag); // 将每一项推入 目标数组
        //             });
        //
        //         } else {
        //             console.warn(`无法获取ID为 ${qid} 的题目：`);
        //         }
        //     } catch (error) {
        //         console.error(`获取ID为 ${id} 的题目时出错`, error);
        //     }
        // }

        for (const [index, qid] of questionIds.entries()) {
            console.log("qids!!!!");

            console.log(questionIds);
            /*for...of 和 entries() 配合使用：
      for (const [index, qid] of questionIds.entries()) 使用 entries() 方法来获取每个 qid 及其对应的下标 index。
      这样你可以通过下标将 title 正确放入 pies 数组中。*/
            try {
                const res = await getQuestionVoByIdUsingGet({id: qid}); // 调用 API 获取题目信息
                if (res.data) {
                    qs.push(res.data); // 将题目数据推入到 qs 数组


                    // 将标签推入 cloudWords 数组
                    const tagList = res.data.tagList;
                    tagList.forEach((tag) => {
                        cloudWords.push(tag); // 每个标签推入 cloudWords
                    });

                    if (pieData[index]) {
                        pieData[index].type = res.data.title; // 给现有对象添加 title 属性
                    } else {
                        pieData[index] = {value: null, time: null, type: res.data.title}; // 如果没有该下标，创建新对象
                    }
                } else {
                    console.warn(`无法获取ID为 ${qid} 的题目`);
                }
            } catch (error) {
                console.error(`获取ID为 ${qid} 的题目时出错`, error);
            }

            setPieData(pieData);

        }

        //饼图设置

        // 将字符串数组转换为词云图数据格式，随机生成权重
        const formattedData = cloudWords.map((text) => ({
            text, // 词语内容
            value: Math.floor(Math.random() * (100 - 75 + 1)) + 75, // 权重在 10 到 100 之间随机
        }));

        /*value: Math.floor(Math.random() * (最大值 - 最小值 + 1)) + 最小值;
         */

        setCloud(formattedData); // 设置数据源

        //这样一来 题目也被设定好了
        setQuestions(qs);
        console.log("qs!!!!");

        console.log(qs);

    };

    // WordCloud 配置
    const config = {
        data: cloud, // 动态生成的数据
        wordField: "text", // 对应数据中的词语字段
        weightField: "value", // 对应数据中的权重字段
        colorField: "text", // 根据词语内容着色
        wordStyle: {
            fontSize: [40, 60], // 字体大小范围
            rotation: [0, Math.PI / 3], // 随机旋转角度范围
            // rotation: [0, 0], // 随机旋转角度范围
        },
        layout: {
            spiral: "rectangular", // 布局类型
        },
    };

    // //todo 测试
    //卧槽 不是传不过来 只是需要时间！！！！
    // 使用 useEffect 监听 details 的变化

    //这下就成功了 那就可以暂时不管了。。。
    useEffect(() => {
        console.log("Details updated:", details);

        fetchQuestions();
    }, [details]); // 当 details 发生变化时打印

    //执行继续面试的逻辑
    const handleContinue = () => {
        //因为只要没点提交 timeTaken就不会更新 这是我之前做的设计
        const nextDetail = details.find((detail) => detail.timeTaken === null);
        if (nextDetail) {
            // navigate(`/test/${id}/${nextDetail.id}`);
            //用这种方法
            window.location.href = `/test/${id}/${nextDetail.id}`;
        } else {
            message.warning("没有未完成的面试详情");
        }
    };

    //点击放弃面试
    const handleAbandon = async () => {
        Modal.confirm({
            title: "确认放弃这次面试？你的作答记录也会一并被清楚哦！",
            onOk: async () => {
                try {
                    const res = await deleteInterviewRecordUsingPost({id: id});
                    if (res) {
                        message.success("面试记录已删除");
                        window.location.href = `/test`;
                    } else {
                        // 我终于知道后端的信息怎么传过来的了。。
                        message.error("删除面试记录失败");
                    }
                } catch (error) {
                    console.error(error);
                    message.error("删除面试记录时出现错误");
                }
            },
        });
    };

    //点击
    const handleReport = async () => {
        try { // const combineData = (questionList, InterviewRecordDetailList)=> {
            // 加了一层限制
            const combineData = (questionList, InterviewRecordDetailList): QuestionRecord[] => {
                // 检查输入数据是否有效，避免潜在错误
                if (!questionList || !InterviewRecordDetailList || questionList.length !== InterviewRecordDetailList.length) {
                    console.error("长度不一致，无法合并数据！");
                    return [];
                }

                // 遍历两个列表，按顺序构建新对象数组
                return questionList.map((question, index) => {
                    const detail = InterviewRecordDetailList[index];
                    return {
                        questionTitle: question.title, // 题目标题
                        questionDescription: question.content, // 题目描述
                        referenceAnswer: question.answer, // 参考答案
                        knowledgePoints: question.tagList, // 知识点列表
                        userAnswer: detail.answer, // 用户作答
                    };

                    /*这里对象的类型 规定为   type QuestionRecord = {
        knowledgePoints?: string[];
        questionDescription?: string;
        questionTitle?: string;
        referenceAnswer?: string;
        userAnswer?: string;
        };*/
                });
            };

            const srcData = combineData(questions, details);


            console.log(srcData);

            const response = await aiGenerateTestMqUsingPost({
                userId: record.userId,
                interviewRecordId: id,
                questionRecords: srcData
            });

            //本地设置record的状态
            record.status = 3;

            setRecord(record);
        } catch (e) {
            message.error('一键生成失败 请检查后端API')
        }

        message.success('已开始分析，您可以先离开页面等待面试完成的消息通知')

        //不知道会不会刷新

        //发给后端

        /*后端 先update 存到aireport字段里面 暂时存入
        * */

        //这里调用第一个后端方法


        //这里写一个后端方法 发送到后端 让后端1. 持久化存储 2.开始调用第三方APi进行分析

        //显示发送成功 更改status字段为3 后端报告正在生成（关闭按钮）


    }


    //todo  有点想法

    // const handleGenerateReport = async () => {
    //
    //
    //
    //     const aiReport = record.aiReport;
    //     /*这个属性 在后端mysql里面是json
    //     * 存储的是标准的json字符串
    //     * 请先把它转为包含JSON对象的数组 然后遍历它
    //     *
    //     * 最后我需要得到两个数据 分别是
    //     *  //经过处理的报告
    // const [report, setReport] = useState("\n" +
    //     "\n" +
    //     "---\n" +
    //     "\n" +
    //     "\n" +
    //     "\n" +
    //     "# 题目（来自\"questionTitle\"）\n" +
    //     "\n" +
    //     "分析（用正文）（来自\"analysis\"）\n" +
    //     "\n" +
    //     "*建议（用md斜体格式）（来自\"suggestion\"）*\n" +
    //     "\n" +
    //     "注意每一题之间要生成分割线");
    //
    //
    // //经过处理之后的雷达图数据 来自题目标题和score
    // const [dataRadar, setDataRadar] = useState([
    //     { question: '题目1', fitPercentage: 85 },
    //     { question: '题目2', fitPercentage: 60 },
    //     { question: '题目3', fitPercentage: 40 },
    //     { question: '题目4', fitPercentage: 90 },
    //     { question: '题目5', fitPercentage: 70 },
    // ]);*/
    //
    //     //示例数据
    //     /*[{"score": 85, "analysis": "用户对于 ArrayList 的概念和常见操作有基本的了解，这是值得肯定的。用户提到 ArrayList 是一个动态数组，并能够支持自动扩展，这一点描述得很清楚。同时，用户列举了常用的方法，包括 add、get、remove 和 size，这与标准答案中的常见操作相吻合。然而，用户的回答在细节和深度上有所欠缺。例如，用户没有解释 ArrayList 实现的 List 接口，也没有提供具体的使用示例，这限制了回答的完整性和准确性。在标准答案中，我们提供了具体的代码示例，展示了如何使用这些方法，以及如何通过索引操作元素。此外，用户没有提及 ArrayList 在性能方面的特点，例如访问元素的时间复杂度和添加/删除元素时可能涉及的数据移动，这些都是深入理解 ArrayList 的重要方面。", "suggestion": "为了更好地掌握 ArrayList，建议用户深入研究 Java 集合框架，了解 List 接口中定义的方法及其在不同实现类中的性能差异。同时，通过编写更多的代码示例，加深对 ArrayList 各个方法使用场景和性能影响的理解。", "questionTitle": "Java ArrayList"}, {"score": 85, "analysis": "用户对JavaScript的原型链概念有基本的理解，指出了原型链是通过对象的原型属性连接多个对象，并形成继承关系。这是回答中的亮点。然而，用户的答案过于简略，没有详细描述原型链内部的机制以及如何实现继承。在分析中，我们需要强调以下几点：首先，原型链是依托于每个对象的内部属性 [[Prototype]] 的，这个属性是对象之间继承关系的桥梁。用户在这一点上没有具体阐述。其次，用户没有给出具体的原型链如何实现属性和方法的继承的例子，这是理解原型链的关键。例如，当尝试访问一个对象的属性或方法时，如果该对象自身没有这个成员，解释器会沿着原型链向上查找，直到找到匹配的成员或者达到原型链的顶端（通常是 Object.prototype）。此外，用户没有提到原型链的修改和重写对继承的影响，以及原型链在不同场景下的性能考量。", "suggestion": "为了更好地理解原型链，建议深入学习JavaScript的对象模型，特别是 [[Prototype]] 的内部工作原理以及原型链的深入应用。另外，通过编写更多具体的示例代码来加深对继承机制和原型链如何在实际开发中运用的认识。", "questionTitle": "JavaScript 原型链"}, {"score": 85, "analysis": "您的回答正确地概述了状态提升的概念，即状态从子组件传递到父组件，以便于父组件进行统一管理并通过props分配给需要的子组件。这是React中处理组件间状态共享的一种常见模式。然而，在您的回答中，对于状态提升的具体应用场景描述不够详细，没有提及如何在具体的代码中实现这一过程。在参考答案中，我们通过一个具体的示例说明了状态提升的实践方法，包括使用useState钩子创建可共享的状态，并通过props将这个状态及其更新函数传递给子组件。这种做法不仅使状态管理更为集中和清晰，而且有助于减少组件间的紧密耦合。此外，您的回答中遗漏了对状态提升带来的好处，如保持子组件的纯粹性和可复用性，以及它在复杂应用中的重要性。状态提升有助于简化复杂组件树中的数据流，减少不必要的渲染，并使得整个应用的状态管理更加有序。以下是对您回答的补充：1. 状态提升的具体实现方式：使用React的父子组件通信机制，通常是通过props传递状态和函数。2. 状态提升的优点：简化状态管理，避免在多个子组件间维护相同的状态，增强代码的可维护性和可读性。3. 状态提升在复杂应用中的重要性：随着应用规模的增长，状态提升对于保持组件的独立性和管理全局状态至关重要。以上内容是对您回答的补充和分析，希望对您理解React状态提升有进一步的帮助。", "suggestion": "建议您深入学习React的组件设计和状态管理原理，特别是在处理多组件共享状态时的最佳实践。了解高级状态管理库如Redux或Context API在处理复杂状态共享场景时的应用，将有助于您在构建大型应用时更加得心应手。", "questionTitle": "React 状态提升"}, {"score": 85, "analysis": "用户对于Java异常处理机制的回答是基本正确的，提到了try-catch语句的用途，即try块用来执行可能出错的代码，catch块用来处理异常。用户还正确地提到了除零错误作为异常的一个例子，这与参考答案中的内容是一致的。然而，用户的答案缺乏对异常处理机制的深度解释，没有详细说明异常是如何从try块传递到catch块的，也没有提到异常类的层次结构和如何捕获多种类型的异常。在深入分析方面，Java的异常处理机制是面向对象编程的一个重要组成部分。当一个方法遇到它不能处理的异常时，它会创建一个异常对象并将其抛出。抛出的异常必须被同一个方法或其他方法中的try-catch块捕获。异常类的继承结构允许catch块捕获特定类型的异常或者更一般的异常。例如，ArithmeticException是Exception类的子类，因此一个catch (Exception e)块也能捕获ArithmeticException。用户的答案中未提到以下关键点：1. 异常类的层次结构，特别是Throwable类及其两个子类Error和Exception。2. try-catch块可以嵌套使用，以处理复杂的情况。3. 可以有多个catch块来捕获不同类型的异常。4. 异常处理中还可以包含finally块，无论是否捕获异常，finally块中的代码都会执行。5. 异常链的概念，即一个异常可以有一个原因，这是通过initCause方法和getCause方法管理的。参考答案中提供的示例代码简洁明了，但用户的答案没有提供具体的代码示例，这在一定程度上减少了答案的完整性。", "suggestion": "建议用户深入学习Java异常处理的细节，包括异常类的层次结构、如何捕获和处理多种类型的异常、使用finally块的重要性以及异常链的概念。用户可以通过编写一些复杂的例子来实践这些知识点，从而加深理解并能够更全面地回答相关问题。", "questionTitle": "Java 异常处理"}]*/
    //
    //
    //
    //
    // }


    //完成格式的转化。。
    const handleMyReport = async () => {
        try {
            // 获取 JSON 字符串并解析为对象数组
            const aiReport = JSON.parse(record.aiReport);

            // 处理报告内容
            let generatedReport = "---\n\n";
            aiReport.forEach((item) => {
                const {questionTitle, analysis, suggestion} = item;
                generatedReport += `# 题目：${questionTitle}\n\n`;
                generatedReport += `${analysis}\n\n`;
                generatedReport += `*来自面试专家的一对一建议：“${suggestion}”*\n\n`;
                generatedReport += "---\n\n";
            });

            // 生成雷达图数据
            const radarData = aiReport.map((item) => ({
                question: item.questionTitle,
                fitPercentage: item.score,
            }));

            // 更新状态
            setReport(generatedReport);
            setDataRadar(radarData);
        } catch (error) {
            console.error("生成报告时出错：", error);
        }

    }

    // useEffect 监听 record.status 是否为 2
    useEffect(() => {
        if (record?.status === 2) {
            handleMyReport();
        }
    }, [record?.status]);


    //卡片1的渲染逻辑 （从后面的逻辑里面弄出来的！）
    const renderCard1 = () => {
        if (!record) return null;
        const pieConfig = {
            data: pieData,
            angleField: "value",
            /*angleField: 指定用于计算饼图角度的字段，值为数据中的 value。
      每个分类的 value 决定其在饼图中的比例。*/
            colorField: "type",
            /*    colorField: 'type',
            colorField: 指定用于区分颜色的字段，值为数据中的 type。
      不同的 type 会使用不同的颜色填充饼图分块。

      */
            // interactions: [
            //     { type: 'element-active' }, // 鼠标悬停交互
            // ],
            label: {
                text: "time",
                // position: 'outside',
                //避免标签之间重合用了spider。。 好像自定义了之后用spider会出事。。
                position: "spider",
                // render: customLabel,
            },
            /*label: 设置饼图标签的显示样式。
      text: 'value'：标签内容为数据的 value 字段值。
      position: 'outside'：标签显示在饼图外部。*/
            legend: {
                color: {
                    title: false,
                    position: "right",
                    rowPadding: 5,
                },
            },
        };

        const durationMinutes = Math.floor((record.duration || 0) / 60);
        const durationSeconds = (record.duration || 0) % 60;
        const suggestedMinutes = (record.totalQuestions || 0) * 5;

        return (
            <Card id="contentToSave1" title="信息概览" style={{marginBottom: 20}}>
                {/* 设置条件渲染 在未完成面试的时候不会显示这个 */}
                {record?.status !== 0 && (
                    <>
                        <p>建议完成时间：{suggestedMinutes}min</p>
                        <p>
                            实际完成时间：{durationMinutes}min {durationSeconds}s
                        </p>


                        {/* 使用一个容器包裹图表，控制容器的宽度占卡片宽度的80% */}
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                width: "80%",
                                margin: "0 auto",
                            }}
                        >
                            {/* WordCloud图表 */}
                            <div style={{marginBottom: 20}}>
                                <WordCloud {...config} />
                            </div>

                            {/* Pie图表 */}
                            <div style={{width: "100%", height: 400}}>
                                {" "}
                                {/* 确保容器宽高足够 */}
                                <Pie {...pieConfig} />
                            </div>
                        </div>
                    </>
                )}

                <p>面试者：{loginUser.userName}</p>
                <p>面试记录 ID：{record.id}</p>
            </Card>
        );
    };


    //一键设置本页题目为已掌握
    const handleConfirmAll = async () => {
        //分页 根据用户id查询favorite

        // {
        //   "current": 1,
        //   "pageSize": 100,
        //   "userId": 5
        // }

        let axiosResponse = null;
        try {
            axiosResponse = await listFavoriteByPageUsingPost({
                current: 1,
                pageSize: 999,
                userId: loginUser.id

            });
            setFavorite(axiosResponse.data.records);
        } catch (e) {
            message.error('分页获取当前用户的收藏夹失败')

        }


        //遍历 axiosResponse.data.records 这是一个数组 每个对象有questionId这个属性，
        //遍历questions这个集合 拿到里面的id构成的集合
        // 寻找axiosResponse.data.records 里面questionId符合在questions这个集合里面的id集合的数据，筛选出来成为一个新的集合
// 3. 首先提取 questions 里面的 id 集合
        const questionIds = questions.map((q) => q.id);

// 4. 筛选 records 中符合条件的对象（即 questionId 在 questionIds 中）
        const filteredRecords = axiosResponse.data.records.filter((record) =>
            questionIds.includes(record.questionId)
        );


        const favoriteIds = filteredRecords.map((f) => f.id);
        //如果存在 那么执行集体删除 这里只有可能是 。。 怎么保证回退。。？
        if (favoriteIds.length > 0) {
            try {
                await batchDeleteFavoritesUsingPost({favoriteIdList: favoriteIds});
            } catch (e) {
                message.error('批量删除原有数据的时候翻车了')
            }

        }


        /*构造{
            favoriteType?: number;
            questionId?: number;
            userId?: number;
          }; 这样的对象数组 type为2 qId来自遍历questionIds集合 userid来自Loginuser 然后作为参数调用下面的方法*/
        // 构造对象数组的逻辑
        const favoriteType = 2; // 设置 favoriteType 固定为 2
        const objectsArray = questionIds.map(questionId => ({
            favoriteType: favoriteType,
            questionId: questionId,
            userId: loginUser.id,
        }));
        //当前用户 根据当前页的questionId 进行批量添加favorite为已掌握 集体添加
        const response = await batchAddFavoritesUsingPost({favoriteAddRequests: objectsArray});

        if (response.data.length > 0) {
            message.success("已一键掌握本页所有题目")
        }

    }

    const renderCard2 = () => (
        // <Card title={'题目再现'} style={{ marginBottom: 20, textAlign: "center", height: 800 }}>
        <Card title={'题目再现'} style={{marginBottom: 20}}>
            {/*卧槽 三元表达式*/}


            {record?.status === 0 ? (
                // <img src="/testtodo.png" alt="待完成图片" style={{maxHeight: '100%'}}/> 换成nextjs里面自带的东西
                <Image
                    src="/testtodo.png"
                    alt="待完成图片"
                    style={{maxHeight: "100%"}}
                    width={800} // 需要指定宽度
                    height={800} // 需要指定高度
                />
            ) : (
                <div>
                    <Table
                        id="contentToSave2"
                        dataSource={questions.map((item, index) => ({
                            ...item,
                            key: item.id,
                            index: index + 1,
                        }))}
                        columns={[
                            {title: "面试题目序号", dataIndex: "index", key: "index"},
                            {
                                title: "题目名称",
                                dataIndex: "title",
                                key: "qname",
                                render: (text: string, record: any) => (
                                    // 使用 next/link 组件进行路由跳转 使用 passHref 来确保 href 被正确传递给 <a> 标签
                                    // <Link href={`/question/${record.id}`} passHref>
                                    //     <a target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'SimHei, Arial, sans-serif', fontWeight: 'bold' ,color: 'black'}}>{text}</a>
                                    // </Link>
                                    <Link
                                        href={`/question/${record.id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            fontFamily: "SimHei, Arial, sans-serif",
                                            fontWeight: "bold",
                                            color: "black",
                                        }}
                                    >
                                        {text}
                                    </Link>
                                ),
                            },
                            {
                                title: "标签",
                                dataIndex: "tagList",
                                key: "tagList",
                                render: (text: string[]) => (
                                    // 使用 next/link 组件进行路由跳转 使用 passHref 来确保 href 被正确传递给 <a> 标签
                                    // <Link href={`/question/${record.id}`} passHref>
                                    //     <a target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'SimHei, Arial, sans-serif', fontWeight: 'bold' ,color: 'black'}}>{text}</a>
                                    // </Link>
                                    <TagList tagList={text}>

                                    </TagList>

                                ),
                            },
                            // {
                            //     title: "快速操作",
                            //     render: (_, record) => (
                            //         <Space>
                            //             <Button onClick={() => message.info("收藏功能未实现")}>
                            //                 收藏
                            //             </Button>
                            //             <Button
                            //                 onClick={() =>
                            //                     message.info(
                            //                         "标记功能未实现 未来这里会出两个选项 快速标记为已掌握或者未解决",
                            //                     )
                            //                 }
                            //             >
                            //                 标记
                            //             </Button>
                            //         </Space>
                            //     ),
                            // },
                        ]}
                    />

                    <div style={{display: "flex", justifyContent: "flex-end", alignItems: "center"}}>
                        <Space>
                            <Button onClick={handleConfirmAll}>
                                一键标记题目为已掌握！
                            </Button>
                        </Space>
                    </div>


                </div>


            )}
        </Card>
    );

    // 雷达图的数据源
    // const dataRadar = [
    //     { question: '题目1', fitPercentage: 85 },
    //     { question: '题目2', fitPercentage: 60 },
    //     { question: '题目3', fitPercentage: 40 },
    //     { question: '题目4', fitPercentage: 90 },
    //     { question: '题目5', fitPercentage: 70 },
    // ];

    /*写一个方法加载雷达图的数据源*/


    /*写一个方法加载MdViewer的数据源 声明作为结果的字符串 提取JSON数组 遍历JSON数组 按照MD文档的格式
    *
    * 我在想这个MDviewer要不要引入目录 感觉可以用啊。。。
    *
    * 首先是getrecord 然后拿到里面的aireport
    *
    * 我觉得可以在一个方法里面把这个写完。。
    *
    * 首先这个会监听record里面的status的状态 不为2的时候不要加载
    * */

    // 雷达图的配置
    const configRadar = {
        data: dataRadar, // 数据源
        xField: 'question', // 横轴对应题目
        yField: 'fitPercentage', // 纵轴对应贴合百分比
        meta: {
            fitPercentage: {
                alias: '贴合百分比', // 显示别名
                min: 0, // 最小值
                max: 100, // 最大值
                formatter: (val) => `${val}%`, // 百分比格式化
            },
        },
        area: {
            style: {
                fillOpacity: 0.2, // 区域填充透明度
            },
        },
        point: {
            size: 8, // 数据点大小
            shape: 'circle', // 数据点形状
        },
        scale: {
            fitPercentage: {
                min: 0, // 数据范围从 0 开始
                max: 100, // 数据范围最大为 100
            },
        },
        axis: {
            x: {
                grid: true, // 显示网格线
            },
            y: {
                gridAreaFill: 'rgba(0, 0, 0, 0.04)', // 背景网格填充颜色
            },
        },
    };


    const renderCard3 = () => {
        if (!record) return null;

        return (<Card id="contentToSave3" title={'面试分析报告'}>
            {record.status === 0 && (
                <>
                    <Button
                        type="primary"
                        onClick={handleContinue}
                        style={{marginRight: 10}}
                    >
                        继续面试
                    </Button>
                    <Button danger onClick={handleAbandon}>
                        放弃面试
                    </Button>
                </>
            )}

            {record.status === 2 ? (
                <>
                    <Radar {...configRadar} />
                    <MdViewer value={report || ""}/>
                </>
            ) : record.status === 3 ? (
                <div style={{display: 'flex', alignItems: 'center'}}>
                    <Spin indicator={<LoadingOutlined/>}/> {/* 显示加载图标 */}
                    <span style={{marginLeft: 10}}>报告正在生成...</span>
                </div>
            ) : record.status === 4 ? (
                <div style={{display: 'flex', alignItems: 'center'}}>
                    <CloseCircleOutlined style={{color: 'red'}}/> {/* 显示错误图标 */}
                    <span style={{marginLeft: 10, color: 'red'}}>报告生成失败</span>
                </div>
            ) : record.status !== 0 && (
                <>
                    <Button
                        type="primary"
                        onClick={handleReport}
                    >
                        一键生成AI报告
                    </Button>
                </>
            )}
        </Card>);


    };

    const saveAsImage = async () => {
        // 获取三个需要截图的元素
        const element1 = document.getElementById("contentToSave1");
        const element2 = document.getElementById("contentToSave2");
        const element3 = document.getElementById("contentToSave3");

        // 使用 html2canvas 对每个元素截图
        const canvas1 = await html2canvas(element1);
        const canvas2 = await html2canvas(element2);
        const canvas3 = await html2canvas(element3);

        // 计算统一宽度
        const maxWidth = Math.max(canvas1.width, canvas2.width, canvas3.width);
        const totalHeight = canvas1.height + canvas2.height + canvas3.height;

        // 创建总 canvas
        const finalCanvas = document.createElement("canvas");
        finalCanvas.width = maxWidth;
        finalCanvas.height = totalHeight;
        const ctx = finalCanvas.getContext("2d");

        // Helper 函数：绘制单个 canvas 并对齐宽度
        const drawAlignedCanvas = (sourceCanvas, x, y) => {
            const tempCanvas = document.createElement("canvas");
            tempCanvas.width = maxWidth;
            tempCanvas.height = sourceCanvas.height;
            const tempCtx = tempCanvas.getContext("2d");

            // 填充背景色（可选）
            tempCtx.fillStyle = "#ffffff"; // 设置白色背景
            tempCtx.fillRect(0, 0, maxWidth, sourceCanvas.height);

            // 居中绘制源 canvas
            const offsetX = (maxWidth - sourceCanvas.width) / 2;
            tempCtx.drawImage(sourceCanvas, offsetX, 0);

            // 将对齐的临时 canvas 绘制到总 canvas
            ctx.drawImage(tempCanvas, x, y);
        };

        // 绘制每个 canvas 到总 canvas 中
        drawAlignedCanvas(canvas1, 0, 0);
        drawAlignedCanvas(canvas2, 0, canvas1.height);
        drawAlignedCanvas(canvas3, 0, canvas1.height + canvas2.height);

        // 将总 canvas 转换为图片并下载
        const link = document.createElement("a");
        const date = new Date();
        const formattedDate = `${date.getFullYear()}${(date.getMonth() + 1)
            .toString()
            .padStart(2, "0")}${date.getDate().toString().padStart(2, "0")}`;
        link.href = finalCanvas.toDataURL();
        link.download = `${formattedDate}为${loginUser.userName}生成的的报告.png`;
        link.click();
    };

    // 渲染：只有当 loading 为 false 时才渲染页面
    if (loading) {
        return <div>Loading...</div>; // 显示加载中的状态
    } else {
        return (
            // <div style={{width: "80%", margin: "0 auto"}}>
            //     {renderCard1()}
            //     {renderCard2()}
            //     {renderCard3()}
            // </div>
            <div style={{width: "90%", margin: "0 auto"}}>
                {renderCard1()}
                {renderCard2()}
                {renderCard3()}

                {record.status === 2 && (

                    // <div style={{marginBottom: 16, display: 'flex', gap: '10px'}}>
                    <div style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
                        {/*    好坑 那个高度 100 坑死了。。。*/}

                        <Button type="primary" onClick={saveAsImage} style={{marginTop: "20px"}}>
                            保存本页内容为图片
                        </Button>
                    </div>
                )
                }

            </div>
        )
            ;
    }
};

export default TestResultPage;