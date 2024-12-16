


/*为了调整题库选择部分的布局，让每行显示4个题库，并使勾选框保持对齐，可以通过以下几个步骤来实现样式的修改：

使用 Grid 或 Row/Col 布局组件来控制每行显示4个题库。
设置每个题库项的最大宽度，避免文本过长。
使用 textOverflow: "ellipsis" 来实现文本超长时显示省略号。
*/


"use client"

import React, {useState} from "react";
import {Card, Button, Modal, Checkbox, Select, message, Spin, Row, Col} from "antd";
import Image from "next/image";
// import {useRouter} from "next/router";
import {
    // listMyQuestionBankVoByPageUsingPost,
    listQuestionBankVoByPageUsingPost,
} from "@/api/questionBankController"; // 假设所有方法都在这里导入


import {searchQuestionVoByPageUsingPost} from "@/api/questionController";
import {listFavoriteByPageUsingPost} from "@/api/favoriteController";
import {addInterviewRecordUsingPost} from "@/api/interviewRecordController";
import {addInterviewRecordDetailUsingPost} from "@/api/interviewRecordDetailController";

import {useSelector} from "react-redux";
import {RootState} from "@/stores";


const {Option} = Select;

const InterviewPage = () => {
    // const router = useRouter();
    // const name=usePathname();
    // console.log(name);
    //我烦了 现在的情况就是 你只要引入这东西就是用不了 卧槽你大爷的



    const [modalVisible, setModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [questionBanks, setQuestionBanks] = useState([]); // 题库列表
    const [selectedBanks, setSelectedBanks] = useState([]); // 选中的题库ID
    const [questionCount, setQuestionCount] = useState(5); // 题目数量
    const [skipMastered, setSkipMastered] = useState(false);
    const [targetMistakes, setTargetMistakes] = useState(false);

    // 当前登录用户
    const loginUser = useSelector((state: RootState) => state.loginUser);

    // const router = useRouter();
    //这里也是我之前用这个失败了 但我真的很想知道为什么会用不了这玩意。。？

    // 打开Modal并加载题库
    const handleOpenModal = async () => {
        setLoading(true);
        try {
            //todo 参数
            // 提取 records 数据： 从返回的数据中找到 data.records，并将其提取为数组。
            // const {data} = await listQuestionBankVoByPageUsingPost({current:1,pageSize:100}); // 调用方法获取题库
            //调整为100似乎查的太多了点。。。

            //后端有问题啊 这里的查询条件。。。
            //不是啊 我要求能够全部查询出来啊。。
            //接口文档里发现可以 但是这里不行
            //这是响应而不是响应体！！！
            // const response = await listQuestionBankVoByPageUsingPost({current:1,pageSize:10});
            //你总不能给我整100个数据库吧。。？
            const {data} = await listQuestionBankVoByPageUsingPost({current:1,pageSize:100});

            //在第几层呢？


            const records = data.records;
            //卧槽这么简单。。？ 那搞定了啊
            //但这样会显得很大。。要不要弄个VO。。？

            // todo 遍历 records 提取 id 卧槽这个写法nb！！！
            // const ids = records.map(record =>record.id);

            // console.log(ids);


            //
            if (records) {
                setQuestionBanks(records); // 提取 records
            } else {
                console.error("Unexpected response format:", data);
                setQuestionBanks([]); // 默认空数组
            }

            // setQuestionBanks(data || []);
            setModalVisible(true);
            //保证题库加载出来之后 再显示modal可见
        } catch (error) {
            message.error("加载题库失败，请重试！");
        } finally {
            setLoading(false);
        }
    };

    /* shuffleArray 函数实现 用于打乱数组得到比较高的随机性
    * ？？这里的算法能否根据热点再来一个加权。。？ */
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1)); // 生成一个随机索引
            [array[i], array[j]] = [array[j], array[i]]; // 交换元素
        }
        return array;
    }

    // 提交选择
    const handleSubmit = async () => {
        setLoading(true);

        //加入直接点击 就count和范围都随机选择 的情况下进行下面的代码逻辑 感觉好麻烦。。
        try {
            // todo 获取用户选择 题库id这里是怎么选到的。。

            const questionBankIds = selectedBanks;
            const count = questionCount;

            if (questionBankIds.length === 0) {
                message.error("请至少选择一个题库！");
                return;
            }

            // 获取题库范围内的题目ID集合 A

            //todo
            let questionIdsA = [];
            for (const bankId of questionBankIds) {
                //因为这里用的这个 所以默认100

                //根据题库id查题目的方法
                //这里为什么不去用分页的方法呢。。？
                const {data} = await searchQuestionVoByPageUsingPost({questionBankId: bankId,current:1,pageSize:100,userId:null});
                //这里条件暂时是查不出来的 我不知道为什么。。
                //todo 用这个能查出来 但是。。。
                /*{
  "current": 1,
  "pageSize": 100,
  "questionBankId": 1,
  "userId": null 因为这个id是创建者的id 但我真的不知道为什么必须要传个null？
}*/

                const records = data.records;
                // console.log(records);

                // const ids = records.map(record =>record.id);


                //这里去
                // questionIdsA = questionIdsA.concat(records.map((q) => q.id));
                //需要去掉重复
                questionIdsA = Array.from(new Set(questionIdsA.concat(records.map((q) => q.id))));

                // console.log(questionIdsA);


                //这段代码将 records 数组中所有的 id 提取出来，并将它们追加到 questionIdsA 数组中
            }

            if (questionIdsA.length < count) {
                message.error("题库范围内可供选择的题目太少了！");
                return;
            }

            // // 查询用户收藏数据
            // let questionIdsB = [];
            // let questionIdsC = [];
            // if (targetMistakes || skipMastered) {
            //     const {data: favoriteData} = await listFavoriteByPageUsingPost({current:1,pageSize:100});
            //
            //     if (targetMistakes) {
            //         questionIdsB = favoriteData.filter((fav) => fav.favoriteType === 1).map((fav) => fav.questionId);
            //     }
            //     if (skipMastered) {
            //         questionIdsC = favoriteData.filter((fav) => fav.favoriteType === 2).map((fav) => fav.questionId);
            //     }
            // }

            // 查询用户收藏数据
            let questionIdsB = [];
            let questionIdsC = [];
            if (targetMistakes || skipMastered) {
                //只要选择了一个 就会有这个


                const { data: favoriteData } = await listFavoriteByPageUsingPost({userId:loginUser.id, current: 1, pageSize: 100 });
                //原来是解构然后换了个名字 吓死我了

                // 假设 data.records 是你真正需要的查询结果数组
                const records = favoriteData.records;

                if (targetMistakes) {
                    // 获取 favoriteType 为 1 的问题的 ID
                    questionIdsB = records.filter((fav) => fav.favoriteType === 1).map((fav) => fav.questionId);
                }
                if (skipMastered) {
                    // 获取 favoriteType 为 2 的问题的 ID
                    questionIdsC = records.filter((fav) => fav.favoriteType === 2).map((fav) => fav.questionId);
                }
            }

            //测试一下
            // console.log(questionIdsB);
            // console.log(questionIdsC);


            // 如果跳过掌握的题目，计算 A-C
            if (skipMastered) {
                questionIdsA = questionIdsA.filter((id) => !questionIdsC.includes(id));
                if (questionIdsA.length < count) {
                    message.error("对你来说可供选择的题目太少，您掌握的题目太多了太强了！，请联系管理员！");
                    return;
                }
            }



            // 从题目集合中挑选足量的题目集合 E
            let questionIdsE = [];

            //如果要重点训练易错的 那么就
            // if (targetMistakes) {
            //     questionIdsE = questionIdsB.slice(0, count);
            // }
            /*slice(0, count) 方法返回 questionIdsB 数组从索引 0 开始，到 count（不包括 count）之间的元素组成的新数组。
这个操作是将 questionIdsE 数组初始化为 questionIdsB 数组的前 count 个元素。

如果说 小于count就会全部包含！！！！*/
            // if (questionIdsE.length < count) {
            //     /*从错题里面拿的题目 没有拿完 */
            //     questionIdsE = questionIdsE.concat(
            //         questionIdsA.filter((id) => !questionIdsE.includes(id)).slice(0, count - questionIdsE.length)
            //     );
            // }



            /*questionIdsA.filter((id) => !questionIdsE.includes(id))：
            首先，从 questionIdsA 数组中过滤出那些不在 questionIdsE 数组中的元素。具体来说：
filter() 方法会遍历 questionIdsA 数组中的每一个元素，
将所有满足 (id) => !questionIdsE.includes(id) 这个条件的元素返回。
这个条件检查 id 是否不在 questionIdsE 中。
目的是确保我们从 questionIdsA 中筛选出那些还没有出现在 questionIdsE 中的元素。
.slice(0, count - questionIdsE.length)：接下来，
从筛选出的结果中取出前 (count - questionIdsE.length) 个元素。
count - questionIdsE.length 计算出需要再添加多少个元素
，以保证 questionIdsE 中的元素数量达到 count。
slice(0, count - questionIdsE.length) 从新过滤出的数组中获取前面这些元素。
总结：这段代码的目的是根据 targetMistakes 的值来决定如何填充 questionIdsE 数组。如果 targetMistakes 为 true，那么 questionIdsE 就会取 questionIdsB 的前 count 个元素。如果 questionIdsE 的元素不足 count，则从 questionIdsA 中筛选出尚未出现在 questionIdsE 中的元素，并将这些元素添加到 questionIdsE 中，直到 questionIdsE 的元素数量达到 count。
*/

            //加入随机算法 洗牌算法

            if (targetMistakes) {
                // 随机打乱 questionIdsB 数组
                questionIdsE = shuffleArray(questionIdsB).slice(0, count);
            }



            if (questionIdsE.length < count) {
                // 从错题中随机选择，排除已选择的题目
                questionIdsE = questionIdsE.concat(
                    shuffleArray(questionIdsA.filter((id) => !questionIdsE.includes(id))).slice(0, count - questionIdsE.length)
                );
            }

            /*主要变化：
shuffleArray 函数：这个函数实现了洗牌算法（Fisher-Yates shuffle），它可以随机打乱一个数组的顺序。具体步骤是，从数组的最后一个元素开始，随机选择一个未处理的元素，将它与当前元素交换，直到数组被完全打乱。
Math.random() 用于生成一个随机数。
Math.floor() 用于将随机数转为整数，确保生成的是一个有效的索引。
通过交换数组中的元素，最终实现数组的随机打乱。
随机选择 questionIdsB 中的元素：原来使用 slice(0, count) 获取前 count 个元素，现在改为使用 shuffleArray(questionIdsB) 随机打乱数组后，再取前 count 个元素。
随机选择 questionIdsA 中的元素：在第二个 if 语句中，首先从 questionIdsA 中筛选出不在 questionIdsE 中的元素，然后用 shuffleArray 对筛选后的数组进行随机打乱，再取前 count - questionIdsE.length 个元素。最后使用 concat 将其添加到 questionIdsE 中。
总结：
这样修改后，questionIdsE 数组中的元素将不再是从 questionIdsB 或 questionIdsA 中按顺序选择，而是会随机选择。每次运行代码时，选择的题目顺序都会不同，更符合“随机选择”的需求。*/


            //todo 后续换为热度越高 出现的概率越大的算法

            //热度怎么来。。？基础热度要有 在此基础上 加上比如 近1w次浏览量里面所占的比例。。





            // 创建面试记录
            const {data: interviewRecord} = await addInterviewRecordUsingPost({
                totalQuestions: count,
                userId: loginUser.id,
            });

            // 创建面试记录详情
            const interviewRecordId = interviewRecord;

            //todo 这里的写法
            const firstDetailId = await Promise.all(
                questionIdsE.map(async (id, index) => {
                    const {data} = await addInterviewRecordDetailUsingPost({
                        interviewRecordId,
                        questionId: id,
                    });

                    //只返回第一个作为异步的结果
                    return index === 0 ? data: null;
                })
            ).then((ids) => ids.find((id) => id !== null));


            console.log(firstDetailId);
            /*Promise.all 返回的结果是一个数组，
            包含每次异步调用的结果
            （如果是第一个元素，则是 detail，否则是 null）。

            这部分代码是创建面试记录详情，并获取第一个创建的详情 ID。以下是逐行解释：

await Promise.all(...)：Promise.all 用于并行执行多个异步操作。await 会等待所有的异步操作完成，并返回一个包含所有结果的数组。
questionIdsE.map(async (id, index) => { ... })：遍历 questionIdsE 数组，map 方法会为每个元素返回一个异步操作（即 addInterviewRecordDetailUsingPost 的调用），并传递给 Promise.all 来并行执行。
addInterviewRecordDetailUsingPost({ interviewRecordId, questionId: id })：
addInterviewRecordDetailUsingPost 是一个异步函数，用于创建面试记录的详情。它接收一个包含 interviewRecordId 和 questionId 的对象。
interviewRecordId 是前面创建的面试记录 ID。
questionId: id 是当前遍历的题目 ID（从 questionIdsE 数组中获取）。
const {data: detail}：从 addInterviewRecordDetailUsingPost 返回的响应中解构出 data，并将其赋值为 detail。detail 是包含面试记录详情的对象。
return index === 0 ? detail : null;：如果当前是遍历到 questionIdsE 数组的第一个元素（index === 0），则返回该元素的面试记录详情 (detail)；否则，返回 null。这个条件判断的目的是为了只获取第一个面试记录详情的 ID。
.then((ids) => ids.find((id) => id !== null))：
Promise.all 返回的结果是一个数组，包含每次异步调用的结果（如果是第一个元素，则是 detail，否则是 null）。
ids.find((id) => id !== null) 用来查找 ids 数组中的第一个非 null 值。由于我们在每次异步调用中只有第一个元素会返回 detail，因此 find 会返回第一个非 null 的值，即第一个面试记录详情的 ID。*/
            // todo 跳转到测试页面 先随便写个试试
            // router.push(`/test/${interviewRecordId}/${firstDetailId}`);
            // 替换 router.push
            //用另一种跳转 不知道会不会出错

            //不会 这就是第一道题 肯定是严格按照E数组里面的顺序来的
            window.location.href = `/test/${interviewRecordId}/${firstDetailId}`;

        } catch (error) {
            message.error("操作失败，请重试！");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{width: "80%", margin: "0 auto", padding: "20px"}}>
            {/* 第一个卡片 */}
            {/*<Card title={<div style={{ textAlign: "center" }}>准备好就开始你的模拟面试吧！</div>}>*/}
            <Card
                title={<div style={{ fontSize: "28px", textAlign: "center" }}>开始你的模拟面试吧！</div>}
                headStyle={{ textAlign: "center" }}
                style={{ marginBottom: "20px" }}
            >
                {/*todo 通过style直接设置了图片居中*/}
                <Image src="/test.png" alt="模拟面试页面的图片" width={600} height={600} style={{ display: "block", margin: "0 auto" }}/>
            </Card>

            {/* 第二个卡片 */}
            <Card>
                <div style={{display: "flex", justifyContent: "space-between", gap: "10px"}}>
                    <Button type="primary" onClick={handleOpenModal}>
                        选择面试条件
                    </Button>
                    <Button type="default" onClick={() => handleSubmit()}>
                        懒得选了 （全随机开始 还没写好）
                    </Button>
                </div>
            </Card>

            {/* 选择条件Modal */}
            <Modal
                title="选择面试条件"
                visible={modalVisible}
                onCancel={() => setModalVisible(false)}
                onOk={handleSubmit}
                confirmLoading={loading}
            >

                {/*todo 重点关注这里的数据流！！*/}
                <Spin spinning={loading}>
                    {/*<div style={{ marginBottom: "10px" }}>*/}
                    {/*    <Checkbox.Group*/}
                    {/*        options={questionBanks.map((q) => ({*/}
                    {/*            label: q.title,*/}
                    {/*            value: q.id,*/}
                    {/*        }))}*/}
                    {/*        onChange={(checked) => setSelectedBanks(checked)}*/}
                    {/*    />*/}
                    {/*</div>*/}
                    {/* 使用 Row 和 Col 控制布局 */}
                    <Row gutter={[16, 16]}>
                        <Checkbox.Group
                            style={{ width: "100%" }}
                            onChange={(checkedValues) => setSelectedBanks(checkedValues)} // 直接更新选中的ID数组
                        >
                            {questionBanks.map((q) => (
                                <Col span={6} key={q.id}>
                                    <Checkbox
                                        value={q.id}
                                        style={{ width: "100%" }}
                                    >
                                        <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                            {q.title}
                                        </div>
                                    </Checkbox>
                                </Col>
                            ))}
                        </Checkbox.Group>
                    </Row>

                    <Select
                        style={{ marginTop: "10px", width: "100%" }}
                        value={questionCount}
                        onChange={(value) => setQuestionCount(value)}
                    >
                        {[5, 6, 7, 8, 9, 10].map((num) => (
                            <Option key={num} value={num}>
                                {num}道题目
                            </Option>
                        ))}
                    </Select>
                    <Checkbox
                        style={{ marginTop: "10px" }}
                        checked={targetMistakes}
                        onChange={(e) => setTargetMistakes(e.target.checked)}
                    >
                        针对易错题目
                    </Checkbox>
                    <Checkbox
                        style={{ marginTop: "10px" }}
                        checked={skipMastered}
                        onChange={(e) => setSkipMastered(e.target.checked)}
                    >
                        跳过已经掌握的题目
                    </Checkbox>
                </Spin>
            </Modal>
        </div>
    );
};

export default InterviewPage;

