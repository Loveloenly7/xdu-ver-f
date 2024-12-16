'use client'

import React, { useState } from 'react';

const App = () => {
    const [inputJson, setInputJson] = useState('');
    const [result, setResult] = useState([]);

    // 按规则分组的函数
    const splitJsonArray = (data) => {
        const result = [];
        let currentGroup = [];
        let currentCount = 0;

        data.forEach((item) => {
            let { knowledgePoint, questionList } = item;
            for (let question of questionList) {
                // 如果当前组的问题数达到3，则保存当前组，重置
                if (currentCount === 5) {
                    result.push([...currentGroup]);
                    currentGroup = [];
                    currentCount = 0;
                }

                // 添加当前问题到当前组
                const existingIndex = currentGroup.findIndex(
                    (groupItem) => groupItem.knowledgePoint === knowledgePoint
                );

                if (existingIndex !== -1) {
                    currentGroup[existingIndex].questionList.push(question);
                } else {
                    currentGroup.push({
                        knowledgePoint,
                        questionList: [question],
                    });
                }

                currentCount++;
            }
        });

        // 添加最后一组（如果存在）
        if (currentGroup.length > 0) {
            result.push([...currentGroup]);
        }

        return result;
    };

    const handleSplit = () => {
        try {
            const parsedJson = JSON.parse(inputJson);
            const splitResult = splitJsonArray(parsedJson);
            setResult(splitResult);
        } catch (error) {
            alert('请输入有效的JSON数组');
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>JSON数组分组工具</h1>
            <textarea
                rows="10"
                cols="50"
                placeholder="输入JSON数组"
                value={inputJson}
                onChange={(e) => setInputJson(e.target.value)}
            ></textarea>
            <br />
            <button onClick={handleSplit} style={{ marginTop: '10px' }}>
                分组
            </button>
            <h2>分组结果</h2>
            <pre style={{ backgroundColor: '#f4f4f4', padding: '10px' }}>
        {JSON.stringify(result, null, 2)}
      </pre>
        </div>
    );
};

export default App;
