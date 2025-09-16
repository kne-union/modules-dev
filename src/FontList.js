import {useState} from 'react';
import {Flex, Slider, Typography, Card} from 'antd';
import Icon from '@kne/react-icon';

const FontList = ({fonts}) => {
    const [value, setValue] = useState(30);
    return <Flex vertical gap={20}>
        <Flex gap={8}>
            <div>调整大小:</div>
            <Slider style={{width: 100}} max={60} min={12} value={value} onChange={setValue}/>
            <div>{value}px</div>
        </Flex>
        {Object.keys(fonts).map(fontClassName => {
            const {glyphs: list} = fonts[fontClassName];
            const isColorful = /-colorful$/.test(fontClassName);
            return (<Flex vertical gap={8} key={fontClassName}>
                <Typography.Title level={4}>{fontClassName}</Typography.Title>
                <Flex gap={12} wrap>
                    {list.map(({font_class}) => {
                        return (<Card size="small" key={font_class}>
                            {isColorful ? (<>
                                <Flex justify="center">
                                    <Icon colorful type={font_class} size={value}/>
                                </Flex>
                                <Flex justify="center">
                                    <Typography.Text
                                        style={{display: 'block', width: '120px', wordBreak: 'break-all'}}
                                        copyable={{
                                            text: '<Icon colorful type="' + font_class + '"/>'
                                        }}>
                                        {font_class}
                                    </Typography.Text>
                                </Flex>
                            </>) : (<>
                                <Flex justify="center">
                                    <Icon type={font_class} size={value} fontClassName={fontClassName}/>
                                </Flex>
                                <Flex justify="center">
                                    <Typography.Text
                                        style={{display: 'block', width: '120px', wordBreak: 'break-all'}}
                                        copyable={{
                                            text: '<Icon type="' + font_class + '" fontClassName="' + fontClassName + '"/>'
                                        }}>
                                        {font_class}
                                    </Typography.Text>
                                </Flex>
                            </>)}
                        </Card>);
                    })}
                </Flex>
            </Flex>);
        })}
    </Flex>
};

export default FontList;