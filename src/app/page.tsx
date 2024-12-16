// 'use client'

import Title from "antd/es/typography/Title";
import {Card, Divider, Flex, message} from "antd";
import Link from "next/link";
import { listQuestionBankVoByPageUsingPost } from "@/api/questionBankController";
import { listQuestionVoByPageUsingPost } from "@/api/questionController";
import QuestionBankList from "@/components/QuestionBankList";
import QuestionList from "@/components/QuestionList";
import "./index.css";
// import {WordCloud} from "@ant-design/plots";
import React from "react";
// import dynamic from "next/dynamic";
import WordCloudClient from "@/components/WordCloud";

// 本页面使用服务端渲染，禁用静态生成 之后再说
export const dynamic = 'force-dynamic';

// 动态加载 WordCloud 组件，禁用 SSR
// const WordCloud = dynamic(() => import('@ant-design/plots').then(mod => mod.WordCloud), {
//   ssr: false,
// });

/**
 * 主页
 * @constructor
 */
export default async function HomePage() {
  let questionBankList = [];
  let questionList = [];
  //来一个数组作为词云的来源 包含字符串数组
  let cloudWords = [];
  try {
    const res = await listQuestionBankVoByPageUsingPost({
      pageSize: 9,
      sortField: "createTime",
      sortOrder: "descend",
    });
    questionBankList = res.data.records ?? [];
  } catch (e) {
    message.error("获取题库列表失败，" + e.message);
  }

  try {
    const res = await listQuestionVoByPageUsingPost({
      pageSize: 15,
      sortField: "createTime",
      sortOrder: "descend",
    });
    questionList = res.data.records ?? [];

    //遍历拿到的题目列表 拿到标签数组
    questionList.map(question => {
      // 将标签推入 cloudWords 数组
      const tagList = question.tagList;
      tagList.forEach((tag) => {
        cloudWords.push(tag); // 每个标签推入 cloudWords
      });
    })

    // 将字符串数组转换为词云图数据格式，随机生成权重
    cloudWords = cloudWords.map((text) => ({
      text, // 词语内容
      value: Math.floor(Math.random() * (100 - 75 + 1)) + 75, // 权重在 10 到 100 之间随机
    }));

  } catch (e) {
    message.error("获取题目列表以及词云图失败，" + e.message);
  }

  // WordCloud 配置
  const config = {
    data: cloudWords, // 动态生成的数据
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

  return (
    <div id="homePage" className="max-width-content">
      {/* WordCloud图表 */}
      <div style={{marginBottom: 20}}>
        <Card
            title={
              <div style={{ textAlign: "center", fontWeight: "bold", fontSize: "24px", color: "#333" }}>
                The Latest WordCloud
              </div>
            }
        >
          {/*<WordCloud {...config} /> todo 这里必须要用下面包装过的版本才能实现这个页面的SEO渲染*/}
          <WordCloudClient {...config} />

        </Card>
      </div>
      <Flex justify="space-between" align="center">
        <Title level={2}>最新题库</Title>
        <Link href={"/banks"}>查看更多</Link>
      </Flex>
      <QuestionBankList questionBankList={questionBankList} />
      <Divider />
      <Flex justify="space-between" align="center">
        <Title level={2}>最新题目</Title>
        <Link href={"/questions"}>查看更多</Link>
      </Flex>
      <QuestionList questionList={questionList} />
    </div>
  );
}
