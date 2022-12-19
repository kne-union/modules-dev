import importMessages from './locale';
import { IntlProvider, FormattedMessage } from '@ui-components/Intl';
import style from './style.module.scss';

const <%=name%> = () => {
    return <IntlProvider importMessages={importMessages} moduleName="<%=name%>">unleash creativity</IntlProvider>;
};

export default <%=name%>;
