const { createEntry, ExampleRoutes } = _ModulesDev;
const { createWithRemoteLoader, getPublicPath } = remoteLoader;
const { Card, Typography, Space } = antd;
const { useState } = React;

const BaseExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal', 'components-core:InfoPage']
})(({ remoteModules }) => {
  const [PureGlobal, InfoPage] = remoteModules;
  const [wrapped, setWrapped] = useState(true);

  const MockComponent = () => (
    <Card title="业务组件" style={{ maxWidth: 400 }}>
      <Typography.Paragraph>这是一个模拟的业务组件内容</Typography.Paragraph>
    </Card>
  );

  const WrappedComponent = createEntry(MockComponent);

  return (
    <PureGlobal preset={{
      ajax: async api => {
        return { data: { code: 0, data: api.loader() } };
      },
      apis: {
        example: {
          staticUrl: getPublicPath('modules-dev') || window.PUBLIC_URL,
          getUrl: {
            loader: async ({ params }) => {
              return 'mock-data';
            }
          }
        }
      }
    }}>
      <InfoPage>
        <InfoPage.Part title="基础用法">
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Typography.Title level={3}>createEntry 高阶组件</Typography.Title>
            <Typography.Paragraph>
              createEntry 是一个高阶组件工厂函数，用于包装业务组件，
              集成开发环境的文档预览功能。当存在组件 README 数据时，
              会自动显示组件导航和示例页面。
            </Typography.Paragraph>
            <Card title="控制面板">
              <Space>
                <Typography.Text>启用包装:</Typography.Text>
                <Typography.Switch checked={wrapped} onChange={setWrapped} />
              </Space>
            </Card>
            <div style={{ padding: 20, background: '#f5f5f5', borderRadius: 8 }}>
              {wrapped ? <WrappedComponent /> : <MockComponent />}
            </div>
          </Space>
        </InfoPage.Part>
      </InfoPage>
    </PureGlobal>
  );
});

render(<BaseExample />);
