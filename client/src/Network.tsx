// Este arquivo contem o componente Network que permite ao usuario conectar sua carteira, 
// trocar a cadeia de blockchain e desconectar a carteira

import { FC } from "react";
import { useConnectWallet, useSetChain } from "@web3-onboard/react";
import configFile from "./config.json";
import styles from "./styles/Network.module.css";

const config: any = configFile;

export const Network: FC = () => {
  const [{ wallet, connecting }, connect, disconnect] = useConnectWallet(); // Gerencia o estado da conexão da carteira
  const [{ chains, connectedChain, settingChain }, setChain] = useSetChain(); // Gerencia o estado das cadeias de blockchain e a troca de cadeia

  return (
    <div className={styles.container}>
      <div className={styles.section}>
        {!wallet && ( // Se não houver uma carteira conectada, exibe o botão para conectar
          <button onClick={() => connect()} className={styles.button}>
            {connecting ? "Connecting..." : "Connect"}
          </button>
        )}
        {wallet && ( // Se uma carteira estiver conectada, exibe as opções para trocar de cadeia ou desconectar
          <div>
            <label className={styles.label}>Switch Chain</label>
            {settingChain ? (
              <span>Switching chain...</span>
            ) : (
              <select
                onChange={({ target: { value } }) => {
                  if (config[value] !== undefined) {
                    setChain({ chainId: value });
                  } else {
                    alert("No deploy on this chain");
                  }
                }}
                value={connectedChain?.id}
                className={styles.select}
              >
                {chains.map(({ id, label }) => {
                  return (
                    <option key={id} value={id}>
                      {label}
                    </option>
                  );
                })}
              </select>
            )}
            <button
              onClick={() => disconnect(wallet)}
              className={styles.button}
            >
              Disconnect Wallet
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
