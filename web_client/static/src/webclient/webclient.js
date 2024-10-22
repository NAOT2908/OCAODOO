/** @odoo-module **/

import { WebClient } from "@web/webclient/webclient";
import { useService } from "@web/core/utils/hooks";
import { WebClientNavBar } from "./navbar/navbar";

export class Client extends WebClient {
    setup() {
        super.setup();
        this.hm = useService("home_menu");
    }
    _loadDefaultApp() {
        return this.hm.toggle(true);
    }
}
Client.components = { ...WebClient.components, NavBar: WebClientNavBar };
