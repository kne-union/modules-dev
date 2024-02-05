const get = require("lodash/get");
const uniqueId = require("lodash/uniqueId");
const readmeGenerator = (readme) => {
    const importList = [], mapping = {};
    get(readme, 'example.list', []).forEach(({scope}) => {
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

    return `${importList.join("\n")}
const readmeConfig = {
    name: \`${readme.name||''}\`,
    summary: \`${readme.summary}\`,
    ${readme.description?`description: \`${readme.description}\`,`:''}
    ${readme.packageName?`packageName: \`${readme.packageName}\`,`:''}
    api: \`${readme.api}\`,
    example: {
        isFull: ${get(readme, "example.isFull") || "false"},
        className: \`${get(readme, "example.className") || ""}\`,
        style: \`${get(readme, "example.style") || ""}\`,
        list: [${(get(readme, "example.list") || []).map((item) => {
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
};
export default readmeConfig;
`;
};

module.exports = readmeGenerator;

