// Copyright 2022 Cartesi Pte. Ltd.

// Licensed under the Apache License, Version 2.0 (the "License"); you may not
// use this file except in compliance with the License. You may obtain a copy
// of the license at http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations
// under the License.

import { FC } from "react";
import injectedModule from "@web3-onboard/injected-wallets";
import { init } from "@web3-onboard/react";
import { useState } from "react";

import { GraphQLProvider } from "./GraphQL";
import { Notices } from "./Notices";
import { Input } from "./Input";
import { Inspect } from "./Inspect";
import { Network } from "./Network";
import { Reports } from "./Reports";
import configFile from "./config.json";
import './style.css';

const config: any = configFile; // Carrega as configurações de blockchain a partir do arquivo JSON.

// Inicializa o módulo de carteiras injetadas.
const injected: any = injectedModule();
init({
    wallets: [injected], // Define as carteiras que podem ser usadas na DApp
    chains: Object.entries(config).map(([k, v]: [string, any], i) => ({id: k, token: v.token, label: v.label, rpcUrl: v.rpcUrl})),
    appMetadata: {
        name: "Cartesi Rollups Test DApp",
        icon: "<svg><svg/>",
        description: "Demo app for Cartesi Rollups",
        recommendedInjectedWallets: [
            { name: "MetaMask", url: "https://metamask.io" },
        ],
    },
});

const App: FC = () => {
    // Estado que armazena o endereço da DApp, com valor inicial definido.
    const [dappAddress, setDappAddress] = useState<string>("0xab7528bb862fb57e8a2bcd567a2e929a0be56a5e");

    return (
        <div>
            <Network />
            <GraphQLProvider>
                <div className="dapp-container">
                    <div className="dapp-header">
                        Dapp Address: <input
                            type="text"
                            value={dappAddress}
                            onChange={(e) => setDappAddress(e.target.value)}
                        />
                    </div>
                    <div className="dapp-components">
                        <div className="dapp-component">
                            <h2>Inspect</h2>
                            <Inspect />
                        </div>
                        <div className="dapp-component">
                            <h2>Input</h2>
                            <Input dappAddress={dappAddress} />
                        </div>
                        <div className="dapp-component">
                            <h2>Reports</h2>
                            <Reports />
                        </div>
                        <div className="dapp-component">
                            <h2>Notices</h2>
                            <Notices />
                        </div> 
                    </div>
                </div>
            </GraphQLProvider>
        </div>
    );
};

export default App;
