const { FontList } = _ModulesDev;
const { createWithRemoteLoader, getPublicPath } = remoteLoader;
const { Space, Typography, Card } = antd;

const FontListExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal', 'components-core:InfoPage']
})(({ remoteModules }) => {
  const [PureGlobal, InfoPage] = remoteModules;

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
              return {
                'kne-font': {
                  glyphs: [
                    { font_class: 'icon-home' },
                    { font_class: 'icon-user' },
                    { font_class: 'icon-setting' },
                    { font_class: 'icon-delete' },
                    { font_class: 'icon-edit' },
                    { font_class: 'icon-add' }
                  ]
                },
                'kne-font-colorful': {
                  glyphs: [
                    { font_class: 'icon-star' },
                    { font_class: 'icon-heart' },
                    { font_class: 'icon-check' }
                  ]
                }
              };
            }
          }
        }
      }
    }}>
      <InfoPage>
        <InfoPage.Part title="FontList 图标列表">
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Typography.Title level={3}>图标字体预览组件</Typography.Title>
            <Typography.Paragraph>
              FontList 组件用于展示和预览图标字体，支持调整图标大小，
              点击图标名称可以复制使用代码。
            </Typography.Paragraph>
            <Card title="示例展示">
              <FontList fonts={{
                'kne-font': {
                  glyphs: [
                    { font_class: 'icon-home' },
                    { font_class: 'icon-user' },
                    { font_class: 'icon-setting' },
                    { font_class: 'icon-delete' },
                    { font_class: 'icon-edit' },
                    { font_class: 'icon-add' }
                  ]
                },
                'kne-font-colorful': {
                  glyphs: [
                    { font_class: 'icon-star' },
                    { font_class: 'icon-heart' },
                    { font_class: 'icon-check' }
                  ]
                }
              }} />
            </Card>
          </Space>
        </InfoPage.Part>
      </InfoPage>
    </PureGlobal>
  );
});

render(<FontListExample />);
