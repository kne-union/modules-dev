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
    return <div {...props} ref={ref} dangerouslySetInnerHTML={{__html: html}}/>
};

export default Highlight;