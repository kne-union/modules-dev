import hljs from 'highlight.js';
import React, {useEffect, useRef} from 'react';
import 'highlight.js/styles/github.css';

hljs.configure({
    ignoreUnescapedHTML: true
});
const Highlight = ({html, ...props}) => {
    const ref = useRef(null);
    useEffect(() => {
        ref.current.querySelectorAll('pre code').forEach((el) => {
            hljs.highlightElement(el);
        });

    }, [html]);

    // 给所有 table 元素外面包裹一层 div
    const wrapTableElements = (htmlString) => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlString;
        const tables = tempDiv.querySelectorAll('table');
        tables.forEach(table => {
            const wrapper = document.createElement('div');
            wrapper.className = 'table-content';
            table.parentNode.insertBefore(wrapper, table);
            wrapper.appendChild(table);
        });
        return tempDiv.innerHTML;
    };

    return <div {...props} ref={ref} dangerouslySetInnerHTML={{__html: wrapTableElements(html)}}/>
};

export default Highlight;