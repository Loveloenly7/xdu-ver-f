//v4


// 根据v1改的v3
'use client';
// 声明该组件仅在客户端渲染

import React, {useState, useEffect} from 'react';
// 导入 React 以及 useState 和 useEffect 钩子
// import {useSearchParams} from 'next/navigation';
// 导入 next/navigation 中的钩子，用于获取页面 URL 的查询参数
import {Card, Button, Progress, Tag, message, ProgressProps} from 'antd';
// 导入 antd UI 库中的组件：Card、Button、Progress、Tag 和 message
import MDEditor from '@uiw/react-md-editor';
// 导入 MD 编辑器组件，用于显示和编辑 Markdown 格式的文本


//todo 问题最大的就是这里的数据源进来之后怎么处理
//我总觉得这几个方法 似乎不太够。。？
import {
    getInterviewRecordDetailVoByIdUsingGet, listInterviewRecordDetailVoByPageUsingPost,
    updateInterviewRecordDetailUsingPost
} from '@/api/interviewRecordDetailController';
// 导入 API 请求函数，用于获取和更新面试记录
import {getQuestionVoByIdUsingGet} from '@/api/questionController';
import {useRouter} from "next/router";
import {usePathname} from "next/navigation";
import {getInterviewRecordVoByIdUsingGet, updateInterviewRecordUsingPost} from "@/api/interviewRecordController";
import loginUser from "@/stores/loginUser";
import {useSelector} from "react-redux";
import {RootState} from "@/stores";
// 导入 API 请求函数，用于获取题目信息


const InterviewPage: React.FC = () => {
    // // 定义一个 React 函数组件
    // const searchParams = useSearchParams();
    // // 获取 URL 中的查询参数
    // const interviewRecordId = searchParams.get('interviewRecordId');
    // // 获取面试记录的 ID
    // const interviewRecordDetailId = searchParams.get('interviewRecordDetailId');
    // 获取面试记录详情的 ID


    //todo 问题又回到了这里
    //老子必读完你的官方文档
    // const router = useRouter();
    // const {interviewRecordId, interviewRecordDetailId} = router.query; // 从 URL 中获取 interviewRecordId 和 interviewRecordDetailId


    //他妈的老子有的是办法来实现你这些小功能 他妈的。。
    // 获取当前路径
    const pathname = usePathname();

    // 解析路径，提取参数
    const parts = pathname.split("/").filter((part) => part); // 去掉空字符串
    const interviewRecordId = parts[1]; // 路径的第二段是参数
    const interviewRecordDetailId = parts[2]; // 路径的第三段是参数


    // 定义组件的状态，使用 useState 钩子
    const [timer, setTimer] = useState(0);  //
    // 计时器的状态，初始化为 0
    const [progress, setProgress] = useState(0);
    // 答题进度的状态，初始化为 0
    const [question, setQuestion] = useState<any>(null);




    //因为涉及到保存 所以说这里我觉得要有这个
    //todo 面试记录详情记录 被记录到状态
    const [InterviewRecordDetail, setInterviewRecordDetail] = useState<any>(null);

    //我需要拿到以前的面试记录数据作为钩子
    //后来发现 好像不用这玩意。。？
    //todo 怎么可能用不到。。？ 最后完成面试的时候你要用这个啊！
    const [InterviewRecord, setInterviewRecord] = useState<any>(null);

    //面试记录的所有面试详细数据一条条的 作为数组
    //这个数组是重要的判断依据
    const [interviewDetails, setInterviewDetails] = useState<any>([]);




    // 当前题目的状态，初始为空
    //是因为这里传进来的是一个数据实体吗？
    const [answer, setAnswer] = useState('');
    // 用户的作答内容，初始为空

    //是否是最后一道题目的判断
    const [isLastQuestion, setIsLastQuestion] = useState(false);



    //需要当前的登录用户

    // const state = useState();


    //todo Redux逻辑

    // 从 Redux 状态中获取当前用户信息
    //没问题 就是这么干的。。。
    const loginUser = useSelector((state: RootState) => state.loginUser);


    //todo 用了 useEffect来保证定时保存用户的答案啊。。。

    // // 自动保存功能：每 60秒保存一次用户的答案
    // useEffect(() => {
    //     const autoSaveInterval = setInterval(() => {
    //         saveAnswer();
    //         // 定时调用保存答案的函数 只保存答案内容 未完成之前不会记录时间
    //     }, 60000);
    //     // 30 秒执行一次
    //     return () => clearInterval(autoSaveInterval);
    //     // 清除定时器，防止组件卸载时出现内存泄漏。。？
    //     //？
    // }, [answer]);
    // // 每次答案更新时重新执行该副作用

    useEffect(() => {
        // 如果答案为空，则不启动定时器
        if (!answer || answer.trim() === "") return;

        // 启动定时器
        const autoSaveInterval = setInterval(() => {
            saveAnswer();
        }, 60000);

        // 清除定时器，防止内存泄漏
        return () => clearInterval(autoSaveInterval);
    }, [answer]);



    // 计时器逻辑：页面加载时初始化计时，保持计时不丢失
    // 页面加载时初始化计时器
    useEffect(() => {
        // 从 localStorage 中获取上次计时的记录（如果存在）
        //todo localStorage
        const savedTime = parseInt(localStorage.getItem(`timer_${interviewRecordId}_${interviewRecordDetailId}`) || '0', 10);
        setTimer(savedTime);  // 设置当前的计时器状态

        // 设置每秒更新计时器的定时器
        const interval = setInterval(() => {
            setTimer((prev) => {
                const newTime = prev + 1;
                // 每秒增加 1 秒
                localStorage.setItem(`timer_${interviewRecordId}_${interviewRecordDetailId}`, String(newTime));
                // 保存最新的时间到 localStorage
                return newTime;
            });
        }, 1000);  // 每秒执行一次
        //你说这个会带来性能问题吗。。？ 我觉得不会。。。因为是前端本地的逻辑

        return () => clearInterval(interval);
        // 清除定时器，防止内存泄漏
    }, [interviewRecordId, interviewRecordDetailId]);
    // 依赖项是面试记录和记录详情的 ID，确保每个面试记录的计时器独立


    // 加载面试记录和题目信息
    //todo 首次加载？对的 页面加载的时候会初始化数据
    useEffect(() => {
        if (interviewRecordId && interviewRecordDetailId) {
            loadDetail();  // 如果面试记录 ID 和面试记录详情 ID 存在，则加载详细信息
        }
    }, [interviewRecordId, interviewRecordDetailId]);  // 依赖项是面试记录和记录详情的 ID


    const loadDetail = async () => {
        try {
            // 获取面试记录的详细信息 这是去拿当前这一条的
            const detailRes = await getInterviewRecordDetailVoByIdUsingGet({
                id: parseInt(interviewRecordDetailId as string, 10),  // 使用 API 请求获取面试记录详情
                //虽然我觉得这有点冗余。。。
                /*interviewRecordDetailId 是一个变量，表示面试记录的 ID（可能是字符串类型）。在这里，通过 as string 强制将其转换为字符串类型（即使它已经是字符串类型，这个转换操作并没有多大意义）。*/
                /*parseInt(..., 10)：
parseInt 是 JavaScript 的一个函数，用于将字符串解析为整数。第二个参数 10 表示将字符串按 10 进制解析。也就是说，interviewRecordDetailId 会被转换为一个整数，传递给 getInterviewRecordDetailVoByIdUsingGet 函数。

说人话 10进制转化*/

                /*  "data": {
    "id": "1",
    "interviewRecordId": "1",
    "questionId": "2",
    "answer": "这次的作答",
    "timeTaken": null,
    "createTime": "2024-11-25T12:16:08.000+00:00"
  },*/
            });


            const detailData = detailRes.data;  // 获取返回的数据


            //相当于这里加载页面的时候 也把这个数据对象的信息保存了 后面才好去更新它。。。
            //用来保存答案的 当前这一条数据
            setInterviewRecordDetail(detailData);


            //仿照上面的写法 写一个初始化获取面试记录的逻辑 因为涉及到update都需要这样去写。。。
            // const {data} = await getInterviewRecordVoByIdUsingGet({id:interviewRecordId});


            //初始化 这条面试详情属于的面试记录
            const {data} = await getInterviewRecordVoByIdUsingGet({id: parseInt(interviewRecordId, 10)});
            //这个按照上面的写法来的
            //我记得 前端的对象数据可以认为是一个JSON？


            setInterviewRecord(data);


            //这是之前中断保存的 会读取中断保存的数据
            setAnswer(detailData?.answer || '');  // 设置当前答案，如果没有答案则为空



            // 获取题目的详细信息
            const questionRes = await getQuestionVoByIdUsingGet({id: detailData?.questionId});

            /*todo 我决定在每个调用的方法这里都贴一个模拟数据的demo
            *
            * {
  "code": 0,
  "data": {
    "id": "1",
    "title": "JavaScript 变量提升",
    "content": "请详细解释一下 JavaScript 中的变量提升现象。\n",
    "answer": "变量提升是指在 JavaScript 中，变量声明会被提升到作用域的顶部。\n\n# 关于变量提升\n\n我们尽可能在开发中要少用var字段\n除非你想兼容比较老的浏览器",
    "userId": "1",
    "createTime": "2024-11-14T05:07:04.000+00:00",
    "updateTime": "2024-11-23T07:39:58.000+00:00",
    "tagList": [
      "JavaScript",
      "基础",
      "前端"
    ],
    "user": {
      "id": "1",
      "userName": "不会写代码的02",
      "userAvatar": "http://web-static.4ce.cn/storage/bucket/v1/9c0bf10024fca91758ee25dee7e3168a.webp",
      "userProfile": "XDU web前端",
      "userRole": "user",
      "createTime": "2024-11-14T05:07:04.000+00:00"
    }
  },
  "message": "ok"
}*/
            setQuestion(questionRes.data);  // 设置题目数据
            //目前看来 没有任何问题

            //todo 判断是不是最后一题 以及进度条！！
            //ok接下来 面试id 拿到一条条详情
            const responseRes =
                //todo 出问题的地方！！！

                //我日 我把字段删了发现可以了
                await listInterviewRecordDetailVoByPageUsingPost(
                    {
                        current: 1,
                        pageSize: 10,
                        interviewRecordId: parseInt(interviewRecordId),
                        sortField: "id",
                        sortOrder: "ascend"
                    });
            const recordData = responseRes.data;
            const details = recordData.records || [];


            //创建时间不行 服务器太快了 还是按id比较保险
            //但是后续你要改成雪花怎么办？ 细化创建时间？？

            console.log(details);
            //既然去请求了 那么就更新这个钩子
            setInterviewDetails(details);
            //这里的排序在后端已经做好了相当于

            //没问题 接着排序吧 保守起见还是拍了个序 不👏 直接就是按照
            // details.sort((a: any, b: any) =>
            //     new Date(a.createTime).getTime() - new Date(b.createTime).getTime()
            // );

            //写着写着 发现这里要不写个钩子

            // console.log(details);

            // 判断当前是否是最后一题 取最后一个的id
            //我在想这里是不是有点多此一举。。。直接records数组里面就能实现了。。。
            // const ids = details.map((item: any) => item.id);

            //这里直接用下面的。。？
            // setIsLastQuestion(ids[ids.length - 1] === parseInt(interviewRecordDetailId, 10));

            // 找到当前记录在数组中的索引
            const currentId = parseInt(interviewRecordDetailId, 10);

            console.log(currentId);


            // const currentIndex = interviewDetails.findIndex((item: any) => (parseInt(item.id) == currentId));

            // const currentIndex = interviewDetails.findIndex((item) => item.id === interviewRecordDetailId);

            //我感觉是不是异步的锅。。？那就不用状态了

            //这里直接用上面方法的返回结果details

            const currentIndex = details.findIndex((item) => parseInt(item.id, 10) === currentId);


            console.log(currentIndex);

            //换一种算法

            setIsLastQuestion(currentIndex===(details.length-1));
            // // if (currentIndex !== -1) {
            //     // 确保找到了当前记录后，尝试获取下一条记录的 ID
            //     const nextId = interviewDetails[currentIndex + 1]?.id;
            //
            //     console.log(nextId);
            //     //最后一题的时候是undefined
            //     console.log('nextId');

                //下一条id不存在就是最后一题。。
                // setIsLastQuestion(nextId!=null)
            // setIsLastQuestion(nextId == null || nextId == undefined || nextId < 0);


            // todo 计算进度

            //这里是 只要有timetaken字段的就是完成 没点点击下一题就是没有完成的意思。。。
            const completedCount = details.filter((item: any) => item.timeTaken).length;
            // const progressPercentage = (completedCount / details.length) * 100;

            // 保留到小数点后的一位 还要数字类型
            // const progressPercentage = ((completedCount / details.length) * 100).toFixed(1);
            const progressPercentage = parseFloat(((completedCount / details.length) * 100).toFixed(1));


            setProgress(progressPercentage);


            /*调试之后 {
  "current": 1,
  "interviewRecordId": 1,
  "pageSize": 10,
  "sortField": "createTime",
  "sortOrder": "ascend"
}*/


            //todo 进度这里应该被计算的。。。

            // const currentProgress = Math.floor(Math.random() * 100);  // 模拟一个随机进度
            // setProgress(currentProgress);  // 设置进度
        } catch (error) {
            message.error('加载失败，请重试！');  // 如果加载失败，显示错误提示
        }
    };


    const saveAnswer = async () => {
        try {
            // 调用 API 更新答案
            /*更新必须要先获取到之前的*/

            await updateInterviewRecordDetailUsingPost({
                id: parseInt(interviewRecordDetailId as string, 10),  // 提交答案时，包含记录详情的 ID
                answer: answer,  // 当前答案
                // timeTaken: timer,  // 当前计时器的时间 自动保存只会存答案！！！
                timeTaken: InterviewRecordDetail.timeTaken,  // 当前计时器的时间 自动保存只会存答案！！！
                //？但是这又引申出来一个问题 要是是null怎么办？？
                interviewRecordId: InterviewRecordDetail.interviewRecordId,
                questionId: InterviewRecordDetail.questionId
                //我是记得这里好像能解构写的。。？
            });

            /*{
  "answer": "",
  "id": 0,
  "interviewRecordId": 0,
  "questionId": 0,
  "timeTaken": 0
}*/

            /*试试这里行不行 不行 update必须要全部获取到
            * 说白了就是 其他的字段也要写进去 不然update一定会报错！*/


            message.success('自动保存成功！');  // 如果保存成功，显示成功提示
        } catch (error) {
            message.error('保存失败！');  // 如果保存失败，显示错误提示
        }
    };

    const saveAnswerEnd = async () => {
        try {
            // 调用 API 更新答案
            /*更新必须要先获取到之前的*/

            await updateInterviewRecordDetailUsingPost({
                id: parseInt(interviewRecordDetailId as string, 10),  // 提交答案时，包含记录详情的 ID
                answer: answer,  // 当前答案
                timeTaken: timer,  // 当前计时器的时间 自动保存只会存答案！！！
                // timeTaken: InterviewRecordDetail.timeTaken,  // 当前计时器的时间 自动保存只会存答案！！！
                //？但是这又引申出来一个问题 要是是null怎么办？？
                interviewRecordId: InterviewRecordDetail.interviewRecordId,
                questionId: InterviewRecordDetail.questionId
                //我是记得这里好像能解构写的。。？
            });
            //这里就是在完成面试的时候的东西

            /*{
  "answer": "",
  "id": 0,
  "interviewRecordId": 0,
  "questionId": 0,
  "timeTaken": 0
}*/

            /*试试这里行不行 不行 update必须要全部获取到
            * 说白了就是 其他的字段也要写进去 不然update一定会报错！*/


            message.success('本题已完成 答案和耗时已上传成功！');  // 如果保存成功，显示成功提示
        } catch (error) {
            message.error('保存失败！');  // 如果保存失败，显示错误提示
        }
    };



    const completeInterview = async () => {

        if(answer.length>1000){
            message.warning("答案不能超过1000字 请精简你的回答哦");
            return;
        }



        try {

            await saveAnswerEnd();

            const totalDuration = interviewDetails.reduce((sum, item) => sum + (item.timeTaken || 0), 0);
            // console.log(totalDuration);
            //todo 测试

            //这里是执行了的
            await updateInterviewRecordUsingPost({
                id: parseInt(interviewRecordId, 10),
                status: 1,
                duration: totalDuration,
                userId: loginUser.userId
                //获取当前登录用户
            });


            message.success("面试完成！已更新面试记录，马上为您跳转面试结果页面");

            window.location.href = `/test/${interviewRecordId}`;
        } catch (error) {
            message.error("保存最后一题或者更新面试记录的时候失败！");
        }
    };


    //跳转到下一题
    //我建议这里id不要固定+1 因为后面可能搞雪花算法

    // 跳转到下一题
    // const goToNextQuestion = async () => {
    // const goToNextQuestion = async () => {
    const handleNextQuestion = async () => {

        if(answer.length>1000){
            message.warning("答案不能超过1000字 请精简你的回答哦");
            return;
        }

        //加上了时间戳的保存方法
        await saveAnswerEnd();

        //todo 跳转也出问题了



        // 将当前 interviewRecordDetailId 转换为数字
        const currentId = parseInt(interviewRecordDetailId, 10);

// 找到当前记录在数组中的索引
        const currentIndex = interviewDetails.findIndex((item: any) => parseInt(item.id, 10) === currentId);

        if (currentIndex !== -1) {
            // 确保找到了当前记录后，尝试获取下一条记录的 ID
            const nextId = interviewDetails[currentIndex + 1]?.id;

            if (nextId) {
                // 跳转到下一题页面
                window.location.href = `/test/${interviewRecordId}/${nextId}`;
            } else {
                console.error("下一题 ID 不存在，可能是最后一题");
            }
        } else {
            console.error("当前记录未找到，无法跳转到下一题");
        }

        //似乎是类型不一致。。？id传过来为什么会是字符串。。？



    };



    const conicColors: ProgressProps['strokeColor'] = {
        '0%': '#87d068',
        '50%': '#14d8fa',
        '100%': '#fdc7ff',
    };

    return (
        // <div style={{display: 'flex', flexDirection: 'column', height: '100vh', padding: '20px'}}>

        /*调整逻辑
1. 保持宽度配比

使用 gridTemplateColumns: "20% 80%"，将左侧（计时器和进度条）固定为 20%，右侧（题目详情和答题区域）固定为 80%。
通过 gridTemplateRows 定义两行，其中：
第一行高度根据内容动态调整（auto）。
第二行高度分配剩余空间（1fr）。*/
        <div style={{
            display: "grid",
            gridTemplateColumns: "20% 80%",
            gridTemplateRows: "auto 1fr",
            height: "100vh",
            gap: "20px",
            padding: "20px"
        }}>

            {/*todo 事实证明要用grid布局*/}
            <div style={{gridColumn: "1 / 2", gridRow: "1 / 2"}}>
                <Card
                    style={{
                        height: "100px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <div>本题作答时间</div>
                    <div>{Math.floor(timer / 60)} 分 {timer % 60} 秒</div>
                </Card>
            </div>

            <div style={{gridColumn: "2 / 3", gridRow: "1 / 2"}}>
                <Card>
                    <h2>{question?.title || "加载中..."}</h2>
                    <div>
                        {question?.tagList?.map((tag: string, index: number) => (
                            <Tag key={index}>{tag}</Tag>
                        ))}
                    </div>
                    <p>{question?.content || "加载中..."}</p>

                </Card>
            </div>
            <div style={{gridColumn: "1 / 2", gridRow: "2 / 3"}}>
                {/*<Card>*/}
                <Card
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        position: "relative",
                        height: "100%", // 父容器的高度
                        width: "100%",  // 父容器的宽度
                    }}
                >
                    <Progress
                        type="circle"
                        percent={progress}
                        trailColor="rgba(0, 0, 0, 0.06)"
                        strokeColor={conicColors}
                        strokeWidth={20}
                        style={{
                            width: "90%", // 设置进度条的宽度和父容器接近
                            height: "90%", // 设置进度条的高度和父容器接近
                        }}
                    />

                </Card>

            </div>

            {/*<div style={{gridColumn: "2 / 3", gridRow: "2 / 3", marginTop: "20px"}}>*/}
            <div style={{
                gridColumn: "2 / 3",
                gridRow: "2 / 3",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between"
            }}>

                {/*<Card style={{ display: "flex", flexDirection: "column", height: "300px" }}> /!* 设置卡片为flex布局，height是示例高度 *!/*/}
                {/*    <div style={{ flex: 1 }}>*/}
                {/*        /!* 卡片的其他内容，可以根据需要添加 *!/*/}
                {/*    </div>*/}

                {/*    <div style={{ marginTop: "auto", display: "flex", justifyContent: "center" }}>*/}
                {/*        {isLastQuestion ? (*/}
                {/*            <Button type="primary" onClick={completeInterview}>*/}
                {/*                完成面试*/}
                {/*            </Button>*/}
                {/*        ) : (*/}
                {/*            <Button type="primary" onClick={handleNextQuestion}>*/}
                {/*                完成，下一题*/}
                {/*            </Button>*/}
                {/*        )}*/}
                {/*    </div>*/}
                {/*</Card>*/}

                <Card style={{display: "flex", flexDirection: "column", height: "100%", padding: 0}}>
                    {/* MD 编辑器部分，占满整个卡片 */}

                    {/*todo MD编辑器的大小。。。！！！！*/}
                    <div>
                        <MDEditor
                            height={500}
                            minHeight={450} maxHeight={550}
                            value={answer}
                            onChange={(value) => setAnswer(value || "")}
                        />
                    </div>

                        {/* 按钮部分，固定在卡片底部 */}
                        <div style={{marginTop: 20, display: "flex", justifyContent: "center"}}>
                            {isLastQuestion ? (
                                <Button type="primary" onClick={completeInterview}>
                                    完成面试
                                </Button>
                            ) : (
                                <Button type="primary" onClick={handleNextQuestion}>
                                    完成，下一题
                                </Button>
                            )}
                        </div>
                </Card>

            </div>

        </div>
);
};

export default InterviewPage;

