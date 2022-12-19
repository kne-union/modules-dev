const get = require("lodash/get");
const uniqueId = require("lodash/uniqueId");
const readmeGenerator = (readme) => {
    const importList = [], mapping = {};
    Object.keys(readme).forEach((name) => {
        const list = get(readme[name], "data.example.list") || [];
        list.forEach(({scope}) => {
            scope.forEach(({name, packageName}) => {
                if (!mapping[packageName]) {
                    const key = uniqueId("component_");
                    importList.push(name ? `import * as ${key} from '${packageName}';` : `import '${packageName}';`);
                    if (name) {
                        mapping[packageName] = key;
                    }
                }
            });
        });
    });

    return `${importList.join("\n")}
const readmeConfig = {${Object.keys(readme).map((name) => {
        const data = readme[name].data;
        return `${name}:{
    name: \`${data.name}\`,
    summary: \`${data.summary}\`,
    api: \`${data.api}\`,
    example: {
        isFull: ${get(data, "example.isFull") || "false"},
        className: \`${get(data, "example.className") || ""}\`,
        style: \`${get(data, "example.style") || ""}\`,
        list: [${(get(data, "example.list") || []).map((item) => {
            return `{
    title: \`${item.title}\`,
    description: \`${item.description}\`,
    code: \`${(item.code || "").toString().replace(/\$/g, "\\$").replace(/`/g, "\\`")}\`,
    scope: [${(item.scope || []).filter(({name}) => !!name).map(({name, packageName}) => {
                return `{
    name: "${name}",
    packageName: "${packageName}",
    component: ${mapping[packageName]}
}`;
            }).join(",")}]
}`;
        }).join(",")}]
    }
}`;
    }).join(",")}};
export default readmeConfig;
`;
};

module.exports = readmeGenerator;

