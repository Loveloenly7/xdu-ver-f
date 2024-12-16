export  function repairJson(input) {
    try {
        //先去掉md格式的代码块标记
        input=removeJsonMarkdownFrame(input)
        // 尝试解析 JSON 字符串，判断是否有效
        JSON.parse(input);
        return input;  // 如果原字符串有效，直接返回
    } catch (error) {
        // 如果解析失败，进入修复流程
        console.log("无法解析 JSON, 开始修复格式");

        // 修复 JSON 字符串，检查是否缺少闭合符号
        input = fixMissingBrackets(input);

        // 尝试再次解析修复后的字符串
        try {
            JSON.parse(input);
            return input;  // 修复后可以成功解析，返回修复后的 JSON 字符串
        } catch (error) {
            console.error("修复失败，返回空数组:", error);
            return '[]';  // 如果修复失败，返回一个空的 JSON 数组
        }
    }
}

function fixMissingBrackets(input) {

    /*我现在又有一个问题了   这玩意 。。。*/
    // 检查字符串是否以一个数组（[）或对象（{）开始并以数组（]）或对象（}）结束
    let openBracketCount = (input.match(/{/g) || []).length;  // 统计 '{' 出现的次数
    let closeBracketCount = (input.match(/}/g) || []).length;  // 统计 '}' 出现的次数
    let openSquareCount = (input.match(/\[/g) || []).length;  // 统计 '[' 出现的次数
    let closeSquareCount = (input.match(/]/g) || []).length;  // 统计 ']' 出现的次数

    // 如果大括号不平衡，修复缺失的 '}'
    if (openBracketCount > closeBracketCount) {
        input += '}';  // 如果 { 比 } 多，添加一个闭合大括号
    }

    // 如果方括号不平衡，修复缺失的 ']'
    if (openSquareCount > closeSquareCount) {
        input += ']';  // 如果 [ 比 ] 多，添加一个闭合方括号
    }

    // 去除可能的非法字符（如多余的换行符，或额外的引号）
    //todo 还有别的。。
    input = input.replace(/\\n/g, ' ').replace(/\r/g, '').trim();

    input=cleanJsonString(input);

    //还有那个 开头结尾的json '''

    return input;
}
//替换式的清洗
function cleanJsonString(input) {
    return input
        .replace("{{", "{")           // 修正 {{ 为 {
        .replace("}}", "}")           // 修正 }} 为 }
        .replace('"[{', "[{")         // 修正 "[{ 为 [{
        .replace('}]"', "}]")         // 修正 }]" 为 }]
        .replace("\\", " ")           // 替换所有的转义字符 \ 为 空格
        .replace("\\n", " ")          // 替换换行符 \n 为 空格
        .replace("\n", " ")           // 替换换行符为 空格
        .replace("\r", "")            // 去除回车符 \r
        .trim();                      // 去掉字符串两端的空格
}

//去掉md格式的代码块标记
function removeJsonMarkdownFrame(input) {
    // 检查并去除开始的代码块标记
    if (input.startsWith("```json")) {
        input = input.slice("```json".length);  // 移除 "```json" 开头
    } else if (input.startsWith("```")) {
        input = input.slice("```".length);      // 移除 "```" 开头
    }

    // 检查并去除结束的代码块标记
    if (input.endsWith("```")) {
        input = input.slice(0, input.length - "```".length);  // 移除 "```" 结尾
    }

    return input; // 返回去除 Markdown 代码块标记后的内容
}

