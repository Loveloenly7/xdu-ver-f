'use client';

import { WordCloud } from '@ant-design/plots';

/*必须要包装一层才能让主页用服务端渲染*/

export default function WordCloudClient(props) {
    return <WordCloud {...props} />;
}
