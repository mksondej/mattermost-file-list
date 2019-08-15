import {id as pluginId} from './manifest';
import reducer from './reducer';
import RootContainer from './components/RootContainer';
import { openRootModal } from './actions';

export default class Plugin {
    registry = null;
    rootId = null;

    // eslint-disable-next-line no-unused-vars
    initialize(registry, store) {
        this.registry = registry;

        // @see https://developers.mattermost.com/extend/plugins/webapp/reference/
        this.rootId = registry.registerRootComponent(RootContainer);

        registry.registerChannelHeaderButtonAction(
            <i
                className="fa fa-files-o"
                aria-hidden='true'
            />,
            () => store.dispatch(openRootModal()),
            'Files in channel',
            'Files in channel'
        );

        registry.registerReducer(reducer);
    }

    uninitialize() {
        if (this.rootId) {
            this.registry.unregisterComponent(this.rootId);
        }
    }
}

window.registerPlugin(pluginId, new Plugin());
