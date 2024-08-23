import React, { useState } from "react";
import { useSetChain } from "@web3-onboard/react";
import { ethers } from "ethers";
import configFile from "./config.json";

const config: any = configFile;

export const Inspect: React.FC = () => {
    const [{ connectedChain }] = useSetChain();
    const [inspectData, setInspectData] = useState<string | null>(null);
    const [reports, setReports] = useState<string[]>([]);
    const [metadata, setMetadata] = useState<any>({});
    const [showReport, setShowReport] = useState<boolean>(false);
    const [showError, setShowError] = useState<boolean>(false);

    const inspectCall = async (str: string) => {
        if (!str.trim()) {
            setShowError(true);
            setShowReport(false);
            return;
        }

        let payload = str;
        if (!connectedChain) {
            return;
        }

        let apiURL = "";

        if (config[connectedChain.id]?.inspectAPIURL) {
            apiURL = `${config[connectedChain.id].inspectAPIURL}/inspect`;
        } else {
            console.error(`No inspect interface defined for chain ${connectedChain.id}`);
            return;
        }

        try {
            
            const fetchData = await fetch(`${apiURL}/${payload}`);
            const data = await fetchData.json();

            setReports(data.reports);
            setMetadata({
                metadata: data.metadata,
                status: data.status,
                exception_payload: data.exception_payload
            });

            setShowReport(true);
            setShowError(false);
        } catch (error) {
            console.error("Error fetching reports:", error);
            setShowReport(false);
            
            
            alert("oi") // DEBUG
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
                const modfiedContent = content.replace(/\n/g, "$").replace(" ", "~").replace("/", "!")
                console.log("Arquivo carregado:", modfiedContent);
                setContent(modfiedContent);
            };
            reader.readAsText(file);
        }
    };

    const handleButtonClick = () => {
        if (inspectData) {
            inspectCall(inspectData);
        } else {
            setShowError(true);
        }
    };

    return (
        <div className="inspect-container">
            <div className="inspect-input-group">
                <input
                    className="inspect-input"
                    type="file"
                    accept=".pem"
                    onChange={(e) => handleFileUpload(e, setInspectData)}
                />
                <button
                    className="inspect-button"
                    onClick={handleButtonClick}
                >
                    Enviar
                </button>
            </div>

            {showError && (
                <div className="error-message">
                    Por favor, insira a chave pública.
                </div>
            )}

            {showReport && !showError && (
                <div className="inspect-reports">
                    <h3>Reports</h3>
                    <table className="inspect-table">
                        <tbody>
                            {reports?.length === 0 && (
                                <tr>
                                    <td colSpan={4}>Nenhum relatório disponível</td>
                                </tr>
                            )}
                            {reports?.map((n: any) => (
                                <tr key={`${n.payload}`}>
                                    <td>{ethers.utils.toUtf8String(n.payload)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
