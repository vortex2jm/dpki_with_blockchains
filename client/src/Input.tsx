import React, { useState } from "react";
import { ethers } from "ethers";
import { useRollups } from "./useRollups";
import { useWallets } from "@web3-onboard/react";
import "./style.css"; 

interface IInputPropos {
    dappAddress: string;
}

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

    const addInput = async (str: string) => {
        if (rollups) {
            try {
                let payload = ethers.utils.toUtf8Bytes(str);
                await rollups.inputContract.addInput(propos.dappAddress, payload);
            } catch (e) {
                console.log(`${e}`);
            }
        }
    };

    const handleFileUpload = async (
        e: React.ChangeEvent<HTMLInputElement>,
        setContent: React.Dispatch<React.SetStateAction<string | null>>
    ) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = (e.target as FileReader).result as string;
                console.log("Arquivo carregado:", content);
                setContent(content);
            };
            reader.readAsText(file);
        }
    };

    const handleSend = async () => {
        if (fileContent) {
            const data = {
                fl_revoke: Flag_revoke,
                cert: fileContent,
                public_key: Flag_revoke === 1 ? publicKeyContent : null,
                message: Flag_revoke === 1 ? messageContent : null,
                signed_message: Flag_revoke === 1 ? signedMessageContent : null,
            };
            console.log("Data:",JSON.stringify(data));
            await addInput(JSON.stringify(data).replace(/\n/g, "$"));
        } else {
            console.log("Nenhum conteúdo de arquivo para enviar");
        }
    };

    return (
        <div className="container">
            <div className="section">
                <h3>Send Input</h3>

                <label className="checkboxLabel">
                    <input
                        type="checkbox"
                        checked={Flag_revoke === 1}
                        onChange={(e) => setFlagRevoke(e.target.checked ? 1 : 0)}
                        className="checkbox"
                    />
                    Revoke
                </label>

                {Flag_revoke === 1 ? (
                    <>
                        <input
                            type="file"
                            accept=".pem"
                            onChange={(e) => handleFileUpload(e, setPublicKeyContent)}
                            className="fileInput"
                            placeholder="Public Key"
                        />
                        <input
                            type="file"
                            accept=".txt,.pem"
                            onChange={(e) => handleFileUpload(e, setMessageContent)}
                            className="fileInput"
                            placeholder="Message"
                        />
                        <input
                            type="file"
                            accept=".txt,.pem"
                            onChange={(e) => handleFileUpload(e, setSignedMessageContent)}
                            className="fileInput"
                            placeholder="Signed Message"
                        />
                    </>
                ) : (
                    <input
                        type="file"
                        accept=".pem"
                        onChange={(e) => handleFileUpload(e, setFileContent)}
                        className="fileInput"
                    />
                )}

                <button onClick={handleSend} disabled={!rollups} className="button">
                    Send
                </button>
            </div>
        </div>
    );
};
