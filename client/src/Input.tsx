import React, { useState } from "react";
import { ethers } from "ethers";
import { useRollups } from "./useRollups";
import { useWallets } from "@web3-onboard/react";
import styles from "./styles/Input.module.css";

// Propriedade que representa o endereço da DApp
interface IInputPropos {
    dappAddress: string;
}

// Função para adicionar entrada (input) ao contrato
export const Input: React.FC<IInputPropos> = (propos) => {
    const rollups = useRollups(propos.dappAddress);
    const [connectedWallet] = useWallets();
    const provider = new ethers.providers.Web3Provider(
        connectedWallet.provider
    );

    const [fileContent, setFileContent] = useState<string | null>(null);
    const [Flag_revoke, setFlagRevoke] = useState<number>(0);
    const [publicKeyContent, setPublicKeyContent] = useState<string | null>(null);
    const [messageContent, setMessageContent] = useState<string | null>(null);
    const [signedMessageContent, setSignedMessageContent] = useState<string | null>(null);

    // Função para adicionar entrada (input)
    const addInput = async (str: string) => {
        if (rollups) {
            try {
                let payload = ethers.utils.toUtf8Bytes(str); // Converte a string para bytes UTF-8.
                const result = await rollups.inputContract.addInput(propos.dappAddress, payload); // Envia a entrada para o contrato
                console.log("Result input", result);
            } catch (e) {
                console.log(`${e}`);
            }
        }
    };

    // Manipulador de upload de arquivos que lê o conteúdo do arquivo e o armazena no estado correspondente
    const handleFileUpload = async (
        e: React.ChangeEvent<HTMLInputElement>,
        setContent: React.Dispatch<React.SetStateAction<string | null>>
    ) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader(); // Cria um FileReader para ler o conteúdo do arquivo
            reader.onload = (e) => {
                const content = (e.target as FileReader).result as string; // Armazena o conteúdo
                console.log("Arquivo carregado:", content);
                setContent(content);
            };
            reader.readAsText(file); // Lê o arquivo como texto
        }
    };

    // Manipulador para enviar os dados coletados
    const handleSend = async () => {
        if (fileContent) {
            const data = {
                fl_revoke: Flag_revoke,
                cert: fileContent,
                public_key: Flag_revoke === 1 ? publicKeyContent : null,
                message: Flag_revoke === 1 ? messageContent == null ? null : messageContent.replace("\n", "") : null,
                signed_message: Flag_revoke === 1 ? signedMessageContent : null,
            };

            console.log("Data:", JSON.stringify(data));

            const result = await addInput(JSON.stringify(data).replace(/\n/g, "$"));
            console.log("Result from addInput:", result);
        } else {
            console.log("Nenhum conteúdo de arquivo para enviar");
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.section}>
                <h3>Send Input</h3>

                <label className={styles.checkboxLabel}>
                    <input
                        type="checkbox"
                        checked={Flag_revoke === 1}
                        onChange={(e) => setFlagRevoke(e.target.checked ? 1 : 0)}
                        className={styles.checkbox}
                    />
                    Revoke
                </label>

                {Flag_revoke === 1 ? (
                    <>
                        <label className={styles.fileLabel}>Upload Public Key:</label>
                        <input
                            type="file"
                            accept=".pem"
                            onChange={(e) => handleFileUpload(e, setPublicKeyContent)}
                            className={styles.fileInput}
                        />
                        <label className={styles.fileLabel}>Upload Message:</label>
                        <input
                            type="file"
                            accept=".txt,.pem"
                            onChange={(e) => handleFileUpload(e, setMessageContent)}
                            className={styles.fileInput}
                        />
                        <label className={styles.fileLabel}>Upload Signed Message:</label>
                        <input
                            type="file"
                            accept=".txt,.pem,.b64"
                            onChange={(e) => handleFileUpload(e, setSignedMessageContent)}
                            className={styles.fileInput}
                        />
                    </>
                ) : (
                    <>
                        <label className={styles.fileLabel}>Upload Certificate:</label>
                        <input
                            type="file"
                            accept=".pem"
                            onChange={(e) => handleFileUpload(e, setFileContent)}
                            className={styles.fileInput}
                        />
                    </>
                )}

                <button onClick={handleSend} disabled={!rollups} className={styles.button}>
                    Send
                </button>
            </div>
        </div>
    );
};
